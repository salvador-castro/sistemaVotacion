require('dotenv').config({ path: '.env.local' });

async function testConfigAPI() {
  const baseURL = 'http://localhost:3002/api';

  try {
    console.log('🧪 Probando API de configuración...\n');

    // 1. Test GET /api/config
    console.log('1. Probando GET /api/config...');
    const getResponse = await fetch(`${baseURL}/config`);
    console.log(`   📨 Status: ${getResponse.status}`);
    
    if (getResponse.ok) {
      const config = await getResponse.json();
      console.log(`   ✅ Configuración obtenida:`, Object.keys(config).length, 'items');
      console.log('   📊 Configuración actual:');
      Object.entries(config).forEach(([key, value]) => {
        console.log(`      - ${key}: ${value.value} (${value.description})`);
      });
    }

    // 2. Test PUT /api/config
    console.log('\n2. Probando PUT /api/config...');
    const putResponse = await fetch(`${baseURL}/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: 'voting_period',
        value: '2024-TEST'
      }),
    });
    console.log(`   📨 Status: ${putResponse.status}`);
    
    if (putResponse.ok) {
      const result = await putResponse.json();
      console.log(`   ✅ Configuración actualizada:`, result);
    }

  } catch (error) {
    console.error('❌ Error probando API:', error);
  }
}

testConfigAPI();