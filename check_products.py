# -*- coding: utf-8 -*-
"""Comparer le nombre de produits visibles (negoce) vs le total en base (admin)."""
import json
import sys
import urllib.request
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE = 'https://soutarahgroup.com'


def get(path, token=None):
    req = urllib.request.Request(BASE + path)
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.load(r)


# 1. API publique produits (ce que voit le site)
try:
    pub = get('/api/products')
    produits = pub.get('products') or pub.get('produits') or []
    print('=== API publique /api/products ===')
    print('  produits visibles :', len(produits))
    cats = Counter()
    for p in produits:
        c = p.get('categorie')
        cats[c.get('nom') if isinstance(c, dict) else c] += 1
    for c, n in cats.most_common(30):
        print(f'    {str(c):34s} {n}')
except Exception as e:
    print('  erreur :', e)
    produits = []

# 2. Comparaison avec le referentiel local du catalogue negoce
print('\n=== Referentiel local ===')
try:
    with open('server/scripts/catalog-data/nexansCatalog.cjs', encoding='utf-8') as f:
        txt = f.read()
    print('  nexansCatalog.cjs :', len(txt), 'caracteres')
    import re
    cats = re.findall(r"id:\s*'([^']+)'", txt)
    print('  categories trouvees :', len(set(cats)))
except Exception as e:
    print('  erreur :', e)
