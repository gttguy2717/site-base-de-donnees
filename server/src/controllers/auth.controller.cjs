const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { User, Client, Company, Notification, sequelize } = require('../models/index.cjs');
const { hashPassword, comparePassword, signAccessToken, publicUser } = require('../services/auth.service.cjs');
const { sendNewAccountEmail } = require('../services/mail.service.cjs');

const CUSTOMER_TYPES = new Set(['PARTICULIER', 'ENTREPRISE']);

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone) {
  return phone.trim().replace(/[\s.-]/g, '');
}

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

async function register(request, response, next) {
  const transaction = await sequelize.transaction();
  try {
    const { customerType, password, address, firstName, lastName, companyName, responsibleName, identificationNumber } = request.body;
    const email = normalizeEmail(request.body.email);
    const telephone = normalizePhone(request.body.phone);

    // Documents fournis (multipart) pour les entreprises
    const documents = (request.files || []).map((file) => ({
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      filename: file.filename,
      url: '/uploads/' + file.filename,
    }));

    const cleanupFiles = () => documents.forEach((d) => { try { fs.unlinkSync(d.path); } catch (e) {} });

    if (!CUSTOMER_TYPES.has(customerType)) throw badRequest('Le type de client doit être PARTICULIER ou ENTREPRISE.');
    if (customerType === 'PARTICULIER' && (!firstName?.trim() || !lastName?.trim())) throw badRequest('Le nom et le prénom sont requis pour un particulier.');
    if (customerType === 'ENTREPRISE' && !companyName?.trim()) throw badRequest('Le nom de l’entreprise est requis.');
    if (customerType === 'ENTREPRISE' && documents.length === 0) {
      throw badRequest('Les documents justificatifs de l’entreprise (RCCM, pièce d’identité, etc.) sont obligatoires.');
    }

    const existingUser = await User.findOne({ where: { [Op.or]: [{ email }, { telephone }] }, transaction });
    if (existingUser) { cleanupFiles(); throw badRequest('Un compte utilise déjà cet email ou ce numéro de téléphone.'); }

    const isEntreprise = customerType === 'ENTREPRISE';
    // Les entreprises sont inactives tant que l'admin n'a pas validé leurs documents
    const user = await User.create({ email, telephone, mot_de_passe_hash: await hashPassword(password), role: 'CLIENT', est_actif: !isEntreprise }, { transaction });
    const client = await Client.create({
      utilisateur_id: user.id,
      type_client: customerType,
      prenom: customerType === 'PARTICULIER' ? firstName.trim() : responsibleName?.trim() || null,
      nom: customerType === 'PARTICULIER' ? lastName.trim() : null,
      adresse: address?.trim() || null,
    }, { transaction });

    let company = null;
    if (isEntreprise) {
      company = await Company.create({
        client_id: client.id,
        nom: companyName.trim(),
        nom_responsable: responsibleName?.trim() || null,
        numero_identification: identificationNumber?.trim() || null,
        verification_status: 'PENDING',
        documents,
      }, { transaction });
    }

    await transaction.commit();
    if (!isEntreprise) {
      // Nettoyage : pas de documents pour un particulier
      cleanupFiles();
    }

    // Notification aux admins + email
    try {
      const admins = await User.findAll({
        where: { role: { [Op.in]: ['ADMIN', 'MANAGER'] }, est_actif: true },
        attributes: ['id'],
      });
      const clientName = customerType === 'ENTREPRISE'
        ? (companyName || responsibleName || email)
        : [firstName, lastName].filter(Boolean).join(' ') || email;
      await Promise.all(admins.map(admin => Notification.create({
        utilisateur_destinataire_id: admin.id,
        type: 'NEW_ACCOUNT',
        titre: 'Nouveau compte créé',
        message: `${clientName} (${customerType === 'ENTREPRISE' ? 'Entreprise' : 'Particulier'}) a créé un compte. Email: ${email}, Tél: ${telephone}`,
        lien: '/admin/clients',
        est_lu: false,
      })));
      console.log(`✅ Notification admin envoyée pour le nouveau compte ${email}`);
    } catch (notifError) {
      console.error('❌ Erreur notification admin nouveau compte:', notifError.message);
    }

    // Email admin
    try {
      const fullClient = await Client.findByPk(client.id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'email', 'telephone'] },
          { model: Company, as: 'entreprise' },
        ],
      });
      const mailResult = await sendNewAccountEmail({ client: fullClient.toJSON() });
      if (mailResult.sent) console.log('✅ Email admin nouveau compte envoyé');
    } catch (mailError) {
      console.error('❌ Erreur email admin nouveau compte:', mailError.message);
    }

    // Compte entreprise en attente de validation : on ne renvoie pas de token
    if (isEntreprise) {
      response.status(201).json({
        requiresVerification: true,
        message: 'Votre compte entreprise a bien été créé. Il sera actif après validation de vos documents par notre équipe.',
        email,
      });
      return;
    }

    response.status(201).json({
      token: signAccessToken(user),
      user: publicUser(user),
      client: { ...client.toJSON(), company: company?.toJSON() || null },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

async function login(request, response, next) {
  try {
    const identifier = request.body.identifier.trim();
    const normalizedEmail = identifier.toLowerCase();
    const normalizedPhone = normalizePhone(identifier);
    const user = await User.findOne({
      where: { [Op.or]: [{ email: normalizedEmail }, { telephone: normalizedPhone }] },
      include: [{ model: Client, as: 'client', include: [{ model: Company, as: 'entreprise' }] }]
    });

    if (!user || !(await comparePassword(request.body.password, user.mot_de_passe_hash))) {
      const error = new Error('Identifiants invalides.');
      error.statusCode = 401;
      throw error;
    }

    // Entreprise en attente de validation des documents
    if (user.client?.entreprise?.verification_status === 'PENDING' || (user.client?.type_client === 'ENTREPRISE' && user.client?.entreprise?.verification_status === 'PENDING')) {
      const error = new Error('Votre inscription d’entreprise est en cours de validation. L’administrateur doit approuver vos documents avant d’accéder à votre espace.');
      error.statusCode = 403;
      throw error;
    }
    if (user.client?.entreprise?.verification_status === 'REJECTED') {
      const error = new Error('Votre inscription d’entreprise a été refusée. Contactez SOUTARAH GROUP pour plus d’informations.');
      error.statusCode = 403;
      throw error;
    }
    if (!user.est_actif) {
      const error = new Error('Votre compte est bloqué. Contactez SOUTARAH GROUP.');
      error.statusCode = 403;
      throw error;
    }

    // Vérifier le blocage automatique pour les entreprises clients
    // Le délai est compté à partir de la date de validation/conversion (verifie_le), sinon depuis la création du compte
    if (user.client?.type_client === 'ENTREPRISE_CLIENT' && user.client?.delai_blocage_jours) {
      const delaiJours = Number(user.client.delai_blocage_jours);
      const ancre = user.client.entreprise?.verifie_le || user.client.cree_le;
      const dateAncre = new Date(ancre);
      const maintenant = new Date();
      const joursEcoules = Math.floor((maintenant - dateAncre) / 86400000);
      if (joursEcoules >= delaiJours && !user.client.bloque_le) {
        await user.update({ est_actif: false });
        await user.client.update({ bloque_le: maintenant });
        const error = new Error('Votre compte a été bloqué automatiquement après le délai imparti. Contactez SOUTARAH GROUP pour le réactiver.');
        error.statusCode = 403;
        throw error;
      }
    }

    user.derniere_connexion_au = new Date();
    await user.save();
    response.status(200).json({ token: signAccessToken(user), user: publicUser(user), client: user.client });
  } catch (error) {
    next(error);
  }
}

async function me(request, response, next) {
  try {
    const user = await User.findByPk(request.auth.user.id, {
      attributes: { exclude: ['mot_de_passe_hash'] },
      include: [{ model: Client, as: 'client', include: [{ model: Company, as: 'entreprise' }] }],
    });
    response.status(200).json({ user: publicUser(user), client: user.client });
  } catch (error) {
    next(error);
  }
}

async function uploadAvatar(request, response, next) {
  try {
    if (!request.file) {
      return response.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const userId = request.auth.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      if (fs.existsSync(request.file.path)) fs.unlinkSync(request.file.path);
      return response.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // Créer le dossier uploads/avatars s'il n'existe pas
    const avatarsDir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(avatarsDir)) {
      fs.mkdirSync(avatarsDir, { recursive: true });
    }

    // Valider le type de fichier
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMime.includes(request.file.mimetype)) {
      if (fs.existsSync(request.file.path)) fs.unlinkSync(request.file.path);
      return response.status(400).json({ message: 'Format d\'image non supporté. Utilisez JPG, PNG, WebP ou GIF.' });
    }

    // Renommer et déplacer le fichier
    const fileExtension = path.extname(request.file.originalname).toLowerCase() || '.png';
    const newFileName = `avatar-${userId.slice(0, 8)}-${Date.now()}${fileExtension}`;
    const newFilePath = path.join(avatarsDir, newFileName);

    fs.renameSync(request.file.path, newFilePath);

    // Supprimer l'ancien avatar s'il existe
    if (user.avatar_url) {
      const oldPath = path.join(__dirname, '../..', user.avatar_url);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) { console.warn('Ancien avatar non supprimé:', e.message); }
      }
    }

    // Sauvegarder le nouveau chemin
    const relativeFilePath = `/uploads/avatars/${newFileName}`;
    await user.update({ avatar_url: relativeFilePath });

    response.json({
      success: true,
      message: 'Photo de profil mise à jour avec succès',
      avatar_url: relativeFilePath,
      user: publicUser(user),
    });
  } catch (error) {
    // Supprimer le fichier en cas d'erreur
    if (request.file && fs.existsSync(request.file.path)) {
      fs.unlinkSync(request.file.path);
    }
    console.error('Erreur upload avatar:', error);
    next(error);
  }
}

async function updateProfile(request, response, next) {
  const transaction = await sequelize.transaction();
  try {
    const userId = request.auth.user.id;
    const user = await User.findByPk(userId, {
      include: [{ model: Client, as: 'client', include: [{ model: Company, as: 'entreprise' }] }],
      transaction,
    });

    if (!user) throw badRequest('Utilisateur introuvable.');

    const { firstName, lastName, email, phone, address, companyName, responsibleName, identificationNumber, currentPassword, newPassword, avatar_url } = request.body;

    if (avatar_url !== undefined) {
      user.avatar_url = avatar_url;
    }

    if (email && email.trim().toLowerCase() !== user.email) {
      const normEmail = normalizeEmail(email);
      const existing = await User.findOne({ where: { email: normEmail, id: { [Op.ne]: userId } }, transaction });
      if (existing) throw badRequest('Cet email est déjà utilisé par un autre compte.');
      user.email = normEmail;
    }

    if (phone && normalizePhone(phone) !== user.telephone) {
      const normPhone = normalizePhone(phone);
      const existing = await User.findOne({ where: { telephone: normPhone, id: { [Op.ne]: userId } }, transaction });
      if (existing) throw badRequest('Ce numéro de téléphone est déjà utilisé par un autre compte.');
      user.telephone = normPhone;
    }

    if (newPassword && newPassword.trim()) {
      if (!currentPassword || !currentPassword.trim()) throw badRequest('Le mot de passe actuel est requis.');
      if (!(await comparePassword(currentPassword, user.mot_de_passe_hash))) throw badRequest('Le mot de passe actuel est incorrect.');
      if (newPassword.trim().length < 8) throw badRequest('Le mot de passe doit contenir au moins 8 caractères.');
      user.mot_de_passe_hash = await hashPassword(newPassword.trim());
    }

    await user.save({ transaction });

    if (user.client) {
      if (firstName !== undefined) user.client.prenom = firstName.trim();
      if (lastName !== undefined) user.client.nom = lastName.trim();
      if (address !== undefined) user.client.adresse = address ? address.trim() : null;
      await user.client.save({ transaction });

      if (user.client.entreprise) {
        if (companyName !== undefined) user.client.entreprise.nom = companyName.trim();
        if (responsibleName !== undefined) user.client.entreprise.nom_responsable = responsibleName.trim();
        if (identificationNumber !== undefined) user.client.entreprise.numero_identification = identificationNumber ? identificationNumber.trim() : null;
        await user.client.entreprise.save({ transaction });
      }
    }

    await transaction.commit();

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['mot_de_passe_hash'] },
      include: [{ model: Client, as: 'client', include: [{ model: Company, as: 'entreprise' }] }],
    });

    response.status(200).json({
      user: publicUser(updatedUser),
      client: updatedUser.client,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

module.exports = { register, login, me, updateProfile, uploadAvatar };
