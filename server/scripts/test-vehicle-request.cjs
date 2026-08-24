#!/usr/bin/env node
/**
 * Script de test pour l'API de demande de véhicule
 * Usage: node scripts/test-vehicle-request.cjs
 */

const http = require('http');

const testData = {
  nom_vehicule: 'Toyota Land Cruiser V8',
  description: 'Besoin urgent pour un déplacement à l\'intérieur du pays, 7 jours',
  nom: 'Test Client',
  telephone: '0700000099',
  email: 'test@example.com',
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/vehicle-requests',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

console.log('🧪 Test de l\'API demande de véhicule...\n');
console.log('📤 Envoi de la requête:', testData);

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📥 Réponse reçue:');
    console.log('Status:', res.statusCode);
    
    try {
      const jsonData = JSON.parse(data);
      console.log('Body:', JSON.stringify(jsonData, null, 2));
      
      if (res.statusCode === 201) {
        console.log('\n✅ Test réussi ! La demande a été créée.');
        console.log('💡 Vérifiez que l\'admin a reçu une notification.');
      } else {
        console.log('\n⚠️ Réponse inattendue');
      }
    } catch (e) {
      console.log('Body:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Erreur:', error.message);
  console.error('\n💡 Vérifiez que le serveur est démarré (npm run dev)');
});

req.write(postData);
req.end();
