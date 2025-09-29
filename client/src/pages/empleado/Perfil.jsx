import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar, 
  FileText, 
  Upload, 
  Download,
  Eye,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Save,
  Plus,
  Edit
} from 'lucide-react';

const EmpleadoPerfil = () => {
  const { user, logout } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await api.get(`/api/empleado/perfil/${user.id}`);
        setPerfil(response.data);
      } catch (error) {
        console.error('Error al cargar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchPerfil();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-foreground">FindWork</h1>
            <Link to="/empleado/dashboard" className="ml-8 text-muted-foreground hover:text-foreground">
              ← Volver al Dashboard
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-foreground">Hola, {user?.nombre}</span>
              <Button 
                onClick={logout}
                variant="outline"
                size="sm"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground">Mi Perfil Profesional</h1>
        <p className="mt-2 text-muted-foreground">Gestiona tu información personal y profesional</p>

        {/* Tabs */}
        <div className="bg-muted p-1 rounded-lg mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Información
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'experience'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Experiencia
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'documents'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Documentos
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'applications'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Aplicaciones
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Información Personal
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancelar' : 'Editar'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage 
                      src={perfil?.foto_perfil || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"} 
                      alt={perfil?.nombre || "Perfil profesional"} 
                    />
                    <AvatarFallback className="text-xl">
                      {perfil?.nombre?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Cambiar Foto
                    </Button>
                  )}
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="nombre">Nombre Completo</Label>
                    <Input
                      id="nombre"
                      value={perfil?.nombre || ''}
                      readOnly={!isEditing}
                      className={!isEditing ? 'bg-muted' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={perfil?.correo || ''}
                      readOnly={!isEditing}
                      className={!isEditing ? 'bg-muted' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={perfil?.telefono || ''}
                      readOnly={!isEditing}
                      className={!isEditing ? 'bg-muted' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ubicacion">Ubicación</Label>
                    <Input
                      id="ubicacion"
                      value={perfil?.ubicacion || ''}
                      readOnly={!isEditing}
                      className={!isEditing ? 'bg-muted' : ''}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Descripción Personal</Label>
                  <Textarea
                    id="bio"
                    value={perfil?.descripcion || ''}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={perfil?.observaciones || ''}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                    rows={3}
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Experiencia Laboral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {perfil?.experiencia ? (
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Experiencia Profesional</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">{perfil.experiencia}</p>
                      </div>
                      {isEditing && (
                        <Button variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Experiencia
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Aún no has agregado experiencia laboral</p>
                      <Button variant="outline" className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Experiencia
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Educación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aún no has agregado información educativa</p>
                  <Button variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Educación
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Languages className="h-5 w-5 mr-2" />
                  Idiomas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Languages className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aún no has agregado idiomas</p>
                  <Button variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Idiomas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Documentos
                </CardTitle>
                <CardDescription>
                  Gestiona tu CV, cartas de presentación y certificados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tienes documentos subidos</p>
                  <Button className="mt-4">
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Documento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mis Aplicaciones</CardTitle>
                <CardDescription>
                  Seguimiento de todas tus aplicaciones a empleos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tienes aplicaciones registradas</p>
                  <Link to="/empleado/dashboard">
                    <Button className="mt-4">
                      Ver Empleos Disponibles
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpleadoPerfil;