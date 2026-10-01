import docx, sys
sys.stdout.reconfigure(encoding='utf-8')
from docx.oxml.ns import qn

doc_fr = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')
doc_en = docx.Document('Rapport_de_Stage_ENGLISH.docx')

def get_safe_t(para):
    all_t = para._element.findall('.//' + qn('w:t'))
    safe = []
    for t in all_t:
        p = t.getparent()
        in_d = False
        while p is not None:
            tag = p.tag.split('}')[-1] if '}' in p.tag else p.tag
            if tag in ('drawing', 'pict'):
                in_d = True
                break
            if tag == 'p':
                break
            p = p.getparent()
        if not in_d:
            safe.append(t)
    return safe

# Check P[138..145] in BOTH FR and EN
for idx in range(135, 150):
    pfr = doc_fr.paragraphs[idx]
    pen = doc_en.paragraphs[idx]
    safe_fr = get_safe_t(pfr)
    safe_en = get_safe_t(pen)
    if pfr.text.strip() or pen.text.strip():
        print(f'P[{idx}]:')
        print(f'  FR t_nodes: {[(t.text or "")[:30] for t in safe_fr]}')
        print(f'  EN t_nodes: {[(t.text or "")[:30] for t in safe_en]}')
