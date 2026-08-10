import React, { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import { getServiceById } from './data/servicesData';

function getRouteFromPath() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if (path === '/about') return { page: 'about' };
  if (path === '/services') return { page: 'services' };
  if (path === '/projects') return { page: 'projects' };
  if (path === '/careers') return { page: 'careers' };
  if (path === '/contact') return { page: 'contact' };

  const serviceMatch = path.match(/^\/services\/([^/]+)$/);
  if (serviceMatch && getServiceById(serviceMatch[1])) {
    return { page: 'service', slug: serviceMatch[1] };
  }

  return { page: 'home' };
}

export default function App() {
  const [route, setRoute] = useState(getRouteFromPath);

  useEffect(() => {
    const onPopState = () => setRoute(getRouteFromPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (page, options = {}) => {
    const { slug, section } = options;
    let nextRoute = { page };
    let url = '/';

    if (page === 'about') {
      url = '/about';
    } else if (page === 'services') {
      url = '/services';
    } else if (page === 'projects') {
      url = '/projects';
    } else if (page === 'careers') {
      url = '/careers';
    } else if (page === 'contact') {
      url = '/contact';
    } else if (page === 'service' && getServiceById(slug)) {
      nextRoute = { page: 'service', slug };
      url = `/services/${slug}`;
    } else {
      nextRoute = { page: 'home' };
    }

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

  if (route.page === 'about') {
    return <AboutPage navigateTo={navigateTo} />;
  }

  if (route.page === 'services') {
    return <ServicesPage navigateTo={navigateTo} />;
  }

  if (route.page === 'projects') {
    return <ProjectsPage navigateTo={navigateTo} />;
  }

  if (route.page === 'careers') {
    return <CareersPage navigateTo={navigateTo} />;
  }

  if (route.page === 'contact') {
    return <ContactPage navigateTo={navigateTo} />;
  }

  if (route.page === 'service') {
    const service = getServiceById(route.slug);
    return <ServiceDetailPage service={service} navigateTo={navigateTo} />;
  }

  return <HomePage navigateTo={navigateTo} />;
}
