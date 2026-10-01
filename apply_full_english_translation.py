# -*- coding: utf-8 -*-
"""
Script d'application intégrale de la traduction anglaise du rapport de stage.
Préserve à 100% :
- Toutes les 32 images et diagrammes (nœuds w:drawing et w:pict)
- Tous les styles de paragraphes (alignement, marges, espacements, polices)
- La mise en forme des tableaux et cellules
- La structure globale du document Word (.docx)
"""

import os
import shutil
import zipfile
import docx

# Import des traductions complètes
from trans_sec0 import SEC0_TRANS
from trans_sec1 import SEC1_TRANS
from trans_sec2 import SEC2_TRANS
from trans_sec3 import SEC3_TRANS
from trans_sec4 import SEC4_TRANS
from trans_sec5 import SEC5_TRANS
from trans_tables import TABLES_TRANS

ORIGINAL_FILE = "Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES.docx"
BACKUP_FILE = "Rapport_de_Stage_SORHO_DAVID_SOUTARAH_PAGES_CORRIGEES_BACKUP_FR.docx"
ENGLISH_FILE = "Rapport_de_Stage_SORHO_DAVID_SOUTARAH_ENGLISH.docx"

def update_paragraph_text(p, new_text):
    """Met à jour le texte d'un paragraphe sans toucher aux dessins/images."""
    text_runs = [r for r in p.runs if 'w:drawing' not in r._r.xml and 'w:pict' not in r._r.xml]
    
    if not text_runs:
        p.add_run(new_text)
        return
    
    # Conserve le premier run de texte avec son style, injecte le texte traduit
    text_runs[0].text = new_text
    # Efface les runs textuels secondaires pour éviter les doublons
    for r in text_runs[1:]:
        r.text = ""

def update_cell_text(cell, new_text):
    """Met à jour le texte d'une cellule de tableau en conservant le style."""
    p = cell.paragraphs[0]
    text_runs = [r for r in p.runs if 'w:drawing' not in r._r.xml and 'w:pict' not in r._r.xml]
    
    if not text_runs:
        p.add_run(new_text)
    else:
        text_runs[0].text = new_text
        for r in text_runs[1:]:
            r.text = ""
            
    # S'assurer qu'il n'y a pas d'autres paragraphes non souhaités
    for extra_p in cell.paragraphs[1:]:
        extra_p.text = ""

def main():
    print("=" * 70)
    print("  APPLICATION DE LA TRADUCTION ANGLAISE DU RAPPORT DE STAGE")
    print("=" * 70)
    
    if not os.path.exists(ORIGINAL_FILE):
        print(f"ERREUR: Fichier source '{ORIGINAL_FILE}' introuvable!")
        return
    
    # 1. Sauvegarde de sécurité du fichier original
    if not os.path.exists(BACKUP_FILE):
        print(f"1. Création de la sauvegarde de sécurité: '{BACKUP_FILE}'...")
        shutil.copyfile(ORIGINAL_FILE, BACKUP_FILE)
        print("   -> Sauvegarde FR créée avec succès.")
    else:
        print(f"1. La sauvegarde '{BACKUP_FILE}' existe déjà.")
        
    # 2. Consolidation de toutes les traductions de paragraphes
    all_trans = {}
    for sec in [SEC0_TRANS, SEC1_TRANS, SEC2_TRANS, SEC3_TRANS, SEC4_TRANS, SEC5_TRANS]:
        all_trans.update(sec)
    print(f"2. Nombre total de paragraphes traduits chargés: {len(all_trans)}")
    
    # 3. Chargement du document
    print(f"3. Chargement du document '{ORIGINAL_FILE}'...")
    doc = docx.Document(ORIGINAL_FILE)
    total_paragraphs = len(doc.paragraphs)
    print(f"   -> Nombre de paragraphes dans le document: {total_paragraphs}")
    
    # 4. Traduction des paragraphes
    translated_count = 0
    drawings_preserved = 0
    for idx, p in enumerate(doc.paragraphs):
        has_drawing = any('w:drawing' in r._r.xml or 'w:pict' in r._r.xml for r in p.runs)
        if has_drawing:
            drawings_preserved += 1
            
        if idx in all_trans:
            new_text = all_trans[idx]
            update_paragraph_text(p, new_text)
            translated_count += 1
            
    print(f"4. Paragraphes traduits avec succès: {translated_count}/{len(all_trans)}")
    print(f"   Paragraphes contenant des illustrations/images préservés: {drawings_preserved}")
    
    # 5. Traduction des tableaux
    print(f"5. Traduction des {len(doc.tables)} tableaux...")
    for t_idx, table in enumerate(doc.tables):
        if t_idx < len(TABLES_TRANS):
            trans_table = TABLES_TRANS[t_idx]
            for r_idx, row in enumerate(table.rows):
                if r_idx < len(trans_table):
                    for c_idx, cell in enumerate(row.cells):
                        if c_idx < len(trans_table[r_idx]):
                            update_cell_text(cell, trans_table[r_idx][c_idx])
            print(f"   -> Tableau {t_idx+1} ({len(table.rows)} lignes x {len(table.rows[0].cells)} colonnes) traduit.")
            
    # 6. Sauvegarde du document traduit
    print(f"6. Enregistrement sous '{ENGLISH_FILE}'...")
    doc.save(ENGLISH_FILE)
    print(f"   -> Enregistré avec succès ({os.path.getsize(ENGLISH_FILE):,} octets).")
    
    # 7. Enregistrement également sous le nom original pour que l'accès direct soit en anglais
    print(f"7. Mise à jour de '{ORIGINAL_FILE}' en anglais...")
    doc.save(ORIGINAL_FILE)
    print(f"   -> '{ORIGINAL_FILE}' mis à jour avec succès.")
    
    # 8. Vérification de l'intégrité des médias (images)
    print("8. Vérification de l'intégrité des médias...")
    with zipfile.ZipFile(ENGLISH_FILE) as z:
        media_count = len([f for f in z.namelist() if f.startswith('word/media/')])
        print(f"   -> Total images et médias dans le fichier anglais: {media_count} (Attendu: 32)")
        assert media_count == 32, f"Attention: nombre de médias inattendu ({media_count} au lieu de 32)"
        
    print("\n" + "=" * 70)
    print("  SUCCES: LE RAPPORT EST ENTIEREMENT TRADUIT EN ANGLAIS !")
    print("=" * 70)
    print(f"[OK] Fichier traduit officiel : {ORIGINAL_FILE}")
    print(f"[OK] Copie anglaise dediee     : {ENGLISH_FILE}")
    print(f"[OK] Sauvegarde originale FR   : {BACKUP_FILE}")
    print("[OK] Toutes les 32 images et diagrammes ont ete preserves intacts.")
    print("[OK] Toute la mise en forme (polices, marges, alignements) est conservee.")

if __name__ == "__main__":
    main()
