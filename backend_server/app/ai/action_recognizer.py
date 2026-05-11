import numpy as np
import os
import time

class ActionRecognizer:
    def __init__(self, model_path="edge_device/ai_models/lstm_model.tflite"):
        self.model_available = False
        self.interpreter = None
        
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
            
        self.sequence_length = 30
        # State for multiple people: {person_id: {"pose_sequence": [], "last_y_pos": None, "fall_counter": 0}}
        self.person_states = {}
        self.next_person_id = 0

    def _get_distance(self, p1, p2):
        """Calculate distance between two pose centers (using shoulders and hips)"""
        # Ensure inputs are numpy arrays
        p1 = np.asarray(p1)
        p2 = np.asarray(p2)
        
        # p1 and p2 are landmarks [33*3]
        landmarks1 = p1.reshape(33, 3)
        landmarks2 = p2.reshape(33, 3)
        
        center1 = np.mean(landmarks1[11:25, :2], axis=0) # Shoulders to hips
        center2 = np.mean(landmarks2[11:25, :2], axis=0)
        
        return np.linalg.norm(center1 - center2)

    def process_multi_pose(self, all_landmarks):
        """Process multiple poses and return predictions for each"""
        if not all_landmarks:
            # If no poses detected, we could gradually clear or keep old ones
            # For simplicity, we'll keep them but they won't update
            return []

        results = []
        new_states = {}
        
        # Simple tracking: Match new landmarks to existing states by distance
        for landmarks in all_landmarks:
            matched_id = None
            min_dist = 0.15 # Distance threshold for matching
            
            for pid, state in self.person_states.items():
                if state["pose_sequence"]:
                    dist = self._get_distance(landmarks, state["pose_sequence"][-1])
                    if dist < min_dist:
                        min_dist = dist
                        matched_id = pid
            
            if matched_id is None:
                matched_id = self.next_person_id
                self.next_person_id += 1
                self.person_states[matched_id] = {
                    "pose_sequence": [],
                    "last_y_pos": None,
                    "fall_counter": 0
                }
            
            # Update state for this person
            state = self.person_states[matched_id]
            state["pose_sequence"].append(landmarks)
            if len(state["pose_sequence"]) > self.sequence_length:
                state["pose_sequence"] = state["pose_sequence"][-self.sequence_length:]
            
            # Predict
            prediction, confidence = self._predict_for_person(matched_id)
            results.append({"id": matched_id, "prediction": prediction, "confidence": confidence})
            
            # Keep this state for next frame
            new_states[matched_id] = state
            
        # Optional: Keep states that weren't matched for a few frames? 
        # For now, just replace with currently visible people
        self.person_states = new_states
        return results

    def add_frame(self, landmarks):
        """Compatibility wrapper for single person detection"""
        if landmarks is None:
            return
            
        # Treat this as person_id 0 for compatibility
        if 0 not in self.person_states:
            self.person_states[0] = {
                "pose_sequence": [],
                "last_y_pos": None,
                "fall_counter": 0
            }
        
        state = self.person_states[0]
        state["pose_sequence"].append(landmarks)
        if len(state["pose_sequence"]) > self.sequence_length:
            state["pose_sequence"] = state["pose_sequence"][-self.sequence_length:]

    def predict_action(self):
        """Compatibility wrapper for single person detection"""
        if 0 in self.person_states:
            return self._predict_for_person(0)
        return "normal", 0.0

    def _predict_for_person(self, person_id):
        state = self.person_states[person_id]
        if len(state["pose_sequence"]) < 5:
            return "normal", 0.0
            
        if self.model_available and len(state["pose_sequence"]) >= self.sequence_length:
            return self._predict_lstm(state["pose_sequence"])
        else:
            return self._predict_heuristic(person_id)

    def _predict_lstm(self, sequence):
        try:
            import tensorflow as tf
            input_data = np.array(sequence, dtype=np.float32)
            input_data = np.expand_dims(input_data, axis=0)
            
            self.interpreter.set_tensor(self.input_details[0]['index'], input_data)
            self.interpreter.invoke()
            output_data = self.interpreter.get_tensor(self.output_details[0]['index'])
            
            confidence = float(output_data[0][0])
            prediction = "fall" if confidence > 0.5 else "normal"
            return prediction, confidence
        except:
            return "normal", 0.0

    def _predict_heuristic(self, person_id):
        state = self.person_states[person_id]
        if not state["pose_sequence"]:
            return "normal", 0.0
            
        current_pose = np.asarray(state["pose_sequence"][-1])
        landmarks = current_pose.reshape(33, 3)
        x = landmarks[:, 0]
        y = landmarks[:, 1]
        
        head_y = y[0]
        shoulder_y = (y[11] + y[12]) / 2
        hip_y = (y[23] + y[24]) / 2
        ankle_y = (y[27] + y[28]) / 2
        
        lower_body_visible = abs(ankle_y - hip_y) > 0.1 and hip_y < 0.95
        
        min_y, max_y = np.min(y), np.max(y)
        min_x, max_x = np.min(x), np.max(x)
        full_height = max_y - min_y
        full_width = max_x - min_x
        full_ratio = full_height / (full_width + 1e-6)
        
        current_center_y = (shoulder_y + hip_y) / 2
        
        is_falling = False
        confidence = 0.0
        
        if state["last_y_pos"] is not None:
            velocity = current_center_y - state["last_y_pos"]
            
            horizontal_fall = full_ratio < 0.8
            head_below_hips = head_y >= (hip_y - 0.05) and lower_body_visible
            rapid_drop = velocity > 0.06 and head_y > 0.5
            
            if horizontal_fall or head_below_hips or rapid_drop:
                if head_y > 0.3:
                    state["fall_counter"] += 1
            else:
                state["fall_counter"] = max(0, state["fall_counter"] - 1)
                
            if state["fall_counter"] >= 4:
                is_falling = True
                confidence = min(0.95, 0.7 + (state["fall_counter"] * 0.05))
        
        state["last_y_pos"] = current_center_y
        
        if is_falling:
            return "fall", confidence
            
        return "normal", 0.0

    def reset_sequence(self):
        self.person_states = {}
        self.next_person_id = 0
