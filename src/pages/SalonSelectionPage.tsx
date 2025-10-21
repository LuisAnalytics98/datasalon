import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { salonService } from '../services/api';
import { Salon } from '../types';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Clock, 
  Users,
  Search,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const SalonSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);

  useEffect(() => {
    loadSalons();
  }, []);

  useEffect(() => {
    // Filter salons based on search term
    const filtered = salons.filter(salon =>
      salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSalons(filtered);
  }, [salons, searchTerm]);

  const loadSalons = async () => {
    try {
      setLoading(true);
      const salonsData = await salonService.getSalons();
      setSalons(salonsData);
      setFilteredSalons(salonsData);
    } catch (error) {
      console.error('Error loading salons:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los salones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalonSelect = (salon: Salon) => {
    setSelectedSalon(salon);
    // Store selected salon in localStorage for the booking process
    localStorage.setItem('selectedSalon', JSON.stringify(salon));
    navigate('/booking');
  };

  const getSalonRating = () => {
    // Mock rating - in real app this would come from reviews
    return (4.2 + Math.random() * 0.6).toFixed(1);
  };

  const getSalonAvailability = () => {
    // Mock availability - in real app this would be calculated
    const now = new Date();
    const hour = now.getHours();
    return hour >= 9 && hour <= 18 ? 'Abierto' : 'Cerrado';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Selecciona tu Salón</h1>
          <p className="text-xl text-gray-600 mb-6">
            Elige el salón donde quieres reservar tu cita
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar salón por nombre o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Salons Grid */}
        {filteredSalons.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron salones' : 'No hay salones disponibles'}
              </h3>
              <p className="text-gray-500 text-center">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'No hay salones registrados en este momento'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSalons.map((salon) => (
              <Card key={salon.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 group-hover:text-pink-600 transition-colors">
                        {salon.name}
                      </CardTitle>
                      <CardDescription className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {salon.address}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={getSalonAvailability() === 'Abierto' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {getSalonAvailability()}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(parseFloat(getSalonRating()))
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {getSalonRating()} (24 reseñas)
                    </span>
                  </div>

                  {/* Description */}
                  {salon.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {salon.description}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {salon.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {salon.email}
                    </div>
                  </div>

                  {/* Services Preview */}
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      Corte
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Color
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Uñas
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      +3 más
                    </Badge>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleSalonSelect(salon)}
                    className="w-full bg-pink-600 hover:bg-pink-700 group-hover:bg-pink-700 transition-colors"
                  >
                    Reservar Cita
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Popular Services Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Servicios Populares
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Corte de Cabello', icon: '✂️', description: 'Corte profesional' },
              { name: 'Coloración', icon: '🎨', description: 'Color y mechas' },
              { name: 'Manicure', icon: '💅', description: 'Cuidado de uñas' },
              { name: 'Tratamientos', icon: '✨', description: 'Cuidado capilar' }
            ].map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How it Works Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Selecciona tu Salón</h3>
              <p className="text-gray-600 text-sm">
                Elige el salón que más te guste de nuestra lista
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Reserva tu Cita</h3>
              <p className="text-gray-600 text-sm">
                Selecciona el servicio, empleado y horario que prefieras
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. ¡Disfruta!</h3>
              <p className="text-gray-600 text-sm">
                Recibe confirmación y disfruta de tu servicio
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonSelectionPage;
