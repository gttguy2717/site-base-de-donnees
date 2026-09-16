# -*- coding: utf-8 -*-
"""
Script de génération du rapport de stage Word (.docx)
Thème : Conception et développement d’une plateforme numérique de gestion des services 
        de SOUTARAH GROUP intégrant une application mobile dédiée à la réservation de véhicules
Auteur : SORHO DONAPORGO DAVID PAUL
École : INP-HB / ESI (Filière STIC)
"""

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_placeholder_box(doc, title, desc=""):
    """Crée un encadré visuel pour les diagrammes et captures à insérer."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.2)
    set_cell_background(cell, "F1F5F9")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(4)
    r1 = p.add_run(f"📷 [ EMPLACEMENT : {title} ]\n")
    r1.bold = True
    r1.font.size = Pt(10.5)
    r1.font.color.rgb = RGBColor(21, 128, 61) # Vert Soutarah
    
    if desc:
        r2 = p.add_run(desc)
        r2.font.size = Pt(9.5)
        r2.font.italic = True
        r2.font.color.rgb = RGBColor(100, 116, 139)
        
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def build_document():
    doc = docx.Document()
    
    # ── Marges A4 (2.5 cm partout) ──
    for sec in doc.sections:
        sec.top_margin = Inches(0.98)
        sec.bottom_margin = Inches(0.98)
        sec.left_margin = Inches(0.98)
        sec.right_margin = Inches(0.98)
        sec.page_width = Inches(8.27)
        sec.page_height = Inches(11.69)
        
    # Styles globaux
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(30, 41, 59) # Slate sombre
    normal_style.paragraph_format.line_spacing = 1.25
    normal_style.paragraph_format.space_after = Pt(6)

    # ─────────────────────────────────────────────────────────────────────────
    # 1. PAGE DE GARDE OFFICIELLE
    # ─────────────────────────────────────────────────────────────────────────
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("RÉPUBLIQUE DE CÔTE D'IVOIRE\n")
    r.bold = True
    r.font.size = Pt(11)
    r = p.add_run("Union - Discipline - Travail\n")
    r.font.size = Pt(10)
    r.font.italic = True
    
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_img.add_run("INSTITUT NATIONAL POLYTECHNIQUE FÉLIX HOUPHOUËT-BOIGNY (INP-HB)\n")
    r.bold = True
    r.font.size = Pt(13)
    r.font.color.rgb = RGBColor(20, 70, 39)
    r2 = p_img.add_run("ÉCOLE SUPÉRIEURE D’INDUSTRIE (ESI)\n")
    r2.bold = True
    r2.font.size = Pt(12)
    r3 = p_img.add_run("Département : Sciences et Technologies de l’Information et de la Communication (STIC)\n")
    r3.font.size = Pt(10.5)
    r3.font.italic = True
    
    doc.add_paragraph().paragraph_format.space_after = Pt(10)
    
    p_type = doc.add_paragraph()
    p_type.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_type = p_type.add_run("RAPPORT DE PROJET D’APPLICATION DE FIN DE CYCLE\n")
    r_type.bold = True
    r_type.font.size = Pt(14)
    r_type.font.color.rgb = RGBColor(15, 23, 42)
    
    # Boîte Thème
    tbl_theme = doc.add_table(rows=1, cols=1)
    tbl_theme.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_th = tbl_theme.cell(0, 0)
    c_th.width = Inches(6.4)
    set_cell_background(c_th, "144627") # Vert foncé Soutarah
    set_cell_margins(c_th, top=180, bottom=180, left=200, right=200)
    
    p_th = c_th.paragraphs[0]
    p_th.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_th_lbl = p_th.add_run("THÈME :\n")
    r_th_lbl.bold = True
    r_th_lbl.font.size = Pt(12)
    r_th_lbl.font.color.rgb = RGBColor(254, 240, 138) # Doré clair
    
    r_th_txt = p_th.add_run("« CONCEPTION ET DÉVELOPPEMENT D’UNE PLATEFORME NUMÉRIQUE DE GESTION DES SERVICES DE SOUTARAH GROUP INTÉGRANT UNE APPLICATION MOBILE DÉDIÉE À LA RÉSERVATION DE VÉHICULES »")
    r_th_txt.bold = True
    r_th_txt.font.size = Pt(13)
    r_th_txt.font.color.rgb = RGBColor(255, 255, 255)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(20)
    
    # Table Encadreurs et Candidat
    tbl_actors = doc.add_table(rows=1, cols=2)
    tbl_actors.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_enc = tbl_actors.cell(0, 0)
    c_cand = tbl_actors.cell(0, 1)
    c_enc.width = Inches(3.2)
    c_cand.width = Inches(3.2)
    
    p_enc = c_enc.paragraphs[0]
    p_enc.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p_enc.add_run("Encadreur Pédagogique :\n")
    r.bold = True
    r.font.size = Pt(11)
    r = p_enc.add_run("M. MOUSSOH EDI\n")
    r.bold = True
    r.font.size = Pt(11.5)
    r.font.color.rgb = RGBColor(20, 70, 39)
    r = p_enc.add_run("Enseignant-chercheur à l'INP-HB / ESI\n\n")
    r.font.size = Pt(10)
    r = p_enc.add_run("Structure d'accueil :\n")
    r.bold = True
    r.font.size = Pt(11)
    r = p_enc.add_run("SOUTARAH GROUP SARL\nAbidjan - Côte d'Ivoire")
    r.font.size = Pt(10)
    
    p_cand = c_cand.paragraphs[0]
    p_cand.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_cand.add_run("Présenté par :\n")
    r.bold = True
    r.font.size = Pt(11)
    r = p_cand.add_run("SORHO DONAPORGO DAVID PAUL\n")
    r.bold = True
    r.font.size = Pt(12)
    r.font.color.rgb = RGBColor(20, 70, 39)
    r = p_cand.add_run("Élève Technicien Supérieur en STIC\nAnnée académique : 2025-2026")
    r.font.size = Pt(10.5)
    
    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # 2. DÉDICACES
    # ─────────────────────────────────────────────────────────────────────────
    h = doc.add_heading("DÉDICACE", level=1)
    h.paragraph_format.space_before = Pt(20)
    h.paragraph_format.space_after = Pt(16)
    
    p_ded = doc.add_paragraph()
    p_ded.paragraph_format.line_spacing = 1.4
    p_ded.add_run("Je dédie ce modeste travail à toute ma famille ainsi qu’à tous ceux qui m’ont soutenu de près et de loin tout au long de mon cursus académique.\n\n")
    p_ded.add_run("Dédicaces toutes particulières à :\n\n")
    p_ded.add_run("•  Mon père, Monsieur SORHO YETIENA, pour son encadrement bienveillant, sa sagesse et ses précieux conseils ;\n")
    p_ded.add_run("•  Ma mère, Madame SORHO SANABA, pour son amour inconditionnel, ses prières constantes et son soutien indéfectible ;\n")
    p_ded.add_run("•  Ma sœur, SORHO ESLIE, pour ses encouragements permanents et son dynamisme réconfortant.\n\n")
    p_ded.add_run("À tous ceux qui ont contribué à faire de moi la personne que je suis aujourd'hui, trouvez ici l’expression de ma profonde gratitude.")
    
    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # 3. REMERCIEMENTS
    # ─────────────────────────────────────────────────────────────────────────
    h = doc.add_heading("REMERCIEMENTS", level=1)
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(14)
    
    p_rem = doc.add_paragraph()
    p_rem.paragraph_format.line_spacing = 1.35
    p_rem.add_run("Au terme de ce travail de fin de cycle, je tiens avant tout à rendre grâce à Dieu Tout-Puissant, pour le souffle de vie, la santé, le discernement et la force qu’Il m’a accordés tout au long de mon parcours.\n\n")
    p_rem.add_run("La réalisation de ce projet d'application et la rédaction de ce présent mémoire ont été rendues possibles grâce à l’assistance et au dévouement de plusieurs personnes à qui j’adresse mes sincères remerciements :\n\n")
    
    p_rem.add_run("•  À mes parents, Monsieur Yetiena SORHO et Madame Sanaba COULIBALY, pour tous les sacrifices consentis, leur accompagnement financier et moral inestimable depuis le premier jour de mes études ;\n")
    p_rem.add_run("•  À la République de Côte d'Ivoire, pour l'ensemble des infrastructures universitaires et le cadre d’excellence offert à la jeunesse estudiantine ;\n")
    p_rem.add_run("•  À l'Institut National Polytechnique Félix Houphouët-Boigny (INP-HB) de Yamoussoukro, pour m'avoir ouvert ses portes et m'avoir prodigué une formation technique d'élite ;\n")
    p_rem.add_run("•  Au Dr Moussa DIABY Abdoul Kader, Directeur Général de l’INP-HB, pour son leadership inspirant et son engagement constant pour le rayonnement de l'institut ;\n")
    p_rem.add_run("•  Au Dr Adama OUATTARA, Directeur de l’École Supérieure d’Industrie (ESI), pour les réformes et la rigueur insufflées au sein de notre école ;\n")
    p_rem.add_run("•  À Monsieur Siriky KONE, Sous-Directeur des Études à l'ESI, pour son écoute attentive, sa disponibilité et ses conseils avisés ;\n")
    p_rem.add_run("•  À Monsieur Louagbeu Loua KPO, Directeur de l’Unité Pédagogique Sciences et Technologies de l’Information et de la Communication (STIC), pour la qualité exceptionnelle du programme de formation et son encadrement stratégique ;\n")
    p_rem.add_run("•  À mon encadreur pédagogique, Monsieur MOUSSOH EDI, Enseignant-chercheur à l’INP-HB/ESI, pour sa disponibilité, ses critiques constructives, ses conseils méthodologiques et sa rigueur scientifique qui ont guidé ce travail ;\n")
    p_rem.add_run("•  À tout le corps professoral et administratif de l’ESI et du département STIC pour leur dévouement et leur transmission passionnée du savoir ;\n")
    p_rem.add_run("•  À la Direction Générale et à l’ensemble du personnel de l’entreprise SOUTARAH GROUP SARL, pour leur accueil chaleureux, leur accompagnement technique au quotidien et la confiance accordée lors de ce stage d'immersion professionnelle.\n")

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # 4. AVANT-PROPOS
    # ─────────────────────────────────────────────────────────────────────────
    h = doc.add_heading("AVANT-PROPOS", level=1)
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(14)
    
    p_av = doc.add_paragraph()
    p_av.paragraph_format.line_spacing = 1.35
    p_av.add_run("L’Institut National Polytechnique Félix HOUPHOUËT-BOIGNY (INP-HB) de Yamoussoukro a été créé par le décret n° 96-678 du 4 septembre 1996, modifié par le décret n° 2016-747 du 27 septembre 2016. Fruit de la fusion de prestigieux établissements historiques (INSET, ENSTP, ENSA, IAB), l’INP-HB regroupe aujourd'hui plusieurs écoles d’ingénieurs et de techniciens de référence internationale, parmi lesquelles l'École Supérieure d’Industrie (ESI).\n\n")
    p_av.add_run("L’ESI forme des cadres intermédiaires et supérieurs hautement qualifiés dans les domaines des sciences de l’ingénieur, du génie électrique, mécanique, informatique et des télécommunications. Dans le cadre de la réforme pédagogique, l’étudiant en cycle de Technicien Supérieur effectue un stage d'application en 2ème année afin de confronter ses acquis théoriques aux réalités techniques et managériales du monde professionnel.\n\n")
    p_av.add_run("C’est dans cette perspective que s'est déroulé notre stage au sein de SOUTARAH GROUP SARL, du 03 Août 2026 au 03 Octobre 2026. Ce projet d'application s'articule autour de la digitalisation complète des processus métiers de l'entreprise à travers la conception et le développement d'une plateforme web intégrée complétée par une application mobile dédiée à la réservation et au suivi de la flotte automobile.")

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # 5. SOMMAIRE DÉTAILLÉ
    # ─────────────────────────────────────────────────────────────────────────
    h = doc.add_heading("SOMMAIRE", level=1)
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(14)
    
    sommaire_items = [
        ("DÉDICACE", "2"),
        ("REMERCIEMENTS", "3"),
        ("AVANT-PROPOS", "4"),
        ("SOMMAIRE", "5"),
        ("LISTE DES FIGURES", "6"),
        ("LISTE DES TABLEAUX", "7"),
        ("LISTE DES ABRÉVIATIONS", "8"),
        ("RÉSUMÉ / ABSTRACT", "9"),
        ("INTRODUCTION GÉNÉRALE", "10"),
        ("PARTIE I : CADRE ET CONTEXTE DU PROJET", "12"),
        ("   Chapitre 1 : Présentation de la structure d’accueil", "13"),
        ("   Chapitre 2 : Présentation du projet", "15"),
        ("PARTIE II : ÉTUDE CONCEPTUELLE", "21"),
        ("   Chapitre 3 : Choix de la méthode d’analyse et modélisation PU/UML", "22"),
        ("PARTIE III : ÉTUDE TECHNIQUE", "28"),
        ("   Chapitre 4 : Conception du système et choix technologiques", "29"),
        ("PARTIE IV : RÉALISATION ET MISE EN ŒUVRE", "36"),
        ("   Chapitre 5 : Mise en œuvre de la plateforme web et de l’application mobile", "37"),
        ("CONCLUSION GÉNÉRALE ET PERSPECTIVES", "47"),
        ("BIBLIOGRAPHIE ET WEBOGRAPHIE", "49"),
        ("ANNEXES", "50"),
    ]
    
    tbl_som = doc.add_table(rows=0, cols=2)
    tbl_som.alignment = WD_TABLE_ALIGNMENT.CENTER
    for title, pg in sommaire_items:
        row = tbl_som.add_row()
        c0, c1 = row.cells
        c0.width = Inches(5.5)
        c1.width = Inches(0.9)
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(2)
        r0 = p0.add_run(title)
        if title.startswith("PARTIE") or title.startswith("DÉDICACE") or title.startswith("INTRODUCTION") or title.startswith("CONCLUSION"):
            r0.bold = True
            r0.font.color.rgb = RGBColor(20, 70, 39)
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p1.paragraph_format.space_after = Pt(2)
        r1 = p1.add_run(pg)
        if r0.bold:
            r1.bold = True

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # 6. LISTE DES FIGURES
    # ─────────────────────────────────────────────────────────────────────────
    h = doc.add_heading("LISTE DES FIGURES", level=1)
    figures = [
        ("Figure 1", "Diagramme de GANTT du projet de développement"),
        ("Figure 2", "Diagramme global des cas d’utilisation (Web & Mobile)"),
        ("Figure 3", "Diagramme des cas d’utilisation détaillé : Espace Réservation Mobile"),
        ("Figure 4", "Diagramme d’activité : Processus de réservation de véhicule avec contrôle de disponibilité"),
        ("Figure 5", "Diagramme d’activité : Processus de génération et téléchargement de devis PDF"),
        ("Figure 6", "Diagramme de séquence : Authentification sécurisée et émission de token JWT"),
        ("Figure 7", "Diagramme de séquence : Réservation mobile et synchronisation backend REST"),
        ("Figure 8", "Diagramme de classes du système d'information SOUTARAH GROUP"),
        ("Figure 9", "Schéma de l’architecture générale du système (3-tiers distribué Web/Mobile)"),
        ("Figure 10", "Structure et schéma relationnel de la base de données MySQL"),
        ("Figure 11", "Interface Web : Page d’accueil et vitrine des pôles d'activités"),
        ("Figure 12", "Interface Web : Catalogue interactif des produits et services"),
        ("Figure 13", "Interface Web : Module de réservation de véhicule et calcul dynamique"),
        ("Figure 14", "Interface Web : Panier multi-articles et édition de devis pro-forma"),
        ("Figure 15", "Interface Web : Espace client et historique des demandes"),
        ("Figure 16", "Application Mobile : Écran de démarrage et accueil du parc automobile"),
        ("Figure 17", "Application Mobile : Fiche détaillée véhicule, options (chauffeur) et calendrier"),
        ("Figure 18", "Application Mobile : Panier de réservation mobile et validation de devis"),
        ("Figure 19", "Application Mobile : Écran « Mes devis » et consultation du devis PDF officiel"),
        ("Figure 20", "Application Mobile : Espace administration mobile et gestion des réservations"),
        ("Figure 21", "Tableau de bord administrateur Back-Office Web"),
        ("Figure 22", "Interface d'administration : Gestion des véhicules et du calendrier d'occupation"),
        ("Figure 23", "Interface d'administration : Traitement et validation des demandes de devis"),
    ]
    tbl_fig = doc.add_table(rows=0, cols=2)
    tbl_fig.alignment = WD_TABLE_ALIGNMENT.CENTER
    for f_id, f_desc in figures:
        row = tbl_fig.add_row()
        c0, c1 = row.cells
        c0.width = Inches(1.5)
        c1.width = Inches(4.9)
        p0, p1 = c0.paragraphs[0], c1.paragraphs[0]
        p0.paragraph_format.space_after = Pt(2)
        p1.paragraph_format.space_after = Pt(2)
        r0 = p0.add_run(f_id)
        r0.bold = True
        r0.font.color.rgb = RGBColor(20, 70, 39)
        p1.add_run(f_desc)

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # 7. LISTE DES TABLEAUX
    # ─────────────────────────────────────────────────────────────────────────
    h = doc.add_heading("LISTE DES TABLEAUX", level=1)
    tableaux = [
        ("Tableau 1", "Planning prévisionnel et chronogramme des tâches"),
        ("Tableau 2", "Étude comparative entre MERISE et PU/UML"),
        ("Tableau 3", "Comparatif des environnements de développement (IDE)"),
        ("Tableau 4", "Comparatif des technologies Frontend Web"),
        ("Tableau 5", "Comparatif des frameworks de développement Mobile"),
        ("Tableau 6", "Comparatif des technologies Backend et API"),
        ("Tableau 7", "Comparatif des outils de maquettage UI/UX"),
        ("Tableau 8", "Comparatif des outils de test et documentation d'API"),
        ("Tableau 9", "Comparatif des Systèmes de Gestion de Bases de Données (SGBD)"),
        ("Tableau 10", "Synthèse globale des choix technologiques de la solution"),
        ("Tableau 11", "Description du dictionnaire des données et tables MySQL"),
        ("Tableau 12", "Cahier de recettes : Résultats des tests fonctionnels Web et Mobile"),
        ("Tableau 13", "Bilan financier estimatif des coûts de développement et d'infrastructure"),
    ]
    tbl_tab = doc.add_table(rows=0, cols=2)
    tbl_tab.alignment = WD_TABLE_ALIGNMENT.CENTER
    for t_id, t_desc in tableaux:
        row = tbl_tab.add_row()
        c0, c1 = row.cells
        c0.width = Inches(1.5)
        c1.width = Inches(4.9)
        p0, p1 = c0.paragraphs[0], c1.paragraphs[0]
        p0.paragraph_format.space_after = Pt(2)
        p1.paragraph_format.space_after = Pt(2)
        r0 = p0.add_run(t_id)
        r0.bold = True
        r0.font.color.rgb = RGBColor(20, 70, 39)
        p1.add_run(t_desc)

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # 8. LISTE DES ABRÉVIATIONS
    # ─────────────────────────────────────────────────────────────────────────
    h = doc.add_heading("LISTE DES ABRÉVIATIONS", level=1)
    abrevs = [
        ("API", "Application Programming Interface (Interface de Programmation d'Application)"),
        ("BTP", "Bâtiment et Travaux Publics"),
        ("CSS", "Cascading Style Sheets"),
        ("ESI", "École Supérieure d'Industrie"),
        ("HTML", "HyperText Markup Language"),
        ("HTTP / HTTPS", "HyperText Transfer Protocol (Secure)"),
        ("IA", "Intelligence Artificielle"),
        ("IDE", "Integrated Development Environment (Environnement de Développement Intégré)"),
        ("INP-HB", "Institut National Polytechnique Félix Houphouët-Boigny"),
        ("JSON", "JavaScript Object Notation"),
        ("JWT", "JSON Web Token"),
        ("LLM", "Large Language Model (Modèle de Langage Avancé)"),
        ("MCD", "Modèle Conceptuel de Données"),
        ("MLD", "Modèle Logique de Données"),
        ("ORM", "Object-Relational Mapping"),
        ("PDF", "Portable Document Format"),
        ("PU", "Processus Unifié"),
        ("REST", "Representational State Transfer"),
        ("SARL", "Société à Responsabilité Limitée"),
        ("SGBD", "Système de Gestion de Base de Données"),
        ("SGBDR", "Système de Gestion de Base de Données Relationnelle"),
        ("SQL", "Structured Query Language"),
        ("STIC", "Sciences et Technologies de l'Information et de la Communication"),
        ("UI / UX", "User Interface / User Experience"),
        ("UML", "Unified Modeling Language"),
    ]
    tbl_abr = doc.add_table(rows=0, cols=2)
    tbl_abr.alignment = WD_TABLE_ALIGNMENT.CENTER
    for a_code, a_def in abrevs:
        row = tbl_abr.add_row()
        c0, c1 = row.cells
        c0.width = Inches(1.6)
        c1.width = Inches(4.8)
        p0, p1 = c0.paragraphs[0], c1.paragraphs[0]
        p0.paragraph_format.space_after = Pt(2)
        p1.paragraph_format.space_after = Pt(2)
        r0 = p0.add_run(a_code)
        r0.bold = True
        r0.font.color.rgb = RGBColor(20, 70, 39)
        p1.add_run(a_def)

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # 9. RÉSUMÉ / ABSTRACT
    # ─────────────────────────────────────────────────────────────────────────
    h = doc.add_heading("RÉSUMÉ", level=1)
    p_res = doc.add_paragraph()
    p_res.paragraph_format.line_spacing = 1.35
    p_res.add_run("Ce projet d'application porte sur la conception et le développement d’une plateforme numérique globale de gestion des services de l’entreprise SOUTARAH GROUP intégrant une application mobile dédiée à la réservation et au suivi de véhicules. Face à une gestion jusqu'alors manuelle des devis, à l’absence de centralisation de la relation client et aux risques critiques de double réservation sur la flotte automobile, l’objectif a été de mettre en place un écosystème numérique unifié.\n\n")
    p_res.add_run("La méthodologie adoptée repose sur le Processus Unifié associé au langage UML (PU/UML) pour la modélisation rigoureuse des besoins et des traitements. La solution logicielle s'appuie sur une architecture client-serveur moderne en trois tiers : une interface web responsive conçue en React.js et Tailwind CSS pour l'ensemble des activités multisectorielles de l'entreprise (location de véhicules, négoce, services techniques, énergies renouvelables, agropastorale, immobilier) ; une application mobile multiplateforme développée sous React Native et Expo spécialisée dans la réservation de véhicules ; et un backend centralisé sous Node.js/Express couplé à une base de données MySQL gérée par l'ORM Sequelize. Le web et le mobile utilisent cette même API et cette même base de données. Hostinger prend en charge PostgreSQL avec certaines formules, mais l'abonnement retenu par l'entreprise ne permettait pas de l'utiliser ; le projet a donc été adapté à MySQL.\n\n")
    p_res.add_run("Les résultats obtenus concrétisent une synchronisation instantanée entre le web et le mobile : algorithme anti-double-réservation de véhicules, génération automatique de devis pro-forma officiels au format PDF sur 2 pages, panier multi-articles synchronisé, notifications par courrier électronique (Brevo) et tableau de bord d'administration complet. Cette solution garantit à SOUTARAH GROUP une rentabilité accrue, une réactivité commerciale optimale et une traçabilité totale des opérations.\n\n")
    r_kw = p_res.add_run("Mots-clés : ")
    r_kw.bold = True
    p_res.add_run("Plateforme numérique, Application mobile, Réservation de véhicules, Devis en ligne PDF, React.js, React Native, Node.js, MySQL, API REST, SOUTARAH GROUP.")

    doc.add_paragraph().paragraph_format.space_after = Pt(10)
    
    h_abs = doc.add_heading("ABSTRACT", level=1)
    p_abs = doc.add_paragraph()
    p_abs.paragraph_format.line_spacing = 1.35
    p_abs.add_run("This application project focuses on the design and development of a comprehensive digital management platform for SOUTARAH GROUP, integrating a dedicated mobile application for vehicle reservation and tracking. Faced with manual quote processing, lack of centralized customer relationship tracking, and critical double-booking risks regarding the vehicle fleet, this project aims to provide a unified digital solution.\n\n")
    p_abs.add_run("The development methodology is based on the Unified Process associated with UML (UP/UML). The software architecture relies on a modern three-tier client-server structure: a responsive web interface developed with React.js and Tailwind CSS covering all corporate sectors (vehicle rental, trade, technical maintenance, renewable energies, agribusiness, real estate); a cross-platform mobile application built with React Native and Expo dedicated to vehicle browsing, instant availability checking, and reservation; and a centralized REST API backend running on Node.js/Express backed by a MySQL database managed via Sequelize ORM. The Hostinger deployment constraint led to this choice instead of the PostgreSQL database initially considered.\n\n")
    p_abs.add_run("The delivered system enables full synchronization between web and mobile interfaces: an automated anti-collision booking algorithm, instant PDF quote generation conforming to corporate standards, synchronized cart management, transactional email notifications, and an exhaustive administrative back-office. This unified digital ecosystem empowers SOUTARAH GROUP with enhanced operational efficiency, superior customer satisfaction, and optimized commercial workflows.\n\n")
    r_kw2 = p_abs.add_run("Keywords: ")
    r_kw2.bold = True
    p_abs.add_run("Digital Platform, Mobile Application, Vehicle Booking, PDF Quote, React.js, React Native, Node.js, MySQL, REST API, SOUTARAH GROUP.")

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # 10. INTRODUCTION GÉNÉRALE
    # ─────────────────────────────────────────────────────────────────────────
    h = doc.add_heading("INTRODUCTION GÉNÉRALE", level=1)
    p_int = doc.add_paragraph()
    p_int.paragraph_format.line_spacing = 1.35
    p_int.add_run("Le secteur des prestations de services constitue l'un des principaux moteurs de la dynamique économique et sociale en Côte d'Ivoire. Représentant une part prépondérante du Produit Intérieur Brut (PIB) et pourvoyeur majeur d'emplois, ce secteur regroupe des activités stratégiques allant du transport et de la logistique au négoce international, en passant par le génie technique et la transition énergétique. Toutefois, l'essor rapide de ces activités confronte les entreprises à des défis organisationnels majeurs : la gestion traditionnelle sur support papier ou tableur non partagé, la lenteur de transmission des devis estimatifs, l'absence de traçabilité client et, tout particulièrement dans le domaine du transport, le risque critique de double réservation de véhicules.\n\n")
    p_int.add_run("Dans ce contexte d'exigence accrue en matière de réactivité et de fiabilité, l'intégration des Technologies de l'Information et de la Communication (TIC) s'impose non plus comme une simple option, mais comme un impératif stratégique de compétitivité. C'est au cœur de cette mutation que s'inscrit le présent projet, mené au sein de l'entreprise multisectorielle SOUTARAH GROUP SARL.\n\n")
    p_int.add_run("Le projet a pour thème : ")
    r_th_it = p_int.add_run("« Conception et développement d’une plateforme numérique de gestion des services de SOUTARAH GROUP intégrant une application mobile dédiée à la réservation de véhicules ».\n\n")
    r_th_it.bold = True
    p_int.add_run("La formulation même de ce thème met en exergue une vision systémique : loin de constituer des projets isolés, la plateforme web globale et l'application mobile spécialisée forment un écosystème logiciel unique et cohérent. D'un côté, le portail web centralise l'ensemble des six pôles d'activités de l'entreprise (Location de véhicules, Négoce / Import-Export, Services techniques BTP, Énergies renouvelables, Agropastorale et Immobilier), la gestion du catalogue, l'édition de devis pro-forma et le back-office d'administration. De l'autre côté, l'application mobile apporte une réponse dédiée et ergonomique à la mobilité des clients pour la consultation instantanée du parc automobile, la vérification de disponibilité sans risque de conflit de dates, et la réservation directe.\n\n")
    p_int.add_run("Le présent rapport rend compte de l'ensemble de la démarche d'ingénierie logicielle suivie et s'articule autour de quatre grandes parties :\n\n")
    p_int.add_run("•  La Première Partie expose le cadre et le contexte du projet, présentant la structure d’accueil SOUTARAH GROUP, l'analyse de l'existant, les objectifs visés, le cahier des charges ainsi que la planification des tâches ;\n")
    p_int.add_run("•  La Deuxième Partie est dédiée à l’étude conceptuelle, détaillant la démarche méthodologique PU/UML et les différents diagrammes de conception (cas d'utilisation, activité, séquence et classes) ;\n")
    p_int.add_run("•  La Troisième Partie développe l’étude technique, justifiant les choix technologiques (React, React Native, Node.js, MySQL) et explicitant l'architecture logicielle globale ;\n")
    p_int.add_run("•  La Quatrième Partie décrit la mise en œuvre pratique de la plateforme web et de l'application mobile, détaillant les fonctionnalités développées, les tests de validation, les résultats obtenus et l'analyse financière du projet.")

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # PARTIE I : CADRE ET CONTEXTE DU PROJET
    # ─────────────────────────────────────────────────────────────────────────
    h_p1 = doc.add_heading("PARTIE I : CADRE ET CONTEXTE DU PROJET", level=1)
    
    # Chapitre 1
    doc.add_heading("CHAPITRE 1 : PRÉSENTATION DE LA STRUCTURE D’ACCUEIL", level=2)
    
    doc.add_heading("I. PRÉSENTATION DE SOUTARAH GROUP", level=3)
    doc.add_heading("1. Présentation générale", level=4)
    p = doc.add_paragraph()
    p.add_run("SOUTARAH GROUP SARL est une entreprise ivoirienne polyvalente et multisectorielle, immatriculée sous le numéro RCCM CI-ABJ-03-2022-B12-03750, dont le siège social est situé à Abidjan (Palmeraie Saint-Viateur). Forte d'un capital social de 10 000 000 FCFA, l'entreprise se positionne comme un partenaire stratégique de référence pour les particuliers, les institutions et les entreprises nationales et internationales.\n\n")
    p.add_run("L'entreprise se distingue par sa capacité à offrir un guichet unique de prestations de haute qualité, éliminant pour ses clients la contrainte de multiplier les intermédiaires pour leurs besoins en logistique, approvisionnement, énergie ou aménagement.")

    doc.add_heading("2. Mission, Vision et Valeurs", level=4)
    p = doc.add_paragraph()
    p.add_run("❖ Mission : Réinventer des services de qualité, fiables et adaptés aux réalités du marché ivoirien et sous-régional, en alliant rigueur opérationnelle et satisfaction client.\n\n")
    p.add_run("❖ Vision : Être le leader et le partenaire privilégié de nos clients grâce à des solutions innovantes, une réactivité exceptionnelle et un standard de qualité sans compromis.\n\n")
    p.add_run("❖ Valeurs de l'entreprise (S.A.P.E) :\n")
    p.add_run("  • S — Solution pérenne et innovante : Concevoir des solutions durables qui créent de la valeur à long terme.\n")
    p.add_run("  • A — Adaptabilité : Faire preuve de flexibilité pour répondre aux exigences spécifiques de chaque client.\n")
    p.add_run("  • P — Priorité client : Placer l'écoute et la satisfaction de l'usager au centre de chaque processus métier.\n")
    p.add_run("  • E — Efficacité du personnel : Valoriser l'expertise technique et le professionnalisme des collaborateurs.")

    doc.add_heading("3. Domaines d'activités", level=4)
    p = doc.add_paragraph()
    p.add_run("SOUTARAH GROUP déploie son expertise autour de six (6) pôles stratégiques complémentaires :\n")
    p.add_run("1. Location de véhicules : Mise à disposition d'une flotte diversifiée (berlines de luxe, SUV 4x4, minibus, utilitaires) avec ou sans chauffeur pour des missions professionnelles ou des déplacements privés à Abidjan et à l'intérieur du pays.\n")
    p.add_run("2. Négoce et Import-Export : Approvisionnement, distribution de matériels de quincaillerie, fournitures industrielles et équipements spécialisés.\n")
    p.add_run("3. Services Techniques et BTP : Entretien d'espaces verts, nettoyage industriel de locaux, maintenance et installations électriques, réhabilitation de bâtiments.\n")
    p.add_run("4. Énergies Renouvelables : Études d'efficacité énergétique, fourniture et installation d'équipements solaires photovoltaïques (kits autonomes, lampadaires solaires, pompage solaire).\n")
    p.add_run("5. Agropastorale : Production végétale, élevage moderne et distribution de produits agricoles sains.\n")
    p.add_run("6. Immobilier : Gestion locative, transactions immobilières et aménagement d'espaces.")

    doc.add_heading("4. Partenariats stratégiques", level=4)
    p = doc.add_paragraph()
    p.add_run("Dans le cadre de ses opérations d'envergure, SOUTARAH GROUP collabore étroitement avec des acteurs de premier plan, notamment BESSAC, DM Company, CIM IVOIRE, Southcomp Polaris et l'agence de développement Enabel.")

    # Chapitre 2
    doc.add_heading("CHAPITRE 2 : PRÉSENTATION DU PROJET", level=2)
    
    doc.add_heading("I. CONTEXTE ET JUSTIFICATION DU PROJET", level=3)
    p = doc.add_paragraph()
    p.add_run("La croissance continue des activités de SOUTARAH GROUP et la diversification de ses pôles ont engendré un volume considérable de demandes de devis et de réservations. Face à cette montée en charge, les mécanismes traditionnels de traitement manuel (courriels isolés, échanges téléphoniques informels, tenue de registres physiques) ont montré leurs limites opérationnelles. L'absence de visibilité en temps réel sur la disponibilité des véhicules de location et le manque de synchronisation entre les services commerciaux et techniques ont motivé la direction à engager la transition numérique intégrale de son écosystème commercial.")

    doc.add_heading("II. OBJECTIFS DU PROJET", level=3)
    doc.add_heading("1. Objectif général", level=4)
    p = doc.add_paragraph()
    p.add_run("L’objectif général est de concevoir et de développer une solution logicielle unifiée comprenant une plateforme web de gestion globale des services et une application mobile dédiée à la réservation de véhicules, toutes deux synchronisées en temps réel via une API REST sécurisée.")

    doc.add_heading("2. Objectifs spécifiques", level=4)
    p = doc.add_paragraph()
    p.add_run("De façon opérationnelle, le projet vise à :\n")
    p.add_run("• Développer un portail web moderne présentant de manière interactive l'ensemble des 6 pôles de services et le catalogue de produits ;\n")
    p.add_run("• Développer une application mobile native (Android / iOS) dédiée à la consultation en direct du parc automobile, à la réservation fluide avec tarification dynamique et au suivi des états de commandes ;\n")
    p.add_run("• Concevoir un système d'authentification unique (JWT) permettant de gérer les comptes particuliers et entreprises partenaires ;\n")
    p.add_run("• Mettre en place un panier multi-articles hybride (véhicules et fournitures) avec moteur de calcul automatisé des taxes (HT, TVA 18%, TDT 2.5%) ;\n")
    p.add_run("• Automatiser la génération de devis pro-forma officiels au format PDF sur 2 pages (avec fiches techniques et visuels) prêts pour impression ou signature électronique ;\n")
    p.add_run("• Intégrer un algorithme anti-double-réservation vérifiant la disponibilité réelle des véhicules sur des plages de dates données ;\n")
    p.add_run("• Développer un tableau de bord d'administration (Back-Office) centralisé pour le pilotage des devis, véhicules, clients et notifications ;\n")
    p.add_run("• Intégrer un système de notification transactionnelle par courrier électronique (via Brevo / SMTP).")

    doc.add_heading("III. ÉTUDE DE L'EXISTANT ET LIMITES", level=3)
    p = doc.add_paragraph()
    p.add_run("L'analyse préalable de l'infrastructure existante a révélé que SOUTARAH GROUP disposait uniquement d'un site web vitrine statique. Ce dernier présentait succinctement l'entreprise mais ne disposait d'aucune composante dynamique de gestion de base de données, ni d'espace d'authentification client, ni de mécanisme de calcul tarifaire automatisé. Les demandes formulées via des formulaires de contact basiques aboutissaient dans une boîte mail générique sans traçabilité, rendant impossible la production de statistiques fiables et occasionnant des retards dans l'édition des devis officiels.")

    doc.add_heading("IV. CAHIER DES CHARGES DU SYSTÈME", level=3)
    p = doc.add_paragraph()
    p.add_run("Le cahier des charges formalise les exigences fonctionnelles et non-fonctionnelles du système interconnecté :\n\n")
    p.add_run("1. Exigences fonctionnelles côté Client (Web & Mobile) :\n")
    p.add_run("  • Consultation détaillée du catalogue des véhicules et produits par catégorie ;\n")
    p.add_run("  • Filtrage multicritère des véhicules (marque, type, transmission, climatisation) ;\n")
    p.add_run("  • Sélection des dates de location avec calcul dynamique selon le barème de destination (Abidjan / Hors Abidjan) et l'option chauffeur (+10 000 FCFA/jour) ;\n")
    p.add_run("  • Gestion du panier d'achats / réservations et validation en un clic ;\n")
    p.add_run("  • Téléchargement instantané du devis pro-forma officiel PDF respectant la charte juridique de l'entreprise ;\n")
    p.add_run("  • Espace personnel de suivi des devis (En attente, Confirmé, Devis signé déposé).\n\n")
    p.add_run("2. Exigences fonctionnelles côté Administrateur :\n")
    p.add_run("  • Supervision globale des indicateurs clés (CA estimé, devis en attente, réservations actives) ;\n")
    p.add_run("  • Gestion complète du parc automobile (ajout, modification, statut de maintenance) ;\n")
    p.add_run("  • Traitement des devis (approbation, rejet, téléversement de devis signés) ;\n")
    p.add_run("  • Gestion des comptes clients et attribution de remises partenaires.\n\n")
    p.add_run("3. Exigences techniques et contraintes :\n")
    p.add_run("  • Sécurité : Hachage des mots de passe en bcrypt, protection des routes API par JWT ;\n")
    p.add_run("  • Disponibilité et performance : Temps de réponse API inférieur à 300 ms ;\n")
    p.add_run("  • Portabilité : Compatibilité navigateurs modernes (Chrome, Safari, Edge) et mobiles (Android 9+, iOS 14+).")

    doc.add_heading("V. PLANIFICATION DES TÂCHES ET DIAGRAMME DE GANTT", level=3)
    p = doc.add_paragraph()
    p.add_run("Le projet s'est déroulé sur une période de deux mois (du 03 Août au 03 Octobre 2026), selon la décomposition chronologique suivante :")

    # Tableau Planning
    tbl_plan = doc.add_table(rows=1, cols=5)
    tbl_plan.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["N°", "Désignation de la tâche", "Date Début", "Durée", "Date Fin"]
    for i, h_txt in enumerate(headers):
        cell = tbl_plan.cell(0, i)
        set_cell_background(cell, "144627")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h_txt)
        r.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    tasks_data = [
        ("1", "Prise de contact, immersion et compréhension du projet", "03/08/2026", "5 j", "07/08/2026"),
        ("2", "Étude de l'existant et rédaction du cahier des charges", "08/08/2026", "4 j", "11/08/2026"),
        ("3", "Modélisation conceptuelle PU/UML et conception de la base", "12/08/2026", "6 j", "17/08/2026"),
        ("4", "Développement de l'API Backend Node.js / Express & MySQL", "18/08/2026", "10 j", "27/08/2026"),
        ("5", "Développement de la Plateforme Web React.js & Tailwind CSS", "28/08/2026", "12 j", "08/09/2026"),
        ("6", "Développement de l'Application Mobile React Native / Expo", "09/09/2026", "12 j", "20/09/2026"),
        ("7", "Tests d'intégration, recette logicielle et corrections", "21/09/2026", "6 j", "26/09/2026"),
        ("8", "Rédaction du mémoire et préparation de la soutenance", "27/09/2026", "7 j", "03/10/2026"),
    ]
    for row_data in tasks_data:
        row = tbl_plan.add_row()
        for i, val in enumerate(row_data):
            c = row.cells[i]
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            if i in [0, 2, 3, 4]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(val)
            r.font.size = Pt(9.5)
            
    doc.add_paragraph().paragraph_format.space_after = Pt(8)
    add_placeholder_box(doc, "Figure 1 : Diagramme de GANTT du projet", "Insérer ici le diagramme de GANTT généré représentant le planning d'exécution du projet.")

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # PARTIE II : ÉTUDE CONCEPTUELLE
    # ─────────────────────────────────────────────────────────────────────────
    doc.add_heading("PARTIE II : ÉTUDE CONCEPTUELLE", level=1)
    
    doc.add_heading("CHAPITRE 3 : CHOIX DE LA MÉTHODE D’ANALYSE ET MODÉLISATION PU/UML", level=2)
    
    doc.add_heading("I. ÉTUDE COMPARATIVE DES MÉTHODES D'ANALYSE", level=3)
    p = doc.add_paragraph()
    p.add_run("La réussite d'un projet informatique complexe requiert une phase d'analyse et de modélisation rigoureuse. Deux approches méthodologiques majeures ont été examinées : la méthode cartésienne MERISE et la démarche orientée objet PU/UML.")

    # Tableau comparatif Merise vs UML
    tbl_comp = doc.add_table(rows=1, cols=3)
    tbl_comp.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_heads = ["Critères d'évaluation", "Méthode MERISE", "Processus Unifié & UML (PU/UML)"]
    for i, h_txt in enumerate(c_heads):
        cell = tbl_comp.cell(0, i)
        set_cell_background(cell, "144627")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h_txt)
        r.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    merise_uml_data = [
        ("Paradigme & Approche", "Séquentielle, séparation stricte données / traitements", "Orientée objet, itérative, incrémentale et centrée sur l'utilisateur"),
        ("Modélisation des données", "MCD, MLD très adaptés aux bases SQL relationnelles", "Diagramme de classes reflétant directement les modèles ORM"),
        ("Modélisation des traitements", "MCT, MLT axés sur les flux d'informations", "Diagrammes de cas d'utilisation, de séquence et d'activité"),
        ("Adaptation aux architectures Web / Mobile", "Rigide pour les applications événementielles et interactives", "Parfaite adéquation avec les frameworks modernes (React, Node.js)"),
        ("Évolution du système", "Reprise lourde des modèles conceptuels en cas de changement", "Intégration fluide de nouvelles fonctionnalités par itération"),
        ("Décision retenue", "Utilisée comme complément pour la structure de base", "Méthode principale retenue pour l'ingénierie globale du système"),
    ]
    for row_data in merise_uml_data:
        row = tbl_comp.add_row()
        for i, val in enumerate(row_data):
            c = row.cells[i]
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            r = p.add_run(val)
            r.font.size = Pt(9)
            if i == 0:
                r.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(8)
    
    doc.add_heading("II. APPLICATION DU PU/UML AU SYSTÈME SOUTARAH GROUP", level=3)
    p = doc.add_paragraph()
    p.add_run("Dans le cadre de notre projet, le système intègre trois acteurs principaux :\n")
    p.add_run("• Le Visiteur / Client : consulte le catalogue, compose son panier multi-services sur le Web, effectue des réservations de véhicules sur l'application Mobile et télécharge ses devis PDF ;\n")
    p.add_run("• L'Administrateur : supervise l'ensemble des opérations, gère la flotte, met à jour les tarifs et valide les devis ;\n")
    p.add_run("• Le Système / API REST : applique les règles métier, contrôle les disponibilités et orchestre la distribution des notifications.")

    doc.add_heading("1. Diagrammes des cas d'utilisation", level=4)
    p = doc.add_paragraph()
    p.add_run("Le diagramme global des cas d'utilisation illustre les interactions des acteurs avec les deux volets de la plateforme (Web et Mobile).")
    add_placeholder_box(doc, "Figure 2 : Diagramme global des cas d’utilisation (Web & Mobile)", "Insérer ici le diagramme UML Use Case global présentant les rôles Client et Administrateur.")

    p = doc.add_paragraph()
    p.add_run("Le diagramme ci-dessous détaille le volet spécifique de l'application mobile dédiée à la réservation de véhicules.")
    add_placeholder_box(doc, "Figure 3 : Diagramme des cas d’utilisation : Espace Réservation Mobile", "Insérer ici le diagramme UML Use Case dédié aux fonctionnalités mobiles (Recherche, Vérification, Réservation, PDF).")

    doc.add_heading("2. Diagrammes d'activité", level=4)
    p = doc.add_paragraph()
    p.add_run("Le diagramme d'activité suivant explicite la cinématique de réservation de véhicule, mettant en relief le contrôle algorithmique anti-collision des dates.")
    add_placeholder_box(doc, "Figure 4 : Diagramme d’activité : Processus de réservation de véhicule", "Insérer ici le diagramme d'activité décrivant le parcours client du choix des dates à la confirmation.")

    p = doc.add_paragraph()
    p.add_run("Le second diagramme d'activité décrit le flux de constitution du panier multi-services et la génération automatique du devis PDF officiel.")
    add_placeholder_box(doc, "Figure 5 : Diagramme d’activité : Génération et téléchargement de devis PDF", "Insérer ici le diagramme d'activité illustrant le traitement de devis depuis la sélection des articles jusqu'au PDF.")

    doc.add_heading("3. Diagrammes de séquence", level=4)
    p = doc.add_paragraph()
    p.add_run("Le diagramme de séquence ci-après modélise le processus d'authentification sécurisée par jeton JWT entre le client mobile/web, le serveur d'API et la base MySQL.")
    add_placeholder_box(doc, "Figure 6 : Diagramme de séquence : Authentification sécurisée et JWT", "Insérer ici le diagramme de séquence UML relatif au login et à la transmission du token.")

    p = doc.add_paragraph()
    p.add_run("Le diagramme suivant détaille la chaîne d'appels asynchrones lors d'une validation de réservation depuis l'application mobile.")
    add_placeholder_box(doc, "Figure 7 : Diagramme de séquence : Réservation mobile et synchronisation REST", "Insérer ici le diagramme de séquence représentant les échanges Mobile -> API -> DB -> Service Email.")

    doc.add_heading("4. Diagramme de classes", level=4)
    p = doc.add_paragraph()
    p.add_run("Le diagramme de classes représente la structure statique du domaine métier, mettant en lumière les entités fondamentales : Utilisateur, Client, Entreprise, Vehicule, Reservation, Service, Produit, Devis, DevisItem et Notification.")
    add_placeholder_box(doc, "Figure 8 : Diagramme de classes du système d'information", "Insérer ici le diagramme de classes UML avec attributs, méthodes et cardinalités relationnelles.")

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # PARTIE III : ÉTUDE TECHNIQUE
    # ─────────────────────────────────────────────────────────────────────────
    doc.add_heading("PARTIE III : ÉTUDE TECHNIQUE", level=1)
    
    doc.add_heading("CHAPITRE 4 : CONCEPTION DU SYSTÈME ET CHOIX TECHNOLOGIQUES", level=2)
    
    doc.add_heading("I. ANALYSE ET JUSTIFICATION DES CHOIX TECHNOLOGIQUES", level=3)
    p = doc.add_paragraph()
    p.add_run("Le choix des briques technologiques a été guidé par des critères d'interopérabilité, de performance, de sécurité et d'évolutivité logicielle.")

    doc.add_heading("1. Environnement de développement (IDE)", level=4)
    p = doc.add_paragraph()
    p.add_run("Visual Studio Code a été sélectionné pour sa légèreté, son support natif de l'écosystème JavaScript/TypeScript, ses extensions pour React, React Native, Node.js et MySQL, ainsi que son terminal intégré.")

    doc.add_heading("2. Technologies Frontend Web", level=4)
    p = doc.add_paragraph()
    p.add_run("Pour la plateforme web, le framework React.js (v18) couplé à Tailwind CSS a été choisi. Son architecture basée sur le DOM virtuel et les composants réutilisables permet d'offrir une interface réactive et modulaire, facilitant la navigation fluide entre le catalogue, le panier interactif et le tableau de bord administrateur.")

    doc.add_heading("3. Technologies Mobile", level=4)
    p = doc.add_paragraph()
    p.add_run("Pour le volet mobile, React Native associé à l'écosystème Expo a été retenu. Cette technologie offre un code unique en TypeScript/JavaScript compilé nativement pour Android et iOS, garantissant des performances élevées, un accès aisé aux fonctionnalités matérielles (système de fichiers, partage PDF) et une réduction substantielle des coûts de développement.")

    doc.add_heading("4. Technologies Backend et API", level=4)
    p = doc.add_paragraph()
    p.add_run("Le serveur applicatif repose sur Node.js et le framework Express.js. Ce choix permet de conserver le même langage (JavaScript/TypeScript) sur toute la chaîne logicielle (Full-Stack JS). L'architecture REST sans état (Stateless) basée sur des échanges JSON et sécurisée par des jetons JWT garantit une parfaite scalabilité et alimente indifféremment l'application Web et l'application Mobile.")

    doc.add_heading("5. Système de Gestion de Base de Données (SGBD)", level=4)
    p = doc.add_paragraph()
    p.add_run("Le SGBD relationnel MySQL a été retenu, couplé à l'ORM Sequelize. Hostinger prend en charge PostgreSQL avec certaines formules, mais l'abonnement souscrit par l'entreprise pour le domaine soutarahgroup.com ne permettait pas d'utiliser ce SGBD. Le projet a donc été adapté à MySQL, sans modification des fonctionnalités métier. MySQL assure l'intégrité référentielle des données, la gestion des contraintes d'unicité et le stockage structuré des historiques de devis et réservations.")

    # Synthèse globale des technos
    doc.add_heading("6. Synthèse des technologies retenues", level=4)
    tbl_tech = doc.add_table(rows=1, cols=3)
    tbl_tech.alignment = WD_TABLE_ALIGNMENT.CENTER
    heads_tech = ["Domaine / Composant", "Technologie retenue", "Rôle principal dans l'écosystème"]
    for i, h_txt in enumerate(heads_tech):
        cell = tbl_tech.cell(0, i)
        set_cell_background(cell, "144627")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h_txt)
        r.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    tech_data = [
        ("Plateforme Web Client & Admin", "React.js, Tailwind CSS, Lucide Icons", "Portail web responsive tous services & Back-Office"),
        ("Application Mobile Spécialisée", "React Native, Expo, React Navigation", "Application mobile dédiée réservation de véhicules"),
        ("Serveur Applicatif & API", "Node.js, Express.js, JWT, Bcrypt", "API REST centralisée et logique métier partagée"),
        ("Base de Données & Mapping", "MySQL, Sequelize ORM, mysql2", "Stockage persistant relationnel et intégrité ACID"),
        ("Génération de Documents", "expo-print, expo-sharing, HTML5/CSS3", "Génération dynamique de devis officiels PDF"),
        ("Notifications & Messagerie", "Brevo SMTP, Nodemailer", "Envoi d'e-mails transactionnels aux clients et managers"),
    ]
    for row_data in tech_data:
        row = tbl_tech.add_row()
        for i, val in enumerate(row_data):
            c = row.cells[i]
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            r = p.add_run(val)
            r.font.size = Pt(9.5)
            if i == 0:
                r.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    doc.add_heading("II. ARCHITECTURE GÉNÉRALE DU SYSTÈME", level=3)
    p = doc.add_paragraph()
    p.add_run("L’architecture globale du système repose sur un modèle distribué en trois niveaux (3-tiers) garantissant un découplage total entre la présentation, la logique applicative et la persistance des données :\n")
    p.add_run("1. Niveau Présentation (Frontend) : composé de la Plateforme Web (React) accessible depuis tout navigateur et de l'Application Mobile (React Native) installée sur smartphone ;\n")
    p.add_run("2. Niveau Métier (Backend) : l'API REST Node.js/Express qui centralise l'authentification, le traitement des paniers, l'orchestration des devis et la vérification des plannings automobiles ;\n")
    p.add_run("3. Niveau Données (Database) : la base MySQL stockant les entités de manière normalisée.")

    add_placeholder_box(doc, "Figure 9 : Schéma de l’architecture générale du système (Web & Mobile)", "Insérer ici le schéma d'architecture 3-tiers illustrant la connexion Web & Mobile vers l'API REST et MySQL.")

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # PARTIE IV : RÉALISATION ET MISE EN ŒUVRE
    # ─────────────────────────────────────────────────────────────────────────
    doc.add_heading("PARTIE IV : RÉALISATION ET MISE EN ŒUVRE", level=1)
    
    doc.add_heading("CHAPITRE 5 : MISE EN ŒUVRE DE LA PLATEFORME ET DE L'APPLICATION MOBILE", level=2)
    
    doc.add_heading("I. MISE EN PLACE DE LA BASE DE DONNÉES POSTGRESQL", level=3)
    p = doc.add_paragraph()
    p.add_run("La base de données MySQL a été conçue pour garantir la cohérence des flux transactionnels. Elle regroupe les tables principales suivantes :\n")
    p.add_run("• Utilisateurs & Clients : gestion des identifiants (email, mot de passe hashé, rôle 'CLIENT' ou 'ADMIN') et liaisons vers les profils particuliers ou entreprises ;\n")
    p.add_run("• Véhicules : immatriculation, marque, modèle, catégorie, tarif journalier, statut ('DISPONIBLE', 'LOUE', 'MAINTENANCE'), photographies ;\n")
    p.add_run("• Réservations : dates de début et de fin, option avec/sans chauffeur, montant total, statut ('PENDING', 'CONFIRMED', 'CANCELLED') ;\n")
    p.add_run("• Services & Produits : catalogue général des 6 pôles avec caractéristiques techniques et tarifs ;\n")
    p.add_run("• Devis & DevisItems : référence unique (ex: DMD-2026-XXXX), date de création, montant HT/TTC, statut et lien vers le fichier PDF signé ;\n")
    p.add_run("• Notifications : alertes émises à destination des clients et administrateurs.")

    add_placeholder_box(doc, "Figure 10 : Structure et schéma relationnel de la base de données MySQL", "Insérer ici le schéma relationnel des tables de la base de données généré sous phpMyAdmin ou DBeaver.")

    doc.add_heading("II. RÉALISATION DES INTERFACES DE LA PLATEFORME WEB", level=3)
    p = doc.add_paragraph()
    p.add_run("Le portail web a été développé dans une esthétique moderne respectant la charte graphique de SOUTARAH GROUP (vert profond #144627 et teintes sobres) :")

    doc.add_heading("1. Page d'accueil et présentation des services", level=4)
    p = doc.add_paragraph()
    p.add_run("La page d'accueil constitue la vitrine d'entrée. Elle présente l'histoire, les valeurs S.A.P.E, les pôles d'activités et intègre un assistant virtuel intelligent orientant les usagers.")
    add_placeholder_box(doc, "Figure 11 : Interface Web : Page d’accueil et vitrine des services", "Insérer ici la capture d'écran de la page d'accueil du site web.")

    doc.add_heading("2. Catalogue des produits et pôle négoce / énergies", level=4)
    p = doc.add_paragraph()
    p.add_run("Permet aux clients de parcourir les fournitures, matériels de construction, kits solaires et outillages, avec possibilité d'ajout direct au panier.")
    add_placeholder_box(doc, "Figure 12 : Interface Web : Catalogue interactif des produits", "Insérer ici la capture d'écran du catalogue web de produits.")

    doc.add_heading("3. Module de réservation de véhicules et estimation dynamique", level=4)
    p = doc.add_paragraph()
    p.add_run("Permet la sélection d'un véhicule, le choix précis des dates de prise en charge et de restitution, et l'option avec chauffeur.")
    add_placeholder_box(doc, "Figure 13 : Interface Web : Module de réservation de véhicules", "Insérer ici la capture d'écran de la page de réservation de véhicule sur le site web.")

    doc.add_heading("4. Panier multi-articles et génération de devis PDF", level=4)
    p = doc.add_paragraph()
    p.add_run("Le panier regroupe à la fois les réservations de véhicules et les produits physiques, calcule les taxes réglementaires et génère le devis pro-forma téléchargeable instantanément.")
    add_placeholder_box(doc, "Figure 14 : Interface Web : Panier interactif et édition du devis", "Insérer ici la capture d'écran de la page Panier du site web.")

    doc.add_heading("5. Espace Client et suivi des demandes", level=4)
    p = doc.add_paragraph()
    p.add_run("Offre à l'utilisateur authentifié une vue d'ensemble de ses devis en cours, l'état de validation par l'administration et l'accès à ses documents signés.")
    add_placeholder_box(doc, "Figure 15 : Interface Web : Espace client et historique des devis", "Insérer ici la capture d'écran de l'espace client web.")

    doc.add_heading("III. RÉALISATION DE L'APPLICATION MOBILE DÉDIÉE À LA RÉSERVATION", level=3)
    p = doc.add_paragraph()
    p.add_run("L'application mobile 'SOUTARAH Mobile' apporte une réponse sur mesure à la mobilité en se focalisant sur le service de location de véhicules :")

    doc.add_heading("1. Écran d'accueil et consultation du parc automobile", level=4)
    p = doc.add_paragraph()
    p.add_run("L'écran d'accueil affiche les véhicules disponibles catégorisés (SUV, Berlines, Utilitaires) avec filtres dynamiques, tarif journalier et visuels haute définition.")
    add_placeholder_box(doc, "Figure 16 : Application Mobile : Écran d’accueil et catalogue automobile", "Insérer ici la capture d'écran de l'accueil de l'application mobile.")

    doc.add_heading("2. Fiche détaillée du véhicule et sélection des dates", level=4)
    p = doc.add_paragraph()
    p.add_run("Présente les caractéristiques techniques du véhicule (climatisation, boîte de vitesses, carburant), intègre un sélecteur de calendrier et calcule instantanément le coût total selon la destination et l'option chauffeur.")
    add_placeholder_box(doc, "Figure 17 : Application Mobile : Fiche véhicule et choix des dates", "Insérer ici la capture d'écran de la fiche détaillée d'un véhicule sur mobile.")

    doc.add_heading("3. Panier mobile et validation de commande", level=4)
    p = doc.add_paragraph()
    p.add_run("Permet d'ajuster les quantités ou durées de location, de renseigner des instructions particulières de livraison et de valider la demande en temps réel.")
    add_placeholder_box(doc, "Figure 18 : Application Mobile : Panier mobile et récapitulatif financier", "Insérer ici la capture d'écran de l'écran Panier de l'application mobile.")

    doc.add_heading("4. Écran « Mes Devis » et téléchargement du devis PDF officiel", level=4)
    p = doc.add_paragraph()
    p.add_run("Permet au client de consulter la liste de ses demandes (statuts 'En attente', 'Confirmé') et de télécharger directement le document PDF officiel de 2 pages conforme aux normes de SOUTARAH GROUP.")
    add_placeholder_box(doc, "Figure 19 : Application Mobile : Écran « Mes Devis » et aperçu PDF", "Insérer ici la capture d'écran de l'écran Mes Devis de l'application mobile.")

    doc.add_heading("5. Espace Administration et profil mobile", level=4)
    p = doc.add_paragraph()
    p.add_run("Permet aux gestionnaires de SOUTARAH GROUP de consulter les alertes de réservation et de modifier l'état des demandes directement depuis leur terminal mobile.")
    add_placeholder_box(doc, "Figure 20 : Application Mobile : Espace administration et profil", "Insérer ici la capture d'écran de l'espace administration mobile.")

    doc.add_heading("IV. RÉALISATION DE L'ESPACE ADMINISTRATEUR (BACK-OFFICE WEB)", level=3)
    p = doc.add_paragraph()
    p.add_run("Le Back-Office Web constitue la tour de contrôle de l'entreprise. Il intègre :\n")
    p.add_run("• Tableau de bord : graphiques de performance, chiffre d'affaires prévisionnel, nombre de devis et réservations en cours ;\n")
    p.add_run("• Gestion du parc : ajout de nouveaux véhicules, mise à jour des prix journaliers et blocage des dates pour entretien ;\n")
    p.add_run("• Traitement des devis : validation, modification des montants et téléversement de devis signés téléchargeables par les clients.")

    add_placeholder_box(doc, "Figure 21 : Tableau de bord administrateur Back-Office Web", "Insérer ici la capture d'écran du Dashboard administrateur.")
    add_placeholder_box(doc, "Figure 22 : Interface d’administration : Gestion de la flotte automobile", "Insérer ici la capture d'écran du module de gestion des véhicules.")
    add_placeholder_box(doc, "Figure 23 : Interface d’administration : Validation et traitement des devis", "Insérer ici la capture d'écran de la gestion des devis.")

    doc.add_heading("V. TESTS FONCTIONNELS ET VALIDATION RECTTE", level=3)
    p = doc.add_paragraph()
    p.add_run("Une campagne exhaustive de tests a été conduite afin de valider la robustesse et l'intégrité de la solution interconnectée :")

    # Tableau de recette
    tbl_rec = doc.add_table(rows=1, cols=4)
    tbl_rec.alignment = WD_TABLE_ALIGNMENT.CENTER
    heads_rec = ["Module / Fonctionnalité", "Scénario de test exécuté", "Résultat attendu", "Statut"]
    for i, h_txt in enumerate(heads_rec):
        cell = tbl_rec.cell(0, i)
        set_cell_background(cell, "144627")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h_txt)
        r.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    rec_data = [
        ("Authentification", "Connexion utilisateur avec email et mot de passe valide", "Attribution du token JWT et ouverture de session", "CONFORME"),
        ("Sécurité API", "Tentative d'accès à une route d'administration sans privilège", "Blocage requête et réponse HTTP 403 Forbidden", "CONFORME"),
        ("Catalogue Web", "Navigation et filtrage des produits multi-pôles", "Affichage instantané des articles correspondants", "CONFORME"),
        ("Réservation Mobile", "Sélection d'un véhicule et choix des dates de location", "Calcul dynamique exact du tarif (durée x prix + option chauffeur)", "CONFORME"),
        ("Contrôle Disponibilité", "Tentative de réservation sur une période déjà attribuée", "Alerte de conflit de dates et blocage de la soumission", "CONFORME"),
        ("Génération Devis PDF", "Validation du panier et téléchargement du document PDF", "Génération automatique d'un PDF 2 pages conforme aux normes", "CONFORME"),
        ("Synchronisation DB", "Validation d'une commande mobile et vérification dans le Back-Office", "Apparition immédiate de la commande dans la liste admin", "CONFORME"),
        ("Notifications E-mail", "Transmission d'une nouvelle demande de devis", "Réception automatique d'un courriel d'alerte via Brevo", "CONFORME"),
    ]
    for row_data in rec_data:
        row = tbl_rec.add_row()
        for i, val in enumerate(row_data):
            c = row.cells[i]
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            r = p.add_run(val)
            r.font.size = Pt(9)
            if i == 3:
                r.bold = True
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                r.font.color.rgb = RGBColor(21, 128, 61)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    doc.add_heading("VI. ÉTUDE FINANCIÈRE ET ESTIMATION DES COÛTS", level=3)
    doc.add_heading("1. Coûts matériels et logiciels", level=4)
    p = doc.add_paragraph()
    p.add_run("L'ensemble des technologies de développement retenues (React, React Native, Node.js, MySQL, Sequelize et Expo) reposant principalement sur des outils accessibles gratuitement, les coûts logiciels de développement direct sont nuls. Les dépenses concernent surtout le nom de domaine, l'hébergement Hostinger et les terminaux de test mobile.")

    doc.add_heading("2. Coûts d'hébergement et de maintenance", level=4)
    p = doc.add_paragraph()
    p.add_run("Pour le déploiement en production, les coûts annuels estimés se décomposent comme suit :")

    tbl_cost = doc.add_table(rows=1, cols=3)
    tbl_cost.alignment = WD_TABLE_ALIGNMENT.CENTER
    heads_cost = ["Poste de dépense", "Description technique", "Coût Annuel Estimé (FCFA)"]
    for i, h_txt in enumerate(heads_cost):
        cell = tbl_cost.cell(0, i)
        set_cell_background(cell, "144627")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h_txt)
        r.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    cost_data = [
        ("Nom de domaine & SSL", "Nom de domaine .ci / .com + Certificat SSL Let's Encrypt", "35 000 FCFA"),
        ("Hébergement Hostinger", "Hébergement du domaine soutarahgroup.com, de l'API Node.js et de la base MySQL", "240 000 FCFA"),
        ("Service SMTP Transactionnel", "Envoi d'e-mails professionnels (Brevo - Forfait Pro)", "90 000 FCFA"),
        ("Comptes Développeurs Mobiles", "Google Play Store (unique) & Apple Developer (annuel)", "75 000 FCFA"),
        ("Maintenance préventive", "Sauvegardes automatisées, mises à jour de sécurité et support", "180 000 FCFA"),
        ("TOTAL ESTIMATIF ANNUEL", "Budget global de fonctionnement et d'hébergement", "620 000 FCFA"),
    ]
    for row_data in cost_data:
        row = tbl_cost.add_row()
        for i, val in enumerate(row_data):
            c = row.cells[i]
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            r = p.add_run(val)
            r.font.size = Pt(9.5)
            if row_data == cost_data[-1]:
                r.bold = True
                set_cell_background(c, "F1F5F9")
                if i == 2:
                    r.font.color.rgb = RGBColor(20, 70, 39)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    doc.add_heading("3. Perspectives de rentabilité et retour sur investissement (ROI)", level=4)
    p = doc.add_paragraph()
    p.add_run("L'automatisation du processus de réservation et de génération des devis permet à SOUTARAH GROUP de réduire de plus de 80% le temps administratif consacré au traitement d'un dossier client (passant de 45 minutes à moins de 3 minutes). Cette réactivité commerciale immédiate, conjuguée à la suppression totale des pertes d'exploitation liées aux doubles réservations, permet un retour sur investissement complet dès le premier trimestre d'exploitation.")

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # CONCLUSION GÉNÉRALE ET PERSPECTIVES
    # ─────────────────────────────────────────────────────────────────────────
    h = doc.add_heading("CONCLUSION GÉNÉRALE ET PERSPECTIVES", level=1)
    p_ccl = doc.add_paragraph()
    p_ccl.paragraph_format.line_spacing = 1.35
    p_ccl.add_run("Au terme de ce stage d'application effectué au sein de l'entreprise SOUTARAH GROUP, nous avons mené à bien la conception et la réalisation intégrale d'une solution numérique unifiée, répondant au thème : ")
    r_th_ccl = p_ccl.add_run("« Conception et développement d’une plateforme numérique de gestion des services de SOUTARAH GROUP intégrant une application mobile dédiée à la réservation de véhicules ».\n\n")
    r_th_ccl.bold = True
    p_ccl.add_run("Ce projet a permis de transformer en profondeur les pratiques commerciales de l'entreprise en substituant aux méthodes manuelles un écosystème logiciel moderne, cohérent et interconnecté. L'approche méthodologique rigoureuse basée sur le Processus Unifié et la modélisation UML (PU/UML) a garanti une analyse précise des besoins et une structuration cohérente de la base de données relationnelle MySQL. Le choix de MySQL a été confirmé lors de la préparation du déploiement sur Hostinger.\n\n")
    p_ccl.add_run("Sur le plan technique, la synergie entre la plateforme web développée sous React.js et l'application mobile conçue sous React Native/Expo, toutes deux articulées autour d'une API REST Node.js/Express, a permis d'atteindre l'ensemble des objectifs fixés. Les utilisateurs disposent désormais d'une visibilité totale sur les 6 pôles de l'entreprise, d'un module de réservation fluide avec algorithme anti-double-réservation, d'un panier multi-articles interactif et d'un outil de génération instantanée de devis officiels au format PDF.\n\n")
    p_ccl.add_run("Sur le plan personnel et académique, ce projet a constitué une expérience particulièrement enrichissante. Il nous a permis de consolider nos acquis théoriques reçus à l'École Supérieure d’Industrie (ESI) de l'INP-HB, d'appréhender les contraintes de l'ingénierie logicielle en milieu professionnel et de maîtriser des technologies full-stack de pointe.\n\n")
    p_ccl.add_run("Comme perspectives d’évolution, la solution conçue offre une architecture hautement évolutive permettant d'envisager à court et moyen termes :\n")
    p_ccl.add_run("1. L'intégration d'une passerelle de paiement mobile en ligne (Orange Money, MTN MoMo, Wave, Moov Money et cartes bancaires) pour le règlement direct d'acomptes sécurisés ;\n")
    p_ccl.add_run("2. L'implémentation d'un module de géolocalisation et télématique GPS en temps réel sur la flotte de véhicules connectés ;\n")
    p_ccl.add_run("3. Le déploiement de notifications Push natives (via Firebase Cloud Messaging) pour alerter les clients de la confirmation de leurs réservations ;\n")
    p_ccl.add_run("4. L'extension du modèle vers la signature électronique certifiée des contrats de location directement depuis l'écran tactile du smartphone.")

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # BIBLIOGRAPHIE ET WEBOGRAPHIE
    # ─────────────────────────────────────────────────────────────────────────
    h = doc.add_heading("BIBLIOGRAPHIE ET WEBOGRAPHIE", level=1)
    p_bib = doc.add_paragraph()
    p_bib.paragraph_format.line_spacing = 1.35
    p_bib.add_run("I. OUVRAGES ET COURS ACADÉMIQUES :\n")
    p_bib.add_run("[1] ROQUES, Pascal. « UML 2 par la pratique : Études de cas et exercices corrigés », Éditions Eyrolles, 7e édition, 2021.\n")
    p_bib.add_run("[2] TARDIEU, Hubert, ROCHFELD, Arnold, COLETTI, René. « La méthode MERISE : Principes et outils », Éditions d'Organisation, 2000.\n")
    p_bib.add_run("[3] Support de cours INP-HB / ESI - STIC : « Conception des Systèmes d'Information et Modélisation Objet UML », Département STIC, 2025.\n")
    p_bib.add_run("[4] Support de cours INP-HB / ESI - STIC : « Développement Web Avancé et Architectures Distribuées », Département STIC, 2025.\n\n")
    p_bib.add_run("II. DOCUMENTATIONS OFFICIELLES ET WEBOGRAPHIE :\n")
    p_bib.add_run("[5] Documentation officielle React.js : https://react.dev (Consulté en Août-Septembre 2026).\n")
    p_bib.add_run("[6] Documentation officielle React Native & Expo : https://reactnative.dev et https://docs.expo.dev (Consulté en Septembre 2026).\n")
    p_bib.add_run("[7] Documentation officielle Node.js & Express.js : https://nodejs.org et https://expressjs.com (Consulté en Août 2026).\n")
    p_bib.add_run("[8] Documentation officielle MySQL & Sequelize ORM : https://www.mysql.com et https://sequelize.org (Consulté en Août 2026).\n")
    p_bib.add_run("[9] Documentation officielle Tailwind CSS : https://tailwindcss.com (Consulté en Août 2026).\n")
    p_bib.add_run("[10] Site institutionnel de SOUTARAH GROUP : https://soutarahgroup.com (Consulté en Août 2026).")

    # Enregistrement du fichier Word
    file_path = "c:\\Users\\HP\\Downloads\\PARCOURS TS\\STAGE\\STAGE TS STIC 2\\site-soutarah\\Rapport_de_Stage_SORHO_DAVID_SOUTARAH.docx"
    doc.save(file_path)
    print(f"Rapport généré avec succès : {file_path}")

if __name__ == "__main__":
    build_document()
