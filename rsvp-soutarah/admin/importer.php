<?php
/**
 * Import de la liste des invités + génération automatique des codes d'invitation.
 *
 * Format CSV attendu (une ligne par invité, séparateur ; ou ,) :
 *   Nom;Prénom;Email;Téléphone;Organisation;Fonction
 * La ligne d'en-tête est optionnelle.
 */
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/auth_admin.php';
exiger_admin();

$rapport = [];      // lignes importées : [code, nom, prenom, email, lien]
$erreurs = [];
$nbMisAJour = 0;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && csrf_check()) {
    $contenu = '';
    if (!empty($_FILES['fichier']['tmp_name']) && is_uploaded_file($_FILES['fichier']['tmp_name'])) {
        $contenu = (string)file_get_contents($_FILES['fichier']['tmp_name']);
    } elseif (!empty($_POST['liste'])) {
        $contenu = (string)$_POST['liste'];
    }

    if (trim($contenu) === '') {
        $erreurs[] = 'Aucune donnée fournie : collez la liste ou choisissez un fichier CSV.';
    } else {
        // Détection simple du séparateur
        $sep = substr_count($contenu, ';') >= substr_count($contenu, ',') ? ';' : ',';
        $lignes = preg_split('/\r\n|\r|\n/', $contenu);
        $num = 0;
        foreach ($lignes as $ligne) {
            $num++;
            $ligne = trim($ligne);
            if ($ligne === '') {
                continue;
            }
            $champs = array_map('trim', explode($sep, $ligne));
            // Ignore un éventuel en-tête
            if ($num === 1 && stripos(implode(' ', $champs), 'nom') !== false && !filter_var($champs[2] ?? '', FILTER_VALIDATE_EMAIL)) {
                continue;
            }
            [$nom, $prenom, $email, $tel, $org, $fon] = array_pad($champs, 6, '');
            if ($nom === '' && $prenom === '') {
                $erreurs[] = "Ligne $num ignorée : nom/prénom manquant.";
                continue;
            }
            $emailClean = normalise_email((string)$email);
            if ($emailClean !== '' && !filter_var($emailClean, FILTER_VALIDATE_EMAIL)) {
                $erreurs[] = "Ligne $num ignorée : e-mail invalide ($email).";
                continue;
            }

            // Ré-import : mise à jour si l'invité existe déjà (même e-mail)
            $id = null;
            if ($emailClean !== '') {
                $stmt = db()->prepare('SELECT id FROM invitees WHERE email = ? LIMIT 1');
                $stmt->execute([$emailClean]);
                $id = $stmt->fetchColumn();
            }
            if ($id) {
                $stmt = db()->prepare(
                    'UPDATE invitees SET nom = ?, prenom = ?, telephone = ?, organisation = ?, fonction = ? WHERE id = ?'
                );
                $stmt->execute([$nom, $prenom, $tel, $org, $fon, $id]);
                $stmt = db()->prepare('SELECT code FROM invitees WHERE id = ?');
                $stmt->execute([$id]);
                $code = (string)$stmt->fetchColumn();
                $nbMisAJour++;
            } else {
                $code = generer_code();
                $stmt = db()->prepare(
                    'INSERT INTO invitees (code, nom, prenom, email, telephone, organisation, fonction)
                     VALUES (?, ?, ?, ?, ?, ?, ?)'
                );
                $stmt->execute([$code, $nom, $prenom, $emailClean, $tel, $org, $fon]);
            }
            $rapport[] = [$code, $nom, $prenom, $emailClean, lien_invitation($code)];
        }
    }
}
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Importer des invités — RSVP SOUTARAH</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/admin.css">
</head>
<body>
<div class="topbar"></div>
<header class="main">
  <div class="hm-left">
    <img class="hm-logo" src="../assets/img/logo-soutarah.png" alt="SOUTARAH GROUP" style="filter:brightness(0) invert(1)">
    <div>
      <div class="hm-tag">Administration RSVP</div>
      <h1>Importer des invités</h1>
    </div>
    <img class="hm-bni" src="../assets/img/logo-bni.png" alt="BNI">
  </div>
  <nav>
    <a href="index.php">← Tableau de bord</a>
    <a class="gold" href="export.php">Export CSV</a>
    <a href="logout.php">Déconnexion</a>
  </nav>
</header>
<div class="wrap">

<div class="card">
  <h2>1. Collez votre liste d'invités</h2>
  <p>Une ligne par invité, format :
     <strong>Nom;Prénom;Email;Téléphone;Organisation;Fonction</strong> — ou chargez un fichier CSV.
     Chaque invité reçoit automatiquement un code unique et un lien personnalisé
     <code>?code=SG-XXXXXX</code> à placer dans son e-mail d'invitation.</p>
  <div class="ex">Kouassi;Aya;aya.kouassi@exemple.ci;+225 07 00 00 00 00;BNI;Directrice<br>
Traoré;Ibrahim;i.traore@exemple.ci;+225 05 00 00 00 00;Ministère des Transports;Conseiller</div>
  <form method="post" enctype="multipart/form-data">
    <?= csrf_field() ?>
    <textarea name="liste" placeholder="Collez ici les lignes de vos invités (ou utilisez le fichier ci-dessous)..."></textarea>
    <p style="margin:12px 0 0"><strong>Ou</strong> fichier CSV :
       <input type="file" name="fichier" accept=".csv,.txt"></p>
    <button type="submit">Importer et générer les codes</button>
  </form>
  <?php foreach ($erreurs as $err): ?><div class="alert err"><?= e($err) ?></div><?php endforeach; ?>
  <?php if ($rapport): ?>
    <div class="alert ok"><?= count($rapport) ?> invité(s) enregistré(s)
      <?= $nbMisAJour ? "(dont $nbMisAJour mis à jour)" : '' ?>.
      Les liens personnalisés sont générés ci-dessous.</div>
  <?php endif; ?>
</div>

<?php if ($rapport): ?>
<div class="card">
  <h2>2. Liens personnalisés générés</h2>
  <p>Remplacez le lien <code>https://VOTRE-LIEN-INSCRIPTION</code> du mail d'invitation par le
  lien de chaque invité — ou utilisez l'outil <code>tools/maj_invitation.php</code> pour
  automatiser cette substitution dans le fichier .eml.</p>
  <table>
    <thead>
    <tr><th>Code</th><th>Nom &amp; prénom</th><th>E-mail</th><th>Lien personnalisé</th></tr>
    </thead>
    <tbody>
    <?php foreach ($rapport as $r): ?>
    <tr>
      <td><strong><?= e($r[0]) ?></strong></td>
      <td><?= e(trim($r[2] . ' ' . $r[1])) ?></td>
      <td><?= e($r[3] ?: '—') ?></td>
      <td><a href="<?= e($r[4]) ?>"><?= e($r[4]) ?></a></td>
    </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php endif; ?>
</div>
</body>
</html>

