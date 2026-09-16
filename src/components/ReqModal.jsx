import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../lib/api';

export default function ReqModal({ onClose, navigateTo }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({ productName: '', category: '', description: '', desiredQuantity: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!token) { navigateTo('login'); return; }
    setIsSubmitting(true);
    try {
      await apiRequest('/product-requests', {
        token,
        method: 'POST',
        body: JSON.stringify({
          productName: formData.productName,
          category: formData.category || undefined,
          description: formData.description || undefined,
          desiredQuantity: formData.desiredQuantity ? Number(formData.desiredQuantity) : undefined,
        }),
      });
      setNotice('Votre demande a ete envoyee. Notre equipe vous contactera rapidement.');
      setFormData({ productName: '', category: '', description: '', desiredQuantity: '' });
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-md transition-colors hover:bg-gray-100">
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#143e22] via-[#2d5f1e] to-[#4a7c59] p-6 text-white">
          <div className="absolute inset-0 bg-[url('/fond-home.png')] opacity-10 bg-cover" />
          <div className="relative pr-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <span className="material-symbols-outlined text-[16px]">search</span>
              Produit non trouvé
            </div>
            <h3 className="mt-2.5 font-display text-xl font-extrabold">Demandez un produit spécifique</h3>
            <p className="mt-1 text-sm text-emerald-100">Décrivez le produit recherché, notre équipe vous recontactera rapidement.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto p-5 space-y-3">
          {notice && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{notice}</div>}
          {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700">Nom du produit recherche *</label>
            <input type="text" name="productName" value={formData.productName} onChange={handleChange} required
              placeholder="Ex: Fil HG 1000 4mm², Goulotte 40x25..."
              className="w-full rounded-2xl border border-gray-200 bg-[#f9fbf9] px-4 py-3 text-sm font-semibold text-[#111827] outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700">Categorie</label>
            <select name="category" value={formData.category} onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 bg-[#f9fbf9] px-4 py-3 text-sm font-semibold text-[#111827] outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20">
              <option value="">Selectionner une categorie...</option>
              <option value="Quincaillerie">Quincaillerie</option>
              <option value="Cables & Electricite">Fils & Electricite</option>
              <option value="Groupes Electrogenes">Groupes Electrogenes</option>
              <option value="Plomberie">Plomberie</option>
              <option value="Peinture & Finition">Peinture & Finition</option>
              <option value="Materiaux de Construction">Materiaux de Construction</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700">Quantite souhaitee</label>
            <input type="number" name="desiredQuantity" value={formData.desiredQuantity} onChange={handleChange} min="0.001" step="0.001" placeholder="Ex: 50"
              className="w-full rounded-2xl border border-gray-200 bg-[#f9fbf9] px-4 py-3 text-sm font-semibold text-[#111827] outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700">Description / Specifications</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Decrivez le produit, les dimensions, la marque..."
              className="w-full rounded-2xl border border-gray-200 bg-[#f9fbf9] px-4 py-3 text-sm font-semibold text-[#111827] outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="rounded-full border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition">Annuler</button>
            <button type="submit" disabled={isSubmitting}
              className="shimmer-btn rounded-full bg-[#143e22] px-7 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-[#143e22]/20 hover:bg-[#1b4c00] active:scale-95 disabled:opacity-60 transition-all">
              {isSubmitting ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}