const API_URL = import.meta.env.VITE_API_URL || '/api';

// Nombre maximal de tentatives automatiques quand le serveur n'est pas encore prêt
const MAX_RETRIES = 5;
// Délai initial avant la première nouvelle tentative (en ms)
const INITIAL_RETRY_DELAY = 800;
// Délai maximal entre deux tentatives (en ms)
const MAX_RETRY_DELAY = 4000;
// Timeout global d'une requête (en ms) - 20 secondes
const REQUEST_TIMEOUT = 20000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function apiRequest(path, { token, retries = MAX_RETRIES, ...options } = {}) {
  let response;
  let payload;
  let attempt = 0;

  while (true) {
    try {
      response = await fetchWithTimeout(`${API_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      }, REQUEST_TIMEOUT);

      payload = await response.json().catch(() => ({}));

      // Le serveur répond 5xx : il n'est peut-être pas encore complètement prêt
      // (base de données en cours d'initialisation au premier démarrage).
      // On retente avec un délai exponentiel au lieu d'abandonner immédiatement.
      if (response.status >= 500 && attempt < retries) {
        attempt += 1;
        const delay = Math.min(INITIAL_RETRY_DELAY * 2 ** (attempt - 1), MAX_RETRY_DELAY);
        await sleep(delay);
        continue;
      }

      break;
    } catch (error) {
      // Erreur réseau ou timeout : le serveur n'est peut-être pas encore prêt
      if (attempt < retries) {
        attempt += 1;
        // Délai exponentiel avec plafond
        const delay = Math.min(INITIAL_RETRY_DELAY * 2 ** (attempt - 1), MAX_RETRY_DELAY);
        await sleep(delay);
        continue;
      }
      throw new Error('Serveur API indisponible. Lancez le backend avec npm run server:start.');
    }
  }

  if (!response.ok) throw new Error(payload.error?.message || payload.error || payload.message || 'Une erreur est survenue.');
  return payload;
}
