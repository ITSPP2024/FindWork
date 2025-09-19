const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('./utils/emailService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'admin',
  database: 'powerman'
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('⚠️  Error conectando a MySQL:', err.message);
    console.log('💡 La aplicación funcionará con datos simulados.');
    console.log('📋 Para conectar a tu MySQL local:');
    console.log('   1. Asegúrate de que MySQL esté ejecutándose en tu computadora');
    console.log('   2. Configura el acceso remoto en MySQL Workbench');
    console.log('   3. Usa la IP de tu computadora en lugar de localhost');
    return;
  }
  console.log('✅ Conectado a MySQL database: powerman');
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'findwork_secret_key';

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
db.ping((err) => {
  if (!err) {
    isMySQL = true;
    console.log('🔗 MySQL está disponible');
  }
});

const datosSimulados = {
  empleados: [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@email.com', tipo: 'empleado' },
    { id: 2, nombre: 'María García', email: 'maria@email.com', tipo: 'empleado' }
  ],
  empresas: [
    { id: 1, nombre: 'Tech Solutions', email: 'admin@techsolutions.com', tipo: 'empresa' },
    { id: 2, nombre: 'InnovaCorp', email: 'hr@innovacorp.com', tipo: 'empresa' }
  ],
  vacantes: [
    { 
      idPuestos: 1, 
      Tipo_Puesto: 'Desarrollador Frontend', 
      Salario: '45000', 
      Horario: 'Tiempo completo', 
      Ubicacion: 'Ciudad de México', 
      Nombre_Empresa: 'Tech Solutions',
      experiencia: 'Mid Level',
      fechaCreacion: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // Hace 8 días
    },
    { 
      idPuestos: 2, 
      Tipo_Puesto: 'Diseñador UX/UI', 
      Salario: '38000', 
      Horario: 'Tiempo completo', 
      Ubicacion: 'Guadalajara', 
      Nombre_Empresa: 'Creative Studio',
      experiencia: 'Junior',
      fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // Hace 2 días
    },
    {
      idPuestos: 3,
      Tipo_Puesto: 'Desarrollador Backend',
      Salario: '55000',
      Horario: 'Tiempo completo',
      Ubicacion: 'Monterrey',
      Nombre_Empresa: 'DataCorp',
      experiencia: 'Senior',
      fechaCreacion: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString() // Hace 12 horas (hoy)
    },
    {
      idPuestos: 4,
      Tipo_Puesto: 'Analista de Datos',
      Salario: '42000',
      Horario: 'Medio tiempo',
      Ubicacion: 'Ciudad de México',
      Nombre_Empresa: 'Analytics Pro',
      experiencia: 'Mid Level',
      fechaCreacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // Hace 3 días
    },
    {
      idPuestos: 5,
      Tipo_Puesto: 'DevOps Engineer',
      Salario: '65000',
      Horario: 'Tiempo completo',
      Ubicacion: 'Remoto',
      Nombre_Empresa: 'CloudTech',
      experiencia: 'Senior',
      fechaCreacion: new Date(Date.now() - 0.2 * 24 * 60 * 60 * 1000).toISOString() // Hace 5 horas (hoy)
    },
    {
      idPuestos: 6,
      Tipo_Puesto: 'Desarrollador Mobile',
      Salario: '48000',
      Horario: 'Tiempo completo',
      Ubicacion: 'Tijuana',
      Nombre_Empresa: 'AppVentures',
      experiencia: 'Mid Level',
      fechaCreacion: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // Hace 4 días
    },
    {
      idPuestos: 7,
      Tipo_Puesto: 'Practicante Desarrollo',
      Salario: '15000',
      Horario: 'Prácticas',
      Ubicacion: 'Puebla',
      Nombre_Empresa: 'StartupLab',
      experiencia: 'Entry Level',
      fechaCreacion: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000).toISOString() // Hace 2 horas (hoy)
    },
    {
      idPuestos: 8,
      Tipo_Puesto: 'Tech Lead',
      Salario: '85000',
      Horario: 'Tiempo completo',
      Ubicacion: 'Mérida',
      Nombre_Empresa: 'InnovaCorp',
      experiencia: 'Lead',
      fechaCreacion: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // Hace 10 días
    },
    {
      idPuestos: 9,
      Tipo_Puesto: 'QA Engineer',
      Salario: '40000',
      Horario: 'Tiempo completo',
      Ubicacion: 'Ciudad de México',
      Nombre_Empresa: 'TestCorp',
      experiencia: 'Mid Level',
      fechaCreacion: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // Hace 15 días
    }
  ]
};

// === RUTAS DE AUTENTICACIÓN ===

// Login
app.post('/api/login', (req, res) => {
  const { email, password, userType } = req.body;

  let query = '';
  let table = '';

  switch (userType) {
    case 'empleado':
      query = 'SELECT idCandidatos as id, Nombre_Candidatos as nombre, Correo_Candidatos as email, "empleado" as tipo FROM candidatos WHERE Correo_Candidatos = ?';
      break;
    case 'empresa':
      query = 'SELECT idEmpresa as id, Nombre_Empresa as nombre, Correo_Empresa as email, "empresa" as tipo FROM empresa WHERE Correo_Empresa = ?';
      break;
    case 'admin':
      query = 'SELECT idUsuarios as id, Tipo as nombre, Contraseña as password, "admin" as tipo FROM usuarios WHERE Tipo = "admin"';
      break;
    default:
      return res.status(400).json({ error: 'Tipo de usuario inválido' });
  }

  // Si MySQL no está disponible, usar datos simulados
  if (!isMySQL) {
    let user = null;
    
    if (userType === 'empleado') {
      user = datosSimulados.empleados.find(emp => emp.email === email);
      // En modo simulado, requerir contraseña "demo" para consistencia
      if (password !== 'demo' && password !== 'test') {
        return res.status(401).json({ error: 'Contraseña incorrecta. Usa "demo" o "test"' });
      }
    } else if (userType === 'empresa') {
      user = datosSimulados.empresas.find(emp => emp.email === email);
      // En modo simulado, requerir contraseña "demo" para consistencia
      if (password !== 'demo' && password !== 'test') {
        return res.status(401).json({ error: 'Contraseña incorrecta. Usa "demo" o "test"' });
      }
    } else if (userType === 'admin' && email === 'admin' && password === 'admin') {
      user = { id: 1, nombre: 'Administrador', email: 'admin', tipo: 'admin' };
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

  // Usar MySQL si está disponible
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Error en login:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = results[0];
    
    // IMPORTANTE: En producción con MySQL, aquí deberías verificar contraseñas hasheadas
    // Por ahora, para desarrollo local, se permite acceso sin verificación de contraseña
    // TODO: Implementar bcrypt.compare() cuando tengas contraseñas hasheadas en MySQL
    console.log('⚠️  ADVERTENCIA: Verificación de contraseña deshabilitada para desarrollo');
    console.log('💡 En producción, implementar verificación con bcrypt para seguridad');
    
    if (userType === 'admin') {
      if (password !== 'admin') {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
    }

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
  });
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
      ...empleado,
      Nombre_Candidatos: empleado.nombre,
      Correo_Candidatos: empleado.email,
      Numero_Candidatos: '555-0123',
      Experiencia: 'Desarrollador con 3 años de experiencia en tecnologías web',
      Documentos: 'CV actualizado disponible',
      Observaciones: 'Candidato proactivo y con ganas de aprender'
    });
  }
  
  const query = `
    SELECT c.*, e.Documentos, e.Fecha_Registro, e.Observaciones, e.Experiencia 
    FROM candidatos c 
    LEFT JOIN expedientes e ON c.idCandidatos = e.candidatos_idCandidatos 
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

// Obtener vacantes disponibles
app.get('/api/vacantes', authenticateToken, requireRole('empleado'), (req, res) => {
  if (!isMySQL) {
    return res.json(datosSimulados.vacantes);
  }
  
  const query = `
    SELECT p.*, e.Nombre_Empresa, e.Ubicacion 
    FROM puestos p 
    JOIN empresa e ON p.empresa_idEmpresa = e.idEmpresa 
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
      ...empresa,
      Nombre_Empresa: empresa.nombre,
      Correo_Empresa: empresa.email,
      Numero_Empresas: '555-0100',
      Ubicacion: 'Ciudad de México'
    });
  }
  
  const query = 'SELECT * FROM empresa WHERE idEmpresa = ?';
  
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
  
  const query = 'INSERT INTO puestos (Tipo_Puesto, Salario, Horario, Ubicacion, empresa_idEmpresa) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [tipo_puesto, salario, horario, ubicacion, empresaId], (err, results) => {
    if (err) {
      console.error('Error creando vacante:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.json({ 
      message: 'Vacante creada exitosamente',
      id: results.insertId 
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
  
  const query = 'SELECT * FROM puestos WHERE empresa_idEmpresa = ? ORDER BY idPuestos DESC';
  
  db.query(query, [id], (err, results) => {
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
    vacantes: 'SELECT COUNT(*) as total FROM puestos',
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
            JOIN empresa e ON p.empresa_idEmpresa = e.idEmpresa
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
    JOIN empresa e ON p.empresa_idEmpresa = e.idEmpresa
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
    // Datos simulados
    const aplicacionesSimuladas = [
      {
        idAplicacion: 1,
        candidato_nombre: 'Juan Pérez',
        candidato_email: 'juan@email.com',
        puesto_titulo: 'Desarrollador Frontend',
        estado: 'pendiente',
        fecha_aplicacion: '2024-01-15',
        salario_esperado: 25000,
        carta_presentacion: 'Me interesa mucho esta posición...'
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
      a.notas_empresa,
      c.Nombre_Candidatos as candidato_nombre,
      c.Correo_Candidatos as candidato_email,
      c.Numero_Candidatos as candidato_telefono,
      p.Tipo_Puesto as puesto_titulo,
      p.idPuestos as puesto_id
    FROM aplicaciones a
    JOIN candidatos c ON a.candidato_id = c.idCandidatos
    JOIN puestos p ON a.puesto_id = p.idPuestos
    WHERE p.empresa_idEmpresa = ?
    ORDER BY a.fecha_aplicacion DESC
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error obteniendo aplicaciones de empresa:', err);
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
    return res.json({ message: 'Estado actualizado exitosamente (simulado)' });
  }

  // Verificar que la aplicación pertenece a una vacante de esta empresa
  const verifyQuery = `
    SELECT a.idAplicacion 
    FROM aplicaciones a
    JOIN puestos p ON a.puesto_id = p.idPuestos
    WHERE a.idAplicacion = ? AND p.empresa_idEmpresa = ?
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
    JOIN empresa e ON p.empresa_idEmpresa = e.idEmpresa
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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});