# -*- coding: utf-8 -*-
"""Compter les produits dans chaque source : catalogue statique, seeds, API."""
import json
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

print('=== CATALOGUE STATIQUE (front) ===')


def count_js_products(path):
    txt = open(path, encoding='utf-8').read()
    # produits : { ... } au sein du tableau products
    i = txt.find('products:')
    if i < 0:
        return None
    # compte les occurrences d'un champ discriminant d'un produit
    n_nom = len(re.findall(r"\bnom\s*:", txt[i:]))
    n_ref = len(re.findall(r"\bref\s*:", txt[i:]))
    cats = len(re.findall(r"\blabel\s*:", txt[:i]))
    return n_nom, n_ref, cats


for f in ['src/data/legrandCatalog.js', 'src/data/nexansCatalog.js', 'src/data/keteCatalog.js']:
    try:
        r = count_js_products(f)
        print(f'  {f:34s} nom={r[0]:>4}  ref={r[1]:>4}  categories={r[2]:>3}')
    except Exception as e:
        print(f'  {f} : erreur {e}')

print('\n=== SEEDS (serveur) ===')
for f in ['server/scripts/catalog-data/nexansCatalog.cjs', 'server/scripts/catalog-data/keteCatalog.cjs',
          'server/scripts/seed-catalog.cjs', 'server/scripts/seed-initial-catalog.cjs']:
    try:
        txt = open(f, encoding='utf-8').read()
        print(f'  {f:52s} nom={len(re.findall(chr(92) + "bnom" + chr(92) + "s*:", txt)):>4}'
              f'  produits[]={len(re.findall(chr(92) + "bproducts" + chr(92) + "s*:", txt)):>3}')
    except Exception as e:
        print(f'  {f} : erreur {e}')

print('\n=== API ===')
for url, label in [('https://soutarahgroup.com/api/products', 'public /api/products')]:
    try:
        d = json.load(urllib.request.urlopen(url, timeout=90))
        items = d.get('products') or d.get('produits') or []
        print(f'  {label:30s} {len(items)}')
    except Exception as e:
        print(f'  {label} : {e}')
