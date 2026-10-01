import docx
import json

doc = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

sec0 = []
for i in range(112):
    p = doc.paragraphs[i]
    if p.text.strip():
        sec0.append({
            'idx': i,
            'style': p.style.name,
            'text': p.text
        })

with open('sec0_fr.json', 'w', encoding='utf-8') as f:
    json.dump(sec0, f, ensure_ascii=False, indent=2)

print(f"Section 0 has {len(sec0)} non-empty paragraphs.")
