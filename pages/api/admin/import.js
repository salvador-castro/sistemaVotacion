// pages/api/admin/import.js
import { parseExcel } from '../../../lib/excelParser';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { fileData } = req.body;
    
    if (!fileData) {
      return res.status(400).json({ error: 'No se proporcionaron datos del archivo' });
    }

    const voters = await parseExcel(fileData);
    
    // Aquí conectarías con tu base de datos
    // Por ejemplo: await saveVotersToDatabase(voters);
    
    res.status(200).json({ 
      success: true, 
      count: voters.length,
      voters 
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}