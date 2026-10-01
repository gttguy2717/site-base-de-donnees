const { Op } = require('sequelize');
const { sequelize, User, Client, Company, Product, Category, Tariff, Vehicle, Reservation, Quote, QuoteItem, Promotion, StockMovement, Notification } = require('../models/index.cjs');
const XLSX = require('xlsx');
const fs = require('fs');
const { repairRecursive, repairText } = require('../utilities/text-encoding.cjs');
const { hashPassword } = require('../services/auth.service.cjs');

// Répare les chaînes (clés ET valeurs) d'une ligne d'export Excel
function repairExcelRow(row) {
  const cleaned = {};
  for (const key of Object.keys(row)) {
    const val = row[key];
    cleaned[repairText(key)] = typeof val === 'string' ? repairText(val) : val;
  }
  return cleaned;
}

// ===== CLIENTS =====
async function createClient(request, response, next) {
  const transaction = await sequelize.transaction();
  try {
    const { companyName, responsibleName, email, phone, address, city, identificationNumber, password, confirmPassword, delaiBlocageJours, delaiBlocageUnite } = request.body;

    // Validation rapide
    if (!companyName?.trim()) {
      const error = new Error('Le nom de l\'entreprise est requis.');
      error.statusCode = 400;
      throw error;
    }
    if (!email?.trim()) {
      const error = new Error('L\'email est requis.');
      error.statusCode = 400;
      throw error;
    }
    if (!phone?.trim()) {
      const error = new Error('Le téléphone est requis.');
      error.statusCode = 400;
      throw error;
    }
    if (!password?.trim()) {
      const error = new Error('Le mot de passe est obligatoire.');
      error.statusCode = 400;
      throw error;
    }
    if (password !== confirmPassword) {
      const error = new Error('Les mots de passe ne correspondent pas.');
      error.statusCode = 400;
      throw error;
    }
    if (!city?.trim()) {
      const error = new Error('La ville est obligatoire.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim().replace(/[\s.-]/g, '');

    // Vérifier que l'email/téléphone n'existe pas déjà
    const existing = await User.findOne({
      where: { [Op.or]: [{ email: normalizedEmail }, { telephone: normalizedPhone }] },
      transaction,
    });
    if (existing) {
      const error = new Error('Un compte utilise déjà cet email ou ce numéro de téléphone.');
      error.statusCode = 400;
      throw error;
    }

    const bcrypt = require('bcrypt');
    const user = await User.create({
      email: normalizedEmail,
      telephone: normalizedPhone,
      mot_de_passe_hash: await bcrypt.hash(password.trim(), 12),
      role: 'CLIENT',
    }, { transaction });

    // Convertir le délai en jours selon l'unité choisie
    let delaiEnJours = null;
    if (delaiBlocageJours) {
      const valeur = Number(delaiBlocageJours);
      if (delaiBlocageUnite === 'mois') {
        delaiEnJours = valeur * 30;
      } else if (delaiBlocageUnite === 'annees') {
        delaiEnJours = valeur * 365;
      } else {
        delaiEnJours = valeur;
      }
    }

    const client = await Client.create({
      utilisateur_id: user.id,
      type_client: 'ENTREPRISE_CLIENT',
      prenom: responsibleName?.trim() || null,
      nom: null,
      adresse: city?.trim() || null,
      delai_blocage_jours: delaiEnJours,
    }, { transaction });

    await Company.create({
      client_id: client.id,
      nom: companyName.trim(),
      nom_responsable: responsibleName?.trim() || null,
      numero_identification: identificationNumber?.trim() || null,
    }, { transaction });

    await transaction.commit();
    response.status(201).json({ success: true, client: { id: client.id, utilisateur_id: user.id } });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

async function getAllClients(_request, response, next) {
  try {
    const clients = await Client.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'telephone', 'est_actif'] },
        { model: Company, as: 'entreprise', required: false },
      ],
      order: [['cree_le', 'DESC']],
    });

    const formatted = clients.map(client => ({
      id: client.id,
      utilisateur_id: client.utilisateur_id,
      nom: client.nom,
      prenom: client.prenom,
      type_client: client.type_client,
      ville: client.adresse,
      commandes: 0, // TODO: compter les commandes
      entreprise: client.entreprise,
      utilisateur: client.user,
      cree_le: client.cree_le,
      delai_blocage_jours: client.delai_blocage_jours,
      bloque_le: client.bloque_le,
      color: ['blue', 'green', 'purple', 'orange', 'teal', 'yellow', 'pink', 'indigo'][Math.floor(Math.random() * 8)],
    }));

    response.json({ clients: formatted });
  } catch (error) {
    next(error);
  }
}

// ===== PRODUITS =====
async function getAllProducts(request, response, next) {
  try {
    const where = {};
    if (request.query.categoryId) where.categorie_id = request.query.categoryId;
    if (request.query.search) {
      where[Op.or] = [
        { nom: { [Op.like]: `%${request.query.search}%` } },
        { reference: { [Op.like]: `%${request.query.search}%` } },
      ];
    }

    const products = await Product.findAll({
      where,
      include: [
        { model: Category, as: 'categorie' },
        { model: Tariff, as: 'tarifs' },
      ],
      order: [['nom', 'ASC']],
    });

    response.json({ products });
  } catch (error) {
    next(error);
  }
}

async function createProduct(request, response, next) {
  try {
    const { nom, reference, description, image_url, categorie_id, categorie_nom, unite, stock, seuil_alerte, tarifs } = request.body;

    // Catégorie : soit un id existant, soit un libellé du site (findOrCreate)
    // pour que l'article soit aussitôt rattaché à la bonne catégorie publique.
    let resolvedCategoryId = categorie_id || null;
    if (!resolvedCategoryId && categorie_nom) {
      const label = String(categorie_nom).trim();
      const slug = label
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const [category] = await Category.findOrCreate({
        where: { slug },
        defaults: { nom: label, slug, description: label, est_actif: true },
      });
      resolvedCategoryId = category.id;
    }

    const product = await Product.create({
      nom,
      reference,
      description,
      image_url,
      categorie_id: resolvedCategoryId,
      unite: unite || 'unité',
      stock: stock || 0,
      seuil_alerte: seuil_alerte || 0,
      statut: 'ACTIVE',
    });

    // Créer les tarifs
    if (tarifs && Array.isArray(tarifs)) {
      await Promise.all(
        tarifs.map(tarif =>
          Tariff.create({
            produit_id: product.id,
            type_client: tarif.type_client,
            prix: tarif.prix,
          })
        )
      );
    }

    response.status(201).json({ product });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(request, response, next) {
  try {
    const product = await Product.findByPk(request.params.id);
    if (!product) {
      return response.status(404).json({ message: 'Produit non trouvé' });
    }

    await product.update(request.body);
    response.json({ product });
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(request, response, next) {
  try {
    const product = await Product.findByPk(request.params.id);
    if (!product) {
      return response.status(404).json({ message: 'Produit non trouvé' });
    }

    await product.update({ statut: 'INACTIVE' });
    response.json({ message: 'Produit désactivé' });
  } catch (error) {
    next(error);
  }
}

// Export des prix en Excel
async function exportProductPrices(request, response, next) {
  try {
    const { VehicleCompanyPrice } = require('../models/index.cjs');
    const companies = await Company.findAll({
      include: [{ model: Client, as: 'client', attributes: ['id', 'type_client'] }],
      order: [['nom', 'ASC']],
    });
    const entrepriseClients = companies.filter(c => c.client?.type_client === 'ENTREPRISE_CLIENT');

    const products = await Product.findAll({
      where: { statut: 'ACTIVE' },
      include: [
        { model: Category, as: 'categorie' },
        { model: Tariff, as: 'tarifs' },
      ],
      order: [['nom', 'ASC']],
    });

    // Préparer les données pour Excel - TOUTES LES INFOS MODIFIABLES
    const data = products.map(product => {
      const tarifParticulier = product.tarifs?.find(t => t.type_client === 'PARTICULIER')?.prix || 0;
      // Prix Entreprise = Prix Particulier : seules les ENTREPRISES CLIENTES (colonnes dédiées)
      // peuvent avoir leurs propres tarifs (SUCAF, etc.)
      const tarifEntreprise = tarifParticulier;
      
      const row = {
        'ID': product.id,
        'Référence': product.reference || '',
        'Nom': product.nom,
        'Description': product.description || '',
        'Catégorie': product.categorie?.nom || '',
        'Unité': product.unite,
        'Prix Particulier': parseFloat(tarifParticulier),
        'Prix Entreprise': parseFloat(tarifEntreprise),
      };

      // Ajouter une colonne par entreprise client
      for (const company of entrepriseClients) {
        const companyTariff = product.tarifs?.find(t => t.type_client === 'ENTREPRISE_CLIENT' && t.entreprise_id === company.id);
        row[company.nom] = companyTariff ? parseFloat(companyTariff.prix) : '';
      }

      return repairExcelRow(row);
    });

    // Créer le workbook et worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Largeur des colonnes
    const cols = [
      { wch: 38 }, // ID
      { wch: 15 }, // Référence
      { wch: 30 }, // Nom
      { wch: 50 }, // Description
      { wch: 20 }, // Catégorie
      { wch: 10 }, // Unité
      { wch: 20 }, // Prix Particulier
      { wch: 20 }, // Prix Entreprise
    ];
    for (const company of entrepriseClients) {
      cols.push({ wch: 20 }); // Colonne par entreprise client
    }
    ws['!cols'] = cols;

    // Ajouter le worksheet au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Catalogue');

    // Générer le buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Envoyer le fichier
    response.setHeader('Content-Disposition', `attachment; filename=catalogue-soutarah-${new Date().toISOString().split('T')[0]}.xlsx`);
    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.send(buffer);
  } catch (error) {
    console.error('Erreur export catalogue:', error);
    next(error);
  }
}

// Import des prix depuis Excel
async function importProductPrices(request, response, next) {
  try {
    if (!request.file) {
      return response.status(400).json({ message: 'Aucun fichier fourni' });
    }

    // Lire le fichier Excel
    const workbook = XLSX.readFile(request.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let updated = 0;
    let errors = [];

    // Récupérer les entreprises clients pour les colonnes spécifiques
    const companies = await Company.findAll({
      include: [{ model: Client, as: 'client', attributes: ['id', 'type_client'] }],
      order: [['nom', 'ASC']],
    });
    const entrepriseClients = companies.filter(c => c.client?.type_client === 'ENTREPRISE_CLIENT');

    // Mettre à jour les produits
    for (const row of data) {
      try {
        const productId = row['ID'];
        const nom = row['Nom'];
        const reference = row['Référence'];
        const description = row['Description'];
        const unite = row['Unité'];
        const prixParticulier = parseFloat(row['Prix Particulier'] ?? row['Prix Particulier/Entreprise'] ?? row['Prix Particulier et Entreprise']);
        const prixEntreprise = parseFloat(row['Prix Entreprise'] ?? row['Prix Particulier'] ?? row['Prix Particulier/Entreprise'] ?? row['Prix Particulier et Entreprise']);

        if (!productId || !nom) {
          errors.push(`Ligne ignorée: ${nom || 'Sans nom'} - ID ou nom manquant`);
          continue;
        }

        // Mettre à jour le produit
        const product = await Product.findByPk(productId);
        if (!product) {
          errors.push(`Produit ${nom} (ID: ${productId}) non trouvé`);
          continue;
        }

        await product.update({
          nom,
          reference: reference || null,
          description: description || null,
          unite: unite || 'unité',
        });

        // Mettre à jour les tarifs standards
        if (!isNaN(prixParticulier)) {
          await Tariff.destroy({ where: { produit_id: productId, entreprise_id: null } });

          await Tariff.create({
            produit_id: productId,
            type_client: 'PARTICULIER',
            prix: prixParticulier,
          });

          // Prix Entreprise = Prix Particulier (les tarifs spécifiques par entreprise
          // cliente sont gérés via les colonnes dédiées, pas via le tarif générique)
          await Tariff.create({
            produit_id: productId,
            type_client: 'ENTREPRISE',
            prix: prixParticulier,
          });
        }

        // Mettre à jour les tarifs par entreprise client
        for (const company of entrepriseClients) {
          const companyPrice = parseFloat(row[company.nom]);
          if (!isNaN(companyPrice)) {
            const [tariff, created] = await Tariff.findOrCreate({
              where: { produit_id: productId, type_client: 'ENTREPRISE_CLIENT', entreprise_id: company.id },
              defaults: { produit_id: productId, type_client: 'ENTREPRISE_CLIENT', entreprise_id: company.id, prix: companyPrice },
            });
            if (!created) {
              await tariff.update({ prix: companyPrice });
            }
          }
        }

        updated++;
      } catch (error) {
        errors.push(`Erreur pour ${row['Nom']}: ${error.message}`);
      }
    }

    // Supprimer le fichier temporaire
    fs.unlinkSync(request.file.path);

    response.json({
      success: true,
      updated,
      errors: errors.length > 0 ? errors : undefined,
      message: `${updated} article(s) mis à jour avec succès${errors.length > 0 ? ` (${errors.length} erreurs)` : ''}`,
    });
  } catch (error) {
    // Supprimer le fichier en cas d'erreur
    if (request.file && fs.existsSync(request.file.path)) {
      fs.unlinkSync(request.file.path);
    }
    console.error('Erreur import catalogue:', error);
    next(error);
  }
}

// ===== VÉHICULES =====
async function createVehicle(request, response, next) {
  try {
    const { Vehicle } = require('../models/index.cjs');
    const {
      marque,
      modele,
      categorie,
      description,
      image_url,
      places,
      carburant,
      transmission,
      prix_journalier_particulier,
      prix_journalier_entreprise,
      prix_journalier_entreprise_client,
      disponibilite,
    } = request.body;

    // Validations
    if (!marque?.trim()) {
      const error = new Error('La marque est requise.');
      error.statusCode = 400;
      throw error;
    }
    if (!modele?.trim()) {
      const error = new Error('Le modèle est requis.');
      error.statusCode = 400;
      throw error;
    }
    if (!prix_journalier_particulier) {
      const error = new Error('Le prix journalier particulier est requis.');
      error.statusCode = 400;
      throw error;
    }

    const vehicle = await Vehicle.create({
      marque: marque.trim(),
      modele: modele.trim(),
      categorie: categorie?.trim() || 'SUV',
      description: description?.trim() || null,
      image_url: image_url || null,
      places: Number(places) || 5,
      carburant: carburant?.trim() || 'Essence',
      transmission: transmission?.trim() || 'Automatique',
      prix_journalier_particulier: Number(prix_journalier_particulier),
      prix_journalier_entreprise: Number(prix_journalier_entreprise || prix_journalier_particulier),
      prix_journalier_entreprise_client: prix_journalier_entreprise_client ? Number(prix_journalier_entreprise_client) : null,
      disponibilite: disponibilite !== false,
      statut: 'ACTIVE',
    });

    response.status(201).json({ vehicle });
  } catch (error) {
    next(error);
  }
}

async function getAllVehicles(_request, response, next) {
  try {
    const { Vehicle } = require('../models/index.cjs');
    
    const vehicles = await Vehicle.findAll({
      where: { statut: { [Op.in]: ['ACTIVE', 'MAINTENANCE'] } },
      order: [['categorie', 'ASC'], ['marque', 'ASC']],
    });

    response.json({ vehicles });
  } catch (error) {
    next(error);
  }
}

async function updateVehicle(request, response, next) {
  try {
    const { Vehicle } = require('../models/index.cjs');
    
    const vehicle = await Vehicle.findByPk(request.params.id);
    if (!vehicle) {
      return response.status(404).json({ message: 'Véhicule non trouvé' });
    }

    await vehicle.update(request.body);
    response.json({ vehicle });
  } catch (error) {
    next(error);
  }
}

async function deleteVehicle(request, response, next) {
  try {
    const { Vehicle } = require('../models/index.cjs');
    
    const vehicle = await Vehicle.findByPk(request.params.id);
    if (!vehicle) {
      return response.status(404).json({ message: 'Véhicule non trouvé' });
    }

    await vehicle.update({ statut: 'INACTIVE' });
    response.json({ message: 'Véhicule désactivé' });
  } catch (error) {
    next(error);
  }
}

// Export des véhicules en Excel
async function exportVehicles(request, response, next) {
  try {
    const { Vehicle, VehicleCompanyPrice } = require('../models/index.cjs');
    
    const companies = await Company.findAll({
      include: [{ model: Client, as: 'client', attributes: ['id', 'type_client'] }],
      order: [['nom', 'ASC']],
    });
    const entrepriseClients = companies.filter(c => c.client?.type_client === 'ENTREPRISE_CLIENT');

    const vehicles = await Vehicle.findAll({
      where: { statut: { [Op.in]: ['ACTIVE', 'MAINTENANCE'] } },
      include: [{ model: VehicleCompanyPrice, as: 'prixEntreprises' }],
      order: [['categorie', 'ASC'], ['marque', 'ASC']],
    });

    // Préparer les données pour Excel
    const data = vehicles.map(vehicle => {
      const row = {
        'ID': vehicle.id,
        'Marque': vehicle.marque,
        'Modèle': vehicle.modele,
        'Catégorie': vehicle.categorie,
        'Places': vehicle.places,
        'Transmission': vehicle.transmission || '',
        'Prix Particulier': parseFloat(vehicle.prix_journalier_particulier),
        'Prix Entreprise': parseFloat(vehicle.prix_journalier_entreprise || vehicle.prix_journalier_particulier),
        'Disponibilité': vehicle.disponibilite ? 'OUI' : 'NON',
        'Description': vehicle.description || '',
      };

      // Ajouter une colonne par entreprise client
      for (const company of entrepriseClients) {
        const companyPrice = vehicle.prixEntreprises?.find(p => p.entreprise_id === company.id);
        row[company.nom] = companyPrice ? parseFloat(companyPrice.prix_journalier) : '';
      }

      return repairExcelRow(row);
    });

    // Créer le workbook et worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Largeur des colonnes
    const cols = [
      { wch: 38 }, // ID
      { wch: 15 }, // Marque
      { wch: 20 }, // Modèle
      { wch: 15 }, // Catégorie
      { wch: 8 },  // Places
      { wch: 12 }, // Transmission
      { wch: 20 }, // Prix Particulier
      { wch: 20 }, // Prix Entreprise
      { wch: 12 }, // Disponibilité
      { wch: 50 }, // Description
    ];
    for (const company of entrepriseClients) {
      cols.push({ wch: 20 }); // Colonne par entreprise client
    }
    ws['!cols'] = cols;

    // Ajouter le worksheet au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Véhicules');

    // Générer le buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Envoyer le fichier
    response.setHeader('Content-Disposition', `attachment; filename=vehicules-soutarah-${new Date().toISOString().split('T')[0]}.xlsx`);
    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.send(buffer);
  } catch (error) {
    console.error('Erreur export véhicules:', error);
    next(error);
  }
}

// Import des véhicules depuis Excel
async function importVehicles(request, response, next) {
  try {
    if (!request.file) {
      return response.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const { Vehicle, VehicleCompanyPrice } = require('../models/index.cjs');

    // Récupérer les entreprises clients pour les colonnes spécifiques
    const companies = await Company.findAll({
      include: [{ model: Client, as: 'client', attributes: ['id', 'type_client'] }],
      order: [['nom', 'ASC']],
    });
    const entrepriseClients = companies.filter(c => c.client?.type_client === 'ENTREPRISE_CLIENT');

    // Lire le fichier Excel
    const workbook = XLSX.readFile(request.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let updated = 0;
    let errors = [];

    // Mettre à jour les véhicules
    for (const row of data) {
      try {
        const vehicleId = row['ID'];
        const marque = row['Marque'];
        const modele = row['Modèle'];
        const categorie = row['Catégorie'];
        const places = parseInt(row['Places']);
        const carburant = row['Carburant'];
        const transmission = row['Transmission'];
        const prixParticulier = parseFloat(row['Prix Particulier'] ?? row['Prix Particulier/Entreprise'] ?? row['Prix Particulier et Entreprise']);
        const prixEntreprise = parseFloat(row['Prix Entreprise'] ?? row['Prix Client Entreprise'] ?? row['Prix Particulier/Entreprise'] ?? row['Prix Particulier et Entreprise']);
        const disponibilite = row['Disponibilité'] === 'OUI';
        const description = row['Description'];

        if (!vehicleId || !marque || !modele) {
          errors.push(`Ligne ignorée: ${marque} ${modele} - ID, marque ou modèle manquant`);
          continue;
        }

        // Mettre à jour le véhicule
        const vehicle = await Vehicle.findByPk(vehicleId);
        if (!vehicle) {
          errors.push(`Véhicule ${marque} ${modele} (ID: ${vehicleId}) non trouvé`);
          continue;
        }

        await vehicle.update({
          marque,
          modele,
          categorie: categorie || vehicle.categorie,
          places: isNaN(places) ? vehicle.places : places,
          carburant: carburant || vehicle.carburant,
          transmission: transmission || vehicle.transmission,
          prix_journalier_particulier: isNaN(prixParticulier) ? vehicle.prix_journalier_particulier : prixParticulier,
          prix_journalier_entreprise: isNaN(prixEntreprise) ? vehicle.prix_journalier_entreprise : prixEntreprise,
          disponibilite,
          description: description || vehicle.description,
        });

        // Mettre à jour les prix spécifiques par entreprise client
        for (const company of entrepriseClients) {
          const companyPrice = parseFloat(row[company.nom]);
          if (!isNaN(companyPrice)) {
            const [price, created] = await VehicleCompanyPrice.findOrCreate({
              where: { vehicule_id: vehicle.id, entreprise_id: company.id },
              defaults: { vehicule_id: vehicle.id, entreprise_id: company.id, prix_journalier: companyPrice },
            });
            if (!created) {
              await price.update({ prix_journalier: companyPrice });
            }
          }
        }

        updated++;
      } catch (error) {
        errors.push(`Erreur pour ${row['Marque']} ${row['Modèle']}: ${error.message}`);
      }
    }

    // Supprimer le fichier temporaire
    fs.unlinkSync(request.file.path);

    response.json({
      success: true,
      updated,
      errors: errors.length > 0 ? errors : undefined,
      message: `${updated} véhicule(s) mis à jour avec succès${errors.length > 0 ? ` (${errors.length} erreurs)` : ''}`,
    });
  } catch (error) {
    // Supprimer le fichier en cas d'erreur
    if (request.file && fs.existsSync(request.file.path)) {
      fs.unlinkSync(request.file.path);
    }
    console.error('Erreur import véhicules:', error);
    next(error);
  }
}

// ===== PRIX PAR ENTREPRISE CLIENT =====
async function getCompanyPricing(_request, response, next) {
  try {
    const { VehicleCompanyPrice } = require('../models/index.cjs');
    const companies = await Company.findAll({
      include: [
        { model: Client, as: 'client', attributes: ['id', 'type_client'] },
        { model: VehicleCompanyPrice, as: 'prixVehicules' },
        { model: Tariff, as: 'tarifs' },
      ],
      order: [['nom', 'ASC']],
    });

    response.json({ companies });
  } catch (error) {
    next(error);
  }
}

async function saveCompanyVehiclePrice(request, response, next) {
  try {
    const { VehicleCompanyPrice } = require('../models/index.cjs');
    const { entreprise_id, vehicule_id, prix_journalier } = request.body;

    if (!entreprise_id || !vehicule_id || prix_journalier == null) {
      return response.status(400).json({ message: 'entreprise_id, vehicule_id et prix_journalier sont requis.' });
    }

    const [price, created] = await VehicleCompanyPrice.findOrCreate({
      where: { entreprise_id, vehicule_id },
      defaults: { entreprise_id, vehicule_id, prix_journalier: Number(prix_journalier) },
    });

    if (!created) {
      await price.update({ prix_journalier: Number(prix_journalier) });
    }

    response.status(201).json({ price });
  } catch (error) {
    next(error);
  }
}

async function deleteCompanyVehiclePrice(request, response, next) {
  try {
    const { VehicleCompanyPrice } = require('../models/index.cjs');
    const { id } = request.params;
    const price = await VehicleCompanyPrice.findByPk(id);
    if (!price) {
      return response.status(404).json({ message: 'Prix non trouvé' });
    }
    await price.destroy();
    response.json({ message: 'Prix supprimé' });
  } catch (error) {
    next(error);
  }
}

async function saveCompanyProductPrice(request, response, next) {
  try {
    const { produit_id, entreprise_id, prix } = request.body;

    if (!produit_id || !entreprise_id || prix == null) {
      return response.status(400).json({ message: 'produit_id, entreprise_id et prix sont requis.' });
    }

    const [tariff, created] = await Tariff.findOrCreate({
      where: { produit_id, type_client: 'ENTREPRISE_CLIENT', entreprise_id },
      defaults: { produit_id, type_client: 'ENTREPRISE_CLIENT', entreprise_id, prix: Number(prix) },
    });

    if (!created) {
      await tariff.update({ prix: Number(prix) });
    }

    response.status(201).json({ tariff });
  } catch (error) {
    next(error);
  }
}

async function deleteCompanyProductPrice(request, response, next) {
  try {
    const { id } = request.params;
    const tariff = await Tariff.findByPk(id);
    if (!tariff) {
      return response.status(404).json({ message: 'Tarif non trouvé' });
    }
    await tariff.destroy();
    response.json({ message: 'Tarif supprimé' });
  } catch (error) {
    next(error);
  }
}

// ===== RÉSERVATIONS =====
async function getAllReservations(_request, response, next) {
  try {
    const reservations = await Reservation.findAll({
      include: [
        { model: Client, as: 'client', include: [{ model: User, as: 'user' }] },
        { model: Vehicle, as: 'vehicule' },
      ],
      order: [['cree_le', 'DESC']],
    });

    response.json({ reservations });
  } catch (error) {
    next(error);
  }
}

async function updateReservationStatus(request, response, next) {
  try {
    const { statut, note_gestionnaire } = request.body;
    const reservation = await Reservation.findByPk(request.params.id);

    if (!reservation) {
      return response.status(404).json({ message: 'Réservation non trouvée' });
    }

    await reservation.update({ statut, note_gestionnaire });
    response.json({ reservation });
  } catch (error) {
    next(error);
  }
}

// ===== DEVIS =====
async function getAllQuotes(_request, response, next) {
  try {
    // Utiliser QuoteRequest au lieu de Quote car c'est là que les demandes sont stockées
    const { QuoteRequest } = require('../models/index.cjs');
    
    const quotes = await QuoteRequest.findAll({
      include: [
        { model: Client, as: 'client', include: [{ model: User, as: 'user' }] },
      ],
      order: [['cree_le', 'DESC']],
    });

    const formattedQuotes = quotes.map(q => {
      let snapshot = null;
      if (q.snapshot) {
        try {
          snapshot = JSON.parse(q.snapshot);
        } catch (e) {
          snapshot = null;
        }
      }
      return {
      id: q.id,
      reference: q.reference,
      statut: q.statut === 'PENDING' ? 'ISSUED' : q.statut,
      montant_total: 0, // À calculer si nécessaire
      cree_le: q.cree_le,
      client: q.client,
      articles: [], // Les détails ne sont pas stockés dans QuoteRequest
      description: q.description,
      service: q.service,
      titre: q.titre,
      nom: q.nom,
      email: q.email,
      telephone: q.telephone,
      lieu: q.lieu,
      budget: q.budget,
      delai: q.delai,
      entreprise: q.entreprise,
      source: q.source,
      fichier_devis_url: q.fichier_devis_url,
      mode_paiement: q.mode_paiement,
      lu_le: q.lu_le,
      snapshot,
    };
    });

    response.json({ quotes: formattedQuotes });
  } catch (error) {
    next(error);
  }
}

async function updateQuoteStatus(request, response, next) {
  try {
    const { statut } = request.body;
    const { QuoteRequest, Reservation, Vehicle } = require('../models/index.cjs');
    
    const quote = await QuoteRequest.findByPk(request.params.id, {
      include: [
        { model: Client, as: 'client', include: [{ model: User, as: 'user' }] }
      ]
    });

    if (!quote) {
      return response.status(404).json({ message: 'Devis non trouvé' });
    }

    // Bloquer l'envoi au client si le devis signé n'a pas été téléversé
    if (statut === 'SENT' && !quote.fichier_devis_url) {
      return response.status(400).json({
        message: 'Impossible d\'envoyer le devis au client : veuillez d\'abord téléverser le devis signé (PDF) avant de l\'envoyer.',
      });
    }

    await quote.update({ statut });


    // Si le devis est approuvé OU envoyé (signé), créer une réservation
    if ((statut === 'APPROVED' || statut === 'SENT') && quote.client) {
      try {
        // Résoudre le VRAI véhicule : ID stocké dans le snapshot du panier →
        // correspondance par nom → sinon aucune réservation véhicule (jamais
        // de fallback « premier véhicule actif » = bug Toyota Tacoma).
        const { resolveVehicleFromSnapshot } = require('../services/vehicle-resolve.service.cjs');
        const vehicle = await resolveVehicleFromSnapshot(quote.snapshot, quote.titre || '');

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 3);

        // Éviter les doublons : si une réservation existe déjà pour ce devis, on ne recrée pas
        const reservationRef = `RES-${quote.reference || Date.now()}`;
        const existingReservation = await Reservation.findOne({ where: { reference: reservationRef } });

        if (!existingReservation && vehicle) {
          // Créer la réservation en statut CONFIRMED pour qu'elle apparaisse sur le calendrier
          await Reservation.create({
            client_id: quote.client.id,
            vehicule_id: vehicle.id,
            reference: reservationRef,
            commence_le: startDate,
            termine_le: endDate,
            statut: 'CONFIRMED',
            prix_journalier: vehicle.prix_journalier_particulier || 0,
            montant_total: Number(vehicle.prix_journalier_particulier || 0) * 3,
            avec_chauffeur: false,
            expire_le: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            note_gestionnaire: `Devis ${quote.reference} signé/envoyé - ${quote.titre || ''}`.trim(),
          });
          console.log(`✅ Réservation CONFIRMED créée pour le devis ${statut} ${quote.reference} - ${vehicle.marque} ${vehicle.modele}`);
        } else if (!vehicle) {
          console.log(`ℹ️  Aucun véhicule identifiable dans le devis ${quote.reference} — pas de réservation véhicule créée.`);
        } else {
          console.log(`ℹ️  Réservation déjà existante pour ${quote.reference}, pas de doublon.`);
        }
      } catch (resError) {
        console.error('❌ Erreur création réservation:', resError);
      }
    }

    // Envoyer notification au client
    if (statut === 'APPROVED' || statut === 'SENT') {
      try {
        const titre = statut === 'APPROVED' 
          ? 'Devis approuvé !' 
          : 'Devis envoyé !';
        const message = statut === 'APPROVED'
          ? `Votre devis ${quote.reference} a été approuvé par l'administrateur. Vous pouvez le consulter dans votre espace.`
          : `Votre devis ${quote.reference} signé est disponible dans votre espace client.`;

        const recipientUserId = quote.client?.utilisateur_id || quote.utilisateur_id;
        if (recipientUserId) {
          const recipientUser = await User.findByPk(recipientUserId);
          if (recipientUser) {
            await Notification.create({
              utilisateur_destinataire_id: recipientUser.id,
              type: 'QUOTE_APPROVED',
              titre,
              message,
              lien: `/mes-devis`,
              est_lu: false,
            });
            console.log(`✅ Notification devis ${statut} envoyée au client ${quote.client?.prenom || quote.nom}`);
          }
        }
      } catch (notifError) {
        console.error('❌ Erreur notification client devis:', notifError);
      }
    }

    response.json({ quote });
  } catch (error) {
    next(error);
  }
}

// Marquer un devis comme lu par l'admin
async function markQuoteAsRead(request, response, next) {
  try {
    const { QuoteRequest } = require('../models/index.cjs');

    const quote = await QuoteRequest.findByPk(request.params.id);
    if (!quote) {
      return response.status(404).json({ message: 'Devis non trouvé' });
    }

    if (!quote.lu_le) {
      await quote.update({ lu_le: new Date() });
    }

    response.json({ success: true, lu_le: quote.lu_le });
  } catch (error) {
    console.error('Erreur markQuoteAsRead:', error);
    next(error);
  }
}

// Upload du devis signé
async function uploadSignedQuote(request, response, next) {
  try {
    if (!request.file) {
      return response.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const { QuoteRequest } = require('../models/index.cjs');
    const path = require('path');
    
    const quote = await QuoteRequest.findByPk(request.params.id, {
      include: [
        { model: Client, as: 'client', include: [{ model: User, as: 'user' }] }
      ]
    });

    if (!quote) {
      // Supprimer le fichier uploadé
      if (fs.existsSync(request.file.path)) {
        fs.unlinkSync(request.file.path);
      }
      return response.status(404).json({ message: 'Devis non trouvé' });
    }

    // Créer le dossier uploads/quotes s'il n'existe pas
    const quotesDir = path.join(__dirname, '../../uploads/quotes');
    if (!fs.existsSync(quotesDir)) {
      fs.mkdirSync(quotesDir, { recursive: true });
    }

    // Renommer et déplacer le fichier
    const fileExtension = path.extname(request.file.originalname);
    const newFileName = `devis-${quote.reference || quote.id.slice(0, 8)}-signed${fileExtension}`;
    const newFilePath = path.join(quotesDir, newFileName);
    
    // Déplacer le fichier
    fs.renameSync(request.file.path, newFilePath);

    // Sauvegarder le chemin dans la base de données
    const relativeFilePath = `/uploads/quotes/${newFileName}`;
    await quote.update({ 
      fichier_devis_url: relativeFilePath,
      statut: 'APPROVED' // Le devis signé est prêt, l'admin devra cliquer sur "Envoyer au client"
    });

    console.log(`✅ Devis signé uploadé: ${relativeFilePath}`);

    response.json({ 
      success: true, 
      message: 'Devis signé uploadé avec succès',
      file_url: relativeFilePath,
      quote 
    });
  } catch (error) {
    // Supprimer le fichier en cas d'erreur
    if (request.file && fs.existsSync(request.file.path)) {
      fs.unlinkSync(request.file.path);
    }
    console.error('Erreur upload devis signé:', error);
    next(error);
  }
}

// ===== PROMOTIONS =====
async function getAllPromotions(_request, response, next) {
  try {
    const promotions = await Promotion.findAll({
      include: [
        { model: Product, as: 'produit', required: false },
        { model: Vehicle, as: 'vehicule', required: false },
      ],
      order: [['cree_le', 'DESC']],
    });

    response.json({ promotions });
  } catch (error) {
    next(error);
  }
}

async function createPromotion(request, response, next) {
  try {
    const promotion = await Promotion.create(request.body);
    response.status(201).json({ promotion });
  } catch (error) {
    next(error);
  }
}

async function updatePromotion(request, response, next) {
  try {
    const promotion = await Promotion.findByPk(request.params.id);
    if (!promotion) {
      return response.status(404).json({ message: 'Promotion non trouvée' });
    }

    await promotion.update(request.body);
    response.json({ promotion });
  } catch (error) {
    next(error);
  }
}

async function deletePromotion(request, response, next) {
  try {
    const promotion = await Promotion.findByPk(request.params.id);
    if (!promotion) {
      return response.status(404).json({ message: 'Promotion non trouvée' });
    }

    await promotion.destroy();
    response.json({ message: 'Promotion supprimée' });
  } catch (error) {
    next(error);
  }
}

// ===== STOCKS =====
async function getStockMovements(request, response, next) {
  try {
    const where = {};
    if (request.query.productId) where.produit_id = request.query.productId;

    const movements = await StockMovement.findAll({
      where,
      include: [
        { model: Product, as: 'produit' },
        { model: User, as: 'creePar', required: false },
      ],
      order: [['cree_le', 'DESC']],
      limit: 100,
    });

    response.json({ movements });
  } catch (error) {
    next(error);
  }
}

async function addStockMovement(request, response, next) {
  try {
    const { produit_id, type, quantite, motif, reference } = request.body;

    const product = await Product.findByPk(produit_id);
    if (!product) {
      return response.status(404).json({ message: 'Produit non trouvé' });
    }

    const movement = await StockMovement.create({
      produit_id,
      cree_par_utilisateur_id: request.auth.user.id,
      type,
      quantite,
      motif,
      reference,
    });

    // Mettre à jour le stock
    let newStock = parseFloat(product.stock);
    if (type === 'IN') newStock += parseFloat(quantite);
    else if (type === 'OUT') newStock -= parseFloat(quantite);
    else newStock = parseFloat(quantite); // ADJUSTMENT

    await product.update({ stock: Math.max(0, newStock) });

    response.status(201).json({ movement });
  } catch (error) {
    next(error);
  }
}

async function getLowStockAlerts(_request, response, next) {
  try {
    const products = await Product.findAll({
      where: {
        statut: 'ACTIVE',
        stock: { [Op.lte]: sequelize.col('seuil_alerte') },
      },
      include: [{ model: Category, as: 'categorie' }],
      order: [['stock', 'ASC']],
    });

    response.json({ alerts: products });
  } catch (error) {
    next(error);
  }
}

// ===== DASHBOARD =====
async function getDashboardStats(_request, response, next) {
  try {
    // Date il y a 30 jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { QuoteRequest } = require('../models/index.cjs');

    const [
      clientsTotal,
      clientsNew,
      reservationsTotal,
      reservationsEnCours,
      quotesTotal,
      quotesPending,
      quotesNonLus
    ] = await Promise.all([
      Client.count(),
      Client.count({ where: { cree_le: { [Op.gte]: thirtyDaysAgo } } }),
      Reservation.count(),
      Reservation.count({ where: { statut: { [Op.in]: ['CONFIRMED', 'PENDING'] } } }),
      QuoteRequest.count(),
      QuoteRequest.count({ where: { statut: { [Op.in]: ['PENDING', 'ISSUED', 'CONTACTED'] } } }),
      QuoteRequest.count({ where: { lu_le: null } }),
    ]);

    response.json({
      stats: {
        clients: { total: clientsTotal, nouveau: clientsNew },
        devis: { total: quotesTotal, enAttente: quotesPending, nonLus: quotesNonLus },
        reservations: { total: reservationsTotal, enCours: reservationsEnCours },
      },
    });
  } catch (error) {
    console.error('Erreur getDashboardStats:', error);
    next(error);
  }
}
// ===== DASHBOARD : ÉVOLUTION DES VENTES =====
function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const SALES_MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const SALES_WEEKDAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

async function getSalesEvolution(request, response, next) {
  try {
    const { Reservation, QuoteRequest } = require('../models/index.cjs');

    const period = parseInt(request.query.period, 10);
    const days = [7, 30, 90].includes(period) ? period : 7;

    // Début de la période (minuit, il y a (days - 1) jours)
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (days - 1));

    // Ventes réelles n°1 : réservations CONFIRMED créées sur la période (avec CA)
    const reservationsParJour = await Reservation.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('cree_le')), 'jour'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('montant_total')), 0), 'ca'],
      ],
      where: { cree_le: { [Op.gte]: startDate }, statut: 'CONFIRMED' },
      group: [sequelize.fn('DATE', sequelize.col('cree_le'))],
      raw: true,
    });

    // Ventes réelles n°2 : demandes de devis CONVERTED (converties en commandes)
    const devisParJour = await QuoteRequest.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('cree_le')), 'jour'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
      ],
      where: { cree_le: { [Op.gte]: startDate }, statut: 'CONVERTED' },
      group: [sequelize.fn('DATE', sequelize.col('cree_le'))],
      raw: true,
    });

    const reservationsMap = new Map();
    reservationsParJour.forEach((row) => {
      reservationsMap.set(dayKey(new Date(row.jour)), {
        total: Number(row.total) || 0,
        ca: Number(row.ca) || 0,
      });
    });

    const devisMap = new Map();
    devisParJour.forEach((row) => {
      devisMap.set(dayKey(new Date(row.jour)), Number(row.total) || 0);
    });

    // Construction des buckets : par jour (7j / 30j) ou par semaine (90j)
    const buckets = [];

    if (days === 90) {
      // Regroupement par semaines de 7 jours, du plus ancien au plus récent
      const weekStart = new Date(startDate);
      const now = new Date();
      while (weekStart <= now) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        let ventes = 0;
        let reservations = 0;
        let devis = 0;
        let ca = 0;

        const cursor = new Date(weekStart);
        while (cursor <= weekEnd) {
          const key = dayKey(cursor);
          const res = reservationsMap.get(key);
          if (res) {
            ventes += res.total;
            reservations += res.total;
            ca += res.ca;
          }
          const dv = devisMap.get(key);
          if (dv) {
            ventes += dv;
            devis += dv;
          }
          cursor.setDate(cursor.getDate() + 1);
        }

        buckets.push({
          label: `${weekStart.getDate()} ${SALES_MONTHS_SHORT[weekStart.getMonth()]}`,
          ventes,
          reservations,
          devis,
          ca,
        });

        weekStart.setDate(weekStart.getDate() + 7);
      }
    } else {
      const cursor = new Date(startDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      while (cursor <= today) {
        const key = dayKey(cursor);
        const res = reservationsMap.get(key) || { total: 0, ca: 0 };
        const dv = devisMap.get(key) || 0;

        buckets.push({
          label: days === 7
            ? SALES_WEEKDAYS_SHORT[cursor.getDay()]
            : `${cursor.getDate()} ${SALES_MONTHS_SHORT[cursor.getMonth()]}`,
          ventes: res.total + dv,
          reservations: res.total,
          devis: dv,
          ca: res.ca,
        });

        cursor.setDate(cursor.getDate() + 1);
      }
    }

    const total = buckets.reduce(
      (acc, b) => ({
        ventes: acc.ventes + b.ventes,
        reservations: acc.reservations + b.reservations,
        devis: acc.devis + b.devis,
        ca: acc.ca + b.ca,
      }),
      { ventes: 0, reservations: 0, devis: 0, ca: 0 },
    );

    response.json({ period: days, buckets, total });
  } catch (error) {
    console.error('Erreur getSalesEvolution:', error);
    next(error);
  }
}

// ===== ANNONCES (BARRE DÉFILANTE) =====

// ===== ANNONCES (BARRE DÉFILANTE) =====
async function getAnnouncements(_request, response, next) {
  try {
    const { Setting } = require('../models/index.cjs');
    const setting = await Setting.findOne({ where: { cle: 'announcements' } });
    const raw = setting?.valeur;

    // Ancien format : tableau simple d'annonces
    if (Array.isArray(raw)) {
      return response.json({ announcements: repairRecursive(raw), barHeight: 34 });
    }

    // Nouveau format : { items: [...], barHeight: 34 }
    return response.json({
      announcements: repairRecursive(raw?.items || []),
      barHeight: Number(raw?.barHeight) || 34,
    });
  } catch (error) {
    next(error);
  }
}

async function saveAnnouncements(request, response, next) {
  try {
    const { Setting } = require('../models/index.cjs');
    const { announcements, barHeight } = request.body;

    const items = Array.isArray(announcements) ? announcements : (announcements?.items || []);
    if (!Array.isArray(items)) {
      return response.status(400).json({ message: 'Liste d\'annonces invalide' });
    }

    const payload = {
      items,
      barHeight: Number(barHeight) || 34,
    };

    const existing = await Setting.findOne({ where: { cle: 'announcements' } });
    if (existing) {
      await existing.update({ valeur: payload });
    } else {
      await Setting.create({ cle: 'announcements', valeur: payload });
    }
    response.json({ success: true, announcements: items, barHeight: payload.barHeight });
  } catch (error) {
    next(error);
  }
}

// ===== PARAMÈTRES =====
async function getSettings(_request, response, next) {
  try {
    const { Setting } = require('../models/index.cjs');
    const settings = await Setting.findAll();
    const result = {};
    settings.forEach((s) => {
      result[s.cle] = repairRecursive(s.valeur);
    });
    response.json({ settings: result });
  } catch (error) {
    next(error);
  }
}

async function saveSettings(request, response, next) {
  try {
    const { Setting } = require('../models/index.cjs');
    const { settings } = request.body;

    if (!settings || typeof settings !== 'object') {
      return response.status(400).json({ message: 'Paramètres invalides' });
    }

    for (const [cle, valeur] of Object.entries(settings)) {
      const existing = await Setting.findOne({ where: { cle } });
      if (existing) {
        await existing.update({ valeur });
      } else {
        await Setting.create({ cle, valeur });
      }
    }

    response.json({ success: true, message: 'Paramètres enregistrés avec succès' });
  } catch (error) {
    console.error('Erreur saveSettings:', error);
    next(error);
  }
}

// Changer le statut d'un client (bloquer/débloquer)
/**
 * Suppression definitive d'un compte client (particulier ou entreprise).
 * L'ordre compte a cause des cles etrangeres : les tables enfants d'abord,
 * puis l'entreprise, le client et enfin le compte utilisateur.
 * Les reservations sont protegees : on refuse la suppression si le compte
 * en possede, plutot que de detruire l'historique.
 */
async function deleteClient(request, response, next) {
  const transaction = await sequelize.transaction();
  try {
    const { id } = request.params;
    const client = await Client.findOne({
      where: { id },
      include: [{ model: Company, as: 'entreprise' }],
      transaction,
    });
    if (!client) {
      await transaction.rollback();
      return response.status(404).json({ message: 'Client introuvable.' });
    }

    // Garde-fou : des reservations bloquent la suppression (cle etrangere).
    const reservations = await Reservation.count({ where: { client_id: id }, transaction });
    if (reservations > 0) {
      await transaction.rollback();
      return response.status(409).json({
        message: `Suppression impossible : ce compte est lié à ${reservations} réservation(s). ` +
          'Désactivez le compte ou supprimez d\'abord les réservations.',
      });
    }

    const utilisateurId = client.utilisateur_id;

    // Nettoyage des donnees dependantes
    await Notification.destroy({ where: { utilisateur_id: utilisateurId }, transaction });
    await Quote.destroy({ where: { client_id: id }, transaction });
    await Company.destroy({ where: { client_id: id }, transaction });
    await Client.destroy({ where: { id }, transaction });
    await User.destroy({ where: { id: utilisateurId }, transaction });

    await transaction.commit();
    return response.json({ message: 'Compte client supprimé.' });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
}

async function updateClientStatus(request, response, next) {
  try {
    const { id } = request.params;
    const { est_actif } = request.body;

    const user = await User.findByPk(id);
    if (!user) {
      return response.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    await user.update({ est_actif });

    response.json({ 
      success: true, 
      message: est_actif ? 'Compte débloqué' : 'Compte bloqué',
      user: { id: user.id, est_actif: user.est_actif }
    });
  } catch (error) {
    next(error);
  }
}

// Réinitialiser le mot de passe d'un client (depuis l'espace admin)
async function resetClientPassword(request, response, next) {
  try {
    const { id } = request.params;
    const password = (request.body.password || '').trim();

    if (password.length < 8) {
      return response.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
    }

    const user = await User.findByPk(id);
    if (!user) return response.status(404).json({ message: 'Utilisateur non trouvé' });

    await user.update({ mot_de_passe_hash: await hashPassword(password) });

    response.json({ success: true, message: 'Mot de passe mis à jour' });
  } catch (error) {
    next(error);
  }
}

// Examen des documents d'entreprise (approbation / rejet)
async function reviewClientVerification(request, response, next) {
  try {
    const { id } = request.params;
    const { status, note } = request.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return response.status(400).json({ message: 'Statut invalide. Utilisez APPROVED ou REJECTED.' });
    }

    const client = await Client.findByPk(id, {
      include: [{ model: User, as: 'user' }, { model: Company, as: 'entreprise' }],
    });
    if (!client) return response.status(404).json({ message: 'Client introuvable' });
    if (!client.entreprise) return response.status(400).json({ message: 'Ce client n’est pas une entreprise' });

    await client.entreprise.update({
      verification_status: status,
      note_verification: note?.trim() || null,
      verifie_le: new Date(),
    });

    // Approuvé → active le compte utilisateur ; rejeté → le laisse inactif
    if (client.user) {
      await client.user.update({ est_actif: status === 'APPROVED' });
    }

    // Notification de la décision au client
    if (client.user) {
      try {
        await Notification.create({
          utilisateur_destinataire_id: client.user.id,
          type: status === 'APPROVED' ? 'NEW_ACCOUNT' : 'CART_VALIDATED',
          titre: status === 'APPROVED' ? 'Compte entreprise approuvé' : 'Inscription entreprise refusée',
          message: status === 'APPROVED'
            ? `Félicitations ! Votre compte entreprise (${client.entreprise.nom}) a été validé. Vous pouvez vous connecter avec vos propres tarifs.`
            : `Votre inscription d’entreprise (${client.entreprise.nom}) a été refusée. ${note ? note : 'Contactez-nous pour plus d’informations.'}`,
          lien: '/client',
          est_lu: false,
        });
      } catch (e) {
        console.error('Erreur notification décision entreprise:', e.message);
      }
    }

    response.json({
      success: true,
      message: status === 'APPROVED' ? 'Entreprise approuvée, compte activé.' : 'Inscription entreprise refusée.',
      verification_status: status,
    });
  } catch (error) {
    next(error);
  }
}
// Conversion d'une entreprise simple en entreprise cliente (avec délai de blocage optionnel)
async function convertEntrepriseClient(request, response, next) {
  try {
    const { id } = request.params;
    const { delai_blocage_jours } = request.body;

    let delai = null;
    if (delai_blocage_jours !== null && delai_blocage_jours !== undefined && delai_blocage_jours !== '') {
      delai = Number(delai_blocage_jours);
      if (!Number.isInteger(delai) || delai <= 0) {
        return response.status(400).json({ message: 'Le délai de blocage doit être un nombre entier de jours positif, ou null (sans durée).' });
      }
    }

    const client = await Client.findByPk(id, {
      include: [{ model: User, as: 'user' }, { model: Company, as: 'entreprise' }],
    });
    if (!client) return response.status(404).json({ message: 'Client introuvable' });
    if (client.type_client !== 'ENTREPRISE') {
      return response.status(400).json({ message: 'Seul un compte de type "Entreprise" peut être converti en entreprise cliente.' });
    }

    await client.update({
      type_client: 'ENTREPRISE_CLIENT',
      delai_blocage_jours: delai,
      bloque_le: null,
    });

    // Ancrer le délai à la date de conversion (le login compte les jours depuis verifie_le)
    if (client.entreprise) {
      await client.entreprise.update({ verifie_le: new Date() });
    }

    // Activer le compte utilisateur (l'entreprise a passé la validation pour être convertie)
    if (client.user) {
      await client.user.update({ est_actif: true });
    }

    // Notification au client
    if (client.user) {
      try {
        await Notification.create({
          utilisateur_destinataire_id: client.user.id,
          type: 'NEW_ACCOUNT',
          titre: 'Compte entreprise cliente activé',
          message: delai
            ? `Votre compte (${client.entreprise?.nom || 'entreprise'}) est désormais une entreprise cliente SOUTARAH. Il restera actif pendant ${delai} jour(s), puis sera bloqué automatiquement.`
            : `Votre compte (${client.entreprise?.nom || 'entreprise'}) est désormais une entreprise cliente SOUTARAH, sans limite de durée.`,
          lien: '/client',
          est_lu: false,
        });
      } catch (e) {
        console.error('Erreur notification conversion entreprise:', e.message);
      }
    }

    response.json({
      success: true,
      message: delai
        ? `Entreprise convertie en entreprise cliente (blocage automatique après ${delai} jour(s)).`
        : 'Entreprise convertie en entreprise cliente (sans durée de blocage).',
      type_client: 'ENTREPRISE_CLIENT',
      delai_blocage_jours: delai,
    });
  } catch (error) {
    next(error);
  }
}

// Téléchargement d'un vrai document d'entreprise par l'admin
async function downloadClientDocument(request, response, next) {
  try {
    const path = require('path');
    const { id, docIndex } = request.params;
    const index = Number(docIndex);

    const client = await Client.findByPk(id, {
      include: [{ model: Company, as: 'entreprise' }],
    });
    if (!client || !client.entreprise) {
      return response.status(404).json({ message: 'Entreprise introuvable' });
    }

    const documents = Array.isArray(client.entreprise.documents) ? client.entreprise.documents : [];
    const doc = documents[index];
    if (!doc) {
      return response.status(404).json({ message: 'Document introuvable' });
    }

    // Le fichier est stocké dans uploads/ avec son nom multer (doc.filename)
    const uploadsDir = path.join(__dirname, '../../uploads');
    const safeName = path.basename(String(doc.filename || ''));
    const filePath = path.join(uploadsDir, safeName);

    if (!fs.existsSync(filePath)) {
      return response.status(404).json({ message: `Fichier non trouvé sur le serveur (${safeName}).` });
    }

    // Envoyer le vrai fichier avec son nom original
    response.download(filePath, doc.originalname || safeName, (err) => {
      if (err) next(err);
    });
  } catch (error) {
    next(error);
  }
}

// Upload du devis signé

// Upload du devis signé
async function uploadSignedQuote(request, response, next) {
  try {
    const { QuoteRequest } = require('../models/index.cjs');
    const quote = await QuoteRequest.findByPk(request.params.id);
    if (!quote) return response.status(404).json({ message: 'Devis non trouvé' });
    if (!request.file) return response.status(400).json({ message: 'Aucun fichier fourni' });

    const fs = require('fs');
    const path = require('path');
    const ext = path.extname(request.file.originalname) || '.pdf';
    const newFilename = 'devis-' + quote.reference + '-signed' + ext;
    
    // Assurer que le dossier existe (on utilise uploads/quotes)
    const targetDir = path.join(__dirname, '../../uploads/quotes');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const targetPath = path.join(targetDir, newFilename);
    fs.renameSync(request.file.path, targetPath);
    
    const file_url = '/uploads/quotes/' + newFilename;
    await quote.update({ fichier_devis_url: file_url, statut: 'SENT' });
    
    response.json({ success: true, file_url, quote });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllClients,
  createClient,
  deleteClient,
  updateClientStatus,
  resetClientPassword,
  reviewClientVerification,
  convertEntrepriseClient,
  downloadClientDocument,
  getCompanyPricing,
  saveCompanyVehiclePrice,
  deleteCompanyVehiclePrice,
  saveCompanyProductPrice,
  deleteCompanyProductPrice,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  exportProductPrices,
  importProductPrices,
  getAllVehicles,
  createVehicle,
  exportVehicles,
  importVehicles,
  updateVehicle,
  deleteVehicle,
  getAllReservations,
  updateReservationStatus,
  getAllQuotes,
  updateQuoteStatus,
  markQuoteAsRead,
  uploadSignedQuote,
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getStockMovements,
  addStockMovement,
  getLowStockAlerts,
  getDashboardStats,
  getSalesEvolution,
  getSettings,
  saveSettings,
  getAnnouncements,
  saveAnnouncements,
};
