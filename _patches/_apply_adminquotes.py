# -*- coding: utf-8 -*-
"""Applique les changements AdminQuotes (suppression upload devis signé)."""
import io

PATH = r"C:\Users\HP\Downloads\PARCOURS TS\STAGE\STAGE TS STIC 2\site-soutarah\src\components\admin\AdminQuotes.jsx"

def read(path):
    return io.open(path, encoding="utf-8").read()

def write(path, s):
    with io.open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

s = read(PATH)

# 1) Supprimer les états d'upload
s = s.replace("  const [uploadingFile, setUploadingFile] = useState(false);\n", "")
s = s.replace("  const [uploadSuccess, setUploadSuccess] = useState(false);\n", "")

# 2) Supprimer la fonction handleUploadSignedQuote (du commentaire de déclaration au '};' final)
start_fn = s.index("  const handleUploadSignedQuote = async (event) => {")
# Chercher la fin : le '};' qui referme la fonction (premier bloc '  };' après start)
end_fn = s.index("\n  };\n", start_fn) + len("\n  };\n")
s = s[:start_fn] + s[end_fn:]

# 3) Supprimer toutes les lignes setUploadSuccess(false);
lines = s.split("\n")
lines = [ln for ln in lines if "setUploadSuccess(false);" not in ln]
s = "\n".join(lines)

# 4) Remplacer le bloc Upload PDF par le bloc "Devis validé automatiquement"
old_block_start = s.index("              {/* Bloc Upload PDF & Bouton Envoyer au Client */}")
# Fin du bloc : on cherche la fermeture '              </div>\n' suivante après le marqueur info
info_marker = "Le bouton &quot;Envoyer au client&quot;"
info_pos = s.index(info_marker, old_block_start)
# L'info paragraph se termine par "</p>\n" puis "                )}\n" puis "              </div>\n"
close_candidate = s.index("              </div>\n", info_pos)
# s'assurer que c'est bien la fermeture du bloc bleu (il y a '                )}\n' juste avant)
old_block_end = s.index("              </div>\n", info_pos) + len("              </div>\n")

new_block = (
    "              {/* Devis validé automatiquement au paiement */}\n"
    "              <div className=\"bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/80 space-y-3\">\n"
    "                <div className=\"flex items-center justify-between\">\n"
    "                  <div className=\"flex items-center gap-1.5 text-emerald-900 font-bold\">\n"
    "                    <span className=\"material-symbols-outlined text-lg text-emerald-600\">verified</span>\n"
    "                    <span>Devis validé automatiquement</span>\n"
    "                  </div>\n"
    "                  {selectedQuote.statut === 'SENT' && (\n"
    "                    <span className=\"inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-xs\">\n"
    "                      <span className=\"material-symbols-outlined text-xs\">check_circle</span>\n"
    "                      Validé au paiement\n"
    "                    </span>\n"
    "                  )}\n"
    "                </div>\n"
    "                <p className=\"text-[11px] text-emerald-800 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-emerald-100\">\n"
    "                  Le devis passe automatiquement au statut « Validé » dès que le client confirme sa commande sur la page\n"
    "                  « Passer commande » (paiement en ligne ou en espèces). Aucun document n&apos;est à téléverser de votre part.\n"
    "                </p>\n"
    "                <div className=\"flex flex-wrap gap-2.5 pt-1\">\n"
    "                  <button\n"
    "                    onClick={() => {\n"
    "                      if (confirm(`Marquer le devis ${selectedQuote.reference} comme traité ?`)) {\n"
    "                        updateQuoteStatus(selectedQuote.id, 'CONVERTED');\n"
    "                      }\n"
    "                    }}\n"
    "                    disabled={selectedQuote.statut === 'CONVERTED'}\n"
    "                    className=\"inline-flex items-center justify-center gap-1.5 px-4 h-[38px] rounded-xl text-xs font-extrabold transition-all shadow-xs bg-green-600 hover:bg-green-700 text-white cursor-pointer active:scale-95 shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed\"\n"
    "                  >\n"
    "                    <span className=\"material-symbols-outlined text-base\">check_circle</span>\n"
    "                    <span>Marquer comme traité</span>\n"
    "                  </button>\n"
    "                </div>\n"
    "              </div>\n"
)
s = s[:old_block_start] + new_block + s[old_block_end:]

# Nettoyage : éviter les doubles lignes vides restantes dues aux suppressions
while "\n\n\n" in s:
    s = s.replace("\n\n\n", "\n\n")

write(PATH, s)
print("AdminQuotes.jsx mis à jour OK")