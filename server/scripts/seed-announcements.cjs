const { Setting } = require('../src/models/index.cjs');

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: null,
    text: 'Location de véhicules & Flottes — Réservez dès maintenant',
    color: '#173d23',
    fontStyle: 'font-bold',
    textSize: 'text-[11px]',
    uppercase: true,
    sticker: '',
    duration: 8,
    enabled: true,
    order: 0,
  },
  {
    id: null,
    text: 'Négoce de quincaillerie, plomberie & fournitures BTP',
    color: '#173d23',
    fontStyle: 'font-bold',
    textSize: 'text-[11px]',
    uppercase: true,
    sticker: '',
    duration: 8,
    enabled: true,
    order: 1,
  },
  {
    id: null,
    text: 'Abidjan, Riviera-Palmeraie SIPIM 4 — +225 07 18 38 38 38',
    color: '#173d23',
    fontStyle: 'font-bold',
    textSize: 'text-[11px]',
    uppercase: true,
    sticker: '',
    duration: 8,
    enabled: true,
    order: 2,
  },
];

async function seedAnnouncements() {
  try {
    console.log('📢 Réinitialisation des annonces de la barre défilante...\n');

    const [existing] = await Setting.findOrCreate({
      where: { cle: 'announcements' },
      defaults: {
        cle: 'announcements',
        valeur: { items: DEFAULT_ANNOUNCEMENTS, barHeight: 34 },
      },
    });

    // Migrer l'ancien format (tableau simple) vers le nouveau format { items, barHeight }
    const oldValeur = existing.valeur;
    let items = DEFAULT_ANNOUNCEMENTS;
    let barHeight = 34;

    if (Array.isArray(oldValeur)) {
      console.log(`ℹ️  Ancien format détecté (tableau de ${oldValeur.length}). Migration vers le nouveau format...`);
      items = oldValeur;
    } else if (oldValeur?.items && Array.isArray(oldValeur.items)) {
      console.log(`ℹ️  Nouveau format détecté (${oldValeur.items.length} annonces).`);
      items = oldValeur.items;
      barHeight = Number(oldValeur.barHeight) || 34;
    } else {
      console.log('ℹ️  Aucune annonce existante. Utilisation des valeurs par défaut...');
    }

    await existing.update({ valeur: { items, barHeight } });

    console.log(`✅ ${items.length} annonce(s) enregistrée(s) avec barHeight=${barHeight}px :`);
    items.forEach((a, i) => {
      console.log(`   ${i + 1}. ${a.text || '(vide)'}`);
    });
    console.log('\n💡 Vous pouvez maintenant les modifier depuis Admin → Annonces.');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
}

seedAnnouncements();