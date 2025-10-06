// pages/api/auth/login.js
import { authenticateUser } from '../../../lib/auth';

export default async function handler(req, res) {
  console.log('🔐 Login API called');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { dni, password } = req.body;
    console.log('🔐 Intento de login para:', dni);

    if (!dni || !password) {
      return res.status(400).json({ error: 'DNI y contraseña son requeridos' });
    }

    const result = await authenticateUser(dni, password);
    console.log('🔐 Resultado autenticación:', result);

    if (result.success) {
      console.log('✅ Login exitoso, estableciendo cookie...');

      // Configurar cookie
      res.setHeader('Set-Cookie', `token=${result.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800`);

      res.status(200).json({
        success: true,
        user: result.user
      });
    } else {
      console.log('❌ Login fallido:', result.error);
      res.status(401).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('💥 Error en login API:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}