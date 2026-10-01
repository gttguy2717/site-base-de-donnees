# -*- coding: utf-8 -*-
"""Dernier essai : Chrome en mode VISIBLE avec profil persistant (plus proche d'un
visiteur reel) + acceptation automatique des cookies."""
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
            channel='chrome',
            headless=False,                       # fenetre reelle
            args=['--disable-blink-features=AutomationControlled', '--no-sandbox',
                  '--start-maximized', '--lang=fr-FR'],
        )
        ctx = browser.new_context(
            locale='fr-FR',
            timezone_id='Asia/Tokyo',
            viewport={'width': 1536, 'height': 864},
            user_agent=('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                        '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'),
        )
        ctx.add_init_script(
            "Object.defineProperty(navigator,'webdriver',{get:()=>undefined});"
            "Object.defineProperty(navigator,'languages',{get:()=>['fr-FR','fr']});"
            "Object.defineProperty(navigator,'plugins',{get:()=>[1,2,3,4,5]});"
            "window.chrome={runtime:{}};"
        )
        page = ctx.new_page()

        def on_response(res):
            try:
                if 'json' not in (res.headers or {}).get('content-type', ''):
                    return
                body = res.text()
            except Exception:
                return
            if any(k in body for k in ['carModel', 'vehicleName', 'carList', 'carName', 'modelName']):
                captured.append((res.url, body))
                print(f'  >> API vehicules : {res.url[:110]} ({len(body)} o)')

        page.on('response', on_response)

        print('chargement (fenetre visible)...')
        page.goto(URL, wait_until='domcontentloaded', timeout=120000)
        page.wait_for_timeout(5000)

        # Accepter les cookies si presents
        for label in ['Tout accepter', 'Accept all', 'Accepter']:
            try:
                b = page.get_by_text(label, exact=False).first
                if b.is_visible(timeout=3000):
                    b.click()
                    print('  cookies acceptes')
                    page.wait_for_timeout(2000)
                    break
            except Exception:
                continue

        # Relancer la recherche
        try:
            btn = page.get_by_text('Rechercher', exact=False).first
            if btn.is_visible(timeout=3000):
                btn.click()
                print('  recherche relancee')
        except Exception:
            pass

        for i in range(30):
            page.wait_for_timeout(2500)
            try:
                page.mouse.wheel(0, 2000)
            except Exception:
                pass
            if captured:
                break
            # Cherche un eventuel puzzle a resoudre
            try:
                if page.locator('text=glisser pour terminer').first.is_visible(timeout=800):
                    print(f'  [t={i}] CAPTCHA puzzle toujours affiche')
            except Exception:
                pass

        txt = page.inner_text('body')[:2500]
        open('trip_text2.txt', 'w', encoding='utf-8').write(txt)
        print('\n--- texte visible ---')
        print(txt[:2200])

        if captured:
            url, body = max(captured, key=lambda x: len(x[1]))
            open('trip_carlist.json', 'w', encoding='utf-8').write(body)
            print('\n>>> CAPTURE OK :', url[:120], len(body), 'o')
        else:
            print('\n>>> toujours aucune donnee vehicule')

        page.screenshot(path='trip_page2.png')
        browser.close()


if __name__ == '__main__':
    main()
