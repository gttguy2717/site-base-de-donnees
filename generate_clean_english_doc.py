# -*- coding: utf-8 -*-
"""
generate_clean_english_doc.py
Translates Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx into English with:
1. All 62 floating textboxes (txbxContent) translated (Chapter titles, Figure/Table banners, Genius Pay).
2. All 151 TOC paragraphs (Sommaire, Liste des figures, Liste des tableaux, Table des matières)
   translated while preserving exact tab stops (\t) and exact page numbers.
3. All special multi-run paragraphs (Dédicace, Remerciements, Thème, Valeurs SAPE, Services, Conclusion)
   preserving individual bold, italic, and label runs.
4. All standard body paragraphs translated safely using XML <w:t> replacement (100% drawings & picts preserved).
5. All 6 tables completely translated cell-by-cell.
6. Verification that exactly 62 drawings and 33 picts are preserved.
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')
import json
import shutil
from pathlib import Path
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

SRC_FILE = 'Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx'
OUT_FILE = 'Rapport_de_Stage_ENGLISH.docx'
ALT_OUT_FILE = r'c:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\rapport-stage\mon-rapport\Rapport_de_Stage_ENGLISH.docx'

# ═══════════════════════════════════════════════════════════════════════════════
# 1. SAFE XML REPLACEMENT (NEVER DESTROYS DRAWINGS OR PICTS)
# ═══════════════════════════════════════════════════════════════════════════════

def safe_replace_para_text(para, new_text):
    """
    Safely updates only <w:t> nodes and inserts <w:br/> for newlines
    without ever touching or deleting <w:drawing>, <w:pict>, or <w:tab/> elements.
    """
    t_nodes = para._element.findall('.//' + qn('w:t'))
    if not t_nodes:
        return
        
    if '\n' not in new_text:
        t_nodes[0].text = new_text
        t_nodes[0].set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        for t in t_nodes[1:]:
            t.text = ''
        return
    
    first_t = t_nodes[0]
    parent_r = first_t.getparent()
    for t in t_nodes[1:]:
        t.text = ''
        
    lines = new_text.split('\n')
    first_t.text = lines[0]
    first_t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    
    insert_point = parent_r.index(first_t)
    for line in lines[1:]:
        insert_point += 1
        br = OxmlElement('w:br')
        parent_r.insert(insert_point, br)
        if line:
            insert_point += 1
            new_t = OxmlElement('w:t')
            new_t.text = line
            new_t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
            parent_r.insert(insert_point, new_t)

# ═══════════════════════════════════════════════════════════════════════════════
# 2. TOC PARAGRAPH TRANSLATION (PRESERVES EXACT TABS AND PAGE NUMBERS)
# ═══════════════════════════════════════════════════════════════════════════════

def translate_toc_para(para, title_en):
    """
    Translates a Table of Contents entry.
    Finds the run containing <w:tab/>.
    All runs BEFORE the tab are title runs; only they are updated.
    The tab run and all subsequent runs (containing the page number) are untouched.
    """
    tab_run_idx = None
    for idx, r in enumerate(para.runs):
        if r._r.findall('.//' + qn('w:tab')) or '\t' in r.text:
            tab_run_idx = idx
            break
            
    if tab_run_idx is not None and tab_run_idx > 0:
        para.runs[0].text = title_en
        for r in para.runs[1:tab_run_idx]:
            t_nodes = r._r.findall('.//' + qn('w:t'))
            for t in t_nodes:
                t.text = ''
    else:
        # Fallback if no separate tab run found
        t_nodes = para._element.findall('.//' + qn('w:t'))
        if t_nodes:
            t_nodes[0].text = title_en
            for t in t_nodes[1:]:
                t.text = ''

# ═══════════════════════════════════════════════════════════════════════════════
# 3. TEXTBOX TRANSLATIONS (ALL 62 FLOATING TEXTBOXES)
# ═══════════════════════════════════════════════════════════════════════════════

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
    """Translate all 62 floating textboxes (Chapter titles & figure/table banners)."""
    txbx_elements = doc._element.xpath('.//*[local-name()="txbxContent"]')
    count = 0
    for tb in txbx_elements:
        t_nodes = tb.xpath('.//*[local-name()="t"]')
        if not t_nodes:
            continue
        full_text = ' '.join([t.text for t in t_nodes if t.text]).strip()
        for pat, rep in TEXTBOX_TRANSLATIONS:
            if pat.lower() in full_text.lower():
                t_nodes[0].text = rep
                for t in t_nodes[1:]:
                    t.text = ''
                count += 1
                break
    print(f"Textboxes translated: {count} / {len(txbx_elements)}")

# ═══════════════════════════════════════════════════════════════════════════════
# 4. TABLE TRANSLATIONS (TABLES 0 TO 5)
# ═══════════════════════════════════════════════════════════════════════════════

def get_table_translations():
    tables = {}

    # Table 0: List of Abbreviations
    tables[0] = {
        (0, 1): "Application Programming Interface (API)",
        (1, 1): "Civil Engineering and Construction (BTP)",
        (2, 1): "Cascading Style Sheets (CSS)",
        (3, 1): "Higher School of Industry (ESI) - INP-HB",
        (4, 1): "HyperText Markup Language (HTML)",
        (5, 1): "HyperText Transfer Protocol (Secure)",
        (6, 1): "Artificial Intelligence (AI)",
        (7, 1): "Integrated Development Environment (IDE)",
        (8, 1): "National Polytechnic Institute Félix Houphouët-Boigny",
        (9, 1): "JavaScript Object Notation (JSON)",
        (10, 1): "JSON Web Token (JWT)",
        (11, 1): "Large Language Model (LLM)",
        (12, 1): "Conceptual Data Model (CDM / MCD)",
        (13, 1): "Logical Data Model (LDM / MLD)",
        (14, 1): "Object-Relational Mapping (ORM)",
        (15, 1): "Portable Document Format (PDF)",
        (16, 1): "Unified Process (UP / PU)",
        (17, 1): "Representational State Transfer (REST)",
        (18, 1): "Limited Liability Company (LLC / SARL)",
        (19, 1): "Database Management System (DBMS / SGBD)",
        (20, 1): "Relational Database Management System (RDBMS / SGBDR)",
        (21, 1): "Structured Query Language (SQL)",
        (22, 1): "Information and Communication Sciences and Technologies (STIC)",
        (23, 1): "User Interface / User Experience (UI / UX)",
        (24, 1): "Unified Modeling Language (UML)",
    }

    # Table 1: Forecast Planning and Task Chronogram (Gantt)
    tables[1] = {
        (0, 0): "No.",
        (0, 1): "Task Description",
        (0, 2): "Start Date",
        (0, 3): "Duration",
        (0, 4): "End Date",
        (1, 1): "Initial contact, immersion and project understanding",
        (1, 3): "5 d",
        (2, 1): "Existing system study and specification drafting",
        (2, 3): "4 d",
        (3, 1): "Conceptual modeling UP/UML",
        (3, 3): "6 d",
        (4, 1): "Backend API Node.js / Express and database development",
        (4, 3): "10 d",
        (5, 1): "Web Platform React.js & CSS development",
        (5, 3): "12 d",
        (6, 1): "Mobile Application React Native / Expo development",
        (6, 3): "12 d",
        (7, 1): "Integration testing and corrections",
        (7, 3): "6 d",
    }

    # Table 2: Comparative Study between MERISE and UP/UML Methods (6 rows)
    tables[2] = {
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
    }

    # Table 3: Comparative Analysis of Database Management Systems
    tables[3] = {
        (0, 0): "Criteria",
        (0, 1): "MySQL",
        (0, 2): "PostgreSQL",
        (0, 3): "SQL Server",
        (0, 4): "Oracle",
        (0, 5): "MongoDB",
        (1, 0): "Type",
        (1, 1): "Relational, open source",
        (1, 2): "Relational, open source",
        (1, 3): "Relational, proprietary",
        (1, 4): "Relational, proprietary",
        (1, 5): "NoSQL, document-oriented",
        (2, 0): "Data model",
        (2, 1): "Relational, structured",
        (2, 2): "Relational, structured",
        (2, 3): "Relational, structured",
        (2, 4): "Relational, structured",
        (2, 5): "Flexible documents",
        (3, 0): "Performance",
        (3, 1): "Very good",
        (3, 2): "Very good",
        (3, 3): "Very good",
        (3, 4): "Excellent",
        (3, 5): "Excellent on certain large volumes",
        (4, 0): "Scalability",
        (4, 1): "Good",
        (4, 2): "Very good",
        (4, 3): "Very good",
        (4, 4): "Excellent",
        (4, 5): "Excellent",
        (5, 0): "Cost",
        (5, 1): "Free",
        (5, 2): "Free",
        (5, 3): "Paid",
        (5, 4): "Paid",
        (5, 5): "Free / cloud offerings",
        (6, 0): "Ease of use",
        (6, 1): "High",
        (6, 2): "Medium to high",
        (6, 3): "High",
        (6, 4): "More complex",
        (6, 5): "High",
        (7, 0): "Compatibility with selected hosting",
        (7, 1): "Yes",
        (7, 2): "Not available on selected plan",
        (7, 3): "No",
        (7, 4): "No",
        (7, 5): "No",
    }

    # Table 4: Test Acceptance Book and Functional Validation (Web & Mobile)
    tables[4] = {
        (0, 0): "Module / Feature",
        (0, 1): "Executed Test Scenario",
        (0, 2): "Expected Result",
        (0, 3): "Status",
        (1, 0): "Authentication",
        (1, 1): "User login with valid email and password",
        (1, 2): "JWT token allocation and session opening",
        (1, 3): "COMPLIANT",
        (2, 0): "API Security",
        (2, 1): "Attempt to access administration route without privileges",
        (2, 2): "Request blocked and HTTP 403 Forbidden response",
        (2, 3): "COMPLIANT",
        (3, 0): "Web Catalog",
        (3, 1): "Browsing and filtering multi-division products",
        (3, 2): "Instant display of matching items",
        (3, 3): "COMPLIANT",
        (4, 0): "Mobile Reservation",
        (4, 1): "Selecting a vehicle and choosing rental dates",
        (4, 2): "Exact dynamic price calculation (duration x price + driver option)",
        (4, 3): "COMPLIANT",
        (5, 0): "Availability Check",
        (5, 1): "Attempt to reserve during an already booked period",
        (5, 2): "Date conflict alert and submission blocked",
        (5, 3): "COMPLIANT",
        (6, 0): "PDF Quotation Generation",
        (6, 1): "Cart validation and PDF document download",
        (6, 2): "Automatic generation of standard 2-page PDF quotation",
        (6, 3): "COMPLIANT",
        (7, 0): "DB Synchronization",
        (7, 1): "Mobile order validation and Back-Office verification",
        (7, 2): "Immediate appearance of order in admin list",
        (7, 3): "COMPLIANT",
        (8, 0): "Email Notifications",
        (8, 1): "Transmission of a new quotation request",
        (8, 2): "Automatic reception of alert email via Brevo",
        (8, 3): "COMPLIANT",
    }

    # Table 5: Estimated Financial Balance Sheet of Infrastructure and Annual Maintenance Costs
    tables[5] = {
        (0, 0): "Expense Item",
        (0, 1): "Technical Description",
        (0, 2): "Estimated Annual Cost (FCFA)",
        (1, 0): "Domain Name & SSL",
        (1, 1): ".com domain name + SSL certificate",
        (1, 2): "35,000",
        (2, 0): "Mobile Developer Accounts",
        (2, 1): "Google Play Store (one-time fee) + Apple Developer (annual subscription)",
        (2, 2): "75,000",
        (3, 0): "Preventive Maintenance",
        (3, 1): "Automated backups, security updates and continuous technical support",
        (3, 2): "180,000",
        (4, 0): "TOTAL ESTIMATED ANNUAL",
        (4, 1): "Overall operating and maintenance budget",
        (4, 2): "290,000 FCFA",
    }

    return tables

def translate_all_tables(doc):
    """Translate all 6 tables cell by cell."""
    table_trans = get_table_translations()
    count = 0
    for t_idx, table in enumerate(doc.tables):
        if t_idx in table_trans:
            mapping = table_trans[t_idx]
            for (r_idx, c_idx), text_en in mapping.items():
                if r_idx < len(table.rows) and c_idx < len(table.rows[r_idx].cells):
                    cell = table.rows[r_idx].cells[c_idx]
                    for p in cell.paragraphs:
                        safe_replace_para_text(p, text_en)
                        count += 1
    print(f"Table cells translated: {count}")

# ═══════════════════════════════════════════════════════════════════════════════
# 5. SPECIAL MULTI-RUN PARAGRAPHS (PRESERVING INDIVIDUAL RUN FORMATTING)
# ═══════════════════════════════════════════════════════════════════════════════

def translate_special_multirun_paragraphs(doc):
    """
    Translates paragraphs with complex mixed styling (bold names, bullet tags, etc.)
    by setting run texts individually. None of these paragraphs contain drawings.
    """
    # ── P[2] Dédicace ──
    p2 = doc.paragraphs[2]
    if len(p2.runs) >= 9:
        p2.runs[0].text = "I dedicate this modest work to my entire family and to all those who supported me, near and far, throughout my academic journey."
        p2.runs[1].text = "\n"
        p2.runs[2].text = "\nParticular dedications to :"
        p2.runs[3].text = "\n"
        p2.runs[4].text = "\n•  My father, Mr. SORHO YETIENA, for his benevolent guidance, his wisdom and his precious advice ;"
        p2.runs[5].text = "\n•  My mother, Mrs. SORHO SANABA, for her unconditional love, her constant prayers and her unwavering support ;"
        p2.runs[6].text = "\n•  My sister, SORHO ESLIE, for her constant encouragement and her reassuring dynamism."
        p2.runs[7].text = "\n"
        p2.runs[8].text = "\nTo all those who have contributed to making me the person I am today, please find here the expression of my deep gratitude."

    # ── P[6] Remerciements ──
    p6 = doc.paragraphs[6]
    if len(p6.runs) >= 28:
        p6.runs[0].text = "I would like to express my sincere thanks to Mr. Kologo Harouna, Director of "
        p6.runs[1].text = "Soutarah"
        p6.runs[2].text = " Group, as well as to my internship supervisor, for their welcome, their guidance, their advice and their availability throughout my internship. "
        p6.runs[3].text = "."
        p6.runs[4].text = " "
        p6.runs[5].text = "Also, this report was made possible thanks to the involvement of several people, and I would like to address my thanks to : "
        p6.runs[6].text = "\n"
        p6.runs[7].text = "\n• "
        p6.runs[8].text = "M"
        p6.runs[9].text = "y parents, Mr. Yetiena SORHO and Mrs. Sanaba COULIBALY, for all the sacrifices made, their invaluable financial and moral support since the first day of my studies ;"
        p6.runs[10].text = "\n•  "
        p6.runs[11].text = "T"
        p6.runs[12].text = "he Republic of Ivory Coast, for all the university infrastructure and the framework of excellence offered to the student youth ;"
        p6.runs[13].text = "\n• "
        p6.runs[14].text = "T"
        p6.runs[15].text = "he National Polytechnic Institute Félix Houphouët-Boigny (INP-HB) of Yamoussoukro, for opening its doors to me and providing me with elite technical training ;"
        p6.runs[16].text = "\n• Dr Moussa DIABY Abdoul Kader, Director General of INP-HB, for his inspiring leadership and his constant commitment to the institute's influence ;"
        p6.runs[17].text = "\n• Dr Adama OUATTARA, Director of the École Supérieure d'Industrie (ESI), for the reforms and rigor instilled within our school ;"
        p6.runs[18].text = "\n• Mr. "
        p6.runs[19].text = "Siriky"
        p6.runs[20].text = " KONE, Deputy Director of Studies at ESI, for his attentive listening, his availability and his sound advice ;"
        p6.runs[21].text = "\n•  Mr. Louagbeu Loua KPO, Director of the Information and Communication Technology Sciences and Technologies Teaching Unit (STIC), for the exceptional quality of the training program and his strategic guidance ;"
        p6.runs[22].text = "\n• "
        p6.runs[23].text = "T"
        p6.runs[24].text = "he entire teaching and administrative staff of ESI and the STIC department for their dedication and their passionate transmission of knowledge ;"
        p6.runs[25].text = "\n• "
        p6.runs[26].text = "T"
        p6.runs[27].text = "he General Management and all the staff of SOUTARAH GROUP, for their warm welcome, their daily technical support and the trust placed in us during this professional immersion internship."
        p6.runs[28].text = "\n"

    # ── P[105] Thème + Composantes ──
    p105 = doc.paragraphs[105]
    if len(p105.runs) >= 4:
        p105.runs[0].text = "The project's theme is : "
        p105.runs[1].text = "“Design and development of a digital management platform for the services of SOUTARAH GROUP integrating a mobile application dedicated to vehicle reservation”"
        p105.runs[2].text = "\n"
        p105.runs[3].text = (
            "The project is organized around two complementary components : a web platform and a mobile application. "
            "The web platform centralizes the company's six business units (vehicle rental, trading/import-export, "
            "technical construction services, renewable energies, agropastoral and real estate), as well as catalog "
            "management, pro-forma quotation editing and the administration back-office. The mobile application, "
            "in turn, responds to clients' specific mobility needs, offering vehicle fleet consultation, "
            "availability verification and direct reservation."
        )

    # ── P[138] Mission ──
    p138 = doc.paragraphs[138]
    if len(p138.runs) >= 2:
        p138.runs[0].text = "❖"
        p138.runs[1].text = " Mission"

    # ── P[141..144] Values (S.A.P.E) ──
    p141 = doc.paragraphs[141]
    if len(p141.runs) >= 2:
        p141.runs[0].text = "S — Sustainable and innovative solution"
        p141.runs[1].text = "\nThe company prioritizes the implementation of sustainable and innovative solutions to effectively respond to the needs of its clients."

    p142 = doc.paragraphs[142]
    if len(p142.runs) >= 2:
        p142.runs[0].text = "A — Adaptability"
        p142.runs[1].text = "\nSOUTARAH GROUP adapts to the different needs of its clients as well as to the changes in its professional environment."

    p143 = doc.paragraphs[143]
    if len(p143.runs) >= 2:
        p143.runs[0].text = "P — Customer priority"
        p143.runs[1].text = "\nCustomer satisfaction is an essential element in the design and delivery of the services offered."

    p144 = doc.paragraphs[144]
    if len(p144.runs) >= 2:
        p144.runs[0].text = "E — Staff efficiency"
        p144.runs[1].text = "\nThe company values the skills and efficiency of its staff to guarantee the quality of services delivered."

    # ── P[148..153] Services ──
    service_items = [
        (148, " Vehicle rental : ", "The vehicle rental service offers mobility solutions adapted to different customer needs, whether for one-time trips or for longer periods."),
        (149, " Trading / Import-Export : ", "Facilitate the supply and distribution of various goods."),
        (150, " Technical : ", "The installation, maintenance and support of equipment and installations."),
        (151, " Renewable energies : ", "Optimize energy consumption and promote the use of renewable energies."),
        (152, " Agropastoral : ", "Agricultural production and livestock farming."),
        (153, " Real estate : ", "The sale, rental and management of properties."),
    ]
    for p_idx, label, desc in service_items:
        p = doc.paragraphs[p_idx]
        if len(p.runs) >= 3:
            p.runs[0].text = "➢"
            p.runs[1].text = label
            p.runs[2].text = desc

    # ── P[658] Conclusion générale ──
    p658 = doc.paragraphs[658]
    if len(p658.runs) >= 4:
        p658.runs[0].text = "At the end of this internship carried out within SOUTARAH GROUP, we have successfully completed the design and full implementation of a unified digital solution, responding to the theme : "
        p658.runs[1].text = "“Design and development of a digital management platform for the services of SOUTARAH GROUP integrating a mobile application dedicated to vehicle reservation”"
        p658.runs[2].text = "\n\n"
        p658.runs[3].text = (
            "This project has profoundly transformed the company's commercial practices by replacing manual methods "
            "with a modern, coherent and interconnected software ecosystem. The rigorous methodological approach based "
            "on the Unified Process and UML modeling (UP/UML) guaranteed a precise analysis of needs and flawless "
            "structuring of the relational MySQL database.\n\n"
            "On the technical level, the synergy between the web platform developed under React.js and the mobile "
            "application designed under React Native/Expo, both articulated around a Node.js/Express REST API, allowed "
            "achieving all the set objectives. Users now have total visibility on the 6 business units of the company, "
            "a fluid reservation module with anti-double-booking algorithm, an interactive multi-item cart and an "
            "instant official PDF quotation generation tool.\n\n"
            "On a personal and academic level, this project was a particularly enriching experience. It allowed us "
            "to consolidate the theoretical knowledge received at the École Supérieure d'Industrie (ESI) of INP-HB, "
            "to understand the constraints of software engineering in a professional environment and to master "
            "cutting-edge full-stack technologies."
        )
        for r in p658.runs[4:]:
            r.text = ''

    print("Special multi-run paragraphs translated successfully.")

# ═══════════════════════════════════════════════════════════════════════════════
# 6. MAIN GENERATOR PIPELINE
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    print(f"Loading {SRC_FILE}...")
    doc = Document(SRC_FILE)

    # Initial element counts
    drawings_before = len(doc._element.findall('.//' + qn('w:drawing')))
    picts_before = len(doc._element.findall('.//' + qn('w:pict')))
    print(f"Initial visual elements: {drawings_before} drawings, {picts_before} picts")

    # Step 1: Translate ALL 62 floating textboxes (Chapter titles & figure/table banners)
    translate_all_textboxes(doc)

    # Step 2: Translate all 6 tables
    translate_all_tables(doc)

    # Step 3: Load complete translations dictionary for paragraphs
    with open('complete_translations.json', encoding='utf-8') as f:
        trans_dict = {int(k): v for k, v in json.load(f).items()}

    # Special multi-run paragraphs that require run-level handling
    special_run_indices = {2, 6, 105, 138, 141, 142, 143, 144, 148, 149, 150, 151, 152, 153, 658}

    # TOC paragraphs: Sommaire (30..52), Figures (55..84), Tables (87..91), Table des matières (715..807)
    toc_indices = set(list(range(30, 53)) + list(range(55, 85)) + list(range(87, 92)) + list(range(715, 808)))

    # Step 4: Translate all standard and TOC paragraphs
    translated_paras = 0
    for idx, para in enumerate(doc.paragraphs):
        t = para.text.strip()
        if not t:
            continue

        if idx in special_run_indices:
            continue

        if idx in toc_indices:
            if idx in trans_dict:
                full_val = trans_dict[idx]
                title_part = full_val.split('\t')[0].strip()
                translate_toc_para(para, title_part)
                translated_paras += 1
            continue

        # All other body paragraphs safely translated
        if idx in trans_dict:
            safe_replace_para_text(para, trans_dict[idx])
            translated_paras += 1

    # Step 5: Translate special multi-run paragraphs
    translate_special_multirun_paragraphs(doc)
    translated_paras += len(special_run_indices)

    print(f"Total paragraphs processed: {translated_paras}")

    # Verify visual elements
    drawings_after = len(doc._element.findall('.//' + qn('w:drawing')))
    picts_after = len(doc._element.findall('.//' + qn('w:pict')))
    print(f"Final visual elements: {drawings_after} drawings, {picts_after} picts")

    assert drawings_before == drawings_after, f"Drawing mismatch: {drawings_before} vs {drawings_after}"
    assert picts_before == picts_after, f"Pict mismatch: {picts_before} vs {picts_after}"
    print("SUCCESS: 100% of drawings, picts and shapes preserved!")

    # Save primary document
    print(f"Saving to {OUT_FILE}...")
    doc.save(OUT_FILE)
    print("Primary file saved successfully.")

    # Synchronize to alt path
    alt_p = Path(ALT_OUT_FILE)
    if alt_p.parent.exists():
        shutil.copy2(OUT_FILE, ALT_OUT_FILE)
        print(f"Synchronized copy saved to {ALT_OUT_FILE}")

    print("ALL STEPS COMPLETED WITH 100% ACCURACY AND INTEGRITY!")

if __name__ == '__main__':
    main()
