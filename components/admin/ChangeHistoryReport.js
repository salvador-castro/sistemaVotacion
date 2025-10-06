// components/admin/ChangeHistoryReport.js
export default function ChangeHistoryReport() {
    const [changeHistory, setChangeHistory] = useState([]);

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('presidentChangeHistory') || '[]');
        setChangeHistory(history);
    }, []);

    const exportToCSV = () => {
        const headers = ['Fecha', 'Mesa', 'Presidente Anterior', 'DNI Anterior', 'Presidente Nuevo', 'DNI Nuevo', 'Fiscales', 'Realizado Por'];
        const csvData = changeHistory.map(record => [
            record.timestamp,
            record.stationName,
            record.previousPresident || 'N/A',
            record.previousPresidentDNI || 'N/A',
            record.newPresident || 'N/A',
            record.newPresidentDNI,
            record.fiscalesPresentes || 'N/A',
            record.changedBy
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historial-cambios-presidentes-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (changeHistory.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Historial de Cambios de Presidentes</h2>
                <p className="text-gray-500">No hay cambios registrados.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Historial de Cambios de Presidentes</h2>
                    <button
                        onClick={exportToCSV}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                    >
                        Exportar CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mesa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Presidente Anterior</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Presidente Nuevo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiscales</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Realizado Por</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {changeHistory.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.timestamp}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.stationName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {record.previousPresident || 'N/A'} ({record.previousPresidentDNI || 'N/A'})
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {record.newPresident || 'N/A'} ({record.newPresidentDNI})
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{record.fiscalesPresentes || 'No registrados'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.changedBy}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}