import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { CheckCircle, Calendar, Clock, User, Scissors, MapPin, Phone, Mail } from 'lucide-react';
import { Salon, Service, Employee } from '../types';

interface BookingConfirmationProps {
  salon: Salon;
  service: Service;
  employee: Employee;
  date: string;
  time: string;
  onConfirm: (bookingData: {
    notes: string;
    specialRequests: string;
  }) => void;
  onBack: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  salon,
  service,
  employee,
  date,
  time,
  onConfirm,
  onBack
}) => {
  const [notes, setNotes] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm({ notes, specialRequests });
    } finally {
      setIsConfirming(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirma tu Cita</h2>
        <p className="text-gray-600">Revisa los detalles y confirma tu reserva</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Resumen de tu Cita
            </CardTitle>
            <CardDescription>Detalles de tu reserva</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Salon Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-pink-600" />
                {salon.name}
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {salon.address}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {salon.phone}
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {salon.email}
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center">
                <Scissors className="w-5 h-5 mr-2 text-pink-600" />
                {service.name}
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>{service.description}</p>
                <div className="flex items-center justify-between">
                  <span>Duración: {service.duration} minutos</span>
                  <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                    ₡{service.price.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Employee Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center">
                <User className="w-5 h-5 mr-2 text-pink-600" />
                {employee.firstName} {employee.lastName}
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>{employee.specialty || 'Profesional'}</p>
                <div className="flex items-center">
                  <span>Experiencia: {employee.experience || '5+ años'}</span>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-pink-600" />
                Fecha y Hora
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(date)}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatTime(time)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
            <CardDescription>Agrega notas o solicitudes especiales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="notes">Notas para el profesional</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Cualquier información adicional que quieras compartir..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Solicitudes especiales</Label>
              <Textarea
                id="specialRequests"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Preferencias de color, estilo, etc..."
                rows={3}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Política de Cancelación</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Puedes cancelar hasta 24 horas antes sin costo</li>
                <li>• Cancelaciones con menos de 24 horas tendrán un cargo del 50%</li>
                <li>• No presentarse a la cita resultará en el cargo completo</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Confirmación</h4>
              <p className="text-sm text-green-800">
                Recibirás un email de confirmación y un recordatorio 8 horas antes de tu cita.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button 
          onClick={handleConfirm}
          disabled={isConfirming}
          className="bg-pink-600 hover:bg-pink-700"
        >
          {isConfirming ? 'Confirmando...' : 'Confirmar Cita'}
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
