import { useAuth } from '../hooks/useAuth';

export default function AdminPage({ navigateTo }) {
  const { user, logout } = useAuth();

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Accès refusé</h1>
          <p className="mt-2 text-gray-600">Vous devez être administrateur</p>
          <button
            onClick={() => navigateTo('home')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r p-4">
        <h2 className="text-xl font-bold">SOUTARAH ADMIN</h2>
        <nav className="mt-8 space-y-2">
          <div className="p-2 bg-primary/10 text-primary rounded">Dashboard</div>
          <div className="p-2 text-gray-700 rounded hover:bg-gray-50">Clients</div>
          <div className="p-2 text-gray-700 rounded hover:bg-gray-50">Catalogue</div>
        </nav>
        <button
          onClick={() => {
            logout();
            navigateTo('home');
          }}
          className="mt-8 w-full p-2 bg-red-500 text-white rounded"
        >
          Déconnexion
        </button>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-4">Interface admin minimale - ça fonctionne !</p>
        <p className="mt-2">User: {user.email}</p>
        <p>Role: {user.role}</p>
      </main>
    </div>
  );
}
