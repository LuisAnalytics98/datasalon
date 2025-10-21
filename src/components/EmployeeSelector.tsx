import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Star, Clock, User, Award } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeSelectorProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onEmployeeSelect: (employee: Employee) => void;
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({ 
  employees, 
  selectedEmployee, 
  onEmployeeSelect 
}) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Selecciona tu Profesional</h2>
        <p className="text-gray-600">Elige el profesional que realizará tu servicio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <Card 
            key={employee.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedEmployee?.id === employee.id 
                ? 'ring-2 ring-pink-500 bg-pink-50' 
                : 'hover:border-pink-300'
            }`}
            onClick={() => onEmployeeSelect(employee)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
                    <AvatarFallback className="bg-pink-100 text-pink-800">
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {employee.firstName} {employee.lastName}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Award className="w-4 h-4 mr-1" />
                      {employee.specialty || 'Profesional'}
                    </CardDescription>
                  </div>
                </div>
                {selectedEmployee?.id === employee.id && (
                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < (employee.rating || 4.5) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {employee.rating || 4.5} ({employee.reviewCount || 12} reseñas)
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  {employee.experience || '5+ años'} de experiencia
                </div>

                <div className="flex flex-wrap gap-1">
                  {employee.services.slice(0, 3).map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {employee.services.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{employee.services.length - 3} más
                    </Badge>
                  )}
                </div>

                {employee.bio && (
                  <p className="text-sm text-gray-600 line-clamp-2">{employee.bio}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay empleados disponibles para este servicio.</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeSelector;
