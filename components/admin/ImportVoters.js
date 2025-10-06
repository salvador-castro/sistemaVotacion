// components/admin/ImportVoters.js
import { useState } from 'react';

export default function ImportVoters({ onFileUpload, votersCount }) {
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Verificar que sea un archivo Excel
        if (!file.name.match(/\.(xlsx|xls)$/)) {
            alert('❌ Error: Por favor seleccione un archivo Excel válido (.xlsx o .xls)');
            event.target.value = '';
            return;
        }

        setLoading(true);

        try {
            const result = await onFileUpload(file);
            if (result.success) {
                alert(`✅ Archivo Excel procesado correctamente\nSe importaron ${result.count} votantes al sistema`);
            } else {
                alert(`❌ Error: ${result.error}`);
            }
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
            event.target.value = '';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Importar Padrón Electoral</h2>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">📋 Formato requerido:</h3>
                <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                    <li>Archivo Excel (.xlsx, .xls)</li>
                    <li><strong>Columnas requeridas:</strong> dni, nombre, apellido, especialidad</li>
                    <li>La primera fila debe contener los encabezados</li>
                    <li>Máximo 10,000 registros por archivo</li>
                </ul>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                    type="file"
                    id="excel-file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="hidden"
                />
                <label
                    htmlFor="excel-file"
                    className={`cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando...
                        </>
                    ) : (
                        'Seleccionar Archivo Excel'
                    )}
                </label>
                <p className="text-sm text-gray-500 mt-2">
                    {loading ? 'Importando votantes al sistema...' : 'Haga click para seleccionar el archivo Excel con el padrón'}
                </p>
            </div>

            {votersCount > 0 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                        <span className="text-green-600 text-lg mr-2">✅</span>
                        <div>
                            <p className="text-green-800 font-semibold">Padrón cargado correctamente</p>
                            <p className="text-green-700 text-sm">Total de votantes en el sistema: {votersCount}</p>
                            <p className="text-green-700 text-sm">Todos los votantes están pendientes de votación</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}