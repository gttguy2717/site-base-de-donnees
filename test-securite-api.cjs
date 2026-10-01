// Verifie les protections de l'API :
//   1) /api/admin est refuse sans jeton et avec un jeton invalide ;
//   2) le televersement refuse un fichier dangereux (.html) et accepte un PDF.
// Lancement : node test-securite-api.cjs
process.env.NODE_ENV = 'test';

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const express = require('express');
const app = require('./server/src/app.cjs');
const { upload } = require('./server/src/middlewares/upload.cjs');

const DOSSIER_UPLOADS = path.join(__dirname, 'uploads');
const CAS = [];

function verifier(nom, condition, detail) {
  CAS.push({ nom, ok: condition, detail });
  console.log(`${condition ? 'OK   ' : 'ECHEC'} | ${nom}${detail ? ` -> ${detail}` : ''}`);
}

function requeteJson(port, chemin, entetes = {}) {
  return new Promise((resolve) => {
    const req = http.request(
      { host: '127.0.0.1', port, path: chemin, method: 'GET', headers: entetes },
      (res) => {
        res.resume();
        resolve(res.statusCode);
      },
    );
    req.on('error', () => resolve(0));
    req.end();
  });
}

// Petite application qui expose UNIQUEMENT la route de televersement,
// afin de tester le filtre de fichiers sans toucher aux routes de production.
function demarrerServeurUpload() {
  return new Promise((resolve) => {
    const mini = express();
    mini.post('/upload', upload.single('file'), (_req, res) => res.json({ ok: true }));
    mini.use((error, _req, res, _next) => res.status(error.statusCode || 500).json({ message: error.message }));
    const serveur = mini.listen(5198, () => resolve(serveur));
  });
}

function televerser(port, contenu, nom, type) {
  const formulaire = new FormData();
  formulaire.append('file', new Blob([contenu], { type }), nom);
  return fetch(`http://127.0.0.1:${port}/upload`, { method: 'POST', body: formulaire })
    .then((r) => r.status);
}

(async () => {
  console.log('=== 1. Controle d acces aux routes /api/admin ===');
  await new Promise((resolve) => {
    const serveur = app.listen(5197, async () => {
      const sansJeton = await requeteJson(5197, '/api/admin/dashboard/stats');
      verifier('sans jeton -> 401', sansJeton === 401, `HTTP ${sansJeton}`);

      const jetonBidon = await requeteJson(5197, '/api/admin/dashboard/stats', {
        authorization: 'Bearer jeton.totalement.invalide',
      });
      verifier('jeton invalide -> 401', jetonBidon === 401, `HTTP ${jetonBidon}`);

      const statutModif = await new Promise((r) => {
        const req = http.request(
          { host: '127.0.0.1', port: 5197, path: '/api/admin/announcements', method: 'PUT' },
          (res) => { res.resume(); r(res.statusCode); },
        );
        req.on('error', () => r(0));
        req.end();
      });
      verifier('PUT annonces sans jeton -> 401', statutModif === 401, `HTTP ${statutModif}`);

      serveur.close();
      resolve();
    });
  });

  console.log();
  console.log('=== 2. Filtre des fichiers televerses ===');
  const fichierAvant = fs.existsSync(DOSSIER_UPLOADS) ? fs.readdirSync(DOSSIER_UPLOADS) : [];
  const serveurUpload = await demarrerServeurUpload();

  const pageHtml = await televerser(5198, '<html><form action="http://pirate.ci">login</form></html>',
    'phishing.html', 'text/html');
  verifier('fichier .html refuse', pageHtml === 400, `HTTP ${pageHtml}`);

  const scriptJs = await televerser(5198, 'alert(1)', 'script.js', 'text/javascript');
  verifier('fichier .js refuse', scriptJs === 400, `HTTP ${scriptJs}`);

  const pdf = await televerser(5198, '%PDF-1.4 document de test', 'devis.pdf', 'application/pdf');
  verifier('fichier .pdf accepte', pdf === 200, `HTTP ${pdf}`);

  serveurUpload.close();

  // Nettoyage des fichiers crees par le test
  const fichierApres = fs.existsSync(DOSSIER_UPLOADS) ? fs.readdirSync(DOSSIER_UPLOADS) : [];
  let supprimes = 0;
  for (const nom of fichierApres.filter((n) => !fichierAvant.includes(n))) {
    try {
      fs.unlinkSync(path.join(DOSSIER_UPLOADS, nom));
      supprimes += 1;
    } catch { /* ignore */ }
  }
  console.log(`        (${supprimes} fichier(s) de test nettoye(s))`);

  const echecs = CAS.filter((c) => !c.ok).length;
  console.log();
  console.log(echecs === 0 ? 'TOUS LES CONTROLES PASSENT' : `${echecs} CONTROLE(S) EN ECHEC`);
  process.exitCode = echecs === 0 ? 0 : 1;
})();
