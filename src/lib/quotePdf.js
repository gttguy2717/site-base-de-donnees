import { computeQuoteTotals } from './quoteTotals';

const money = (value) => new Intl.NumberFormat('fr-CI', { maximumFractionDigits: 0 }).format(value || 0);

const COMPANY_HEADER = [
  'Société à Responsabilité limitée SARL, Capital : 10 000 000 FCFA • Abidjan, Palmeraie Saint Viateur',
  '25 BP 1032 Abidjan 25 • Tél : 27 22 30 11 27 / 07 18 88 88 89 / 07 18 40 40 40 / 07 06 91 91 91 / 07 69 38 66 50',
  'N°RCCM : CI-ABJ-03-2022-B12-03750 • N°CC : 2242663 T • Compte Bancaire BNI : CI092 01021 000108230000 36',
  'Email: infosoutarahgroup@gmail.com - info@soutarahgroup.ci • Web: www.soutarah-group.ci',
];

const SERVICES = [
  'Location de véhicules | Entretien d\'espaces verts',
  'Entretien de locaux | Maintenance | Installation',
  'électrique BTP et divers | Energie solaire et',
  'efficacité énergétique | Négoce | Import/Export',
  'Agro Pastoral',
];

function estimerFraisCarburant(vehicleName, days) {
  const name = (vehicleName || '').toLowerCase();
  const prixEssence = 650;
  const prixGazole = 600;
  const kmParJour = 100;
  let conso = 8;
  let prix = prixEssence;

  if (name.includes('dzire') || name.includes('vitz') || name.includes('micra') || name.includes('swift')) conso = 6;
  else if (name.includes('kicks') || name.includes('vitara') || name.includes('fronx') || name.includes('duster')) conso = 8;
  else if (name.includes('kadjar') || name.includes('koleos') || name.includes('rush')) conso = 9;
  else if (name.includes('pajero') || name.includes('highlander') || name.includes('montero') || name.includes('fortuner')) { conso = 12; prix = prixEssence; }
  else if (name.includes('d-max') || name.includes('dmax') || name.includes('l200') || name.includes('tacoma') || name.includes('friday')) { conso = 10; prix = prixGazole; }
  else if (name.includes('land cruiser') || name.includes('cruiser')) conso = 15;
  else if (name.includes('jumper') || name.includes('dokker') || name.includes('express') || name.includes('transit') || name.includes('oroch')) { conso = 9; prix = prixGazole; }
  else if (name.includes('urvan') || name.includes('hiace') || name.includes('hyundai')) { conso = 11; prix = prixGazole; }

  return Math.round(((kmParJour * Number(days || 1) * conso) / 100) * prix);
}

// Helper to convert numbers to French words
function convertNumberToFrenchWords(num) {
  if (num === 0) return 'zéro';

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

  function convertLessThanThousand(n) {
    if (n === 0) return '';
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const ten = Math.floor(n / 10);
      const unit = n % 10;
      if (ten === 7 || ten === 9) return tens[ten - 1] + '-' + teens[unit];
      return tens[ten] + (unit > 0 ? '-' + units[unit] : '');
    }
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let result = hundred === 1 ? 'cent' : units[hundred] + ' cent';
    if (hundred > 1 && rest === 0) result += 's';
    if (rest > 0) result += ' ' + convertLessThanThousand(rest);
    return result;
  }

  if (num < 1000) return convertLessThanThousand(num);

  if (num < 1000000) {
    const thousands = Math.floor(num / 1000);
    const rest = num % 1000;
    let result = thousands === 1 ? 'mille' : convertLessThanThousand(thousands) + ' mille';
    if (rest > 0) result += ' ' + convertLessThanThousand(rest);
    return result;
  }

  const millions = Math.floor(num / 1000000);
  const rest = num % 1000000;
  let result = millions === 1 ? 'un million' : convertLessThanThousand(millions) + ' millions';
  if (rest > 0) {
    if (rest >= 1000) {
      const thousands = Math.floor(rest / 1000);
      const finalRest = rest % 1000;
      result += ' ' + (thousands === 1 ? 'mille' : convertLessThanThousand(thousands) + ' mille');
      if (finalRest > 0) result += ' ' + convertLessThanThousand(finalRest);
    } else {
      result += ' ' + convertLessThanThousand(rest);
    }
  }
  return result;
}

/**
 * Génère un PDF de devis professionnel fidèle au modèle SOUTARAH.
 * @param {Object} params
 * @param {Object} params.quote - Données du devis/demande
 * @param {Array} [params.items] - Articles du devis
 * @param {Object} [params.user] - Utilisateur
 * @param {Object} [params.client] - Client
 * @param {String} [params.filename] - Nom du fichier PDF
 * @returns {String} Référence du devis
 */
export async function generateQuotePdf({ quote, items = [], user = null, client = null, filename = null } = {}) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const reference = quote?.reference || `04-26/UFO/LOC/${Math.floor(1000 + Math.random() * 9000).toString().padStart(3, '0')}`;
  const now = new Date(quote?.cree_le || quote?.createdAt || Date.now());

  // ===== EN-TÊTE SOCIÉTÉ =====
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  COMPANY_HEADER.forEach((line, i) => {
    doc.text(line, pageWidth / 2, 8 + i * 4.5, { align: 'center' });
  });

  // ===== LOGO + SERVICES =====
  doc.setFillColor(23, 61, 35);
  doc.roundedRect(15, 30, 32, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('SOUTARAH', 31, 37, { align: 'center' });
  doc.setFontSize(8);
  doc.text('GROUP', 31, 41, { align: 'center' });

  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  SERVICES.forEach((service, i) => {
    doc.text(service, pageWidth - 15, 30 + i * 2.8, { align: 'right' });
  });

  // ===== N° DEVIS + DATE =====
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Devis N° ${reference}`, pageWidth - 15, 52, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const dateFormatted = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1), pageWidth - 15, 58, { align: 'right' });

  // ===== CLIENT =====
  const clientName = quote?.nom || client?.entreprise?.nom || [client?.prenom, client?.nom].filter(Boolean).join(' ') || 'CLIENT';
  const clientLocation = quote?.lieu || client?.adresse || 'ABIDJAN';
  const clientPhone = quote?.telephone || user?.telephone || '+225 00 00 00 00 00';

  doc.setDrawColor(105, 195, 59);
  doc.setLineWidth(1.2);
  doc.roundedRect(pageWidth - 65, 62, 50, 20, 3, 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(23, 61, 35);
  doc.text(clientName, pageWidth - 40, 70, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(clientLocation.toUpperCase(), pageWidth - 40, 75, { align: 'center' });
  doc.setFontSize(8);
  doc.text(clientPhone, pageWidth - 40, 79, { align: 'center' });

  // ===== TITRE SERVICE =====
  const serviceTitle = quote?.service || 'LOCATION DE VEHICULE AVEC CHAUFFEUR';
  doc.setFillColor(128, 128, 128);
  doc.rect(15, 88, pageWidth - 30, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(serviceTitle.toUpperCase(), pageWidth / 2, 94, { align: 'center' });

  // ===== TABLEAU =====
  const tableY = 100;
  const colWidths = [38, 35, 24, 22, 14, 16, 24];
  const headers = ['Désignation', 'Type de véhicule', 'Destination', 'Coût\njournalier', 'Quantité', 'Nbre de\njours', 'Total'];
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  const startX = (pageWidth - totalWidth) / 2;

  // Header du tableau
  doc.setFillColor(105, 195, 59);
  doc.rect(startX, tableY, totalWidth, 9, 'F');

  let x = startX;
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  headers.forEach((header, i) => {
    const lines = header.split('\n');
    lines.forEach((line, li) => {
      doc.text(line, x + colWidths[i] / 2, tableY + 4.5 + li * 3, { align: 'center' });
    });
    x += colWidths[i];
  });

  // Lignes d'articles
  let rows = items;
  if (rows.length === 0 && quote?.description) {
    const match = quote.description.match(/Location\s+(.+?)\s*\((\d+)j?\)/i);
    if (match) {
      rows = [{
        designation: 'LOCATION DE VEHICULE',
        vehicleType: match[1].toUpperCase(),
        destination: clientLocation,
        unitPrice: 0,
        quantity: 1,
        days: parseInt(match[2], 10) || 1,
        total: 0,
      }];
    } else {
      rows = [{ designation: quote.description, vehicleType: '-', destination: clientLocation, unitPrice: 0, quantity: 1, days: 1, total: 0 }];
    }
  }

  const normalizedRows = rows.map((item) => {
    if (item.type === 'vehicle_rental') {
      return {
        designation: `LOCATION DE VEHICULE\nDu ${(item.startDate || '').split('-').reverse().join('/')} AU ${(item.endDate || '').split('-').reverse().join('/')}`,
        vehicleType: `${item.vehicle?.name || item.vehicleName || 'Véhicule'}\n${item.withDriver ? 'Climatisé et confortable' : 'Sans chauffeur'}`,
        destination: item.destination || 'ABIDJAN',
        unitPrice: Number(item.unitPrice || 0),
        quantity: 1,
        days: Number(item.days || item.duration || 1),
        total: Number(item.totalPrice || 0),
      };
    }
    const product = item.produit || item.product;
    return {
      designation: product?.nom || item.designation || item.libelle || 'Article SOUTARAH',
      vehicleType: item.vehicleType || 'Article de négoce',
      destination: item.destination || 'Négoce',
      unitPrice: Number(item.prix_unitaire ?? item.unitPrice ?? 0),
      quantity: Number(item.quantite ?? item.quantity ?? 1),
      days: Number(item.days || 1),
      total: Number(item.total ?? item.prix_total ?? 0),
    };
  });

  let y = tableY + 9;
  const rowHeight = 12;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);

  normalizedRows.forEach((row, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(245, 245, 245);
      doc.rect(startX, y, totalWidth, rowHeight, 'F');
    }

    // Désignation
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(0, 0, 0);
    const desigLines = row.designation.split('\n');
    desigLines.forEach((line, li) => {
      doc.text(line, startX + 2, y + 4.5 + li * 3, { maxWidth: colWidths[0] - 3 });
    });

    // Type de véhicule
    doc.text(row.vehicleType, startX + colWidths[0] + 2, y + 4.5, { maxWidth: colWidths[1] - 3 });

    // Destination
    doc.text(row.destination, startX + colWidths[0] + colWidths[1] + 2, y + 4.5, { maxWidth: colWidths[2] - 3 });

    // Coût journalier
    doc.text(row.unitPrice ? money(row.unitPrice) : '-', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] / 2, y + 4.5, { align: 'center' });

    // Quantité
    doc.text(String(row.quantity || '-'), startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] / 2, y + 4.5, { align: 'center' });

    // Jours
    doc.text(String(row.days || '-'), startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] / 2, y + 4.5, { align: 'center' });

    // Total
    doc.setFont('helvetica', 'bold');
    doc.text(row.total ? money(row.total) : '-', startX + totalWidth - colWidths[6] / 2, y + 4.5, { align: 'center' });

    y += rowHeight;
  });

  // Bordures du tableau
  doc.setDrawColor(200, 200, 200);
  doc.rect(startX, tableY, totalWidth, 9 + normalizedRows.length * rowHeight);

  // ===== TOTAUX =====
  const totalHT = normalizedRows.some((r) => r.total > 0)
    ? normalizedRows.reduce((sum, r) => sum + r.total, 0)
    : Number(quote?.montant_total || 0);
  const totals = computeQuoteTotals(totalHT);

  const finalTTC = totals.ttc;

  y += 8;
  const totalsData = [
    ['MONTANT HT', money(totalHT)],
    ['TVA 18%', money(totals.tva)],
    ['TDT 2.5%', money(totals.tdt)],
  ];
  totalsData.push(['MONTANT TTC', money(finalTTC)]);

  const rightX = pageWidth - 15;
  totalsData.forEach(([label, value], index) => {
    const isTotal = index === totalsData.length - 1;
    doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
    doc.setFontSize(isTotal ? 11 : 8);
    doc.text(label, rightX - 70, y);
    doc.text(value, rightX, y, { align: 'right' });
    y += isTotal ? 8 : 6;
  });

  // ===== MONTANT EN LETTRES =====
  if (finalTTC > 0) {
    y += 5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.text(`Arrêtée la présente à la somme de : ${convertNumberToFrenchWords(finalTTC)} francs CFA`, pageWidth / 2, y, { align: 'center' });
  }

  // ===== NB =====
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 0, 0);
  doc.text('NB :', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('- Le chauffeur est à votre disposition de 7h à 21h', 25, y + 5);

  // ===== SIGNATURE =====
  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SOUTARAH GROUP', pageWidth - 40, y, { align: 'center' });

  // ===== CONDITIONS =====
  y += 8;
  const tableY2 = y;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);

  doc.rect(15, tableY2, 60, 15);
  doc.rect(75, tableY2, 60, 15);
  doc.rect(135, tableY2, 60, 15);
  doc.rect(15, tableY2 + 15, 60, 15);
  doc.rect(75, tableY2 + 15, 60, 15);
  doc.rect(135, tableY2 + 15, 60, 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('VALIDITE', 45, tableY2 + 8, { align: 'center' });
  doc.text('DELAI', 105, tableY2 + 8, { align: 'center' });
  doc.text('REGLEMENT', 165, tableY2 + 8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.text('02 SEMAINES', 45, tableY2 + 23, { align: 'center' });
  doc.text('DISPONIBLE SAUF LOCATION', 105, tableY2 + 23, { align: 'center' });
  doc.text('SELON CONTRAT', 165, tableY2 + 23, { align: 'center' });

  // ===== PIED DE PAGE =====
  doc.setFillColor(23, 61, 35);
  doc.rect(0, pageHeight - 16, pageWidth, 16, 'F');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text(COMPANY_HEADER[0], pageWidth / 2, pageHeight - 11.5, { align: 'center' });
  doc.text(COMPANY_HEADER[1], pageWidth / 2, pageHeight - 8, { align: 'center' });
  doc.text(COMPANY_HEADER[3], pageWidth / 2, pageHeight - 4.5, { align: 'center' });

  // ===== SAUVEGARDE =====
  const safeRef = reference.replace(/\//g, '-');
  doc.save(filename || `devis-soutarah-${safeRef}.pdf`);
  return reference;
}