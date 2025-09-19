import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import '../../styles/Dashboard.css';

const AdminUsuarios = () => {
  const { logout } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/admin/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario => 
    filtro === 'todos' || usuario.tipo === filtro
  );

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <h1>FindWork Admin</h1>
          <div className="nav-links">
            <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
            <span className="user-info">Admin</span>
            <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h2>Gestión de Usuarios</h2>
          <div className="filter-controls">
            <select 
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos los usuarios</option>
              <option value="empleado">Empleados</option>
              <option value="empresa">Empresas</option>
            </select>
          </div>
        </div>

        <div className="dashboard-content">
          {loading ? (
            <div className="loading">Cargando usuarios...</div>
          ) : (
            <div className="usuarios-table-container">
              <table className="usuarios-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={`${usuario.tipo}-${usuario.id}`}>
                      <td>{usuario.id}</td>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.email}</td>
                      <td>
                        <span className={`tipo-badge ${usuario.tipo}`}>
                          {usuario.tipo === 'empleado' ? '👤 Empleado' : '🏢 Empresa'}
                        </span>
                      </td>
                      <td className="acciones">
                        <button className="btn-small btn-edit">Editar</button>
                        <button className="btn-small btn-delete">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {usuariosFiltrados.length === 0 && !loading && (
                <div className="no-usuarios">
                  <p>No se encontraron usuarios</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminUsuarios;