// pages/api/reports/[type].js
import { getGeneralReport, getReportBySede, getReportByHorario, getReportByEspecialidad, getReportCambiosPresidente } from '../../../../lib/db';

export default async function handler(req, res) {
    const { type } = req.query;

    // Solo permitir método GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        let data;

        switch (type) {
            case 'general':
                data = await getGeneralReport();
                break;
            case 'sede':
                data = await getReportBySede();
                break;
            case 'horario':
                data = await getReportByHorario();
                break;
            case 'especialidad':
                data = await getReportByEspecialidad();
                break;
            case 'cambios-presidente':
                data = await getReportCambiosPresidente();
                break;
            default:
                return res.status(400).json({ error: 'Tipo de reporte no válido' });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error en API reportes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}