import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ImageWithFallback } from '../components/ui/image-with-fallback';
import { Search, Briefcase, Users, CheckCircle, ArrowRight, Building2, MapPin, Clock } from 'lucide-react';

function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Search,
      title: 'Para Candidatos',
      description: 'Encuentra oportunidades que se ajusten a tu perfil profesional y experiencia.',
      benefits: ['Búsqueda inteligente', 'Aplicación directa', 'Seguimiento en tiempo real'],
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop'
    },
    {
      icon: Briefcase,
      title: 'Para Empresas',
      description: 'Publica puestos de trabajo y conecta con el talento que necesitas.',
      benefits: ['Publicación sencilla', 'Gestión de candidatos', 'Herramientas de selección'],
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1469&auto=format&fit=crop'
    },
    {
      icon: Users,
      title: 'Conexión Efectiva',
      description: 'Algoritmos inteligentes que conectan el talento con las oportunidades.',
      benefits: ['Matching preciso', 'Comunicación directa', 'Proceso eficiente'],
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1484&auto=format&fit=crop'
    }
  ];

  const recentJobs = [
    {
      id: 1,
      titulo: 'Desarrollador Frontend Senior',
      empresa: 'TechCorp',
      ubicacion: 'Madrid, España',
      tipo_puesto: 'Tiempo Completo',
      salario: '45000-60000',
      horario: 'Lunes a Viernes 9:00-17:00',
      fecha_publicacion: '2 días',
      imagen: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1472&auto=format&fit=crop'
    },
    {
      id: 2,
      titulo: 'Diseñador UX/UI',
      empresa: 'CreativeStudio',
      ubicacion: 'Barcelona, España',
      tipo_puesto: 'Híbrido',
      salario: '35000-45000',
      horario: 'Flexible',
      fecha_publicacion: '3 días',
      imagen: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1528&auto=format&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-primary/5 to-background overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1469&auto=format&fit=crop"
            alt="Hero background"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Encuentra tu próxima oportunidad profesional
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Conectamos talento con las mejores empresas. Tu carrera profesional comienza aquí.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/login')}>
              Comenzar ahora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              Publicar empleo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg overflow-hidden">
                <div className="h-48 relative">
                  <ImageWithFallback
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Jobs Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Empleos Destacados</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {recentJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="h-40 relative">
                  <ImageWithFallback
                    src={job.imagen}
                    alt={job.titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{job.titulo}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {job.empresa}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {job.ubicacion}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {job.horario}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        Ver detalles
                      </Button>
                      <Button size="sm">
                        Aplicar ahora
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Ver más empleos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;