import docx
from trans_tables import TABLES_TRANS

doc = docx.Document('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx')

print(f"Doc tables count: {len(doc.tables)}, Trans tables count: {len(TABLES_TRANS)}")

for t_idx, table in enumerate(doc.tables):
    trans_table = TABLES_TRANS[t_idx]
    doc_rows = len(table.rows)
    trans_rows = len(trans_table)
    print(f"Table {t_idx+1}: Doc rows={doc_rows}, Trans rows={trans_rows}")
    assert doc_rows == trans_rows, f"Row count mismatch in table {t_idx+1}: {doc_rows} vs {trans_rows}"
    for r_idx, row in enumerate(table.rows):
        doc_cols = len(row.cells)
        trans_cols = len(trans_table[r_idx])
        assert doc_cols == trans_cols, f"Col count mismatch in table {t_idx+1} row {r_idx}: {doc_cols} vs {trans_cols}"

print("All 6 tables match dimensions 100%!")
