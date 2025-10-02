// reset-users.js - CREAR ESTE ARCHIVO EN LA RAIZ
const path = require('path');

// Configurar environment
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

function resetUsers() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    const dbPath = path.join(__dirname, 'voting.db');
    const db = new Database(dbPath);
    
    console.log('🗑️ Eliminando usuarios existentes...');
    
    // Eliminar usuarios existentes
    db.prepare('DELETE FROM system_users').run();
    
    console.log('👥 Creando nuevos usuarios...');
    
    // Crear nuevos usuarios
    const superadminPassword = bcrypt.hashSync('prueba123', 10);
    const presidentPassword = bcrypt.hashSync('prueba123', 10);

    // SuperAdmin
    db.prepare(`
      INSERT INTO system_users (dni, password_hash, role, nombre, apellido) 
      VALUES (?, ?, 'super_admin', 'Super', 'Administrador')
    `).run('superadmin', superadminPassword);

    // Presidente
    db.prepare(`
      INSERT INTO system_users (dni, password_hash, role, nombre, apellido) 
      VALUES (?, ?, 'president', 'Presidente', 'Mesa')
    `).run('presidente', presidentPassword);

    console.log('✅ USUARIOS CREADOS EXITOSAMENTE');
    console.log('');
    console.log('📋 CREDENCIALES NUEVAS:');
    console.log('   👑 SuperAdmin:');
    console.log('      Usuario: superadmin');
    console.log('      Contraseña: prueba123');
    console.log('');
    console.log('   👨‍💼 Presidente:');
    console.log('      Usuario: presidente');
    console.log('      Contraseña: prueba123');
    console.log('');
    
    db.close();
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

resetUsers();