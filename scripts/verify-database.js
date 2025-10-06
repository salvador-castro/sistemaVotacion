require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function verifyDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'voting_system'
    });

    console.log('🔍 Verificando base de datos...\n');

    // Verificar tablas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📊 Tablas encontradas:');
    tables.forEach(table => {
      console.log(`   ✅ ${table[Object.keys(table)[0]]}`);
    });

    console.log('\n👥 Verificando usuarios del sistema:');
    const [users] = await connection.execute('SELECT dni, role, nombre, apellido FROM system_users');
    users.forEach(user => {
      console.log(`   👤 ${user.dni} - ${user.role}: ${user.nombre} ${user.apellido}`);
    });

    console.log('\n🏢 Verificando ubicaciones:');
    const [locations] = await connection.execute('SELECT name, description FROM locations');
    locations.forEach(location => {
      console.log(`   📍 ${location.name}: ${location.description}`);
    });

    console.log('\n⚙️ Verificando configuración:');
    const [config] = await connection.execute('SELECT config_key, config_value, description FROM system_config');
    config.forEach(item => {
      console.log(`   ⚙️ ${item.config_key}: ${item.config_value} (${item.description})`);
    });

    console.log('\n🎉 ¡Base de datos verificada correctamente!');

  } catch (error) {
    console.error('❌ Error verificando base de datos:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

verifyDatabase();