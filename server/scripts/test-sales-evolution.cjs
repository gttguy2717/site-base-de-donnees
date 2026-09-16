/* Test rapide de l'endpoint sales-evolution (hors serveur)
   Usage : node test-sales-evolution.cjs           → test contre la vraie DB
           node test-sales-evolution.cjs --mock    → test logique avec données fictives */

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const SALES_MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const SALES_WEEKDAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

// Réplique exacte de la logique de getSalesEvolution, avec maps injectées
function buildBuckets(days, reservationsMap, devisMap) {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (days - 1));

  const buckets = [];
  if (days === 90) {
    const weekStart = new Date(startDate);
    const now = new Date();
    while (weekStart <= now) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      let ventes = 0, reservations = 0, devis = 0, ca = 0;
      const cursor = new Date(weekStart);
      while (cursor <= weekEnd) {
        const key = dayKey(cursor);
        const res = reservationsMap.get(key);
        if (res) { ventes += res.total; reservations += res.total; ca += res.ca; }
        const dv = devisMap.get(key);
        if (dv) { ventes += dv; devis += dv; }
        cursor.setDate(cursor.getDate() + 1);
      }
      buckets.push({
        label: `${weekStart.getDate()} ${SALES_MONTHS_SHORT[weekStart.getMonth()]}`,
        ventes, reservations, devis, ca,
      });
      weekStart.setDate(weekStart.getDate() + 7);
    }
  } else {
    const cursor = new Date(startDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    while (cursor <= today) {
      const key = dayKey(cursor);
      const res = reservationsMap.get(key) || { total: 0, ca: 0 };
      const dv = devisMap.get(key) || 0;
      buckets.push({
        label: days === 7
          ? SALES_WEEKDAYS_SHORT[cursor.getDay()]
          : `${cursor.getDate()} ${SALES_MONTHS_SHORT[cursor.getMonth()]}`,
        ventes: res.total + dv,
        reservations: res.total,
        devis: dv,
        ca: res.ca,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return buckets;
}

function assert(cond, msg) {
  if (!cond) { console.error('ÉCHEC :', msg); process.exitCode = 1; }
  else console.log('OK :', msg);
}

async function runMock() {
  const today = new Date();
  const k = (offset) => { const d = new Date(today); d.setDate(d.getDate() + offset); return dayKey(d); };

  const reservationsMap = new Map([[k(-2), { total: 3, ca: 150000 }], [k(0), { total: 1, ca: 45000 }]]);
  const devisMap = new Map([[k(-2), 2]]);

  const b7 = buildBuckets(7, reservationsMap, devisMap);
  assert(b7.length === 7, `7 jours → 7 buckets (${b7.length})`);
  assert(b7[6].ventes === 1 && b7[6].ca === 45000, 'jour courant = 1 vente / 45000 FCFA');
  assert(b7[4].ventes === 5 && b7[4].ca === 150000, 'J-2 = 5 ventes (3 résa + 2 devis) / 150000 FCFA');
  assert(b7.every((b) => b.ventes >= 0), 'toutes les valeurs >= 0');

  const b30 = buildBuckets(30, reservationsMap, devisMap);
  assert(b30.length === 30, `30 jours → 30 buckets (${b30.length})`);

  const b90 = buildBuckets(90, reservationsMap, devisMap);
  assert(b90.length === 13 || b90.length === 14, `90 jours → ~13 semaines (${b90.length})`);
  const totalVentes = b90.reduce((s, b) => s + b.ventes, 0);
  assert(totalVentes === 6, `total ventes cumulées = 6 (${totalVentes})`);
}

async function runDb(days) {
  const { sequelize, Reservation, QuoteRequest } = require('../src/models/index.cjs');
  const { Op } = require('sequelize');

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (days - 1));

  const reservationsParJour = await Reservation.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('cree_le')), 'jour'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
      [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('montant_total')), 0), 'ca'],
    ],
    where: { cree_le: { [Op.gte]: startDate }, statut: 'CONFIRMED' },
    group: [sequelize.fn('DATE', sequelize.col('cree_le'))],
    raw: true,
  });

  const devisParJour = await QuoteRequest.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('cree_le')), 'jour'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
    ],
    where: { cree_le: { [Op.gte]: startDate }, statut: 'CONVERTED' },
    group: [sequelize.fn('DATE', sequelize.col('cree_le'))],
    raw: true,
  });

  const reservationsMap = new Map();
  reservationsParJour.forEach((row) => {
    reservationsMap.set(dayKey(new Date(row.jour)), { total: Number(row.total) || 0, ca: Number(row.ca) || 0 });
  });
  const devisMap = new Map();
  devisParJour.forEach((row) => {
    devisMap.set(dayKey(new Date(row.jour)), Number(row.total) || 0);
  });

  console.log(`Période ${days} jours → buckets réels :`);
  console.log('Réservations CONFIRMED :', [...reservationsMap.entries()]);
  console.log('Devis CONVERTED :', [...devisMap.entries()]);
  console.log(JSON.stringify(buildBuckets(days, reservationsMap, devisMap).filter((b) => b.ventes > 0)));
}

(async () => {
  if (process.argv.includes('--mock')) {
    await runMock();
    return;
  }
  try {
    await sequelize.authenticate();
    console.log('Connexion DB OK');
    await runDb(7);
    await runDb(90);
  } catch (e) {
    console.error('ERREUR DB:', e.message, '\n', e.original?.message || '');
    process.exitCode = 1;
  } finally {
    try { await sequelize.close(); } catch { /* ignore */ }
  }
})();

