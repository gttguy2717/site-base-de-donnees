import json

with open('sec1_fr.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('sec1_inspect.txt', 'w', encoding='utf-8') as out:
    for d in data:
        out.write(f"=== P {d['idx']} ({d['style']}) ===\n{d['text']}\n\n")

print(f"Written {len(data)} items to sec1_inspect.txt")
