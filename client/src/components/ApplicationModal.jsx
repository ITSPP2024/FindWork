import React, { useState } from 'react';
import './ApplicationModal.css';

const ApplicationModal = ({ isOpen, onClose, vacante, onSubmit }) => {
  const [formData, setFormData] = useState({
    carta_presentacion: '',
    salario_esperado: '',
    disponibilidad: 'inmediata'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen || !vacante) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await onSubmit({
        puesto_id: vacante.idPuestos,
        ...formData
      });
      
      if (result.success) {
        setFormData({
          carta_presentacion: '',
          salario_esperado: '',
          disponibilidad: 'inmediata'
        });
        onClose();
      }
    } catch (error) {
      console.error('Error enviando aplicación:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="application-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Aplicar a Vacante</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="vacante-info">
          <h3>{vacante.Tipo_Puesto}</h3>
          <p><strong>Empresa:</strong> {vacante.Nombre_Empresa}</p>
          <p><strong>Ubicación:</strong> {vacante.Ubicacion}</p>
          <p><strong>Salario:</strong> ${vacante.Salario?.toLocaleString()}</p>
          <p><strong>Horario:</strong> {vacante.Horario}</p>
        </div>

        <form onSubmit={handleSubmit} className="application-form">
          <div className="form-group">
            <label htmlFor="carta_presentacion">
              Carta de Presentación *
            </label>
            <textarea
              id="carta_presentacion"
              name="carta_presentacion"
              value={formData.carta_presentacion}
              onChange={handleChange}
              placeholder="Explica por qué eres el candidato ideal para este puesto..."
              rows="5"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salario_esperado">
                Salario Esperado (MXN)
              </label>
              <input
                type="number"
                id="salario_esperado"
                name="salario_esperado"
                value={formData.salario_esperado}
                onChange={handleChange}
                placeholder="25000"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="disponibilidad">
                Disponibilidad
              </label>
              <select
                id="disponibilidad"
                name="disponibilidad"
                value={formData.disponibilidad}
                onChange={handleChange}
              >
                <option value="inmediata">Inmediata</option>
                <option value="1_semana">1 semana</option>
                <option value="2_semanas">2 semanas</option>
                <option value="1_mes">1 mes</option>
                <option value="a_convenir">A convenir</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-submit" 
              disabled={loading || !formData.carta_presentacion.trim()}
            >
              {loading ? 'Enviando...' : 'Enviar Aplicación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal;