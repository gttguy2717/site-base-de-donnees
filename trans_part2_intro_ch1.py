# -*- coding: utf-8 -*-
"""Part 2: Abbreviations, Resume, Intro, Chapter 1 (P[93] to P[160])"""

PART_2 = {
    93: "LIST OF ABBREVIATIONS",
    96: "ABSTRACT",
    97: (
        "This application project focuses on the design and development of an overarching digital platform for managing the services of SOUTARAH GROUP, incorporating a dedicated mobile application for vehicle reservation and tracking. In the face of previously manual quotation management and the absence of centralized customer relationship tracking, the objective was to implement a unified digital ecosystem.\n\n"
        "The adopted methodology relies on the Unified Process associated with UML (UP/UML) for the rigorous modeling of requirements and business processes. The software solution is built upon a modern 3-tier client-server architecture: a responsive web interface designed with React.js and CSS for all multi-sector activities of the company (vehicle rental, trading, technical services, renewable energies, agropastoral, real estate); a native mobile application developed with React Native and Expo specialized in real-time vehicle booking; and a centralized backend powered by Node.js/Express coupled with a MySQL database managed via the Sequelize ORM.\n\n"
        "The results achieved deliver instantaneous synchronization between web and mobile: automated generation of official 2-page pro-forma quotations in PDF format, synchronized multi-item shopping cart, email notifications (Brevo), and a comprehensive administrative dashboard. This solution guarantees SOUTARAH GROUP increased profitability, optimal commercial responsiveness, and complete operational traceability."
    ),
    103: "GENERAL INTRODUCTION",
    104: (
        "The service sector is an essential driver of the Ivorian economy, contributing significantly to GDP and employment, with diverse activities ranging from transportation to international trading, technical engineering, and energy. However, these companies face organizational challenges: paper-based management, slowness in quote generation, and lack of customer traceability. In this context, the integration of ICT becomes a strategic imperative for competitiveness. It is within this perspective that the project carried out at SOUTARAH GROUP takes place."
    ),
    105: (
        "The project title is: \"Design and development of a digital platform for managing the services of SOUTARAH GROUP integrating a mobile application dedicated to vehicle reservation\".\n"
        "The project is structured around two complementary components: a web platform and a mobile application. The web platform centralizes the company's six business divisions (vehicle rental, trading/import-export, civil engineering technical services, renewable energies, agropastoral, and real estate), as well as catalog management, pro-forma quote generation, and the administration back-office. The mobile application, for its part, meets the specific mobility needs of customers by offering vehicle fleet browsing, availability checking, and direct reservation."
    ),
    106: (
        "This report provides an account of the entire software engineering process followed and is structured around four major parts:\n"
        "•  Part One presents the project framework and context, introducing the host organization SOUTARAH GROUP, the analysis of the existing system, the targeted objectives, the project specifications, and task scheduling;\n"
        "• Part Two is dedicated to the conceptual study, detailing the UP/UML methodological approach and the various design diagrams (use cases, activity, sequence, and classes);\n"
        "•  Part Three develops the technical study, justifying the technological choices (React, React Native, Node.js, MySQL) and explaining the overall software architecture;\n"
        "•  Part Four describes the practical implementation of the web platform and mobile application, detailing the developed features, validation testing, achieved results, and financial analysis of the project."
    ),
    113: "PART I",
    114: "PROJECT FRAMEWORK AND CONTEXT",
    131: "I. PRESENTATION OF SOUTARAH GROUP",
    132: "1. General Presentation",
    133: (
        "SOUTARAH GROUP is a versatile company offering a diversified range of services aimed at both corporate clients and individuals. Thanks to its multi-sector expertise, the company provides its clientele with integrated solutions tailored to diverse needs, while maintaining a uniform standard of quality from a single service provider."
    ),
    134: (
        "SOUTARAH GROUP's activities span several areas, notably services related to vehicle rental, trading and import-export, as well as project support and execution. This diversity constitutes one of the main strengths of SOUTARAH GROUP. It allows the company to support its clients across various projects and offer them solutions that match their specific requirements."
    ),
    135: (
        "In an environment marked by the constant evolution of customer needs and the development of digital technologies, SOUTARAH GROUP aims to revolutionize the service delivery industry. The company seeks to strengthen its market position through its multi-sector expertise, constant innovation, and steadfast commitment to customer satisfaction."
    ),
    137: "2. Mission, Vision and Values",
    138: "❖ Mission ",
    139: (
        "The mission of SOUTARAH GROUP is to reinvent quality, reliable and tailored services. This mission reflects the company's commitment to offering its clients solutions adapted to their needs, while constantly seeking to improve the quality and reliability of its services.\n\n"
        "❖ Vision "
    ),
    140: (
        "The vision of SOUTARAH GROUP is to be the preferred partner of our clients with innovative solutions, exceptional responsiveness and quality services.\n\n"
        "❖ Values (S.A.P.E) \n"
        "  The values of SOUTARAH GROUP are grouped around the acronym S.A.P.E :"
    ),
    141: (
        "S — Sustainable and innovative solution\n"
        "The company prioritizes the implementation of sustainable and innovative solutions to effectively respond to the needs of its clients."
    ),
    142: (
        "A — Adaptability\n"
        "SOUTARAH GROUP adapts to the different needs of its clients as well as to changes in its professional environment."
    ),
    143: (
        "P — Customer priority\n"
        "Customer satisfaction constitutes an essential element in the design and delivery of the services offered."
    ),
    144: (
        "E — Staff efficiency\n"
        "The company values the skills and efficiency of its staff to guarantee the quality of delivered services."
    ),
    146: "3. Services ",
    147: "SOUTARAH GROUP operates in several business divisions.",
    148: "➢ Vehicle rental : The vehicle rental service offers mobility solutions adapted to different customer needs, whether for one-time trips or for longer periods.",
    149: "➢ Trading / Import-Export : Facilitate the supply and distribution of various goods.",
    150: "➢ Technical : Installation, maintenance and support of equipment and facilities.",
    151: "➢ Renewable energies : Optimize energy consumption and promote the use of renewable energies.",
    152: "➢ Agropastoral : Agricultural production and livestock farming.",
    153: "➢ Real estate : Sale, rental and management of properties.",
    154: "4. Partnerships ",
    155: "Soutarah Group maintains collaborations with several companies including:",
    156: "BESSAC",
    157: "DM Company",
    158: "CIM IVOIRE",
    159: "Southcomp Polaris",
    160: "Enabel",
}
