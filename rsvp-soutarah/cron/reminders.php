<?php
/**
 * Rappels automatiques — à exécuter par le Cron Hostinger (toutes les 30 min) :
 *
 *   URL : https://rsvp.soutarah-group.ci/cron/reminders.php?token=VOTRE_JETON
 *   CLI : php /home/uXXXX/domains/rsvp.soutarah-group.ci/public_html/cron/reminders.php VOTRE_JETON
 *
 * Fonctions :
 *  1. Envoie les e-mails de remerciement en attente ou en erreur (nouvelles tentatives).
 *  2. Programme puis envoie les rappels J-14, J-7, J-3, J-1 et le jour J
 *     (définis dans config.php) à toutes les personnes ayant confirmé leur présence.
 */

require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/mailer.php';
require_once __DIR__ . '/../includes/templates_mail.php';

// ---- Protection par jeton (URL ?token=... ou argument CLI) ----
$token = $_GET['token'] ?? ($argv[1] ?? '');
if (!hash_equals((string)CRON_TOKEN, (string)$token)) {
    http_response_code(403);
    exit('Accès refusé : jeton invalide.');
}

$journal = [];

function journal(string $ligne): void
{
    global $journal;
    $journal[] = '[' . date('Y-m-d H:i:s') . '] ' . $ligne;
}

/** S'assure qu'une ligne d'e-mail planifiée existe (une seule fois par clé et par confirmation) */
function planifier_mail(int $confirmationId, string $destinataire, string $sujet, string $cle, string $type, string $scheduledAt): ?int
{
    $stmt = db()->prepare('SELECT id FROM mails WHERE confirmation_id = ? AND cle = ? LIMIT 1');
    $stmt->execute([$confirmationId, $cle]);
    $id = $stmt->fetchColumn();
    if ($id) {
        return (int)$id;
    }
    $stmt = db()->prepare(
        "INSERT INTO mails (confirmation_id, cle, type, destinataire, sujet, scheduled_at, status)
         VALUES (?, ?, ?, ?, ?, ?, 'en_attente')"
    );
    $stmt->execute([$confirmationId, $cle, $type, $destinataire, $sujet, $scheduledAt]);
    return (int)db()->lastInsertId();
}

/** Tente l'envoi d'un mail planifié et met à jour son statut */
function tenter_envoi(int $mailId): void
{
    $stmt = db()->prepare(
        "SELECT m.*, c.nom, c.prenom, c.nb_personnes, c.organisation, c.fonction
         FROM mails m JOIN confirmations c ON c.id = m.confirmation_id
         WHERE m.id = ?"
    );
    $stmt->execute([$mailId]);
    $mail = $stmt->fetch();
    if (!$mail) {
        return;
    }

    // Reconstruit le corps du message à partir de la confirmation
    if ($mail['type'] === 'merci') {
        $mailGen = email_merci($mail);
    } else {
        $jours = (int)ltrim($mail['cle'], 'J-');
        $mailGen = email_rappel($mail, $jours);
    }

    try {
        envoyer_mail($mail['destinataire'], trim($mail['prenom'] . ' ' . $mail['nom']),
                     $mailGen['sujet'], $mailGen['html']);
        $stmt = db()->prepare("UPDATE mails SET status = 'envoye', sent_at = NOW(), sujet = ?, erreur = NULL WHERE id = ?");
        $stmt->execute([$mailGen['sujet'], $mailId]);
        journal('ENVOYE  #' . $mailId . ' -> ' . $mail['destinataire'] . ' (' . $mail['cle'] . ')');
    } catch (Throwable $ex) {
        $stmt = db()->prepare("UPDATE mails SET status = 'erreur', erreur = ? WHERE id = ?");
        $stmt->execute([mb_substr($ex->getMessage(), 0, 500), $mailId]);
        journal('ERREUR  #' . $mailId . ' -> ' . $mail['destinataire'] . ' : ' . $ex->getMessage());
    }
}

// ------------------------------------------------------------------
// 1) Rappels : création des plannings pour les présences confirmées
// ------------------------------------------------------------------
$confirmes = db()->query("SELECT * FROM confirmations WHERE reponse = 'oui'")->fetchAll();
$nbConfirmes = count($confirmes);

foreach ($confirmes as $c) {
    foreach ($GLOBALS['REMINDER_OFFSETS'] as $offset) {
        $cle = 'J-' . $offset;
        $scheduled = date('Y-m-d ' . REMINDER_HEURE . ':00',
                          strtotime(EVENT_DATE) - $offset * 86400);
        planifier_mail((int)$c['id'], $c['email'], 'Rappel ' . $cle, $cle, 'rappel', $scheduled);
    }
}
journal("Planning des rappels vérifié pour $nbConfirmes présence(s) confirmée(s).");

// ------------------------------------------------------------------
// 2) Envoi de tout ce qui est dû (remerciements en attente + rappels)
// ------------------------------------------------------------------
$dues = db()->query(
    "SELECT id, cle FROM mails
     WHERE status <> 'envoye' AND scheduled_at <= NOW()
     ORDER BY scheduled_at ASC
     LIMIT 300"
)->fetchAll();

foreach ($dues as $m) {
    tenter_envoi((int)$m['id']);
}
journal(count($dues) . ' e-mail(s) traité(s).');

// ------------------------------------------------------------------
// Sortie
// ------------------------------------------------------------------
if (PHP_SAPI === 'cli') {
    echo implode("\n", $journal) . "\n";
} else {
    header('Content-Type: text/plain; charset=UTF-8');
    echo implode("\n", $journal) . "\n";
}
