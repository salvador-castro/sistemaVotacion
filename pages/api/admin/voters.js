// pages/api/admin/voters.js
import { requireSuperAdmin } from '../../../../lib/middleware';
import { getDatabase } from '../../../../lib/db';

async function handler(req, res) {
    const db = getDatabase();

    switch (req.method) {
        case 'GET':
            // Obtener todos los votantes
            const voters = db.prepare('SELECT * FROM voters ORDER BY apellido, nombre').all();
            res.status(200).json({ success: true, voters });
            break;

        case 'PUT':
            // Actualizar votante
            const { voterId, enabled } = req.body;
            db.prepare('UPDATE voters SET enabled = ? WHERE id = ?').run(enabled ? 1 : 0, voterId);
            res.status(200).json({ success: true });
            break;

        default:
            res.status(405).json({ error: 'Método no permitido' });
    }
}

export default requireSuperAdmin(handler);