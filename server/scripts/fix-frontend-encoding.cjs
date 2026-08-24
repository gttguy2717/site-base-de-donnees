const fs = require('fs');
const path = require('path');

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
    .replace(/Ã\s/g, 'à')  // Ã followed by space (including non-breaking space)
    .replace(/Ã«/g, 'ë')
    .replace(/Ã®/g, 'î')
    .replace(/Ã»/g, 'û')
    .replace(/Ã§/g, 'ç')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã€/g, 'À')
    .replace(/Ã‡/g, 'Ç')
    .replace(/Ã¯/g, 'ï')
    .replace(/Ã¹/g, 'ù')
    .replace(/Ã¼/g, 'ü')
    .replace(/Ã¶/g, 'ö')
    .replace(/Å“/g, 'œ')
    .replace(/Â°/g, '°')
    .replace(/Ã/g, 'à');  // Any remaining Ã should be à
}

// Files to fix
const filesToFix = [
  'src/pages/ContactPage.jsx',
  'src/data/companyData.js',
  'src/data/servicesData.js',
];

let totalFixed = 0;

for (const filePath of filesToFix) {
  const fullPath = path.join(__dirname, '..', '..', filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Fichier introuvable: ${filePath}`);
    continue;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const fixed = cleanPartialFix(content);

  if (fixed !== content) {
    fs.writeFileSync(fullPath, fixed, 'utf8');
    totalFixed++;
    console.log(`✅ Corrigé: ${filePath}`);
  } else {
    console.log(`ℹ️  Aucun changement: ${filePath}`);
  }
}

console.log(`\n🎉 ${totalFixed} fichier(s) corrigé(s) avec succès !`);