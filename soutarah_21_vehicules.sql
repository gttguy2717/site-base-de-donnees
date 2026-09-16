-- ============================================================================
--  SOUTARAH GROUP — PARC DE 21 VÉHICULES (IDENTIQUE À LA BASE EN LIGNE)
--  Généré depuis GET https://soutarahgroup.com/api/vehicles
--  Base : MySQL (Compatible avec la base en ligne soutarahgroup.com)
--
--  Import :  mysql -u root -p soutarah_db < soutarah_21_vehicules.sql
--            (ou dans phpMyAdmin / XAMPP / Hostinger)
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `vehicules` (
  `id` char(36) NOT NULL,
  `marque` varchar(100) NOT NULL,
  `modele` varchar(100) NOT NULL,
  `categorie` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `places` int(11) NOT NULL,
  `carburant` varchar(60) DEFAULT NULL,
  `transmission` varchar(60) DEFAULT NULL,
  `prix_journalier_particulier` decimal(14,2) NOT NULL,
  `prix_journalier_entreprise` decimal(14,2) NOT NULL,
  `disponibilite` tinyint(1) NOT NULL DEFAULT 1,
  `statut` enum('ACTIVE','INACTIVE','MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `prix_journalier_entreprise_client` decimal(14,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Désactiver tous les véhicules non officiels (garder l'idempotence)
UPDATE `vehicules` SET `disponibilite` = 0, `statut` = 'INACTIVE';

-- Insérer / restaurer les 21 véhicules du parc en ligne
INSERT INTO `vehicules`
(`id`,`marque`,`modele`,`categorie`,`description`,`image_url`,`places`,`carburant`,`transmission`,`prix_journalier_particulier`,`prix_journalier_entreprise`,`disponibilite`,`statut`,`cree_le`,`mis_a_jour_le`,`prix_journalier_entreprise_client`)
VALUES
('85c4c17d-53cb-5a66-856c-b69cc143cd66','Citroën','Jumper','Utilitaires','3 places assises • Automatique • Assurée','/img/vehicles/jumperav.jpeg',3,'Essence','Automatique',30000.00,30000.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('73b55808-2a18-5302-82c2-e9b2a779bb7e','Ford','Transit','Utilitaires','10 places assises • Manuel • Assurée','/img/vehicles/ford1.jpg',10,'Essence','Manuel',40000.00,40000.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('cda7245d-eb86-54e5-940c-daaf69e2eec9','Mitsubishi','L200','Pick-Up','5 personnes • Manuel • Assurée','/img/vehicles/l200av.jpg',5,'Essence','Manuel',51000.00,51000.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('e1cccd9a-3546-5764-a2f3-0f287dc84370','Mitsubishi','Pajero 13','4x4','7 personnes • Automatique • Assurée','/img/vehicles/pajeroav.jpeg',7,'Essence','Automatique',55000.00,55000.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('7b5138ed-5046-540e-b055-d6eaaf930dea','Nissan','Kicks','SUV','5 personnes • Automatique • Assurée','/img/vehicles/KickAvant.jpeg',5,'Essence','Automatique',40500.00,40500.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('0422b779-7478-5b6b-af22-71bc7ffca2cc','Nissan','Urvan','Minibus','15 places assises • Automatique • Assurée','/img/vehicles/urvan1.jpeg',15,'Essence','Automatique',70000.00,70000.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('c4fc464e-1f73-5846-bade-652611fd4351','Renault','Dokker','Utilitaires','5 personnes • Manuel • Assurée','/img/vehicles/dokker.jpg',5,'Essence','Manuel',30000.00,30000.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('a99d3a18-f1cd-5ec7-970f-99b667766608','Renault','Duster','Économiques','5 personnes • Automatique • Assurée','/img/vehicles/dusterAvant.jpg',5,'Essence','Automatique',30000.00,30000.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('cc1f6dc5-57b7-5063-9e5c-a8b9806ef88a','Renault','Kadjar','SUV','5 personnes • Automatique • Assurée','/img/vehicles/kadjaravant.jpeg',5,'Essence','Automatique',40541.00,40541.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('22a9d442-7319-578a-aed8-861a6a482f00','Renault','Koleos','SUV','5 personnes • Automatique • Assurée','/img/vehicles/koleosAv.jpeg',5,'Essence','Automatique',40500.00,40500.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('2e52274b-35b9-529f-bb75-86ca43b508cf','Renault','OROCH','Pick-Up','5 personnes • Manuel • Assurée','/img/vehicles/orochav.jpeg',5,'Essence','Manuel',30000.00,30000.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('e0ff4046-25a6-5664-9b23-a23faf7099c8','Renault','Van Express','Utilitaires','2 places assises • Manuel • Assurée','/img/vehicles/express1.jpeg',2,'Essence','Manuel',30000.00,30000.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('60178bcf-f5aa-5d08-8902-525ccfe2f408','Suzuki','Dzire','Économiques','5 personnes • Automatique • Assurée','/img/vehicles/dzer.jpg',5,'Essence','Automatique',25000.00,25000.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('6ab2b34b-7607-55ba-872a-15e9b18fabe5','Suzuki','Fronx','Économiques','5 personnes • Automatique • Assurée','/img/vehicles/fronxav.jpeg',5,'Essence','Automatique',30000.00,30000.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('7a9a314c-47ac-5f31-8d59-0968800a10a7','Suzuki','Grand Vitara 932','SUV','5 personnes • Automatique • Assurée','/img/vehicles/gvitaraAv.jpeg',5,'Essence','Automatique',40501.00,40501.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('e1b26e62-5c08-543a-b891-9574b0a3aebd','Suzuki','Vitara Rouge','SUV','5 personnes • Automatique • Assurée','/img/vehicles/vitaraAvant.jpg',5,'Essence','Automatique',35000.00,35000.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('4a31dc54-1bd0-506b-9cdf-91fa9558ee79','Toyota','Highlander','4x4','7 personnes • Automatique • Assurée','/img/vehicles/high.jpeg',7,'Essence','Automatique',55000.00,55000.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('622a3bff-0ab2-5b69-b4a0-e305471a2e13','Toyota','Land Cruiser','Luxe','7 personnes • Automatique • Assurée','/img/vehicles/l300.jpeg',7,'Essence','Automatique',190000.00,190000.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('6c86686a-0f8d-53c9-825d-8c6d145b7a17','Toyota','Rush','4x4','7 personnes • Automatique • Assurée','/img/vehicles/rushavant.jpeg',7,'Essence','Automatique',50000.00,50000.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('b9573e72-5f85-5d84-ac76-7952fc48677c','Toyota','Tacoma','Pick-Up','5 personnes • Automatique • Assurée','/img/vehicles/tacomaav.jpeg',5,'Essence','Automatique',50000.00,50000.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL),
('5f856150-79b3-5045-b0a8-827f1a11955d','Volvo','9700','Autocar','55 places assises • Manuel • Avec chauffeur','/img/vehicles/h1ec.jpg',55,'Essence','Manuel',220000.00,220000.00,1,'ACTIVE','2026-09-10 10:49:02','2026-09-10 10:49:02',NULL);
-- Les 21 véhicules de la base en ligne sont maintenant actifs.
SET FOREIGN_KEY_CHECKS = 1;
