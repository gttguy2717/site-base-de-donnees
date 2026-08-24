import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';

const STATUS_CONFIG = {
  PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: 'schedule', dot: 'bg-amber-500' },
  CONFIRMED: { label: 'Confirmée', color: 'bg-green-100 text-green-800 border-green-200', icon: 'check_circle', dot: 'bg-green-500' },
  REJECTED: { label: 'Refusée', color: 'bg-red-100 text-red-800 border-red-200', icon: 'cancel', dot: 'bg-red-500' },
  CANCELLED: { label: 'Annulée', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: 'block', dot: 'bg-gray-500' },
  EXPIRED: { label: 'Expirée', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: 'schedule', dot: 'bg-gray-400' },
};

export default function AdminReservations() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('calendar');
  const [listSearch, setListSearch] = useState('');

  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/reservations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
      }
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Écouter la recherche globale du header admin
  useEffect(() => {
    const handleAdminSearch = (event) => {
      if (event.detail) {
        setListSearch(event.detail);
        setViewMode('list');
      }
    };
    window.addEventListener('soutarah-admin-search', handleAdminSearch);
    return () => window.removeEventListener('soutarah-admin-search', handleAdminSearch);
  }, []);

  const updateReservationStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/reservations/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statut: newStatus }),
      });
      if (response.ok) {
        loadReservations();
        setShowModal(false);
        setSelectedReservation(null);
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  // Réservations affichables sur le calendrier
  // Toutes les réservations avec un véhicule et des dates (sauf rejetées/annulées)
  const calendarReservations = useMemo(() => {
    return reservations.filter(r => 
      ['CONFIRMED', 'PENDING', 'EXPIRED'].includes(r.statut) && r.vehicule_id && r.commence_le && r.termine_le
    );
  }, [reservations]);

  // Réservations filtrées selon la recherche globale ou locale
  const filteredReservations = useMemo(() => {
    const q = String(listSearch || '').toLowerCase().trim();
    if (!q) return calendarReservations;
    return calendarReservations.filter((r) => {
      const clientName = getClientName(r).toLowerCase();
      const vehicleName = getVehicleName(r).toLowerCase();
      const reference = String(r.reference || '').toLowerCase();
      return clientName.includes(q) || vehicleName.includes(q) || reference.includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listSearch, calendarReservations]);

  const getClientName = (res) => {
    return res.client?.entreprise?.nom || `${res.client?.prenom || ''} ${res.client?.nom || ''}`.trim() || 'Client';
  };

  const getVehicleName = (res) => {
    return res.vehicule ? `${res.vehicule.marque} ${res.vehicule.modele}` : 'Article';
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  const formatFullDate = (date) => {
    if (!date) return '-';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatMoney = (amount) => {
    return `${Number(amount || 0).toLocaleString('fr-FR')} FCFA`;
  };

  // État d'une réservation par rapport à aujourd'hui
  const getReservationState = (res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(res.commence_le);
    start.setHours(0, 0, 0, 0);
    const end = new Date(res.termine_le);
    end.setHours(0, 0, 0, 0);

    if (end < today) return { label: 'Terminée', color: 'bg-gray-400', textColor: 'text-gray-600', badge: 'bg-gray-100 text-gray-600 border-gray-200', icon: 'history' };
    if (start <= today && end >= today) return { label: 'En cours', color: 'bg-green-500', textColor: 'text-green-700', badge: 'bg-green-100 text-green-700 border-green-200', icon: 'play_circle' };
    return { label: 'À venir', color: 'bg-blue-500', textColor: 'text-blue-700', badge: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'event_upcoming' };
  };

  // Générer les jours du calendrier pour le mois courant + débordement pour afficher les barres
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Premier jour de la semaine (lundi = 0)
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // lundi = 0

    // Jours dans le mois
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Jours du mois précédent pour combler le début
    const prevMonthDays = new Date(year, month, 0).getDate();
    const days = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthDays - i), inCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: new Date(year, month, d), inCurrentMonth: true });
    }

    // Jours du mois suivant pour combler la fin (jusqu'à 42 cellules)
    while (days.length < 42) {
      const lastDay = days[days.length - 1].date;
      days.push({ date: new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + 1), inCurrentMonth: false });
    }

    return { days, year, month };
  }, [currentMonth]);

  // Construire les barres par ligne (véhicule) pour le calendrier
  const calendarRows = useMemo(() => {
    const { days } = calendarData;

    // Grouper par véhicule
    const byVehicle = {};
    calendarReservations.forEach(res => {
      const vehicleId = res.vehicule_id;
      const key = vehicleId || `veh-${res.id}`;
      if (!byVehicle[key]) {
        byVehicle[key] = {
          id: key,
          name: getVehicleName(res),
          image_url: res.vehicule?.image_url || null,
          reservations: [],
        };
      }
      byVehicle[key].reservations.push(res);
    });

    const rows = Object.values(byVehicle).map(vehicle => {
      const bars = [];

      vehicle.reservations.forEach(res => {
        const start = new Date(res.commence_le);
        const end = new Date(res.termine_le);

        // Trouver les indices de début et fin dans days
        let startIdx = -1;
        let endIdx = -1;

        days.forEach((day, i) => {
          const d = new Date(day.date);
          d.setHours(0, 0, 0, 0);
          const s = new Date(start);
          s.setHours(0, 0, 0, 0);
          const e = new Date(end);
          e.setHours(0, 0, 0, 0);

          if (d.getTime() === s.getTime()) startIdx = i;
          if (d.getTime() >= s.getTime() && d.getTime() <= e.getTime()) {
            if (endIdx === -1 || d.getTime() > days[endIdx].date.getTime()) {
              // Tracks the latest day index within range
              if (i > endIdx || endIdx === -1) endIdx = i;
            }
          }
          if (d.getTime() > e.getTime() && i > endIdx && endIdx !== -1) {
            // stop after end
          }
        });

        // Si la réservation chevauche ce mois
        if (startIdx !== -1 || endIdx !== -1) {
          if (startIdx === -1) {
            // La réservation commence avant ce mois
            startIdx = 0;
          }
          if (endIdx === -1) {
            // La réservation se termine après ce mois
            endIdx = days.length - 1;
          }

          const state = getReservationState(res);
          bars.push({
            startIdx,
            endIdx,
            res,
            state,
          });
        }
      });

      return { ...vehicle, bars };
    });

    return rows;
  }, [calendarData, calendarReservations]);

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Statistiques
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const stats = {
    total: calendarReservations.length,
    enCours: calendarReservations.filter(r => {
      const s = new Date(r.commence_le); s.setHours(0, 0, 0, 0);
      const e = new Date(r.termine_le); e.setHours(0, 0, 0, 0);
      return s <= today && e >= today;
    }).length,
    aVenir: calendarReservations.filter(r => {
      const s = new Date(r.commence_le); s.setHours(0, 0, 0, 0);
      return s > today;
    }).length,
    terminees: calendarReservations.filter(r => {
      const e = new Date(r.termine_le); e.setHours(0, 0, 0, 0);
      return e < today;
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Calendrier des locations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Véhicules placés sur le calendrier pour chaque devis approuvé
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              viewMode === 'calendar' ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">calendar_month</span>
            Calendrier
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">list</span>
            Liste
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Locations totales</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-gray-900">{stats.total}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <span className="material-symbols-outlined text-2xl text-blue-600">directions_car</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">En cours</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-green-600">{stats.enCours}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <span className="material-symbols-outlined text-2xl text-green-600">play_circle</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">À venir</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-blue-600">{stats.aVenir}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <span className="material-symbols-outlined text-2xl text-blue-600">event_upcoming</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Terminées</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-gray-500">{stats.terminees}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <span className="material-symbols-outlined text-2xl text-gray-500">history</span>
            </div>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <span className="text-xs font-bold text-gray-500 uppercase">Légende :</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <span className="h-3 w-3 rounded-full bg-blue-500" /> À venir
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <span className="h-3 w-3 rounded-full bg-green-500" /> En cours
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <span className="h-3 w-3 rounded-full bg-gray-400" /> Terminée
        </span>
      </div>

      {/* VUE CALENDRIER */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* En-tête du calendrier */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h3 className="font-display text-xl font-extrabold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-primary border border-primary/20 hover:bg-primary/5 transition-colors"
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Grille calendrier avec colonnes jours */}
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Jours de la semaine */}
              <div className="grid grid-cols-[200px_repeat(7,1fr)] border-b border-gray-200 bg-gray-50/80">
                <div className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">
                  Véhicule
                </div>
                {dayNames.map((day) => (
                  <div key={day} className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase">
                    {day}
                  </div>
                ))}
              </div>

              {/* Lignes par véhicule */}
              {calendarRows.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <span className="material-symbols-outlined text-6xl text-gray-300">calendar_month</span>
                  <p className="mt-2">Aucune location confirmée sur le calendrier</p>
                  <p className="text-xs text-gray-400 mt-1">Les devis approuvés avec véhicule apparaîtront ici</p>
                </div>
              ) : (
                calendarRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-[200px_repeat(7,1fr)] border-b border-gray-100 last:border-b-0">
                    {/* Nom du véhicule */}
                    <div className="flex items-center gap-2 px-4 py-3 border-r border-gray-100 bg-white">
                      {row.image_url ? (
                        <img
                          src={`http://localhost:5000${row.image_url}`}
                          alt={row.name}
                          className="h-9 w-9 rounded-lg object-cover border border-gray-100"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined text-lg">directions_car</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{row.name}</p>
                        <p className="text-[10px] font-semibold text-gray-400">{row.reservations.length} location{row.reservations.length > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {/* 7 cellules de jours (chaque ligne = semaine) */}
                    {Array.from({ length: Math.ceil(42 / 7) }).flatMap((_, weekIdx) => {
                      // Pour chaque semaine, on génère les jours
                      return Array.from({ length: 7 }, (_, dayIdx) => {
                        const dayIndex = weekIdx * 7 + dayIdx;
                        const day = calendarData.days[dayIndex];
                        if (!day) return null;
                        const isToday = day.date.toDateString() === new Date().toDateString();
                        const isWeekend = dayIdx >= 5;

                        // Chercher une barre qui couvre ce jour
                        const bar = row.bars.find(b => dayIndex >= b.startIdx && dayIndex <= b.endIdx);
                        const isStart = bar && dayIndex === bar.startIdx;
                        const isEnd = bar && dayIndex === bar.endIdx;

                        return (
                          <div
                            key={`${weekIdx}-${dayIdx}`}
                            className={`relative min-h-[64px] px-1 py-1 border-r border-gray-100 last:border-r-0 ${
                              isToday ? 'bg-primary/5' : ''
                            } ${!day.inCurrentMonth ? 'bg-gray-50/60' : ''}`}
                          >
                            <span className={`text-[10px] font-bold ${isToday ? 'text-primary' : isWeekend ? 'text-red-400' : 'text-gray-400'}`}>
                              {day.date.getDate()}
                            </span>
                            {bar && (
                              <button
                                onClick={() => {
                                  setSelectedReservation(bar.res);
                                  setShowModal(true);
                                }}
                                className={`absolute left-0 right-0 top-6 mx-0.5 rounded-md px-1.5 py-1 text-left text-[10px] font-bold leading-tight text-white shadow-sm transition hover:brightness-110 hover:shadow-md ${
                                  bar.state.color
                                }`}
                                style={{
                                  marginLeft: isStart ? '2px' : '-1px',
                                  marginRight: isEnd ? '2px' : '-1px',
                                }}
                                title={`${row.name} — ${getClientName(bar.res)} (${formatDate(new Date(bar.res.commence_le))} → ${formatDate(new Date(bar.res.termine_le))})`}
                              >
                                <span className="block truncate">
                                  {isStart ? row.name.split(' ')[0] : ''}
                                  {isStart && bar.res.client ? ' · ' : ''}
                                  {isStart ? (bar.res.client?.prenom?.[0] || '') + (bar.res.client?.nom?.[0] || '') : ''}
                                </span>
                              </button>
                            )}
                          </div>
                        );
                      });
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VUE LISTE */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Véhicule</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">État</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Montant</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReservations.map((res) => {
                  const state = getReservationState(res);
                  const start = new Date(res.commence_le);
                  const end = new Date(res.termine_le);
                  const days = Math.max(1, Math.round((end - start) / 86400000) + 1);
                  return (
                    <tr key={res.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-lg">directions_car</span>
                          </div>
                          <span className="font-semibold text-sm text-gray-900">{getVehicleName(res)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900">{getClientName(res)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {formatDate(start)} → {formatDate(end)}
                        </span>
                        <span className="text-xs text-gray-400 block">{days} jour{days > 1 ? 's' : ''}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${state.badge}`}>
                          <span className="material-symbols-outlined text-xs">{state.icon}</span>
                          {state.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-bold text-gray-900">{formatMoney(res.montant_total)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedReservation(res);
                            setShowModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          Voir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {calendarReservations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <span className="material-symbols-outlined text-6xl text-gray-300">directions_car</span>
              <p className="mt-2">Aucune location confirmée</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL DÉTAILS RÉSERVATION */}
      {showModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#173d23] to-green-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Détails de la location</h3>
                <p className="text-sm text-white/80 mt-1">
                  Ref: {selectedReservation.reference || 'RÉSERVATION'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedReservation(null);
                }}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined text-white">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Badge état */}
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4 border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">État de la location</p>
                  <span className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-full text-sm font-bold border ${getReservationState(selectedReservation).badge}`}>
                    <span className="material-symbols-outlined text-base">{getReservationState(selectedReservation).icon}</span>
                    {getReservationState(selectedReservation).label}
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${(STATUS_CONFIG[selectedReservation.statut] || STATUS_CONFIG.PENDING).color}`}>
                  {(STATUS_CONFIG[selectedReservation.statut] || STATUS_CONFIG.PENDING).label}
                </span>
              </div>

              {/* Véhicule */}
              <div className="rounded-xl border border-gray-100 bg-[#f9fbf9] p-5">
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">directions_car</span>
                  Véhicule
                </h4>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-3xl">directions_car</span>
                  </div>
                  <div>
                    <p className="font-display text-lg font-extrabold text-gray-900">{getVehicleName(selectedReservation)}</p>
                    <p className="text-sm text-gray-500">
                      {selectedReservation.vehicule?.categorie || 'Véhicule'} · {selectedReservation.vehicule?.places || '-'} places
                    </p>
                  </div>
                </div>
              </div>

              {/* Client */}
              <div className="rounded-xl border border-gray-100 bg-[#f9fbf9] p-5">
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">person</span>
                  Client
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Nom</p>
                    <p className="text-sm font-semibold text-gray-900">{getClientName(selectedReservation)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Téléphone</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedReservation.client?.user?.telephone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{selectedReservation.client?.user?.email || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Période */}
              <div className="rounded-xl border border-gray-100 bg-[#f9fbf9] p-5">
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">event</span>
                  Période de location
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Début</p>
                    <p className="text-sm font-semibold text-gray-900">{formatFullDate(new Date(selectedReservation.commence_le))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fin</p>
                    <p className="text-sm font-semibold text-gray-900">{formatFullDate(new Date(selectedReservation.termine_le))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Durée</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {Math.max(1, Math.round((new Date(selectedReservation.termine_le) - new Date(selectedReservation.commence_le)) / 86400000) + 1)} jour(s)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Montant total</p>
                    <p className="text-sm font-extrabold text-primary">{formatMoney(selectedReservation.montant_total)}</p>
                  </div>
                </div>
              </div>

              {/* Commentaire */}
              {selectedReservation.note_gestionnaire && (
                <div className="rounded-xl border border-gray-100 bg-[#f9fbf9] p-5">
                  <p className="text-xs text-gray-500">Commentaire</p>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">{selectedReservation.note_gestionnaire}</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {(selectedReservation.statut === 'PENDING') && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        if (window.confirm('Confirmer cette réservation ?')) {
                          updateReservationStatus(selectedReservation.id, 'CONFIRMED');
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined">check_circle</span>
                      Confirmer
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Refuser cette réservation ?')) {
                          updateReservationStatus(selectedReservation.id, 'REJECTED');
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined">cancel</span>
                      Refuser
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${selectedReservation.client?.user?.telephone || ''}`}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined">call</span>
                    Contacter le client
                  </a>
                  <a
                    href={`mailto:${selectedReservation.client?.user?.email || ''}`}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined">mail</span>
                    Envoyer un message
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}