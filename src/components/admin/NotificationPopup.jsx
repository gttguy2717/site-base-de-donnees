import { useEffect, useState } from 'react';

export default function NotificationPopup({ notifications, onClose, onViewAll }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Animation d'entrée après un court délai
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Vérification de sécurité - APRÈS les hooks
  if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
    return null;
  }

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleViewAll = () => {
    setIsClosing(true);
    setTimeout(() => {
      onViewAll();
    }, 300);
  };

  // Limiter aux 5 dernières notifications
  const displayedNotifications = notifications.slice(0, 5);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'VEHICLE_REQUEST':
        return 'local_shipping';
      case 'CART_ITEM_ADDED':
        return 'shopping_cart';
      case 'QUOTE_REQUEST':
        return 'description';
      case 'NEW_ORDER':
        return 'receipt_long';
      case 'NEW_CLIENT':
        return 'person_add';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'VEHICLE_REQUEST':
        return 'bg-blue-100 text-blue-600';
      case 'CART_ITEM_ADDED':
        return 'bg-green-100 text-green-600';
      case 'QUOTE_REQUEST':
        return 'bg-purple-100 text-purple-600';
      case 'NEW_ORDER':
        return 'bg-orange-100 text-orange-600';
      case 'NEW_CLIENT':
        return 'bg-pink-100 text-pink-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return notifDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <>
      {/* Backdrop avec blur */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className={`fixed top-20 right-8 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden transition-all duration-300 ${
          isVisible && !isClosing
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-green-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-white text-[24px]">
                  notifications_active
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Nouvelles notifications</h3>
                <p className="text-sm text-white/80">
                  {notifications.length} notification{notifications.length > 1 ? 's' : ''} non lue{notifications.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-white text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Liste des notifications */}
        <div className="max-h-[400px] overflow-y-auto">
          {displayedNotifications.map((notification, index) => (
            <div
              key={notification.id}
              className={`px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                index !== displayedNotifications.length - 1 ? 'border-b border-gray-100' : ''
              }`}
              onClick={handleViewAll}
            >
              <div className="flex items-start gap-3">
                {/* Icône */}
                <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {getNotificationIcon(notification.type)}
                  </span>
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {notification.titre}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {formatTime(notification.created_at)}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                    <span className={`text-xs font-medium ${
                      notification.priorite === 'HAUTE' ? 'text-red-600' :
                      notification.priorite === 'MOYENNE' ? 'text-orange-600' :
                      'text-gray-600'
                    }`}>
                      {notification.priorite === 'HAUTE' ? 'Urgent' :
                       notification.priorite === 'MOYENNE' ? 'Moyen' : 'Normal'}
                    </span>
                  </div>
                </div>

                {/* Badge non lu */}
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleViewAll}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            <span>Voir toutes les notifications</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>

        {/* Animation sonore visuelle */}
        <div className="absolute top-2 right-2">
          <div className="relative">
            <div className="h-3 w-3 bg-primary rounded-full animate-ping"></div>
            <div className="h-3 w-3 bg-primary rounded-full absolute top-0 left-0"></div>
          </div>
        </div>
      </div>
    </>
  );
}