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
  Image,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { colors, API_URL } from '../theme';
import { ApiError } from '../api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LOGO = require('../../assets/logo-soutarah.png');

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Champs requis', 'Veuillez saisir votre email ou téléphone et votre mot de passe.');
      return;
    }
    setLoading(true);
    try {
      await login({ identifier: identifier.trim(), password });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Identifiants incorrects ou erreur réseau.';
      Alert.alert('Connexion impossible', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Glow & Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadgeContainer}>
            <View style={styles.logoBadge}>
              <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
            </View>
          </View>
          <Text style={styles.brandTitle}>SOUTARAH</Text>
          <Text style={styles.brandSubtitle}>Plateforme Commerciale & Location de Véhicules</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            Connexion
          </Text>
          <Text style={styles.formSubtitle}>
            Accédez à votre espace
          </Text>

          {/* Identifier Input */}
          <Text style={styles.inputLabel}>Email ou Numéro de téléphone</Text>
          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={18} color="#15803d" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Ex: client@soutarah.ci ou 0700000000"
              placeholderTextColor="#94a3b8"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <Text style={styles.inputLabel}>Mot de passe</Text>
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={18} color="#15803d" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="••••••••••••"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.8 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <Text style={styles.submitBtnText}>Connexion en cours...</Text>
            ) : (
              <>
                <Text style={styles.submitBtnText}>Se connecter</Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>

          {/* Create Account Link (for clients) */}
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation?.navigate('Register')}
            activeOpacity={0.7}
          >
            <Text style={styles.registerText}>
              Vous n'avez pas de compte ?{' '}
              <Text style={styles.registerTextBold}>Créer un compte</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#4ade80" />
          <Text style={styles.footerText}>Connexion sécurisée SSL • SOUTARAH GROUP</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#071f11',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadgeContainer: {
    marginBottom: 12,
    elevation: 8,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 2,
    borderColor: '#4ade80',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 3,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#a7f3d0',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Form Card
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  formSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 6,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#071f11',
    borderRadius: 14,
    height: 50,
    marginTop: 18,
    elevation: 3,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 4,
  },
  registerText: {
    fontSize: 13,
    color: '#64748b',
  },
  registerTextBold: {
    fontWeight: '800',
    color: '#15803d',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    fontSize: 11,
    color: '#86efac',
    fontWeight: '600',
  },
});