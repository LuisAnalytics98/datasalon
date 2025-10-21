import { supabase } from '../config/supabase';
import { SalonRequest, Salon } from '../types';
import { emailService } from './emailService';

// Mock service for development - simulates owner operations
export const ownerServiceMock = {
  // Create a new salon directly (mock implementation)
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
      console.log('Mock: Creating salon', salonData);
      
      // Simulate email notification
      await emailService.sendSalonCredentials(salonData.adminEmail, {
        salonName: salonData.name,
        adminName: salonData.adminName,
        email: salonData.adminEmail,
        loginUrl: `${window.location.origin}/login`
      });

      // Return mock data
      return {
        salonId: 'mock-salon-' + Date.now(),
        adminCredentials: {
          email: salonData.adminEmail,
          password: 'mock-password-' + Math.random().toString(36).substring(7)
        }
      };
    } catch (error) {
      console.error('Error in mock createSalon:', error);
      throw error;
    }
  },

  // Approve a salon request and create admin account (mock implementation)
  async approveSalonRequest(request: SalonRequest): Promise<{
    salonId: string;
    adminCredentials: {
      email: string;
      password: string;
    };
  }> {
    try {
      console.log('Mock: Approving salon request', request);
      
      // Simulate email notification
      await emailService.sendSalonCredentials(request.email, {
        salonName: request.salonName,
        adminName: request.adminName,
        email: request.email,
        loginUrl: `${window.location.origin}/login`
      });

      // Return mock data
      return {
        salonId: 'mock-salon-' + Date.now(),
        adminCredentials: {
          email: request.email,
          password: 'mock-password-' + Math.random().toString(36).substring(7)
        }
      };
    } catch (error) {
      console.error('Error in mock approveSalonRequest:', error);
      throw error;
    }
  },

  // Reject a salon request (mock implementation)
  async rejectSalonRequest(requestId: string): Promise<void> {
    try {
      console.log('Mock: Rejecting salon request', requestId);
      // Mock implementation - just log
    } catch (error) {
      console.error('Error in mock rejectSalonRequest:', error);
      throw error;
    }
  },

  // Get all salon requests (mock implementation)
  async getSalonRequests(): Promise<SalonRequest[]> {
    try {
      console.log('Mock: Fetching salon requests');
      
      // Return mock data
      return [
        {
          id: 'mock-request-1',
          adminName: 'Juan Pérez',
          salonName: 'Salón Bella Vista',
          email: 'juan@salonbella.com',
          phone: '+506 8888 0001',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'mock-request-2',
          adminName: 'María González',
          salonName: 'Hair Studio María',
          email: 'maria@hairstudio.com',
          phone: '+506 8888 0002',
          status: 'approved',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error in mock getSalonRequests:', error);
      throw error;
    }
  },

  // Get all salons (mock implementation)
  async getSalons(): Promise<Salon[]> {
    try {
      console.log('Mock: Fetching salons');
      
      // Return mock data
      return [
        {
          id: 'mock-salon-1',
          name: 'Salón Bella Vista',
          address: 'San José, Costa Rica',
          phone: '+506 8888 0001',
          email: 'juan@salonbella.com',
          description: 'Salón de belleza especializado en cortes modernos',
          logo_url: null,
          admin_id: 'mock-admin-1',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-salon-2',
          name: 'Hair Studio María',
          address: 'Cartago, Costa Rica',
          phone: '+506 8888 0002',
          email: 'maria@hairstudio.com',
          description: 'Estudio de cabello profesional',
          logo_url: null,
          admin_id: 'mock-admin-2',
          is_active: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error in mock getSalons:', error);
      throw error;
    }
  },

  // Generate secure password (mock implementation)
  generateSecurePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
};
