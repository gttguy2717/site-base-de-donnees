import { useAuth } from '../hooks/useAuth';

const stats = [
  ['Clients', '0'], ['Particuliers', '0'], ['Entreprises', '0'], ['Produits', '0'],
  ['Vehicules', '0'], ['Reservations en attente', '0'], ['Devis', '0'], ['Stock faible', '0'],
];
const modules = ['Clients et entreprises', 'Produits et categories', 'Tarifs et stocks', 'Vehicules et reservations', 'Devis', 'Promotions', 'Demandes de produits', 'Notifications', 'Actualites et realisations', 'Services et parametres'];

export default function AdminDashboardPage({ navigateTo }) {
  const { user, logout } = useAuth();
  return (
    <main className="min-h-screen bg-[#eef2ec] px-5 py-8 sm:py-12">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-3xl bg-[#174b00] px-6 py-7 text-white shadow-xl shadow-primary/20 sm:px-9">
          <div className="flex flex-wrap items-center justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">SOUTARAH GROUP • ADMINISTRATION</p><h1 className="mt-2 font-display text-3xl font-extrabold">Tableau de bord</h1><p className="mt-2 text-sm text-white/80">Connecte en tant que {user?.email}</p></div><div className="flex gap-3"><button onClick={() => navigateTo('home')} className="rounded-full border border-white/30 px-4 py-2.5 text-sm font-bold">Site public</button><button onClick={logout} className="rounded-full bg-white px-4 py-2.5 text-sm font-bold text-primary">Deconnexion</button></div></div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value]) => <article key={label} className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm"><p className="font-display text-3xl font-extrabold text-primary">{value}</p><p className="mt-1 text-sm text-on-surface-variant">{label}</p></article>)}</section>

        <section className="mt-10 grid gap-5 lg:grid-cols-[1.5fr_1fr]"><div className="rounded-3xl border border-primary/10 bg-white p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Modules de gestion</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{modules.map((module) => <button key={module} className="rounded-2xl border border-gray-100 bg-[#f8faf7] px-4 py-4 text-left text-sm font-bold text-on-surface transition hover:border-primary/30 hover:text-primary">{module}<span className="mt-1 block text-xs font-normal text-on-surface-variant">Ouvrir le module →</span></button>)}</div></div><aside className="rounded-3xl border border-primary/10 bg-white p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">A surveiller</p><h2 className="mt-2 font-display text-2xl font-extrabold text-on-surface">Activite recente</h2><p className="mt-4 rounded-2xl bg-[#f3f7f1] p-4 text-sm leading-6 text-on-surface-variant">Aucune nouvelle demande pour le moment. Les devis, reservations, alertes de stock et notifications apparaitront ici.</p></aside></section>
      </section>
    </main>
  );
}
