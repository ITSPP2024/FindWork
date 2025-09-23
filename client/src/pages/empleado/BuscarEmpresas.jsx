import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import '../../styles/Dashboard.css';
import '../../styles/BuscarEmpresas.css';

const BuscarEmpresas = () => {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [favoritos, setFavoritos] = useState([]);
  const [favoritosMap, setFavoritosMap] = useState({});
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [filters, setFilters] = useState({
    ubicacion: '',
    industria: ''
  });

  useEffect(() => {
    fetchEmpresas();
    fetchFavoritos();
  }, []);

  const fetchEmpresas = async () => {
    try {
      const response = await api.get('/empleado/empresas');
      setEmpresas(response.data);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoritos = async () => {
    if (!user?.id) return;
    
    try {
      const response = await api.get(`/empleado/favoritos/${user.id}`);
      setFavoritos(response.data);
      
      // Crear mapa de favoritos para acceso rápido
      const map = {};
      response.data.forEach(fav => {
        map[fav.empresa_id] = true;
      });
      setFavoritosMap(map);
    } catch (error) {
      // Error handled silently
    }
  };

  const fetchEmpresaVacantes = async (empresaId) => {
    try {
      const response = await api.get(`/empleado/empresa-vacantes/${empresaId}`);
      return response.data;
    } catch (error) {
      return [];
    }
  };

  const handleToggleFavorite = async (empresaId, e) => {
    e.stopPropagation();
    
    try {
      const isFavorite = favoritosMap[empresaId];
      const endpoint = isFavorite ? 'remove' : 'add';
      
      await api.post(`/empleado/favoritos/${endpoint}`, {
        candidato_id: user.id,
        empresa_id: empresaId
      });
      
      // Actualizar estado local
      setFavoritosMap(prev => ({
        ...prev,
        [empresaId]: !isFavorite
      }));
      
      // Recargar favoritos para mantener sincronización
      await fetchFavoritos();
    } catch (error) {
      // Error handled silently
    }
  };

  const handleViewEmpresa = async (empresa) => {
    const vacantes = await fetchEmpresaVacantes(empresa.id);
    setSelectedEmpresa({ ...empresa, vacantes });
  };

  const filteredEmpresas = empresas.filter(empresa => {
    const matchesSearch = empresa.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         empresa.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         empresa.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUbicacion = !filters.ubicacion || 
                            empresa.ubicacion?.toLowerCase().includes(filters.ubicacion.toLowerCase());
    
    const matchesIndustria = !filters.industria || 
                            empresa.descripcion?.toLowerCase().includes(filters.industria.toLowerCase());
    
    return matchesSearch && matchesUbicacion && matchesIndustria;
  });

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="header-left">
            <Link to="/empleado/dashboard" className="btn-back">← Volver al Dashboard</Link>
            <h1>🏢 Buscar Empresas</h1>
          </div>
        </div>
        <div className="loading">Cargando empresas...</div>
      </div>
    );
  }

  if (selectedEmpresa) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="header-left">
            <button 
              onClick={() => setSelectedEmpresa(null)} 
              className="btn-back"
            >
              ← Volver a Empresas
            </button>
            <h1>🏢 {selectedEmpresa.nombre}</h1>
          </div>
        </div>

        <div className="empresa-detail">
          <div className="empresa-header">
            <div className="empresa-avatar">
              {selectedEmpresa.foto_perfil ? (
                <img 
                  src={`http://localhost:3001${selectedEmpresa.foto_perfil}`} 
                  alt={selectedEmpresa.nombre}
                  className="avatar-img-large"
                />
              ) : (
                <div className="avatar-placeholder-large">
                  {selectedEmpresa.nombre?.charAt(0)?.toUpperCase() || '🏢'}
                </div>
              )}
            </div>
            
            <div className="empresa-info">
              <h2>{selectedEmpresa.nombre}</h2>
              {selectedEmpresa.ubicacion && (
                <p className="empresa-ubicacion">📍 {selectedEmpresa.ubicacion}</p>
              )}
              {selectedEmpresa.telefono && (
                <p className="empresa-telefono">📞 {selectedEmpresa.telefono}</p>
              )}
              
              <div className="empresa-stats">
                <div className="stat-item">
                  <span className="stat-number">{selectedEmpresa.vacantes?.length || 0}</span>
                  <span className="stat-label">Vacantes Activas</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {favoritosMap[selectedEmpresa.id] ? '❤️' : '🤍'}
                  </span>
                  <span className="stat-label">
                    <button
                      className="btn-favorite-text"
                      onClick={(e) => handleToggleFavorite(selectedEmpresa.id, e)}
                    >
                      {favoritosMap[selectedEmpresa.id] ? 'En Favoritos' : 'Agregar a Favoritos'}
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {selectedEmpresa.descripcion && (
            <div className="empresa-section">
              <h3>📝 Descripción de la Empresa</h3>
              <p>{selectedEmpresa.descripcion}</p>
            </div>
          )}

          <div className="empresa-section">
            <h3>💼 Vacantes Disponibles ({selectedEmpresa.vacantes?.length || 0})</h3>
            {selectedEmpresa.vacantes?.length > 0 ? (
              <div className="vacantes-grid">
                {selectedEmpresa.vacantes.map((vacante) => (
                  <div key={vacante.id} className="vacante-card">
                    <h4>{vacante.tipo_puesto}</h4>
                    <div className="vacante-details">
                      <p><strong>💰 Salario:</strong> {vacante.salario}</p>
                      <p><strong>⏰ Horario:</strong> {vacante.horario}</p>
                      <p><strong>📍 Ubicación:</strong> {vacante.ubicacion}</p>
                    </div>
                    <button className="btn-apply">
                      📄 Aplicar a esta Vacante
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-vacantes">Esta empresa no tiene vacantes disponibles en este momento.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <Link to="/empleado/dashboard" className="btn-back">← Volver al Dashboard</Link>
          <h1>🏢 Buscar Empresas</h1>
        </div>
      </div>

      {/* Filtros de búsqueda */}
      <div className="search-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters-row">
          <input
            type="text"
            placeholder="Filtrar por ubicación..."
            value={filters.ubicacion}
            onChange={(e) => setFilters({...filters, ubicacion: e.target.value})}
            className="filter-input"
          />
          
          <input
            type="text"
            placeholder="Filtrar por industria..."
            value={filters.industria}
            onChange={(e) => setFilters({...filters, industria: e.target.value})}
            className="filter-input"
          />
        </div>
      </div>

      {/* Lista de empresas */}
      <div className="empresas-grid">
        {filteredEmpresas.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🏢</div>
            <h3>No se encontraron empresas</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          filteredEmpresas.map((empresa) => (
            <div key={empresa.id} className="empresa-card" onClick={() => handleViewEmpresa(empresa)}>
              <div className="empresa-header">
                <div className="empresa-avatar">
                  {empresa.foto_perfil ? (
                    <img 
                      src={`http://localhost:3001${empresa.foto_perfil}`} 
                      alt={empresa.nombre}
                      className="avatar-img"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {empresa.nombre?.charAt(0)?.toUpperCase() || '🏢'}
                    </div>
                  )}
                </div>
                
                <div className="empresa-info">
                  <h3 className="empresa-nombre">{empresa.nombre}</h3>
                  {empresa.ubicacion && (
                    <p className="empresa-ubicacion">📍 {empresa.ubicacion}</p>
                  )}
                  {empresa.telefono && (
                    <p className="empresa-telefono">📞 {empresa.telefono}</p>
                  )}
                </div>
                
                <button
                  className={`btn-favorite ${favoritosMap[empresa.id] ? 'favorited' : ''}`}
                  onClick={(e) => handleToggleFavorite(empresa.id, e)}
                  title={favoritosMap[empresa.id] ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  {favoritosMap[empresa.id] ? '❤️' : '🤍'}
                </button>
              </div>
              
              {empresa.descripcion && (
                <div className="empresa-descripcion">
                  <p>{empresa.descripcion}</p>
                </div>
              )}
              
              <div className="empresa-actions">
                <div className="empresa-stats">
                  <span className="stat-badge">💼 Ver Vacantes</span>
                  <span className="view-detail">👁️ Ver Perfil Completo</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BuscarEmpresas;