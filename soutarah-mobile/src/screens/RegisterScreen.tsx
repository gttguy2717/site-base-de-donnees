import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, radius, typography, shadows } from '../theme';
import { ApiError } from '../api/client';

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const { register } = useAuth();
  const [customerType, setCustomerType] = useState<'PARTICULIER' | 'ENTREPRISE'>('PARTICULIER');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [identificationNumber, setIdentificationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isCompany = customerType === 'ENTREPRISE';

  const handleRegister = async () => {
    if (!email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Champs requis', 'Email, téléphone et mot de passe sont obligatoires.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Mot de passe trop court', 'Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mots de passe différents', 'Les deux mots de passe doivent être identiques.');
      return;
    }
    if (!isCompany && (!firstName.trim() || !lastName.trim())) {
      Alert.alert('Champs requis', 'Le nom et le prénom sont obligatoires pour un particulier.');
      return;
    }
    if (isCompany && !companyName.trim()) {
      Alert.alert('Champs requis', "Le nom de l'entreprise est obligatoire.");
      return;
    }

    setLoading(true);
    try {
      await register({
        customerType,
        email,
        phone,
        password,
        firstName,
        lastName,
        address,
        companyName,
        responsibleName,
        identificationNumber,
      });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Erreur lors de la création du compte.";
      Alert.alert('Inscription impossible', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez SOUTARAH GROUP</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>Type de compte</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, customerType === 'PARTICULIER' && styles.typeBtnActive]}
              onPress={() => setCustomerType('PARTICULIER')}
            >
              <Text style={[styles.typeText, customerType === 'PARTICULIER' && styles.typeTextActive]}>Particulier</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, customerType === 'ENTREPRISE' && styles.typeBtnActive]}
              onPress={() => setCustomerType('ENTREPRISE')}
            >
              <Text style={[styles.typeText, customerType === 'ENTREPRISE' && styles.typeTextActive]}>Entreprise</Text>
            </TouchableOpacity>
          </View>

          {isCompany ? (
            <>
              <Text style={styles.inputLabel}>Nom de l'entreprise *</Text>
              <TextInput style={styles.input} placeholder="SOUTARAH SARL" placeholderTextColor={colors.textMuted} value={companyName} onChangeText={setCompanyName} />

              <Text style={styles.inputLabel}>Nom du responsable</Text>
              <TextInput style={styles.input} placeholder="Nom et prénom" placeholderTextColor={colors.textMuted} value={responsibleName} onChangeText={setResponsibleName} />

              <Text style={styles.inputLabel}>Numéro d'identification (RCCM/CC)</Text>
              <TextInput style={styles.input} placeholder="RCCM-CI-..." placeholderTextColor={colors.textMuted} value={identificationNumber} onChangeText={setIdentificationNumber} />
            </>
          ) : (
            <>
              <Text style={styles.inputLabel}>Prénom *</Text>
              <TextInput style={styles.input} placeholder="Votre prénom" placeholderTextColor={colors.textMuted} value={firstName} onChangeText={setFirstName} />

              <Text style={styles.inputLabel}>Nom *</Text>
              <TextInput style={styles.input} placeholder="Votre nom" placeholderTextColor={colors.textMuted} value={lastName} onChangeText={setLastName} />
            </>
          )}

          <Text style={styles.inputLabel}>Email *</Text>
          <TextInput style={styles.input} placeholder="email@exemple.com" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} />

          <Text style={styles.inputLabel}>Téléphone *</Text>
          <TextInput style={styles.input} placeholder="00225..." placeholderTextColor={colors.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <Text style={styles.inputLabel}>Adresse</Text>
          <TextInput style={styles.input} placeholder="Votre adresse" placeholderTextColor={colors.textMuted} value={address} onChangeText={setAddress} />

          <Text style={styles.inputLabel}>Mot de passe *</Text>
          <TextInput style={styles.input} placeholder="Min. 8 caractères" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />

          <Text style={styles.inputLabel}>Confirmer le mot de passe *</Text>
          <TextInput style={styles.input} placeholder="Confirmez le mot de passe" placeholderTextColor={colors.textMuted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

          <Button title="Créer mon compte" onPress={handleRegister} loading={loading} style={styles.registerBtn} size="lg" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.darkGreen },
  container: {
    flexGrow: 1,
    backgroundColor: colors.darkGreen,
    padding: spacing.xl,
    paddingBottom: 48,
  },
  backBtn: { marginBottom: spacing.lg },
  backText: { color: colors.primaryLight, fontSize: 16, fontWeight: '600' },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontSize: 28, fontWeight: '900', color: colors.white, letterSpacing: 2 },
  subtitle: { marginTop: spacing.sm, fontSize: 14, color: colors.primaryLight, opacity: 0.9 },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  sectionLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  typeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeText: { fontWeight: '700', color: colors.textSecondary },
  typeTextActive: { color: colors.white },
  inputLabel: { ...typography.label, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
  },
  registerBtn: { marginTop: spacing.xl },
});