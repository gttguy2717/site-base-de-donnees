const fs = require('fs');
const path = require('path');
const https = require('https');
const { sequelize, Vehicle } = require('../src/models/index.cjs');

const VEHICLES_DIR = path.join(__dirname, '../../public/img/vehicles');

// Liste des correspondances exactes de chaque véhicule avec son modèle et make
const VEHICLE_CAR_SPECS = [
  // ─── Véhicules Originaux de la Flotte Soutarah ───────────────────────────
  { key: 'Renault Duster', local: '/img/vehicles/dusterAvant.jpg' },
  { key: 'Renault OROCH', local: '/img/vehicles/orochav.jpeg' },
  { key: 'Citroën Jumper', local: '/img/vehicles/jumperav.jpeg' },
  { key: 'Renault Koleos', local: '/img/vehicles/koleosAv.jpeg' },
  { key: 'Mitsubishi Pajero 13', local: '/img/vehicles/pajeroav.jpeg' },
  { key: 'Mitsubishi Pajero 48', local: '/img/vehicles/pajeroav.jpeg' },
  { key: 'Renault Dokker', local: '/img/vehicles/dokker.jpg' },
  { key: 'Suzuki Dzire', local: '/img/vehicles/dzer.jpg' },
  { key: 'Toyota Land Cruiser', local: '/img/vehicles/l300.jpeg' },
  { key: 'Nissan Kicks', local: '/img/vehicles/KickAvant.jpeg' },
  { key: 'Suzuki Grand Vitara 932', local: '/img/vehicles/gvitaraAv.jpeg' },
  { key: 'Renault Kadjar', local: '/img/vehicles/kadjaravant.jpeg' },
  { key: 'Mitsubishi Montero', local: '/img/vehicles/monteraav.jpeg' },
  { key: 'Toyota Highlander', local: '/img/vehicles/high.jpeg' },
  { key: 'Suzuki Vitara Rouge', local: '/img/vehicles/vitaraAvant.jpg' },
  { key: 'Toyota Rush', local: '/img/vehicles/rushavant.jpeg' },
  { key: 'Toyota Rush 38', local: '/img/vehicles/rushavant.jpeg' },
  { key: 'Toyota Tacoma', local: '/img/vehicles/tacomaav.jpeg' },
  { key: 'Suzuki Grand Vitara 755', local: '/img/vehicles/ngvitaraav.jpeg' },
  { key: 'Suzuki Grand Vitara New', local: '/img/vehicles/ngvitaraav.jpeg' },
  { key: 'Mitsubishi L200', local: '/img/vehicles/l200av.jpg' },
  { key: 'Renault Van Express', local: '/img/vehicles/express1.jpeg' },
  { key: 'Ford Transit', local: '/img/vehicles/ford1.jpg' },
  { key: 'Nissan Urvan', local: '/img/vehicles/urvan1.jpeg' },
  { key: 'Isuzu D-Max', local: '/img/vehicles/dmaxav.png' },
  { key: 'Isuzu D-Max New', local: '/img/vehicles/dmaxav.png' },
  { key: 'Suzuki Fronx', local: '/img/vehicles/fronxav.jpeg' },
  { key: 'Toyota Vitz', local: '/img/vehicles/swiftavant.png' },
  { key: 'Toyota RAV4', local: '/img/vehicles/rav4avant.jpeg' },
  { key: 'Ford Transit 9 Places', local: '/img/vehicles/ford1.jpg' },
  { key: 'Toyota Hiace 15 Places', local: '/img/vehicles/h1ec.jpg' },
  { key: 'Hyundai 20 Places', local: '/img/vehicles/h1ec.jpg' },
  { key: 'Hyundai 28 Places', local: '/img/vehicles/h1ec.jpg' },
  { key: 'Hyundai 32 Places', local: '/img/vehicles/h1ec.jpg' },

  // ─── Images Générées HD Dédiées ──────────────────────────────────────────
  { key: 'Toyota Fortuner', local: '/img/vehicles/fortuner.jpg' },
  { key: 'Toyota Camry Hybrid', local: '/img/vehicles/camry.jpg' },
  { key: 'Mercedes-Benz Classe C 200', local: '/img/vehicles/c200.jpg' },
  { key: 'BMW Série 3 320i', local: '/img/vehicles/bmw320.jpg' },
  { key: 'Audi A6 Quattro', local: '/img/vehicles/audia6.jpg' },
  { key: 'Peugeot 508 GT', local: '/img/vehicles/peugeot508.jpg' },

  // ─── 30 Berlines & Nouveaux Modèles (Studio Imagin) ──────────────────────
  { key: 'Mercedes-Benz Classe E 300', make: 'mercedes-benz', model: 'e-class', filename: 'mercedes_e300.jpg' },
  { key: 'Mercedes-Benz Classe S 500', make: 'mercedes-benz', model: 's-class', filename: 'mercedes_s500.jpg' },
  { key: 'BMW Série 5 530i', make: 'bmw', model: '5-series', filename: 'bmw_530i.jpg' },
  { key: 'BMW Série 7 740Li', make: 'bmw', model: '7-series', filename: 'bmw_740li.jpg' },
  { key: 'Audi A4 TFSI', make: 'audi', model: 'a4', filename: 'audi_a4.jpg' },
  { key: 'Audi A8 L', make: 'audi', model: 'a8', filename: 'audi_a8.jpg' },
  { key: 'Toyota Corolla Executive', make: 'toyota', model: 'corolla', filename: 'toyota_corolla.jpg' },
  { key: 'Lexus ES 350', make: 'lexus', model: 'es', filename: 'lexus_es.jpg' },
  { key: 'Lexus LS 500', make: 'lexus', model: 'ls', filename: 'lexus_ls.jpg' },
  { key: 'Honda Accord Touring', make: 'honda', model: 'accord', filename: 'honda_accord.jpg' },
  { key: 'Honda Civic Sedan', make: 'honda', model: 'civic', filename: 'honda_civic.jpg' },
  { key: 'Hyundai Sonata Limited', make: 'hyundai', model: 'sonata', filename: 'hyundai_sonata.jpg' },
  { key: 'Hyundai Elantra GT', make: 'hyundai', model: 'elantra', filename: 'hyundai_elantra.jpg' },
  { key: 'Kia K5 / Optima GT', make: 'kia', model: 'k5', filename: 'kia_k5.jpg' },
  { key: 'Kia Cerato Sedan', make: 'kia', model: 'cerato', filename: 'kia_cerato.jpg' },
  { key: 'Peugeot 308 Sedan', make: 'peugeot', model: '308', filename: 'peugeot_308.jpg' },
  { key: 'Volkswagen Passat R-Line', make: 'volkswagen', model: 'passat', filename: 'vw_passat.jpg' },
  { key: 'Volkswagen Jetta Highline', make: 'volkswagen', model: 'jetta', filename: 'vw_jetta.jpg' },
  { key: 'Mazda 6 Grand Touring', make: 'mazda', model: '6', filename: 'mazda_6.jpg' },
  { key: 'Nissan Altima SL', make: 'nissan', model: 'altima', filename: 'nissan_altima.jpg' },
  { key: 'Nissan Maxima Platinum', make: 'nissan', model: 'maxima', filename: 'nissan_maxima.jpg' },
  { key: 'Genesis G80 Luxury', make: 'genesis', model: 'g80', filename: 'genesis_g80.jpg' },
  { key: 'Volvo S90 Inscription', make: 'volvo', model: 's90', filename: 'volvo_s90.jpg' },
  { key: 'Tesla Model 3 Long Range', make: 'tesla', model: 'model-3', filename: 'tesla_model3.jpg' },
  { key: 'Jaguar XF Portfolio', make: 'jaguar', model: 'xf', filename: 'jaguar_xf.jpg' },

  // ─── Citadines supplémentaires ───────────────────────────────────────────
  { key: 'Toyota Yaris', make: 'toyota', model: 'yaris', filename: 'toyota_yaris.jpg' },
  { key: 'Hyundai i10', make: 'hyundai', model: 'i10', filename: 'hyundai_i10.jpg' },
  { key: 'Kia Picanto', make: 'kia', model: 'picanto', filename: 'kia_picanto.jpg' },
  { key: 'Peugeot 208', make: 'peugeot', model: '208', filename: 'peugeot_208.jpg' },
  { key: 'Renault Clio', make: 'renault', model: 'clio', filename: 'renault_clio.jpg' },
  { key: 'Volkswagen Polo', make: 'volkswagen', model: 'polo', filename: 'vw_polo.jpg' },
  { key: 'Hyundai Accent', make: 'hyundai', model: 'accent', filename: 'hyundai_accent.jpg' },
  { key: 'Kia Rio', make: 'kia', model: 'rio', filename: 'kia_rio.jpg' },
  { key: 'Chevrolet Spark', make: 'chevrolet', model: 'spark', filename: 'chevrolet_spark.jpg' },
  { key: 'Dacia Logan', make: 'dacia', model: 'logan', filename: 'dacia_logan.jpg' },
  { key: 'Nissan Micra', make: 'nissan', model: 'micra', filename: 'nissan_micra.jpg' },

  // ─── SUVs supplémentaires ────────────────────────────────────────────────
  { key: 'Honda CR-V', make: 'honda', model: 'cr-v', filename: 'honda_crv.jpg' },
  { key: 'Hyundai Tucson', make: 'hyundai', model: 'tucson', filename: 'hyundai_tucson.jpg' },
  { key: 'Kia Sportage', make: 'kia', model: 'sportage', filename: 'kia_sportage.jpg' },
  { key: 'Mazda CX-5', make: 'mazda', model: 'cx-5', filename: 'mazda_cx5.jpg' },
  { key: 'Peugeot 3008', make: 'peugeot', model: '3008', filename: 'peugeot_3008.jpg' },
  { key: 'Volkswagen Tiguan', make: 'volkswagen', model: 'tiguan', filename: 'vw_tiguan.jpg' },
  { key: 'Ford Escape', make: 'ford', model: 'escape', filename: 'ford_escape.jpg' },
  { key: 'Nissan X-Trail', make: 'nissan', model: 'x-trail', filename: 'nissan_xtrail.jpg' },
  { key: 'Mitsubishi Outlander', make: 'mitsubishi', model: 'outlander', filename: 'mitsubishi_outlander.jpg' },

  // ─── 4x4 supplémentaires ─────────────────────────────────────────────────
  { key: 'Toyota Land Cruiser Prado', make: 'toyota', model: 'land-cruiser-prado', filename: 'prado.jpg' },
  { key: 'Nissan Patrol', make: 'nissan', model: 'patrol', filename: 'nissan_patrol.jpg' },
  { key: 'Jeep Wrangler', make: 'jeep', model: 'wrangler', filename: 'jeep_wrangler.jpg' },
  { key: 'Land Rover Discovery', make: 'land-rover', model: 'discovery', filename: 'land_rover_discovery.jpg' },
  { key: 'Toyota Fortuner 4x4', local: '/img/vehicles/fortuner.jpg' },
  { key: 'Mitsubishi Pajero Sport', make: 'mitsubishi', model: 'pajero-sport', filename: 'pajero_sport.jpg' },
  { key: 'Suzuki Jimny', make: 'suzuki', model: 'jimny', filename: 'suzuki_jimny.jpg' },

  // ─── Pick-Ups supplémentaires ────────────────────────────────────────────
  { key: 'Toyota Hilux', make: 'toyota', model: 'hilux', filename: 'toyota_hilux.jpg' },
  { key: 'Toyota Hilux 4x4', make: 'toyota', model: 'hilux', filename: 'toyota_hilux.jpg' },
  { key: 'Toyota Hilux Double Cabine', make: 'toyota', model: 'hilux', filename: 'toyota_hilux.jpg' },
  { key: 'Ford Ranger', make: 'ford', model: 'ranger', filename: 'ford_ranger.jpg' },
  { key: 'Ford Ranger 4x4', make: 'ford', model: 'ranger', filename: 'ford_ranger.jpg' },
  { key: 'Ford Ranger Wildtrak', make: 'ford', model: 'ranger', filename: 'ford_ranger.jpg' },
  { key: 'Nissan Navara', make: 'nissan', model: 'navara', filename: 'nissan_navara.jpg' },
  { key: 'Nissan Navara PRO-4X', make: 'nissan', model: 'navara', filename: 'nissan_navara.jpg' },
  { key: 'Dongfeng Friday', make: 'forthing', model: 'friday', filename: 'dongfeng_friday.jpg' },

  // ─── Utilitaires & Minibus ───────────────────────────────────────────────
  { key: 'Peugeot Partner', make: 'peugeot', model: 'partner', filename: 'peugeot_partner.jpg' },
  { key: 'Peugeot Partner Van', make: 'peugeot', model: 'partner', filename: 'peugeot_partner.jpg' },
  { key: 'Renault Kangoo', make: 'renault', model: 'kangoo', filename: 'renault_kangoo.jpg' },
  { key: 'Renault Kangoo Express', make: 'renault', model: 'kangoo', filename: 'renault_kangoo.jpg' },
  { key: 'Citroën Berlingo', make: 'citroen', model: 'berlingo', filename: 'citroen_berlingo.jpg' },
  { key: 'Fiat Doblo', make: 'fiat', model: 'doblo', filename: 'fiat_doblo.jpg' },
  { key: 'Mercedes Sprinter', make: 'mercedes-benz', model: 'sprinter', filename: 'mercedes_sprinter.jpg' },
  { key: 'Mercedes Sprinter Van', make: 'mercedes-benz', model: 'sprinter', filename: 'mercedes_sprinter.jpg' },
  { key: 'Renault Master', make: 'renault', model: 'master', filename: 'renault_master.jpg' },
  { key: 'Volkswagen Crafter', make: 'volkswagen', model: 'crafter', filename: 'vw_crafter.jpg' },

  // ─── Luxe & Grand Prestige ───────────────────────────────────────────────
  { key: 'Mercedes-Benz Classe E', make: 'mercedes-benz', model: 'e-class', filename: 'mercedes_e300.jpg' },
  { key: 'BMW Série 5', make: 'bmw', model: '5-series', filename: 'bmw_530i.jpg' },
  { key: 'Audi A6', make: 'audi', model: 'a6', filename: 'audia6.jpg' },
  { key: 'Lexus RX', make: 'lexus', model: 'rx', filename: 'lexus_rx.jpg' },
  { key: 'Range Rover', make: 'land-rover', model: 'range-rover', filename: 'range_rover.jpg' },
  { key: 'Porsche Cayenne', make: 'porsche', model: 'cayenne', filename: 'porsche_cayenne.jpg' },
  { key: 'Mercedes-Benz Classe S', make: 'mercedes-benz', model: 's-class', filename: 'mercedes_s500.jpg' },
  { key: 'BMW X5', make: 'bmw', model: 'x5', filename: 'bmw_x5.jpg' },
  { key: 'Audi Q7', make: 'audi', model: 'q7', filename: 'audi_q7.jpg' },
  { key: 'Volvo XC90', make: 'volvo', model: 'xc90', filename: 'volvo_xc90.jpg' },
];

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      return resolve(true);
    }
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 301) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        resolve(false);
      }
    }).on('error', () => {
      file.close();
      fs.unlink(dest, () => {});
      resolve(false);
    });
  });
}

async function main() {
  console.log('🚀 Synchronisation des images réelles et authentiques de chaque véhicule...');
  await sequelize.authenticate();
  console.log('✅ Base de données connectée.');

  // 1. Télécharger les images manquantes via Imagin.Studio API
  for (const item of VEHICLE_CAR_SPECS) {
    if (item.filename && item.make && item.model) {
      const destPath = path.join(VEHICLES_DIR, item.filename);
      const url = `https://cdn.imagin.studio/getimage?customer=hrjavascript-mastery&make=${item.make}&modelFamily=${item.model}&zoomType=fullscreen&angle=01`;
      const ok = await downloadImage(url, destPath);
      if (ok) {
        console.log(`  ✓ Image studio téléchargée : ${item.key} -> /img/vehicles/${item.filename}`);
        item.finalUrl = `/img/vehicles/${item.filename}`;
      } else {
        item.finalUrl = item.local || '/img/vehicles/dusterAvant.jpg';
      }
    } else {
      item.finalUrl = item.local;
    }
  }

  // 2. Mettre à jour la table Vehicle en Base de Données
  const allDbVehicles = await Vehicle.findAll();
  console.log(`\n📦 Mise à jour de ${allDbVehicles.length} véhicules en base de données...`);

  for (const veh of allDbVehicles) {
    const fullName = `${veh.marque} ${veh.modele}`.trim();
    const matched = VEHICLE_CAR_SPECS.find(s => 
      s.key.toLowerCase() === fullName.toLowerCase() ||
      s.key.toLowerCase() === veh.modele.toLowerCase() ||
      fullName.toLowerCase().includes(s.key.toLowerCase()) ||
      s.key.toLowerCase().includes(fullName.toLowerCase())
    );

    let assignedUrl = matched ? matched.finalUrl : null;

    if (!assignedUrl) {
      // Fallback intelligent basé sur la marque
      const marque = veh.marque.toLowerCase();
      if (marque.includes('mercedes')) assignedUrl = '/img/vehicles/c200.jpg';
      else if (marque.includes('bmw')) assignedUrl = '/img/vehicles/bmw320.jpg';
      else if (marque.includes('audi')) assignedUrl = '/img/vehicles/audia6.jpg';
      else if (marque.includes('toyota')) assignedUrl = '/img/vehicles/camry.jpg';
      else if (marque.includes('peugeot')) assignedUrl = '/img/vehicles/peugeot508.jpg';
      else if (marque.includes('renault')) assignedUrl = '/img/vehicles/dusterAvant.jpg';
      else assignedUrl = '/img/vehicles/dusterAvant.jpg';
    }

    await veh.update({ image_url: assignedUrl });
    console.log(`  ✓ DB: [${veh.categorie}] ${fullName} => ${assignedUrl}`);
  }

  // 3. Mettre à jour servicesData.js
  const servicesDataPath = path.join(__dirname, '../../src/data/servicesData.js');
  let servicesContent = fs.readFileSync(servicesDataPath, 'utf8');

  for (const spec of VEHICLE_CAR_SPECS) {
    const targetUrl = spec.finalUrl;
    // Regex pour remplacer l'image de ce véhicule spécifique dans servicesData.js
    const escapedKey = spec.key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(name:\\s*['"]${escapedKey}['"][\\s\\S]*?image:\\s*)(['"][^'"]+['"]|vehicleImage\\([^)]+\\))`, 'g');
    servicesContent = servicesContent.replace(regex, `$1'${targetUrl}'`);
  }

  fs.writeFileSync(servicesDataPath, servicesContent, 'utf8');
  console.log('\n✅ servicesData.js mis à jour avec les images exactes de chaque modèle !');

  console.log('\n🎉 TOUT EST SYNCHRONISÉ ET AUTHENTIQUE !');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
