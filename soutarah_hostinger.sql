-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: soutarah_group
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `articles_devis`
--

DROP TABLE IF EXISTS `articles_devis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `articles_devis` (
  `id` char(36) NOT NULL,
  `devis_id` char(36) NOT NULL,
  `produit_id` char(36) DEFAULT NULL,
  `libelle` varchar(255) NOT NULL,
  `quantite` decimal(14,3) NOT NULL,
  `prix_unitaire` decimal(14,2) NOT NULL,
  `prix_total` decimal(14,2) NOT NULL,
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `devis_id` (`devis_id`),
  KEY `produit_id` (`produit_id`),
  CONSTRAINT `articles_devis_ibfk_1` FOREIGN KEY (`devis_id`) REFERENCES `devis` (`id`) ON DELETE CASCADE,
  CONSTRAINT `articles_devis_ibfk_2` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles_devis`
--

LOCK TABLES `articles_devis` WRITE;
/*!40000 ALTER TABLE `articles_devis` DISABLE KEYS */;
/*!40000 ALTER TABLE `articles_devis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articles_panier`
--

DROP TABLE IF EXISTS `articles_panier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `articles_panier` (
  `id` char(36) NOT NULL,
  `panier_id` char(36) NOT NULL,
  `produit_id` char(36) DEFAULT NULL,
  `vehicule_id` char(36) DEFAULT NULL,
  `quantite` decimal(14,3) NOT NULL DEFAULT 1.000,
  `prix_unitaire` decimal(14,2) NOT NULL,
  `commence_le` datetime DEFAULT NULL,
  `termine_le` datetime DEFAULT NULL,
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `panier_id` (`panier_id`),
  KEY `produit_id` (`produit_id`),
  KEY `vehicule_id` (`vehicule_id`),
  CONSTRAINT `articles_panier_ibfk_1` FOREIGN KEY (`panier_id`) REFERENCES `paniers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `articles_panier_ibfk_2` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`),
  CONSTRAINT `articles_panier_ibfk_3` FOREIGN KEY (`vehicule_id`) REFERENCES `vehicules` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles_panier`
--

LOCK TABLES `articles_panier` WRITE;
/*!40000 ALTER TABLE `articles_panier` DISABLE KEYS */;
/*!40000 ALTER TABLE `articles_panier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` char(36) NOT NULL,
  `nom` varchar(150) NOT NULL,
  `slug` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `parent_id` char(36) DEFAULT NULL,
  `est_actif` tinyint(1) NOT NULL DEFAULT 1,
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('069c5baf-3e8b-4f6a-a8f5-c391bc83fd2d','Peinture & Finition','peinture-finition','Peintures, enduits et accessoires.',NULL,0,'2026-08-17 09:36:05','2026-08-17 09:36:05'),('0a493024-eee9-4166-9d39-35e40f502b4d','Cables & Electricite','cables-electricite','Cables H200, fils electriques, disjoncteurs et accessoires.',NULL,0,'2026-08-17 09:36:04','2026-08-17 09:36:04'),('17f862e5-490d-457c-aed1-c48ed64a692d','Mat├®riaux','materiaux','Mat├®riaux et fournitures de chantier.',NULL,1,'2026-08-24 10:11:32','2026-08-24 10:11:32'),('55c7dd48-b498-49e2-8735-82885876ff36','Materiaux de Construction','materiaux-construction','Ciment, fer, sable, gravier et materiaux.',NULL,0,'2026-08-17 09:36:05','2026-08-17 09:36:05'),('880bf117-0824-465f-8600-11a7cfb128e8','Plomberie','plomberie','Tuyaux, raccords et accessoires.',NULL,1,'2026-08-24 10:11:32','2026-08-24 10:11:32'),('b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33','Quincaillerie','quincaillerie','Vis, boulons, clous, charnieres, serrures et accessoires.',NULL,0,'2026-08-17 09:36:03','2026-08-17 09:36:03'),('fb9a9898-0e06-4a0f-950e-e13bca63020d','Groupes Electrogenes','groupes-electrogenes','Groupes electrogenes essence et diesel.',NULL,0,'2026-08-17 09:36:04','2026-08-17 09:36:04');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clients` (
  `id` char(36) NOT NULL,
  `utilisateur_id` char(36) NOT NULL,
  `type_client` enum('PARTICULIER','ENTREPRISE','PARTENAIRE','GROSSISTE','ENTREPRISE_CLIENT') NOT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `adresse` text DEFAULT NULL,
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `delai_blocage_jours` int(11) DEFAULT NULL,
  `bloque_le` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `utilisateur_id` (`utilisateur_id`),
  CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES ('2c91e316-d2dc-4202-abf0-76e01df601d4','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','PARTICULIER','Client','Soutarah','Abidjan, C├┤te dÔÇÖIvoire','2026-08-13 08:40:10','2026-08-13 08:40:10',NULL,NULL),('5edd63d4-6c15-4201-b804-553c9e46f7fe','44772e8b-0513-4046-b94a-dd60d14b7c89','ENTREPRISE_CLIENT',NULL,NULL,'Abidjan','2026-08-24 10:36:45','2026-08-24 10:36:45',NULL,NULL),('d2665b89-b286-4947-bb1a-3f08310b7a36','c7cd9b37-f317-45cd-bbd6-f5384fc43fcb','PARTICULIER','David','Sorho','Abidjan, C├┤te d\'Ivoire','2026-08-24 10:36:45','2026-08-24 10:36:45',NULL,NULL),('dd0500a1-9644-4a1e-ba0d-24e672c40457','33582ee1-d5fd-438e-88fa-8326a27078a3','PARTICULIER','Client','Soutarah','Abidjan, C├┤te dÔÇÖIvoire','2026-08-24 10:11:21','2026-08-24 10:11:21',NULL,NULL),('fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','PARTICULIER','David','Sorho','cocody, snk','2026-08-13 13:45:39','2026-08-13 13:45:39',NULL,NULL);
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `demandes_devis`
--

DROP TABLE IF EXISTS `demandes_devis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `demandes_devis` (
  `id` char(36) NOT NULL,
  `reference` varchar(40) NOT NULL,
  `client_id` char(36) DEFAULT NULL,
  `utilisateur_id` char(36) DEFAULT NULL,
  `source` enum('GUEST','CLIENT') NOT NULL DEFAULT 'GUEST',
  `service` varchar(80) NOT NULL,
  `titre` varchar(180) NOT NULL,
  `budget` varchar(80) DEFAULT NULL,
  `delai` varchar(80) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `entreprise` varchar(180) DEFAULT NULL,
  `nom` varchar(180) NOT NULL,
  `email` varchar(254) NOT NULL,
  `telephone` varchar(32) NOT NULL,
  `lieu` varchar(180) NOT NULL,
  `statut` varchar(30) NOT NULL DEFAULT 'PENDING',
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fichier_devis_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `client_id` (`client_id`),
  KEY `utilisateur_id` (`utilisateur_id`),
  KEY `demandes_devis_statut` (`statut`),
  KEY `demandes_devis_cree_le` (`cree_le`),
  KEY `demandes_devis_email` (`email`),
  CONSTRAINT `demandes_devis_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `demandes_devis_ibfk_2` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `demandes_devis`
--

LOCK TABLES `demandes_devis` WRITE;
/*!40000 ALTER TABLE `demandes_devis` DISABLE KEYS */;
INSERT INTO `demandes_devis` VALUES ('18dcaede-6d8c-4f27-829e-8e7a106ddf88','DMD-2026-4639','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','Devis Panier SOUTARAH','Demande de devis (DMD-2026-6757)','330000',NULL,'1x Audi A6, 1x Audi A6',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','Abidjan','PENDING','2026-08-22 10:54:02','2026-08-22 10:54:02',NULL),('1cc3e3eb-cc34-4717-98e4-5a08e9d40e97','DMD-2026-2745','2c91e316-d2dc-4202-abf0-76e01df601d4','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'Client Soutarah','client@soutarah.local','0700000001','Abidjan, C├┤te dÔÇÖIvoire','PENDING','2026-08-13 12:16:59','2026-08-13 12:16:59',NULL),('20d60579-1ef8-45b4-a411-3b4554e1334f','DMD-2026-4287','5edd63d4-6c15-4201-b804-553c9e46f7fe','44772e8b-0513-4046-b94a-dd60d14b7c89','CLIENT','Panier client','Devis panier - DMD-2026-4287','4500',NULL,'Boulon hexagonale M8x30 (lot de 50) x1',NULL,'sucaf@gmail.com','sucaf@gmail.com','070000003','Abidjan','SENT','2026-08-24 10:56:24','2026-08-24 11:28:45','/uploads/quotes/devis-DMD-2026-4287-signed.pdf'),('21ba3889-8370-413a-9e48-26ec188d9133','DMD-2026-9416','dd0500a1-9644-4a1e-ba0d-24e672c40457','33582ee1-d5fd-438e-88fa-8326a27078a3','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'Client Soutarah','client@soutarah.local','0700000001','Abidjan, C├┤te dÔÇÖIvoire','APPROVED','2026-08-24 10:50:54','2026-08-24 11:30:54','/uploads/quotes/devis-DMD-2026-9416-signed.pdf'),('3be919e2-2ece-4419-b7b9-64102c7d514e','DMD-2026-8429','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','PENDING','2026-08-13 16:34:56','2026-08-13 16:34:56',NULL),('58a8b7e5-29db-4c71-815a-2e050569172f','DMD-2026-9640','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','Devis Panier SOUTARAH','Demande de devis (DMD-2026-5886)','165000',NULL,'1x Audi A6',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','Abidjan','PENDING','2026-08-22 10:20:56','2026-08-22 10:20:56',NULL),('5d295850-8f8b-4d1e-83d7-02e498b00b1b','DMD-2026-8602','2c91e316-d2dc-4202-abf0-76e01df601d4','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Article (xNaN) | Location V├®hicule (1j) | Location V├®hicule (1j) | Location V├®hicule (1j)',NULL,'Client Soutarah','client@soutarah.local','0700000001','Abidjan, C├┤te dÔÇÖIvoire','PENDING','2026-08-17 15:58:06','2026-08-17 15:58:06',NULL),('6cabf93e-9aba-40f2-b21a-17d6406aaa1d','DMD-2026-6504',NULL,NULL,'GUEST','NEGOCE','Test Request','1000','1 month','test','test corp','tester','test@test.com','0700000001','abidjan','SENT','2026-08-24 10:55:01','2026-08-24 11:28:45','/uploads/quotes/devis-DMD-2026-6504-signed.pdf'),('6ce0c54b-df7b-4d10-8eee-72b64ce8f9ce','DMD-2026-5556','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','Devis Panier SOUTARAH','Demande de devis (DMD-2026-9913)','165000',NULL,'1x Audi A6',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','Abidjan','PENDING','2026-08-22 10:09:46','2026-08-22 10:09:46',NULL),('6df39be6-03a2-454b-ad16-3774c51933a0','DMD-2026-6143','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','SENT','2026-08-14 10:02:06','2026-08-24 11:28:45','/uploads/quotes/devis-DMD-2026-6143-signed.pdf'),('6e42dfb4-f1d8-464c-8a53-45399e1fa3ac','DMD-2026-7119','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','PENDING','2026-08-13 13:49:53','2026-08-13 13:49:53',NULL),('742adb5c-5643-4a37-aebd-b6ae662cc7b2','DMD-2026-7029','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Article (xNaN)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','PENDING','2026-08-21 11:34:50','2026-08-21 11:34:50',NULL),('7a705711-d14f-4506-b028-e1135915c01b','DMD-2026-2805','5edd63d4-6c15-4201-b804-553c9e46f7fe','44772e8b-0513-4046-b94a-dd60d14b7c89','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Article (xNaN) | Location V├®hicule (1j) | Location V├®hicule (1j) | Location V├®hicule (1j)','SUCAF','SUCAF','sucaf@gmail.com','070000003','Abidjan','SENT','2026-08-24 11:00:30','2026-08-24 11:28:45','/uploads/quotes/devis-DMD-2026-2805-signed.pdf'),('8bf00a9b-5004-4d42-aab4-3f1aabdeb77a','DMD-2026-4958','2c91e316-d2dc-4202-abf0-76e01df601d4','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (15j)',NULL,'Client Soutarah','client@soutarah.local','0700000001','Abidjan, C├┤te dÔÇÖIvoire','PENDING','2026-08-13 10:05:43','2026-08-13 10:05:43',NULL),('9116912b-1504-479d-8973-bed4dec8d1ec','DMD-2026-5382','2c91e316-d2dc-4202-abf0-76e01df601d4','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'Client Soutarah','client@soutarah.local','0700000001','Abidjan, C├┤te dÔÇÖIvoire','PENDING','2026-08-13 09:55:10','2026-08-13 09:55:10',NULL),('9441a272-26cb-4fbb-820f-ed755c704e26','DMD-2026-2814','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','SENT','2026-08-23 18:00:55','2026-08-24 11:35:15','/uploads/quotes/devis-DMD-2026-2814-signed.pdf'),('9998466d-03e2-4b4a-8256-22e8a48d8dd4','DMD-2026-4513','2c91e316-d2dc-4202-abf0-76e01df601d4','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'Client Soutarah','client@soutarah.local','0700000001','Abidjan, C├┤te dÔÇÖIvoire','PENDING','2026-08-17 11:36:14','2026-08-17 11:36:14',NULL),('9d963e73-790e-4e40-a51b-4165b8545800','DMD-2026-8113','2c91e316-d2dc-4202-abf0-76e01df601d4','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Article (xNaN) | Article (xNaN) | Article (xNaN) | Article (xNaN) | Location V├®hicule (1j) | Location V├®hicule (1j) | Location V├®hicule (1j) | Location V├®hicule (1j) | Location V├®hicule (1j)',NULL,'Client Soutarah','client@soutarah.local','0700000001','Abidjan, C├┤te dÔÇÖIvoire','SENT','2026-08-17 11:13:54','2026-08-24 11:28:45','/uploads/quotes/devis-DMD-2026-8113-signed.pdf'),('9f0b36d7-d9af-4d0d-8a76-902bf9c70c3f','DMD-2026-2895','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','PENDING','2026-08-14 09:56:22','2026-08-14 09:56:22',NULL),('a059fdb6-4024-494e-a0e5-8da6d650fa93','DMD-2026-1896','d2665b89-b286-4947-bb1a-3f08310b7a36','c7cd9b37-f317-45cd-bbd6-f5384fc43fcb','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'David Sorho','sorhodavid31@gmail.com','0700000002','Abidjan, C├┤te d\'Ivoire','SENT','2026-08-24 10:46:19','2026-08-24 11:29:35','/uploads/quotes/devis-DMD-2026-1896-signed.pdf'),('a4acbdc9-a355-47d4-85dd-c8bed1e5a0f0','DMD-2026-2686','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','SENT','2026-08-18 13:07:23','2026-08-24 11:28:45','/uploads/quotes/devis-DMD-2026-2686-signed.pdf'),('a9bebcd3-1001-4f0e-9042-bdd5992381b0','DMD-2026-3210','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','SENT','2026-08-18 14:34:14','2026-08-24 11:28:45','/uploads/quotes/devis-DMD-2026-3210-signed.pdf'),('ab29ac20-d13c-4360-a007-12fbf2ee62aa','DMD-2026-4580','2c91e316-d2dc-4202-abf0-76e01df601d4','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Article (xNaN) | Location V├®hicule (1j) | Location V├®hicule (1j) | Location V├®hicule (1j)',NULL,'Client Soutarah','client@soutarah.local','0700000001','Abidjan, C├┤te dÔÇÖIvoire','SENT','2026-08-17 15:58:08','2026-08-24 11:28:45','/uploads/quotes/devis-DMD-2026-4580-signed.pdf'),('afb6cb84-6ec2-45e3-bef2-ff9756dae765','DMD-2026-5573','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','PENDING','2026-08-18 11:53:07','2026-08-18 11:53:07',NULL),('b44c699b-2524-4cb6-8136-f3d44c639851','DMD-2026-2761','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (9j)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','PENDING','2026-08-13 17:03:24','2026-08-13 17:03:24',NULL),('b9a54caa-fc22-4526-9f8c-81d6c7a76209','DMD-2026-8956','2c91e316-d2dc-4202-abf0-76e01df601d4','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'Client Soutarah','client@soutarah.local','0700000001','Abidjan, C├┤te dÔÇÖIvoire','PENDING','2026-08-13 12:11:10','2026-08-13 12:11:10',NULL),('bbad609a-716b-498d-9730-8b4a637273f9','DMD-2026-7797','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Article (xNaN) | Location V├®hicule (1j) | Location V├®hicule (1j) | Location V├®hicule (1j)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','PENDING','2026-08-19 14:55:38','2026-08-19 14:55:38',NULL),('c323ec37-009a-465d-849e-8e1ccb7329ef','DMD-2026-3812','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','PENDING','2026-08-14 09:47:54','2026-08-14 09:47:54',NULL),('c9a7c8de-e2ce-4de4-92bf-8f72b84885ee','DMD-2026-2051','2c91e316-d2dc-4202-abf0-76e01df601d4','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'Client Soutarah','client@soutarah.local','0700000001','Abidjan, C├┤te dÔÇÖIvoire','PENDING','2026-08-13 12:20:12','2026-08-13 12:20:12',NULL),('cb1bb742-bd2e-49e4-ae7f-a85cc8d1541a','DMD-2026-7628','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Article (xNaN)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','PENDING','2026-08-18 11:44:32','2026-08-18 11:44:32',NULL),('e32e1b14-04e6-4355-b587-c2fe3982e0c4','DMD-2026-9544','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','PENDING','2026-08-18 11:45:47','2026-08-18 11:45:47',NULL),('e411d64e-4661-4550-88cb-62885859d98d','DMD-2026-8158','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','PENDING','2026-08-17 08:25:05','2026-08-24 11:23:09',NULL),('ea4af1cb-b5e0-4665-be0d-78d1fdf63aaa','DMD-2026-2539','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','SENT','2026-08-23 18:02:38','2026-08-24 11:35:00','/uploads/quotes/devis-DMD-2026-2539-signed.pdf'),('f0708c81-5e31-4988-b0b1-2235dc9798e2','DMD-2026-8689','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','SENT','2026-08-19 16:19:41','2026-08-24 11:28:45','/uploads/quotes/devis-DMD-2026-8689-signed.pdf'),('f6cb0077-98aa-4262-9865-2b7195b3b0b4','DMD-2026-2683','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','Ajout au panier','Ajout au panier: Hyundai H350','100000',NULL,'Un client a ajout├® le v├®hicule Hyundai H350 (1 jours) ├á son panier.',NULL,'sorhodavid31','sorhodavid31@gmail.com','0584278638','Abidjan','PENDING','2026-08-22 11:27:35','2026-08-24 11:23:09',NULL),('f8f5af1d-476e-48b5-a04e-045d338fd906','DMD-2026-4352','fa515ab8-40ff-44d6-b1ab-94ee851a8290','5f1f291d-0fad-494b-bffb-9af5b9e14732','CLIENT','N├®goce et Location','Devis Panier SOUTARAH',NULL,NULL,'Location V├®hicule (1j) | Location V├®hicule (1j)',NULL,'David Sorho','sorhodavid31@gmail.com','0584278638','cocody, snk','SENT','2026-08-18 14:25:21','2026-08-24 11:28:45','/uploads/quotes/devis-DMD-2026-4352-signed.pdf');
/*!40000 ALTER TABLE `demandes_devis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `demandes_produits`
--

DROP TABLE IF EXISTS `demandes_produits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `demandes_produits` (
  `id` char(36) NOT NULL,
  `client_id` char(36) NOT NULL,
  `nom_produit` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `quantite_souhaitee` decimal(14,3) DEFAULT NULL,
  `categorie` varchar(100) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `commentaire` text DEFAULT NULL,
  `statut` enum('PENDING','ANSWERED','ACCEPTED','REJECTED','CONVERTED') NOT NULL DEFAULT 'PENDING',
  `reponse_admin` text DEFAULT NULL,
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `demandes_produits_statut_cree_le` (`statut`,`cree_le`),
  CONSTRAINT `demandes_produits_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `demandes_produits`
--

LOCK TABLES `demandes_produits` WRITE;
/*!40000 ALTER TABLE `demandes_produits` DISABLE KEYS */;
/*!40000 ALTER TABLE `demandes_produits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `demandes_vehicules`
--

DROP TABLE IF EXISTS `demandes_vehicules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `demandes_vehicules` (
  `id` char(36) NOT NULL,
  `client_id` char(36) DEFAULT NULL,
  `utilisateur_id` char(36) DEFAULT NULL,
  `nom_vehicule` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `nom` varchar(180) NOT NULL,
  `telephone` varchar(32) NOT NULL,
  `email` varchar(254) NOT NULL,
  `statut` enum('PENDING','CONTACTED','CONVERTED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `reponse_admin` text DEFAULT NULL,
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `demandes_vehicules_client_id` (`client_id`),
  KEY `demandes_vehicules_utilisateur_id` (`utilisateur_id`),
  KEY `demandes_vehicules_statut` (`statut`),
  KEY `demandes_vehicules_cree_le` (`cree_le`),
  CONSTRAINT `demandes_vehicules_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `demandes_vehicules_ibfk_2` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `demandes_vehicules`
--

LOCK TABLES `demandes_vehicules` WRITE;
/*!40000 ALTER TABLE `demandes_vehicules` DISABLE KEYS */;
INSERT INTO `demandes_vehicules` VALUES ('28477f57-75fd-44e8-b1dc-102bdc2f3a62',NULL,NULL,'toyota',NULL,'David Sorho','0584278638','sorhodavid31@gmail.com','PENDING',NULL,'2026-08-14 08:14:59','2026-08-14 08:14:59'),('3365f4ef-5fa0-4dc7-b839-d59917606bdf',NULL,NULL,'Toyota Land Cruiser V8','Besoin urgent pour un d├®placement ├á l\'int├®rieur du pays, 7 jours','Test Client','0700000099','test@example.com','PENDING',NULL,'2026-08-14 08:20:02','2026-08-14 08:20:02'),('42c8638a-79ee-4c88-8b07-93a0fd840325',NULL,NULL,'Mercedes G-Class','Pour un mariage le mois prochain','Jean Kouassi','0707070707','jean@test.com','PENDING',NULL,'2026-08-14 08:19:50','2026-08-14 08:19:50'),('bb2d04e2-43a1-4c3c-b3c9-3b47fecef7bc',NULL,NULL,'Toyota Land Cruiser V8','Besoin urgent pour un d├®placement ├á l\'int├®rieur du pays, 7 jours','Test Client','0700000099','test@example.com','PENDING',NULL,'2026-08-14 08:12:24','2026-08-14 08:12:24');
/*!40000 ALTER TABLE `demandes_vehicules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devis`
--

DROP TABLE IF EXISTS `devis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `devis` (
  `id` char(36) NOT NULL,
  `client_id` char(36) NOT NULL,
  `numero` varchar(40) NOT NULL,
  `statut` enum('DRAFT','ISSUED','ACCEPTED','REJECTED','EXPIRED') NOT NULL DEFAULT 'ISSUED',
  `montant_total` decimal(14,2) NOT NULL,
  `valide_jusqu_au` date NOT NULL,
  `chemin_pdf` varchar(255) DEFAULT NULL,
  `conditions` text DEFAULT NULL,
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `devis_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devis`
--

LOCK TABLES `devis` WRITE;
/*!40000 ALTER TABLE `devis` DISABLE KEYS */;
/*!40000 ALTER TABLE `devis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entreprises`
--

DROP TABLE IF EXISTS `entreprises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `entreprises` (
  `id` char(36) NOT NULL,
  `client_id` char(36) NOT NULL,
  `nom` varchar(180) NOT NULL,
  `nom_responsable` varchar(180) DEFAULT NULL,
  `numero_identification` varchar(100) DEFAULT NULL,
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_id` (`client_id`),
  CONSTRAINT `entreprises_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entreprises`
--

LOCK TABLES `entreprises` WRITE;
/*!40000 ALTER TABLE `entreprises` DISABLE KEYS */;
INSERT INTO `entreprises` VALUES ('eba82579-5c28-466f-9d14-53a006c11cb8','5edd63d4-6c15-4201-b804-553c9e46f7fe','SUCAF',NULL,NULL,'2026-08-24 10:36:45','2026-08-24 10:36:45');
/*!40000 ALTER TABLE `entreprises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mouvements_stock`
--

DROP TABLE IF EXISTS `mouvements_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mouvements_stock` (
  `id` char(36) NOT NULL,
  `produit_id` char(36) NOT NULL,
  `cree_par_utilisateur_id` char(36) DEFAULT NULL,
  `type` enum('IN','OUT','ADJUSTMENT') NOT NULL,
  `quantite` decimal(14,3) NOT NULL,
  `motif` varchar(255) DEFAULT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `produit_id` (`produit_id`),
  KEY `cree_par_utilisateur_id` (`cree_par_utilisateur_id`),
  CONSTRAINT `mouvements_stock_ibfk_1` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`),
  CONSTRAINT `mouvements_stock_ibfk_2` FOREIGN KEY (`cree_par_utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mouvements_stock`
--

LOCK TABLES `mouvements_stock` WRITE;
/*!40000 ALTER TABLE `mouvements_stock` DISABLE KEYS */;
/*!40000 ALTER TABLE `mouvements_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `utilisateur_destinataire_id` char(36) DEFAULT NULL,
  `type` varchar(80) NOT NULL,
  `titre` varchar(180) NOT NULL,
  `message` text NOT NULL,
  `lien` varchar(255) DEFAULT NULL,
  `est_lu` tinyint(1) NOT NULL DEFAULT 0,
  `lu_le` datetime DEFAULT NULL,
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `notifications_utilisateur_destinataire_id_est_lu_cree_le` (`utilisateur_destinataire_id`,`est_lu`,`cree_le`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`utilisateur_destinataire_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES ('07679da1-cc51-4e2d-aaa0-96c5e3a9b9f4','44772e8b-0513-4046-b94a-dd60d14b7c89','QUOTE_APPROVED','Devis envoy├® !','Votre devis DMD-2026-4287 sign├® est disponible dans votre espace client.','/mes-devis',0,NULL,'2026-08-24 11:01:38','2026-08-24 11:01:38'),('07e1462c-55af-4319-8da3-3560e72c7e6e','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-2745 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".',NULL,0,NULL,'2026-08-13 12:16:59','2026-08-13 12:16:59'),('0819029e-0a0d-48f1-8051-1eb556fc5820','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-2895 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".',NULL,0,NULL,'2026-08-14 09:56:22','2026-08-14 17:16:15'),('12978885-f330-428c-8c47-e01ae7906714','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-5556 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-22 10:09:46','2026-08-22 10:09:46'),('15e9cea8-e97e-4828-a6a1-a293ace96264','33582ee1-d5fd-438e-88fa-8326a27078a3','QUOTE_APPROVED','Devis envoy├® !','Votre devis DMD-2026-9416 sign├® est disponible dans votre espace client.','/mes-devis',0,NULL,'2026-08-24 11:26:50','2026-08-24 11:26:50'),('1be01b4b-74be-4786-9f31-b10af5f22640','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-6143 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".',NULL,0,NULL,'2026-08-14 10:02:06','2026-08-14 17:16:06'),('1c65bfaa-ec37-4e15-9ead-4259db1defaa','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-2686 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-18 13:07:24','2026-08-18 13:07:24'),('209cc627-f904-42de-9631-8e7ea3e2bea6','4e9d5375-9fa8-11f1-83ff-c1566a142374','CART_ITEM_ADDED','Location ajout├®e au panier','Client Soutarah a ajout├® la location \"Citro├½n Jumper\" du 2026-08-24 au 2026-08-25 (1 jour) sans chauffeur ├á son panier. Contact: 0700000001 / client@soutarah.local','/admin/clients',0,NULL,'2026-08-24 10:50:50','2026-08-24 10:50:50'),('2114fc8b-ee0c-4d5a-b2ee-172502316fd0','4e9d5375-9fa8-11f1-83ff-c1566a142374','CART_ITEM_ADDED','Location ajout├®e au panier','David Sorho a ajout├® la location \"Renault OROCH\" du 2026-08-24 au 2026-08-25 (1 jour) sans chauffeur ├á son panier. Contact: 0700000002 / sorhodavid31@gmail.com','/admin/clients',0,NULL,'2026-08-24 10:46:13','2026-08-24 10:46:13'),('2c2b52a1-fa80-4d4e-8328-0874647d4781','4e9d5375-9fa8-11f1-83ff-c1566a142374','QUOTE_REQUEST_CREATED','Nouvelle demande de devis','tester a envoy├® une demande de devis : Test Request.','/admin/quotes',0,NULL,'2026-08-24 10:55:01','2026-08-24 10:55:01'),('2e9af1e9-db17-4a1f-9cef-57f3c80168dc','44772e8b-0513-4046-b94a-dd60d14b7c89','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-2805 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-24 11:00:30','2026-08-24 11:00:30'),('2fe328ca-b2fb-454b-b80d-d1e7c7e355db','c7cd9b37-f317-45cd-bbd6-f5384fc43fcb','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-1896 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-24 10:46:19','2026-08-24 10:46:19'),('33a24e4c-9cb0-487a-af00-428c35b6dc93','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-7119 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".',NULL,0,NULL,'2026-08-13 13:49:53','2026-08-14 17:16:17'),('3444fd29-c26c-49a3-b77e-b74a50bd72ea','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-8956 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".',NULL,0,NULL,'2026-08-13 12:11:10','2026-08-13 12:11:41'),('36f35fe0-a4f4-4cf5-8114-28d295310ad8','5f1f291d-0fad-494b-bffb-9af5b9e14732','QUOTE_APPROVED','Devis approuv├® !','Votre devis DMD-2026-6143 a ├®t├® approuv├® par l\'administrateur. Vous pouvez le consulter dans votre espace.','/mes-devis',0,NULL,'2026-08-14 16:36:12','2026-08-14 16:41:03'),('3e1f5bd1-b8fa-4542-b328-4df85a72f85a','33582ee1-d5fd-438e-88fa-8326a27078a3','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-9416 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-24 10:50:54','2026-08-24 10:50:54'),('41934d13-c8d2-47a2-9776-359f228203dd','44772e8b-0513-4046-b94a-dd60d14b7c89','CART_VALIDATED','Panier valid├® - Devis en cours','Votre devis DMD-2026-4287 a ├®t├® cr├®├® avec succ├¿s. Un conseiller SOUTARAH vous contactera sous peu.','/client/devis',0,NULL,'2026-08-24 10:56:24','2026-08-24 10:56:24'),('4274eebd-034c-4048-a81e-b699b770c480','5f1f291d-0fad-494b-bffb-9af5b9e14732','QUOTE_APPROVED','Devis envoy├® !','Votre devis DMD-2026-2686 sign├® est disponible dans votre espace client.','/mes-devis',0,'2026-08-19 09:47:34','2026-08-19 09:46:47','2026-08-19 09:47:34'),('42eaf0ac-42ed-4b53-8d75-c2e8f3f0c9c1','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-8689 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,'2026-08-21 11:27:11','2026-08-19 16:19:41','2026-08-21 11:27:11'),('44861f95-1b6c-432a-8b60-a324dcdb3354','44772e8b-0513-4046-b94a-dd60d14b7c89','QUOTE_APPROVED','Devis envoy├® !','Votre devis DMD-2026-2805 sign├® est disponible dans votre espace client.','/mes-devis',0,NULL,'2026-08-24 11:01:07','2026-08-24 11:01:07'),('45841d21-a1e1-4f51-8e29-0e60a523bc64','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-7797 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-19 14:55:38','2026-08-19 14:55:38'),('45e91ba5-e730-4741-bfff-b387569aa204','4e9d5375-9fa8-11f1-83ff-c1566a142374','QUOTE_REQUEST_CREATED','Nouvelle demande de devis','David Sorho a envoy├® une demande de devis : Devis Panier SOUTARAH.','/admin/quotes',0,NULL,'2026-08-24 10:46:19','2026-08-24 10:46:19'),('45f88171-f901-4639-8503-13b39de418ef','c7cd9b37-f317-45cd-bbd6-f5384fc43fcb','QUOTE_APPROVED','Devis envoy├® !','Votre devis DMD-2026-1896 sign├® est disponible dans votre espace client.','/mes-devis',0,NULL,'2026-08-24 11:29:35','2026-08-24 11:29:35'),('485b1b7c-be72-4f38-bdcf-fe9aed696d7b',NULL,'CART_ITEM_ADDED','­ƒøÆ Nouvel ajout au panier','Un client a ajout├® 50 sacs de ciment Portland au panier.',NULL,0,NULL,'2026-08-14 09:33:02','2026-08-14 09:33:02'),('492c2e09-6b98-4040-90b5-3eb85661585a','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-5382 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".',NULL,0,NULL,'2026-08-13 09:55:10','2026-08-13 10:04:06'),('4c332099-1d5a-4e5c-a55d-cd520cd20431',NULL,'VEHICLE_REQUEST','­ƒÜù Nouvelle demande de v├®hicule','Un client a demand├® un devis pour un Toyota Hilux.',NULL,0,NULL,'2026-08-14 09:33:02','2026-08-14 09:33:02'),('557bbbda-6ff9-45b1-9783-38779e9aa54f','5f1f291d-0fad-494b-bffb-9af5b9e14732','QUOTE_APPROVED','Devis envoy├® !','Votre devis DMD-2026-8689 sign├® est disponible dans votre espace client.','/mes-devis',0,'2026-08-21 11:27:06','2026-08-19 16:49:26','2026-08-21 11:27:06'),('5e982880-f33c-43fb-bfff-70356be1470d','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-4352 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-18 14:25:21','2026-08-18 14:25:21'),('5f55b2ac-d296-452a-a35f-50c8744f974b','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-4958 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".',NULL,0,NULL,'2026-08-13 10:05:43','2026-08-13 10:06:25'),('62391115-b06a-4ea7-9ec7-5a40f78ebf12','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-5573 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-18 11:53:07','2026-08-18 11:53:07'),('629c17ff-589e-4a39-b385-a8d816f8b231',NULL,'NEW_ORDER','­ƒÜÜ R├®servation urgente','R├®servation de camion benne pour demain matin ├á 7h.',NULL,0,NULL,'2026-08-14 09:33:02','2026-08-14 09:33:02'),('6dcead91-4621-4483-913c-e95e698c2e41','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-4639 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-22 10:54:02','2026-08-22 10:54:02'),('6f4cf3ce-1d10-4cf5-82d1-3f1650922c33',NULL,'QUOTE_REQUEST','­ƒôï Nouvelle demande de devis','Entreprise SARL BTP a demand├® un devis pour 100 tonnes de fer ├á b├®ton.',NULL,0,NULL,'2026-08-14 09:33:02','2026-08-14 09:33:02'),('70ed6328-9feb-4813-a79d-354634c96b64','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','QUOTE_APPROVED','Devis envoy├® !','Votre devis DMD-2026-4580 sign├® est disponible dans votre espace client.','/mes-devis',0,'2026-08-18 10:47:42','2026-08-18 10:46:58','2026-08-18 10:47:42'),('715e2bbd-69db-43a5-b4fc-aa9930c37e44','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-7029 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,'2026-08-21 11:35:00','2026-08-21 11:34:50','2026-08-21 11:35:00'),('7cb52b72-0125-4071-a261-dbecc0985611','4e9d5375-9fa8-11f1-83ff-c1566a142374','CART_ITEM_ADDED','Article ajout├® au panier','sucaf@gmail.com a ajout├® \"Boulon hexagonale M8x30 (lot de 50)\" (x1) ├á son panier. Contact: 070000003 / sucaf@gmail.com','/admin/clients',0,NULL,'2026-08-24 10:56:22','2026-08-24 10:56:22'),('7e5ce756-8b57-4ed0-949d-e7d694c23570','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-8113 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-17 11:13:54','2026-08-17 11:13:54'),('851587d5-81ca-4328-ae8d-3ba82b475277','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-7628 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-18 11:44:32','2026-08-18 11:44:32'),('89c249a3-fa63-4729-bff6-dee346d34a41','5f1f291d-0fad-494b-bffb-9af5b9e14732','QUOTE_APPROVED','Devis envoy├® !','Votre devis DMD-2026-4352 sign├® est disponible dans votre espace client.','/mes-devis',0,NULL,'2026-08-19 09:43:38','2026-08-19 09:43:38'),('97230a1e-ee77-4d53-8b93-7d34d2bdd7e7','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-9640 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-22 10:20:56','2026-08-22 10:20:56'),('9d017dbb-5d25-42df-a64d-76b0519e4fa7','4e9d5375-9fa8-11f1-83ff-c1566a142374','QUOTE_REQUEST_CREATED','Nouveau devis panier client','Un client a valid├® son panier. R├®f├®rence : DMD-2026-4287.','/admin/quotes',0,NULL,'2026-08-24 10:56:24','2026-08-24 10:56:24'),('a0cd3e72-225f-4061-83fb-514aaa809bb3','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-2761 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".',NULL,0,NULL,'2026-08-13 17:03:24','2026-08-14 07:53:54'),('a70ea1ce-c036-44e5-a08a-ab5c5b1cc0ef','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-3210 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-18 14:34:15','2026-08-18 14:34:15'),('a80b2a22-fb37-498c-85d0-57af8860231b','4e9d5375-9fa8-11f1-83ff-c1566a142374','QUOTE_REQUEST_CREATED','Nouvelle demande de devis','Client Soutarah a envoy├® une demande de devis : Devis Panier SOUTARAH.','/admin/quotes',0,NULL,'2026-08-24 10:50:54','2026-08-24 10:50:54'),('a84b25a7-cdd8-43fa-94a0-bce3cea682bd','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-2814 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-23 18:00:55','2026-08-23 18:00:55'),('a9e4608c-3455-44bc-92d9-771c00d69eb2','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-3812 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".',NULL,0,NULL,'2026-08-14 09:47:54','2026-08-14 17:16:14'),('af61f887-205f-465f-811f-d7e73affae83','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-8429 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".',NULL,0,NULL,'2026-08-13 16:34:56','2026-08-14 17:16:17'),('b2de3754-ba6d-4fa9-993f-03c91b86b33c','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-4513 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-17 11:36:14','2026-08-17 11:36:14'),('be966b52-5d7b-4b42-9968-30267a605bd5',NULL,'NEW_CLIENT','­ƒæñ Nouveau client entreprise','SARL Construction Plus s\'est inscrit en tant que client entreprise.',NULL,0,NULL,'2026-08-14 09:33:02','2026-08-14 09:33:02'),('befdb0e4-3265-4ddb-9978-752c9b88b9c3','44772e8b-0513-4046-b94a-dd60d14b7c89','QUOTE_APPROVED','Devis envoy├® !','Votre devis DMD-2026-2805 sign├® est disponible dans votre espace client.','/mes-devis',0,NULL,'2026-08-24 11:20:43','2026-08-24 11:20:43'),('c0c13ec7-f3a1-4756-b266-2c1b4bce2c02','4e9d5375-9fa8-11f1-83ff-c1566a142374','QUOTE_REQUEST_CREATED','Nouvelle demande de devis','SUCAF a envoy├® une demande de devis : Devis Panier SOUTARAH.','/admin/quotes',0,NULL,'2026-08-24 11:00:30','2026-08-24 11:00:30'),('c0d6db2f-ae6a-4c01-9b26-9f1801439449','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-8602 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-17 15:58:06','2026-08-17 15:58:06'),('c18668c5-0c32-4ebb-8e78-17750d2c89d4','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-4580 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-17 15:58:08','2026-08-17 15:58:08'),('c6508778-910f-4104-b19d-4f9af187d3d4','5f1f291d-0fad-494b-bffb-9af5b9e14732','QUOTE_APPROVED','Devis approuv├® !','Votre devis DMD-2026-8158 a ├®t├® approuv├® par l\'administrateur. Vous pouvez le consulter dans votre espace.','/mes-devis',0,NULL,'2026-08-18 09:42:45','2026-08-18 09:42:45'),('cf3d51d1-2e44-495a-a387-02b8a677a12b','5f1f291d-0fad-494b-bffb-9af5b9e14732','QUOTE_APPROVED','Devis envoy├® !','Votre devis DMD-2026-3210 sign├® est disponible dans votre espace client.','/mes-devis',0,NULL,'2026-08-19 08:55:17','2026-08-19 08:55:17'),('d24b67ff-44eb-46a9-a644-a0e377dd80f8','5f1f291d-0fad-494b-bffb-9af5b9e14732','QUOTE_APPROVED','Devis envoy├® !','Votre devis DMD-2026-2683 sign├® est disponible dans votre espace client.','/mes-devis',0,NULL,'2026-08-22 11:30:34','2026-08-22 11:30:34'),('dd284235-04d6-4549-ba72-6cb1bd40f1fa','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-9544 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-18 11:45:47','2026-08-18 11:45:47'),('ed9fe8b1-8c35-44ee-81a8-9526ce97a44d','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-2683 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-22 11:27:35','2026-08-22 11:27:35'),('f64e1b71-5ce7-4827-900d-cb882ec372ce','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-8158 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".',NULL,0,NULL,'2026-08-17 08:25:05','2026-08-17 08:25:05'),('f7aeeaa3-0b34-4f10-8dcc-b2cfbdf07c99','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','QUOTE_APPROVED','Devis approuv├® !','Votre devis DMD-2026-4580 a ├®t├® approuv├® par l\'administrateur. Vous pouvez le consulter dans votre espace.','/mes-devis',0,NULL,'2026-08-18 09:43:07','2026-08-18 09:43:07'),('f832ae4e-d179-4871-a9dc-dc79e9f4ad8c','3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-2051 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".',NULL,0,NULL,'2026-08-13 12:20:12','2026-08-13 13:43:51'),('fd421e5a-85fe-4634-96be-77e218094824','5f1f291d-0fad-494b-bffb-9af5b9e14732','QUOTE_APPROVED','Devis approuv├® !','Votre devis DMD-2026-8158 a ├®t├® approuv├® par l\'administrateur. Vous pouvez le consulter dans votre espace.','/mes-devis',0,NULL,'2026-08-18 09:42:53','2026-08-18 09:42:53'),('fdf54b76-e8b4-42a4-8699-84115c196e5f','5f1f291d-0fad-494b-bffb-9af5b9e14732','CART_VALIDATED','Panier valid├® - Devis enregistr├®','Votre demande de devis DMD-2026-2539 a ├®t├® enregistr├®e avec succ├¿s. Retrouvez-la dans \"Mes devis\".','/client/devis',0,NULL,'2026-08-23 18:02:38','2026-08-23 18:02:38');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paniers`
--

DROP TABLE IF EXISTS `paniers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paniers` (
  `id` char(36) NOT NULL,
  `client_id` char(36) NOT NULL,
  `statut` enum('ACTIVE','CONVERTED','ABANDONED') NOT NULL DEFAULT 'ACTIVE',
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `paniers_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paniers`
--

LOCK TABLES `paniers` WRITE;
/*!40000 ALTER TABLE `paniers` DISABLE KEYS */;
INSERT INTO `paniers` VALUES ('00d26731-7ba4-4d13-8b14-60121539c999','dd0500a1-9644-4a1e-ba0d-24e672c40457','ACTIVE','2026-08-24 10:48:12','2026-08-24 10:48:12'),('03e74b8b-6d44-46c0-8d97-b882b502f441','5edd63d4-6c15-4201-b804-553c9e46f7fe','ACTIVE','2026-08-24 10:56:22','2026-08-24 10:56:22'),('58da42c6-4405-45b5-a1bf-36db0d6ea469','2c91e316-d2dc-4202-abf0-76e01df601d4','ACTIVE','2026-08-13 08:47:18','2026-08-13 08:47:18'),('8d4556ee-60d8-4f72-af52-825e51df206e','d2665b89-b286-4947-bb1a-3f08310b7a36','ACTIVE','2026-08-24 10:45:46','2026-08-24 10:45:46'),('a0458c26-4581-4ffb-9d90-14985eb4b5ed','fa515ab8-40ff-44d6-b1ab-94ee851a8290','ACTIVE','2026-08-13 13:45:39','2026-08-13 13:45:39');
/*!40000 ALTER TABLE `paniers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parametres`
--

DROP TABLE IF EXISTS `parametres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parametres` (
  `id` char(36) NOT NULL,
  `cle` varchar(100) NOT NULL,
  `valeur` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`valeur`)),
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cle` (`cle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parametres`
--

LOCK TABLES `parametres` WRITE;
/*!40000 ALTER TABLE `parametres` DISABLE KEYS */;
INSERT INTO `parametres` VALUES ('3c4dd831-1627-461d-8560-4dea86684268','shop','{\"currency\": \"FCFA\", \"language\": \"Fran├ºais\", \"timezone\": \"Africa/Abidjan (GMT+0)\", \"maintenanceMode\": false}','2026-08-15 16:46:06','2026-08-15 16:46:06'),('4fe1b3f7-6eb0-4d14-9e62-8bf6634cc0e8','company','{\"name\": \"SOUTARAH GROUP\", \"email\": \"contact@soutarah.com\", \"phone\": \"+225 07 18 38 38 38\", \"address\": \"Riviera Palmeraie Saint Viateur, Cit├® Kimi\", \"website\": \"www.soutarah.com\", \"description\": \"N├®goce de quincaillerie, plomberie, fournitures BTP, ├®nergie solaire, location de v├®hicules et gestion de projets.\"}','2026-08-15 16:46:06','2026-08-15 16:46:06'),('51bf07f9-df79-416f-84f0-fc03165e89d2','quoteEmails','[\"contact@soutarah.com\", \"sorhodavid550@gmail.com\"]','2026-08-15 16:46:06','2026-08-17 11:13:22'),('6574ece8-1e12-4a59-9289-3fdd6101f6f7','profile','{\"name\": \"admin\", \"role\": \"Administrateur\", \"email\": \"admin@gmail.com\", \"phone\": \"\"}','2026-08-15 16:46:06','2026-08-15 16:46:06'),('7afbc76a-cea8-476f-a6fe-c56587f01188','notifications','{\"newQuote\": true, \"newClient\": true, \"emailAlerts\": true, \"newReservation\": true}','2026-08-15 16:46:06','2026-08-15 16:46:06'),('f8d6bc5b-04c5-4964-bede-e137d1934d2d','announcements','{\"items\":[{\"id\":null,\"text\":\"Location de v├®hicules & Flottes ÔÇö R├®servez d├¿s maintenant\",\"color\":\"#173d23\",\"fontStyle\":\"font-bold\",\"textSize\":\"text-[11px]\",\"uppercase\":true,\"sticker\":\"\",\"duration\":8,\"enabled\":true,\"order\":0},{\"id\":null,\"text\":\"N├®goce de quincaillerie, plomberie & fournitures BTP\",\"color\":\"#173d23\",\"fontStyle\":\"font-bold\",\"textSize\":\"text-[11px]\",\"uppercase\":true,\"sticker\":\"\",\"duration\":8,\"enabled\":true,\"order\":1},{\"id\":null,\"text\":\"Riviera Palmeraie Saint Viateur, Cit├® Kimi ÔÇö +225 07 18 38 38 38\",\"color\":\"#173d23\",\"fontStyle\":\"font-bold\",\"textSize\":\"text-[11px]\",\"uppercase\":true,\"sticker\":\"\",\"duration\":8,\"enabled\":true,\"order\":2}],\"barHeight\":34}','2026-08-24 10:11:47','2026-08-24 10:11:47');
/*!40000 ALTER TABLE `parametres` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produits`
--

DROP TABLE IF EXISTS `produits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `produits` (
  `id` char(36) NOT NULL,
  `categorie_id` char(36) DEFAULT NULL,
  `nom` varchar(180) NOT NULL,
  `reference` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `unite` varchar(40) NOT NULL DEFAULT 'unit├®',
  `stock` decimal(14,3) NOT NULL DEFAULT 0.000,
  `seuil_alerte` decimal(14,3) NOT NULL DEFAULT 0.000,
  `statut` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `produits_categorie_id_statut` (`categorie_id`,`statut`),
  CONSTRAINT `produits_ibfk_1` FOREIGN KEY (`categorie_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produits`
--

LOCK TABLES `produits` WRITE;
/*!40000 ALTER TABLE `produits` DISABLE KEYS */;
INSERT INTO `produits` VALUES ('091d3454-76d9-43b9-a640-6f1019c83f2e','fb9a9898-0e06-4a0f-950e-e13bca63020d','Groupe electrogene diesel 30kVA','GRP-DSL-30','Groupe electrogene diesel 30kVA, demarrage electrique.','https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop','unite',2.000,1.000,'ACTIVE','2026-08-17 09:36:05','2026-08-17 10:35:02'),('1197bd79-9786-403b-b52b-40385ea4f53c','55c7dd48-b498-49e2-8735-82885876ff36','Fer a beton 10 (barre 12m)','MTC-FER-10','Fer a beton 10 haute adherence, barre de 12m.','https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop','barre',120.000,15.000,'ACTIVE','2026-08-17 09:36:05','2026-08-17 10:35:02'),('14620dac-16b2-4062-8dd1-2fdf3022a7f2','fb9a9898-0e06-4a0f-950e-e13bca63020d','Groupe electrogene diesel 5kVA','GRP-DSL-5','Groupe electrogene diesel 5kVA, demarrage electrique.','https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop','unite',6.000,1.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('1588473f-d2a6-4e4d-85bd-a1f4ad54b080','0a493024-eee9-4166-9d39-35e40f502b4d','Cable H200 2x1.5mm2 (rouleau 100m)','CBL-H200-2X15','Cable electrique H200 2 conducteurs 1.5mm2.','https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop','rouleau',50.000,8.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('15c352b3-3d99-46e0-8946-be51b6033f0d','0a493024-eee9-4166-9d39-35e40f502b4d','Cable H200 4x6mm2 (rouleau 100m)','CBL-H200-4X6','Cable electrique H200 4 conducteurs 6mm2.','https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop','rouleau',20.000,4.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('1f1118c8-12af-45bc-8bf3-5ff1d7a5ca39','880bf117-0824-465f-8600-11a7cfb128e8','Tuyau PVC ├ÿ50','PVC-050','Tuyau PVC robuste pour r├®seaux dÔÇÖeau et installations de plomberie.',NULL,'unit├®',120.000,20.000,'ACTIVE','2026-08-24 10:11:32','2026-08-24 10:13:58'),('23ea8071-f2c7-493a-9158-18e73b5d2b1e','55c7dd48-b498-49e2-8735-82885876ff36','Parpaing creux 15x20x40','MTC-PRP-15','Parpaing creux 15x20x40 pour murs porteurs.','https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop','unite',500.000,50.000,'ACTIVE','2026-08-17 09:36:05','2026-08-17 10:35:02'),('2d7b9c26-1212-4673-af97-a9491f5d99ca','b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33','Serrure 3 points a cylindre','QNC-SER-3PT','Serrure de securite 3 points avec cylindre europeen.','https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop','unite',25.000,5.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('2dfd6c5c-b861-47cb-866b-83f24a4b0288','880bf117-0824-465f-8600-11a7cfb128e8','Tube PVC pression ├ÿ32','PVC-032P','Tube PVC pression adapt├® aux installations durables.',NULL,'unit├®',80.000,15.000,'ACTIVE','2026-08-24 10:11:32','2026-08-24 10:13:58'),('3258b44b-5b68-4e5d-9ac4-4ab4cc18031d','fb9a9898-0e06-4a0f-950e-e13bca63020d','Groupe electrogene diesel 20kVA','GRP-DSL-20','Groupe electrogene diesel 20kVA, demarrage electrique.','https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop','unite',2.000,1.000,'ACTIVE','2026-08-17 09:36:05','2026-08-17 10:35:02'),('33f08068-90b2-45ac-a363-776320ee34b9','0a493024-eee9-4166-9d39-35e40f502b4d','Prise de courant 2P+T 16A','CBL-PRS-16A','Prise de courant encastrable 2P+T 16A.','https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop','unite',70.000,12.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('3a8db114-22ac-4794-a4b9-74ec29beff6e','0a493024-eee9-4166-9d39-35e40f502b4d','Gaine ICTA 20mm (rouleau 25m)','CBL-GNT-20','Gaine isolante ICTA 20mm pour protection des cables.','https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop','rouleau',55.000,10.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('3af6050b-0ef6-48f1-a873-d0366324c941',NULL,'Robinet arret 1/2','PLB-RBN-12','Robinet arret laiton 1/2 pour alimentation.','https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop','unite',90.000,15.000,'ACTIVE','2026-08-17 09:36:05','2026-08-24 11:45:13'),('3c3d36e4-a109-4e1e-9b4f-379d447f7aab','b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33','Pince multiprise 250mm','QNC-PNC-250','Pince multiprise reglable en acier chrome.','https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop','unite',28.000,5.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('43088269-7b8c-45de-9005-4c4a3d6a07ac',NULL,'Tuyau PVC 50 (barre 6m)','PLB-PVC-50','Tuyau PVC 50 pour evacuation des eaux usees.','https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop','barre',100.000,15.000,'ACTIVE','2026-08-17 09:36:05','2026-08-24 11:45:13'),('45c8ff2d-f246-4ce6-a1bd-e9d3b872ac4e','55c7dd48-b498-49e2-8735-82885876ff36','Sable de riviere (m3)','MTC-SBL-1','Sable de riviere lave pour beton et maconnerie.','https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop','m3',30.000,5.000,'ACTIVE','2026-08-17 09:36:05','2026-08-17 10:35:02'),('50c60692-9256-4890-b2e6-a06022cfe1c1','069c5baf-3e8b-4f6a-a8f5-c391bc83fd2d','Peinture acrylique blanche 10L','PNT-ACR-10','Peinture acrylique blanche mate pour murs.','https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop','pot',40.000,8.000,'ACTIVE','2026-08-17 09:36:05','2026-08-17 10:35:02'),('527116ce-d9a7-4479-9e25-1b8dfa046ea0','069c5baf-3e8b-4f6a-a8f5-c391bc83fd2d','Sous-couche universelle 5L','PNT-SSC-5','Sous-couche universelle pour preparer les surfaces.','https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop','pot',25.000,5.000,'ACTIVE','2026-08-17 09:36:05','2026-08-17 10:35:02'),('57a828e8-d90a-44e2-a02b-9d18b9b7f901','fb9a9898-0e06-4a0f-950e-e13bca63020d','Groupe electrogene diesel 15kVA','GRP-DSL-15','Groupe electrogene diesel 15kVA, demarrage electrique.','https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop','unite',3.000,1.000,'ACTIVE','2026-08-17 09:36:05','2026-08-17 10:35:02'),('5c4c8f45-9c8e-4d17-accf-29da3d4ae5ea',NULL,'Flexible inox 1/2 x 40cm','PLB-FLX-40','Flexible inox tresse 1/2 pour raccordement sanitaire.','https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop','unite',120.000,20.000,'ACTIVE','2026-08-17 09:36:05','2026-08-24 11:45:13'),('6792db60-4242-40df-b2b1-853ece9cbd55',NULL,'Raccord PVC 100 (coude 90)','PLB-RCD-100','Coude PVC 100 a 90 pour evacuation.','https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop','unite',100.000,15.000,'ACTIVE','2026-08-17 09:36:05','2026-08-24 11:45:13'),('683f985d-4664-4212-aa26-6205c82e4bb0','fb9a9898-0e06-4a0f-950e-e13bca63020d','Groupe electrogene diesel 7.5kVA','GRP-DSL-75','Groupe electrogene diesel 7.5kVA, demarrage electrique.','https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop','unite',5.000,1.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('6985d2ef-bcca-45c4-af6a-08aa3124f17d','17f862e5-490d-457c-aed1-c48ed64a692d','├ëquipement de protection chantier','MAT-EPI-01','├ëquipement de protection pour les ├®quipes et interventions terrain.',NULL,'kit',40.000,10.000,'ACTIVE','2026-08-24 10:11:32','2026-08-24 10:13:58'),('6cf02f55-bc03-4928-9b0b-3b07d24691cd','55c7dd48-b498-49e2-8735-82885876ff36','Tole bac acier 2m','MTC-TLE-2','Tole bac acier galvanisee 2m pour toiture.','https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop','unite',80.000,10.000,'ACTIVE','2026-08-17 09:36:05','2026-08-17 10:35:02'),('6d280bba-fe63-42c9-be0d-aabe50c2e6a4','b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33','Marteau de menuisier 500g','QNC-MRT-500','Marteau de menuisier avec manche en bois.','https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop','unite',30.000,5.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('6d7f1495-4ba1-47e9-a4bf-39e07455827f','b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33','Charniere inox 100mm (paire)','QNC-CHR-INOX','Charniere en inox 304, usage interieur et exterieur.','https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop','paire',60.000,10.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('6eb0a5ef-b0cf-4a95-baf2-0808197b740b',NULL,'Raccord PVC 75 (coude 90)','PLB-RCD-75','Coude PVC 75 a 90 pour evacuation.','https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop','unite',150.000,25.000,'ACTIVE','2026-08-17 09:36:05','2026-08-24 11:45:13'),('7170ce4d-09f0-4ba4-b1f6-adc637224cd6','0a493024-eee9-4166-9d39-35e40f502b4d','Cable H200 3x2.5mm2 (rouleau 100m)','CBL-H200-3X25','Cable electrique H200 3 conducteurs 2.5mm2.','https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop','rouleau',30.000,5.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('77505776-790d-4c68-92b8-211bce55971e',NULL,'Tuyau PVC 100 (barre 6m)','PLB-PVC-100','Tuyau PVC 100 pour evacuation principale.','https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop','barre',60.000,10.000,'ACTIVE','2026-08-17 09:36:05','2026-08-24 11:45:13'),('8f43ce88-3f6d-4df7-8306-1cb4de252357','fb9a9898-0e06-4a0f-950e-e13bca63020d','Groupe electrogene diesel 10kVA','GRP-DSL-10','Groupe electrogene diesel 10kVA, demarrage electrique.','https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop','unite',4.000,1.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('93b3184d-914c-410f-ba8e-db4c4bcf5338','b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33','Cadenas acier 50mm','QNC-CDN-50','Cadenas en acier trempe avec 3 cles.','https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop','unite',45.000,8.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('95900c76-fe8c-4a21-9bc0-d8ff3d3e87dd','0a493024-eee9-4166-9d39-35e40f502b4d','Interrupteur simple allumage','CBL-INT-SIMPLE','Interrupteur simple allumage encastrable.','https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop','unite',80.000,15.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('a01aaf44-8049-43c4-8761-2a82028eeec1','55c7dd48-b498-49e2-8735-82885876ff36','Ciment CPJ 42.5 (sac 50kg)','MTC-CIM-425','Ciment CPJ 42.5 pour beton arme et maconnerie.','https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop','sac',200.000,30.000,'ACTIVE','2026-08-17 09:36:05','2026-08-17 10:35:02'),('a1133c0f-3d85-4362-8e80-5215f8ab8d8d','069c5baf-3e8b-4f6a-a8f5-c391bc83fd2d','Enduit de lissage 25kg','PNT-END-25','Enduit de lissage pret a emploi.','https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop','sac',50.000,10.000,'ACTIVE','2026-08-17 09:36:05','2026-08-17 10:35:02'),('a493f297-5b1e-4d70-ab5c-5e4765c91443','069c5baf-3e8b-4f6a-a8f5-c391bc83fd2d','Peinture glycerophtalique 5L','PNT-GLY-5','Peinture glycerophtalique sainee pour boiseries.','https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop','pot',30.000,6.000,'ACTIVE','2026-08-17 09:36:05','2026-08-17 10:35:02'),('b13e7225-dd6b-4d16-ad59-761516c5043d','b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33','Clou acier 60mm (kg)','QNC-CLN-60','Clous en acier doux pour charpente et coffrage.','https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop','kg',80.000,10.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('b423f1af-2854-4ff2-a71c-6ca3195e53bc','b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33','Tournevis cruciforme set 6 pieces','QNC-TRN-6P','Set de 6 tournevis cruciformes et plats.','https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop','set',35.000,5.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('b45e83cf-c63c-4082-8fbb-f1ed21ac92a6',NULL,'Tuyau PVC 75 (barre 6m)','PLB-PVC-75','Tuyau PVC 75 pour evacuation principale.','https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop','barre',80.000,12.000,'ACTIVE','2026-08-17 09:36:05','2026-08-24 11:45:13'),('b4cc8ca0-0814-4c5a-9af9-530aa72da701','069c5baf-3e8b-4f6a-a8f5-c391bc83fd2d','Rouleau a peindre 25cm','PNT-RLP-25','Rouleau a peindre 25cm avec manche.','https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop','unite',45.000,8.000,'ACTIVE','2026-08-17 09:36:05','2026-08-17 10:35:02'),('b9dbdd60-0e71-4aa8-a448-d721e28fd76c','b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33','Vis a bois galvanisees 4x40 (boite de 100)','QNC-VIS-4X40','Vis a bois galvanisees, resistantes a la corrosion.','https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop','boite',150.000,20.000,'ACTIVE','2026-08-17 09:36:03','2026-08-17 10:35:02'),('c07e0e5e-c3b1-472d-b7b1-5cbbd4888f0f','55c7dd48-b498-49e2-8735-82885876ff36','Gravier concasse (m3)','MTC-GRV-1','Gravier concasse 15/25 pour beton.','https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop','m3',25.000,5.000,'ACTIVE','2026-08-17 09:36:05','2026-08-17 10:35:02'),('c7519402-6c6c-4ead-b185-ed723f1576e8','0a493024-eee9-4166-9d39-35e40f502b4d','Cable H200 2x2.5mm2 (rouleau 100m)','CBL-H200-2X25','Cable electrique H200 2 conducteurs 2.5mm2.','https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop','rouleau',40.000,8.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('c7d3bc70-3ac5-483e-8a20-5e62cf70001d',NULL,'Robinet arret 3/4','PLB-RBN-34','Robinet arret laiton 3/4 pour alimentation.','https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop','unite',70.000,12.000,'ACTIVE','2026-08-17 09:36:05','2026-08-24 11:45:13'),('c91be8ed-514f-492f-a863-5db0eec9901e',NULL,'TOIT','Y3GYEU78','',NULL,'kg',0.000,0.000,'ACTIVE','2026-08-17 15:24:03','2026-08-17 15:24:03'),('ca9b27d6-ada5-4be7-b9d7-698ef888d353','55c7dd48-b498-49e2-8735-82885876ff36','Fer a beton 12 (barre 12m)','MTC-FER-12','Fer a beton 12 haute adherence, barre de 12m.','https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop','barre',100.000,15.000,'ACTIVE','2026-08-17 09:36:05','2026-08-17 10:35:02'),('d0ce3a32-fbe2-436a-abab-d8db0d5190cd',NULL,'Raccord PVC 50 (coude 90)','PLB-RCD-50','Coude PVC 50 a 90 pour evacuation.','https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop','unite',200.000,30.000,'ACTIVE','2026-08-17 09:36:05','2026-08-24 11:45:13'),('d3713909-7dd3-4420-ad61-f432ec403f95','0a493024-eee9-4166-9d39-35e40f502b4d','Disjoncteur 32A 2P','CBL-DIS-32A','Disjoncteur modulaire 32A bipolaire.','https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop','unite',40.000,8.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('d67e063f-b2f6-42c6-a637-1987f926a44e','0a493024-eee9-4166-9d39-35e40f502b4d','Disjoncteur 16A 1P','CBL-DIS-16A','Disjoncteur modulaire 16A unipolaire.','https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop','unite',60.000,10.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('d97fc8d6-62cc-40cf-a285-2b7c8ff25a9d','fb9a9898-0e06-4a0f-950e-e13bca63020d','Groupe electrogene essence 2.5kVA','GRP-ESS-25','Groupe electrogene essence 2.5kVA, demarrage manuel.','https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop','unite',10.000,2.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('e00da07f-19e4-4f6b-a728-fdcaecf40829','55c7dd48-b498-49e2-8735-82885876ff36','Fer a beton 8 (barre 12m)','MTC-FER-8','Fer a beton 8 haute adherence, barre de 12m.','https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop','barre',150.000,20.000,'ACTIVE','2026-08-17 09:36:05','2026-08-17 10:35:02'),('e4d37252-1f61-4623-a454-c8da522af4d6','b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33','Cheville universelle 8mm (boite de 50)','QNC-CHV-8','Chevilles universelles nylon pour beton, brique et placoplatre.','https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop','boite',120.000,20.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('e60b7279-7b24-4e4f-a16e-8e2a60741801',NULL,'Siphon lavabo PVC','PLB-SPH-LAV','Siphon lavabo PVC avec tube de vidage.','https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop','unite',60.000,10.000,'ACTIVE','2026-08-17 09:36:05','2026-08-24 11:45:13'),('ea40a920-4f14-470f-937e-1ee11b4d8106','b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33','Boulon hexagonale M8x30 (lot de 50)','QNC-BLT-M8X30','Boulons hexagonaux M8 avec ecrous et rondelles.','https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop','lot',100.000,15.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('ec3d252c-37ac-46e0-baaa-c18b34989eb8','0a493024-eee9-4166-9d39-35e40f502b4d','Cable H200 3x1.5mm2 (rouleau 100m)','CBL-H200-3X15','Cable electrique H200 3 conducteurs 1.5mm2, avec terre.','https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop','rouleau',35.000,6.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('fa881030-efa6-43a9-8a63-84e20e526df7','17f862e5-490d-457c-aed1-c48ed64a692d','Ciment haute r├®sistance','MAT-CIM-50','Sac de ciment pour travaux de construction et de r├®novation.',NULL,'sac',200.000,30.000,'ACTIVE','2026-08-24 10:11:32','2026-08-24 10:13:58'),('fbb230d8-bdfa-472b-9d8a-5d3acb8a5579','fb9a9898-0e06-4a0f-950e-e13bca63020d','Groupe electrogene essence 3.5kVA','GRP-ESS-35','Groupe electrogene essence 3.5kVA, demarrage manuel.','https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop','unite',8.000,2.000,'ACTIVE','2026-08-17 09:36:04','2026-08-17 10:35:02'),('fd00f75c-3124-4237-a15e-62a3b483b0ac','069c5baf-3e8b-4f6a-a8f5-c391bc83fd2d','Pinceau plat 50mm','PNT-PNC-50','Pinceau plat 50mm pour finitions et angles.','https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop','unite',60.000,10.000,'ACTIVE','2026-08-17 09:36:05','2026-08-17 10:35:02');
/*!40000 ALTER TABLE `produits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `promotions` (
  `id` char(36) NOT NULL,
  `produit_id` char(36) DEFAULT NULL,
  `vehicule_id` char(36) DEFAULT NULL,
  `titre` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `prix_normal` decimal(14,2) DEFAULT NULL,
  `prix_promotionnel` decimal(14,2) NOT NULL,
  `commence_le` datetime NOT NULL,
  `termine_le` datetime NOT NULL,
  `statut` enum('DRAFT','ACTIVE','INACTIVE') NOT NULL DEFAULT 'DRAFT',
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `produit_id` (`produit_id`),
  KEY `vehicule_id` (`vehicule_id`),
  CONSTRAINT `promotions_ibfk_1` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE CASCADE,
  CONSTRAINT `promotions_ibfk_2` FOREIGN KEY (`vehicule_id`) REFERENCES `vehicules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reservations` (
  `id` char(36) NOT NULL,
  `client_id` char(36) NOT NULL,
  `vehicule_id` char(36) NOT NULL,
  `reference` varchar(40) NOT NULL,
  `commence_le` datetime NOT NULL,
  `termine_le` datetime NOT NULL,
  `statut` enum('PENDING','CONFIRMED','REJECTED','EXPIRED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `prix_journalier` decimal(14,2) NOT NULL,
  `montant_total` decimal(14,2) NOT NULL,
  `avec_chauffeur` tinyint(1) NOT NULL DEFAULT 0,
  `expire_le` datetime NOT NULL,
  `note_gestionnaire` text DEFAULT NULL,
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `client_id` (`client_id`),
  KEY `reservations_vehicule_id_statut_commence_le_termine_le` (`vehicule_id`,`statut`,`commence_le`,`termine_le`),
  CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`vehicule_id`) REFERENCES `vehicules` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
INSERT INTO `reservations` VALUES ('891939cd-8271-4309-87b9-8ebec88ab3b0','fa515ab8-40ff-44d6-b1ab-94ee851a8290','d6aa2dbf-24d2-4128-b82c-fe6abfff0a3e','RES-DMD-2026-8158','2026-08-18 09:42:45','2026-08-21 09:42:45','CONFIRMED',135000.00,405000.00,0,'2026-08-21 09:42:45','Devis DMD-2026-8158 approuv├® - Devis Panier SOUTARAH','2026-08-18 09:42:45','2026-08-18 09:42:45'),('c4e367f2-c882-4c26-8322-72db4ae1b292','fa515ab8-40ff-44d6-b1ab-94ee851a8290','c07289c4-d708-4ecb-b308-68dfd68f3a1f','RES-2026-6509','2026-08-21 11:32:00','2026-08-23 11:32:00','PENDING',16000.00,32000.00,0,'2026-08-23 11:33:10','Destination: Abidjan','2026-08-21 11:33:10','2026-08-21 11:33:10'),('dc29e24f-8c21-4451-90e3-d9d3b4ae760d','fa515ab8-40ff-44d6-b1ab-94ee851a8290','ed74e06d-05cd-4dee-bbd8-59bf181a41b3','RES-2026-4592','2026-08-21 12:06:31','2026-08-23 12:06:31','CONFIRMED',45000.00,90000.00,0,'2026-08-23 12:06:40','Destination: Abidjan','2026-08-21 12:06:40','2026-08-21 12:11:05');
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequelizemeta`
--

LOCK TABLES `sequelizemeta` WRITE;
/*!40000 ALTER TABLE `sequelizemeta` DISABLE KEYS */;
INSERT INTO `sequelizemeta` VALUES ('20260812000100-initialize-commercial-platform.cjs'),('20260812000200-create-quote-requests.cjs'),('20260813000100-create-vehicle-requests.cjs'),('20260815000100-make-company-responsible-optional.cjs'),('20260815000200-create-settings.cjs'),('20260815000300-add-avatar-url-to-users.cjs'),('20260817000100-add-entreprise-client-type.cjs'),('20260817000200-add-entreprise-client-vehicle-price.cjs'),('20260820000100-add-company-specific-pricing.cjs');
/*!40000 ALTER TABLE `sequelizemeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarifs`
--

DROP TABLE IF EXISTS `tarifs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tarifs` (
  `id` char(36) NOT NULL,
  `produit_id` char(36) NOT NULL,
  `type_client` enum('PARTICULIER','ENTREPRISE','PARTENAIRE','GROSSISTE','ENTREPRISE_CLIENT') NOT NULL,
  `prix` decimal(14,2) NOT NULL,
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `entreprise_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tarifs_produit_client_type_unique` (`produit_id`,`type_client`),
  KEY `tarifs_entreprise_id_foreign_idx` (`entreprise_id`),
  CONSTRAINT `tarifs_entreprise_id_foreign_idx` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tarifs_ibfk_1` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarifs`
--

LOCK TABLES `tarifs` WRITE;
/*!40000 ALTER TABLE `tarifs` DISABLE KEYS */;
INSERT INTO `tarifs` VALUES ('0103293e-cf4a-4668-87d5-5141b6b787b8','45c8ff2d-f246-4ce6-a1bd-e9d3b872ac4e','PARTICULIER',25000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('0359b92f-3178-4e93-ac2c-a6da15555bd0','e00da07f-19e4-4f6b-a728-fdcaecf40829','PARTICULIER',4500.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('1064a4c7-57b6-4bcf-9d22-70ee40662279','fd00f75c-3124-4237-a15e-62a3b483b0ac','PARTICULIER',2000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('18a50e9f-ea21-4c2a-a2cf-56359504a491','14620dac-16b2-4062-8dd1-2fdf3022a7f2','ENTREPRISE',390000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('1a10ef59-2398-4686-80ac-f89805cf26fb','6d280bba-fe63-42c9-be0d-aabe50c2e6a4','PARTICULIER',8000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('1a541b34-1e73-43ad-a35d-22dab8e195f6','23ea8071-f2c7-493a-9158-18e73b5d2b1e','PARTICULIER',800.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('1abf76d2-a642-4f66-b081-cc7fdbad5732','fa881030-efa6-43a9-8a63-84e20e526df7','PARTICULIER',6500.00,'2026-08-24 10:11:32','2026-08-24 10:13:58',NULL),('25134fcb-edc3-4db3-bc23-02511b92cd85','c7519402-6c6c-4ead-b185-ed723f1576e8','ENTREPRISE',38000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('26e935e0-7947-4616-816d-d191cbb69e51','2d7b9c26-1212-4673-af97-a9491f5d99ca','PARTICULIER',25000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('28d53b5a-0028-4df4-9975-4bbee71a063b','3a8db114-22ac-4794-a4b9-74ec29beff6e','PARTICULIER',8000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('2a4afb6c-0eb9-45bf-8589-e92d4e81cce0','d3713909-7dd3-4420-ad61-f432ec403f95','PARTICULIER',12000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('2c7f2113-139a-42d3-a6fa-7e8269e4d017','3af6050b-0ef6-48f1-a873-d0366324c941','PARTICULIER',6000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('2ec30141-86ab-4c32-a63f-339d599ae744','b4cc8ca0-0814-4c5a-9af9-530aa72da701','PARTICULIER',3000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('329a8859-c72a-4477-b0c5-cbfedd7d1298','d97fc8d6-62cc-40cf-a285-2b7c8ff25a9d','PARTICULIER',185000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('353c32d4-05a6-4b42-ada8-eedb88d29931','b4cc8ca0-0814-4c5a-9af9-530aa72da701','ENTREPRISE',2500.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('3b373509-ebf4-491f-a8a9-0f4605c0f52b','d97fc8d6-62cc-40cf-a285-2b7c8ff25a9d','ENTREPRISE',160000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('3bf83aca-8e13-4643-9c7c-97618be2d8ad','6cf02f55-bc03-4928-9b0b-3b07d24691cd','ENTREPRISE',10500.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('3f728c1e-9758-472c-b792-299fb703582e','95900c76-fe8c-4a21-9bc0-d8ff3d3e87dd','ENTREPRISE',2900.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('3f8d0fc1-3952-447e-b282-322875a5532b','b45e83cf-c63c-4082-8fbb-f1ed21ac92a6','ENTREPRISE',15000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('40ae241d-2620-47b1-b5d3-b478bade135a','ca9b27d6-ada5-4be7-b9d7-698ef888d353','ENTREPRISE',8700.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('4119ea40-5cc3-45e8-b249-dabea26cf6d4','3c3d36e4-a109-4e1e-9b4f-379d447f7aab','ENTREPRISE',7500.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('440d5ee4-9c0a-4f3b-aaa7-c421c2428470','6d280bba-fe63-42c9-be0d-aabe50c2e6a4','ENTREPRISE',6800.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('455ee0b1-32e9-4f70-8097-7f5d6b46da4e','c07e0e5e-c3b1-472d-b7b1-5cbbd4888f0f','PARTICULIER',30000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('48436440-3d53-494f-a7f9-23ff7f56c62d','fbb230d8-bdfa-472b-9d8a-5d3acb8a5579','PARTICULIER',250000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('48d4bc83-7bd5-4fe0-9289-6d4e7b02c4e6','45c8ff2d-f246-4ce6-a1bd-e9d3b872ac4e','ENTREPRISE',22000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('4d93965b-5366-44f7-a842-4b5b60c10f9d','527116ce-d9a7-4479-9e25-1b8dfa046ea0','ENTREPRISE',17000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('505f4688-2848-4941-bd8e-2603bfc9d04a','1588473f-d2a6-4e4d-85bd-a1f4ad54b080','ENTREPRISE',29000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('509275d3-1c49-4695-b297-f2f69ef988b3','e4d37252-1f61-4623-a454-c8da522af4d6','PARTICULIER',2000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('5182afae-cdd8-41b0-8d22-938d3517e196','ec3d252c-37ac-46e0-baaa-c18b34989eb8','ENTREPRISE',35000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('51c0b56f-f121-44c1-88b4-d5c4259a5d0d','c07e0e5e-c3b1-472d-b7b1-5cbbd4888f0f','ENTREPRISE',26000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('52f67923-0aec-4f5f-92ef-7b2d1d4aa555','527116ce-d9a7-4479-9e25-1b8dfa046ea0','PARTICULIER',20000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('538c227c-8062-4ca1-ab7a-5dd9c8e9c0c6','b9dbdd60-0e71-4aa8-a448-d721e28fd76c','PARTICULIER',2500.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('54523736-c669-458c-94ac-958884322054','ea40a920-4f14-470f-937e-1ee11b4d8106','ENTREPRISE',3800.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('547947c9-6eb0-4ff2-807e-dae01dafa6f9','50c60692-9256-4890-b2e6-a06022cfe1c1','PARTICULIER',35000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('54faa9bd-364a-45af-83fb-7cebf4245aa0','b13e7225-dd6b-4d16-ad59-761516c5043d','ENTREPRISE',1500.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('5764ab7e-2efb-4943-b9e1-2176d13d79da','3258b44b-5b68-4e5d-9ac4-4ab4cc18031d','ENTREPRISE',1400000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('58d797ad-a933-4730-a4c9-ff2c035bec75','ca9b27d6-ada5-4be7-b9d7-698ef888d353','PARTICULIER',10000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('5b73ecd5-a739-4292-b19a-626d0425b60b','23ea8071-f2c7-493a-9158-18e73b5d2b1e','ENTREPRISE',700.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('5c6ba5b8-0699-4c83-ae2c-501dbb5e2f9c','8f43ce88-3f6d-4df7-8306-1cb4de252357','PARTICULIER',850000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('5e70feae-7f1f-4765-81d8-b0bca9e32e5d','6cf02f55-bc03-4928-9b0b-3b07d24691cd','PARTICULIER',12000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('5e80eeb4-d85d-4069-aff6-fd14fbb43645','93b3184d-914c-410f-ba8e-db4c4bcf5338','PARTICULIER',6000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('5f67fa8c-9489-4f5f-b2f9-1844d838e758','6985d2ef-bcca-45c4-af6a-08aa3124f17d','ENTREPRISE',15500.00,'2026-08-24 10:11:32','2026-08-24 10:13:58',NULL),('63c80a3d-a133-48a8-be2d-0662dd82ec9d','ec3d252c-37ac-46e0-baaa-c18b34989eb8','PARTICULIER',42000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('651cba4f-8d62-49a4-aacd-56edbbe32387','6792db60-4242-40df-b2b1-853ece9cbd55','PARTICULIER',4000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('68193910-67bf-4fce-8403-cb5d75efea1d','8f43ce88-3f6d-4df7-8306-1cb4de252357','ENTREPRISE',730000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('72662a84-48cf-431b-af23-aa20d75149cc','091d3454-76d9-43b9-a640-6f1019c83f2e','ENTREPRISE',2200000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('72d5eb06-d97a-4a07-a535-4a2034e34b2e','a493f297-5b1e-4d70-ab5c-5e4765c91443','ENTREPRISE',24000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('75419363-59cc-4d67-9619-5c940a976f0f','33f08068-90b2-45ac-a363-776320ee34b9','ENTREPRISE',3300.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('77c1670d-d77d-4ae7-9e53-ff0e80d870b3','fbb230d8-bdfa-472b-9d8a-5d3acb8a5579','ENTREPRISE',215000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('7ae77c5f-25af-4d65-b4e7-3ce7551c1473','b13e7225-dd6b-4d16-ad59-761516c5043d','PARTICULIER',1800.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('8183a0cf-44e5-44b2-accc-7c11d9063b2f','6d7f1495-4ba1-47e9-a4bf-39e07455827f','ENTREPRISE',2900.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('8328f02b-e015-4c5a-ad48-871785428338','a493f297-5b1e-4d70-ab5c-5e4765c91443','PARTICULIER',28000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('84685ed5-a808-4b7c-91cc-24aa2845a7b9','a1133c0f-3d85-4362-8e80-5215f8ab8d8d','PARTICULIER',15000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('84f6246f-ae2f-47e9-a75d-0bafa3c24a48','2dfd6c5c-b861-47cb-866b-83f24a4b0288','ENTREPRISE',6500.00,'2026-08-24 10:11:32','2026-08-24 10:13:58',NULL),('866fd703-1dc9-4186-8f31-57036c911356','1f1118c8-12af-45bc-8bf3-5ff1d7a5ca39','ENTREPRISE',8500.00,'2026-08-24 10:11:32','2026-08-24 10:13:58',NULL),('86ce4653-d378-4e3b-ab61-413ffd496448','a01aaf44-8049-43c4-8761-2a82028eeec1','PARTICULIER',6500.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('89469e7d-b37f-4e99-9a2a-7ef73b9c8eb4','3258b44b-5b68-4e5d-9ac4-4ab4cc18031d','PARTICULIER',1600000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('8bf4fd19-a287-4bce-89c9-67a3417bb964','091d3454-76d9-43b9-a640-6f1019c83f2e','PARTICULIER',2500000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('8ea175cd-42cb-47b9-ac66-5cc4aa6f2196','7170ce4d-09f0-4ba4-b1f6-adc637224cd6','ENTREPRISE',46000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('8f6bdd9f-73e9-4e16-8a68-a89dbf36ab45','5c4c8f45-9c8e-4d17-accf-29da3d4ae5ea','PARTICULIER',3500.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('9074c932-910f-4aed-a833-d302a0f07058','3a8db114-22ac-4794-a4b9-74ec29beff6e','ENTREPRISE',6800.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('92b63e05-9520-4ea9-b0f8-71db6d2551bd','5c4c8f45-9c8e-4d17-accf-29da3d4ae5ea','ENTREPRISE',2900.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('93d8d194-fd29-41a9-9896-3fb9774c5dfa','33f08068-90b2-45ac-a363-776320ee34b9','PARTICULIER',4000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('9751942b-74f3-4167-ad69-d2ea6f4eebd8','e60b7279-7b24-4e4f-a16e-8e2a60741801','ENTREPRISE',4200.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('9c8f9b5c-0984-453d-aa61-e2dfeed1e10e','c7d3bc70-3ac5-483e-8a20-5e62cf70001d','ENTREPRISE',6800.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('9d278d96-f64c-432a-ae3b-42af14f53384','14620dac-16b2-4062-8dd1-2fdf3022a7f2','PARTICULIER',450000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('9e996ab2-c1e1-4d63-88b4-142b40336b6e','c91be8ed-514f-492f-a863-5db0eec9901e','PARTICULIER',315.00,'2026-08-17 15:24:03','2026-08-17 15:24:03',NULL),('a0dd2365-4fee-46e5-9378-5f2ef31a04c6','6d7f1495-4ba1-47e9-a4bf-39e07455827f','PARTICULIER',3500.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('a462e9a8-40a0-4d63-b9ca-663b0c526eb1','d67e063f-b2f6-42c6-a637-1987f926a44e','ENTREPRISE',4200.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('a8ea45c6-a1bc-4eed-9e9c-e14a600efda3','7170ce4d-09f0-4ba4-b1f6-adc637224cd6','PARTICULIER',55000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('a93a0813-88fc-4ed1-b572-99c1a652d406','15c352b3-3d99-46e0-8946-be51b6033f0d','PARTICULIER',95000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('afc60fb1-f1f1-49fe-bcb9-2033f4345650','b423f1af-2854-4ff2-a71c-6ca3195e53bc','PARTICULIER',12000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('b02fc830-07d4-4cbf-bb27-a14289d7f8a6','e4d37252-1f61-4623-a454-c8da522af4d6','ENTREPRISE',1700.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('b367bb68-2930-4176-a400-ba31482940cb','1588473f-d2a6-4e4d-85bd-a1f4ad54b080','PARTICULIER',35000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('b57e7698-b379-4e6b-bf4d-6a8cc208a4a0','3af6050b-0ef6-48f1-a873-d0366324c941','ENTREPRISE',5000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('b953723e-8304-4e89-904e-1185cee78aae','43088269-7b8c-45de-9005-4c4a3d6a07ac','PARTICULIER',12000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('b9975ee8-4b2b-4da0-932a-c44e2b0e99ae','d3713909-7dd3-4420-ad61-f432ec403f95','ENTREPRISE',10000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('b9a1465b-688a-4539-984c-a38d0ebd6dad','fa881030-efa6-43a9-8a63-84e20e526df7','ENTREPRISE',5900.00,'2026-08-24 10:11:32','2026-08-24 10:13:58',NULL),('bb2fcc19-664e-4d07-8e4a-b01058da0d3a','93b3184d-914c-410f-ba8e-db4c4bcf5338','ENTREPRISE',5000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('bcf8ba52-9d53-47c1-9c33-54cfd9b792bc','1197bd79-9786-403b-b52b-40385ea4f53c','ENTREPRISE',6100.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('be0c5856-3560-4f99-8144-00f376a5066f','77505776-790d-4c68-92b8-211bce55971e','PARTICULIER',25000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('c0422c27-30bd-421c-927d-c3c845c42297','b9dbdd60-0e71-4aa8-a448-d721e28fd76c','ENTREPRISE',2100.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('c09ead37-2969-4d4d-a465-3bf0a207714f','a1133c0f-3d85-4362-8e80-5215f8ab8d8d','ENTREPRISE',12500.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('c15e6da3-03de-41b8-9d14-28979a62325a','683f985d-4664-4212-aa26-6205c82e4bb0','ENTREPRISE',560000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('c5e385c0-d1a4-4ad8-9e93-cf2e09224558','6eb0a5ef-b0cf-4a95-baf2-0808197b740b','ENTREPRISE',2100.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('c7374026-b2c7-4104-bce0-a86f728c8851','77505776-790d-4c68-92b8-211bce55971e','ENTREPRISE',21000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('c83fd00c-dd8b-4631-892d-e09a3ac7358f','a01aaf44-8049-43c4-8761-2a82028eeec1','ENTREPRISE',5900.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('c9f6aa7d-fee2-4935-89f7-c3fa642d2d7c','15c352b3-3d99-46e0-8946-be51b6033f0d','ENTREPRISE',80000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('cbdf1d20-5513-4dfe-b0dd-ccccb85957bd','57a828e8-d90a-44e2-a02b-9d18b9b7f901','PARTICULIER',1200000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('d08b2156-0eb1-4071-adaa-c7474868ecfd','b45e83cf-c63c-4082-8fbb-f1ed21ac92a6','PARTICULIER',18000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('d1768120-d827-4712-a2db-1873233886cc','c7d3bc70-3ac5-483e-8a20-5e62cf70001d','PARTICULIER',8000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('d1ebcb2c-0377-4b96-932b-38432aa5756c','d67e063f-b2f6-42c6-a637-1987f926a44e','PARTICULIER',5000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('d3b2d024-4967-45e4-a834-3353193291a2','b423f1af-2854-4ff2-a71c-6ca3195e53bc','ENTREPRISE',10000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('d869707b-9f86-42f6-8e44-9e86b52c73d7','e60b7279-7b24-4e4f-a16e-8e2a60741801','PARTICULIER',5000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('d9f2454a-f26d-4b8b-98a3-09edc89205d0','3c3d36e4-a109-4e1e-9b4f-379d447f7aab','PARTICULIER',9000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('de430f15-3d75-436a-92c6-b93de9fb64c0','ea40a920-4f14-470f-937e-1ee11b4d8106','PARTICULIER',4500.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('e1c4d2ac-f9a7-412b-9779-a422fa1cbd3a','50c60692-9256-4890-b2e6-a06022cfe1c1','ENTREPRISE',29000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('e292bbee-ef6c-41d7-be4c-6ec4a5fa3602','95900c76-fe8c-4a21-9bc0-d8ff3d3e87dd','PARTICULIER',3500.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('e337194a-f85f-4356-bb94-af9cdbaca4c3','1f1118c8-12af-45bc-8bf3-5ff1d7a5ca39','PARTICULIER',10000.00,'2026-08-24 10:11:32','2026-08-24 10:13:58',NULL),('e38b446d-f05c-4f0d-82c2-ac779ac72179','2dfd6c5c-b861-47cb-866b-83f24a4b0288','PARTICULIER',7500.00,'2026-08-24 10:11:32','2026-08-24 10:13:58',NULL),('e4ca8e0b-aea4-41ed-85ee-319b1f094e69','c7519402-6c6c-4ead-b185-ed723f1576e8','PARTICULIER',45000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('e8d260a4-992a-4abe-9e1b-1bcadf6ce83a','43088269-7b8c-45de-9005-4c4a3d6a07ac','ENTREPRISE',10000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('e8d5f415-59d3-4e01-858c-41a6a9b8bf84','6792db60-4242-40df-b2b1-853ece9cbd55','ENTREPRISE',3400.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('ed6c90c6-4b55-4d48-9435-7ae0234322e3','6eb0a5ef-b0cf-4a95-baf2-0808197b740b','PARTICULIER',2500.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('ee96ed9b-ab41-4506-835b-6ba49b266a00','d0ce3a32-fbe2-436a-abab-d8db0d5190cd','PARTICULIER',1500.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('eee3bc64-9d80-455a-afa8-72bd6394f03c','d0ce3a32-fbe2-436a-abab-d8db0d5190cd','ENTREPRISE',1200.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('ef54a907-73dc-451b-b8b1-2d4851f8e299','c91be8ed-514f-492f-a863-5db0eec9901e','ENTREPRISE_CLIENT',2929.00,'2026-08-17 15:24:03','2026-08-17 15:24:03',NULL),('f30d6801-3798-4cc9-b225-e89c489796bf','6985d2ef-bcca-45c4-af6a-08aa3124f17d','PARTICULIER',18000.00,'2026-08-24 10:11:32','2026-08-24 10:13:58',NULL),('f400ba37-fafd-4d50-9773-b66276f58271','2d7b9c26-1212-4673-af97-a9491f5d99ca','ENTREPRISE',21000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('f4045560-c67d-4f6c-920e-e397cea41acc','683f985d-4664-4212-aa26-6205c82e4bb0','PARTICULIER',650000.00,'2026-08-17 09:36:04','2026-08-17 09:36:04',NULL),('f47cf193-c496-4279-b85c-c4534f96c3e2','e00da07f-19e4-4f6b-a728-fdcaecf40829','ENTREPRISE',3900.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('fa7efdc2-e3f2-4348-a787-ea42af63df6f','fd00f75c-3124-4237-a15e-62a3b483b0ac','ENTREPRISE',1700.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('fa9ea621-efeb-487a-9409-0c95166dede4','1197bd79-9786-403b-b52b-40385ea4f53c','PARTICULIER',7000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL),('faa89ee2-ec16-46e4-940b-9011ae46ae5b','57a828e8-d90a-44e2-a02b-9d18b9b7f901','ENTREPRISE',1050000.00,'2026-08-17 09:36:05','2026-08-17 09:36:05',NULL);
/*!40000 ALTER TABLE `tarifs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `utilisateurs` (
  `id` char(36) NOT NULL,
  `email` varchar(254) NOT NULL,
  `telephone` varchar(32) DEFAULT NULL,
  `mot_de_passe_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','MANAGER','CLIENT') NOT NULL DEFAULT 'CLIENT',
  `est_actif` tinyint(1) NOT NULL DEFAULT 1,
  `derniere_connexion_au` datetime DEFAULT NULL,
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `avatar_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `telephone` (`telephone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utilisateurs`
--

LOCK TABLES `utilisateurs` WRITE;
/*!40000 ALTER TABLE `utilisateurs` DISABLE KEYS */;
INSERT INTO `utilisateurs` VALUES ('33582ee1-d5fd-438e-88fa-8326a27078a3','client@soutarah.local','0700000001','$2b$10$YuKyfoZVrvJhjqOOoZqmo.4Oj4/1i5P61eR2Ajd4rj6P7P8Qtucfe','CLIENT',1,'2026-08-24 10:50:39','2026-08-24 10:11:21','2026-08-24 10:50:39',NULL),('3bfb915a-ac0c-45bb-b02e-20a28a5e57ed','client.legacy.1@soutarahgroup.com','+2250700000001','$2a$10$wT8fS3L9d.hL0bQ1jW3N.u6g8nZ0wX1Y2Z3a4b5c6d7e8f9g0h1i2','CLIENT',1,NULL,'2026-08-24 11:44:12','2026-08-24 11:44:12',NULL),('44772e8b-0513-4046-b94a-dd60d14b7c89','sucaf@gmail.com','070000003','$2b$10$YuKyfoZVrvJhjqOOoZqmo.4Oj4/1i5P61eR2Ajd4rj6P7P8Qtucfe','CLIENT',1,'2026-08-24 11:01:46','2026-08-18 10:02:06','2026-08-24 11:01:46',NULL),('4e9d5375-9fa8-11f1-83ff-c1566a142374','admin@gmail.com','0182633839','$2b$10$YuKyfoZVrvJhjqOOoZqmo.4Oj4/1i5P61eR2Ajd4rj6P7P8Qtucfe','ADMIN',1,'2026-08-24 11:00:43','2026-08-24 10:41:04','2026-08-24 11:00:43','/uploads/avatars/avatar-4e9d5375-1787568472515.png'),('5f1f291d-0fad-494b-bffb-9af5b9e14732','client.legacy.2@soutarahgroup.com','+2250700000002','$2a$10$wT8fS3L9d.hL0bQ1jW3N.u6g8nZ0wX1Y2Z3a4b5c6d7e8f9g0h1i2','CLIENT',1,NULL,'2026-08-24 11:44:12','2026-08-24 11:44:12',NULL),('c7cd9b37-f317-45cd-bbd6-f5384fc43fcb','sorhodavid31@gmail.com','0700000002','$2b$10$YuKyfoZVrvJhjqOOoZqmo.4Oj4/1i5P61eR2Ajd4rj6P7P8Qtucfe','CLIENT',1,'2026-08-24 11:01:19','2026-08-24 10:11:22','2026-08-24 11:01:19',NULL);
/*!40000 ALTER TABLE `utilisateurs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicule_prix_entreprises`
--

DROP TABLE IF EXISTS `vehicule_prix_entreprises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehicule_prix_entreprises` (
  `id` char(36) NOT NULL,
  `vehicule_id` char(36) NOT NULL,
  `entreprise_id` char(36) NOT NULL,
  `prix_journalier` decimal(14,2) NOT NULL,
  `cree_le` datetime NOT NULL DEFAULT current_timestamp(),
  `mis_a_jour_le` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `vehicule_prix_entreprises_vehicule_id_entreprise_id` (`vehicule_id`,`entreprise_id`),
  KEY `entreprise_id` (`entreprise_id`),
  CONSTRAINT `vehicule_prix_entreprises_ibfk_1` FOREIGN KEY (`vehicule_id`) REFERENCES `vehicules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `vehicule_prix_entreprises_ibfk_2` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicule_prix_entreprises`
--

LOCK TABLES `vehicule_prix_entreprises` WRITE;
/*!40000 ALTER TABLE `vehicule_prix_entreprises` DISABLE KEYS */;
/*!40000 ALTER TABLE `vehicule_prix_entreprises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicules`
--

DROP TABLE IF EXISTS `vehicules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehicules` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicules`
--

LOCK TABLES `vehicules` WRITE;
/*!40000 ALTER TABLE `vehicules` DISABLE KEYS */;
INSERT INTO `vehicules` VALUES ('040ea665-a5c3-44fb-9a94-84332fcf1d9b','Citro├½n','Jumper 12 Places','Minibus','12 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',12,'Essence','Manuel',62000.00,62000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('043c2c74-2e15-4fd9-8a01-e17a6459a192','Porsche','Cayenne','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/porsche_cayenne.jpg',5,'Essence','Automatique',200000.00,200000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('04fce10d-e478-4e56-b125-4d8d67219b5b','Iveco','Daily','Utilitaires','10 places assises ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/ford1.jpg',10,'Essence','Manuel',45000.00,45000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('0a8307cc-4c1d-4a7d-bb40-97b96b8cfdb0','Suzuki','Grand Vitara New','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/ngvitaraav.jpeg',5,'Essence','Automatique',40541.00,40541.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('0c67cb5e-9b4b-4164-b6b9-db7673c71e4c','Mercedes','Sprinter','Utilitaires','10 places assises ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/mercedes_sprinter.jpg',10,'Essence','Manuel',50000.00,50000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:44',NULL),('0d85c07b-55bb-4ca5-bf8c-b5458d3e44a3','Nissan','Urvan','Minibus','15 places assises ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/urvan1.jpeg',15,'Essence','Automatique',70000.00,70000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('1085a956-2c2c-4fd7-8ee5-66e20437fd61','Renault','Dokker','Utilitaires','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/dokker.jpg',5,'Essence','Manuel',30000.00,30000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:25:44',30000.00),('114f029e-1447-4831-b8d1-4a3c164ab47c','Land','Rover Discovery','4x4','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/land_rover_discovery.jpg',7,'Essence','Automatique',130000.00,130000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('117ae849-935d-45e4-aef6-87dbfaed82aa','BMW','S├®rie 5','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/bmw_530i.jpg',5,'Essence','Automatique',160000.00,160000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('1389f6f9-ab22-49a3-8d6e-c3424e7f08f8','Isuzu','D-Max','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/dmaxav.png',5,'Essence','Manuel',55000.00,55000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',55000.00),('15dbf702-f610-4da9-b9dc-4b8a25e4bfec','BMW','X5','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/bmw_x5.jpg',5,'Essence','Automatique',170000.00,170000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('16f55399-fc68-48b8-a27a-89ec562f63a9','Toyota','Tacoma','Pick-Up','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/tacomaav.jpeg',5,'Essence','Automatique',50000.00,50000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:25:44',50000.00),('18bd2d44-0a0b-4896-9056-a941527a4cde','Lexus','RX','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/lexus_rx.jpg',5,'Essence','Automatique',140000.00,140000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('254c137b-5f2b-4011-86be-ec5126ce3c95','Suzuki','Vitara Rouge','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/vitaraAvant.jpg',5,'Essence','Automatique',35000.00,35000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('2613a036-8767-4384-ab4c-523ff99a5a2a','Nissan','Navara','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/nissan_navara.jpg',5,'Essence','Manuel',58000.00,58000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('2721fc0f-1879-49f5-bd36-adebc7c3ee43','Volkswagen','Passat R-Line','Berline','5 personnes ÔÇó Automatique ÔÇó Qualit├® Allemande','/img/vehicles/vw_passat.jpg',5,'Essence','Automatique',42000.00,42000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('2a3c0766-26ad-4aa8-9e09-38aa575fb9c3','Renault','Duster','Citadines','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/dusterAvant.jpg',5,'Essence','Automatique',30000.00,30000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('2a99fb07-f98a-4f9e-b4e7-c7b8a1fff1f0','Tesla','Model 3 Long Range','Berline','5 personnes ÔÇó Automatique ÔÇó 100% ├ëlectrique','/img/vehicles/tesla_model3.jpg',5,'Essence','Automatique',60000.00,60000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('2afc956b-e48b-4345-b255-c3d8a574392d','Toyota','Highlander','4x4','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/high.jpeg',7,'Essence','Automatique',55000.00,55000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('2b9d169a-216f-4cf0-ab60-0f1e820fd69f','Toyota','Tacoma','Pick-Up','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/tacomaav.jpeg',5,'Essence','Automatique',50000.00,50000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('2d111d35-2ff1-4896-95f9-64ae28361c15','Renault','Master','Utilitaires','10 places assises ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/renault_master.jpg',10,'Essence','Manuel',42000.00,42000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('2df23098-048b-4e06-a3fb-fb36d4f57b3c','Foton','Tunland','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/toyota_hilux.jpg',5,'Essence','Manuel',50000.00,50000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('31b5bc9a-34b6-4934-8e56-4002fdd5c1f9','Citro├½n','Jumper','Utilitaires','3 places assises ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/jumperav.jpeg',3,'Essence','Automatique',30000.00,30000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('3209ca3c-519a-4381-b285-a32b62a9e535','Hyundai','20 Places','Autocar','20 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',20,'Essence','Manuel',110000.00,110000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('3339bf73-f50c-409d-9c25-2d20501a056f','Renault','Koleos','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/koleosAv.jpeg',5,'Essence','Automatique',40500.00,40500.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('3533cf25-4311-4a29-97f2-cb2b7a71f66a','Renault','Kadjar','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/kadjaravant.jpeg',5,'Essence','Automatique',40541.00,40541.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('370fabcf-893f-49a2-9458-ed39b1c56e6d','JAC','T8','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/toyota_hilux.jpg',5,'Essence','Manuel',52000.00,52000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('37abace8-40d2-42f8-aa28-f856f187dc01','Audi','A4 TFSI','Berline','5 personnes ÔÇó Automatique ÔÇó Cuir & GPS','/img/vehicles/audi_a4.jpg',5,'Essence','Automatique',48000.00,48000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('3896ebf8-410e-41a8-a3c1-dac12bc98c87','Kia','Cerato Sedan','Berline','5 personnes ÔÇó Automatique ÔÇó Pratique & Confort','/img/vehicles/kia_cerato.jpg',5,'Essence','Automatique',26000.00,26000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('392884a8-36cc-45cd-a7f4-ef440454ac1d','Nissan','Kicks','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/KickAvant.jpeg',5,'Essence','Automatique',40500.00,40500.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('39e9806a-46d1-43a2-8296-b4172f929216','Mercedes-Benz','Classe S 500','Berline','5 personnes ÔÇó Automatique ÔÇó Luxe & Chauffeur','/img/vehicles/mercedes_s500.jpg',5,'Essence','Automatique',150000.00,150000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('3b713b91-a7d9-44c2-910e-a5a60a6d9de2','Peugeot','Partner','Utilitaires','3 places assises ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/peugeot_partner.jpg',3,'Essence','Manuel',28000.00,28000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('3df4671b-7b18-4ac7-a75c-73c4e7e7305e','Honda','Civic Sedan','Berline','5 personnes ÔÇó Automatique ÔÇó ├ëconomique','/img/vehicles/honda_civic.jpg',5,'Essence','Automatique',28000.00,28000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('3e86b65c-cbf5-4de2-b73b-7435d98bdfb1','Toyota','Yaris','Citadines','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/toyota_yaris.jpg',5,'Essence','Automatique',20000.00,20000.00,0,'ACTIVE','2026-08-20 10:43:55','2026-08-22 11:13:41',NULL),('4420c34f-aca5-4144-b2da-466be1e70b4a','Toyota','Hiace 15 Places','Minibus','15 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',15,'Essence','Manuel',90000.00,90000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('44772273-cfec-45c7-b046-d9a2db1a4081','Nissan','Urvan','Minibus','15 places assises ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/urvan1.jpeg',15,'Essence','Automatique',70000.00,70000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:25:44',70000.00),('44e9a0da-5d31-43a2-a212-b26ad449ddcf','Dongfeng','Rich','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/toyota_hilux.jpg',5,'Essence','Manuel',48000.00,48000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('454133d2-8ae4-4ca1-82e2-46ec124fef32','Kia','Rio','Citadines','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/kia_rio.jpg',5,'Essence','Automatique',25000.00,25000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('4609e2c7-efc9-4f01-b86f-c1546939494d','Nissan','Kicks','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/KickAvant.jpeg',5,'Essence','Automatique',40500.00,40500.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',40500.00),('46af74be-b9bf-4cf7-adbf-de91bf68deeb','Audi','A6','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/audia6.jpg',5,'Essence','Automatique',155000.00,155000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('4746a084-4fbd-48e7-8ff8-96f7b6f125aa','Suzuki','Grand Vitara 755','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/ngvitaraav.jpeg',5,'Essence','Automatique',40541.00,40541.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',40541.00),('4a60d8e0-cba4-40e1-ab7c-6311889fb8ff','Toyota','Vitz','Citadines','5 personnes ÔÇó Automatique ÔÇó Assur├®e','https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',5,'Essence','Automatique',20700.00,20700.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('4a940280-1fc6-484d-aad3-9bc4d3d87a06','Mitsubishi','L200 New','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/l200av.jpg',5,'Essence','Manuel',52000.00,52000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('4cce2c17-b16d-4ce2-ab60-d27b736c8bc6','Lexus','LS 500','Berline','5 personnes ÔÇó Automatique ÔÇó Prestige Japonais','/img/vehicles/lexus_ls.jpg',5,'Essence','Automatique',130000.00,130000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('4e43eb9b-247d-47b2-ae49-36e5bf73e8ce','Mitsubishi','Pajero 48','4x4','4 personnes ÔÇó Automatique ÔÇó Assur├®e','https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',4,'Essence','Automatique',50000.00,50000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('4f8d9996-82f9-47af-a6ad-a56bb5a8ad8c','Mitsubishi','Pajero Sport','4x4','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/pajero_sport.jpg',7,'Essence','Automatique',80000.00,80000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('4fae96e5-9e84-49f0-8182-88fc5d57526f','Jaguar','XF Portfolio','Berline','5 personnes ÔÇó Automatique ÔÇó Chic Britannique','/img/vehicles/jaguar_xf.jpg',5,'Essence','Automatique',90000.00,90000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('5307920d-69fa-4d19-ae7b-bc410206018f','Mitsubishi','L200','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/l200av.jpg',5,'Essence','Manuel',51000.00,51000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',51000.00),('54178fa3-e192-412f-baa4-924c029d1e7a','Ford','Transit','Utilitaires','10 places assises ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/ford1.jpg',10,'Essence','Manuel',40000.00,40000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('55610d52-f970-4880-8d62-ed1074042aca','Nissan','Patrol','4x4','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/nissan_patrol.jpg',7,'Essence','Automatique',110000.00,110000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('57f4f0d3-5d43-4b1b-b9ea-7cf5613b51ad','Toyota','Highlander','4x4','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/high.jpeg',7,'Essence','Automatique',55000.00,55000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',55000.00),('59317da0-b0dd-4ac2-ab50-51198cca0238','Volvo','9700','Autocar','55 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',55,'Essence','Manuel',220000.00,220000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('59d37a04-9969-4603-be25-bbf21549ace9','Hyundai','28 Places','Autocar','28 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',28,'Essence','Manuel',125000.00,125000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',125000.00),('5a61ad1a-4daa-4b14-b316-57b5d5a4c170','Mazda','CX-5','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/mazda_cx5.jpg',5,'Essence','Automatique',47000.00,47000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('5b4caebb-b912-4af0-952c-0f54e273e0e0','Genesis','G80 Luxury','Berline','5 personnes ÔÇó Automatique ÔÇó VIP Affaires','/img/vehicles/genesis_g80.jpg',5,'Essence','Automatique',80000.00,80000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('5b9c986d-aa03-47b6-8feb-3ff9fbcbf468','Renault','Trafic 9 Places','Minibus','9 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',9,'Essence','Manuel',65000.00,65000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('5cc7a6d1-fd9b-4a6e-b3ce-38a1349051f9','Suzuki','Grand Vitara 932','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/gvitaraAv.jpeg',5,'Essence','Automatique',40501.00,40501.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('5e2da444-9dc9-4db3-9fbd-50268f5d0dcd','Ford','Transit 16 Places','Minibus','16 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/ford1.jpg',16,'Essence','Manuel',85000.00,85000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:44',NULL),('5f25a6e4-5e00-4012-acfe-241dc28dcc59','Toyota','Fortuner','Luxe','7 personnes ÔÇó Automatique ÔÇó Assur├®e','https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',7,'Essence','Automatique',113739.00,113739.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('5fc83db7-9171-4c47-8a8e-3eb508c0fcbc','Nissan','Urvan 14 Places','Minibus','14 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/urvan1.jpeg',14,'Essence','Manuel',75000.00,75000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:44',NULL),('620ac8a9-2a7f-4f56-9ad2-1c0254a1f9cb','Honda','CR-V','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/honda_crv.jpg',5,'Essence','Automatique',48000.00,48000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('62552652-ee96-4374-8a1a-65cdd933550c','Ford','Ranger 4x4','4x4','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/ford_ranger.jpg',5,'Essence','Manuel',65000.00,65000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('641ef6f2-e7c2-482e-a921-5780b77804f3','Scania','Irizar','Autocar','50 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',50,'Essence','Manuel',210000.00,210000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('64e7bfb6-e267-420a-99b4-4a2272f1ddfa','Volkswagen','Crafter','Utilitaires','10 places assises ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/vw_crafter.jpg',10,'Essence','Manuel',48000.00,48000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('66e5b302-956d-46cc-a703-7439e24375f8','Mercedes','Tourismo','Autocar','50 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',50,'Essence','Manuel',200000.00,200000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('68b7bb42-b388-4a2a-b238-66e63990befa','Hyundai','H350','Minibus','15 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',15,'Essence','Manuel',90000.00,90000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('68bc145a-3cd3-47e4-be33-607ecd987989','Renault','Duster','Citadines','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/dusterAvant.jpg',5,'Essence','Automatique',30000.00,30000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',30000.00),('6c3ca9fa-e716-439d-98f1-41aef5070ead','Range','Rover','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/range_rover.jpg',5,'Essence','Automatique',180000.00,180000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('6cb2e2c1-e7eb-476f-a1f2-f7d7696c20be','MAN','Lion Coach','Autocar','50 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',50,'Essence','Manuel',200000.00,200000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('6e83971b-4f8c-4a18-a617-595e3fd291b8','Suzuki','Grand Vitara New','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/ngvitaraav.jpeg',5,'Essence','Automatique',40541.00,40541.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',40541.00),('6fcf77a6-482f-4cc9-92ce-8b25eafb07e4','Renault','OROCH','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/orochav.jpeg',5,'Essence','Manuel',30000.00,30000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('700e8fb8-d963-4da1-8b37-4bc49d3320ca','Ford','Transit','Utilitaires','10 places assises ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/ford1.jpg',10,'Essence','Manuel',40000.00,40000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:25:44',40000.00),('73729ae2-104c-4309-b51b-36cd78872232','Hyundai','28 Places','Autocar','28 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',28,'Essence','Manuel',125000.00,125000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('740d176f-6f00-49ee-92ef-32aebb8becd2','Peugeot','508 GT','Berline','5 personnes ÔÇó Automatique ÔÇó Design Fran├ºais','/img/vehicles/peugeot508.jpg',5,'Essence','Automatique',45000.00,45000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('74505ffb-68b1-4896-be29-cd2fa253411c','Isuzu','D-Max','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/dmaxav.png',5,'Essence','Manuel',55000.00,55000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('746ed7ab-a041-4d0f-959c-69de9648f3b6','Kia','Picanto','Citadines','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/kia_picanto.jpg',5,'Essence','Automatique',17000.00,17000.00,0,'ACTIVE','2026-08-20 10:43:55','2026-08-22 11:13:41',NULL),('7795d366-d86f-4ef1-910b-aafa91c9f635','Nissan','Maxima Platinum','Berline','5 personnes ÔÇó Automatique ÔÇó Moteur V6 Sport','/img/vehicles/nissan_maxima.jpg',5,'Essence','Automatique',45000.00,45000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('7bb4953c-ee8c-4b58-ac93-b22a5a1fe95c','Toyota','Land Cruiser','Luxe','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/l300.jpeg',7,'Essence','Automatique',190000.00,190000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('7eb907a8-bd77-4fea-b733-cf9727dbec58','Audi','A6 Quattro','Berline','5 personnes ÔÇó Automatique ÔÇó Executive Class','/img/vehicles/audia6.jpg',5,'Essence','Automatique',70000.00,70000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('7f438f4d-4c44-4a76-8261-dd3bef656728','Toyota','RAV4','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/rav4avant.jpeg',5,'Essence','Automatique',45000.00,45000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('82a9ce83-14f2-4705-9ad7-b322836a0b5d','Volkswagen','Polo','Citadines','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/vw_polo.jpg',5,'Essence','Automatique',23000.00,23000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('830abfd1-ca69-4b76-9cfe-419c30cb486b','Hyundai','i10','Citadines','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/hyundai_i10.jpg',5,'Essence','Manuel',18000.00,18000.00,0,'ACTIVE','2026-08-20 10:43:55','2026-08-22 11:13:41',NULL),('890ced86-8cf1-4499-b227-2257ad5a94f5','King','Long XMQ6127','Autocar','55 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',55,'Essence','Manuel',175000.00,175000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('89dda94e-ff73-4a68-b464-fe5fcd7549b8','Suzuki','Fronx','Citadines','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/fronxav.jpeg',5,'Essence','Automatique',30000.00,30000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',30000.00),('89fba576-be5a-4ada-8595-6f2afd0d77e3','Isuzu','D-Max New','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/dmaxav.png',5,'Essence','Manuel',55000.00,55000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',55000.00),('8a6ea387-baf7-4a21-be5c-4d94e3ef7948','Hyundai','Accent','Citadines','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/hyundai_accent.jpg',5,'Essence','Automatique',24000.00,24000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('8a9bc283-7281-4dc7-9ac3-58a1e33502c5','Mercedes-Benz','Classe E','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/mercedes_e300.jpg',5,'Essence','Automatique',150000.00,150000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('8b4ccc88-07c9-477a-aab4-a1384385cfcf','Volvo','S90 Inscription','Berline','5 personnes ÔÇó Automatique ÔÇó S├®curit├® Maximale','/img/vehicles/volvo_s90.jpg',5,'Essence','Automatique',85000.00,85000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('8c672198-1562-4523-90fe-d11ac7e8cf66','Suzuki','Dzire','Citadines','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/dzer.jpg',5,'Essence','Automatique',25000.00,25000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('8cf379b4-ad0f-4281-a866-a52c20d0c9d0','Mitsubishi','Pajero 13','4x4','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/pajeroav.jpeg',7,'Essence','Automatique',55000.00,55000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('90655bca-9622-4741-9b98-60613efba5cf','Isuzu','D-Max New','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/dmaxav.png',5,'Essence','Manuel',55000.00,55000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('930da43e-e110-48ba-b16c-d6725e7654d4','Peugeot','Boxer 10 Places','Minibus','10 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',10,'Essence','Manuel',60000.00,60000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('93537fa3-c6e5-49e0-9b97-ee60951f563b','Renault','OROCH','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/orochav.jpeg',5,'Essence','Manuel',30000.00,30000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',30000.00),('93ff833e-dd61-4f12-9129-14b5ec676b4b','Peugeot','3008','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/peugeot_3008.jpg',5,'Essence','Automatique',44000.00,44000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('94aa9d6b-7349-42b5-a217-e265ef4a92dd','Hyundai','Sonata Limited','Berline','5 personnes ÔÇó Automatique ÔÇó ├ëcran Panoramique','/img/vehicles/hyundai_sonata.jpg',5,'Essence','Automatique',35000.00,35000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('974f86f5-36d6-423f-b2c0-8ac9b5904197','Mahindra','Pik Up','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/toyota_hilux.jpg',5,'Essence','Manuel',45000.00,45000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('9781c400-55e7-4c26-b336-3bab186d7aeb','Mercedes-Benz','Classe C 200','Berline','5 personnes ÔÇó Automatique ÔÇó Climatis├®e & Assur├®e','/img/vehicles/c200.jpg',5,'Essence','Automatique',50000.00,50000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('9defb13e-30cd-4588-b7dd-2c2a1d94ece7','Mercedes','Sprinter 18 Places','Minibus','18 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/mercedes_sprinter.jpg',18,'Essence','Manuel',95000.00,95000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:44',NULL),('9fca1657-6164-47c8-96c1-419a210b4cc6','Nissan','Altima SL','Berline','5 personnes ÔÇó Automatique ÔÇó Zero Gravity Seats','/img/vehicles/nissan_altima.jpg',5,'Essence','Automatique',35000.00,35000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('a10104e9-ffb9-454a-bd2e-5ca5f38e0d27','Higer','A30','Autocar','50 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',50,'Essence','Manuel',165000.00,165000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('a434bb28-3c85-4c85-9cdc-a776d083beac','Fiat','Doblo','Utilitaires','3 places assises ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/fiat_doblo.jpg',3,'Essence','Manuel',29000.00,29000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('a4496638-2064-4f12-8b2d-6e4e018f2520','Hyundai','20 Places','Autocar','20 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',20,'Essence','Manuel',110000.00,110000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',110000.00),('a5299f86-ec20-40d1-9c1e-f53ba3c72071','Ford','Transit 9 Places','Minibus','9 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/ford1.jpg',9,'Essence','Manuel',70000.00,70000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:25:44',70000.00),('a5be804d-b19e-4271-99e0-c688d8b7a95b','Volkswagen','Jetta Highline','Berline','5 personnes ÔÇó Automatique ÔÇó Sobri├®t├®','/img/vehicles/vw_jetta.jpg',5,'Essence','Automatique',28000.00,28000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('a7243db8-091b-4bfc-9c1c-891b656ea818','Citro├½n','Jumper','Utilitaires','3 places assises ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/jumperav.jpeg',3,'Essence','Automatique',30000.00,30000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:25:44',30000.00),('a7720ffc-5fae-4317-95d4-42c49b59acb6','BMW','S├®rie 5 530i','Berline','5 personnes ÔÇó Automatique ÔÇó ├ël├®gance Premium','/img/vehicles/bmw_530i.jpg',5,'Essence','Automatique',75000.00,75000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('aa2a66ae-6e52-442e-a5ce-f138355260a5','Toyota','Fortuner 4x4','4x4','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/fortuner.jpg',7,'Essence','Automatique',85000.00,85000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('ac470593-2189-4301-9cd9-49bfd93cb65e','Mitsubishi','Montero','4x4','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/monteraav.jpeg',5,'Essence','Automatique',50000.00,50000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',50000.00),('ac7f6acd-ef06-40ee-b5c2-fea95043f7f4','Nissan','Micra','Citadines','5 personnes ÔÇó Automatique ÔÇó Assur├®e','https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',5,'Essence','Automatique',27820.00,27820.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('ac8c125b-4164-4461-bc48-13fee7255857','Dongfeng','Friday','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/toyota_hilux.jpg',5,'Essence','Manuel',60000.00,60000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:25:20',60000.00),('acab5c3c-25ca-4dcb-b024-a40298ad7167','Renault','Clio','Citadines','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/renault_clio.jpg',5,'Essence','Manuel',21000.00,21000.00,0,'ACTIVE','2026-08-20 10:43:55','2026-08-22 11:13:41',NULL),('afd5d2dd-e18c-4b72-ab84-f5b8474f3a2e','Suzuki','Fronx','Citadines','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/fronxav.jpeg',5,'Essence','Automatique',30000.00,30000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('b008697a-b949-4691-9d89-a3b5f17d96dd','Honda','Accord Touring','Berline','5 personnes ÔÇó Automatique ÔÇó Spacieuse','/img/vehicles/honda_accord.jpg',5,'Essence','Automatique',38000.00,38000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('b241946e-8aa0-4d48-b3de-cd713b2d46a9','Iveco','Daily 20 Places','Minibus','20 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',20,'Essence','Manuel',100000.00,100000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('b2d1a840-5d09-41e2-875f-0fed0f9d6d86','Ford','Ranger','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/ford_ranger.jpg',5,'Essence','Manuel',60000.00,60000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('b2db1018-be1a-40e0-b208-c85e31f46e30','Suzuki','Jimny','4x4','4 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/suzuki_jimny.jpg',4,'Essence','Manuel',40000.00,40000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('b3a9471a-dd43-478f-a016-62396a2247bd','Mazda','6 Grand Touring','Berline','5 personnes ÔÇó Automatique ÔÇó Cuir & Si├¿ges Chauffants','/img/vehicles/mazda_6.jpg',5,'Essence','Automatique',38000.00,38000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('b56cdb60-84f1-4e80-8303-f2772ca61664','Toyota','Land Cruiser','Luxe','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/l300.jpeg',7,'Essence','Automatique',190000.00,190000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',190000.00),('b654e4f9-1e03-4f8b-9bb3-29c2a79cf355','Renault','Koleos','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/koleosAv.jpeg',5,'Essence','Automatique',40500.00,40500.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',40500.00),('b65bfb12-cdfc-4fb2-a423-a9d1a07b7d39','BMW','S├®rie 3 320i','Berline','5 personnes ÔÇó Automatique ÔÇó Sport & Confort','/img/vehicles/bmw320.jpg',5,'Essence','Automatique',50000.00,50000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('b6841dbe-533c-4681-afe3-058a7f286e88','Mitsubishi','Montero','4x4','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/monteraav.jpeg',5,'Essence','Automatique',50000.00,50000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('ba5af11c-b5bc-4dc9-909f-a68d6d69621c','Yutong','ZK6122','Autocar','55 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',55,'Essence','Manuel',180000.00,180000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('bb2e2a17-a780-4c0d-a6ab-be8c7949859f','Suzuki','Dzire','Citadines','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/dzer.jpg',5,'Essence','Automatique',25000.00,25000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',25000.00),('bc6d6a95-6fba-4706-8fac-04e86c291e6e','Mercedes-Benz','Classe S','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/mercedes_s500.jpg',5,'Essence','Automatique',250000.00,250000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('bd0c80c1-4624-4549-8907-ef3c38666454','Ford','Transit 9 Places','Minibus','9 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/ford1.jpg',9,'Essence','Manuel',70000.00,70000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('bf4260ee-84bb-4d7f-ab9f-2d37d70cf8e8','Toyota','Rush 38','4x4','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/rushavant.jpeg',7,'Essence','Automatique',50000.00,50000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',50000.00),('c07289c4-d708-4ecb-b308-68dfd68f3a1f','Chevrolet','Spark','Citadines','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/chevrolet_spark.jpg',5,'Essence','Manuel',16000.00,16000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('c0d0ef28-a418-48b5-abec-75887d2002ff','Dongfeng','Friday','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',5,'Essence','Manuel',60000.00,60000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('c0e4b90e-b1eb-4ded-ae86-3ccd22524f34','Kia','Sportage','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/kia_sportage.jpg',5,'Essence','Automatique',43000.00,43000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('c13157ae-e0aa-4ff0-bf4e-f2f6eb342a8c','Toyota','Fortuner','Luxe','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/fortuner.jpg',7,'Essence','Automatique',113739.00,113739.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',113739.00),('c2538678-d6f5-401e-a359-e286ac071cff','Toyota','Rush','4x4','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/rushavant.jpeg',7,'Essence','Automatique',50000.00,50000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('c2a4c5c1-b1e5-45dc-b4f1-126532a21be3','Peugeot','308 Sedan','Berline','5 personnes ÔÇó Automatique ÔÇó Agile & ├ëconome','/img/vehicles/peugeot_308.jpg',5,'Essence','Automatique',28000.00,28000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('c4729a28-f056-44c2-8cf9-853f23d05879','Hyundai','50 Places','Autocar','50 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',50,'Essence','Manuel',170000.00,170000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('c4e21a5a-19b6-4153-aecd-50e26c749022','Toyota','Land Cruiser Prado','4x4','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/prado.jpg',7,'Essence','Automatique',120000.00,120000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('c824040f-2b62-4d16-a37c-66e64cdcd1d8','Suzuki','Vitara Rouge','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/vitaraAvant.jpg',5,'Essence','Automatique',35000.00,35000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',35000.00),('c89115f8-9364-4a5d-88d1-1df0ebe7fc86','Jeep','Wrangler','4x4','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/jeep_wrangler.jpg',5,'Essence','Automatique',90000.00,90000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('c9f4d2ad-9d48-49b8-aea8-8ab9107b2dc4','Toyota','Hiace 12 Places','Minibus','12 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',12,'Essence','Manuel',80000.00,80000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('caf1e9a8-b4e2-4950-a11f-cea645610cd7','Renault','Kadjar','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/kadjaravant.jpeg',5,'Essence','Automatique',40541.00,40541.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',40541.00),('cbbd294a-724f-467a-bd77-9be8f70de995','Toyota','Corolla Executive','Berline','5 personnes ÔÇó Automatique ÔÇó Fiable & Climatis├®e','/img/vehicles/toyota_corolla.jpg',5,'Essence','Automatique',30000.00,30000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('cc35a1c7-1d8d-4d42-8cd8-5464900aa823','Hyundai','45 Places','Autocar','45 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',45,'Essence','Manuel',160000.00,160000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('cc45e91f-069d-41c0-ab93-9625341888d4','Isuzu','D-Max 2024','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/dmaxav.png',5,'Essence','Manuel',56000.00,56000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('ccd2d95b-6323-4676-a11c-9564cf710cc8','Toyota','Hiace 15 Places','Minibus','15 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',15,'Essence','Manuel',90000.00,90000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',90000.00),('cd6d73d5-e4c1-41d4-b237-272eba0cea9e','Ford','Transit Custom','Utilitaires','10 places assises ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/ford1.jpg',10,'Essence','Manuel',40000.00,40000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('cf1e4aea-3302-4722-8303-7b5bd00d1aa9','Toyota','Camry Hybrid','Berline','5 personnes ÔÇó Automatique ÔÇó Confort & Silence','/img/vehicles/camry.jpg',5,'Essence','Automatique',40000.00,40000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('cfaa1cfc-a425-4042-ad44-70e84782ec6f','Toyota','Hiace Van','Utilitaires','10 places assises ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/h1ec.jpg',10,'Essence','Manuel',35000.00,35000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('d093792b-3c95-40d3-8958-19f075539692','Mitsubishi','Pajero 13','4x4','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/pajeroav.jpeg',7,'Essence','Automatique',55000.00,55000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',5000.00),('d1ede849-04b3-4adf-82ac-2c703f4f3816','Suzuki','Grand Vitara 932','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/gvitaraAv.jpeg',5,'Essence','Automatique',40501.00,40501.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',40501.00),('d2f0eac4-c158-43d8-8124-b565a9cf49c1','Nissan','Micra','Citadines','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/nissan_micra.jpg',5,'Essence','Automatique',27820.00,27820.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',27820.00),('d34c6d8c-d448-411a-b820-ed87e40a8018','Toyota','Rush 38','4x4','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/rushavant.jpeg',7,'Essence','Automatique',50000.00,50000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('d5d7131e-e798-40c8-8f66-0d49eda25f05','Volkswagen','Tiguan','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/vw_tiguan.jpg',5,'Essence','Automatique',46000.00,46000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('d6aa2dbf-24d2-4128-b82c-fe6abfff0a3e','Hyundai','32 Places','Autocar','32 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',32,'Essence','Manuel',135000.00,135000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',135000.00),('d914176e-fd04-4cab-8830-808d943f1d35','Suzuki','Grand Vitara 755','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/ngvitaraav.jpeg',5,'Essence','Automatique',40541.00,40541.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('d95c4606-e8db-4066-b38c-e17c5bb97fcd','Kia','K5 / Optima GT','Berline','5 personnes ÔÇó Automatique ÔÇó Finition GT','/img/vehicles/kia_k5.jpg',5,'Essence','Automatique',36000.00,36000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('da3e2906-b1d3-481e-bb98-e9785c725fd9','Isuzu','MU-X','4x4','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/pajero_sport.jpg',7,'Essence','Automatique',75000.00,75000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('da832188-7011-4e5e-a096-a8bedd47f6d2','Peugeot','208','Citadines','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/peugeot_208.jpg',5,'Essence','Automatique',22000.00,22000.00,0,'ACTIVE','2026-08-20 10:43:55','2026-08-22 11:13:41',NULL),('dada0a47-7a5a-40ab-8991-92243bd03b8d','Renault','Dokker','Utilitaires','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/dokker.jpg',5,'Essence','Manuel',30000.00,30000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('dadfffa9-c27f-46dd-a2ac-d8cd81a65137','Mitsubishi','L200','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/l200av.jpg',5,'Essence','Manuel',51000.00,51000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('db851e6e-a83b-416a-841a-bf138ef789f5','Toyota','Hilux 4x4','4x4','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/toyota_hilux.jpg',5,'Essence','Manuel',60000.00,60000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('dc81dfe0-f41a-454c-8ea8-deb2fd486441','Dacia','Logan','Citadines','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/dacia_logan.jpg',5,'Essence','Manuel',19000.00,19000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('dcf24df3-4054-48f7-99dc-2c285d2ed1dd','Renault','Kangoo','Utilitaires','3 places assises ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/renault_kangoo.jpg',3,'Essence','Manuel',27000.00,27000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('dd450b0d-5eec-4d53-8b77-30d8c946f925','Audi','Q7','SUV','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/audi_q7.jpg',7,'Essence','Automatique',175000.00,175000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('ddb9c506-0994-46d4-8ef6-d7e6020a0f6e','Hyundai','Elantra GT','Berline','5 personnes ÔÇó Automatique ÔÇó Design Moderne','/img/vehicles/hyundai_elantra.jpg',5,'Essence','Automatique',27000.00,27000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('e0348286-f4a8-449d-84fd-14573cfd1cc0','Hyundai','32 Places','Autocar','32 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',32,'Essence','Manuel',135000.00,135000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('e3e69471-caa2-45aa-a01b-9e7f3bba0d70','Mitsubishi','Outlander','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/mitsubishi_outlander.jpg',5,'Essence','Automatique',44000.00,44000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('e6e98615-001a-4366-ad35-bb10a9de3fe6','Mercedes-Benz','Classe E 300','Berline','5 personnes ÔÇó Automatique ÔÇó Climatis├®e & Assur├®e','/img/vehicles/mercedes_e300.jpg',5,'Essence','Automatique',75000.00,75000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('ea0a748e-4fb2-4232-b146-c0b2d8efe5c7','Kia','Grandbird','Minibus','15 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',15,'Essence','Manuel',95000.00,95000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('ead90be3-181d-4252-88e5-f3cf72ca2626','Hyundai','Tucson','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/hyundai_tucson.jpg',5,'Essence','Automatique',42000.00,42000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('eb17b507-5dfb-47c2-8dad-9c4451f7ffb0','Volvo','XC90','SUV','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/volvo_xc90.jpg',7,'Essence','Automatique',165000.00,165000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('ed74e06d-05cd-4dee-bbd8-59bf181a41b3','Ford','Escape','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/ford_escape.jpg',5,'Essence','Automatique',45000.00,45000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('eff65934-a3a1-49a9-b705-d1855773ff50','Citro├½n','Berlingo','Utilitaires','3 places assises ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/citroen_berlingo.jpg',3,'Essence','Manuel',28000.00,28000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('f039666b-aa48-4a6d-a07c-80522c62216d','Mitsubishi','Pajero 48','4x4','4 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/pajeroav.jpeg',4,'Essence','Automatique',50000.00,50000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',5000.00),('f09193db-76a2-4e80-aa38-45a2e721e18d','Toyota','Rush','4x4','7 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/rushavant.jpeg',7,'Essence','Automatique',50000.00,50000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',50000.00),('f101e259-a8fb-489a-bfdb-d6dbe3ff2317','Toyota','Hilux','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/toyota_hilux.jpg',5,'Essence','Manuel',55000.00,55000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('f34ecfaa-2ebf-4365-95d7-60e49b74f7bb','Hyundai','40 Places','Autocar','40 places assises ÔÇó Manuel ÔÇó Avec chauffeur','/img/vehicles/h1ec.jpg',40,'Essence','Manuel',150000.00,150000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL),('f57ea013-ed12-496a-bce7-2e1eb4ae5f64','Lexus','ES 350','Berline','5 personnes ÔÇó Automatique ÔÇó Grand Luxe','/img/vehicles/lexus_es.jpg',5,'Essence','Automatique',65000.00,65000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('f760ff7d-e498-448f-8e4d-3fdcfa9a0dc4','Renault','Van Express','Utilitaires','2 places assises ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/express1.jpeg',2,'Essence','Manuel',30000.00,30000.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:25:44',30000.00),('f771e078-04ce-4a39-b7a7-e3f1b6325836','Toyota','Vitz','Citadines','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/swiftavant.png',5,'Essence','Automatique',20700.00,20700.00,0,'ACTIVE','2026-08-14 11:06:55','2026-08-22 11:13:41',20700.00),('f9944c81-3705-4c84-a1c7-c08dfd99bdb7','Audi','A8 L','Berline','5 personnes ÔÇó Automatique ÔÇó Luxe Absolu','/img/vehicles/audi_a8.jpg',5,'Essence','Automatique',135000.00,135000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('fa594ce1-d714-4fee-895f-4f3c10cad2fa','Nissan','X-Trail','SUV','5 personnes ÔÇó Automatique ÔÇó Assur├®e','/img/vehicles/nissan_xtrail.jpg',5,'Essence','Automatique',46000.00,46000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:13:41',NULL),('fb1273ca-6902-412a-9aa3-3a4fb549ca40','Renault','Van Express','Utilitaires','2 places assises ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/express1.jpeg',2,'Essence','Manuel',30000.00,30000.00,1,'ACTIVE','2026-08-24 10:16:19','2026-08-24 10:16:19',NULL),('ff9793d5-8136-4966-a7fb-390acad4963a','BMW','S├®rie 7 740Li','Berline','5 personnes ÔÇó Automatique ÔÇó VIP Prestige','/img/vehicles/bmw_740li.jpg',5,'Essence','Automatique',140000.00,140000.00,0,'ACTIVE','2026-08-22 11:01:47','2026-08-22 11:13:41',NULL),('fff31fcd-2f8a-4cee-a9b2-069d2a6ed429','GWM','P-Series','Pick-Up','5 personnes ÔÇó Manuel ÔÇó Assur├®e','/img/vehicles/toyota_hilux.jpg',5,'Essence','Manuel',50000.00,50000.00,0,'ACTIVE','2026-08-20 10:43:56','2026-08-22 11:25:20',NULL);
/*!40000 ALTER TABLE `vehicules` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-24 11:48:37
