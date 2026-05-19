import cv2
import os
import time
import subprocess
import asyncio
from datetime import datetime
from app.models.database import get_db, Device, Alert
from app.ai.pose_extractor import PoseExtractor
from app.ai.action_recognizer import ActionRecognizer
from app.ai.face_recognizer import FaceRecognizerAI

# Global lazy-loaded instances for AI models (Singletons) to prevent RAM overload and C++ Segfaults
_pose_extractor = None
_action_recognizer = None
_face_recognizer = None

def get_pose_extractor():
    global _pose_extractor
    if _pose_extractor is None:
        _pose_extractor = PoseExtractor()
    return _pose_extractor

def get_action_recognizer():
    global _action_recognizer
    if _action_recognizer is None:
        _action_recognizer = ActionRecognizer()
    return _action_recognizer

def get_face_recognizer():
    global _face_recognizer
    if _face_recognizer is None:
        _face_recognizer = FaceRecognizerAI()
    return _face_recognizer

def process_video_offline(device_id: str, input_path: str, output_path: str, loop=None):
    """
    Background task to process an uploaded video frame-by-frame using the AI pipeline.
    Draws skeletons/face labels and saves as a processed H.264 video.
    """
    def send_ws_message(message, loop):
        if loop is None:
            return
        try:
            import server
            coro = server.manager.broadcast(message)
            asyncio.run_coroutine_threadsafe(coro, loop)
        except Exception as e:
            print(f"[{device_id}] Error sending WS message: {e}")

    print(f"[{device_id}] Retrieving global AI models for offline video processing (Singleton)...")
    pose_extractor = get_pose_extractor()
    action_recognizer = get_action_recognizer()
    face_recognizer = get_face_recognizer()
    
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print(f"[{device_id}] ERROR: Cannot open uploaded video file: {input_path}")
        try:
            with next(get_db()) as db:
                dev = db.query(Device).filter(Device.device_id == device_id).first()
                if dev:
                    dev.status = "error"
                    db.commit()
        except Exception as e:
            print(f"[{device_id}] DB Update error: {e}")
        return

    # Video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Optimize speed: Process at 10 FPS maximum to vastly speed up processing of long videos
    frame_skip = max(1, int(fps / 10))
    output_fps = fps / frame_skip
    
    # Ensure temporary and final output dirs exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    temp_output_path = output_path + ".temp.mp4"
    
    # OpenCV VideoWriter setup
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(temp_output_path, fourcc, output_fps, (width, height))
    
    raw_frame_idx = 0
    frame_idx = 0
    last_alert_time = 0
    max_confidence = 0.0
    fall_detected_in_video = False
    
    manager = None
        
    print(f"[{device_id}] Starting optimized processing. Raw frames: {total_frames}, Target output FPS: {output_fps}")
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            raw_frame_idx += 1
            if raw_frame_idx % frame_skip != 0:
                continue # Skip processing and writing to massively speed up AI!
                
            frame_idx += 1
            
            # Broadcast progress update every 10%
            effective_total = total_frames // frame_skip
            if effective_total > 0 and frame_idx % max(1, effective_total // 10) == 0:
                progress = int((frame_idx / effective_total) * 100)
                print(f"[{device_id}] Progress: {progress}% ({frame_idx}/{effective_total})")
                send_ws_message({
                    "type": "device_progress",
                    "device_id": device_id,
                    "progress": progress
                }, loop)
            
            clean_frame = frame.copy()
            
            import gc
            if frame_idx % 30 == 0:
                gc.collect() # Giải phóng RAM định kỳ trong vòng lặp dài

            # 1. Face Recognition (Only process every 10 processed frames to save CPU)
            try:
                if frame_idx % 10 == 0:
                    frame = face_recognizer.process_frame(frame)
            except Exception as fe:
                pass
                
            # 2. Pose & Action (Fall) Detection
            try:
                all_landmarks, all_pose_objs = pose_extractor.extract_pose(clean_frame)
                if all_landmarks:
                    frame = pose_extractor.draw_pose(frame, all_pose_objs)
                    results = action_recognizer.process_multi_pose(all_landmarks)
                    
                    for res in results:
                        prediction = res["prediction"]
                        confidence = res["confidence"]
                        
                        if prediction == "fall" and confidence > 0.6:
                            fall_detected_in_video = True
                            if confidence > max_confidence:
                                max_confidence = confidence
                            
                            # Cooldown: create database warning alert every 5 seconds of video playtime
                            current_video_time = frame_idx / output_fps
                            if current_video_time - last_alert_time > 5:
                                last_alert_time = current_video_time
                                try:
                                    with next(get_db()) as db:
                                        dev = db.query(Device).filter(Device.device_id == device_id).first()
                                        new_alert = Alert(
                                            camera_id=device_id,
                                            location=dev.location if dev else "Unknown",
                                            alert_type="fall_detected",
                                            prediction="fall",
                                            confidence=confidence,
                                            timestamp=datetime.utcnow(),
                                            status="pending"
                                        )
                                        db.add(new_alert)
                                        db.commit()
                                        
                                        # Alerts will be fetched automatically by the frontend via polling
                                        print(f"[{device_id}] Fall alert triggered at {current_video_time:.2f}s with {confidence*100:.1f}% confidence")
                                        send_ws_message({
                                            "type": "fall_alert",
                                            "data": {
                                                "camera_id": device_id,
                                                "location": dev.location if dev else "Unknown",
                                                "confidence": confidence
                                            }
                                        }, loop)
                                except Exception as dbe:
                                    print(f"[{device_id}] DB Alert error: {dbe}")
            except Exception as pe:
                pass
                
            out.write(frame)
            
    except Exception as e:
        print(f"[{device_id}] CRITICAL: Error in video processing loop: {e}")
    finally:
        cap.release()
        out.release()
        
    print(f"[{device_id}] Frame-by-frame processing completed.")
    
    # 3. Re-encode to standard browser-playable H.264
    print(f"[{device_id}] Re-encoding video to standard H.264 container...")
    # -y to overwrite, -c:v libx264 for standard H.264, -pix_fmt yuv420p for web compatibility
    cmd = f'ffmpeg -y -i "{temp_output_path}" -c:v libx264 -pix_fmt yuv420p -an "{output_path}"'
    proc = subprocess.run(cmd, shell=True, capture_output=True)
    
    if proc.returncode != 0:
        print(f"[{device_id}] Ffmpeg H.264 re-encoding failed: {proc.stderr.decode()}")
        # Fallback: rename temp file to output path directly (it might not be playable in all browsers, but file is saved)
        if os.path.exists(temp_output_path):
            if os.path.exists(output_path):
                os.remove(output_path)
            os.rename(temp_output_path, output_path)
    else:
        # Success re-encoding, clean up temp OpenCV file
        print(f"[{device_id}] Re-encoding success. Cleaning up temp files...")
        if os.path.exists(temp_output_path):
            os.remove(temp_output_path)
            
    # Clean up raw uploaded input video to save space
    if os.path.exists(input_path):
        os.remove(input_path)
        
    # Update device status in Database
    web_path = f"/uploads/videos/processed_{device_id}.mp4"
    try:
        from app.utils.cloud_storage import cloud_storage
        remote_name = f"processed/processed_{device_id}.mp4"
        uploaded_url = cloud_storage.upload_file(output_path, remote_name)
        if uploaded_url:
            web_path = uploaded_url
            print(f"[{device_id}] Processed video successfully uploaded to Supabase: {web_path}")
    except Exception as upload_err:
        print(f"[{device_id}] Error uploading processed video to Supabase: {upload_err}")

    try:
        with next(get_db()) as db:
            dev = db.query(Device).filter(Device.device_id == device_id).first()
            if dev:
                dev.status = "online"
                dev.stream_url = web_path
                db.commit()
                print(f"[{device_id}] DB Updated: Device online. Stream URL: {web_path}")
                send_ws_message({
                    "type": "device_status",
                    "device_id": device_id,
                    "status": "online",
                    "stream_url": web_path
                }, loop)
    except Exception as dbe:
        print(f"[{device_id}] Final database update failed: {dbe}")
