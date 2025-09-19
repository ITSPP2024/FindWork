const { pgTable, serial, varchar, text, timestamp, integer, boolean } = require('drizzle-orm/pg-core');
const { relations } = require('drizzle-orm');

// Tabla unificada de usuarios con campo Tipo_Usuario
const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  tipo_usuario: varchar('tipo_usuario', { length: 50 }).notNull(), // 'empleado', 'empresa', 'admin'
  telefono: varchar('telefono', { length: 20 }),
  descripcion: text('descripcion'),
  experiencia: text('experiencia'),
  foto_perfil: varchar('foto_perfil', { length: 500 }),
  // Campos específicos para empresas
  ubicacion: varchar('ubicacion', { length: 255 }),
  // Timestamps
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
  fechaActualizacion: timestamp('fecha_actualizacion').defaultNow()
});

// Tabla de puestos de trabajo
const puestos = pgTable('puestos', {
  id: serial('id').primaryKey(),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  salario: varchar('salario', { length: 100 }),
  horario: varchar('horario', { length: 100 }),
  ubicacion: varchar('ubicacion', { length: 255 }),
  experienciaRequerida: varchar('experiencia_requerida', { length: 255 }),
  activo: boolean('activo').default(true),
  empresaId: integer('empresa_id').notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
  fechaActualizacion: timestamp('fecha_actualizacion').defaultNow()
});

// Tabla de aplicaciones/postulaciones
const aplicaciones = pgTable('aplicaciones', {
  id: serial('id').primaryKey(),
  empleadoId: integer('empleado_id').notNull(),
  puestoId: integer('puesto_id').notNull(),
  estado: varchar('estado', { length: 50 }).default('pendiente'), // 'pendiente', 'aceptada', 'rechazada'
  fechaAplicacion: timestamp('fecha_aplicacion').defaultNow()
});

// Tabla de archivos/documentos
const archivos = pgTable('archivos', {
  id: serial('id').primaryKey(),
  nombreOriginal: varchar('nombre_original', { length: 255 }).notNull(),
  nombreArchivo: varchar('nombre_archivo', { length: 255 }).notNull(),
  tipoArchivo: varchar('tipo_archivo', { length: 100 }),
  tamano: integer('tamano'),
  rutaArchivo: varchar('ruta_archivo', { length: 500 }),
  usuarioId: integer('usuario_id').notNull(),
  tipoDocumento: varchar('tipo_documento', { length: 100 }), // 'cv', 'perfil', 'documento'
  fechaSubida: timestamp('fecha_subida').defaultNow()
});

// Relaciones
const usuariosRelations = relations(usuarios, ({ many }) => ({
  puestosCreados: many(puestos),
  aplicaciones: many(aplicaciones),
  archivos: many(archivos)
}));

const puestosRelations = relations(puestos, ({ one, many }) => ({
  empresa: one(usuarios, {
    fields: [puestos.empresaId],
    references: [usuarios.id]
  }),
  aplicaciones: many(aplicaciones)
}));

const aplicacionesRelations = relations(aplicaciones, ({ one }) => ({
  empleado: one(usuarios, {
    fields: [aplicaciones.empleadoId],
    references: [usuarios.id]
  }),
  puesto: one(puestos, {
    fields: [aplicaciones.puestoId],
    references: [puestos.id]
  })
}));

const archivosRelations = relations(archivos, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [archivos.usuarioId],
    references: [usuarios.id]
  })
}));

module.exports = {
  usuarios,
  puestos,
  aplicaciones,
  archivos,
  usuariosRelations,
  puestosRelations,
  aplicacionesRelations,
  archivosRelations
};