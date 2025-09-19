import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'empleado'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Si ya está autenticado, redirigir
  if (user) {
    const dashboardPath = `/${user.tipo}/dashboard`;
    return <Navigate to={dashboardPath} replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password, formData.userType);
    
    if (result.success) {
      const dashboardPath = `/${result.user.tipo}/dashboard`;
      navigate(dashboardPath);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <Link to="/" className="back-link">← Volver al inicio</Link>
          <h1>FindWork</h1>
          <h2>Iniciar Sesión</h2>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="userType">Tipo de Usuario</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
            >
              <option value="empleado">Empleado</option>
              <option value="empresa">Empresa</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              {formData.userType === 'admin' ? 'Usuario' : 'Correo Electrónico'}
            </label>
            <input
              type={formData.userType === 'admin' ? 'text' : 'email'}
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={formData.userType === 'admin' ? 'admin' : 'tu@email.com'}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p>Accede con tus credenciales según tu tipo de usuario</p>
        </div>
      </div>
    </div>
  );
};

export default Login;