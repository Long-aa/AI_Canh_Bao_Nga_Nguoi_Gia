import json

with open('Train_AI_Ngã.ipynb', 'r', encoding='utf-8') as f:
    notebook = json.load(f)

for cell in notebook['cells']:
    if cell['cell_type'] == 'code':
        source = cell['source']
        for i, line in enumerate(source):
            if "!pip install -q fastapi" in line and "supabase" not in line:
                source[i] = line.replace("pyngrok", "pyngrok supabase")
                print("Added supabase to pip install")

with open('Train_AI_Ngã.ipynb', 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=2, ensure_ascii=False)
    f.write('\n')
