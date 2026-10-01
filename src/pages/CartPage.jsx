import { useCallback, useEffect, useRef, useState } from 'react';
import { Car, CheckCircle2, Minus, PackageCheck, Plus, Search, ShoppingCart, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { apiRequest } from '../lib/api';
import { computeQuoteTotals } from '../lib/quoteTotals';
import { generateQuotePdf } from '../lib/quotePdf';

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

/**
 * Champ de quantité éditable : l'utilisateur peut TAPER le nombre directement
 * (en plus des boutons − / +). Le commit se fait au blur ou sur Entrée pour
 * ne pas re-render / appeler l'API à chaque frappe.
 */
function QuantityInput({ value, onCommit, min = 1, ariaLabel = 'Quantité' }) {
  const qty = Number(value) || min;
  const [draft, setDraft] = useState(String(qty));

  // Resynchronise le brouillon quand la quantité change (boutons − / +).
  useEffect(() => {
    setDraft(String(qty));
  }, [qty]);

  const commit = () => {
    const parsed = parseInt(draft, 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(qty));
      return;
    }
    const next = Math.max(min, parsed);
    setDraft(String(next));
    if (next !== qty) onCommit(next);
  };

  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
          e.currentTarget.blur();
        }
      }}
      onClick={(e) => e.currentTarget.select()}
      aria-label={ariaLabel}
      className="w-10 rounded-md border border-transparent bg-transparent text-center text-sm font-extrabold text-[#172019] [appearance:textfield] focus:border-primary focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
  );
}

/**
 * Génère le PDF du devis panier via le générateur officiel SOUTARAH
 * (identique aux devis téléchargeables depuis « Mes Devis »).
 * On passe explicitement le nom / email / téléphone / lieu du client pour que
 * le bloc client du devis soit TOUJOURS rempli (même pour un admin ou une
 * entreprise sans profil client détaillé).
 */
async function generateCartQuotePdf(combinedCart, user, client, existingReference) {
  return generateQuotePdf({
    quote: {
      reference: existingReference,
      nom: customerName(user, client),
      email: user?.email || '',
      telephone: customerPhone(user, client),
      lieu: client?.adresse || client?.address || 'ABIDJAN',
    },
    items: combinedCart.items,
    user,
    client,
  });
}

export default function CartPage({ navigateTo }) {
  const { token, user, client } = useAuth();
  const [productCart, setProductCart] = useState(null);
  const [vehicleCartItems, setVehicleCartItems] = useState([]);
  const [negoceLocalItems, setNegoceLocalItems] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyItem, setBusyItem] = useState(null);
  const [lastQuoteRef, setLastQuoteRef] = useState('');
  const [negoceSent, setNegoceSent] = useState(''); // réf. si demande négoce envoyée
  const [sendingNegoce, setSendingNegoce] = useState(false);
  const [devRef, setDevRef] = useState('');
  const [devBusy, setDevBusy] = useState(false);
  const [devError, setDevError] = useState('');
  const validatingRef = useRef(false);
  // Ids des locations du panier devenues indisponibles (véhicule retiré du
  // catalogue ou déjà réservé). Le client doit être prévenu avant de valider.
  const [unavailableVehicleIds, setUnavailableVehicleIds] = useState([]);

  /**
   * Vérifie chaque location du panier contre l'API de disponibilité.
   * Un 404 signifie « ce n'est pas disponible » : la ligne est signalée et la
   * validation du panier est bloquée tant qu'elle est présente.
   */
  const checkVehicleAvailability = useCallback(async (items) => {
    const checks = items
      .filter((item) => item?.vehicleId && item?.startDate && item?.endDate)
      .map(async (item) => {
        try {
          const res = await apiRequest(
            `/vehicles/${item.vehicleId}/availability?startAt=${encodeURIComponent(item.startDate)}&endAt=${encodeURIComponent(item.endDate)}`,
            { token, retries: 0 },
          );
          if (res?.available === false) return item.vehicleId;
        } catch (e) {
          // 404 = hors catalogue ou indisponible. Réseau/serveur : on ne bloque pas.
          if (e?.statusCode === 404) return item.vehicleId;
          console.warn('[panier] disponibilité non vérifiable:', e?.message);
        }
        return null;
      });
    const results = await Promise.all(checks);
    setUnavailableVehicleIds(results.filter(Boolean));
  }, [token]);

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

  const loadNegoceCart = useCallback(() => {
    try {
      const userId = user?.id || user?.userId || 'guest';
      const stored = JSON.parse(localStorage.getItem(`soutarah_negoce_cart_${userId}`) || '[]');
      setNegoceLocalItems(Array.isArray(stored) ? stored : []);
    } catch (e) {
      setNegoceLocalItems([]);
    }
  }, [user]);

  const loadCart = useCallback(async () => {
    // Invité : panier 100 % localStorage (clé « guest ») — pas d'appel API
    // (l'endpoint /cart est protégé et renverrait une erreur 401).
    if (!token) {
      setProductCart(null);
      return;
    }
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
    loadNegoceCart();

    const handleCartUpdated = () => {
      loadCart();
      loadVehicleCart();
      loadNegoceCart();
    };

    window.addEventListener('soutarah-cart-updated', handleCartUpdated);
    return () => window.removeEventListener('soutarah-cart-updated', handleCartUpdated);
  }, [loadCart, loadVehicleCart, loadNegoceCart]);

  // Contrôle de disponibilité des locations à chaque changement du panier :
  // un véhicule retiré du catalogue ou déjà réservé doit être signalé.
  useEffect(() => {
    if (!vehicleCartItems.length) {
      setUnavailableVehicleIds([]);
      return undefined;
    }
    checkVehicleAvailability(vehicleCartItems).catch(() => {});
    return undefined;
  }, [vehicleCartItems, checkVehicleAvailability]);

  const hasUnavailableVehicles = unavailableVehicleIds.length > 0;

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

  const removeNegoceItem = (id) => {
    try {
      const userId = user?.id || user?.userId || 'guest';
      const updated = negoceLocalItems.filter((item) => item.id !== id);
      localStorage.setItem(`soutarah_negoce_cart_${userId}`, JSON.stringify(updated));
      setNegoceLocalItems(updated);
      setLastQuoteRef('');
      window.dispatchEvent(new Event('soutarah-cart-updated'));
    } catch (e) {
      console.error('Erreur retrait produit négoce', e);
    }
  };

  const updateNegoceQuantity = (id, newQuantity) => {
    try {
      const userId = user?.id || user?.userId || 'guest';
      const updated = negoceLocalItems.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(1, newQuantity) };
        }
        return item;
      });
      localStorage.setItem(`soutarah_negoce_cart_${userId}`, JSON.stringify(updated));
      setNegoceLocalItems(updated);
      setLastQuoteRef('');
      window.dispatchEvent(new Event('soutarah-cart-updated'));
    } catch (e) {
      console.error('Erreur modification qte negoce', e);
    }
  };


  const productItems = productCart?.items || [];
  const allNegoceItems = [...productItems, ...negoceLocalItems.filter((n) => !productItems.some((p) => p.produit?.ref === n.ref || p.product?.ref === n.ref))];

  // Total produits de négoce : items serveur (prix_total) + items locaux (unitPrice × quantité)
  const numOrZero = (v) => Number(v) || 0;
  const negoceItemTotal = (item) => {
    const unit = numOrZero(item.prix_unitaire ?? item.unitPrice ?? item.price);
    const qty = numOrZero(item.quantite ?? item.quantity) || 1;
    return numOrZero(item.total ?? item.prix_total ?? item.totalPrice ?? (unit * qty));
  };
  const productTotal = allNegoceItems.reduce((sum, item) => sum + negoceItemTotal(item), 0);
  const vehicleTotal = vehicleCartItems.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
  const hasVehicles = vehicleCartItems.length > 0;
  const amountHT = productTotal + vehicleTotal;

  // La TDT s'applique UNIQUEMENT aux véhicules, pas aux articles négoce
  const quoteTotals = computeQuoteTotals(amountHT, vehicleTotal);
  const totalItemCount = allNegoceItems.length + vehicleCartItems.length;
  const totalAvecFrais = quoteTotals.ttc;

  const combinedCart = {
    items: [
      ...allNegoceItems.map((pi) => ({ ...pi, type: 'product' })),
      ...vehicleCartItems,
    ],
    total: quoteTotals.ttc,
    itemCount: totalItemCount,
  };

  // mode 'checkout' : panier avec locations → devis + page « Passer commande ».
  // mode 'send' : panier négoce seul → création de la demande (notifications
  // admin déclenchées côté serveur) puis écran « demande transmise », sans prix.
  const validateCart = async (mode = 'checkout') => {
    if (!totalItemCount) return;
    // Garde-fou : un véhicule devenu indisponible (retiré du catalogue ou déjà
    // réservé) interdit de valider le panier tant qu'il est présent.
    if (hasUnavailableVehicles) {
      setError("Ce véhicule n'est pas disponible à la location pour le moment. Vous pouvez choisir un autre véhicule ou nous contacter.");
      return;
    }
    // Garde anti double-clic : évite de créer 2 devis et de télécharger 2 fois.
    if (validatingRef.current) return;
    validatingRef.current = true;
    if (mode === 'send') setSendingNegoce(true);
    try {

    // La création du devis en base exige un compte : on redirige l'invité vers
    // le login, avec retour automatique sur le panier après connexion.
    if (!token || !user) {
      window.sessionStorage.setItem('soutarah_return_route', JSON.stringify({ page: 'cart' }));
      if (navigateTo) navigateTo('login');
      return;
    }

    // 1. Snapshot du panier AVANT de le vider (pour le PDF)
    const cartSnapshot = {
      items: [
        ...allNegoceItems.map((pi) => ({ ...pi, type: 'product' })),
        ...vehicleCartItems,
      ],
      total: quoteTotals.ttc,
      itemCount: totalItemCount,
    };

    // 2. Créer la demande de devis en BDD + notifications via /quote-requests
    let serverRef = '';
    try {
      const productLines = allNegoceItems.map((i) => `${i.product?.name || i.name || 'Article'}${i.ref ? ` [${i.ref}]` : ''} (x${Number(i.quantity || 1)})`);
      const vehicleLines = vehicleCartItems.map((v) => `Location ${v.vehicleName || v.vehicle?.model || 'Véhicule'} (${v.duration || v.days || 1}j)`);
      const description = [...productLines, ...vehicleLines].join(' | ');

      const hasNegoce = allNegoceItems.length > 0;
      const hasVehicles = vehicleCartItems.length > 0;
      let serviceLabel = 'Négoce et Location';
      let titleLabel = 'Devis Panier SOUTARAH';

      if (hasNegoce && !hasVehicles) {
        serviceLabel = 'Fourniture de matériels et Négoce';
        titleLabel = `Devis Fourniture et Négoce (${allNegoceItems.length} article${allNegoceItems.length > 1 ? 's' : ''})`;
      } else if (hasVehicles && !hasNegoce) {
        serviceLabel = 'Location de véhicules';
        titleLabel = `Devis Location de véhicules (${vehicleCartItems.length} véhicule${vehicleCartItems.length > 1 ? 's' : ''})`;
      }

      const payload = {
        service: serviceLabel,
        title: titleLabel,
        name: customerName(user, client),
        email: user?.email || 'infos@soutarahgroup.com',
        phone: customerPhone(user, client) || '0700000000',
        location: client?.adresse || client?.address || 'Abidjan',
        description: description.slice(0, 3000) || 'Devis panier client',
        items: cartSnapshot.items,
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
    // Pas de génération de devis PDF côté client pour l'envoi négoce :
    // l'admin reçoit simplement la notification de la commande.
    if (mode !== 'send') try {
      await generateCartQuotePdf(cartSnapshot, user, client, serverRef, quoteTotals);
      setLastQuoteRef(serverRef);
    } catch (pdfError) {
      console.error('Erreur génération PDF', pdfError);
      setError(`Erreur lors de la génération du PDF : ${pdfError?.message || 'erreur inconnue'}. Votre commande est bien enregistrée (${serverRef}) ; vous pourrez retélécharger le devis depuis « Mes Devis ».`);
    }

    if (mode === 'send') {
      // Demande envoyée : on vide le panier négoce (la demande + ses notifications
      // sont enregistrées côté serveur) puis on affiche la confirmation.
      try {
        const userId = user?.id || user?.userId || 'guest';
        localStorage.removeItem(`soutarah_negoce_cart_${userId}`);
        if (token) await apiRequest('/cart', { token, method: 'DELETE' }).catch(() => {});
      } catch (cartError) {
        console.warn('[envoi] Vidage panier négoce:', cartError.message);
      }
      setNegoceSent(serverRef);
      window.dispatchEvent(new Event('soutarah-cart-updated'));
      return;
    }

    // 4. NE PAS vider le panier : les articles restent si le client revient sans payer
    setNotice(`✅ Devis ${serverRef} créé ! Consultez "Mes Devis".`);

    // 7. Enregistrer la commande puis rediriger le client vers la page "Passer commande"
    const orderData = {
      reference: serverRef,
      name: customerName(user, client),
      phone: customerPhone(user, client),
      ht: quoteTotals.ht,
      tva: quoteTotals.tva,
      tdt: quoteTotals.tdt,
      carburant: quoteTotals.carburant,
      peage: quoteTotals.peage,
      ttc: quoteTotals.ttc,
      itemCount: totalItemCount,
      summaryTitle: `${productItems.length} produit(s) de négoce · ${vehicleCartItems.length} location(s) de véhicule`,
    };
    try {
      window.localStorage.setItem('soutarah_last_order', JSON.stringify(orderData));
    } catch (e) {
      console.error('Erreur enregistrement commande', e);
    }
    if (navigateTo) navigateTo('commande');
    } finally {
      validatingRef.current = false;
      setSendingNegoce(false);
    }
  };

  const downloadLastQuote = async () => {
    if (!totalItemCount || !lastQuoteRef) return;
    const reference = await generateCartQuotePdf(combinedCart, user, client, lastQuoteRef, quoteTotals);
    setLastQuoteRef(reference);
  };

  // Onglet « Rechercher un devis » du panier : retrouver un devis téléchargeable
  // et ouvrir « Passer commande ». Pour une location, le véhicule doit être disponible.
  const searchDevis = async (event) => {
    event.preventDefault();
    const ref = devRef.trim();
    if (!ref) return;
    setDevError('');
    if (!token) {
      setDevError('Connectez-vous avec le compte utilisé lors de votre demande de devis.');
      return;
    }
    setDevBusy(true);
    try {
      const res = await apiRequest(`/quote-requests/lookup?reference=${encodeURIComponent(ref)}`, { token });
      const q = res.quoteRequest || {};
      const items = Array.isArray(q.snapshot) ? q.snapshot : [];

      // Location : le véhicule doit être encore disponible sur les dates du devis
      const vehicleItems = items.filter((it) => it && it.type === 'vehicle_rental' && it.vehicleId && it.startDate && it.endDate);
      for (const it of vehicleItems) {
        const vehicleLabel = it.vehicle?.name || it.vehicleName || 'Véhicule';
        const fmtDate = (d) => String(d).split('-').reverse().join('/');
        try {
          const avail = await apiRequest(
            `/vehicles/${it.vehicleId}/availability?startAt=${encodeURIComponent(it.startDate)}&endAt=${encodeURIComponent(it.endDate)}`,
            { token, retries: 0 },
          );
          if (avail && avail.available === false) {
            setDevError(`Le véhicule « ${vehicleLabel} » n'est plus disponible du ${fmtDate(it.startDate)} au ${fmtDate(it.endDate)}. Choisissez une autre période ou un autre véhicule.`);
            return;
          }
        } catch (availError) {
          if (availError?.statusCode === 404) {
            setDevError(`Le véhicule « ${vehicleLabel} » n'est plus disponible du ${fmtDate(it.startDate)} au ${fmtDate(it.endDate)}. Choisissez une autre période ou un autre véhicule.`);
            return;
          }
          // Réseau / serveur : on ne bloque pas (comme la modale de réservation)
          console.warn('[recherche devis] disponibilité non vérifiable:', availError.message);
        }
      }

      // Totaux officiels recalculés depuis le snapshot du devis
      let ht = 0;
      let vehicleHT = 0;
      items.forEach((it) => {
        const unit = Number(it.unitPrice ?? it.prix_unitaire ?? 0) || 0;
        const qty = Number(it.quantity ?? it.quantite ?? 1) || 1;
        const days = (it.startDate && it.endDate)
          ? Math.max(1, Math.round((new Date(it.endDate) - new Date(it.startDate)) / 86400000) + 1)
          : (Number(it.days ?? it.duration ?? 1) || 1);
        const lineTotal = (Number(it.totalPrice ?? it.total ?? it.prix_total ?? 0) || 0)
          || (it.type === 'vehicle_rental' ? unit * days : unit * qty);
        ht += lineTotal;
        if (it.type === 'vehicle_rental') vehicleHT += lineTotal;
      });
      if (ht === 0 && Number(q.budget) > 0) ht = Math.round(Number(q.budget));
      const totals = computeQuoteTotals(ht, vehicleHT);
      const orderData = {
        reference: q.reference,
        name: customerName(user, client) || q.nom || '',
        phone: customerPhone(user, client) || q.telephone || '',
        ht: totals.ht,
        tva: totals.tva,
        tdt: totals.tdt,
        carburant: totals.carburant,
        peage: totals.peage,
        ttc: totals.ttc,
        itemCount: items.length || (ht > 0 ? 1 : 0),
        summaryTitle: q.titre || 'Devis SOUTARAH',
      };
      try {
        window.localStorage.setItem('soutarah_last_order', JSON.stringify(orderData));
      } catch (storageError) {
        console.error('Enregistrement commande', storageError);
      }
      if (navigateTo) navigateTo('commande');
    } catch (err) {
      setDevError(err?.message || 'Aucun devis trouvé avec cette référence.');
    } finally {
      setDevBusy(false);
    }
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

          {/* Onglet de recherche : retrouver un devis par référence (PDF téléchargeable) */}
          <div className="mt-6 rounded-[28px] border border-primary/15 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Search size={20} /></span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Rechercher un devis</p>
                <p className="text-xs leading-5 text-gray-500">
                  Entrez la référence de votre devis PDF (ex. 09-26/LOC/164 ou DMD-2026-1234) pour reprendre votre commande.
                </p>
              </div>
            </div>
            <form onSubmit={searchDevis} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={devRef}
                onChange={(e) => setDevRef(e.target.value)}
                placeholder="09-26/LOC/164 ou DMD-2026-1234"
                className="flex-1 rounded-xl border border-gray-200 bg-[#f8faf7] px-4 py-2.5 text-sm font-medium uppercase tracking-wide text-gray-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              />
              <button
                type="submit"
                disabled={devBusy || !devRef.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-primary/20 transition hover:bg-[#1b4c00] disabled:bg-gray-300"
              >
                <Search size={16} /> {devBusy ? 'Recherche…' : 'Rechercher'}
              </button>
            </form>
            {devError && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{devError}</p>
            )}
          </div>

          {negoceSent ? (
            /* ── CONFIRMATION ENVOI NÉGOCE (sans prix) ── */
            <div className="mt-8 rounded-[28px] border border-emerald-200 bg-white px-6 py-14 text-center shadow-sm">
              <CheckCircle2 className="mx-auto text-primary" size={48} />
              <h2 className="mt-5 font-display text-2xl font-extrabold text-[#173d23]">Votre demande a bien été transmise !</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">
                Merci ! Votre demande est bien partie : nos équipes vous recontacteront très vite avec une offre sur mesure.
                Un accusé de réception vient de vous être envoyé par e-mail.
              </p>
              <p className="mt-4 inline-block rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-primary">
                Référence {negoceSent}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button onClick={() => navigateTo('service', { slug: 'negoce' })} className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1b4c00]">
                  Retour au catalogue
                </button>
              </div>
            </div>
          ) : totalItemCount === 0 ? (
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
                      {vehicleCartItems.map((item) => {
                        const indisponible = Boolean(item.vehicleId) && unavailableVehicleIds.includes(item.vehicleId);
                        return (
                        <article
                          key={item.id}
                          className={`p-5 sm:p-6 transition-colors ${indisponible ? 'bg-red-50/60' : 'hover:bg-gray-50/50'}`}
                        >
                          {indisponible && (
                            <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                              ⚠️ Ce véhicule n'est pas disponible à la location pour le moment. Vous pouvez choisir un autre véhicule ou nous contacter.
                            </p>
                          )}
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
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* SECTION PRODUITS NEGOCE */}
                {(productItems.length > 0 || negoceLocalItems.length > 0) && (
                  <section className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-primary/10">
                    <div className="border-b border-gray-100 bg-[#f8faf7] px-6 py-4">
                      <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-[#173d23]">
                        <PackageCheck size={20} className="text-primary" />
                        Produits de négoce ({allNegoceItems.length})
                      </h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {negoceLocalItems.map((item) => (
                          <article key={item.id} className="grid gap-4 px-5 py-5 md:grid-cols-[1fr_120px_120px] md:items-center">
                            <div className="flex min-w-0 gap-4">
                              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-primary/10">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="h-full w-full object-contain p-1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                ) : (
                                  <div className="grid h-full place-items-center text-primary"><PackageCheck size={22} /></div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wider text-primary">{item.category || 'Négoce'}</p>
                                <h3 className="mt-1 truncate font-display text-lg font-extrabold">{item.name}</h3>
                                <p className="mt-1 text-sm text-gray-500">{item.ref ? `Réf. ${item.ref}` : ''}{numOrZero(item.unitPrice ?? item.price) > 0 ? `${item.ref ? ' · ' : ''}${currency(numOrZero(item.unitPrice ?? item.price))} / unité` : ''}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 md:justify-center">
                              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 md:hidden">Quantité</span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => updateNegoceQuantity(item.id, Math.max(1, Number(item.quantity || 1) - 1))} className="grid h-8 w-8 place-items-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-primary hover:text-primary"><Minus size={14} /></button>
                                <QuantityInput
                                  value={item.quantity || 1}
                                  onCommit={(q) => updateNegoceQuantity(item.id, q)}
                                  ariaLabel={`Quantité de ${item.name || 'article'}`}
                                />
                                <button onClick={() => updateNegoceQuantity(item.id, Number(item.quantity || 1) + 1)} className="grid h-8 w-8 place-items-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-primary hover:text-primary"><Plus size={14} /></button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 md:block md:text-right">
                              <p className="font-display text-lg font-extrabold text-primary">{negoceItemTotal(item) > 0 ? currency(negoceItemTotal(item)) : 'Sur devis'}</p>
                              <button onClick={() => removeNegoceItem(item.id)} className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-red-600">
                                <Trash2 size={14} /> Retirer
                              </button>
                            </div>
                          </article>
                        ))}
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
                                <QuantityInput
                                  value={quantity}
                                  onCommit={(q) => changeQuantity(item, q)}
                                  ariaLabel={`Quantité de ${productName}`}
                                />
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

              {/* ASIDE : négoce seul → envoi sans prix ; sinon récap (locations) */}
              <aside className="h-fit rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-primary/10">
                {!hasVehicles && allNegoceItems.length > 0 ? (
                  <>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Votre demande</p>
                    <p className="mt-4 text-sm leading-6 text-gray-600">
                      Composez votre sélection puis envoyez votre demande : notre équipe vous recontactera rapidement avec une offre sur mesure.
                    </p>
                    <div className="mt-4 flex justify-between text-sm text-gray-600">
                      <span>Articles à chiffrer</span>
                      <span className="font-bold text-[#173d23]">{allNegoceItems.length}</span>
                    </div>
                    <button
                      onClick={() => validateCart('send')}
                      disabled={sendingNegoce}
                      className="mt-6 w-full rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-primary/20 transition hover:bg-[#1b4c00] disabled:cursor-wait disabled:opacity-60"
                    >
                      {sendingNegoce ? 'Envoi en cours…' : 'Envoyer la demande'}
                    </button>
                    <p className="mt-3 text-center text-[11px] leading-4 text-gray-400">
                      Sans engagement — devis confirmé par nos soins avant toute facturation.
                    </p>
                  </>
                ) : (
                  <>
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

                  {allNegoceItems.length > 0 && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Produits négoce ({allNegoceItems.length})</span>
                      <span className="font-bold text-gray-800">{productTotal > 0 ? currency(productTotal) : 'Sur devis'}</span>
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
                  {quoteTotals.tdt > 0 && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>TDT 2.5%</span>
                      <span className="font-bold text-gray-700">{currency(quoteTotals.tdt)}</span>
                    </div>
                  )}

                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-base font-extrabold text-[#173d23]">Montant TTC</span>
                  <span className="text-xl font-extrabold text-primary">{currency(totalAvecFrais)}</span>
                </div>
                <button onClick={() => validateCart('checkout')} className="mt-6 w-full rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-primary/20 transition hover:bg-[#1b4c00]">
                  Valider
                </button>
                  </>
                )}
              </aside>
            </div>
          )}
        </section>
      </main>
      <Footer onNavClick={footerNavigation} />
    </div>
  );
}
