import { computeQuoteTotals } from './quoteTotals';

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

const formatMoney = (val) => new Intl.NumberFormat('fr-FR').format(val || 0);

export async function generateQuotePdf({ quote, items = [], user = null, client = null, filename = null } = {}) {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  const reference = quote?.reference || `DMD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date(quote?.cree_le || quote?.createdAt || Date.now());
  const dateFormatted = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const dateCapitalized = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  // Normalisation des lignes
  let rows = items;
  if (rows.length === 0 && quote?.description) {
    const match = quote.description.match(/Location\s+(.+?)\s*\((\d+)j?\)/i);
    rows = [{
      title: match ? match[1] : (quote.titre || quote.service || 'LOCATION DE VEHICULE'),
      vehicleModel: match ? match[1] : (quote.titre || 'Audi A6'),
      destination: quote.lieu || 'ABIDJAN',
      startDate: quote.delai ? quote.delai.split(' ')[0] : '',
      endDate: '',
      quantity: 1,
      days: match ? parseInt(match[2], 10) : 1,
      dailyPrice: Number(quote.budget || quote.montant_total || 165000),
      total: Number(quote.budget || quote.montant_total || 165000),
      imageUrl: quote.vehicule?.image_url || quote.vehicule_image_url || null,
    }];
  }

  const normalizedItems = rows.map((it) => {
    const dailyPrice = Number(it.unitPrice || it.dailyPrice || it.prix_unitaire || 165000);
    const quantity = Number(it.quantity || it.quantite || 1);
    const days = Number(it.days || it.duration || 1);
    const total = Number(it.total || it.totalPrice || (dailyPrice * quantity * days));
    return {
      title: it.designation || it.title || 'LOCATION DE VEHICULE',
      vehicleModel: it.vehicleType || it.vehicleModel || it.vehicle?.name || it.libelle || 'Audi A6',
      destination: it.destination || quote?.lieu || 'ABIDJAN',
      startDate: it.startDate || '',
      endDate: it.endDate || '',
      quantity,
      days,
      dailyPrice,
      total,
      imageUrl: it.imageUrl || it.vehicle?.image_url || null,
    };
  });

  const montantHT = normalizedItems.reduce((acc, it) => acc + it.total, 0) || Number(quote?.montant_total || 165000);
  const totals = computeQuoteTotals(montantHT);
  const montantTTC = totals.ttc;
  const montantEnLettres = numberToFrenchWords(montantTTC);
  const montantEnLettresCap = montantEnLettres.charAt(0).toUpperCase() + montantEnLettres.slice(1);

  const clientName = quote?.nom || client?.entreprise?.nom || [client?.prenom, client?.nom].filter(Boolean).join(' ') || user?.nom || 'David Sorho';
  const clientAddress = quote?.lieu || client?.adresse || 'cocody, snk';
  const clientPhone = quote?.telephone || user?.telephone || '0584278638';

  const rowsHtml = normalizedItems.map((it) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #000; font-size: 10px; text-align: center;">
        <strong>LOCATION DE VEHICULE</strong><br>
        ${it.startDate ? `Du ${it.startDate} AU ${it.endDate}` : 'Du 22/08/2026 AU 23/08/2026'}
      </td>
      <td style="padding: 8px; border: 1px solid #000; font-size: 10px;">
        <strong>${it.vehicleModel}</strong><br>
        <span style="font-size: 9px; color: #444;">Climatisé et confortable</span>
      </td>
      <td style="padding: 8px; border: 1px solid #000; font-size: 10px; text-align: center; font-weight: bold;">
        ${it.destination}
      </td>
      <td style="padding: 8px; border: 1px solid #000; font-size: 10px; text-align: center;">
        ${formatMoney(it.dailyPrice)}
      </td>
      <td style="padding: 8px; border: 1px solid #000; font-size: 10px; text-align: center;">
        ${it.quantity}
      </td>
      <td style="padding: 8px; border: 1px solid #000; font-size: 10px; text-align: center;">
        ${it.days}
      </td>
      <td style="padding: 8px; border: 1px solid #000; font-size: 10px; text-align: right; font-weight: bold;">
        ${formatMoney(it.total)}
      </td>
    </tr>
  `).join('');

  // Page 1 HTML
  const page1Html = `
    <div id="pdf-page-1" style="width: 794px; min-height: 1120px; padding: 35px 45px; background: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #000000; box-sizing: border-box; position: relative;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
        <div>
          <div style="font-size: 24px; font-weight: 900; color: #144627; letter-spacing: 1px;">
            SOUTARAH <span style="font-size: 18px; font-weight: 700; color: #333333;">GROUP</span>
          </div>
        </div>
        <div style="font-size: 9px; color: #444444; text-align: right; line-height: 1.35;">
          Location de véhicules | Entretien d'espaces verts<br>
          Entretien de locaux | Maintenance | Installation<br>
          électrique BTP et divers | Énergie solaire et<br>
          efficacité énergétique | Négoce | Import/Export<br>
          Agro Pastoral
        </div>
      </div>

      <!-- Conditions & Devis Info -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
        <!-- Table conditions (gauche) -->
        <table style="width: 46%; border-collapse: collapse;">
          <tr>
            <td style="border: 1px solid #000; padding: 5px 8px; font-size: 10px; font-weight: bold; width: 35%;">VALIDITE</td>
            <td style="border: 1px solid #000; padding: 5px 8px; font-size: 10px; font-weight: bold; text-align: center;">02 SEMAINES</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 5px 8px; font-size: 10px; font-weight: bold;">DELAI</td>
            <td style="border: 1px solid #000; padding: 5px 8px; font-size: 10px; font-weight: bold; text-align: center;">DISPONIBLE SAUF LOCATION</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 5px 8px; font-size: 10px; font-weight: bold;">REGLEMENT</td>
            <td style="border: 1px solid #000; padding: 5px 8px; font-size: 10px; font-weight: bold; text-align: center;">SELON CONTRAT</td>
          </tr>
        </table>

        <!-- Info devis & client (droite) -->
        <div style="width: 48%; text-align: right;">
          <div style="font-size: 18px; font-weight: 900; margin-bottom: 4px;">
            Devis N° ${reference}
          </div>
          <div style="font-size: 12px; margin-bottom: 12px;">
            ${dateCapitalized}
          </div>
          <!-- Box client vert -->
          <div style="border: 2px solid #15803d; border-radius: 14px; padding: 10px 16px; text-align: center; background: #ffffff; width: 85%; margin-left: auto;">
            <div style="font-size: 14px; font-weight: 900; color: #000000;">${clientName}</div>
            <div style="font-size: 11px; color: #222222; margin-top: 2px;">${clientAddress}</div>
            <div style="font-size: 11px; color: #222222; margin-top: 1px;">${clientPhone}</div>
          </div>
        </div>
      </div>

      <!-- Banner section -->
      <div style="background-color: #64748b; color: #ffffff; text-align: center; font-weight: 900; font-size: 13px; padding: 7px 0; letter-spacing: 0.5px; margin-bottom: 0px; border: 1px solid #475569;">
        ${(quote?.service || 'LOCATION DE VEHICULE AVEC CHAUFFEUR').toUpperCase()}
      </div>

      <!-- Main Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 0px;">
        <thead>
          <tr style="background-color: #15803d; color: #ffffff;">
            <th style="border: 1px solid #000; padding: 8px 4px; font-size: 10px; text-align: center; width: 22%;">Désignation</th>
            <th style="border: 1px solid #000; padding: 8px 4px; font-size: 10px; text-align: center; width: 22%;">Type de véhicule</th>
            <th style="border: 1px solid #000; padding: 8px 4px; font-size: 10px; text-align: center; width: 14%;">Destination</th>
            <th style="border: 1px solid #000; padding: 8px 4px; font-size: 10px; text-align: center; width: 13%;">Coût journalier</th>
            <th style="border: 1px solid #000; padding: 8px 4px; font-size: 10px; text-align: center; width: 8%;">Quantité</th>
            <th style="border: 1px solid #000; padding: 8px 4px; font-size: 10px; text-align: center; width: 9%;">Nbre de jours</th>
            <th style="border: 1px solid #000; padding: 8px 4px; font-size: 10px; text-align: center; width: 12%;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <!-- Subtotals Table -->
      <table style="width: 100%; border-collapse: collapse; margin-top: -1px;">
        <tr>
          <td style="border: 1px solid #000; padding: 6px 12px; font-size: 10px; font-weight: bold; text-align: right; width: 79%;">MONTANT HT</td>
          <td style="border: 1px solid #000; padding: 6px 12px; font-size: 10px; font-weight: bold; text-align: right; width: 21%;">${formatMoney(montantHT)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 6px 12px; font-size: 10px; font-weight: bold; text-align: right;">TVA 18% (NON FACTUREE)</td>
          <td style="border: 1px solid #000; padding: 6px 12px; font-size: 10px; text-align: right;">${formatMoney(totals.tva)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 6px 12px; font-size: 10px; font-weight: bold; text-align: right;">TDT 2.5% (NON FACTUREE)</td>
          <td style="border: 1px solid #000; padding: 6px 12px; font-size: 10px; text-align: right;">${formatMoney(totals.tdt)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 6px 12px; font-size: 11px; font-weight: 900; text-align: right;">MONTANT TTC</td>
          <td style="border: 1px solid #000; padding: 6px 12px; font-size: 11px; font-weight: 900; text-align: right;">${formatMoney(montantTTC)}</td>
        </tr>
      </table>

      <!-- Arrêté en lettres -->
      <div style="margin-top: 14px; font-style: italic; font-size: 11px;">
        Arrêtée la présente à la somme de : <strong>${montantEnLettresCap} francs CFA</strong>
      </div>

      <!-- NB Notice -->
      <div style="margin-top: 14px; font-size: 11px;">
        <span style="color: #dc2626; font-weight: 900;">NB :</span><br>
        <span style="color: #dc2626; padding-left: 10px;">• Le chauffeur est à votre disposition de 7h à 21h</span>
      </div>

      <!-- Signature -->
      <div style="margin-top: 50px; text-align: right; padding-right: 30px;">
        <div style="font-size: 14px; font-weight: 900; color: #000000;">SOUTARAH GROUP</div>
      </div>

      <!-- Footer fixe -->
      <div style="position: absolute; bottom: 25px; left: 45px; right: 45px;">
        <div style="border-top: 1px solid #000; padding-top: 8px; font-size: 7.5px; color: #333333; text-align: center; line-height: 1.35;">
          Société à Responsabilité limitée SARL, Capital : 10 000 000 FCFA • Abidjan, Palmeraie Saint Viateur<br>
          25 BP 1032 Abidjan 25 • Tél : 27 22 30 11 27 / 07 18 88 88 89 / 07 18 40 40 40 / 07 06 91 91 91 / 07 69 38 66 50<br>
          N°RCCM : CI-ABJ-03-2022-B12-03750 • N°CC : 2242663 T • Compte Bancaire BNI : CI092 01021 000108230000 36<br>
          Email: infosoutarahgroup@gmail.com - info@soutarahgroup.ci • Web: www.soutarah-group.ci
        </div>
        <div style="font-size: 8px; color: #777777; text-align: center; margin-top: 12px;">
          Document contractuel SOUTARAH GROUP • Devis N° ${reference}
        </div>
      </div>
    </div>
  `;

  // Page 2 HTML (Véhicule)
  const vehicleName = normalizedItems[0]?.vehicleModel || 'AUDI A6';
  const vehicleImg = normalizedItems[0]?.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80';

  const page2Html = `
    <div id="pdf-page-2" style="width: 794px; min-height: 1120px; padding: 35px 45px; background: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #000000; box-sizing: border-box; position: relative;">
      <!-- Header avec adresse -->
      <div style="font-size: 7.5px; color: #333333; text-align: center; line-height: 1.3; margin-bottom: 20px;">
        Société à Responsabilité limitée SARL, Capital : 10 000 000 FCFA • Abidjan, Palmeraie Saint Viateur<br>
        25 BP 1032 Abidjan 25 • Tél : 27 22 30 11 27 / 07 18 88 88 89 / 07 18 40 40 40 / 07 06 91 91 91 / 07 69 38 66 50<br>
        N°RCCM : CI-ABJ-03-2022-B12-03750 • N°CC : 2242663 T • Compte Bancaire BNI : CI092 01021 000108230000 36<br>
        Email: infosoutarahgroup@gmail.com - info@soutarahgroup.ci • Web: www.soutarah-group.ci
      </div>

      <!-- Logo & Line -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #15803d; padding-bottom: 8px; margin-bottom: 30px;">
        <div style="font-size: 24px; font-weight: 900; color: #144627; letter-spacing: 1px;">
          SOUTARAH <span style="font-size: 16px; font-weight: 600; color: #333333;">GROUP</span>
        </div>
        <div style="font-size: 9px; color: #555555; text-align: right;">
          Location de véhicules | Entretien d'espaces verts | Maintenance BTP | Énergie solaire
        </div>
      </div>

      <!-- Titre véhicule -->
      <h1 style="font-size: 22px; font-weight: 900; text-transform: uppercase; margin-top: 10px; margin-bottom: 30px; text-decoration: underline;">
        ${vehicleName}
      </h1>

      <!-- Image Véhicule centrée -->
      <div style="text-align: center; margin: 40px 0;">
        <img src="${vehicleImg}" style="max-width: 90%; max-height: 480px; object-fit: contain;" />
      </div>

      <!-- Footer fixe -->
      <div style="position: absolute; bottom: 25px; left: 45px; right: 45px;">
        <div style="border-top: 1px solid #cccccc; padding-top: 8px; font-size: 8px; color: #777777; text-align: center;">
          Document contractuel SOUTARAH GROUP • Devis N° ${reference}
        </div>
      </div>
    </div>
  `;

  // Rendu Canvas -> PDF (2 Pages)
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

    const canvas1 = await html2canvas(page1Elem, { scale: 2, useCORS: true, logging: false });
    const canvas2 = await html2canvas(page2Elem, { scale: 2, useCORS: true, logging: false });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Page 1
    const imgData1 = canvas1.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData1, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    // Page 2
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