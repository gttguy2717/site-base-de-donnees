import sys
sys.stdout.reconfigure(encoding="utf-8")
from docx import Document
d = Document(r"C:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\rapport-stage\mon-rapport\Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx")
ps = d.paragraphs
print("total paragraphs:", len(ps))
for i in range(600, min(len(ps), 700)):
    p = ps[i]
    t = p.text.strip()
    img = "IMG" if p._p.findall(".//{http://schemas.openxmlformats.org/drawingml/2006/main}blip") else ""
    if t or img:
        print(i, "|", p.style.name, "|", img, "|", t[:150])
