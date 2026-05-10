import cv2
import mediapipe as mp
import numpy as np
import os

class PoseExtractor:
    def __init__(self):
        # Path to the task model
        model_path = os.path.join(os.path.dirname(__file__), "pose_landmarker.task")
        
        try:
            # Try the modern Tasks API (MediaPipe 0.10+)
            from mediapipe.tasks import python
            from mediapipe.tasks.python import vision
            
            base_options = python.BaseOptions(model_asset_path=model_path)
            options = vision.PoseLandmarkerOptions(
                base_options=base_options,
                running_mode=vision.RunningMode.IMAGE,
                min_pose_detection_confidence=0.5,
                min_pose_presence_confidence=0.5,
                min_tracking_confidence=0.5
            )
            self.detector = vision.PoseLandmarker.create_from_options(options)
            self.use_tasks_api = True
            print("PoseExtractor: Using MediaPipe Tasks API")
        except Exception as e:
            print(f"PoseExtractor: Failed to initialize Tasks API: {e}")
            # Fallback to Solutions API if available
            try:
                self.mp_pose = mp.solutions.pose
                self.pose = self.mp_pose.Pose(
                    static_image_mode=False,
                    model_complexity=1,
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5
                )
                self.use_tasks_api = False
                print("PoseExtractor: Using MediaPipe Solutions API")
            except:
                print("PoseExtractor: CRITICAL - Both MediaPipe APIs failed to initialize")
                self.detector = None
                self.use_tasks_api = False
        
        # Drawing utilities
        try:
            from mediapipe.tasks.python.vision import drawing_utils as du
            from mediapipe.tasks.python.vision import PoseLandmarksConnections as plc
            self.mp_drawing = du
            self.mp_pose_conn = plc
            print("PoseExtractor: Using Tasks Vision drawing utilities")
        except:
            try:
                if hasattr(mp, 'solutions') and hasattr(mp.solutions, 'drawing_utils'):
                    self.mp_drawing = mp.solutions.drawing_utils
                    self.mp_pose_conn = mp.solutions.pose.POSE_CONNECTIONS
                    print("PoseExtractor: Using Solutions drawing utilities")
                else:
                    self.mp_drawing = None
                    print("PoseExtractor: Warning - Drawing utilities not found")
            except:
                self.mp_drawing = None
                print("PoseExtractor: Warning - Drawing utilities failed to load")
        
    def extract_pose(self, frame):
        """Extract pose landmarks from frame"""
        if self.use_tasks_api:
            return self._extract_tasks(frame)
        else:
            return self._extract_solutions(frame)

    def _extract_tasks(self, frame):
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        
        result = self.detector.detect(mp_image)
        
        if result.pose_landmarks:
            # Tasks API returns a list of lists of landmarks (for multiple people)
            # We take the first person
            landmarks_list = result.pose_landmarks[0]
            flat_landmarks = []
            for lm in landmarks_list:
                flat_landmarks.extend([lm.x, lm.y, lm.z])
            return np.array(flat_landmarks), landmarks_list
        return None, None

    def _extract_solutions(self, frame):
        if not hasattr(self, 'pose'): return None, None
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb_frame)
        
        if results.pose_landmarks:
            landmarks = []
            for landmark in results.pose_landmarks.landmark:
                landmarks.extend([landmark.x, landmark.y, landmark.z])
            return np.array(landmarks), results.pose_landmarks
        return None, None
    
    def draw_pose(self, frame, pose_landmarks):
        """Manual drawing of pose landmarks using OpenCV"""
        if not pose_landmarks:
            return frame
            
        h, w, _ = frame.shape
        
        # 33 landmarks for MediaPipe Pose
        # We need a mapping of connections
        # Full 33 landmarks connections matching MediaPipe Topology
        connections = [
            # Khuôn mặt
            (0, 1), (1, 2), (2, 3), (3, 7),
            (0, 4), (4, 5), (5, 6), (6, 8),
            (9, 10),
            # Thân mình
            (11, 12), (11, 23), (12, 24), (23, 24),
            # Tay trái (bao gồm bàn tay)
            (11, 13), (13, 15), (15, 17), (15, 19), (15, 21), (17, 19),
            # Tay phải (bao gồm bàn tay)
            (12, 14), (14, 16), (16, 18), (16, 20), (16, 22), (18, 20),
            # Chân trái (bao gồm bàn chân)
            (23, 25), (25, 27), (27, 29), (27, 31), (29, 31),
            # Chân phải (bao gồm bàn chân)
            (24, 26), (26, 28), (28, 30), (28, 32), (30, 32)
        ]
        
        # Draw connections
        for start_idx, end_idx in connections:
            try:
                if self.use_tasks_api:
                    start_lm = pose_landmarks[start_idx]
                    end_lm = pose_landmarks[end_idx]
                else:
                    start_lm = pose_landmarks.landmark[start_idx]
                    end_lm = pose_landmarks.landmark[end_idx]
                
                start_point = (int(start_lm.x * w), int(start_lm.y * h))
                end_point = (int(end_lm.x * w), int(end_lm.y * h))
                
                cv2.line(frame, start_point, end_point, (0, 255, 0), 2)
            except:
                continue
                
        # Draw landmarks
        for i in range(33):
            try:
                if self.use_tasks_api:
                    lm = pose_landmarks[i]
                else:
                    lm = pose_landmarks.landmark[i]
                
                center = (int(lm.x * w), int(lm.y * h))
                cv2.circle(frame, center, 3, (0, 0, 255), -1)
            except:
                continue
                
        return frame
