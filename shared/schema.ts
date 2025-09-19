import { pgTable, serial, varchar, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabla unificada de usuarios con campo Tipo_Usuario
export const usuarios = pgTable('usuarios', {
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
export const puestos = pgTable('puestos', {
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
export const aplicaciones = pgTable('aplicaciones', {
  id: serial('id').primaryKey(),
  empleadoId: integer('empleado_id').notNull(),
  puestoId: integer('puesto_id').notNull(),
  estado: varchar('estado', { length: 50 }).default('pendiente'), // 'pendiente', 'aceptada', 'rechazada'
  fechaAplicacion: timestamp('fecha_aplicacion').defaultNow()
});

// Tabla de archivos/documentos
export const archivos = pgTable('archivos', {
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
export const usuariosRelations = relations(usuarios, ({ many }) => ({
  puestosCreados: many(puestos),
  aplicaciones: many(aplicaciones),
  archivos: many(archivos)
}));

export const puestosRelations = relations(puestos, ({ one, many }) => ({
  empresa: one(usuarios, {
    fields: [puestos.empresaId],
    references: [usuarios.id]
  }),
  aplicaciones: many(aplicaciones)
}));

export const aplicacionesRelations = relations(aplicaciones, ({ one }) => ({
  empleado: one(usuarios, {
    fields: [aplicaciones.empleadoId],
    references: [usuarios.id]
  }),
  puesto: one(puestos, {
    fields: [aplicaciones.puestoId],
    references: [puestos.id]
  })
}));

export const archivosRelations = relations(archivos, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [archivos.usuarioId],
    references: [usuarios.id]
  })
}));

// Tipos TypeScript
export type Usuario = typeof usuarios.$inferSelect;
export type InsertUsuario = typeof usuarios.$inferInsert;
export type Puesto = typeof puestos.$inferSelect;
export type InsertPuesto = typeof puestos.$inferInsert;
export type Aplicacion = typeof aplicaciones.$inferSelect;
export type InsertAplicacion = typeof aplicaciones.$inferInsert;
export type Archivo = typeof archivos.$inferSelect;
export type InsertArchivo = typeof archivos.$inferInsert;