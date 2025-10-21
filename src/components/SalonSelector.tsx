import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { MapPin, Star, Clock, Phone, Mail, Search } from 'lucide-react';
import { Salon } from '../types';
import { salonService } from '../services/api';

interface SalonSelectorProps {
  onSalonSelect: (salon: Salon) => void;
}

const SalonSelector: React.FC<SalonSelectorProps> = ({ onSalonSelect }) => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSalons = async () => {
      try {
        setLoading(true);
        const salonsData = await salonService.getSalons();
        setSalons(salonsData);
        setFilteredSalons(salonsData);
      } catch (error) {
        console.error('Error loading salons:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSalons();
  }, []);

  useEffect(() => {
    const filtered = salons.filter(salon =>
      salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSalons(filtered);
  }, [searchTerm, salons]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        <span className="ml-2">Cargando salones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Selecciona tu Salón</h2>
        <p className="text-gray-600">Elige el salón donde deseas agendar tu cita</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Buscar salón por nombre, dirección o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSalons.map((salon) => (
          <Card key={salon.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{salon.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {salon.address}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                  <Star className="w-3 h-3 mr-1" />
                  4.8
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 line-clamp-2">{salon.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="w-4 h-4 mr-2" />
                  {salon.phone}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="w-4 h-4 mr-2" />
                  {salon.email}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  Lun - Vie: 9:00 - 18:00
                </div>
              </div>

              <Button 
                onClick={() => onSalonSelect(salon)}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                Seleccionar Salón
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSalons.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron salones que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default SalonSelector;
