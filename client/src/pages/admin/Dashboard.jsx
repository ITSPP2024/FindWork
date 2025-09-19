import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import '../../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [estadisticas, setEstadisticas] = useState({
    empleados: 0,
    empresas: 0,
    vacantes: 0,
    expedientes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    try {
      const response = await api.get('/admin/estadisticas');
      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <h1>FindWork Admin</h1>
          <div className="nav-links">
            <Link to="/admin/usuarios" className="nav-link">Gestionar Usuarios</Link>
            <span className="user-info">Admin</span>
            <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h2>Panel de Administración</h2>
          <p>Gestiona usuarios y visualiza estadísticas de la plataforma</p>
        </div>

        <div className="dashboard-content">
          {loading ? (
            <div className="loading">Cargando estadísticas...</div>
          ) : (
            <div className="stats-dashboard">
              <div className="stats-grid-admin">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3>{estadisticas.empleados}</h3>
                    <p>Empleados Registrados</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🏢</div>
                  <div className="stat-info">
                    <h3>{estadisticas.empresas}</h3>
                    <p>Empresas Registradas</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">💼</div>
                  <div className="stat-info">
                    <h3>{estadisticas.vacantes}</h3>
                    <p>Vacantes Activas</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📄</div>
                  <div className="stat-info">
                    <h3>{estadisticas.expedientes}</h3>
                    <p>Expedientes</p>
                  </div>
                </div>
              </div>

              <div className="admin-actions">
                <div className="action-card">
                  <h3>Gestión de Usuarios</h3>
                  <p>Administra empleados y empresas registrados</p>
                  <Link to="/admin/usuarios" className="btn-primary">Ver Usuarios</Link>
                </div>
                
                <div className="action-card">
                  <h3>Reportes</h3>
                  <p>Genera reportes y estadísticas detalladas</p>
                  <button className="btn-secondary">Ver Reportes</button>
                </div>
                
                <div className="action-card">
                  <h3>Configuración</h3>
                  <p>Ajusta la configuración del sistema</p>
                  <button className="btn-secondary">Configuración</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;