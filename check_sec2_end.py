import json
with open('sec2_fr.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
for d in data:
    if d['idx'] >= 387:
        print(f"P {d['idx']} ({d['style']}): {d['text']}")
