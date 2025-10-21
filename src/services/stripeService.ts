import { supabase } from '../config/supabase';

// Stripe Connect service for handling payments
export const stripeService = {
  // Create a Stripe Connect account for a salon
  async createConnectAccount(salonId: string, salonData: {
    businessName: string;
    businessType: string;
    email: string;
    phone: string;
    address: {
      line1: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  }): Promise<{ accountId: string; accountLink: string }> {
    try {
      // In a real implementation, this would call your backend API
      // which would then call Stripe's API to create a Connect account
      
      // Mock implementation for now
      const mockAccountId = `acct_${Date.now()}`;
      const mockAccountLink = `https://connect.stripe.com/express/oauth/authorize?client_id=${mockAccountId}`;
      
      // Store the account ID in the database
      const { error } = await supabase
        .from('salons')
        .update({ 
          stripe_account_id: mockAccountId,
          stripe_onboarding_completed: false
        })
        .eq('id', salonId);

      if (error) throw error;

      return {
        accountId: mockAccountId,
        accountLink: mockAccountLink
      };
    } catch (error) {
      console.error('Error creating Stripe Connect account:', error);
      throw error;
    }
  },

  // Get the Stripe Connect account status
  async getConnectAccountStatus(salonId: string): Promise<{
    accountId: string | null;
    isOnboarded: boolean;
    canReceivePayments: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
  }> {
    try {
      const { data: salon, error } = await supabase
        .from('salons')
        .select('stripe_account_id, stripe_onboarding_completed')
        .eq('id', salonId)
        .single();

      if (error) throw error;

      return {
        accountId: salon.stripe_account_id,
        isOnboarded: salon.stripe_onboarding_completed || false,
        canReceivePayments: salon.stripe_onboarding_completed || false,
        chargesEnabled: salon.stripe_onboarding_completed || false,
        payoutsEnabled: salon.stripe_onboarding_completed || false
      };
    } catch (error) {
      console.error('Error getting Connect account status:', error);
      throw error;
    }
  },

  // Create a payment intent for a booking
  async createPaymentIntent(bookingData: {
    salonId: string;
    amount: number;
    currency: string;
    clientId: string;
    appointmentId: string;
    description: string;
  }): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      // In a real implementation, this would call your backend API
      // which would then call Stripe's API to create a payment intent
      
      // Mock implementation for now
      const mockClientSecret = `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;
      const mockPaymentIntentId = `pi_${Date.now()}`;
      
      // Store the payment intent in the database
      const { error } = await supabase
        .from('payments')
        .insert({
          appointment_id: bookingData.appointmentId,
          client_id: bookingData.clientId,
          salon_id: bookingData.salonId,
          amount: bookingData.amount,
          currency: bookingData.currency,
          stripe_payment_intent_id: mockPaymentIntentId,
          status: 'pending',
          description: bookingData.description
        });

      if (error) throw error;

      return {
        clientSecret: mockClientSecret,
        paymentIntentId: mockPaymentIntentId
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Confirm a payment
  async confirmPayment(paymentIntentId: string): Promise<{
    status: string;
    transactionId: string;
  }> {
    try {
      // In a real implementation, this would call your backend API
      // which would then call Stripe's API to confirm the payment
      
      // Mock implementation for now
      const mockTransactionId = `txn_${Date.now()}`;
      
      // Update the payment status in the database
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: 'completed',
          transaction_id: mockTransactionId,
          completed_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntentId);

      if (error) throw error;

      return {
        status: 'succeeded',
        transactionId: mockTransactionId
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },

  // Get payment history for a salon
  async getPaymentHistory(salonId: string, limit: number = 50): Promise<Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    description: string;
    clientName: string;
    createdAt: string;
    completedAt: string | null;
  }>> {
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          *,
          clients:client_id(first_name, last_name)
        `)
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        description: payment.description,
        clientName: `${payment.clients?.first_name} ${payment.clients?.last_name}`,
        createdAt: payment.created_at,
        completedAt: payment.completed_at
      }));
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  },

  // Get payout information for a salon
  async getPayoutInfo(salonId: string): Promise<{
    totalEarnings: number;
    pendingPayouts: number;
    lastPayout: string | null;
    nextPayout: string | null;
  }> {
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('amount, status, completed_at')
        .eq('salon_id', salonId)
        .eq('status', 'completed');

      if (error) throw error;

      const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);
      
      return {
        totalEarnings,
        pendingPayouts: 0, // This would be calculated based on Stripe's payout schedule
        lastPayout: null, // This would come from Stripe's API
        nextPayout: null // This would come from Stripe's API
      };
    } catch (error) {
      console.error('Error getting payout info:', error);
      throw error;
    }
  },

  // Create a refund
  async createRefund(paymentId: string, amount?: number): Promise<{
    refundId: string;
    status: string;
  }> {
    try {
      // In a real implementation, this would call your backend API
      // which would then call Stripe's API to create a refund
      
      // Mock implementation for now
      const mockRefundId = `re_${Date.now()}`;
      
      // Update the payment status in the database
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: 'refunded',
          refund_id: mockRefundId,
          refunded_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;

      return {
        refundId: mockRefundId,
        status: 'succeeded'
      };
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }
};
