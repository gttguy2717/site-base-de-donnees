<?php
/**
 * Client SMTP autonome (aucune dépendance Composer).
 * Compatible avec les comptes e-mail Hostinger (smtp.hostinger.com).
 */

class SmtpClient
{
    private string $host;
    private int $port;
    private string $user;
    private string $pass;
    private string $secure;
    private int $timeout;

    public function __construct(
        string $host,
        int $port,
        string $user,
        string $pass,
        string $secure = 'ssl',
        int $timeout = 15
    ) {
        $this->host    = $host;
        $this->port    = $port;
        $this->user    = $user;
        $this->pass    = $pass;
        $this->secure  = $secure; // 'ssl' | 'tls' | ''
        $this->timeout = $timeout;
    }

    /**
     * Envoie un e-mail HTML. Lève une Exception en cas d'échec.
     */
    public function send(string $to, string $toName, string $subject, string $html): void
    {
        $transport = ($this->secure === 'ssl') ? 'ssl://' : '';
        $socket = @fsockopen($transport . $this->host, $this->port, $errno, $errstr, $this->timeout);
        if (!$socket) {
            throw new RuntimeException("Connexion SMTP impossible : $errstr ($errno)");
        }
        stream_set_timeout($socket, $this->timeout);

        $this->expect($socket, 220);
        $ehloHost = parse_url(BASE_URL, PHP_URL_HOST) ?: 'localhost';
        $this->command($socket, 'EHLO ' . $ehloHost, 250);

        if ($this->secure === 'tls') {
            $this->command($socket, 'STARTTLS', 220);
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('Échec du démarrage TLS.');
            }
            $this->command($socket, 'EHLO ' . $ehloHost, 250);
        }

        $this->command($socket, 'AUTH LOGIN', 334);
        $this->command($socket, base64_encode($this->user), 334);
        $this->command($socket, base64_encode($this->pass), 235);

        $this->command($socket, 'MAIL FROM:<' . MAIL_FROM . '>', 250);
        $this->command($socket, 'RCPT TO:<' . $to . '>', [250, 251]);
        $this->command($socket, 'DATA', 354);

        $headers = [
            'From: ' . $this->encodeHeader(MAIL_FROM_NAME) . ' <' . MAIL_FROM . '>',
            'To: ' . $this->encodeHeader($toName) . ' <' . $to . '>',
            'Subject: ' . $this->encodeHeader($subject),
            'Date: ' . date('r'),
            'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . ($ehloHost ?: 'soutarah') . '>',
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: quoted-printable',
        ];

        $body = quoted_printable_encode($html);
        $data = implode("\r\n", $headers) . "\r\n\r\n" . $body . "\r\n.";
        // Sécurité : aucune ligne ne doit commencer par un point isolé
        $data = preg_replace('/^\./m', '..', $data);

        fwrite($socket, $data . "\r\n");
        $this->expect($socket, 250);

        $this->command($socket, 'QUIT', 221);
        fclose($socket);
    }

    /** Envoie la commande et vérifie le code de retour */
    private function command($socket, string $cmd, $expectedCodes): string
    {
        fwrite($socket, $cmd . "\r\n");
        return $this->expect($socket, $expectedCodes);
    }

    /** Lit la réponse SMTP multi-lignes et vérifie le code attendu */
    private function expect($socket, $expectedCodes): string
    {
        $response = '';
        $code = 0;
        while (($line = fgets($socket, 1024)) !== false) {
            $response .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                $code = (int)substr($line, 0, 3);
                break;
            }
        }
        $expected = is_array($expectedCodes) ? $expectedCodes : [$expectedCodes];
        if (!in_array($code, $expected, true)) {
            throw new RuntimeException("Réponse SMTP inattendue ($code) : " . trim($response));
        }
        return $response;
    }

    /** Encode un en-tête en UTF-8 */
    private function encodeHeader(string $value): string
    {
        if (preg_match('/[^\x20-\x7E]/', $value)) {
            return '=?UTF-8?B?' . base64_encode($value) . '?=';
        }
        return $value;
    }
}

/**
 * Envoie un e-mail via la configuration de config.php.
 * Retourne true si envoyé, sinon lève une Exception.
 */
function envoyer_mail(string $to, string $toName, string $subject, string $html): void
{
    static $client = null;
    if ($client === null) {
        $client = new SmtpClient(SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE);
    }
    $client->send($to, $toName, $subject, $html);
}
