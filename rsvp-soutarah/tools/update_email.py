import email
from email.message import EmailMessage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
import re

# Read original eml to extract images
src_eml = r'c:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\site-soutarah\rsvp-soutarah\Invitation_FINALE_lien_rsvp.eml'
with open(src_eml, 'rb') as f:
    orig_msg = email.message_from_binary_file(f)

# Extract images
images = {}
for part in orig_msg.walk():
    if part.get_content_type().startswith('image/'):
        cid = part.get('Content-ID', '').strip('<>')
        images[cid] = {
            'data': part.get_payload(decode=True),
            'filename': part.get_filename(),
            'content_type': part.get_content_type()
        }

print("Found images:", list(images.keys()))

# Read HTML
with open(r'c:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\site-soutarah\rsvp-soutarah\mail_content.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove BNI logo in header
old_header = """                  <td width="45%" valign="middle">
                    <img
                      src="cid:soutarah-img-1@soutarahgroup.ci"
                      alt="SOUTARAH GROUP" width="125" style="width:125px;height:auto;display:block">
                  </td>
                  <td width="45%" align="right" valign="middle">
                    <div
                      style="display:inline-block;background:#fff;padding:5px 8px;border:1px solid #e7ebe8;border-radius:4px">
                      <img
                        src="cid:soutarah-img-2@soutarahgroup.ci"
                        alt="BNI — Banque Nationale d'Investissement" width="112"
                        style="width:112px;max-width:100%;height:auto">
                    </div>
                  </td>"""

new_header = """                  <td width="100%" valign="middle">
                    <img
                      src="cid:soutarah-img-1@soutarahgroup.ci"
                      alt="SOUTARAH GROUP" width="130" style="width:130px;height:auto;display:block">
                  </td>"""

if old_header in html:
    html = html.replace(old_header, new_header)
    print("Replaced header logo successfully!")
else:
    print("Warning: old_header not found exactly, doing regex replace...")
    # Regex fallback
    html = re.sub(
        r'<td width="45%" valign="middle">.*?<img\s+src="cid:soutarah-img-1@soutarahgroup\.ci"[^>]*>.*?</td>\s*<td width="45%" align="right" valign="middle">.*?<img\s+src="cid:soutarah-img-2@soutarahgroup\.ci"[^>]*>.*?</td>',
        new_header,
        html,
        flags=re.DOTALL
    )

# 2. Update Date / Venue to include duration 9H à 12H
old_date = """                  <td width="48%" style="padding:25px 24px 22px;border-right:1px solid #e8eeeb" valign="top">
                    <div class="pill" style="color:#6d7c75">Date</div>
                    <div style="font-size:28px;line-height:1.1;font-weight:800;color:#12362a;margin-top:8px">24
                      septembre<br>2026</div>
                    <div class="small" style="margin-top:8px">Jeudi</div>
                  </td>"""

new_date = """                  <td width="48%" style="padding:25px 24px 22px;border-right:1px solid #e8eeeb" valign="top">
                    <div class="pill" style="color:#6d7c75">Date &amp; Horaire</div>
                    <div style="font-size:26px;line-height:1.15;font-weight:800;color:#12362a;margin-top:8px">24 septembre<br>2026</div>
                    <div class="small" style="margin-top:8px;font-size:14px;font-weight:700;color:#0a6741">Jeudi • 09h00 à 12h00</div>
                  </td>"""

if old_date in html:
    html = html.replace(old_date, new_date)
    print("Replaced date & horaire successfully!")
else:
    print("Warning: old_date not found exactly, doing regex replace...")
    html = re.sub(
        r'<td width="48%"[^>]*>.*?<div class="pill"[^>]*>Date</div>.*?<div class="small"[^>]*>Jeudi</div>\s*</td>',
        new_date,
        html,
        flags=re.DOTALL
    )

# 3. Remove PROGRAMME block
html = re.sub(
    r'\s*<!-- PROGRAMME -->\s*<tr>\s*<td class="pad" style="padding:18px 56px 12px">.*?</tr>\s*(?=<!-- PANEL -->)',
    '\n',
    html,
    flags=re.DOTALL
)
print("Removed PROGRAMME block successfully!")

# 4. Remove BNI logo in Sign-off / Footer
old_signoff = """                  <td width="50%" valign="top">
                    <img
                      src="cid:soutarah-img-3@soutarahgroup.ci"
                      alt="SOUTARAH GROUP" width="125" style="width:125px;height:auto;display:block">
                  </td>
                  <td width="50%" valign="top" style="text-align:right">
                    <img
                      src="cid:soutarah-img-4@soutarahgroup.ci"
                      alt="BNI" width="90" style="width:90px;height:auto;display:inline-block">
                  </td>"""

new_signoff = """                  <td width="100%" valign="top">
                    <img
                      src="cid:soutarah-img-3@soutarahgroup.ci"
                      alt="SOUTARAH GROUP" width="130" style="width:130px;height:auto;display:block">
                  </td>"""

if old_signoff in html:
    html = html.replace(old_signoff, new_signoff)
    print("Replaced sign-off logo successfully!")
else:
    print("Warning: old_signoff not found exactly, doing regex replace...")
    html = re.sub(
        r'<td width="50%" valign="top">\s*<img\s+src="cid:soutarah-img-3@soutarahgroup\.ci"[^>]*>\s*</td>\s*<td width="50%" valign="top"[^>]*>\s*<img\s+src="cid:soutarah-img-4@soutarahgroup\.ci"[^>]*>\s*</td>',
        new_signoff,
        html,
        flags=re.DOTALL
    )

# Save updated HTML
with open(r'c:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\site-soutarah\rsvp-soutarah\mail_content.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated mail_content.html saved!")

# Text version
txt_content = """Invitation à la cérémonie officielle de remise du financement BNI à SOUTARAH GROUP

Date : Jeudi 24 septembre 2026 (09h00 – 12h00)
Lieu : Hôtel des Armées, Salle Tené Birahima, Camp Galliéni, Plateau — Abidjan

Montant du financement : 500 000 000 FCFA

Confirmation de présence : https://rsvp.soutarahgroup.com
"""
with open(r'c:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\site-soutarah\rsvp-soutarah\mail_content.txt', 'w', encoding='utf-8') as f:
    f.write(txt_content)

# Rebuild MIME message
root = MIMEMultipart('mixed')
root['Subject'] = 'Invitation — Cérémonie officielle BNI × SOUTARAH GROUP — 24 septembre 2026'
root['X-Unsent'] = '1'

alt = MIMEMultipart('alternative')
root.attach(alt)

# Plain text
part_text = MIMEText(txt_content, 'plain', 'utf-8')
alt.attach(part_text)

# Related HTML + images
related = MIMEMultipart('related')
alt.attach(related)

part_html = MIMEText(html, 'html', 'utf-8')
related.attach(part_html)

# Attach only Soutarah images (1 and 3)
for cid_target in ['soutarah-img-1@soutarahgroup.ci', 'soutarah-img-3@soutarahgroup.ci']:
    if cid_target in images:
        img_info = images[cid_target]
        img_part = MIMEImage(img_info['data'])
        img_part.add_header('Content-ID', f'<{cid_target}>')
        img_part.add_header('Content-Disposition', 'inline', filename=img_info['filename'])
        related.attach(img_part)
        print(f"Attached image {cid_target}")

# Write to both eml destinations
dest1 = r'c:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\site-soutarah\rsvp-soutarah\Invitation_FINALE_lien_rsvp.eml'
dest2 = r'c:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\ceremonie-soutarah\COMMISSION-MARKETING\Invitation_Soutarah_BNI_A_ENVOYER_avec_lien.eml'

for d in [dest1, dest2]:
    with open(d, 'wb') as f:
        f.write(root.as_bytes())
    print("Written updated EML to:", d)

