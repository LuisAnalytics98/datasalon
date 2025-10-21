import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import { SalonRequestData } from '../types';
import { salonRequestService } from '../services/salonRequestService';
import { CheckCircle, ArrowLeft, Building2, User, Mail, Phone } from 'lucide-react';
import BackToHomeButton from '../components/BackToHomeButton';

const SalonRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<SalonRequestData>({
    adminName: '',
    salonName: '',
    email: '',
    phone: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await salonRequestService.createSalonRequest(formData);
      setIsSubmitted(true);
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud ha sido enviada correctamente. Te contactaremos pronto.",
      });
    } catch (error) {
      console.error('Error submitting salon request:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu solicitud. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
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
                <BackToHomeButton variant="minimal" />
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
          <div className="relative z-10 max-w-md w-full space-y-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-6 w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h1 className="text-4xl font-bold text-yellow-400 mb-2">¡Solicitud Enviada!</h1>
              <p className="text-gray-400">
                Tu solicitud de acceso ha sido enviada correctamente
              </p>
            </div>

            <div className="bg-gray-900/90 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-2xl">
              <div className="text-center space-y-4">
                <div className="text-sm text-gray-300">
                  <p>Hemos recibido tu solicitud y la hemos enviado al equipo de DataSalon.</p>
                  <p className="mt-2">Te contactaremos en las próximas 24 horas con las credenciales de acceso.</p>
                </div>
                <Button 
                  onClick={() => navigate('/')} 
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-3 px-4 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-400/25"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

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
              <BackToHomeButton variant="minimal" />
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
        <div className="relative z-10 max-w-2xl w-full space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-6 w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/30">
              <Building2 className="w-10 h-10 text-yellow-400" />
            </div>
            <h1 className="text-4xl font-bold text-yellow-400 mb-2">Solicitar Acceso</h1>
            <p className="text-gray-400">
              Completa el formulario para solicitar acceso a DataSalon para tu salón
            </p>
          </div>

          <div className="bg-gray-900/90 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="adminName" className="flex items-center gap-2 text-gray-300">
                  <User className="w-4 h-4 text-yellow-400" />
                  Nombre del Administrador
                </Label>
                <Input
                  id="adminName"
                  name="adminName"
                  type="text"
                  value={formData.adminName}
                  onChange={handleInputChange}
                  placeholder="Tu nombre completo"
                  required
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salonName" className="flex items-center gap-2 text-gray-300">
                  <Building2 className="w-4 h-4 text-yellow-400" />
                  Nombre del Salón
                </Label>
                <Input
                  id="salonName"
                  name="salonName"
                  type="text"
                  value={formData.salonName}
                  onChange={handleInputChange}
                  placeholder="Nombre de tu salón"
                  required
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-gray-300">
                  <Mail className="w-4 h-4 text-yellow-400" />
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                  required
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-gray-300">
                  <Phone className="w-4 h-4 text-yellow-400" />
                  Teléfono Celular
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+506 8888 8888"
                  required
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-400 mb-2">¿Qué sucede después?</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Recibiremos tu solicitud y la revisaremos</li>
                  <li>• Te contactaremos en las próximas 24 horas</li>
                  <li>• Te enviaremos las credenciales de acceso</li>
                  <li>• Podrás configurar tu salón y comenzar a recibir clientes</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-400/25"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                </Button>
              </div>
            </div>
          </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SalonRequestPage;
