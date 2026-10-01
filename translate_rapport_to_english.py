# -*- coding: utf-8 -*-
"""
Script de traduction du rapport de stage FR -> EN
Preserve: images, formatting, styles, tables, headers/footers
"""

import shutil
import time
import re
import sys
from pathlib import Path
from docx import Document
from docx.oxml.ns import qn
from deep_translator import GoogleTranslator

# Force unbuffered output
import functools
print = functools.partial(print, flush=True)

# ─────────────── CONFIG ───────────────
SRC = Path(r"c:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\site-soutarah\Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx")
DST = SRC.parent / "Rapport_de_Stage_SORHO_DAVID_SOUTARAH_ENGLISH.docx"

translator = GoogleTranslator(source='fr', target='en')
_cache = {}

def should_skip(text: str) -> bool:
    t = text.strip()
    if not t or len(t) < 3:
        return True
    # Only digits/dates/codes/numbers
    if re.match(r'^[\d\s/\-:.,;%]+$', t):
        return True
    # Short uppercase acronyms (no spaces)
    if re.match(r'^[A-Z0-9\-/\.]{1,12}$', t):
        return True
    # Already English (basic check - no French diacritics or French words)
    french_indicators = ['é','è','ê','à','â','î','ô','û','ù','ç','œ','æ']
    french_words = ['de','du','des','le','la','les','un','une','et','en','au','aux',
                    'par','pour','sur','dans','avec','sans','que','qui','est','sont',
                    'ce','se','sa','son','ses','leur','leurs','nous','vous','ils','elles',
                    'je','tu','il','elle','on','mais','ou','donc','ni','car','si',
                    'cette','cet','ces','mon','ton','notre','votre']
    lower = t.lower()
    has_french = any(c in t for c in french_indicators)
    words = lower.split()
    french_word_count = sum(1 for w in words if w in french_words)
    if not has_french and french_word_count == 0:
        return True  # likely already English or a name
    return False

def translate_text(text: str) -> str:
    if not text or not text.strip():
        return text
    stripped = text.strip()
    if should_skip(stripped):
        return text

    if stripped in _cache:
        cached = _cache[stripped]
        return text.replace(stripped, cached)

    for attempt in range(3):
        try:
            translated = translator.translate(stripped)
            if translated and translated != stripped:
                _cache[stripped] = translated
                leading = len(text) - len(text.lstrip())
                result = text[:leading] + translated
                return result
            elif translated == stripped:
                _cache[stripped] = translated
                return text
        except Exception as e:
            print(f"  [Retry {attempt+1}/3] {e}")
            time.sleep(3 * (attempt + 1))
    
    print(f"  [FAIL] Could not translate: {stripped[:50]}...")
    return text

def translate_paragraph(para):
    runs = para.runs
    if not runs:
        return
    full_text = "".join(r.text for r in runs)
    if not full_text.strip() or should_skip(full_text.strip()):
        return

    translated = translate_text(full_text)
    if translated == full_text:
        return

    # Check which runs have drawings/images
    run_has_drawing = [
        r._r.find(qn('w:drawing')) is not None or r._r.find(qn('w:pict')) is not None
        for r in runs
    ]

    if len(runs) == 1:
        if not run_has_drawing[0]:
            runs[0].text = translated
    else:
        text_placed = False
        for i, r in enumerate(runs):
            if run_has_drawing[i]:
                continue
            if not text_placed:
                r.text = translated
                text_placed = True
            else:
                r.text = ""

def translate_table(table):
    for row in table.rows:
        for cell in row.cells:
            for para in cell.paragraphs:
                try:
                    translate_paragraph(para)
                except Exception as e:
                    print(f"  [cell ERR] {e}")
            for sub in cell.tables:
                translate_table(sub)

def main():
    print("============================================================")
    print("  RAPPORT TRANSLATION FR -> EN")
    print("============================================================")
    print(f"Source: {SRC.name}")
    print(f"Dest:   {DST.name}")

    if not SRC.exists():
        print(f"ERROR: Source not found: {SRC}")
        return

    print("\nCopying source file...")
    shutil.copy2(SRC, DST)
    print(f"Copied OK ({DST.stat().st_size/1024/1024:.1f} MB)")

    print("Opening document...")
    doc = Document(DST)

    paras = doc.paragraphs
    tables = doc.tables
    print(f"Document has {len(paras)} paragraphs, {len(tables)} tables\n")

    # ── Translate body paragraphs ──
    print(f"--- Translating paragraphs ---")
    for i, para in enumerate(paras):
        if i % 10 == 0:
            print(f"  Para {i+1}/{len(paras)}...")
        try:
            translate_paragraph(para)
        except Exception as e:
            print(f"  [ERR para {i}] {e}")
        time.sleep(0.03)

    # ── Translate tables ──
    print(f"\n--- Translating {len(tables)} tables ---")
    for i, table in enumerate(tables):
        print(f"  Table {i+1}/{len(tables)}...")
        try:
            translate_table(table)
        except Exception as e:
            print(f"  [ERR table {i}] {e}")
        time.sleep(0.05)

    # ── Headers & Footers ──
    print("\n--- Translating headers/footers ---")
    for section in doc.sections:
        for hf_name in ['header', 'footer', 'first_page_header', 'first_page_footer']:
            hf = getattr(section, hf_name, None)
            if hf:
                for para in hf.paragraphs:
                    try:
                        translate_paragraph(para)
                    except Exception as e:
                        print(f"  [ERR {hf_name}] {e}")
                for t in hf.tables:
                    try:
                        translate_table(t)
                    except Exception as e:
                        print(f"  [ERR {hf_name} table] {e}")

    # ── Save ──
    print("\nSaving translated document...")
    doc.save(DST)
    print(f"\nDONE! -> {DST.name}")
    print(f"Size: {DST.stat().st_size/1024/1024:.1f} MB")
    print(f"Cache hits: {len(_cache)} unique translations")

if __name__ == "__main__":
    main()
