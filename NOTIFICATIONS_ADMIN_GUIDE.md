# 🔔 Guide des Notifications Admin - SOUTARAH GROUP

## ✅ Statut : OPÉRATIONNEL

Les notifications fonctionnent parfaitement ! Voici comment les utiliser.

---

## 📊 Résultats des Tests

### Test effectué le 14/08/2026 à 08:20

```
✅ Demande véhicule envoyée : Toyota Land Cruiser V8
✅ Notification admin créée : "Test Client recherche: Toyota Land Cruiser V8"
✅ Admin ID: 1b1d0c59-982a-4ffc-8bbb-9d73878fa642
✅ Total notifications non lues: 14
```

**Demandes réelles reçues :**
1. David Sorho → Toyota (08:14)
2. Jean Kouassi → Mercedes G-Class (08:19)
3. Test Client → Toyota Land Cruiser V8 (08:20)

---

## 🎯 Types de Notifications

### 1. 🚗 VEHICLE_REQUEST (Demande de véhicule)
**Quand:** Client ne trouve pas le véhicule qu'il cherche
**Contenu:**
- Nom du client
- Véhicule recherché
- Téléphone
- Email
- Description (optionnelle)

**Exemple:**
```
Titre: Nouvelle demande de véhicule
Message: Jean Kouassi recherche: Mercedes G-Class. 
         Contact: 0707070707 / jean@test.com
```

### 2. 🛒 CART_ITEM_ADDED (Ajout au panier)
**Quand:** Client ajoute un produit au panier (même sans validation)
**Contenu:**
- Nom du client
- Produit ajouté
- Quantité
- Contact

**Exemple:**
```
Titre: Article ajouté au panier
Message: Sophie Koné a ajouté "Pelle hydraulique CAT 320" (x2) 
         à son panier. Contact: 0501234567 / sophie@email.com
```

### 3. ✅ VEHICLE_REQUEST_CONFIRMATION (Confirmation client)
**Quand:** Client connecté envoie une demande
**Pour:** Le client reçoit une notification de confirmation
**Contenu:**
```
Titre: Demande de véhicule reçue
Message: Votre demande pour "Toyota Land Cruiser V8" a bien été reçue. 
         Notre équipe vous contactera sous peu.
```

---

## 🖥️ Comment voir les notifications dans l'admin

### Méthode 1: Interface Admin (À venir)
L'interface admin aura :
- 🔔 Icône cloche en haut à droite
- Badge rouge avec nombre de notifications non lues
- Dropdown avec liste des notifications
- Bouton "Tout marquer comme lu"

### Méthode 2: Via Script (Actuel)
```bash
# Voir toutes les notifications
node server/scripts/check-notifications.cjs

# Créer une demande de test
node server/scripts/test-vehicle-request.cjs

# Test complet
node server/scripts/test-notifications-complete.cjs
```

### Méthode 3: Base de données
```sql
-- Voir notifications non lues
SELECT * FROM notifications 
WHERE est_lu = FALSE 
ORDER BY cree_le DESC;

-- Compter par type
SELECT type, COUNT(*) as total 
FROM notifications 
GROUP BY type;

-- Voir dernières notifications
SELECT titre, message, cree_le 
FROM notifications 
ORDER BY cree_le DESC 
LIMIT 10;
```

---

## 🔧 Vérifications Techniques

### Serveur backend démarré ?
```bash
# Démarrer le serveur
npm run server

# Vérifier qu'il écoute sur le port 5000
# Devrait afficher: API SOUTARAH disponible sur http://localhost:5000/api
```

### Tables créées ?
```bash
# Créer les tables
node server/scripts/create-tables.cjs

# Vérifier dans psql
psql -U postgres -d soutarah_group
\dt
# Devrait lister: demandes_vehicules, notifications
```

### Admin existe ?
```bash
# Vérifier les comptes admin
node server/scripts/check-admins.cjs

# Devrait afficher:
# ✅ 1 admin(s) trouvé(s):
# 1. admin@gmail.com
```

---

## 📱 Parcours Utilisateur

### Pour le CLIENT

1. **Chercher un véhicule**
   - Va sur http://localhost:5173/services/location-vehicules
   - Utilise la barre de recherche

2. **Véhicule non trouvé**
   - Clique sur "🔍 Véhicule non trouvé ?"
   - Remplit le formulaire :
     - Nom du véhicule (requis)
     - Description (optionnel)
     - Coordonnées (si non connecté)

3. **Confirmation**
   - ✅ Message de succès affiché
   - Si connecté : reçoit une notification
   - Email de confirmation (à venir)

### Pour l'ADMIN

1. **Reçoit notification immédiate**
   - Type: VEHICLE_REQUEST ou CART_ITEM_ADDED
   - Avec toutes les informations de contact

2. **Peut contacter le client**
   - Téléphone fourni
   - Email fourni
   - Détails de la demande

3. **Peut gérer la demande**
   - Marquer comme "Contacté"
   - Marquer comme "Converti" (client a loué)
   - Marquer comme "Rejeté" (non disponible)

---

## 🚀 Fonctionnalités Futures

### Phase 1 (Urgent)
- [ ] Interface notifications dans header admin
- [ ] Dropdown avec liste des notifications
- [ ] Badge avec compteur non lues
- [ ] Son/animation lors nouvelle notification

### Phase 2 (Important)
- [ ] Page dédiée `/admin/vehicle-requests`
- [ ] Filtres par statut
- [ ] Recherche par nom/véhicule
- [ ] Export Excel des demandes

### Phase 3 (Améliorations)
- [ ] Email automatique au client
- [ ] SMS de confirmation
- [ ] Notification push navigateur
- [ ] Statistiques (taux conversion, délai réponse)

---

## 🐛 Troubleshooting

### Problème: Aucune notification n'apparaît

**Diagnostic:**
```bash
# 1. Vérifier que le serveur est démarré
npm run server

# 2. Tester l'API
node server/scripts/test-vehicle-request.cjs

# 3. Vérifier les notifications créées
node server/scripts/check-notifications.cjs
```

**Solutions:**
- Redémarrer le serveur backend
- Vérifier les logs du serveur
- Vérifier que la table `notifications` existe
- Vérifier qu'il y a un utilisateur ADMIN actif

### Problème: Serveur ne démarre pas

**Solutions:**
```bash
# Vérifier PostgreSQL est démarré
# Windows: services.msc → PostgreSQL

# Vérifier .env
cat .env
# DB_NAME=soutarah_group
# DB_USER=postgres
# DB_PASSWORD=...

# Tester connexion
node -e "require('dotenv').config(); const {sequelize} = require('./server/src/models/index.cjs'); sequelize.authenticate().then(() => console.log('✅ OK')).catch(e => console.error('❌', e));"
```

### Problème: Admin ne reçoit pas les notifications

**Vérifications:**
```sql
-- Vérifier rôle admin
SELECT id, email, role, est_actif FROM utilisateurs WHERE email = 'admin@gmail.com';

-- Devrait retourner:
-- role = 'ADMIN'
-- est_actif = true

-- Si le rôle n'est pas bon:
UPDATE utilisateurs SET role = 'ADMIN', est_actif = true WHERE email = 'admin@gmail.com';
```

---

## 📞 Contacts Support

**Email:** support@soutarah.com  
**Téléphone:** +225 XX XX XX XX XX

**Développeur:** [Votre nom]  
**Date:** 14/08/2026

---

## ✅ Checklist Finale

- [x] Tables `demandes_vehicules` créées
- [x] Table `notifications` créée
- [x] API `/api/vehicle-requests` fonctionnelle
- [x] Authentification optionnelle OK
- [x] Notifications admin VEHICLE_REQUEST OK
- [x] Notifications admin CART_ITEM_ADDED OK
- [x] Notifications client CONFIRMATION OK
- [x] Formulaire frontend OK
- [x] Tests passés avec succès
- [ ] Interface admin notifications (à développer)
- [ ] Email automatique (à développer)

---

**🎉 Le système fonctionne parfaitement !**

Les notifications sont créées en temps réel dans la base de données.
Il reste juste à créer l'interface visuelle dans l'admin pour les afficher.
