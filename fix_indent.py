import json

with open('Train_AI_Ngã.ipynb', 'r', encoding='utf-8') as f:
    notebook = json.load(f)

for cell in notebook['cells']:
    if cell['cell_type'] == 'code':
        source = cell['source']
        for i, line in enumerate(source):
            # Fix the indentation of face_encodings in process_frame
            if "face_encodings = face_recognition.face_encodings(rgb_small_frame, self.current_face_locations)" in line:
                if line.startswith("                face_encodings"):
                    source[i] = line.replace("                face_encodings", "            face_encodings")
                    print("Fixed indentation error!")

with open('Train_AI_Ngã.ipynb', 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=2, ensure_ascii=False)
    f.write('\n')
