import { Button } from "@/components/ui/button";
import { Crown, Calendar, Users, TrendingUp, Clock, BarChart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import salonHero from "@/assets/salon-hero.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Data Salon</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="hover:text-primary transition-colors">Características</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Precios</a>
            <a href="#about" className="hover:text-primary transition-colors">Acerca de</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link to="/register">
              <Button>Comenzar Prueba Gratis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${salonHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
        </div>
        
        <div className="relative container mx-auto px-4 z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-muted/50 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm">Confiado por más de 500 Salones Premium</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Eleva Tu Salón de{" "}
              <span className="text-primary">Belleza</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Transforma tu salón de belleza con nuestra plataforma de gestión premium. 
              Optimiza reservas, aumenta ingresos y ofrece experiencias excepcionales a tus clientes.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/register">
                <Button size="lg" className="text-lg">
                  Comenzar Prueba Gratis
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Ver Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <div className="text-muted-foreground">Satisfacción del Cliente</div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
                <div className="text-4xl font-bold text-primary mb-2">40%</div>
                <div className="text-muted-foreground">Aumento de Ingresos</div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Reservas Online</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Todo Lo Que Necesitas Para Triunfar
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Herramientas integrales de gestión de salones diseñadas para negocios de belleza modernos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="w-12 h-12 text-primary" />}
              title="Sistema de Reservas Inteligente"
              description="Reservas online 24/7 con programación inteligente y recordatorios automáticos"
            />
            <FeatureCard
              icon={<Users className="w-12 h-12 text-primary" />}
              title="Gestión de Clientes"
              description="Perfiles completos de clientes con historial de servicios y preferencias"
            />
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12 text-primary" />}
              title="Procesamiento de Pagos"
              description="Pagos sin problemas con integración Stripe y facturación post-servicio"
            />
            <FeatureCard
              icon={<BarChart className="w-12 h-12 text-primary" />}
              title="Panel de Análisis"
              description="Insights de ingresos, rendimiento del personal y métricas de crecimiento del negocio"
            />
            <FeatureCard
              icon={<Clock className="w-12 h-12 text-primary" />}
              title="Programación de Personal"
              description="Optimiza horarios del personal y rastrea disponibilidad en tiempo real"
            />
            <FeatureCard
              icon={<Star className="w-12 h-12 text-primary" />}
              title="Control de Inventario"
              description="Rastrea productos, gestiona niveles de stock y automatiza reórdenes"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary/20 via-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo Para Transformar Tu Salón?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a cientos de salones de belleza exitosos que ya están usando Data Salon
          </p>
          <Link to="/register">
            <Button size="lg" className="text-lg">
              Comenzar Ahora - Es Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              <span className="font-bold">Data Salon</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 Data Salon. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-8 hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Landing;
