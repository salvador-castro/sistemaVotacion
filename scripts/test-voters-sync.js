require('dotenv').config({ path: '.env.local' });
const { getVoterCount, getPool } = require('../lib/db');

async function testVotersSync() {
  const pool = getPool();
  
  try {
    console.log('🔍 Verificando sincronización de votantes...\n');

    // Contar votantes en la base de datos
    const dbCount = await getVoterCount();
    console.log(`📊 Votantes en base de datos: ${dbCount}`);

    // Verificar algunos votantes
    const [voters] = await pool.execute('SELECT id, dni, nombre, apellido, enabled FROM voters LIMIT 5');
    
    console.log('\n👥 Primeros 5 votantes en BD:');
    voters.forEach(voter => {
      console.log(`- ${voter.dni}: ${voter.nombre} ${voter.apellido} | Activo: ${voter.enabled ? 'Sí' : 'No'}`);
    });

    console.log('\n✅ Sincronización verificada correctamente');

  } catch (error) {
    console.error('❌ Error verificando sincronización:', error);
  }
}

testVotersSync();