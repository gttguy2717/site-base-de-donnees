/**
 * Génère le SQL de purge de la flotte, à partir du catalogue source unique.
 *   node server/scripts/generate-sql-flotte-officielle.cjs
 * Sortie : soutarah_flotte_officielle.sql
 *
 * ⚠️ Équivalent SQL de `clean-vehicle-catalog.cjs --restore`, qui reste la
 * méthode recommandée : le script applicatif filtre les dépendances en base
 * réelle. Ce fichier SQL est un secours / une trace de l'opération.
 */
const fs = require('fs');
const path = require('path');
const { estDansLaFlotte } = require('../src/services/flotte-officielle.service.cjs');
const { VEHICULES } = require('./catalog-data/catalogue-trip.cjs');

const q = (v) => `'${String(v).replace(/'/g, "''")}'`;
const AUTOCARS = [25, 32];

const lignes = VEHICULES
  .filter((v) => !estDansLaFlotte(v))
  .map((v) => `  (${q(v.marque)}, ${q(v.modele)})`);

const sql = `-- ============================================================================
--  SOUTARAH — SUPPRESSION DES VEHICULES HORS FLOTTE OFFICIELLE
--  Généré le ${new Date().toISOString().slice(0, 10)}
--
--  Les véhicules listés ci-dessous ne font PAS partie de la flotte validée
--  par le client : ils sont SUPPRIMÉS de la base.
--
--  Les autocars de ${AUTOCARS.join(' et ')} places sont volontairement conservés.
--
--  ⚠️ Les clés étrangères sont en RESTRICT sur articles_panier et reservations :
--  l'ordre des opérations ci-dessous est impératif. Un véhicule portant une
--  réservation n'est jamais supprimé (historique commercial) — il est seulement
--  neutralisé, ce qui le retire du site et de l'application.
--
--  Méthode recommandée : node server/scripts/clean-vehicle-catalog.cjs --restore
--
--  Import :  mysql -u <user> -p <base> < ce fichier
-- ============================================================================

SET NAMES utf8mb4;

-- 1. Lignes de panier portant un véhicule retiré (contrainte RESTRICT).
DELETE \`articles_panier\`
WHERE \`vehicule_id\` IN (
  SELECT \`id\` FROM (
    SELECT \`id\` FROM \`vehicules\`
    WHERE (\`marque\`, \`modele\`) IN (
${lignes.join(',\n')}
    )
  ) AS \`a_supprimer\`
);

-- 2. Suppression des véhicules hors flotte, en excluant ceux qui portent une
--    réservation : ceux-ci sont neutralisés à l'étape 3.
--    promotions et vehicule_prix_entreprises sont en ON DELETE CASCADE.
DELETE \`vehicules\`
WHERE (\`marque\`, \`modele\`) IN (
${lignes.join(',\n')}
)
  AND \`id\` NOT IN (SELECT \`vehicule_id\` FROM \`reservations\`);

-- 3. Véhicules hors flotte encore réservés : retirés de la vente, conservés.
UPDATE \`vehicules\`
SET \`statut\` = 'INACTIVE', \`disponibilite\` = 0, \`mis_a_jour_le\` = NOW()
WHERE (\`marque\`, \`modele\`) IN (
${lignes.join(',\n')}
);

-- 4. La liste du client fait foi : réactivation de la flotte officielle.
UPDATE \`vehicules\`
SET \`statut\` = 'ACTIVE', \`disponibilite\` = 1, \`mis_a_jour_le\` = NOW()
WHERE \`places\` NOT IN (${AUTOCARS.join(', ')});

-- Contrôle : doit renvoyer uniquement les véhicules de la flotte officielle.
SELECT \`marque\`, \`modele\`, \`places\`
FROM \`vehicules\`
WHERE \`statut\` = 'ACTIVE' AND \`disponibilite\` = 1
ORDER BY \`marque\`, \`modele\`;
`;

const out = path.resolve(__dirname, '../../soutarah_flotte_officielle.sql');
fs.writeFileSync(out, sql, 'utf8');
console.log(`✅ ${lignes.length} véhicule(s) hors flotte → ${out}`);
console.log(`   (${(sql.length / 1024).toFixed(1)} Ko)`);
