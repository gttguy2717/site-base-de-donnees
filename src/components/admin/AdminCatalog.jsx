import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminCatalog() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('negoce');
  const [loading, setLoading] = useState(true);
  const [editPhotoModal, setEditPhotoModal] = useState(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    nom: '', reference: '', description: '', categorie_id: '', unite: 'unité', image_preview: '',
    tarifs: [
      { type_client: 'PARTICULIER', prix: '' },
      { type_client: 'ENTREPRISE_CLIENT', prix: '' },
    ],
  });
  const [savingProduct, setSavingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState('');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({
    marque: '', modele: '', categorie: '', places: 5, transmission: 'Automatique',
    prix_journalier_particulier: '', prix_journalier_entreprise: '', prix_journalier_entreprise_client: '',
    disponibilite: true, description: '', image_preview: '',
  });
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [vehicleFormError, setVehicleFormError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [vehicleCategoryFilter, setVehicleCategoryFilter] = useState('all');
  const [vehicleAvailabilityFilter, setVehicleAvailabilityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const categories = [
    { id: 'negoce', name: 'Négoce /', subtitle: 'Import-Export', icon: 'public', count: products.length },
    { id: 'vehicules', name: 'Location de', subtitle: 'véhicules', icon: 'directions_car', count: vehicles.length },
  ];

  const normalize = (value) =>
    String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  const search = normalize(searchTerm);
  const productCategories = [...new Set(products.map((p) => p.categorie?.nom).filter(Boolean))].sort();
  const vehicleCategories = [...new Set(vehicles.map((v) => v.categorie).filter(Boolean))].sort();

  const filteredProducts = products.filter((product) => {
    const matchSearch = !search || normalize(product.nom).includes(search) || normalize(product.reference).includes(search) || normalize(product.categorie?.nom).includes(search);
    const matchCategory = productCategoryFilter === 'all' || normalize(product.categorie?.nom) === normalize(productCategoryFilter);
    return matchSearch && matchCategory;
  });

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchSearch = !search || normalize(`${vehicle.marque} ${vehicle.modele}`).includes(search) || normalize(vehicle.categorie).includes(search) || normalize(vehicle.transmission).includes(search);
    const matchCategory = vehicleCategoryFilter === 'all' || normalize(vehicle.categorie) === normalize(vehicleCategoryFilter);
    const isAvailable = Boolean(vehicle.disponibilite);
    const matchAvailability = vehicleAvailabilityFilter === 'all' || (vehicleAvailabilityFilter === 'available' && isAvailable) || (vehicleAvailabilityFilter === 'unavailable' && !isAvailable);
    return matchSearch && matchCategory && matchAvailability;
  });

  const currentItems = activeCategory === 'negoce' ? filteredProducts : filteredVehicles;
  const totalPages = Math.max(1, Math.ceil(currentItems.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = currentItems.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [activeCategory, searchTerm, productCategoryFilter, vehicleCategoryFilter, vehicleAvailabilityFilter]);

  useEffect(() => {
    loadProducts();
    loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Écouter la recherche globale du header admin
  useEffect(() => {
    const handleAdminSearch = (event) => {
      if (event.detail) {
        setSearchTerm(event.detail);
      }
    };
    window.addEventListener('soutarah-admin-search', handleAdminSearch);
    return () => window.removeEventListener('soutarah-admin-search', handleAdminSearch);
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/products', { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) { const data = await response.json(); setProducts(data.products || []); }
    } catch (error) { console.error('Erreur chargement produits:', error); }
    finally { setLoading(false); }
  };

  const loadVehicles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/vehicles', { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) { const data = await response.json(); setVehicles(data.vehicles || []); }
    } catch (error) { console.error('Erreur chargement véhicules:', error); }
  };

  const handleExportPrices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/products/export-prices', { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `prix-catalogue-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a);
      } else { alert('Erreur lors de l\'export des prix'); }
    } catch (error) { console.error('Erreur export:', error); alert('Erreur lors de l\'export des prix'); }
  };

  const handleImportPrices = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!confirm('Importer les prix depuis ce fichier Excel ? Les prix actuels seront mis à jour.')) { event.target.value = ''; return; }
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://localhost:5000/api/admin/products/import-prices', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      if (response.ok) { const data = await response.json(); alert(`✅ Import réussi ! ${data.updated} prix mis à jour.`); loadProducts(); }
      else { const error = await response.json(); alert(`❌ Erreur: ${error.message || 'Import échoué'}`); }
    } catch (error) { console.error('Erreur import:', error); alert('❌ Erreur lors de l\'import des prix'); }
    finally { event.target.value = ''; }
  };

  const handleExportVehicles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/vehicles/export', { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `vehicules-soutarah-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a);
      } else { alert('Erreur lors de l\'export des véhicules'); }
    } catch (error) { console.error('Erreur export:', error); alert('Erreur lors de l\'export des véhicules'); }
  };

  const handleImportVehicles = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!confirm('Importer les véhicules depuis ce fichier Excel ? Les données actuelles seront mises à jour.')) { event.target.value = ''; return; }
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://localhost:5000/api/admin/vehicles/import', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      if (response.ok) { const data = await response.json(); alert(`✅ Import réussi ! ${data.updated} véhicule(s) mis à jour.`); loadVehicles(); }
      else { const error = await response.json(); alert(`❌ Erreur: ${error.message || 'Import échoué'}`); }
    } catch (error) { console.error('Erreur import:', error); alert('❌ Erreur lors de l\'import des véhicules'); }
    finally { event.target.value = ''; }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) { alert('✅ Article supprimé du catalogue'); loadProducts(); } else { alert('❌ Erreur lors de la suppression'); }
    } catch (error) { console.error('Erreur suppression:', error); alert('❌ Erreur lors de la suppression'); }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/vehicles/${vehicleId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) { alert('✅ Véhicule supprimé du catalogue'); loadVehicles(); } else { alert('❌ Erreur lors de la suppression'); }
    } catch (error) { console.error('Erreur suppression:', error); alert('❌ Erreur lors de la suppression'); }
  };

  const openEditPhotoModal = (product) => setEditPhotoModal({ product, imageFile: null, previewUrl: product.image_url || '' });
  const closeEditPhotoModal = () => { setEditPhotoModal(null); setSavingPhoto(false); };

  const handleImageFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('❌ Veuillez sélectionner une image'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('❌ L\'image est trop volumineuse (max 5MB)'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setEditPhotoModal((current) => ({ ...current, imageFile: file, previewUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleProductImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('❌ Veuillez sélectionner une image'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('❌ L\'image est trop volumineuse (max 5MB)'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setProductForm((current) => ({ ...current, image_preview: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleVehicleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('❌ Veuillez sélectionner une image'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('❌ L\'image est trop volumineuse (max 5MB)'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setVehicleForm((current) => ({ ...current, image_preview: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleProductTariffChange = (index, value) => {
    setProductForm((current) => {
      const tarifs = [...current.tarifs];
      tarifs[index].prix = value;
      return { ...current, tarifs };
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setProductFormError('');
    setSavingProduct(true);
    try {
      const payload = { nom: productForm.nom, reference: productForm.reference, description: productForm.description, categorie_id: productForm.categorie_id || null, unite: productForm.unite, image_url: productForm.image_preview || null, tarifs: productForm.tarifs };
      const response = await fetch('http://localhost:5000/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error?.message || 'Erreur lors de l\'ajout du produit');
      alert('✅ Article ajouté avec succès !');
      setShowAddProductModal(false);
      setProductForm({ nom: '', reference: '', description: '', categorie_id: '', unite: 'unité', image_preview: '', tarifs: [{ type_client: 'PARTICULIER', prix: '' }, { type_client: 'ENTREPRISE_CLIENT', prix: '' }] });
      loadProducts();
    } catch (error) { setProductFormError(error.message || 'Erreur lors de l\'ajout du produit'); }
    finally { setSavingProduct(false); }
  };

  const handleVehicleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVehicleForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const openEditVehicleModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      marque: vehicle.marque,
      modele: vehicle.modele,
      categorie: vehicle.categorie,
      places: vehicle.places,
      transmission: vehicle.transmission || 'Automatique',
      prix_journalier_particulier: vehicle.prix_journalier_particulier,
      prix_journalier_entreprise: vehicle.prix_journalier_entreprise,
      prix_journalier_entreprise_client: vehicle.prix_journalier_entreprise_client ?? '',
      disponibilite: vehicle.disponibilite !== false,
      description: vehicle.description || '',
      image_preview: vehicle.image_url || '',
    });
    setVehicleFormError('');
    setShowEditVehicleModal(true);
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    if (!editingVehicle?.id) return;
    setVehicleFormError('');
    setSavingVehicle(true);
    try {
      const payload = {
        marque: vehicleForm.marque,
        modele: vehicleForm.modele,
        categorie: vehicleForm.categorie,
        places: vehicleForm.places,
        transmission: vehicleForm.transmission,
        prix_journalier_particulier: vehicleForm.prix_journalier_particulier,
        prix_journalier_entreprise: vehicleForm.prix_journalier_entreprise,
        prix_journalier_entreprise_client: vehicleForm.prix_journalier_entreprise_client,
        disponibilite: vehicleForm.disponibilite,
        description: vehicleForm.description,
        image_url: vehicleForm.image_preview || null,
      };
      const response = await fetch(`http://localhost:5000/api/admin/vehicles/${editingVehicle.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error?.message || 'Erreur lors de la mise à jour du véhicule');
      alert('✅ Véhicule mis à jour avec succès !');
      setShowEditVehicleModal(false);
      setEditingVehicle(null);
      setVehicleForm({ marque: '', modele: '', categorie: '', places: 5, transmission: 'Automatique', prix_journalier_particulier: '', prix_journalier_entreprise: '', prix_journalier_entreprise_client: '', disponibilite: true, description: '', image_preview: '' });
      loadVehicles();
    } catch (error) { setVehicleFormError(error.message || 'Erreur lors de la mise à jour du véhicule'); }
    finally { setSavingVehicle(false); }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setVehicleFormError('');
    setSavingVehicle(true);
    try {
      const payload = { marque: vehicleForm.marque, modele: vehicleForm.modele, categorie: vehicleForm.categorie, places: vehicleForm.places, transmission: vehicleForm.transmission, prix_journalier_particulier: vehicleForm.prix_journalier_particulier, prix_journalier_entreprise: vehicleForm.prix_journalier_entreprise, prix_journalier_entreprise_client: vehicleForm.prix_journalier_entreprise_client, disponibilite: vehicleForm.disponibilite, description: vehicleForm.description, image_url: vehicleForm.image_preview || null };
      const response = await fetch('http://localhost:5000/api/admin/vehicles', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error?.message || 'Erreur lors de l\'ajout du véhicule');
      alert('✅ Véhicule ajouté avec succès !');
      setShowAddVehicleModal(false);
      setVehicleForm({ marque: '', modele: '', categorie: '', places: 5, transmission: 'Automatique', prix_journalier_particulier: '', prix_journalier_entreprise: '', prix_journalier_entreprise_client: '', disponibilite: true, description: '', image_preview: '' });
      loadVehicles();
    } catch (error) { setVehicleFormError(error.message || 'Erreur lors de l\'ajout du véhicule'); }
    finally { setSavingVehicle(false); }
  };

  const handleSavePhoto = async () => {
    if (!editPhotoModal?.imageFile) { alert('❌ Veuillez sélectionner une image'); return; }
    try {
      setSavingPhoto(true);
      const isVehicle = editPhotoModal.product.marque !== undefined;
      const endpoint = isVehicle ? `http://localhost:5000/api/admin/vehicles/${editPhotoModal.product.id}` : `http://localhost:5000/api/admin/products/${editPhotoModal.product.id}`;
      const response = await fetch(endpoint, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ image_url: editPhotoModal.previewUrl }) });
      if (response.ok) { alert('✅ Photo mise à jour'); closeEditPhotoModal(); if (isVehicle) loadVehicles(); else loadProducts(); }
      else { alert('❌ Erreur lors de la mise à jour'); }
    } catch (error) { console.error('Erreur mise à jour photo:', error); alert('❌ Erreur lors de la mise à jour'); }
    finally { setSavingPhoto(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez votre catalogue de produits et services</p>
        </div>
      </div>

      {/* Cartes catégories */}
      <div className="grid gap-4 grid-cols-5">
        {categories.map((cat, index) => {
          const colors = ['bg-green-100 text-green-700', 'bg-teal-100 text-teal-700'];
          const isActive = activeCategory === cat.id;
          return (
            <div key={cat.id} className={`rounded-xl border-2 bg-white p-5 shadow-sm cursor-pointer transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`} onClick={() => setActiveCategory(cat.id)}>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors[index]}`}>
                  <span className="material-symbols-outlined text-[22px]">{cat.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 leading-tight">{cat.name}<br />{cat.subtitle}</p>
                </div>
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-gray-900">{cat.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">articles</p>
              <button className={`mt-3 w-full flex items-center justify-between px-3 py-1.5 border rounded-lg text-xs font-semibold transition-colors ${isActive ? 'bg-primary text-white border-primary' : 'border-gray-200 text-primary hover:bg-gray-50'}`} onClick={(e) => { e.stopPropagation(); setActiveCategory(cat.id); }}>
                <span>Gérer</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Section catalogue */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900 uppercase">CATALOGUE</h2>
              <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
              <span className="text-sm font-bold text-gray-900">{activeCategory === 'negoce' ? 'Négoce / Import-Export' : 'Location de véhicules'}</span>
            </div>
            <div className="flex items-center gap-3">
              {activeCategory === 'negoce' ? (
                <>
                  <button onClick={() => { setProductFormError(''); setShowAddProductModal(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-[#1b4c00] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap">
                    <span className="material-symbols-outlined text-[18px]">add</span>Ajouter un article
                  </button>
                  <button onClick={handleExportPrices} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap">
                    <span className="material-symbols-outlined text-[18px]">download</span>Exporter prix (Excel)
                  </button>
                  <button onClick={() => document.getElementById('import-prices-excel').click()} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap">
                    <span className="material-symbols-outlined text-[18px]">upload</span>Importer prix (Excel)
                  </button>
                  <input id="import-prices-excel" type="file" accept=".xlsx,.xls" onChange={handleImportPrices} className="hidden" />
                </>
              ) : (
                <>
                  <button onClick={() => { setVehicleFormError(''); setShowAddVehicleModal(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-[#1b4c00] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap">
                    <span className="material-symbols-outlined text-[18px]">add</span>Ajouter un véhicule
                  </button>
                  <button onClick={handleExportVehicles} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap">
                    <span className="material-symbols-outlined text-[18px]">download</span>Exporter véhicules (Excel)
                  </button>
                  <button onClick={() => document.getElementById('import-vehicles-excel').click()} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap">
                    <span className="material-symbols-outlined text-[18px]">upload</span>Importer véhicules (Excel)
                  </button>
                  <input id="import-vehicles-excel" type="file" accept=".xlsx,.xls" onChange={handleImportVehicles} className="hidden" />
                </>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {activeCategory === 'negoce' ? `${filteredProducts.length} article(s)${filteredProducts.length !== products.length ? ` sur ${products.length}` : ''}` : `${filteredVehicles.length} véhicule(s)${filteredVehicles.length !== vehicles.length ? ` sur ${vehicles.length}` : ''}`}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={activeCategory === 'negoce' ? "Rechercher un article, référence..." : "Rechercher un véhicule..."} className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            {activeCategory === 'negoce' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Catégorie</span>
                <select value={productCategoryFilter} onChange={(e) => setProductCategoryFilter(e.target.value)} className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none">
                  <option value="all">Toutes</option>
                  {productCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            )}
            {activeCategory === 'vehicules' && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Catégorie</span>
                  <select value={vehicleCategoryFilter} onChange={(e) => setVehicleCategoryFilter(e.target.value)} className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none">
                    <option value="all">Toutes</option>
                    {vehicleCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Disponibilité</span>
                  <select value={vehicleAvailabilityFilter} onChange={(e) => setVehicleAvailabilityFilter(e.target.value)} className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none">
                    <option value="all">Tous</option>
                    <option value="available">Disponible</option>
                    <option value="unavailable">Indisponible</option>
                  </select>
                </div>
              </>
            )}
            <button onClick={() => { setSearchTerm(''); setProductCategoryFilter('all'); setVehicleCategoryFilter('all'); setVehicleAvailabilityFilter('all'); }} className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>Réinitialiser
            </button>
          </div>
        </div>

        {/* Tableau Produits */}
        {activeCategory === 'negoce' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Article</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Référence</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Catégorie</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Prix Particulier/Entreprise</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedItems.map((product) => {
                  const tarifParticulier = product.tarifs?.find(t => t.type_client === 'PARTICULIER')?.prix || 0;
                  const tarifEntreprise = product.tarifs?.find(t => t.type_client === 'ENTREPRISE_CLIENT')?.prix || tarifParticulier;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                            <img src={product.image_url || '/placeholder-product.png'} alt={product.nom} className="h-full w-full object-cover" onError={(e) => { e.target.src = '/placeholder-product.png'; e.target.onerror = null; }} />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{product.nom}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{product.reference || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">{product.categorie?.nom || 'Sans catégorie'}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{parseFloat(tarifParticulier).toLocaleString('fr-FR')} FCFA</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditPhotoModal(product)} className="p-1 text-gray-400 hover:text-primary transition-colors" title="Modifier la photo"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                          <button onClick={() => { if (confirm(`Supprimer "${product.nom}" du catalogue ?`)) handleDeleteProduct(product.id); }} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Supprimer"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedItems.length === 0 && (
                  <tr><td colSpan="6" className="px-4 py-12 text-center text-sm text-gray-500">Aucun produit trouvé</td></tr>
                )}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-center px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed">Précédent</button>
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                        return <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-primary text-white' : 'border border-gray-300 text-gray-700 hover:bg-white'}`}>{page}</button>;
                      } else if (page === currentPage - 3 || page === currentPage + 3) {
                        return <span key={page} className="text-gray-400">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed">Suivant</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tableau Véhicules */}
        {activeCategory === 'vehicules' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Véhicule</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Catégorie</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Caractéristiques</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Prix Particulier/Entreprise</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Disponibilité</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedItems.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                          <img src={vehicle.image_url || '/placeholder-car.png'} alt={`${vehicle.marque} ${vehicle.modele}`} className="h-full w-full object-cover" onError={(e) => { e.target.src = '/placeholder-car.png'; e.target.onerror = null; }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{vehicle.marque} {vehicle.modele}</p>
                          <p className="text-xs text-gray-500">{vehicle.categorie}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{vehicle.categorie}</span></td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <div>{vehicle.places} places • {vehicle.transmission}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{parseFloat(vehicle.prix_journalier_particulier).toLocaleString('fr-FR')} FCFA/j</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${vehicle.disponibilite ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${vehicle.disponibilite ? 'bg-green-600' : 'bg-red-600'}`}></span>
                        {vehicle.disponibilite ? 'Disponible' : 'Indisponible'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditVehicleModal(vehicle)} className="p-1 text-gray-400 hover:text-primary transition-colors" title="Modifier le véhicule"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                        <button onClick={() => openEditPhotoModal(vehicle)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Modifier la photo"><span className="material-symbols-outlined text-[20px]">photo_camera</span></button>
                        <button onClick={() => { if (confirm(`Supprimer "${vehicle.marque} ${vehicle.modele}" du catalogue ?`)) handleDeleteVehicle(vehicle.id); }} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Supprimer"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedItems.length === 0 && (
                  <tr><td colSpan="7" className="px-4 py-12 text-center text-sm text-gray-500">Aucun véhicule trouvé</td></tr>
                )}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-center px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed">Précédent</button>
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                        return <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-primary text-white' : 'border border-gray-300 text-gray-700 hover:bg-white'}`}>{page}</button>;
                      } else if (page === currentPage - 3 || page === currentPage + 3) {
                        return <span key={page} className="text-gray-400">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed">Suivant</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Ajouter un article */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Ajouter un article</h3>
                <p className="text-xs text-gray-500 mt-0.5">Ajoutez un nouveau produit de négoce</p>
              </div>
              <button onClick={() => setShowAddProductModal(false)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors"><span className="material-symbols-outlined text-[24px]">close</span></button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Nom de l'article *</label>
                  <input type="text" name="nom" required value={productForm.nom} onChange={handleProductChange} placeholder="Ciment Portland" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Référence *</label>
                  <input type="text" name="reference" required value={productForm.reference} onChange={handleProductChange} placeholder="CIM-PORT-001" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700">Description</label>
                <textarea name="description" value={productForm.description} onChange={handleProductChange} rows="2" placeholder="Description du produit..." className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700">Photo de l'article</label>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                    {productForm.image_preview ? <img src={productForm.image_preview} alt="Aperçu" className="h-full w-full object-cover" /> : <span className="material-symbols-outlined text-gray-300 text-3xl">image</span>}
                  </div>
                  <input type="file" accept="image/*" onChange={handleProductImageChange} className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700">Unité</label>
                <select name="unite" value={productForm.unite} onChange={handleProductChange} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10">
                  <option>unité</option><option>sac</option><option>kg</option><option>tonne</option><option>mètre</option><option>litre</option><option>carton</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold text-gray-700">Prix par type de client (FCFA)</label>
                <div className="space-y-3">
                  {[{ key: 'PARTICULIER', label: 'Prix Particulier et Entreprise', color: 'text-emerald-700', placeholder: '30 000' }, { key: 'ENTREPRISE_CLIENT', label: 'Prix Entreprise Client', color: 'text-purple-700', placeholder: '20 000' }].map((tarifDef, idx) => (
                    <div key={tarifDef.key}>
                      <label className={`mb-1 block text-xs font-bold ${tarifDef.color}`}>{tarifDef.label}</label>
                      <input type="number" min="0" value={productForm.tarifs[idx]?.prix || ''} onChange={(e) => handleProductTariffChange(idx, e.target.value)} placeholder={tarifDef.placeholder} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" />
                    </div>
                  ))}
                </div>
              </div>
              {productFormError && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">{productFormError}</div>}
              <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowAddProductModal(false)} disabled={savingProduct} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">Annuler</button>
                <button type="submit" disabled={savingProduct} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-[#1b4c00] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {savingProduct && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>}
                  {savingProduct ? 'Ajout...' : 'Ajouter l\'article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifier un véhicule */}
      {showEditVehicleModal && editingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Modifier le véhicule</h3>
                <p className="text-xs text-gray-500 mt-0.5">{editingVehicle.marque} {editingVehicle.modele} — modifiez les informations et les prix</p>
              </div>
              <button onClick={() => { setShowEditVehicleModal(false); setEditingVehicle(null); }} className="p-1 text-gray-400 hover:text-gray-600 transition-colors"><span className="material-symbols-outlined text-[24px]">close</span></button>
            </div>
            <form onSubmit={handleUpdateVehicle} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Marque *</label>
                  <input type="text" name="marque" required value={vehicleForm.marque} onChange={handleVehicleChange} placeholder="Toyota" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Modèle *</label>
                  <input type="text" name="modele" required value={vehicleForm.modele} onChange={handleVehicleChange} placeholder="Land Cruiser" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700">Catégorie *</label>
                <select name="categorie" value={vehicleForm.categorie} onChange={handleVehicleChange} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10">
                  <option>Citadine</option><option>Berline</option><option>SUV</option><option>Pick-up</option><option>Minibus</option><option>Utilitaire</option><option>4x4</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Places</label>
                  <input type="number" name="places" min="1" value={vehicleForm.places} onChange={handleVehicleChange} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Transmission</label>
                  <select name="transmission" value={vehicleForm.transmission} onChange={handleVehicleChange} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"><option>Automatique</option><option>Manuelle</option></select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Prix Particulier (FCFA/j) *</label>
                  <input type="number" name="prix_journalier_particulier" required value={vehicleForm.prix_journalier_particulier} onChange={handleVehicleChange} placeholder="30 000" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Prix Entreprise (FCFA/j) *</label>
                  <input type="number" name="prix_journalier_entreprise" required value={vehicleForm.prix_journalier_entreprise} onChange={handleVehicleChange} placeholder="25 000" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700">Photo du véhicule</label>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                    {vehicleForm.image_preview ? <img src={vehicleForm.image_preview} alt="Aperçu" className="h-full w-full object-cover" /> : <span className="material-symbols-outlined text-gray-300 text-3xl">directions_car</span>}
                  </div>
                  <input type="file" accept="image/*" onChange={handleVehicleImageChange} className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700">Description</label>
                <textarea name="description" value={vehicleForm.description} onChange={handleVehicleChange} rows="2" placeholder="Climatisé, GPS, 4x4..." className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" />
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" name="disponibilite" checked={vehicleForm.disponibilite} onChange={handleVehicleChange} className="h-4 w-4 accent-[#296c00]" />
                <span className="text-sm font-semibold text-gray-700">Disponible immédiatement</span>
              </label>
              {vehicleFormError && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">{vehicleFormError}</div>}
              <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => { setShowEditVehicleModal(false); setEditingVehicle(null); }} disabled={savingVehicle} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">Annuler</button>
                <button type="submit" disabled={savingVehicle} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-[#1b4c00] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {savingVehicle && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>}
                  {savingVehicle ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajouter un véhicule */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Ajouter un véhicule</h3>
                <p className="text-xs text-gray-500 mt-0.5">Renseignez les informations du nouveau véhicule</p>
              </div>
              <button onClick={() => setShowAddVehicleModal(false)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors"><span className="material-symbols-outlined text-[24px]">close</span></button>
            </div>
            <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Marque *</label>
                  <input type="text" name="marque" required value={vehicleForm.marque} onChange={handleVehicleChange} placeholder="Toyota" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Modèle *</label>
                  <input type="text" name="modele" required value={vehicleForm.modele} onChange={handleVehicleChange} placeholder="Land Cruiser" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700">Catégorie *</label>
                <select name="categorie" required value={vehicleForm.categorie} onChange={handleVehicleChange} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10">
                  <option value="">Sélectionner...</option><option>Citadine</option><option>Berline</option><option>SUV</option><option>Pick-up</option><option>Minibus</option><option>Utilitaire</option><option>4x4</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Places</label>
                  <input type="number" name="places" min="1" value={vehicleForm.places} onChange={handleVehicleChange} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Transmission</label>
                  <select name="transmission" value={vehicleForm.transmission} onChange={handleVehicleChange} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"><option>Automatique</option><option>Manuelle</option></select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Prix Particulier *</label>
                  <input type="number" name="prix_journalier_particulier" required value={vehicleForm.prix_journalier_particulier} onChange={handleVehicleChange} placeholder="30 000" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Prix Entreprise *</label>
                  <input type="number" name="prix_journalier_entreprise" required value={vehicleForm.prix_journalier_entreprise} onChange={handleVehicleChange} placeholder="25 000" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700">Photo du véhicule</label>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                    {vehicleForm.image_preview ? <img src={vehicleForm.image_preview} alt="Aperçu" className="h-full w-full object-cover" /> : <span className="material-symbols-outlined text-gray-300 text-3xl">directions_car</span>}
                  </div>
                  <input type="file" accept="image/*" onChange={handleVehicleImageChange} className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700">Description</label>
                <textarea name="description" value={vehicleForm.description} onChange={handleVehicleChange} rows="2" placeholder="Climatisé, GPS, 4x4..." className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" />
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" name="disponibilite" checked={vehicleForm.disponibilite} onChange={handleVehicleChange} className="h-4 w-4 accent-[#296c00]" />
                <span className="text-sm font-semibold text-gray-700">Disponible immédiatement</span>
              </label>
              {vehicleFormError && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">{vehicleFormError}</div>}
              <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowAddVehicleModal(false)} disabled={savingVehicle} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">Annuler</button>
                <button type="submit" disabled={savingVehicle} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-[#1b4c00] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {savingVehicle && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>}
                  {savingVehicle ? 'Ajout...' : 'Ajouter le véhicule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifier Photo */}
      {editPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Modifier la photo</h3>
              <button onClick={closeEditPhotoModal} className="p-1 text-gray-400 hover:text-gray-600 transition-colors"><span className="material-symbols-outlined text-[24px]">close</span></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                  <img src={editPhotoModal.product.image_url || '/placeholder-product.png'} alt={editPhotoModal.product.nom || `${editPhotoModal.product.marque} ${editPhotoModal.product.modele}`} className="h-full w-full object-cover" onError={(e) => { e.target.src = '/placeholder-product.png'; e.target.onerror = null; }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{editPhotoModal.product.nom || `${editPhotoModal.product.marque} ${editPhotoModal.product.modele}`}</p>
                  <p className="text-xs text-gray-500">{editPhotoModal.product.reference || editPhotoModal.product.categorie || 'Sans référence'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Sélectionner une nouvelle image</label>
                <input type="file" accept="image/*" onChange={handleImageFileChange} className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer" />
                <p className="mt-1 text-xs text-gray-500">Formats acceptés : JPG, PNG, WebP • Taille max : 5MB</p>
              </div>
              {editPhotoModal.previewUrl && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Prévisualisation</label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <img src={editPhotoModal.previewUrl} alt="Prévisualisation" className="max-h-64 mx-auto rounded object-contain" onError={(e) => { e.target.src = '/placeholder-product.png'; e.target.onerror = null; }} />
                  </div>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button onClick={closeEditPhotoModal} disabled={savingPhoto} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">Annuler</button>
              <button onClick={handleSavePhoto} disabled={savingPhoto || !editPhotoModal.imageFile} className="px-4 py-2 bg-primary hover:bg-[#1b4c00] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {savingPhoto && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
                {savingPhoto ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}