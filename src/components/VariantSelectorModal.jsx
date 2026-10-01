import React, { useEffect, useMemo, useRef, useState } from 'react';
import { downloadFicheTechnique } from '../lib/ficheTechnique';
import { variantSummary } from '../lib/variantGroups';

// Sélecteur de variante d'un article regroupé : une liste déroulante par
// caractéristique (longueur, section, calibre…) ; la référence concrète est
// résolue à la volée (image + réf à jour) avant l'ajout au panier.
export default function VariantSelectorModal({ group, categories, onClose, onAddToCart }) {
  const [selection, setSelection] = useState(() => {
    const init = {};
    const first = group.variants[0];
    for (const axis of group.axes) init[axis.key] = first?.chars[axis.key] || '';
    return init;
  });

  // Dernière caractéristique modifiée par l'utilisateur : c'est SON choix qui
  // prime quand la combinaison n'existe pas (les autres axes s'ajustent à lui).
  const lastChangedRef = useRef(null);

  const selected = useMemo(
    () =>
      group.variants.find((v) =>
        group.axes.every((a) => (v.chars[a.key] || '') === (selection[a.key] || ''))
      ) || null,
    [group, selection]
  );

  // Toutes les valeurs sont toujours sélectionnables. Si la combinaison
  // demandée n'existe pas comme référence exacte, on retombe sur la variante
  // la plus proche du DERNIER choix fait — ce dernier est toujours respecté.
  useEffect(() => {
    const exact = group.variants.some((v) =>
      group.axes.every((a) => (v.chars[a.key] || '') === (selection[a.key] || ''))
    );
    if (exact) return;
    const changed = lastChangedRef.current;
    const score = (v) =>
      group.axes.filter((a) => (v.chars[a.key] || '') === (selection[a.key] || '')).length;
    const pool =
      changed != null
        ? group.variants.filter((v) => (v.chars[changed] || '') === (selection[changed] || ''))
        : [];
    const candidates = pool.length ? pool : group.variants;
    const best = candidates.reduce((a, b) => (score(b) > score(a) ? b : a), candidates[0]);
    if (!best) return;
    const next = {};
    for (const axis of group.axes) next[axis.key] = best.chars[axis.key] || '';
    setSelection(next);
  });

  // Fermeture par Échap + verrouillage du scroll de la page derrière.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const category = categories?.find((c) => c.id === group.category);
  const chars = selected?.chars || {};
  const summary = variantSummary(group, chars);
  const constants = Object.entries(group.constants || {});

  // Nombre de variantes correspondant exactement à la sélection courante.
  const compatibleCount = group.variants.filter((v) =>
    group.axes.every((a) => (v.chars[a.key] || '') === (selection[a.key] || ''))
  ).length;

  const handleAdd = () => {
    if (!selected) return;
    onAddToCart?.({
      ...selected.product,
      name: summary ? `${group.genericName} — ${summary}` : group.genericName,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Choisir les caractéristiques : ${group.genericName}`}
    >
      <div
        className="relative my-auto w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#e0e6de] bg-white text-[#687169] transition hover:border-primary/40 hover:text-primary"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex h-32 w-32 shrink-0 items-center justify-center self-center overflow-hidden rounded-2xl border border-[#e0e6de] bg-white sm:self-start">
            <img
              src={selected?.product.image || group.image}
              alt={group.genericName}
              className="h-full w-full object-contain p-1"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-primary/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-primary">
                {category?.label || 'Négoce'}
              </span>
              <span className="rounded-lg bg-[#f0f3ee] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#687169]">
                {group.variants.length} variantes
              </span>
            </div>
            <h3 className="mt-2 font-display text-lg font-extrabold leading-tight text-[#172019] sm:text-xl">
              {group.genericName}
            </h3>
            {constants.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {constants.map(([key, c]) => (
                  <span key={key} className="rounded-md bg-[#f5f7f4] px-1.5 py-0.5 text-[10px] font-bold text-[#687169]">
                    {c.label} : {c.value}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-2 line-clamp-2 text-xs text-[#687169]">{group.desc}</p>
          </div>
        </div>

        {/* Listes déroulantes : une par caractéristique — toutes les valeurs
            sont libres de choix ; la référence se résout à la sélection */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {group.axes.map((axis) => (
            <label key={axis.key} className="flex flex-col gap-1.5">
              <span className="flex items-baseline justify-between text-[11px] font-black uppercase tracking-wider text-[#687169]">
                <span>{axis.label}</span>
                <span className="font-bold text-gray-400">{axis.values.length} choix</span>
              </span>
              <select
                value={selection[axis.key] || ''}
                onChange={(e) => {
                  lastChangedRef.current = axis.key;
                  setSelection((s) => ({ ...s, [axis.key]: e.target.value }));
                }}
                className="w-full rounded-xl border border-[#cad7c5] bg-[#f8faf7] px-3 py-2.5 text-sm font-bold text-[#172019] transition focus:border-primary focus:outline-none"
              >
                {axis.values.map((value) => (
                  <option key={value || 'nd'} value={value}>
                    {value || 'Non précisé'}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        {/* Compteur vivant : combien de variantes restent avec ces choix */}
        <p className="mt-3 text-xs font-bold text-[#687169]">
          <span className="text-primary">{compatibleCount}</span>
          {' / '}{group.variants.length} variantes correspondent à votre sélection
        </p>

        {/* Variante résolue + tarification */}
        <div className="mt-4 rounded-2xl border border-[#e0e6de] bg-[#f5f7f4] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Réf. {selected?.product.ref || '—'}
            </p>
          </div>
          {summary && <p className="mt-1 text-sm font-black text-primary">{summary}</p>}
          <p className="mt-1 line-clamp-2 text-xs text-[#687169]">{selected?.product.name}</p>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => selected && downloadFicheTechnique({ product: selected.product, categories })}
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-primary/25 px-3 text-xs font-black text-primary transition hover:bg-primary/5"
          >
            <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
            Télécharger la fiche
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selected}
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-black text-white shadow-md shadow-primary/15 transition hover:bg-[#173d23] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[15px]">shopping_cart</span>
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}
