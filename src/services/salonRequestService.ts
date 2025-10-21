import { supabase } from '../config/supabase';
import { SalonRequest, SalonRequestData } from '../types';
import { emailService } from './emailService';

export const salonRequestService = {
  async createSalonRequest(requestData: SalonRequestData): Promise<SalonRequest> {
    try {
      // In development mode, simulate the request
      if (import.meta.env.DEV) {
        console.log('Development mode: Simulating salon request creation', requestData);
        
        // Simulate email notification
        await emailService.sendSalonRequestNotification(requestData);
        
        // Return mock data
        return {
          id: 'mock-id-' + Date.now(),
          adminName: requestData.adminName,
          salonName: requestData.salonName,
          email: requestData.email,
          phone: requestData.phone,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

      // In production, use real database
      const { data, error } = await supabase
        .from('salon_requests')
        .insert({
          admin_name: requestData.adminName,
          salon_name: requestData.salonName,
          email: requestData.email,
          phone: requestData.phone,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating salon request:', error);
        throw error;
      }

      // Send email notification to owner
      await emailService.sendSalonRequestNotification(requestData);

      return {
        id: data.id,
        adminName: data.admin_name,
        salonName: data.salon_name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error in createSalonRequest:', error);
      throw error;
    }
  },

  async getSalonRequests(): Promise<SalonRequest[]> {
    const { data, error } = await supabase
      .from('salon_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(request => ({
      id: request.id,
      adminName: request.admin_name,
      salonName: request.salon_name,
      email: request.email,
      phone: request.phone,
      status: request.status,
      createdAt: request.created_at,
      updatedAt: request.updated_at
    }));
  },

  async updateSalonRequestStatus(requestId: string, status: 'approved' | 'rejected'): Promise<void> {
    const { error } = await supabase
      .from('salon_requests')
      .update({ status })
      .eq('id', requestId);

    if (error) throw error;
  },

};
