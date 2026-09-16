const fs = require('fs');
const path = require('path');
const { sequelize, Vehicle, Reservation } = require('../src/models/index.cjs');

async function cleanVehicleCatalog() {
  await sequelize.authenticate();
  const vehicles = await Vehicle.findAll({ order: [['cree_le', 'ASC']] });
  const seenImages = new Set();
  const seenHashes = new Set();
  const invalidVehicles = vehicles.filter((vehicle) => {
    const image = vehicle.image_url || '';
    const localPath = image.startsWith('/img/') ? path.resolve(__dirname, '../..', 'public', image.slice(1)) : '';
    let hash = '';
    if (localPath && fs.existsSync(localPath)) hash = require('crypto').createHash('sha256').update(fs.readFileSync(localPath)).digest('hex');
    const invalid = !image.startsWith('/img/vehicles/') || !fs.existsSync(localPath) || seenImages.has(image) || seenHashes.has(hash);
    if (!invalid) { seenImages.add(image); seenHashes.add(hash); }
    return invalid;
  });

  for (const vehicle of invalidVehicles) {
    const reservationCount = await Reservation.count({ where: { vehicule_id: vehicle.id } });
    if (reservationCount > 0) await vehicle.update({ disponibilite: false, statut: 'INACTIVE' });
    else await vehicle.destroy();
  }

  console.log(`Catalogue nettoyé : ${invalidVehicles.length} fiche(s) traitée(s), ${vehicles.length - invalidVehicles.length} conservée(s).`);
  await sequelize.close();
}

cleanVehicleCatalog().catch((error) => {
  console.error('Nettoyage impossible :', error.message);
  process.exitCode = 1;
});
