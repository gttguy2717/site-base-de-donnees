import docx
import sys
sys.stdout.reconfigure(encoding='utf-8')

doc_fr = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')
doc_en = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_ENGLISH.docx')

fr_ne = [(i, p.text.strip()) for i, p in enumerate(doc_fr.paragraphs) if p.text.strip()]
en_ne = [(i, p.text.strip()) for i, p in enumerate(doc_en.paragraphs) if p.text.strip()]

print(f"FR total: {len(fr_ne)}, EN total: {len(en_ne)}")
print("Difference:", len(fr_ne) - len(en_ne))

# Build exact mapping: iterate both lists simultaneously
# The EN doc doesn't have 6 Genius Pay paragraphs that the FR doc has.
# But it also doesn't have a few other FR-only paragraphs.
# Walk through and find the 6 skipped paragraphs.

GENIUS_PAY_INDICES = {71, 393, 558, 559, 560, 562}

fr_idx = 0
en_idx = 0
pairs = []
skipped_fr = []

while fr_idx < len(fr_ne):
    f_i, f_txt = fr_ne[fr_idx]
    
    if f_i in GENIUS_PAY_INDICES:
        skipped_fr.append((fr_idx, f_i, f_txt[:50]))
        fr_idx += 1
        continue
    
    if en_idx < len(en_ne):
        e_i, e_txt = en_ne[en_idx]
        pairs.append((f_i, e_i, f_txt[:40], e_txt[:40]))
        fr_idx += 1
        en_idx += 1
    else:
        print(f"OVERFLOW at FR[{f_i}]: {f_txt[:50]}")
        break

print(f"\nTotal pairs: {len(pairs)}")
print(f"Skipped FR (Genius Pay): {len(skipped_fr)}")
print(f"Remaining EN: {len(en_ne) - en_idx}")

# Print the tail alignment
print("\n--- Tail alignment check (last 15 pairs) ---")
for f_i, e_i, f_txt, e_txt in pairs[-15:]:
    print(f"FR[{f_i:3d}] == EN[{e_i:3d}]")
    print(f"   FR: {f_txt}")
    print(f"   EN: {e_txt}")
