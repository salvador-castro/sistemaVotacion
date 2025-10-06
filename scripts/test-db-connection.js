require('dotenv').config({ path: '.env.local' });
const { getSystemConfig, getPool } = require('../lib/db');

async function testDBConnection() {
  try {
    console.log('🔍 Probando conexión a la base de datos...\n');

    const pool = getPool();
    
    // Test 1: Conexión básica
    console.log('1. Probando conexión básica...');
    const [version] = await pool.execute('SELECT version() as version');
    console.log(`   ✅ MySQL version: ${version[0].version}`);

    // Test 2: Verificar tabla system_config
    console.log('\n2. Verificando tabla system_config...');
    const [tables] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'system_config'
    `, [process.env.MYSQL_DATABASE || 'voting_system']);

    if (tables.length === 0) {
      console.log('   ❌ La tabla system_config NO existe');
      return;
    }
    console.log('   ✅ La tabla system_config existe');

    // Test 3: Verificar datos
    console.log('\n3. Verificando datos en system_config...');
    const [rows] = await pool.execute('SELECT * FROM system_config');
    console.log(`   ✅ Registros encontrados: ${rows.length}`);
    rows.forEach(row => {
      console.log(`      - ${row.config_key}: ${row.config_value}`);
    });

    // Test 4: Probar función getSystemConfig
    console.log('\n4. Probando función getSystemConfig...');
    const config = await getSystemConfig();
    console.log(`   ✅ Configuración obtenida: ${Object.keys(config).length} items`);
    console.log('   📋 Contenido:', config);

  } catch (error) {
    console.error('❌ Error en prueba de BD:', error);
  }
}

testDBConnection();