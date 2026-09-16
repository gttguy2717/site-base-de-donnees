import os
import subprocess

html_content = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Architecture Générale - Soutarah Group</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    width: 1600px;
    height: 1000px;
    background: #ffffff;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    padding: 40px 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 20px;
  }

  .title-group h1 {
    font-size: 32px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .title-group h1 span.num {
    color: #144627;
  }

  .title-group p {
    font-size: 15px;
    color: #64748b;
    margin-top: 6px;
    font-weight: 500;
  }

  .theme-badge {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    padding: 8px 16px;
    border-radius: 8px;
    text-align: right;
    max-width: 550px;
  }

  .theme-badge .label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #166534;
    font-weight: 700;
  }

  .theme-badge .theme-text {
    font-size: 12px;
    color: #14532d;
    font-weight: 600;
    line-height: 1.3;
    margin-top: 3px;
  }

  /* Main Diagram Canvas */
  .diagram-container {
    position: relative;
    flex: 1;
    margin: 25px 0 10px 0;
    display: grid;
    grid-template-columns: 420px 1fr 450px;
    gap: 20px;
    align-items: center;
  }

  /* Column Styles */
  .col-clients {
    display: flex;
    flex-direction: column;
    gap: 18px;
    z-index: 2;
  }

  .col-title {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
  }

  .col-title .badge {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    text-transform: uppercase;
  }

  .badge-client {
    background: #e0f2fe;
    color: #0369a1;
  }

  .badge-server {
    background: #dcfce7;
    color: #15803d;
  }

  /* Device Cards */
  .card {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    padding: 16px 18px;
    box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.05);
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    transition: all 0.2s ease;
  }

  .card-featured {
    border-color: #144627;
    background: linear-gradient(135deg, #ffffff 0%, #f4fbf6 100%);
    box-shadow: 0 6px 18px -2px rgba(20, 70, 39, 0.12);
  }

  .card-icon {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .icon-laptop {
    background: #eff6ff;
    color: #2563eb;
  }

  .icon-mobile {
    background: #ecfdf5;
    color: #059669;
    border: 1.5px solid #a7f3d0;
  }

  .icon-desktop {
    background: #f8fafc;
    color: #475569;
    border: 1px solid #e2e8f0;
  }

  .card-info {
    flex: 1;
  }

  .card-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .card-type {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #64748b;
  }

  .card-tag {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .tag-web {
    background: #dbeafe;
    color: #1e40af;
  }

  .tag-mobile {
    background: #d1fae5;
    color: #065f46;
  }

  .tag-admin {
    background: #f1f5f9;
    color: #334155;
  }

  .card-title {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
  }

  .card-tech {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #144627;
    font-weight: 600;
    margin: 2px 0 4px 0;
  }

  .card-desc {
    font-size: 12px;
    color: #64748b;
    line-height: 1.35;
  }

  /* Center Cloud & Network */
  .col-center {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    z-index: 2;
  }

  .cloud-container {
    position: relative;
    width: 320px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .cloud-shape {
    width: 300px;
    height: 180px;
    position: relative;
    filter: drop-shadow(0 12px 24px rgba(2, 132, 199, 0.15));
  }

  .cloud-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    width: 220px;
    z-index: 3;
  }

  .cloud-title {
    font-size: 26px;
    font-weight: 800;
    color: #0369a1;
    letter-spacing: -0.5px;
  }

  .cloud-subtitle {
    font-size: 11px;
    font-weight: 700;
    color: #0284c7;
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .cloud-pill-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 10px;
    align-items: center;
  }

  .cloud-pill {
    background: #ffffff;
    border: 1px solid #bae6fd;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 10.5px;
    font-weight: 700;
    color: #0c4a6e;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.03);
  }

  .pulse-dot {
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
  }

  /* Right Side: Server & Database */
  .col-server {
    display: flex;
    flex-direction: column;
    gap: 18px;
    z-index: 2;
  }

  .server-box {
    background: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-radius: 14px;
    padding: 18px;
    box-shadow: 0 6px 18px -2px rgba(15, 23, 42, 0.06);
    position: relative;
  }

  .server-app {
    border-color: #144627;
    background: linear-gradient(180deg, #ffffff 0%, #fcfdfc 100%);
  }

  .server-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f1f5f9;
  }

  .server-icon {
    width: 52px;
    height: 52px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .icon-srv {
    background: #f0fdf4;
    color: #166534;
    border: 1.5px solid #bbf7d0;
  }

  .icon-db {
    background: #f8fafc;
    color: #0284c7;
    border: 1.5px solid #e2e8f0;
  }

  .server-info h3 {
    font-size: 16px;
    font-weight: 800;
    color: #0f172a;
  }

  .server-info .server-stack {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    color: #15803d;
  }

  .module-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .module-item {
    font-size: 12px;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .module-bullet {
    width: 6px;
    height: 6px;
    background: #144627;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .module-item strong {
    color: #0f172a;
  }

  /* Database Box */
  .db-box {
    border-color: #94a3b8;
    background: #f8fafc;
  }

  .db-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #0369a1;
    font-weight: 700;
  }

  .db-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 8px;
  }

  .db-stat-pill {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 11px;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .db-stat-pill span.num {
    font-weight: 700;
    color: #144627;
  }

  /* SVG Connections Overlay */
  .connections-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  /* Footer Legend */
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #e2e8f0;
    padding-top: 16px;
  }

  .tiers-legend {
    display: flex;
    gap: 24px;
    align-items: center;
  }

  .tier-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #475569;
  }

  .tier-indicator {
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }

  .tier-pres { background: #38bdf8; }
  .tier-comm { background: #0284c7; }
  .tier-metier { background: #16a34a; }
  .tier-data { background: #64748b; }

  .doc-ref {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 500;
  }
</style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="title-group">
      <h1><span class="num">1.</span> Architecture générale</h1>
      <p>Modèle 3-tiers distribué &bull; Plateforme Web et Application Mobile de SOUTARAH GROUP</p>
    </div>
    <div class="theme-badge">
      <div class="label">Thème du Projet</div>
      <div class="theme-text">CONCEPTION ET DÉVELOPPEMENT D’UNE PLATEFORME NUMÉRIQUE DE GESTION DES SERVICES DE SOUTARAH GROUP INTÉGRANT UNE APPLICATION MOBILE DÉDIÉE À LA RÉSERVATION DE VÉHICULES</div>
    </div>
  </div>

  <!-- Main Diagram Area -->
  <div class="diagram-container">

    <!-- SVG lines connecting everything -->
    <svg class="connections-svg" viewBox="0 0 1480 660" preserveAspectRatio="none">
      <defs>
        <marker id="arrow-right" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" />
        </marker>
        <marker id="arrow-left" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="#0284c7" />
        </marker>
        <marker id="arrow-srv" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#144627" />
        </marker>
        <marker id="arrow-db" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
        </marker>
        
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0.8"/>
        </linearGradient>
      </defs>

      <!-- Connection: Laptop -> Cloud -->
      <!-- Laptop card right anchor: x=420, y=105. Cloud left: x=610, y=300 -->
      <path d="M 420 105 C 510 105, 530 290, 600 300" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="6,4" />
      <circle cx="420" cy="105" r="4.5" fill="#0284c7" />
      <circle cx="600" cy="300" r="4.5" fill="#0284c7" />

      <!-- Connection: Mobile Phone -> Cloud (Direct Horizontal) -->
      <!-- Mobile card right anchor: x=420, y=285. Cloud left: x=600, y=330 -->
      <path d="M 420 285 L 595 330" fill="none" stroke="#10b981" stroke-width="3" />
      <circle cx="420" cy="285" r="5" fill="#10b981" />
      <circle cx="595" cy="330" r="5" fill="#10b981" />

      <!-- Connection: Desktop PC -> Cloud -->
      <!-- Desktop card right anchor: x=420, y=470. Cloud left: x=600, y=360 -->
      <path d="M 420 470 C 510 470, 530 370, 600 360" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="6,4" />
      <circle cx="420" cy="470" r="4.5" fill="#0284c7" />
      <circle cx="600" cy="360" r="4.5" fill="#0284c7" />

      <!-- Protocol label on mobile line -->
      <rect x="475" y="290" width="85" height="22" rx="4" fill="#ffffff" stroke="#10b981" stroke-width="1.2" />
      <text x="517" y="305" font-family="Plus Jakarta Sans" font-size="10" font-weight="700" fill="#065f46" text-anchor="middle">API JSON</text>

      <!-- Connection: Cloud -> Server App -->
      <!-- Cloud right: x=880, y=330. Server App left: x=1030, y=200 -->
      <path d="M 880 330 C 940 330, 960 210, 1030 210" fill="none" stroke="#144627" stroke-width="3" />
      <circle cx="880" cy="330" r="5" fill="#144627" />
      <circle cx="1030" cy="210" r="5" fill="#144627" />

      <!-- Protocol label Cloud -> Server -->
      <rect x="915" y="245" width="90" height="24" rx="4" fill="#ffffff" stroke="#144627" stroke-width="1.2" />
      <text x="960" y="261" font-family="Plus Jakarta Sans" font-size="10.5" font-weight="700" fill="#144627" text-anchor="middle">HTTPS / REST</text>

      <!-- Connection: Server App -> Database (Vertical bus) -->
      <!-- Server bottom: x=1255, y=385. Database top: x=1255, y=435 -->
      <path d="M 1255 385 L 1255 435" fill="none" stroke="#475569" stroke-width="3" />
      <circle cx="1255" cy="385" r="4" fill="#144627" />
      <circle cx="1255" cy="435" r="4" fill="#475569" />
      <rect x="1205" y="398" width="100" height="20" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="1" />
      <text x="1255" y="412" font-family="JetBrains Mono" font-size="9.5" font-weight="700" fill="#334155" text-anchor="middle">ORM Sequelize</text>
    </svg>

    <!-- COLUMN 1: CLIENTS -->
    <div class="col-clients">
      <div class="col-title">
        <span>Clients</span>
        <span class="badge badge-client">Niveau Présentation</span>
      </div>

      <!-- Card 1: Laptop (Client Web) -->
      <div class="card">
        <div class="card-icon icon-laptop">
          <!-- Laptop SVG Icon -->
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="12" rx="2"></rect>
            <line x1="2" y1="20" x2="22" y2="20"></line>
          </svg>
        </div>
        <div class="card-info">
          <div class="card-header-row">
            <span class="card-type">Ordinateur Portable</span>
            <span class="card-tag tag-web">Web Client</span>
          </div>
          <div class="card-title">Plateforme Web Soutarah</div>
          <div class="card-tech">React 19 &bull; Vite &bull; Tailwind</div>
          <div class="card-desc">Consultation des services, catalogue négoce, constitution de devis et espace client.</div>
        </div>
      </div>

      <!-- Card 2: Smartphone (Application Mobile - FOCUS PROJET) -->
      <div class="card card-featured">
        <div class="card-icon icon-mobile">
          <!-- Smartphone SVG Icon -->
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="3"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
            <line x1="10" y1="5" x2="14" y2="5"></line>
          </svg>
        </div>
        <div class="card-info">
          <div class="card-header-row">
            <span class="card-type" style="color: #15803d;">Mobile Smartphone</span>
            <span class="card-tag tag-mobile">Application Dédiée</span>
          </div>
          <div class="card-title" style="color: #144627;">App Mobile Réservation</div>
          <div class="card-tech">React Native &bull; Expo SDK 57</div>
          <div class="card-desc"><strong>Dédiée à la réservation de véhicules :</strong> catalogue des 21 voitures, vérification des disponibilités en temps réel.</div>
        </div>
      </div>

      <!-- Card 3: Desktop (Poste Administration) -->
      <div class="card">
        <div class="card-icon icon-desktop">
          <!-- Desktop SVG Icon -->
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        </div>
        <div class="card-info">
          <div class="card-header-row">
            <span class="card-type">Poste Fixe / Bureau</span>
            <span class="card-tag tag-admin">Administration</span>
          </div>
          <div class="card-title">Back-Office Soutarah</div>
          <div class="card-tech">Tableau de bord de gestion</div>
          <div class="card-desc">Gestion de la flotte, traitement des devis, validation des réservations et comptabilité.</div>
        </div>
      </div>

    </div>

    <!-- COLUMN 2: CLOUD INTERNET -->
    <div class="col-center">
      <div class="cloud-container">
        <!-- SVG Cloud Illustration -->
        <svg class="cloud-shape" viewBox="0 0 320 200" fill="none">
          <path d="M 70 140 
                   A 45 45 0 0 1 65 75 
                   A 50 50 0 0 1 145 40 
                   A 55 55 0 0 1 235 55 
                   A 45 45 0 0 1 260 140 
                   L 70 140 Z" 
                fill="url(#cloudGradient)" 
                stroke="#38bdf8" 
                stroke-width="2.5" />
          <defs>
            <linearGradient id="cloudGradient" x1="50" y1="30" x2="260" y2="150" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ffffff"/>
              <stop offset="1" stop-color="#e0f2fe"/>
            </linearGradient>
          </defs>
        </svg>

        <div class="cloud-content">
          <div class="cloud-title">Internet</div>
          <div class="cloud-subtitle">Réseau d'échange étendu</div>
          <div class="cloud-pill-list">
            <div class="cloud-pill">
              <span class="pulse-dot"></span>
              <span>Protocole HTTPS (TLS)</span>
            </div>
            <div class="cloud-pill">
              <span>Requêtes API RESTful</span>
            </div>
            <div class="cloud-pill">
              <span>Échanges JSON / JWT</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- COLUMN 3: SERVER & DATABASE -->
    <div class="col-server">
      <div class="col-title">
        <span>Serveur</span>
        <span class="badge badge-server">Niveaux Métier & Données</span>
      </div>

      <!-- Server Application Card -->
      <div class="server-box server-app">
        <div class="server-header">
          <div class="server-icon icon-srv">
            <!-- Server Unit Icon -->
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6.01" y2="6"></line>
              <line x1="6" y1="18" x2="6.01" y2="18"></line>
            </svg>
          </div>
          <div class="server-info">
            <h3>Serveur d'application (Backend)</h3>
            <div class="server-stack">Node.js &bull; Express API REST</div>
          </div>
        </div>

        <ul class="module-list">
          <li class="module-item">
            <div class="module-bullet"></div>
            <div><strong>Authentification sécurisée :</strong> JWT & Bcrypt (Rôles Client / Admin)</div>
          </li>
          <li class="module-item">
            <div class="module-bullet"></div>
            <div><strong>Moteur de réservation :</strong> Contrôle anti-double réservation</div>
          </li>
          <li class="module-item">
            <div class="module-bullet"></div>
            <div><strong>Générateur de devis :</strong> Calcul TVA (18%), TDT & export PDF</div>
          </li>
          <li class="module-item">
            <div class="module-bullet"></div>
            <div><strong>Gestionnaire de notifications :</strong> Alertes temps réel & emails</div>
          </li>
          <li class="module-item">
            <div class="module-bullet"></div>
            <div><strong>Assistant virtuel :</strong> Intégration IA conversationnelle</div>
          </li>
        </ul>
      </div>

      <!-- Database Card -->
      <div class="server-box db-box">
        <div class="server-header" style="margin-bottom: 8px; padding-bottom: 8px;">
          <div class="server-icon icon-db">
            <!-- Database Cylinder Icon -->
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            </svg>
          </div>
          <div class="server-info">
            <h3 style="font-size: 15px;">Base de données relationnelle</h3>
            <div class="db-tag">MySQL &bull; ORM Sequelize</div>
          </div>
        </div>

        <div class="db-stats">
          <div class="db-stat-pill">
            <span>🚗</span>
            <span><span class="num">21</span> Véhicules du parc</span>
          </div>
          <div class="db-stat-pill">
            <span>📅</span>
            <span>Réservations & Plannings</span>
          </div>
          <div class="db-stat-pill">
            <span>📄</span>
            <span>Devis & Paniers</span>
          </div>
          <div class="db-stat-pill">
            <span>👥</span>
            <span>Clients & Entreprises</span>
          </div>
        </div>
      </div>

    </div>

  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="tiers-legend">
      <div class="tier-item">
        <div class="tier-indicator tier-pres"></div>
        <span>1. Présentation (Web & Mobile)</span>
      </div>
      <div class="tier-item">
        <div class="tier-indicator tier-comm"></div>
        <span>2. Réseau (Internet / HTTPS)</span>
      </div>
      <div class="tier-item">
        <div class="tier-indicator tier-metier"></div>
        <span>3. Métier (API Node.js / Express)</span>
      </div>
      <div class="tier-item">
        <div class="tier-indicator tier-data"></div>
        <span>4. Persistance (Base MySQL)</span>
      </div>
    </div>
    <div class="doc-ref">Figure : Schéma de l'architecture générale du système &bull; SOUTARAH GROUP</div>
  </div>

</body>
</html>
"""

with open("diagrammes/architecture/architecture-generale.html", "w", encoding="utf-8") as f:
    f.write(html_content)

print("HTML template written to diagrammes/architecture/architecture-generale.html")
