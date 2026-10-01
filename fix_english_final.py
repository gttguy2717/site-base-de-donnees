# -*- coding: utf-8 -*-
import sys; sys.stdout.reconfigure(encoding='utf-8')
import copy
from lxml import etree
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

INPUT  = 'Rapport_de_Stage_ENGLISH.docx'
OUTPUT = 'Rapport_de_Stage_ENGLISH.docx'


def fix_page_in_para(para, old_n, new_n):
    runs_text = ''.join(r.text for r in para.runs)
    patterns = [
        (f'\u00a0-\u00a0{old_n}\u00a0-', f'\u00a0-\u00a0{new_n}\u00a0-'),
        (f' - {old_n} -', f' - {new_n} -'),
        (f'- {old_n} -', f'- {new_n} -'),
        (f'- {old_n} \u2013', f'- {new_n} -'),  # em dash variant
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
            r.text = new_text[offset:offset + l]
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


def fix_by_index(doc, idx, old_n, new_n):
    para = doc.paragraphs[idx]
    if fix_page_in_para(para, old_n, new_n):
        print(f'  Fixed [{idx}]: {para.text[:80]}')
        return True
    # Try replacing in raw text
    text = para.text
    # Replace all variants
    for variant in [f'- {old_n} \u2013', f'- {old_n} -', f'\u00a0-\u00a0{old_n}\u00a0-']:
        if variant in text:
            new_variant = f' - {new_n} -'
            if para.runs:
                full = ''.join(r.text for r in para.runs)
                new_full = full.replace(variant, new_variant, 1)
                if new_full != full:
                    first = True
                    for r in para.runs:
                        if first:
                            r.text = new_full
                            first = False
                        else:
                            r.text = ''
                    print(f'  Fixed (variant) [{idx}]: {para.text[:80]}')
                    return True
    print(f'  WARN: could not fix [{idx}]: {para.text[:80]}')
    return False


def main():
    print(f'Loading {INPUT}...')
    doc = Document(INPUT)

    print()
    print('=== Step 1: Fix remaining page numbers by index ===')

    # Para 760: wrongly placed Genius Pay entry (before items 1 and 2) - REMOVE it
    # It should only appear ONCE after para 762 (Brevo/SMTP line)
    # Let's remove para 760 first then re-insert correctly

    # First, find exact paragraphs
    target_paras = {}
    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        # Find the wrong early Genius Pay entry in TOC
        if i < 720 and 'Secure Online Payment Module' in text and '- 47 -' in text:
            target_paras['wrong_gp'] = i
        # Find remaining corrections
        if 'Multi-Item Shopping Cart' in text and '- 48 -' in text:
            target_paras['multi_cart'] = i
        if 'Customer Portal and Request Tracking' in text and '- 49 -' in text:
            target_paras['cust_portal'] = i
        if 'IV. Implementation of Mobile' in text and '- 49 -' in text:
            target_paras['iv_mobile'] = i
        if 'Mobile Shopping Cart' in text and '- 50 -' in text:
            target_paras['mobile_cart'] = i
        if 'Fleet and Reservation Management' in text and '- 51 -' in text:
            target_paras['fleet'] = i
        if 'Annual Hosting and Operational' in text and '- 53 -' in text:
            target_paras['hosting'] = i
        if 'BIBLIOGRAPHY' in text and ('56' in text):
            if '\u2013' in text or '- 56 -' in text:
                target_paras['biblio'] = i
        if 'Academic Reference Books' in text and '- 56 -' in text:
            target_paras['academic'] = i
        # Table 4
        if 'Table 4' in text and 'Test Acceptance' in text and '- 52 -' in text:
            target_paras['table4'] = i

    print('Found targets:', target_paras)

    # Remove wrong early Genius Pay entry if found
    if 'wrong_gp' in target_paras:
        idx = target_paras['wrong_gp']
        para = doc.paragraphs[idx]
        el = para._element
        el.getparent().remove(el)
        print(f'  Removed wrong early Genius Pay TOC entry at [{idx}]')
        # Adjust indices
        for k in target_paras:
            if target_paras[k] > idx:
                target_paras[k] -= 1

    # Now apply all remaining fixes
    fixes = [
        ('multi_cart',  '48', '50'),
        ('cust_portal', '49', '50'),
        ('iv_mobile',   '49', '51'),
        ('mobile_cart', '50', '52'),
        ('fleet',       '51', '53'),
        ('hosting',     '53', '55'),
        ('table4',      '52', '55'),
    ]

    for key, old_n, new_n in fixes:
        if key in target_paras:
            fix_by_index(doc, target_paras[key], old_n, new_n)
        else:
            print(f'  WARN: {key} not found')

    # Fix BIBLIOGRAPHY with em-dash variant
    if 'biblio' in target_paras:
        idx = target_paras['biblio']
        para = doc.paragraphs[idx]
        text_raw = ''.join(r.text for r in para.runs)
        # Replace any variant of - 56 with - 58
        import re
        new_text = re.sub(r'-\s*56\s*[-\u2013]', '- 58 -', text_raw)
        if new_text != text_raw:
            first = True
            for r in para.runs:
                if first:
                    r.text = new_text
                    first = False
                else:
                    r.text = ''
            print(f'  Fixed BIBLIOGRAPHY: {para.text[:80]}')

    if 'academic' in target_paras:
        fix_by_index(doc, target_paras['academic'], '56', '58')

    print()
    print('=== Step 2: Also fix Genius Pay TOC entry position ===')
    # The Genius Pay entry should come AFTER item 2 (Brevo/SMTP) not before item 1
    # Check current state
    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        if 'Secure Online Payment Module' in text and 'Genius Pay' in text and '- ' in text:
            print(f'  Found Genius Pay TOC at [{i}]: {text[:80]}')

    print()
    print('=== Step 3: Save ===')
    doc.save(OUTPUT)
    print(f'Saved to {OUTPUT}')

    # Final verification
    print()
    print('=== FINAL VERIFICATION ===')
    doc2 = Document(OUTPUT)
    print('LOT entries:')
    in_lot = False
    for para in doc2.paragraphs:
        text = para.text.strip()
        if 'LIST OF TABLES' in text.upper() and len(text) < 25:
            in_lot = True
            continue
        if in_lot and ('LIST OF' in text.upper() or 'ABBREVI' in text.upper()):
            in_lot = False
        if in_lot and 'Table' in text:
            print(f'  {text[:90]}')

    print()
    print('Key TOC entries (748-790):')
    for i in range(748, 793):
        if i >= len(doc2.paragraphs): break
        t = doc2.paragraphs[i].text.strip()
        if t:
            print(f'  [{i}] {t[:100]}')


if __name__ == '__main__':
    main()
