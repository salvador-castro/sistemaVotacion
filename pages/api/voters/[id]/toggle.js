// pages/api/voters/[id]/toggle.js
import { toggleVoterStatus } from '../../../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID de votante requerido' });
    }

    try {
        const result = await toggleVoterStatus(parseInt(id));
        res.status(200).json(result);
    } catch (error) {
        console.error('Error cambiando estado del votante:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}