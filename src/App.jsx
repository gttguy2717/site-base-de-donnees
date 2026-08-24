import React, { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import CartPage from './pages/CartPage';
import { getServiceById } from './data/servicesData';
import { useAuth } from './hooks/useAuth';
import AiAssistant from './components/AiAssistant';

function getRouteFromPath() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if (path === '/about') return { page: 'about' };
  if (path === '/services') return { page: 'services' };
  if (path === '/projects') return { page: 'projects' };
  if (path === '/careers') return { page: 'careers' };
  if (path === '/contact') return { page: 'contact' };
  if (path === '/login') return { page: 'login' };
  if (path === '/register') return { page: 'register' };
  if (path === '/admin') return { page: 'admin' };
  if (path === '/client') return { page: 'client' };
  if (path === '/cart') return { page: 'cart' };

  const serviceMatch = path.match(/^\/services\/([^/]+)$/);
  if (serviceMatch && getServiceById(serviceMatch[1])) {
    return { page: 'service', slug: serviceMatch[1] };
  }

  return { page: 'home' };
}

function routeUrl(page, options = {}) {
  const { slug } = options;
  switch (page) {
    case 'about': return '/about';
    case 'services': return '/services';
    case 'projects': return '/projects';
    case 'careers': return '/careers';
    case 'contact': return '/contact';
    case 'login': return '/login';
    case 'register': return '/register';
    case 'admin': return '/admin';
    case 'client': return '/client';
    case 'cart': return '/cart';
    case 'service':
      return getServiceById(slug) ? `/services/${slug}` : '/services';
    default:
      return '/';
  }
}

export default function App() {
  const [route, setRoute] = useState(getRouteFromPath);
  const { user, ready } = useAuth();

  useEffect(() => {
    const onPopState = () => setRoute(getRouteFromPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (page, options = {}) => {
    const { slug, section } = options;
    let nextRoute = { page };

    if (page === 'service' && getServiceById(slug)) {
      nextRoute = { page: 'service', slug };
    } else if (page === 'client') {
      nextRoute = { page: 'client', tab: options.tab || 'account' };
    }

    const url = routeUrl(page, options);
    window.history.pushState(nextRoute, '', url);
    setRoute(nextRoute);

    window.setTimeout(() => {
      if (section) {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  // Attendre que le contexte d'authentification soit prêt avant de rendre
  if (!ready) return null;

  let pageContent;

  // ── Routes publiques ──
  if (route.page === 'about') {
    pageContent = <AboutPage navigateTo={navigateTo} />;
  } else if (route.page === 'services') {
    pageContent = <ServicesPage navigateTo={navigateTo} />;
  } else if (route.page === 'projects') {
    pageContent = <ProjectsPage navigateTo={navigateTo} />;
  } else if (route.page === 'careers') {
    pageContent = <CareersPage navigateTo={navigateTo} />;
  } else if (route.page === 'contact') {
    pageContent = <ContactPage navigateTo={navigateTo} />;
  } else if (route.page === 'login') {
    pageContent = <AuthPage mode="login" navigateTo={navigateTo} />;
  } else if (route.page === 'register') {
    pageContent = <AuthPage mode="register" navigateTo={navigateTo} />;
  } else if (route.page === 'service') {
    const service = getServiceById(route.slug);
    pageContent = service ? <ServiceDetailPage service={service} navigateTo={navigateTo} /> : <ServicesPage navigateTo={navigateTo} />;
  } else if (!user) {
    // ── Routes protégées : non connecté ──
    if (route.page === 'admin' || route.page === 'client' || route.page === 'cart') {
      pageContent = <AuthPage mode="login" navigateTo={navigateTo} />;
    }
  } else {
    // ── Routes protégées : connecté ──
    if (route.page === 'cart') {
      pageContent = <CartPage navigateTo={navigateTo} />;
    } else if (route.page === 'client') {
      pageContent = user.role === 'CLIENT'
        ? <ClientDashboardPage navigateTo={navigateTo} initialTab={route.tab || 'account'} />
        : <HomePage navigateTo={navigateTo} />;
    } else if (route.page === 'admin') {
      pageContent = (user.role === 'ADMIN' || user.role === 'MANAGER')
        ? <AdminPage navigateTo={navigateTo} />
        : <HomePage navigateTo={navigateTo} />;
    }
  }

  if (!pageContent) {
    pageContent = <HomePage navigateTo={navigateTo} />;
  }

  return (
    <>
      {pageContent}
      <AiAssistant navigateTo={navigateTo} />
    </>
  );
}
