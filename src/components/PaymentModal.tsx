import React, { useState } from 'react';
import { CreditCard, DollarSign, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Modal from './Modal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  appointmentId: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  appointmentId,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash' | 'transfer'>('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would:
      // 1. Create a payment intent with Stripe
      // 2. Process the payment
      // 3. Save the payment record to the database
      
      setSuccess(true);
      onPaymentSuccess('payment_' + Date.now());
      
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago');
      onPaymentError(err.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Procesar Pago"
      size="md"
    >
      {success ? (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">¡Pago Exitoso!</h3>
          <p className="text-gray-400">Tu pago ha sido procesado correctamente.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total a pagar:</span>
              <span className="text-2xl font-bold text-yellow-400">
                {formatAmount(amount)}
              </span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Método de Pago</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="stripe"
                  checked={paymentMethod === 'stripe'}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="text-yellow-400 focus:ring-yellow-400"
                />
                <CreditCard className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-white font-medium">Tarjeta de Crédito/Débito</div>
                  <div className="text-gray-400 text-sm">Pago seguro con Stripe</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="text-yellow-400 focus:ring-yellow-400"
                />
                <DollarSign className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-white font-medium">Efectivo</div>
                  <div className="text-gray-400 text-sm">Pago en el salón</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transfer"
                  checked={paymentMethod === 'transfer'}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="text-yellow-400 focus:ring-yellow-400"
                />
                <CreditCard className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-white font-medium">Transferencia Bancaria</div>
                  <div className="text-gray-400 text-sm">Pago por transferencia</div>
                </div>
              </label>
            </div>
          </div>

          {/* Stripe Payment Form (placeholder) */}
          {paymentMethod === 'stripe' && (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-white">Información de la Tarjeta</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Número de tarjeta"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Nombre en la tarjeta"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  <span>Pagar {formatAmount(amount)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PaymentModal;
