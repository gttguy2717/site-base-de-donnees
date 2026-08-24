const { Sequelize } = require('sequelize');
const seq = new Sequelize('soutarah_group', 'root', '', {
  host: 'localhost', port: 3306, dialect: 'mysql', logging: false,
});

seq.authenticate().then(async () => {
  // Show current value
  const [[r]] = await seq.query(`SELECT id, address FROM clients`);
  console.log('ID     :', r.id);
  console.log('ACTUEL :', r.address);
  console.log('OCTETS :', Buffer.from(r.address || '', 'utf8').toString('hex'));

  // Directly set correct value
  await seq.query(
    `UPDATE clients SET address = 'Abidjan, Côte d''Ivoire' WHERE id = :id`,
    { replacements: { id: r.id } }
  );

  const [[r2]] = await seq.query(`SELECT address FROM clients WHERE id = :id`, { replacements: { id: r.id } });
  console.log('CORRIGÉ:', r2.address);
  await seq.close();
  console.log('\n✅ Adresse corrigée avec succès !');
}).catch(e => { console.error('❌', e.message); process.exit(1); });
