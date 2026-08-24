import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminCompanyPricing() {
  const { token } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [activeSection, setActiveSection] = useState('vehicles');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [priceInputs, setPriceInputs] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [companiesRes, vehiclesRes, productsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/company-pricing', { headers }),
        fetch('http://localhost:5000/api/admin/vehicles', { headers }),
        fetch('http://localhost:5000/api/admin/products', { headers }),
      ]);

      const [companiesData, vehiclesData, productsData] = await Promise.all([
        companiesRes.ok ? companiesRes.json() : { companies: [] },
        vehiclesRes.ok ? vehiclesRes.json() : { vehicles: [] },
        productsRes.ok ? productsRes.json() : { products: [] },
      ]);

      setCompanies(companiesData.companies || []);
      setVehicles(vehiclesData.vehicles || []);
      setProducts(productsData.products || []);
    } catch (error) {
      console.error('Erreur chargement données prix entreprises:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePriceChange = (key, value) => {
    setPriceInputs((current) => ({ ...current, [key]: value }));
  };

  const saveVehiclePrice = async (entrepriseId, vehiculeId, prix) => {
    setSaving(true);
    setNotice('');
    try {
      const response = await fetch('http://localhost:5000/api/admin/company-pricing/vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ entreprise_id: entrepriseId, vehicule_id: vehiculeId, prix_journalier: prix }),
      });
      if (response.ok) {
        setNotice('✅ Prix véhicule enregistré');
        setPriceInputs({});
        loadData();
      } else {
        const data = await response.json();
        setNotice(`❌ ${data.message || 'Erreur'}`);
      }
    } catch (error) {
      setNotice(`❌ ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const saveProductPrice = async (entrepriseId, produitId, prix) => {
    setSaving(true);
    setNotice('');
    try {
      const response = await fetch('http://localhost:5000/api/admin/company-pricing/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ entreprise_id: entrepriseId, produit_id: produitId, prix }),
      });
      if (response.ok) {
        setNotice('✅ Prix produit enregistré');
        setPriceInputs({});
        loadData();
      } else {
        const data = await response.json();
        setNotice(`❌ ${data.message || 'Erreur'}`);
      }
    } catch (error) {
      setNotice(`❌ ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getCompanyVehiclePrice = (company, vehicleId) => {
    const price = company?.prixVehicules?.find((p) => p.vehicule_id === vehicleId);
    return price ? Number(price.prix_journalier) : null;
  };

  const getCompanyProductPrice = (company, productId) => {
    const tariff = company?.tarifs?.find((t) => t.produit_id === productId && t.type_client === 'ENTREPRISE_CLIENT');
    return tariff ? Number(tariff.prix) : null;
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prix par entreprise client</h1>
        <p className="text-sm text-gray-500 mt-1">
          Définissez des prix spécifiques pour chaque entreprise client (négoce et location)
        </p>
      </div>

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {notice}
        </div>
      )}

      {/* Sélection entreprise */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <button
            key={company.id}
            onClick={() => {
              setSelectedCompany(company);
              setPriceInputs({});
            }}
            className={`rounded-2xl border-2 bg-white p-4 text-left shadow-sm transition-all ${
              selectedCompany?.id === company.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-primary/40'
            }`}
          >
            <p className="font-display text-sm font-extrabold text-gray-900">{company.nom}</p>
            <p className="mt-1 text-xs text-gray-500">
              {company.prixVehicules?.length || 0} prix véhicules · {company.tarifs?.length || 0} prix produits
            </p>
          </button>
        ))}
      </div>

      {!selectedCompany && (
        <div className="rounded-2xl border border-dashed border-primary/20 bg-white px-6 py-12 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300">business</span>
          <p className="mt-3 font-display text-lg font-bold text-gray-900">Sélectionnez une entreprise client</p>
          <p className="mt-1 text-sm text-gray-500">Choisissez une entreprise pour configurer ses prix spécifiques.</p>
        </div>
      )}

      {selectedCompany && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-[#f8faf7] px-6 py-4">
            <h2 className="font-display text-lg font-extrabold text-[#173d23]">
              Prix pour {selectedCompany.nom}
            </h2>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setActiveSection('vehicles')}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                  activeSection === 'vehicles' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Location véhicules
              </button>
              <button
                onClick={() => setActiveSection('products')}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                  activeSection === 'products' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Négoce produits
              </button>
            </div>
          </div>

          {activeSection === 'vehicles' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Véhicule</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Prix standard</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Prix spécifique {selectedCompany.nom}</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vehicles.map((vehicle) => {
                    const currentPrice = getCompanyVehiclePrice(selectedCompany, vehicle.id);
                    const inputKey = `veh-${vehicle.id}`;
                    const inputValue = priceInputs[inputKey] ?? (currentPrice != null ? String(currentPrice) : '');
                    return (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900">{vehicle.marque} {vehicle.modele}</p>
                          <p className="text-xs text-gray-500">{vehicle.categorie}</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {Number(vehicle.prix_journalier_particulier).toLocaleString('fr-FR')} FCFA/j
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={inputValue}
                            onChange={(e) => handlePriceChange(inputKey, e.target.value)}
                            placeholder="Prix spécifique"
                            className="w-32 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            disabled={saving || !inputValue}
                            onClick={() => saveVehiclePrice(selectedCompany.id, vehicle.id, inputValue)}
                            className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-[#1b4c00] disabled:opacity-50"
                          >
                            {currentPrice != null ? 'Mettre à jour' : 'Enregistrer'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'products' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Produit</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Prix standard</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Prix spécifique {selectedCompany.nom}</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => {
                    const currentPrice = getCompanyProductPrice(selectedCompany, product.id);
                    const inputKey = `prod-${product.id}`;
                    const inputValue = priceInputs[inputKey] ?? (currentPrice != null ? String(currentPrice) : '');
                    const standardPrice = product.tarifs?.find((t) => t.type_client === 'PARTICULIER')?.prix || 0;
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900">{product.nom}</p>
                          <p className="text-xs text-gray-500">{product.reference}</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {Number(standardPrice).toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={inputValue}
                            onChange={(e) => handlePriceChange(inputKey, e.target.value)}
                            placeholder="Prix spécifique"
                            className="w-32 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            disabled={saving || !inputValue}
                            onClick={() => saveProductPrice(selectedCompany.id, product.id, inputValue)}
                            className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-[#1b4c00] disabled:opacity-50"
                          >
                            {currentPrice != null ? 'Mettre à jour' : 'Enregistrer'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}