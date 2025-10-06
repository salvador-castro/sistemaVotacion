// pages/api/check-voting-period.js
import { isVotingPeriodActive } from '../../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const votingStatus = await isVotingPeriodActive();
        res.status(200).json(votingStatus);
    } catch (error) {
        console.error('Error verificando período de votación:', error);
        res.status(500).json({
            active: false,
            reason: 'Error del sistema al verificar el período de votación'
        });
    }
}