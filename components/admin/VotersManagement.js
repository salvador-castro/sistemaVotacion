// components/admin/VotersManagement.js
export default function VotersManagement({ voters, onToggleStatus, onClearVoters }) {
  const enabledVoters = voters.filter(v => v.enabled).length;
  const disabledVoters = voters.filter(v => !v.enabled).length;

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gestión de Votantes</h2>
            <p className="text-gray-600 mt-1">Administre el padrón electoral ({voters.length} registros)</p>
          </div>
          <div className="flex space-x-2">
            <div className="text-sm">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                {enabledVoters} habilitados
              </span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded mr-4">
                {disabledVoters} inhabilitados
              </span>
            </div>
            {voters.length > 0 && (
              <button
                onClick={onClearVoters}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
              >
                Borrar votantes
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votó</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {voters.map((voter) => (
              <tr key={voter.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  {voter.dni}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {capitalize(voter.nombre)} {capitalize(voter.apellido)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {voter.especialidad}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    voter.enabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {voter.enabled ? '✅ Habilitado' : '❌ Inhabilitado'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    voter.voted 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {voter.voted ? '✅ Ya votó' : '⏳ Pendiente'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onToggleStatus(voter.id)}
                    className={`px-4 py-2 rounded text-sm font-semibold ${
                      voter.enabled 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {voter.enabled ? 'Inhabilitar' : 'Habilitar'}
                  </button>
                </td>
              </tr>
            ))}
            {voters.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No hay votantes cargados. Use la opción "Importar Padrón" para agregar votantes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}