<?php
/**
 * Export CSV des confirmations (respecte la recherche/filtre en cours).
 */
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/auth_admin.php';
exiger_admin();

$q       = trim((string)($_GET['q'] ?? ''));
$reponse = in_array($_GET['reponse'] ?? '', ['oui', 'non'], true) ? $_GET['reponse'] : '';

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
$sql .= ' ORDER BY confirmed_at DESC';
$stmt = db()->prepare($sql);
$stmt->execute($params);

header('Content-Type: text/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename=confirmations_rsvp_' . date('Y-m-d') . '.csv');

$out = fopen('php://output', 'w');
// BOM UTF-8 pour un affichage correct des accents dans Excel
fwrite($out, "\xEF\xBB\xBF");
fputcsv($out, ['Code', 'Nom', 'Prenom', 'Email', 'Telephone', 'Organisation', 'Fonction',
               'Nb_personnes', 'Reponse', 'Message', 'Date_confirmation'], ';');
while ($row = $stmt->fetch()) {
    fputcsv($out, [
        $row['code'], $row['nom'], $row['prenom'], $row['email'], $row['telephone'],
        $row['organisation'], $row['fonction'], $row['nb_personnes'], $row['reponse'],
        $row['message'], $row['confirmed_at'],
    ], ';');
}
fclose($out);
exit;
