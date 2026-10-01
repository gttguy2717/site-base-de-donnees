import docx
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

dump = []
for i, p in enumerate(doc.paragraphs):
    text = p.text
    if not text.strip():
        continue
    
    runs_info = []
    for r_idx, r in enumerate(p.runs):
        runs_info.append({
            'idx': r_idx,
            'text': r.text,
            'bold': r.bold,
            'italic': r.italic,
        })
    
    # Check if there are safe t nodes vs total t nodes
    all_t = p._element.xpath('.//*[local-name()="t"]')
    
    dump.append({
        'para_idx': i,
        'text': text,
        'runs': runs_info,
        't_count': len(all_t)
    })

print(f"Total non-empty paragraphs: {len(dump)}")
with open('fr_paragraphs_dump.json', 'w', encoding='utf-8') as f:
    json.dump(dump, f, ensure_ascii=False, indent=2)

print("Saved fr_paragraphs_dump.json")
