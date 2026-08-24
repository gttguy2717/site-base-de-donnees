import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const QUICK_ACTIONS = [
  { title: '🚗 Louer un véhicule', subtitle: 'Je cherche un SUV pour 5 personnes', message: 'Je cherche un véhicule pour transporter 6 personnes' },
  { title: '📦 Rechercher un produit', subtitle: 'Avez-vous des tuyaux PVC ?', message: 'Avez-vous des tuyaux PVC ?' },
  { title: '📋 Demander un devis', subtitle: 'Obtenir une proposition tarifaire', message: 'Je voudrais un devis' },
  { title: '🔧 Services techniques', subtitle: 'Voir nos prestations', message: 'Quels services proposez-vous ?' },
];

export default function AiAssistant({ navigateTo }) {
  const { token, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      if (!hasInteracted) {
        setMessages([{
          role: 'assistant',
          content: `Bonjour ! 👋 Je suis l'assistant SOUTARAH.${isAdmin ? '\n\n📊 En tant qu\'administrateur, vous pouvez me demander des analyses commerciales (ex: "Quels sont les produits les plus demandés ?").' : ''}\n\nComment puis-je vous aider aujourd'hui ?`,
          suggestions: isAdmin
            ? [
                { title: '📊 Analyse commerciale', subtitle: 'Produits les plus demandés', message: 'Quels sont les produits les plus demandés ce mois-ci ?' },
                { title: '🚗 Véhicules les plus réservés', subtitle: 'Statistiques réservations', message: 'Quels véhicules ont été les plus réservés ?' },
                { title: '⚠️ Produits en rupture', subtitle: 'Alertes stock', message: 'Quels produits sont proches de la rupture ?' },
              ]
            : QUICK_ACTIONS,
        }]);
        setHasInteracted(true);
      }
    }
  }, [isOpen, hasInteracted, isAdmin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    const message = (text || input).trim();
    if (!message) return;

    const historyToSend = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-6)
      .map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) || '' }));

    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/ai-assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message, history: historyToSend }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
          suggestions: data.suggestions || [],
        }]);
      } else {
        const error = await response.json().catch(() => ({}));
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ ${error.error?.message || 'Une erreur est survenue. Veuillez réessayer.'}`,
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Impossible de contacter le serveur. Vérifiez que le backend est démarré.',
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.action) {
      if (navigateTo) {
        const targetMap = {
          'vehicules': () => navigateTo('service', { slug: 'vehicules' }),
          'negoce': () => navigateTo('service', { slug: 'negoce' }),
          'energie': () => navigateTo('service', { slug: 'energie' }),
          'devis': () => navigateTo('contact'),
          'cart': () => navigateTo('cart'),
          'dashboard': () => navigateTo('admin', { tab: 'dashboard' }),
        };
        if (targetMap[suggestion.action.target]) {
          targetMap[suggestion.action.target]();
          setIsOpen(false);
        }
      }
      return;
    }
    handleSend(suggestion.message || suggestion.title);
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';
    return (
      <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-primary text-white rounded-br-md'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
        }`}>
          <div className="whitespace-pre-line">{msg.content}</div>
          {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
            <div className="mt-3 space-y-2">
              {msg.suggestions.map((suggestion, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                >
                  {suggestion.title}
                  {suggestion.subtitle && (
                    <span className="block text-[10px] font-normal text-gray-500 mt-0.5">{suggestion.subtitle}</span>
                  )}
                  {suggestion.price && (
                    <span className="block text-[10px] font-bold text-emerald-700 mt-0.5">{suggestion.price}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9998] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl shadow-primary/30 transition-all hover:scale-110 hover:bg-[#1b4c00] active:scale-95"
        title="Assistant SOUTARAH"
        aria-label="Assistant SOUTARAH"
      >
        {isOpen ? (
          <span className="material-symbols-outlined text-2xl">close</span>
        ) : (
          <span className="material-symbols-outlined text-2xl">smart_toy</span>
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500"></span>
          </span>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9999] flex h-[520px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-[#f8faf7] shadow-2xl shadow-black/20 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#173d23] to-green-700 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <span className="material-symbols-outlined text-white text-xl">smart_toy</span>
            </div>
            <div className="flex-1">
              <h3 className="font-display text-sm font-extrabold text-white">Assistant SOUTARAH</h3>
              <p className="text-[10px] text-emerald-100/80">IA • Réponses basées sur nos données réelles</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.map(renderMessage)}
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="rounded-2xl rounded-bl-md bg-white border border-gray-200 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Décrivez votre besoin..."
                className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition hover:bg-[#1b4c00] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Envoyer"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
            <p className="mt-2 text-center text-[9px] text-gray-400">
              L'assistant utilise les données réelles de la base SOUTARAH. Les prix et stocks proviennent du catalogue.
            </p>
          </div>
        </div>
      )}
    </>
  );
}