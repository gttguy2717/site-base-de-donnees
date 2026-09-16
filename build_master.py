import os
import sys
from pres_common import init_presentation
from pres_part1 import build_part1
from pres_part2 import build_part2
from pres_part3 import build_part3
from pres_part4 import build_part4
from pres_part5 import build_part5

sys.stdout.reconfigure(encoding='utf-8')

OUTPUT_FILE = "Soutenance_SOUTARAH_David_Sorho_PRO.pptx"

def main():
    print("Initializing high-end presentation builder...")
    prs = init_presentation()

    print("Building Part 1 (Slides 1 to 15)...")
    build_part1(prs)

    print("Building Part 2 (Slides 16 to 27)...")
    build_part2(prs)

    print("Building Part 3 (Slides 28 to 37)...")
    build_part3(prs)

    print("Building Part 4 (Slides 38 to 48)...")
    build_part4(prs)

    print("Building Part 5 (Slides 49 to 50)...")
    build_part5(prs)

    print(f"Total slides generated: {len(prs.slides)}")
    prs.save(OUTPUT_FILE)
    print(f"SUCCESS: High-end presentation saved to '{OUTPUT_FILE}' ({os.path.getsize(OUTPUT_FILE)} bytes).")

if __name__ == "__main__":
    main()
