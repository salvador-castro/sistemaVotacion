// components/admin/Reports.js
export default function Reports({ voters }) {
  const exportPDF = (type) => {
    const totalVoters = voters.length;
    const votedVoters = voters.filter(v => v.voted).length;
    const participation = totalVoters > 0 ? Math.round((votedVoters / totalVoters) * 100) : 0;

    alert(`📊 Generando reporte ${type}...\n\nTotal de votantes: ${totalVoters}\nVotos emitidos: ${votedVoters}\nParticipación: ${participation}%`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Reportes y Estadísticas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
             onClick={() => exportPDF('general')}>
          <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <span className="text-blue-600 text-xl">📊</span>
          </div>
          <h3 className="font-semibold mb-2">Reporte General</h3>
          <p className="text-sm text-gray-600 mb-4">Resumen completo de la votación</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
            Descargar PDF
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
             onClick={() => exportPDF('sede')}>
          <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <span className="text-green-600 text-xl">🏛️</span>
          </div>
          <h3 className="font-semibold mb-2">Por Sede</h3>
          <p className="text-sm text-gray-600 mb-4">Votos por Medrano y Campus</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
            Descargar PDF
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
             onClick={() => exportPDF('horario')}>
          <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <span className="text-purple-600 text-xl">⏰</span>
          </div>
          <h3 className="font-semibold mb-2">Por Franja Horaria</h3>
          <p className="text-sm text-gray-600 mb-4">Mañana, tarde y noche</p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm">
            Descargar PDF
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
             onClick={() => exportPDF('especialidad')}>
          <div className="bg-orange-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <span className="text-orange-600 text-xl">🎓</span>
          </div>
          <h3 className="font-semibold mb-2">Por Especialidad</h3>
          <p className="text-sm text-gray-600 mb-4">Distribución por carrera</p>
          <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-sm">
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}