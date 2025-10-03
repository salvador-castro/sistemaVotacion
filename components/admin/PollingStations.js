// components/admin/PollingStations.js
import { useState, useEffect } from 'react';

export default function PollingStations({ pollingStations, onToggleStation, onAddStation, votingConfig }) {
  const [stations, setStations] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newStation, setNewStation] = useState({
    name: '',
    location: '',
    presidentName: '',
    presidentDNI: ''
  });

  useEffect(() => {
    setStations(pollingStations);
  }, [pollingStations]);

  // Función para verificar si el sistema está activo
  const isSystemActive = () => {
    if (!votingConfig?.isEnabled) return false;
    
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    
    // Verificar día permitido
    if (!votingConfig.allowedDays.includes(currentDay)) return false;
    
    // Verificar horario
    if (currentTime < votingConfig.startTime || currentTime > votingConfig.endTime) return false;
    
    // Verificar fecha
    if (votingConfig.startDate && votingConfig.endDate) {
      const start = new Date(votingConfig.startDate);
      const end = new Date(votingConfig.endDate);
      end.setHours(23, 59, 59);
      
      if (now < start || now > end) return false;
    }
    
    return true;
  };

  // Función para validar si la mesa ya existe
  const isStationDuplicate = (name, location) => {
    const today = new Date().toDateString();
    return stations.some(station => {
      const stationDate = new Date(station.createdAt).toDateString();
      return stationDate === today && 
             station.name.toLowerCase() === name.toLowerCase() && 
             station.location.toLowerCase() === location.toLowerCase();
    });
  };

  const handleCreateStation = () => {
    // Verificar si el sistema está activo
    if (!isSystemActive()) {
      alert('❌ Error: El sistema de votación está cerrado. No se pueden crear mesas fuera del horario de votación.');
      return;
    }

    if (!newStation.name || !newStation.location) {
      alert('Por favor complete el nombre y ubicación de la mesa');
      return;
    }

    if (!newStation.presidentDNI) {
      alert('Por favor ingrese el DNI del presidente de mesa');
      return;
    }

    // Validar formato de DNI (8 dígitos numéricos)
    const dniRegex = /^\d{8}$/;
    if (!dniRegex.test(newStation.presidentDNI)) {
      alert('❌ Error: El DNI debe contener exactamente 8 dígitos numéricos');
      return;
    }

    // Validar si la mesa ya existe hoy
    if (isStationDuplicate(newStation.name, newStation.location)) {
      alert('❌ Error: Ya existe una mesa con ese nombre y ubicación creada hoy');
      return;
    }

    const station = {
      id: Date.now(),
      name: newStation.name,
      location: newStation.location,
      president: newStation.presidentName,
      presidentDNI: newStation.presidentDNI,
      isOpen: false,
      voters: 0,
      createdAt: new Date().toISOString(),
      openedAt: null,
      closedAt: null
    };

    // Usar la función del padre para agregar la mesa
    if (onAddStation) {
      onAddStation(station);
    }
    
    // Cerrar modal y resetear formulario
    setShowCreateModal(false);
    setNewStation({ name: '', location: '', presidentName: '', presidentDNI: '' });
    
    alert(`✅ Mesa "${station.name}" creada correctamente\n\n📋 Información para el presidente:\n• Código de mesa: ${station.id}\n• DNI requerido: ${station.presidentDNI}\n\nGuarde esta información para compartir con el presidente de mesa.`);
  };

  const openAllStations = () => {
    // Verificar si el sistema está activo
    if (!isSystemActive()) {
      alert('❌ Error: El sistema de votación está cerrado. No se pueden abrir mesas fuera del horario de votación.');
      return;
    }

    const now = new Date().toISOString();
    stations.forEach(station => {
      if (!station.isOpen) {
        // Usar la función del padre para cambiar el estado
        if (onToggleStation) {
          // Simular el toggle para cada mesa cerrada
          setTimeout(() => onToggleStation(station.id), 100);
        }
      }
    });
  };

  const closeAllStations = () => {
    const now = new Date().toISOString();
    stations.forEach(station => {
      if (station.isOpen) {
        // Usar la función del padre para cambiar el estado
        if (onToggleStation) {
          // Simular el toggle para cada mesa abierta
          setTimeout(() => onToggleStation(station.id), 100);
        }
      }
    });
  };

  const handleDeleteAllStations = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAllStations = () => {
    // Eliminar todas las mesas del localStorage
    localStorage.removeItem('pollingStations');
    
    // Recargar la página para actualizar el estado
    window.location.reload();
  };

  const handleToggleStation = (stationId) => {
    // Verificar si el sistema está activo para abrir mesas
    const station = stations.find(s => s.id === stationId);
    if (station && !station.isOpen && !isSystemActive()) {
      alert('❌ Error: El sistema de votación está cerrado. No se pueden abrir mesas fuera del horario de votación.');
      return;
    }

    // Simplemente llamar a la función del padre
    if (onToggleStation) {
      onToggleStation(stationId);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
  };

  const getTodayStations = () => {
    const today = new Date().toDateString();
    return stations.filter(station => {
      const stationDate = new Date(station.createdAt).toDateString();
      return stationDate === today;
    });
  };

  const todayStations = getTodayStations();

  // Obtener estado del sistema
  const systemActive = isSystemActive();

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gestión de Mesas de Votación</h2>
            <p className="text-gray-600 mt-1">
              {todayStations.filter(s => s.isOpen).length} de {todayStations.length} mesas abiertas hoy
            </p>
            <div className={`mt-2 inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
              systemActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {systemActive ? '✅ SISTEMA ACTIVO - Votación permitida' : '❌ SISTEMA CERRADO - Votación bloqueada'}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                if (!systemActive) {
                  alert('❌ Error: El sistema de votación está cerrado. No se pueden crear mesas fuera del horario de votación.');
                  return;
                }
                setShowCreateModal(true);
              }}
              className={`px-4 py-2 rounded-md text-sm ${
                systemActive 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
              disabled={!systemActive}
            >
              Crear Nueva Mesa
            </button>
            {todayStations.length > 0 && (
              <>
                <button
                  onClick={openAllStations}
                  className={`px-4 py-2 rounded-md text-sm ${
                    systemActive 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                  disabled={!systemActive}
                >
                  Abrir Todas
                </button>
                <button
                  onClick={closeAllStations}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                >
                  Cerrar Todas
                </button>
                <button
                  onClick={handleDeleteAllStations}
                  className="bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-900 text-sm"
                >
                  Borrar Todas
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal para crear mesa */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-90vh overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Crear Nueva Mesa</h3>
            
            {/* Indicador de estado del sistema */}
            <div className={`mb-4 p-3 rounded-md ${
              systemActive ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-semibold ${
                systemActive ? 'text-green-800' : 'text-red-800'
              }`}>
                {systemActive ? '✅ Sistema ACTIVO - Puede crear mesas' : '❌ Sistema CERRADO - No puede crear mesas'}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Mesa *
                </label>
                <input
                  type="text"
                  value={newStation.name}
                  onChange={(e) => setNewStation({...newStation, name: e.target.value})}
                  placeholder="Ej: Mesa 1 - Medrano"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!systemActive}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación *
                </label>
                <input
                  type="text"
                  value={newStation.location}
                  onChange={(e) => setNewStation({...newStation, location: e.target.value})}
                  placeholder="Ej: Sede Medrano, Aula 101"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!systemActive}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Presidente (Opcional)
                </label>
                <input
                  type="text"
                  value={newStation.presidentName}
                  onChange={(e) => setNewStation({...newStation, presidentName: e.target.value})}
                  placeholder="Nombre completo del presidente"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!systemActive}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNI del Presidente *
                </label>
                <input
                  type="text"
                  value={newStation.presidentDNI}
                  onChange={(e) => setNewStation({...newStation, presidentDNI: e.target.value.replace(/\D/g, '')})}
                  placeholder="12345678 (8 dígitos)"
                  maxLength="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!systemActive}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Solo números, sin puntos ni espacios
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>💡 Información importante:</strong> Al crear la mesa, se generará un código único que el presidente usará para acceder al sistema junto con su DNI.
              </p>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Validación:</strong> No se permiten mesas duplicadas (mismo nombre y ubicación) en el mismo día.
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateStation}
                className={`px-4 py-2 rounded-md ${
                  systemActive 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
                disabled={!systemActive}
              >
                Crear Mesa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para borrar todas las mesas */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 text-red-600">⚠️ Confirmar Eliminación</h3>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                <strong>¿Está seguro de que desea eliminar TODAS las mesas?</strong>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Esta acción eliminará:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Todas las mesas creadas hoy ({todayStations.length} mesas)</li>
                <li>Todo el historial de apertura/cierre</li>
                <li>Los datos de los presidentes asignados</li>
                <li>Todos los códigos de acceso para presidentes</li>
              </ul>
              <p className="text-sm text-red-600 mt-3 font-semibold">
                ⚠️ Esta acción no se puede deshacer
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteAllStations}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Sí, Eliminar Todas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Mesas del Día */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código Mesa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mesa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Presidente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DNI Presidente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora Apertura
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora Cierre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Votos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {todayStations.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                  No hay mesas creadas para hoy. Haga click en "Crear Nueva Mesa" para comenzar.
                </td>
              </tr>
            ) : (
              todayStations.map((station) => (
                <tr key={station.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono font-bold text-blue-600">{station.id}</div>
                    <div className="text-xs text-gray-500">Para presidentes</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{station.name}</div>
                    <div className="text-xs text-gray-500">
                      Creada: {formatDateTime(station.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{station.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {station.president || 'No asignado'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {station.presidentDNI || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      station.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {station.isOpen ? 'Abierta' : 'Cerrada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {station.openedAt ? formatDateTime(station.openedAt) : 'No abierta'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {station.closedAt ? formatDateTime(station.closedAt) : station.isOpen ? 'Abierta' : 'No cerrada'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {station.voters}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleToggleStation(station.id)}
                      className={`px-4 py-2 rounded text-sm font-semibold ${
                        station.isOpen 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : systemActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!station.isOpen && !systemActive}
                    >
                      {station.isOpen ? 'Cerrar Mesa' : 'Abrir Mesa'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen del Día */}
      {todayStations.length > 0 && (
        <div className="p-6 bg-gray-50 border-t">
          <h4 className="text-lg font-semibold mb-4">Resumen del Día</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {todayStations.filter(s => s.isOpen).length}
              </div>
              <div className="text-green-800">Mesas Abiertas</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {todayStations.filter(s => !s.isOpen).length}
              </div>
              <div className="text-red-800">Mesas Cerradas</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {todayStations.reduce((total, station) => total + station.voters, 0)}
              </div>
              <div className="text-blue-800">Total Votos</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {todayStations.filter(s => s.openedAt).length}
              </div>
              <div className="text-purple-800">Mesas que Abrieron</div>
            </div>
          </div>

          {/* Información para presidentes */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-semibold text-blue-800 mb-2">📋 Información para Presidentes de Mesa</h5>
            <p className="text-sm text-blue-700">
              Cada presidente necesita: <strong>Código de Mesa</strong> (mostrado en la tabla) + <strong>DNI asignado</strong>
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Acceden a través de: <code className="bg-blue-100 px-1 rounded">/login-president</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}