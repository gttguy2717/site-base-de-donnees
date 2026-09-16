# Guide de déploiement — RSVP SOUTARAH GROUP sur Hostinger

Application de confirmation de présence pour la **Cérémonie BNI × SOUTARAH GROUP du 24 septembre 2026**.
Ce projet est **indépendant** du site web et de l'application mobile de SOUTARAH.

## Ce que fait l'application

1. **Page publique** sur un sous-domaine (ex. `rsvp.soutarahgroup.com`) où chaque participant confirme
   sa présence avec ses informations (nom, prénom, e-mail, téléphone, organisation, fonction,
   nombre de personnes) et, s'il en a un, son **code d'invitation** (`?code=SG-XXXXXX`).
2. **Espace d'administration** (`/admin`) : nombre de confirmés, personnes attendues, liste complète
   avec toutes les informations, recherche, filtre, export CSV, import de la liste d'invités.
3. **E-mails automatiques** :
   - **Remerciement** envoyé immédiatement après chaque confirmation ;
   - **Rappels** J-14, J-7, J-3, J-1 et le jour J (modifiables dans `config.php`)
     envoyés automatiquement par la **tâche Cron** d'Hostinger.

## Arborescence

```
rsvp-soutarah/
├── index.php                  Page publique de confirmation
├── vue_public.php             Vue HTML de la page publique
├── config.php                 À PERSONNALISER (base de données, SMTP, admin…)
├── database.sql               Structure de la base (référence — création automatique sinon)
├── .htaccess                  Protection des fichiers sensibles
├── includes/                  db, helpers, SMTP, gabarits e-mails, traitement, auth admin
├── admin/                     login, tableau de bord, export CSV, import d'invités
├── cron/reminders.php         Rappels automatiques (tâche Cron Hostinger)
└── tools/maj_invitation.php   Remplace le lien du mail d'invitation (.eml) automatiquement
```

## Étape 1 — Créer le sous-domaine dans hPanel

1. Connectez-vous à **hPanel** (hpanel.hostinger.com).
2. **Domaines → Sous-domaines**.
3. Créez le sous-domaine, par exemple : `rsvp.soutarahgroup.com`.
   - Hostinger crée automatiquement un dossier du type
     `/home/uXXXXXXXX/domains/rsvp.soutarahgroup.com` (avec `public_html` à l'intérieur).
4. Notez le chemin exact du dossier : il servira pour le Cron.

> Le DNS du sous-domaine est créé automatiquement si `soutarah-group.ci` est géré chez Hostinger.
> Sinon, ajoutez chez votre registrar un enregistrement **A** `rsvp` → IP du serveur (visible dans hPanel).

## Étape 2 — Créer la base de données MySQL

1. hPanel → **Bases de données → Gestion des bases de données MySQL**.
2. Créez une base, ex. `rsvp`, et un utilisateur avec mot de passe solide.
3. Notez : nom de la base, utilisateur, mot de passe (préfixe du compte, ex. `u123456789_rsvp`).

> Aucun import SQL n'est nécessaire : les tables sont créées automatiquement au premier
> chargement du site. `database.sql` est fourni uniquement pour un import manuel via phpMyAdmin.

## Étape 3 — Créer l'adresse e-mail d'expédition

1. hPanel → **E-mails → Comptes e-mail** → créez par ex. `info@soutarahgroup.ci`.
2. Notez le mot de passe : il servira à l'envoi SMTP.

## Étape 4 — Envoyer les fichiers

1. hPanel → **Gestionnaire de fichiers** → ouvrez le `public_html` du sous-domaine.
2. Téléversez **tout le contenu** du dossier `rsvp-soutarah/`
   (index.php, config.php, includes/, admin/, cron/, tools/, .htaccess…).
3. Vérifiez que `.htaccess` (fichier caché) a bien été téléversé.

## Étape 5 — Configurer `config.php`

| Paramètre | Valeur |
|---|---|
| `BASE_URL` | `https://rsvp.soutarahgroup.com` |
| `DB_NAME` / `DB_USER` / `DB_PASS` | ceux de l'étape 2 |
| `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM` | ceux de l'étape 3 |
| `ADMIN_USER` / `ADMIN_PASSWORD` | identifiants admin — **mot de passe solide obligatoire** |
| `CRON_TOKEN` | chaîne aléatoire quelconque (sécurise le cron et les outils) |

## Étape 6 — Tester

1. Ouvrez `https://rsvp.soutarahgroup.com` → le formulaire doit s'afficher (charte verte/orange de l'invitation).
2. Faites une confirmation test avec **votre** adresse e-mail :
   - la confirmation s'enregistre, l'e-mail de remerciement arrive ;
   - `https://rsvp.soutarahgroup.com/admin` affiche la réponse dans le tableau de bord.
3. Testez le cron manuellement :
   `https://rsvp.soutarahgroup.com/cron/reminders.php?token=VOTRE_JETON`
   → doit afficher un journal (« Planning des rappels vérifié… 0 e-mail(s) traité(s) »).

## Étape 7 — Programmer la tâche Cron (rappels automatiques)

1. hPanel → **Avancé → Tâches Cron**.
2. Créez une tâche : **Toutes les 30 minutes** (ou 1 fois par jour à 8h50).
3. Commande :
   ```
   php /home/uXXXXXXXX/domains/rsvp.soutarahgroup.com/public_html/cron/reminders.php VOTRE_JETON
   ```
   (adaptez le chemin et remplacez `VOTRE_JETON` par la valeur de `CRON_TOKEN`).

Le cron enverra automatiquement : les remerciements non partis, puis chaque rappel
J-14 / J-7 / J-3 / J-1 / jour J aux personnes ayant confirmé.

## Étape 8 — Mettre à jour le lien dans le mail d'invitation

Dans `Invitation_Soutarah_BNI_24_septembre_2026_Outlook_FINAL.eml`, le bouton
« JE CONFIRME MA PRÉSENCE » pointe vers `https://VOTRE-LIEN-INSCRIPTION`.

**Option A — lien général (un seul mail pour tous)** :
```
php tools/maj_invitation.php "Invitation_Soutarah_BNI_....eml" "https://rsvp.soutarahgroup.com" "Invitation_FINALE.eml"
```
(le script peut aussi être appelé via le navigateur avec `?token=VOTRE_JETON&fichier=...&lien=...&sortie=...`)

**Option B — lien personnalisé par invité (codes uniques)** :
1. `https://rsvp.soutarahgroup.com/admin` → **Importer des invités** → collez votre liste
   (`Nom;Prénom;Email;Téléphone;Organisation;Fonction`).
2. L'application génère pour chacun un code unique et un lien `?code=SG-XXXXXX`.
3. Générez une version du mail par invité avec le même outil (boucle sur les liens), ou
   envoyez le mail général : la page permet aussi de saisir le code à la main.

> Après exécution, ouvrez le `.eml` généré dans Outlook : le contenu est inchangé,
> seul le lien du bouton (et celui du texte brut) a été remplacé.

## Fonctionnement des rappels

- Chaque personne **confirmée** reçoit le **remerciement** immédiatement, puis les rappels
  programmés dont la date d'envoi est **postérieure à sa confirmation** (celui qui confirme
  à J-5 recevra J-3, J-1 et jour J, mais pas J-14 ni J-7).
- Une seule confirmation par adresse e-mail : si la personne revient modifier sa réponse, la base est mise à jour.
- Les échecs SMTP sont journalisés (table `mails`) et retentés automatiquement au passage suivant du cron.
- Les personnes qui déclinent (« NON ») ne reçoivent aucun e-mail automatique.

## Sécurité

- Mot de passe admin : **changez `ADMIN_PASSWORD`** avant la mise en ligne.
- `config.php` et `database.sql` sont bloqués par `.htaccess` ; `/admin` est protégé par session.
- Le formulaire est protégé par un jeton CSRF et un champ anti-spam invisible.
- Le cron et l'outil d'invitation exigent le `CRON_TOKEN`.

## Rappel des informations de la cérémonie

- **Date :** jeudi 24 septembre 2026
- **Lieu :** Hôtel des Armées — Salle Tené Birahima, Camp Galliéni, Plateau — Abidjan
- **Contact :** infosoutarahgroup@gmail.com • info@soutarahgroup.ci

