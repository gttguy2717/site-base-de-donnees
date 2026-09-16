<?php
/**
 * Enregistrement d'une confirmation + envoi de l'e-mail de remerciement.
 */

function traiter_confirmation(
    string $nom,
    string $prenom,
    string $email,
    string $tel,
    string $org,
    string $fon,
    int $nb,
    string $reponse,
    string $message,
    ?string $code,
    ?string $codeInvite
): void {
    // Une seule confirmation par adresse e-mail (mise à jour si elle existe déjà)
    $stmt = db()->prepare('SELECT id FROM confirmations WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $idExistant = $stmt->fetchColumn();

    if ($idExistant) {
        $stmt = db()->prepare(
            'UPDATE confirmations
             SET code = ?, nom = ?, prenom = ?, telephone = ?, organisation = ?,
                 fonction = ?, nb_personnes = ?, reponse = ?, message = ?, ip = ?
             WHERE id = ?'
        );
        $stmt->execute([$code ?: $codeInvite, $nom, $prenom, $tel, $org, $fon, $nb,
                        $reponse, $message !== '' ? $message : null,
                        $_SERVER['REMOTE_ADDR'] ?? null, $idExistant]);
        $confirmationId = (int)$idExistant;
    } else {
        $stmt = db()->prepare(
            'INSERT INTO confirmations
                (code, nom, prenom, email, telephone, organisation, fonction,
                 nb_personnes, reponse, message, ip)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$code ?: $codeInvite, $nom, $prenom, $email, $tel, $org, $fon,
                        $nb, $reponse, $message !== '' ? $message : null,
                        $_SERVER['REMOTE_ADDR'] ?? null]);
        $confirmationId = (int)db()->lastInsertId();
    }

    // ------- E-mail de remerciement automatique (si présence confirmée) -------
    $mailOk = false;
    if ($reponse === 'oui') {
        $stmt = db()->prepare('SELECT * FROM confirmations WHERE id = ?');
        $stmt->execute([$confirmationId]);
        $conf = $stmt->fetch();

        // Le remerciement n'est envoyé qu'une seule fois par adresse
        $stmt = db()->prepare(
            "SELECT COUNT(*) FROM mails
             WHERE confirmation_id = ? AND cle = 'merci' AND status = 'envoye'"
        );
        $stmt->execute([$confirmationId]);
        $dejaEnvoye = (bool)$stmt->fetchColumn();

        if ($dejaEnvoye) {
            $mailOk = true;
        } else {
            $mail = email_merci($conf);
            $stmt = db()->prepare(
                "INSERT INTO mails (confirmation_id, cle, type, destinataire, sujet, scheduled_at, status)
                 VALUES (?, 'merci', 'merci', ?, ?, NOW(), 'en_attente')"
            );
            $stmt->execute([$confirmationId, $email, $mail['sujet']]);
            $mailId = (int)db()->lastInsertId();

            try {
                envoyer_mail($email, trim($prenom . ' ' . $nom), $mail['sujet'], $mail['html']);
                $stmt = db()->prepare(
                    "UPDATE mails SET status = 'envoye', sent_at = NOW() WHERE id = ?"
                );
                $stmt->execute([$mailId]);
                $mailOk = true;
            } catch (Throwable $ex) {
                // En cas d'échec SMTP, le cron (cron/reminders.php) réessaiera automatiquement
                $stmt = db()->prepare(
                    "UPDATE mails SET status = 'erreur', erreur = ? WHERE id = ?"
                );
                $stmt->execute([mb_substr($ex->getMessage(), 0, 500), $mailId]);
            }
        }
    }

    // Redirection Post/Redirect/Get pour éviter la double soumission
    $_SESSION['rsvp_ok'] = [
        'identite' => trim($prenom . ' ' . $nom),
        'reponse'  => $reponse,
        'mail_ok'  => $mailOk,
    ];
    $codeFinal = $code ?: $codeInvite;
    $qs = '?merci=1' . ($codeFinal ? '&code=' . rawurlencode($codeFinal) : '');
    header('Location: ' . $qs);
    exit;
}
