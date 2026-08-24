import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';
import { AuthContext } from './authContext';

const TOKEN_KEY = 'soutarah_access_token';

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, client: null, token: localStorage.getItem(TOKEN_KEY), ready: false });

  useEffect(() => {
    if (!state.token) {
      setState((current) => ({ ...current, ready: true }));
      return;
    }

    apiRequest('/auth/me', { token: state.token })
      .then(({ user, client }) => setState({ user, client, token: state.token, ready: true }))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setState({ user: null, client: null, token: null, ready: true });
      });
  }, [state.token]);

  const value = useMemo(() => ({
    ...state,
    async login(credentials) {
      const result = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
      localStorage.setItem(TOKEN_KEY, result.token);
      setState({ user: result.user, client: result.client, token: result.token, ready: true });
      
      // Notifier les composants de la mise à jour du panier pour charger celui de l'utilisateur
      window.dispatchEvent(new Event('soutarah-cart-updated'));
      
      return result;
    },
    async register(data) {
      const result = await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) });
      localStorage.setItem(TOKEN_KEY, result.token);
      setState({ user: result.user, client: result.client, token: result.token, ready: true });
      return result;
    },
    async updateProfile(profileData) {
      const result = await apiRequest('/auth/me', {
        method: 'PUT',
        token: state.token,
        body: JSON.stringify(profileData),
      });
      setState((current) => ({ ...current, user: result.user, client: result.client }));
      return result;
    },
    async uploadAvatar(file) {
      const formData = new FormData();
      formData.append('avatar', file);
      const result = await fetch('/api/auth/me/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${state.token}` },
        body: formData,
      });
      if (!result.ok) {
        const err = await result.json().catch(() => ({}));
        throw new Error(err.message || 'Erreur lors de l\'upload de la photo');
      }
      const data = await result.json();
      setState((current) => ({ ...current, user: { ...current.user, avatar_url: data.avatar_url } }));
      return data;
    },
    logout() {
      // Nettoyer le token
      localStorage.removeItem(TOKEN_KEY);
      
      // NE PAS nettoyer le panier de véhicules - il doit persister après déconnexion
      // Les utilisateurs peuvent vouloir continuer leurs réservations plus tard
      
      setState({ user: null, client: null, token: null, ready: true });
      
      // Notifier les composants de la mise à jour du panier
      window.dispatchEvent(new Event('soutarah-cart-updated'));
    },
  }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
