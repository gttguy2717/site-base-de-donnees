import docx
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

multi_t = []
for i, p in enumerate(doc.paragraphs):
    text = p.text.strip()
    if not text:
        continue
    t_nodes = p._element.xpath('.//*[local-name()="t"]')
    safe = []
    for t in t_nodes:
        ancestors = [a.tag.split('}')[-1] for a in t.iterancestors()]
        if not any(tag in ('drawing', 'pict', 'txbxContent') for tag in ancestors):
            safe.append(t)
    if len(safe) > 1:
        multi_t.append((i, len(safe), text[:50], [t.text for t in safe]))

print(f"Total paragraphs with multiple safe t-nodes: {len(multi_t)}")
for m in multi_t[:30]:
    print(f"P[{m[0]}] ({m[1]} nodes): {repr(m[2])}")
    print("   nodes:", [repr(x[:30]) for x in m[3]])
