import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';

const TYPE_CONFIG = {
  ALL: { label: 'Tous', color: 'bg-gray-600', icon: 'apps' },
  VEHICLE_REQUEST: { label: 'Demandes véhicules', color: 'bg-orange-500', icon: 'directions_car' },
  CART_ITEM_ADDED: { label: 'Ajouts panier', color: 'bg-green-500', icon: 'shopping_cart' },
  CART_VALIDATED: { label: 'Panier validé', color: 'bg-teal-500', icon: 'check_circle' },
  QUOTE_REQUEST_CREATED: { label: 'Devis créés', color: 'bg-blue-500', icon: 'description' },
  QUOTE_APPROVED: { label: 'Devis approuvés', color: 'bg-purple-500', icon: 'check_circle' },
  NEW_CLIENT: { label: 'Nouveaux clients', color: 'bg-emerald-500', icon: 'person_add' },
  NEW_RESERVATION: { label: 'Réservations', color: 'bg-amber-500', icon: 'event' },
  LOW_STOCK: { label: 'Stock faible', color: 'bg-red-500', icon: 'inventory_2' },
  OTHER: { label: 'Autres', color: 'bg-gray-400', icon: 'notifications' },
};

export default function AdminNotifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    fetchNotifications();
    const handleNotificationsUpdated = () => {
      fetchNotifications();
    };
    window.addEventListener('soutarah-notifications-updated', handleNotificationsUpdated);
    return () => window.removeEventListener('soutarah-notifications-updated', handleNotificationsUpdated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/admin/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, est_lu: true } : n))
      );
      window.dispatchEvent(new Event('soutarah-notifications-updated'));
    } catch (error) {
      console.error('Erreur marquage lu:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('http://localhost:5000/api/admin/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, est_lu: true })));
      window.dispatchEvent(new Event('soutarah-notifications-updated'));
    } catch (error) {
      console.error('Erreur marquage tout lu:', error);
    }
  };

  // Obtenir tous les types uniques dans les notifications
  const availableTypes = useMemo(() => {
    const types = [...new Set(notifications.map(n => n.type))];
    return types.filter(t => TYPE_CONFIG[t] && t !== 'ALL');
  }, [notifications]);

  const filteredNotifications = notifications.filter(notif => {
    if (filterStatus === 'unread' && notif.est_lu) return false;
    if (filterStatus === 'read' && !notif.est_lu) return false;
    if (typeFilter !== 'ALL' && notif.type !== typeFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.est_lu).length;

  const getNotificationIcon = (type) => {
    const config = TYPE_CONFIG[type];
    if (config) return config.icon;
    switch (type) {
      case 'VEHICLE_REQUEST': return 'directions_car';
      case 'CART_ITEM_ADDED': return 'shopping_cart';
      case 'VEHICLE_REQUEST_CONFIRMATION': return 'check_circle';
      case 'QUOTE_REQUEST_CREATED': return 'description';
      case 'QUOTE_APPROVED': return 'check_circle';
      case 'CART_VALIDATED': return 'description';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'VEHICLE_REQUEST': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'CART_ITEM_ADDED': return 'bg-green-50 text-green-600 border-green-200';
      case 'QUOTE_REQUEST_CREATED': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'QUOTE_APPROVED': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'CART_VALIDATED': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-extrabold text-gray-900">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes les notifications sont lues'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1b4c00]"
          >
            <span className="material-symbols-outlined text-base">done_all</span>
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Filtre statut */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">Toutes les notifications</option>
              <option value="unread">Non lues ({notifications.filter(n => !n.est_lu).length})</option>
              <option value="read">Lues</option>
            </select>
          </div>

          {/* Filtre type */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700">Type de notification</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">Tous les types ({notifications.length})</option>
              {availableTypes.map((type) => {
                const config = TYPE_CONFIG[type] || TYPE_CONFIG.OTHER;
                const count = notifications.filter(n => n.type === type).length;
                return (
                  <option key={type} value={type}>
                    {config.label} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des notifications */}
      {filteredNotifications.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300">notifications_off</span>
          <h3 className="mt-4 font-display text-xl font-bold text-gray-900">
            Aucune notification
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {filterStatus === 'unread' ? 'Toutes les notifications ont été lues' : 'Aucune notification pour le moment'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.est_lu && markAsRead(notif.id)}
              className={`rounded-xl border p-5 transition-all ${
                notif.est_lu 
                  ? 'bg-white border-gray-200 hover:shadow-sm cursor-default' 
                  : 'bg-blue-50/50 border-blue-200 hover:shadow-md cursor-pointer'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border ${getNotificationColor(notif.type)}`}>
                  <span className="material-symbols-outlined text-2xl">
                    {getNotificationIcon(notif.type)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        {notif.titre}
                        {!notif.est_lu && (
                          <span className="inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                        )}
                      </h4>
                      <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs text-gray-500">
                          {new Date(notif.cree_le).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
