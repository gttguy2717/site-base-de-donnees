# -*- coding: utf-8 -*-
"""
fix_english_doc.py
1. Supprime l'entrée Genius Pay mal insérée dans la Liste des Figures
2. Corrige les numéros de pages restants dans LOF, LOT, TOC
3. Ajoute l'entrée Genius Pay au bon endroit dans la Table des Matières
"""
import sys; sys.stdout.reconfigure(encoding='utf-8')
import copy
from lxml import etree
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

INPUT  = 'Rapport_de_Stage_ENGLISH.docx'
OUTPUT = 'Rapport_de_Stage_ENGLISH.docx'


def remove_para(doc, idx):
    """Remove paragraph at index idx."""
    para = doc.paragraphs[idx]
    el = para._element
    el.getparent().remove(el)
    print(f'  Removed para [{idx}]: {para.text[:60]}')


def fix_page_in_para(para, old_n, new_n):
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


def main():
    print(f'Loading {INPUT} ...')
    doc = Document(INPUT)

    # ── STEP 1: Remove wrongly inserted LOF entry (para 77) ──
    # Find it: text contains "3. Secure Online Payment Module (Genius Pay)" AND "- 47 -" AND is NOT in the body
    print()
    print('Step 1: Removing wrong LOF entry...')
    to_remove_idx = []
    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        if ('Secure Online Payment Module' in text and
                ('Genius Pay' in text) and
                '- ' in text and
                ('Figure' not in text)):
            # This is the wrong LOF entry - BUT only if it's in the LOF section (before para 100)
            if i < 120:
                to_remove_idx.append(i)
                print(f'  Found wrong LOF entry at [{i}]: {text[:80]}')

    # Remove in reverse order to preserve indices
    for idx in sorted(to_remove_idx, reverse=True):
        para = doc.paragraphs[idx]
        el = para._element
        el.getparent().remove(el)
        print(f'  Removed para [{idx}]')

    # ── STEP 2: Reload and apply all page number fixes ──
    print()
    print('Step 2: Fixing page numbers in LOF, LOT, TOC...')

    # All fixes: (fragment, old_num, new_num)
    ALL_FIXES = [
        # LIST OF FIGURES
        ('Figure 20', '46', '47'),   # Home page
        ('Figure 20', '47', '48'),   # Home page (after Genius Pay shift)
        ('Figure 21', '46', '47'),
        ('Figure 21', '47', '48'),
        ('Figure 22', '47', '48'),
        ('Figure 22', '48', '49'),
        ('Figure 23', '47', '48'),
        ('Figure 23', '48', '49'),
        ('Figure 24', '48', '49'),
        ('Figure 24', '49', '50'),
        ('Figure 25', '49', '50'),
        ('Figure 26', '50', '51'),
        ('Figure 27', '51', '52'),
        ('Figure 27', '50', '52'),
        ('Figure 28', '51', '52'),
        ('Figure 28', '50', '52'),
        ('Figure 29', '51', '52'),
        ('Figure 29', '52', '53'),

        # LIST OF TABLES
        ('Table 4', '53', '55'),
        ('Table 4', '54', '55'),
        ('Table 5', '53', '55'),
        ('Table 5', '54', '55'),

        # TABLE OF CONTENTS / DETAILED TABLE
        ('III. IMPLEMENTATION OF WEB PLATFORM', '46', '48'),
        ('III. IMPLEMENTATION OF WEB PLATFORM', '47', '48'),
        ('Home and Authentication', '46', '48'),
        ('Home and Authentication', '47', '48'),
        ('Product Catalog', '47', '49'),
        ('Product Catalog', '48', '49'),
        ('Vehicle Reservation', '48', '49'),
        ('Vehicle Reservation', '49', '49'),
        ('Multi-Item Cart', '48', '50'),
        ('Multi-Item Cart', '49', '50'),
        ('Client Portal', '49', '50'),
        ('Client Portal', '50', '50'),
        ('IV. IMPLEMENTATION OF THE MOBILE', '49', '51'),
        ('IV. IMPLEMENTATION OF THE MOBILE', '50', '51'),
        ('Home Screen and Detailed', '49', '51'),
        ('Home Screen and Detailed', '50', '51'),
        ('Mobile Cart', '50', '52'),
        ('Mobile Cart', '51', '52'),
        ('V. IMPLEMENTATION OF THE ADMINISTRATIVE', '51', '52'),
        ('V. IMPLEMENTATION OF THE ADMINISTRATIVE', '52', '52'),
        ('Dashboard', '51', '52'),
        ('Fleet and Reservation Management', '52', '53'),
        ('Fleet and Reservation', '52', '53'),
        ('Chapter 6', '52', '54'),
        ('Chapter 6', '53', '54'),
        ('FUNCTIONAL TESTING', '52', '54'),
        ('FUNCTIONAL TESTING', '53', '54'),
        ('FINANCIAL ASSESSMENT', '53', '55'),
        ('FINANCIAL ASSESSMENT', '54', '55'),
        ('Hardware and Software', '53', '55'),
        ('Hardware and Software', '54', '55'),
        ('Hosting and Maintenance', '53', '55'),
        ('Hosting and Maintenance', '54', '55'),
        ('Profitability', '54', '56'),
        ('Profitability', '55', '56'),
        ('Perspectives', '54', '56'),
        ('Perspectives', '55', '56'),
        ('GENERAL CONCLUSION', '55', '57'),
        ('GENERAL CONCLUSION', '56', '57'),
        ('BIBLIOGRAPHY', '56', '58'),
        ('BIBLIOGRAPHY', '57', '58'),
        ('Textbooks', '56', '58'),
        ('Textbooks', '57', '58'),
        ('Technical Documentation', '56', '58'),
        ('Technical Documentation', '57', '58'),
        ('WEBOGRAPHY', '57', '59'),
        ('WEBOGRAPHY', '58', '59'),
        ('DETAILED TABLE', '58', '60'),
        ('DETAILED TABLE', '59', '60'),
        ('TABLE OF CONTENTS', '58', '60'),
        ('TABLE OF CONTENTS', '59', '60'),
    ]

    corrections = 0
    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
        for fragment, old_n, new_n in ALL_FIXES:
            if fragment.lower() in text.lower():
                if fix_page_in_para(para, old_n, new_n):
                    print(f'  Fixed: [{text[:60]}] {old_n} -> {new_n}')
                    corrections += 1
                    # Re-read text after fix
                    text = para.text.strip()

    print(f'Total corrections: {corrections}')

    # ── STEP 3: Insert Genius Pay entry in correct TOC locations ──
    print()
    print('Step 3: Inserting Genius Pay TOC entry in correct positions...')

    # Find the Brevo line in detailed TOC (not in LOF)
    # The entry should go after "2. Messaging and Notification Service (Brevo / SMTP)" in the TOC sections
    # and NOT in the LOF section
    inserted = 0
    i = 0
    paragraphs = doc.paragraphs  # re-fetch after changes
    already_inserted = set()

    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        # Only in TOC/Detailed Table sections (para > 30)
        # Look for the Brevo TOC entry
        if i < 30:
            continue
        if ('Messaging and Notification Service' in text or
                ('Brevo' in text and 'SMTP' in text and '- ' in text)) and '- ' in text:
            # Make sure we haven't already inserted after this one
            # Check if next non-empty para already has "Genius Pay"
            next_texts = [doc.paragraphs[j].text.strip() for j in range(i+1, min(i+5, len(doc.paragraphs)))]
            has_genius = any('Genius Pay' in t for t in next_texts)
            if not has_genius:
                # Build insertion
                ref_el = para._element
                parent = ref_el.getparent()
                idx_in_parent = list(parent).index(ref_el)

                p_new = OxmlElement('w:p')
                # Copy paragraph properties
                pPr_src = para._element.find(qn('w:pPr'))
                if pPr_src is not None:
                    p_new.append(copy.deepcopy(pPr_src))
                # Build run
                r_new = OxmlElement('w:r')
                if para.runs:
                    rPr_src = para.runs[0]._element.find(qn('w:rPr'))
                    if rPr_src is not None:
                        r_new.append(copy.deepcopy(rPr_src))
                t_new = OxmlElement('w:t')
                t_new.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
                t_new.text = '3. Secure Online Payment Module (Genius Pay)\t\u00a0-\u00a047\u00a0-'
                r_new.append(t_new)
                p_new.append(r_new)
                parent.insert(idx_in_parent + 1, p_new)
                inserted += 1
                print(f'  Inserted Genius Pay TOC entry after para [{i}]: {text[:60]}')

    print(f'Total insertions: {inserted}')

    # ── STEP 4: Save ──
    print()
    print(f'Saving {OUTPUT} ...')
    doc.save(OUTPUT)
    print('Done!')

    # ── STEP 5: Verification ──
    print()
    print('=== VERIFICATION ===')
    doc2 = Document(OUTPUT)
    print('LOF entries:')
    in_lof = False
    for para in doc2.paragraphs:
        text = para.text.strip()
        if 'LIST OF FIGURES' in text.upper() and len(text) < 25:
            in_lof = True
            continue
        if 'LIST OF TABLES' in text.upper() and len(text) < 25:
            in_lof = False
        if in_lof and 'Figure' in text:
            print(f'  {text[:90]}')

    print()
    print('TOC Genius Pay entry:')
    for para in doc2.paragraphs:
        if 'Genius Pay' in para.text and '- ' in para.text:
            print(f'  {para.text[:90]}')


if __name__ == '__main__':
    main()
