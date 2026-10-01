import os
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

# Gather assets
logo_b64 = get_base64_image("public/logo-soutarah.png")
car_b64 = get_base64_image("public/img/carPlay.jpg")
car_fleet_b64 = get_base64_image("public/img/carRe.jpeg")
negoce_b64 = get_base64_image("public/img/Negoce-ie.jpg")
tech_b64 = get_base64_image("public/img/installation.jpg")
energie_b64 = get_base64_image("public/img/energie.png")
agro_b64 = get_base64_image("public/img/fermi.jpeg")
immo_b64 = get_base64_image("public/img/description_immobilier.jpeg")
immo2_b64 = get_base64_image("public/img/immobilier.jpeg")

print("Base64 conversion complete:")
print(" Logo:", len(logo_b64))
print(" Car:", len(car_b64))
print(" Negoce:", len(negoce_b64))
print(" Tech:", len(tech_b64))
print(" Energie:", len(energie_b64))
print(" Agro:", len(agro_b64))
print(" Immo:", len(immo_b64))
