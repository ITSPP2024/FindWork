import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api, { applicationsAPI, favoritesAPI } from '../../services/api';
import ApplicationModal from '../../components/ApplicationModal';
import AdvancedFilters from '../../components/AdvancedFilters';
import JobDetailModal from '../../components/modals/JobDetailModal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Search, MapPin, Clock, DollarSign, Heart, Eye, Filter, User, Briefcase, TrendingUp, Calendar, Building2, Send, X, ChevronDown, Plus, Star } from 'lucide-react';
import '../../styles/Dashboard.css';
import '../../styles/Applications.css';
import '../../styles/Favorites.css';

const EmpleadoDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('vacantes');
  const [vacantes, setVacantes] = useState([]);
  const [filteredVacantes, setFilteredVacantes] = useState([]);
  const [aplicaciones, setAplicaciones] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSalaryRange, setSelectedSalaryRange] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [applicationModal, setApplicationModal] = useState({
    isOpen: false,
    vacante: null
  });
  const [jobDetailModal, setJobDetailModal] = useState({
    isOpen: false,
    vacante: null
  });
  const [applicationData, setApplicationData] = useState({
    carta_presentacion: '',
    salario_esperado: '',
    disponibilidad: ''
  });

  useEffect(() => {
    fetchVacantes();
    fetchAplicaciones();
    fetchFavoritos();
  }, []);

  useEffect(() => {
    filterVacantes();
  }, [vacantes, searchTerm, selectedLocation, selectedSalaryRange, selectedJobType]);

  const fetchVacantes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vacantes');
      setVacantes(response.data);
    } catch (error) {
      console.error('Error fetching vacantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAplicaciones = async () => {
    try {
      const response = await applicationsAPI.getEmployeeApplications(user.id);
      if (response.success) {
        setAplicaciones(response.data);
      }
    } catch (error) {
      console.error('Error fetching aplicaciones:', error);
    }
  };

  const fetchFavoritos = async () => {
    try {
      const response = await favoritesAPI.getFavorites(user.id);
      if (response.success) {
        setFavoritos(response.data);
        setFavoriteJobs(response.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching favoritos:', error);
    }
  };

  const filterVacantes = () => {
    let filtered = vacantes;

    if (searchTerm) {
      filtered = filtered.filter(vacante =>
        vacante.Tipo_Puesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vacante.Nombre_Empresa.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter(vacante =>
        vacante.Ubicacion && vacante.Ubicacion.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (selectedSalaryRange) {
      const [min, max] = selectedSalaryRange.split('-').map(Number);
      filtered = filtered.filter(vacante => {
        const salario = vacante.Salario || 0;
        return salario >= min && (max ? salario <= max : true);
      });
    }

    if (selectedJobType) {
      filtered = filtered.filter(vacante =>
        vacante.Horario && vacante.Horario.toLowerCase().includes(selectedJobType.toLowerCase())
      );
    }

    setFilteredVacantes(filtered);
  };

  const handleApplyClick = (vacante) => {
    setApplicationModal({
      isOpen: true,
      vacante: vacante
    });
  };

  const handleCloseModal = () => {
    setApplicationModal({
      isOpen: false,
      vacante: null
    });
  };

  const handleViewDetails = (vacante) => {
    setJobDetailModal({
      isOpen: true,
      vacante: vacante
    });
  };

  const handleCloseDetailModal = () => {
    setJobDetailModal({
      isOpen: false,
      vacante: null
    });
  };

  const handleApplyFromDetail = (vacante) => {
    handleCloseDetailModal();
    handleApplyClick(vacante);
  };

  const handleSubmitApplication = async (applicationData) => {
    try {
      const result = await applicationsAPI.applyToJob({
        puesto_id: applicationModal.vacante.idPuestos,
        ...applicationData
      });
      
      if (result.success) {
        handleCloseModal();
        fetchAplicaciones();
        alert('Aplicación enviada exitosamente');
        return { success: true };
      } else {
        alert(result.error || 'Error al enviar la aplicación');
        return { success: false };
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error al enviar la aplicación');
      return { success: false };
    }
  };

  const toggleFavorite = async (puestoId) => {
    try {
      const result = await favoritesAPI.toggleFavorite(puestoId);
      
      if (result.success) {
        fetchFavoritos();
        // Mostrar mensaje de éxito opcional
        if (result.data.action === 'added') {
          console.log('Vacante agregada a favoritos');
        } else {
          console.log('Vacante eliminada de favoritos');
        }
      } else {
        console.error('Error toggling favorite:', result.error);
        alert('Error al actualizar favoritos');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error al actualizar favoritos');
    }
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      'pendiente': { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      'en_revision': { color: 'bg-blue-100 text-blue-800', text: 'En Revisión' },
      'aceptada': { color: 'bg-green-100 text-green-800', text: 'Aceptada' },
      'rechazada': { color: 'bg-red-100 text-red-800', text: 'Rechazada' }
    };

    const config = statusConfig[estado] || statusConfig['pendiente'];
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedSalaryRange('');
    setSelectedJobType('');
  };

  const activeFiltersCount = [searchTerm, selectedLocation, selectedSalaryRange, selectedJobType]
    .filter(filter => filter).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  FindWork
                </h1>
                <p className="text-xs text-muted-foreground">Portal de Empleos</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
              {[
                { id: 'vacantes', label: 'Buscar Trabajo', icon: Search },
                { id: 'aplicaciones', label: 'Mis Aplicaciones', icon: Send },
                { id: 'favoritos', label: 'Favoritos', icon: Heart }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
              {/* Mi Perfil como Link separado */}
              <Link
                to="/empleado/perfil"
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-background/50"
              >
                <User className="h-4 w-4" />
                <span>Mi Perfil</span>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">¡Hola, {user?.nombre}!</p>
                <p className="text-xs text-muted-foreground">Empleado</p>
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
        {activeTab === 'vacantes' && (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-foreground mb-3">
                Encuentra tu trabajo ideal
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explora miles de oportunidades laborales y encuentra el puesto perfecto para ti
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                          placeholder="Buscar por puesto o empresa..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-12 text-base border-border/50 focus:border-primary bg-background/50"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowFilters(!showFilters)}
                      variant="outline"
                      className="h-12 px-6 border-border/50 bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10"
                    >
                      <Filter className="h-5 w-5 mr-2" />
                      Filtros
                      {activeFiltersCount > 0 && (
                        <Badge className="ml-2 bg-primary text-primary-foreground">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </div>

                  {showFilters && (
                    <div className="mt-6 pt-6 border-t border-border/50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-foreground">Ubicación</Label>
                          <Input
                            placeholder="Ciudad o región"
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="mt-1 border-border/50"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-foreground">Rango Salarial</Label>
                          <Select value={selectedSalaryRange} onValueChange={setSelectedSalaryRange}>
                            <SelectTrigger className="mt-1 border-border/50">
                              <SelectValue placeholder="Seleccionar rango" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0-30000">$0 - $30,000</SelectItem>
                              <SelectItem value="30000-50000">$30,000 - $50,000</SelectItem>
                              <SelectItem value="50000-80000">$50,000 - $80,000</SelectItem>
                              <SelectItem value="80000-">$80,000+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-foreground">Tipo de Trabajo</Label>
                          <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                            <SelectTrigger className="mt-1 border-border/50">
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tiempo_completo">Tiempo Completo</SelectItem>
                              <SelectItem value="medio_tiempo">Medio Tiempo</SelectItem>
                              <SelectItem value="remoto">Remoto</SelectItem>
                              <SelectItem value="freelance">Freelance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {activeFiltersCount > 0 && (
                        <div className="mt-4 flex justify-end">
                          <Button onClick={clearFilters} variant="ghost" size="sm">
                            <X className="h-4 w-4 mr-2" />
                            Limpiar filtros
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Job Listings */}
              <div className="lg:col-span-3">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Oportunidades Laborales
                  </h3>
                  <p className="text-muted-foreground">
                    {filteredVacantes.length} {filteredVacantes.length === 1 ? 'vacante encontrada' : 'vacantes encontradas'}
                  </p>
                </div>

                <div className="space-y-6">
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    filteredVacantes.map((vacante) => (
                      <Card key={vacante.idPuestos} className="border-border/50 hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm group">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {vacante.Tipo_Puesto}
                                </h3>
                                <Badge className="bg-primary/10 text-primary border-primary/20">
                                  DESTACADO
                                </Badge>
                              </div>
                              <div className="flex items-center text-muted-foreground mb-3">
                                <Building2 className="h-4 w-4 mr-2" />
                                <span className="font-medium">{vacante.Nombre_Empresa}</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => toggleFavorite(vacante.idPuestos)}
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-red-500"
                            >
                              <Heart 
                                className={`h-5 w-5 ${
                                  favoritos.some(fav => fav.puesto_id === vacante.idPuestos) 
                                    ? 'fill-red-500 text-red-500' 
                                    : ''
                                }`} 
                              />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-2 text-primary" />
                              <span>{vacante.Ubicacion || 'No especificada'}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-2 text-primary" />
                              <span>{vacante.Horario || 'No especificado'}</span>
                              {vacante.Horario?.toLowerCase().includes('remoto') && (
                                <Badge variant="outline" className="ml-2 text-xs">Remoto</Badge>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <DollarSign className="h-4 w-4 mr-2 text-primary" />
                              <span className="font-semibold text-primary">
                                ${vacante.Salario?.toLocaleString() || 'A negociar'}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                              <span className="font-medium">4.8</span>
                            </div>
                          </div>

                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {vacante.Descripcion || 'Únete a nuestro equipo y desarrolla tu carrera profesional en un ambiente dinámico y colaborativo.'}
                          </p>

                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleApplyClick(vacante)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Aplicar Ahora
                              </Button>
                              <Button 
                                variant="outline" 
                                className="border-border/50"
                                onClick={() => handleViewDetails(vacante)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalles
                              </Button>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Publicado hace 2 días
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                  {filteredVacantes.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <p>No se encontraron vacantes disponibles</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Profile Summary */}
                <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-foreground">Mi Perfil</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <span className="text-2xl font-bold text-primary-foreground">
                            {user?.nombre?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg text-foreground">{user?.nombre}</h3>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <Badge className="mt-2 bg-green-100 text-green-800 border-green-200">
                          Activo
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-muted-foreground font-medium">Completitud del perfil</span>
                            <span className="text-primary font-semibold">75%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-3">
                            <div className="bg-gradient-to-r from-primary to-accent h-3 rounded-full w-3/4 transition-all duration-300"></div>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm">
                        <User className="h-4 w-4 mr-2" />
                        <Link to="/empleado/perfil">Completar Perfil</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Favorite Jobs */}
                {favoriteJobs.length > 0 && (
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold flex items-center text-foreground">
                        <Heart className="h-5 w-5 mr-2 text-red-500" />
                        Puestos Favoritos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {favoriteJobs.map((puesto) => (
                          <div key={puesto.idFavorito} className="border border-border/50 rounded-lg p-4 bg-gradient-to-r from-card to-card/80 hover:shadow-md transition-all duration-200">
                            <h4 className="font-semibold text-sm text-foreground">{puesto.Tipo_Puesto}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{puesto.Nombre_Empresa}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-primary font-semibold">
                                ${puesto.Salario?.toLocaleString() || 'A negociar'}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                Guardado
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {favoritos.length > 3 && (
                          <div className="text-center pt-2">
                            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
                              Ver {favoritos.length - 3} más
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Stats */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center text-foreground">
                      <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                      Estadísticas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                        <div className="flex items-center">
                          <Send className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm text-muted-foreground">Aplicaciones enviadas</span>
                        </div>
                        <span className="font-bold text-lg text-primary">{aplicaciones.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-red-50 to-red-100 border border-red-200">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-2 text-red-500" />
                          <span className="text-sm text-muted-foreground">Favoritos guardados</span>
                        </div>
                        <span className="font-bold text-lg text-red-600">{favoritos.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-green-600" />
                          <span className="text-sm text-muted-foreground">Vacantes disponibles</span>
                        </div>
                        <span className="font-bold text-lg text-green-600">{vacantes.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {activeTab === 'aplicaciones' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-medium text-foreground mb-2">Mis Aplicaciones</h2>
              <p className="text-muted-foreground">Revisa el estado de tus postulaciones</p>
            </div>

            <div className="space-y-4">
              {aplicaciones.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="p-8 text-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No has aplicado a ninguna vacante aún</p>
                    <Button onClick={() => setActiveTab('vacantes')}>
                      Buscar Trabajos
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                aplicaciones.map((aplicacion) => (
                  <Card key={aplicacion.idAplicacion} className="border-border">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium">{aplicacion.puesto_titulo}</h3>
                          <p className="text-muted-foreground">{aplicacion.empresa_nombre}</p>
                        </div>
                        {getStatusBadge(aplicacion.estado)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Fecha de aplicación:</span>
                          <p className="font-medium">{new Date(aplicacion.fecha_aplicacion).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Salario esperado:</span>
                          <p className="font-medium">${aplicacion.salario_esperado?.toLocaleString() || 'No especificado'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Disponibilidad:</span>
                          <p className="font-medium">{aplicacion.disponibilidad || 'No especificada'}</p>
                        </div>
                      </div>
                      
                      {aplicacion.carta_presentacion && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <h4 className="font-medium mb-2">Carta de presentación:</h4>
                          <p className="text-sm text-muted-foreground">{aplicacion.carta_presentacion}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'favoritos' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-medium text-foreground mb-2">Mis Favoritos</h2>
              <p className="text-muted-foreground">Puestos que has guardado para revisar más tarde</p>
            </div>

            <div className="space-y-4">
              {favoritos.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="p-8 text-center">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No tienes puestos favoritos aún</p>
                    <Button onClick={() => setActiveTab('vacantes')}>
                      Explorar Trabajos
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoritos.map((favorito) => (
                    <Card key={favorito.idFavorito} className="border-border hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-2">{favorito.Tipo_Puesto}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{favorito.Nombre_Empresa}</p>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          {favorito.Ubicacion || 'No especificada'}
                        </div>
                        <p className="text-sm font-medium text-primary mb-3">
                          ${favorito.Salario?.toLocaleString() || 'A negociar'}
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          ❤️ {new Date(favorito.fecha_agregado).toLocaleDateString()}
                        </p>
                        <Button 
                          className="w-full"
                          onClick={() => handleApplyClick({
                            idPuestos: favorito.puesto_id,
                            Tipo_Puesto: favorito.Tipo_Puesto,
                            Nombre_Empresa: favorito.Nombre_Empresa,
                            Ubicacion: favorito.Ubicacion,
                            Salario: favorito.Salario,
                            Horario: favorito.Horario
                          })}
                        >
                          Postularse
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ApplicationModal
        isOpen={applicationModal.isOpen}
        onClose={handleCloseModal}
        vacante={applicationModal.vacante}
        onSubmit={handleSubmitApplication}
      />

      <JobDetailModal
        isOpen={jobDetailModal.isOpen}
        onClose={handleCloseDetailModal}
        vacante={jobDetailModal.vacante}
        onApply={handleApplyFromDetail}
      />
    </div>
  );
};

export default EmpleadoDashboard;