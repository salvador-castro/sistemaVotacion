// pages/api/voters/search.js
import { getDatabase } from '../../../lib/db';

export default function handler(req, res) {
  const { dni } = req.query;
  
  if (!dni) {
    return res.status(400).json({ error: 'DNI requerido' });
  }

  const db = getDatabase();
  const voter = db.prepare('SELECT * FROM voters WHERE dni = ? AND enabled = 1').get(dni);

  if (!voter) {
    return res.status(404).json({ error: 'Votante no encontrado o inhabilitado' });
  }

  res.status(200).json({ success: true, voter });
}