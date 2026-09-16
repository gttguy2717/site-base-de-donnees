import os

svg_epure = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 780" width="1200" height="780">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap');
      text { font-family: 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif; }
      .doc-title { font-size: 32px; font-weight: 800; fill: #000000; letter-spacing: -0.5px; }
      .doc-subtitle { font-size: 13px; font-weight: 700; fill: #15803d; letter-spacing: 0.5px; }
      .section-heading { font-size: 32px; font-weight: 700; fill: #000000; }
      .device-name { font-size: 15px; font-weight: 700; fill: #0f172a; text-anchor: middle; }
      .mobile-highlight { font-size: 10.5px; font-weight: 800; fill: #065f46; letter-spacing: 0.5px; text-anchor: middle; }
      .cloud-main { font-size: 38px; font-weight: 700; fill: #000000; text-anchor: middle; }
      .server-main { font-size: 34px; font-weight: 700; fill: #000000; text-anchor: middle; }
      .server-detail { font-size: 14px; font-weight: 700; fill: #166534; text-anchor: middle; }
      .db-label { font-size: 14px; font-weight: 700; fill: #334155; text-anchor: middle; }
      .main-line { stroke: #000000; stroke-width: 2.4; stroke-linecap: round; }
      .accent-line { stroke: #059669; stroke-width: 3.2; stroke-dasharray: 6,4; stroke-linecap: round; }
      .db-line { stroke: #475569; stroke-width: 2.4; stroke-dasharray: 4,4; stroke-linecap: round; }
    </style>

    <!-- Drop Shadow Filter for 3D Server and Cloud -->
    <filter id="softShadow" x="-15%" y="-15%" width="140%" height="140%">
      <feDropShadow dx="3" dy="8" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.14" />
    </filter>
    <filter id="cardShadow" x="-15%" y="-15%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.08" />
    </filter>

    <!-- Isometric Server Gradients -->
    <linearGradient id="srvFront" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="60%" stop-color="#e2e8f0" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>
    <linearGradient id="srvSide" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#94a3b8" />
      <stop offset="100%" stop-color="#64748b" />
    </linearGradient>
    <linearGradient id="srvTop" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#cbd5e1" />
      <stop offset="100%" stop-color="#f8fafc" />
    </linearGradient>

    <!-- Cloud Gradient -->
    <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f0f9ff" />
    </linearGradient>

    <!-- Connector Bus Gradient -->
    <linearGradient id="busGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#cbd5e1" />
      <stop offset="100%" stop-color="#64748b" />
    </linearGradient>
  </defs>

  <!-- Clean Background -->
  <rect width="1200" height="780" fill="#ffffff" />

  <!-- ======================================================== -->
  <!-- HEADER                                                   -->
  <!-- ======================================================== -->
  <text x="70" y="65" class="doc-title">1. Architecture générale</text>
  <text x="70" y="92" class="doc-subtitle">SYSTÈME DISTRIBUÉ 3-TIERS &#8226; PLATEFORME WEB &amp; APPLICATION MOBILE DE RÉSERVATION</text>

  <!-- ======================================================== -->
  <!-- CONNECTING LINES                                         -->
  <!-- ======================================================== -->

  <!-- Line 1: Laptop to Internet Cloud -->
  <line x1="240" y1="180" x2="480" y2="330" class="main-line" />

  <!-- Line 2: Mobile to Internet Cloud -->
  <line x1="255" y1="365" x2="465" y2="365" class="accent-line" />
  
  <!-- Line 3: Desktop PC to Internet Cloud -->
  <line x1="240" y1="545" x2="480" y2="400" class="main-line" />

  <!-- Line 4: Internet Cloud to Server Bus -->
  <path d="M 685 365 L 810 365 L 810 485 L 870 485" fill="none" class="main-line" stroke-width="2.6" />

  <!-- Protocol badge on Cloud -> Server link -->
  <g transform="translate(755, 395)">
    <rect x="0" y="0" width="112" height="24" rx="5" fill="#ffffff" stroke="#15803d" stroke-width="1.2" filter="url(#cardShadow)" />
    <text x="56" y="16" font-size="10.5" font-weight="700" fill="#15803d" text-anchor="middle">HTTPS / REST API</text>
  </g>

  <!-- Line 5: Server to Database -->
  <path d="M 975 510 L 975 565" fill="none" class="db-line" stroke-width="2.5" />


  <!-- ======================================================== -->
  <!-- 1. LEFT COLUMN: CLIENTS                                  -->
  <!-- ======================================================== -->

  <!-- Device 1: Laptop (Plateforme Web) -->
  <g transform="translate(130, 120)">
    <!-- Screen Outer -->
    <rect x="20" y="8" width="90" height="58" rx="5" fill="#000000" />
    <rect x="25" y="13" width="80" height="48" rx="3" fill="#ffffff" />
    <!-- Web interface mockup -->
    <rect x="25" y="13" width="80" height="12" fill="#144627" />
    <circle cx="31" cy="19" r="2" fill="#ffffff" opacity="0.8" />
    <circle cx="37" cy="19" r="2" fill="#ffffff" opacity="0.8" />
    <circle cx="43" cy="19" r="2" fill="#ffffff" opacity="0.8" />
    <text x="65" y="21" font-size="6" font-weight="700" fill="#ffffff" text-anchor="middle">SOUTARAH GROUP</text>
    <rect x="29" y="29" width="30" height="28" rx="2" fill="#f1f5f9" />
    <rect x="63" y="29" width="38" height="12" rx="2" fill="#e2e8f0" />
    <rect x="63" y="44" width="38" height="13" rx="2" fill="#bbf7d0" />
    <!-- Keyboard base -->
    <path d="M 5 66 L 125 66 L 136 78 L -6 78 Z" fill="#1e293b" />
    <rect x="46" y="68" width="38" height="4" rx="1.5" fill="#475569" />

    <!-- Label épuré -->
    <text x="65" y="100" class="device-name">Ordinateur portable</text>
  </g>

  <!-- Device 2: Smartphone (Application Mobile Dédiée) -->
  <g transform="translate(145, 290)">
    <!-- Protective Badge Halo -->
    <rect x="5" y="0" width="80" height="142" rx="20" fill="#f0fdf4" stroke="#86efac" stroke-width="1.8" />

    <!-- Phone Hardware Shell -->
    <rect x="14" y="8" width="62" height="125" rx="14" fill="#000000" />
    <!-- Phone Screen -->
    <rect x="18" y="16" width="54" height="108" rx="8" fill="#ffffff" />

    <!-- Mobile Header -->
    <rect x="18" y="16" width="54" height="20" fill="#144627" />
    <text x="45" y="29" font-size="7" font-weight="800" fill="#ffffff" text-anchor="middle">SOUTARAH</text>

    <!-- Car Booking Banner -->
    <rect x="22" y="40" width="46" height="34" rx="4" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1" />
    <text x="45" y="56" font-size="14" text-anchor="middle">🚘</text>
    <text x="45" y="68" font-size="6" font-weight="800" fill="#144627" text-anchor="middle">21 Véhicules</text>

    <!-- Reservation Action Button -->
    <rect x="22" y="78" width="46" height="12" rx="3" fill="#16a34a" />
    <text x="45" y="86" font-size="6" font-weight="700" fill="#ffffff" text-anchor="middle">RÉSERVER</text>

    <!-- Mobile Bottom Home Bar -->
    <line x1="36" y1="117" x2="54" y2="117" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" />

    <!-- Dedicated Application Floating Tag -->
    <g transform="translate(-15, 148)">
      <rect x="0" y="0" width="120" height="20" rx="10" fill="#d1fae5" stroke="#10b981" stroke-width="1.2" />
      <text x="60" y="14" class="mobile-highlight">APPLICATION MOBILE</text>
    </g>

    <!-- Label épuré -->
    <text x="45" y="188" class="device-name" style="fill: #144627; font-weight: 800;">Smartphone (Mobile)</text>
  </g>

  <!-- Device 3: Desktop PC (Ordinateur de Bureau) -->
  <g transform="translate(125, 535)">
    <!-- Monitor Bezel -->
    <rect x="10" y="8" width="90" height="60" rx="4" fill="#000000" />
    <rect x="15" y="13" width="80" height="50" rx="2" fill="#f8fafc" />
    <rect x="15" y="13" width="80" height="10" fill="#1e293b" />
    <rect x="19" y="27" width="22" height="32" fill="#e2e8f0" />
    <rect x="45" y="27" width="46" height="14" fill="#cbd5e1" />
    <rect x="45" y="44" width="46" height="15" fill="#e2e8f0" />
    <!-- Stand -->
    <rect x="48" y="68" width="14" height="14" fill="#334155" />
    <path d="M 33 82 L 77 82 L 82 86 L 28 86 Z" fill="#0f172a" />

    <!-- Central Tower -->
    <rect x="110" y="10" width="34" height="76" rx="4" fill="#000000" />
    <rect x="115" y="16" width="24" height="6" rx="1" fill="#334155" />
    <rect x="115" y="25" width="24" height="6" rx="1" fill="#334155" />
    <circle cx="127" cy="42" r="3.5" fill="#38bdf8" />
    <circle cx="127" cy="62" r="2.5" fill="#10b981" />

    <!-- Label épuré -->
    <text x="75" y="105" class="device-name">Ordinateur de bureau</text>
  </g>

  <!-- Big "Clients" Text -->
  <g transform="translate(190, 720)">
    <text x="0" y="0" class="section-heading" text-anchor="middle">Clients</text>
  </g>


  <!-- ======================================================== -->
  <!-- 2. CENTER: CLOUD INTERNET (ÉPURÉ)                        -->
  <!-- ======================================================== -->
  <g transform="translate(450, 260)">
    <!-- Classic Cloud Shape -->
    <path d="M 55 145 
             C 15 145, -5 115, 5 75 
             C -2 40, 35 15, 75 25 
             C 98 -5, 155 -5, 185 20 
             C 215 5, 260 15, 265 55 
             C 298 65, 308 115, 280 145 
             Z" 
          fill="url(#cloudGrad)" 
          stroke="#000000" 
          stroke-width="2.6" 
          stroke-linejoin="round"
          filter="url(#softShadow)" />

    <!-- Internet Label (Centré et net) -->
    <text x="150" y="95" class="cloud-main">Internet</text>
  </g>


  <!-- ======================================================== -->
  <!-- 3. RIGHT COLUMN: SERVER & DATABASE (ÉPURÉ)               -->
  <!-- ======================================================== -->

  <!-- 3D Realistic Isometric Server Rack -->
  <g transform="translate(885, 235)">
    <ellipse cx="85" cy="255" rx="80" ry="16" fill="#000000" opacity="0.12" />

    <!-- Isometric Tower Geometry -->
    <path d="M 15 70 L 95 30 L 95 235 L 15 275 Z" fill="url(#srvFront)" stroke="#000000" stroke-width="2.2" />
    <path d="M 95 30 L 165 65 L 165 270 L 95 235 Z" fill="url(#srvSide)" stroke="#000000" stroke-width="2.2" />
    <path d="M 15 70 L 95 30 L 165 65 L 85 105 Z" fill="url(#srvTop)" stroke="#000000" stroke-width="2.2" />

    <!-- Server Slots -->
    <rect x="25" y="105" width="45" height="7" rx="1.5" fill="#475569" />
    <rect x="25" y="118" width="45" height="7" rx="1.5" fill="#475569" />
    <rect x="25" y="131" width="45" height="7" rx="1.5" fill="#475569" />

    <!-- Status LEDs -->
    <circle cx="32" cy="155" r="3.5" fill="#10b981" />
    <circle cx="44" cy="155" r="3.5" fill="#38bdf8" />
    <circle cx="56" cy="155" r="3" fill="#f59e0b" />

    <!-- Ventilation Louvers -->
    <line x1="25" y1="185" x2="75" y2="165" stroke="#64748b" stroke-width="2" />
    <line x1="25" y1="197" x2="75" y2="177" stroke="#64748b" stroke-width="2" />
    <line x1="25" y1="209" x2="75" y2="189" stroke="#64748b" stroke-width="2" />
    <line x1="25" y1="221" x2="75" y2="201" stroke="#64748b" stroke-width="2" />

    <!-- Glowing Power LED -->
    <ellipse cx="50" cy="245" rx="5" ry="3" fill="#22c55e" stroke="#15803d" stroke-width="1" />

    <!-- Connector Bus Port -->
    <rect x="-35" y="244" width="55" height="12" rx="3" fill="url(#busGrad)" stroke="#000000" stroke-width="1.8" />
    <rect x="-18" y="239" width="18" height="22" rx="2" fill="#ea580c" stroke="#9a3412" stroke-width="1.5" />
    <circle cx="-9" cy="250" r="3.5" fill="#fef08a" />
  </g>

  <!-- Database Cylinder Block (MySQL) -->
  <g transform="translate(930, 560)">
    <path d="M 0 16 L 0 52 C 0 66 90 66 90 52 L 90 16 Z" fill="#e2e8f0" stroke="#000000" stroke-width="2.2" />
    <path d="M 0 34 C 0 46 90 46 90 34" fill="none" stroke="#64748b" stroke-width="1.8" />
    <ellipse cx="45" cy="16" rx="45" ry="14" fill="#f8fafc" stroke="#000000" stroke-width="2.2" />

    <!-- DB Label épuré -->
    <text x="45" y="78" class="db-label">Base de données MySQL</text>
  </g>

  <!-- Server Master Title & Subtitle -->
  <g transform="translate(975, 685)">
    <text x="0" y="0" class="server-main">Server</text>
    <text x="0" y="25" class="server-detail">Serveur d'application (Node.js / Express)</text>
  </g>

  <!-- Bottom Rule -->
  <line x1="70" y1="755" x2="1130" y2="755" stroke="#f1f5f9" stroke-width="1.5" />

</svg>
"""

with open("diagrammes/architecture/architecture-generale.svg", "w", encoding="utf-8") as f:
    f.write(svg_epure)

print("SVG épuré généré avec succès !")
