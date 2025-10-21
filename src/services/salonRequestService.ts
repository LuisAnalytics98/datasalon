import { supabase } from '../config/supabase';
import { SalonRequest, SalonRequestData } from '../types';
import { emailService } from './emailService';

export const salonRequestService = {
  async createSalonRequest(requestData: SalonRequestData): Promise<SalonRequest> {
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

    if (error) throw error;

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
