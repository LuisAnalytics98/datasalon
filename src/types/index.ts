export interface User {
  id: string;
  email: string;
  role: 'admin' | 'employee' | 'client';
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Salon {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
  logo_url?: string;
  admin_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  salonId: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  userId: string;
  salonId: string;
  services: string[]; // service IDs
  workingHours: WorkingHours[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isWorking: boolean;
}

export interface Appointment {
  id: string;
  salonId: string;
  clientId: string;
  employeeId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  clientId: string;
  employeeId: string;
  rating: number; // 1-5
  comment?: string;
  hairColorPreference?: string;
  servicePreference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  method: 'stripe' | 'cash' | 'transfer';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'reminder' | 'confirmation' | 'cancellation' | 'payment';
  isRead: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  salon: Salon | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  salonId?: string;
}

export interface BookingData {
  serviceId: string;
  employeeId: string;
  date: string;
  startTime: string;
  notes?: string;
}

export interface DashboardStats {
  todayAppointments: number;
  totalRevenue: number;
  activeEmployees: number;
  popularServices: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
  }>;
}
