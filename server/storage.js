import { eq, desc, sql, and } from 'drizzle-orm';
import { db } from './db';
import { 
  candidatos, 
  empresa, 
  puestos, 
  expedientes, 
  aplicaciones,
  favoritos,
  type Candidato,
  type Empresa,
  type Puesto,
  type Aplicacion,
  type InsertCandidato,
  type InsertEmpresa,
  type InsertPuesto,
  type InsertAplicacion
} from '../shared/schema';

// Storage interface
export interface IStorage {
  // Candidatos
  getCandidato(id: number): Promise<any>;
  getCandidatoByEmail(email: string): Promise<any>;
  updateCandidato(id: number, data: any): Promise<any>;
  updateCandidatoPhoto(id: number, photoPath: string): Promise<any>;
  
  // Empresas
  getEmpresa(id: number): Promise<any>;
  getEmpresaByEmail(email: string): Promise<any>;
  updateEmpresa(id: number, data: any): Promise<any>;
  updateEmpresaPhoto(id: number, photoPath: string): Promise<any>;
  
  // Puestos
  getAllPuestos(): Promise<any[]>;
  getPuestosByEmpresa(empresaId: number): Promise<any[]>;
  createPuesto(data: any): Promise<any>;
  
  // Expedientes
  upsertExpediente(candidatoId: number, experiencia: string): Promise<any>;
  
  // Applications
  createApplication(data: any): Promise<any>;
  getApplicationExists(candidatoId: number, puestoId: number): Promise<boolean>;
  getApplicationsByCandidate(candidatoId: number): Promise<any[]>;
  getApplicationsByCompany(empresaId: number): Promise<any[]>;
  updateApplicationStatus(applicationId: number, estado: string, notasEmpresa: string): Promise<any>;
  getApplicationForCompany(applicationId: number, empresaId: number): Promise<any>;
  getApplicationDetails(applicationId: number): Promise<any>;
  
  // Favoritos
  getFavoritesByCandidate(candidatoId: number): Promise<any[]>;
  getFavoriteExists(candidatoId: number, puestoId: number): Promise<boolean>;
  deleteFavorite(candidatoId: number, puestoId: number): Promise<any>;
  createFavorite(candidatoId: number, puestoId: number): Promise<any>;
  
  // Admin
  getAllUsers(): Promise<any[]>;
  getStatistics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Candidatos methods
  async getCandidato(id: number) {
    const result = await db
      .select({
        nombre: candidatos.Nombre_Candidatos,
        correo: candidatos.Correo_Candidatos,
        telefono: candidatos.Numero_Candidatos,
        descripcion: candidatos.descripcion,
        foto_perfil: candidatos.foto_perfil,
        experiencia: expedientes.Experiencia
      })
      .from(candidatos)
      .leftJoin(expedientes, eq(candidatos.idCandidatos, expedientes.candidato_id))
      .where(eq(candidatos.idCandidatos, id));
    
    return result[0] || null;
  }

  async getCandidatoByEmail(email: string) {
    const result = await db
      .select({
        id: candidatos.idCandidatos,
        nombre: candidatos.Nombre_Candidatos,
        email: candidatos.Correo_Candidatos
      })
      .from(candidatos)
      .where(eq(candidatos.Correo_Candidatos, email));
    
    return result[0] || null;
  }

  async updateCandidato(id: number, data: { nombre: string; descripcion: string; telefono: string; experiencia: string }) {
    const { nombre, descripcion, telefono, experiencia } = data;
    
    // Start transaction manually since Drizzle doesn't have built-in transaction API like this
    await db.transaction(async (tx) => {
      // Update candidatos
      await tx
        .update(candidatos)
        .set({
          Nombre_Candidatos: nombre,
          descripcion: descripcion,
          Numero_Candidatos: telefono,
          updatedAt: sql`now()`
        })
        .where(eq(candidatos.idCandidatos, id));
      
      // Upsert expedientes
      await tx
        .insert(expedientes)
        .values({
          candidato_id: id,
          Experiencia: experiencia
        })
        .onConflictDoUpdate({
          target: expedientes.candidato_id,
          set: {
            Experiencia: experiencia,
            updatedAt: sql`now()`
          }
        });
    });
    
    return { message: 'Perfil actualizado exitosamente' };
  }

  async updateCandidatoPhoto(id: number, photoPath: string) {
    const result = await db
      .update(candidatos)
      .set({
        foto_perfil: photoPath,
        updatedAt: sql`now()`
      })
      .where(eq(candidatos.idCandidatos, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Perfil no encontrado');
    }
    
    return { message: 'Foto de perfil actualizada exitosamente', foto_perfil: photoPath };
  }

  // Empresas methods
  async getEmpresa(id: number) {
    const result = await db
      .select({
        nombre: empresa.Nombre_Empresa,
        correo: empresa.Correo_Empresa,
        telefono: empresa.Telefono_Empresa,
        ubicacion: empresa.Ubicacion,
        descripcion: empresa.descripcion,
        foto_perfil: empresa.foto_perfil
      })
      .from(empresa)
      .where(eq(empresa.idEmpresa, id));
    
    return result[0] || null;
  }

  async getEmpresaByEmail(email: string) {
    const result = await db
      .select({
        id: empresa.idEmpresa,
        nombre: empresa.Nombre_Empresa,
        email: empresa.Correo_Empresa
      })
      .from(empresa)
      .where(eq(empresa.Correo_Empresa, email));
    
    return result[0] || null;
  }

  async updateEmpresa(id: number, data: { nombre: string; descripcion: string; telefono: string; ubicacion: string }) {
    const { nombre, descripcion, telefono, ubicacion } = data;
    
    const result = await db
      .update(empresa)
      .set({
        Nombre_Empresa: nombre,
        descripcion: descripcion,
        Telefono_Empresa: telefono,
        Ubicacion: ubicacion,
        updatedAt: sql`now()`
      })
      .where(eq(empresa.idEmpresa, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Empresa no encontrada');
    }
    
    return { message: 'Perfil actualizado exitosamente' };
  }

  async updateEmpresaPhoto(id: number, photoPath: string) {
    const result = await db
      .update(empresa)
      .set({
        foto_perfil: photoPath,
        updatedAt: sql`now()`
      })
      .where(eq(empresa.idEmpresa, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Empresa no encontrada');
    }
    
    return { message: 'Foto de perfil actualizada exitosamente', foto_perfil: photoPath };
  }

  // Puestos methods
  async getAllPuestos() {
    const result = await db
      .select({
        idPuestos: puestos.idPuestos,
        Tipo_Puesto: puestos.Tipo_Puesto,
        Salario: puestos.Salario,
        Horario: puestos.Horario,
        Ubicacion: puestos.Ubicacion,
        descripcion: puestos.descripcion,
        requisitos: puestos.requisitos,
        beneficios: puestos.beneficios,
        modalidad: puestos.modalidad,
        experiencia_minima: puestos.experiencia_minima,
        empresa_id: puestos.empresa_id,
        created_at: puestos.createdAt,
        updated_at: puestos.updatedAt,
        Nombre_Empresa: empresa.Nombre_Empresa,
        Ubicacion_Empresa: empresa.Ubicacion
      })
      .from(puestos)
      .leftJoin(empresa, eq(puestos.empresa_id, empresa.idEmpresa))
      .orderBy(desc(puestos.idPuestos));
    
    return result;
  }

  async getPuestosByEmpresa(empresaId: number) {
    const result = await db
      .select()
      .from(puestos)
      .where(eq(puestos.empresa_id, empresaId))
      .orderBy(desc(puestos.idPuestos));
    
    return result;
  }

  async createPuesto(data: { tipo_puesto: string; salario: string; horario: string; ubicacion: string; empresa_id: number }) {
    const { tipo_puesto, salario, horario, ubicacion, empresa_id } = data;
    
    const result = await db
      .insert(puestos)
      .values({
        Tipo_Puesto: tipo_puesto,
        Salario: salario,
        Horario: horario,
        Ubicacion: ubicacion,
        empresa_id: empresa_id
      })
      .returning({ id: puestos.idPuestos });
    
    return { message: 'Vacante creada exitosamente', id: result[0].id };
  }

  // Expedientes methods
  async upsertExpediente(candidatoId: number, experiencia: string) {
    await db
      .insert(expedientes)
      .values({
        candidato_id: candidatoId,
        Experiencia: experiencia
      })
      .onConflictDoUpdate({
        target: expedientes.candidato_id,
        set: {
          Experiencia: experiencia,
          updatedAt: sql`now()`
        }
      });
  }

  // Applications methods
  async createApplication(data: { candidato_id: number; puesto_id: number; carta_presentacion: string; salario_esperado: string; disponibilidad: string }) {
    const result = await db
      .insert(aplicaciones)
      .values({
        candidato_id: data.candidato_id,
        puesto_id: data.puesto_id,
        carta_presentacion: data.carta_presentacion,
        salario_esperado: data.salario_esperado,
        disponibilidad: data.disponibilidad
      })
      .returning({ id: aplicaciones.idAplicacion });
    
    return result[0];
  }

  async getApplicationExists(candidatoId: number, puestoId: number): Promise<boolean> {
    const result = await db
      .select({ idAplicacion: aplicaciones.idAplicacion })
      .from(aplicaciones)
      .where(
        and(
          eq(aplicaciones.candidato_id, candidatoId),
          eq(aplicaciones.puesto_id, puestoId)
        )
      );
    
    return result.length > 0;
  }

  async getApplicationsByCandidate(candidatoId: number) {
    const result = await db
      .select({
        idAplicacion: aplicaciones.idAplicacion,
        estado: aplicaciones.estado,
        fecha_aplicacion: aplicaciones.fecha_aplicacion,
        salario_esperado: aplicaciones.salario_esperado,
        disponibilidad: aplicaciones.disponibilidad,
        carta_presentacion: aplicaciones.carta_presentacion,
        puesto_titulo: puestos.Tipo_Puesto,
        Salario: puestos.Salario,
        Ubicacion: puestos.Ubicacion,
        empresa_nombre: empresa.Nombre_Empresa
      })
      .from(aplicaciones)
      .leftJoin(puestos, eq(aplicaciones.puesto_id, puestos.idPuestos))
      .leftJoin(empresa, eq(puestos.empresa_id, empresa.idEmpresa))
      .where(eq(aplicaciones.candidato_id, candidatoId))
      .orderBy(desc(aplicaciones.fecha_aplicacion));
    
    return result;
  }

  async getApplicationsByCompany(empresaId: number) {
    const result = await db
      .select({
        idAplicacion: aplicaciones.idAplicacion,
        salario_esperado: aplicaciones.salario_esperado,
        disponibilidad: aplicaciones.disponibilidad,
        carta_presentacion: aplicaciones.carta_presentacion,
        estado: aplicaciones.estado,
        fecha_aplicacion: aplicaciones.fecha_aplicacion,
        candidato_nombre: candidatos.Nombre_Candidatos,
        candidato_email: candidatos.Correo_Candidatos,
        candidato_telefono: candidatos.Numero_Candidatos,
        puesto_titulo: puestos.Tipo_Puesto,
        Salario: puestos.Salario,
        Ubicacion: puestos.Ubicacion
      })
      .from(aplicaciones)
      .leftJoin(candidatos, eq(aplicaciones.candidato_id, candidatos.idCandidatos))
      .leftJoin(puestos, eq(aplicaciones.puesto_id, puestos.idPuestos))
      .where(eq(puestos.empresa_id, empresaId))
      .orderBy(desc(aplicaciones.fecha_aplicacion));
    
    return result;
  }

  async updateApplicationStatus(applicationId: number, estado: string, notasEmpresa: string) {
    const result = await db
      .update(aplicaciones)
      .set({
        estado: estado as any,
        notas_empresa: notasEmpresa,
        fecha_actualizacion: sql`now()`
      })
      .where(eq(aplicaciones.idAplicacion, applicationId))
      .returning();
    
    return result[0];
  }

  async getApplicationForCompany(applicationId: number, empresaId: number) {
    const result = await db
      .select({ idAplicacion: aplicaciones.idAplicacion })
      .from(aplicaciones)
      .leftJoin(puestos, eq(aplicaciones.puesto_id, puestos.idPuestos))
      .where(
        and(
          eq(aplicaciones.idAplicacion, applicationId),
          eq(puestos.empresa_id, empresaId)
        )
      );
    
    return result[0] || null;
  }

  async getApplicationDetails(applicationId: number) {
    const result = await db
      .select({
        candidato_nombre: candidatos.Nombre_Candidatos,
        puesto_titulo: puestos.Tipo_Puesto,
        empresa_email: empresa.Correo_Empresa,
        empresa_nombre: empresa.Nombre_Empresa,
        candidato_email: candidatos.Correo_Candidatos
      })
      .from(aplicaciones)
      .leftJoin(candidatos, eq(aplicaciones.candidato_id, candidatos.idCandidatos))
      .leftJoin(puestos, eq(aplicaciones.puesto_id, puestos.idPuestos))
      .leftJoin(empresa, eq(puestos.empresa_id, empresa.idEmpresa))
      .where(eq(aplicaciones.idAplicacion, applicationId));
    
    return result[0] || null;
  }

  // Favoritos methods
  async getFavoritesByCandidate(candidatoId: number) {
    const result = await db
      .select({
        idFavorito: favoritos.idFavorito,
        puesto_id: favoritos.puesto_id,
        fecha_agregado: favoritos.fecha_agregado,
        Tipo_Puesto: puestos.Tipo_Puesto,
        Nombre_Empresa: empresa.Nombre_Empresa,
        Ubicacion: puestos.Ubicacion,
        Salario: puestos.Salario,
        Horario: puestos.Horario
      })
      .from(favoritos)
      .leftJoin(puestos, eq(favoritos.puesto_id, puestos.idPuestos))
      .leftJoin(empresa, eq(puestos.empresa_id, empresa.idEmpresa))
      .where(eq(favoritos.candidato_id, candidatoId))
      .orderBy(desc(favoritos.fecha_agregado));
    
    return result;
  }

  async getFavoriteExists(candidatoId: number, puestoId: number): Promise<boolean> {
    const result = await db
      .select({ idFavorito: favoritos.idFavorito })
      .from(favoritos)
      .where(
        and(
          eq(favoritos.candidato_id, candidatoId),
          eq(favoritos.puesto_id, puestoId)
        )
      );
    
    return result.length > 0;
  }

  async deleteFavorite(candidatoId: number, puestoId: number) {
    const result = await db
      .delete(favoritos)
      .where(
        and(
          eq(favoritos.candidato_id, candidatoId),
          eq(favoritos.puesto_id, puestoId)
        )
      )
      .returning();
    
    return result[0];
  }

  async createFavorite(candidatoId: number, puestoId: number) {
    const result = await db
      .insert(favoritos)
      .values({
        candidato_id: candidatoId,
        puesto_id: puestoId
      })
      .returning();
    
    return result[0];
  }

  // Admin methods
  async getAllUsers() {
    // Union-like query - get candidates
    const candidatesQuery = db
      .select({
        tipo: sql<string>`'empleado'`.as('tipo'),
        id: candidatos.idCandidatos,
        nombre: candidatos.Nombre_Candidatos,
        email: candidatos.Correo_Candidatos
      })
      .from(candidatos);
    
    // Get companies  
    const companiesQuery = db
      .select({
        tipo: sql<string>`'empresa'`.as('tipo'),
        id: empresa.idEmpresa,
        nombre: empresa.Nombre_Empresa,
        email: empresa.Correo_Empresa
      })
      .from(empresa);
    
    // Execute both queries and combine results
    const [candidates, companies] = await Promise.all([candidatesQuery, companiesQuery]);
    
    return [...candidates, ...companies];
  }

  async getStatistics() {
    const [empleadosResult, empresasResult, puestosResult, expedientesResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(candidatos),
      db.select({ count: sql<number>`count(*)` }).from(empresa),
      db.select({ count: sql<number>`count(*)` }).from(puestos),
      db.select({ count: sql<number>`count(*)` }).from(expedientes)
    ]);
    
    return {
      empleados: empleadosResult[0]?.count || 0,
      empresas: empresasResult[0]?.count || 0,
      puestos: puestosResult[0]?.count || 0,
      expedientes: expedientesResult[0]?.count || 0
    };
  }
}

export const storage = new DatabaseStorage();