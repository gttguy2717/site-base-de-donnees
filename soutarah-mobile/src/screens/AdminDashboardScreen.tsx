import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Dimensions,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../contexts/AuthContext';
import { api, getToken } from '../api/client';
import { colors, API_URL } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 600;
const SIDEBAR_WIDTH = Math.min(300, SCREEN_WIDTH * 0.82);
const LOGO = require('../../assets/logo-soutarah.png');

// ─── Types ────────────────────────────────────────────────────────────────
type AdminSection =
  | 'dashboard'
  | 'clients'
  | 'vehicles'
  | 'quotes'
  | 'reservations'
  | 'notifications'
  | 'settings';

type ReservationFilterTab = 'ALL' | 'CURRENT' | 'UPCOMING' | 'COMPLETED';

interface DashboardStats {
  clients?: { total: number; nouveau: number };
  devis?: { total: number; enAttente: number };
  reservations?: { total: number; enCours: number };
}

interface ClientItem {
  id: string;
  utilisateur_id?: string;
  prenom?: string | null;
  nom?: string | null;
  email?: string;
  telephone?: string;
  type_client: string;
  ville?: string | null;
  entreprise?: {
    nom?: string;
    nom_responsable?: string | null;
    numero_identification?: string | null;
  } | null;
  utilisateur?: {
    id?: string;
    email?: string;
    telephone?: string;
    est_actif?: boolean;
    avatar_url?: string | null;
  } | null;
  est_actif?: boolean;
  cree_le?: string;
}

interface VehicleItem {
  id: string;
  marque: string;
  modele: string;
  categorie: string;
  description?: string | null;
  image_url?: string | null;
  places?: number;
  carburant?: string | null;
  transmission?: string | null;
  prix_journalier_particulier: number;
  prix_journalier_entreprise: number;
  disponibilite: boolean;
  statut: string;
}

interface QuoteItem {
  id: string;
  reference?: string;
  titre?: string;
  service?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  lieu?: string;
  delai?: string;
  budget?: string | number;
  montant?: number;
  montant_total?: number;
  statut: string;
  cree_le?: string;
  date?: string;
  fichier_devis_url?: string | null;
  client?: {
    id?: string;
    prenom?: string;
    nom?: string;
    user?: { email?: string; telephone?: string };
  } | null;
}

interface ReservationItem {
  id: string;
  reference?: string;
  commence_le?: string;
  termine_le?: string;
  statut: string;
  montant_total?: number;
  prix_journalier?: number;
  avec_chauffeur?: boolean;
  cree_le?: string;
  vehicule?: {
    id?: string;
    marque?: string;
    modele?: string;
    image_url?: string | null;
  } | null;
  client?: {
    prenom?: string;
    nom?: string;
    user?: { email?: string; telephone?: string };
  } | null;
}

interface NotificationItem {
  id: string;
  titre: string;
  message: string;
  type?: string;
  est_lu: boolean;
  cree_le: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
const formatMoney = (value: number | string | undefined | null): string => {
  const n = Number(value || 0);
  return n.toLocaleString('fr-FR') + ' FCFA';
};

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getInitials = (first?: string | null, last?: string | null): string => {
  const f = (first || '').trim().charAt(0).toUpperCase();
  const l = (last || '').trim().charAt(0).toUpperCase();
  return f + l || 'AD';
};

const getFullAvatarUrl = (avatarUrl?: string | null): string | null => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
};

const getVehicleImageUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('file://')) {
    return url;
  }
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getFullDocumentUrl = (docUrl?: string | null): string | null => {
  if (!docUrl) return null;
  if (docUrl.startsWith('http')) return docUrl;
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${docUrl.startsWith('/') ? '' : '/'}${docUrl}`;
};

// Calcule la durée en jours entre deux dates ISO
const getDurationInDays = (startStr?: string, endStr?: string): number => {
  if (!startStr || !endStr) return 1;
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
};

// Détermine l'état temporel de la réservation
const getReservationTimeStatus = (res: ReservationItem): { label: string; color: string; bg: string; type: 'CURRENT' | 'UPCOMING' | 'COMPLETED' } => {
  const now = new Date();
  const start = res.commence_le ? new Date(res.commence_le) : now;
  const end = res.termine_le ? new Date(res.termine_le) : now;

  if (now >= start && now <= end) {
    return { label: 'En cours', color: '#15803d', bg: '#dcfce7', type: 'CURRENT' };
  } else if (now < start) {
    return { label: 'À venir', color: '#0284c7', bg: '#e0f2fe', type: 'UPCOMING' };
  } else {
    return { label: 'Terminée', color: '#64748b', bg: '#f1f5f9', type: 'COMPLETED' };
  }
};

// ─── Sidebar Menu Items ───────────────────────────────────────────────────
interface NavItemDef {
  key: AdminSection;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  badgeKey?: 'quotes' | 'notifications' | 'reservations';
}

const NAV_ITEMS: NavItemDef[] = [
  { key: 'dashboard', label: 'Tableau de bord', icon: 'grid-outline' },
  { key: 'clients', label: 'Clients', icon: 'people-outline' },
  { key: 'vehicles', label: 'Catalogue', icon: 'car-sport-outline' },
  { key: 'quotes', label: 'Devis', icon: 'document-text-outline', badgeKey: 'quotes' },
  { key: 'reservations', label: 'Réservations', icon: 'calendar-outline', badgeKey: 'reservations' },
];

const SECTION_TITLES: Record<AdminSection, string> = {
  dashboard: 'Tableau de bord',
  clients: 'Clients',
  vehicles: 'Catalogue',
  quotes: 'Devis',
  reservations: 'Réservations',
  notifications: 'Notifications',
  settings: 'Paramètres',
};

// ─── Main Component ───────────────────────────────────────────────────────
export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, refreshProfile } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingQuoteId, setUploadingQuoteId] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // UI / Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState<'ALL' | 'PARTICULIER' | 'ENTREPRISE'>('ALL');
  const [quoteFilter, setQuoteFilter] = useState<'ALL' | 'PENDING' | 'SENT'>('ALL');
  const [resTabFilter, setResTabFilter] = useState<ReservationFilterTab>('ALL');
  const [resViewMode, setResViewMode] = useState<'CALENDAR' | 'LIST'>('CALENDAR');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());
  const [calendarMonthOffset, setCalendarMonthOffset] = useState<number>(0);
  const [vehicleCatFilter, setVehicleCatFilter] = useState('Tous');
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'UNREAD' | 'RESERVATIONS' | 'QUOTES' | 'CLIENTS'>('ALL');

  // Modals
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleItem | null>(null);
  const [vehicleForm, setVehicleForm] = useState({
    marque: '',
    modele: '',
    categorie: 'SUV',
    places: '5',
    carburant: 'Essence',
    transmission: 'Automatique',
    prix_journalier_particulier: '',
    prix_journalier_entreprise: '',
    image_url: '',
    description: '',
  });

  const [showAddClient, setShowAddClient] = useState(false);
  const [clientForm, setClientForm] = useState({
    companyName: '',
    responsibleName: '',
    email: '',
    phone: '',
    city: 'Abidjan',
    password: '',
    confirmPassword: '',
  });

  // Settings states
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsSection, setSettingsSection] = useState<'profile' | 'company' | 'notifs'>('profile');
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Administrateur',
  });
  const [companyForm, setCompanyForm] = useState({
    name: 'SOUTARAH GROUP',
    address: 'Abidjan, Riviera-Palmeraie SIPIM 4',
    phone: '+225 07 18 38 38 38',
    email: 'contact@soutarah.com',
    website: 'www.soutarah.com',
    description: 'Négoce de quincaillerie, plomberie, fournitures BTP, énergie solaire, location de véhicules et gestion de projets.',
  });
  const [notifSettings, setNotifSettings] = useState({
    newQuote: true,
    newClient: true,
    newReservation: true,
    emailAlerts: true,
  });

  // ─── Data fetching ──────────────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    try {
      const [
        statsRes,
        clientsRes,
        vehiclesRes,
        quotesRes,
        reservationsRes,
        notifRes,
        settingsRes,
      ] = await Promise.all([
        api.get<{ stats?: DashboardStats }>('/admin/dashboard/stats').catch(() => null),
        api.get<{ clients?: ClientItem[] }>('/admin/clients').catch(() => null),
        api.get<{ vehicles?: VehicleItem[] }>('/admin/vehicles').catch(() => null),
        api.get<{ quotes?: QuoteItem[] }>('/admin/quotes').catch(() => null),
        api.get<{ reservations?: ReservationItem[] }>('/admin/reservations').catch(() => null),
        api.get<{ notifications?: NotificationItem[] }>('/admin/notifications').catch(() => null),
        api.get<{ settings?: any }>('/admin/settings').catch(() => null),
      ]);

      if (statsRes?.stats) setStats(statsRes.stats);
      if (clientsRes?.clients) setClients(clientsRes.clients);
      if (vehiclesRes?.vehicles) setVehicles(vehiclesRes.vehicles);
      if (quotesRes?.quotes) setQuotes(quotesRes.quotes);
      if (reservationsRes?.reservations) setReservations(reservationsRes.reservations);
      if (notifRes?.notifications) setNotifications(notifRes.notifications);

      if (settingsRes?.settings) {
        const s = settingsRes.settings;
        if (s.profile) setProfileForm(prev => ({ ...prev, ...s.profile }));
        if (s.company) setCompanyForm(prev => ({ ...prev, ...s.company }));
        if (s.notifications) setNotifSettings(prev => ({ ...prev, ...s.notifications }));
      }
    } catch (error) {
      console.error('Erreur chargement données admin:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.email?.split('@')[0] || 'Admin',
        email: user.email || '',
        phone: user.telephone || '',
      }));
    }
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllData();
  }, [fetchAllData]);

  // ─── Avatar Upload Handler ──────────────────────────────────────────────
  const handlePickAndUploadAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission requise', "Veuillez autoriser l'accès à vos photos pour modifier votre avatar.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.[0]) return;

      setUploadingAvatar(true);
      const uri = result.assets[0].uri;
      const token = await getToken();
      const formData = new FormData();
      formData.append('avatar', {
        uri,
        name: `admin-avatar-${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);

      const res = await fetch(`${API_URL}/auth/me/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        await refreshProfile();
        Alert.alert('Succès', 'Photo de profil administrateur mise à jour !');
      } else {
        Alert.alert('Erreur', 'Impossible de mettre à jour la photo sur le serveur.');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      Alert.alert('Erreur', 'Une erreur est survenue lors du téléversement.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ─── Vehicle Image Picker Handler ───────────────────────────────────────
  const handlePickVehicleImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission requise', "Veuillez autoriser l'accès aux photos pour choisir l'image du véhicule.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const uri = result.assets[0].uri;
      setVehicleForm(prev => ({ ...prev, image_url: uri }));
    } catch (err) {
      console.error('Vehicle image picker error:', err);
    }
  };

  // ─── Signed Quote Upload Handler ─────────────────────────────────────────
  const handleUploadSignedQuote = async (quote: QuoteItem) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      setUploadingQuoteId(quote.id);
      const token = await getToken();

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name || `devis-${quote.reference || quote.id}-signed.pdf`,
        type: file.mimeType || 'application/pdf',
      } as any);

      const res = await fetch(`${API_URL}/admin/quotes/${quote.id}/upload-signed`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        await api.put(`/admin/quotes/${quote.id}/status`, { statut: 'SENT' }).catch(() => {});
        fetchAllData();
        Alert.alert('Succès', `Le devis signé (${file.name}) a été téléversé et transmis au client avec le statut "Envoyé".`);
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert('Erreur', err.message || 'Échec du téléversement du devis signé.');
      }
    } catch (err) {
      console.error('Upload signed quote error:', err);
      Alert.alert('Erreur', 'Impossible de téléverser le document.');
    } finally {
      setUploadingQuoteId(null);
    }
  };

  const handleSendQuoteDirect = async (quote: QuoteItem) => {
    try {
      await api.put(`/admin/quotes/${quote.id}/status`, { statut: 'SENT' });
      setQuotes(prev => prev.map(q => (q.id === quote.id ? { ...q, statut: 'SENT' } : q)));
      Alert.alert('Succès', `Le devis ${quote.reference || ''} a été marqué comme "Envoyé" au client.`);
    } catch {
      Alert.alert('Erreur', "Impossible d'envoyer le devis.");
    }
  };

  const handleOpenSignedDoc = (docUrl?: string | null) => {
    const fullUrl = getFullDocumentUrl(docUrl);
    if (!fullUrl) {
      Alert.alert('Document indisponible', 'Aucun fichier associé à ce devis.');
      return;
    }
    Linking.openURL(fullUrl).catch(() => {
      Alert.alert('Erreur', "Impossible d'ouvrir le document.");
    });
  };

  // ─── Actions ────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter du compte administrateur ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleToggleClientStatus = async (client: ClientItem) => {
    const currentStatus = client.utilisateur?.est_actif ?? client.est_actif ?? true;
    const newStatus = !currentStatus;
    try {
      await api.put(`/admin/clients/${client.id}/status`, { est_actif: newStatus });
      setClients(prev =>
        prev.map(c =>
          c.id === client.id
            ? {
                ...c,
                est_actif: newStatus,
                utilisateur: c.utilisateur ? { ...c.utilisateur, est_actif: newStatus } : c.utilisateur,
              }
            : c
        )
      );
      Alert.alert('Succès', `Client ${newStatus ? 'activé' : 'désactivé'} avec succès`);
    } catch {
      Alert.alert('Erreur', 'Impossible de modifier le statut du client');
    }
  };

  const handleCreateClient = async () => {
    if (!clientForm.companyName || !clientForm.email || !clientForm.phone || !clientForm.password) {
      Alert.alert('Champs requis', 'Veuillez renseigner tous les champs obligatoires.');
      return;
    }
    if (clientForm.password !== clientForm.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      await api.post('/admin/clients', clientForm);
      setShowAddClient(false);
      setClientForm({
        companyName: '',
        responsibleName: '',
        email: '',
        phone: '',
        city: 'Abidjan',
        password: '',
        confirmPassword: '',
      });
      fetchAllData();
      Alert.alert('Succès', 'Entreprise cliente créée avec succès');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Impossible de créer le client');
    }
  };

  const handleToggleVehicleAvailability = async (vehicle: VehicleItem) => {
    try {
      const newAvail = !vehicle.disponibilite;
      await api.put(`/admin/vehicles/${vehicle.id}`, {
        disponibilite: newAvail,
      });
      setVehicles(prev => prev.map(v => (v.id === vehicle.id ? { ...v, disponibilite: newAvail } : v)));
    } catch {
      Alert.alert('Erreur', 'Impossible de modifier la disponibilité');
    }
  };

  const handleSaveVehicle = async () => {
    if (!vehicleForm.marque || !vehicleForm.modele || !vehicleForm.prix_journalier_particulier) {
      Alert.alert('Champs requis', 'Veuillez renseigner la marque, le modèle et le prix particulier.');
      return;
    }
    try {
      const payload = {
        marque: vehicleForm.marque.trim(),
        modele: vehicleForm.modele.trim(),
        categorie: vehicleForm.categorie || 'SUV',
        places: Number(vehicleForm.places) || 5,
        carburant: vehicleForm.carburant || 'Essence',
        transmission: vehicleForm.transmission || 'Automatique',
        prix_journalier_particulier: Number(vehicleForm.prix_journalier_particulier),
        prix_journalier_entreprise: Number(
          vehicleForm.prix_journalier_entreprise || vehicleForm.prix_journalier_particulier
        ),
        image_url: vehicleForm.image_url.trim() || null,
        description: vehicleForm.description.trim() || null,
      };

      if (editingVehicle) {
        await api.put(`/admin/vehicles/${editingVehicle.id}`, payload);
      } else {
        await api.post('/admin/vehicles', payload);
      }
      setShowAddVehicle(false);
      setEditingVehicle(null);
      setVehicleForm({
        marque: '',
        modele: '',
        categorie: 'SUV',
        places: '5',
        carburant: 'Essence',
        transmission: 'Automatique',
        prix_journalier_particulier: '',
        prix_journalier_entreprise: '',
        image_url: '',
        description: '',
      });
      fetchAllData();
      Alert.alert('Succès', editingVehicle ? 'Véhicule mis à jour' : 'Véhicule ajouté au catalogue');
    } catch {
      Alert.alert('Erreur', "Impossible d'enregistrer le véhicule");
    }
  };

  const handleDeleteVehicle = (vehicle: VehicleItem) => {
    Alert.alert('Confirmation', `Supprimer définitivement ${vehicle.marque} ${vehicle.modele} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/vehicles/${vehicle.id}`);
            setVehicles(prev => prev.filter(v => v.id !== vehicle.id));
            Alert.alert('Succès', 'Véhicule supprimé');
          } catch {
            Alert.alert('Erreur', 'Impossible de supprimer le véhicule');
          }
        },
      },
    ]);
  };

  const handleMarkNotificationRead = async (notifId: string) => {
    try {
      await api.put(`/admin/notifications/${notifId}/read`, {});
      setNotifications(prev => prev.map(n => (n.id === notifId ? { ...n, est_lu: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.put('/admin/notifications/read-all', {});
      setNotifications(prev => prev.map(n => ({ ...n, est_lu: true })));
      Alert.alert('Succès', 'Toutes les notifications ont été marquées comme lues');
    } catch {
      Alert.alert('Erreur', 'Impossible de marquer les notifications');
    }
  };

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      await api.put('/admin/settings', {
        settings: {
          profile: profileForm,
          company: companyForm,
          notifications: notifSettings,
        },
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
      Alert.alert('Succès', 'Paramètres sauvegardés avec succès');
    } catch {
      Alert.alert('Erreur', "Impossible d'enregistrer les paramètres");
    } finally {
      setSettingsLoading(false);
    }
  };

  // ─── Filtered Data ──────────────────────────────────────────────────────
  const unreadNotifCount = useMemo(() => notifications.filter(n => !n.est_lu).length, [notifications]);
  const pendingQuotesCount = useMemo(
    () => quotes.filter(q => ['PENDING', 'ISSUED', 'CONTACTED'].includes((q.statut || '').toUpperCase())).length,
    [quotes]
  );
  const pendingResCount = useMemo(
    () => reservations.filter(r => (r.statut || '').toUpperCase() === 'PENDING').length,
    [reservations]
  );

  const filteredClients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return clients.filter(c => {
      const email = (c.utilisateur?.email || c.email || '').toLowerCase();
      const phone = (c.utilisateur?.telephone || c.telephone || '').toLowerCase();
      const name = `${c.prenom || ''} ${c.nom || ''}`.toLowerCase();
      const company = (c.entreprise?.nom || '').toLowerCase();
      const matchesSearch = !q || email.includes(q) || phone.includes(q) || name.includes(q) || company.includes(q);
      const isEntreprise = c.type_client.includes('ENTREPRISE') || !!c.entreprise;
      const matchesFilter =
        clientFilter === 'ALL' ||
        (clientFilter === 'ENTREPRISE' && isEntreprise) ||
        (clientFilter === 'PARTICULIER' && !isEntreprise);
      return matchesSearch && matchesFilter;
    });
  }, [clients, searchQuery, clientFilter]);

  const filteredVehicles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return vehicles.filter(v => {
      const title = `${v.marque} ${v.modele}`.toLowerCase();
      const matchesSearch = !q || title.includes(q) || v.categorie.toLowerCase().includes(q);
      const matchesCategory = vehicleCatFilter === 'Tous' || v.categorie === vehicleCatFilter;
      return matchesSearch && matchesCategory;
    });
  }, [vehicles, searchQuery, vehicleCatFilter]);

  const filteredQuotes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return quotes.filter(item => {
      const ref = (item.reference || '').toLowerCase();
      const clientName = `${item.client?.prenom || ''} ${item.client?.nom || ''} ${item.nom || ''}`.toLowerCase();
      const service = (item.service || item.titre || '').toLowerCase();
      const matchesSearch = !q || ref.includes(q) || clientName.includes(q) || service.includes(q);
      
      const st = (item.statut || '').toUpperCase();
      const isSent = ['SENT', 'APPROVED'].includes(st);
      const isPending = ['PENDING', 'ISSUED', 'CONTACTED'].includes(st);

      const matchesFilter =
        quoteFilter === 'ALL' ||
        (quoteFilter === 'PENDING' && isPending) ||
        (quoteFilter === 'SENT' && isSent);

      return matchesSearch && matchesFilter;
    });
  }, [quotes, searchQuery, quoteFilter]);

  // Filtrage des réservations selon l'onglet : Locations totales, En cours, À venir, Terminées
  const filteredReservations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return reservations.filter(r => {
      const ref = (r.reference || '').toLowerCase();
      const clientName = `${r.client?.prenom || ''} ${r.client?.nom || ''}`.toLowerCase();
      const vehName = `${r.vehicule?.marque || ''} ${r.vehicule?.modele || ''}`.toLowerCase();
      const matchesSearch = !q || ref.includes(q) || clientName.includes(q) || vehName.includes(q);

      const timeStatus = getReservationTimeStatus(r);
      const matchesTab =
        resTabFilter === 'ALL' ||
        (resTabFilter === 'CURRENT' && timeStatus.type === 'CURRENT') ||
        (resTabFilter === 'UPCOMING' && timeStatus.type === 'UPCOMING') ||
        (resTabFilter === 'COMPLETED' && timeStatus.type === 'COMPLETED');

      return matchesSearch && matchesTab;
    });
  }, [reservations, searchQuery, resTabFilter]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (notifFilter === 'UNREAD') return !n.est_lu;
      if (notifFilter === 'RESERVATIONS') return n.type?.includes('RESERVATION') || n.titre?.toLowerCase().includes('réservation');
      if (notifFilter === 'QUOTES') return n.type?.includes('QUOTE') || n.titre?.toLowerCase().includes('devis');
      if (notifFilter === 'CLIENTS') return n.type?.includes('CLIENT') || n.titre?.toLowerCase().includes('client');
      return true;
    });
  }, [notifications, notifFilter]);

  const adminAvatarUri = getFullAvatarUrl(user?.avatar_url);

  // ─── Calendar Helpers ───────────────────────────────────────────────────
  const calendarDisplayMonth = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + calendarMonthOffset);
    return d;
  }, [calendarMonthOffset]);

  const calendarDays = useMemo(() => {
    const year = calendarDisplayMonth.getFullYear();
    const month = calendarDisplayMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Décalage pour commencer le lundi (0: Dim -> 6, 1: Lun -> 0, etc.)
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days: Array<{ dayNumber: number; date: Date; reservations: ReservationItem[] }> = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const curDate = new Date(year, month, i);
      const dayStart = new Date(year, month, i, 0, 0, 0);
      const dayEnd = new Date(year, month, i, 23, 59, 59);

      const dayReservations = reservations.filter(r => {
        if (!r.commence_le || !r.termine_le) return false;
        const resStart = new Date(r.commence_le);
        const resEnd = new Date(r.termine_le);
        return resStart <= dayEnd && resEnd >= dayStart;
      });

      days.push({
        dayNumber: i,
        date: curDate,
        reservations: dayReservations,
      });
    }

    return { days, startDayOfWeek };
  }, [calendarDisplayMonth, reservations]);

  // Réservations pour la date sélectionnée dans le calendrier
  const selectedDateReservations = useMemo(() => {
    const selYear = selectedCalendarDate.getFullYear();
    const selMonth = selectedCalendarDate.getMonth();
    const selDay = selectedCalendarDate.getDate();
    const dayStart = new Date(selYear, selMonth, selDay, 0, 0, 0);
    const dayEnd = new Date(selYear, selMonth, selDay, 23, 59, 59);

    return filteredReservations.filter(r => {
      if (!r.commence_le || !r.termine_le) return false;
      const resStart = new Date(r.commence_le);
      const resEnd = new Date(r.termine_le);
      return resStart <= dayEnd && resEnd >= dayStart;
    });
  }, [selectedCalendarDate, filteredReservations]);

  // ─── Render: Sidebar ────────────────────────────────────────────────────
  const renderSidebar = () => {
    const getBadgeCount = (badgeKey?: 'quotes' | 'notifications' | 'reservations') => {
      if (badgeKey === 'quotes') return pendingQuotesCount;
      if (badgeKey === 'notifications') return unreadNotifCount;
      if (badgeKey === 'reservations') return pendingResCount;
      return 0;
    };

    return (
      <View style={[styles.sidebarInner, { paddingTop: Math.max(insets.top + 8, 28) }]}>
        {/* Top Header / Brand Logo - Below device status bar */}
        <View style={styles.sidebarHeader}>
          <View style={styles.sidebarLogoBox}>
            <Image source={LOGO} style={styles.sidebarLogoImage} resizeMode="contain" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sidebarBrandTitle}>SOUTARAH</Text>
            <View style={styles.sidebarRoleBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#4ade80" />
              <Text style={styles.sidebarRoleBadgeText}>Administration</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.sidebarCloseBtn}
            onPress={() => setSidebarOpen(false)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={20} color="#86efac" />
          </TouchableOpacity>
        </View>

        <View style={styles.sidebarDivider} />

        {/* Navigation List - Clean sleek active background, NO left border line */}
        <ScrollView style={styles.sidebarNavScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sidebarSectionHeader}>MENU PRINCIPAL</Text>
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.key;
            const badgeCount = getBadgeCount(item.badgeKey);

            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                onPress={() => {
                  setActiveSection(item.key);
                  setSidebarOpen(false);
                  setSearchQuery('');
                }}
                activeOpacity={0.75}
              >
                <View style={[styles.sidebarIconWrap, isActive && styles.sidebarIconWrapActive]}>
                  <Ionicons name={item.icon} size={19} color={isActive ? '#ffffff' : '#86efac'} />
                </View>
                <Text style={[styles.sidebarItemText, isActive && styles.sidebarItemTextActive]}>
                  {item.label}
                </Text>
                {badgeCount > 0 && (
                  <View style={[styles.sidebarBadge, isActive && styles.sidebarBadgeActive]}>
                    <Text style={styles.sidebarBadgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sidebarDivider} />

        {/* Admin Profile Card at bottom */}
        <View style={[styles.sidebarFooter, { paddingBottom: Math.max(insets.bottom + 8, 16) }]}>
          <TouchableOpacity
            style={styles.sidebarUserCard}
            onPress={() => {
              setActiveSection('settings');
              setSettingsSection('profile');
              setSidebarOpen(false);
            }}
            activeOpacity={0.8}
          >
            <TouchableOpacity onPress={handlePickAndUploadAvatar} style={styles.sidebarAvatarContainer}>
              {adminAvatarUri ? (
                <Image source={{ uri: adminAvatarUri }} style={styles.sidebarAvatarImage} />
              ) : (
                <View style={styles.sidebarAvatar}>
                  <Text style={styles.sidebarAvatarText}>
                    {getInitials(user?.email?.split('@')[0], 'A')}
                  </Text>
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={10} color="#ffffff" />
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={styles.sidebarUserName} numberOfLines={1}>
                {user?.email?.split('@')[0] || 'Admin SOUTARAH'}
              </Text>
              <Text style={styles.sidebarUserEmail} numberOfLines={1}>
                {user?.email || 'admin@soutarah.ci'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarLogoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="#fca5a5" />
            <Text style={styles.sidebarLogoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── Render: Top Navigation Bar ─────────────────────────────────────────
  const renderTopBar = () => (
    <View style={styles.topBar}>
      <View style={styles.topBarLeft}>
        <TouchableOpacity
          style={styles.hamburgerBtn}
          onPress={() => setSidebarOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>

        {activeSection !== 'dashboard' && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setActiveSection('dashboard');
              setSearchQuery('');
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#143e22" />
          </TouchableOpacity>
        )}

        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {SECTION_TITLES[activeSection]}
          </Text>
          <Text style={styles.topBarSubtitle}>SOUTARAH GROUP • Console Admin</Text>
        </View>
      </View>

      <View style={styles.topBarRight}>
        <TouchableOpacity
          style={styles.topBarBtn}
          onPress={() => {
            setActiveSection('notifications');
            setSidebarOpen(false);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={21} color="#143e22" />
          {unreadNotifCount > 0 && (
            <View style={styles.topBarNotifBadge}>
              <Text style={styles.topBarNotifText}>{unreadNotifCount > 9 ? '9+' : unreadNotifCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.topBarAvatarBtn}
          onPress={() => {
            setActiveSection('settings');
            setSettingsSection('profile');
            setSidebarOpen(false);
          }}
          activeOpacity={0.8}
        >
          {adminAvatarUri ? (
            <Image source={{ uri: adminAvatarUri }} style={styles.topBarAvatarImg} />
          ) : (
            <View style={styles.topBarAvatarPlaceholder}>
              <Text style={styles.topBarAvatarText}>
                {getInitials(user?.email?.split('@')[0], 'A')}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Render: Dashboard Section ──────────────────────────────────────────
  const renderDashboard = () => {
    const kpis = [
      {
        title: 'Clients enregistrés',
        value: String(clients.length || stats?.clients?.total || 0),
        sub: `+${stats?.clients?.nouveau || 0} nouveaux`,
        icon: 'people' as const,
        color: '#15803d',
        bg: '#dcfce7',
        tab: 'clients' as AdminSection,
      },
      {
        title: 'Catalogue véhicules',
        value: String(vehicles.length),
        sub: `${vehicles.filter(v => v.disponibilite).length} disponibles`,
        icon: 'car-sport' as const,
        color: '#0284c7',
        bg: '#e0f2fe',
        tab: 'vehicles' as AdminSection,
      },
      {
        title: 'Réservations',
        value: String(reservations.length || stats?.reservations?.total || 0),
        sub: `${pendingResCount} en attente`,
        icon: 'calendar' as const,
        color: '#7c3aed',
        bg: '#ede9fe',
        tab: 'reservations' as AdminSection,
      },
      {
        title: 'Demandes de devis',
        value: String(quotes.length || stats?.devis?.total || 0),
        sub: `${pendingQuotesCount} en attente`,
        icon: 'document-text' as const,
        color: '#d97706',
        bg: '#fef3c7',
        tab: 'quotes' as AdminSection,
      },
    ];

    return (
      <ScrollView
        style={styles.contentScroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Welcome Header - Clean borderless on left */}
        <View style={styles.welcomeBanner}>
          <TouchableOpacity onPress={handlePickAndUploadAvatar} style={{ position: 'relative', alignSelf: 'flex-start', marginBottom: 8 }}>
            {adminAvatarUri ? (
              <Image source={{ uri: adminAvatarUri }} style={styles.welcomeAvatar} />
            ) : (
              <View style={styles.welcomeAvatarPlaceholder}>
                <Text style={styles.welcomeAvatarText}>{getInitials(user?.email?.split('@')[0], 'A')}</Text>
              </View>
            )}
            <View style={styles.welcomeCameraBadge}>
              <Ionicons name="camera" size={12} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.welcomeGreeting}>
            Bonjour, {user?.email?.split('@')[0] || 'Administrateur'} 👋
          </Text>
          <Text style={styles.welcomeText}>
            Supervision SOUTARAH GROUP synchronisée en temps réel avec la base de données.
          </Text>
        </View>

        {/* 2x2 KPI Grid */}
        <Text style={styles.sectionHeaderTitle}>VUE D'ENSEMBLE</Text>
        <View style={styles.kpiGrid}>
          {kpis.map((k, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.kpiCard}
              onPress={() => setActiveSection(k.tab)}
              activeOpacity={0.8}
            >
              <View style={[styles.kpiIconBox, { backgroundColor: k.bg }]}>
                <Ionicons name={k.icon} size={22} color={k.color} />
              </View>
              <Text style={styles.kpiValue} numberOfLines={1}>
                {k.value}
              </Text>
              <Text style={styles.kpiTitle}>{k.title}</Text>
              <Text style={[styles.kpiSub, { color: k.color }]}>{k.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>



        {/* Recent Reservations */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="calendar" size={18} color={colors.primary} />
              <Text style={styles.cardHeaderTitle}>Dernières Réservations</Text>
            </View>
            <TouchableOpacity onPress={() => setActiveSection('reservations')}>
              <Text style={styles.cardHeaderLink}>Voir tout ({reservations.length})</Text>
            </TouchableOpacity>
          </View>

          {reservations.length === 0 ? (
            <Text style={styles.emptyNote}>Aucune réservation pour le moment</Text>
          ) : (
            reservations.slice(0, 4).map(res => (
              <View key={res.id} style={styles.itemRow}>
                <View style={[styles.statusIndicator, { backgroundColor: getReservationTimeStatus(res).color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>
                    {res.vehicule ? `${res.vehicule.marque} ${res.vehicule.modele}` : 'Véhicule'} —{' '}
                    {res.client ? `${res.client.prenom || ''} ${res.client.nom || ''}`.trim() || 'Client' : 'Client'}
                  </Text>
                  <Text style={styles.itemSubtitle}>
                    {formatDate(res.commence_le)} → {formatDate(res.termine_le)} • {formatMoney(res.montant_total)}
                  </Text>
                </View>
                <View style={[styles.badgePill, { backgroundColor: getReservationTimeStatus(res).bg }]}>
                  <Text style={[styles.badgePillText, { color: getReservationTimeStatus(res).color }]}>
                    {getReservationTimeStatus(res).label}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Recent Quotes */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="document-text" size={18} color={colors.primary} />
              <Text style={styles.cardHeaderTitle}>Dernières Demandes de Devis</Text>
            </View>
            <TouchableOpacity onPress={() => setActiveSection('quotes')}>
              <Text style={styles.cardHeaderLink}>Voir tout ({quotes.length})</Text>
            </TouchableOpacity>
          </View>

          {quotes.length === 0 ? (
            <Text style={styles.emptyNote}>Aucun devis pour le moment</Text>
          ) : (
            quotes.slice(0, 4).map(q => (
              <View key={q.id} style={styles.itemRow}>
                <View style={[styles.statusIndicator, { backgroundColor: q.fichier_devis_url ? '#10b981' : '#f59e0b' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>
                    {q.reference || 'Devis'} • {q.service || q.titre || 'Demande de service'}
                  </Text>
                  <Text style={styles.itemSubtitle}>
                    {q.client ? `${q.client.prenom || ''} ${q.client.nom || ''}` : q.nom || 'Client'} •{' '}
                    {formatDate(q.cree_le)}
                  </Text>
                </View>
                <View style={[styles.badgePill, { backgroundColor: q.fichier_devis_url ? '#dcfce7' : '#fef3c7' }]}>
                  <Text style={[styles.badgePillText, { color: q.fichier_devis_url ? '#15803d' : '#b45309' }]}>
                    {q.fichier_devis_url ? 'Envoyé' : 'En attente'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  // ─── Render: Clients Section ────────────────────────────────────────────
  const renderClients = () => (
    <ScrollView
      style={styles.contentScroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      {/* Search and Add Header */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Rechercher nom, entreprise, email..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity style={styles.primaryActionBtn} onPress={() => setShowAddClient(true)}>
          <Ionicons name="person-add" size={18} color="#ffffff" />
          <Text style={styles.primaryActionBtnText}>Nouveau</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterPillsRow}>
        {(['ALL', 'PARTICULIER', 'ENTREPRISE'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterPill, clientFilter === f && styles.filterPillActive]}
            onPress={() => setClientFilter(f)}
          >
            <Text style={[styles.filterPillText, clientFilter === f && styles.filterPillTextActive]}>
              {f === 'ALL' ? `Tous (${clients.length})` : f === 'PARTICULIER' ? 'Particuliers' : 'Entreprises'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="people-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyCardTitle}>Aucun client trouvé</Text>
          <Text style={styles.emptyCardText}>Essayez un autre mot-clé ou ajoutez un nouveau client.</Text>
        </View>
      ) : (
        filteredClients.map(c => {
          const email = c.utilisateur?.email || c.email || '—';
          const phone = c.utilisateur?.telephone || c.telephone || '—';
          const isActive = (c.utilisateur?.est_actif ?? c.est_actif) !== false;
          const isCompany = c.type_client.includes('ENTREPRISE') || !!c.entreprise;

          return (
            <View key={c.id} style={styles.dataCard}>
              <View style={styles.dataCardHeader}>
                <View style={styles.avatarPill}>
                  <Text style={styles.avatarPillText}>
                    {getInitials(c.prenom || c.entreprise?.nom, c.nom)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dataCardTitle}>
                    {c.entreprise?.nom || `${c.prenom || ''} ${c.nom || ''}`.trim() || 'Client'}
                  </Text>
                  <Text style={styles.dataCardSub}>
                    {isCompany ? `🏢 Entreprise • Resp: ${c.entreprise?.nom_responsable || c.prenom || '—'}` : '👤 Particulier'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.badgePill, { backgroundColor: isActive ? '#dcfce7' : '#fee2e2' }]}
                  onPress={() => handleToggleClientStatus(c)}
                >
                  <Text style={[styles.badgePillText, { color: isActive ? '#15803d' : '#b91c1c' }]}>
                    {isActive ? 'Actif' : 'Inactif'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dataCardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={14} color="#64748b" />
                  <Text style={styles.infoText}>{email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={14} color="#64748b" />
                  <Text style={styles.infoText}>{phone}</Text>
                </View>
                {c.ville ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={14} color="#64748b" />
                    <Text style={styles.infoText}>{c.ville}</Text>
                  </View>
                ) : null}
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={14} color="#64748b" />
                  <Text style={styles.infoText}>Inscrit le {formatDate(c.cree_le)}</Text>
                </View>
              </View>

              <View style={styles.dataCardFooter}>
                <TouchableOpacity
                  style={[styles.actionBtnSecondary, { borderColor: isActive ? '#fca5a5' : '#86efac' }]}
                  onPress={() => handleToggleClientStatus(c)}
                >
                  <Ionicons
                    name={isActive ? 'pause-circle-outline' : 'play-circle-outline'}
                    size={16}
                    color={isActive ? '#dc2626' : '#16a34a'}
                  />
                  <Text style={{ color: isActive ? '#dc2626' : '#16a34a', fontWeight: '600', fontSize: 12 }}>
                    {isActive ? 'Désactiver le compte' : 'Activer le compte'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {/* Modal: Add Client */}
      <Modal visible={showAddClient} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Créer une entreprise cliente</Text>
              <TouchableOpacity onPress={() => setShowAddClient(false)}>
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.formLabel}>Nom de l'entreprise *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ex: SOUTARAH BTP"
                value={clientForm.companyName}
                onChangeText={t => setClientForm({ ...clientForm, companyName: t })}
              />

              <Text style={styles.formLabel}>Nom du responsable</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ex: M. Jean Kouassi"
                value={clientForm.responsibleName}
                onChangeText={t => setClientForm({ ...clientForm, responsibleName: t })}
              />

              <Text style={styles.formLabel}>Email de connexion *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="client@entreprise.ci"
                keyboardType="email-address"
                autoCapitalize="none"
                value={clientForm.email}
                onChangeText={t => setClientForm({ ...clientForm, email: t })}
              />

              <Text style={styles.formLabel}>Téléphone *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="+225 07..."
                keyboardType="phone-pad"
                value={clientForm.phone}
                onChangeText={t => setClientForm({ ...clientForm, phone: t })}
              />

              <Text style={styles.formLabel}>Ville / Adresse</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Abidjan, Cocody"
                value={clientForm.city}
                onChangeText={t => setClientForm({ ...clientForm, city: t })}
              />

              <Text style={styles.formLabel}>Mot de passe *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Mot de passe"
                secureTextEntry
                value={clientForm.password}
                onChangeText={t => setClientForm({ ...clientForm, password: t })}
              />

              <Text style={styles.formLabel}>Confirmer le mot de passe *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Confirmez le mot de passe"
                secureTextEntry
                value={clientForm.confirmPassword}
                onChangeText={t => setClientForm({ ...clientForm, confirmPassword: t })}
              />

              <TouchableOpacity style={styles.formSubmitBtn} onPress={handleCreateClient}>
                <Text style={styles.formSubmitBtnText}>Enregistrer le client</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // ─── Render: Vehicles (Catalogue) Section ───────────────────────────────
  const renderVehicles = () => {
    const categories = ['Tous', 'SUV', 'Berline', '4x4', 'Pick-up', 'Minibus', 'Utilitaire'];

    return (
      <ScrollView
        style={styles.contentScroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        <View style={styles.searchBarRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#94a3b8" />
            <TextInput
              style={styles.searchTextInput}
              placeholder="Rechercher marque, modèle..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => {
              setEditingVehicle(null);
              setVehicleForm({
                marque: '',
                modele: '',
                categorie: 'SUV',
                places: '5',
                carburant: 'Essence',
                transmission: 'Automatique',
                prix_journalier_particulier: '',
                prix_journalier_entreprise: '',
                image_url: '',
                description: '',
              });
              setShowAddVehicle(true);
            }}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.primaryActionBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterPill, vehicleCatFilter === cat && styles.filterPillActive]}
              onPress={() => setVehicleCatFilter(cat)}
            >
              <Text style={[styles.filterPillText, vehicleCatFilter === cat && styles.filterPillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredVehicles.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="car-sport-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyCardTitle}>Aucun véhicule trouvé</Text>
          </View>
        ) : (
          filteredVehicles.map(veh => {
            const vehicleImgUri = getVehicleImageUrl(veh.image_url);

            return (
              <View key={veh.id} style={styles.dataCard}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {vehicleImgUri ? (
                    <Image source={{ uri: vehicleImgUri }} style={styles.vehicleThumb} resizeMode="cover" />
                  ) : (
                    <View style={styles.vehicleThumbPlaceholder}>
                      <Ionicons name="car" size={28} color="#94a3b8" />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={styles.dataCardTitle}>
                        {veh.marque} {veh.modele}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.badgePill,
                          { backgroundColor: veh.disponibilite ? '#dcfce7' : '#fee2e2' },
                        ]}
                        onPress={() => handleToggleVehicleAvailability(veh)}
                      >
                        <Text style={[styles.badgePillText, { color: veh.disponibilite ? '#15803d' : '#b91c1c' }]}>
                          {veh.disponibilite ? 'Disponible' : 'Indisponible'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.dataCardSub}>
                      Catégorie: {veh.categorie} • {veh.transmission || 'Auto'} • {veh.places || 5} places
                    </Text>
                    <Text style={styles.vehiclePriceTag}>
                      Particulier: <Text style={{ fontWeight: '800', color: colors.primary }}>{formatMoney(veh.prix_journalier_particulier)}/j</Text>
                    </Text>
                    <Text style={styles.vehiclePriceTag}>
                      Entreprise: <Text style={{ fontWeight: '700', color: '#0284c7' }}>{formatMoney(veh.prix_journalier_entreprise)}/j</Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.dataCardFooter}>
                  <TouchableOpacity
                    style={styles.actionBtnPrimary}
                    onPress={() => {
                      setEditingVehicle(veh);
                      setVehicleForm({
                        marque: veh.marque,
                        modele: veh.modele,
                        categorie: veh.categorie,
                        places: String(veh.places || 5),
                        carburant: veh.carburant || 'Essence',
                        transmission: veh.transmission || 'Automatique',
                        prix_journalier_particulier: String(veh.prix_journalier_particulier),
                        prix_journalier_entreprise: String(veh.prix_journalier_entreprise),
                        image_url: veh.image_url || '',
                        description: veh.description || '',
                      });
                      setShowAddVehicle(true);
                    }}
                  >
                    <Ionicons name="create-outline" size={16} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>Modifier photo & infos</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnSecondary}
                    onPress={() => handleToggleVehicleAvailability(veh)}
                  >
                    <Ionicons
                      name={veh.disponibilite ? 'close-circle-outline' : 'checkmark-circle-outline'}
                      size={16}
                      color={veh.disponibilite ? '#dc2626' : '#16a34a'}
                    />
                    <Text style={{ color: veh.disponibilite ? '#dc2626' : '#16a34a', fontWeight: '600', fontSize: 12 }}>
                      {veh.disponibilite ? 'Marquer indispo' : 'Rendre dispo'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.iconBtnDanger} onPress={() => handleDeleteVehicle(veh)}>
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* Modal: Add/Edit Vehicle with Photo Picker */}
        <Modal visible={showAddVehicle} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingVehicle ? 'Modifier le véhicule' : 'Nouveau véhicule'}
                </Text>
                <TouchableOpacity onPress={() => setShowAddVehicle(false)}>
                  <Ionicons name="close" size={22} color="#64748b" />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 440 }}>
                {/* Photo Preview & Selector */}
                <Text style={styles.formLabel}>Photo du véhicule</Text>
                <View style={styles.vehiclePhotoBox}>
                  {vehicleForm.image_url ? (
                    <Image
                      source={{ uri: getVehicleImageUrl(vehicleForm.image_url) || vehicleForm.image_url }}
                      style={styles.vehicleFormImagePreview}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.vehicleFormImagePlaceholder}>
                      <Ionicons name="car-sport-outline" size={36} color="#94a3b8" />
                      <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Aucune image sélectionnée</Text>
                    </View>
                  )}

                  <TouchableOpacity style={styles.pickPhotoBtn} onPress={handlePickVehicleImage}>
                    <Ionicons name="camera" size={16} color="#ffffff" />
                    <Text style={styles.pickPhotoBtnText}>Choisir une photo depuis la galerie</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.formLabel}>Ou URL directe de l'image</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="https://..."
                  value={vehicleForm.image_url}
                  onChangeText={t => setVehicleForm({ ...vehicleForm, image_url: t })}
                />

                <Text style={styles.formLabel}>Marque *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ex: Toyota"
                  value={vehicleForm.marque}
                  onChangeText={t => setVehicleForm({ ...vehicleForm, marque: t })}
                />

                <Text style={styles.formLabel}>Modèle *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ex: Land Cruiser Prado"
                  value={vehicleForm.modele}
                  onChangeText={t => setVehicleForm({ ...vehicleForm, modele: t })}
                />

                <Text style={styles.formLabel}>Catégorie</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="SUV, Berline, 4x4, Pick-up..."
                  value={vehicleForm.categorie}
                  onChangeText={t => setVehicleForm({ ...vehicleForm, categorie: t })}
                />

                <Text style={styles.formLabel}>Prix journalier Particulier (FCFA) *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="50000"
                  keyboardType="numeric"
                  value={vehicleForm.prix_journalier_particulier}
                  onChangeText={t => setVehicleForm({ ...vehicleForm, prix_journalier_particulier: t })}
                />

                <Text style={styles.formLabel}>Prix journalier Entreprise (FCFA)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="45000"
                  keyboardType="numeric"
                  value={vehicleForm.prix_journalier_entreprise}
                  onChangeText={t => setVehicleForm({ ...vehicleForm, prix_journalier_entreprise: t })}
                />

                <Text style={styles.formLabel}>Places & Transmission</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput
                    style={[styles.formInput, { flex: 1 }]}
                    placeholder="5 places"
                    value={vehicleForm.places}
                    onChangeText={t => setVehicleForm({ ...vehicleForm, places: t })}
                  />
                  <TextInput
                    style={[styles.formInput, { flex: 1 }]}
                    placeholder="Automatique"
                    value={vehicleForm.transmission}
                    onChangeText={t => setVehicleForm({ ...vehicleForm, transmission: t })}
                  />
                </View>

                <TouchableOpacity style={styles.formSubmitBtn} onPress={handleSaveVehicle}>
                  <Text style={styles.formSubmitBtnText}>
                    {editingVehicle ? 'Mettre à jour le véhicule' : 'Enregistrer le véhicule'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  // ─── Render: Quotes (Devis) Section ─────────────────────────────────────
  const renderQuotes = () => (
    <ScrollView
      style={styles.contentScroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      <View style={styles.searchBarRow}>
        <View style={[styles.searchBox, { flex: 1 }]}>
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Rechercher référence, client..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Pills: Tous, En attente, Envoyé */}
      <View style={styles.filterPillsRow}>
        {[
          { id: 'ALL' as const, label: `Tous (${quotes.length})` },
          { id: 'PENDING' as const, label: `En attente (${pendingQuotesCount})` },
          { id: 'SENT' as const, label: `Envoyé (${quotes.length - pendingQuotesCount})` },
        ].map(f => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterPill, quoteFilter === f.id && styles.filterPillActive]}
            onPress={() => setQuoteFilter(f.id)}
          >
            <Text style={[styles.filterPillText, quoteFilter === f.id && styles.filterPillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredQuotes.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyCardTitle}>Aucun devis trouvé</Text>
        </View>
      ) : (
        filteredQuotes.map(q => {
          const isSent = ['SENT', 'APPROVED'].includes((q.statut || '').toUpperCase());
          const isUploadingThis = uploadingQuoteId === q.id;

          return (
            <View key={q.id} style={styles.dataCard}>
              <View style={styles.dataCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dataCardTitle}>{q.reference || 'DEVIS'}</Text>
                  <Text style={styles.dataCardSub}>
                    {q.client ? `${q.client.prenom || ''} ${q.client.nom || ''}`.trim() : q.nom || 'Client'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badgePill,
                    { backgroundColor: isSent ? '#dcfce7' : '#fef3c7' },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgePillText,
                      { color: isSent ? '#15803d' : '#b45309' },
                    ]}
                  >
                    {isSent ? 'Envoyé' : 'En attente'}
                  </Text>
                </View>
              </View>

              <View style={styles.dataCardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="briefcase-outline" size={14} color="#64748b" />
                  <Text style={styles.infoText}>{q.service || q.titre || 'Location de véhicule'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={14} color="#64748b" />
                  <Text style={styles.infoText}>{q.email || q.client?.user?.email || '—'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={14} color="#64748b" />
                  <Text style={styles.infoText}>{q.telephone || q.client?.user?.telephone || '—'}</Text>
                </View>
                {q.lieu ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={14} color="#64748b" />
                    <Text style={styles.infoText}>Lieu: {q.lieu}</Text>
                  </View>
                ) : null}
                {q.delai ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="hourglass-outline" size={14} color="#64748b" />
                    <Text style={styles.infoText}>Délai: {q.delai}</Text>
                  </View>
                ) : null}
                {q.budget ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="cash-outline" size={14} color="#64748b" />
                    <Text style={styles.infoText}>Budget estimé: {formatMoney(q.budget)}</Text>
                  </View>
                ) : null}
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={14} color="#64748b" />
                  <Text style={styles.infoText}>Date demande: {formatDate(q.cree_le)}</Text>
                </View>
              </View>

              {/* Action Buttons: Upload Devis Signé & Envoyer */}
              <View style={styles.dataCardFooter}>
                <TouchableOpacity
                  style={[
                    styles.actionBtnPrimary,
                    { backgroundColor: '#071f11', borderColor: '#15803d', flex: 1, justifyContent: 'center' },
                  ]}
                  onPress={() => handleUploadSignedQuote(q)}
                  disabled={isUploadingThis}
                >
                  {isUploadingThis ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={16} color="#ffffff" />
                      <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 12 }}>
                        {q.fichier_devis_url ? 'Remplacer devis signé' : 'Uploader devis signé'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {q.fichier_devis_url ? (
                  <TouchableOpacity
                    style={[styles.actionBtnSecondary, { borderColor: '#86efac', backgroundColor: '#f0fdf4' }]}
                    onPress={() => handleOpenSignedDoc(q.fichier_devis_url)}
                  >
                    <Ionicons name="eye-outline" size={16} color="#15803d" />
                    <Text style={{ color: '#15803d', fontWeight: '700', fontSize: 12 }}>Voir PDF</Text>
                  </TouchableOpacity>
                ) : null}

                {!isSent && (
                  <TouchableOpacity
                    style={[styles.actionBtnSecondary, { borderColor: '#bbf7d0', backgroundColor: '#ecfdf5' }]}
                    onPress={() => handleSendQuoteDirect(q)}
                  >
                    <Ionicons name="paper-plane-outline" size={16} color="#15803d" />
                    <Text style={{ color: '#15803d', fontWeight: '700', fontSize: 12 }}>Envoyer</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // ─── Render: Reservations Section (Calendar + List + Custom Tabs) ───────
  const renderReservations = () => {
    const tabs: Array<{ id: ReservationFilterTab; label: string }> = [
      { id: 'ALL', label: `Locations totales (${reservations.length})` },
      { id: 'CURRENT', label: 'En cours' },
      { id: 'UPCOMING', label: 'À venir' },
      { id: 'COMPLETED', label: 'Terminées' },
    ];

    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const currentMonthLabel = `${monthNames[calendarDisplayMonth.getMonth()]} ${calendarDisplayMonth.getFullYear()}`;

    return (
      <ScrollView
        style={styles.contentScroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* View Mode Toggle: Calendrier vs Liste */}
        <View style={styles.viewModeToggleRow}>
          <TouchableOpacity
            style={[styles.viewModeBtn, resViewMode === 'CALENDAR' && styles.viewModeBtnActive]}
            onPress={() => setResViewMode('CALENDAR')}
          >
            <Ionicons name="calendar" size={16} color={resViewMode === 'CALENDAR' ? '#ffffff' : '#64748b'} />
            <Text style={[styles.viewModeBtnText, resViewMode === 'CALENDAR' && styles.viewModeBtnTextActive]}>
              Vue Calendrier
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewModeBtn, resViewMode === 'LIST' && styles.viewModeBtnActive]}
            onPress={() => setResViewMode('LIST')}
          >
            <Ionicons name="list" size={16} color={resViewMode === 'LIST' ? '#ffffff' : '#64748b'} />
            <Text style={[styles.viewModeBtnText, resViewMode === 'LIST' && styles.viewModeBtnTextActive]}>
              Vue Liste
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4 Tabs: Locations totales, En cours, À venir, Terminées */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.filterPill, resTabFilter === tab.id && styles.filterPillActive]}
              onPress={() => setResTabFilter(tab.id)}
            >
              <Text style={[styles.filterPillText, resTabFilter === tab.id && styles.filterPillTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ─── Mode 1: CALENDRIER INTERACTIF ─── */}
        {resViewMode === 'CALENDAR' && (
          <View style={styles.calendarCard}>
            {/* Month Header Switcher */}
            <View style={styles.calendarMonthHeader}>
              <TouchableOpacity
                style={styles.monthNavBtn}
                onPress={() => setCalendarMonthOffset(prev => prev - 1)}
              >
                <Ionicons name="chevron-back" size={18} color="#0f172a" />
              </TouchableOpacity>
              <Text style={styles.calendarMonthTitle}>{currentMonthLabel}</Text>
              <TouchableOpacity
                style={styles.monthNavBtn}
                onPress={() => setCalendarMonthOffset(prev => prev + 1)}
              >
                <Ionicons name="chevron-forward" size={18} color="#0f172a" />
              </TouchableOpacity>
            </View>

            {/* Day of week headers (Lun -> Dim) */}
            <View style={styles.calendarWeekRow}>
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <Text key={i} style={styles.calendarWeekHeaderCol}>{d}</Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.calendarDaysGrid}>
              {/* Empty leading cells */}
              {Array.from({ length: calendarDays.startDayOfWeek }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.calendarDayCellEmpty} />
              ))}

              {calendarDays.days.map(d => {
                const isSelected =
                  d.date.getDate() === selectedCalendarDate.getDate() &&
                  d.date.getMonth() === selectedCalendarDate.getMonth() &&
                  d.date.getFullYear() === selectedCalendarDate.getFullYear();

                const isToday =
                  d.date.getDate() === new Date().getDate() &&
                  d.date.getMonth() === new Date().getMonth() &&
                  d.date.getFullYear() === new Date().getFullYear();

                const hasRes = d.reservations.length > 0;

                return (
                  <TouchableOpacity
                    key={d.dayNumber}
                    style={[
                      styles.calendarDayCell,
                      isSelected && styles.calendarDayCellSelected,
                      isToday && !isSelected && styles.calendarDayCellToday,
                    ]}
                    onPress={() => setSelectedCalendarDate(d.date)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.calendarDayNumber,
                        isSelected && styles.calendarDayNumberSelected,
                        isToday && !isSelected && styles.calendarDayNumberToday,
                      ]}
                    >
                      {d.dayNumber}
                    </Text>

                    {hasRes && (
                      <View style={styles.calendarDayResIndicator}>
                        <View style={[styles.calendarDot, isSelected && { backgroundColor: '#ffffff' }]} />
                        {d.reservations.length > 1 && (
                          <Text style={[styles.calendarResCountText, isSelected && { color: '#ffffff' }]}>
                            {d.reservations.length}
                          </Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.calendarDivider} />

            {/* Plages de réservations pour la date sélectionnée */}
            <View style={styles.calendarDetailsHeader}>
              <Ionicons name="car-sport" size={16} color={colors.primary} />
              <Text style={styles.calendarDetailsTitle}>
                Réservations du {formatDate(selectedCalendarDate.toISOString())}
              </Text>
            </View>

            {selectedDateReservations.length === 0 ? (
              <Text style={styles.emptyNote}>Aucun véhicule réservé sur cette date</Text>
            ) : (
              selectedDateReservations.map(res => {
                const timeStatus = getReservationTimeStatus(res);
                const vehImg = getVehicleImageUrl(res.vehicule?.image_url);
                const duration = getDurationInDays(res.commence_le, res.termine_le);

                return (
                  <View key={res.id} style={styles.reservationTimelineCard}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {vehImg ? (
                        <Image source={{ uri: vehImg }} style={styles.resCardThumb} resizeMode="cover" />
                      ) : (
                        <View style={styles.resCardThumbPlaceholder}>
                          <Ionicons name="car" size={24} color="#94a3b8" />
                        </View>
                      )}

                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Text style={styles.dataCardTitle}>
                            {res.vehicule ? `${res.vehicule.marque} ${res.vehicule.modele}` : 'Véhicule'}
                          </Text>
                          <View style={[styles.badgePill, { backgroundColor: timeStatus.bg }]}>
                            <Text style={[styles.badgePillText, { color: timeStatus.color }]}>
                              {timeStatus.label}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.dataCardSub}>
                          Client: {res.client ? `${res.client.prenom || ''} ${res.client.nom || ''}`.trim() || 'Client' : 'Client'}
                        </Text>

                        {/* Plage temporelle visuelle */}
                        <View style={styles.dateRangeBox}>
                          <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                          <Text style={styles.dateRangeText}>
                            Du <Text style={{ fontWeight: '700' }}>{formatDate(res.commence_le)}</Text> au{' '}
                            <Text style={{ fontWeight: '700' }}>{formatDate(res.termine_le)}</Text> ({duration} j)
                          </Text>
                        </View>

                        <Text style={styles.resAmountText}>Total: {formatMoney(res.montant_total)}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ─── Mode 2: LISTE COMPLÈTE ─── */}
        {resViewMode === 'LIST' && (
          <>
            {filteredReservations.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyCardTitle}>Aucune réservation trouvée</Text>
              </View>
            ) : (
              filteredReservations.map(res => {
                const timeStatus = getReservationTimeStatus(res);
                const vehImg = getVehicleImageUrl(res.vehicule?.image_url);
                const duration = getDurationInDays(res.commence_le, res.termine_le);

                return (
                  <View key={res.id} style={styles.dataCard}>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      {vehImg ? (
                        <Image source={{ uri: vehImg }} style={styles.resCardThumb} resizeMode="cover" />
                      ) : (
                        <View style={styles.resCardThumbPlaceholder}>
                          <Ionicons name="car" size={24} color="#94a3b8" />
                        </View>
                      )}

                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Text style={styles.dataCardTitle}>
                            {res.vehicule ? `${res.vehicule.marque} ${res.vehicule.modele}` : 'Réservation'}
                          </Text>
                          <View style={[styles.badgePill, { backgroundColor: timeStatus.bg }]}>
                            <Text style={[styles.badgePillText, { color: timeStatus.color }]}>
                              {timeStatus.label}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.dataCardSub}>
                          Client: {res.client ? `${res.client.prenom || ''} ${res.client.nom || ''}`.trim() : '—'} • Réf: {res.reference || 'RES'}
                        </Text>

                        {/* Plage temporelle */}
                        <View style={styles.dateRangeBox}>
                          <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                          <Text style={styles.dateRangeText}>
                            Du {formatDate(res.commence_le)} au {formatDate(res.termine_le)} ({duration} jours)
                          </Text>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <Text style={[styles.infoText, { fontWeight: '800', color: colors.primary }]}>
                            {formatMoney(res.montant_total)}
                          </Text>
                          {res.avec_chauffeur ? (
                            <Text style={{ fontSize: 11, color: '#15803d', fontWeight: '600' }}>✓ Chauffeur</Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  // ─── Render: Notifications Section ──────────────────────────────────────
  const renderNotifications = () => {
    const filters = [
      { id: 'ALL' as const, label: `Toutes (${notifications.length})` },
      { id: 'UNREAD' as const, label: `Non lues (${unreadNotifCount})` },
      { id: 'RESERVATIONS' as const, label: 'Réservations' },
      { id: 'QUOTES' as const, label: 'Devis' },
      { id: 'CLIENTS' as const, label: 'Clients' },
    ];

    return (
      <ScrollView
        style={styles.contentScroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={styles.sectionHeaderTitle}>CENTRE DE NOTIFICATIONS</Text>
          {unreadNotifCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllNotificationsRead}>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Tout marquer comme lu</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills for Notifications */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterPill, notifFilter === f.id && styles.filterPillActive]}
              onPress={() => setNotifFilter(f.id)}
            >
              <Text style={[styles.filterPillText, notifFilter === f.id && styles.filterPillTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="notifications-off-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyCardTitle}>Aucune notification correspondante</Text>
          </View>
        ) : (
          filteredNotifications.map(n => (
            <TouchableOpacity
              key={n.id}
              style={[styles.dataCard, !n.est_lu && { backgroundColor: '#f0fdf4', borderColor: '#86efac' }]}
              onPress={() => !n.est_lu && handleMarkNotificationRead(n.id)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <View
                  style={[
                    styles.notifDotBox,
                    { backgroundColor: n.est_lu ? '#e2e8f0' : colors.primary },
                  ]}
                >
                  <Ionicons
                    name={n.est_lu ? 'checkmark' : 'notifications'}
                    size={14}
                    color={n.est_lu ? '#64748b' : '#ffffff'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemTitle, !n.est_lu && { fontWeight: '800' }]}>{n.titre}</Text>
                  <Text style={styles.itemSubtitle}>{n.message}</Text>
                  <Text style={styles.notifTimeText}>{formatDate(n.cree_le)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  // ─── Render: Settings Section ───────────────────────────────────────────
  const renderSettings = () => (
    <ScrollView style={styles.contentScroll}>
      {/* Settings Navigation Tabs */}
      <View style={styles.settingsTabsRow}>
        {[
          { id: 'profile' as const, label: 'Profil Admin', icon: 'person-outline' as const },
          { id: 'company' as const, label: 'Entreprise', icon: 'business-outline' as const },
          { id: 'notifs' as const, label: 'Alertes', icon: 'notifications-outline' as const },
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.settingsTabBtn, settingsSection === tab.id && styles.settingsTabBtnActive]}
            onPress={() => setSettingsSection(tab.id)}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              color={settingsSection === tab.id ? '#ffffff' : '#64748b'}
            />
            <Text
              style={[
                styles.settingsTabBtnText,
                settingsSection === tab.id && styles.settingsTabBtnTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Profil Admin */}
      {settingsSection === 'profile' && (
        <View style={styles.cardContainer}>
          <Text style={styles.cardHeaderTitle}>Photo & Profil Administrateur</Text>
          <Text style={styles.settingsDesc}>Gérez votre photo de profil et vos coordonnées d'administrateur</Text>

          {/* Interactive Avatar Upload Box */}
          <View style={styles.avatarSettingBox}>
            <TouchableOpacity
              style={styles.avatarSettingBtn}
              onPress={handlePickAndUploadAvatar}
              disabled={uploadingAvatar}
            >
              {adminAvatarUri ? (
                <Image source={{ uri: adminAvatarUri }} style={styles.avatarSettingImg} />
              ) : (
                <View style={styles.avatarSettingPlaceholder}>
                  <Text style={styles.avatarSettingText}>
                    {getInitials(user?.email?.split('@')[0], 'A')}
                  </Text>
                </View>
              )}
              <View style={styles.avatarSettingCameraBadge}>
                <Ionicons name="camera" size={14} color="#ffffff" />
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={styles.changeAvatarBtn}
                onPress={handlePickAndUploadAvatar}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="image-outline" size={16} color={colors.primary} />
                    <Text style={styles.changeAvatarBtnText}>Changer la photo</Text>
                  </>
                )}
              </TouchableOpacity>
              <Text style={styles.avatarHintText}>Formats acceptés : JPG, PNG (Max 5Mo)</Text>
            </View>
          </View>

          <Text style={styles.formLabel}>Nom complet</Text>
          <TextInput
            style={styles.formInput}
            value={profileForm.name}
            onChangeText={t => setProfileForm({ ...profileForm, name: t })}
          />

          <Text style={styles.formLabel}>Email de connexion</Text>
          <TextInput
            style={styles.formInput}
            value={profileForm.email}
            onChangeText={t => setProfileForm({ ...profileForm, email: t })}
            keyboardType="email-address"
          />

          <Text style={styles.formLabel}>Téléphone de contact</Text>
          <TextInput
            style={styles.formInput}
            value={profileForm.phone}
            onChangeText={t => setProfileForm({ ...profileForm, phone: t })}
            keyboardType="phone-pad"
          />

          <View style={styles.roleInfoBadge}>
            <Ionicons name="shield-checkmark" size={18} color="#15803d" />
            <Text style={styles.roleInfoText}>Rôle: Administrateur Principal (Accès Total)</Text>
          </View>
        </View>
      )}

      {/* Informations Entreprise */}
      {settingsSection === 'company' && (
        <View style={styles.cardContainer}>
          <Text style={styles.cardHeaderTitle}>Informations de la Société</Text>
          <Text style={styles.settingsDesc}>Coordonnées qui apparaissent sur les devis et factures</Text>

          <Text style={styles.formLabel}>Raison sociale</Text>
          <TextInput
            style={styles.formInput}
            value={companyForm.name}
            onChangeText={t => setCompanyForm({ ...companyForm, name: t })}
          />

          <Text style={styles.formLabel}>Adresse du siège</Text>
          <TextInput
            style={styles.formInput}
            value={companyForm.address}
            onChangeText={t => setCompanyForm({ ...companyForm, address: t })}
          />

          <Text style={styles.formLabel}>Téléphone standard</Text>
          <TextInput
            style={styles.formInput}
            value={companyForm.phone}
            onChangeText={t => setCompanyForm({ ...companyForm, phone: t })}
          />

          <Text style={styles.formLabel}>Email officiel</Text>
          <TextInput
            style={styles.formInput}
            value={companyForm.email}
            onChangeText={t => setCompanyForm({ ...companyForm, email: t })}
          />
        </View>
      )}

      {/* Alertes et notifications */}
      {settingsSection === 'notifs' && (
        <View style={styles.cardContainer}>
          <Text style={styles.cardHeaderTitle}>Préférences de Notifications</Text>
          <Text style={styles.settingsDesc}>Activez ou désactivez les alertes reçues</Text>

          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setNotifSettings({ ...notifSettings, newReservation: !notifSettings.newReservation })}
          >
            <Text style={styles.toggleLabel}>Nouvelle réservation de véhicule</Text>
            <Ionicons
              name={notifSettings.newReservation ? 'checkbox' : 'square-outline'}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setNotifSettings({ ...notifSettings, newQuote: !notifSettings.newQuote })}
          >
            <Text style={styles.toggleLabel}>Nouvelle demande de devis</Text>
            <Ionicons
              name={notifSettings.newQuote ? 'checkbox' : 'square-outline'}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setNotifSettings({ ...notifSettings, newClient: !notifSettings.newClient })}
          >
            <Text style={styles.toggleLabel}>Nouvelle inscription client</Text>
            <Ionicons
              name={notifSettings.newClient ? 'checkbox' : 'square-outline'}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Save Settings Button */}
      <View style={{ marginTop: 16 }}>
        <TouchableOpacity
          style={styles.formSubmitBtn}
          onPress={handleSaveSettings}
          disabled={settingsLoading}
        >
          {settingsLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.formSubmitBtnText}>
              {settingsSaved ? '✓ Enregistré !' : 'Enregistrer les modifications'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // ─── Render Main Body ───────────────────────────────────────────────────
  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'clients':
        return renderClients();
      case 'vehicles':
        return renderVehicles();
      case 'quotes':
        return renderQuotes();
      case 'reservations':
        return renderReservations();
      case 'notifications':
        return renderNotifications();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  if (loading) {
    return (
      <View style={styles.fullLoadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.fullLoadingText}>Connexion à la base de données SOUTARAH...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top', 'bottom']}>
      {/* Top App Header */}
      {renderTopBar()}

      {/* Active Screen Content */}
      <View style={{ flex: 1 }}>{renderCurrentSection()}</View>

      {/* Custom Drawer Sidebar (Slide-over with Backdrop) */}
      {sidebarOpen && (
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity
            style={styles.sidebarBackdrop}
            activeOpacity={1}
            onPress={() => setSidebarOpen(false)}
          />
          <View style={styles.sidebarContainer}>{renderSidebar()}</View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Stylesheet ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  fullLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  fullLoadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#15803d',
  },

  // ─── Top Bar ────────────────────────────────────────────────────────────
  topBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#071f11',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  topBarSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topBarNotifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  topBarNotifText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  topBarAvatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  topBarAvatarImg: {
    width: '100%',
    height: '100%',
  },
  topBarAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#071f11',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  // ─── Sidebar Overlay & Drawer ───────────────────────────────────────────
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    flexDirection: 'row',
  },
  sidebarBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  sidebarContainer: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#071f11',
    borderRightWidth: 1,
    borderRightColor: '#144627',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  sidebarInner: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 10,
  },
  sidebarLogoBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  sidebarLogoImage: {
    width: '100%',
    height: '100%',
  },
  sidebarBrandTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  sidebarRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  sidebarRoleBadgeText: {
    color: '#4ade80',
    fontSize: 11,
    fontWeight: '700',
  },
  sidebarCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0e3a1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#123f20',
    marginVertical: 6,
  },
  sidebarSectionHeader: {
    color: '#6ee7b7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
  },
  sidebarNavScroll: {
    flex: 1,
    paddingHorizontal: 10,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  sidebarItemActive: {
    backgroundColor: '#15803d',
  },
  sidebarIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sidebarIconWrapActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sidebarItemText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  sidebarItemTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  sidebarBadge: {
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  sidebarBadgeActive: {
    backgroundColor: '#ffffff',
  },
  sidebarBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  sidebarFooter: {
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  sidebarUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d321d',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#154a27',
  },
  sidebarAvatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  sidebarAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#15803d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarAvatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#4ade80',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  sidebarAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  sidebarUserName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  sidebarUserEmail: {
    color: '#94a3b8',
    fontSize: 11,
  },
  sidebarLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  sidebarLogoutText: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '700',
  },

  // ─── Content Area ───────────────────────────────────────────────────────
  contentScroll: {
    flex: 1,
    padding: isSmallScreen ? 12 : 16,
  },
  welcomeBanner: {
    backgroundColor: '#071f11',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#154a27',
  },
  welcomeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#4ade80',
  },
  welcomeAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#15803d',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4ade80',
  },
  welcomeAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  welcomeCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  welcomeGreeting: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  welcomeText: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  kpiCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  kpiIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  kpiTitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  kpiSub: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },

  // Quick Action Buttons
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  // Containers and Cards
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardHeaderLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyNote: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  itemSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },

  // ─── List & Search Components ───────────────────────────────────────────
  searchBarRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    height: 44,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    marginLeft: 8,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    gap: 6,
    justifyContent: 'center',
  },
  primaryActionBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },

  // Filter Pills
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  filterPillActive: {
    backgroundColor: '#071f11',
    borderColor: '#071f11',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  // Data Cards
  dataCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dataCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  avatarPill: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  avatarPillText: {
    color: '#15803d',
    fontWeight: '800',
    fontSize: 13,
  },
  dataCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  dataCardSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  dataCardBody: {
    paddingTop: 6,
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#334155',
  },
  dataCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexWrap: 'wrap',
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconBtnDanger: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    marginLeft: 'auto',
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Vehicle Specific
  vehicleThumb: {
    width: 85,
    height: 70,
    borderRadius: 10,
  },
  vehicleThumbPlaceholder: {
    width: 85,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehiclePriceTag: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  vehiclePhotoBox: {
    marginBottom: 12,
    alignItems: 'center',
  },
  vehicleFormImagePreview: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 8,
  },
  vehicleFormImagePlaceholder: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  pickPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#071f11',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    width: '100%',
  },
  pickPhotoBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  // ─── Reservations View Switcher & Calendar Styles ───────────────────────
  viewModeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  viewModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewModeBtnActive: {
    backgroundColor: '#071f11',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  viewModeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  viewModeBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  calendarMonthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  monthNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarMonthTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  calendarWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 6,
  },
  calendarWeekHeaderCol: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayCellEmpty: {
    width: '14.28%',
    height: 44,
  },
  calendarDayCell: {
    width: '14.28%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 1,
  },
  calendarDayCellSelected: {
    backgroundColor: '#071f11',
  },
  calendarDayCellToday: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  calendarDayNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  calendarDayNumberSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  calendarDayNumberToday: {
    color: colors.primary,
    fontWeight: '800',
  },
  calendarDayResIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  calendarDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
  },
  calendarResCountText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
  },
  calendarDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  calendarDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  calendarDetailsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  reservationTimelineCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resCardThumb: {
    width: 70,
    height: 56,
    borderRadius: 8,
  },
  resCardThumbPlaceholder: {
    width: 70,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateRangeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginVertical: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateRangeText: {
    fontSize: 11,
    color: '#334155',
  },
  resAmountText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },

  // Notifications Specific
  notifDotBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  notifTimeText: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
  },

  // Empty State
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 10,
  },
  emptyCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
  },
  emptyCardText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },

  // ─── Settings Styles ────────────────────────────────────────────────────
  settingsTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  settingsTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  settingsTabBtnActive: {
    backgroundColor: '#071f11',
    borderColor: '#071f11',
  },
  settingsTabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  settingsTabBtnTextActive: {
    color: '#ffffff',
  },
  settingsDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 12,
  },
  avatarSettingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatarSettingBtn: {
    position: 'relative',
  },
  avatarSettingImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarSettingPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#071f11',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarSettingText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  avatarSettingCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 11,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  changeAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    alignSelf: 'flex-start',
  },
  changeAvatarBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  avatarHintText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  roleInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ecfdf5',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  roleInfoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },

  // ─── Modal Styles ───────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 4,
  },
  formSubmitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  formSubmitBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
});