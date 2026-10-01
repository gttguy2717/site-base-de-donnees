import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('complete_translations.json', encoding='utf-8') as f:
    ct = json.load(f)

for idx in ['2', '141', '142', '143', '144', '148', '149', '658']:
    v = ct.get(idx, 'NOT FOUND')
    lines = v.split('\n') if '\n' in v else [v]
    print(f'P[{idx}]: {len(lines)} lines')
    for i, l in enumerate(lines):
        if l.strip():
            print(f'  line[{i}]: {l[:70]}')
