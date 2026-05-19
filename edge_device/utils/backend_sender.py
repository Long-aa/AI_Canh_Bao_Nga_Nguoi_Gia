import json
import requests
from datetime import datetime

class BackendSender:
    def __init__(self, backend_url="http://localhost:8000"):
        self.backend_url = backend_url
        
    def send_alert(self, pose_data, prediction, confidence, camera_id=1):
        """Send fall detection alert to backend"""
        try:
            payload = {
                "timestamp": datetime.utcnow().isoformat(),
                "camera_id": camera_id,
                "pose_data": pose_data.tolist() if hasattr(pose_data, 'tolist') else pose_data,
                "prediction": prediction,
                "confidence": confidence,
                "alert_type": "fall_detected" if prediction == "fall" else "normal_activity"
            }
            
            response = requests.post(
                f"{self.backend_url}/api/alerts",
                json=payload,
                timeout=5
            )
            
            if response.status_code == 200:
                print(f"Alert sent successfully: {prediction}")
                return True
            else:
                print(f"Failed to send alert: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"Error sending alert: {e}")
            return False
    
    def send_heartbeat(self, camera_id=1):
        """Send heartbeat to backend"""
        try:
            payload = {
                "timestamp": datetime.utcnow().isoformat(),
                "camera_id": camera_id,
                "status": "online"
            }
            
            requests.post(
                f"{self.backend_url}/api/heartbeat",
                json=payload,
                timeout=3
            )
        except:
            pass  # Heartbeat failures are not critical
