// lib/middleware.js
import { verifyToken } from './auth';

export function requireAuth(handler, allowedRoles = []) {
    return async (req, res) => {
        try {
            const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const user = verifyToken(token);
            if (!user) {
                return res.status(401).json({ error: 'Token inválido' });
            }

            if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                return res.status(403).json({ error: 'No tiene permisos' });
            }

            // Agregar usuario a la request
            req.user = user;
            return handler(req, res);
        } catch (error) {
            return res.status(500).json({ error: 'Error de autenticación' });
        }
    };
}

export function requireSuperAdmin(handler) {
    return requireAuth(handler, ['super_admin']);
}

export function requirePresident(handler) {
    return requireAuth(handler, ['president']);
}