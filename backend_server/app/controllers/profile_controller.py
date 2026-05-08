from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from pydantic import BaseModel
from typing import List, Optional
from app.models.database import get_db, ElderlyProfile
import shutil
import os
import uuid

router = APIRouter()

class ProfileSchema(BaseModel):
    name: str
    age: int
    room: str
    gender: str
    emergency_contact: str
    emergency_phone: str
    medical_notes: Optional[str] = None
    avatar_url: Optional[str] = None

@router.get("/elderly-profiles", response_model=List[dict])
async def get_profiles(db=Depends(get_db)):
    profiles = db.query(ElderlyProfile).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "age": p.age,
            "room": p.room,
            "gender": p.gender,
            "emergency_contact": p.emergency_contact,
            "emergency_phone": p.emergency_phone,
            "medical_notes": p.medical_notes,
            "avatar_url": p.avatar_url,
            "status": "active",  # Default for demo
            "health": "Ổn định",  # Default for demo
            "lastUpdate": "Vừa xong"  # Default for demo
        }
        for p in profiles
    ]

@router.post("/elderly-profiles")
async def create_profile(
    name: str = Form(...),
    age: int = Form(...),
    room: str = Form(...),
    gender: str = Form(...),
    emergency_contact: str = Form(...),
    emergency_phone: str = Form(...),
    medical_notes: Optional[str] = Form(None),
    avatar: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    document: Optional[UploadFile] = File(None),
    db=Depends(get_db)
):
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads/profiles"
    os.makedirs(upload_dir, exist_ok=True)
    
    avatar_url = None
    if avatar:
        avatar_ext = avatar.filename.split(".")[-1]
        avatar_filename = f"{uuid.uuid4()}.{avatar_ext}"
        avatar_path = os.path.join(upload_dir, avatar_filename)
        with open(avatar_path, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
        avatar_url = f"/uploads/profiles/{avatar_filename}"

    video_path = None
    if video:
        video_ext = video.filename.split(".")[-1]
        video_filename = f"{uuid.uuid4()}.{video_ext}"
        video_full_path = os.path.join(upload_dir, video_filename)
        with open(video_full_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        video_path = f"/uploads/profiles/{video_filename}"
        
        # Here you would typically trigger AI processing
        print(f"AI Processing triggered for video: {video_path}")

    document_path = None
    if document:
        doc_ext = document.filename.split(".")[-1]
        doc_filename = f"{uuid.uuid4()}.{doc_ext}"
        doc_full_path = os.path.join(upload_dir, doc_filename)
        with open(doc_full_path, "wb") as buffer:
            shutil.copyfileobj(document.file, buffer)
        document_path = f"/uploads/profiles/{doc_filename}"

    db_profile = ElderlyProfile(
        name=name,
        age=age,
        room=room,
        gender=gender,
        emergency_contact=emergency_contact,
        emergency_phone=emergency_phone,
        medical_notes=medical_notes,
        avatar_url=avatar_url,
        video_path=video_path,
        document_path=document_path
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.put("/elderly-profiles/{profile_id}")
async def update_profile(profile_id: int, profile: ProfileSchema, db=Depends(get_db)):
    db_profile = db.query(ElderlyProfile).filter(ElderlyProfile.id == profile_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    for key, value in profile.dict().items():
        setattr(db_profile, key, value)
    
    db.commit()
    return db_profile

@router.delete("/elderly-profiles/{profile_id}")
async def delete_profile(profile_id: int, db=Depends(get_db)):
    db_profile = db.query(ElderlyProfile).filter(ElderlyProfile.id == profile_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    db.delete(db_profile)
    db.commit()
    return {"message": "Profile deleted"}
