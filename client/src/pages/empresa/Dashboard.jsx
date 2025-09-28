import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import '../../styles/Dashboard.css';
import '../../styles/Applications.css';
import '../../styles/ApplicationManagement.css';

const EmpresaDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('vacantes');
  const [vacantes, setVacantes] = useState([]);
  const [aplicaciones, setAplicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAplicacion, setSelectedAplicacion] = useState(null);
  const [vacanteEditando, setVacanteEditando] = useState(null);

  const [filters, setFilters] = useState({
    estado: '',
    puesto: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [nuevaVacante, setNuevaVacante] = useState({
    tipo_puesto: '',
    salario: '',
    horario: '',
    ubicacion: ''
  });

  useEffect(() => {
    // Cargar ambos datos al inicio para tener counts correctos
    fetchVacantes();
    fetchAplicaciones();
  }, []);

  useEffect(() => {
    if (activeTab === 'vacantes') {
      fetchVacantes();
    } else if (activeTab === 'aplicaciones') {
      fetchAplicaciones();
    }
  }, [activeTab]);

  const fetchVacantes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/empresa/vacantes/${user.id}`);
      setVacantes(response.data);
    } catch (error) {
      console.error('Error cargando vacantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAplicaciones = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/empresa/aplicaciones/${user.id}`);
      setAplicaciones(response.data);
    } catch (error) {
      console.error('Error cargando aplicaciones:', error);
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
      alert('✅ Vacante creada exitosamente');
    } catch (error) {
      console.error('Error creando vacante:', error);
      const errorMessage = error.response?.data?.error || 'Error al crear la vacante';
      alert(`❌ Error: ${errorMessage}`);
    }
  };

  const handleUpdateEstado = async (aplicacionId, nuevoEstado, notas = '') => {
    try {
      await api.put(`/empresa/aplicacion/${aplicacionId}`, {
        estado: nuevoEstado,
        notas_empresa: notas
      });
      
      // Actualizar la aplicación local inmediatamente para mejor UX
      if (selectedAplicacion && selectedAplicacion.idAplicacion === aplicacionId) {
        setSelectedAplicacion({
          ...selectedAplicacion,
          estado: nuevoEstado,
          notas_empresa: notas
        });
      }
      
      fetchAplicaciones(); // Refresh applications
      
      // Mostrar feedback de éxito
      alert('Estado actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando aplicación:', error);
      alert('Error actualizando estado: ' + (error.response?.data?.error || 'Error desconocido'));
    }
  };

  const getStatusBadge = (estado) => {
    const statusMap = {
      'pendiente': { text: 'Pendiente', className: 'status-pending' },
      'revisando': { text: 'Revisando', className: 'status-reviewing' },
      'entrevista': { text: 'Entrevista', className: 'status-interview' },
      'aceptado': { text: 'Aceptado', className: 'status-accepted' },
      'rechazado': { text: 'Rechazado', className: 'status-rejected' }
    };
    
    const status = statusMap[estado] || { text: estado, className: 'status-default' };
    return <span className={`status-badge ${status.className}`}>{status.text}</span>;
  };

  const filterAplicaciones = () => {
    return aplicaciones.filter(app => {
      if (filters.estado && app.estado !== filters.estado) return false;
      if (filters.puesto && !app.puesto_titulo.toLowerCase().includes(filters.puesto.toLowerCase())) return false;
      if (filters.fechaDesde) {
        const fechaApp = new Date(app.fecha_aplicacion);
        const fechaDesde = new Date(filters.fechaDesde);
        if (fechaApp < fechaDesde) return false;
      }
      if (filters.fechaHasta) {
        const fechaApp = new Date(app.fecha_aplicacion);
        const fechaHasta = new Date(filters.fechaHasta);
        // Ajustar hasta al final del día
        fechaHasta.setHours(23, 59, 59, 999);
        if (fechaApp > fechaHasta) return false;
      }
      return true;
    });
  };

  const resetFilters = () => {
    setFilters({
      estado: '',
      puesto: '',
      fechaDesde: '',
      fechaHasta: ''
    });
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
        {/* Tabs de navegación */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'vacantes' ? 'active' : ''}`}
            onClick={() => setActiveTab('vacantes')}
          >
            📋 Mis Vacantes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'aplicaciones' ? 'active' : ''}`}
            onClick={() => setActiveTab('aplicaciones')}
          >
            👥 Aplicaciones ({aplicaciones.length})
          </button>
        </div>

        {/* Contenido de Vacantes */}
        {activeTab === 'vacantes' && (
          <>
            <div className="dashboard-header">
              <h2>Mis Vacantes</h2>
              <button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn-primary"
              >
                {showCreateForm ? 'Cancelar' : 'Crear Nueva Vacante'}
              </button>
            </div>
          </>
        )}

        {/* Contenido de Aplicaciones */}
        {activeTab === 'aplicaciones' && (
          <>
            <div className="dashboard-header">
              <h2>Gestión de Aplicaciones</h2>
              <div className="aplicaciones-stats">
                <div className="stat-item">
                  <span className="stat-number">{aplicaciones.filter(a => a.estado === 'pendiente').length}</span>
                  <span className="stat-label">Pendientes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{aplicaciones.filter(a => a.estado === 'entrevista').length}</span>
                  <span className="stat-label">Entrevistas</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{aplicaciones.filter(a => a.estado === 'aceptado').length}</span>
                  <span className="stat-label">Aceptados</span>
                </div>
              </div>
            </div>

            {/* Filtros de aplicaciones */}
            <div className="aplicaciones-filters">
              <div className="filters-row">
                <select 
                  value={filters.estado} 
                  onChange={(e) => setFilters({...filters, estado: e.target.value})}
                  className="filter-select"
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="revisando">Revisando</option>
                  <option value="entrevista">Entrevista</option>
                  <option value="aceptado">Aceptado</option>
                  <option value="rechazado">Rechazado</option>
                </select>

                <input
                  type="text"
                  placeholder="Buscar por puesto..."
                  value={filters.puesto}
                  onChange={(e) => setFilters({...filters, puesto: e.target.value})}
                  className="filter-input"
                />

                <input
                  type="date"
                  value={filters.fechaDesde}
                  onChange={(e) => setFilters({...filters, fechaDesde: e.target.value})}
                  className="filter-input"
                  placeholder="Desde"
                />

                <input
                  type="date"
                  value={filters.fechaHasta}
                  onChange={(e) => setFilters({...filters, fechaHasta: e.target.value})}
                  className="filter-input"
                  placeholder="Hasta"
                />

                {(filters.estado || filters.puesto || filters.fechaDesde || filters.fechaHasta) && (
                  <button onClick={resetFilters} className="btn-secondary">
                    Limpiar Filtros
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Lista de aplicaciones */}
        {activeTab === 'aplicaciones' && (
          <div className="aplicaciones-content">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner">⏳</div>
                <p>Cargando aplicaciones...</p>
              </div>
            ) : filterAplicaciones().length === 0 ? (
              <div className="no-aplicaciones">
                <div className="empty-icon">📭</div>
                <p>
                  {aplicaciones.length === 0 
                    ? 'No hay aplicaciones aún' 
                    : 'No se encontraron aplicaciones con los filtros aplicados'
                  }
                </p>
                {aplicaciones.length === 0 && (
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveTab('vacantes')}
                  >
                    Crear Vacante
                  </button>
                )}
              </div>
            ) : (
              <div className="aplicaciones-grid">
                {filterAplicaciones().map((aplicacion) => (
                  <div key={aplicacion.idAplicacion} className="aplicacion-card">
                    <div className="aplicacion-header">
                      <div className="candidato-info">
                        <div className="candidato-avatar">
  {aplicacion.candidato_foto ? (
    <img
      src={`http://localhost:3001${aplicacion.candidato_foto}`}
      alt={aplicacion.candidato_nombre}
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        objectFit: "cover"
      }}
    />
  ) : (
    <span>{aplicacion.candidato_nombre?.charAt(0) || 'U'}</span>
  )}
</div>

                        <div className="candidato-details">
                          <h3>{aplicacion.candidato_nombre}</h3>
                          <p>{aplicacion.candidato_email}</p>
                          <p className="puesto-aplicado">{aplicacion.puesto_titulo}</p>
                        </div>
                      </div>
                      {getStatusBadge(aplicacion.estado)}
                    </div>

                    <div className="aplicacion-info">
                      <div className="info-row">
                        <span className="info-label">📅 Aplicó:</span>
                        <span>{new Date(aplicacion.fecha_aplicacion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                      
                      {aplicacion.salario_esperado && (
                        <div className="info-row">
                          <span className="info-label">💰 Salario esperado:</span>
                          <span>${aplicacion.salario_esperado.toLocaleString()}</span>
                        </div>
                      )}

                      {aplicacion.disponibilidad && (
                        <div className="info-row">
                          <span className="info-label">⏰ Disponibilidad:</span>
                          <span>{aplicacion.disponibilidad}</span>
                        </div>
                      )}
                    </div>

                    {aplicacion.carta_presentacion && (
                      <div className="carta-preview">
                        <h4>Carta de presentación:</h4>
                        <p>{aplicacion.carta_presentacion.substring(0, 150)}...</p>
                      </div>
                    )}

                    <div className="aplicacion-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => setSelectedAplicacion(aplicacion)}
                      >
                        Ver Detalles
                      </button>
                      
                      {aplicacion.estado === 'pendiente' && (
                        <div className="quick-actions">
                          <button
                            className="btn-success btn-sm"
                            onClick={() => handleUpdateEstado(aplicacion.idAplicacion, 'revisando')}
                          >
                            ✓ Revisar
                          </button>
                          <button
                            className="btn-danger btn-sm"
                            onClick={() => handleUpdateEstado(aplicacion.idAplicacion, 'rechazado')}
                          >
                            ✕ Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal de detalle de candidato */}
        {selectedAplicacion && (
          <div className="modal-overlay" onClick={() => setSelectedAplicacion(null)}>
            <div className="modal-content aplicacion-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Detalle del Candidato</h2>
                <button 
                  className="modal-close"
                  onClick={() => setSelectedAplicacion(null)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="candidato-profile">
                  <div className="candidato-avatar">
  {aplicacion.candidato_foto ? (
    <img
      src={`http://localhost:3001${aplicacion.candidato_foto}`}
      alt={aplicacion.candidato_nombre}
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        objectFit: "cover"
      }}
    />
  ) : (
    <span>{aplicacion.candidato_nombre?.charAt(0) || 'U'}</span>
  )}
</div>

                  <div className="candidato-info-detail">
                    <h3>{selectedAplicacion.candidato_nombre}</h3>
                    <p>{selectedAplicacion.candidato_email}</p>
                    {selectedAplicacion.candidato_telefono && (
                      <p>📞 {selectedAplicacion.candidato_telefono}</p>
                    )}
                    <p className="puesto-detail">Aplicó para: <strong>{selectedAplicacion.puesto_titulo}</strong></p>
                  </div>
                  {getStatusBadge(selectedAplicacion.estado)}
                </div>

                <div className="aplicacion-full-details">
                  <div className="detail-section">
                    <h4>Información de la Aplicación</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="label">Fecha de aplicación:</span>
                        <span>{new Date(selectedAplicacion.fecha_aplicacion).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      
                      {selectedAplicacion.salario_esperado && (
                        <div className="detail-item">
                          <span className="label">Salario esperado:</span>
                          <span>${selectedAplicacion.salario_esperado.toLocaleString()} MXN</span>
                        </div>
                      )}

                      {selectedAplicacion.disponibilidad && (
                        <div className="detail-item">
                          <span className="label">Disponibilidad:</span>
                          <span>{selectedAplicacion.disponibilidad}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedAplicacion.carta_presentacion && (
                    <div className="detail-section">
                      <h4>Carta de Presentación</h4>
                      <div className="carta-completa">
                        <p>{selectedAplicacion.carta_presentacion}</p>
                      </div>
                    </div>
                  )}

                  {selectedAplicacion.notas_empresa && (
                    <div className="detail-section">
                      <h4>Notas Internas</h4>
                      <div className="notas-empresa">
                        <p>{selectedAplicacion.notas_empresa}</p>
                      </div>
                    </div>
                  )}

                  <div className="detail-section">
                    <h4>Gestionar Estado</h4>
                    <div className="estado-management">
                      <div className="estado-buttons">
                        <button
                          className={`estado-btn ${selectedAplicacion.estado === 'pendiente' ? 'active' : ''}`}
                          onClick={() => handleUpdateEstado(selectedAplicacion.idAplicacion, 'pendiente')}
                        >
                          Pendiente
                        </button>
                        <button
                          className={`estado-btn ${selectedAplicacion.estado === 'revisando' ? 'active' : ''}`}
                          onClick={() => handleUpdateEstado(selectedAplicacion.idAplicacion, 'revisando')}
                        >
                          Revisando
                        </button>
                        <button
                          className={`estado-btn ${selectedAplicacion.estado === 'entrevista' ? 'active' : ''}`}
                          onClick={() => handleUpdateEstado(selectedAplicacion.idAplicacion, 'entrevista')}
                        >
                          Entrevista
                        </button>
                        <button
                          className={`estado-btn success ${selectedAplicacion.estado === 'aceptado' ? 'active' : ''}`}
                          onClick={() => handleUpdateEstado(selectedAplicacion.idAplicacion, 'aceptado')}
                        >
                          Aceptado
                        </button>
                        <button
                          className={`estado-btn danger ${selectedAplicacion.estado === 'rechazado' ? 'active' : ''}`}
                          onClick={() => handleUpdateEstado(selectedAplicacion.idAplicacion, 'rechazado')}
                        >
                          Rechazado
                        </button>
                      </div>

                      <div className="notas-form">
                        <textarea
                          placeholder="Agregar notas internas sobre este candidato..."
                          rows="3"
                          className="notas-textarea"
                          defaultValue={selectedAplicacion.notas_empresa || ''}
                          onBlur={(e) => {
                            if (e.target.value !== selectedAplicacion.notas_empresa) {
                              handleUpdateEstado(selectedAplicacion.idAplicacion, selectedAplicacion.estado, e.target.value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCreateForm && activeTab === 'vacantes' && (
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

        {/* Contenido de vacantes */}
        {activeTab === 'vacantes' && (
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
                      <button 
                        className="btn-secondary"
                        onClick={() => setActiveTab('aplicaciones')}
                      >
                        Ver Candidatos
                      </button>
                     <button 
                       className="btn-outline"
                       onClick={() => setVacanteEditando(vacante)}
                       >
                       Editar
                       </button>

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
        )}
         {/* ✅ Formulario para editar vacante */}
    {vacanteEditando && (
  <div className="modal-overlay" onClick={() => setVacanteEditando(null)}>
    <div 
      className="modal-content" 
      onClick={(e) => e.stopPropagation()} // evita cerrar al hacer click dentro
    >
      <h2>✏️ Editar Vacante</h2>

      <form 
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            console.log("📤 Enviando actualización:", vacanteEditando);
            const response = await api.put(`/empresa/vacante/${vacanteEditando.idPuestos}`, {
              Tipo_Puesto: vacanteEditando.Tipo_Puesto,
              Salario: vacanteEditando.Salario,
              Horario: vacanteEditando.Horario,
              Ubicacion: vacanteEditando.Ubicacion
            });
            console.log("✅ [FRONT SUCCESS]:", response.data);
            alert("✅ Vacante actualizada correctamente");
            fetchVacantes();
            setVacanteEditando(null);
          } catch (error) {
            console.error("❌ [FRONT ERROR]:", error.response?.data || error.message);
            alert("❌ Error al actualizar vacante");
          }
        }}
        className="form-vacante"
      >
        <div className="form-group">
          <label>Tipo de Puesto</label>
          <input
            type="text"
            value={vacanteEditando.Tipo_Puesto}
            onChange={(e) => setVacanteEditando({ ...vacanteEditando, Tipo_Puesto: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Salario</label>
          <input
            type="number"
            value={vacanteEditando.Salario}
            onChange={(e) => setVacanteEditando({ ...vacanteEditando, Salario: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Horario</label>
          <input
            type="text"
            value={vacanteEditando.Horario}
            onChange={(e) => setVacanteEditando({ ...vacanteEditando, Horario: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Ubicación</label>
          <input
            type="text"
            value={vacanteEditando.Ubicacion}
            onChange={(e) => setVacanteEditando({ ...vacanteEditando, Ubicacion: e.target.value })}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">💾 Guardar cambios</button>

          <button 
            type="button" 
            className="btn-danger"
            onClick={async () => {
              if (window.confirm("⚠️ ¿Seguro que quieres eliminar esta vacante?")) {
                try {
                  console.log("📤 Eliminando vacante:", vacanteEditando.idPuestos);
                  const response = await api.delete(`/vacantes/${vacanteEditando.idPuestos}`);
                  console.log("✅ [FRONT SUCCESS]:", response.data);
                  alert("🗑️ Vacante eliminada correctamente");
                  fetchVacantes();
                  setVacanteEditando(null);
                } catch (error) {
                  console.error("❌ [FRONT ERROR]:", error.response?.data || error.message);
                  alert("❌ Error eliminando vacante");
                }
              }
            }}
          >
            🗑️ Eliminar
          </button>

          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setVacanteEditando(null)}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      </main>
    </div>
    
  );
  

};

export default EmpresaDashboard;