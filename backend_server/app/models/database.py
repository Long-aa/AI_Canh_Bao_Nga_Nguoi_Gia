from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./fall_detection.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Only for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    camera_id = Column(Integer)
    prediction = Column(String)
    confidence = Column(Float)
    alert_type = Column(String)
    pose_data = Column(Text)  # JSON string

class ElderlyProfile(Base):
    __tablename__ = "elderly_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    age = Column(Integer)
    room = Column(String)
    emergency_contact = Column(String)
    medical_notes = Column(Text)

class Device(Base):
    __tablename__ = "devices"
    
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, unique=True)
    name = Column(String)
    location = Column(String)
    last_heartbeat = Column(DateTime)
    status = Column(String, default="offline")

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
