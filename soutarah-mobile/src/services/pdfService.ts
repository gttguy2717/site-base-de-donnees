import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';
import { API_URL } from '../theme';

const formatMoney = (value: number | string | undefined | null): string => {
  const n = Number(value || 0);
  return n.toLocaleString('fr-FR');
};

function numberToFrenchWords(num: number): string {
  if (num === 0) return 'zéro';
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

  function convertSmall(n: number): string {
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

export interface QuotePdfItem {
  title: string;
  vehicleModel?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  days: number;
  quantity: number;
  dailyPrice: number;
  total: number;
  imageUrl?: string | null;
}

export interface QuotePdfData {
  reference: string;
  dateStr?: string;
  client: {
    name: string;
    companyName?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items: QuotePdfItem[];
  totalAmount: number;
  notes?: string;
}

export async function generateAndDownloadQuotePdf(data: QuotePdfData): Promise<string | null> {
  try {
    const now = new Date();
    const dateFormatted = data.dateStr || now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const dateCapitalized = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

    // Calculs financiers officiels conformes au devis SOUTARAH
    const montantHT = data.items.reduce((acc, it) => acc + (it.dailyPrice * it.days * it.quantity), 0) || data.totalAmount;
    const tva = Math.round(montantHT * 0.18);
    const tdt = Math.round(montantHT * 0.025);
    const montantTTC = montantHT + tva + tdt;
    const montantEnLettres = numberToFrenchWords(montantTTC);
    const montantEnLettresCap = montantEnLettres.charAt(0).toUpperCase() + montantEnLettres.slice(1);

    // Lignes de tableau
    const rowsHtml = data.items
      .map(
        (it) => `
        <tr>
          <td style="padding: 10px 8px; border: 1px solid #111; font-size: 11px; text-align: center;">
            <strong>LOCATION DE VEHICULE</strong><br>
            ${it.startDate && it.endDate ? `Du ${it.startDate} AU ${it.endDate}` : ''}
          </td>
          <td style="padding: 10px 8px; border: 1px solid #111; font-size: 11px;">
            <strong>${it.vehicleModel || it.title}</strong><br>
            <span style="font-size: 10px; color: #333;">Climatisé et confortable</span>
          </td>
          <td style="padding: 10px 8px; border: 1px solid #111; font-size: 11px; text-align: center; font-weight: bold;">
            ${it.destination || 'ABIDJAN'}
          </td>
          <td style="padding: 10px 8px; border: 1px solid #111; font-size: 11px; text-align: center;">
            ${formatMoney(it.dailyPrice)}
          </td>
          <td style="padding: 10px 8px; border: 1px solid #111; font-size: 11px; text-align: center;">
            ${it.quantity}
          </td>
          <td style="padding: 10px 8px; border: 1px solid #111; font-size: 11px; text-align: center;">
            ${it.days}
          </td>
          <td style="padding: 10px 8px; border: 1px solid #111; font-size: 11px; text-align: right; font-weight: bold;">
            ${formatMoney(it.dailyPrice * it.days * it.quantity)}
          </td>
        </tr>
      `
      )
      .join('');

    // Page 2 Images (Obligatoire pour avoir 2 pages)
    const fallbackImg = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80';
    const page2ImagesHtml = (data.items.length > 0 ? data.items : [{ title: 'Véhicule SOUTARAH', imageUrl: fallbackImg, vehicleModel: undefined as string | undefined }])
      .map(
        (it) => {
          const rawUrl = it.imageUrl || fallbackImg;
          const imgUri = rawUrl.startsWith('http') || rawUrl.startsWith('data:') ? rawUrl : `${API_URL.replace('/api', '')}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
          return `
        <div style="page-break-before: always; padding: 25px 20px; font-family: 'Helvetica Neue', Arial, sans-serif;">
          <div style="font-size: 8px; color: #444; line-height: 1.3; text-align: center; margin-bottom: 20px;">
            Société à Responsabilité limitée SARL, Capital : 10 000 000 FCFA • Abidjan, Palmeraie Saint Viateur<br>
            25 BP 1032 Abidjan 25 • Tél : 27 22 30 11 27 / 07 18 88 88 89 / 07 18 40 40 40 / 07 06 91 91 91 / 07 69 38 66 50<br>
            N°RCCM : CI-ABJ-03-2022-B12-03750 • N°CC : 2242663 T • Compte Bancaire BNI : CI092 01021 000108230000 36<br>
            Email: infosoutarahgroup@gmail.com - info@soutarahgroup.ci • Web: www.soutarah-group.ci
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #15803d; padding-bottom: 10px; margin-bottom: 25px;">
            <div style="font-size: 20px; font-weight: 900; color: #144627; letter-spacing: 1px;">
              SOUTARAH <span style="font-size: 14px; font-weight: 600; color: #444;">GROUP</span>
            </div>
            <div style="font-size: 8px; color: #666; text-align: right;">
              Location de véhicules | Entretien d'espaces verts | Maintenance BTP | Énergie solaire
            </div>
          </div>

          <h2 style="font-size: 16px; font-weight: 900; text-decoration: underline; margin-bottom: 12px; text-transform: uppercase;">
            ${it.vehicleModel || it.title}
          </h2>

          <div style="font-size: 11px; color: #15803d; font-weight: bold; margin-bottom: 20px;">
            Aperçu visuel du véhicule proposé dans l'offre de location
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <img src="${imgUri}" style="max-width: 90%; max-height: 420px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.12);" />
          </div>

          <div style="position: fixed; bottom: 20px; left: 20px; right: 20px; font-size: 8px; color: #666; text-align: center; border-top: 1px solid #ccc; padding-top: 10px;">
            Document contractuel SOUTARAH GROUP • Devis N° ${data.reference}
          </div>
        </div>
      `;
        }
      )
      .join('');

    const clientDisplayName = data.client.companyName || data.client.name || 'CLIENT SOUTARAH';
    const clientCity = data.client.address || 'ABIDJAN';
    const clientPhone = data.client.phone || '+225 00 00 00 00 00';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Devis N° ${data.reference}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 10px 15px;
            color: #000000;
            font-size: 11px;
            line-height: 1.35;
          }
          .brand-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 14px;
          }
          .brand-logo-text {
            font-size: 22px;
            font-weight: 900;
            color: #144627;
            letter-spacing: 1.5px;
          }
          .brand-services-list {
            font-size: 7.5px;
            color: #666666;
            text-align: right;
            line-height: 1.25;
          }
          .devis-header-grid {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 14px;
          }
          .conditions-table {
            width: 48%;
            border-collapse: collapse;
          }
          .conditions-table td {
            border: 1px solid #000;
            padding: 4px 8px;
            font-size: 10px;
            font-weight: bold;
          }
          .conditions-table .label-cell {
            background-color: #ffffff;
            width: 35%;
          }
          .devis-right-box {
            width: 46%;
            text-align: right;
          }
          .devis-ref-title {
            font-size: 15px;
            font-weight: 900;
            margin-bottom: 2px;
          }
          .devis-date-text {
            font-size: 11px;
            margin-bottom: 8px;
          }
          .client-green-box {
            border: 2px solid #15803d;
            border-radius: 12px;
            padding: 8px 12px;
            text-align: center;
            background-color: #ffffff;
            margin-left: auto;
            width: 85%;
          }
          .client-box-name {
            font-size: 13px;
            font-weight: 900;
            color: #000000;
          }
          .client-box-sub {
            font-size: 11px;
            color: #111111;
            margin-top: 1px;
          }
          .section-banner {
            background-color: #94a3b8;
            color: #000000;
            text-align: center;
            font-weight: 900;
            font-size: 12px;
            padding: 5px 0;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
            border: 1px solid #64748b;
          }
          .main-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0px;
          }
          .main-table th {
            background-color: #15803d;
            color: #000000;
            font-size: 10px;
            font-weight: bold;
            padding: 6px 4px;
            border: 1px solid #000;
            text-align: center;
          }
          .financial-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: -1px;
          }
          .financial-table td {
            border: 1px solid #000;
            padding: 5px 8px;
            font-size: 10px;
          }
          .arrete-box {
            margin-top: 12px;
            font-style: italic;
            font-size: 11px;
          }
          .nb-box {
            margin-top: 12px;
            font-size: 11px;
            color: #b91c1c;
            font-weight: bold;
          }
          .signature-box {
            margin-top: 130px;
            text-align: right;
            padding-right: 20px;
          }
          .signature-title {
            font-size: 12px;
            font-weight: 900;
            color: #000000;
            margin-bottom: 8px;
          }
          .bottom-footer {
            margin-top: 180px;
            border-top: 1px solid #000;
            padding-top: 8px;
            font-size: 7.5px;
            color: #444;
            text-align: center;
            line-height: 1.3;
          }
        </style>
      </head>
      <body>
        <!-- Logo & Services Tags -->
        <div class="brand-row">
          <div class="brand-logo-text">
            SOUTARAH <span style="font-size: 14px; font-weight: 700; color: #333;">GROUP</span>
          </div>
          <div class="brand-services-list">
            Location de véhicules | Entretien d'espaces verts<br>
            Entretien de locaux | Maintenance | Installation<br>
            électrique BTP et divers | Energie solaire et<br>
            efficacité énergétique | Négoce | Import/Export<br>
            Agro Pastoral
          </div>
        </div>

        <!-- Conditions & Devis Info Header -->
        <div class="devis-header-grid">
          <table class="conditions-table">
            <tr>
              <td class="label-cell">VALIDITE</td>
              <td style="text-align: center;">02 SEMAINES</td>
            </tr>
            <tr>
              <td class="label-cell">DELAI</td>
              <td style="text-align: center;">DISPONIBLE SAUF LOCATION</td>
            </tr>
            <tr>
              <td class="label-cell">REGLEMENT</td>
              <td style="text-align: center;">SELON CONTRAT</td>
            </tr>
          </table>

          <div class="devis-right-box">
            <div class="devis-ref-title">Devis N° ${data.reference}</div>
            <div class="devis-date-text">${dateCapitalized}</div>

            <div class="client-green-box">
              <div class="client-box-name">${clientDisplayName}</div>
              <div class="client-box-sub">${clientCity}</div>
              <div class="client-box-sub">${clientPhone}</div>
            </div>
          </div>
        </div>

        <!-- Section Banner Title -->
        <div class="section-banner">
          LOCATION DE VEHICULE AVEC CHAUFFEUR
        </div>

        <!-- Main Items Table -->
        <table class="main-table">
          <thead>
            <tr>
              <th style="width: 22%;">Désignation</th>
              <th style="width: 26%;">Type de véhicule</th>
              <th style="width: 14%;">Destination</th>
              <th style="width: 12%;">Coût journalier</th>
              <th style="width: 6%;">Quantité</th>
              <th style="width: 8%;">Nbre de jours</th>
              <th style="width: 12%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <!-- Financial Breakdown Table -->
        <table class="financial-table">
          <tr>
            <td colspan="6" style="text-align: center; font-weight: 900; background-color: #ffffff; width: 88%;">MONTANT HT</td>
            <td style="text-align: right; font-weight: 900; width: 12%;">${formatMoney(montantHT)}</td>
          </tr>
          <tr>
            <td colspan="6" style="text-align: center; font-weight: bold; background-color: #ffffff;">TVA 18%</td>
            <td style="text-align: right;">${formatMoney(tva)}</td>
          </tr>
          <tr>
            <td colspan="6" style="text-align: center; font-weight: bold; background-color: #ffffff;">TDT 2.5%</td>
            <td style="text-align: right;">${formatMoney(tdt)}</td>
          </tr>
          <tr>
            <td colspan="6" style="text-align: center; font-weight: 900; background-color: #ffffff;">MONTANT TTC</td>
            <td style="text-align: right; font-weight: 900;">${formatMoney(montantTTC)}</td>
          </tr>
        </table>

        <!-- Total Arrêté en lettres -->
        <div class="arrete-box">
          Arrêtée la présente à la somme de : <strong>${montantEnLettresCap} francs CFA</strong>
        </div>

        <!-- NB Chauffeur -->
        <div class="nb-box">
          NB :<br>
          <span style="margin-left: 10px; font-weight: normal; color: #dc2626;">• Le chauffeur est à votre disposition de 7h à 21h</span>
        </div>

        <!-- Signature SOUTARAH GROUP -->
        <div class="signature-box">
          <div class="signature-title">SOUTARAH GROUP</div>
        </div>

        <!-- Footer Juridique -->
        <div class="bottom-footer">
          Société à Responsabilité limitée SARL, Capital : 10 000 000 FCFA • Abidjan, Palmeraie Saint Viateur<br>
          25 BP 1032 Abidjan 25 • Tél : 27 22 30 11 27 / 07 18 88 88 89 / 07 18 40 40 40 / 07 06 91 91 91 / 07 69 38 66 50<br>
          N°RCCM : CI-ABJ-03-2022-B12-03750 • N°CC : 2242663 T • Compte Bancaire BNI : CI092 01021 000108230000 36<br>
          Email: infosoutarahgroup@gmail.com - info@soutarahgroup.ci • Web: www.soutarah-group.ci
        </div>

        <!-- Page 2 (Photos des véhicules si disponibles) -->
        ${page2ImagesHtml}
      </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Télécharger le devis ${data.reference}`,
        UTI: 'com.adobe.pdf',
      });
    }

    return uri;
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    Alert.alert('Erreur', 'Impossible de générer le devis en PDF.');
    return null;
  }
}

export async function downloadSignedQuoteDocument(docUrl: string, fileName?: string): Promise<void> {
  try {
    let fullUrl = docUrl;
    if (!docUrl.startsWith('http')) {
      const baseUrl = API_URL.replace('/api', '');
      fullUrl = `${baseUrl}${docUrl.startsWith('/') ? '' : '/'}${docUrl}`;
    }

    const cleanName = fileName || `Devis-Signe-${Date.now()}.pdf`;
    const localUri = `${FileSystem.documentDirectory}${cleanName}`;

    const downloadRes = await FileSystem.downloadAsync(fullUrl, localUri);

    if (downloadRes.status === 200) {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadRes.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Consulter et enregistrer le devis signé',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Téléchargé', `Le devis signé a été enregistré avec succès : ${cleanName}`);
      }
    } else {
      Alert.alert('Erreur', 'Le document signé est inaccessible sur le serveur.');
    }
  } catch (e) {
    console.error('Erreur téléchargement devis signé:', e);
    Alert.alert('Erreur', 'Impossible de télécharger le devis signé.');
  }
}
