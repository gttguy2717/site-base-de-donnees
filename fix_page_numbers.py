# -*- coding: utf-8 -*-
import sys; sys.stdout.reconfigure(encoding='utf-8')
"""
fix_page_numbers.py
Corrige les numéros de pages dans la Liste des Figures, Liste des Tableaux,
le Sommaire et la Table des Matières après l'ajout de la page Genius Pay.

Règle appliquée :
  - Figures 20 à 29 + Figure 30 : décalage selon PDF réel
  - Tableaux 4 et 5 : +1
  - Dans Sommaire / Table des Matières : toutes les sections après la page 47 → +1
  - SAUF celles déjà à la bonne page (vérifiées manuellement)
"""
import re
import copy
from docx import Document
from docx.oxml.ns import qn

INPUT  = "Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx"
OUTPUT = "Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx"

# ──────────────────────────────────────────────────────────────────────────────
# Corrections ciblées : (texte_contenu, ancien_numéro, nouveau_numéro)
# ──────────────────────────────────────────────────────────────────────────────
FIGURE_FIXES = [
    # (fragment unique du titre de la figure, ancien n°, nouveau n°)
    ("Figure 20",  "47",  "48"),   # Page d'accueil
    ("Figure 22",  "48",  "49"),   # Catalogue produits
    ("Figure 26",  "51",  "51"),   # Mobile accueil – déjà bon dans PDF ? non
    ("Figure 27",  "51",  "52"),   # Mobile panier
    ("Figure 29",  "52",  "53"),   # Gestion parc admin
    # Tableau 4 et Tableau 5
    ("Tableau 4",  "54",  "55"),
    ("Tableau 5",  "54",  "55"),
]

# Corrections pour la Table des Matières et le Sommaire
# (fragment unique, ancien n°, nouveau n°)
TOC_FIXES = [
    # Sommaire (paragraphes 46-52)
    ("Chapitre 6",                                      "53",  "54"),
    ("CONCLUSION G",                                    "56",  "57"),
    ("BIBLIOGRAPHIE",                                   "57",  "58"),
    ("WEBOGRAPHIE",                                     "58",  "59"),
    ("TABLE DES MAT",                                   "59",  "60"),

    # Table des matières (paragraphes 710+)
    # Interfaces Web
    ("R\u00e9alisation des interfaces de la plateforme Web",   "47",  "48"),
    ("Page d\u2019accueil et de connexion",                    "47",  "48"),
    ("Catalogue des produits",                          "48",  "49"),
    ("Panier multi-articles",                           "49",  "50"),
    # Application mobile
    ("R\u00e9alisation de l\u2019application mobile",          "50",  "51"),
    ("\u00c9cran d\u2019accueil et fiche d\u00e9taill\u00e9e", "50",  "51"),
    ("Panier mobile",                                   "51",  "52"),
    # Chapitre 6
    ("Chapitre 6 : Mise en \u0153uvre",                        "53",  "54"),
    ("Tests fonctionnels",                              "53",  "54"),
    ("\u00c9tude financi\u00e8re",                             "54",  "55"),
    ("Co\u00fbts mat\u00e9riels",                              "54",  "55"),
    ("Co\u00fbts d\u2019h\u00e9bergement",                     "54",  "55"),
    ("Rentabilit\u00e9, retour sur investissement",            "55",  "56"),
    ("Rentabilit\u00e9 imm\u00e9diate",                        "55",  "56"),
    ("Perspectives d\u2019\u00e9volution",                     "55",  "56"),
    # Fin du document
    ("CONCLUSION G\u00c9N\u00c9RALE",                          "56",  "57"),
    ("BIBLIOGRAPHIE",                                   "57",  "58"),
    ("I. Ouvrages",                                     "57",  "58"),
    ("II. Documentations",                              "57",  "58"),
    ("WEBOGRAPHIE",                                     "58",  "59"),
    ("TABLE DES MAT",                                   "59",  "60"),
]

# ──────────────────────────────────────────────────────────────────────────────

def tab_num(n):
    return f"\u00a0-\u00a0{n}\u00a0-"

def tab_num_alt(n):
    return f" - {n} -"

def replace_page_num_in_para(para, old_num, new_num):
    """
    Remplace le numéro de page dans un paragraphe.
    Cherche le pattern - {old} - (avec espaces ou NBSP) dans les runs
    et le remplace par - {new} -.
    Retourne True si remplacement effectué.
    """
    full_text = para.text
    # Patterns possibles
    patterns = [
        f"\u00a0-\u00a0{old_num}\u00a0-",
        f" - {old_num} -",
        f"\t- {old_num} -",
        f"\t\u00a0-\u00a0{old_num}\u00a0-",
        f"- {old_num} -",
    ]
    
    found = False
    for pat in patterns:
        if pat in full_text:
            found = True
            break
    
    if not found:
        return False

    # Reconstruire les runs en remplaçant dans le texte complet
    # On travaille run par run pour préserver la mise en forme
    # Stratégie : reconstruire le texte complet, localiser, modifier
    
    # Agréger le texte de tous les runs
    runs_text = [r.text for r in para.runs]
    combined = ''.join(runs_text)
    
    new_combined = combined
    for pat in patterns:
        if pat in new_combined:
            # Déterminer le remplacement correspondant au même style de pattern
            if '\u00a0' in pat:
                replacement = f"\u00a0-\u00a0{new_num}\u00a0-"
            else:
                replacement = f" - {new_num} -"
            new_combined = new_combined.replace(pat, replacement, 1)
            break
    
    if new_combined == combined:
        return False
    
    # Redistribuer le texte modifié dans les runs
    # Approche simple : mettre tout dans le premier run, vider les autres
    if para.runs:
        # Trouver les runs qui contiennent notre numéro et les modifier
        offset = 0
        for r in para.runs:
            r_len = len(r.text)
            r_start = offset
            r_end = offset + r_len
            offset = r_end
        
        # Reconstruction : on reconstruit le texte total dans les runs
        # en conservant la répartition originale si possible
        # Si le texte a la même longueur, redistribuer proportionnellement
        if len(new_combined) == len(combined):
            offset = 0
            for r in para.runs:
                r_len = len(r.text)
                r.text = new_combined[offset:offset + r_len]
                offset += r_len
        else:
            # Longueurs différentes : mettre tout dans le premier run et vider les autres
            # Mais préserver les tabs de début
            first_run_done = False
            for r in para.runs:
                if not first_run_done:
                    # Garder le contenu du premier run + redistribuer
                    r.text = new_combined
                    first_run_done = True
                else:
                    r.text = ''
        return True
    
    return False


def fix_paragraph(para, fixes):
    """Applique les corrections de numéros de page sur un paragraphe."""
    text = para.text
    for (fragment, old_n, new_n) in fixes:
        if fragment.lower() in text.lower():
            # Vérifier que le vieux numéro est bien présent
            patterns_to_check = [
                f"\u00a0-\u00a0{old_n}\u00a0-",
                f" - {old_n} -",
                f"- {old_n} -",
            ]
            has_old = any(p in text for p in patterns_to_check)
            if has_old:
                done = replace_page_num_in_para(para, old_n, new_n)
                if done:
                    print(f"  OK [{fragment[:50]}...] : - {old_n} - -> - {new_n} -")
                    return True  # une seule correction par paragraphe
    return False


def main():
    print(f"Chargement de {INPUT} ...")
    doc = Document(INPUT)
    
    corrections = 0
    
    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        if not text:
            continue
        
        # Appliquer corrections figures/tableaux
        if fix_paragraph(para, FIGURE_FIXES):
            corrections += 1
            continue
        
        # Appliquer corrections TOC / Sommaire
        if fix_paragraph(para, TOC_FIXES):
            corrections += 1

    print(f"\nTotal corrections appliquées : {corrections}")
    print(f"Sauvegarde dans {OUTPUT} ...")
    doc.save(OUTPUT)
    print("Done !")


if __name__ == "__main__":
    main()
