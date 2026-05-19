from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime
from app.models.database import get_db, Alert, Device
from app.websockets.connection_manager import ConnectionManager
import json

router = APIRouter()
manager = ConnectionManager()

class AlertData(BaseModel):
    timestamp: Optional[datetime] = None
    camera_id: str
    location: Optional[str] = "Unknown"
    person_name: Optional[str] = "Unknown"
    pose_data: Optional[Any] = None
    prediction: str
    confidence: float
    alert_type: str

class HeartbeatData(BaseModel):
    timestamp: datetime
    camera_id: str
    status: str
    cpu_usage: Optional[float] = 0.0
    temperature: Optional[float] = 0.0
    uptime: Optional[str] = ""

def _alert_to_dict(alert: Alert) -> dict:
    """Serialize an Alert ORM object to a dict for API responses."""
    # Mapped prediction labels in Vietnamese
    prediction_vn = alert.prediction
    if alert.prediction == "fall":
        prediction_vn = "Té ngã"
    elif alert.prediction == "fall_stairs":
        prediction_vn = "Vấp ngã bậc thang"
    elif alert.prediction == "sitting":
        prediction_vn = "Ngồi ghế"
    elif alert.prediction == "sleeping":
        prediction_vn = "Đi ngủ"
        
    timestamp_iso = alert.timestamp.isoformat()
    if not timestamp_iso.endswith('Z') and '+' not in timestamp_iso:
        timestamp_iso += 'Z'
        
    return {
        "id": alert.id,
        "time": alert.timestamp.strftime("%H:%M:%S"),
        "timestamp": timestamp_iso,
        "camera_id": alert.camera_id,
        "location": alert.location,
        "person": alert.person_name,
        "prediction": prediction_vn,
        "confidence": alert.confidence,
        "alert_type": alert.alert_type,
        "status": alert.status,
        "video_url": alert.video_url,
        "risk": "Khẩn cấp" if alert.alert_type == "fall_detected" else ("Cảnh báo" if alert.alert_type == "warning" else "Theo dõi"),
        "riskColor": "bg-red-500" if alert.alert_type == "fall_detected" else ("bg-amber-500" if alert.alert_type == "warning" else "bg-blue-500"),
        "statusLabel": "Đang xử lý" if alert.status == "pending" else (
            "Đã gọi cấp cứu" if alert.status == "hospital_notified" else (
                "Đã biết thông tin" if alert.status == "acknowledged" else (
                    "Đã giải quyết" if alert.status == "resolved" else "Đã ổn định"
                )
            )
        ),
    }

@router.post("/alerts")
async def create_alert(alert: AlertData, db=Depends(get_db)):
    """Receive and process fall detection alerts"""
    try:
        device = db.query(Device).filter(Device.device_id == alert.camera_id).first()
        location = alert.location if alert.location != "Unknown" else (device.location if device else "Unknown")

        db_alert = Alert(
            timestamp=alert.timestamp or datetime.utcnow(),
            camera_id=alert.camera_id,
            person_name=alert.person_name,
            location=location,
            prediction=alert.prediction,
            confidence=alert.confidence,
            alert_type=alert.alert_type,
            pose_data=alert.pose_data
        )
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)

        broadcast_data = {
            "type": "fall_alert" if alert.alert_type == "fall_detected" else "info_alert",
            "data": _alert_to_dict(db_alert)
        }
        await manager.broadcast(broadcast_data)

        return {"status": "success", "alert_id": db_alert.id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/heartbeat")
async def receive_heartbeat(heartbeat: HeartbeatData, db=Depends(get_db)):
    """Receive heartbeat from edge devices"""
    device = db.query(Device).filter(Device.device_id == heartbeat.camera_id).first()
    if device:
        device.last_heartbeat = heartbeat.timestamp
        device.status = heartbeat.status
        device.cpu_usage = heartbeat.cpu_usage
        device.temperature = heartbeat.temperature
        device.uptime = heartbeat.uptime
        db.commit()
        return {"status": "updated"}
    return {"status": "device_not_found"}

@router.get("/alerts", response_model=List[dict])
async def get_alerts(limit: int = 100, alert_type: Optional[str] = None, camera_id: Optional[str] = None, db=Depends(get_db)):
    """Get recent alerts, optionally filtered by alert_type or camera_id"""
    query = db.query(Alert).order_by(Alert.timestamp.desc())
    if alert_type:
        query = query.filter(Alert.alert_type == alert_type)
    if camera_id:
        query = query.filter(Alert.camera_id == camera_id)
    alerts = query.limit(limit).all()
    return [_alert_to_dict(a) for a in alerts]

@router.get("/alerts/fall-clips", response_model=List[dict])
async def get_fall_clips(limit: int = 50, db=Depends(get_db)):
    """Get fall alerts that have video clips recorded"""
    alerts = (
        db.query(Alert)
        .filter(Alert.alert_type == "fall_detected")
        .order_by(Alert.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [_alert_to_dict(a) for a in alerts]

@router.get("/alerts/{alert_id}", response_model=dict)
async def get_alert(alert_id: int, db=Depends(get_db)):
    """Get a single alert by ID"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return _alert_to_dict(alert)

@router.patch("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: int, db=Depends(get_db)):
    """Mark an alert as resolved"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "resolved"
    db.commit()
    await manager.broadcast({"type": "alert_resolved", "data": {"id": alert_id}})
    return {"status": "resolved", "alert_id": alert_id}

@router.patch("/alerts/{alert_id}/false-alarm")
async def mark_false_alarm(alert_id: int, db=Depends(get_db)):
    """Mark an alert as a false alarm"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "processed"
    alert.prediction = "false_alarm"
    db.commit()
    return {"status": "false_alarm", "alert_id": alert_id}
