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

// Crear directorio uploads si no existe
fs.ensureDirSync(path.join(__dirname, 'uploads', 'profiles'));
fs.ensureDirSync(path.join(__dirname, 'uploads', 'cvs'));
fs.ensureDirSync(path.join(__dirname, 'uploads', 'documents'));

// Configuración de conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'powerman'
});

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
    let uploadPath = path.join(__dirname, 'uploads');
    
    switch (fileType) {
      case 'profile':
        uploadPath = path.join(uploadPath, 'profiles');
        break;
      case 'cv':
        uploadPath = path.join(uploadPath, 'cvs');
        break;
      default:
        uploadPath = path.join(uploadPath, 'documents');
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

// Datos simulados (se reemplazarán con MySQL cuando esté conectado)
let isMySQL = false;

// Verificar si MySQL está conectado
setTimeout(() => {
  db.ping((err) => {
    if (!err) {
      isMySQL = true;
      console.log('🔗 MySQL está disponible');
    } else {
      isMySQL = false;
      console.log('⚠️ MySQL no disponible, usando datos simulados');
    }
  });
}, 1000);

const datosSimulados = {
  empleados: [
    {
      id: 1,
      nombre: 'Joshua Quiroz Burgos',
      email: 'Joshua@gmail.com',
      telefono: '6674863190',
      descripcion: 'Desarrollador full-stack con experiencia en React y Node.js',
      experiencia: '2 años de experiencia en desarrollo web',
      foto_perfil: null
    },
    {
      id: 2,
      nombre: 'María González',
      email: 'maria@email.com',
      telefono: '555-0234',
      descripcion: 'Diseñadora UX/UI especializada en aplicaciones móviles',
      experiencia: '3 años en diseño de interfaces',
      foto_perfil: null
    }
  ],
  empresas: [
    {
      id: 1,
      nombre: 'TechCorp SA',
      email: 'info@techcorp.com',
      telefono: '555-0100',
      ubicacion: 'Ciudad de México',
      descripcion: 'Empresa líder en desarrollo de software',
      foto_perfil: null
    }
  ],
  vacantes: [
    {
      idPuestos: 1,
      Nombre_Puesto: 'Desarrollador Frontend',
      Descripcion_Puesto: 'Buscamos desarrollador con experiencia en React',
      Nivel_Requerido: 'Junior',
      Experiencia_Requerida: '1-2 años',
      Tipo_Puesto: 'Tiempo completo',
      Nombre_Empresa: 'TechCorp SA',
      Ubicacion: 'Ciudad de México'
    }
  ]
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

  // Si MySQL no está disponible, usar datos simulados
  if (!isMySQL) {
    let user = null;
    
    // Verificar si es admin
    if (email === 'admin' && password === 'admin' && tipoUsuario === 'admin') {
      user = { id: 1, nombre: 'Administrador', email: 'admin', tipo: 'admin' };
    } else {
      
      // Buscar según el tipo de usuario seleccionado
      if (tipoUsuario === 'empleado') {
        user = datosSimulados.empleados.find(emp => emp.email === email);
        if (user) {
          user.tipo = 'empleado';
        }
      } else if (tipoUsuario === 'empresa') {
        user = datosSimulados.empresas.find(emp => emp.email === email);
        if (user) {
          user.tipo = 'empresa';
        }
      }
      
      // Verificar contraseña para usuarios normales
      if (user && password !== 'demo' && password !== 'test') {
        return res.status(401).json({ error: 'Contraseña incorrecta. Usa "demo" o "test"' });
      }
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        tipo: user.tipo,
        nombre: user.nombre 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        tipo: user.tipo
      }
    });
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
  
  if (!isMySQL) {
    const empleado = datosSimulados.empleados.find(emp => emp.id == id);
    if (!empleado) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }
    return res.json({
      nombre: empleado.nombre || 'Usuario',
      correo: empleado.email || 'sin-email@ejemplo.com',
      telefono: empleado.telefono || '555-0123',
      experiencia: empleado.experiencia || 'Sin experiencia registrada',
      descripcion: empleado.descripcion || 'Sin descripción personal',
      foto_perfil: empleado.foto_perfil || null
    });
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

  if (!isMySQL) {
    const empleadoIndex = datosSimulados.empleados.findIndex(emp => emp.id == id);
    if (empleadoIndex === -1) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }
    
    // Actualizar datos simulados
    datosSimulados.empleados[empleadoIndex] = {
      ...datosSimulados.empleados[empleadoIndex],
      nombre: nombre || datosSimulados.empleados[empleadoIndex].nombre,
      descripcion: descripcion,
      telefono: telefono,
      experiencia: experiencia
    };
    
    return res.json({ 
      message: 'Perfil actualizado exitosamente',
      empleado: datosSimulados.empleados[empleadoIndex]
    });
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
        INSERT INTO expedientes (candidatos_id, Experiencia)
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
  const { id } = req.params;
  
  // Verificar que el usuario solo puede actualizar su propia foto
  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Solo puedes actualizar tu propia foto de perfil' });
  }

  // Configurar multer específicamente para fotos de perfil
  const profileUpload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads', 'profiles'));
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${req.user.id}_profile_${uniqueSuffix}${ext}`);
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

    const fotoPath = `/uploads/profiles/${req.file.filename}`;

    // Usar la variable global de conectividad

    if (!isMySQL) {
      const empleadoIndex = datosSimulados.empleados.findIndex(emp => emp.id == id);
      if (empleadoIndex === -1) {
        return res.status(404).json({ error: 'Perfil no encontrado' });
      }
      
      datosSimulados.empleados[empleadoIndex].foto_perfil = fotoPath;
      
      return res.json({ 
        message: 'Foto de perfil actualizada exitosamente',
        foto_perfil: fotoPath
      });
    }

    const updateQuery = `UPDATE candidatos SET foto_perfil = ? WHERE idCandidatos = ?`;
    
    db.query(updateQuery, [fotoPath, id], (err, result) => {
      if (err) {
        console.error('Error actualizando foto de perfil:', err);
        return res.status(500).json({ error: 'Error actualizando foto de perfil' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Perfil no encontrado' });
      }
      
      res.json({ 
        message: 'Foto de perfil actualizada exitosamente',
        foto_perfil: fotoPath
      });
    });
  });
});

// Obtener vacantes disponibles
app.get('/api/vacantes', authenticateToken, requireRole('empleado'), (req, res) => {
  if (!isMySQL) {
    return res.json(datosSimulados.vacantes);
  }
  
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
  
  if (!isMySQL) {
    const empresa = datosSimulados.empresas.find(emp => emp.id == id);
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    return res.json({
      nombre: empresa.nombre || 'Empresa',
      correo: empresa.email || 'sin-email@ejemplo.com',
      telefono: empresa.telefono || '555-0100',
      ubicacion: empresa.ubicacion || 'Ciudad de México',
      descripcion: empresa.descripcion || 'Empresa líder en tecnología',
      foto_perfil: empresa.foto_perfil || null
    });
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

  if (!isMySQL) {
    const empresaIndex = datosSimulados.empresas.findIndex(emp => emp.id == id);
    if (empresaIndex === -1) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    
    // Actualizar datos simulados
    datosSimulados.empresas[empresaIndex] = {
      ...datosSimulados.empresas[empresaIndex],
      nombre: nombre || datosSimulados.empresas[empresaIndex].nombre,
      descripcion: descripcion,
      telefono: telefono,
      ubicacion: ubicacion
    };
    
    return res.json({ 
      message: 'Perfil actualizado exitosamente',
      empresa: datosSimulados.empresas[empresaIndex]
    });
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
        cb(null, path.join(__dirname, 'uploads', 'profiles'));
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

    const fotoPath = `/uploads/profiles/${req.file.filename}`;

    // Usar la variable global de conectividad

    if (!isMySQL) {
      const empresaIndex = datosSimulados.empresas.findIndex(emp => emp.id == id);
      if (empresaIndex === -1) {
        return res.status(404).json({ error: 'Empresa no encontrada' });
      }
      
      datosSimulados.empresas[empresaIndex].foto_perfil = fotoPath;
      
      return res.json({ 
        message: 'Foto de perfil actualizada exitosamente',
        foto_perfil: fotoPath
      });
    }

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
  
  if (!isMySQL) {
    const nuevaVacante = {
      idPuestos: datosSimulados.vacantes.length + 1,
      Tipo_Puesto: tipo_puesto,
      Salario: salario,
      Horario: horario,
      Ubicacion: ubicacion,
      Nombre_Empresa: req.user.nombre
    };
    datosSimulados.vacantes.push(nuevaVacante);
    return res.json({ 
      message: 'Vacante creada exitosamente',
      id: nuevaVacante.idPuestos 
    });
  }
  
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
  
  if (!isMySQL) {
    const empresa = datosSimulados.empresas.find(emp => emp.id == id);
    if (!empresa) {
      return res.json([]);
    }
    const vacantesEmpresa = datosSimulados.vacantes.filter(v => v.Nombre_Empresa === empresa.nombre);
    return res.json(vacantesEmpresa);
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
  if (!isMySQL) {
    return res.json({
      empleados: datosSimulados.empleados.length,
      empresas: datosSimulados.empresas.length,
      vacantes: datosSimulados.vacantes.length,
      expedientes: 2
    });
  }

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
  if (!isMySQL) {
    const allUsers = [
      ...datosSimulados.empleados,
      ...datosSimulados.empresas
    ];
    return res.json(allUsers);
  }

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

  if (!isMySQL) {
    // Simulación para modo sin MySQL
    const aplicacionId = Math.floor(Math.random() * 1000) + 100;
    
    // Enviar notificaciones por email incluso en modo simulado
    try {
      console.log(`📧 Enviando notificaciones de nueva aplicación (modo simulado)`);
      
      // Simular datos para notificación
      const vacante = datosSimulados.vacantes.find(v => v.idPuestos == puesto_id);
      const empresa = datosSimulados.empresas.find(e => e.nombre === vacante?.Nombre_Empresa);
      
      if (vacante && empresa) {
        await emailService.sendNewApplicationEmail(
          req.user.nombre, 
          vacante.Tipo_Puesto, 
          empresa.email
        );
        
        await emailService.sendApplicationConfirmationEmail(
          req.user.email, 
          vacante.Tipo_Puesto, 
          empresa.nombre
        );
        
        console.log('✅ Notificaciones enviadas exitosamente');
      }
    } catch (emailError) {
      console.error('⚠️  Error enviando emails (modo simulado):', emailError.message);
      // No falla la aplicación por error de email
    }
    
    return res.json({
      message: 'Aplicación enviada exitosamente',
      aplicacionId: aplicacionId,
      estado: 'pendiente'
    });
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

  if (!isMySQL) {
    // Datos simulados
    const aplicacionesSimuladas = [
      {
        idAplicacion: 1,
        puesto_titulo: 'Desarrollador Frontend',
        empresa_nombre: 'Tech Solutions',
        estado: 'pendiente',
        fecha_aplicacion: '2024-01-15',
        salario_esperado: 25000
      },
      {
        idAplicacion: 2,
        puesto_titulo: 'Diseñador UX/UI',
        empresa_nombre: 'InnovaCorp',
        estado: 'revisando',
        fecha_aplicacion: '2024-01-10',
        salario_esperado: 22000
      }
    ];
    return res.json(aplicacionesSimuladas);
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

  if (!isMySQL) {
    // Datos simulados - aplicaciones hechas a vacantes de la empresa
    const aplicacionesSimuladas = [
      {
        idAplicacion: 1,
        candidato_nombre: 'Joshua Quiroz Burgos',
        candidato_email: 'Joshua@gmail.com',
        candidato_telefono: '6674863190',
        puesto_titulo: 'Desarrollador Frontend',
        salario_esperado: 15000,
        disponibilidad: 'Inmediata',
        carta_presentacion: 'Estoy interesado en este puesto...',
        estado: 'pendiente',
        fecha_aplicacion: new Date().toISOString()
      }
    ];
    
    return res.json(aplicacionesSimuladas);
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

  if (!isMySQL) {
    // Simular persistencia actualizando los datos en memoria
    let aplicacionesSimuladas = [
      ];

    // Verificar que la aplicación existe y pertenece a la empresa (simulado)
    const aplicacion = aplicacionesSimuladas.find(app => 
      app.idAplicacion === parseInt(aplicacionId)
    );

    if (!aplicacion) {
      return res.status(404).json({ error: 'Aplicación no encontrada' });
    }

    // Verificar propiedad en modo simulado (empresa ID = 1 por defecto)
    if (req.user.id !== 1) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta aplicación' });
    }

    // Actualizar estado y notas en los datos simulados
    aplicacion.estado = estado;
    if (notas_empresa !== undefined) {
      aplicacion.notas_empresa = notas_empresa;
    }

    return res.json({ 
      message: 'Estado actualizado exitosamente (simulado)',
      aplicacion: aplicacion
    });
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

  if (!isMySQL) {
    // Datos simulados - vacantes favoritas
    const favoritosSimulados = [
      {
        idFavorito: 1,
        puesto_id: 1,
        fecha_agregado: '2024-01-15T10:00:00.000Z',
        Tipo_Puesto: 'Desarrollador Frontend',
        Nombre_Empresa: 'Tech Solutions',
        Ubicacion: 'Ciudad de México',
        Salario: '45000',
        Horario: 'Tiempo completo'
      },
      {
        idFavorito: 2,
        puesto_id: 3,
        fecha_agregado: '2024-01-16T14:30:00.000Z',
        Tipo_Puesto: 'Diseñador UX/UI',
        Nombre_Empresa: 'Creative Studio',
        Ubicacion: 'Guadalajara',
        Salario: '38000',
        Horario: 'Tiempo completo'
      }
    ];
    return res.json(favoritosSimulados);
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

  if (!isMySQL) {
    // En simulación, solo las vacantes 1 y 3 son favoritas
    const isFavorite = [1, 3].includes(parseInt(vacanteId));
    return res.json({ isFavorite });
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

  if (!isMySQL) {
    // Simulación para modo sin MySQL
    const isCurrentlyFavorite = [1, 3].includes(parseInt(puesto_id));
    
    return res.json({
      message: isCurrentlyFavorite ? 'Favorito eliminado exitosamente' : 'Favorito agregado exitosamente',
      action: isCurrentlyFavorite ? 'removed' : 'added',
      isFavorite: !isCurrentlyFavorite
    });
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
      url: `/uploads/${req.body.fileType || 'documents'}/${req.file.filename}`
    };

    // Usar la variable global de conectividad

    if (!isMySQL) {
      // En datos simulados, agregar el archivo a la lista del usuario
      if (!datosSimulados.archivos) {
        datosSimulados.archivos = [];
      }
      datosSimulados.archivos.push(fileInfo);
    } else {
      // TODO: Implementar inserción en MySQL para tabla archivos
      // INSERT INTO archivos (nombre_original, nombre_archivo, tipo_archivo, tamano, ruta_archivo, usuario_id, usuario_tipo, tipo_documento)
      // VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    }

    res.json({
      message: 'Archivo subido exitosamente',
      file: fileInfo
    });
  } catch (error) {
    console.error('Error subiendo archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener archivos del usuario
app.get('/api/files/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;
  
  // Verificar que el usuario solo puede ver sus propios archivos
  if (req.user.id !== parseInt(userId)) {
    return res.status(403).json({ error: 'Solo puedes ver tus propios archivos' });
  }

  if (!isMySQL) {
    const archivosUsuario = (datosSimulados.archivos || []).filter(archivo => 
      archivo.userId == userId && archivo.userId == req.user.id
    );
    return res.json(archivosUsuario);
  }

  // TODO: Implementar consulta MySQL para archivos con verificación de ownership
  res.json([]);
});

// Descargar archivo autenticado
app.get('/api/files/:fileId/download', authenticateToken, (req, res) => {
  const { fileId } = req.params;

  if (!isMySQL) {
    const archivo = (datosSimulados.archivos || []).find(archivo => 
      archivo.id === fileId && archivo.userId == req.user.id
    );
    
    if (!archivo) {
      return res.status(404).json({ error: 'Archivo no encontrado o acceso denegado' });
    }

    try {
      const filePath = path.join(__dirname, 'uploads', archivo.fileType, archivo.filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Archivo físico no encontrado' });
      }

      res.setHeader('Content-Disposition', `attachment; filename="${archivo.originalName}"`);
      res.setHeader('Content-Type', archivo.mimetype);
      
      res.sendFile(filePath);
    } catch (error) {
      console.error('Error descargando archivo:', error);
      res.status(500).json({ error: 'Error descargando archivo' });
    }

    return;
  }

  // TODO: Implementar descarga MySQL con verificación de ownership
  res.status(500).json({ error: 'Funcionalidad no disponible aún' });
});

// Eliminar archivo
app.delete('/api/files/:fileId', authenticateToken, (req, res) => {
  const { fileId } = req.params;

  if (!isMySQL) {
    const index = (datosSimulados.archivos || []).findIndex(archivo => 
      archivo.id === fileId && archivo.userId == req.user.id
    );
    
    if (index === -1) {
      return res.status(404).json({ error: 'Archivo no encontrado o acceso denegado' });
    }

    const archivo = datosSimulados.archivos[index];
    
    // Eliminar archivo físico
    try {
      const filePath = path.join(__dirname, 'uploads', archivo.fileType, archivo.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error eliminando archivo físico:', error);
    }

    // Eliminar de datos simulados
    datosSimulados.archivos.splice(index, 1);
    
    return res.json({ message: 'Archivo eliminado exitosamente' });
  }

  // TODO: Implementar eliminación MySQL con verificación de ownership
  res.status(500).json({ error: 'Funcionalidad no disponible aún' });
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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});