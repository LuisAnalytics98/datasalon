import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  Star, 
  User, 
  Scissors, 
  Heart,
  Camera,
  Download,
  Star as StarIcon
} from 'lucide-react';

interface ServiceHistory {
  id: string;
  serviceName: string;
  employeeName: string;
  employeeAvatar?: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'completed' | 'cancelled' | 'no-show';
  rating?: number;
  review?: string;
  photos?: string[];
  notes?: string;
}

interface ClientPreferences {
  favoriteServices: string[];
  preferredEmployees: string[];
  preferredTimes: string[];
  specialRequests: string;
  colorPreferences: string;
  stylePreferences: string;
}

interface ClientServiceHistoryProps {
  clientId: string;
}

const ClientServiceHistory: React.FC<ClientServiceHistoryProps> = ({ clientId }) => {
  const { toast } = useToast();
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [preferences, setPreferences] = useState<ClientPreferences>({
    favoriteServices: [],
    preferredEmployees: [],
    preferredTimes: [],
    specialRequests: '',
    colorPreferences: '',
    stylePreferences: ''
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    loadServiceHistory();
    loadPreferences();
  }, [clientId]);

  const loadServiceHistory = async () => {
    try {
      setLoading(true);
      // Mock data for now - in real implementation, this would come from the API
      const mockHistory: ServiceHistory[] = [
        {
          id: '1',
          serviceName: 'Corte de Cabello',
          employeeName: 'María González',
          employeeAvatar: '/avatars/maria.jpg',
          date: '2024-01-15',
          time: '14:00',
          duration: 60,
          price: 15000,
          status: 'completed',
          rating: 5,
          review: 'Excelente servicio, muy profesional',
          photos: ['/photos/corte1.jpg', '/photos/corte2.jpg'],
          notes: 'Corte bob, me encantó el resultado'
        },
        {
          id: '2',
          serviceName: 'Coloración',
          employeeName: 'Carlos Rodríguez',
          employeeAvatar: '/avatars/carlos.jpg',
          date: '2024-01-08',
          time: '10:00',
          duration: 120,
          price: 25000,
          status: 'completed',
          rating: 4,
          review: 'Muy buen trabajo, el color quedó perfecto',
          notes: 'Color rubio ceniza, muy natural'
        },
        {
          id: '3',
          serviceName: 'Manicure',
          employeeName: 'Ana Martínez',
          employeeAvatar: '/avatars/ana.jpg',
          date: '2024-01-01',
          time: '16:00',
          duration: 45,
          price: 8000,
          status: 'completed',
          rating: 5,
          review: 'Perfecto, muy detallista',
          notes: 'Uñas francesas clásicas'
        }
      ];
      setServiceHistory(mockHistory);
    } catch (error) {
      console.error('Error loading service history:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de servicios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      // Mock data for now - in real implementation, this would come from the API
      const mockPreferences: ClientPreferences = {
        favoriteServices: ['Corte de Cabello', 'Coloración'],
        preferredEmployees: ['María González', 'Carlos Rodríguez'],
        preferredTimes: ['14:00', '15:00', '16:00'],
        specialRequests: 'Prefiero cortes que no sean muy cortos',
        colorPreferences: 'Rubio ceniza, castaño claro',
        stylePreferences: 'Estilo moderno y elegante'
      };
      setPreferences(mockPreferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      case 'no-show':
        return <Badge className="bg-gray-100 text-gray-800">No se presentó</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        <span className="ml-2">Cargando historial...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Mi Historial de Servicios</h2>
        <p className="text-gray-600">Revisa tus servicios anteriores y gestiona tus preferencias</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          {serviceHistory.length > 0 ? (
            <div className="space-y-4">
              {serviceHistory.map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={service.employeeAvatar} alt={service.employeeName} />
                          <AvatarFallback>
                            {service.employeeName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{service.serviceName}</h3>
                            {getStatusBadge(service.status)}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {service.employeeName}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(service.date)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatTime(service.time)}
                            </div>
                            <div className="flex items-center">
                              <Scissors className="w-4 h-4 mr-1" />
                              {service.duration} min
                            </div>
                          </div>

                          {service.notes && (
                            <p className="text-sm text-gray-600 mb-2">{service.notes}</p>
                          )}

                          {service.rating && (
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex items-center">
                                {renderStars(service.rating)}
                              </div>
                              {service.review && (
                                <span className="text-sm text-gray-600">"{service.review}"</span>
                              )}
                            </div>
                          )}

                          {service.photos && service.photos.length > 0 && (
                            <div className="flex space-x-2 mt-3">
                              {service.photos.map((photo, index) => (
                                <div key={index} className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Camera className="w-6 h-6 text-gray-400" />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4">
                            <div className="text-lg font-semibold text-green-600">
                              ₡{service.price.toLocaleString()}
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              Descargar Recibo
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay servicios registrados</h3>
              <p className="text-gray-600">Cuando agendes tu primera cita, aparecerá aquí.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Favorite Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-pink-600" />
                  Servicios Favoritos
                </CardTitle>
                <CardDescription>Servicios que más te gustan</CardDescription>
              </CardHeader>
              <CardContent>
                {preferences.favoriteServices.length > 0 ? (
                  <div className="space-y-2">
                    {preferences.favoriteServices.map((service, index) => (
                      <Badge key={index} variant="secondary" className="mr-2 mb-2">
                        {service}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No tienes servicios favoritos aún</p>
                )}
              </CardContent>
            </Card>

            {/* Preferred Employees */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-600" />
                  Profesionales Preferidos
                </CardTitle>
                <CardDescription>Profesionales que prefieres</CardDescription>
              </CardHeader>
              <CardContent>
                {preferences.preferredEmployees.length > 0 ? (
                  <div className="space-y-2">
                    {preferences.preferredEmployees.map((employee, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{employee}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No tienes profesionales preferidos aún</p>
                )}
              </CardContent>
            </Card>

            {/* Preferred Times */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Horarios Preferidos
                </CardTitle>
                <CardDescription>Horarios que prefieres para tus citas</CardDescription>
              </CardHeader>
              <CardContent>
                {preferences.preferredTimes.length > 0 ? (
                  <div className="space-y-2">
                    {preferences.preferredTimes.map((time, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {time}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No tienes horarios preferidos configurados</p>
                )}
              </CardContent>
            </Card>

            {/* Special Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scissors className="w-5 h-5 mr-2 text-purple-600" />
                  Solicitudes Especiales
                </CardTitle>
                <CardDescription>Preferencias y solicitudes especiales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {preferences.specialRequests && (
                  <div>
                    <h4 className="font-medium mb-2">Solicitudes Generales:</h4>
                    <p className="text-sm text-gray-600">{preferences.specialRequests}</p>
                  </div>
                )}
                
                {preferences.colorPreferences && (
                  <div>
                    <h4 className="font-medium mb-2">Preferencias de Color:</h4>
                    <p className="text-sm text-gray-600">{preferences.colorPreferences}</p>
                  </div>
                )}
                
                {preferences.stylePreferences && (
                  <div>
                    <h4 className="font-medium mb-2">Preferencias de Estilo:</h4>
                    <p className="text-sm text-gray-600">{preferences.stylePreferences}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientServiceHistory;
