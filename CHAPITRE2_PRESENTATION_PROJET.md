# Chapitre 2 : Présentation du projet

## I. Contexte du projet

Le secteur des services représente l'un des piliers essentiels de l'économie en Côte d'Ivoire, tant pour la création d'emplois que pour le développement socio-économique. Cependant, ce secteur fait face à de multiples défis : gestion manuelle des demandes de devis, absence de suivi centralisé des clients, risques de double réservation des véhicules, manque d'accès à des outils numériques fiables, et dépendance aux méthodes traditionnelles de gestion.

Dans un contexte de transformation numérique et de concurrence croissante, il devient indispensable de moderniser les pratiques de gestion des entreprises à travers l'intégration des technologies de l'information et de la communication (TIC).

C'est dans cette dynamique que s'inscrit **SOUTARAH GROUP**, une société à responsabilité limitée (SARL) basée à Abidjan, dont la mission est d'offrir des services de qualité dans les domaines de la location de véhicules, du négoce et de l'import-export, ainsi que de l'accompagnement de projets.

Le projet vise à développer une plateforme web de gestion intégrée capable de centraliser l'ensemble des processus métiers de l'entreprise, de gérer la relation client et de sécuriser les réservations, afin d'améliorer la productivité et la satisfaction des clients.

## II. Étude de l'existant

Avant la réalisation de cette plateforme, SOUTARAH GROUP utilisait des méthodes de gestion traditionnelles. L'étude de l'existant a permis d'identifier les outils et procédures suivants :

| Outil / Méthode | Description | Utilisation |
|---|---|---|
| **Cahier de demandes** | Registre papier pour noter les demandes de devis des clients | Réception des demandes à l'accueil |
| **Téléphone / WhatsApp** | Communication directe avec les clients | Réception des demandes, échanges d'informations |
| **Email** | Envoi et réception de messages | Réception des demandes de devis, envoi des propositions |
| **Excel** | Tableurs pour le suivi des clients et des devis | Gestion manuelle des données |
| **Site vitrine statique** | Page web de présentation sans fonctionnalités | Présentation de l'entreprise et des services |é

## III. Critique de l'existant

L'analyse critique du système existant a révélé plusieurs insuffisances majeures :

| Insuffisance | Conséquences |
|---|---|
| **Gestion manuelle des demandes de devis** | Perte d'informations, lenteur de traitement, absence de traçabilité |
| **Absence de suivi centralisé des clients** | Difficulté à connaître l'historique des clients et leurs besoins |
| **Risque de double réservation des véhicules** | Conflits de réservation, insatisfaction des clients |
| **Absence d'espace client en ligne** | Le client ne peut pas suivre l'état de ses demandes |
| **Absence de notifications automatiques** | Ni les clients ni l'administration ne sont informés en temps réel |
| **Catalogue non dynamique** | Difficulté à mettre à jour les prix et les stocks |
| **Aucune génération automatique de documents** | Devis établis manuellement, risque d'erreurs |

Ces insuffisances justifient pleinement la nécessité de concevoir et de développer une plateforme web de gestion intégrée.

## IV. Problématique

Malgré le potentiel commercial important de SOUTARAH GROUP, la gestion de ses activités demeure confrontée à plusieurs difficultés. Face à ce constat, la question principale que le projet cherche à résoudre est la suivante :

> **Comment concevoir et développer une plateforme web de gestion intégrée permettant à SOUTARAH GROUP de centraliser la gestion de ses services, d'optimiser sa relation client et de sécuriser ses réservations ?**

Le développement d'une plateforme web intégrée, accessible et évolutive, permettra donc de combler ce déficit technologique, tout en valorisant les données commerciales de l'entreprise.

## V. Objectifs du projet

### V.1. Objectif général

Concevoir et réaliser une plateforme web de gestion intégrée des services, de la relation client et des réservations de SOUTARAH GROUP.

### V.2. Objectifs spécifiques

- Concevoir une base de données intégrant les informations sur les clients, les produits, les véhicules, les devis et les réservations ;
- Développer un site web vitrine présentant l'entreprise, ses services et sa flotte de véhicules ;
- Mettre en place un catalogue en ligne de produits de négoce et de véhicules avec des tarifs personnalisés selon le profil client ;
- Permettre aux clients de constituer un panier (produits et locations de véhicules) et de demander des devis en ligne ;
- Garantir la disponibilité des véhicules en implémentant un mécanisme de vérification anti-double-réservation ;
- Offrir un espace client personnalisé permettant le suivi des devis, la consultation des notifications et la gestion du profil ;
- Fournir un back-office complet à l'administration pour la gestion des clients, du catalogue, des devis, des réservations, des annonces et des notifications ;
- Automatiser l'envoi de notifications aux clients et à l'administration ;
- Générer des devis au format PDF avec le calcul automatique des taxes (TVA 18%, TDT 2,5%) ;
- Intégrer un assistant intelligent (IA) capable de répondre aux questions des clients et de fournir des analyses à l'administration.

## VI. Cahier des charges

### VI.1. Fonctionnalités

- **Site vitrine** : présentation de l'entreprise, des services, de la flotte de véhicules et du catalogue de produits ;
- **Barre d'annonces défilantes** : annonces personnalisables depuis l'administration (texte, couleur de fond, style, durée, emoji) ;
- **Gestion des comptes** : inscription, connexion sécurisée (JWT), gestion du profil (particulier ou entreprise) ;
- **Catalogue de produits** : liste des articles de négoce avec tarifs personnalisés selon le profil client ;
- **Panier** : ajout, modification et suppression d'articles (produits et locations de véhicules) ;
- **Réservation de véhicules** : sélection des dates, destination, option chauffeur, vérification de disponibilité ;
- **Gestion des devis** : création, suivi des statuts, téléversement du devis signé, envoi au client, génération PDF ;
- **Espace client** : suivi des devis, consultation des notifications, gestion du profil ;
- **Back-office** : gestion des clients, du catalogue, des véhicules, des devis, des réservations, des annonces et des notifications ;
- **Notifications** : envoi automatique de notifications aux clients et à l'administration ;
- **Assistant IA** : chatbot conversationnel répondant aux questions des clients et fournissant des analyses à l'administration.

### VI.2. Contraintes

- **Sécurité** : authentification par JWT, mots de passe hachés (bcrypt), routes protégées par rôle ;
- **Fiabilité des données** : utilisation d'une base de données PostgreSQL avec transactions et contraintes d'intégrité ;
- **Gestion des conflits** : vérification automatique de la disponibilité des véhicules pour éviter les doubles réservations ;
- **Format des dates** : format français (jj/mm/aaaa) dans toute l'interface ;
- **Format des prix** : FCFA (XOF) avec formatage français ;
- **Temps de réponse** : objectif de latence acceptable pour les requêtes simples ;
- **Compatibilité** : interface responsive adaptée aux écrans mobiles et desktop.

### VI.3. Livrables attendus

- Base de données PostgreSQL complète (tables, migrations, données de test) ;
- Application web full-stack fonctionnelle (frontend React + backend Node.js/Express) ;
- API REST documentée et sécurisée ;
- Devis PDF générés automatiquement ;
- Cahier des charges et documentation technique ;
- Rapport de soutenance avec les diagrammes UML et les captures d'écran des interfaces.

## VII. Planification des tâches

| N° | Tâche | Durée estimée |
|---|---|---|
| 1 | Étude de l'existant et expression des besoins | 1 semaine |
| 2 | Conception du système (diagrammes UML) | 1 semaine |
| 3 | Création de la base de données (schéma, migrations) | 2 semaines |
| 4 | Développement du backend (API REST, authentification) | 3 semaines |
| 5 | Développement du frontend (site vitrine, catalogue) | 3 semaines |
| 6 | Développement du module panier et devis | 2 semaines |
| 7 | Développement du module réservation de véhicules | 2 semaines |
| 8 | Développement de l'espace client | 2 semaines |
| 9 | Développement du back-office admin | 3 semaines |
| 10 | Intégration de l'assistant IA | 1 semaine |
| 11 | Tests fonctionnels et corrections | 2 semaines |
| 12 | Rédaction du rapport et préparation de la soutenance | 2 semaines |
| **TOTAL** | | **24 semaines** |