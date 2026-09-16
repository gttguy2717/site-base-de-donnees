import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const STATUS_CONFIG = {
  PENDING: { label: 'En attente', classes: 'bg-amber-100 text-amber-700 border-amber-200', icon: 'schedule' },
  ANSWERED: { label: 'Répondu', classes: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'forum' },
  ACCEPTED: { label: 'Accepté', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: 'check_circle' },
  REJECTED: { label: 'Refusé', classes: 'bg-red-100 text-red-700 border-red-200', icon: 'cancel' },
  CONVERTED: { label: 'Converti', classes: 'bg-teal-100 text-teal-700 border-teal-200', icon: 'swap_horiz' },
};

export default function AdminProductRequests() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/product-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        setError('Erreur lors du chargement des demandes');
      }
    } catch (e) {
      console.error('Erreur chargement demandes produits:', e);
      setError('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const clientName = (req) =>
    req.client?.entreprise?.nom ||
    [req.client?.prenom, req.client?.nom].filter(Boolean).join(' ') ||
    req.client?.user?.email ||
    'Client';

  const clientContact = (req) =>
    req.client?.user?.telephone || req.client?.user?.email || '—';

  const formatDate = (val) => {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusConfig = (status) => STATUS_CONFIG[status] || { label: status || '—', classes: 'bg-gray-100 text-gray-700 border-gray-200', icon: 'help' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-extrabold text-gray-900">
            Demandes de produits
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Produits recherchés par les clients et non disponibles au catalogue
          </p>
        </div>
        <button
          onClick={loadRequests}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200"
          title="Rafraîchir"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Rafraîchir
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Chargement des demandes...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {error}
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300">inventory</span>
          <h3 className="mt-4 font-display text-xl font-bold text-gray-900">
            Aucune demande de produit
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Les demandes de produits des clients apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((req) => {
            const status = statusConfig(req.statut);
            return (
              <div key={req.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{req.nom_produit}</h3>
                      {req.categorie && (
                        <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                          <span className="material-symbols-outlined text-[12px]">category</span>
                          {req.categorie}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold whitespace-nowrap ${status.classes}`}>
                    <span className="material-symbols-outlined text-sm">{status.icon}</span>
                    {status.label}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  {req.description && (
                    <p className="text-gray-700">
                      <span className="font-semibold text-gray-900">Description : </span>
                      {req.description}
                    </p>
                  )}
                  {req.quantite_souhaitee != null && (
                    <p className="text-gray-700">
                      <span className="font-semibold text-gray-900">Quantité souhaitée : </span>
                      {Number(req.quantite_souhaitee)}
                    </p>
                  )}
                  {req.commentaire && (
                    <p className="text-gray-700">
                      <span className="font-semibold text-gray-900">Commentaire : </span>
                      {req.commentaire}
                    </p>
                  )}
                  {req.reponse_admin && (
                    <p className="rounded-lg bg-blue-50 px-3 py-2 text-blue-800">
                      <span className="font-semibold">Réponse admin : </span>
                      {req.reponse_admin}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">person</span>
                    <span className="font-semibold text-gray-700">{clientName(req)}</span>
                    <span>·</span>
                    <span>{clientContact(req)}</span>
                  </div>
                  <span>{formatDate(req.cree_le)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
