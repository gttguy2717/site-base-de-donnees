export interface User {
  id: string;
  email: string;
  telephone: string;
  role: 'ADMIN' | 'MANAGER' | 'CLIENT';
  est_actif: boolean;
  avatar_url?: string | null;
  cree_le: string;
}

export interface Company {
  id: string;
  client_id: string;
  nom: string;
  nom_responsable?: string | null;
  numero_identification?: string | null;
}

export interface Client {
  id: string;
  utilisateur_id: string;
  type_client: 'PARTICULIER' | 'ENTREPRISE' | 'ENTREPRISE_CLIENT' | 'PARTENAIRE' | 'GROSSISTE';
  prenom?: string | null;
  nom?: string | null;
  adresse?: string | null;
  cree_le: string;
  entreprise?: Company | null;
}

export interface AuthResponse {
  token: string;
  user: User;
  client?: Client;
}

export interface Vehicle {
  id: string;
  marque: string;
  modele: string;
  categorie: string;
  description?: string | null;
  image_url?: string | null;
  places: number;
  carburant?: string | null;
  transmission?: string | null;
  prix_journalier_particulier: number;
  prix_journalier_entreprise: number;
  prix_journalier_entreprise_client?: number | null;
  disponibilite: boolean;
  statut: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  dailyPrice?: number | null;
}

export interface Reservation {
  id: string;
  client_id: string;
  vehicule_id: string;
  reference: string;
  commence_le: string;
  termine_le: string;
  statut: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
  prix_journalier: number;
  montant_total: number;
  avec_chauffeur: boolean;
  expire_le: string;
  cree_le: string;
  note_gestionnaire?: string | null;
  vehicule?: Vehicle | null;
}

export interface Notification {
  id: string;
  type: string;
  titre: string;
  message: string;
  est_lu: boolean;
  cree_le: string;
}

export interface AvailabilityResponse {
  available: boolean;
  message?: string;
}

export interface RegisterPayload {
  customerType: 'PARTICULIER' | 'ENTREPRISE';
  email: string;
  phone: string;
  password: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  companyName?: string;
  responsibleName?: string;
  identificationNumber?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface CreateReservationPayload {
  vehiculeId: string;
  startDate: string;
  endDate: string;
  withDriver?: boolean;
  pickupLocation?: string;
  destination?: string;
  notes?: string;
}
export type QuoteStatus =
  | 'PENDING'
  | 'SENT'
  | 'CONVERTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

export interface QuoteRequestItem {
  id?: string;
  type?: 'product' | 'vehicle';
  name?: string;
  productName?: string;
  vehicleName?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  startDate?: string;
  endDate?: string;
  days?: number;
  withDriver?: boolean;
  imageUrl?: string | null;
  image_url?: string | null;
}

export interface QuoteRequest {
  id: string;
  reference: string;
  client_id?: string | null;
  utilisateur_id?: string | null;
  source?: string;
  service?: string | null;
  titre?: string | null;
  budget?: string | number | null;
  delai?: string | null;
  description?: string | null;
  entreprise?: string | null;
  nom: string;
  email: string;
  telephone: string;
  lieu?: string | null;
  snapshot?: string | QuoteRequestItem[] | null;
  statut: QuoteStatus;
  mode_paiement?: string | null;
  lu_le?: string | null;
  fichier_devis_url?: string | null;
  cree_le: string;
  mis_a_jour_le?: string | null;
  client?: Client | null;
}

export interface LastOrder {
  reference: string;
  name?: string;
  phone?: string;
  service?: string;
  ht: number;
  tva: number;
  tdt: number;
  carburant: number;
  peage: number;
  ttc: number;
  itemCount: number;
  summaryTitle: string;
  items?: QuoteRequestItem[];
  createdAt: string;
}

export interface BuildQuotePayload {
  service: string;
  title: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  description: string;
  budget?: string;
  items: QuoteRequestItem[];
}

export interface ValidateQuoteResult {
  success: boolean;
  message: string;
  reference?: string;
  quoteRequest?: QuoteRequest | null;
}
