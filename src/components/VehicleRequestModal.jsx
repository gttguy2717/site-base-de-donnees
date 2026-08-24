import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function VehicleRequestModal({ onClose, navigateTo }) {
  const { user, client, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    vehicleName: '',
    description: '',
    name: client?.entreprise?.nom || `${client?.prenom || ''} ${client?.nom || ''}`.trim() || '',
    phone: user?.telephone || '',
    email: user?.email || '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Envoyer la demande de véhicule (avec ou sans token)
      const response = await fetch('/api/vehicle-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          nom_vehicule: formData.vehicleName,
          description: formData.description,
          nom: formData.name,
          telephone: formData.phone,
          email: formData.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de l\'envoi de la demande');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative my-8 w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-md transition-colors hover:bg-gray-100"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="relative min-h-[200px] overflow-hidden bg-gradient-to-br from-[#143e22] via-[#2d5f1e] to-[#4a7c59] p-8 text-white">
          <div className="absolute inset-0 bg-[url('/fond-home.png')] opacity-10 bg-cover" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <span className="material-symbols-outlined text-[16px]">search</span>
              Véhicule non trouvé
            </div>
            <h2 className="mt-4 font-display text-3xl font-extrabold">Demandez un véhicule spécifique</h2>
            <p className="mt-2 text-sm text-emerald-100">Notre équipe vous recontactera rapidement pour vous proposer une solution adaptée.</p>
          </div>
        </div>

        <div className="p-8">
          {success ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
              <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
              <h3 className="mt-3 font-display text-xl font-bold text-green-900">Demande reçue avec succès !</h3>
              <p className="mt-2 text-sm text-green-700">
                Votre demande pour <strong>{formData.vehicleName}</strong> a bien été enregistrée.
              </p>
              <p className="mt-1 text-sm text-green-700">
                Notre équipe vous contactera très prochainement au <strong>{formData.phone}</strong> pour vous proposer une solution adaptée.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-green-600">
                <span className="material-symbols-outlined text-base">notifications_active</span>
                {user ? 'Vous recevrez également une notification' : 'Un email de confirmation vous sera envoyé'}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-gray-900">Quel véhicule recherchez-vous ? *</span>
                  <input
                    name="vehicleName"
                    type="text"
                    required
                    value={formData.vehicleName}
                    onChange={handleChange}
                    placeholder="Ex: Toyota Land Cruiser V8, Mercedes Sprinter..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>
              </div>

              <div>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-gray-900">Détails complémentaires (optionnel)</span>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Précisez vos besoins: durée, destination, nombre de places..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>
              </div>

              {!user && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-gray-900">Nom complet *</span>
                      <input
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-gray-900">Téléphone *</span>
                      <input
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="00225..."
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-gray-900">Email *</span>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                </>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-[#1b4c00] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      Envoyer la demande
                      <span className="material-symbols-outlined text-base">send</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
