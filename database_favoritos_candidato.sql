-- Crear tabla para favoritos de candidatos hacia empresas
CREATE TABLE IF NOT EXISTS favoritos_candidato (
  id INT PRIMARY KEY AUTO_INCREMENT,
  candidato_id INT NOT NULL,
  empresa_id INT NOT NULL,
  fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_candidato_empresa (candidato_id, empresa_id),
  FOREIGN KEY (candidato_id) REFERENCES candidatos(idCandidatos) ON DELETE CASCADE,
  FOREIGN KEY (empresa_id) REFERENCES empresas(idEmpresas) ON DELETE CASCADE,
  UNIQUE KEY unique_favorito (candidato_id, empresa_id)
);