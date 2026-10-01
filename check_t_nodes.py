import docx
import sys
sys.stdout.reconfigure(encoding='utf-8')
from docx.oxml.ns import qn

doc = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

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

for idx in [2, 141, 142, 143, 144, 148, 149, 150, 151, 152, 153, 658]:
    para = doc.paragraphs[idx]
    safe_t = get_safe_t(para)
    print(f'P[{idx}]: {len(para.runs)} runs, {len(safe_t)} safe_t_nodes')
    for i, t in enumerate(safe_t):
        print(f'  t[{i}]: {repr(t.text[:50])}')
