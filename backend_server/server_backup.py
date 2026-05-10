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

# Auto-cleanup port 8001 on Windows
def kill_port_process(port):
    try:
        result = subprocess.check_output(f"netstat -ano | findstr :{port}", shell=True).decode()
        for line in result.strip().split('\n'):
            if "LISTENING" in line:
                pid = line.strip().split()[-1]
                if int(pid) != os.getpid():
                    print(f"Cleaning up existing process on port {port} (PID: {pid})...")
                    subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True)
    except:
        pass

kill_port_process(8001)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    try:
        create_tables()
        print("Database tables created/verified.")
    except Exception as e:
        print(f"Error creating tables: {e}")
    yield
    # Shutdown logic (if any)

app = FastAPI(title="Elderly Fall Detection Backend", version="1.0.0", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# WebSocket connection manager
manager = ConnectionManager()

# Include routers
app.include_router(alert_router, prefix="/api", tags=["alerts"])
app.include_router(device_router, prefix="/api", tags=["devices"])
app.include_router(profile_router, prefix="/api", tags=["profiles"])
app.include_router(stats_router, prefix="/api", tags=["stats"])
app.include_router(mobile_router, prefix="/api/mobile", tags=["mobile"])

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming WebSocket messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    return {"message": "Elderly Fall Detection Backend API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Store active processors (AI instances per device)
active_processors = {}
active_streams = {}

@app.websocket("/ws/stream/{device_id}")
async def stream_endpoint(websocket: WebSocket, device_id: str):
    await websocket.accept()
    if device_id not in active_streams:
        active_streams[device_id] = set()
    
    # Initialize AI processor for this device if not exists
    if device_id not in active_processors:
        active_processors[device_id] = {
            "pose": PoseExtractor(),
            "action": ActionRecognizer()
        }
    
    processor = active_processors[device_id]
    
    # Flag to prevent processing congestion
    is_processing = False
    
    try:
        async def process_ai_task(frame_data):
            nonlocal is_processing
            try:
                # 1. Decode
                header, encoded = frame_data.split(",", 1)
                nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if frame is not None:
                    # 2. AI Processing
                    landmarks, pose_landmarks_obj = processor["pose"].extract_pose(frame)
                    if landmarks is not None:
                        processor["action"].add_frame(landmarks)
                        prediction, confidence = processor["action"].predict_action()
                        frame = processor["pose"].draw_pose(frame, pose_landmarks_obj)
                        
                        # Fall detection alert logic
                        if prediction == "fall" and confidence > 0.6:
                            last_alert_time = processor.get("last_alert_time", 0)
                            if time.time() - last_alert_time > 10:
                                processor["last_alert_time"] = time.time()
                                try:
                                    with next(get_db()) as db:
                                        dev = db.query(Device).filter(Device.device_id == device_id).first()
                                        new_alert = Alert(camera_id=device_id, location=dev.location if dev else "Unknown", alert_type="fall_detected", prediction="fall", confidence=confidence, timestamp=datetime.utcnow())
                                        db.add(new_alert)
                                        db.commit()
                                        await manager.broadcast({"type": "fall_alert", "data": {"id": new_alert.id, "confidence": confidence}})
                                except: pass

                    # 3. ALWAYS Re-encode and Broadcast (even if landmarks is None)
                    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 40])
                    annotated_data = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode()}"
                    
                    if device_id in active_streams:
                        for client in list(active_streams[device_id]):
                            try: await client.send_text(annotated_data)
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
            # No else broadcast to avoid flickering/missing AI

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
            await websocket.receive_text() # Keep alive
    except WebSocketDisconnect:
        active_streams[device_id].remove(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
