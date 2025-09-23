const { Pool } = require('pg');

// Create PostgreSQL adapter that mimics MySQL2 interface
class DatabaseAdapter {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  // Mimic mysql2's query method
  query(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    // Convert MySQL syntax to PostgreSQL
    const convertedSql = this.convertMySQLToPostgreSQL(sql);
    
    this.pool.query(convertedSql, params)
      .then(result => {
        // Convert PostgreSQL result format to MySQL-like format
        const mysqlResult = {
          ...result.rows,
          length: result.rows.length,
          affectedRows: result.rowCount,
          insertId: result.rows[0]?.id || result.rows[0]?.["idCandidatos"] || result.rows[0]?.["idEmpresa"] || result.rows[0]?.["idPuestos"] || undefined
        };
        callback(null, result.rows.length > 0 ? result.rows : mysqlResult);
      })
      .catch(err => {
        console.error('Database query error:', err);
        callback(err);
      });
  }

  // Convert MySQL-specific syntax to PostgreSQL
  convertMySQLToPostgreSQL(sql) {
    let converted = sql;
    
    // Handle INSERT ... ON DUPLICATE KEY UPDATE
    if (sql.includes('ON DUPLICATE KEY UPDATE')) {
      // This is more complex - for now, let's handle the expedientes case
      if (sql.includes('expedientes')) {
        converted = `
          INSERT INTO expedientes (candidato_id, "Experiencia")
          VALUES ($1, $2)
          ON CONFLICT (candidato_id) 
          DO UPDATE SET "Experiencia" = EXCLUDED."Experiencia", updated_at = now()
        `;
      }
    }
    
    // Quote mixed-case identifiers for PostgreSQL
    converted = converted.replace(/\b(idCandidatos|Nombre_Candidatos|Correo_Candidatos|Numero_Candidatos|idEmpresa|Nombre_Empresa|Correo_Empresa|Telefono_Empresa|Ubicacion|idPuestos|Tipo_Puesto|Salario|Horario|Experiencia)\b/g, '"$1"');
    
    // Handle CURRENT_TIMESTAMP -> now()
    converted = converted.replace(/CURRENT_TIMESTAMP/g, 'now()');
    
    // Handle parameter placeholders (? -> $1, $2, etc.)
    let paramCount = 1;
    converted = converted.replace(/\?/g, () => `$${paramCount++}`);
    
    return converted;
  }

  // Mimic transaction methods
  beginTransaction(callback) {
    this.pool.connect((err, client, release) => {
      if (err) return callback(err);
      
      client.query('BEGIN', (err) => {
        if (err) {
          release();
          return callback(err);
        }
        
        // Create transaction-like object
        const transaction = {
          query: (sql, params, cb) => {
            if (typeof params === 'function') {
              cb = params;
              params = [];
            }
            const convertedSql = this.convertMySQLToPostgreSQL(sql);
            client.query(convertedSql, params, (err, result) => {
              if (err) return cb(err);
              const mysqlResult = {
                ...result.rows,
                length: result.rows.length,
                affectedRows: result.rowCount,
                insertId: result.rows[0]?.id || result.rows[0]?.["idCandidatos"] || result.rows[0]?.["idEmpresa"] || result.rows[0]?.["idPuestos"] || undefined
              };
              cb(null, result.rows.length > 0 ? result.rows : mysqlResult);
            });
          },
          commit: (cb) => {
            client.query('COMMIT', (err) => {
              release();
              cb(err);
            });
          },
          rollback: (cb) => {
            client.query('ROLLBACK', (err) => {
              release();
              cb(err);
            });
          }
        };
        
        callback(null, transaction);
      });
    });
  }
}

const dbAdapter = new DatabaseAdapter();

// Mimic MySQL2 interface
const db = {
  query: (sql, params, callback) => dbAdapter.query(sql, params, callback),
  beginTransaction: (callback) => dbAdapter.beginTransaction(callback)
};

module.exports = { db };