import cv2
import mediapipe as mp
import numpy as np

class PoseExtractor:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
    def extract_pose(self, frame):
        """Extract pose landmarks from frame"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb_frame)
        
        if results.pose_landmarks:
            # Extract 33 keypoints
            landmarks = []
            for landmark in results.pose_landmarks.landmark:
                landmarks.extend([landmark.x, landmark.y, landmark.z])
            return np.array(landmarks), results.pose_landmarks
        return None, None
    
    def draw_pose(self, frame, pose_landmarks):
        """Draw pose landmarks on frame"""
        if pose_landmarks:
            self.mp_drawing.draw_landmarks(
                frame, 
                pose_landmarks, 
                self.mp_pose.POSE_CONNECTIONS
            )
        return frame
