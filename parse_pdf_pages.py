from pypdf import PdfReader
import re

reader = PdfReader('temp_rapport_pages.pdf')
num_pages = len(reader.pages)
print(f"Total PDF pages: {num_pages}")

# Figures, Tables, Headings to match
figures_to_find = [
    (1, "Figure 1 : Diagramme de GANTT"),
    (2, "Figure 2 : Diagramme global des cas"),
    (3, "Figure 3 : Diagramme d’activité"),
    (4, "Figure 4 : Diagramme d’activité"),
    (5, "Figure 5 : Diagramme d’activité"),
    (6, "Figure 6 : Diagramme de séquence"),
    (7, "Figure 7 : Diagramme de séquence"),
    (8, "Figure 8 : Diagramme de séquence"),
    (9, "Figure 9 : Diagramme de séquence"),
    (10, "Figure 10 : Diagramme des classes"),
    (11, "Figure 11 : Logo de l’éditeur"),
    (12, "Figure 12 : Logo de l’outil"),
    (13, "Figure 13 : Logo du Framework Frontend"),
    (14, "Figure 14 : Logo du Framework Mobile"),
    (15, "Figure 15 : Logo de la technologie"),
    (16, "Figure 16 : Logo de la plateforme"),
    (17, "Figure 17 : Logo de la plateforme"),
    (18, "Figure 18 : Schéma de l'architecture"),
    (19, "Figure 19 : Structure et schéma"),
    (20, "Figure 20 : Interface Web : Page d'accueil"),
    (21, "Figure 21 : Interface Web : Page connexion"),
    (22, "Figure 22 : Interface Web : Catalogue"),
    (23, "Figure 23 : Interface Web : Module"),
    (24, "Figure 24 : Interface Web : Panier"),
    (25, "Figure 25 : Interface Web : Espace client"),
    (26, "Figure 26 : Application Mobile : Écran"),
    (27, "Figure 27 : Application Mobile : Panier"),
    (28, "Figure 28 : Interface d’administration : Tableau"),
    (29, "Figure 29 : Interface d’administration : Gestion")
]

tables_to_find = [
    (1, "Tableau 1"),
    (2, "Tableau 2"),
    (3, "Tableau 3"),
    (4, "Tableau 4"),
    (5, "Tableau 5")
]

# We extract text from each page
pages_text = {}
for p_idx, page in enumerate(reader.pages):
    txt = page.extract_text() or ""
    pages_text[p_idx + 1] = txt

with open("pdf_page_matches.txt", "w", encoding="utf-8") as f:
    f.write(f"Total pages: {num_pages}\n\n")
    
    # We inspect body pages (pages >= 11 to 58)
    f.write("=== FIGURES MATCHES IN PDF ===\n")
    for f_num, f_pattern in figures_to_find:
        found_pages = []
        for p_no in range(11, num_pages - 2): # exclude first pages and end TOC
            txt = pages_text[p_no]
            # search for f"Figure {f_num}" in uppercase or lowercase
            matches = re.findall(rf"Figure\s+{f_num}\b.*", txt, re.IGNORECASE)
            if matches:
                found_pages.append((p_no, matches[0]))
        f.write(f"Figure {f_num} -> {found_pages}\n")

    f.write("\n=== TABLES MATCHES IN PDF ===\n")
    for t_num, t_pattern in tables_to_find:
        found_pages = []
        for p_no in range(11, num_pages - 2):
            txt = pages_text[p_no]
            matches = re.findall(rf"Tableau\s+{t_num}\b.*", txt, re.IGNORECASE)
            if matches:
                found_pages.append((p_no, matches[0]))
        f.write(f"Tableau {t_num} -> {found_pages}\n")

print("PDF matching done!")
