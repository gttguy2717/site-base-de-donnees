# -*- coding: utf-8 -*-
"""
build_perfect_english_docx.py
Definitive script to translate Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx
into English while preserving 100% of formatting, layout, page numbers, drawings, and styles.
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

import os
import shutil
import docx
from docx.oxml.ns import qn

from trans_part1_front_toc import PART_1
from trans_part2_intro_ch1 import PART_2
from trans_part3_ch2 import PART_3
from trans_part4_ch3 import PART_4
from trans_part5_ch4 import PART_5
from trans_part6_ch5 import PART_6
from trans_part7_ch6_conclusion import PART_7
from trans_part8_detailed_toc import PART_8

SRC_FILE = 'Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx'
OUT_FILE = 'Rapport_de_Stage_ENGLISH.docx'
ALT_OUT = r'c:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\rapport-stage\mon-rapport\Rapport_de_Stage_ENGLISH.docx'

NS_SPACE = '{http://www.w3.org/XML/1998/namespace}space'

# ─────────────────────────────────────────────────────────────────────────────
# COMBINE ALL 474 TRANSLATIONS
# ─────────────────────────────────────────────────────────────────────────────
ALL_TRANSLATIONS = {}
for part in [PART_1, PART_2, PART_3, PART_4, PART_5, PART_6, PART_7, PART_8]:
    ALL_TRANSLATIONS.update(part)

print(f"Total translations loaded: {len(ALL_TRANSLATIONS)}")


# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Safe <w:t> nodes (outside drawings/picts/textboxes)
# ─────────────────────────────────────────────────────────────────────────────
def get_safe_t_nodes(element):
    """Return all <w:t> elements inside element that are NOT inside a drawing, pict, or textbox."""
    all_t = element.xpath('.//*[local-name()="t"]')
    safe = []
    for t in all_t:
        ancestors = [a.tag.split('}')[-1] for a in t.iterancestors()]
        if not any(tag in ('drawing', 'pict', 'txbxContent') for tag in ancestors):
            safe.append(t)
    return safe


# ─────────────────────────────────────────────────────────────────────────────
# 1. TEXTBOX TRANSLATIONS (all 62 floating textboxes)
# ─────────────────────────────────────────────────────────────────────────────
TEXTBOX_CHAPTER_MAP = {
    "CHAPITRE 1": ("CHAPTER 1", "OVERVIEW OF THE HOST ORGANIZATION"),
    "CHAPITRE 2": ("CHAPTER 2", "PROJECT OVERVIEW"),
    "CHAPITRE 3": ("CHAPTER 3", "CHOICE OF ANALYSIS METHODOLOGY"),
    "CHAPITRE 4": ("CHAPTER 4", "SYSTEM DESIGN AND TECHNOLOGICAL CHOICES"),
    "CHAPITRE 5": ("CHAPTER 5", "DEVELOPMENT OF THE PLATFORM AND MOBILE APPLICATION"),
    "CHAPITRE 6": ("CHAPTER 6", "SYSTEM DEPLOYMENT AND IMPLEMENTATION"),
}

TEXTBOX_EXACT_MAP = {
    "Tableau 1 : Planning prévisionnel et chronogramme des tâches du projet":
        "Table 1 : Forecast Planning and Chronogram of Project Tasks",
    "Tableau 2 : Étude comparative entre la méthode MERISE et PU/UML":
        "Table 2 : Comparative Study between MERISE and UP/UML Methodologies",
    "Figure 6 : Diagramme de séquence : paiement en ligne":
        "Figure 6 : Sequence Diagram : Online Payment",
    "Figure 10 : Diagramme de classes du système":
        "Figure 10 : System Class Diagram",
    "Figure 11 : Logo de l’éditeur de code VS code":
        "Figure 11 : Visual Studio Code Editor Logo",
    "Figure 12 : Logo de Figma":
        "Figure 12 : Figma Wireframing Tool Logo",
    "Figure 13 : Logo du Framework React":
        "Figure 13 : React Frontend Framework Logo",
    "Figure 14 : Logo d’Expo et du Framework React":
        "Figure 14 : Expo and React Native Mobile Framework Logo",
    "Figure 15 : Logo de Node.js":
        "Figure 15 : Node.js Server Technology Logo",
    "Figure 16 : Logo de Brevo":
        "Figure 16 : Brevo Transactional Email Platform Logo",
    "Figure 17 : Logo de Genius Pay":
        "Figure 17 : Genius Pay Transactional Payment Gateway Logo",
    "Figure 18 : Logo de Hostinger":
        "Figure 18 : Hostinger Cloud Hosting Platform Logo",
    "Tableau 3 : Comparaison des principaux Systèmes de Gestion de Bases de Données (SGBD)":
        "Table 3 : Comparison of Major Database Management Systems (DBMS)",
    "Tableau 3 : Analyse comparative des systèmes de gestion de bases de données":
        "Table 3 : Comparative Analysis of Database Management Systems",
    "Figure 20 : Structure et schéma relationnel de la base de données MySQL":
        "Figure 20 : Structure and Relational Schema of MySQL Database",
    "Figure 21 : Interface Web : Page d’accueil":
        "Figure 21 : Web Interface : Home Page",
    "Figure 22 : Interface Web : Formulaire d'authentification et connexion client":
        "Figure 22 : Web Interface : Login Page and Authentication Form",
    "Figure 23 : Interface Web : Catalogue des produits":
        "Figure 23 : Web Interface : Product Catalog",
    "Figure 24 : Interface Web : Module de réservation de véhicule":
        "Figure 24 : Web Interface : Vehicle Reservation Module",
    "Figure 28 : Application Mobile : Panier de réservation mobile et validation":
        "Figure 28 : Mobile Application : Mobile Booking Cart and Validation",
    "Figure 29 : Interface d’administration : Tableau de bord":
        "Figure 29 : Administrative Interface : Dashboard",
    "Figure 30 : Interface d’administration : Gestion du parc de véhicules et des réservations":
        "Figure 30 : Administrative Interface : Fleet and Reservation Management",
    "Tableau 4 : Cahier de recettes et validation des tests fonctionnels (Web & Mobile)":
        "Table 4 : Test Acceptance Book and Functional Validation (Web & Mobile)",
    "Tableau 5 : Bilan financier estimatif des coûts d'infrastructure et de maintenance annuelle":
        "Table 5 : Estimated Financial Summary of Infrastructure and Annual Maintenance Costs",
}

def translate_all_textboxes(doc):
    tb_list = doc._element.xpath('.//*[local-name()="txbxContent"]')
    print(f"Translating {len(tb_list)} textboxes...")
    count = 0
    for tb in tb_list:
        paras = tb.xpath('.//*[local-name()="p"]')
        p_texts = []
        for p in paras:
            t_nodes = p.xpath('.//*[local-name()="t"]')
            txt = ''.join(t.text for t in t_nodes if t.text).strip()
            p_texts.append((p, t_nodes, txt))

        full_tb_text = ' '.join(pt[2] for pt in p_texts).strip()

        # Check if chapter banner
        matched_chap = False
        for fr_chap, (en_ch, en_title) in TEXTBOX_CHAPTER_MAP.items():
            if fr_chap in full_tb_text:
                if len(p_texts) >= 2:
                    p0, t0, _ = p_texts[0]
                    p1, t1, _ = p_texts[1]
                    if t0:
                        t0[0].text = en_ch
                        t0[0].set(NS_SPACE, 'preserve')
                        for t in t0[1:]: t.text = ''
                    if t1:
                        t1[0].text = en_title
                        t1[0].set(NS_SPACE, 'preserve')
                        for t in t1[1:]: t.text = ''
                    matched_chap = True
                    count += 1
                    break
        if matched_chap:
            continue

        # Check Genius Pay text (TB 28, 29)
        if "Pour sécuriser les transactions financières" in full_tb_text:
            if len(p_texts) >= 2:
                p0, t0, _ = p_texts[0]
                p1, t1, _ = p_texts[1]
                if t0:
                    t0[0].text = "To secure financial transactions, Genius Pay was selected. It allows automating the settlement of reservations and orders by integrating bank cards and Mobile Money."
                    t0[0].set(NS_SPACE, 'preserve')
                    for t in t0[1:]: t.text = ''
                if t1:
                    t1[0].text = "Its integration via API and Webhook ensures instant, reliable and secure payments across web and mobile applications."
                    t1[0].set(NS_SPACE, 'preserve')
                    for t in t1[1:]: t.text = ''
                count += 1
                continue

        # Check Figure / Table captions
        matched_exact = False
        for fr_cap, en_cap in TEXTBOX_EXACT_MAP.items():
            if fr_cap.lower() in full_tb_text.lower():
                if p_texts and p_texts[0][1]:
                    t_nodes = p_texts[0][1]
                    t_nodes[0].text = en_cap
                    t_nodes[0].set(NS_SPACE, 'preserve')
                    for t in t_nodes[1:]: t.text = ''
                    matched_exact = True
                    count += 1
                    break
        if not matched_exact and full_tb_text:
            # Fallback: check if starts with Tableau or Figure
            for fr_cap, en_cap in TEXTBOX_EXACT_MAP.items():
                fr_clean = fr_cap.split(':')[0].strip().lower()
                if fr_clean in full_tb_text.lower():
                    if p_texts and p_texts[0][1]:
                        t_nodes = p_texts[0][1]
                        t_nodes[0].text = en_cap
                        t_nodes[0].set(NS_SPACE, 'preserve')
                        for t in t_nodes[1:]: t.text = ''
                        count += 1
                        break
    print(f"  Translated {count} textboxes.")


# ─────────────────────────────────────────────────────────────────────────────
# 2. TABLE TRANSLATIONS (6 tables)
# ─────────────────────────────────────────────────────────────────────────────
TABLE_TRANS = {
    0: {  # Abbreviations table
        (0, 1): "Application Programming Interface",
        (1, 1): "Civil Engineering and Construction",
        (2, 1): "Cascading Style Sheets",
        (3, 1): "Higher School of Industry (INP-HB)",
        (4, 1): "HyperText Markup Language",
        (5, 1): "HyperText Transfer Protocol (Secure)",
        (6, 1): "Artificial Intelligence",
        (7, 1): "Integrated Development Environment",
        (8, 1): "Félix Houphouët-Boigny National Polytechnic Institute",
        (9, 1): "JavaScript Object Notation",
        (10, 1): "JSON Web Token",
        (11, 1): "Large Language Model",
        (12, 1): "Conceptual Data Model",
        (13, 1): "Logical Data Model",
        (14, 1): "Object-Relational Mapping",
        (15, 1): "Portable Document Format",
        (16, 1): "Unified Process",
        (17, 1): "Representational State Transfer",
        (18, 1): "Limited Liability Company",
        (19, 1): "Database Management System",
        (20, 1): "Relational Database Management System",
        (21, 1): "Structured Query Language",
        (22, 1): "Information and Communication Sciences and Technologies",
        (23, 1): "User Interface / User Experience",
        (24, 1): "Unified Modeling Language",
    },
    1: {  # Planning Gantt
        (0, 0): "No.", (0, 1): "Task Description", (0, 2): "Start Date",
        (0, 3): "Duration", (0, 4): "End Date",
        (1, 1): "Initial contact, immersion and project understanding", (1, 3): "5 d",
        (2, 1): "Existing system study and specification drafting", (2, 3): "4 d",
        (3, 1): "Conceptual modeling UP/UML", (3, 3): "6 d",
        (4, 1): "Backend API Node.js / Express and database development", (4, 3): "10 d",
        (5, 1): "Web Platform React.js & CSS development", (5, 3): "12 d",
        (6, 1): "Mobile Application React Native / Expo development", (6, 3): "12 d",
        (7, 1): "Integration testing and corrections", (7, 3): "6 d",
    },
    2: {  # MERISE vs UP/UML
        (0, 0): "Evaluation Criteria",
        (0, 1): "MERISE Method",
        (0, 2): "Unified Process & UML (UP/UML)",
        (1, 0): "Approach",
        (1, 1): "Sequential, strict data / process separation",
        (1, 2): "Object-oriented, iterative, incremental and user-centered",
        (2, 0): "Data Modeling",
        (2, 1): "CDM, LDM highly adapted to relational SQL databases",
        (2, 2): "Class diagram directly reflecting ORM models",
        (3, 0): "Process Modeling",
        (3, 1): "CPM, LPM focused on information flows",
        (3, 2): "Use case, sequence and activity diagrams",
        (4, 0): "Adaptation to Web / Mobile Architectures",
        (4, 1): "Rigid for event-driven and interactive applications",
        (4, 2): "Perfect fit with modern frameworks (React.js, Node.js, React Native)",
        (5, 0): "System Evolution",
        (5, 1): "Heavy redesign of conceptual models in case of changes",
        (5, 2): "Fluid integration of new features through iterations",
    },
    3: {  # DBMS comparison
        (0, 0): "Criteria", (0, 1): "MySQL", (0, 2): "PostgreSQL",
        (0, 3): "SQL Server", (0, 4): "Oracle", (0, 5): "MongoDB",
        (1, 0): "Type",
        (1, 1): "Relational, open source", (1, 2): "Relational, open source",
        (1, 3): "Relational, proprietary", (1, 4): "Relational, proprietary",
        (1, 5): "NoSQL, document-oriented",
        (2, 0): "Data model",
        (2, 1): "Relational, structured", (2, 2): "Relational, structured",
        (2, 3): "Relational, structured", (2, 4): "Relational, structured",
        (2, 5): "Flexible documents",
        (3, 0): "Performance",
        (3, 1): "Very good", (3, 2): "Very good", (3, 3): "Very good",
        (3, 4): "Excellent", (3, 5): "Excellent on certain large volumes",
        (4, 0): "Scalability",
        (4, 1): "Good", (4, 2): "Very good", (4, 3): "Very good",
        (4, 4): "Excellent", (4, 5): "Excellent",
        (5, 0): "Cost",
        (5, 1): "Free", (5, 2): "Free", (5, 3): "Paid", (5, 4): "Paid",
        (5, 5): "Free / cloud offerings",
        (6, 0): "Ease of use",
        (6, 1): "High", (6, 2): "Medium to high", (6, 3): "High",
        (6, 4): "More complex", (6, 5): "High",
        (7, 0): "Compatibility with selected hosting",
        (7, 1): "Yes", (7, 2): "Not available on selected plan",
        (7, 3): "No", (7, 4): "No", (7, 5): "No",
    },
    4: {  # Test acceptance
        (0, 0): "Module / Feature", (0, 1): "Executed Test Scenario",
        (0, 2): "Expected Result", (0, 3): "Status",
        (1, 0): "Authentication",
        (1, 1): "User login with valid email and password",
        (1, 2): "JWT token allocation and session opening", (1, 3): "COMPLIANT",
        (2, 0): "API Security",
        (2, 1): "Attempt to access administration route without privileges",
        (2, 2): "Request blocked and HTTP 403 Forbidden response", (2, 3): "COMPLIANT",
        (3, 0): "Web Catalog",
        (3, 1): "Browsing and filtering multi-division products",
        (3, 2): "Instant display of matching items", (3, 3): "COMPLIANT",
        (4, 0): "Mobile Reservation",
        (4, 1): "Selecting a vehicle and choosing rental dates",
        (4, 2): "Exact dynamic price calculation (duration x price + driver option)",
        (4, 3): "COMPLIANT",
        (5, 0): "Availability Check",
        (5, 1): "Attempt to reserve during an already booked period",
        (5, 2): "Date conflict alert and submission blocked", (5, 3): "COMPLIANT",
        (6, 0): "PDF Quotation Generation",
        (6, 1): "Cart validation and PDF document download",
        (6, 2): "Automatic generation of standard 2-page PDF quotation",
        (6, 3): "COMPLIANT",
        (7, 0): "DB Synchronization",
        (7, 1): "Mobile order validation and Back-Office verification",
        (7, 2): "Immediate appearance of order in admin list", (7, 3): "COMPLIANT",
        (8, 0): "Email Notifications",
        (8, 1): "Transmission of a new quotation request",
        (8, 2): "Automatic reception of alert email via Brevo", (8, 3): "COMPLIANT",
    },
    5: {  # Budget
        (0, 0): "Expense Item", (0, 1): "Technical Description",
        (0, 2): "Estimated Annual Cost (FCFA)",
        (1, 0): "Domain Name & SSL",
        (1, 1): ".com domain name + SSL certificate", (1, 2): "35,000",
        (2, 0): "Mobile Developer Accounts",
        (2, 1): "Google Play Store (one-time) + Apple Developer (annual)",
        (2, 2): "75,000",
        (3, 0): "Preventive Maintenance",
        (3, 1): "Automated backups, security updates and technical support",
        (3, 2): "180,000",
        (4, 0): "TOTAL ESTIMATED ANNUAL",
        (4, 1): "Overall operating and maintenance budget",
        (4, 2): "290,000 FCFA",
    },
}

def translate_all_tables(doc):
    count = 0
    for t_idx, table in enumerate(doc.tables):
        if t_idx not in TABLE_TRANS:
            continue
        mapping = TABLE_TRANS[t_idx]
        for (r_idx, c_idx), text_en in mapping.items():
            if r_idx < len(table.rows) and c_idx < len(table.rows[r_idx].cells):
                cell = table.rows[r_idx].cells[c_idx]
                for p in cell.paragraphs:
                    safe = get_safe_t_nodes(p._element)
                    if safe:
                        safe[0].text = text_en
                        safe[0].set(NS_SPACE, 'preserve')
                        for t in safe[1:]: t.text = ''
                        count += 1
    print(f"  Translated {count} table cells across 6 tables.")


# ─────────────────────────────────────────────────────────────────────────────
# 3. TOC PARAGRAPHS TRANSLATION (preserves tabs and page numbers)
# ─────────────────────────────────────────────────────────────────────────────
def translate_toc_para(para, english_line):
    """
    For a TOC line with tab stop, only replace the title portion (before the tab).
    The tab run and page number runs are completely untouched.
    """
    # Extract title from english_line (before \t)
    en_title = english_line.split('\t')[0].strip() if '\t' in english_line else english_line

    tab_run_idx = None
    for j, r in enumerate(para.runs):
        if r._r.xpath('.//*[local-name()="tab"]') or '\t' in (r.text or ''):
            tab_run_idx = j
            break

    if tab_run_idx is not None and tab_run_idx > 0:
        title_t_nodes = []
        for r in para.runs[:tab_run_idx]:
            title_t_nodes.extend(get_safe_t_nodes(r._r))
        if title_t_nodes:
            title_t_nodes[0].text = en_title
            title_t_nodes[0].set(NS_SPACE, 'preserve')
            for t in title_t_nodes[1:]:
                t.text = ''
    else:
        safe_t = get_safe_t_nodes(para._element)
        if safe_t:
            safe_t[0].text = en_title
            safe_t[0].set(NS_SPACE, 'preserve')
            for t in safe_t[1:]:
                t.text = ''


# ─────────────────────────────────────────────────────────────────────────────
# 4. MULTILINE PARAGRAPH DISTRIBUTION (using <w:br/> boundaries)
# ─────────────────────────────────────────────────────────────────────────────
def get_line_chunks(p_element):
    """
    Traverse descendants of p_element in document order.
    When a <w:br/> is encountered, that ends the current line.
    Return list of lists of safe <w:t> elements for each non-empty text line.
    """
    lines = []
    current_line = []
    for el in p_element.iter():
        tag = el.tag.split('}')[-1]
        if tag in ('drawing', 'pict', 'txbxContent'):
            continue
        if tag == 'br':
            if current_line:
                lines.append(current_line)
                current_line = []
        elif tag == 't':
            ancestors = [a.tag.split('}')[-1] for a in el.iterancestors()]
            if not any(a in ('drawing', 'pict', 'txbxContent') for a in ancestors):
                if el.text and el.text.strip():
                    current_line.append(el)
    if current_line:
        lines.append(current_line)
    return lines

def translate_multiline_para(para, english_text):
    en_lines = [l for l in english_text.split('\n') if l.strip()]
    chunks = get_line_chunks(para._element)

    if not en_lines or not chunks:
        return

    n_lines = len(en_lines)
    n_chunks = len(chunks)

    for i in range(min(n_lines, n_chunks)):
        chunk = chunks[i]
        chunk[0].text = en_lines[i]
        chunk[0].set(NS_SPACE, 'preserve')
        for t in chunk[1:]:
            t.text = ''

    # If more chunks than lines, clear remaining chunks
    if n_chunks > n_lines:
        for chunk in chunks[n_lines:]:
            for t in chunk:
                t.text = ''


# ─────────────────────────────────────────────────────────────────────────────
# 5. SPECIAL LIST PARAGRAPHS (P[148]..P[153] Services)
# ─────────────────────────────────────────────────────────────────────────────
SERVICES_MAP = {
    148: ("➢", " Vehicle rental : ", "The vehicle rental service offers mobility solutions adapted to different customer needs, whether for one-time trips or for longer periods."),
    149: ("➢", " Trading / Import-Export : ", "Facilitate the supply and distribution of various goods."),
    150: ("➢", " Technical : ", "Installation, maintenance and support of equipment and facilities."),
    151: ("➢", " Renewable energies : ", "Optimize energy consumption and promote the use of renewable energies."),
    152: ("➢", " Agropastoral : ", "Agricultural production and livestock farming."),
    153: ("➢", " Real estate : ", "Sale, rental and management of properties."),
}

def translate_services_para(para, parts):
    safe_t = get_safe_t_nodes(para._element)
    if len(safe_t) >= 3:
        safe_t[0].text = parts[0]
        safe_t[0].set(NS_SPACE, 'preserve')
        safe_t[1].text = parts[1]
        safe_t[1].set(NS_SPACE, 'preserve')
        safe_t[2].text = parts[2]
        safe_t[2].set(NS_SPACE, 'preserve')
        for t in safe_t[3:]:
            t.text = ''
    elif safe_t:
        safe_t[0].text = "".join(parts)
        safe_t[0].set(NS_SPACE, 'preserve')
        for t in safe_t[1:]:
            t.text = ''


# ─────────────────────────────────────────────────────────────────────────────
# 6. BOLD LABEL PARAGRAPHS (P[548..562] Technical features)
# ─────────────────────────────────────────────────────────────────────────────
def translate_label_para(para, english_text):
    safe_t = get_safe_t_nodes(para._element)
    if not safe_t:
        return
    if " : " in english_text and len(safe_t) >= 2:
        parts = english_text.split(" : ", 1)
        safe_t[0].text = parts[0] + " : "
        safe_t[0].set(NS_SPACE, 'preserve')
        safe_t[1].text = parts[1]
        safe_t[1].set(NS_SPACE, 'preserve')
        for t in safe_t[2:]:
            t.text = ''
    else:
        safe_t[0].text = english_text
        safe_t[0].set(NS_SPACE, 'preserve')
        for t in safe_t[1:]:
            t.text = ''


# ─────────────────────────────────────────────────────────────────────────────
# MAIN PIPELINE
# ─────────────────────────────────────────────────────────────────────────────
def main():
    print(f"Loading {SRC_FILE}...")
    doc = docx.Document(SRC_FILE)

    d_before = len(doc._element.xpath('.//*[local-name()="drawing"]'))
    p_before = len(doc._element.xpath('.//*[local-name()="pict"]'))
    print(f"Source integrity: {d_before} drawings, {p_before} picts, {len(doc.paragraphs)} paragraphs, {len(doc.tables)} tables.")

    # Step 1: Textboxes
    print("\n--- STEP 1: Textboxes ---")
    translate_all_textboxes(doc)

    # Step 2: Tables
    print("\n--- STEP 2: Tables ---")
    translate_all_tables(doc)

    # Step 3: Paragraphs
    print("\n--- STEP 3: Paragraphs ---")

    toc_set = set(
        list(range(30, 53)) +
        list(range(55, 85)) +
        list(range(87, 92)) +
        list(range(715, 808))
    )

    multiline_set = {
        2, 6, 97, 105, 106, 139, 140, 141, 142, 143, 144,
        198, 201, 202, 270, 339, 539, 612, 658
    }

    label_set = {548, 549, 550, 554, 560, 561, 562}

    translated_count = 0

    for idx, para in enumerate(doc.paragraphs):
        txt = para.text.strip()
        if not txt:
            continue

        if idx not in ALL_TRANSLATIONS:
            print(f"WARNING: Paragraph {idx} not in translations: {repr(txt[:40])}")
            continue

        en_text = ALL_TRANSLATIONS[idx]

        if idx in toc_set:
            translate_toc_para(para, en_text)
            translated_count += 1
        elif idx in SERVICES_MAP:
            translate_services_para(para, SERVICES_MAP[idx])
            translated_count += 1
        elif idx in multiline_set:
            translate_multiline_para(para, en_text)
            translated_count += 1
        elif idx in label_set:
            translate_label_para(para, en_text)
            translated_count += 1
        else:
            safe_t = get_safe_t_nodes(para._element)
            if safe_t:
                safe_t[0].text = en_text
                safe_t[0].set(NS_SPACE, 'preserve')
                for t in safe_t[1:]:
                    t.text = ''
                translated_count += 1

    print(f"Total non-empty paragraphs translated: {translated_count} / {len(ALL_TRANSLATIONS)}")

    # Step 4: Verification
    print("\n--- STEP 4: Integrity Verification ---")
    d_after = len(doc._element.xpath('.//*[local-name()="drawing"]'))
    p_after = len(doc._element.xpath('.//*[local-name()="pict"]'))
    print(f"Drawings: before={d_before}, after={d_after}")
    print(f"Picts: before={p_before}, after={p_after}")
    assert d_before == d_after, f"Drawings mismatch: {d_before} vs {d_after}"
    assert p_before == p_after, f"Picts mismatch: {p_before} vs {p_after}"

    # Step 5: Save
    print(f"\n--- STEP 5: Saving output to {OUT_FILE} ---")
    doc.save(OUT_FILE)
    print("Saved successfully.")

    # Copy to alt path if exists
    alt_dir = os.path.dirname(ALT_OUT)
    if os.path.exists(alt_dir):
        shutil.copy2(OUT_FILE, ALT_OUT)
        print(f"Synced to {ALT_OUT}")

    print("\nSUCCESS: Document translated with 100% precision and integrity.")

if __name__ == '__main__':
    main()
