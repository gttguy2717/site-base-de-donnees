const { OpenAI } = require('openai');
const { Op } = require('sequelize');
const environment = require('../config/environment.cjs');
const { Category, Product, Tariff, Vehicle, Reservation, QuoteRequest, Client } = require('../models/index.cjs');

// Configuration AI robuste
const aiConfig = environment.ai || {
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
};

function isLLMConfigured() {
  return Boolean((environment.ai && environment.ai.openaiApiKey) || process.env.OPENAI_API_KEY);
}

function getLLMConfig() {
  return {
    apiKey: process.env.OPENAI_API_KEY || aiConfig.openaiApiKey,
    baseUrl: process.env.OPENAI_BASE_URL || aiConfig.openaiBaseUrl || 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || aiConfig.openaiModel || 'gpt-4o-mini',
  };
}

// ===== Client OpenAI (compatible OpenAI / Groq / tout fournisseur OpenAI-compatible) =====
let openaiClient = null;
function getOpenAIClient() {
  if (!openaiClient) {
    const config = getLLMConfig();
    openaiClient = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }
  return openaiClient;
}

// ===== Analyse admin (déplacée ici pour éviter la dépendance circulaire) =====
async function getAdminAnalysis() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sequelizeCol = require('sequelize').col;
  const sequelizeFn = require('sequelize').fn;
  const sequelizeLiteral = require('sequelize').literal;

  const [clientsTotal, clientsNew, reservationsTotal, reservationsConfirmed, quotesTotal, quotesPending, productsLowStock] = await Promise.all([
    Client.count(),
    Client.count({ where: { cree_le: { [Op.gte]: thirtyDaysAgo } } }),
    Reservation.count(),
    Reservation.count({ where: { statut: 'CONFIRMED' } }),
    QuoteRequest.count(),
    QuoteRequest.count({ where: { statut: { [Op.in]: ['PENDING', 'ISSUED', 'CONTACTED'] } } }),
    Product.findAll({
      where: {
        statut: 'ACTIVE',
        stock: { [Op.lte]: sequelizeCol('seuil_alerte') },
      },
      attributes: ['id', 'nom', 'stock', 'seuil_alerte'],
      limit: 5,
    }),
  ]);

  const topVehicles = await Reservation.findAll({
    attributes: ['vehicule_id', [sequelizeFn('COUNT', sequelizeCol('id')), 'count']],
    where: { statut: 'CONFIRMED' },
    group: ['vehicule_id'],
    order: [[sequelizeLiteral('count'), 'DESC']],
    limit: 5,
    include: [{ model: Vehicle, as: 'vehicule', attributes: ['id', 'marque', 'modele', 'categorie', 'prix_journalier_particulier'] }],
  });

  // Statistiques détaillées des réservations par statut
  const reservationsByStatus = await Reservation.findAll({
    attributes: ['statut', [sequelizeFn('COUNT', sequelizeCol('id')), 'count']],
    group: ['statut'],
  });

  return {
    clients: { total: clientsTotal, nouveaux30j: clientsNew },
    reservations: { total: reservationsTotal, confirmees: reservationsConfirmed },
    reservationsParStatut: reservationsByStatus.map(r => ({ statut: r.statut, count: Number(r.get('count')) })),
    devis: { total: quotesTotal, enAttente: quotesPending },
    produitsRupture: productsLowStock.map(p => ({ nom: p.nom, stock: Number(p.stock), seuil: Number(p.seuil_alerte) })),
    vehiculesPlusReserves: topVehicles.map(r => ({
      vehicule: r.vehicule ? `${r.vehicule.marque} ${r.vehicule.modele}` : 'Véhicule',
      categorie: r.vehicule?.categorie || 'N/A',
      prix_journalier: r.vehicule ? Number(r.vehicule.prix_journalier_particulier) : 0,
      reservations: Number(r.get('count')),
    })),
  };
}

// ===== Récupération des données réelles de la base pour le contexte =====
async function buildCatalogContext(isAdmin = false) {
  const [products, vehicles, categories] = await Promise.all([
    Product.findAll({
      where: { statut: 'ACTIVE' },
      include: [
        { model: Category, as: 'categorie' },
        { model: Tariff, as: 'tarifs' },
      ],
      order: [['nom', 'ASC']],
      limit: 50,
    }),
    Vehicle.findAll({
      where: { statut: 'ACTIVE', disponibilite: true },
      order: [['categorie', 'ASC'], ['marque', 'ASC']],
      limit: 30,
    }),
    Category.findAll({ where: { est_actif: true }, order: [['nom', 'ASC']] }),
  ]);

  const productData = products.map(p => {
    const tarif = p.tarifs?.find(t => t.type_client === 'PARTICULIER') || p.tarifs?.[0];
    return {
      nom: p.nom,
      reference: p.reference,
      categorie: p.categorie?.nom || 'Négoce',
      unite: p.unite,
      stock: Number(p.stock),
      prix: Number(tarif?.prix || 0),
    };
  });

  const vehicleData = vehicles.map(v => ({
    marque: v.marque,
    modele: v.modele,
    categorie: v.categorie,
    places: v.places,
    carburant: v.carburant,
    transmission: v.transmission,
    prix_journalier: Number(v.prix_journalier_particulier),
  }));

  const categoryData = categories.map(c => c.nom);

  let adminContext = '';
  if (isAdmin) {
    try {
      const analysis = await getAdminAnalysis();
      adminContext = `\n\n=== DONNÉES COMMERCIALES RÉELLES (source: base de données MySQL) ===\n` +
        `- Clients : ${analysis.clients.total} total, +${analysis.clients.nouveaux30j} nouveaux ce mois\n` +
        `- Devis : ${analysis.devis.total} total, ${analysis.devis.enAttente} en attente\n` +
        `- Réservations : ${analysis.reservations.total} total, ${analysis.reservations.confirmees} confirmées\n` +
        (analysis.reservationsParStatut.length > 0
          ? `- Répartition par statut : ${analysis.reservationsParStatut.map(r => `${r.statut} (${r.count})`).join(', ')}\n`
          : '') +
        (analysis.vehiculesPlusReserves.length > 0
          ? `- 🚗 VÉHICULES LES PLUS RÉSERVÉS (classement) :\n${analysis.vehiculesPlusReserves.map((v, i) => `  ${i + 1}. ${v.vehicule} (${v.categorie}) - ${v.reservations} réservation(s) - ${v.prix_journalier.toLocaleString('fr-FR')} FCFA/jour`).join('\n')}\n`
          : '- Aucune réservation confirmée pour le moment\n') +
        (analysis.produitsRupture.length > 0
          ? `- Produits proches de rupture : ${analysis.produitsRupture.map(p => `${p.nom} (stock: ${p.stock})`).join(', ')}`
          : '- Aucun produit en rupture de stock');
    } catch (e) {
      console.error('[llm-service] Erreur analyse admin:', e.message);
    }
  }

  return {
    products: productData,
    vehicles: vehicleData,
    categories: categoryData,
    adminContext,
  };
}

// ===== Construction du prompt système =====
function buildSystemPrompt(context, isAdmin) {
  return `Tu es "Assistant SOUTARAH", un assistant IA professionnel pour le site web de SOUTARAH GROUP (Côte d'Ivoire).
SOUTARAH GROUP est une société multi-services basée à Abidjan qui propose :
- Location de véhicules avec ou sans chauffeur (citadines, SUV, 4x4, utilitaires, minibus, autocars)
- Négoce / Import-Export (quincaillerie, plomberie, matériaux de construction, fournitures)
- Services techniques (installation, maintenance, entretien)
- Énergies renouvelables (solutions solaires)
- Agropastorale
- Immobilier

RÈGLES STRICTES :
1. Utilise UNIQUEMENT les données réelles fournies ci-dessous pour parler des produits, véhicules, prix et stocks. N'invente JAMAIS un prix, un stock ou un produit qui n'est pas dans la liste.
2. Si le client demande quelque chose qui n'est pas dans le catalogue, dis-lui honnêtement que ce produit n'est pas disponible et propose les alternatives les plus proches dans la liste.
3. Réponds en français, de manière professionnelle, chaleureuse et concise.
4. Formate ta réponse avec des emojis et des retours à la ligne pour la lisibilité.
5. Pour chaque recommandation de produit ou véhicule, précise le prix réel et le stock disponible.
6. Si tu détectes une demande de devis, propose les étapes pour obtenir un devis.

${isAdmin ? `INSTRUCTIONS ADMIN (IMPORTANT) :
Tu as accès aux données commerciales RÉELLES de SOUTARAH GROUP dans la section "DONNÉES COMMERCIALES RÉELLES" ci-dessous.
- Quand un admin te demande des statistiques (ex: "Quels véhicules ont été les plus réservés ?"), tu DOIS répondre avec les chiffres exacts fournis dans ces données.
- Ne dis JAMAIS "je n'ai pas accès aux statistiques" ou "contactez le service commercial". Tu as les données réelles.
- Présente les statistiques de manière claire avec des chiffres précis, des classements et des pourcentages si possible.
- Si les données sont vides (0 réservation), dis-le honnêtement et propose des recommandations.` : ''}

=== CATALOGUE DES PRODUITS (données réelles MySQL) ===
${JSON.stringify(context.products, null, 1)}

=== FLOTTE DE VÉHICULES (données réelles MySQL) ===
${JSON.stringify(context.vehicles, null, 1)}

=== CATÉGORIES DISPONIBLES ===
${context.categories.join(', ') || 'Aucune catégorie'}

${context.adminContext || ''}

Rappel : Ne dis JAMAIS "je n'ai pas accès au catalogue". Utilise les données ci-dessus comme source de vérité.`;
}

// ===== Appel au LLM =====
async function chatWithLLM({ message, history = [], isAdmin = false }) {
  const client = getOpenAIClient();
  const context = await buildCatalogContext(isAdmin);

  const messages = [
    { role: 'system', content: buildSystemPrompt(context, isAdmin) },
    ...((history || []).slice(-6)),
    { role: 'user', content: message },
  ];

  try {
    const config = getLLMConfig();
    const completion = await client.chat.completions.create({
      model: config.model,
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'Je n\'ai pas pu générer une réponse.';
  } catch (error) {
    console.error('[llm-service] Erreur appel OpenAI:', error.message);
    throw error;
  }
}

module.exports = { chatWithLLM, buildCatalogContext, getAdminAnalysis, isLLMConfigured };
