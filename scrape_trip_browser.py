# -*- coding: utf-8 -*-
"""Charger la page carhire de Trip.com dans un vrai navigateur et intercepter
la reponse XHR qui contient la liste des vehicules + leurs photos."""
import json
import sys

from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

URL = ('https://fr.trip.com/carhire/online/list?fromPage=Home&channelid=14409&locale=fr-FR'
       '&curr=EUR&scountry=31&ptime=2026%2F10%2F06%2011%3A00&rtime=2026%2F10%2F13%2011%3A00'
       '&pcode=NRT&paddress=A%C3%A9roport%20international%20de%20Narita&ptype=1&pcity=228'
       '&pcityname=Tokyo&plat=35.770178&plon=140.384322&rcode=NRT'
       '&raddress=A%C3%A9roport%20international%20de%20Narita&rtype=1&rcity=228'
       '&rcityname=Tokyo&rlat=35.770178&rlon=140.384322&age=30-60')

captured = []


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel='chrome',          # utilise le Chrome deja installe
            headless=True,
            args=['--disable-blink-features=AutomationControlled', '--no-sandbox'],
        )
        ctx = browser.new_context(
            locale='fr-FR',
            timezone_id='Asia/Tokyo',
            viewport={'width': 1440, 'height': 900},
            user_agent=('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                        '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'),
        )
        # Neutralise l'empreinte automation
        ctx.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>undefined});")
        page = ctx.new_page()

        def on_response(res):
            try:
                if 'json' not in (res.headers or {}).get('content-type', ''):
                    return
                body = res.text()
            except Exception:
                return
            if any(k in body for k in ['carModel', 'vehicleName', 'carList', 'supplierName',
                                       'carName', 'modelName']):
                captured.append((res.url, body))
                print(f'  >> CAPTCHA L\'API : {res.url[:110]}  ({len(body)} o)')

        page.on('response', on_response)

        print('chargement...')
        page.goto(URL, wait_until='domcontentloaded', timeout=120000)
        print('  titre :', page.title()[:100])

        for _ in range(24):
            page.wait_for_timeout(2500)
            try:
                page.mouse.wheel(0, 2200)
            except Exception:
                pass
            if captured:
                break

        # Sauvegarde HTML + texte pour inspection
        html = page.content()
        open('trip_rendered.html', 'w', encoding='utf-8').write(html)
        print('HTML rendu :', len(html), 'octets -> trip_rendered.html')

        txt = page.inner_text('body')[:1500]
        open('trip_text.txt', 'w', encoding='utf-8').write(txt)
        print('\n--- texte visible (1500 premiers car.) ---')
        print(txt)

        if captured:
            url, body = max(captured, key=lambda x: len(x[1]))
            open('trip_carlist.json', 'w', encoding='utf-8').write(body)
            print('\n>>> reponse capturee :', url[:120])
            print('>>> taille :', len(body), '-> trip_carlist.json')
        else:
            print('\n>>> aucune reponse vehicule capturee')

        page.screenshot(path='trip_page.png', full_page=False)
        browser.close()


if __name__ == '__main__':
    main()
