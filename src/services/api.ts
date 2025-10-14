import { supabase } from '../config/supabase';
import { 
  User, 
  Salon, 
  Service, 
  Employee, 
  Appointment, 
  Review, 
  Payment, 
  Notification,
  BookingData,
  DashboardStats 
} from '../types';

// User Services
export const userService = {
  async getProfile(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Salon Services
export const salonService = {
  async getSalons(): Promise<Salon[]> {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('isActive', true);
    
    if (error) throw error;
    return data;
  },

  async getSalon(salonId: string): Promise<Salon> {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('id', salonId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createSalon(salon: Omit<Salon, 'id' | 'createdAt' | 'updatedAt'>): Promise<Salon> {
    const { data, error } = await supabase
      .from('salons')
      .insert(salon)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateSalon(salonId: string, updates: Partial<Salon>): Promise<Salon> {
    const { data, error } = await supabase
      .from('salons')
      .update(updates)
      .eq('id', salonId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Service Services
export const serviceService = {
  async getServices(salonId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salonId', salonId)
      .eq('isActive', true);
    
    if (error) throw error;
    return data;
  },

  async createService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateService(serviceId: string, updates: Partial<Service>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteService(serviceId: string): Promise<void> {
    const { error } = await supabase
      .from('services')
      .update({ isActive: false })
      .eq('id', serviceId);
    
    if (error) throw error;
  },
};

// Employee Services
export const employeeService = {
  async getEmployees(salonId: string): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        users:userId(*)
      `)
      .eq('salonId', salonId)
      .eq('isActive', true);
    
    if (error) throw error;
    return data;
  },

  async createEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert(employee)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateEmployee(employeeId: string, updates: Partial<Employee>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', employeeId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getEmployeeSchedule(employeeId: string, date: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services:serviceId(*),
        clients:clientId(*)
      `)
      .eq('employeeId', employeeId)
      .eq('date', date)
      .in('status', ['pending', 'confirmed', 'in_progress']);
    
    if (error) throw error;
    return data;
  },
};

// Appointment Services
export const appointmentService = {
  async getAppointments(salonId: string, date?: string): Promise<Appointment[]> {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        services:serviceId(*),
        employees:employeeId(*),
        clients:clientId(*)
      `)
      .eq('salonId', salonId);

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query.order('startTime');
    
    if (error) throw error;
    return data;
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateAppointment(appointmentId: string, updates: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', appointmentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getClientAppointments(clientId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services:serviceId(*),
        employees:employeeId(*)
      `)
      .eq('clientId', clientId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getAvailableSlots(employeeId: string, serviceId: string, date: string): Promise<string[]> {
    // Get service duration
    const { data: service } = await supabase
      .from('services')
      .select('duration')
      .eq('id', serviceId)
      .single();

    if (!service) return [];

    // Get employee working hours
    const { data: employee } = await supabase
      .from('employees')
      .select('workingHours')
      .eq('id', employeeId)
      .single();

    if (!employee) return [];

    // Get existing appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select('startTime, endTime')
      .eq('employeeId', employeeId)
      .eq('date', date)
      .in('status', ['pending', 'confirmed', 'in_progress']);

    // Calculate available slots
    const dayOfWeek = new Date(date).getDay();
    const workingHours = employee.workingHours.find((wh: any) => wh.dayOfWeek === dayOfWeek);
    
    if (!workingHours || !workingHours.isWorking) return [];

    const slots: string[] = [];
    const start = new Date(`${date}T${workingHours.startTime}`);
    const end = new Date(`${date}T${workingHours.endTime}`);
    const duration = service.duration;

    for (let time = new Date(start); time < end; time.setMinutes(time.getMinutes() + 30)) {
      const slotEnd = new Date(time.getTime() + duration * 60000);
      if (slotEnd <= end) {
        const timeStr = time.toTimeString().slice(0, 5);
        const isAvailable = !appointments?.some(apt => {
          const aptStart = new Date(`${date}T${apt.startTime}`);
          const aptEnd = new Date(`${date}T${apt.endTime}`);
          return (time >= aptStart && time < aptEnd) || (slotEnd > aptStart && slotEnd <= aptEnd);
        });
        
        if (isAvailable) {
          slots.push(timeStr);
        }
      }
    }

    return slots;
  },
};

// Review Services
export const reviewService = {
  async createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getReviews(employeeId?: string, clientId?: string): Promise<Review[]> {
    let query = supabase
      .from('reviews')
      .select(`
        *,
        appointments:appointmentId(*),
        clients:clientId(*),
        employees:employeeId(*)
      `);

    if (employeeId) {
      query = query.eq('employeeId', employeeId);
    }

    if (clientId) {
      query = query.eq('clientId', clientId);
    }

    const { data, error } = await query.order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data;
  },
};

// Payment Services
export const paymentService = {
  async createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getPayments(appointmentId?: string): Promise<Payment[]> {
    let query = supabase
      .from('payments')
      .select(`
        *,
        appointments:appointmentId(*)
      `);

    if (appointmentId) {
      query = query.eq('appointmentId', appointmentId);
    }

    const { data, error } = await query.order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data;
  },
};

// Notification Services
export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ isRead: true })
      .eq('id', notificationId);
    
    if (error) throw error;
  },

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Dashboard Services
export const dashboardService = {
  async getStats(salonId: string, date: string): Promise<DashboardStats> {
    // Get today's appointments
    const { data: todayAppointments } = await supabase
      .from('appointments')
      .select('id')
      .eq('salonId', salonId)
      .eq('date', date);

    // Get total revenue for the month
    const startOfMonth = new Date(date);
    startOfMonth.setDate(1);
    const endOfMonth = new Date(date);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);

    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('createdAt', startOfMonth.toISOString())
      .lte('createdAt', endOfMonth.toISOString());

    // Get active employees
    const { data: employees } = await supabase
      .from('employees')
      .select('id')
      .eq('salonId', salonId)
      .eq('isActive', true);

    // Get popular services
    const { data: serviceStats } = await supabase
      .from('appointments')
      .select('serviceId, services:serviceId(name)')
      .eq('salonId', salonId)
      .gte('date', startOfMonth.toISOString())
      .lte('date', endOfMonth.toISOString());

    const serviceCounts = serviceStats?.reduce((acc: any, apt: any) => {
      const serviceId = apt.serviceId;
      if (acc[serviceId]) {
        acc[serviceId].count++;
      } else {
        acc[serviceId] = {
          serviceId,
          serviceName: apt.services?.name || 'Unknown',
          count: 1,
        };
      }
      return acc;
    }, {});

    const popularServices = Object.values(serviceCounts || {})
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);

    return {
      todayAppointments: todayAppointments?.length || 0,
      totalRevenue: payments?.reduce((sum, p) => sum + p.amount, 0) || 0,
      activeEmployees: employees?.length || 0,
      popularServices: popularServices as any[],
    };
  },
};
