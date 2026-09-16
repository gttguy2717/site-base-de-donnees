import { useState } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  CarFront,
  CheckCircle2,
  Headset,
  Package,
  Phone,
  ShieldCheck,
  Truck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const initialRegister = { customerType: 'PARTICULIER', firstName: '', lastName: '', companyName: '', responsibleName: '', identificationNumber: '', email: '', phone: '', address: '', password: '', confirmPassword: '', documents: [] };

const perks = [
  { icon: CarFront, title: 'Location de véhicules', text: 'SUV, berlines, utilitaires avec ou sans chauffeur.' },
  { icon: Package, title: 'Négoce & import-export', text: 'Un catalogue de produits et équipements variés.' },
  { icon: Zap, title: 'Énergie & technique', text: 'Installations solaires, climatisation et maintenance.' },
];

export default function AuthPage({ mode, navigateTo }) {
  const { login, register } = useAuth();
  const [data, setData] = useState(mode === 'login' ? { identifier: '', password: '' } : initialRegister);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const isLogin = mode === 'login';

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!isLogin && data.password !== data.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    // Documents obligatoires pour les entreprises
    if (!isLogin && data.customerType === 'ENTREPRISE' && (!data.documents || data.documents.length === 0)) {
      setError('Veuillez joindre au moins un document justificatif de votre entreprise (RCCM, attestation, pièce d’identité, etc.).');
      return;
    }

    setPending(true);
    try {
      let payload;
      if (!isLogin && data.customerType === 'ENTREPRISE') {
        // Envoi en multipart avec les documents
        const formData = new FormData();
        formData.append('customerType', 'ENTREPRISE');
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        formData.append('address', data.address || '');
        formData.append('password', data.password);
        formData.append('companyName', data.companyName || '');
        formData.append('responsibleName', data.responsibleName || '');
        formData.append('identificationNumber', data.identificationNumber || '');
        Array.from(data.documents || []).forEach((file) => formData.append('documents', file));
        payload = formData;
      } else {
        payload = data;
      }

      const result = isLogin ? await login(payload) : await register(payload);

      // Entreprise en attente de validation des documents
      if (!isLogin && result && result.requiresVerification) {
        setSubmitted(true);
        setPending(false);
        return;
      }

      if (result.user?.role === 'ADMIN' || result.user?.role === 'MANAGER') {
        navigateTo('admin');
        return;
      }

      const savedRouteRaw = window.sessionStorage.getItem('soutarah_return_route');
      if (savedRouteRaw) {
        window.sessionStorage.removeItem('soutarah_return_route');
        try {
          const savedRoute = JSON.parse(savedRouteRaw);
          if (savedRoute?.page && savedRoute.page !== 'login' && savedRoute.page !== 'register') {
            navigateTo(savedRoute.page, savedRoute);
            return;
          }
        } catch (e) {
          // Fallback to home if JSON parsing fails
        }
      }

      navigateTo('home');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  };

  const change = (event) => setData((current) => ({ ...current, [event.target.name]: event.target.value }));
  const changeDocuments = (event) => setData((current) => ({ ...current, documents: Array.from(event.target.files || []) }));
﻿
return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f7f1] px-5 py-10 sm:py-16">
      {/* ── Arrière-plan : image + voiles de dégradés ── */}
      <div className="absolute inset-0 bg-[url('/fond-home.png')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b2f16]/85 via-[#143e22]/75 to-[#2d5f1e]/80" />
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#69c33b]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />

      <button
        onClick={() => navigateTo('home')}
        className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
      >
        <ArrowLeft size={16} /> Retour au site
      </button>

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-black/30 ring-1 ring-white/20 lg:grid-cols-2">
        {/* ── Panneau branding (desktop) ── */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[#173d23] p-10 text-white lg:flex">
          <div className="absolute inset-0 bg-[url('https://soutarahgroup.ci/img/tecg.jpeg')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b2f16]/40 via-[#173d23]/85 to-[#0b2f16]/95" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#69c33b]" /> SOUTARAH GROUP
            </div>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight">
              Bâtir des solutions <span className="text-[#69c33b]">fiables</span>
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-emerald-50/85">
              {isLogin
                ? 'Connectez-vous pour gérer vos réservations, devis et commandes en un seul endroit.'
                : 'Créez votre espace et profitez de tarifs adaptés à votre profil.'}
            </p>
          </div>

          <div className="relative mt-10 space-y-4">
            {perks.map((perk) => {
              const Icon = perk.icon;
              return (
                <div key={perk.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#69c33b]/20 text-[#aef08a]">
                    <Icon size={20} />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold">{perk.title}</span>
                    <span className="text-xs text-emerald-50/75">{perk.text}</span>
                  </span>
                </div>
              );
            })}
          </div>

          <div className="relative mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs text-emerald-50/70">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} /> Paiement sécurisé</span>
            <span className="inline-flex items-center gap-1.5"><Headset size={14} /> Support 7j/7</span>
            <span className="inline-flex items-center gap-1.5"><Truck size={14} /> Livraison Abidjan</span>
          </div>
        </div>

        {/* ── Carte du formulaire ── */}
        <div className="bg-white p-6 sm:p-10">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">SOUTARAH GROUP</span>
          </div>

          <h2 className="font-display text-3xl font-extrabold text-on-surface">{isLogin ? 'Connexion' : 'Créer votre compte'}</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            {isLogin ? 'Heureux de vous revoir. Accédez à votre espace.' : 'Particulier ou entreprise : vos tarifs seront appliqués automatiquement.'}
          </p>

          {submitted ? (
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="mt-4 font-display text-xl font-extrabold text-emerald-900">Inscription reçue !</h3>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Merci pour votre demande. Les documents de votre entreprise sont en cours d'examen par notre équipe.
                Une fois validés, vous recevrez une notification pour activer votre compte et accéder à vos tarifs.
              </p>
              <button
                onClick={() => navigateTo('home')}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1b4c00]"
              >
                Retour à l’accueil
              </button>
            </div>
          ) : (
          <>
          <form onSubmit={submit} className="mt-7 space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
                  {['PARTICULIER', 'ENTREPRISE'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setData((current) => ({ ...current, customerType: type }))}
                      className={`rounded-lg px-3 py-2 text-xs font-bold transition ${data.customerType === type ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {type === 'PARTICULIER' ? 'Particulier' : 'Entreprise'}
                    </button>
                  ))}
                </div>
                {data.customerType === 'PARTICULIER' ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nom" name="lastName" value={data.lastName} onChange={change} required />
                    <Field label="Prénom" name="firstName" value={data.firstName} onChange={change} required />
                  </div>
                ) : (
                  <>
                    <Field label="Nom de l’entreprise" name="companyName" value={data.companyName} onChange={change} required />
                    <Field label="Nom du responsable" name="responsibleName" value={data.responsibleName} onChange={change} />
                    <Field label="Numéro d’identification (RCCM / DFU)" name="identificationNumber" value={data.identificationNumber} onChange={change} />
                    <div className="rounded-2xl border border-primary/15 bg-primary/5 p-3">
                      <span className="mb-1 block text-sm font-semibold text-on-surface">
                        Documents justificatifs (obligatoires) <span className="text-primary">*</span>
                      </span>
                      <input
                        type="file"
                        name="documents"
                        multiple
                        accept="image/*,application/pdf"
                        onChange={changeDocuments}
                        className="w-full text-sm text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-[#1b4c00]"
                      />
                      <p className="mt-1.5 text-[11px] leading-4 text-gray-500">
                        RCCM, attestation, pièce d’identité du responsable… Ces documents nous permettront de vérifier
                        votre entreprise et de vous attribuer vos propres tarifs. Ils seront examinés par notre équipe
                        avant l’activation de votre compte.
                      </p>
                      {data.documents && data.documents.length > 0 && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 size={13} /> {data.documents.length} document(s) joint(s)
                        </span>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {isLogin ? (
              <Field label="Email ou téléphone" name="identifier" value={data.identifier} onChange={change} required />
            ) : (
              <>
                <Field label="Email" name="email" type="email" value={data.email} onChange={change} required />
                <Field label="Téléphone" name="phone" type="tel" value={data.phone} onChange={change} required />
                <Field label="Adresse" name="address" value={data.address} onChange={change} />
              </>
            )}

            <Field label="Mot de passe" name="password" type="password" value={data.password} onChange={change} required minLength={isLogin ? 1 : 8} />
            {!isLogin && <Field label="Confirmation du mot de passe" name="confirmPassword" type="password" value={data.confirmPassword} onChange={change} required minLength={8} />}

            {error && (
              <p role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={16} /> {error}
              </p>
            )}

            <button
              disabled={pending}
              type="submit"
              className="w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition hover:bg-[#1b4c00] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? 'Traitement…' : isLogin ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-primary/10 bg-[#f2f7ef] p-4 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? 'Pas encore de compte ?' : 'Déjà inscrit ?'}{' '}
              <button onClick={() => navigateTo(isLogin ? 'register' : 'login')} className="font-bold text-primary underline-offset-2 hover:underline">
                {isLogin ? 'Créer un compte' : 'Se connecter'}
              </button>
            </p>
          </div>

          <a href="tel:+2250718383838" className="mt-4 inline-flex w-full items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:text-primary">
            <Phone size={13} /> Besoin d’aide ? +225 07 18 38 38 38
          </a>
          </>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ label, name, type = 'text', value, onChange, required, minLength }) {
  return (
    <label className="block text-sm font-semibold text-on-surface">
      <span className="mb-1 block">{label}{required && ' *'}</span>
      <input
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-normal outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
      />
    </label>
  );
}
