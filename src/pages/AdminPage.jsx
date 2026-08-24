import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminClients from '../components/admin/AdminClients';
import AdminCatalog from '../components/admin/AdminCatalog';
import AdminReservations from '../components/admin/AdminReservations';
import AdminQuotes from '../components/admin/AdminQuotes';
import AdminProductRequests from '../components/admin/AdminProductRequests';
import AdminNotifications from '../components/admin/AdminNotifications';
import AdminAnnouncements from '../components/admin/AdminPromotions';
import AdminSettings from '../components/admin/AdminSettings';
import AdminReports from '../components/admin/AdminReports';
import AdminCompanyPricing from '../components/admin/AdminCompanyPricing';
import NotificationToast from '../components/admin/NotificationToast';

export default function AdminPage({ navigateTo }) {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    // Récupérer l'onglet sauvegardé ou 'dashboard' par défaut
    return localStorage.getItem('adminActiveTab') || 'dashboard';
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const [pendingQuotesCount, setPendingQuotesCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [appliedGlobalSearch, setAppliedGlobalSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchDataCache, setSearchDataCache] = useState({
    clients: [],
    produits: [],
    vehicules: [],
    devis: [],
    reservations: [],
    notifications: [],
  });

  // Sauvegarder l'onglet actif quand il change
  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    // Rediriger si pas admin
    if (user && user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      navigateTo('home');
    }
  }, [user, navigateTo]);

  // Charger le nombre de notifications non lues
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const unread = data.notifications?.filter(n => !n.est_lu) || [];
          setNotificationCount(unread.length);
          setUnreadNotifications(unread);
        }
      } catch (error) {
        console.error('Erreur chargement notifications:', error);
      }
    };

    if (token) {
      fetchNotificationCount();
      // Actualiser toutes les 30 secondes
      const interval = setInterval(fetchNotificationCount, 30000);
      // Actualiser immédiatement quand des notifications sont créées/lues
      const handleNotificationsUpdated = () => {
        setTimeout(fetchNotificationCount, 100);
      };
      // Actualiser quand l'onglet revient au premier plan
      const handleWindowFocus = () => {
        fetchNotificationCount();
      };
      window.addEventListener('soutarah-notifications-updated', handleNotificationsUpdated);
      window.addEventListener('focus', handleWindowFocus);
      return () => {
        clearInterval(interval);
        window.removeEventListener('soutarah-notifications-updated', handleNotificationsUpdated);
        window.removeEventListener('focus', handleWindowFocus);
      };
    }
  }, [token]);

  // Afficher les popups automatiquement quand il y a des notifications non lues
  useEffect(() => {
    if (unreadNotifications.length > 0) {
      // Afficher les toasts 300ms après le chargement
      const timer = setTimeout(() => {
        setShowNotificationPopup(true);

        // Cacher automatiquement après 5 secondes
        setTimeout(() => {
          setShowNotificationPopup(false);
        }, 5000);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [unreadNotifications.length]);

  // Charger le nombre de devis en attente
  useEffect(() => {
    const fetchPendingQuotes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/quotes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const pending = (data.quotes || []).filter(q => ['PENDING', 'ISSUED', 'CONTACTED'].includes(q.statut)).length;
          setPendingQuotesCount(pending);
        }
      } catch (error) {
        console.error('Erreur chargement devis en attente:', error);
      }
    };

    if (token) {
      fetchPendingQuotes();
      // Actualiser toutes les 30 secondes
      const interval = setInterval(fetchPendingQuotes, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    // Fermer le menu utilisateur quand on clique ailleurs
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Charger toutes les ressources pour la recherche globale
  useEffect(() => {
    const loadAllForSearch = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [clientsRes, productsRes, vehiclesRes, quotesRes, reservationsRes] = await Promise.all([
          fetch('http://localhost:5000/api/admin/clients', { headers }),
          fetch('http://localhost:5000/api/admin/products', { headers }),
          fetch('http://localhost:5000/api/admin/vehicles', { headers }),
          fetch('http://localhost:5000/api/admin/quotes', { headers }),
          fetch('http://localhost:5000/api/admin/reservations', { headers }),
        ]);

        const [clientsData, produitsData, vehiclesData, quotesData, reservationsData] = await Promise.all([
          clientsRes.ok ? clientsRes.json() : { clients: [] },
          produitsRes.ok ? produitsRes.json() : { products: [] },
          vehiclesRes.ok ? vehiclesRes.json() : { vehicles: [] },
          quotesRes.ok ? quotesRes.json() : { quotes: [] },
          reservationsRes.ok ? reservationsRes.json() : { reservations: [] },
        ]);

        setSearchDataCache({
          clients: clientsData.clients || [],
          produits: produitsData.products || [],
          vehicules: vehiclesData.vehicles || [],
          devis: quotesData.quotes || [],
          reservations: reservationsData.reservations || [],
          notifications: [],
        });
      } catch (error) {
        console.error('Erreur chargement données (recherche):', error);
      }
    };
    if (token) loadAllForSearch();
  }, [token]);

  // Normaliser le texte pour la recherche (insensible à la casse et aux accents)
  const normalizeSearchText = (value) =>
    String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // Filtrer toutes les ressources selon la recherche
  useEffect(() => {
    const q = normalizeSearchText(globalSearch);
    if (q.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = [];

    // Clients
    searchDataCache.clients.forEach((c) => {
      const displayName = normalizeSearchText(c.entreprise?.nom || `${c.prenom || ''} ${c.nom || ''}`);
      const email = normalizeSearchText(c.utilisateur?.email);
      const telephone = normalizeSearchText(c.utilisateur?.telephone);
      if (displayName.includes(q) || email.includes(q) || telephone.includes(q)) {
        results.push({
          type: 'client',
          id: `client-${c.id}`,
          tab: 'clients',
          title: c.entreprise?.nom || `${c.prenom || ''} ${c.nom || ''}`.trim() || 'Client',
          subtitle: `${c.utilisateur?.email || ''}${c.utilisateur?.telephone ? ' · ' + c.utilisateur.telephone : ''}`,
          searchDetail: c.utilisateur?.email || c.nom || '',
          icon: 'group',
          color: 'bg-purple-100 text-purple-600',
        });
      }
    });

    // Produits
    searchDataCache.produits.forEach((p) => {
      const nom = normalizeSearchText(p.nom);
      const reference = normalizeSearchText(p.reference);
      const categorie = normalizeSearchText(p.categorie?.nom);
      if (nom.includes(q) || reference.includes(q) || categorie.includes(q)) {
        results.push({
          type: 'produit',
          id: `produit-${p.id}`,
          tab: 'catalog',
          title: p.nom || 'Produit',
          subtitle: p.reference ? `Réf: ${p.reference}` : (p.categorie?.nom || ''),
          icon: 'inventory_2',
          color: 'bg-blue-100 text-blue-600',
          searchDetail: p.nom || p.reference || '',
        });
      }
    });

    // Véhicules
    searchDataCache.vehicules.forEach((v) => {
      const marque = normalizeSearchText(v.marque);
      const modele = normalizeSearchText(v.modele);
      const categorie = normalizeSearchText(v.categorie);
      if (`${marque} ${modele}`.includes(q) || categorie.includes(q)) {
        results.push({
          type: 'véhicule',
          id: `vehicule-${v.id}`,
          tab: 'catalog',
          title: `${v.marque || ''} ${v.modele || ''}`.trim() || 'Véhicule',
          subtitle: v.categorie || '',
          icon: 'directions_car',
          color: 'bg-orange-100 text-orange-600',
          searchDetail: `${v.marque || ''} ${v.modele || ''}`.trim(),
        });
      }
    });

    // Devis
    searchDataCache.devis.forEach((d) => {
      const nom = normalizeSearchText(d.nom);
      const email = normalizeSearchText(d.email);
      const reference = normalizeSearchText(d.reference);
      const titre = normalizeSearchText(d.titre);
      if (nom.includes(q) || email.includes(q) || reference.includes(q) || titre.includes(q)) {
        results.push({
          type: 'devis',
          id: `devis-${d.id}`,
          tab: 'quotes',
          title: d.reference ? `Devis ${d.reference}` : 'Devis',
          subtitle: `${d.nom || ''}${d.email ? ' · ' + d.email : ''}`,
          icon: 'description',
          color: 'bg-emerald-100 text-emerald-600',
          searchDetail: d.reference || d.nom || d.email || '',
        });
      }
    });

    // Réservations
    searchDataCache.reservations.forEach((r) => {
      const clientName = normalizeSearchText(r.client?.nom || r.nom || r.clientNom || '');
      const véhicule = normalizeSearchText(`${r.vehicle?.marque || ''} ${r.vehicle?.modele || ''} ${r.vehicleName || ''}`);
      if (clientName.includes(q) || véhicule.includes(q)) {
        results.push({
          type: 'réservation',
          id: `res-${r.id}`,
          tab: 'reservations',
          title: `${r.client?.nom || r.nom || 'Client'} - ${r.vehicle?.marque || r.vehicleName || 'Véhicule'}`,
          subtitle: `${r.commence_le || ''} → ${r.termine_le || ''}`,
          icon: 'event',
          color: 'bg-red-100 text-red-600',
          searchDetail: `${r.client?.nom || r.nom || ''} ${r.vehicle?.marque || r.vehicleName || ''}`,
        });
      }
    });

    setSearchResults(results.slice(0, 20));
    setShowSearchResults(true);
  }, [globalSearch, searchDataCache]);

  const handleSelectResult = (result) => {
    setGlobalSearch('');
    setShowSearchResults(false);
    setAppliedGlobalSearch(result.searchDetail || result.title);
    setActiveTab(result.tab);
    // Passer la recherche au composant cible via un événement personnalisé
    window.dispatchEvent(new CustomEvent('soutarah-admin-search', { detail: result.searchDetail || result.title }));
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
    return null;
  }

  const menuItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Tableau de bord', badge: null },
    { id: 'clients', icon: 'group', label: 'Clients', badge: null },
    { id: 'catalog', icon: 'inventory_2', label: 'Catalogue', badge: null },
    { id: 'company-pricing', icon: 'price_change', label: 'Prix entreprises', badge: null },
    { id: 'quotes', icon: 'description', label: 'Devis', badge: pendingQuotesCount },
    { id: 'reservations', icon: 'event', label: 'Réservations', badge: null },
    { id: 'promotions', icon: 'campaign', label: 'Annonces', badge: null },
    { id: 'reports', icon: 'assessment', label: 'Rapports', badge: null },
    { id: 'settings', icon: 'settings', label: 'Paramètres', badge: null },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard onNavigate={setActiveTab} />;
      case 'clients':
        return <AdminClients />;
      case 'catalog':
        return <AdminCatalog />;
      case 'company-pricing':
        return <AdminCompanyPricing />;
      case 'reservations':
        return <AdminReservations />;
      case 'quotes':
        return <AdminQuotes />;
      case 'product-requests':
        return <AdminProductRequests />;
      case 'promotions':
        return <AdminAnnouncements />;
      case 'notifications':
        return <AdminNotifications />;
      case 'settings':
        return <AdminSettings navigateTo={navigateTo} />;
      case 'reports':
        return <AdminReports />;
      default:
        return <AdminDashboard />;
    }
  };

  const userName = user?.email?.split('@')[0] || 'Admin';

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden font-sans">
      {/* Notification Toasts - Affichés au clic sur l'icône cloche */}
      {showNotificationPopup && unreadNotifications && unreadNotifications.length > 0 && (
        <NotificationToast
          notifications={unreadNotifications}
          onDismiss={() => setShowNotificationPopup(false)}
          onViewAll={() => {
            setShowNotificationPopup(false);
            setActiveTab('notifications');
          }}
          onNavigate={(tab) => {
            setShowNotificationPopup(false);
            setActiveTab(tab);
          }}
        />
      )}

      {/* Sidebar - Avec logo en haut */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo SOUTARAH aligné avec le header - DESCENDU de 1cm total */}
        <div className="h-[72px] px-4 pt-4 border-b border-gray-100 flex items-center justify-center">
          <img
            src="/logo-soutarah.png"
            alt="SOUTARAH GROUP"
            className="w-full h-auto max-w-[200px] object-contain"
          />
        </div>

        {/* Menu Navigation - DESCENDU de 2.5cm total */}
        <nav className="flex-1 px-3 pt-10 pb-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative w-full flex items-center gap-3 px-4 py-2 mb-1 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile at bottom - TRÈS RAPPROCHÉ */}
        <div className="p-2 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {user?.avatar_url ? (
              <img
                src={`http://localhost:5000${user.avatar_url}`}
                alt={userName}
                className="h-10 w-10 rounded-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div
              className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center"
              style={user?.avatar_url ? { display: 'none' } : {}}
            >
              <span className="text-white font-bold text-sm">{userName?.charAt(0)?.toUpperCase() || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Admin SOUTARAH</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header - Avec barre de recherche */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-4">
            {/* Gauche : Barre de recherche */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Rechercher un client, un email, un téléphone..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  onFocus={() => { if (globalSearch.trim().length >= 2) setShowSearchResults(true); }}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />

                {/* Dropdown Résultats - Recherche globale toutes pages */}
                {showSearchResults && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                    {searchResults.length > 0 ? (
                      <div className="max-h-80 overflow-y-auto">
                        {searchResults.map((result) => (
                          <button
                            key={result.id}
                            onMouseDown={(e) => { e.preventDefault(); handleSelectResult(result); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${result.color}`}>
                              <span className="material-symbols-outlined text-lg">{result.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{result.title}</p>
                              <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600 uppercase shrink-0">
                              {result.type}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        Aucun résultat pour « {globalSearch} »
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Droite : Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button 
                onClick={() => {
                  setShowNotificationPopup(true);
                  setActiveTab('notifications');
                }}
                className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {notificationCount > 0 && (
                  <>
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  </>
                )}
              </button>

              {/* Dark Mode Toggle */}
              <button 
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Mode sombre"
              >
                <span className="material-symbols-outlined text-[22px]">dark_mode</span>
              </button>

              {/* User Avatar avec dropdown */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  {user?.avatar_url ? (
                    <img
                      src={`http://localhost:5000${user.avatar_url}`}
                      alt="Avatar"
                      className="h-9 w-9 rounded-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div
                    className="h-9 w-9 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-sm"
                    style={user?.avatar_url ? { display: 'none' } : {}}
                  >
                    {userName?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">Admin SOUTARAH</p>
                    <p className="text-xs text-gray-500">Administrateur</p>
                  </div>
                  <span className={`material-symbols-outlined text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {/* Dropdown Menu - SIMPLIFIÉ */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                    {/* Profil */}
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <span className="material-symbols-outlined text-[20px] text-gray-700">person</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900">Profil</p>
                        <p className="text-xs text-gray-500 mt-0.5">Informations personnelles</p>
                      </div>
                    </button>

                    {/* Notifications */}
                    <button
                      onClick={() => {
                        setActiveTab('notifications');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <span className="material-symbols-outlined text-[20px] text-gray-700">notifications</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900">Notifications</p>
                        <p className="text-xs text-gray-500 mt-0.5">Préférences de notification</p>
                      </div>
                    </button>

                    <div className="border-t border-gray-100 my-2"></div>

                    {/* Déconnexion */}
                    <button
                      onClick={() => {
                        if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                          logout();
                          if (navigateTo) navigateTo('home');
                          else window.location.href = '/';
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      <span className="text-sm font-semibold">Se déconnecter</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6 bg-[#f8f9fa]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
