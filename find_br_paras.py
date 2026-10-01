import docx
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

br_paras = []
for i, p in enumerate(doc.paragraphs):
    br_list = p._element.xpath('.//*[local-name()="br"]')
    if br_list:
        br_paras.append((i, len(br_list), p.text[:50]))

print(f"Total paragraphs with <w:br>: {len(br_paras)}")
for b in br_paras:
    print(f"P[{b[0]}] ({b[1]} brs): {repr(b[2])}")
