# -*- coding: utf-8 -*-
"""Inspecter la page SOGEP : produits, images, prix, pagination."""
import re
import sys
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

h = open('sogep_tube.html', encoding='utf-8', errors='replace').read()
print('taille :', len(h))

m = re.search(r'<title>(.*?)</title>', h, re.S)
print('titre  :', m.group(1).strip()[:120] if m else 'aucun')

print('\n--- framework ---')
for pat, label in [('woocommerce', 'WooCommerce'), ('wp-content', 'WordPress'),
                   ('/product/', 'liens produits'), ('add-to-cart', 'bouton panier')]:
    print(f'  {label:16s}: {h.lower().count(pat.lower())}')

# Liens produits
links = set(re.findall(r'href="(https://sogep-africa\.com/product/[^"#?]+)"', h))
print('\n  pages produit distinctes :', len(links))
for l in sorted(links)[:12]:
    print('   ', l)

# Titres de produits (classe woocommerce-loop-product__title)
titles = re.findall(r'class="[^"]*woocommerce-loop-product__title[^"]*"[^>]*>(.*?)</h', h, re.S)
titles = [re.sub(r'<[^>]+>', '', t).strip() for t in titles]
titles = [t for t in titles if t]
print('\n  titres produits trouvés   :', len(titles))
for t in titles[:15]:
    print('   -', t[:80])

# Prix
prices = re.findall(r'class="[^"]*woocommerce-Price-amount[^"]*"[^>]*>(.*?)</', h, re.S)
prices = [re.sub(r'<[^>]+>', '', p).strip() for p in prices if p.strip()]
print('\n  prix trouvés              :', len(prices))
for p in prices[:10]:
    print('   -', p[:40])

# Images produits
imgs = set(re.findall(r'https://sogep-africa\.com/wp-content/uploads/[^"\'\\ ]+?\.(?:jpg|jpeg|png|webp)', h))
print('\n  images uploads            :', len(imgs))
for i in sorted(imgs)[:10]:
    print('   -', i.split('/')[-1][:60])

# Pagination
pages = set(re.findall(r'/page/(\d+)', h))
print('\n  pages numerotees detectees :', sorted(pages)[:15])
