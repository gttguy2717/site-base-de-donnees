import docx
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

def get_line_chunks(p_element):
    """
    Traverse descendants of p_element in document order.
    When a <w:br/> is encountered, that ends the current line.
    Return list of lists of safe <w:t> elements for each non-empty text line.
    """
    lines = []
    current_line = []
    
    # Iterate all elements under p_element
    for el in p_element.iter():
        tag = el.tag.split('}')[-1]
        if tag in ('drawing', 'pict', 'txbxContent'):
            continue
        if tag == 'br':
            if current_line:
                lines.append(current_line)
                current_line = []
        elif tag == 't':
            # Check if inside drawing/pict
            ancestors = [a.tag.split('}')[-1] for a in el.iterancestors()]
            if not any(a in ('drawing', 'pict', 'txbxContent') for a in ancestors):
                if el.text and el.text.strip():
                    current_line.append(el)
    if current_line:
        lines.append(current_line)
    return lines

for idx in [2, 139, 140, 141, 198, 201, 270, 658]:
    chunks = get_line_chunks(doc.paragraphs[idx]._element)
    print(f"P[{idx}]: found {len(chunks)} text lines between <w:br> elements.")
    for l_idx, chunk in enumerate(chunks):
        t_texts = [t.text for t in chunk]
        print(f"   Line {l_idx}: {''.join(t_texts)[:40]}")
