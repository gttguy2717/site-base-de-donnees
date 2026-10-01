from pypdf import PdfReader

reader = PdfReader('temp_rapport_pages.pdf')

with open('inspect_pages_40_to_61.txt', 'w', encoding='utf-8') as f:
    for p_no in range(37, len(reader.pages) + 1):
        txt = reader.pages[p_no - 1].extract_text() or ""
        f.write(f"\n==================== PAGE {p_no} ====================\n")
        f.write(txt)

print("Pages 37 to 61 extracted!")
