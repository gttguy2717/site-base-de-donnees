import win32com.client
import os
import shutil

word = win32com.client.Dispatch('Word.Application')
word.Visible = False

# Export FR to PDF
fr_pdf = os.path.abspath('fr_master.pdf')
doc_fr = word.Documents.Open(os.path.abspath('Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx'))
doc_fr.SaveAs2(fr_pdf, FileFormat=17) # 17 = wdFormatPDF
doc_fr.Close(False)

# Export current EN to PDF
en_pdf = os.path.abspath('en_current.pdf')
doc_en = word.Documents.Open(os.path.abspath('Rapport_de_Stage_ENGLISH.docx'))
doc_en.SaveAs2(en_pdf, FileFormat=17)
doc_en.Close(False)

word.Quit()
print("Exported both to PDF successfully!")
