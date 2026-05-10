import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.types import JSON
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Database setup
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/fall_detection")

# Check if we are using postgres or sqlite
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    camera_id = Column(String, ForeignKey("devices.device_id"))
    person_name = Column(String, nullable=True)
    location = Column(String)
    prediction = Column(String)
    confidence = Column(Float)
    alert_type = Column(String) # 'fall_detected', 'warning', 'info'
    status = Column(String, default="pending") # 'pending', 'processed', 'resolved'
    pose_data = Column(JSON) # Use JSON for NoSQL-like flexibility
    
    device = relationship("Device", back_populates="alerts")

class ElderlyProfile(Base):
    __tablename__ = "elderly_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    age = Column(Integer)
    room = Column(String)
    gender = Column(String)
    avatar_url = Column(String, nullable=True)
    video_path = Column(String, nullable=True)
    document_path = Column(String, nullable=True)
    emergency_contact = Column(String)
    emergency_phone = Column(String)
    medical_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Device(Base):
    __tablename__ = "devices"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True) # e.g., 'EDG-001'
    name = Column(String)
    location = Column(String)
    model = Column(String)
    ip_address = Column(String, nullable=True)
    last_heartbeat = Column(DateTime)
    status = Column(String, default="offline") # 'online', 'offline'
    cpu_usage = Column(Float, default=0.0)
    temperature = Column(Float, default=0.0)
    uptime = Column(String, nullable=True)
    
    alerts = relationship("Alert", back_populates="device")

class SystemSetting(Base):
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(String)
    description = Column(String, nullable=True)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)
