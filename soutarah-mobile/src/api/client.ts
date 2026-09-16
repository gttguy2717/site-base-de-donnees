import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../theme';

const TOKEN_KEY = 'soutarah_token';

// Délai maximum d'attente d'une réponse réseau (ms). Évite de rester bloqué
// sur l'écran de chargement si le serveur est injoignable ou hors-ligne.
// 25 s : la création de devis attend l'envoi d'emails SMTP côté serveur,
// qui peut être lent — un délai trop court provoque une fausse erreur.
const REQUEST_TIMEOUT_MS = 25000;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_URL}${path}`;
  let response: Response;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const fetchPromise = fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      // Sécurité supplémentaire : si la promesse fetch ne se résout jamais,
      // forcer l'annulation au-delà du timeout + petite marge.
      const safetyTimer = setTimeout(() => {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      }, REQUEST_TIMEOUT_MS + 500);
      response = await fetchPromise;
      clearTimeout(safetyTimer);
    } finally {
      clearTimeout(timer);
    }
  } catch (err: unknown) {
    const isAbort =
      err instanceof DOMException && err.name === 'AbortError';
    throw new ApiError(
      isAbort
        ? `Serveur inaccessible (délais dépassés — vérifiez que le backend tourne sur ${API_URL})`
        : 'Impossible de contacter le serveur. Vérifiez votre connexion.',
      0
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || data?.message || `Erreur ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, auth = true) => request<T>(path, { auth }),
  post: <T>(path: string, body: unknown, auth = true) =>
    request<T>(path, { method: 'POST', body, auth }),
  put: <T>(path: string, body: unknown, auth = true) =>
    request<T>(path, { method: 'PUT', body, auth }),
  patch: <T>(path: string, body: unknown, auth = true) =>
    request<T>(path, { method: 'PATCH', body, auth }),
  delete: <T>(path: string, auth = true) => request<T>(path, { method: 'DELETE', auth }),
};
