<?php
/**
 * Tableau de bord d'administration — liste des confirmations de présence.
 */
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/auth_admin.php';
exiger_admin();

// ---- Suppression d'une confirmation ----
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'supprimer') {
    if (csrf_check()) {
        $id = (int)($_POST['id'] ?? 0);
        $stmt = db()->prepare('DELETE FROM confirmations WHERE id = ?');
        $stmt->execute([$id]);
        $stmt = db()->prepare('DELETE FROM mails WHERE confirmation_id = ?');
        $stmt->execute([$id]);
    }
    header('Location: index.php?' . http_build_query(['q' => $_GET['q'] ?? '', 'reponse' => $_GET['reponse'] ?? '']));
    exit;
}

// ---- Statistiques ----
$stats = db()->query("
    SELECT
        COUNT(*)                                              AS total,
        SUM(reponse = 'oui')                                  AS confirmes,
        SUM(reponse = 'non')                                  AS absents,
        COALESCE(SUM(CASE WHEN reponse = 'oui' THEN nb_personnes END), 0) AS personnes
    FROM confirmations
")->fetch();
$nbInvites = (int)db()->query('SELECT COUNT(*) FROM invitees WHERE actif = 1')->fetchColumn();
$nbMailsEnvoyes = (int)db()->query("SELECT COUNT(*) FROM mails WHERE status = 'envoye'")->fetchColumn();
$nbMailsEnAttente = (int)db()->query("SELECT COUNT(*) FROM mails WHERE status <> 'envoye'")->fetchColumn();

// ---- Recherche / filtre ----
$q       = trim((string)($_GET['q'] ?? ''));
$reponse = ($_GET['reponse'] ?? '') === 'oui' || ($_GET['reponse'] ?? '') === 'non'
         ? $_GET['reponse'] : '';

$sql = 'SELECT * FROM confirmations WHERE 1=1';
$params = [];
if ($q !== '') {
    $sql .= ' AND (nom LIKE ? OR prenom LIKE ? OR email LIKE ? OR telephone LIKE ? OR organisation LIKE ? OR code LIKE ?)';
    $like = '%' . $q . '%';
    array_push($params, $like, $like, $like, $like, $like, $like);
}
if ($reponse !== '') {
    $sql .= ' AND reponse = ?';
    $params[] = $reponse;
}
$sql .= ' ORDER BY confirmed_at DESC LIMIT 500';
$stmt = db()->prepare($sql);
$stmt->execute($params);
$liste = $stmt->fetchAll();
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Tableau de bord — RSVP SOUTARAH</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/admin.css?v=3">
</head>
<body>
<div class="topbar"></div>
<header class="main">
  <div class="hm-left">
    <span class="hm-logo-chip"><img class="hm-logo" src="../assets/img/logo-soutarah.png" alt="SOUTARAH GROUP"></span>
    <div>
      <div class="hm-tag">Administration RSVP</div>
      <h1>Cérémonie BNI × SOUTARAH GROUP — 24 sept. 2026</h1>
    </div>
    <img class="hm-bni" src="../assets/img/logo-bni.png" alt="BNI">
  </div>
  <nav>
    <a href="importer.php">Importer des invités</a>
    <a class="gold" href="export.php">Export CSV</a>
    <a href="logout.php">Déconnexion</a>
  </nav>
</header>
<div class="wrap">

<div class="cards">
  <div class="stat">
    <div class="ic g"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
    <div><div class="v"><?= (int)$stats['confirmes'] ?></div><div class="l">Présences confirmées</div></div>
  </div>
  <div class="stat">
    <div class="ic o"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
    <div><div class="v"><?= (int)$stats['personnes'] ?></div><div class="l">Personnes attendues</div></div>
  </div>
  <div class="stat">
    <div class="ic r"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></div>
    <div><div class="v"><?= (int)$stats['absents'] ?></div><div class="l">Déclinés</div></div>
  </div>
  <div class="stat">
    <div class="ic b"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z"/><path d="m22 6-10 7L2 6"/></svg></div>
    <div><div class="v"><?= $nbMailsEnvoyes ?><?= $nbMailsEnAttente ? ' <small>(' . $nbMailsEnAttente . ' en attente)</small>' : '' ?></div><div class="l">E-mails envoyés</div></div>
  </div>
  <div class="stat">
    <div class="ic g"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div>
    <div><div class="v"><?= (int)$stats['total'] ?></div><div class="l">Réponses totales</div></div>
  </div>
</div>

<form class="toolbar" method="get">
  <input type="text" name="q" value="<?= e($q) ?>" placeholder="Rechercher un nom, e-mail, téléphone, organisation, code...">
  <select name="reponse">
    <option value="">Toutes les réponses</option>
    <option value="oui" <?= $reponse === 'oui' ? 'selected' : '' ?>>Confirmés</option>
    <option value="non" <?= $reponse === 'non' ? 'selected' : '' ?>>Absents</option>
  </select>
  <button type="submit">Filtrer</button>
  <a class="btnl" href="export.php<?= ($q !== '' || $reponse !== '') ? '?' . http_build_query(['q' => $q, 'reponse' => $reponse]) : '' ?>">Exporter en CSV</a>
</form>

<div class="tbl-scroll">
<table>
  <thead>
  <tr>
    <th>Code</th><th>Nom &amp; prénom</th><th>E-mail</th><th>Téléphone</th>
    <th>Organisation</th><th>Fonction</th><th>Nb</th><th>Réponse</th>
    <th>Enregistrée le</th><th></th>
  </tr>
  </thead>
  <tbody>
  <?php if (!$liste): ?>
    <tr><td colspan="10" class="vide">Aucune confirmation pour le moment.</td></tr>
  <?php else: foreach ($liste as $c): ?>
  <tr>
    <td><?= e($c['code'] ?: '—') ?></td>
    <td><strong><?= e(trim($c['nom'] . ' ' . $c['prenom'])) ?></strong></td>
    <td><?= e($c['email']) ?></td>
    <td><?= e($c['telephone']) ?></td>
    <td><?= e($c['organisation']) ?></td>
    <td><?= e($c['fonction']) ?></td>
    <td><?= (int)$c['nb_personnes'] ?></td>
    <td><span class="tag <?= $c['reponse'] ?>"><?= $c['reponse'] === 'oui' ? 'Confirmé' : 'Absent' ?></span></td>
    <td><?= e(date('d/m/Y H:i', strtotime($c['confirmed_at']))) ?></td>
    <td>
      <form method="post" onsubmit="return confirm('Supprimer définitivement cette confirmation ?');">
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="supprimer">
        <input type="hidden" name="id" value="<?= (int)$c['id'] ?>">
        <button type="submit" class="del">Suppr.</button>
      </form>
    </td>
  </tr>
  <?php endforeach; endif; ?>
  </tbody>
</table>
</div>

</div><!-- /wrap -->
</body>
</html>

