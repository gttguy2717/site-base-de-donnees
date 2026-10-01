import docx
import sys
sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')
tb_list = doc.element.xpath('.//*[local-name()="txbxContent"]')
for tb_idx in [0, 2, 6, 14, 38, 56]:
    tb = tb_list[tb_idx]
    print(f"=== TB[{tb_idx}] ===")
    for p in tb.xpath('.//*[local-name()="p"]'):
        t_nodes = p.xpath('.//*[local-name()="t"]')
        print("  P text:", repr(''.join(t.text for t in t_nodes if t.text)))
        for t in t_nodes:
            print("    t:", repr(t.text))
