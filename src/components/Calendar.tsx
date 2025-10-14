import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  clientName?: string;
  serviceName?: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onDateSelect?: (date: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
  view?: 'month' | 'week' | 'day';
  showTimeSlots?: boolean;
  workingHours?: {
    start: string;
    end: string;
  };
}

const Calendar: React.FC<CalendarProps> = ({
  events,
  onDateSelect,
  onEventClick,
  view = 'month',
  showTimeSlots = false,
  workingHours = { start: '09:00', end: '18:00' }
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const getWeekDays = () => {
    return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  };

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

  const getEventsForDate = (date: Date) => {
    const dateString = formatDate(date);
    return events.filter(event => event.startTime.startsWith(dateString));
  };

  const getTimeSlots = () => {
    const slots = [];
    const start = new Date(`2000-01-01T${workingHours.start}`);
    const end = new Date(`2000-01-01T${workingHours.end}`);
    
    for (let time = new Date(start); time < end; time.setMinutes(time.getMinutes() + 30)) {
      slots.push(time.toTimeString().slice(0, 5));
    }
    
    return slots;
  };

  const handleDateClick = (date: Date) => {
    const dateString = formatDate(date);
    setSelectedDate(dateString);
    if (onDateSelect) {
      onDateSelect(dateString);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getEventStatusColor = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'in_progress': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (view === 'day') {
    const timeSlots = getTimeSlots();
    const dayEvents = events.filter(event => 
      event.startTime.startsWith(selectedDate || formatDate(currentDate))
    );

    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            {selectedDate ? 
              new Date(selectedDate).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) :
              'Selecciona una fecha'
            }
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {timeSlots.map((slot) => {
            const slotEvents = dayEvents.filter(event => 
              event.startTime.includes(slot)
            );

            return (
              <div key={slot} className="flex items-center space-x-4 py-2">
                <div className="w-20 text-sm text-gray-400">
                  {formatTime(slot)}
                </div>
                <div className="flex-1 space-y-1">
                  {slotEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className={`p-2 rounded-lg text-white text-sm cursor-pointer hover:opacity-80 transition-opacity ${getEventStatusColor(event.status)}`}
                    >
                      <div className="font-medium">{event.title}</div>
                      {event.clientName && (
                        <div className="text-xs opacity-90">{event.clientName}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">
          {getMonthName(currentDate)}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week Days Header */}
        {getWeekDays().map((day) => (
          <div key={day} className="text-center text-gray-400 font-semibold py-2">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {getDaysInMonth(currentDate).map((date, index) => {
          if (!date) {
            return <div key={index} className="h-24" />;
          }

          const dateEvents = getEventsForDate(date);
          const isToday = formatDate(date) === formatDate(new Date());
          const isSelected = formatDate(date) === selectedDate;

          return (
            <div
              key={index}
              className={`h-24 p-2 border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
                isToday ? 'bg-yellow-400/20 border-yellow-400' : ''
              } ${isSelected ? 'bg-yellow-400/30 border-yellow-400' : ''}`}
              onClick={() => handleDateClick(date)}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday ? 'text-yellow-400' : 'text-white'
              }`}>
                {date.getDate()}
              </div>
              
              <div className="space-y-1">
                {dateEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                    className={`text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity ${getEventStatusColor(event.status)}`}
                  >
                    {event.title}
                  </div>
                ))}
                {dateEvents.length > 2 && (
                  <div className="text-xs text-gray-400">
                    +{dateEvents.length - 2} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-400">Pendiente</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-400">Confirmada</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span className="text-gray-400">En Progreso</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-400">Completada</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-400">Cancelada</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
