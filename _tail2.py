import sys
sys.stdout.reconfigure(encoding="utf-8")
from docx import Document
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}blip"
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}br"
p = r"C:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\rapport-stage\mon-rapport\Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx"
d = Document(p)
ps = d.paragraphs
print("total", len(ps))
for i in range(690, len(ps)):
    par = ps[i]
    t = par.text.strip()
    img = len(par._p.findall(".//"+A))
    brk = any(b.get(W+"type")=="page" for b in par._p.findall(".//"+W))
    if t or img or brk:
        print(i, "|", par.style.name, "| img=%d"%img, "PGBRK" if brk else "", "|", t[:120])
