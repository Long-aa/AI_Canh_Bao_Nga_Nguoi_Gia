import os
from datetime import datetime, timedelta
import random
from app.models.database import SessionLocal, Device, Alert, ElderlyProfile, create_tables

def seed():
    create_tables()
    db = SessionLocal()
    
    # 1. Clear existing data
    db.query(Alert).delete()
    db.query(Device).delete()
    db.query(ElderlyProfile).delete()
    
    # 2. Add Devices
    devices = [
        Device(device_id="EDG-001", name="Cam Phòng Khách", location="Phòng khách - Khu A", model="NVIDIA Jetson Nano", status="online", cpu_usage=45.2, temperature=42.0, uptime="12d 4h", last_heartbeat=datetime.utcnow()),
        Device(device_id="EDG-002", name="Cam Phòng Ngủ 2", location="Phòng ngủ 2 - Khu B", model="Raspberry Pi 4", status="offline", cpu_usage=0.0, temperature=0.0, uptime="0s", last_heartbeat=datetime.utcnow() - timedelta(days=1)),
        Device(device_id="EDG-003", name="Cam Hành Lang", location="Hành lang tầng 1", model="NVIDIA Jetson Orin", status="online", cpu_usage=88.5, temperature=65.0, uptime="45d 12h", last_heartbeat=datetime.utcnow()),
        Device(device_id="EDG-004", name="Cam Sân Vườn", location="Sân vườn sau", model="Jetson Xavier NX", status="online", cpu_usage=22.1, temperature=38.4, uptime="2d 18h", last_heartbeat=datetime.utcnow()),
    ]
    db.add_all(devices)
    db.commit()
    
    # 3. Add Elderly Profiles
    profiles = [
        ElderlyProfile(name="Nguyễn Văn A", age=75, room="302", gender="Nam", emergency_contact="Con trai - 090xxxxxxx", emergency_phone="0901234567", medical_notes="Cao huyết áp, tiểu đường"),
        ElderlyProfile(name="Trần Thị B", age=82, room="201", gender="Nữ", emergency_contact="Con gái - 091xxxxxxx", emergency_phone="0911223344", medical_notes="Tim mạch"),
        ElderlyProfile(name="Lê Văn C", age=68, room="Phòng sinh hoạt", gender="Nam", emergency_contact="Vợ - 098xxxxxxx", emergency_phone="0988776655", medical_notes="Khớp"),
    ]
    db.add_all(profiles)
    db.commit()
    
    # 4. Add Alerts (Recent and Historical for chart)
    # Historical data for last 7 days
    for i in range(7):
        date = datetime.utcnow() - timedelta(days=i)
        num_alerts = random.randint(5, 25)
        for _ in range(num_alerts):
            alert_time = date.replace(hour=random.randint(0, 23), minute=random.randint(0, 59))
            alert_type = random.choices(["fall_detected", "warning", "info"], weights=[0.1, 0.3, 0.6])[0]
            
            alert = Alert(
                timestamp=alert_time,
                camera_id=random.choice(["EDG-001", "EDG-003", "EDG-004"]),
                person_name=random.choice(["Nguyễn Văn A", "Trần Thị B", "Lê Văn C"]),
                location=random.choice(["Phòng khách", "Hành lang", "Sân vườn"]),
                prediction=alert_type.replace("_", " "),
                confidence=random.uniform(0.7, 0.99),
                alert_type=alert_type,
                status="resolved" if i > 0 else "pending"
            )
            db.add(alert)
    
    db.commit()
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed()
