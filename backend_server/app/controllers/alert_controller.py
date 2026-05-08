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

@router.post("/alerts")
async def create_alert(alert: AlertData, db=Depends(get_db)):
    """Receive and process fall detection alerts"""
    try:
        # Check if device exists
        device = db.query(Device).filter(Device.device_id == alert.camera_id).first()
        location = alert.location if alert.location != "Unknown" else (device.location if device else "Unknown")
        
        # Save alert to database
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
        
        # If it's a fall alert, broadcast to all connected clients
        broadcast_data = {
            "type": "fall_alert" if alert.alert_type == "fall_detected" else "info_alert",
            "data": {
                "id": db_alert.id,
                "time": (alert.timestamp or datetime.utcnow()).strftime("%H:%M %p"),
                "location": location,
                "person": alert.person_name,
                "risk": "Khẩn cấp" if alert.alert_type == "fall_detected" else "Cảnh báo",
                "riskColor": "bg-red-500" if alert.alert_type == "fall_detected" else "bg-amber-500",
                "status": "Đang xử lý",
                "confidence": alert.confidence
            }
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
async def get_alerts(limit: int = 100, db=Depends(get_db)):
    """Get recent alerts"""
    alerts = db.query(Alert).order_by(Alert.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": alert.id,
            "time": alert.timestamp.strftime("%H:%M %p"),
            "timestamp": alert.timestamp,
            "camera_id": alert.camera_id,
            "location": alert.location,
            "person": alert.person_name,
            "prediction": alert.prediction,
            "confidence": alert.confidence,
            "risk": "Khẩn cấp" if alert.alert_type == "fall_detected" else ("Cảnh báo" if alert.alert_type == "warning" else "Theo dõi"),
            "riskColor": "bg-red-500" if alert.alert_type == "fall_detected" else ("bg-amber-500" if alert.alert_type == "warning" else "bg-blue-500"),
            "status": "Đang xử lý" if alert.status == "pending" else "Đã ổn định"
        }
        for alert in alerts
    ]
