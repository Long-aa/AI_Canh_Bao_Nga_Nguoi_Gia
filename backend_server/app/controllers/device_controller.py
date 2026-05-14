from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.database import get_db, Device

router = APIRouter()

class DeviceSchema(BaseModel):
    device_id: str
    name: str
    location: str
    model: str
    status: Optional[str] = "offline"
    stream_url: Optional[str] = None
    camera_type: Optional[str] = "ip_camera"

@router.get("/devices", response_model=List[dict])
async def get_devices(db=Depends(get_db)):
    devices = db.query(Device).all()
    return [
        {
            "id": d.device_id,
            "name": d.name,
            "location": d.location,
            "model": d.model,
            "status": d.status,
            "cpu": d.cpu_usage,
            "temperature": d.temperature,
            "uptime": d.uptime,
            "stream_url": d.stream_url,
            "camera_type": d.camera_type or "ip_camera"
        }
        for d in devices
    ]

@router.post("/devices")
async def create_device(device: DeviceSchema, db=Depends(get_db)):
    db_device = Device(
        device_id=device.device_id,
        name=device.name,
        location=device.location,
        model=device.model,
        status=device.status,
        stream_url=device.stream_url,
        camera_type=device.camera_type or "ip_camera",
        last_heartbeat=datetime.utcnow()
    )
    db.add(db_device)
    try:
        db.commit()
        db.refresh(db_device)
        return db_device
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Device ID already exists")

@router.put("/devices/{device_id}")
async def update_device(device_id: str, device_data: DeviceSchema, db=Depends(get_db)):
    db_device = db.query(Device).filter(Device.device_id == device_id).first()
    if not db_device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    db_device.name = device_data.name
    db_device.location = device_data.location
    db_device.model = device_data.model
    db_device.status = device_data.status
    db_device.stream_url = device_data.stream_url
    db_device.camera_type = device_data.camera_type or "ip_camera"
    
    db.commit()
    db.refresh(db_device)
    return db_device

@router.delete("/devices/{device_id}")
async def delete_device(device_id: str, db=Depends(get_db)):
    device = db.query(Device).filter(Device.device_id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    db.delete(device)
    db.commit()
    return {"message": "Device deleted"}
