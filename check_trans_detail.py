import json, sys
sys.stdout.reconfigure(encoding='utf-8')
with open('complete_translations.json', encoding='utf-8') as f:
    ct = json.load(f)

# P[141] analysis
p141 = ct.get('141', '')
p141_lines = [l for l in p141.split('\n') if l.strip()]
print('P[141] non-empty lines:', len(p141_lines))
for i, l in enumerate(p141_lines):
    print(f'  [{i}]: {l[:80]}')
print()

# P[2] analysis
p2 = ct.get('2', '')
p2_lines = [l for l in p2.split('\n') if l.strip()]
print('P[2] non-empty lines:', len(p2_lines))
for i, l in enumerate(p2_lines):
    print(f'  [{i}]: {l[:80]}')
print()

# P[658] analysis
p658 = ct.get('658', '')
p658_lines = [l for l in p658.split('\n') if l.strip()]
print('P[658] non-empty lines:', len(p658_lines))
for i, l in enumerate(p658_lines):
    print(f'  [{i}]: {l[:80]}')
print()

# P[148] analysis
p148 = ct.get('148', '')
p148_lines = [l for l in p148.split('\n') if l.strip()]
print('P[148] non-empty lines:', len(p148_lines))
for i, l in enumerate(p148_lines):
    print(f'  [{i}]: {l[:80]}')
