// Verifie la redirection canonique www -> domaine officiel de l'application Express.
// Lancement : node test-redirection-www.cjs
process.env.NODE_ENV = 'test';

const http = require('http');
const app = require('./server/src/app.cjs');

const CAS = [
  { host: 'www.soutarahgroup.com', chemin: '/', attendu: 301 },
  { host: 'www.soutarahgroup.com', chemin: '/services', attendu: 301 },
  { host: 'soutarahgroup.com', chemin: '/', attendu: 404 },
  { host: 'localhost:5000', chemin: '/', attendu: 404 },
  { host: 'rsvp.soutarahgroup.com', chemin: '/', attendu: 404 },
];

const serveur = app.listen(5199, async () => {
  let echecs = 0;
  for (const cas of CAS) {
    const resultat = await new Promise((resolve) => {
      const req = http.request(
        { host: '127.0.0.1', port: 5199, path: cas.chemin, method: 'GET',
          headers: { Host: cas.host, 'x-forwarded-proto': 'https' } },
        (res) => {
          res.resume();
          resolve({ statut: res.statusCode, location: res.headers.location });
        },
      );
      req.on('error', (e) => resolve({ statut: 0, erreur: e.message }));
      req.end();
    });
    const ok = resultat.statut === cas.attendu;
    if (!ok) echecs += 1;
    console.log(
      `${ok ? 'OK  ' : 'ECHEC'} | Host: ${cas.host.padEnd(24)} chemin: ${cas.chemin.padEnd(10)}` +
      ` -> HTTP ${resultat.statut}` + (resultat.location ? ` | location: ${resultat.location}` : ''),
    );
  }
  console.log();
  console.log(echecs === 0 ? 'TOUS LES CAS PASSENT' : `${echecs} CAS EN ECHEC`);
  serveur.close();
  process.exitCode = echecs === 0 ? 0 : 1;
});
