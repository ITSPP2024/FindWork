import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import '../../styles/Perfil.css';

const EmpresaPerfil = () => {
  const { user, logout } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      const response = await api.get(`/empresa/perfil/${user.id}`);
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
            <Link to="/empresa/dashboard" className="nav-link">Dashboard</Link>
            <span className="user-info">Hola, {user?.nombre}</span>
            <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
          </div>
        </div>
      </nav>

      <main className="perfil-main">
        <div className="perfil-container">
          <h2>Perfil de Empresa</h2>
          
          <div className="perfil-card">
            <div className="perfil-header">
              <div className="perfil-avatar empresa-avatar">
                {perfil?.nombre?.charAt(0) || 'E'}
              </div>
              <div className="perfil-info">
                <h3>{perfil?.nombre || 'Empresa'}</h3>
                <p>{perfil?.correo || user?.email}</p>
              </div>
              <Link to="/empresa/editar-perfil" className="btn-primary">✏️ Editar Perfil</Link>
            </div>

            <div className="perfil-sections">
              <div className="perfil-section">
                <h4>Información de la Empresa</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Teléfono:</label>
                    <span>{perfil?.telefono || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{perfil?.correo || user?.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Ubicación:</label>
                    <span>{perfil?.ubicacion || 'No especificada'}</span>
                  </div>
                </div>
              </div>

              <div className="perfil-section">
                <h4>Descripción de la Empresa</h4>
                <div className="descripcion-content">
                  {perfil?.descripcion ? (
                    <p>{perfil.descripcion}</p>
                  ) : (
                    <p className="no-info">
                      Agrega una descripción de tu empresa para atraer mejores candidatos
                    </p>
                  )}
                </div>
              </div>

              <div className="perfil-section">
                <h4>Estadísticas</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-number">0</div>
                    <div className="stat-label">Vacantes Activas</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">0</div>
                    <div className="stat-label">Aplicantes Totales</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">0</div>
                    <div className="stat-label">Contrataciones</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default EmpresaPerfil;