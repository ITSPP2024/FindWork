import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tipoUsuario: 'empleado',
    nombre: '',
    telefono: '',
    confirmPassword: ''
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

    if (isRegistering) {
      // Validaciones para registro
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }
      
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }
      
      if (!formData.nombre.trim()) {
        setError('El nombre es requerido');
        setLoading(false);
        return;
      }

      // Llamar función de registro
      const result = await register(formData);
      
      if (result.success) {
        // Después de registro exitoso, hacer login automáticamente
        const loginResult = await login(formData.email, formData.password, formData.tipoUsuario);
        if (loginResult.success) {
          const dashboardPath = `/${loginResult.user.tipo}/dashboard`;
          navigate(dashboardPath);
        } else {
          setError('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
          setIsRegistering(false);
        }
      } else {
        setError(result.error);
      }
    } else {
      // Login normal
      const result = await login(formData.email, formData.password, formData.tipoUsuario);
      
      if (result.success) {
        const dashboardPath = `/${result.user.tipo}/dashboard`;
        navigate(dashboardPath);
      } else {
        setError(result.error);
      }
    }
    
    setLoading(false);
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: userData.nombre,
          email: userData.email,
          password: userData.password,
          telefono: userData.telefono,
          tipoUsuario: userData.tipoUsuario
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Error en el registro' };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setFormData({
      email: '',
      password: '',
      tipoUsuario: 'empleado',
      nombre: '',
      telefono: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <Link to="/" className="back-link">← Volver al inicio</Link>
          <h1>FindWork</h1>
          <h2>{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

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
              {!isRegistering && <option value="admin">Administrador</option>}
            </select>
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="nombre">
                {formData.tipoUsuario === 'empresa' ? 'Nombre de la Empresa' : 'Nombre Completo'}
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder={formData.tipoUsuario === 'empresa' ? 'Nombre de tu empresa' : 'Tu nombre completo'}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              {isRegistering ? 'Correo Electrónico' : 'Correo Electrónico o Usuario'}
            </label>
            <input
              type={isRegistering ? "email" : "text"}
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={isRegistering ? "tu@email.com" : "tu@email.com o admin"}
              required
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej: +52 555 123 4567"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isRegistering ? "Mínimo 6 caracteres" : "••••••••"}
              required
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading 
              ? (isRegistering ? 'Creando cuenta...' : 'Iniciando sesión...') 
              : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')
            }
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isRegistering 
              ? '¿Ya tienes una cuenta? ' 
              : '¿No tienes una cuenta? '
            }
            <button 
              type="button" 
              onClick={toggleMode} 
              className="toggle-mode-btn"
            >
              {isRegistering ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;