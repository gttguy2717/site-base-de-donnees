# -*- coding: utf-8 -*-
"""
final_english_translation.py
The definitive translation script. Approach:
- Copy the FR source document
- For each non-empty paragraph, ONLY modify <w:t> text content (never add/remove XML nodes)
- Distribute translation lines to matching t-nodes (split by \n, skip empty lines)
- Preserve 100% of document structure: runs, bold/italic, drawings, picts, tabs, line breaks
- Translate textboxes (chapter banners, figure/table labels)
- Translate all 6 tables cell by cell
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')
import json
import shutil
from pathlib import Path
from docx import Document
from docx.oxml.ns import qn

SRC_FILE = 'Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx'
OUT_FILE = 'Rapport_de_Stage_ENGLISH.docx'
ALT_OUT = r'c:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\rapport-stage\mon-rapport\Rapport_de_Stage_ENGLISH.docx'

NS_SPACE = '{http://www.w3.org/XML/1998/namespace}space'

# ─────────────────────────────────────────────────────────────────────────────
# CORE HELPER: get safe <w:t> nodes (outside drawings/picts)
# ─────────────────────────────────────────────────────────────────────────────

def get_safe_t_nodes(element):
    """Return all <w:t> elements that are NOT inside <w:drawing> or <w:pict>."""
    all_t = element.findall('.//' + qn('w:t'))
    safe = []
    for t in all_t:
        parent = t.getparent()
        in_drawing = False
        while parent is not None:
            tag = parent.tag.split('}')[-1] if '}' in parent.tag else parent.tag
            if tag in ('drawing', 'pict', 'object'):
                in_drawing = True
                break
            if tag == 'p':
                break
            parent = parent.getparent()
        if not in_drawing:
            safe.append(t)
    return safe


# ─────────────────────────────────────────────────────────────────────────────
# CORE HELPER: distribute translation text to existing <w:t> nodes
# ─────────────────────────────────────────────────────────────────────────────

def set_translation(element, translation):
    """
    Update <w:t> content within element with the translation.
    Splits on newlines and distributes non-empty lines to safe <w:t> nodes.
    NEVER adds, removes, or restructures any XML element.
    """
    safe_t = get_safe_t_nodes(element)
    if not safe_t:
        return

    # Split into non-empty lines (preserves bullet text per t-node)
    lines = [l for l in translation.split('\n') if l.strip()]

    if not lines:
        for t in safe_t:
            t.text = ''
        return

    # Match lines to t-nodes
    n_lines = len(lines)
    n_nodes = len(safe_t)

    if n_lines == n_nodes:
        # Perfect 1:1 match
        for t, line in zip(safe_t, lines):
            t.text = line
            t.set(NS_SPACE, 'preserve')
    elif n_lines < n_nodes:
        # Fewer lines than nodes: fill first n_lines, clear rest
        for i, t in enumerate(safe_t):
            if i < n_lines:
                t.text = lines[i]
                t.set(NS_SPACE, 'preserve')
            else:
                t.text = ''
    else:
        # More lines than nodes: put first (n_nodes-1) lines individually,
        # join remaining lines into last node
        for i, t in enumerate(safe_t[:-1]):
            t.text = lines[i]
            t.set(NS_SPACE, 'preserve')
        safe_t[-1].text = ' '.join(lines[n_nodes - 1:])
        safe_t[-1].set(NS_SPACE, 'preserve')


# ─────────────────────────────────────────────────────────────────────────────
# TOC PARAGRAPH TRANSLATION (preserves tabs and page numbers)
# ─────────────────────────────────────────────────────────────────────────────

def translate_toc_para(para, english_title):
    """
    For a TOC line with tab stop, only replace the title portion (before the tab).
    The tab run and page number runs are completely untouched.
    """
    # Find first run that contains <w:tab/> (not a text tab char, but the XML element)
    tab_run_idx = None
    for j, r in enumerate(para.runs):
        if r._r.findall('.//' + qn('w:tab')) or '\t' in (r.text or ''):
            tab_run_idx = j
            break

    if tab_run_idx is not None and tab_run_idx > 0:
        # Title portion: runs before the tab run
        # Only update <w:t> nodes in the title runs
        title_t_nodes = []
        for r in para.runs[:tab_run_idx]:
            title_t_nodes.extend(r._r.findall('.//' + qn('w:t')))
        if title_t_nodes:
            title_t_nodes[0].text = english_title
            title_t_nodes[0].set(NS_SPACE, 'preserve')
            for t in title_t_nodes[1:]:
                t.text = ''
    else:
        # No tab found: fallback to updating all safe t-nodes
        safe_t = get_safe_t_nodes(para._element)
        if safe_t:
            safe_t[0].text = english_title
            safe_t[0].set(NS_SPACE, 'preserve')
            for t in safe_t[1:]:
                t.text = ''


# ─────────────────────────────────────────────────────────────────────────────
# TEXTBOX TRANSLATIONS (all 62 floating textboxes)
# ─────────────────────────────────────────────────────────────────────────────

TEXTBOX_TRANSLATIONS = [
    ("CHAPITRE 1", "CHAPTER 1 : OVERVIEW OF THE HOST ORGANIZATION"),
    ("CHAPITRE 2", "CHAPTER 2 : PROJECT OVERVIEW"),
    ("Tableau 1", "Table 1 : Forecast Planning and Chronogram of Project Tasks"),
    ("CHAPITRE 3", "CHAPTER 3 : CHOICE OF ANALYSIS METHODOLOGY"),
    ("Tableau 2", "Table 2 : Comparative Study between MERISE and UP/UML Methodologies"),
    ("Figure 6", "Figure 6 : Sequence Diagram : Secure Online Payment"),
    ("Figure 10", "Figure 10 : System Class Diagram"),
    ("CHAPITRE 4", "CHAPTER 4 : SYSTEM DESIGN AND TECHNOLOGICAL CHOICES"),
    ("Figure 11", "Figure 11 : Visual Studio Code Editor Logo"),
    ("Figure 12", "Figure 12 : Figma UI/UX Design Tool Logo"),
    ("Figure 1 3", "Figure 13 : React.js Frontend Framework Logo"),
    ("Figure 13", "Figure 13 : React.js Frontend Framework Logo"),
    ("Figure 1 4", "Figure 14 : React Native & Expo Mobile Framework Logo"),
    ("Figure 14", "Figure 14 : React Native & Expo Mobile Framework Logo"),
    ("Figure 1 5", "Figure 15 : Node.js & Express Server Technology Logo"),
    ("Figure 15", "Figure 15 : Node.js & Express Server Technology Logo"),
    ("Figure 1 6", "Figure 16 : Brevo Transactional Email Platform Logo"),
    ("Figure 16", "Figure 16 : Brevo Transactional Email Platform Logo"),
    ("Pour sécuriser les transactions", (
        "To secure financial transactions, Genius Pay was selected. It allows automating "
        "the settlement of reservations and orders by integrating bank cards and Mobile Money. "
        "Its integration via API and Webhook ensures instant, reliable and secure payments "
        "across web and mobile applications."
    )),
    ("Figure 1 7", "Figure 17 : Genius Pay Transactional Platform Logo"),
    ("Figure 17", "Figure 17 : Genius Pay Transactional Platform Logo"),
    ("Figure 1 8", "Figure 18 : Hostinger Hosting Platform Logo"),
    ("Figure 18", "Figure 18 : Hostinger Hosting Platform Logo"),
    ("Tableau 3", "Table 3 : Comparative Analysis of Database Management Systems (DBMS)"),
    ("CHAPITRE 5", "CHAPTER 5 : DEVELOPMENT OF THE PLATFORM AND MOBILE APPLICATION"),
    ("Figure  20", "Figure 20 : Structure and Relational Schema of MySQL Database"),
    ("Figure 20", "Figure 20 : Structure and Relational Schema of MySQL Database"),
    ("Figure 2 1", "Figure 21 : Web Interface : Home Page"),
    ("Figure 21", "Figure 21 : Web Interface : Home Page"),
    ("Figure 2 2", "Figure 22 : Web Interface : Login Page and Authentication Form"),
    ("Figure 22", "Figure 22 : Web Interface : Login Page and Authentication Form"),
    ("Figure 2 3", "Figure 23 : Web Interface : Product Catalog"),
    ("Figure 23", "Figure 23 : Web Interface : Product Catalog"),
    ("Figure 2 4", "Figure 24 : Web Interface : Vehicle Reservation Module"),
    ("Figure 24", "Figure 24 : Web Interface : Vehicle Reservation Module"),
    ("Figure 2 8", "Figure 28 : Mobile Application : Mobile Booking Cart"),
    ("Figure 28", "Figure 28 : Mobile Application : Mobile Booking Cart"),
    ("Figure 2 9", "Figure 29 : Administration Interface : Dashboard"),
    ("Figure 29", "Figure 29 : Administration Interface : Dashboard"),
    ("Figure  30", "Figure 30 : Administration Interface : Fleet and Reservation Management"),
    ("Figure 30", "Figure 30 : Administration Interface : Fleet and Reservation Management"),
    ("CHAPITRE 6", "CHAPTER 6 : IMPLEMENTATION"),
    ("Tableau 4", "Table 4 : Test Acceptance Book and Functional Validation (Web & Mobile)"),
    ("Tableau 5", "Table 5 : Estimated Financial Summary of Infrastructure and Annual Maintenance Costs"),
]

def translate_all_textboxes(doc):
    txbx = doc._element.xpath('.//*[local-name()="txbxContent"]')
    count = 0
    for tb in txbx:
        t_nodes = tb.xpath('.//*[local-name()="t"]')
        if not t_nodes:
            continue
        full_text = ' '.join(t.text for t in t_nodes if t.text).strip()
        for pat, rep in TEXTBOX_TRANSLATIONS:
            if pat.lower() in full_text.lower():
                t_nodes[0].text = rep
                t_nodes[0].set(NS_SPACE, 'preserve')
                for t in t_nodes[1:]:
                    t.text = ''
                count += 1
                break
    print(f"  Textboxes translated: {count} / {len(txbx)}")


# ─────────────────────────────────────────────────────────────────────────────
# TABLE TRANSLATIONS (6 tables)
# ─────────────────────────────────────────────────────────────────────────────

TABLE_TRANS = {
    0: {  # Abbreviations: only translate the description column (col 1)
        (0, 1): "Application Programming Interface",
        (1, 1): "Civil Engineering and Construction",
        (2, 1): "Cascading Style Sheets",
        (3, 1): "Higher School of Industry (INP-HB)",
        (4, 1): "HyperText Markup Language",
        (5, 1): "HyperText Transfer Protocol (Secure)",
        (6, 1): "Artificial Intelligence",
        (7, 1): "Integrated Development Environment",
        (8, 1): "National Polytechnic Institute Félix Houphouët-Boigny",
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
    2: {  # MERISE vs UP/UML (6 rows)
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
                    if p.text.strip():
                        set_translation(p._element, text_en)
                    count += 1
    print(f"  Table cells translated: {count}")


# ─────────────────────────────────────────────────────────────────────────────
# CORRECTIONS FOR PARAGRAPHS WHERE TRANSLATION HAS WRONG LINE COUNT
# ─────────────────────────────────────────────────────────────────────────────

# These are the paragraph-specific translations for paragraphs where
# complete_translations.json has wrong line count vs actual t-node count.
# We provide per-t-node text directly.

MANUAL_T_NODE_TRANSLATIONS = {
    # P[141]: 2 t-nodes: [bold_label, normal_desc]
    # CT has 4 lines (including extra header lines not in this paragraph)
    141: [
        "S — Sustainable and innovative solution",
        "The company prioritizes the implementation of sustainable and innovative solutions to effectively respond to the needs of its clients.",
    ],
    142: [
        "A — Adaptability",
        "SOUTARAH GROUP adapts to the different needs of its clients as well as to the changes in its professional environment.",
    ],
    143: [
        "P — Customer priority",
        "Customer satisfaction is an essential element in the design and delivery of the services offered.",
    ],
    144: [
        "E — Staff efficiency",
        "The company values the skills and efficiency of its staff to guarantee the quality of services delivered.",
    ],
    # P[148..153]: 3 t-nodes: [bullet_symbol, bold_label, normal_desc]
    148: ["➢", " Vehicle rental : ", "The vehicle rental service offers mobility solutions adapted to different customer needs, whether for one-time trips or for longer periods."],
    149: ["➢", " Trading / Import-Export : ", "Facilitate the supply and distribution of various goods."],
    150: ["➢", " Technical : ", "The installation, maintenance and support of equipment and installations."],
    151: ["➢", " Renewable energies : ", "Optimize energy consumption and promote the use of renewable energies."],
    152: ["➢", " Agropastoral : ", "Agricultural production and livestock farming."],
    153: ["➢", " Real estate : ", "The sale, rental and management of properties."],
}

def apply_manual_translations(doc):
    for idx, t_texts in MANUAL_T_NODE_TRANSLATIONS.items():
        para = doc.paragraphs[idx]
        safe_t = get_safe_t_nodes(para._element)
        if len(safe_t) >= len(t_texts):
            for i, (t, text) in enumerate(zip(safe_t[:len(t_texts)], t_texts)):
                t.text = text
                t.set(NS_SPACE, 'preserve')
            for t in safe_t[len(t_texts):]:
                t.text = ''
    print(f"  Manual t-node translations applied: {len(MANUAL_T_NODE_TRANSLATIONS)} paragraphs")


# ─────────────────────────────────────────────────────────────────────────────
# GENIUS PAY SECTION TRANSLATIONS (these paragraphs exist in FR but not in EN)
# ─────────────────────────────────────────────────────────────────────────────

GENIUS_PAY_TRANS = {
    558: "3. Secure Online Payment Module (Genius Pay)",
    559: (
        "To secure transactions and automate order fulfillment, the Genius Pay payment gateway "
        "was integrated into the platform. This modern infrastructure replaces manual wire transfers "
        "with instant digital settlements."
    ),
    560: (
        "Infrastructure and Gateway : Our Node.js backend initializes the transaction via the "
        "Genius Pay REST API, establishing a secured checkout session protected by mutual TLS and API keys."
    ),
    561: (
        "Payment methods : The platform accepts bank cards (Visa, Mastercard) and Mobile Money "
        "(Wave, Orange Money, MTN MoMo), offering clients a flexible and adapted payment experience."
    ),
    562: (
        "Payment Validation and Webhook Notifications : Upon completion of bank authentication, "
        "Genius Pay triggers an HTTPS Webhook notification to our server enabling automatic "
        "reservation confirmation and invoice generation."
    ),
}


# ─────────────────────────────────────────────────────────────────────────────
# MAIN PIPELINE
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print(f"Loading {SRC_FILE}...")
    doc = Document(SRC_FILE)

    d_before = len(doc._element.findall('.//' + qn('w:drawing')))
    p_before = len(doc._element.findall('.//' + qn('w:pict')))
    print(f"Initial: {d_before} drawings, {p_before} picts")

    # Step 1: Translate textboxes
    print("Step 1: Translating textboxes...")
    translate_all_textboxes(doc)

    # Step 2: Translate tables
    print("Step 2: Translating tables...")
    translate_all_tables(doc)

    # Step 3: Load paragraph translations
    print("Step 3: Translating paragraphs...")
    with open('complete_translations.json', encoding='utf-8') as f:
        trans_dict = {int(k): v for k, v in json.load(f).items()}

    # TOC paragraph indices
    toc_set = set(
        list(range(30, 53)) +   # Sommaire
        list(range(55, 85)) +   # Liste des figures
        list(range(87, 92)) +   # Liste des tableaux
        list(range(715, 808))   # Table des matières détaillée
    )

    # Paragraphs with manual per-t-node translations (skip in main loop)
    manual_set = set(MANUAL_T_NODE_TRANSLATIONS.keys())

    translated = 0
    skipped_manual = 0
    skipped_toc = 0

    for idx, para in enumerate(doc.paragraphs):
        txt = para.text.strip()
        if not txt:
            continue

        if idx not in trans_dict:
            continue

        translation = trans_dict[idx]

        if idx in manual_set:
            skipped_manual += 1
            continue  # Handled separately

        if idx in toc_set:
            # TOC: extract title part (before \t) and preserve tab+page
            title = translation.split('\t')[0].strip() if '\t' in translation else translation
            translate_toc_para(para, title)
            skipped_toc += 1
            continue

        if idx in GENIUS_PAY_TRANS:
            # Genius Pay sections: use specific translations
            set_translation(para._element, GENIUS_PAY_TRANS[idx])
            translated += 1
            continue

        # Standard paragraph: distribute translation lines to t-nodes
        set_translation(para._element, translation)
        translated += 1

    print(f"  Standard paragraphs translated: {translated}")
    print(f"  TOC paragraphs translated: {skipped_toc}")

    # Step 4: Apply manual per-t-node translations
    print("Step 4: Applying manual t-node translations...")
    apply_manual_translations(doc)

    # Step 5: Verify drawings/picts preserved
    d_after = len(doc._element.findall('.//' + qn('w:drawing')))
    p_after = len(doc._element.findall('.//' + qn('w:pict')))
    print(f"Final: {d_after} drawings, {p_after} picts")
    assert d_before == d_after, f"Drawing count changed: {d_before} → {d_after}"
    assert p_before == p_after, f"Pict count changed: {p_before} → {p_after}"
    print("SUCCESS: 100% of drawings and picts preserved!")

    # Save
    print(f"Saving to {OUT_FILE}...")
    doc.save(OUT_FILE)
    print("Saved.")

    # Sync
    alt_p = Path(ALT_OUT)
    if alt_p.parent.exists():
        shutil.copy2(OUT_FILE, ALT_OUT)
        print(f"Synced to {ALT_OUT}")

    print("DONE.")


if __name__ == '__main__':
    main()
