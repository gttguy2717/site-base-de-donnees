import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminClients() {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    responsibleName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    identificationNumber: '',
    password: '',
    confirmPassword: '',
    delaiBlocageJours: '',
    delaiBlocageUnite: 'jours',
  });

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleClientStatus = async (clientId, currentStatus) => {
    if (!confirm(`Voulez-vous vraiment ${currentStatus ? 'bloquer' : 'débloquer'} ce client ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/clients/${clientId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ est_actif: !currentStatus }),
      });

      if (response.ok) {
        loadClients();
      }
    } catch (error) {
      console.error('Erreur changement statut:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Vérifier que le mot de passe est fourni
    if (!formData.password) {
      setFormError('Le mot de passe est obligatoire.');
      return;
    }

    // Vérifier que les mots de passe correspondent
    if (formData.password !== formData.confirmPassword) {
      setFormError('Les mots de passe ne correspondent pas.');
      return;
    }

    // Vérifier que la ville est fournie
    if (!formData.city?.trim()) {
      setFormError('La ville est obligatoire.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Erreur lors de la création du client');
      }

      setFormSuccess('✅ Entreprise client créée avec succès !');
      setFormData({
        companyName: '',
        responsibleName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        identificationNumber: '',
        password: '',
        confirmPassword: '',
        delaiBlocageJours: '',
        delaiBlocageUnite: 'jours',
      });
      loadClients();
      setTimeout(() => {
        setShowModal(false);
        setFormSuccess('');
      }, 1500);
    } catch (error) {
      setFormError(error.message || 'Erreur lors de la création du client');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Écouter la recherche globale du header admin
  useEffect(() => {
    const handleAdminSearch = (event) => {
      if (event.detail) {
        setSearch(event.detail);
        setFilterType('ALL');
      }
    };
    window.addEventListener('soutarah-admin-search', handleAdminSearch);
    return () => window.removeEventListener('soutarah-admin-search', handleAdminSearch);
  }, []);

  useEffect(() => {
    let filtered = clients;
    if (filterType !== 'ALL') {
      filtered = filtered.filter((c) => c.type_client === filterType);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((c) => {
        const matchName = (
          (c.nom && c.nom.toLowerCase().includes(searchLower)) ||
          (c.prenom && c.prenom.toLowerCase().includes(searchLower))
        );
        const matchContact = (
          (c.utilisateur && c.utilisateur.email && c.utilisateur.email.toLowerCase().includes(searchLower)) ||
          (c.utilisateur && c.utilisateur.telephone && c.utilisateur.telephone.includes(search))
        );
        const matchEnterprise = (
          c.entreprise && c.entreprise.nom && c.entreprise.nom.toLowerCase().includes(searchLower)
        );
        return matchName || matchContact || matchEnterprise;
      });
    }
    setFilteredClients(filtered);
  }, [search, filterType, clients]);

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500',
      orange: 'bg-orange-500', teal: 'bg-teal-500', yellow: 'bg-yellow-500',
      pink: 'bg-pink-500', indigo: 'bg-indigo-500',
    };
    return colors[color] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 min-w-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez et consultez tous vos clients</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              filterType === 'ALL' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>Tous</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${filterType === 'ALL' ? 'bg-white/20' : 'bg-white'}`}>
              {clients.length}
            </span>
          </button>

          <button
            onClick={() => setFilterType('PARTICULIER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              filterType === 'PARTICULIER' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>Particuliers</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${filterType === 'PARTICULIER' ? 'bg-white/20' : 'bg-white'}`}>
              {clients.filter((c) => c.type_client === 'PARTICULIER').length}
            </span>
          </button>

          <button
            onClick={() => setFilterType('ENTREPRISE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              filterType === 'ENTREPRISE' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>Entreprise</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${filterType === 'ENTREPRISE' ? 'bg-white/20' : 'bg-white'}`}>
              {clients.filter((c) => c.type_client === 'ENTREPRISE').length}
            </span>
          </button>

          <button
            onClick={() => setFilterType('ENTREPRISE_CLIENT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              filterType === 'ENTREPRISE_CLIENT' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>Entreprise Client</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${filterType === 'ENTREPRISE_CLIENT' ? 'bg-white/20' : 'bg-white'}`}>
              {clients.filter((c) => c.type_client === 'ENTREPRISE_CLIENT').length}
            </span>
          </button>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <button 
            onClick={() => { setFormError(''); setFormSuccess(''); setShowModal(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-[#1b4c00] text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ml-auto"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Nouvelle entreprise client
          </button>
        </div>
      </div>

      {/* Modal Nouvelle entreprise client */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Nouvelle entreprise client</h2>
                <p className="text-xs text-gray-500 mt-0.5">Créez un compte entreprise pour votre client</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Nom de l'entreprise *</label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Ex: SOUTARAH GROUP SARL"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-700">Responsable</label>
                    <input
                      type="text"
                      name="responsibleName"
                      value={formData.responsibleName}
                      onChange={handleChange}
                      placeholder="Nom du responsable"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-700">N° Identification</label>
                    <input
                      type="text"
                      name="identificationNumber"
                      value={formData.identificationNumber}
                      onChange={handleChange}
                      placeholder="N°CC / RCCM"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-700">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@entreprise.com"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-700">Téléphone *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+225 00 00 00 00"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-700">Adresse</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Cocody, Riviera..."
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-700">Ville *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Abidjan, Bouaké..."
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Délai de blocage automatique</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="delaiBlocageJours"
                      min="1"
                      value={formData.delaiBlocageJours}
                      onChange={handleChange}
                      placeholder="Ex: 30"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                    <select
                      name="delaiBlocageUnite"
                      value={formData.delaiBlocageUnite}
                      onChange={handleChange}
                      className="w-32 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
                    >
                      <option value="jours">Jours</option>
                      <option value="mois">Mois</option>
                      <option value="annees">Années</option>
                    </select>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">Après ce délai, le compte entreprise client sera bloqué automatiquement. Laissez vide pour aucun blocage.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-700">Mot de passe *</label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Choisissez un mot de passe"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-700">Confirmer mot de passe *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirmez le mot de passe"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>
              </div>

              {formError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700">
                  {formSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1b4c00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Création...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">person_add</span>
                      Créer le client
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Téléphone</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Ville</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClients.map((client) => {
                const displayName = client.entreprise?.nom || `${client.prenom || ''} ${client.nom || ''}`.trim();
                const email = client.utilisateur?.email || '';
                const telephone = client.utilisateur?.telephone || '';
                const ville = client.entreprise?.ville || client.ville || '-';
                const isActive = client.utilisateur?.est_actif !== false;
                
                return (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-9 w-9 rounded-lg ${getColorClass(client.color)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm text-gray-900">{displayName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        client.type_client === 'ENTREPRISE' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {client.type_client === 'ENTREPRISE_CLIENT' ? 'Entreprise Client' : client.type_client === 'ENTREPRISE' ? 'Entreprise' : 'Particulier'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 break-all">{email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{telephone}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{ville}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleClientStatus(client.utilisateur_id, isActive)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shadow-sm hover:shadow ${
                          isActive 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                        }`}
                        title={isActive ? 'Cliquer pour bloquer ce compte' : 'Cliquer pour débloquer ce compte'}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isActive ? 'check_circle' : 'block'}
                        </span>
                        {isActive ? 'Actif' : 'Bloqué'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>Aucun client trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}