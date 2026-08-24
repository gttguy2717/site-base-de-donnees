import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const initialRegister = { customerType: 'PARTICULIER', firstName: '', lastName: '', companyName: '', email: '', phone: '', address: '', password: '', confirmPassword: '' };

export default function AuthPage({ mode, navigateTo }) {
  const { login, register } = useAuth();
  const [data, setData] = useState(mode === 'login' ? { identifier: '', password: '' } : initialRegister);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const isLogin = mode === 'login';

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    // Vérifier que les mots de passe correspondent lors de l'inscription
    if (!isLogin && data.password !== data.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setPending(true);
    try {
      const result = isLogin ? await login(data) : await register(data);
      if (result.user.role === 'ADMIN' || result.user.role === 'MANAGER') {
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

  return (
    <main className="min-h-screen bg-[#f3f7f1] px-5 py-12 sm:py-20">
      <section className="mx-auto max-w-lg rounded-3xl border border-primary/10 bg-white p-6 shadow-xl shadow-primary/10 sm:p-10">
        <button onClick={() => navigateTo('home')} className="text-sm font-bold text-primary hover:text-[#1b4c00]">← Retour au site</button>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-primary">SOUTARAH GROUP</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-on-surface">{isLogin ? 'Connexion à votre espace' : 'Créer votre compte'}</h1>
        <p className="mt-2 text-sm text-on-surface-variant">{isLogin ? 'Connectez-vous avec votre email ou votre numéro de téléphone.' : 'Particulier ou entreprise : vos tarifs seront appliqués automatiquement.'}</p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          {!isLogin && <>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
              {['PARTICULIER', 'ENTREPRISE'].map((type) => <button key={type} type="button" onClick={() => setData((current) => ({ ...current, customerType: type }))} className={`rounded-lg px-3 py-2 text-xs font-bold ${data.customerType === type ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>{type === 'PARTICULIER' ? 'Particulier' : 'Entreprise'}</button>)}
            </div>
            {data.customerType === 'PARTICULIER' ? <div className="grid gap-4 sm:grid-cols-2"><Field label="Nom" name="lastName" value={data.lastName} onChange={change} required /><Field label="Prénom" name="firstName" value={data.firstName} onChange={change} required /></div> : <Field label="Nom de l’entreprise" name="companyName" value={data.companyName} onChange={change} required />}
          </>}
          {isLogin ? <Field label="Email ou téléphone" name="identifier" value={data.identifier} onChange={change} required /> : <><Field label="Email" name="email" type="email" value={data.email} onChange={change} required /><Field label="Téléphone" name="phone" type="tel" value={data.phone} onChange={change} required /><Field label="Adresse" name="address" value={data.address} onChange={change} /></>}
          <Field label="Mot de passe" name="password" type="password" value={data.password} onChange={change} required minLength={isLogin ? 1 : 8} />
          {!isLogin && <Field label="Confirmation du mot de passe" name="confirmPassword" type="password" value={data.confirmPassword} onChange={change} required minLength={8} />}
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button disabled={pending} type="submit" className="w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'Traitement…' : isLogin ? 'Se connecter' : 'Créer mon compte'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">{isLogin ? 'Pas encore de compte ?' : 'Déjà inscrit ?'} <button onClick={() => navigateTo(isLogin ? 'register' : 'login')} className="font-bold text-primary">{isLogin ? 'Créer un compte' : 'Se connecter'}</button></p>
      </section>
    </main>
  );
}

function Field({ label, name, type = 'text', value, onChange, required, minLength }) {
  return <label className="block text-sm font-semibold text-on-surface"><span className="mb-1 block">{label}{required && ' *'}</span><input className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary" name={name} type={type} value={value} onChange={onChange} required={required} minLength={minLength} /></label>;
}