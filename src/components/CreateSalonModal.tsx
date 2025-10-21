import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import { ownerService } from '../services/ownerService';
import { ownerServiceMock } from '../services/ownerServiceMock';
import { X, Building2, User, Mail, Phone, MapPin, FileText } from 'lucide-react';

interface CreateSalonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateSalonModal: React.FC<CreateSalonModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Salon data
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    // Admin data
    adminName: '',
    adminEmail: '',
    adminPhone: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const service = import.meta.env.DEV ? ownerServiceMock : ownerService;
      await service.createSalon({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        description: formData.description,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone
      });

      toast({
        title: "Salón creado exitosamente",
        description: "Se ha creado el salón y se ha enviado el email de confirmación al administrador",
      });

      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        description: '',
        adminName: '',
        adminEmail: '',
        adminPhone: ''
      });
    } catch (error) {
      console.error('Error creating salon:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el salón",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-white flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-yellow-400" />
                Crear Nuevo Salón
              </CardTitle>
              <CardDescription className="text-gray-400">
                Crea un salón y asigna un administrador
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Salon Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-yellow-400" />
                Información del Salón
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-gray-300">
                    <Building2 className="w-4 h-4 text-yellow-400" />
                    Nombre del Salón *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nombre del salón"
                    required
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-gray-300">
                    <Phone className="w-4 h-4 text-yellow-400" />
                    Teléfono del Salón *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+506 8888 8888"
                    required
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-yellow-400" />
                  Dirección *
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Dirección completa del salón"
                  required
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-gray-300">
                  <Mail className="w-4 h-4 text-yellow-400" />
                  Email del Salón *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="salon@email.com"
                  required
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2 text-gray-300">
                  <FileText className="w-4 h-4 text-yellow-400" />
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descripción del salón (opcional)"
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
                  rows={3}
                />
              </div>
            </div>

            {/* Admin Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <User className="w-5 h-5 mr-2 text-yellow-400" />
                Información del Administrador
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName" className="flex items-center gap-2 text-gray-300">
                    <User className="w-4 h-4 text-yellow-400" />
                    Nombre del Administrador *
                  </Label>
                  <Input
                    id="adminName"
                    name="adminName"
                    type="text"
                    value={formData.adminName}
                    onChange={handleInputChange}
                    placeholder="Nombre completo del administrador"
                    required
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPhone" className="flex items-center gap-2 text-gray-300">
                    <Phone className="w-4 h-4 text-yellow-400" />
                    Teléfono del Administrador *
                  </Label>
                  <Input
                    id="adminPhone"
                    name="adminPhone"
                    type="tel"
                    value={formData.adminPhone}
                    onChange={handleInputChange}
                    placeholder="+506 8888 8888"
                    required
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail" className="flex items-center gap-2 text-gray-300">
                  <Mail className="w-4 h-4 text-yellow-400" />
                  Email del Administrador *
                </Label>
                <Input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={handleInputChange}
                  placeholder="admin@email.com"
                  required
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-400 mb-2">¿Qué sucede después?</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Se creará la cuenta de administrador</li>
                <li>• Se enviará un email de confirmación al administrador</li>
                <li>• El administrador podrá configurar el salón</li>
                <li>• El salón estará listo para recibir clientes</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 mr-2" />
                    Crear Salón
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSalonModal;
