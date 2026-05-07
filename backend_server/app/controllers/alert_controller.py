from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.database import get_db, Alert, ElderlyProfile
from app.websockets.connection_manager import ConnectionManager
import json

router = APIRouter()
manager = ConnectionManager()

class AlertData(BaseModel):
    timestamp: datetime
    camera_id: int
    pose_data: List[float]
    prediction: str
    confidence: float
    alert_type: str

class HeartbeatData(BaseModel):
    timestamp: datetime
    camera_id: int
    status: str

@router.post("/alerts")
async def create_alert(alert: AlertData, db=Depends(get_db)):
    """Receive and process fall detection alerts"""
    try:
        # Save alert to database
        db_alert = Alert(
            timestamp=alert.timestamp,
            camera_id=alert.camera_id,
            prediction=alert.prediction,
            confidence=alert.confidence,
            alert_type=alert.alert_type,
            pose_data=json.dumps(alert.pose_data)
        )
        db.add(db_alert)
        db.commit()
        
        # If it's a fall alert, broadcast to all connected clients
        if alert.alert_type == "fall_detected":
            await manager.broadcast({
                "type": "fall_alert",
                "data": {
                    "id": db_alert.id,
                    "timestamp": alert.timestamp.isoformat(),
                    "camera_id": alert.camera_id,
                    "confidence": alert.confidence
                }
            })
        
        return {"status": "success", "alert_id": db_alert.id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/heartbeat")
async def receive_heartbeat(heartbeat: HeartbeatData, db=Depends(get_db)):
    """Receive heartbeat from edge devices"""
    # Update device status in database (implement as needed)
    return {"status": "received"}

@router.get("/alerts", response_model=List[dict])
async def get_alerts(limit: int = 100, db=Depends(get_db)):
    """Get recent alerts"""
    alerts = db.query(Alert).order_by(Alert.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": alert.id,
            "timestamp": alert.timestamp,
            "camera_id": alert.camera_id,
            "prediction": alert.prediction,
            "confidence": alert.confidence,
            "alert_type": alert.alert_type
        }
        for alert in alerts
    ]

@router.get("/elderly-profiles", response_model=List[dict])
async def get_elderly_profiles(db=Depends(get_db)):
    """Get all elderly profiles"""
    profiles = db.query(ElderlyProfile).all()
    return [
        {
            "id": profile.id,
            "name": profile.name,
            "age": profile.age,
            "room": profile.room,
            "emergency_contact": profile.emergency_contact
        }
        for profile in profiles
    ]
