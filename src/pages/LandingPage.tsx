import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Star, 
  Users, 
  Shield, 
  Smartphone,
  ChevronRight,
  CheckCircle,
  Quote
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-yellow-400" />,
      title: "Reserva Fácil",
      description: "Reserva tu cita en segundos con nuestro sistema intuitivo"
    },
    {
      icon: <Clock className="w-8 h-8 text-yellow-400" />,
      title: "Gestión de Horarios",
      description: "Controla tus horarios y disponibilidad de manera eficiente"
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-400" />,
      title: "Reviews y Calificaciones",
      description: "Evalúa servicios y comparte tu experiencia"
    },
    {
      icon: <Users className="w-8 h-8 text-yellow-400" />,
      title: "Gestión de Equipo",
      description: "Administra empleados y asigna servicios fácilmente"
    },
    {
      icon: <Shield className="w-8 h-8 text-yellow-400" />,
      title: "Seguro y Confiable",
      description: "Tus datos están protegidos con la mejor seguridad"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-yellow-400" />,
      title: "Acceso Móvil",
      description: "Accede desde cualquier dispositivo, en cualquier momento"
    }
  ];

  const testimonials = [
    {
      name: "María González",
      role: "Cliente",
      content: "Excelente servicio, muy fácil de usar y las citas siempre están bien organizadas.",
      rating: 5
    },
    {
      name: "Carlos Rodríguez",
      role: "Propietario de Salón",
      content: "Esta plataforma revolucionó mi negocio. Ahora gestiono todo de manera más eficiente.",
      rating: 5
    },
    {
      name: "Ana Martínez",
      role: "Estilista",
      content: "Me encanta cómo puedo gestionar mis citas y horarios desde mi teléfono.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-sm z-50 border-b border-yellow-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-yellow-400">DataSalon</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-300 hover:text-yellow-400 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Revoluciona
              </span>
              <br />
              <span className="text-white">tu Salón de Belleza</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              La plataforma más completa para gestionar tu salón, reservar citas y 
              brindar un servicio excepcional a tus clientes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/salon-request" 
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-yellow-400/25"
              >
                Comenzar Ahora
                <ChevronRight className="inline-block ml-2 w-5 h-5" />
              </Link>
              
              <Link 
                to="/salons" 
                className="border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 hover:text-black transition-all duration-300"
              >
                Ver Demo
              </Link>
            </div>

            <div className="flex justify-center items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">500+</div>
                <div className="text-gray-400">Salones</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">50K+</div>
                <div className="text-gray-400">Citas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">98%</div>
                <div className="text-gray-400">Satisfacción</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-yellow-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-yellow-400 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Todo lo que necesitas para tu
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"> salón</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Una plataforma completa que simplifica la gestión de tu salón y mejora 
              la experiencia de tus clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:scale-105 group"
              >
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Lo que dicen nuestros
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"> usuarios</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Miles de profesionales confían en DataSalon para gestionar sus salones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gray-900 p-8 rounded-2xl border border-gray-700 hover:border-yellow-400/50 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <Quote className="w-8 h-8 text-yellow-400 mr-2" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <div className="font-bold text-white">{testimonial.name}</div>
                  <div className="text-yellow-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 to-yellow-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            ¿Listo para transformar tu salón?
          </h2>
          <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
            Únete a miles de profesionales que ya están usando DataSalon para 
            hacer crecer su negocio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/salon-request" 
              className="bg-black text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
            >
              Comenzar Gratis
            </Link>
            <Link 
              to="/login" 
              className="border-2 border-black text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-black hover:text-white transition-all duration-300"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">DataSalon</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                La plataforma más completa para gestionar salones de belleza. 
                Simplifica tu trabajo y mejora la experiencia de tus clientes.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-colors cursor-pointer">
                  <span className="font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-colors cursor-pointer">
                  <span className="font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-colors cursor-pointer">
                  <span className="font-bold">i</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Demo</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Estado del Sistema</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Comunidad</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DataSalon. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
