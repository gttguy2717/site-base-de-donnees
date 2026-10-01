# -*- coding: utf-8 -*-
"""
add_genius_pay_english.py
Inserts the Genius Pay section (translated to English) into Rapport_de_Stage_ENGLISH.docx
after the Brevo/SMTP section, matching the French report structure exactly.
Also updates the LIST OF FIGURES, LIST OF TABLES, TABLE OF CONTENTS, and DETAILED TABLE.
"""
import sys; sys.stdout.reconfigure(encoding='utf-8')
import copy
import zipfile
import os
import shutil
from lxml import etree
from docx import Document
from docx.oxml.ns import qn, nsmap
from docx.oxml import OxmlElement
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH

INPUT  = 'Rapport_de_Stage_ENGLISH.docx'
OUTPUT = 'Rapport_de_Stage_ENGLISH.docx'
FR_DOC = 'Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx'

# ─────────────────────────────────────────────────────────────
# Step 1: Add Genius Pay image (image20.png) from FR doc to EN doc
# ─────────────────────────────────────────────────────────────
def copy_genius_pay_image():
    """Extract image20.png from FR doc and inject into EN doc as a new rId."""
    # Extract image20.png from FR docx
    fr_img_data = None
    with zipfile.ZipFile(FR_DOC, 'r') as z:
        if 'word/media/image20.png' in z.namelist():
            fr_img_data = z.read('word/media/image20.png')
            print('Extracted image20.png (Genius Pay logo) from FR doc')
        else:
            print('WARNING: image20.png not found in FR doc')
            return None

    # We'll save to a temp file and add via python-docx part
    tmp_path = 'tmp/genius_pay_logo.png'
    os.makedirs('tmp', exist_ok=True)
    with open(tmp_path, 'wb') as f:
        f.write(fr_img_data)
    return tmp_path


# ─────────────────────────────────────────────────────────────
# Step 2: Build the Genius Pay paragraphs in English
# ─────────────────────────────────────────────────────────────
def make_bold_run(para, text, bold=True, size_pt=None, color=None):
    """Add a run to paragraph with formatting."""
    run = para.add_run(text)
    run.bold = bold
    if size_pt:
        run.font.size = Pt(size_pt)
    if color:
        run.font.color.rgb = RGBColor(*color)
    return run

def make_run(para, text, bold=False, italic=False):
    run = para.add_run(text)
    run.bold = bold
    run.italic = italic
    return run


def insert_genius_pay_section(doc, after_para_idx, genius_pay_img_path):
    """
    Insert the Genius Pay section after the paragraph at after_para_idx.
    This inserts:
      - Empty line
      - '3. Secure Online Payment Module (Genius Pay)' - bold title
      - Intro paragraph
      - Infrastructure bullet
      - Payment methods bullet
      - Validation & notifications bullet
      - Empty line
    """
    # We'll build the XML elements and insert them
    # Get the reference paragraph element
    ref_para = doc.paragraphs[after_para_idx]._element
    parent = ref_para.getparent()
    ref_idx = list(parent).index(ref_para)

    new_elements = []

    # ── Paragraph 1: Empty separator ──
    p_empty = OxmlElement('w:p')
    new_elements.append(p_empty)

    # ── Paragraph 2: Section title "3. Secure Online Payment Module (Genius Pay)" ──
    p_title = OxmlElement('w:p')
    pPr_title = OxmlElement('w:pPr')
    pStyle_title = OxmlElement('w:pStyle')
    pStyle_title.set(qn('w:val'), 'Normal')
    pPr_title.append(pStyle_title)
    p_title.append(pPr_title)
    r_title = OxmlElement('w:r')
    rPr_title = OxmlElement('w:rPr')
    b_el = OxmlElement('w:b')
    rPr_title.append(b_el)
    r_title.append(rPr_title)
    t_title = OxmlElement('w:t')
    t_title.text = '3. Secure Online Payment Module (Genius Pay)'
    r_title.append(t_title)
    p_title.append(r_title)
    new_elements.append(p_title)

    # ── Paragraph 3: Intro sentence ──
    p_intro = OxmlElement('w:p')
    pPr_intro = OxmlElement('w:pPr')
    pStyle_intro = OxmlElement('w:pStyle')
    pStyle_intro.set(qn('w:val'), 'Heading3')
    pPr_intro.append(pStyle_intro)
    p_intro.append(pPr_intro)
    r_intro = OxmlElement('w:r')
    t_intro = OxmlElement('w:t')
    t_intro.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    t_intro.text = ('To secure financial transactions, streamline the checkout process and automate '
                    'reservation and order confirmations, an electronic payment gateway has been integrated '
                    'via Genius Pay\u00a0:')
    r_intro.append(t_intro)
    p_intro.append(r_intro)
    new_elements.append(p_intro)

    # ── Paragraph 4: Infrastructure bullet ──
    p_infra = OxmlElement('w:p')
    pPr_infra = OxmlElement('w:pPr')
    pStyle_infra = OxmlElement('w:pStyle')
    pStyle_infra.set(qn('w:val'), 'Heading3')
    pPr_infra.append(pStyle_infra)
    p_infra.append(pPr_infra)
    # Bold label
    r_label = OxmlElement('w:r')
    rPr_label = OxmlElement('w:rPr')
    r_label.append(rPr_label)
    t_label = OxmlElement('w:t')
    t_label.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    t_label.text = 'Infrastructure and Gateway\u00a0:'
    r_label.append(t_label)
    p_infra.append(r_label)
    # Normal text
    r_body = OxmlElement('w:r')
    rPr_body = OxmlElement('w:rPr')
    b_off = OxmlElement('w:b')
    b_off.set(qn('w:val'), '0')
    rPr_body.append(b_off)
    r_body.append(rPr_body)
    t_body = OxmlElement('w:t')
    t_body.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    t_body.text = ('\u00a0Our Node.js server initialises the transaction via the Genius Pay REST API and '
                   'redirects the client to its secure, encrypted payment gateway (TLS). No sensitive '
                   'banking data ever transits through our servers, ensuring maximum security.')
    r_body.append(t_body)
    p_infra.append(r_body)
    new_elements.append(p_infra)

    # ── Paragraph 5: Payment methods bullet ──
    p_modes = OxmlElement('w:p')
    pPr_modes = OxmlElement('w:pPr')
    pStyle_modes = OxmlElement('w:pStyle')
    pStyle_modes.set(qn('w:val'), 'Heading3')
    pPr_modes.append(pStyle_modes)
    p_modes.append(pPr_modes)
    r_label2 = OxmlElement('w:r')
    t_label2 = OxmlElement('w:t')
    t_label2.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    t_label2.text = 'Payment Methods\u00a0:'
    r_label2.append(t_label2)
    p_modes.append(r_label2)
    r_body2 = OxmlElement('w:r')
    rPr_body2 = OxmlElement('w:rPr')
    b_off2 = OxmlElement('w:b')
    b_off2.set(qn('w:val'), '0')
    rPr_body2.append(b_off2)
    r_body2.append(rPr_body2)
    t_body2 = OxmlElement('w:t')
    t_body2.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    t_body2.text = ('\u00a0The platform accepts bank cards (Visa, Mastercard) as well as local '
                    'Mobile Money solutions (Orange Money, MTN MoMo, Wave). Each transaction is '
                    'protected by strong authentication (OTP/SMS code) before any actual debit.')
    r_body2.append(t_body2)
    p_modes.append(r_body2)
    new_elements.append(p_modes)

    # ── Paragraph 6: Validation & notifications bullet ──
    p_valid = OxmlElement('w:p')
    pPr_valid = OxmlElement('w:pPr')
    pStyle_valid = OxmlElement('w:pStyle')
    pStyle_valid.set(qn('w:val'), 'Heading3')
    pPr_valid.append(pStyle_valid)
    p_valid.append(pPr_valid)
    r_label3 = OxmlElement('w:r')
    t_label3 = OxmlElement('w:t')
    t_label3.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    t_label3.text = 'Validation and Notifications\u00a0:'
    r_label3.append(t_label3)
    p_valid.append(r_label3)
    r_body3 = OxmlElement('w:r')
    rPr_body3 = OxmlElement('w:rPr')
    b_off3 = OxmlElement('w:b')
    b_off3.set(qn('w:val'), '0')
    rPr_body3.append(b_off3)
    r_body3.append(rPr_body3)
    t_body3 = OxmlElement('w:t')
    t_body3.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    t_body3.text = ('\u00a0After bank validation, Genius Pay directly notifies our API via Webhook '
                    'to update the order status to \u201cPAID\u201d in the database. The Brevo service '
                    'immediately dispatches the electronic receipt to the client; in case of decline, '
                    'an alert invites the user to retry.')
    r_body3.append(t_body3)
    p_valid.append(r_body3)
    new_elements.append(p_valid)

    # ── Paragraph 7: Empty line ──
    p_empty2 = OxmlElement('w:p')
    new_elements.append(p_empty2)

    # ── Insert all elements after ref_para ──
    insert_pos = ref_idx + 1
    for i, el in enumerate(new_elements):
        parent.insert(insert_pos + i, el)

    print(f'Inserted {len(new_elements)} paragraphs after para [{after_para_idx}]')
    return len(new_elements)


# ─────────────────────────────────────────────────────────────
# Step 3: Update Table of Contents, List of Figures/Tables
# ─────────────────────────────────────────────────────────────
def fix_page_in_para(para, old_n, new_n):
    """Replace page number in paragraph."""
    runs_text = ''.join(r.text for r in para.runs)
    patterns = [
        (f'\u00a0-\u00a0{old_n}\u00a0-', f'\u00a0-\u00a0{new_n}\u00a0-'),
        (f' - {old_n} -', f' - {new_n} -'),
        (f'- {old_n} -', f'- {new_n} -'),
    ]
    new_text = runs_text
    for old_p, new_p in patterns:
        if old_p in new_text:
            new_text = new_text.replace(old_p, new_p, 1)
            break
    if new_text == runs_text:
        return False
    if len(new_text) == len(runs_text):
        offset = 0
        for r in para.runs:
            l = len(r.text)
            r.text = new_text[offset:offset+l]
            offset += l
    else:
        first = True
        for r in para.runs:
            if first:
                r.text = new_text
                first = False
            else:
                r.text = ''
    return True


def update_toc_and_lists(doc):
    """
    After adding Genius Pay section (~+1 page), update page numbers in TOC/lists.
    The Genius Pay section adds content after page 46 (Brevo section),
    which may push subsequent pages by +1.
    Based on analysis: pages from 47 onwards shift by +1.
    """
    # TOC corrections: sections that now have shifted page numbers
    # (after adding Genius Pay section which adds ~1 page)
    # We also need to insert the Genius Pay entry in the TOC

    toc_fixes = [
        # In Table of Contents (after Brevo, everything from page 47+ shifts +1)
        ('3. Secure Online Payment Module', None, None),  # New entry - will handle separately
        ('IMPLEMENTATION OF WEB PLATFORM', '47', '48'),
        ('Home and Authentication', '47', '48'),
        ('Product Catalog', '48', '49'),
        ('Multi-Item Cart', '49', '50'),
        ('IV. IMPLEMENTATION OF THE MOBILE', '50', '51'),
        ('Home Screen and Detailed', '50', '51'),
        ('Mobile Cart', '51', '52'),
        ('V. IMPLEMENTATION OF THE ADMINISTRATIVE', '52', '52'),
        ('Chapter 6', '53', '54'),
        ('FUNCTIONAL TESTING', '53', '54'),
        ('FINANCIAL ASSESSMENT', '54', '55'),
        ('Hardware and Software', '54', '55'),
        ('Hosting and Maintenance', '54', '55'),
        ('GENERAL CONCLUSION', '56', '57'),
        ('BIBLIOGRAPHY', '57', '58'),
        ('WEBOGRAPHY', '58', '59'),
        ('DETAILED TABLE', '59', '60'),
    ]

    # List of Figures corrections
    lof_fixes = [
        ('Figure 20', '47', '48'),
        ('Figure 22', '48', '49'),
        ('Figure 24', '49', '50'),
        ('Figure 27', '51', '52'),
        ('Figure 29', '52', '53'),
    ]

    # List of Tables corrections
    lot_fixes = [
        ('Table 4', '54', '55'),
        ('Table 5', '54', '55'),
    ]

    all_fixes = toc_fixes + lof_fixes + lot_fixes
    corrections = 0

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
        for fragment, old_n, new_n in all_fixes:
            if fragment.lower() in text.lower() and old_n and new_n:
                if fix_page_in_para(para, old_n, new_n):
                    print(f'  Updated TOC/LOF/LOT: [{text[:60]}] {old_n} -> {new_n}')
                    corrections += 1
                    break

    print(f'Total TOC/LOF/LOT corrections: {corrections}')
    return corrections


def insert_toc_genius_pay_entry(doc):
    """
    Insert '3. Secure Online Payment Module (Genius Pay)....... - 47 -'
    in both the TABLE OF CONTENTS and DETAILED TABLE sections,
    after the Brevo/SMTP entry.
    """
    insertions = 0
    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        # Find the Brevo line in TOC / Detailed TOC
        if ('Messaging and Transactional Notification' in text or
                'Brevo' in text or 'SMTP' in text) and '- ' in text:
            # Insert new entry after this paragraph
            ref_el = para._element
            parent = ref_el.getparent()
            idx = list(parent).index(ref_el)

            p_new = OxmlElement('w:p')
            # Copy pPr from current para
            pPr_src = para._element.find(qn('w:pPr'))
            if pPr_src is not None:
                p_new.append(copy.deepcopy(pPr_src))
            # Add run with text
            r_new = OxmlElement('w:r')
            # Copy rPr from first run if available
            if para.runs:
                rPr_src = para.runs[0]._element.find(qn('w:rPr'))
                if rPr_src is not None:
                    r_new.append(copy.deepcopy(rPr_src))
            t_new = OxmlElement('w:t')
            t_new.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
            t_new.text = '3. Secure Online Payment Module (Genius Pay)\t\u00a0-\u00a047\u00a0-'
            r_new.append(t_new)
            p_new.append(r_new)
            parent.insert(idx + 1, p_new)
            insertions += 1
            print(f'  Inserted Genius Pay TOC entry after para [{i}]: {text[:60]}')

    print(f'Total TOC Genius Pay entries inserted: {insertions}')


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────
def main():
    import copy

    print(f'Loading {INPUT} ...')
    doc = Document(INPUT)

    # Step 1: Get Genius Pay logo image
    genius_pay_img = copy_genius_pay_image()

    # Step 2: Find insertion point (after para 542 = Administrator Alerts line)
    # Para 542: 'Administrator Alerts : Whenever a client adds...'
    # We insert after this paragraph
    insert_after = None
    for i, para in enumerate(doc.paragraphs):
        if 'Administrator Alerts' in para.text and 'vehicle booking' in para.text:
            insert_after = i
            print(f'Found insertion point at para [{i}]: {para.text[:60]}')
            break

    if insert_after is None:
        print('ERROR: Could not find insertion point (Administrator Alerts paragraph)')
        return

    # Step 3: Insert Genius Pay section
    n_inserted = insert_genius_pay_section(doc, insert_after, genius_pay_img)

    # Step 4: Update TOC/LOF/LOT page numbers
    print()
    print('Updating TOC, List of Figures, List of Tables page numbers...')
    update_toc_and_lists(doc)

    # Step 5: Insert Genius Pay entry in TOC
    print()
    print('Inserting Genius Pay entry in Table of Contents...')
    insert_toc_genius_pay_entry(doc)

    # Step 6: Save
    print()
    print(f'Saving to {OUTPUT} ...')
    doc.save(OUTPUT)
    print('Done!')

    # Verify
    doc2 = Document(OUTPUT)
    for i, para in enumerate(doc2.paragraphs):
        if 'Genius Pay' in para.text and 'Secure Online' in para.text:
            print(f'  VERIFY OK: Genius Pay section found at para [{i}]')
            break


if __name__ == '__main__':
    import copy
    main()
