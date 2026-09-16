// Génération de fiches techniques PDF pour les produits de négoce SOUTARAH.
// - Si le produit possède déjà une fiche PDF (ex. fichiers Nexans), on la télécharge directement.
// - Sinon, une fiche technique SOUTARAH est générée à la volée (jsPDF) avec les informations en français.

const COMPANY = {
  nom: 'SOUTARAH GROUP',
  negoce: 'Négoce & Import-Export',
  contacts: [
    'Société à Responsabilité Limitée SARL — Abidjan, Palmeraie Saint Viateur',
    'Tel : 27 22 30 11 27 / 07 18 88 88 89 — Email : infosoutarahgroup@gmail.com',
    'Web : www.soutarah-group.ci',
  ],
};

const safe = (value) => String(value || '').replace(/[\\/:*?"<>|]/g, '-');

export function labelCategorie(product, categories = []) {
  const cat = (categories || []).find((c) => c.id === (product.category || product.categorie));
  return cat?.label || product.category || product.categorie || 'Négoce';
}

/**
 * Télécharge la fiche technique d'un produit.
 * - Si product.pdf existe (vraie fiche), ouvre/ télécharge le PDF.
 * - Sinon génère une fiche SOUTARAH à la volée.
 */
export async function downloadFicheTechnique({ product, categories = [], filename = null } = {}) {
  if (!product) return;

  if (product.pdf) {
    const link = document.createElement('a');
    link.href = product.pdf;
    link.download = `${safe(filename || `fiche-technique-${product.ref || product.id || 'produit'}`)}.pdf`;
    link.target = '_blank';
    link.rel = 'noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  await generateFichePdf({ product, categories, filename });
}

function divider(pdf, name, color, dy) {
  pdf.setDrawColor(color);
  pdf.setLineWidth(0.6);
  pdf.line(14, dy, 196, dy);
}

function sectionTitle(pdf, label, y) {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(31, 61, 35); // vert foncé SOUTAR
  pdf.text(label, 14, y);
  pdf.setFontSize(8);
  pdf.setTextColor(90, 105, 96);
  pdf.text('————————————————————————————————————————————————————————————————————————', 14, y + 3.5);
  return y + 11;
}

function wrap(pdf, text, x, y, maxWidth) {
  const lines = pdf.splitTextToSize(text || '', maxWidth);
  pdf.text(lines, x, y);
  return y + lines.length * 4.6;
}

async function generateFichePdf({ product, categories, filename }) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // ── Bande d'en-tête ──
  pdf.setFillColor(18, 37, 26); // #12251a
  pdf.rect(0, 0, pageW, 30, 'F');
  pdf.setFillColor(105, 195, 59); // accent vert
  pdf.rect(0, 30, pageW, 1.4, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  pdf.text(COMPANY.nom, 14, 14);
  pdf.setFontSize(10);
  pdf.setTextColor(166, 237, 125);
  pdf.text(COMPANY.negoce, 14, 20);
  pdf.setFontSize(8);
  pdf.setTextColor(200, 215, 205);
  pdf.text(`Fiche technique — Réf : ${product.ref || product.id || 'N/A'}`, 14, 25);
  pdf.setTextColor(255, 255, 255);

  // ── Nom du produit ──
  let y = 44;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(23, 32, 25);
  const nameParts = pdf.splitTextToSize(product.name || 'Produit', 182);
  pdf.text(nameParts, 14, y);
  y += nameParts.length * 6 + 3;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(101, 113, 105);
  pdf.text(`Référence : ${product.ref || '—'}`, 14, y);
  y += 6;

  y = sectionTitle(pdf, 'DESCRIPTION', y);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(60, 70, 63);
  y = wrap(pdf, product.desc || 'Aucune description disponible.', 14, y, 180) + 4;

  // ── Tableau Caractéristiques ──
  y = sectionTitle(pdf, 'CARACTÉRISTIQUES', y);
  const spec = [
    ['Référence', product.ref || '—'],
    ['Catégorie', labelCategorie(product, categories)],
    ['Famille', 'Catalogue négoce SOUTARAH GROUP'],
    ['Fournisseur', (product.ref || '').toUpperCase().startsWith('KETE') || String(product.id || '').startsWith('k') ? 'KETE Electric' : (String(product.id || '').startsWith('p') ? 'Nexans' : 'SOUTAR GROUP')],
    ['Mode de tarification', 'Sur devis'],
  ];
  const rowStart = y;
  pdf.setFillColor(244, 248, 243);
  pdf.roundedRect(14, y - 5, 182, spec.length * 8 + 4, 1.5, 1.5, 'F');
  pdf.setDrawColor(220, 230, 216);
  pdf.setLineWidth(0.2);
  spec.forEach(([k, v], i) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(60, 65, 62);
    pdf.text(String(k), 18, rowStart + i * 8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(31, 32, 31);
    const valLines = pdf.splitTextToSize(String(v), 120);
    pdf.text(valLines, 62, rowStart + i * 8);
    pdf.setDrawColor(230, 238, 226);
    pdf.line(14, rowStart + i * 8 + 2.6, 196, rowStart + i * 8 + 2.6);
  });
  y = rowStart + spec.length * 8 + 8;

  // ── Coordonnées ──
  y = sectionTitle(pdf, 'CONTACT & DISPONIBILITÉ', y);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(60, 64, 63);
  const yContact = wrap(pdf, COMPANY.contacts.join('  •  '), 14, y, 180) + 4;
  y = wrap(pdf, 'Pour commander ce produit, ajoutez-le à votre panier ou demandez un devis auprès de notre équipe commerciale.', 14, yContact + 2, 180);
  y += 6;

  // ── Pied de page ──
  pdf.setFillColor(18, 37, 27);
  pdf.rect(0, pageH - 12, pageW, 12, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.text(COMPANY.nom, 14, pageH - 5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(180, 200, 186);
  pdf.text('© SOUTARAH GROUP — Fiche technique générée automatiquement. Caractéristiques sous réserve de confirmation du fournisseur.', 14, pageH - 2);

  pdf.save(`${safe(filename || `fiche-technique-${product.ref || product.id || 'produit'}`)}.pdf`);
}