import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { User, Mail, Phone, Briefcase, Save, Upload } from 'lucide-react';

const EmpleadoPerfil = () => {
  const { user, logout } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      const response = await api.get(`/empleado/perfil/${user.id}`);
      setPerfil(response.data);
      setEditedData({
        nombre: response.data.nombre || '',
        correo: response.data.correo || '',
        telefono: response.data.telefono || '',
        descripcion: response.data.descripcion || '',
        experiencia: response.data.experiencia || '',
        observaciones: response.data.Observaciones || ''
      });
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/empleado/perfil/${user.id}`, editedData);
      setPerfil(editedData);
      setIsEditing(false);
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      alert('Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
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
              <Button onClick={logout} variant="outline" size="sm">Cerrar Sesión</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground">Mi Perfil Profesional</h1>
        <p className="mt-2 text-muted-foreground">Gestiona tu información personal y profesional</p>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" /> Información Personal
              </CardTitle>
              <Button variant="outline" onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}>
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={perfil.foto_perfil ? `http://localhost:3001${perfil.foto_perfil}` : undefined} />
                <AvatarFallback>{perfil.nombre?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" /> Cambiar Foto
                </Button>
              )}
            </div>

            {/* Información Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Nombre Completo</Label>
                <Input
                  value={editedData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  readOnly={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>
              <div>
                <Label>Correo Electrónico</Label>
                <Input value={editedData.correo} readOnly className="bg-muted" />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={editedData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  readOnly={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>
            </div>

            <div>
              <Label>Descripción Personal</Label>
              <Textarea
                value={editedData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                readOnly={!isEditing}
                className={!isEditing ? 'bg-muted' : ''}
                rows={4}
              />
            </div>

            <div>
              <Label>Experiencia Laboral</Label>
              <Textarea
                value={editedData.experiencia}
                onChange={(e) => handleInputChange('experiencia', e.target.value)}
                readOnly={!isEditing}
                className={!isEditing ? 'bg-muted' : ''}
                rows={4}
              />
            </div>

            <div>
              <Label>Observaciones</Label>
              <Textarea
                value={editedData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                readOnly={!isEditing}
                className={!isEditing ? 'bg-muted' : ''}
                rows={3}
              />
            </div>

            {isEditing && (
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmpleadoPerfil;
