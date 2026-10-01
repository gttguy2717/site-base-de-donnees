# -*- coding: utf-8 -*-
"""
create_english_report.py
Copies the French corrected report and translates all text to English.
STRICT RULE: translate EXACTLY what is in French - no additions, no omissions.
Preserves all formatting, images, tables, styles.
"""
import sys; sys.stdout.reconfigure(encoding='utf-8')
import shutil, copy
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

SRC = 'Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx'
OUT = 'Rapport_de_Stage_ENGLISH.docx'

# ═══════════════════════════════════════════════════════════════════
# EXACT TRANSLATION MAP: { paragraph_index : "English translation" }
# Built from the exact French text, translated faithfully word for word.
# ═══════════════════════════════════════════════════════════════════
TRANSLATIONS = {
    # ── Dédicace ────────────────────────────────────────────────
    1:  'DEDICATION',
    2:  'I dedicate this modest work to my entire family and to all those who supported me, near and far, throughout my academic journey.',
    4:  'Particular dedications to :',
    6:  '\u2022  My father, Mr. SORHO YETIENA, for his benevolent guidance, his wisdom and his precious advice ;',
    7:  '\u2022  My mother, Mrs. SORHO SANABA, for her unconditional love, her constant prayers and her unwavering support ;',
    8:  '\u2022  My sister, SORHO ESLIE, for her constant encouragement and her reassuring dynamism.',
    10: 'To all those who have contributed to making me the person I am today, please find here the expression of my deep gratitude.',

    # ── Remerciements ────────────────────────────────────────────
    5:  'ACKNOWLEDGEMENTS',
    6:  'I would like to express my sincere thanks to Mr. Kologo Harouna, Director of Soutarah Group, as well as to my internship supervisor, for their welcome, their guidance, their advice and their availability throughout my internship. Also, this report was made possible thanks to the involvement of several people, and I would like to address my thanks to :',
    14: '\u2022 My parents, Mr. Yetiena SORHO and Mrs. Sanaba COULIBALY, for all the sacrifices made, their invaluable financial and moral support since the first day of my studies ;',
    15: '\u2022  The Republic of Ivory Coast, for all the university infrastructure and the framework of excellence offered to the student youth ;',
    16: '\u2022 The National Polytechnic Institute Félix Houphouët-Boigny (INP-HB) of Yamoussoukro, for opening its doors to me and providing me with elite technical training ;',
    17: '\u2022 Dr Moussa DIABY Abdoul Kader, Director General of INP-HB, for his inspiring leadership and his constant commitment to the institute\'s influence ;',
    18: '\u2022 Dr Adama OUATTARA, Director of the École Supérieure d\'Industrie (ESI), for the reforms and rigor instilled within our school ;',
    19: '\u2022 Mr. Siriky KONE, Deputy Director of Studies at ESI, for his attentive listening, his availability and his sound advice ;',
    20: '\u2022  Mr. Louagbeu Loua KPO, Director of the Information and Communication Technology Sciences and Technologies Teaching Unit (STIC), for the exceptional quality of the training program and his strategic guidance ;',
    21: '\u2022 The entire teaching and administrative staff of ESI and the STIC department for their dedication and their passionate transmission of knowledge ;',
    22: '\u2022 The General Management and all the staff of SOUTARAH GROUP, for their warm welcome, their daily technical support and the trust placed in us during this professional immersion internship.',

    # ── Avant-propos ─────────────────────────────────────────────
    7:  'FOREWORD',
    8:  'The National Polytechnic Institute Félix HOUPHOUËT-BOIGNY (INP-HB) of Yamoussoukro was created by decree n° 96-678 of September 4, 1996, amended by decree n° 2016-747 of September 27, 2016. INP-HB results from the merger of four major schools, namely :',
    9:  'INSET : National Higher Institute of Technical Education ;',
    10: 'ENSTP : National Higher School of Public Works ;',
    11: 'ENSA : National Higher School of Agronomy ;',
    12: 'IAB : Agricultural Institute of Bouaké.',
    13: 'Currently, INP-HB has eleven (11) major schools responsible for the qualifying training of students. Among others, we note :',
    14: 'ESI : Higher School of Industry ;',
    15: 'ESMG : Higher School of Mining and Geology ;',
    16: 'ESA : Higher School of Agronomy ;',
    17: 'ESCAE : Higher School of Commerce and Business Administration ;',
    18: 'ESTP : Higher School of Public Works ;',
    19: 'EFSPC : School of Specialized Training and Executive Development ;',
    20: 'EDPSAPT : Doctoral School of Agricultural Science and Transformation Processes ;',
    21: 'ESCPE : Higher School of Chemistry, Petroleum and Energy ;',
    22: 'EPGE : Preparatory School for Grandes Écoles ;',
    23: 'EDPSTI : Doctoral School of Engineering Sciences and Technologies ;',
    24: 'ESAS : Higher School of Aeronautics and Space.',
    25: 'INP-HB is a reform label which, in the context of student development, offers training aimed at training senior technicians, technical engineers and design engineers in the fields of industry, aeronautics, commerce, administration, civil engineering, public works, agronomy, mining and geology. In addition, INP-HB is also involved in research activities to contribute to the advancement of knowledge and technologies in these fields.',
    26: 'As part of this development, the ESI management implemented a reform in 2016 aimed at having its students complete immersion internships in the first year, application internships in the second year and final professional internships in the third year, with the goal that they apply the knowledge acquired during their academic courses.',
    27: 'Thus, I was able to complete my internship within the company Soutarah Group. This 2-month internship took place from August 3, 2026 to October 3, 2026. This report describes the activities we carried out during this period.',
}


def replace_runs_text(para, new_text):
    """
    Replace all text in paragraph runs with new_text.
    Preserves run-level formatting of the first run.
    """
    runs = para.runs
    if not runs:
        # Try modifying the XML directly
        for r in para._element.findall('.//' + qn('w:r')):
            for t in r.findall(qn('w:t')):
                t.text = new_text
                t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
                new_text = ''  # subsequent runs get empty
        return
    # Normal case: put all text in first run, clear rest
    runs[0].text = new_text
    for r in runs[1:]:
        r.text = ''


def translate_para_runs(para, translation):
    """
    Translate a paragraph while preserving bold/italic formatting.
    Handles runs with mixed formatting (e.g., bold label + normal body).
    """
    # Simple case: single run or all same format -> just replace all text
    if len(para.runs) <= 1:
        replace_runs_text(para, translation)
        return

    # Check if the paragraph has "label : body" pattern (bold label + normal text)
    # In that case, try to preserve the structure
    # For now, simple replacement
    replace_runs_text(para, translation)


def main():
    print(f'Loading {SRC}...')
    doc = Document(SRC)
    total = len(doc.paragraphs)
    print(f'Total paragraphs: {total}')

    # Build complete translation map
    # We work by paragraph index in the FR doc
    trans_map = build_translation_map()

    translated = 0
    skipped_img = 0
    unchanged = 0

    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        if not text:
            continue

        # Check if we have a translation for this index
        if i in trans_map:
            new_text = trans_map[i]
            if new_text is None:
                # Keep as is (e.g., proper names, codes, figures)
                unchanged += 1
                continue

            # Check if paragraph has images - only translate text parts
            has_img = len(para._element.findall('.//' + qn('a:blip'))) > 0
            if has_img:
                # For paragraphs with images, we need to be careful
                # Just update the text runs, not the image
                translate_para_runs_with_image(para, new_text)
                skipped_img += 1
            else:
                translate_para_runs(para, new_text)
            translated += 1
        else:
            unchanged += 1

    print(f'Translated: {translated}')
    print(f'With images: {skipped_img}')
    print(f'Unchanged: {unchanged}')

    # Also translate tables
    translate_tables(doc)

    print(f'Saving to {OUT}...')
    doc.save(OUT)
    print('Done!')


def translate_para_runs_with_image(para, new_text):
    """For paragraphs containing images, only replace text in w:t elements, not images."""
    # Find all text runs (w:r elements without images)
    first_text_run = None
    for r in para._element.findall('.//' + qn('w:r')):
        # Skip runs that contain images
        if r.find('.//' + qn('a:blip')) is not None:
            continue
        # Find text elements
        for t in r.findall(qn('w:t')):
            if first_text_run is None:
                t.text = new_text
                t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
                first_text_run = t
            else:
                t.text = ''


def translate_tables(doc):
    """Translate table cells."""
    table_translations = get_table_translations()
    for t_idx, table in enumerate(doc.tables):
        if t_idx in table_translations:
            trans = table_translations[t_idx]
            for r_idx, row in enumerate(table.rows):
                for c_idx, cell in enumerate(row.cells):
                    key = (r_idx, c_idx)
                    if key in trans:
                        # Replace cell text while preserving paragraph formatting
                        for para in cell.paragraphs:
                            if para.text.strip():
                                replace_runs_text(para, trans[key])


def build_translation_map():
    """
    Returns a dictionary mapping paragraph index -> English translation.
    Based on the exact French text from fr_paragraphs_dump.txt.
    None = keep as is (proper nouns, codes, figure captions with same numbers).
    """
    t = {}

    # ── Page 1: Dédicace ────────────────────────────────────────────────────
    t[1]  = 'DEDICATION'
    t[2]  = ('I dedicate this modest work to my entire family and to all those who supported me, '
             'near and far, throughout my academic journey.')
    t[4]  = 'Particular dedications to :'
    t[6]  = '\u2022\u00a0 My father, Mr. SORHO YETIENA, for his benevolent guidance, his wisdom and his precious advice ;'
    t[7]  = '\u2022\u00a0 My mother, Mrs. SORHO SANABA, for her unconditional love, her constant prayers and her unwavering support ;'
    t[8]  = '\u2022\u00a0 My sister, SORHO ESLIE, for her constant encouragement and her reassuring dynamism.'
    t[10] = 'To all those who have contributed to making me the person I am today, please find here the expression of my deep gratitude.'

    # ── Remerciements ───────────────────────────────────────────────────────
    t[5]  = 'ACKNOWLEDGEMENTS'
    t[6]  = ('I would like to express my sincere thanks to Mr. Kologo Harouna, Director of Soutarah Group, '
             'as well as to my internship supervisor, for their welcome, their guidance, their advice and their '
             'availability throughout my internship. Also, this report was made possible thanks to the involvement '
             'of several people, and I would like to address my thanks to :')
    t[14] = ('\u2022 My parents, Mr. Yetiena SORHO and Mrs. Sanaba COULIBALY, for all the sacrifices made, '
             'their invaluable financial and moral support since the first day of my studies ;')
    t[15] = '\u2022\u00a0 The Republic of Ivory Coast, for all the university infrastructure and the framework of excellence offered to the student youth ;'
    t[16] = ('\u2022 The National Polytechnic Institute F\u00e9lix Houphou\u00ebt-Boigny (INP-HB) of Yamoussoukro, '
             'for opening its doors to me and providing me with elite technical training ;')
    t[17] = ('\u2022 Dr Moussa DIABY Abdoul Kader, Director General of INP-HB, for his inspiring leadership '
             'and his constant commitment to the institute\'s influence ;')
    t[18] = ('\u2022 Dr Adama OUATTARA, Director of the \u00c9cole Sup\u00e9rieure d\'Industrie (ESI), '
             'for the reforms and rigor instilled within our school ;')
    t[19] = ('\u2022 Mr. Siriky KONE, Deputy Director of Studies at ESI, for his attentive listening, '
             'his availability and his sound advice ;')
    t[20] = ('\u2022\u00a0 Mr. Louagbeu Loua KPO, Director of the STIC Teaching Unit, for the exceptional quality '
             'of the training program and his strategic guidance ;')
    t[21] = ('\u2022 The entire teaching and administrative staff of ESI and the STIC department '
             'for their dedication and their passionate transmission of knowledge ;')
    t[22] = ('\u2022 The General Management and all the staff of SOUTARAH GROUP, for their warm welcome, '
             'their daily technical support and the trust placed in us during this professional immersion internship.')

    # ── Avant-Propos ────────────────────────────────────────────────────────
    t[7]  = 'FOREWORD'
    t[8]  = ('The National Polytechnic Institute F\u00e9lix HOUPHOU\u00cbT-BOIGNY (INP-HB) of Yamoussoukro was created '
             'by decree n\u00b0 96-678 of September 4, 1996, amended by decree n\u00b0 2016-747 of September 27, 2016. '
             'INP-HB results from the merger of four major schools, namely :')
    t[9]  = 'INSET : National Higher Institute of Technical Education ;'
    t[10] = 'ENSTP : National Higher School of Public Works ;'
    t[11] = 'ENSA : National Higher School of Agronomy ;'
    t[12] = 'IAB : Agricultural Institute of Bouak\u00e9.'
    t[13] = 'Currently, INP-HB has eleven (11) major schools responsible for the qualifying training of students. Among others, we note :'
    t[14] = 'ESI : Higher School of Industry ;'
    t[15] = 'ESMG : Higher School of Mining and Geology ;'
    t[16] = 'ESA : Higher School of Agronomy ;'
    t[17] = 'ESCAE : Higher School of Commerce and Business Administration ;'
    t[18] = 'ESTP : Higher School of Public Works ;'
    t[19] = 'EFSPC : School of Specialized Training and Executive Development ;'
    t[20] = 'EDPSAPT : Doctoral School of Agricultural Science and Transformation Processes ;'
    t[21] = 'ESCPE : Higher School of Chemistry, Petroleum and Energy ;'
    t[22] = 'EPGE : Preparatory School for Grandes \u00c9coles ;'
    t[23] = 'EDPSTI : Doctoral School of Engineering Sciences and Technologies ;'
    t[24] = 'ESAS : Higher School of Aeronautics and Space.'
    t[25] = ('INP-HB is a reform label which, in the context of student development, offers training aimed at training '
             'senior technicians, technical engineers and design engineers in the fields of industry, aeronautics, '
             'commerce, administration, civil engineering, public works, agronomy, mining and geology. '
             'In addition, INP-HB is also involved in research activities to contribute to the advancement '
             'of knowledge and technologies in these fields.')
    t[26] = ('As part of this development, the ESI management implemented a reform in 2016 aimed at having its '
             'students complete immersion internships in the first year, application internships in the second year '
             'and final professional internships in the third year, with the goal that they apply the knowledge '
             'acquired during their academic courses.')
    t[27] = ('Thus, I was able to complete my internship within the company Soutarah Group. This 2-month internship '
             'took place from August 3, 2026 to October 3, 2026. This report describes the activities we carried '
             'out during this period.')

    # ── Sommaire ─────────────────────────────────────────────────────────────
    t[29] = 'TABLE OF CONTENTS'
    t[30] = 'DEDICATION\t - 1 -'
    t[31] = 'ACKNOWLEDGEMENTS\t - 2 -'
    t[32] = 'FOREWORD\t - 3 -'
    t[33] = 'TABLE OF CONTENTS\t - 5 -'
    t[34] = 'LIST OF FIGURES\t - 6 -'
    t[35] = 'LIST OF TABLES\t - 7 -'
    t[36] = 'LIST OF ABBREVIATIONS\t - 8 -'
    t[37] = 'ABSTRACT\t - 9 -'
    t[38] = 'GENERAL INTRODUCTION\t - 10 -'
    t[39] = 'PART I : PROJECT FRAMEWORK AND CONTEXT\t - 11 -'
    t[40] = 'Chapter 1 : Host Organization Overview\t - 12 -'
    t[41] = 'Chapter 2 : Project Overview\t - 15 -'
    t[42] = 'PART II : CONCEPTUAL STUDY\t - 19 -'
    t[43] = 'Chapter 3 : Choice of Analysis Methodology\t - 20 -'
    t[44] = 'PART III : TECHNICAL STUDY\t - 37 -'
    t[45] = 'Chapter 4 : System Design and Technological Choices\t - 38 -'
    t[46] = 'PART IV : SYSTEM IMPLEMENTATION AND DEPLOYMENT\t - 44 -'
    t[47] = 'Chapter 5 : Development of the Web Platform and Mobile Application\t - 45 -'
    t[48] = 'Chapter 6 : System Deployment\t - 54 -'
    t[49] = 'GENERAL CONCLUSION\t - 57 -'
    t[50] = 'BIBLIOGRAPHY\t - 58 -'
    t[51] = 'WEBOGRAPHY\t - 59 -'
    t[52] = 'DETAILED TABLE OF CONTENTS\t - 60 -'

    # ── Liste des Figures ─────────────────────────────────────────────────────
    t[54] = 'LIST OF FIGURES'
    t[55] = 'Figure 1 : GANTT Schedule Diagram\t - 18 -'
    t[56] = 'Figure 2 : Global Use Case Diagram (Web & Mobile)\t - 23 -'
    t[57] = 'Figure 3 : Activity Diagram : Customer Account Creation and Management\t - 27 -'
    t[58] = 'Figure 4 : Activity Diagram : Vehicle Reservation\t - 29 -'
    t[59] = 'Figure 5 : Activity Diagram : Product Purchase\t - 31 -'
    t[60] = 'Figure 6 : Sequence Diagram : Secure Online Payment\t - 32 -'
    t[61] = 'Figure 7 : Sequence Diagram : Vehicle Reservation\t - 33 -'
    t[62] = 'Figure 8 : Sequence Diagram : Product Purchase\t - 34 -'
    t[63] = 'Figure 9 : Sequence Diagram : User Registration\t - 35 -'
    t[64] = 'Figure 10 : System Class Diagram\t - 36 -'
    t[65] = 'Figure 11 : Visual Studio Code Editor Logo\t - 38 -'
    t[66] = 'Figure 12 : Figma UI/UX Design Tool Logo\t - 39 -'
    t[67] = 'Figure 13 : React.js Frontend Framework Logo\t - 39 -'
    t[68] = 'Figure 14 : React Native & Expo Mobile Framework Logo\t - 39 -'
    t[69] = 'Figure 15 : Node.js & Express Server Technology Logo\t - 40 -'
    t[70] = 'Figure 16 : Brevo Transactional Email Platform Logo\t - 40 -'
    t[71] = 'Figure 17 : Genius Pay Online Payment Platform Logo\t - 40 -'
    t[72] = 'Figure 18 : Hostinger Hosting Platform Logo\t - 41 -'
    t[73] = 'Figure 19 : General System Architecture Diagram\t - 43 -'
    t[74] = 'Figure 20 : Structure and Relational Schema of the MySQL Database\t - 45 -'
    t[75] = 'Figure 21 : Web Interface : Home Page\t - 48 -'
    t[76] = 'Figure 22 : Web Interface : Login Page and Authentication Form\t - 48 -'
    t[77] = 'Figure 23 : Web Interface : Product Catalog\t - 49 -'
    t[78] = 'Figure 24 : Web Interface : Vehicle Reservation Module\t - 49 -'
    t[79] = 'Figure 25 : Web Interface : Multi-Item Cart and PDF Quotation\t - 50 -'
    t[80] = 'Figure 26 : Web Interface : Customer Portal and Request History\t - 50 -'
    t[81] = 'Figure 27 : Mobile Application : Home Screen and Detailed Vehicle Sheet\t - 51 -'
    t[82] = 'Figure 28 : Mobile Application : Mobile Booking Cart\t - 52 -'
    t[83] = 'Figure 29 : Administration Interface : Dashboard\t - 52 -'
    t[84] = 'Figure 30 : Administration Interface : Fleet and Reservation Management\t - 53 -'

    # ── Liste des Tableaux ────────────────────────────────────────────────────
    t[86] = 'LIST OF TABLES'
    t[87] = 'Table 1 : Forecast Planning and Task Chronogram\t - 17 -'
    t[88] = 'Table 2 : Comparative Study between MERISE and UP/UML Methods\t - 21 -'
    t[89] = 'Table 3 : Comparative Analysis of Database Management Systems\t - 41 -'
    t[90] = 'Table 4 : Test Acceptance Book and Functional Validation (Web & Mobile)\t - 54 -'
    t[91] = 'Table 5 : Estimated Financial Balance Sheet of Infrastructure and Annual Maintenance Costs\t - 55 -'

    # ── Liste des Abréviations ────────────────────────────────────────────────
    t[93] = 'LIST OF ABBREVIATIONS'

    # ── Résumé ────────────────────────────────────────────────────────────────
    t[96] = 'ABSTRACT'
    t[97] = ('This application project concerns the design and development of a comprehensive digital management '
             'platform for the services of SOUTARAH GROUP, integrating a mobile application dedicated to vehicle '
             'reservation and tracking. Faced with a previously manual management of quotations, and the absence '
             'of centralized customer relationship management, the objective was to establish a unified digital ecosystem.')
    # (paragraph continues - 2nd and 3rd blocks)
    t[98] = ('The adopted methodology is based on the Unified Process associated with the UML language (UP/UML) '
             'for rigorous modeling of requirements and processes. The software solution relies on a modern '
             'three-tier client-server architecture : a responsive web interface designed in React.js and CSS '
             'for all multisectoral business activities (vehicle rental, trading, technical services, renewable '
             'energies, agropastoral, real estate) ; a native mobile application developed under React Native '
             'and Expo specialized in real-time vehicle reservation ; and a centralized backend under Node.js/Express '
             'coupled with a MySQL database managed by the Sequelize ORM.')
    t[99] = ('The obtained results materialize an instant synchronization between web and mobile : automatic '
             'generation of official pro-forma quotations in 2-page PDF format, synchronized multi-item cart, '
             'email notifications (Brevo) and a complete administration dashboard. This solution guarantees '
             'SOUTARAH GROUP increased profitability, optimal commercial responsiveness and total traceability of operations.')

    # ── Introduction générale ─────────────────────────────────────────────────
    t[103] = 'GENERAL INTRODUCTION'
    t[104] = ('The services sector is an essential driver of the Ivorian economy, strongly contributing to GDP '
              'and employment, with varied activities ranging from transport to international trading, including '
              'technical engineering and energy. However, these companies face organizational challenges : paper-based '
              'management, slowness in formulating quotations, lack of customer traceability. In this context, '
              'the integration of ICT becomes a strategic imperative for competitiveness. It is within this '
              'framework that the project carried out within SOUTARAH GROUP takes place.')
    t[105] = ('The project\'s theme is : "Design and development of a digital management platform for the services '
              'of SOUTARAH GROUP integrating a mobile application dedicated to vehicle reservation".')
    t[106] = ('The project is organized around two complementary components : a web platform and a mobile application. '
              'The web platform centralizes the company\'s six business units (vehicle rental, trading/import-export, '
              'technical construction services, renewable energies, agropastoral and real estate), as well as catalog '
              'management, pro-forma quotation editing and the administration back-office. The mobile application, '
              'in turn, responds to clients\' specific mobility needs, offering vehicle fleet consultation, '
              'availability verification and direct reservation.')
    t[107] = ('The present report describes the entire software engineering process followed and is organized '
              'around four main parts :')
    t[108] = ('\u2022\u00a0 The First Part presents the project framework and context, introducing the host organization '
               'SOUTARAH GROUP, the existing system analysis, the objectives, the specifications and the task planning ;')
    t[109] = ('\u2022 The Second Part is dedicated to the conceptual study, detailing the UP/UML methodological '
              'approach and the various design diagrams (use cases, activity, sequence and classes) ;')
    t[110] = ('\u2022\u00a0 The Third Part develops the technical study, justifying the technological choices '
              '(React, React Native, Node.js, MySQL) and explaining the overall software architecture ;')
    t[111] = ('\u2022\u00a0 The Fourth Part describes the practical implementation of the web platform and the '
              'mobile application, detailing the developed functionalities, validation tests, obtained results '
              'and the financial analysis of the project.')

    # ── PARTIE I ─────────────────────────────────────────────────────────────
    t[113] = 'PART I'
    t[114] = 'PROJECT FRAMEWORK AND CONTEXT'

    # ── Chapitre 1 ───────────────────────────────────────────────────────────
    t[131] = 'I. PRESENTATION OF SOUTARAH GROUP'
    t[132] = '1. General Presentation'
    t[133] = ('SOUTARAH GROUP is a versatile company offering a diverse range of services intended for both '
              'professionals and individuals. Thanks to its multisectoral expertise, the company provides its '
              'customers with integrated and tailored solutions for various needs, while ensuring a uniform '
              'quality level from the same service provider.')
    t[134] = ('The activities of SOUTARAH GROUP cover several fields, notably services related to vehicle rental, '
              'trading and import-export as well as project support and implementation. This diversity is one of '
              'SOUTARAH GROUP\'s main strengths. It allows the company to support its clients in various projects '
              'and offer them solutions corresponding to their specific needs.')
    t[135] = ('In an environment marked by the constant evolution of customer needs and the development of digital '
              'technologies, SOUTARAH GROUP aims to revolutionize the field of service provision. The company '
              'thus wishes to strengthen its positioning through its multisectoral expertise, constant innovation '
              'and commitment to customer satisfaction.')
    t[137] = '2. Mission, Vision and Values'
    t[138] = '\u2756 Mission'
    t[139] = ('The mission of SOUTARAH GROUP is to reinvent quality, reliable and tailored services. This mission '
              'reflects the company\'s willingness to offer its clients solutions adapted to their needs, while '
              'constantly seeking improvement in the quality and reliability of its services.')
    t[140] = '\u2756 Vision'
    t[141] = ('The vision of SOUTARAH GROUP is to be the preferred partner of our clients with innovative solutions, '
              'exceptional responsiveness and quality services.')
    t[142] = '\u2756 Values (S.A.P.E)\n  The values of SOUTARAH GROUP are grouped around the acronym S.A.P.E :'
    t[143] = ('S \u2014 Sustainable and innovative solution\n'
              'The company prioritizes the implementation of sustainable and innovative solutions to effectively '
              'respond to the needs of its clients.')
    t[144] = ('A \u2014 Adaptability\n'
              'SOUTARAH GROUP adapts to the different needs of its clients as well as to the changes in its professional environment.')
    t[145] = ('P \u2014 Customer priority\n'
              'Customer satisfaction is an essential element in the design and delivery of the services offered.')
    t[146] = ('E \u2014 Staff efficiency\n'
              'The company values the skills and efficiency of its staff to guarantee the quality of services delivered.')
    t[148] = '3. Services'
    t[149] = 'SOUTARAH GROUP operates in several business fields.'
    t[150] = ('\u27a2 Vehicle rental : The vehicle rental service offers mobility solutions adapted to different '
              'customer needs, whether for one-time trips or for longer periods.')
    t[151] = '\u27a2 Trading / Import-Export : Facilitate the supply and distribution of various goods.'
    t[152] = '\u27a2 Technical : The installation, maintenance and support of equipment and installations.'
    t[153] = '\u27a2 Renewable energies : Optimize energy consumption and promote the use of renewable energies.'
    t[154] = '\u27a2 Agropastoral : Agricultural production and livestock farming.'
    t[155] = '\u27a2 Real estate : The sale, rental and management of properties.'
    t[156] = '4. Partnerships'
    t[157] = 'Soutarah Group maintains collaborations with several companies including :'
    # t[158-162] = BESSAC, DM Company, CIM IVOIRE, Southcomp Polaris, Enabel → keep as is

    # ── Chapitre 2 ───────────────────────────────────────────────────────────
    t[187] = 'I. PROJECT CONTEXT AND RATIONALE'
    t[188] = ('The continuous growth of SOUTARAH GROUP\'s activities and the diversification of its business units '
              'have generated a considerable volume of quotation requests and reservations. Faced with this increasing '
              'workload, traditional manual processing mechanisms (isolated emails, informal phone exchanges, physical '
              'record-keeping) have shown their operational limitations. The lack of real-time visibility on vehicle '
              'availability and the lack of synchronization between commercial and technical departments motivated '
              'management to engage the integral digital transformation of its commercial ecosystem.')
    t[190] = 'II. EXISTING SYSTEM DIAGNOSIS AND LIMITATIONS'
    t[191] = ('The preliminary analysis of the existing infrastructure revealed that SOUTARAH GROUP only had a static '
              'showcase website. It presented the company but had no dynamic database management component, no customer '
              'authentication area, and no automated pricing mechanism. Requests submitted through basic contact forms '
              'ended up in a generic mailbox without traceability, making it impossible to produce reliable statistics '
              'and causing delays in the editing of official quotations.')
    t[193] = 'III. PROJECT OBJECTIVES'
    t[194] = '1. General Objective'
    t[195] = ('The general objective is to design and develop a unified software solution comprising a web platform '
              'for global service management and a mobile application dedicated to vehicle reservation, both '
              'synchronized in real-time via a secure REST API.')
    t[197] = '2. Specific Objectives'
    t[198] = 'Operationally, the project aims to :'
    t[199] = ('\u2022 Develop a modern web portal interactively presenting all 6 service units and the product catalog ;')
    t[200] = ('\u2022 Develop a native mobile application (Android / iOS) dedicated to real-time vehicle fleet '
              'consultation, fluid reservation with dynamic pricing and order status tracking ;')
    t[201] = ('\u2022 Implement a hybrid multi-item cart (vehicles and supplies) with an automated tax calculation '
              'engine (pre-tax, VAT 18%, TDT 2.5%) ;')
    t[202] = ('\u2022 Automate the generation of official pro-forma quotations in 2-page PDF format '
              '(with technical data sheets and visuals) ready for printing or electronic signature ;')
    t[203] = ('\u2022 Develop a centralized administration dashboard (Back-Office) for managing quotations, '
              'vehicles, customers and notifications ;')
    t[204] = '\u2022 Integrate a transactional email notification system.'
    t[205] = 'IV. SYSTEM SPECIFICATIONS'
    t[206] = ('The specifications formalize the functional and non-functional requirements of the interconnected system :')
    t[207] = ('1. Functional requirements for the Client (Web & Mobile) :\n'
              '  \u2022 Detailed consultation of the vehicle and product catalog by category ;\n'
              '  \u2022 Multi-criteria filtering of vehicles (brand, type, transmission, air conditioning) ;\n'
              '  \u2022 Selection of rental dates with dynamic calculation according to the destination pricing '
              '(Abidjan / Outside Abidjan) and the driver option ;\n'
              '  \u2022 Shopping cart / reservation management and one-click validation ;\n'
              '  \u2022 Instant download of the official PDF pro-forma quotation complying with the company\'s legal charter ;\n'
              '  \u2022 Personal quotation management area ;')
    t[208] = ('2. Functional requirements for the Administrator :\n'
              '  \u2022 Global supervision of key indicators (estimated turnover, active reservations) ;\n'
              '  \u2022 Complete vehicle fleet management (addition, modification, maintenance status) ;')
    t[209] = ('\u2022 Complete trading product management (adding products, modifying prices) ;\n'
              '  \u2022 Customer account management and partner discount allocation.')
    t[210] = ('3. Technical requirements and constraints :\n'
              '  \u2022 Security ;\n'
              '  \u2022 Availability and performance ;\n'
              '  \u2022 Portability : Compatibility with modern browsers (Chrome, Safari, Edge) and mobile devices.')
    t[211] = 'V. TASK SCHEDULING AND GANTT DIAGRAM'
    t[212] = ('The project took place over a two-month period (from August 3 to October 3, 2026), according to the following chronological breakdown :')
    t[214] = '1. Schedule'
    t[216] = '2. GANTT Diagram'
    t[218] = 'Figure 1 : GANTT Schedule Diagram'

    # ── PARTIE II ────────────────────────────────────────────────────────────
    t[223] = 'PART II'
    t[224] = 'CONCEPTUAL STUDY'
    t[243] = 'I. COMPARATIVE STUDY OF ANALYSIS METHODOLOGIES'
    t[244] = ('The success of a complex IT project requires a rigorous analysis and modeling phase. Two major '
              'methodological approaches were examined : the Cartesian MERISE method and the object-oriented UP/UML approach.')
    t[246] = 'Presentation of the MERISE method'
    t[247] = ('MERISE (Method for the Study and Implementation of Information Systems for Enterprises) is an analysis '
              'and design method for information systems. It structures system development by mainly separating data and processes.')
    t[248] = ('The method relies on different levels of modeling, including the conceptual, logical and physical '
              'levels, allowing a progressive transition from needs expression to system implementation.')
    t[249] = ('For data modeling, MERISE primarily uses the Conceptual Data Model (CDM), which represents entities, '
              'their properties and the relationships between them. The CDM can then be transformed into a Logical '
              'Data Model (LDM), then into a Physical Data Model (PDM) to account for the characteristics of the DBMS used.')
    t[250] = ('MERISE also allows representing the processes and treatments necessary for system operation. '
              'This approach thus facilitates the organization of information and the overall understanding of '
              'the information system before its implementation.')
    t[252] = 'Presentation of the UP/UML method'
    t[253] = ('The Unified Process (UP) is an iterative and incremental software development method. It allows '
              'organizing project development in several phases and progressively evolving the system, '
              'from requirements analysis to implementation.')
    t[255] = ('The UP relies on four main phases : inception, elaboration, construction and transition. '
              'This organization allows better tracking of project evolution, taking user needs into account '
              'and progressively correcting any errors.')
    t[256] = ('The UP relies on UML (Unified Modeling Language), a standardized graphical modeling language '
              'for representing the various aspects of a computer system. UML facilitates in particular the '
              'representation of actors, functionalities, processes, interactions and data structure through various diagrams.')
    t[258] = 'Comparative table : MERISE and UP/UML'
    t[261] = 'Choice of Analysis Methodology'
    t[262] = ('For the implementation of our project, we chose UML (Unified Modeling Language) as the modeling '
              'method, associating it with the Unified Process (UP). This choice is justified by the characteristics '
              'of the project and by the need to clearly represent the different functionalities of the system.')
    t[263] = ('Adaptation to Web and Mobile architectures : UML is object-oriented and adapts to modern software '
              'architectures. It particularly facilitates the design of exchanges between the frontend, the backend '
              'and the different components of the system.')
    t[264] = ('Functionality modeling : UML allows representing interactions between users and the system, '
              'as well as the different application functionalities through various diagrams.')
    t[265] = ('System evolution : thanks to its object-oriented modeling, UML facilitates the reuse and extension '
              'of software components. Models can also be progressively enriched when new functionalities are added.')
    t[266] = ('Thus, the choice of UML associated with the Unified Process provides a method adapted to our project, '
              'while facilitating its analysis, design and evolution.')
    t[269] = 'II. APPLICATION OF UP/UML TO THE SOUTARAH GROUP SYSTEM'
    t[270] = 'Within our project, the system integrates three main actors :'
    t[271] = ('\u2022 The Visitor / Client : consults the catalog, composes their multi-service cart on the Web, '
              'makes vehicle reservations on the Mobile application and downloads their PDF quotations ;')
    t[272] = ('\u2022 The Administrator : supervises all operations, manages the fleet, updates pricing '
              'and validates quotations ;')
    t[273] = ('\u2022 The System / REST API : applies business rules, controls availability and orchestrates '
              'notification distribution.')
    t[274] = '1. Use Case Diagrams'
    t[275] = ('The global use case diagram illustrates the interactions of actors with the two components '
              'of the platform (Web and Mobile).')
    t[276] = 'Figure 2 : Global Use Case Diagram (Web & Mobile)'
    t[278] = '\u2756 Textual description of the diagram'
    t[279] = 'Actor : Visitor'
    t[280] = 'Use case : Consult the site and services'
    t[281] = 'Actors involved : Visitor, Client'
    t[282] = 'Description : Allows discovering the activities and catalogs of Soutarah Group without an account.'
    t[283] = 'Preconditions : Internet access.'
    t[284] = 'Main scenario :'
    t[285] = 'The visitor accesses the site.'
    t[286] = 'They consult the services, catalogs and vehicles.'
    t[287] = 'Postconditions : The information is displayed.'
    t[288] = 'Use case : Use the AI assistant'
    t[289] = 'Actors involved : Visitor, Client'
    t[290] = 'Description : Allows asking questions and being automatically guided.'
    t[291] = 'Preconditions : None.'
    t[292] = 'Main scenario :'
    t[293] = 'The user opens the chat.'
    t[294] = 'They ask their question.'
    t[295] = 'The AI responds instantly.'
    t[296] = 'Postconditions : The user receives the requested information.'
    t[297] = 'Use case : Register and Log in'
    t[298] = 'Actors involved : Visitor, Client'
    t[299] = 'Description : Allows creating an account and accessing the personal area.'
    t[300] = 'Preconditions : Have a valid email address.'
    t[301] = 'Main scenario :'
    t[302] = 'The user enters their credentials.'
    t[303] = 'The system verifies and validates access.'
    t[304] = 'Postconditions : The user is connected as a Client.'
    t[306] = 'Actor : Client (Web / Mobile)'
    t[307] = 'Use case : Reserve a vehicle'
    t[308] = 'Actors involved : Client (Mobile / Web)'
    t[309] = 'Description : Allows choosing and reserving a vehicle from the fleet of 21 vehicles.'
    t[310] = 'Preconditions : The client must be logged in.'
    t[311] = 'Main scenario :'
    t[312] = 'The client chooses a vehicle and their rental dates.'
    t[313] = 'The system verifies availability in real time.'
    t[314] = 'The client confirms their reservation.'
    t[315] = 'Postconditions : The reservation is recorded pending validation.'
    t[316] = 'Use case : Request a quotation'
    t[317] = 'Actors involved : Client'
    t[318] = 'Description : Allows submitting a priced request for a service or product.'
    t[319] = 'Preconditions : The client must be logged in.'
    t[320] = 'Main scenario :'
    t[321] = 'The client selects their needs and validates their request.'
    t[322] = 'The system generates the downloadable pro-forma quotation.'
    t[323] = 'Postconditions : The quotation request is transmitted to the administration.'
    t[324] = 'Use case : Pay an order'
    t[325] = 'Actors involved : Client'
    t[326] = 'Description : Allows paying a deposit or an online order.'
    t[327] = 'Preconditions : Have a validated reservation or cart.'
    t[328] = 'Main scenario :'
    t[329] = 'The client chooses their payment method (Mobile Money or Card).'
    t[330] = 'They complete the transaction.'
    t[331] = 'The system confirms the payment.'
    t[332] = 'Postconditions : Payment is validated and the receipt is generated.'
    t[334] = 'Actor : Administrator'
    t[335] = 'Use case : Consult the dashboard'
    t[336] = 'Actors involved : Administrator'
    t[337] = 'Description : Allows monitoring key indicators (turnover, reservations, activities).'
    t[338] = 'Preconditions : The administrator must be logged in.'
    t[339] = 'Main scenario :'
    t[340] = 'The administrator accesses the back-office.'
    t[341] = 'The system displays statistics and KPIs.'
    t[342] = '\u2022 Postconditions : The administrator views the general state of the platform.'
    t[343] = 'Use case : Manage vehicles'
    t[344] = 'Actors involved : Administrator'
    t[345] = 'Description : Allows adding, modifying and tracking the status of the fleet of 21 vehicles.'
    t[346] = 'Preconditions : The administrator must be logged in.'
    t[347] = 'Main scenario :'
    t[348] = 'The administrator accesses the vehicle list.'
    t[349] = 'They update availabilities, pricing or technical conditions.'
    t[350] = 'Postconditions : Fleet information is updated on web and mobile.'
    t[351] = 'Use case : Receive quotations and mark as read'
    t[352] = 'Actors involved : Administrator'
    t[353] = 'Description : Allows consulting received quotations and indicating their processing.'
    t[354] = 'Preconditions : The administrator must be logged in.'
    t[355] = 'Main scenario :'
    t[356] = 'The administrator opens the quotation request list.'
    t[357] = 'They consult the quotation content.'
    t[358] = 'They click on "Mark as read".'
    t[359] = 'Postconditions : The quotation status changes to "Read / In processing".'
    t[363] = '2. Activity Diagrams'
    t[365] = '2.1. Activity Diagram : Customer Account Creation and Management'
    t[366] = ('The following activity diagram explains the vehicle reservation process, highlighting '
              'the algorithmic anti-collision date control.')
    t[368] = 'Figure 3 : Activity Diagram : Customer Account Creation and Management'
    t[370] = '2.2. Activity Diagram : Vehicle Reservation'
    t[371] = ('The Vehicle Reservation activity diagram illustrates the process by which a client makes a vehicle '
              'rental on the SOUTARAH platform. The process begins when the client chooses a vehicle and enters '
              'their rental dates. The system then verifies availability : if the vehicle is unavailable, the client '
              'is informed and can modify their dates or change vehicle. If it is available, the vehicle is added '
              'to the cart. When the client validates their cart, the system automatically generates the quotation '
              'and redirects them to the order page. The client then chooses their payment method (online by '
              'card/Mobile Money or cash on delivery) and confirms their order. The system automatically validates '
              'the quotation, records the reservation in the database and transmits the order to the administrator. '
              'The latter no longer needs to approve the quotation : they receive the notification, consult the '
              'order details and simply mark the quotation as read to prepare the vehicle. Finally, the client '
              'receives their reservation confirmation. This diagram thus highlights the nominal order flow and '
              'the simplified processing on the administration side.')
    t[376] = 'Figure 4 : Activity Diagram : Vehicle Reservation'
    t[383] = '2.3. Activity Diagram : Product Purchase'
    t[384] = ('The Product Purchase activity diagram illustrates the process by which a client purchases an item '
              'on the SOUTARAH platform. The process begins when the client browses the catalog, chooses a product '
              'and adds it to their cart. The system then calculates and instantly displays in the cart the detailed '
              'amounts (pre-tax, VAT and total inclusive of tax). When the client validates their cart and proceeds '
              'to order, the system generates the official timestamped quotation and presents the available payment '
              'methods. The client chooses their payment method, either online (by bank card or Mobile Money), '
              'or cash on delivery, then confirms their order. The system then records the order in the database, '
              'automatically validates the quotation and notifies the administrator. The latter consults the order '
              'details and simply marks the quotation as read in order to initiate the preparation and shipment of '
              'the item. Finally, the client receives their order confirmation. This diagram thus highlights the '
              'direct purchase flow and the transparency of calculations from the cart stage.')
    t[389] = 'Figure 5 : Activity Diagram : Product Purchase'
    t[392] = '3. Sequence Diagrams'
    t[394] = '3.1. Sequence Diagram : Online Payment'
    t[395] = ('This sequence diagram presents the flow of an electronic financial transaction carried out via the '
              'Genius Pay gateway (integrating bank cards and local Mobile Money solutions). Upon cart confirmation, '
              'the API server initializes a secure payment session and redirects the client to the external payment '
              'gateway. After bank authorization and debit, the gateway notifies the API server via a secure webhook '
              'to set the order status to paid in the database. The Brevo service immediately dispatches an electronic '
              'receipt to the client, while the web interface displays the payment confirmation screen.')
    t[396] = 'Figure 6 : Sequence Diagram : Secure Online Payment'
    t[399] = '3.2. Sequence Diagram : Vehicle Reservation'
    t[400] = ('This sequence diagram illustrates the complete sequence of a vehicle reservation on the platform. '
              'When the client selects a car and a rental period, the web interface queries the API server to check '
              'for the absence of scheduling conflicts in the database. Once availability is validated and the order '
              'is confirmed by the client, the API records the reservation and the associated quotation, then triggers '
              'the Brevo messaging service to instantly send confirmation emails to the client and administrator. '
              'In their management area, the administrator accesses the detailed order sheet and marks the quotation '
              'as read, which initiates the operational preparation of the vehicle without requiring manual quotation validation.')
    t[401] = 'Figure 7 : Sequence Diagram : Vehicle Reservation'
    t[404] = '3.3. Sequence Diagram : Product Purchase'
    t[405] = ('The Product Purchase sequence diagram describes the flow of merchandise acquisition from the trading '
              'catalog. Upon order validation, the data is transmitted to the API server which adds the transaction '
              'to the database and automatically validates the corresponding quotation. The Brevo service is then '
              'called upon to send the purchase summary to the client and alert the administrator of the new order. '
              'The latter consults the specifications of the ordered items on their dashboard and marks the quotation '
              'as read in order to schedule parcel preparation and delivery.')
    t[406] = 'Figure 8 : Sequence Diagram : Product Purchase'
    t[408] = '3.4. Sequence Diagram : User Registration'
    t[409] = ('This sequence diagram describes the registration process of a new user on the SOUTARAH platform. '
              'The visitor enters their information (individual or company) via the web interface form. This data '
              'is transmitted to the API server, which first checks the uniqueness of the email address and phone '
              'number against the database. After confirming the absence of duplicates, the API server secures the '
              'password by Bcrypt hashing then inserts the user and client profile records into the database. '
              'The API server then calls the Brevo service to send a welcome and confirmation email to the visitor, '
              'while the web interface confirms the account creation and redirects them to the login page.')
    t[410] = 'Figure 9 : Sequence Diagram : User Registration'
    t[412] = '4. Class Diagram'
    t[413] = ('It represents the static structure of the system by describing classes, their attributes, their '
              'methods and the relationships between them. It is generally developed after a thorough understanding '
              'of the system\'s needs and interactions, in order to serve as a basis for the implementation phase.')

    # ── PARTIE III ───────────────────────────────────────────────────────────
    t[422] = 'PART III'
    t[423] = 'TECHNICAL STUDY'
    t[441] = 'I. ANALYSIS AND JUSTIFICATION OF TECHNOLOGICAL CHOICES'
    t[442] = ('The choice of technologies and tools represents a decisive step in the implementation of a project. '
              'To guarantee the relevance and effectiveness of the decisions made, an in-depth analysis of available '
              'market solutions was carried out, taking into account the project\'s specificities, our competencies '
              'and long-term objectives. This approach was based on several essential selection criteria : performance '
              'and scalability, cost and licensing conditions, security, integration flexibility, as well as the '
              'quality of documentation and accessibility of technical support. These elements guided the technological '
              'choices towards solutions that are both robust, adapted and sustainable.')
    t[444] = 'Development Environment (IDE)'
    t[447] = ('Visual Studio Code was selected for its lightness, its native support for the JavaScript/TypeScript '
              'ecosystem, its extensions for React, React Native and MySQL, as well as its integrated terminal.')
    t[451] = 'UI/UX Prototyping Tool'
    t[455] = ('Figma is an online interface design tool (UI/UX), used to create interactive and collaborative '
              'mockups. Accessible from a simple browser, it allows teams to design and share visually clear '
              'prototypes. In the context of a web project, it facilitates the visualization of the interface '
              'before development.')
    t[458] = '3. Web Frontend Technologies'
    t[461] = ('For the web platform, the React.js framework coupled with CSS was chosen. Its architecture based '
              'on virtual DOM and reusable components provides a reactive and modular interface, facilitating '
              'smooth navigation between the catalog, the interactive cart and the administration dashboard.')
    t[464] = '4. Mobile Technologies'
    t[466] = ('For the mobile component, React Native associated with the Expo ecosystem was selected. This '
              'technology offers a single TypeScript/JavaScript code compiled natively for Android and iOS, '
              'guaranteeing high performance, easy access to hardware functionalities (file system, PDF sharing) '
              'and a substantial reduction in development costs.')
    t[468] = '5. Backend and API Technologies'
    t[470] = ('The application server is based on Node.js and the Express.js framework. This choice allows '
              'maintaining the same language (JavaScript/TypeScript) throughout the software chain. The stateless '
              'REST architecture based on JSON exchanges and secured by JWT tokens guarantees perfect scalability '
              'and feeds both the Web application and the Mobile application equally.')
    t[472] = '6. Notification and Messaging Technologies'
    t[473] = ('To ensure the sending of notifications and electronic messages, Brevo was selected. It allows '
              'automating the sending of emails related to the different actions of the platform, notably '
              'reservation confirmations, order notifications and messages to clients.')
    t[474] = ('Its API integration allows centralizing and automating communications with users, while '
              'facilitating its use with web and mobile applications.')
    t[476] = '6. Online Payment Technologies'
    t[481] = '7. Deployment Technologies'
    t[483] = 'To ensure the online deployment of the platform, Hostinger was selected.'
    t[484] = ('The choice of Hostinger is explained notably by its ease of deployment, its accessible cost and '
              'its compatibility with the technologies used in the project.')
    t[487] = 'II. DATABASE MANAGEMENT SYSTEM (DBMS)'
    t[488] = ('The choice of database management system (DBMS) is an important step in the design and deployment '
              'of an application. It must meet the system\'s needs in terms of performance, security, reliability, '
              'scalability and ease of maintenance. As part of the SOUTARAH GROUP project, several solutions were')
    t[489] = ('studied, including MySQL, PostgreSQL, SQL Server, Oracle and MongoDB. The analysis focused on their '
              'data model, performance, cost and ease of integration.')
    t[491] = 'Comparison of Major DBMS Solutions'
    t[495] = '2. DBMS Selection'
    t[496] = ('After comparing the different solutions, MySQL was selected as the database management system for our project.')
    t[497] = ('This choice is explained first by the nature of the data handled by the platform. The application '
              'must manage several structured pieces of information such as customers, vehicles, reservations, '
              'products, orders and quotations.')
    t[498] = ('Another determining factor in this choice concerns the development environment. The hosting offer '
              'purchased by SOUTARAH GROUP only supports MySQL. The choice of this DBMS thus ensures better '
              'compatibility between the developed application and the hosting infrastructure.')
    t[499] = ('Finally, MySQL has an ecosystem widely used in web development and integrates easily with the '
              'different technologies used in the project. It is thus a reliable, efficient, accessible and '
              'adapted solution.')
    t[502] = 'III. GENERAL SYSTEM ARCHITECTURE'
    t[503] = 'Our solution is based on a three-tier distributed architecture (3-tiers) :'
    t[504] = 'Presentation Level (Clients) : Users interact with the system via two complementary channels :'
    t[505] = ('A mobile application (React Native / Expo) dedicated specifically to clients for consulting '
              'the vehicle fleet and making online reservations ;')
    t[506] = ('A web platform (React / Vite) enabling global service management, quotation requests '
              'and administrative tracking (Back-Office).')
    t[507] = ('Network Level (Internet) : Ensures the secure connection between clients and the server '
              'through the HTTPS protocol and REST API requests exchanging data in JSON format.')
    t[508] = ('Business and Data Level (Server & DB) : A Node.js / Express application server handles '
              'the business logic (automatic availability verification anti-double-booking, quotation calculation, '
              'JWT security) and communicates with a MySQL database for data persistence.')
    t[510] = 'Figure 19 : General System Architecture Diagram'

    # ── PARTIE IV ────────────────────────────────────────────────────────────
    t[520] = 'PART IV'
    t[521] = 'SYSTEM IMPLEMENTATION AND DEPLOYMENT'
    t[538] = 'I. MYSQL DATABASE IMPLEMENTATION'
    t[539] = ('The MySQL database was designed to guarantee the consistency of transactional flows. It groups the following main tables :')
    t[540] = ('\u2022 Users & Clients : management of identifiers (email, hashed password, role \'CLIENT\' or \'ADMIN\') '
              'and links to individual or company profiles ;')
    t[541] = '\u2022 Vehicles : brand, model, category, daily rate, status, photographs ;'
    t[542] = '\u2022 Reservations : start and end dates, driver option with/without, total amount, status ;'
    t[543] = '\u2022 Services & Products : general catalog of the 6 business units with technical characteristics and pricing ;'
    t[544] = '\u2022 Quotations : unique reference (e.g.: DMD-2026-XXXX), creation date, pre-tax/inclusive amount ;'
    t[545] = '\u2022 Notifications : alerts sent to clients and administrators.'

    # Paragraph 546 = section II heading (has image) - keep structure
    t[549] = 'II. IMPLEMENTATION OF THE AI ASSISTANT AND TRANSACTIONAL NOTIFICATION SERVICE (BREVO / SMTP)'
    t[550] = ('To modernize customer relations and streamline operational communication at SOUTARAH GROUP, '
              'we have enriched the platform with two modules : an intelligent conversational agent and an '
              'automated transactional email service.')
    t[552] = '1. Intelligent Virtual Assistant (AI Agent)'
    t[553] = ('To guide visitors and assist managers, a virtual agent based on an advanced language model (LLM) was developed :')
    t[554] = ('Technical Architecture : It is built around a floating interactive React widget connected via a '
              'secure REST API to the backend service. The latter queries the OpenAI model (gpt-4o-mini) by '
              'dynamically injecting in context the real-time data from the MySQL database (available vehicles, '
              'technical characteristics, pricing and stock levels).')
    t[555] = ('Customer Role : The assistant understands requests expressed in natural language (e.g. : "I am '
              'looking for an air-conditioned vehicle for 5 people for Yamoussoukro"), proposes the appropriate '
              'model and generates clickable action buttons to instantly redirect the user to the vehicle sheet '
              'or to the cart.')
    t[556] = ('Administrator Role : When the user is authenticated with the ADMIN role, the assistant transforms '
              'into a decision-support tool : it executes aggregation queries to answer management questions '
              '(products near the stock threshold, most rented vehicles, volume of pending quotations).')
    t[558] = '2. Messaging and Transactional Notification Service (Brevo / SMTP)'
    t[559] = ('To guarantee traceability and respond without delay to commercial leads, an email notification system was implemented :')
    t[560] = ('Delivery Infrastructure : To send emails, our Node.js server uses the Nodemailer tool, which '
              'prepares and formats the messages. These messages are then transmitted to the professional Brevo '
              'service, which handles their distribution to recipients. Communication with Brevo is fully '
              'encrypted and secured (TLS protocol).')
    t[561] = ('Client Notifications : The system automatically triggers the sending of an email upon registration '
              'of a new user, upon reservation confirmation, and delivers the official pro-forma quotation in '
              'PDF format (2 pages) as soon as the cart is validated.')
    t[562] = ('Administrator Alerts : As soon as a client adds a vehicle reservation or an item to their cart, '
              'an immediate alert is transmitted to the commercial team with the client\'s contact details, '
              'the date details and the estimated amounts, enabling proactive handling.')
    t[564] = '3. Secure Online Payment Module (Genius Pay)'
    t[565] = ('To secure payments and automate order validation, a payment gateway has been integrated via Genius Pay :')
    t[566] = ('Infrastructure and Gateway : Our Node.js server initializes the transaction via the Genius Pay '
              'REST API and redirects the client to its secure, encrypted gateway (TLS). No sensitive banking '
              'data transits through our servers, guaranteeing optimal security.')
    t[567] = ('Payment Methods : The platform accepts bank cards (Visa, Mastercard) as well as local Mobile Money. '
              'The transaction is protected by strong authentication (OTP/SMS code) before any actual debit.')
    t[568] = ('Validation and Notifications : After bank validation, Genius Pay directly notifies our API via '
              'Webhook to set the order status to "PAID" in the database. The Brevo service immediately '
              'dispatches the electronic receipt to the client, while in case of refusal, an alert invites to retry.')
    t[570] = 'III. IMPLEMENTATION OF WEB PLATFORM INTERFACES'
    t[571] = 'The web portal was developed with a modern aesthetic respecting SOUTARAH\'s graphic charter :'
    t[572] = '1. Home and Authentication Pages'
    t[574] = ('The home page is the digital front door. It presents the company history, the S.A.P.E values, '
              'the business units and integrates an intelligent virtual assistant guiding users.')
    t[576] = ('The login page allows the client to access their personal area by entering their login credentials, '
              'specifically their email address and password. After verification of this information, the client '
              'is authenticated and can access the different functionalities reserved for them.')
    t[578] = '2. Product Catalog'
    t[579] = ('Allows clients to browse supplies, construction materials and tools, with the option of direct '
              'addition to the cart.')
    t[581] = '3. Vehicle Reservation Module'
    t[582] = ('Allows selecting a vehicle, specifying precise pickup and return dates, and opting for a driver.')
    t[595] = '4. Multi-Item Cart and PDF Quotation Generation'
    t[596] = ('The cart groups both vehicle reservations and physical products, calculates regulatory taxes '
              'and generates the downloadable pro-forma quotation instantly.')
    t[597] = 'Figure 25 : Web Interface : Multi-Item Cart and PDF Quotation'
    t[599] = '5. Customer Portal and Request Tracking'
    t[600] = 'Offers the authenticated user an overview of their pending quotations.'
    t[602] = 'Figure 26 : Web Interface : Customer Portal and Request Tracking'
    t[605] = 'IV. IMPLEMENTATION OF THE MOBILE RESERVATION APPLICATION'
    t[606] = ('The \'SOUTARAH Mobile\' application provides a tailored response to mobility by focusing on '
              'the vehicle rental service :')
    t[608] = '1. Home Screen and Detailed Vehicle Sheet'
    t[609] = ('The home screen displays available vehicles categorized (SUV, Sedans, Utilities) with dynamic '
              'filters, daily rate and high-definition visuals. The detailed sheet presents the vehicle\'s '
              'technical characteristics (air conditioning, gearbox, fuel), integrates a calendar selector '
              'and instantly calculates the total cost according to destination and driver option.')
    t[612] = 'Figure 27 : Mobile Application : Home Screen and Detailed Vehicle Sheet'
    t[613] = '2. Mobile Cart'
    t[614] = ('Allows adjusting quantities or rental durations, entering special delivery instructions '
              'and validating the request in real time.')
    t[617] = 'V. IMPLEMENTATION OF THE ADMINISTRATIVE BACK-OFFICE'
    t[618] = 'The Web Back-Office is the control center of the company. It integrates :'
    t[619] = ('\u2022 Dashboard : performance charts, projected turnover, number of quotations and '
              'reservations in progress ;')
    t[620] = ('\u2022 Fleet and trading product management : addition of new vehicles, products, '
              'update of daily prices ;')
    t[638] = 'Figure 29 : Administration Interface : Fleet and Vehicle Fleet Management'
    t[642] = 'I. FUNCTIONAL TESTING AND VALIDATION'
    t[643] = ('A comprehensive testing campaign was conducted to validate the robustness and integrity of the '
              'interconnected solution :')
    t[646] = 'II. FINANCIAL ASSESSMENT AND COST ESTIMATION'
    t[647] = '1. Hardware and Software Costs'
    t[648] = ('All retained development technologies (React, React Native, Node.js, MySQL, Expo) being based on '
              'free Open Source licenses, direct software development costs are zero. The hardware investment '
              'focused on the workstation and mobile testing terminals.')
    t[649] = '2. Hosting and Maintenance Costs'
    t[650] = 'For production deployment, the estimated annual costs are broken down as follows :'
    t[652] = 'III. Profitability, Return on Investment (ROI) and Evolution Perspectives'
    t[653] = '1. Immediate Profitability and Return on Investment'
    t[654] = ('The automation of the reservation and quotation generation process allows SOUTARAH GROUP to reduce '
              'by more than 80% the administrative time devoted to processing a client file (going from 45 minutes '
              'to less than 3 minutes). This immediate commercial responsiveness, combined with the total elimination '
              'of operating losses related to double bookings, allows a complete return on investment from the '
              'first operating quarter.')
    t[656] = '2. Platform Evolution Perspectives'
    t[657] = ('To support the company\'s development, the modular architecture implemented will allow deploying '
              'in the short and medium term :')
    t[658] = ('Loyalty program : Awarding reward points for each reservation or order, exchangeable for discounts '
              'or free services, to strengthen customer retention ;')
    t[659] = ('Telematics and GPS tracking : Integration of connected trackers on vehicles to track journeys '
              'in real time and schedule mechanical maintenance ;')
    t[660] = ('Native Push notifications : Instant alert on smartphone via Firebase Cloud Messaging '
              'for reservation tracking ;')

    # ── Conclusion ───────────────────────────────────────────────────────────
    t[663] = 'GENERAL CONCLUSION'
    t[664] = ('At the end of this internship carried out within SOUTARAH GROUP, we have successfully completed '
              'the design and full implementation of a unified digital solution, responding to the theme : '
              '"Design and development of a digital management platform for the services of SOUTARAH GROUP '
              'integrating a mobile application dedicated to vehicle reservation".')
    t[666] = ('This project has profoundly transformed the company\'s commercial practices by replacing manual '
              'methods with a modern, coherent and interconnected software ecosystem. The rigorous methodological '
              'approach based on the Unified Process and UML modeling (UP/UML) guaranteed a precise analysis of '
              'needs and flawless structuring of the relational MySQL database.')
    t[668] = ('On the technical level, the synergy between the web platform developed under React.js and the '
              'mobile application designed under React Native/Expo, both articulated around a Node.js/Express '
              'REST API, allowed achieving all the set objectives. Users now have total visibility on the '
              '6 business units of the company, a fluid reservation module with anti-double-booking algorithm, '
              'an interactive multi-item cart and an instant official PDF quotation generation tool.')
    t[670] = ('On a personal and academic level, this project was a particularly enriching experience. It allowed '
              'us to consolidate the theoretical knowledge received at the \u00c9cole Sup\u00e9rieure d\'Industrie (ESI) '
              'of INP-HB, to understand the constraints of software engineering in a professional environment '
              'and to master cutting-edge full-stack technologies.')

    # ── Bibliographie ─────────────────────────────────────────────────────────
    t[672] = 'BIBLIOGRAPHY'
    t[673] = 'I. REFERENCE BOOKS AND METHODOLOGICAL MANUALS :'
    t[674] = ('AUDIBERT, Laurent. "UML Course : Object Modeling and Diagrams", Eyrolles Editions / University Institute, pages 21-46.')
    t[675] = ('ROQUES, Pascal. "UML 2 in Practice : Case Studies and Corrected Exercises", Eyrolles Editions, 7th edition, 2021, 394 pages.')
    t[677] = 'II. ACADEMIC COURSE MATERIALS (INP-HB / ESI) :'
    t[678] = ('Zana Y\u00e9o. "Serveur-HTTP-et-Express.js", Course materials, STIC, ESI / INP-HB Yamoussoukro, 2025-2026.')

    # ── Webographie ───────────────────────────────────────────────────────────
    t[697] = 'WEBOGRAPHY'
    t[698] = ('REACT.JS. "Official React 18 Documentation and Virtual DOM", Meta Open Source. Available at : '
              'https://react.dev (Accessed August 30, 2026).')
    t[699] = ('REACT NATIVE & EXPO. "Cross-Platform Native Mobile Development with Expo Framework". '
              'Available at : https://reactnative.dev and https://docs.expo.dev (Accessed September 15, 2026).')
    t[700] = 'BREVO. Available at : https://brevo.com (Accessed September 1, 2026).'

    # ── Table des matières détaillée ─────────────────────────────────────────
    t[720] = 'DETAILED TABLE OF CONTENTS'
    t[721] = 'DEDICATION\t - 1 -'
    t[722] = 'ACKNOWLEDGEMENTS\t - 2 -'
    t[723] = 'FOREWORD\t - 3 -'
    t[724] = 'TABLE OF CONTENTS\t - 5 -'
    t[725] = 'LIST OF FIGURES\t - 6 -'
    t[726] = 'LIST OF TABLES\t - 7 -'
    t[727] = 'LIST OF ABBREVIATIONS\t - 8 -'
    t[728] = 'ABSTRACT\t - 9 -'
    t[729] = 'GENERAL INTRODUCTION\t - 10 -'
    t[730] = 'PART I : PROJECT FRAMEWORK AND CONTEXT\t - 11 -'
    t[731] = 'Chapter 1 : Host Organization Overview\t - 12 -'
    t[732] = 'I. Presentation of SOUTARAH GROUP\t - 12 -'
    t[733] = '1. General Presentation\t - 12 -'
    t[734] = '2. Mission, Vision and Values\t - 12 -'
    t[735] = '3. Business Fields and Services\t - 13 -'
    t[736] = '4. Partnerships\t - 14 -'
    t[737] = 'Chapter 2 : Project Overview\t - 15 -'
    t[738] = 'I. Project Context and Rationale\t - 15 -'
    t[739] = 'III. Existing System Diagnosis and Limitations\t - 15 -'
    t[740] = 'III. Project Objectives\t - 15 -'
    t[741] = '1. General Objective\t - 15 -'
    t[742] = '2. Specific Objectives\t - 16 -'
    t[743] = 'IV. System Specifications\t - 16 -'
    t[744] = '1. Functional Requirements for the Client\t - 16 -'
    t[745] = '2. Functional Requirements for the Administrator\t - 17 -'
    t[746] = '3. Technical Requirements and Constraints\t - 17 -'
    t[747] = 'V. Task Scheduling and GANTT Diagram\t - 17 -'
    t[748] = '1. Forecast Schedule\t - 17 -'
    t[749] = '2. GANTT Diagram\t - 18 -'
    t[750] = 'PART II : CONCEPTUAL STUDY\t - 19 -'
    t[751] = 'Chapter 3 : Choice of Analysis Methodology\t - 20 -'
    t[752] = 'I. Comparative Study of Analysis Methodologies\t - 20 -'
    t[753] = '1. Presentation of the MERISE Method\t - 20 -'
    t[754] = '2. Presentation of the UP/UML Method\t - 20 -'
    t[755] = '3. Comparative Table : MERISE and UP/UML\t - 21 -'
    t[756] = '4. Choice of Analysis Methodology\t - 22 -'
    t[757] = 'II. Application of UP/UML to the SOUTARAH GROUP System\t - 22 -'
    t[758] = '1. Use Case Diagrams\t - 23 -'
    t[759] = '\u2756 Textual Description of Use Cases\t - 23 -'
    t[760] = '2. Activity Diagrams\t - 27 -'
    t[761] = '2.1. Customer Account Creation and Management\t - 27 -'
    t[762] = '2.2. Vehicle Reservation with Availability Control\t - 28 -'
    t[763] = '2.3. Product Purchase Process\t - 30 -'
    t[764] = '3. Sequence Diagrams\t - 32 -'
    t[765] = '3.1. Secure Online Payment\t - 32 -'
    t[766] = '3.2. Vehicle Reservation\t - 33 -'
    t[767] = '3.3. Product Purchase\t - 34 -'
    t[768] = '3.4. User Registration\t - 35 -'
    t[769] = '4. Class Diagram\t - 36 -'
    t[770] = 'PART III : TECHNICAL STUDY\t - 37 -'
    t[771] = 'Chapter 4 : System Design and Technological Choices\t - 38 -'
    t[772] = 'I. Analysis and Justification of Technological Choices\t - 38 -'
    t[773] = '1. Development Environment\t - 38 -'
    t[774] = '2. UI/UX Prototyping Tool\t - 38 -'
    t[775] = '3. Web Frontend Technologies\t - 39 -'
    t[776] = '4. Mobile Technologies\t - 39 -'
    t[777] = '5. Backend and REST API Technologies\t - 40 -'
    t[778] = '6. Notification and Messaging Technologies\t - 40 -'
    t[779] = '7. Hosting and Deployment Platform\t - 40 -'
    t[780] = 'II. Database Management System (DBMS)\t - 41 -'
    t[781] = '1. Comparison of Major DBMS Solutions\t - 41 -'
    t[782] = '2. Choice and Justification of MySQL\t - 42 -'
    t[783] = 'III. General System Architecture\t - 42 -'
    t[784] = 'PART IV : SYSTEM IMPLEMENTATION AND DEPLOYMENT\t - 44 -'
    t[785] = 'Chapter 5 : Development of the Web Platform and Mobile Application\t - 45 -'
    t[786] = 'I. MySQL Database Implementation\t - 45 -'
    t[787] = 'II. Implementation of the AI Assistant and Notifications (Brevo)\t - 46 -'
    t[788] = '1. Intelligent Virtual Assistant (AI Agent)\t - 46 -'
    t[789] = '2. Messaging and Notification Service (Brevo / SMTP)\t - 46 -'
    t[790] = '3. Secure Online Payment Module (Genius Pay)\t - 47 -'
    t[791] = 'III. Implementation of Web Platform Interfaces\t - 48 -'
    t[792] = '1. Home and Authentication Pages\t - 48 -'
    t[793] = '2. Product Catalog\t - 49 -'
    t[794] = '3. Vehicle Reservation Module\t - 49 -'
    t[795] = '4. Multi-Item Cart and PDF Quotation Generation\t - 50 -'
    t[796] = '5. Customer Portal and Request Tracking\t - 50 -'
    t[797] = 'IV. Implementation of Mobile Reservation Application\t - 51 -'
    t[798] = '1. Home Screen and Detailed Vehicle Sheet\t - 51 -'
    t[799] = '2. Mobile Cart\t - 52 -'
    t[800] = 'V. Implementation of the Administrative Back-Office\t - 52 -'
    t[801] = 'Chapter 6 : System Deployment\t - 54 -'
    t[802] = 'I. Functional Testing and Validation (Acceptance Book)\t - 54 -'
    t[803] = 'II. Financial Assessment and Cost Estimation\t - 55 -'
    t[804] = '1. Hardware and Software Costs\t - 55 -'
    t[805] = '2. Annual Hosting and Maintenance Costs\t - 55 -'
    t[806] = 'III. Profitability, Return on Investment and Perspectives\t - 56 -'
    t[807] = '1. Immediate Profitability and Return on Investment (ROI)\t - 56 -'
    t[808] = '2. Platform Evolution Perspectives\t - 56 -'
    t[809] = 'GENERAL CONCLUSION AND PERSPECTIVES\t - 57 -'
    t[810] = 'BIBLIOGRAPHY\t - 58 -'
    # ... continue for remaining entries

    return t


def get_table_translations():
    """
    Returns translations for table cells.
    Format: { table_index : { (row, col) : "translation" } }
    """
    tables = {}

    # Table 1: Planning prévisionnel (Gantt table)
    tables[0] = {
        (0, 0): 'No.',
        (0, 1): 'Task Description',
        (0, 2): 'Start Date',
        (0, 3): 'Duration',
        (0, 4): 'End Date',
        (1, 1): 'Initial contact, immersion and project understanding',
        (2, 1): 'Existing system study and specification writing',
        (3, 1): 'Conceptual modeling UP/UML',
        (4, 1): 'Backend API Node.js / Express and database development',
        (5, 1): 'Web Platform React.js & CSS development',
        (6, 1): 'Mobile Application React Native / Expo development',
        (7, 1): 'Integration testing and corrections',
    }

    # Table 2: Comparaison MERISE / PU-UML
    tables[1] = {
        (0, 0): 'Criterion',
        (0, 1): 'MERISE',
        (0, 2): 'UP/UML',
        (1, 0): 'Approach',
        (1, 1): 'Data/process separation',
        (1, 2): 'Object-oriented',
        (2, 0): 'Modeling language',
        (2, 1): 'Specific (MCD, MCT)',
        (2, 2): 'Standardized (UML)',
        (3, 0): 'Compatibility with Web/Mobile',
        (3, 1): 'Limited',
        (3, 2): 'Excellent',
        (4, 0): 'Iterative',
        (4, 1): 'No',
        (4, 2): 'Yes',
        (5, 0): 'Tool support',
        (5, 1): 'Low',
        (5, 2): 'Very wide',
    }

    return tables


if __name__ == '__main__':
    main()
