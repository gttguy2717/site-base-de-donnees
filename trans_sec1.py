# -*- coding: utf-8 -*-
"""
Translations for Section 1: Part I (Paragraphs 112 to 222)
Project framework, Company presentation, Problem statement, Objectives,
System specifications, and Task planning.
"""

SEC1_TRANS = {
    112: "PART I",
    113: "PROJECT FRAMEWORK AND INSTITUTIONAL CONTEXT",
    130: "I. PRESENTATION OF SOUTARAH GROUP",
    131: "1. General Presentation",
    132: ("SOUTARAH GROUP is a versatile private enterprise offering a diversified range of services intended for both corporate clients and private individuals. "
          "Leveraging its multisectoral expertise, the company provides its clientele with integrated solutions tailored to varied requirements, while maintaining "
          "an unwavering standard of quality under a single trusted service provider."),
    133: ("SOUTARAH GROUP's operations span multiple sectors, notably vehicle rental services, trading and import-export, as well as project engineering and implementation. "
          "This multisectoral diversity represents one of the company's primary strengths, enabling it to support clients across diverse endeavors and deliver solutions "
          "aligned with their exact operational specifications."),
    134: ("In a rapidly evolving market landscape driven by changing customer expectations and digital technology adoption, SOUTARAH GROUP aims to revolutionize "
          "service delivery in Côte d'Ivoire. The company seeks to consolidate its market position through multisectoral excellence, continuous technological innovation, "
          "and an unwavering commitment to client satisfaction."),
    136: "2. Mission, Vision, and Values",
    137: "❖ Mission",
    138: ("SOUTARAH GROUP's mission is to reinvent high-quality, reliable, and customized services. This mission reflects the company's determination to provide clients "
          "with tailored solutions while continuously advancing the quality, responsiveness, and reliability of its offerings.\n\n"
          "❖ Vision"),
    139: ("SOUTARAH GROUP's vision is to be the privileged partner of our clients through innovative solutions, exceptional responsiveness, and superior service standards.\n\n"
          "❖ Corporate Values (S.A.P.E)\n"
          "  SOUTARAH GROUP's corporate values are embodied in the institutional acronym S.A.P.E:"),
    140: ("S — Sustainable and Innovative Solution\n"
          "The company emphasizes deploying durable and technologically advanced solutions to effectively resolve client operational challenges."),
    141: ("A — Operational Adaptability\n"
          "SOUTARAH GROUP swiftly adapts to the evolving requirements of its clients and changing industry conditions."),
    142: ("P — Absolute Customer Priority\n"
          "Customer satisfaction is the central pillar in the conception and execution of all service offerings."),
    143: ("E — Staff Efficiency\n"
          "The company fosters high competence, rigor, and proactive efficiency across its teams to ensure the flawless execution of all projects."),
    145: "3. Business Units and Services",
    146: "SOUTARAH GROUP operates across six specialized business divisions:",
    147: ("➢ Vehicle Rental: The vehicle rental service provides flexible mobility solutions tailored to diverse client needs, whether for short-term daily trips, "
          "executive transfers, or long-term corporate missions with or without professional drivers."),
    148: "➢ Trading / Import-Export: Facilitating global sourcing, procurement, and distribution of industrial goods, equipment, and consumables.",
    149: "➢ Technical Services: Electrical installations, industrial preventive maintenance, network infrastructure, and civil engineering works (BTP).",
    150: "➢ Renewable Energies: Optimizing energy efficiency and delivering turnkey solar photovoltaic installations for residential and commercial infrastructure.",
    151: "➢ Agropastoral: Sustainable crop farming, eco-responsible agricultural production, and livestock breeding with high added value.",
    152: "➢ Real Estate: Property development, land parceling, residential rentals, renovations, and commercial space leasing.",
    153: "4. Strategic Partnerships",
    154: "SOUTARAH GROUP maintains active collaborations with reputable national and international corporate partners, including:",
    155: "BESSAC",
    156: "DM Company",
    157: "CIM IVOIRE",
    158: "Southcomp Polaris",
    159: "Enabel",
    186: "I. PROJECT CONTEXT AND RATIONALE",
    187: ("The continuous expansion of SOUTARAH GROUP and the diversification of its business divisions generated a substantial surge in quote inquiries and booking requests. "
          "Faced with this rapid increase in transaction volume, traditional manual management mechanisms (isolated email threads, informal telephone calls, paper ledgers) "
          "demonstrated severe operational bottlenecks. The lack of real-time visibility over vehicle fleet availability and the absence of coordination between commercial "
          "and technical departments led management to initiate a complete digital transformation of its business ecosystem."),
    189: "II. EXISTING SYSTEM DIAGNOSIS AND LIMITATIONS",
    190: ("The preliminary assessment of the existing infrastructure revealed that SOUTARAH GROUP possessed only a static showcase website. While it provided a brief company "
          "introduction, it lacked any dynamic database components, customer authentication portal, or automated pricing mechanisms. Customer inquiries submitted through basic "
          "web contact forms landed in a generic inbox without tracking, preventing reliable analytics production and causing substantial delays in issuing formal quotes."),
    192: "III. PROJECT OBJECTIVES",
    193: "1. General Objective",
    194: ("The general objective is to design and develop a unified software ecosystem comprising an integrated web platform for global service management and a mobile application "
          "dedicated to vehicle reservation, both synchronized in real time via a secure REST API."),
    196: "2. Specific Objectives",
    197: ("At an operational level, the project aims to:\n"
          "• Develop a modern web portal interactively showcasing all 6 service divisions and product catalog;\n"
          "• Develop a native mobile application (Android / iOS) dedicated to live vehicle fleet browsing, conflict-free booking with dynamic pricing, and order tracking;\n"
          "• Implement a hybrid multi-item shopping cart (vehicles and trade supplies) with automated tax calculation (Net, VAT 18%, TDT 2.5%);\n"
          "• Automate the generation of official 2-page pro-forma PDF quotations (including technical datasheets and visual imagery) ready for printing or digital signature;\n"
          "• Develop a centralized administrative back-office dashboard to manage quotes, vehicles, client accounts, and system notifications;\n"
          "• Integrate a transactional email notification system for real-time customer and admin alerts."),
    199: "IV. SYSTEM SPECIFICATIONS",
    200: ("The specification document formalizes the functional and non-functional requirements of the interconnected platform:\n\n"
          "1. Functional Requirements - Client Side (Web & Mobile):\n"
          "  • Detailed browsing of the vehicle fleet and catalog items categorized by sector;\n"
          "  • Multi-criteria vehicle filtering (make, category, transmission, air conditioning);\n"
          "  • Date selection with dynamic pricing based on geographical destination (Abidjan / Regional zones) and driver option;\n"
          "  • Multi-item cart management with instant one-click booking validation;\n"
          "  • Instant download of official pro-forma PDF quotes complying with company legal guidelines;\n"
          "  • Personal customer dashboard to view order history and reservation statuses.\n\n"
          "2. Functional Requirements - Administrator Side:\n"
          "  • Global supervision of key business indicators (estimated revenue, active reservations);\n"
          "  • Complete fleet management (vehicle creation, specifications update, maintenance status);\n"),
    201: ("  • Complete trading catalog management (product creation, inventory, pricing adjustments);\n"
          "  • Customer account administration and partner discount tier management.\n\n"
          "3. Technical Requirements and Constraints:\n"
          "  • Security: Data encryption, password hashing, and JWT stateless authentication;\n"
          "  • High availability and performance: Low page load times and minimal server latency;\n"
          "  • Cross-platform portability: Compatibility across modern desktop browsers (Chrome, Safari, Edge) and mobile operating systems."),
    203: "V. TASK SCHEDULING AND GANTT DIAGRAM",
    204: "The project was executed over a two-month period (from August 3 to October 3, 2026), structured across the following chronological phases:",
    206: "1. Schedule Breakdown",
    210: "2. Gantt Diagram",
    212: "Figure 1 : GANTT Schedule Diagram"
}
