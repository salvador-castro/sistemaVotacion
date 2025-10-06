// pages/api/config/index.js
import { getSystemConfig, updateSystemConfig, resetSystemConfig } from '../../../lib/db';

export default async function handler(req, res) {
    console.log(`📨 [CONFIG API] Método: ${req.method}`);

    try {
        switch (req.method) {
            case 'GET':
                try {
                    console.log('🔧 Obteniendo configuración del sistema...');
                    const config = await getSystemConfig();
                    console.log(`✅ Configuración obtenida: ${Object.keys(config).length} items`);
                    res.status(200).json(config);
                } catch (error) {
                    console.error('❌ Error obteniendo configuración:', error);
                    res.status(500).json({
                        error: 'Error interno del servidor al obtener configuración',
                        details: error.message
                    });
                }
                break;

            case 'PUT':
                try {
                    const { key, value } = req.body;
                    console.log(`🔧 Actualizando configuración: ${key} = ${value}`);

                    if (!key || value === undefined) {
                        return res.status(400).json({ error: 'Key y value son requeridos' });
                    }

                    const result = await updateSystemConfig(key, value);
                    console.log(`✅ Configuración actualizada:`, result);
                    res.status(200).json(result);
                } catch (error) {
                    console.error('❌ Error actualizando configuración:', error);
                    res.status(500).json({
                        error: 'Error interno del servidor al actualizar configuración',
                        details: error.message
                    });
                }
                break;

            case 'POST':
                try {
                    // POST para resetear configuración
                    if (req.body.action === 'reset') {
                        console.log('🔧 Restableciendo configuración...');
                        const result = await resetSystemConfig();
                        console.log(`✅ Configuración restablecida:`, result);
                        res.status(200).json(result);
                    } else {
                        res.status(400).json({ error: 'Acción no válida' });
                    }
                } catch (error) {
                    console.error('❌ Error restableciendo configuración:', error);
                    res.status(500).json({
                        error: 'Error interno del servidor al restablecer configuración',
                        details: error.message
                    });
                }
                break;

            default:
                res.status(405).json({ error: 'Método no permitido' });
        }
    } catch (error) {
        console.error('❌ Error general en API de configuración:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
}