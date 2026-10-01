import docx
doc = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')
p = doc.paragraphs[612]
print('Text:', repr(p.text))
for i, r in enumerate(p.runs):
    has_d = len(r._r.xpath('.//*[local-name()="drawing"]')) > 0
    has_p = len(r._r.xpath('.//*[local-name()="pict"]')) > 0
    print(f'Run {i}: text={repr(r.text)} has_d={has_d} has_p={has_p}')
