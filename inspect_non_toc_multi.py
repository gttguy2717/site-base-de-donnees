import docx
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

toc_set = set(
    list(range(30, 53)) +
    list(range(55, 85)) +
    list(range(87, 92)) +
    list(range(715, 808))
)

non_toc_multi = []
for i, p in enumerate(doc.paragraphs):
    if i in toc_set:
        continue
    text = p.text.strip()
    if not text:
        continue
    all_t = p._element.xpath('.//*[local-name()="t"]')
    safe = []
    for t in all_t:
        ancestors = [a.tag.split('}')[-1] for a in t.iterancestors()]
        if not any(tag in ('drawing', 'pict', 'txbxContent') for tag in ancestors):
            safe.append(t)
    if len(safe) > 1:
        non_toc_multi.append((i, len(safe), text[:60], [t.text for t in safe]))

print(f"Total non-TOC paragraphs with multiple safe t-nodes: {len(non_toc_multi)}")
for m in non_toc_multi:
    print(f"P[{m[0]}] ({m[1]} nodes): {repr(m[2])}")
    print("   nodes:", [repr(x[:40]) for x in m[3]])
