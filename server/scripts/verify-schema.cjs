const sequelize = require('../src/database/sequelize.cjs');

async function verifySchema() {
  try {
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY table_name"
    );

    console.log('📋 TABLES DANS LA BASE MYSQL:');
    console.log(tables.map((row) => `  - ${row.table_name || row.TABLE_NAME}`).join('\n'));
    console.log(`\n✅ Total : ${tables.length} tables vérifiées avec succès !`);
  } finally {
    await sequelize.close();
  }
}

verifySchema().catch((error) => {
  console.error('❌ Erreur de vérification :', error.message);
  process.exitCode = 1;
});
