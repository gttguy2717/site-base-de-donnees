# -*- coding: utf-8 -*-
"""Part 5: Chapter 4 (P[374] to P[510])"""

PART_5 = {
    374: "Figure 4 : Activity Diagram : Vehicle Reservation ",
    381: "2.3. Activity Diagram : Product Purchase",
    382: (
        "The Product Purchase activity diagram illustrates the process through which a customer purchases an item on the SOUTARAH platform. The process begins when the customer browses the catalog, selects a product, and adds it to their cart. The system immediately calculates and displays in the cart the detailed amounts (excluding taxes, VAT, and total including taxes). When the customer checks out the cart and proceeds to order placement, the system generates the official time-stamped quotation and displays available payment methods. The customer chooses their payment method, either online (via credit card or Mobile Money) or in cash upon delivery, then confirms the order. The system subsequently records the order in the database, automatically validates the quotation, and alerts the administrator. The administrator inspects order details and simply marks the quote as read to initiate item preparation and shipping. Finally, the customer receives order confirmation. This diagram thus underscores the direct purchasing flow and transparency of calculations starting right from the shopping cart stage."
    ),
    387: "Figure 5 : Activity Diagram : Product Purchase ",
    390: "3. Sequence Diagrams",
    392: "3.1. Sequence Diagram : Online Payment",
    393: (
        "This sequence diagram illustrates the flow of an electronic financial transaction carried out via the Genius Pay gateway (integrating bank cards and local Mobile Money solutions). Upon cart confirmation, the API server initializes a secure checkout session and redirects the client to the external payment portal. Following authorization and bank debit, the payment gateway notifies the API server via a secure webhook to update the order status to paid in the database. The Brevo service immediately dispatches an electronic receipt to the customer, while the web interface presents the payment confirmation screen."
    ),
    394: "Figure 6 : Sequence Diagram : Secure Online Payment",
    397: "3.2. Sequence Diagram : Vehicle Reservation",
    398: (
        "This sequence diagram illustrates the complete workflow of reserving a vehicle on the platform. When the customer selects a car and a rental period, the web interface queries the API server to verify the absence of scheduling conflicts in the database. Once availability is confirmed and the order is validated by the client, the API records the reservation along with the associated quotation, then triggers the Brevo messaging service to instantly dispatch confirmation emails to both customer and administrator. In their management dashboard, the administrator accesses the order details sheet and marks the quote as read, initiating operational vehicle preparation without requiring manual quote validation."
    ),
    399: "Figure 7 : Sequence Diagram : Vehicle Reservation ",
    402: "3.3. Sequence Diagram : Product Purchase",
    403: (
        "The Product Purchase sequence diagram describes the acquisition workflow for goods from the trading catalog. Upon order validation, data is transmitted to the API server, which logs the transaction into the database and automatically validates the corresponding quote. The Brevo service is then invoked to dispatch the purchase summary to the customer and alert the administrator of the new order. The administrator reviews ordered item specifications on their dashboard and marks the quote as read to schedule package preparation and delivery."
    ),
    404: "Figure 8 : Sequence Diagram : Product Purchase",
    406: "3.4. Sequence Diagram : User Registration",
    407: (
        "This sequence diagram describes the registration process for a new user on the SOUTARAH platform. The visitor inputs their information (individual or corporate entity) through the web interface form. This data is transmitted to the API server, which first verifies the uniqueness of the email address and phone number against the database. After confirming the absence of duplicates, the API server secures the password via Bcrypt hashing and inserts the user and client profile records into the database. The API server then invokes the Brevo service to dispatch a welcome and confirmation email to the visitor, while the web interface confirms account creation and redirects them to the login page."
    ),
    408: "Figure 9 : Sequence Diagram : User Registration ",
    410: "4. Class Diagram",
    411: (
        "It represents the static structure of the system by describing classes, their attributes, methods, and relationships connecting them. It is generally constructed following an in-depth understanding of system requirements and interactions, serving as the blueprint for the implementation phase."
    ),
    422: "PART III",
    423: "TECHNICAL STUDY",
    441: "I. ANALYSIS AND JUSTIFICATION OF TECHNOLOGICAL CHOICES",
    442: (
        "The choice of technologies and tools represents a decisive phase in project implementation. To guarantee the relevance and effectiveness of decisions made, an in-depth analysis of solutions available on the market was conducted, taking into account project specifications, our skills, and long-term objectives. This process was grounded in several essential selection criteria: performance and scalability, cost and licensing conditions, security, integration flexibility, as well as documentation quality and technical support accessibility. These factors guided technological choices toward robust, tailored, and sustainable solutions."
    ),
    444: "Integrated Development Environment (IDE)",
    447: (
        "Visual Studio Code was selected for its lightweight footprint, native support for the JavaScript/TypeScript ecosystem, its extensions for React, React Native, and MySQL, as well as its integrated terminal."
    ),
    451: "UI/UX Mockups",
    455: (
        "Figma is an online UI/UX interface design tool used to create interactive and collaborative mockups. Accessible from a simple browser, it allows teams to design and share visually clear prototypes. In a web project, it facilitates interface visualization prior to development."
    ),
    458: "3. Frontend Web Technologies",
    461: (
        "For the web platform, the React.js framework coupled with CSS was chosen. Its architecture based on the Virtual DOM and reusable components provides a reactive and modular interface, facilitating seamless navigation across the catalog, interactive cart, and administrator dashboard."
    ),
    464: "4. Mobile Technologies",
    466: (
        "For the mobile application, React Native combined with the Expo ecosystem was retained. This technology offers a single codebase in TypeScript/JavaScript natively compiled for Android and iOS, guaranteeing high performance, convenient access to device hardware features (file system, PDF sharing), and a substantial reduction in development costs."
    ),
    468: "5. Backend Technologies and API",
    470: (
        "The application server relies on Node.js and the Express.js framework. This choice enables maintaining the same language (JavaScript/TypeScript) across the entire software pipeline. The stateless REST architecture based on JSON exchanges and secured by JWT tokens ensures optimal scalability and uniformly powers both the Web and Mobile applications."
    ),
    472: "6. Notification and Messaging Technologies",
    473: (
        "To manage notifications and electronic messaging delivery, Brevo was selected. It allows automating email dispatches linked to various platform events, notably reservation confirmations, order alerts, and messages intended for customers."
    ),
    474: (
        "Its API integration centralizes and automates communication with users, while facilitating interoperability across web and mobile applications."
    ),
    476: "6. Online Payment Technologies",
    481: "7. Deployment Technologies",
    483: "To host the platform online, Hostinger was selected.",
    484: (
        "The selection of Hostinger is explained particularly by its ease of deployment, accessible cost, and compatibility with the technologies used in the project."
    ),
    487: "II. DATABASE MANAGEMENT SYSTEM (DBMS) ",
    488: (
        "The selection of the Database Management System (DBMS) represents an important step in application design and deployment. It must fulfill system requirements regarding performance, security, reliability, scalability, and ease of maintenance. In the context of the SOUTARAH GROUP project, several solutions were studied,"
    ),
    489: (
        "notably MySQL, PostgreSQL, SQL Server, Oracle, and MongoDB. The analysis evaluated their data models, performance, costs, and integration capabilities."
    ),
    491: "Comparison of Major DBMS",
    495: "2. Selection of the DBMS ",
    496: "After comparing the various solutions, MySQL was chosen as the database management system for our project.",
    497: (
        "This choice is primarily justified by the nature of data handled by the platform. The application must manage structured records such as customers, vehicles, reservations, products, orders, and quotations."
    ),
    498: (
        "Another determining factor in this selection involves the production environment. The hosting package acquired by SOUTARAH GROUP specifically supports MySQL. Choosing this DBMS ensures optimal compatibility between the developed application and the hosting infrastructure."
    ),
    499: (
        "Finally, MySQL benefits from a widely adopted ecosystem in web development and integrates seamlessly with the technologies used in the project. It thus represents a reliable, high-performance, accessible, and suitable solution."
    ),
    502: "III. GENERAL SYSTEM ARCHITECTURE",
    503: "Our solution is based on a distributed three-tier (3-tier) architecture:",
    504: "Presentation Tier (Clients) : Users interact with the system via two complementary channels:",
    505: "A mobile application (React Native / Expo) dedicated specifically to customers for browsing the vehicle fleet and making reservations online;",
    506: "A web platform (React / Vite) enabling overall service management, quotation requests, and administrative oversight (Back-Office).",
    507: "Network Tier (Internet) : Ensures secure communication between clients and the server via HTTPS and REST API requests exchanging JSON data.",
    508: "Business and Data Tier (Server & DB) : A Node.js / Express application server manages business logic (automated availability verification preventing double bookings, quotation calculations, JWT security) and communicates with a MySQL database for data persistence.",
    510: "Figure 19 : General System Architecture Diagram ",
}
