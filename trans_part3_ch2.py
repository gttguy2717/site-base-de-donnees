# -*- coding: utf-8 -*-
"""Part 3: Chapter 2 (P[187] to P[224])"""

PART_3 = {
    187: "I. PROJECT CONTEXT AND JUSTIFICATION",
    188: (
        "The continuous growth of SOUTARAH GROUP's activities and the diversification of its divisions generated a substantial volume of quotation requests and reservations. Faced with this increased workload, traditional manual handling mechanisms (isolated emails, informal phone calls, maintaining physical logs) demonstrated their operational limitations. The lack of real-time visibility into rental vehicle availability and the lack of synchronization between sales and technical departments motivated management to initiate the full digital transition of its commercial ecosystem."
    ),
    190: "II. EXISTING SYSTEM STUDY AND LIMITATIONS",
    191: (
        "The preliminary analysis of the existing infrastructure revealed that SOUTARAH GROUP had only a static showcase website. This website presented the company but lacked any dynamic database management component, client authentication portal, or automated pricing engine. Inquiries submitted via basic contact forms arrived in a generic mailbox without traceability, making it impossible to generate reliable statistics and causing delays in issuing official quotations."
    ),
    193: "III. PROJECT OBJECTIVES",
    194: "1. General Objective",
    195: (
        "The overall objective is to design and develop a unified software solution comprising a global service management web platform and a dedicated vehicle reservation mobile application, both synchronized in real time via a secure REST API."
    ),
    197: "2. Specific Objectives",
    198: (
        "Operationally, the project aims to:\n"
        "• Develop a modern web portal interactively presenting all 6 service divisions and the product catalog;\n"
        "• Develop a native mobile application (Android / iOS) dedicated to live fleet browsing, smooth booking with dynamic pricing, and order status tracking;\n"
        "• Implement a hybrid multi-item shopping cart (vehicles and physical supplies) with an automated tax calculation engine (excl. VAT, 18% VAT, 2.5% TDT);\n"
        "• Automate the generation of official 2-page pro-forma quotations in PDF format (with technical specifications and visuals) ready for printing or electronic signature;\n"
        "• Develop a centralized administrative dashboard (Back-Office) for supervising quotes, vehicles, customers, and notifications;\n"
        "• Integrate a transactional email notification system."
    ),
    200: "IV. SYSTEM SPECIFICATIONS",
    201: (
        "The system specifications formalize the functional and non-functional requirements of the interconnected system:\n\n"
        "1. Functional requirements on the Customer side (Web & Mobile) :\n"
        "  • Detailed browsing of the vehicle and product catalog by category;\n"
        "  • Multi-criteria filtering of vehicles (make, category, transmission, air conditioning);\n"
        "  • Selection of rental dates with dynamic calculation according to the destination rate (Abidjan / Outside Abidjan) and driver option;\n"
        "  • Shopping / booking cart management and one-click validation;\n"
        "  • Instant download of the official pro-forma quote in PDF adhering to company legal templates;\n"
        "  • Personal quotation management space;\n\n"
        "2. Functional requirements on the Administrator side :\n"
        "  • Overall supervision of key performance indicators (estimated revenue, active reservations);\n"
        "  • Comprehensive vehicle fleet management (addition, modification, maintenance status);"
    ),
    202: (
        "  • Comprehensive management of trading goods (adding products, updating prices);\n"
        "  • Customer account management and assignment of partner discounts.\n\n"
        "3. Technical requirements and constraints :\n"
        "  • Security;\n"
        "  • Availability and performance;\n"
        "  • Portability: Compatibility with modern web browsers (Chrome, Safari, Edge) and mobile operating systems."
    ),
    204: "V. TASK PLANNING AND GANTT DIAGRAM",
    205: "The project took place over a two-month period (from August 3 to October 3, 2026), according to the following chronological breakdown:",
    207: "1. Planning",
    210: "2. Gantt Diagram",
    212: "Figure 1 : GANTT Diagram ",
    223: "PART II",
    224: "CONCEPTUAL STUDY",
}
