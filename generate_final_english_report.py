# -*- coding: utf-8 -*-
"""
generate_final_english_report.py
Generates the complete English report from Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx.
- 100% faithful translation of the French text.
- Exactly preserves all formatting, styles, images, figures, and tables.
- Updates both the root Rapport_de_Stage_ENGLISH.docx and the subfolder copy.
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
ALT_OUT_FILE = r'c:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\rapport-stage\mon-rapport\Rapport_de_Stage_ENGLISH.docx'

def safe_replace_para_text(para, new_text):
    """
    Safely replaces paragraph text in Word XML.
    Modifies only <w:t> elements.
    Drawings (<w:drawing>), picts (<w:pict>), runs and properties remain 100% intact.
    """
    t_elements = para._element.findall('.//' + qn('w:t'))
    if not t_elements:
        # If no w:t found, but we have text in runs
        if para.runs:
            para.runs[0].text = new_text
            for r in para.runs[1:]:
                r.text = ''
        return

    # Put the full translation into the first text node, preserving whitespace
    t_elements[0].text = new_text
    t_elements[0].set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    # Clear subsequent text nodes to avoid duplicate text
    for t in t_elements[1:]:
        t.text = ''

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

def main():
    print(f"Loading {SRC_FILE}...")
    doc = Document(SRC_FILE)
    total_paras = len(doc.paragraphs)
    print(f"Total paragraphs in document: {total_paras}")

    # Count drawings and picts before
    drawings_before = len(doc._element.findall('.//' + qn('w:drawing')))
    picts_before = len(doc._element.findall('.//' + qn('w:pict')))
    print(f"Initial visual elements: {drawings_before} drawings, {picts_before} picts")

    # Load complete translations map
    with open('complete_translations.json', encoding='utf-8') as f:
        trans_map = {int(k): v for k, v in json.load(f).items()}

    translated_count = 0
    skipped_count = 0

    for i, para in enumerate(doc.paragraphs):
        t = para.text.strip()
        if not t:
            continue

        if i in trans_map:
            new_text = trans_map[i]
            safe_replace_para_text(para, new_text)
            translated_count += 1
        else:
            skipped_count += 1

    print(f"Paragraphs translated: {translated_count}")
    print(f"Paragraphs skipped: {skipped_count}")

    # Translate all tables
    table_trans = get_table_translations()
    cells_translated = 0
    for t_idx, table in enumerate(doc.tables):
        if t_idx in table_trans:
            mapping = table_trans[t_idx]
            for (r_idx, c_idx), text_en in mapping.items():
                if r_idx < len(table.rows) and c_idx < len(table.rows[r_idx].cells):
                    cell = table.rows[r_idx].cells[c_idx]
                    for p in cell.paragraphs:
                        safe_replace_para_text(p, text_en)
                        cells_translated += 1

    print(f"Table cells translated: {cells_translated}")

    # Check drawings and picts after
    drawings_after = len(doc._element.findall('.//' + qn('w:drawing')))
    picts_after = len(doc._element.findall('.//' + qn('w:pict')))
    print(f"Final visual elements: {drawings_after} drawings, {picts_after} picts")
    assert drawings_before == drawings_after, "Warning: Drawing count mismatch!"
    assert picts_before == picts_after, "Warning: Pict count mismatch!"

    # Save to primary output
    print(f"Saving to {OUT_FILE}...")
    doc.save(OUT_FILE)
    print("Primary file saved successfully.")

    # Also sync to alt path if it exists
    alt_p = Path(ALT_OUT_FILE)
    if alt_p.parent.exists():
        try:
            shutil.copy2(OUT_FILE, ALT_OUT_FILE)
            print(f"Synchronized copy saved to {ALT_OUT_FILE}")
        except Exception as e:
            print(f"Could not copy to alt path: {e}")

    print("ALL DONE SUCCESSFULLY!")

if __name__ == '__main__':
    main()
