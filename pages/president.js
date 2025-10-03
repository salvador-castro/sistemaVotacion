// pages/president.js
import { useState, useEffect } from 'react';

export default function PresidentPanel() {
  const [session, setSession] = useState(null);
  const [mesa, setMesa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voters, setVoters] = useState([]);
  const [searchDni, setSearchDni] = useState('');
  const [currentVoter, setCurrentVoter] = useState(null);
  const [showVoterInfo, setShowVoterInfo] = useState(false);

  useEffect(() => {
    // Verificar sesión
    const presidentSession = localStorage.getItem('presidentSession');
    if (!presidentSession) {
      window.location.href = '/login-president';
      return;
    }

    try {
      const sessionData = JSON.parse(presidentSession);
      setSession(sessionData);

      // Buscar información actualizada de la mesa
      const pollingStations = JSON.parse(localStorage.getItem('pollingStations') || '[]');
      const today = new Date().toDateString();
      
      const currentMesa = pollingStations.find(station => {
        const stationDate = new Date(station.createdAt).toDateString();
        return stationDate === today && station.id === sessionData.mesaId;
      });

      if (!currentMesa) {
        alert('❌ Mesa no encontrada. Contacte al administrador.');
        localStorage.removeItem('presidentSession');
        window.location.href = '/login-president';
        return;
      }

      if (!currentMesa.isOpen) {
        alert('❌ La mesa está cerrada. Contacte al administrador.');
        localStorage.removeItem('presidentSession');
        window.location.href = '/login-president';
        return;
      }

      setMesa(currentMesa);

      // Cargar votantes (solo para verificación, no se muestran)
      const savedVoters = localStorage.getItem('voters');
      if (savedVoters) {
        setVoters(JSON.parse(savedVoters));
      }

    } catch (error) {
      localStorage.removeItem('presidentSession');
      window.location.href = '/login-president';
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchVoter = () => {
    if (!searchDni) {
      alert('Por favor ingrese un DNI');
      return;
    }

    const voter = voters.find(v => v.dni === searchDni);
    
    if (!voter) {
      alert('❌ Votante no encontrado en el padrón');
      return;
    }

    if (!voter.enabled) {
      alert('❌ Votante inhabilitado para votar');
      return;
    }

    if (voter.voted) {
      alert('⚠️ Este votante ya ejerció su derecho al voto');
      return;
    }

    // Mostrar información del votante para confirmación
    setCurrentVoter(voter);
    setShowVoterInfo(true);
  };

  const confirmVote = () => {
    if (!currentVoter) return;

    // Marcar como votado
    const updatedVoters = voters.map(v => 
      v.id === currentVoter.id ? { ...v, voted: 1 } : v
    );
    
    setVoters(updatedVoters);
    localStorage.setItem('voters', JSON.stringify(updatedVoters));
    
    // Actualizar contador de la mesa
    const pollingStations = JSON.parse(localStorage.getItem('pollingStations') || '[]');
    const updatedStations = pollingStations.map(station => 
      station.id === mesa.id 
        ? { ...station, voters: station.voters + 1 }
        : station
    );
    
    localStorage.setItem('pollingStations', JSON.stringify(updatedStations));
    setMesa(prev => ({ ...prev, voters: prev.voters + 1 }));
    
    alert('✅ Voto registrado correctamente');
    setSearchDni('');
    setShowVoterInfo(false);
    setCurrentVoter(null);
  };

  const cancelVote = () => {
    setShowVoterInfo(false);
    setCurrentVoter(null);
    setSearchDni('');
  };

const logout = () => {

  localStorage.removeItem('presidentSession');
  window.location.href = '/login-president';
};

  // Función para capitalizar nombres
  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Verificando acceso...</h1>
        </div>
      </div>
    );
  }

  if (!session || !mesa) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel del Presidente de Mesa</h1>
              <p className="text-gray-600">{mesa.name} - {mesa.location}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Presidente: {session.presidentName || 'No asignado'}
              </span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Estadísticas de la Mesa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800">Votos Registrados</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{mesa.voters}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800">Estado Mesa</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {mesa.isOpen ? 'ABIERTA' : 'CERRADA'}
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800">Hora Apertura</h3>
              <p className="text-lg font-bold text-purple-600 mt-2">
                {mesa.openedAt ? new Date(mesa.openedAt).toLocaleTimeString('es-ES') : 'No abierta'}
              </p>
            </div>
          </div>

          {/* Buscador de Votantes */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Registro de Votos</h2>
            
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchDni}
                  onChange={(e) => setSearchDni(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ingrese DNI del votante"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength="8"
                />
              </div>
              <button
                onClick={handleSearchVoter}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Buscar Votante
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              Ingrese el DNI (solo números) para verificar y registrar el voto
            </p>
          </div>

          {/* Modal de confirmación de voto */}
          {showVoterInfo && currentVoter && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-4 text-green-600">✅ Confirmar Voto</h3>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Información del Votante:</h4>
                  
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-700">DNI:</span>
                      <span className="font-mono font-semibold">{currentVoter.dni}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Nombre:</span>
                      <span className="font-semibold">
                        {capitalize(currentVoter.nombre)} {capitalize(currentVoter.apellido)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Especialidad:</span>
                      <span className="font-semibold capitalize">{currentVoter.especialidad}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Estado:</span>
                      <span className="font-semibold text-green-600">HABILITADO</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>⚠️ Verifique que los datos coincidan con el documento del votante</strong>
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelVote}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmVote}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Confirmar Voto
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Información de la Mesa */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Información de la Mesa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Nombre:</strong> {mesa.name}</p>
                <p><strong>Ubicación:</strong> {mesa.location}</p>
                <p><strong>Presidente:</strong> {mesa.president || 'No asignado'}</p>
              </div>
              <div>
                <p><strong>DNI Presidente:</strong> {mesa.presidentDNI}</p>
                <p><strong>Estado:</strong> <span className="text-green-600 font-semibold">Abierta</span></p>
                <p><strong>Hora apertura:</strong> {mesa.openedAt ? new Date(mesa.openedAt).toLocaleString('es-ES') : 'No abierta'}</p>
              </div>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">📋 Instrucciones para el Presidente</h3>
            <ul className="text-sm text-yellow-700 space-y-2">
              <li>• Ingrese el DNI del votante para verificar su habilitación</li>
              <li>• Verifique que los datos coincidan con el documento de identidad</li>
              <li>• Confirme el voto solo después de verificar la identidad</li>
              <li>• Cada DNI solo puede votar una vez</li>
              <li>• En caso de duda, contacte al administrador del sistema o fiscales generales</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}