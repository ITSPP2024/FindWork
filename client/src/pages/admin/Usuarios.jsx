import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import UserDetailModal from '../../components/modals/UserDetailModal';
import UserEditModal from '../../components/modals/UserEditModal';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Building2,
  UserCheck,
  ArrowLeft,
  Shield,
  X,
  BarChart3,
  FileText,
  UserPlus,
  Clock
} from 'lucide-react';

const AdminUsuarios = () => {
  const { user, logout } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/admin/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userType) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/admin/usuario/${userId}?tipo=${userType}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Recargar la lista de usuarios
          fetchUsuarios();
          alert('Usuario eliminado exitosamente');
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error eliminando usuario:', error);
        alert('Error al eliminar usuario');
      }
    }
  };

  const handleViewUser = async (userId, userType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/usuario/${userId}?tipo=${userType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setSelectedUser(userData);
        setIsViewModalOpen(true);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error obteniendo detalles del usuario:', error);
      alert('Error al obtener detalles del usuario');
    }
  };

  const handleEditUser = async (userId, userType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/usuario/${userId}?tipo=${userType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setSelectedUser(userData);
        setIsEditModalOpen(true);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error obteniendo detalles del usuario:', error);
      alert('Error al obtener detalles del usuario');
    }
  };

  const handleSaveUser = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/usuario/${selectedUser.id}?tipo=${selectedUser.tipo}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Recargar la lista de usuarios
        fetchUsuarios();
        alert('Usuario actualizado exitosamente');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar usuario');
      }
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  };

  const filteredUsers = usuarios.filter(user => {
    const matchesSearch = user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = userTypeFilter === 'all' || user.tipo === userTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const getUserTypeBadge = (tipo) => {
    const typeConfig = {
      empleado: { label: 'Empleado', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
      empresa: { label: 'Empresa', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
      admin: { label: 'Administrador', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' }
    };
    
    const config = typeConfig[tipo] || typeConfig.empleado;
    return (
      <Badge className={`${config.color} font-medium border`}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (tipo) => {
    const iconConfig = {
      empleado: { icon: UserCheck, color: 'text-blue-600' },
      empresa: { icon: Building2, color: 'text-emerald-600' },
      admin: { icon: Shield, color: 'text-purple-600' }
    };
    
    const config = iconConfig[tipo] || iconConfig.empleado;
    const Icon = config.icon;
    return <Icon className={`h-6 w-6 ${config.color}`} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
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
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-background/50"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin/usuarios"
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 bg-primary text-primary-foreground shadow-sm"
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Gestión de Usuarios
              </h1>
              <p className="text-muted-foreground">
                Administra empleados, empresas y otros usuarios de la plataforma
              </p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg">
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700/80">Total Usuarios</p>
                  <p className="text-3xl font-bold text-blue-900">{usuarios.length}</p>
                  <p className="text-xs text-blue-600/70 mt-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Actualizado ahora
                  </p>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700/80">Empleados</p>
                  <p className="text-3xl font-bold text-emerald-900">
                    {usuarios.filter(u => u.tipo === 'empleado').length}
                  </p>
                  <p className="text-xs text-emerald-600/70 mt-1">
                    Usuarios activos
                  </p>
                </div>
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <UserCheck className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700/80">Empresas</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {usuarios.filter(u => u.tipo === 'empresa').length}
                  </p>
                  <p className="text-xs text-purple-600/70 mt-1">
                    Organizaciones
                  </p>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <Building2 className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white/70 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              Filtros y Búsqueda
            </CardTitle>
            <CardDescription>
              Encuentra usuarios específicos usando los filtros disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:bg-background"
                />
              </div>
              
              <Select 
                value={userTypeFilter} 
                onChange={(e) => setUserTypeFilter(e.target.value)}
                className="bg-background/50 border-border/50"
              >
                <option value="all">Todos los tipos</option>
                <option value="empleado">Empleados</option>
                <option value="empresa">Empresas</option>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setUserTypeFilter('all');
                  setStatusFilter('all');
                }}
                className="border-border/50 hover:bg-muted/50"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Lista de Usuarios</CardTitle>
                <CardDescription className="mt-1">
                  {filteredUsers.length} usuario(s) encontrado(s)
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="border-border/50">
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-muted/50 to-muted/30">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-foreground/80 border-b border-border/50">Usuario</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground/80 border-b border-border/50">Tipo</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground/80 border-b border-border/50">Contacto</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground/80 border-b border-border/50">Registro</th>
                    <th className="text-right py-4 px-6 font-semibold text-foreground/80 border-b border-border/50">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((usuario, index) => (
                    <tr 
                      key={usuario.id} 
                      className={`border-b border-border/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-background/50' : 'bg-muted/20'
                      }`}
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-sm">
                            {getStatusIcon(usuario.tipo)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-base">{usuario.nombre}</p>
                            <p className="text-sm text-muted-foreground">ID: {usuario.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        {getUserTypeBadge(usuario.tipo)}
                      </td>
                      <td className="py-5 px-6">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                              <Mail className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-foreground font-medium text-sm">{usuario.email}</span>
                          </div>
                          {usuario.telefono && (
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Phone className="h-4 w-4 text-emerald-600" />
                              </div>
                              <span className="text-foreground font-medium text-sm">{usuario.telefono}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Calendar className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="text-foreground font-medium">
                            {usuario.fecha_registro ? 
                              new Date(usuario.fecha_registro).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 
                              'No disponible'
                            }
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-500/30 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 shadow-sm transition-all duration-200"
                            onClick={() => handleViewUser(usuario.id, usuario.tipo)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 shadow-sm transition-all duration-200"
                            onClick={() => handleEditUser(usuario.id, usuario.tipo)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive shadow-sm transition-all duration-200"
                            onClick={() => handleDeleteUser(usuario.id, usuario.tipo)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Users className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron usuarios</h3>
                  <p className="text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {isViewModalOpen && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}

      {isEditModalOpen && selectedUser && (
        <UserEditModal
          user={selectedUser}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

export default AdminUsuarios;