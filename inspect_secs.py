import json

for sec_num in [2, 3, 4, 5]:
    filename = f'sec{sec_num}_fr.json'
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    outname = f'sec{sec_num}_inspect.txt'
    with open(outname, 'w', encoding='utf-8') as out:
        for d in data:
            out.write(f"=== P {d['idx']} ({d['style']}) ===\n{d['text']}\n\n")
    print(f"Written {len(data)} items to {outname}")
