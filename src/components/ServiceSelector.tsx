import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Clock, DollarSign, Scissors, Sparkles, Heart, Zap } from 'lucide-react';
import { Service } from '../types';

interface ServiceSelectorProps {
  services: Service[];
  selectedService: Service | null;
  onServiceSelect: (service: Service) => void;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ 
  services, 
  selectedService, 
  onServiceSelect 
}) => {
  const getServiceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'corte':
        return <Scissors className="w-6 h-6" />;
      case 'color':
        return <Sparkles className="w-6 h-6" />;
      case 'uñas':
        return <Heart className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'corte':
        return 'bg-blue-100 text-blue-800';
      case 'color':
        return 'bg-purple-100 text-purple-800';
      case 'uñas':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Selecciona tu Servicio</h2>
        <p className="text-gray-600">Elige el servicio que deseas recibir</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <Card 
            key={service.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedService?.id === service.id 
                ? 'ring-2 ring-pink-500 bg-pink-50' 
                : 'hover:border-pink-300'
            }`}
            onClick={() => onServiceSelect(service)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(service.category)}`}>
                    {getServiceIcon(service.category)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Badge variant="outline" className={getCategoryColor(service.category)}>
                        {service.category}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
                {selectedService?.id === service.id && (
                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{service.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {service.duration} min
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <DollarSign className="w-4 h-4 mr-1" />
                    ₡{service.price.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay servicios disponibles en este salón.</p>
        </div>
      )}
    </div>
  );
};

export default ServiceSelector;
