# -*- coding: utf-8 -*-
"""
Translations for Section 4: Part IV, Testing, Financials, Conclusion & Bibliography
(Paragraphs 517 to 640)
"""

SEC4_TRANS = {
    517: "1. Intelligent Virtual Assistant (AI Agent)",
    518: ("To guide visitors and assist management, an intelligent conversational agent powered by an advanced Large Language Model (LLM) was developed:"),
    519: ("Technical Architecture: It is built around a floating interactive React widget connected via a secure REST API to the backend service. "
          "The backend queries OpenAI (gpt-4o-mini), dynamically injecting real-time context from the MySQL database (available vehicles, technical specs, pricing, and stock status)."),
    520: ("Customer Role: The assistant understands natural language inquiries (e.g. \"I am looking for an air-conditioned 5-passenger vehicle for Yamoussoukro\"), "
          "suggests the optimal model, and renders clickable action buttons to immediately redirect the user to the vehicle sheet or booking cart."),
    521: ("Administrator Role: When authenticated with the ADMIN role, the assistant transforms into an executive decision-support tool: "
          "it executes aggregation queries to answer operational questions (inventory near depletion, most rented vehicles, volume of pending quotations)."),
    523: "2. Messaging and Transactional Notification Service (Brevo / SMTP)",
    524: "To guarantee end-to-end traceability and respond immediately to commercial leads, an email notification pipeline was implemented:",
    525: ("Delivery Infrastructure: To dispatch emails, our Node.js server employs Nodemailer, which formats and structures MIME messages. "
          "These messages are securely transmitted to the Brevo platform via TLS encryption for worldwide inbox delivery."),
    526: ("Client Notifications: The system automatically triggers email dispatch upon new user registration, reservation confirmation, "
          "and delivers the official 2-page pro-forma PDF quotation immediately upon cart checkout."),
    527: ("Administrator Alerts: Whenever a client adds a vehicle booking or product to their cart, an instant notification is dispatched to the sales team "
          "containing client contact details, selected dates, and estimated totals, enabling proactive customer care."),
    529: "III. IMPLEMENTATION OF WEB PLATFORM INTERFACES",
    530: "The web portal was developed with a modern corporate aesthetic adhering to SOUTARAH's graphic charter:",
    531: "1. Home and Authentication Pages",
    533: ("The Home page serves as the digital front door. It presents company history, S.A.P.E values, the 6 core business divisions, "
          "and embeds the interactive AI assistant to guide visitors."),
    534: "Figure 20 : Web Interface: Home Page",
    537: ("The Login page allows clients to access their personal portal by entering their authentication credentials (email and password). "
          "Following server validation, the user is authenticated with access to personalized features."),
    539: "Figure 21 : Web Interface: Authentication Form and Client Login",
    540: "2. Product Catalog",
    541: "Enables clients to browse industrial supplies, building materials, and hardware tools, with direct cart addition capabilities.",
    542: "3. Vehicle Reservation Module",
    543: "Allows selecting a vehicle, specifying pickup and return dates, and opting for a professional driver.",
    555: "Figure 23 : Web Interface: Vehicle Reservation Module",
    556: "4. Multi-Item Cart and PDF Quotation Generation",
    557: ("The shopping cart unifies vehicle reservations and physical merchandise, calculates statutory taxes (Net, 18% VAT, 2.5% TDT), "
          "and generates an official downloadable pro-forma PDF quote instantly."),
    558: "Figure 24 : Web Interface: Multi-Item Shopping Cart",
    560: "5. Client Portal and Order Tracking",
    561: "Provides authenticated users with a comprehensive view of their active and past quotation requests.",
    563: "Figure 25 : Web Interface: Customer Portal and Request Tracking",
    567: "IV. IMPLEMENTATION OF THE MOBILE RESERVATION APPLICATION",
    568: "The 'SOUTARAH Mobile' application provides a specialized mobility solution centered on vehicle fleet rental:",
    570: "1. Home Screen and Detailed Vehicle Sheet",
    571: ("The home screen displays available vehicles categorized (SUVs, Sedans, Utility Vans) with dynamic search filters, daily pricing, "
          "and high-definition imagery. The detail sheet presents vehicle technical specifications (air conditioning, transmission, fuel type), "
          "incorporates an interactive date-range picker, and computes the dynamic total cost based on destination zone and driver option."),
    574: "Figure 26 : Mobile Application: Home Screen and Detailed Vehicle Sheet",
    575: "2. Mobile Cart",
    576: "Allows adjusting rental durations or quantities, inputting special delivery instructions, and confirming booking requests in real time.",
    578: "V. IMPLEMENTATION OF THE ADMINISTRATIVE BACK-OFFICE",
    579: ("The Web Back-Office acts as the central control tower for the enterprise. It features:\n"
          "• Dashboard: Performance charts, estimated revenue, volume of pending quotes and active reservations;\n"
          "• Fleet and Trading Management: Adding new vehicles and products, updating daily rental rates and stock levels;"),
    582: "Figure 28 : Administration Interface: Dashboard",
    585: "Figure 29 : Administration Interface: Fleet and Reservation Management",
    589: "I. FUNCTIONAL TESTING AND VALIDATION",
    590: "An exhaustive validation campaign was conducted to verify system robustness, edge-case resilience, and transactional integrity across web and mobile endpoints:",
    593: "II. FINANCIAL ASSESSMENT AND COST ESTIMATION",
    594: "1. Hardware and Software Costs",
    595: ("As all selected development frameworks (React, React Native, Node.js, MySQL, Expo) utilize free open-source licenses, "
          "direct software licensing costs were zero. Hardware investment was focused on developer workstations and mobile test terminals."),
    596: "2. Hosting and Maintenance Costs",
    597: "For production deployment, estimated annual operating costs are broken down as follows:",
    599: "III. Profitability, Return on Investment (ROI), and Future Evolutionary Perspectives",
    600: "1. Immediate Profitability and Return on Investment",
    601: ("Automating vehicle booking and quote generation allows SOUTARAH GROUP to reduce administrative processing time per client by over 80% "
          "(dropping from 45 minutes to under 3 minutes). This immediate commercial responsiveness, combined with the total elimination of revenue losses "
          "resulting from double bookings, enables full return on investment within the very first operating quarter."),
    603: "2. Platform Evolutionary Perspectives",
    604: "To support the company's long-term expansion, the modular software architecture enables short- and medium-term deployment of:",
    605: "Direct Mobile Money Payment: Production activation of mobile payment gateways (Wave, Orange Money, MTN MoMo) to collect online deposits instantly;",
    606: "Telematics and GPS Fleet Tracking: Integrating IoT connected OBD trackers in fleet vehicles to monitor trips in real time and schedule preventive mechanical maintenance;",
    607: "Native Push Notifications: Instant smartphone notifications via Firebase Cloud Messaging (FCM) to update clients on booking validation and driver assignment.",
    610: "GENERAL CONCLUSION",
    611: ("At the conclusion of this application internship conducted within SOUTARAH GROUP, we successfully completed the comprehensive design and implementation "
          "of an integrated digital solution, addressing the theme: \"Design and development of a digital service management platform for SOUTARAH GROUP integrating "
          "a mobile application dedicated to vehicle reservation\".\n\n"
          "This project profoundly modernized the company's commercial operations by replacing manual, fragmented workflows with an interconnected, high-performance "
          "software ecosystem. The rigorous methodological approach based on the Unified Process and UML modeling (UP/UML) guaranteed precise requirement specification "
          "and a robust relational schema for the MySQL database.\n\n"
          "From a technical perspective, the synergy between the React.js web platform and the React Native/Expo mobile application, both anchored around a Node.js/Express "
          "REST API, fulfilled all assigned engineering goals. Clients now benefit from unified visibility across the company's 6 business divisions, a seamless "
          "vehicle reservation engine with anti-collision date validation, an interactive multi-item cart, and automated 2-page official pro-forma PDF quote generation.\n\n"
          "From a personal and academic standpoint, this project proved exceptionally rewarding. It allowed us to consolidate the theoretical foundations acquired at the "
          "Higher School of Industry (ESI) of INP-HB, master real-world software engineering constraints in a corporate environment, and gain hands-on expertise in leading modern full-stack technologies."),
    619: "BIBLIOGRAPHY",
    620: "I. REFERENCE BOOKS AND METHODOLOGICAL MANUALS:",
    621: "AUDIBERT, Laurent. \"UML Course: Object Modeling and Diagrams\", Eyrolles Publishing / University Institute, pages 21-46.",
    622: "ROQUES, Pascal. \"UML 2 by Practice: Case Studies and Solved Exercises\", Eyrolles Publishing, 7th edition, 2021, 394 pages.",
    624: "II. ACADEMIC COURSE MATERIALS (INP-HB / ESI):",
    625: "Zana Yéo. \"HTTP-Server-and-Express.js\", Course Lecture Notes, STIC Department, ESI / INP-HB Yamoussoukro, 2025-2026."
}
