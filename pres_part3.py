import os
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pres_common import (
    LOGO_DARK_GREEN, LOGO_BRAND_GREEN, LOGO_LEAF_LIME, LIME_LIGHT_BG, MINT_LIGHT_BG,
    DARK_CARD_BG, DARK_CARD_BORDER, LIGHT_BG, CARD_BG, CARD_BORDER,
    TEXT_DARK, TEXT_BODY, TEXT_MUTED, TEXT_WHITE, TABLE_HEADER_BG, ROW_ALT_BG,
    FONT_HEADING, FONT_BODY, set_slide_background, add_header, add_footer,
    add_card, add_badge, create_section_divider, place_image_in_box
)

def build_part3(prs):
    blank_layout = prs.slide_layouts[6]

    # ==========================================
    # SLIDE 28 : INTERCALAIRE PARTIE III
    # ==========================================
    create_section_divider(prs, 28, 3,
                           "PARTIE III : ARCHITECTURE & CHOIX TECHNOLOGIQUES",
                           "Environnement de développement, chaîne Full JavaScript, justification de la sélection du SGBD MySQL, services tiers et architecture 3-tiers.")

    # ==========================================
    # SLIDE 29 : CHAÎNE FULL JAVASCRIPT
    # ==========================================
    s29 = prs.slides.add_slide(blank_layout)
    set_slide_background(s29, prs, LIGHT_BG)
    add_header(s29, "Stack Technique", "Une Chaîne Technologique Full JavaScript Cohérente",
               "L'adoption d'un écosystème unifié pour maximiser la productivité et la fluidité des échanges")

    tech_stack = [
        ("FRONTEND WEB", "React.js & CSS",
         "Interface web réactive, composants modulaires, Virtual DOM ultra-rapide et respect strict de la charte visuelle SOUTARAH."),
        ("APPLICATION MOBILE", "React Native & Expo",
         "Code JavaScript mutualisé compilé nativement pour smartphones Android et iOS avec des composants tactiles intuitifs."),
        ("BACKEND SERVEUR", "Node.js & Express",
         "Serveur d'API RESTful asynchrone non bloquant gérant efficacement de multiples requêtes simultanées et la génération PDF."),
        ("BASE DE DONNÉES", "MySQL & Sequelize",
         "Système relationnel robuste couplé à un ORM objet garantissant l'intégrité référentielle et la sécurité des requêtes SQL.")
    ]
    coords_grid = [
        (Inches(0.8), Inches(1.85)),
        (Inches(6.8), Inches(1.85)),
        (Inches(0.8), Inches(4.35)),
        (Inches(6.8), Inches(4.35))
    ]
    for idx, (tag, title, desc) in enumerate(tech_stack):
        cx, cy = coords_grid[idx]
        add_card(s29, cx, cy, Inches(5.72), Inches(2.25), top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s29, cx + Inches(0.25), cy + Inches(0.2), Inches(2.5), Inches(0.3), tag)
        
        tb = s29.shapes.add_textbox(cx + Inches(0.25), cy + Inches(0.65), Inches(5.2), Inches(1.5))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(13.5)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK
        
        pd = tf.add_paragraph()
        pd.space_before = Pt(4)
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = TEXT_BODY

    add_footer(s29, 29)

    # ==========================================
    # SLIDE 30 : OUTILS DE PRODUCTIVITÉ
    # ==========================================
    s30 = prs.slides.add_slide(blank_layout)
    set_slide_background(s30, prs, LIGHT_BG)
    add_header(s30, "Environnement de Travail", "Outils de Conception, Modélisation et Productivité",
               "Une suite d'outils modernes pour sécuriser la conception logicielle et le cycle de développement")

    tools = [
        ("01", "ÉDITEUR DE CODE", "Visual Studio Code",
         "IDE polyvalent avec écosystème d'extensions pour JavaScript, le débogage interactif et l'analyse statique du code (ESLint)."),
        ("02", "MAQUETTAGE UI/UX", "Figma",
         "Conception des wireframes et prototypes interactifs des écrans web et mobile, garantissant une ergonomie validée en amont."),
        ("03", "MODÉLISATION UML", "PlantUML",
         "Génération déclarative des diagrammes fonctionnels et techniques directement à partir de scripts textuels maintenables."),
        ("04", "CONTRÔLE DE VERSION", "Git & GitHub",
         "Gestionnaire de versions distribué pour l'historisation des commits, la traçabilité des évolutions et la sauvegarde sécurisée.")
    ]
    for idx, (num, tag, title, desc) in enumerate(tools):
        cx, cy = coords_grid[idx]
        add_card(s30, cx, cy, Inches(5.72), Inches(2.25), top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s30, cx + Inches(0.25), cy + Inches(0.2), Inches(0.55), Inches(0.3), num)
        
        tb = s30.shapes.add_textbox(cx + Inches(0.95), cy + Inches(0.2), Inches(4.5), Inches(1.8))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        pk = tf.paragraphs[0]
        pk.text = tag
        pk.font.name = FONT_HEADING
        pk.font.size = Pt(8.5)
        pk.font.bold = True
        pk.font.color.rgb = LOGO_BRAND_GREEN
        
        pt = tf.add_paragraph()
        pt.space_before = Pt(2)
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK
        
        pd = tf.add_paragraph()
        pd.space_before = Pt(4)
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = TEXT_BODY

    add_footer(s30, 30)

    # ==========================================
    # SLIDE 31 : FRONTEND WEB : REACT.JS & CSS
    # ==========================================
    s31 = prs.slides.add_slide(blank_layout)
    set_slide_background(s31, prs, LIGHT_BG)
    add_header(s31, "Développement Frontend", "Frontend Web • React.js & Vanilla CSS",
               "Une interface web moderne, modulaire et hautement réactive respectant la charte graphique")

    react_pts = [
        ("Architecture en Composants", "Découpage modulaire de l'interface : fiches de véhicules, barre de navigation, panier et modales réutilisables."),
        ("Virtual DOM & Réactivité", "Actualisation instantanée du catalogue lors des filtrages par prix ou catégorie sans rechargement de page."),
        ("Vanilla CSS sur Mesure", "Feuilles de styles optimisées sans surcharge de frameworks tiers, respectant fidèlement l'identité visuelle SOUTARAH."),
        ("Gestion d'État Centralisée", "Synchronisation fluide de la session utilisateur, des articles sélectionnés et des données de réservation.")
    ]
    for idx, (title, desc) in enumerate(react_pts):
        cx, cy = coords_grid[idx]
        add_card(s31, cx, cy, Inches(5.72), Inches(2.25), top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s31, cx + Inches(0.25), cy + Inches(0.2), Inches(0.55), Inches(0.3), f"0{idx+1}")
        
        tb = s31.shapes.add_textbox(cx + Inches(0.95), cy + Inches(0.2), Inches(4.5), Inches(1.8))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK
        
        pd = tf.add_paragraph()
        pd.space_before = Pt(6)
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = TEXT_BODY

    add_footer(s31, 31)

    # ==========================================
    # SLIDE 32 : APPLICATION MOBILE : REACT NATIVE & EXPO
    # ==========================================
    s32 = prs.slides.add_slide(blank_layout)
    set_slide_background(s32, prs, LIGHT_BG)
    add_header(s32, "Développement Mobile", "Application Mobile • React Native & Expo",
               "Une application dédiée à la mobilité pour réserver des véhicules en temps réel sur smartphone")

    mobile_pts = [
        ("Développement Cross-Platform", "Une seule base de code JavaScript compilée nativement sur les systèmes d'exploitation Android et iOS."),
        ("Accélération via Expo", "Gestion simplifiée des modules natifs, déploiement immédiat pour tests sur terminaux réels via scan de QR code."),
        ("Composants Tactiles Optimisés", "Sélecteurs de dates adaptés au pouce, cartes de véhicules avec carrousel d'images et bouton d'action directe."),
        ("Performance & Légèreté", "Consommation minimale de bande passante et adaptation parfaite aux débits mobiles locaux.")
    ]
    for idx, (title, desc) in enumerate(mobile_pts):
        cx, cy = coords_grid[idx]
        add_card(s32, cx, cy, Inches(5.72), Inches(2.25), top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s32, cx + Inches(0.25), cy + Inches(0.2), Inches(0.55), Inches(0.3), f"0{idx+1}")
        
        tb = s32.shapes.add_textbox(cx + Inches(0.95), cy + Inches(0.2), Inches(4.5), Inches(1.8))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK
        
        pd = tf.add_paragraph()
        pd.space_before = Pt(6)
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = TEXT_BODY

    add_footer(s32, 32)

    # ==========================================
    # SLIDE 33 : BACKEND CENTRAL : NODE.JS / EXPRESS
    # ==========================================
    s33 = prs.slides.add_slide(blank_layout)
    set_slide_background(s33, prs, LIGHT_BG)
    add_header(s33, "Architecture Serveur", "Backend Central • Node.js & Serveur Express",
               "Un moteur d'API robuste pour alimenter simultanément le Web, l'App Mobile et le Back-Office")

    back_pts = [
        ("Modèle Asynchrone Non-Bloquant", "L'architecture événementielle de Node.js absorbe des montées en charge sans blocage de ressources système."),
        ("Architecture RESTful Structurée", "Séparation stricte : routes, contrôleurs métier, modèles Sequelize et middlewares de validation."),
        ("Sécurisation JWT & bcrypt", "Protection des endpoints sensibles, vérification systématique des rôles usagers et chiffrement robuste."),
        ("Moteur de Génération PDF", "Compilation côté serveur de devis pro-forma officiels 2 pages téléchargeables instantanément.")
    ]
    for idx, (title, desc) in enumerate(back_pts):
        cx, cy = coords_grid[idx]
        add_card(s33, cx, cy, Inches(5.72), Inches(2.25), top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s33, cx + Inches(0.25), cy + Inches(0.2), Inches(0.55), Inches(0.3), f"0{idx+1}")
        
        tb = s33.shapes.add_textbox(cx + Inches(0.95), cy + Inches(0.2), Inches(4.5), Inches(1.8))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK
        
        pd = tf.add_paragraph()
        pd.space_before = Pt(6)
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = TEXT_BODY

    add_footer(s33, 33)

    # ==========================================
    # SLIDE 34 : POURQUOI MYSQL ? (TABLEAU 4 DU RAPPORT)
    # ==========================================
    s34 = prs.slides.add_slide(blank_layout)
    set_slide_background(s34, prs, LIGHT_BG)
    add_header(s34, "Base de Données", "Sélection du SGBD • Pourquoi Retenir MySQL ?",
               "Analyse comparative des systèmes de bases de données selon 7 critères du rapport officiel (Tableau 4)")

    sgbd_data = [
        ("Critères", "MySQL", "PostgreSQL", "SQL Server", "Oracle", "MongoDB"),
        ("Type", "Relationnel, open source", "Relationnel, open source", "Relationnel, propriétaire", "Relationnel, propriétaire", "NoSQL, documents"),
        ("Modèle données", "Relationnel structuré", "Relationnel structuré", "Relationnel structuré", "Relationnel structuré", "Documents flexibles"),
        ("Performance", "Très bonne", "Très bonne", "Très bonne", "Excellente", "Excellente"),
        ("Scalabilité", "Bonne", "Très bonne", "Très bonne", "Excellente", "Excellente"),
        ("Coût", "Gratuit", "Gratuit", "Payant", "Payant", "Gratuit / Cloud"),
        ("Facilité", "Élevée", "Moyenne à élevée", "Élevée", "Plus complexe", "Élevée"),
        ("Compatibilité", "Oui (Hostinger)", "Non disponible", "Non", "Non", "Non")
    ]

    t_shape = s34.shapes.add_table(len(sgbd_data), 6, Inches(0.8), Inches(1.85), Inches(11.73), Inches(4.7))
    tbl = t_shape.table
    tbl.columns[0].width = Inches(1.8)
    tbl.columns[1].width = Inches(2.18)
    tbl.columns[2].width = Inches(1.95)
    tbl.columns[3].width = Inches(1.95)
    tbl.columns[4].width = Inches(1.95)
    tbl.columns[5].width = Inches(1.9)

    for r_idx, row in enumerate(sgbd_data):
        for c_idx, val in enumerate(row):
            cell = tbl.cell(r_idx, c_idx)
            cell.text = val
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            cell.fill.solid()
            if r_idx == 0:
                cell.fill.fore_color.rgb = TABLE_HEADER_BG
            elif c_idx == 1 and r_idx > 0:
                cell.fill.fore_color.rgb = LIME_LIGHT_BG
            elif r_idx % 2 == 1:
                cell.fill.fore_color.rgb = CARD_BG
            else:
                cell.fill.fore_color.rgb = ROW_ALT_BG

            p = cell.text_frame.paragraphs[0]
            p.font.name = FONT_HEADING if r_idx==0 else FONT_BODY
            p.font.size = Pt(8.5) if r_idx > 0 else Pt(9.5)
            p.font.bold = (r_idx == 0) or (c_idx == 0) or (c_idx == 1)
            if r_idx == 0:
                p.font.color.rgb = TEXT_WHITE
            elif c_idx == 1 and r_idx > 0:
                p.font.color.rgb = LOGO_BRAND_GREEN
            else:
                p.font.color.rgb = TEXT_DARK

    add_footer(s34, 34)

    # ==========================================
    # SLIDE 35 : SERVICES TIERS & INFRASTRUCTURE
    # ==========================================
    s35 = prs.slides.add_slide(blank_layout)
    set_slide_background(s35, prs, LIGHT_BG)
    add_header(s35, "Infrastructure & Cloud", "Services Tiers et Déploiement en Production",
               "Deux piliers techniques garantissant la fiabilité des échanges et la disponibilité 24/7")

    add_card(s35, Inches(0.8), Inches(1.85), Inches(5.72), Inches(4.7), top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s35, Inches(1.1), Inches(2.15), Inches(3.8), Inches(0.35), "NOTIFICATIONS TRANSACTIONNELLES (BREVO)")
    tb_br = s35.shapes.add_textbox(Inches(1.1), Inches(2.7), Inches(5.12), Inches(3.6))
    tf_br = tb_br.text_frame
    tf_br.word_wrap = True
    tf_br.margin_left = tf_br.margin_top = tf_br.margin_right = tf_br.margin_bottom = 0

    brevo_pts = [
        ("Protocole Sécurisé SMTP / TLS", "Communication chiffrée entre le serveur Node.js et les serveurs Brevo pour éviter toute interception."),
        ("Confirmation d'Inscription", "Envoi instantané d'un email de bienvenue dès la création d'un compte client."),
        ("Expédition des Devis PDF", "Le document officiel de 2 pages est automatiquement attaché en pièce jointe au courriel."),
        ("Alertes Équipe Commerciale", "Notification immédiate des administrateurs dès qu'une réservation est déposée dans un panier.")
    ]
    for i, (t, d) in enumerate(brevo_pts):
        p = tf_br.paragraphs[0] if i==0 else tf_br.add_paragraph()
        p.space_before = Pt(8) if i>0 else Pt(0)
        p.text = f"•  {t} : {d}"
        p.font.name = FONT_BODY
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_BODY

    add_card(s35, Inches(6.8), Inches(1.85), Inches(5.72), Inches(4.7), top_accent_color=LOGO_LEAF_LIME)
    add_badge(s35, Inches(7.1), Inches(2.15), Inches(3.6), Inches(0.35), "HÉBERGEMENT CLOUD & SSL (HOSTINGER)", bg_color=LIME_LIGHT_BG, txt_color=LOGO_BRAND_GREEN)
    tb_ho = s35.shapes.add_textbox(Inches(7.1), Inches(2.7), Inches(5.12), Inches(3.6))
    tf_ho = tb_ho.text_frame
    tf_ho.word_wrap = True
    tf_ho.margin_left = tf_ho.margin_top = tf_ho.margin_right = tf_ho.margin_bottom = 0

    host_pts = [
        ("Déploiement Distant Haute Disponibilité", "Serveur infogéré garantissant un temps de fonctionnement optimal et tolérance aux pannes."),
        ("Certificat SSL / HTTPS Let's Encrypt", "Chiffrement systématique de toutes les requêtes entre les clients et l'API REST."),
        ("Base de Données MySQL Distante", "Sauvegardes automatisées quotidiennes et accès direct par le serveur d'application."),
        ("Nom de Domaine Professionnel", "URL d'accès officielle assurant la crédibilité institutionnelle de SOUTARAH GROUP.")
    ]
    for i, (t, d) in enumerate(host_pts):
        p = tf_ho.paragraphs[0] if i==0 else tf_ho.add_paragraph()
        p.space_before = Pt(8) if i>0 else Pt(0)
        p.text = f"•  {t} : {d}"
        p.font.name = FONT_BODY
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_BODY

    add_footer(s35, 35)

    # ==========================================
    # SLIDE 36 : ARCHITECTURE GÉNÉRALE (FIGURE 18)
    # ==========================================
    s36 = prs.slides.add_slide(blank_layout)
    set_slide_background(s36, prs, LIGHT_BG)
    add_header(s36, "Architecture Système", "Schéma de l'Architecture Générale du Système (3-Tiers)",
               "Synchronisation globale entre l'Application Mobile, le Portail Web, l'API REST et MySQL")

    img_arch = "diagrammes/architecture/architecture-generale.png"
    if not os.path.exists(img_arch):
        img_arch = "extracted_pptx_images/slide_36_img_7_image.png"

    add_card(s36, Inches(0.8), Inches(1.85), Inches(7.5), Inches(4.7), top_accent_color=LOGO_BRAND_GREEN)
    place_image_in_box(s36, img_arch, Inches(0.95), Inches(2.0), Inches(7.2), Inches(4.3))

    add_card(s36, Inches(8.5), Inches(1.85), Inches(4.03), Inches(4.7), top_accent_color=LOGO_LEAF_LIME)
    add_badge(s36, Inches(8.75), Inches(2.1), Inches(2.8), Inches(0.32), "FIGURE 18 : DÉCOUPAGE EN 3 TIERS")

    tb_ar = s36.shapes.add_textbox(Inches(8.75), Inches(2.6), Inches(3.53), Inches(3.7))
    tf_ar = tb_ar.text_frame
    tf_ar.word_wrap = True
    tf_ar.margin_left = tf_ar.margin_top = tf_ar.margin_right = tf_ar.margin_bottom = 0

    tiers = [
        ("Tier Présentation (Frontend)", "Portail Web React.js et Application Mobile React Native / Expo consommant la même API."),
        ("Tier Métier (Serveur API)", "Serveur Node.js & Express : contrôle des droits, calcul des prix, génération PDF et routage."),
        ("Tier Données & Services", "Base relationnelle MySQL (Sequelize) et passerelle d'expédition Brevo SMTP sécurisée.")
    ]
    for i, (t, d) in enumerate(tiers):
        p = tf_ar.paragraphs[0] if i==0 else tf_ar.add_paragraph()
        p.space_before = Pt(8) if i>0 else Pt(0)
        p.text = f"•  {t}"
        p.font.name = FONT_HEADING
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = TEXT_DARK
        
        pd = tf_ar.add_paragraph()
        pd.space_before = Pt(2)
        pd.text = d
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10)
        pd.font.color.rgb = TEXT_MUTED

    add_footer(s36, 36)

    # ==========================================
    # SLIDE 37 : STRUCTURE RELATIONNELLE BASE (FIGURE 19)
    # ==========================================
    s37 = prs.slides.add_slide(blank_layout)
    set_slide_background(s37, prs, LIGHT_BG)
    add_header(s37, "Modélisation de Données", "Structure Relationnelle de la Base de Données MySQL",
               "Organisation physique des tables, des clés primaires et des contraintes d'intégrité référentielle")

    img_db = "extracted_pptx_images/slide_37_img_7_image.png"

    add_card(s37, Inches(0.8), Inches(1.85), Inches(7.0), Inches(4.7), top_accent_color=LOGO_BRAND_GREEN)
    place_image_in_box(s37, img_db, Inches(0.95), Inches(2.0), Inches(6.7), Inches(4.3))

    add_card(s37, Inches(8.0), Inches(1.85), Inches(4.53), Inches(4.7), top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s37, Inches(8.25), Inches(2.1), Inches(3.2), Inches(0.32), "FIGURE 19 : SCHÉMA RELATIONNEL")

    tb_db = s37.shapes.add_textbox(Inches(8.25), Inches(2.6), Inches(4.0), Inches(3.7))
    tf_db = tb_db.text_frame
    tf_db.word_wrap = True
    tf_db.margin_left = tf_db.margin_top = tf_db.margin_right = tf_db.margin_bottom = 0

    tables_desc = [
        ("Table 'users'", "Stocke les identifiants, hash de mot de passe, rôle usager et coordonnées."),
        ("Table 'vehicles'", "Caractéristiques des véhicules, tarifs/jour, statut de disponibilité et immatriculation."),
        ("Table 'reservations'", "Historise les réservations avec dates de début/fin, option chauffeur et montant."),
        ("Table 'products' & 'quotes'", "Gère le catalogue négoce et les devis émis avec détail des articles commandés."),
        ("Intégrité Référentielle", "Clés étrangères avec contraintes ON DELETE CASCADE assurant la cohérence absolue.")
    ]
    for i, (t, d) in enumerate(tables_desc):
        p = tf_db.paragraphs[0] if i==0 else tf_db.add_paragraph()
        p.space_before = Pt(6) if i>0 else Pt(0)
        p.text = f"•  {t}"
        p.font.name = FONT_HEADING
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = TEXT_DARK
        
        pd = tf_db.add_paragraph()
        pd.space_before = Pt(2)
        pd.text = d
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10)
        pd.font.color.rgb = TEXT_MUTED

    add_footer(s37, 37)
    print("Part 3 (Slides 28 to 37) updated with Soutarah Green theme.")
