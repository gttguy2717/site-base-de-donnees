# PLAN D'AMÉLIORATION DU SITE SOUTARAH GROUP
### Inspiré des modèles **Rent A Car France** (rentacar.fr) et **Loxea / groupe CFAO** (loxea.com)
*Document de travail — à présenter avant toute implémentation.*

---

## 1. Contexte & objectif

Le site actuel de **SOUTARAH GROUP** est un site multi-activités (Énergies renouvelables, Location de véhicules, Services techniques, Immobilier, Agropastorale…) avec une base technique solide (React + Vite, backend Express/Sequelize, réservations, devis, espace client, admin).

Votre responsable souhaite que la partie **mobilité / location de véhicules** soit modélée sur deux références du marché :
- **Rent a Car France** → excellence du **parcours de location & du check-in en ligne** côté client.
- **Loxea (groupe CFAO)** → excellence de la **vitrine mobilité B2B** (flottes d'entreprise, services connectés, longue durée).

Le plan ci-dessous part de l'existant pour proposer une **évolution ciblée** (pas une refonte totale), avec des **recommandations par section** et une **priorisation**.

---

## 2. Comparatif des trois sites

| Critère | Rent a Car (France) | Loxea (groupe CFAO) | Soutarah Group (actuel) |
|---|---|---|---|
| Positionnement | Location de voitures **particuliers**, réseau d'agences | Mobilité **B2B panafricain** (entreprises, flottes) | **Multi-activités** (énergie, véh., technique, immo…) ; la location véh. est UNE branche |
| Modèle commercial | Location courte/journée, agences en ville | Longue durée (Lease) + LLD + flottes + VTC | Courte/longue durée, avec/sans chauffeur, flotte réelle |
| Catalogue | Grille de catégories métier (citadine, confort, prestige…) | Offres par service (Rent / Lease / Connect / Chauffeur) | Flotte réelle (Duster, Koleos, Pajero, Land Cruiser…) + tarifs par zones |
| Check-in en ligne | **OUI** — page "Gérer ma location" (n° réservation + identifiant, upload docs) | Non exposé publiquement | Partiel (réservation + espace client) — **à développer** |
| Engagement client | "Paiement sécurisé / annulation gratuite / +proche - cher" | 23 pays, réseau de filiales, engagement | Focus Côte d'Ivoire (Abidjan) |
| Services connectés | Non | **Connect** (géoloc, écoconduite, fleet analytics, autopartage) | Non encore |

**Lecture :** Soutarah n'a pas à copier l'un ou l'autre *en bloc*, mais doit **puiser dans Rent a Car son excellence du parcours de réservation/check-in** et **dans Loxea son cadre "mobilité" clair et structuré** (Rent/Lease/Connect/Chauffeur).

---

## 3. Recommandations top-niveau

1. **Donner de la visibilité à la branche "Mobilité / Location"** devenue trop diluée dans le menu multi-activités (Loxea fait exactement cela : une page dédiée, structurée).
2. **Créer un parcours client complet "Réserver + Check-in"** inspiré de rentacar : rechercher → réserver → uploader ses documents → suivre sa location.
3. **Valoriser l'offre mobilité SOUTARAH** (Rent = courte durée, Lease = longue durée/entreprise, Chauffeur, Connect = suivi de flotte) sur le modèle Loxea.
4. **Garder l'identité SOUTARAH** (couleurs vert #1b4d2e / #143e22 actuelles) — ne pas copier la charte, juste la structure et les parcours.

---

## 4. Recommandations par section du site existant

### 4.1 Navigation (Navbar.jsx)
- **Aujourd'hui** : les "Services" regroupent toutes les branches via un sous-menu.
- **Adapté** : création d'un item de haut niveau **"Mobilité / Location"** avec détail (Véhicules, tarifs, réservation, check-in, flotte entreprise) à la façon de Rent A Car. Les autres services restent dans le sous-menu "Services".

### 4.2 Accueil / Hero (HomePage.jsx)
- **Aujourd'hui** : slideshow multi-branches (dont "location de véhicules").
- **Adapté** : réutiliser la slide véhicules mais ajouter un **bouton "Réserver un véhicule"** direct (pas seulement "Voir le service"), comme le CTA "Demander un Devis".

### 4.3 La page "Location de véhicules" (service `vehicules`)
- **Aujourd'hui** : service standard avec le catalogue RENTAL_VEHICLES, tarifs par zones, specs.
- **Adapté (gros morceau)** : reprendre la **grille de catégories** Rent A Car (Citadine, SUV, 4x4, Utilitaires, Prestige, Avec chauffeur) et rendre la **réservation en 3 étapes** (choix véhicule → date/lieu/options → paiement). Ajouter des **badges rassurants** : "Assurée", "Annulation gratuite", "Paiement sécurisé", "Disponible 7j/7" (modèle Rent A Car).

### 4.4 Check-in en ligne (Nouveau, modèle Rent A Car)
- **Créer une page « Gérer ma location »** : l'utilisateur saisit **n° de réservation + identifiant**, retrouve sa location, et peut **envoyer ses documents** (permis, pièce d'identité, attestation).
- **Backend existant** : les réservations existent déjà (routes réservation, client dashboard). Il suffit d'ajouter **l'upload de documents** côté réservation (statut "en attente d'approbation").
- C'est le point **que votre boss verra le plus directement** : exactement la page `rentacar.fr/check-in`.

### 4.5 Page "Mobilité / entreprises" (par modèle Loxea)
- **Créer une page "Location & Mobilité"** structurée comme Loxea :
  - **Rent** — courte/moyenne durée (avec/sans chauffeur)
  - **Lease / Longue durée** — financement, entretien, assurance, assistance, véhicule de remplacement
  - **Chauffeur** — chauffeurs privés, VTC
  - **Connect (à venir)** — géolocalisation, suivi flotte, rapports
### 4.6 Espace client / compte (ClientDashboardPage.jsx)
- **Aujourd'hui** : onglets compte existants.
- **Adapté** : ajouter l'onglet **"Mes réservations"** + **"Mes documents envoyés au check-in"** avec suivi d'états : "En attente / Confirmée / En cours / Terminée", avec récapitulatif (comme Rent A Car).

### 4.7 Devis (DevisModal / QuoteRequest)
- Rendre le devis compatible véhicules (choix catégorie, durée, zone) et anticiper la demande de documents — proche du "check-in" intégré.

### 4.8 Pages institutionnelles (AboutPage, ContactPage, CareersPage)
- Tirer de Loxea : bloc **"Qui sommes-nous / Le réseau"** (réseau à l'échelle, filiales Côte d'Ivoire), **recrutement** (existants) et **newsletter**. Rien de bloquant.

---

## 5. Éléments "réassurance" à ajouter (modèle Rent A Car)
- **Paiement 100 % sécurisé**
- **Annulation gratuite** (selon conditions)
- **Assurance incluse** sur chaque véhicule (déjà "Assurée" dans les données)
- **Support 24h/24 – 7j/7** en Côte d'Ivoire

---

## 6. Tableau de priorité & plan de mise en œuvre

| Priorité | Quoi | Inspiration | Fichiers concernés |
|---|---|---|---|
| **P1** | Page « Gérer ma réservation / Check-in » (upload docs) | rentacar.fr/check-in | nouvelle page + modèle de réservation |
| **P1** | Page « Location & Mobilité » structurée (Rent/Lease/Chauffeur) | loxea.com | nouvelle page (ou service `vehicules` enrichi) |
| **P2** | Parcours de réservation 3 étapes + badges réassurance | rentacar.fr | CarReservationModal, servicesData |
| **P2** | Onglet "Mes réservations + documents" dans l'espace client | rentacar | ClientDashboardPage |
| **P3** | Item de navigation "Véhicules" | les 2 | Navbar |
| **P3** | Pages institutionnelles / réseau / newsletter | loxea | AboutPage, Footer |

---

## 7. Ce qui existe déjà et sera réutilisé
- Catalogue réel `RENTAL_VEHICLES` avec **tarifs par zones** (Abidjan, 240/405/800 km) → précieux, Rent A Car n'a pas cela.
- Backend réservation, clients, devis, notifications, panier véhicules.
- Espace client + Espace admin.

---

## 8. Prochaine étape
Dès validation de ce plan par votre boss, je peux commencer par :
1. créer la **page « Gérer ma réservation / Check-in »** (parcours type rentacar),
2. créer la **page « Location & Mobilité »** (parcours type loxea),
3. brancher l'espace client dessus.

*(Ce document peut servir de base de présentation à votre boss.)*
