import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Checkbox } from '../../components/ui/checkbox';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../context/AuthContext';
import { serviceService } from '../../services/api';
import { salonAccountService } from '../../services/salonAccountService';
import { 
  Building2, 
  Scissors, 
  Users, 
  Clock, 
  CheckCircle,
  Plus,
  Trash2,
  Save
} from 'lucide-react';

interface Service {
  id?: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

interface Employee {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  services: string[];
  workingHours: WorkingHours[];
}

interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

const InitialSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, salon } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Salon info state
  const [salonInfo, setSalonInfo] = useState({
    name: salon?.name || '',
    address: salon?.address || '',
    phone: salon?.phone || '',
    email: salon?.email || '',
    description: salon?.description || ''
  });

  // Services state
  const [services, setServices] = useState<Service[]>([
    { name: '', description: '', duration: 60, price: 0, category: 'Corte' }
  ]);

  // Employees state
  const [employees, setEmployees] = useState<Employee[]>([
    {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      services: [],
      workingHours: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 6, startTime: '09:00', endTime: '15:00', isWorking: true },
        { dayOfWeek: 0, startTime: '10:00', endTime: '14:00', isWorking: false }
      ]
    }
  ]);

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    { id: 1, title: 'Información del Salón', icon: Building2 },
    { id: 2, title: 'Servicios', icon: Scissors },
    { id: 3, title: 'Empleados', icon: Users },
    { id: 4, title: 'Horarios', icon: Clock }
  ];

  const handleSalonInfoChange = (field: string, value: string) => {
    setSalonInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (index: number, field: string, value: string | number) => {
    setServices(prev => prev.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    ));
  };

  const addService = () => {
    setServices(prev => [...prev, { name: '', description: '', duration: 60, price: 0, category: 'Corte' }]);
  };

  const removeService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  const handleEmployeeChange = (index: number, field: string, value: string | string[]) => {
    setEmployees(prev => prev.map((employee, i) => 
      i === index ? { ...employee, [field]: value } : employee
    ));
  };

  const addEmployee = () => {
    setEmployees(prev => [...prev, {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      services: [],
      workingHours: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 6, startTime: '09:00', endTime: '15:00', isWorking: true },
        { dayOfWeek: 0, startTime: '10:00', endTime: '14:00', isWorking: false }
      ]
    }]);
  };

  const removeEmployee = (index: number) => {
    setEmployees(prev => prev.filter((_, i) => i !== index));
  };

  const handleEmployeeServiceToggle = (employeeIndex: number, serviceIndex: number) => {
    setEmployees(prev => prev.map((employee, i) => {
      if (i === employeeIndex) {
        const serviceId = `service-${serviceIndex}`;
        const services = employee.services.includes(serviceId)
          ? employee.services.filter(s => s !== serviceId)
          : [...employee.services, serviceId];
        return { ...employee, services };
      }
      return employee;
    }));
  };

  const handleWorkingHoursChange = (employeeIndex: number, dayIndex: number, field: string, value: string | boolean) => {
    setEmployees(prev => prev.map((employee, i) => {
      if (i === employeeIndex) {
        const workingHours = employee.workingHours.map((wh, j) => 
          j === dayIndex ? { ...wh, [field]: value } : wh
        );
        return { ...employee, workingHours };
      }
      return employee;
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return salonInfo.name && salonInfo.address && salonInfo.phone;
      case 2:
        return services.every(s => s.name && s.description && s.duration > 0 && s.price > 0);
      case 3:
        return employees.every(e => e.firstName && e.lastName && e.email);
      case 4:
        return true; // Working hours are already set with defaults
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast({
        title: "Información incompleta",
        description: "Por favor, completa todos los campos requeridos",
        variant: "destructive",
      });
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleCompleteSetup = async () => {
    if (!salon?.id) {
      toast({
        title: "Error",
        description: "No se encontró información del salón",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update salon information
      // await salonService.updateSalon(salon.id, salonInfo);

      // Create services
      for (const service of services) {
        await serviceService.createService({
          salonId: salon.id,
          name: service.name,
          description: service.description,
          duration: service.duration,
          price: service.price,
          category: service.category,
          isActive: true
        });
      }

      // Create employees
      for (const employee of employees) {
        if (employee.firstName && employee.lastName && employee.email) {
          await salonAccountService.createEmployeeAccount({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.phone,
            salonId: salon.id,
            services: employee.services,
            workingHours: employee.workingHours
          });
        }
      }

      toast({
        title: "Configuración completada",
        description: "Tu salón ha sido configurado exitosamente",
      });

      navigate('/admin');
    } catch (error) {
      console.error('Error completing setup:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al completar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="salonName">Nombre del Salón *</Label>
                <Input
                  id="salonName"
                  value={salonInfo.name}
                  onChange={(e) => handleSalonInfoChange('name', e.target.value)}
                  placeholder="Nombre de tu salón"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salonPhone">Teléfono *</Label>
                <Input
                  id="salonPhone"
                  value={salonInfo.phone}
                  onChange={(e) => handleSalonInfoChange('phone', e.target.value)}
                  placeholder="+506 8888 8888"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salonAddress">Dirección *</Label>
              <Input
                id="salonAddress"
                value={salonInfo.address}
                onChange={(e) => handleSalonInfoChange('address', e.target.value)}
                placeholder="Dirección completa del salón"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salonEmail">Email</Label>
              <Input
                id="salonEmail"
                type="email"
                value={salonInfo.email}
                onChange={(e) => handleSalonInfoChange('email', e.target.value)}
                placeholder="info@tusalon.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salonDescription">Descripción</Label>
              <Textarea
                id="salonDescription"
                value={salonInfo.description}
                onChange={(e) => handleSalonInfoChange('description', e.target.value)}
                placeholder="Describe los servicios y características de tu salón"
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Servicios Ofrecidos</h3>
              <Button onClick={addService} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Servicio
              </Button>
            </div>
            {services.map((service, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Servicio {index + 1}</h4>
                    {services.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeService(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre del Servicio *</Label>
                      <Input
                        value={service.name}
                        onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                        placeholder="Ej: Corte de Cabello"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoría</Label>
                      <Input
                        value={service.category}
                        onChange={(e) => handleServiceChange(index, 'category', e.target.value)}
                        placeholder="Ej: Corte, Color, Uñas"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duración (minutos) *</Label>
                      <Input
                        type="number"
                        value={service.duration}
                        onChange={(e) => handleServiceChange(index, 'duration', parseInt(e.target.value))}
                        min="15"
                        step="15"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Precio (₡) *</Label>
                      <Input
                        type="number"
                        value={service.price}
                        onChange={(e) => handleServiceChange(index, 'price', parseFloat(e.target.value))}
                        min="0"
                        step="100"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label>Descripción *</Label>
                    <Textarea
                      value={service.description}
                      onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                      placeholder="Describe el servicio en detalle"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Empleados</h3>
              <Button onClick={addEmployee} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Empleado
              </Button>
            </div>
            {employees.map((employee, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Empleado {index + 1}</h4>
                    {employees.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeEmployee(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre *</Label>
                      <Input
                        value={employee.firstName}
                        onChange={(e) => handleEmployeeChange(index, 'firstName', e.target.value)}
                        placeholder="Nombre"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Apellido *</Label>
                      <Input
                        value={employee.lastName}
                        onChange={(e) => handleEmployeeChange(index, 'lastName', e.target.value)}
                        placeholder="Apellido"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={employee.email}
                        onChange={(e) => handleEmployeeChange(index, 'email', e.target.value)}
                        placeholder="empleado@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input
                        value={employee.phone}
                        onChange={(e) => handleEmployeeChange(index, 'phone', e.target.value)}
                        placeholder="+506 8888 8888"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Label className="text-sm font-medium">Servicios que puede realizar:</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {services.map((service, serviceIndex) => (
                        <div key={serviceIndex} className="flex items-center space-x-2">
                          <Checkbox
                            id={`employee-${index}-service-${serviceIndex}`}
                            checked={employee.services.includes(`service-${serviceIndex}`)}
                            onCheckedChange={() => handleEmployeeServiceToggle(index, serviceIndex)}
                          />
                          <Label htmlFor={`employee-${index}-service-${serviceIndex}`} className="text-sm">
                            {service.name || `Servicio ${serviceIndex + 1}`}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Horarios de Trabajo</h3>
            <p className="text-gray-600">Configura los horarios de trabajo para cada empleado</p>
            
            {employees.map((employee, employeeIndex) => (
              <Card key={employeeIndex}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {employee.firstName && employee.lastName 
                      ? `${employee.firstName} ${employee.lastName}`
                      : `Empleado ${employeeIndex + 1}`
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {employee.workingHours.map((wh, dayIndex) => (
                      <div key={dayIndex} className="flex items-center space-x-4">
                        <div className="w-24">
                          <Checkbox
                            id={`employee-${employeeIndex}-day-${dayIndex}`}
                            checked={wh.isWorking}
                            onCheckedChange={(checked) => 
                              handleWorkingHoursChange(employeeIndex, dayIndex, 'isWorking', checked as boolean)
                            }
                          />
                          <Label htmlFor={`employee-${employeeIndex}-day-${dayIndex}`} className="ml-2 text-sm">
                            {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][wh.dayOfWeek]}
                          </Label>
                        </div>
                        {wh.isWorking && (
                          <>
                            <div className="flex items-center space-x-2">
                              <Label className="text-sm">Desde:</Label>
                              <Input
                                type="time"
                                value={wh.startTime}
                                onChange={(e) => handleWorkingHoursChange(employeeIndex, dayIndex, 'startTime', e.target.value)}
                                className="w-32"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Label className="text-sm">Hasta:</Label>
                              <Input
                                type="time"
                                value={wh.endTime}
                                onChange={(e) => handleWorkingHoursChange(employeeIndex, dayIndex, 'endTime', e.target.value)}
                                className="w-32"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración Inicial</h1>
          <p className="text-gray-600">Configura tu salón para comenzar a recibir clientes</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                      isCurrent ? 'bg-blue-500 border-blue-500 text-white' : 
                      'bg-white border-gray-300 text-gray-500'}
                  `}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
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

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5 mr-2" })}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Proporciona la información básica de tu salón"}
              {currentStep === 2 && "Define los servicios que ofreces y sus precios"}
              {currentStep === 3 && "Registra a tus empleados y asigna servicios"}
              {currentStep === 4 && "Establece los horarios de trabajo"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>
          
          {currentStep < 4 ? (
            <Button onClick={handleNextStep}>
              Siguiente
            </Button>
          ) : (
            <Button 
              onClick={handleCompleteSetup}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Completando...' : 'Completar Configuración'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InitialSetupPage;
