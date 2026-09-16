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
    TEXT_WHITE, FONT_HEADING, FONT_BODY, LOGO_PATH
)

def build_slides_46_to_60(prs):
    blank_layout = prs.slide_layouts[6]

    # =========================================================================
    # SLIDE 46 : SECTION 6 - INTERFACES WEB 3 : RÉSERVATION & PANIER (FIGURES 23 & 24)
    # =========================================================================
    s46 = prs.slides.add_slide(blank_layout)
    set_slide_background(s46, prs, LIGHT_BG)
    add_header(s46, "6. RÉALISATION • INTERFACES WEB (3/4)",
               "Module de Réservation & Panier Multi-Articles (Figures 23 & 24)",
               "Calcul automatisé des tarifs journaliers et centralisation hybride des commandes")

    img_res = "extracted_docx_images/image23.png"
    add_card(s46, Inches(0.8), Inches(1.85), Inches(5.7), Inches(3.3), bg_color=CARD_BG, border_color=CARD_BORDER)
    place_image_in_box(s46, img_res, Inches(0.9), Inches(1.95), Inches(5.5), Inches(3.1))

    img_pan = "extracted_docx_images/image24.png"
    add_card(s46, Inches(6.8), Inches(1.85), Inches(5.7), Inches(3.3), bg_color=CARD_BG, border_color=CARD_BORDER)
    place_image_in_box(s46, img_pan, Inches(6.9), Inches(1.95), Inches(5.5), Inches(3.1))

    add_card(s46, Inches(0.8), Inches(5.3), Inches(5.7), Inches(1.5), bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
    tb_r1 = s46.shapes.add_textbox(Inches(1.0), Inches(5.4), Inches(5.3), Inches(1.3))
    tf_r1 = tb_r1.text_frame
    tf_r1.word_wrap = True
    pr1 = tf_r1.paragraphs[0]
    pr1.text = "Figure 23 : Module Réservation Véhicule"
    pr1.font.name = FONT_HEADING
    pr1.font.size = Pt(11.5)
    pr1.font.bold = True
    pr1.font.color.rgb = TEXT_DARK
    pr1b = tf_r1.add_paragraph()
    pr1b.text = "Sélecteur de dates dynamique, vérification anti-collision instantanée, options chauffeur et destination avec recalcul en direct."
    pr1b.font.name = FONT_BODY
    pr1b.font.size = Pt(9.5)
    pr1b.font.color.rgb = TEXT_BODY

    add_card(s46, Inches(6.8), Inches(5.3), Inches(5.7), Inches(1.5), bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
    tb_r2 = s46.shapes.add_textbox(Inches(7.0), Inches(5.4), Inches(5.3), Inches(1.3))
    tf_r2 = tb_r2.text_frame
    tf_r2.word_wrap = True
    pr2 = tf_r2.paragraphs[0]
    pr2.text = "Figure 24 : Panier Multi-Articles & Devis PDF"
    pr2.font.name = FONT_HEADING
    pr2.font.size = Pt(11.5)
    pr2.font.bold = True
    pr2.font.color.rgb = TEXT_DARK
    pr2b = tf_r2.add_paragraph()
    pr2b.text = "Agrégation hybride des locations de voitures et produits de négoce, ventilation des taxes (HT, TVA, TDT) et téléchargement immédiat du PDF."
    pr2b.font.name = FONT_BODY
    pr2b.font.size = Pt(9.5)
    pr2b.font.color.rgb = TEXT_BODY

    add_footer(s46, 46)

    # =========================================================================
    # SLIDE 47 : SECTION 6 - INTERFACES WEB 4 : ESPACE CLIENT (FIGURE 25)
    # =========================================================================
    s47 = prs.slides.add_slide(blank_layout)
    set_slide_background(s47, prs, LIGHT_BG)
    add_header(s47, "6. RÉALISATION • INTERFACES WEB (4/4)",
               "Espace Personnel Client & Historique des Devis (Figure 25)",
               "Tableau de bord utilisateur dédié au suivi en direct des demandes et commandes")

    img_client = "extracted_docx_images/image25.png"
    add_card(s47, Inches(0.8), Inches(1.85), Inches(8.0), Inches(4.9), bg_color=CARD_BG, border_color=CARD_BORDER)
    place_image_in_box(s47, img_client, Inches(1.0), Inches(2.05), Inches(7.6), Inches(4.5))

    add_card(s47, Inches(9.0), Inches(1.85), Inches(3.53), Inches(4.9), bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s47, Inches(9.25), Inches(2.1), Inches(2.8), Inches(0.32), "EXPÉRIENCE CLIENT")

    tb_ec = s47.shapes.add_textbox(Inches(9.25), Inches(2.6), Inches(3.03), Inches(4.0))
    tf_ec = tb_ec.text_frame
    tf_ec.word_wrap = True
    pec = tf_ec.paragraphs[0]
    pec.text = "Fonctionnalités Clés"
    pec.font.name = FONT_HEADING
    pec.font.size = Pt(13)
    pec.font.bold = True
    pec.font.color.rgb = TEXT_DARK

    pecb = tf_ec.add_paragraph()
    pecb.text = "• Vue consolidée de toutes les demandes de devis et réservations de véhicules émises.\n\n" \
                "• Suivi visuel des statuts en direct par pastilles de couleurs (En attente, Lu, Validé, Clôturé).\n\n" \
                "• Bouton de téléchargement instantané du devis pro-forma officiel PDF 2 pages.\n\n" \
                "• Accès immédiat au paiement en ligne et gestion simplifiée des informations de profil."
    pecb.font.name = FONT_BODY
    pecb.font.size = Pt(10)
    pecb.font.color.rgb = TEXT_BODY
    pecb.space_before = Pt(8)

    add_footer(s47, 47)

    # =========================================================================
    # SLIDE 48 : SECTION 6 - INTERFACES MOBILE 1 : ACCUEIL & FICHE VÉHICULE (FIGURE 26)
    # =========================================================================
    s48 = prs.slides.add_slide(blank_layout)
    set_slide_background(s48, prs, LIGHT_BG)
    add_header(s48, "6. RÉALISATION • APPLICATION MOBILE (1/2)",
               "Accueil du Parc Automobile & Fiche Véhicule (Figure 26)",
               "Expérience mobile native sous React Native & Expo dédiée à la flotte des 21 véhicules")

    img_mob1 = "extracted_docx_images/image26.jpeg"
    add_card(s48, Inches(0.8), Inches(1.85), Inches(4.5), Inches(4.9), bg_color=CARD_BG, border_color=CARD_BORDER)
    place_image_in_box(s48, img_mob1, Inches(1.0), Inches(2.05), Inches(4.1), Inches(4.5))

    add_card(s48, Inches(5.6), Inches(1.85), Inches(6.93), Inches(4.9), bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s48, Inches(5.9), Inches(2.1), Inches(3.2), Inches(0.32), "ERGONOMIE TACTILE MOBILE")

    tb_mb1 = s48.shapes.add_textbox(Inches(5.9), Inches(2.6), Inches(6.33), Inches(4.0))
    tf_mb1 = tb_mb1.text_frame
    tf_mb1.word_wrap = True
    pmb1 = tf_mb1.paragraphs[0]
    pmb1.text = "Atouts de l'Interface Mobile"
    pmb1.font.name = FONT_HEADING
    pmb1.font.size = Pt(14)
    pmb1.font.bold = True
    pmb1.font.color.rgb = TEXT_DARK

    pmb1b = tf_mb1.add_paragraph()
    pmb1b.text = "• Parcours 100% Mobilité : consultation fluide du parc complet des 21 véhicules répartis par catégories (SUV luxueux, Berlines d'affaires, Utilitaires de transport, Pick-up 4x4).\n\n" \
                 "• Fiche Technique Immersive : galerie de photographies haute définition, statut en temps réel (Disponible / En course / En maintenance) et tarifs journaliers transparents.\n\n" \
                 "• Sélecteur de Calendrier Natif : saisie tactile intuitive des dates de début et restitution avec contrôle instantané de la disponibilité.\n\n" \
                 "• Personnalisation Immédiate : sélection en un clic de l'option chauffeur dédié et de la zone de déplacement (Abidjan ou Intérieur du pays)."
    pmb1b.font.name = FONT_BODY
    pmb1b.font.size = Pt(11)
    pmb1b.font.color.rgb = TEXT_BODY
    pmb1b.space_before = Pt(10)

    add_footer(s48, 48)

    # =========================================================================
    # SLIDE 49 : SECTION 6 - INTERFACES MOBILE 2 : PANIER & DEVIS (FIGURES 27 & 28)
    # =========================================================================
    s49 = prs.slides.add_slide(blank_layout)
    set_slide_background(s49, prs, LIGHT_BG)
    add_header(s49, "6. RÉALISATION • APPLICATION MOBILE (2/2)",
               "Panier de Réservation & Devis Officiel PDF (Figures 27 & 28)",
               "Validation de la réservation en mobilité et consultation autonome du devis PDF")

    # Images Mobile 2 (Figures 27 & 28)
    img_mob2 = "extracted_docx_images/image27.jpeg"
    add_card(s49, Inches(0.8), Inches(1.85), Inches(3.3), Inches(4.9), bg_color=CARD_BG, border_color=CARD_BORDER)
    place_image_in_box(s49, img_mob2, Inches(0.95), Inches(2.0), Inches(3.0), Inches(4.6))

    img_mob3 = "extracted_docx_images/image28.jpeg"
    add_card(s49, Inches(4.4), Inches(1.85), Inches(3.3), Inches(4.9), bg_color=CARD_BG, border_color=CARD_BORDER)
    place_image_in_box(s49, img_mob3, Inches(4.55), Inches(2.0), Inches(3.0), Inches(4.6))

    # Carte analyse droite
    add_card(s49, Inches(8.0), Inches(1.85), Inches(4.53), Inches(4.9), bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s49, Inches(8.25), Inches(2.1), Inches(3.0), Inches(0.32), "VALIDATION & VISUALISATION")

    tb_mv = s49.shapes.add_textbox(Inches(8.25), Inches(2.6), Inches(4.03), Inches(4.0))
    tf_mv = tb_mv.text_frame
    tf_mv.word_wrap = True
    pmv = tf_mv.paragraphs[0]
    pmv.text = "Flux Mobile Finalisé"
    pmv.font.name = FONT_HEADING
    pmv.font.size = Pt(13)
    pmv.font.bold = True
    pmv.font.color.rgb = TEXT_DARK

    pmvb = tf_mv.add_paragraph()
    pmvb.text = "• Figure 27 : Panier Mobile\n" \
                "  - Synthèse du véhicule choisi, des dates exactes et du forfait chauffeur.\n" \
                "  - Calcul automatique et affichage clair du montant total.\n" \
                "  - Validation instantanée en un clic connectée à l'API REST.\n\n" \
                "• Figure 28 : Consultation Devis PDF\n" \
                "  - Intégration de la visionneuse PDF native sur mobile.\n" \
                "  - Partage direct via WhatsApp, e-mail ou impression sans quitter l'application mobile."
    pmvb.font.name = FONT_BODY
    pmvb.font.size = Pt(10)
    pmvb.font.color.rgb = TEXT_BODY
    pmvb.space_before = Pt(8)

    add_footer(s49, 49)

    # =========================================================================
    # SLIDE 50 : SECTION 6 - BACK-OFFICE ADMIN 1 : TABLEAU DE BORD (FIGURE 29)
    # =========================================================================
    s50 = prs.slides.add_slide(blank_layout)
    set_slide_background(s50, prs, LIGHT_BG)
    add_header(s50, "6. RÉALISATION • BACK-OFFICE ADMIN (1/2)",
               "Tableau de Bord Consolidé & Indicateurs Clés (Figure 29)",
               "Tour de contrôle managériale offrant une visibilité en temps réel sur l'activité")

    img_dash = "extracted_docx_images/image29.png"
    add_card(s50, Inches(0.8), Inches(1.85), Inches(8.0), Inches(4.9), bg_color=CARD_BG, border_color=CARD_BORDER)
    place_image_in_box(s50, img_dash, Inches(1.0), Inches(2.05), Inches(7.6), Inches(4.5))

    add_card(s50, Inches(9.0), Inches(1.85), Inches(3.53), Inches(4.9), bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s50, Inches(9.25), Inches(2.1), Inches(2.8), Inches(0.32), "PILOTAGE STRATÉGIQUE")

    tb_da = s50.shapes.add_textbox(Inches(9.25), Inches(2.6), Inches(3.03), Inches(4.0))
    tf_da = tb_da.text_frame
    tf_da.word_wrap = True
    pda = tf_da.paragraphs[0]
    pda.text = "Métriques Clés & KPIs"
    pda.font.name = FONT_HEADING
    pda.font.size = Pt(13)
    pda.font.bold = True
    pda.font.color.rgb = TEXT_DARK

    pdab = tf_da.add_paragraph()
    pdab.text = "• Indicateurs en direct : Chiffre d'affaires estimé, total des devis émis, volume de réservations en cours et nouveaux clients inscrits.\n\n" \
                "• Alertes d'activité : flux visuel signalant les devis non lus nécessitant une préparation immédiate.\n\n" \
                "• Raccourcis d'actions rapides : ajout d'un véhicule, importation catalogue et export comptable.\n\n" \
                "• Sécurité renforcée : accès strictement réservé aux comptes porteurs du rôle 'ADMIN'."
    pdab.font.name = FONT_BODY
    pdab.font.size = Pt(10)
    pdab.font.color.rgb = TEXT_BODY
    pdab.space_before = Pt(8)

    add_footer(s50, 50)

    # =========================================================================
    # SLIDE 51 : SECTION 6 - BACK-OFFICE ADMIN 2 : GESTION PARC & DEVIS (FIGURE 30)
    # =========================================================================
    s51 = prs.slides.add_slide(blank_layout)
    set_slide_background(s51, prs, LIGHT_BG)
    add_header(s51, "6. RÉALISATION • BACK-OFFICE ADMIN (2/2)",
               "Gestion de la Flotte de Véhicules & Traitement des Devis (Figure 30)",
               "Administration opérationnelle du parc des 21 véhicules et ordonnancement commercial")

    img_flotte = "extracted_docx_images/image30.png"
    add_card(s51, Inches(0.8), Inches(1.85), Inches(8.0), Inches(4.9), bg_color=CARD_BG, border_color=CARD_BORDER)
    place_image_in_box(s51, img_flotte, Inches(1.0), Inches(2.05), Inches(7.6), Inches(4.5))

    add_card(s51, Inches(9.0), Inches(1.85), Inches(3.53), Inches(4.9), bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
    add_badge(s51, Inches(9.25), Inches(2.1), Inches(2.8), Inches(0.32), "GESTION OPÉRATIONNELLE")

    tb_fl = s51.shapes.add_textbox(Inches(9.25), Inches(2.6), Inches(3.03), Inches(4.0))
    tf_fl = tb_fl.text_frame
    tf_fl.word_wrap = True
    pfl = tf_fl.paragraphs[0]
    pfl.text = "Fonctionnalités Métier"
    pfl.font.name = FONT_HEADING
    pfl.font.size = Pt(13)
    pfl.font.bold = True
    pfl.font.color.rgb = TEXT_DARK

    pflb = tf_fl.add_paragraph()
    pflb.text = "• Gestion de la flotte : ajout de fiches véhicules, modification des caractéristiques, prix journaliers et statut (Disponible / Loué / Maintenance).\n\n" \
                "• Calendrier d'occupation global : vision panoramique des plannings de sortie de la flotte.\n\n" \
                "• Traitement simplifié des devis : bouton « Marquer comme lu » pour enclencher la logistique sans blocage de flux.\n\n" \
                "• Historique exhaustif des réservations avec fiches clients rattachées."
    pflb.font.name = FONT_BODY
    pflb.font.size = Pt(10)
    pflb.font.color.rgb = TEXT_BODY
    pflb.space_before = Pt(8)

    add_footer(s51, 51)

    # =========================================================================
    # SLIDE 52 : INTERCALAIRE SECTION 7 : TESTS ET PERSPECTIVES
    # =========================================================================
    create_section_divider(prs, 52, 7, "TESTS ET PERSPECTIVES",
                           "Campagne de recettes fonctionnelles, résultats obtenus, retour sur investissement économique, limites rencontrées et axes d'évolution futurs.")

    # =========================================================================
    # SLIDE 53 : SECTION 7 - CAHIER DE RECETTES & TESTS RÉALISÉS (TABLEAU 12)
    # =========================================================================
    s53 = prs.slides.add_slide(blank_layout)
    set_slide_background(s53, prs, LIGHT_BG)
    add_header(s53, "7. TESTS ET PERSPECTIVES • CAHIER DE RECETTES",
               "Cahier de Recettes & Tests Fonctionnels Validés (Tableau 12)",
               "Validation exhaustive des fonctionnalités critiques sur les environnements Web et Mobile")

    headers_tests = ["Module testé", "Scénario de test exécuté", "Résultat attendu", "Statut"]
    rows_tests = [
        ["Authentification", "Connexion utilisateur avec email et mot de passe valide", "Attribution du token JWT et ouverture de session sécurisée", "CONFORME"],
        ["Sécurité API", "Tentative d'accès à une route d'administration sans privilège", "Blocage de la requête avec réponse HTTP 403 Forbidden", "CONFORME"],
        ["Catalogue Web", "Navigation et filtrage des produits multi-pôles par catégorie", "Affichage instantané des articles correspondants sans latence", "CONFORME"],
        ["Réservation Mobile", "Sélection d'un véhicule et choix des dates de location", "Calcul dynamique exact du tarif (durée x prix + option chauffeur)", "CONFORME"],
        ["Contrôle Disponibilité", "Tentative de réservation sur une période déjà attribuée", "Alerte de conflit de dates et blocage immédiat de la soumission", "CONFORME"],
        ["Génération Devis PDF", "Validation du panier et téléchargement du document PDF", "Génération automatique d'un PDF 2 pages conforme aux normes", "CONFORME"],
        ["Synchronisation DB", "Validation d'une commande mobile et vérification dans Back-Office", "Apparition immédiate de la commande dans la liste admin", "CONFORME"],
        ["Notifications E-mail", "Transmission d'une nouvelle demande de devis client", "Réception automatique d'un courriel d'alerte via Brevo", "CONFORME"]
    ]
    col_w_t = [Inches(2.2), Inches(4.3), Inches(3.73), Inches(1.5)]
    create_table(s53, Inches(0.8), Inches(1.85), Inches(11.73), Inches(4.8), headers_tests, rows_tests, col_w_t)

    add_footer(s53, 53)

    # =========================================================================
    # SLIDE 54 : SECTION 7 - RÉSULTATS OBTENUS
    # =========================================================================
    s54 = prs.slides.add_slide(blank_layout)
    set_slide_background(s54, prs, LIGHT_BG)
    add_header(s54, "7. TESTS ET PERSPECTIVES • RÉSULTATS",
               "Résultats Obtenus : Performance & Fiabilité Opérationnelle",
               "Des gains quantitatifs et qualitatifs majeurs pour SOUTARAH GROUP")

    res_cards = [
        ("ZÉRO CONFLIT", "100% de Fiabilité Réservations",
         "• Éradication totale des risques de double réservation grâce au contrôle algorithmique SQL anti-collision.\n• Visibilité en temps réel de l'état d'occupation de la flotte des 21 véhicules.\n• Renforcement immédiat de la confiance des clients professionnels et partenaires."),
        ("RÉACTIVITÉ RECORD", "Réduction de 80% du Délai Commercial",
         "• Le temps moyen de traitement d'un dossier client passe de 45 minutes à moins de 3 minutes.\n• Génération instantanée et autonome du devis pro-forma officiel PDF 2 pages par le client.\n• Notifications par courriel en moins de 5 secondes via l'API Brevo."),
        ("SYNCHRONISATION TOTALE", "Continuité Parfaite Web & Mobile",
         "• Base de données unique hébergée sur Hostinger alimentant instantanément les deux canaux.\n• Toute action initiée sur l'application mobile est immédiatement répercutée sur le back-office web.\n• Intégrité transactionnelle absolue et sécurité par jetons JWT.")
    ]

    for i, (b_t, title, body) in enumerate(res_cards):
        left = Inches(0.8) + i * Inches(3.95)
        top = Inches(1.85)
        width = Inches(3.8)
        height = Inches(4.9)
        add_card(s54, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s54, left + Inches(0.25), top + Inches(0.25), Inches(3.2), Inches(0.32), b_t)

        tb = s54.shapes.add_textbox(left + Inches(0.25), top + Inches(0.75), Inches(3.3), Inches(3.9))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(13.5)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK

        pb = tf.add_paragraph()
        pb.text = body
        pb.font.name = FONT_BODY
        pb.font.size = Pt(10.5)
        pb.font.color.rgb = TEXT_BODY
        pb.space_before = Pt(10)

    add_footer(s54, 54)

    # =========================================================================
    # SLIDE 55 : SECTION 7 - ÉTUDE FINANCIÈRE & RETOUR SUR INVESTISSEMENT (ROI)
    # =========================================================================
    s55 = prs.slides.add_slide(blank_layout)
    set_slide_background(s55, prs, LIGHT_BG)
    add_header(s55, "7. TESTS ET PERSPECTIVES • ANALYSE FINANCIÈRE",
               "Bilan Financier Estimatif & Retour sur Investissement (ROI)",
               "Coûts maîtrisés grâce aux technologies Open Source et rentabilité dès le premier trimestre")

    headers_fin = ["Poste de dépense", "Description technique", "Coût annuel estimé (FCFA)"]
    rows_fin = [
        ["Nom de domaine & SSL", "Nom de domaine international (.com) + Certificat SSL Let's Encrypt", "35 000 FCFA"],
        ["Comptes Développeurs Mobiles", "Google Play Store (paiement unique 25$) + Apple Developer (abonnement annuel)", "75 000 FCFA"],
        ["Maintenance Préventive & Cloud", "Sauvegardes automatisées, mises à jour de sécurité et monitoring serveur", "180 000 FCFA"],
        ["TOTAL ESTIMATIF ANNUEL", "Budget global d'infrastructure, exploitation et maintenance récurrente", "290 000 FCFA"]
    ]
    col_w_f = [Inches(3.2), Inches(5.8), Inches(2.73)]
    create_table(s55, Inches(0.8), Inches(1.85), Inches(11.73), Inches(2.8), headers_fin, rows_fin, col_w_f)

    # Carte ROI bas
    add_card(s55, Inches(0.8), Inches(4.9), Inches(11.73), Inches(1.85), bg_color=DARK_CARD_BG, border_color=LOGO_BRAND_GREEN)
    add_badge(s55, Inches(1.05), Inches(5.1), Inches(3.2), Inches(0.32), "ANALYSE DU RETOUR SUR INVESTISSEMENT", bg_color=LOGO_DARK_GREEN, txt_color=LOGO_LEAF_LIME)

    tb_roi = s55.shapes.add_textbox(Inches(1.05), Inches(5.5), Inches(11.1), Inches(1.1))
    tf_roi = tb_roi.text_frame
    tf_roi.word_wrap = True
    proi = tf_roi.paragraphs[0]
    proi.text = "Rentabilité et Amortissement Immédiat"
    proi.font.name = FONT_HEADING
    proi.font.size = Pt(13)
    proi.font.bold = True
    proi.font.color.rgb = TEXT_WHITE

    proib = tf_roi.add_paragraph()
    proib.text = "L'ensemble de la suite logicielle reposant sur des technologies Open Source gratuites (React, Node.js, MySQL, Expo), les coûts de licence sont nuls. Le budget annuel de 290 000 FCFA est amorti dès les deux premières locations de véhicules générées en ligne. Le gain de 80% de temps administratif libère le personnel commercial pour la prospection."
    proib.font.name = FONT_BODY
    proib.font.size = Pt(10.5)
    proib.font.color.rgb = RGBColor(203, 213, 225)
    proib.space_before = Pt(4)

    add_footer(s55, 55)

    # =========================================================================
    # SLIDE 56 : SECTION 7 - DIFFICULTÉS RENCONTRÉES ET LIMITES
    # =========================================================================
    s56 = prs.slides.add_slide(blank_layout)
    set_slide_background(s56, prs, LIGHT_BG)
    add_header(s56, "7. TESTS ET PERSPECTIVES • ANALYSE CRITIQUE",
               "Difficultés Rencontrées & Limites Actuelles du Système",
               "Obstacles techniques surmontés lors du déploiement et contraintes résiduelles")

    diffs = [
        ("CONTRAINTE D'HÉBERGEMENT", "Gestion de l'Environnement Hostinger",
         "• Découverte de l'incompatibilité de l'offre Hostinger souscrite avec PostgreSQL, nécessitant une réadaptation agile vers MySQL.\n• Configuration manuelle des processus Node.js sous Phusion Passenger et gestion des encodages de caractères."),
        ("ERGONOMIE MOBILE", "Affichage Multi-Terminaux",
         "• Ajustement des styles tactiles sur différentes tailles d'écrans smartphones (Android vs iOS).\n• Gestion fine du cache local pour éviter les décalages de disponibilité lors des pertes temporaires de connexion réseau mobile."),
        ("LIMITES ACTUELLES", "Périmètre Résiduel du Projet",
         "• Paiement en ligne fonctionnel sur le Web mais encore en phase de finalisation pour l'intégration in-app mobile directe.\n• Absence de suivi GPS en direct des véhicules en circulation (nécessite l'installation de balises matérielles IoT).")
    ]

    for i, (b_t, title, body) in enumerate(diffs):
        left = Inches(0.8) + i * Inches(3.95)
        top = Inches(1.85)
        width = Inches(3.8)
        height = Inches(4.9)
        add_card(s56, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s56, left + Inches(0.25), top + Inches(0.25), Inches(3.2), Inches(0.32), b_t)

        tb = s56.shapes.add_textbox(left + Inches(0.25), top + Inches(0.75), Inches(3.3), Inches(3.9))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(13.5)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK

        pb = tf.add_paragraph()
        pb.text = body
        pb.font.name = FONT_BODY
        pb.font.size = Pt(10.5)
        pb.font.color.rgb = TEXT_BODY
        pb.space_before = Pt(10)

    add_footer(s56, 56)

    # =========================================================================
    # SLIDE 57 : SECTION 7 - PERSPECTIVES D'AMÉLIORATION
    # =========================================================================
    s57 = prs.slides.add_slide(blank_layout)
    set_slide_background(s57, prs, LIGHT_BG)
    add_header(s57, "7. TESTS ET PERSPECTIVES • ÉVOLUTIONS FUTURES",
               "Perspectives d’Amélioration & Roadmap Technique",
               "Axes stratégiques d'évolution pour pérenniser et étendre l'écosystème SOUTARAH")

    persp = [
        ("MONÉTIQUE MOBILE", "Paiement Direct In-App",
         "• Intégration native des SDKs Wave et Orange Money directement au sein de l'application mobile React Native.\n• Autorisation de versement d'acompte (caution) en ligne en un clic pour valider immédiatement le contrat."),
        ("GÉOLOCALISATION IOT", "Suivi GPS en Temps Réel",
         "• Installation de boîtiers télématiques IoT dans les 21 véhicules pour suivi de position géographique.\n• Visualisation sur carte interactive dans le back-office admin avec alertes de sortie de zone ou excès de vitesse."),
        ("IA PRÉDICTIVE", "Maintenance & Recommandation",
         "• Algorithmes d'apprentissage automatique analysant le kilométrage pour planifier les entretiens préventifs.\n• Moteur de recommandation personnalisé suggérant aux clients entreprises les véhicules les plus économiques.")
    ]

    for i, (b_t, title, body) in enumerate(persp):
        left = Inches(0.8) + i * Inches(3.95)
        top = Inches(1.85)
        width = Inches(3.8)
        height = Inches(4.9)
        add_card(s57, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s57, left + Inches(0.25), top + Inches(0.25), Inches(3.2), Inches(0.32), b_t)

        tb = s57.shapes.add_textbox(left + Inches(0.25), top + Inches(0.75), Inches(3.3), Inches(3.9))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(13.5)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK

        pb = tf.add_paragraph()
        pb.text = body
        pb.font.name = FONT_BODY
        pb.font.size = Pt(10.5)
        pb.font.color.rgb = TEXT_BODY
        pb.space_before = Pt(10)

    add_footer(s57, 57)

    # =========================================================================
    # SLIDE 58 : INTERCALAIRE SECTION 8 : CONCLUSION
    # =========================================================================
    create_section_divider(prs, 58, 8, "CONCLUSION",
                           "Bilan général du projet d'ingénierie, synthèse des objectifs atteints, compétences acquises et clôture de la soutenance.")

    # =========================================================================
    # SLIDE 59 : SECTION 8 - CONCLUSION GÉNÉRALE & BILAN DU PROJET
    # =========================================================================
    s59 = prs.slides.add_slide(blank_layout)
    set_slide_background(s59, prs, LIGHT_BG)
    add_header(s59, "8. CONCLUSION • BILAN OPÉRATIONNEL",
               "Conclusion Générale & Bilan de Réalisation du Projet",
               "Transformation réussie des processus métiers de SOUTARAH GROUP par le numérique")

    cards_ccl = [
        ("OBJECTIFS ATTEINTS", "Livraison d'un Système Opérationnel",
         "• Conception intégrale et déploiement effectif de la plateforme Web et de l'application mobile.\n• Centralisation réussie des 6 pôles multisectoriels et gestion dédiée des 21 véhicules.\n• Génération de devis PDF officiels 2 pages et chaîne de notifications Brevo 100% fonctionnelle.\n• Respect scrupuleux du chronogramme prévisionnel de deux mois (août à octobre 2026)."),
        ("VALEUR MÉTIER", "Bénéfices Tangibles pour l'Entreprise",
         "• Éradication des doubles réservations grâce au verrouillage algorithmique des agendas.\n• Gain de productivité de plus de 80% dans le traitement commercial des demandes de devis.\n• Image de marque modernisée, valorisée auprès des grands partenaires (BESSAC, CIM IVOIRE, BNI).\n• Traçabilité complète et indicateurs d'aide à la décision pour la direction générale."),
        ("RIGUEUR D'INGÉNIERIE", "Démarche Méthodologique Exemplaire",
         "• Application rigoureuse du Processus Unifié et de la modélisation UML (PU/UML).\n• Architecture 3-tiers découplée facilitant l'évolutivité et la maintenance corrective future.\n• Respect des normes fiscales ivoiriennes et standards internationaux de sécurité logicielle.")
    ]

    for i, (b_t, title, body) in enumerate(cards_ccl):
        left = Inches(0.8) + i * Inches(3.95)
        top = Inches(1.85)
        width = Inches(3.8)
        height = Inches(4.9)
        add_card(s59, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER, top_accent_color=LOGO_BRAND_GREEN)
        add_badge(s59, left + Inches(0.25), top + Inches(0.25), Inches(3.2), Inches(0.32), b_t)

        tb = s59.shapes.add_textbox(left + Inches(0.25), top + Inches(0.75), Inches(3.3), Inches(3.9))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.name = FONT_HEADING
        pt.font.size = Pt(13.5)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_DARK

        pb = tf.add_paragraph()
        pb.text = body
        pb.font.name = FONT_BODY
        pb.font.size = Pt(10.5)
        pb.font.color.rgb = TEXT_BODY
        pb.space_before = Pt(10)

    add_footer(s59, 59)

    # =========================================================================
    # SLIDE 60 : SECTION 8 - APPORTS PERSONNELS & CLÔTURE (REMERCIEMENTS)
    # =========================================================================
    s60 = prs.slides.add_slide(blank_layout)
    set_slide_background(s60, prs, LOGO_DARK_GREEN)

    # Accent vertical gauche
    accent = s60.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.2), Inches(0.12), Inches(5.1))
    accent.fill.solid()
    accent.fill.fore_color.rgb = LOGO_LEAF_LIME
    accent.line.fill.background()

    if os.path.exists(LOGO_PATH):
        s60.shapes.add_picture(LOGO_PATH, Inches(1.2), Inches(1.2), width=Inches(2.5))

    add_badge(s60, Inches(1.2), Inches(2.15), Inches(4.2), Inches(0.36),
              "8. CONCLUSION • APPORTS & CLÔTURE", bg_color=DARK_CARD_BG, txt_color=LOGO_LEAF_LIME)

    # Carte Gauche : Apports de Stage
    add_card(s60, Inches(1.2), Inches(2.7), Inches(5.8), Inches(4.0), bg_color=DARK_CARD_BG, border_color=LOGO_BRAND_GREEN)
    tb_ap = s60.shapes.add_textbox(Inches(1.45), Inches(2.9), Inches(5.3), Inches(3.6))
    tf_ap = tb_ap.text_frame
    tf_ap.word_wrap = True
    pap = tf_ap.paragraphs[0]
    pap.text = "Apports Académiques & Professionnels"
    pap.font.name = FONT_HEADING
    pap.font.size = Pt(14)
    pap.font.bold = True
    pap.font.color.rgb = LOGO_LEAF_LIME

    pap_b = tf_ap.add_paragraph()
    pap_b.text = "• Consolidation pratique des compétences acquises à l'ESI / INP-HB (Génie Logiciel, UML, Bases de Données relationnelles).\n\n" \
                 "• Maîtrise des technologies industrielles de pointe : React.js, React Native, Node.js, Sequelize ORM et APIs Cloud (Brevo).\n\n" \
                 "• Immersion professionnelle réussie : gestion des délais, prise en compte des contraintes client et rigueur d'exécution en entreprise."
    pap_b.font.name = FONT_BODY
    pap_b.font.size = Pt(11)
    pap_b.font.color.rgb = RGBColor(203, 213, 225)
    pap_b.space_before = Pt(10)

    # Carte Droite : Remerciements & Questions
    add_card(s60, Inches(7.3), Inches(2.7), Inches(5.2), Inches(4.0), bg_color=DARK_CARD_BG, border_color=LOGO_BRAND_GREEN)
    tb_rq = s60.shapes.add_textbox(Inches(7.55), Inches(2.9), Inches(4.7), Inches(3.6))
    tf_rq = tb_rq.text_frame
    tf_rq.word_wrap = True
    prq = tf_rq.paragraphs[0]
    prq.text = "Remerciements & Clôture"
    prq.font.name = FONT_HEADING
    prq.font.size = Pt(14)
    prq.font.bold = True
    prq.font.color.rgb = LOGO_LEAF_LIME

    prq_b = tf_rq.add_paragraph()
    prq_b.text = "Mes sincères remerciements s'adressent :\n" \
                 "• Aux membres honorables du Jury de Soutenance,\n" \
                 "• À la Direction et aux Enseignants de l'ESI / INP-HB,\n" \
                 "• À la Direction Générale et à toute l'équipe de SOUTARAH GROUP pour leur encadrement bienveillant."
    prq_b.font.name = FONT_BODY
    prq_b.font.size = Pt(11)
    prq_b.font.color.rgb = RGBColor(203, 213, 225)
    prq_b.space_before = Pt(8)

    p_merci = tf_rq.add_paragraph()
    p_merci.text = "MERCI POUR VOTRE ATTENTION !\nPlace aux échanges et questions."
    p_merci.font.name = FONT_HEADING
    p_merci.font.size = Pt(13)
    p_merci.font.bold = True
    p_merci.font.color.rgb = TEXT_WHITE
    p_merci.space_before = Pt(16)

    add_footer(s60, 60, is_dark=True)

    print("Slides 46 to 60 successfully built.")
