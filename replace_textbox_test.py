import sys
from docx import Document

doc = Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

textbox_translations = [
    ("CHAPITRE 1", "CHAPTER 1 : OVERVIEW OF THE HOST ORGANIZATION"),
    ("CHAPITRE 2", "CHAPTER 2 : PROJECT OVERVIEW"),
    ("Tableau 1", "Table 1 : Forecast Planning and Chronogram of Project Tasks"),
    ("CHAPITRE 3", "CHAPTER 3 : CHOICE OF ANALYSIS METHODOLOGY"),
    ("Tableau 2", "Table 2 : Comparative Study between MERISE and UP/UML Methodologies"),
    ("Figure 6", "Figure 6 : Sequence Diagram : Secure Online Payment"),
    ("Figure 10", "Figure 10 : System Class Diagram"),
    ("CHAPITRE 4", "CHAPTER 4 : SYSTEM DESIGN AND TECHNOLOGICAL CHOICES"),
    ("Figure 11", "Figure 11 : Visual Studio Code Editor Logo"),
    ("Figure 12", "Figure 12 : Figma UI/UX Design Tool Logo"),
    ("Figure 1 3", "Figure 13 : React.js Frontend Framework Logo"),
    ("Figure 13", "Figure 13 : React.js Frontend Framework Logo"),
    ("Figure 1 4", "Figure 14 : React Native & Expo Mobile Framework Logo"),
    ("Figure 14", "Figure 14 : React Native & Expo Mobile Framework Logo"),
    ("Figure 1 5", "Figure 15 : Node.js & Express Server Technology Logo"),
    ("Figure 15", "Figure 15 : Node.js & Express Server Technology Logo"),
    ("Figure 1 6", "Figure 16 : Brevo Transactional Email Platform Logo"),
    ("Figure 16", "Figure 16 : Brevo Transactional Email Platform Logo"),
    ("Pour sécuriser les transactions", (
        "To secure financial transactions, Genius Pay was selected. It allows automating "
        "the settlement of reservations and orders by integrating bank cards and Mobile Money. "
        "Its integration via API and Webhook ensures instant, reliable and secure payments "
        "across web and mobile applications."
    )),
    ("Figure 1 7", "Figure 17 : Genius Pay Transactional Platform Logo"),
    ("Figure 17", "Figure 17 : Genius Pay Transactional Platform Logo"),
    ("Figure 1 8", "Figure 18 : Hostinger Hosting Platform Logo"),
    ("Figure 18", "Figure 18 : Hostinger Hosting Platform Logo"),
    ("Tableau 3", "Table 3 : Comparative Analysis of Database Management Systems (DBMS)"),
    ("CHAPITRE 5", "CHAPTER 5 : DEVELOPMENT OF THE PLATFORM AND MOBILE APPLICATION"),
    ("Figure  20", "Figure 20 : Structure and Relational Schema of MySQL Database"),
    ("Figure 20", "Figure 20 : Structure and Relational Schema of MySQL Database"),
    ("Figure 2 1", "Figure 21 : Web Interface : Home Page"),
    ("Figure 21", "Figure 21 : Web Interface : Home Page"),
    ("Figure 2 2", "Figure 22 : Web Interface : Login Page and Authentication Form"),
    ("Figure 22", "Figure 22 : Web Interface : Login Page and Authentication Form"),
    ("Figure 2 3", "Figure 23 : Web Interface : Product Catalog"),
    ("Figure 23", "Figure 23 : Web Interface : Product Catalog"),
    ("Figure 2 4", "Figure 24 : Web Interface : Vehicle Reservation Module"),
    ("Figure 24", "Figure 24 : Web Interface : Vehicle Reservation Module"),
    ("Figure 2 8", "Figure 28 : Mobile Application : Mobile Booking Cart"),
    ("Figure 28", "Figure 28 : Mobile Application : Mobile Booking Cart"),
    ("Figure 2 9", "Figure 29 : Administration Interface : Dashboard"),
    ("Figure 29", "Figure 29 : Administration Interface : Dashboard"),
    ("Figure  30", "Figure 30 : Administration Interface : Fleet and Reservation Management"),
    ("Figure 30", "Figure 30 : Administration Interface : Fleet and Reservation Management"),
    ("CHAPITRE 6", "CHAPTER 6 : IMPLEMENTATION"),
    ("Tableau 4", "Table 4 : Test Acceptance Book and Functional Validation (Web & Mobile)"),
    ("Tableau 5", "Table 5 : Estimated Financial Summary of Infrastructure and Annual Maintenance Costs"),
]

def translate_txbx_element(tb):
    t_nodes = tb.xpath('.//*[local-name()="t"]')
    if not t_nodes:
        return
    full_text = ' '.join([t.text for t in t_nodes if t.text]).strip()
    for pat, rep in textbox_translations:
        if pat.lower() in full_text.lower():
            # replace in the first text node, empty the rest
            t_nodes[0].text = rep
            for t in t_nodes[1:]:
                t.text = ''
            return True
    return False

txbx_elements = doc._element.xpath('.//*[local-name()="txbxContent"]')
count = 0
for tb in txbx_elements:
    if translate_txbx_element(tb):
        count += 1
print(f"Translated {count} / {len(txbx_elements)} textboxes.")
