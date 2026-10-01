import docx
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')
same_r = 0
for p_idx, p in enumerate(doc.paragraphs):
    for r_idx, r in enumerate(p.runs):
        has_br = bool(r._r.xpath('.//*[local-name()="br"]'))
        has_t = bool(r._r.xpath('.//*[local-name()="t"]'))
        if has_br and has_t:
            same_r += 1
            print(f"P[{p_idx}] r[{r_idx}] has BOTH br and t: text={repr(r.text)}")

print(f"Total runs with BOTH br and t: {same_r}")
