// pages/admin.js
import { useState, useEffect } from 'react';
import AdminDashboard from '../components/admin/Dashboard';
import VotersManagement from '../components/admin/VotersManagement';
import Reports from '../components/admin/Reports';
import ImportVoters from '../components/admin/ImportVoters';
import VotingSettings from '../components/admin/VotingSettings';
import PollingStations from '../components/admin/PollingStations';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [voters, setVoters] = useState([]);
  const [pollingStations, setPollingStations] = useState([]);
  const [votingConfig, setVotingConfig] = useState(null);
  const [loading, setLoading] = useState(true);

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
    
    // Cargar datos desde localStorage
    const savedVoters = localStorage.getItem('voters');
    if (savedVoters) setVoters(JSON.parse(savedVoters));

    const savedStations = localStorage.getItem('pollingStations');
    if (savedStations) {
      setPollingStations(JSON.parse(savedStations));
    } else {
      // Si no hay mesas guardadas, inicializar con array vacío
      setPollingStations([]);
    }

    const savedConfig = localStorage.getItem('votingConfig');
    if (savedConfig) setVotingConfig(JSON.parse(savedConfig));

  } catch (error) {
    window.location.href = '/login';
    return;
  } finally {
    setLoading(false);
  }
}, []);

  // Efectos para persistencia
  useEffect(() => {
    if (voters.length > 0) {
      localStorage.setItem('voters', JSON.stringify(voters));
    } else {
      localStorage.removeItem('voters');
    }
  }, [voters]);

  useEffect(() => {
    if (pollingStations.length > 0) {
      localStorage.setItem('pollingStations', JSON.stringify(pollingStations));
    } else {
      localStorage.removeItem('pollingStations');
    }
  }, [pollingStations]);

  useEffect(() => {
    if (votingConfig) {
      localStorage.setItem('votingConfig', JSON.stringify(votingConfig));
    } else {
      localStorage.removeItem('votingConfig');
    }
  }, [votingConfig]);

  const handleFileUpload = async (file) => {
    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            if (jsonData.length === 0) {
              reject(new Error('El archivo Excel está vacío'));
              return;
            }

            const firstRow = jsonData[0];
            const requiredColumns = ['dni', 'nombre', 'apellido', 'especialidad'];
            const missingColumns = requiredColumns.filter(col => !firstRow.hasOwnProperty(col));
            
            if (missingColumns.length > 0) {
              reject(new Error(`Faltan columnas requeridas: ${missingColumns.join(', ')}`));
              return;
            }

            const importedVoters = jsonData.map((row, index) => ({
              id: Date.now() + index,
              dni: String(row.dni),
              nombre: String(row.nombre),
              apellido: String(row.apellido),
              especialidad: String(row.especialidad),
              enabled: 1,
              voted: 0
            }));

            setVoters(importedVoters);
            resolve({ success: true, count: importedVoters.length });
          } catch (error) {
            reject(new Error('Error al procesar el archivo Excel: ' + error.message));
          }
        };
        
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsArrayBuffer(file);
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const clearVoters = () => {
    if (window.confirm('⚠️ ¿Está seguro de que desea vaciar la gestión de votantes?\n\nEsta acción eliminará todos los votantes y reseteará las estadísticas.')) {
      setVoters([]);
    }
  };

  const toggleVoterStatus = (voterId) => {
    setVoters(prev => prev.map(voter => 
      voter.id === voterId 
        ? { ...voter, enabled: voter.enabled ? 0 : 1 }
        : voter
    ));
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
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('voters');
    localStorage.removeItem('pollingStations');
    localStorage.removeItem('votingConfig');
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
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.key
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
              votingConfig={votingConfig}
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
                onAddStation={addPollingStation} // <- Agregar esta prop
            />
            )}
          
          {activeTab === 'settings' && (
            <VotingSettings 
              votingConfig={votingConfig}
              onUpdateConfig={updateVotingConfig}
            />
          )}
          
          {activeTab === 'reports' && (
            <Reports voters={voters} />
          )}
          
          {activeTab === 'import' && (
            <ImportVoters onFileUpload={handleFileUpload} votersCount={voters.length} />
          )}
        </div>
      </main>
    </div>
  );
}