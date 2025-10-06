// lib/auth.js - VERSIÓN CORREGIDA
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDatabase } = require('./db');

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function generateToken(user) {
  return jwt.sign(
    {
      dni: user.dni,
      role: user.role,
      nombre: user.nombre,
      apellido: user.apellido
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

async function authenticateUser(dni, password) {
  try {
    const db = getDatabase();

    const user = db.prepare(`
      SELECT * FROM system_users WHERE dni = ?
    `).get(dni);

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // CORRECCIÓN: Usar await con bcrypt.compare
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return { success: false, error: 'Contraseña incorrecta' };
    }

    const token = generateToken(user);
    return {
      success: true,
      token,
      user: {
        dni: user.dni,
        role: user.role,
        nombre: user.nombre,
        apellido: user.apellido
      }
    };
  } catch (error) {
    console.error('Error en authenticateUser:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

module.exports = { verifyToken, generateToken, authenticateUser };