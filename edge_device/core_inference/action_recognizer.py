import numpy as np
import tensorflow as tf

class ActionRecognizer:
    def __init__(self, model_path="edge_device/ai_models/lstm_model.tflite"):
        self.interpreter = tf.lite.Interpreter(model_path=model_path)
        self.interpreter.allocate_tensors()
        
        # Get input and output details
        self.input_details = self.interpreter.get_input_details()
        self.output_details = self.interpreter.get_output_details()
        
        # Sequence length for LSTM (typically 30 frames)
        self.sequence_length = 30
        self.pose_sequence = []
        
    def add_frame(self, pose_landmarks):
        """Add pose landmarks to sequence"""
        if pose_landmarks is not None:
            self.pose_sequence.append(pose_landmarks)
            
        # Keep only last sequence_length frames
        if len(self.pose_sequence) > self.sequence_length:
            self.pose_sequence = self.pose_sequence[-self.sequence_length:]
    
    def predict_action(self):
        """Predict action from current sequence"""
        if len(self.pose_sequence) < self.sequence_length:
            return None, 0.0
        
        # Prepare input for model
        input_data = np.array(self.pose_sequence, dtype=np.float32)
        input_data = np.expand_dims(input_data, axis=0)  # Add batch dimension
        
        # Run inference
        self.interpreter.set_tensor(self.input_details[0]['index'], input_data)
        self.interpreter.invoke()
        
        # Get output
        output_data = self.interpreter.get_tensor(self.output_details[0]['index'])
        
        # Process output (assuming binary classification: fall/no_fall)
        confidence = float(output_data[0][0])
        prediction = "fall" if confidence > 0.5 else "normal"
        
        return prediction, confidence
    
    def reset_sequence(self):
        """Reset the pose sequence"""
        self.pose_sequence = []
