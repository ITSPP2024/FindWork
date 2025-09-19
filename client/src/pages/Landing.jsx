import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Landing.css';

const Landing = () => {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="nav-container">
          <h1 className="logo">FindWork</h1>
          <Link to="/login" className="login-btn">Iniciar Sesión</Link>
        </div>
      </nav>

      <main className="landing-main">
        <section className="hero">
          <div className="hero-content">
            <h1>Encuentra tu trabajo ideal</h1>
            <p>Conectamos talento con oportunidades laborales de manera profesional y eficiente</p>
            <div className="hero-buttons">
              <Link to="/login" className="btn-primary">Buscar Trabajo</Link>
              <Link to="/login" className="btn-secondary">Publicar Vacante</Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-placeholder">
              <div className="placeholder-content">
                <h3>💼</h3>
                <p>Tu próxima oportunidad te está esperando</p>
              </div>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="features-container">
            <h2>¿Por qué elegir FindWork?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3>Para Empleados</h3>
                <p>Crea tu perfil profesional, sube tu CV y encuentra las mejores oportunidades laborales</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏢</div>
                <h3>Para Empresas</h3>
                <p>Publica vacantes, gestiona candidatos y encuentra el talento que necesitas</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Panel Administrativo</h3>
                <p>Gestiona usuarios, visualiza estadísticas y administra la plataforma</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-content">
          <p>&copy; 2024 FindWork. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;