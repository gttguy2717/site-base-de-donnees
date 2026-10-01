import re, sys, docx
sys.stdout.reconfigure(encoding='utf-8')
DOCX = r'c:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\site-soutarah\Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx'
d = docx.Document(DOCX)
paras = [p.text for p in d.paragraphs]
for tb in d.tables:
    for r in tb.rows:
        for c in r.cells:
            paras.append(c.text)
full = '\n'.join(paras)

checks = {
    'Aout sans circonflexe': r'Aout',
    'Etude sans accent': r'\bEtude\b',
    'SOUTA-RAH': r'SOUTA-\s*\n?\s*RAH',
    're-servations': r'r\u00e9-\s*\n?\s*servation',
    'exploita-tion': r'exploita-\s*\n?\s*tion',
    'Consulté LE': r'Consult\u00e9 LE',
    'Consulté en': r'Consult\u00e9 en',
    'SORHO YETIENA / Yetiena SORHO': r'(SORHO YETIENA|Yetiena SORHO)',
    'SORHO SANABA / Sanaba COULIBALY': r'(SORHO SANABA|Sanaba COULIBALY)',
    'MyQL': r'MyQL',
    'Todo/placeholder': r'(TODO|FIXME|XXX[a-z]?|Lorem|\?\?\?)',
    'double 6.': r'6\.\s*Technologies de paiement',
    'a engager': r'\u00e0 engager',
    'MySpace double': r'\s{3,}[A-Z\u00c0-\u00ff]',
}
for name, pat in checks.items():
    ms = re.findall(pat, full)
    print('%-32s -> %d  %s' % (name, len(ms), ms[:4]))

print()
print('--- occurrences with context ---')
for pat in [r'SOUTA-\s*\n?\s*RAH', r'r\u00e9-\s*\n?\s*servation', r'exploita-\s*\n?\s*tion', r'\bpropos\u00e9es3\.', r'Domaines d.activit\u00e9s']:
    for m in re.finditer(pat, full):
        print(repr(full[max(0, m.start() - 90):m.end() + 90]))
        print('---')