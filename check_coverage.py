import docx
from trans_sec0 import SEC0_TRANS
from trans_sec1 import SEC1_TRANS
from trans_sec2 import SEC2_TRANS
from trans_sec3 import SEC3_TRANS
from trans_sec4 import SEC4_TRANS
from trans_sec5 import SEC5_TRANS

all_trans = {}
all_trans.update(SEC0_TRANS)
all_trans.update(SEC1_TRANS)
all_trans.update(SEC2_TRANS)
all_trans.update(SEC3_TRANS)
all_trans.update(SEC4_TRANS)
all_trans.update(SEC5_TRANS)

doc = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

missing = []
for i, p in enumerate(doc.paragraphs):
    txt = p.text.strip()
    if txt:
        if i not in all_trans:
            has_drawing = any('w:drawing' in r._r.xml for r in p.runs)
            missing.append((i, p.style.name, has_drawing, txt))

print(f"Total translated paragraphs registered: {len(all_trans)}")
print(f"Missing non-empty paragraphs: {len(missing)}")
for idx, style, has_drawing, txt in missing[:40]:
    print(f"P {idx:3d} | style={style:15s} | drawing={has_drawing} | text={repr(txt[:60])}")
