import sys
from docx import Document

doc = Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

for idx in [1, 2, 5, 6, 8, 9, 29, 30, 54, 55, 103, 104, 105, 106, 131, 132, 133, 138, 139, 141, 142, 148, 149]:
    p = doc.paragraphs[idx]
    runs_info = [(r.text, r.bold, r.italic) for r in p.runs if r.text]
    print(f"\n--- P[{idx}] ({p.style.name}) has {len(p.runs)} runs: ---")
    for r_txt, b, it in runs_info:
        clean = r_txt.replace('\n', '\\n').encode('ascii', 'replace').decode('ascii')
        print(f"  [bold={b}, italic={it}] {repr(clean[:50])}")
