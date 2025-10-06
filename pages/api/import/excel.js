import multer from 'multer';
import xlsx from 'xlsx';
import { importVotersFromExcel } from '../../../lib/db';

// Configuración de multer para subida de archivos
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel'), false);
    }
  },
});

// Deshabilitar el parser de body predeterminado de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Middleware de multer
  upload.single('excelFile')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    try {
      // Leer el archivo Excel
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convertir a JSON
      const jsonData = xlsx.utils.sheet_to_json(worksheet, {
        header: ['dni', 'nombre', 'apellido', 'especialidad', 'sede'],
        range: 1, // Saltar la primera fila (encabezados)
      });

      console.log(`📊 Procesando ${jsonData.length} registros del Excel...`);

      // Filtrar filas vacías y validar datos
      const validData = jsonData.filter(row => {
        return row.dni && row.nombre && row.apellido && row.especialidad;
      }).map(row => ({
        dni: String(row.dni).trim(),
        nombre: String(row.nombre).trim(),
        apellido: String(row.apellido).trim(),
        especialidad: String(row.especialidad).trim(),
        sede: row.sede ? String(row.sede).trim() : null
      }));

      console.log(`✅ ${validData.length} registros válidos encontrados`);

      if (validData.length === 0) {
        return res.status(400).json({ error: 'No se encontraron datos válidos en el archivo' });
      }

      // Importar a la base de datos
      const result = await importVotersFromExcel(validData);

      res.status(200).json({
        success: true,
        imported: result.imported,
        errors: result.errors,
        duplicates: result.duplicates,
        message: `Importación completada: ${result.imported} votantes importados, ${result.errors} errores, ${result.duplicates} duplicados`
      });

    } catch (error) {
      console.error('Error procesando Excel:', error);
      res.status(500).json({ 
        error: `Error procesando el archivo: ${error.message}` 
      });
    }
  });
}

export default handler;