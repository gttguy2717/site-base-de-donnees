# -*- coding: utf-8 -*-
"""Chercher la vraie photo de chaque produit sur sa page individuelle."""
import json
import os
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HDR = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0',
       'Referer': 'https://sogep-africa.com/'}
OUT = 'public/img/sogep'

produits = json.load(open('sogep_produits.json', encoding='utf-8'))

# Taille de chaque fichier local (pour reperer les doublons)
poids = {}
for fn in os.listdir(OUT):
    poids[fn] = os.path.getsize(os.path.join(OUT, fn))


def biggest_srcset(srcset):
    best, best_w = None, -1
    for part in srcset.split(','):
        part = part.strip()
        bits = part.split()
        if not bits:
            continue
        url = bits[0]
        w = 0
        for tok in bits[1:]:
            if tok.endswith('w'):
                try:
                    w = int(tok[:-1])
                except ValueError:
                    w = 0
        if w > best_w:
            best, best_w = url, w
    return best


for p in produits:
    local = os.path.basename(p.get('image_local', ''))
    cur = poids.get(local, 0)
    try:
        req = urllib.request.Request(p['lien'], headers=HDR)
        with urllib.request.urlopen(req, timeout=60) as r:
            html = r.read().decode('utf-8', 'replace')
    except Exception as e:
        print('  ERR', p['nom'][:40], e)
        continue

    cands = []
    m = re.search(r'<div[^>]+class="[^"]*woocommerce-product-gallery__image[^"]*"[^>]*>\s*<img[^>]+srcset="([^"]+)"', html, re.S)
    if m:
        cands.append(biggest_srcset(m.group(1)))
    m = re.search(r'data-large_image="([^"]+)"', html)
    if m:
        cands.append(m.group(1))
    m = re.search(r'og:image[^>]+content="([^"]+)"', html)
    if m:
        cands.append(m.group(1))

    cands = [c for c in cands if c]
    nouveau = None
    for c in cands:
        ext = os.path.splitext(c.split('?')[0])[1].lower() or '.jpg'
        # si la meme image locale existe deja avec un autre nom, on garde tel quel
        nom_candidat = p['image_local']
        dest = 'public' + nom_candidat
        if os.path.exists(dest):
            nouveau = None
            break
        try:
            req = urllib.request.Request(c, headers=HDR)
            with urllib.request.urlopen(req, timeout=60) as r:
                blob = r.read()
            if len(blob) != cur:
                with open(dest, 'wb') as f:
                    f.write(blob)
                nouveau = (c, len(blob))
                break
        except Exception:
            continue
    print(f"  {p['nom'][:44]:46s} {'PHOTO MISSE A JOUR' if nouveau else 'inchangee'}"
          + (f' ({nouveau[1]} o)' if nouveau else ''))
