import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Vehicle, Reservation } from '../types';
import { colors, spacing, radius, typography, shadows } from '../theme';

const DESTINATIONS = ['Abidjan', 'Intérieur'];
const COLORS = ['Noir', 'Blanc'];

function formatDateFR(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export default function ReservationScreen({ route, navigation }: { route: any; navigation: any }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { vehicleId } = route.params;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(true);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 86400000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [destination, setDestination] = useState('Abidjan');
  const [vehicleColor, setVehicleColor] = useState('Noir');
  const [withDriver, setWithDriver] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ vehicles: Vehicle[] }>('/vehicles');
        const found = data.vehicles?.find((v) => v.id === vehicleId);
        setVehicle(found || null);
      } catch {
        setVehicle(null);
      } finally {
        setLoadingVehicle(false);
      }
    })();
  }, [vehicleId]);

  const handleSubmit = async () => {
    if (startDate >= endDate) {
      Alert.alert('Dates invalides', 'La date de fin doit être après la date de début.');
      return;
    }

    setSubmitting(true);
    try {
      // Créer une demande de devis comme sur le site web
      const data = await api.post<{ quoteRequest: any }>('/quote-requests', {
        service: 'Location de véhicules',
        title: `${vehicle?.marque} ${vehicle?.modele} - ${formatDateFR(startDate)} au ${formatDateFR(endDate)}`,
        budget: String(vehicle?.prix_journalier_particulier || 0),
        timeline: `${Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000)} jour(s)`,
        description: [
          `Véhicule : ${vehicle?.marque} ${vehicle?.modele}`,
          `Catégorie : ${vehicle?.categorie}`,
          `Date début : ${formatDateFR(startDate)}`,
          `Date fin : ${formatDateFR(endDate)}`,
          `Destination : ${destination}`,
          `Couleur : ${vehicleColor}`,
          `Chauffeur : ${withDriver ? 'Oui' : 'Non'}`,
          notes ? `Notes : ${notes}` : '',
        ].filter(Boolean).join(' | '),
        name: user?.email?.split('@')[0] || 'Client',
        email: user?.email || '',
        phone: user?.telephone || '',
        location: destination,
      });

      Alert.alert(
        'Demande de devis envoyée',
        `Votre demande de devis ${data.quoteRequest.reference} a été enregistrée. L'administrateur vous enverra le devis signé.`,
        [{ text: 'OK', onPress: () => navigation?.navigate('Main', { screen: 'Reservations' }) }]
      );
    } catch (e: any) {
      const msg = e?.message || 'Erreur lors de la demande.';
      Alert.alert('Demande impossible', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingVehicle) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Véhicule introuvable</Text>
        <Button title="Retour" onPress={() => navigation?.goBack()} style={styles.backBtn} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + 32 }}>
      <TouchableOpacity style={styles.backRow} onPress={() => navigation?.goBack()}>
        <Ionicons name="arrow-back" size={20} color={colors.primary} />
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Réserver</Text>
      <View style={styles.vehicleCard}>
        <Text style={styles.vehicleName}>{vehicle.marque} {vehicle.modele}</Text>
        <Text style={styles.vehicleInfo}>{vehicle.categorie} · {vehicle.places} places · {vehicle.transmission}</Text>
      </View>

      {/* Date de début */}
      <Text style={styles.label}>Date de début (jj/mm/aaaa) *</Text>
      <TouchableOpacity style={styles.dateField} onPress={() => setShowStartPicker(true)}>
        <Ionicons name="calendar" size={20} color={colors.primary} />
        <Text style={styles.dateText}>{formatDateFR(startDate)}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
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

      {/* Date de fin */}
      <Text style={styles.label}>Date de fin (jj/mm/aaaa) *</Text>
      <TouchableOpacity style={styles.dateField} onPress={() => setShowEndPicker(true)}>
        <Ionicons name="calendar" size={20} color={colors.primary} />
        <Text style={styles.dateText}>{formatDateFR(endDate)}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
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

      {/* Destination */}
      <Text style={styles.label}>Destination *</Text>
      <View style={styles.destinationRow}>
        {DESTINATIONS.map((dest) => (
          <TouchableOpacity
            key={dest}
            style={[styles.destinationChip, destination === dest && styles.destinationChipActive]}
            onPress={() => setDestination(dest)}
          >
            <Text style={[styles.destinationText, destination === dest && styles.destinationTextActive]}>{dest}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Couleur du véhicule (sauf utilitaires) */}
      {vehicle.categorie !== 'Utilitaires' && (
        <>
          <Text style={styles.label}>Couleur du véhicule</Text>
          <View style={styles.destinationRow}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.destinationChip, vehicleColor === color && styles.destinationChipActive]}
                onPress={() => setVehicleColor(color)}
              >
                <Text style={[styles.destinationText, vehicleColor === color && styles.destinationTextActive]}>{color}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Chauffeur */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchLabel}>Avec chauffeur</Text>
          <Text style={styles.switchHint}>Un conducteur professionnel accompagné</Text>
        </View>
        <Switch
          value={withDriver}
          onValueChange={setWithDriver}
          trackColor={{ false: '#d1d5db', true: colors.primaryLight }}
          thumbColor={withDriver ? colors.primary : '#f4f4f5'}
        />
      </View>

      {/* Notes */}
      <Text style={styles.label}>Notes complémentaires</Text>
      <TouchableOpacity
        style={[styles.input, styles.notesInput]}
        onPress={() => Alert.prompt('Notes', 'Informations complémentaires', (text) => setNotes(text), 'plain-text', notes)}
      >
        <Text style={notes ? styles.notesText : styles.notesPlaceholder}>
          {notes || 'Ajouter des informations...'}
        </Text>
      </TouchableOpacity>

      <Button
        title={submitting ? 'Envoi en cours...' : 'Confirmer la réservation'}
        onPress={handleSubmit}
        loading={submitting}
        style={styles.submitBtn}
        size="lg"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  notFound: { fontSize: 18, color: colors.textSecondary, marginBottom: spacing.lg },
  backBtn: { alignSelf: 'center' },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  backText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.lg },
  vehicleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  vehicleName: { fontSize: 18, fontWeight: '800', color: colors.text },
  vehicleInfo: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  label: { ...typography.label, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text },
  destinationRow: { flexDirection: 'row', gap: spacing.sm },
  destinationChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  destinationChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  destinationText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  destinationTextActive: { color: colors.white },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg },
  switchLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  switchHint: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    backgroundColor: colors.surface,
  },
  notesInput: { minHeight: 80, justifyContent: 'flex-start' },
  notesText: { fontSize: 15, color: colors.text },
  notesPlaceholder: { fontSize: 15, color: colors.textMuted },
  submitBtn: { marginTop: spacing.xxl },
});