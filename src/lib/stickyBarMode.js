/**
 * Bascule « barre d'onglets » <-> « navbar » pour les pages négoce et location.
 *
 * Comportement demandé :
 *  - en descendant dans la page, la barre d'onglets prend la place de la navbar ;
 *  - en remontant, PLUS RIEU ne change : les onglets restent en place ;
 *  - un bouton à gauche permet d'afficher la navbar à la place des onglets,
 *    et un second bouton (dans la navbar) de revenir aux onglets.
 *
 * Le mode est partagé entre la navbar et la barre via un petit store global
 * (les deux composants sont frères, sans parent commun).
 */
import { useEffect, useState } from 'react';

export const BAR_MODE = 'bar'; // les onglets sont affichés
export const NAV_MODE = 'nav'; // la navbar est affichée

let mode = BAR_MODE;
let pinned = false; // true dès que l'utilisateur a fait défiler la page
const subscribers = new Set();

function emit() {
  subscribers.forEach((fn) => fn());
}

export function getMode() {
  return mode;
}

export function getPinned() {
  return pinned;
}

/**
 * Affiche la navbar à la place des onglets (bouton « Menu »).
 * L'état est maintenu jusqu'au prochain défilement vers le bas.
 */
export function showNavbar() {
  if (mode !== NAV_MODE) {
    mode = NAV_MODE;
    emit();
  }
}

/**
 * Les onglets reprennent la main. Appelé :
 *  - au premier défilement de la page ;
 *  - à chaque nouveau défilement vers le bas (le swipe redonne la main
 *    aux onglets même si la navbar avait été ouverte au bouton).
 */
export function showBar() {
  const changed = !pinned || mode !== BAR_MODE;
  pinned = true;
  mode = BAR_MODE;
  if (changed) emit();
}

/**
 * Retour en haut de page : la navbar redevient visible.
 * Sans cette règle, remonter toute la page laissait les onglets en place et
 * la navbar masquée, ce qui produisait un espace vide en haut.
 */
export function showNavbarAtTop() {
  const changed = pinned || mode !== NAV_MODE;
  pinned = false;
  mode = NAV_MODE;
  if (changed) emit();
}

/** La navbar est masquée uniquement quand les onglets sont en charge. */
export function isNavbarHidden() {
  return pinned && mode === BAR_MODE;
}

export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/** Réinitialise l'état (changement de page) : navbar et onglets visibles. */
export function resetBarMode() {
  const changed = pinned || mode !== BAR_MODE;
  mode = BAR_MODE;
  pinned = false;
  if (changed) emit();
}

/** Hook pour lire le mode courant et rester notifié des changements. */
export function useBarMode() {
  const [state, setState] = useState(() => ({ mode, pinned }));
  useEffect(() => subscribe(() => setState({ mode, pinned })), []);
  return state;
}
