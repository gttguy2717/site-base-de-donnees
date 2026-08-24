import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { useCart } from '../contexts/CartContext';
import { Vehicle } from '../types';
import { colors, API_URL } from '../theme';

const CATEGORIES = ['Tous', 'SUV', 'Berline', '4x4', 'Pick-up', 'Minibus', 'Autocar', 'Utilitaire'];

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

export default function VehiclesScreen({ route, navigation }: { route?: any; navigation: any }) {
  const insets = useSafeAreaInsets();
  const { cartCount } = useCart();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tous');
  const searchInputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      if (route?.params?.selectedCategory) {
        setCategory(route.params.selectedCategory);
      }
      if (route?.params?.autoFocusSearch) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 150);
      }
    }, [route?.params?.selectedCategory, route?.params?.autoFocusSearch])
  );

  const loadVehicles = useCallback(async () => {
    try {
      const data = await api.get<{ vehicles: Vehicle[] }>('/vehicles');
      setVehicles(data.vehicles || []);
    } catch {
      setVehicles([]);
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

  const filteredVehicles = vehicles.filter(v => {
    const matchSearch =
      !search.trim() ||
      `${v.marque} ${v.modele}`.toLowerCase().includes(search.toLowerCase()) ||
      v.categorie.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'Tous' || v.categorie === category;
    return matchSearch && matchCategory;
  });

  const renderItem = ({ item }: { item: Vehicle }) => {
    const imgUri = getImageUrl(item.image_url);
    const dailyPrice = item.dailyPrice ?? item.prix_journalier_particulier;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation?.navigate('VehicleDetail', { vehicleId: item.id })}
      >
        <View style={styles.cardHeader}>
          {imgUri ? (
            <Image source={{ uri: imgUri }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Ionicons name="car-sport-outline" size={40} color="#94a3b8" />
            </View>
          )}

          <View style={[styles.availabilityBadge, { backgroundColor: item.disponibilite ? '#dcfce7' : '#fee2e2' }]}>
            <Text style={[styles.availabilityBadgeText, { color: item.disponibilite ? '#15803d' : '#b91c1c' }]}>
              {item.disponibilite ? '● Disponible' : '● Indisponible'}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>
                {item.marque} {item.modele}
              </Text>
              <Text style={styles.cardCategory}>{item.categorie} • {item.places || 5} places</Text>
            </View>
          </View>

          <View style={styles.featuresRow}>
            <View style={styles.featurePill}>
              <Ionicons name="speedometer-outline" size={12} color="#64748b" />
              <Text style={styles.featurePillText}>{item.transmission || 'Automatique'}</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.priceLabel}>Tarification</Text>
              <Text style={styles.cardPrice}>
                Sur devis
              </Text>
            </View>

            <TouchableOpacity
              style={styles.detailsBtn}
              onPress={() => navigation.navigate('VehicleDetail', { vehicleId: item.id })}
              activeOpacity={0.8}
            >
              <Text style={styles.detailsBtnText}>Réserver</Text>
              <Ionicons name="arrow-forward" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Catalogue Véhicules</Text>
          <Text style={styles.subtitle}>{filteredVehicles.length} véhicule(s) disponible(s)</Text>
        </View>

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
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#94a3b8" />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Rechercher marque, modèle, SUV..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Categories Chips */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
          {CATEGORIES.map(item => (
            <TouchableOpacity
              key={item}
              style={[styles.categoryChip, category === item && styles.categoryChipActive]}
              onPress={() => setCategory(item)}
            >
              <Text style={[styles.categoryChipText, category === item && styles.categoryChipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Vehicle List */}
      <FlatList
        data={filteredVehicles}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="car-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyTitle}>Aucun véhicule trouvé</Text>
              <Text style={styles.emptySubtitle}>Essayez de modifier votre recherche ou filtre.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  categoriesContainer: {
    marginVertical: 10,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  categoryChipActive: {
    backgroundColor: '#071f11',
    borderColor: '#071f11',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  availabilityBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  availabilityBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardBody: {
    padding: 14,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardCategory: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featurePillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#15803d',
  },
  cardPerDay: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#071f11',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  detailsBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
});