import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { serviceService, employeeService, appointmentService } from '../services/api';
import { Service, Employee, BookingData } from '../types';
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const BookingPage: React.FC = () => {
  const { user, salon } = useAuth();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: '',
    employeeId: '',
    date: '',
    startTime: '',
    notes: ''
  });

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const loadServices = async () => {
      if (!salon) return;
      
      try {
        const servicesData = await serviceService.getServices(salon.id);
        setServices(servicesData);
      } catch (error) {
        console.error('Error loading services:', error);
      }
    };

    loadServices();
  }, [salon]);

  useEffect(() => {
    const loadEmployees = async () => {
      if (!salon || !bookingData.serviceId) return;
      
      try {
        const employeesData = await employeeService.getEmployees(salon.id);
        // Filter employees who provide the selected service
        const filteredEmployees = employeesData.filter(emp => 
          emp.services.includes(bookingData.serviceId)
        );
        setEmployees(filteredEmployees);
      } catch (error) {
        console.error('Error loading employees:', error);
      }
    };

    loadEmployees();
  }, [salon, bookingData.serviceId]);

  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (!bookingData.employeeId || !bookingData.serviceId || !bookingData.date) return;
      
      try {
        setLoading(true);
        const slots = await appointmentService.getAvailableSlots(
          bookingData.employeeId,
          bookingData.serviceId,
          bookingData.date
        );
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Error loading available slots:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAvailableSlots();
  }, [bookingData.employeeId, bookingData.serviceId, bookingData.date]);

  const handleServiceSelect = (serviceId: string) => {
    setBookingData({ ...bookingData, serviceId, employeeId: '', date: '', startTime: '' });
    setStep(2);
  };

  const handleEmployeeSelect = (employeeId: string) => {
    setBookingData({ ...bookingData, employeeId, date: '', startTime: '' });
    setStep(3);
  };

  const handleDateSelect = (date: string) => {
    setBookingData({ ...bookingData, date, startTime: '' });
    setStep(4);
  };

  const handleTimeSelect = (startTime: string) => {
    setBookingData({ ...bookingData, startTime });
  };

  const handleBookingSubmit = async () => {
    if (!user || !salon) return;
    
    try {
      setLoading(true);
      setError('');
      
      const selectedService = services.find(s => s.id === bookingData.serviceId);
      if (!selectedService) throw new Error('Servicio no encontrado');
      
      const startTime = new Date(`${bookingData.date}T${bookingData.startTime}`);
      const endTime = new Date(startTime.getTime() + selectedService.duration * 60000);
      
      await appointmentService.createAppointment({
        salonId: salon.id,
        clientId: user.id,
        employeeId: bookingData.employeeId,
        serviceId: bookingData.serviceId,
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: endTime.toTimeString().slice(0, 5),
        status: 'pending',
        notes: bookingData.notes
      });
      
      setStep(5); // Success step
    } catch (error: any) {
      setError(error.message || 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDateString = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSelectedService = () => services.find(s => s.id === bookingData.serviceId);
  const getSelectedEmployee = () => employees.find(e => e.id === bookingData.employeeId);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-yellow-400">DataSalon</h1>
              <span className="ml-4 text-gray-400">Reservar Cita</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= stepNumber ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-gray-400'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 5 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-yellow-400' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>Servicio</span>
            <span>Empleado</span>
            <span>Fecha</span>
            <span>Hora</span>
            <span>Confirmar</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Selecciona un Servicio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className="p-6 bg-gray-800 rounded-lg border border-gray-600 hover:border-yellow-400 transition-colors text-left"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">{service.name}</h3>
                    <p className="text-gray-400 mb-4">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-400 font-semibold">${service.price}</span>
                      <span className="text-gray-400">{service.duration} min</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setStep(1)}
                  className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-white">Selecciona un Empleado</h2>
              </div>
              
              <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold text-white">{getSelectedService()?.name}</h3>
                <p className="text-gray-400">{getSelectedService()?.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => handleEmployeeSelect(employee.id)}
                    className="p-6 bg-gray-800 rounded-lg border border-gray-600 hover:border-yellow-400 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="text-gray-400">Estilista</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setStep(2)}
                  className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-white">Selecciona una Fecha</h2>
              </div>

              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{getSelectedService()?.name}</h3>
                    <p className="text-gray-400">con {getSelectedEmployee()?.firstName} {getSelectedEmployee()?.lastName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-semibold">${getSelectedService()?.price}</p>
                    <p className="text-gray-400">{getSelectedService()?.duration} min</p>
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-white">
                    {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                    <div key={day} className="text-center text-gray-400 font-semibold py-2">
                      {day}
                    </div>
                  ))}
                  
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(currentDate);
                    date.setDate(currentDate.getDate() - currentDate.getDay() + i);
                    const dateString = formatDate(date);
                    const isToday = dateString === formatDate(new Date());
                    const isPast = date < new Date() && !isToday;
                    
                    return (
                      <button
                        key={i}
                        onClick={() => !isPast && handleDateSelect(dateString)}
                        disabled={isPast}
                        className={`p-3 rounded-lg text-center transition-colors ${
                          isPast ? 'text-gray-600 cursor-not-allowed' :
                          bookingData.date === dateString ? 'bg-yellow-400 text-black' :
                          'text-white hover:bg-gray-700'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setStep(3)}
                  className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-white">Selecciona una Hora</h2>
              </div>

              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{getSelectedService()?.name}</h3>
                    <p className="text-gray-400">
                      con {getSelectedEmployee()?.firstName} {getSelectedEmployee()?.lastName}
                    </p>
                    <p className="text-gray-400">{getDateString(new Date(bookingData.date))}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-semibold">${getSelectedService()?.price}</p>
                    <p className="text-gray-400">{getSelectedService()?.duration} min</p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">Cargando horarios disponibles...</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => handleTimeSelect(slot)}
                      className={`p-3 rounded-lg text-center transition-colors ${
                        bookingData.startTime === slot ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      {formatTime(slot)}
                    </button>
                  ))}
                </div>
              )}

              {availableSlots.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No hay horarios disponibles para esta fecha.</p>
                  <button
                    onClick={() => setStep(3)}
                    className="mt-4 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Seleccionar otra fecha
                  </button>
                </div>
              )}

              {bookingData.startTime && (
                <div className="mt-8">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                    rows={3}
                    placeholder="Comentarios especiales o preferencias..."
                  />
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">¡Cita Reservada!</h2>
              <p className="text-gray-400 mb-6">
                Tu cita ha sido reservada exitosamente. Recibirás una confirmación por email.
              </p>
              <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Detalles de la Cita</h3>
                <div className="text-gray-400 space-y-1">
                  <p><strong>Servicio:</strong> {getSelectedService()?.name}</p>
                  <p><strong>Empleado:</strong> {getSelectedEmployee()?.firstName} {getSelectedEmployee()?.lastName}</p>
                  <p><strong>Fecha:</strong> {getDateString(new Date(bookingData.date))}</p>
                  <p><strong>Hora:</strong> {formatTime(bookingData.startTime)}</p>
                  <p><strong>Precio:</strong> ${getSelectedService()?.price}</p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/client'}
                className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300"
              >
                Ir a Mi Dashboard
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 5 && (
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              {step === 4 && bookingData.startTime && (
                <button
                  onClick={handleBookingSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Reservando...' : 'Confirmar Cita'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
