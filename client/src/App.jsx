import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import EmpleadoDashboard from './pages/empleado/Dashboard';
import EmpleadoPerfil from './pages/empleado/Perfil';
import EmpleadoEditarPerfil from './pages/empleado/EditarPerfil';
import EmpresaDashboard from './pages/empresa/Dashboard';
import EmpresaPerfil from './pages/empresa/Perfil';
import EmpresaEditarPerfil from './pages/empresa/EditarPerfil';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsuarios from './pages/admin/Usuarios';
import PrivateRoute from './components/PrivateRoute';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            
            {/* Rutas de Empleado */}
            <Route 
              path="/empleado/dashboard" 
              element={
                <PrivateRoute userType="empleado">
                  <EmpleadoDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/empleado/perfil" 
              element={
                <PrivateRoute userType="empleado">
                  <EmpleadoPerfil />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/empleado/editar-perfil" 
              element={
                <PrivateRoute userType="empleado">
                  <EmpleadoEditarPerfil />
                </PrivateRoute>
              } 
            />
            
            {/* Rutas de Empresa */}
            <Route 
              path="/empresa/dashboard" 
              element={
                <PrivateRoute userType="empresa">
                  <EmpresaDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/empresa/perfil" 
              element={
                <PrivateRoute userType="empresa">
                  <EmpresaPerfil />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/empresa/editar-perfil" 
              element={
                <PrivateRoute userType="empresa">
                  <EmpresaEditarPerfil />
                </PrivateRoute>
              } 
            />
            
            {/* Rutas de Admin */}
            <Route 
              path="/admin/dashboard" 
              element={
                <PrivateRoute userType="admin">
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/usuarios" 
              element={
                <PrivateRoute userType="admin">
                  <AdminUsuarios />
                </PrivateRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
