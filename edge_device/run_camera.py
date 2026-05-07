import cv2
import time
import threading
from core_inference.pose_extractor import PoseExtractor
from core_inference.action_recognizer import ActionRecognizer
from utils.backend_sender import BackendSender

class FallDetectionSystem:
    def __init__(self, camera_id=0, backend_url="http://localhost:8000"):
        self.camera_id = camera_id
        self.cap = cv2.VideoCapture(camera_id)
        
        # Initialize components
        self.pose_extractor = PoseExtractor()
        self.action_recognizer = ActionRecognizer()
        self.backend_sender = BackendSender(backend_url)
        
        # Control variables
        self.running = False
        self.last_heartbeat = time.time()
        
    def start(self):
        """Start the fall detection system"""
        if not self.cap.isOpened():
            print(f"Error: Could not open camera {self.camera_id}")
            return
            
        self.running = True
        print("Fall detection system started...")
        
        try:
            while self.running:
                ret, frame = self.cap.read()
                if not ret:
                    print("Error: Could not read frame")
                    break
                
                # Extract pose
                pose_landmarks, pose_landmarks_obj = self.pose_extractor.extract_pose(frame)
                
                if pose_landmarks is not None:
                    # Add to sequence
                    self.action_recognizer.add_frame(pose_landmarks)
                    
                    # Predict action
                    prediction, confidence = self.action_recognizer.predict_action()
                    
                    if prediction:
                        # Send alert if fall detected
                        if prediction == "fall":
                            self.backend_sender.send_alert(
                                pose_landmarks, prediction, confidence, self.camera_id
                            )
                        
                        # Draw prediction on frame
                        cv2.putText(
                            frame, 
                            f"{prediction}: {confidence:.2f}", 
                            (10, 30), 
                            cv2.FONT_HERSHEY_SIMPLEX, 
                            1, 
                            (0, 255, 0) if prediction == "normal" else (0, 0, 255), 
                            2
                        )
                
                # Draw pose on frame
                frame = self.pose_extractor.draw_pose(frame, pose_landmarks_obj)
                
                # Send heartbeat every 30 seconds
                if time.time() - self.last_heartbeat > 30:
                    self.backend_sender.send_heartbeat(self.camera_id)
                    self.last_heartbeat = time.time()
                
                # Display frame
                cv2.imshow('Fall Detection System', frame)
                
                # Exit on 'q' key
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                    
        except KeyboardInterrupt:
            print("\nSystem stopped by user")
        finally:
            self.stop()
    
    def stop(self):
        """Stop the system"""
        self.running = False
        self.cap.release()
        cv2.destroyAllWindows()
        print("Fall detection system stopped")

if __name__ == "__main__":
    system = FallDetectionSystem(camera_id=0)
    system.start()
