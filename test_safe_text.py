from docx import Document
from docx.oxml.ns import qn

doc = Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

d_start = len(doc._element.findall('.//' + qn('w:drawing')))
p_start = len(doc._element.findall('.//' + qn('w:pict')))
print(f"Start: {d_start} drawings, {p_start} picts")

def safe_replace_text_only(para, new_text):
    """
    Modifies only <w:t> elements.
    Never deletes runs or non-text elements.
    Zero drawings or picts are lost.
    """
    t_nodes = para._element.findall('.//' + qn('w:t'))
    if not t_nodes:
        return
    t_nodes[0].text = new_text
    t_nodes[0].set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    for t in t_nodes[1:]:
        t.text = ''

# Test on ALL paragraphs with drawings
for i, p in enumerate(doc.paragraphs):
    has_d = len(p._element.findall('.//' + qn('w:drawing'))) > 0
    has_p = len(p._element.findall('.//' + qn('w:pict'))) > 0
    if has_d or has_p:
        safe_replace_text_only(p, "Sample english text")

d_end = len(doc._element.findall('.//' + qn('w:drawing')))
p_end = len(doc._element.findall('.//' + qn('w:pict')))
print(f"End: {d_end} drawings, {p_end} picts")
assert d_start == d_end
assert p_start == p_end
print("SUCCESS: 100% of drawings and picts preserved!")
