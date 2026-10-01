# -*- coding: utf-8 -*-
"""
Construire le catalogue final du site :
  - les 21 vehicules officiels d'origine (tires de soutarah_21_vehicules.sql)
  - les vehicules Trip.com scrapes aujourd'hui (photos a fond blanc)
Les categories reprennent exactement celles utilisees par le frontend.
"""
import json
import os
import re
import statistics
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# --- 1. Les 21 vehicules officiels -----------------------------------------
sql = open('soutarah_21_vehicules.sql', encoding='utf-8').read()
rows = re.findall(r"\n\('([0-9a-f\-]{36})','((?:[^']|'')*)','((?:[^']|'')*)','((?:[^']|'')*)',"
                  r"'((?:[^']|'')*)','((?:[^']|'')*)',(\d+),'((?:[^']|'')*)','((?:[^']|'')*)',"
                  r"([\d.]+),([\d.]+),(\d+),'([A-Z]+)'", sql)
officiels = []
for rid, marque, modele, cat, desc, img, places, carb, trans, p1, p2, dispo, statut in rows:
    officiels.append({
        'id': rid, 'marque': marque, 'modele': modele, 'categorie': cat,
        'description': desc, 'image_url': img, 'places': int(places),
        'carburant': carb, 'transmission': trans,
        'prix': float(p1), 'prix_journalier_entreprise': float(p2),
        'officiel': True,
    })
print('vehicules officiels parses :', len(officiels))
# Categories affichees au client : 6 seulement, pour que la barre de filtre
# reste lisible sur mobile. « Monospace » reste une categorie a part entiere :
# c'est ce qui empeche les MPV 7 places (Picasso, Mazda 5, Premacy, Trumpchi
# M8, Innova...) de retomber dans « Minibus », qui reste reserve aux vans.
CATEGORIES = ['Économiques', 'Berline', 'SUV', 'Monospace', 'Minibus', 'Luxe']

# Categories fines : servent uniquement au calcul du tarif journalier, pour
# qu'une fusion d'affichage ne fasse pas sauter les prix d'un coup.
CATEGORIES_FINES = ['Économiques', 'Citadine', 'Berline', 'Break', 'Monospace',
                    'SUV', '4x4', 'Pick-Up', 'Utilitaires', 'Minibus',
                    'Autocar', 'Luxe', 'Cabriolet', 'Coupé & Sport']

# Table de fusion : categorie fine -> categorie affichee.
FUSION = {
    'Citadine': 'Économiques',
    'Économiques': 'Économiques',
    'Berline': 'Berline',
    'Break': 'Berline',
    'SUV': 'SUV',
    '4x4': 'SUV',
    'Monospace': 'Monospace',
    'Minibus': 'Minibus',
    'Utilitaires': 'Minibus',
    'Autocar': 'Minibus',
    'Luxe': 'Luxe',
    'Cabriolet': 'Luxe',
    'Coupé & Sport': 'Luxe',
    'Pick-Up': 'Luxe',
}

# trip_vehicules.json contient DÉJÀ des libelles normalises par
# build_vehicle_list.py (SUV, Citadine, Monospace, Break, Luxe, Économiques,
# Coupé & Sport, Cabriolet...) : ce sont eux qu'il faut reconnaitre, sinon tout
# tombait sur le defaut « Berline ». Les libelles Trip.com bruts restent
# acceptes pour les anciens exports.
TRIP_TO_SITE = {
    'economiques': 'Économiques', 'micro-voiture': 'Économiques',
    'mini-voiture': 'Économiques', 'voiture econ': 'Économiques',
    'citadine': 'Citadine', 'voiture compacte': 'Citadine',
    'berline': 'Berline', 'berline compacte': 'Berline',
    'berline standard': 'Berline', 'berline moyenne': 'Berline',
    'grande berline': 'Berline', "voiture d'affaires moyenne": 'Berline',
    'break': 'Break', 'wagon': 'Break', 'berline longue': 'Break',
    'monospace': 'Monospace', 'grand monospace': 'Monospace',
    'minivan standard': 'Monospace', 'minivan': 'Monospace',
    'suv': 'SUV', 'suv compact': 'SUV', 'suv moyen': 'SUV', 'suv standard': 'SUV',
    '4x4': '4x4', 'off-road': '4x4',
    'pick-up': 'Pick-Up', 'pickup': 'Pick-Up',
    'utilitaire': 'Utilitaires', 'fourgon': 'Utilitaires',
    'break commercial': 'Utilitaires', 'camionette': 'Utilitaires',
    'camion': 'Utilitaires',
    'minibus': 'Minibus',
    'autocar': 'Autocar', 'bus': 'Autocar',
    'luxe': 'Luxe', 'berline de luxe': 'Luxe', 'voiture de luxe': 'Luxe',
    'limousine': 'Luxe', 'suv de luxe': 'Luxe', 'suv haut de gamme': 'Luxe',
    'luxury': 'Luxe',
    'cabriolet': 'Cabriolet', 'cabrio': 'Cabriolet',
    'coupe & sport': 'Coupé & Sport', 'coupe': 'Coupé & Sport',
    'voiture de sport': 'Coupé & Sport', 'berline sport': 'Coupé & Sport',
    'coupe sport': 'Coupé & Sport',
}

# Fourchettes du marche local (FCFA / jour)
BANDS = {
    'Économiques': (25000, 45000),
    'Citadine': (30000, 55000),
    'Berline': (40000, 90000),
    'Break': (45000, 100000),
    'Monospace': (55000, 130000),
    'SUV': (50000, 110000),
    '4x4': (65000, 140000),
    'Pick-Up': (40000, 75000),
    'Utilitaires': (30000, 70000),
    'Minibus': (70000, 150000),
    'Autocar': (150000, 250000),
    'Luxe': (120000, 450000),
    'Cabriolet': (180000, 450000),
    'Coupé & Sport': (180000, 500000),
}

# --- 3. Vehicules Trip.com -------------------------------------------------
trip = json.load(open('trip_vehicules.json', encoding='utf-8'))
trip = [v for v in trip if v.get('image_url')]
print('vehicules Trip avec image  :', len(trip))


def norm(s):
    s = str(s or '').lower().strip()
    for a, b in [('é', 'e'), ('è', 'e'), ('ê', 'e'), ('ë', 'e'), ('à', 'a'), ('â', 'a'),
                 ('ä', 'a'), ('î', 'i'), ('ï', 'i'), ('ô', 'o'), ('ö', 'o'), ('ù', 'u'),
                 ('û', 'u'), ('ü', 'u'), ('ç', 'c')]:
        s = s.replace(a, b)
    return re.sub(r'\s+', ' ', s)


# --- Categories reelles ------------------------------------------------------
# Trip.com se trompe sur beaucoup de modeles : un Duster et un Patrol en
# « Citadine », un Range Rover en « Citadine », et surtout tous les monospaces
# (Picasso, Mazda 5, Premacy, Trumpchi M8...) ranges dans « Minibus ».
# Cette table, indexee sur norm('marque modele'), prime sur le libelle Trip.
CORRECTIONS = {
    # --- Monospace / MPV : ce n'est PAS un minibus --------------------------
    'citroen picasso': 'Monospace',
    'mazda 5': 'Monospace',
    'mazda premacy': 'Monospace',
    'mazda mpv': 'Monospace',
    'gac trumpchi m8': 'Monospace',
    'gac trumpchi m6': 'Monospace',
    'trumpchi gn8': 'Monospace',
    'denza d9': 'Monospace',
    'dongfeng m4u-tour': 'Monospace',
    'saic maxus g50': 'Monospace',
    'toyota innova': 'Monospace',
    'toyota veloz': 'Monospace',
    'mitsubishi xpander': 'SUV',
    'suzuki ertiga': 'Monospace',
    'hyundai stargazer': 'Monospace',
    'volkswagen touran': 'Monospace',
    'volkswagen sharan': 'Monospace',
    'renault scenic': 'Monospace',
    'nissan lafesta': 'Monospace',
    'kia carnival': 'Monospace',
    'kia carens': 'Monospace',
    'ford galaxy': 'Monospace',
    'honda odyssey': 'Monospace',
    'toyota sienna': 'Monospace',
    'chevrolet spin': 'Monospace',
    'citroen spacetourer': 'Monospace',
    'peugeot traveller': 'Monospace',
    'dacia jogger': 'Monospace',
    'dacia lodgy': 'Monospace',
    'renault espace': 'Monospace',
    'mercedes-benz classe v': 'Monospace',
    'toyota alphard': 'Monospace',
    'toyota alphard deuxieme generation': 'Monospace',
    'toyota alphard troisieme generation': 'Monospace',
    'toyota alphard quatrieme generation': 'Monospace',
    'toyota vellfire': 'Monospace',
    'toyota vellfire deuxieme generation': 'Monospace',
    'toyota vellfire troisieme generation': 'Monospace',
    'toyota 40 vellfire': 'Monospace',
    'toyota voxy': 'Monospace',
    'toyota voxy 2022-2026': 'Monospace',
    'toyota noah': 'Monospace',
    'toyota wish': 'Monospace',
    'toyota estima': 'Monospace',
    'toyota esquire': 'Monospace',
    'toyota sienta': 'Monospace',
    'nissan serena': 'Monospace',
    'nissan cima': 'Monospace',
    'honda step wgn': 'Monospace',
    'honda spike': 'Monospace',
    'honda freed': 'Monospace',
    'mazda biante': 'Monospace',
    'mitsubishi delica': 'Monospace',
    'lexus lm': 'Monospace',

    # --- Utilitaires : fourgons et derives, pas des minibus ------------------
    'citroen berlingo': 'Utilitaires',
    'renault kangoo': 'Utilitaires',
    'dacia dokker': 'Utilitaires',
    'renault express': 'Utilitaires',
    'daihatsu move': 'Utilitaires',
    'daihatsu tanto': 'Utilitaires',
    'suzuki spacia': 'Utilitaires',
    'mitsubishi delica mini': 'Utilitaires',

    # --- Minibus : vrais vans de 9 places et plus ----------------------------
    'mercedes-benz vito': 'Minibus',
    'toyota hiace': 'Minibus',
    'fiat scudo': 'Minibus',
    'toyoto proace': 'Minibus',
    'peugeot boxer': 'Minibus',
    'mercedes sprinter': 'Minibus',
    'iveco daily': 'Minibus',
    'nissan urvan': 'Minibus',

    # --- 4x4 : vrais tout-terrains, ranges a tort en « Citadine » -----------
    'nissan patrol': '4x4',
    'toyota land cruiser': '4x4',
    'toyota prado': '4x4',
    'toyota highlander': '4x4',
    'toyota rush': '4x4',
    'toyota 4runner': '4x4',
    'toyota fj cruiser': '4x4',
    'jeep wrangler': '4x4',
    'land rover defender': '4x4',
    'great wall tank 300': '4x4',
    'great wall tank 500': '4x4',
    'ford bronco': '4x4',
    'byd leopard 5': '4x4',
    'mitsubishi pajero': '4x4',
    'mitsubishi pajero sport': '4x4',
    'suzuki jimny': '4x4',
    'nissan xterra': '4x4',
    'mercedes-benz classe g amg': '4x4',

    # --- SUV : grands 4x4 haut de gamme ranges a tort en « Luxe » -----------
    'land rover range rover sport svr': 'SUV',
    'land rover range rover sport': 'SUV',
    'land rover range rover velar': 'SUV',
    'land rover range rover': 'SUV',
    'land rover vogue': 'SUV',
    'gmc yukon': 'SUV',
    'rox 01': 'SUV',
    'hongqi ehs9': 'SUV',
    'volkswagen teramont': 'SUV',
    'nissan roox': 'SUV',
    'cadillac escalade': 'SUV',
    'volkswagen touareg': 'SUV',
    'porsche cayenne': 'SUV',
    'porsche macan': 'SUV',
    'lamborghini urus': 'SUV',
    'bmw x5': 'SUV',
    'bmw x6': 'SUV',
    'bmw x6 m': 'SUV',
    'bmw x7': 'SUV',
    'lexus rx': 'SUV',
    'lexus nx': 'SUV',
    'jeep grand cherokee l': 'SUV',
    'bentley bentayga': 'SUV',
    'mercedes-benz glc coupé': 'SUV',
    'mercedes-benz glc coupe': 'SUV',
    'jac j7': 'SUV',
    'dongfeng venucia v': 'SUV',
    'venucia grand v dd-i super hybride': 'SUV',
    'hongqi hs5': 'SUV',
    'hongqi hs7': 'SUV',
    'daihatsu rocky': 'SUV',
    'suzuki xbee': 'SUV',
    'suzuki hustler': 'SUV',

    # --- Berline : berlines et berlines compactes ---------------------------
    'suzuki ciaz': 'Berline',
    'kia pegas': 'Berline',
    'dacia logan': 'Berline',
    'renault logan': 'Berline',
    'peugeot 301': 'Berline',
    'toyota vios': 'Berline',
    'honda city': 'Berline',
    'chevrolet aveo': 'Berline',
    'suzuki dzire': 'Berline',
    'mercedes-benz classe e': 'Luxe',
    'mercedes-benz classe s': 'Luxe',
    'bmw m5': 'Luxe',
    'bmw serie 7': 'Luxe',
    'audi a8': 'Luxe',
    'lexus is': 'Luxe',
    'lexus ls': 'Luxe',
    'lexus es': 'Luxe',
    'lexus ct': 'Luxe',
    'infiniti q70': 'Luxe',
    'maserati ghibli': 'Luxe',
    'maserati levante': 'Luxe',
    'hongqi h9': 'Luxe',
    'cadillac sts': 'Luxe',
    'byd han': 'Luxe',
    'polestar 2': 'Luxe',
    'tesla model 3': 'Luxe',
    'skywell auto et5': 'Berline',
    'skywell et5': 'Berline',
    'geely emgrand': 'Berline',
    'geely ec7': 'Berline',
    'chery arrizo 5': 'Berline',
    'jac s3': 'SUV',
    'jac js3': 'SUV',
    'hongqi h5': 'Luxe',
    'trumpchi ga4': 'Berline',
    'mg gt': 'Berline',
    'mg 5': 'Berline',

    # --- Citadine : vraies petites citadines (rangées en Berline par Trip) ---
    'fiat 500': 'Citadine',
    'fiat 500e': 'Citadine',
    'fiat panda': 'Économiques',
    'mini one': 'Citadine',
    'mini cooper': 'Citadine',
    'renault 5': 'Citadine',
    'toyota yaris': 'Citadine',
    'toyota yaris ativ': 'Citadine',
    'toyota yaris cross': 'SUV',
    'toyota gr yaris': 'Citadine',
    'toyota aqua': 'Citadine',
    'toyota vitz‌': 'Citadine',
    'toyota passo': 'Citadine',
    'toyota starlet': 'Économiques',
    'honda fit': 'Citadine',
    'honda fit 2021-2023': 'Citadine',
    'honda insight': 'Citadine',
    'mazda 2': 'Citadine',
    'mazda demio': 'Citadine',
    'renault clio': 'Citadine',
    'nissan note': 'Citadine',
    'nissan sunny': 'Citadine',
    'nissan tiida': 'Citadine',
    'peugeot 208': 'Citadine',
    'peugeot 108': 'Citadine',
    'peugeot 207': 'Citadine',
    'peugeot 308': 'Berline',
    'opel corsa': 'Citadine',
    'opel corsa-e': 'Citadine',
    'opel astra': 'Berline',
    'opel adam': 'Économiques',
    'mg 3': 'Citadine',
    'skoda fabia': 'Citadine',
    'skoda citigo': 'Citadine',
    'skoda scala': 'Citadine',
    'suzuki swift': 'Citadine',
    'suzuki solio': 'Citadine',
    'hyundai i20': 'Citadine',
    'hyundai accent': 'Citadine',
    'hyundai i10': 'Économiques',
    'kia rio': 'Citadine',
    'kia picanto': 'Citadine',
    'kia ceed': 'Berline',
    'dacia sandero': 'Citadine',
    'dacia sandero stepway': 'Citadine',
    'dacia logan mcv': 'Break',
    'nissan micra': 'Citadine',
    'citroen c3': 'Citadine',
    'citroen c4': 'Berline',
    'citroen ds3': 'Citadine',
    'citroen e-c4': 'Citadine',
    'citroen ë-c3': 'Citadine',
    'volkswagen polo': 'Citadine',
    'ford fiesta': 'Citadine',
    'ford figo': 'Citadine',
    'chevrolet spark': 'Économiques',
    'changan yuexiang': 'Citadine',
    'renault twingo': 'Économiques',
    'toyota aygo': 'Économiques',
    'bmw serie 1': 'Citadine',
    'bmw serie 2': 'Citadine',

    # --- Économiques : kei-cars et micro-citations --------------------------
    'subaru stella': 'Économiques',
    'honda n-box': 'Économiques',
    'honda n-wgn': 'Économiques',
    'nissan dayz': 'Économiques',
    'suzuki wagon r': 'Économiques',
    'suzuki alto': 'Économiques',
    'suzuki lapin': 'Économiques',
    'daihatsu canbus': 'Économiques',
    'daihatsu mira': 'Économiques',
    'daihatsu thor': 'Économiques',
    'mitsubishi ek': 'Économiques',
    'toyota roomy': 'Économiques',

    # --- Break : berlines estate -------------------------------------------
    'volvo v60': 'Break',
    'bmw serie 5 touring': 'Break',
    'bmw serie 3 touring': 'Break',
    'bmw serie 2 active tourer': 'Break',
    'subaru levorg': 'Break',
    'subaru levorg layback': 'Break',
    'subaru levorg sti': 'Break',
    'subaru outback': 'Break',
    'toyota corolla touring sports': 'Break',
    'toyota corolla hayon': 'Break',
    'toyota corolla fielder': 'Break',
    'toyota corolla axio': 'Break',
    'audi a5 avant': 'Break',
    'renault talisman': 'Break',
    'skoda octavia': 'Break',
    'skoda superb': 'Break',

    # --- Berline : berlines et berlines compactes ---------------------------
    'volkswagen passat': 'Berline',
    'volkswagen golf': 'Berline',
    'seat leon': 'Berline',
    'hyundai i30': 'Berline',
    'mazda 3': 'Berline',
    'renault megane': 'Berline',
    'toyota corolla': 'Berline',
    'toyota auris': 'Berline',
    'toyota prius': 'Berline',
    'toyota prius iii': 'Berline',
    'toyota prius iv': 'Berline',
    'toyota prius v': 'Berline',
    'honda civic': 'Berline',
    'nissan almera': 'Berline',
    'nissan versa': 'Berline',
    'nissan sentra': 'Berline',
    'nissan sentra e-power': 'Berline',
    'nissan sylphy': 'Berline',
    'nissan altima': 'Berline',
    'nissan maxima': 'Berline',
    'suzuki baleno': 'Berline',
    'mercedes-benz classe a': 'Berline',
    'mercedes-benz classe c': 'Berline',
    'mercedes-benz c180': 'Berline',
    'mercedes-benz cls': 'Berline',
    'mercedes-benz cla': 'Berline',
    'toyota camry': 'Berline',
    'toyota camry septième génération': 'Berline',
    'toyota crown': 'Berline',
    'nissan teana': 'Berline',
    'honda accord': 'Berline',
    'honda grace': 'Berline',
    'bmw serie 3': 'Berline',
    'bmw serie 5': 'Berline',
    'audi a3': 'Berline',
    'audi a4': 'Berline',
    'audi a6': 'Berline',
    'audi a7': 'Berline',
    'byd qin plus': 'Berline',
    'ford fusion': 'Berline',
    'ford taurus': 'Berline',
    'ford escort': 'Berline',
    'renault latitude': 'Berline',
    'kia k3': 'Berline',
    'kia k5': 'Berline',
    'kia optima': 'Berline',
    'kia forte': 'Berline',
    'kia soluto': 'Berline',
    'kia cerato': 'Berline',
    'hyundai elantra': 'Berline',
    'hyundai sonata': 'Berline',
    'mazda 6': 'Berline',
    'citroen elysee': 'Berline',
    'citroen c5': 'Berline',
    'fiat egea': 'Berline',
    'fiat tipo': 'Berline',
    'infiniti q50': 'Berline',
    'volkswagen jetta': 'Berline',
    'mitsubishi attrage': 'Berline',
    'subaru impreza': 'Berline',
    'toyota levin': 'Berline',
    'alfa romeo 159': 'Berline',
    'chery arrizo 5': 'Berline',
    'geely emgrand': 'Berline',
    'geely ec7': 'Berline',
    'skywell auto et5': 'Berline',
    'jaguar xe': 'Berline',

    # --- Cabriolet ----------------------------------------------------------
    'porsche 718 boxster': 'Cabriolet',
    'rolls-royce dawn': 'Cabriolet',
    'bmw serie 4': 'Cabriolet',
    'ford mustang': 'Cabriolet',
    'mini cooper cabriolet': 'Cabriolet',
    'bentley continental gtc': 'Cabriolet',
    'bmw z4': 'Cabriolet',
    'mazda mx-5': 'Cabriolet',
    'daihatsu copen': 'Cabriolet',
    'fiat 500c': 'Cabriolet',

    # --- Coupé & Sport ------------------------------------------------------
    'audi r8': 'Coupé & Sport',
    'audi tt': 'Coupé & Sport',
    'audi rs6': 'Coupé & Sport',
    'mercedes-benz cle': 'Coupé & Sport',
    'mercedes-benz cla amg': 'Coupé & Sport',
    'porsche 911': 'Coupé & Sport',
    'porsche panamera': 'Luxe',
    'lamborghini huracan': 'Coupé & Sport',
    'mclaren 570s': 'Coupé & Sport',
    'chevrolet corvette': 'Coupé & Sport',
    'rolls-royce wraith': 'Coupé & Sport',
    'rolls-royce ghost': 'Luxe',
    'rolls-royce cullinan': 'Luxe',
    'bentley continental gt': 'Coupé & Sport',
    'bentley flying spur': 'Luxe',
    'nissan 370z': 'Coupé & Sport',
    'subaru brz': 'Coupé & Sport',
    'toyota 86': 'Coupé & Sport',
    'lexus lc': 'Coupé & Sport',
    'lexus lc500': 'Coupé & Sport',
}

# Regle de securite : un van de 9 places et plus EST un minibus (Urvan, Hiace,
# Trafic, Vito, Proace...), un monospace de 7 places ne l'est pas. Verifie la
# coherence avec la categorie Trip avant de l'appliquer.
PLACES_MIN = 9


def categorie_site(nom, categorie_trip, places, cle=None):
    """Categorie reelle du vehicule, pour le site."""
    cle = cle if cle is not None else norm(nom)
    cat = CORRECTIONS.get(cle)
    if cat:
        return cat
    base = TRIP_TO_SITE.get(norm(categorie_trip))
    if base is None:
        # Plus de defaut silencieux « Berline » : on devine selon la taille.
        base = 'Minibus' if (places or 0) >= PLACES_MIN else 'Citadine'
    # Garde-fou : 9 places et plus => minibus, sauf les autocars.
    if (places or 0) >= PLACES_MIN and base != 'Autocar':
        return 'Minibus'
    return base


med = statistics.median([v['prix_eur'] for v in trip]) or 50
existants = {norm(o['marque'] + ' ' + o['modele']) for o in officiels}
catalogue = []

# Vehicules refuses par le client (retires du catalogue).
EXCLUS = {norm(x) for x in ['Toyota Cross']}

# Renommages demandes : certain modeles portent un suffixe technique
# ("Avant" = version break) peu clair pour la clientèle.
RENOMMAGES = {norm('Audi A5 Avant'): 'Audi A5'}

for v in trip:
    nom = v['nom'].strip()
    cle = norm(nom)
    if cle in RENOMMAGES:
        nom = RENOMMAGES[cle]
    parts = nom.split(' ', 1)
    marque = parts[0].rstrip('-') if len(parts) > 1 else nom
    modele = parts[1] if len(parts) > 1 else nom
    key = norm(nom)
    if key in existants or cle in EXCLUS:
        continue
    existants.add(key)

    places = int(v.get('places') or 5)
    bagages = int(v.get('bagages') or 2)
    cat_fine = categorie_site(nom, v.get('categorie', ''), places, cle=key)
    # Le tarif se calcule sur la categorie fine (fourchette etale), puis on
    # affiche la categorie fusionnee : fusionner ne change donc aucun prix.
    lo, hi = BANDS[cat_fine]
    f = max(0.55, min(2.0, (v['prix_eur'] / med) if med else 1))
    prix = lo + (hi - lo) * ((f - 0.55) / (2.0 - 0.55))
    if places >= 7:
        prix *= 1.12
    if norm(v.get('transmission', '')).startswith('auto'):
        prix *= 1.05
    prix = int(min(max(int(round(prix / 500.0) * 500), 20000), 600000))
    cat = FUSION[cat_fine]

    trans = v.get('transmission') or 'Automatique'
    carb = v.get('carburant') or 'Essence'
    if not trans or trans in ('null', 'None'):
        trans = 'Automatique'
    if not carb or carb in ('null', 'None'):
        carb = 'Essence'
    desc = f'{places} places • {bagages} bagages • {trans} • {carb} • Assurée'

    catalogue.append({
        'marque': marque, 'modele': modele, 'categorie': cat, 'description': desc,
        'image_url': v['image_url'], 'places': places, 'carburant': carb,
        'transmission': trans, 'prix': prix,
        'prix_journalier_entreprise': int(prix * 0.92),
        'prix_journalier_entreprise_client': int(prix * 0.88),
        'officiel': False,
    })

print('vehicules Trip apres dedoublonnage :', len(catalogue))

# Les 21 officiels gardent leur identite et leur prix, mais leur categorie
# d'affichage est fusionnee elle aussi, sinon ils apparaitraient dans des
# filtres (Utilitaires, Pick-Up, 4x4...) qui n'existent plus pour le client.
for o in officiels:
    o['categorie'] = FUSION.get(o['categorie'], o['categorie'])

# Tout libelle Trip non reconnu est signale : plus de defaut silencieux.
inconnus = {norm(v.get('categorie', '')) for v in trip} - set(TRIP_TO_SITE)
inconnus.discard('')
if inconnus:
    print('⚠ libelles Trip non mappes :', ', '.join(sorted(inconnus)))

# Verification : aucune categorie hors de la liste du site.
hors_liste = {v['categorie'] for v in officiels + catalogue} - set(CATEGORIES)
if hors_liste:
    raise SystemExit('⚠ categorie hors liste : ' + ', '.join(sorted(hors_liste)))

# --- 4. Ecriture du catalogue ---------------------------------------------
final = officiels + catalogue
os.makedirs('server/scripts/catalog-data', exist_ok=True)
out = 'server/scripts/catalog-data/catalogue-trip.cjs'
with open(out, 'w', encoding='utf-8') as f:
    f.write('/**\n')
    f.write(" * SOUTARAH — Catalogue vehicules\n")
    f.write(" *   - 21 vehicules officiels d'origine (parc historique, intact)\n")
    f.write(' *   - Vehicules de marche scrapes sur Trip.com (photos a fond blanc)\n')
    f.write(' * Genere par build_catalogue_trip.py — ne pas editer a la main.\n')
    f.write(' */\n')
    f.write('const VEHICULES = ')
    f.write(json.dumps(final, ensure_ascii=False, indent=2))
    f.write(';\n\n')
    f.write('const OFFICIELS = VEHICULES.filter((v) => v.officiel);\n\n')
    f.write('module.exports = { VEHICULES, OFFICIELS };\n')

print('->', out, 'avec', len(final), 'vehicules')
from collections import Counter
for c, n in Counter(v['categorie'] for v in final).most_common():
    print(f'   {n:>4}  {c}')
prices = [v['prix'] for v in catalogue]
print(f'\nprix FCFA/j (nouveaux) : min={min(prices)} max={max(prices)} '
      f'moy={int(statistics.mean(prices))}')