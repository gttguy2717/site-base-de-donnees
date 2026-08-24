const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'src', 'data', 'servicesData.js');
let content = fs.readFileSync(filePath, 'utf8');

// Fix remaining unescaped apostrophes in single-quoted strings
const replacements = [
  // Line 160
  ["overview: 'SOUTARAH GROUP propose des véhicules pour les besoins ponctuels, les missions de longue durée et les déplacements avec chauffeur. L'offre officielle met l'accent sur la fiabilité de la flotte, le confort et la sécurité des passagers.'", 'overview: "SOUTARAH GROUP propose des véhicules pour les besoins ponctuels, les missions de longue durée et les déplacements avec chauffeur. L\'offre officielle met l\'accent sur la fiabilité de la flotte, le confort et la sécurité des passagers."'],
  // Line 169
  ["{ icon: 'route', title: 'Mobilité d'entreprise', text: 'Des véhicules disponibles pour vos équipes, missions et déplacements réguliers.', image: officialImage('KickAvant.jpeg'), alt: 'SUV de location Soutarah Group' }", '{ icon: \'route\', title: "Mobilité d\'entreprise", text: \'Des véhicules disponibles pour vos équipes, missions et déplacements réguliers.\', image: officialImage(\'KickAvant.jpeg\'), alt: \'SUV de location Soutarah Group\' }'],
  // Line 176
  ["text: 'L'offre officielle met en avant une expérience de location pensée pour rendre chaque trajet plus agréable.'", 'text: "L\'offre officielle met en avant une expérience de location pensée pour rendre chaque trajet plus agréable."'],
  // Line 286
  ["{ icon: 'inventory', title: 'Vente d'équipements', text: \"Des équipements photovoltaïques choisis pour les contraintes du projet.\", image: officialImage('vente-panneau.jpg'), alt: 'Panneaux solaires' }", '{ icon: \'inventory\', title: "Vente d\'équipements", text: "Des équipements photovoltaïques choisis pour les contraintes du projet.", image: officialImage(\'vente-panneau.jpg\'), alt: \'Panneaux solaires\' }'],
  // Line 316
  ["overview: 'La ferme agropastorale de SOUTARAH GROUP associe agriculture et élevage dans une logique de production durable. L'activité officielle privilégie des pratiques responsables, la qualité des produits, le respect des ressources naturelles et le bien-être animal.'", 'overview: "La ferme agropastorale de SOUTARAH GROUP associe agriculture et élevage dans une logique de production durable. L\'activité officielle privilégie des pratiques responsables, la qualité des produits, le respect des ressources naturelles et le bien-être animal."'],
  // Line 338
  ["text: 'L'élevage est présenté comme une activité respectueuse du bien-être animal, avec une attention portée à l'alimentation, aux conditions de vie et à la qualité des produits.'", 'text: "L\'élevage est présenté comme une activité respectueuse du bien-être animal, avec une attention portée à l\'alimentation, aux conditions de vie et à la qualité des produits."'],
  // Line 373
  ["points: ['Terrains prêts à bâtir', 'Accès, eau et électricité selon le projet', 'Accompagnement jusqu'à l'acquisition']", 'points: ["Terrains prêts à bâtir", "Accès, eau et électricité selon le projet", "Accompagnement jusqu\'à l\'acquisition"]'],
];

let count = 0;
for (const [search, replace] of replacements) {
  if (content.includes(search)) {
    content = content.replace(search, replace);
    count++;
  }
}

// Fix remaining "bien-àªtre" -> "bien-être"
content = content.replace(/bien-àªtre/g, 'bien-être');

fs.writeFileSync(filePath, content, 'utf8');
console.log(`✅ ${count} remplacements effectués dans servicesData.js`);