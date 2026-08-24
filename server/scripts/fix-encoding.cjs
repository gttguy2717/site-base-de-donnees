const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('soutarah_group', 'root', '', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  logging: false,
});

// Fix mojibake: each character that was misread as Latin-1 instead of UTF-8
function fixMojibake(str) {
  if (!str) return str;
  try {
    const fixed = Buffer.from(str, 'latin1').toString('utf8');
    return fixed;
  } catch {
    return str;
  }
}

// Also fix partially-fixed strings that still contain artifacts
function cleanPartialFix(str) {
  if (!str) return str;
  return str
    .replace(/d\s*["'"']\s*Ivoire/gi, "d'Ivoire")
    .replace(/Côte d[^\w]Ivoire/gi, "Côte d'Ivoire")
    .replace(/\uFFFD/g, "'")    // replacement character -> apostrophe
    .replace(/â€™/g, "'")
    .replace(/â€˜/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/Ã©/g, 'é')
    .replace(/Ã¨/g, 'è')
    .replace(/Ã´/g, 'ô')
    .replace(/Ã¢/g, 'â')
    .replace(/Ã /g, 'à')
    .replace(/Ã«/g, 'ë')
    .replace(/Ã®/g, 'î')
    .replace(/Ã»/g, 'û')
    .replace(/Ã§/g, 'ç')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã€/g, 'À')
    .replace(/Ã‡/g, 'Ç');
}

async function fixAll() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion MySQL OK\n');

    // --- Fix clients.address, firstName, lastName ---
    const [clients] = await sequelize.query(
      'SELECT id, address, "firstName", "lastName" FROM clients'
    );
    console.log(`📋 ${clients.length} clients trouvés`);

    for (const c of clients) {
      const updates = {};
      for (const col of ['address', 'firstName', 'lastName']) {
        if (c[col]) {
          const cleaned = cleanPartialFix(c[col]);
          if (cleaned !== c[col]) {
            updates[col] = cleaned;
            console.log(`  🔧 clients.${col} [${c.id}]`);
            console.log(`     AVANT : ${c[col]}`);
            console.log(`     APRÈS : ${cleaned}`);
          }
        }
      }
      if (Object.keys(updates).length > 0) {
        const setClauses = Object.keys(updates)
          .map((k) => `"${k}" = :${k}`)
          .join(', ');
        await sequelize.query(
          `UPDATE clients SET ${setClauses} WHERE id = :id`,
          { replacements: { ...updates, id: c.id } }
        );
      }
    }

    // --- Fix companies ---
    const [companies] = await sequelize.query(
      'SELECT id, name, "responsibleName" FROM companies'
    );
    console.log(`\n📋 ${companies.length} entreprises trouvées`);

    for (const co of companies) {
      const updates = {};
      for (const col of ['name', 'responsibleName']) {
        if (co[col]) {
          const cleaned = cleanPartialFix(co[col]);
          if (cleaned !== co[col]) {
            updates[col] = cleaned;
            console.log(`  🔧 companies.${col} [${co.id}]`);
            console.log(`     AVANT : ${co[col]}`);
            console.log(`     APRÈS : ${cleaned}`);
          }
        }
      }
      if (Object.keys(updates).length > 0) {
        const setClauses = Object.keys(updates)
          .map((k) => `"${k}" = :${k}`)
          .join(', ');
        await sequelize.query(
          `UPDATE companies SET ${setClauses} WHERE id = :id`,
          { replacements: { ...updates, id: co.id } }
        );
      }
    }

    // --- Verify result ---
    const [[result]] = await sequelize.query(
      'SELECT address FROM clients LIMIT 1'
    );
    console.log(`\n✅ Vérification finale — adresse : ${result?.address}`);

    await sequelize.close();
    console.log('\n🎉 Correction terminée avec succès !');
  } catch (err) {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
  }
}

fixAll();
