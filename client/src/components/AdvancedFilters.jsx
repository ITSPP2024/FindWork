import React, { useState, useEffect } from 'react';
import './AdvancedFilters.css';

const AdvancedFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    onFiltersChange(newFilters);
  };

  const handleSalaryChange = (type, value) => {
    const newSalaryFilter = { ...filters.salary, [type]: value };
    handleFilterChange('salary', newSalaryFilter);
  };

  const clearAllFilters = () => {
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.ubicacion) count++;
    if (filters.tipoTrabajo) count++;
    if (filters.experiencia) count++;
    if (filters.fecha) count++;
    if (filters.salary?.min || filters.salary?.max) count++;
    return count;
  };

  return (
    <div className="advanced-filters">
      <div className="filters-header">
        <button 
          className={`filters-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          🔍 Filtros Avanzados
          {getActiveFiltersCount() > 0 && (
            <span className="filters-badge">{getActiveFiltersCount()}</span>
          )}
        </button>
        
        {getActiveFiltersCount() > 0 && (
          <button 
            className="clear-filters-btn"
            onClick={clearAllFilters}
            title="Limpiar todos los filtros"
          >
            ✖️ Limpiar
          </button>
        )}
      </div>

      {showFilters && (
        <div className="filters-content">
          <div className="filters-grid">
            {/* Filtro por Ubicación */}
            <div className="filter-group">
              <label className="filter-label">📍 Ubicación</label>
              <select 
                value={filters.ubicacion || ''}
                onChange={(e) => handleFilterChange('ubicacion', e.target.value)}
                className="filter-select"
              >
                <option value="">Todas las ubicaciones</option>
                <option value="Ciudad de México">Ciudad de México</option>
                <option value="Guadalajara">Guadalajara</option>
                <option value="Monterrey">Monterrey</option>
                <option value="Tijuana">Tijuana</option>
                <option value="Puebla">Puebla</option>
                <option value="Mérida">Mérida</option>
                <option value="Remoto">Remoto</option>
              </select>
            </div>

            {/* Filtro por Tipo de Trabajo */}
            <div className="filter-group">
              <label className="filter-label">💼 Tipo de Trabajo</label>
              <select 
                value={filters.tipoTrabajo || ''}
                onChange={(e) => handleFilterChange('tipoTrabajo', e.target.value)}
                className="filter-select"
              >
                <option value="">Todos los tipos</option>
                <option value="Tiempo completo">Tiempo completo</option>
                <option value="Medio tiempo">Medio tiempo</option>
                <option value="Por proyecto">Por proyecto</option>
                <option value="Freelance">Freelance</option>
                <option value="Prácticas">Prácticas</option>
              </select>
            </div>

            {/* Filtro por Experiencia */}
            <div className="filter-group">
              <label className="filter-label">🎯 Nivel de Experiencia</label>
              <select 
                value={filters.experiencia || ''}
                onChange={(e) => handleFilterChange('experiencia', e.target.value)}
                className="filter-select"
              >
                <option value="">Cualquier nivel</option>
                <option value="Entry Level">Entry Level (0-1 años)</option>
                <option value="Junior">Junior (1-3 años)</option>
                <option value="Mid Level">Mid Level (3-5 años)</option>
                <option value="Senior">Senior (5+ años)</option>
                <option value="Lead">Lead/Manager</option>
              </select>
            </div>

            {/* Filtro por Fecha */}
            <div className="filter-group">
              <label className="filter-label">📅 Fecha de Publicación</label>
              <select 
                value={filters.fecha || ''}
                onChange={(e) => handleFilterChange('fecha', e.target.value)}
                className="filter-select"
              >
                <option value="">Cualquier fecha</option>
                <option value="today">Hoy</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="3months">Últimos 3 meses</option>
              </select>
            </div>

            {/* Filtro por Rango de Salario */}
            <div className="filter-group salary-group">
              <label className="filter-label">💰 Rango de Salario (MXN)</label>
              <div className="salary-inputs">
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={filters.salary?.min || ''}
                  onChange={(e) => handleSalaryChange('min', e.target.value)}
                  className="salary-input"
                  min="0"
                  step="1000"
                />
                <span className="salary-separator">-</span>
                <input
                  type="number"
                  placeholder="Máximo"
                  value={filters.salary?.max || ''}
                  onChange={(e) => handleSalaryChange('max', e.target.value)}
                  className="salary-input"
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            {/* Filtros rápidos predefinidos */}
            <div className="filter-group quick-filters">
              <label className="filter-label">⚡ Filtros Rápidos</label>
              <div className="quick-filter-buttons">
                <button 
                  className="quick-filter-btn"
                  onClick={() => {
                    onFiltersChange({
                      ubicacion: 'Remoto',
                      tipoTrabajo: 'Tiempo completo',
                      experiencia: 'Mid Level'
                    });
                  }}
                >
                  Remoto + Mid Level
                </button>
                <button 
                  className="quick-filter-btn"
                  onClick={() => {
                    onFiltersChange({
                      fecha: 'week',
                      salary: { min: '30000', max: '60000' }
                    });
                  }}
                >
                  Nuevos + 30k-60k
                </button>
                <button 
                  className="quick-filter-btn"
                  onClick={() => {
                    onFiltersChange({
                      experiencia: 'Entry Level',
                      tipoTrabajo: 'Prácticas'
                    });
                  }}
                >
                  Entry Level
                </button>
              </div>
            </div>
          </div>

          {/* Resumen de filtros activos */}
          {getActiveFiltersCount() > 0 && (
            <div className="active-filters-summary">
              <h4>Filtros Activos:</h4>
              <div className="active-filters-tags">
                {filters.ubicacion && (
                  <span className="filter-tag">
                    📍 {filters.ubicacion}
                    <button onClick={() => handleFilterChange('ubicacion', '')}>×</button>
                  </span>
                )}
                {filters.tipoTrabajo && (
                  <span className="filter-tag">
                    💼 {filters.tipoTrabajo}
                    <button onClick={() => handleFilterChange('tipoTrabajo', '')}>×</button>
                  </span>
                )}
                {filters.experiencia && (
                  <span className="filter-tag">
                    🎯 {filters.experiencia}
                    <button onClick={() => handleFilterChange('experiencia', '')}>×</button>
                  </span>
                )}
                {filters.fecha && (
                  <span className="filter-tag">
                    📅 {filters.fecha === 'today' ? 'Hoy' : 
                         filters.fecha === 'week' ? 'Última semana' :
                         filters.fecha === 'month' ? 'Último mes' : 'Últimos 3 meses'}
                    <button onClick={() => handleFilterChange('fecha', '')}>×</button>
                  </span>
                )}
                {(filters.salary?.min || filters.salary?.max) && (
                  <span className="filter-tag">
                    💰 ${filters.salary?.min || '0'} - ${filters.salary?.max || '∞'}
                    <button onClick={() => handleFilterChange('salary', {})}>×</button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;