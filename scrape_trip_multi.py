# -*- coding: utf-8 -*-
"""
Scraper le catalogue de vehicules de Trip.com (page carhire) pour plusieurs
aeroports, via un vrai Chrome (passe le puzzle anti-bot).

Sauvegarde, pour chaque aeroport :
  - la reponse JSON queryProducts complete
  - un resume {nom, categorie, places, image, prix EUR}

Usage :  python -u scrape_trip_multi.py
"""
import json
import os
import sys
import time

from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

OUT = 'trip_data'
os.makedirs(OUT, exist_ok=True)

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')

# (cle, code, ville, nom ville, lat, lon, pays ISO)
AIRPORTS = [
    ('NRT', 228, 'Tokyo', 'Narita', 35.770178, 140.384322, '31'),
    ('HND', 294, 'Tokyo', 'Haneda', 35.549399, 139.779839, '31'),
    ('CDG', 80,  'Paris', 'Charles de Gaulle', 49.009691, 2.547925, '82'),
    ('ORY', 82,  'Paris', 'Orly', 48.723333, 2.379444, '82'),
    ('MRS', 265, 'Marseille', 'Provence', 43.439327, 5.221465, '82'),
    ('LYS', 262, 'Lyon', 'Saint-Exupery', 45.725556, 5.081111, '82'),
    ('DXB', 1,   'Dubai', 'International', 25.253200, 55.365700, '202'),
    ('CMN', 42,  'Casablanca', 'Mohammed V', 33.367500, -7.589950, '81'),
    ('RAK', 47,  'Marrakech', 'Menara', 31.606900, -8.036300, '81'),
    ('DSS', 43,  'Dakar', 'Blaise Diagne', 14.670000, -17.073333, '76'),
]


def build_url(code, city_id, city, airport, lat, lon, scountry):
    from urllib.parse import quote
    paddr = quote(f'Aeroport {airport} de {city}')
    return (
        'https://fr.trip.com/carhire/online/list?fromPage=Home&channelid=14409'
        '&locale=fr-FR&curr=EUR&scountry=' + scountry +
        '&ptime=2026%2F10%2F06%2011%3A00&rtime=2026%2F10%2F13%2011%3A00'
        f'&pcode={code}&paddress={paddr}&ptype=1&pcity={city_id}'
        f'&pcityname={quote(city)}&plat={lat}&plon={lon}'
        f'&rcode={code}&raddress={paddr}&rtype=1&rcity={city_id}'
        f'&rcityname={quote(city)}&rlat={lat}&rlon={lon}&age=30-60'
    )


def scrape(ctx, key, city, airport, city_id, lat, lon, scountry):
    url = build_url(code=key, city_id=city_id, city=city, airport=airport,
                    lat=lat, lon=lon, scountry=scountry)
    page = ctx.new_page()
    found = []

    def on_response(res):
        try:
            if 'queryProducts' not in res.url:
                return
            if 'json' not in (res.headers or {}).get('content-type', ''):
                return
            body = res.text()
        except Exception:
            return
        if len(body) > 50000:
            found.append((res.url, body))
            print(f'      >> {len(body):>9} o  {res.url.split("/")[-1][:60]}')

    page.on('response', on_response)
    print(f'\n=== {city} / {airport} ({key}) ===')
    try:
        page.goto(url, wait_until='domcontentloaded', timeout=120000)
    except Exception as e:
        print('   ERREUR goto :', type(e).__name__, str(e)[:80])
        page.close()
        return

    page.wait_for_timeout(4000)
    for label in ['Tout accepter', 'Accept all']:
        try:
            b = page.get_by_text(label, exact=False).first
            if b.is_visible(timeout=2500):
                b.click()
                page.wait_for_timeout(1500)
                break
        except Exception:
            pass
    try:
        btn = page.get_by_text('Rechercher', exact=False).first
        if btn.is_visible(timeout=2500):
            btn.click()
    except Exception:
        pass

    best = None
    for _ in range(26):
        page.wait_for_timeout(2500)
        try:
            page.mouse.wheel(0, 2000)
        except Exception:
            pass
        if found:
            best = max(found, key=lambda x: len(x[1]))
            if len(best[1]) > 400000:
                break
        try:
            if page.locator('text=glisser pour terminer').first.is_visible(timeout=700):
                print('   [!] puzzle anti-bot detecte')
                break
        except Exception:
            pass

    if not best:
        print('   -> aucune donnee recuperee')
        page.close()
        return

    path = os.path.join(OUT, f'{key}.json')
    open(path, 'w', encoding='utf-8').write(best[1])
    try:
        d = json.loads(best[1])
        vl = d.get('vehicleList') or []
        uniq = {v.get('name', '').strip() for v in vl if v.get('name')}
        print(f'   OK  {len(best[1]):>9} o | {len(vl)} vehicules | {len(uniq)} uniques -> {path}')
    except Exception as e:
        print('   JSON invalide :', e)
    page.close()


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel='chrome', headless=False,
            args=['--disable-blink-features=AutomationControlled', '--no-sandbox',
                  '--lang=fr-FR'],
        )
        ctx = browser.new_context(
            locale='fr-FR', timezone_id='Europe/Paris',
            viewport={'width': 1536, 'height': 864}, user_agent=UA,
        )
        ctx.add_init_script(
            "Object.defineProperty(navigator,'webdriver',{get:()=>undefined});"
            "Object.defineProperty(navigator,'languages',{get:()=>['fr-FR','fr']});"
            "Object.defineProperty(navigator,'plugins',{get:()=>[1,2,3,4,5]});"
            "window.chrome={runtime:{}};"
        )
        for key, city_id, city, airport, lat, lon, scountry in AIRPORTS:
            if os.path.exists(os.path.join(OUT, f'{key}.json')):
                print(f'\n=== {city} / {airport} : deja telecharge, ignore ===')
                continue
            try:
                scrape(ctx, key, city, airport, city_id, lat, lon, scountry)
            except Exception as e:
                print('   ERREUR :', type(e).__name__, str(e)[:100])
            time.sleep(3)
        browser.close()
    print('\nTermine.')


if __name__ == '__main__':
    main()
