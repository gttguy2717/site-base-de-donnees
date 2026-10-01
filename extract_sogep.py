# -*- coding: utf-8 -*-
"""Extraire les produits (nom, prix, image, lien) de la categorie SOGEP."""
import html as htmllib
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

h = open('sogep_tube.html', encoding='utf-8', errors='replace').read()

# Chaque produit est dans un <li class="product ..."> (WooCommerce loop)
blocks = re.findall(r'<li\b[^>]*class="[^"]*\bproduct\b[^"]*"[^>]*>(.*?)</li>', h, re.S)
print('blocs produits trouves :', len(blocks))


def clean(s):
    s = re.sub(r'<[^>]+>', ' ', s or '')
    s = htmllib.unescape(s)
    return re.sub(r'\s+', ' ', s).strip()


def price_to_int(txt):
    txt = (txt or '').replace('\xa0', ' ').replace(' ', ' ')
    digits = re.sub(r'[^0-9]', '', txt)
    return int(digits) if digits else 0


produits = []
for b in blocks:
    titre = clean((re.search(r'woocommerce-loop-product__title[^>]*>(.*?)</h', b, re.S) or [None, ''])[1])
    if not titre:
        continue
    prix = clean((re.search(r'woocommerce-Price-amount[^>]*>(.*?)</', b, re.S) or [None, ''])[1])
    img = (re.search(r'<img[^>]+src="([^"]+)"', b) or [None, ''])[1]
    lien = (re.search(r'href="([^"]+)"', b) or [None, ''])[1]
    produits.append({
        'nom': titre,
        'prix_txt': prix,
        'prix': price_to_int(prix),
        'image': img,
        'lien': lien,
    })

print('produits extraits :', len(produits))
print()
for p in produits:
    print(f"- {p['nom'][:62]}")
    print(f"    prix={p['prix']} ({p['prix_txt'][:18]})")
    print(f"    image={p['image'].split('/')[-1] if p['image'] else '(aucune)'}")
    print(f"    lien={p['lien'][:95] if p['lien'] else '(aucun)'}")

json.dump(produits, open('sogep_produits.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print('\n-> sogep_produits.json')
