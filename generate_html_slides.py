import os
import sys
import base64
import subprocess
from PIL import Image

def get_base64_image(file_path):
    if not os.path.exists(file_path):
        print(f"Warning: {file_path} not found")
        return ""
    ext = os.path.splitext(file_path)[1].lower().replace('.', '')
    if ext == 'jpg':
        ext = 'jpeg'
    mime = f"image/{ext}"
    with open(file_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode('utf-8')
    return f"data:{mime};base64,{encoded}"

# Crop logo if needed
if os.path.exists("public/logo-soutarah.png"):
    im = Image.open("public/logo-soutarah.png")
    bbox = im.getbbox()
    if bbox:
        cropped = im.crop((max(0, bbox[0]-6), max(0, bbox[1]-6), min(im.width, bbox[2]+6), min(im.height, bbox[3]+6)))
        cropped.save("public/logo_cropped.png")

logo_b64 = get_base64_image("public/logo_cropped.png")
car_b64 = get_base64_image("public/img/carPlay.jpg")
negoce_b64 = get_base64_image("public/img/Negoce-ie.jpg")
tech_b64 = get_base64_image("public/img/tecg.jpeg")
energie_b64 = get_base64_image("public/img/energ.jpeg")
agro_b64 = get_base64_image("public/img/fermi.jpeg")
immo_b64 = get_base64_image("public/img/description_immobilier.jpeg")

services = [
    {
        "num": "01",
        "title": "Location de véhicules",
        "tag": "Mobilité & Flotte",
        "desc": "Flotte de 21 véhicules (SUV, Berlines, 4x4, Utilitaires) avec option chauffeur.",
        "img": car_b64,
        "alt": "Location de véhicules Soutarah"
    },
    {
        "num": "02",
        "title": "Négoce & import-export",
        "tag": "Commerce International",
        "desc": "Approvisionnement et distribution d'équipements industriels et consommables.",
        "img": negoce_b64,
        "alt": "Négoce et import-export Soutarah"
    },
    {
        "num": "03",
        "title": "Prestations techniques",
        "tag": "Ingénierie & BTP",
        "desc": "Installations électriques, maintenance industrielle, réseaux et travaux BTP.",
        "img": tech_b64,
        "alt": "Prestations techniques Soutarah"
    },
    {
        "num": "04",
        "title": "Énergies renouvelables",
        "tag": "Solaire & Transition",
        "desc": "Solutions solaires photovoltaïques et optimisation de l'efficacité énergétique.",
        "img": energie_b64,
        "alt": "Énergies renouvelables Soutarah"
    },
    {
        "num": "05",
        "title": "Agropastorale",
        "tag": "Agriculture & Élevage",
        "desc": "Production agricole durable, intrants et élevage à haute valeur ajoutée.",
        "img": agro_b64,
        "alt": "Agropastorale Soutarah"
    },
    {
        "num": "06",
        "title": "Immobilier",
        "tag": "Gestion & Promotion",
        "desc": "Gestion locative, vente et valorisation de biens immobiliers professionnels.",
        "img": immo_b64,
        "alt": "Immobilier Soutarah"
    }
]

# -------------------------------------------------------------
# VARIANT 1: 3 Columns x 2 Rows Modern Cards
# -------------------------------------------------------------
html_v1 = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Soutarah Group - Services Presentation</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body {{
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    background-color: #FFFFFF;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #0F172A;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px 75px 44px 75px;
    position: relative;
  }}

  /* Elegant background ambient glow */
  body::before {{
    content: '';
    position: absolute;
    top: -140px;
    right: -140px;
    width: 550px;
    height: 550px;
    background: radial-gradient(circle, rgba(16, 124, 65, 0.07) 0%, rgba(255,255,255,0) 70%);
    border-radius: 50%;
    z-index: 0;
  }}

  body::after {{
    content: '';
    position: absolute;
    bottom: -140px;
    left: -140px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(255,255,255,0) 70%);
    border-radius: 50%;
    z-index: 0;
  }}

  /* Top Header */
  .header {{
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 22px;
    border-bottom: 1.5px solid #F1F5F9;
  }}

  .header-left {{
    max-width: 1350px;
  }}

  .category-badge {{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #ECFDF5;
    color: #065F46;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 20px;
    margin-bottom: 10px;
    border: 1px solid #A7F3D0;
  }}

  .category-badge::before {{
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #107C41;
  }}

  .header-title {{
    font-size: 36px;
    font-weight: 800;
    line-height: 1.2;
    color: #0F172A;
    letter-spacing: -0.7px;
  }}

  .header-subtitle {{
    font-size: 17.5px;
    font-weight: 500;
    color: #64748B;
    margin-top: 6px;
  }}

  .header-right {{
    display: flex;
    align-items: center;
  }}

  .logo-wrapper {{
    background: #FFFFFF;
    padding: 12px 22px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
    border: 1.5px solid #E2E8F0;
    display: flex;
    align-items: center;
    gap: 12px;
  }}

  .logo-img {{
    height: 46px;
    width: auto;
    object-fit: contain;
  }}

  /* Services Grid 3x2 */
  .services-grid {{
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 26px 26px;
    margin: 22px 0 20px 0;
  }}

  .service-card {{
    background: #FFFFFF;
    border-radius: 20px;
    overflow: hidden;
    border: 1.5px solid #E2E8F0;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);
    display: flex;
    flex-direction: column;
    height: 350px;
  }}

  .card-image-wrap {{
    position: relative;
    width: 100%;
    height: 172px;
    overflow: hidden;
    background: #0F172A;
  }}

  .card-img {{
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }}

  .card-overlay {{
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.5) 100%);
  }}

  .badge-number {{
    position: absolute;
    top: 14px;
    left: 14px;
    background: #107C41;
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 800;
    padding: 4px 12px;
    border-radius: 10px;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(16, 124, 65, 0.4);
  }}

  .badge-tag {{
    position: absolute;
    bottom: 12px;
    left: 14px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    color: #065F46;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 8px;
    letter-spacing: 0.2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }}

  .card-body {{
    padding: 18px 22px 20px 22px;
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: flex-start;
  }}

  .service-title {{
    font-size: 20.5px;
    font-weight: 750;
    color: #0F172A;
    margin-bottom: 8px;
    line-height: 1.3;
    letter-spacing: -0.3px;
  }}

  .service-desc {{
    font-size: 14.5px;
    line-height: 1.54;
    color: #475569;
    font-weight: 450;
  }}

  /* Bottom Banner / SAPE */
  .footer-banner {{
    position: relative;
    z-index: 2;
    background: #F8FAFC;
    border-radius: 16px;
    border: 1.5px solid #E2E8F0;
    padding: 13px 26px;
    display: flex;
    align-items: center;
    gap: 24px;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02);
  }}

  .sape-pill {{
    background: linear-gradient(135deg, #107C41 0%, #065F46 100%);
    color: #FFFFFF;
    font-size: 14.5px;
    font-weight: 800;
    letter-spacing: 1.8px;
    padding: 8px 18px;
    border-radius: 10px;
    white-space: nowrap;
    box-shadow: 0 4px 10px rgba(16, 124, 65, 0.25);
  }}

  .sape-values {{
    font-size: 15px;
    font-weight: 600;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 20px;
    width: 100%;
    justify-content: space-around;
  }}

  .sape-item {{
    display: flex;
    align-items: center;
    gap: 9px;
  }}

  .sape-dot {{
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #107C41;
  }}
</style>
</head>
<body>

  <div class="header">
    <div class="header-left">
      <div class="category-badge">SOUTARAH GROUP • CATALOGUE MULTISECTORIEL</div>
      <h1 class="header-title">Un socle éthique associé à une offre multisectorielle complète</h1>
      <p class="header-subtitle">6 pôles d'excellence synergiques au service des professionnels et particuliers</p>
    </div>
    <div class="header-right">
      <div class="logo-wrapper">
        <img class="logo-img" src="{logo_b64}" alt="Soutarah Group">
      </div>
    </div>
  </div>

  <div class="services-grid">
"""

for s in services:
    html_v1 += f"""
    <div class="service-card">
      <div class="card-image-wrap">
        <img class="card-img" src="{s['img']}" alt="{s['alt']}">
        <div class="card-overlay"></div>
        <span class="badge-number">{s['num']}</span>
        <span class="badge-tag">{s['tag']}</span>
      </div>
      <div class="card-body">
        <h2 class="service-title">{s['title']}</h2>
        <p class="service-desc">{s['desc']}</p>
      </div>
    </div>
"""

html_v1 += """
  </div>

  <div class="footer-banner">
    <div class="sape-pill">S.A.P.E</div>
    <div class="sape-values">
      <div class="sape-item">
        <span class="sape-dot"></span>
        <span>Solution pérenne & innovante</span>
      </div>
      <div class="sape-item">
        <span class="sape-dot"></span>
        <span>Adaptabilité opérationnelle</span>
      </div>
      <div class="sape-item">
        <span class="sape-dot"></span>
        <span>Priorité client absolue</span>
      </div>
      <div class="sape-item">
        <span class="sape-dot"></span>
        <span>Efficacité du personnel</span>
      </div>
    </div>
  </div>

</body>
</html>
"""

with open("presentation_v1_grid.html", "w", encoding="utf-8") as f:
    f.write(html_v1)


# -------------------------------------------------------------
# VARIANT 2: 2 Columns x 3 Rows (Faithful to Slide Structure)
# -------------------------------------------------------------
html_v2 = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Soutarah Group - Services Presentation (2 Columns)</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body {{
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    background-color: #FFFFFF;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #0F172A;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px 75px 44px 75px;
    position: relative;
  }}

  /* Ambient light corner */
  body::before {{
    content: '';
    position: absolute;
    top: -120px;
    right: -120px;
    width: 550px;
    height: 550px;
    background: radial-gradient(circle, rgba(16, 124, 65, 0.07) 0%, rgba(255,255,255,0) 70%);
    border-radius: 50%;
    z-index: 0;
  }}

  /* Top Header */
  .header {{
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 22px;
    border-bottom: 1.5px solid #F1F5F9;
  }}

  .header-left {{
    max-width: 1350px;
  }}

  .category-badge {{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #ECFDF5;
    color: #065F46;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 20px;
    margin-bottom: 10px;
    border: 1px solid #A7F3D0;
  }}

  .category-badge::before {{
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #107C41;
  }}

  .header-title {{
    font-size: 36px;
    font-weight: 800;
    line-height: 1.2;
    color: #0F172A;
    letter-spacing: -0.7px;
  }}

  .header-subtitle {{
    font-size: 17.5px;
    font-weight: 500;
    color: #64748B;
    margin-top: 6px;
  }}

  .logo-wrapper {{
    background: #FFFFFF;
    padding: 12px 22px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
    border: 1.5px solid #E2E8F0;
    display: flex;
    align-items: center;
  }}

  .logo-img {{
    height: 46px;
    width: auto;
    object-fit: contain;
  }}

  /* Services Grid 2 Columns x 3 Rows */
  .services-dual-grid {{
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 20px 32px;
    margin: 22px 0 20px 0;
  }}

  .dual-card {{
    background: #FFFFFF;
    border-radius: 18px;
    border: 1.5px solid #E2E8F0;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.035);
    display: flex;
    align-items: center;
    padding: 14px 18px;
    gap: 20px;
    height: 134px;
  }}

  .card-thumb-wrap {{
    position: relative;
    width: 168px;
    height: 104px;
    min-width: 168px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
  }}

  .card-thumb {{
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }}

  .thumb-number {{
    position: absolute;
    top: 8px;
    left: 8px;
    background: #107C41;
    color: #FFFFFF;
    font-size: 12px;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(16, 124, 65, 0.4);
  }}

  .card-content {{
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
  }}

  .card-header-line {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }}

  .service-num-title {{
    display: flex;
    align-items: center;
    gap: 10px;
  }}

  .num-pill {{
    color: #107C41;
    font-size: 16px;
    font-weight: 800;
  }}

  .dual-title {{
    font-size: 20.5px;
    font-weight: 750;
    color: #0F172A;
    letter-spacing: -0.3px;
  }}

  .dual-tag {{
    background: #ECFDF5;
    color: #065F46;
    font-size: 12px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 6px;
    border: 1px solid #A7F3D0;
  }}

  .dual-desc {{
    font-size: 14.5px;
    line-height: 1.5;
    color: #475569;
    font-weight: 450;
  }}

  /* Footer Banner */
  .footer-banner {{
    position: relative;
    z-index: 2;
    background: #F8FAFC;
    border-radius: 16px;
    border: 1.5px solid #E2E8F0;
    padding: 13px 26px;
    display: flex;
    align-items: center;
    gap: 24px;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02);
  }}

  .sape-pill {{
    background: linear-gradient(135deg, #107C41 0%, #065F46 100%);
    color: #FFFFFF;
    font-size: 14.5px;
    font-weight: 800;
    letter-spacing: 1.8px;
    padding: 8px 18px;
    border-radius: 10px;
    white-space: nowrap;
    box-shadow: 0 4px 10px rgba(16, 124, 65, 0.25);
  }}

  .sape-values {{
    font-size: 15px;
    font-weight: 600;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 20px;
    width: 100%;
    justify-content: space-around;
  }}

  .sape-item {{
    display: flex;
    align-items: center;
    gap: 9px;
  }}

  .sape-dot {{
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #107C41;
  }}
</style>
</head>
<body>

  <div class="header">
    <div class="header-left">
      <div class="category-badge">SOUTARAH GROUP • CATALOGUE MULTISECTORIEL</div>
      <h1 class="header-title">Un socle éthique associé à une offre multisectorielle complète</h1>
      <p class="header-subtitle">6 pôles d'excellence synergiques au service des professionnels et particuliers</p>
    </div>
    <div class="header-right">
      <div class="logo-wrapper">
        <img class="logo-img" src="{logo_b64}" alt="Soutarah Group">
      </div>
    </div>
  </div>

  <div class="services-dual-grid">
"""

for s in services:
    html_v2 += f"""
    <div class="dual-card">
      <div class="card-thumb-wrap">
        <img class="card-thumb" src="{s['img']}" alt="{s['alt']}">
        <span class="thumb-number">{s['num']}</span>
      </div>
      <div class="card-content">
        <div class="card-header-line">
          <div class="service-num-title">
            <h2 class="dual-title">{s['title']}</h2>
          </div>
          <span class="dual-tag">{s['tag']}</span>
        </div>
        <p class="dual-desc">{s['desc']}</p>
      </div>
    </div>
"""

html_v2 += """
  </div>

  <div class="footer-banner">
    <div class="sape-pill">S.A.P.E</div>
    <div class="sape-values">
      <div class="sape-item">
        <span class="sape-dot"></span>
        <span>Solution pérenne & innovante</span>
      </div>
      <div class="sape-item">
        <span class="sape-dot"></span>
        <span>Adaptabilité opérationnelle</span>
      </div>
      <div class="sape-item">
        <span class="sape-dot"></span>
        <span>Priorité client absolue</span>
      </div>
      <div class="sape-item">
        <span class="sape-dot"></span>
        <span>Efficacité du personnel</span>
      </div>
    </div>
  </div>

</body>
</html>
"""

with open("presentation_v2_dual.html", "w", encoding="utf-8") as f:
    f.write(html_v2)

print("Updated both HTML templates successfully!")
