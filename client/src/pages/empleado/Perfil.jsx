import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { profileAPI } from '../../services/api';
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
  const [saving, setSaving] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const result = await profileAPI.getProfile(user.id);
        if (result.success) {
          setPerfil(result.data);
          setEditedData({
            nombre: result.data.Nombre_Candidatos || '',
            correo: result.data.Correo_Candidatos || '',
            telefono: result.data.Numero_Candidatos || '',
            descripcion: result.data.descripcion || '',
            experiencia: result.data.Experiencia || ''
          });
        } else {
          console.error('Error al cargar perfil:', result.error);
        }
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

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await profileAPI.updateProfile(user.id, {
        nombre: editedData.nombre,
        descripcion: editedData.descripcion,
        telefono: editedData.telefono,
        experiencia: editedData.experiencia
      });

      if (result.success) {
        // Actualizar el estado local con los nuevos datos
        setPerfil(prev => ({
          ...prev,
          Nombre_Candidatos: editedData.nombre,
          descripcion: editedData.descripcion,
          Numero_Candidatos: editedData.telefono,
          Experiencia: editedData.experiencia
        }));
        setIsEditing(false);
        alert('Perfil actualizado correctamente');
      } else {
        alert('Error al actualizar perfil: ' + result.error);
      }
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      alert('Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData({
      nombre: perfil?.Nombre_Candidatos || '',
      correo: perfil?.Correo_Candidatos || '',
      telefono: perfil?.Numero_Candidatos || '',
      descripcion: perfil?.descripcion || '',
      experiencia: perfil?.Experiencia || ''
    });
    setIsEditing(false);
  };

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
                    onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
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
                      alt={perfil?.Nombre_Candidatos || "Perfil profesional"} 
                    />
                    <AvatarFallback className="text-xl">
                      {perfil?.Nombre_Candidatos?.charAt(0) || 'U'}
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
                      value={isEditing ? editedData.nombre : (perfil?.Nombre_Candidatos || '')}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      readOnly={!isEditing}
                      className={!isEditing ? 'bg-muted' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={perfil?.Correo_Candidatos || ''}
                      readOnly={true}
                      className="bg-muted"
                      title="El correo no se puede modificar"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={isEditing ? editedData.telefono : (perfil?.Numero_Candidatos || '')}
                      onChange={(e) => handleInputChange('telefono', e.target.value)}
                      readOnly={!isEditing}
                      className={!isEditing ? 'bg-muted' : ''}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Descripción Personal</Label>
                  <Textarea
                    id="bio"
                    value={isEditing ? editedData.descripcion : (perfil?.descripcion || '')}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                    rows={4}
                    placeholder="Describe tu perfil profesional, habilidades y objetivos..."
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
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
                  {perfil?.Experiencia ? (
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Experiencia Profesional</h4>
                        {isEditing ? (
                          <Textarea
                            value={editedData.experiencia}
                            onChange={(e) => handleInputChange('experiencia', e.target.value)}
                            rows={6}
                            placeholder="Describe tu experiencia laboral, logros y responsabilidades..."
                          />
                        ) : (
                          <p className="text-muted-foreground whitespace-pre-wrap">{perfil.Experiencia}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Aún no has agregado experiencia laboral</p>
                      {isEditing ? (
                        <div className="mt-4">
                          <Textarea
                            value={editedData.experiencia}
                            onChange={(e) => handleInputChange('experiencia', e.target.value)}
                            rows={6}
                            placeholder="Describe tu experiencia laboral, logros y responsabilidades..."
                          />
                        </div>
                      ) : (
                        <Button variant="outline" className="mt-4" onClick={() => setIsEditing(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Experiencia
                        </Button>
                      )}
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