# -*- coding: utf-8 -*-
import sys; sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from docx.oxml.ns import qn

# Inspect French doc - paragraphs 525 to 570 (around Genius Pay section)
doc = Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')
print('=== French PART IV - paragraphs 525 to 575 ===')
for i in range(525, 580):
    if i >= len(doc.paragraphs):
        break
    p = doc.paragraphs[i]
    style = p.style.name
    text = p.text.strip()
    has_img = len(p._element.findall('.//' + qn('a:blip'))) > 0
    img_marker = '[IMAGE] ' if has_img else ''
    print(f'[{i}][{style}] {img_marker}{text[:100]}')

print()
# Now inspect English doc around Section II of PART IV
doc_en = Document('Rapport_de_Stage_ENGLISH.docx')
print('=== English PART IV - paragraphs 507 to 545 ===')
for i in range(507, 550):
    if i >= len(doc_en.paragraphs):
        break
    p = doc_en.paragraphs[i]
    style = p.style.name
    text = p.text.strip()
    has_img = len(p._element.findall('.//' + qn('a:blip'))) > 0
    img_marker = '[IMAGE] ' if has_img else ''
    print(f'[{i}][{style}] {img_marker}{text[:100]}')
