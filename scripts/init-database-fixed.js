require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function initializeDatabase() {
    let connection;

    try {
        console.log('🔗 Conectando a MySQL server...');

        // Conectar sin especificar base de datos primero
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            multipleStatements: true  // Permitir múltiples statements
        });

        console.log('✅ Conectado a MySQL server');

        // Crear base de datos si no existe
        const dbName = process.env.MYSQL_DATABASE || 'voting_system';
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log('✅ Base de datos creada/verificada');

        // Cerrar conexión inicial
        await connection.end();

        // Reconectar a la base de datos específica
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: dbName,
            multipleStatements: true
        });

        console.log('📁 Conectado a la base de datos específica');

        // Crear tablas
        await createTables(connection);

        // Inicializar datos por defecto
        await initializeDefaultData(connection);

        console.log('🎉 Base de datos inicializada correctamente');

    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

async function createTables(connection) {
    console.log('🗃️ Creando tablas...');

    const tablesSQL = `
    -- Tabla de ubicaciones/sedes
    CREATE TABLE IF NOT EXISTS locations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabla de votantes (datos del Excel)
    CREATE TABLE IF NOT EXISTS voters (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dni VARCHAR(20) UNIQUE NOT NULL,
      nombre VARCHAR(100) NOT NULL,
      apellido VARCHAR(100) NOT NULL,
      especialidad VARCHAR(100) NOT NULL,
      enabled BOOLEAN DEFAULT TRUE,
      location_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id)
    );

    -- Tabla de usuarios del sistema
    CREATE TABLE IF NOT EXISTS system_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dni VARCHAR(20) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('super_admin', 'president', 'admin') NOT NULL,
      nombre VARCHAR(100) NOT NULL,
      apellido VARCHAR(100) NOT NULL,
      location_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id)
    );

    -- Tabla de mesas de votación
    CREATE TABLE IF NOT EXISTS voting_tables (
      id INT AUTO_INCREMENT PRIMARY KEY,
      table_number VARCHAR(10) UNIQUE NOT NULL,
      table_name VARCHAR(100) NOT NULL,
      location_id INT NOT NULL,
      president_dni VARCHAR(20) NOT NULL,
      access_code VARCHAR(10) UNIQUE NOT NULL,
      status ENUM('active', 'inactive', 'closed') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id),
      FOREIGN KEY (president_dni) REFERENCES system_users(dni)
    );

    -- Tabla de sesiones de votación
    CREATE TABLE IF NOT EXISTS voting_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      table_id INT NOT NULL,
      session_date DATE NOT NULL,
      opened_at TIMESTAMP NULL,
      closed_at TIMESTAMP NULL,
      initial_president_dni VARCHAR(20) NOT NULL,
      current_president_dni VARCHAR(20),
      final_vote_count INT DEFAULT 0,
      status ENUM('open', 'closed', 'paused') DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (table_id) REFERENCES voting_tables(id),
      FOREIGN KEY (initial_president_dni) REFERENCES system_users(dni),
      FOREIGN KEY (current_president_dni) REFERENCES system_users(dni)
    );

    -- Tabla de votos
    CREATE TABLE IF NOT EXISTS votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      voter_id INT NOT NULL,
      table_id INT NOT NULL,
      session_id INT NOT NULL,
      voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('valid', 'annulled') DEFAULT 'valid',
      annulment_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (voter_id) REFERENCES voters(id),
      FOREIGN KEY (table_id) REFERENCES voting_tables(id),
      FOREIGN KEY (session_id) REFERENCES voting_sessions(id)
    );

    -- Tabla de cambios de presidente
    CREATE TABLE IF NOT EXISTS president_changes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id INT NOT NULL,
      old_president_dni VARCHAR(20) NOT NULL,
      new_president_dni VARCHAR(20) NOT NULL,
      change_reason TEXT NOT NULL,
      changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      changed_by VARCHAR(20) NOT NULL,
      FOREIGN KEY (session_id) REFERENCES voting_sessions(id),
      FOREIGN KEY (old_president_dni) REFERENCES system_users(dni),
      FOREIGN KEY (new_president_dni) REFERENCES system_users(dni)
    );

    -- Tabla de configuración del sistema
    CREATE TABLE IF NOT EXISTS system_config (
      id INT AUTO_INCREMENT PRIMARY KEY,
      config_key VARCHAR(50) UNIQUE NOT NULL,
      config_value TEXT NOT NULL,
      description TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

    await connection.query(tablesSQL);
    console.log('✅ Todas las tablas creadas correctamente');
}

async function initializeDefaultData(connection) {
    console.log('📝 Inicializando datos por defecto...');
    const bcrypt = require('bcryptjs');

    // Insertar ubicaciones por defecto
    await connection.execute(`
    INSERT IGNORE INTO locations (name, description) VALUES 
    ('Medrano', 'Sede Medrano'),
    ('Campus', 'Sede Campus')
  `);

    // Crear usuarios por defecto
    const superadminPassword = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD || 'prueba123', 10);
    const presidentPassword = await bcrypt.hash(process.env.PRESIDENT_PASSWORD || 'prueba123', 10);

    await connection.execute(`
    INSERT IGNORE INTO system_users (dni, password_hash, role, nombre, apellido) VALUES 
    (?, ?, 'super_admin', 'Super', 'Administrador')
  `, [process.env.SUPERADMIN_DNI || 'superadmin', superadminPassword]);

    await connection.execute(`
    INSERT IGNORE INTO system_users (dni, password_hash, role, nombre, apellido) VALUES 
    (?, ?, 'president', 'Presidente', 'Inicial')
  `, [process.env.PRESIDENT_DNI || 'presidente', presidentPassword]);

    // Configuración por defecto del sistema
    await connection.execute(`
    INSERT IGNORE INTO system_config (config_key, config_value, description) VALUES 
    ('system_status', 'active', 'Estado del sistema de votación'),
    ('voting_period', '2024', 'Período de votación actual'),
    ('voting_schedule_start', '08:00', 'Horario de inicio de votación'),
    ('voting_schedule_end', '18:00', 'Horario de fin de votación'),
    ('allowed_voting_days', '1,2,3,4,5', 'Días de semana permitidos (1=Lunes,...,7=Domingo)'),
    ('max_votes_per_table', '200', 'Máximo de votos por mesa')
  `);

    console.log('✅ Datos por defecto inicializados');
}

// Ejecutar si se llama directamente
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase };