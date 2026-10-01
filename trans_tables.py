# -*- coding: utf-8 -*-
"""
Translations for All 6 Tables in the Report
Table 1: List of Abbreviations
Table 2: Task Planning & Gantt Chronogram
Table 3: MERISE vs UP/UML Comparative Benchmark
Table 4: DBMS Comparative Benchmark
Table 5: Functional Test Acceptance Matrix
Table 6: Estimated Annual Production Operating Budget
"""

TABLES_TRANS = [
    # Table 1: Abbreviations (25 rows x 2 cols)
    [
        ["API", "Application Programming Interface"],
        ["BTP", "Building and Civil Works (Bâtiment et Travaux Publics)"],
        ["CSS", "Cascading Style Sheets"],
        ["ESI", "Higher School of Industry (École Supérieure d'Industrie)"],
        ["HTML", "HyperText Markup Language"],
        ["HTTP / HTTPS", "HyperText Transfer Protocol (Secure)"],
        ["AI", "Artificial Intelligence"],
        ["IDE", "Integrated Development Environment"],
        ["INP-HB", "Félix Houphouët-Boigny National Polytechnic Institute"],
        ["JSON", "JavaScript Object Notation"],
        ["JWT", "JSON Web Token"],
        ["LLM", "Large Language Model"],
        ["CDM", "Conceptual Data Model (Modèle Conceptuel de Données)"],
        ["LDM", "Logical Data Model (Modèle Logique de Données)"],
        ["ORM", "Object-Relational Mapping"],
        ["PDF", "Portable Document Format"],
        ["UP", "Unified Process (Processus Unifié)"],
        ["REST", "Representational State Transfer"],
        ["LLC (SARL)", "Limited Liability Company (Société à Responsabilité Limitée)"],
        ["DBMS (SGBD)", "Database Management System"],
        ["RDBMS (SGBDR)", "Relational Database Management System"],
        ["SQL", "Structured Query Language"],
        ["STIC", "Information and Communication Science and Technology"],
        ["UI / UX", "User Interface / User Experience"],
        ["UML", "Unified Modeling Language"]
    ],

    # Table 2: Project Task Planning (8 rows x 5 cols)
    [
        ["No.", "Task Designation", "Start Date", "Duration", "End Date"],
        ["1", "Initial immersion, stakeholder meetings & project scoping", "08/03/2026", "5 days", "08/07/2026"],
        ["2", "Existing system audit & specifications drafting", "08/08/2026", "4 days", "08/11/2026"],
        ["3", "Conceptual modeling (UP/UML) & database architecture", "08/12/2026", "6 days", "08/17/2026"],
        ["4", "Backend REST API engineering (Node.js / Express & MySQL)", "08/18/2026", "10 days", "08/27/2026"],
        ["5", "Web Platform frontend development (React.js & CSS)", "08/28/2026", "12 days", "09/08/2026"],
        ["6", "Mobile Application development (React Native / Expo)", "09/09/2026", "12 days", "09/20/2026"],
        ["7", "Integration testing and bug fixes", "09/21/2026", "6 days", "09/26/2026"]
    ],

    # Table 3: Comparative Analysis of MERISE vs UP/UML (7 rows x 3 cols)
    [
        ["Evaluation Criteria", "MERISE Method", "Unified Process & UML (UP/UML)"],
        ["Approach", "Sequential, strict separation between data and processes", "Object-oriented, iterative, incremental, use-case driven"],
        ["Data Modeling", "CDM, LDM highly adapted to relational SQL databases", "Class diagrams and object models with high architectural flexibility"],
        ["Process Modeling", "CPM, LPM centered on information flow cycles", "Use case, activity, and sequence diagrams covering dynamic flows"],
        ["Web / Mobile Adaptation", "Rigid for asynchronous event-driven web and mobile apps", "Naturally suited to modular frontend/backend distributed architectures"],
        ["System Evolution", "Heavy remodeling of conceptual layers upon change", "Seamless integration of extensions via modular class hierarchies"],
        ["Decision", "Used complementarily for initial relational structuring", "Primary methodology guiding the full engineering lifecycle"]
    ],

    # Table 4: DBMS Benchmark (8 rows x 6 cols)
    [
        ["Criteria", "MySQL", "PostgreSQL", "SQL Server", "Oracle", "MongoDB"],
        ["Type", "Relational, open source", "Relational, open source", "Relational, proprietary", "Relational, proprietary", "NoSQL, document-oriented"],
        ["Data Model", "Relational, structured", "Relational, structured", "Relational, structured", "Relational, structured", "Non-relational, flexible JSON documents"],
        ["Performance", "Very high", "Very high", "Very high", "Outstanding", "Outstanding on specific read workloads"],
        ["Scalability", "Good", "Very good", "Very good", "Outstanding", "Outstanding"],
        ["Licensing Cost", "Free / Open Source", "Free / Open Source", "Commercial / Paid", "Commercial / Paid", "Free Community / Paid Cloud"],
        ["Ease of Use", "High", "Medium to High", "High", "Complex", "High"],
        ["Hosting Compatibility", "Supported natively on host", "Not available on selected tier", "Unsupported", "Unsupported", "Unsupported"]
    ],

    # Table 5: Acceptance Test Matrix (9 rows x 4 cols)
    [
        ["Module / Feature", "Executed Test Scenario", "Expected Outcome", "Status"],
        ["Authentication", "User login with valid email and password", "JWT token issuance and redirect to customer dashboard", "PASSED"],
        ["API Security", "Unauthorized access attempt to admin route without bearer token", "HTTP 403 Forbidden error response returned", "PASSED"],
        ["Web Catalog", "Multi-division product browsing and category filtering", "Instant rendering of products matching filter criteria", "PASSED"],
        ["Mobile Booking", "Vehicle selection and pickup/return date specification", "Dynamic total calculation according to pricing scale", "PASSED"],
        ["Availability Check", "Booking attempt on an already reserved calendar window", "Conflict warning modal and block of duplicate booking", "PASSED"],
        ["PDF Quote Engine", "Cart submission and instant PDF document download", "Generation of official 2-page pro-forma quote with visual branding", "PASSED"],
        ["DB Synchronization", "Mobile order validation and real-time review in Back-Office", "Immediate reflection of reservation in admin portal", "PASSED"],
        ["Email Notifications", "Transmission of new quote inquiry", "Automated dispatch and receipt of confirmation email via Brevo", "PASSED"]
    ],

    # Table 6: Estimated Annual Production Operating Budget (5 rows x 3 cols)
    [
        ["Expense Item", "Technical Description", "Estimated Annual Cost (FCFA)"],
        ["Domain Name & SSL", ".com domain name + Wildcard SSL certificate", "35,000"],
        ["Mobile Developer Accounts", "Google Play Store (one-time) + Apple Developer (annual subscription)", "75,000"],
        ["Preventive Maintenance", "Automated backups, security patches, and technical support", "180,000"],
        ["TOTAL ESTIMATED ANNUAL", "Overall operational operating and maintenance budget", "290,000 FCFA"]
    ]
]
