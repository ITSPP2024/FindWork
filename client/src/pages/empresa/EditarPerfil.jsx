import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/EditarPerfil.css';

const EditarPerfilEmpresa = () => {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState({
    nombre: '',
    descripcion: '',
    telefono: '',
    ubicacion: '',
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

  const cargarPerfil = async () => {
    try {
      const response = await fetch(`/api/empresa/perfil/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPerfil({
          nombre: data.Nombre_Empresa || data.nombre || '',
          descripcion: data.descripcion || '',
          telefono: data.Telefono_Empresa || data.telefono || '',
          ubicacion: data.Ubicacion || data.ubicacion || '',
          foto_perfil: data.foto_perfil
        });
        if (data.foto_perfil) {
          setPreviewFoto(`http://localhost:3001${data.foto_perfil}`);
        }
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setMensaje('Error cargando el perfil');
    } finally {
      setLoading(false);
    }
  };

  const cargarArchivos = async () => {
    try {
      const response = await fetch(`/api/files/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setArchivos(data);
      }
    } catch (error) {
      console.error('Error cargando archivos:', error);
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setPerfil(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const guardarPerfil = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje('');

    try {
      const response = await fetch(`/api/empresa/perfil/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          nombre: perfil.nombre,
          descripcion: perfil.descripcion,
          telefono: perfil.telefono,
          ubicacion: perfil.ubicacion
        })
      });

      if (response.ok) {
        setMensaje('✅ Perfil actualizado exitosamente');
        setTimeout(() => setMensaje(''), 3000);
      } else {
        const error = await response.json();
        setMensaje(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error guardando perfil:', error);
      setMensaje('❌ Error al guardar el perfil');
    } finally {
      setGuardando(false);
    }
  };

  const manejarCambioFoto = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    // Verificar que sea una imagen
    if (!archivo.type.startsWith('image/')) {
      setMensaje('❌ Por favor selecciona una imagen válida');
      return;
    }

    // Verificar tamaño (máximo 5MB)
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
      const response = await fetch(`/api/empresa/foto-perfil/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewFoto(`http://localhost:3001${data.foto_perfil}`);
        setPerfil(prev => ({ ...prev, foto_perfil: data.foto_perfil }));
        setMensaje('✅ Foto de perfil actualizada exitosamente');
        setTimeout(() => setMensaje(''), 3000);
      } else {
        const error = await response.json();
        setMensaje(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error subiendo foto:', error);
      setMensaje('❌ Error al subir la foto');
    } finally {
      setSubiendoFoto(false);
    }
  };

  const subirDocumento = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    // Verificar que sea un PDF
    if (archivo.type !== 'application/pdf') {
      setMensaje('❌ Solo se permiten archivos PDF');
      return;
    }

    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('fileType', 'documents');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        setMensaje('✅ Documento subido exitosamente');
        cargarArchivos(); // Recargar lista de archivos
        setTimeout(() => setMensaje(''), 3000);
        e.target.value = ''; // Limpiar input
      } else {
        const error = await response.json();
        setMensaje(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error subiendo documento:', error);
      setMensaje('❌ Error al subir el documento');
    }
  };

  const eliminarArchivo = async (archivoId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) return;

    try {
      const response = await fetch(`/api/files/${archivoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMensaje('✅ Archivo eliminado exitosamente');
        cargarArchivos(); // Recargar lista de archivos
        setTimeout(() => setMensaje(''), 3000);
      } else {
        const error = await response.json();
        setMensaje(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      setMensaje('❌ Error al eliminar el archivo');
    }
  };

  if (loading) {
    return <div className="loading">Cargando perfil de empresa...</div>;
  }

  return (
    <div className="editar-perfil">
      <h2>🏢 Editar Perfil de Empresa</h2>

      {mensaje && (
        <div className={`mensaje ${mensaje.includes('❌') ? 'error' : 'exito'}`}>
          {mensaje}
        </div>
      )}

      <div className="perfil-container">
        {/* Sección de Logo de Empresa */}
        <div className="seccion-foto">
          <h3>🏢 Logo de Empresa</h3>
          <div className="foto-perfil-wrapper">
            <div className="foto-actual">
              {previewFoto ? (
                <img src={previewFoto} alt="Logo de empresa" className="foto-perfil-preview" />
              ) : (
                <div className="sin-foto">
                  <span>🏢</span>
                  <p>Sin logo</p>
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
                {subiendoFoto ? '⏳ Subiendo...' : '🖼️ Cambiar Logo'}
              </label>
              <p className="info-archivo">JPG, PNG máximo 5MB</p>
            </div>
          </div>
        </div>

        {/* Formulario de Información de Empresa */}
        <div className="seccion-informacion">
          <h3>🏢 Información de la Empresa</h3>
          <form onSubmit={guardarPerfil} className="formulario-perfil">
            <div className="campo">
              <label htmlFor="nombre">Nombre de la Empresa:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={perfil.nombre}
                onChange={manejarCambio}
                required
                placeholder="Nombre completo de la empresa"
              />
            </div>

            <div className="campo">
              <label htmlFor="telefono">Teléfono de Contacto:</label>
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
              <label htmlFor="ubicacion">Ubicación:</label>
              <input
                type="text"
                id="ubicacion"
                name="ubicacion"
                value={perfil.ubicacion}
                onChange={manejarCambio}
                placeholder="Ciudad, Estado, País"
              />
            </div>

            <div className="campo">
              <label htmlFor="descripcion">Descripción de la Empresa:</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={perfil.descripcion}
                onChange={manejarCambio}
                rows="6"
                placeholder="Describe tu empresa: misión, visión, valores, industria, tamaño, historia, cultura laboral..."
              />
            </div>

            <button type="submit" disabled={guardando} className="btn-guardar">
              {guardando ? '⏳ Guardando...' : '💾 Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Sección de Documentos Empresariales */}
        <div className="seccion-documentos">
          <h3>📋 Documentos de la Empresa</h3>
          
          <div className="subir-documento">
            <input
              type="file"
              id="documento-input"
              accept=".pdf"
              onChange={subirDocumento}
              className="archivo-input"
            />
            <label htmlFor="documento-input" className="btn-subir-documento">
              📤 Subir Documento (PDF)
            </label>
            <p className="info-archivo">
              Ej: Registro mercantil, certificaciones, brochures, etc.
            </p>
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

export default EditarPerfilEmpresa;