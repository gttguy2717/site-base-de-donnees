import json

with open('doc_content_fr.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

p_count = sum(1 for d in data if d['type'] == 'p')
cell_count = sum(1 for d in data if d['type'] == 'cell')
print(f"Paragraph elements: {p_count}, Cell elements: {cell_count}")

# Print major headings and sections
for d in data:
    if d['type'] == 'p':
        txt = d['text'].strip()
        style = d.get('style', '')
        if any(h in txt.upper() for h in ['REMERCIEMENTS', 'SOMMAIRE', 'LISTE DES', 'RÉSUMÉ', 'ABSTRACT', 'INTRODUCTION', 'PARTIE', 'CONCLUSION', 'BIBLIOGRAPHIE']) or (style.startswith('Heading') or style.startswith('Titre')):
            print(f"[P {d['idx']:3d} | {style:15s}] {txt[:70]}")
