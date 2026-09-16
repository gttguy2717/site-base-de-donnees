# Guide : Demandes de Véhicules et Notifications Admin

## 🎯 Problème
Les demandes de véhicules et les notifications admin ne passent pas.

## ✅ Solution en 3 étapes

### Étape 1 : Créer les tables dans PostgreSQL

**Option A - Via script Node.js (RECOMMANDÉ) :**
```bash
cd server
node scripts/create-tables.cjs
```

**Option B - Via SQL direct :**
```bash
# Dans psql
psql -U postgres -d soutarah_group -f server/init-tables.sql
```

**Option C - Manuellement dans pgAdmin :**
Ouvrez pgAdmin, connectez-vous à la base `soutarah_group` et exécutez :

```sql
-- Table demandes de véhicules
CREATE TABLE IF NOT EXISTS demandes_vehicules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID,
    utilisateur_id UUID,
    nom_vehicule VARCHAR(180) NOT NULL,
    description TEXT,
    nom VARCHAR(180) NOT NULL,
    telephone VARCHAR(32) NOT NULL,
    email VARCHAR(254) NOT NULL,
    statut VARCHAR(20) DEFAULT 'PENDING' CHECK (statut IN ('PENDING', 'CONTACTED', 'CONVERTED', 'REJECTED')),
    reponse_admin TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mis_a_jour_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_demandes_vehicules_client ON demandes_vehicules(client_id);
CREATE INDEX idx_demandes_vehicules_user ON demandes_vehicules(utilisateur_id);
CREATE INDEX idx_demandes_vehicules_statut ON demandes_vehicules(statut);

-- Table notifications (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_destinataire_id UUID,
    type VARCHAR(80) NOT NULL,
    titre VARCHAR(180) NOT NULL,
    message TEXT NOT NULL,
    lien VARCHAR(255),
    est_lu BOOLEAN DEFAULT FALSE,
    lu_le TIMESTAMP,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mis_a_jour_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(utilisateur_destinataire_id);
CREATE INDEX idx_notifications_lu ON notifications(est_lu);
```

### Étape 2 : Vérifier que les tables existent

```bash
# Dans psql
\c soutarah_group
\dt

# Devrait afficher:
# - demandes_vehicules
# - notifications
# - ... (autres tables)
```

### Étape 3 : Redémarrer le serveur

```bash
cd server
npm run dev
```

## 🧪 Tester la fonctionnalité

### Test 1 : Via script de test
```bash
cd server
node scripts/test-vehicle-request.cjs
```

### Test 2 : Via l'interface web
1. Aller sur http://localhost:5173
2. Naviguer vers "Location de véhicules"
3. Cliquer sur "Véhicule non trouvé ?"
4. Remplir le formulaire
5. Envoyer

### Test 3 : Vérifier les notifications
1. Se connecter en tant qu'admin (admin@gmail.com / admin123456)
2. Cliquer sur l'icône notifications en haut à droite
3. Vérifier qu'une notification apparaît

## 📊 Vérifier les données dans la base

```sql
-- Voir les demandes de véhicules
SELECT * FROM demandes_vehicules ORDER BY cree_le DESC LIMIT 10;

-- Voir les notifications admin
SELECT * FROM notifications ORDER BY cree_le DESC LIMIT 10;

-- Compter les notifications non lues
SELECT COUNT(*) FROM notifications WHERE est_lu = FALSE;
```

## 🔧 Troubleshooting

### Erreur : "relation demandes_vehicules does not exist"
➡️ La table n'est pas créée. Exécutez l'Étape 1.

### Erreur : "column 'lien' does not exist in notifications"
➡️ Colonne manquante. Ajoutez-la :
```sql
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS lien VARCHAR(255);
```

### Les notifications n'apparaissent pas
1. Vérifiez qu'il y a des utilisateurs admin :
```sql
SELECT id, email, role FROM utilisateurs WHERE role IN ('ADMIN', 'MANAGER');
```

2. Vérifiez les logs du serveur backend
3. Vérifiez dans la table notifications :
```sql
SELECT * FROM notifications WHERE type = 'VEHICLE_REQUEST' ORDER BY cree_le DESC;
```

### Le formulaire ne s'envoie pas
1. Ouvrez la console du navigateur (F12)
2. Vérifiez s'il y a des erreurs JavaScript
3. Vérifiez que l'API backend répond :
```bash
curl -X POST http://localhost:5000/api/vehicle-requests \
  -H "Content-Type: application/json" \
  -d '{"nom_vehicule":"Test","nom":"Test User","telephone":"0700000000","email":"test@test.com"}'
```

## 📝 Types de notifications

Le système envoie 2 types de notifications aux admins :

1. **CART_ITEM_ADDED** : Quand un client ajoute un article au panier
   - Contient : nom client, produit, quantité, contact

2. **VEHICLE_REQUEST** : Quand un client demande un véhicule non trouvé
   - Contient : nom client, véhicule recherché, contact

## ✅ Checklist finale

- [ ] Tables `demandes_vehicules` et `notifications` créées
- [ ] Serveur backend redémarré
- [ ] Test formulaire fonctionne
- [ ] Notifications apparaissent dans l'admin
- [ ] Les données sont bien enregistrées dans la base

Si tout est coché, le système fonctionne correctement ! 🎉
