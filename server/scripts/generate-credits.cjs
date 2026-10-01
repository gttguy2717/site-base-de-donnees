/**
 * Genere CREDITS_COMMONS.md : attributions obligatoires des photos libres
 * (licences CC BY / CC BY-SA exigent la mention de l'auteur et de la licence).
 *   node server/scripts/generate-credits.cjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const SRC = path.join(ROOT, 'tmp_commons_credits.json');
const OUT = path.join(ROOT, 'CREDITS_COMMONS.md');

if (!fs.existsSync(SRC)) {
  console.error('Fichier tmp_commons_credits.json introuvable — lancez download_commons_images.py');
  process.exit(1);
}
const credits = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const rows = Object.entries(credits)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([file, c]) => `| \`${file}\` | ${c.marque} ${c.modele} | ${c.auteur} | ${c.licence} | [source](${c.url}) |`);

const md = `# Crédits photos — Catalogue véhicules SOUTARAH

Les ${Object.keys(credits).length} photos de véhicules de ce catalogue proviennent de
**Wikimedia Commons** et sont sous licence libre (CC0 / CC BY / CC BY-SA).
Elles ont été téléchargées localement dans \`public/img/vehicles/\` : aucun
hotlinking externe, aucune image sous droits de Trip.com.

Les licences **CC BY** et **CC BY-SA** imposent de citer l'auteur et la licence :
ce fichier satisfait cette obligation. Toute redistribution doit conserver ces
crédits (notamment la clause de partage à l'identique pour CC BY-SA).

| Fichier | Véhicule | Auteur | Licence | Source |
|---|---|---|---|---|
${rows.join('\n')}

---

_Vérifié le ${new Date().toISOString().slice(0, 10)} — généré par \`server/scripts/generate-credits.cjs\`._
`;

fs.writeFileSync(OUT, md, 'utf8');
console.log(`✅ ${Object.keys(credits).length} attributions → ${OUT}`);
