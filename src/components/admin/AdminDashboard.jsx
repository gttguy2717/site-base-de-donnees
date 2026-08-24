import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminDashboard({ onNavigate }) {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    clients: { total: 0, nouveau: 0 },
    devis: { total: 0, enAttente: 0 },
    reservations: { total: 0, enCours: 0 },
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les vraies stats depuis l'API
      const statsResponse = await fetch('/api/admin/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        // S'assurer que la structure est complète
        setStats({
          clients: data.stats?.clients || { total: 0, nouveau: 0 },
          devis: data.stats?.devis || { total: 0, enAttente: 0 },
          reservations: data.stats?.reservations || { total: 0, enCours: 0 },
        });
      }

      // Charger l'activité récente depuis les notifications
      const activityResponse = await fetch('/api/admin/notifications?limit=5', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        // Formatter les notifications pour l'activité récente
        const activities = (activityData.notifications || []).slice(0, 4).map(notif => ({
          id: notif.id,
          type: notif.type,
          message: notif.titre,
          time: formatTimeAgo(notif.cree_le),
          icon: getActivityIcon(notif.type),
          color: getActivityColor(notif.type),
          targetTab: getActivityTargetTab(notif.type),
        }));
        setRecentActivity(activities);
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays} jours`;
  };

  const getActivityIcon = (type) => {
    const icons = {
      'VEHICLE_REQUEST': 'directions_car',
      'CART_ITEM_ADDED': 'shopping_cart',
      'QUOTE_REQUEST': 'description',
      'NEW_ORDER': 'receipt_long',
      'NEW_CLIENT': 'person_add',
      'QUOTE_APPROVED': 'check_circle',
    };
    return icons[type] || 'notifications';
  };

  const getActivityColor = (type) => {
    const colors = {
      'VEHICLE_REQUEST': 'orange',
      'CART_ITEM_ADDED': 'green',
      'QUOTE_REQUEST': 'blue',
      'NEW_ORDER': 'purple',
      'NEW_CLIENT': 'green',
      'QUOTE_APPROVED': 'green',
    };
    return colors[type] || 'gray';
  };

  // Déterminer l'onglet cible pour chaque type d'activité
  const getActivityTargetTab = (type) => {
    const tabs = {
      'VEHICLE_REQUEST': 'reservations',
      'CART_ITEM_ADDED': 'catalog',
      'QUOTE_REQUEST': 'quotes',
      'NEW_ORDER': 'quotes',
      'NEW_CLIENT': 'clients',
      'QUOTE_APPROVED': 'quotes',
    };
    return tabs[type] || 'dashboard';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistiques principales - 3 cartes */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Clients</p>
              <p className="mt-3 font-display text-4xl font-extrabold text-gray-900">{stats.clients.total}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold bg-green-100 text-green-800">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  +{stats.clients.nouveau}
                </span>
                <span className="text-xs text-gray-500">ce mois</span>
              </div>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100">
              <span className="material-symbols-outlined text-3xl text-purple-600">group</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Devis</p>
              <p className="mt-3 font-display text-4xl font-extrabold text-gray-900">{stats.devis.total}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold bg-orange-100 text-orange-800">
                  {stats.devis.enAttente}
                </span>
                <span className="text-xs text-gray-500">en attente</span>
              </div>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
              <span className="material-symbols-outlined text-3xl text-blue-600">description</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Réservations</p>
              <p className="mt-3 font-display text-4xl font-extrabold text-gray-900">{stats.reservations.total}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold bg-orange-100 text-orange-800">
                  {stats.reservations.enCours}
                </span>
                <span className="text-xs text-gray-500">en cours</span>
              </div>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
              <span className="material-symbols-outlined text-3xl text-orange-600">directions_car</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activité récente */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="font-display text-xl font-extrabold text-gray-900">Activité récente</h3>
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => onNavigate && onNavigate(activity.targetTab)}
                  className="w-full flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-gray-100 hover:border-primary/30 transition-colors text-left cursor-pointer"
                  title="Cliquer pour voir"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    activity.color === 'orange' ? 'bg-orange-100' :
                    activity.color === 'blue' ? 'bg-blue-100' :
                    activity.color === 'green' ? 'bg-green-100' :
                    activity.color === 'purple' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    <span className={`material-symbols-outlined text-xl ${
                      activity.color === 'orange' ? 'text-orange-600' :
                      activity.color === 'blue' ? 'text-blue-600' :
                      activity.color === 'green' ? 'text-green-600' :
                      activity.color === 'purple' ? 'text-purple-600' :
                      'text-gray-600'
                    }`}>{activity.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{activity.message}</p>
                    <p className="mt-1 text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 self-center">chevron_right</span>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-5xl text-gray-300">history</span>
                <p className="mt-2 text-sm text-gray-500">Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>

        {/* Alertes et actions rapides */}
        <div className="space-y-6">
          {/* Alertes */}
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-orange-600">warning</span>
              <h3 className="font-display text-lg font-extrabold text-orange-900">Alertes</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate && onNavigate('quotes')}
                className="w-full rounded-xl bg-white p-3 text-sm text-left hover:bg-orange-100 transition-colors cursor-pointer"
              >
                <p className="font-bold text-orange-900">{stats.devis.enAttente} devis</p>
                <p className="text-xs text-orange-700 mt-1">En attente de traitement</p>
              </button>
              <button
                onClick={() => onNavigate && onNavigate('reservations')}
                className="w-full rounded-xl bg-white p-3 text-sm text-left hover:bg-orange-100 transition-colors cursor-pointer"
              >
                <p className="font-bold text-orange-900">{stats.reservations.enCours} réservations</p>
                <p className="text-xs text-orange-700 mt-1">En cours de traitement</p>
              </button>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-display text-lg font-extrabold text-gray-900">Actions rapides</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate && onNavigate('catalog')}
                className="w-full flex items-center gap-3 rounded-xl bg-primary hover:bg-[#1b4c00] px-4 py-3 text-left text-sm font-bold text-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">add_circle</span>
                Ajouter un produit
              </button>
              <button
                onClick={() => onNavigate && onNavigate('catalog')}
                className="w-full flex items-center gap-3 rounded-xl border border-gray-200 hover:bg-gray-50 px-4 py-3 text-left text-sm font-bold text-gray-900 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">directions_car</span>
                Ajouter un véhicule
              </button>
              <button
                onClick={() => onNavigate && onNavigate('promotions')}
                className="w-full flex items-center gap-3 rounded-xl border border-gray-200 hover:bg-gray-50 px-4 py-3 text-left text-sm font-bold text-gray-900 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">local_offer</span>
                Créer une promotion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique de ventes */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-xl font-extrabold text-gray-900">Évolution des ventes</h3>
          <select className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700">
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
            <option>3 derniers mois</option>
          </select>
        </div>
        <div className="flex h-64 items-end justify-around gap-2 border-b border-gray-200 pb-4">
          {[45, 78, 52, 89, 67, 95, 72].map((height, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-primary hover:bg-[#1b4c00] transition-colors cursor-pointer"
                style={{ height: `${height}%` }}
                title={`${height}% de l'objectif`}
              />
              <span className="text-xs font-semibold text-gray-500">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][index]}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="font-semibold text-gray-600">Ventes réalisées</span>
          </div>
        </div>
      </div>
    </div>
  );
}