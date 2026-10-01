import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

start_idx = int(sys.argv[1]) if len(sys.argv) > 1 else 0
end_idx = int(sys.argv[2]) if len(sys.argv) > 2 else 9999

with open('fr_paragraphs_dump.json', encoding='utf-8') as f:
    fr_dump = json.load(f)

for item in fr_dump:
    idx = item['para_idx']
    if start_idx <= idx <= end_idx:
        print(f"=== P[{idx}] ===")
        print(item['text'])
