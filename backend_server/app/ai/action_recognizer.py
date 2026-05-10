import numpy as np
import os
import time

class ActionRecognizer:
    def __init__(self, model_path="edge_device/ai_models/lstm_model.tflite"):
        self.model_available = False
        self.interpreter = None
        
        # Try to load TFLite model if it exists
        if os.path.exists(model_path):
            try:
                import tensorflow as tf
                self.interpreter = tf.lite.Interpreter(model_path=model_path)
                self.interpreter.allocate_tensors()
                self.input_details = self.interpreter.get_input_details()
                self.output_details = self.interpreter.get_output_details()
                self.model_available = True
                print(f"AI Model loaded successfully from {model_path}")
            except Exception as e:
                print(f"Failed to load AI model: {e}")
        else:
            print(f"AI Model not found at {model_path}. Using heuristic fallback.")
            
        # Sequence length for LSTM
        self.sequence_length = 30
        self.pose_sequence = []
        self.last_y_pos = None
        self.fall_counter = 0
        
    def add_frame(self, pose_landmarks):
        """Add pose landmarks to sequence"""
        if pose_landmarks is not None:
            self.pose_sequence.append(pose_landmarks)
            
        # Keep only last sequence_length frames
        if len(self.pose_sequence) > self.sequence_length:
            self.pose_sequence = self.pose_sequence[-self.sequence_length:]
    
    def predict_action(self):
        """Predict action from current sequence"""
        if len(self.pose_sequence) < 5: # Need at least 5 frames for heuristic
            return "normal", 0.0
            
        if self.model_available and len(self.pose_sequence) >= self.sequence_length:
            return self._predict_lstm()
        else:
            return self._predict_heuristic()

    def _predict_lstm(self):
        """Predict using LSTM model"""
        try:
            import tensorflow as tf
            input_data = np.array(self.pose_sequence, dtype=np.float32)
            input_data = np.expand_dims(input_data, axis=0)
            
            self.interpreter.set_tensor(self.input_details[0]['index'], input_data)
            self.interpreter.invoke()
            output_data = self.interpreter.get_tensor(self.output_details[0]['index'])
            
            confidence = float(output_data[0][0])
            prediction = "fall" if confidence > 0.5 else "normal"
            return prediction, confidence
        except:
            return self._predict_heuristic()

    def _predict_heuristic(self):
        """
        Rule-based fallback for fall detection using MediaPipe 33 landmarks.
        Refined heuristics:
        1. Torso orientation (Angle/Ratio)
        2. Relative position of head vs hips
        3. Vertical velocity of body center
        """
        if not self.pose_sequence:
            return "normal", 0.0
            
        current_pose = self.pose_sequence[-1]
        
        # Reshape to (33, 3) -> [x, y, z] for each landmark
        landmarks = current_pose.reshape(33, 3)
        
        # Extract coordinates for readability
        x = landmarks[:, 0]
        y = landmarks[:, 1]
        
        # 1. Bounding box ratio (Full Body)
        # Note: MediaPipe Y increases downwards (0 = top, 1 = bottom)
        min_y, max_y = np.min(y), np.max(y)
        min_x, max_x = np.min(x), np.max(x)
        
        full_height = max_y - min_y
        full_width = max_x - min_x
        full_ratio = full_height / (full_width + 1e-6)
        
        # 2. Torso specific analysis (Shoulders 11, 12 and Hips 23, 24)
        shoulder_y = (y[11] + y[12]) / 2
        hip_y = (y[23] + y[24]) / 2
        torso_height = abs(hip_y - shoulder_y)
        
        shoulder_x_dist = abs(x[11] - x[12])
        hip_x_dist = abs(x[23] - x[24])
        torso_width = max(shoulder_x_dist, hip_x_dist)
        
        # 3. Head (0) position relative to hips (23, 24)
        # If head is lower than hips, it's a very strong indicator of falling/lying down
        head_below_hips = y[0] > (hip_y - 0.1) # Tolerance of 0.1
        
        # 4. Vertical velocity (Body Center - Average of shoulders and hips)
        current_center_y = (shoulder_y + hip_y) / 2
        
        is_falling = False
        confidence = 0.0
        
        if self.last_y_pos is not None:
            velocity = current_center_y - self.last_y_pos # Positive means moving down
            
            # CONDITION A: Rapid downward movement followed by horizontal state
            # full_ratio < 1.0 means width > height (lying down)
            if full_ratio < 0.8: 
                # If moving down or already low
                if velocity > 0.02 or current_center_y > 0.5:
                    if head_below_hips or full_ratio < 0.6:
                        self.fall_counter += 1
                
                if self.fall_counter > 3: # Need to stay in this state for a bit
                    is_falling = True
                    confidence = min(0.9, 0.5 + (1.0 - full_ratio))
            else:
                # Gradually decrease counter if person is upright
                self.fall_counter = max(0, self.fall_counter - 1)
        
        self.last_y_pos = current_center_y
        
        if is_falling:
            return "fall", confidence
        
        # Return normal but with a low "danger" confidence if they are getting low
        danger_score = 0.0
        if full_ratio < 1.0:
            danger_score = (1.0 - full_ratio) * 0.5
            
        return "normal", danger_score

    def reset_sequence(self):
        """Reset the pose sequence"""
        self.pose_sequence = []
        self.last_y_pos = None
        self.fall_counter = 0
