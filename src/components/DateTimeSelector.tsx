import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { appointmentService } from '../services/api';

interface DateTimeSelectorProps {
  salonId: string;
  serviceId: string;
  employeeId: string;
  selectedDate: string;
  selectedTime: string;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
}

const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  salonId,
  serviceId,
  employeeId,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect
}) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateAvailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    return date.toDateString() === selected.toDateString();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const loadAvailableSlots = async (date: string) => {
    if (!salonId || !serviceId || !employeeId || !date) return;
    
    try {
      setLoading(true);
      const slots = await appointmentService.getAvailableSlots(
        salonId,
        serviceId,
        employeeId,
        date
      );
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [salonId, serviceId, employeeId, selectedDate]);

  const handleDateClick = (date: Date) => {
    if (isDateAvailable(date)) {
      onDateSelect(formatDate(date));
    }
  };

  const handleTimeClick = (time: string) => {
    onTimeSelect(time);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Selecciona Fecha y Hora</h2>
        <p className="text-gray-600">Elige cuándo deseas recibir tu servicio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Fecha
            </CardTitle>
            <CardDescription>Selecciona el día de tu cita</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-lg font-semibold">
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1">
                {daysOfWeek.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                  <div key={index} className="aspect-square">
                    {day ? (
                      <Button
                        variant={isDateSelected(day) ? "default" : "ghost"}
                        size="sm"
                        className={`w-full h-full ${
                          isDateAvailable(day) 
                            ? 'hover:bg-pink-100' 
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                        disabled={!isDateAvailable(day)}
                        onClick={() => handleDateClick(day)}
                      >
                        {day.getDate()}
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Horario
            </CardTitle>
            <CardDescription>
              {selectedDate 
                ? `Horarios disponibles para ${new Date(selectedDate).toLocaleDateString('es-ES')}`
                : 'Primero selecciona una fecha'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <div className="text-center py-8 text-gray-500">
                Selecciona una fecha para ver los horarios disponibles
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando horarios...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay horarios disponibles para esta fecha
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeClick(time)}
                    className="text-sm"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedDate && selectedTime && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-pink-600" />
            <span className="font-medium text-pink-800">
              Cita programada para el {new Date(selectedDate).toLocaleDateString('es-ES')} a las {selectedTime}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimeSelector;
