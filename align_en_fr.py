import docx
import json

doc_en = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_ENGLISH.docx')
en_paras = [(i, p.text.strip()) for i, p in enumerate(doc_en.paragraphs) if p.text.strip()]

with open('fr_clean_474.json', encoding='utf-8') as f:
    fr_paras = json.load(f)

print(f"EN non-empty count: {len(en_paras)}")
print(f"FR non-empty count: {len(fr_paras)}")

for j in range(min(30, len(fr_paras))):
    fr_item = fr_paras[j]
    en_item = en_paras[j]
    print(f"FR[{fr_item['idx']:3d}]: {fr_item['text'][:35]} <===> EN[{en_item[0]:3d}]: {en_item[1][:35]}")
