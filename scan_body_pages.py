import os
import win32com.client

word = win32com.client.Dispatch('Word.Application')
word.Visible = False

doc_path = os.path.abspath('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')
doc = word.Documents.Open(doc_path)

body_items = []

for p_idx, p in enumerate(doc.Paragraphs):
    # Only body paragraphs between index 90 and 709
    if 90 <= p_idx < 709:
        txt = p.Range.Text.strip()
        if not txt:
            continue
        page = p.Range.Information(3)
        body_items.append((p_idx, page, txt))

doc.Close(False)
word.Quit()

with open('body_paragraphs_pages.txt', 'w', encoding='utf-8') as f:
    for idx, page, txt in body_items:
        # Filter for headings, figures, tables
        is_fig = txt.startswith("Figure ") or txt.startswith("FIGURE ")
        is_tab = txt.startswith("Tableau ") or txt.startswith("TABLEAU ")
        is_heading = any(txt.startswith(prefix) for prefix in [
            "PARTIE ", "Chapitre ", "I. ", "II. ", "III. ", "IV. ", "V. ",
            "1. ", "2. ", "3. ", "4. ", "❖", "2.1", "2.2", "2.3", "3.1", "3.2", "3.3", "3.4",
            "CONCLUSION ", "BIBLIOGRAPHIE", "WEBOGRAPHIE"
        ])
        if is_fig or is_tab or is_heading:
            f.write(f"P_IDX {idx:3d} | Page {page:2d} | {txt[:100]}\n")

print("Body paragraphs scanned!")
