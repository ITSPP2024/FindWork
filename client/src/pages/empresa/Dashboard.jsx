import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Search, MapPin, Clock, DollarSign, Heart, Eye, Filter, User, Briefcase, TrendingUp, Calendar, Building2, Send, X, ChevronDown, Plus, Star, Users, FileText, CheckCircle, AlertCircle, Clock3, Mail, MoreHorizontal, Edit, Trash2, Phone } from 'lucide-react';
import '../../styles/Dashboard.css';
import '../../styles/Applications.css';
import '../../styles/ApplicationManagement.css';

const EmpresaDashboard = () => {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('vacantes');
  const [vacantes, setVacantes] = useState([]);
  const [aplicaciones, setAplicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAplicacion, setSelectedAplicacion] = useState(null);
  const [vacanteEditando, setVacanteEditando] = useState(null);
  const [perfil, setPerfil] = useState(null);

  const [filters, setFilters] = useState({
    estado: '',
    puesto: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [nuevaVacante, setNuevaVacante] = useState({
    tipo_puesto: '',
    salario: '',
    horario: '',
    ubicacion: ''
  });

  useEffect(() => {
    // Leer el parámetro tab de la URL
    const tabParam = searchParams.get('tab');
    if (tabParam && ['vacantes', 'aplicaciones', 'perfil'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    // Asegurar que el modal esté cerrado al montar el componente
    setShowCreateModal(false);
    // Cargar ambos datos al inicio para tener counts correctos
    fetchVacantes();
    fetchAplicaciones();
    fetchPerfil();
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'vacantes') {
      fetchVacantes();
    } else if (activeTab === 'aplicaciones') {
      fetchAplicaciones();
    }
  }, [activeTab]);

  // Manejar tecla Escape para cerrar el modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && showCreateModal) {
        setShowCreateModal(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showCreateModal]);

  const fetchVacantes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/empresa/vacantes/${user.id}`);
      setVacantes(response.data);
    } catch (error) {
      console.error('Error cargando vacantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAplicaciones = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/empresa/aplicaciones/${user.id}`);
      setAplicaciones(response.data);
    } catch (error) {
      console.error('Error cargando aplicaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerfil = async () => {
    try {
      const response = await api.get(`/empresa/perfil/${user.id}`);
      setPerfil(response.data);
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  };

  const handleCreateVacante = async (e) => {
    e.preventDefault();
    try {
      await api.post('/empresa/vacante', nuevaVacante);
      setNuevaVacante({
        tipo_puesto: '',
        salario: '',
        horario: '',
        ubicacion: ''
      });
      setShowCreateModal(false);
      fetchVacantes();
      alert('✅ Vacante creada exitosamente');
    } catch (error) {
      console.error('Error creando vacante:', error);
      const errorMessage = error.response?.data?.error || 'Error al crear la vacante';
      alert(`❌ Error: ${errorMessage}`);
    }
  };

  const handleUpdateEstado = async (aplicacionId, nuevoEstado, notas = '') => {
    try {
      await api.put(`/empresa/aplicacion/${aplicacionId}`, {
        estado: nuevoEstado,
        notas_empresa: notas
      });
      
      // Actualizar la aplicación local inmediatamente para mejor UX
      if (selectedAplicacion && selectedAplicacion.idAplicacion === aplicacionId) {
        setSelectedAplicacion({
          ...selectedAplicacion,
          estado: nuevoEstado,
          notas_empresa: notas
        });
      }
      
      fetchAplicaciones(); // Refresh applications
      
      // Mostrar feedback de éxito
      alert('Estado actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando aplicación:', error);
      alert('Error actualizando estado: ' + (error.response?.data?.error || 'Error desconocido'));
    }
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      pendiente: { text: 'Pendiente', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
      revisando: { text: 'Revisando', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
      entrevista: { text: 'Entrevista', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
      aceptado: { text: 'Aceptado', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
      rechazado: { text: 'Rechazado', color: 'bg-red-500/10 text-red-600 border-red-500/20' }
    };
    
    const config = statusConfig[estado] || statusConfig.pendiente;
    return (
      <Badge className={`${config.color} font-medium`}>
        {config.text}
      </Badge>
    );
  };

  const filterAplicaciones = () => {
    return aplicaciones.filter(app => {
      if (filters.estado && app.estado !== filters.estado) return false;
      if (filters.puesto && !app.puesto_titulo.toLowerCase().includes(filters.puesto.toLowerCase())) return false;
      if (filters.fechaDesde) {
        const fechaApp = new Date(app.fecha_aplicacion);
        const fechaDesde = new Date(filters.fechaDesde);
        if (fechaApp < fechaDesde) return false;
      }
      if (filters.fechaHasta) {
        const fechaApp = new Date(app.fecha_aplicacion);
        const fechaHasta = new Date(filters.fechaHasta);
        // Ajustar hasta al final del día
        fechaHasta.setHours(23, 59, 59, 999);
        if (fechaApp > fechaHasta) return false;
      }
      return true;
    });
  };

  const resetFilters = () => {
    setFilters({
      estado: '',
      puesto: '',
      fechaDesde: '',
      fechaHasta: ''
    });
  };

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

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
              {[
                { id: 'vacantes', label: 'Mis Vacantes', icon: FileText },
                { id: 'aplicaciones', label: `Aplicaciones (${aplicaciones.length})`, icon: Users },
                { id: 'perfil', label: 'Mi Perfil', icon: User }
              ].map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  variant={activeTab === id ? "default" : "ghost"}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Contenido de Vacantes */}
        {activeTab === 'vacantes' && (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-foreground mb-3">
                Gestiona tus vacantes
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Crea y administra las oportunidades laborales de tu empresa
              </p>
            </div>

            {/* Action Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-2xl font-semibold text-foreground">Mis Vacantes</h3>
                <Badge variant="secondary" className="text-sm">
                  {vacantes.length} {vacantes.length === 1 ? 'vacante' : 'vacantes'}
                </Badge>
              </div>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Nueva Vacante
              </Button>
            </div>
          </>
        )}

        {/* Contenido de Aplicaciones */}
        {activeTab === 'aplicaciones' && (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-foreground mb-3">
                Gestión de Aplicaciones
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Revisa y gestiona las aplicaciones de los candidatos
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200">
                  <div className="flex items-center">
                    <Clock className="h-6 w-6 mr-3 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-orange-900">
                        {aplicaciones.filter(a => a.estado === 'pendiente').length}
                      </p>
                      <p className="text-sm text-orange-700">Pendientes</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 mr-3 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-900">
                        {aplicaciones.filter(a => a.estado === 'entrevista').length}
                      </p>
                      <p className="text-sm text-blue-700">Entrevistas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 mr-3 text-emerald-600" />
                    <div>
                      <p className="text-2xl font-bold text-emerald-900">
                        {aplicaciones.filter(a => a.estado === 'aceptado').length}
                      </p>
                      <p className="text-sm text-emerald-700">Aceptados</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Filtros de aplicaciones */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <Input
                    placeholder="Buscar por candidato o puesto..."
                    value={filters.puesto}
                    onChange={(e) => setFilters({...filters, puesto: e.target.value})}
                    className="flex-1 lg:flex-1"
                  />

                  <Select value={filters.estado} onValueChange={(value) => setFilters({...filters, estado: value})}>
                    <SelectTrigger className="w-full lg:flex-1">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="revisando">Revisando</SelectItem>
                      <SelectItem value="entrevista">Entrevista</SelectItem>
                      <SelectItem value="aceptado">Aceptado</SelectItem>
                      <SelectItem value="rechazado">Rechazado</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    value={filters.fechaDesde}
                    onChange={(e) => setFilters({...filters, fechaDesde: e.target.value})}
                    className="flex-1 lg:flex-1"
                  />

                  <Input
                    type="date"
                    value={filters.fechaHasta}
                    onChange={(e) => setFilters({...filters, fechaHasta: e.target.value})}
                    className="flex-1 lg:flex-1"
                  />

                  {(filters.estado || filters.puesto || filters.fechaDesde || filters.fechaHasta) && (
                    <Button onClick={resetFilters} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Limpiar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Lista de aplicaciones */}
        {activeTab === 'aplicaciones' && (
          <div className="aplicaciones-content">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner">⏳</div>
                <p>Cargando aplicaciones...</p>
              </div>
            ) : filterAplicaciones().length === 0 ? (
              <div className="no-aplicaciones">
                <div className="empty-icon">📭</div>
                <p>
                  {aplicaciones.length === 0 
                    ? 'No hay aplicaciones aún' 
                    : 'No se encontraron aplicaciones con los filtros aplicados'
                  }
                </p>
                {aplicaciones.length === 0 && (
                  <Button 
                    onClick={() => setActiveTab('vacantes')}
                  >
                    Crear Vacante
                  </Button>
                )}
              </div>
            ) : (
              <div className="aplicaciones-grid">
                {filterAplicaciones().map((aplicacion) => (
                   <Card key={aplicacion.idAplicacion} className="border-border/50 hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm group">
                     <CardContent className="p-6">
                       <div className="flex justify-between items-start mb-4">
                         <div className="flex-1">
                           <div className="flex items-center gap-3 mb-2">
                             <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                               {aplicacion.candidato_nombre}
                             </h3>
                             {getStatusBadge(aplicacion.estado)}
                           </div>
                           <div className="flex items-center text-muted-foreground mb-3">
                             <Briefcase className="h-4 w-4 mr-2 text-primary" />
                             <span className="font-medium">Aplicó para: {aplicacion.puesto_titulo}</span>
                           </div>
                         </div>
                         <div className="flex items-center gap-2">
                           <Badge className="bg-primary/10 text-primary border-primary/20">
                             CANDIDATO
                           </Badge>
                         </div>
                       </div>

                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                         <div className="flex items-center text-sm text-muted-foreground">
                           <Mail className="h-4 w-4 mr-2 text-primary" />
                           <span>{aplicacion.candidato_email}</span>
                         </div>
                         <div className="flex items-center text-sm text-muted-foreground">
                           <Calendar className="h-4 w-4 mr-2 text-primary" />
                           <span>{new Date(aplicacion.fecha_aplicacion).toLocaleDateString('es-ES', {
                             year: 'numeric',
                             month: 'short',
                             day: 'numeric'
                           })}</span>
                         </div>
                         {aplicacion.salario_esperado && (
                           <div className="flex items-center text-sm text-muted-foreground">
                             <DollarSign className="h-4 w-4 mr-2 text-primary" />
                             <span className="font-semibold text-primary">
                               ${aplicacion.salario_esperado.toLocaleString()}
                             </span>
                           </div>
                         )}
                         {aplicacion.disponibilidad && (
                           <div className="flex items-center text-sm text-muted-foreground">
                             <Clock className="h-4 w-4 mr-2 text-primary" />
                             <span>{aplicacion.disponibilidad}</span>
                           </div>
                         )}
                       </div>

                       {aplicacion.carta_presentacion && (
                         <div className="mb-4">
                           <p className="text-sm font-medium text-foreground mb-2">Carta de presentación:</p>
                           <p className="text-muted-foreground text-sm line-clamp-3 bg-muted/50 p-3 rounded-lg border-l-4 border-primary">
                             {aplicacion.carta_presentacion}
                           </p>
                         </div>
                       )}

                       <div className="flex justify-between items-center">
                         <div className="flex gap-2">
                           <Button
                             onClick={() => setSelectedAplicacion(aplicacion)}
                             size="sm"
                             className="bg-primary hover:bg-primary/90"
                           >
                             <Eye className="h-4 w-4 mr-2" />
                             Ver Detalles
                           </Button>
                           <Button
                             variant="outline"
                             size="sm"
                             className="hover:bg-primary/10 hover:border-primary hover:text-primary"
                           >
                             <Mail className="h-4 w-4 mr-2" />
                             Contactar
                           </Button>
                         </div>
                         <Select value={aplicacion.estado} onValueChange={(value) => handleUpdateEstado(aplicacion.idAplicacion, value)}>
                           <SelectTrigger className="w-32">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="pendiente">Pendiente</SelectItem>
                             <SelectItem value="revisando">Revisando</SelectItem>
                             <SelectItem value="entrevista">Entrevista</SelectItem>
                             <SelectItem value="aceptado">Aceptado</SelectItem>
                             <SelectItem value="rechazado">Rechazado</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                     </CardContent>
                   </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contenido de Mi Perfil */}
        {activeTab === 'perfil' && (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-foreground mb-3">
                Mi Perfil
              </h2>
              <p className="text-lg text-muted-foreground">
                Gestiona la información de tu empresa
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Profile Card */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg mb-8">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-primary-foreground">
                        {perfil?.nombre?.charAt(0) || user?.nombre?.charAt(0) || 'E'}
                      </span>
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {perfil?.nombre || user?.nombre || 'Empresa'}
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
                      <div className="text-2xl font-bold text-blue-900 mb-1">{vacantes.length}</div>
                      <div className="text-sm text-blue-700">Vacantes Activas</div>
                    </div>
                    
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg border border-green-200/50">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-900 mb-1">{aplicaciones.length}</div>
                      <div className="text-sm text-green-700">Aplicantes Totales</div>
                    </div>
                    
                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border border-purple-200/50">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-purple-900 mb-1">
                        {aplicaciones.filter(a => a.estado === 'aceptado').length}
                      </div>
                      <div className="text-sm text-purple-700">Contrataciones</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Modal de detalle de candidato */}
        {selectedAplicacion && (
          <div className="modal-overlay" onClick={() => setSelectedAplicacion(null)}>
            <div className="modal-content aplicacion-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Detalle del Candidato</h2>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAplicacion(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="modal-body">
                <div className="candidato-profile">
                  <div className="candidato-avatar large">
                    {selectedAplicacion.candidato_nombre?.charAt(0) || 'U'}
                  </div>
                  <div className="candidato-info-detail">
                    <h3>{selectedAplicacion.candidato_nombre}</h3>
                    <p>{selectedAplicacion.candidato_email}</p>
                    {selectedAplicacion.candidato_telefono && (
                      <p>📞 {selectedAplicacion.candidato_telefono}</p>
                    )}
                    <p className="puesto-detail">Aplicó para: <strong>{selectedAplicacion.puesto_titulo}</strong></p>
                  </div>
                  {getStatusBadge(selectedAplicacion.estado)}
                </div>

                <div className="aplicacion-full-details">
                  <div className="detail-section">
                    <h4>Información de la Aplicación</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="label">Fecha de aplicación:</span>
                        <span>{new Date(selectedAplicacion.fecha_aplicacion).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      
                      {selectedAplicacion.salario_esperado && (
                        <div className="detail-item">
                          <span className="label">Salario esperado:</span>
                          <span>${selectedAplicacion.salario_esperado.toLocaleString()} MXN</span>
                        </div>
                      )}

                      {selectedAplicacion.disponibilidad && (
                        <div className="detail-item">
                          <span className="label">Disponibilidad:</span>
                          <span>{selectedAplicacion.disponibilidad}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedAplicacion.carta_presentacion && (
                    <div className="detail-section">
                      <h4>Carta de Presentación</h4>
                      <div className="carta-completa">
                        <p>{selectedAplicacion.carta_presentacion}</p>
                      </div>
                    </div>
                  )}

                  {selectedAplicacion.notas_empresa && (
                    <div className="detail-section">
                      <h4>Notas Internas</h4>
                      <div className="notas-empresa">
                        <p>{selectedAplicacion.notas_empresa}</p>
                      </div>
                    </div>
                  )}

                  <div className="detail-section">
                    <h4>Gestionar Estado</h4>
                    <div className="estado-management">
                      <div className="estado-buttons">
                        <Button
                          variant={selectedAplicacion.estado === 'pendiente' ? 'default' : 'outline'}
                          onClick={() => handleUpdateEstado(selectedAplicacion.idAplicacion, 'pendiente')}
                        >
                          Pendiente
                        </Button>
                        <Button
                          variant={selectedAplicacion.estado === 'revisando' ? 'default' : 'outline'}
                          onClick={() => handleUpdateEstado(selectedAplicacion.idAplicacion, 'revisando')}
                        >
                          Revisando
                        </Button>
                        <Button
                          variant={selectedAplicacion.estado === 'entrevista' ? 'default' : 'outline'}
                          onClick={() => handleUpdateEstado(selectedAplicacion.idAplicacion, 'entrevista')}
                        >
                          Entrevista
                        </Button>
                        <Button
                          variant={selectedAplicacion.estado === 'aceptado' ? 'default' : 'outline'}
                          onClick={() => handleUpdateEstado(selectedAplicacion.idAplicacion, 'aceptado')}
                        >
                          Aceptado
                        </Button>
                        <Button
                          variant={selectedAplicacion.estado === 'rechazado' ? 'destructive' : 'outline'}
                          onClick={() => handleUpdateEstado(selectedAplicacion.idAplicacion, 'rechazado')}
                        >
                          Rechazado
                        </Button>
                      </div>

                      <div className="notas-form">
                        <Textarea
                          placeholder="Agregar notas internas sobre este candidato..."
                          rows="3"
                          className="notas-textarea"
                          defaultValue={selectedAplicacion.notas_empresa || ''}
                          onBlur={(e) => {
                            if (e.target.value !== selectedAplicacion.notas_empresa) {
                              handleUpdateEstado(selectedAplicacion.idAplicacion, selectedAplicacion.estado, e.target.value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Contenido de vacantes */}
        {activeTab === 'vacantes' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Mis Vacantes Publicadas
              </h3>
              <p className="text-muted-foreground">
                {vacantes.length} {vacantes.length === 1 ? 'vacante publicada' : 'vacantes publicadas'}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vacantes.map((vacante) => (
                  <Card key={vacante.idPuestos} className="border-border/50 hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm group">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {vacante.Tipo_Puesto}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          ID: {vacante.idPuestos}
                        </Badge>
                      </div>
                      <CardDescription className="text-muted-foreground">
                        Vacante activa • Publicada recientemente
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm">{vacante.Ubicacion}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                          <span className="text-sm font-medium">${vacante.Salario?.toLocaleString()} MXN</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2 text-orange-500" />
                          <span className="text-sm">{vacante.Horario}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Aplicaciones:</span>
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            {aplicaciones.filter(app => app.puesto_id === vacante.idPuestos).length}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0 space-x-2">
                      <Button 
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => setActiveTab('aplicaciones')}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Ver Candidatos
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setVacanteEditando(vacante)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                
                {vacantes.length === 0 && !loading && (
                  <div className="col-span-full">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-8 text-center">
                        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">Aún no has creado ninguna vacante</p>
                        <Button onClick={() => setShowCreateModal(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Primera Vacante
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
         {/* ✅ Formulario para editar vacante */}
    {vacanteEditando && (
  <div className="modal-overlay" onClick={() => setVacanteEditando(null)}>
    <div 
      className="modal-content" 
      onClick={(e) => e.stopPropagation()} // evita cerrar al hacer click dentro
    >
      <h2>✏️ Editar Vacante</h2>

      <form 
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            console.log("📤 Enviando actualización:", vacanteEditando);
            const response = await api.put(`/empresa/vacante/${vacanteEditando.idPuestos}`, {
              Tipo_Puesto: vacanteEditando.Tipo_Puesto,
              Salario: vacanteEditando.Salario,
              Horario: vacanteEditando.Horario,
              Ubicacion: vacanteEditando.Ubicacion
            });
            console.log("✅ [FRONT SUCCESS]:", response.data);
            alert("✅ Vacante actualizada correctamente");
            fetchVacantes();
            setVacanteEditando(null);
          } catch (error) {
            console.error("❌ [FRONT ERROR]:", error.response?.data || error.message);
            alert("❌ Error al actualizar vacante");
          }
        }}
        className="form-vacante"
      >
        <div className="form-group">
          <Label>Tipo de Puesto</Label>
          <Input
            type="text"
            value={vacanteEditando.Tipo_Puesto}
            onChange={(e) => setVacanteEditando({ ...vacanteEditando, Tipo_Puesto: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <Label>Salario</Label>
          <Input
            type="number"
            value={vacanteEditando.Salario}
            onChange={(e) => setVacanteEditando({ ...vacanteEditando, Salario: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <Label>Horario</Label>
          <Input
            type="text"
            value={vacanteEditando.Horario}
            onChange={(e) => setVacanteEditando({ ...vacanteEditando, Horario: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <Label>Ubicación</Label>
          <Input
            type="text"
            value={vacanteEditando.Ubicacion}
            onChange={(e) => setVacanteEditando({ ...vacanteEditando, Ubicacion: e.target.value })}
            required
          />
        </div>

        <div className="form-actions">
          <Button type="submit">💾 Guardar cambios</Button>

          <Button 
            type="button" 
            variant="destructive"
            onClick={async () => {
              if (window.confirm("⚠️ ¿Seguro que quieres eliminar esta vacante?")) {
                try {
                  console.log("📤 Eliminando vacante:", vacanteEditando.idPuestos);
                  const response = await api.delete(`/vacantes/${vacanteEditando.idPuestos}`);
                  console.log("✅ [FRONT SUCCESS]:", response.data);
                  alert("🗑️ Vacante eliminada correctamente");
                  fetchVacantes();
                  setVacanteEditando(null);
                } catch (error) {
                  console.error("❌ [FRONT ERROR]:", error.response?.data || error.message);
                  alert("❌ Error eliminando vacante");
                }
              }
            }}
          >
            🗑️ Eliminar
          </Button>

          <Button 
            type="button" 
            variant="outline"
            onClick={() => setVacanteEditando(null)}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  </div>
)}

        {/* Modal de Creación de Vacantes */}
        {showCreateModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreateModal(false);
                setNuevaVacante({
                  tipo_puesto: '',
                  salario: '',
                  horario: '',
                  ubicacion: ''
                });
              }
            }}
          >
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Crear Nueva Vacante
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Completa los detalles para crear una nueva oportunidad laboral
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNuevaVacante({
                        tipo_puesto: '',
                        salario: '',
                        horario: '',
                        ubicacion: ''
                      });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <form onSubmit={handleCreateVacante} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo_puesto">Tipo de Puesto</Label>
                      <Input
                        id="tipo_puesto"
                        type="text"
                        placeholder="Ej: Desarrollador Frontend"
                        value={nuevaVacante.tipo_puesto}
                        onChange={(e) => setNuevaVacante({...nuevaVacante, tipo_puesto: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="salario">Salario</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="salario"
                          type="number"
                          placeholder="50000"
                          className="pl-10"
                          value={nuevaVacante.salario}
                          onChange={(e) => setNuevaVacante({...nuevaVacante, salario: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="horario">Horario</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="horario"
                          type="text"
                          placeholder="Lunes a Viernes 9:00 - 18:00"
                          className="pl-10"
                          value={nuevaVacante.horario}
                          onChange={(e) => setNuevaVacante({...nuevaVacante, horario: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ubicacion">Ubicación</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="ubicacion"
                          type="text"
                          placeholder="Ciudad, País o Remoto"
                          className="pl-10"
                          value={nuevaVacante.ubicacion}
                          onChange={(e) => setNuevaVacante({...nuevaVacante, ubicacion: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowCreateModal(false);
                        setNuevaVacante({
                          tipo_puesto: '',
                          salario: '',
                          horario: '',
                          ubicacion: ''
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Vacante
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpresaDashboard;