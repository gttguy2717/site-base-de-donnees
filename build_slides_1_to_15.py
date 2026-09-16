import os
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

from build_common import (
    set_slide_background, add_header, add_footer, add_card, add_badge,
    create_section_divider, place_image_in_box, create_table,
    LOGO_DARK_GREEN, LOGO_BRAND_GREEN, LOGO_LEAF_LIME, LIME_LIGHT_BG, MINT_LIGHT_BG,
    DARK_CARD_BG, LIGHT_BG, CARD_BG, CARD_BORDER, TEXT_DARK, TEXT_BODY, TEXT_MUTED,
    TEXT_WHITE, FONT_HEADING, FONT_BODY, LOGO_PATH, ROW_ALT_BG
)

def build_slides_1_to_15(prs):
    blank_layout = prs.slide_layouts[6]

    # =========================================================================
    # SLIDE 01 : PAGE DE GARDE OFFICIELLE
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, prs, LOGO_DARK_GREEN)

    # Accent vertical gauche
    accent = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.2), Inches(0.12), Inches(5.1))
    accent.fill.solid()
    accent.fill.fore_color.rgb = LOGO_LEAF_LIME
    accent.line.fill.background()

    # Logo officiel Soutarah
    if os.path.exists(LOGO_PATH):
        s1.shapes.add_picture(LOGO_PATH, Inches(1.2), Inches(1.2), width=Inches(2.5))

    # Badge académique
    add_badge(s1, Inches(1.2), Inches(2.2), Inches(4.5), Inches(0.38),
              "SOUTENANCE DE FIN DE CYCLE • STAGE D'APPLICATION", bg_color=DARK_CARD_BG, txt_color=LOGO_LEAF_LIME)

    # Grand Titre du Projet
    tb_title = s1.shapes.add_textbox(Inches(1.2), Inches(2.7), Inches(11.0), Inches(1.8))
    tf_t = tb_title.text_frame
    tf_t.word_wrap = True
    p1 = tf_t.paragraphs[0]
    p1.text = "Conception et développement d’une plateforme numérique\nde gestion des services de SOUTARAH GROUP"
    p1.font.name = FONT_HEADING
    p1.font.size = Pt(27)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE

    p2 = tf_t.add_paragraph()
    p2.text = "intégrant une application mobile dédiée à la réservation de véhicules"
    p2.font.name = FONT_HEADING
    p2.font.size = Pt(21)
    p2.font.bold = True
    p2.font.color.rgb = LOGO_LEAF_LIME
    p2.space_before = Pt(8)

    # Carte détails bas
    add_card(s1, Inches(1.2), Inches(4.8), Inches(11.0), Inches(1.5), bg_color=DARK_CARD_BG, border_color=LOGO_BRAND_GREEN)

    tb_cand = s1.shapes.add_textbox(Inches(1.5), Inches(5.0), Inches(5.0), Inches(1.1))
    tf_cand = tb_cand.text_frame
    p_c1 = tf_cand.paragraphs[0]
    p_c1.text = "CANDIDAT :"
    p_c1.font.name = FONT_HEADING
    p_c1.font.size = Pt(11)
    p_c1.font.bold = True
    p_c1.font.color.rgb = LOGO_LEAF_LIME

    p_c2 = tf_cand.add_paragraph()
    p_c2.text = "David SORHO"
    p_c2.font.name = FONT_HEADING
    p_c2.font.size = Pt(15)
    p_c2.font.bold = True
    p_c2.font.color.rgb = TEXT_WHITE

    p_c3 = tf_cand.add_paragraph()
    p_c3.text = "Filière : TS STIC 2 (Sciences et Technologies de l'Info. & Com.)"
    p_c3.font.name = FONT_BODY
    p_c3.font.size = Pt(11)
    p_c3.font.color.rgb = RGBColor(203, 213, 225)

    tb_inst = s1.shapes.add_textbox(Inches(7.0), Inches(5.0), Inches(5.0), Inches(1.1))
    tf_inst = tb_inst.text_frame
    p_i1 = tf_inst.paragraphs[0]
    p_i1.text = "STRUCTURES & SESSION :"
    p_i1.font.name = FONT_HEADING
    p_i1.font.size = Pt(11)
    p_i1.font.bold = True
    p_i1.font.color.rgb = LOGO_LEAF_LIME

    p_i2 = tf_inst.add_paragraph()
    p_i2.text = "École Supérieure d'Industrie (ESI) • INP-HB Yamoussoukro"
    p_i2.font.name = FONT_BODY
    p_i2.font.size = Pt(12)
    p_i2.font.bold = True
    p_i2.font.color.rgb = TEXT_WHITE

    p_i3 = tf_inst.add_paragraph()
    p_i3.text = "Entreprise d'accueil : SOUTARAH GROUP SARL • Année 2025-2026"
    p_i3.font.name = FONT_BODY
    p_i3.font.size = Pt(11)
    p_i3.font.color.rgb = RGBColor(203, 213, 225)

    add_footer(s1, 1, is_dark=True)

    # =========================================================================
    # SLIDE 02 : SOMMAIRE GÉNÉRAL (LES 8 AXES)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, prs, LIGHT_BG)
    add_header(s2, "PLAN DE LA PRÉSENTATION", "Sommaire Général de la Soutenance",
               "Une démarche méthodique structurée en 8 axes majeurs d'ingénierie logicielle")

    # 8 cartes réparties en 2 colonnes de 4 cartes spacieuses
    axes = [
        ("01", "INTRODUCTION", "Contexte général du secteur et problématique centrale"),
        ("02", "CONTEXTE GÉNÉRAL", "Organisme d'accueil, existant, limites, solution & planning"),
        ("03", "MÉTHODE D’ANALYSE", "Comparaison MERISE vs Processus Unifié / UML et choix"),
        ("04", "ANALYSE & SPÉCIFICATION", "Acteurs, besoins fonctionnels, non fonctionnels et cas d'utilisation"),
        ("05", "CONCEPTION DU SYSTÈME", "Diagrammes d'activité, séquence, classes et architecture 3-tiers"),
        ("06", "RÉALISATION", "Assistant IA, notifications Brevo, devis PDF et interfaces"),
        ("07", "TESTS ET PERSPECTIVES", "Recette fonctionnelle, résultats, ROI financier et axes futurs"),
        ("08", "CONCLUSION", "Bilan du projet, apports académiques et compétences acquises")
    ]

    for idx, (num, title, desc) in enumerate(axes):
        col = 0 if idx < 4 else 1
        row = idx % 4
        left = Inches(0.8) if col == 0 else Inches(6.8)
        top = Inches(1.8) + row * Inches(1.25)
        width = Inches(5.7)
        height = Inches(1.1)

        add_card(s2, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s2, left + Inches(0.2), top + Inches(0.2), Inches(0.8), Inches(0.32), num)

        tb = s2.shapes.add_textbox(left + Inches(1.15), top + Inches(0.15), Inches(4.35), Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.name = FONT_HEADING
        p_t.font.size = Pt(12.5)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_DARK

        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.name = FONT_BODY
        p_d.font.size = Pt(10)
        p_d.font.color.rgb = TEXT_MUTED

    add_footer(s2, 2)

    # =========================================================================
    # SLIDE 03 : INTERCALAIRE SECTION 1 : INTRODUCTION
    # =========================================================================
    create_section_divider(prs, 3, 1, "INTRODUCTION",
                           "Mise en contexte du secteur des services en Côte d'Ivoire, constats opérationnels et justification du virage numérique de SOUTARAH GROUP.")

    # =========================================================================
    # SLIDE 04 : SECTION 1 - CONTEXTE DES SERVICES & ENJEUX NUMÉRIQUES
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, prs, LIGHT_BG)
    add_header(s4, "1. INTRODUCTION • CONTEXTE MACRO-ÉCONOMIQUE",
               "Le Secteur des Services & les Enjeux du Numérique",
               "Un levier économique fondamental confronté à un besoin impératif de modernisation")

    # 3 grandes cartes aérées
    cards_s4 = [
        ("PILIER DE CROISSANCE", "Rôle Économique Majeur",
         "• Le secteur des prestations de services constitue l'un des principaux moteurs du PIB ivoirien.\n• Il emploie une fraction majeure de la population active dans les transports, le négoce et le BTP.\n• Forte demande en réactivité et qualité de service standardisée."),
        ("DÉFIS OPÉRATIONNELS", "Contraintes Structurelles",
         "• Persistance de la gestion manuelle des demandes de devis et réservations.\n• Absence d'outils numériques centralisés pour le suivi du parcours client.\n• Risques de double réservation et retards chroniques dans l'émission des offres chiffrées."),
        ("LEVIER DU NUMÉRIQUE", "Opportunité Stratégique",
         "• Nécessité vitale d'adopter les Technologies de l'Information et de la Communication (TIC).\n• Automatisation des devis avec calcul instantané des taxes (TVA, TDT).\n• Centralisation et synchronisation en temps réel de l'ensemble des activités métiers.")
    ]

    for i, (badge_txt, title, body) in enumerate(cards_s4):
        left = Inches(0.8) + i * Inches(3.95)
        top = Inches(1.85)
        width = Inches(3.8)
        height = Inches(4.9)
        add_card(s4, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s4, left + Inches(0.3), top + Inches(0.3), Inches(2.5), Inches(0.32), badge_txt)

        tb = s4.shapes.add_textbox(left + Inches(0.3), top + Inches(0.8), Inches(3.2), Inches(3.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p_title = tf.paragraphs[0]
        p_title.text = title
        p_title.font.name = FONT_HEADING
        p_title.font.size = Pt(14)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_DARK

        p_body = tf.add_paragraph()
        p_body.text = body
        p_body.font.name = FONT_BODY
        p_body.font.size = Pt(11)
        p_body.font.color.rgb = TEXT_BODY
        p_body.space_before = Pt(12)

    add_footer(s4, 4)

    # =========================================================================
    # SLIDE 05 : SECTION 1 - THÈME & PROBLÉMATIQUE CENTRALE
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, prs, LIGHT_BG)
    add_header(s5, "1. INTRODUCTION • PROBLÉMATIQUE CENTRALE",
               "Thème de Stage & Question Centrale de Recherche",
               "Cadrage conceptuel et opérationnel de la mission d'ingénierie logicielle")

    # Carte Thème (Haut)
    add_card(s5, Inches(0.8), Inches(1.85), Inches(11.73), Inches(1.8), bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s5, Inches(1.1), Inches(2.1), Inches(2.2), Inches(0.32), "THÈME OFFICIEL DE STAGE")

    tb_theme = s5.shapes.add_textbox(Inches(1.1), Inches(2.55), Inches(11.1), Inches(0.95))
    tf_th = tb_theme.text_frame
    tf_th.word_wrap = True
    p_th = tf_th.paragraphs[0]
    p_th.text = "« Conception et développement d’une plateforme numérique de gestion des services de SOUTARAH GROUP intégrant une application mobile dédiée à la réservation de véhicules »"
    p_th.font.name = FONT_HEADING
    p_th.font.size = Pt(15.5)
    p_th.font.bold = True
    p_th.font.color.rgb = LOGO_BRAND_GREEN

    # Carte Problématique (Bas)
    add_card(s5, Inches(0.8), Inches(3.9), Inches(11.73), Inches(2.85), bg_color=DARK_CARD_BG, border_color=LOGO_BRAND_GREEN)
    add_badge(s5, Inches(1.1), Inches(4.15), Inches(2.5), Inches(0.32), "QUESTION DE RECHERCHE", bg_color=LOGO_DARK_GREEN, txt_color=LOGO_LEAF_LIME)

    tb_prob = s5.shapes.add_textbox(Inches(1.1), Inches(4.6), Inches(11.1), Inches(1.9))
    tf_pr = tb_prob.text_frame
    tf_pr.word_wrap = True
    p_q = tf_pr.paragraphs[0]
    p_q.text = "Comment concevoir et déployer une plateforme logicielle moderne et sécurisée permettant à SOUTARAH GROUP de centraliser l'ensemble de ses activités multisectorielles, de fiabiliser les réservations de sa flotte automobile sans conflit de dates, et de délivrer des devis officiels automatisés ?"
    p_q.font.name = FONT_HEADING
    p_q.font.size = Pt(15)
    p_q.font.bold = True
    p_q.font.color.rgb = TEXT_WHITE

    p_sub = tf_pr.add_paragraph()
    p_sub.text = "➜ Réponse apportée : Écosystème 3-tiers unifié articulant Portail Web (6 pôles), Application Mobile React Native (réservation temps réel) et API REST Node.js / MySQL avec génération PDF automatique."
    p_sub.font.name = FONT_BODY
    p_sub.font.size = Pt(12)
    p_sub.font.color.rgb = LOGO_LEAF_LIME
    p_sub.space_before = Pt(10)

    add_footer(s5, 5)

    # =========================================================================
    # SLIDE 06 : INTERCALAIRE SECTION 2 : CONTEXTE GÉNÉRAL
    # =========================================================================
    create_section_divider(prs, 6, 2, "CONTEXTE GÉNÉRAL",
                           "Présentation détaillée de la structure d'accueil SOUTARAH GROUP, analyse critique de l'existant, solution globale proposée et chronogramme prévisionnel.")

    # =========================================================================
    # SLIDE 07 : SECTION 2 - PRÉSENTATION DE SOUTARAH GROUP
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, prs, LIGHT_BG)
    add_header(s7, "2. CONTEXTE GÉNÉRAL • ORGANISME D'ACCUEIL",
               "Présentation de l'Entreprise : SOUTARAH GROUP",
               "Une Société à Responsabilité Limitée (SARL) polyvalente d'excellence basée à Abidjan")

    # Carte gauche : Identité & Mission
    add_card(s7, Inches(0.8), Inches(1.85), Inches(5.7), Inches(4.9), bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s7, Inches(1.1), Inches(2.1), Inches(2.5), Inches(0.32), "IDENTITÉ & MISSION")

    tb_id = s7.shapes.add_textbox(Inches(1.1), Inches(2.55), Inches(5.1), Inches(4.0))
    tf_id = tb_id.text_frame
    tf_id.word_wrap = True
    p_id = tf_id.paragraphs[0]
    p_id.text = "Identité Corporative"
    p_id.font.name = FONT_HEADING
    p_id.font.size = Pt(14)
    p_id.font.bold = True
    p_id.font.color.rgb = TEXT_DARK

    p_id_body = tf_id.add_paragraph()
    p_id_body.text = "• Forme juridique : SARL multisectorielle basée à Abidjan (Côte d'Ivoire).\n• Vocation : Offrir des services de qualité supérieure, fiables et adaptés aux entreprises, institutions et particuliers.\n\nMission Fondatrice\n« Réinventer des services de qualité, fiables et adaptés, en maintenant un niveau d'excellence homogène auprès d'un prestataire unique. »\n\nVision Stratégique\n« Devenir le partenaire privilégié de référence en Afrique de l'Ouest grâce à des solutions innovantes, une réactivité hors pair et une relation client digitalisée. »"
    p_id_body.font.name = FONT_BODY
    p_id_body.font.size = Pt(11)
    p_id_body.font.color.rgb = TEXT_BODY
    p_id_body.space_before = Pt(8)

    # Carte droite : Partenaires de Confiance
    add_card(s7, Inches(6.8), Inches(1.85), Inches(5.7), Inches(4.9), bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s7, Inches(7.1), Inches(2.1), Inches(2.8), Inches(0.32), "PARTENARIATS STRATÉGIQUES")

    tb_part = s7.shapes.add_textbox(Inches(7.1), Inches(2.55), Inches(5.1), Inches(4.0))
    tf_part = tb_part.text_frame
    tf_part.word_wrap = True
    p_pt = tf_part.paragraphs[0]
    p_pt.text = "Partenaires Institutionnels & Industriels"
    p_pt.font.name = FONT_HEADING
    p_pt.font.size = Pt(14)
    p_pt.font.bold = True
    p_pt.font.color.rgb = TEXT_DARK

    p_pt_body = tf_part.add_paragraph()
    p_pt_body.text = "SOUTARAH GROUP entretient des relations de confiance solides avec des leaders sectoriels :\n\n" \
                     "• BESSAC : Leader mondial des tunneliers et microtunneliers (chantiers majeurs de drainage et métro).\n" \
                     "• CIM IVOIRE : Acteur de premier plan de l'industrie cimentière et des matériaux de construction.\n" \
                     "• DM COMPANY : Partenaire clé en logistique, négoce et distribution d'équipements techniques.\n" \
                     "• SOUTHCOMP POLARIS : Référence dans la distribution de solutions informatiques à valeur ajoutée.\n" \
                     "• ENABEL : Agence belge de développement (projets d'appui et développement durable)."
    p_pt_body.font.name = FONT_BODY
    p_pt_body.font.size = Pt(11)
    p_pt_body.font.color.rgb = TEXT_BODY
    p_pt_body.space_before = Pt(8)

    add_footer(s7, 7)

    # =========================================================================
    # SLIDE 08 : SECTION 2 - VALEURS S.A.P.E & LES 6 PÔLES D'ACTIVITÉS
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8, prs, LIGHT_BG)
    add_header(s8, "2. CONTEXTE GÉNÉRAL • CULTURE & MÉTIERS",
               "Valeurs Fondatrices S.A.P.E & Les 6 Pôles d'Activités",
               "Un socle éthique solide combiné à une offre multisectorielle complète")

    # Carte Gauche : Valeurs S.A.P.E (4 sous-cartes)
    add_card(s8, Inches(0.8), Inches(1.85), Inches(5.5), Inches(4.9), bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s8, Inches(1.0), Inches(2.05), Inches(2.6), Inches(0.32), "VALEURS CORPORATIVES S.A.P.E")

    sape_items = [
        ("S — Solution pérenne & innovante", "Privilégier la durabilité technique et l'innovation continue."),
        ("A — Adaptabilité opérationnelle", "Ajustement constant aux spécificités de chaque profil client."),
        ("P — Priorité client absolue", "Satisfaction et réactivité érigées en impératif de performance."),
        ("E — Efficacité du personnel", "Rigueur et compétences au service d'une exécution de qualité.")
    ]
    for k, (t, d) in enumerate(sape_items):
        y = Inches(2.5) + k * Inches(1.02)
        add_card(s8, Inches(1.0), y, Inches(5.1), Inches(0.92), bg_color=ROW_ALT_BG, border_color=CARD_BORDER)
        tb_v = s8.shapes.add_textbox(Inches(1.15), y + Inches(0.08), Inches(4.8), Inches(0.75))
        tf_v = tb_v.text_frame
        tf_v.word_wrap = True
        pv1 = tf_v.paragraphs[0]
        pv1.text = t
        pv1.font.name = FONT_HEADING
        pv1.font.size = Pt(11.5)
        pv1.font.bold = True
        pv1.font.color.rgb = LOGO_BRAND_GREEN

        pv2 = tf_v.add_paragraph()
        pv2.text = d
        pv2.font.name = FONT_BODY
        pv2.font.size = Pt(10)
        pv2.font.color.rgb = TEXT_BODY

    # Carte Droite : Les 6 Pôles de Services
    add_card(s8, Inches(6.6), Inches(1.85), Inches(5.9), Inches(4.9), bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s8, Inches(6.8), Inches(2.05), Inches(2.8), Inches(0.32), "LES 6 PÔLES MULTISECTORIELS")

    poles = [
        ("1. Location de Véhicules", "Flotte de 21 véhicules (SUV, Berlines, 4x4, Utilitaires) avec option chauffeur."),
        ("2. Négoce & Import-Export", "Approvisionnement et distribution d'équipements industriels et consommables."),
        ("3. Prestations Techniques", "Installations électriques, maintenance industrielle, réseaux et travaux BTP."),
        ("4. Énergies Renouvelables", "Solutions solaires photovoltaïques et optimisation de l'efficacité énergétique."),
        ("5. Agropastorale", "Production agricole durable, intrants et élevage à haute valeur ajoutée."),
        ("6. Immobilier", "Gestion locative, vente et valorisation de biens immobiliers professionnels.")
    ]
    for k, (t, d) in enumerate(poles):
        y = Inches(2.5) + k * Inches(0.68)
        tb_p = s8.shapes.add_textbox(Inches(6.8), y, Inches(5.5), Inches(0.65))
        tf_p = tb_p.text_frame
        tf_p.word_wrap = True
        pp1 = tf_p.paragraphs[0]
        pp1.text = t
        pp1.font.name = FONT_HEADING
        pp1.font.size = Pt(11)
        pp1.font.bold = True
        pp1.font.color.rgb = TEXT_DARK

        pp2 = tf_p.add_paragraph()
        pp2.text = d
        pp2.font.name = FONT_BODY
        pp2.font.size = Pt(9.5)
        pp2.font.color.rgb = TEXT_MUTED

    add_footer(s8, 8)

    # =========================================================================
    # SLIDE 09 : SECTION 2 - ÉTUDE DE L'EXISTANT
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9, prs, LIGHT_BG)
    add_header(s9, "2. CONTEXTE GÉNÉRAL • ÉTUDE DE L'EXISTANT",
               "Outils et Méthodes Traditionnels en Place",
               "Cartographie des mécanismes opérationnels utilisés avant l'informatisation")

    headers_existant = ["Outil / Méthode", "Description du procédé", "Niveau d'utilisation", "Limite constatée"]
    rows_existant = [
        ["Cahier de demandes", "Registre papier manuscrit à l'accueil pour noter les demandes", "Réception physique des clients", "Risque élevé d'omission et perte de feuilles"],
        ["Téléphone & WhatsApp", "Échanges directs non centralisés par messagerie instantanée", "Prise d'information et devis", "Données éparpillées sur les téléphones du personnel"],
        ["Messagerie Email", "Réception sur boîte mail générique sans ticket de suivi", "Envoi et réception de devis", "Retards de lecture et aucun suivi de statut"],
        ["Fichiers Excel", "Tableurs individuels pour noter les clients et disponibilités", "Gestion administrative", "Multiples versions conflictuelles, non partagé"],
        ["Site Vitrine Statique", "Page Web statique sans base de données ni catalogue dynamique", "Présentation externe", "Aucune interaction, pas de panier ni de réservation"]
    ]
    col_w = [Inches(2.2), Inches(3.8), Inches(2.7), Inches(3.0)]
    create_table(s9, Inches(0.8), Inches(1.9), Inches(11.73), Inches(4.5), headers_existant, rows_existant, col_w)

    add_footer(s9, 9)

    # =========================================================================
    # SLIDE 10 : SECTION 2 - LIMITES & CRITIQUES DE L'EXISTANT
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10, prs, LIGHT_BG)
    add_header(s10, "2. CONTEXTE GÉNÉRAL • CRITIQUE DE L'EXISTANT",
               "Limites Opérationnelles & Impacts Métier Majeurs",
               "Pourquoi la transformation numérique intégrale est devenue indispensable")

    limites = [
        ("LENTEUR ADMINISTRATIVE", "Délai de traitement de 45 minutes par devis",
         "L'édition manuelle sur tableur entraînait des retards chroniques de réponse aux clients, causant la perte d'opportunités commerciales."),
        ("RISQUE DE DOUBLE RÉSERVATION", "Conflits d'attribution des véhicules",
         "L'absence d'agenda partagé en temps réel entraînait des promesses de location contradictoires sur un même véhicule, dégradant l'image de marque."),
        ("ABSENCE D'ESPACE CLIENT", "Aucune visibilité pour la clientèle",
         "Les clients étaient contraints d'appeler fréquemment pour connaître l'état de traitement de leur demande ou obtenir un duplicata de devis."),
        ("ABSENCE DE TRAÇABILITÉ", "Aucune métrique financière consolidée",
         "Impossibilité pour la direction d'analyser en temps réel le chiffre d'affaires prévisionnel, les véhicules les plus demandés ou la conversion.")
    ]

    for idx, (badge_t, title, desc) in enumerate(limites):
        col = 0 if idx < 2 else 1
        row = idx % 2
        left = Inches(0.8) if col == 0 else Inches(6.8)
        top = Inches(1.9) + row * Inches(2.45)
        width = Inches(5.7)
        height = Inches(2.25)

        add_card(s10, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s10, left + Inches(0.25), top + Inches(0.25), Inches(3.2), Inches(0.32), badge_t)

        tb = s10.shapes.add_textbox(left + Inches(0.25), top + Inches(0.7), Inches(5.2), Inches(1.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.name = FONT_HEADING
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_DARK

        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.name = FONT_BODY
        p_d.font.size = Pt(10.5)
        p_d.font.color.rgb = TEXT_BODY
        p_d.space_before = Pt(6)

    add_footer(s10, 10)

    # =========================================================================
    # SLIDE 11 : SECTION 2 - SOLUTION PROPOSÉE
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11, prs, LIGHT_BG)
    add_header(s11, "2. CONTEXTE GÉNÉRAL • ARCHITECTURE CIBLE",
               "La Solution Proposée : Écosystème Logiciel Unifié",
               "Une réponse globale combinant Web réactif, Mobilité native et API centralisée")

    # 3 piliers architecturaux
    piliers = [
        ("CANAL WEB INTÉGRÉ", "Plateforme Web 6 Pôles",
         "• Développée sous React.js v18 & Tailwind CSS.\n• Présentation interactive des 6 pôles métiers.\n• Panier multi-articles hybride (véhicules & négoce).\n• Génération instantanée de Devis PDF officiel 2 pages.\n• Back-Office complet pour l'administration."),
        ("CANAL MOBILE DÉDIÉ", "Application Native 'SOUTARAH'",
         "• Développée sous React Native & Expo (iOS / Android).\n• Spécialisée 100% sur la mobilité et les 21 véhicules.\n• Fiche détaillée, sélection calendrier dynamique.\n• Calcul immédiat du tarif (Abidjan / Hors Abidjan / Chauffeur).\n• Suivi des devis et téléchargement PDF direct."),
        ("MOTEUR CENTRALISÉ", "API REST & Base MySQL",
         "• Développé sous Node.js & framework Express.\n• Algorithme de vérification anti-double réservation.\n• Sécurisation complète par jetons JWT & Bcrypt.\n• Automatisation des notifications transactionnelles Brevo.\n• Persistance unifiée sur base MySQL hébergée.")
    ]

    for i, (badge_txt, title, body) in enumerate(piliers):
        left = Inches(0.8) + i * Inches(3.95)
        top = Inches(1.85)
        width = Inches(3.8)
        height = Inches(4.9)
        add_card(s11, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s11, left + Inches(0.25), top + Inches(0.25), Inches(3.2), Inches(0.32), badge_txt)

        tb = s11.shapes.add_textbox(left + Inches(0.25), top + Inches(0.75), Inches(3.3), Inches(3.9))
        tf = tb.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.name = FONT_HEADING
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_DARK

        p_b = tf.add_paragraph()
        p_b.text = body
        p_b.font.name = FONT_BODY
        p_b.font.size = Pt(10.5)
        p_b.font.color.rgb = TEXT_BODY
        p_b.space_before = Pt(10)

    add_footer(s11, 11)

    # =========================================================================
    # SLIDE 12 : SECTION 2 - OBJECTIFS DU PROJET
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12, prs, LIGHT_BG)
    add_header(s12, "2. CONTEXTE GÉNÉRAL • OBJECTIFS",
               "Objectifs Stratégiques & Opérationnels du Projet",
               "Des engagements clairs et mesurables pour moderniser l'entreprise")

    # Objectif Général (Haut)
    add_card(s12, Inches(0.8), Inches(1.85), Inches(11.73), Inches(1.5), bg_color=DARK_CARD_BG, border_color=LOGO_BRAND_GREEN)
    add_badge(s12, Inches(1.1), Inches(2.05), Inches(2.2), Inches(0.32), "OBJECTIF GÉNÉRAL", bg_color=LOGO_DARK_GREEN, txt_color=LOGO_LEAF_LIME)

    tb_og = s12.shapes.add_textbox(Inches(1.1), Inches(2.45), Inches(11.1), Inches(0.75))
    tf_og = tb_og.text_frame
    tf_og.word_wrap = True
    p_og = tf_og.paragraphs[0]
    p_og.text = "Concevoir et développer une plateforme numérique unifiée de gestion multisectorielle et une application mobile dédiée à la réservation de véhicules, synchronisées en temps réel par une API REST sécurisée."
    p_og.font.name = FONT_HEADING
    p_og.font.size = Pt(13.5)
    p_og.font.bold = True
    p_og.font.color.rgb = TEXT_WHITE

    # 4 Objectifs Spécifiques (Bas en 4 cartes)
    specs = [
        ("CENTRALISATION", "Portail Web 6 Pôles", "Digitaliser le catalogue et permettre la formulation de devis 24h/24."),
        ("MOBILITÉ PARC", "App Mobile 21 Véhicules", "Vérification de disponibilité instantanée sans double réservation."),
        ("AUTOMATISATION", "Devis PDF & Brevo", "Calcul automatisé des taxes (TVA, TDT) et émission PDF 2 pages."),
        ("PILOTAGE ADMIN", "Back-Office Consolidé", "Supervision des réservations, gestion des tarifs et KPIs en direct.")
    ]
    for k, (b, t, d) in enumerate(specs):
        left = Inches(0.8) + k * Inches(2.97)
        top = Inches(3.6)
        width = Inches(2.82)
        height = Inches(3.15)
        add_card(s12, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s12, left + Inches(0.2), top + Inches(0.2), Inches(2.4), Inches(0.32), b)

        tb = s12.shapes.add_textbox(left + Inches(0.2), top + Inches(0.7), Inches(2.42), Inches(2.2))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = t
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(12)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK

        pd = tf.add_paragraph()
        pd.text = d
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10)
        pd.font.color.rgb = TEXT_BODY
        pd.space_before = Pt(8)

    add_footer(s12, 12)

    # =========================================================================
    # SLIDE 13 : SECTION 2 - PLANIFICATION DES TÂCHES
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    set_slide_background(s13, prs, LIGHT_BG)
    add_header(s13, "2. CONTEXTE GÉNÉRAL • PLANIFICATION",
               "Chronogramme Prévisionnel des Tâches (2 Mois)",
               "Découpage des 7 étapes majeures conduites du 03 Août au 03 Octobre 2026")

    headers_plan = ["N°", "Désignation de la tâche", "Date Début", "Durée", "Date Fin", "Livrable produit"]
    rows_plan = [
        ["1", "Prise de contact, immersion et compréhension du projet", "03/08/2026", "5 jours", "07/08/2026", "Compte-rendu de cadrage & étude du terrain"],
        ["2", "Étude de l'existant et rédaction du cahier des charges", "08/08/2026", "4 jours", "11/08/2026", "Cahier des charges fonctionnel et technique"],
        ["3", "Modélisation conceptuelle PU/UML & schéma de la base", "12/08/2026", "6 jours", "17/08/2026", "Diagrammes UML (Cas d'util., Séquences, Classes)"],
        ["4", "Développement API Backend Node.js / Express & MySQL", "18/08/2026", "10 jours", "27/08/2026", "API REST sécurisée (Auth JWT, CRUD, Réservations)"],
        ["5", "Développement Plateforme Web React.js & Tailwind CSS", "28/08/2026", "12 jours", "08/09/2026", "Site Web vitrine, Panier multi-articles, Back-office"],
        ["6", "Développement Application Mobile React Native / Expo", "09/09/2026", "12 jours", "20/09/2026", "Application Android/iOS pour réservation de véhicules"],
        ["7", "Tests d'intégration, recette & rédaction du rapport", "21/09/2026", "12 jours", "03/10/2026", "Rapport de stage validé et PV de recette fonctionnelle"]
    ]
    col_wp = [Inches(0.6), Inches(4.5), Inches(1.4), Inches(1.1), Inches(1.4), Inches(2.73)]
    create_table(s13, Inches(0.8), Inches(1.85), Inches(11.73), Inches(4.8), headers_plan, rows_plan, col_wp)

    add_footer(s13, 13)

    # =========================================================================
    # SLIDE 14 : SECTION 2 - DIAGRAMME DE GANTT (FIGURE 1)
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    set_slide_background(s14, prs, LIGHT_BG)
    add_header(s14, "2. CONTEXTE GÉNÉRAL • PLANIFICATION TEMPORELLE",
               "Diagramme de GANTT du Projet (Figure 1 du Rapport)",
               "Ordonnancement logique et respect rigoureux des jalons de développement")

    # Image GANTT (Figure 1)
    img_gantt = "extracted_docx_images/image1.png"
    add_card(s14, Inches(0.8), Inches(1.85), Inches(8.0), Inches(4.9), bg_color=CARD_BG, border_color=CARD_BORDER)
    place_image_in_box(s14, img_gantt, Inches(1.0), Inches(2.05), Inches(7.6), Inches(4.5))

    # Carte d'analyse à droite
    add_card(s14, Inches(9.0), Inches(1.85), Inches(3.53), Inches(4.9), bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s14, Inches(9.25), Inches(2.1), Inches(2.5), Inches(0.32), "ANALYSE DU PLANNING")

    tb_ga = s14.shapes.add_textbox(Inches(9.25), Inches(2.6), Inches(3.03), Inches(4.0))
    tf_ga = tb_ga.text_frame
    tf_ga.word_wrap = True
    p_ga = tf_ga.paragraphs[0]
    p_ga.text = "Points Clés de l'Exécution"
    p_ga.font.name = FONT_HEADING
    p_ga.font.size = Pt(13)
    p_ga.font.bold = True
    p_ga.font.color.rgb = TEXT_DARK

    p_gab = tf_ga.add_paragraph()
    p_gab.text = "• Durée totale : 2 mois fermes (du 3 août au 3 octobre 2026).\n\n" \
                 "• Démarche en recouvrement partiel : la modélisation PU/UML a nourri directement l'architecture logicielle.\n\n" \
                 "• Priorité Backend : l'API REST a été stabilisée avant le branchement des interfaces Web et Mobile.\n\n" \
                 "• Recette continue : campagne de tests fonctionnels et corrections d'intégration sur les 12 derniers jours."
    p_gab.font.name = FONT_BODY
    p_gab.font.size = Pt(10.5)
    p_gab.font.color.rgb = TEXT_BODY
    p_gab.space_before = Pt(8)

    add_footer(s14, 14)

    # =========================================================================
    # SLIDE 15 : INTERCALAIRE SECTION 3 : MÉTHODE D’ANALYSE
    # =========================================================================
    create_section_divider(prs, 15, 3, "MÉTHODE D’ANALYSE",
                           "Étude comparative des approches méthodologiques d'ingénierie logicielle (MERISE vs PU/UML) et justification de la démarche retenue.")

    print("Slides 1 to 15 successfully built.")
