import sys
from docx import Document

doc = Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

for t in doc._element.xpath('.//*[local-name()="t"]'):
    txt = t.text or ''
    if 'chapitre' in txt.lower():
        p = t.getparent()
        anc = []
        while p is not None:
            anc.append(p.tag.split('}')[-1])
            p = p.getparent()
        print(f"Text: {repr(txt)} | Ancestors: {' -> '.join(anc[:8])}")
