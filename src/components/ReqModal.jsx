import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../lib/api';

export default function ReqModal({ onClose, navigateTo }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({ productName: '', category: '', description: '', desiredQuantity: '', comment: '' });
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
          comment: formData.comment || undefined,
        }),
      });
      setNotice('Votre demande a ete envoyee. Notre equipe vous contactera rapidement.');
      setFormData({ productName: '', category: '', description: '', desiredQuantity: '', comment: '' });
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-lg my-8 overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#173d23] to-green-700 px-6 py-4">
          <div>
            <h3 className="font-display text-lg font-extrabold text-white">Produit non trouve ?</h3>
            <p className="text-xs text-emerald-100/80 mt-0.5">Decrivez le produit que vous recherchez</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/20 hover:text-white transition">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {notice && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{notice}</div>}
          {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700">Nom du produit recherche *</label>
            <input type="text" name="productName" value={formData.productName} onChange={handleChange} required
              placeholder="Ex: Tuyau PVC 50, Cable H200 3x2.5..."
              className="w-full rounded-2xl border border-gray-200 bg-[#f9fbf9] px-4 py-3 text-sm font-semibold text-[#111827] outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700">Categorie</label>
            <select name="category" value={formData.category} onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 bg-[#f9fbf9] px-4 py-3 text-sm font-semibold text-[#111827] outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20">
              <option value="">Selectionner une categorie...</option>
              <option value="Quincaillerie">Quincaillerie</option>
              <option value="Cables & Electricite">Cables & Electricite</option>
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
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Decrivez le produit, les dimensions, la marque..."
              className="w-full rounded-2xl border border-gray-200 bg-[#f9fbf9] px-4 py-3 text-sm font-semibold text-[#111827] outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700">Commentaire</label>
            <textarea name="comment" value={formData.comment} onChange={handleChange} rows={2} placeholder="Informations complementaires..."
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