import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as XLSX from 'xlsx';

const API_URL = '';

function useFetch(path, token) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [path, token]);

  return { data, loading, error };
}

const money = (v) => new Intl.NumberFormat('fr-CI', { maximumFractionDigits: 0 }).format(v || 0);

// ============ Composants graphiques SVG ============

function DonutChart({ segments, size = 180, thickness = 26 }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#f1f5f9" strokeWidth={thickness}
        />
        {segments.filter(s => s.value > 0).map((seg, idx) => {
          const len = (seg.value / total) * circumference;
          const dash = `${len} ${circumference - len}`;
          const el = (
            <circle
              key={idx}
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-gray-900">{total}</span>
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Total</span>
      </div>
    </div>
  );
}

function BarChart({ data, height = 220 }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((item, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
          <span className="text-sm font-bold text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">{item.value}</span>
          <div
            className="w-full rounded-t-xl transition-all duration-700 group-hover:opacity-80"
            style={{
              height: `${Math.max(6, (item.value / max) * (height - 60))}px`,
              background: `linear-gradient(180deg, ${item.color} 0%, ${item.color}CC 100%)`,
              boxShadow: `0 4px 12px ${item.color}40`,
            }}
          />
          <span className="text-[11px] font-medium text-gray-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function ProgressBar({ label, value, max, color, icon, suffix = '' }) {
  const pct = Math.round((value / Math.max(1, max)) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-gray-400">{icon}</span>
          <span className="text-sm font-semibold text-gray-800">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-900">
          {value}{suffix}
          <span className="text-[10px] font-semibold text-gray-400 ml-1">({pct}%)</span>
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}CC)`, boxShadow: `0 2px 6px ${color}40` }}
        />
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, gradient, sub, subColor = 'text-emerald-600' }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute inset-0 opacity-[0.04]" style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
          <p className="mt-2 font-display text-3xl font-black text-gray-900">{value}</p>
          {sub && <p className={`mt-1 text-[11px] font-bold ${subColor}`}>{sub}</p>}
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`, boxShadow: `0 4px 14px ${gradient[0]}50` }}
        >
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, icon, children, right }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

// ============ Export Excel complet ============

function exportExcel(allData) {
  const { s, clientsList, quotesList, productsList, vehiclesList, reservationsList, entreprisesCount, particuliersCount, totalClients, clientGrowth, growthRate, conversionRate, approvedQuotes, topProducts, servicesPerformance, avgQuotesPerClient } = allData;

  // Contenu structuré : une ligne = [clé/valeur], et des blocs avec titre + données
  const sheetData = [];

  sheetData.push(['SOUTARAH GROUP — RAPPORT DE PERFORMANCE']);
  sheetData.push(['Généré le', new Date().toLocaleString('fr-FR')]);
  sheetData.push([]);

  // ===== 1. Indicateurs clés =====
  sheetData.push(['INDICATEURS CLÉS', '']);
  sheetData.push(['Clients totaux', s.clients?.total ?? clientsList.length]);
  sheetData.push(['Nouveaux clients (30j)', clientGrowth]);
  sheetData.push(['Taux de croissance clients', `${growthRate}%`]);
  sheetData.push(['Particuliers', particuliersCount]);
  sheetData.push(['Entreprises client', entreprisesCount]);
  sheetData.push(['Devis totaux', s.devis?.total ?? quotesList.length]);
  sheetData.push(['Devis en attente', s.devis?.enAttente ?? 0]);
  sheetData.push(['Devis approuvés', approvedQuotes]);
  sheetData.push(['Taux de conversion', `${conversionRate}%`]);
  sheetData.push(['Moyenne devis/client', avgQuotesPerClient]);
  sheetData.push(['Réservations totales', s.reservations?.total ?? reservationsList.length]);
  sheetData.push(['Réservations en cours', s.reservations?.enCours ?? 0]);
  sheetData.push(['Articles au catalogue', productsList.length]);
  sheetData.push(['Véhicules disponibles', vehiclesList.length]);
  sheetData.push([]);

  // ===== 2. Top produits =====
  sheetData.push(['TOP PRODUITS DEMANDÉS', '']);
  sheetData.push(['Produit', 'Quantité']);
  (topProducts.length ? topProducts : [['Aucune donnée', '']]).forEach(([name, qty]) => sheetData.push([name, qty]));
  sheetData.push([]);

  // ===== 3. Performance des services =====
  sheetData.push(['PERFORMANCE DES SERVICES', '']);
  sheetData.push(['Service', 'Demandes']);
  (servicesPerformance.length ? servicesPerformance : [['Aucune donnée', '']]).forEach(([svc, count]) => sheetData.push([svc, count]));
  sheetData.push([]);

  // ===== 4. Détail des devis =====
  sheetData.push(['DÉTAIL DES DEVIS', '']);
  sheetData.push(['Référence', 'Client', 'Service', 'Titre', 'Statut', 'Email', 'Téléphone', 'Date']);
  quotesList.forEach(q => sheetData.push([
    q.reference || '',
    q.nom || q.client?.nom || '',
    q.service || '',
    q.titre || '',
    q.statut || '',
    q.email || q.client?.user?.email || '',
    q.telephone || q.client?.user?.telephone || '',
    q.cree_le ? new Date(q.cree_le).toLocaleDateString('fr-FR') : '',
  ]));
  sheetData.push([]);

  // ===== 5. Détail des réservations =====
  sheetData.push(['DÉTAIL DES RÉSERVATIONS', '']);
  sheetData.push(['Référence', 'Client', 'Véhicule', 'Début', 'Fin', 'Statut', 'Montant']);
  reservationsList.forEach(r => sheetData.push([
    r.reference || '',
    r.client?.prenom || r.client?.nom || r.client?.user?.email || '',
    r.vehicule ? `${r.vehicule.marque || ''} ${r.vehicule.modele || ''}`.trim() : '',
    r.commence_le ? new Date(r.commence_le).toLocaleDateString('fr-FR') : '',
    r.termine_le ? new Date(r.termine_le).toLocaleDateString('fr-FR') : '',
    r.statut || '',
    r.montant_total || '',
  ]));
  sheetData.push([]);

  // ===== 6. Détail des clients =====
  sheetData.push(['DÉTAIL DES CLIENTS', '']);
  sheetData.push(['Nom', 'Email', 'Téléphone', 'Type', 'Date d\'inscription']);
  clientsList.forEach(c => sheetData.push([
    c.entreprise?.nom || [c.prenom, c.nom].filter(Boolean).join(' ') || '',
    c.utilisateur?.email || '',
    c.utilisateur?.telephone || '',
    c.type_client || '',
    c.cree_le ? new Date(c.cree_le).toLocaleDateString('fr-FR') : '',
  ]));

  // ===== Vrai fichier Excel =====
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws['!cols'] = [{ wch: 40 }, { wch: 40 }, { wch: 30 }, { wch: 30 }, { wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Performance');
  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rapport-soutarah-${new Date().toISOString().split('T')[0]}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============ Page principale ============

export default function AdminReports() {
  const { token } = useAuth();
  const [period, setPeriod] = useState('30j');
  const [service, setService] = useState('ALL');
  const [clientType, setClientType] = useState('ALL');
  const [activeTab, setActiveTab] = useState('apercu');

  const stats = useFetch('/api/admin/dashboard/stats', token);
  const clients = useFetch('/api/admin/clients', token);
  const quotes = useFetch('/api/admin/quotes', token);
  const products = useFetch('/api/admin/products', token);
  const vehicles = useFetch('/api/admin/vehicles', token);
  const reservations = useFetch('/api/admin/reservations', token);

  const s = stats.data?.stats || {};
  const clientsList = clients.data?.clients || [];
  const quotesList = quotes.data?.quotes || [];
  const productsList = products.data?.products || [];
  const vehiclesList = vehicles.data?.vehicles || [];
  const reservationsList = reservations.data?.reservations || [];

  // ===== Analyses réelles =====

  const entreprisesCount = clientsList.filter(c => c.type_client === 'ENTREPRISE').length;
  const particuliersCount = clientsList.filter(c => c.type_client === 'PARTICULIER').length;
  const totalClients = Math.max(1, clientsList.length);

  const quotesStatusCount = useMemo(() => {
    const out = {};
    quotesList.forEach(q => { out[q.statut] = (out[q.statut] || 0) + 1; });
    return out;
  }, [quotesList]);

  const reservationStatusCount = useMemo(() => {
    const out = {};
    reservationsList.forEach(r => { out[r.statut] = (out[r.statut] || 0) + 1; });
    return out;
  }, [reservationsList]);

  const totalQuotes = quotesList.length;
  const approvedQuotes = quotesList.filter(q => q.statut === 'APPROVED').length;
  const conversionRate = totalQuotes ? Math.round((approvedQuotes / totalQuotes) * 100) : 0;

  // Top produits
  const topProducts = useMemo(() => {
    const counts = {};
    quotesList.forEach(q => {
      const desc = q.description || '';
      const m = desc.match(/x(\d+)/);
      const qty = m ? parseInt(m[1], 10) : 1;
      const name = (q.titre || desc.split('|')[0] || 'Devis').trim();
      counts[name] = (counts[name] || 0) + qty;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [quotesList]);

  const topProductMax = Math.max(...topProducts.map(([, qty]) => qty), 1);

  // Services perfs
  const servicesPerformance = useMemo(() => {
    const counts = {};
    quotesList.forEach(q => {
      const svc = q.service || 'Autre';
      counts[svc] = (counts[svc] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [quotesList]);

  // Variation clients (estimation)
  const clientGrowth = s.clients?.nouveau || 0;
  const growthRate = totalClients > 1 ? Math.round((clientGrowth / totalClients) * 100) : 0;

  const avgQuotesPerClient = totalClients ? (quotesList.length / totalClients).toFixed(1) : '0';

  const maxBar = Math.max(1, s.clients?.total || 0, s.devis?.total || 0, s.reservations?.total || 0);

  const loading = stats.loading || clients.loading || quotes.loading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl animate-pulse">assessment</span>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'apercu', label: 'Aperçu', icon: 'dashboard' },
    { id: 'clients', label: 'Clients', icon: 'group' },
    { id: 'ca', label: "Chiffre d'affaires", icon: 'payments' },
    { id: 'produits', label: 'Produits', icon: 'inventory_2' },
    { id: 'services', label: 'Services', icon: 'handyman' },
  ];

  const statusColors = {
    APPROVED: '#10b981',
    PENDING: '#f59e0b',
    ISSUED: '#f59e0b',
    CONTACTED: '#3b82f6',
    CONFIRMED: '#10b981',
    CANCELLED: '#ef4444',
    REJECTED: '#ef4444',
    SENT: '#8b5cf6',
    COMPLETED: '#10b981',
  };

  return (
    <div className="space-y-6 pb-8">
      {/* ===== HEADER ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#173d23] via-[#1e5c30] to-[#296c00] p-8 text-white shadow-xl">
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute right-24 bottom-0 h-24 w-24 rounded-full bg-emerald-400/10 blur-xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">SOUTARAH GROUP</p>
            <h1 className="mt-2 font-display text-4xl font-black tracking-tight">Rapports de performance</h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-emerald-100/80">
              Analysez en temps réel vos clients, devis, réservations et chiffre d'affaires.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportExcel({
                s,
                clientsList,
                quotesList,
                productsList,
                vehiclesList,
                reservationsList,
                entreprisesCount,
                particuliersCount,
                totalClients,
                clientGrowth,
                growthRate,
                conversionRate,
                approvedQuotes,
                topProducts,
                servicesPerformance,
                avgQuotesPerClient,
              })}
              className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* ===== FILTRES ===== */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-gray-400">calendar_month</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 focus:border-primary focus:outline-none">
            <option value="7j">7 jours</option>
            <option value="30j">30 jours</option>
            <option value="90j">90 jours</option>
            <option value="1an">1 an</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-gray-400">category</span>
          <select value={service} onChange={(e) => setService(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 focus:border-primary focus:outline-none">
            <option value="ALL">Tous les services</option>
            <option value="Négoce">Négoce</option>
            <option value="Location">Location véhicules</option>
            <option value="Energie">Énergie</option>
            <option value="Entretien">Entretien</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-gray-400">business</span>
          <select value={clientType} onChange={(e) => setClientType(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 focus:border-primary focus:outline-none">
            <option value="ALL">Tous les clients</option>
            <option value="PARTICULIER">Particuliers</option>
            <option value="ENTREPRISE">Entreprises Client</option>
          </select>
        </div>
        <div className="ml-auto hidden md:block">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Données en temps réel
          </span>
        </div>
      </div>

      {/* ===== ONGLETS ===== */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-lg shadow-primary/25 -translate-y-0.5'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== APERÇU ===== */}
      {activeTab === 'apercu' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Clients"
              value={s.clients?.total || 0}
              icon="group"
              gradient={['#10b981', '#059669']}
              sub={`▲ ${clientGrowth} nouveaux (30j)`}
              subColor="text-emerald-600"
            />
            <KpiCard
              label="Devis"
              value={s.devis?.total || 0}
              icon="description"
              gradient={['#3b82f6', '#2563eb']}
              sub={`${s.devis?.enAttente || 0} en attente`}
              subColor="text-amber-600"
            />
            <KpiCard
              label="Réservations"
              value={s.reservations?.total || 0}
              icon="event"
              gradient={['#f59e0b', '#d97706']}
              sub={`${s.reservations?.enCours || 0} en cours`}
              subColor="text-amber-600"
            />
            <KpiCard
              label="Conversion"
              value={`${conversionRate}%`}
              icon="trending_up"
              gradient={['#8b5cf6', '#7c3aed']}
              sub={`${approvedQuotes} devis approuvés`}
              subColor="text-purple-600"
            />
          </div>

          {/* Graphiques principaux */}
          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Évolution de l'activité" subtitle="Répartition par secteur" icon="insights">
              <BarChart
                data={[
                  { label: 'Clients', value: s.clients?.total || 0, color: '#10b981' },
                  { label: 'Devis', value: s.devis?.total || 0, color: '#3b82f6' },
                  { label: 'Réservations', value: s.reservations?.total || 0, color: '#f59e0b' },
                  { label: 'Particuliers', value: particuliersCount, color: '#8b5cf6' },
                  { label: 'Entreprises', value: entreprisesCount, color: '#ec4899' },
                ]}
              />
            </SectionCard>

            <SectionCard title="Répartition des clients" subtitle="Particuliers vs Entreprises Client" icon="pie_chart">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
                <DonutChart
                  segments={[
                    { value: particuliersCount, color: '#10b981' },
                    { value: entreprisesCount, color: '#3b82f6' },
                  ]}
                />
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-[#10b981]" />
                    <div>
                      <p className="text-sm font-bold text-gray-800">Particuliers</p>
                      <p className="text-xs text-gray-500">{particuliersCount} · {Math.round((particuliersCount / totalClients) * 100)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-[#3b82f6]" />
                    <div>
                      <p className="text-sm font-bold text-gray-800">Entreprises Client</p>
                      <p className="text-xs text-gray-500">{entreprisesCount} · {Math.round((entreprisesCount / totalClients) * 100)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Analyses */}
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard title="Produits les plus demandés" subtitle="Top 5 par demande" icon="inventory_2">
              <div className="space-y-4">
                {topProducts.map(([name, qty], idx) => (
                  <ProgressBar
                    key={idx}
                    label={name}
                    value={qty}
                    max={topProductMax}
                    color={['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'][idx % 5]}
                    icon={['inventory_2', 'local_shipping', 'build', 'electrical_services', 'agriculture'][idx % 5]}
                    suffix=" req"
                  />
                ))}
                {topProducts.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-8">Aucune donnée</p>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Performance des services" subtitle="Demandes reçues par service" icon="handyman">
              <div className="space-y-4">
                {servicesPerformance.slice(0, 5).map(([svc, count], idx) => (
                  <ProgressBar
                    key={idx}
                    label={svc}
                    value={count}
                    max={servicesPerformance[0]?.[1] || 1}
                    color={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][idx % 5]}
                    icon="task_alt"
                    suffix=" req"
                  />
                ))}
                {servicesPerformance.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-8">Aucune donnée</p>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Analyse IA" subtitle="Synthèse automatique" icon="auto_awesome">
              <div className="space-y-4">
                <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                    <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                    Recommandation
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-emerald-700">
                    {clientGrowth > 0
                      ? `Excellente dynamique ! ${clientGrowth} nouveau(x) client(s) sur 30 jours (+${growthRate}%). Poursuivez vos efforts d'acquisition.`
                      : 'Aucun nouveau client ce mois-ci. Relancez vos campagnes marketing et proposez des promotions pour attirer.'}
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-blue-800">
                    <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                    Taux de conversion
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-black text-blue-900">{conversionRate}%</span>
                    <span className="text-xs font-bold text-blue-600">{approvedQuotes}/{totalQuotes} approuvés</span>
                  </div>
                  <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${conversionRate}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Moy. devis/client</p>
                    <p className="mt-1 text-xl font-black text-gray-900">{avgQuotesPerClient}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Stock articles</p>
                    <p className="mt-1 text-xl font-black text-gray-900">{productsList.length}</p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* ===== CLIENTS ===== */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Clients totaux" value={totalClients} icon="group" gradient={['#10b981', '#059669']} sub={`▲ ${clientGrowth} nouveaux (30j)`} />
            <KpiCard label="Particuliers" value={particuliersCount} icon="person" gradient={['#8b5cf6', '#7c3aed']} sub={`${Math.round((particuliersCount / totalClients) * 100)}% du total`} />
            <KpiCard label="Entreprises Client" value={entreprisesCount} icon="business" gradient={['#3b82f6', '#2563eb']} sub={`${Math.round((entreprisesCount / totalClients) * 100)}% du total`} />
            <KpiCard label="Taux de croissance" value={`${growthRate}%`} icon="trending_up" gradient={['#f59e0b', '#d97706']} sub="30 derniers jours" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Répartition des clients" subtitle="Distribution particuliers / entreprises" icon="pie_chart" right={
              <div className="flex gap-2">
                <button onClick={() => setClientType('ALL')} className={`rounded-full px-3 py-1 text-[11px] font-bold ${clientType === 'ALL' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>Tous</button>
                <button onClick={() => setClientType('PARTICULIER')} className={`rounded-full px-3 py-1 text-[11px] font-bold ${clientType === 'PARTICULIER' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>Particuliers</button>
                <button onClick={() => setClientType('ENTREPRISE')} className={`rounded-full px-3 py-1 text-[11px] font-bold ${clientType === 'ENTREPRISE' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>Entreprises</button>
              </div>
            }>
              <div className="flex flex-col items-center gap-7 sm:flex-row sm:justify-center">
                <DonutChart segments={[
                  { value: particuliersCount, color: '#8b5cf6' },
                  { value: entreprisesCount, color: '#3b82f6' },
                ]} />
                <div className="space-y-4">
                  {[
                    { label: 'Particuliers', value: particuliersCount, color: '#8b5cf6' },
                    { label: 'Entreprises Client', value: entreprisesCount, color: '#3b82f6' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                      <div>
                        <p className="text-sm font-bold text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.value} clients · {Math.round((item.value / totalClients) * 100)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Analyse des clients" subtitle="Derniers clients enregistrés" icon="group">
              <div className="space-y-2">
                {countries_list_sorted().map((client) => {
                  const name = client.entreprise?.nom || [client.prenom, client.nom].filter(Boolean).join(' ') || '—';
                  const isEnt = client.type_client === 'ENTREPRISE';
                  return (
                    <div key={client.id} className="flex items-center gap-3 rounded-xl border border-gray-50 hover:bg-gray-50 p-2.5 transition-colors group">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white font-bold text-sm shadow-sm ${isEnt ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30' : 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30'}`}>
                        {(name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors">{name}</p>
                        <p className="text-xs text-gray-500 truncate">{client.utilisateur?.email || '—'}</p>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full ${isEnt ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                        {isEnt ? 'ENTREPRISE' : 'PARTICULIER'}
                      </span>
                    </div>
                  );
                })}
                {clientsList.length === 0 && <p className="text-center text-sm text-gray-400 py-10">Aucun client</p>}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* ===== CHIFFRE D'AFFAIRES ===== */}
      {activeTab === 'ca' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Devis total" value={s.devis?.total || 0} icon="description" gradient={['#3b82f6', '#2563eb']} sub="Toutes périodes" subColor="text-gray-500" />
            <KpiCard label="Devis en attente" value={s.devis?.enAttente || 0} icon="hourglass_top" gradient={['#f59e0b', '#d97706']} sub="PRÊT À TRAITER" subColor="text-amber-600" />
            <KpiCard label="Réservations" value={reservationsList.length} icon="event" gradient={['#10b981', '#059669']} sub={`${s.reservations?.enCours || 0} en cours`} subColor="text-emerald-600" />
            <KpiCard label="Taux conversion" value={`${conversionRate}%`} icon="verified" gradient={['#8b5cf6', '#7c3aed']} sub={`${approvedQuotes} approuvés`} subColor="text-purple-600" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Évolution de l'activité" subtitle="Comparaison des volumes par secteur" icon="monitoring">
              <BarChart
                data={[
                  { label: 'Clients', value: s.clients?.total || 0, color: '#10b981' },
                  { label: 'Devis', value: s.devis?.total || 0, color: '#3b82f6' },
                  { label: 'Réservations', value: s.reservations?.total || 0, color: '#f59e0b' },
                ]}
                height={240}
              />
            </SectionCard>

            <SectionCard title="Statuts des devis" subtitle="Répartition par statut" icon="description">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
                <DonutChart
                  size={160}
                  thickness={22}
                  segments={Object.entries(quotesStatusCount).map(([status, count]) => ({
                    value: count,
                    color: statusColors[status] || '#94a3b8',
                  }))}
                />
                <div className="space-y-2.5">
                  {Object.entries(quotesStatusCount).length > 0 ? (
                    Object.entries(quotesStatusCount).map(([status, count]) => (
                      <div key={status} className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusColors[status] || '#94a3b8' }} />
                        <span className="text-sm font-semibold text-gray-700">{status}</span>
                        <span className="text-sm font-black text-gray-900 ml-auto">{count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">Aucun devis</p>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard title="Statuts des réservations" subtitle="Répartition actuelle" icon="event" >
              <div className="space-y-3">
                {Object.entries(reservationStatusCount).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-700">{status}</span>
                        <span className="text-sm font-black text-gray-900">{count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(count / Math.max(1, reservationsList.length)) * 100}%`, background: statusColors[status] || '#94a3b8' }} />
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(reservationStatusCount).length === 0 && <p className="text-sm text-gray-400 py-4 text-center">Aucune réservation</p>}
              </div>
            </SectionCard>

            <SectionCard title="Recommandations stratégiques" subtitle="Basées sur vos données" icon="lightbulb">
              <div className="space-y-3">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
                  <p className="text-xs font-bold text-emerald-800">✓ À renforcer</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-700">
                    {servicesPerformance[0]
                      ? `Le service "${servicesPerformance[0][0]}" génère le plus de demandes (${servicesPerformance[0][1]}). Investissez dans cette activité.`
                      : 'Analysez les services actifs pour prioriser vos efforts.'}
                  </p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
                  <p className="text-xs font-bold text-blue-800">📈 Opportunité</p>
                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    {topProducts[0]
                      ? `Le produit "${topProducts[0][0]}" est le plus demandé. Garantissez le stock et proposez-le en vedette.`
                      : 'Identifiez vos produits stars pour booster les ventes.'}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5">
                  <p className="text-xs font-bold text-amber-800">⚠️ À surveiller</p>
                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    {s.devis?.enAttente > 0
                      ? `${s.devis.enAttente} devis sont en attente. Un traitement rapide augmente les chances de conversion.`
                      : 'Aucun devis en attente. Tous vos devis sont traités.'}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Synthèse IA" subtitle="Analyse globale automatique" icon="auto_awesome">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 p-3.5">
                  <span className="text-sm font-bold text-gray-700">Moy. devis / client</span>
                  <span className="text-xl font-black text-primary">{avgQuotesPerClient}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 p-3.5">
                  <span className="text-sm font-bold text-gray-700">Paniers produits</span>
                  <span className="text-xl font-black text-primary">{productsList.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 p-3.5">
                  <span className="text-sm font-bold text-gray-700">Flotte véhicules</span>
                  <span className="text-xl font-black text-primary">{vehiclesList.length}</span>
                </div>
                <p className="text-[11px] text-gray-400 italic mt-2">
                  Analyses générées à partir des données réelles de la base SOUTARAH.
                </p>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* ===== PRODUITS ===== */}
      {activeTab === 'produits' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Articles catalogue" value={productsList.length} icon="inventory_2" gradient={['#10b981', '#059669']} />
            <KpiCard label="Véhicules" value={vehiclesList.length} icon="directions_car" gradient={['#3b82f6', '#2563eb']} />
            <KpiCard label="Réservations" value={reservationsList.length} icon="event" gradient={['#f59e0b', '#d97706']} />
            <KpiCard label="Demandes de devis" value={quotesList.length} icon="description" gradient={['#8b5cf6', '#7c3aed']} />
          </div>

          <SectionCard title="Produits les plus demandés" subtitle="Classement par volume de demandes" icon="inventory_2">
            <div className="space-y-5">
              {topProducts.map(([name, qty], idx) => (
                <ProgressBar
                  key={idx}
                  label={`${idx + 1}. ${name}`}
                  value={qty}
                  max={topProductMax}
                  color={['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'][idx % 5]}
                  icon={['inventory_2', 'local_shipping', 'build', 'electrical_services', 'agriculture'][idx % 5]}
                  suffix=" req"
                />
              ))}
              {topProducts.length === 0 && (
                <div className="py-10 text-center">
                  <span className="material-symbols-outlined text-5xl text-gray-200">inventory_2</span>
                  <p className="mt-2 text-sm text-gray-400">Aucune donnée de produits demandés</p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ===== SERVICES ===== */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <SectionCard title="Performance des services" subtitle="Demandes reçues par service" icon="handyman">
            <div className="space-y-5">
              {servicesPerformance.map(([svc, count], idx) => (
                <ProgressBar
                  key={idx}
                  label={svc}
                  value={count}
                  max={servicesPerformance[0]?.[1] || 1}
                  color={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][idx % 5]}
                  icon="task_alt"
                  suffix=" req"
                />
              ))}
              {servicesPerformance.length === 0 && (
                <div className="py-10 text-center">
                  <span className="material-symbols-outlined text-5xl text-gray-200">handyman</span>
                  <p className="mt-2 text-sm text-gray-400">Aucune donnée de services</p>
                </div>
              )}
            </div>
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Répartition des demandes par service" subtitle="Visualisation en anneau" icon="pie_chart">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
                <DonutChart
                  size={180}
                  thickness={24}
                  segments={servicesPerformance.map((svc, idx) => ({
                    value: svc[1],
                    color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][idx % 5],
                  }))}
                />
                <div className="space-y-2">
                  {servicesPerformance.map(([svc, count], idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][idx % 5] }} />
                      <span className="text-sm font-semibold text-gray-700">{svc}</span>
                      <span className="text-sm font-black text-gray-900 ml-auto">{count}</span>
                    </div>
                  ))}
                  {servicesPerformance.length === 0 && <p className="text-sm text-gray-400">Aucune donnée</p>}
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Analyse IA" subtitle="Synthèse intelligente des performances" icon="auto_awesome">
              <div className="space-y-4">
                <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4">
                  <p className="text-sm font-bold text-emerald-800">💡 Meilleur service</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-700">
                    {servicesPerformance[0]
                      ? `"${servicesPerformance[0][0]}" domine avec ${servicesPerformance[0][1]} demande(s) (${Math.round((servicesPerformance[0][1] / Math.max(1, quotesList.length)) * 100)}% du total).`
                      : 'Aucune donnée de service disponible.'}
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4">
                  <p className="text-sm font-bold text-blue-800">📊 Volume global</p>
                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    {servicesPerformance.length > 1
                      ? `${servicesPerformance.length} services actifs · ${quotesList.length} demandes au total · Moyenne de ${(quotesList.length / Math.max(1, servicesPerformance.length)).toFixed(1)} demandes/service.`
                      : 'Un seul service actif pour le moment.'}
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 p-4">
                  <p className="text-sm font-bold text-purple-800">🚀 Prochaines étapes</p>
                  <p className="mt-1 text-xs leading-5 text-purple-700">
                    {servicesPerformance[0] && servicesPerformance[1]
                      ? `Développez "${servicesPerformance[0][0]}" et créez des offres groupées avec "${servicesPerformance[1][0]}" pour augmenter le panier moyen.`
                      : 'Ajoutez plus de services et de produits pour enrichir votre offre.'}
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );

  // Fonction locale pour trier les clients (déclarée après le return pour lisibilité)
  function countries_list_sorted() {
    const list = clientsList;
    if (clientType !== 'ALL') {
      return list.filter(c => c.type_client === clientType);
    }
    return [...list].sort((a, b) => new Date(b.cree_le || 0) - new Date(a.cree_le || 0));
  }
}