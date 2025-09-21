import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import FileUpload from '../../components/FileUpload';
import FileList from '../../components/FileList';
import '../../styles/Perfil.css';

const EmpleadoPerfil = () => {
  const { user, logout } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      const response = await api.get(`/empleado/perfil/${user.id}`);
      setPerfil(response.data);
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (file) => {
    setUploadMessage(`${file.originalName} se subió exitosamente`);
    setUploadError('');
    setRefreshTrigger(prev => prev + 1); // Trigger refresh de listas
    setTimeout(() => setUploadMessage(''), 3000);
  };

  const handleUploadError = (error) => {
    setUploadError(error);
    setUploadMessage('');
    setTimeout(() => setUploadError(''), 5000);
  };

  if (loading) {
    return <div className="loading">Cargando perfil...</div>;
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <h1>FindWork</h1>
          <div className="nav-links">
            <Link to="/empleado/dashboard" className="nav-link">Dashboard</Link>
            <span className="user-info">Hola, {user?.nombre}</span>
            <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
          </div>
        </div>
      </nav>

      <main className="perfil-main">
        <div className="perfil-container">
          <h2>Mi Perfil Profesional</h2>
          
          <div className="perfil-card">
            <div className="perfil-header">
              <div className="perfil-avatar">
                {perfil?.Nombre_Candidatos?.charAt(0) || 'U'}
              </div>
              <div className="perfil-info">
                <h3>{perfil?.Nombre_Candidatos || 'Usuario'}</h3>
                <p>{perfil?.Correo_Candidatos || user?.email}</p>
              </div>
            </div>

            {/* Mensajes de feedback */}
            {uploadMessage && (
              <div className="upload-success-message">
                ✅ {uploadMessage}
              </div>
            )}
            
            {uploadError && (
              <div className="upload-error-message">
                ❌ {uploadError}
              </div>
            )}

            <div className="perfil-sections">
              <div className="perfil-section">
                <h4>Información Personal</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Teléfono:</label>
                    <span>{perfil?.Numero_Candidatos || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{perfil?.Correo_Candidatos || user?.email}</span>
                  </div>
                </div>
              </div>

              <div className="perfil-section">
                <h4>Descripción Personal</h4>
                <div className="descripcion-content">
                  {perfil?.descripcion ? (
                    <p>{perfil.descripcion}</p>
                  ) : (
                    <p className="no-info">Aún no has agregado una descripción personal</p>
                  )}
                </div>
              </div>

              <div className="perfil-section">
                <h4>Experiencia Laboral</h4>
                <div className="experiencia-content">
                  {perfil?.Experiencia ? (
                    <p>{perfil.Experiencia}</p>
                  ) : (
                    <p className="no-info">Aún no has agregado experiencia laboral</p>
                  )}
                </div>
              </div>

              {/* Sección de Foto de Perfil */}
              <div className="perfil-section">
                <h4>Foto de Perfil</h4>
                <FileUpload
                  fileType="profile"
                  accept="image/*"
                  maxSize={5 * 1024 * 1024} // 5MB para imágenes
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                  label="Subir foto de perfil"
                  description="Formatos JPG, PNG. Máximo 5MB."
                />
                <FileList 
                  fileType="profile" 
                  title="Fotos de perfil" 
                  refreshTrigger={refreshTrigger}
                />
              </div>

              {/* Sección de CV */}
              <div className="perfil-section">
                <h4>Currículum Vitae</h4>
                <FileUpload
                  fileType="cv"
                  accept=".pdf,.doc,.docx"
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                  label="Subir CV"
                  description="Sube tu CV en formato PDF o Word"
                />
                <FileList 
                  fileType="cv" 
                  title="Mis CVs" 
                  refreshTrigger={refreshTrigger}
                />
              </div>

              {/* Sección de Documentos Adicionales */}
              <div className="perfil-section">
                <h4>Documentos Adicionales</h4>
                <FileUpload
                  fileType="documents"
                  accept=".pdf,.doc,.docx,.jpg,.png,.txt"
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                  label="Subir documentos"
                  description="Certificados, cartas de recomendación, portafolio, etc."
                />
                <FileList 
                  fileType="documents" 
                  title="Mis documentos" 
                  refreshTrigger={refreshTrigger}
                />
              </div>

              <div className="perfil-section">
                <h4>Observaciones</h4>
                <div className="observaciones-content">
                  {perfil?.Observaciones ? (
                    <p>{perfil.Observaciones}</p>
                  ) : (
                    <p className="no-info">Sin observaciones adicionales</p>
                  )}
                </div>
              </div>
            </div>

            <div className="perfil-actions">
              <Link to="/empleado/editar-perfil" className="btn-primary">✏️ Editar Perfil</Link>
              <button className="btn-secondary">Actualizar CV</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmpleadoPerfil;