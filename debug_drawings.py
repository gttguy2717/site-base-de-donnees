from docx import Document
from docx.oxml.ns import qn

doc = Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

def count_visuals(doc, msg):
    d = len(doc._element.findall('.//' + qn('w:drawing')))
    p = len(doc._element.findall('.//' + qn('w:pict')))
    print(f"[{msg}] {d} drawings, {p} picts")
    return d, p

count_visuals(doc, "Start")

# Test 1: textboxes
from build_perfect_english_report import translate_all_textboxes, translate_all_tables, translate_special_multiline_paragraphs, translate_toc_paragraph, translate_single_or_uniform_para

translate_all_textboxes(doc)
count_visuals(doc, "After textboxes")

translate_all_tables(doc)
count_visuals(doc, "After tables")

# Test 3: paragraphs
# Check paragraph loop
with open('complete_translations.json', encoding='utf-8') as f:
    import json
    trans_dict = {int(k): v for k, v in json.load(f).items()}

special_indices = {2, 6, 97, 105, 106, 138, 141, 142, 143, 144, 148, 149, 150, 151, 152, 153, 198, 201, 202, 270, 539, 612, 658}
toc_ranges = list(range(30, 53)) + list(range(55, 85)) + list(range(87, 92)) + list(range(715, 808))
toc_set = set(toc_ranges)

for idx, para in enumerate(doc.paragraphs):
    t = para.text.strip()
    if not t:
        continue
    if idx in special_indices or idx in toc_set:
        continue
    
    # check before and after this para
    d_before = len(doc._element.findall('.//' + qn('w:drawing')))
    if idx in trans_dict:
        translate_single_or_uniform_para(para, trans_dict[idx])
    d_after = len(doc._element.findall('.//' + qn('w:drawing')))
    if d_after < d_before:
        print(f"Drawing lost in paragraph {idx}! Lost {d_before - d_after} drawings! Para text: {para.text[:40]}")
