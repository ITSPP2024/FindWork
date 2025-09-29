import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Mail, Lock, User, Building2 } from 'lucide-react';
import { ImageWithFallback } from '../components/ui/image-with-fallback';

function Login() {
  const navigate = useNavigate();
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    tipoUsuario: 'empleado'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password, formData.tipoUsuario);
      } else {
        result = await register(formData.nombre, formData.email, formData.password, formData.tipoUsuario);
      }

      if (result.success) {
        const redirectPath = formData.tipoUsuario === 'admin' 
          ? '/admin/dashboard'
          : formData.tipoUsuario === 'empresa'
            ? '/empresa/dashboard'
            : '/empleado/dashboard';
        navigate(redirectPath);
      } else {
        alert(result.error || 'Error en la autenticación');
      }
    } catch (error) {
      console.error('Error en autenticación:', error);
      alert('Error en la autenticación');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      tipoUsuario: 'empleado'
    });
  };

  const handleTabChange = (isLoginMode) => {
    setIsLogin(isLoginMode);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      tipoUsuario: 'empleado'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left side - Form */}
        <div className="flex flex-col justify-center px-6 py-12 lg:px-8">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8">
              <Button
                variant="ghost"
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
              
              <div className="text-center">
                <h1 className="text-3xl font-medium text-foreground mb-2">
                  Bienvenido a FindWork
                </h1>
                <p className="text-muted-foreground">
                  Accede a tu cuenta o crea una nueva
                </p>
              </div>
            </div>

            <Card className="border-border shadow-lg">
              <CardContent className="p-6">
            <Tabs className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  active={isLogin}
                  onClick={() => handleTabChange(true)}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger 
                  active={!isLogin}
                  onClick={() => handleTabChange(false)}
                  className="flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Registrarse
                </TabsTrigger>
              </TabsList>

              <TabsContent className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                        <User className="h-4 w-4" />
                        Nombre Completo
                      </Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="Tu nombre completo"
                        value={formData.nombre}
                        onChange={handleChange}
                        required={!isLogin}
                        className="h-11"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      <Mail className="h-4 w-4" />
                      Correo Electrónico
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type={formData.tipoUsuario === 'admin' ? 'text' : 'email'}
                      placeholder={formData.tipoUsuario === 'admin' ? 'admin' : 'tu@email.com'}
                      value={formData.email}
                      onChange={handleChange}
                      required={formData.tipoUsuario !== 'admin'}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      <Lock className="h-4 w-4" />
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipoUsuario" className="text-sm font-medium text-gray-700">
                      <Building2 className="h-4 w-4" />
                      Tipo de Usuario
                    </Label>
                    <Select
                      name="tipoUsuario"
                      value={formData.tipoUsuario}
                      onChange={handleChange}
                      className="h-11"
                    >
                      <SelectItem value="empleado">Empleado</SelectItem>
                      <SelectItem value="empresa">Empresa</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </Select>
                  </div>

                  <Button 
                    className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-medium rounded-lg transition-colors" 
                    type="submit"
                  >
                    {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                  </Button>

                  {isLogin && (
                    <div className="text-center">
                      <Button
                        variant="link"
                        type="button"
                        onClick={toggleMode}
                        className="text-sm text-accent hover:text-accent/80"
                      >
                        ¿No tienes cuenta? Regístrate aquí
                      </Button>
                    </div>
                  )}
                </form>
              </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right side - Image and branding */}
        <div className="hidden lg:flex flex-col justify-center bg-primary px-8">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-4xl font-medium text-white mb-4">
                Tu carrera profesional comienza aquí
              </h2>
              <p className="text-lg text-white/80">
                Conecta con oportunidades que realmente importan y construye el futuro que deseas.
              </p>
            </div>
            
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758873269317-51888e824b28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwdGVhbSUyMG1lZXRpbmclMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc1OTAzOTQ5Mnww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Equipo profesional colaborando"
              className="rounded-2xl shadow-xl w-full h-80 object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
