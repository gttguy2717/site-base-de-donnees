/**
 * Garde d'authentification pour l'action « Demander un devis ».
 *
 * Quel que soit le bouton cliqué (hero, barre de navigation, bannière, service…),
 * on force le visiteur à se connecter avant de pouvoir demander un devis.
 * Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion.
 * S'il est connecté, on ouvre la modale de demande de devis.
 */
export function openDevisByAuth({ user, navigateTo, onAuthed }) {
  if (!user) {
    if (navigateTo) navigateTo('login');
    return;
  }
  if (typeof onAuthed === 'function') onAuthed();
}