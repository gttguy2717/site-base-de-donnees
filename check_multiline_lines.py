import docx
import sys

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

doc = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

for idx in [2, 6, 97, 105, 106, 139, 140, 141, 142, 143, 144, 198, 201, 202, 270, 339, 539, 612, 658]:
    p = doc.paragraphs[idx]
    fr_lines = [l for l in p.text.split('\n') if l.strip()]
    en_lines = [l for l in combined[idx].split('\n') if l.strip()]
    print(f"P[{idx}]: FR lines={len(fr_lines)}, EN lines={len(en_lines)}")
    if len(fr_lines) != len(en_lines):
        print("  FR lines:", fr_lines)
        print("  EN lines:", en_lines)
