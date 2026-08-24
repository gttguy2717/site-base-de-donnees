const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper pour gérer les requêtes
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
    throw new Error(error.message || `Erreur ${response.status}`);
  }

  return response.json();
}

// ===== CLIENTS =====
export const clientsAPI = {
  getAll: () => fetchAPI('/admin/clients'),
  getById: (id) => fetchAPI(`/admin/clients/${id}`),
  create: (data) => fetchAPI('/admin/clients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/admin/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/admin/clients/${id}`, { method: 'DELETE' }),
};

// ===== PRODUITS / CATALOGUE =====
export const catalogAPI = {
  getCategories: () => fetchAPI('/categories'),
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/products${query ? `?${query}` : ''}`);
  },
  getProductById: (id) => fetchAPI(`/admin/products/${id}`),
  createProduct: (data) => fetchAPI('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => fetchAPI(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => fetchAPI(`/admin/products/${id}`, { method: 'DELETE' }),
};

// ===== VÉHICULES =====
export const vehiclesAPI = {
  getAll: () => fetchAPI('/vehicles'),
  getById: (id) => fetchAPI(`/admin/vehicles/${id}`),
  create: (data) => fetchAPI('/admin/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/admin/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/admin/vehicles/${id}`, { method: 'DELETE' }),
  checkAvailability: (id, startAt, endAt) => fetchAPI(`/vehicles/${id}/availability?startAt=${startAt}&endAt=${endAt}`),
};

// ===== RÉSERVATIONS =====
export const reservationsAPI = {
  getAll: () => fetchAPI('/admin/reservations'),
  getById: (id) => fetchAPI(`/admin/reservations/${id}`),
  updateStatus: (id, status, note) => fetchAPI(`/admin/reservations/${id}/status`, { 
    method: 'PUT', 
    body: JSON.stringify({ statut: status, note_gestionnaire: note }) 
  }),
};

// ===== DEVIS =====
export const quotesAPI = {
  getAll: () => fetchAPI('/admin/quotes'),
  getById: (id) => fetchAPI(`/admin/quotes/${id}`),
  create: (data) => fetchAPI('/admin/quotes', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, status) => fetchAPI(`/admin/quotes/${id}/status`, { method: 'PUT', body: JSON.stringify({ statut: status }) }),
};

// ===== DEMANDES DE DEVIS =====
export const quoteRequestsAPI = {
  getAll: () => fetchAPI('/quote-requests'),
  getById: (id) => fetchAPI(`/quote-requests/${id}`),
  updateStatus: (id, status) => fetchAPI(`/quote-requests/${id}/status`, { method: 'PUT', body: JSON.stringify({ statut: status }) }),
};

// ===== DEMANDES DE PRODUITS =====
export const productRequestsAPI = {
  getAll: () => fetchAPI('/product-requests'),
  getById: (id) => fetchAPI(`/product-requests/${id}`),
  respond: (id, reponse, status) => fetchAPI(`/product-requests/${id}/respond`, { 
    method: 'POST', 
    body: JSON.stringify({ reponse_admin: reponse, statut: status }) 
  }),
};

// ===== DEMANDES DE VÉHICULES =====
export const vehicleRequestsAPI = {
  create: (data) => fetchAPI('/vehicle-requests', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => fetchAPI('/vehicle-requests'),
  updateStatus: (id, status, reponse) => fetchAPI(`/vehicle-requests/${id}/status`, { 
    method: 'PUT', 
    body: JSON.stringify({ statut: status, reponse_admin: reponse }) 
  }),
};

// ===== PROMOTIONS =====
export const promotionsAPI = {
  getAll: () => fetchAPI('/admin/promotions'),
  getActive: () => fetchAPI('/promotions/active'),
  getById: (id) => fetchAPI(`/admin/promotions/${id}`),
  create: (data) => fetchAPI('/admin/promotions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/admin/promotions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/admin/promotions/${id}`, { method: 'DELETE' }),
};

// ===== STOCKS =====
export const stockAPI = {
  getMovements: (productId) => fetchAPI(`/admin/stock/movements${productId ? `?productId=${productId}` : ''}`),
  addMovement: (data) => fetchAPI('/admin/stock/movements', { method: 'POST', body: JSON.stringify(data) }),
  getLowStock: () => fetchAPI('/admin/stock/alerts'),
};

// ===== NOTIFICATIONS =====
export const notificationsAPI = {
  getAll: () => fetchAPI('/notifications'),
  markAsRead: (id) => fetchAPI(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: () => fetchAPI('/notifications/read-all', { method: 'PUT' }),
};

// ===== DASHBOARD / STATS =====
export const dashboardAPI = {
  getStats: () => fetchAPI('/admin/dashboard/stats'),
  getRecentActivity: () => fetchAPI('/admin/dashboard/activity'),
  getAlerts: () => fetchAPI('/admin/dashboard/alerts'),
};

export default {
  clients: clientsAPI,
  catalog: catalogAPI,
  vehicles: vehiclesAPI,
  reservations: reservationsAPI,
  quotes: quotesAPI,
  quoteRequests: quoteRequestsAPI,
  productRequests: productRequestsAPI,
  vehicleRequests: vehicleRequestsAPI,
  promotions: promotionsAPI,
  stock: stockAPI,
  notifications: notificationsAPI,
  dashboard: dashboardAPI,
};
