import React, { useState, useEffect } from 'react';
import SoutarahLogo from './SoutarahLogo';
import { SERVICES_DATA } from '../data/servicesData';

export default function Navbar({ onOpenDevis, activeTab = 'home', setActiveTab, navigateTo }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);

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

  const navLinks = [
    { id: 'home', label: 'Accueil' },
    { id: 'about', label: 'À Propos' },
    { id: 'services', label: 'Services' },
    { id: 'projects', label: 'Projets' },
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
        ? 'glass-nav shadow-md py-2'
        : (activeTab === 'about' || activeTab === 'services')
          ? 'glass-nav-muted py-4'
          : 'bg-transparent py-4'
    }`}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex justify-between items-center h-20 overflow-visible">
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
                className="relative"
                onMouseEnter={() => setServicesMenuOpen(true)}
                onMouseLeave={() => setServicesMenuOpen(false)}
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
                  <div className="absolute left-1/2 top-full z-[60] mt-4 w-[640px] -translate-x-1/2 rounded-[26px] border border-gray-200/90 bg-white p-3 shadow-2xl shadow-[#143e22]/15 animate-fadeIn">
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
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Actions matching Image 2 */}
        <div className="hidden md:flex items-center gap-4">
          {/* Quick Contact Icons */}
          <div className="flex items-center gap-2 text-gray-700">
            <a
              href="tel:+2250718383838"
              title="Appeler: 00225 0718383838"
              className="w-10 h-10 rounded-full hover:bg-gray-100/80 flex items-center justify-center transition-colors text-gray-700 hover:text-primary"
            >
              <span className="material-symbols-outlined text-2xl">call</span>
            </a>
            <button
              title="Horaires: Lun - Sam 8.00/18.00"
              className="w-10 h-10 rounded-full hover:bg-gray-100/80 flex items-center justify-center transition-colors text-gray-700 hover:text-primary"
            >
              <span className="material-symbols-outlined text-2xl">schedule</span>
            </button>
            <button
              title="Partager"
              className="w-10 h-10 rounded-full hover:bg-gray-100/80 flex items-center justify-center transition-colors text-gray-700 hover:text-primary"
            >
              <span className="material-symbols-outlined text-2xl">share</span>
            </button>
          </div>

          {/* Green Pill Button matching Image 2 */}
          <button
            onClick={onOpenDevis}
            className="bg-primary hover:bg-[#1b4c00] text-white px-7 py-3 rounded-full text-base font-bold shadow-md hover:shadow-lg transition-all duration-300 shimmer-btn active:scale-95 whitespace-nowrap"
          >
            Demander un Devis
          </button>
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
            <div className="flex items-center gap-4 py-2 text-sm text-gray-600">
              <a href="tel:+2250718383838" className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">call</span>
                <span>00225 0718383838</span>
              </a>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDevis();
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
