-- Crear tabla para favoritos de empresas hacia candidatos
CREATE TABLE IF NOT EXISTS favoritos_empresa (
  id INT PRIMARY KEY AUTO_INCREMENT,
  empresa_id INT NOT NULL,
  candidato_id INT NOT NULL,
  fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_empresa_candidato (empresa_id, candidato_id),
  FOREIGN KEY (empresa_id) REFERENCES empresas(idEmpresas) ON DELETE CASCADE,
  FOREIGN KEY (candidato_id) REFERENCES candidatos(idCandidatos) ON DELETE CASCADE,
  UNIQUE KEY unique_favorito (empresa_id, candidato_id)
);