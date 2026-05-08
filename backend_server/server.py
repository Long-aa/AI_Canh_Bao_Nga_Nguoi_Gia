from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.controllers.alert_controller import router as alert_router
from app.controllers.device_controller import router as device_router
from app.controllers.profile_controller import router as profile_router
from app.controllers.stats_controller import router as stats_router
from app.controllers.mobile_controller import router as mobile_router
from app.websockets.connection_manager import ConnectionManager
from app.models.database import create_tables
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    try:
        create_tables()
        print("Database tables created/verified.")
    except Exception as e:
        print(f"Error creating tables: {e}")
    yield
    # Shutdown logic (if any)

app = FastAPI(title="Elderly Fall Detection Backend", version="1.0.0", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# WebSocket connection manager
manager = ConnectionManager()

# Include routers
app.include_router(alert_router, prefix="/api", tags=["alerts"])
app.include_router(device_router, prefix="/api", tags=["devices"])
app.include_router(profile_router, prefix="/api", tags=["profiles"])
app.include_router(stats_router, prefix="/api", tags=["stats"])
app.include_router(mobile_router, prefix="/api/mobile", tags=["mobile"])

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming WebSocket messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    return {"message": "Elderly Fall Detection Backend API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Store active streams
active_streams = {}

@app.websocket("/ws/stream/{device_id}")
async def stream_endpoint(websocket: WebSocket, device_id: str):
    await websocket.accept()
    if device_id not in active_streams:
        active_streams[device_id] = set()
    
    # Check if this is a producer (mobile) or consumer (dashboard)
    # For now, we assume first connection is producer if data is sent
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast to all listeners for this device
            if device_id in active_streams:
                # print(f"Streaming {len(data)} bytes for {device_id} to {len(active_streams[device_id])} clients")
                for client in list(active_streams[device_id]):
                    try:
                        await client.send_text(data)
                    except:
                        active_streams[device_id].remove(client)
    except WebSocketDisconnect:
        pass
    finally:
        if device_id in active_streams and websocket in active_streams[device_id]:
            active_streams[device_id].remove(websocket)

@app.websocket("/ws/view/{device_id}")
async def view_endpoint(websocket: WebSocket, device_id: str):
    await websocket.accept()
    if device_id not in active_streams:
        active_streams[device_id] = set()
    active_streams[device_id].add(websocket)
    try:
        while True:
            await websocket.receive_text() # Keep alive
    except WebSocketDisconnect:
        active_streams[device_id].remove(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
