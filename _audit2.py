import re, sys, zipfile
sys.stdout.reconfigure(encoding='utf-8')
DOCX = r'c:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\site-soutarah\Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx'
import docx
d = docx.Document(DOCX)
NS = '{http://schemas.openxmlformats.org/drawingml/2006/main}blip'
V = '{urn:schemas-microsoft-com:vml}imagedata'
print('--- paragraphs containing images ---')
for i, p in enumerate(d.paragraphs):
    n = len(p._p.findall('.//' + NS)) + len(p._p.findall('.//' + V))
    if n:
        print(i, '| img', n, '|', p.text.strip()[:70])
print()
print('--- any paragraph text containing Chapitre (body only, idx>400) ---')
for i, p in enumerate(d.paragraphs):
    if re.search(r'^\s*Chapitre', p.text):
        print(i, '|', p.style.name, '|', p.text.strip()[:90])