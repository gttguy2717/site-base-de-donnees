import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { api, getToken } from '../api/client';
import { colors, spacing, radius, typography, shadows, API_URL } from '../theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, client, logout, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(client?.prenom || '');
  const [lastName, setLastName] = useState(client?.nom || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.telephone || '');
  const [address, setAddress] = useState(client?.adresse || '');
  const [companyName, setCompanyName] = useState(client?.entreprise?.nom || '');
  const [responsibleName, setResponsibleName] = useState(client?.entreprise?.nom_responsable || '');
  const [identificationNumber, setIdentificationNumber] = useState(client?.entreprise?.numero_identification || '');

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const uri = result.assets[0].uri;
    const token = await getToken();
    const formData = new FormData();
    formData.append('avatar', {
      uri,
      name: `avatar-${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as any);

    try {
      const res = await fetch(`${API_URL}/auth/me/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        await refreshProfile();
        Alert.alert('Succès', 'Photo de profil mise à jour.');
      } else {
        Alert.alert('Erreur', 'Impossible de mettre à jour la photo.');
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/me', {
        firstName,
        lastName,
        email,
        phone,
        address,
        companyName,
        responsibleName,
        identificationNumber,
      });
      await refreshProfile();
      setEditing(false);
      Alert.alert('Succès', 'Vos informations ont été mises à jour.');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Impossible de mettre à jour vos informations.');
    } finally {
      setSaving(false);
    }
  };

  const displayName =
    user?.role === 'ADMIN' || user?.role === 'MANAGER'
      ? user.email?.split('@')[0] || 'Administrateur'
      : client?.prenom && client?.nom
        ? `${client.prenom} ${client.nom}`
        : client?.entreprise?.nom || user?.email?.split('@')[0] || 'Client';

  const typeLabel =
    user?.role === 'ADMIN'
      ? 'Administrateur'
      : user?.role === 'MANAGER'
        ? 'Manager'
        : client?.type_client === 'ENTREPRISE' || client?.type_client === 'ENTREPRISE_CLIENT'
          ? 'Entreprise'
          : client?.type_client === 'PARTICULIER'
            ? 'Particulier'
            : 'Client';

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <ScrollView style={[styles.flex, { paddingTop: insets.top }]} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mon profil</Text>
        {!isAdmin && (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => {
              if (editing) {
                handleSave();
              } else {
                setEditing(true);
              }
            }}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.editBtnText}>{editing ? 'Enregistrer' : 'Modifier'}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Carte profil */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.avatarCircle} onPress={pickAvatar}>
          {user?.avatar_url ? (
            <Image source={{ uri: `${API_URL.replace('/api', '')}${user.avatar_url}` }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{(displayName || 'S').charAt(0).toUpperCase()}</Text>
          )}
          <View style={styles.avatarEditBadge}>
            <Ionicons name="camera" size={14} color={colors.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{displayName}</Text>
        <View style={[styles.typeBadge, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={styles.typeBadgeText}>{typeLabel}</Text>
        </View>
        {user?.email && <Text style={styles.email}>{user.email}</Text>}
        {user?.telephone && <Text style={styles.phone}>{user.telephone}</Text>}
      </View>

      {/* Formulaire de modification */}
      {editing && !isAdmin ? (
        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>Informations personnelles</Text>
          <Text style={styles.inputLabel}>Prénom</Text>
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Votre prénom" placeholderTextColor={colors.textMuted} />
          <Text style={styles.inputLabel}>Nom</Text>
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Votre nom" placeholderTextColor={colors.textMuted} />
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@exemple.com" placeholderTextColor={colors.textMuted} autoCapitalize="none" keyboardType="email-address" />
          <Text style={styles.inputLabel}>Téléphone</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="00225..." placeholderTextColor={colors.textMuted} keyboardType="phone-pad" />
          <Text style={styles.inputLabel}>Adresse</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Votre adresse" placeholderTextColor={colors.textMuted} />

          {client?.type_client === 'ENTREPRISE' || client?.type_client === 'ENTREPRISE_CLIENT' ? (
            <>
              <Text style={styles.sectionLabel}>Entreprise</Text>
              <Text style={styles.inputLabel}>Nom de l'entreprise</Text>
              <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} placeholder="Nom de l'entreprise" placeholderTextColor={colors.textMuted} />
              <Text style={styles.inputLabel}>Responsable</Text>
              <TextInput style={styles.input} value={responsibleName} onChangeText={setResponsibleName} placeholder="Nom du responsable" placeholderTextColor={colors.textMuted} />
              <Text style={styles.inputLabel}>Numéro d'identification</Text>
              <TextInput style={styles.input} value={identificationNumber} onChangeText={setIdentificationNumber} placeholder="RCCM/CC" placeholderTextColor={colors.textMuted} />
            </>
          ) : null}

          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Informations client (lecture seule) */}
      {!editing && client?.entreprise?.nom && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionLabel}>Entreprise</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoValue}>{client.entreprise.nom}</Text>
            {client.entreprise.nom_responsable && (
              <Text style={styles.infoSub}>Responsable : {client.entreprise.nom_responsable}</Text>
            )}
            {client.entreprise.numero_identification && (
              <Text style={styles.infoSub}>RCCM : {client.entreprise.numero_identification}</Text>
            )}
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.actionText, { color: colors.error }]}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>SOUTARAH GROUP Mobile · v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 48 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  title: { ...typography.h1, color: colors.text },
  editBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minWidth: 90,
    alignItems: 'center',
  },
  editBtnText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarText: { fontSize: 36, fontWeight: '900', color: colors.white },
  name: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center' },
  typeBadge: { marginTop: spacing.sm, borderRadius: radius.round, paddingHorizontal: spacing.lg, paddingVertical: 6 },
  typeBadgeText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  email: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.md },
  phone: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.xl,
    ...shadows.sm,
  },
  sectionLabel: { ...typography.label, color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  inputLabel: { ...typography.label, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
  },
  formActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: { color: colors.textSecondary, fontWeight: '700' },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: colors.white, fontWeight: '700' },
  infoSection: { marginTop: spacing.xl },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  infoValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  infoSub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  actionsSection: { marginTop: spacing.xl },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  actionText: { fontSize: 15, fontWeight: '700' },
  version: { marginTop: spacing.xl, textAlign: 'center', color: colors.textMuted, fontSize: 12 },
});