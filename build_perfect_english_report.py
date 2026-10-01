# -*- coding: utf-8 -*-
"""
build_perfect_english_report.py
Translates Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx into English with:
1. All 62 textboxes (txbxContent) translated (Chapter banners, Table/Figure banners, Genius Pay).
2. All paragraph runs translated while strictly preserving bold/italic formatting, tabs, and line breaks.
3. All Table of Contents, List of Figures/Tables preserving their exact tabs and page numbers.
4. All 6 tables completely translated.
5. 100% preservation of drawings, images, shapes, and page dispositions.
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
# HELPER FUNCTIONS FOR XML & RUN MANIPULATION
# ═══════════════════════════════════════════════════════════════════════════════

def set_run_text_with_breaks(run, text):
    """Sets run text, converting any \\n into proper <w:br/> OpenXML elements."""
    run.text = ''
    r_elem = run._r
    # Remove existing w:t and w:br in this run
    for child in list(r_elem):
        if child.tag in (qn('w:t'), qn('w:br')):
            r_elem.remove(child)
            
    lines = text.split('\n')
    for idx, line in enumerate(lines):
        if idx > 0:
            r_elem.append(OxmlElement('w:br'))
        if line:
            t = OxmlElement('w:t')
            t.text = line
            t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
            r_elem.append(t)

def translate_toc_paragraph(para, english_title):
    """
    Translates a TOC line while strictly preserving its tab stop and page number.
    TOC line typically ends with '\\t' and ' - X -' or similar.
    """
    runs = para.runs
    if not runs:
        return
    
    # Check if there is a tab in the runs
    tab_idx = None
    for j, r in enumerate(runs):
        if '\t' in r.text:
            tab_idx = j
            break
            
    if tab_idx is not None:
        first_title_run = False
        for j in range(tab_idx):
            if not first_title_run and runs[j].text.strip():
                runs[j].text = english_title
                first_title_run = True
            else:
                runs[j].text = ''
    else:
        runs[0].text = english_title
        for r in runs[1:]:
            r.text = ''

def translate_single_or_uniform_para(para, translation):
    """
    Translates a paragraph with a single run or uniform formatting.
    Preserves runs[0] formatting, handles line breaks properly.
    """
    runs = para.runs
    if not runs:
        # Fallback to direct XML
        t_nodes = para._element.findall('.//' + qn('w:t'))
        if t_nodes:
            t_nodes[0].text = translation
            for t in t_nodes[1:]:
                t.text = ''
        return

    set_run_text_with_breaks(runs[0], translation)
    for r in runs[1:]:
        r.text = ''

# ═══════════════════════════════════════════════════════════════════════════════
# TEXTBOX TRANSLATIONS (ALL 62 TEXTBOXES)
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
    """Translate all 62 floating textboxes (Chapter titles, figure/table banners)."""
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
# TABLE TRANSLATIONS (TABLES 0 TO 5)
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

    # Table 2: Comparative Study between MERISE and UP/UML Methods
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
                        translate_single_or_uniform_para(p, text_en)
                        count += 1
    print(f"Table cells translated: {count}")

# ═══════════════════════════════════════════════════════════════════════════════
# PARAGRAPH LEVEL TRANSLATION WITH RUN-PRESERVATION
# ═══════════════════════════════════════════════════════════════════════════════

def translate_special_multiline_paragraphs(doc):
    """
    Translates the 22 specific multi-run / multiline paragraphs
    by preserving each run's bold, italic, and structural role.
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

    # ── P[97] Résumé / Abstract (3 blocks) ──
    p97 = doc.paragraphs[97]
    p97_text = (
        "This application project concerns the design and development of a comprehensive digital management "
        "platform for the services of SOUTARAH GROUP, integrating a mobile application dedicated to vehicle "
        "reservation and tracking. Faced with a previously manual management of quotations, and the absence "
        "of centralized customer relationship management, the objective was to establish a unified digital ecosystem.\n\n"
        "The adopted methodology is based on the Unified Process associated with the UML language (UP/UML) "
        "for rigorous modeling of requirements and processes. The software solution relies on a modern "
        "three-tier client-server architecture : a responsive web interface designed in React.js and CSS "
        "for all multisectoral business activities (vehicle rental, trading, technical services, renewable "
        "energies, agropastoral, real estate) ; a native mobile application developed under React Native "
        "and Expo specialized in real-time vehicle reservation ; and a centralized backend under Node.js/Express "
        "coupled with a MySQL database managed by the Sequelize ORM.\n\n"
        "The obtained results materialize an instant synchronization between web and mobile : automatic "
        "generation of official pro-forma quotations in 2-page PDF format, synchronized multi-item cart, "
        "email notifications (Brevo) and a complete administration dashboard. This solution guarantees "
        "SOUTARAH GROUP increased profitability, optimal commercial responsiveness and total traceability of operations."
    )
    translate_single_or_uniform_para(p97, p97_text)

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

    # ── P[106] 4 Grandes Parties ──
    p106 = doc.paragraphs[106]
    p106_text = (
        "The present report describes the entire software engineering process followed and is organized around four main parts :\n"
        "•  The First Part presents the project framework and context, introducing the host organization SOUTARAH GROUP, the existing system analysis, the objectives, the specifications and the task planning ;\n"
        "• The Second Part is dedicated to the conceptual study, detailing the UP/UML methodological approach and the various design diagrams (use cases, activity, sequence and classes) ;\n"
        "•  The Third Part develops the technical study, justifying the technological choices (React, React Native, Node.js, MySQL) and explaining the overall software architecture ;\n"
        "•  The Fourth Part describes the practical implementation of the web platform and the mobile application, detailing the developed functionalities, validation tests, obtained results and the financial analysis of the project."
    )
    translate_single_or_uniform_para(p106, p106_text)

    # ── P[138] Mission ──
    p138 = doc.paragraphs[138]
    if len(p138.runs) >= 2:
        p138.runs[0].text = "❖"
        p138.runs[1].text = " Mission"

    # ── P[141..144] Values (S.A.P.E) ──
    p141 = doc.paragraphs[141]
    if len(p141.runs) >= 2:
        p141.runs[0].text = "S — Sustainable and innovative solution"
        set_run_text_with_breaks(p141.runs[1], "\nThe company prioritizes the implementation of sustainable and innovative solutions to effectively respond to the needs of its clients.")

    p142 = doc.paragraphs[142]
    if len(p142.runs) >= 2:
        p142.runs[0].text = "A — Adaptability"
        set_run_text_with_breaks(p142.runs[1], "\nSOUTARAH GROUP adapts to the different needs of its clients as well as to the changes in its professional environment.")

    p143 = doc.paragraphs[143]
    if len(p143.runs) >= 2:
        p143.runs[0].text = "P — Customer priority"
        set_run_text_with_breaks(p143.runs[1], "\nCustomer satisfaction is an essential element in the design and delivery of the services offered.")

    p144 = doc.paragraphs[144]
    if len(p144.runs) >= 2:
        p144.runs[0].text = "E — Staff efficiency"
        set_run_text_with_breaks(p144.runs[1], "\nThe company values the skills and efficiency of its staff to guarantee the quality of services delivered.")

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

    # ── P[198] Specific Objectives ──
    p198 = doc.paragraphs[198]
    p198_text = (
        "Operationally, the project aims to :\n"
        "•  Develop a modern web portal interactively presenting all 6 service units and the product catalog ;\n"
        "•  Develop a native mobile application (Android / iOS) dedicated to real-time vehicle fleet consultation, fluid reservation with dynamic pricing and order status tracking ;\n"
        "•  Implement a hybrid multi-item cart (vehicles and supplies) with an automated tax calculation engine (pre-tax, VAT 18%, TDT 2.5%) ;\n"
        "•  Automate the generation of official pro-forma quotations in 2-page PDF format (with technical data sheets and visuals) ready for printing or electronic signature ;\n"
        "•  Develop a centralized administration dashboard (Back-Office) for managing quotations, vehicles, customers and notifications ;\n"
        "•  Integrate a transactional email notification system."
    )
    translate_single_or_uniform_para(p198, p198_text)

    # ── P[201..202] Specifications ──
    p201 = doc.paragraphs[201]
    p201_text = (
        "The specifications formalize the functional and non-functional requirements of the interconnected system :\n\n"
        "1. Functional requirements for the Client (Web & Mobile) :\n"
        "  •  Detailed consultation of the vehicle and product catalog by category ;\n"
        "  •  Multi-criteria filtering of vehicles (brand, type, transmission, air conditioning) ;\n"
        "  •  Selection of rental dates with dynamic calculation according to the destination pricing (Abidjan / Outside Abidjan) and the driver option ;\n"
        "  •  Shopping cart / reservation management and one-click validation ;\n"
        "  •  Instant download of the official PDF pro-forma quotation complying with the company's legal charter ;\n"
        "  •  Personal quotation management area ;\n\n"
        "2. Functional requirements for the Administrator :\n"
        "  •  Global supervision of key indicators (estimated turnover, active reservations) ;\n"
        "  •  Complete vehicle fleet management (addition, modification, maintenance status) ;"
    )
    translate_single_or_uniform_para(p201, p201_text)

    p202 = doc.paragraphs[202]
    p202_text = (
        "  •  Complete trading product management (adding products, modifying prices) ;\n"
        "  •  Customer account management and partner discount allocation.\n\n"
        "3. Technical requirements and constraints :\n"
        "  •  Security ;\n"
        "  •  Availability and performance ;\n"
        "  •  Portability : Compatibility with modern browsers (Chrome, Safari, Edge) and mobile devices."
    )
    translate_single_or_uniform_para(p202, p202_text)

    # ── P[270] Three actors ──
    p270 = doc.paragraphs[270]
    p270_text = (
        "Within our project, the system integrates three main actors :\n"
        "•  The Visitor / Client : consults the catalog, composes their multi-service cart on the Web, makes vehicle reservations on the Mobile application and downloads their PDF quotations ;\n"
        "•  The Administrator : supervises all operations, manages the fleet, updates pricing and validates quotations ;\n"
        "•  The System / REST API : applies business rules, controls availability and orchestrates notification distribution."
    )
    translate_single_or_uniform_para(p270, p270_text)

    # ── P[539] MySQL tables ──
    p539 = doc.paragraphs[539]
    p539_text = (
        "The MySQL database was designed to guarantee the consistency of transactional flows. It groups the following main tables :\n"
        "•  Users & Clients : management of identifiers (email, hashed password, role 'CLIENT' or 'ADMIN') and links to individual or company profiles ;\n"
        "•  Vehicles : brand, model, category, daily rate, status, photographs ;\n"
        "•  Reservations : start and end dates, driver option with/without, total amount, status ;\n"
        "•  Services & Products : general catalog of the 6 business units with technical characteristics and pricing ;\n"
        "•  Quotations : unique reference (e.g.: DMD-2026-XXXX), creation date, pre-tax/inclusive amount ;\n"
        "•  Notifications : alerts sent to clients and administrators."
    )
    translate_single_or_uniform_para(p539, p539_text)

    # ── P[612] Back-Office ──
    p612 = doc.paragraphs[612]
    p612_text = (
        "The Web Back-Office is the control center of the company. It integrates :\n"
        "•  Dashboard : performance charts, projected turnover, number of quotations and reservations in progress ;\n"
        "•  Fleet and trading product management : addition of new vehicles, products, update of daily prices ;"
    )
    translate_single_or_uniform_para(p612, p612_text)

    # ── P[658] Conclusion générale ──
    p658 = doc.paragraphs[658]
    if len(p658.runs) >= 4:
        p658.runs[0].text = "At the end of this internship carried out within SOUTARAH GROUP, we have successfully completed the design and full implementation of a unified digital solution, responding to the theme : "
        p658.runs[1].text = "“Design and development of a digital management platform for the services of SOUTARAH GROUP integrating a mobile application dedicated to vehicle reservation”"
        set_run_text_with_breaks(p658.runs[2], "\n\n")
        set_run_text_with_breaks(p658.runs[3], (
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
        ))
        for r in p658.runs[4:]:
            r.text = ''

    print("Special multi-run paragraphs translated successfully.")

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN GENERATOR PIPELINE
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    print(f"Loading {SRC_FILE}...")
    doc = Document(SRC_FILE)

    # Verify visual elements
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

    # Paragraph indices that have special multi-run handling
    special_indices = {2, 6, 97, 105, 106, 138, 141, 142, 143, 144, 148, 149, 150, 151, 152, 153, 198, 201, 202, 270, 539, 612, 658}

    # Step 4: Translate TOC paragraphs (preserving exact tabs and page numbers)
    # Range of TOC items:
    # Sommaire: 30..52
    # Figures: 55..84
    # Tables: 87..91
    # Detailed TOC: 715..807
    toc_ranges = list(range(30, 53)) + list(range(55, 85)) + list(range(87, 92)) + list(range(715, 808))
    toc_set = set(toc_ranges)

    translated_paras = 0
    for idx, para in enumerate(doc.paragraphs):
        t = para.text.strip()
        if not t:
            continue

        if idx in special_indices:
            # handled in translate_special_multiline_paragraphs
            continue

        if idx in toc_set:
            if idx in trans_dict:
                # Extract the title part from trans_dict[idx] (before \t)
                full_val = trans_dict[idx]
                title_part = full_val.split('\t')[0].strip()
                translate_toc_paragraph(para, title_part)
                translated_paras += 1
            continue

        # Standard paragraph
        if idx in trans_dict:
            translate_single_or_uniform_para(para, trans_dict[idx])
            translated_paras += 1

    # Step 5: Translate the special multi-run paragraphs
    translate_special_multiline_paragraphs(doc)
    translated_paras += len(special_indices)

    print(f"Total paragraphs processed: {translated_paras}")

    # Check drawings and picts after
    drawings_after = len(doc._element.findall('.//' + qn('w:drawing')))
    picts_after = len(doc._element.findall('.//' + qn('w:pict')))
    print(f"Final visual elements: {drawings_after} drawings, {picts_after} picts")
    assert drawings_before == drawings_after, "Error: Drawing count altered!"
    assert picts_before == picts_after, "Error: Pict count altered!"

    # Save to primary output
    print(f"Saving to {OUT_FILE}...")
    doc.save(OUT_FILE)
    print("Primary file saved successfully.")

    # Synchronize to alt path
    alt_p = Path(ALT_OUT_FILE)
    if alt_p.parent.exists():
        shutil.copy2(OUT_FILE, ALT_OUT_FILE)
        print(f"Synchronized copy saved to {ALT_OUT_FILE}")

    print("ALL DONE PERFECTLY!")

if __name__ == '__main__':
    main()
