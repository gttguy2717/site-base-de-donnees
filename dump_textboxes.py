import docx
import sys
sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')
tb_list = doc.element.xpath('.//*[local-name()="txbxContent"]')
print(f"Total textboxes: {len(tb_list)}")
for idx, tb in enumerate(tb_list):
    t_nodes = tb.xpath('.//*[local-name()="t"]')
    text = ''.join(t.text for t in t_nodes if t.text).strip()
    if text:
        print(f"TB[{idx}]: {repr(text)}")
