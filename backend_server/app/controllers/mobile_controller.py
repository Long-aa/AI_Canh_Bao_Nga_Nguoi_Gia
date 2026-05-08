from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Optional
import uuid
from app.models.database import get_db, Device
from datetime import datetime
import socket
import os

def get_local_ip():
    # Check if manually overridden in env
    manual_ip = os.getenv("LOCAL_IP")
    if manual_ip:
        return manual_ip
        
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

router = APIRouter()

# In-memory session storage (In production, use Redis)
active_sessions = {}

class PairRequest(BaseModel):
    session_id: str
    phone_model: str
    camera_id: str

@router.get("/session")
async def create_session():
    session_id = str(uuid.uuid4())
    local_ip = get_local_ip()
    active_sessions[session_id] = {"status": "pending", "created_at": datetime.utcnow()}
    return {
        "session_id": session_id,
        "local_ip": local_ip,
        "pair_url": f"http://{local_ip}:8001/api/mobile/pair"
    }

@router.post("/pair")
async def pair_phone(request: PairRequest, db=Depends(get_db)):
    if request.session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session expired or invalid")
    
    # Check if this camera_id already has a device
    existing_device = db.query(Device).filter(Device.device_id == f"MOBILE-{request.camera_id[:8]}").first()
    
    if existing_device:
        existing_device.status = "online"
        existing_device.last_heartbeat = datetime.utcnow()
        new_device = existing_device
    else:
        # Create a new device for the phone
        new_device = Device(
            device_id=f"MOBILE-{request.camera_id[:8]}",
            name=f"Mobile: {request.phone_model}",
            location="Mobile Camera",
            model=request.phone_model,
            status="online",
            last_heartbeat=datetime.utcnow()
        )
        db.add(new_device)
    
    try:
        db.commit()
        db.refresh(new_device)
        active_sessions[request.session_id] = {"status": "paired", "device_id": new_device.device_id}
        print(f"Device paired: {new_device.device_id}")
        return {"status": "success", "device_id": new_device.device_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Pairing failed or device already exists")

@router.get("/mobile-camera", response_class=HTMLResponse)
async def get_mobile_camera_page(session: str):
    return f"""
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>SafeGuard Mobile Camera</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
        <style>
            body {{ font-family: 'Inter', sans-serif; }}
            .animate-pulse-slow {{ animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }}
            @keyframes pulse {{ 0%, 100% {{ opacity: 1; }} 50% {{ opacity: .5; }} }}
        </style>
    </head>
    <body class="bg-slate-950 text-white overflow-hidden">
        <div id="welcome-screen" class="min-h-screen flex flex-col items-center justify-center p-8 text-center relative">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent opacity-50"></div>
            <div class="relative space-y-8 max-w-sm w-full">
                <div class="w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-600/40 mx-auto">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                </div>
                <div class="space-y-3">
                    <h1 class="text-3xl font-black tracking-tight">Kết nối Camera</h1>
                    <p class="text-slate-400 text-sm font-medium leading-relaxed">Sử dụng điện thoại của bạn như một thiết bị giám sát AI chuyên nghiệp.</p>
                </div>
                <div class="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <div class="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                        <span class="text-slate-500">Session ID</span>
                        <span class="text-blue-400 font-mono">{session[:8]}</span>
                    </div>
                </div>
                <button onclick="startConnection()" class="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                    Bắt đầu kết nối
                </button>
            </div>
        </div>

        <div id="camera-screen" class="hidden min-h-screen bg-black flex flex-col items-center justify-center relative">
            <video id="video" autoplay playsinline muted class="w-full h-full object-cover"></video>
            <div class="absolute inset-x-0 top-0 p-8 bg-gradient-to-b from-black/80 to-transparent">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </div>
                    <div>
                        <h1 class="text-white font-black text-sm tracking-tight">SAFEGUARD LIVE</h1>
                        <p id="status-text" class="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Đang kết nối...
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <script>
            const sessionId = "{session}";
            
            let ws;
            
            async function startConnection() {{
                document.getElementById('welcome-screen').classList.add('hidden');
                document.getElementById('camera-screen').classList.remove('hidden');
                
                try {{
                    const stream = await navigator.mediaDevices.getUserMedia({{ 
                        video: {{ facingMode: 'environment', width: 640, height: 480 }},
                        audio: false 
                    }});
                    
                    const video = document.getElementById('video');
                    video.srcObject = stream;
                    
                    // Pair with backend
                    const response = await axios.post('/api/mobile/pair', {{
                        session_id: sessionId,
                        phone_model: navigator.userAgent.includes('iPhone') ? 'iPhone' : 'Android',
                        camera_id: 'MOBILE-' + Math.random().toString(36).substr(2, 9)
                    }});
                    
                    const deviceId = response.data.device_id;
                    document.getElementById('status-text').innerHTML = '<span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>Đã kết nối: ' + deviceId;

                    // Setup WebSocket for streaming
                    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                    ws = new WebSocket(`${{protocol}}//${{window.location.host}}/ws/stream/${{deviceId}}`);
                    
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = 320;
                    canvas.height = 240;

                    setInterval(() => {{
                        if (ws.readyState === WebSocket.OPEN) {{
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                            const data = canvas.toDataURL('image/jpeg', 0.4);
                            ws.send(data);
                        }}
                    }}, 100); // 10 FPS
                    
                }} catch (err) {{
                    alert('Lỗi: ' + err.message);
                }}
            }}
        </script>
    </body>
    </html>
    """

@router.get("/status/{session_id}")
async def get_session_status(session_id: str):
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return active_sessions[session_id]
