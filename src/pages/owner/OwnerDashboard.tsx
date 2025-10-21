import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../context/AuthContext';
import { SalonRequest, Salon } from '../../types';
import { ownerService } from '../../services/ownerService';
import { ownerServiceMock } from '../../services/ownerServiceMock';
import BackToHomeButton from '../../components/BackToHomeButton';
import CreateSalonModal from '../../components/CreateSalonModal';
import { 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  User,
  Calendar,
  Eye,
  UserPlus,
  LogOut,
  Bell,
  Settings,
  Plus,
  Users,
  TrendingUp
} from 'lucide-react';

const OwnerDashboard: React.FC = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<SalonRequest[]>([]);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SalonRequest | null>(null);
  const [showCreateSalonModal, setShowCreateSalonModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Use mock service in development mode
      const service = import.meta.env.DEV ? ownerServiceMock : ownerService;
      
      const [requestsData, salonsData] = await Promise.all([
        service.getSalonRequests(),
        service.getSalons()
      ]);
      setRequests(requestsData);
      setSalons(salonsData);
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

  const handleApproveRequest = async (requestId: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      const service = import.meta.env.DEV ? ownerServiceMock : ownerService;
      await service.approveSalonRequest(request);
      toast({
        title: "Solicitud aprobada",
        description: "Se ha creado la cuenta de administrador y se ha enviado el email de confirmación",
      });
      loadData();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "No se pudo aprobar la solicitud",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const service = import.meta.env.DEV ? ownerServiceMock : ownerService;
      await service.rejectSalonRequest(requestId);
      toast({
        title: "Solicitud rechazada",
        description: "La solicitud ha sido rechazada",
      });
      loadData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la solicitud",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-400/20 text-green-400 border-green-400/30"><CheckCircle className="w-3 h-3 mr-1" />Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-400/20 text-red-400 border-red-400/30"><XCircle className="w-3 h-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-400/20 text-gray-400 border-gray-400/30">{status}</Badge>;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Header */}
      <nav className="bg-gray-900 border-b border-yellow-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-yellow-400">DataSalon</h1>
              <span className="ml-4 px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm font-medium">
                Owner
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <BackToHomeButton variant="minimal" />
              <button className="p-2 text-gray-400 hover:text-yellow-400 transition-colors">
                <Bell className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-yellow-400 transition-colors">
                <Settings className="w-6 h-6" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Panel de Propietario</h1>
              <p className="text-gray-400">Gestiona salones, solicitudes y administra la plataforma</p>
              {user && (
                <p className="text-sm text-gray-500 mt-1">
                  Bienvenido, {user.firstName} {user.lastName}
                </p>
              )}
            </div>
            <Button
              onClick={() => setShowCreateSalonModal(true)}
              className="bg-yellow-400 text-black hover:bg-yellow-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Salón
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Solicitudes Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{pendingRequests.length}</div>
              <p className="text-xs text-gray-400">Esperando revisión</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Salones Activos</CardTitle>
              <Building2 className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{salons.length}</div>
              <p className="text-xs text-gray-400">En la plataforma</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Solicitudes Aprobadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{approvedRequests.length}</div>
              <p className="text-xs text-gray-400">Procesadas</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Solicitudes Rechazadas</CardTitle>
              <XCircle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{rejectedRequests.length}</div>
              <p className="text-xs text-gray-400">No aprobadas</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900 border-gray-700">
            <TabsTrigger value="requests" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-gray-300">
              Solicitudes ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="salons" className="data-[state=active]:bg-green-400 data-[state=active]:text-black text-gray-300">
              Salones ({salons.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-400 data-[state=active]:text-black text-gray-300">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {requests.length === 0 ? (
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No hay solicitudes</h3>
                  <p className="text-gray-400 text-center">Las solicitudes de salones aparecerán aquí</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((request) => (
                  <Card key={request.id} className="bg-gray-900 border-gray-700 hover:shadow-lg hover:shadow-yellow-400/10 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-white">{request.salonName}</CardTitle>
                          <CardDescription className="flex items-center mt-1 text-gray-400">
                            <User className="w-4 h-4 mr-1" />
                            {request.adminName}
                          </CardDescription>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-400">
                          <Mail className="w-4 h-4 mr-2" />
                          {request.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Phone className="w-4 h-4 mr-2" />
                          {request.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(request.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                            variant="outline"
                            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveRequest(request.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRejectRequest(request.id)}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      )}

                      {request.status !== 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                          variant="outline"
                          className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Detalles
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="salons" className="space-y-4">
            {salons.length === 0 ? (
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No hay salones</h3>
                  <p className="text-gray-400 text-center">Los salones creados aparecerán aquí</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {salons.map((salon) => (
                  <Card key={salon.id} className="bg-gray-900 border-gray-700 hover:shadow-lg hover:shadow-green-400/10 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-white">{salon.name}</CardTitle>
                          <CardDescription className="text-gray-400">
                            {salon.address}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className={salon.is_active ? "bg-green-400/20 text-green-400 border-green-400/30" : "bg-red-400/20 text-red-400 border-red-400/30"}>
                          {salon.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-400">
                          <Mail className="w-4 h-4 mr-2" />
                          {salon.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Phone className="w-4 h-4 mr-2" />
                          {salon.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          Creado: {new Date(salon.created_at).toLocaleDateString('es-ES')}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalles
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Analytics</h3>
                <p className="text-gray-400 text-center">Próximamente: Métricas y estadísticas de la plataforma</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Request Details Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-white">{selectedRequest.salonName}</CardTitle>
                    <CardDescription className="text-gray-400">Detalles de la solicitud</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRequest(null)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Cerrar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Administrador</label>
                    <p className="text-lg text-white">{selectedRequest.adminName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Email</label>
                    <p className="text-lg text-white">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Teléfono</label>
                    <p className="text-lg text-white">{selectedRequest.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Estado</label>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-400">Fecha de Solicitud</label>
                  <p className="text-lg text-white">{new Date(selectedRequest.createdAt).toLocaleString('es-ES')}</p>
                </div>

                {selectedRequest.status === 'pending' && (
                  <div className="flex gap-4 pt-4 border-t border-gray-700">
                    <Button
                      onClick={() => {
                        handleApproveRequest(selectedRequest.id);
                        setSelectedRequest(null);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprobar Solicitud
                    </Button>
                    <Button
                      onClick={() => {
                        handleRejectRequest(selectedRequest.id);
                        setSelectedRequest(null);
                      }}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rechazar Solicitud
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Salon Modal */}
        <CreateSalonModal
          isOpen={showCreateSalonModal}
          onClose={() => setShowCreateSalonModal(false)}
          onSuccess={loadData}
        />
      </div>
    </div>
  );
};

export default OwnerDashboard;