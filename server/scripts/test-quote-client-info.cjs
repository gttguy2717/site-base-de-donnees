/* Test hors-navigateur de la résolution des infos client du devis PDF.
   Vérifie que le nom + contact sont bien résolus depuis toutes les sources. */
const cases = [
  { desc: 'devis admin (quote avec nom/tel/client)', quote: { nom: 'David Sorho', telephone: '0574796452', email: 'david@sorho.ci', client: { prenom: 'David', nom: 'Sorho', user: { email: 'david@sorho.ci', telephone: '0574796452' } } }, user: null, client: null },
  { desc: 'panier (user/client de useAuth)', quote: { reference: 'X' }, user: { email: 'ent@sucaf.ci' }, client: { entreprise: { nom: 'SUCAF CI' } } },
  { desc: 'devis invité uniquement email', quote: { nom: '', email: 'visiteur@gmail.com', telephone: '' }, user: null, client: null },
  { desc: 'rien du tout', quote: {}, user: null, client: null },
];

function resolve(quote, client, user) {
  const source = `module.exports = { quote: ${JSON.stringify(quote)}, client: ${JSON.stringify(client)}, user: ${JSON.stringify(user)} };`;
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  const tmp = path.join(os.tmpdir(), `qt_${Date.now()}.cjs`);
  fs.writeFileSync(tmp, source);
  // eslint-disable-next-line max-len
  const m = require(tmp);
  fs.unlinkSync(tmp);

  const qClient = quote?.client || null;
  const clientName = quote?.nom || quote?.name || quote?.clientName
    || qClient?.entreprise?.nom || qClient?.company?.name || client?.entreprise?.nom || client?.company?.name
    || [qClient?.prenom || qClient?.firstName || client?.prenom || client?.firstName,
        qClient?.nom || qClient?.lastName || client?.nom || client?.lastName].filter(Boolean).join(' ')
    || user?.nom || user?.name || qClient?.user?.email || user?.email || quote?.email
    || 'Client SOUTARAH';
  const clientEmail = quote?.email
    || qClient?.user?.email || qClient?.email || user?.email || client?.email || '';
  const clientPhone = quote?.telephone || quote?.phone
    || qClient?.user?.telephone || qClient?.telephone || qClient?.user?.phone
    || user?.telephone || user?.phone || client?.telephone || client?.phone
    || '';
  return { clientName, contact: clientPhone || clientEmail };
}

let fails = 0;
for (const c of cases) {
  const r = resolve(c.quote, c.client, c.user);
  const ok = (r.clientName && r.clientName !== 'Client SOUTARAH') || (c.desc === 'rien du tout');
  const contactOk = Boolean(r.contact) || (c.desc === 'rien du tout');
  if (!ok || !contactOk) fails += 1;
  console.log(`${ok && contactOk ? 'OK ' : 'FAIL'} [${c.desc}] nom="${r.clientName}" contact="${r.contact}"`);
}
console.log(fails === 0 ? '\nTous les cas passent.' : `\n${fails} échec(s).`);
process.exitCode = fails === 0 ? 0 : 1;