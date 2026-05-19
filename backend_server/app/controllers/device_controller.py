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

@router.get("/storage/credentials")
async def get_storage_credentials():
    import os
    return {
        "url": os.getenv("SUPABASE_URL"),
        "key": os.getenv("SUPABASE_KEY"),
        "bucket": os.getenv("SUPABASE_BUCKET", "alerts")
    }

async def background_download_and_process(video_url: str, input_path: str, output_path: str, device_id: str):
    import requests
    import asyncio
    try:
        print(f"[{device_id}] Đang tải video từ đám mây (Background)...")
        
        def download_file():
            response = requests.get(video_url, stream=True)
            if response.status_code == 200:
                with open(input_path, "wb") as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                return True
            else:
                print(f"[{device_id}] Lỗi tải video từ cloud: {response.status_code}")
                return False
                
        success = await asyncio.to_thread(download_file)
        
        if success:
            print(f"[{device_id}] Tải thành công! Bắt đầu xử lý AI an toàn trên luồng nền (Background Thread)...")
            loop = asyncio.get_running_loop()
            await asyncio.to_thread(process_video_offline, device_id, input_path, output_path, loop)
    except Exception as e:
        print(f"[{device_id}] Ngoại lệ khi tải video: {e}")

@router.post("/devices/upload")
async def upload_device_video(
    background_tasks: BackgroundTasks,
    device_id: str = Form(...),
    name: str = Form(...),
    location: str = Form(...),
    model: str = Form(...),
    video: Optional[UploadFile] = File(None),
    video_url: Optional[str] = Form(None),
    db=Depends(get_db)
):
    # Check if device_id already exists
    existing = db.query(Device).filter(Device.device_id == device_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mã thiết bị đã tồn tại trong hệ thống")

    # Create uploads directories
    upload_dir = "uploads/videos"
    os.makedirs(upload_dir, exist_ok=True)
    
    input_path = ""
    # Setup paths without blocking downloads
    if video:
        video_ext = video.filename.split(".")[-1] or "mp4"
        input_filename = f"input_{device_id}.{video_ext}"
        input_path = os.path.join(upload_dir, input_filename)
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
    elif video_url:
        video_ext = video_url.split(".")[-1].split("?")[0] or "mp4"
        if len(video_ext) > 4:
            video_ext = "mp4"
        input_filename = f"input_{device_id}.{video_ext}"
        input_path = os.path.join(upload_dir, input_filename)
    else:
        raise HTTPException(status_code=400, detail="Vui lòng tải lên file video hoặc cung cấp video_url")
        
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
        
    # Trigger background tasks based on input type
    import asyncio
    if video_url:
        background_tasks.add_task(background_download_and_process, video_url, input_path, output_path, device_id)
    else:
        loop = asyncio.get_running_loop()
        background_tasks.add_task(process_video_offline, device_id, input_path, output_path, loop)
    
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
