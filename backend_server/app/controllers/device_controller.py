from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import shutil
from app.models.database import get_db, Device
from app.utils.video_processor import process_video_offline


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

@router.post("/devices/upload")
async def upload_device_video(
    background_tasks: BackgroundTasks,
    device_id: str = Form(...),
    name: str = Form(...),
    location: str = Form(...),
    model: str = Form(...),
    video: UploadFile = File(...),
    db=Depends(get_db)
):
    # Check if device_id already exists
    existing = db.query(Device).filter(Device.device_id == device_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mã thiết bị đã tồn tại trong hệ thống")

    # Create uploads directories
    upload_dir = "uploads/videos"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save input video
    video_ext = video.filename.split(".")[-1]
    input_filename = f"input_{device_id}.{video_ext}"
    input_path = os.path.join(upload_dir, input_filename)
    
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)
        
    # Output path
    output_filename = f"processed_{device_id}.mp4"
    output_path = os.path.join(upload_dir, output_filename)
    
    # Create the device entry with status 'processing'
    db_device = Device(
        device_id=device_id,
        name=name,
        location=location,
        model=model,
        status="processing",
        stream_url="",
        camera_type="upload_video",
        last_heartbeat=datetime.utcnow()
    )
    db.add(db_device)
    try:
        db.commit()
        db.refresh(db_device)
    except Exception as e:
        db.rollback()
        if os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=500, detail=f"Lỗi cơ sở dữ liệu: {str(e)}")
        
    # Trigger AI processing task in the background
    background_tasks.add_task(process_video_offline, device_id, input_path, output_path)
    
    return {
        "status": "processing",
        "message": "Video uploaded successfully. AI processing started in background.",
        "device": {
            "id": db_device.device_id,
            "name": db_device.name,
            "location": db_device.location,
            "model": db_device.model,
            "status": db_device.status,
            "camera_type": db_device.camera_type
        }
    }


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
