require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const nodemailer = require('nodemailer');

async function testEmail() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, MANAGER_EMAILS, MANAGER_EMAIL } = process.env;
  const recipients = (MANAGER_EMAILS || MANAGER_EMAIL || '').split(',').map(e => e.trim()).filter(Boolean);
  console.log('Configuration SMTP:');
  console.log('  host:', SMTP_HOST);
  console.log('  port:', SMTP_PORT);
  console.log('  secure:', SMTP_SECURE);
  console.log('  user:', SMTP_USER);
  console.log('  password:', SMTP_PASSWORD ? `${SMTP_PASSWORD.slice(0, 10)}...` : 'MANQUANT');
  console.log('  from:', SMTP_FROM);
  console.log('  to:', recipients.join(', '));

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM || recipients.length === 0) {
    console.error('❌ Configuration SMTP incomplète');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: recipients,
      subject: 'Test SOUTARAH - Configuration email OK',
      text: 'Ceci est un email de test pour vérifier la configuration SMTP Brevo.',
    });
    console.log('✅ Email envoyé avec succès!');
    console.log('  MessageId:', info.messageId);
    console.log('  Response:', info.response);
  } catch (error) {
    console.error('❌ Erreur envoi email:', error.message);
    if (error.response) console.error('  Détail:', error.response);
  }
}

testEmail();
