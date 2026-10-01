import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/client';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { generateAndDownloadQuotePdf } from '../services/pdfService';
import { computeQuoteTotals } from '../lib/quoteTotals';
import { QuoteRequestItem } from '../types';
import { colors, API_URL } from '../theme';

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

type QuoteSnapshotItem = {
  id?: string;
  type?: string;
  name?: string;
  title?: string;
  designation?: string;
  productName?: string;
  vehicleName?: string;
  vehicleId?: string;
  vehicle?: { id?: string; name?: string } | null;
  produit?: { nom?: string; image_url?: string | null } | null;
  quantity?: number | string;
  quantite?: number | string;
  unitPrice?: number | string;
  prixUnitaire?: number | string;
  prix_unitaire?: number | string;
  totalPrice?: number | string;
  totalLigne?: number | string;
  total?: number | string;
  prix_total?: number | string;
  startDate?: string;
  endDate?: string;
  days?: number | string;
  duration?: number | string;
  duree?: number | string;
  withDriver?: boolean;
  imageUrl?: string | null;
  image_url?: string | null;
};

type QuoteLookupResponse = {
  quoteRequest?: {
    reference: string;
    service?: string | null;
    titre?: string | null;
    budget?: string | number | null;
    nom?: string | null;
    telephone?: string | null;
    snapshot?: QuoteSnapshotItem[] | null;
    cree_le?: string | null;
  } | null;
};

const isVehicleQuoteItem = (item: QuoteSnapshotItem): boolean => (
  item.type === 'vehicle'
  || item.type === 'vehicle_rental'
  || item.type === 'location'
  || String(item.type || '').startsWith('vehicle')
  || Boolean(item.vehicleId)
);

const getQuoteRentalDays = (item: QuoteSnapshotItem): number => {
  if (item.startDate && item.endDate) {
    const duration = (new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / 86400000;
    if (Number.isFinite(duration)) return Math.max(1, Math.round(duration) + 1);
  }
  return Math.max(1, Number(item.days ?? item.duration ?? item.duree ?? 1) || 1);
};

const getQuoteLineTotal = (item: QuoteSnapshotItem): number => {
  const storedTotal = Number(item.totalPrice ?? item.totalLigne ?? item.total ?? item.prix_total ?? 0) || 0;
  if (storedTotal > 0) return storedTotal;

  const unitPrice = Number(item.unitPrice ?? item.prixUnitaire ?? item.prix_unitaire ?? 0) || 0;
  return isVehicleQuoteItem(item)
    ? unitPrice * getQuoteRentalDays(item)
    : unitPrice * (Number(item.quantity ?? item.quantite ?? 1) || 1);
};

const formatQuoteDate = (value: string): string => value.split('T')[0].split('-').reverse().join('/');


export default function CartScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { user, client } = useAuth();
  const {
    items,
    cartCount,
    totalAmount,
    loading,
    refreshCart,
    updateItemQuantity,
    removeItem,
    clearCart,
    validateCartQuote,
    saveLastOrder,
  } = useCart();
  const [validating, setValidating] = useState(false);
  const [notes, setNotes] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [quoteReference, setQuoteReference] = useState('');
  const [searchingQuote, setSearchingQuote] = useState(false);
  const [quoteSearchError, setQuoteSearchError] = useState('');

  // Totaux conformes au modèle officiel SOUTARAH (TDT uniquement sur véhicules)
  const vehicleHT = items.filter(i => i.type === 'vehicle').reduce((s, i) => s + (i.totalLigne || 0), 0);
  const ht = items.reduce((s, i) => s + (i.totalLigne || 0), 0);
  const displayTotals = computeQuoteTotals(ht, vehicleHT);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCart();
    setRefreshing(false);
  };

  const handleClearCart = () => {
    Alert.alert('Vider le panier', 'Voulez-vous vraiment retirer tous les articles du panier ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Vider', style: 'destructive', onPress: () => clearCart() },
    ]);
  };

  const handleSearchQuote = async () => {
    const reference = quoteReference.trim();
    if (!reference) return;

    setQuoteSearchError('');
    setSearchingQuote(true);

    try {
      const response = await api.get<QuoteLookupResponse>(
        `/quote-requests/lookup?reference=${encodeURIComponent(reference)}`
      );
      const quote = response.quoteRequest;
      if (!quote?.reference) {
        throw new Error('Aucun devis trouvé avec cette référence.');
      }

      const quoteItems = Array.isArray(quote.snapshot) ? quote.snapshot : [];
      const vehicleItems = quoteItems.filter(
        (item) => isVehicleQuoteItem(item) && item.vehicleId && item.startDate && item.endDate
      );

      for (const item of vehicleItems) {
        const vehicleLabel = item.vehicle?.name || item.vehicleName || 'Véhicule';
        const unavailableMessage = `Le véhicule « ${vehicleLabel} » n'est plus disponible du ${formatQuoteDate(item.startDate!)} au ${formatQuoteDate(item.endDate!)}. Choisissez une autre période ou un autre véhicule.`;

        try {
          const availability = await api.get<{ available: boolean }>(
            `/vehicles/${item.vehicleId}/availability?startAt=${encodeURIComponent(item.startDate!)}&endAt=${encodeURIComponent(item.endDate!)}`,
            false
          );
          if (availability.available === false) {
            setQuoteSearchError(unavailableMessage);
            return;
          }
        } catch (availabilityError: any) {
          // Une erreur réseau ne doit pas empêcher la reprise d'un devis produit.
          // En revanche, un 404 signifie que le véhicule n'existe plus ou n'est
          // plus actif : dans ce cas, la commande doit être bloquée.
          if (availabilityError?.status === 404) {
            setQuoteSearchError(unavailableMessage);
            return;
          }
          console.warn('[recherche devis] disponibilité non vérifiable:', availabilityError?.message);
        }
      }

      let ht = quoteItems.reduce((sum, item) => sum + getQuoteLineTotal(item), 0);
      const vehicleHT = quoteItems
        .filter(isVehicleQuoteItem)
        .reduce((sum, item) => sum + getQuoteLineTotal(item), 0);
      if (ht === 0 && Number(quote.budget) > 0) ht = Math.round(Number(quote.budget));
      const totals = computeQuoteTotals(ht, vehicleHT);

      const orderItems: QuoteRequestItem[] = quoteItems.map((item) => ({
        id: item.id,
        type: isVehicleQuoteItem(item) ? 'vehicle' : 'product',
        name: item.name || item.vehicleName || item.productName || item.produit?.nom || item.title || item.designation || 'Article',
        productName: item.productName || item.produit?.nom,
        vehicleName: item.vehicleName || item.vehicle?.name,
        quantity: Number(item.quantity ?? item.quantite ?? 1) || 1,
        unitPrice: Number(item.unitPrice ?? item.prixUnitaire ?? item.prix_unitaire ?? 0) || 0,
        totalPrice: getQuoteLineTotal(item),
        startDate: item.startDate,
        endDate: item.endDate,
        days: isVehicleQuoteItem(item) ? getQuoteRentalDays(item) : undefined,
        withDriver: item.withDriver,
        imageUrl: item.imageUrl || item.image_url || item.produit?.image_url,
      }));

      const clientName = [client?.prenom, client?.nom].filter(Boolean).join(' ')
        || quote.nom
        || user?.email?.split('@')[0]
        || 'Client SOUTARAH';
      const phone = user?.telephone || quote.telephone || '';

      await saveLastOrder({
        reference: quote.reference,
        name: clientName,
        phone,
        service: quote.service || 'Devis SOUTARAH',
        ht: totals.ht,
        tva: totals.tva,
        tdt: totals.tdt,
        carburant: totals.carburant,
        peage: totals.peage,
        ttc: totals.ttc,
        itemCount: quoteItems.length || (ht > 0 ? 1 : 0),
        summaryTitle: quote.titre || 'Devis SOUTARAH',
        items: orderItems,
        createdAt: quote.cree_le || new Date().toISOString(),
      });

      navigation.getParent()?.navigate('PasserCommande');
    } catch (error: any) {
      setQuoteSearchError(error?.message || 'Aucun devis trouvé avec cette référence.');
    } finally {
      setSearchingQuote(false);
    }
  };

  const handleValidate = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour valider votre demande de devis.', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => navigation.navigate('Profile') },
      ]);
      return;
    }

    if (items.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez des véhicules ou produits avant de valider votre demande.');
      return;
    }

    Alert.alert(
      'Transmission du devis',
      `Confirmez-vous l'envoi de votre demande pour un montant total estimé de ${formatMoney(displayTotals.ttc)} ? Votre devis en PDF sera automatiquement généré.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer la demande',
          onPress: async () => {
            setValidating(true);
            try {
              const currentItems = [...items];
              const currentNotes = notes;

              // 1. Demande de devis via /quote-requests (MÊME PROCÉDÉ QUE LE SITE :
              //    le panier n'est PAS vidé ici, il ne le sera qu'après confirmation).
              const clientName = [client?.prenom, client?.nom].filter(Boolean).join(' ') || user?.email?.split('@')[0] || 'Client SOUTARAH';
              const phone = user?.telephone || '';
              const description = currentItems
                .map(it => `${it.quantite || 1}x ${it.type === 'vehicle' ? (it.vehicleName || 'Location Véhicule') : (it.produit?.nom || 'Article')}`)
                .join(' | ')
                .slice(0, 3000);

              const res = await validateCartQuote({
                service: 'Négoce et Location',
                title: 'Devis Panier SOUTARAH',
                name: clientName,
                email: user?.email || 'client@soutarah.ci',
                phone: phone || '0700000000',
                location: client?.adresse || 'Abidjan',
                description: description || 'Devis panier client',
                budget: String(displayTotals.ttc),
                items: currentItems.map(ci => ({
                  id: ci.id,
                  type: ci.type,
                  name: ci.type === 'vehicle' ? ci.vehicleName : ci.produit?.nom,
                  vehicleName: ci.vehicleName,
                  productName: ci.produit?.nom,
                  quantity: ci.quantite,
                  unitPrice: ci.prixUnitaire,
                  totalPrice: ci.totalLigne,
                  startDate: ci.startDate,
                  endDate: ci.endDate,
                  days: ci.days,
                  withDriver: ci.withDriver,
                  imageUrl: ci.imageUrl || ci.produit?.image_url,
                })),
              });

              if (!res.success) {
                Alert.alert('Erreur', res.message);
                setValidating(false);
                return;
              }
              const quoteRef = res.reference || `DEV-${Date.now()}`;

              // 2. Générer et télécharger le PDF avec le snapshot + la référence serveur
              await generateAndDownloadQuotePdf({
                reference: quoteRef,
                client: {
                  name: clientName,
                  companyName: client?.entreprise?.nom,
                  phone: phone,
                  email: user?.email,
                  address: client?.adresse || undefined,
                },
                items: currentItems.map(it => ({
                  title: it.type === 'vehicle' ? it.vehicleName || 'Location Véhicule' : it.produit?.nom || 'Fourniture',
                  vehicleModel: it.type === 'vehicle' ? it.vehicleName : undefined,
                  destination: 'ABIDJAN',
                  startDate: it.startDate,
                  endDate: it.endDate,
                  days: it.days || 1,
                  quantity: it.quantite || 1,
                  dailyPrice: it.prixUnitaire || 0,
                  total: it.totalLigne || (it.prixUnitaire * (it.days || 1)),
                  imageUrl: it.imageUrl || it.produit?.image_url,
                })),
                totalAmount: displayTotals.ttc,
                notes: currentNotes || undefined,
              });
// 3. Enregistrer la commande puis rediriger vers « Passer commande »
              //    (le panier reste intact tant que la commande n'est pas confirmée)
              const nVehicles = currentItems.filter(i => i.type === 'vehicle').length;
              await saveLastOrder({
                reference: quoteRef,
                name: clientName,
                phone,
                service: 'Négoce et Location',
                ht: displayTotals.ht,
                tva: displayTotals.tva,
                tdt: displayTotals.tdt,
                carburant: displayTotals.carburant,
                peage: displayTotals.peage,
                ttc: displayTotals.ttc,
                itemCount: currentItems.length,
                summaryTitle: `${nVehicles} location(s) de véhicule${currentItems.length > nVehicles ? ' · articles' : ''}`,
                items: currentItems.map(ci => ({
                  id: ci.id,
                  type: ci.type,
                  name: ci.type === 'vehicle' ? ci.vehicleName : ci.produit?.nom,
                  vehicleName: ci.vehicleName,
                  productName: ci.produit?.nom,
                  quantity: ci.quantite,
                  unitPrice: ci.prixUnitaire,
                  totalPrice: ci.totalLigne,
                  startDate: ci.startDate,
                  endDate: ci.endDate,
                  days: ci.days,
                  withDriver: ci.withDriver,
                  imageUrl: ci.imageUrl || ci.produit?.image_url,
                })),
                createdAt: new Date().toISOString(),
              });

              navigation.getParent()?.navigate('PasserCommande');
            } catch (e: any) {
              Alert.alert('Erreur', e?.message || 'Une erreur est survenue lors de la création du devis.');
            } finally {
              setValidating(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mon Panier</Text>
          <Text style={styles.headerSubtitle}>
            {cartCount > 0
              ? `${cartCount} article${cartCount > 1 ? 's' : ''} synchronisé(s) avec le site`
              : 'Votre panier est vide'}
          </Text>
        </View>

        {items.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearCart}>
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
            <Text style={styles.clearBtnText}>Vider</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 20, 30) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Retrouver un devis existant avec sa référence système ou imprimée sur le PDF */}
        <View style={styles.quoteSearchCard}>
          <View style={styles.quoteSearchHeader}>
            <View style={styles.quoteSearchIcon}>
              <Ionicons name="search" size={20} color={colors.primary} />
            </View>
            <View style={styles.quoteSearchHeaderText}>
              <Text style={styles.quoteSearchTitle}>Rechercher un devis</Text>
              <Text style={styles.quoteSearchDesc}>
                Saisissez la référence de votre devis PDF pour reprendre votre commande.
              </Text>
            </View>
          </View>

          <View style={styles.quoteSearchInputRow}>
            <TextInput
              style={styles.quoteSearchInput}
              value={quoteReference}
              onChangeText={(value) => {
                setQuoteReference(value);
                if (quoteSearchError) setQuoteSearchError('');
              }}
              placeholder="09-26/LOC/164 ou DMD-2026-1234"
              placeholderTextColor="#94a3b8"
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={handleSearchQuote}
              editable={!searchingQuote}
            />
            <TouchableOpacity
              style={[
                styles.quoteSearchButton,
                (searchingQuote || !quoteReference.trim()) && styles.quoteSearchButtonDisabled,
              ]}
              onPress={handleSearchQuote}
              disabled={searchingQuote || !quoteReference.trim()}
              activeOpacity={0.85}
            >
              {searchingQuote ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="search-outline" size={17} color="#ffffff" />
                  <Text style={styles.quoteSearchButtonText}>Rechercher</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {quoteSearchError ? (
            <View style={styles.quoteSearchError}>
              <Ionicons name="alert-circle-outline" size={16} color="#b91c1c" />
              <Text style={styles.quoteSearchErrorText}>{quoteSearchError}</Text>
            </View>
          ) : null}
        </View>

        {loading && items.length === 0 ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 10, color: '#64748b', fontSize: 13 }}>Synchronisation du panier...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyCartCard}>
            <View style={styles.emptyCartIconBox}>
              <Ionicons name="cart-outline" size={54} color="#94a3b8" />
            </View>
            <Text style={styles.emptyCartTitle}>Votre panier est actuellement vide</Text>
            <Text style={styles.emptyCartDesc}>
              Parcourez nos véhicules et nos fournitures BTP, quincaillerie et énergie solaire pour ajouter des articles.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => navigation.navigate('Vehicles')}
              activeOpacity={0.85}
            >
              <Ionicons name="car-sport-outline" size={18} color="#ffffff" />
              <Text style={styles.exploreBtnText}>Explorer le catalogue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Items List */}
            <View style={styles.itemsList}>
              {items.map(item => {
                const isVehicle = item.type === 'vehicle';
                const title = isVehicle ? item.vehicleName || 'Location Véhicule' : item.produit?.nom || 'Produit';
                const imgUri = getImageUrl(isVehicle ? item.imageUrl : item.produit?.image_url);

                return (
                  <View key={item.id} style={styles.itemCard}>
                    <View style={styles.itemRow}>
                      {imgUri ? (
                        <Image source={{ uri: imgUri }} style={styles.itemThumb} resizeMode="cover" />
                      ) : (
                        <View style={styles.itemThumbPlaceholder}>
                          <Ionicons name={isVehicle ? 'car' : 'cube'} size={24} color="#94a3b8" />
                        </View>
                      )}

                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Text style={styles.itemTitle} numberOfLines={2}>
                            {title}
                          </Text>
                          <TouchableOpacity onPress={() => removeItem(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name="close-circle" size={20} color="#94a3b8" />
                          </TouchableOpacity>
                        </View>

                        {isVehicle ? (
                          <View style={styles.vehicleDetailsBox}>
                            <Text style={styles.vehicleDateText}>
                              📅 {item.startDate} → {item.endDate} ({item.days} j)
                            </Text>
                            {item.withDriver && (
                              <Text style={styles.driverTag}>✓ Avec chauffeur inclus</Text>
                            )}
                          </View>
                        ) : null}

                        <View style={styles.itemPriceRow}>
                          <Text style={styles.itemPriceUnit}>{formatMoney(item.prixUnitaire)} / unité</Text>
                          <Text style={styles.itemPriceTotal}>{formatMoney(item.totalLigne)}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Quantity Controls */}
                    <View style={styles.quantityControlsRow}>
                      <View style={styles.stepperContainer}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => updateItemQuantity(item.id, item.quantite - 1)}
                        >
                          <Ionicons name="remove" size={16} color="#071f11" />
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{item.quantite}</Text>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => updateItemQuantity(item.id, item.quantite + 1)}
                        >
                          <Ionicons name="add" size={16} color="#071f11" />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity style={styles.deleteBtn} onPress={() => removeItem(item.id)}>
                        <Ionicons name="trash-outline" size={14} color="#ef4444" />
                        <Text style={styles.deleteBtnText}>Supprimer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Instructions / Notes for Quote */}
            <View style={styles.notesCard}>
              <Text style={styles.notesTitle}>Instructions particulières (optionnel)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Ex: Précisions sur le lieu de livraison, horaires souhaités..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Total Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryHeader}>RÉCAPITULATIF DE LA DEMANDE</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Montant HT</Text>
                <Text style={styles.summaryVal}>{formatMoney(displayTotals.ht)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>TVA 18%</Text>
                <Text style={styles.summaryVal}>{formatMoney(displayTotals.tva)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>TDT 2.5% (sur véhicules)</Text>
                <Text style={styles.summaryVal}>{formatMoney(displayTotals.tdt)}</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRowTotal}>
                <Text style={styles.summaryTotalLabel}>Montant TTC Estimé</Text>
                <Text style={styles.summaryTotalVal}>{formatMoney(displayTotals.ttc)}</Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={handleValidate}
                disabled={validating}
                activeOpacity={0.85}
              >
                {validating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="download-outline" size={18} color="#ffffff" />
                    <Text style={styles.checkoutBtnText}>Valider & Télécharger mon devis PDF</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyCartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyCartIconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyCartTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  emptyCartDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#071f11',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  quoteSearchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#dbe7d5',
  },
  quoteSearchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  quoteSearchIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef7e9',
  },
  quoteSearchHeaderText: {
    flex: 1,
  },
  quoteSearchTitle: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  quoteSearchDesc: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  quoteSearchInputRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  quoteSearchInput: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#f8faf7',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '600',
  },
  quoteSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 15,
    borderRadius: 11,
    backgroundColor: colors.primaryDark,
  },
  quoteSearchButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  quoteSearchButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  quoteSearchError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  quoteSearchErrorText: {
    flex: 1,
    color: '#b91c1c',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  itemsList: {
    gap: 12,
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
  },
  itemThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  itemThumbPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
    marginRight: 6,
  },
  vehicleDetailsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 6,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  vehicleDateText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  driverTag: {
    fontSize: 10,
    color: '#15803d',
    fontWeight: '700',
    marginTop: 2,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  itemPriceUnit: {
    fontSize: 12,
    color: '#64748b',
  },
  itemPriceTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  quantityControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepperBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    paddingHorizontal: 8,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  deleteBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  notesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  notesInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 10,
    fontSize: 12,
    color: '#0f172a',
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 10,
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  summaryTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#071f11',
    borderRadius: 12,
    paddingVertical: 14,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
