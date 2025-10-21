import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { serviceService, employeeService, appointmentService } from '../services/api';
import { Service, Employee, BookingData, Salon } from '../types';
import { useToast } from '../hooks/use-toast';
import BackToHomeButton from '../components/BackToHomeButton';
import SalonSelector from '../components/SalonSelector';
import ServiceSelector from '../components/ServiceSelector';
import EmployeeSelector from '../components/EmployeeSelector';
import DateTimeSelector from '../components/DateTimeSelector';
import BookingConfirmation from '../components/BookingConfirmation';
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Building2,
  Scissors
} from 'lucide-react';

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 1, title: 'Salón', icon: Building2 },
    { id: 2, title: 'Servicio', icon: Scissors },
    { id: 3, title: 'Profesional', icon: User },
    { id: 4, title: 'Fecha y Hora', icon: Calendar },
    { id: 5, title: 'Confirmar', icon: CheckCircle }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadServices = async () => {
      if (!selectedSalon) return;
      
      try {
        setLoading(true);
        const servicesData = await serviceService.getServices(selectedSalon.id);
        setServices(servicesData);
      } catch (error) {
        console.error('Error loading services:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los servicios",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [selectedSalon, toast]);

  useEffect(() => {
    const loadEmployees = async () => {
      if (!selectedSalon || !selectedService) return;
      
      try {
        setLoading(true);
        const employeesData = await employeeService.getEmployees(selectedSalon.id);
        // Filter employees who provide the selected service
        const filteredEmployees = employeesData.filter(emp => 
          emp.services.includes(selectedService.id)
        );
        setEmployees(filteredEmployees);
      } catch (error) {
        console.error('Error loading employees:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los empleados",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, [selectedSalon, selectedService, toast]);

  const handleSalonSelect = (salon: Salon) => {
    setSelectedSalon(salon);
    localStorage.setItem('selectedSalon', JSON.stringify(salon));
    setCurrentStep(2);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(3);
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setCurrentStep(4);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep(5);
  };

  const handleConfirmBooking = async (bookingData: { notes: string; specialRequests: string }) => {
    if (!user || !selectedSalon || !selectedService || !selectedEmployee) {
      toast({
        title: "Error",
        description: "Faltan datos para completar la reserva",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const appointmentData: BookingData = {
        serviceId: selectedService.id,
        employeeId: selectedEmployee.id,
        date: selectedDate,
        startTime: selectedTime,
        notes: bookingData.notes,
        specialRequests: bookingData.specialRequests
      };

      await appointmentService.createAppointment({
        ...appointmentData,
        clientId: user.id,
        salonId: selectedSalon.id
      });

      toast({
        title: "¡Cita Confirmada!",
        description: "Tu cita ha sido agendada exitosamente. Recibirás un email de confirmación.",
      });

      navigate('/client');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la cita. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/client');
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedSalon !== null;
      case 2:
        return selectedService !== null;
      case 3:
        return selectedEmployee !== null;
      case 4:
        return selectedDate !== '' && selectedTime !== '';
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <SalonSelector onSalonSelect={handleSalonSelect} />;
      case 2:
        return (
          <ServiceSelector
            services={services}
            selectedService={selectedService}
            onServiceSelect={handleServiceSelect}
          />
        );
      case 3:
        return (
          <EmployeeSelector
            employees={employees}
            selectedEmployee={selectedEmployee}
            onEmployeeSelect={handleEmployeeSelect}
          />
        );
      case 4:
        return (
          <DateTimeSelector
            salonId={selectedSalon?.id || ''}
            serviceId={selectedService?.id || ''}
            employeeId={selectedEmployee?.id || ''}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateSelect={handleDateSelect}
            onTimeSelect={handleTimeSelect}
          />
        );
      case 5:
        return (
          <BookingConfirmation
            salon={selectedSalon!}
            service={selectedService!}
            employee={selectedEmployee!}
            date={selectedDate}
            time={selectedTime}
            onConfirm={handleConfirmBooking}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  if (loading && currentStep !== 5) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BackToHomeButton variant="minimal" />
              <h1 className="text-2xl font-bold text-gray-900 ml-4">Reservar Cita</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Paso {currentStep} de {steps.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                      isCurrent ? 'bg-pink-500 border-pink-500 text-white' : 
                      'bg-white border-gray-300 text-gray-500'}
                  `}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${isCurrent ? 'text-pink-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStepContent()}
      </main>

      {/* Navigation Footer */}
      {currentStep < 5 && (
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              
              {currentStep < 4 && (
                <Button 
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default BookingPage;