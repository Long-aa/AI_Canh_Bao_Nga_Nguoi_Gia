from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.controllers.alert_controller import router as alert_router
from app.controllers.device_controller import router as device_router
from app.controllers.profile_controller import router as profile_router
from app.controllers.stats_controller import router as stats_router
from app.controllers.mobile_controller import router as mobile_router
from app.websockets.connection_manager import ConnectionManager
from app.models.database import create_tables, get_db, Alert, Device
from app.ai.pose_extractor import PoseExtractor
from app.ai.action_recognizer import ActionRecognizer
from app.ai.face_recognizer import FaceRecognizerAI
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import cv2
import base64
import numpy as np
from datetime import datetime
import json
import time
import subprocess
import asyncio
from collections import deque
from app.utils.cloud_storage import cloud_storage

# Auto-cleanup port 8001
def kill_port_process(port):
    try:
        if os.name == 'nt': # Windows
            result = subprocess.check_output(f"netstat -ano | findstr :{port}", shell=True).decode()
            for line in result.strip().split('\n'):
                if "LISTENING" in line:
                    pid = line.strip().split()[-1]
                    if int(pid) != os.getpid():
                        subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True)
        else: # Linux/Mac
            # Use lsof or fuser
            try:
                result = subprocess.check_output(f"lsof -ti:{port}", shell=True).decode().strip()
                if result:
                    for pid in result.split('\n'):
                        os.kill(int(pid), 9)
            except:
                subprocess.run(f"fuser -k {port}/tcp", shell=True, capture_output=True)
    except: pass

kill_port_process(8001)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        create_tables()
        print("Database tables created/verified.")
    except Exception as e:
        print(f"Error creating tables: {e}")
    yield

app = FastAPI(title="Elderly Fall Detection Backend", version="1.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

manager = ConnectionManager()

# Include routers
app.include_router(alert_router, prefix="/api", tags=["alerts"])
app.include_router(device_router, prefix="/api", tags=["devices"])
app.include_router(profile_router, prefix="/api", tags=["profiles"])
app.include_router(stats_router, prefix="/api", tags=["stats"])
app.include_router(mobile_router, prefix="/api/mobile", tags=["mobile"])

active_processors = {}
active_streams = {}

@app.websocket("/ws/stream/{device_id}")
async def stream_endpoint(websocket: WebSocket, device_id: str):
    await websocket.accept()
    if device_id not in active_streams:
        active_streams[device_id] = set()
    
    # Initialize AI processors for this device if not exists
    if device_id not in active_processors:
        active_processors[device_id] = {
            "pose": PoseExtractor(),
            "action": ActionRecognizer(),
            "face": FaceRecognizerAI(),
            "last_alert_times": {}, # Tracking alerts per person ID
            "frame_buffer": deque(maxlen=100) # Buffer for ~5-10 seconds of video
        }
    
    processor = active_processors[device_id]
    is_processing = False
    
    try:
        async def process_ai_task(frame_data):
            nonlocal is_processing
            try:
                # 1. Decode frame
                header, encoded = frame_data.split(",", 1)
                nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if frame is not None:
                    # Store in buffer for recording
                    processor["frame_buffer"].append(frame.copy())
                    
                    # 2. Face Recognition (Identify people)
                    frame = processor["face"].process_frame(frame)

                    # 3. Pose & Fall Detection (Multi-person)
                    all_landmarks, all_pose_objs = processor["pose"].extract_pose(frame)
                    
                    if all_landmarks:
                        # Draw skeleton
                        frame = processor["pose"].draw_pose(frame, all_pose_objs)
                        
                        # Process all detected poses for falling
                        results = processor["action"].process_multi_pose(all_landmarks)
                        
                        for res in results:
                            pid = res["id"]
                            prediction = res["prediction"]
                            confidence = res["confidence"]
                            
                            if prediction == "fall" and confidence > 0.6:
                                last_alert_time = processor["last_alert_times"].get(pid, 0)
                                if time.time() - last_alert_time > 10:
                                    processor["last_alert_times"][pid] = time.time()
                                    try:
                                        with next(get_db()) as db:
                                            dev = db.query(Device).filter(Device.device_id == device_id).first()
                                            new_alert = Alert(
                                                camera_id=device_id, 
                                                location=dev.location if dev else "Unknown", 
                                                alert_type="fall_detected", 
                                                prediction="fall", 
                                                confidence=confidence, 
                                                timestamp=datetime.utcnow()
                                            )
                                            db.add(new_alert)
                                            db.commit()
                                            
                                            # Trigger background video recording and upload
                                            asyncio.create_task(handle_video_upload(device_id, list(processor["frame_buffer"]), new_alert.id))

                                            # Broadcast to UI
                                            await manager.broadcast({"type": "fall_alert", "data": {"id": new_alert.id, "confidence": confidence}})
                                            
                                            alert_msg = json.dumps({
                                                "type": "alert", 
                                                "level": "warning", 
                                                "message": f"🚨 CẢNH BÁO: Phát hiện người Ngã! ({int(confidence*100)}%)"
                                            })
                                            for client in list(active_streams.get(device_id, [])):
                                                try: await client.send_text(alert_msg)
                                                except: pass
                                    except Exception as e:
                                        print(f"Error saving alert: {e}")

                    # 4. Send frame back to Frontend
                    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 40])
                    b64_img = base64.b64encode(buffer).decode()
                    
                    # Must use 'data' key and add prefix for frontend <img> tag
                    frame_msg = json.dumps({
                        "type": "frame", 
                        "data": f"data:image/jpeg;base64,{b64_img}"
                    })
                    
                    if device_id in active_streams:
                        for client in list(active_streams[device_id]):
                            try: await client.send_text(frame_msg)
                            except: active_streams[device_id].remove(client)
                            
            except Exception as e:
                print(f"Error in AI task: {e}")
            finally:
                is_processing = False

        while True:
            data = await websocket.receive_text()
            if not is_processing:
                is_processing = True
                asyncio.create_task(process_ai_task(data))

    except WebSocketDisconnect:
        pass
    finally:
        if device_id in active_streams and websocket in active_streams[device_id]:
            active_streams[device_id].remove(websocket)

@app.websocket("/ws/view/{device_id}")
async def view_endpoint(websocket: WebSocket, device_id: str):
    await websocket.accept()
    if device_id not in active_streams:
        active_streams[device_id] = set()
    active_streams[device_id].add(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if device_id in active_streams:
            active_streams[device_id].remove(websocket)

@app.websocket("/ws")
async def websocket_general(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def handle_video_upload(device_id, frames, alert_id):
    """Saves frames to video, uploads to B2, and updates alert record"""
    if not frames:
        return
        
    try:
        video_filename = f"fall_{device_id}_{int(time.time())}.mp4"
        video_path = os.path.join("uploads", video_filename)
        
        # Define codec and create VideoWriter
        height, width, _ = frames[0].shape
        fourcc = cv2.VideoWriter_fourcc(*'mp4v') # or 'avc1'
        out = cv2.VideoWriter(video_path, fourcc, 10.0, (width, height))
        
        for f in frames:
            out.write(f)
        out.release()
        
        # Upload to B2
        remote_name = f"alerts/{video_filename}"
        video_url = cloud_storage.upload_file(video_path, remote_name)
        
        if video_url:
            # Update database with URL
            from app.models.database import get_db, Alert
            with next(get_db()) as db:
                alert = db.query(Alert).filter(Alert.id == alert_id).first()
                if alert:
                    alert.video_url = video_url
                    db.commit()
                    print(f"Video uploaded and alert updated: {video_url}")
                    
    except Exception as e:
        print(f"Error handling video upload: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
