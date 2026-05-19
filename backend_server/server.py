from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, Request
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

app = FastAPI(title="Elderly Fall Detection Backend", version="1.1.1", lifespan=lifespan)

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

@app.post("/api/zalo/webhook")
async def zalo_webhook(request: Request, db=Depends(get_db)):
    try:
        body = await request.json()
        print(f"[ZaloWebhook] Received event: {body}")
        if body.get("ok") and "result" in body:
            result = body["result"]
            event_name = result.get("event_name")
            if event_name == "message.text.received":
                msg = result.get("message", {})
                chat = msg.get("chat", {})
                chat_id = chat.get("id")
                text = msg.get("text", "").strip()
                sender = msg.get("from", {})
                display_name = sender.get("display_name", "User")
                if chat_id:
                    from app.models.database import ZaloSubscriber
                    sub = db.query(ZaloSubscriber).filter(ZaloSubscriber.chat_id == chat_id).first()
                    if not sub:
                        sub = ZaloSubscriber(chat_id=chat_id, display_name=display_name, is_active=True)
                        db.add(sub)
                        db.commit()
                        print(f"[ZaloWebhook] Registered new subscriber: {display_name} ({chat_id})")
                    normalized_text = text.lower()
                    ack_keywords = ["đã biết thông tin", "da biet thong tin", "đã biết", "da biet", "ok", "stop", "dừng"]
                    is_ack = False
                    for kw in ack_keywords:
                        if kw in normalized_text:
                            is_ack = True
                            break
                    if is_ack:
                        from app.utils.zalo_alert_manager import stop_active_alerts, send_zalo_message
                        stop_active_alerts(chat_id)
                        send_zalo_message(chat_id, "✅ Đã nhận phản hồi. Cảnh báo ngã đã được tạm ngừng.")
                    else:
                        from app.utils.zalo_alert_manager import send_zalo_message
                        send_zalo_message(chat_id, f"Chào {display_name}, bạn đã kết nối thành công với SafeGuard AI Bot! Gửi 'Đã biết thông tin' khi nhận cảnh báo để dừng còi báo động.")
    except Exception as e:
        print(f"[ZaloWebhook] Error processing webhook: {e}")
    return {"status": "ok"}


active_processors = {}
active_streams = {}
# Track running external camera capture tasks: {device_id: asyncio.Task}
external_camera_tasks = {}

# ────────────────────────────────────────────────────────────────────────────
# Helper: Run AI pipeline on a decoded frame and broadcast to viewers
# ────────────────────────────────────────────────────────────────────────────
async def _ai_pipeline_and_broadcast(device_id: str, frame: np.ndarray, processor: dict):
    """Run face + pose + fall AI on `frame`, encode as JPEG and push to all viewers."""
    try:
        # 1. Face Recognition
        try:
            frame = processor["face"].process_frame(frame)
        except Exception as fe:
            print(f"[{device_id}] Face error: {fe}")

        # 2. Pose & Fall Detection
        try:
            clean_frame_pose = frame.copy()
            all_landmarks, all_pose_objs = processor["pose"].extract_pose(clean_frame_pose)
            if all_landmarks:
                frame = processor["pose"].draw_pose(frame, all_pose_objs)
                results = processor["action"].process_multi_pose(all_landmarks)
                for res in results:
                    pid = res["id"]
                    prediction = res["prediction"]
                    confidence = res["confidence"]
                    
                    from app.utils.zalo_alert_manager import update_stream_state
                    update_stream_state(device_id, prediction)
                    
                    if "head_coord" in res:
                        hx, hy = int(res["head_coord"][0] * frame.shape[1]), int(res["head_coord"][1] * frame.shape[0])
                        color = (0, 0, 255) if prediction in ["fall", "fall_stairs"] else ((0, 255, 0) if prediction == "sitting" else ((255, 0, 0) if prediction == "sleeping" else (240, 240, 240)))
                        
                        label_map = {
                            "fall": "TE NGA",
                            "fall_stairs": "VAP BAC THANG",
                            "sitting": "NGOI GHE",
                            "sleeping": "DI NGU",
                            "normal": "NORMAL"
                        }
                        display_label = label_map.get(prediction, prediction.upper())
                        label = f"{display_label} ({int(confidence*100)}%)" if prediction != "normal" else "NORMAL"
                        cv2.putText(frame, label, (hx - 30, hy - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

                    if prediction in ["fall", "fall_stairs"] and confidence > 0.6:
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
                                        prediction=prediction,
                                        confidence=confidence,
                                        timestamp=datetime.utcnow()
                                    )
                                    db.add(new_alert)
                                    db.commit()
                                    asyncio.create_task(handle_video_upload(device_id, list(processor["frame_buffer"]), new_alert.id))
                                    from app.utils.zalo_alert_manager import trigger_fall_monitoring
                                    trigger_fall_monitoring(new_alert.id, device_id, new_alert.location)
                                    await manager.broadcast({"type": "fall_alert", "data": {"id": new_alert.id, "confidence": confidence}})
                                    fall_text = "vấp ngã bậc thang" if prediction == "fall_stairs" else "người Ngã"
                                    alert_msg = json.dumps({
                                        "type": "alert", "level": "warning",
                                        "message": f"🚨 CẢNH BÁO: Phát hiện {fall_text}! ({int(confidence*100)}%)"
                                    })
                                    for client in list(active_streams.get(device_id, [])):
                                        try: await client.send_text(alert_msg)
                                        except: pass
                            except Exception as dbe:
                                print(f"[{device_id}] DB error: {dbe}")
        except Exception as pe:
            print(f"[{device_id}] Pose error: {pe}")

        # 3. Encode & broadcast to all viewers
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 50])
        b64_img = base64.b64encode(buffer).decode()
        frame_msg = json.dumps({"type": "frame", "data": f"data:image/jpeg;base64,{b64_img}"})
        clients = list(active_streams.get(device_id, []))
        for client in clients:
            try:
                await client.send_text(frame_msg)
            except:
                active_streams[device_id].discard(client)
    except Exception as e:
        print(f"[{device_id}] Pipeline error: {e}")


async def _run_external_camera(device_id: str, stream_url: str):
    """Async task: open an external camera (RTSP/HTTP/USB index), run AI pipeline
    and broadcast processed frames to all WebSocket viewers continuously."""
    print(f"[{device_id}] Opening external camera: {stream_url}")

    # Initialise processor if not already present
    if device_id not in active_processors:
        active_processors[device_id] = {
            "pose": PoseExtractor(),
            "action": ActionRecognizer(),
            "face": FaceRecognizerAI(),
            "last_alert_times": {},
            "frame_buffer": deque(maxlen=150)
        }
    if device_id not in active_streams:
        active_streams[device_id] = set()

    processor = active_processors[device_id]

    # Resolve numeric USB index
    try:
        cam_source = int(stream_url)
    except (ValueError, TypeError):
        cam_source = stream_url

    loop = asyncio.get_event_loop()
    cap = await loop.run_in_executor(None, lambda: cv2.VideoCapture(cam_source))

    if not cap.isOpened():
        print(f"[{device_id}] ERROR: Cannot open camera source: {cam_source}")
        # Notify viewers
        err_msg = json.dumps({"type": "error", "message": f"Không thể kết nối camera: {stream_url}"})
        for client in list(active_streams.get(device_id, [])):
            try: await client.send_text(err_msg)
            except: pass
        return

    # Update device status in DB
    try:
        with next(get_db()) as db:
            dev = db.query(Device).filter(Device.device_id == device_id).first()
            if dev:
                dev.status = "online"
                dev.last_heartbeat = datetime.utcnow()
                db.commit()
    except Exception as e:
        print(f"[{device_id}] DB status update error: {e}")

    frame_interval = 1.0 / 15  # ~15 FPS cap
    last_frame_time = 0.0
    is_processing = False

    try:
        while device_id in external_camera_tasks:
            now = time.time()
            if now - last_frame_time < frame_interval:
                await asyncio.sleep(0.01)
                continue

            ret, frame = await loop.run_in_executor(None, cap.read)
            if not ret:
                print(f"[{device_id}] Camera read failed, retrying...")
                await asyncio.sleep(1.0)
                continue

            last_frame_time = now
            processor["frame_buffer"].append(frame.copy())

            if not is_processing:
                is_processing = True
                async def _run():
                    nonlocal is_processing
                    try:
                        await _ai_pipeline_and_broadcast(device_id, frame, processor)
                    finally:
                        is_processing = False
                asyncio.create_task(_run())
    except asyncio.CancelledError:
        print(f"[{device_id}] External camera task cancelled.")
    finally:
        cap.release()
        # Update device status to offline
        try:
            with next(get_db()) as db:
                dev = db.query(Device).filter(Device.device_id == device_id).first()
                if dev:
                    dev.status = "offline"
                    db.commit()
        except Exception:
            pass
        print(f"[{device_id}] External camera released.")


# ─── REST endpoints to control external camera streaming ─────────────────────
@app.post("/api/camera/{device_id}/start")
async def start_camera_stream(device_id: str):
    """Start streaming from an external camera registered for this device."""
    if device_id in external_camera_tasks:
        return {"status": "already_running", "device_id": device_id}

    with next(get_db()) as db:
        dev = db.query(Device).filter(Device.device_id == device_id).first()
        if not dev:
            raise HTTPException(status_code=404, detail="Device not found")
        stream_url = dev.stream_url
        camera_type = dev.camera_type or "ip_camera"

    if camera_type == "webcam":
        # Webcam: frontend handles capture, use index 0 as fallback
        stream_url = stream_url or "0"
    elif not stream_url:
        raise HTTPException(status_code=400, detail="stream_url not configured for this device")

    task = asyncio.create_task(_run_external_camera(device_id, stream_url))
    external_camera_tasks[device_id] = task
    return {"status": "started", "device_id": device_id, "stream_url": stream_url}


@app.post("/api/camera/{device_id}/stop")
async def stop_camera_stream(device_id: str):
    """Stop an active external camera stream."""
    if device_id not in external_camera_tasks:
        return {"status": "not_running", "device_id": device_id}

    task = external_camera_tasks.pop(device_id)
    task.cancel()
    return {"status": "stopped", "device_id": device_id}


@app.get("/api/camera/{device_id}/status")
async def get_camera_status(device_id: str):
    """Check if external camera stream is running."""
    is_running = device_id in external_camera_tasks
    viewers = len(active_streams.get(device_id, set()))
    return {"device_id": device_id, "is_running": is_running, "viewer_count": viewers}


@app.websocket("/ws/stream/{device_id}")
async def stream_endpoint(websocket: WebSocket, device_id: str):
    await websocket.accept()
    if device_id not in active_streams:
        active_streams[device_id] = set()
    
    if device_id not in active_processors:
        active_processors[device_id] = {
            "pose": PoseExtractor(),
            "action": ActionRecognizer(),
            "face": FaceRecognizerAI(),
            "last_alert_times": {},
            "frame_buffer": deque(maxlen=150)
        }
    
    processor = active_processors[device_id]
    is_processing = False
    
    try:
        async def process_ai_task(frame_data):
            nonlocal is_processing
            try:
                # 1. Decode frame
                if "," in frame_data:
                    header, encoded = frame_data.split(",", 1)
                else:
                    encoded = frame_data
                
                nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if frame is not None:
                    # Buffer clean frame for video recording
                    processor["frame_buffer"].append(frame.copy())
                    clean_frame = frame.copy() # Use this for AI detection to avoid seeing drawings
                    
                    # 2. Face Recognition (Detect on clean_frame, update frame with boxes)
                    try:
                        frame = processor["face"].process_frame(frame) # Internal logic uses its own resize
                        if processor["face"].current_face_names:
                            print(f"DEBUG: Faces detected: {processor['face'].current_face_names}")
                    except Exception as fe:
                        print(f"Face Rec error: {fe}")

                    # 3. Pose & Fall Detection (Detect on clean_frame, draw on frame)
                    try:
                        all_landmarks, all_pose_objs = processor["pose"].extract_pose(clean_frame)
                        
                        if all_landmarks:
                            print(f"DEBUG: Pose detected for {len(all_landmarks)} person(s)")
                            # Draw skeleton on top of face boxes
                            frame = processor["pose"].draw_pose(frame, all_pose_objs)
                            
                            # Process all detected poses for falling
                            results = processor["action"].process_multi_pose(all_landmarks)
                            
                            for res in results:
                                pid = res["id"]
                                prediction = res["prediction"]
                                confidence = res["confidence"]
                                
                                from app.utils.zalo_alert_manager import update_stream_state
                                update_stream_state(device_id, prediction)
                                
                                if "head_coord" in res:
                                    hx, hy = int(res["head_coord"][0] * frame.shape[1]), int(res["head_coord"][1] * frame.shape[0])
                                    color = (0, 0, 255) if prediction in ["fall", "fall_stairs"] else ((0, 255, 0) if prediction == "sitting" else ((255, 0, 0) if prediction == "sleeping" else (240, 240, 240)))
                                    
                                    label_map = {
                                        "fall": "TE NGA",
                                        "fall_stairs": "VAP BAC THANG",
                                        "sitting": "NGOI GHE",
                                        "sleeping": "DI NGU",
                                        "normal": "NORMAL"
                                    }
                                    display_label = label_map.get(prediction, prediction.upper())
                                    label = f"{display_label} ({int(confidence*100)}%)" if prediction != "normal" else "NORMAL"
                                    cv2.putText(frame, label, (hx - 30, hy - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

                                if prediction in ["fall", "fall_stairs"] and confidence > 0.6:
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
                                                    prediction=prediction, 
                                                    confidence=confidence, 
                                                    timestamp=datetime.utcnow()
                                                )
                                                db.add(new_alert)
                                                db.commit()
                                                
                                                asyncio.create_task(handle_video_upload(device_id, list(processor["frame_buffer"]), new_alert.id))
                                                from app.utils.zalo_alert_manager import trigger_fall_monitoring
                                                trigger_fall_monitoring(new_alert.id, device_id, new_alert.location)
                                                await manager.broadcast({"type": "fall_alert", "data": {"id": new_alert.id, "confidence": confidence}})
                                                
                                                fall_text = "vấp ngã bậc thang" if prediction == "fall_stairs" else "người Ngã"
                                                alert_msg = json.dumps({
                                                    "type": "alert", "level": "warning", 
                                                    "message": f"🚨 CẢNH BÁO: Phát hiện {fall_text}! ({int(confidence*100)}%)"
                                                })
                                                for client in list(active_streams.get(device_id, [])):
                                                    try: await client.send_text(alert_msg)
                                                    except: pass
                                        except Exception as dbe:
                                            print(f"DB error: {dbe}")
                    except Exception as pe:
                        print(f"Pose error: {pe}")

                    # 4. Encode and Send back
                    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 45])
                    b64_img = base64.b64encode(buffer).decode()
                    
                    frame_msg = json.dumps({
                        "type": "frame", 
                        "data": f"data:image/jpeg;base64,{b64_img}"
                    })
                    
                    if device_id in active_streams:
                        clients = list(active_streams[device_id])
                        if clients:
                            print(f"DEBUG: Broadcasting frame to {len(clients)} clients")
                            for client in clients:
                                try:
                                    await client.send_text(frame_msg)
                                except:
                                    if client in active_streams[device_id]:
                                        active_streams[device_id].remove(client)
                            
            except Exception as e:
                print(f"CRITICAL: Error in AI task: {e}")
            finally:
                is_processing = False

        while True:
            data = await websocket.receive_text()
            if not is_processing:
                is_processing = True
                asyncio.create_task(process_ai_task(data))
            else:
                pass # Skip frame to keep up with real-time

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
    if not frames: return
    try:
        video_filename = f"fall_{device_id}_{int(time.time())}.mp4"
        video_path = os.path.join("uploads", video_filename)
        height, width, _ = frames[0].shape
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(video_path, fourcc, 10.0, (width, height))
        for f in frames: out.write(f)
        out.release()
        
        remote_name = f"alerts/{video_filename}"
        video_url = cloud_storage.upload_file(video_path, remote_name)
        if video_url:
            from app.models.database import get_db, Alert
            with next(get_db()) as db:
                alert = db.query(Alert).filter(Alert.id == alert_id).first()
                if alert:
                    alert.video_url = video_url
                    db.commit()
                    print(f"Supabase: Video uploaded: {video_url}")
    except Exception as e:
        print(f"Supabase Error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
