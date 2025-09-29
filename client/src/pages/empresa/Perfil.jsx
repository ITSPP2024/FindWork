import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Building2, Mail, Phone, MapPin, Users, FileText, TrendingUp, Edit, X, User } from 'lucide-react';
import '../../styles/Perfil.css';

const EmpresaPerfil = () => {
  const { user, logout } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      const response = await api.get(`/empresa/perfil/${user.id}`);
      setPerfil(response.data);
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando perfil...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  FindWork
                </h1>
                <p className="text-xs text-muted-foreground">Portal Empresarial</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Link
                to="/empresa/dashboard"
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-background/50"
              >
                <FileText className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">¡Hola, {user?.nombre}!</p>
                <p className="text-xs text-muted-foreground">Empresa</p>
              </div>
              
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="border-border/50 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-3">
            Perfil de Empresa
          </h2>
          <p className="text-lg text-muted-foreground">
            Gestiona la información de tu empresa
          </p>
        </div>

        {/* Profile Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg mb-8">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={perfil?.foto_perfil} alt={perfil?.nombre} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  {perfil?.nombre?.charAt(0) || 'E'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {perfil?.nombre || 'Empresa'}
                </h3>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{perfil?.correo || user?.email}</span>
                  </div>
                  {perfil?.telefono && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{perfil.telefono}</span>
                    </div>
                  )}
                  {perfil?.ubicacion && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{perfil.ubicacion}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Link to="/empresa/editar-perfil">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company Information */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span>Información de la Empresa</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-sm font-medium text-muted-foreground">Teléfono</span>
                  <span className="text-sm text-foreground">{perfil?.telefono || 'No especificado'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-sm font-medium text-muted-foreground">Email</span>
                  <span className="text-sm text-foreground">{perfil?.correo || user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-muted-foreground">Ubicación</span>
                  <span className="text-sm text-foreground">{perfil?.ubicacion || 'No especificada'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Description */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Descripción de la Empresa</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {perfil?.descripcion ? (
                <p className="text-sm text-muted-foreground leading-relaxed">{perfil.descripcion}</p>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Agrega una descripción de tu empresa para atraer mejores candidatos
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/empresa/editar-perfil">
                      <Edit className="h-4 w-4 mr-2" />
                      Agregar Descripción
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Estadísticas</span>
            </CardTitle>
            <CardDescription>
              Resumen de la actividad de tu empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200/50">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-900 mb-1">0</div>
                <div className="text-sm text-blue-700">Vacantes Activas</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg border border-green-200/50">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-900 mb-1">0</div>
                <div className="text-sm text-green-700">Aplicantes Totales</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border border-purple-200/50">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-900 mb-1">0</div>
                <div className="text-sm text-purple-700">Contrataciones</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmpresaPerfil;