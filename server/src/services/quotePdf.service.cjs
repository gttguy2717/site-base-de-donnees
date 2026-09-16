const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

// ─── Calculs officiels SOUTARAH (identiques à src/lib/quoteTotals.js) ───────
const TVA_RATE = 0.18;
const TDT_RATE = 0.025; // Taxe de Développement Territorial — uniquement véhicules

function computeQuoteTotals(amountHT, vehicleHT = 0) {
  const ht = Math.round(Number(amountHT) || 0);
  const vehicleBase = Math.round(Number(vehicleHT) || 0);
  const tva = Math.round(ht * TVA_RATE);
  const tdt = Math.round(vehicleBase * TDT_RATE);
  const ttc = ht + tva + tdt;
  return { ht, tva, tdt, ttc };
}

function formatMoney(value) {
  const formatted = Number(value || 0).toLocaleString('fr-FR');
  // L'espace fine U+202F / insécable U+00A0 n'est pas encodable dans les
  // polices standard PDF (WinAnsi) : on la remplace par un espace normal.
  return `${formatted.replace(/\u202f/g, ' ').replace(/\u00a0/g, ' ')} FCFA`;
}

function formatNumber(value) {
  return formatMoney(value).replace(/ FCFA$/, '');
}

function safeText(value, fallback = '-') {
  // Les caractères hors WinAnsi (tirets cadratins, etc.) cassent drawText.
  const text = String(value || fallback);
  return text.replace(/\u00a0/g, ' ').replace(/\u202f/g, ' ').replace(/[—–]/g, '-');
}

// ─── Montant en toutes lettres (français) ───────────────────────────────────
function numberToFrenchWords(num) {
  if (num === 0) return 'zéro';
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

  function convertSmall(n) {
    if (n === 0) return '';
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const t = Math.floor(n / 10);
      const u = n % 10;
      if (t === 7 || t === 9) return `${tens[t - 1]}-${teens[u]}`;
      return tens[t] + (u > 0 ? `-${units[u]}` : '');
    }
    const h = Math.floor(n / 100);
    const r = n % 100;
    let res = h === 1 ? 'cent' : `${units[h]} cent`;
    if (h > 1 && r === 0) res += 's';
    if (r > 0) res += ` ${convertSmall(r)}`;
    return res;
  }

  if (num < 1000) return convertSmall(num);
  if (num < 1000000) {
    const th = Math.floor(num / 1000);
    const r = num % 1000;
    let res = th === 1 ? 'mille' : `${convertSmall(th)} mille`;
    if (r > 0) res += ` ${convertSmall(r)}`;
    return res;
  }
  const m = Math.floor(num / 1000000);
  const r = num % 1000000;
  let res = m === 1 ? 'un million' : `${convertSmall(m)} millions`;
  if (r > 0) {
    if (r >= 1000) {
      const th = Math.floor(r / 1000);
      const fin = r % 1000;
      res += ` ${th === 1 ? 'mille' : `${convertSmall(th)} mille`}`;
      if (fin > 0) res += ` ${convertSmall(fin)}`;
    } else {
      res += ` ${convertSmall(r)}`;
    }
  }
  return res;
}

function capitalizeFirst(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ─── Utilitaires de dessin ──────────────────────────────────────────────────
function drawWrappedText(pdfDoc, page, font, size, text, x, y, maxWidth, lineHeight = 12) {
  const words = safeText(text).split(/\s+/);
  let line = '';
  let cursorY = y;
  const drawn = [];
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      drawn.push({ text: line, y: cursorY });
      cursorY -= lineHeight;
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) drawn.push({ text: line, y: cursorY });
  drawn.forEach((draw) => page.drawText(draw.text, { x, y: draw.y, size, font, color: rgb(0.15, 0.18, 0.2) }));
  return cursorY;
}

function drawLine(page, x1, y1, x2, y2, color = { r: 0.85, g: 0.85, b: 0.85 }, width = 0.8) {
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: width, color: rgb(color.r, color.g, color.b) });
}

function parseSnapshot(quoteRequest) {
  let snapshot = null;
  if (quoteRequest.snapshot) {
    try {
      snapshot = JSON.parse(quoteRequest.snapshot);
    } catch (e) {
      snapshot = null;
    }
  }
  return Array.isArray(snapshot) ? snapshot : null;
}

function itemLines(quoteRequest) {
  const snapshot = parseSnapshot(quoteRequest);
  if (snapshot && snapshot.length > 0) {
    return snapshot.map((item) => ({
      name: item.name || item.vehicleName || item.productName || item.produit?.nom || item.title || 'Article',
      vehicleName: item.vehicleName,
      quantity: Number(item.quantity ?? item.quantite ?? 1) || 1,
      unitPrice: Number(item.unitPrice ?? item.prixUnitaire ?? 0) || 0,
      total: Number(item.totalPrice ?? item.totalLigne ?? 0) || 0,
      startDate: item.startDate,
      endDate: item.endDate,
      days: Number(item.days ?? item.duree ?? 0) || 0,
      withDriver: item.withDriver,
      type: item.type || 'product',
    }));
  }
  // Fallback : description « A | B | C » comme sur l'ancien devis
  const description = quoteRequest.description || '';
  return description
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((name) => ({ name, quantity: 1, unitPrice: 0, total: 0, type: 'product' }));
}

/**
 * Génère le PDF officiel d'un devis SOUTARAH (mêmes calculs que le site).
 * @returns {Promise<Uint8Array>} octets du PDF
 */
async function generateQuotePdf(quoteRequest) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const GREEN = { r: 0.06, g: 0.37, b: 0.25 };
  const DARK = { r: 0.12, g: 0.14, b: 0.16 };
  let y = 800;

  // ── En-tête ──
  page.drawText('SOUTARAH GROUP', { x: 48, y, size: 24, font: fontBold, color: rgb(GREEN.r, GREEN.g, GREEN.b) });
  y -= 20;
  page.drawText('Abidjan, Palmeraie Saint Viateur • SARL, Capital 10 000 000 FCFA', { x: 48, y, size: 8.5, font, color: rgb(DARK.r, DARK.g, DARK.b) });
  y -= 12;
  page.drawText('Tél : 27 22 30 11 27 / 07 18 88 88 89 / 07 18 40 40 40', { x: 48, y, size: 8.5, font, color: rgb(DARK.r, DARK.g, DARK.b) });
  y -= 26;

  // ── Titre ──
  page.drawText('DEMANDE DE DEVIS', { x: 48, y, size: 17, font: fontBold, color: rgb(DARK.r, DARK.g, DARK.b) });
  y -= 12;
  page.drawText(`Référence : ${quoteRequest.reference || 'DEVIS'}`, { x: 48, y, size: 11, font: fontBold, color: rgb(GREEN.r, GREEN.g, GREEN.b) });
  y -= 14;
  const created = quoteRequest.cree_le || quoteRequest.createdAt || new Date();
  const dateStr = new Date(created).toISOString().slice(0, 10).split('-').reverse().join('/');
  page.drawText(`Date : ${dateStr}`, { x: 48, y, size: 9.5, font, color: rgb(DARK.r, DARK.g, DARK.b) });
  y -= 26;

  // ── Encadré client ──
  page.drawRectangle({ x: 48, y: y - 16, width: 300, height: 86, color: rgb(0.96, 0.97, 0.95) });
  page.drawText('DEMANDEUR / CLIENT', { x: 56, y: y - 6, size: 9.5, font: fontBold, color: rgb(GREEN.r, GREEN.g, GREEN.b) });

  const rows = [
    ['Nom :', quoteRequest.nom || quoteRequest.name || '—'],
    ['Email :', quoteRequest.email || '—'],
    ['Téléphone :', quoteRequest.telephone || quoteRequest.phone || '—'],
  ];
  let ry = y - 22;
  for (const [label, value] of rows) {
    page.drawText(label, { x: 56, y: ry, size: 9, font: fontBold, color: rgb(DARK.r, DARK.g, DARK.b) });
    ry = drawWrappedText(pdfDoc, page, font, 9, value, 118, ry, 220);
    ry -= 14;
  }
  const companyValue = quoteRequest.entreprise || quoteRequest.company || 'Non précisée';
  page.drawText('Entreprise :', { x: 56, y: ry, size: 9, font: fontBold, color: rgb(DARK.r, DARK.g, DARK.b) });
  ry = drawWrappedText(pdfDoc, page, font, 9, companyValue, 118, ry, 220);

  // ── Bloc métadonnées ──
  const meta = [
    ['SERVICE', quoteRequest.service || '—'],
    ['LOCALISATION', quoteRequest.lieu || quoteRequest.location || 'Abidjan'],
    ['BUDGET ESTIMÉ', quoteRequest.budget ? formatMoney(quoteRequest.budget) : '—'],
  ];
  let my = y - 6;
  for (const [label, value] of meta) {
    page.drawText(label, { x: 368, y: my, size: 7.5, font: fontBold, color: rgb(DARK.r, DARK.g, DARK.b) });
    my = drawWrappedText(pdfDoc, page, font, 9, value, 368, my - 12, 175);
    my -= 6;
  }

  y = y - 124;

  // ── Tableau des articles ──
  const lines = itemLines(quoteRequest);
  let ht = 0;
  let vehicleHT = 0;
  lines.forEach((line) => {
    const lineTotal = Number(line.total) > 0 ? Number(line.total) : (line.unitPrice * (line.quantity || 1));
    ht += lineTotal;
    if (line.type === 'vehicle') vehicleHT += lineTotal;
  });
  if (ht === 0 && quoteRequest.budget && !Number.isNaN(Number(quoteRequest.budget))) {
    ht = Math.round(Number(quoteRequest.budget));
  }
  const totals = computeQuoteTotals(ht, vehicleHT);

  const colX = [48, 300, 392, 470];
  y -= 14;
  page.drawText('ARTICLE', { x: colX[0], y, size: 8.5, font: fontBold, color: rgb(DARK.r, DARK.g, DARK.b) });
  page.drawText('Qté', { x: colX[1], y, size: 8.5, font: fontBold, color: rgb(DARK.r, DARK.g, DARK.b) });
  page.drawText('Prix unitaire', { x: colX[2], y, size: 8.5, font: fontBold, color: rgb(DARK.r, DARK.g, DARK.b) });
  page.drawText('Total HT', { x: colX[3], y, size: 8.5, font: fontBold, color: rgb(DARK.r, DARK.g, DARK.b) });
  y -= 8;
  drawLine(page, 44, y, 551, y, { r: 0.6, g: 0.6, b: 0.6 }, 0.6);
  y -= 12;

  for (const line of lines) {
    const label = line.days && line.vehicleName
      ? `${line.name} (${line.days}j${line.withDriver ? ' · chauffeur' : ''})`
      : line.name;
    y = drawWrappedText(pdfDoc, page, font, 9, label, colX[0], y, 210, 11);
    page.drawText(String(line.quantity || 1), { x: colX[1], y, size: 9, font });
    const unit = Number(line.total) > 0 ? (Number(line.total) / (line.quantity || 1)).toFixed(0) : String(line.unitPrice || 0);
    page.drawText(formatNumber(Number(unit)), { x: colX[2], y, size: 9, font });
    const lineTotal = Number(line.total) > 0 ? Number(line.total) : (line.unitPrice * (line.quantity || 1));
    page.drawText(formatNumber(lineTotal), { x: colX[3], y, size: 9, font });
    y -= 16;
    if (y < 130) break;
  }

  drawLine(page, 44, y - 4, 551, y - 4, { r: 0.6, g: 0.6, b: 0.6 }, 0.6);

  y -= 24;

  // ── Totaux ──
  const totalRows = [
    ['Montant HT', totals.ht, 9.5, false],
    ['TVA 18%', totals.tva, 9.5, false],
    ...(totals.tdt > 0 ? [['TDT 2,5% (véhicules)', totals.tdt, 9.5, false]] : []),
    ['MONTANT TTC', totals.ttc, 11.5, true],
  ];
  for (const [label, value, size, strong] of totalRows) {
    const color = strong ? rgb(GREEN.r, GREEN.g, GREEN.b) : rgb(DARK.r, DARK.g, DARK.b);
    page.drawText(label, { x: 420, y, size, font: fontBold, color });
    page.drawText(formatMoney(value), { x: 470, y, size, font: fontBold, color });
    y -= 15;
  }

  // ── Arrêtée en lettres + signature ──
  if (y > 150) {
    y -= 26;
    const amountWords = capitalizeFirst(numberToFrenchWords(totals.ttc));
    page.drawText(`Arrêtée la présente à la somme de : ${amountWords} francs CFA`, { x: 48, y, size: 10, font: fontItalic, color: rgb(DARK.r, DARK.g, DARK.b) });
    y -= 46;
    page.drawText('SOUTARAH GROUP', { x: 400, y, size: 12, font: fontBold, color: rgb(GREEN.r, GREEN.g, GREEN.b) });
    drawLine(page, 380, y - 26, 545, y - 26, { r: 0.4, g: 0.4, b: 0.4 }, 0.5);
    page.drawText('Signature', { x: 445, y: y - 38, size: 8, font, color: rgb(DARK.r, DARK.g, DARK.b) });
  }

  // ── Pied de page légal ──
  const footer = 'Société à Responsabilité limitée SARL, Capital : 10 000 000 FCFA • Abidjan, Palmeraie Saint Viateur • 25 BP 1032 Abidjan 25 • N°RCCM : CI-ABJ-03-2022-B12-03750 • N°CC : 2242663 T • Compte BNI : CI092 01021 000108230000 36 • infosoutarahgroup@gmail.com';
  drawWrappedText(pdfDoc, page, font, 7, footer, 48, 40, 500);

  return pdfDoc.save();
}

module.exports = { generateQuotePdf, computeQuoteTotals };