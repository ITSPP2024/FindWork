import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import '../../styles/Perfil.css';

const EmpleadoPerfil = () => {
  const { user, logout } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

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
                <h4>Experiencia Laboral</h4>
                <div className="experiencia-content">
                  {perfil?.Experiencia ? (
                    <p>{perfil.Experiencia}</p>
                  ) : (
                    <p className="no-info">Aún no has agregado experiencia laboral</p>
                  )}
                </div>
              </div>

              <div className="perfil-section">
                <h4>Documentos</h4>
                <div className="documentos-content">
                  {perfil?.Documentos ? (
                    <p>{perfil.Documentos}</p>
                  ) : (
                    <p className="no-info">No hay documentos cargados</p>
                  )}
                </div>
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
              <button className="btn-primary">Editar Perfil</button>
              <button className="btn-secondary">Actualizar CV</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmpleadoPerfil;