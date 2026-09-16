<?php
/**
 * Authentification de l'espace d'administration.
 */

function exiger_admin(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (empty($_SESSION['admin_ok'])) {
        header('Location: login.php');
        exit;
    }
}

function est_admin(): bool
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return !empty($_SESSION['admin_ok']);
}
