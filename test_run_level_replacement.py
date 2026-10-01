from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

doc = Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

def set_run_text_with_breaks(run, text):
    """
    Sets run text, converting any \\n into proper <w:br/> OpenXML elements.
    """
    run.text = ''
    r_elem = run._r
    # Remove any existing w:t and w:br in this run
    for child in list(r_elem):
        if child.tag in (qn('w:t'), qn('w:br')):
            r_elem.remove(child)
            
    lines = text.split('\n')
    for idx, line in enumerate(lines):
        if idx > 0:
            r_elem.append(OxmlElement('w:br'))
        if line:
            t = OxmlElement('w:t')
            t.text = line
            t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
            r_elem.append(t)

# Test on P[141] (S - Solution perenne)
p141 = doc.paragraphs[141]
print("Before P[141]:", [r.text for r in p141.runs])
p141.runs[0].text = "S — Sustainable and innovative solution"
set_run_text_with_breaks(p141.runs[1], "\nThe company prioritizes the implementation of sustainable and innovative solutions to effectively respond to the needs of its clients.")
print("After P[141] runs:", [r.text for r in p141.runs])
print("After P[141] xml has w:br:", len(p141._element.findall('.//' + qn('w:br'))))
