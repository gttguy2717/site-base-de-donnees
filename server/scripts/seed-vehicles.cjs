const { sequelize } = require('../src/models/index.cjs');
const { Op } = require('sequelize');

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PARC DE VÉHICULES — IDENTIQUE À LA BASE EN LIGNE (soutarahgroup.com)
 *  Liste officielle des 21 véhicules actifs de la base MySQL en ligne.
 *  Champs récupérés depuis GET https://soutarahgroup.com/api/vehicles :
 *  marque, modèle, catégorie, description, image, places, transmission,
 *  prix_journalier_particulier (== prix_journalier_entreprise)
 * ─────────────────────────────────────────────────────────────────────────────
 */
const RENTAL_VEHICLES = [
  // Économiques
  { category: 'Économiques', name: 'Renault Duster', pricePerDay: 30000, image: '/img/vehicles/dusterAvant.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Économiques', name: 'Suzuki Dzire', pricePerDay: 25000, image: '/img/vehicles/dzer.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Économiques', name: 'Suzuki Fronx', pricePerDay: 30000, image: '/img/vehicles/fronxav.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  // SUV
  { category: 'SUV', name: 'Renault Koleos', pricePerDay: 40500, image: '/img/vehicles/koleosAv.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Nissan Kicks', pricePerDay: 40500, image: '/img/vehicles/KickAvant.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Suzuki Grand Vitara 932', pricePerDay: 40501, image: '/img/vehicles/gvitaraAv.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Renault Kadjar', pricePerDay: 40541, image: '/img/vehicles/kadjaravant.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Suzuki Vitara Rouge', pricePerDay: 35000, image: '/img/vehicles/vitaraAvant.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  // 4x4
  { category: '4x4', name: 'Mitsubishi Pajero 13', pricePerDay: 55000, image: '/img/vehicles/pajeroav.jpeg', specs: ['7 personnes', 'Automatique', 'Assurée'] },
  { category: '4x4', name: 'Toyota Highlander', pricePerDay: 55000, image: '/img/vehicles/high.jpeg', specs: ['7 personnes', 'Automatique', 'Assurée'] },
  { category: '4x4', name: 'Toyota Rush', pricePerDay: 50000, image: '/img/vehicles/rushavant.jpeg', specs: ['7 personnes', 'Automatique', 'Assurée'] },
  // Pick-Up
  { category: 'Pick-Up', name: 'Renault OROCH', pricePerDay: 30000, image: '/img/vehicles/orochav.jpeg', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Pick-Up', name: 'Mitsubishi L200', pricePerDay: 51000, image: '/img/vehicles/l200av.jpg', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Pick-Up', name: 'Toyota Tacoma', pricePerDay: 50000, image: '/img/vehicles/tacomaav.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  // Utilitaires
  { category: 'Utilitaires', name: 'Citroën Jumper', pricePerDay: 30000, image: '/img/vehicles/jumperav.jpeg', specs: ['3 places assises', 'Automatique', 'Assurée'] },
  { category: 'Utilitaires', name: 'Renault Dokker', pricePerDay: 30000, image: '/img/vehicles/dokker.jpg', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Utilitaires', name: 'Ford Transit', pricePerDay: 40000, image: '/img/vehicles/ford1.jpg', specs: ['10 places assises', 'Manuel', 'Assurée'] },
  { category: 'Utilitaires', name: 'Renault Van Express', pricePerDay: 30000, image: '/img/vehicles/express1.jpeg', specs: ['2 places assises', 'Manuel', 'Assurée'] },
  // Minibus / Autocar / Luxe
  { category: 'Minibus', name: 'Nissan Urvan', pricePerDay: 70000, image: '/img/vehicles/urvan1.jpeg', specs: ['15 places assises', 'Automatique', 'Assurée'] },
  { category: 'Luxe', name: 'Toyota Land Cruiser', pricePerDay: 190000, image: '/img/vehicles/l300.jpeg', specs: ['7 personnes', 'Automatique', 'Assurée'] },
  { category: 'Autocar', name: 'Volvo 9700', pricePerDay: 220000, image: '/img/vehicles/h1ec.jpg', specs: ['55 places assises', 'Manuel', 'Avec chauffeur'] },
];

async function seedVehicles() {
  try {
    console.log('🚗 Synchronisation du parc (21 véhicules de la base en ligne)...');

    // Connexion à la base de données (MySQL via Sequelize)
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    const { Vehicle } = require('../src/models/index.cjs');

    // ── Étape 1 : désactiver TOUS les véhicules (y compris les doublons) ──────
    // Pour garantir que seul le parc officiel reste visible (statut ACTIVE + dispo).
    const deactivated = await Vehicle.update(
      { disponibilite: false, statut: 'INACTIVE' },
      { where: { statut: { [Op.ne]: 'INACTIVE' } } }
    );
    console.log(`⏸ ${deactivated} véhicule(s) désactivé(s) (base remise à zéro)`);

    // ── Étape 2 : créer / réactiver les 21 véhicules officiels du parc en ligne ─
    let created = 0;
    let updated = 0;

    for (const vehicle of RENTAL_VEHICLES) {
      const nameParts = vehicle.name.split(' ');
      const marque = nameParts[0];
      const modele = nameParts.slice(1).join(' ') || marque;

      // Extraire le nombre de places
      const placesSpec = vehicle.specs.find((spec) => spec.includes('personnes') || spec.includes('places'));
      const places = placesSpec ? parseInt(placesSpec.match(/\d+/)?.[0] || '5') : 5;

      // Extraire carburant et transmission
      const carburant = vehicle.specs.find((spec) => ['Essence', 'Gazole', 'Hybride', 'Diesel'].includes(spec)) || 'Essence';
      const transmission = vehicle.specs.find((spec) => ['Automatique', 'Manuel'].includes(spec)) || 'Automatique';

      const existing = await Vehicle.findOne({ where: { marque, modele } });
      const data = {
        marque,
        modele,
        categorie: vehicle.category,
        description: vehicle.specs.join(' • '),
        image_url: vehicle.image,
        places,
        carburant,
        transmission,
        prix_journalier_particulier: vehicle.pricePerDay,
        prix_journalier_entreprise: vehicle.pricePerDay,
        disponibilite: true,
        statut: 'ACTIVE',
      };

      if (existing) {
        await existing.update(data);
        updated += 1;
      } else {
        await Vehicle.create(data);
        created += 1;
      }
      console.log(`  ✓ ${marque} ${modele} — ${vehicle.category} — ${vehicle.pricePerDay} FCFA/j`);
    }

    console.log(`\n✅ ${created} créé(s), ${updated} réactivé(s)/mis à jour, ${deactivated} désactivé(s).`);
    console.log(`   Total actif : ${RENTAL_VEHICLES.length} véhicules (identique à la base en ligne).`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du remplissage:', error);
    process.exit(1);
  }
}
seedVehicles();