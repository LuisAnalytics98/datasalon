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
      
      // Try to create admin user account
      console.log('Creating admin user for:', salonData.adminEmail);
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: salonData.adminEmail,
        password: password,
        email_confirm: true, // Use Supabase's built-in email confirmation
        user_metadata: {
          first_name: salonData.adminName.split(' ')[0],
          last_name: salonData.adminName.split(' ').slice(1).join(' ') || '',
          phone: salonData.adminPhone,
          role: 'admin'
        }
      });

      let adminUserId: string;

      if (authError) {
        // Check if error is because user already exists
        if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
          console.log('Admin user already exists, trying to find existing user...');
          
          // For existing users, we need to get their ID from Supabase
          // Since we can't easily query by email, we'll create the salon without admin_id
          console.log('Skipping admin user creation - user already exists');
          adminUserId = 'temp-admin-id'; // Temporary ID
        } else {
          console.error('Error creating admin user:', authError);
          throw authError;
        }
      } else {
        console.log('Admin user created successfully:', authData.user.id);
        adminUserId = authData.user.id;
        
        // Supabase automatically sends confirmation email when email_confirm: true
        console.log('📧 Supabase will automatically send confirmation email to:', salonData.adminEmail);
        console.log('📧 Admin should check their email for the confirmation link');
      }

      // Create the salon record
      console.log('Creating salon record for:', salonData.name);
      const salonInsertData: any = {
        name: salonData.name,
        address: salonData.address,
        phone: salonData.phone,
        email: salonData.email,
        description: salonData.description || 'Salón creado por el propietario',
        is_active: true
      };

      // Only add admin_id if we have a valid admin user ID
      if (adminUserId !== 'temp-admin-id') {
        salonInsertData.admin_id = adminUserId;
      }

      const { data: salonDataResult, error: salonError } = await supabaseAdmin
        .from('salons')
        .insert(salonInsertData)
        .select()
        .single();

      if (salonError) {
        console.error('Error creating salon:', salonError);
        throw salonError;
      }
      
      console.log('Salon created successfully:', salonDataResult.id);

      // Add admin to users table (only if we created a new user)
      if (adminUserId !== 'temp-admin-id') {
        console.log('Adding admin to users table:', adminUserId);
        
        // Try to insert with minimal required fields first
        const userInsertData: any = {
          id: adminUserId,
          email: salonData.adminEmail,
          role: 'admin'
        };

        console.log('Attempting to insert user with data:', userInsertData);

        // Add optional fields if they exist in the table
        try {
          const { error: userError } = await supabaseAdmin
            .from('users')
            .insert(userInsertData);

          if (userError) {
            console.error('Error adding admin to users table:', userError);
            console.log('Full error details:', JSON.stringify(userError, null, 2));
            console.log('Trying with additional fields...');
            
            // Try with more fields (removing fields that don't exist in the table)
            const extendedUserData = {
              ...userInsertData,
              first_name: salonData.adminName.split(' ')[0],
              last_name: salonData.adminName.split(' ').slice(1).join(' ') || '',
              phone: salonData.adminPhone,
              salon_id: salonDataResult.id
              // Removed: is_active, created_at, updated_at (these columns don't exist)
            };

            console.log('Trying with extended data:', extendedUserData);
            const { error: extendedError } = await supabaseAdmin
              .from('users')
              .insert(extendedUserData);

            if (extendedError) {
              console.error('Error with extended fields:', extendedError);
              console.log('Full extended error details:', JSON.stringify(extendedError, null, 2));
              console.log('Skipping users table insert - table structure may be different');
            } else {
              console.log('Admin added to users table successfully with extended fields');
            }
          } else {
            console.log('Admin added to users table successfully');
          }
        } catch (error) {
          console.error('Unexpected error adding to users table:', error);
          console.log('Skipping users table insert');
        }

        // Supabase automatically sends confirmation email - no need for custom email
        console.log('📧 Supabase handles email sending automatically');
      } else {
        console.log('Skipping user table insert and email send - admin user already exists');
      }

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
        email_confirm: true, // Use Supabase built-in email confirmation
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
      const { data: salonData, error: salonError } = await supabaseAdmin
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
      await supabaseAdmin
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
      await supabaseAdmin
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
      const { data, error } = await supabaseAdmin
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
      const { data, error } = await supabaseAdmin
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
