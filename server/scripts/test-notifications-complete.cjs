#!/usr/bin/env node
/**
 * Test complet : demande véhicule + vérification notification
 */

const http = require('http');

async function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Test complet des notifications\n');
  console.log('═══════════════════════════════════════\n');

  // Test 1: Créer demande véhicule
  console.log('📝 Test 1: Demande de véhicule');
  const vehicleData = {
    nom_vehicule: 'Mercedes G-Class',
    description: 'Pour un mariage le mois prochain',
    nom: 'Jean Kouassi',
    telephone: '0707070707',
    email: 'jean@test.com',
  };

  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/vehicle-requests',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(vehicleData)),
      },
    }, JSON.stringify(vehicleData));

    if (result.status === 201) {
      console.log('✅ Demande créée avec succès');
      console.log(`   ID: ${result.body.vehicleRequest?.id}`);
    } else {
      console.log('❌ Échec:', result.status, result.body);
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    console.log('\n💡 Assurez-vous que le serveur est démarré:');
    console.log('   cd server && npm run dev\n');
    process.exit(1);
  }

  // Attendre un peu pour que les notifications soient créées
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Vérifier les notifications
  console.log('\n📬 Test 2: Vérification des notifications');
  
  require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
  const { sequelize } = require('../src/models/index.cjs');
  
  try {
    await sequelize.authenticate();
    
    const [notifications] = await sequelize.query(`
      SELECT * FROM notifications 
      WHERE type = 'VEHICLE_REQUEST'
      ORDER BY cree_le DESC 
      LIMIT 1
    `);

    if (notifications.length > 0) {
      console.log('✅ Notification admin créée');
      console.log(`   Titre: ${notifications[0].titre}`);
      console.log(`   Message: ${notifications[0].message}`);
      console.log(`   Admin ID: ${notifications[0].utilisateur_destinataire_id}`);
    } else {
      console.log('❌ Aucune notification trouvée !');
      console.log('   Vérifiez les logs du serveur pour voir les erreurs');
    }

    // Compter toutes les notifications non lues
    const [count] = await sequelize.query(`
      SELECT COUNT(*) as total FROM notifications WHERE est_lu = false
    `);
    console.log(`\n📊 Total notifications non lues: ${count[0].total}`);

    await sequelize.close();
  } catch (error) {
    console.error('❌ Erreur base de données:', error.message);
  }

  console.log('\n═══════════════════════════════════════');
  console.log('✅ Tests terminés\n');
}

runTests();
