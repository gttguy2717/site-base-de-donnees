import { useCallback, useEffect, useState } from 'react';
import { Car, CheckCircle2, Download, Minus, PackageCheck, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { apiRequest } from '../lib/api';
import { computeQuoteTotals } from '../lib/quoteTotals';
import { getZoneLabel } from '../lib/vehiclePricing';
import { useAuth } from '../hooks/useAuth';

const money = (value) => new Intl.NumberFormat('fr-CI', { maximumFractionDigits: 0 }).format(value || 0);
const currency = (value) => `${money(value)} FCFA`;

function customerName(user, client) {
  return client?.entreprise?.nom
    || client?.company?.name
    || [client?.prenom || client?.firstName, client?.nom || client?.lastName].filter(Boolean).join(' ')
    || user?.email
    || 'Client SOUTARAH';
}

function customerPhone(user, client) {
  return user?.telephone
    || user?.phone
    || client?.telephone
    || client?.phone
    || '';
}

async function generateCartQuotePdf(combinedCart, user, client, existingReference, totals) {
  const { jsPDF } = await import('jspdf');
  const reference = existingReference || `04-26/UFO/LOC/${Math.floor(1000 + Math.random() * 9000).toString().padStart(3, '0')}`;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const items = combinedCart.items || [];
  const now = new Date();

  // Header avec informations société (matching PDF example exactly)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text('Société à Responsabilité limitée SARL, Capital : 10 000 000 FCFA • Abidjan, Palmeraie Saint Viateur', 15, 12);
  doc.text('25 BP 1032 Abidjan 25 • Tél : 27 22 30 11 27 / 07 18 88 88 89 / 07 18 40 40 40 / 07 06 91 91 91 / 07 69 38 66 50', 15, 17);
  doc.text('N°RCCM : CI-ABJ-03-2022-B12-03750 • N°CC : 2242663 T • Compte Bancaire BNI : CI092 01021 000108230000 36', 15, 22);
  doc.text('Email: infosoutarahgroup@gmail.com - info@soutarahgroup.ci • Web: www.soutarah-group.ci', 15, 27);

  // Devis number and date (matching PDF layout exactly)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Devis N° ${reference}`, 15, 42);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const dateFormatted = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1), 15, 48);

  // Main title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('LOCATION DE VEHICULE AVEC CHAUFFEUR', 15, 58);

  // Client info section (in upper right, matching PDF)
  const clientInfo = customerName(user, client) || 'UFOA';
  const clientLocation = client?.adresse || client?.address || 'ABIDJAN';
  const clientPhone = customerPhone(user, client) || '+225 00 00 00 00 00';
  
  // Client info box (top right)
  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(1);
  doc.roundedRect(pageWidth - 65, 32, 50, 20, 3, 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 100, 0);
  doc.text(clientInfo, pageWidth - 60, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(clientLocation, pageWidth - 60, 45);
  doc.setFontSize(8);
  doc.text(clientPhone, pageWidth - 60, 50);

  // Table header with proper styling
  let y = 70;
  doc.setFillColor(128, 128, 128);
  doc.rect(15, y - 3, pageWidth - 30, 8, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('Désignation', 17, y + 2);
  doc.text('Type de véhicule', 70, y + 2);
  doc.text('Destination', 110, y + 2);
  doc.text('Coût journalier', 140, y + 2);
  doc.text('Quantité', 165, y + 2);
  doc.text('Nbre de jours', 175, y + 2);
  doc.text('Total', 190, y + 2);
  
  y += 12;

  // Items section with alternating row colors like in PDF
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);

  items.forEach((item, index) => {
    if (y > 250) {
      doc.addPage();
      y = 24;
    }

    // Alternating row background
    if (index % 2 === 1) {
      doc.setFillColor(240, 240, 240);
      doc.rect(15, y - 3, pageWidth - 30, 10, 'F');
    }

    const isVehicle = item.type === 'vehicle_rental';
    if (isVehicle) {
      const designation = `LOCATION DE VEHICULE\nDu ${item.startDate?.split('-').reverse().join('/')} AU ${item.endDate?.split('-').reverse().join('/')}`;
      const vehicleType = `${item.vehicle?.name || 'Véhicule'}\n${item.withDriver ? 'Climatisé et confortable' : 'Sans chauffeur'}`;
      const destination = item.destination || getZoneLabel(item.zoneId) || 'ABIDJAN';
      const unitPrice = Number(item.unitPrice);
      const quantity = '1';
      const days = Number(item.days || 1);
      const total = Number(item.totalPrice);

      doc.text(designation, 17, y + 2);
      doc.text(vehicleType, 70, y + 2);
      doc.text(destination, 110, y + 2);
      doc.text(money(unitPrice), 140, y + 2);
      doc.text(quantity, 165, y + 2);
      doc.text(String(days), 175, y + 2);
      doc.text(money(total), 190, y + 2);
    } else {
      // Négoce products
      const productName = item.product?.nom || item.product?.name || item.produit?.nom || 'Article SOUTARAH';
      const quantity = Number((item.quantite ?? item.quantity) || 1);
      const unitPrice = Number(item.prix_unitaire ?? item.unitPrice);
      const total = Number(item.total);

      doc.text(productName, 17, y + 2);
      doc.text('Article de négoce', 70, y + 2);
      doc.text('Négoce', 110, y + 2);
      doc.text(money(unitPrice), 140, y + 2);
      doc.text(String(quantity), 165, y + 2);
      doc.text('1', 175, y + 2);
      doc.text(money(total), 190, y + 2);
    }
    
    y += 12;
  });

  // Totals section matching PDF exactly
  y += 10;
  
  // Fonction pour estimer la consommation de carburant par type de véhicule
  const estimerFraisCarburant = (vehicleName, days) => {
    const name = vehicleName.toLowerCase();
    const prixEssence = 650; // Prix moyen du litre d'essence en FCFA
    const prixGazole = 600; // Prix moyen du litre de gazole en FCFA
    const kmParJour = 100; // Estimation de km parcourus par jour
    
    let consommationPour100km = 8;
    let typeCarburant = prixEssence;
    
    if (name.includes('dzire') || name.includes('vitz') || name.includes('micra') || name.includes('swift')) {
      consommationPour100km = 6;
    } else if (name.includes('kicks') || name.includes('vitara') || name.includes('fronx') || name.includes('duster')) {
      consommationPour100km = 8;
    } else if (name.includes('kadjar') || name.includes('koleos') || name.includes('rush')) {
      consommationPour100km = 9;
    } else if (name.includes('pajero') || name.includes('highlander') || name.includes('montero') || name.includes('fortuner')) {
      consommationPour100km = 12;
    } else if (name.includes('d-max') || name.includes('dmax') || name.includes('l200') || name.includes('tacoma') || name.includes('friday')) {
      consommationPour100km = 10;
      typeCarburant = prixGazole;
    } else if (name.includes('land cruiser') || name.includes('cruiser')) {
      consommationPour100km = 15;
    } else if (name.includes('jumper') || name.includes('dokker') || name.includes('express') || name.includes('transit') || name.includes('oroch')) {
      consommationPour100km = 9;
      typeCarburant = prixGazole;
    } else if (name.includes('urvan') || name.includes('hiace') || name.includes('hyundai')) {
      consommationPour100km = 11;
      typeCarburant = prixGazole;
    }
    
    const litresConsommes = (kmParJour * days * consommationPour100km) / 100;
    return Math.round(litresConsommes * typeCarburant);
  };
  
  // Calculer les frais de carburant et péage basés sur les locations de véhicules
  let fraisCarburant = 0;
  let fraisPeage = 0;
  let hasVehicles = false;
  
  items.forEach((item) => {
    if (item.type === 'vehicle_rental') {
      hasVehicles = true;
      const days = Number(item.days || 1);
      const vehicleName = item.vehicle?.name || '';
      fraisCarburant += estimerFraisCarburant(vehicleName, days);
    }
  });
  
  if (hasVehicles) {
    fraisPeage = 5500; // Frais fixe de péage
  }
  
  const totalsData = [
    ['MONTANT HT', money(totals.ht)],
    ['TVA 18%', money(totals.tva)],
    ['TDT 2.5%', money(totals.tdt)],
  ];
  
  const totalFinal = totals.ttc;
  totalsData.push(['MONTANT TTC', money(totalFinal)]);

  totalsData.forEach(([label, value], index) => {
    const isTotal = index === totalsData.length - 1;
    doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
    doc.setFontSize(isTotal ? 11 : 9);
    doc.setTextColor(0, 0, 0);
    
    doc.text(label, 120, y);
    doc.text(value, 180, y);
    y += isTotal ? 8 : 6;
  });

  // Total in words (matching PDF)
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Arrêtée la présente à la somme de : ${convertNumberToFrenchWords(totalFinal)} francs CFA`, 15, y);

  // Notes section (matching PDF exactly)
  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('NB :', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text('- Le chauffeur est à votre disposition de 7h à 21h', 25, y + 5);

  // Footer information (matching PDF layout)
  y += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('SOUTARAH GROUP', pageWidth - 60, y);

  // Footer table with conditions (matching PDF)
  y += 15;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  
  // Table structure
  const tableY = y;
  doc.rect(15, tableY, 60, 15); // VALIDITE cell
  doc.rect(75, tableY, 60, 15); // DELAI cell  
  doc.rect(135, tableY, 60, 15); // REGLEMENT cell
  
  doc.rect(15, tableY + 15, 60, 15); // 02 SEMAINES cell
  doc.rect(75, tableY + 15, 60, 15); // DISPONIBLE SAUF LOCATION cell
  doc.rect(135, tableY + 15, 60, 15); // SELON CONTRAT cell

  // Table headers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('VALIDITE', 17, tableY + 8);
  doc.text('DELAI', 77, tableY + 8);
  doc.text('REGLEMENT', 137, tableY + 8);

  // Table content
  doc.setFont('helvetica', 'normal');
  doc.text('02 SEMAINES', 17, tableY + 23);
  doc.text('DISPONIBLE SAUF LOCATION', 77, tableY + 23);
  doc.text('SELON CONTRAT', 137, tableY + 23);

  doc.save(`devis-soutarah-${reference}.pdf`);
  return reference;
}

// Helper function to convert numbers to French words
function convertNumberToFrenchWords(num) {
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
      if (ten === 7 || ten === 9) {
        return tens[ten - 1] + '-' + teens[unit];
      }
      return tens[ten] + (unit > 0 ? '-' + units[unit] : '');
    }
    
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let result = hundred === 1 ? 'cent' : units[hundred] + ' cent';
    if (hundred > 1 && rest === 0) result += 's';
    if (rest > 0) result += ' ' + convertLessThanThousand(rest);
    return result;
  }
  
  if (num < 1000) {
    return convertLessThanThousand(num);
  }
  
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
  if (rest > 0) {
    if (rest >= 1000) {
      const thousands = Math.floor(rest / 1000);
      const finalRest = rest % 1000;
      result += ' ' + (thousands === 1 ? 'mille' : convertLessThanThousand(thousands) + ' mille');
      if (finalRest > 0) result += ' ' + convertLessThanThousand(finalRest);
    } else {
      result += ' ' + convertLessThanThousand(rest);
    }
  }
  return result;
}

export default function CartPage({ navigateTo }) {
  const { token, user, client } = useAuth();
  const [productCart, setProductCart] = useState(null);
  const [vehicleCartItems, setVehicleCartItems] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyItem, setBusyItem] = useState(null);
  const [lastQuoteRef, setLastQuoteRef] = useState('');

  const loadVehicleCart = useCallback(() => {
    try {
      const userId = user?.id || user?.userId || 'guest';
      const cartKey = `soutarah_vehicle_cart_${userId}`;
      const stored = JSON.parse(localStorage.getItem(cartKey) || '[]');
      setVehicleCartItems(Array.isArray(stored) ? stored : []);
    } catch (e) {
      setVehicleCartItems([]);
    }
  }, [user]);

  const loadCart = useCallback(async () => {
    try {
      setError('');
      const result = await apiRequest('/cart', { token });
      setProductCart(result.cart);
    } catch (requestError) {
      setError(requestError.message);
    }
  }, [token]);

  useEffect(() => {
    loadCart();
    loadVehicleCart();

    const handleCartUpdated = () => {
      loadCart();
      loadVehicleCart();
    };

    window.addEventListener('soutarah-cart-updated', handleCartUpdated);
    return () => window.removeEventListener('soutarah-cart-updated', handleCartUpdated);
  }, [loadCart, loadVehicleCart]);

  const changeQuantity = async (item, quantity) => {
    setBusyItem(item.id);
    try {
      const result = await apiRequest(`/cart/items/${item.id}`, { token, method: 'PATCH', body: JSON.stringify({ quantity }) });
      setProductCart(result.cart);
      setLastQuoteRef('');
      window.dispatchEvent(new Event('soutarah-cart-updated'));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyItem(null);
    }
  };

  const removeItem = async (item) => {
    setBusyItem(item.id);
    try {
      const result = await apiRequest(`/cart/items/${item.id}`, { token, method: 'DELETE' });
      setProductCart(result.cart);
      setLastQuoteRef('');
      window.dispatchEvent(new Event('soutarah-cart-updated'));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyItem(null);
    }
  };

  const removeVehicleRentalItem = (id) => {
    try {
      const userId = user?.id || user?.userId || 'guest';
      const cartKey = `soutarah_vehicle_cart_${userId}`;
      const updated = vehicleCartItems.filter((item) => item.id !== id);
      localStorage.setItem(cartKey, JSON.stringify(updated));
      setVehicleCartItems(updated);
      setLastQuoteRef('');
      window.dispatchEvent(new Event('soutarah-cart-updated'));
    } catch (e) {
      console.error('Erreur lors du retrait de la location', e);
    }
  };

  const productItems = productCart?.items || [];
  const productTotal = Number(productCart?.total || 0);
  const vehicleTotal = vehicleCartItems.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
  const hasVehicles = vehicleCartItems.length > 0;
  const amountHT = productTotal + vehicleTotal;
  const quoteTotals = computeQuoteTotals(amountHT);
  const totalItemCount = productItems.length + vehicleCartItems.length;

  // Calculer les frais pour les véhicules
  let fraisCarburant = 0;
  const fraisPeage = hasVehicles ? 5500 : 0; // Frais fixe de péage si il y a des véhicules
  
  // Fonction pour estimer la consommation de carburant par type de véhicule
  const estimerFraisCarburant = (vehicleName, days) => {
    const name = vehicleName.toLowerCase();
    const prixEssence = 650; // Prix moyen du litre d'essence en FCFA
    const prixGazole = 600; // Prix moyen du litre de gazole en FCFA
    const kmParJour = 100; // Estimation de km parcourus par jour
    
    // Consommation moyenne en L/100km selon le type de véhicule
    let consommationPour100km = 8; // Par défaut
    let typeCarburant = prixEssence;
    
    // Citadines et petits véhicules
    if (name.includes('dzire') || name.includes('vitz') || name.includes('micra') || name.includes('swift')) {
      consommationPour100km = 6;
      typeCarburant = prixEssence;
    }
    // SUV légers
    else if (name.includes('kicks') || name.includes('vitara') || name.includes('fronx') || name.includes('duster')) {
      consommationPour100km = 8;
      typeCarburant = prixEssence;
    }
    // SUV moyens
    else if (name.includes('kadjar') || name.includes('koleos') || name.includes('rush')) {
      consommationPour100km = 9;
      typeCarburant = prixEssence;
    }
    // 4x4 et véhicules lourds
    else if (name.includes('pajero') || name.includes('highlander') || name.includes('montero') || name.includes('fortuner')) {
      consommationPour100km = 12;
      typeCarburant = prixEssence;
    }
    // Pick-up diesel
    else if (name.includes('d-max') || name.includes('dmax') || name.includes('l200') || name.includes('tacoma') || name.includes('friday')) {
      consommationPour100km = 10;
      typeCarburant = prixGazole;
    }
    // Land Cruiser (très gourmand)
    else if (name.includes('land cruiser') || name.includes('cruiser')) {
      consommationPour100km = 15;
      typeCarburant = prixEssence;
    }
    // Utilitaires
    else if (name.includes('jumper') || name.includes('dokker') || name.includes('express') || name.includes('transit') || name.includes('oroch')) {
      consommationPour100km = 9;
      typeCarburant = prixGazole;
    }
    // Minibus
    else if (name.includes('urvan') || name.includes('hiace') || name.includes('hyundai')) {
      consommationPour100km = 11;
      typeCarburant = prixGazole;
    }
    
    // Calcul: (km par jour * jours * consommation / 100) * prix du carburant
    const litresConsommes = (kmParJour * days * consommationPour100km) / 100;
    return Math.round(litresConsommes * typeCarburant);
  };
  
  vehicleCartItems.forEach((item) => {
    const days = Number(item.days || 1);
    const vehicleName = item.vehicle?.name || item.vehicleName || '';
    fraisCarburant += estimerFraisCarburant(vehicleName, days);
  });

  const totalAvecFrais = quoteTotals.ttc;

  const combinedCart = {
    items: [
      ...productItems.map((pi) => ({ ...pi, type: 'product' })),
      ...vehicleCartItems,
    ],
    total: quoteTotals.ttc,
    itemCount: totalItemCount,
  };

  const validateCart = async () => {
    if (!totalItemCount) return;

    // 1. Snapshot du panier AVANT de le vider (pour le PDF)
    const cartSnapshot = {
      items: [
        ...productItems.map((pi) => ({ ...pi, type: 'product' })),
        ...vehicleCartItems,
      ],
      total: quoteTotals.ttc,
      itemCount: totalItemCount,
    };

    // 2. Créer la demande de devis en BDD + notifications via /quote-requests
    let serverRef = '';
    try {
      const productLines = productItems.map((i) => `${i.product?.name || 'Article'} (x${Number(i.quantity)})`);
      const vehicleLines = vehicleCartItems.map((v) => `Location ${v.vehicleName || v.vehicle?.model || 'Véhicule'} (${v.duration || v.days || 1}j)`);
      const description = [...productLines, ...vehicleLines].join(' | ');

      const payload = {
        service: 'Négoce et Location',
        title: `Devis Panier SOUTARAH`,
        name: customerName(user, client),
        email: user?.email || 'client@soutarah.ci',
        phone: customerPhone(user, client) || '0700000000',
        location: client?.adresse || client?.address || 'Abidjan',
        description: description.slice(0, 3000) || 'Devis panier client',
      };

      const result = await apiRequest('/quote-requests', {
        token,
        method: 'POST',
        body: JSON.stringify(payload),
      });

      serverRef = result.quoteRequest?.reference || `DEV-${Date.now()}`;
    } catch (serverError) {
      console.error('[validateCart] Erreur création devis:', serverError);
      setError(`Erreur lors de la création du devis: ${serverError.message}`);
      return;
    }

    // 3. Générer et télécharger le PDF avec le snapshot + la référence serveur
    try {
      await generateCartQuotePdf(cartSnapshot, user, client, serverRef, quoteTotals);
      setLastQuoteRef(serverRef);
    } catch (pdfError) {
      console.error('Erreur génération PDF', pdfError);
    }

    // 4. Vider le panier produits côté serveur
    try {
      await apiRequest('/cart', { token, method: 'DELETE' });
    } catch (e) {
      console.error('Erreur vidage panier', e);
    }

    // 5. Vider les locations de véhicules dans le localStorage
    const userId = user?.id || user?.userId || 'guest';
    const cartKey = `soutarah_vehicle_cart_${userId}`;
    localStorage.removeItem(cartKey);
    setVehicleCartItems([]);

    // 6. Recharger le panier et mettre à jour le badge
    await loadCart();
    window.dispatchEvent(new Event('soutarah-cart-updated'));
    window.dispatchEvent(new Event('soutarah-notifications-updated'));

    setNotice(`✅ Devis ${serverRef} créé ! Consultez "Mes Devis".`);
  };

  const downloadLastQuote = async () => {
    if (!totalItemCount || !lastQuoteRef) return;
    const reference = await generateCartQuotePdf(combinedCart, user, client, lastQuoteRef, quoteTotals);
    setLastQuoteRef(reference);
  };

  const footerNavigation = (target) => navigateTo(target, target === 'home' ? { section: 'home' } : {});

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f2] text-on-surface">
      <Navbar onOpenDevis={() => navigateTo('cart')} activeTab="cart" navigateTo={navigateTo} />
      <main className="flex-grow pt-28">
        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="rounded-[28px] bg-[#173d23] px-6 py-7 text-white shadow-xl sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">SOUTARAH GROUP</p>
                <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Mon panier</h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
                  Retrouvez ici vos produits de négoce et vos réservations de location de véhicules.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigateTo('service', { slug: 'vehicules' })} className="rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20">
                  Louer un véhicule
                </button>
                <button onClick={() => navigateTo('service', { slug: 'negoce' })} className="rounded-full bg-white px-5 py-3 text-sm font-bold text-primary transition hover:bg-emerald-50">
                  Négoce & import-export
                </button>
              </div>
            </div>
          </div>

          {notice && <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800"><CheckCircle2 size={19} />{notice}</div>}
          {error && <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

          {totalItemCount === 0 ? (
            <div className="mt-8 rounded-[28px] border border-dashed border-primary/20 bg-white px-6 py-16 text-center shadow-sm">
              <ShoppingCart className="mx-auto text-primary" size={42} />
              <h2 className="mt-5 font-display text-2xl font-extrabold">Votre panier est vide</h2>
              <p className="mt-2 text-sm text-gray-600">Explorez nos véhicules de location ou nos produits de négoce.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button onClick={() => navigateTo('service', { slug: 'vehicules' })} className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-white">Location de véhicules</button>
                <button onClick={() => navigateTo('service', { slug: 'negoce' })} className="rounded-full border border-primary/20 bg-[#f2f7ef] px-5 py-3 text-sm font-bold text-primary">Négoce & import-export</button>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-6">

                {/* SECTION LOCATIONS DE VEHICULES */}
                {vehicleCartItems.length > 0 && (
                  <section className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-primary/10">
                    <div className="border-b border-gray-100 bg-[#f8faf7] px-6 py-4">
                      <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-[#173d23]">
                        <Car size={20} className="text-primary" />
                        Locations de véhicules ({vehicleCartItems.length})
                      </h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {vehicleCartItems.map((item) => (
                        <article key={item.id} className="p-5 sm:p-6 transition-colors hover:bg-gray-50/50">
                          <div className="grid gap-4 sm:grid-cols-[100px_1fr_auto] sm:items-center">
                            <div className="relative h-20 w-full overflow-hidden rounded-2xl bg-[#edf1ec] sm:h-20 sm:w-24 shrink-0">
                              <img
                                src={item.vehicle?.image}
                                alt={item.vehicle?.name}
                                className="h-full w-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            </div>

                            <div className="min-w-0 space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                                  {item.vehicle?.category || 'Location'}
                                </span>
                                {item.withDriver && (
                                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                    Avec chauffeur professionnel
                                  </span>
                                )}
                              </div>
                              <h3 className="font-display text-xl font-extrabold text-[#111827]">{item.vehicle?.name}</h3>
                              
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                                <div><strong className="text-gray-900">Dates :</strong> Du {item.startDate?.split('-').reverse().join('/')} au {item.endDate?.split('-').reverse().join('/')}</div>
                                <div><strong className="text-gray-900">Durée :</strong> {item.days} jour{item.days > 1 ? 's' : ''}</div>
                                <div><strong className="text-gray-900">Destination :</strong> {item.destination || getZoneLabel(item.zoneId)}</div>
                                {item.color && <div><strong className="text-gray-900">Couleur :</strong> {item.color}</div>}
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-2 border-t border-gray-100 pt-3 sm:border-t-0 sm:pt-0">
                              <div className="text-right">
                                <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Total location</span>
                                <p className="font-display text-base font-extrabold text-primary">{currency(item.totalPrice)}</p>
                              </div>
                              <button
                                onClick={() => removeVehicleRentalItem(item.id)}
                                className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2 size={13} /> Retirer
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {/* SECTION PRODUITS NEGOCE */}
                {productItems.length > 0 && (
                  <section className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-primary/10">
                    <div className="border-b border-gray-100 bg-[#f8faf7] px-6 py-4">
                      <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-[#173d23]">
                        <PackageCheck size={20} className="text-primary" />
                        Produits de négoce ({productItems.length})
                      </h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {productItems.map((item) => {
                        const product = item.produit || item.product;
                        const categoryName = product?.categorie?.nom || product?.category?.nom || product?.category?.name || 'Négoce';
                        const productName = product?.nom || product?.name || 'Article SOUTARAH';
                        const unitPrice = item.prix_unitaire ?? item.unitPrice;
                        const quantity = item.quantite ?? item.quantity;
                        const unit = product?.unite || product?.unit || 'unité';
                        return (
                          <article key={item.id} className="grid gap-4 px-5 py-5 md:grid-cols-[1fr_120px_120px] md:items-center">
                            <div className="flex min-w-0 gap-4">
                              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                                <PackageCheck size={24} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wider text-primary">{categoryName}</p>
                                <h3 className="mt-1 truncate font-display text-lg font-extrabold">{productName}</h3>
                                <p className="mt-1 text-sm text-gray-500">{currency(unitPrice)} / {unit}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 md:justify-center">
                              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 md:hidden">Quantité</span>
                              <div className="flex items-center rounded-full border border-gray-200 bg-gray-50">
                                <button disabled={busyItem === item.id || Number(quantity) <= 1} onClick={() => changeQuantity(item, Number(quantity) - 1)} className="grid h-9 w-9 place-items-center text-primary disabled:opacity-30" aria-label="Diminuer">
                                  <Minus size={15} />
                                </button>
                                <span className="w-8 text-center text-sm font-extrabold">{Number(quantity)}</span>
                                <button disabled={busyItem === item.id} onClick={() => changeQuantity(item, Number(quantity) + 1)} className="grid h-9 w-9 place-items-center text-primary disabled:opacity-30" aria-label="Augmenter">
                                  <Plus size={15} />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 md:block md:text-right">
                              <p className="font-display text-lg font-extrabold text-primary">{currency(item.total)}</p>
                              <button disabled={busyItem === item.id} onClick={() => removeItem(item)} className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-red-600 disabled:opacity-30">
                                <Trash2 size={14} /> Retirer
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                )}

              </div>

              {/* RECAPITULATIF COTE DROIT */}
              <aside className="h-fit rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-primary/10">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Récapitulatif de votre commande</p>
                <div className="mt-6 space-y-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Nombre d'articles / services</span>
                    <span className="font-bold text-[#173d23]">{totalItemCount}</span>
                  </div>

                  {hasVehicles && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Locations véhicules ({vehicleCartItems.length})</span>
                      <span className="font-bold text-gray-800">{currency(vehicleTotal)}</span>
                    </div>
                  )}

                  {productItems.length > 0 && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Produits négoce ({productItems.length})</span>
                      <span className="font-bold text-gray-800">{currency(productTotal)}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-gray-100 pt-3">
                    <span>Montant HT</span>
                    <span className="font-bold text-[#173d23]">{currency(quoteTotals.ht)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>TVA 18%</span>
                    <span className="font-bold text-gray-700">{currency(quoteTotals.tva)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>TDT 2.5%</span>
                    <span className="font-bold text-gray-700">{currency(quoteTotals.tdt)}</span>
                  </div>
                  
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-base font-extrabold text-[#173d23]">Montant TTC</span>
                  <span className="text-xl font-extrabold text-primary">{currency(totalAvecFrais)}</span>
                </div>
                {hasVehicles && (
                  <p className="mt-2 text-[10px] text-gray-500 italic">
                    * Frais de carburant, péage et infraction à la charge du client
                  </p>
                )}
                <button onClick={validateCart} className="mt-6 w-full rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-primary/20 transition hover:bg-[#1b4c00]">
                  Valider
                </button>
              </aside>
            </div>
          )}
        </section>
      </main>
      <Footer onNavClick={footerNavigation} />
    </div>
  );
}
