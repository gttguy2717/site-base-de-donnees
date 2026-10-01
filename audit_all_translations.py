import json
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

from trans_part1_front_toc import PART_1
from trans_part2_intro_ch1 import PART_2
from trans_part3_ch2 import PART_3
from trans_part4_ch3 import PART_4
from trans_part5_ch4 import PART_5
from trans_part6_ch5 import PART_6
from trans_part7_ch6_conclusion import PART_7
from trans_part8_detailed_toc import PART_8

combined = {}
for p in [PART_1, PART_2, PART_3, PART_4, PART_5, PART_6, PART_7, PART_8]:
    combined.update(p)

with open('fr_paragraphs_dump.json', encoding='utf-8') as f:
    fr_dump = json.load(f)

errors = []

for item in fr_dump:
    idx = item['para_idx']
    fr = item['text']
    en = combined[idx]
    
    # 1. Check tab match
    if ('\t' in fr) != ('\t' in en):
        errors.append((idx, "Tab mismatch", fr, en))
    elif '\t' in fr:
        fr_after = fr.split('\t')[-1].strip()
        en_after = en.split('\t')[-1].strip()
        if fr_after != en_after:
            errors.append((idx, f"Page number mismatch: FR='{fr_after}' vs EN='{en_after}'", fr, en))
            
    # 2. Check Figure numbers
    fr_fig = re.search(r'Figure\s*(\d+)', fr, re.IGNORECASE)
    en_fig = re.search(r'Figure\s*(\d+)', en, re.IGNORECASE)
    if fr_fig and en_fig:
        if fr_fig.group(1) != en_fig.group(1):
            errors.append((idx, f"Figure number mismatch: FR={fr_fig.group(1)} vs EN={en_fig.group(1)}", fr, en))
    elif fr_fig and not en_fig:
        errors.append((idx, f"Figure missing in EN", fr, en))
        
    # 3. Check Table numbers
    fr_tab = re.search(r'Tableau\s*(\d+)', fr, re.IGNORECASE)
    en_tab = re.search(r'Table\s*(\d+)', en, re.IGNORECASE)
    if fr_tab and en_tab:
        if fr_tab.group(1) != en_tab.group(1):
            errors.append((idx, f"Table number mismatch: FR={fr_tab.group(1)} vs EN={en_tab.group(1)}", fr, en))
    elif fr_tab and not en_tab:
        errors.append((idx, f"Table missing in EN", fr, en))

print(f"Total audit errors: {len(errors)}")
for err in errors:
    print(f"P[{err[0]}]: {err[1]}")
    print(f"  FR: {repr(err[2][:60])}")
    print(f"  EN: {repr(err[3][:60])}")
