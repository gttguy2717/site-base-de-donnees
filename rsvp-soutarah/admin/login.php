<?php
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/auth_admin.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$erreur = '';

// Déjà connecté ?
if (!empty($_SESSION['admin_ok'])) {
    header('Location: index.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_check()) {
        $erreur = 'Session expirée, veuillez réessayer.';
    } else {
        $user = (string)($_POST['user'] ?? '');
        $pass = (string)($_POST['pass'] ?? '');
        if (hash_equals(ADMIN_USER, $user) && hash_equals(ADMIN_PASSWORD, $pass)) {
            session_regenerate_id(true);
            $_SESSION['admin_ok'] = true;
            header('Location: index.php');
            exit;
        }
        // Petit délai pour freiner les tentatives par force brute
        usleep(600000);
        $erreur = 'Identifiant ou mot de passe incorrect.';
    }
}
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Administration — RSVP SOUTARAH</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/admin.css?v=3">
</head>
<body>
<div class="login-bg">
  <div class="login-card">
    <div class="login-brand">
      <div>
        <span class="lb-pill">Espace réservé</span>
        <div><span class="brand-chip"><img src="../assets/img/logo-soutarah.png" alt="SOUTARAH GROUP"></span></div>
        <div class="lb-title">Administration<br>RSVP — Cérémonie BNI × SOUTARAH GROUP</div>
        <p class="lb-sub">Suivez les confirmations de présence en temps réel :
           participants, organisations, effectif attendu et e-mails envoyés.</p>
      </div>
      <div class="lb-sub">24 septembre 2026 — Hôtel des Armées, Plateau, Abidjan</div>
    </div>
    <div class="login-form">
      <h1>Connexion</h1>
      <p class="sub">Accès réservé à l'équipe d'organisation de SOUTARAH GROUP.</p>
      <?php if ($erreur): ?><div class="alert"><?= e($erreur) ?></div><?php endif; ?>
      <form method="post">
        <?= csrf_field() ?>
        <label>Identifiant</label>
        <input type="text" name="user" autofocus required>
        <label>Mot de passe</label>
        <input type="password" name="pass" required>
        <button type="submit">Se connecter</button>
      </form>
    </div>
  </div>
</div>
</body>
</html>
