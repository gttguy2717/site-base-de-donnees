import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { api } from '../api/client';
import { useCart } from '../contexts/CartContext';
import { Vehicle } from '../types';
import { colors, API_URL } from '../theme';

const getImageUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('file://')) {
    return url;
  }
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const VEHICLE_PRICES_MAP: Record<string, { abidjan: number; interieur: number }> = {
  'DUSTER': { abidjan: 35000, interieur: 40425 },
  'OROCK': { abidjan: 40000, interieur: 46200 },
  'JUMPER': { abidjan: 40000, interieur: 46200 },
  'KOLEOS': { abidjan: 45000, interieur: 51975 },
  'PAJERO 13': { abidjan: 60000, interieur: 69300 },
  'PAJERO 48': { abidjan: 55000, interieur: 63525 },
  'DOKKER': { abidjan: 35000, interieur: 40425 },
  'DZIRE': { abidjan: 30000, interieur: 36881 },
  'LAND CRUISER': { abidjan: 200000, interieur: 231000 },
  'KICKS': { abidjan: 45000, interieur: 51975 },
  'GRAND VITARA': { abidjan: 45000, interieur: 51976 },
  'KADJAR': { abidjan: 45046, interieur: 52028 },
  'MONTERO': { abidjan: 60000, interieur: 69300 },
  'HIGHLANDER': { abidjan: 60000, interieur: 69300 },
  'VITARA ROUGE': { abidjan: 40205, interieur: 46436 },
  'RUSH': { abidjan: 60000, interieur: 69300 },
  'TACOMA': { abidjan: 60000, interieur: 69300 },
  'L200': { abidjan: 60000, interieur: 69300 },
  'VAN EXPRESS': { abidjan: 35000, interieur: 40425 },
  'TRANSIT': { abidjan: 50000, interieur: 57750 },
  'URVAN': { abidjan: 80000, interieur: 92400 },
  'DMAX': { abidjan: 60000, interieur: 69300 },
  'FRONX': { abidjan: 35000, interieur: 40425 },
  'VITZ': { abidjan: 23000, interieur: 26565 },
  'FRIDAY': { abidjan: 70000, interieur: 80850 },
  'FORTUNER': { abidjan: 119726, interieur: 138283 },
  'MICRA': { abidjan: 30911, interieur: 35703 },
};

const getDynamicPrice = (vehicle: Vehicle, dest: string): number => {
  const modelUpper = `${vehicle.marque || ''} ${vehicle.modele || ''}`.toUpperCase();
  for (const [key, prices] of Object.entries(VEHICLE_PRICES_MAP)) {
    if (modelUpper.includes(key)) {
      return dest === 'Intérieur' ? prices.interieur : prices.abidjan;
    }
  }
  const defaultBase = vehicle.dailyPrice || vehicle.prix_journalier_particulier || 50000;
  return dest === 'Intérieur' ? Math.round(defaultBase * 1.15) : defaultBase;
};

export default function VehicleDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const insets = useSafeAreaInsets();
  const { vehicleId } = route.params;
  const { cartCount, addVehicleToCart } = useCart();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withDriver, setWithDriver] = useState(true);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 86400000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showDestMenu, setShowDestMenu] = useState(false);
  const [selectedColor, setSelectedColor] = useState<'Noir' | 'Blanc'>('Noir');
  const [destination, setDestination] = useState<'Abidjan' | 'Intérieur'>('Abidjan');
  const [addingToCart, setAddingToCart] = useState(false);

  const formatDateFR = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const computedDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  const loadVehicle = useCallback(async () => {
    try {
      const data = await api.get<{ vehicles: Vehicle[] }>('/vehicles');
      const found = data.vehicles?.find(v => v.id === vehicleId);
      setVehicle(found || null);
    } catch {
      setVehicle(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    loadVehicle();
  }, [loadVehicle]);

  const onRefresh = () => {
    setRefreshing(true);
    loadVehicle();
  };

  const handleAddToCart = async () => {
    if (!vehicle) return;
    setAddingToCart(true);

    const startDateStr = formatDateFR(startDate);
    const endDateStr = formatDateFR(endDate);
    const dailyPrice = getDynamicPrice(vehicle, destination);

    const success = await addVehicleToCart({
      id: vehicle.id,
      marque: vehicle.marque,
      modele: vehicle.modele,
      image_url: vehicle.image_url,
      dailyPrice,
      startDate: startDateStr,
      endDate: endDateStr,
      days: computedDays,
      withDriver,
    });

    setAddingToCart(false);
    if (success) {
      Alert.alert(
        '🛒 Ajouté au panier !',
        `${vehicle.marque} ${vehicle.modele} (${computedDays} jours à ${destination}) a été ajouté à votre panier. Vous pouvez consulter le détail tarifaire et télécharger votre devis officiel dans le panier.`,
        [
          { text: 'Continuer', style: 'cancel' },
          { text: 'Voir le panier', onPress: () => navigation.navigate('Main', { screen: 'Cart' }) },
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.centerBox}>
        <Ionicons name="alert-circle-outline" size={48} color="#94a3b8" />
        <Text style={styles.notFoundText}>Véhicule introuvable</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Retourner au catalogue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imgUri = getImageUrl(vehicle.image_url);

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      {/* Top Floating Nav */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.iconCircleBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {vehicle.marque} {vehicle.modele}
        </Text>

        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => navigation.navigate('Main', { screen: 'Cart' })}
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

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 90, 110) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Vehicle Image Banner */}
        <View style={styles.imageCard}>
          {imgUri ? (
            <Image source={{ uri: imgUri }} style={styles.vehicleImg} resizeMode="cover" />
          ) : (
            <View style={styles.vehicleImgPlaceholder}>
              <Ionicons name="car-sport-outline" size={54} color="#94a3b8" />
            </View>
          )}

          <View style={[styles.availPill, { backgroundColor: vehicle.disponibilite ? '#dcfce7' : '#fee2e2' }]}>
            <Text style={[styles.availPillText, { color: vehicle.disponibilite ? '#15803d' : '#b91c1c' }]}>
              {vehicle.disponibilite ? '● Disponible' : '● Indisponible'}
            </Text>
          </View>
        </View>

        {/* Title and Category */}
        <View style={styles.infoCard}>
          <Text style={styles.categoryLabel}>{vehicle.categorie}</Text>
          <Text style={styles.vehicleName}>
            {vehicle.marque} {vehicle.modele}
          </Text>
        </View>

        {/* Characteristics Grid */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeader}>CARACTÉRISTIQUES DU VÉHICULE</Text>

          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <Ionicons name="people" size={20} color="#15803d" />
              <Text style={styles.specVal}>{vehicle.places || 5} Places</Text>
              <Text style={styles.specLabel}>Capacité</Text>
            </View>
            <View style={styles.specBox}>
              <Ionicons name="speedometer" size={20} color="#15803d" />
              <Text style={styles.specVal}>{vehicle.transmission || 'Automatique'}</Text>
              <Text style={styles.specLabel}>Boîte</Text>
            </View>
            <View style={styles.specBox}>
              <Ionicons name="snow" size={20} color="#15803d" />
              <Text style={styles.specVal}>Climatisé</Text>
              <Text style={styles.specLabel}>Confort</Text>
            </View>
            <View style={styles.specBox}>
              <Ionicons name="shield-checkmark" size={20} color="#15803d" />
              <Text style={styles.specVal}>Tous risques</Text>
              <Text style={styles.specLabel}>Assurance</Text>
            </View>
          </View>
        </View>

        {/* Configuration de la demande de location (Modèle Capture d'écran) */}
        <View style={styles.cardSection}>
          <View style={styles.configHeaderBox}>
            <Text style={styles.greenTagText}>LOCATION DE VÉHICULE</Text>
            <Text style={styles.configTitleText}>Sélectionnez vos dates</Text>
            <Text style={styles.configSubText}>Vos informations de compte seront utilisées automatiquement.</Text>
          </View>

          {/* Dates Row */}
          <View style={styles.datesRow}>
            <View style={styles.dateCol}>
              <Text style={styles.fieldLabel}>Date de début *</Text>
              <TouchableOpacity style={styles.dateInputBox} onPress={() => setShowStartPicker(true)}>
                <Text style={styles.dateValueText}>{formatDateFR(startDate)}</Text>
                <Ionicons name="calendar-outline" size={18} color="#0f172a" />
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={new Date()}
                  onChange={(event, selected) => {
                    setShowStartPicker(false);
                    if (selected) {
                      setStartDate(selected);
                      if (selected >= endDate) {
                        setEndDate(new Date(selected.getTime() + 86400000));
                      }
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.dateCol}>
              <Text style={styles.fieldLabel}>Date de fin *</Text>
              <TouchableOpacity style={styles.dateInputBox} onPress={() => setShowEndPicker(true)}>
                <Text style={styles.dateValueText}>{formatDateFR(endDate)}</Text>
                <Ionicons name="calendar-outline" size={18} color="#0f172a" />
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={new Date(startDate.getTime() + 86400000)}
                  onChange={(event, selected) => {
                    setShowEndPicker(false);
                    if (selected) setEndDate(selected);
                  }}
                />
              )}
            </View>
          </View>

          {/* Destination */}
          <Text style={styles.fieldLabel}>Destination *</Text>
          <TouchableOpacity
            style={styles.dropdownBox}
            onPress={() => setShowDestMenu(!showDestMenu)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownValueText}>{destination}</Text>
            <Ionicons name={showDestMenu ? 'chevron-up' : 'chevron-down'} size={18} color="#0f172a" />
          </TouchableOpacity>

          {showDestMenu && (
            <View style={styles.dropdownMenuContainer}>
              {['Abidjan', 'Intérieur'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.dropdownMenuItem, destination === opt && styles.dropdownMenuItemActive]}
                  onPress={() => {
                    setDestination(opt as any);
                    setShowDestMenu(false);
                  }}
                >
                  <Text style={[styles.dropdownMenuItemText, destination === opt && styles.dropdownMenuItemTextActive]}>
                    {opt}
                  </Text>
                  {destination === opt && <Ionicons name="checkmark" size={16} color="#15803d" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Couleur */}
          <Text style={styles.fieldLabel}>Couleur du véhicule *</Text>
          <View style={styles.colorPillsRow}>
            {[
              { label: 'Noir', colorHex: '#0f172a' },
              { label: 'Blanc', colorHex: '#ffffff', border: '#cbd5e1' },
            ].map((c) => (
              <TouchableOpacity
                key={c.label}
                style={[
                  styles.colorPill,
                  selectedColor === c.label && styles.colorPillActive,
                ]}
                onPress={() => setSelectedColor(c.label as any)}
              >
                <View
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: c.colorHex,
                      borderWidth: c.border ? 1 : 0,
                      borderColor: c.border || 'transparent',
                    },
                  ]}
                />
                <Text style={styles.colorPillText}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Option Chauffeur Card */}
          <TouchableOpacity
            style={[styles.driverOptionCard, withDriver && styles.driverOptionCardActive]}
            onPress={() => setWithDriver(!withDriver)}
            activeOpacity={0.85}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.driverTitleText}>Option chauffeur professionnel</Text>
              <Text style={styles.driverSubText}>Disponible de 7h à 21h selon conditions SOUTARAH.</Text>
            </View>
            <View style={[styles.checkboxSquare, withDriver && styles.checkboxSquareChecked]}>
              {withDriver && <Ionicons name="checkmark" size={14} color="#ffffff" />}
            </View>
          </TouchableOpacity>

          {/* Durée estimée */}
          <View style={styles.durationBox}>
            <Text style={styles.durationLabelText}>Durée estimée</Text>
            <Text style={styles.durationValueText}>{computedDays} jour{computedDays > 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Description */}
        {vehicle.description ? (
          <View style={styles.cardSection}>
            <Text style={styles.sectionHeader}>DESCRIPTION</Text>
            <Text style={styles.descriptionText}>{vehicle.description}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Fixed Bottom Action Bar: ONLY 1 BUTTON "Ajouter au panier" */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 8, 14) }]}>
        <TouchableOpacity
          style={styles.singleAddToCartBtn}
          onPress={handleAddToCart}
          disabled={addingToCart}
          activeOpacity={0.85}
        >
          {addingToCart ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="cart" size={20} color="#ffffff" />
              <Text style={styles.singleAddToCartBtnText}>Ajouter au panier</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 10,
  },
  backBtn: {
    backgroundColor: '#071f11',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: '700',
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
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  cartBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
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
  content: {
    flex: 1,
    padding: 16,
  },
  imageCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
    marginBottom: 14,
  },
  vehicleImg: {
    width: '100%',
    height: 210,
  },
  vehicleImgPlaceholder: {
    width: '100%',
    height: 210,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  availPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  availPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: 1,
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  cardSection: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 12,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specBox: {
    width: '48.5%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  specVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 4,
  },
  specLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  inputTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  destinationRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  destChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  destChipActive: {
    backgroundColor: '#071f11',
    borderColor: '#071f11',
  },
  destChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  destChipTextActive: {
    color: '#ffffff',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  optionRowActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  optionDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  daysStepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepperBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    paddingHorizontal: 8,
  },
  quoteNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  quoteNoticeText: {
    fontSize: 11,
    color: '#166534',
    lineHeight: 16,
    flex: 1,
  },
  descriptionText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  singleAddToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#226600',
    borderRadius: 30,
    paddingVertical: 15,
    elevation: 3,
  },
  singleAddToCartBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },

  // Screenshot Form Styles
  configHeaderBox: {
    marginBottom: 16,
  },
  greenTagText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#226600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  configTitleText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  configSubText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  dateCol: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    marginTop: 8,
  },
  dateInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
  },
  dropdownValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  dropdownMenuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginTop: -8,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 3,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownMenuItemActive: {
    backgroundColor: '#f0fdf4',
  },
  dropdownMenuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  dropdownMenuItemTextActive: {
    color: '#15803d',
    fontWeight: '800',
  },
  colorPillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  colorPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
  },
  colorPillActive: {
    borderColor: '#226600',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  colorPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  driverOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4fbf4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dcfce7',
    padding: 16,
    marginBottom: 14,
  },
  driverOptionCardActive: {
    borderColor: '#86efac',
  },
  driverTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  driverSubText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxSquareChecked: {
    backgroundColor: '#226600',
    borderColor: '#226600',
  },
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 4,
  },
  durationLabelText: {
    fontSize: 14,
    color: '#64748b',
  },
  durationValueText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
});