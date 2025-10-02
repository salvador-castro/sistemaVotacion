// pages/login.js - VERSIÓN ULTRA-SIMPLIFICADA
import { useState } from 'react';

export default function Login() {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validación directa sin API
    if (dni === 'superadmin' && password === 'prueba123') {
      // Guardar en localStorage y redirigir
      localStorage.setItem('user', JSON.stringify({
        dni: 'superadmin',
        role: 'super_admin',
        nombre: 'Super',
        apellido: 'Administrador'
      }));
      window.location.href = '/admin';
      return;
    }

    if (dni === 'presidente' && password === 'prueba123') {
      localStorage.setItem('user', JSON.stringify({
        dni: 'presidente', 
        role: 'president',
        nombre: 'Presidente',
        apellido: 'Mesa'
      }));
      window.location.href = '/vote';
      return;
    }

    setError('Credenciales incorrectas. Use: superadmin/prueba123 o presidente/prueba123');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">V</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sistema de Votación
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingrese sus credenciales de acceso
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                id="dni"
                name="dni"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="superadmin o presidente"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="prueba123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? 'Verificando...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500">
          <p><strong>Credenciales de prueba:</strong></p>
          <p>SuperAdmin: superadmin / prueba123</p>
          <p>Presidente: presidente / prueba123</p>
        </div>
      </div>
    </div>
  );
}