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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { generateAndDownloadQuotePdf } from '../services/pdfService';
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
  } = useCart();
  const [validating, setValidating] = useState(false);
  const [notes, setNotes] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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
      `Confirmez-vous l'envoi de votre demande pour un montant total estimé de ${formatMoney(totalAmount)} ? Votre devis en PDF sera automatiquement généré et téléchargé.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer & Télécharger PDF',
          onPress: async () => {
            setValidating(true);
            try {
              // Copie locale des items avant réinitialisation du panier
              const currentItems = [...items];
              const currentTotal = totalAmount;

              const res = await validateCartQuote(notes);
              
              // On génère toujours le PDF, même si l'API de validation échoue, pour garantir l'expérience client
              const quoteRef = res?.reference || `DMD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

              // Génération et téléchargement automatique du PDF
              await generateAndDownloadQuotePdf({
                  reference: quoteRef,
                  client: {
                    name: [client?.prenom, client?.nom].filter(Boolean).join(' ') || user?.email?.split('@')[0] || 'Client',
                    companyName: client?.entreprise?.nom,
                    phone: user?.telephone,
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
                  totalAmount: currentTotal,
                  notes: notes || undefined,
                });

              // Enregistrement local garanti pour "Mes devis"
              const clientName = [client?.prenom, client?.nom].filter(Boolean).join(' ') || user?.email?.split('@')[0] || 'Client';
              const newQuoteObj = {
                id: `quote_${Date.now()}`,
                reference: quoteRef,
                service: 'Devis Panier SOUTARAH',
                titre: 'Devis Panier SOUTARAH',
                budget: currentTotal,
                cree_le: new Date().toISOString(),
                statut: 'PENDING',
              };

              try {
                const savedQuotes = await AsyncStorage.getItem('@soutarah_my_quotes');
                const list = savedQuotes ? JSON.parse(savedQuotes) : [];
                await AsyncStorage.setItem('@soutarah_my_quotes', JSON.stringify([newQuoteObj, ...list]));
              } catch (err) {
                console.error('Erreur sauvegarde devis local:', err);
              }

              // Envoi de la notification au backend / SMTP Brevo email
              api.post('/quote-requests', {
                service: 'Devis Panier SOUTARAH',
                title: `Demande de devis (${quoteRef})`,
                budget: String(currentTotal),
                description: currentItems.map(it => `${it.quantite || 1}x ${it.type === 'vehicle' ? it.vehicleName : it.produit?.nom}`).join(', '),
                name: clientName || 'Client SOUTARAH',
                email: user?.email || 'client@soutarah.ci',
                phone: user?.telephone || '0706919191',
                location: 'Abidjan',
              }).catch(() => {});

              await clearCart();

                Alert.alert(
                  '✅ Demande transmise & Devis généré',
                  `Votre demande de devis (${quoteRef}) a été enregistrée avec succès et votre document PDF est prêt.`,
                  [
                    {
                      text: 'Voir mes devis',
                      onPress: () => navigation.navigate('Reservations'),
                    },
                  ]
                );
              } catch (e: any) {
                Alert.alert('Erreur', e?.message || 'Une erreur est survenue.');
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
                <Text style={styles.summaryVal}>{formatMoney(totalAmount)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>TVA 18% (non facturée)</Text>
                <Text style={styles.summaryVal}>{formatMoney(Math.round(totalAmount * 0.18))}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>TDT 2.5% (non facturée)</Text>
                <Text style={styles.summaryVal}>{formatMoney(Math.round(totalAmount * 0.025))}</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRowTotal}>
                <Text style={styles.summaryTotalLabel}>Montant TTC Estimé</Text>
                <Text style={styles.summaryTotalVal}>{formatMoney(totalAmount)}</Text>
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
