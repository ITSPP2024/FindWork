const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const emailService = require('./utils/emailService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
// Configurar CORS de forma segura
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://your-domain.com'
    : ['http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Nota: Middleware de archivos se configurará después de definir authenticateToken

// Nota: Archivos protegidos por autenticación - no serving estático público

// Crear directorios Fotos y PDF si no existen
fs.ensureDirSync(path.join(__dirname, '..', 'Fotos'));
fs.ensureDirSync(path.join(__dirname, '..', 'PDF'));

// Configuración de conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'powerman',
  // Habilitar logs de SQL para debugging
  debug: false,
  multipleStatements: true
});

// Interceptar todas las queries para logging
const originalQuery = db.query;
db.query = function(sql, params, callback) {
  // Si solo se pasan 2 argumentos, el segundo es el callback
  if (typeof params === 'function') {
    callback = params;
    params = null;
  }
  
  console.log('💾 [SQL QUERY]:', typeof sql === 'string' ? sql.trim() : sql);
  if (params) {
    console.log('📋 [SQL PARAMS]:', params);
  }
  
  return originalQuery.call(this, sql, params, function(err, results, fields) {
    if (err) {
      console.error('❌ [SQL ERROR] ==========================================');
      console.error('❌ [SQL ERROR] Query que falló:', typeof sql === 'string' ? sql.trim() : sql);
      console.error('❌ [SQL ERROR] Parámetros:', params);
      console.error('❌ [SQL ERROR] Código de error:', err.code);
      console.error('❌ [SQL ERROR] Mensaje:', err.sqlMessage || err.message);
      console.error('❌ [SQL ERROR] Error completo:', err);
      console.error('❌ [SQL ERROR] ==========================================');
    } else {
      console.log('✅ [SQL SUCCESS] Query ejecutada exitosamente');
    }
    
    if (callback) {
      callback(err, results, fields);
    }
  });
};

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('⚠️  Error conectando a MySQL:', err.message);
    console.log('💡 La aplicación funcionará con datos simulados.');
    return;
  }
  console.log('✅ Conectado a MySQL database');
});

// JWT Secret
// JWT Secret con fallback para desarrollo
const JWT_SECRET = process.env.JWT_SECRET || 'findwork_dev_secret_2024_very_secure';
if (!process.env.JWT_SECRET) {
  console.log('⚠️  Usando JWT_SECRET por defecto para desarrollo');
  console.log('💡 En producción, configura JWT_SECRET como variable de entorno');
}

// Configuración de Multer para diferentes tipos de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fileType = req.body.fileType || 'documents';
    let uploadPath;
    
    switch (fileType) {
      case 'profile':
        uploadPath = path.join(__dirname, '..', 'Fotos'); // Carpeta Fotos
        break;
      case 'cv':
        uploadPath = path.join(__dirname, '..', 'PDF'); // Carpeta PDF
        break;
      default:
        uploadPath = path.join(__dirname, '..', 'PDF'); // Por defecto en PDF
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${req.user.id}_${name}_${uniqueSuffix}${ext}`);
  }
});

// Filtros de archivos por tipo
const fileFilter = (req, file, cb) => {
  const fileType = req.body.fileType || 'documents';
  
  if (fileType === 'profile') {
    // Solo imágenes para fotos de perfil
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes para foto de perfil'), false);
    }
  } else if (fileType === 'cv') {
    // PDFs y documentos de Word para CVs
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF, DOC o DOCX para CVs'), false);
    }
  } else {
    // Documentos generales - más flexible
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  }
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Middleware de autorización por rol
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.tipo !== role) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
};


// Servir archivos estáticos de forma segura (después de definir authenticateToken)
app.use('/uploads', authenticateToken, (req, res, next) => {
  // Solo permitir acceso a archivos del usuario autenticado
  const filePath = req.path;
  const userId = req.user.id;
  
  // Verificar que el archivo pertenece al usuario con patrón estricto
  const userFilePattern = new RegExp(`^/(profiles|cvs|documents)/(empresa_)?${userId}_`);
  if (userFilePattern.test(filePath)) {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado al archivo' });
  }
}, express.static(path.join(__dirname, 'uploads')));

// === RUTAS DE AUTENTICACIÓN ===

// Login con selección manual de tipo de usuario
app.post('/api/login', async (req, res) => {
  const { email, password, tipoUsuario } = req.body;

  // Validar tipo de usuario primero
  if (!tipoUsuario || !['empleado', 'empresa', 'admin'].includes(tipoUsuario)) {
    return res.status(400).json({ error: 'Tipo de usuario inválido' });
  }


  // Función para buscar usuario en MySQL
  const searchUser = async () => {
    return new Promise((resolve, reject) => {
      // Verificar si es admin
      if (email === 'admin' && password === 'admin' && tipoUsuario === 'admin') {
        return resolve({ id: 1, nombre: 'Administrador', email: 'admin', tipo: 'admin' });
      }

      // Buscar según el tipo de usuario seleccionado
      if (tipoUsuario === 'empleado') {
        const candidatoQuery = 'SELECT idCandidatos as id, Nombre_Candidatos as nombre, Correo_Candidatos as email FROM candidatos WHERE Correo_Candidatos = ?';
        
        db.query(candidatoQuery, [email], (err, results) => {
          if (err) {
            reject(err);
            return;
          }
          if (results.length > 0) {
            const user = results[0];
            user.tipo = tipoUsuario; // Usar el tipo seleccionado
            return resolve(user);
          }
          
          // Usuario no encontrado
          resolve(null);
        });
      } else if (tipoUsuario === 'empresa') {
        const empresaQuery = 'SELECT idEmpresa as id, Nombre_Empresa as nombre, Correo_Empresa as email FROM empresa WHERE Correo_Empresa = ?';
        
        db.query(empresaQuery, [email], (err, results) => {
          if (err) {
            reject(err);
            return;
          }
          if (results.length > 0) {
            const user = results[0];
            user.tipo = tipoUsuario; // Usar el tipo seleccionado
            return resolve(user);
          }
          
          // Usuario no encontrado
          resolve(null);
        });
      } else {
        // Tipo de usuario inválido
        reject(new Error('Tipo de usuario inválido'));
      }
    });
  };

  try {
    const user = await searchUser();
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // IMPORTANTE: En producción con MySQL, aquí deberías verificar contraseñas hasheadas
    // Por ahora, para desarrollo local, se permite acceso sin verificación de contraseña
    // TODO: Implementar bcrypt.compare() cuando tengas contraseñas hasheadas en MySQL
    console.log('⚠️  ADVERTENCIA: Verificación de contraseña deshabilitada para desarrollo');
    console.log('💡 En producción, implementar verificación con bcrypt para seguridad');

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email || email, 
        tipo: user.tipo,
        nombre: user.nombre 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email || email,
        tipo: user.tipo
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// === RUTAS PARA EMPLEADOS ===

// Obtener perfil del empleado
app.get('/api/empleado/perfil/:id', authenticateToken, requireRole('empleado'), (req, res) => {
  const { id } = req.params;
  
  // Verificar que el usuario solo puede ver su propio perfil
  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Solo puedes ver tu propio perfil' });
  }
  
  
  const query = `
    SELECT 
      c.Nombre_Candidatos AS nombre,
      c.Correo_Candidatos AS correo,
      c.Numero_Candidatos AS telefono,
      c.descripcion,
      e.Experiencia AS experiencia,
      c.foto_perfil
    FROM candidatos c 
    LEFT JOIN expedientes e ON c.idCandidatos = e.candidato_id 
    WHERE c.idCandidatos = ?
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error obteniendo perfil:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }
    
    res.json(results[0]);
  });
});

// Actualizar perfil del empleado
app.put('/api/empleado/perfil/:id', authenticateToken, requireRole('empleado'), (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, telefono, experiencia } = req.body;
  
  // 🔑 CRÍTICO: Convertir telefono a string siempre (problema ChatGPT)
  const telefonoString = String(telefono);
  
  // Verificar que el usuario solo puede actualizar su propio perfil
  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Solo puedes actualizar tu propio perfil' });
  }


  // Usar transacción para atomicidad
  db.beginTransaction((transactionErr) => {
    if (transactionErr) {
      console.error('Error iniciando transacción:', transactionErr);
      return res.status(500).json({ error: 'Error actualizando perfil' });
    }
    
    // Actualizar candidatos
    const updateCandidatos = `
      UPDATE candidatos 
      SET Nombre_Candidatos = ?, descripcion = ?, Numero_Candidatos = ?
      WHERE idCandidatos = ?
    `;
    
    db.query(updateCandidatos, [nombre, descripcion, telefonoString, id], (err, result) => {
      if (err) {
        console.error('Error actualizando candidatos:', err);
        return db.rollback(() => {
          res.status(500).json({ error: 'Error actualizando perfil' });
        });
      }
      if (result.affectedRows === 0) {
        return db.rollback(() => {
          res.status(404).json({ error: 'Perfil no encontrado' });
        });
      }
      
      // UPSERT experiencia en expedientes (actualizar o crear)
      const upsertExpedientes = `
        INSERT INTO expedientes (candidato_id, Experiencia)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE Experiencia = VALUES(Experiencia)
      `;
      
      db.query(upsertExpedientes, [id, experiencia], (err2, result2) => {
        if (err2) {
          console.error('Error actualizando experiencia:', err2);
          return db.rollback(() => {
            res.status(500).json({ error: 'Error actualizando experiencia' });
          });
        }
        
        // Confirmar transacción
        db.commit((commitErr) => {
          if (commitErr) {
            console.error('Error confirmando transacción:', commitErr);
            return db.rollback(() => {
              res.status(500).json({ error: 'Error completando actualización' });
            });
          }
          
          res.json({ message: 'Perfil actualizado exitosamente' });
        });
      });
    });
  });
});

// Actualizar foto de perfil del empleado
app.put('/api/empleado/foto-perfil/:id', authenticateToken, requireRole('empleado'), (req, res) => {
  console.log('🔍 [FOTO EMPLEADO] Iniciando subida de foto para empleado ID:', req.params.id);
  console.log('🔍 [FOTO EMPLEADO] Usuario autenticado:', req.user);
  
  const { id } = req.params;
  
  // Verificar que el usuario solo puede actualizar su propia foto
  if (req.user.id !== parseInt(id)) {
    console.log('❌ [FOTO EMPLEADO] Error de permisos. Usuario:', req.user.id, 'intentando actualizar ID:', id);
    return res.status(403).json({ error: 'Solo puedes actualizar tu propia foto de perfil' });
  }

  // Configurar multer específicamente para fotos de perfil
  const profileUpload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        const destPath = path.join(__dirname, '..', 'Fotos');
        console.log('📁 [FOTO EMPLEADO] Destino de archivo:', destPath);
        cb(null, destPath);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `${req.user.id}_profile_${uniqueSuffix}${ext}`;
        console.log('📝 [FOTO EMPLEADO] Nombre del archivo generado:', filename);
        cb(null, filename);
      }
    }),
    fileFilter: (req, file, cb) => {
      console.log('🔍 [FOTO EMPLEADO] Verificando tipo de archivo:', file.mimetype);
      if (file.mimetype.startsWith('image/')) {
        console.log('✅ [FOTO EMPLEADO] Tipo de archivo válido');
        cb(null, true);
      } else {
        console.log('❌ [FOTO EMPLEADO] Tipo de archivo inválido:', file.mimetype);
        cb(new Error('Solo se permiten imágenes para foto de perfil'), false);
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }).single('foto');

  console.log('📤 [FOTO EMPLEADO] Procesando upload con multer...');
  profileUpload(req, res, function (err) {
    if (err) {
      console.error('❌ [FOTO EMPLEADO] Error en multer:', err.message);
      return res.status(400).json({ error: err.message });
    }

    console.log('🔍 [FOTO EMPLEADO] Archivo recibido:', req.file ? req.file.filename : 'NINGUNO');
    if (!req.file) {
      console.error('❌ [FOTO EMPLEADO] NO SE RECIBIÓ ARCHIVO - req.file es undefined/null');
      console.log('📋 [FOTO EMPLEADO] Headers recibidos:', req.headers);
      console.log('📋 [FOTO EMPLEADO] Body recibido:', req.body);
      return res.status(400).json({ error: 'No se ha subido ninguna imagen' });
    }

    const fotoPath = `/Fotos/${req.file.filename}`;
    console.log('💾 [FOTO EMPLEADO] Ruta para guardar en DB:', fotoPath);

    // Verificar si estamos conectados a la base de datos
    console.log('🔗 [FOTO EMPLEADO] Intentando guardar en base de datos...');
    const updateQuery = `UPDATE candidatos SET foto_perfil = ? WHERE idCandidatos = ?`;
    console.log('📝 [FOTO EMPLEADO] Query SQL:', updateQuery);
    console.log('📋 [FOTO EMPLEADO] Parámetros:', [fotoPath, id]);
    
    db.query(updateQuery, [fotoPath, id], (err, result) => {
      if (err) {
        console.error('❌ [FOTO EMPLEADO] Error en base de datos:', err);
        console.error('❌ [FOTO EMPLEADO] Error completo:', JSON.stringify(err, null, 2));
        return res.status(500).json({ error: 'Error actualizando foto de perfil: ' + err.message });
      }
      
      console.log('📊 [FOTO EMPLEADO] Resultado de la query:', result);
      console.log('📊 [FOTO EMPLEADO] Filas afectadas:', result.affectedRows);
      
      if (result.affectedRows === 0) {
        console.error('❌ [FOTO EMPLEADO] No se encontró el candidato con ID:', id);
        return res.status(404).json({ error: 'Perfil no encontrado' });
      }
      
      console.log('✅ [FOTO EMPLEADO] Foto actualizada exitosamente!');
      res.json({ 
        message: 'Foto de perfil actualizada exitosamente',
        foto_perfil: fotoPath
      });
    });
  });
});

// Obtener vacantes disponibles
app.get('/api/vacantes', authenticateToken, requireRole('empleado'), (req, res) => {
  
  const query = `
    SELECT p.*, e.Nombre_Empresa, e.Ubicacion 
    FROM puestos p 
    JOIN empresa e ON p.empresa_id = e.idEmpresa 
    ORDER BY p.idPuestos DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error obteniendo vacantes:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.json(results);
  });
});

// === RUTAS PARA EMPRESAS ===

// Obtener perfil de empresa
app.get('/api/empresa/perfil/:id', authenticateToken, requireRole('empresa'), (req, res) => {
  const { id } = req.params;
  
  // Verificar que la empresa solo puede ver su propio perfil
  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Solo puedes ver tu propio perfil' });
  }
  
  
  const query = `
    SELECT 
      e.Nombre_Empresa AS nombre,
      e.Correo_Empresa AS correo,
      e.Telefono_Empresa AS telefono,
      e.Ubicacion AS ubicacion,
      e.descripcion,
      e.foto_perfil
    FROM empresa e 
    WHERE e.idEmpresa = ?
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error obteniendo perfil empresa:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    
    res.json(results[0]);
  });
});

// Actualizar perfil de empresa
app.put('/api/empresa/perfil/:id', authenticateToken, requireRole('empresa'), (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, telefono, ubicacion } = req.body;
  
  // Verificar que la empresa solo puede actualizar su propio perfil
  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Solo puedes actualizar tu propio perfil' });
  }


  const updateQuery = `
    UPDATE empresa 
    SET Nombre_Empresa = ?, descripcion = ?, Telefono_Empresa = ?, Ubicacion = ?
    WHERE idEmpresa = ?
  `;
  
  db.query(updateQuery, [nombre, descripcion, telefono, ubicacion, id], (err, result) => {
    if (err) {
      console.error('Error actualizando perfil empresa:', err);
      return res.status(500).json({ error: 'Error actualizando perfil' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    
    res.json({ message: 'Perfil actualizado exitosamente' });
  });
});

// Actualizar foto de perfil de empresa
app.put('/api/empresa/foto-perfil/:id', authenticateToken, requireRole('empresa'), (req, res) => {
  const { id } = req.params;
  
  // Verificar que la empresa solo puede actualizar su propia foto
  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Solo puedes actualizar tu propia foto de perfil' });
  }

  // Configurar multer específicamente para fotos de perfil de empresa
  const profileUpload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'Fotos'));
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `empresa_${req.user.id}_profile_${uniqueSuffix}${ext}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten imágenes para foto de perfil'), false);
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }).single('foto');

  profileUpload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ninguna imagen' });
    }

    const fotoPath = `/Fotos/${req.file.filename}`;

    // Usar la variable global de conectividad


    const updateQuery = `UPDATE empresa SET foto_perfil = ? WHERE idEmpresa = ?`;
    
    db.query(updateQuery, [fotoPath, id], (err, result) => {
      if (err) {
        console.error('Error actualizando foto de perfil empresa:', err);
        return res.status(500).json({ error: 'Error actualizando foto de perfil' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Empresa no encontrada' });
      }
      
      res.json({ 
        message: 'Foto de perfil actualizada exitosamente',
        foto_perfil: fotoPath
      });
    });
  });
});

// Crear vacante
app.post('/api/empresa/vacante', authenticateToken, requireRole('empresa'), (req, res) => {
  const { tipo_puesto, salario, horario, ubicacion } = req.body;
  const empresaId = req.user.id;
  
  
  const query = 'INSERT INTO puestos (Tipo_Puesto, Salario, Horario, Ubicacion, empresa_id) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [tipo_puesto, salario, horario, ubicacion, empresaId], (err, result) => {
    if (err) {
      console.error('Error creando vacante:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json({ 
      message: 'Vacante creada exitosamente',
      id: result.insertId 
    });
  });
});

// Obtener vacantes de una empresa
app.get('/api/empresa/vacantes/:id', authenticateToken, requireRole('empresa'), (req, res) => {
  const { id } = req.params;
  
  // Verificar que la empresa solo puede ver sus propias vacantes
  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Solo puedes ver tus propias vacantes' });
  }
  
  
  const query = 'SELECT * FROM puestos ORDER BY idPuestos DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error obteniendo vacantes empresa:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(results);
  });
});

// === RUTAS PARA ADMIN ===

// Estadísticas generales
app.get('/api/admin/estadisticas', authenticateToken, requireRole('admin'), (req, res) => {

  const queries = {
    empleados: 'SELECT COUNT(*) as total FROM candidatos',
    empresas: 'SELECT COUNT(*) as total FROM empresa',
    puestos: 'SELECT COUNT(*) as total FROM puestos',
    expedientes: 'SELECT COUNT(*) as total FROM expedientes'
  };

  const results = {};
  let completedQueries = 0;

  Object.keys(queries).forEach(key => {
    db.query(queries[key], (err, result) => {
      if (err) {
        console.error(`Error en estadística ${key}:`, err);
        results[key] = 0;
      } else {
        results[key] = result[0].total;
      }
      
      completedQueries++;
      if (completedQueries === Object.keys(queries).length) {
        res.json(results);
      }
    });
  });
});

// Obtener todos los usuarios
app.get('/api/admin/usuarios', authenticateToken, requireRole('admin'), (req, res) => {

  const query = `
    SELECT 'empleado' as tipo, idCandidatos as id, Nombre_Candidatos as nombre, Correo_Candidatos as email FROM candidatos
    UNION
    SELECT 'empresa' as tipo, idEmpresa as id, Nombre_Empresa as nombre, Correo_Empresa as email FROM empresa
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error obteniendo usuarios:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.json(results);
  });
});

// Iniciar servidor
// === RUTAS PARA APLICACIONES ===

// Aplicar a una vacante
app.post('/api/empleado/aplicar', authenticateToken, requireRole('empleado'), async (req, res) => {
  const { puesto_id, carta_presentacion, salario_esperado, disponibilidad } = req.body;
  const candidato_id = req.user.id;

  if (!puesto_id) {
    return res.status(400).json({ error: 'ID del puesto es requerido' });
  }


  try {
    // Verificar que no haya aplicado antes a este puesto
    const checkQuery = 'SELECT idAplicacion FROM aplicaciones WHERE candidato_id = ? AND puesto_id = ?';
    
    db.query(checkQuery, [candidato_id, puesto_id], async (err, existing) => {
      if (err) {
        console.error('Error verificando aplicación existente:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Ya has aplicado a esta vacante' });
      }

      // Crear nueva aplicación
      const insertQuery = `
        INSERT INTO aplicaciones (candidato_id, puesto_id, carta_presentacion, salario_esperado, disponibilidad) 
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(insertQuery, [candidato_id, puesto_id, carta_presentacion, salario_esperado, disponibilidad], 
        async (err, result) => {
          if (err) {
            console.error('Error creando aplicación:', err);
            return res.status(500).json({ error: 'Error creando aplicación' });
          }

          // Obtener datos para notificación por email
          const notifyQuery = `
            SELECT 
              c.Nombre_Candidatos as candidato_nombre,
              p.Tipo_Puesto as puesto_titulo,
              e.Correo_Empresa as empresa_email,
              e.Nombre_Empresa as empresa_nombre,
              c.Correo_Candidatos as candidato_email
            FROM aplicaciones a
            JOIN candidatos c ON a.candidato_id = c.idCandidatos
            JOIN puestos p ON a.puesto_id = p.idPuestos
            JOIN empresa e ON p.empresa_id = e.idEmpresa
            WHERE a.idAplicacion = ?
          `;

          db.query(notifyQuery, [result.insertId], async (err, notifyData) => {
            if (!err && notifyData.length > 0) {
              const data = notifyData[0];
              
              // Enviar emails de notificación
              try {
                await emailService.sendNewApplicationEmail(
                  data.candidato_nombre, 
                  data.puesto_titulo, 
                  data.empresa_email
                );
                
                await emailService.sendApplicationConfirmationEmail(
                  data.candidato_email, 
                  data.puesto_titulo, 
                  data.empresa_nombre
                );
              } catch (emailError) {
                console.error('Error enviando emails:', emailError);
                // No falla la aplicación por error de email
              }
            }

            res.json({
              message: 'Aplicación enviada exitosamente',
              aplicacionId: result.insertId,
              estado: 'pendiente'
            });
          });
        });
    });

  } catch (error) {
    console.error('Error en aplicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener aplicaciones del empleado
app.get('/api/empleado/aplicaciones/:id', authenticateToken, requireRole('empleado'), (req, res) => {
  const { id } = req.params;
  
  // Verificar que el usuario solo puede ver sus propias aplicaciones
  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Solo puedes ver tus propias aplicaciones' });
  }


  const query = `
    SELECT 
      a.idAplicacion,
      a.estado,
      a.fecha_aplicacion,
      a.salario_esperado,
      a.disponibilidad,
      a.carta_presentacion,
      p.Tipo_Puesto as puesto_titulo,
      p.Salario,
      p.Ubicacion,
      e.Nombre_Empresa as empresa_nombre
    FROM aplicaciones a
    JOIN puestos p ON a.puesto_id = p.idPuestos
    JOIN empresa e ON p.empresa_id = e.idEmpresa
    WHERE a.candidato_id = ?
    ORDER BY a.fecha_aplicacion DESC
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error obteniendo aplicaciones:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    res.json(results);
  });
});

// Obtener aplicaciones para una empresa
app.get('/api/empresa/aplicaciones/:id', authenticateToken, requireRole('empresa'), (req, res) => {
  const { id } = req.params;
  
  // Verificar que la empresa solo puede ver sus propias aplicaciones
  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Solo puedes ver aplicaciones de tu empresa' });
  }


  const query = `
    SELECT 
      a.idAplicacion,
      a.salario_esperado,
      a.disponibilidad,
      a.carta_presentacion,
      a.estado,
      a.fecha_aplicacion,
      c.Nombre_Candidatos as candidato_nombre,
      c.Correo_Candidatos as candidato_email,
      c.Numero_Candidatos as candidato_telefono,
      p.Tipo_Puesto as puesto_titulo,
      p.Salario,
      p.Ubicacion
    FROM aplicaciones a
    JOIN candidatos c ON a.candidato_id = c.idCandidatos
    JOIN puestos p ON a.puesto_id = p.idPuestos
    WHERE p.empresa_id = ?
    ORDER BY a.fecha_aplicacion DESC
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error obteniendo aplicaciones empresa:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    res.json(results);
  });
});

// Actualizar estado de aplicación (solo empresas)
app.put('/api/empresa/aplicacion/:aplicacionId', authenticateToken, requireRole('empresa'), (req, res) => {
  const { aplicacionId } = req.params;
  const { estado, notas_empresa } = req.body;
  
  const estadosValidos = ['pendiente', 'revisando', 'entrevista', 'aceptado', 'rechazado'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }


  // Verificar que la aplicación pertenece a una vacante de esta empresa
  const verifyQuery = `
    SELECT a.idAplicacion 
    FROM aplicaciones a
    JOIN puestos p ON a.puesto_id = p.idPuestos
    WHERE a.idAplicacion = ? AND p.empresa_id = ?
  `;

  db.query(verifyQuery, [aplicacionId, req.user.id], (err, results) => {
    if (err) {
      console.error('Error verificando aplicación:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta aplicación' });
    }

    const updateQuery = `
      UPDATE aplicaciones 
      SET estado = ?, notas_empresa = ?, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE idAplicacion = ?
    `;

    db.query(updateQuery, [estado, notas_empresa, aplicacionId], (err, result) => {
      if (err) {
        console.error('Error actualizando aplicación:', err);
        return res.status(500).json({ error: 'Error actualizando aplicación' });
      }

      res.json({ message: 'Estado actualizado exitosamente' });
    });
  });
});

// ========================================
// RUTAS DE FAVORITOS
// ========================================

// Obtener favoritos del empleado
app.get('/api/empleado/favoritos/:id', authenticateToken, requireRole('empleado'), (req, res) => {
  const { id } = req.params;
  
  // Verificar que el usuario solo puede ver sus propios favoritos
  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Solo puedes ver tus propios favoritos' });
  }


  const query = `
    SELECT 
      f.idFavorito,
      f.puesto_id,
      f.fecha_agregado,
      p.Tipo_Puesto,
      e.Nombre_Empresa,
      p.Ubicacion,
      p.Salario,
      p.Horario
    FROM favoritos f
    JOIN puestos p ON f.puesto_id = p.idPuestos
    JOIN empresa e ON p.empresa_id = e.idEmpresa
    WHERE f.candidato_id = ?
    ORDER BY f.fecha_agregado DESC
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error obteniendo favoritos:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    res.json(results);
  });
});

// Verificar si una vacante es favorita
app.get('/api/empleado/favorito/:empleadoId/:vacanteId', authenticateToken, requireRole('empleado'), (req, res) => {
  const { empleadoId, vacanteId } = req.params;
  
  // Verificar que el usuario solo puede verificar sus propios favoritos
  if (req.user.id !== parseInt(empleadoId)) {
    return res.status(403).json({ error: 'Solo puedes verificar tus propios favoritos' });
  }


  const query = 'SELECT idFavorito FROM favoritos WHERE candidato_id = ? AND puesto_id = ?';
  
  db.query(query, [empleadoId, vacanteId], (err, results) => {
    if (err) {
      console.error('Error verificando favorito:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    res.json({ isFavorite: results.length > 0 });
  });
});

// Agregar/quitar favorito (toggle)
app.post('/api/empleado/favorito/toggle', authenticateToken, requireRole('empleado'), (req, res) => {
  const { puesto_id } = req.body;
  const candidato_id = req.user.id;
  
  if (!puesto_id) {
    return res.status(400).json({ error: 'ID del puesto es requerido' });
  }


  // Verificar si ya es favorito
  const checkQuery = 'SELECT idFavorito FROM favoritos WHERE candidato_id = ? AND puesto_id = ?';
  
  db.query(checkQuery, [candidato_id, puesto_id], (err, results) => {
    if (err) {
      console.error('Error verificando favorito:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results.length > 0) {
      // Ya es favorito, lo eliminamos
      const deleteQuery = 'DELETE FROM favoritos WHERE candidato_id = ? AND puesto_id = ?';
      
      db.query(deleteQuery, [candidato_id, puesto_id], (err, result) => {
        if (err) {
          console.error('Error eliminando favorito:', err);
          return res.status(500).json({ error: 'Error eliminando favorito' });
        }

        res.json({
          message: 'Favorito eliminado exitosamente',
          action: 'removed',
          isFavorite: false
        });
      });
    } else {
      // No es favorito, lo agregamos
      const insertQuery = 'INSERT INTO favoritos (candidato_id, puesto_id, fecha_agregado) VALUES (?, ?, CURRENT_TIMESTAMP)';
      
      db.query(insertQuery, [candidato_id, puesto_id], (err, result) => {
        if (err) {
          console.error('Error agregando favorito:', err);
          return res.status(500).json({ error: 'Error agregando favorito' });
        }

        res.json({
          message: 'Favorito agregado exitosamente',
          action: 'added',
          isFavorite: true
        });
      });
    }
  });
});

// ========================================
// RUTAS DE ARCHIVOS
// ========================================

// Subir archivo
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const fileInfo = {
      id: Date.now().toString(),
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      fileType: req.body.fileType || 'documents',
      userId: req.user.id,
      uploadDate: new Date().toISOString(),
      url: req.body.fileType === 'profile' ? `/Fotos/${req.file.filename}` : `/PDF/${req.file.filename}`
    };

    // Usar la variable global de conectividad


    res.json({
      message: 'Archivo subido exitosamente',
      file: fileInfo
    });
  } catch (error) {
    console.error('Error subiendo archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Subir CV (solo para empleados)
app.post('/api/upload-cv', authenticateToken, requireRole('empleado'), upload.single('cv'), (req, res) => {
  const { id } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha subido ningún CV' });
  }

  const cvPath = `/PDF/${req.file.filename}`;

  // Actualizar la ruta del CV en la base de datos
  const updateQuery = `UPDATE candidatos SET Documentos = ? WHERE idCandidatos = ?`;
  
  db.query(updateQuery, [cvPath, req.user.id], (err, result) => {
    if (err) {
      console.error('Error actualizando ruta del CV:', err);
      return res.status(500).json({ error: 'Error guardando CV' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Candidato no encontrado' });
    }
    
    res.json({ 
      message: 'CV subido exitosamente',
      Documentos: cvPath,
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  });
});

// Obtener archivos del usuario (simple)
app.get('/api/files/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;
  
  // Verificar que el usuario solo puede ver sus propios archivos
  if (req.user.id !== parseInt(userId)) {
    return res.status(403).json({ error: 'Solo puedes ver tus propios archivos' });
  }

  // Obtener información básica del candidato incluyendo archivos
  const query = `
    SELECT foto_perfil, Documentos 
    FROM candidatos 
    WHERE idCandidatos = ?
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error obteniendo archivos:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (results.length === 0) {
      return res.json({ foto_perfil: null, Documentos: null });
    }
    
    res.json(results[0]);
  });
});

// Descargar CV del candidato
app.get('/api/candidato/:candidatoId/cv', authenticateToken, (req, res) => {
  const { candidatoId } = req.params;

  // Obtener la ruta del CV
  const query = `SELECT Documentos FROM candidatos WHERE idCandidatos = ?`;
  
  db.query(query, [candidatoId], (err, results) => {
    if (err) {
      console.error('Error obteniendo CV:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (results.length === 0 || !results[0].Documentos) {
      return res.status(404).json({ error: 'CV no encontrado' });
    }
    
    const cvPath = results[0].Documentos;
    const fullPath = path.join(__dirname, '..', cvPath.replace('/', ''));
    
    // Verificar si el archivo existe
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Archivo CV no encontrado' });
    }
    
    res.sendFile(fullPath);
  });
});

// Eliminar CV del candidato
app.delete('/api/empleado/cv/:id', authenticateToken, requireRole('empleado'), (req, res) => {
  const { id } = req.params;
  
  // Verificar que el usuario solo puede eliminar su propio CV
  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Solo puedes eliminar tu propio CV' });
  }

  // Obtener la ruta actual del CV
  const selectQuery = `SELECT Documentos FROM candidatos WHERE idCandidatos = ?`;
  
  db.query(selectQuery, [id], (err, results) => {
    if (err) {
      console.error('Error obteniendo CV:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (results.length === 0 || !results[0].Documentos) {
      return res.status(404).json({ error: 'CV no encontrado' });
    }
    
    const cvPath = results[0].Documentos;
    
    // Eliminar referencia de la base de datos
    const updateQuery = `UPDATE candidatos SET Documentos = NULL WHERE idCandidatos = ?`;
    
    db.query(updateQuery, [id], (err, result) => {
      if (err) {
        console.error('Error eliminando referencia del CV:', err);
        return res.status(500).json({ error: 'Error eliminando CV' });
      }
      
      // Eliminar archivo físico
      const fullPath = path.join(__dirname, '..', cvPath.replace('/', ''));
      fs.unlink(fullPath, (fsErr) => {
        if (fsErr) {
          console.error('Error eliminando archivo físico:', fsErr);
        }
        
        res.json({ message: 'CV eliminado exitosamente' });
      });
    });
  });
});

// Middleware de manejo de errores para multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande. Máximo 10MB.' });
    }
    return res.status(400).json({ error: 'Error en la subida del archivo: ' + error.message });
  }
  
  if (error.message.includes('Solo se permiten')) {
    return res.status(400).json({ error: error.message });
  }
  
  next(error);
});

// === RUTAS DE REGISTRO ===

// Registro empleado
app.post('/api/register/empleado', async (req, res) => {
  const { nombre, email, password } = req.body;
  console.log('🔹 Registro empleado recibido:', req.body);

  if (!nombre || !email || !password) {
    console.log('❌ Faltan campos obligatorios');
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar si el email ya existe
    const checkQuery = 'SELECT * FROM candidatos WHERE Correo_Candidatos = ?';
    db.query(checkQuery, [email], async (err, results) => {
      if (err) {
        console.error('❌ Error verificando email existente:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (results.length > 0) {
        console.log('❌ Email ya registrado');
        return res.status(400).json({ error: 'Email ya registrado' });
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('✅ Contraseña hasheada');

      // Insertar nuevo candidato
      const insertQuery = `
       INSERT INTO candidatos (Nombre_Candidatos, Correo_Candidatos, password, Tipo_Usuario)
VALUES (?, ?, ?, 'empleado')

      `;

      db.query(insertQuery, [nombre, email], (err2, result) => {
        if (err2) {
          console.error('❌ Error creando empleado en DB:', err2);
          return res.status(500).json({ error: 'Error creando cuenta' });
        }

        console.log('✅ Empleado creado, ID:', result.insertId);
        res.json({ 
          success: true, 
          message: 'Cuenta creada exitosamente',
          user: { id: result.insertId, nombre, email, tipo: 'empleado' }
        });
      });
    });
  } catch (error) {
    console.error('❌ Catch general:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Registro empresa
app.post('/api/register/empresa', async (req, res) => {
  const { nombre, email, password } = req.body;
  console.log('🔹 Registro empresa recibido:', req.body);

  if (!nombre || !email || !password) {
    console.log('❌ Faltan campos obligatorios');
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar si el email ya existe
    const checkQuery = 'SELECT * FROM empresa WHERE Correo_Empresa = ?';
    db.query(checkQuery, [email], async (err, results) => {
      if (err) {
        console.error('❌ Error verificando email empresa existente:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (results.length > 0) {
        console.log('❌ Email empresa ya registrado');
        return res.status(400).json({ error: 'Email ya registrado' });
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('✅ Contraseña empresa hasheada');

      // Insertar nueva empresa
      const insertQuery = `
        INSERT INTO empresa (Nombre_Empresa, Correo_Empresa, password, Tipo_Usuario)
VALUES (?, ?, ?, 'empresa')

      `;
      
      db.query(insertQuery, [nombre, email], (err2, result) => {
        if (err2) {
          console.error('❌ Error creando empresa en DB:', err2);
          return res.status(500).json({ error: 'Error creando cuenta' });
        }

        console.log('✅ Empresa creada, ID:', result.insertId);
        res.json({ 
          success: true, 
          message: 'Cuenta creada exitosamente',
          user: { id: result.insertId, nombre, email, tipo: 'empresa' }
        });
      });
    });
  } catch (error) {
    console.error('❌ Catch general empresa:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});