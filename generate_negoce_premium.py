# -*- coding: utf-8 -*-
"""
Presentation Soutarah Negoce Electrique — VERSION PREMIUM
Fond blanc, icônes Unicode professionnelles, typographie soignée,
blocs redessinés avec accents colorés, hiérarchie visuelle forte.
"""

import os
import qrcode
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
from lxml import etree

# ═══════════════════════════════════════════════════════════════════════════════
#  PALETTE  —  CHARTE SOUTARAH GROUP (fond blanc)
# ═══════════════════════════════════════════════════════════════════════════════
# Verts signature
G_FOREST   = RGBColor(  8,  44,  27)   # #082C1B – vert profond / fonds de badge
G_BRAND    = RGBColor( 40, 129,  52)   # #288134 – vert signature principal
G_LIME     = RGBColor(120, 183,  43)   # #78B72B – lime vif / accents
G_PALE     = RGBColor(236, 248, 226)   # #ECF8E2 – fond pâle vert

# Or / ambre
GOLD       = RGBColor(202, 138,   4)   # #CA8A04 – or professionnel
AMBER      = RGBColor(217, 119,   6)   # #D97706 – ambre chaud
AMBER_PALE = RGBColor(254, 243, 199)   # #FEF3C7 – fond ambre pâle

# Alertes
RED        = RGBColor(185,  28,  28)   # #B91C1C – rouge soutenu
RED_PALE   = RGBColor(254, 226, 226)   # #FEE2E2 – fond rouge pâle
TEAL       = RGBColor( 13, 148, 136)   # #0D9488 – teal validation
TEAL_PALE  = RGBColor(204, 251, 241)   # #CCFBF1 – fond teal pâle
BLUE       = RGBColor( 37, 99,  235)   # #2563EB – bleu info
BLUE_PALE  = RGBColor(219, 234, 254)   # #DBEAFE – fond bleu pâle

# Neutres fond blanc
BG_WHITE   = RGBColor(255, 255, 255)
BG_SOFT    = RGBColor(248, 250, 252)   # #F8FAFC
CARD_BG    = RGBColor(255, 255, 255)
BORDER     = RGBColor(226, 232, 240)   # #E2E8F0
BORDER_MED = RGBColor(203, 213, 225)   # #CBD5E1
T_DARK     = RGBColor( 15,  23,  42)   # #0F172A
T_BODY     = RGBColor( 51,  65,  85)   # #334155
T_MUTED    = RGBColor(100, 116, 139)   # #64748B
T_WHITE    = RGBColor(255, 255, 255)

# Typographie
FT = "Calibri"   # police titres — installed on all Windows machines
FB = "Calibri"   # police corps

LOGO_PATH = "dist/logo-soutarah.png"
QR_PATH   = "qrcode_soutarah.png"
OUT_FILE  = "Presentation_Soutarah_Negoce_Premium.pptx"

# ═══════════════════════════════════════════════════════════════════════════════
#  HELPERS XML — ombre portée (DrawingML)
# ═══════════════════════════════════════════════════════════════════════════════
def _add_shadow(shape):
    """Ajoute une légère ombre portée à une forme via le XML DrawingML."""
    sp_pr = shape._element.spPr
    ef_lst = etree.SubElement(sp_pr, qn("a:effectLst"))
    outer = etree.SubElement(ef_lst, qn("a:outerShdw"),
                             blurRad="50000", dist="23000", dir="5400000",
                             algn="ctr", rotWithShape="0")
    srgb = etree.SubElement(outer, qn("a:srgbClr"), val="000000")
    etree.SubElement(srgb, qn("a:alpha"), val="12000")   # 12 % opacité
    return shape

# ═══════════════════════════════════════════════════════════════════════════════
#  ASSETS
# ═══════════════════════════════════════════════════════════════════════════════
def ensure_assets():
    if not os.path.exists(QR_PATH):
        qr = qrcode.QRCode(version=1,
                           error_correction=qrcode.constants.ERROR_CORRECT_M,
                           box_size=10, border=2)
        qr.add_data("https://www.soutarahgroup.com")
        qr.make(fit=True)
        img = qr.make_image(fill_color="#082C1B", back_color="white")
        img.save(QR_PATH)

# ═══════════════════════════════════════════════════════════════════════════════
#  FOND & HABILLAGE COMMUNS
# ═══════════════════════════════════════════════════════════════════════════════
def set_background(slide, prs):
    """Fond blanc + bande verte haute (6 px) + ligne or (2 px)."""
    bg = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid(); bg.fill.fore_color.rgb = BG_WHITE
    bg.line.fill.background()

    bar = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.10))
    bar.fill.solid(); bar.fill.fore_color.rgb = G_BRAND
    bar.line.fill.background()

    acc = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, 0, Inches(0.10), prs.slide_width, Inches(0.025))
    acc.fill.solid(); acc.fill.fore_color.rgb = GOLD
    acc.line.fill.background()

def add_logo(slide):
    if os.path.exists(LOGO_PATH):
        slide.shapes.add_picture(LOGO_PATH, Inches(0.42), Inches(0.20),
                                 width=Inches(1.35))

def add_footer(slide, num, total=6):
    """Pied de page : ligne séparatrice + texte gauche + numéro droit."""
    sep = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(0.42), Inches(7.06),
        Inches(12.49), Pt(0.8))
    sep.fill.solid(); sep.fill.fore_color.rgb = BORDER
    sep.line.fill.background()

    left = slide.shapes.add_textbox(Inches(0.42), Inches(7.12),
                                    Inches(10.5), Inches(0.28))
    tf = left.text_frame
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = "SOUTARAH GROUP  ·  Négoce Électrique 2.0  ·  soutarahgroup.com"
    r.font.name = FB; r.font.size = Pt(9); r.font.color.rgb = T_MUTED

    right = slide.shapes.add_textbox(Inches(11.6), Inches(7.12),
                                     Inches(1.3), Inches(0.28))
    tf2 = right.text_frame
    tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0
    p2 = tf2.paragraphs[0]; p2.alignment = PP_ALIGN.RIGHT
    r2 = p2.add_run()
    r2.text = f"{num:02d} / {total:02d}"
    r2.font.name = FT; r2.font.size = Pt(9.5); r2.font.bold = True
    r2.font.color.rgb = G_BRAND

# ═══════════════════════════════════════════════════════════════════════════════
#  COMPOSANTS DE MISE EN PAGE
# ═══════════════════════════════════════════════════════════════════════════════
def add_section_badge(slide, left, top, width, height, text,
                      bg=G_PALE, fg=G_BRAND):
    """Pastille de catégorie arrondie."""
    pill = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    pill.fill.solid(); pill.fill.fore_color.rgb = bg
    pill.line.fill.background()
    tf = pill.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = Inches(0.18); tf.margin_right = Inches(0.18)
    tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = text
    r.font.name = FT; r.font.size = Pt(9.5)
    r.font.bold = True; r.font.color.rgb = fg
    return pill

def add_slide_title(slide, left, top, width, height,
                    title, subtitle=None,
                    title_color=T_DARK, sub_color=T_MUTED,
                    title_size=Pt(26)):
    """Grand titre + sous-titre optionnel."""
    tb = slide.shapes.add_textbox(left, top, width, height)
    tf = tb.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    r = p.add_run(); r.text = title
    r.font.name = FT; r.font.size = title_size
    r.font.bold = True; r.font.color.rgb = title_color
    if subtitle:
        ps = tf.add_paragraph(); ps.space_before = Pt(4)
        rs = ps.add_run(); rs.text = subtitle
        rs.font.name = FB; rs.font.size = Pt(11.5)
        rs.font.italic = True; rs.font.color.rgb = sub_color
    return tb

def make_card(slide, left, top, width, height,
              accent_color=None, bg=CARD_BG, shadow=True):
    """
    Carte blanche arrondie avec :
      - barre d'accent colorée sur le bord gauche (5 px)
      - bordure très subtile
      - ombre portée optionnelle
    """
    card = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid(); card.fill.fore_color.rgb = bg
    card.line.color.rgb = BORDER; card.line.width = Pt(0.75)
    if shadow:
        try:
            _add_shadow(card)
        except Exception:
            pass

    if accent_color:
        # Barre verticale gauche
        bar = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, left, top + Inches(0.06),
            Inches(0.055), height - Inches(0.12))
        bar.fill.solid(); bar.fill.fore_color.rgb = accent_color
        bar.line.fill.background()
    return card

def icon_box(slide, left, top, size, icon, bg_color, icon_color):
    """
    Carré arrondi coloré avec une icône Unicode centré dedans.
    Simule les icônes « box » style SaaS / dashboard moderne.
    """
    box = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, left, top, size, size)
    box.fill.solid(); box.fill.fore_color.rgb = bg_color
    box.line.fill.background()
    tf = box.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = icon
    r.font.size = Pt(22); r.font.color.rgb = icon_color
    return box

# ═══════════════════════════════════════════════════════════════════════════════
#  SLIDE 1 — COUVERTURE
# ═══════════════════════════════════════════════════════════════════════════════
def build_slide_1(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_background(slide, prs); add_logo(slide)

    # ── Badge haut centré
    add_section_badge(slide, Inches(2.1), Inches(0.22), Inches(9.2), Inches(0.42),
                      "⚡  NÉGOCE ÉLECTRIQUE 2.0  —  SOUTARAH GROUP",
                      bg=G_PALE, fg=G_FOREST)

    # ── Grand titre bicolore
    tb = slide.shapes.add_textbox(Inches(0.55), Inches(1.05),
                                  Inches(12.4), Inches(2.1))
    tf = tb.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p1 = tf.paragraphs[0]
    r1 = p1.add_run(); r1.text = "Matériel électrique : "
    r1.font.name = FT; r1.font.size = Pt(38); r1.font.bold = True
    r1.font.color.rgb = T_DARK

    p2 = tf.add_paragraph()
    r2 = p2.add_run(); r2.text = "Et si on arrêtait de péter les plombs ?"
    r2.font.name = FT; r2.font.size = Pt(40); r2.font.bold = True
    r2.font.color.rgb = G_BRAND

    # ── Carte sous-titre (vert pâle, bord vert)
    sub = make_card(slide, Inches(0.55), Inches(3.38), Inches(12.4),
                    Inches(1.22), accent_color=GOLD, bg=AMBER_PALE, shadow=True)
    tf_s = sub.text_frame
    tf_s.margin_top = Inches(0.20); tf_s.margin_left = Inches(0.45)
    tf_s.margin_right = Inches(0.3); tf_s.word_wrap = True
    p_s1 = tf_s.paragraphs[0]; p_s1.alignment = PP_ALIGN.CENTER
    r_s1 = p_s1.add_run()
    r_s1.text = "Devis instantanés, stock visible en live & livraison directe sur chantier"
    r_s1.font.name = FT; r_s1.font.size = Pt(17.5)
    r_s1.font.bold = True; r_s1.font.color.rgb = GOLD
    p_s2 = tf_s.add_paragraph(); p_s2.alignment = PP_ALIGN.CENTER
    r_s2 = p_s2.add_run()
    r_s2.text = "Chiffrage 24 / 7   ·   Stock en temps réel   ·   Livraison directe sur chantier"
    r_s2.font.name = FB; r_s2.font.size = Pt(12.5)
    r_s2.font.color.rgb = T_BODY

    # ── Trois piliers (3 mini-cartes)
    pillars = [
        ("⚡", "Devis express",    G_LIME,  G_PALE),
        ("📦", "Stock en direct",  G_BRAND, G_PALE),
        ("🚛", "Livraison chantier", GOLD, AMBER_PALE),
    ]
    pillar_w = Inches(3.9); pillar_h = Inches(1.28)
    gap = Inches(0.15)
    start_x = Inches(0.55); top_y = Inches(4.85)

    for i, (ico, lbl, fg, bg) in enumerate(pillars):
        px = start_x + i * (pillar_w + gap)
        card = make_card(slide, px, top_y, pillar_w, pillar_h,
                         accent_color=fg, bg=bg, shadow=True)
        tf_p = card.text_frame
        tf_p.margin_left = Inches(0.5); tf_p.margin_top = Inches(0.28)
        tf_p.word_wrap = True
        pp = tf_p.paragraphs[0]
        rr = pp.add_run(); rr.text = f"{ico}  {lbl}"
        rr.font.name = FT; rr.font.size = Pt(15)
        rr.font.bold = True; rr.font.color.rgb = fg

    add_footer(slide, 1)

# ═══════════════════════════════════════════════════════════════════════════════
#  SLIDE 2 — LE CONSTAT / BÊTISIER CHANTIER
# ═══════════════════════════════════════════════════════════════════════════════
def build_slide_2(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_background(slide, prs); add_logo(slide)

    add_section_badge(slide, Inches(2.1), Inches(0.22), Inches(6.5), Inches(0.40),
                      "⚠  LE CONSTAT CHANTIER", bg=RED_PALE, fg=RED)
    add_slide_title(slide, Inches(0.55), Inches(0.72), Inches(12.4), Inches(0.60),
                    "Scène classique sur chantier...",
                    subtitle="(Toute ressemblance avec votre quotidien est purement volontaire)",
                    title_size=Pt(24))

    cards = [
        # icon,  titre,                  citation courte,                              impact,                         fg,    bg_pale
        ("⏱",  'Le devis "fantôme"',
         "Demandé lundi, relancé mercredi, reçu le mois prochain.",
         "Chantier bloqué, plannings explosés.", RED, RED_PALE),
        ("📦", "La boîte vide",
         '"C\'est fini en stock !" — après 2 h d\'embouteillages.',
         "Temps & carburant gaspillés pour rien.", GOLD, AMBER_PALE),
        ("⚡", "Le mauvais composant",
         '"Ça s\'adapte avec un bout de scotch." (Spoilers : non.)',
         "Risque incendie, non-conformité, reprise coûteuse.", RED, RED_PALE),
        ("🚛", "Le marathon logistique",
         "Le chef de chantier transformé en livreur de câbles.",
         "Main-d'œuvre qualifiée détournée de sa vraie mission.", GOLD, AMBER_PALE),
    ]

    positions = [
        (Inches(0.55), Inches(1.78)),
        (Inches(6.85), Inches(1.78)),
        (Inches(0.55), Inches(4.35)),
        (Inches(6.85), Inches(4.35)),
    ]
    cw, ch = Inches(5.95), Inches(2.38)

    for (ico, titre, citation, impact, fg, bg), (px, py) in zip(cards, positions):
        card = make_card(slide, px, py, cw, ch,
                         accent_color=fg, bg=bg, shadow=True)
        # Icône box
        icon_box(slide, px + Inches(0.14), py + Inches(0.22),
                 Inches(0.55), ico, fg, T_WHITE)
        # Texte
        tb = slide.shapes.add_textbox(px + Inches(0.82), py + Inches(0.18),
                                      cw - Inches(0.96), ch - Inches(0.3))
        tf = tb.text_frame; tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        pt = tf.paragraphs[0]
        rt = pt.add_run(); rt.text = titre
        rt.font.name = FT; rt.font.size = Pt(14.5)
        rt.font.bold = True; rt.font.color.rgb = fg

        pc = tf.add_paragraph(); pc.space_before = Pt(5)
        rc = pc.add_run(); rc.text = f"« {citation} »"
        rc.font.name = FB; rc.font.size = Pt(11.5)
        rc.font.italic = True; rc.font.color.rgb = T_BODY

        pi = tf.add_paragraph(); pi.space_before = Pt(7)
        ri = pi.add_run(); ri.text = f"→  {impact}"
        ri.font.name = FB; ri.font.size = Pt(11)
        ri.font.color.rgb = T_MUTED

    add_footer(slide, 2)

# ═══════════════════════════════════════════════════════════════════════════════
#  SLIDE 3 — LA SOLUTION (4 SUPER-POUVOIRS)
# ═══════════════════════════════════════════════════════════════════════════════
def build_slide_3(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_background(slide, prs); add_logo(slide)

    add_section_badge(slide, Inches(2.1), Inches(0.22), Inches(7.0), Inches(0.40),
                      "💡  LA RÉVOLUTION SOUTARAH NÉGOCE", bg=G_PALE, fg=G_FOREST)
    add_slide_title(slide, Inches(0.55), Inches(0.72), Inches(12.4), Inches(0.60),
                    "Vous avez le chantier, nous avons les étincelles !",
                    subtitle="Les 4 super-pouvoirs de notre plateforme pour un approvisionnement sans prise de tête",
                    title_size=Pt(23))

    powers = [
        ("⚡", "Devis plus rapide que l'éclair",
         "Prix officiels en temps réel, devis pro-forma certifié en 1 clic.",
         GOLD, AMBER_PALE),
        ("👁", 'Transparence "Rayons X"',
         "Stock exact visible avant commande. Si c'est affiché, c'est disponible.",
         BLUE, BLUE_PALE),
        ("🤝", "Écosystème de confiance",
         "Matériel 100 % certifié constructeur — aucun risque de contrefaçon.",
         G_BRAND, G_PALE),
        ("🚛", 'Livraison "Zéro déplacement"',
         "Déchargement express directement sur votre chantier partout en Côte d'Ivoire.",
         AMBER, AMBER_PALE),
    ]

    cw = Inches(2.88); ch = Inches(4.98)
    gap = Inches(0.24); sx = Inches(0.55); ty = Inches(1.82)

    for i, (ico, titre, detail, fg, bg) in enumerate(powers):
        px = sx + i * (cw + gap)
        card = make_card(slide, px, ty, cw, ch,
                         accent_color=None, bg=bg, shadow=True)
        # Bordure colorée en haut
        top_acc = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, px, ty, cw, Inches(0.06))
        top_acc.fill.solid(); top_acc.fill.fore_color.rgb = fg
        top_acc.line.fill.background()

        # Icône box centré
        box_sz = Inches(0.70)
        box_lft = px + (cw - box_sz) / 2
        icon_box(slide, box_lft, ty + Inches(0.18), box_sz, ico, fg, T_WHITE)

        # Titre
        tb = slide.shapes.add_textbox(px + Inches(0.15), ty + Inches(1.0),
                                      cw - Inches(0.3), Inches(0.75))
        tf = tb.text_frame; tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        pt = tf.paragraphs[0]; pt.alignment = PP_ALIGN.CENTER
        rt = pt.add_run(); rt.text = titre
        rt.font.name = FT; rt.font.size = Pt(13.5)
        rt.font.bold = True; rt.font.color.rgb = fg

        # Séparateur
        sep = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, px + Inches(0.4), ty + Inches(1.82),
            cw - Inches(0.8), Pt(0.8))
        sep.fill.solid(); sep.fill.fore_color.rgb = BORDER
        sep.line.fill.background()

        # Détail
        tb2 = slide.shapes.add_textbox(px + Inches(0.18), ty + Inches(1.95),
                                       cw - Inches(0.36), Inches(2.78))
        tf2 = tb2.text_frame; tf2.word_wrap = True
        tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0
        pd = tf2.paragraphs[0]
        rd = pd.add_run(); rd.text = detail
        rd.font.name = FB; rd.font.size = Pt(11.5)
        rd.font.color.rgb = T_BODY

    add_footer(slide, 3)

# ═══════════════════════════════════════════════════════════════════════════════
#  SLIDE 4 — COMMENT ÇA MARCHE (4 ÉTAPES CHRONOLOGIQUES)
# ═══════════════════════════════════════════════════════════════════════════════
def build_slide_4(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_background(slide, prs); add_logo(slide)

    add_section_badge(slide, Inches(2.1), Inches(0.22), Inches(7.0), Inches(0.40),
                      "🔄  PARCOURS CLIENT FLUIDE & RAPIDE", bg=BLUE_PALE, fg=BLUE)
    add_slide_title(slide, Inches(0.55), Inches(0.72), Inches(12.4), Inches(0.60),
                    "Moins de blabla, plus de watts.",
                    subtitle="Votre matériel électrique livré sur chantier en 4 étapes chrono",
                    title_size=Pt(25))

    steps = [
        ("01", "🖱", "CLIQUEZ",
         "Catalogue en ligne 24 / 7",
         "Trouvez câbles, disjoncteurs ou armoires sur soutarahgroup.com en quelques clics.",
         BLUE, BLUE_PALE),
        ("02", "✅", "VÉRIFIEZ",
         "Disponibilité immédiate",
         "Le stock est au vert ? C'est réservé instantanément dans nos entrepôts !",
         TEAL, TEAL_PALE),
        ("03", "📋", "CHIFFREZ & VALIDEZ",
         "Devis express en direct",
         "Prix fermes et validation immédiate — aucune attente, aucune surprise.",
         GOLD, AMBER_PALE),
        ("04", "🚛", "LIVRAISON DIRECTE",
         "Déchargement sur site",
         "On décharge sur votre chantier. Vos équipes restent sur leurs outils !",
         G_BRAND, G_PALE),
    ]

    cw = Inches(2.88); ch = Inches(4.98)
    gap = Inches(0.24); sx = Inches(0.55); ty = Inches(1.82)

    for i, (num, ico, action, sub, detail, fg, bg) in enumerate(steps):
        px = sx + i * (cw + gap)
        card = make_card(slide, px, ty, cw, ch, bg=bg, shadow=True)

        # Bordure top colorée
        top_acc = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, px, ty, cw, Inches(0.06))
        top_acc.fill.solid(); top_acc.fill.fore_color.rgb = fg
        top_acc.line.fill.background()

        # Numéro grand
        tb_n = slide.shapes.add_textbox(px + Inches(0.18), ty + Inches(0.12),
                                        Inches(0.8), Inches(0.85))
        tf_n = tb_n.text_frame
        tf_n.margin_left = tf_n.margin_top = tf_n.margin_right = tf_n.margin_bottom = 0
        pn = tf_n.paragraphs[0]
        rn = pn.add_run(); rn.text = num
        rn.font.name = FT; rn.font.size = Pt(38)
        rn.font.bold = True; rn.font.color.rgb = fg

        # Icône à droite du numéro
        icon_box(slide, px + cw - Inches(0.82), ty + Inches(0.18),
                 Inches(0.58), ico, fg, T_WHITE)

        # Titre action
        tb_a = slide.shapes.add_textbox(px + Inches(0.18), ty + Inches(1.08),
                                        cw - Inches(0.36), Inches(0.45))
        tf_a = tb_a.text_frame; tf_a.word_wrap = True
        tf_a.margin_left = tf_a.margin_top = tf_a.margin_right = tf_a.margin_bottom = 0
        pa = tf_a.paragraphs[0]
        ra = pa.add_run(); ra.text = action
        ra.font.name = FT; ra.font.size = Pt(13.5)
        ra.font.bold = True; ra.font.color.rgb = fg

        # Sous-titre
        tb_s = slide.shapes.add_textbox(px + Inches(0.18), ty + Inches(1.55),
                                        cw - Inches(0.36), Inches(0.38))
        tf_s = tb_s.text_frame; tf_s.word_wrap = True
        tf_s.margin_left = tf_s.margin_top = tf_s.margin_right = tf_s.margin_bottom = 0
        ps = tf_s.paragraphs[0]
        rs = ps.add_run(); rs.text = sub
        rs.font.name = FB; rs.font.size = Pt(11.5)
        rs.font.bold = True; rs.font.color.rgb = T_DARK

        # Ligne
        sep = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, px + Inches(0.18), ty + Inches(1.98),
            cw - Inches(0.36), Pt(0.8))
        sep.fill.solid(); sep.fill.fore_color.rgb = BORDER
        sep.line.fill.background()

        # Détail
        tb_d = slide.shapes.add_textbox(px + Inches(0.18), ty + Inches(2.1),
                                        cw - Inches(0.36), Inches(2.6))
        tf_d = tb_d.text_frame; tf_d.word_wrap = True
        tf_d.margin_left = tf_d.margin_top = tf_d.margin_right = tf_d.margin_bottom = 0
        pd = tf_d.paragraphs[0]
        rd = pd.add_run(); rd.text = detail
        rd.font.name = FB; rd.font.size = Pt(11.5)
        rd.font.color.rgb = T_BODY

    add_footer(slide, 4)

# ═══════════════════════════════════════════════════════════════════════════════
#  SLIDE 5 — POURQUOI SOUTARAH (AVANTAGES)
# ═══════════════════════════════════════════════════════════════════════════════
def build_slide_5(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_background(slide, prs); add_logo(slide)

    add_section_badge(slide, Inches(2.1), Inches(0.22), Inches(7.5), Inches(0.40),
                      "🏆  AVANTAGES CONCURRENTIELS DÉCISIFS", bg=AMBER_PALE, fg=AMBER)
    add_slide_title(slide, Inches(0.55), Inches(0.72), Inches(12.4), Inches(0.60),
                    "La puissance d'un grand réseau, la réactivité d'un partenaire local.",
                    subtitle="4 arguments chocs pour sécuriser l'approvisionnement de vos chantiers",
                    title_size=Pt(21))

    args = [
        ("🏆", "Réseau Partenaires Solide",
         "Fournisseurs officiels certifiés",
         "Stocks massifs réservés, meilleurs tarifs du marché ivoirien, chaîne logistique sans faille.",
         GOLD, AMBER_PALE),
        ("⏱", "Zéro Temps Mort",
         "Vos équipes travaillent sans attendre",
         "Nos livraisons synchronisées garantissent la continuité totale de votre chantier.",
         TEAL, TEAL_PALE),
        ("🛡", "Matériel 100 % Conforme",
         "Normes de sécurité scrupuleusement respectées",
         "Aucune contrefaçon. Aucun bricolage. Zéro risque pour vos installations.",
         G_BRAND, G_PALE),
        ("📞", "SAV Toujours Branché",
         "Équipe réactive téléphone & terrain",
         "Doute technique ? Référence spécifique ? Nos ingénieurs vous accompagnent à chaque étape.",
         BLUE, BLUE_PALE),
    ]

    positions = [
        (Inches(0.55), Inches(1.78)),
        (Inches(6.85), Inches(1.78)),
        (Inches(0.55), Inches(4.38)),
        (Inches(6.85), Inches(4.38)),
    ]
    cw = Inches(5.95); ch = Inches(2.38)

    for (ico, titre, sous_titre, desc, fg, bg), (px, py) in zip(args, positions):
        card = make_card(slide, px, py, cw, ch,
                         accent_color=fg, bg=bg, shadow=True)

        # Icône box
        box_sz = Inches(0.62)
        icon_box(slide, px + Inches(0.15), py + Inches(0.20),
                 box_sz, ico, fg, T_WHITE)

        # Bloc texte
        tb = slide.shapes.add_textbox(
            px + Inches(0.90), py + Inches(0.16),
            cw - Inches(1.06), ch - Inches(0.28))
        tf = tb.text_frame; tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        pt = tf.paragraphs[0]
        rt = pt.add_run(); rt.text = titre
        rt.font.name = FT; rt.font.size = Pt(14); rt.font.bold = True
        rt.font.color.rgb = fg

        ps = tf.add_paragraph(); ps.space_before = Pt(3)
        rs = ps.add_run(); rs.text = sous_titre
        rs.font.name = FB; rs.font.size = Pt(11.5); rs.font.bold = True
        rs.font.color.rgb = T_DARK

        pd = tf.add_paragraph(); pd.space_before = Pt(6)
        rd = pd.add_run(); rd.text = desc
        rd.font.name = FB; rd.font.size = Pt(11); rd.font.color.rgb = T_BODY

    add_footer(slide, 5)

# ═══════════════════════════════════════════════════════════════════════════════
#  SLIDE 6 — CONCLUSION & APPEL À L'ACTION
# ═══════════════════════════════════════════════════════════════════════════════
def build_slide_6(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_background(slide, prs); add_logo(slide)

    add_section_badge(slide, Inches(2.1), Inches(0.22), Inches(8.0), Inches(0.40),
                      "🚀  PASSEZ À L'ACTION DÈS AUJOURD'HUI", bg=G_PALE, fg=G_BRAND)
    add_slide_title(slide, Inches(0.55), Inches(0.72), Inches(12.4), Inches(0.60),
                    "Branchez vos chantiers sur le bon courant !",
                    subtitle="Optimisez vos approvisionnements électriques avec Soutarah Group",
                    title_size=Pt(25))

    # ── Colonne gauche — Contacts & tagline
    lc = make_card(slide, Inches(0.55), Inches(1.82), Inches(7.8), Inches(5.0),
                   accent_color=G_BRAND, bg=BG_SOFT, shadow=True)
    tf_l = lc.text_frame
    tf_l.margin_left = Inches(0.52); tf_l.margin_right = Inches(0.35)
    tf_l.margin_top = Inches(0.32); tf_l.word_wrap = True

    def cline(tf, ico, label, value, fg_val=T_DARK, space=Pt(14)):
        ps = tf.add_paragraph() if tf.paragraphs[0].runs else tf.paragraphs[0]
        if tf.paragraphs[0].runs:
            ps = tf.add_paragraph()
        ps.space_before = space
        rl = ps.add_run(); rl.text = f"{ico}  {label} "
        rl.font.name = FB; rl.font.size = Pt(13); rl.font.color.rgb = T_MUTED
        rv = ps.add_run(); rv.text = value
        rv.font.name = FT; rv.font.size = Pt(13); rv.font.bold = True
        rv.font.color.rgb = fg_val

    # Ligne 0 (première ligne — sans space_before via paragraphs[0])
    p0 = tf_l.paragraphs[0]
    r0a = p0.add_run(); r0a.text = "🌐  Plateforme officielle : "
    r0a.font.name = FB; r0a.font.size = Pt(13); r0a.font.color.rgb = T_MUTED
    r0b = p0.add_run(); r0b.text = "www.soutarahgroup.com"
    r0b.font.name = FT; r0b.font.size = Pt(20); r0b.font.bold = True
    r0b.font.color.rgb = G_BRAND

    cline(tf_l, "⚡", "Section dédiée :", "Négoce Électrique B2B")
    cline(tf_l, "📍", "Couverture :", "Abidjan & tout le territoire ivoirien")
    cline(tf_l, "📦", "Catalogue :", "Câbles · Disjoncteurs · Armoires · Accessoires")

    # Ligne de tagline
    pt = tf_l.add_paragraph(); pt.space_before = Pt(24)
    rt1 = pt.add_run(); rt1.text = "SOUTARAH GROUP  —  "
    rt1.font.name = FT; rt1.font.size = Pt(14); rt1.font.bold = True
    rt1.font.color.rgb = G_BRAND
    rt2 = pt.add_run()
    rt2.text = "Le réflexe matériel qui vous évite le court-circuit."
    rt2.font.name = FB; rt2.font.size = Pt(13); rt2.font.italic = True
    rt2.font.bold = True; rt2.font.color.rgb = T_BODY

    # ── Colonne droite — QR code
    rc = make_card(slide, Inches(8.62), Inches(1.82), Inches(4.18), Inches(5.0),
                   accent_color=G_LIME, bg=G_PALE, shadow=True)
    tf_r = rc.text_frame
    tf_r.margin_top = Inches(0.22); tf_r.word_wrap = True
    pr = tf_r.paragraphs[0]; pr.alignment = PP_ALIGN.CENTER
    rr = pr.add_run(); rr.text = "📱  COMMANDEZ EN LIGNE"
    rr.font.name = FT; rr.font.size = Pt(13); rr.font.bold = True
    rr.font.color.rgb = G_FOREST

    if os.path.exists(QR_PATH):
        qr_sz = Inches(2.55)
        qr_left = Inches(8.62) + (Inches(4.18) - qr_sz) / 2
        slide.shapes.add_picture(QR_PATH, qr_left, Inches(2.62),
                                 width=qr_sz, height=qr_sz)

    # Légende sous QR
    cap = slide.shapes.add_textbox(Inches(8.72), Inches(5.32),
                                   Inches(3.98), Inches(1.2))
    tf_c = cap.text_frame; tf_c.word_wrap = True
    tf_c.margin_left = tf_c.margin_top = tf_c.margin_right = tf_c.margin_bottom = 0
    pc = tf_c.paragraphs[0]; pc.alignment = PP_ALIGN.CENTER
    rc2 = pc.add_run()
    rc2.text = "« Scannez avant la prochaine\ncoupure de courant ! »"
    rc2.font.name = FB; rc2.font.size = Pt(12); rc2.font.bold = True
    rc2.font.italic = True; rc2.font.color.rgb = GOLD

    add_footer(slide, 6)

# ═══════════════════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════════════════
def main():
    print("=" * 70)
    print("  GÉNÉRATION PREMIUM — FOND BLANC — SOUTARAH NÉGOCE ÉLECTRIQUE")
    print("  Icônes Unicode pro · Calibri · Blocs avec ombres & accents")
    print("=" * 70)

    ensure_assets()
    print("[1/3] Assets prêts (QR code OK).")

    prs = Presentation()
    prs.slide_width  = Inches(13.333)
    prs.slide_height = Inches(7.5)

    print("[2/3] Construction des 6 diapositives premium...")
    build_slide_1(prs)
    build_slide_2(prs)
    build_slide_3(prs)
    build_slide_4(prs)
    build_slide_5(prs)
    build_slide_6(prs)
    print(f"      -> {len(prs.slides)} diapositives creees.")

    prs.save(OUT_FILE)
    sz = os.path.getsize(OUT_FILE) / 1024
    print(f"[3/3] Enregistré : '{OUT_FILE}' ({sz:.0f} Ko)")
    print("=" * 70)
    print("  SUCCÈS — PowerPoint premium prêt !")
    print("=" * 70)

if __name__ == "__main__":
    main()
