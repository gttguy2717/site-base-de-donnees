import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../hooks/useAuth';
import QuoteDocument from '../QuoteDocument';
import { generateQuotePdf } from '../../lib/quotePdf';

export default function AdminQuotes() {
  const { token } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/quotes', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setQuotes(data.quotes || []);
      }
    } catch (error) {
      console.error('Erreur chargement devis:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (quoteId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statut: newStatus }),
      });

      if (response.ok) {
        // Mise à jour immédiate dans l'état local pour refléter le changement sans attendre le rechargement
        setQuotes((prev) =>
          prev.map((q) => (q.id === quoteId ? { ...q, statut: newStatus } : q))
        );
        // Réinitialiser le filtre à ALL pour que le devis soit visible avec son nouveau statut
        setFilterStatus('ALL');
        setShowModal(false);
        setSelectedQuote(null);
        setUploadSuccess(false);
        // Recharger la liste complète en arrière-plan
        loadQuotes();
      } else {
        const data = await response.json().catch(() => ({}));
        alert(`❌ ${data.message || 'Erreur lors de la mise à jour du statut'}`);
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDownloadPdf = async () => {
    try {
      await generateQuotePdf({ quote: selectedQuote });
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('❌ Erreur lors de la génération du PDF');
    }
  };

  const handleUploadSignedQuote = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('❌ Seuls les fichiers PDF sont acceptés');
      event.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('❌ Le fichier est trop volumineux (max 10MB)');
      event.target.value = '';
      return;
    }

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/admin/quotes/${selectedQuote.id}/upload-signed`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedQuote((prev) => ({ ...prev, fichier_devis_url: data.file_url, statut: 'SENT' }));
        setUploadSuccess(true);
        // Mise à jour locale et rechargement
        setQuotes((prev) => prev.map((q) => q.id === selectedQuote.id ? { ...q, fichier_devis_url: data.file_url, statut: 'SENT' } : q));
        loadQuotes();
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${error.message || 'Upload échoué'}`);
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('❌ Erreur lors de l\'upload du devis signé');
    } finally {
      setUploadingFile(false);
      event.target.value = '';
    }
  };

  useEffect(() => {
    loadQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Écouter la recherche globale du header admin
  useEffect(() => {
    const handleAdminSearch = (event) => {
      if (event.detail) {
        setSearch(event.detail);
        setFilterStatus('ALL');
      }
    };
    window.addEventListener('soutarah-admin-search', handleAdminSearch);
    return () => window.removeEventListener('soutarah-admin-search', handleAdminSearch);
  }, []);

  useEffect(() => {
    let filtered = quotes;
    if (filterStatus === 'ISSUED') {
      // "En attente" = PENDING, ISSUED et CONTACTED
      filtered = filtered.filter((q) => q.statut === 'ISSUED' || q.statut === 'PENDING' || q.statut === 'CONTACTED');
    } else if (filterStatus === 'SENT') {
      // "Envoyés" = uniquement SENT
      filtered = filtered.filter((q) => q.statut === 'SENT');
    } else if (filterStatus !== 'ALL') {
      filtered = filtered.filter((q) => q.statut === filterStatus);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.nom?.toLowerCase().includes(searchLower) ||
          q.client?.nom?.toLowerCase().includes(searchLower) ||
          q.client?.prenom?.toLowerCase().includes(searchLower) ||
          q.reference?.toLowerCase().includes(searchLower)
      );
    }
    setFilteredQuotes([...filtered].sort((a, b) => new Date(b.cree_le) - new Date(a.cree_le)));
  }, [search, filterStatus, quotes]);

  const getStatusBadge = (status) => {
    const badges = {
      ISSUED: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'En attente', icon: 'schedule' },
      APPROVED: { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Envoyé', icon: 'send' },
      SENT: { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Envoyé', icon: 'send' },
      PENDING: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'En attente', icon: 'schedule' },
      CONTACTED: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'En cours d\'étude', icon: 'engineering' },
      CONVERTED: { bg: 'bg-green-50 text-green-700 border-green-200', label: 'Devis traité', icon: 'check_circle' },
      REJECTED: { bg: 'bg-red-50 text-red-700 border-red-200', label: 'Rejeté', icon: 'cancel' },
      CANCELLED: { bg: 'bg-gray-50 text-gray-600 border-gray-200', label: 'Annulé', icon: 'block' },
    };
    return badges[status] || badges.ISSUED;
  };

  const getStatusCount = (status) => {
    return quotes.filter((q) => q.statut === status).length;
  };

  const getClientName = (quote) => {
    return quote.nom || quote.client?.entreprise?.nom || `${quote.client?.prenom || ''} ${quote.client?.nom || ''}`.trim() || 'Client';
  };

  const getClientPhone = (quote) => {
    return quote.telephone || quote.client?.user?.telephone || '-';
  };

  const getClientEmail = (quote) => {
    return quote.email || quote.client?.user?.email || '-';
  };

  const getClientLocation = (quote) => {
    return quote.lieu || quote.client?.adresse || '-';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Devis</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez les demandes de devis des clients</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {quotes.length} demande{quotes.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-gray-700 mr-1">Filtres</span>

            <button
              onClick={() => setFilterStatus('ALL')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === 'ALL' ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>Tous</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${filterStatus === 'ALL' ? 'bg-white/20' : 'bg-white'}`}>
                {quotes.length}
              </span>
            </button>

            <button
              onClick={() => setFilterStatus('ISSUED')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === 'ISSUED' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>En attente</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${filterStatus === 'ISSUED' ? 'bg-white/20' : 'bg-white'}`}>
                {getStatusCount('ISSUED') + getStatusCount('PENDING')}
              </span>
            </button>

            <button
              onClick={() => setFilterStatus('SENT')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === 'SENT' ? 'bg-purple-600 text-white shadow-sm' : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm">send</span>
              <span>Envoyés</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${filterStatus === 'SENT' ? 'bg-white/20' : 'bg-white'}`}>
                {getStatusCount('SENT')}
              </span>
            </button>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Tableau des devis */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Référence</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Service</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Date</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Statut</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredQuotes.map((quote) => {
                const status = getStatusBadge(quote.statut);
                const clientName = getClientName(quote);

                return (
                  <tr key={quote.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {quote.reference || `DEV-${quote.id.slice(0, 8)}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white font-bold text-xs">
                          {clientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-gray-900 block">{clientName}</span>
                          <span className="text-xs text-gray-400">{getClientPhone(quote)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{quote.service || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(quote.cree_le || quote.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.text}`}>
                        <span className="material-symbols-outlined text-xs">{status.icon}</span>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedQuote(quote);
                          setUploadSuccess(false);
                          setShowModal(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Voir détails
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredQuotes.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <span className="material-symbols-outlined text-6xl text-gray-300">description</span>
            <p className="mt-2">Aucun devis trouvé</p>
          </div>
        )}
      </div>

      {/* Modal détails devis */}
      {showModal && selectedQuote && createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh] p-0 m-0 my-auto">
            
            {/* Header Modal - Directement collé en haut */}
            <div className="bg-gradient-to-r from-[#112d19] via-[#173d23] to-[#1b4d2b] px-5 py-4 flex items-center justify-between text-white flex-shrink-0 rounded-t-3xl m-0 border-none">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-white">
                  <span className="material-symbols-outlined text-xl">description</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-extrabold text-white">Détails du devis</h3>
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-white/15 text-white border border-white/20">
                      {selectedQuote.reference || `DEV-${selectedQuote.id.slice(0, 8)}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5">
                    Créé le {new Date(selectedQuote.cree_le || selectedQuote.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {(() => {
                  const statusInfo = getStatusBadge(selectedQuote.statut);
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${statusInfo.bg} ${statusInfo.text}`}>
                      <span className="material-symbols-outlined text-xs">{statusInfo.icon}</span>
                      {statusInfo.label}
                    </span>
                  );
                })()}

                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedQuote(null);
                    setUploadSuccess(false);
                  }}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
                  title="Fermer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            </div>

            {/* Corps Modal - Tout lisible en un coup d'œil */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50/60 text-xs">
              
              {/* Informations Client & Demande (Grid 2 colonnes compact) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Bloc Client */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100 text-primary font-bold uppercase tracking-wider text-[11px]">
                    <span className="material-symbols-outlined text-base">person</span>
                    <span>Demandeur / Client</span>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <p className="text-[10px] font-medium text-gray-400">Nom & Prénom</p>
                      <p className="font-bold text-gray-900 text-sm">{getClientName(selectedQuote)}</p>
                    </div>

                    {selectedQuote.entreprise && (
                      <div>
                        <p className="text-[10px] font-medium text-gray-400">Entreprise</p>
                        <p className="font-semibold text-blue-700">{selectedQuote.entreprise}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-slate-50 p-2 rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-400">Email</p>
                        <p className="font-semibold text-gray-800 truncate">{getClientEmail(selectedQuote)}</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-400">Téléphone</p>
                        <p className="font-semibold text-gray-800">{getClientPhone(selectedQuote)}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-400">Adresse / Localisation</p>
                      <p className="font-semibold text-gray-800">{getClientLocation(selectedQuote)}</p>
                    </div>
                  </div>
                </div>

                {/* Bloc Détails du Projet */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100 text-primary font-bold uppercase tracking-wider text-[11px]">
                    <span className="material-symbols-outlined text-base">work</span>
                    <span>Prestation & Projet</span>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                      <p className="text-[10px] font-bold text-emerald-800 uppercase">Service Demandé</p>
                      <p className="font-extrabold text-emerald-950 text-sm mt-0.5">{selectedQuote.service || 'Non spécifié'}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-medium text-gray-400">Intitulé / Objet</p>
                      <p className="font-bold text-gray-900">{selectedQuote.titre || selectedQuote.title || '-'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-2 rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-400">Budget Estimatif</p>
                        <p className="font-bold text-gray-800">{selectedQuote.budget || 'Non précisé'}</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-400">Délai Souhaité</p>
                        <p className="font-bold text-gray-800">{selectedQuote.delai || 'Non précisé'}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Description (Si présente) */}
              {selectedQuote.description && (
                <div className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-xs space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description de la demande</p>
                  <p className="text-xs text-gray-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-gray-100">
                    {selectedQuote.description}
                  </p>
                </div>
              )}

              {/* Bloc Upload PDF & Bouton Envoyer au Client */}
              <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                    <span className="material-symbols-outlined text-lg text-blue-600">upload_file</span>
                    <span>Document de Devis Signé</span>
                  </div>

                  {selectedQuote.fichier_devis_url && (
                    <a
                      href={`${selectedQuote.fichier_devis_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition-colors shadow-xs"
                    >
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                      Voir le PDF actuel
                    </a>
                  )}
                </div>

                {uploadSuccess && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-500 text-white p-2.5 text-xs font-bold shadow-xs">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>Fichier PDF chargé avec succès ! Vous pouvez maintenant cliquer sur &quot;Envoyer au client&quot;.</span>
                  </div>
                )}

                {/* Champ Fichier + Bouton Envoyer alignés dans la même carte */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700">
                      {selectedQuote.fichier_devis_url ? 'Remplacer le fichier PDF signé' : 'Sélectionner le devis signé (PDF)'}
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleUploadSignedQuote}
                      disabled={uploadingFile}
                      className="block w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 cursor-pointer bg-white rounded-xl border border-gray-200"
                    />
                  </div>

                  {/* Bouton Envoyer au client - Désactivé si AUCUN fichier n'est téléversé */}
                  <div>
                    <button
                      disabled={!selectedQuote.fichier_devis_url || uploadingFile}
                      onClick={() => {
                        if (confirm('Confirmer l\'envoi du devis signé au client ?')) {
                          updateQuoteStatus(selectedQuote.id, 'SENT');
                        }
                      }}
                      className={`w-full h-[38px] inline-flex items-center justify-center gap-1.5 px-4 rounded-xl text-xs font-extrabold transition-all shadow-xs ${
                        selectedQuote.fichier_devis_url && !uploadingFile
                          ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer active:scale-95 shadow-purple-500/20'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300/50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">send</span>
                      <span>Envoyer au client</span>
                    </button>
                  </div>
                </div>

                {!selectedQuote.fichier_devis_url && (
                  <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">info</span>
                    Le bouton &quot;Envoyer au client&quot; s&apos;activera automatiquement dès que vous aurez téléversé un fichier PDF.
                  </p>
                )}
              </div>

            </div>

            {/* Footer Modal Actions */}
            <div className="bg-white px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Télécharger Fiche (PDF)
              </button>

              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedQuote(null);
                  setUploadSuccess(false);
                }}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}