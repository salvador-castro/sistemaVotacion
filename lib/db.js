// lib/db.js
const { getPool, testConnection } = require('./mysql');

// Función para obtener todos los votantes con información de votos
async function getVoters() {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT 
        v.*,
        l.name as sede_voto,  -- Sede donde votó (si votó)
        CASE 
          WHEN votes.id IS NOT NULL THEN TRUE 
          ELSE FALSE 
        END as voted,
        votes.voted_at,
        vt.table_name as mesa_voto  -- Mesa donde votó
      FROM voters v
      LEFT JOIN votes ON v.id = votes.voter_id AND votes.status = 'valid'
      LEFT JOIN voting_tables vt ON votes.table_id = vt.id
      LEFT JOIN locations l ON vt.location_id = l.id
      WHERE v.enabled = TRUE
      ORDER BY v.apellido, v.nombre
    `);
    return rows;
  } catch (error) {
    console.error('Error obteniendo votantes:', error);
    return [];
  }
}

// En lib/db.js - funciones para gestionar votantes
async function deleteAllVoters() {
  try {
    const pool = getPool();
    
    // Deshabilitar foreign keys temporalmente para poder borrar en cascada
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Borrar votos primero (por las foreign keys)
    await pool.execute('DELETE FROM votes');
    
    // Borrar todos los votantes
    const [result] = await pool.execute('DELETE FROM voters');
    
    // Reactivar foreign keys
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log(`🗑️ ${result.affectedRows} votantes eliminados de la base de datos`);
    return { success: true, deleted: result.affectedRows };
  } catch (error) {
    console.error('Error eliminando votantes:', error);
    // Asegurarse de reactivar foreign keys incluso si hay error
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
    throw error;
  }
}

async function toggleVoterStatus(voterId) {
  try {
    const pool = getPool();
    
    // Primero obtener el estado actual
    const [voter] = await pool.execute(
      'SELECT enabled FROM voters WHERE id = ?',
      [voterId]
    );
    
    if (voter.length === 0) {
      throw new Error('Votante no encontrado');
    }
    
    const newStatus = !voter[0].enabled;
    
    // Actualizar el estado
    const [result] = await pool.execute(
      'UPDATE voters SET enabled = ? WHERE id = ?',
      [newStatus, voterId]
    );
    
    return { 
      success: true, 
      enabled: newStatus,
      affectedRows: result.affectedRows 
    };
  } catch (error) {
    console.error('Error cambiando estado del votante:', error);
    throw error;
  }
}

async function getVoterCount() {
  try {
    const pool = getPool();
    const [[{ count }]] = await pool.execute(
      'SELECT COUNT(*) as count FROM voters'
    );
    return count;
  } catch (error) {
    console.error('Error obteniendo conteo de votantes:', error);
    return 0;
  }
}

// En lib/db.js - función para registrar un voto
async function registerVote(voterId, tableId, sessionId) {
  try {
    const pool = getPool();
    
    // Verificar que el votante no haya votado ya
    const [existingVotes] = await pool.execute(
      'SELECT id FROM votes WHERE voter_id = ? AND status = "valid"',
      [voterId]
    );
    
    if (existingVotes.length > 0) {
      throw new Error('El votante ya ha emitido su voto');
    }
    
    // Registrar el voto
    const [result] = await pool.execute(
      `INSERT INTO votes (voter_id, table_id, session_id, voted_at, status) 
       VALUES (?, ?, ?, NOW(), 'valid')`,
      [voterId, tableId, sessionId]
    );
    
    return { success: true, voteId: result.insertId };
  } catch (error) {
    console.error('Error registrando voto:', error);
    throw error;
  }
}

// Función para obtener estadísticas completas
async function getVotingStatistics() {
  try {
    const pool = getPool();
    
    const [[{ totalVoters }]] = await pool.execute(
      'SELECT COUNT(*) as totalVoters FROM voters WHERE enabled = TRUE'
    );
    
    const [[{ votedVoters }]] = await pool.execute(
      'SELECT COUNT(DISTINCT voter_id) as votedVoters FROM votes WHERE status = "valid"'
    );
    
    // Estadísticas por sede basadas en dónde votaron, no dónde están registrados
    const [byLocation] = await pool.execute(`
      SELECT 
        l.name as sede,
        COUNT(DISTINCT v.id) as total_registrados,
        COUNT(DISTINCT votes.voter_id) as total_votados
      FROM locations l
      LEFT JOIN voting_tables vt ON l.id = vt.location_id
      LEFT JOIN votes ON vt.id = votes.table_id AND votes.status = 'valid'
      LEFT JOIN voters v ON votes.voter_id = v.id
      GROUP BY l.id, l.name
      ORDER BY l.name
    `);
    
    const [bySpecialty] = await pool.execute(`
      SELECT 
        especialidad,
        COUNT(*) as total_registrados,
        COUNT(DISTINCT votes.voter_id) as total_votados
      FROM voters v
      LEFT JOIN votes ON v.id = votes.voter_id AND votes.status = 'valid'
      WHERE v.enabled = TRUE
      GROUP BY especialidad
      ORDER BY especialidad
    `);
    
    const [byTime] = await pool.execute(`
      SELECT 
        CASE 
          WHEN HOUR(voted_at) BETWEEN 6 AND 11 THEN 'Mañana (6:00-12:00)'
          WHEN HOUR(voted_at) BETWEEN 12 AND 17 THEN 'Tarde (12:00-18:00)'
          WHEN HOUR(voted_at) BETWEEN 18 AND 23 THEN 'Noche (18:00-24:00)'
          ELSE 'Madrugada (0:00-6:00)'
        END as franja_horaria,
        COUNT(*) as votos_emitidos
      FROM votes 
      WHERE status = 'valid' AND voted_at IS NOT NULL
      GROUP BY franja_horaria
      ORDER BY MIN(HOUR(voted_at))
    `);
    
    const [[{ presidentChanges }]] = await pool.execute(
      'SELECT COUNT(*) as presidentChanges FROM president_changes'
    );

    return {
      totalVoters,
      votedVoters,
      participation: totalVoters > 0 ? Math.round((votedVoters / totalVoters) * 100) : 0,
      byLocation,
      bySpecialty,
      byTime,
      presidentChanges
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return {
      totalVoters: 0,
      votedVoters: 0,
      participation: 0,
      byLocation: [],
      bySpecialty: [],
      byTime: [],
      presidentChanges: 0
    };
  }
}

// Funciones para reportes específicos
async function getGeneralReport() {
  return await getVotingStatistics();
}

async function getReportBySede() {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT 
        l.name as sede,
        -- Total de votantes que pueden votar en esta sede (sin filtro de location_id)
        (SELECT COUNT(*) FROM voters WHERE enabled = TRUE) as registrados,
        -- Votantes que votaron en esta sede
        COUNT(DISTINCT votes.voter_id) as votados,
        -- Pendientes = total registrados - total que votaron en todas las sedes
        (SELECT COUNT(*) FROM voters WHERE enabled = TRUE) - 
        (SELECT COUNT(DISTINCT voter_id) FROM votes WHERE status = 'valid') as pendientes,
        CASE 
          WHEN (SELECT COUNT(*) FROM voters WHERE enabled = TRUE) > 0 THEN 
            ROUND((COUNT(DISTINCT votes.voter_id) / (SELECT COUNT(*) FROM voters WHERE enabled = TRUE)) * 100, 2)
          ELSE 0 
        END as participacion
      FROM locations l
      LEFT JOIN voting_tables vt ON l.id = vt.location_id
      LEFT JOIN votes ON vt.id = votes.table_id AND votes.status = 'valid'
      GROUP BY l.id, l.name
      ORDER BY l.name
    `);
    return rows;
  } catch (error) {
    console.error('Error en reporte por sede:', error);
    return [];
  }
}

async function getReportByHorario() {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT 
        CASE 
          WHEN HOUR(voted_at) BETWEEN 6 AND 11 THEN 'Mañana (6:00-12:00)'
          WHEN HOUR(voted_at) BETWEEN 12 AND 17 THEN 'Tarde (12:00-18:00)'
          WHEN HOUR(voted_at) BETWEEN 18 AND 23 THEN 'Noche (18:00-24:00)'
          ELSE 'Madrugada (0:00-6:00)'
        END as franja_horaria,
        COUNT(*) as votos_emitidos
      FROM votes 
      WHERE status = 'valid' AND voted_at IS NOT NULL
      GROUP BY franja_horaria
      ORDER BY MIN(HOUR(voted_at))
    `);
    return rows;
  } catch (error) {
    console.error('Error en reporte por horario:', error);
    return [];
  }
}

async function getReportByEspecialidad() {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT 
        especialidad,
        COUNT(*) as registrados,
        COUNT(DISTINCT votes.voter_id) as votados,
        COUNT(*) - COUNT(DISTINCT votes.voter_id) as pendientes,
        CASE 
          WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(DISTINCT votes.voter_id) / COUNT(*)) * 100, 2)
          ELSE 0 
        END as participacion
      FROM voters v
      LEFT JOIN votes ON v.id = votes.voter_id AND votes.status = 'valid'
      WHERE v.enabled = TRUE
      GROUP BY especialidad
      ORDER BY participacion DESC
    `);
    return rows;
  } catch (error) {
    console.error('Error en reporte por especialidad:', error);
    return [];
  }
}

async function getReportCambiosPresidente() {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT 
        pc.*,
        old_p.nombre as old_president_nombre,
        old_p.apellido as old_president_apellido,
        new_p.nombre as new_president_nombre,
        new_p.apellido as new_president_apellido,
        vt.table_name,
        vt.table_number,
        l.name as sede
      FROM president_changes pc
      JOIN system_users old_p ON pc.old_president_dni = old_p.dni
      JOIN system_users new_p ON pc.new_president_dni = new_p.dni
      JOIN voting_sessions vs ON pc.session_id = vs.id
      JOIN voting_tables vt ON vs.table_id = vt.id
      JOIN locations l ON vt.location_id = l.id
      ORDER BY pc.changed_at DESC
    `);
    return rows;
  } catch (error) {
    console.error('Error en reporte cambios presidente:', error);
    return [];
  }
}

async function getSystemConfig() {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM system_config');
    
    // Convertir array a objeto
    const config = {};
    rows.forEach(row => {
      config[row.config_key] = {
        value: row.config_value,
        description: row.description
      };
    });
    
    return config;
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    return {};
  }
}

async function updateSystemConfig(configKey, configValue) {
  try {
    const pool = getPool();
    
    const [result] = await pool.execute(
      `INSERT INTO system_config (config_key, config_value) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE config_value = ?, updated_at = CURRENT_TIMESTAMP`,
      [configKey, configValue, configValue]
    );
    
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    throw error;
  }
}

async function isVotingPeriodActive() {
  try {
    const pool = getPool();
    
    // Obtener configuración
    const [configRows] = await pool.execute('SELECT config_key, config_value FROM system_config');
    const config = {};
    configRows.forEach(row => {
      config[row.config_key] = row.config_value;
    });
    
    // Verificar estado del sistema
    if (config.system_status !== 'active') {
      return { active: false, reason: 'El sistema está desactivado' };
    }
    
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    // Verificar fechas
    if (config.voting_start_date && config.voting_end_date) {
      if (currentDate < config.voting_start_date) {
        return { active: false, reason: 'La votación aún no ha comenzado' };
      }
      if (currentDate > config.voting_end_date) {
        return { active: false, reason: 'La votación ya ha finalizado' };
      }
    }
    
    // Verificar horario
    if (config.voting_schedule_start && config.voting_schedule_end) {
      if (currentTime < config.voting_schedule_start) {
        return { active: false, reason: 'Fuera del horario de votación' };
      }
      if (currentTime > config.voting_schedule_end) {
        return { active: false, reason: 'Fuera del horario de votación' };
      }
    }
    
    // Verificar días permitidos
    if (config.allowed_voting_days) {
      const currentDay = now.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
      const allowedDays = config.allowed_voting_days.split(',').map(day => parseInt(day));
      
      // Convertir a formato JavaScript (0=Domingo, 1=Lunes, etc.)
      const jsDay = currentDay === 0 ? 7 : currentDay; // Domingo=7 en la configuración
      
      if (!allowedDays.includes(jsDay)) {
        return { active: false, reason: 'Hoy no es día de votación' };
      }
    }
    
    return { active: true };
  } catch (error) {
    console.error('Error verificando período de votación:', error);
    return { active: false, reason: 'Error del sistema' };
  }
}

async function resetSystemConfig() {
  try {
    const pool = getPool();
    
    console.log('🔄 Restableciendo configuración a valores por defecto');
    
    // Restablecer a valores por defecto (con fechas de ejemplo)
    const defaultConfig = {
      'system_status': 'active',
      'voting_period': '2024',
      'voting_start_date': '2024-10-10',  // Nueva
      'voting_end_date': '2024-10-17',    // Nueva
      'voting_schedule_start': '08:00',
      'voting_schedule_end': '18:00',
      'allowed_voting_days': '1,2,3,4,5',
      'max_votes_per_table': '200'
    };
    
    for (const [key, value] of Object.entries(defaultConfig)) {
      await updateSystemConfig(key, value);
    }
    
    return { success: true, message: 'Configuración restablecida a valores por defecto' };
  } catch (error) {
    console.error('❌ Error restableciendo configuración:', error);
    throw error;
  }
}

// Función para importar datos del Excel
async function importVotersFromExcel(votersData) {
  try {
    const pool = getPool();
    
    let imported = 0;
    let errors = 0;
    let duplicates = 0;

    // Procesar en lotes para mejor performance
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < votersData.length; i += batchSize) {
      batches.push(votersData.slice(i, i + batchSize));
    }

    console.log(`🔄 Procesando ${batches.length} lotes de ${batchSize} registros...`);

    for (const [batchIndex, batch] of batches.entries()) {
      console.log(`📦 Procesando lote ${batchIndex + 1}/${batches.length}...`);
      
      for (const voter of batch) {
        try {
          // IMPORTANTE: No asignar location_id durante la importación
          // La sede se asignará cuando el votante vote en una mesa específica
          const locationId = null; // Dejar como null durante la importación

          // Intentar insertar
          const [result] = await pool.execute(
            `INSERT INTO voters (dni, nombre, apellido, especialidad, location_id, enabled) 
             VALUES (?, ?, ?, ?, ?, TRUE)`,
            [voter.dni, voter.nombre, voter.apellido, voter.especialidad, locationId]
          );
          
          if (result.affectedRows > 0) {
            imported++;
          }

        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            // DNI duplicado - actualizar en lugar de insertar
            try {
              const [updateResult] = await pool.execute(
                `UPDATE voters 
                 SET nombre = ?, apellido = ?, especialidad = ?
                 WHERE dni = ?`,
                [voter.nombre, voter.apellido, voter.especialidad, voter.dni]
              );
              
              if (updateResult.affectedRows > 0) {
                duplicates++;
              }
            } catch (updateError) {
              console.error(`Error actualizando votante ${voter.dni}:`, updateError.message);
              errors++;
            }
          } else {
            console.error(`Error procesando votante ${voter.dni}:`, error.message);
            errors++;
          }
        }
      }
    }

    console.log(`✅ Importación completada: ${imported} nuevos, ${duplicates} actualizados, ${errors} errores`);

    return { 
      imported, 
      errors, 
      duplicates,
      total: imported + duplicates
    };
  } catch (error) {
    console.error('Error en importación:', error);
    throw error;
  }
}

module.exports = {
  getPool,
  testConnection,
  getVoters,
  getVotingStatistics,
  getGeneralReport,
  getReportBySede,
  getReportByHorario,
  getReportByEspecialidad,
  getReportCambiosPresidente,
  importVotersFromExcel,
  deleteAllVoters,
  toggleVoterStatus,
  getVoterCount,
  registerVote,
  getSystemConfig,
  updateSystemConfig,
  resetSystemConfig,
  isVotingPeriodActive
};