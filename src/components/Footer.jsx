import React from 'react';
import SoutarahLogo from './SoutarahLogo';
import FadeInSection from './FadeInSection';

export default function Footer({ onNavClick }) {
  const handleNavigation = (event, target) => {
    event?.preventDefault();
    onNavClick?.(target);
  };

  return (
    <FadeInSection
      as="footer"
      threshold={0}
      rootMargin="0px 0px 80px 0px"
      delay={100}
      className="bg-white pt-10 pb-0 font-sans text-gray-800 border-t border-gray-200/80"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">

        {/* Main Footer Layout: Left Brand + Right Large White Card Container */}
        <div className="flex flex-col lg:flex-row items-stretch gap-8">

          {/* 1. Left Brand Info with Extra Large Soutarah Logo */}
          <div className="lg:w-1/4 flex flex-col justify-start py-1 pr-4 shrink-0">
            <div>
              {/* Extra Large Logo */}
              <a
                href="#home"
                onClick={(event) => handleNavigation(event, 'home')}
                className="inline-block group"
                style={{ marginTop: '-1cm' }}
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5On9rw8OLuaB7owzau_MEA7XckceJ1pJD4iDN7UKrk1ayBM9LmnY7drgOrBPT_NcNn2jbEwmkTX77ZKPhN_odfdY974twxlOQLl3A_kfoRD9hoe5-IRQWLRmc9cTFevdrVvnedeB4ar0ArwIbGjKd5fWpWpOHsjC2HRKSIIP08qGIp7OAtDaGaLi2abCnlIv-Bsvg1lJP2ff8vONnDC2gbTyMQX4JIrewNrW-SPCrp5xEXohaV0We-SbC1YjAAIL8QwU"
                  alt="SOUTARAH GROUP"
                  className="h-36 sm:h-48 lg:h-60 w-auto object-contain transition-transform group-hover:scale-105 filter drop-shadow-xs"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden">
                  <SoutarahLogo className="h-36 sm:h-48 lg:h-60" />
                </div>
              </a>

              {/* Tagline (Remonté de 0.5cm) */}
              <p
                className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed max-w-xs relative"
                style={{ marginTop: '-1.6cm' }}
              >
                Des expertises multiples pour accompagner nos partenaires, construire ensemble et innover durablement.
              </p>
            </div>
          </div>

          {/* 2. Right White Block containing SERVICES, SECTEURS, ENGAGEMENT, LOCALISATION & Rectangular Restez connectés Banner */}
          <div className="lg:w-3/4 bg-white sm:bg-[#fafcf9] border border-gray-200/90 rounded-[32px] p-6 sm:p-8 shadow-xs flex-grow flex flex-col justify-between gap-6">

            {/* Top row: 4 Columns (SERVICES, SECTEURS, ENGAGEMENT, LOCALISATION) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-start">

              {/* Col 1: SERVICES */}
              <div>
                <h4 className="font-extrabold text-xs text-gray-900 mb-4 uppercase tracking-wider">
                  SERVICES
                </h4>
                <ul className="space-y-3 text-xs sm:text-sm text-gray-700 font-medium">
                  <li
                    className="flex items-center gap-2 hover:text-[#1b4d2e] transition-colors cursor-pointer group whitespace-nowrap"
                    onClick={() => onNavClick && onNavClick('services')}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#265322] shrink-0 group-hover:scale-110 transition-transform">architecture</span>
                    <span>Études et Conseils</span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-[#1b4d2e] transition-colors cursor-pointer group whitespace-nowrap"
                    onClick={() => onNavClick && onNavClick('services')}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#265322] shrink-0 group-hover:scale-110 transition-transform">design_services</span>
                    <span>Ingénierie et Design</span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-[#1b4d2e] transition-colors cursor-pointer group whitespace-nowrap"
                    onClick={() => onNavClick && onNavClick('services')}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#265322] shrink-0 group-hover:scale-110 transition-transform">assignment</span>
                    <span>Gestion de Projets</span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-[#1b4d2e] transition-colors cursor-pointer group whitespace-nowrap"
                    onClick={() => onNavClick && onNavClick('services')}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#265322] shrink-0 group-hover:scale-110 transition-transform">bolt</span>
                    <span>Énergie et Innovation</span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-[#1b4d2e] transition-colors cursor-pointer group whitespace-nowrap"
                    onClick={() => onNavClick && onNavClick('services')}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#265322] shrink-0 group-hover:scale-110 transition-transform">dataset</span>
                    <span>Digital & Data</span>
                  </li>
                  <li
                    className="flex items-center gap-2 hover:text-[#1b4d2e] transition-colors cursor-pointer group whitespace-nowrap"
                    onClick={() => onNavClick && onNavClick('services')}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#265322] shrink-0 group-hover:scale-110 transition-transform">apartment</span>
                    <span>Immobilier</span>
                  </li>
                </ul>
              </div>

              {/* Col 2: SECTEURS */}
              <div>
                <h4 className="font-extrabold text-xs text-gray-900 mb-4 uppercase tracking-wider">
                  SECTEURS
                </h4>
                <ul className="space-y-3 text-xs sm:text-sm text-gray-700 font-medium">
                  <li><a href="#services" onClick={(event) => handleNavigation(event, 'services')} className="hover:text-[#1b4d2e] transition-colors whitespace-nowrap block">BTP & Infrastructures</a></li>
                  <li><a href="#services" onClick={(event) => handleNavigation(event, 'services')} className="hover:text-[#1b4d2e] transition-colors whitespace-nowrap block">Énergie</a></li>
                  <li><a href="#services" onClick={(event) => handleNavigation(event, 'services')} className="hover:text-[#1b4d2e] transition-colors whitespace-nowrap block">Industrie</a></li>
                  <li><a href="#services" onClick={(event) => handleNavigation(event, 'services')} className="hover:text-[#1b4d2e] transition-colors whitespace-nowrap block">Environnement</a></li>
                  <li><a href="#services" onClick={(event) => handleNavigation(event, 'services')} className="hover:text-[#1b4d2e] transition-colors whitespace-nowrap block">Transport</a></li>
                  <li><a href="#services" onClick={(event) => handleNavigation(event, 'services')} className="hover:text-[#1b4d2e] transition-colors whitespace-nowrap block">Services</a></li>
                </ul>
              </div>

              {/* Col 3: ENGAGEMENT */}
              <div>
                <h4 className="font-extrabold text-xs text-gray-900 mb-4 uppercase tracking-wider">
                  ENGAGEMENT
                </h4>
                <ul className="space-y-3 text-xs sm:text-sm text-gray-700 font-medium">
                  <li><a href="#" className="hover:text-[#1b4d2e] transition-colors whitespace-nowrap block">Politique de Confidentialité</a></li>
                  <li><a href="#" className="hover:text-[#1b4d2e] transition-colors whitespace-nowrap block">Conditions d'Utilisation</a></li>
                  <li><a href="#" className="hover:text-[#1b4d2e] transition-colors whitespace-nowrap block">Politique de Cookies</a></li>
                  <li><a href="#" className="hover:text-[#1b4d2e] transition-colors whitespace-nowrap block">Mentions Légales</a></li>
                </ul>
              </div>

              {/* Col 4: LOCALISATION */}
              <div>
                <h4 className="font-extrabold text-xs text-gray-900 mb-4 uppercase tracking-wider">
                  LOCALISATION
                </h4>
                <ul className="space-y-3 text-xs sm:text-sm text-gray-700 font-medium">
                  <li className="flex items-center gap-2 whitespace-nowrap">
                    <span className="material-symbols-outlined text-[18px] text-[#265322] shrink-0">location_on</span>
                    <span>Abidjan, Côte d'Ivoire</span>
                  </li>
                  <li className="flex items-center gap-2 whitespace-nowrap">
                    <span className="material-symbols-outlined text-[18px] text-[#265322] shrink-0">call</span>
                    <span>+225 07 18 38 38 38</span>
                  </li>
                  <li className="flex items-center gap-2 whitespace-nowrap">
                    <span className="material-symbols-outlined text-[18px] text-[#265322] shrink-0">mail</span>
                    <span>contact@soutarah.ci</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Bottom Wide RECTANGULAR "Restez connectés" Dark Green Card Banner */}
            <div className="bg-[#143e22] rounded-[24px] p-4 sm:p-5 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">

              {/* Left content: Title, Subtitle, and Social Icons in a wide horizontal row */}
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full md:w-auto">
                <div>
                  <h4 className="font-bold text-base sm:text-lg text-white leading-tight">
                    Restez connectés
                  </h4>
                  <p className="text-xs text-emerald-100/90 font-medium leading-tight mt-0.5">
                    Suivez notre actualité et nos réalisations
                  </p>
                </div>

                {/* Social Circles in a sleek line */}
                <div className="flex items-center gap-2">
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-emerald-300/40 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-105 text-xs font-bold"
                    title="LinkedIn"
                  >
                    in
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-emerald-300/40 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-105 text-xs font-bold"
                    title="Facebook"
                  >
                    f
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-emerald-300/40 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-105 text-xs font-bold"
                    title="Twitter / X"
                  >
                    𝕏
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-emerald-300/40 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-105"
                    title="YouTube"
                  >
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-emerald-300/40 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-105"
                    title="Instagram"
                  >
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  </a>
                </div>
              </div>

              {/* Right Side: Devices Mockup graphic */}
              <div className="relative md:absolute right-0 bottom-0 top-0 w-full md:w-[35%] lg:w-[30%] flex items-center justify-end z-1 pointer-events-none pr-2">
                <img
                  src="/soutarah_devices_mockup.png"
                  alt="Soutarah Site Devices"
                  className="h-20 md:h-[95%] w-auto object-contain object-right drop-shadow-xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom Full Screen Width Legal / Copyright Bar en VERT FONCÉ (#143e22) */}
      <div className="w-full bg-[#143e22] text-white py-4 border-t border-[#0e2d19]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium">
          <p>© 2025 SOUTARAH GROUP. Tous droits réservés.</p>
          <div className="flex items-center gap-6 text-emerald-100">
            <a href="#contact" onClick={(event) => handleNavigation(event, 'contact')} className="hover:text-white transition-colors">
              Contact & Support
            </a>
            <span>•</span>
            <a href="tel:+2250718383838" className="hover:text-white transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">call</span>
              <span>+225 07 18 38 38 38</span>
            </a>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">location_on</span>
              <span>Abidjan, Côte d'Ivoire</span>
            </span>
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}