import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import '../../styles/Dashboard.css';
import '../../styles/BuscarCandidatos.css';

const BuscarCandidatos = () => {
  const { user } = useAuth();
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [favoritos, setFavoritos] = useState([]);
  const [favoritosMap, setFavoritosMap] = useState({});
  const [filters, setFilters] = useState({
    experiencia: '',
    ubicacion: ''
  });

  useEffect(() => {
    fetchCandidatos();
    fetchFavoritos();
  }, []);

  const fetchCandidatos = async () => {
    try {
      const response = await api.get('/empresa/candidatos');
      setCandidatos(response.data);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoritos = async () => {
    if (!user?.id) return;
    
    try {
      const response = await api.get(`/empresa/favoritos/${user.id}`);
      setFavoritos(response.data);
      
      // Crear mapa de favoritos para acceso rápido
      const map = {};
      response.data.forEach(fav => {
        map[fav.candidato_id] = true;
      });
      setFavoritosMap(map);
    } catch (error) {
      // Error handled silently
    }
  };

  const handleToggleFavorite = async (candidatoId, e) => {
    e.stopPropagation();
    
    try {
      const isFavorite = favoritosMap[candidatoId];
      const endpoint = isFavorite ? 'remove' : 'add';
      
      await api.post(`/empresa/favoritos/${endpoint}`, {
        empresa_id: user.id,
        candidato_id: candidatoId
      });
      
      // Actualizar estado local
      setFavoritosMap(prev => ({
        ...prev,
        [candidatoId]: !isFavorite
      }));
      
      // Recargar favoritos para mantener sincronización
      await fetchFavoritos();
    } catch (error) {
      // Error handled silently
    }
  };

  const filteredCandidatos = candidatos.filter(candidato => {
    const matchesSearch = candidato.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidato.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidato.experiencia?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesExperiencia = !filters.experiencia || 
                              candidato.experiencia?.toLowerCase().includes(filters.experiencia.toLowerCase());
    
    const matchesUbicacion = !filters.ubicacion || 
                            candidato.ubicacion?.toLowerCase().includes(filters.ubicacion.toLowerCase());
    
    return matchesSearch && matchesExperiencia && matchesUbicacion;
  });

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="header-left">
            <Link to="/empresa/dashboard" className="btn-back">← Volver al Dashboard</Link>
            <h1>🔍 Buscar Candidatos</h1>
          </div>
        </div>
        <div className="loading">Cargando candidatos...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <Link to="/empresa/dashboard" className="btn-back">← Volver al Dashboard</Link>
          <h1>🔍 Buscar Candidatos</h1>
        </div>
      </div>

      {/* Filtros de búsqueda */}
      <div className="search-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o experiencia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters-row">
          <select
            value={filters.experiencia}
            onChange={(e) => setFilters({...filters, experiencia: e.target.value})}
            className="filter-select"
          >
            <option value="">Todos los niveles de experiencia</option>
            <option value="junior">Junior</option>
            <option value="medio">Medio</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </select>
          
          <input
            type="text"
            placeholder="Filtrar por ubicación..."
            value={filters.ubicacion}
            onChange={(e) => setFilters({...filters, ubicacion: e.target.value})}
            className="filter-input"
          />
        </div>
      </div>

      {/* Lista de candidatos */}
      <div className="candidatos-grid">
        {filteredCandidatos.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">👥</div>
            <h3>No se encontraron candidatos</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          filteredCandidatos.map((candidato) => (
            <div key={candidato.id} className="candidato-card">
              <div className="candidato-header">
                <div className="candidato-avatar">
                  {candidato.foto_perfil ? (
                    <img 
                      src={`http://localhost:3001${candidato.foto_perfil}`} 
                      alt={candidato.nombre}
                      className="avatar-img"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {candidato.nombre?.charAt(0)?.toUpperCase() || '👤'}
                    </div>
                  )}
                </div>
                
                <div className="candidato-info">
                  <h3 className="candidato-nombre">{candidato.nombre}</h3>
                  <p className="candidato-telefono">📞 {candidato.telefono}</p>
                </div>
                
                <button
                  className={`btn-favorite ${favoritosMap[candidato.id] ? 'favorited' : ''}`}
                  onClick={(e) => handleToggleFavorite(candidato.id, e)}
                  title={favoritosMap[candidato.id] ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  {favoritosMap[candidato.id] ? '❤️' : '🤍'}
                </button>
              </div>
              
              {candidato.descripcion && (
                <div className="candidato-descripcion">
                  <h4>Descripción:</h4>
                  <p>{candidato.descripcion}</p>
                </div>
              )}
              
              {candidato.experiencia && (
                <div className="candidato-experiencia">
                  <h4>Experiencia:</h4>
                  <p>{candidato.experiencia}</p>
                </div>
              )}
              
              <div className="candidato-actions">
                <button className="btn-contact">
                  📧 Contactar
                </button>
                <button className="btn-view-profile">
                  👤 Ver Perfil Completo
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BuscarCandidatos;