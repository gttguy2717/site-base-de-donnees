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
    add_card, add_badge, create_section_divider, place_image_in_box, LOGO_PATH
)

def build_part1(prs):
    blank_layout = prs.slide_layouts[6]

    # ==========================================
    # SLIDE 1 : COUVERTURE OFFICIELLE (LOGO SOUTARAH GREEN THEME)
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, prs, LOGO_DARK_GREEN)

    # Accent top border - Vert feuille signature
    top_bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), prs.slide_width, Inches(0.12))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = LOGO_LEAF_LIME
    top_bar.line.fill.background()

    # Academic & Level badge
    add_badge(s1, Inches(0.8), Inches(0.65), Inches(5.8), Inches(0.36),
              "SOUTENANCE DE STAGE D'APPLICATION • CYCLE TECHNICIEN SUPÉRIEUR",
              bg_color=DARK_CARD_BG, txt_color=LOGO_LEAF_LIME)

    # Logo officiel SOUTARAH
    if os.path.exists(LOGO_PATH):
        try:
            s1.shapes.add_picture(LOGO_PATH, Inches(10.8), Inches(0.55), height=Inches(0.85))
        except:
            pass

    # Titre du projet
    tb_t = s1.shapes.add_textbox(Inches(0.8), Inches(1.35), Inches(11.73), Inches(1.7))
    tf_t = tb_t.text_frame
    tf_t.word_wrap = True
    tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0
    p1 = tf_t.paragraphs[0]
    p1.text = "Conception et Développement d’une Plateforme Numérique Web & Mobile de Gestion des Services de SOUTARAH GROUP"
    p1.font.name = FONT_HEADING
    p1.font.size = Pt(25)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE

    # Sous-titre
    tb_sub = s1.shapes.add_textbox(Inches(0.8), Inches(3.2), Inches(11.73), Inches(0.8))
    tf_sub = tb_sub.text_frame
    tf_sub.word_wrap = True
    tf_sub.margin_left = tf_sub.margin_top = tf_sub.margin_right = tf_sub.margin_bottom = 0
    p_sub = tf_sub.paragraphs[0]
    p_sub.text = "Avec application mobile dédiée à la réservation et au suivi de véhicules en temps réel"
    p_sub.font.name = FONT_BODY
    p_sub.font.size = Pt(14)
    p_sub.font.color.rgb = RGBColor(190, 242, 195)

    # 4 Meta Cards
    meta_data = [
        ("CANDIDAT", "David SORHO", "Élève Technicien Supérieur"),
        ("STRUCTURE D'ACCUEIL", "SOUTARAH GROUP", "Entreprise multisectorielle"),
        ("FORMATION & ÉCOLE", "INP-HB Yamoussoukro", "ESI • Département STIC"),
        ("SESSION & DATE", "Stage d'application (2 mois)", "15 Septembre 2026")
    ]
    card_w = Inches(2.78)
    card_h = Inches(2.0)
    card_top = Inches(4.35)
    for i, (kicker, title, desc) in enumerate(meta_data):
        left = Inches(0.8 + i * 2.98)
        card = add_card(s1, left, card_top, card_w, card_h, bg_color=DARK_CARD_BG, border_color=DARK_CARD_BORDER,
                        top_accent_color=LOGO_LEAF_LIME if i==0 else LOGO_BRAND_GREEN)
        
        tb = s1.shapes.add_textbox(left + Inches(0.2), card_top + Inches(0.25), card_w - Inches(0.4), card_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        pk = tf.paragraphs[0]
        pk.text = kicker
        pk.font.name = FONT_HEADING
        pk.font.size = Pt(8.5)
        pk.font.bold = True
        pk.font.color.rgb = LOGO_LEAF_LIME
        
        pt = tf.add_paragraph()
        pt.space_before = Pt(6)
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_WHITE

        pd = tf.add_paragraph()
        pd.space_before = Pt(4)
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10)
        pd.font.color.rgb = RGBColor(180, 210, 190)

    add_footer(s1, 1, is_dark=True)

    # ==========================================
    # SLIDE 2 : CADRE ACADÉMIQUE & FORMATION
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, prs, LIGHT_BG)
    add_header(s2, "Cadre Institutionnel", "Cadre Académique et Professionnel du Stage",
               "Une immersion de 2 mois pour concrétiser les acquis théoriques en solution logicielle exploitable")

    cadre_items = [
        ("01", "INSTITUTION D'ÉLITE", "INP-HB Yamoussoukro",
         "Institut National Polytechnique Félix Houphouët-Boigny, fleuron de la formation technologique et d'ingénierie en Côte d'Ivoire."),
        ("02", "DÉPARTEMENT SPÉCIALISÉ", "ESI • Filière STIC",
         "École Supérieure d'Industrie et département Sciences et Technologies de l'Information et de la Communication (STIC)."),
        ("03", "NATURE DU STAGE", "Stage d'Application (2 mois)",
         "Période officielle du 03 août au 03 octobre 2026. Immersion opérationnelle visant la conception d'un projet informatique complet."),
        ("04", "MISSION GÉNÉRALE", "Transformation Numérique",
         "Concevoir, modéliser, développer et valider une plateforme web et une application mobile interconnectées pour SOUTARAH GROUP.")
    ]
    w = Inches(5.72)
    h = Inches(2.25)
    coords = [
        (Inches(0.8), Inches(1.85)),
        (Inches(6.8), Inches(1.85)),
        (Inches(0.8), Inches(4.35)),
        (Inches(6.8), Inches(4.35))
    ]
    for idx, (num, tag, title, desc) in enumerate(cadre_items):
        cx, cy = coords[idx]
        add_card(s2, cx, cy, w, h, top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s2, cx + Inches(0.25), cy + Inches(0.25), Inches(0.55), Inches(0.3), num, bg_color=LIME_LIGHT_BG, txt_color=LOGO_BRAND_GREEN)
        
        tb = s2.shapes.add_textbox(cx + Inches(0.95), cy + Inches(0.25), w - Inches(1.2), h - Inches(0.4))
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
        pt.space_before = Pt(3)
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(13.5)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK
        
        pd = tf.add_paragraph()
        pd.space_before = Pt(6)
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = TEXT_BODY

    add_footer(s2, 2)

    # ==========================================
    # SLIDE 3 : SOMMAIRE / ORDRE DU JOUR (SANS AUCUNE MINUTE)
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, prs, LIGHT_BG)
    add_header(s3, "Structure de la Soutenance", "Ordre du Jour • Démarche d'Ingénierie Logicielle",
               "Cinq séquences complémentaires retraçant l'ensemble du cycle de vie du projet")

    sequences = [
        ("01", "Cadre & Contexte du Projet", "Présentation de SOUTARAH GROUP, diagnostic de l'existant, problématique métier et objectifs."),
        ("02", "Étude Conceptuelle & Méthodologie", "Justification PU/UML vs MERISE, modélisation dynamique (activités, séquences) et statique (classes)."),
        ("03", "Architecture & Choix Technologiques", "Chaîne Full JavaScript (React, React Native Expo, Node.js), SGBD MySQL et infrastructure 3-tiers."),
        ("04", "Réalisation & Démonstration Système", "Interfaces Web, application mobile dédiée à la réservation, back-office admin et accélérateurs."),
        ("05", "Résultats, Bilan & Perspectives", "Cahier de recettes, bilan financier estimatif (290 000 FCFA), rentabilité / ROI et évolutions futures.")
    ]
    sw = Inches(11.73)
    sh = Inches(0.92)
    s_top = Inches(1.85)
    for idx, (num, stitle, sdesc) in enumerate(sequences):
        sy = s_top + idx * Inches(1.02)
        add_card(s3, Inches(0.8), sy, sw, sh, top_accent_color=None)
        add_badge(s3, Inches(1.05), sy + Inches(0.22), Inches(0.65), Inches(0.48), num, bg_color=LIME_LIGHT_BG, txt_color=LOGO_BRAND_GREEN)
        
        tb = s3.shapes.add_textbox(Inches(1.9), sy + Inches(0.18), Inches(10.4), Inches(0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        pt = tf.paragraphs[0]
        pt.text = stitle
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK
        
        pd = tf.add_paragraph()
        pd.space_before = Pt(2)
        pd.text = sdesc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10)
        pd.font.color.rgb = TEXT_MUTED

    add_footer(s3, 3)

    # ==========================================
    # SLIDE 4 : INTERCALAIRE PARTIE I
    # ==========================================
    create_section_divider(prs, 4, 1,
                           "PARTIE I : CADRE ET CONTEXTE DU PROJET",
                           "Présentation générale de la structure d’accueil SOUTARAH GROUP, analyse du fonctionnement initial, problématique métier et planification générale.")

    # ==========================================
    # SLIDE 5 : DIAGNOSTIC & POURQUOI CE PROJET
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, prs, LIGHT_BG)
    add_header(s5, "Contexte Métier", "Pourquoi ce Projet ? Le Diagnostic Opérationnel",
               "Une expansion rapide confrontée aux limites structurelles de la gestion manuelle")

    diag_cards = [
        ("01", "Pression Opérationnelle", "La hausse continue du volume de demandes de devis et de réservations multisectorielles saturait les équipes."),
        ("02", "Processus Manuels Dispersés", "L'usage conjoint d'emails isolés, d'appels téléphoniques et de registres papier limitait fortement la traçabilité."),
        ("03", "Absence de Visibilité Temps Réel", "Aucune vision centralisée sur la disponibilité effective du parc automobile, engendrant des risques de surréservation."),
        ("04", "Délais de Réponse Élevés", "Le chiffrage manuel et l'édition de devis pro-forma mobilisaient jusqu'à 45 minutes par dossier client.")
    ]
    w4 = Inches(2.78)
    h4 = Inches(4.7)
    for idx, (num, title, desc) in enumerate(diag_cards):
        cx = Inches(0.8 + idx * 2.98)
        add_card(s5, cx, Inches(1.85), w4, h4, top_accent_color=LOGO_LEAF_LIME if idx==0 else LOGO_BRAND_GREEN)
        add_badge(s5, cx + Inches(0.25), Inches(2.15), Inches(0.6), Inches(0.35), num, bg_color=LIME_LIGHT_BG, txt_color=LOGO_BRAND_GREEN)
        
        tb = s5.shapes.add_textbox(cx + Inches(0.25), Inches(2.7), w4 - Inches(0.5), Inches(3.6))
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
        pd.space_before = Pt(10)
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(11)
        pd.font.color.rgb = TEXT_BODY

    add_footer(s5, 5)

    # ==========================================
    # SLIDE 6 : SOUTARAH GROUP EN BREF
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, prs, LIGHT_BG)
    add_header(s6, "Présentation de l'Entreprise", "SOUTARAH GROUP en Bref",
               "Une entreprise polyvalente orientée vers la prestation de services intégrés aux professionnels et particuliers")

    sout_cards = [
        ("OFFRE & ACTIVITÉS", "Expertise Multisectorielle",
         "Intervention dans des secteurs stratégiques : location automobile, négoce et import-export de marchandises, ingénierie technique, énergies renouvelables, agropastorale et immobilier."),
        ("POSITIONNEMENT", "Solutions Intégrées Unifiées",
         "Capacité à répondre aux besoins complexes de ses clients en garantissant un niveau de qualité rigoureusement uniforme sous l'égide d'un interlocuteur commercial unique."),
        ("AMBITION", "Pionnier de la Modernisation",
         "Volonté forte de révolutionner la prestation de services en Côte d'Ivoire par la digitalisation complète des processus, l'agilité organisationnelle et l'excellence relationnelle.")
    ]
    w3 = Inches(3.75)
    h3 = Inches(4.7)
    for idx, (tag, title, desc) in enumerate(sout_cards):
        cx = Inches(0.8 + idx * 3.99)
        add_card(s6, cx, Inches(1.85), w3, h3, top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s6, cx + Inches(0.3), Inches(2.15), Inches(2.2), Inches(0.32), tag)
        
        tb = s6.shapes.add_textbox(cx + Inches(0.3), Inches(2.65), w3 - Inches(0.6), Inches(3.6))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(14)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK
        
        pd = tf.add_paragraph()
        pd.space_before = Pt(10)
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(11)
        pd.font.color.rgb = TEXT_BODY

    add_footer(s6, 6)

    # ==========================================
    # SLIDE 7 : MISSION, VISION & VALEURS S.A.P.E
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, prs, LIGHT_BG)
    add_header(s7, "Identité & Philosophie", "Mission, Vision et Valeurs S.A.P.E",
               "Les fondations stratégiques qui guident l'ensemble des orientations de l'entreprise")

    # Left Column (Mission & Vision)
    add_card(s7, Inches(0.8), Inches(1.85), Inches(4.8), Inches(2.25), top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s7, Inches(1.05), Inches(2.05), Inches(1.2), Inches(0.32), "MISSION")
    tb_m = s7.shapes.add_textbox(Inches(1.05), Inches(2.45), Inches(4.3), Inches(1.5))
    tf_m = tb_m.text_frame
    tf_m.word_wrap = True
    tf_m.margin_left = tf_m.margin_top = tf_m.margin_right = tf_m.margin_bottom = 0
    pm_t = tf_m.paragraphs[0]
    pm_t.text = "Réinventer des services fiables et adaptés"
    pm_t.font.name = FONT_HEADING
    pm_t.font.size = Pt(13)
    pm_t.font.bold = True
    pm_t.font.color.rgb = TEXT_DARK
    pm_d = tf_m.add_paragraph()
    pm_d.space_before = Pt(4)
    pm_d.text = "Proposer aux clients des solutions sur mesure tout en élevant sans cesse les standards de qualité et de rapidité d'exécution."
    pm_d.font.name = FONT_BODY
    pm_d.font.size = Pt(10.5)
    pm_d.font.color.rgb = TEXT_BODY

    add_card(s7, Inches(0.8), Inches(4.3), Inches(4.8), Inches(2.25), top_accent_color=LOGO_LEAF_LIME)
    add_badge(s7, Inches(1.05), Inches(4.5), Inches(1.2), Inches(0.32), "VISION", bg_color=LIME_LIGHT_BG, txt_color=LOGO_BRAND_GREEN)
    tb_v = s7.shapes.add_textbox(Inches(1.05), Inches(4.9), Inches(4.3), Inches(1.5))
    tf_v = tb_v.text_frame
    tf_v.word_wrap = True
    tf_v.margin_left = tf_v.margin_top = tf_v.margin_right = tf_v.margin_bottom = 0
    pv_t = tf_v.paragraphs[0]
    pv_t.text = "Le partenaire de référence en Côte d'Ivoire"
    pv_t.font.name = FONT_HEADING
    pv_t.font.size = Pt(13)
    pv_t.font.bold = True
    pv_t.font.color.rgb = TEXT_DARK
    pv_d = tf_v.add_paragraph()
    pv_d.space_before = Pt(4)
    pv_d.text = "Être le partenaire privilégié de nos clients grâce à des solutions innovantes, une réactivité exceptionnelle et des services de qualité."
    pv_d.font.name = FONT_BODY
    pv_d.font.size = Pt(10.5)
    pv_d.font.color.rgb = TEXT_BODY

    # Right Column (Valeurs S.A.P.E)
    sape_items = [
        ("S", "Solution pérenne et innovante", "Développer des réponses durables et technologiques aux problématiques des clients."),
        ("A", "Adaptabilité", "Faire preuve d'agilité face aux exigences particulières et évolutives du marché."),
        ("P", "Priorité client", "Placer la satisfaction de l'usager au centre absolu de chaque processus commercial."),
        ("E", "Efficacité du personnel", "Mobiliser des compétences pointues et une rigueur sans faille au service du résultat.")
    ]
    for idx, (lettre, titre, desc) in enumerate(sape_items):
        cy = Inches(1.85 + idx * 1.2)
        add_card(s7, Inches(5.85), cy, Inches(6.68), Inches(1.05))
        add_badge(s7, Inches(6.05), cy + Inches(0.25), Inches(0.55), Inches(0.55), lettre, bg_color=LIME_LIGHT_BG, txt_color=LOGO_BRAND_GREEN)
        
        tb = s7.shapes.add_textbox(Inches(6.8), cy + Inches(0.18), Inches(5.5), Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        pt = tf.paragraphs[0]
        pt.text = titre
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(12)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK
        
        pd = tf.add_paragraph()
        pd.space_before = Pt(2)
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10)
        pd.font.color.rgb = TEXT_MUTED

    add_footer(s7, 7)

    # ==========================================
    # SLIDE 8 : LES 6 PÔLES D'ACTIVITÉ
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8, prs, LIGHT_BG)
    add_header(s8, "Périmètre Métier", "Les 6 Pôles d'Activité de SOUTARAH GROUP",
               "Une offre multisectorielle diversifiée unifiée sous un portail numérique centralisé")

    poles = [
        ("01", "LOCATION DE VÉHICULES", "Mobilité & Flotte Automobile",
         "Solutions de mobilité adaptées : véhicules utilitaires, berlines et SUV pour courtes durées ou missions prolongées."),
        ("02", "NÉGOCE / IMPORT-EXPORT", "Commerce International",
         "Approvisionnement et distribution de matériels industriels, équipements et fournitures professionnelles."),
        ("03", "PRESTATIONS TECHNIQUES", "Ingénierie & Maintenance",
         "Installation d'infrastructures, maintenance industrielle préventive et support technique d'équipements."),
        ("04", "ÉNERGIES RENOUVELABLES", "Transition Énergétique",
         "Solutions photovoltaïques, audits de performance énergétique et optimisation des consommations."),
        ("05", "AGROPASTORALE", "Production & Élevage",
         "Valorisation des productions agricoles locales et développement de projets d'élevage modernes."),
        ("06", "IMMOBILIER", "Gestion & Promotion",
         "Vente, location et gestion patrimoniale de biens résidentiels et professionnels.")
    ]
    w_p = Inches(3.75)
    h_p = Inches(2.25)
    coords_p = [
        (Inches(0.8), Inches(1.85)),
        (Inches(4.79), Inches(1.85)),
        (Inches(8.78), Inches(1.85)),
        (Inches(0.8), Inches(4.35)),
        (Inches(4.79), Inches(4.35)),
        (Inches(8.78), Inches(4.35))
    ]
    for idx, (num, tag, title, desc) in enumerate(poles):
        cx, cy = coords_p[idx]
        add_card(s8, cx, cy, w_p, h_p, top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s8, cx + Inches(0.25), cy + Inches(0.2), Inches(0.5), Inches(0.3), num)
        
        tb = s8.shapes.add_textbox(cx + Inches(0.85), cy + Inches(0.2), w_p - Inches(1.1), h_p - Inches(0.35))
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
        pt.font.size = Pt(12)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK
        
        pd = tf.add_paragraph()
        pd.space_before = Pt(4)
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10)
        pd.font.color.rgb = TEXT_BODY

    add_footer(s8, 8)

    # ==========================================
    # SLIDE 9 : PARTENARIATS STRATÉGIQUES
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9, prs, LIGHT_BG)
    add_header(s9, "Écosystème Partenarial", "Partenaires Stratégiques de SOUTARAH GROUP",
               "Des collaborations solides avec des acteurs industriels et institutionnels majeurs")

    partenaires = [
        ("BESSAC", "Travaux Souterrains & BTP", "Leader en ingénierie de micro-tunnels et travaux d'infrastructures lourdes."),
        ("DM Company", "Logistique & Distribution", "Partenaire commercial pour l'approvisionnement et la logistique de marchandises."),
        ("CIM IVOIRE", "Industrie Cimentière", "Référence ivoirienne de la production de ciment et matériaux de construction."),
        ("Southcomp Polaris", "Technologies & Matériel", "Distributeur à valeur ajoutée d'équipements informatiques et réseaux."),
        ("Enabel", "Coopération Internationale", "Agence belge de développement intervenant sur des projets socio-économiques durables.")
    ]
    pw = Inches(2.18)
    ph = Inches(4.7)
    for idx, (nom, domaine, desc) in enumerate(partenaires):
        cx = Inches(0.8 + idx * 2.38)
        add_card(s9, cx, Inches(1.85), pw, ph, top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s9, cx + Inches(0.2), Inches(2.15), pw - Inches(0.4), Inches(0.35), nom, bg_color=LIME_LIGHT_BG, txt_color=LOGO_BRAND_GREEN)
        
        tb = s9.shapes.add_textbox(cx + Inches(0.2), Inches(2.7), pw - Inches(0.4), Inches(3.6))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        pt = tf.paragraphs[0]
        pt.text = domaine
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(12)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK
        
        pd = tf.add_paragraph()
        pd.space_before = Pt(8)
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = TEXT_BODY

    add_footer(s9, 9)

    # ==========================================
    # SLIDE 10 : ÉTUDE DE L'EXISTANT (AVANT VS APRÈS)
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10, prs, LIGHT_BG)
    add_header(s10, "Étude de l'Existant", "Avant vs Après : La Révolution Numérique",
               "Comparaison directe entre les limites du système initial et les apports de la nouvelle plateforme")

    # Left: Avant (Gris ardoise / sobre)
    add_card(s10, Inches(0.8), Inches(1.85), Inches(5.72), Inches(4.7), top_accent_color=RGBColor(148, 163, 184))
    add_badge(s10, Inches(1.1), Inches(2.15), Inches(2.5), Inches(0.35), "FONCTIONNEMENT INITIAL", bg_color=RGBColor(241, 245, 249), txt_color=RGBColor(71, 85, 105))
    
    avant_points = [
        ("Site Vitrine Statique", "Présentation sommaire sans base de données, sans espace de connexion ni catalogue dynamique."),
        ("Formulaire Mail Passif", "Les messages arrivaient dans une boîte mail générique sans suivi d'état ni historisation."),
        ("Édition Manuelle de Devis", "Traitement lent nécessitant la saisie manuelle de documents Word/Excel (jusqu'à 45 min)."),
        ("Risque de Surréservation", "Absence de calendrier temps réel : conflits fréquents lors de demandes simultanées de véhicules.")
    ]
    tb_av = s10.shapes.add_textbox(Inches(1.1), Inches(2.7), Inches(5.12), Inches(3.6))
    tf_av = tb_av.text_frame
    tf_av.word_wrap = True
    tf_av.margin_left = tf_av.margin_top = tf_av.margin_right = tf_av.margin_bottom = 0
    for i, (t, d) in enumerate(avant_points):
        p = tf_av.paragraphs[0] if i==0 else tf_av.add_paragraph()
        p.space_before = Pt(8) if i>0 else Pt(0)
        p.text = f"•  {t} : {d}"
        p.font.name = FONT_BODY
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_BODY

    # Right: Après (Vert Soutarah)
    add_card(s10, Inches(6.8), Inches(1.85), Inches(5.72), Inches(4.7), top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s10, Inches(7.1), Inches(2.15), Inches(2.8), Inches(0.35), "NOUVELLE PLATEFORME SOUTARAH", bg_color=LIME_LIGHT_BG, txt_color=LOGO_BRAND_GREEN)
    
    apres_points = [
        ("Écosystème Web & Mobile Unifié", "Synchronisation instantanée des données entre portail Web et application mobile native."),
        ("Réservation Temps Réel", "Contrôle automatique des calendriers et blocage préventif des créneaux déjà réservés."),
        ("Génération Devis PDF Instantanée", "Édition automatique d'un pro-forma officiel conforme sur 2 pages en moins de 3 minutes."),
        ("Tour de Contrôle Back-Office", "Tableau de bord d'administration temps réel, gestion de flotte et notifications par e-mail.")
    ]
    tb_ap = s10.shapes.add_textbox(Inches(7.1), Inches(2.7), Inches(5.12), Inches(3.6))
    tf_ap = tb_ap.text_frame
    tf_ap.word_wrap = True
    tf_ap.margin_left = tf_ap.margin_top = tf_ap.margin_right = tf_ap.margin_bottom = 0
    for i, (t, d) in enumerate(apres_points):
        p = tf_ap.paragraphs[0] if i==0 else tf_ap.add_paragraph()
        p.space_before = Pt(8) if i>0 else Pt(0)
        p.text = f"✓  {t} : {d}"
        p.font.name = FONT_BODY
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_BODY

    add_footer(s10, 10)

    # ==========================================
    # SLIDE 11 : OBJECTIFS DU PROJET
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11, prs, LIGHT_BG)
    add_header(s11, "Feuille de Route", "Objectifs Général et Spécifiques du Projet",
               "Une vision claire pour transformer le fonctionnement opérationnel de l'entreprise")

    # Hero Goal Card
    add_card(s11, Inches(0.8), Inches(1.85), Inches(11.73), Inches(1.6), top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s11, Inches(1.1), Inches(2.05), Inches(2.2), Inches(0.32), "OBJECTIF GÉNÉRAL", bg_color=LIME_LIGHT_BG, txt_color=LOGO_BRAND_GREEN)
    tb_og = s11.shapes.add_textbox(Inches(1.1), Inches(2.45), Inches(11.13), Inches(0.85))
    tf_og = tb_og.text_frame
    tf_og.word_wrap = True
    tf_og.margin_left = tf_og.margin_top = tf_og.margin_right = tf_og.margin_bottom = 0
    p_og = tf_og.paragraphs[0]
    p_og.text = "Concevoir et développer une solution logicielle unifiée comprenant une plateforme web de gestion globale des services et une application mobile dédiée à la réservation de véhicules, toutes deux synchronisées en temps réel via une API REST sécurisée."
    p_og.font.name = FONT_HEADING
    p_og.font.size = Pt(13.5)
    p_og.font.bold = True
    p_og.font.color.rgb = TEXT_DARK

    # 3 Specific Goals
    spec_goals = [
        ("AUTOMATISATION COMMERCIALE", "Génération Instantanée des Devis",
         "Remplacer les chiffrages manuels par un moteur de calcul tarifaire automatisé générant des devis pro-forma officiels PDF sur 2 pages avec en-têtes fiscaux."),
        ("MOBILITÉ USAGER", "Réservation Automobile Mobile",
         "Offrir aux clients une application mobile native sous React Native / Expo pour réserver un véhicule en quelques clics avec suivi en temps réel."),
        ("PILOTAGE STRATÉGIQUE", "Back-Office d'Administration Central",
         "Fournir à la direction générale une tour de contrôle pour piloter la flotte, les stocks de négoce, les devis et les statistiques de chiffre d'affaires.")
    ]
    w_sg = Inches(3.75)
    h_sg = Inches(2.9)
    for idx, (tag, title, desc) in enumerate(spec_goals):
        cx = Inches(0.8 + idx * 3.99)
        cy = Inches(3.65)
        add_card(s11, cx, cy, w_sg, h_sg, top_accent_color=LOGO_LEAF_LIME)
        add_badge(s11, cx + Inches(0.25), cy + Inches(0.2), Inches(2.8), Inches(0.32), tag)
        
        tb = s11.shapes.add_textbox(cx + Inches(0.25), cy + Inches(0.65), w_sg - Inches(0.5), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(12.5)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK
        
        pd = tf.add_paragraph()
        pd.space_before = Pt(6)
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = TEXT_BODY

    add_footer(s11, 11)

    # ==========================================
    # SLIDE 12 : EXIGENCES FONCTIONNELLES CLIENT
    # ==========================================
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12, prs, LIGHT_BG)
    add_header(s12, "Cahier des Charges", "Exigences Fonctionnelles • Espace Client & Visiteur",
               "Les fonctionnalités interactives conçues pour fluidifier le parcours usager")

    req_client = [
        ("01", "AUTHENTIFICATION & PROFIL", "Espace Utilisateur Sécurisé",
         "Création de compte, connexion avec jeton JWT chiffré, consultation de l'historique des devis et des réservations validées."),
        ("02", "CATALOGUE INTERACTIF", "Consultation Multisectorielle",
         "Exploration dynamique des 6 pôles, recherche avec filtres de prix et de catégories pour les produits de négoce."),
        ("03", "RÉSERVATION FLOTTE", "Réservation Automobile en Ligne",
         "Choix précis des dates de prise en charge et restitution, option avec chauffeur, calcul dynamique du tarif et vérification de disponibilité."),
        ("04", "PANIER & DEVIS PDF", "Génération Pro-Forma Instantanée",
         "Regroupement simultané de plusieurs articles et véhicules, calcul des montants HT/TTC et téléchargement direct du devis officiel PDF.")
    ]
    w_rc = Inches(5.72)
    h_rc = Inches(2.25)
    coords_rc = [
        (Inches(0.8), Inches(1.85)),
        (Inches(6.8), Inches(1.85)),
        (Inches(0.8), Inches(4.35)),
        (Inches(6.8), Inches(4.35))
    ]
    for idx, (num, tag, title, desc) in enumerate(req_client):
        cx, cy = coords_rc[idx]
        add_card(s12, cx, cy, w_rc, h_rc, top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s12, cx + Inches(0.25), cy + Inches(0.2), Inches(0.55), Inches(0.3), num)
        
        tb = s12.shapes.add_textbox(cx + Inches(0.95), cy + Inches(0.2), w_rc - Inches(1.2), h_rc - Inches(0.35))
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

    add_footer(s12, 12)

    # ==========================================
    # SLIDE 13 : EXIGENCES FONCTIONNELLES ADMIN
    # ==========================================
    s13 = prs.slides.add_slide(blank_layout)
    set_slide_background(s13, prs, LIGHT_BG)
    add_header(s13, "Cahier des Charges", "Exigences Fonctionnelles • Back-Office Administrateur",
               "La tour de contrôle permettant aux équipes commerciales et de direction de piloter les opérations")

    req_admin = [
        ("01", "GESTION DU PARC", "Administration de la Flotte",
         "Ajout de véhicules avec caractéristiques techniques, mise à jour des tarifs journaliers, désactivation ou mise en maintenance."),
        ("02", "CATALOGUE & STOCKS", "Gestion des Produits Négoce",
         "Création et modification des fiches produits, gestion des prix unitaires, des seuils de stock et affectation par pôle d'activité."),
        ("03", "SUIVI DES DOSSIERS", "Validation des Devis & Commandes",
         "Visualisation en temps réel des demandes émises, validation ou modification des statuts (En attente, Confirmé, Clôturé)."),
        ("04", "SUPERVISION & KPIS", "Tableau de Bord Décisionnel",
         "Statistiques consolidées sur le volume de demandes, taux d'occupation des véhicules, chiffre d'affaires prévisionnel et alertes instantanées.")
    ]
    for idx, (num, tag, title, desc) in enumerate(req_admin):
        cx, cy = coords_rc[idx]
        add_card(s13, cx, cy, w_rc, h_rc, top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s13, cx + Inches(0.25), cy + Inches(0.2), Inches(0.55), Inches(0.3), num, bg_color=LIME_LIGHT_BG, txt_color=LOGO_BRAND_GREEN)
        
        tb = s13.shapes.add_textbox(cx + Inches(0.95), cy + Inches(0.2), w_rc - Inches(1.2), h_rc - Inches(0.35))
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

    add_footer(s13, 13)

    # ==========================================
    # SLIDE 14 : EXIGENCES NON-FONCTIONNELLES
    # ==========================================
    s14 = prs.slides.add_slide(blank_layout)
    set_slide_background(s14, prs, LIGHT_BG)
    add_header(s14, "Spécifications Techniques", "Exigences Non-Fonctionnelles & Sécurité",
               "Garantir un haut niveau de robustesse, d'intégrité des données et de fluidité opérationnelle")

    req_nf = [
        ("SÉCURITÉ APPLICATIVE", "Chiffrement & Contrôle d'Accès",
         "Mots de passe hachés via l'algorithme bcrypt avec salage. Authentification par jetons JWT signés et protection des routes d'administration par rôles."),
        ("PERFORMANCE & SCALABILITÉ", "Temps de Réponse Optimisés",
         "Rendu asynchrone non-bloquant sous Node.js, virtual DOM React pour des mises à jour immédiates et requêtes SQL indexées."),
        ("ERGONOMIE MULTI-ÉCRAN", "Responsive Design Intégral",
         "Interfaces adaptatives pour ordinateurs, tablettes et smartphones, garantissant une lisibilité parfaite quelle que soit la résolution."),
        ("DISPONIBILITÉ & RÉSILIENCE", "Infrastructure Cloud Fiable",
         "Déploiement sur serveur infogéré Hostinger avec certificats SSL/TLS, sauvegardes automatisées et isolation des environnements.")
    ]
    for idx, (tag, title, desc) in enumerate(req_nf):
        cx, cy = coords_rc[idx]
        add_card(s14, cx, cy, w_rc, h_rc, top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s14, cx + Inches(0.25), cy + Inches(0.2), Inches(2.6), Inches(0.3), tag)
        
        tb = s14.shapes.add_textbox(cx + Inches(0.25), cy + Inches(0.65), w_rc - Inches(0.5), h_rc - Inches(0.8))
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
        pd.space_before = Pt(4)
        pd.text = desc
        pd.font.name = FONT_BODY
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = TEXT_BODY

    add_footer(s14, 14)

    # ==========================================
    # SLIDE 15 : PLANNING PRÉVISIONNEL & GANTT (FIGURE 1)
    # ==========================================
    s15 = prs.slides.add_slide(blank_layout)
    set_slide_background(s15, prs, LIGHT_BG)
    add_header(s15, "Gestion de Projet", "Planning Prévisionnel et Chronogramme des Tâches",
               "Découpage rigoureux des 7 phases du projet durant les 2 mois de stage d'application")

    # Table of 7 tasks on Left (Tableau 2 du rapport)
    t_left = Inches(0.8)
    t_top = Inches(1.85)
    t_w = Inches(5.8)
    t_h = Inches(4.7)

    tasks = [
        ("N°", "Désignation de la tâche", "Début", "Durée", "Fin"),
        ("1", "Prise de contact & immersion", "03/08/2026", "5 j", "07/08/2026"),
        ("2", "Étude de l'existant & rédaction CDC", "08/08/2026", "4 j", "11/08/2026"),
        ("3", "Modélisation PU/UML & base de données", "12/08/2026", "6 j", "17/08/2026"),
        ("4", "Dév. API Backend Node.js / MySQL", "18/08/2026", "10 j", "27/08/2026"),
        ("5", "Dév. Plateforme Web React.js & CSS", "28/08/2026", "12 j", "08/09/2026"),
        ("6", "Dév. App Mobile React Native / Expo", "09/09/2026", "12 j", "20/09/2026"),
        ("7", "Tests d'intégration & corrections", "21/09/2026", "6 j", "26/09/2026")
    ]

    table_shape = s15.shapes.add_table(len(tasks), 5, t_left, t_top, t_w, t_h)
    table = table_shape.table
    table.columns[0].width = Inches(0.45)
    table.columns[1].width = Inches(2.9)
    table.columns[2].width = Inches(0.85)
    table.columns[3].width = Inches(0.7)
    table.columns[4].width = Inches(0.9)

    for r_idx, row in enumerate(tasks):
        for c_idx, val in enumerate(row):
            cell = table.cell(r_idx, c_idx)
            cell.text = val
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            cell.fill.solid()
            if r_idx == 0:
                cell.fill.fore_color.rgb = TABLE_HEADER_BG
            elif r_idx % 2 == 1:
                cell.fill.fore_color.rgb = CARD_BG
            else:
                cell.fill.fore_color.rgb = ROW_ALT_BG
            
            p = cell.text_frame.paragraphs[0]
            p.font.name = FONT_HEADING if r_idx==0 else FONT_BODY
            p.font.size = Pt(8.5) if r_idx > 0 else Pt(9)
            p.font.bold = (r_idx == 0) or (c_idx == 0)
            p.font.color.rgb = TEXT_WHITE if r_idx==0 else (LOGO_BRAND_GREEN if c_idx==0 else TEXT_DARK)
            if c_idx in [0, 2, 3, 4]:
                p.alignment = PP_ALIGN.CENTER

    # Right: High-Res Gantt Image (Figure 1)
    gantt_path = "diagrammes/gantt/diagramme-gantt.png"
    if not os.path.exists(gantt_path):
        gantt_path = "extracted_pptx_images/slide_15_img_7_image.png"

    add_card(s15, Inches(6.8), Inches(1.85), Inches(5.73), Inches(4.7), top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s15, Inches(7.05), Inches(2.05), Inches(2.8), Inches(0.32), "FIGURE 1 : DIAGRAMME DE GANTT")
    place_image_in_box(s15, gantt_path, Inches(7.0), Inches(2.5), Inches(5.33), Inches(3.8))

    add_footer(s15, 15)
    print("Part 1 (Slides 1 to 15) updated with Soutarah Green theme.")
