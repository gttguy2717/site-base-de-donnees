# -*- coding: utf-8 -*-
"""Controle final de la mise en ligne : flotte exacte + refus du panier."""
import json
import sys
import urllib.error
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace', line_buffering=True)

BASE = 'https://soutarahgroup.com/api'


def get(path):
    return json.load(urllib.request.urlopen(BASE + path, timeout=90))


def post(path, body):
    req = urllib.request.Request(
        BASE + path, data=json.dumps(body).encode(),
        headers={'Content-Type': 'application/json'}, method='POST')
    try:
        r = urllib.request.urlopen(req, timeout=90)
        return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        raw = e.read().decode('utf-8', 'replace')
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, raw[:200]


v = get('/vehicles')['vehicles']
print('=== FLOTTE EN LIGNE : %d vehicules ===' % len(v))

blanche = set()
cfg = json.load(open('shared/flotte-officielle.json', encoding='utf-8'))


def norm(s):
    import unicodedata
    s = ''.join(c for c in unicodedata.normalize('NFD', str(s or ''))
                if unicodedata.category(c) != 'Mn')
    return ' '.join(''.join(c if c.isalnum() or c == ' ' else ' ' for c in s.lower()).split())


for n in cfg['vehicules']:
    blanche.add(norm(n))
pre = [norm(x) for x in cfg['variantesPrefixe']]
exc = set(norm(x) for x in cfg['variantesExclues'])
places = set(cfg['placesToujoursGardes'])
eq = {norm(a): norm(b) for a, b in cfg.get('equivalents', {}).items()}


def attendu(nom, p):
    if p in places:
        return True
    if nom in exc:
        return False
    if nom in blanche:
        return True
    r = eq.get(nom)
    if r and r in blanche:
        return True
    return any(nom == q or nom.startswith(q + ' ') for q in pre)


intruses, manquants = [], []
for x in v:
    nom = norm('%s %s' % (x['marque'], x['modele']))
    if not attendu(nom, int(x['places'])):
        intruses.append('%s %s' % (x['marque'], x['modele']))

noms_en_ligne = {norm('%s %s' % (x['marque'], x['modele'])) for x in v}
for n in cfg['vehicules']:
    if norm(n) not in noms_en_ligne:
        manquants.append(n)

print('\nIntrus (hors liste, ne doivent PAS etre la) : %d' % len(intruses))
for i in intruses[:15]:
    print('   !', i)
print('\nDemandes mais absents : %d' % len(manquants))
for m in manquants[:15]:
    print('   -', m)

print('\n=== PANIER : refus des vehicules hors catalogue ===')
# /availability est une route GET ; un ID inexistant doit renvoyer 404 + message.
for libelle, url in [
        ('ID inexistant', '/vehicles/00000000-0000-0000-0000-000000000000'
                          '/availability?startAt=2026-11-01&endAt=2026-11-05')]:
    try:
        r = urllib.request.urlopen(BASE + url, timeout=60)
        print('   %-14s -> HTTP %s %s' % (libelle, r.status, r.read()[:120]))
    except urllib.error.HTTPError as e:
        raw = e.read().decode('utf-8', 'replace')
        print('   %-14s -> HTTP %s' % (libelle, e.code))
        print('      %s' % raw[:220])

vehicule = v[0]
try:
    r = urllib.request.urlopen(BASE + '/vehicles/%s/availability'
                               '?startAt=2026-11-01&endAt=2026-11-05' % vehicule['id'],
                               timeout=60)
    print('\n   vehicule autorise  -> HTTP %s %s' % (r.status, r.read().decode()[:120]))
except urllib.error.HTTPError as e:
    print('\n   vehicule autorise  -> HTTP %s %s' % (e.code, e.read().decode()[:120]))

print('\n=== SITE ===')
for path in ('/', '/services/location-vehicules'):
    try:
        r = urllib.request.urlopen('https://soutarahgroup.com' + path, timeout=60)
        print('   %-32s HTTP %s' % (path, r.status))
    except Exception as ex:
        print('   %-32s ERREUR %s' % (path, ex))

print('\n' + ('CONTROLE REUSSI' if not intruses and not manquants else 'A CORRIGER'))