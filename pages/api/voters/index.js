// pages/api/voters/index.js
import { getVoters, deleteAllVoters } from '../../../lib/db';

export default async function handler(req, res) {
    console.log(`📨 [VOTERS API] Método: ${req.method}`);

    switch (req.method) {
        case 'GET':
            try {
                const voters = await getVoters();
                res.status(200).json(voters);
            } catch (error) {
                console.error('Error obteniendo votantes:', error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
            break;

        case 'DELETE':
            try {
                const result = await deleteAllVoters();
                res.status(200).json(result);
            } catch (error) {
                console.error('Error eliminando votantes:', error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
            break;

        default:
            res.status(405).json({ error: 'Método no permitido' });
    }
}