# SOUTARAH GROUP — Plateforme digitale de gestion des services

Plateforme web et application mobile de l'entreprise **SOUTARAH GROUP**
(Côte d'Ivoire) : vitrine des pôles d'activité, catalogue produits de négoce,
location de véhicules avec réservation, espace client, espace d'administration
et génération de devis PDF.

- **Site en production :** https://soutarahgroup.com
- **Application mobile :** Android / iOS (React Native + Expo)

---

## 1. Architecture

| Couche | Technologie | Emplacement |
|---|---|---|
| Interface web | React 19 + Vite + Tailwind CSS | `src/` |
| API REST | Node.js + Express | `server/src/` |
| Base de données | MySQL + Sequelize (ORM) | `server/src/database/migrations/` |
| Application mobile | React Native + Expo (TypeScript) | `soutarah-mobile/` |
| Catalogue véhicules | JSON partagé site / API | `shared/flotte-officielle.json` |

### Organisation des sources

```
src/                        Site web : composants, pages, données, bibliothèques
public/                     Ressources statiques et photographies
server/src/
  config/                   Chargement des variables d'environnement
  controllers/              Contrôleurs API (catalogue, panier, devis, admin…)
  services/                 Logique métier (tarifs, PDF, flotte de véhicules)
  models/                   Définition Sequelize des tables
  database/migrations/      Scripts de création des tables
  routes/                   Routage Express
  scripts/                  Scripts de maintenance et de seed
shared/                     Données partagées entre le site et l'API
soutarah-mobile/src/
  screens/                  Écrans (catalogue, fiche véhicule, panier, commandes)
  contexts/                 État global (authentification, panier)
  api/                      Client HTTP
```

---

## 2. Démarrage en local

### Prérequis
- Node.js 24+
- MySQL 8 en service

### Installation

```bash
npm install
```

Copier le fichier d'exemple puis le renseigner (il n'est **jamais** versionné) :

```bash
cp .env.example .env
```

Variables attendues :

```
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_NAME=soutarah_bd
DB_USER=...
DB_PASSWORD=...
JWT_SECRET=...
```

### Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Site web en développement (port 5173) |
| `npm run server:start` | API Express (port 5000) |
| `npm run build` | Build de production du site dans `dist/` |
| `npm run lint` | Analyse statique (oxlint) |
| `npm run db:migrate` | Création et mise à jour des tables |
| `npm run db:verify` | Contrôle du schéma |
| `npm run db:seed:catalog` | Jeu de données du catalogue |

---

## 3. Catalogue de véhicules

Le catalogue public est piloté par **`shared/flotte-officielle.json`**, source
de vérité unique consommée à la fois par le site et par l'API.

| Clé | Rôle |
|---|---|
| `vehicules` | Liste blanche des modèles proposés à la location |
| `variantesPrefixe` | Finitions autorisées (ex. « Grand Vitara » couvre « Grand Vitara 932 ») |
| `variantesExclues` | Modèles malgré tout exclus (ex. « Mazda CX-30 » ≠ « Mazda CX-3 ») |
| `equivalents` | Alias de nommage (ex. « Range Rover » = « Land Rover Range Rover ») |
| `placesToujoursGardes` | Capacités conservées même hors liste (autocars 25 et 32 places) |

### Conséquences dans le code

- `server/src/services/flotte-officielle.service.cjs` porte les règles de correspondance.
- L'API `/api/vehicles` ne renvoie **que** les véhicules de la flotte officielle.
- Le panier refuse tout véhicule hors catalogue ; le client reçoit le message :
  « Ce véhicule n'est pas disponible à la location pour le moment. Vous pouvez
  tout choisir un autre véhicule ou nous contacter ? »
- Le même message s'affiche sur le site et dans l'application mobile.

### Aligner la base de données

```bash
# Rapport uniquement, aucune écriture
node server/scripts/clean-vehicle-catalog.cjs

# Purge effective (suppression des véhicules hors flotte)
node server/scripts/clean-vehicle-catalog.cjs --restore
```

Le script supprime réellement les fiches hors flotte. Un véhicule portant une
réservation est seulement neutralisé : il disparaît du site et de
l'application, mais l'historique commercial est préservé.

---

## 4. Sécurité

- **Aucun secret n'est versionné** : mots de passe SSH et base de données sont
  lus depuis `.env` ou les variables d'environnement. Seul `.env.example` est
  conservé dans le dépôt.
- Les routes `/api/admin/*` exigent le rôle `ADMIN` ou `MANAGER`.
- Les routes de panier et de devis exigent une authentification.
- Si un secret est poussé par erreur, **il faut le faire tourner** : l'historique
  Git conserve l'ancienne valeur.

---

## 5. Conventions

- Commentaires et messages d'interface en français.
- Tables et colonnes en `snake_case`, avec un nom de table explicite
  (`vehicules`, `clients`, `demandes_devis`…).
- Prix stockés en FCFA.
- Toute évolution du catalogue de véhicules passe par
  `shared/flotte-officielle.json`.

---

## 6. Licence

Projet réalisé dans le cadre d'un stage de fin d'études chez SOUTARAH GROUP.
Voir `soutarah-mobile/LICENSE` pour les dépendances tierces.