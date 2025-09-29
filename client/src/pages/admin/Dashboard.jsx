import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Users, 
  Building2, 
  Briefcase, 
  TrendingUp, 
  UserCheck,
  FileText,
  Settings,
  BarChart3,
  Calendar,
  Activity,
  Shield,
  X
} from 'lucide-react';
import '../../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [estadisticas, setEstadisticas] = useState({
    empleados: 0,
    empresas: 0,
    vacantes: 0,
    registros: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    try {
      const response = await api.get('/admin/estadisticas');
      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Empleados Registrados',
      value: estadisticas.empleados,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      description: 'Total de candidatos en la plataforma'
    },
    {
      title: 'Empresas Activas',
      value: estadisticas.empresas,
      change: '+8%',
      changeType: 'positive',
      icon: Building2,
      description: 'Empresas registradas y verificadas'
    },
    {
      title: 'Vacantes Activas',
      value: estadisticas.vacantes,
      change: '+15%',
      changeType: 'positive',
      icon: Briefcase,
      description: 'Ofertas de trabajo disponibles'
    },
    {
      title: 'Total Registros',
      value: estadisticas.registros,
      change: '+10%',
      changeType: 'positive',
      icon: TrendingUp,
      description: 'Usuarios totales en el sistema'
    }
  ];

  const quickActions = [
    {
      title: 'Gestionar Usuarios',
      description: 'Administrar empleados y empresas',
      icon: UserCheck,
      link: '/admin/usuarios',
      color: 'bg-blue-500'
    },
    {
      title: 'Reportes',
      description: 'Ver estadísticas detalladas',
      icon: BarChart3,
      link: '#',
      color: 'bg-green-500'
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: Settings,
      link: '#',
      color: 'bg-purple-500'
    }
  ];

  const recentActivity = [
    { user: 'Ana García', action: 'se registró como candidata', time: '5 min', type: 'user' },
    { user: 'TechCorp S.A.', action: 'publicó nueva vacante', time: '15 min', type: 'job' },
    { user: 'Carlos Ruiz', action: 'actualizó su perfil', time: '1 hora', type: 'profile' },
    { user: 'DesignStudio', action: 'revisó aplicaciones', time: '2 horas', type: 'review' },
    { user: 'María López', action: 'aplicó a una vacante', time: '3 horas', type: 'application' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  FindWork Admin
                </h1>
                <p className="text-xs text-muted-foreground">Panel de Administración</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 bg-primary text-primary-foreground shadow-sm"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin/usuarios"
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-background/50"
              >
                <Users className="h-4 w-4" />
                <span>Usuarios</span>
              </Link>
              <Link
                to="/admin/reportes"
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-background/50"
              >
                <FileText className="h-4 w-4" />
                <span>Reportes</span>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">Admin: {user?.nombre}</p>
                <p className="text-xs text-muted-foreground">Administrador</p>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-3">
            Panel de Administración
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gestiona usuarios, empresas y supervisa la actividad del sistema
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-center">
                  <Users className="h-6 w-6 mr-3 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900">
                      {estadisticas.empleados}
                    </p>
                    <p className="text-sm text-blue-700">Empleados Registrados</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
                <div className="flex items-center">
                  <Building2 className="h-6 w-6 mr-3 text-emerald-600" />
                  <div>
                    <p className="text-2xl font-bold text-emerald-900">
                      {estadisticas.empresas}
                    </p>
                    <p className="text-sm text-emerald-700">Empresas Activas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200">
                <div className="flex items-center">
                  <Briefcase className="h-6 w-6 mr-3 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-purple-900">
                      {estadisticas.vacantes}
                    </p>
                    <p className="text-sm text-purple-700">Vacantes Activas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200">
                <div className="flex items-center">
                  <TrendingUp className="h-6 w-6 mr-3 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold text-orange-900">
                      {estadisticas.registros}
                    </p>
                    <p className="text-sm text-orange-700">Total Registros</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-foreground">
                <Settings className="h-5 w-5 text-primary" />
                <span>Acciones Rápidas</span>
              </CardTitle>
              <CardDescription>
                Gestiona los aspectos principales del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                to="/admin/usuarios"
                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-200/50 hover:from-blue-100/50 hover:to-indigo-100/50 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Gestionar Usuarios</p>
                    <p className="text-sm text-blue-700">Administrar empleados y empresas</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/reportes"
                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-50/50 to-green-50/50 border border-emerald-200/50 hover:from-emerald-100/50 hover:to-green-100/50 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-900">Ver Reportes</p>
                    <p className="text-sm text-emerald-700">Analizar métricas y estadísticas</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/configuracion"
                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50/50 to-violet-50/50 border border-purple-200/50 hover:from-purple-100/50 hover:to-violet-100/50 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-900">Configuración</p>
                    <p className="text-sm text-purple-700">Ajustar parámetros del sistema</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-foreground">
                <Activity className="h-5 w-5 text-primary" />
                <span>Actividad Reciente</span>
              </CardTitle>
              <CardDescription>
                Últimas acciones en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50/30 border border-border/30">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.user} {activity.action}</p>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Estadísticas del Día
              </CardTitle>
              <CardDescription>
                Métricas importantes de hoy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">47</p>
                  <p className="text-sm text-gray-600">Nuevos registros hoy</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">156</p>
                  <p className="text-sm text-gray-600">Aplicaciones enviadas</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">23</p>
                  <p className="text-sm text-gray-600">Vacantes publicadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;