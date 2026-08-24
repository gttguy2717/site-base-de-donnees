const { chatWithLLM, isLLMConfigured } = require('../services/llm.service.cjs');

// ===== Génération de suggestions cliquables à partir de la réponse LLM =====
function extractSuggestions(message, isAdmin) {
  const suggestions = [];

  // Détecter si la réponse mentionne des véhicules
  if (/🚗|véhicule|voiture|SUV|4x4|pick-up|minibus|autocar|citadine/i.test(message)) {
    suggestions.push({
      type: 'action',
      title: 'Voir les véhicules',
      subtitle: 'Parcourir la flotte disponible',
      action: { label: 'Voir les véhicules', target: 'vehicules' },
    });
  }

  // Détecter si la réponse mentionne des produits / négoce
  if (/📦|produit|article|tuyau|ciment|PVC|quincaillerie/i.test(message)) {
    suggestions.push({
      type: 'action',
      title: 'Voir le catalogue',
      subtitle: 'Parcourir les produits de négoce',
      action: { label: 'Voir le catalogue', target: 'negoce' },
    });
  }

  // Détecter si la réponse mentionne un devis
  if (/devis|prix|tarif|coût/i.test(message)) {
    suggestions.push({
      type: 'action',
      title: 'Demander un devis',
      subtitle: 'Obtenir une proposition tarifaire',
      action: { label: 'Demander un devis', target: 'devis' },
    });
    suggestions.push({
      type: 'action',
      title: 'Voir mon panier',
      subtitle: 'Ajouter des articles et valider',
      action: { label: 'Voir le panier', target: 'cart' },
    });
  }

  // Pour les admins, ajouter une suggestion d'analyse
  if (isAdmin && /statistique|analyse|vente|client|réservation/i.test(message)) {
    suggestions.push({
      type: 'action',
      title: '📊 Voir le tableau de bord',
      subtitle: 'Consulter les statistiques complètes',
      action: { label: 'Voir le tableau de bord', target: 'dashboard' },
    });
  }

  return suggestions;
}

// ===== Contrôleur principal =====
async function chat(request, response, next) {
  try {
    const { message, history } = request.body;
    if (!message || !message.trim()) {
      return response.status(422).json({ error: { message: 'Veuillez saisir un message.' } });
    }

    const isAdmin = request.auth?.user?.role === 'ADMIN' || request.auth?.user?.role === 'MANAGER';

    // Si la clé API OpenAI n'est pas configurée, retourner un message clair
    if (!isLLMConfigured()) {
      return response.json({
        message: `⚠️ **L'assistant IA n'est pas encore configuré.**

Pour activer l'assistant, ajoutez votre clé API OpenAI dans le fichier **\`.env\`** du serveur :

\`\`\`
OPENAI_API_KEY=votre_cle_ici
OPENAI_MODEL=gpt-4o-mini
\`\`\`

En attendant, voici les informations que je peux vous fournir :`,
        suggestions: [
          { type: 'action', title: 'Voir les véhicules', subtitle: 'Parcourir la flotte de location', action: { label: 'Voir les véhicules', target: 'vehicules' } },
          { type: 'action', title: 'Voir le catalogue', subtitle: 'Parcourir les produits de négoce', action: { label: 'Voir le catalogue', target: 'negoce' } },
          { type: 'action', title: 'Demander un devis', subtitle: 'Obtenir une proposition tarifaire', action: { label: 'Demander un devis', target: 'devis' } },
        ],
      });
    }

    // Appeler le LLM avec les données réelles de la base en contexte
    try {
      const llmResponse = await chatWithLLM({
        message: message.trim(),
        history: Array.isArray(history) ? history : [],
        isAdmin,
      });

      const suggestions = extractSuggestions(llmResponse, isAdmin);

      return response.json({
        message: llmResponse,
        suggestions,
      });
    } catch (llmError) {
      console.error('[ai-assistant] Erreur LLM:', llmError.message);

      // Si l'erreur est due au manque de fonds ou à une clé invalide
      if (llmError.status === 401) {
        return response.json({
          message: '❌ **Clé API OpenAI invalide.** Vérifiez votre clé `OPENAI_API_KEY` dans le fichier `.env` du serveur.',
          suggestions: [],
        });
      }
      if (llmError.status === 429) {
        return response.json({
          message: '❌ **Limite de quota OpenAI atteinte.** Vérifiez votre solde API ou réessayez plus tard.',
          suggestions: [],
        });
      }

      return response.json({
        message: `❌ **Une erreur est survenue lors de l'appel à l'IA :**\n${llmError.message}\n\nVeuillez réessayer dans quelques instants.`,
        suggestions: [],
      });
    }
  } catch (error) {
    console.error('[ai-assistant] Erreur:', error.message);
    next(error);
  }
}

module.exports = { chat };