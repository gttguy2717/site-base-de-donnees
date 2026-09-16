import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { LastOrder } from '../types';
import { colors, API_URL } from '../theme';

const formatMoney = (value: number | string | undefined | null): string => {
  const n = Number(value || 0);
  return n.toLocaleString('fr-FR') + ' FCFA';
};

// Logos officiels servis par le site (backend déployé)
const LOGO_BASE = API_URL.replace(/\/api\/?$/, '') + '/img/payment/';

const PAYMENT_METHODS = [
  { id: 'carte', label: 'Carte bancaire', hint: 'Visa et Mastercard', icon: 'card', logo: 'mastercard.png' },
  { id: 'orange', label: 'Orange Money', hint: 'Paiement mobile Orange CI', icon: 'phone-portrait', logo: 'orange-money.png' },
  { id: 'mtn', label: 'MTN Mobile Money', hint: 'Mobile Money MTN CI', icon: 'phone-portrait', logo: 'mtn.png' },
  { id: 'moov', label: 'Moov Money / Wave', hint: 'Mobile Money & Wave CI', icon: 'phone-portrait', logo: 'wave.png' },
  { id: 'especes', label: 'Espèces à l’agence', hint: 'Paiement sur place', icon: 'cash' },
];

const CHANNEL_MAP: Record<string, string> = {
  carte: 'card',
  orange: 'orange_money',
  mtn: 'mtn_momo',
  moov: 'moov_money',
};

// ─── Formatage des champs carte bancaire ────────────────────────────────────
const formatCardNumber = (text: string): string =>
  text.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatCardExpiry = (text: string): string => {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};
const formatCardCvc = (text: string): string => text.replace(/\D/g, '').slice(0, 3);
const isCardValid = (card: { cardNumber: string; cardExpiry: string; cardCvc: string; cardHolder: string }): boolean => {
  const num = (card.cardNumber || '').replace(/\s/g, '');
  const [mm, yy] = (card.cardExpiry || '').split('/');
  const mmNum = Number(mm);
  const yyNum = Number(yy);
  return (
    /^\d{16}$/.test(num) &&
    mmNum >= 1 && mmNum <= 12 &&
    yyNum >= 0 && yyNum <= 99 &&
    /^\d{3}$/.test(card.cardCvc || '') &&
    (card.cardHolder || '').trim().length >= 2
  );
};

export default function PasserCommandeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getLastOrder, clearLastOrder, clearCart } = useCart();

  const [order, setOrder] = useState<LastOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('carte');
  const [form, setForm] = useState({ name: '', phone: '', cardNumber: '', cardExpiry: '', cardCvc: '', cardHolder: '' });
  const [mobileNumber, setMobileNumber] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [paymentNote, setPaymentNote] = useState('');

  useEffect(() => {
    (async () => {
      const o = await getLastOrder();
      if (o) {
        setOrder(o);
        setForm({ name: o.name || '', phone: o.phone || '', cardNumber: '', cardExpiry: '', cardCvc: '', cardHolder: '' });
        setMobileNumber(o.phone || '');
      }
      setLoading(false);
    })();
  }, [getLastOrder]);

  const isEspeces = method === 'especes';
  const isMobile = method === 'orange' || method === 'mtn' || method === 'moov';
  const selected = PAYMENT_METHODS.find((m) => m.id === method);
const paidNote = (): string => {
    if (paymentNote) return paymentNote;
    if (method === 'carte') return 'Votre paiement par carte est en cours de traitement. Vous recevrez la confirmation et votre reçu par SMS / email.';
    if (isMobile) return 'Votre paiement mobile est en cours de traitement. Un message de confirmation vous sera envoyé sur votre numéro.';
    return 'Merci de venir régler en espèces à notre agence. Un message de confirmation vous sera envoyé pour vous rappeler de vous présenter sur place.';
  };

  const submitOrder = async () => {
    if (!order) return;

    // Validations de superficie avant paiement
    if (method === 'carte' && !isCardValid(form)) {
      Alert.alert(
        'Carte bancaire',
        'Veuillez vérifier les informations de la carte : numéro de 16 chiffres, expiration MM/AA valide, CVC à 3 chiffres et nom du titulaire.'
      );
      return;
    }
    if (isMobile && mobileNumber.replace(/\D/g, '').length < 8) {
      Alert.alert('Paiement mobile', `Veuillez saisir le numéro ${selected?.label || 'mobile'} à compléter (au moins 8 chiffres).`);
      return;
    }

    setSending(true);
    setPaymentNote('');

    let paidOnline = false;

    try {
      // 1. Paiement en ligne via Genius Pay (carte, Orange Money, MTN, Moov/Wave)
      if (!isEspeces) {
        try {
          const pay = await api.post<{ checkoutUrl?: string }>('/payments/geniuspay/initialize', {
            amount: order.ttc,
            reference: order.reference,
            description: `Commande ${order.reference} - SOUTARAH GROUP`,
            customerName: form.name || order.name || user?.email || 'Client SOUTARAH',
            customerPhone: form.phone || order.phone || '0700000000',
            channel: CHANNEL_MAP[method] || 'card',
          });
          if (pay?.checkoutUrl) {
            paidOnline = true;
            Linking.openURL(pay.checkoutUrl).catch(() => {
              Alert.alert('Paiement en ligne', 'Ouvrez la page de paiement Genius Pay pour finaliser votre règlement.');
            });
          }
        } catch (payError: any) {
          // Genius Pay non configuré ou indisponible → repli : confirmation simple
          console.log('[commande] GeniusPay indisponible:', payError?.message);
          setPaymentNote('Paiement en ligne indisponible : votre commande est bien enregistrée, le règlement sera à convenir avec notre équipe.');
        }
      }

      // 2. Confirmation de la commande — le devis (avec snapshot) a déjà été créé
      //    à la validation du panier (MÊME PROCÉDÉ QUE LE SITE).
      try {
        await api.post('/quote-requests/confirm', {
          reference: order.reference,
          paymentMethod: selected?.label || method,
        });
      } catch (confirmError: any) {
        console.log('[commande] Auto-validation devis:', confirmError?.message);
      }
    } catch (err) {
      console.log('[commande] Erreur:', err);
    } finally {
      // Vider le panier UNIQUEMENT si le paiement est réellement confirmé
      // (espèces validées OU redirection réelle vers Genius Pay), comme sur le site.
      const paymentYetDone = isEspeces || paidOnline;
      if (paymentYetDone) {
        await clearCart();
        await clearLastOrder();
      }
      setSending(false);
      setConfirmed(true);
    }
  };

  const renderConfirmed = () => (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <SafeAreaView style={styles.confirmedWrap} edges={['bottom']}>
        <View style={styles.confirmedIcon}>
          <Ionicons name="checkmark-circle" size={64} color="#ffffff" />
        </View>
        <Text style={styles.confirmedTitle}>Commande confirmée !</Text>
        <Text style={styles.confirmedSubtitle}>
          {order ? `Votre commande ${order.reference} a bien été enregistrée.` : 'Votre commande a bien été enregistrée.'}
        </Text>
        <View style={styles.confirmedInfoCard}>
          <View style={styles.confirmedRow}>
            <Text style={styles.confirmedLabel}>Mode de paiement</Text>
            <Text style={styles.confirmedValue}>{selected?.label || '—'}</Text>
          </View>
          {order && (
            <View style={styles.confirmedRow}>
              <Text style={styles.confirmedLabel}>Montant TTC</Text>
              <Text style={styles.confirmedValue}>{formatMoney(order.ttc)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.confirmedNote}>{isEspeces ? paidNote() : (paymentNote || paidNote())}</Text>
        <TouchableOpacity style={styles.confirmedBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.confirmedBtnText}>Retour au panier</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.textSecondary, fontSize: 13 }}>Chargement de votre commande...</Text>
      </View>
    );
  }

  if (confirmed) {
    return renderConfirmed();
  }

  return (
    <SafeAreaView style={[styles.flex, { paddingTop: insets.top }]} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 16, 24) }}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={18} color={colors.primary} />
          <Text style={styles.backText}>Retour au panier</Text>
        </TouchableOpacity>
{!order ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-outline" size={52} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Aucune commande en attente</Text>
            <Text style={styles.emptyDesc}>
              Validez votre panier pour créer une demande de devis puis passer commande, comme sur le site.
            </Text>
          </View>
        ) : (
          <>
            {/* En-tête */}
            <View style={styles.headerCard}>
              <Text style={styles.headerTitle}>Passer commande</Text>
              <Text style={styles.headerRef}>Devis {order.reference}</Text>
              <Text style={styles.headerSubtitle}>{order.summaryTitle || 'Commande SOUTARAH GROUP'}</Text>
            </View>

            {/* Récapitulatif */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>RÉCAPITULATIF</Text>
              {order.items && order.items.length > 0 && (
                order.items.slice(0, 6).map((it, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {it.name || it.vehicleName || it.productName || 'Article'}
                    </Text>
                    <Text style={styles.itemQty}>x{it.quantity || 1}</Text>
                  </View>
                ))
              )}
              <View style={styles.sumRow}>
                <Text style={styles.sumLabel}>Montant HT</Text>
                <Text style={styles.sumValue}>{formatMoney(order.ht)}</Text>
              </View>
              <View style={styles.sumRow}>
                <Text style={styles.sumLabel}>TVA 18%</Text>
                <Text style={styles.sumValue}>{formatMoney(order.tva)}</Text>
              </View>
              <View style={styles.sumRow}>
                <Text style={styles.sumLabel}>TDT 2.5% (sur véhicules)</Text>
                <Text style={styles.sumValue}>{formatMoney(order.tdt)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Montant TTC</Text>
                <Text style={styles.totalValue}>{formatMoney(order.ttc)}</Text>
              </View>
            </View>
<View style={styles.card}>
              <Text style={styles.sectionTitle}>VOS INFORMATIONS</Text>
              <Text style={styles.formLabel}>Nom complet</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
                placeholder="Votre nom"
                placeholderTextColor="#94a3b8"
              />
              <Text style={styles.formLabel}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(t) => setForm((f) => ({ ...f, phone: t }))}
                placeholder="07 00 00 00 00"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
              />
              {isMobile && (
                <>
                  <Text style={styles.formLabel}>Numéro {selected?.label}</Text>
                  <TextInput
                    style={styles.input}
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    placeholder="07 00 00 00 00"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                  />
                </>
              )}
              {isEspeces && <Text style={styles.especesNote}>Merci de venir régler en espèces à notre agence. Un message de confirmation vous sera envoyé.</Text>}

              {method === 'carte' && (
                <>
                  <Text style={styles.cardSectionTitle}>Informations de la carte</Text>
                  <Text style={styles.cardSecureNote}>Paiement sécurisé via Genius Pay — vos données sont chiffrées.</Text>

                  <Text style={styles.formLabel}>Numéro de carte</Text>
                  <TextInput
                    style={styles.input}
                    value={form.cardNumber}
                    onChangeText={(t) => setForm((f) => ({ ...f, cardNumber: formatCardNumber(t) }))}
                    placeholder="4242 4242 4242 4242"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    maxLength={19}
                  />

                  <View style={styles.cardRow}>
                    <TextInput
                      style={[styles.input, styles.cardField]}
                      value={form.cardExpiry}
                      onChangeText={(t) => setForm((f) => ({ ...f, cardExpiry: formatCardExpiry(t) }))}
                      placeholder="MM/AA"
                      placeholderTextColor="#94a3b8"
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                    <TextInput
                      style={[styles.input, styles.cardField]}
                      value={form.cardCvc}
                      onChangeText={(t) => setForm((f) => ({ ...f, cardCvc: formatCardCvc(t) }))}
                      placeholder="CVC"
                      placeholderTextColor="#94a3b8"
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                  </View>

                  <Text style={styles.formLabel}>Titulaire de la carte</Text>
                  <TextInput
                    style={styles.input}
                    value={form.cardHolder}
                    onChangeText={(t) => setForm((f) => ({ ...f, cardHolder: t }))}
                    placeholder="Nom du titulaire"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="words"
                  />
                </>
              )}

              {paymentNote && !confirmed && <Text style={styles.notice}>{paymentNote}</Text>}
            </View>

            {/* Mode de paiement */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Mode de paiement</Text>
              {PAYMENT_METHODS.map((m) => {
                const active = method === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.methodRow, active && styles.methodRowActive]}
                    onPress={() => setMethod(m.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.methodIcon, active && styles.methodIconActive]}>
                      {m.logo ? (
                        <Image
                          source={{ uri: `${LOGO_BASE}${m.logo}` }}
                          style={styles.methodLogo}
                          resizeMode="contain"
                        />
                      ) : (
                        <Ionicons name={m.icon as keyof typeof Ionicons.glyphMap} size={18} color={active ? '#15803d' : '#64748b'} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.methodLabel, active && styles.methodLabelActive]}>{m.label}</Text>
                      <Text style={styles.methodHint}>{m.hint}</Text>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={18} color="#15803d" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, sending && { opacity: 0.6 }]}
              onPress={submitOrder}
              disabled={sending}
              activeOpacity={0.85}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="receipt-outline" size={18} color="#ffffff" />
                  <Text style={styles.submitBtnText}>
                    {isEspeces ? 'Confirmer la commande (espèces)' : 'Payer et confirmer'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <View style={{ height: 24 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 },
  backText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginTop: 12 },
  emptyDesc: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 18, marginTop: 6 },
  headerCard: {
    backgroundColor: '#071f11',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#154a27',
  },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  headerRef: { color: '#86efac', fontSize: 12, fontWeight: '700', marginTop: 2 },
  headerSubtitle: { color: '#cbd5e1', fontSize: 12, marginTop: 4, lineHeight: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#64748b', letterSpacing: 0.5, marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemName: { fontSize: 12, color: '#334155', flex: 1 },
  itemQty: { fontSize: 12, color: '#334155', fontWeight: '700' },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  sumLabel: { fontSize: 13, color: '#64748b' },
  sumValue: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  totalValue: { fontSize: 18, fontWeight: '900', color: colors.primary },
  formLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  cardSectionTitle: { fontSize: 13, fontWeight: '800', color: '#0f172a', marginTop: 16 },
  cardSecureNote: { fontSize: 11, color: '#64748b', marginBottom: 4 },
  cardRow: { flexDirection: 'row', gap: 10 },
  cardField: { flex: 1 },
especesNote: {
    fontSize: 11,
    color: '#b45309',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    lineHeight: 16,
  },
  notice: {
    fontSize: 11,
    color: '#b45309',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    lineHeight: 16,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 8,
  },
  methodRowActive: { borderColor: colors.primary, borderWidth: 1.5, backgroundColor: '#f0fdf4' },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  methodIconActive: { borderColor: colors.primary, borderWidth: 1.5 },
  methodLogo: { width: 34, height: 34 },
  methodLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  methodLabelActive: { color: colors.primaryDark, fontWeight: '800' },
  methodHint: { fontSize: 11, color: '#64748b', marginTop: 2 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primaryDark,
    borderRadius: 14,
    paddingVertical: 15,
  },
  submitBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  confirmedWrap: { flex: 1, alignItems: 'center', paddingHorizontal: 24 },
  confirmedIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  confirmedTitle: { color: '#0f172a', fontSize: 22, fontWeight: '900', marginTop: 16 },
  confirmedSubtitle: { color: '#334155', fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 8 },
  confirmedInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  confirmedRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  confirmedLabel: { fontSize: 13, color: '#64748b' },
  confirmedValue: { fontSize: 13, fontWeight: '800', color: colors.primaryDark },
  confirmedNote: { fontSize: 13, color: '#334155', textAlign: 'center', lineHeight: 20, marginTop: 14 },
  confirmedBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  confirmedBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
});