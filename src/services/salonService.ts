import { supabase } from '../config/supabase';
import { mockSalonService } from './mockSalonService';

export const salonService = {
  async getSalons() {
    try {
      // In development mode, use mock data
      if (import.meta.env.DEV) {
        console.log('Development mode: Using mock salon data');
        return await mockSalonService.getSalons();
      }

      // In production, use real database
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching salons:', error);
        // Fallback to mock data if database fails
        return await mockSalonService.getSalons();
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSalons:', error);
      // Fallback to mock data
      return await mockSalonService.getSalons();
    }
  },

  async getSalonById(id: string) {
    try {
      // In development mode, use mock data
      if (import.meta.env.DEV) {
        return await mockSalonService.getSalonById(id);
      }

      // In production, use real database
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching salon:', error);
        // Fallback to mock data
        return await mockSalonService.getSalonById(id);
      }

      return data;
    } catch (error) {
      console.error('Error in getSalonById:', error);
      // Fallback to mock data
      return await mockSalonService.getSalonById(id);
    }
  },

  async getSalonServices(salonId: string) {
    try {
      // In development mode, use mock data
      if (import.meta.env.DEV) {
        return await mockSalonService.getSalonServices(salonId);
      }

      // In production, use real database
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching salon services:', error);
        // Fallback to mock data
        return await mockSalonService.getSalonServices(salonId);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSalonServices:', error);
      // Fallback to mock data
      return await mockSalonService.getSalonServices(salonId);
    }
  },

  async getSalonEmployees(salonId: string) {
    try {
      // In development mode, use mock data
      if (import.meta.env.DEV) {
        return await mockSalonService.getSalonEmployees(salonId);
      }

      // In production, use real database
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          employee_services (
            service_id
          )
        `)
        .eq('salon_id', salonId)
        .eq('is_active', true)
        .order('first_name');

      if (error) {
        console.error('Error fetching salon employees:', error);
        // Fallback to mock data
        return await mockSalonService.getSalonEmployees(salonId);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSalonEmployees:', error);
      // Fallback to mock data
      return await mockSalonService.getSalonEmployees(salonId);
    }
  },

  async updateSalon(salonId: string, updates: any) {
    try {
      // In development mode, just log the update
      if (import.meta.env.DEV) {
        console.log('Development mode: Mock salon update', { salonId, updates });
        return { id: salonId, ...updates };
      }

      // In production, use real database
      const { data, error } = await supabase
        .from('salons')
        .update(updates)
        .eq('id', salonId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating salon:', error);
      throw error;
    }
  }
};

export default salonService;
