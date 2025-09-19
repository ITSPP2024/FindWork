const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { db } = require('./db');
const { usuarios, puestos, aplicaciones, archivos } = require('../shared/schema');
const { eq, and, desc } = require('drizzle-orm');
const emailService = require('./utils/emailService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://your-domain.com'
    : ['http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Crear directorio uploads si no existe
fs.ensureDirSync(path.join(__dirname, 'uploads', 'profiles'));
fs.ensureDirSync(path.join(__dirname, 'uploads', 'cvs'));
fs.ensureDirSync(path.join(__dirname, 'uploads', 'documents'));

// JWT Secret
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
    const fileType = req.body.fileType || 'documents';
    const userId = req.user?.id || 'unknown';
    const userPrefix = req.user?.tipo === 'empresa' ? 'empresa_' : '';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    
    cb(null, `${userPrefix}${userId}_${timestamp}_${fileType}${extension}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Servir archivos estáticos de forma segura
app.use('/uploads', authenticateToken, (req, res, next) => {
  const filePath = req.path;
  const userId = req.user.id;
  
  const userFilePattern = new RegExp(`^/(profiles|cvs|documents)/(empresa_)?${userId}_`);
  if (userFilePattern.test(filePath)) {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado al archivo' });
  }
}, express.static(path.join(__dirname, 'uploads')));

// === RUTAS DE AUTENTICACIÓN ===

// Login con detección automática de tipo de usuario
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = null;
    
    // Verificar si es admin (hardcoded por ahora)
    if (email === 'admin' && password === 'admin') {
      user = { id: 1, nombre: 'Administrador', email: 'admin', tipo_usuario: 'admin' };
    } else {
      // Buscar usuario en la base de datos
      const [foundUser] = await db.select().from(usuarios).where(eq(usuarios.email, email));
      
      if (foundUser) {
        // Verificar contraseña (por ahora sin encriptación para desarrollo)
        if (password === 'demo' || password === 'test') {
          user = foundUser;
        } else {
          return res.status(401).json({ error: 'Contraseña incorrecta. Usa "demo" o "test"' });
        }
      }
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email || email, 
        tipo: user.tipo_usuario,
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
        tipo: user.tipo_usuario
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// === RUTAS PARA EMPLEADOS ===

// Obtener perfil del empleado
app.get('/api/empleado/perfil', authenticateToken, async (req, res) => {
  try {
    const [empleado] = await db.select().from(usuarios)
      .where(and(eq(usuarios.id, req.user.id), eq(usuarios.tipo_usuario, 'empleado')));
    
    if (!empleado) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }
    
    // Mapear a formato compatible con frontend
    res.json({
      idCandidatos: empleado.id,
      Nombre_Candidatos: empleado.nombre,
      Correo_Candidatos: empleado.email,
      Numero_Candidatos: empleado.telefono || '555-0123',
      Experiencia: empleado.experiencia || 'Sin experiencia registrada',
      Documentos: 'CV actualizado disponible',
      descripcion: empleado.descripcion,
      foto_perfil: empleado.foto_perfil,
      fecha_actualizacion: empleado.fechaActualizacion
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar perfil del empleado
app.put('/api/empleado/perfil', authenticateToken, async (req, res) => {
  const { nombre, descripcion, telefono, experiencia } = req.body;
  
  try {
    const [updatedUser] = await db.update(usuarios)
      .set({
        nombre: nombre,
        descripcion: descripcion,
        telefono: telefono,
        experiencia: experiencia,
        fechaActualizacion: new Date()
      })
      .where(and(eq(usuarios.id, req.user.id), eq(usuarios.tipo_usuario, 'empleado')))
      .returning();
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }
    
    res.json({ 
      message: 'Perfil actualizado exitosamente',
      empleado: updatedUser
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener vacantes
app.get('/api/empleado/vacantes', authenticateToken, async (req, res) => {
  try {
    const vacantes = await db.select({
      idPuestos: puestos.id,
      Tipo_Puesto: puestos.titulo,
      Salario: puestos.salario,
      Horario: puestos.horario,
      Ubicacion: puestos.ubicacion,
      Nombre_Empresa: usuarios.nombre,
      experiencia: puestos.experienciaRequerida,
      fechaCreacion: puestos.fechaCreacion
    })
    .from(puestos)
    .innerJoin(usuarios, eq(puestos.empresaId, usuarios.id))
    .where(eq(puestos.activo, true))
    .orderBy(desc(puestos.fechaCreacion));
    
    res.json(vacantes);
  } catch (error) {
    console.error('Error obteniendo vacantes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// === RUTAS PARA EMPRESAS ===

// Obtener perfil de empresa
app.get('/api/empresa/perfil', authenticateToken, async (req, res) => {
  try {
    const [empresa] = await db.select().from(usuarios)
      .where(and(eq(usuarios.id, req.user.id), eq(usuarios.tipo_usuario, 'empresa')));
    
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    
    // Mapear a formato compatible con frontend
    res.json({
      idEmpresa: empresa.id,
      Nombre_Empresa: empresa.nombre,
      Correo_Empresa: empresa.email,
      Ubicacion: empresa.ubicacion || 'No especificada',
      descripcion: empresa.descripcion,
      foto_perfil: empresa.foto_perfil,
      fecha_actualizacion: empresa.fechaActualizacion
    });
  } catch (error) {
    console.error('Error obteniendo perfil de empresa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Inicializar con datos de ejemplo si la base de datos está vacía
async function initializeDatabase() {
  try {
    const existingUsers = await db.select().from(usuarios).limit(1);
    
    if (existingUsers.length === 0) {
      console.log('📋 Inicializando base de datos con datos de ejemplo...');
      
      // Crear usuarios de ejemplo
      const sampleUsers = [
        {
          nombre: 'Juan Pérez',
          email: 'juan@email.com',
          password: 'demo',
          tipo_usuario: 'empleado',
          telefono: '555-0123',
          experiencia: 'Desarrollador con 3 años de experiencia'
        },
        {
          nombre: 'María García',
          email: 'maria@email.com',
          password: 'demo',
          tipo_usuario: 'empleado',
          telefono: '555-0124',
          experiencia: 'Diseñadora UX/UI con 2 años de experiencia'
        },
        {
          nombre: 'PowerMan',
          email: 'Powerman@gmail.com',
          password: 'demo',
          tipo_usuario: 'empleado',
          telefono: '555-1234',
          experiencia: 'Especialista en desarrollo fullstack'
        },
        {
          nombre: 'Tech Solutions',
          email: 'admin@techsolutions.com',
          password: 'demo',
          tipo_usuario: 'empresa',
          telefono: '555-9000',
          ubicacion: 'Ciudad de México',
          descripcion: 'Empresa líder en soluciones tecnológicas'
        },
        {
          nombre: 'InnovaCorp',
          email: 'hr@innovacorp.com',
          password: 'demo',
          tipo_usuario: 'empresa',
          telefono: '555-9001',
          ubicacion: 'Guadalajara',
          descripcion: 'Innovación y desarrollo de software'
        }
      ];
      
      await db.insert(usuarios).values(sampleUsers);
      console.log('✅ Datos de ejemplo insertados exitosamente');
    }
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
  }
}

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log('🔗 PostgreSQL conectado exitosamente');
  await initializeDatabase();
});

// Manejar errores de conexión
process.on('unhandledRejection', (err) => {
  console.error('❌ Error no manejado:', err);
  process.exit(1);
});

module.exports = app;