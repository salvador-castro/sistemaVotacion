// pages/api/admin/stats.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Aquí obtendrías las estadísticas reales de la base de datos
    const stats = {
      totalVoters: 0,
      totalVotes: 0,
      enabledVoters: 0,
      participation: 0,
      medranoVotes: 0,
      campusVotes: 0
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}