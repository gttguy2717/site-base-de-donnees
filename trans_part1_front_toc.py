# -*- coding: utf-8 -*-
"""Part 1: Front Matter and Lists (P[1] to P[91])"""

PART_1 = {
    1: "DEDICATION",
    2: (
        "I dedicate this humble work to my entire family and to all those who supported me closely and from afar throughout my academic journey.\n\n"
        "Very special dedications to:\n\n"
        "•  My father, Mr. SORHO YETIENA, for his benevolent guidance, wisdom and precious advice;\n"
        "•  My mother, Mrs. SORHO SANABA, for her unconditional love, constant prayers and unfailing support;\n"
        "•  My sister, SORHO ESLIE, for her permanent encouragement and comforting dynamism.\n\n"
        "To all those who helped make me the person I am today, please find here the expression of my deep gratitude."
    ),
    5: "ACKNOWLEDGEMENTS",
    6: (
        "I would like to express my sincere gratitude to Mr. Kologo Harouna, Director of Soutarah Group, as well as to my internship supervisor, for their warm welcome, guidance, advice and availability throughout my internship. Also, this report was made possible thanks to the involvement of several people, and I would like to express my thanks to:\n\n"
        "• My parents, Mr. Yetiena SORHO and Mrs. Sanaba COULIBALY, for all their sacrifices, and their invaluable financial and moral support since the first day of my studies;\n"
        "•  The Republic of Côte d'Ivoire, for all the university infrastructure and the framework of excellence offered to student youth;\n"
        "• The Félix Houphouët-Boigny National Polytechnic Institute (INP-HB) of Yamoussoukro, for opening its doors to me and providing me with elite technical education;\n"
        "• Dr. Moussa DIABY Abdoul Kader, Managing Director of INP-HB, for his inspiring leadership and constant commitment to the institute's prestige;\n"
        "• Dr. Adama OUATTARA, Director of the Higher School of Industry (ESI), for the reforms and rigor instilled within our school;\n"
        "• Mr. Siriky KONE, Deputy Director of Studies at ESI, for his attentive listening, availability and wise advice;\n"
        "•  Mr. Louagbeu Loua KPO, Head of the Information and Communication Sciences and Technologies (STIC) Teaching Unit, for the exceptional quality of the training program and his strategic guidance;\n"
        "• The entire teaching and administrative staff of ESI and the STIC department for their dedication and passionate transmission of knowledge;\n"
        "• The General Management and all staff of the company SOUTARAH GROUP, for their warm welcome, daily technical support and the trust granted during this professional immersion internship."
    ),
    7: "FOREWORD",
    8: (
        "The Félix HOUPHOUËT-BOIGNY National Polytechnic Institute (INP-HB) of Yamoussoukro was created by decree no. 96-678 of September 4, 1996, amended by decree no. 2016-747 of September 27, 2016. INP-HB results from the merger of four major engineering schools, which are:"
    ),
    9: "INSET: National Higher Institute of Technical Education;",
    10: "ENSTP: National Higher School of Public Works;",
    11: "ENSA: National Higher School of Agronomy;",
    12: "IAB: Agricultural Institute of Bouaké.",
    13: "Today, INP-HB includes eleven (11) major schools responsible for the qualification and training of students. These include, among others:",
    14: "ESI: Higher School of Industry;",
    15: "ESMG: Higher School of Mines and Geology;",
    16: "ESA: Higher School of Agronomy;",
    17: "ESCAE: Higher School of Commerce and Business Administration;",
    18: "ESTP: Higher School of Public Works;",
    19: "EFSPC: School of Specialized Training and Executive Development;",
    20: "EDPSAPT: Doctoral School of Agronomic Sciences and Transformation Processes;",
    21: "ESCPE: Higher School of Petroleum Chemistry and Energy;",
    22: "EPGE: Preparatory School for Grandes Écoles;",
    23: "EDPSTI: Doctoral School of Engineering Sciences and Technologies;",
    24: "ESAS: Higher School of Aeronautics and Space.",
    25: (
        "INP-HB is a hallmark of reform that, as part of student development, offers programs aimed at training senior technicians, engineering technologists, and design engineers in the fields of industry, aeronautics, commerce, administration, civil engineering, public works, agronomy, mining and geology. In addition, INP-HB is also involved in research activities to contribute to the advancement of knowledge and technologies in these areas."
    ),
    26: (
        "As part of this improvement process, the leadership of ESI implemented a reform in 2016 requiring its students to carry out immersion internships in the first year, application internships in the second year, and graduation professional internships in the third year so that they can apply the knowledge acquired throughout their academic journey."
    ),
    27: (
        "Accordingly, I completed my internship within the company Soutarah Group. This 2-month internship took place from August 3, 2026 to October 3, 2026. This report recounts the activities we carried out during this period."
    ),
    29: "TABLE OF CONTENTS",
    30: "DEDICATION\t - 1 -",
    31: "ACKNOWLEDGEMENTS\t - 2 -",
    32: "FOREWORD\t - 3 -",
    33: "TABLE OF CONTENTS\t - 5 -",
    34: "LIST OF FIGURES\t - 6 -",
    35: "LIST OF TABLES\t - 7 -",
    36: "LIST OF ABBREVIATIONS\t - 8 -",
    37: "ABSTRACT\t - 9 -",
    38: "GENERAL INTRODUCTION\t - 10 -",
    39: "PART I : PROJECT FRAMEWORK AND CONTEXT\t - 11 -",
    40: "    Chapter 1 : Overview of the Host Organization\t - 12 -",
    41: "    Chapter 2 : Project Presentation and Planning\t - 15 -",
    42: "PART II : CONCEPTUAL STUDY\t - 19 -",
    43: "    Chapter 3 : Choice of Analysis Methodology\t - 20 -",
    44: "PART III : TECHNICAL STUDY\t - 37 -",
    45: "    Chapter 4 : System Design and Technological Choices\t - 38 -",
    46: "PART IV : IMPLEMENTATION AND SYSTEM DEPLOYMENT\t - 44 -",
    47: "    Chapter 5 : Development of the Web Platform and Mobile Application\t - 45 -",
    48: "    Chapter 6 : Implementation\t - 54 -",
    49: "GENERAL CONCLUSION\t - 57 -",
    50: "BIBLIOGRAPHY \t - 58 -",
    51: "WEBOGRAPHY\t - 59 -",
    52: "TABLE OF CONTENTS\t - 60 -",
    54: "LIST OF FIGURES",
    55: "Figure 1 : GANTT Diagram\t - 18 -",
    56: "Figure 2 : Global Use Case Diagram (Web & Mobile)\t - 23 -",
    57: "Figure 3 : Activity Diagram : Customer Account Creation and Management\t - 27 -",
    58: "Figure 4 : Activity Diagram : Vehicle Reservation\t - 29 -",
    59: "Figure 5 : Activity Diagram : Product Purchase\t - 31 -",
    60: "Figure 6 : Sequence Diagram : Secure Online Payment\t - 32 -",
    61: "Figure 7 : Sequence Diagram : Vehicle Reservation\t - 33 -",
    62: "Figure 8 : Sequence Diagram : Product Purchase\t - 34 -",
    63: "Figure 9 : Sequence Diagram : User Registration\t - 35 -",
    64: "Figure 10 : System Class Diagram\t - 36 -",
    65: "Figure 11 : Visual Studio Code Editor Logo\t - 38 -",
    66: "Figure 12 : Figma Wireframing Tool Logo\t - 39 -",
    67: "Figure 13 : React.js Frontend Framework Logo\t - 39 -",
    68: "Figure 14 : React Native & Expo Mobile Framework Logo\t - 39 -",
    69: "Figure 15 : Node.js & Express Server Technology Logo\t - 40 -",
    70: "Figure 16 : Brevo Transactional Platform Logo\t - 40 -",
    71: "Figure 17 : Genius Pay Transactional Platform Logo\t - 40 -",
    72: "Figure 18 : Hostinger Hosting Platform Logo\t - 41 -",
    73: "Figure 19 : General System Architecture Diagram\t - 43 -",
    74: "Figure 20 : Structure and Relational Schema of MySQL Database\t - 45 -",
    75: "Figure 21 : Web Interface : Home Page\t - 48 -",
    76: "Figure 22 : Web Interface : Login Page and Authentication Form\t - 48 -",
    77: "Figure 23 : Web Interface : Product Catalog\t - 49 -",
    78: "Figure 24 : Web Interface : Vehicle Reservation Module\t - 49 -",
    79: "Figure 25 : Web Interface : Multi-Item Cart and PDF Quotation\t - 50 -",
    80: "Figure 26 : Web Interface : Customer Portal and Request History\t - 50 -",
    81: "Figure 27 : Mobile Application : Home Screen and Detailed Vehicle Sheet\t - 51 -",
    82: "Figure 28 : Mobile Application : Mobile Booking Cart\t - 52 -",
    83: "Figure 29 : Administrative Interface : Dashboard\t - 52 -",
    84: "Figure 30 : Administrative Interface : Fleet and Reservation Management\t - 53 -",
    86: "LIST OF TABLES",
    87: "Table 1 : Forecast Planning and Chronogram of Tasks\t - 17 -",
    88: "Table 2 : Comparative Study between MERISE and UP/UML Methodologies\t - 21 -",
    89: "Table 3 : Comparative Analysis of Database Management Systems\t - 41 -",
    90: "Table 4 : Acceptance Test Book and Functional Validation (Web & Mobile)\t - 54 -",
    91: "Table 5 : Estimated Financial Summary of Infrastructure and Annual Maintenance Costs\t - 55 -",
}
