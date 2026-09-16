<?php
/**
 * Gabarits HTML des e-mails automatiques.
 * Identité visuelle reprise de l'invitation officielle (vert #0a6741 / orange #f59d00).
 */

require_once __DIR__ . '/../config.php';

function date_fr_long(): string
{
    $mois = [1 => 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
             'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    $ts = strtotime(EVENT_DATE);
    return date('j', $ts) . ' ' . $mois[(int)date('n', $ts)] . ' ' . date('Y', $ts);
}

function gabarit_debut(string $titreBandeau, string $sousTitre = ''): string
{
    $h = '<!doctype html><html lang="fr"><head><meta charset="utf-8">'
       . '<meta name="viewport" content="width=device-width,initial-scale=1.0"></head>'
       . '<body style="margin:0;padding:0;background:#eef3f0;font-family:Arial,Helvetica,sans-serif;">'
       . '<table role="presentation" width="100%" style="background:#eef3f0"><tr><td align="center">'
       . '<table role="presentation" width="680" style="max-width:680px;background:#ffffff">'
       . '<tr><td style="height:6px;background:#087443"></td></tr>'
       . '<tr><td style="padding:34px 40px 28px;background:#0a6741">'
       . '<div style="font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#ffd36a">SOUTARAH GROUP × BNI</div>'
       . '<div style="font-size:28px;line-height:1.15;font-weight:800;color:#ffffff;margin-top:10px">' . $titreBandeau . '</div>'
       . ($sousTitre !== '' ? '<div style="font-size:15px;line-height:1.5;color:#d8eee4;margin-top:10px">' . $sousTitre . '</div>' : '')
       . '</td></tr><tr><td style="padding:30px 40px;font-size:16px;line-height:1.65;color:#42544c">';
    return $h;
}

function gabarit_fin(): string
{
    $lieu = e(EVENT_LIEU);
    $horaire = defined('EVENT_HORAIRE') ? e(EVENT_HORAIRE) : '09h00 – 12h00';
    $h  = '</td></tr>'
        . '<tr><td style="padding:0 40px 26px">'
        . '<table role="presentation" width="100%" style="background:#f4f8f5;border:1px solid #dce8e1;border-radius:10px">'
        . '<tr><td style="padding:18px 22px;text-align:center">'
        . '<div style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#6d7c75">Rappel</div>'
        . '<div style="font-size:19px;font-weight:800;color:#12362a;margin-top:6px">' . date_fr_long() . '</div>'
        . '<div style="font-size:13px;font-weight:700;color:#0a6741;margin-top:3px">Horaire : ' . $horaire . '</div>'
        . '<div style="font-size:13px;color:#52625a;margin-top:4px">' . $lieu . '</div>'
        . '</td></tr></table></td></tr>'
        . '<tr><td style="padding:20px 40px 30px;background:#0f3528;text-align:center">'
        . '<div style="font-size:13px;color:#d7e4df">SOUTARAH GROUP • Abidjan, Côte d\'Ivoire</div>'
        . '<div style="font-size:12px;color:#afc3ba;margin-top:5px">' . e(EVENT_CONTACT) . '</div>'
        . '</td></tr></table></td></tr></table></body></html>';
    return $h;
}

function recap_details(array $c): string
{
    $nb  = (int)($c['nb_personnes'] ?? 1);
    $org = trim((string)($c['organisation'] ?? ''));
    $fon = trim((string)($c['fonction'] ?? ''));
    $h   = '<table role="presentation" width="100%" style="background:#f4f8f5;border:1px solid #dce8e1;border-radius:10px;margin:18px 0">'
         . '<tr><td style="padding:18px 22px;font-size:14px;line-height:1.9;color:#33453d">'
         . '<strong>Invité :</strong> ' . e(trim(($c['prenom'] ?? '') . ' ' . ($c['nom'] ?? ''))) . '<br>'
         . '<strong>Présence confirmée pour :</strong> ' . $nb . ' personne' . ($nb > 1 ? 's' : '');
    if ($org !== '') {
        $h .= '<br><strong>Organisation :</strong> ' . e($org);
    }
    if ($fon !== '') {
        $h .= '<br><strong>Fonction :</strong> ' . e($fon);
    }
    $h .= '</td></tr></table>';
    return $h;
}

/** E-mail de remerciement envoyé immédiatement après confirmation */
function email_merci(array $c): array
{
    $prenom = trim((string)($c['prenom'] ?? '')) !== '' ? trim((string)$c['prenom']) : trim((string)$c['nom']);
    $html = gabarit_debut(
        'Votre présence est confirmée',
        'Merci ' . e($prenom) . ', nous sommes honorés de vous compter parmi nos invités.'
    );
    $html .= '<p>Bonjour ' . e($prenom) . ',</p>'
        . '<p>Nous vous remercions sincèrement d\'avoir confirmé votre présence à la '
        . '<strong>cérémonie officielle de remise de financement</strong> accordé par la '
        . '<strong>Banque Nationale d\'Investissement (BNI)</strong> à <strong>SOUTARAH GROUP</strong>.</p>'
        . recap_details($c)
        . '<p>Nous vous prions d\'arriver quelques minutes en avance pour faciliter l\'accueil et l\'installation.</p>'
        . '<p style="margin-top:22px">Avec nos remerciements,<br>'
        . '<strong>La Direction de SOUTARAH GROUP</strong></p>';
    $html .= gabarit_fin();

    return [
        'sujet' => 'Merci ! Votre présence est confirmée — Cérémonie BNI × SOUTARAH GROUP du ' . date_fr_long(),
        'html'  => $html,
    ];
}

/** E-mail de rappel envoyé avant la cérémonie ($jours = nombre de jours restants) */
function email_rappel(array $c, int $jours): array
{
    $prenom = trim((string)($c['prenom'] ?? '')) !== '' ? trim((string)$c['prenom']) : trim((string)$c['nom']);

    if ($jours <= 0) {
        $titre    = 'C\'est aujourd\'hui !';
        $phrase   = 'La cérémonie <strong>se tient aujourd\'hui</strong>. Nous nous réjouissons de vous accueillir.';
        $objJours = '— c\'est aujourd\'hui';
    } elseif ($jours === 1) {
        $titre    = 'Rappel : la cérémonie, c\'est demain';
        $phrase   = 'La cérémonie se tiendra <strong>demain</strong>. Nous nous réjouissons de vous accueillir.';
        $objJours = '— J-1';
    } else {
        $titre    = 'Rappel — Cérémonie BNI × SOUTARAH GROUP';
        $phrase   = 'Nous avons le plaisir de vous rappeler que la cérémonie se tiendra dans '
                  . '<strong>' . $jours . ' jours</strong>.';
        $objJours = '— J-' . $jours;
    }

    $horaire = defined('EVENT_HORAIRE') ? e(EVENT_HORAIRE) : '09h00 – 12h00';

    $html = gabarit_debut($titre, 'Votre présence à la cérémonie officielle de remise de financement reste confirmée.');
    $html .= '<p>Bonjour ' . e($prenom) . ',</p>'
        . '<p>' . $phrase . '</p>'
        . recap_details($c)
        . '<p><strong>Informations pratiques :</strong></p>'
        . '<p style="margin-top:0"><strong>Date :</strong> ' . date_fr_long() . '<br>'
        . '<strong>Horaire :</strong> ' . $horaire . '<br>'
        . '<strong>Lieu :</strong> ' . e(EVENT_LIEU) . '</p>'
        . '<p>Nous vous prions d\'arriver quelques minutes en avance. Pour toute question, '
        . 'contactez-nous à ' . e(EVENT_CONTACT) . '.</p>'
        . '<p style="margin-top:22px">Cordialement,<br><strong>La Direction de SOUTARAH GROUP</strong></p>';
    $html .= gabarit_fin();

    return [
        'sujet' => 'Rappel' . $objJours . ' — Cérémonie BNI × SOUTARAH GROUP du ' . date_fr_long(),
        'html'  => $html,
    ];
}

