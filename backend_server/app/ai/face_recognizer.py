import face_recognition
import cv2
import numpy as np
import os
from app.models.database import get_db, ElderlyProfile

class FaceRecognizerAI:
    def __init__(self):
        self.known_face_encodings = []
        self.known_face_names = []
        self.load_profiles()
        self.process_every_n_frames = 5
        self.frame_count = 0
        self.current_face_locations = []
        self.current_face_names = []

    def load_profiles(self):
        print("FaceRecognizerAI: Loading profiles from database...")
        try:
            db = next(get_db())
            profiles = db.query(ElderlyProfile).filter(ElderlyProfile.video_path != None).all()
            
            for p in profiles:
                # Check if video_path exists and is valid
                video_path = p.video_path
                if video_path.startswith('/'):
                    video_path = video_path[1:] # Remove leading slash for local path
                
                full_path = os.path.abspath(os.path.join(os.getcwd(), video_path))
                
                if not os.path.exists(full_path):
                    print(f"FaceRecognizerAI: Video not found for {p.name} at {full_path}")
                    continue

                print(f"FaceRecognizerAI: Processing video for {p.name}...")
                cap = cv2.VideoCapture(full_path)
                success, frame = cap.read()
                frames_checked = 0

                # Scan first 60 frames for the best face
                while success and frames_checked < 60:
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    # Use small frame for encoding speed
                    small_frame = cv2.resize(rgb_frame, (0, 0), fx=0.5, fy=0.5)
                    encodings = face_recognition.face_encodings(small_frame)
                    
                    if encodings:
                        self.known_face_encodings.append(encodings[0])
                        self.known_face_names.append(p.name)
                        print(f"FaceRecognizerAI: Successfully learned face for {p.name}")
                        break
                    success, frame = cap.read()
                    frames_checked += 1
                cap.release()
            
            db.close()
        except Exception as e:
            print(f"FaceRecognizerAI: Error loading profiles: {e}")

    def process_frame(self, frame):
        self.frame_count += 1

        # Only process every N frames to save CPU
        if self.frame_count % self.process_every_n_frames == 0:
            # Resize frame for faster processing
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
            rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

            self.current_face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(rgb_small_frame, self.current_face_locations)

            self.current_face_names = []
            for face_encoding in face_encodings:
                matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding, tolerance=0.5)
                name = "Unknown"

                if True in matches:
                    # Use the first match or could use face_distance for best match
                    first_match_index = matches.index(True)
                    name = self.known_face_names[first_match_index]

                self.current_face_names.append(name)

        # Draw results on the frame
        for (top, right, bottom, left), name in zip(self.current_face_locations, self.current_face_names):
            # Scale back up
            top *= 4; right *= 4; bottom *= 4; left *= 4

            # Draw box
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 255), 2)

            # Draw label
            cv2.rectangle(frame, (left, top - 35), (right, top), (0, 255, 255), cv2.FILLED)
            font = cv2.FONT_HERSHEY_DUPLEX
            cv2.putText(frame, name, (left + 6, top - 6), font, 0.6, (0, 0, 0), 1)

        return frame
