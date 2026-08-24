const mysql = require('mysql2/promise');
const { v4: uuid } = require('uuid');

async function fixRoles() {
  const c = await mysql.createConnection({
    host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'soutarah_group'
  });

  // 1. sorhodavid31 → ADMIN
  await c.query("UPDATE utilisateurs SET role='ADMIN' WHERE email='sorhodavid31@gmail.com'");
  console.log('✅ sorhodavid31@gmail.com → rôle ADMIN');

  // 2. Récupérer IDs utilisateurs
  const [users] = await c.query('SELECT id, email FROM utilisateurs');
  const david  = users.find(u => u.email === 'sorhodavid31@gmail.com');
  const sucafU = users.find(u => u.email === 'sucaf@gmail.com');

  // 3. Profil client David (PARTICULIER) si absent
  const [davidClients] = await c.query('SELECT id FROM clients WHERE utilisateur_id = ?', [david.id]);
  if (davidClients.length === 0) {
    await c.query(
      'INSERT INTO clients (id,utilisateur_id,type_client,prenom,nom,adresse,cree_le,mis_a_jour_le) VALUES (?,?,?,?,?,?,NOW(),NOW())',
      [uuid(), david.id, 'PARTICULIER', 'David', 'Sorho', 'Abidjan, Côte d\'Ivoire']
    );
    console.log('✅ Profil client David Sorho créé (PARTICULIER)');
  } else {
    console.log('ℹ️  Profil client David existe déjà');
  }

  // 4. Profil client ENTREPRISE_CLIENT pour sucaf
  const [sucafClients] = await c.query('SELECT id FROM clients WHERE utilisateur_id = ?', [sucafU.id]);
  let sucafClientId;
  if (sucafClients.length === 0) {
    sucafClientId = uuid();
    await c.query(
      'INSERT INTO clients (id,utilisateur_id,type_client,prenom,nom,adresse,cree_le,mis_a_jour_le) VALUES (?,?,?,?,?,?,NOW(),NOW())',
      [sucafClientId, sucafU.id, 'ENTREPRISE_CLIENT', null, null, 'Abidjan']
    );
    console.log('✅ Profil client sucaf créé (ENTREPRISE_CLIENT)');
  } else {
    sucafClientId = sucafClients[0].id;
    await c.query("UPDATE clients SET type_client='ENTREPRISE_CLIENT' WHERE utilisateur_id = ?", [sucafU.id]);
    console.log('✅ sucaf → ENTREPRISE_CLIENT (mis à jour), id=' + sucafClientId);
  }

  // 5. Créer l'entreprise SUCAF si absente
  const [ents] = await c.query('SELECT id FROM entreprises WHERE client_id = ?', [sucafClientId]);
  if (ents.length === 0) {
    await c.query(
      'INSERT INTO entreprises (id,client_id,nom,nom_responsable,numero_identification,cree_le,mis_a_jour_le) VALUES (?,?,?,?,?,NOW(),NOW())',
      [uuid(), sucafClientId, 'SUCAF', null, null]
    );
    console.log('✅ Entreprise SUCAF créée');
  } else {
    console.log('ℹ️  Entreprise SUCAF existe déjà');
  }

  // 6. Vérification finale
  const [check] = await c.query(`
    SELECT u.email, u.role, cl.type_client, e.nom AS entreprise
    FROM utilisateurs u
    LEFT JOIN clients cl ON cl.utilisateur_id = u.id
    LEFT JOIN entreprises e ON e.client_id = cl.id
    ORDER BY u.email
  `);
  console.log('\n=== ÉTAT FINAL DES COMPTES ===');
  check.forEach(r =>
    console.log(` ${r.email} | role: ${r.role} | type: ${r.type_client || '—'} | entreprise: ${r.entreprise || '—'}`)
  );

  await c.end();
}

fixRoles().catch(err => { console.error('❌', err.message); process.exit(1); });
