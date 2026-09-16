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

def build_part4(prs):
    blank_layout = prs.slide_layouts[6]

    # ==========================================
    # SLIDE 38 : INTERCALAIRE PARTIE IV
    # ==========================================
    create_section_divider(prs, 38, 4,
                           "PARTIE IV : RÉALISATION ET MISE EN ŒUVRE",
                           "Démonstration des interfaces Web, application mobile dédiée à la réservation, back-office d'administration, cahier de recettes, bilan financier et rentabilité.")

    # ==========================================
    # SLIDE 39 : WEB : ACCUEIL & CONNEXION (FIGURES 20 & 21)
    # ==========================================
    s39 = prs.slides.add_slide(blank_layout)
    set_slide_background(s39, prs, LIGHT_BG)
    add_header(s39, "Interfaces Web", "Plateforme Web • Page d'Accueil & Authentification Sécurisée",
               "Vitrine d'entrée immersive présentant l'entreprise et formulaire de connexion protégé")

    img_w_acc = "extracted_pptx_images/slide_39_img_7_image.png"
    img_w_auth = "extracted_pptx_images/slide_39_img_9_image.png"

    add_card(s39, Inches(0.8), Inches(1.85), Inches(5.72), Inches(4.7), top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s39, Inches(1.05), Inches(2.05), Inches(3.2), Inches(0.32), "FIGURE 20 : PAGE D'ACCUEIL WEB")
    place_image_in_box(s39, img_w_acc, Inches(0.95), Inches(2.5), Inches(5.42), Inches(3.8))

    add_card(s39, Inches(6.8), Inches(1.85), Inches(5.72), Inches(4.7), top_accent_color=LOGO_LEAF_LIME)
    add_badge(s39, Inches(7.05), Inches(2.05), Inches(3.6), Inches(0.32), "FIGURE 21 : FORMULAIRE D'AUTHENTIFICATION", bg_color=LIME_LIGHT_BG, txt_color=LOGO_BRAND_GREEN)
    place_image_in_box(s39, img_w_auth, Inches(6.95), Inches(2.5), Inches(5.42), Inches(3.8))

    add_footer(s39, 39)

    # ==========================================
    # SLIDE 40 : WEB : CATALOGUE & RÉSERVATION (FIGURES 22 & 23)
    # ==========================================
    s40 = prs.slides.add_slide(blank_layout)
    set_slide_background(s40, prs, LIGHT_BG)
    add_header(s40, "Interfaces Web", "Plateforme Web • Catalogue Produits & Module de Réservation",
               "Exploration dynamique du catalogue négoce et configurateur de location automobile")

    img_cat = "extracted_pptx_images/slide_40_img_7_image.png"
    img_res = "extracted_pptx_images/slide_40_img_9_image.png"

    add_card(s40, Inches(0.8), Inches(1.85), Inches(5.72), Inches(4.7), top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s40, Inches(1.05), Inches(2.05), Inches(3.4), Inches(0.32), "FIGURE 22 : CATALOGUE PRODUITS")
    place_image_in_box(s40, img_cat, Inches(0.95), Inches(2.5), Inches(5.42), Inches(3.8))

    add_card(s40, Inches(6.8), Inches(1.85), Inches(5.72), Inches(4.7), top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s40, Inches(7.05), Inches(2.05), Inches(3.6), Inches(0.32), "FIGURE 23 : RÉSERVATION DE VÉHICULE")
    place_image_in_box(s40, img_res, Inches(6.95), Inches(2.5), Inches(5.42), Inches(3.8))

    add_footer(s40, 40)

    # ==========================================
    # SLIDE 41 : WEB : PANIER & DEVIS PDF (FIGURES 24 & 25)
    # ==========================================
    s41 = prs.slides.add_slide(blank_layout)
    set_slide_background(s41, prs, LIGHT_BG)
    add_header(s41, "Interfaces Web", "Plateforme Web • Panier Multi-Articles & Espace Client",
               "Gestion unifiée des réservations et génération instantanée du devis pro-forma officiel PDF")

    img_pan = "extracted_pptx_images/slide_41_img_7_image.png"
    img_esp = "extracted_pptx_images/slide_41_img_9_image.png"

    add_card(s41, Inches(0.8), Inches(1.85), Inches(5.72), Inches(4.7), top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s41, Inches(1.05), Inches(2.05), Inches(3.5), Inches(0.32), "FIGURE 24 : PANIER & DEVIS PDF")
    place_image_in_box(s41, img_pan, Inches(0.95), Inches(2.5), Inches(5.42), Inches(3.8))

    add_card(s41, Inches(6.8), Inches(1.85), Inches(5.72), Inches(4.7), top_accent_color=LOGO_LEAF_LIME)
    add_badge(s41, Inches(7.05), Inches(2.05), Inches(3.6), Inches(0.32), "FIGURE 25 : ESPACE CLIENT & SUIVI", bg_color=LIME_LIGHT_BG, txt_color=LOGO_BRAND_GREEN)
    place_image_in_box(s41, img_esp, Inches(6.95), Inches(2.5), Inches(5.42), Inches(3.8))

    add_footer(s41, 41)

    # ==========================================
    # SLIDE 42 : APPLICATION MOBILE (FIGURES 26 & 27)
    # ==========================================
    s42 = prs.slides.add_slide(blank_layout)
    set_slide_background(s42, prs, LIGHT_BG)
    add_header(s42, "Application Mobile", "SOUTARAH Mobile • Réservation Automobile en Mobilité",
               "Interface tactile native conçue pour smartphone : navigation, sélection et panier mobile")

    img_m_acc = "extracted_pptx_images/slide_42_img_7_image.png"
    img_m_pan = "extracted_pptx_images/slide_42_img_9_image.png"

    add_card(s42, Inches(0.8), Inches(1.85), Inches(5.72), Inches(4.7), top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s42, Inches(1.05), Inches(2.05), Inches(3.6), Inches(0.32), "FIGURE 26 : ÉCRAN & FICHE VÉHICULE")
    place_image_in_box(s42, img_m_acc, Inches(1.2), Inches(2.5), Inches(4.9), Inches(3.8))

    add_card(s42, Inches(6.8), Inches(1.85), Inches(5.72), Inches(4.7), top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s42, Inches(7.05), Inches(2.05), Inches(3.4), Inches(0.32), "FIGURE 27 : PANIER MOBILE")
    place_image_in_box(s42, img_m_pan, Inches(7.2), Inches(2.5), Inches(4.9), Inches(3.8))

    add_footer(s42, 42)

    # ==========================================
    # SLIDE 43 : ADMINISTRATION BACK-OFFICE (FIGURES 28 & 29)
    # ==========================================
    s43 = prs.slides.add_slide(blank_layout)
    set_slide_background(s43, prs, LIGHT_BG)
    add_header(s43, "Espace Administrateur", "Back-Office Web • Pilotage & Gestion de la Flotte",
               "Tour de contrôle complète pour les équipes de gestion et la direction générale")

    img_adm_dash = "extracted_pptx_images/slide_43_img_7_image.png"
    img_adm_flot = "extracted_pptx_images/slide_43_img_9_image.png"

    add_card(s43, Inches(0.8), Inches(1.85), Inches(5.72), Inches(4.7), top_accent_color=LOGO_LEAF_LIME)
    add_badge(s43, Inches(1.05), Inches(2.05), Inches(3.5), Inches(0.32), "FIGURE 28 : TABLEAU DE BORD KPIS", bg_color=LIME_LIGHT_BG, txt_color=LOGO_BRAND_GREEN)
    place_image_in_box(s43, img_adm_dash, Inches(0.95), Inches(2.5), Inches(5.42), Inches(3.8))

    add_card(s43, Inches(6.8), Inches(1.85), Inches(5.72), Inches(4.7), top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s43, Inches(7.05), Inches(2.05), Inches(3.5), Inches(0.32), "FIGURE 29 : GESTION DU PARC")
    place_image_in_box(s43, img_adm_flot, Inches(6.95), Inches(2.5), Inches(5.42), Inches(3.8))

    add_footer(s43, 43)

    # ==========================================
    # SLIDE 44 : FONCTIONNALITÉS AVANCÉES
    # ==========================================
    s44 = prs.slides.add_slide(blank_layout)
    set_slide_background(s44, prs, LIGHT_BG)
    add_header(s44, "Accélérateurs Métier", "Deux Fonctionnalités Avancées à Forte Valeur Ajoutée",
               "L'intégration d'un assistant virtuel intelligent et d'un service de messagerie transactionnelle")

    add_card(s44, Inches(0.8), Inches(1.85), Inches(5.72), Inches(4.7), top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s44, Inches(1.1), Inches(2.15), Inches(3.4), Inches(0.35), "ASSISTANT VIRTUEL INTELLIGENT (IA)")
    tb_ai = s44.shapes.add_textbox(Inches(1.1), Inches(2.7), Inches(5.12), Inches(3.6))
    tf_ai = tb_ai.text_frame
    tf_ai.word_wrap = True
    tf_ai.margin_left = tf_ai.margin_top = tf_ai.margin_right = tf_ai.margin_bottom = 0

    ai_pts = [
        ("Rôle Client (Orientation)", "Comprend les requêtes usagers en langage naturel ('Je cherche un véhicule 5 places climatisé pour Yamoussoukro') et propose le modèle adapté."),
        ("Boutons d'Action Directs", "Génère des liens interactifs redirigeant instantanément l'usager vers la fiche du véhicule ou vers son panier."),
        ("Rôle Administrateur (Aide Décisionnelle)", "Exécute des requêtes analytiques pour assister le gestionnaire : alertes de stock, véhicules les plus loués, volume de devis.")
    ]
    for i, (t, d) in enumerate(ai_pts):
        p = tf_ai.paragraphs[0] if i==0 else tf_ai.add_paragraph()
        p.space_before = Pt(8) if i>0 else Pt(0)
        p.text = f"•  {t} : {d}"
        p.font.name = FONT_BODY
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_BODY

    add_card(s44, Inches(6.8), Inches(1.85), Inches(5.72), Inches(4.7), top_accent_color=LOGO_LEAF_LIME)
    add_badge(s44, Inches(7.1), Inches(2.15), Inches(3.6), Inches(0.35), "MESSAGERIE TRANSACTIONNELLE (BREVO)", bg_color=LIME_LIGHT_BG, txt_color=LOGO_BRAND_GREEN)
    tb_br4 = s44.shapes.add_textbox(Inches(7.1), Inches(2.7), Inches(5.12), Inches(3.6))
    tf_br4 = tb_br4.text_frame
    tf_br4.word_wrap = True
    tf_br4.margin_left = tf_br4.margin_top = tf_br4.margin_right = tf_br4.margin_bottom = 0

    br_pts = [
        ("Infrastructure Nodemailer & Brevo", "Mise en forme des courriels par le serveur d'API et acheminement haute délivrabilité sous protocole TLS sécurisé."),
        ("Transmission Automatique Devis PDF", "Le document officiel de 2 pages avec en-têtes et taxes est envoyé en pièce jointe dès la validation du panier."),
        ("Alertes Commerciales Temps Réel", "L'équipe d'administration est avertie dès qu'une réservation est enregistrée afin de préparer le véhicule sans délai.")
    ]
    for i, (t, d) in enumerate(br_pts):
        p = tf_br4.paragraphs[0] if i==0 else tf_br4.add_paragraph()
        p.space_before = Pt(8) if i>0 else Pt(0)
        p.text = f"•  {t} : {d}"
        p.font.name = FONT_BODY
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_BODY

    add_footer(s44, 44)

    # ==========================================
    # SLIDE 45 : CAHIER DE RECETTES (TABLEAU 5 DU RAPPORT)
    # ==========================================
    s45 = prs.slides.add_slide(blank_layout)
    set_slide_background(s45, prs, LIGHT_BG)
    add_header(s45, "Qualité & Tests", "Cahier de Recettes et Validation des Tests Fonctionnels",
               "Validation exhaustive des 9 scénarios de tests opérationnels issue du rapport officiel (Tableau 5)")

    recette_data = [
        ("Module / Fonctionnalité", "Scénario de test exécuté", "Résultat attendu", "Statut"),
        ("Authentification", "Connexion utilisateur avec email et mot de passe valide", "Attribution du token JWT et ouverture de session", "CONFORME"),
        ("Sécurité API", "Tentative d'accès à une route admin sans privilège", "Blocage requête et réponse HTTP 403 Forbidden", "CONFORME"),
        ("Catalogue Web", "Navigation et filtrage des produits multi-pôles", "Affichage instantané des articles correspondants", "CONFORME"),
        ("Réservation Mobile", "Sélection véhicule et choix des dates de location", "Calcul dynamique exact (durée x prix + option)", "CONFORME"),
        ("Contrôle Disponibilité", "Tentative de réservation sur période déjà attribuée", "Alerte de conflit de dates et blocage soumission", "CONFORME"),
        ("Génération Devis PDF", "Validation du panier et téléchargement document", "Génération automatique d'un PDF 2 pages conforme", "CONFORME"),
        ("Synchronisation DB", "Commande mobile et vérification dans le Back-Office", "Apparition immédiate de la commande côté admin", "CONFORME"),
        ("Notifications E-mail", "Transmission d'une nouvelle demande de devis", "Réception automatique courriel d'alerte via Brevo", "CONFORME")
    ]

    t_shape = s45.shapes.add_table(len(recette_data), 4, Inches(0.8), Inches(1.85), Inches(11.73), Inches(4.7))
    tbl = t_shape.table
    tbl.columns[0].width = Inches(2.2)
    tbl.columns[1].width = Inches(4.2)
    tbl.columns[2].width = Inches(3.93)
    tbl.columns[3].width = Inches(1.4)

    for r_idx, row in enumerate(recette_data):
        for c_idx, val in enumerate(row):
            cell = tbl.cell(r_idx, c_idx)
            cell.text = val
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            cell.fill.solid()
            if r_idx == 0:
                cell.fill.fore_color.rgb = TABLE_HEADER_BG
            elif c_idx == 3 and r_idx > 0:
                cell.fill.fore_color.rgb = LIME_LIGHT_BG
            elif r_idx % 2 == 1:
                cell.fill.fore_color.rgb = CARD_BG
            else:
                cell.fill.fore_color.rgb = ROW_ALT_BG

            p = cell.text_frame.paragraphs[0]
            p.font.name = FONT_HEADING if (r_idx==0 or c_idx==3) else FONT_BODY
            p.font.size = Pt(8.5) if r_idx > 0 else Pt(9.5)
            p.font.bold = (r_idx == 0) or (c_idx == 0) or (c_idx == 3)
            if r_idx == 0:
                p.font.color.rgb = TEXT_WHITE
            elif c_idx == 3 and r_idx > 0:
                p.font.color.rgb = LOGO_BRAND_GREEN
                p.alignment = PP_ALIGN.CENTER
            else:
                p.font.color.rgb = TEXT_DARK

    add_footer(s45, 45)

    # ==========================================
    # SLIDE 46 : BILAN FINANCIER (TABLEAU 6 DU RAPPORT)
    # ==========================================
    s46 = prs.slides.add_slide(blank_layout)
    set_slide_background(s46, prs, LIGHT_BG)
    add_header(s46, "Étude Financière", "Bilan Financier Estimatif et Coûts d'Exploitation",
               "Une solution économique s'appuyant sur des technologies Open Source gratuites (Tableau 6)")

    # Left: Cost Table
    cost_data = [
        ("Poste de dépense", "Description technique", "Coût annuel (FCFA)"),
        ("Nom de domaine & SSL", "Nom de domaine .com + certificat SSL Let's Encrypt", "35 000"),
        ("Comptes développeurs", "Google Play Store (unique) + Apple Developer (annuel)", "75 000"),
        ("Maintenance préventive", "Sauvegardes automatisées, mises à jour et support", "180 000"),
        ("TOTAL ESTIMATIF ANNUEL", "Budget global de fonctionnement et maintenance", "290 000 FCFA")
    ]
    t_shape = s46.shapes.add_table(len(cost_data), 3, Inches(0.8), Inches(1.85), Inches(6.8), Inches(4.7))
    tbl = t_shape.table
    tbl.columns[0].width = Inches(2.2)
    tbl.columns[1].width = Inches(3.2)
    tbl.columns[2].width = Inches(1.4)

    for r_idx, row in enumerate(cost_data):
        for c_idx, val in enumerate(row):
            cell = tbl.cell(r_idx, c_idx)
            cell.text = val
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            cell.fill.solid()
            if r_idx == 0:
                cell.fill.fore_color.rgb = TABLE_HEADER_BG
            elif r_idx == len(cost_data) - 1:
                cell.fill.fore_color.rgb = LIME_LIGHT_BG
            elif r_idx % 2 == 1:
                cell.fill.fore_color.rgb = CARD_BG
            else:
                cell.fill.fore_color.rgb = ROW_ALT_BG

            p = cell.text_frame.paragraphs[0]
            p.font.name = FONT_HEADING if (r_idx==0 or r_idx==len(cost_data)-1) else FONT_BODY
            p.font.size = Pt(9.5) if r_idx > 0 else Pt(10)
            p.font.bold = (r_idx == 0) or (r_idx == len(cost_data)-1) or (c_idx == 0)
            if r_idx == 0:
                p.font.color.rgb = TEXT_WHITE
            elif r_idx == len(cost_data) - 1:
                p.font.color.rgb = LOGO_BRAND_GREEN
            else:
                p.font.color.rgb = TEXT_DARK
            if c_idx == 2:
                p.alignment = PP_ALIGN.RIGHT

    # Right: Open Source Advantage Card
    add_card(s46, Inches(7.8), Inches(1.85), Inches(4.73), Inches(4.7), top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s46, Inches(8.05), Inches(2.15), Inches(3.2), Inches(0.35), "ÉCONOMIE SUR LES LICENCES")
    tb_os = s46.shapes.add_textbox(Inches(8.05), Inches(2.7), Inches(4.2), Inches(3.6))
    tf_os = tb_os.text_frame
    tf_os.word_wrap = True
    tf_os.margin_left = tf_os.margin_top = tf_os.margin_right = tf_os.margin_bottom = 0

    os_pts = [
        ("Coût Logiciel de Développement Nul", "L'ensemble de la pile technologique retenue (React, React Native, Expo, Node.js, Express, MySQL) repose sur des licences libres et Open Source sans royalties."),
        ("Investissement Matériel Rentabilisé", "Utilisation de postes de travail existants et tests mobiles effectués en conditions réelles sans investissement infrastructurel lourd."),
        ("Maîtrise Complète des Coûts", "Un budget de fonctionnement de 290 000 FCFA/an parfaitement adapté aux capacités d'investissement de l'entreprise.")
    ]
    for i, (t, d) in enumerate(os_pts):
        p = tf_os.paragraphs[0] if i==0 else tf_os.add_paragraph()
        p.space_before = Pt(10) if i>0 else Pt(0)
        p.text = f"✓  {t} : {d}"
        p.font.name = FONT_BODY
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_BODY

    add_footer(s46, 46)

    # ==========================================
    # SLIDE 47 : RENTABILITÉ & RETOUR SUR INVESTISSEMENT (ROI) (100% GREEN THEME)
    # ==========================================
    s47 = prs.slides.add_slide(blank_layout)
    set_slide_background(s47, prs, LIGHT_BG)
    add_header(s47, "Valeur Ajoutée Métier", "Rentabilité et Retour sur Investissement (ROI)",
               "Un impact économique et opérationnel immédiat validé dès le premier trimestre d'exploitation")

    kpis = [
        ("> 80%", "RÉDUCTION DU TEMPS ADMINISTRATIF", "Le traitement d'un dossier passe de 45 minutes en manuel à moins de 3 minutes via la plateforme."),
        ("< 3 MIN", "GÉNÉRATION DU DEVIS PRO-FORMA", "Édition et expédition automatisée du devis PDF officiel aux normes fiscales en temps record."),
        ("0 LITIGE", "ZÉRO DOUBLE RÉSERVATION", "Contrôle automatique d'indisponibilité éliminant totalement les manques à gagner et conflits de planning."),
        ("T1 2027", "AMORTISSEMENT INTÉGRAL DU PROJET", "Retour sur investissement complet atteint dès le 1er trimestre grâce au gain de réactivité commerciale.")
    ]
    for idx, (val, title, desc) in enumerate(kpis):
        cx = Inches(0.8 + idx * 2.98)
        top_color = LOGO_BRAND_GREEN if idx in [0, 3] else LOGO_LEAF_LIME
        add_card(s47, cx, Inches(1.85), Inches(2.78), Inches(4.7), top_accent_color=top_color)
        
        tb = s47.shapes.add_textbox(cx + Inches(0.2), Inches(2.2), Inches(2.38), Inches(4.1))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        pv = tf.paragraphs[0]
        pv.text = val
        pv.font.name = FONT_HEADING
        pv.font.size = Pt(28)
        pv.font.bold = True
        pv.font.color.rgb = top_color
        
        pt = tf.add_paragraph()
        pt.space_before = Pt(8)
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(11)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK
        
        pd = tf.add_paragraph()
        pd.space_before = Pt(8)
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = TEXT_MUTED

    add_footer(s47, 47)

    # ==========================================
    # SLIDE 48 : PERSPECTIVES D'ÉVOLUTION
    # ==========================================
    s48 = prs.slides.add_slide(blank_layout)
    set_slide_background(s48, prs, LIGHT_BG)
    add_header(s48, "Vision Prospective", "Perspectives d'Évolution de la Plateforme",
               "Feuille de route technique pour étendre les capacités de la solution logicielle")

    persp = [
        ("01", "PAIEMENT MOBILE MONEY DIRECT", "Intégration Passerelles Locales (Wave, Orange, MTN)",
         "Activation en production de passerelles de paiement sécurisées pour encaisser instantanément les acomptes en ligne sans manipulation d'espèces."),
        ("02", "TÉLÉMATIQUE & SUIVI GPS", "Traceurs Connectés & Maintenance Prédictive",
         "Intégration de boîtiers IoT connectés sur les véhicules pour le suivi des itinéraires en temps réel et la planification intelligente des révisions mécaniques."),
        ("03", "NOTIFICATIONS PUSH NATIVES", "Alertes Mobiles via Firebase Cloud Messaging",
         "Envoi de notifications directes sur smartphone pour informer les clients de la validation de leur réservation et des rappels de restitution.")
    ]
    w_pr = Inches(3.75)
    h_pr = Inches(4.7)
    for idx, (num, tag, title, desc) in enumerate(persp):
        cx = Inches(0.8 + idx * 3.99)
        add_card(s48, cx, Inches(1.85), w_pr, h_pr, top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s48, cx + Inches(0.3), Inches(2.15), Inches(0.6), Inches(0.35), num)
        
        tb = s48.shapes.add_textbox(cx + Inches(0.3), Inches(2.65), w_pr - Inches(0.6), Inches(3.6))
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
        pt.space_before = Pt(4)
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK
        
        pd = tf.add_paragraph()
        pd.space_before = Pt(10)
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(11)
        pd.font.color.rgb = TEXT_BODY

    add_footer(s48, 48)
    print("Part 4 (Slides 38 to 48) updated with Soutarah Green theme.")
