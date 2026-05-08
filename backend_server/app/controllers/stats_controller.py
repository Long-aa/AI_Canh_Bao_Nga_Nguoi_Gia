from fastapi import APIRouter, Depends
from sqlalchemy import func
from datetime import datetime, timedelta
from app.models.database import get_db, Alert, Device, ElderlyProfile

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(db=Depends(get_db)):
    # 1. Active devices
    active_devices = db.query(Device).filter(Device.status == "online").count()
    total_devices = db.query(Device).count()
    
    # 2. Alerts today
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    alerts_today = db.query(Alert).filter(Alert.timestamp >= today).count()
    
    # 3. Fall detections today
    falls_today = db.query(Alert).filter(
        Alert.timestamp >= today, 
        Alert.alert_type == "fall_detected"
    ).count()
    
    # 4. System stability (mock for now or based on uptime)
    stability = "99.9%"
    
    # 5. Chart data (last 7 days)
    chart_data = []
    for i in range(6, -1, -1):
        date = (datetime.utcnow() - timedelta(days=i)).date()
        start_time = datetime.combine(date, datetime.min.time())
        end_time = datetime.combine(date, datetime.max.time())
        
        count = db.query(Alert).filter(
            Alert.timestamp >= start_time,
            Alert.timestamp <= end_time
        ).count()
        
        day_names = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
        # weekday() returns 0 for Monday, 6 for Sunday
        # Vietnam labels: T2 (Mon), ..., CN (Sun)
        day_label = day_names[date.weekday()]
        
        chart_data.append({
            "day": day_label,
            "alerts": count,
            "safe": 100 - count if 100 - count > 0 else 0
        })

    return {
        "stats": [
            {"title": "Thiết bị hoạt động", "value": str(active_devices), "change": f"/{total_devices} tổng số"},
            {"title": "Cảnh báo hôm nay", "value": str(alerts_today), "change": "Cập nhật realtime"},
            {"title": "Phát hiện té ngã", "value": str(falls_today).zfill(2), "change": "Đã xử lý xong"},
            {"title": "Độ ổn định hệ thống", "value": stability, "change": "Tối ưu"}
        ],
        "chartData": chart_data
    }
