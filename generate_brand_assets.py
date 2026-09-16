# -*- coding: utf-8 -*-
"""Genere les assets de marque SEO pour Soutarah Group (favicon, apple-touch,
logo HD, carte Open Graph 1200x628). Source : public/logo-soutarah.png (200x200)."""
import sys
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

LOGO_SRC = 'public/logo-soutarah.png'
GREEN_DARK = (23, 61, 35)      # #173d23
GREEN_PRIMARY = (41, 108, 0)   # #296c00
GREEN_LIGHT = (105, 195, 59)   # #69c33b

def font(size, bold=True):
    paths = [r'C:\Windows\Fonts\arialbd.ttf' if bold else r'C:\Windows\Fonts\arial.ttf',
             r'C:\Windows\Fonts\segoeuib.ttf' if bold else r'C:\Windows\Fonts\segoeui.ttf']
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()

def on_white(img, size):
    """Composite un logo RGBA (fond transparent) sur blanc puis RGB."""
    canvas = Image.new('RGB', (size, size), (255, 255, 255))
    res = img.resize((size, size), Image.LANCZOS)
    canvas.paste(res, (0, 0), res)
    return canvas

logo = Image.open(LOGO_SRC).convert('RGBA')

# 1) Favicon ICO (16/32/48) + PNG basse resolution (fond blanc)
ico_sizes = [16, 32, 48]
logo_rgbs = [on_white(logo, s) for s in ico_sizes]
logo_rgbs[0].save('public/favicon.ico', sizes=[(s, s) for s in ico_sizes])
on_white(logo, 32).save('public/favicon-32x32.png')
on_white(logo, 16).save('public/favicon-16x16.png')
print('favicon.ico + 32/16 png OK')

# 2) Apple touch icon 180x180 (fond blanc)
on_white(logo, 180).save('public/apple-touch-icon.png')
print('apple-touch-icon.png OK')

# 3) Logo HD 512x512 (fond blanc)
on_white(logo, 512).save('public/logo-soutarah-512.png')
print('logo-soutarah-512.png OK')

# 4) Carte Open Graph 1200x628
W, H = 1200, 628
card = Image.new('RGB', (W, H), GREEN_DARK)
d = ImageDraw.Draw(card)

# Panneau central blanc arrondi
px0, py0, px1, py1 = 300, 96, 900, 560
d.rounded_rectangle([px0, py0, px1, py1], radius=36, fill=(255, 255, 255))

# Logo au centre du panneau (sur son fond blanc integre)
lg = on_white(logo, 210)
card.paste(lg, ((px0 + px1 - 210) // 2, py0 + 26))

f_name = font(56, bold=True)
f_tag = font(30, bold=False)
f_url = font(26, bold=True)

name = 'SOUTARAH GROUP'
tag = 'BÂTIR DES SOLUTIONS FIABLES'
url = 'www.soutarahgroup.com'

def center(text, fnt, y, fill):
    bbox = d.textbbox((0, 0), text, font=fnt)
    w = bbox[2] - bbox[0]
    d.text(((W - w) // 2, y), text, font=fnt, fill=fill)

center(name, f_name, py0 + 300, GREEN_PRIMARY)
center(tag, f_tag, py0 + 392, GREEN_LIGHT)

# URL en bas a droite (pilule blanche sur fond vert)
d.rounded_rectangle([W - 470, H - 74, W - 24, H - 26], radius=24, fill=(255, 255, 255))
d.text((W - 452, H - 66), url, font=f_url, fill=GREEN_DARK)

card.save('public/og-soutarah.png', optimize=True)
print('og-soutarah.png (1200x628) OK')

print('ASSETS TERMINES')