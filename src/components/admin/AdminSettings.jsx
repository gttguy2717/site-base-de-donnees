import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AvatarUploader from '../AvatarUploader';

export default function AdminSettings({ navigateTo }) {
  const { user, token, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profil admin
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Administrateur',
  });

  // Informations entreprise
  const [company, setCompany] = useState({
    name: 'SOUTARAH GROUP',
    address: 'Abidjan, Riviera-Palmeraie SIPIM 4',
    phone: '+225 07 18 38 38 38',
    email: 'contact@soutarah.com',
    website: 'www.soutarah.com',
    description: 'Négoce de quincaillerie, plomberie, fournitures BTP, énergie solaire, location de véhicules et gestion de projets.',
  });

  // Paramètres de notification
  const [notifications, setNotifications] = useState({
    newQuote: true,
    newClient: true,
    newReservation: true,
    emailAlerts: true,
  });

  // Emails de réception des devis
  const [quoteEmails, setQuoteEmails] = useState([
    'contact@soutarah.com',
  ]);
  const [newQuoteEmail, setNewQuoteEmail] = useState('');

  // Paramètres de sécurité
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: false,
  });

  // Paramètres boutique
  const [shop, setShop] = useState({
    currency: 'FCFA',
    language: 'Français',
    timezone: 'Africa/Abidjan (GMT+0)',
    maintenanceMode: false,
  });

  // Charger les paramètres depuis le backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const s = data.settings || {};

          if (s.profile) {
            setProfile((prev) => ({ ...prev, ...s.profile }));
          }
          if (s.company) {
            setCompany((prev) => ({ ...prev, ...s.company }));
          }
          if (s.notifications) {
            setNotifications((prev) => ({ ...prev, ...s.notifications }));
          }
          if (s.quoteEmails && Array.isArray(s.quoteEmails)) {
            setQuoteEmails(s.quoteEmails);
          }
          if (s.shop) {
            setShop((prev) => ({ ...prev, ...s.shop }));
          }
        }
      } catch (error) {
        console.error('Erreur chargement paramètres:', error);
      }
    };

    if (token) {
      loadSettings();
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: user.email?.split('@')[0] || 'Admin',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          settings: {
            profile,
            company,
            notifications,
            quoteEmails,
            shop,
          },
        }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('Erreur lors de l\'enregistrement des paramètres');
      }
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
      alert('Erreur lors de l\'enregistrement des paramètres');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'profile', icon: 'person', label: 'Profil admin' },
    { id: 'company', icon: 'business', label: 'Entreprise' },
    { id: 'notifications', icon: 'notifications', label: 'Notifications' },
    { id: 'security', icon: 'security', label: 'Sécurité' },
    { id: 'shop', icon: 'storefront', label: 'Boutique' },
  ];

  const inputClass = "w-full rounded-xl border border-gray-200 bg-[#f9fbf9] px-4 py-3 text-sm font-semibold text-[#111827] outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20";
  const labelClass = "mb-1.5 block text-xs font-bold text-gray-700";
  const cardClass = "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Paramètres</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez la configuration de votre plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 animate-fadeIn">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Modifications enregistrées
            </span>
          )}
          {saving && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-bold text-primary">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Enregistrement...
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Navigation latérale */}
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                activeSection === section.id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-gray-600 hover:bg-gray-50 border border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{section.icon}</span>
              {section.label}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-gray-100">
            <button
              onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                  logout();
                  if (navigateTo) navigateTo('home');
                }
              }}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="space-y-6">
          {/* PROFIL ADMIN */}
          {activeSection === 'profile' && (
            <>
              <div className={cardClass}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                  <AvatarUploader size="lg" name={profile.name} />
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-gray-900">Profil administrateur</h3>
                    <p className="text-sm text-gray-500">Informations personnelles de l'administrateur</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Nom complet</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Adresse email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Téléphone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+225 07 00 00 00 00"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Rôle</label>
                    <input
                      type="text"
                      value={profile.role}
                      disabled
                      className={`${inputClass} bg-gray-100 text-gray-500 cursor-not-allowed`}
                    />
                  </div>
                </div>
              </div>

              <div className={`${cardClass} bg-gradient-to-r from-primary/5 to-transparent border-primary/15`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <span className="material-symbols-outlined">info</span>
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-900">À propos de votre compte</h4>
                    <p className="text-xs text-gray-500">Votre compte a été créé avec le rôle Administrateur</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/80 border border-gray-100 p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase">Rôle</p>
                    <p className="mt-1 text-sm font-extrabold text-primary">Administrateur</p>
                  </div>
                  <div className="rounded-xl bg-white/80 border border-gray-100 p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase">Statut</p>
                    <p className="mt-1 text-sm font-extrabold text-emerald-600">Actif</p>
                  </div>
                  <div className="rounded-xl bg-white/80 border border-gray-100 p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase">Dernière connexion</p>
                    <p className="mt-1 text-sm font-extrabold text-gray-700">Aujourd'hui</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ENTREPRISE */}
          {activeSection === 'company' && (
            <div className={cardClass}>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-green-600 text-white shadow-lg">
                  <span className="material-symbols-outlined text-3xl">business</span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-extrabold text-gray-900">Informations de l'entreprise</h3>
                  <p className="text-sm text-gray-500">Ces informations apparaissent sur les devis et documents</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nom de l'entreprise</label>
                  <input
                    type="text"
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Adresse</label>
                  <input
                    type="text"
                    value={company.address}
                    onChange={(e) => setCompany({ ...company, address: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Téléphone</label>
                  <input
                    type="tel"
                    value={company.phone}
                    onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={company.email}
                    onChange={(e) => setCompany({ ...company, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Site web</label>
                  <input
                    type="text"
                    value={company.website}
                    onChange={(e) => setCompany({ ...company, website: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Logo</label>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <span className="material-symbols-outlined">image</span>
                    </div>
                    <button className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                      Changer le logo
                    </button>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={company.description}
                    onChange={(e) => setCompany({ ...company, description: e.target.value })}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className={cardClass}>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-green-600 text-white shadow-lg">
                  <span className="material-symbols-outlined text-3xl">notifications</span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-extrabold text-gray-900">Paramètres de notification</h3>
                  <p className="text-sm text-gray-500">Choisissez les notifications que vous souhaitez recevoir</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'newQuote', label: 'Nouvelles demandes de devis', desc: 'Être notifié quand un client soumet une demande de devis', icon: 'description' },
                  { key: 'newClient', label: 'Nouveaux clients', desc: 'Être notifié quand un nouveau client s\'inscrit', icon: 'person_add' },
                  { key: 'newReservation', label: 'Nouvelles réservations', desc: 'Être notifié quand un client réserve un véhicule', icon: 'directions_car' },
                  { key: 'emailAlerts', label: 'Alertes par email', desc: 'Recevoir les notifications importantes par email', icon: 'mail' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#f9fbf9] p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      </span>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                      className={`relative h-7 w-12 rounded-full transition-colors ${notifications[item.key] ? 'bg-primary' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all ${notifications[item.key] ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Emails de réception des devis */}
              <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                    <span className="material-symbols-outlined">mail</span>
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-900">Emails de réception des devis</h4>
                    <p className="text-xs text-gray-500">Les demandes de devis seront envoyées à ces adresses</p>
                  </div>
                </div>

                {/* Liste des emails */}
                <div className="space-y-2 mb-4">
                  {quoteEmails.map((email, index) => (
                    <div key={index} className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <span className="material-symbols-outlined text-base">alternate_email</span>
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{email}</span>
                      </div>
                      <button
                        onClick={() => setQuoteEmails(quoteEmails.filter((_, i) => i !== index))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title="Supprimer cet email"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Ajouter un email */}
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newQuoteEmail}
                    onChange={(e) => setNewQuoteEmail(e.target.value)}
                    placeholder="nouveau@email.com"
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    onClick={() => {
                      const email = newQuoteEmail.trim();
                      if (email && !quoteEmails.includes(email)) {
                        setQuoteEmails([...quoteEmails, email]);
                        setNewQuoteEmail('');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-[#1b4c00] px-4 py-2.5 text-sm font-bold text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SÉCURITÉ */}
          {activeSection === 'security' && (
            <>
              <div className={cardClass}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-green-600 text-white shadow-lg">
                    <span className="material-symbols-outlined text-3xl">security</span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-gray-900">Sécurité du compte</h3>
                    <p className="text-sm text-gray-500">Modifiez votre mot de passe et vos paramètres de sécurité</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Mot de passe actuel</label>
                    <input
                      type="password"
                      value={security.currentPassword}
                      onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={security.newPassword}
                      onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                      placeholder="Au moins 8 caractères"
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className={cardClass}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <span className="material-symbols-outlined">verified_user</span>
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Authentification à deux facteurs</p>
                      <p className="text-xs text-gray-500">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                    className={`relative h-7 w-12 rounded-full transition-colors ${security.twoFactor ? 'bg-primary' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all ${security.twoFactor ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* BOUTIQUE */}
          {activeSection === 'shop' && (
            <div className={cardClass}>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-green-600 text-white shadow-lg">
                  <span className="material-symbols-outlined text-3xl">storefront</span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-extrabold text-gray-900">Paramètres de la boutique</h3>
                  <p className="text-sm text-gray-500">Configurez les préférences de votre boutique en ligne</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Devise</label>
                  <select
                    value={shop.currency}
                    onChange={(e) => setShop({ ...shop, currency: e.target.value })}
                    className={inputClass}
                  >
                    <option value="FCFA">FCFA (Franc CFA)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (Dollar)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Langue</label>
                  <select
                    value={shop.language}
                    onChange={(e) => setShop({ ...shop, language: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Français">Français</option>
                    <option value="English">English</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Fuseau horaire</label>
                  <select
                    value={shop.timezone}
                    onChange={(e) => setShop({ ...shop, timezone: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Africa/Abidjan (GMT+0)">Africa/Abidjan (GMT+0)</option>
                    <option value="Africa/Dakar (GMT+0)">Africa/Dakar (GMT+0)</option>
                    <option value="Europe/Paris (GMT+1)">Europe/Paris (GMT+1)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#f9fbf9] p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                        <span className="material-symbols-outlined">construction</span>
                      </span>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Mode maintenance</p>
                        <p className="text-xs text-gray-500">Désactive temporairement l'accès à la boutique pour les clients</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShop({ ...shop, maintenanceMode: !shop.maintenanceMode })}
                      className={`relative h-7 w-12 rounded-full transition-colors ${shop.maintenanceMode ? 'bg-amber-500' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all ${shop.maintenanceMode ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Barre d'actions en bas */}
          <div className="flex items-center justify-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            {saved && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 mr-auto">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Modifications enregistrées
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-[#1b4c00] px-6 py-3 text-sm font-bold text-white shadow-md transition-colors disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">save</span>
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
