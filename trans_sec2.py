# -*- coding: utf-8 -*-
"""
Translations for Section 2: Part II (Paragraphs 223 to 398)
Comparative study MERISE vs UP/UML, Use cases, Textual scenarios,
Activity diagrams, Sequence diagrams, and Class diagram.
"""

SEC2_TRANS = {
    223: "PART II",
    224: "CONCEPTUAL STUDY",
    243: "I. COMPARATIVE STUDY OF ANALYSIS METHODOLOGIES",
    244: ("The success of a complex software engineering project demands a rigorous analysis and modeling phase. "
          "Two primary methodological approaches were examined: the Cartesian MERISE method and the object-oriented UP/UML approach."),
    246: "II. APPLICATION OF UP/UML TO THE SOUTARAH GROUP SYSTEM",
    247: ("Within the framework of our project, the system incorporates three principal actors:\n"
          "• The Visitor / Client: browses the product catalog, composes multi-service shopping carts on the Web, executes vehicle reservations on the Mobile application, and downloads official PDF quotes;\n"
          "• The Administrator: oversees all commercial operations, manages the fleet, updates tariffs, and validates customer quotations;\n"
          "• The System / REST API: enforces business rules, performs algorithmic conflict-free date verification, and orchestrates notification delivery."),
    249: "1. Use Case Diagrams",
    250: "The global use case diagram illustrates the interactions of actors across both facets of the platform (Web and Mobile).",
    251: "Figure 2 : Global Use Case Diagram (Web & Mobile)",
    253: "❖ Textual Description of the Diagram",
    254: "Actor: Visitor",
    255: "Use Case: Browse website and discover services",
    256: "Actors involved: Visitor, Client",
    257: "Description: Allows users to discover Soutarah Group's activities and catalogs without an account.",
    258: "Preconditions: Internet connectivity.",
    259: "Main scenario:",
    260: "The visitor navigates to the website.",
    261: "The visitor browses services, product catalogs, and the vehicle fleet.",
    262: "Postconditions: Information is interactively displayed.",
    263: "Use Case: Use the interactive AI Assistant",
    264: "Actors involved: Visitor, Client",
    265: "Description: Allows visitors to ask questions and receive instant automated guidance.",
    266: "Preconditions: None.",
    267: "Main scenario:",
    268: "The user opens the assistant chat interface.",
    269: "The user submits their inquiry.",
    270: "The AI assistant responds instantaneously.",
    271: "Postconditions: The user receives the requested guidance.",
    272: "Use Case: Register and Sign In",
    273: "Actors involved: Visitor, Client",
    274: "Description: Allows visitors to register an account and access their personal portal.",
    275: "Preconditions: Possess a valid email address.",
    276: "Main scenario:",
    277: "The user inputs their authentication credentials.",
    278: "The system validates the credentials and authorizes access.",
    279: "Postconditions: The user is authenticated with Client privileges.",
    281: "Actor: Client (Web / Mobile)",
    282: "Use Case: Reserve a vehicle",
    283: "Actors involved: Client (Mobile / Web)",
    284: "Description: Allows clients to select and reserve a vehicle from the fleet of 21 vehicles.",
    285: "Preconditions: The client must be authenticated.",
    286: "Main scenario:",
    287: "The client selects a vehicle and specifies rental dates.",
    288: "The system performs real-time calendar availability verification.",
    289: "The client confirms the reservation.",
    290: "Postconditions: The reservation is registered with pending validation status.",
    291: "Use Case: Request a quotation",
    292: "Actors involved: Client",
    293: "Description: Allows clients to submit a formal quote request for products or services.",
    294: "Preconditions: The client must be authenticated.",
    295: "Main scenario:",
    296: "The client selects items/services and submits the request.",
    297: "The system generates an official downloadable pro-forma PDF quote.",
    298: "Postconditions: The quote request is transmitted to the administration dashboard.",
    299: "Use Case: Pay for an order",
    300: "Actors involved: Client",
    301: "Description: Allows clients to settle a deposit or full payment online.",
    302: "Preconditions: Have a confirmed reservation or validated shopping cart.",
    303: "Main scenario:",
    304: "The client selects their preferred payment method (Mobile Money or Credit Card).",
    305: "The client processes the financial transaction.",
    306: "The system confirms payment receipt.",
    307: "Postconditions: The payment is confirmed and an electronic receipt is generated.",
    309: "Actor: Administrator",
    310: "Use Case: Consult administrative dashboard",
    311: "Actors involved: Administrator",
    312: "Description: Enables monitoring of key business indicators (turnover, active reservations, activities).",
    313: "Preconditions: The administrator must be authenticated.",
    314: "Main scenario:",
    315: "The administrator accesses the back-office.",
    316: "The system renders real-time statistics and operational KPIs.\n• Postconditions: The administrator visualizes overall platform performance.",
    317: "Use Case: Manage fleet vehicles",
    318: "Actors involved: Administrator",
    319: "Description: Allows adding, editing, and monitoring the status of the 21-vehicle fleet.",
    320: "Preconditions: The administrator must be authenticated.",
    321: "Main scenario:",
    322: "The administrator navigates to the vehicle fleet management interface.",
    323: "The administrator updates availability, pricing tiers, or technical maintenance status.",
    324: "Postconditions: Fleet information is instantly updated across web and mobile platforms.",
    325: "Use Case: Receive quotations and mark as read",
    326: "Actors involved: Administrator",
    327: "Description: Allows reviewing incoming quotations and acknowledging operational processing.",
    328: "Preconditions: The administrator must be authenticated.",
    329: "Main scenario:",
    330: "The administrator opens the list of quotation requests.",
    331: "The administrator reviews quote line items and customer details.",
    332: "The administrator clicks \"Mark as read\".",
    333: "Postconditions: The quote status transitions to \"Read / In Progress\".",
    336: "2. Activity Diagrams",
    338: "2.1. Activity Diagram: Customer Account Creation and Management",
    339: "The following activity diagram outlines the vehicle reservation dynamics, highlighting algorithmic date anticollision verification.",
    341: "Figure 3 : Activity Diagram : Customer Account Creation and Management",
    345: "2.2. Activity Diagram: Vehicle Reservation",
    346: ("The Vehicle Reservation activity diagram illustrates the process by which a client rents a vehicle on the SOUTARAH platform. "
          "The process begins when the client chooses a vehicle and inputs their rental dates. The system then performs automated availability verification: "
          "if the vehicle is booked, the client is promptly notified to adjust dates or choose an alternate vehicle. If available, the vehicle is added to the cart. "
          "When the client validates their cart, the system automatically generates the pro-forma quote and directs them to the order confirmation page. "
          "The client chooses their payment method (online via Card/Mobile Money or cash upon delivery) and confirms the order. "
          "The system automatically validates the quotation, stores the reservation in the database, and dispatches the order notification to the administrator. "
          "The administrator no longer needs to manually approve quotes: they review order details and mark the quote as read to dispatch vehicle preparation. "
          "Finally, the client receives their official booking confirmation. This diagram highlights the streamlined checkout flow and simplified administrative handling."),
    351: "Figure 4 : Activity Diagram : Vehicle Reservation",
    358: "2.3. Activity Diagram: Product Purchase",
    359: ("The Product Purchase activity diagram illustrates the process through which a client purchases supplies from the SOUTARAH trading catalog. "
          "The process begins when the client browses the catalog, selects items, and adds them to their shopping cart. "
          "The system dynamically computes and displays detailed price breakdowns (Net price, 18% VAT, and Total Gross amount). "
          "Upon cart validation, the system generates the timestamped official quotation and presents available settlement options. "
          "The client selects their payment method (online or cash on delivery) and finalizes the order. "
          "The system records the transaction in the database, automatically validates the quotation, and alerts the administrator. "
          "The administrator reviews order items on their dashboard and marks the quote as read to initiate warehouse packaging and dispatch. "
          "Finally, the client receives their order confirmation email. This diagram underscores transparent price computation and efficient ordering."),
    364: "Figure 5 : Activity Diagram : Product Purchase",
    367: "3. Sequence Diagrams",
    369: "3.1. Sequence Diagram: Secure Online Payment",
    370: ("This sequence diagram details an electronic financial transaction processed via the Genius Pay gateway (integrating bank cards and local Mobile Money solutions). "
          "Upon cart validation, the API server initializes a secure payment session and redirects the client to the external hosted payment interface. "
          "Following authorization and account debit, the payment gateway notifies the API server via an encrypted webhook to update the order status to 'Paid' in the database. "
          "The Brevo transactional service immediately dispatches an electronic payment receipt to the client, while the web frontend renders the payment success screen."),
    371: "Figure 6 : Sequence Diagram : Secure Online Payment",
    374: "3.2. Sequence Diagram: Vehicle Reservation",
    375: ("This sequence diagram illustrates the end-to-end execution flow of a vehicle reservation on the platform. When the client selects a vehicle and rental duration, "
          "the frontend queries the API server to verify schedule availability in the database. Once availability is confirmed and the client submits the order, "
          "the API stores the reservation record and associated quotation, then invokes Brevo to instantly send confirmation emails to both client and administrator. "
          "Within the management portal, the administrator accesses the order details and marks the quotation as read, initiating operational vehicle preparation."),
    376: "Figure 7 : Sequence Diagram : Vehicle Reservation",
    379: "3.3. Sequence Diagram: Product Purchase",
    380: ("The Product Purchase sequence diagram describes the acquisition flow for goods selected from the trading catalog. Upon order submission, "
          "data is transmitted to the API server, which logs the transaction in the database and automatically marks the quotation as validated. "
          "Brevo is invoked to send a purchase summary to the client and alert the administrator of the new order. "
          "The administrator consults item specifications on their dashboard and marks the quotation as read to coordinate parcel packaging and delivery."),
    381: "Figure 8 : Sequence Diagram : Product Purchase",
    383: "3.4. Sequence Diagram: User Registration",
    384: ("This sequence diagram describes the registration workflow for a new user on the SOUTARAH platform. The visitor enters their details "
          "(individual or corporate entity) via the web form. These parameters are sent to the API server, which validates the uniqueness of the email and phone number "
          "against the database. Following successful validation, the server encrypts the password using Bcrypt hashing and writes the user and client records to the database. "
          "The API server then triggers Brevo to dispatch a welcome email to the visitor, while the web interface displays account creation confirmation and redirects to login."),
    385: "Figure 9 : Sequence Diagram : User Registration",
    387: "4. Class Diagram",
    388: ("The class diagram represents the static structural architecture of the system by detailing domain classes, their attributes, methods, and relationships. "
          "It is established following an in-depth analysis of system requirements and domain entities, serving as the foundational blueprint for database schema and backend implementation.")
}
