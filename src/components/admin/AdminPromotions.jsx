import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const COLOR_OPTIONS = [
  { label: 'Aucune', value: 'transparent', text: 'text-gray-900' },
  { label: 'Vert SOUTARAH', value: '#173d23', text: 'text-white' },
  { label: 'Vert clair', value: '#69c33b', text: 'text-white' },
  { label: 'Rouge', value: '#dc2626', text: 'text-white' },
  { label: 'Orange', value: '#f97316', text: 'text-white' },
  { label: 'Ambre', value: '#f59e0b', text: 'text-white' },
  { label: 'Bleu', value: '#2563eb', text: 'text-white' },
  { label: 'Bleu nuit', value: '#1e3a5f', text: 'text-white' },
  { label: 'Violet', value: '#7c3aed', text: 'text-white' },
  { label: 'Rose', value: '#ec4899', text: 'text-white' },
  { label: 'Noir', value: '#111827', text: 'text-white' },
  { label: 'Blanc', value: '#ffffff', text: 'text-gray-900' },
  { label: 'Gris', value: '#6b7280', text: 'text-white' },
];

const FONT_STYLES = [
  { label: 'Normal', value: 'font-normal' },
  { label: 'Gras', value: 'font-bold' },
  { label: 'Extra gras', value: 'font-extrabold' },
  { label: 'Italique', value: 'italic' },
  { label: 'Gras + Italique', value: 'font-bold italic' },
  { label: 'Large', value: 'tracking-widest font-bold' },
];

const STICKER_OPTIONS = [
  { label: 'Aucun', value: '' },
  { label: '🔥', value: '🔥' },
  { label: '⭐', value: '⭐' },
  { label: '🎉', value: '🎉' },
  { label: '🚗', value: '🚗' },
  { label: '⚡', value: '⚡' },
  { label: '💥', value: '💥' },
  { label: '✅', value: '✅' },
  { label: '🏆', value: '🏆' },
  { label: '📢', value: '📢' },
  { label: '🎯', value: '🎯' },
  { label: '🚀', value: '🚀' },
  { label: '💎', value: '💎' },
  { label: '💰', value: '💰' },
];

const DEFAULT_ANNOUNCEMENT = {
  id: null,
  text: '',
  color: 'transparent',
  fontStyle: 'font-bold',
  textSize: 'text-[11px]',
  uppercase: true,
  sticker: '',
  duration: 8,
  enabled: true,
  order: 0,
};

export default function AdminPromotions() {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(false);
  const [barHeight, setBarHeight] = useState(34);

  const loadAnnouncements = async () => {
    try {
      const response = await fetch('/api/admin/announcements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
        if (data.barHeight) setBarHeight(Number(data.barHeight));
      }
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const saveAnnouncements = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ announcements, barHeight }),
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('Erreur lors de l\'enregistrement des annonces');
      }
    } catch (error) {
      console.error('Erreur sauvegarde annonces:', error);
      alert('Erreur lors de l\'enregistrement des annonces');
    } finally {
      setSaving(false);
    }
  };

  const addAnnouncement = () => {
    const newAnn = { ...DEFAULT_ANNOUNCEMENT, id: `ann-${Date.now()}`, order: announcements.length };
    setAnnouncements([...announcements, newAnn]);
    setEditing(newAnn.id);
  };

  const updateAnnouncement = (id, field, value) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const deleteAnnouncement = (id) => {
    if (window.confirm('Supprimer cette annonce ?')) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      if (editing === id) setEditing(null);
    }
  };

  const moveAnnouncement = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= announcements.length) return;
    const newList = [...announcements];
    [newList[index], newList[target]] = [newList[target], newList[index]];
    setAnnouncements(newList.map((a, i) => ({ ...a, order: i })));
  };

  const inputClass = "w-full rounded-xl border border-gray-200 bg-[#f9fbf9] px-4 py-2.5 text-sm font-semibold text-[#111827] outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20";
  const labelClass = "mb-1.5 block text-xs font-bold text-gray-700";
  const cardClass = "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold text-gray-900">Annonces & Barre défilante</h2>
          <p className="mt-1 text-sm text-gray-600">
            Gérez les annonces affichées en haut du site client
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              preview ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            {preview ? 'Masquer' : 'Prévisualiser'}
          </button>
          <button
            onClick={addAnnouncement}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1b4c00]"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Ajouter une annonce
          </button>
        </div>
      </div>

      {/* PM : Aperçu de la barre */}
      {preview && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mt-0.5 mb-3 text-xs font-bold text-gray-500 uppercase">Aperçu sur le site</p>
            <div className="overflow-hidden rounded-xl border border-gray-200" style={{ height: `${barHeight}px` }}>
            <div className="flex h-full items-center overflow-hidden whitespace-nowrap" style={{
              background: announcements[0]?.enabled ? (announcements[0].color === 'transparent' ? 'transparent' : announcements[0].color) : '#173d23',
            }}>
              {(announcements.filter(a => a.enabled).length === 0 ? [DEFAULT_ANNOUNCEMENT] : announcements.filter(a => a.enabled)).map((ann, idx) => (
                <span
                  key={ann.id || idx}
                  className={`inline-flex items-center gap-2 px-7 ${ann.textSize} ${ann.fontStyle} ${ann.uppercase ? 'uppercase' : ''} ${ann.color === 'transparent' ? 'text-gray-900' : 'text-white'}`}
                >
                  {ann.sticker && <span className="text-sm">{ann.sticker}</span>}
                  {ann.text || 'Texte de l\'annonce'}
                  <span className="text-white/30 ml-4">◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Liste des annonces */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className={`${cardClass} text-center py-12`}>
            <span className="material-symbols-outlined text-6xl text-gray-300">campaign</span>
            <h3 className="mt-4 font-display text-xl font-bold text-gray-900">Aucune annonce</h3>
            <p className="mt-2 text-sm text-gray-600">
              Créez votre première annonce pour l'afficher sur le site client
            </p>
            <button
              onClick={addAnnouncement}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1b4c00]"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Créer une annonce
            </button>
          </div>
        ) : (
          announcements.map((ann, index) => {
            const isEditing = editing === ann.id;
            return (
              <div key={ann.id} className={`${cardClass} ${!ann.enabled ? 'opacity-70' : ''}`}>
                {/* En-tête de la carte */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => moveAnnouncement(index, -1)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-primary disabled:opacity-30 transition-colors"
                      title="Monter"
                    >
                      <span className="material-symbols-outlined text-base">arrow_upward</span>
                    </button>
                    <button
                      onClick={() => moveAnnouncement(index, 1)}
                      disabled={index === announcements.length - 1}
                      className="p-1 text-gray-400 hover:text-primary disabled:opacity-30 transition-colors"
                      title="Descendre"
                    >
                      <span className="material-symbols-outlined text-base">arrow_downward</span>
                    </button>
                    <span className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: ann.color }}>
                      {ann.sticker || index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{ann.text || 'Annonce vide'}</p>
                      <p className="text-xs text-gray-500">Position {index + 1}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateAnnouncement(ann.id, 'enabled', !ann.enabled)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${ann.enabled ? 'bg-primary' : 'bg-gray-300'}`}
                      title={ann.enabled ? 'Désactiver' : 'Activer'}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all ${ann.enabled ? 'left-5' : 'left-0.5'}`} />
                    </button>
                    <button
                      onClick={() => setEditing(isEditing ? null : ann.id)}
                      className="p-2 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-50 transition-colors"
                      title={isEditing ? 'Fermer' : 'Modifier'}
                    >
                      <span className="material-symbols-outlined text-[20px]">{isEditing ? 'close' : 'edit'}</span>
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Contenu d'édition */}
                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Texte de l'annonce</label>
                      <input
                        type="text"
                        value={ann.text}
                        onChange={(e) => updateAnnouncement(ann.id, 'text', e.target.value)}
                        placeholder="Ex: -20% sur tous les lots de ciment cette semaine !"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Couleur de fond</label>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_OPTIONS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => updateAnnouncement(ann.id, 'color', color.value)}
                            className={`h-8 w-8 rounded-lg border-2 transition-all ${
                              ann.color === color.value ? 'border-primary scale-110 shadow-md' : 'border-gray-200 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Style du texte</label>
                      <select
                        value={ann.fontStyle}
                        onChange={(e) => updateAnnouncement(ann.id, 'fontStyle', e.target.value)}
                        className={inputClass}
                      >
                        {FONT_STYLES.map((style) => (
                          <option key={style.value} value={style.value}>{style.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Taille du texte</label>
                      <select
                        value={ann.textSize}
                        onChange={(e) => updateAnnouncement(ann.id, 'textSize', e.target.value)}
                        className={inputClass}
                      >
                        <option value="text-[10px]">Très petit</option>
                        <option value="text-[11px]">Petit</option>
                        <option value="text-xs">Normal</option>
                        <option value="text-sm">Moyen</option>
                        <option value="text-base">Grand</option>
                        <option value="text-lg">Très grand</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Durée d'affichage (secondes)</label>
                      <input
                        type="number"
                        min="2"
                        max="30"
                        value={ann.duration}
                        onChange={(e) => updateAnnouncement(ann.id, 'duration', Number(e.target.value))}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Sticker / Emoji</label>
                      <select
                        value={ann.sticker}
                        onChange={(e) => updateAnnouncement(ann.id, 'sticker', e.target.value)}
                        className={inputClass}
                      >
                        {STICKER_OPTIONS.map((sticker) => (
                          <option key={sticker.value} value={sticker.value}>
                            {sticker.label} {sticker.value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Texte en majuscules</label>
                      <button
                        onClick={() => updateAnnouncement(ann.id, 'uppercase', !ann.uppercase)}
                        className={`relative h-7 w-12 rounded-full transition-colors ${ann.uppercase ? 'bg-primary' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all ${ann.uppercase ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelClass}>Aperçu en direct</label>
                        <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: `${barHeight}px` }}>
                        <div className="flex h-full items-center overflow-hidden whitespace-nowrap" style={{ backgroundColor: ann.color === 'transparent' ? 'transparent' : ann.color }}>
                          <span className={`inline-flex items-center gap-2 px-7 ${ann.textSize} ${ann.fontStyle} ${ann.uppercase ? 'uppercase' : ''} ${ann.color === 'transparent' ? 'text-gray-900' : 'text-white'}`}>
                            {ann.sticker && <span className="text-sm">{ann.sticker}</span>}
                            {ann.text || 'Texte de l\'annonce'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Contrôles globaux */}
      {announcements.length > 0 && (
        <div className={cardClass}>
          <h3 className="font-display text-lg font-extrabold text-gray-900 mb-4">Contrôles globaux</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Hauteur de la barre (px)</label>
              <input
                type="range"
                min="24"
                max="60"
                value={barHeight}
                onChange={(e) => setBarHeight(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-xs text-gray-500 mt-1">{barHeight} px</p>
            </div>
          </div>
        </div>
      )}

      {/* Barre d'actions */}
      <div className="flex items-center justify-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        {saved && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 mr-auto">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Annonces enregistrées
          </span>
        )}
        <button
          onClick={saveAnnouncements}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-[#1b4c00] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-colors disabled:opacity-60"
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Enregistrement...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">save</span>
              Enregistrer
            </>
          )}
        </button>
      </div>
    </div>
  );
}