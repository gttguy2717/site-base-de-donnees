import docx
import json
from difflib import SequenceMatcher

doc_en = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_ENGLISH.docx')
en_paras = [(i, p.text.strip()) for i, p in enumerate(doc_en.paragraphs) if p.text.strip()]

with open('fr_clean_474.json', encoding='utf-8') as f:
    fr_paras = json.load(f)

print(f"Total FR: {len(fr_paras)}, Total EN: {len(en_paras)}")

# Let's align by stepping through
fr_idx = 0
en_idx = 0

aligned = []
unmatched_fr = []

while fr_idx < len(fr_paras) and en_idx < len(en_paras):
    f = fr_paras[fr_idx]
    e = en_paras[en_idx]
    f_txt = f['text'].strip()
    e_txt = e[1]
    
    # Check if this FR is Genius Pay (which doesn't exist in original EN)
    if 'genius pay' in f_txt.lower() or 'passerelle de paiement' in f_txt.lower():
        unmatched_fr.append((fr_idx, f['idx'], f_txt))
        fr_idx += 1
        continue
        
    aligned.append((f['idx'], e[0], f_txt[:40], e_txt[:40]))
    fr_idx += 1
    en_idx += 1

print(f"Aligned: {len(aligned)}")
print(f"Unmatched FR (Genius Pay, etc.): {len(unmatched_fr)}")
for u in unmatched_fr:
    print(f"  FR P[{u[1]}]: {u[2][:60]}")

print(f"Remaining FR: {len(fr_paras) - fr_idx}, Remaining EN: {len(en_paras) - en_idx}")
