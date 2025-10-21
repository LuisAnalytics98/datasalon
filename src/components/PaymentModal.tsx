import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { paymentService } from '../services/paymentService';
import { Appointment, PaymentData } from '../types';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onPaymentComplete: (payment: any) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onPaymentComplete
}) => {
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState<PaymentData>({
    appointmentId: '',
    amount: 0,
    method: 'cash',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [step, setStep] = useState<'method' | 'details' | 'processing' | 'success'>('method');

  useEffect(() => {
    if (isOpen && appointment) {
      setPaymentData({
        appointmentId: appointment.id,
        amount: appointment.price || 0,
        method: 'cash',
        notes: ''
      });
      setStep('method');
      loadPaymentMethods();
    }
  }, [isOpen, appointment]);

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handleMethodSelect = (method: string) => {
    setPaymentData(prev => ({ ...prev, method }));
    setStep('details');
  };

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setPaymentData(prev => ({ ...prev, amount }));
  };

  const handleProcessPayment = async () => {
    if (!appointment) return;

    try {
      setLoading(true);
      setStep('processing');

      const payment = await paymentService.createPayment(paymentData);

      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStep('success');
      
      toast({
        title: "Pago procesado",
        description: `Pago de ${paymentService.formatCurrency(payment.amount)} procesado exitosamente`,
      });

      onPaymentComplete(payment);

      // Auto-close after success
      setTimeout(() => {
        onClose();
        setStep('method');
      }, 3000);

    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error en el pago",
        description: error.message || "No se pudo procesar el pago",
        variant: "destructive",
      });
      setStep('details');
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="w-6 h-6" />;
      case 'transfer':
        return <Smartphone className="w-6 h-6" />;
      case 'stripe':
        return <CreditCard className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      case 'transfer':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      case 'stripe':
        return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Procesar Pago</CardTitle>
              <CardDescription>
                {appointment.services?.name} - {appointment.clients?.firstName} {appointment.clients?.lastName}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'method' && (
            <>
              <div className="space-y-4">
                <Label className="text-base font-medium">Selecciona método de pago</Label>
                <div className="grid gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handleMethodSelect(method.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${getMethodColor(method.id)}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{method.icon}</div>
                        <div>
                          <h3 className="font-medium">{method.name}</h3>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 'details' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setStep('method')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ←
                  </button>
                  <Label className="text-base font-medium">
                    Detalles del pago - {paymentService.getPaymentMethodInfo(paymentData.method).name}
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Monto (₡)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0"
                    className="text-lg"
                  />
                </div>

                {paymentData.method === 'transfer' && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Información de transferencia</span>
                    </div>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p><strong>Sinpe Móvil:</strong> 8888-8888</p>
                      <p><strong>Cuenta IBAN:</strong> CR12345678901234567890</p>
                      <p><strong>Banco:</strong> Banco Nacional</p>
                    </div>
                  </div>
                )}

                {paymentData.method === 'stripe' && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Pago con tarjeta</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      El pago se procesará de forma segura a través de Stripe.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Comentarios adicionales sobre el pago..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleProcessPayment}
                  className="flex-1"
                  disabled={paymentData.amount <= 0}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Procesar Pago
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-pink-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Procesando pago...</h3>
              <p className="text-gray-600">
                {paymentData.method === 'stripe' 
                  ? 'Procesando con Stripe...' 
                  : 'Registrando pago...'
                }
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">¡Pago exitoso!</h3>
              <p className="text-gray-600 mb-4">
                Pago de {paymentService.formatCurrency(paymentData.amount)} procesado correctamente
              </p>
              <Badge variant="secondary" className="text-sm">
                {paymentService.getPaymentMethodInfo(paymentData.method).name}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentModal;