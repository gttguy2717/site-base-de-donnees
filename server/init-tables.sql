-- Script SQL pour créer toutes les tables nécessaires
-- À exécuter dans PostgreSQL avec l'utilisateur postgres

-- Connexion à la base
\c soutarah_group;

-- Table demandes_vehicules (si elle n'existe pas)
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

-- Indexes pour demandes_vehicules
CREATE INDEX IF NOT EXISTS idx_demandes_vehicules_client ON demandes_vehicules(client_id);
CREATE INDEX IF NOT EXISTS idx_demandes_vehicules_user ON demandes_vehicules(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_demandes_vehicules_statut ON demandes_vehicules(statut);
CREATE INDEX IF NOT EXISTS idx_demandes_vehicules_cree ON demandes_vehicules(cree_le);

-- Vérifier que la table notifications existe et a les bonnes colonnes
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

-- Indexes pour notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(utilisateur_destinataire_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lu ON notifications(est_lu);
CREATE INDEX IF NOT EXISTS idx_notifications_cree ON notifications(cree_le);

-- Vérifier les foreign keys (optionnel, à adapter selon vos besoins)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_demandes_vehicules_client'
    ) THEN
        ALTER TABLE demandes_vehicules
        ADD CONSTRAINT fk_demandes_vehicules_client
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_demandes_vehicules_user'
    ) THEN
        ALTER TABLE demandes_vehicules
        ADD CONSTRAINT fk_demandes_vehicules_user
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_notifications_user'
    ) THEN
        ALTER TABLE notifications
        ADD CONSTRAINT fk_notifications_user
        FOREIGN KEY (utilisateur_destinataire_id) REFERENCES utilisateurs(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Afficher les tables créées
\dt demandes_vehicules
\dt notifications

-- Afficher le nombre d'enregistrements
SELECT 'demandes_vehicules' as table_name, COUNT(*) as count FROM demandes_vehicules
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;

COMMIT;
