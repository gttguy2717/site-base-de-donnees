# -*- coding: utf-8 -*-
"""
translate_full_report.py

Crée Rapport_de_Stage_ENGLISH.docx en copiant le rapport français
et en traduisant fidèlement tout le texte.
RÈGLE STRICTE: traduire EXACTEMENT ce qui est écrit en français,
sans ajouter ni retirer de mots.
"""
import sys; sys.stdout.reconfigure(encoding='utf-8')
import shutil
from docx import Document
from docx.oxml.ns import qn

SRC = 'Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx'
OUT = 'Rapport_de_Stage_ENGLISH.docx'

# ═══════════════════════════════════════════════════════════════════
# DICTIONNAIRE DE TRADUCTIONS EXACTES
# Clé = texte français exact (ou fragment unique)
# Valeur = traduction anglaise fidèle
# ═══════════════════════════════════════════════════════════════════
TRANSLATIONS = {

    # ── Pages préliminaires ──────────────────────────────────────
    'DÉDICACE': 'DEDICATION',
    'REMERCIEMENTS': 'ACKNOWLEDGEMENTS',
    'AVANT-PROPOS': 'FOREWORD',
    'SOMMAIRE': 'TABLE OF CONTENTS',
    'LISTE DES FIGURES': 'LIST OF FIGURES',
    'LISTE DES TABLEAUX': 'LIST OF TABLES',
    'LISTE DES ABRÉVIATIONS': 'LIST OF ABBREVIATIONS',
    'RÉSUMÉ': 'ABSTRACT',
    'INTRODUCTION GÉNÉRALE': 'GENERAL INTRODUCTION',
    'TABLE DES MATIÈRES': 'DETAILED TABLE OF CONTENTS',

    # ── PARTIES ─────────────────────────────────────────────────
    'PARTIE I': 'PART I',
    'CADRE ET CONTEXTE DU PROJET': 'PROJECT FRAMEWORK AND CONTEXT',
    'PARTIE II': 'PART II',
    'ÉTUDE CONCEPTUELLE': 'CONCEPTUAL STUDY',
    'PARTIE III': 'PART III',
    'ÉTUDE TECHNIQUE': 'TECHNICAL STUDY',
    'PARTIE IV': 'PART IV',
    'RÉALISATION ET MISE EN ŒUVRE': 'SYSTEM IMPLEMENTATION AND DEPLOYMENT',
    'CONCLUSION GÉNÉRALE ET PERSPECTIVES': 'GENERAL CONCLUSION AND PERSPECTIVES',
    'BIBLIOGRAPHIE': 'BIBLIOGRAPHY',
    'WEBOGRAPHIE': 'WEBOGRAPHY',

    # ── Chapitres ────────────────────────────────────────────────
    'Chapitre 1 : Présentation de la structure d'accueil': 'Chapter 1 : Host Organization Overview',
    'Chapitre 2 : Présentation du projet': 'Chapter 2 : Project Overview',
    'Chapitre 3 : Choix de la méthode d'analyse': 'Chapter 3 : Choice of Analysis Methodology',
    'Chapitre 4 : Conception du système et choix technologiques': 'Chapter 4 : System Design and Technological Choices',
    'Chapitre 5 : Réalisation de la plateforme web et de l'application mobile': 'Chapter 5 : Development of the Web Platform and Mobile Application',
    'Chapitre 6 : Mise en œuvre': 'Chapter 6 : System Deployment',
}


# ═══════════════════════════════════════════════════════════════════
# TRADUCTIONS PAR PARAGRAPHE (index → nouvelle traduction anglaise)
# On mappe chaque paragraphe non-vide par son index dans le doc FR
# ═══════════════════════════════════════════════════════════════════
# Format: { para_index : "English translation" }
PARA_TRANSLATIONS = {}

def apply_translations(doc):
    """
    Apply translations paragraph by paragraph.
    For each paragraph, try exact match first, then fragment match.
    Only replaces text in runs, preserving formatting.
    """
    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        if not text:
            continue

        # Check exact match
        if text in TRANSLATIONS:
            _replace_para_text(para, TRANSLATIONS[text])
            continue

        # Check if it's in PARA_TRANSLATIONS
        if i in PARA_TRANSLATIONS:
            _replace_para_text(para, PARA_TRANSLATIONS[i])
            continue


def _replace_para_text(para, new_text):
    """Replace all text in paragraph runs with new_text, preserving run formatting."""
    runs = para.runs
    if not runs:
        return
    # Put all text in first run, clear others
    runs[0].text = new_text
    for r in runs[1:]:
        r.text = ''


# Print all paragraph texts for review
def dump_fr_paragraphs(doc, start=0, end=None):
    end = end or len(doc.paragraphs)
    for i in range(start, min(end, len(doc.paragraphs))):
        p = doc.paragraphs[i]
        t = p.text.strip()
        if t:
            print(f'[{i}][{p.style.name}] {repr(t[:100])}')


def main():
    print(f'Loading {SRC}...')
    doc_fr = Document(SRC)
    print(f'Total paragraphs: {len(doc_fr.paragraphs)}')

    print('Dumping all non-empty paragraphs for translation mapping...')
    with open('fr_paragraphs_dump.txt', 'w', encoding='utf-8') as f:
        for i, p in enumerate(doc_fr.paragraphs):
            t = p.text.strip()
            if t:
                f.write(f'[{i}][{p.style.name}] {t}\n')

    print('Dump saved to fr_paragraphs_dump.txt')
    print('Total non-empty:', sum(1 for p in doc_fr.paragraphs if p.text.strip()))


if __name__ == '__main__':
    main()
