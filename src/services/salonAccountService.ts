import { supabase } from '../config/supabase';
import { emailService } from './emailService';
import { SalonRequest } from '../types';

export const salonAccountService = {
  async createSalonAccount(request: SalonRequest): Promise<{
    salonId: string;
    adminCredentials: {
      email: string;
      password: string;
    };
  }> {
    try {
      // Generate a secure password
      const password = this.generateSecurePassword();
      
      // Create the admin user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: request.email,
        password: password,
        email_confirm: true,
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
          address: 'Dirección por definir', // Will be updated later by admin
          phone: request.phone,
          email: request.email,
          description: 'Salón recién registrado',
          admin_id: adminUserId,
          is_active: true
        })
        .select()
        .single();

      if (salonError) throw salonError;

      // Update the request status to approved
      await supabase
        .from('salon_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      // Send credentials email to admin
      await emailService.sendSalonCredentials(request.email, {
        salonName: request.salonName,
        adminName: request.adminName,
        email: request.email,
        password: password,
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
      console.error('Error creating salon account:', error);
      throw error;
    }
  },

  async createEmployeeAccount(employeeData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    salonId: string;
    services: string[];
    workingHours: any[];
  }): Promise<{
    employeeId: string;
    credentials: {
      email: string;
      password: string;
    };
  }> {
    try {
      // Generate a secure password
      const password = this.generateSecurePassword();
      
      // Create the employee user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: employeeData.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          first_name: employeeData.firstName,
          last_name: employeeData.lastName,
          phone: employeeData.phone || '',
          role: 'employee'
        }
      });

      if (authError) throw authError;

      const employeeUserId = authData.user.id;

      // Create the employee record
      const { data: employeeRecord, error: employeeError } = await supabase
        .from('employees')
        .insert({
          user_id: employeeUserId,
          salon_id: employeeData.salonId,
          services: employeeData.services,
          working_hours: employeeData.workingHours,
          is_active: true
        })
        .select()
        .single();

      if (employeeError) throw employeeError;

      // Get salon name for email
      const { data: salonData } = await supabase
        .from('salons')
        .select('name')
        .eq('id', employeeData.salonId)
        .single();

      // Send credentials email to employee
      await emailService.sendEmployeeCredentials(employeeData.email, {
        employeeName: `${employeeData.firstName} ${employeeData.lastName}`,
        salonName: salonData?.name || 'Salón',
        email: employeeData.email,
        password: password,
        loginUrl: `${window.location.origin}/login`
      });

      return {
        employeeId: employeeRecord.id,
        credentials: {
          email: employeeData.email,
          password: password
        }
      };

    } catch (error) {
      console.error('Error creating employee account:', error);
      throw error;
    }
  },

  generateSecurePassword(): string {
    // Generate a secure password with letters, numbers, and symbols
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  },

  async approveSalonRequest(requestId: string): Promise<void> {
    try {
      // Get the request details
      const { data: request, error: requestError } = await supabase
        .from('salon_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Create the salon account
      await this.createSalonAccount({
        id: request.id,
        adminName: request.admin_name,
        salonName: request.salon_name,
        email: request.email,
        phone: request.phone,
        status: request.status,
        createdAt: request.created_at,
        updatedAt: request.updated_at
      });

    } catch (error) {
      console.error('Error approving salon request:', error);
      throw error;
    }
  }
};
