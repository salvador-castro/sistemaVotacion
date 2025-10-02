// lib/excelParser.js
import XLSX from 'xlsx';

export function parseExcel(buffer) {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
    
    if (jsonData.length === 0) {
      throw new Error('El archivo Excel está vacío');
    }

    // Verificar columnas requeridas
    const firstRow = jsonData[0];
    const requiredColumns = ['dni', 'nombre', 'apellido', 'especialidad'];
    const missingColumns = requiredColumns.filter(col => !firstRow.hasOwnProperty(col));
    
    if (missingColumns.length > 0) {
      throw new Error(`Faltan columnas requeridas: ${missingColumns.join(', ')}`);
    }

    return jsonData.map((row, index) => ({
      id: Date.now() + index,
      dni: String(row.dni),
      nombre: String(row.nombre),
      apellido: String(row.apellido),
      especialidad: String(row.especialidad),
      enabled: 1,
      voted: 0
    }));

  } catch (error) {
    throw new Error(`Error al procesar el archivo Excel: ${error.message}`);
  }
}