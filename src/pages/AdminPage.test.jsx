import { useAuth } from '../hooks/useAuth';

export default function AdminPage({ navigateTo }) {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
    return <div className="p-8 text-center text-red-600">Accès non autorisé</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold">Admin Test Page</h1>
      <p className="mt-4">Si vous voyez ceci, la page fonctionne !</p>
      <p className="mt-2">User: {user.email}</p>
      <p className="mt-2">Role: {user.role}</p>
    </div>
  );
}
