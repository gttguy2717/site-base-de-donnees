const fs = require('fs');
const path = require('path');
const { sequelize, Vehicle } = require('../src/models/index.cjs');

async function fixSpecificFallbacks() {
  await sequelize.authenticate();
  console.log('✅ Base de données connectée pour ajustements spécifiques.');

  const vehicles = await Vehicle.findAll();

  for (const veh of vehicles) {
    const name = `${veh.marque} ${veh.modele}`.toLowerCase();
    const cat = veh.categorie.toLowerCase();
    let correctImg = null;

    if (cat.includes('autocar') || name.includes('autocar') || name.includes('places') || name.includes('tourismo') || name.includes('irizar') || name.includes('lion') || name.includes('yutong') || name.includes('grandbird')) {
      correctImg = '/img/vehicles/h1ec.jpg';
    } else if (cat.includes('minibus') || name.includes('urvan') || name.includes('hiace') || name.includes('trafic') || name.includes('boxer') || name.includes('h350')) {
      if (name.includes('urvan')) correctImg = '/img/vehicles/urvan1.jpeg';
      else if (name.includes('transit')) correctImg = '/img/vehicles/ford1.jpg';
      else if (name.includes('sprinter')) correctImg = '/img/vehicles/mercedes_sprinter.jpg';
      else correctImg = '/img/vehicles/h1ec.jpg';
    } else if (cat.includes('utilitaire') || name.includes('daily') || name.includes('jumper') || name.includes('crafter') || name.includes('master')) {
      if (name.includes('jumper')) correctImg = '/img/vehicles/jumperav.jpeg';
      else if (name.includes('master')) correctImg = '/img/vehicles/renault_master.jpg';
      else if (name.includes('crafter')) correctImg = '/img/vehicles/vw_crafter.jpg';
      else if (name.includes('sprinter')) correctImg = '/img/vehicles/mercedes_sprinter.jpg';
      else if (name.includes('partner')) correctImg = '/img/vehicles/peugeot_partner.jpg';
      else if (name.includes('berlingo')) correctImg = '/img/vehicles/citroen_berlingo.jpg';
      else if (name.includes('doblo')) correctImg = '/img/vehicles/fiat_doblo.jpg';
      else if (name.includes('kangoo')) correctImg = '/img/vehicles/renault_kangoo.jpg';
      else correctImg = '/img/vehicles/ford1.jpg';
    } else if (cat.includes('pick-up') || name.includes('tunland') || name.includes('rich') || name.includes('pik up') || name.includes('p-series') || name.includes('jac') || name.includes('oroch')) {
      if (name.includes('oroch')) correctImg = '/img/vehicles/orochav.jpeg';
      else if (name.includes('hilux')) correctImg = '/img/vehicles/toyota_hilux.jpg';
      else if (name.includes('ranger')) correctImg = '/img/vehicles/ford_ranger.jpg';
      else if (name.includes('navara')) correctImg = '/img/vehicles/nissan_navara.jpg';
      else if (name.includes('l200')) correctImg = '/img/vehicles/l200av.jpg';
      else if (name.includes('d-max')) correctImg = '/img/vehicles/dmaxav.png';
      else correctImg = '/img/vehicles/toyota_hilux.jpg';
    } else if (name.includes('prado')) {
      correctImg = '/img/vehicles/prado.jpg';
    } else if (name.includes('mu-x') || (cat.includes('4x4') && veh.image_url.includes('duster'))) {
      correctImg = '/img/vehicles/pajero_sport.jpg';
    }

    if (correctImg && veh.image_url !== correctImg) {
      await veh.update({ image_url: correctImg });
      console.log(`  ✓ Corrigé: [${veh.categorie}] ${veh.marque} ${veh.modele} => ${correctImg}`);
    }
  }

  // Synchroniser servicesData.js
  const servicesDataPath = path.join(__dirname, '../../src/data/servicesData.js');
  let content = fs.readFileSync(servicesDataPath, 'utf8');

  content = content.replace(/name:\s*'Ford Transit 9 Places'[\s\S]*?image:\s*['"][^'"]+['"]/g, "name: 'Ford Transit 9 Places', plate: 'Partenaire', pricePerDay: 70000, tariffs: { abidjan: { withDriver: 70000, withoutDriver: null }, zone240: { withDriver: 80850, withoutDriver: null }, zone405: { withDriver: 88935, withoutDriver: 95000 }, zone800: { withDriver: 97829, withoutDriver: null } }, image: '/img/vehicles/ford1.jpg'");
  content = content.replace(/name:\s*'Toyota Hiace 15 Places'[\s\S]*?image:\s*['"][^'"]+['"]/g, "name: 'Toyota Hiace 15 Places', plate: 'Partenaire', pricePerDay: 90000, tariffs: { abidjan: { withDriver: 90000, withoutDriver: null }, zone240: { withDriver: 103950, withoutDriver: null }, zone405: { withDriver: 114345, withoutDriver: 135000 }, zone800: { withDriver: 125780, withoutDriver: null } }, image: '/img/vehicles/h1ec.jpg'");
  content = content.replace(/name:\s*'Hyundai 20 Places'[\s\S]*?image:\s*['"][^'"]+['"]/g, "name: 'Hyundai 20 Places', plate: 'Partenaire', pricePerDay: 110000, tariffs: { abidjan: { withDriver: 110000, withoutDriver: null }, zone240: { withDriver: 127050, withoutDriver: null }, zone405: { withDriver: 139755, withoutDriver: 145000 }, zone800: { withDriver: 153731, withoutDriver: null } }, image: '/img/vehicles/h1ec.jpg'");
  content = content.replace(/name:\s*'Hyundai 28 Places'[\s\S]*?image:\s*['"][^'"]+['"]/g, "name: 'Hyundai 28 Places', plate: 'Partenaire', pricePerDay: 125000, tariffs: { abidjan: { withDriver: 125000, withoutDriver: null }, zone240: { withDriver: 144375, withoutDriver: null }, zone405: { withDriver: 158813, withoutDriver: 160000 }, zone800: { withDriver: 174694, withoutDriver: null } }, image: '/img/vehicles/h1ec.jpg'");
  content = content.replace(/name:\s*'Hyundai 32 Places'[\s\S]*?image:\s*['"][^'"]+['"]/g, "name: 'Hyundai 32 Places', plate: 'Partenaire', pricePerDay: 135000, tariffs: { abidjan: { withDriver: 135000, withoutDriver: null }, zone240: { withDriver: 155925, withoutDriver: null }, zone405: { withDriver: 171518, withoutDriver: 185000 }, zone800: { withDriver: 188669, withoutDriver: null } }, image: '/img/vehicles/h1ec.jpg'");

  fs.writeFileSync(servicesDataPath, content, 'utf8');
  console.log('✅ Finalisation réussie !');
  process.exit(0);
}

fixSpecificFallbacks().catch(err => {
  console.error(err);
  process.exit(1);
});
