// pages/vote.js - VERSIÓN SIMPLIFICADA
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Vote() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // TEMPORAL: Deshabilitar verificación por ahora
    setUser({
      dni: 'presidente',
      role: 'president', 
      nombre: 'Presidente',
      apellido: 'Mesa'
    });
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Votación</h1>
              <p className="text-gray-600">Presidente de Mesa: {user?.nombre} {user?.apellido}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">✅ ¡Panel de Presidente funciona!</h2>
          <p>Has accedido correctamente al panel de presidente de mesa.</p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800">
              Funcionalidades disponibles:
            </p>
            <ul className="list-disc list-inside mt-2 text-blue-700">
              <li>Buscar votantes por DNI</li>
              <li>Registrar votos en Medrano o Campus</li>
              <li>Abrir/cerrar mesa de votación</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}