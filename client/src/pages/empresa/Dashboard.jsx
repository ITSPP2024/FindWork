import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import '../../styles/Dashboard.css';

const EmpresaDashboard = () => {
  const { user, logout } = useAuth();
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [nuevaVacante, setNuevaVacante] = useState({
    tipo_puesto: '',
    salario: '',
    horario: '',
    ubicacion: ''
  });

  useEffect(() => {
    fetchVacantes();
  }, []);

  const fetchVacantes = async () => {
    try {
      const response = await api.get(`/empresa/vacantes/${user.id}`);
      setVacantes(response.data);
    } catch (error) {
      console.error('Error cargando vacantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVacante = async (e) => {
    e.preventDefault();
    try {
      await api.post('/empresa/vacante', nuevaVacante);
      setNuevaVacante({
        tipo_puesto: '',
        salario: '',
        horario: '',
        ubicacion: ''
      });
      setShowCreateForm(false);
      fetchVacantes();
    } catch (error) {
      console.error('Error creando vacante:', error);
    }
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <h1>FindWork</h1>
          <div className="nav-links">
            <Link to="/empresa/perfil" className="nav-link">Mi Perfil</Link>
            <span className="user-info">Hola, {user?.nombre}</span>
            <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h2>Mis Vacantes</h2>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            {showCreateForm ? 'Cancelar' : 'Crear Nueva Vacante'}
          </button>
        </div>

        {showCreateForm && (
          <div className="create-form-container">
            <form onSubmit={handleCreateVacante} className="create-form">
              <h3>Nueva Vacante</h3>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Tipo de puesto"
                  value={nuevaVacante.tipo_puesto}
                  onChange={(e) => setNuevaVacante({...nuevaVacante, tipo_puesto: e.target.value})}
                  required
                />
                <input
                  type="number"
                  placeholder="Salario"
                  value={nuevaVacante.salario}
                  onChange={(e) => setNuevaVacante({...nuevaVacante, salario: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Horario"
                  value={nuevaVacante.horario}
                  onChange={(e) => setNuevaVacante({...nuevaVacante, horario: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Ubicación"
                  value={nuevaVacante.ubicacion}
                  onChange={(e) => setNuevaVacante({...nuevaVacante, ubicacion: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">Crear Vacante</button>
            </form>
          </div>
        )}

        <div className="dashboard-content">
          {loading ? (
            <div className="loading">Cargando vacantes...</div>
          ) : (
            <div className="vacantes-grid">
              {vacantes.map((vacante) => (
                <div key={vacante.idPuestos} className="vacante-card empresa-vacante">
                  <div className="vacante-header">
                    <h3>{vacante.Tipo_Puesto}</h3>
                    <span className="vacante-id">ID: {vacante.idPuestos}</span>
                  </div>
                  <div className="vacante-details">
                    <p className="ubicacion">📍 {vacante.Ubicacion}</p>
                    <p className="salario">💰 ${vacante.Salario}</p>
                    <p className="horario">🕒 {vacante.Horario}</p>
                  </div>
                  <div className="vacante-actions">
                    <button className="btn-secondary">Ver Candidatos</button>
                    <button className="btn-outline">Editar</button>
                  </div>
                </div>
              ))}
              {vacantes.length === 0 && !loading && (
                <div className="no-vacantes">
                  <p>Aún no has creado ninguna vacante</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmpresaDashboard;