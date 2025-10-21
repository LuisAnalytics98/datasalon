import { supabase } from '../config/supabase';
import { Payment, PaymentData } from '../types';

// Mock Stripe integration - in production, this would use the actual Stripe SDK
const mockStripe = {
  async createPaymentIntent(amount: number, currency: string = 'crc') {
    // Mock implementation
    console.log(`Creating Stripe payment intent for ${amount} ${currency}`);
    return {
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_${Date.now()}_secret`,
      status: 'requires_payment_method'
    };
  },

  async confirmPayment(paymentIntentId: string) {
    // Mock implementation
    console.log(`Confirming Stripe payment: ${paymentIntentId}`);
    return {
      id: paymentIntentId,
      status: 'succeeded'
    };
  }
};

export const paymentService = {
  async createPayment(paymentData: PaymentData): Promise<Payment> {
    try {
      let paymentResult;
      
      if (paymentData.method === 'stripe') {
        // Handle Stripe payment
        paymentResult = await this.processStripePayment(paymentData);
      } else {
        // Handle cash or transfer payment
        paymentResult = await this.processDirectPayment(paymentData);
      }

      // Save payment to database
      const { data, error } = await supabase
        .from('payments')
        .insert({
          appointment_id: paymentData.appointmentId,
          amount: paymentData.amount,
          method: paymentData.method,
          status: paymentResult.status,
          transaction_id: paymentResult.transactionId,
          notes: paymentData.notes
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        appointmentId: data.appointment_id,
        amount: data.amount,
        method: data.method,
        status: data.status,
        transactionId: data.transaction_id,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  async processStripePayment(paymentData: PaymentData): Promise<{
    status: 'completed' | 'pending' | 'failed';
    transactionId: string;
  }> {
    try {
      // Create payment intent
      const paymentIntent = await mockStripe.createPaymentIntent(
        paymentData.amount,
        'crc'
      );

      // In a real implementation, you would:
      // 1. Create the payment intent on your backend
      // 2. Return the client_secret to the frontend
      // 3. Use Stripe Elements to collect payment method
      // 4. Confirm the payment on the backend

      // For now, we'll simulate a successful payment
      const confirmedPayment = await mockStripe.confirmPayment(paymentIntent.id);

      return {
        status: confirmedPayment.status === 'succeeded' ? 'completed' : 'failed',
        transactionId: confirmedPayment.id
      };
    } catch (error) {
      console.error('Stripe payment error:', error);
      return {
        status: 'failed',
        transactionId: ''
      };
    }
  },

  async processDirectPayment(paymentData: PaymentData): Promise<{
    status: 'completed' | 'pending' | 'failed';
    transactionId: string;
  }> {
    // For cash and transfer payments, we assume they are completed immediately
    // In a real implementation, you might want to mark them as pending
    // and require manual confirmation
    
    const transactionId = `${paymentData.method}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      status: 'completed',
      transactionId
    };
  },

  async getPayments(appointmentId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(payment => ({
        id: payment.id,
        appointmentId: payment.appointment_id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transaction_id,
        notes: payment.notes,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at
      }));
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  async updatePaymentStatus(paymentId: string, status: 'completed' | 'pending' | 'failed'): Promise<void> {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  async getPaymentMethods(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    enabled: boolean;
  }>> {
    // Return available payment methods
    return [
      {
        id: 'cash',
        name: 'Efectivo',
        description: 'Pago en efectivo al momento del servicio',
        icon: '💵',
        enabled: true
      },
      {
        id: 'transfer',
        name: 'Transferencia',
        description: 'Transferencia bancaria o Sinpe Móvil',
        icon: '📱',
        enabled: true
      },
      {
        id: 'stripe',
        name: 'Tarjeta',
        description: 'Pago con tarjeta de crédito o débito',
        icon: '💳',
        enabled: true
      }
    ];
  },

  async getPaymentStats(salonId: string, startDate?: string, endDate?: string): Promise<{
    totalRevenue: number;
    paymentMethodBreakdown: Array<{
      method: string;
      amount: number;
      count: number;
    }>;
    dailyRevenue: Array<{
      date: string;
      amount: number;
    }>;
  }> {
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          appointments!inner(
            salon_id
          )
        `)
        .eq('appointments.salon_id', salonId)
        .eq('status', 'completed');

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      const totalRevenue = data.reduce((sum, payment) => sum + payment.amount, 0);

      // Payment method breakdown
      const methodBreakdown = data.reduce((acc, payment) => {
        const existing = acc.find(item => item.method === payment.method);
        if (existing) {
          existing.amount += payment.amount;
          existing.count += 1;
        } else {
          acc.push({
            method: payment.method,
            amount: payment.amount,
            count: 1
          });
        }
        return acc;
      }, [] as Array<{ method: string; amount: number; count: number }>);

      // Daily revenue (last 30 days)
      const dailyRevenue = data.reduce((acc, payment) => {
        const date = new Date(payment.created_at).toISOString().split('T')[0];
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.amount += payment.amount;
        } else {
          acc.push({ date, amount: payment.amount });
        }
        return acc;
      }, [] as Array<{ date: string; amount: number }>);

      return {
        totalRevenue,
        paymentMethodBreakdown: methodBreakdown,
        dailyRevenue: dailyRevenue.sort((a, b) => a.date.localeCompare(b.date))
      };
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  },

  // Utility function to format currency
  formatCurrency(amount: number, currency: string = 'CRC'): string {
    if (currency === 'CRC') {
      return `₡${amount.toLocaleString('es-CR')}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  },

  // Utility function to get payment method display info
  getPaymentMethodInfo(method: string): {
    name: string;
    icon: string;
    color: string;
  } {
    const methods = {
      cash: { name: 'Efectivo', icon: '💵', color: 'text-green-600' },
      transfer: { name: 'Transferencia', icon: '📱', color: 'text-blue-600' },
      stripe: { name: 'Tarjeta', icon: '💳', color: 'text-purple-600' }
    };

    return methods[method as keyof typeof methods] || { 
      name: 'Desconocido', 
      icon: '❓', 
      color: 'text-gray-600' 
    };
  }
};
