# -*- coding: utf-8 -*-
"""Part 4: Chapter 3 (P[243] to P[369])"""

PART_4 = {
    243: "I. COMPARATIVE STUDY OF ANALYSIS METHODOLOGIES",
    244: (
        "The success of a complex IT project requires a rigorous analysis and modeling phase. Two major methodological approaches were examined: the Cartesian MERISE methodology and the object-oriented UP/UML approach."
    ),
    246: "Overview of the MERISE Methodology",
    247: (
        "MERISE (Method for Information Systems Design and Development for Enterprises) is an information systems analysis and design methodology. It structures system development by separating data and processing."
    ),
    248: (
        "The method relies on different levels of abstraction, notably conceptual, logical, and physical levels, enabling a progressive transition from requirement specification to system implementation."
    ),
    249: (
        "For data modeling, MERISE primarily uses the Conceptual Data Model (CDM), which represents entities, their attributes, and relationships. The CDM can then be transformed into a Logical Data Model (LDM), and subsequently into a Physical Data Model (PDM) to account for specific DBMS characteristics."
    ),
    250: (
        "MERISE also models the processes and treatments necessary for system operations. This approach facilitates information organization and overall understanding of the information system prior to its construction."
    ),
    252: "Overview of the UP/UML Methodology",
    253: (
        "The Unified Process (UP) is an iterative and incremental software engineering process. It organizes project development into multiple phases and enables the system to evolve progressively, from requirements analysis through to deployment."
    ),
    255: (
        "UP is structured around four primary phases: inception, elaboration, construction, and transition. This structure enables better project monitoring, accounts for user feedback, and allows gradual mitigation of risks and errors."
    ),
    256: (
        "UP is supported by UML (Unified Modeling Language), a standardized visual modeling language used to represent different aspects of a software system. UML facilitates the representation of actors, functionalities, processes, interactions, and data structures through various diagrams."
    ),
    258: "Comparative Benchmark : MERISE vs UP/UML",
    261: "Selection of the Analysis Methodology",
    262: (
        "For the execution of our project, we selected UML (Unified Modeling Language) associated with the Unified Process (UP). This choice is justified by the specificities of the project and the necessity of clearly representing the diverse capabilities of the system."
    ),
    263: (
        "Alignment with Web and Mobile Architectures: UML is object-oriented and fits modern software architectures. It facilitates the design of interactions between the frontend, backend, and various system components."
    ),
    264: (
        "Functional Modeling: UML enables the representation of user interactions with the system, as well as application features through multiple complementary diagrams."
    ),
    265: (
        "System Extensibility: Thanks to its object-oriented design, UML facilitates component reusability and scalability. Models can be incrementally enriched as new features are integrated."
    ),
    266: (
        "Thus, choosing UML combined with the Unified Process provides a methodology tailored to our project, facilitating its analysis, design, and long-term evolution."
    ),
    269: "II. APPLICATION OF UP/UML TO THE SOUTARAH GROUP SYSTEM",
    270: (
        "Within the scope of our project, the system incorporates three primary actors:\n"
        "• The Visitor / Customer: browses the catalog, builds a multi-service cart on the Web, makes vehicle reservations on the Mobile application, and downloads PDF quotes;\n"
        "• The Administrator: oversees all operations, manages the fleet, updates pricing, and reviews quotations;\n"
        "• The System / REST API: enforces business rules, verifies availability, and orchestrates notification delivery."
    ),
    272: "1. Use Case Diagrams",
    273: (
        "The overall use case diagram illustrates the interactions of actors across both facets of the platform (Web and Mobile)."
    ),
    274: "Figure 2 : Global Use Case Diagram (Web & Mobile)",
    276: "❖ Textual Description of Use Cases",
    277: "Actor : Visitor",
    278: "Use Case : Browse Site and Services",
    279: "Actors involved : Visitor, Customer",
    280: "Description : Allows exploring Soutarah Group activities and catalogs without an account.",
    281: "Preconditions : Internet connection.",
    282: "Main scenario :",
    283: "The visitor accesses the website.",
    284: "The visitor browses services, product catalogs, and vehicles.",
    285: "Postconditions : Information is displayed.",
    286: "Use Case : Use the AI Assistant",
    287: "Actors involved : Visitor, Customer",
    288: "Description : Allows asking questions and being guided automatically.",
    289: "Preconditions : None.",
    290: "Main scenario :",
    291: "The user opens the chat widget.",
    292: "The user enters a question.",
    293: "The AI responds instantly.",
    294: "Postconditions : The user receives the requested information.",
    295: "Use Case : Register and Log In",
    296: "Actors involved : Visitor, Customer",
    297: "Description : Allows creating an account and accessing the personal customer portal.",
    298: "Preconditions : Have a valid email address.",
    299: "Main scenario :",
    300: "The user enters login credentials.",
    301: "The system verifies and grants access.",
    302: "Postconditions : The user is authenticated as a Customer.",
    304: "Actor : Customer (Web / Mobile)",
    305: "Use Case : Reserve a Vehicle",
    306: "Actors involved : Customer (Mobile / Web)",
    307: "Description : Allows selecting and reserving a vehicle from the fleet of 21 vehicles.",
    308: "Preconditions : The customer must be logged in.",
    309: "Main scenario :",
    310: "The customer selects a vehicle and rental dates.",
    311: "The system checks availability in real time.",
    312: "The customer confirms the reservation.",
    313: "Postconditions : The reservation is recorded pending validation.",
    314: "Use Case : Request a Quotation",
    315: "Actors involved : Customer",
    316: "Description : Allows submitting a detailed price estimate request for a service or product.",
    317: "Preconditions : The customer must be logged in.",
    318: "Main scenario :",
    319: "The customer selects required items and validates the request.",
    320: "The system generates the downloadable pro-forma quotation.",
    321: "Postconditions : The quote request is transmitted to management.",
    322: "Use Case : Pay for an Order",
    323: "Actors involved : Customer",
    324: "Description : Allows settling a deposit or paying for an order online.",
    325: "Preconditions : Have a confirmed reservation or validated cart.",
    326: "Main scenario :",
    327: "The customer chooses the payment method (Mobile Money or Card).",
    328: "The customer completes the transaction.",
    329: "The system confirms payment receipt.",
    330: "Postconditions : The payment is validated and a receipt is issued.",
    332: "Actor : Administrator",
    333: "Use Case : View the Dashboard",
    334: "Actors involved : Administrator",
    335: "Description : Allows monitoring key indicators (turnover, reservations, activities).",
    336: "Preconditions : The administrator must be authenticated.",
    337: "Main scenario :",
    338: "The administrator accesses the back-office.",
    339: (
        "The system displays statistics and KPIs.\n"
        "• Postconditions : The administrator views the overall state of the platform."
    ),
    340: "Use Case : Manage Vehicles",
    341: "Actors involved : Administrator",
    342: "Description : Allows adding, updating, and tracking the status of the 21-vehicle fleet.",
    343: "Preconditions : The administrator must be authenticated.",
    344: "Main scenario :",
    345: "The administrator navigates to the vehicle fleet list.",
    346: "The administrator updates availability, rates, or mechanical status.",
    347: "Postconditions : Fleet details are refreshed on web and mobile platforms.",
    348: "Use Case : Receive Quotations and Mark as Read",
    349: "Actors involved : Administrator",
    350: "Description : Allows viewing received quotation requests and confirming their processing.",
    351: "Preconditions : The administrator must be authenticated.",
    352: "Main scenario :",
    353: "The administrator opens the quotation request list.",
    354: "The administrator inspects quote contents.",
    355: "The administrator clicks \"Mark as read\".",
    356: "Postconditions : The quote status changes to \"Read / In Progress\".",
    361: "2. Activity Diagrams",
    363: "2.1. Activity Diagram : Customer Account Creation and Management",
    364: (
        "The following activity diagram details the vehicle reservation process flow, highlighting algorithmic anti-collision date controls."
    ),
    366: "Figure 3 : Activity Diagram : Customer Account Creation and Management",
    368: "2.2. Activity Diagram : Vehicle Reservation",
    369: (
        "The Vehicle Reservation activity diagram illustrates the process through which a customer rents a vehicle on the SOUTARAH platform. The process begins when the customer selects a vehicle and specifies rental dates. The system then verifies availability: if unavailable, the customer is notified and can modify dates or choose another vehicle. If available, the vehicle is added to the cart. When the customer checks out the cart, the system automatically generates the quotation and redirects to the order page. The customer then selects a payment method (online via Card/Mobile Money or cash upon delivery) and confirms the order. The system automatically validates the quotation, records the reservation in the database, and transmits the order to the administrator. The latter does not need to approve the quote manually: they receive the notification, review order details, and simply mark the quote as read to prepare the vehicle. Finally, the customer receives booking confirmation. This diagram thus highlights the nominal order flow and simplified processing on the administrative side."
    ),
}
