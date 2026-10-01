import docx
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc_fr = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')
with open('complete_translations.json', encoding='utf-8') as f:
    ct = json.load(f)

print("Checking paragraph alignment...")
issues = []
for i, p in enumerate(doc_fr.paragraphs):
    fr = p.text.strip()
    if not fr:
        continue
    en = ct.get(str(i), '').strip()
    
    fr_bullets = [c for c in ['❖', '➢', '•', '■'] if c in fr]
    en_bullets = [c for c in ['❖', '➢', '•', '■'] if c in en]
    
    if fr_bullets != en_bullets:
        issues.append((i, "Bullet mismatch", f"FR bullets: {fr_bullets}, EN bullets: {en_bullets}", fr[:60], en[:60]))
    elif len(fr.split('\n')) != len(en.split('\n')):
        issues.append((i, "Newline count mismatch", f"FR newlines: {len(fr.split(chr(10)))}, EN newlines: {len(en.split(chr(10)))}", fr[:60], en[:60]))

print(f"Total issues found: {len(issues)}")
for iss in issues[:30]:
    print(f"P[{iss[0]}] - {iss[1]} ({iss[2]}):")
    print(f"   FR: {repr(iss[3])}")
    print(f"   EN: {repr(iss[4])}")
