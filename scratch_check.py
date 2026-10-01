import urllib.request
import re

try:
    req = urllib.request.Request('https://soutarahgroup.com', headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        matches = re.findall(r'["\']([^"\']+\.(?:jpg|jpeg|png|webp|svg))["\']', html, re.I)
        print("Total images found in HTML:", len(matches))
        for m in sorted(set(matches)):
            print(" -", m)
except Exception as e:
    print("Error:", e)
