import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { colors } from '../theme';

// ─── Types ────────────────────────────────────────────────────────────────
interface Suggestion {
  type?: string;
  title: string;
  subtitle?: string;
  message?: string;
  action?: { label?: string; target?: string };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: Suggestion[];
}

interface ChatResponse {
  message: string;
  suggestions?: Suggestion[];
}

// Suggestions par défaut (client) — identiques au site web
const QUICK_ACTIONS: Suggestion[] = [
  { title: '🚗 Louer un véhicule', subtitle: 'Je cherche un SUV pour 5 personnes', message: 'Je cherche un véhicule pour transporter 6 personnes' },
  { title: '📦 Rechercher un produit', subtitle: 'Avez-vous des tuyaux PVC ?', message: 'Avez-vous des tuyaux PVC ?' },
  { title: '📋 Demander un devis', subtitle: 'Obtenir une proposition tarifaire', message: 'Je voudrais un devis' },
  { title: '🔧 Services techniques', subtitle: 'Voir nos prestations', message: 'Quels services proposez-vous ?' },
];

const ADMIN_ACTIONS: Suggestion[] = [
  { title: '📊 Analyse commerciale', subtitle: 'Produits les plus demandés', message: 'Quels sont les produits les plus demandés ce mois-ci ?' },
  { title: '🚗 Véhicules les plus réservés', subtitle: 'Statistiques réservations', message: 'Quels véhicules ont été les plus réservés ?' },
  { title: '⚠️ Produits en rupture', subtitle: 'Alertes stock', message: 'Quels produits sont proches de la rupture ?' },
];

// Correspondance entre les cibles d'action renvoyées par le backend et les tabs mobiles
const TARGET_TO_ROUTE: Record<string, string> = {
  vehicules: 'Vehicles',
  negoce: 'Vehicles',
  cart: 'Cart',
  devis: 'Reservations',
};

// Nettoie le markdown simple renvoyé par l'IA avant affichage
const cleanText = (s: string): string =>
  s.replace(/\*\*/g, '').replace(/```/g, '').replace(/^#{1,6}\s*/gm, '');

export default function AiAssistantScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const greeted = useRef(false);

  // Message d'accueil (une seule fois)
  useEffect(() => {
    if (greeted.current) return;
    greeted.current = true;
    setMessages([
      {
        role: 'assistant',
        content:
          `Bonjour ! 👋 Je suis l'assistant SOUTARAH.` +
          (isAdmin
            ? '\n\n📊 En tant qu\u2019administrateur, vous pouvez me demander des analyses commerciales (ex: « Quels sont les produits les plus demandés ? »).'
            : '') +
          `\n\nComment puis-je vous aider aujourd'hui ?`,
        suggestions: isAdmin ? ADMIN_ACTIONS : QUICK_ACTIONS,
      },
    ]);
  }, [isAdmin]);

  // Défilement automatique vers les derniers messages
  useEffect(() => {
    scrollRef.current?.scrollToEnd?.({ animated: true });
  }, [messages, isTyping]);

  const handleSend = async (override?: string) => {
    const message = (override ?? input).trim();
    if (!message || isTyping) return;

    const historyToSend = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');
    setIsTyping(true);

    try {
      const data = await api.post<ChatResponse>('/ai-assistant/chat', {
        message,
        history: historyToSend,
      });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message, suggestions: data.suggestions || [] },
      ]);
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Veuillez réessayer dans quelques instants.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ Impossible de contacter le serveur. ${detail}` },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestion = (s: Suggestion) => {
    // 1. Suggestion « message direct » (accueil / quick actions)
    if (s.message) {
      handleSend(s.message);
      return;
    }
    // 2. Suggestion d'action renvoyée par le backend
    const target = s.action?.target;
    if (target) {
      if (!isAdmin && TARGET_TO_ROUTE[target]) {
        try {
          navigation?.navigate?.(TARGET_TO_ROUTE[target]);
          return;
        } catch {
          // route inconnue : on ignore et on retombe sur l'envoi d'un message
        }
      }
      if (target === 'dashboard' && isAdmin) {
        try {
          navigation?.goBack?.();
          return;
        } catch {
          // ignore
        }
      }
    }
    handleSend(s.title || s.action?.label || '');
  };

  const goBack = () => {
    try {
      navigation?.goBack?.();
    } catch {
      // ignore
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 6, 12) }]}>
        <TouchableOpacity onPress={goBack} style={styles.headerBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerIconBox}>
          <Ionicons name="sparkles" size={20} color="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Assistant SOUTARAH
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            IA • Réponses basées sur nos données réelles
          </Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <View key={`msg-${idx}`} style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}>
              <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                <Text style={isUser ? styles.userText : styles.assistantText}>{cleanText(msg.content)}</Text>
              </View>
              {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                <View style={styles.suggestionWrap}>
                  {msg.suggestions.map((sg, si) => (
                    <TouchableOpacity
                      key={`sg-${idx}-${si}`}
                      style={styles.suggestionChip}
                      onPress={() => handleSuggestion(sg)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.suggestionTitle} numberOfLines={1}>
                        {sg.title}
                      </Text>
                      {!!sg.subtitle && (
                        <Text style={styles.suggestionSubtitle} numberOfLines={1}>
                          {sg.subtitle}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {isTyping && (
          <View style={styles.messageRow}>
            <View style={styles.bubble}>
              <Text style={styles.typingText}>{'●'.repeat(3)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom + 8, 12) }]}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Décrivez votre besoin..."
            placeholderTextColor="#9ca3af"
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
            editable={!isTyping}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || isTyping}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.inputHint}>
          L'assistant utilise les données réelles de la base SOUTARAH (véhicules, catalogue, statistiques).
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ─── Stylesheet ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f3f7f1',
  },
  header: {
    backgroundColor: '#143e22',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#12361f',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#296c00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#a7f3d0',
    fontSize: 10,
    marginTop: 2,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ade80',
    borderWidth: 1.5,
    borderColor: '#0d321d',
    marginLeft: 8,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },
  messageRow: {
    marginBottom: 10,
  },
  userRow: {
    alignItems: 'flex-end',
  },
  assistantRow: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopLeftRadius: 4,
  },
  userText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  assistantText: {
    color: '#1a1c1c',
    fontSize: 14,
    lineHeight: 20,
  },
  typingText: {
    color: '#94a3b8',
    fontSize: 15,
    letterSpacing: 2,
  },
  suggestionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  suggestionChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c8e8c9',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionTitle: {
    color: '#173d23',
    fontSize: 12,
    fontWeight: '700',
  },
  suggestionSubtitle: {
    color: '#6b7280',
    fontSize: 10,
    marginTop: 1,
  },
  inputBar: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: '#1a1c1c',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  inputHint: {
    marginTop: 5,
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
  },
});