import os
import asyncio
import time
import requests
from datetime import datetime
from app.models.database import SessionLocal, Alert, ZaloSubscriber

# Token configuration (provided by user)
ZALO_BOT_TOKEN = os.getenv("ZALO_BOT_TOKEN", "2937034575313077164:dCkYEXXvqdUYSMFzqFlmOAtLltIiliIIunarpnNcNMjeYgBNRVIhXEyjSYaOEtGF")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Global dict to track active stream states: device_id -> {"prediction": str, "timestamp": float}
active_stream_states = {}

# Active alert tasks to manage and cancel
active_alert_tasks = {}

def send_zalo_message(chat_id: str, text: str) -> bool:
    """Send text message to a Zalo chat_id using Bot API."""
    url = f"https://bot-api.zaloplatforms.com/bot{ZALO_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "reply_markup": {
            "keyboard": [
                [{"text": "Đã biết thông tin"}]
            ],
            "one_time_keyboard": True,
            "resize_keyboard": True
        }
    }
    try:
        response = requests.post(url, json=payload, timeout=5)
        data = response.json()
        return data.get("ok", False)
    except Exception as e:
        print(f"[ZaloAlert] Error sending Zalo message: {e}")
        return False

def broadcast_zalo_alert(text: str):
    """Broadcast alert message to all active Zalo subscribers."""
    db = SessionLocal()
    try:
        subs = db.query(ZaloSubscriber).filter(ZaloSubscriber.is_active == True).all()
        if not subs:
            print("[ZaloAlert] Warning: No Zalo subscribers registered yet.")
        for sub in subs:
            send_zalo_message(sub.chat_id, text)
    finally:
        db.close()

def stop_active_alerts(chat_id: str):
    """
    Called when user sends 'đã biết thông tin'.
    Resolves any pending alerts in the DB and stops their loops.
    """
    db = SessionLocal()
    try:
        pending_alerts = db.query(Alert).filter(Alert.status == "pending", Alert.alert_type == "fall_detected").all()
        for alert in pending_alerts:
            alert.status = "acknowledged"
            db.commit()
            print(f"[ZaloAlert] Alert {alert.id} acknowledged via Zalo.")
            
            # Broadcast to UI
            try:
                from server import manager
                asyncio.create_task(manager.broadcast({
                    "type": "alert_resolved", 
                    "data": {
                        "id": alert.id, 
                        "status": "acknowledged", 
                        "statusLabel": "Đã biết thông tin"
                    }
                }))
            except Exception as e:
                print(f"[ZaloAlert] WS broadcast error: {e}")
    finally:
        db.close()

def update_stream_state(device_id: str, prediction: str):
    """Update stream state with the most severe prediction."""
    current = active_stream_states.get(device_id, {}).get("prediction", "normal")
    severity = {
        "fall": 4,
        "fall_stairs": 4,
        "sleeping": 3,
        "sitting": 2,
        "normal": 1
    }
    current_sev = severity.get(current, 0)
    new_sev = severity.get(prediction, 0)
    
    # Update if newer state is more severe or if last state was updated > 2s ago
    last_update = active_stream_states.get(device_id, {}).get("timestamp", 0)
    if new_sev > current_sev or (time.time() - last_update > 2):
        active_stream_states[device_id] = {"prediction": prediction, "timestamp": time.time()}

async def monitor_fall_motionless(alert_id: int, camera_id: str, location: str):
    """
    Monitors if the fallen person is motionless for 30s,
    then spams Zalo every 5s,
    and calls hospital if no response after 2 minutes.
    """
    print(f"[ZaloAlert] Starting monitor for Alert {alert_id} on Cam {camera_id}...")
    
    # 1. Wait 30 seconds to check if person is motionless
    active_standing_count = 0
    
    for i in range(30):
        await asyncio.sleep(1)
        
        # Check DB status
        db = SessionLocal()
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert or alert.status != "pending":
                print(f"[ZaloAlert] Alert {alert_id} resolved during 30s monitoring. Aborting.")
                return
        finally:
            db.close()
            
        # Check stream state
        state = active_stream_states.get(camera_id, {})
        prediction = state.get("prediction", "normal")
        last_update = state.get("timestamp", 0)
        
        # If the person stood up (normal or sitting) and stream is active (updated in last 5s)
        if prediction in ["normal", "sitting"] and (time.time() - last_update < 5):
            active_standing_count += 1
            if active_standing_count >= 3:
                print(f"[ZaloAlert] Person stood up (state: {prediction}). Resolving alert {alert_id}.")
                db = SessionLocal()
                try:
                    alert = db.query(Alert).filter(Alert.id == alert_id).first()
                    if alert:
                        alert.status = "resolved"
                        db.commit()
                        try:
                            from server import manager
                            await manager.broadcast({
                                "type": "alert_resolved", 
                                "data": {
                                    "id": alert_id, 
                                    "status": "resolved", 
                                    "statusLabel": "Đã giải quyết"
                                }
                            })
                        except:
                            pass
                finally:
                    db.close()
                return
        else:
            active_standing_count = 0

    print(f"[ZaloAlert] Motionless confirmed for Alert {alert_id}. Starting Zalo spam...")
    
    # 2. Spam Zalo every 5s for up to 2 minutes (120s)
    spam_duration = 120
    spam_interval = 5
    elapsed = 0
    
    alert_url = f"{FRONTEND_URL}/emergency"
    spam_message = (
        f"🚨 CẢNH BÁO KHỒNG THỂ BỎ QUA!\n"
        f"Phát hiện người TÉ NGÃ và NẰM BẤT ĐỘNG tại {location}.\n"
        f"Chi tiết: {alert_url}\n"
        f"👉 Nhấp nút dưới hoặc trả lời 'Đã biết thông tin' để dừng báo động."
    )
    
    # Send initial alert to all subscribers
    broadcast_zalo_alert(spam_message)
    
    while elapsed < spam_duration:
        await asyncio.sleep(spam_interval)
        elapsed += spam_interval
        
        # Check DB status
        db = SessionLocal()
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert or alert.status != "pending":
                print(f"[ZaloAlert] Alert {alert_id} acknowledged/resolved. Stopping spam.")
                return
        finally:
            db.close()
            
        # Spam message again
        broadcast_zalo_alert(spam_message)
        
    # 3. If still pending after 2 minutes, call hospital
    print(f"[ZaloAlert] Timeout 2 minutes reached for Alert {alert_id}. Notifying hospital...")
    db = SessionLocal()
    try:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if alert and alert.status == "pending":
            alert.status = "hospital_notified"
            db.commit()
            
            # Broadcast to UI
            hospital_msg = f"🚨 Đã tự động gọi xe cấp cứu gần nhất cho ca ngã tại {location}!"
            try:
                from server import manager
                await manager.broadcast({
                    "type": "hospital_alert", 
                    "data": {
                        "alert_id": alert_id, 
                        "message": hospital_msg, 
                        "status": "hospital_notified",
                        "statusLabel": "Đã gọi cấp cứu"
                    }
                })
            except Exception as e:
                print(f"[ZaloAlert] Error broadcasting hospital notification: {e}")
                
            # Send final Zalo message
            final_message = (
                f"🚨 THÔNG BÁO HỆ THỐNG:\n"
                f"Không nhận được phản hồi sau 2 phút.\n"
                f"Hệ thống đã tự động liên hệ đơn vị cấp cứu gần nhất cho ca ngã tại {location}."
            )
            broadcast_zalo_alert(final_message)
    finally:
        db.close()

def trigger_fall_monitoring(alert_id: int, camera_id: str, location: str):
    """Starts the monitoring task in the background."""
    task = asyncio.create_task(monitor_fall_motionless(alert_id, camera_id, location))
    active_alert_tasks[alert_id] = task
