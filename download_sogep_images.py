pas regle ca# -*- coding: utf-8 -*-
"""Telecharger les photos SOGEP (pleine resolution) pour le catalogue negoce."""
import json
import os
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

OUT = 'public/img/sogep'
os.makedirs(OUT, exist_ok=True)
HDR = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0',
       'Referer': 'https://sogep-africa.com/'}

produits = json.load(open('sogep_produits.json', encoding='utf-8'))


def slug(s):
    import unicodedata
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').lower()
    return s


def fetch(url, dest):
    req = urllib.request.Request(url, headers=HDR)
    with urllib.request.urlopen(req, timeout=60) as r:
        blob = r.read()
    with open(dest, 'wb') as f:
        f.write(blob)
    return len(blob)


ok = 0
for p in produits:
    nom = slug(p['nom'])[:55]
    src = p.get('image_full') or p.get('image')
    if not src:
        print('  pas d\'image :', p['nom'][:40])
        continue
    ext = os.path.splitext(src.split('?')[0])[1].lower() or '.jpg'
    dest = os.path.join(OUT, nom + ext)
    try:
        n = fetch(src, dest)
        p['image_local'] = f'/img/sogep/{nom}{ext}'
        ok += 1
        print(f'  OK  {n:>8} o  {os.path.basename(dest)}')
    except Exception as e:
        print('  ERR', p['nom'][:40], type(e).__name__, e)

print(f'\ntelecharges : {ok}/{len(produits)}')
# Detection des photos partagees
imgs = {}
for p in produits:
    imgs.setdefault(p.get('image_local', '?'), []).append(p['nom'][:40])
print('\nphotos partagees :')
for k, v in imgs.items():
    if len(v) > 1:
        print('  ', k, '<-', v)
json.dump(produits, open('sogep_produits.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
