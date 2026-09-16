import os
import sys
from PIL import Image
import pptx
from pptx.dml.color import RGBColor
from pptx.util import Inches, Pt
from pptx.enum.shapes import MSO_SHAPE_TYPE

sys.stdout.reconfigure(encoding='utf-8')

# --- CHARTE OFFICIELLE VERT DU LOGO SOUTARAH GROUP ---
LOGO_DARK_GREEN  = RGBColor(8, 44, 27)     # #082C1B - Vert forêt profond
LOGO_BRAND_GREEN = RGBColor(40, 129, 52)   # #288134 - Vert principal Soutarah
LOGO_LEAF_LIME   = RGBColor(120, 183, 43)  # #78B72B - Vert feuille vif du logo
LIME_LIGHT_BG    = RGBColor(236, 248, 226) # #ECF8E2 - Vert très clair
TEXT_DARK        = RGBColor(15, 23, 42)    # #0F172A - Titre sombre
TEXT_BODY        = RGBColor(51, 65, 85)    # #334155 - Texte courant

def is_orange(rgb):
    r, g, b = rgb[0], rgb[1], rgb[2]
    return (r > 170 and g < 140 and b < 60) or (r > 200 and g < 160 and b < 80)

def recolor_shape_recursively(shape):
    """Parcourt et remplace chaque trace d'orange par le vert Soutarah."""
    # 1. Remplissage
    if hasattr(shape, 'fill') and shape.fill.type == 1:
        try:
            rgb = shape.fill.fore_color.rgb
            if is_orange(rgb):
                shape.fill.solid()
                shape.fill.fore_color.rgb = LOGO_BRAND_GREEN
        except:
            pass

    # 2. Contour
    if hasattr(shape, 'line') and shape.line.fill.type == 1:
        try:
            rgb = shape.line.color.rgb
            if is_orange(rgb):
                shape.line.color.rgb = LOGO_BRAND_GREEN
        except:
            pass

    # 3. Textes et numéros de slide
    if shape.has_text_frame:
        for p in shape.text_frame.paragraphs:
            for r in p.runs:
                try:
                    rgb = r.font.color.rgb
                    if is_orange(rgb):
                        r.font.color.rgb = LOGO_LEAF_LIME
                except:
                    pass

    # 4. Groupes de formes
    if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
        for child in shape.shapes:
            recolor_shape_recursively(child)

def place_image_proportional(slide, img_path, left, top, width, height):
    """Place une image avec ratio d'aspect strict au centre de la zone."""
    if not os.path.exists(img_path):
        print(f"Attention: Image non trouvée -> {img_path}")
        return None
    with Image.open(img_path) as im:
        img_w, img_h = im.size
    
    img_aspect = img_w / img_h
    box_aspect = width / height

    if img_aspect > box_aspect:
        final_w = width
        final_h = width / img_aspect
        final_left = left
        final_top = top + (height - final_h) / 2
    else:
        final_h = height
        final_w = height * img_aspect
        final_top = top
        final_left = left + (width - final_w) / 2

    return slide.shapes.add_picture(img_path, final_left, final_top, width=final_w, height=final_h)

def replace_picture_shape(slide, shape_name, new_img_path):
    """Trouve la forme image par son nom, note ses coordonnées, la supprime et insère la nouvelle."""
    target_shape = None
    for s in slide.shapes:
        if s.name == shape_name and s.shape_type == MSO_SHAPE_TYPE.PICTURE:
            target_shape = s
            break
    
    if target_shape:
        left, top, w, h = target_shape.left, target_shape.top, target_shape.width, target_shape.height
        slide.shapes._spTree.remove(target_shape._element)
        place_image_proportional(slide, new_img_path, left, top, w, h)
        return True
    return False

def replace_first_picture_in_slide(slide, new_img_path):
    """Remplace la première image trouvée dans la diapositive par la nouvelle image proportionnelle."""
    for s in list(slide.shapes):
        if s.shape_type == MSO_SHAPE_TYPE.PICTURE:
            left, top, w, h = s.left, s.top, s.width, s.height
            slide.shapes._spTree.remove(s._element)
            place_image_proportional(slide, new_img_path, left, top, w, h)
            return True
    return False

def main():
    file_path = "Soutenance stage plateforme numerique Soutarah Group.pptx"
    print(f"Chargement de {file_path}...")
    prs = pptx.Presentation(file_path)

    # 1. ÉTAPE 1 : Élimination intégrale de l'orange sur l'ensemble des 40 slides
    print("Application de la charte verte Soutarah sur toutes les formes et textes...")
    for idx, slide in enumerate(prs.slides):
        for s in slide.shapes:
            recolor_shape_recursively(s)

    # 2. ÉTAPE 2 : Remplacement précis des images de diagrammes et d'interfaces
    print("Insertion des diagrammes et interfaces réels du rapport...")

    # Slide 4 : Titre du projet -> Logo SOUTARAH
    replace_first_picture_in_slide(prs.slides[3], "public/logo-soutarah.png")

    # Slide 13 : Planning du projet -> Diagramme de GANTT (Figure 1)
    gantt_path = "diagrammes/gantt/diagramme-gantt.png"
    if not os.path.exists(gantt_path):
        gantt_path = "extracted_pptx_images/slide_15_img_7_image.png"
    replace_first_picture_in_slide(prs.slides[12], gantt_path)

    # Slide 17 : Cas d'utilisation -> Diagramme global (Figure 2)
    uc_path = "diagrammes/cas d'utilisation/cas_d'utilisation.png"
    if not os.path.exists(uc_path):
        uc_path = "extracted_pptx_images/slide_20_img_7_image.png"
    replace_first_picture_in_slide(prs.slides[16], uc_path)

    # Slide 19 : Activité compte client -> Activité Inscription (Figure 3)
    act1_path = "diagrammes/activite/activite-compte-client.png"
    if not os.path.exists(act1_path):
        act1_path = "extracted_pptx_images/slide_21_img_7_image.png"
    replace_first_picture_in_slide(prs.slides[18], act1_path)

    # Slide 20 : Activité réservation -> Activité Réservation Véhicule (Figure 4)
    act2_path = "diagrammes/activite/activite-reservation-vehicule.png"
    if not os.path.exists(act2_path):
        act2_path = "extracted_pptx_images/slide_22_img_7_image.png"
    replace_first_picture_in_slide(prs.slides[19], act2_path)

    # Slide 21 : Activité achat produit -> Activité Achat Produit Négoce (Figure 5)
    act3_path = "diagrammes/activite/achat d'un produit.png"
    if not os.path.exists(act3_path):
        act3_path = "extracted_pptx_images/slide_23_img_7_image.png"
    replace_first_picture_in_slide(prs.slides[20], act3_path)

    # Slide 22 : Séquence paiement -> Séquence Paiement en Ligne (Figure 6)
    seq1_path = "diagrammes/sequence/sequence-paiement-en-ligne.png"
    if not os.path.exists(seq1_path):
        seq1_path = "extracted_pptx_images/slide_24_img_7_image.png"
    replace_first_picture_in_slide(prs.slides[21], seq1_path)

    # Slide 23 : Séquence réservation -> Séquence Réservation Véhicule (Figure 7)
    seq2_path = "diagrammes/sequence/sequence-reservation-vehicule.png"
    if not os.path.exists(seq2_path):
        seq2_path = "extracted_pptx_images/slide_25_img_7_image.png"
    replace_first_picture_in_slide(prs.slides[22], seq2_path)

    # Slide 24 : Séquence inscription -> Séquence Inscription Utilisateur (Figure 9)
    seq3_path = "diagrammes/sequence/sequence-authentification-inscription.png"
    if not os.path.exists(seq3_path):
        seq3_path = "extracted_pptx_images/slide_26_img_9_image.png"
    replace_first_picture_in_slide(prs.slides[23], seq3_path)

    # Slide 26 : Diagramme de classes -> Diagramme de Classes (Figure 10)
    cls_path = "diagrammes/classe/diagramme-de-classe.png"
    if not os.path.exists(cls_path):
        cls_path = "extracted_pptx_images/slide_27_img_7_image.png"
    replace_first_picture_in_slide(prs.slides[25], cls_path)

    # Slide 29 : Architecture générale -> Architecture 3-Tiers (Figure 18)
    arch_path = "diagrammes/architecture/architecture-generale.png"
    if not os.path.exists(arch_path):
        arch_path = "extracted_pptx_images/slide_36_img_7_image.png"
    replace_first_picture_in_slide(prs.slides[28], arch_path)

    # Slide 30 : Base de données -> Schéma Relationnel MySQL (Figure 19)
    db_path = "extracted_pptx_images/slide_37_img_7_image.png"
    replace_first_picture_in_slide(prs.slides[29], db_path)

    # Slide 35 : Interfaces Web -> Panier multi-articles & Devis PDF (Figure 24)
    web_path = "extracted_pptx_images/slide_41_img_7_image.png"
    if not os.path.exists(web_path):
        web_path = "extracted_pptx_images/slide_39_img_7_image.png"
    replace_first_picture_in_slide(prs.slides[34], web_path)

    # Slide 36 : Application Mobile -> Fiche véhicule & Panier mobile (Figure 26 & 27)
    mob_path = "extracted_pptx_images/slide_42_img_7_image.png"
    replace_first_picture_in_slide(prs.slides[35], mob_path)

    # Slide 37 : Back-Office -> Tableau de bord KPIs (Figure 28)
    adm_path = "extracted_pptx_images/slide_43_img_7_image.png"
    replace_first_picture_in_slide(prs.slides[36], adm_path)

    # 3. ÉTAPE 3 : Enrichissement textuel fidèle au rapport
    print("Enrichissement des données textuelles fidèles au rapport corrigé...")

    # Slide 1 : Ajout de la filière académique sur la page de garde
    s1 = prs.slides[0]
    for s in s1.shapes:
        if s.has_text_frame and "Prévisualisation" in s.text_frame.text:
            s.text_frame.text = "David SORHO • Institut National Polytechnique Félix Houphouët-Boigny (INP-HB) • ESI / STIC"
            s.text_frame.paragraphs[0].font.name = "Aileron"
            s.text_frame.paragraphs[0].font.size = Pt(16)
            s.text_frame.paragraphs[0].font.color.rgb = LOGO_LEAF_LIME

    # Slide 6 : Ajout des 5 partenaires et valeurs SAPE exactes
    s6 = prs.slides[5]
    for s in s6.shapes:
        if s.has_text_frame and "Entreprise multisectorielle" in s.text_frame.text:
            tf = s.text_frame
            tf.word_wrap = True
            p0 = tf.paragraphs[0]
            p0.text = "Entreprise multisectorielle & Partenariats"
            p0.font.name = "Aileron Bold"
            p0.font.color.rgb = TEXT_DARK
            
            # Sub text
            new_text = (
                "Intervient en location de véhicules, négoce / import-export, technique, énergies renouvelables, agropastorale et immobilier.\n\n"
                "• Partenaires stratégiques : BESSAC, DM Company, CIM IVOIRE, Southcomp Polaris, Enabel.\n\n"
                "• Valeurs S.A.P.E : Solution pérenne et innovante, Adaptabilité, Priorité client, Efficacité du personnel."
            )
            if len(tf.paragraphs) > 1:
                tf.paragraphs[1].text = new_text
                tf.paragraphs[1].font.size = Pt(15)
                tf.paragraphs[1].font.color.rgb = TEXT_BODY

    # Slide 40 : Ajout des métriques de rentabilité et bilan financier réel
    s40 = prs.slides[39]
    for s in s40.shapes:
        if s.has_text_frame and "Perspectives d’évolution" in s.text_frame.text:
            tf = s.text_frame
            for p in tf.paragraphs:
                if "Bilan" in p.text:
                    p.text = "Bilan financier, ROI & Perspectives"
                    p.font.color.rgb = LOGO_BRAND_GREEN

    # Sauvegarde finale
    prs.save(file_path)
    print(f"SUCCÈS : Présentation mise à jour enregistrée dans '{file_path}'.")

if __name__ == "__main__":
    main()
