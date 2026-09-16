<?php
/**
 * Fonctions utilitaires partagées.
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/db.php';

/** Échappement HTML */
function e(?string $s): string
{
    return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
}

/** Jeton CSRF */
function csrf_token(): string
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(24));
    }
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';
}

function csrf_check(): bool
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return isset($_POST['csrf'], $_SESSION['csrf'])
        && hash_equals($_SESSION['csrf'], (string)$_POST['csrf']);
}

/** Normalise une adresse e-mail */
function normalise_email(string $email): string
{
    return strtolower(trim($email));
}

/** Génère un code d'invitation unique, ex. SG-4F7K2Q */
function generer_code(): string
{
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans caractères ambigus (0/O, 1/I)
    do {
        $code = 'SG-';
        for ($i = 0; $i < 6; $i++) {
            $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        }
        $stmt = db()->prepare('SELECT COUNT(*) FROM invitees WHERE code = ?');
        $stmt->execute([$code]);
        $existe = (bool)$stmt->fetchColumn();
    } while ($existe);
    return $code;
}

/** URL personnalisée d'un invité */
function lien_invitation(?string $code): string
{
    return BASE_URL . ($code ? '/?code=' . rawurlencode($code) : '/');
}
