# -*- coding: utf-8 -*-
"""
Telecharger les images Trip.com (PNG a fond transparent) et les convertir en
JPEG blanc (fond blanc explicite) pour le site.
"""
import json
import os
import sys
import time
import urllib.request

from PIL import Image

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

OUT = 'public/img/vehicles_trip'
os.makedirs(OUT, exist_ok=True)
HDR = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0',
       'Referer': 'https://fr.trip.com/'}

data = json.load(open('trip_vehicules.json', encoding='utf-8'))
print('vehicules a traiter :', len(data))


def slug(nom):
    import re
    import unicodedata
    s = unicodedata.normalize('NFD', str(nom))
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = re.sub(r'[^a-zA-Z0-9]+', '_', s).strip('_').lower()
    return s[:60] or 'vehicule'


ok, ko, sans_img = 0, 0, []
for i, v in enumerate(data, 1):
    nom = slug(v['nom'])
    dest = os.path.join(OUT, nom + '.jpg')
    raw = os.path.join(OUT, nom + '.png')
    if os.path.exists(dest):
        v['image_url'] = f'/img/vehicles_trip/{nom}.jpg'
        ok += 1
        continue
    try:
        req = urllib.request.Request(v['image'], headers=HDR)
        with urllib.request.urlopen(req, timeout=60) as r:
            blob = r.read()
        open(raw, 'wb').write(blob)
        im = Image.open(raw).convert('RGBA')
        # Fond blanc explicite (le site n'affiche pas la transparence)
        bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
        bg.alpha_composite(im)
        out = bg.convert('RGB')
        # Redimensionner si trop grand
        if max(out.size) > 900:
            r_ = 900 / max(out.size)
            out = out.resize((int(out.width * r_), int(out.height * r_)), Image.LANCZOS)
        out.save(dest, 'JPEG', quality=86, optimize=True)
        os.remove(raw)
        v['image_url'] = f'/img/vehicles_trip/{nom}.jpg'
        ok += 1
    except Exception as e:
        ko += 1
        sans_img.append((v['nom'], type(e).__name__))
        v['image_url'] = ''
    if i % 40 == 0:
        print(f'  {i}/{len(data)}  ok={ok} ko={ko}')

print(f'\ntelechargees : {ok}  echecs : {ko}')
if sans_img:
    print('echecs :', sans_img[:10])
json.dump(data, open('trip_vehicules.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print('-> trip_vehicules.json mis a jour avec image_url')
