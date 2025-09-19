import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api, { applicationsAPI, favoritesAPI } from '../../services/api';
import ApplicationModal from '../../components/ApplicationModal';
import '../../styles/Dashboard.css';
import '../../styles/Applications.css';
import '../../styles/Favorites.css';

const EmpleadoDashboard = () => {
  const { user, logout } = useAuth();
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [applicationModal, setApplicationModal] = useState({ isOpen: false, vacante: null });
  const [aplicaciones, setAplicaciones] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [favoritesMap, setFavoritesMap] = useState({});
  const [activeTab, setActiveTab] = useState('vacantes');

  useEffect(() => {
    fetchVacantes();
    if (user?.id) {
      fetchMisAplicaciones();
      fetchFavoritos();
    }
  }, [user]);

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

  const fetchMisAplicaciones = async () => {
    if (!user?.id) return;
    
    try {
      const result = await applicationsAPI.getEmployeeApplications(user.id);
      if (result.success) {
        setAplicaciones(result.data);
      }
    } catch (error) {
      console.error('Error cargando aplicaciones:', error);
    }
  };

  const fetchFavoritos = async () => {
    if (!user?.id) return;
    
    try {
      const result = await favoritesAPI.getFavorites(user.id);
      if (result.success) {
        setFavoritos(result.data);
        
        // Crear mapa de favoritos para acceso rápido
        const map = {};
        result.data.forEach(fav => {
          map[fav.puesto_id] = true;
        });
        setFavoritesMap(map);
      }
    } catch (error) {
      console.error('Error cargando favoritos:', error);
    }
  };

  const handleToggleFavorite = async (vacanteId, e) => {
    e.stopPropagation(); // Prevenir que se abra el modal de aplicación
    
    try {
      const result = await favoritesAPI.toggleFavorite(vacanteId);
      if (result.success) {
        const { action, isFavorite } = result.data;
        
        // Actualizar el mapa de favoritos
        setFavoritesMap(prev => ({
          ...prev,
          [vacanteId]: isFavorite
        }));
        
        // Refrescar la lista de favoritos
        await fetchFavoritos();
        
        // Mostrar mensaje de confirmación
        const message = action === 'added' ? 'Agregado a favoritos ❤️' : 'Eliminado de favoritos 💔';
        console.log(message);
      }
    } catch (error) {
      console.error('Error actualizando favorito:', error);
    }
  };

  const handleApplyClick = (vacante) => {
    setApplicationModal({ isOpen: true, vacante });
  };

  const handleCloseModal = () => {
    setApplicationModal({ isOpen: false, vacante: null });
  };

  const handleSubmitApplication = async (applicationData) => {
    const result = await applicationsAPI.applyToJob(applicationData);
    
    if (result.success) {
      alert('¡Aplicación enviada exitosamente!');
      fetchMisAplicaciones();
      return result;
    } else {
      alert(`Error: ${result.error}`);
      return result;
    }
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      'pendiente': { text: 'Pendiente', class: 'status-pending' },
      'revisando': { text: 'En Revisión', class: 'status-reviewing' },
      'entrevista': { text: 'Entrevista', class: 'status-interview' },
      'aceptado': { text: 'Aceptado', class: 'status-accepted' },
      'rechazado': { text: 'Rechazado', class: 'status-rejected' }
    };
    
    const config = statusConfig[estado] || { text: estado, class: 'status-default' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
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
            <button 
              className={`nav-link ${activeTab === 'vacantes' ? 'active' : ''}`}
              onClick={() => setActiveTab('vacantes')}
            >
              Buscar Trabajo
            </button>
            <button 
              className={`nav-link ${activeTab === 'aplicaciones' ? 'active' : ''}`}
              onClick={() => setActiveTab('aplicaciones')}
            >
              Mis Aplicaciones ({aplicaciones.length})
            </button>
            <button 
              className={`nav-link ${activeTab === 'favoritos' ? 'active' : ''}`}
              onClick={() => setActiveTab('favoritos')}
            >
              Favoritos ({favoritos.length})
            </button>
            <Link to="/empleado/perfil" className="nav-link">Mi Perfil</Link>
            <span className="user-info">Hola, {user?.nombre}</span>
            <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        {activeTab === 'vacantes' && (
          <>
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
                      <div className="vacante-actions">
                        <button 
                          className={`favorite-btn ${favoritesMap[vacante.idPuestos] ? 'active' : ''}`}
                          onClick={(e) => handleToggleFavorite(vacante.idPuestos, e)}
                          title={favoritesMap[vacante.idPuestos] ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        >
                          {favoritesMap[vacante.idPuestos] ? '❤️' : '🤍'}
                        </button>
                        <button 
                          className="apply-btn"
                          onClick={() => handleApplyClick(vacante)}
                        >
                          Postularse
                        </button>
                      </div>
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
          </>
        )}

        {activeTab === 'aplicaciones' && (
          <>
            <div className="dashboard-header">
              <h2>Mis Aplicaciones</h2>
              <p className="subtitle">Revisa el estado de tus postulaciones</p>
            </div>

            <div className="dashboard-content">
              {aplicaciones.length === 0 ? (
                <div className="no-aplicaciones">
                  <p>No has aplicado a ninguna vacante aún</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveTab('vacantes')}
                  >
                    Buscar Trabajos
                  </button>
                </div>
              ) : (
                <div className="aplicaciones-list">
                  {aplicaciones.map((aplicacion) => (
                    <div key={aplicacion.idAplicacion} className="aplicacion-card">
                      <div className="aplicacion-header">
                        <div>
                          <h3>{aplicacion.puesto_titulo}</h3>
                          <p className="empresa-name">{aplicacion.empresa_nombre}</p>
                        </div>
                        {getStatusBadge(aplicacion.estado)}
                      </div>
                      
                      <div className="aplicacion-details">
                        <div className="detail-row">
                          <span className="label">Fecha de aplicación:</span>
                          <span>{new Date(aplicacion.fecha_aplicacion).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Salario esperado:</span>
                          <span>${aplicacion.salario_esperado?.toLocaleString() || 'No especificado'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Disponibilidad:</span>
                          <span>{aplicacion.disponibilidad || 'No especificada'}</span>
                        </div>
                      </div>

                      {aplicacion.carta_presentacion && (
                        <div className="carta-presentacion">
                          <h4>Carta de Presentación:</h4>
                          <p>{aplicacion.carta_presentacion}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'favoritos' && (
          <>
            <div className="dashboard-header">
              <h2>Mis Favoritos</h2>
              <p className="subtitle">Vacantes que has guardado para revisar más tarde</p>
            </div>

            <div className="dashboard-content">
              {favoritos.length === 0 ? (
                <div className="no-favoritos">
                  <p>No tienes vacantes favoritas aún</p>
                  <p>💡 Usa el ícono ❤️ en las vacantes para guardarlas aquí</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveTab('vacantes')}
                  >
                    Explorar Vacantes
                  </button>
                </div>
              ) : (
                <div className="vacantes-grid">
                  {favoritos.map((favorito) => (
                    <div key={favorito.idFavorito} className="vacante-card favorito-card">
                      <div className="vacante-header">
                        <h3>{favorito.Tipo_Puesto}</h3>
                        <span className="empresa">{favorito.Nombre_Empresa}</span>
                        <span className="fecha-favorito">
                          ❤️ {new Date(favorito.fecha_agregado).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="vacante-details">
                        <p className="ubicacion">📍 {favorito.Ubicacion || 'No especificada'}</p>
                        <p className="salario">💰 ${favorito.Salario || 'A negociar'}</p>
                        <p className="horario">🕒 {favorito.Horario || 'No especificado'}</p>
                      </div>
                      <div className="vacante-actions">
                        <button 
                          className="favorite-btn active"
                          onClick={(e) => handleToggleFavorite(favorito.puesto_id, e)}
                          title="Quitar de favoritos"
                        >
                          ❤️
                        </button>
                        <button 
                          className="apply-btn"
                          onClick={() => handleApplyClick({
                            idPuestos: favorito.puesto_id,
                            Tipo_Puesto: favorito.Tipo_Puesto,
                            Nombre_Empresa: favorito.Nombre_Empresa,
                            Ubicacion: favorito.Ubicacion,
                            Salario: favorito.Salario,
                            Horario: favorito.Horario
                          })}
                        >
                          Postularse
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <ApplicationModal
        isOpen={applicationModal.isOpen}
        onClose={handleCloseModal}
        vacante={applicationModal.vacante}
        onSubmit={handleSubmitApplication}
      />
    </div>
  );
};

export default EmpleadoDashboard;