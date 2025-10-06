// pages/admin.js
import { useState, useEffect } from 'react';
import AdminDashboard from '../components/admin/Dashboard';
import VotersManagement from '../components/admin/VotersManagement';
import Reports from '../components/admin/Reports';
import ImportVoters from '../components/admin/ImportVoters';
import VotingSettings from '../components/admin/VotingSettings';
import PollingStations from '../components/admin/PollingStations';

// Función para adaptar la configuración de la base de datos al formato esperado por PollingStations
const adaptVotingConfig = (dbConfig) => {
    if (!dbConfig) return null;

    // Verificar si ya está en el formato nuevo (por si acaso)
    if (dbConfig.isEnabled !== undefined) {
        return dbConfig;
    }

    // Adaptar desde el formato de base de datos
    const adaptedConfig = {
        isEnabled: dbConfig.system_status?.value === 'active',
        startDate: dbConfig.voting_start_date?.value,
        endDate: dbConfig.voting_end_date?.value,
        startTime: dbConfig.voting_schedule_start?.value,
        endTime: dbConfig.voting_schedule_end?.value,
        allowedDays: dbConfig.allowed_voting_days?.value
            ? dbConfig.allowed_voting_days.value.split(',').map(day => parseInt(day.trim()))
            : [1, 2, 3, 4, 5, 6], // Por defecto: Lunes a Sábado
        maxVotesPerTable: parseInt(dbConfig.max_votes_per_table?.value) || 200
    };

    console.log('Configuración adaptada:', adaptedConfig);
    return adaptedConfig;
};

export default function Admin() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [voters, setVoters] = useState([]);
    const [pollingStations, setPollingStations] = useState([]);
    const [votingConfig, setVotingConfig] = useState(null);
    const [adaptedVotingConfig, setAdaptedVotingConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    // Función para cargar votantes desde la base de datos
    const loadVotersFromDB = async () => {
        try {
            const response = await fetch('/api/voters');
            if (response.ok) {
                const votersData = await response.json();
                setVoters(votersData);
            } else {
                console.error('Error cargando votantes desde la base de datos');
            }
        } catch (error) {
            console.error('Error cargando votantes:', error);
        }
    };

    // Función para cargar configuración desde la base de datos
    const loadConfigFromDB = async () => {
        try {
            const response = await fetch('/api/config');
            if (response.ok) {
                const configData = await response.json();
                setVotingConfig(configData);
                // También guardar en localStorage como backup
                localStorage.setItem('votingConfig', JSON.stringify(configData));
            } else {
                console.error('Error cargando configuración desde la base de datos');
                // Si falla la BD, cargar desde localStorage
                const savedConfig = localStorage.getItem('votingConfig');
                if (savedConfig) setVotingConfig(JSON.parse(savedConfig));
            }
        } catch (error) {
            console.error('Error cargando configuración:', error);
            // Si hay error, cargar desde localStorage
            const savedConfig = localStorage.getItem('votingConfig');
            if (savedConfig) setVotingConfig(JSON.parse(savedConfig));
        }
    };

    // Efecto para adaptar la configuración cuando cambie
    useEffect(() => {
        if (votingConfig) {
            const adapted = adaptVotingConfig(votingConfig);
            setAdaptedVotingConfig(adapted);
        } else {
            setAdaptedVotingConfig(null);
        }
    }, [votingConfig]);

    useEffect(() => {
        const userData = localStorage.getItem('user');

        if (!userData) {
            window.location.href = '/login';
            return;
        }

        try {
            const user = JSON.parse(userData);
            if (user.role !== 'super_admin') {
                window.location.href = '/login';
                return;
            }
            setUser(user);

            // Cargar datos desde la base de datos
            Promise.all([
                loadVotersFromDB(),
                loadConfigFromDB()
            ]).finally(() => {
                setLoading(false);
            });

            // Cargar mesas desde localStorage (por ahora)
            const savedStations = localStorage.getItem('pollingStations');
            if (savedStations) {
                setPollingStations(JSON.parse(savedStations));
            } else {
                setPollingStations([]);
            }

        } catch (error) {
            window.location.href = '/login';
            return;
        }
    }, []);

    // Efectos para persistencia (solo para mesas)
    useEffect(() => {
        if (pollingStations.length > 0) {
            localStorage.setItem('pollingStations', JSON.stringify(pollingStations));
        } else {
            localStorage.removeItem('pollingStations');
        }
    }, [pollingStations]);

    // Función actualizada para importar Excel
    const handleFileUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append('excelFile', file);

            const response = await fetch('/api/import/excel', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                // Recargar los votantes desde la base de datos
                await loadVotersFromDB();
                return {
                    success: true,
                    count: data.imported,
                    message: `Importación exitosa: ${data.imported} nuevos, ${data.duplicates} actualizados`
                };
            } else {
                return {
                    success: false,
                    error: data.error || 'Error en la importación'
                };
            }
        } catch (error) {
            console.error('Error en importación:', error);
            return {
                success: false,
                error: 'Error de conexión durante la importación'
            };
        }
    };

    // Función actualizada para borrar todos los votantes
    const clearVoters = async () => {
        if (window.confirm('⚠️ ¿Está seguro de que desea eliminar TODOS los votantes de la base de datos?\n\nEsta acción NO se puede deshacer y eliminará todos los votantes y sus votos.')) {
            try {
                const response = await fetch('/api/voters', {
                    method: 'DELETE',
                });

                const data = await response.json();

                if (response.ok) {
                    // Actualizar estado local
                    setVoters([]);
                    alert(`✅ ${data.deleted} votantes eliminados correctamente`);
                } else {
                    alert(`❌ Error: ${data.error}`);
                }
            } catch (error) {
                console.error('Error eliminando votantes:', error);
                alert('❌ Error de conexión al eliminar votantes');
            }
        }
    };

    // Función actualizada para cambiar estado de votante
    const toggleVoterStatus = async (voterId) => {
        try {
            const response = await fetch(`/api/voters/${voterId}/toggle`, {
                method: 'PUT',
            });

            const data = await response.json();

            if (response.ok) {
                // Actualizar estado local
                setVoters(prev => prev.map(voter =>
                    voter.id === voterId
                        ? { ...voter, enabled: data.enabled }
                        : voter
                ));
            } else {
                alert(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error actualizando votante:', error);
            alert('❌ Error de conexión al actualizar votante');
        }
    };

    const togglePollingStation = (stationId) => {
        setPollingStations(prev => prev.map(station => {
            if (station.id === stationId) {
                const now = new Date().toISOString();
                return {
                    ...station,
                    isOpen: !station.isOpen,
                    openedAt: !station.isOpen ? now : station.openedAt,
                    closedAt: station.isOpen ? now : null
                };
            }
            return station;
        }));
    };

    const addPollingStation = (newStation) => {
        setPollingStations(prev => [...prev, newStation]);
    };

    const updateVotingConfig = (newConfig) => {
        setVotingConfig(newConfig);
        // También guardar en localStorage como backup
        localStorage.setItem('votingConfig', JSON.stringify(newConfig));
    };

    // Función temporal para debug
    const debugConfig = () => {
        console.log('=== DEBUG CONFIGURACIÓN ===');
        console.log('Configuración original (BD):', votingConfig);
        console.log('Configuración adaptada:', adaptedVotingConfig);
        console.log('==========================');
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('votingConfig'); // Limpiar backup
        localStorage.removeItem('pollingStations');
        window.location.href = '/login';
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

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                            <p className="text-gray-600">Super Administrador</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={debugConfig}
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
                            >
                                Debug Config
                            </button>
                            <span className="text-gray-700">
                                {user.nombre} {user.apellido}
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

            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto">
                        {[
                            { key: 'dashboard', label: 'Dashboard' },
                            { key: 'voters', label: 'Gestión de Votantes' },
                            { key: 'stations', label: 'Mesas de Votación' },
                            { key: 'settings', label: 'Configuración' },
                            { key: 'reports', label: 'Reportes' },
                            { key: 'import', label: 'Importar Padrón' }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.key
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {activeTab === 'dashboard' && (
                        <AdminDashboard
                            voters={voters}
                            pollingStations={pollingStations}
                            votingConfig={adaptedVotingConfig}
                        />
                    )}

                    {activeTab === 'voters' && (
                        <VotersManagement
                            voters={voters}
                            onToggleStatus={toggleVoterStatus}
                            onClearVoters={clearVoters}
                        />
                    )}

                    {activeTab === 'stations' && (
                        <PollingStations
                            pollingStations={pollingStations}
                            onToggleStation={togglePollingStation}
                            onAddStation={addPollingStation}
                            votingConfig={adaptedVotingConfig}
                        />
                    )}

                    {activeTab === 'settings' && (
                        <VotingSettings
                            votingConfig={votingConfig}
                            onUpdateConfig={updateVotingConfig}
                        />
                    )}

                    {activeTab === 'reports' && (
                        <Reports />
                    )}

                    {activeTab === 'import' && (
                        <ImportVoters onFileUpload={handleFileUpload} votersCount={voters.length} />
                    )}
                </div>
            </main>
        </div>
    );
}