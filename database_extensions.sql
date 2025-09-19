-- ================================================
-- FINDWORK - EXTENSIONES DE BASE DE DATOS
-- Nuevas tablas para funcionalidades avanzadas
-- ================================================

-- 1. TABLA DE APLICACIONES
-- Para que empleados apliquen a vacantes
CREATE TABLE IF NOT EXISTS aplicaciones (
    idAplicacion INT AUTO_INCREMENT PRIMARY KEY,
    candidato_id INT NOT NULL,
    puesto_id INT NOT NULL,
    fecha_aplicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'revisando', 'entrevista', 'aceptado', 'rechazado') DEFAULT 'pendiente',
    carta_presentacion TEXT,
    salario_esperado DECIMAL(10,2),
    disponibilidad VARCHAR(100),
    notas_empresa TEXT,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidato_id) REFERENCES candidatos(idCandidatos),
    FOREIGN KEY (puesto_id) REFERENCES puestos(idPuestos),
    UNIQUE KEY unique_application (candidato_id, puesto_id)
);

-- 2. TABLA DE FAVORITOS
-- Para que empleados guarden vacantes de interés
CREATE TABLE IF NOT EXISTS favoritos (
    idFavorito INT AUTO_INCREMENT PRIMARY KEY,
    candidato_id INT NOT NULL,
    puesto_id INT NOT NULL,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notas_personales TEXT,
    FOREIGN KEY (candidato_id) REFERENCES candidatos(idCandidatos),
    FOREIGN KEY (puesto_id) REFERENCES puestos(idPuestos),
    UNIQUE KEY unique_favorite (candidato_id, puesto_id)
);

-- 3. TABLA DE ARCHIVOS
-- Para subir CVs, documentos, fotos de perfil
CREATE TABLE IF NOT EXISTS archivos (
    idArchivo INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    usuario_tipo ENUM('candidato', 'empresa') NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(100) NOT NULL,
    tamaño_archivo BIGINT NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_documento ENUM('cv', 'carta_presentacion', 'certificado', 'foto_perfil', 'otro') DEFAULT 'otro',
    es_publico BOOLEAN DEFAULT FALSE,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usuario (usuario_id, usuario_tipo)
);

-- 4. TABLA DE MENSAJES
-- Sistema de chat entre empresas y candidatos
CREATE TABLE IF NOT EXISTS mensajes (
    idMensaje INT AUTO_INCREMENT PRIMARY KEY,
    conversacion_id VARCHAR(100) NOT NULL,
    remitente_id INT NOT NULL,
    remitente_tipo ENUM('candidato', 'empresa', 'admin') NOT NULL,
    destinatario_id INT NOT NULL,
    destinatario_tipo ENUM('candidato', 'empresa', 'admin') NOT NULL,
    mensaje TEXT NOT NULL,
    archivo_adjunto INT NULL,
    leido BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (archivo_adjunto) REFERENCES archivos(idArchivo),
    INDEX idx_conversacion (conversacion_id),
    INDEX idx_destinatario (destinatario_id, destinatario_tipo)
);

-- 5. TABLA DE ENTREVISTAS
-- Calendario y gestión de entrevistas
CREATE TABLE IF NOT EXISTS entrevistas (
    idEntrevista INT AUTO_INCREMENT PRIMARY KEY,
    aplicacion_id INT NOT NULL,
    fecha_hora DATETIME NOT NULL,
    duracion_minutos INT DEFAULT 60,
    modalidad ENUM('presencial', 'virtual', 'telefonica') DEFAULT 'virtual',
    ubicacion_enlace TEXT,
    estado ENUM('programada', 'confirmada', 'completada', 'cancelada', 'reprogramada') DEFAULT 'programada',
    notas_empresa TEXT,
    notas_candidato TEXT,
    puntuacion_candidato INT CHECK (puntuacion_candidato BETWEEN 1 AND 10),
    feedback_empresa TEXT,
    feedback_candidato TEXT,
    entrevistador VARCHAR(200),
    fecha_programacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aplicacion_id) REFERENCES aplicaciones(idAplicacion),
    INDEX idx_fecha (fecha_hora),
    INDEX idx_estado (estado)
);

-- 6. TABLA DE NOTIFICACIONES
-- Sistema de notificaciones para usuarios
CREATE TABLE IF NOT EXISTS notificaciones (
    idNotificacion INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    usuario_tipo ENUM('candidato', 'empresa', 'admin') NOT NULL,
    tipo ENUM('aplicacion', 'mensaje', 'entrevista', 'favorito', 'sistema') NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    enlace VARCHAR(500),
    leida BOOLEAN DEFAULT FALSE,
    enviada_email BOOLEAN DEFAULT FALSE,
    enviada_sms BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_leida TIMESTAMP NULL,
    INDEX idx_usuario (usuario_id, usuario_tipo, leida),
    INDEX idx_fecha (fecha_creacion)
);

-- 7. TABLA DE CALIFICACIONES
-- Sistema de reviews y ratings
CREATE TABLE IF NOT EXISTS calificaciones (
    idCalificacion INT AUTO_INCREMENT PRIMARY KEY,
    evaluador_id INT NOT NULL,
    evaluador_tipo ENUM('candidato', 'empresa') NOT NULL,
    evaluado_id INT NOT NULL,
    evaluado_tipo ENUM('candidato', 'empresa') NOT NULL,
    puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario TEXT,
    aplicacion_id INT,
    es_publico BOOLEAN DEFAULT TRUE,
    fecha_calificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aplicacion_id) REFERENCES aplicaciones(idAplicacion),
    INDEX idx_evaluado (evaluado_id, evaluado_tipo),
    UNIQUE KEY unique_rating (evaluador_id, evaluador_tipo, evaluado_id, evaluado_tipo, aplicacion_id)
);

-- 8. TABLA DE PLANTILLAS DE VACANTES
-- Templates para que empresas creen vacantes más rápido
CREATE TABLE IF NOT EXISTS plantillas_vacantes (
    idPlantilla INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombre_plantilla VARCHAR(200) NOT NULL,
    tipo_puesto VARCHAR(200) NOT NULL,
    descripcion TEXT,
    requisitos TEXT,
    beneficios TEXT,
    horario VARCHAR(100),
    modalidad ENUM('presencial', 'remoto', 'hibrido') DEFAULT 'presencial',
    experiencia_minima INT DEFAULT 0,
    es_activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresa(idEmpresa),
    INDEX idx_empresa (empresa_id, es_activa)
);

-- 9. TABLA DE CONFIGURACIONES DE USUARIO
-- Preferencias y configuraciones personalizadas
CREATE TABLE IF NOT EXISTS configuraciones_usuario (
    idConfiguracion INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    usuario_tipo ENUM('candidato', 'empresa', 'admin') NOT NULL,
    notificaciones_email BOOLEAN DEFAULT TRUE,
    notificaciones_sms BOOLEAN DEFAULT FALSE,
    notificaciones_aplicaciones BOOLEAN DEFAULT TRUE,
    notificaciones_mensajes BOOLEAN DEFAULT TRUE,
    notificaciones_entrevistas BOOLEAN DEFAULT TRUE,
    perfil_publico BOOLEAN DEFAULT TRUE,
    busqueda_activa BOOLEAN DEFAULT TRUE,
    salario_minimo DECIMAL(10,2),
    salario_maximo DECIMAL(10,2),
    ubicaciones_preferidas TEXT,
    modalidades_preferidas SET('presencial', 'remoto', 'hibrido'),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_config (usuario_id, usuario_tipo)
);

-- 10. TABLA DE ESTADÍSTICAS DETALLADAS
-- Para analytics y reportes avanzados
CREATE TABLE IF NOT EXISTS estadisticas (
    idEstadistica INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    tipo_evento ENUM('aplicacion', 'registro', 'login', 'mensaje', 'entrevista', 'calificacion') NOT NULL,
    usuario_tipo ENUM('candidato', 'empresa', 'admin'),
    cantidad INT DEFAULT 1,
    datos_adicionales JSON,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_daily_stat (fecha, tipo_evento, usuario_tipo),
    INDEX idx_fecha (fecha),
    INDEX idx_tipo (tipo_evento)
);

-- ================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ================================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_aplicaciones_estado ON aplicaciones(estado, fecha_aplicacion);
CREATE INDEX idx_aplicaciones_candidato ON aplicaciones(candidato_id, estado);
CREATE INDEX idx_aplicaciones_puesto ON aplicaciones(puesto_id, estado);

CREATE INDEX idx_mensajes_conversacion ON mensajes(conversacion_id, fecha_envio);
CREATE INDEX idx_mensajes_no_leidos ON mensajes(destinatario_id, destinatario_tipo, leido);

CREATE INDEX idx_entrevistas_empresa ON entrevistas(aplicacion_id, estado, fecha_hora);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id, usuario_tipo, fecha_creacion);

-- ================================================
-- DATOS DE EJEMPLO PARA TESTING
-- ================================================

-- Configuraciones por defecto para usuarios existentes
INSERT IGNORE INTO configuraciones_usuario (usuario_id, usuario_tipo, usuario_tipo) 
SELECT idCandidatos, 'candidato', 'candidato' FROM candidatos;

INSERT IGNORE INTO configuraciones_usuario (usuario_id, usuario_tipo, usuario_tipo) 
SELECT idEmpresa, 'empresa', 'empresa' FROM empresa;

-- Plantilla de ejemplo
INSERT IGNORE INTO plantillas_vacantes (empresa_id, nombre_plantilla, tipo_puesto, descripcion, requisitos, beneficios, horario, modalidad, experiencia_minima) VALUES
(1, 'Desarrollador Jr', 'Desarrollador Junior', 'Posición para desarrollador con ganas de aprender y crecer', 'Conocimientos básicos de programación, buena actitud', 'Crecimiento profesional, ambiente joven', '9:00-18:00', 'hibrido', 0);

-- Estadísticas iniciales
INSERT IGNORE INTO estadisticas (fecha, tipo_evento, usuario_tipo, cantidad) VALUES
(CURDATE(), 'registro', 'candidato', 0),
(CURDATE(), 'registro', 'empresa', 0),
(CURDATE(), 'aplicacion', NULL, 0),
(CURDATE(), 'mensaje', NULL, 0);