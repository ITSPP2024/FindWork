import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/EditarPerfil.css';
import api from '../../services/api';

const EditarPerfil = () => {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState({
    nombre: '',
    descripcion: '',
    telefono: '',
    experiencia: '',
    foto_perfil: null
  });
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [previewFoto, setPreviewFoto] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  useEffect(() => {
    if (user?.id) {
      cargarPerfil();
      cargarArchivos();
    }
  }, [user]);

  // =================== CARGAR PERFIL ===================
  const cargarPerfil = async () => {
    try {
      const response = await api.get(`/empleado/perfil/${user.id}`);
      const data = response.data;

      // Asignar datos al estado
      setPerfil({
        nombre: data.nombre || '',
        descripcion: data.descripcion || '',
        telefono: data.telefono || '',
        experiencia: data.experiencia || '',
        foto_perfil: data.foto_perfil || null
      });

      // Previsualizar foto (si viene en base64 o URL)
      if (data.foto_perfil) {
        // Detectar si ya es base64
        if (data.foto_perfil.startsWith('data:image/')) {
          setPreviewFoto(data.foto_perfil);
        } else {
          // Si es ruta desde backend
          setPreviewFoto(`http://localhost:3001${data.foto_perfil}`);
        }
      }
    } catch (error) {
    console.error('Error cargando perfil:', error.response || error);
    setMensaje('❌ Error cargando el perfil');
}
 finally {
      setLoading(false);
    }
  };

  // =================== CARGAR ARCHIVOS ===================
  const cargarArchivos = async () => {
    try {
      const response = await api.get(`/files/${user.id}`);
      const data = response.data;

      const archivosArray = [];
      if (data.Documentos) {
        archivosArray.push({
          id: 'cv',
          originalName: 'CV',
          uploadDate: new Date().toISOString(),
          size: 0,
          url: data.Documentos,
          tipo: 'cv'
        });
      }
      setArchivos(archivosArray);
    } catch (error) {
      console.error('Error cargando archivos:', error);
      setArchivos([]);
    }
  };

  // =================== MANEJO FORMULARIO ===================
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setPerfil(prev => ({ ...prev, [name]: value }));
  };

  const guardarPerfil = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje('');

    try {
      await api.put(`/empleado/perfil/${user.id}`, {
        nombre: perfil.nombre,
        descripcion: perfil.descripcion,
        telefono: perfil.telefono,
        experiencia: perfil.experiencia
      });

      setMensaje('✅ Perfil actualizado exitosamente');
      setTimeout(() => setMensaje(''), 3000);

      await cargarPerfil(); // Recargar datos actualizados
    } catch (error) {
      console.error('Error guardando perfil:', error);
      const errorMessage = error.response?.data?.error || 'Error al guardar el perfil';
      setMensaje(`❌ ${errorMessage}`);
    } finally {
      setGuardando(false);
    }
  };

  // =================== MANEJO FOTO DE PERFIL ===================
  const manejarCambioFoto = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    // Validaciones
    if (!archivo.type.startsWith('image/')) {
      setMensaje('❌ Por favor selecciona una imagen válida');
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setMensaje('❌ La imagen no puede ser mayor a 5MB');
      return;
    }

    setSubiendoFoto(true);
    setMensaje('');

    const formData = new FormData();
    formData.append('foto', archivo);
    formData.append('fileType', 'profile');

    try {
      const response = await api.put(
        `/empleado/foto-perfil/${user.id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const data = response.data;
      if (data.foto_perfil) {
        // Guardar y previsualizar directamente desde base64
        setPerfil(prev => ({ ...prev, foto_perfil: data.foto_perfil }));
        setPreviewFoto(data.foto_perfil);
      }

      setMensaje('✅ Foto de perfil actualizada exitosamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error subiendo foto:', error);
      const errorMessage = error.response?.data?.error || 'Error al subir la foto';
      setMensaje(`❌ ${errorMessage}`);
    } finally {
      setSubiendoFoto(false);
    }
  };

  // =================== SUBIR DOCUMENTO ===================
  const subirDocumento = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    if (archivo.type !== 'application/pdf') {
      setMensaje('❌ Solo se permiten archivos PDF');
      return;
    }

    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('fileType', 'cv');

    try {
      await api.post('/upload', formData);
      setMensaje('✅ Documento subido exitosamente');
      cargarArchivos();
      setTimeout(() => setMensaje(''), 3000);
      e.target.value = '';
    } catch (error) {
      console.error('Error subiendo documento:', error);
      const errorMessage = error.response?.data?.error || 'Error al subir el documento';
      setMensaje(`❌ ${errorMessage}`);
    }
  };

  // =================== ELIMINAR ARCHIVO ===================
  const eliminarArchivo = async (archivoId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) return;

    try {
      await api.delete(`/files/${archivoId}`);
      setMensaje('✅ Archivo eliminado exitosamente');
      cargarArchivos();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      const errorMessage = error.response?.data?.error || 'Error al eliminar el archivo';
      setMensaje(`❌ ${errorMessage}`);
    }
  };

  if (loading) return <div className="loading">Cargando perfil...</div>;

  return (
    <div className="editar-perfil">
      <div className="editar-perfil-header">
        <Link to="/empleado/perfil" className="btn-regresar">← Regresar al Perfil</Link>
        <h2>✏️ Editar Mi Perfil</h2>
      </div>

      {mensaje && (
        <div className={`mensaje ${mensaje.includes('❌') ? 'error' : 'exito'}`}>
          {mensaje}
        </div>
      )}

      <div className="perfil-container">
        {/* FOTO DE PERFIL */}
        <div className="seccion-foto">
          <h3>📸 Foto de Perfil</h3>
          <div className="foto-perfil-wrapper">
            <div className="foto-actual">
              {previewFoto ? (
                <img
                  src={previewFoto}
                  alt="Foto de perfil"
                  className="foto-perfil-preview"
                />
              ) : (
                <div className="sin-foto">
                  <span>📷</span>
                  <p>Sin foto</p>
                </div>
              )}
            </div>
            <div className="cambiar-foto">
              <input
                type="file"
                id="foto-input"
                accept="image/*"
                onChange={manejarCambioFoto}
                disabled={subiendoFoto}
                className="archivo-input"
              />
              <label htmlFor="foto-input" className="btn-cambiar-foto">
                {subiendoFoto ? '⏳ Subiendo...' : '📷 Cambiar Foto'}
              </label>
              <p className="info-archivo">JPG, PNG máximo 5MB</p>
            </div>
          </div>
        </div>

        {/* FORMULARIO INFORMACIÓN */}
        <div className="seccion-informacion">
          <h3>👤 Información Personal</h3>
          <form onSubmit={guardarPerfil} className="formulario-perfil">
            <div className="campo">
              <label htmlFor="nombre">Nombre Completo:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={perfil.nombre}
                onChange={manejarCambio}
                required
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="campo">
              <label htmlFor="telefono">Teléfono:</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={perfil.telefono}
                onChange={manejarCambio}
                placeholder="Ej: +52 555 123 4567"
              />
            </div>

            <div className="campo">
              <label htmlFor="descripcion">Descripción Personal:</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={perfil.descripcion}
                onChange={manejarCambio}
                rows="4"
                placeholder="Cuéntanos sobre ti, tus objetivos profesionales, habilidades destacadas..."
              />
            </div>

            <div className="campo">
              <label htmlFor="experiencia">Experiencia Profesional:</label>
              <textarea
                id="experiencia"
                name="experiencia"
                value={perfil.experiencia}
                onChange={manejarCambio}
                rows="6"
                placeholder="Describe tu experiencia laboral, proyectos destacados, logros..."
              />
            </div>

            <button type="submit" disabled={guardando} className="btn-guardar">
              {guardando ? '⏳ Guardando...' : '💾 Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* DOCUMENTOS */}
        <div className="seccion-documentos">
          <h3>📄 Mis Documentos</h3>
          <div className="subir-documento">
            <input
              type="file"
              id="documento-input"
              accept=".pdf"
              onChange={subirDocumento}
              className="archivo-input"
            />
            <label htmlFor="documento-input" className="btn-subir-documento">
              📤 Subir CV/Documento (PDF)
            </label>
          </div>

          <div className="lista-documentos">
            {archivos.length === 0 ? (
              <p className="sin-documentos">No has subido ningún documento aún</p>
            ) : (
              archivos.map(archivo => (
                <div key={archivo.id} className="documento-item">
                  <div className="documento-info">
                    <span className="documento-icono">📄</span>
                    <div className="documento-detalles">
                      <h4>{archivo.originalName}</h4>
                      <p>Subido: {new Date(archivo.uploadDate).toLocaleDateString()}</p>
                      <p>Tamaño: {(archivo.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <div className="documento-acciones">
                    <a 
                      href={`/api/files/${archivo.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-descargar"
                    >
                      📥 Descargar
                    </a>
                    <button 
                      onClick={() => eliminarArchivo(archivo.id)}
                      className="btn-eliminar"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfil;
