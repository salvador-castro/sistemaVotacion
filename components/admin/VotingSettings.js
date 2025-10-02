// components/admin/VotingSettings.js
import { useState, useEffect } from 'react';

export default function VotingSettings({ votingConfig, onUpdateConfig }) {
  const [config, setConfig] = useState({
    isEnabled: false,
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '18:00',
    allowedDays: [1, 2, 3, 4, 5], // Lunes a Viernes por defecto
    votingDuration: 7 // días
  });

  useEffect(() => {
    if (votingConfig) {
      setConfig(votingConfig);
    }
  }, [votingConfig]);

  const handleSave = () => {
    onUpdateConfig(config);
    alert('✅ Configuración guardada correctamente');
  };

  const toggleDay = (dayIndex) => {
    setConfig(prev => ({
      ...prev,
      allowedDays: prev.allowedDays.includes(dayIndex)
        ? prev.allowedDays.filter(d => d !== dayIndex)
        : [...prev.allowedDays, dayIndex]
    }));
  };

  const getDayName = (dayIndex) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayIndex];
  };

  const isCurrentlyActive = () => {
    if (!config.isEnabled) return false;
    
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    
    // Verificar día permitido
    if (!config.allowedDays.includes(currentDay)) return false;
    
    // Verificar horario
    if (currentTime < config.startTime || currentTime > config.endTime) return false;
    
    // Verificar fecha
    if (config.startDate && config.endDate) {
      const start = new Date(config.startDate);
      const end = new Date(config.endDate);
      end.setHours(23, 59, 59); // Hasta fin del día
      
      if (now < start || now > end) return false;
    }
    
    return true;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Configuración del Sistema de Votación</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
          isCurrentlyActive() 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isCurrentlyActive() ? '✅ SISTEMA ACTIVO' : '❌ SISTEMA INACTIVO'}
        </div>
      </div>

      <div className="space-y-6">
        {/* Habilitar/Deshabilitar Sistema */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Estado del Sistema</h3>
              <p className="text-sm text-gray-600">Activar o desactivar todo el sistema de votación</p>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                config.isEnabled ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                config.isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Período de Votación */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Período de Votación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={config.startDate}
                onChange={(e) => setConfig(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={config.endDate}
                onChange={(e) => setConfig(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Horario de Votación */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Horario de Votación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Apertura
              </label>
              <input
                type="time"
                value={config.startTime}
                onChange={(e) => setConfig(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Cierre
              </label>
              <input
                type="time"
                value={config.endTime}
                onChange={(e) => setConfig(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Días Permitidos */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Días de Votación Permitidos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
              <button
                key={dayIndex}
                onClick={() => toggleDay(dayIndex)}
                className={`p-3 rounded-lg border-2 text-center ${
                  config.allowedDays.includes(dayIndex)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                {getDayName(dayIndex)}
              </button>
            ))}
          </div>
        </div>

        {/* Resumen de Configuración */}
        <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Resumen de Configuración</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Estado:</strong> {config.isEnabled ? 'Habilitado' : 'Deshabilitado'}</p>
            <p><strong>Período:</strong> {config.startDate && config.endDate 
              ? `${config.startDate} al ${config.endDate}` 
              : 'No configurado'}</p>
            <p><strong>Horario:</strong> {config.startTime} - {config.endTime}</p>
            <p><strong>Días permitidos:</strong> {config.allowedDays.map(getDayName).join(', ')}</p>
            <p><strong>Estado actual:</strong> {isCurrentlyActive() ? 'ACTIVO - Votación permitida' : 'INACTIVO - Votación bloqueada'}</p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setConfig({
              isEnabled: false,
              startDate: '',
              endDate: '',
              startTime: '08:00',
              endTime: '18:00',
              allowedDays: [1, 2, 3, 4, 5],
              votingDuration: 7
            })}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Restablecer
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
}