import { computeQuoteTotals } from './quoteTotals.js';
import { LETTERHEAD_BG } from './letterheadBase64.js';

export const COMPANY_LETTERHEAD = [
  'Société à Responsabilité limitée SARL, Capital : 10 000 000 FCFA • Abidjan, Palmeraie Saint Viateur',
  '25 BP 1032 Abidjan 25 • Tél : 27 22 30 11 27 / 07 18 88 88 89 / 07 18 40 40 40 / 07 06 91 91 91 / 07 69 38 66 50',
  'N°RCCM : CI-ABJ-03-2022-B12-03750 • N°CC : 2242663 T • Compte Bancaire BNI : CI092 01021 000108230000 36',
  'Email: infosoutarahgroup@gmail.com - info@soutarahgroup.ci • Web: www.soutarah-group.ci',
];

// Placeholder SVG embarqué pour les véhicules : aucun fichier physique requis, ne peut pas être en 404
const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400">' +
      '<rect width="640" height="400" fill="#173d23"/>' +
      '<text x="320" y="185" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="bold" fill="#ffffff" text-anchor="middle">SOUTARAH GROUP</text>' +
      '<text x="320" y="245" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#69c33b" text-anchor="middle">Photo du véhicule indisponible</text>' +
    '</svg>'
  );

// ---------------------------------------------------------------- Helpers

export function numberToFrenchWords(num) {
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
      if (t === 7 || t === 9) return tens[t - 1] + '-' + teens[u];
      return tens[t] + (u > 0 ? '-' + units[u] : '');
    }
    const h = Math.floor(n / 100);
    const r = n % 100;
    let res = h === 1 ? 'cent' : units[h] + ' cent';
    if (h > 1 && r === 0) res += 's';
    if (r > 0) res += ' ' + convertSmall(r);
    return res;
  }

  if (num < 1000) return convertSmall(num);
  if (num < 1000000) {
    const th = Math.floor(num / 1000);
    const r = num % 1000;
    let res = th === 1 ? 'mille' : convertSmall(th) + ' mille';
    if (r > 0) res += ' ' + convertSmall(r);
    return res;
  }
  const m = Math.floor(num / 1000000);
  const r = num % 1000000;
  let res = m === 1 ? 'un million' : convertSmall(m) + ' millions';
  if (r > 0) {
    if (r >= 1000) {
      const th = Math.floor(r / 1000);
      const fin = r % 1000;
      res += ' ' + (th === 1 ? 'mille' : convertSmall(th) + ' mille');
      if (fin > 0) res += ' ' + convertSmall(fin);
    } else {
      res += ' ' + convertSmall(r);
    }
  }
  return res;
}

export const formatMoney = (val) => new Intl.NumberFormat('fr-FR').format(val || 0);

export function capitalizeFirst(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

export function formatLongDate(date) {
  const d = new Date(date);
  const formatted = d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  return capitalizeFirst(formatted); // ex. « Mercredi 02 septembre 2026 »
}

export function formatShortDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).split('-').reverse().join('/');
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatPeriod(start, end) {
  const s = formatShortDate(start);
  const e = formatShortDate(end);
  if (s && e) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())
      && startDate.getMonth() === endDate.getMonth()
      && startDate.getFullYear() === endDate.getFullYear()) {
      return `Du ${String(startDate.getDate()).padStart(2, '0')} AU ${e}`;
    }
    return `Du ${s} AU ${e}`;
  }
  if (s) return `À partir du ${s}`;
  return '';
}

export function buildLocationReference(quote = {}, date) {
  if (quote.reference && (quote.reference.includes('/LOC/') || quote.reference.includes('/UFO/'))) {
    return quote.reference;
  }
  if (quote.reference && !quote.reference.startsWith('DMD-')) {
    return quote.reference;
  }
  const seed = String(quote.id || quote.reference || '');
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  const seq = String(hash + 1).padStart(3, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}-${yy}/UFO/LOC/${seq}`;
}

export function buildNegoceReference(quote = {}, date) {
  if (quote.reference && (quote.reference.includes('/NEG/') || quote.reference.includes('NEG'))) {
    return quote.reference;
  }
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  if (quote.reference && quote.reference.startsWith('DMD-')) {
    const parts = quote.reference.split('-');
    const seq = (parts[parts.length - 1] || '001').slice(-3).padStart(3, '0');
    return `${mm}-${yy}/NEG/${seq}`;
  }
  const seed = String(quote.id || quote.reference || Date.now());
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  const seq = String(hash + 1).padStart(3, '0');
  return `${mm}-${yy}/NEG/${seq}`;
}

const numberOrZero = (val) => Math.round(Number(val) || 0);

function getVehicleImage(vehicleName, explicitImage) {
  return explicitImage || FALLBACK_IMAGE;
}

/**
 * Attend le chargement des images du conteneur ; retire celles qui sont cassées (404,
 * CORS...) pour que html2canvas ne plante pas lors de la génération du PDF.
 */
async function prepareContainerImages(container) {
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) return resolve();
          let done = false;
          const finish = () => {
            if (done) return;
            done = true;
            resolve();
          };
          img.onload = () => finish();
          img.onerror = () => {
            img.remove();
            finish();
          };
          setTimeout(finish, 8000);
        })
    )
  );
}

// ------------------------------------------------------- Detection de type

export function isVehicleItem(item) {
  const type = String(item?.type || '');
  if (type.startsWith('vehicle') || type === 'location') return true;
  return !!(item?.vehicle || item?.vehicleName || item?.vehicleType || item?.dailyPrice != null);
}

export function detectQuoteType(quote = {}, items = []) {
  const explicitType = String(quote?.type || quote?.quoteType || '').toLowerCase();
  if (explicitType === 'negoce') return 'negoce';
  if (explicitType === 'location') return 'location';

  const rows = Array.isArray(items) ? items : [];
  const hasVehicle = rows.some((it) => isVehicleItem(it));
  const hasProduct = rows.some((it) => !isVehicleItem(it));

  // Panier mixte (négoce + locations) → génération de DEUX devis séparés
  if (hasVehicle && hasProduct) return 'mixed';
  if (hasVehicle && !hasProduct) return 'location';
  if (hasProduct && !hasVehicle) return 'negoce';

  const text = `${quote?.service || ''} ${quote?.titre || ''} ${quote?.title || ''} ${quote?.description || ''} ${quote?.reference || ''}`.toLowerCase();

  if (text.includes('/neg/') || text.includes('-neg-')) return 'negoce';
  if (text.includes('/loc/') || text.includes('/ufo/')) return 'location';

  const negoceKeywords = ['négoce', 'negoce', 'fourniture', 'plomberie', 'matériel', 'materiel', 'électricité', 'electricite', 'vente', 'quincaillerie', 'outillage', 'bâtiment', 'batiment'];
  const locationKeywords = ['location', 'véhicule', 'vehicule', 'chauffeur', 'voiture', 'engin', 'pick-up', 'pajero', 'prado', 'suv', 'berline'];

  const matchesNegoce = negoceKeywords.some((k) => text.includes(k));
  const matchesLocation = locationKeywords.some((k) => text.includes(k));

  if (matchesNegoce && !matchesLocation) return 'negoce';
  if (matchesLocation && !matchesNegoce) return 'location';

  if (hasVehicle) return 'location';
  if (hasProduct) return 'negoce';

  return matchesNegoce ? 'negoce' : 'location';
}

function resolveClientInfo(quote, client, user) {
  const qClient = quote?.client || null;
  const clientName = quote?.nom || quote?.name || quote?.clientName
    || qClient?.entreprise?.nom || qClient?.company?.name || client?.entreprise?.nom || client?.company?.name
    || [qClient?.prenom || qClient?.firstName || client?.prenom || client?.firstName,
        qClient?.nom || qClient?.lastName || client?.nom || client?.lastName].filter(Boolean).join(' ')
    || [user?.prenom || user?.firstName, user?.nom || user?.lastName || user?.name].filter(Boolean).join(' ')
    || user?.nom || user?.name || qClient?.user?.email || user?.email || quote?.email
    || 'Client SOUTARAH';
  const clientEmail = quote?.email
    || qClient?.user?.email || qClient?.email || user?.email || client?.email || '';
  const clientPhone = quote?.telephone || quote?.phone
    || qClient?.user?.telephone || qClient?.telephone || qClient?.user?.phone
    || user?.telephone || user?.phone || client?.telephone || client?.phone
    || '';
  const displayLocation = quote?.lieu || quote?.ville
    || qClient?.adresse || client?.adresse || client?.ville
    || 'ABIDJAN';

  return { clientName, clientEmail, clientPhone, displayLocation };
}

// ------------------------------------------------------- Normalisation des lignes Location

function normalizeLocationItems(quote, items) {
  const rows = [];

  if (items && items.length > 0) {
    for (const it of items) {
      if (isVehicleItem(it)) {
        const vehicleName = it.vehicle?.name || it.vehicleName || it.vehicleType || it.vehicleModel || 'Véhicule';
        const dailyPrice = numberOrZero(it.unitPrice ?? it.dailyPrice ?? it.prix_unitaire);
        const days = numberOrZero((it.days ?? it.duration ?? it.jours) || 1);
        const total = numberOrZero(it.totalPrice ?? it.total ?? it.prix_total ?? (dailyPrice * days));
        rows.push({
          kind: 'vehicle',
          designationPrimary: 'LOCATION DE VEHICULE',
          designationSecondary: formatPeriod(it.startDate, it.endDate),
          vehicleName,
          typeSublabel: it.withDriver === false ? 'Sans chauffeur' : 'Climatisé et confortable',
          destination: it.destination || it.destinationLabel || quote?.lieu || 'ABIDJAN',
          dailyPrice,
          quantity: numberOrZero((it.quantity ?? it.quantite) || 1),
          days,
          total,
          withDriver: it.withDriver ?? it.avec_chauffeur,
          imageUrl: it.vehicle?.image || it.imageUrl || null,
        });
      } else {
        const product = it.produit || it.product || {};
        const productName = product.nom || product.name || it.libelle || it.title || 'Article SOUTARAH';
        const unitPrice = numberOrZero(it.prix_unitaire ?? it.unitPrice ?? it.price);
        const quantity = numberOrZero((it.quantite ?? it.quantity) || 1);
        const total = numberOrZero(it.total ?? it.prix_total ?? it.totalPrice ?? (unitPrice * quantity));
        rows.push({
          kind: 'product',
          designationPrimary: productName,
          designationSecondary: '',
          vehicleName: '',
          typeSublabel: 'Article de négoce',
          destination: 'Négoce',
          dailyPrice: unitPrice,
          quantity,
          days: 1,
          total,
          imageUrl: it.imageUrl || product.image || null,
        });
      }
    }
  }

  if (rows.length === 0 && quote?.description) {
    const match = quote.description.match(/Location\s+(.+?)\s*\((\d+)j?\)/i);
    const vehicleName = match ? match[1].trim() : (quote.titre || quote.service || 'Véhicule');
    const days = match ? parseInt(match[2], 10) || 1 : 1;
    rows.push({
      kind: 'vehicle',
      designationPrimary: 'LOCATION DE VEHICULE',
      designationSecondary: '',
      vehicleName,
      typeSublabel: 'Climatisé et confortable',
      destination: quote?.lieu || 'ABIDJAN',
      dailyPrice: 0,
      quantity: 1,
      days,
      total: 0,
      imageUrl: quote?.vehicule?.image_url || quote?.vehicule_image_url || null,
    });
  }

  if (rows.length === 0) {
    rows.push({
      kind: 'vehicle',
      designationPrimary: 'LOCATION DE VEHICULE',
      designationSecondary: '',
      vehicleName: quote?.titre || quote?.service || 'Véhicule',
      typeSublabel: 'Climatisé et confortable',
      destination: quote?.lieu || 'ABIDJAN',
      dailyPrice: 0,
      quantity: 1,
      days,
      total: 0,
      imageUrl: null,
    });
  }

  let montantHT = rows.reduce((sum, r) => sum + r.total, 0);
  if (montantHT === 0) {
    const budget = numberOrZero(String(quote?.budget ?? quote?.montant_total ?? '').replace(/[^\d]/g, ''));
    if (budget > 0) {
      montantHT = budget;
      const primary = rows.find((r) => r.kind === 'vehicle') || rows[0];
      if (primary) {
        primary.total = montantHT;
        if (!primary.dailyPrice && primary.days > 0) {
          primary.dailyPrice = Math.round(montantHT / primary.days);
        }
      }
    }
  }

  return { rows, montantHT };
}

// ------------------------------------------------------- Normalisation des lignes Négoce

function normalizeNegoceItems(quote, items) {
  const rows = [];

  if (items && items.length > 0) {
    for (const it of items) {
      const product = it.produit || it.product || {};
      const designation = product.nom || product.name || it.libelle || it.nom || it.name || it.title || 'Article SOUTARAH';
      const ref = product.reference || it.reference || it.ref || '';
      const subtext = it.description || it.spec || (ref ? `REF : ${ref}` : '');
      const unite = it.unite || it.unit || product.unite || 'U';
      const quantity = numberOrZero(it.quantity ?? it.quantite ?? 1) || 1;
      const unitPrice = numberOrZero(it.prix_unitaire ?? it.unitPrice ?? it.price ?? 0);
      const total = numberOrZero(it.total ?? it.prix_total ?? it.totalPrice ?? (unitPrice * quantity));

      rows.push({
        designation,
        subtext,
        unite: String(unite).toLowerCase().startsWith('u') ? 'U' : String(unite).toUpperCase(),
        quantity,
        unitPrice,
        total,
      });
    }
  }

  if (rows.length === 0 && quote?.description) {
    const parts = quote.description.split(/[\n|]/).map((s) => s.trim()).filter(Boolean);
    parts.forEach((part) => {
      const match = part.match(/^(.+?)(?:\s*\(x(\d+)\))?$/i);
      const designation = match ? match[1].trim() : part;
      const quantity = match && match[2] ? parseInt(match[2], 10) : 1;
      rows.push({
        designation,
        subtext: '',
        unite: 'U',
        quantity,
        unitPrice: 0,
        total: 0,
      });
    });
  }

  if (rows.length === 0) {
    rows.push({
      designation: quote?.titre || quote?.service || 'Matériel de plomberie et négoce',
      subtext: '',
      unite: 'U',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    });
  }

  let montantHT = rows.reduce((sum, r) => sum + r.total, 0);
  if (montantHT === 0) {
    const budget = numberOrZero(String(quote?.budget ?? quote?.montant_total ?? '').replace(/[^\d]/g, ''));
    if (budget > 0) {
      montantHT = budget;
      rows[0].total = montantHT;
      rows[0].unitPrice = Math.round(montantHT / (rows[0].quantity || 1));
    }
  }

  return { rows, montantHT };
}

// ------------------------------------------------------- DEVIS LOCATION (CONSERVÉ INTACT)

export async function generateLocationQuotePdf({ quote = {}, items = [], filename = null, user = null, client = null } = {}) {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  const now = new Date(quote?.cree_le || quote?.createdAt || Date.now());
  const reference = buildLocationReference(quote, now);
  const dateFormatted = formatLongDate(now);

  const { rows, montantHT } = normalizeLocationItems(quote, items);
  const vehicleRows = rows.filter((r) => r.kind === 'vehicle');
  const vehicleBase = vehicleRows.reduce((sum, r) => sum + r.total, 0);
  const totals = computeQuoteTotals(montantHT, vehicleBase);

  const { clientName, clientEmail, clientPhone, displayLocation } = resolveClientInfo(quote, client, user);

  const hasVehicleRow = rows.some((r) => r.kind === 'vehicle');
  const hasProductRow = rows.some((r) => r.kind === 'product');
  const driverKnown = rows.filter((r) => r.kind === 'vehicle').map((r) => r.withDriver).filter((v) => v === true || v === false);
  const allSansChauffeur = hasVehicleRow && driverKnown.length > 0 && driverKnown.every((v) => v === false);
  let devisTitle;
  if (hasVehicleRow && !hasProductRow) {
    devisTitle = allSansChauffeur ? 'Location de véhicule sans chauffeur' : 'Location de véhicule avec chauffeur';
  } else {
    devisTitle = String(quote?.service || (hasProductRow ? 'Vente de matériel électrique' : 'Location de véhicule avec chauffeur')).toUpperCase();
  }

  const montantTTC = totals.ttc;
  const montantEnLettres = capitalizeFirst(numberToFrenchWords(montantTTC));

  const rowsHtml = rows
    .map((row) => {
      const destinationCell = row.kind === 'vehicle' ? row.destination : row.destination || 'Négoce';
      const daysCell = row.kind === 'vehicle' ? row.days : '—';
      const designationLines = [row.designationPrimary, row.designationSecondary].filter(Boolean);
      const typeLines = [row.vehicleName, row.typeSublabel].filter(Boolean);

      return `
        <tr>
          <td style="padding: 7px 8px; border: 1px solid #000; font-size: 10px; vertical-align: top; width: 20%;">
            ${designationLines
              .map(
                (line, i) =>
                  `<div style="font-weight: ${i === 0 ? 'bold' : 'normal'}; ${i === 0 ? '' : 'margin-top: 2px;'}">${line}</div>`
              )
              .join('')}
          </td>
          <td style="padding: 7px 8px; border: 1px solid #000; font-size: 10px; vertical-align: top; width: 22%;">
            ${typeLines
              .map(
                (line, i) =>
                  `<div style="font-weight: ${i === 0 ? 'bold' : 'normal'}; ${i === 0 ? '' : 'font-size: 9px; color: #333; margin-top: 2px;'}">${line}</div>`
              )
              .join('')}
          </td>
          <td style="padding: 7px 8px; border: 1px solid #000; font-size: 10px; text-align: center; font-weight: bold; width: 13%; vertical-align: top;">
            ${destinationCell}
          </td>
          <td style="padding: 7px 8px; border: 1px solid #000; font-size: 10px; text-align: center; width: 12%; vertical-align: top;">
            ${row.dailyPrice ? formatMoney(row.dailyPrice) : '-'}
          </td>
          <td style="padding: 7px 8px; border: 1px solid #000; font-size: 10px; text-align: center; width: 8%; vertical-align: top;">
            ${row.quantity || '-'}
          </td>
          <td style="padding: 7px 8px; border: 1px solid #000; font-size: 10px; text-align: center; width: 9%; vertical-align: top;">
            ${daysCell}
          </td>
          <td style="padding: 7px 8px; border: 1px solid #000; font-size: 10px; text-align: right; font-weight: bold; width: 16%; vertical-align: top;">
            ${row.total ? formatMoney(row.total) : '-'}
          </td>
        </tr>
      `;
    })
    .join('');

  const totalsRows = [
    { label: 'MONTANT HT', value: formatMoney(totals.ht), bold: true },
    { label: 'TVA 18%', value: formatMoney(totals.tva), bold: false },
    { label: 'TDT 2.5%', value: formatMoney(totals.tdt), bold: false },
    { label: 'MONTANT TTC', value: formatMoney(totals.ttc), bold: true, strong: true },
  ]
    .map(
      (r) => `
        <tr>
          <td colspan="4" style="border: 1px solid #000; border-right: none; padding: ${r.strong ? '6px' : '5px'} 12px; font-size: ${r.strong ? '11px' : '10px'}; font-weight: ${r.bold ? 'bold' : 'normal'}; text-align: left; ${r.strong ? 'background: #ececec;' : ''}">
            ${r.label}
          </td>
          <td colspan="2" style="border: 1px solid #000; border-left: none; border-right: none; ${r.strong ? 'background: #ececec;' : ''}"></td>
          <td style="border: 1px solid #000; padding: ${r.strong ? '6px' : '5px'} 10px; font-size: ${r.strong ? '11px' : '10px'}; font-weight: bold; text-align: right; ${r.strong ? 'background: #ececec;' : ''}">
            ${r.value}
          </td>
        </tr>
      `
    )
    .join('');

  // ------------------------- PAGE 1 LOCATION -------------------------
  const page1Html = `
    <div id="pdf-page-1" style="width: 794px; min-height: 1120px; padding: 34px 45px 150px; background: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #000000; box-sizing: border-box; position: relative;">
      <div style="text-align: left; margin-bottom: 10px;">
        <img src="/logo-soutarah.png" style="height: 300px; width: auto; object-fit: contain; display: block; margin-left: 0;" />
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
        <tr>
          <td style="vertical-align: top; width: 46%;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="border: 1px solid #000; padding: 6px 8px; font-size: 10px; font-weight: bold; text-align: center; width: 32%; background: #eef3ee; white-space: nowrap;">VALIDITE</td>
                <td style="border: 1px solid #000; padding: 6px 8px; font-size: 10px; text-align: center;">02 SEMAINES</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 6px 8px; font-size: 10px; font-weight: bold; text-align: center; background: #eef3ee; white-space: nowrap;">DELAI</td>
                <td style="border: 1px solid #000; padding: 6px 8px; font-size: 10px; text-align: center;">DISPONIBLE SAUF LOCATION</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 6px 8px; font-size: 10px; font-weight: bold; text-align: center; background: #eef3ee; white-space: nowrap;">REGLEMENT</td>
                <td style="border: 1px solid #000; padding: 6px 8px; font-size: 10px; text-align: center;">SELON CONTRAT</td>
              </tr>
            </table>
          </td>
          <td style="vertical-align: top; text-align: right; padding-left: 16px;">
            <div style="font-size: 13px; font-weight: bold; letter-spacing: 0.3px;">Devis N° ${reference}</div>
            <div style="font-size: 11px; margin-top: 2px; color: #444444;">${dateFormatted}</div>

            <table style="margin-left: auto; margin-top: 8px; border-collapse: separate; background: #ffffff;">
              <tr>
                <td style="border: 2px solid #69c33b; border-radius: 10px; padding: 8px 20px; text-align: center;">
                  <div style="font-size: 15px; font-weight: 900; color: #000000; line-height: 1.2;">${clientName}</div>
                  <div style="font-size: 12px; font-weight: bold; color: #000000; margin-top: 3px;">${displayLocation}</div>
                  ${(clientPhone || clientEmail) ? `<div style="font-size: 13px; font-weight: bold; color: #000000; margin-top: 3px;">${clientPhone || clientEmail}</div>` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <div style="text-align: center; font-weight: bold; font-size: 13px; letter-spacing: 1px; text-decoration: underline; margin-bottom: 16px; text-transform: uppercase;">
        ${devisTitle}
      </div>

      <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
        <thead>
          <tr style="background-color: #2e7d32;">
            <th style="border: 1px solid #000; padding: 7px 5px; font-size: 10px; text-align: center; width: 20%; color: #ffffff;">Désignation</th>
            <th style="border: 1px solid #000; padding: 7px 5px; font-size: 10px; text-align: center; width: 22%; color: #ffffff;">Type de véhicule</th>
            <th style="border: 1px solid #000; padding: 7px 5px; font-size: 10px; text-align: center; width: 13%; color: #ffffff;">Destination</th>
            <th style="border: 1px solid #000; padding: 7px 5px; font-size: 10px; text-align: center; width: 12%; color: #ffffff;">Coût journalier</th>
            <th style="border: 1px solid #000; padding: 7px 5px; font-size: 10px; text-align: center; width: 8%; color: #ffffff;">Quantité</th>
            <th style="border: 1px solid #000; padding: 7px 5px; font-size: 10px; text-align: center; width: 9%; color: #ffffff;">Nbre de jours</th>
            <th style="border: 1px solid #000; padding: 7px 5px; font-size: 10px; text-align: center; width: 16%; color: #ffffff;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          ${totalsRows}
        </tbody>
      </table>

      <div style="margin-top: 16px; font-style: italic; font-size: 11px;">
        Arrêtée la présente à la somme de : <strong>${montantEnLettres} francs CFA</strong>
      </div>

      <div style="margin-top: 16px; font-size: 11px; color: #c62828;">
        <div style="font-weight: bold;">NB :</div>
        <div style="padding-left: 12px;">- Le chauffeur est à votre disposition de 7h à 21h</div>
      </div>

      <div style="position: absolute; bottom: 88px; left: 0; right: 0; height: 0.5cm; background: #69c33b;"></div>

      <div style="position: absolute; bottom: 24px; left: 45px; right: 45px; text-align: center; font-size: 8.5px; color: #333333; line-height: 1.55;">
        ${COMPANY_LETTERHEAD.map((line) => `<div>${line}</div>`).join('')}
      </div>
    </div>
  `;

  // ------------------------- PAGE 2 LOCATION -------------------------
  const primaryVehicle = vehicleRows[0];
  const vehicleName = (primaryVehicle?.vehicleName || quote?.titre || 'SOUTARAH GROUP')
    .replace(/^MITSUBISHI\s+/i, '')
    .toUpperCase();
  const vehicleImg = getVehicleImage(primaryVehicle?.vehicleName || quote?.titre, primaryVehicle?.imageUrl);

  const page2Html = `
    <div id="pdf-page-2" style="width: 794px; min-height: 1120px; padding: 34px 45px 150px; background: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #000000; box-sizing: border-box; position: relative;">
      <div style="font-size: 24px; font-weight: bold; text-decoration: underline; margin-bottom: 40px; text-transform: uppercase;">
        ${vehicleName}
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <img src="${vehicleImg}" style="max-width: 92%; max-height: 520px; object-fit: contain;" />
      </div>

      <div style="position: absolute; bottom: 88px; left: 0; right: 0; height: 0.5cm; background: #69c33b;"></div>

      <div style="position: absolute; bottom: 24px; left: 45px; right: 45px; text-align: center; font-size: 8.5px; color: #333333; line-height: 1.55;">
        ${COMPANY_LETTERHEAD.map((line) => `<div>${line}</div>`).join('')}
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-9999';
  container.innerHTML = page1Html + page2Html;
  document.body.appendChild(container);

  try {
    const page1Elem = container.querySelector('#pdf-page-1');
    const page2Elem = container.querySelector('#pdf-page-2');

    await prepareContainerImages(container);

    const canvas1 = await html2canvas(page1Elem, { scale: 2, useCORS: true, logging: false, imageTimeout: 10000, backgroundColor: '#ffffff' });
    const canvas2 = await html2canvas(page2Elem, { scale: 2, useCORS: true, logging: false, imageTimeout: 10000, backgroundColor: '#ffffff' });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgData1 = canvas1.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData1, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    pdf.addPage();
    const imgData2 = canvas2.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData2, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    const safeRef = reference.replace(/\//g, '-');
    pdf.save(filename || `devis-soutarah-${safeRef}.pdf`);
  } finally {
    document.body.removeChild(container);
  }

  return reference;
}

// ------------------------------------------------------- DEVIS NÉGOCE (MODÈLE OFFICIEL KAROO MLK)

function formatClientNameMultiLines(name) {
  if (!name) return ['CLIENT SOUTARAH'];
  const words = name.trim().split(/\s+/);
  if (words.length <= 2) return [words.join(' ')];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

export async function generateNegoceQuotePdf({ quote = {}, items = [], filename = null, user = null, client = null } = {}) {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  const now = new Date(quote?.cree_le || quote?.createdAt || Date.now());
  const reference = buildNegoceReference(quote, now);
  const dateFormatted = formatLongDate(now);

  const { rows, montantHT } = normalizeNegoceItems(quote, items);
  // Pour le négoce : HT + TVA 18%, pas de TDT
  const tva = Math.round(montantHT * 0.18);
  const montantTTC = montantHT + tva;
  const totals = { ht: montantHT, tva, ttc: montantTTC };
  const montantEnLettres = capitalizeFirst(numberToFrenchWords(montantTTC));

  const { clientName, clientPhone, displayLocation } = resolveClientInfo(quote, client, user);
  const clientNameLines = formatClientNameMultiLines(clientName);

  // Titre du bandeau gris : ex. « FOURNITURE DE MATERIELS PLOMBERIE »
  let bannerTitle = (quote?.titre || quote?.service || '').toUpperCase().trim();
  if (!bannerTitle || bannerTitle === 'NÉGOCE' || bannerTitle === 'NEGOCE') {
    bannerTitle = 'FOURNITURE DE MATERIELS ET EQUIPEMENTS';
  } else if (!bannerTitle.includes('FOURNITURE') && !bannerTitle.includes('VENTE')) {
    bannerTitle = `FOURNITURE DE MATERIELS ${bannerTitle}`;
  }

  // Découpage dynamique des pages :
  // Page 1 avec en-tête + conditions + client box + bandeau peut contenir jusqu'à 13 articles sans totaux,
  // ou jusqu'à 8 articles si les totaux + signature y figurent.
  const pagesChunks = [];
  if (rows.length <= 8) {
    // Tout tient sur la page 1
    pagesChunks.push(rows);
  } else {
    // Page 1 : 13 premiers articles (comme dans le devis de référence KAROO MLK)
    pagesChunks.push(rows.slice(0, 13));
    let remaining = rows.slice(13);
    while (remaining.length > 0) {
      if (remaining.length <= 14) {
        pagesChunks.push(remaining);
        remaining = [];
      } else {
        pagesChunks.push(remaining.slice(0, 16));
        remaining = remaining.slice(16);
      }
    }
  }

  const totalPages = pagesChunks.length;
  let globalItemIndex = 1;

  const pagesHtml = pagesChunks.map((chunk, pageIdx) => {
    const isFirstPage = pageIdx === 0;
    const isLastPage = pageIdx === totalPages - 1;

    const rowsHtml = chunk.map((r) => {
      const idx = globalItemIndex++;
      return `
        <tr>
          <td style="border: 1px solid #000; padding: 6px 4px; font-size: 10.5px; text-align: center; vertical-align: middle; width: 7%;">
            ${idx}
          </td>
          <td style="border: 1px solid #000; padding: 6px 8px; font-size: 10.5px; text-align: left; vertical-align: middle; width: 47%; line-height: 1.3;">
            <div style="font-weight: 500; text-transform: uppercase;">${r.designation}</div>
            ${r.subtext ? `<div style="font-size: 9.5px; color: #333; margin-top: 1px; text-transform: uppercase;">${r.subtext}</div>` : ''}
          </td>
          <td style="border: 1px solid #000; padding: 6px 4px; font-size: 10.5px; text-align: center; vertical-align: middle; width: 8%; text-transform: uppercase;">
            ${r.unite || 'U'}
          </td>
          <td style="border: 1px solid #000; padding: 6px 4px; font-size: 10.5px; text-align: center; vertical-align: middle; width: 8%;">
            ${r.quantity}
          </td>
          <td style="border: 1px solid #000; padding: 6px 6px; font-size: 10.5px; text-align: center; vertical-align: middle; width: 15%; white-space: nowrap;">
            ${formatMoney(r.unitPrice)}
          </td>
          <td style="border: 1px solid #000; padding: 6px 6px; font-size: 10.5px; text-align: center; vertical-align: middle; width: 15%; white-space: nowrap;">
            ${formatMoney(r.total)}
          </td>
        </tr>
      `;
    }).join('');

    const totalsBlockHtml = isLastPage ? `
      <tr>
        <td colspan="5" style="border: 1px solid #000; padding: 6px 12px; font-size: 11px; font-weight: bold; text-align: center; background: #ffffff;">
          MONTANT HT
        </td>
        <td style="border: 1px solid #000; padding: 6px 8px; font-size: 11px; font-weight: bold; text-align: center; background: #dbdbdb; white-space: nowrap;">
          ${formatMoney(totals.ht)}
        </td>
      </tr>
      <tr>
        <td colspan="5" style="border: 1px solid #000; padding: 6px 12px; font-size: 11px; font-weight: bold; text-align: center; background: #ffffff;">
          TVA 18%
        </td>
        <td style="border: 1px solid #000; padding: 6px 8px; font-size: 11px; font-weight: bold; text-align: center; background: #dbdbdb; white-space: nowrap;">
          ${formatMoney(totals.tva)}
        </td>
      </tr>
      <tr>
        <td colspan="5" style="border: 1px solid #000; padding: 6px 12px; font-size: 11px; font-weight: bold; text-align: center; background: #ffffff;">
          MONTANT TTC
        </td>
        <td style="border: 1px solid #000; padding: 6px 8px; font-size: 11px; font-weight: bold; text-align: center; background: #dbdbdb; white-space: nowrap;">
          ${formatMoney(totals.ttc)}
        </td>
      </tr>
    ` : '';

    const arrêtéAndSignatureHtml = isLastPage ? `
      <div style="margin-top: 18px; font-size: 12.5px; color: #000000; line-height: 1.45;">
        Arrêté la présente à la somme de : <strong style="font-style: italic;">${montantEnLettres} francs CFA</strong>
      </div>

      <div style="margin-top: 24px; text-align: right; padding-right: 15px;">
        <div style="display: inline-block; background: rgba(235, 245, 235, 0.7); border-radius: 8px; padding: 10px 24px; text-align: center;">
          <span style="font-size: 13px; font-weight: bold; text-decoration: underline; letter-spacing: 0.5px; color: #000000;">
            SOUTARAH GROUP
          </span>
        </div>
      </div>
    ` : '';

    const firstPageHeader = isFirstPage ? `
      <!-- En-tête référence à droite + date -->
      <div style="text-align: right; margin-bottom: 8px;">
        <div style="font-size: 18px; font-weight: 900; letter-spacing: 0.5px; color: #000000; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          Devis N°${reference.replace(/^Devis\s*N°?\s*/i, '')}
        </div>
        <div style="font-size: 12.5px; color: #555555; margin-top: 3px; font-weight: normal;">
          ${dateFormatted}
        </div>
      </div>

      <!-- Conditions (gauche) et bloc client (droite) -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
        <tr>
          <!-- Conditions à gauche -->
          <td style="vertical-align: top; width: 48%; padding-right: 12px;">
            <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
              <tr>
                <td style="border: 1px solid #000; padding: 6px 6px; font-size: 11px; font-weight: bold; font-style: italic; text-align: center; width: 38%; background: #ffffff; white-space: nowrap;">
                  VALIDITE
                </td>
                <td style="border: 1px solid #000; padding: 6px 6px; font-size: 11px; font-weight: bold; text-align: center; background: #ffffff;">
                  2 SEMAINES
                </td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 6px 6px; font-size: 11px; font-weight: bold; font-style: italic; text-align: center; background: #ffffff; white-space: nowrap;">
                  DELAI
                </td>
                <td style="border: 1px solid #000; padding: 6px 6px; font-size: 11px; font-weight: bold; text-align: center; line-height: 1.2; background: #ffffff;">
                  DISPONIBLE SAUF<br/>VENTE
                </td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 6px 6px; font-size: 11px; font-weight: bold; font-style: italic; text-align: center; background: #ffffff; white-space: nowrap;">
                  REGLEMENT
                </td>
                <td style="border: 1px solid #000; padding: 6px 6px; font-size: 11px; font-weight: bold; text-align: center; background: #ffffff;">
                  100% A LA COMMANDE
                </td>
              </tr>
            </table>
          </td>

          <!-- Bloc client à droite -->
          <td style="vertical-align: top; width: 52%; text-align: right;">
            <div style="border: 2.5px solid #00b050; border-radius: 20px; padding: 10px 18px; text-align: center; background: #ffffff; box-sizing: border-box; min-width: 250px; display: inline-block;">
              <div style="font-size: 15px; font-weight: 900; color: #000000; line-height: 1.25; text-transform: uppercase;">
                ${clientNameLines.map((line) => `<div>${line}</div>`).join('')}
              </div>
              <div style="font-size: 12px; font-weight: normal; color: #000000; margin-top: 3px; text-transform: uppercase;">
                ${displayLocation}
              </div>
              ${clientPhone ? `<div style="font-size: 12px; font-weight: normal; color: #000000; margin-top: 2px;">${clientPhone}</div>` : ''}
            </div>
          </td>
        </tr>
      </table>

      <!-- Bandeau Titre Gris -->
      <div style="width: 100%; background-color: #d9d9d9; padding: 7px 10px; text-align: center; font-size: 16px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; color: #000000; box-sizing: border-box; margin-bottom: 12px; font-family: 'Arial Black', Arial, 'Helvetica Neue', sans-serif;">
        ${bannerTitle}
      </div>
    ` : '';

    return `
      <div id="pdf-negoce-page-${pageIdx + 1}" style="width: 794px; min-height: 1123px; height: 1123px; padding: 25px 42px 85px 42px; background: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #000000; box-sizing: border-box; position: relative; overflow: hidden;">
        <!-- Fond officiel HD Soutarah Group (Logo + Cartouche activités + Filigrane) -->
        <img src="${LETTERHEAD_BG}" style="position: absolute; top: 0; left: 0; width: 794px; height: 1123px; pointer-events: none; z-index: 0; object-fit: fill;" />

        <div style="position: relative; z-index: 1; margin-top: ${isFirstPage ? '100px' : '90px'};">
          ${firstPageHeader}

          <!-- Tableau des articles -->
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            ${isFirstPage ? `
              <thead>
                <tr style="background-color: #00b050;">
                  <th style="border: 1px solid #000; padding: 7px 4px; font-size: 11px; text-align: center; width: 7%; color: #000000; font-family: 'Times New Roman', Times, serif; font-weight: bold;">ITEMS</th>
                  <th style="border: 1px solid #000; padding: 7px 6px; font-size: 11px; text-align: center; width: 47%; color: #000000; font-family: 'Times New Roman', Times, serif; font-weight: bold;">DESIGNATION</th>
                  <th style="border: 1px solid #000; padding: 7px 4px; font-size: 11px; text-align: center; width: 8%; color: #000000; font-family: 'Times New Roman', Times, serif; font-weight: bold;">UNITE</th>
                  <th style="border: 1px solid #000; padding: 7px 4px; font-size: 11px; text-align: center; width: 8%; color: #000000; font-family: 'Times New Roman', Times, serif; font-weight: bold;">QTE</th>
                  <th style="border: 1px solid #000; padding: 7px 4px; font-size: 11px; text-align: center; width: 15%; color: #000000; font-family: 'Times New Roman', Times, serif; font-weight: bold; line-height: 1.15;">PRIX<br/>UNITAIRE</th>
                  <th style="border: 1px solid #000; padding: 7px 4px; font-size: 11px; text-align: center; width: 15%; color: #000000; font-family: 'Times New Roman', Times, serif; font-weight: bold; line-height: 1.15;">MONTANT<br/>TOTAL HT</th>
                </tr>
              </thead>
            ` : ''}
            <tbody>
              ${rowsHtml}
              ${totalsBlockHtml}
            </tbody>
          </table>

          ${arrêtéAndSignatureHtml}
        </div>

        <!-- Filet vert officiel au-dessus du pied de page (toute la largeur) -->
        <div style="position: absolute; bottom: 62px; left: 0; right: 0; height: 5px; background: #009a49; z-index: 1;"></div>

        <!-- Pied de page officiel complet -->
        <div style="position: absolute; bottom: 14px; left: 42px; right: 42px; text-align: center; font-size: 8px; color: #000000; line-height: 1.45; font-family: Arial, Helvetica, sans-serif; z-index: 1;">
          <div>Société à Responsabilité limitée SARL, Capital : 10 000 000 FCFA • Abidjan, Palmeraie Saint Viateur</div>
          <div>25 BP 1032 Abidjan 25 • Tél : 27 22 30 11 27 / 07 18 88 88 89 / 07 18 40 40 40 / 07 06 91 91 91 / 07 69 38 66 50</div>
          <div>N°RCCM : CI-ABJ-03-2022-B12-03750 • N°CC : 2242663 T • Compte Bancaire BNI : CI092 01021 000108230000 36</div>
          <div>Email: infosoutarahgroup@gmail.com - info@soutarahgroup.ci • Web: www.soutarah-group.ci</div>
        </div>
      </div>
    `;
  }).join('');

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-9999';
  container.innerHTML = pagesHtml;
  document.body.appendChild(container);

  try {
    await prepareContainerImages(container);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < totalPages; i += 1) {
      const pageElem = container.querySelector(`#pdf-negoce-page-${i + 1}`);
      const canvas = await html2canvas(pageElem, {
        scale: 2,
        useCORS: true,
        logging: false,
        imageTimeout: 10000,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    const safeRef = reference.replace(/\//g, '-');
    pdf.save(filename || `devis-soutarah-${safeRef}.pdf`);
  } finally {
    document.body.removeChild(container);
  }

  return reference;
}

// ------------------------------------------------------- Export principal (Routage Automatique)

export async function generateQuotePdf(params = {}) {
  const { quote = {}, items = [] } = params;
  const quoteType = detectQuoteType(quote, items);

  if (quoteType === 'negoce') {
    return generateNegoceQuotePdf(params);
  }

  // Panier mixte (négoce + location) : télécharge un devis par type.
  // Le devis négoce reprend le modèle officiel KAROO MLK ; le devis location
  // conserve le modèle véhicule avec photo. Aucun mélange dans un même PDF.
  if (quoteType === 'mixed') {
    const rows = Array.isArray(items) ? items : [];
    const vehicleItems = rows.filter((it) => isVehicleItem(it));
    const productItems = rows.filter((it) => !isVehicleItem(it));

    const generated = [];
    if (productItems.length > 0) {
      generated.push(await generateNegoceQuotePdf({ ...params, items: productItems }));
    }
    if (vehicleItems.length > 0) {
      generated.push(await generateLocationQuotePdf({ ...params, items: vehicleItems }));
    }
    return generated.join(' | ');
  }

  return generateLocationQuotePdf(params);
}
