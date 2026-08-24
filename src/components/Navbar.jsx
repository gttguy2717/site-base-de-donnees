import React, { useState, useEffect, useRef } from 'react';
import SoutarahLogo from './SoutarahLogo';
import { SERVICES_DATA } from '../data/servicesData';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../lib/api';

function AccountButton({ icon, label, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm font-semibold text-[#1a1c1c] transition hover:bg-[#f2f7ef] hover:text-primary"
    >
      <span className="material-symbols-outlined text-[20px] text-primary">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-black leading-none text-white shadow-sm">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

export default function Navbar({ onOpenDevis, activeTab = 'home', setActiveTab, navigateTo }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [tickerBarHeight, setTickerBarHeight] = useState(34);

  const { user, client, token, logout } = useAuth();
  const isClient = user?.role === 'CLIENT';
  const accountName = client?.company?.name || client?.firstName || user?.email?.split('@')[0] || 'Mon compte';

  const servicesTimeoutRef = useRef(null);

  const handleServicesMouseEnter = () => {
    if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
    setServicesMenuOpen(true);
  };

  const handleServicesMouseLeave = () => {
    servicesTimeoutRef.current = setTimeout(() => {
      setServicesMenuOpen(false);
    }, 200);
  };

  const openAccountSection = (destination, options = {}) => {
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    if (navigateTo) navigateTo(destination, options);
  };

  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  useEffect(() => {
    const refreshCartCount = async () => {
      let count = 0;
      
      // Count vehicle items from localStorage with user-specific key
      try {
        const userId = user?.id || user?.userId || 'guest';
        const cartKey = `soutarah_vehicle_cart_${userId}`;
        const vehicleCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        if (Array.isArray(vehicleCart)) {
          count += vehicleCart.length;
        }
      } catch (error) {
        console.warn('Failed to load vehicle cart from localStorage:', error);
      }

      // Count product items from API (for logged in clients)
      if (token && isClient) {
        try {
          const res = await apiRequest('/cart', { token });
          if (res?.cart?.items && Array.isArray(res.cart.items)) {
            count += res.cart.items.reduce((acc, item) => acc + (Number(item.quantite || item.quantity) || 1), 0);
          }
        } catch (error) {
          console.warn('Failed to fetch cart from API:', error);
        }
      }

      setCartCount(count);
    };

    const refreshNotifsCount = async () => {
      if (!token || !isClient) {
        setUnreadNotifsCount(0);
        return;
      }

      try {
        const res = await apiRequest('/notifications/my', { token });
        if (res && Array.isArray(res.notifications)) {
          // Ensure consistent property checking for read status
          const unread = res.notifications.filter((n) => {
            const isRead = n.est_lu || n.isRead || false;
            return !isRead;
          }).length;
          setUnreadNotifsCount(unread);
        } else {
          console.warn('Notifications API returned unexpected format:', res);
          setUnreadNotifsCount(0);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setUnreadNotifsCount(0);
      }
    };

    // Initial load
    refreshCartCount();
    refreshNotifsCount();
    
    // Event listeners for real-time updates
    const handleCartUpdate = () => {
      refreshCartCount();
    };
    
    const handleNotificationUpdate = () => {
      // Immediate refresh when notifications are updated
      setTimeout(refreshNotifsCount, 100);
    };

    const handleWindowFocus = () => {
      refreshCartCount();
      refreshNotifsCount();
    };
    
    window.addEventListener('soutarah-cart-updated', handleCartUpdate);
    window.addEventListener('soutarah-notifications-updated', handleNotificationUpdate);
    window.addEventListener('focus', handleWindowFocus);
    
    // Periodic refresh for notifications (every 30 seconds)
    const notifInterval = window.setInterval(refreshNotifsCount, 30000);
    
    return () => {
      window.removeEventListener('soutarah-cart-updated', handleCartUpdate);
      window.removeEventListener('soutarah-notifications-updated', handleNotificationUpdate);
      window.removeEventListener('focus', handleWindowFocus);
      window.clearInterval(notifInterval);
    };
  }, [isClient, token, user]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Charger les annonces et la hauteur de barre de la barre défilante
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/announcements');
        if (response.ok) {
          const data = await response.json();
          setAnnouncements((data.announcements || []).filter(a => a.enabled && a.text));
          if (data.barHeight) {
            setTickerBarHeight(Number(data.barHeight));
          }
        }
      } catch (error) {
        console.warn('Erreur chargement annonces:', error);
      }
    };
    loadAnnouncements();
    const interval = setInterval(loadAnnouncements, 30000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Accueil' },
    { id: 'about', label: 'À Propos' },
    { id: 'services', label: 'Services' },
    { id: 'careers', label: 'Carrières' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    setServicesMenuOpen(false);

    if (navigateTo) {
      navigateTo(id, id === 'home' ? { section: 'home' } : {});
      return;
    }

    if (setActiveTab) setActiveTab(id);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleServiceClick = (serviceId) => {
    setMobileMenuOpen(false);
    setServicesMenuOpen(false);

    if (navigateTo) {
      navigateTo('service', { slug: serviceId });
      return;
    }

    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled
        ? 'glass-nav shadow-md'
        : (activeTab === 'about' || activeTab === 'services')
          ? 'glass-nav-muted'
          : 'bg-transparent'
    }`}>

      {/* ── Announcement Ticker Bar (uniquement les annonces modifiables depuis Admin → Annonces) ── */}
      {announcements.length > 0 && (
        (() => {
          const doubled = [...announcements, ...announcements];
          return (
            <div className="ticker-bar w-full overflow-hidden" style={{ height: `${tickerBarHeight}px` }}>
              <div className="ticker-track whitespace-nowrap items-center h-full">
                {doubled.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 px-7 tracking-[0.14em] uppercase"
                    style={{
                      color: item.color === 'transparent' ? '#111827' : '#ffffff',
                      backgroundColor: item.color === 'transparent' ? 'transparent' : (item.color || '#173d23'),
                      fontSize: item.textSize === 'text-xs' ? '12px' : item.textSize === 'text-sm' ? '14px' : item.textSize === 'text-base' ? '16px' : '11px',
                      fontWeight: item.fontStyle?.includes('bold') ? '700' : '400',
                      fontStyle: item.fontStyle?.includes('italic') ? 'italic' : 'normal',
                      letterSpacing: item.fontStyle?.includes('tracking') ? '0.14em' : '0.06em',
                    }}
                  >
                    {item.sticker && <span className="text-sm shrink-0">{item.sticker}</span>}
                    {item.text}
                    <span className={`ml-4 font-thin text-xs select-none ${item.color === 'transparent' ? 'text-gray-300' : 'text-white/30'}`}>◆</span>
                  </span>
                ))}
              </div>
            </div>
          );
        })()
      )}

      <div className={`max-w-[1280px] mx-auto px-4 sm:px-8 flex justify-between items-center h-20 overflow-visible transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
        {/* Brand Logo - Significantly enlarged for high visibility */}
        <a href="#home" onClick={(event) => { event.preventDefault(); handleNavClick('home'); }} className="flex items-center group py-1">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5On9rw8OLuaB7owzau_MEA7XckceJ1pJD4iDN7UKrk1ayBM9LmnY7drgOrBPT_NcNn2jbEwmkTX77ZKPhN_odfdY974twxlOQLl3A_kfoRD9hoe5-IRQWLRmc9cTFevdrVvnedeB4ar0ArwIbGjKd5fWpWpOHsjC2HRKSIIP08qGIp7OAtDaGaLi2abCnlIv-Bsvg1lJP2ff8vONnDC2gbTyMQX4JIrewNrW-SPCrp5xEXohaV0We-SbC1YjAAIL8QwU"
            alt="SOUTARAH GROUP"
            className="h-40 sm:h-44 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-sm"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div style={{ display: 'none' }}>
            <SoutarahLogo className="h-40 sm:h-44" />
          </div>
        </a>

        {/* Desktop Navigation Links matching Image 2 */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            const linkClass = `text-base font-semibold transition-all duration-200 relative py-1 ${
              isActive
                ? 'text-primary border-b-2 border-primary pb-0.5 font-bold'
                : 'text-[#1a1c1c]/80 hover:text-primary'
            }`;

            if (link.id !== 'services') {
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={linkClass}
                >
                  {link.label}
                </button>
              );
            }

            return (
              <div
                key={link.id}
                className="relative py-2"
                onMouseEnter={handleServicesMouseEnter}
                onMouseLeave={handleServicesMouseLeave}
              >
                <div className="flex items-center gap-0.5">
                  <button onClick={() => handleNavClick('services')} className={linkClass}>
                    Services
                  </button>
                  <button
                    type="button"
                    onClick={() => setServicesMenuOpen((isOpen) => !isOpen)}
                    aria-label="Ouvrir le sous-menu Services"
                    aria-expanded={servicesMenuOpen}
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                      isActive ? 'text-primary hover:bg-primary/10' : 'text-[#1a1c1c]/70 hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${servicesMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                </div>

                {servicesMenuOpen && (
                  <div
                    onMouseEnter={handleServicesMouseEnter}
                    onMouseLeave={handleServicesMouseLeave}
                    className="absolute left-1/2 top-full z-[60] pt-2 w-[640px] -translate-x-1/2 animate-fadeIn"
                  >
                    <div className="rounded-[26px] border border-gray-200/90 bg-white p-3 shadow-2xl shadow-[#143e22]/15">
                      <div className="flex items-center justify-between border-b border-gray-100 px-3 pb-3 pt-1">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Nos expertises</p>
                          <p className="mt-0.5 text-sm font-bold text-[#111827]">Choisissez un domaine d’intervention</p>
                        </div>
                        <button onClick={() => handleNavClick('services')} className="rounded-full bg-[#f2f7ef] px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white">
                          Tous les services
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 p-2">
                        {SERVICES_DATA.map((service) => (
                          <button
                            key={service.id}
                            onClick={() => handleServiceClick(service.id)}
                            className="group flex items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-[#f2f7ef]"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                              <span className="material-symbols-outlined text-[20px]">{service.icon}</span>
                            </span>
                            <span>
                              <span className="block text-sm font-bold text-[#1a1c1c] transition-colors group-hover:text-primary">{service.title}</span>
                              <span className="mt-0.5 block text-[11px] font-medium text-gray-500">{service.eyebrow}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Notification Bell — visible pour les clients connectés */}
          {isClient && (
            <button
              onClick={() => navigateTo('client', { tab: 'notifications' })}
              className="relative inline-flex items-center justify-center rounded-full border border-primary/20 bg-white/90 px-3.5 py-2.5 text-sm font-bold text-[#30343b] shadow-sm transition hover:border-primary hover:bg-white active:scale-95"
              title="Mes notifications"
              aria-label="Mes notifications"
            >
              <span className="material-symbols-outlined text-[21px] text-primary">notifications</span>
              {unreadNotifsCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[17px] items-center justify-center rounded-full bg-red-600 px-1 text-[9.5px] font-black leading-none text-white ring-2 ring-white shadow-sm">
                  {unreadNotifsCount > 99 ? '99+' : unreadNotifsCount}
                </span>
              )}
            </button>
          )}

          {/* Cart Button — visible uniquement pour les clients connectés */}
          {isClient && (
            <button
              onClick={() => navigateTo('cart')}
              className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-white/90 px-4 py-2 text-sm font-bold text-[#30343b] shadow-sm transition hover:border-primary hover:bg-white active:scale-95"
              title="Voir mon panier"
            >
              <div className="relative flex items-center justify-center">
                <span className="material-symbols-outlined text-[21px] text-primary">shopping_cart</span>
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-[17px] items-center justify-center rounded-full bg-red-600 px-1 text-[9.5px] font-black leading-none text-white ring-2 ring-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="ml-0.5">Panier</span>
            </button>
          )}

          {user ? (
            <div className="relative">
              {/* Pastille notifications sur le bouton Bonjour */}
              <button
                onClick={() => setAccountMenuOpen((open) => !open)}
                aria-expanded={accountMenuOpen}
                className="relative inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/85 px-4 py-2.5 text-sm font-bold text-[#30343b] shadow-sm transition hover:border-primary hover:bg-white"
              >
                {user?.avatar_url ? (
                  <img
                    src={`http://localhost:5000${user.avatar_url}`}
                    alt={accountName}
                    className="h-8 w-8 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <span className="material-symbols-outlined text-[21px] text-primary">account_circle</span>
                )}
                <span className="max-w-32 truncate">Bonjour, {accountName}</span>
                <span className={`material-symbols-outlined text-[18px] transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 top-full z-[70] mt-2 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white py-2 shadow-2xl shadow-[#143e22]/20 animate-fadeIn">
                  <div className="border-b border-gray-100 px-5 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Espace SOUTARAH</p>
                    <p className="mt-1 truncate text-sm font-bold text-[#30343b]">{accountName}</p>
                  </div>
                  <AccountButton icon="person" label="Votre compte" onClick={() => openAccountSection(isClient ? 'client' : 'admin', { tab: 'account' })} />
                  {isClient && (
                    <>
                      <AccountButton icon="description" label="Mes devis" onClick={() => openAccountSection('client', { tab: 'devis' })} />
                      <AccountButton
                        icon="notifications"
                        label="Mes notifications"
                        badge={unreadNotifsCount}
                        onClick={() => openAccountSection('client', { tab: 'notifications' })}
                      />
                    </>
                  )}
                  <div className="my-2 border-t border-gray-100" />
                  <button
                    onClick={() => {
                      logout();
                      setAccountMenuOpen(false);
                      if (navigateTo) navigateTo('home');
                    }}
                    className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm font-extrabold text-[#e87818] transition hover:bg-orange-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigateTo('login')}
              className="bg-primary hover:bg-[#1b4c00] text-white px-7 py-3 rounded-full text-base font-bold shadow-md hover:shadow-lg transition-all duration-300 shimmer-btn active:scale-95 whitespace-nowrap"
            >
              Demander un Devis
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => {
            setMobileMenuOpen((isOpen) => !isOpen);
            setServicesMenuOpen(false);
          }}
          className="lg:hidden p-2 text-on-surface hover:text-primary transition-colors focus:outline-none"
          aria-label="Menu"
        >
          <span className="material-symbols-outlined text-3xl">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 px-6 py-6 shadow-2xl animate-fadeIn">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => {
              if (link.id !== 'services') {
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`text-left text-base font-semibold py-2 transition-colors border-b border-gray-100 ${
                      activeTab === link.id ? 'text-primary font-bold' : 'text-on-surface-variant'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              }

              return (
                <div key={link.id} className="border-b border-gray-100 py-1">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleNavClick('services')}
                      className={`flex-1 py-2 text-left text-base font-semibold transition-colors ${
                        activeTab === 'services' ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      Services
                    </button>
                    <button
                      type="button"
                      onClick={() => setServicesMenuOpen((isOpen) => !isOpen)}
                      aria-label="Afficher les sous-services"
                      aria-expanded={servicesMenuOpen}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-primary hover:bg-primary/10"
                    >
                      <span className={`material-symbols-outlined transition-transform ${servicesMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>
                  </div>
                  {servicesMenuOpen && (
                    <div className="mt-1 grid gap-1 rounded-2xl bg-[#f2f7ef] p-2 animate-fadeIn">
                      {SERVICES_DATA.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => handleServiceClick(service.id)}
                          className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white"
                        >
                          <span className="material-symbols-outlined text-[19px] text-primary">{service.icon}</span>
                          <span className="text-sm font-bold text-[#1a1c1c]">{service.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {isClient && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo('client', { tab: 'notifications' });
                }}
                className="flex items-center justify-between py-2 border-b border-gray-100 text-left text-base font-semibold text-on-surface-variant"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">notifications</span>
                  Mes notifications
                </span>
                {unreadNotifsCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-black leading-none text-white">
                    {unreadNotifsCount > 99 ? '99+' : unreadNotifsCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigateTo('login');
              }}
              className="mt-2 w-full bg-primary text-white py-3 rounded-full font-bold text-center shimmer-btn shadow-md"
            >
              Demander un Devis
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
