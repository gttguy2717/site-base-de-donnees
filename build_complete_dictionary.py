# -*- coding: utf-8 -*-
"""
build_complete_dictionary.py
Builds the 100% complete and accurate translation dictionary for all 474 paragraphs
and 6 tables of Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx.
STRICT COMPLIANCE:
- Translate EXACTLY what is in the French report without adding or omitting anything.
- Preserve every list bullet, paragraph, and formatting structure.
"""
import json
from docx import Document

doc = Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

# Load existing translations from create_english_report.py
loc = {}
with open('create_english_report.py', encoding='utf-8') as f:
    exec(compile(f.read(), 'create_english_report.py', 'exec'), loc)
base_map = loc['build_translation_map']()

# We will build trans: { int_idx: str_en_translation }
trans = {}

# Copy verified direct matches from base_map
for k, v in base_map.items():
    if v is not None:
        trans[k] = v

# ═══════════════════════════════════════════════════════════════════════════════
# 1. PRELIMINARIES (0 - 112)
# ═══════════════════════════════════════════════════════════════════════════════
trans[1] = "DEDICATION"
trans[2] = (
    "I dedicate this modest work to my entire family and to all those who supported me, "
    "near and far, throughout my academic journey.\n\n"
    "Particular dedications to :\n\n"
    "•  My father, Mr. SORHO YETIENA, for his benevolent guidance, his wisdom and his precious advice ;\n"
    "•  My mother, Mrs. SORHO SANABA, for her unconditional love, her constant prayers and her unwavering support ;\n"
    "•  My sister, SORHO ESLIE, for her constant encouragement and her reassuring dynamism.\n\n"
    "To all those who have contributed to making me the person I am today, please find here the expression of my deep gratitude."
)

trans[5] = "ACKNOWLEDGEMENTS"
trans[6] = (
    "I would like to express my sincere thanks to Mr. Kologo Harouna, Director of Soutarah Group, "
    "as well as to my internship supervisor, for their welcome, their guidance, their advice and their "
    "availability throughout my internship. Also, this report was made possible thanks to the involvement "
    "of several people, and I would like to address my thanks to : \n\n"
    "• Mes parents, Mr. Yetiena SORHO and Mrs. Sanaba COULIBALY, for all the sacrifices made, their invaluable financial and moral support since the first day of my studies ;\n"
    "•  The Republic of Ivory Coast, for all the university infrastructure and the framework of excellence offered to the student youth ;\n"
    "• The National Polytechnic Institute Félix Houphouët-Boigny (INP-HB) of Yamoussoukro, for opening its doors to me and providing me with elite technical training ;\n"
    "• Dr Moussa DIABY Abdoul Kader, Director General of INP-HB, for his inspiring leadership and his constant commitment to the institute's influence ;\n"
    "• Dr Adama OUATTARA, Director of the École Supérieure d'Industrie (ESI), for the reforms and rigor instilled within our school ;\n"
    "• Mr. Siriky KONE, Deputy Director of Studies at ESI, for his attentive listening, his availability and his sound advice ;\n"
    "•  Mr. Louagbeu Loua KPO, Director of the Information and Communication Technology Sciences and Technologies Teaching Unit (STIC), for the exceptional quality of the training program and his strategic guidance ;\n"
    "• The entire teaching and administrative staff of ESI and the STIC department for their dedication and their passionate transmission of knowledge ;\n"
    "• The General Management and all the staff of SOUTARAH GROUP, for their warm welcome, their daily technical support and the trust placed in us during this professional immersion internship."
)

trans[7] = "FOREWORD"
trans[8] = (
    "The National Polytechnic Institute Félix HOUPHOUËT-BOIGNY (INP-HB) of Yamoussoukro was created "
    "by decree n° 96-678 of September 4, 1996, amended by decree n° 2016-747 of September 27, 2016. "
    "INP-HB results from the merger of four major schools, namely :"
)
trans[9] = "INSET : National Higher Institute of Technical Education ;"
trans[10] = "ENSTP : National Higher School of Public Works ;"
trans[11] = "ENSA : National Higher School of Agronomy ;"
trans[12] = "IAB : Agricultural Institute of Bouaké."
trans[13] = "Currently, INP-HB has eleven (11) major schools responsible for the qualifying training of students. Among others, we note :"
trans[14] = "ESI : Higher School of Industry ;"
trans[15] = "ESMG : Higher School of Mining and Geology ;"
trans[16] = "ESA : Higher School of Agronomy ;"
trans[17] = "ESCAE : Higher School of Commerce and Business Administration ;"
trans[18] = "ESTP : Higher School of Public Works ;"
trans[19] = "EFSPC : School of Specialized Training and Executive Development ;"
trans[20] = "EDPSAPT : Doctoral School of Agricultural Science and Transformation Processes ;"
trans[21] = "ESCPE : Higher School of Chemistry, Petroleum and Energy ;"
trans[22] = "EPGE : Preparatory School for Grandes Écoles ;"
trans[23] = "EDPSTI : Doctoral School of Engineering Sciences and Technologies ;"
trans[24] = "ESAS : Higher School of Aeronautics and Space."
trans[25] = (
    "INP-HB is a reform label which, in the context of student development, offers training aimed at training "
    "senior technicians, technical engineers and design engineers in the fields of industry, aeronautics, "
    "commerce, administration, civil engineering, public works, agronomy, mining and geology. "
    "In addition, INP-HB is also involved in research activities to contribute to the advancement "
    "of knowledge and technologies in these fields."
)
trans[26] = (
    "As part of this development, the ESI management implemented a reform in 2016 aimed at having its "
    "students complete immersion internships in the first year, application internships in the second year "
    "and final professional internships in the third year, with the goal that they apply the knowledge "
    "acquired during their academic courses."
)
trans[27] = (
    "Thus, I was able to complete my internship within the company Soutarah Group. This 2-month internship "
    "took place from August 3, 2026 to October 3, 2026. This report describes the activities we carried out during this period."
)

# Sommaire (Summary Table of Contents)
trans[29] = "TABLE OF CONTENTS"
trans[30] = "DEDICATION\t - 1 -"
trans[31] = "ACKNOWLEDGEMENTS\t - 2 -"
trans[32] = "FOREWORD\t - 3 -"
trans[33] = "TABLE OF CONTENTS\t - 5 -"
trans[34] = "LIST OF FIGURES\t - 6 -"
trans[35] = "LIST OF TABLES\t - 7 -"
trans[36] = "LIST OF ABBREVIATIONS\t - 8 -"
trans[37] = "ABSTRACT\t - 9 -"
trans[38] = "GENERAL INTRODUCTION\t - 10 -"
trans[39] = "PART I : PROJECT FRAMEWORK AND CONTEXT\t - 11 -"
trans[40] = "Chapter 1 : Host Organization Overview\t - 12 -"
trans[41] = "Chapter 2 : Project Overview\t - 15 -"
trans[42] = "PART II : CONCEPTUAL STUDY\t - 19 -"
trans[43] = "Chapter 3 : Choice of Analysis Methodology\t - 20 -"
trans[44] = "PART III : TECHNICAL STUDY\t - 37 -"
trans[45] = "Chapter 4 : System Design and Technological Choices\t - 38 -"
trans[46] = "PART IV : SYSTEM IMPLEMENTATION AND DEPLOYMENT\t - 44 -"
trans[47] = "Chapter 5 : Development of the Web Platform and Mobile Application\t - 45 -"
trans[48] = "Chapter 6 : System Deployment\t - 54 -"
trans[49] = "GENERAL CONCLUSION\t - 57 -"
trans[50] = "BIBLIOGRAPHY\t - 58 -"
trans[51] = "WEBOGRAPHY\t - 59 -"
trans[52] = "DETAILED TABLE OF CONTENTS\t - 60 -"

# List of Figures
trans[54] = "LIST OF FIGURES"
trans[55] = "Figure 1 : GANTT Schedule Diagram\t - 18 -"
trans[56] = "Figure 2 : Global Use Case Diagram (Web & Mobile)\t - 23 -"
trans[57] = "Figure 3 : Activity Diagram : Customer Account Creation and Management\t - 27 -"
trans[58] = "Figure 4 : Activity Diagram : Vehicle Reservation\t - 29 -"
trans[59] = "Figure 5 : Activity Diagram : Product Purchase\t - 31 -"
trans[60] = "Figure 6 : Sequence Diagram : Secure Online Payment\t - 32 -"
trans[61] = "Figure 7 : Sequence Diagram : Vehicle Reservation\t - 33 -"
trans[62] = "Figure 8 : Sequence Diagram : Product Purchase\t - 34 -"
trans[63] = "Figure 9 : Sequence Diagram : User Registration\t - 35 -"
trans[64] = "Figure 10 : System Class Diagram\t - 36 -"
trans[65] = "Figure 11 : Visual Studio Code Editor Logo\t - 38 -"
trans[66] = "Figure 12 : Figma UI/UX Design Tool Logo\t - 39 -"
trans[67] = "Figure 13 : React.js Frontend Framework Logo\t - 39 -"
trans[68] = "Figure 14 : React Native & Expo Mobile Framework Logo\t - 39 -"
trans[69] = "Figure 15 : Node.js & Express Server Technology Logo\t - 40 -"
trans[70] = "Figure 16 : Brevo Transactional Email Platform Logo\t - 40 -"
trans[71] = "Figure 17 : Genius Pay Transactional Platform Logo\t - 40 -"
trans[72] = "Figure 18 : Hostinger Hosting Platform Logo\t - 41 -"
trans[73] = "Figure 19 : General System Architecture Diagram\t - 43 -"
trans[74] = "Figure 20 : Structure and Relational Schema of the MySQL Database\t - 45 -"
trans[75] = "Figure 21 : Web Interface : Home Page\t - 48 -"
trans[76] = "Figure 22 : Web Interface : Login Page and Authentication Form\t - 48 -"
trans[77] = "Figure 23 : Web Interface : Product Catalog\t - 49 -"
trans[78] = "Figure 24 : Web Interface : Vehicle Reservation Module\t - 49 -"
trans[79] = "Figure 25 : Web Interface : Multi-Item Cart and PDF Quotation\t - 50 -"
trans[80] = "Figure 26 : Web Interface : Customer Portal and Request History\t - 50 -"
trans[81] = "Figure 27 : Mobile Application : Home Screen and Detailed Vehicle Sheet\t - 51 -"
trans[82] = "Figure 28 : Mobile Application : Mobile Booking Cart\t - 52 -"
trans[83] = "Figure 29 : Administration Interface : Dashboard\t - 52 -"
trans[84] = "Figure 30 : Administration Interface : Fleet and Reservation Management\t - 53 -"

# List of Tables
trans[86] = "LIST OF TABLES"
trans[87] = "Table 1 : Forecast Planning and Task Chronogram\t - 17 -"
trans[88] = "Table 2 : Comparative Study between MERISE and UP/UML Methods\t - 21 -"
trans[89] = "Table 3 : Comparative Analysis of Database Management Systems\t - 41 -"
trans[90] = "Table 4 : Test Acceptance Book and Functional Validation (Web & Mobile)\t - 54 -"
trans[91] = "Table 5 : Estimated Financial Balance Sheet of Infrastructure and Annual Maintenance Costs\t - 55 -"

# List of Abbreviations
trans[93] = "LIST OF ABBREVIATIONS"

# Résumé / Abstract
trans[96] = "ABSTRACT"
trans[97] = (
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

# Introduction Générale
trans[103] = "GENERAL INTRODUCTION"
trans[104] = (
    "The services sector is an essential driver of the Ivorian economy, strongly contributing to GDP "
    "and employment, with varied activities ranging from transport to international trading, including "
    "technical engineering and energy. However, these companies face organizational challenges : paper-based "
    "management, slowness in formulating quotations, lack of customer traceability. In this context, "
    "the integration of ICT becomes a strategic imperative for competitiveness. It is within this "
    "framework that the project carried out within SOUTARAH GROUP takes place."
)
trans[105] = (
    "The project's theme is : \"Design and development of a digital management platform for the services "
    "of SOUTARAH GROUP integrating a mobile application dedicated to vehicle reservation\".\n"
    "The project is organized around two complementary components : a web platform and a mobile application. "
    "The web platform centralizes the company's six business units (vehicle rental, trading/import-export, "
    "technical construction services, renewable energies, agropastoral and real estate), as well as catalog "
    "management, pro-forma quotation editing and the administration back-office. The mobile application, "
    "in turn, responds to clients' specific mobility needs, offering vehicle fleet consultation, "
    "availability verification and direct reservation."
)
trans[106] = (
    "The present report describes the entire software engineering process followed and is organized "
    "around four main parts :\n"
    "•  The First Part presents the project framework and context, introducing the host organization "
    "SOUTARAH GROUP, the existing system analysis, the objectives, the specifications and the task planning ;\n"
    "• The Second Part is dedicated to the conceptual study, detailing the UP/UML methodological approach "
    "and the various design diagrams (use cases, activity, sequence and classes) ;\n"
    "•  The Third Part develops the technical study, justifying the technological choices (React, React Native, "
    "Node.js, MySQL) and explaining the overall software architecture ;\n"
    "•  The Fourth Part describes the practical implementation of the web platform and the mobile application, "
    "detailing the developed functionalities, validation tests, obtained results and the financial analysis of the project."
)

# ═══════════════════════════════════════════════════════════════════════════════
# 2. PART I : CADRE ET CONTEXTE (113 - 222)
# ═══════════════════════════════════════════════════════════════════════════════
trans[113] = "PART I"
trans[114] = "PROJECT FRAMEWORK AND CONTEXT"
trans[116] = "Chapter 1 : Host Organization Overview"
trans[131] = "I. PRESENTATION OF SOUTARAH GROUP"
trans[132] = "1. General Presentation"
trans[133] = (
    "SOUTARAH GROUP is a versatile company offering a diverse range of services intended for both "
    "professionals and individuals. Thanks to its multisectoral expertise, the company provides its "
    "customers with integrated and tailored solutions for various needs, while ensuring a uniform "
    "quality level from the same service provider."
)
trans[134] = (
    "The activities of SOUTARAH GROUP cover several fields, notably services related to vehicle rental, "
    "trading and import-export as well as project support and implementation. This diversity is one of "
    "SOUTARAH GROUP's main strengths. It allows the company to support its clients in various projects "
    "and offer them solutions corresponding to their specific needs."
)
trans[135] = (
    "In an environment marked by the constant evolution of customer needs and the development of digital "
    "technologies, SOUTARAH GROUP aims to revolutionize the field of service provision. The company "
    "thus wishes to strengthen its positioning through its multisectoral expertise, constant innovation "
    "and commitment to customer satisfaction."
)
trans[137] = "2. Mission, Vision and Values"
trans[138] = "❖ Mission"
trans[139] = (
    "The mission of SOUTARAH GROUP is to reinvent quality, reliable and tailored services. This mission "
    "reflects the company's willingness to offer its clients solutions adapted to their needs, while "
    "constantly seeking improvement in the quality and reliability of its services."
)
trans[140] = (
    "❖ Vision\n"
    "The vision of SOUTARAH GROUP is to be the preferred partner of our clients with innovative solutions, "
    "exceptional responsiveness and quality services."
)
trans[141] = (
    "❖ Values (S.A.P.E)\n"
    "The values of SOUTARAH GROUP are grouped around the acronym S.A.P.E :\n"
    "S — Sustainable and innovative solution\n"
    "The company prioritizes the implementation of sustainable and innovative solutions to effectively "
    "respond to the needs of its clients."
)
trans[142] = (
    "A — Adaptability\n"
    "SOUTARAH GROUP adapts to the different needs of its clients as well as to the changes in its professional environment."
)
trans[143] = (
    "P — Customer priority\n"
    "Customer satisfaction is an essential element in the design and delivery of the services offered."
)
trans[144] = (
    "E — Staff efficiency\n"
    "The company values the skills and efficiency of its staff to guarantee the quality of services delivered."
)
trans[146] = "3. Business Fields and Services"
trans[147] = "SOUTARAH GROUP operates in several business fields."
trans[148] = "➢ Vehicle rental : The vehicle rental service offers mobility solutions adapted to different customer needs, whether for one-time trips or for longer periods."
trans[149] = "➢ Trading / Import-Export : Facilitate the supply and distribution of various goods."
trans[150] = "➢ Technical : The installation, maintenance and support of equipment and installations."
trans[151] = "➢ Renewable energies : Optimize energy consumption and promote the use of renewable energies."
trans[152] = "➢ Agropastoral : Agricultural production and livestock farming."
trans[153] = "➢ Real estate : The sale, rental and management of properties."
trans[155] = "4. Partnerships"
trans[156] = "Soutarah Group maintains collaborations with several companies including :"
trans[157] = "BESSAC"
trans[158] = "DM Company"
trans[159] = "CIM IVOIRE"
trans[160] = "Southcomp Polaris"
trans[161] = "Enabel"

trans[185] = "Chapter 2 : Project Overview"
trans[187] = "I. PROJECT CONTEXT AND RATIONALE"
trans[188] = (
    "The continuous growth of SOUTARAH GROUP's activities and the diversification of its business units "
    "have generated a considerable volume of quotation requests and reservations. Faced with this increasing "
    "workload, traditional manual processing mechanisms (isolated emails, informal phone exchanges, physical "
    "record-keeping) have shown their operational limitations. The lack of real-time visibility on vehicle "
    "availability and the lack of synchronization between commercial and technical departments motivated "
    "management to engage the integral digital transformation of its commercial ecosystem."
)
trans[190] = "II. EXISTING SYSTEM DIAGNOSIS AND LIMITATIONS"
trans[191] = (
    "The preliminary analysis of the existing infrastructure revealed that SOUTARAH GROUP only had a static "
    "showcase website. It presented the company but had no dynamic database management component, no customer "
    "authentication area, and no automated pricing mechanism. Requests submitted through basic contact forms "
    "ended up in a generic mailbox without traceability, making it impossible to produce reliable statistics "
    "and causing delays in the editing of official quotations."
)
trans[193] = "III. PROJECT OBJECTIVES"
trans[194] = "1. General Objective"
trans[195] = (
    "The general objective is to design and develop a unified software solution comprising a web platform "
    "for global service management and a mobile application dedicated to vehicle reservation, both "
    "synchronized in real-time via a secure REST API."
)
trans[197] = "2. Specific Objectives"
trans[198] = (
    "Operationally, the project aims to :\n"
    "•  Develop a modern web portal interactively presenting all 6 service units and the product catalog ;\n"
    "•  Develop a native mobile application (Android / iOS) dedicated to real-time vehicle fleet consultation, fluid reservation with dynamic pricing and order status tracking ;\n"
    "•  Implement a hybrid multi-item cart (vehicles and supplies) with an automated tax calculation engine (pre-tax, VAT 18%, TDT 2.5%) ;\n"
    "•  Automate the generation of official pro-forma quotations in 2-page PDF format (with technical data sheets and visuals) ready for printing or electronic signature ;\n"
    "•  Develop a centralized administration dashboard (Back-Office) for managing quotations, vehicles, customers and notifications ;\n"
    "•  Integrate a transactional email notification system."
)
trans[200] = "IV. SYSTEM SPECIFICATIONS"
trans[201] = (
    "The specifications formalize the functional and non-functional requirements of the interconnected system :\n"
    "1. Functional requirements for the Client (Web & Mobile) :\n"
    "  •  Detailed consultation of the vehicle and product catalog by category ;\n"
    "  •  Multi-criteria filtering of vehicles (brand, type, transmission, air conditioning) ;\n"
    "  •  Selection of rental dates with dynamic calculation according to the destination pricing (Abidjan / Outside Abidjan) and the driver option ;\n"
    "  •  Shopping cart / reservation management and one-click validation ;\n"
    "  •  Instant download of the official PDF pro-forma quotation complying with the company's legal charter ;\n"
    "  •  Personal quotation management area ;\n"
)
trans[202] = (
    "2. Functional requirements for the Administrator :\n"
    "  •  Global supervision of key indicators (estimated turnover, active reservations) ;\n"
    "  •  Complete vehicle fleet management (addition, modification, maintenance status) ;\n"
    "  •  Complete trading product management (adding products, modifying prices) ;\n"
    "  •  Customer account management and partner discount allocation.\n"
    "3. Technical requirements and constraints :\n"
    "  •  Security ;\n"
    "  •  Availability and performance ;\n"
    "  •  Portability : Compatibility with modern browsers (Chrome, Safari, Edge) and mobile devices."
)
trans[204] = "V. TASK SCHEDULING AND GANTT DIAGRAM"
trans[205] = "The project took place over a two-month period (from August 3 to October 3, 2026), according to the following chronological breakdown :"
trans[207] = "1. Forecast Schedule"
trans[210] = "2. GANTT Diagram"
trans[211] = "Figure 1 : GANTT Schedule Diagram"

# ═══════════════════════════════════════════════════════════════════════════════
# 3. PART II : ÉTUDE CONCEPTUELLE (223 - 421)
# ═══════════════════════════════════════════════════════════════════════════════
trans[223] = "PART II"
trans[224] = "CONCEPTUAL STUDY"
trans[226] = "Chapter 3 : Choice of Analysis Methodology"
trans[241] = "I. COMPARATIVE STUDY OF ANALYSIS METHODOLOGIES"
trans[242] = (
    "The success of a complex IT project requires a rigorous analysis and modeling phase. Two major "
    "methodological approaches were examined : the Cartesian MERISE method and the object-oriented UP/UML approach."
)
trans[244] = "1. Presentation of the MERISE method"
trans[245] = (
    "MERISE (Method for the Study and Implementation of Information Systems for Enterprises) is an analysis "
    "and design method for information systems. It structures system development by mainly separating data and processes."
)
trans[246] = (
    "The method relies on different levels of modeling, including the conceptual, logical and physical "
    "levels, allowing a progressive transition from needs expression to system implementation."
)
trans[247] = (
    "For data modeling, MERISE primarily uses the Conceptual Data Model (CDM), which represents entities, "
    "their properties and the relationships between them. The CDM can then be transformed into a Logical "
    "Data Model (LDM), then into a Physical Data Model (PDM) to account for the characteristics of the DBMS used."
)
trans[248] = (
    "MERISE also allows representing the processes and treatments necessary for system operation. "
    "This approach thus facilitates the organization of information and the overall understanding of "
    "the information system before its implementation."
)
trans[250] = "2. Presentation of the UP/UML method"
trans[251] = (
    "The Unified Process (UP) is an iterative and incremental software development method. It allows "
    "organizing project development in several phases and progressively evolving the system, "
    "from requirements analysis to implementation."
)
trans[253] = (
    "The UP relies on four main phases : inception, elaboration, construction and transition. "
    "This organization allows better tracking of project evolution, taking user needs into account "
    "and progressively correcting any errors."
)
trans[254] = (
    "The UP relies on UML (Unified Modeling Language), a standardized graphical modeling language "
    "for representing the various aspects of a computer system. UML facilitates in particular the "
    "representation of actors, functionalities, processes, interactions and data structure through various diagrams."
)
trans[256] = "3. Comparative Table : MERISE and UP/UML"
trans[258] = "4. Choice of Analysis Methodology"
trans[259] = (
    "For the implementation of our project, we chose UML (Unified Modeling Language) as the modeling "
    "method, associating it with the Unified Process (UP). This choice is justified by the characteristics "
    "of the project and by the need to clearly represent the different functionalities of the system."
)
trans[260] = (
    "Adaptation to Web and Mobile architectures : UML is object-oriented and adapts to modern software "
    "architectures. It particularly facilitates the design of exchanges between the frontend, the backend "
    "and the different components of the system."
)
trans[261] = (
    "Functionality modeling : UML allows representing interactions between users and the system, "
    "as well as the different application functionalities through various diagrams."
)
trans[262] = (
    "System evolution : thanks to its object-oriented modeling, UML facilitates the reuse and extension "
    "of software components. Models can also be progressively enriched when new functionalities are added."
)
trans[263] = (
    "Thus, the choice of UML associated with the Unified Process provides a method adapted to our project, "
    "while facilitating its analysis, design and evolution."
)
trans[266] = "II. APPLICATION OF UP/UML TO THE SOUTARAH GROUP SYSTEM"
trans[267] = "Within our project, the system integrates three main actors :"
trans[268] = (
    "•  The Visitor / Client : consults the catalog, composes their multi-service cart on the Web, "
    "makes vehicle reservations on the Mobile application and downloads their PDF quotations ;\n"
    "•  The Administrator : supervises all operations, manages the fleet, updates pricing and validates quotations ;\n"
    "•  The System / REST API : applies business rules, controls availability and orchestrates notification distribution."
)
trans[270] = "1. Use Case Diagrams"
trans[271] = "The global use case diagram illustrates the interactions of actors with the two components of the platform (Web and Mobile)."
trans[272] = "Figure 2 : Global Use Case Diagram (Web & Mobile)"
trans[274] = "❖ Textual Description of Use Cases"
trans[275] = "Actor : Visitor"
trans[276] = "Use case : Consult the site and services"
trans[277] = "Actors involved : Visitor, Client"
trans[278] = "Description : Allows discovering the activities and catalogs of Soutarah Group without an account."
trans[279] = "Preconditions : Internet access."
trans[280] = "Main scenario :"
trans[281] = "The visitor accesses the site."
trans[282] = "They consult the services, catalogs and vehicles."
trans[283] = "Postconditions : The information is displayed."
trans[284] = "Use case : Use the AI assistant"
trans[285] = "Actors involved : Visitor, Client"
trans[286] = "Description : Allows asking questions and being automatically guided."
trans[287] = "Preconditions : None."
trans[288] = "Main scenario :"
trans[289] = "The user opens the chat."
trans[290] = "They ask their question."
trans[291] = "The AI responds instantly."
trans[292] = "Postconditions : The user receives the requested information."
trans[293] = "Use case : Register and Log in"
trans[294] = "Actors involved : Visitor, Client"
trans[295] = "Description : Allows creating an account and accessing the personal area."
trans[296] = "Preconditions : Have a valid email address."
trans[297] = "Main scenario :"
trans[298] = "The user enters their credentials."
trans[299] = "The system verifies and validates access."
trans[300] = "Postconditions : The user is connected as a Client."
trans[302] = "Actor : Client (Web / Mobile)"
trans[303] = "Use case : Reserve a vehicle"
trans[304] = "Actors involved : Client (Mobile / Web)"
trans[305] = "Description : Allows choosing and reserving a vehicle from the fleet of 21 vehicles."
trans[306] = "Preconditions : The client must be logged in."
trans[307] = "Main scenario :"
trans[308] = "The client chooses a vehicle and their rental dates."
trans[309] = "The system verifies availability in real time."
trans[310] = "The client confirms their reservation."
trans[311] = "Postconditions : The reservation is recorded pending validation."
trans[312] = "Use case : Request a quotation"
trans[313] = "Actors involved : Client"
trans[314] = "Description : Allows submitting a priced request for a service or product."
trans[315] = "Preconditions : The client must be logged in."
trans[316] = "Main scenario :"
trans[317] = "The client selects their needs and validates their request."
trans[318] = "The system generates the downloadable pro-forma quotation."
trans[319] = "Postconditions : The quotation request is transmitted to the administration."
trans[320] = "Use case : Pay an order"
trans[321] = "Actors involved : Client"
trans[322] = "Description : Allows paying a deposit or an online order."
trans[323] = "Preconditions : Have a validated reservation or cart."
trans[324] = "Main scenario :"
trans[325] = "The client chooses their payment method (Mobile Money or Card)."
trans[326] = "They complete the transaction."
trans[327] = "The system confirms the payment."
trans[328] = "Postconditions : Payment is validated and the receipt is generated."
trans[330] = "Actor : Administrator"
trans[331] = "Use case : Consult the dashboard"
trans[332] = "Actors involved : Administrator"
trans[333] = "Description : Allows monitoring key indicators (turnover, reservations, activities)."
trans[334] = "Preconditions : The administrator must be logged in."
trans[335] = "Main scenario :"
trans[336] = "The administrator accesses the back-office."
trans[337] = "The system displays statistics and KPIs.\n• Postconditions : The administrator views the general state of the platform."
trans[339] = "Use case : Manage vehicles"
trans[340] = "Actors involved : Administrator"
trans[341] = "Description : Allows adding, modifying and tracking the status of the fleet of 21 vehicles."
trans[342] = "Preconditions : The administrator must be logged in."
trans[343] = "Main scenario :"
trans[344] = "The administrator accesses the vehicle list."
trans[345] = "They update availabilities, pricing or technical conditions."
trans[346] = "Postconditions : Fleet information is updated on web and mobile."
trans[347] = "Use case : Receive quotations and mark as read"
trans[348] = "Actors involved : Administrator"
trans[349] = "Description : Allows consulting received quotations and indicating their processing."
trans[350] = "Preconditions : The administrator must be logged in."
trans[351] = "Main scenario :"
trans[352] = "The administrator opens the quotation request list."
trans[353] = "They consult the quotation content."
trans[354] = "They click on \"Mark as read\"."
trans[355] = "Postconditions : The quotation status changes to \"Read / In processing\"."

# Activity Diagrams
trans[361] = "2. Activity Diagrams"
trans[363] = "2.1. Activity Diagram : Customer Account Creation and Management"
trans[364] = "The following activity diagram explains the vehicle reservation process, highlighting the algorithmic anti-collision date control."
trans[366] = "Figure 3 : Activity Diagram : Customer Account Creation and Management"
trans[368] = "2.2. Activity Diagram : Vehicle Reservation"
trans[369] = (
    "The Vehicle Reservation activity diagram illustrates the process by which a client makes a vehicle "
    "rental on the SOUTARAH platform. The process begins when the client chooses a vehicle and enters "
    "their rental dates. The system then verifies availability : if the vehicle is unavailable, the client "
    "is informed and can modify their dates or change vehicle. If it is available, the vehicle is added "
    "to the cart. When the client validates their cart, the system automatically generates the quotation "
    "and redirects them to the order page. The client then chooses their payment method (online by "
    "card/Mobile Money or cash on delivery) and confirms their order. The system automatically validates "
    "the quotation, records the reservation in the database and transmits the order to the administrator. "
    "The latter no longer needs to approve the quotation : they receive the notification, consult the "
    "order details and simply mark the quotation as read to prepare the vehicle. Finally, the client "
    "receives their reservation confirmation. This diagram thus highlights the nominal order flow and "
    "the simplified processing on the administration side."
)
trans[374] = "Figure 4 : Activity Diagram : Vehicle Reservation"
trans[381] = "2.3. Activity Diagram : Product Purchase"
trans[382] = (
    "The Product Purchase activity diagram illustrates the process by which a client purchases an item "
    "on the SOUTARAH platform. The process begins when the client browses the catalog, chooses a product "
    "and adds it to their cart. The system then calculates and instantly displays in the cart the detailed "
    "amounts (pre-tax, VAT and total inclusive of tax). When the client validates their cart and proceeds "
    "to order, the system generates the official timestamped quotation and presents the available payment "
    "methods. The client chooses their payment method, either online (by bank card or Mobile Money), "
    "or cash on delivery, then confirms their order. The system then records the order in the database, "
    "automatically validates the quotation and notifies the administrator. The latter consults the order "
    "details and simply marks the quotation as read in order to initiate the preparation and shipment of "
    "the item. Finally, the client receives their order confirmation. This diagram thus highlights the "
    "direct purchase flow and the transparency of calculations from the cart stage."
)
trans[387] = "Figure 5 : Activity Diagram : Product Purchase"

# Sequence Diagrams
trans[390] = "3. Sequence Diagrams"
trans[392] = "3.1. Sequence Diagram : Online Payment"
trans[393] = (
    "This sequence diagram presents the flow of an electronic financial transaction carried out via the "
    "Genius Pay gateway (integrating bank cards and local Mobile Money solutions). Upon cart confirmation, "
    "the API server initializes a secure payment session and redirects the client to the external payment "
    "gateway. After bank authorization and debit, the gateway notifies the API server via a secure webhook "
    "to set the order status to paid in the database. The Brevo service immediately dispatches an electronic "
    "receipt to the client, while the web interface displays the payment confirmation screen."
)
trans[394] = "Figure 6 : Sequence Diagram : Secure Online Payment"
trans[397] = "3.2. Sequence Diagram : Vehicle Reservation"
trans[398] = (
    "This sequence diagram illustrates the complete sequence of a vehicle reservation on the platform. "
    "When the client selects a car and a rental period, the web interface queries the API server to check "
    "for the absence of scheduling conflicts in the database. Once availability is validated and the order "
    "is confirmed by the client, the API records the reservation and the associated quotation, then triggers "
    "the Brevo messaging service to instantly send confirmation emails to the client and administrator. "
    "In their management area, the administrator accesses the detailed order sheet and marks the quotation "
    "as read, which initiates the operational preparation of the vehicle without requiring manual quotation validation."
)
trans[399] = "Figure 7 : Sequence Diagram : Vehicle Reservation"
trans[402] = "3.3. Sequence Diagram : Product Purchase"
trans[403] = (
    "The Product Purchase sequence diagram describes the flow of merchandise acquisition from the trading "
    "catalog. Upon order validation, the data is transmitted to the API server which adds the transaction "
    "to the database and automatically validates the corresponding quotation. The Brevo service is then "
    "called upon to send the purchase summary to the client and alert the administrator of the new order. "
    "The latter consults the specifications of the ordered items on their dashboard and marks the quotation "
    "as read in order to schedule parcel preparation and delivery."
)
trans[404] = "Figure 8 : Sequence Diagram : Product Purchase"
trans[406] = "3.4. Sequence Diagram : User Registration"
trans[407] = (
    "This sequence diagram describes the registration process of a new user on the SOUTARAH platform. "
    "The visitor enters their information (individual or company) via the web interface form. This data "
    "is transmitted to the API server, which first checks the uniqueness of the email address and phone "
    "number against the database. After confirming the absence of duplicates, the API server secures the "
    "password by Bcrypt hashing then inserts the user and client profile records into the database. "
    "The API server then calls the Brevo service to send a welcome and confirmation email to the visitor, "
    "while the web interface confirms the account creation and redirects them to the login page."
)
trans[408] = "Figure 9 : Sequence Diagram : User Registration"

# Class Diagram
trans[410] = "4. Class Diagram"
trans[411] = (
    "It represents the static structure of the system by describing classes, their attributes, their "
    "methods and the relationships between them. It is generally developed after a thorough understanding "
    "of the system's needs and interactions, in order to serve as a basis for the implementation phase."
)
trans[412] = "Figure 10 : System Class Diagram"

# ═══════════════════════════════════════════════════════════════════════════════
# 4. PART III : ÉTUDE TECHNIQUE (422 - 519)
# ═══════════════════════════════════════════════════════════════════════════════
trans[422] = "PART III"
trans[423] = "TECHNICAL STUDY"
trans[425] = "Chapter 4 : System Design and Technological Choices"
trans[440] = "I. ANALYSIS AND JUSTIFICATION OF TECHNOLOGICAL CHOICES"
trans[441] = (
    "The choice of technologies and tools represents a decisive step in the implementation of a project. "
    "To guarantee the relevance and effectiveness of the decisions made, an in-depth analysis of available "
    "market solutions was carried out, taking into account the project's specificities, our competencies "
    "and long-term objectives. This approach was based on several essential selection criteria : performance "
    "and scalability, cost and licensing conditions, security, integration flexibility, as well as the "
    "quality of documentation and accessibility of technical support. These elements guided the technological "
    "choices towards solutions that are both robust, adapted and sustainable."
)
trans[443] = "1. Development Environment (IDE)"
trans[445] = "Figure 11 : Visual Studio Code Editor Logo"
trans[446] = (
    "Visual Studio Code was selected for its lightness, its native support for the JavaScript/TypeScript "
    "ecosystem, its extensions for React, React Native and MySQL, as well as its integrated terminal."
)
trans[449] = "2. UI/UX Prototyping Tool"
trans[451] = "Figure 12 : Figma UI/UX Design Tool Logo"
trans[452] = (
    "Figma is an online interface design tool (UI/UX), used to create interactive and collaborative "
    "mockups. Accessible from a simple browser, it allows teams to design and share visually clear "
    "prototypes. In the context of a web project, it facilitates the visualization of the interface "
    "before development."
)
trans[454] = "3. Web Frontend Technologies"
trans[456] = "Figure 13 : React.js Frontend Framework Logo"
trans[457] = (
    "For the web platform, the React.js framework coupled with CSS was chosen. Its architecture based "
    "on virtual DOM and reusable components provides a reactive and modular interface, facilitating "
    "smooth navigation between the catalog, the interactive cart and the administration dashboard."
)
trans[459] = "4. Mobile Technologies"
trans[461] = "Figure 14 : React Native & Expo Mobile Framework Logo"
trans[462] = (
    "For the mobile component, React Native associated with the Expo ecosystem was selected. This "
    "technology offers a single TypeScript/JavaScript code compiled natively for Android and iOS, "
    "guaranteeing high performance, easy access to hardware functionalities (file system, PDF sharing) "
    "and a substantial reduction in development costs."
)
trans[464] = "5. Backend and REST API Technologies"
trans[466] = "Figure 15 : Node.js & Express Server Technology Logo"
trans[467] = (
    "The application server is based on Node.js and the Express.js framework. This choice allows "
    "maintaining the same language (JavaScript/TypeScript) throughout the software chain. The stateless "
    "REST architecture based on JSON exchanges and secured by JWT tokens guarantees perfect scalability "
    "and feeds both the Web application and the Mobile application equally."
)
trans[469] = "6. Notification and Messaging Technologies"
trans[471] = "Figure 16 : Brevo Transactional Email Platform Logo"
trans[472] = (
    "To ensure the sending of notifications and electronic messages, Brevo was selected. It allows "
    "automating the sending of emails related to the different actions of the platform, notably "
    "reservation confirmations, order notifications and messages to clients."
)
trans[473] = (
    "Its API integration allows centralizing and automating communications with users, while "
    "facilitating its use with web and mobile applications."
)
trans[475] = "7. Online Payment Technologies"
trans[477] = "Figure 17 : Genius Pay Transactional Platform Logo"
trans[478] = (
    "To ensure the management and security of financial transactions, Genius Pay was selected. It allows "
    "automating the online settlement of platform services, notably vehicle reservation payments and the "
    "validation of merchandise orders."
)
trans[479] = (
    "Its integration via API and Webhook allows centralizing card and Mobile Money collections, while "
    "offering a smooth, fast and highly secure payment experience across web and mobile applications."
)
trans[481] = "8. Hosting and Deployment Platform"
trans[483] = "Figure 18 : Hostinger Hosting Platform Logo"
trans[484] = "To ensure the online deployment of the platform, Hostinger was selected."
trans[485] = (
    "The choice of Hostinger is explained notably by its ease of deployment, its accessible cost and "
    "its compatibility with the technologies used in the project."
)

# DBMS
trans[487] = "II. DATABASE MANAGEMENT SYSTEM (DBMS)"
trans[488] = (
    "The choice of database management system (DBMS) is an important step in the design and deployment "
    "of an application. It must meet the system's needs in terms of performance, security, reliability, "
    "scalability and ease of maintenance. As part of the SOUTARAH GROUP project, several solutions were"
)
trans[489] = (
    "studied, including MySQL, PostgreSQL, SQL Server, Oracle and MongoDB. The analysis focused on their "
    "data model, performance, cost and ease of integration."
)
trans[491] = "1. Comparison of Major DBMS Solutions"
trans[494] = "2. DBMS Selection"
trans[495] = "After comparing the different solutions, MySQL was selected as the database management system for our project."
trans[496] = (
    "This choice is explained first by the nature of the data handled by the platform. The application "
    "must manage several structured pieces of information such as customers, vehicles, reservations, "
    "products, orders and quotations."
)
trans[497] = (
    "Another determining factor in this choice concerns the development environment. The hosting offer "
    "purchased by SOUTARAH GROUP only supports MySQL. The choice of this DBMS thus ensures better "
    "compatibility between the developed application and the hosting infrastructure."
)
trans[498] = (
    "Finally, MySQL has an ecosystem widely used in web development and integrates easily with the "
    "different technologies used in the project. It is thus a reliable, efficient, accessible and adapted solution."
)

# Architecture
trans[501] = "III. GENERAL SYSTEM ARCHITECTURE"
trans[502] = "Our solution is based on a three-tier distributed architecture (3-tiers) :"
trans[503] = "Presentation Level (Clients) : Users interact with the system via two complementary channels :"
trans[504] = "•  A mobile application (React Native / Expo) dedicated specifically to clients for consulting the vehicle fleet and making online reservations ;"
trans[505] = "•  A web platform (React / Vite) enabling global service management, quotation requests and administrative tracking (Back-Office)."
trans[506] = "Network Level (Internet) : Ensures the secure connection between clients and the server through the HTTPS protocol and REST API requests exchanging data in JSON format."
trans[507] = (
    "Business and Data Level (Server & DB) : A Node.js / Express application server handles "
    "the business logic (automatic availability verification anti-double-booking, quotation calculation, "
    "JWT security) and communicates with a MySQL database for data persistence."
)
trans[509] = "Figure 19 : General System Architecture Diagram"

# ═══════════════════════════════════════════════════════════════════════════════
# 5. PART IV : RÉALISATION ET MISE EN ŒUVRE (520 - 656)
# ═══════════════════════════════════════════════════════════════════════════════
trans[520] = "PART IV"
trans[521] = "SYSTEM IMPLEMENTATION AND DEPLOYMENT"
trans[523] = "Chapter 5 : Development of the Web Platform and Mobile Application"

# MySQL DB Implementation
trans[537] = "I. MYSQL DATABASE IMPLEMENTATION"
trans[538] = "Figure 20 : Structure and Relational Schema of the MySQL Database"
trans[539] = (
    "The MySQL database was designed to guarantee the consistency of transactional flows. It groups the following main tables :\n"
    "•  Users & Clients : management of identifiers (email, hashed password, role 'CLIENT' or 'ADMIN') and links to individual or company profiles ;\n"
    "•  Vehicles : brand, model, category, daily rate, status, photographs ;\n"
    "•  Reservations : start and end dates, driver option with/without, total amount, status ;\n"
    "•  Services & Products : general catalog of the 6 business units with technical characteristics and pricing ;\n"
    "•  Quotations : unique reference (e.g.: DMD-2026-XXXX), creation date, pre-tax/inclusive amount ;\n"
    "•  Notifications : alerts sent to clients and administrators."
)

# AI & Notifications & Genius Pay
trans[542] = "II. IMPLEMENTATION OF THE AI ASSISTANT AND NOTIFICATIONS (BREVO)"
trans[543] = (
    "To modernize customer relations and streamline operational communication at SOUTARAH GROUP, "
    "we have enriched the platform with two modules : an intelligent conversational agent and an "
    "automated transactional email service."
)
trans[545] = "1. Intelligent Virtual Assistant (AI Agent)"
trans[546] = "To guide visitors and assist managers, a virtual agent based on an advanced language model (LLM) was developed :"
trans[547] = (
    "Technical Architecture : It is built around a floating interactive React widget connected via a "
    "secure REST API to the backend service. The latter queries the OpenAI model (gpt-4o-mini) by "
    "dynamically injecting in context the real-time data from the MySQL database (available vehicles, "
    "technical characteristics, pricing and stock levels)."
)
trans[548] = (
    "Customer Role : The assistant understands requests expressed in natural language (e.g. : \"I am "
    "looking for an air-conditioned vehicle for 5 people for Yamoussoukro\"), proposes the appropriate "
    "model and generates clickable action buttons to instantly redirect the user to the vehicle sheet or to the cart."
)
trans[549] = (
    "Administrator Role : When the user is authenticated with the ADMIN role, the assistant transforms "
    "into a decision-support tool : it executes aggregation queries to answer management questions "
    "(products near the stock threshold, most rented vehicles, volume of pending quotations)."
)
trans[551] = "2. Messaging and Notification Service (Brevo / SMTP)"
trans[552] = "To guarantee traceability and respond without delay to commercial leads, an email notification system was implemented :"
trans[553] = (
    "Delivery Infrastructure : To send emails, our Node.js server uses the Nodemailer tool, which "
    "prepares and formats the messages. These messages are then transmitted to the professional Brevo "
    "service, which handles their distribution to recipients. Communication with Brevo is fully encrypted "
    "and secured (TLS protocol)."
)
trans[554] = (
    "Client Notifications : The system automatically triggers the sending of an email upon registration "
    "of a new user, upon reservation confirmation, and delivers the official pro-forma quotation in "
    "PDF format (2 pages) as soon as the cart is validated."
)
trans[555] = (
    "Administrator Alerts : As soon as a client adds a vehicle reservation or an item to their cart, "
    "an immediate alert is transmitted to the commercial team with the client's contact details, "
    "the date details and the estimated amounts, enabling proactive handling."
)

# Genius Pay section
trans[558] = "3. Secure Online Payment Module (Genius Pay)"
trans[559] = "To secure payments and automate order validation, a payment gateway has been integrated via Genius Pay :"
trans[560] = (
    "Infrastructure and Gateway : Our Node.js server initializes the transaction via the Genius Pay "
    "REST API and redirects the client to its secure, encrypted gateway (TLS). No sensitive banking "
    "data transits through our servers, guaranteeing optimal security."
)
trans[561] = (
    "Payment Methods : The platform accepts bank cards (Visa, Mastercard) as well as local Mobile Money. "
    "The transaction is protected by strong authentication (OTP/SMS code) before any actual debit."
)
trans[562] = (
    "Validation and Notifications : After bank validation, Genius Pay directly notifies our API via "
    "Webhook to set the order status to \"PAID\" in the database. The Brevo service immediately "
    "dispatches the electronic receipt to the client, while in case of refusal, an alert invites to retry."
)

# Web Interfaces
trans[564] = "III. IMPLEMENTATION OF WEB PLATFORM INTERFACES"
trans[565] = "The web portal was developed with a modern aesthetic respecting SOUTARAH's graphic charter :"
trans[566] = "1. Home and Authentication Pages"
trans[567] = "Figure 21 : Web Interface : Home Page"
trans[568] = (
    "The home page is the digital front door. It presents the company history, the S.A.P.E values, "
    "the business units and integrates an intelligent virtual assistant guiding users."
)
trans[570] = (
    "The login page allows the client to access their personal area by entering their login credentials, "
    "specifically their email address and password. After verification of this information, the client "
    "is authenticated and can access the different functionalities reserved for them."
)
trans[571] = "Figure 22 : Web Interface : Login Page and Authentication Form"
trans[572] = "2. Product Catalog"
trans[573] = "Allows clients to browse supplies, construction materials and tools, with the option of direct addition to the quotation/cart."
trans[574] = "Figure 23 : Web Interface : Product Catalog"
trans[575] = "3. Vehicle Reservation Module"
trans[576] = "Allows selecting a vehicle, specifying precise pickup and return dates, and opting for a driver."
trans[577] = "Figure 24 : Web Interface : Vehicle Reservation Module"
trans[589] = "4. Multi-Item Cart and PDF Quotation Generation"
trans[590] = (
    "The cart groups both vehicle reservations and physical products, calculates regulatory taxes "
    "and generates the downloadable pro-forma quotation instantly."
)
trans[591] = "Figure 25 : Web Interface : Multi-Item Cart and PDF Quotation"
trans[593] = "5. Customer Portal and Request Tracking"
trans[594] = "Offers the authenticated user an overview of their pending quotations."
trans[596] = "Figure 26 : Web Interface : Customer Portal and Request Tracking"

# Mobile Application
trans[599] = "IV. IMPLEMENTATION OF THE MOBILE RESERVATION APPLICATION"
trans[600] = "The 'SOUTARAH Mobile' application provides a tailored response to mobility by focusing on the vehicle rental service :"
trans[602] = "1. Home Screen and Detailed Vehicle Sheet"
trans[603] = (
    "The home screen displays available vehicles categorized (SUV, Sedans, Utilities) with dynamic "
    "filters, daily rate and high-definition visuals. The detailed sheet presents the vehicle's "
    "technical characteristics (air conditioning, gearbox, fuel), integrates a calendar selector "
    "and instantly calculates the total cost according to destination and driver option."
)
trans[606] = "Figure 27 : Mobile Application : Home Screen and Detailed Vehicle Sheet"
trans[607] = "2. Mobile Cart"
trans[608] = "Allows adjusting quantities or rental durations, entering special delivery instructions and validating the request in real time."
trans[609] = "Figure 28 : Mobile Application : Mobile Cart"

# Back-Office
trans[611] = "V. IMPLEMENTATION OF THE ADMINISTRATIVE BACK-OFFICE (WEB BACK-OFFICE)"
trans[612] = (
    "The Web Back-Office is the control center of the company. It integrates :\n"
    "•  Dashboard : performance charts, projected turnover, number of quotations and reservations in progress ;\n"
    "•  Fleet and trading product management : addition of new vehicles, products, update of daily prices ;"
)
trans[613] = "Figure 29 : Administration Interface : Dashboard"
trans[632] = "Figure 30 : Administration Interface : Fleet and Vehicle Fleet Management"

# Chapter 6 : System Deployment
trans[634] = "Chapter 6 : System Deployment"
trans[636] = "I. FUNCTIONAL TESTING AND VALIDATION"
trans[637] = "A comprehensive testing campaign was conducted to validate the robustness and integrity of the interconnected solution :"
trans[640] = "II. FINANCIAL ASSESSMENT AND COST ESTIMATION"
trans[641] = "1. Hardware and Software Costs"
trans[642] = (
    "All retained development technologies (React, React Native, Node.js, MySQL, Expo) being based on "
    "free Open Source licenses, direct software development costs are zero. The hardware investment "
    "focused on the workstation and mobile testing terminals."
)
trans[643] = "2. Annual Hosting and Maintenance Costs"
trans[644] = "For production deployment, the estimated annual costs are broken down as follows :"
trans[646] = "III. Profitability, Return on Investment (ROI) and Evolution Perspectives"
trans[647] = "1. Immediate Profitability and Return on Investment"
trans[648] = (
    "The automation of the reservation and quotation generation process allows SOUTARAH GROUP to reduce "
    "by more than 80% the administrative time devoted to processing a client file (going from 45 minutes "
    "to less than 3 minutes). This immediate commercial responsiveness, combined with the total elimination "
    "of operating losses related to double bookings, allows a complete return on investment from the first operating quarter."
)
trans[650] = "2. Platform Evolution Perspectives"
trans[651] = "To support the company's development, the modular architecture implemented will allow deploying in the short and medium term :"
trans[652] = "•  Loyalty program : Awarding reward points for each reservation or order, exchangeable for discounts or free services, to strengthen customer retention ;"
trans[653] = "•  Telematics and GPS tracking : Integration of connected trackers on vehicles to track journeys in real time and schedule mechanical maintenance ;"
trans[654] = "•  Native Push notifications : Instant alert on smartphone via Firebase Cloud Messaging for reservation tracking ;"

# ═══════════════════════════════════════════════════════════════════════════════
# 6. CONCLUSION, BIBLIOGRAPHY, WEBOGRAPHY, DETAILED TOC (657 - 809)
# ═══════════════════════════════════════════════════════════════════════════════
trans[657] = "GENERAL CONCLUSION"
trans[658] = (
    "At the end of this internship carried out within SOUTARAH GROUP, we have successfully completed "
    "the design and full implementation of a unified digital solution, responding to the theme : "
    "\"Design and development of a digital management platform for the services of SOUTARAH GROUP "
    "integrating a mobile application dedicated to vehicle reservation\".\n\n"
    "This project has profoundly transformed the company's commercial practices by replacing manual "
    "methods with a modern, coherent and interconnected software ecosystem. The rigorous methodological "
    "approach based on the Unified Process and UML modeling (UP/UML) guaranteed a precise analysis of "
    "needs and flawless structuring of the relational MySQL database.\n\n"
    "On the technical level, the synergy between the web platform developed under React.js and the "
    "mobile application designed under React Native/Expo, both articulated around a Node.js/Express "
    "REST API, allowed achieving all the set objectives. Users now have total visibility on the "
    "6 business units of the company, a fluid reservation module with anti-double-booking algorithm, "
    "an interactive multi-item cart and an instant official PDF quotation generation tool.\n\n"
    "On a personal and academic level, this project was a particularly enriching experience. It allowed "
    "us to consolidate the theoretical knowledge received at the École Supérieure d'Industrie (ESI) "
    "of INP-HB, to understand the constraints of software engineering in a professional environment "
    "and to master cutting-edge full-stack technologies."
)

trans[666] = "BIBLIOGRAPHY"
trans[667] = "I. REFERENCE BOOKS AND METHODOLOGICAL MANUALS :"
trans[668] = "AUDIBERT, Laurent. \"UML Course : Object Modeling and Diagrams\", Eyrolles Editions / University Institute, pages 21-46."
trans[669] = "ROQUES, Pascal. \"UML 2 in Practice : Case Studies and Corrected Exercises\", Eyrolles Editions, 7th edition, 2021, 394 pages."
trans[671] = "II. ACADEMIC COURSE MATERIALS (INP-HB / ESI) :"
trans[672] = "Zana Yéo. \"Serveur-HTTP-et-Express.js\", Course materials, STIC, ESI / INP-HB Yamoussoukro, 2025-2026."

trans[691] = "WEBOGRAPHY"
trans[692] = "REACT.JS. \"Official React 18 Documentation and Virtual DOM\", Meta Open Source. Available at : https://react.dev (Accessed August 30, 2026)."
trans[693] = "REACT NATIVE & EXPO. \"Cross-Platform Native Mobile Development with Expo Framework\". Available at : https://reactnative.dev and https://docs.expo.dev (Accessed September 15, 2026)."
trans[694] = "BREVO. Available at : https://brevo.com (Accessed September 1, 2026)."

# Detailed Table of Contents (714 - 807)
trans[714] = "DETAILED TABLE OF CONTENTS"
trans[715] = "DEDICATION\t - 1 -"
trans[716] = "ACKNOWLEDGEMENTS\t - 2 -"
trans[717] = "FOREWORD\t - 3 -"
trans[718] = "TABLE OF CONTENTS\t - 5 -"
trans[719] = "LIST OF FIGURES\t - 6 -"
trans[720] = "LIST OF TABLES\t - 7 -"
trans[721] = "LIST OF ABBREVIATIONS\t - 8 -"
trans[722] = "ABSTRACT\t - 9 -"
trans[723] = "GENERAL INTRODUCTION\t - 10 -"
trans[724] = "PART I : PROJECT FRAMEWORK AND CONTEXT\t - 11 -"
trans[725] = "Chapitre 1 : Host Organization Overview\t - 12 -"
trans[726] = "I. Presentation of SOUTARAH GROUP\t - 12 -"
trans[727] = "1. General Presentation\t - 12 -"
trans[728] = "2. Mission, Vision and Values\t - 12 -"
trans[729] = "3. Business Fields and Services\t - 13 -"
trans[730] = "4. Partnerships\t - 14 -"
trans[731] = "Chapter 2 : Project Overview\t - 15 -"
trans[732] = "I. Project Context and Rationale\t - 15 -"
trans[733] = "II. Existing System Diagnosis and Limitations\t - 15 -"
trans[734] = "III. Project Objectives\t - 15 -"
trans[735] = "1. General Objective\t - 15 -"
trans[736] = "2. Specific Objectives\t - 16 -"
trans[737] = "IV. System Specifications\t - 16 -"
trans[738] = "1. Functional Requirements for the Client\t - 16 -"
trans[739] = "2. Functional Requirements for the Administrator\t - 17 -"
trans[740] = "3. Technical Requirements and Constraints\t - 17 -"
trans[741] = "V. Task Scheduling and GANTT Diagram\t - 17 -"
trans[742] = "1. Forecast Schedule\t - 17 -"
trans[743] = "2. GANTT Diagram\t - 18 -"
trans[744] = "PART II : CONCEPTUAL STUDY\t - 19 -"
trans[745] = "Chapter 3 : Choice of Analysis Methodology\t - 20 -"
trans[746] = "I. Comparative Study of Analysis Methodologies\t - 20 -"
trans[747] = "1. Presentation of the MERISE Method\t - 20 -"
trans[748] = "2. Presentation of the UP/UML Method\t - 20 -"
trans[749] = "3. Comparative Table : MERISE and UP/UML\t - 21 -"
trans[750] = "4. Choice of Analysis Methodology\t - 22 -"
trans[751] = "II. Application of UP/UML to the SOUTARAH GROUP System\t - 22 -"
trans[752] = "1. Use Case Diagrams\t - 23 -"
trans[753] = "❖ Textual Description of Use Cases\t - 23 -"
trans[754] = "2. Activity Diagrams\t - 27 -"
trans[755] = "2.1. Customer Account Creation and Management\t - 27 -"
trans[756] = "2.2. Vehicle Reservation with Availability Control\t - 28 -"
trans[757] = "2.3. Product Purchase Process\t - 30 -"
trans[758] = "3. Sequence Diagrams\t - 32 -"
trans[759] = "3.1. Secure Online Payment\t - 32 -"
trans[760] = "3.2. Vehicle Reservation\t - 33 -"
trans[761] = "3.3. Product Purchase\t - 34 -"
trans[762] = "3.4. User Registration\t - 35 -"
trans[763] = "4. Class Diagram\t - 36 -"
trans[764] = "PART III : TECHNICAL STUDY\t - 37 -"
trans[765] = "Chapter 4 : System Design and Technological Choices\t - 38 -"
trans[766] = "I. Analysis and Justification of Technological Choices\t - 38 -"
trans[767] = "1. Development Environment\t - 38 -"
trans[768] = "2. UI/UX Prototyping Tool\t - 38 -"
trans[769] = "3. Web Frontend Technologies\t - 39 -"
trans[770] = "4. Mobile Technologies\t - 39 -"
trans[771] = "5. Backend and REST API Technologies\t - 40 -"
trans[772] = "6. Notification and Messaging Technologies\t - 40 -"
trans[773] = "7. Online Payment Platform\t - 40 -"
trans[774] = "8. Hosting and Deployment Platform\t - 41 -"
trans[775] = "II. Database Management System (DBMS)\t - 41 -"
trans[776] = "1. Comparison of Major DBMS Solutions\t - 41 -"
trans[777] = "2. Choice and Justification of MySQL\t - 42 -"
trans[778] = "III. General System Architecture\t - 42 -"
trans[779] = "PART IV : SYSTEM IMPLEMENTATION AND DEPLOYMENT\t - 44 -"
trans[780] = "Chapter 5 : Development of the Web Platform and Mobile Application\t - 45 -"
trans[781] = "I. MySQL Database Implementation\t - 45 -"
trans[782] = "II. Implementation of the AI Assistant and Notifications (Brevo)\t - 46 -"
trans[783] = "1. Intelligent Virtual Assistant (AI Agent)\t - 46 -"
trans[784] = "2. Messaging and Notification Service (Brevo / SMTP)\t - 46 -"
trans[785] = "3. Secure Online Payment Module (Genius Pay)\t - 47 -"
trans[786] = "III. Implementation of Web Platform Interfaces\t - 48 -"
trans[787] = "1. Home and Authentication Pages\t - 48 -"
trans[788] = "2. Product Catalog\t - 49 -"
trans[789] = "3. Vehicle Reservation Module\t - 49 -"
trans[790] = "4. Multi-Item Cart and PDF Quotation Generation\t - 50 -"
trans[791] = "5. Customer Portal and Request Tracking\t - 50 -"
trans[792] = "IV. Implementation of Mobile Reservation Application\t - 51 -"
trans[793] = "1. Home Screen and Detailed Vehicle Sheet\t - 51 -"
trans[794] = "2. Mobile Cart\t - 52 -"
trans[795] = "V. Implementation of the Administrative Back-Office\t - 52 -"
trans[796] = "Chapter 6 : System Deployment\t - 54 -"
trans[797] = "I. Functional Testing and Validation (Acceptance Book)\t - 54 -"
trans[798] = "II. Financial Assessment and Cost Estimation\t - 55 -"
trans[799] = "1. Hardware and Software Costs\t - 55 -"
trans[800] = "2. Annual Hosting and Maintenance Costs\t - 55 -"
trans[801] = "III. Profitability, Return on Investment and Perspectives\t - 56 -"
trans[802] = "1. Immediate Profitability and Return on Investment (ROI)\t - 56 -"
trans[803] = "2. Platform Evolution Perspectives\t - 56 -"
trans[804] = "GENERAL CONCLUSION AND PERSPECTIVES\t - 57 -"
trans[805] = "BIBLIOGRAPHY\t - 58 -"
trans[806] = "WEBOGRAPHY\t - 59 -"
trans[807] = "DETAILED TABLE OF CONTENTS\t - 60 -"

# Save dictionary
with open('complete_translations.json', 'w', encoding='utf-8') as f:
    json.dump({str(k): v for k, v in trans.items()}, f, ensure_ascii=False, indent=2)

print(f"Saved complete_translations.json with {len(trans)} entries.")
