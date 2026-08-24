const { sequelize } = require('../src/models/index.cjs');

// Liste des véhicules exactement comme dans servicesData.js
const RENTAL_VEHICLES = [
  { category: 'Citadines', name: 'Renault Duster', plate: '1036KK01', pricePerDay: 30000, image: '/img/vehicles/dusterAvant.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Pick-Up', name: 'Renault OROCH', plate: '170LA01', pricePerDay: 30000, image: '/img/vehicles/orochav.jpeg', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Utilitaires', name: 'Citroën Jumper', plate: '1200LE01', pricePerDay: 30000, image: '/img/vehicles/jumperav.jpeg', specs: ['3 places assises', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Renault Koleos', plate: '1212JK01', pricePerDay: 40500, image: '/img/vehicles/koleosAv.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: '4x4', name: 'Mitsubishi Pajero 13', plate: '1398KV01', pricePerDay: 55000, image: '/img/vehicles/pajeroav.jpeg', specs: ['7 personnes', 'Automatique', 'Assurée'] },
  { category: '4x4', name: 'Mitsubishi Pajero 48', plate: '4847KH01', pricePerDay: 50000, image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80', specs: ['4 personnes', 'Automatique', 'Assurée'] },
  { category: 'Utilitaires', name: 'Renault Dokker', plate: '2397JU01', pricePerDay: 30000, image: '/img/vehicles/dokker.jpg', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Citadines', name: 'Suzuki Dzire', plate: '2546LK01', pricePerDay: 25000, image: '/img/vehicles/dzer.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Luxe', name: 'Toyota Land Cruiser', plate: '5852KT01', pricePerDay: 190000, image: '/img/vehicles/l300.jpeg', specs: ['7 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Nissan Kicks', plate: '7138JN01', pricePerDay: 40500, image: '/img/vehicles/KickAvant.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Suzuki Grand Vitara 932', plate: 'AA-932-AH', pricePerDay: 40501, image: '/img/vehicles/gvitaraAv.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Renault Kadjar', plate: '5231JF01', pricePerDay: 40541, image: '/img/vehicles/kadjaravant.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: '4x4', name: 'Mitsubishi Montero', plate: '515KR01', pricePerDay: 50000, image: '/img/vehicles/monteraav.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: '4x4', name: 'Toyota Highlander', plate: '2899JX01', pricePerDay: 55000, image: '/img/vehicles/high.jpeg', specs: ['7 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Suzuki Vitara Rouge', plate: '3010KC01', pricePerDay: 35000, image: '/img/vehicles/vitaraAvant.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: '4x4', name: 'Toyota Rush', plate: '20932WWCI01', pricePerDay: 50000, image: '/img/vehicles/rushavant.jpeg', specs: ['7 personnes', 'Automatique', 'Assurée'] },
  { category: 'Pick-Up', name: 'Toyota Tacoma', plate: '4562KT01', pricePerDay: 50000, image: '/img/vehicles/tacomaav.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Suzuki Grand Vitara 755', plate: 'AA-755AL', pricePerDay: 40541, image: '/img/vehicles/ngvitaraav.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Pick-Up', name: 'Mitsubishi L200', plate: '74 40 JT 01', pricePerDay: 51000, image: '/img/vehicles/l200av.jpg', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Utilitaires', name: 'Renault Van Express', plate: '1363LT01', pricePerDay: 30000, image: '/img/vehicles/express1.jpeg', specs: ['2 places assises', 'Manuel', 'Assurée'] },
  { category: 'Utilitaires', name: 'Ford Transit', plate: '147KS01', pricePerDay: 40000, image: '/img/vehicles/ford1.jpg', specs: ['10 places assises', 'Manuel', 'Assurée'] },
  { category: 'Minibus', name: 'Nissan Urvan', plate: 'AA-437-QB-01', pricePerDay: 70000, image: '/img/vehicles/urvan1.jpeg', specs: ['15 places assises', 'Automatique', 'Assurée'] },
  { category: 'Pick-Up', name: 'Isuzu D-Max', plate: 'AA-930-HS-01', pricePerDay: 55000, image: '/img/vehicles/dmaxav.png', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Citadines', name: 'Suzuki Fronx', plate: 'AA-670-EE', pricePerDay: 30000, image: '/img/vehicles/fronxav.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Citadines', name: 'Toyota Vitz', plate: '42748WWCI01', pricePerDay: 20700, image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Pick-Up', name: 'Isuzu D-Max New', plate: '11944WWCI01', pricePerDay: 55000, image: '/img/vehicles/dmaxav.png', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Pick-Up', name: 'Dongfeng Friday', plate: '38929WWCI01', pricePerDay: 60000, image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: '4x4', name: 'Toyota Rush 38', plate: '3815LG01', pricePerDay: 50000, image: '/img/vehicles/rushavant.jpeg', specs: ['7 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Suzuki Grand Vitara New', plate: '10333WWCI01', pricePerDay: 40541, image: '/img/vehicles/ngvitaraav.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Luxe', name: 'Toyota Fortuner', plate: '25650WWCI01', pricePerDay: 113739, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', specs: ['7 personnes', 'Automatique', 'Assurée'] },
  { category: 'Citadines', name: 'Nissan Micra', plate: '2513LG01', pricePerDay: 27820, image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Minibus', name: 'Ford Transit 9 Places', plate: 'Partenaire', pricePerDay: 70000, image: '/img/vehicles/ford1.jpg', specs: ['9 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Minibus', name: 'Toyota Hiace 15 Places', plate: 'Partenaire', pricePerDay: 90000, image: '/img/vehicles/h1ec.jpg', specs: ['15 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Autocar', name: 'Hyundai 20 Places', plate: 'Partenaire', pricePerDay: 110000, image: '/img/vehicles/h1ec.jpg', specs: ['20 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Autocar', name: 'Hyundai 28 Places', plate: 'Partenaire', pricePerDay: 125000, image: '/img/vehicles/h1ec.jpg', specs: ['28 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Autocar', name: 'Hyundai 32 Places', plate: 'Partenaire', pricePerDay: 135000, image: '/img/vehicles/h1ec.jpg', specs: ['32 places assises', 'Manuel', 'Avec chauffeur'] },
];

async function seedVehicles() {
  try {
    console.log('🚗 Début du remplissage de la table Vehicle...');
    
    // Connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    const { Vehicle } = require('../src/models/index.cjs');

    // Mettre à jour ou créer chaque véhicule (sans supprimer pour préserver les réservations)
    let count = 0;
    for (const vehicle of RENTAL_VEHICLES) {
      // Extraire marque et modèle du nom
      const nameParts = vehicle.name.split(' ');
      const marque = nameParts[0];
      const modele = nameParts.slice(1).join(' ') || marque;
      
      // Extraire le nombre de places
      const placesSpec = vehicle.specs.find(spec => spec.includes('personnes') || spec.includes('places'));
      const places = placesSpec ? parseInt(placesSpec.match(/\d+/)?.[0] || '5') : 5;
      
      // Extraire carburant et transmission
      const carburant = vehicle.specs.find(spec => ['Essence', 'Gazole', 'Hybride', 'Diesel'].includes(spec)) || 'Essence';
      const transmission = vehicle.specs.find(spec => ['Automatique', 'Manuel'].includes(spec)) || 'Automatique';

      // Chercher un véhicule existant par marque + modèle
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
      } else {
        await Vehicle.create(data);
      }
      count++;
      console.log(`  ✓ ${count}/${RENTAL_VEHICLES.length} - ${vehicle.name}`);
    }

    console.log(`\n✅ ${count} véhicules insérés avec succès !`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du remplissage:', error);
    process.exit(1);
  }
}

seedVehicles();
