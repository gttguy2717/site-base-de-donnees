export default function AdminProductRequests() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-extrabold text-gray-900">
          Demandes de produits
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Gestion des demandes de produits indisponibles
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-300">inventory</span>
        <h3 className="mt-4 font-display text-xl font-bold text-gray-900">
          Demandes en développement
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Cette fonctionnalité sera bientôt disponible
        </p>
      </div>
    </div>
  );
}
