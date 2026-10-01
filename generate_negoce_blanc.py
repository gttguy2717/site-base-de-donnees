# -*- coding: utf-8 -*-
"""
Générateur PowerPoint Soutarah Négoce Électrique — VERSION FOND BLANC
- Fond blanc propre (sans image de fond sombre)
- Logo Sogelec supprimé
- Charte graphique adaptée fond clair : textes sombres, accents verts & or
"""

import os
import qrcode
from PIL import Image
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# ─── PALETTE — FOND BLANC / PROFESSIONNEL ───────────────────────────────────
# Verts Soutarah officiel
C_GREEN_DARK   = RGBColor(8,  44,  27)    # #082C1B fonds accent sombre
C_GREEN_MAIN   = RGBColor(40, 129, 52)    # #288134 vert signature
C_GREEN_LIME   = RGBColor(120,183, 43)    # #78B72B vert lime vif / kickers
C_GREEN_LIGHT  = RGBColor(236,248,226)    # #ECF8E2 fond badge vert pâle

# Or / ambre pour les highlights chantier
C_GOLD         = RGBColor(202,138,  4)    # #CA8A04 or professionnel
C_AMBER        = RGBColor(217,119,  6)    # #D97706 ambre

# Accents secondaires
C_CYAN         = RGBColor(14, 165,233)    # #0EA5E9 cyan tech
C_RED          = RGBColor(220, 38, 38)    # #DC2626 rouge alerte
C_TEAL         = RGBColor( 13,148,136)    # #0D9488 teal validation

# Fond & typographie
C_BG_WHITE     = RGBColor(255,255,255)    # Blanc pur
C_BG_SOFT      = RGBColor(248,250,252)    # #F8FAFC gris très clair
C_CARD_BG      = RGBColor(255,255,255)    # Carte blanche
C_CARD_BORDER  = RGBColor(226,232,240)    # #E2E8F0 bordure subtile
C_TEXT_DARK    = RGBColor( 15, 23, 42)    # #0F172A quasi-noir ardoise
C_TEXT_BODY    = RGBColor( 51, 65, 85)    # #334155 texte courant
C_TEXT_MUTED   = RGBColor(100,116,139)    # #64748B sous-titres

FONT_T = "Segoe UI"
FONT_B = "Segoe UI"

LOGO_SOUTARAH  = "dist/logo-soutarah.png"
QR_CODE_PATH   = "qrcode_soutarah.png"

# ─── ASSETS ─────────────────────────────────────────────────────────────────
def ensure_assets():
    if not os.path.exists(QR_CODE_PATH):
        qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_M,
                           box_size=10, border=2)
        qr.add_data("https://www.soutarahgroup.com")
        qr.make(fit=True)
        img = qr.make_image(fill_color="#082C1B", back_color="white")
        img.save(QR_CODE_PATH)

# ─── FOND & HABILLAGE ───────────────────────────────────────────────────────
def set_slide_background(slide, prs):
    """Fond blanc pur + barre verte en haut + bordure fine verte en bas."""
    bg = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = C_BG_WHITE
    bg.line.fill.background()

    # Barre verte signature tout en haut
    top_bar = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), prs.slide_width, Inches(0.09))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = C_GREEN_MAIN
    top_bar.line.fill.background()

    # Fine ligne or sous la barre verte
    accent_line = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(0), Inches(0.09), prs.slide_width, Inches(0.03))
    accent_line.fill.solid()
    accent_line.fill.fore_color.rgb = C_GOLD
    accent_line.line.fill.background()

def add_logo(slide):
    """Logo Soutarah en haut à gauche uniquement (Sogelec supprimé)."""
    if os.path.exists(LOGO_SOUTARAH):
        slide.shapes.add_picture(LOGO_SOUTARAH, Inches(0.5), Inches(0.22), width=Inches(1.3))

def add_header(slide, badge_text, title_text, subtitle_text=None, badge_color=None):
    """En-tête : badge coloré + grand titre + sous-titre optionnel."""
    if badge_color is None:
        badge_color = C_GREEN_LIME

    # Badge / Kicker
    bb = slide.shapes.add_textbox(Inches(2.0), Inches(0.25), Inches(10.0), Inches(0.32))
    tf_b = bb.text_frame
    tf_b.margin_left = tf_b.margin_top = tf_b.margin_right = tf_b.margin_bottom = 0
    p_b = tf_b.paragraphs[0]
    r_b = p_b.add_run()
    r_b.text = badge_text.upper()
    r_b.font.name = FONT_B
    r_b.font.size = Pt(10.5)
    r_b.font.bold = True
    r_b.font.color.rgb = badge_color

    # Grand titre
    tb = slide.shapes.add_textbox(Inches(0.55), Inches(0.68), Inches(12.3), Inches(0.62))
    tf_t = tb.text_frame
    tf_t.word_wrap = True
    tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0
    p_t = tf_t.paragraphs[0]
    r_t = p_t.add_run()
    r_t.text = title_text
    r_t.font.name = FONT_T
    r_t.font.size = Pt(22)
    r_t.font.bold = True
    r_t.font.color.rgb = C_TEXT_DARK

    # Sous-titre
    if subtitle_text:
        sb = slide.shapes.add_textbox(Inches(0.55), Inches(1.34), Inches(12.3), Inches(0.38))
        tf_s = sb.text_frame
        tf_s.word_wrap = True
        tf_s.margin_left = tf_s.margin_top = tf_s.margin_right = tf_s.margin_bottom = 0
        p_s = tf_s.paragraphs[0]
        r_s = p_s.add_run()
        r_s.text = subtitle_text
        r_s.font.name = FONT_B
        r_s.font.size = Pt(12)
        r_s.font.italic = True
        r_s.font.color.rgb = C_TEXT_MUTED

def add_footer(slide, slide_num, total=6):
    """Pied de page discret fond blanc."""
    # Ligne séparatrice
    line = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(7.08), Inches(12.333), Inches(0.01))
    line.fill.solid()
    line.fill.fore_color.rgb = C_CARD_BORDER
    line.line.fill.background()

    fb = slide.shapes.add_textbox(Inches(0.55), Inches(7.12), Inches(10.5), Inches(0.28))
    tf = fb.text_frame
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    r1 = p.add_run()
    r1.text = "SOUTARAH GROUP  •  Négoce Électrique 2.0  •  soutarahgroup.com"
    r1.font.name = FONT_B
    r1.font.size = Pt(9.5)
    r1.font.color.rgb = C_TEXT_MUTED

    nb = slide.shapes.add_textbox(Inches(11.3), Inches(7.12), Inches(1.5), Inches(0.28))
    tf_n = nb.text_frame
    tf_n.margin_left = tf_n.margin_top = tf_n.margin_right = tf_n.margin_bottom = 0
    p_n = tf_n.paragraphs[0]
    p_n.alignment = PP_ALIGN.RIGHT
    r_n = p_n.add_run()
    r_n.text = f"{slide_num:02d} / {total:02d}"
    r_n.font.name = FONT_T
    r_n.font.size = Pt(9.5)
    r_n.font.bold = True
    r_n.font.color.rgb = C_GREEN_MAIN

def create_card(slide, left, top, width, height,
                border_color=None, bg_color=None, accent_top=None):
    """Carte blanche avec bordure colorée et barre d'accent optionnelle en haut."""
    if border_color is None: border_color = C_CARD_BORDER
    if bg_color is None:     bg_color = C_CARD_BG

    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    card.line.color.rgb = border_color
    card.line.width = Pt(1.5)

    if accent_top:
        acc = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, Inches(0.055))
        acc.fill.solid()
        acc.fill.fore_color.rgb = accent_top
        acc.line.fill.background()
    return card

def add_badge_pill(slide, left, top, width, height, text, bg=None, fg=None):
    """Petite pastille colorée pour les kickers / étiquettes."""
    if bg is None: bg = C_GREEN_LIGHT
    if fg is None: fg = C_GREEN_MAIN
    pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    pill.fill.solid()
    pill.fill.fore_color.rgb = bg
    pill.line.fill.background()
    tf = pill.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = text.upper()
    r.font.name = FONT_T
    r.font.size = Pt(9)
    r.font.bold = True
    r.font.color.rgb = fg

# ─── SLIDE 1 : ACCUEIL & TON DÉCALÉ ────────────────────────────────────────
def build_slide_1(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide, prs)
    add_logo(slide)

    # Badge central
    add_badge_pill(slide, Inches(2.0), Inches(0.26), Inches(9.5), Inches(0.38),
                   "⚡ NÉGOCE ÉLECTRIQUE 2.0 — SOUTARAH GROUP",
                   bg=C_GREEN_LIGHT, fg=C_GREEN_DARK)

    # Grand titre
    tb = slide.shapes.add_textbox(Inches(0.55), Inches(1.15), Inches(12.4), Inches(2.0))
    tf = tb.text_frame
    tf.word_wrap = True
    p1 = tf.paragraphs[0]
    r1 = p1.add_run()
    r1.text = "Matériel électrique :"
    r1.font.name = FONT_T
    r1.font.size = Pt(34)
    r1.font.bold = True
    r1.font.color.rgb = C_TEXT_DARK

    p2 = tf.add_paragraph()
    r2 = p2.add_run()
    r2.text = "Et si on arrêtait de péter les plombs ?"
    r2.font.name = FONT_T
    r2.font.size = Pt(42)
    r2.font.bold = True
    r2.font.color.rgb = C_GREEN_MAIN

    # Carte sous-titre
    sub_card = create_card(slide, Inches(0.55), Inches(3.45), Inches(12.4), Inches(1.2),
                           border_color=C_CARD_BORDER, accent_top=C_GOLD)
    tf_sub = sub_card.text_frame
    tf_sub.margin_top = Inches(0.22)
    tf_sub.margin_left = Inches(0.45)
    tf_sub.margin_right = Inches(0.45)
    p_s1 = tf_sub.paragraphs[0]
    p_s1.alignment = PP_ALIGN.CENTER
    r_s1 = p_s1.add_run()
    r_s1.text = "Devis instantanés, stock visible en live & livraison directe sur chantier par Soutarah Group."
    r_s1.font.name = FONT_T
    r_s1.font.size = Pt(17)
    r_s1.font.bold = True
    r_s1.font.color.rgb = C_GOLD

    p_s2 = tf_sub.add_paragraph()
    p_s2.alignment = PP_ALIGN.CENTER
    r_s2 = p_s2.add_run()
    r_s2.text = "⚡ Chiffrage 24/7   •   📦 Stock en temps réel   •   🚚 Livraison directe sur chantier"
    r_s2.font.name = FONT_B
    r_s2.font.size = Pt(12.5)
    r_s2.font.color.rgb = C_TEXT_BODY

    # Carte punchline
    acc_card = create_card(slide, Inches(0.55), Inches(4.85), Inches(12.4), Inches(1.55),
                           border_color=C_GREEN_LIME,
                           bg_color=RGBColor(240, 253, 244), accent_top=C_GREEN_LIME)
    tf_a = acc_card.text_frame
    tf_a.margin_top = Inches(0.3)
    tf_a.margin_left = Inches(0.5)
    tf_a.margin_right = Inches(0.5)
    p_a1 = tf_a.paragraphs[0]
    p_a1.alignment = PP_ALIGN.CENTER
    r_a1 = p_a1.add_run()
    r_a1.text = "« Parce qu'un technicien qui attend du matériel, c'est de l'argent qui s'envole en fumée. »"
    r_a1.font.name = FONT_T
    r_a1.font.size = Pt(16.5)
    r_a1.font.italic = True
    r_a1.font.bold = True
    r_a1.font.color.rgb = C_TEXT_DARK

    p_a2 = tf_a.add_paragraph()
    p_a2.alignment = PP_ALIGN.CENTER
    r_a2 = p_a2.add_run()
    r_a2.text = "👉 Découvrez le négoce version 2.0 avec Soutarah Group."
    r_a2.font.name = FONT_B
    r_a2.font.size = Pt(14)
    r_a2.font.bold = True
    r_a2.font.color.rgb = C_GREEN_MAIN

    add_footer(slide, 1)

# ─── SLIDE 2 : LE CONSTAT (LE BÊTISIER) ────────────────────────────────────
def build_slide_2(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide, prs)
    add_logo(slide)
    add_header(slide,
               badge_text="⚠️ LE CONSTAT CHANTIER",
               title_text="Scène classique sur chantier...",
               subtitle_text="(Toute ressemblance avec votre quotidien est purement volontaire)",
               badge_color=C_RED)

    cards_data = [
        {"icon": "⏳", "title": 'Le devis "fantôme"',
         "quote": '« Demandé lundi, relancé mercredi, reçu... le mois prochain. »',
         "impact": "Chantier bloqué, retards de livraison et plannings explosés.",
         "color": C_RED},
        {"icon": "📦", "title": "La boîte vide",
         "quote": '« Faire 2 heures d\'embouteillages pour entendre : "Ah mon frère, c\'est fini en stock !" »',
         "impact": "Temps perdu dans les embouteillages d'Abidjan et carburant gaspillé.",
         "color": C_GOLD},
        {"icon": "⚡", "title": "Le mauvais composant",
         "quote": '« Le disjoncteur reçu n\'est pas le bon, mais "ça s\'adapte avec un bout de scotch" (non). »',
         "impact": "Risques d'incendie, non-conformité et reprise coûteuse.",
         "color": C_RED},
        {"icon": "🚚", "title": "Le marathon logistique",
         "quote": "« Transformer le chef de chantier en livreur de câbles improvisé. »",
         "impact": "Main-d'œuvre qualifiée détournée de sa vraie mission sur le chantier.",
         "color": C_GOLD},
    ]

    positions = [
        (Inches(0.55), Inches(1.95)),
        (Inches(6.85), Inches(1.95)),
        (Inches(0.55), Inches(4.5)),
        (Inches(6.85), Inches(4.5)),
    ]
    w_card = Inches(5.9)
    h_card = Inches(2.35)

    for i, data in enumerate(cards_data):
        px, py = positions[i]
        card = create_card(slide, px, py, w_card, h_card,
                           border_color=data["color"], accent_top=data["color"])
        tf = card.text_frame
        tf.margin_left = Inches(0.3)
        tf.margin_right = Inches(0.3)
        tf.margin_top = Inches(0.22)
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        r1 = p1.add_run()
        r1.text = f"{data['icon']}  {data['title']}"
        r1.font.name = FONT_T
        r1.font.size = Pt(16)
        r1.font.bold = True
        r1.font.color.rgb = data["color"]

        p2 = tf.add_paragraph()
        p2.space_before = Pt(6)
        r2 = p2.add_run()
        r2.text = data["quote"]
        r2.font.name = FONT_B
        r2.font.size = Pt(12.5)
        r2.font.italic = True
        r2.font.color.rgb = C_TEXT_DARK

        p3 = tf.add_paragraph()
        p3.space_before = Pt(8)
        r3 = p3.add_run()
        r3.text = f"➤ {data['impact']}"
        r3.font.name = FONT_B
        r3.font.size = Pt(11.5)
        r3.font.color.rgb = C_TEXT_BODY

    add_footer(slide, 2)

# ─── SLIDE 3 : LA SOLUTION (4 SUPER-POUVOIRS) ──────────────────────────────
def build_slide_3(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide, prs)
    add_logo(slide)
    add_header(slide,
               badge_text="💡 LA RÉVOLUTION SOUTARAH NÉGOCE",
               title_text="Vous avez le chantier, nous avons les étincelles !",
               subtitle_text="Les 4 super-pouvoirs de notre plateforme pour un approvisionnement sans prise de tête",
               badge_color=C_CYAN)

    superpowers = [
        {"icon": "⚡", "title": "Devis plus rapide\nque l'éclair",
         "desc": "Chiffrez vos besoins en ligne en temps réel.",
         "detail": "Accédez instantanément aux prix officiels sans attendre des jours. Devis pro-forma certifié en 1 clic.",
         "color": C_GOLD},
        {"icon": "👁️", "title": 'Transparence\n"Rayons X"',
         "desc": "Vous voyez le stock exact disponible avant de cliquer.",
         "detail": "Zéro fausse promesse. Si c'est affiché disponible, le produit est physiquement en rayon.",
         "color": C_CYAN},
        {"icon": "🤝", "title": "Écosystème\nde confiance",
         "desc": "Partenariat direct avec des distributeurs officiels.",
         "detail": "Matériel 100% certifié constructeur, normé et d'origine contrôlée. Aucun risque de contrefaçon.",
         "color": C_GREEN_MAIN},
        {"icon": "🚚", "title": 'Livraison\n"Zéro déplacement"',
         "desc": "On vous livre directement sur votre chantier.",
         "detail": "Acheminement express sur site à Abidjan et partout à l'intérieur du pays.",
         "color": C_AMBER},
    ]

    card_w = Inches(2.82)
    card_h = Inches(4.85)
    gap = Inches(0.26)
    start_x = Inches(0.55)
    top_y = Inches(1.9)

    for i, sp in enumerate(superpowers):
        px = start_x + i * (card_w + gap)
        card = create_card(slide, px, top_y, card_w, card_h,
                           border_color=sp["color"], accent_top=sp["color"])
        tf = card.text_frame
        tf.margin_left = Inches(0.2)
        tf.margin_right = Inches(0.2)
        tf.margin_top = Inches(0.28)
        tf.word_wrap = True

        p_icon = tf.paragraphs[0]
        p_icon.alignment = PP_ALIGN.CENTER
        r_icon = p_icon.add_run()
        r_icon.text = sp["icon"]
        r_icon.font.size = Pt(34)

        p_tit = tf.add_paragraph()
        p_tit.alignment = PP_ALIGN.CENTER
        p_tit.space_before = Pt(8)
        r_tit = p_tit.add_run()
        r_tit.text = sp["title"]
        r_tit.font.name = FONT_T
        r_tit.font.size = Pt(15)
        r_tit.font.bold = True
        r_tit.font.color.rgb = sp["color"]

        p_desc = tf.add_paragraph()
        p_desc.alignment = PP_ALIGN.CENTER
        p_desc.space_before = Pt(10)
        r_desc = p_desc.add_run()
        r_desc.text = sp["desc"]
        r_desc.font.name = FONT_B
        r_desc.font.size = Pt(12.5)
        r_desc.font.bold = True
        r_desc.font.color.rgb = C_TEXT_DARK

        p_sep = tf.add_paragraph()
        p_sep.alignment = PP_ALIGN.CENTER
        p_sep.space_before = Pt(8)
        r_sep = p_sep.add_run()
        r_sep.text = "─────────"
        r_sep.font.size = Pt(10)
        r_sep.font.color.rgb = C_CARD_BORDER

        p_det = tf.add_paragraph()
        p_det.space_before = Pt(8)
        r_det = p_det.add_run()
        r_det.text = sp["detail"]
        r_det.font.name = FONT_B
        r_det.font.size = Pt(11)
        r_det.font.color.rgb = C_TEXT_BODY

    add_footer(slide, 3)

# ─── SLIDE 4 : COMMENT ÇA MARCHE (4 ÉTAPES) ────────────────────────────────
def build_slide_4(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide, prs)
    add_logo(slide)
    add_header(slide,
               badge_text="⚡ PARCOURS CLIENT FLUIDE & RAPIDE",
               title_text="Moins de blabla, plus de watts.",
               subtitle_text="Votre matériel électrique livré sur chantier en 4 étapes chrono",
               badge_color=C_GOLD)

    steps = [
        {"num": "01", "action": "CLIQUEZ", "icon": "🖱️",
         "subtitle": "Catalogue en ligne 24/7",
         "text": "Trouvez votre câble, disjoncteur ou armoire sur soutarahgroup.com en quelques clics.",
         "color": C_CYAN},
        {"num": "02", "action": "VÉRIFIEZ", "icon": "🟢",
         "subtitle": "Disponibilité immédiate",
         "text": "Le stock est au vert ? C'est réservé instantanément pour vous dans nos entrepôts !",
         "color": C_GREEN_MAIN},
        {"num": "03", "action": "CHIFFREZ & VALIDEZ", "icon": "📑",
         "subtitle": "Devis express en direct",
         "text": "Devis instantané, prix fermes et validation immédiate de votre commande sans attente.",
         "color": C_GOLD},
        {"num": "04", "action": "LIVRAISON DIRECTE", "icon": "🚚",
         "subtitle": "Déchargement sur site",
         "text": "On décharge directement sur votre chantier. Gardez les mains sur vos outils !",
         "color": C_AMBER},
    ]

    card_w = Inches(2.82)
    card_h = Inches(4.85)
    gap = Inches(0.26)
    start_x = Inches(0.55)
    top_y = Inches(1.9)

    for i, st in enumerate(steps):
        px = start_x + i * (card_w + gap)
        card = create_card(slide, px, top_y, card_w, card_h,
                           border_color=st["color"], accent_top=st["color"])
        tf = card.text_frame
        tf.margin_left = Inches(0.25)
        tf.margin_right = Inches(0.25)
        tf.margin_top = Inches(0.3)
        tf.word_wrap = True

        p_num = tf.paragraphs[0]
        r_num = p_num.add_run()
        r_num.text = st["num"]
        r_num.font.name = FONT_T
        r_num.font.size = Pt(36)
        r_num.font.bold = True
        r_num.font.color.rgb = st["color"]

        p_act = tf.add_paragraph()
        p_act.space_before = Pt(4)
        r_act = p_act.add_run()
        r_act.text = f"{st['icon']}  {st['action']}"
        r_act.font.name = FONT_T
        r_act.font.size = Pt(16)
        r_act.font.bold = True
        r_act.font.color.rgb = C_TEXT_DARK

        p_sub = tf.add_paragraph()
        p_sub.space_before = Pt(4)
        r_sub = p_sub.add_run()
        r_sub.text = st["subtitle"]
        r_sub.font.name = FONT_B
        r_sub.font.size = Pt(12)
        r_sub.font.bold = True
        r_sub.font.color.rgb = st["color"]

        p_sep = tf.add_paragraph()
        p_sep.space_before = Pt(10)
        r_sep = p_sep.add_run()
        r_sep.text = "─────────"
        r_sep.font.size = Pt(10)
        r_sep.font.color.rgb = C_CARD_BORDER

        p_txt = tf.add_paragraph()
        p_txt.space_before = Pt(10)
        r_txt = p_txt.add_run()
        r_txt.text = st["text"]
        r_txt.font.name = FONT_B
        r_txt.font.size = Pt(12)
        r_txt.font.color.rgb = C_TEXT_BODY

    add_footer(slide, 4)

# ─── SLIDE 5 : POURQUOI SOUTARAH (AVANTAGES CONCURRENTIELS) ────────────────
def build_slide_5(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide, prs)
    add_logo(slide)
    add_header(slide,
               badge_text="🛡️ AVANTAGES CONCURRENTIELS DÉCISIFS",
               title_text="La puissance d'un grand réseau, la réactivité d'un partenaire local.",
               subtitle_text="4 arguments chocs pour sécuriser l'approvisionnement de vos chantiers",
               badge_color=C_AMBER)

    arguments = [
        {"icon": "🏆", "title": "Réseau Partenaires Solide",
         "quote": "Des fournisseurs officiels pour des produits certifiés d'origine",
         "desc": "Bénéficiez d'une chaîne logistique sans faille, de stocks massifs et des meilleurs tarifs négociés du marché ivoirien.",
         "color": C_GOLD},
        {"icon": "⏱️", "title": "Zéro Temps Mort",
         "quote": "Vos équipes travaillent, elles n'attendent plus après un rouleau de câble",
         "desc": "Chaque minute de retard coûte cher. Nos livraisons synchronisées garantissent la continuité de vos chantiers.",
         "color": C_CYAN},
        {"icon": "🛡️", "title": "Matériel 100% Conforme",
         "quote": "Pas de contrefaçon, pas de bricolage, de la sécurité certifiée",
         "desc": "Tous nos composants respectent les normes de sécurité en vigueur. Zéro risque pour vos installations.",
         "color": C_GREEN_MAIN},
        {"icon": "📞", "title": "Un SAV Toujours Branché",
         "quote": "Une équipe réactive au téléphone et sur le terrain",
         "desc": "Un doute technique ? Une référence spécifique ? Nos conseillers dédiés vous accompagnent à chaque étape.",
         "color": C_AMBER},
    ]

    positions = [
        (Inches(0.55), Inches(1.95)),
        (Inches(6.85), Inches(1.95)),
        (Inches(0.55), Inches(4.5)),
        (Inches(6.85), Inches(4.5)),
    ]
    w_card = Inches(5.9)
    h_card = Inches(2.35)

    for i, arg in enumerate(arguments):
        px, py = positions[i]
        card = create_card(slide, px, py, w_card, h_card,
                           border_color=arg["color"], accent_top=arg["color"])
        tf = card.text_frame
        tf.margin_left = Inches(0.3)
        tf.margin_right = Inches(0.3)
        tf.margin_top = Inches(0.22)
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        r1 = p1.add_run()
        r1.text = f"{arg['icon']}  {arg['title']}"
        r1.font.name = FONT_T
        r1.font.size = Pt(16)
        r1.font.bold = True
        r1.font.color.rgb = arg["color"]

        p2 = tf.add_paragraph()
        p2.space_before = Pt(6)
        r2 = p2.add_run()
        r2.text = f"« {arg['quote']} »"
        r2.font.name = FONT_B
        r2.font.size = Pt(12)
        r2.font.bold = True
        r2.font.italic = True
        r2.font.color.rgb = C_TEXT_DARK

        p3 = tf.add_paragraph()
        p3.space_before = Pt(6)
        r3 = p3.add_run()
        r3.text = arg["desc"]
        r3.font.name = FONT_B
        r3.font.size = Pt(11)
        r3.font.color.rgb = C_TEXT_BODY

    add_footer(slide, 5)

# ─── SLIDE 6 : CONCLUSION & APPEL À L'ACTION ────────────────────────────────
def build_slide_6(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide, prs)
    add_logo(slide)
    add_header(slide,
               badge_text="🚀 PASSEZ À L'ACTION DÈS AUJOURD'HUI",
               title_text="Branchez vos chantiers sur le bon courant !",
               subtitle_text="Optimisez vos approvisionnements électriques avec Soutarah Group",
               badge_color=C_GREEN_MAIN)

    # Colonne gauche : Coordonnées
    left_card = create_card(slide, Inches(0.55), Inches(1.9), Inches(7.7), Inches(4.9),
                            border_color=C_GREEN_MAIN, accent_top=C_GREEN_MAIN)
    tf_l = left_card.text_frame
    tf_l.margin_left = Inches(0.45)
    tf_l.margin_right = Inches(0.45)
    tf_l.margin_top = Inches(0.35)
    tf_l.word_wrap = True

    def add_contact_line(tf, icon_text, label, value, label_color=None, value_color=None,
                         space=Pt(12)):
        if label_color is None: label_color = C_TEXT_MUTED
        if value_color is None: value_color = C_TEXT_DARK
        p = tf.add_paragraph() if tf.paragraphs[0].text else tf.paragraphs[0]
        if tf.paragraphs[0].text:
            p = tf.add_paragraph()
        p.space_before = space
        r1 = p.add_run()
        r1.text = f"{icon_text}  {label} "
        r1.font.name = FONT_B
        r1.font.size = Pt(13.5)
        r1.font.color.rgb = label_color
        r2 = p.add_run()
        r2.text = value
        r2.font.name = FONT_T
        r2.font.size = Pt(13.5)
        r2.font.bold = True
        r2.font.color.rgb = value_color

    # Ligne 1 : Site web
    p_w1 = tf_l.paragraphs[0]
    r_w1 = p_w1.add_run()
    r_w1.text = "🌐  Plateforme Web Officielle :"
    r_w1.font.name = FONT_T
    r_w1.font.size = Pt(13.5)
    r_w1.font.color.rgb = C_TEXT_MUTED

    p_w2 = tf_l.add_paragraph()
    p_w2.space_before = Pt(3)
    r_w2 = p_w2.add_run()
    r_w2.text = "www.soutarahgroup.com"
    r_w2.font.name = FONT_T
    r_w2.font.size = Pt(22)
    r_w2.font.bold = True
    r_w2.font.color.rgb = C_GREEN_MAIN

    p_n1 = tf_l.add_paragraph()
    p_n1.space_before = Pt(14)
    r_n1 = p_n1.add_run()
    r_n1.text = "⚡  Section Dédiée : "
    r_n1.font.name = FONT_B
    r_n1.font.size = Pt(13.5)
    r_n1.font.color.rgb = C_TEXT_MUTED
    r_n1b = p_n1.add_run()
    r_n1b.text = "Négoce Électrique B2B"
    r_n1b.font.name = FONT_T
    r_n1b.font.bold = True
    r_n1b.font.color.rgb = C_TEXT_DARK

    p_n2 = tf_l.add_paragraph()
    p_n2.space_before = Pt(8)
    r_n2 = p_n2.add_run()
    r_n2.text = "📍  Couverture : "
    r_n2.font.name = FONT_B
    r_n2.font.size = Pt(13.5)
    r_n2.font.color.rgb = C_TEXT_MUTED
    r_n2b = p_n2.add_run()
    r_n2b.text = "Abidjan et tout le territoire ivoirien"
    r_n2b.font.name = FONT_T
    r_n2b.font.bold = True
    r_n2b.font.color.rgb = C_TEXT_DARK

    p_sig = tf_l.add_paragraph()
    p_sig.space_before = Pt(22)
    r_s1 = p_sig.add_run()
    r_s1.text = "SOUTARAH GROUP\n"
    r_s1.font.name = FONT_T
    r_s1.font.size = Pt(16)
    r_s1.font.bold = True
    r_s1.font.color.rgb = C_GREEN_MAIN
    r_s2 = p_sig.add_run()
    r_s2.text = "Le réflexe matériel qui vous évite le court-circuit."
    r_s2.font.name = FONT_B
    r_s2.font.size = Pt(13.5)
    r_s2.font.italic = True
    r_s2.font.bold = True
    r_s2.font.color.rgb = C_TEXT_BODY

    # Colonne droite : QR Code
    right_card = create_card(slide, Inches(8.55), Inches(1.9), Inches(4.2), Inches(4.9),
                             border_color=C_GREEN_LIME, accent_top=C_GREEN_LIME)
    tf_r = right_card.text_frame
    tf_r.margin_top = Inches(0.22)
    tf_r.word_wrap = True

    p_qr_t = tf_r.paragraphs[0]
    p_qr_t.alignment = PP_ALIGN.CENTER
    r_qr_t = p_qr_t.add_run()
    r_qr_t.text = "📱 COMMANDEZ EN LIGNE"
    r_qr_t.font.name = FONT_T
    r_qr_t.font.size = Pt(13)
    r_qr_t.font.bold = True
    r_qr_t.font.color.rgb = C_GREEN_MAIN

    if os.path.exists(QR_CODE_PATH):
        slide.shapes.add_picture(QR_CODE_PATH,
                                 Inches(9.35), Inches(2.55),
                                 width=Inches(2.4), height=Inches(2.4))

    sub_box = slide.shapes.add_textbox(Inches(8.65), Inches(5.1), Inches(4.0), Inches(1.4))
    tf_sub = sub_box.text_frame
    tf_sub.word_wrap = True
    p_qs = tf_sub.paragraphs[0]
    p_qs.alignment = PP_ALIGN.CENTER
    r_qs = p_qs.add_run()
    r_qs.text = "« Scannez avant la prochaine\ncoupure de courant ! »"
    r_qs.font.name = FONT_B
    r_qs.font.size = Pt(12)
    r_qs.font.bold = True
    r_qs.font.italic = True
    r_qs.font.color.rgb = C_GOLD

    add_footer(slide, 6)

# ─── MAIN ────────────────────────────────────────────────────────────────────
def main():
    print("=" * 70)
    print("  GÉNÉRATION — FOND BLANC — SOUTARAH NÉGOCE ÉLECTRIQUE")
    print("  (Logo Sogelec supprimé, charte claire professionnelle)")
    print("=" * 70)

    ensure_assets()
    print("[1/4] Assets prêts.")

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    print("[2/4] Construction des 6 diapositives (fond blanc)...")
    build_slide_1(prs)
    build_slide_2(prs)
    build_slide_3(prs)
    build_slide_4(prs)
    build_slide_5(prs)
    build_slide_6(prs)
    print("      -> 6 diapositives créées.")

    out = "Presentation_Soutarah_Negoce_Fond_Blanc.pptx"
    prs.save(out)
    size_mb = os.path.getsize(out) / (1024 * 1024)
    print(f"[3/4] Enregistré : '{out}' ({size_mb:.2f} Mo)")
    print("=" * 70)
    print("  SUCCÈS : LE POWERPOINT FOND BLANC EST PRÊT !")
    print("=" * 70)

if __name__ == "__main__":
    main()
