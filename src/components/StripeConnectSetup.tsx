import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { stripeService } from '../services/stripeService';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  DollarSign,
  TrendingUp,
  Clock
} from 'lucide-react';

interface StripeConnectSetupProps {
  salonId: string;
  salonData: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

const StripeConnectSetup: React.FC<StripeConnectSetupProps> = ({ salonId, salonData }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [payoutInfo, setPayoutInfo] = useState<any>(null);

  useEffect(() => {
    loadAccountStatus();
    loadPaymentHistory();
    loadPayoutInfo();
  }, [salonId]);

  const loadAccountStatus = async () => {
    try {
      const status = await stripeService.getConnectAccountStatus(salonId);
      setAccountStatus(status);
    } catch (error) {
      console.error('Error loading account status:', error);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      const history = await stripeService.getPaymentHistory(salonId, 10);
      setPaymentHistory(history);
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };

  const loadPayoutInfo = async () => {
    try {
      const info = await stripeService.getPayoutInfo(salonId);
      setPayoutInfo(info);
    } catch (error) {
      console.error('Error loading payout info:', error);
    }
  };

  const handleCreateAccount = async () => {
    try {
      setLoading(true);
      
      const addressParts = salonData.address.split(', ');
      const result = await stripeService.createConnectAccount(salonId, {
        businessName: salonData.name,
        businessType: 'individual', // or 'company' based on salon type
        email: salonData.email,
        phone: salonData.phone,
        address: {
          line1: addressParts[0] || salonData.address,
          city: addressParts[1] || 'San José',
          state: addressParts[2] || 'San José',
          postal_code: addressParts[3] || '10000',
          country: 'CR'
        }
      });

      toast({
        title: "Cuenta Stripe Creada",
        description: "Se ha creado tu cuenta de Stripe Connect. Completa la configuración.",
      });

      // Open the account link in a new tab
      window.open(result.accountLink, '_blank');
      
      // Reload account status
      await loadAccountStatus();
    } catch (error) {
      console.error('Error creating Stripe account:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la cuenta de Stripe. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: any) => {
    if (!status) return <Badge variant="secondary">No configurado</Badge>;
    
    if (status.isOnboarded) {
      return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Configuración de Pagos</h2>
        <p className="text-gray-600">Configura Stripe Connect para recibir pagos de tus clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Estado de la Cuenta
            </CardTitle>
            <CardDescription>Información sobre tu cuenta de Stripe Connect</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Estado:</span>
              {getStatusBadge(accountStatus)}
            </div>
            
            {accountStatus?.accountId && (
              <div className="text-sm text-gray-600">
                <p><strong>ID de Cuenta:</strong> {accountStatus.accountId}</p>
              </div>
            )}

            {accountStatus?.isOnboarded ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">Cuenta configurada correctamente</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Ya puedes recibir pagos de tus clientes.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 font-medium">Configuración pendiente</span>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  Completa la configuración para recibir pagos.
                </p>
              </div>
            )}

            {!accountStatus?.isOnboarded && (
              <Button 
                onClick={handleCreateAccount}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Configurando...' : 'Configurar Stripe Connect'}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Payout Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Información de Pagos
            </CardTitle>
            <CardDescription>Resumen de tus ganancias y pagos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {payoutInfo ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ₡{payoutInfo.totalEarnings.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-700">Ganancias Totales</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      ₡{payoutInfo.pendingPayouts.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700">Pendientes</div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Último pago:</span>
                    <span>{payoutInfo.lastPayout || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Próximo pago:</span>
                    <span>{payoutInfo.nextPayout || 'N/A'}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No hay información de pagos disponible</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Historial de Pagos Recientes
          </CardTitle>
          <CardDescription>Últimos pagos recibidos</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentHistory.length > 0 ? (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{payment.clientName}</div>
                    <div className="text-sm text-gray-600">{payment.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₡{payment.amount.toLocaleString()}</div>
                    <Badge 
                      variant={payment.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No hay pagos registrados aún</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeConnectSetup;
