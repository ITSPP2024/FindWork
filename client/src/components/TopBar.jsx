import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const TopBar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y nombre de la empresa */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">FW</span>
              </div>
              <h1 className="text-xl font-bold text-white">
                FindWork
              </h1>
            </div>
          </div>

          {/* Información del usuario y navegación */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-white/90 font-medium">
                  Bienvenido, {user.nombre || user.email}
                </span>
                <button
                  onClick={logout}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="text-sm text-white/90 font-medium bg-white/10 px-3 py-1 rounded-full border border-white/20">
                Portal de Empleos
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;