import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    tipoUsuario: 'empleado'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false); // modo registro

  const { user, login, register } = useAuth();
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

    try {
      if (isRegister) {
        // Registro
        const registerResult = await register(
          formData.nombre,
          formData.email,
          formData.password,
          formData.tipoUsuario
        );
        
        if (registerResult.success) {
          // Registro exitoso, ahora hacer login automáticamente
          const loginResult = await login(formData.email, formData.password, formData.tipoUsuario);
          if (loginResult.success) {
            navigate(`/${loginResult.user.tipo}/dashboard`);
          } else {
            setError('Cuenta creada, pero error al iniciar sesión. Intenta hacer login manualmente.');
          }
        } else {
          setError(registerResult.error);
        }
      } else {
        // Login normal
        const result = await login(formData.email, formData.password, formData.tipoUsuario);
        if (result.success) {
          navigate(`/${result.user.tipo}/dashboard`);
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Error del servidor');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <Link to="/" className="back-link">← Volver al inicio</Link>
          <h1>FindWork</h1>
          <h2>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">

          <div className="form-group">
            <label htmlFor="tipoUsuario">Tipo de Usuario</label>
            <select
              id="tipoUsuario"
              name="tipoUsuario"
              value={formData.tipoUsuario}
              onChange={handleChange}
              required
            >
              <option value="empleado">Empleado</option>
              <option value="empresa">Empresa</option>
              <option value="admin" disabled>Administrador</option>
            </select>
          </div>

          {/* Solo mostrar campo nombre si es registro */}
          {isRegister && (
            <div className="form-group">
              <label htmlFor="nombre">
                {formData.tipoUsuario === 'empleado' ? 'Nombre del candidato' : 'Nombre de la empresa'}
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ingresa tu nombre"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico o Usuario</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com o admin"
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
            {loading ? (isRegister ? 'Creando cuenta...' : 'Iniciando sesión...') 
                     : (isRegister ? 'Crear Cuenta' : 'Iniciar Sesión')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button 
              className="link-button" 
              onClick={() => setIsRegister(!isRegister)}
              disabled={loading}
            >
              {isRegister ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
