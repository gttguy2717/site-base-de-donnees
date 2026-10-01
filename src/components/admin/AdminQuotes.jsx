import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../hooks/useAuth';
import { generateQuotePdf } from '../../lib/quotePdf';
import { computeQuoteTotals } from '../../lib/quoteTotals';

export default function AdminQuotes() {
  const { token } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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

  // Marquer un devis comme lu (indicateur WhatsApp : disparaît une fois lu)
  const markAsRead = async (quoteId) => {
    try {
      setMarkingRead(true);
      const response = await fetch(`/api/admin/quotes/${quoteId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const now = new Date().toISOString();
        setQuotes((prev) => prev.map((q) => (q.id === quoteId ? { ...q, lu_le: now } : q)));
        setSelectedQuote((prev) => (prev && prev.id === quoteId ? { ...prev, lu_le: now } : prev));
      } else {
        const data = await response.json().catch(() => ({}));
        alert(`❌ ${data.message || 'Erreur lors du marquage du devis'}`);
      }
    } catch (error) {
      console.error('Erreur marquage devis lu:', error);
      alert('Erreur lors du marquage du devis');
    } finally {
      setMarkingRead(false);
    }
  };

  // Télécharge le même devis PDF officiel que celui du client
  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      let items = [];
      if (selectedQuote?.snapshot) {
        try {
          items = typeof selectedQuote.snapshot === 'string'
            ? JSON.parse(selectedQuote.snapshot)
            : selectedQuote.snapshot;
        } catch (e) {
          items = [];
        }
      }
      await generateQuotePdf({
        quote: selectedQuote || {},
        items: Array.isArray(items) ? items : [],
      });
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert(`❌ Erreur lors de la génération du PDF : ${error?.message || 'erreur inconnue'}`);
    } finally {
      setDownloadingPdf(false);
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
      }
    };
    window.addEventListener('soutarah-admin-search', handleAdminSearch);
    return () => window.removeEventListener('soutarah-admin-search', handleAdminSearch);
  }, []);

  useEffect(() => {
    let filtered = quotes;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.nom?.toLowerCase().includes(searchLower) ||
          q.client?.nom?.toLowerCase().includes(searchLower) ||
          q.client?.prenom?.toLowerCase().includes(searchLower) ||
          q.reference?.toLowerCase().includes(searchLower) ||
          (q.titre || '').toLowerCase().includes(searchLower) ||
          (q.description || '').toLowerCase().includes(searchLower)
      );
    }
    // Filtre lu / non lu
    if (statusFilter === 'unread') filtered = filtered.filter((q) => !Boolean(q.lu_le));
    else if (statusFilter === 'read') filtered = filtered.filter((q) => Boolean(q.lu_le));
    // Tri : non lus en premier, puis par date décroissante
    setFilteredQuotes(
      [...filtered].sort((a, b) => {
        const aRead = a.lu_le ? 1 : 0;
        const bRead = b.lu_le ? 1 : 0;
        if (aRead !== bRead) return aRead - bRead;
        return new Date(b.cree_le || b.createdAt || 0) - new Date(a.cree_le || a.createdAt || 0);
      })
    );
  }, [search, statusFilter, quotes]);

  const isRead = (q) => Boolean(q && q.lu_le);
  const unreadCount = quotes.filter((q) => !isRead(q)).length;

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

  // Formater un montant en FCFA
  const formatMoney = (value) => {
    if (value == null || value === '') return null;
    const num = Number(String(value).replace(/\D/g, '')) || 0;
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(num)} FCFA`;
  };

  // Articles commandés depuis la description (séparés par '|')
  const getQuoteItems = (quote) => {
    if (!quote?.description) return [];
    const text = String(quote.description);
    if (!text.includes('|')) return [text.trim()].filter(Boolean);
    return text.split('|').map((s) => s.trim()).filter(Boolean);
  };

  const getPaymentMode = (quote) => {
    if (quote?.mode_paiement) return quote.mode_paiement;
    return '—';
  };

  // Récupère les articles depuis le snapshot (même source que le devis client)
  const getSnapshotItems = (quote) => {
    if (!quote?.snapshot) return [];
    let items = [];
    try {
      items = typeof quote.snapshot === 'string' ? JSON.parse(quote.snapshot) : quote.snapshot;
    } catch (e) {
      items = [];
    }
    return Array.isArray(items) ? items : [];
  };

  // Calcule les montants réels à partir des articles (HT/TVA/TDT/TTC)
  const getQuoteTotals = (quote) => {
    const items = getSnapshotItems(quote);
    const hasItems = items.length > 0;
    let montantHT = 0;
    let vehicleBase = 0;
    for (const it of items) {
      const isVeh = String(it?.type || '').startsWith('vehicle') || it?.type === 'location'
        || !!(it?.vehicle || it?.vehicleName || it?.vehicleType || it?.dailyPrice != null);
      const unit = Number(it.prix_unitaire ?? it.unitPrice ?? it.price ?? it.dailyPrice ?? 0);
      const qty = Number(it.quantite ?? it.quantity) || 1;
      const total = Number(it.total ?? it.prix_total ?? it.totalPrice ?? (unit * qty)) || 0;
      montantHT += total;
      if (isVeh) vehicleBase += total;
    }
    if (montantHT > 0) {
      const totals = computeQuoteTotals(montantHT, vehicleBase);
      return { ...totals, ht: totals.ht ?? montantHT, hasItems };
    }
    // Aucun article détaillé : on retombe sur le budget fourni
    const budget = Number(String(quote?.budget ?? '').replace(/\D/g, '')) || 0;
    return { ht: budget, tva: 0, tdt: 0, ttc: budget, hasItems };
  };

  const getSnippet = (quote) => {
    if (quote?.description) {
      return String(quote.description).split('|')[0].trim();
    }
    return quote.titre || 'Demande de devis';
  };

  const formatDate = (val) => {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
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
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Devis</h1>
          <p className="text-sm text-gray-500 mt-1">Cliquez sur un devis pour voir tous les détails et le télécharger</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtres : Tous / Non lus / Lus */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full p-1">
            {[
              { id: 'all', label: 'Tous', count: quotes.length },
              { id: 'unread', label: 'Non lus', count: unreadCount },
              { id: 'read', label: 'Lus', count: quotes.length - unreadCount },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === f.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900'
                }`}
              >
                {f.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                    statusFilter === f.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
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

      {/* Liste des devis (style WhatsApp) */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {filteredQuotes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <span className="material-symbols-outlined text-6xl text-gray-300">description</span>
            <p className="mt-2">Aucun devis trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredQuotes.map((quote) => {
              const read = isRead(quote);
              const clientName = getClientName(quote);

              return (
                <button
                  key={quote.id}
                  onClick={() => {
                    setSelectedQuote(quote);
                    setShowModal(true);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 cursor-pointer ${
                    read ? 'bg-white' : 'bg-primary/[0.04]'
                  }`}
                >
                  {/* Avatar avec indicateur non lu */}
                  <div className="relative shrink-0">
                    <div
                      className={`h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        read ? 'bg-gray-300' : 'bg-gradient-to-br from-primary to-green-600'
                      }`}
                    >
                      {clientName.charAt(0).toUpperCase()}
                    </div>
                    {!read && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white" />
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${read ? 'font-semibold text-gray-500' : 'font-extrabold text-gray-900'}`}>
                        {clientName}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {formatDate(quote.cree_le || quote.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="font-mono text-[11px] text-primary font-bold">
                        {quote.reference || `DEV-${(quote.id || '').slice(0, 8)}`}
                      </span>
                      {quote.mode_paiement && (
                        <span className="text-[10px] text-gray-400">• {quote.mode_paiement}</span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 truncate ${read ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getSnippet(quote)}
                    </p>
                  </div>

                  {/* Indicateur lu / non lu */}
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    {read ? (
                      <span className="material-symbols-outlined text-lg text-gray-300" title="Lu">done_all</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-600 px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                        NOUVEAU
                      </span>
                    )}
                    <span className="material-symbols-outlined text-gray-300 text-base">chevron_right</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
{/* Modal détails devis */}
      {showModal && selectedQuote && createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh] p-0 m-0 my-auto">

            {/* Header Modal */}
            <div className="bg-gradient-to-r from-[#112d19] via-[#173d23] to-[#1b4d2b] px-5 py-4 flex items-center justify-between text-white flex-shrink-0 rounded-t-3xl m-0 border-none">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-white">
                  <span className="material-symbols-outlined text-xl">description</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-extrabold text-white">Détails du devis</h3>
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-white/15 text-white border border-white/20">
                      {selectedQuote.reference || `DEV-${(selectedQuote.id || '').slice(0, 8)}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5">
                    Créé le {formatDate(selectedQuote.cree_le || selectedQuote.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isRead(selectedQuote) ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs bg-emerald-500/20 text-emerald-100 border-emerald-300/30">
                    <span className="material-symbols-outlined text-xs">done_all</span>
                    Lu
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs bg-amber-400/20 text-amber-200 border-amber-300/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
                    Non lu
                  </span>
                )}

                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedQuote(null);
                  }}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
                  title="Fermer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            </div>

            {/* Corps Modal */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50/60 text-xs">

              {/* Informations Client & Demande */}
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
                      {/* Budget masqué sur les devis négoce (aucun montant à afficher) */}
                      {Number(getQuoteTotals(selectedQuote).ttc) > 0 && (
                        <div className="bg-slate-50 p-2 rounded-xl border border-gray-100">
                          <p className="text-[10px] text-gray-400">Budget Estimatif</p>
                          <p className="font-bold text-gray-800">{formatMoney(getQuoteTotals(selectedQuote).ht) || 'Non précisé'}</p>
                        </div>
                      )}
                      <div className={`bg-slate-50 p-2 rounded-xl border border-gray-100 ${Number(getQuoteTotals(selectedQuote).ttc) > 0 ? '' : 'col-span-2'}`}>
                        <p className="text-[10px] text-gray-400">Délai Souhaité</p>
                        <p className="font-bold text-gray-800">{selectedQuote.delai || 'Non précisé'}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
{/* Récapitulatif de la commande : articles + paiement + montant */}
              <div className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-primary">shopping_bag</span>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Récapitulatif de la commande</p>
                </div>

                {/* Articles commandés */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Articles commandés</p>
                  {getSnapshotItems(selectedQuote).length > 0 ? (
                    <div className="space-y-1.5">
                      {getSnapshotItems(selectedQuote).map((it, idx) => {
                        const isVeh = String(it?.type || '').startsWith('vehicle') || it?.type === 'location'
                          || !!(it?.vehicle || it?.vehicleName || it?.vehicleType || it?.dailyPrice != null);
                        const name = isVeh
                          ? (it.vehicleName || it.vehicle?.name || it.vehicleType || 'Location véhicule')
                          : (it.produit?.nom || it.product?.name || it.libelle || it.title || it.name || 'Article');
                        const unit = Number(it.prix_unitaire ?? it.unitPrice ?? it.price ?? it.dailyPrice ?? 0);
                        const qty = Number(it.quantite ?? it.quantity) || 1;
                        const total = Number(it.total ?? it.prix_total ?? it.totalPrice ?? (unit * qty)) || 0;
                        return (
                          <div key={idx} className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-gray-100">
                            <span className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black flex-shrink-0">
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800 truncate">{name}</p>
                              <p className="text-[10px] text-gray-500">
                                {isVeh
                                  ? `${it.destination || it.destinationLabel || 'ABIDJAN'} · ${it.startDate && it.endDate ? Math.max(1, Math.round((new Date(it.endDate) - new Date(it.startDate)) / 86400000) + 1) : (it.days || it.duration || 1)} j`
                                  : 'Négoce'}
                                {' · Qté : '}{qty}{unit > 0 ? ` · ${formatMoney(unit)}/u` : ''}
                              </p>
                            </div>
                            {total > 0 && (
                              <span className="text-xs font-extrabold text-gray-900 shrink-0">{formatMoney(total)}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : getQuoteItems(selectedQuote).length > 0 ? (
                    <div className="space-y-1.5">
                      {getQuoteItems(selectedQuote).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-gray-100">
                          <span className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black flex-shrink-0">
                            {idx + 1}
                          </span>
                          <p className="text-xs font-semibold text-gray-800 leading-snug">{item}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">Aucun article détaillé</p>
                  )}
                </div>

                {/* Paiement & Montant — devis négoce sans montant : tarification sur devis */}
                {Number(getQuoteTotals(selectedQuote).ttc) > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-400">Moyen de paiement</p>
                      <p className="font-bold text-gray-900">{getPaymentMode(selectedQuote)}</p>
                    </div>
                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-emerald-700 font-semibold">Montant HT</p>
                        <p className="font-bold text-emerald-900 text-xs">{formatMoney(getQuoteTotals(selectedQuote).ht) || '—'}</p>
                      </div>
                      {getQuoteTotals(selectedQuote).hasItems && (
                        <>
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] text-emerald-700 font-semibold">TVA 18%</p>
                            <p className="font-bold text-emerald-900 text-xs">{formatMoney(getQuoteTotals(selectedQuote).tva) || '—'}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] text-emerald-700 font-semibold">TDT 2,5%</p>
                            <p className="font-bold text-emerald-900 text-xs">{formatMoney(getQuoteTotals(selectedQuote).tdt) || '—'}</p>
                          </div>
                          <div className="flex items-center justify-between border-t border-emerald-200/70 pt-1">
                            <p className="text-[10px] font-bold text-emerald-800 uppercase">Montant total</p>
                            <p className="font-extrabold text-emerald-900 text-[13px]">{formatMoney(getQuoteTotals(selectedQuote).ttc) || '—'}</p>
                          </div>
                        </>
                      )}
                      {!getQuoteTotals(selectedQuote).hasItems && (
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-emerald-800 uppercase">Montant total</p>
                          <p className="font-extrabold text-emerald-900 text-[13px]">{formatMoney(getQuoteTotals(selectedQuote).ttc) || '—'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-400">Nature</p>
                      <p className="font-bold text-gray-900">Commande négoce</p>
                    </div>
                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                      <p className="text-[10px] text-emerald-700 font-semibold">Tarification</p>
                      <p className="font-bold text-emerald-900">Sur devis — à établir</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Marquer comme lu */}
              <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/80">
                {isRead(selectedQuote) ? (
                  <div className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <span className="material-symbols-outlined text-base">done_all</span>
                    Déjà lu
                  </div>
                ) : (
                  <button
                    onClick={() => markAsRead(selectedQuote.id)}
                    disabled={markingRead}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-extrabold transition-all shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-[0.99] shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {markingRead ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">mark_email_read</span>
                        Marquer comme lu
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>

            {/* Footer Modal Actions — pas de PDF pour un devis négoce (sans montant) */}
            <div className={`bg-white px-5 py-3 border-t border-gray-100 flex items-center gap-3 flex-shrink-0 ${Number(getQuoteTotals(selectedQuote).ttc) > 0 ? 'justify-between' : 'justify-end'}`}>
              {Number(getQuoteTotals(selectedQuote).ttc) > 0 && (
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-[#1b4c00] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingPdf ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <span className="material-symbols-outlined text-sm">download</span>
                  )}
                  Télécharger Fiche (PDF)
                </button>
              )}

              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedQuote(null);
                }}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors"
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