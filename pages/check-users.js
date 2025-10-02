// pages/check-users.js
import { useEffect, useState } from 'react';

export default function CheckUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUsers() {
      try {
        const response = await fetch('/api/test-db');
        const data = await response.json();
        if (data.success) {
          setUsers(data.stats?.users || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    checkUsers();
  }, []);

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Verificación de Usuarios</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">Usuarios en la base de datos:</h2>
        {users.length === 0 ? (
          <p className="text-red-600">❌ No hay usuarios en la base de datos</p>
        ) : (
          <ul className="list-disc pl-6">
            {users.map(user => (
              <li key={user.dni}>
                <strong>{user.dni}</strong> - {user.nombre} {user.apellido} ({user.role})
              </li>
            ))}
          </ul>
        )}
        
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p><strong>Credenciales esperadas:</strong></p>
          <p>SuperAdmin: superadmin / prueba123</p>
          <p>Presidente: presidente / prueba123</p>
        </div>
      </div>
    </div>
  );
}