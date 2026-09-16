-- ============================================================
--  RSVP SOUTARAH GROUP — Structure de la base (référence)
--  Cérémonie BNI × SOUTARAH GROUP — 24 septembre 2026
--
--  NOTE : ces tables sont créées AUTOMATIQUEMENT au premier
--  chargement du site. Ce fichier n'est utile que pour un
--  import manuel via phpMyAdmin (hPanel → Bases de données).
-- ============================================================

CREATE TABLE IF NOT EXISTS invitees (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code          VARCHAR(20) NOT NULL UNIQUE,
    nom           VARCHAR(120) NOT NULL,
    prenom        VARCHAR(120) DEFAULT '',
    email         VARCHAR(190) DEFAULT '',
    telephone     VARCHAR(40)  DEFAULT '',
    organisation  VARCHAR(190) DEFAULT '',
    fonction      VARCHAR(190) DEFAULT '',
    actif         TINYINT(1) NOT NULL DEFAULT 1,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS confirmations (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code          VARCHAR(20) DEFAULT NULL,
    nom           VARCHAR(120) NOT NULL,
    prenom        VARCHAR(120) DEFAULT '',
    email         VARCHAR(190) NOT NULL,
    telephone     VARCHAR(40)  DEFAULT '',
    organisation  VARCHAR(190) DEFAULT '',
    fonction      VARCHAR(190) DEFAULT '',
    nb_personnes  INT NOT NULL DEFAULT 1,
    reponse       ENUM('oui','non') NOT NULL DEFAULT 'oui',
    message       TEXT DEFAULT NULL,
    ip            VARCHAR(45) DEFAULT NULL,
    confirmed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_email (email),
    KEY idx_code (code),
    KEY idx_reponse (reponse)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mails (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    confirmation_id INT UNSIGNED NOT NULL,
    cle             VARCHAR(20) NOT NULL,
    type            ENUM('merci','rappel') NOT NULL,
    destinataire    VARCHAR(190) NOT NULL,
    sujet           VARCHAR(255) NOT NULL,
    scheduled_at    DATETIME NOT NULL,
    sent_at         DATETIME DEFAULT NULL,
    status          ENUM('en_attente','envoye','erreur') NOT NULL DEFAULT 'en_attente',
    erreur          VARCHAR(500) DEFAULT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_status (status),
    KEY idx_cle (cle),
    KEY idx_confirmation (confirmation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
