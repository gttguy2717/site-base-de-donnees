<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Confirmation de présence — BNI × SOUTARAH GROUP</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css?v=3">
</head>
<body>
<div class="topbar"></div>

<header class="header">
  <div class="header-inner">
    <img class="logo-soutarah" src="assets/img/logo-soutarah.png" alt="SOUTARAH GROUP">
  </div>
</header>

<section class="hero">
  <span class="pill">Invitation officielle</span>
  <h1>Cérémonie Officielle<br>de Remise de Financement</h1>
  <p class="partners"><strong>BNI</strong> × <strong>SOUTARAH GROUP</strong> — Jeudi 24 septembre 2026</p>
</section>

<div class="info-cards fade-in">
  <div class="info-card">
    <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div>
    <div><div class="lbl">Date &amp; Horaire</div><div class="val">24 septembre 2026</div><div class="sub">Jeudi — 09h00 à 12h00</div></div>
  </div>
  <div class="info-card">
    <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>
    <div><div class="lbl">Lieu</div><div class="val">Hôtel des Armées</div><div class="sub">Salle Tené Birahima — Plateau, Abidjan</div></div>
  </div>
  <div class="info-card gold">
    <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
    <div><div class="lbl">Financement BNI</div><div class="val">500 000 000 FCFA</div><div class="sub">Ligne de crédit 2026</div></div>
  </div>
</div>

<main class="main">
  <div class="card fade-in">

<?php if ($codeInconnu): ?>
    <div class="alert info">Le code d'invitation fourni n'est pas reconnu. Vous pouvez
    tout de même confirmer votre présence en remplissant le formulaire ci-dessous.</div>
<?php endif; ?>

<?php if ($succes): ?>
    <div class="fade-in">
    <?php if ($succes['reponse'] === 'oui'): ?>
        <svg class="check-anim" viewBox="0 0 74 74">
          <circle cx="37" cy="37" r="35"/>
          <path d="M24 38 l9 9 l18 -19"/>
        </svg>
        <h2 class="section-title">Merci <?= e($succes['identite']) ?>, votre présence est confirmée !</h2>
        <p class="section-sub">Nous sommes honorés de vous compter parmi nos invités à la cérémonie
        officielle de remise du financement BNI × SOUTARAH GROUP.</p>
        <?php if (!empty($succes['mail_ok'])): ?>
            <div class="alert ok">Un e-mail de confirmation vient de vous être envoyé avec
            le récapitulatif de votre participation.</div>
        <?php else: ?>
            <div class="alert info">Votre confirmation a bien été enregistrée. L'e-mail de
            confirmation pourrait être retardé de quelques minutes.</div>
        <?php endif; ?>
        <div class="recap">
            <div><strong>Date &amp; Horaire :</strong> jeudi 24 septembre 2026 (09h00 – 12h00)</div>
            <div><strong>Lieu :</strong> Hôtel des Armées — Salle Tené Birahima, Camp Galliéni, Plateau — Abidjan</div>
            <div><strong>Contact :</strong> <?= e(EVENT_CONTACT) ?></div>
        </div>
        <p class="section-sub" style="margin-top:16px">Nous vous prions d'arriver quelques minutes
        en avance pour faciliter l'accueil et l'installation.</p>
    <?php else: ?>
        <h2 class="section-title">Votre réponse a été enregistrée</h2>
        <p class="section-sub">Nous avons bien noté que vous ne pourrez pas être présent(e).
        Nous vous remercions de votre réponse et espérons vous retrouver à une prochaine occasion.</p>
    <?php endif; ?>
    </div>

<?php elseif (!$afficherFormulaire && $confirmExistante): ?>
    <h2 class="section-title">Bonjour <?= e(trim($confirmExistante['prenom'] . ' ' . $confirmExistante['nom'])) ?></h2>
    <?php if ($confirmExistante['reponse'] === 'oui'): ?>
        <div class="alert ok">Votre présence est déjà confirmée pour la cérémonie du
        24 septembre 2026. Merci !</div>
    <?php else: ?>
        <div class="alert info">Vous avez indiqué ne pas pouvoir être présent(e). Vous pouvez
        modifier votre réponse si la situation a changé.</div>
    <?php endif; ?>
    <div class="recap">
        <div><strong>Réponse enregistrée :</strong>
             <?= $confirmExistante['reponse'] === 'oui' ? 'Présence confirmée' : 'Absence' ?></div>
        <div><strong>Personnes :</strong> <?= (int)$confirmExistante['nb_personnes'] ?></div>
        <div><strong>Enregistrée le :</strong> <?= e(date('d/m/Y à H:i', strtotime($confirmExistante['confirmed_at']))) ?></div>
    </div>

<?php elseif ($afficherFormulaire): ?>
    <h2 class="section-title">Confirmez votre présence</h2>
    <p class="section-sub">Nous serions honorés de compter sur votre présence à cette cérémonie.
    Merci de renseigner vos informations ci-dessous.</p>

    <?php foreach ($erreurs as $err): ?>
        <div class="alert err"><?= e($err) ?></div>
    <?php endforeach; ?>

    <form method="post" action="" novalidate>
        <?= csrf_field() ?>
        <input type="text" name="site_web" value="" style="display:none" tabindex="-1" autocomplete="off">

        <div class="grid">
            <div>
                <label>Nom <span class="req">*</span></label>
                <input type="text" name="nom" value="<?= e($valeurs['nom']) ?>" required>
            </div>
            <div>
                <label>Prénom <span class="req">*</span></label>
                <input type="text" name="prenom" value="<?= e($valeurs['prenom']) ?>" required>
            </div>
            <div>
                <label>Adresse e-mail <span class="req">*</span></label>
                <input type="email" name="email" value="<?= e($valeurs['email']) ?>" required>
            </div>
            <div>
                <label>Téléphone (WhatsApp) <span class="req">*</span></label>
                <input type="tel" name="telephone" value="<?= e($valeurs['telephone']) ?>" placeholder="+225 ..." required>
            </div>
            <div>
                <label>Organisation / Entreprise</label>
                <input type="text" name="organisation" value="<?= e($valeurs['organisation']) ?>">
            </div>
            <div>
                <label>Fonction</label>
                <input type="text" name="fonction" value="<?= e($valeurs['fonction']) ?>">
            </div>
        </div>

        <?php if (!$invite): ?>
        <label>Code d'invitation (si vous en avez reçu un)</label>
        <input type="text" name="code" value="<?= e($valeurs['code']) ?>" placeholder="Ex. SG-4F7K2Q">
        <?php else: ?>
        <div style="margin-top:18px">Votre code d'invitation :
           <span class="code-badge"><?= e($invite['code']) ?></span></div>
        <?php endif; ?>

        <label>Nombre de personnes (vous inclus) <span class="req">*</span></label>
        <select name="nb_personnes">
            <?php for ($i = 1; $i <= 5; $i++): ?>
                <option value="<?= $i ?>" <?= (int)$valeurs['nb_personnes'] === $i ? 'selected' : '' ?>><?= $i ?></option>
            <?php endfor; ?>
        </select>

        <label>Confirmez-vous votre présence ? <span class="req">*</span></label>
        <div class="choix">
            <input type="radio" name="reponse" id="r_oui" value="oui" checked>
            <label class="opt" for="r_oui">
                <span class="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>
                Oui, je serai présent(e)
            </label>
            <input type="radio" name="reponse" id="r_non" value="non">
            <label class="opt" for="r_non">
                <span class="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></span>
                Non, je ne peux pas venir
            </label>
        </div>

        <label>Message (facultatif)</label>
        <textarea name="message" placeholder="Un mot pour l'organisation, une question..."></textarea>

        <button type="submit" class="btn">
            JE CONFIRME MA PRÉSENCE
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
        <p class="section-sub" style="font-size:12.5px;margin-top:14px;text-align:center">
        Vos informations sont utilisées uniquement pour l'organisation de cette cérémonie.</p>
    </form>
<?php endif; ?>

  </div><!-- /card -->
</main>

<footer class="footer">
    <span class="logo-chip"><img src="assets/img/logo-soutarah.png" alt="SOUTARAH GROUP"></span>
    <div class="fline">SOUTARAH GROUP • Abidjan, Côte d'Ivoire</div>
    <div class="fsub"><?= e(EVENT_CONTACT) ?> • www.soutarah-group.ci</div>
</footer>
</body>
</html>

