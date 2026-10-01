import docx
import sys
sys.stdout.reconfigure(encoding='utf-8')

doc_en = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_ENGLISH.docx')
doc_fr = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

fr_ne = [(i, p.text.strip()) for i, p in enumerate(doc_fr.paragraphs) if p.text.strip()]
en_ne = [(i, p.text.strip()) for i, p in enumerate(doc_en.paragraphs) if p.text.strip()]

# Find the 8 paragraphs in FR that are NOT in EN (including the 6 Genius Pay ones)
# Strategy: walk both lists and detect divergences

GENIUS_PAY_INDICES = {71, 393, 558, 559, 560, 562}

# The total diff is 474 - 468 = 6, so exactly the 6 GP paragraphs
# But the alignment positions diverge more than expected (8 not 6).
# This means EN has some extra paragraphs not in FR in one section.
# Let's find them systematically.

# Walk using content matching
fr_idx = 0
en_idx = 0
pairs = []
skipped_fr = []
extra_en = []

while fr_idx < len(fr_ne) and en_idx < len(en_ne):
    f_i, f_txt = fr_ne[fr_idx]
    e_i, e_txt = en_ne[en_idx]
    
    # Skip known Genius Pay paragraphs in FR
    if f_i in GENIUS_PAY_INDICES:
        skipped_fr.append((f_i, f_txt[:50]))
        fr_idx += 1
        continue
    
    pairs.append((f_i, e_i))
    fr_idx += 1
    en_idx += 1

print(f"Pairs: {len(pairs)}, Skipped FR: {len(skipped_fr)}")
print(f"Remaining FR: {len(fr_ne) - fr_idx}, Remaining EN: {len(en_ne) - en_idx}")

# Check alignment quality - look at every 30th pair
print("\n--- Alignment sample (every 30th pair, last 50 pairs) ---")
for j, (f_i, e_i) in enumerate(pairs):
    if j > len(pairs) - 30:
        f_txt = fr_ne[j + len(skipped_fr[:j+1])][1][:35] if j < len(fr_ne) else ""
        f_txt = doc_fr.paragraphs[f_i].text.strip()[:35]
        e_txt = doc_en.paragraphs[e_i].text.strip()[:35]
        print(f"  [{j:3d}] FR[{f_i:3d}]<->{e_i:3d}: {f_txt}")
        print(f"         {e_txt}")
