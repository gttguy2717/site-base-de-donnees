# -*- coding: utf-8 -*-
"""Consolider tous les JSON de Trip.com en un catalogue unique de vehicules."""
import json
import os
import re
import sys
from collections import Counter, defaultdict

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SRC = 'trip_data'

# Normalisation des categories Trip.com -> categories du site
CAT_MAP = {
    'micro-voiture': 'Économiques', 'citadine': 'Économiques', 'mini-voiture': 'Économiques',
    'voiture compacte': 'Citadine', 'voiture econ': 'Économiques', 'berline compacte': 'Berline',
    'berline standard': 'Berline', 'berline moyenne': 'Berline', 'grande berline': 'Berline',
    'voiture d\'affaires moyenne': 'Berline', 'voiture de luxe': 'Luxe',
    'luxury': 'Luxe', 'suv de luxe': 'Luxe', 'suv haut de gamme': 'Luxe',
    'suv compact': 'SUV', 'suv moyen': 'SUV', 'suv standard': 'SUV', 'suv': 'SUV',
    'break': 'Break', 'wagon': 'Break', 'berline longue': 'Break',
    'monospace': 'Monospace', 'grand monospace': 'Monospace', 'minivan standard': 'Monospace',
    'minivan': 'Minibus', 'minibus': 'Minibus', 'fourgon': 'Utilitaires',
    'utilitaire': 'Utilitaires', 'break commercial': 'Utilitaires', 'camion': 'Utilitaires',
    'pick-up': 'Pick-Up', 'pickup': 'Pick-Up',
    'coupé': 'Coupé & Sport', 'coupe': 'Coupé & Sport', 'voiture de sport': 'Coupé & Sport',
    'cabrio': 'Cabriolet', 'cabriolet': 'Cabriolet', 'limousine': 'Luxe',
    'berline de luxe': 'Luxe',
}
FALLBACK = 'Citadine'


def norm(s):
    """Minuscules sans accents pour comparer les libelles."""
    s = str(s or '').lower().strip()
    s = re.sub(r'[éèêë]', 'e', s)
    s = re.sub(r'[àâä]', 'a', s)
    s = re.sub(r'[îï]', 'i', s)
    s = re.sub(r'[ôö]', 'o', s)
    s = re.sub(r'[ùûü]', 'u', s)
    s = re.sub(r'[ç]', 'c', s)
    return re.sub(r'\s+', ' ', s)


# Prix par code vehicule : minimum observe sur tous les aeroports
price_by_code = {}
sources = Counter()

for fn in sorted(os.listdir(SRC)):
    if not fn.endswith('.json'):
        continue
    code = fn[:-5]
    d = json.load(open(os.path.join(SRC, fn), encoding='utf-8'))
    for g in d.get('productGroups') or []:
        for p in g.get('productList') or []:
            vc = p.get('vehicleCode')
            if not vc:
                continue
            daily = p.get('lowestPrice') or 0
            for o in p.get('vendorPriceList') or []:
                pi = o.get('priceInfo') or {}
                if pi.get('currentDailyPrice'):
                    daily = daily or pi['currentDailyPrice']
            if daily:
                prev = price_by_code.get(vc)
                if prev is None or daily < prev[0]:
                    price_by_code[vc] = (daily, code)

# Fusion des vehicules par nom normalise
def clean_name(n):
    return re.sub(r'\s+', ' ', str(n or '')).strip()


vehicles = {}
for fn in sorted(os.listdir(SRC)):
    if not fn.endswith('.json'):
        continue
    code = fn[:-5]
    d = json.load(open(os.path.join(SRC, fn), encoding='utf-8'))
    for v in d.get('vehicleList') or []:
        name = clean_name(v.get('name'))
        if not name:
            continue
        key = norm(name)
        pr = price_by_code.get(v.get('vehicleCode'))
        cur = vehicles.get(key)
        if cur is None:
            vehicles[key] = {
                'nom': name,
                'categorie_trip': v.get('groupSubName') or '',
                'places': v.get('passengerNo') or 5,
                'bagages': v.get('luggageNo') or 2,
                'portes': v.get('doorNo') or 5,
                'transmission': v.get('transmissionName') or 'Automatique',
                'carburant': v.get('fuel') or 'Essence',
                'image': v.get('imageUrl') or '',
                'prix_eur': pr[0] if pr else 0,
                'source': [code],
            }
        else:
            sources[name] += 1
            if not cur['image'] and v.get('imageUrl'):
                cur['image'] = v['imageUrl']
            if pr and (not cur['prix_eur'] or pr[0] < cur['prix_eur']):
                cur['prix_eur'] = pr[0]
                cur['source'] = [code]
            if code not in cur['source']:
                cur['source'].append(code)

# Filtre : image + prix
final = [v for v in vehicles.values() if v['image'] and v['prix_eur'] > 0]

# Attribution categorie site
for v in final:
    k = norm(v['categorie_trip'])
    v['categorie'] = CAT_MAP.get(k, FALLBACK)
    del v['categorie_trip']

print('fichiers lus          :', len(os.listdir(SRC)))
print('vehicules uniques      :', len(vehicles))
print('avec image ET prix     :', len(final))
print('images uniques         :', len({v["image"] for v in final}))
print()
print('par categorie :')
for c, n in Counter(v['categorie'] for v in final).most_common():
    print(f'  {n:>4}  {c}')
print()
print('par source :')
for s, n in Counter(s for v in final for s in v['source']).most_common():
    print(f'  {n:>4}  {s}')

prices = [v['prix_eur'] for v in final]
if prices:
    print(f'\nprix EUR : min={min(prices)} max={max(prices)} moy={sum(prices)//len(prices)}')

json.dump(final, open('trip_vehicules.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print('\n-> trip_vehicules.json (', len(final), 'vehicules )')
