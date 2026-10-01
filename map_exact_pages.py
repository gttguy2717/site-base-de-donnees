import os
import win32com.client

word = win32com.client.Dispatch('Word.Application')
word.Visible = False

doc_path = os.path.abspath('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')
doc = word.Documents.Open(doc_path)

total_pages = doc.ComputeStatistics(2)
print(f"Total pages in doc: {total_pages}")

results = []

# List of figures to look for in the body
fig_keys = [f"Figure {i}" for i in range(1, 30)]
tab_keys = [f"Tableau {i}" for i in range(1, 6)]

# Headings to look for in the body
headings = [
    "DÉDICACE",
    "REMERCIEMENTS",
    "AVANT-PROPOS",
    "SOMMAIRE",
    "LISTE DES FIGURES",
    "LISTE DES TABLEAUX",
    "LISTE DES ABRÉVIATIONS",
    "RÉSUMÉ",
    "INTRODUCTION GÉNÉRALE",
    "PARTIE I",
    "Chapitre 1 : Présentation de la structure",
    "I. Présentation de SOUTARAH GROUP",
    "1. Présentation générale",
    "2. Mission, Vision et Valeurs",
    "3. Domaines d'activités et services",
    "4. Partenariats",
    "Chapitre 2 : Présentation du projet",
    "I. Contexte et justification du projet",
    "III. Étude de l'existant et limites",
    "III. Objectifs du projet",
    "1. Objectif général",
    "2. Objectifs spécifiques",
    "IV. Cahier des charges du système",
    "1. Exigences fonctionnelles côté Client",
    "2. Exigences fonctionnelles côté Administrateur",
    "3. Exigences techniques et contraintes",
    "V. Planification des tâches et diagramme de GANTT",
    "1. Planning prévisionnel",
    "2. Diagramme de GANTT",
    "PARTIE II",
    "Chapitre 3 : Choix de la méthode d’analyse",
    "I. Étude comparative des méthodes d'analyse",
    "1. Présentation de la méthode MERISE",
    "2. Présentation de la méthode PU/UML",
    "3. Tableau comparatif Merise et PU/UML",
    "4. choix de la méthode d’analyse",
    "II. Application du PU/UML au système SOUTARAH GROUP",
    "1. Diagrammes des cas d'utilisation",
    "Description textuelle des cas d’utilisation",
    "2. Diagrammes d'activité",
    "2.1. Création et gestion d’un compte client",
    "2.2. Réservation d’un véhicule",
    "2.3. Processus d’achat d’un produit",
    "3. Diagrammes de séquences",
    "3.1. Paiement en ligne sécurisé",
    "3.2. Réservation d'un véhicule",
    "3.3. Achat produit",
    "3.4. Inscription d'un utilisateur",
    "4. Diagramme de classes",
    "PARTIE III",
    "Chapitre 4 : Conception du système et choix technologiques",
    "I. Analyse et justification des choix technologiques",
    "1. Environnement de développement",
    "2. Outil de maquettage UI/UX",
    "3. Technologies Frontend Web",
    "4. Technologies Mobile",
    "5. Technologies Backend et API REST",
    "6. Technologies de notifications et messagerie",
    "7. Plateforme d’hébergement et déploiement",
    "II. Système de Gestion de Base de Données (SGBD)",
    "1. Comparaison des principaux SGBD",
    "2. Choix et justification de MySQL",
    "III. Architecture générale du système",
    "PARTIE IV",
    "Chapitre 5 : Réalisation de la plateforme web",
    "I. Mise en place de la base de données MySQL",
    "II. Implémentation de l'Assistant IA",
    "1. L'Assistant virtuel intelligent",
    "2. Le Service de messagerie",
    "3. Le Module de paiement en ligne sécurisé (Genius Pay)",
    "III. Réalisation des interfaces de la plateforme Web",
    "1. Page d'accueil et de connexion",
    "2. Catalogue des produits",
    "3. Module de réservation de véhicules",
    "4. Panier multi-articles",
    "5. Espace Client et suivi des demandes",
    "IV. Réalisation de l'application mobile",
    "1. Écran d'accueil et fiche détaillée",
    "2. Panier mobile",
    "V. Réalisation de l'espace administrateur",
    "1. Tableau de bord des indicateurs clés",
    "2. Gestion du parc de véhicules",
    "Chapitre 6 : Mise en œuvre",
    "I. Tests fonctionnels et validation",
    "II. Étude financière et estimation des coûts",
    "1. Coûts matériels et logiciels",
    "2. Coûts d'hébergement et de maintenance",
    "III. Rentabilité, retour sur investissement",
    "1. Rentabilité immédiate",
    "2. Perspectives d’évolution",
    "CONCLUSION GÉNÉRALE",
    "BIBLIOGRAPHIE",
    "I. Ouvrages et cours",
    "II. Documentations techniques",
    "WEBOGRAPHIE",
    "TABLE DES MATIÈRES"
]

with open('exact_page_mapping.txt', 'w', encoding='utf-8') as f:
    f.write(f"Total pages: {total_pages}\n\n")
    
    # We scan paragraphs starting from intro/body (after TOC, say p > 90)
    for p_idx, p in enumerate(doc.Paragraphs):
        txt = p.Range.Text.strip()
        if not txt:
            continue
        page = p.Range.Information(3) # wdActiveEndAdjustedPageNumber
        
        # Check figures
        for fk in fig_keys:
            if fk in txt and p_idx > 90 and ("Figure" in txt[:15] or "FIGURE" in txt[:15]):
                f.write(f"[FIGURE] {fk} -> Page {page} | Full: {txt[:80]}\n")
                
        # Check tables
        for tk in tab_keys:
            if tk in txt and p_idx > 90 and ("Tableau" in txt[:15] or "TABLEAU" in txt[:15]):
                f.write(f"[TABLEAU] {tk} -> Page {page} | Full: {txt[:80]}\n")
                
        # Check headings
        for h in headings:
            if h.lower() in txt.lower() and p_idx > 90:
                # only if it looks like a heading
                if len(txt) < 120 and (txt.startswith(h[:10]) or h[:10] in txt):
                    f.write(f"[HEADING] {h} -> Page {page} | Full: {txt[:80]}\n")

doc.Close(False)
word.Quit()
print("Done! Results in exact_page_mapping.txt")
