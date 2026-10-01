import re, zipfile, sys
sys.stdout.reconfigure(encoding='utf-8')
DOCX = r'c:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\site-soutarah\Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx'
z = zipfile.ZipFile(DOCX)
xml = z.read('word/document.xml').decode('utf8')
# strip tags to get all text incl. textboxes
texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', xml, re.S)
alltext = '\n'.join(texts)
caps = re.findall(r'Figure\s*(\d+)\s*:\s*([^\n]{0,90})', alltext)
print('--- ALL Figure captions in document order (incl. textboxes) ---')
for i, (n, t) in enumerate(caps, 1):
    print(i, '| Figure', n, '|', t.strip())
print()
print('--- suspicious tokens ---')
for pat in ['MyQL', 'SOUTA-RAH', r'r\u00e9-servation', 'exploita-tion', 'TODO', 'Lorem', 'XXX', '\ufffd']:
    for m in re.finditer(pat, alltext):
        print(pat, '->', alltext[max(0,m.start()-60):m.start()+60].replace('\n', ' | '))