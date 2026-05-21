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
            
            # Trích xuất tọa độ đầu để vẽ nhãn
            l_arr = np.asarray(landmarks).reshape(33, 3)
            head_x = float(l_arr[0, 0])
            head_y = float(l_arr[0, 1])
            
            results.append({
                "id": matched_id, 
                "prediction": prediction, 
                "confidence": confidence,
                "head_coord": (head_x, head_y)
            })
            
            # Keep this state for next frame
            new_states[matched_id] = state
            
        self.person_states = new_states
        return results

    def add_frame(self, landmarks):
        """Compatibility wrapper for single person detection"""
        if landmarks is None:
            return
            
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
        if current_pose.size == 0:
            return "normal", 0.0
            
        landmarks = current_pose.reshape(33, 3)
        x = landmarks[:, 0]
        y = landmarks[:, 1]
        
        head_x, head_y = x[0], y[0]
        shoulder_x = (x[11] + x[12]) / 2
        shoulder_y = (y[11] + y[12]) / 2
        hip_x = (x[23] + x[24]) / 2
        hip_y = (y[23] + y[24]) / 2
        ankle_x = (x[27] + x[28]) / 2
        ankle_y = (y[27] + y[28]) / 2
        
        l_shoulder = landmarks[11][:2]
        r_shoulder = landmarks[12][:2]
        l_hip = landmarks[23][:2]
        r_hip = landmarks[24][:2]
        l_knee = landmarks[25][:2]
        r_knee = landmarks[26][:2]
        l_ankle = landmarks[27][:2]
        r_ankle = landmarks[28][:2]

        def calculate_angle(p1, p2, p3):
            v1 = p1 - p2
            v2 = p3 - p2
            cos_theta = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
            angle = np.arccos(np.clip(cos_theta, -1.0, 1.0))
            return np.degrees(angle)

        left_knee_angle = calculate_angle(l_hip, l_knee, l_ankle)
        right_knee_angle = calculate_angle(r_hip, r_knee, r_ankle)
        left_hip_angle = calculate_angle(l_shoulder, l_hip, l_knee)
        right_hip_angle = calculate_angle(r_shoulder, r_hip, r_knee)

        knee_angle = (left_knee_angle + right_knee_angle) / 2
        hip_angle = (left_hip_angle + right_hip_angle) / 2

        lower_body_visible = abs(ankle_y - hip_y) > 0.1 and hip_y < 0.95
        
        min_y, max_y = np.min(y), np.max(y)
        min_x, max_x = np.min(x), np.max(x)
        full_height = max_y - min_y
        full_width = max_x - min_x
        full_ratio = full_height / (full_width + 1e-6)
        
        # Góc thân người so với phương đứng (Torso Vertical Angle)
        torso_vector = np.array([shoulder_x - hip_x, shoulder_y - hip_y])
        torso_angle_vertical = np.degrees(np.arctan2(abs(torso_vector[0]), abs(torso_vector[1])))
        
        current_center_y = (shoulder_y + hip_y) / 2
        
        # Tính toán vận tốc rơi trọng tâm và rơi của đầu
        cg_velocities = []
        head_velocities = []
        torso_angles = []
        upright_states = []
        
        for i in range(1, len(state["pose_sequence"])):
            prev_p = np.asarray(state["pose_sequence"][i-1]).reshape(33, 3)
            curr_p = np.asarray(state["pose_sequence"][i]).reshape(33, 3)
            
            prev_cg_y = (prev_p[11, 1] + prev_p[12, 1] + prev_p[23, 1] + prev_p[24, 1]) / 4
            curr_cg_y = (curr_p[11, 1] + curr_p[12, 1] + curr_p[23, 1] + curr_p[24, 1]) / 4
            cg_velocities.append(curr_cg_y - prev_cg_y)
            
            head_velocities.append(curr_p[0, 1] - prev_p[0, 1])
            
            # Tính góc thân để phát hiện thay đổi hướng nhanh
            prev_shoulder_x = (prev_p[11, 0] + prev_p[12, 0]) / 2
            prev_shoulder_y = (prev_p[11, 1] + prev_p[12, 1]) / 2
            prev_hip_x = (prev_p[23, 0] + prev_p[24, 0]) / 2
            prev_hip_y = (prev_p[23, 1] + prev_p[24, 1]) / 2
            prev_torso_vector = np.array([prev_shoulder_x - prev_hip_x, prev_shoulder_y - prev_hip_y])
            prev_torso_angle = np.degrees(np.arctan2(abs(prev_torso_vector[0]), abs(prev_torso_vector[1])))
            torso_angles.append(abs(torso_angle_vertical - prev_torso_angle))
            
            # Phát hiện trạng thái đứng thẳng trong quá khứ
            prev_ratio = (np.max(prev_p[:, 1]) - np.min(prev_p[:, 1])) / (np.max(prev_p[:, 0]) - np.min(prev_p[:, 0]) + 1e-6)
            prev_torso_angle = np.degrees(np.arctan2(abs(prev_shoulder_x - prev_hip_x), abs(prev_shoulder_y - prev_hip_y)))
            upright_states.append(prev_ratio > 0.75 and prev_torso_angle < 35)
            
        max_drop_velocity = max(cg_velocities) if cg_velocities else 0.0
        max_head_drop_velocity = max(head_velocities) if head_velocities else 0.0
        avg_drop_velocity = np.mean(cg_velocities) if cg_velocities else 0.0
        
        # Thêm: Tính tổng quãng đường rơi của CG và Đầu để phát hiện ngã từ từ (ngất xỉu)
        total_cg_drop = sum(cg_velocities) if cg_velocities else 0.0
        total_head_drop = sum(head_velocities) if head_velocities else 0.0
        
        # Tính gia tốc (jerk)
        accelerations = []
        for i in range(1, len(cg_velocities)):
            accelerations.append(abs(cg_velocities[i] - cg_velocities[i-1]))
        max_acceleration = max(accelerations) if accelerations else 0.0
        
        # Tính tốc độ thay đổi góc thân
        max_torso_angle_change = max(torso_angles) if torso_angles else 0.0
        
        # Trạng thái nằm ngang (CẢI TIẾN: ratio 0.85 để bao quát ngã chéo, góc 45 độ)
        is_lying = (full_ratio < 0.85) or (torso_angle_vertical > 45)
        
        # Phát hiện chuyển đổi nhanh từ đứng sang nằm (trong 5-10 khung hình gần nhất)
        recent_frames = min(10, len(upright_states))
        was_upright_recently = any(upright_states[-recent_frames:]) if upright_states else False
        rapid_transition = was_upright_recently and is_lying and max_torso_angle_change > 15
        
        # Phát hiện va đập đầu (đầu dừng đột ngột sau khi rơi nhanh)
        head_impact = False
        if len(head_velocities) >= 3:
            for i in range(len(head_velocities) - 2):
                # Tìm pattern: rơi nhanh rồi dừng đột ngột
                if head_velocities[i] > 0.015 and abs(head_velocities[i+1]) < 0.005:
                    head_impact = True
                    break
        
        # Phát hiện tư thế tay chân bất thường khi ngã
        l_elbow_y = y[13]
        r_elbow_y = y[14]
        l_wrist_y = y[15]
        r_wrist_y = y[16]
        arms_spread = abs(l_wrist_y - r_wrist_y) > 0.15 or abs(l_elbow_y - r_elbow_y) > 0.15
        
        # Ngồi ghế
        is_sitting = (knee_angle < 135 and knee_angle > 70) and (hip_angle < 135 and hip_angle > 70) and (torso_angle_vertical < 45) and (full_ratio > 0.70)
        
        # Xác định vùng cao hơn sàn nhà (Giường, Sofa, Võng)
        is_elevated = (current_center_y < 0.68) or (hip_y < 0.72 and shoulder_y < 0.72)
        
        # Nhận diện tư thế nằm võng
        is_hammock_posture = is_lying and (hip_y > head_y + 0.04) and (hip_y > ankle_y + 0.04)
        
        # Forward lean indicates tripping stairs or bending over aggressively
        is_forward_lean = (head_y > shoulder_y and torso_angle_vertical > 45)
        
        # Vấp ngã bậc thang (CẢI TIẾN: Tránh nhận diện nhầm buộc dây giày)
        is_tripping_stairs = (
            (max_drop_velocity > 0.025 or max_head_drop_velocity > 0.025) and 
            (max_acceleration > 0.008 or max_torso_angle_change > 15) and 
            is_forward_lean and
            (head_y >= (hip_y - 0.1)) and 
            not is_elevated
        )
        
        # Té ngã bình thường (CẢI TIẾN: Thêm total_drop và nhạy hơn)
        is_falling_general = (
            is_lying and
            not is_sitting and
            not is_hammock_posture and
            (
                (max_drop_velocity > 0.012 or max_head_drop_velocity > 0.012) or
                (max_acceleration > 0.010) or
                (max_torso_angle_change > 12) or
                (total_head_drop > 0.15) or  # Đặc trưng mới: Ngất xỉu/Trượt ngã từ từ
                (total_cg_drop > 0.15) or    # Đặc trưng mới: Rơi từ từ xuống sàn
                rapid_transition or
                head_impact or
                (arms_spread and max_drop_velocity > 0.008)
            )
        )
        
        # Đi ngủ (CẢI TIẾN: Siết chặt để tránh nhầm ngã thành ngủ)
        is_sleeping = is_lying and (
            (is_elevated and max_drop_velocity < 0.010 and max_acceleration < 0.005 and max_torso_angle_change < 5 and not rapid_transition and not head_impact) or
            (is_hammock_posture and max_drop_velocity < 0.010 and max_acceleration < 0.005 and not rapid_transition) or
            (max_drop_velocity < 0.008 and max_head_drop_velocity < 0.008 and max_acceleration < 0.004 and max_torso_angle_change < 5 and not rapid_transition and not head_impact and total_head_drop < 0.1 and total_cg_drop < 0.1)
        )
        is_falling = False
        is_tripped = False
        confidence = 0.0
        
        if "has_fallen" not in state:
            state["has_fallen"] = False
        if "fall_type" not in state:
            state["fall_type"] = None
        
        if state["last_y_pos"] is not None:
            if is_tripping_stairs:
                state["fall_counter"] += 2
            elif is_falling_general:
                if rapid_transition or head_impact or max_drop_velocity > 0.025:
                    state["fall_counter"] += 2
                else:
                    state["fall_counter"] += 1
            else:
                if state["has_fallen"] and is_lying:
                    pass
                else:
                    state["fall_counter"] = max(0, state["fall_counter"] - 1)
                
            if state["fall_counter"] >= 2:
                if is_tripping_stairs or (state["fall_counter"] >= 3 and torso_angle_vertical > 60) or (state.get("fall_type") == "fall_stairs" and is_lying):
                    is_tripped = True
                    state["fall_type"] = "fall_stairs"
                else:
                    is_falling = True
                    state["fall_type"] = "fall"
                state["has_fallen"] = True
                confidence = min(0.98, 0.70 + (state["fall_counter"] * 0.08))
            else:
                state["has_fallen"] = False
                state["fall_type"] = None
        
        state["last_y_pos"] = current_center_y
        
        if is_tripped:
            return "fall_stairs", confidence
        elif is_falling:
            return "fall", confidence
        elif is_sitting:
            return "sitting", 0.85
        elif is_sleeping:
            return "sleeping", 0.90
            
        return "normal", 0.0

    def reset_sequence(self):
        self.person_states = {}
        self.next_person_id = 0

