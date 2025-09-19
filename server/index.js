const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
    { idPuestos: 1, Tipo_Puesto: 'Desarrollador Frontend', Salario: 25000, Horario: '9:00-18:00', Ubicacion: 'Ciudad de México', Nombre_Empresa: 'Tech Solutions' },
    { idPuestos: 2, Tipo_Puesto: 'Diseñador UX/UI', Salario: 22000, Horario: '9:00-17:00', Ubicacion: 'Guadalajara', Nombre_Empresa: 'InnovaCorp' }
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
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});