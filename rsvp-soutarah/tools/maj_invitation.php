<?php
/**
 * Outil : remplace automatiquement le lien "https://VOTRE-LIEN-INSCRIPTION"
 * dans le fichier d' invitation .eml par le lien réel du sous-domaine RSVP.
 *
 * Utilisation en ligne de commande :
 *   php tools/maj_invitation.php "Invitation_Soutarah_BNI_....eml" "https://rsvp.soutarah-group.ci" "Invitation_FINALE.eml"
 *
 * Utilisation via le navigateur (jeton CRON_TOKEN requis) :
 *   https://rsvp.soutarah-group.ci/tools/maj_invitation.php?token=JETON&fichier=invitation.eml&lien=https://rsvp.soutarah-group.ci&sortie=finale.eml
 *
 * Seules les parties texte du message (text/plain et text/html) sont modifiées ;
 * les images jointes ne sont pas altérées.
 */

require_once __DIR__ . '/../config.php';

if (PHP_SAPI === 'cli') {
    $fichier = $argv[1] ?? '';
    $lien    = $argv[2] ?? '';
    $sortie  = $argv[3] ?? '';
} else {
    // Accès web protégé par le jeton du cron
    $token = $_GET['token'] ?? '';
    if (!hash_equals((string)CRON_TOKEN, (string)$token)) {
        http_response_code(403);
        exit('Accès refusé : jeton invalide.');
    }
    $fichier = $_GET['fichier'] ?? '';
    $lien    = $_GET['lien'] ?? '';
    $sortie  = $_GET['sortie'] ?? '';
}

if ($fichier === '' || $lien === '' || $sortie === '') {
    exit("Paramètres manquants.\n"
       . "CLI : php maj_invitation.php <fichier.eml> <nouveau_lien> <sortie.eml>\n"
       . "Web : ?token=...&fichier=...&lien=...&sortie=...\n");
}
if (!is_file($fichier)) {
    exit("Fichier introuvable : $fichier\n");
}

$PLACEHOLDER = 'https://VOTRE-LIEN-INSCRIPTION';
$raw = file_get_contents($fichier);
$lines = preg_split('/\r\n|\r|\n/', $raw);

$currentType = '';   // 'text/plain' | 'text/html' | ''
$currentEnc  = '';   // 'base64' | ...
$collect     = false;
$b64buf      = [];
$outLines    = [];
$nbRemplacements = 0;

$flush = function () use (&$b64buf, &$collect, &$outLines, &$nbRemplacements, $lien, $PLACEHOLDER) {
    if ($collect && $b64buf) {
        $decoded = base64_decode(implode('', $b64buf));
        if ($decoded !== false) {
            $decoded = str_replace($PLACEHOLDER, $lien, $decoded, $n1);
            $decoded = str_replace('VOTRE-LIEN-INSCRIPTION', $lien, $decoded, $n2);
            $nbRemplacements += ($n1 + $n2);
            $encoded = chunk_split(base64_encode($decoded));
            foreach (preg_split('/\r\n|\r|\n/', rtrim($encoded, "\r\n")) as $l) {
                $outLines[] = $l;
            }
        }
    }
    $b64buf = [];
    $collect = false;
};

foreach ($lines as $line) {
    // Ligne de délimitation MIME (boundary)
    if (preg_match('/^--/', $line)) {
        $flush();
        $currentType = '';
        $currentEnc  = '';
        $outLines[] = $line;
        continue;
    }
    if (!$collect) {
        // En-têtes de la partie MIME
        if (preg_match('/^Content-Type:\s*(text\/plain|text\/html)/i', $line, $m)) {
            $currentType = strtolower($m[1]);
        } elseif (preg_match('/^Content-Type:/i', $line)) {
            $currentType = ''; // image, multipart, etc.
        }
        if (preg_match('/^Content-Transfer-Encoding:\s*base64/i', $line)) {
            $currentEnc = 'base64';
        } elseif (preg_match('/^Content-Transfer-Encoding:/i', $line)) {
            $currentEnc = '';
        }
        if (trim($line) === '') {
            // Fin des en-têtes : on collecte si c'est une partie texte en base64
            if ($currentType !== '' && $currentEnc === 'base64') {
                $collect = true;
            }
        }
        $outLines[] = $line;
        continue;
    }
    // Corps base64 collecté
    $b64buf[] = $line;
}
$flush();

$resultat = implode("\r\n", $outLines);
if (file_put_contents($sortie, $resultat) === false) {
    exit("Erreur lors de l'écriture de $sortie\n");
}
echo "Terminé : $sortie créé — $nbRemplacements lien(s) remplacé(s) par $lien\n";
