import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { Reservation } from '../types';
import { downloadSignedQuoteDocument, generateAndDownloadQuotePdf } from '../services/pdfService';
import { useAuth } from '../contexts/AuthContext';
import { colors, API_URL } from '../theme';

const formatMoney = (value: number | string | undefined | null): string => {
  const n = Number(value || 0);
  return n.toLocaleString('fr-FR') + ' FCFA';
};

const formatDate = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateTimeFR = (iso?: string | null): string => {
  if (!iso) return '• ' + new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `• ${day}/${month}/${year} à ${hours}:${mins}`;
};

const getImageUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('file://')) {
    return url;
  }
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function MyReservationsScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { user, client } = useAuth();
  const [activeTab, setActiveTab] = useState<'QUOTES' | 'RESERVATIONS'>('QUOTES');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [resData, quoteReqData, quotesData, localQuotesRaw] = await Promise.all([
        api.get<{ reservations?: Reservation[] }>('/reservations/mine').catch(() => ({ reservations: [] })),
        api.get<{ quoteRequests?: any[] }>('/quote-requests/my').catch(() => ({ quoteRequests: [] })),
        api.get<{ quotes?: any[] }>('/quotes/my').catch(() => ({ quotes: [] })),
        AsyncStorage.getItem('@soutarah_my_quotes').catch(() => null),
      ]);
      
      const dbQuoteRequests = quoteReqData.quoteRequests || [];
      const dbQuotes = quotesData.quotes || [];
      const localQuotes = localQuotesRaw ? JSON.parse(localQuotesRaw) : [];
      
      // Normaliser et fusionner sans doublon par référence ou ID
      const combinedMap = new Map();
      [...localQuotes, ...dbQuoteRequests, ...dbQuotes].forEach(q => {
        const key = q.reference || q.id;
        if (key && !combinedMap.has(key)) {
          combinedMap.set(key, {
            id: q.id,
            reference: q.reference || key,
            service: q.service || q.titre || 'Devis Panier SOUTARAH',
            titre: q.titre || q.service || 'Devis Panier SOUTARAH',
            budget: q.budget || q.montant || 0,
            cree_le: q.cree_le || q.createdAt || new Date().toISOString(),
            statut: q.statut || q.status || 'PENDING',
            fichier_devis_url: q.fichier_devis_url || q.pdf_url || null,
            description: q.description || null,
          });
        }
      });

      setReservations(resData.reservations || []);
      setQuotes(Array.from(combinedMap.values()));
    } catch {
      setReservations([]);
      setQuotes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDownloadSigned = async (quoteOrRes: any) => {
    const docUrl = quoteOrRes.fichier_devis_url;
    if (!docUrl) return;

    setDownloadingId(quoteOrRes.id);
    const fileName = `Devis-Signe-${quoteOrRes.reference || Date.now()}.pdf`;
    await downloadSignedQuoteDocument(docUrl, fileName);
    setDownloadingId(null);
  };

  const handleDownloadClientPdf = async (item: any) => {
    setDownloadingId(item.id);
    // Construire le nom complet du client depuis les données auth
    const clientName = client?.entreprise?.nom
      || [client?.prenom, client?.nom].filter(Boolean).join(' ')
      || 'Client SOUTARAH';
    const clientPhone = user?.telephone || '+225 00 00 00 00 00';
    const clientAddress = client?.adresse || 'ABIDJAN';
    try {
      await generateAndDownloadQuotePdf({
        reference: item.reference || `DMD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        client: {
          name: clientName,
          companyName: client?.entreprise?.nom || undefined,
          phone: clientPhone,
          address: clientAddress,
        },
        items: [
          {
            title: item.service || item.titre || 'Devis Panier SOUTARAH',
            days: 1,
            quantity: 1,
            dailyPrice: Number(item.budget || item.montant || 0),
            total: Number(item.budget || item.montant || 0),
          },
        ],
        totalAmount: Number(item.budget || item.montant || 0),
      });
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de régénérer le PDF du devis.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    setQuotes(prev => prev.filter(q => q.id !== quoteId && q.reference !== quoteId));
    try {
      const savedQuotes = await AsyncStorage.getItem('@soutarah_my_quotes');
      if (savedQuotes) {
        const list = JSON.parse(savedQuotes);
        const updated = list.filter((q: any) => q.id !== quoteId && q.reference !== quoteId);
        await AsyncStorage.setItem('@soutarah_my_quotes', JSON.stringify(updated));
      }
    } catch {}
    api.delete(`/quotes/${quoteId}`).catch(() => {});
  };

  const handleShowDetails = (item: any) => {
    try {
      if (!item) return;
      const refStr = item.reference ? String(item.reference) : '—';
      const serviceStr = item.service || item.titre ? String(item.service || item.titre) : 'Devis Panier SOUTARAH';
      const budgetNum = Number(item.budget || item.montant || 0);
      const budgetStr = formatMoney(budgetNum);
      const dateStr = formatDateTimeFR(item.cree_le);
      const statusStr = item.fichier_devis_url ? 'Devis signé disponible (Confirmé)' : 'En attente de traitement par l\'admin';
      const descStr = item.description ? `Précisions : ${item.description}` : '';

      const msg = [
        `Référence : ${refStr}`,
        `Service / Objet : ${serviceStr}`,
        `Montant estimé : ${budgetStr}`,
        `Date de demande : ${dateStr}`,
        `Statut : ${statusStr}`,
        descStr,
      ].filter(Boolean).join('\n\n');

      Alert.alert('Détails de la demande', msg);
    } catch (e) {
      Alert.alert('Détails de la demande', 'Demande enregistrée.');
    }
  };

  const renderReservationItem = ({ item }: { item: Reservation }) => {
    const isOngoing = item.statut === 'CONFIRMED';
    const vehImg = getImageUrl(item.vehicule?.image_url);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardRef}>{item.reference || 'RÉSERVATION'}</Text>
            <Text style={styles.vehicleName}>
              {item.vehicule ? `${item.vehicule.marque} ${item.vehicule.modele}` : 'Véhicule'}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: isOngoing ? '#dcfce7' : '#fef3c7' }]}>
            <Text style={[styles.statusText, { color: isOngoing ? '#15803d' : '#b45309' }]}>
              {isOngoing ? 'Confirmée' : item.statut === 'PENDING' ? 'En attente' : item.statut}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          {vehImg ? (
            <Image source={{ uri: vehImg }} style={styles.vehThumb} resizeMode="cover" />
          ) : null}

          <View style={{ flex: 1, gap: 4 }}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={14} color="#64748b" />
              <Text style={styles.detailText}>
                Du {formatDate(item.commence_le)} au {formatDate(item.termine_le)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={14} color="#64748b" />
              <Text style={[styles.detailText, { fontWeight: '800', color: '#15803d' }]}>
                {formatMoney(item.montant_total)}
              </Text>
            </View>

            {item.avec_chauffeur ? (
              <View style={styles.detailRow}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#15803d" />
                <Text style={[styles.detailText, { color: '#15803d', fontWeight: '700' }]}>Chauffeur inclus</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  const renderQuoteItem = ({ item }: { item: any }) => {
    const hasSignedDoc = !!item.fichier_devis_url;
    const isConfirmed = hasSignedDoc || ['APPROVED', 'CONFIRMED'].includes((item.statut || '').toUpperCase());
    const isDownloading = downloadingId === item.id;
    const ref = item.reference || `DMD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return (
      <View style={styles.photo2Card}>
        {/* Meta Header */}
        <View style={styles.photo2TopRow}>
          <View style={styles.photo2BadgesGroup}>
            <View style={styles.refPill}>
              <Text style={styles.refPillText}>{ref}</Text>
            </View>

            <View style={[styles.statusPill, { backgroundColor: isConfirmed ? '#e6f4ea' : '#fef7e0' }]}>
              <Text style={[styles.statusPillText, { color: isConfirmed ? '#137333' : '#b06000' }]}>
                {isConfirmed ? 'Confirmé' : 'En attente'}
              </Text>
            </View>

            <Text style={styles.dateMetaText}>{formatDateTimeFR(item.cree_le)}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.photo2CardTitle}>Demande de devis ({ref})</Text>

        {/* Service */}
        <Text style={styles.photo2ServiceText}>
          Service concerné : <Text style={styles.greenServiceHighlight}>{item.service || item.titre || 'Devis Panier SOUTARAH'}</Text>
        </Text>

        {/* Item description */}
        {item.description ? (
          <Text style={styles.photo2ItemDesc}>{item.description}</Text>
        ) : null}

        {/* Actions Row Aligned at bottom */}
        <View style={styles.photo2BottomActionsRow}>
          <TouchableOpacity
            style={styles.blueDownloadBtn}
            onPress={() => (hasSignedDoc ? handleDownloadSigned(item) : handleDownloadClientPdf(item))}
            disabled={isDownloading}
            activeOpacity={0.8}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#1a73e8" />
            ) : (
              <>
                <Ionicons name="download-outline" size={12} color="#1a73e8" />
                <Text style={styles.blueDownloadBtnText}>
                  {hasSignedDoc ? 'Devis signé' : 'Télécharger'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.grayDetailsBtn}
            onPress={() => handleShowDetails(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.grayDetailsBtnText}>Détails</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.redDeleteBtn}
            onPress={() => handleDeleteQuote(item.id)}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={12} color="#c5221f" />
            <Text style={styles.redDeleteBtnText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      {/* Header Photo 2 Style */}
      <View style={styles.photo2HeaderContainer}>
        <View style={styles.photo2HeaderTopRow}>
          <Text style={styles.photo2HeaderTitle}>Mes devis ({quotes.length})</Text>
          <TouchableOpacity
            style={styles.photo2NewQuoteBtn}
            onPress={() => navigation.navigate('Vehicles')}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text style={styles.photo2NewQuoteBtnText}>Nouveau devis</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.photo2HeaderSubtitle}>
          Suivez le statut de toutes vos demandes de devis enregistrées chez SOUTARAH GROUP.
        </Text>
      </View>

      <FlatList
        data={quotes}
        keyExtractor={item => item.id}
        renderItem={renderQuoteItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>Aucun devis enregistré</Text>
              <Text style={styles.emptyDesc}>Validez votre panier pour recevoir un devis officiel.</Text>
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
  header: {
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
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 3,
    margin: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#071f11',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardRef: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  // Styles Photo 2 Exact Match
  photo2HeaderContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#f8fafc',
  },
  photo2HeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  photo2HeaderTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
  },
  photo2NewQuoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1b5e20',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 2,
  },
  photo2NewQuoteBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  photo2HeaderSubtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  photo2Card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  photo2TopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  photo2BadgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  refPill: {
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  refPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#137333',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  dateMetaText: {
    fontSize: 12,
    color: '#5f6368',
  },
  photo2BottomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  blueDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  blueDownloadBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1a73e8',
  },
  grayDetailsBtn: {
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  grayDetailsBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3c4043',
  },
  redDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fce8e6',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
  },
  redDeleteBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#c5221f',
  },
  photo2CardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  photo2ServiceText: {
    fontSize: 13,
    color: '#5f6368',
    marginBottom: 4,
  },
  greenServiceHighlight: {
    color: '#137333',
    fontWeight: '800',
  },
  photo2ItemDesc: {
    fontSize: 13,
    color: '#5f6368',
    marginTop: 2,
  },
  // --- Styles pour les cartes de réservations ---
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  vehThumb: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});