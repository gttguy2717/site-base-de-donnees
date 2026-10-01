import docx
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')
tb_list = doc.element.xpath('.//*[local-name()="txbxContent"]')
print(f"Total textboxes: {len(tb_list)}")

for idx, tb in enumerate(tb_list):
    paras = tb.xpath('.//*[local-name()="p"]')
    print(f"TB[{idx}] ({len(paras)} paras):")
    for p_idx, p in enumerate(paras):
        t_nodes = p.xpath('.//*[local-name()="t"]')
        p_text = ''.join(t.text for t in t_nodes if t.text).strip()
        if p_text:
            print(f"  P[{p_idx}]: {repr(p_text)}")
