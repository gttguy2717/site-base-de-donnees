# -*- coding: utf-8 -*-
"""Part 6: Chapter 5 (P[520] to P[612])"""

PART_6 = {
    520: "PART IV",
    521: "IMPLEMENTATION AND OPERATIONAL DEPLOYMENT",
    538: "I. MYSQL DATABASE SCHEMA IMPLEMENTATION",
    539: (
        "The MySQL database was designed to guarantee transactional consistency across data flows. It incorporates the following main tables:\n"
        "• Users & Clients: credential management (email, hashed password, 'CLIENT' or 'ADMIN' role) and links to individual or corporate profiles;\n"
        "• Vehicles: make, model, category, daily rental rate, status, photographs;\n"
        "• Reservations: start and end dates, with/without driver option, total amount, status;\n"
        "• Services & Products: general catalog of the 6 divisions with technical specifications and pricing;\n"
        "• Quotations: unique reference (e.g.: DMD-2026-XXXX), creation timestamp, amount excl./incl. tax;\n"
        "• Notifications: alerts dispatched to clients and administrators."
    ),
    543: "II. IMPLEMENTATION OF THE AI ASSISTANT AND TRANSACTIONAL EMAIL NOTIFICATION SERVICE (BREVO / SMTP)",
    544: (
        "To modernize customer engagement and streamline operational communications at SOUTARAH GROUP, we enriched the platform with two modules: an intelligent conversational agent and an automated transactional email service."
    ),
    546: "1. Intelligent Virtual Assistant (AI Agent)",
    547: (
        "To guide visitors and assist managers, a virtual agent based on an advanced Large Language Model (LLM) was developed:"
    ),
    548: (
        "Technical Architecture : It is built around a floating interactive widget in React connected via a secure REST API to the backend service. The latter queries the OpenAI model (gpt-4o-mini) by dynamically injecting real-time context from the MySQL database (available vehicles, technical specifications, prices, and stock levels)."
    ),
    549: (
        "Customer Role : The assistant understands inquiries expressed in natural language (e.g.: \"I am looking for a 5-seater air-conditioned vehicle for Yamoussoukro\"), suggests the appropriate model, and generates clickable action buttons to immediately redirect the user to the vehicle sheet or to the shopping cart."
    ),
    550: (
        "Administrator Role : When authenticated with the ADMIN role, the assistant transforms into a decision-support tool: it executes aggregation queries to answer operational management questions (products near stockout threshold, most rented vehicles, pending quotation volume)."
    ),
    552: "2. Transactional Email and Messaging Service (Brevo / SMTP)",
    553: (
        "To guarantee traceability and respond promptly to business inquiries, an email notification system was implemented:"
    ),
    554: (
        "Delivery Infrastructure : To send emails, our Node.js server utilizes Nodemailer, which formats messages. These messages are then transmitted to the professional Brevo delivery service, which handles dispatch to recipients. Communication with Brevo is fully encrypted and secure (TLS protocol)."
    ),
    555: (
        "Customer Notifications : The system automatically triggers an email dispatch upon new user registration, upon booking confirmation, and delivers the official 2-page pro-forma quotation in PDF format as soon as the shopping cart is checked out."
    ),
    556: (
        "Administrator Alerts : Whenever a customer adds a vehicle reservation or an item to their cart, an immediate alert is transmitted to the sales team containing client contact details, date breakdowns, and estimated totals, enabling proactive customer follow-up."
    ),
    558: "3. Secure Online Payment Module (Genius Pay)",
    559: (
        "To secure payments and automate order validation, a payment gateway was integrated via Genius Pay:"
    ),
    560: (
        "Infrastructure and Gateway : Our Node.js server initializes the transaction via the Genius Pay REST API and redirects the customer to its secure, TLS-encrypted checkout portal. No sensitive banking information transits through our servers, ensuring optimal security."
    ),
    561: (
        "Payment Methods : The platform accepts credit cards (Visa, Mastercard) as well as local Mobile Money. Transactions are protected by strong authentication (OTP/SMS code) prior to effective settlement."
    ),
    562: (
        "Validation and Notifications : Upon banking validation, Genius Pay notifies our API directly via Webhook to update order status to \"PAID\" in the database. The Brevo service immediately routes the electronic receipt to the client, while in case of refusal, an alert invites them to retry."
    ),
    564: "III. IMPLEMENTATION OF WEB PLATFORM INTERFACES",
    565: "The web portal was developed with a modern aesthetic adhering to SOUTARAH's graphic guidelines:",
    566: "1. Home and Authentication Pages",
    568: (
        "The homepage serves as the primary storefront. It presents the company history, S.A.P.E values, service divisions, and integrates an intelligent virtual assistant guiding visitors."
    ),
    570: (
        "The login page allows clients to access their personal portal by entering their login credentials, specifically their email address and password. After credential verification, the client is authenticated and can access features reserved for them."
    ),
    572: "2. Product Catalog ",
    573: "Allows clients to browse supplies, construction materials, and tools, with direct add-to-cart capabilities.",
    575: "3. Vehicle Reservation Module ",
    576: "Enables vehicle selection, precise choice of pick-up and return dates, and the option with driver.",
    589: "4. Multi-Item Cart and PDF Quotation Generation",
    590: "The shopping cart combines both vehicle rentals and physical goods, calculates statutory taxes, and generates the instantly downloadable pro-forma quote.",
    591: "Figure 25 : Web Interface : Multi-Item Cart ",
    593: "5. Customer Portal and Request Tracking",
    594: "Provides authenticated users with an overview of their pending quotations.",
    596: "Figure 26 : Web Interface : Customer Portal and Request Tracking",
    599: "IV. IMPLEMENTATION OF THE MOBILE RESERVATION APPLICATION",
    600: "The 'SOUTARAH Mobile' application provides a tailored response to mobility by focusing on the vehicle rental service:",
    602: "1. Home Screen and Detailed Vehicle Sheet",
    603: (
        "The home screen displays available vehicles categorized (SUVs, Sedans, Commercials) with dynamic filters, daily rental rates, and high-definition visuals. The detailed vehicle sheet presents vehicle technical specifications (air conditioning, transmission, fuel type), incorporates a calendar selector, and dynamically computes total cost based on destination and driver option."
    ),
    606: "Figure 27 : Mobile Application : Home Screen and Detailed Vehicle Sheet",
    607: "2. Mobile Booking Cart ",
    608: "Allows adjusting rental quantities or durations, providing specific delivery instructions, and confirming requests in real time.",
    611: "V. IMPLEMENTATION OF THE ADMINISTRATOR PORTAL ",
    612: (
        "The Web Back-Office serves as the enterprise control tower. It includes:\n"
        "• Dashboard: performance charts, projected revenue, active quotation counts, and current reservations;\n"
        "• Fleet and Trading Inventory Management: adding new vehicles, products, and updating daily rates;"
    ),
}
