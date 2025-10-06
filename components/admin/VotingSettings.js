// components/admin/VotingSettings.js
import { useState, useEffect } from 'react';

export default function VotingSettings({ votingConfig, onUpdateConfig }) {
    const [config, setConfig] = useState(votingConfig || {});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Cargar configuración desde la base de datos al montar el componente
    useEffect(() => {
        loadConfigFromDB();
    }, []);

    const loadConfigFromDB = async () => {
        try {
            const response = await fetch('/api/config');
            if (response.ok) {
                const configData = await response.json();
                setConfig(configData);
                if (onUpdateConfig) {
                    onUpdateConfig(configData);
                }
            }
        } catch (error) {
            console.error('Error cargando configuración:', error);
        }
    };

    const handleInputChange = (key, value) => {
        const newConfig = {
            ...config,
            [key]: {
                ...config[key],
                value: value
            }
        };
        setConfig(newConfig);
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage('');

        try {
            // Validar fechas
            const startDate = config.voting_start_date?.value;
            const endDate = config.voting_end_date?.value;

            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);

                if (start > end) {
                    setMessage('❌ La fecha de inicio no puede ser posterior a la fecha de fin');
                    setLoading(false);
                    return;
                }
            }

            // Actualizar cada configuración individualmente
            const updates = Object.entries(config).map(async ([key, item]) => {
                const response = await fetch('/api/config', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        key: key,
                        value: item.value
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Error actualizando ${key}`);
                }

                return response.json();
            });

            await Promise.all(updates);

            setMessage('✅ Configuración guardada correctamente');
            if (onUpdateConfig) {
                onUpdateConfig(config);
            }

            // Recargar configuración desde la BD para asegurar sincronización
            setTimeout(() => {
                loadConfigFromDB();
            }, 1000);

        } catch (error) {
            console.error('Error guardando configuración:', error);
            setMessage('❌ Error al guardar la configuración');
        } finally {
            setLoading(false);
        }
    };

    const adaptVotingConfig = (dbConfig) => {
        if (!dbConfig) return null;

        // Verificar si ya está en el formato nuevo
        if (dbConfig.isEnabled !== undefined) {
            return dbConfig;
        }

        // Adaptar desde el formato de base de datos
        return {
            isEnabled: dbConfig.system_status?.value === 'active',
            startDate: dbConfig.voting_start_date?.value,
            endDate: dbConfig.voting_end_date?.value,
            startTime: dbConfig.voting_schedule_start?.value,
            endTime: dbConfig.voting_schedule_end?.value,
            allowedDays: dbConfig.allowed_voting_days?.value
                ? dbConfig.allowed_voting_days.value.split(',').map(day => parseInt(day.trim()))
                : [1, 2, 3, 4, 5], // Por defecto: Lunes a Viernes
            maxVotesPerTable: parseInt(dbConfig.max_votes_per_table?.value) || 200
        };
    };

    const handleReset = async () => {
        if (window.confirm('¿Está seguro de que desea restablecer la configuración a los valores por defecto?')) {
            setLoading(true);
            setMessage('');

            try {
                const response = await fetch('/api/config', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'reset'
                    }),
                });

                if (response.ok) {
                    setMessage('✅ Configuración restablecida correctamente');
                    // Recargar configuración
                    setTimeout(() => {
                        loadConfigFromDB();
                    }, 1000);
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error);
                }
            } catch (error) {
                console.error('Error restableciendo configuración:', error);
                setMessage('❌ Error al restablecer la configuración');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleStatusToggle = async () => {
        const currentStatus = config.system_status?.value || 'active';
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        try {
            const response = await fetch('/api/config', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    key: 'system_status',
                    value: newStatus
                }),
            });

            if (response.ok) {
                setMessage(`✅ Sistema ${newStatus === 'active' ? 'activado' : 'desactivado'} correctamente`);
                // Recargar configuración
                setTimeout(() => {
                    loadConfigFromDB();
                }, 500);
            }
        } catch (error) {
            console.error('Error cambiando estado del sistema:', error);
            setMessage('❌ Error al cambiar el estado del sistema');
        }
    };

    // Si no hay configuración cargada, mostrar loading
    if (Object.keys(config).length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Configuración del Sistema</h2>
                <div className="text-center py-8">
                    <p>Cargando configuración...</p>
                </div>
            </div>
        );
    }

    // Calcular estado actual del sistema basado en fechas y horarios
    const getSystemStatusInfo = () => {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM
        const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

        const startDate = config.voting_start_date?.value;
        const endDate = config.voting_end_date?.value;
        const startTime = config.voting_schedule_start?.value;
        const endTime = config.voting_schedule_end?.value;

        let status = 'Fuera del período de votación';
        let color = 'text-red-600';

        if (startDate && endDate && startTime && endTime) {
            if (currentDate >= startDate && currentDate <= endDate) {
                if (currentTime >= startTime && currentTime <= endTime) {
                    status = 'Dentro del período de votación';
                    color = 'text-green-600';
                } else {
                    status = 'Dentro de fechas pero fuera del horario';
                    color = 'text-yellow-600';
                }
            }
        }

        return { status, color };
    };

    const systemStatusInfo = getSystemStatusInfo();

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Configuración del Sistema de Votación</h2>
                <div className="flex space-x-3">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button
                        onClick={handleReset}
                        disabled={loading}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
                    >
                        Restablecer
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded mb-4 ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                    {message}
                </div>
            )}

            {/* Estado del Sistema */}
            <div className="mb-6 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold">Estado del Sistema</h3>
                        <p className="text-sm text-gray-600">
                            {config.system_status?.description || 'Activar o desactivar el sistema de votación'}
                        </p>
                        <p className={`text-sm font-medium mt-1 ${systemStatusInfo.color}`}>
                            {systemStatusInfo.status}
                        </p>
                    </div>
                    <button
                        onClick={handleStatusToggle}
                        className={`px-4 py-2 rounded font-semibold ${config.system_status?.value === 'active'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                    >
                        {config.system_status?.value === 'active' ? 'Sistema Activo' : 'Sistema Inactivo'}
                    </button>
                </div>
            </div>

            {/* Período de Votación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Período de Votación
                    </label>
                    <input
                        type="text"
                        value={config.voting_period?.value || ''}
                        onChange={(e) => handleInputChange('voting_period', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: 2024"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {config.voting_period?.description || 'Año o período de la votación'}
                    </p>
                </div>
            </div>

            {/* Fechas de Votación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Inicio
                    </label>
                    <input
                        type="date"
                        value={config.voting_start_date?.value || ''}
                        onChange={(e) => handleInputChange('voting_start_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {config.voting_start_date?.description || 'Fecha de inicio de la votación'}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Fin
                    </label>
                    <input
                        type="date"
                        value={config.voting_end_date?.value || ''}
                        onChange={(e) => handleInputChange('voting_end_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {config.voting_end_date?.description || 'Fecha de fin de la votación'}
                    </p>
                </div>
            </div>

            {/* Horario de Votación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horario de Inicio
                    </label>
                    <input
                        type="time"
                        value={config.voting_schedule_start?.value || ''}
                        onChange={(e) => handleInputChange('voting_schedule_start', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {config.voting_schedule_start?.description || 'Horario de inicio de votación'}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horario de Fin
                    </label>
                    <input
                        type="time"
                        value={config.voting_schedule_end?.value || ''}
                        onChange={(e) => handleInputChange('voting_schedule_end', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {config.voting_schedule_end?.description || 'Horario de fin de votación'}
                    </p>
                </div>
            </div>

            {/* Días Permitidos */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Días de Votación Permitidos
                </label>
                <input
                    type="text"
                    value={config.allowed_voting_days?.value || ''}
                    onChange={(e) => handleInputChange('allowed_voting_days', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 1,2,3,4,5 (1=Lunes, 7=Domingo)"
                />
                <p className="text-xs text-gray-500 mt-1">
                    {config.allowed_voting_days?.description || 'Días de la semana permitidos para votar (1=Lunes, 7=Domingo)'}
                </p>
            </div>

            {/* Máximo de Votos por Mesa */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de Votos por Mesa
                </label>
                <input
                    type="number"
                    value={config.max_votes_per_table?.value || ''}
                    onChange={(e) => handleInputChange('max_votes_per_table', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 200"
                />
                <p className="text-xs text-gray-500 mt-1">
                    {config.max_votes_per_table?.description || 'Número máximo de votos permitidos por mesa'}
                </p>
            </div>

            {/* Resumen de Configuración Actual */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Resumen de Configuración Actual</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p><strong>Período:</strong> {config.voting_period?.value || 'No configurado'}</p>
                        <p><strong>Fechas:</strong> {config.voting_start_date?.value || '?'} a {config.voting_end_date?.value || '?'}</p>
                        <p><strong>Horario:</strong> {config.voting_schedule_start?.value || '?'} - {config.voting_schedule_end?.value || '?'}</p>
                    </div>
                    <div>
                        <p><strong>Días permitidos:</strong> {config.allowed_voting_days?.value || 'No configurado'}</p>
                        <p><strong>Máximo por mesa:</strong> {config.max_votes_per_table?.value || 'No configurado'}</p>
                        <p><strong>Estado:</strong> <span className={systemStatusInfo.color}>{systemStatusInfo.status}</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}