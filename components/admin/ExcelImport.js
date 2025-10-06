// components/admin/ExcelImport.js
import { useState } from 'react';

export default function ExcelImport() {
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Verificar que sea un archivo Excel
        if (!file.name.match(/\.(xlsx|xls)$/)) {
            alert('Por favor, sube un archivo Excel (.xlsx o .xls)');
            return;
        }

        setImporting(true);
        setResult(null);

        const formData = new FormData();
        formData.append('excelFile', file);

        try {
            const response = await fetch('/api/import/excel', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setResult({
                    success: true,
                    imported: data.imported,
                    errors: data.errors,
                    duplicates: data.duplicates,
                    message: data.message
                });
                alert(`✅ Importación exitosa!\nImportados: ${data.imported}\nErrores: ${data.errors}\nDuplicados: ${data.duplicates}`);
            } else {
                setResult({
                    success: false,
                    message: data.error || 'Error en la importación'
                });
                alert(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error en importación:', error);
            setResult({
                success: false,
                message: 'Error de conexión'
            });
            alert('❌ Error de conexión durante la importación');
        } finally {
            setImporting(false);
            // Limpiar input file
            event.target.value = '';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Importar Datos desde Excel</h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="mb-4">
                    <span className="text-4xl">📊</span>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    Sube tu archivo Excel con los datos de los votantes
                </p>

                <div className="mb-4">
                    <label className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer">
                        {importing ? 'Importando...' : 'Seleccionar Archivo Excel'}
                        <input
                            type="file"
                            className="hidden"
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                            disabled={importing}
                        />
                    </label>
                </div>

                <p className="text-xs text-gray-500">
                    Formatos soportados: .xlsx, .xls
                </p>

                {/* Información sobre el formato esperado */}
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-left">
                    <h3 className="font-semibold text-yellow-800 mb-2">Formato esperado del Excel:</h3>
                    <ul className="text-xs text-yellow-700 list-disc list-inside space-y-1">
                        <li><strong>Columna A:</strong> DNI (obligatorio)</li>
                        <li><strong>Columna B:</strong> Nombre (obligatorio)</li>
                        <li><strong>Columna C:</strong> Apellido (obligatorio)</li>
                        <li><strong>Columna D:</strong> Especialidad (obligatorio)</li>
                        <li><strong>Columna E:</strong> Sede (opcional: "Medrano" o "Campus")</li>
                    </ul>
                    <p className="text-xs text-yellow-600 mt-2">
                        La primera fila debe contener los encabezados de columna
                    </p>
                </div>
            </div>

            {result && (
                <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                    <p className="font-semibold">
                        {result.success ? '✅ Importación Exitosa' : '❌ Error en Importación'}
                    </p>
                    {result.message && <p className="text-sm mt-1">{result.message}</p>}
                    {result.imported !== undefined && (
                        <div className="text-sm mt-2 space-y-1">
                            <p>✅ Votantes importados: <strong>{result.imported}</strong></p>
                            {result.duplicates > 0 && (
                                <p>⚠️ DNIs duplicados: <strong>{result.duplicates}</strong></p>
                            )}
                            {result.errors > 0 && (
                                <p>❌ Errores: <strong>{result.errors}</strong></p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}