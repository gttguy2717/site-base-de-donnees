# -*- coding: utf-8 -*-
"""Recuperer la photo en pleine resolution de chaque produit SOGEP."""
import html as htmllib
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

h = open('sogep_tube.html', encoding='utf-8', errors='replace').read()
produits = json.load(open('sogep_produits.json', encoding='utf-8'))

blocks = re.findall(r'<li\b[^>]*class="[^"]*\bproduct\b[^"]*"[^>]*>(.*?)</li>', h, re.S)
print('blocs :', len(blocks))


def biggest_image(block):
    """Renvoie la plus grande variante : srcset > data-large_image > src."""
    # srcset : on garde la plus grande largeur annoncee
    m = re.search(r'srcset="([^"]+)"', block)
    if m:
        best, best_w = None, -1
        for part in m.group(1).split(','):
            part = part.strip()
            url = part.split()[0] if part.split() else ''
            w = 0
            for tok in part.split():
                if tok.endswith('w'):
                    try:
                        w = int(tok[:-1])
                    except ValueError:
                        w = 0
            if w > best_w:
                best, best_w = url, w
        if best:
            return best
    m = re.search(r'data-large_image="([^"]+)"', block)
    if m:
        return m.group(1)
    m = re.search(r'<img[^>]+src="([^"]+)"', block)
    return m.group(1) if m else ''


for i, (b, p) in enumerate(zip(blocks, produits)):
    img = biggest_image(b)
    p['image_full'] = img
    print(f"{i+1}. {p['nom'][:46]:48s} -> {img.split('/')[-1][:50] if img else '(aucune)'}")

json.dump(produits, open('sogep_produits.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print('\n-> sogep_produits.json mis a jour')
