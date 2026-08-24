import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AvatarUploader from '../components/AvatarUploader';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../lib/api';
import { generateQuotePdf } from '../lib/quotePdf';

export default function ClientDashboardPage({ navigateTo, initialTab = 'account' }) {
  const { user, client, token, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab === 'overview' ? 'account' : initialTab);

  // Sync activeTab when initialTab prop changes from navigation
  useEffect(() => {
    if (initialTab && initialTab !== 'overview') {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Synchronized Data States
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [deletingQuoteId, setDeletingQuoteId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [downloadingQuoteId, setDownloadingQuoteId] = useState(null);

  // Profile Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    companyName: '',
    responsibleName: '',
    identificationNumber: '',
    newPassword: '',
  });

  const [activeModal, setActiveModal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Fetch Quotes & Notifications from Backend
  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const [quotesRes, notifsRes] = await Promise.allSettled([
        apiRequest('/quote-requests/my', { token }),
        apiRequest('/notifications/my', { token }),
      ]);

      if (quotesRes.status === 'fulfilled' && quotesRes.value?.quoteRequests) {
        setQuoteRequests(quotesRes.value.quoteRequests);
      }
      if (notifsRes.status === 'fulfilled' && notifsRes.value?.notifications) {
        setNotifications(notifsRes.value.notifications);
      }
    } catch (e) {
      console.error('Erreur lors du chargement des données', e);
    } finally {
      setLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboardData();
    const refresh = () => loadDashboardData();
    window.addEventListener('soutarah-notifications-updated', refresh);
    const interval = window.setInterval(refresh, 30000);
    return () => {
      window.removeEventListener('soutarah-notifications-updated', refresh);
      window.clearInterval(interval);
    };
  }, [loadDashboardData]);

  // Synchronize initial user & client values for Profile
  useEffect(() => {
    if (user && client) {
      setFormData({
        firstName: client.prenom || client.firstName || '',
        lastName: client.nom || client.lastName || '',
        email: user.email || '',
        phone: user.telephone || user.phone || '',
        address: client.adresse || client.address || '',
        companyName: client.entreprise?.nom || client.company?.name || '',
        responsibleName: client.entreprise?.nom_responsable || client.company?.responsibleName || '',
        identificationNumber: client.entreprise?.numero_identification || client.company?.identificationNumber || '',
        newPassword: '',
      });
    }
  }, [user, client]);

  const customerType = client?.type_client || client?.customerType || 'PARTICULIER';
  const fullName = customerType === 'ENTREPRISE'
    ? (client?.entreprise?.nom || client?.company?.name || 'Entreprise')
    : ([client?.prenom || client?.firstName, client?.nom || client?.lastName].filter(Boolean).join(' ') || 'Client SOUTARAH');

  const unreadNotifsCount = notifications.filter((n) => !(n.est_lu ?? n.isRead)).length;
  const pendingQuotesCount = quoteRequests.filter((q) => ['PENDING', 'ISSUED', 'CONTACTED'].includes(q.statut || q.status)).length;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      await updateProfile(formData);
      setSaveSuccess(true);
      setFormData((prev) => ({ ...prev, newPassword: '' }));
      setActiveModal(null);
      setTimeout(() => setSaveSuccess(false), 4500);
    } catch (err) {
      setSaveError(err.message || 'Impossible de mettre à jour vos informations.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkNotifAsRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { token, method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, est_lu: true, isRead: true } : n)));
      window.dispatchEvent(new Event('soutarah-notifications-updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllNotifsAsRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { token, method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, est_lu: true, isRead: true })));
      window.dispatchEvent(new Event('soutarah-notifications-updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteQuote = async (id) => {
    setDeletingQuoteId(id);
    try {
      await apiRequest(`/quote-requests/${id}`, { token, method: 'DELETE' });
      setQuoteRequests((prev) => prev.filter((q) => q.id !== id));
      if (selectedQuote?.id === id) setSelectedQuote(null);
      setConfirmDeleteId(null);
    } catch (e) {
      console.error('Erreur lors de la suppression du devis', e);
    } finally {
      setDeletingQuoteId(null);
    }
  };

  const handleDownloadQuotePdf = async (quote) => {
    // Si un devis signé existe, télécharger le fichier signé (nouvelle version)
    if (quote.fichier_devis_url) {
      window.open(`http://localhost:5000${quote.fichier_devis_url}`, '_blank', 'noopener,noreferrer');
      return;
    }

    // Sinon, générer le PDF
    setDownloadingQuoteId(quote.id);
    try {
      await generateQuotePdf({ quote, user, client });
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('❌ Erreur lors de la génération du PDF');
    } finally {
      setDownloadingQuoteId(null);
    }
  };

  const footerNavigation = (target) => navigateTo(target, target === 'home' ? { section: 'home' } : {});

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7f4] text-[#111827]">
      <Navbar activeTab="client" navigateTo={navigateTo} onOpenDevis={() => navigateTo('cart')} />

      <main className="flex-grow px-4 pb-24 pt-28 sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-5xl space-y-8">

          {/* Bandeau de bienvenue */}
          <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border border-primary/15">
            <AvatarUploader size="md" name={fullName} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Bienvenue sur votre espace</p>
              <h2 className="font-display text-xl font-extrabold text-[#111827]">
                Bonjour, {fullName} 👋
              </h2>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {pendingQuotesCount > 0 && (
                <button
                  onClick={() => setActiveTab('devis')}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-2 text-xs font-extrabold text-amber-700 hover:bg-amber-100 transition"
                  title="Devis en attente"
                >
                  <span className="material-symbols-outlined text-base">description</span>
                  {pendingQuotesCount} devis en attente
                </button>
              )}
              {unreadNotifsCount > 0 && (
                <button
                  onClick={() => setActiveTab('notifications')}
                  className="relative inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-4 py-2 text-xs font-extrabold text-red-700 hover:bg-red-100 transition"
                >
                  <span className="material-symbols-outlined text-base">notifications_active</span>
                  {unreadNotifsCount} nouvelle{unreadNotifsCount > 1 ? 's' : ''}
                  {unreadNotifsCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
                  )}
                </button>
              )}
              {unreadNotifsCount === 0 && (
                <button
                  onClick={() => setActiveTab('notifications')}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-50 border border-gray-200 px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 transition"
                  title="Notifications"
                >
                  <span className="material-symbols-outlined text-base">notifications_none</span>
                  Notifications
                </button>
              )}
            </div>
          </div>
          {activeTab === 'account' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col justify-between gap-4 border-b border-gray-200/80 pb-4 sm:flex-row sm:items-center">
                <div>
                  <h1 className="font-display text-2xl font-black tracking-tight text-[#111827] sm:text-3xl">
                    Votre compte
                  </h1>
                  <p className="mt-0.5 text-xs font-medium text-gray-500">
                    Consultez et modifiez les informations enregistrées sur votre compte SOUTARAH.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-[#143e22]">
                  <span className="h-2 w-2 rounded-full bg-[#69c33b]" />
                  Tarif {customerType === 'ENTREPRISE' ? 'Entreprise Pro' : 'Particulier'}
                </span>
              </div>

              {saveSuccess && (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 text-sm font-bold text-emerald-900 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-2xl text-[#69c33b]">check_circle</span>
                    <span>Vos modifications ont bien été enregistrées avec succès.</span>
                  </div>
                  <button onClick={() => setSaveSuccess(false)} className="text-emerald-800 hover:text-emerald-950">
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <ProfileCard
                  icon="person"
                  title={customerType === 'ENTREPRISE' ? 'INFORMATIONS ENTREPRISE' : 'INFORMATIONS PERSONNELLES'}
                  onEdit={() => setActiveModal('personal')}
                >
                  {customerType === 'PARTICULIER' ? (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Nom & Prénom</p>
                      <p className="mt-1 font-display text-lg font-bold text-[#111827]">{fullName}</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Raison Sociale</p>
                        <p className="mt-1 font-display text-lg font-bold text-[#111827]">{formData.companyName || fullName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Nom du Responsable</p>
                        <p className="mt-1 font-semibold text-[#111827]">{formData.responsibleName || 'Non renseigné'}</p>
                      </div>
                      {formData.identificationNumber && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">N° Identification (RCCM / DFU)</p>
                          <p className="mt-1 font-mono text-sm font-bold text-gray-700">{formData.identificationNumber}</p>
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Adresse Email</p>
                    <p className="mt-1 text-sm font-semibold text-gray-700">{formData.email}</p>
                  </div>
                </ProfileCard>

                <ProfileCard
                  icon="location_on"
                  title="ADRESSES & COORDONNÉES"
                  onEdit={() => setActiveModal('address')}
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Adresse de livraison par défaut</p>
                    <p className="mt-1 font-display text-base font-bold text-[#111827]">{fullName}</p>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-gray-600">
                      {formData.address || 'Aucune adresse enregistrée pour le moment.'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Numéro de Téléphone</p>
                    <p className="mt-1 text-sm font-extrabold text-[#143e22]">{formData.phone || 'Non renseigné'}</p>
                  </div>
                </ProfileCard>

                <ProfileCard
                  icon="lock"
                  title="SÉCURITÉ DU COMPTE"
                  onEdit={() => setActiveModal('security')}
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Mot de passe</p>
                  <p className="font-mono text-base font-bold text-gray-700">• • • • • • • • • •</p>
                  <p className="text-xs font-medium leading-relaxed text-gray-500">
                    Modifiez votre mot de passe pour garantir la sécurité continue de votre compte.
                  </p>
                </ProfileCard>

                <ProfileCard
                  icon="description"
                  title="OFFRES & DEVIS SOUTARAH"
                  noEdit
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Services & Fournitures</p>
                  <p className="font-display text-base font-bold text-[#111827]">Vos devis et réservations</p>
                  <p className="text-xs font-medium leading-relaxed text-gray-500">
                    Consultez votre panier ou parcourez le négoce pour solliciter un tarif personnalisé.
                  </p>
                  <button
                    onClick={() => navigateTo('cart')}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:underline"
                  >
                    <span>Voir mon panier</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </ProfileCard>
              </div>
            </div>
          )}

          {/* TAB 2: MES DEVIS (SYNCHRONIZÉ) */}
          {activeTab === 'devis' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col justify-between gap-4 border-b border-gray-200/80 pb-4 sm:flex-row sm:items-center">
                <div>
                  <h1 className="font-display text-2xl font-black tracking-tight text-[#111827] sm:text-3xl">
                    Mes devis ({quoteRequests.length})
                  </h1>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Suivez le statut de toutes vos demandes de devis enregistrées chez SOUTARAH GROUP.
                  </p>
                </div>
                <button
                  onClick={() => navigateTo('cart')}
                  className="shimmer-btn inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#1b4c00]"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Nouveau devis
                </button>
              </div>

              {loadingData ? (
                <div className="rounded-3xl border border-gray-200/80 bg-white p-12 text-center">
                  <p className="font-semibold text-gray-500">Chargement de vos devis en cours…</p>
                </div>
              ) : quoteRequests.length === 0 ? (
                <div className="rounded-[28px] border border-gray-200/80 bg-white p-10 text-center shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-3xl">description</span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-[#111827]">Aucune demande de devis enregistrée</h3>
                  <p className="mt-2 text-xs text-gray-500 max-w-md mx-auto">
                    Vous n'avez pas encore soumis de demande de devis. Parcourez nos services ou remplissez votre panier pour solliciter une proposition tarifaire.
                  </p>
                  <button
                    onClick={() => navigateTo('service', { slug: 'negoce' })}
                    className="mt-5 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#1b4c00]"
                  >
                    Voir le négoce
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {[...quoteRequests].sort((a, b) => new Date(b.cree_le) - new Date(a.cree_le)).map((quote) => (
                    <article
                      key={quote.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-[24px] border border-gray-200/90 bg-white p-6 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-3 py-0.5 font-mono text-xs font-extrabold text-primary">
                              {quote.reference || 'DEMANDE DE DEVIS'}
                            </span>
                            <StatusBadge status={quote.statut || quote.status} />
                            <span className="text-xs font-medium text-gray-400">
                              • {new Date(quote.cree_le || quote.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à {new Date(quote.cree_le || quote.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h3 className="mt-2.5 font-display text-lg font-bold text-[#111827]">
                            {quote.titre || quote.title}
                          </h3>
                          <p className="mt-1 text-xs font-semibold text-gray-500">
                            Service concerné : <span className="text-primary font-bold">{quote.service}</span>
                          </p>
                          {quote.description && (
                            <p className="mt-2 text-xs text-gray-600 line-clamp-2 leading-relaxed">
                              {quote.description}
                            </p>
                          )}
                          {quote.fichier_devis_url && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                                <span className="material-symbols-outlined text-xs">picture_as_pdf</span>
                                Devis signé disponible
                              </span>
                              <a
                                href={`http://localhost:5000${quote.fichier_devis_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-extrabold text-white transition hover:bg-emerald-700"
                              >
                                <span className="material-symbols-outlined text-xs">download</span>
                                Télécharger signé
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <div className="flex gap-2">
                            {/* Bouton Télécharger visible uniquement si devis non approuvé/signé */}
                            {!(quote.statut === 'APPROVED' || quote.statut === 'SENT' || quote.fichier_devis_url) && (
                              <button
                                onClick={() => handleDownloadQuotePdf(quote)}
                                disabled={downloadingQuoteId === quote.id}
                                className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                                title="Télécharger le devis"
                              >
                                {downloadingQuoteId === quote.id ? (
                                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
                                ) : (
                                  <span className="material-symbols-outlined text-sm">download</span>
                                )}
                                Télécharger
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedQuote(quote)}
                              className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-bold text-gray-700 transition hover:border-primary hover:bg-primary hover:text-white"
                            >
                              Détails
                            </button>
                          </div>
                          {confirmDeleteId === quote.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-red-600">Confirmer ?</span>
                              <button
                                onClick={() => handleDeleteQuote(quote.id)}
                                disabled={deletingQuoteId === quote.id}
                                className="rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-extrabold text-white transition hover:bg-red-700 disabled:opacity-60"
                              >
                                {deletingQuoteId === quote.id ? '…' : 'Oui'}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-full border border-gray-200 px-3 py-1.5 text-[10px] font-bold text-gray-600 hover:bg-gray-100"
                              >
                                Non
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(quote.id)}
                              className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-[10px] font-bold text-red-600 transition hover:bg-red-50"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                              Supprimer
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS (SYNCHRONIZÉ) */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col justify-between gap-4 border-b border-gray-200/80 pb-4 sm:flex-row sm:items-center">
                <div>
                  <h1 className="font-display text-2xl font-black tracking-tight text-[#111827] sm:text-3xl">
                    Mes notifications ({notifications.length})
                  </h1>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Restez informé des mises à jour de vos devis et de vos commandes.
                  </p>
                </div>
                {unreadNotifsCount > 0 && (
                  <button
                    onClick={handleMarkAllNotifsAsRead}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-base">done_all</span>
                    Tout marquer comme lu
                  </button>
                )}
              </div>

              {loadingData ? (
                <div className="rounded-3xl border border-gray-200/80 bg-white p-12 text-center">
                  <p className="font-semibold text-gray-500">Chargement de vos notifications en cours…</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="rounded-[28px] border border-gray-200/80 bg-white p-10 text-center shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <span className="material-symbols-outlined text-3xl">notifications_none</span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-[#111827]">Aucune notification pour le moment</h3>
                  <p className="mt-2 text-xs text-gray-500 max-w-md mx-auto">
                    Vous n'avez pas de nouvelle alerte. Les mises à jour concernant le traitement de vos demandes apparaîtront ici.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {notifications.map((notif) => {
                    const isRead = notif.est_lu ?? notif.isRead;
                    const createdAt = notif.cree_le || notif.createdAt;
                    const title = notif.titre || notif.title;
                    return (
                      <article
                        key={notif.id}
                        onClick={() => !isRead && handleMarkNotifAsRead(notif.id)}
                        className={`flex items-start gap-4 rounded-2xl border p-4 shadow-sm transition ${
                          isRead
                            ? 'border-gray-200 bg-white opacity-80'
                            : 'border-emerald-300 bg-emerald-50/60 shadow-md ring-1 ring-emerald-300/40'
                        }`}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isRead ? 'bg-gray-100 text-gray-500' : 'bg-primary text-white'
                        }`}>
                          <span className="material-symbols-outlined text-xl">
                            {notif.type === 'QUOTE_REQUEST_CREATED' ? 'description' : 'notifications'}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-display text-sm font-bold text-[#111827]">{title}</h4>
                            <span className="text-[10px] font-semibold text-gray-400">
                              {new Date(createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-gray-600">{notif.message}</p>
                        </div>

                        {!isRead && (
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary mt-1" title="Non lu" />
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* QUOTE DETAIL MODAL */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-4xl my-8 overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#173d23] to-green-700 px-6 py-4">
              <div>
                <span className="rounded-full bg-emerald-100/20 px-2.5 py-0.5 font-mono text-[10px] font-extrabold text-emerald-100">
                  {selectedQuote.reference || 'DEVIS'}
                </span>
                <h3 className="mt-1 font-display text-lg font-extrabold text-white">
                  {selectedQuote.titre || selectedQuote.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/20 hover:text-white transition"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="p-6">
              {/* Infos de la demande */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-gray-50 p-4 text-xs text-gray-700">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Service</p>
                  <p className="font-bold text-[#111827] mt-0.5">{selectedQuote.service}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Statut</p>
                  <div className="mt-0.5"><StatusBadge status={selectedQuote.statut || selectedQuote.status} /></div>
                </div>
                {selectedQuote.lieu && (
                  <div>
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Lieu</p>
                    <p className="font-medium text-gray-800 mt-0.5">{selectedQuote.lieu}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Date d'envoi</p>
                  <p className="font-medium text-gray-800 mt-0.5">
                    {new Date(selectedQuote.cree_le || selectedQuote.createdAt).toLocaleDateString('fr-FR')} à {new Date(selectedQuote.cree_le || selectedQuote.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {selectedQuote.budget && (
                  <div>
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Budget estimatif</p>
                    <p className="font-bold text-[#111827] mt-0.5">{selectedQuote.budget}</p>
                  </div>
                )}
                {selectedQuote.delai && (
                  <div>
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Délai souhaité</p>
                    <p className="font-bold text-[#111827] mt-0.5">{selectedQuote.delai}</p>
                  </div>
                )}
              </div>

              {/* Description de la demande */}
              {selectedQuote.description && (
                <div className="mt-6">
                  <p className="font-bold text-gray-900 mb-2 text-sm">Description de la demande :</p>
                  <p className="rounded-2xl border border-gray-200/80 bg-gray-50 p-4 text-xs leading-relaxed text-gray-600">
                    {selectedQuote.description}
                  </p>
                </div>
              )}

              {/* Actions de téléchargement */}
              <div className="mt-6">
                {(selectedQuote.statut === 'APPROVED' || selectedQuote.statut === 'SENT' || selectedQuote.fichier_devis_url) ? (
                  /* Devis approuvé/validé — uniquement le devis signé */
                  selectedQuote.fichier_devis_url ? (
                    <a
                      href={`http://localhost:5000${selectedQuote.fichier_devis_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                    >
                      <span className="material-symbols-outlined">picture_as_pdf</span>
                      Télécharger le devis signé
                    </a>
                  ) : (
                    <div className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-400">
                      <span className="material-symbols-outlined">hourglass_empty</span>
                      Devis signé en attente
                    </div>
                  )
                ) : (
                  /* Devis non encore approuvé — générer le PDF provisoire */
                  <button
                    onClick={() => handleDownloadQuotePdf(selectedQuote)}
                    disabled={downloadingQuoteId === selectedQuote.id}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                  >
                    {downloadingQuoteId === selectedQuote.id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
                    ) : (
                      <span className="material-symbols-outlined">download</span>
                    )}
                    Télécharger le devis (PDF)
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 bg-[#f9fbf9] px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setConfirmDeleteId(selectedQuote.id);
                  setSelectedQuote(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                Supprimer ce devis
              </button>
              <button
                onClick={() => setSelectedQuote(null)}
                className="rounded-full bg-primary px-6 py-2 text-xs font-bold text-white hover:bg-[#1b4c00]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL DIALOG FOR PROFILE */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-[#f7faf6] px-6 py-4 sm:px-8">
              <h3 className="font-display text-lg font-extrabold text-[#111827]">
                {activeModal === 'personal' && 'Modifier vos informations'}
                {activeModal === 'address' && 'Modifier vos coordonnées'}
                {activeModal === 'security' && 'Modifier le mot de passe'}
              </h3>
              <button
                onClick={() => { setActiveModal(null); setSaveError(''); }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {saveError && (
              <div className="mx-6 mt-4 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-700 sm:mx-8">
                {saveError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-4">
              {activeModal === 'personal' && (
                <>
                  {customerType === 'PARTICULIER' ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <ModalField label="Prénom" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                      <ModalField label="Nom de famille" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                    </div>
                  ) : (
                    <>
                      <ModalField label="Nom de l'entreprise" name="companyName" value={formData.companyName} onChange={handleInputChange} required />
                      <ModalField label="Nom du responsable" name="responsibleName" value={formData.responsibleName} onChange={handleInputChange} required />
                      <ModalField label="N° d'identification (RCCM / DFU)" name="identificationNumber" value={formData.identificationNumber} onChange={handleInputChange} />
                    </>
                  )}
                  <ModalField label="Adresse email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                </>
              )}

              {activeModal === 'address' && (
                <>
                  <ModalField label="Numéro de téléphone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
                  <ModalField label="Adresse de livraison / Siège" name="address" value={formData.address} onChange={handleInputChange} placeholder="Ex: Abidjan, Cocody Riviera 3" required />
                </>
              )}

              {activeModal === 'security' && (
                <>
                  <ModalField label="Nouveau mot de passe" name="newPassword" type="password" value={formData.newPassword} onChange={handleInputChange} minLength={8} placeholder="Au moins 8 caractères" required />
                </>
              )}

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setActiveModal(null); setSaveError(''); }}
                  className="rounded-full border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="shimmer-btn rounded-full bg-[#143e22] px-7 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-[#143e22]/20 hover:bg-[#1b4c00] active:scale-95 disabled:opacity-60 transition-all"
                >
                  {isSaving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer onNavClick={footerNavigation} />
    </div>
  );
}

function ProfileCard({ icon, title, onEdit, noEdit, children }) {
  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-[26px] border border-gray-200/90 bg-white shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      <div>
        <div className="flex items-center justify-between border-b border-gray-100 bg-[#f7faf6] px-6 py-4">
          <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#143e22]">
            <span className="material-symbols-outlined text-lg text-primary">{icon}</span>
            {title}
          </span>
          {!noEdit && (
            <button
              onClick={onEdit}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200/80 bg-white text-gray-700 shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-white"
            >
              <span className="material-symbols-outlined text-base">edit</span>
            </button>
          )}
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
      {!noEdit && (
        <div className="border-t border-gray-100 bg-[#f9fbf9] px-6 py-3.5">
          <button onClick={onEdit} className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary transition-colors hover:text-[#1b4c00]">
            <span>Modifier</span>
            <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const configs = {
    EN_ATTENTE: { label: 'En attente', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    EN_COURS: { label: 'En cours d’étude', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    TRAITE: { label: 'Devis traité', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    VALIDE: { label: 'Validé', color: 'bg-green-100 text-green-800 border-green-200' },
    REJETE: { label: 'Refusé', color: 'bg-red-100 text-red-800 border-red-200' },
    PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    ISSUED: { label: 'En attente', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    CONTACTED: { label: 'En cours d’étude', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    CONVERTED: { label: 'Devis traité', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    APPROVED: { label: 'Devis approuvé', color: 'bg-green-100 text-green-800 border-green-200' },
    REJECTED: { label: 'Devis refusé', color: 'bg-red-100 text-red-800 border-red-200' },
    SENT: { label: 'Devis envoyé', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    CANCELLED: { label: 'Annulé', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  };

  const config = configs[status] || { label: status || 'En attente', color: 'bg-gray-100 text-gray-700 border-gray-200' };

  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${config.color}`}>
      {config.label}
    </span>
  );
}

function ModalField({ label, name, type = 'text', value, onChange, required, placeholder, minLength }) {
  return (
    <label className="block text-xs font-bold text-gray-700">
      <span className="mb-1.5 block">{label}{required && ' *'}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        className="w-full rounded-2xl border border-gray-200 bg-[#f9fbf9] px-4 py-3 text-sm font-semibold text-[#111827] outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}