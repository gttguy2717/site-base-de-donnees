// Regroupement des références « identiques mais caractéristiques différentes »
// du catalogue électrique en une seule fiche générique avec sélecteur de variantes.
//
// Principe : on extrait du nom de produit les caractéristiques variables
// (longueur, section, calibre, puissance, diamètre, tension, pôles, couleur),
// on les retire pour obtenir une « base » commune ; deux produits de la même
// catégorie partageant cette base (et différant par au moins une caractéristique)
// sont fusionnés en un seul article à variantes.

const AXIS_DEFS = [
  // Longueur : 100m, 50 M, 25m, 3m, 10 km… (« 4 mod » est exclu par l'assertion)
  { key: 'longueur', label: 'Longueur', re: /\d+(?:[.,]\d+)?\s*(?:km|ml|m)(?![a-zà-ÿ0-9])/gi },
  // Diamètre : Ø32 mm, D 63, D16, D 3x5, ICTA 32, 20 mm (≠ mm² → section)
  { key: 'diametre', label: 'Diamètre', re: /\bICTA\s*(?:[dD]\s*)?\d+(?:[.,]\d+)?|Ø\s*\d+(?:[.,]\d+)?(?:\s*[mM][mM])?|\bD\s*\d+(?:\s*[xX]\s*\d+(?:[.,]\d+)?)?(?=[\s,;.)]|$)|\b\d+(?:[.,]\d+)?\s*[mM][mM](?![²2])/g },
  // Section : 5G10², 4G16mm², 1G400 mm², 120mm², 2x1,5mm²
  { key: 'section', label: 'Section', re: /\d+(?:[.,]\d+)?\s*[gG]\s*\d+(?:[.,]\d+)?(?:\s*[mM][mM]\s*[²2]|\s*[²2])?(?:\s*[mM][mM])?|\d+(?:[.,]\d+)?\s*[xX]\s*\d+(?:[.,]\d+)?(?:\s*[mM][mM]\s*[²2])?|\d+(?:[.,]\d+)?\s*[mM][mM]\s*[²2]/g },
  // Puissance : 50W, 100 W
  { key: 'puissance', label: 'Puissance', re: /\d+(?:[.,]\d+)?\s*W(?![a-zà-ÿ])/g },
  // Température de couleur : 3000K, 4000K, 6500K
  { key: 'temperature', label: 'Température', re: /\d{4}\s*K(?![a-zà-ÿ])/g },
  // Calibre : 16A, 63 A (« 6kA » et « 4000K » sont exclus)
  { key: 'calibre', label: 'Calibre', re: /\d+(?:[.,]\d+)?\s*A(?![a-zà-ÿ])/g },
  // Sensibilité différentielle : 30mA, 300mA, 0,15mA
  { key: 'sensibilite', label: 'Sensibilité', re: /\d+(?:[.,]\d+)?\s*mA(?![a-zà-ÿ])/g },
  // Tension : 230V~, 250V, 200/250V, 380V~ à 415V~
  { key: 'tension', label: 'Tension', re: /\d{3}\s*\/\s*\d{3}\s*V~?|\d{3}\s*V~?/g },
  // Pôles : 1P+N, 2P, 3P+N+T, 3P+T
  { key: 'poles', label: 'Pôles', re: /\b[1-4][pP](?:\+[nN])?(?:\+[tT])?(?:\+[1-4][pP])?\b/g },
  // Couleur : blanc, noir, gris, gris foncé, gris clair, anthracite, vert…
  // (assertions unicode car « é » n'appartient pas à \w → \b échouerait)
  { key: 'couleur', label: 'Couleur', re: /(?:gris\s+(?:foncé|foncée|clair|claire)|anthracite|blanc(?:e)?|noir(?:e)?|gris(?:e)?|beige|inox|dor[ée]|marron|bleu(?:e)?|jaune|rouge|vert(?:e)?|violet(?:e)?|orange|rose)(?![a-zà-ÿ])/gi },
  // Conditionnement : couronne, rouleau, barre, sachet, le ML… (pas « boîte » :
  // « tube-boîte » / « boîte de dérivation » sont des types, pas des packagings)
  { key: 'conditionnement', label: 'Conditionnement', re: /\b(?:rouleaux?\s*\/\s*couronnes?|couronnes?\s*\/\s*rouleaux?|rouleaux?|couronnes?|barres?|sachets?|le\s+ml|ml)(?![a-zà-ÿ])/gi },
  // Codes conducteurs : N/M/G/B/VJ, B/N/M/B/VJ, M/B…
  { key: 'conducteurs', label: 'Conducteurs', re: /\b(?:[A-Za-z]{1,3}\/)+[A-Za-z]{1,3}\b/g },
  // Nombre de prises : 3 prises, 6 prises…
  { key: 'prises', label: 'Prises', re: /\b\d{1,2}\s*prises?\b/gi },
  // Équipement des rallonges (catégorie limitée : « disjoncteur » y est un
  // accessoire, pas un type de produit) : parafoudre, USB, disjoncteur…
  { key: 'equipement', label: 'Équipement', re: /\b(?:USB\s*Type-A\s*\+\s*Type-C|USB|parafoudre|disjoncteur|indicateur\s+charge|surface)(?![a-zà-ÿ])/gi, cats: ['rallonges'] },
];

// Codes référence en mot entier : MUR39101, ECPA03, HXB069H, NU7004PC, S525204,
// P17, U-1000, R2V… (commencent par ≤6 lettres suivies d'au moins un chiffre).
// « DNX³4500 » est conservé (³ hors classe → série conservée), les indices de
// protection IP/IK aussi, ainsi que les types de câble U-1000 / R2V / RO2V /
// HG1000 (désignations produit, pas des codes).
const CODE_TOKEN_RE = /(?<![A-Za-z0-9³²])(?!(?:IP|IK)\d)(?!(?:[uU]-1000|[rR]2[vV]|[rR][oO]2[vV]|[hH][gG]1000)\b)[A-Za-z]{1,6}-?\d+[A-Za-z0-9]*(?![A-Za-z0-9])/g;
// Nombre brut de 3+ chiffres isolé : 406780, 10043734, 603… (4000K / IP66 /
// DNX³4500 et « U-1000 » — chiffre rattaché à une lettre par un tiret — sont
// protégés par les assertions autour).
const BARE_NUMBER_RE = /(?<![A-Za-z0-9³²]|[A-Za-z]-)\d{3,}(?![A-Za-z0-9³²])/g;

function unique(values) {
  return [...new Set(values.map((v) => v.replace(/\s+/g, ' ').trim()).filter(Boolean))];
}

// Normalise les longueurs : « 100M » → « 100 m », « 25ml » → « 25 ml ».
function normalizeLength(value) {
  const m = value.match(/(\d+(?:[.,]\d+)?)\s*(km|ml|m)/i);
  if (!m) return value;
  return `${m[1]} ${m[2].toLowerCase()}`;
}

// Normalise les diamètres : « Ø32 mm » / « D 63 » / « ICTA 32 » / « D16 » →
// « 32 mm » ; « D 3x5 » → « 3 x 5 ».
function normalizeDiameter(value) {
  const x = value.match(/(\d+(?:[.,]\d+)?)\s*[xX]\s*(\d+(?:[.,]\d+)?)/);
  if (x) return `${x[1]} x ${x[2]}`;
  const n = value.match(/\d+(?:[.,]\d+)?/);
  return n ? `${n[0]} mm` : value;
}

// Normalise les conducteurs : « M/JV/B/N » → « B/M/N/VJ » (JV→VJ, tri, sans doublon).
function normalizeConductors(value) {
  const parts = value
    .split('/')
    .map((p) => p.trim().toUpperCase())
    .map((p) => (p === 'JV' ? 'VJ' : p));
  return [...new Set(parts)].sort().join('/');
}

// Normalise la tension : « 200/250 V~ » ≡ « 200V~ à 250V~ ».
function normalizeTension(value) {
  return value.replace(/(\d{3})\s*\/\s*(\d{3})\s*V~?/g, '$1V~ à $2V~');
}

function tidyValue(axisKey, rawValues) {
  let values = rawValues.map((v) => v.replace(/\s+/g, ' ').trim()).filter(Boolean);
  if (axisKey === 'longueur') values = values.map(normalizeLength);
  if (axisKey === 'diametre') values = values.map(normalizeDiameter);
  if (axisKey === 'calibre') values = values.map((v) => v.replace(/\s+/g, ''));
  if (axisKey === 'conducteurs') values = values.map(normalizeConductors);
  if (axisKey === 'tension') values = values.map(normalizeTension);
  if (axisKey === 'prises') values = values.map((v) => v.replace(/^(\d+)\s*prises?$/i, '$1 prises'));
  values = unique(values); // après normalisation : « 63 A » ≡ « 63A »
  if (axisKey === 'tension' && values.length > 1) return values.join(' à ');
  if (values.length > 1) return values.join(' + ');
  return values[0] || '';
}

// Retire la mention « Legrand » (marque) d'un nom de produit — exigé côté UI
// sur tous les articles. Les tirets orphelins sont réabsorbés.
export function stripLegrand(name) {
  let s = String(name || '');
  s = s.replace(/\s*[-–—]\s*\bLegrand\b\s*[-–—]\s*/gi, ' - '); // A - Legrand - B
  s = s.replace(/\s*[-–—]\s*\bLegrand\b(?=\s|$)/gi, ' - '); // A - Legrand
  s = s.replace(/\bLegrand\b\s*[-–—]\s*/gi, ''); // Legrand - B
  s = s.replace(/\bLegrand\b/gi, ' '); // Legrand nu
  return s.replace(/\s{2,}/g, ' ').replace(/\s+-\s+$/,'').trim();
}

// Retire les segments vides / symboles / prépositions orphelines en fin de
// segment après suppression des caractéristiques (« … nu de » → « … nu »).
const PREP_ONLY_RE = /^(?:de|du|des|à|au|aux|en|par|pour|sur|dans|le|la|les|l|et|ou|a)$/i;

function tidyBase(str) {
  const parts = stripLegrand(str)
    .replace(/([a-zà-ÿ])([A-Z])/g, '$1 $2') // affichage : « ProjecteurLED » → « Projecteur LED »
    .replace(/-{2,}/g, '-')
    .replace(/\s*,\s*(?:et|ou)\s+/gi, ' ') // reliquat « , et cordon »
    .replace(/\s*à\s+partir\s+de\s*\d*\s*quantités/gi, '')
    .replace(/(?:à\s+|avec\s+)?griffes(?:\s+montées)?/gi, '') // mention « à griffes » (pas de \b : échoue avant « à »)
    .replace(/\bDistingo\b/gi, '') // gamme Nexans → nom générique épuré
    .replace(/\b(?:de|du)\s+(?=avec\b)/gi, '') // « équipée de avec cordon »
    .split(/\s+-\s+/)
    .map((seg) => seg.replace(/\s{2,}/g, ' ').trim())
    .map((seg) => seg.replace(/^(?:et|ou)\s+/i, ''))
    .map((seg) => seg.replace(/\s+(?:de|du|des|à|au|aux|en|par|pour|sur|dans)$/i, ''))
    .map((seg) => seg.replace(/^[-–—/,\s]+|[-–—/,\s]+$/g, '').trim())
    .filter(
      (seg) =>
        seg.length >= 2 &&
        !PREP_ONLY_RE.test(seg) &&
        !/^[\d\s.,/°ØxX+(){}[\]-]+$/.test(seg) // reliquats « ( - ) », chiffres, ponctuation
    );
  return parts.join(' - ').replace(/\s{2,}/g, ' ').trim();
}

// Clé de regroupement canonique : insensible à la casse/accents, normalise
// « Schneider Electric », « type CA » → « type AC », JV → VJ, trie les jetons
// à l'intérieur des codes « M/JV/B/N » puis l'ensemble (ordre des mots libre).
function baseKey(display) {
  const tokens = display
    .replace(/([a-zà-ÿ])([A-Z])/g, '$1 $2') // « ProjecteurLED » → « Projecteur LED »
    .toLowerCase()
    .replace(/\bip\s+(\d)/g, 'ip$1') // « IP 66/67 » ≡ « IP66/67 »
    .replace(/\bik\s+(\d)/g, 'ik$1')
    .replace(/\bschneider(?:\s+electric)?\b/g, 'schneider electric')
    .replace(/\btype[\s-]*ca\b/g, 'type ac')
    .replace(/\bjv\b/g, 'vj')
    // Mots « bruit » retirés de la SEULE clé de regroupement (l'affichage du
    // nom générique les conserve) : rigide, cordon, avec, longueur, Pro, et/or…
    .replace(/\b(?:rigide|cordon|avec|longueur|pro|et|ou)\b/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((t) => (t.includes('/') ? t.split('/').sort().join('/') : t));
  return [...new Set(tokens)].sort().join(' ');
}

// Extrait les caractéristiques d'un nom et calcule la base générique.
export function analyzeProduct(product) {
  let rest = String(product.name || '');
  const chars = {};
  for (const def of AXIS_DEFS) {
    if (def.cats && !def.cats.includes(product.category)) continue;
    def.re.lastIndex = 0;
    const matches = rest.match(def.re);
    if (matches) {
      chars[def.key] = tidyValue(def.key, matches);
      rest = rest.replace(def.re, ' ');
    }
  }
  rest = rest.replace(CODE_TOKEN_RE, ' ').replace(BARE_NUMBER_RE, ' ');
  const display = tidyBase(rest);
  return { chars, base: display, key: baseKey(display) };
}

function sortValues(values) {
  return [...values].sort((a, b) => {
    const na = parseFloat(String(a).replace(',', '.'));
    const nb = parseFloat(String(b).replace(',', '.'));
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return String(a).localeCompare(String(b), 'fr');
  });
}


// Regroupe une liste de produits : renvoie des « items » d'affichage.
// item = { type: 'single', product } ou
//        { type: 'group', key, genericName, desc, image, category, axes, variants }
// Les produits émis ont leur nom assaini (sans « Legrand »).
export function groupProducts(products) {
  const analyzed = products.map((p) => ({ product: p, ...analyzeProduct(p) }));
  const sanitize = (p) => ({
    ...p,
    name: stripLegrand(p.name),
    desc: String(p.desc || '')
      .replace(/\s*Marque\s*:\s*Legrand\b\.?/gi, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim(),
  });

  // 1) Regroupement par catégorie + base générique.
  const buckets = new Map();
  for (const entry of analyzed) {
    const bucketKey = `${entry.product.category}::${entry.key}`;
    if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
    buckets.get(bucketKey).push(entry);
  }

  const items = [];
  for (const entries of buckets.values()) {
    if (entries.length < 2) {
      items.push({ type: 'single', product: sanitize(entries[0].product) });
      continue;
    }
    // 2) Axes qui varient réellement dans le groupe ('' = caractéristique
    // absente sur certaines variantes → option « Non précisé »).
    const axes = [];
    for (const def of AXIS_DEFS) {
      const values = sortValues([...new Set(entries.map((e) => e.chars[def.key] ?? ''))]);
      if (values.length >= 2) axes.push({ key: def.key, label: def.label, values });
    }
    if (axes.length === 0) {
      // Même base mais aucune caractéristique expliciable : on garde les produits
      // séparés (évite des doublons visuels identiques sans sélecteur possible),
      // sauf doublons exacts (même nom → une seule fiche).
      const seenNames = new Set();
      for (const entry of entries) {
        const name = stripLegrand(entry.product.name);
        if (seenNames.has(name)) continue;
        seenNames.add(name);
        items.push({ type: 'single', product: sanitize(entry.product) });
      }
      continue;
    }
    const first = entries[0];
    // Caractéristiques identiques pour TOUTES les variantes (16A, 6kA, 30mA…) :
    // conservées pour affichage (le nom générique ne les contient plus).
    const constants = {};
    for (const def of AXIS_DEFS) {
      const values = unique(entries.map((e) => e.chars[def.key] || '').filter(Boolean));
      if (values.length === 1 && entries.every((e) => e.chars[def.key])) {
        constants[def.key] = { label: def.label, value: values[0] };
      }
    }
    items.push({
      type: 'group',
      key: `${first.product.category}::${first.key}`,
      genericName: first.base,
      desc: sanitize(first.product).desc,
      image: first.product.image || '',
      category: first.product.category,
      axes,
      constants,
      variants: entries.map((e) => ({ product: sanitize(e.product), chars: e.chars })),
    });
  }

  // 3) Conserve l'ordre d'origine du catalogue (premier produit de chaque item).
  const order = new Map(products.map((p, i) => [p.id, i]));
  items.sort((a, b) => {
    const idA = a.type === 'single' ? a.product.id : a.variants[0].product.id;
    const idB = b.type === 'single' ? b.product.id : b.variants[0].product.id;
    return (order.get(idA) ?? 0) - (order.get(idB) ?? 0);
  });
  return items;
}

// Résumé « Longueur : 100 m · Section : 5G10² » d'une variante choisie.
export function variantSummary(group, chars) {
  return group.axes
    .map((axis) => (chars[axis.key] ? `${axis.label} : ${chars[axis.key]}` : null))
    .filter(Boolean)
    .join(' · ');
}
