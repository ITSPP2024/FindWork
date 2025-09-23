import { pgTable, serial, text, varchar, integer, decimal, timestamp, boolean, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum definitions
export const userTypeEnum = pgEnum('user_type', ['candidato', 'empresa', 'admin']);
export const applicationStatusEnum = pgEnum('application_status', ['pendiente', 'revisando', 'entrevista', 'aceptado', 'rechazado']);
export const documentTypeEnum = pgEnum('document_type', ['cv', 'carta_presentacion', 'certificado', 'foto_perfil', 'otro']);
export const modalityEnum = pgEnum('modality', ['presencial', 'remoto', 'hibrido']);
export const interviewStatusEnum = pgEnum('interview_status', ['programada', 'confirmada', 'completada', 'cancelada', 'reprogramada']);
export const notificationTypeEnum = pgEnum('notification_type', ['aplicacion', 'mensaje', 'entrevista', 'favorito', 'sistema']);

// Core tables - Candidates (empleados)
export const candidatos = pgTable('candidatos', {
  idCandidatos: serial('idCandidatos').primaryKey(),
  Nombre_Candidatos: varchar('Nombre_Candidatos', { length: 200 }).notNull(),
  Correo_Candidatos: varchar('Correo_Candidatos', { length: 200 }).notNull().unique(),
  Numero_Candidatos: varchar('Numero_Candidatos', { length: 20 }),
  descripcion: text('descripcion'),
  foto_perfil: varchar('foto_perfil', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Core tables - Companies (empresas)
export const empresa = pgTable('empresa', {
  idEmpresa: serial('idEmpresa').primaryKey(),
  Nombre_Empresa: varchar('Nombre_Empresa', { length: 200 }).notNull(),
  Correo_Empresa: varchar('Correo_Empresa', { length: 200 }).notNull().unique(),
  Telefono_Empresa: varchar('Telefono_Empresa', { length: 20 }),
  Ubicacion: varchar('Ubicacion', { length: 300 }),
  descripcion: text('descripcion'),
  foto_perfil: varchar('foto_perfil', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Job positions (puestos)
export const puestos = pgTable('puestos', {
  idPuestos: serial('idPuestos').primaryKey(),
  Tipo_Puesto: varchar('Tipo_Puesto', { length: 200 }).notNull(),
  Salario: decimal('Salario', { precision: 10, scale: 2 }),
  Horario: varchar('Horario', { length: 100 }),
  Ubicacion: varchar('Ubicacion', { length: 300 }),
  descripcion: text('descripcion'),
  requisitos: text('requisitos'),
  beneficios: text('beneficios'),
  modalidad: modalityEnum('modalidad').default('presencial'),
  experiencia_minima: integer('experiencia_minima').default(0),
  empresa_id: integer('empresa_id').notNull().references(() => empresa.idEmpresa),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Experience records (expedientes)
export const expedientes = pgTable('expedientes', {
  idExpediente: serial('idExpediente').primaryKey(),
  candidato_id: integer('candidato_id').notNull().references(() => candidatos.idCandidatos),
  Experiencia: text('Experiencia'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  uniqueCandidato: uniqueIndex('unique_candidato_expediente').on(table.candidato_id)
}));

// Applications table
export const aplicaciones = pgTable('aplicaciones', {
  idAplicacion: serial('idAplicacion').primaryKey(),
  candidato_id: integer('candidato_id').notNull().references(() => candidatos.idCandidatos),
  puesto_id: integer('puesto_id').notNull().references(() => puestos.idPuestos),
  fecha_aplicacion: timestamp('fecha_aplicacion').defaultNow(),
  estado: applicationStatusEnum('estado').default('pendiente'),
  carta_presentacion: text('carta_presentacion'),
  salario_esperado: decimal('salario_esperado', { precision: 10, scale: 2 }),
  disponibilidad: varchar('disponibilidad', { length: 100 }),
  notas_empresa: text('notas_empresa'),
  fecha_actualizacion: timestamp('fecha_actualizacion').defaultNow()
}, (table) => ({
  uniqueApplication: uniqueIndex('unique_application').on(table.candidato_id, table.puesto_id),
  estadoIndex: index('idx_aplicaciones_estado').on(table.estado, table.fecha_aplicacion),
  candidatoIndex: index('idx_aplicaciones_candidato').on(table.candidato_id, table.estado),
  puestoIndex: index('idx_aplicaciones_puesto').on(table.puesto_id, table.estado)
}));

// Favorites table
export const favoritos = pgTable('favoritos', {
  idFavorito: serial('idFavorito').primaryKey(),
  candidato_id: integer('candidato_id').notNull().references(() => candidatos.idCandidatos),
  puesto_id: integer('puesto_id').notNull().references(() => puestos.idPuestos),
  fecha_agregado: timestamp('fecha_agregado').defaultNow(),
  notas_personales: text('notas_personales')
}, (table) => ({
  uniqueFavorite: uniqueIndex('unique_favorite').on(table.candidato_id, table.puesto_id)
}));

// Files table
export const archivos = pgTable('archivos', {
  idArchivo: serial('idArchivo').primaryKey(),
  usuario_id: integer('usuario_id').notNull(),
  usuario_tipo: userTypeEnum('usuario_tipo').notNull(),
  nombre_archivo: varchar('nombre_archivo', { length: 255 }).notNull(),
  nombre_original: varchar('nombre_original', { length: 255 }).notNull(),
  tipo_archivo: varchar('tipo_archivo', { length: 100 }).notNull(),
  tamaño_archivo: integer('tamaño_archivo').notNull(),
  ruta_archivo: varchar('ruta_archivo', { length: 500 }).notNull(),
  tipo_documento: documentTypeEnum('tipo_documento').default('otro'),
  es_publico: boolean('es_publico').default(false),
  fecha_subida: timestamp('fecha_subida').defaultNow()
}, (table) => ({
  usuarioIndex: index('idx_usuario_archivo').on(table.usuario_id, table.usuario_tipo)
}));

// Relations
export const candidatosRelations = relations(candidatos, ({ one, many }) => ({
  expediente: one(expedientes, {
    fields: [candidatos.idCandidatos],
    references: [expedientes.candidato_id]
  }),
  aplicaciones: many(aplicaciones),
  favoritos: many(favoritos)
}));

export const empresaRelations = relations(empresa, ({ many }) => ({
  puestos: many(puestos)
}));

export const puestosRelations = relations(puestos, ({ one, many }) => ({
  empresa: one(empresa, {
    fields: [puestos.empresa_id],
    references: [empresa.idEmpresa]
  }),
  aplicaciones: many(aplicaciones),
  favoritos: many(favoritos)
}));

export const expedientesRelations = relations(expedientes, ({ one }) => ({
  candidato: one(candidatos, {
    fields: [expedientes.candidato_id],
    references: [candidatos.idCandidatos]
  })
}));

export const aplicacionesRelations = relations(aplicaciones, ({ one }) => ({
  candidato: one(candidatos, {
    fields: [aplicaciones.candidato_id],
    references: [candidatos.idCandidatos]
  }),
  puesto: one(puestos, {
    fields: [aplicaciones.puesto_id],
    references: [puestos.idPuestos]
  })
}));

export const favoritosRelations = relations(favoritos, ({ one }) => ({
  candidato: one(candidatos, {
    fields: [favoritos.candidato_id],
    references: [candidatos.idCandidatos]
  }),
  puesto: one(puestos, {
    fields: [favoritos.puesto_id],
    references: [puestos.idPuestos]
  })
}));

// Type exports
export type Candidato = typeof candidatos.$inferSelect;
export type InsertCandidato = typeof candidatos.$inferInsert;
export type Empresa = typeof empresa.$inferSelect;
export type InsertEmpresa = typeof empresa.$inferInsert;
export type Puesto = typeof puestos.$inferSelect;
export type InsertPuesto = typeof puestos.$inferInsert;
export type Aplicacion = typeof aplicaciones.$inferSelect;
export type InsertAplicacion = typeof aplicaciones.$inferInsert;