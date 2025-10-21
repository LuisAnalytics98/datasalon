import { supabase } from '../config/supabase';
import { supabaseAdmin } from '../config/supabase-admin';
import { Salon, SalonRequest } from '../types';
import { emailService } from './emailService';

export const ownerService = {
  // Create a new salon directly (without request)
  async createSalon(salonData: {
    name: string;
    address: string;
    phone: string;
    email: string;
    description?: string;
    adminName: string;
    adminEmail: string;
    adminPhone: string;
  }): Promise<{
    salonId: string;
    adminCredentials: {
      email: string;
      password: string;
    };
  }> {
    try {
      // Generate a secure password for admin
      const password = this.generateSecurePassword();
      
      // Create the admin user account
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: salonData.adminEmail,
        password: password,
        email_confirm: false, // Use Supabase default email confirmation
        user_metadata: {
          first_name: salonData.adminName.split(' ')[0],
          last_name: salonData.adminName.split(' ').slice(1).join(' ') || '',
          phone: salonData.adminPhone,
          role: 'admin'
        }
      });

      if (authError) throw authError;

      const adminUserId = authData.user.id;

      // Create the salon record
      const { data: salonDataResult, error: salonError } = await supabase
        .from('salons')
        .insert({
          name: salonData.name,
          address: salonData.address,
          phone: salonData.phone,
          email: salonData.email,
          description: salonData.description || 'Salón creado por el propietario',
          admin_id: adminUserId,
          is_active: true
        })
        .select()
        .single();

      if (salonError) throw salonError;

      // Send credentials email to admin
      await emailService.sendSalonCredentials(salonData.adminEmail, {
        salonName: salonData.name,
        adminName: salonData.adminName,
        email: salonData.adminEmail,
        loginUrl: `${window.location.origin}/login`
      });

      return {
        salonId: salonDataResult.id,
        adminCredentials: {
          email: salonData.adminEmail,
          password: password
        }
      };
    } catch (error) {
      console.error('Error creating salon:', error);
      throw error;
    }
  },

  // Approve a salon request and create admin account
  async approveSalonRequest(request: SalonRequest): Promise<{
    salonId: string;
    adminCredentials: {
      email: string;
      password: string;
    };
  }> {
    try {
      // Generate a secure password for admin
      const password = this.generateSecurePassword();
      
      // Create the admin user account
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: request.email,
        password: password,
        email_confirm: false, // Use Supabase default email confirmation
        user_metadata: {
          first_name: request.adminName.split(' ')[0],
          last_name: request.adminName.split(' ').slice(1).join(' ') || '',
          phone: request.phone,
          role: 'admin'
        }
      });

      if (authError) throw authError;

      const adminUserId = authData.user.id;

      // Create the salon record
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .insert({
          name: request.salonName,
          address: 'Dirección por definir',
          phone: request.phone,
          email: request.email,
          description: 'Salón recién registrado',
          admin_id: adminUserId,
          is_active: true
        })
        .select()
        .single();

      if (salonError) throw salonError;

      // Update the salon request status
      await supabase
        .from('salon_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      // Send credentials email to admin
      await emailService.sendSalonCredentials(request.email, {
        salonName: request.salonName,
        adminName: request.adminName,
        email: request.email,
        loginUrl: `${window.location.origin}/login`
      });

      return {
        salonId: salonData.id,
        adminCredentials: {
          email: request.email,
          password: password
        }
      };
    } catch (error) {
      console.error('Error approving salon request:', error);
      throw error;
    }
  },

  // Reject a salon request
  async rejectSalonRequest(requestId: string): Promise<void> {
    try {
      await supabase
        .from('salon_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
    } catch (error) {
      console.error('Error rejecting salon request:', error);
      throw error;
    }
  },

  // Get all salon requests
  async getSalonRequests(): Promise<SalonRequest[]> {
    try {
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
    } catch (error) {
      console.error('Error fetching salon requests:', error);
      throw error;
    }
  },

  // Get all salons
  async getSalons(): Promise<Salon[]> {
    try {
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(salon => ({
        id: salon.id,
        name: salon.name,
        address: salon.address,
        phone: salon.phone,
        email: salon.email,
        description: salon.description,
        logo_url: salon.logo_url,
        admin_id: salon.admin_id,
        is_active: salon.is_active,
        created_at: salon.created_at,
        updated_at: salon.updated_at
      }));
    } catch (error) {
      console.error('Error fetching salons:', error);
      throw error;
    }
  },

  // Generate secure password
  generateSecurePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
};
