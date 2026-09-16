<?php
/**
 * Connexion base de données + création automatique des tables.
 * Les tables sont créées automatiquement au premier chargement :
 * aucun import SQL manuel n'est nécessaire (database.sql est fourni à titre de référence).
 */

function db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        exit('Erreur de connexion à la base de données. Vérifiez config.php.');
    }

    db_install($pdo);
    return $pdo;
}

function db_install(PDO $pdo): void
{
    $pdo->exec("
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $pdo->exec("
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS mails (
            id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            confirmation_id INT UNSIGNED NOT NULL,
            cle             VARCHAR(20) NOT NULL,           -- 'merci' ou 'J-14', 'J-7', 'J-3', 'J-1', 'J-0'
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
}
