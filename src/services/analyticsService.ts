import { supabase } from '../config/supabase';
import { Appointment, Payment, Review, Service, Employee } from '../types';

export interface AnalyticsData {
  overview: {
    totalAppointments: number;
    totalRevenue: number;
    averageRating: number;
    totalClients: number;
  };
  appointments: {
    daily: Array<{ date: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
    byService: Array<{ serviceName: string; count: number; revenue: number }>;
    byEmployee: Array<{ employeeName: string; count: number; revenue: number }>;
  };
  revenue: {
    daily: Array<{ date: string; amount: number }>;
    monthly: Array<{ month: string; amount: number }>;
    byPaymentMethod: Array<{ method: string; amount: number; count: number }>;
  };
  reviews: {
    averageRating: number;
    ratingDistribution: Array<{ rating: number; count: number }>;
    recentReviews: Review[];
    topPreferences: Array<{ preference: string; count: number }>;
  };
  performance: {
    popularServices: Array<{ serviceName: string; bookings: number; revenue: number }>;
    topEmployees: Array<{ employeeName: string; bookings: number; revenue: number; rating: number }>;
    clientRetention: number;
    averageAppointmentValue: number;
  };
}

export const analyticsService = {
  async getAnalytics(salonId: string, startDate?: string, endDate?: string): Promise<AnalyticsData> {
    try {
      const dateFilter = this.buildDateFilter(startDate, endDate);
      
      const [
        appointments,
        payments,
        reviews,
        services,
        employees
      ] = await Promise.all([
        this.getAppointmentsData(salonId, dateFilter),
        this.getPaymentsData(salonId, dateFilter),
        this.getReviewsData(salonId, dateFilter),
        this.getServicesData(salonId),
        this.getEmployeesData(salonId)
      ]);

      return {
        overview: this.calculateOverview(appointments, payments, reviews),
        appointments: this.calculateAppointmentAnalytics(appointments),
        revenue: this.calculateRevenueAnalytics(payments),
        reviews: this.calculateReviewAnalytics(reviews),
        performance: this.calculatePerformanceMetrics(appointments, payments, reviews, services, employees)
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  buildDateFilter(startDate?: string, endDate?: string) {
    const filter: any = {};
    if (startDate) filter.gte = startDate;
    if (endDate) filter.lte = endDate;
    return filter;
  },

  async getAppointmentsData(salonId: string, dateFilter: any) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        services:serviceId(*),
        employees:employeeId(*),
        clients:clientId(*)
      `)
      .eq('salon_id', salonId);

    if (Object.keys(dateFilter).length > 0) {
      query = query.gte('date', dateFilter.gte || '1900-01-01');
      if (dateFilter.lte) {
        query = query.lte('date', dateFilter.lte);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getPaymentsData(salonId: string, dateFilter: any) {
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

    if (Object.keys(dateFilter).length > 0) {
      query = query.gte('created_at', dateFilter.gte || '1900-01-01');
      if (dateFilter.lte) {
        query = query.lte('created_at', dateFilter.lte);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getReviewsData(salonId: string, dateFilter: any) {
    let query = supabase
      .from('reviews')
      .select(`
        *,
        appointments!inner(
          salon_id
        )
      `)
      .eq('appointments.salon_id', salonId);

    if (Object.keys(dateFilter).length > 0) {
      query = query.gte('created_at', dateFilter.gte || '1900-01-01');
      if (dateFilter.lte) {
        query = query.lte('created_at', dateFilter.lte);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getServicesData(salonId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId);

    if (error) throw error;
    return data || [];
  },

  async getEmployeesData(salonId: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('salon_id', salonId);

    if (error) throw error;
    return data || [];
  },

  calculateOverview(appointments: any[], payments: any[], reviews: any[]) {
    const totalAppointments = appointments.length;
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;
    const uniqueClients = new Set(appointments.map(apt => apt.client_id)).size;

    return {
      totalAppointments,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10,
      totalClients: uniqueClients
    };
  },

  calculateAppointmentAnalytics(appointments: any[]) {
    // Daily appointments
    const dailyMap = new Map<string, number>();
    appointments.forEach(apt => {
      const date = apt.date;
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });
    const daily = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // By status
    const statusMap = new Map<string, number>();
    appointments.forEach(apt => {
      statusMap.set(apt.status, (statusMap.get(apt.status) || 0) + 1);
    });
    const byStatus = Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }));

    // By service
    const serviceMap = new Map<string, { count: number; revenue: number }>();
    appointments.forEach(apt => {
      const serviceName = apt.services?.name || 'Unknown';
      const current = serviceMap.get(serviceName) || { count: 0, revenue: 0 };
      serviceMap.set(serviceName, {
        count: current.count + 1,
        revenue: current.revenue + (apt.price || 0)
      });
    });
    const byService = Array.from(serviceMap.entries())
      .map(([serviceName, data]) => ({ serviceName, ...data }));

    // By employee
    const employeeMap = new Map<string, { count: number; revenue: number }>();
    appointments.forEach(apt => {
      const employeeName = `${apt.employees?.firstName || ''} ${apt.employees?.lastName || ''}`.trim();
      const current = employeeMap.get(employeeName) || { count: 0, revenue: 0 };
      employeeMap.set(employeeName, {
        count: current.count + 1,
        revenue: current.revenue + (apt.price || 0)
      });
    });
    const byEmployee = Array.from(employeeMap.entries())
      .map(([employeeName, data]) => ({ employeeName, ...data }));

    return { daily, byStatus, byService, byEmployee };
  },

  calculateRevenueAnalytics(payments: any[]) {
    // Daily revenue
    const dailyMap = new Map<string, number>();
    payments.forEach(payment => {
      const date = payment.created_at.split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + payment.amount);
    });
    const daily = Array.from(dailyMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Monthly revenue
    const monthlyMap = new Map<string, number>();
    payments.forEach(payment => {
      const month = payment.created_at.substring(0, 7); // YYYY-MM
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + payment.amount);
    });
    const monthly = Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // By payment method
    const methodMap = new Map<string, { amount: number; count: number }>();
    payments.forEach(payment => {
      const current = methodMap.get(payment.method) || { amount: 0, count: 0 };
      methodMap.set(payment.method, {
        amount: current.amount + payment.amount,
        count: current.count + 1
      });
    });
    const byPaymentMethod = Array.from(methodMap.entries())
      .map(([method, data]) => ({ method, ...data }));

    return { daily, monthly, byPaymentMethod };
  },

  calculateReviewAnalytics(reviews: any[]) {
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    // Rating distribution
    const ratingMap = new Map<number, number>();
    reviews.forEach(review => {
      ratingMap.set(review.rating, (ratingMap.get(review.rating) || 0) + 1);
    });
    const ratingDistribution = Array.from(ratingMap.entries())
      .map(([rating, count]) => ({ rating, count }))
      .sort((a, b) => a.rating - b.rating);

    // Recent reviews (last 10)
    const recentReviews = reviews
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    // Top preferences
    const preferenceMap = new Map<string, number>();
    reviews.forEach(review => {
      if (review.preferences) {
        review.preferences.forEach((pref: string) => {
          preferenceMap.set(pref, (preferenceMap.get(pref) || 0) + 1);
        });
      }
    });
    const topPreferences = Array.from(preferenceMap.entries())
      .map(([preference, count]) => ({ preference, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      recentReviews,
      topPreferences
    };
  },

  calculatePerformanceMetrics(appointments: any[], payments: any[], reviews: any[], services: any[], employees: any[]) {
    // Popular services
    const serviceMap = new Map<string, { bookings: number; revenue: number }>();
    appointments.forEach(apt => {
      const serviceName = apt.services?.name || 'Unknown';
      const current = serviceMap.get(serviceName) || { bookings: 0, revenue: 0 };
      serviceMap.set(serviceName, {
        bookings: current.bookings + 1,
        revenue: current.revenue + (apt.price || 0)
      });
    });
    const popularServices = Array.from(serviceMap.entries())
      .map(([serviceName, data]) => ({ serviceName, ...data }))
      .sort((a, b) => b.bookings - a.bookings);

    // Top employees
    const employeeMap = new Map<string, { bookings: number; revenue: number; ratings: number[] }>();
    appointments.forEach(apt => {
      const employeeName = `${apt.employees?.firstName || ''} ${apt.employees?.lastName || ''}`.trim();
      const current = employeeMap.get(employeeName) || { bookings: 0, revenue: 0, ratings: [] };
      employeeMap.set(employeeName, {
        bookings: current.bookings + 1,
        revenue: current.revenue + (apt.price || 0),
        ratings: current.ratings
      });
    });

    // Add ratings to employees
    reviews.forEach(review => {
      const appointment = appointments.find(apt => apt.id === review.appointment_id);
      if (appointment) {
        const employeeName = `${appointment.employees?.firstName || ''} ${appointment.employees?.lastName || ''}`.trim();
        const current = employeeMap.get(employeeName);
        if (current) {
          current.ratings.push(review.rating);
        }
      }
    });

    const topEmployees = Array.from(employeeMap.entries())
      .map(([employeeName, data]) => ({
        employeeName,
        bookings: data.bookings,
        revenue: data.revenue,
        rating: data.ratings.length > 0 
          ? Math.round((data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length) * 10) / 10
          : 0
      }))
      .sort((a, b) => b.bookings - a.bookings);

    // Client retention (simplified calculation)
    const uniqueClients = new Set(appointments.map(apt => apt.client_id));
    const repeatClients = Array.from(uniqueClients).filter(clientId => {
      const clientAppointments = appointments.filter(apt => apt.client_id === clientId);
      return clientAppointments.length > 1;
    });
    const clientRetention = uniqueClients.size > 0 
      ? (repeatClients.length / uniqueClients.size) * 100 
      : 0;

    // Average appointment value
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const averageAppointmentValue = appointments.length > 0 
      ? totalRevenue / appointments.length 
      : 0;

    return {
      popularServices,
      topEmployees,
      clientRetention: Math.round(clientRetention * 10) / 10,
      averageAppointmentValue: Math.round(averageAppointmentValue * 100) / 100
    };
  }
};
