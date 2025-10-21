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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">¡Solicitud Enviada!</CardTitle>
            <CardDescription>
              Tu solicitud de acceso ha sido enviada correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              <p>Hemos recibido tu solicitud y la hemos enviado al equipo de DataSalon.</p>
              <p className="mt-2">Te contactaremos en las próximas 24 horas con las credenciales de acceso.</p>
            </div>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-pink-600" />
          </div>
          <CardTitle className="text-3xl text-gray-900">Solicitar Acceso</CardTitle>
          <CardDescription className="text-lg">
            Completa el formulario para solicitar acceso a DataSalon para tu salón
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="adminName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salonName" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
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
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">¿Qué sucede después?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
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
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-pink-600 hover:bg-pink-700"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalonRequestPage;
