import { useAuth } from '../hooks/useAuth';

export default function PrivateLandingPage({ area, navigateTo }) {
  const { user, client, logout } = useAuth();
  const isAdmin = area === 'admin';
  const customerName = client?.company?.name || [client?.firstName, client?.lastName].filter(Boolean).join(' ') || user?.email;

  return <main className="min-h-screen bg-[#f3f7f1] px-5 py-12 sm:py-20"><section className="mx-auto max-w-3xl rounded-3xl border border-primary/10 bg-white p-8 shadow-xl shadow-primary/10 sm:p-12"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">SOUTARAH GROUP</p><h1 className="mt-3 font-display text-3xl font-extrabold text-on-surface">Bonjour {customerName}</h1><p className="mt-3 text-on-surface-variant">{isAdmin ? 'Accès administration validé. Le tableau de bord de gestion sera ajouté progressivement.' : 'Votre accès client est sécurisé. Catalogue, panier, devis et réservations seront disponibles dans les prochaines phases.'}</p><div className="mt-8 flex flex-wrap gap-3"><button onClick={() => navigateTo('home')} className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-white">Retour au site</button><button onClick={logout} className="rounded-full border border-gray-300 px-5 py-3 text-sm font-bold text-gray-700">Se déconnecter</button></div></section></main>;
}
