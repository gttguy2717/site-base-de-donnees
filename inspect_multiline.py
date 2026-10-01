import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('fr_paragraphs_dump.json', encoding='utf-8') as f:
    fr_dump = json.load(f)

multiline = [item for item in fr_dump if '\n' in item['text']]
print(f"Total multiline paragraphs: {len(multiline)}")
for m in multiline:
    lines = [l for l in m['text'].split('\n') if l.strip()]
    print(f"P[{m['para_idx']}]: non-empty lines={len(lines)}, fr={repr(m['text'][:50])}")
