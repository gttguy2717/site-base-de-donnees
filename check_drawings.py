import docx

doc = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')
count = 0
for i, p in enumerate(doc.paragraphs):
    has_drawing = any('w:drawing' in r._r.xml for r in p.runs)
    if has_drawing and p.text.strip():
        count += 1
        print(f"P {i}: text='{p.text[:60]}', runs={len(p.runs)}")
        for j, r in enumerate(p.runs):
            d = 'w:drawing' in r._r.xml
            print(f"   Run {j}: has_drawing={d}, text='{r.text[:30]}'")

print(f"Total paragraphs with drawing AND text: {count}")
