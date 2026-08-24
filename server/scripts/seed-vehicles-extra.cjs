const { sequelize } = require('../src/models/index.cjs');

// Véhicules supplémentaires - images professionnelles fond blanc (soutarahgroup.ci)
const EXTRA_VEHICLES = [
  // ─── 30 Berlines HD ──────────────────────────────────────────────────────
  { category: 'Berline', name: 'Mercedes-Benz Classe C 200', plate: 'AA-C200-CI', pricePerDay: 50000, image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Climatisée & Assurée'] },
  { category: 'Berline', name: 'Mercedes-Benz Classe E 300', plate: 'AA-E300-CI', pricePerDay: 75000, image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Climatisée & Assurée'] },
  { category: 'Berline', name: 'Mercedes-Benz Classe S 500', plate: 'AA-S500-CI', pricePerDay: 150000, image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Luxe & Chauffeur'] },
  { category: 'Berline', name: 'BMW Série 3 320i', plate: 'AA-320I-CI', pricePerDay: 50000, image: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Sport & Confort'] },
  { category: 'Berline', name: 'BMW Série 5 530i', plate: 'AA-530I-CI', pricePerDay: 75000, image: 'https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Élégance Premium'] },
  { category: 'Berline', name: 'BMW Série 7 740Li', plate: 'AA-740L-CI', pricePerDay: 140000, image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'VIP Prestige'] },
  { category: 'Berline', name: 'Audi A4 TFSI', plate: 'AA-A4TF-CI', pricePerDay: 48000, image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Cuir & GPS'] },
  { category: 'Berline', name: 'Audi A6 Quattro', plate: 'AA-A6QU-CI', pricePerDay: 70000, image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Executive Class'] },
  { category: 'Berline', name: 'Audi A8 L', plate: 'AA-A8L0-CI', pricePerDay: 135000, image: 'https://images.unsplash.com/photo-1610768764270-790fbec18178?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Luxe Absolu'] },
  { category: 'Berline', name: 'Toyota Camry Hybrid', plate: 'AA-CAMR-CI', pricePerDay: 40000, image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Confort & Silence'] },
  { category: 'Berline', name: 'Toyota Corolla Executive', plate: 'AA-CORO-CI', pricePerDay: 30000, image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Fiable & Climatisée'] },
  { category: 'Berline', name: 'Lexus ES 350', plate: 'AA-ES35-CI', pricePerDay: 65000, image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Grand Luxe'] },
  { category: 'Berline', name: 'Lexus LS 500', plate: 'AA-LS50-CI', pricePerDay: 130000, image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Prestige Japonais'] },
  { category: 'Berline', name: 'Honda Accord Touring', plate: 'AA-ACCO-CI', pricePerDay: 38000, image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Spacieuse'] },
  { category: 'Berline', name: 'Honda Civic Sedan', plate: 'AA-CIVI-CI', pricePerDay: 28000, image: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Économique'] },
  { category: 'Berline', name: 'Hyundai Sonata Limited', plate: 'AA-SONA-CI', pricePerDay: 35000, image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Écran Panoramique'] },
  { category: 'Berline', name: 'Hyundai Elantra GT', plate: 'AA-ELAN-CI', pricePerDay: 27000, image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Design Moderne'] },
  { category: 'Berline', name: 'Kia K5 / Optima GT', plate: 'AA-KIAK-CI', pricePerDay: 36000, image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Finition GT'] },
  { category: 'Berline', name: 'Kia Cerato Sedan', plate: 'AA-CERA-CI', pricePerDay: 26000, image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Pratique & Confort'] },
  { category: 'Berline', name: 'Peugeot 508 GT', plate: 'AA-P508-CI', pricePerDay: 45000, image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Design Français'] },
  { category: 'Berline', name: 'Peugeot 308 Sedan', plate: 'AA-P308-CI', pricePerDay: 28000, image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Agile & Économe'] },
  { category: 'Berline', name: 'Volkswagen Passat R-Line', plate: 'AA-PASS-CI', pricePerDay: 42000, image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Qualité Allemande'] },
  { category: 'Berline', name: 'Volkswagen Jetta Highline', plate: 'AA-JETT-CI', pricePerDay: 28000, image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Sobriété'] },
  { category: 'Berline', name: 'Mazda 6 Grand Touring', plate: 'AA-MAZ6-CI', pricePerDay: 38000, image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Cuir & Sièges Chauffants'] },
  { category: 'Berline', name: 'Nissan Altima SL', plate: 'AA-ALTI-CI', pricePerDay: 35000, image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Zero Gravity Seats'] },
  { category: 'Berline', name: 'Nissan Maxima Platinum', plate: 'AA-MAXI-CI', pricePerDay: 45000, image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Moteur V6 Sport'] },
  { category: 'Berline', name: 'Genesis G80 Luxury', plate: 'AA-G800-CI', pricePerDay: 80000, image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'VIP Affaires'] },
  { category: 'Berline', name: 'Volvo S90 Inscription', plate: 'AA-S900-CI', pricePerDay: 85000, image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Sécurité Maximale'] },
  { category: 'Berline', name: 'Tesla Model 3 Long Range', plate: 'AA-TSL3-CI', pricePerDay: 60000, image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', '100% Électrique'] },
  { category: 'Berline', name: 'Jaguar XF Portfolio', plate: 'AA-JAGX-CI', pricePerDay: 90000, image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Chic Britannique'] },

  // ─── Citadines HD ────────────────────────────────────────────────────────
  { category: 'Citadines', name: 'Toyota Yaris', plate: 'AA-101-AB', pricePerDay: 20000, image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Citadines', name: 'Hyundai i10', plate: 'AA-102-AB', pricePerDay: 18000, image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Citadines', name: 'Kia Picanto', plate: 'AA-103-AB', pricePerDay: 17000, image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Citadines', name: 'Peugeot 208', plate: 'AA-104-AB', pricePerDay: 22000, image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'Citadines', name: 'Renault Clio', plate: 'AA-105-AB', pricePerDay: 21000, image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Manuel', 'Assurée'] },

  // ─── SUV HD ──────────────────────────────────────────────────────────────
  { category: 'SUV', name: 'Toyota RAV4', plate: 'AA-201-AB', pricePerDay: 45000, image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Honda CR-V', plate: 'AA-202-AB', pricePerDay: 48000, image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Hyundai Tucson', plate: 'AA-203-AB', pricePerDay: 42000, image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Kia Sportage', plate: 'AA-204-AB', pricePerDay: 43000, image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Assurée'] },

  // ─── 4x4 HD ──────────────────────────────────────────────────────────────
  { category: '4x4', name: 'Toyota Land Cruiser Prado', plate: 'AA-301-AB', pricePerDay: 120000, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', specs: ['7 personnes', 'Automatique', 'Assurée'] },
  { category: '4x4', name: 'Nissan Patrol', plate: 'AA-302-AB', pricePerDay: 110000, image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80', specs: ['7 personnes', 'Automatique', 'Assurée'] },
  { category: '4x4', name: 'Jeep Wrangler', plate: 'AA-303-AB', pricePerDay: 90000, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: '4x4', name: 'Land Rover Discovery', plate: 'AA-304-AB', pricePerDay: 130000, image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80', specs: ['7 personnes', 'Automatique', 'Assurée'] },

  // ─── Pick-Up HD ──────────────────────────────────────────────────────────
  { category: 'Pick-Up', name: 'Toyota Hilux', plate: 'AA-401-AB', pricePerDay: 55000, image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Pick-Up', name: 'Ford Ranger', plate: 'AA-402-AB', pricePerDay: 60000, image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Pick-Up', name: 'Nissan Navara', plate: 'AA-403-AB', pricePerDay: 58000, image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Pick-Up', name: 'Mitsubishi L200 New', plate: 'AA-404-AB', pricePerDay: 52000, image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Pick-Up', name: 'Isuzu D-Max 2024', plate: 'AA-405-AB', pricePerDay: 56000, image: '/img/vehicles/dmaxav.png', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Pick-Up', name: 'GWM P-Series', plate: 'AA-406-AB', pricePerDay: 50000, image: '/img/vehicles/dmaxav.png', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Pick-Up', name: 'Mahindra Pik Up', plate: 'AA-407-AB', pricePerDay: 45000, image: '/img/vehicles/orochav.jpeg', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Pick-Up', name: 'Dongfeng Rich', plate: 'AA-408-AB', pricePerDay: 48000, image: '/img/vehicles/orochav.jpeg', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Pick-Up', name: 'JAC T8', plate: 'AA-409-AB', pricePerDay: 52000, image: '/img/vehicles/dmaxav.png', specs: ['5 personnes', 'Manuel', 'Assurée'] },
  { category: 'Pick-Up', name: 'Foton Tunland', plate: 'AA-410-AB', pricePerDay: 50000, image: '/img/vehicles/tacomaav.jpeg', specs: ['5 personnes', 'Manuel', 'Assurée'] },

  // Utilitaires
  { category: 'Utilitaires', name: 'Peugeot Partner', plate: 'AA-501-AB', pricePerDay: 28000, image: '/img/vehicles/express1.jpeg', specs: ['3 places assises', 'Manuel', 'Assurée'] },
  { category: 'Utilitaires', name: 'Renault Kangoo', plate: 'AA-502-AB', pricePerDay: 27000, image: '/img/vehicles/express1.jpeg', specs: ['3 places assises', 'Manuel', 'Assurée'] },
  { category: 'Utilitaires', name: 'Citroën Berlingo', plate: 'AA-503-AB', pricePerDay: 28000, image: '/img/vehicles/dokker.jpg', specs: ['3 places assises', 'Manuel', 'Assurée'] },
  { category: 'Utilitaires', name: 'Fiat Doblo', plate: 'AA-504-AB', pricePerDay: 29000, image: '/img/vehicles/express1.jpeg', specs: ['3 places assises', 'Manuel', 'Assurée'] },
  { category: 'Utilitaires', name: 'Mercedes Sprinter', plate: 'AA-505-AB', pricePerDay: 50000, image: '/img/vehicles/ford1.jpg', specs: ['10 places assises', 'Manuel', 'Assurée'] },
  { category: 'Utilitaires', name: 'Iveco Daily', plate: 'AA-506-AB', pricePerDay: 45000, image: '/img/vehicles/ford1.jpg', specs: ['10 places assises', 'Manuel', 'Assurée'] },
  { category: 'Utilitaires', name: 'Renault Master', plate: 'AA-507-AB', pricePerDay: 42000, image: '/img/vehicles/jumperav.jpeg', specs: ['10 places assises', 'Manuel', 'Assurée'] },
  { category: 'Utilitaires', name: 'Ford Transit Custom', plate: 'AA-508-AB', pricePerDay: 40000, image: '/img/vehicles/ford1.jpg', specs: ['10 places assises', 'Manuel', 'Assurée'] },
  { category: 'Utilitaires', name: 'Volkswagen Crafter', plate: 'AA-509-AB', pricePerDay: 48000, image: '/img/vehicles/ford1.jpg', specs: ['10 places assises', 'Manuel', 'Assurée'] },
  { category: 'Utilitaires', name: 'Toyota Hiace Van', plate: 'AA-510-AB', pricePerDay: 35000, image: '/img/vehicles/jumperav.jpeg', specs: ['10 places assises', 'Manuel', 'Assurée'] },

  // Minibus
  { category: 'Minibus', name: 'Toyota Hiace 12 Places', plate: 'AA-601-AB', pricePerDay: 80000, image: '/img/vehicles/h1ec.jpg', specs: ['12 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Minibus', name: 'Nissan Urvan 14 Places', plate: 'AA-602-AB', pricePerDay: 75000, image: '/img/vehicles/urvan1.jpeg', specs: ['14 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Minibus', name: 'Ford Transit 16 Places', plate: 'AA-603-AB', pricePerDay: 85000, image: '/img/vehicles/ford1.jpg', specs: ['16 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Minibus', name: 'Mercedes Sprinter 18 Places', plate: 'AA-604-AB', pricePerDay: 95000, image: '/img/vehicles/h1ec.jpg', specs: ['18 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Minibus', name: 'Iveco Daily 20 Places', plate: 'AA-605-AB', pricePerDay: 100000, image: '/img/vehicles/h1ec.jpg', specs: ['20 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Minibus', name: 'Hyundai H350', plate: 'AA-606-AB', pricePerDay: 90000, image: '/img/vehicles/h1ec.jpg', specs: ['15 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Minibus', name: 'Kia Grandbird', plate: 'AA-607-AB', pricePerDay: 95000, image: '/img/vehicles/h1ec.jpg', specs: ['15 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Minibus', name: 'Renault Trafic 9 Places', plate: 'AA-608-AB', pricePerDay: 65000, image: '/img/vehicles/ford1.jpg', specs: ['9 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Minibus', name: 'Peugeot Boxer 10 Places', plate: 'AA-609-AB', pricePerDay: 60000, image: '/img/vehicles/ford1.jpg', specs: ['10 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Minibus', name: 'Citroën Jumper 12 Places', plate: 'AA-610-AB', pricePerDay: 62000, image: '/img/vehicles/jumperav.jpeg', specs: ['12 places assises', 'Manuel', 'Avec chauffeur'] },

  // Autocars
  { category: 'Autocar', name: 'Hyundai 40 Places', plate: 'AA-701-AB', pricePerDay: 150000, image: '/img/vehicles/h1ec.jpg', specs: ['40 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Autocar', name: 'Hyundai 45 Places', plate: 'AA-702-AB', pricePerDay: 160000, image: '/img/vehicles/h1ec.jpg', specs: ['45 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Autocar', name: 'Hyundai 50 Places', plate: 'AA-703-AB', pricePerDay: 170000, image: '/img/vehicles/h1ec.jpg', specs: ['50 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Autocar', name: 'Mercedes Tourismo', plate: 'AA-704-AB', pricePerDay: 200000, image: '/img/vehicles/h1ec.jpg', specs: ['50 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Autocar', name: 'Volvo 9700', plate: 'AA-705-AB', pricePerDay: 220000, image: '/img/vehicles/h1ec.jpg', specs: ['55 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Autocar', name: 'Scania Irizar', plate: 'AA-706-AB', pricePerDay: 210000, image: '/img/vehicles/h1ec.jpg', specs: ['50 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Autocar', name: 'MAN Lion Coach', plate: 'AA-707-AB', pricePerDay: 200000, image: '/img/vehicles/h1ec.jpg', specs: ['50 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Autocar', name: 'Yutong ZK6122', plate: 'AA-708-AB', pricePerDay: 180000, image: '/img/vehicles/h1ec.jpg', specs: ['55 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Autocar', name: 'King Long XMQ6127', plate: 'AA-709-AB', pricePerDay: 175000, image: '/img/vehicles/h1ec.jpg', specs: ['55 places assises', 'Manuel', 'Avec chauffeur'] },
  { category: 'Autocar', name: 'Higer A30', plate: 'AA-710-AB', pricePerDay: 165000, image: '/img/vehicles/h1ec.jpg', specs: ['50 places assises', 'Manuel', 'Avec chauffeur'] },

  // SUV premium
  { category: 'SUV', name: 'Mercedes-Benz Classe E', plate: 'AA-801-AB', pricePerDay: 150000, image: '/img/vehicles/l300.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'BMW Série 5', plate: 'AA-802-AB', pricePerDay: 160000, image: '/img/vehicles/l300.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Audi A6', plate: 'AA-803-AB', pricePerDay: 155000, image: '/img/vehicles/l300.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Lexus RX', plate: 'AA-804-AB', pricePerDay: 140000, image: '/img/vehicles/l300.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Range Rover', plate: 'AA-805-AB', pricePerDay: 180000, image: '/img/vehicles/l300.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Porsche Cayenne', plate: 'AA-806-AB', pricePerDay: 200000, image: '/img/vehicles/l300.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Mercedes-Benz Classe S', plate: 'AA-807-AB', pricePerDay: 250000, image: '/img/vehicles/l300.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'BMW X5', plate: 'AA-808-AB', pricePerDay: 170000, image: '/img/vehicles/l300.jpeg', specs: ['5 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Audi Q7', plate: 'AA-809-AB', pricePerDay: 175000, image: '/img/vehicles/l300.jpeg', specs: ['7 personnes', 'Automatique', 'Assurée'] },
  { category: 'SUV', name: 'Volvo XC90', plate: 'AA-810-AB', pricePerDay: 165000, image: '/img/vehicles/l300.jpeg', specs: ['7 personnes', 'Automatique', 'Assurée'] },
];

async function seedExtraVehicles() {
  try {
    console.log('🚗 Ajout de véhicules supplémentaires...');
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    const { Vehicle } = require('../src/models/index.cjs');

    let count = 0;
    for (const vehicle of EXTRA_VEHICLES) {
      const nameParts = vehicle.name.split(' ');
      const marque = nameParts[0];
      const modele = nameParts.slice(1).join(' ') || marque;

      const placesSpec = vehicle.specs.find(spec => spec.includes('personnes') || spec.includes('places'));
      const places = placesSpec ? parseInt(placesSpec.match(/\d+/)?.[0] || '5') : 5;
      const transmission = vehicle.specs.find(spec => ['Automatique', 'Manuel'].includes(spec)) || 'Automatique';

      const existing = await Vehicle.findOne({ where: { marque, modele } });
      const data = {
        marque,
        modele,
        categorie: vehicle.category,
        description: vehicle.specs.join(' • '),
        image_url: vehicle.image,
        places,
        carburant: 'Essence',
        transmission,
        prix_journalier_particulier: vehicle.pricePerDay,
        prix_journalier_entreprise: vehicle.pricePerDay,
        disponibilite: true,
        statut: 'ACTIVE',
      };

      if (existing) {
        await existing.update(data);
      } else {
        await Vehicle.create(data);
      }
      count++;
      console.log(`  ✓ ${count}/${EXTRA_VEHICLES.length} - ${vehicle.name}`);
    }

    console.log(`\n✅ ${count} véhicules supplémentaires ajoutés !`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

seedExtraVehicles();