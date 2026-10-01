# -*- coding: utf-8 -*-
"""
============================================================================
 DIAGNOSTIC D'ACCES AU SITE — SOUTARAH GROUP
============================================================================
 A executer SUR LE POSTE / LE RESEAU qui affiche le probleme
 (« le site n'est pas securise », « Google bloque la connexion »).

 Utilisation (Windows, Python deja installe pour ce projet) :
     python diagnostic_acces_site.py
     python diagnostic_acces_site.py www.soutarahgroup.com   (pour tester www)

 Le script ne modifie RIEN : il ne fait que lire et afficher.

 Il repond a une seule question : LE CERTIFICAT QUE VOIT CE POSTE EST-IL
 LE BON (celui de Let's Encrypt emis pour soutarahgroup.com), ou bien un
 certificat pirate / antivirus / FAI (ce qui declenche « non securise ») ?
============================================================================
"""

import datetime
import hashlib
import socket
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HOST = sys.argv[1] if len(sys.argv) > 1 else 'soutarahgroup.com'

# Certificat officiel du site (releve le 18/09/2026 par l'audit technique)
ATTENDU = {
    'emetteur': "Let's Encrypt",
    'common_name': 'soutarahgroup.com',
    'debut': 'Aug 21 15:10:01 2026 GMT',
    'fin': 'Nov 19 15:10:00 2026 GMT',
}

ALERTES = []
INFOS = []


def titre(txt):
    print()
    print('=' * 74)
    print(' ' + txt)
    print('=' * 74)


titre(f"DIAGNOSTIC D'ACCES — {HOST}")

# ---------------------------------------------------------------------------
print("\n[1] Date et heure du poste (une horloge fausse => certificat invalide)")
maintenant = datetime.datetime.now()
print(f"    Date locale : {maintenant:%d/%m/%Y %H:%M:%S}")
try:
    import email.utils
    import http.client
    # Heure de reference : en-tete HTTP "Date" d'un grand site (tres fiable)
    c = http.client.HTTPSConnection('www.google.com', 443, timeout=10)
    c.request('HEAD', '/', headers={'User-Agent': 'Diagnostic-Soutarah/1.0'})
    entete_date = c.getresponse().getheader('Date')
    c.close()
    heure_du_monde = email.utils.parsedate_to_datetime(entete_date)
    if heure_du_monde.tzinfo is not None:
        heure_du_monde = heure_du_monde.astimezone().replace(tzinfo=None)
    print(f"    Heure d'Abidjan (internet) : {heure_du_monde:%d/%m/%Y %H:%M:%S}")
    ecart = abs((maintenant - heure_du_monde).total_seconds())
    if ecart > 300:
        ALERTES.append(
            "L'horloge du poste est decalee de plus de 5 minutes : cela suffit a "
            "afficher « connexion non securisee » sur TOUS les sites HTTPS. "
            "=> Corrigez l'heure")
        print(f"    >>> ECART DE {int(ecart)} SECONDES AVEC L'HEURE REELLE")
    else:
        print("    horloge correcte (ecart < 5 min)")
except Exception as e:
    INFOS.append(f"Verification de l'heure en ligne impossible : {e}")

# ---------------------------------------------------------------------------
print("\n[2] Fichier hosts de Windows (detournement local du domaine)")
trouve_hosts = False
try:
    with open(r'C:\Windows\System32\drivers\etc\hosts', encoding='utf-8', errors='replace') as f:
        for ligne in f:
            ligne = ligne.strip()
            if not ligne or ligne.startswith('#'):
                continue
            if 'soutarahgroup' in ligne:
                trouve_hosts = True
                print(f"    {ligne}")
                ALERTES.append(
                    "Le fichier hosts force une adresse pour ce domaine : "
                    "cette ligne peut detourner le trafic.")
    if not trouve_hosts:
        print("    aucune ligne concernant le domaine (normal)")
except PermissionError:
    print("    lecture refusee (relancez en administrateur pour ce test)")
except Exception as e:
    print(f"    non teste : {e}")

# ---------------------------------------------------------------------------
print("\n[3] Resolution DNS vue par ce poste")
ips_v4, ips_v6 = set(), set()
try:
    for info in socket.getaddrinfo(HOST, 443, proto=socket.IPPROTO_TCP):
        (ips_v6 if info[0] == socket.AF_INET6 else ips_v4).add(info[4][0])
    print(f"    IPv4 : {', '.join(sorted(ips_v4)) or 'aucune'}")
    print(f"    IPv6 : {', '.join(sorted(ips_v6)) or 'aucune'}")
    if not ips_v4 and not ips_v6:
        ALERTES.append(
            "DNS : le domaine ne se resout pas du tout sur ce reseau. "
            "Si c'est www.soutarahgroup.com, l'enregistrement DNS www est absent chez Hostinger.")
except Exception as e:
    ALERTES.append(f"DNS : resolution impossible ({e}) -> panne DNS du reseau ou du FAI.")
    print(f"    ECHEC : {e}")

# ---------------------------------------------------------------------------
print("\n[4] Reponse en HTTP simple (port 80)")
try:
    import http.client
    c = http.client.HTTPConnection(HOST, 80, timeout=10)
    c.request('GET', '/', headers={'User-Agent': 'Diagnostic-Soutarah/1.0'})
    r = c.getresponse()
    print(f"    HTTP {r.status} {r.reason} | location: {r.getheader('location')}")
    if r.status not in (301, 302, 307, 308):
        ALERTES.append(
            "Le port 80 ne redirige pas vers HTTPS : le navigateur peut rester "
            "sur une adresse http:// marquee « Non securise ».")
    c.close()
except Exception as e:
    print(f"    non joignable : {e}")

# ---------------------------------------------------------------------------
print("\n[5] HTTPS avec VERIFICATION COMPLETE (exactement comme le navigateur)")
contexte = ssl.create_default_context()
certificat = None
try:
    with socket.create_connection((HOST, 443), timeout=12) as sock:
        with contexte.wrap_socket(sock, server_hostname=HOST) as tls:
            certificat = tls.getpeercert()
            print("    >>> CERTIFICAT VALIDE : le navigateur affichera le cadenas")
            print(f"    TLS {tls.version()}")
except ssl.SSLCertVerificationError as e:
    ALERTES.append(
        "CERTIFICAT REFUSE PAR LE POSTE : " + e.verify_message +
        "  => antivirus qui inspecte le HTTPS, proxy d'entreprise, FAI filtrant, "
        "appareil trop ancien (Android 7 ou moins), ou horloge fausse.")
    print(f"    >>> ECHEC : {e.verify_message} (code {e.verify_code})")
except Exception as e:
    ALERTES.append(f"Connexion HTTPS impossible : {e}")
    print(f"    >>> ERREUR : {e}")

# ---------------------------------------------------------------------------
print("\n[6] Certificat reellement presente par le serveur (sans verification)")
if not certificat:
    try:
        import os
        import tempfile
        ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        with socket.create_connection((HOST, 443), timeout=12) as sock:
            with ctx.wrap_socket(sock, server_hostname=HOST) as tls:
                brut = tls.getpeercert(binary_form=True)
        empreinte = hashlib.sha256(brut).hexdigest()
        with tempfile.NamedTemporaryFile('w', suffix='.pem', delete=False) as f:
            f.write(ssl.DER_cert_to_PEM_cert(brut))
            nom_fichier = f.name
        try:
            d = ssl._ssl._test_decode_cert(nom_fichier)
        finally:
            os.unlink(nom_fichier)
        sujet = dict(x[0] for x in d.get('subject', ()))
        emetteur = dict(x[0] for x in d.get('issuer', ()))
        noms = [v for k, v in d.get('subjectAltName', ()) if k == 'DNS']
        print(f"    CN (nom du site) : {sujet.get('commonName')}")
        print(f"    Emetteur         : {emetteur.get('organizationName')} / {emetteur.get('commonName')}")
        print(f"    Validite         : {d.get('notBefore')} -> {d.get('notAfter')}")
        print(f"    Empreinte SHA256 : {empreinte}")
        print(f"    Noms couverts    : {noms}")

        if ATTENDU['emetteur'].lower() not in str(emetteur.get('organizationName', '')).lower():
            ALERTES.append(
                "Le certificat recu n'est PAS emis par Let's Encrypt : quelqu'un intercepte "
                "la connexion (antivirus, proxy, FAI, box internet).")
        if HOST not in noms:
            ALERTES.append(
                f"Le certificat ne couvre pas le nom {HOST} : le navigateur refusera la connexion.")
    except Exception as e:
        print(f"    non recuperable : {e}")

# ---------------------------------------------------------------------------
titre('RESULTAT')
if not ALERTES:
    print("  AUCUN PROBLEME DETECTE depuis ce poste et ce reseau.")
    print("  Le site repond en HTTPS valide et redirige le HTTP vers le HTTPS.")
    print()
    print("  Si vous voyez malgre tout un message « non securise » :")
    print("    1. videz le cache du navigateur ou testez en navigation privee ;")
    print("    2. desactivez temporairement les extensions et l'antivirus (protection web) ;")
    print("    3. testez sur un autre appareil / un autre reseau (partage mobile) ;")
    print("    4. notez le message EXACT (ex. NET::ERR_CERT_AUTHORITY_INVALID).")
else:
    print("  PROBLEMES DETECTES :")
    for i, a in enumerate(ALERTES, 1):
        print(f"    {i}. {a}")

if INFOS:
    print()
    print("  Informations :")
    for i in INFOS:
        print(f"    - {i}")

print()
print("=" * 74)