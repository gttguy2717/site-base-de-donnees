import { useMemo } from 'react';
import { computeQuoteTotals } from '../lib/quoteTotals';

const COMPANY_INFO = {
  header: 'Société à Responsabilité limitée SARL, Capital : 10 000 000 FCFA • Abidjan, Palmeraie Saint Viateur',
  second: '25 BP 1032 Abidjan 25 • Tél : 27 22 30 11 27 / 07 18 88 88 89 / 07 18 40 40 40 / 07 06 91 91 91 / 07 69 38 66 50',
  third: 'N°RCCM : CI-ABJ-03-2022-B12-03750 • N°CC : 2242663 T • Compte Bancaire BNI : CI092 01021 000108230000 36',
  fourth: 'Email: infosoutarahgroup@gmail.com - info@soutarahgroup.ci • Web: www.soutarah-group.ci',
  services: [
    'Location de véhicules | Entretien d\'espaces verts',
    'Entretien de locaux | Maintenance | Installation',
    'électrique BTP et divers | Energie solaire et',
    'efficacité énergétique | Négoce | Import/Export',
    'Agro Pastoral'
  ],
};

const money = (value) => new Intl.NumberFormat('fr-CI', { maximumFractionDigits: 0 }).format(value || 0);
const currency = (value) => `${money(value)} FCFA`;

export default function QuoteDocument({ quote, items = [], user = null, client = null }) {
  const quoteItems = useMemo(() => {
    if (items.length > 0) return items;
    if (quote?.articles?.length > 0) return quote.articles;
    return [];
  }, [items, quote]);

  const displayName = useMemo(() => {
    if (quote?.nom) return quote.nom;
    if (client?.entreprise?.nom) return client.entreprise.nom;
    if (client?.nom || client?.prenom) return [client.prenom, client.nom].filter(Boolean).join(' ');
    if (user?.email) return user.email;
    return 'CLIENT';
  }, [quote, client, user]);

  const displayLocation = useMemo(() => {
    if (quote?.lieu) return quote.lieu.toUpperCase();
    if (client?.adresse) return client.adresse.toUpperCase();
    return 'ABIDJAN';
  }, [quote, client]);

  const displayPhone = useMemo(() => {
    if (quote?.telephone) return quote.telephone;
    if (user?.telephone) return user.telephone;
    return '+225 00 00 00 00 00';
  }, [quote, user]);

  const reference = quote?.reference || `DMD-${(quote?.id || '').slice(0, 8)}` || 'DEMANDE DE DEVIS';

  const dateStr = useMemo(() => {
    const d = new Date(quote?.cree_le || quote?.createdAt || Date.now());
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      .replace(/^\w/, (c) => c.toUpperCase());
  }, [quote]);

  // Build table rows from quoteItems or fallback to description parse
  let rows = quoteItems;

  if (rows.length === 0 && quote?.description) {
    // Try to parse from description like "Location Pajero (5j)"
    const description = quote.description;
    const match = description.match(/Location\s+(.+?)\s*\((\d+)j?\)/i);
    if (match) {
      rows = [{
        designation: 'LOCATION DE VEHICULE',
        vehicleType: match[1].toUpperCase(),
        destination: displayLocation,
        unitPrice: 0,
        quantity: 1,
        days: parseInt(match[2], 10) || 1,
        total: 0,
      }];
    } else {
      rows = [{
        designation: description,
        vehicleType: '-',
        destination: displayLocation,
        unitPrice: 0,
        quantity: 1,
        days: 1,
        total: 0,
      }];
    }
  }

  // Normalize rows
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
    if (item.type === 'product' || item.produit_id || item.product_id) {
      const product = item.produit || item.product;
      return {
        designation: product?.nom || item.libelle || 'Article SOUTARAH',
        vehicleType: 'Article de négoce',
        destination: 'Négoce',
        unitPrice: Number(item.prix_unitaire ?? item.unitPrice ?? 0),
        quantity: Number(item.quantite ?? item.quantity ?? 1),
        days: 1,
        total: Number(item.total ?? item.prix_total ?? 0),
      };
    }
    return {
      designation: item.designation || item.libelle || 'LOCATION DE VEHICULE',
      vehicleType: item.vehicleType || (item.type === 'vehicle_rental' ? (item.vehicle?.name || '-') : '-'),
      destination: item.destination || displayLocation,
      unitPrice: Number(item.unitPrice || item.prix_unitaire || 0),
      quantity: Number(item.quantity || item.quantite || 1),
      days: Number(item.days || item.jours || 1),
      total: Number(item.total || item.prix_total || 0),
    };
  });

  const totalHT = useMemo(() => {
    if (normalizedRows.length > 0 && normalizedRows.some((r) => r.total > 0)) {
      return normalizedRows.reduce((sum, r) => sum + r.total, 0);
    }
    return Number(quote?.montant_total || 0);
  }, [normalizedRows, quote]);

  const totals = computeQuoteTotals(totalHT);

  // Frais de carburant et péage à la charge du client (non inclus dans le TTC)
  const hasVehicles = normalizedRows.some((r) => r.designation.includes('LOCATION'));

  const finalTTC = totals.ttc;

  const totalInWords = numberToFrenchWords(finalTTC);

  const statusLabel = {
    PENDING: 'En attente',
    CONTACTED: 'En cours d\'étude',
    CONVERTED: 'Devis traité',
    APPROVED: 'Devis approuvé',
    REJECTED: 'Devis refusé',
    ISSUED: 'En attente',
    SENT: 'Devis envoyé',
    CANCELLED: 'Annulé',
  }[quote?.statut || quote?.status] || 'En attente';

  const headerBg = '#173d23';

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Top accent bar */}
      <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #69c33b, #143e22)' }} />

      {/* Company header */}
      <div className="px-6 pt-5 pb-3 border-b border-gray-100">
        <p className="text-[9px] leading-4 text-gray-500 text-center">
          {COMPANY_INFO.header}
        </p>
        <p className="text-[9px] leading-4 text-gray-500 text-center">{COMPANY_INFO.second}</p>
        <p className="text-[9px] leading-4 text-gray-500 text-center">{COMPANY_INFO.third}</p>
        <p className="text-[9px] leading-4 text-gray-500 text-center">{COMPANY_INFO.fourth}</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-6 px-6 py-5">
        {/* Logo + services */}
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg" style={{ background: headerBg }}>
            <span className="text-center leading-tight">
              SOUTA<br />RAH
            </span>
          </div>
          <div>
            <p className="font-black text-lg leading-none text-[#173d23]">SOUTARAH <span className="text-primary">GROUP</span></p>
            <p className="mt-1 text-[8px] leading-3 text-gray-400">Location de véhicules | Entretien d'espaces verts</p>
            <p className="text-[8px] leading-3 text-gray-400">Entretien de locaux | Maintenance | Installation</p>
            <p className="text-[8px] leading-3 text-gray-400">électrique BTP et divers | Energie solaire et</p>
            <p className="text-[8px] leading-3 text-gray-400">efficacité énergétique | Négoce | Import/Export</p>
            <p className="text-[8px] leading-3 text-gray-400">Agro Pastoral</p>
          </div>
        </div>

        {/* Devis ref + date */}
        <div className="text-right">
          <h1 className="text-xl font-black text-[#173d23] uppercase tracking-tight">Devis N° {reference}</h1>
          <p className="mt-0.5 text-xs text-gray-500">{dateStr}</p>
        </div>
      </div>

      {/* Client info box */}
      <div className="px-6">
        <div className="ml-auto max-w-md rounded-xl border-2 p-3 text-center" style={{ borderColor: '#69c33b' }}>
          <p className="font-bold text-sm text-[#173d23]">{displayName}</p>
          <p className="text-xs text-gray-600 mt-0.5">{displayLocation}</p>
          <p className="text-xs text-gray-500 mt-0.5">{displayPhone}</p>
        </div>
      </div>

      {/* Status badge */}
      <div className="mt-4 px-6 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {statusLabel}
        </span>
      </div>

      {/* Service title */}
      <div className="mt-4 px-6">
        <div className="rounded-lg bg-gray-700 text-white text-center py-2.5">
          <p className="text-sm font-bold uppercase tracking-wider">
            {quote?.service || 'LOCATION DE VEHICULE AVEC CHAUFFEUR'}
          </p>
        </div>
      </div>

      {/* Items table */}
      <div className="mt-4 px-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: '#69c33b' }}>
                <th className="px-3 py-2.5 text-left font-bold text-white uppercase text-[10px]">Désignation</th>
                <th className="px-3 py-2.5 text-left font-bold text-white uppercase text-[10px]">Type de véhicule</th>
                <th className="px-3 py-2.5 text-left font-bold text-white uppercase text-[10px]">Destination</th>
                <th className="px-3 py-2.5 text-right font-bold text-white uppercase text-[10px]">Coût journalier</th>
                <th className="px-3 py-2.5 text-center font-bold text-white uppercase text-[10px]">Quantité</th>
                <th className="px-3 py-2.5 text-center font-bold text-white uppercase text-[10px]">Nbre de jours</th>
                <th className="px-3 py-2.5 text-right font-bold text-white uppercase text-[10px]">Total</th>
              </tr>
            </thead>
            <tbody>
              {normalizedRows.map((row, index) => {
                const lines = row.designation.split('\n');
                return (
                  <tr key={index} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-3 py-3 align-top">
                      {lines.map((line, i) => (
                        <p key={i} className={i === 0 ? 'font-bold text-gray-900' : 'text-gray-600'}>
                          {line}
                        </p>
                      ))}
                    </td>
                    <td className="px-3 py-3 align-top text-gray-700">
                      {row.vehicleType.split('\n').map((line, i) => (
                        <p key={i} className={i === 0 ? 'font-semibold' : 'text-gray-500'}>{line}</p>
                      ))}
                    </td>
                    <td className="px-3 py-3 text-gray-700 font-medium">{row.destination}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{row.unitPrice ? money(row.unitPrice) : '-'}</td>
                    <td className="px-3 py-3 text-center tabular-nums">{row.quantity || '-'}</td>
                    <td className="px-3 py-3 text-center tabular-nums">{row.days || '-'}</td>
                    <td className="px-3 py-3 text-right font-bold tabular-nums">{row.total ? money(row.total) : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals section */}
      <div className="mt-5 px-6 flex justify-end">
        <div className="w-full max-w-sm space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-gray-700">MONTANT HT</span>
            <span className="font-bold text-gray-900 tabular-nums">{money(totalHT)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>TVA 18%</span>
            <span className="font-semibold tabular-nums">{money(totals.tva)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>TDT 2.5%</span>
            <span className="font-semibold tabular-nums">{money(totals.tdt)}</span>
          </div>
          <div className="flex justify-between border-t-2 border-primary pt-2 text-base">
            <span className="font-black text-[#173d23]">MONTANT TTC</span>
            <span className="font-black text-primary tabular-nums">{money(finalTTC)}</span>
          </div>
        </div>
      </div>

      {/* Total in words */}
      {finalTTC > 0 && (
        <div className="mt-4 px-6">
          <p className="text-xs text-gray-700 italic border border-gray-100 bg-gray-50 rounded-lg px-4 py-2.5">
            Arrêtée la présente à la somme de : <span className="font-bold">{totalInWords} francs CFA</span>
          </p>
        </div>
      )}

      {/* NB */}
      <div className="mt-4 px-6">
        <p className="text-xs font-bold text-red-600">NB :</p>
        <p className="mt-0.5 text-xs text-gray-600">- Le chauffeur est à votre disposition de 7h à 21h</p>
        {hasVehicles && (
          <p className="mt-0.5 text-xs text-gray-600">- Frais de carburant, péage et infarcation à la charge du client</p>
        )}
      </div>

      {/* Signature + conditions */}
      <div className="mt-6 px-6 pb-6 grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col justify-end items-start">
          <p className="text-lg font-black text-[#173d23]">SOUTARAH GROUP</p>
          <p className="text-xs text-gray-500 mt-0.5">{displayName}</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-300">
          <div className="grid grid-cols-3 divide-x divide-gray-300 border-b border-gray-300">
            <div className="bg-gray-100 px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wider">VALIDITE</div>
            <div className="bg-gray-100 px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wider">DELAI</div>
            <div className="bg-gray-100 px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wider">REGLEMENT</div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-gray-300">
            <div className="px-2 py-2 text-center text-[10px] font-semibold text-gray-700">02 SEMAINES</div>
            <div className="px-2 py-2 text-center text-[10px] font-semibold text-gray-700">DISPONIBLE SAUF LOCATION</div>
            <div className="px-2 py-2 text-center text-[10px] font-semibold text-gray-700">SELON CONTRAT</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center text-[8px] leading-4 text-white" style={{ background: headerBg }}>
        <p>{COMPANY_INFO.header}</p>
        <p>{COMPANY_INFO.second}</p>
        <p className="mt-0.5">Email: infosoutarahgroup@gmail.com - info@soutarahgroup.ci • Web: www.soutarah-group.ci</p>
      </div>
    </div>
  );
}

// --- Number to French words helper ---
function numberToFrenchWords(num) {
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
  if (rest > 0) result += ' ' + (rest >= 1000 ? convertLessThanThousand(Math.floor(rest / 1000)) + ' mille ' + convertLessThanThousand(rest % 1000) : convertLessThanThousand(rest));
  return result;
}