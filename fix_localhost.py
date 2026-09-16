import os
import glob

src_dir = r"c:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\site-soutarah\src"

modified_count = 0
file_count = 0

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if 'http://localhost:5000' in content:
                # 1. Replace http://localhost:5000/api with /api
                new_content = content.replace('http://localhost:5000/api', '/api')
                # 2. Replace remaining http://localhost:5000 with empty string (for relative URLs like /uploads/...)
                new_content = new_content.replace('http://localhost:5000', '')
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                modified_count += 1
                print(f"Fixed: {os.path.relpath(filepath, src_dir)}")

print(f"\nDone! Modified {modified_count} files.")
