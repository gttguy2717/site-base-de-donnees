# -*- coding: utf-8 -*-
"""
Translations for Section 3: Part III & Database Setup (Paragraphs 399 to 516)
Technological choices, DBMS selection, 3-Tier Architecture,
MySQL schema implementation, and Brevo notification integration.
"""

SEC3_TRANS = {
    399: "PART III",
    400: "TECHNICAL STUDY AND SYSTEM ARCHITECTURE",
    418: "I. ANALYSIS AND JUSTIFICATION OF TECHNOLOGICAL CHOICES",
    419: ("The selection of technologies and software tools constitutes a decisive milestone in the realization of an engineering project. "
          "To guarantee the relevance, robustness, and efficiency of technological choices, an in-depth comparative benchmark was conducted, "
          "taking into account system complexity, team proficiencies, and long-term maintainability. This evaluation was steered by fundamental selection criteria: "
          "computational performance and horizontal scalability, licensing cost structure, end-to-end security, architectural flexibility, "
          "and the richness of community documentation and technical support. These factors directed choices towards cohesive, enterprise-grade solutions."),
    421: "Integrated Development Environment (IDE)",
    424: ("Visual Studio Code (VS Code) was selected for its lightweight footprint, native support for the JavaScript/TypeScript ecosystem, "
          "comprehensive extension marketplace for React, React Native, and MySQL, alongside its integrated command-line interface."),
    428: "UI/UX Prototyping and Wireframing",
    432: ("Figma was utilized for UI/UX interface design and interactive wireframing. Accessible directly within modern web browsers, "
          "it empowered collaborative component prototyping and visual validation prior to frontend implementation, accelerating UI assembly."),
    435: "3. Web Frontend Technologies",
    438: ("For the web portal, the React.js library coupled with vanilla CSS and responsive layout utilities was adopted. "
          "Its Virtual DOM architecture and reusable component model deliver a fluid, high-performance interface, enabling seamless transitions "
          "between catalog browsing, the interactive quotation calculator, and the administrative dashboard."),
    441: "4. Mobile Application Technologies",
    443: ("For the mobile application, React Native paired with the Expo SDK framework was chosen. This technology enables a unified TypeScript/JavaScript "
          "codebase compiled directly into native iOS and Android binaries, delivering native UI performance, direct access to device APIs "
          "(filesystem, document sharing, push notifications), and substantially diminished engineering overhead."),
    445: "5. Backend and REST API Technologies",
    447: ("The application server relies on Node.js and the Express.js framework. This architectural choice maintains unified JavaScript/TypeScript "
          "across the entire software chain. The stateless REST API architecture exchanging structured JSON payloads and secured via JSON Web Tokens (JWT) "
          "guarantees high horizontal concurrency and symmetrically services both Web and Mobile client frontends."),
    449: "6. Transactional Messaging and Notification Technologies",
    450: ("To handle automated transactional messaging and notifications, the Brevo platform was integrated. "
          "It automates email dispatch triggered by platform lifecycle events, notably reservation acknowledgements, order receipts, and admin alerts."),
    451: ("REST API integration centralizes and streamlines outward customer communications, providing reliable deliverability and templating across web and mobile flows."),
    453: "7. Deployment and Cloud Hosting Technologies",
    455: "Hostinger Cloud infrastructure was chosen to host the production deployment of the platform.",
    456: ("Hostinger was selected based on its proven support for Node.js application hosting via Phusion Passenger, native MySQL support, "
          "SSL certificate automation, high uptime, and cost-effective operational pricing."),
    459: "II. DATABASE MANAGEMENT SYSTEM (DBMS)",
    460: ("The selection of the Database Management System (DBMS) represents a foundational structural decision. "
          "The engine must satisfy stringent operational criteria regarding transactional integrity (ACID), security, latency, and operational maintainability. "
          "Within the scope of the SOUTARAH GROUP system, multiple engines were evaluated,"),
    461: ("notably MySQL, PostgreSQL, Microsoft SQL Server, Oracle Database, and MongoDB, comparing data schemas, query concurrency, and deployment overhead."),
    463: "Comparison of Major DBMS Solutions",
    466: "2. Selection of MySQL",
    467: "Following comparative analysis, MySQL was chosen as the primary relational database management system for the platform.",
    468: ("This selection is justified first by the structured relational nature of the business data. The platform manages strict transactional relationships "
          "between customer accounts, fleet vehicles, date-bound reservations, trading merchandise, multi-item quotations, and invoices."),
    469: ("Secondly, the hosting environment configured for SOUTARAH GROUP provides optimized native support for MySQL. Selecting MySQL ensured direct compatibility "
          "between the development environment, Sequelize ORM abstractions, and the remote production server."),
    470: ("Finally, MySQL's established maturity, robust index performance, and extensive tooling within the Node.js ecosystem provide a stable, scalable, "
          "and battle-tested relational backbone."),
    473: "III. GENERAL SYSTEM ARCHITECTURE",
    474: "Our solution is architected as a distributed Three-Tier (3-Tier) client-server system:",
    475: "Presentation Tier (Clients): End-users and staff interact through two synchronized channels:",
    476: "A native Mobile Application (React Native / Expo) dedicated to clients for fleet discovery, instant pricing, and vehicle booking;",
    477: "A responsive Web Platform (React / Vite) providing multi-service catalog browsing, dynamic quotation generation, and back-office administration;",
    478: "Network Tier (Transport & Security): Secures client-server communication using HTTPS protocols and RESTful API endpoints exchanging JSON data payloads;",
    479: ("Application & Data Tier (Logic & Persistence): A centralized Node.js / Express application server manages business rules "
          "(conflict-free date verification, automated quote calculation, JWT authentication) and communicates with the MySQL database via Sequelize ORM for ACID data persistence."),
    481: "Figure 18 : General System Architecture Diagram",
    491: "PART IV",
    492: "SYSTEM IMPLEMENTATION AND OPERATIONAL DEPLOYMENT",
    509: "I. MYSQL DATABASE SCHEMA IMPLEMENTATION",
    510: ("The MySQL database was modeled to guarantee relational integrity across transactions. It comprises the following core entity tables:\n"
          "• Users & Clients: Credentials (email, Bcrypt hashed password, role 'CLIENT' / 'ADMIN') linked to individual or corporate profiles;\n"
          "• Vehicles: Brand, model, category, daily rate, availability status, technical specifications, and photographs;\n"
          "• Reservations: Start/end dates, driver requirement option, destination zone, total amount, and validation status;\n"
          "• Services & Products: Comprehensive catalog covering all 6 business divisions with itemized specs and tariffs;\n"
          "• Quotations: Unique reference code (e.g. DMD-2026-XXXX), generation timestamp, Net and Gross totals, and status;\n"
          "• Notifications: System alerts dispatched to clients and administrative personnel."),
    512: "Figure 19 : Relational Schema and Structure of the MySQL Database",
    514: "II. IMPLEMENTATION OF AI ASSISTANT AND TRANSACTIONAL EMAIL NOTIFICATIONS (BREVO / SMTP)",
    515: ("To modernize customer engagement and streamline operational communication at SOUTARAH GROUP, the platform was augmented "
          "with two specialized functional modules: an automated conversational assistant and an automated transactional email pipeline.")
}
