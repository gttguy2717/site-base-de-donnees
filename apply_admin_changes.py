import io

p = 'src/components/admin/AdminClients.jsx'
d = io.open(p, encoding='utf-8-sig').read()

# 1) Compteur de l'onglet "À valider" : inclure PENDING + REJECTED
old_count = "clients.filter((c) => c.entreprise?.verification_status === 'PENDING').length"
new_count = "clients.filter((c) => ['PENDING','REJECTED'].includes(c.entreprise?.verification_status)).length"
assert d.count(old_count) >= 1, 'compteur pas trouvé'
d = d.replace(old_count, new_count)

# 2) Filtrage useEffect : inclure PENDING + REJECTED
old_filt = "filtered = filtered.filter((c) => c.entreprise?.verification_status === 'PENDING');"
new_filt = "filtered = filtered.filter((c) => ['PENDING','REJECTED'].includes(c.entreprise?.verification_status));"
assert d.count(old_filt) == 1, 'filtre useEffect'
d = d.replace(old_filt, new_filt)

# 3) Cellule "Vérification" : badge "Refusée" + bouton réexaminer pour REJECTED
cell_start_marker = 'client.entreprise.verification_status === '
cell_td_marker = '<td className="px-4 py-3 text-center">'
start_cell = d.rindex(cell_td_marker, 0, d.index("Examiner les documents"))
end_cell = d.index("</td>", d.index("Examiner les documents")) + len("</td>")

new_cell = (
    '<td className="px-4 py-3 text-center">\n'
    '                      {client.entreprise ? (\n'
    '                        client.entreprise.verification_status === \'PENDING\' || client.entreprise.verification_status === \'REJECTED\' ? (\n'
    '                          <div className="flex flex-col items-center gap-1.5">\n'
    '                            {client.entreprise.verification_status === \'REJECTED\' && (\n'
    '                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-red-100 text-red-700">\n'
    '                                <span className="material-symbols-outlined text-sm">block</span>\n'
    '                                Refusée\n'
    '                              </span>\n'
    '                            )}\n'
    '                            <button\n'
    '                              onClick={() => { setReviewNote(\'\'); setReviewClient(client); }}\n'
    '                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-200"\n'
    '                            >\n'
    '                              <span className="material-symbols-outlined text-sm">assignment_turned_in</span>\n'
    '                              {client.entreprise.verification_status === \'REJECTED\' ? \'Réexaminer\' : \'Examiner les documents\'}\n'
    '                            </button>\n'
    '                          </div>\n'
    '                        ) : (\n'
    '                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-emerald-100 text-emerald-700">\n'
    '                            <span className="material-symbols-outlined text-sm">verified</span>\n'
    '                            Validée\n'
    '                          </span>\n'
    '                        )\n'
    '                      ) : (\n'
    '                        <span className="text-xs text-gray-400">—</span>\n'
    '                      )}\n'
    '                    </td>'
)
d = d[:start_cell] + new_cell + d[end_cell:]

# 4) Supprimer la bannière d'information
info_marker = '<div className="ml-auto flex items-center gap-2 rounded-lg bg-blue-50'
info_start = d.index(info_marker)
info_end = d.index('validation', info_start)
info_end = d.index('</div>', info_end) + len('</div>')
d = d[:info_start] + d[info_end:]

io.open(p, 'w', encoding='utf-8').write(d)
print('OK - modifications appliquées')