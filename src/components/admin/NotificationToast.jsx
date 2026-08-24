import { useEffect, useState } from 'react';

export default function NotificationToast({ notifications, onDismiss, onViewAll, onNavigate }) {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    // Réinitialiser les notifications visibles
    setVisibleNotifications([]);
    
    if (notifications && notifications.length > 0) {
      // Trier par date décroissante et afficher les 3 notifications les plus récentes
      const sorted = [...notifications].sort((a, b) => {
        const dateA = new Date(a.created_at || a.cree_le || 0);
        const dateB = new Date(b.created_at || b.cree_le || 0);
        return dateB - dateA;
      });
      // Afficher max 3 notifications les plus récentes
      const toShow = sorted.slice(0, 3);
      
      toShow.forEach((notif, index) => {
        setTimeout(() => {
          setVisibleNotifications(prev => {
            // Éviter les doublons
            if (prev.find(n => n.id === notif.id)) return prev;
            return [...prev, notif];
          });
          
          // Auto-dismiss après 6 secondes
          setTimeout(() => {
            removeNotification(notif.id);
          }, 6000);
        }, index * 600); // 600ms entre chaque notification
      });
    }
  }, [notifications]);

  const removeNotification = (id) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
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
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    // Pour les dates plus anciennes, afficher la date au format français complet (jour/mois/année)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getNavigationTarget = (type) => {
    switch (type) {
      case 'VEHICLE_REQUEST':
        return 'reservations';
      case 'CART_ITEM_ADDED':
        return 'catalog';
      case 'QUOTE_REQUEST':
        return 'quotes';
      case 'NEW_ORDER':
        return 'reservations';
      case 'NEW_CLIENT':
        return 'clients';
      default:
        return 'notifications';
    }
  };

  const handleNotificationClick = (notification) => {
    removeNotification(notification.id);
    const target = getNavigationTarget(notification.type);
    if (onNavigate) {
      onNavigate(target);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'VEHICLE_REQUEST':
        return 'directions_car';
      case 'CART_ITEM_ADDED':
        return 'shopping_cart';
      case 'QUOTE_REQUEST':
        return 'description';
      case 'NEW_ORDER':
        return 'receipt_long';
      case 'NEW_CLIENT':
        return 'person_add';
      default:
        return 'notifications_active';
    }
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className="pointer-events-auto animate-slide-down bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-3xl transition-all w-96"
          style={{
            animation: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="flex items-start gap-3 p-4">
            {/* Icône compacte */}
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-green-600 flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-white text-[20px]">
                  {getNotificationIcon(notification.type)}
                </span>
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
            </div>

            {/* Contenu compact */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {notification.titre}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-snug mt-1">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-gray-400 text-[16px]">close</span>
                </button>
              </div>

              {/* Footer minimaliste */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-gray-400 font-medium">
                  {formatTimeAgo(notification.created_at || notification.cree_le)}
                </span>
                <span className="text-[10px] text-gray-300">•</span>
                <span className="text-[10px] text-primary font-semibold">
                  Cliquez pour voir
                </span>
              </div>
            </div>
          </div>

          {/* Barre de progression fine */}
          <div className="h-0.5 bg-gray-100 relative overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary via-green-500 to-green-600"
              style={{
                animation: 'progress 6s linear',
              }}
            />
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}