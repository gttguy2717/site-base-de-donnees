/**
 * Script d'import: PostgreSQL dump → MySQL
 * Lit soutarah_db.sql et insère toutes les données dans soutarah_group MySQL
 */
require('dotenv').config();
const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

const DUMP_FILE = path.join(__dirname, '../../soutarah_db.sql');

// ─── Config MySQL ─────────────────────────────────────────────────────────────
const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'soutarah_group',
  charset: 'utf8mb4',
  multipleStatements: true,
};

// ─── Parse COPY blocks du dump PG → INSERT MySQL ─────────────────────────────
function parseCopyBlock(tableName, columns, rows) {
  const inserts = [];
  for (const row of rows) {
    if (!row.trim() || row === '\\.') continue;
    // Découpe la ligne par TAB, gère \N = NULL
    const values = row.split('\t').map((val) => {
      if (val === '\\N') return 'NULL';
      // Échappe les quotes et backslashes pour MySQL
      const escaped = val
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
      return `'${escaped}'`;
    });
    inserts.push(`INSERT IGNORE INTO \`${tableName}\` (${columns.map(c => `\`${c}\``).join(', ')}) VALUES (${values.join(', ')});`);
  }
  return inserts;
}

async function importData() {
  console.log('📖 Lecture du dump PostgreSQL...');
  const content = fs.readFileSync(DUMP_FILE, 'utf8');
  const lines = content.split('\n');

  // ─── Extraire tous les blocs COPY ───────────────────────────────────────────
  const copyBlocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    // COPY public.table_name (col1, col2) FROM stdin;
    const copyMatch = line.match(/^COPY public\."?([^"(]+)"?\s+\(([^)]+)\)\s+FROM stdin;/);
    if (copyMatch) {
      const tableName = copyMatch[1].trim();
      const columns = copyMatch[2].split(',').map((c) => c.trim());
      const rows = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '\\.') {
        rows.push(lines[i]);
        i++;
      }
      copyBlocks.push({ tableName, columns, rows });
    }
    i++;
  }

  console.log(`✅ ${copyBlocks.length} tables trouvées dans le dump.`);

  // ─── Ordre d'insertion (respecter les FK) ───────────────────────────────────
  const TABLE_ORDER = [
    'SequelizeMeta',
    'utilisateurs',
    'clients',
    'entreprises',
    'categories',
    'produits',
    'tarifs',
    'vehicules',
    'vehicule_prix_entreprises',
    'paniers',
    'articles_panier',
    'devis',
    'articles_devis',
    'reservations',
    'notifications',
    'demandes_devis',
    'demandes_produits',
    'demandes_vehicules',
    'mouvements_stock',
    'promotions',
    'parametres',
  ];

  // Trier les blocs selon l'ordre défini
  copyBlocks.sort((a, b) => {
    const ia = TABLE_ORDER.indexOf(a.tableName);
    const ib = TABLE_ORDER.indexOf(b.tableName);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  // ─── Connexion MySQL ─────────────────────────────────────────────────────────
  console.log('\n🔌 Connexion MySQL...');
  const conn = await mysql.createConnection(DB_CONFIG);
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  await conn.query('SET NAMES utf8mb4');

  let totalInserted = 0;
  let totalErrors = 0;

  // ─── Import table par table ──────────────────────────────────────────────────
  for (const { tableName, columns, rows } of copyBlocks) {
    if (rows.length === 0) {
      console.log(`  ⏭  ${tableName} (vide)`);
      continue;
    }

    const inserts = parseCopyBlock(tableName, columns, rows);
    let blockInserted = 0;
    let blockErrors = 0;

    process.stdout.write(`  📥 ${tableName} (${inserts.length} lignes)... `);

    for (const sql of inserts) {
      try {
        await conn.query(sql);
        blockInserted++;
      } catch (err) {
        blockErrors++;
        if (blockErrors === 1) {
          // Affiche seulement la première erreur par table pour ne pas spammer
          console.log(`\n     ⚠️  Err: ${err.message.substring(0, 120)}`);
        }
      }
    }

    totalInserted += blockInserted;
    totalErrors += blockErrors;
    console.log(`✅ ${blockInserted}/${inserts.length} insérés${blockErrors > 0 ? ` (${blockErrors} ignorés)` : ''}`);
  }

  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  await conn.end();

  console.log('\n════════════════════════════════════════');
  console.log(`✅ Import terminé !`);
  console.log(`   Lignes insérées : ${totalInserted}`);
  console.log(`   Lignes ignorées : ${totalErrors} (doublons ou contraintes)`);
  console.log('════════════════════════════════════════');
}

importData().catch((err) => {
  console.error('❌ Erreur fatale:', err.message);
  process.exit(1);
});
