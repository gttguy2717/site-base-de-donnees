const { sequelize } = require('../src/database/sequelize.cjs');

(async () => {
  try {
    console.log('=== Colonnes table entreprises ===');
    const [rows] = await sequelize.query('SHOW COLUMNS FROM entreprises');
    rows.forEach(r => console.log(' -', r.Field, '|', r.Type, '| NULL:', r.Null, '| DEFAULT:', r.Default));
    
    console.log('\n=== Tables disponibles ===');
    const [tables] = await sequelize.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'soutarah_group' ORDER BY TABLE_NAME"
    );
    tables.forEach(t => console.log(' -', t.TABLE_NAME));
    
    await sequelize.close();
    console.log('\n=== Test terminé ===');
  } catch (e) {
    console.error('ERREUR:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
})();
