import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const COLOR_CLASSES = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
  yellow: 'bg-yellow-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
};

function getColorClass(color) {
  return COLOR_CLASSES[color] || 'bg-gray-500';
}

export default function AdminClients() {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [reviewClient, setReviewClient] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);
  const [convertClient, setConvertClient] = useState(null);
  const [convertMode, setConvertMode] = useState('none'); // 'none' = sans durée, 'days' = délai en jours
  const [convertDays, setConvertDays] = useState('30');
  const [convertBusy, setConvertBusy] = useState(false);
  const [busyUserId, setBusyUserId] = useState(null);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const isEntrepriseAccount = (c) =>
    c.type_client === 'ENTREPRISE' || c.type_client === 'ENTREPRISE_CLIENT' || !!c.entreprise;

  useEffect(() => {
    let filtered = [...clients];

    if (filterType === 'PARTICULIER') {
      filtered = filtered.filter((c) => !isEntrepriseAccount(c));
    } else if (filterType === 'ENTREPRISE') {
      // Entreprises simples uniquement
      filtered = filtered.filter((c) => c.type_client === 'ENTREPRISE');
    } else if (filterType === 'ENTREPRISE_CLIENT') {
      // Entreprises clientes uniquement
      filtered = filtered.filter((c) => c.type_client === 'ENTREPRISE_CLIENT');
    } else if (filterType === 'PENDING_VERIF') {
      filtered = filtered.filter((c) => ['PENDING', 'REJECTED'].includes(c.entreprise?.verification_status));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((c) => {
        const name = (c.entreprise?.nom || `${c.prenom || ''} ${c.nom || ''}`).toLowerCase();
        const email = (c.utilisateur?.email || '').toLowerCase();
        const phone = (c.utilisateur?.telephone || '').toLowerCase();
        const ville = (c.entreprise?.ville || c.ville || '').toLowerCase();
        return name.includes(q) || email.includes(q) || phone.includes(q) || ville.includes(q);
      });
    }

    setFilteredClients(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients, filterType, search]);

  // Télécharge le VRAI document via l'API admin (fichier original, nom d'origine)
  const downloadDocument = async (docIndex, docName) => {
    if (!reviewClient) return;
    try {
      const response = await fetch(`/api/admin/clients/${reviewClient.id}/documents/${docIndex}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Téléchargement impossible');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = docName || `document-${docIndex + 1}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement document:', error);
      alert(error.message || 'Erreur lors du téléchargement du document');
    }
  };

  const reviewClientAction = async (status) => {
    if (!reviewClient) return;
    setReviewBusy(true);

    try {
      const response = await fetch(`/api/admin/clients/${reviewClient.id}/verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, note: reviewNote }),
      });

      if (response.ok) {
        setReviewClient(null);
        setReviewNote('');
        loadClients();
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.message || 'Erreur lors de la validation');
      }
    } catch (error) {
      console.error('Erreur examen entreprise:', error);
      alert('Erreur lors de la validation');
    } finally {
      setReviewBusy(false);
    }
  };

  const submitConversion = async () => {
    if (!convertClient) return;
    let delai = null;
    if (convertMode === 'days') {
      delai = Number(convertDays);
      if (!Number.isInteger(delai) || delai <= 0) {
        alert('Indiquez un nombre de jours valide, ou choisissez « Sans durée de blocage ».');
        return;
      }
    }

    setConvertBusy(true);
    try {
      const response = await fetch(`/api/admin/clients/${convertClient.id}/convert-entreprise`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ delai_blocage_jours: delai }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        alert(data.message || 'Conversion effectuée');
        setConvertClient(null);
        loadClients();
      } else {
        alert(data.message || 'Erreur lors de la conversion');
      }
    } catch (error) {
      console.error('Erreur conversion entreprise:', error);
      alert('Erreur lors de la conversion');
    } finally {
      setConvertBusy(false);
    }
  };

  const typeLabel = (type) =>
    type === 'ENTREPRISE_CLIENT' ? 'Entreprise Client' : type === 'ENTREPRISE' ? 'Entreprise' : 'Particulier';

  // Bloquer / débloquer un compte (particuliers) : un compte bloqué ne peut plus se connecter
  const toggleBlock = async (client) => {
    const userId = client.utilisateur?.id;
    const name = client.entreprise?.nom || `${client.prenom || ''} ${client.nom || ''}`.trim() || 'ce client';
    if (!userId) {
      alert('Compte utilisateur introuvable pour ce client.');
      return;
    }
    const currentlyActive = client.utilisateur?.est_actif !== false;
    const confirmMsg = currentlyActive
      ? `Bloquer le compte de ${name} ?\n\nIl ne pourra plus se connecter à son espace jusqu'au déblocage.`
      : `Débloquer le compte de ${name} ?\n\nIl retrouvera l'accès à son espace client.`;
    if (!window.confirm(confirmMsg)) return;

    setBusyUserId(userId);
    try {
      const response = await fetch(`/api/admin/clients/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ est_actif: !currentlyActive }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        loadClients();
      } else {
        alert(data.message || 'Erreur lors du changement de statut');
      }
    } catch (error) {
      console.error('Erreur changement statut client:', error);
      alert('Erreur lors du changement de statut');
    } finally {
      setBusyUserId(null);
    }
  };

  const typeBadge = (type) =>
    type === 'ENTREPRISE_CLIENT'
      ? 'bg-blue-100 text-blue-700'
      : type === 'ENTREPRISE'
        ? 'bg-indigo-100 text-indigo-700'
        : 'bg-green-100 text-green-700';

  const filterButton = (value, label, count, activeClasses) => (
    <button
      key={value}
      onClick={() => setFilterType(value)}
      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
        filterType === value ? activeClasses : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
      <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${filterType === value ? 'bg-white/25' : 'bg-gray-100'}`}>
        {count}
      </span>
    </button>
  );
  const showEntrepriseCols = filterType !== 'PARTICULIER';
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500">Gestion des particuliers et des entreprises</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher nom, email, téléphone, ville..."
            className="w-72 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={loadClients}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200"
            title="Rafraîchir"
          >
            <span className="material-symbols-outlined text-sm align-middle">refresh</span>
          </button>
        </div>
      </div>

      {/* Filtres : entreprises simples et entreprises clientes distinctes */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {filterButton('ALL', 'Tous', clients.length, 'bg-blue-600 text-white')}
        {filterButton('PARTICULIER', 'Particuliers', clients.filter((c) => !isEntrepriseAccount(c)).length, 'bg-green-600 text-white')}
        {filterButton('ENTREPRISE', 'Entreprises', clients.filter((c) => c.type_client === 'ENTREPRISE').length, 'bg-indigo-600 text-white')}
        {filterButton('ENTREPRISE_CLIENT', 'Entreprises Clientes', clients.filter((c) => c.type_client === 'ENTREPRISE_CLIENT').length, 'bg-sky-600 text-white')}
        {filterButton(
          'PENDING_VERIF',
          'À valider',
          clients.filter((c) => ['PENDING', 'REJECTED'].includes(c.entreprise?.verification_status)).length,
          'bg-amber-500 text-white'
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Chargement des clients...</div>
      ) : (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Téléphone</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Ville</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Statut</th>
                {showEntrepriseCols && (
                  <>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Verification</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Action</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClients.map((client) => {
                const displayName = client.entreprise?.nom || `${client.prenom || ''} ${client.nom || ''}`.trim();
                const email = client.utilisateur?.email || '';
                const telephone = client.utilisateur?.telephone || '';
                const ville = client.entreprise?.ville || client.ville || '-';
                const estEntreprise = isEntrepriseAccount(client);

                return (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-9 w-9 rounded-lg ${getColorClass(client.color)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm text-gray-900">{displayName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${typeBadge(client.type_client)}`}>
                        {typeLabel(client.type_client)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 break-all">{email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{telephone}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{ville}</td>
                    <td className="px-4 py-3 text-center">
                      {/* Info délai (entreprises clientes uniquement) */}
                      {client.type_client === 'ENTREPRISE_CLIENT' && (
                        <div className="mb-1.5">
                          {client.bloque_le ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-red-100 text-red-700 mb-1">
                              <span className="material-symbols-outlined text-sm">schedule</span>
                              Blocage auto
                            </span>
                          ) : client.delai_blocage_jours ? (
                            <span className="text-[10px] font-semibold text-gray-700 whitespace-nowrap">
                              Délai : après {client.delai_blocage_jours} j
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">Sans durée</span>
                          )}
                        </div>
                      )}

                      {/* Bouton de statut : Actif / Bloqué (un clic bascule) */}
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => toggleBlock(client)}
                          disabled={busyUserId === client.utilisateur?.id}
                          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors disabled:opacity-50 ${
                            client.utilisateur?.est_actif === false
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                          title={client.utilisateur?.est_actif === false
                            ? 'Réactiver l\'accès au compte'
                            : 'Empêcher l\'accès au compte (le client ne pourra plus se connecter)'}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {client.utilisateur?.est_actif === false ? 'lock' : 'check_circle'}
                          </span>
                          {busyUserId === client.utilisateur?.id
                            ? '...'
                            : client.utilisateur?.est_actif === false ? 'Bloqué' : 'Actif'}
                        </button>
                      </div>
                    </td>
                    {showEntrepriseCols && (
                    <>
                    <td className="px-4 py-3 text-center">
                      {client.entreprise ? (
                        client.entreprise.verification_status === 'PENDING' || client.entreprise.verification_status === 'REJECTED' ? (
                          <div className="flex flex-col items-center gap-1.5">
                            {client.entreprise.verification_status === 'REJECTED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-red-100 text-red-700">
                                <span className="material-symbols-outlined text-sm">block</span>
                                Refusée
                              </span>
                            )}
                            <button
                              onClick={() => { setReviewNote(''); setReviewClient(client); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-200"
                            >
                              <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
                              {client.entreprise.verification_status === 'REJECTED' ? 'Réexaminer' : 'Examiner les documents'}
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-emerald-100 text-emerald-700">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            Validée
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {estEntreprise && client.type_client === 'ENTREPRISE' ? (
                        <button
                          onClick={() => { setConvertMode('none'); setConvertDays('30'); setConvertClient(client); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors bg-blue-600 text-white hover:bg-blue-700"
                          title="Convertir ce compte en entreprise cliente (tarifs dedies)"
                        >
                          <span className="material-symbols-outlined text-sm">swap_horiz</span>
                          Passer en entreprise cliente
                        </button>
                      ) : client.type_client === 'ENTREPRISE_CLIENT' ? (
                        <button
                          onClick={() => {
                            setConvertMode(client.delai_blocage_jours ? 'days' : 'none');
                            setConvertDays(String(client.delai_blocage_jours || 30));
                            setConvertClient(client);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        >
                          <span className="material-symbols-outlined text-sm">timer</span>
                          Modifier le délai
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>Aucun client trouvé</p>
          </div>
        )}
      </div>
      )}
      {/* Modale : examen des documents d'entreprise */}
      {reviewClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{reviewClient.entreprise?.nom}</h2>
                <p className="text-sm text-gray-500">Examen des documents justificatifs</p>
              </div>
              <button
                onClick={() => setReviewClient(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm space-y-1">
              <p><span className="font-semibold text-gray-700">Responsable :</span> {reviewClient.entreprise?.nom_responsable || reviewClient.prenom || '-'}</p>
              <p><span className="font-semibold text-gray-700">N° identification :</span> {reviewClient.entreprise?.numero_identification || '-'}</p>
              <p><span className="font-semibold text-gray-700">Email :</span> {reviewClient.utilisateur?.email || '-'}</p>
              <p><span className="font-semibold text-gray-700">Téléphone :</span> {reviewClient.utilisateur?.telephone || '-'}</p>
              {reviewClient.entreprise?.verification_status === 'REJECTED' && reviewClient.entreprise?.note_verification && (
                <p><span className="font-semibold text-red-700">Motif du refus :</span> {reviewClient.entreprise.note_verification}</p>
              )}
            </div>

            <p className="text-sm font-semibold text-gray-700 mb-2">
              Documents téléversés ({(reviewClient.entreprise?.documents || []).length})
            </p>
            <div className="mb-4 space-y-2">
              {(reviewClient.entreprise?.documents || []).map((doc, index) => (
                <div key={index} className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-gray-200">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.originalname || doc.filename}</p>
                    <p className="text-xs text-gray-500">
                      {doc.mimetype || 'fichier'} - {doc.size ? `${Math.round(doc.size / 1024)} Ko` : '-'}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadDocument(index, doc.originalname)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
                    title="Télécharger le vrai fichier"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Télécharger
                  </button>
                </div>
              ))}
              {(reviewClient.entreprise?.documents || []).length === 0 && (
                <p className="text-sm text-gray-500">Aucun document enregistré pour cette entreprise.</p>
              )}
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-1">Note (motif du refus, message...)</label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={3}
              placeholder="Optionnel - ex. : documents illisibles, RCCM expiré..."
              className="w-full mb-4 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => reviewClientAction('REJECTED')}
                disabled={reviewBusy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">block</span>
                Refuser
              </button>
              <button
                onClick={() => reviewClientAction('APPROVED')}
                disabled={reviewBusy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Valider le compte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale : conversion en entreprise cliente + delai de blocage */}
      {convertClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {convertClient.type_client === 'ENTREPRISE' ? 'Passer en entreprise cliente' : 'Modifier le délai de blocage'}
                </h2>
                <p className="text-sm text-gray-500">{convertClient.entreprise?.nom || convertClient.utilisateur?.email}</p>
              </div>
              <button
                onClick={() => setConvertClient(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Une entreprise cliente bénéficie de tarifs dédiés. Vous pouvez definir une duree d'acces apres
              laquelle le compte sera bloque automatiquement, ou laisser le compte actif sans limite de duree.
            </p>

            <div className="space-y-2 mb-4">
              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                convertMode === 'none' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  checked={convertMode === 'none'}
                  onChange={() => setConvertMode('none')}
                  className="accent-blue-600"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Sans durée de blocage</p>
                  <p className="text-xs text-gray-500">Le compte reste actif indéfiniment</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                convertMode === 'days' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  checked={convertMode === 'days'}
                  onChange={() => setConvertMode('days')}
                  className="accent-blue-600"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Bloquer après un délai</p>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      min="1"
                      value={convertDays}
                      onChange={(e) => { setConvertDays(e.target.value); setConvertMode('days'); }}
                      disabled={convertMode !== 'days'}
                      className="w-24 px-2 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <span className="text-sm text-gray-600">jours</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">À l'expiration du délai, le compte est bloque automatiquement a la prochaine connexion.</p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConvertClient(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={submitConversion}
                disabled={convertBusy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">swap_horiz</span>
                {convertClient.type_client === 'ENTREPRISE' ? 'Convertir' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}