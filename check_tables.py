import json

with open('tables_fr.json', 'r', encoding='utf-8') as f:
    tables = json.load(f)

for i, t in enumerate(tables):
    print(f"=== Table {i+1} ({len(t)} rows) ===")
    for r_idx, row in enumerate(t):
        row_str = " | ".join([" ".join(cell) for cell in row])
        print(f"  R{r_idx}: {row_str[:90]}")
