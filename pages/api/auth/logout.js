// pages/api/auth/logout.js
export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    res.setHeader('Set-Cookie', 'token=; Path=/; HttpOnly; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    res.status(200).json({ success: true, message: 'Sesión cerrada' });
}