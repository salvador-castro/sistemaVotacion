// lib/db.js - Versión corregida
const path = require('path');

// Solo importar better-sqlite3 en el servidor
let Database;
let db = null;

function getDatabase() {
  // Evitar ejecutar en el cliente
  if (typeof window !== 'undefined') {
    return null;
  }

  if (!Database) {
    Database = require('better-sqlite3');
  }

  if (!db) {
    const dbPath = path.join(process.cwd(), 'voting.db');
    db = new Database(dbPath);
    
    // Habilitar foreign keys
    db.pragma('foreign_keys = ON');
    
    initializeTables(db);
  }
  return db;
}

function initializeTables(db) {
  // Tabla de votantes
  db.exec(`
    CREATE TABLE IF NOT EXISTS voters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dni TEXT UNIQUE NOT NULL,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      especialidad TEXT NOT NULL,
      enabled BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de usuarios del sistema
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dni TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de sesiones de votación
  db.exec(`
    CREATE TABLE IF NOT EXISTS voting_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mesa_name TEXT NOT NULL,
      date TEXT NOT NULL,
      opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME,
      current_president_dni TEXT,
      final_vote_count INTEGER,
      status TEXT DEFAULT 'open'
    )
  `);

  // Tabla de votos
  db.exec(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      voter_id INTEGER NOT NULL,
      location TEXT NOT NULL,
      mesa TEXT NOT NULL,
      voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'voted',
      annulment_reason TEXT,
      session_id INTEGER,
      FOREIGN KEY (voter_id) REFERENCES voters (id)
    )
  `);

  console.log('✅ Tablas de base de datos verificadas');
}

// Solo inicializar usuarios si no existen
function initializeDefaultUsers() {
  if (typeof window !== 'undefined') return;

  const bcrypt = require('bcryptjs');
  const db = getDatabase();
  
  // Verificar si ya existen usuarios
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM system_users').get();
  
  if (existingUsers.count === 0) {
    const superadminPassword = bcrypt.hashSync(process.env.SUPERADMIN_PASSWORD || 'admin123', 10);
    const presidentPassword = bcrypt.hashSync(process.env.PRESIDENT_PASSWORD || 'president123', 10);

    // SuperAdmin
    db.prepare(`
      INSERT INTO system_users (dni, password_hash, role, nombre, apellido) 
      VALUES (?, ?, 'super_admin', 'Super', 'Administrador')
    `).run(process.env.SUPERADMIN_DNI || '40000000', superadminPassword);

    // Presidente
    db.prepare(`
      INSERT INTO system_users (dni, password_hash, role, nombre, apellido) 
      VALUES (?, ?, 'president', 'Presidente', 'Inicial')
    `).run(process.env.PRESIDENT_DNI || '30000000', presidentPassword);

    console.log('✅ Usuarios por defecto creados');
  }
}

// Inicializar usuarios al cargar el módulo
if (typeof window === 'undefined') {
  setTimeout(() => {
    try {
      initializeDefaultUsers();
    } catch (error) {
      console.log('Usuarios ya existen o error:', error.message);
    }
  }, 1000);
}

module.exports = { getDatabase, initializeDefaultUsers };