# SOUTARAH — App mobile alignée sur le site + Base MySQL des 21 véhicules

## 1. Base de données : les 21 véhicules du parc en ligne (MySQL)

La base doit désormais contenir **exactement les 21 véhicules actifs de la base en ligne**
(soutarahgroup.com) et fonctionner en **MySQL** (le `.env` local pointe déjà vers
`localhost:3306`, base `soutarah_group`).
> 🆕 **Mise à niveau SDK Expo 57** (mise à jour du 10/09/2026) :
> - `expo@^57.0.0` (57.0.21 installé), `react-native@0.86.3`, `react@19.2.3`
> - Tous les modules natifs alignés (datetimepicker 9.1.0, safe-area-context ~5.7.0,
>   screens ~4.26.0, expo-file-system ~57.0.6, expo-print ~57.0.1, etc.)
> - Compatible **Expo Go SDK 57** sur téléphone.
> - `expo-doctor` : **21/21 checks OK**. `tsc --noEmit` : OK. Bundle Android Metro : OK (1152 modules).
> - Note : le champ `splash` de `app.json` a été retiré (schéma SDK 57).

Liste officielle (tri alphabétique par marque / modèle, prix en FCFA/jour) :

| Marque | Modèle | Catégorie | Prix/j |
|---|---|---|---|
| Citroën | Jumper | Utilitaires | 30 000 |
| Ford | Transit | Utilitaires | 40 000 |
| Mitsubishi | L200 | Pick-Up | 51 000 |
| Mitsubishi | Pajero 13 | 4x4 | 55 000 |
| Nissan | Kicks | SUV | 40 500 |
| Nissan | Urvan | Minibus | 70 000 |
| Renault | Dokker | Utilitaires | 30 000 |
| Renault | Duster | Économiques | 30 000 |
| Renault | Kadjar | SUV | 40 541 |
| Renault | Koleos | SUV | 40 500 |
| Renault | OROCH | Pick-Up | 30 000 |
| Renault | Van Express | Utilitaires | 30 000 |
| Suzuki | Dzire | Économiques | 25 000 |
| Suzuki | Fronx | Économiques | 30 000 |
| Suzuki | Grand Vitara 932 | SUV | 40 501 |
| Suzuki | Vitara Rouge | SUV | 35 000 |
| Toyota | Highlander | 4x4 | 55 000 |
| Toyota | Land Cruiser | Luxe | 190 000 |
| Toyota | Rush | 4x4 | 50 000 |
| Toyota | Tacoma | Pick-Up | 50 000 |
| Volvo | 9700 | Autocar | 220 000 |

### Import de la base (2 options)

**Option A — script SQL prêt à l'emploi (recommandé)**
```sql
-- phpMyAdmin / XAMPP / ligne de commande
mysql -u root -p soutarah_group < soutarah_21_vehicules.sql
```
Le fichier `soutarah_21_vehicules.sql` crée la table `vehicules` (si absente),
désactive tous les véhicules non officiels puis insère/active les 21 du parc en ligne.

**Option B — seed Sequelize (à partir du serveur)**
```bash
node server/scripts/seed-vehicles.cjs
```
Ce script met à jour ou crée les 21 véhicules et désactive les autres (idempotent).

> ⚠️ Le fichier `.env.example` est passé en MySQL : `DB_PORT=3306`, `DB_HOST=localhost`.
> Ne plus utiliser PostgreSQL pour ce projet.

---

## 2. Côté serveur (déjà en place, utilisé tel quel)

- `GET /api/vehicles` → catalogue public (liste filtrée `ACTIVE` + `disponibilite`).
- `POST /api/quote-requests` → crée la demande de devis + **snapshot** des articles
  du panier + notifications admin + email.
- `POST /api/quote-requests/confirm` → **confirme la commande** : statut devis `SENT`,
  notification client + admin, réservation auto si location de véhicule.
- `PUT /api/admin/quotes/:id/read` → marque un devis **lu** par l'admin (colonne `lu_le`).
- `DELETE /api/quote-requests/:id` → le client supprime son devis.

Il n'y a **plus de processus d'approbation** côté admin : l'admin marque simplement
les devis entrants comme **lu / non lu**, comme sur le site.

---

## 3. App mobile (`soutarah-mobile/`) — mêmes procédures que le site

### Flux « Panier → Devis → Passer commande » (identique au site)
1. **Panier** (`CartScreen.tsx`) : l'utilisateur valide son panier.
   - `POST /api/quote-requests` avec `service`, `titre`, coordonnées et **snapshot** des
     articles (identique au site).
   - TOTAUX calculés avec `src/lib/quoteTotals.ts` (TVA 18 %, TDT 2,5 % **sur les
     véhicules uniquement**, TTC = HT + TVA + TDT) — mêmes règles que le site.
   - Le PDF du devis est généré (`pdfService.ts`).
   - **Le panier n'est PAS vidé** à ce stade (comme le site) : les articles restent
     tant que la commande n'est pas confirmée.
   - La commande est enregistrée localement (`@soutarah_last_order`) puis l'app
     redirige vers l'écran **Passer commande**.

2. **Passer commande** (`PasserCommandeScreen.tsx`, nouvelle route `PasserCommande`) :
   - Récapitulatif HT / TVA / TDT / TTC.
   - Choix du mode de paiement : Carte, Orange Money, MTN, Moov/Wave, Espèces.
   - Paiement en ligne via `POST /api/payments/geniuspay/initialize` (Genius Pay)
     puis ouverture de l'URL de paiement.
   - `POST /api/quote-requests/confirm` avec la référence + mode de paiement
     (validation de la commande côté back-office).
   - **Panier vidé uniquement si le paiement est réellement confirmé**
     (espèces validées OU redirection réelle vers Genius Pay) — même logique que le site.

### Dev vis « Mes devis » (`MyReservationsScreen.tsx`)
- Liste fusionnée des devis (`/api/quote-requests/my`) + réservations (`/api/reservations/mine`).
- PDF téléchargeable, détails, et **suppression** via `DELETE /api/quote-requests/:id`.

### Administration (`AdminDashboardScreen.tsx`)
- Section **Devis** : filtres **Tous / Non lus / Lus** (basés sur `lu_le`).
- Badge « Non lu » sur chaque devis non lu.
- Bouton **« Marquer comme lu »** / état **« Déjà lu »** (`PUT /api/admin/quotes/:id/read`).
- Badge du menu latéral « Devis » = nombre de devis **non lus**.
- Plus de boutons d'approbation : le statut est simplement affiché (Envoyé / En attente).

---

## 4. Vérifications

```bash
# App mobile (TypeScript)
cd soutarah-mobile
npx tsc --noEmit          # doit sortir EXIT=0

# Serveur (syntaxe des scripts)
node --check server/scripts/seed-vehicles.cjs
```