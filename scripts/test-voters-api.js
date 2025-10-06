require('dotenv').config({ path: '.env.local' });

async function testVotersAPI() {
  const baseURL = 'http://localhost:3002/api'; // ← Cambiado a puerto 3002

  try {
    console.log('🧪 Probando APIs de votantes...\n');
    console.log(`🔗 URL base: ${baseURL}\n`);

    // 1. Test GET /api/voters
    console.log('1. Probando GET /api/voters...');
    try {
      const getResponse = await fetch(`${baseURL}/voters`);
      console.log(`   📨 Status: ${getResponse.status} ${getResponse.statusText}`);
      
      const contentType = getResponse.headers.get('content-type');
      console.log(`   📄 Content-Type: ${contentType}`);
      
      if (contentType && contentType.includes('application/json')) {
        const voters = await getResponse.json();
        console.log(`   ✅ Votantes obtenidos: ${voters.length}`);
        console.log(`   📊 Primer votante:`, voters[0] ? `${voters[0].nombre} ${voters[0].apellido}` : 'N/A');
        
        if (voters.length > 0) {
          // 2. Test DELETE /api/voters
          console.log('\n2. Probando DELETE /api/voters...');
          const deleteResponse = await fetch(`${baseURL}/voters`, {
            method: 'DELETE'
          });
          console.log(`   📨 Status: ${deleteResponse.status} ${deleteResponse.statusText}`);
          
          if (deleteResponse.ok) {
            const deleteResult = await deleteResponse.json();
            console.log(`   ✅ DELETE exitoso:`, deleteResult);
          } else {
            const errorText = await deleteResponse.text();
            console.log(`   ❌ Error en DELETE: ${errorText}`);
          }
        } else {
          console.log('\n⚠️ No hay votantes para probar DELETE');
        }
      } else {
        const html = await getResponse.text();
        console.log(`   ❌ Se recibió HTML en lugar de JSON`);
      }
    } catch (error) {
      console.log(`   ❌ Error en GET: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testVotersAPI();