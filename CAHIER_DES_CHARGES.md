# 📋 CAHIER DES CHARGES

## Conception et développement d'une plateforme web de gestion intégrée des services, de la relation client et des réservations de SOUTARAH GROUP

---

## 1. CONTEXTE DU PROJET

### 1.1. Présentation de l'entreprise

**SOUTARAH GROUP** est une société à responsabilité limitée (SARL) basée à Abidjan, en Côte d'Ivoire, au quartier Palmeraie Saint Viateur. L'entreprise exerce principalement dans trois domaines d'activité :

1. **Location de véhicules** : une flotte de plus de 30 véhicules (citadines, SUV, 4x4, pick-up, utilitaires, minibus, autocars) avec ou sans chauffeur
2. **Négoce & import-export** : fourniture de produits et équipements divers pour les entreprises et les particuliers
3. **Services divers** : réalisation de travaux, ingénierie, accompagnement de projets

| Informations | Détails |
|---|---|
| **Forme juridique** | SARL, Capital : 10 000 000 FCFA |
| **Siège** | Abidjan, Palmeraie Saint Viateur |
| **Contact** | 25 BP 1032 Abidjan 25 |
| **Téléphone** | 27 22 30 11 27 / 07 18 88 88 89 / 07 18 40 40 40 |
| **N° RCCM** | CI-ABJ-03-2022-B12-03750 |
| **N° CC** | 2242663 T |
| **Email** | infosoutarahgroup@gmail.com |
| **Site web** | https://soutarahgroup.com |

### 1.2. Constat / Problématique

Avant la réalisation de cette plateforme, SOUTARAH GROUP rencontrait plusieurs difficultés :

| Problème | Conséquences |
|---|---|
| Gestion manuelle des demandes de devis (papier, Excel, téléphone) | Perte d'informations, lenteur de traitement |
| Absence de suivi centralisé des clients | Difficulté à connaître les clients, leurs historiques |
| Réservations de véhicules sans validation automatique | Risques de double réservation sur une même période |
| Catalogue de produits statique, sans interface de gestion | Difficulté à mettre à jour les prix et stocks |
| Pas d'espace client en ligne | Le client ne peut pas suivre l'état de ses demandes |
| Absence de notifications | Le client et l'administrateur ne sont pas informés des évolutions |

### 1.3. Objectifs du projet

L'objectif principal est de concevoir et développer une **plateforme web de gestion intégrée** permettant :

- **Pour SOUTARAH GROUP** :
  - Gérer l'ensemble des demandes de devis et des commandes
  - Gérer les clients et leurs informations
  - Gérer le catalogue de produits et la flotte de véhicules
  - Suivre les réservations de véhicules avec prévention des conflits de période
  - Communiquer avec les clients via des notifications automatiques
  - Suivre les stocks et générer des rapports

- **Pour les clients** :
  - Découvrir les services et le catalogue en ligne
  - Constituer un panier (produits + locations de véhicules)
  - Demander des devis en ligne
  - Télécharger des devis au format PDF
  - Suivre l'état de leurs demandes dans un espace personnalisé
  - Recevoir des notifications automatiques

---

## 2. DESCRIPTION DU PROJET

### 2.1. Nature de la plateforme

La plateforme est une **application web full-stack** comprenant :

| Composant | Technologie |
|---|---|
| Frontend | React.js, Tailwind CSS, Vite |
| Backend | Node.js, Express |
| Base de données | MySQL + Sequelize (ORM) |
| Authentification | JWT (JSON Web Token) |
| Génération PDF | jsPDF |
| Déploiement | Domaine soutarahgroup.com et hébergement Hostinger (API Node.js + frontend) |

Hostinger prend en charge PostgreSQL avec certaines formules. Toutefois, l'abonnement souscrit par SOUTARAH GROUP pour le domaine soutarahgroup.com ne permettait pas d'utiliser PostgreSQL. Le projet a donc été adapté à MySQL, qui était disponible avec l'offre retenue. La plateforme web et l'application mobile utilisent la même base MySQL, mais l'application mobile y accède exclusivement par l'intermédiaire de l'API REST Node.js/Express.

### 2.2. Acteurs du système

| Acteur | Description | Rôle |
|---|---|---|
| **Visiteur**  | Personne non connectée | Consulte les services, le catalogue, rajoute des produits au panier (hors connexion), demande un devis générique |
| **Client** | Personne inscrite/comptée | A un espace personnel, peut réserver un véhicule et suivre ses devis, télécharger ses PDF |
| **Administrateur** | Utilisateur avec rôle ADMIN ou MANAGER | Gère l'ensemble du back-office |
| **Système** | L'application | Envoie des notifications, génère des PDF, vérifie les conflits de réservation |

### 2.3. Architecture technique

```
┌─────────────────────┐     ┌──────────────────────┐
│    FRONTEND (React) │     │   BACKEND (Express)  │
│  - Pages publiques  │────→│  - REST API           │
│  - Espace client    │     │  - Authentification   │
│  - Espace admin    │     │  - Logique métier     │
└─────────────────────┘     │  - Notifications      │
                            │  - PDF                │
                            └─────────┬────────────┘
                                      │
                            ┌─────────▼──────────┐
                            │      MySQL         │
                            │   Base de données   │
                            └────────────────────┘
```

---

## 3. DESCRIPTION FONCTIONNELLE DES MODULES

### MODULE 1 : SITE VITRINE & PRÉSENTATION DE L'ENTREPRISE

| Fonctionnalité | Description |
|---|---|
| Navigation générale | Accueil, À propos, Services, Carrières, Contact |
| Présentation des services | 6 expertises : Location de véhicules, Négoce & import-export, Réalisation de travaux, Ingénierie, Accompagnement, Autres |
| Flotte de véhicules | Liste des véhicules (marque, modèle, image, catégorie, prix, spécifications) |
| Barre d'annonces % | Annonces défilantes personnalisables depuis l'administration (texte, couleur de fond, style, durée, emoji) |
| Formulaire de devis | Demande de devis générique (nom, téléphone, email, sujet, message) |
| Footer | Coordonnées de l'entreprise, liens rapides |

### MODULE 2 : ESPACE CLIENT & AUTHENTIFICATION

| Fonctionnalité | Description |
|---|---|
| Inscription | Création de compte (particulier ou entreprise) |
| Connexion / Déconnexion | Authentification sécurisée (JWT) |
| Profil utilisateur | Modification des informations personnelles (nom, prénom, email, téléphone, adresse) |
| Profil entreprise | Nom de l'entreprise, responsable, numéro d'identification (RCCM/DFU) |
| Mot de passe | Modification sécurisée avec mot de passe minimal de 8 caractères |
| Avatar | Importation et affichage de l'avatar |
| Espace client | Tableau de bord : compte, devis, notifications |

### MODULE 3 : CATALOGUE & COMMERCE ÉLECTRONIQUE

| Fonctionnalité | Description |
|---|---|
| Catalogue de produits | Liste des articles de négoce (nom, référence, description, catégorie, unité, prix) |
| Filtres et recherche | Recherche par nom, filtre par catégorie |
| Prix personnalisé | Tarifs différents selon le profil client (particulier, entreprise, entreprise client) |
| Panier | Ajout / modification / suppression d'articles (quantité) |
| Validation du panier | Création automatique d'un devis avec description du contenu |
| Estimation des frais | Calcul HT, TVA 18%, TDT 2.5%, total TTC |

### MODULE 4 : LOCATION DE VÉHICULES / RÉSERVATIONS

| Fonctionnalité | Description |
|---|---|
| Catalogue de véhicules | Marque, modèle, catégorie, prix journaliers (selon profil client), spécifications, image 360° |
| Modal de réservation | Sélection d'une date de début/fin, destination, option chauffeur |
| Vérification de disponibilité | Avant l'ajout au panier, l'API vérifie les réservations existantes (PENDING, CONFIRMED) sur la période |
| **Anti-double-réservation** | Un véhicule déjà réservé sur une période ne peut pas être réservé par un autre client ; un message explicatif s'affiche |
| Calcul du prix | Tarif journalier × durée, options zone géographique |
| Panier des locations | Locations stockées côté client (localStorage), visible uniquement pour l'utilisateur |
| Calendrier admin | Visualisation des réservations par véhicule et par jour avec barres colorées |
| Statuts de réservation | PENDING → CONFIRMED / REJECTED, EXPIRED |

### MODULE 5 : GESTION DES DEVIS

| Fonctionnalité | Description |
|---|---|
| Création de devis | Depuis le panier, depuis la demande générique, depuis l'admin |
| Références uniques | Format DMD-2025-XXXX ou DEV-XXXX |
| Suivi du statut | En attente, En cours d'étude, Approuvé, Rejeté, Annulé, Envoyé |
| Signature électronique | L'admin téléverse le devis signé (PDF) directement depuis la section d'import |
| Envoi au client | Bouton « Envoyer au client » → statut SENT + notification automatique au client |
| Génération PDF | Devis officiel PDF avec en-tête société, TVA, convertisseur des prix en lettres |
| Téléchargement PDF | Client et admin peuvent télécharger le devis au format PDF |
| Historique côté client | Page « Mes Devis » avec statuts, fichiers signés téléchargeables |
| Suppression | Client peut supprimer un devis (avec confirmation) |

### MODULE 6 : GESTION ADMINISTRATIVE (BACK-OFFICE)

| Fonctionnalité | Description |
|---|---|
| Tableau de bord | Statistiques (clients, devis, réservations, nouvelles inscriptions) |
| Gestion clients | Liste, recherche, bloquer/débloquer un compte |
| Gestion du catalogue | CRUD produits (nom, réf, description, catégorie, tarifs, stock) |
| Gestion des véhicules | CRUD véhicules (marque, modèle, prix journalier, disponibilité) |
| Export/Import Excel | Export des produits et véhicules, import par fichier Excel |
| Gestion des devis | Filtres (en attente/envoyés), upload du devis signé, envoi au client |
| Calendrier des réservations | Vue calendrier/liste selon véhicule, changement de statuts |
| Gestion des annonces | CRUD annonces, couleur de fond (option « Aucune » supporte), durée, style, emoji |
| Notifications admin | liste des notifications (vue, non lu, marquer comme lu) |
| Paramètres | Sauvegarde des paramètres généraux |

### MODULE 7 : NOTIFICATIONS

| Fonctionnalité | Description |
|---|---|
| Type de notifications | VEHICLE_REQUEST, CART_ITEM_ADDED, CART_VALIDATED, QUOTE_REQUEST_CREATED, QUOTE_APPROVED, NEW_CLIENT, LOW_STOCK |
| Notifications client | « Votre devis envoyé », « Panier validé », « Devis signé disponible » |
| Notifications admin | « Nouveau devis », « location ajoutée au panier », « réservation », etc. |
| Popups (toasts) | Affichage automatique des 3 dernières notifications non lues avec animation et auto-disparition |
| Lecture | Marquage lu/délu, tout marquer comme lu, compteurs |
| Refresh temps réel | Mise à jour automatique toutes les 30 secondes + événement custom |

### MODULE 8 : ASSISTANT IA (optionnel)

| Fonctionnalité | Description |
|---|---|
| Chatbot intelligent | Assistant IA intégré pour répondre aux questions des clients |
| Analyse de données | Utilisation de LLM pour l'analyse de l'activité |

---

## 4. DÉROULEMENT DU PROCESSUS CLIENT (FLOW)

```
1. VISITEUR consulte le site
        │
        ├── 2. DEMANDE DE DEVIS (formulaire générique) → notification admin
        │
        ├── 2. PANIER PRODUITS (négoce) → VALIDATION → devis + PDF
        │
        └── 2. LOCATION VÉHICULE (check disponibilité) → PANIER → devis
                │
                ▼
3. CLIENT CONNECTÉ → Espace client (Mes devis, Notifications, Profil)
        │
        ▼
4. ADMIN : Téléverse le devis signé (PDF) → clique "Envoyer au client"
        │
        ▼
5. CLIENT reçoit une notification → télécharge le devis signé
```

---

## 5. CONTRAINTES ET EXIGENCES TECHNIQUES

| Exigence | Spécification |
|---|---|
| Navigation | Application full-stack React + Node.js/Express }
| Base de données | MySQL + Sequelize ORM avec migrations |
| Authentification | JWT avec token expiring |
| Sécurité | mots de passe hashé (bcrypt), routes protégées par rôle |
| Export PDF | jsPDF pour les documents devis |
| Format des prix | FCFA (XOF), format fr-FR |
| Format des dates | Format international fr-FR : jj/mm/aaaa |
| Temps réel | Actualisation des données toutes les 30 sec + événements |
| Gestion de conflits | Vérification de la double réservation de véhicules |
| Disponibilité | file_response : 1h, délais max 10 h pour les uploads |

---

## 6. CONTRAINTES NON FONCTIONNELLES

| Contrainte | Exigence |
|---|---|
| Fiabilité | Les données doivent être sauvegardées en continu |
| Sécurité | Rôle admin : accès restreint via mot de passe |
| Ergonomie | Interface intuitive, langue française |
| Performance | Chargement rapide des pages, animations fluides |
| Disponibilité | Serveur local accessible et les 24h/24 |

---

## 7. GLOSSAIRE

| Terme | Définition |
|---|---|
| **API** | Application Programming Interface (interface de programmation) |
| **Backend** | Serveur, API et Base de données |
| **Frontend** | Interface utilisateur visible côté navigateur (React) |
| **ORM** | Mapping objet-relationnel (Sequelize) |
| **JWT** | JSON Web Token pour l'authentification |
| **PDF** | Format de document portable |
| **PDEBUG** | Réservation en cours de traitement |
| **CONFIRMED** | Réservation confirmée |
| **ISCOURED** | Localisation de véhicule |
| **désengagement** | Stock / inventory (négoce) |
| **Profil client** | Type de client (PARTICULIER, gisEMENT) |

---

## 8. PLANNING PRÉVISIONNEL

| Phase | Période | Contenu |
|---|---|---|
| Analyse et éude | 2 semaines | Étudie des besoins, diagrammes UML |
| Base et base de données | 2 semaines | Création du schéma, migrations |
| Backend API | 3 semaines | Routes, contrôleurs, services |
| Frontend site | 3 semaines | Maquettes, design, intégration |
| Module client (CRM) | 2 semaines | Espace client, devis, notifications |
| Back-office admin « Back-office » | 3 semaines | Tous les modules de gestion |
| Tests et déploiement | 2 semaines | Tests, BUG FIX |
| **TOTAL** | **~17 semaines** | |

---

## 9. JEUX DE DONNÉES FOURNIS

| Type | Quantité |
|---|---|
| Véhicules | Plus de 30 (marques Renault, Suzuki, Mitsubishi, Toyota, Hyundai, etc.) |
| Produits (catalogue négoce) | Divers : bâtiment, équipements, matériel |
| Clients | Particuliers et entreprises (RCCM) |
| Réservations | Confirmées, en attente, terminées (> 30 jours) |
| Notifications | Types multiples (auto) |

---

## 10. PRÉVISION DE LA SOUTENANCE

| Thème | **Conception et développement d'une plateforme web de gestion intégrée des services, de la relation client et des réservations de SOUTARAH GROUP** |
|---|---|
| **Livrabible** | Application web full-stack, API, base de données, des démonstratiques |
