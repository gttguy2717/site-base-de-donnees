import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Landmark,
  Lock,
  MapPin,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { apiRequest } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const money = (value) => new Intl.NumberFormat('fr-CI', { maximumFractionDigits: 0 }).format(value || 0);

const ORDER_KEY = 'soutarah_last_order';

/* --------------- Logos officiels des moyens de paiement --------------- */

// Affiche un logo officiel ; masque l'image en cas d'erreur de chargement.
function PayLogo({ src, alt, maxW = 'w-12' }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`h-9 ${maxW} object-contain`}
      onError={(event) => { event.currentTarget.style.display = 'none'; }}
    />
  );
}

function CarteBrand() {
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      <PayLogo src="/img/payment/visa.svg" alt="Visa" maxW="w-12" />
      <PayLogo src="/img/payment/mastercard.svg" alt="Mastercard" maxW="w-9" />
    </span>
  );
}

function OrangeBrand() {
  return <PayLogo src="/img/payment/orange-money.svg" alt="Orange Money" maxW="w-12" />;
}

function MtnBrand() {
  return <PayLogo src="/img/payment/mtn.svg" alt="MTN Mobile Money" maxW="w-12" />;
}

function MoovBrand() {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#E60000] text-[10px] font-black lowercase text-white" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      moov
    </span>
  );
}

function WaveBrand() {
  return <PayLogo src="/img/payment/wave.png" alt="Wave" maxW="w-12" />;
}

function MoovWaveBrand() {
  return (
    <span className="flex shrink-0 items-center gap-1">
      <MoovBrand />
      <WaveBrand />
    </span>
  );
}

function CashBrand() {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#173d23]" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <rect x="2.5" y="6" width="19" height="12" rx="2.5" stroke="#ffffff" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="2.6" fill="#ffffff" />
        <circle cx="17" cy="9.2" r="1" fill="#ffffff" />
        <circle cx="7" cy="14.8" r="1" fill="#ffffff" />
      </svg>
    </span>
  );
}

const PAYMENT_METHODS = [
  { id: 'carte', label: 'Carte bancaire', hint: 'Visa et Mastercard', brand: CarteBrand },
  { id: 'orange', label: 'Orange Money', hint: 'Paiement mobile Orange CI', brand: OrangeBrand },
  { id: 'mtn', label: 'MTN Mobile Money', hint: 'Mobile Money MTN CI', brand: MtnBrand },
  { id: 'moov', label: 'Moov Money / Wave', hint: 'Mobile Money & Wave CI', brand: MoovWaveBrand },
  { id: 'especes', label: 'Espèces à l’agence', hint: 'Paiement sur place', brand: CashBrand },
];

function PasserCommandePage({ navigateTo }) {
  const { user, token } = useAuth();
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState('carte');
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [notice, setNotice] = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardHolder: '',
    mobileNumber: '',
  });

  useEffect(() => {
    let o = null;
    try {
      const raw = window.localStorage.getItem(ORDER_KEY);
      o = raw ? JSON.parse(raw) : null;
    } catch (e) {
      o = null;
    }
    if (o) {
      setOrder(o);
      setForm((f) => ({
        ...f,
        name: o.name || '',
        phone: o.phone || '',
      }));
    }
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const isEspeces = method === 'especes';
  const isCard = method === 'carte';
  const isMobile = method === 'orange' || method === 'mtn' || method === 'moov';

  const isOnlinePayment = method !== 'especes';

  const submitOrder = async (e) => {
    e.preventDefault();
    setSending(true);
    setNotice('');

    // Redirection vers Genius Pay → paiement réel initié
    let paidOnline = false;

    try {
      // Paiement en ligne via Genius Pay (carte, Orange Money, MTN, Moov/Wave)
      if (isOnlinePayment && order) {
        const channelMap = {
          carte: 'card',
          orange: 'orange_money',
          mtn: 'mtn_momo',
          moov: 'moov_money',
        };
        try {
          const pay = await apiRequest('/payments/geniuspay/initialize', {
            token,
            method: 'POST',
            body: JSON.stringify({
              amount: order.ttc,
              reference: order.reference,
              description: `Commande ${order.reference} - SOUTARAH GROUP`,
              customerName: form.name || order.name || user?.email || 'Client SOUTARAH',
              customerPhone: form.phone || order.phone || '0700000000',
              channel: channelMap[method],
            }),
          });
          if (pay && pay.checkoutUrl) {
            // Rediriger vers la plateforme de paiement Genius Pay (paiement réel en cours)
            paidOnline = true;
            window.location.href = pay.checkoutUrl;
            return;
          }
          // Pas d'URL : repli simulé SANS paiement réel
        } catch (payError) {
          if (payError.statusCode === 503 || (payError.message && payError.message.includes('configuré'))) {
            // Genius Pay non configuré : repli simulé SANS paiement réel
          } else {
            console.error('[commande] GeniusPay', payError.message);
          }
        }
      }

      // ⚠️ Plus de création de devis ici : le devis (avec snapshot des articles) est déjà créé
      // à la validation du panier. La confirmation ci-dessous notifie déjà le back-office et le client.
      if (order) {
        try {
          await apiRequest('/quote-requests/confirm', {
            token,
            method: 'POST',
            body: JSON.stringify({
              reference: order.reference,
              paymentMethod: PAYMENT_METHODS.find((m) => m.id === method)?.label || method,
            }),
          });
        } catch (confirmError) {
          console.warn('[commande] Auto-validation devis:', confirmError.message);
        }
      }
    } catch (err) {
      console.error('[commande] Erreur notification', err);
    } finally {
      setSending(false);
      setConfirmed(true);
      window.dispatchEvent(new Event('soutarah-notifications-updated'));

      // Vider le panier UNIQUEMENT si le paiement est réellement confirmé
      // (espèces validées OU redirection réelle vers Genius Pay).
      // En mode repli (simulation sans paiement), le panier reste intact.
      const paymentYetDone = isEspeces || paidOnline;
      if (paymentYetDone) {
        try {
          const userId = user?.id || user?.userId || 'guest';
          localStorage.removeItem(`soutarah_vehicle_cart_${userId}`);
          localStorage.removeItem(`soutarah_negoce_cart_${userId}`);
          if (token) {
            await apiRequest('/cart', { token, method: 'DELETE' }).catch(() => {});
          }
          window.dispatchEvent(new Event('soutarah-cart-updated'));
        } catch (cartError) {
          console.warn('[commande] Vidage du panier:', cartError.message);
        }
      }
    }
  };

  const fullAddress = 'Riviera Palmeraie Saint Viateur, Cité Kimi, Abidjan, Côte d’Ivoire';

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f2] text-on-surface">
      {/* Arrière-plan clair cohérent avec le reste du site */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#eef4eb] via-[#f4f7f2] to-[#e7f0e3]" />
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#69c33b]/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-[500px] w-[500px] rounded-full bg-[#1b6b3a]/8 blur-3xl" />
        <div className="absolute left-1/3 top-1/2 h-72 w-72 rounded-full bg-[#77d141]/8 blur-3xl" />
        {/* Motif de grille subtile */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1b6b3a" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <Navbar navigateTo={navigateTo} activeTab="cart" />
      <main className="flex-grow pt-28">
        <section className="mx-auto max-w-4xl px-5 pb-16">
          {/* En-tête */}
          <div className="relative overflow-hidden rounded-[32px] border border-primary/10 bg-white/80 p-8 text-on-surface shadow-xl sm:p-10">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#69c33b]/15 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[#77d141]/10 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">SOUTARAH GROUP</p>
              <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-[#173d23] sm:text-5xl">Passer commande</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
                Choisissez votre mode de paiement pour finaliser votre commande en toute sécurité.
              </p>
            </div>
          </div>
{confirmed ? (
            <div className="mt-8 rounded-[28px] border border-primary/10 bg-white p-8 text-center shadow-xl">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-[#2d8f4e] shadow-lg shadow-primary/30"><CheckCircle2 className="text-white" size={36} /></div>
              <h2 className="mt-5 font-display text-2xl font-extrabold text-[#173d23]">Commande {order?.reference} enregistrée</h2>
              <p className="mt-2 text-sm text-gray-600">
                Nous vous recontactons rapidement au {form.phone || order?.phone || 'votre numéro'} pour confirmer votre commande
                (paiement par <strong>{PAYMENT_METHODS.find((m) => m.id === method)?.label || method}</strong>).
              </p>

              {isEspeces ? (
                <div className="mx-auto mt-6 max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <MapPin size={18} className="text-amber-700" /> Paiement en espèces : venez à SOUTARAH
                  </div>
                  <p className="mt-2 text-sm leading-6 text-amber-900/90">
                    Merci de vous rendre à notre agence pour régler votre commande en espèces :
                    <br />
                    <span className="font-bold">{fullAddress}</span>
                    <br />
                    Tél : <a className="underline" href="tel:+2250718383838">+225 07 18 38 38 38</a>
                  </p>
                </div>
              ) : (
                <div className="mx-auto mt-6 max-w-md rounded-2xl border border-primary/10 bg-[#f2f7ef] p-5 text-left text-sm text-gray-700">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <Landmark size={18} /> Paiement {PAYMENT_METHODS.find((m) => m.id === method)?.label}
                  </div>
                  <p className="mt-2 leading-6">
                    Votre paiement est en cours de traitement. Vous recevrez la confirmation et votre reçu par SMS /
                    e-mail dans quelques instants.
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => navigateTo('client', { tab: 'devis' })}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1b4c00]"
                >
                  Voir mes devis
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submitOrder} className="mt-8 space-y-6">
              {order && (
                <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-xl">
                  <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-[#173d23] to-[#1f5a34] px-6 py-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Référence</p>
                      <p className="font-display text-xl font-extrabold text-white">{order.reference}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">À payer</p>
                      <p className="font-display text-2xl font-extrabold text-white">{money(order.ttc)} FCFA</p>
                    </div>
                  </div>
                  <div className="px-5 py-3 text-xs text-gray-500">
                    <p>{order.summaryTitle || 'Votre commande'} - <strong>{order.itemCount || 0}</strong> article(s)</p>
                  </div>
                  <div className="border-t border-gray-100 px-5 py-3">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                      <div className="flex justify-between text-gray-500"><span>Montant HT</span><span className="font-bold text-gray-800">{money(order.ht)} FCFA</span></div>
                      <div className="flex justify-between text-gray-500"><span>TVA 18%</span><span className="font-bold text-gray-800">{money(order.tva)} FCFA</span></div>
                      <div className="flex justify-between text-gray-500"><span>TDT 2,5%</span><span className="font-bold text-gray-800">{money(order.tdt)} FCFA</span></div>
                      <div className="flex justify-between font-bold text-primary"><span>Total TTC</span><span>{money(order.ttc)} FCFA</span></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">1. Informations du client</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-bold text-gray-600">
                    Nom complet <span className="text-primary">*</span>
                    <input
                      required
                      value={form.name}
                      onChange={update('name')}
                      placeholder="Ex : David Sorho"
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                  <label className="block text-xs font-bold text-gray-600">
                    Téléphone <span className="text-primary">*</span>
                    <input
                      required
                      value={form.phone}
                      onChange={update('phone')}
                      placeholder="07 00 00 00 00"
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                </div>
              </div>
<div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">2. Moyen de paiement</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {PAYMENT_METHODS.map((m) => {
                    const Brand = m.brand;
                    const active = method === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setMethod(m.id)}
                        aria-pressed={active}
                        className={`relative flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                          active
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                            : 'border-gray-200 bg-white hover:border-primary/40 hover:shadow-sm'
                        }`}
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white ring-1 ring-black/10">
                          <Brand />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-extrabold text-[#111827]">{m.label}</span>
                          <span className="block text-[11px] text-gray-500">{m.hint}</span>
                        </span>
                        {active && (
                          <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-white shadow">
                            <Check size={12} strokeWidth={3.5} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-400">
                  <Lock size={13} />
                  <span>Paiement sécurisé via Genius Pay - vos données sont chiffrées.</span>
                </div>

                {isCard && (
                  <div className="mt-5 grid gap-4 rounded-2xl bg-[#f8faf7] p-5 sm:grid-cols-2">
                    <label className="block text-xs font-bold text-gray-600 sm:col-span-2">
                      Numéro de carte
                      <input
                        required
                        inputMode="numeric"
                        value={form.cardNumber}
                        onChange={update('cardNumber')}
                        placeholder="4242 4242 4242 4242"
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                      />
                    </label>
                    <label className="block text-xs font-bold text-gray-600">
                      Expiration
                      <input
                        required
                        value={form.cardExpiry}
                        onChange={update('cardExpiry')}
                        placeholder="MM/AA"
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                      />
                    </label>
                    <label className="block text-xs font-bold text-gray-600">
                      CVC
                      <input
                        required
                        inputMode="numeric"
                        value={form.cardCvc}
                        onChange={update('cardCvc')}
                        placeholder="123"
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                      />
                    </label>
                    <label className="block text-xs font-bold text-gray-600 sm:col-span-2">
                      Titulaire de la carte
                      <input
                        required
                        value={form.cardHolder}
                        onChange={update('cardHolder')}
                        placeholder="Nom du titulaire"
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                      />
                    </label>
                  </div>
                )}

                {isMobile && (
                  <div className="mt-5 rounded-2xl bg-[#f8faf7] p-5">
                    <label className="block text-xs font-bold text-gray-600">
                      Numéro de téléphone {PAYMENT_METHODS.find((m) => m.id === method)?.label}
                      <div className="mt-2 flex gap-3">
                        <span className="grid place-items-center rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-500">+225</span>
                        <input
                          required
                          inputMode="tel"
                          value={form.mobileNumber}
                          onChange={update('mobileNumber')}
                          placeholder="07 00 00 00 00"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                        />
                      </div>
                    </label>
                  </div>
                )}
{isEspeces && (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <MapPin size={18} className="text-amber-700" /> Paiement en espèces : venez à SOUTARAH
                    </div>
                    <p className="mt-2 text-sm leading-6 text-amber-900/90">
                      Merci de venir régler en espèces à notre agence. Un message de confirmation vous sera envoyé
                      pour vous rappeler de vous présenter sur place.
                      <br />
                      <span className="font-bold">{fullAddress}</span>
                    </p>
                  </div>
                )}
              </div>
{notice && <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{notice}</div>}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => navigateTo('cart')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-[#f2f7ef] hover:text-primary"
                >
                  <ArrowLeft size={16} /> Retour au panier
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-primary/20 transition hover:bg-[#1b4c00] disabled:bg-gray-300"
                >
                  <CheckCircle2 size={18} />
                  {sending ? 'Traitement…' : isEspeces ? 'Confirmer la commande (espèces)' : 'Payer et confirmer'}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
      <Footer onNavClick={(target) => navigateTo(target, target === 'home' ? { section: 'home' } : {})} />
    </div>
  );
}

export default PasserCommandePage;
