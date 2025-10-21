import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../context/AuthContext';
import { employeeService, serviceService } from '../../services/api';
import { salonAccountService } from '../../services/salonAccountService';
import { Employee, Service, WorkingHours } from '../../types';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Scissors,
  Mail,
  Phone,
  User,
  Save,
  X
} from 'lucide-react';

const EmployeeManagementPage: React.FC = () => {
  const { toast } = useToast();
  const { salon } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    services: [] as string[],
    workingHours: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isWorking: true },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isWorking: true },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isWorking: true },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isWorking: true },
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isWorking: true },
      { dayOfWeek: 6, startTime: '09:00', endTime: '15:00', isWorking: true },
      { dayOfWeek: 0, startTime: '10:00', endTime: '14:00', isWorking: false }
    ] as WorkingHours[]
  });

  useEffect(() => {
    loadData();
  }, [salon]);

  const loadData = async () => {
    if (!salon) return;
    
    try {
      setLoading(true);
      const [employeesData, servicesData] = await Promise.all([
        employeeService.getEmployees(salon.id),
        serviceService.getServices(salon.id)
      ]);
      setEmployees(employeesData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewEmployee(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setNewEmployee(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handleWorkingHoursChange = (dayIndex: number, field: string, value: string | boolean) => {
    setNewEmployee(prev => ({
      ...prev,
      workingHours: prev.workingHours.map((wh, index) => 
        index === dayIndex ? { ...wh, [field]: value } : wh
      )
    }));
  };

  const handleAddEmployee = async () => {
    if (!salon) return;

    try {
      await salonAccountService.createEmployeeAccount({
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        email: newEmployee.email,
        phone: newEmployee.phone,
        salonId: salon.id,
        services: newEmployee.services,
        workingHours: newEmployee.workingHours
      });

      toast({
        title: "Empleado agregado",
        description: "El empleado ha sido registrado y recibirá las credenciales por email",
      });

      setShowAddForm(false);
      setNewEmployee({
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
      });
      await loadData();
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el empleado",
        variant: "destructive",
      });
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setNewEmployee({
      firstName: employee.userId || '', // This would need to be mapped from user data
      lastName: '',
      email: '',
      phone: '',
      services: employee.services,
      workingHours: employee.workingHours
    });
    setShowAddForm(true);
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;

    try {
      await employeeService.updateEmployee(editingEmployee.id, {
        services: newEmployee.services,
        workingHours: newEmployee.workingHours
      });

      toast({
        title: "Empleado actualizado",
        description: "La información del empleado ha sido actualizada",
      });

      setEditingEmployee(null);
      setShowAddForm(false);
      await loadData();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el empleado",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este empleado?')) return;

    try {
      await employeeService.updateEmployee(employeeId, { isActive: false });
      toast({
        title: "Empleado eliminado",
        description: "El empleado ha sido desactivado",
      });
      await loadData();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el empleado",
        variant: "destructive",
      });
    }
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Servicio no encontrado';
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayOfWeek];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
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
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Empleados</h1>
              <p className="text-gray-600">Administra tu equipo de trabajo</p>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Empleado
            </Button>
          </div>
        </div>

        {/* Add/Edit Employee Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {editingEmployee ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
                  </CardTitle>
                  <CardDescription>
                    {editingEmployee ? 'Modifica la información del empleado' : 'Registra un nuevo empleado en tu salón'}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingEmployee(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!editingEmployee && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={newEmployee.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Nombre del empleado"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      value={newEmployee.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Apellido del empleado"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="empleado@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={newEmployee.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+506 8888 8888"
                    />
                  </div>
                </div>
              )}

              {/* Services Assignment */}
              <div>
                <Label className="text-sm font-medium">Servicios que puede realizar:</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={newEmployee.services.includes(service.id)}
                        onCheckedChange={() => handleServiceToggle(service.id)}
                      />
                      <Label htmlFor={`service-${service.id}`} className="text-sm">
                        {service.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <Label className="text-sm font-medium">Horarios de Trabajo:</Label>
                <div className="space-y-3 mt-2">
                  {newEmployee.workingHours.map((wh, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-24">
                        <Checkbox
                          id={`day-${index}`}
                          checked={wh.isWorking}
                          onCheckedChange={(checked) => 
                            handleWorkingHoursChange(index, 'isWorking', checked as boolean)
                          }
                        />
                        <Label htmlFor={`day-${index}`} className="ml-2 text-sm">
                          {getDayName(wh.dayOfWeek)}
                        </Label>
                      </div>
                      {wh.isWorking && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm">Desde:</Label>
                            <Input
                              type="time"
                              value={wh.startTime}
                              onChange={(e) => handleWorkingHoursChange(index, 'startTime', e.target.value)}
                              className="w-32"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm">Hasta:</Label>
                            <Input
                              type="time"
                              value={wh.endTime}
                              onChange={(e) => handleWorkingHoursChange(index, 'endTime', e.target.value)}
                              className="w-32"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingEmployee ? 'Actualizar' : 'Agregar'} Empleado
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingEmployee(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Employees List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {/* This would need to be mapped from user data */}
                      Empleado {employee.id.slice(0, 8)}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <User className="w-4 h-4 mr-1" />
                      ID: {employee.id.slice(0, 8)}...
                    </CardDescription>
                  </div>
                  <Badge variant={employee.isActive ? "default" : "secondary"}>
                    {employee.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Scissors className="w-4 h-4 mr-2" />
                    <span className="font-medium">Servicios:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {employee.services.map((serviceId) => (
                      <Badge key={serviceId} variant="outline" className="text-xs">
                        {getServiceName(serviceId)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="font-medium">Horarios:</span>
                  </div>
                  <div className="text-xs space-y-1">
                    {employee.workingHours
                      .filter(wh => wh.isWorking)
                      .map((wh, index) => (
                        <div key={index} className="text-gray-500">
                          {getDayName(wh.dayOfWeek)}: {wh.startTime} - {wh.endTime}
                        </div>
                      ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditEmployee(employee)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {employees.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay empleados registrados</h3>
              <p className="text-gray-500 text-center mb-4">
                Comienza agregando empleados a tu salón para gestionar servicios y horarios
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primer Empleado
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagementPage;
