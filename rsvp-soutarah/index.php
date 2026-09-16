<?php
/**
 * RSVP SOUTARAH GROUP — Page publique de confirmation de présence.
 * Cérémonie BNI × SOUTARAH GROUP — 24 septembre 2026.
 *
 * Accepte un code d'invitation personnalisé : https://rsvp.soutarah-group.ci/?code=SG-XXXXXX
 */

require_once __DIR__ . '/includes/helpers.php';
require_once __DIR__ . '/includes/traitement.php';
require_once __DIR__ . '/includes/mailer.php';
require_once __DIR__ . '/includes/templates_mail.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$erreurs            = [];
$invite             = null;   // invité retrouvé via le code dans le lien
$codeInconnu        = false;
$confirmExistante   = null;   // confirmation déjà enregistrée
$afficherFormulaire = true;

$codeParam = trim((string)($_GET['code'] ?? ''));
if ($codeParam !== '') {
    $stmt = db()->prepare('SELECT * FROM invitees WHERE code = ? AND actif = 1 LIMIT 1');
    $stmt->execute([$codeParam]);
    $invite = $stmt->fetch() ?: null;
    if (!$invite) {
        $codeInconnu = true;
    }
}

// Confirmation déjà enregistrée pour ce code d'invitation ?
if ($invite) {
    $stmt = db()->prepare('SELECT * FROM confirmations WHERE code = ? LIMIT 1');
    $stmt->execute([$invite['code']]);
    $confirmExistante = $stmt->fetch() ?: null;
}
$modifier = isset($_GET['modifier']);
if ($confirmExistante && !$modifier) {
    $afficherFormulaire = false; // on affiche la page de statut au lieu du formulaire
}

// --------- Traitement de la soumission ---------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $afficherFormulaire) {
    if (!csrf_check()) {
        $erreurs[] = 'Session expirée, veuillez réessayer.';
    } elseif (!empty($_POST['site_web'])) { // champ piège anti-spam (doit rester vide)
        $erreurs[] = 'Une erreur est survenue.';
    } else {
        $nom     = trim((string)($_POST['nom'] ?? ''));
        $prenom  = trim((string)($_POST['prenom'] ?? ''));
        $email   = normalise_email((string)($_POST['email'] ?? ''));
        $tel     = trim((string)($_POST['telephone'] ?? ''));
        $org     = trim((string)($_POST['organisation'] ?? ''));
        $fon     = trim((string)($_POST['fonction'] ?? ''));
        $nb      = (int)($_POST['nb_personnes'] ?? 1);
        $reponse = (($_POST['reponse'] ?? '') === 'non') ? 'non' : 'oui';
        $message = trim((string)($_POST['message'] ?? ''));
        $code    = $invite['code'] ?? (trim((string)($_POST['code'] ?? '')) ?: null);

        if ($nom === '') {
            $erreurs[] = 'Le nom est obligatoire.';
        }
        if ($prenom === '') {
            $erreurs[] = 'Le prénom est obligatoire.';
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $erreurs[] = 'L\'adresse e-mail saisie n\'est pas valide.';
        }
        if ($tel === '') {
            $erreurs[] = 'Le numéro de téléphone est obligatoire.';
        }
        if ($nb < 1 || $nb > 10) {
            $erreurs[] = 'Le nombre de personnes doit être compris entre 1 et 10.';
        }

        if (!$erreurs) {
            traiter_confirmation($nom, $prenom, $email, $tel, $org, $fon, $nb,
                                 $reponse, $message, $code, $invite['code'] ?? null);
        }
    }
}

// --------- Valeurs à pré-remplir dans le formulaire ---------
$valeurs = [
    'code'         => $invite['code'] ?? '',
    'nom'          => '',
    'prenom'       => '',
    'email'        => '',
    'telephone'    => '',
    'organisation' => '',
    'fonction'     => '',
    'nb_personnes' => 1,
];
$sourcePrefill = $confirmExistante ?: $invite;
if ($sourcePrefill) {
    foreach ($valeurs as $champ => $defaut) {
        if (isset($sourcePrefill[$champ]) && (string)$sourcePrefill[$champ] !== '') {
            $valeurs[$champ] = $sourcePrefill[$champ];
        }
    }
}

// --------- Message de succès (après redirection) ---------
$succes = null;
if (isset($_GET['merci']) && !empty($_SESSION['rsvp_ok'])) {
    $succes = $_SESSION['rsvp_ok'];
    unset($_SESSION['rsvp_ok']);
    $afficherFormulaire = false;
}

require __DIR__ . '/vue_public.php';

