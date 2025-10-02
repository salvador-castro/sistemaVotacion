// pages/api/voting/session.js
import { requirePresident } from '../../../../lib/middleware';
import { getDatabase } from '../../../../lib/db';

async function handler(req, res) {
  const db = getDatabase();
  const user = req.user;

  switch (req.method) {
    case 'POST':
      const { action, mesaName } = req.body;
      
      if (action === 'open') {
        const session = db.prepare(`
          INSERT INTO voting_sessions (mesa_name, date, current_president_dni) 
          VALUES (?, date('now'), ?)
        `).run(mesaName, user.dni);
        
        res.status(200).json({ success: true, sessionId: session.lastInsertRowid });
      }
      break;

    default:
      res.status(405).json({ error: 'Método no permitido' });
  }
}

export default requirePresident(handler);