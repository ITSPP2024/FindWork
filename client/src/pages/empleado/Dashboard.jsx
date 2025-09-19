import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import '../../styles/Dashboard.css';

const EmpleadoDashboard = () => {
  const { user, logout } = useAuth();
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVacantes();
  }, []);

  const fetchVacantes = async () => {
    try {
      const response = await api.get('/vacantes');
      setVacantes(response.data);
    } catch (error) {
      console.error('Error cargando vacantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVacantes = vacantes.filter(vacante =>
    vacante.Tipo_Puesto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vacante.Nombre_Empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vacante.Ubicacion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <h1>FindWork</h1>
          <div className="nav-links">
            <Link to="/empleado/perfil" className="nav-link">Mi Perfil</Link>
            <span className="user-info">Hola, {user?.nombre}</span>
            <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h2>Oportunidades Laborales</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar vacantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="dashboard-content">
          {loading ? (
            <div className="loading">Cargando vacantes...</div>
          ) : (
            <div className="vacantes-grid">
              {filteredVacantes.map((vacante) => (
                <div key={vacante.idPuestos} className="vacante-card">
                  <div className="vacante-header">
                    <h3>{vacante.Tipo_Puesto || 'Puesto no especificado'}</h3>
                    <span className="empresa">{vacante.Nombre_Empresa}</span>
                  </div>
                  <div className="vacante-details">
                    <p className="ubicacion">📍 {vacante.Ubicacion || 'No especificada'}</p>
                    <p className="salario">💰 ${vacante.Salario || 'A negociar'}</p>
                    <p className="horario">🕒 {vacante.Horario || 'No especificado'}</p>
                  </div>
                  <button className="apply-btn">Postularse</button>
                </div>
              ))}
              {filteredVacantes.length === 0 && !loading && (
                <div className="no-vacantes">
                  <p>No se encontraron vacantes disponibles</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmpleadoDashboard;