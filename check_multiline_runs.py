from docx import Document

doc = Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

for idx in [2, 6, 97, 105, 106, 141, 148, 198, 201, 202, 270, 539, 612, 658]:
    p = doc.paragraphs[idx]
    print(f"\n=== P[{idx}] ({len(p.runs)} runs) ===")
    for j, r in enumerate(p.runs):
        t_clean = r.text.replace('\n', '\\n').encode('ascii', 'replace').decode('ascii')
        print(f"  r[{j}] (bold={r.bold}): {repr(t_clean[:45])}")
