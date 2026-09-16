import os
import sys
from build_common import init_presentation
from build_slides_1_to_15 import build_slides_1_to_15
from build_slides_16_to_30 import build_slides_16_to_30
from build_slides_31_to_45 import build_slides_31_to_45
from build_slides_46_to_60 import build_slides_46_to_60

sys.stdout.reconfigure(encoding='utf-8')

OUTPUT_FILE = "Soutenance_Stage_SOUTARAH_David_Sorho_Officiel.pptx"

def main():
    print("=" * 70)
    print("  GÉNÉRATEUR OFFICIEL DE LA PRÉSENTATION DE SOUTENANCE SOUTARAH GROUP")
    print("  Candidat : David SORHO (TS STIC 2 - ESI / INP-HB)")
    print("  Plan respecté : 8 parties | 60 Diapositives Aérées Haute Définition")
    print("=" * 70)

    print("\n[1/5] Initialisation de la présentation 16:9 widescreen...")
    prs = init_presentation()

    print("[2/5] Construction des diapositives 01 à 15 (Intro, Contexte, Planning)...")
    build_slides_1_to_15(prs)

    print("[3/5] Construction des diapositives 16 à 30 (Méthode MERISE/PU, Besoins, Activités)...")
    build_slides_16_to_30(prs)

    print("[4/5] Construction des diapositives 31 à 45 (Séquences, Classes, Arch, SGBD, IA, Devis PDF)...")
    build_slides_31_to_45(prs)

    print("[5/5] Construction des diapositives 46 à 60 (Mobile, Admin, Recette, Bilan, Perspectives, Conclusion)...")
    build_slides_46_to_60(prs)

    total = len(prs.slides)
    print(f"\nNombre total de diapositives générées : {total}")
    assert total == 60, f"Erreur : attendu 60 diapositives, obtenu {total}"

    print(f"Enregistrement de la présentation sous '{OUTPUT_FILE}'...")
    prs.save(OUTPUT_FILE)
    size_mb = os.path.getsize(OUTPUT_FILE) / (1024 * 1024)
    print(f"SUCCÈS : Présentation enregistrée avec succès ({size_mb:.2f} Mo) !")

if __name__ == "__main__":
    main()
