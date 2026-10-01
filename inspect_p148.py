import docx
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')
for idx in range(148, 154):
    p = doc.paragraphs[idx]
    safe = [t for t in p._element.xpath('.//*[local-name()="t"]')]
    print(f"P[{idx}]:", [repr(t.text) for t in safe])
