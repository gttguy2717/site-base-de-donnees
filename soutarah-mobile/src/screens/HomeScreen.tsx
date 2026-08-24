import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { api } from '../api/client';
import { Vehicle } from '../types';
import { colors, API_URL } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const formatMoney = (value: number | string | undefined | null): string => {
  const n = Number(value || 0);
  return n.toLocaleString('fr-FR') + ' FCFA';
};

const getImageUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('file://')) {
    return url;
  }
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function HomeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { user, client } = useAuth();
  const { cartCount, addVehicleToCart } = useCart();
  const [popularVehicles, setPopularVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadVehicles = useCallback(async () => {
    try {
      const data = await api.get<{ vehicles: Vehicle[] }>('/vehicles');
      setPopularVehicles(data.vehicles?.slice(0, 6) || []);
    } catch {
      setPopularVehicles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const onRefresh = () => {
    setRefreshing(true);
    loadVehicles();
  };

  const displayName =
    client?.entreprise?.nom ||
    client?.prenom ||
    user?.email?.split('@')[0] ||
    'Client SOUTARAH';

  const categories = [
    { id: 'SUV', label: 'SUVs & 4x4', icon: 'car-sport' as const, bg: '#dcfce7', color: '#15803d' },
    { id: 'Berline', label: 'Berlines', icon: 'car' as const, bg: '#e0f2fe', color: '#0284c7' },
    { id: 'Pick-up', label: 'Pick-ups BTP', icon: 'construct' as const, bg: '#fef3c7', color: '#d97706' },
    { id: 'Minibus', label: 'Minibus', icon: 'bus' as const, bg: '#ede9fe', color: '#7c3aed' },
  ];

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.greetingName} numberOfLines={1}>
            Bienvenue, {displayName} 👋
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Cart Button with Live Badge */}
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={22} color="#071f11" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Profile Avatar Button */}
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            {user?.avatar_url ? (
              <Image source={{ uri: getImageUrl(user.avatar_url) || user.avatar_url }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={18} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Vehicles', { autoFocusSearch: true })}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={18} color="#94a3b8" />
          <Text style={styles.searchPlaceholder}>Rechercher un véhicule, SUV, berline...</Text>
        </TouchableOpacity>

        {/* Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#4ade80" />
            <Text style={styles.heroBadgeText}>Location & Fournitures Officielles</Text>
          </View>

          <Text style={styles.heroTitle}>Location de véhicules avec ou sans chauffeur</Text>
          <Text style={styles.heroDesc}>
            Partez en mission, événement ou voyage avec des véhicules récents, assurés et entretenus.
          </Text>

          <TouchableOpacity
            style={styles.heroActionBtn}
            onPress={() => navigation.navigate('Vehicles')}
            activeOpacity={0.85}
          >
            <Text style={styles.heroActionBtnText}>Réserver maintenant</Text>
            <Ionicons name="arrow-forward" size={16} color="#071f11" />
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <Text style={styles.sectionTitle}>CATÉGORIES POPULAIRES</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={styles.catCard}
              onPress={() => navigation.navigate('Vehicles', { selectedCategory: cat.id })}
              activeOpacity={0.8}
            >
              <View style={[styles.catIconBox, { backgroundColor: cat.bg }]}>
                <Ionicons name={cat.icon} size={22} color={cat.color} />
              </View>
              <Text style={styles.catLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Vehicles Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>VÉHICULES DISPONIBLES</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Vehicles')}>
            <Text style={styles.seeAllText}>Voir tout ({popularVehicles.length})</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 30 }} />
        ) : popularVehicles.length === 0 ? (
          <View style={styles.emptyVehiclesCard}>
            <Ionicons name="car-sport-outline" size={40} color="#cbd5e1" />
            <Text style={styles.emptyVehiclesText}>Aucun véhicule disponible pour le moment.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vehiclesScroll}>
            {popularVehicles.map(veh => {
              const imgUri = getImageUrl(veh.image_url);
              const dailyPrice = veh.dailyPrice ?? veh.prix_journalier_particulier;

              return (
                <TouchableOpacity
                  key={veh.id}
                  style={styles.vehicleCard}
                  onPress={() => navigation.navigate('VehicleDetail', { vehicleId: veh.id })}
                  activeOpacity={0.85}
                >
                  {imgUri ? (
                    <Image source={{ uri: imgUri }} style={styles.vehicleImg} resizeMode="cover" />
                  ) : (
                    <View style={styles.vehicleImgPlaceholder}>
                      <Ionicons name="car" size={36} color="#94a3b8" />
                    </View>
                  )}

                  <View style={styles.vehicleBody}>
                    <View style={styles.vehicleBadgeRow}>
                      <Text style={styles.vehicleCategoryBadge}>{veh.categorie}</Text>
                      <Text style={[styles.availText, { color: veh.disponibilite ? '#15803d' : '#ef4444' }]}>
                        {veh.disponibilite ? '● Dispo' : '● Indispo'}
                      </Text>
                    </View>

                    <Text style={styles.vehicleTitle} numberOfLines={1}>
                      {veh.marque} {veh.modele}
                    </Text>

                    <View style={styles.priceContainer}>
                      <Text style={styles.surDevisBadge}>Sur devis</Text>
                      <Text style={styles.dispoDetailText}>Chauffeur disponible</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.reserveCardBtn}
                      onPress={() => navigation.navigate('VehicleDetail', { vehicleId: veh.id })}
                    >
                      <Text style={styles.reserveCardBtnText}>Détails & Réservation</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Engagements SOUTARAH */}
        <View style={styles.engagementsCard}>
          <Text style={styles.engagementsHeader}>POURQUOI CHOISIR SOUTARAH GROUP ?</Text>

          <View style={styles.engagementRow}>
            <View style={[styles.engagementIconBox, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="shield-checkmark" size={18} color="#15803d" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.engagementTitle}>Véhicules récents & assurés</Text>
              <Text style={styles.engagementDesc}>Tous nos véhicules bénéficient d'un entretien rigoureux et assurance tous risques.</Text>
            </View>
          </View>

          <View style={styles.engagementRow}>
            <View style={[styles.engagementIconBox, { backgroundColor: '#e0f2fe' }]}>
              <Ionicons name="sync" size={18} color="#0284c7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.engagementTitle}>Panier & Devis synchronisés</Text>
              <Text style={styles.engagementDesc}>Retrouvez vos devis et réservations en temps réel sur le site et l'application mobile.</Text>
            </View>
          </View>

          <View style={styles.engagementRow}>
            <View style={[styles.engagementIconBox, { backgroundColor: '#ede9fe' }]}>
              <Ionicons name="headset" size={18} color="#7c3aed" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.engagementTitle}>Service client dédié 24/7</Text>
              <Text style={styles.engagementDesc}>Une assistance permanente à votre écoute au +225 07 18 38 38 38.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  greetingSub: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#15803d',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#071f11',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    gap: 8,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: '#94a3b8',
    flex: 1,
  },
  heroCard: {
    backgroundColor: '#071f11',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#154a27',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: '#4ade80',
    fontSize: 11,
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 24,
  },
  heroDesc: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 6,
    lineHeight: 18,
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 14,
  },
  heroActionBtnText: {
    color: '#071f11',
    fontWeight: '800',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
  catScroll: {
    gap: 10,
    paddingBottom: 8,
  },
  catCard: {
    width: 100,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  catIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  catLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  vehiclesScroll: {
    gap: 12,
    paddingBottom: 8,
  },
  vehicleCard: {
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  vehicleImg: {
    width: '100%',
    height: 125,
  },
  vehicleImgPlaceholder: {
    width: '100%',
    height: 125,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleBody: {
    padding: 12,
  },
  vehicleBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vehicleCategoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284c7',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  availText: {
    fontSize: 10,
    fontWeight: '700',
  },
  vehicleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  priceContainer: {
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  surDevisBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dispoDetailText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  reserveCardBtn: {
    backgroundColor: '#071f11',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  reserveCardBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyVehiclesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 10,
  },
  emptyVehiclesText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 6,
  },
  engagementsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  engagementsHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 12,
  },
  engagementRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  engagementIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  engagementTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  engagementDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
});