require('dotenv').config({ path: '.env.local' });
const { getVotingStatistics } = require('../lib/db');

async function testReportsAPI() {
  try {
    console.log('🧪 Probando API de reportes...\n');
    
    const stats = await getVotingStatistics();
    
    console.log('📊 Estadísticas obtenidas:');
    console.log(`- Total votantes: ${stats.totalVoters}`);
    console.log(`- Votos emitidos: ${stats.votedVoters}`);
    console.log(`- Participación: ${stats.participation}%`);
    console.log(`- Cambios presidente: ${stats.presidentChanges}`);
    
    console.log('\n🏢 Datos por sede:');
    stats.byLocation.forEach(loc => {
      console.log(`- ${loc.sede}: ${loc.total_registrados} registrados, ${loc.total_votados} votados`);
    });
    
    console.log('\n✅ API de reportes funcionando correctamente');
    
  } catch (error) {
    console.error('❌ Error en API de reportes:', error);
  }
}

testReportsAPI();