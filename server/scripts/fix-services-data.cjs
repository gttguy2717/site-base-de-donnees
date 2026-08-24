const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'src', 'data', 'servicesData.js');
let content = fs.readFileSync(filePath, 'utf8');

// Fix unescaped apostrophes in single-quoted strings by converting to double quotes
// Strategy: find single-quoted strings that contain an unescaped apostrophe and convert them to double quotes

// First, fix the specific known issues
const replacements = [
  // Line 200
  ["label: 'd'accompagnement achat'", 'label: "d\'accompagnement achat"'],
  // Line 204
  ["text: 'Une coordination attentive jusqu'à la réception de vos produits.'", 'text: "Une coordination attentive jusqu\'à la réception de vos produits."'],
  // Line 208
  ["text: 'Une solution d'approvisionnement construite selon votre besoin et vos volumes.'", 'text: "Une solution d\'approvisionnement construite selon votre besoin et vos volumes."'],
  // Line 209
  ["text: 'Un interlocuteur unique pour rendre le parcours d'achat plus simple.'", 'text: "Un interlocuteur unique pour rendre le parcours d\'achat plus simple."'],
  // Line 215
  ["text: 'Le négoce officiel couvre notamment la quincaillerie, la plomberie, le sanitaire, l'électroménager, les fournitures de bureau et les matériaux de construction.'", 'text: "Le négoce officiel couvre notamment la quincaillerie, la plomberie, le sanitaire, l\'électroménager, les fournitures de bureau et les matériaux de construction."'],
  // Line 222
  ["points: ['Réseau de sourcing international', 'Partenaires nationaux et internationaux', 'Suivi de la demande jusqu'à la livraison']", 'points: ["Réseau de sourcing international", "Partenaires nationaux et internationaux", "Suivi de la demande jusqu\'à la livraison"]'],
  // Line 225
  ["process: ['Analyse de votre besoin', 'Recherche des solutions', 'Coordination de l'achat', 'Réception de la commande']", 'process: ["Analyse de votre besoin", "Recherche des solutions", "Coordination de l\'achat", "Réception de la commande"]'],
  // Line 237
  ["overview: 'SOUTARAH GROUP intervient sur l'installation et la maintenance d'équipements électriques, domestiques et industriels. L'offre officielle couvre les maintenances prédictive, préventive et corrective, les équipements de froid et de chaud, ainsi que l'entretien d'espaces intérieurs et extérieurs.'", 'overview: "SOUTARAH GROUP intervient sur l\'installation et la maintenance d\'équipements électriques, domestiques et industriels. L\'offre officielle couvre les maintenances prédictive, préventive et corrective, les équipements de froid et de chaud, ainsi que l\'entretien d\'espaces intérieurs et extérieurs."'],
  // Line 247
  ["text: 'Mise en place d'équipements domestiques et industriels.'", 'text: "Mise en place d\'équipements domestiques et industriels."'],
  // Line 248
  ["text: 'Gestion et entretien d'espaces extérieurs propres et fonctionnels.'", 'text: "Gestion et entretien d\'espaces extérieurs propres et fonctionnels."'],
  // Line 255
  ["text: 'L'activité technique officielle comprend l'installation de différents équipements et des services de maintenance pour préserver leurs performances et leur durabilité.'", 'text: "L\'activité technique officielle comprend l\'installation de différents équipements et des services de maintenance pour préserver leurs performances et leur durabilité."'],
  // Line 256
  ["points: ['Basse, moyenne et haute tension', 'Interventions pour particuliers et entreprises', 'Attention portée à l'efficacité énergétique']", 'points: ["Basse, moyenne et haute tension", "Interventions pour particuliers et entreprises", "Attention portée à l\'efficacité énergétique"]'],
  // Line 265
  ["process: ['Diagnostic du site', 'Planification de l'intervention', 'Réalisation sécurisée', 'Suivi et conseils']", 'process: ["Diagnostic du site", "Planification de l\'intervention", "Réalisation sécurisée", "Suivi et conseils"]'],
  // Line 275
  ["description: 'Des installations solaires conçues pour mieux maîtriser l'énergie et inscrire vos projets dans la durée.'", 'description: "Des installations solaires conçues pour mieux maîtriser l\'énergie et inscrire vos projets dans la durée."'],
  // Line 276
  ["intro: 'Étudier, équiper et mettre en service des solutions d'énergie propre adaptées à chaque site.'", 'intro: "Étudier, équiper et mettre en service des solutions d\'énergie propre adaptées à chaque site."'],
  // Line 277
  ["overview: 'L'offre officielle de SOUTARAH GROUP couvre l'étude d'installations électriques utilisant les énergies renouvelables, la vente d'équipements photovoltaïques et l'installation clé en main. Les solutions s'adressent notamment aux résidences, bâtiments, écoles, lieux de culte et projets de pompage solaire.'", 'overview: "L\'offre officielle de SOUTARAH GROUP couvre l\'étude d\'installations électriques utilisant les énergies renouvelables, la vente d\'équipements photovoltaïques et l\'installation clé en main. Les solutions s\'adressent notamment aux résidences, bâtiments, écoles, lieux de culte et projets de pompage solaire."'],
  // Line 278
  ["stat: { value: 'Clé en main', label: 'de l'étude à la mise en service' }", 'stat: { value: "Clé en main", label: "de l\'étude à la mise en service" }'],
  // Line 285
  ["text: 'Une étude complète avant de définir l'installation appropriée.'", 'text: "Une étude complète avant de définir l\'installation appropriée."'],
  // Line 286
  ["text: 'Des équipements photovoltaïques choisis pour les contraintes du projet.'", 'text: "Des équipements photovoltaïques choisis pour les contraintes du projet."'],
  // Line 294
  ["text: 'Les études peuvent concerner le résidentiel, les bâtiments publics ou privés, les écoles, les lieux de culte et les projets de pompage solaire pour l'irrigation.'", 'text: "Les études peuvent concerner le résidentiel, les bâtiments publics ou privés, les écoles, les lieux de culte et les projets de pompage solaire pour l\'irrigation."'],
  // Line 314
  ["description: 'Une approche intégrée de l'agriculture et de l'élevage qui associe production, responsabilité et durabilité.'", 'description: "Une approche intégrée de l\'agriculture et de l\'élevage qui associe production, responsabilité et durabilité."'],
  // Line 316
  ["overview: 'La ferme agropastorale de SOUTARAH GROUP associe agriculture et élevage dans une logique de production durable. L'activité officielle privilégie des pratiques responsables, la qualité des produits, le respect des ressources naturelles et le bien-être animal.'", 'overview: "La ferme agropastorale de SOUTARAH GROUP associe agriculture et élevage dans une logique de production durable. L\'activité officielle privilégie des pratiques responsables, la qualité des produits, le respect des ressources naturelles et le bien-être animal."'],
  // Line 319
  ["text: 'Une production pensée dans le respect de l'environnement.'", 'text: "Une production pensée dans le respect de l\'environnement."'],
  // Line 332
  ["text: 'L'activité agricole officielle privilégie une production locale saine et des pratiques innovantes qui cherchent à préserver les ressources naturelles.'", 'text: "L\'activité agricole officielle privilégie une production locale saine et des pratiques innovantes qui cherchent à préserver les ressources naturelles."'],
  // Line 338
  ["text: 'L'élevage est présenté comme une activité respectueuse du bien-être animal, avec une attention portée à l'alimentation, aux conditions de vie et à la qualité des produits.'", 'text: "L\'élevage est présenté comme une activité respectueuse du bien-être animal, avec une attention portée à l\'alimentation, aux conditions de vie et à la qualité des produits."'],
  // Line 342
  ["process: ['Identifier le projet', 'Définir l'approche adaptée', 'Mettre en œuvre durablement', 'Suivre la production']", 'process: ["Identifier le projet", "Définir l\'approche adaptée", "Mettre en œuvre durablement", "Suivre la production"]'],
  // Line 354
  ["overview: 'L'offre immobilière officielle de SOUTARAH GROUP comprend le lotissement, la vente de terrains, la rénovation, les résidences meublées et la location de bureaux ou de locaux. Elle s'adresse aux projets résidentiels, commerciaux et d'investissement.'", 'overview: "L\'offre immobilière officielle de SOUTARAH GROUP comprend le lotissement, la vente de terrains, la rénovation, les résidences meublées et la location de bureaux ou de locaux. Elle s\'adresse aux projets résidentiels, commerciaux et d\'investissement."'],
  // Line 357
  ["text: 'Des solutions pensées pour l'accès, le confort et la valorisation.'", 'text: "Des solutions pensées pour l\'accès, le confort et la valorisation."'],
  // Line 365
  ["text: 'Des logements équipés pour s'installer confortablement.'", 'text: "Des logements équipés pour s\'installer confortablement."'],
  // Line 366
  ["text: 'Des espaces professionnels adaptés à l'activité de votre entreprise.'", 'text: "Des espaces professionnels adaptés à l\'activité de votre entreprise."'],
  // Line 372
  ["text: 'Les projets de lotissement et de vente de terrains sont conçus autour de parcelles aménagées, d'infrastructures utiles et d'emplacements stratégiques.'", 'text: "Les projets de lotissement et de vente de terrains sont conçus autour de parcelles aménagées, d\'infrastructures utiles et d\'emplacements stratégiques."'],
  // Line 373
  ["points: ['Terrains prêts à bâtir', 'Accès, eau et électricité selon le projet', 'Accompagnement jusqu'à l'acquisition']", 'points: ["Terrains prêts à bâtir", "Accès, eau et électricité selon le projet", "Accompagnement jusqu\'à l\'acquisition"]'],
  // Line 378
  ["text: 'L'offre officielle comprend la rénovation, les résidences meublées et les espaces de bureaux ou locaux, avec une recherche de confort et de fonctionnalité.'", 'text: "L\'offre officielle comprend la rénovation, les résidences meublées et les espaces de bureaux ou locaux, avec une recherche de confort et de fonctionnalité."'],
];

let count = 0;
for (const [search, replace] of replacements) {
  if (content.includes(search)) {
    content = content.replace(search, replace);
    count++;
  }
}

// Fix remaining "pràªt" -> "prêt" and "bien-àªtre" -> "bien-être"
content = content.replace(/pràªt/g, 'prêt');
content = content.replace(/bien-àªtre/g, 'bien-être');

fs.writeFileSync(filePath, content, 'utf8');
console.log(`✅ ${count} remplacements effectués dans servicesData.js`);