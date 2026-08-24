import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { Notification } from '../types';
import { colors, spacing, radius, typography, shadows } from '../theme';

const FILTERS = ['Toutes', 'Non lues', 'Réservations', 'Comptes', 'Paniers'];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('Toutes');

  const loadNotifications = useCallback(async () => {
    try {
      const data = await api.get<{ notifications: Notification[] }>('/notifications/my');
      setNotifications(data.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, est_lu: true } : n))
      );
    } catch {
      // Silencieux
    }
  };

  const getType = (type: string): string => {
    if (type === 'VEHICLE_REQUEST' || type === 'RESERVATION') return 'Réservations';
    if (type === 'NEW_ACCOUNT') return 'Comptes';
    if (type === 'CART_ITEM_ADDED') return 'Paniers';
    return 'Autres';
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'Toutes') return true;
    if (filter === 'Non lues') return !n.est_lu;
    return getType(n.type) === filter;
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getIcon = (type: string) => {
    if (type === 'VEHICLE_REQUEST' || type === 'RESERVATION') return 'car';
    if (type === 'QUOTE_APPROVED') return 'checkmark-circle';
    if (type === 'CART_ITEM_ADDED') return 'cart';
    if (type === 'NEW_ACCOUNT') return 'person-add';
    return 'notifications';
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const unread = !item.est_lu;
    return (
      <TouchableOpacity
        style={[styles.card, unread && styles.cardUnread]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconCircle, unread && styles.iconCircleUnread]}>
          <Ionicons name={getIcon(item.type) as any} size={18} color={unread ? colors.white : colors.primary} />
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, unread && styles.cardTitleUnread]}>{item.titre}</Text>
          <Text style={styles.cardMessage}>{item.message}</Text>
          <Text style={styles.cardDate}>{formatDate(item.cree_le)}</Text>
        </View>
        {unread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>{filteredNotifications.length} notification(s)</Text>
      </View>

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Aucune notification</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  filtersContainer: { marginBottom: spacing.md },
  filtersList: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.white },
  listContent: { padding: spacing.xl, gap: spacing.md, paddingBottom: 100, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleUnread: { backgroundColor: colors.primary },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardTitleUnread: { color: colors.primary },
  cardMessage: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  cardDate: { fontSize: 11, color: colors.textMuted, marginTop: spacing.sm },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { color: colors.textMuted, fontSize: 16, marginTop: spacing.md },
});