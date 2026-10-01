import FLOTTE_OFFICIELLE from '../../shared/flotte-officielle.json';

const VEHICLE_IMAGE_BASE_URL = '/img/vehicles';
const IMAGE_BASE_URL = '/img';

/**
 * Flotte officielle : liste blanche validée par le client.
 * Les fiches statiques ci-dessous ne servent que de secours quand l'API ne
 * répond pas — elles doivent donc respecter EXACTEMENT la même liste, sinon le
 * site advertise des véhicules retirés de la location.
 *
 * Règles identiques au service serveur (server/src/services/flotte-officielle.service.cjs) :
 *  - correspondance exacte « marque modèle » sur la liste blanche ;
 *  - variantes de finition autorisées (préfixe) ;
 *  - « Mazda CX-30 » reste exclu même si « Mazda CX-3 » est demandé ;
 *  - les autocars de 25 et 32 places sont toujours conservés.
 */
const normaliserNom = (valeur) =>
  String(valeur == null ? '' : valeur)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const AUTORISES = new Set(FLOTTE_OFFICIELLE.vehicules.map(normaliserNom));
const PREFIXES_AUTORISES = FLOTTE_OFFICIELLE.variantesPrefixe
  .map(normaliserNom)
  .sort((a, b) => b.length - a.length);
const NOMS_EXCLUS = new Set(FLOTTE_OFFICIELLE.variantesExclues.map(normaliserNom));
const PLACES_GARDEES = new Set(FLOTTE_OFFICIELLE.placesToujoursGardes);
// Même modèle écrit différemment selon la source (« Range Rover » en fiche
// statique, « Land Rover Range Rover » en base).
const EQUIVALENTS = new Map(
  Object.entries(FLOTTE_OFFICIELLE.equivalents || {}).map(([alias, ref]) => [normaliserNom(alias), normaliserNom(ref)]),
);

/** @returns {boolean} true si la fiche statique fait partie de la flotte officielle. */
export function estDansLaFlotteOfficielle(nom, places) {
  if (PLACES_GARDEES.has(Number(places))) return true;
  const normalise = normaliserNom(nom);
  if (!normalise) return false;
  if (NOMS_EXCLUS.has(normalise)) return false;
  if (AUTORISES.has(normalise)) return true;
  const reference = EQUIVALENTS.get(normalise);
  if (reference && AUTORISES.has(reference)) return true;
  return PREFIXES_AUTORISES.some((prefixe) => normalise === prefixe || normalise.startsWith(`${prefixe} `));
}

const officialImage = (fileName) => `${IMAGE_BASE_URL}/${fileName}`;
const vehicleImage = (fileName) => `${VEHICLE_IMAGE_BASE_URL}/${fileName}`;

/** Grille tarifaire 2026 "” données exactes du fichier Excel */
function exactTariffs(abidjanWith, abidjanWithout, zone240With, zone240Without, zone405With, zone405Without, zone800With, zone800Without) {
  return {
    abidjan: { withDriver: abidjanWith, withoutDriver: abidjanWithout },
    zone240: { withDriver: zone240With, withoutDriver: zone240Without },
    zone405: { withDriver: zone405With, withoutDriver: zone405Without },
    zone800: { withDriver: zone800With, withoutDriver: zone800Without },
  };
}

// Fonction de compatibilité pour les véhicules non listés dans l'Excel
function buildTariffs(withDriver, withoutDriver) {
  return {
    abidjan: { withDriver, withoutDriver },
    zone240: { withDriver: Math.round(withDriver * 1.155), withoutDriver: Math.round(withoutDriver * 1.155) },
    zone405: { withDriver: Math.round(withDriver * 1.2705), withoutDriver: Math.round(withoutDriver * 1.2705) },
    zone800: { withDriver: Math.round(withDriver * 1.39755), withoutDriver: Math.round(withoutDriver * 1.39755) },
  };
}

const RENTAL_VEHICLES_RAW = [
  { category: 'Économiques', name: 'Renault Duster', plate: 'AA-001-CI', pricePerDay: 30000, tariffs: buildTariffs(30000, 30000), image: '/img/vehicles/dusterAvant.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Économiques', name: 'Suzuki Dzire', plate: 'AA-002-CI', pricePerDay: 25000, tariffs: buildTariffs(25000, 25000), image: '/img/vehicles/dzer.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Économiques', name: 'Suzuki Fronx', plate: 'AA-003-CI', pricePerDay: 30000, tariffs: buildTariffs(30000, 30000), image: '/img/vehicles/fronxav.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Citadine', name: 'Nissan Micra', plate: 'AA-010-CI', pricePerDay: 22000, tariffs: buildTariffs(22000, 22000), image: '/img/vehicles/nissan_micra.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Citadine', name: 'Suzuki Swift', plate: 'AA-014-CI', pricePerDay: 20000, tariffs: buildTariffs(20000, 20000), image: '/img/vehicles/swiftavant.png', specs: ['5 personnes', 'Automatique', 'Assurée'] },

  { category: 'Berline', name: 'Audi A4', plate: 'AA-017-CI', pricePerDay: 48000, tariffs: buildTariffs(48000, 48000), image: '/img/vehicles/audi_a4.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Berline', name: 'Audi A6', plate: 'AA-018-CI', pricePerDay: 70000, tariffs: buildTariffs(70000, 70000), image: '/img/vehicles/audia6.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Berline', name: 'BMW Série 3 320i', plate: 'AA-020-CI', pricePerDay: 50000, tariffs: buildTariffs(50000, 50000), image: '/img/vehicles/bmw320.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Berline', name: 'BMW Série 5 530i', plate: 'AA-021-CI', pricePerDay: 75000, tariffs: buildTariffs(75000, 75000), image: '/img/vehicles/bmw_530i.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Berline', name: 'BMW Série 7 740Li', plate: 'AA-022-CI', pricePerDay: 140000, tariffs: buildTariffs(140000, 140000), image: '/img/vehicles/bmw_740li.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Berline', name: 'Genesis G80', plate: 'AA-023-CI', pricePerDay: 95000, tariffs: buildTariffs(95000, 95000), image: '/img/vehicles/genesis_g80.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Berline', name: 'Lexus ES 350', plate: 'AA-031-CI', pricePerDay: 65000, tariffs: buildTariffs(65000, 65000), image: '/img/vehicles/lexus_es.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Berline', name: 'Mercedes Classe C 200', plate: 'AA-034-CI', pricePerDay: 50000, tariffs: buildTariffs(50000, 50000), image: '/img/vehicles/c200.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Berline', name: 'Mercedes Classe E 300', plate: 'AA-035-CI', pricePerDay: 75000, tariffs: buildTariffs(75000, 75000), image: '/img/vehicles/mercedes_e300.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Berline', name: 'Peugeot 508 GT', plate: 'AA-039-CI', pricePerDay: 45000, tariffs: buildTariffs(45000, 45000), image: '/img/vehicles/peugeot508.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Berline', name: 'Tesla Model 3', plate: 'AA-040-CI', pricePerDay: 120000, tariffs: buildTariffs(120000, 120000), image: '/img/vehicles/tesla_model3.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Berline', name: 'Toyota Camry', plate: 'AA-041-CI', pricePerDay: 40000, tariffs: buildTariffs(40000, 40000), image: '/img/vehicles/camry.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Nissan Kicks', plate: 'AA-056-CI', pricePerDay: 40500, tariffs: buildTariffs(40500, 40500), image: '/img/vehicles/KickAvant.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Renault Kadjar', plate: 'AA-061-CI', pricePerDay: 40500, tariffs: buildTariffs(40500, 40500), image: '/img/vehicles/kadjaravant.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Renault Koleos', plate: 'AA-062-CI', pricePerDay: 40500, tariffs: buildTariffs(40500, 40500), image: '/img/vehicles/koleosAv.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Suzuki Grand Vitara', plate: 'AA-063-CI', pricePerDay: 40500, tariffs: buildTariffs(40500, 40500), image: '/img/vehicles/gvitaraAv.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Suzuki Vitara', plate: 'AA-065-CI', pricePerDay: 35000, tariffs: buildTariffs(35000, 35000), image: '/img/vehicles/vitaraAvant.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Toyota RAV4', plate: 'AA-066-CI', pricePerDay: 45000, tariffs: buildTariffs(45000, 45000), image: '/img/vehicles/rav4avant.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: '4x4', name: 'Mitsubishi Pajero 13', plate: 'AA-072-CI', pricePerDay: 55000, tariffs: buildTariffs(55000, 55000), image: '/img/vehicles/pajeroav.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: '4x4', name: 'Toyota Highlander', plate: 'AA-078-CI', pricePerDay: 55000, tariffs: buildTariffs(55000, 55000), image: '/img/vehicles/high.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: '4x4', name: 'Toyota Rush', plate: 'AA-080-CI', pricePerDay: 50000, tariffs: buildTariffs(50000, 50000), image: '/img/vehicles/rushavant.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Pick-Up', name: 'Isuzu D-Max 2024', plate: 'AA-084-CI', pricePerDay: 60000, tariffs: buildTariffs(60000, 60000), image: '/img/vehicles/dmax2024.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Pick-Up', name: 'Mitsubishi L200', plate: 'AA-086-CI', pricePerDay: 51000, tariffs: buildTariffs(51000, 51000), image: '/img/vehicles/l200av.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Pick-Up', name: 'Mitsubishi L200 New', plate: 'AA-087-CI', pricePerDay: 65000, tariffs: buildTariffs(65000, 65000), image: '/img/vehicles/l200new.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Pick-Up', name: 'Renault OROCH', plate: 'AA-089-CI', pricePerDay: 30000, tariffs: buildTariffs(30000, 30000), image: '/img/vehicles/orochav.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Pick-Up', name: 'Toyota Tacoma', plate: 'AA-092-CI', pricePerDay: 50000, tariffs: buildTariffs(50000, 50000), image: '/img/vehicles/tacomaav.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Utilitaires', name: 'Citroën Jumper', plate: 'AA-094-CI', pricePerDay: 30000, tariffs: buildTariffs(30000, 30000), image: '/img/vehicles/jumperav.jpeg', specs: ['5 places assises', 'Manuel', 'Assurée'] },
  { category: 'Utilitaires', name: 'Ford Transit', plate: 'AA-096-CI', pricePerDay: 40000, tariffs: buildTariffs(40000, 40000), image: '/img/vehicles/ford1.jpg', specs: ['5 places assises', 'Manuel', 'Assurée'] },
  { category: 'Utilitaires', name: 'Renault Dokker', plate: 'AA-099-CI', pricePerDay: 30000, tariffs: buildTariffs(30000, 30000), image: '/img/vehicles/dokker.jpg', specs: ['5 places assises', 'Manuel', 'Assurée'] },
  { category: 'Utilitaires', name: 'Renault Van Express', plate: 'AA-102-CI', pricePerDay: 30000, tariffs: buildTariffs(30000, 30000), image: '/img/vehicles/express1.jpeg', specs: ['5 places assises', 'Manuel', 'Assurée'] },
  { category: 'Minibus', name: 'Citroën Jumper 12 Places', plate: 'AA-104-CI', pricePerDay: 80000, tariffs: buildTariffs(80000, 80000), image: '/img/vehicles/jumper12.jpg', specs: ['15 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Minibus', name: 'Ford Transit 16 Places', plate: 'AA-105-CI', pricePerDay: 90000, tariffs: buildTariffs(90000, 90000), image: '/img/vehicles/transit16.jpg', specs: ['15 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Minibus', name: 'Iveco Daily 20 Places', plate: 'AA-106-CI', pricePerDay: 110000, tariffs: buildTariffs(110000, 110000), image: '/img/vehicles/daily20.jpg', specs: ['15 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Minibus', name: 'Nissan Urvan', plate: 'AA-108-CI', pricePerDay: 70000, tariffs: buildTariffs(70000, 70000), image: '/img/vehicles/urvan1.jpeg', specs: ['15 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Minibus', name: 'Nissan Urvan 14 Places', plate: 'AA-109-CI', pricePerDay: 80000, tariffs: buildTariffs(80000, 80000), image: '/img/vehicles/urvan14.jpg', specs: ['15 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Luxe', name: 'Range Rover', plate: 'AA-117-CI', pricePerDay: 220000, tariffs: buildTariffs(220000, 220000), image: '/img/vehicles/range_rover.jpg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Luxe', name: 'Toyota Land Cruiser', plate: 'AA-118-CI', pricePerDay: 190000, tariffs: buildTariffs(190000, 190000), image: '/img/vehicles/l300.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
];

// Seules les fiches de la flotte officielle sont publiées (repli hors API).
export const RENTAL_VEHICLES = RENTAL_VEHICLES_RAW.filter((v) => estDansLaFlotteOfficielle(v.name));

export const SERVICES_DATA = [
  {
    id: 'vehicules',
    title: 'Location de véhicules',
    shortTitle: 'Mobilité',
    eyebrow: 'Mobilité professionnelle & privée',
    icon: 'directions_car',
    image: officialImage('carRe.jpeg'),
    heroImage: officialImage('carPlay.jpg'),
    description: 'Des solutions de mobilité souples, fiables et adaptées à chaque déplacement professionnel ou personnel.',
    intro: 'Une flotte variée, un accompagnement attentif et des formules pensées pour simplifier chaque trajet.',
    overview: "SOUTARAH GROUP propose des véhicules pour les besoins ponctuels, les missions de longue durée et les déplacements avec chauffeur. L'offre officielle met l'accent sur la fiabilité de la flotte, le confort et la sécurité des passagers.",
    stat: { value: '25+', label: 'véhicules dans la flotte' },
    highlights: [
      { icon: 'event_available', title: 'Formules flexibles', text: 'Location courte, moyenne ou longue durée selon votre rythme.' },
      { icon: 'person_pin_circle', title: 'Avec chauffeur', text: 'Une solution de transport avec des conducteurs professionnels.' },
      { icon: 'support_agent', title: 'Assistance dédiée', text: 'Un accompagnement pour organiser votre mobilité en toute sérénité.' },
    ],
    offers: [
      { icon: 'directions_car', title: 'Location adaptée', text: 'Économiques, SUV et utilitaires pour les besoins personnels comme professionnels.', image: officialImage('dzer.jpg'), alt: 'Véhicule de location Soutarah Group' },
      { icon: 'route', title: "Mobilité d'entreprise", text: 'Des véhicules disponibles pour vos équipes, missions et déplacements réguliers.', image: officialImage('KickAvant.jpeg'), alt: 'SUV de location Soutarah Group' },
      { icon: 'airport_shuttle', title: 'Transfert & chauffeur', text: 'Une prise en charge plus fluide pour vos trajets, événements et transferts.', image: officialImage('kadjaravant.jpeg'), alt: 'Véhicule avec chauffeur Soutarah Group' },
    ],
    information: [
      {
        icon: 'wifi',
        title: 'Confort à bord',
        text: "L'offre officielle met en avant une expérience de location pensée pour rendre chaque trajet plus agréable.",
        points: ['Équipements de technologie selon véhicule', 'Options adaptées aux déplacements professionnels', 'Une flotte entretenue pour vos trajets'],
      },
      {
        icon: 'person_pin_circle',
        title: 'Chauffeurs professionnels',
        text: 'SOUTARAH GROUP propose également des chauffeurs professionnels, avec une attention portée à la compétence et à la sécurité.',
        points: ['Option chauffeur sur demande', 'Accompagnement pour les missions et transferts', 'Service adapté aux besoins de la clientèle'],
      },
    ],
    process: ['Exprimez votre besoin', 'Choisissez votre formule', 'Validez la réservation', 'Prenez la route sereinement'],
    rentalVehicles: RENTAL_VEHICLES,
  },
  {
    id: 'negoce',
    title: 'Négoce / Import-Export',
    shortTitle: 'Négoce',
    eyebrow: 'Approvisionnement & commerce international',
    icon: 'import_export',
    image: officialImage('neg.jpeg'),
    heroImage: officialImage('Negoce-ie.jpg'),
    description: 'Un accompagnement rigoureux pour sourcer, acheminer et livrer les produits essentiels à votre activité.',
    intro: "De la recherche produit à la livraison, nous facilitons vos opérations d'approvisionnement.",
    overview: "L'activité officielle de négoce de SOUTARAH GROUP s'appuie sur des contacts internationaux pour aider ses clients à accéder à des produits difficiles à trouver localement. Elle couvre notamment les équipements de quincaillerie, plomberie, sanitaire, électroménager, fournitures de bureau et matériaux de construction.",
    stat: { value: '360°', label: "d'accompagnement achat" },
    highlights: [
      { icon: 'public', title: 'Sourcing international', text: 'Une recherche de produits adaptée à vos critères et à votre marché.' },
      { icon: 'inventory_2', title: 'Approvisionnement ciblé', text: 'Des solutions pour les fournitures, équipements et matériaux essentiels.' },
      { icon: 'local_shipping', title: 'Suivi logistique', text: "Une coordination attentive jusqu'à la réception de vos produits." },
    ],
    offers: [
      { icon: 'search', title: 'Recherche & sourcing', text: 'Nous identifions les produits et équipements répondant à vos exigences.', image: officialImage('negoce.webp'), alt: 'Opérations de négoce Soutarah Group' },
      { icon: 'handshake', title: 'Achat sur mesure', text: "Une solution d'approvisionnement construite selon votre besoin et vos volumes.", image: officialImage('neg.jpeg'), alt: 'Approvisionnement import-export Soutarah Group' },
      { icon: 'local_shipping', title: 'Acheminement coordonné', text: "Un interlocuteur unique pour rendre le parcours d'achat plus simple.", image: officialImage('Negoce-ie.jpg'), alt: 'Transport de marchandises pour le négoce' },
    ],
    information: [
      {
        icon: 'inventory_2',
        title: 'Des fournitures variées',
        text: "Le négoce officiel couvre notamment la quincaillerie, la plomberie, le sanitaire, l'électroménager, les fournitures de bureau et les matériaux de construction.",
        points: ['Produits sélectionnés selon le besoin', 'Qualité et prix compétitifs recherchés', 'Solutions pour professionnels et particuliers'],
      },
      {
        icon: 'travel_explore',
        title: 'Accéder à ce qui manque localement',
        text: 'Grâce à ses contacts internationaux, SOUTARAH GROUP aide ses clients à rechercher des produits indisponibles ou difficiles à trouver sur le marché local.',
        points: ["Réseau de sourcing international", "Partenaires nationaux et internationaux", "Suivi de la demande jusqu'à la livraison"],
      },
    ],
    process: ["Analyse de votre besoin", "Recherche des solutions", "Coordination de l'achat", "Réception de la commande"],
  },
  {
    id: 'technique',
    title: 'Services techniques',
    shortTitle: 'Technique',
    eyebrow: 'Installation, maintenance & entretien',
    icon: 'build',
    image: officialImage('tecg.jpeg'),
    heroImage: officialImage('installatio,.webp'),
    description: 'Des interventions techniques fiables pour préserver la performance, la sécurité et le confort de vos espaces.',
    intro: 'Des équipes mobilisées pour installer, maintenir et entretenir vos équipements et vos sites.',
    overview: "SOUTARAH GROUP intervient sur l'installation et la maintenance d'équipements électriques, domestiques et industriels. L'offre officielle couvre la climatisation (maintenance, installation et vente de climatiseurs), les maintenances prédictive, préventive et corrective, les équipements de froid et de chaud, ainsi que l'entretien d'espaces intérieurs et extérieurs.",
    stat: { value: '3', label: 'types de maintenance' },
    highlights: [
      { icon: 'monitoring', title: 'Maintenance prédictive', text: 'Anticiper les anomalies pour réduire les interruptions.' },
      { icon: 'verified_user', title: 'Interventions sécurisées', text: 'Des prestations organisées avec une attention portée aux normes.' },
      { icon: 'settings_suggest', title: 'Solutions sur mesure', text: 'Une réponse adaptée à vos équipements et à la réalité de votre site.' },
    ],
    offers: [
      { icon: 'ac_unit', title: 'Maintenance de climatisation', text: 'Entretien, dépannage et maintenance préventive de vos climatiseurs.', image: officialImage('froid.jpg'), alt: 'Maintenance de climatisation' },
      { icon: 'airwave', title: 'Installation de climatisation', text: 'Installation et mise en service de solutions de climatisation adaptées.', image: officialImage('chaud.jpg'), alt: 'Installation de climatisation' },
      { icon: 'local_fire_department', title: 'Vente de climatiseurs', text: 'Vente de climatiseurs performants pour particuliers et entreprises.', image: officialImage('installatio,.webp'), alt: 'Vente de climatiseurs' },
      { icon: 'mode_heat', title: 'Chaud & installations', text: 'Des interventions pour les équipements de chaud et les installations techniques.', image: officialImage('chaud.jpg'), alt: 'Maintenance équipements de chaud' },
      { icon: 'electrical_services', title: 'Installation électrique', text: "Mise en place d'équipements domestiques et industriels.", image: officialImage('installatio,.webp'), alt: 'Installation technique Soutarah Group' },
      { icon: 'yard', title: 'Espaces verts', text: "Gestion et entretien d'espaces extérieurs propres et fonctionnels.", image: officialImage('espacevert.jpg'), alt: 'Entretien des espaces verts' },
      { icon: 'cleaning_services', title: 'Entretien de locaux', text: 'Des environnements intérieurs sains, soignés et agréables.', image: officialImage('entretien.jpg'), alt: 'Entretien de locaux professionnels' },
    ],
    information: [
      {
        icon: 'electrical_services',
        title: 'Équipements électriques, domestiques et industriels',
        text: "L'activité technique officielle comprend l'installation de différents équipements et des services de maintenance pour préserver leurs performances et leur durabilité.",
        points: ["Basse, moyenne et haute tension", "Interventions pour particuliers et entreprises", "Attention portée à l'efficacité énergétique"],
      },
      {
        icon: 'build_circle',
        title: 'Prévenir, entretenir, corriger',
        text: 'Les maintenances prédictive, préventive et corrective sont proposées pour mieux anticiper les pannes, entretenir les installations et agir au besoin.',
        points: ['Contrôles et suivi régulier', 'Intervention en cas de défaillance', 'Objectif de fiabilité à long terme'],
      },
    ],
    process: ["Diagnostic du site", "Planification de l'intervention", "Réalisation sécurisée", "Suivi et conseils"],
  },
  {
    id: 'energie',
    title: 'Énergies renouvelables',
    shortTitle: 'Énergie',
    eyebrow: 'Solutions solaires performantes',
    icon: 'solar_power',
    image: officialImage('energ.jpeg'),
    heroImage: officialImage('energie.png'),
    description: "Des installations solaires conçues pour mieux maîtriser l'énergie et inscrire vos projets dans la durée.",
    intro: "Étudier, équiper et mettre en service des solutions d'énergie propre adaptées à chaque site.",
    overview: "L'offre officielle de SOUTARAH GROUP couvre l'étude d'installations électriques utilisant les énergies renouvelables, la vente d'équipements photovoltaïques et l'installation clé en main. Les solutions s'adressent notamment aux résidences, bâtiments, écoles, lieux de culte et projets de pompage solaire.",
    stat: { value: "Clé en main", label: "de l'étude à la mise en service" },
    highlights: [
      { icon: 'query_stats', title: 'Étude énergétique', text: 'Une analyse du besoin pour concevoir une solution pertinente.' },
      { icon: 'solar_power', title: 'Équipements solaires', text: 'Des solutions photovoltaïques adaptées à votre projet.' },
      { icon: 'savings', title: 'Accompagnement projet', text: 'Un appui possible autour du montage et du financement.' },
    ],
    offers: [
      { icon: 'fact_check', title: 'Études & dimensionnement', text: "Une étude complète avant de définir l'installation appropriée.", image: officialImage('energ.jpeg'), alt: 'Étude énergétique Soutarah Group' },
      { icon: 'inventory', title: "Vente d'équipements", text: "Des équipements photovoltaïques choisis pour les contraintes du projet.", image: officialImage('vente-panneau.jpg'), alt: 'Panneaux solaires' },
      { icon: 'engineering', title: 'Installation clé en main', text: 'De la conception à la mise en service de votre solution solaire.', image: officialImage('installation.jpg'), alt: 'Installation de panneaux solaires' },
      { icon: 'account_balance', title: 'Montage du projet', text: 'Un accompagnement pour étudier les options de financement disponibles.', image: officialImage('OIP.jpg'), alt: 'Accompagnement de projet énergétique' },
    ],
    information: [
      {
        icon: 'home_work',
        title: 'Des usages variés',
        text: "Les études peuvent concerner le résidentiel, les bâtiments publics ou privés, les écoles, les lieux de culte et les projets de pompage solaire pour l'irrigation.",
        points: ['Réponse adaptée aux contraintes du site', 'Équipements performants et énergie propre', 'Recherche de réduction des dépenses énergétiques'],
      },
      {
        icon: 'payments',
        title: 'Un projet à rendre possible',
        text: 'Selon le projet, les relations avec des partenaires nationaux et internationaux peuvent aider à examiner les pistes de financement total ou partiel.',
        points: ['Analyse du besoin en amont', 'Étude du montage de projet', 'Mise en service de la solution retenue'],
      },
    ],
    process: ['Étude de votre consommation', 'Conception de la solution', 'Installation & mise en service', 'Suivi de votre projet'],
  },
  {
    id: 'agropastorale',
    title: 'Agropastorale',
    shortTitle: 'Agropastorale',
    eyebrow: 'Agriculture & élevage durables',
    icon: 'agriculture',
    image: officialImage('fermi.jpeg'),
    heroImage: officialImage('fermier.png'),
    description: "Une approche intégrée de l'agriculture et de l'élevage qui associe production, responsabilité et durabilité.",
    intro: 'Cultiver et élever de manière responsable pour une production locale diversifiée et résiliente.',
    overview: "La ferme agropastorale de SOUTARAH GROUP associe agriculture et élevage dans une logique de production durable. L'activité officielle privilégie des pratiques responsables, la qualité des produits, le respect des ressources naturelles et le bien-être animal.",
    stat: { value: 'Durable', label: 'une approche intégrée' },
    highlights: [
      { icon: 'eco', title: 'Pratiques responsables', text: "Une production pensée dans le respect de l'environnement." },
      { icon: 'agriculture', title: 'Agriculture locale', text: 'Des cultures orientées vers une alimentation saine et de qualité.' },
      { icon: 'pets', title: 'Élevage raisonné', text: 'Une attention portée au bien-être animal et à la traçabilité.' },
    ],
    offers: [
      { icon: 'landscape', title: 'Ferme intégrée', text: 'Une organisation qui relie production agricole et élevage.', image: officialImage('fermier.png'), alt: 'Ferme agropastorale Soutarah Group' },
      { icon: 'compost', title: 'Agriculture durable', text: 'Des pratiques adaptées pour préserver les ressources et les rendements.', image: officialImage('Web_Plan%20de%20travail%201%20copie.png'), alt: 'Production agricole durable' },
      { icon: 'egg_alt', title: 'Élevage responsable', text: 'Une activité respectueuse du bien-être animal et de la qualité.', image: officialImage('pasto.jpeg'), alt: 'Élevage agropastoral' },
    ],
    information: [
      {
        icon: 'spa',
        title: 'Agriculture responsable',
        text: "L'activité agricole officielle privilégie une production locale saine et des pratiques innovantes qui cherchent à préserver les ressources naturelles.",
        points: ['Cultures destinées à la commercialisation', 'Approche écologique et durable', 'Production pensée pour la qualité'],
      },
      {
        icon: 'pets',
        title: 'Élevage avec traçabilité',
        text: "L'élevage est présenté comme une activité respectueuse du bien-être animal, avec une attention portée à l'alimentation, aux conditions de vie et à la qualité des produits.",
        points: ['Bétail, volailles et autres espèces', 'Bien-être animal pris en compte', 'Production éthique et traçable'],
      },
    ],
    process: ["Identifier le projet", "Définir l'approche adaptée", "Mettre en œuvre durablement", "Suivre la production"],
  },
  {
    id: 'immobilier',
    title: 'Immobilier',
    shortTitle: 'Immobilier',
    eyebrow: 'Terrains, logements & espaces professionnels',
    icon: 'apartment',
    image: officialImage('immobilier.jpeg'),
    heroImage: officialImage('description_immobilier.jpeg'),
    description: 'Des solutions immobilières complètes pour habiter, investir, aménager ou développer votre activité.',
    intro: 'Un accompagnement personnalisé, de la recherche du bien à la valorisation de votre projet immobilier.',
    overview: "L'offre immobilière officielle de SOUTARAH GROUP comprend le lotissement, la vente de terrains, la rénovation, les résidences meublées et la location de bureaux ou de locaux. Elle s'adresse aux projets résidentiels, commerciaux et d'investissement.",
    stat: { value: '5', label: 'expertises immobilières' },
    highlights: [
      { icon: 'map', title: 'Emplacements stratégiques', text: "Des solutions pensées pour l'accès, le confort et la valorisation." },
      { icon: 'home_work', title: 'Projets variés', text: 'Du terrain à bâtir au local professionnel prêt à exploiter.' },
      { icon: 'real_estate_agent', title: 'Accompagnement dédié', text: 'Un suivi à chaque étape de votre projet immobilier.' },
    ],
    offers: [
      { icon: 'domain_add', title: 'Lotissement', text: 'Des terrains aménagés et prêts à accueillir vos projets.', image: officialImage('lotissement.jpeg'), alt: 'Lotissement immobilier' },
      { icon: 'landscape', title: 'Terrains à vendre', text: 'Des opportunités adaptées aux projets résidentiels ou commerciaux.', image: officialImage('types-de-terrains-a-vendre-500x333.jpg'), alt: 'Terrains immobiliers à vendre' },
      { icon: 'construction', title: 'Rénovation', text: 'Moderniser et valoriser votre maison, appartement ou local.', image: officialImage('travaux-renovation-maison.jpeg'), alt: 'Rénovation de maison' },
      { icon: 'king_bed', title: 'Résidences meublées', text: "Des logements équipés pour s'installer confortablement.", image: officialImage('resimeubl%C3%A9.webp'), alt: 'Résidence meublée' },
      { icon: 'storefront', title: 'Bureaux & locaux', text: "Des espaces professionnels adaptés à l'activité de votre entreprise.", image: officialImage('locaux.jpeg'), alt: 'Bureaux et locaux professionnels' },
    ],
    information: [
      {
        icon: 'domain_add',
        title: 'Terrains et lotissement',
        text: "Les projets de lotissement et de vente de terrains sont conçus autour de parcelles aménagées, d'infrastructures utiles et d'emplacements stratégiques.",
        points: ["Terrains prêts à bâtir", "Accès, eau et électricité selon le projet", "Accompagnement jusqu'à l'acquisition"],
      },
      {
        icon: 'home_repair_service',
        title: 'Habiter, rénover ou travailler',
        text: "L'offre officielle comprend la rénovation, les résidences meublées et les espaces de bureaux ou locaux, avec une recherche de confort et de fonctionnalité.",
        points: ['Modernisation et valorisation du bien', 'Résidences prêtes à vivre', 'Espaces professionnels flexibles'],
      },
    ],
    process: ['Parlez-nous de votre projet', 'Explorez les options', 'Affinez votre solution', 'Concrétisez sereinement'],
  },
];

export const getServiceById = (id) => SERVICES_DATA.find((service) => service.id === id);

export const STATS_DATA = [
  { value: 1000, label: 'Clients satisfaits', icon: 'groups', suffix: '+' },
  { value: 50, label: 'Projets réalisés', icon: 'architecture', suffix: '+' },
  { value: 10, label: 'Professionnels', icon: 'engineering', suffix: '+' },
  { value: 2, label: "Années d'expérience", icon: 'workspace_premium', suffix: '+' },
];

export const PARTNERS_DATA = [
  { name: 'SAEE Services', logo: officialImage('saee.png') },
  { name: 'BESSAC', logo: officialImage('bessac.jpeg') },
  { name: 'DM Company', logo: officialImage('dmc.jpeg') },
  { name: 'SIT-BTP', logo: officialImage('sitbtp.jpeg') },
  { name: 'CIM IVOIRE', logo: officialImage('cim.jpeg') },
  { name: 'US Embassy', logo: officialImage('usaembassy.png') },
  { name: 'Southcomp Polaris', logo: officialImage('OIP%20(1).jpeg') },
  { name: 'SOGELEC', logo: officialImage('sogelec.jpeg') },
  { name: 'Enabel', logo: officialImage('enabel.jpeg') },
];

