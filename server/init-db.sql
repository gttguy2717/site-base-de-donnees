-- Script d'initialisation de la base de données SOUTARAH GROUP
-- À exécuter avec un utilisateur PostgreSQL admin (postgres)

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS soutarah_group;

-- Se connecter à la base
\c soutarah_group;

-- Les tables seront créées automatiquement par Sequelize migrations
-- Ce fichier sert juste de référence

-- Pour exécuter ce script:
-- psql -U postgres -f init-db.sql
