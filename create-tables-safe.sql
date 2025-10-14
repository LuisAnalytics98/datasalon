-- Create missing tables and policies for DataSalon application
-- This script only creates what doesn't exist yet

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  services UUID[] DEFAULT '{}', -- service IDs
  working_hours JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  hair_color_preference VARCHAR,
  service_preference VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR NOT NULL CHECK (method IN ('stripe', 'cash', 'transfer')),
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR NOT NULL CHECK (type IN ('appointment', 'reminder', 'confirmation', 'cancellation', 'payment')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - only if not already enabled
DO $$
BEGIN
    -- Enable RLS on salons if not already enabled
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'salons' AND relrowsecurity = true) THEN
        ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS on services if not already enabled
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'services' AND relrowsecurity = true) THEN
        ALTER TABLE services ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS on employees if not already enabled
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'employees' AND relrowsecurity = true) THEN
        ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS on appointments if not already enabled
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'appointments' AND relrowsecurity = true) THEN
        ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS on reviews if not already enabled
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reviews' AND relrowsecurity = true) THEN
        ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS on payments if not already enabled
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments' AND relrowsecurity = true) THEN
        ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS on notifications if not already enabled
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'notifications' AND relrowsecurity = true) THEN
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create policies only if they don't exist
DO $$
BEGIN
    -- Salons policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'salons' AND policyname = 'Anyone can view active salons') THEN
        CREATE POLICY "Anyone can view active salons" ON salons FOR SELECT USING (is_active = true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'salons' AND policyname = 'Admins can manage their salon') THEN
        CREATE POLICY "Admins can manage their salon" ON salons FOR ALL USING (auth.uid() = admin_id);
    END IF;

    -- Services policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Anyone can view active services') THEN
        CREATE POLICY "Anyone can view active services" ON services FOR SELECT USING (is_active = true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Salon admins can manage services') THEN
        CREATE POLICY "Salon admins can manage services" ON services FOR ALL USING (
          EXISTS (SELECT 1 FROM salons WHERE id = services.salon_id AND admin_id = auth.uid())
        );
    END IF;

    -- Employees policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employees' AND policyname = 'Anyone can view active employees') THEN
        CREATE POLICY "Anyone can view active employees" ON employees FOR SELECT USING (is_active = true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employees' AND policyname = 'Salon admins can manage employees') THEN
        CREATE POLICY "Salon admins can manage employees" ON employees FOR ALL USING (
          EXISTS (SELECT 1 FROM salons WHERE id = employees.salon_id AND admin_id = auth.uid())
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employees' AND policyname = 'Employees can view their own profile') THEN
        CREATE POLICY "Employees can view their own profile" ON employees FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Appointments policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Users can view their appointments') THEN
        CREATE POLICY "Users can view their appointments" ON appointments FOR SELECT USING (
          client_id = auth.uid() OR 
          EXISTS (SELECT 1 FROM employees WHERE id = appointments.employee_id AND user_id = auth.uid()) OR
          EXISTS (SELECT 1 FROM salons WHERE id = appointments.salon_id AND admin_id = auth.uid())
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Clients can create appointments') THEN
        CREATE POLICY "Clients can create appointments" ON appointments FOR INSERT WITH CHECK (client_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Authorized users can update appointments') THEN
        CREATE POLICY "Authorized users can update appointments" ON appointments FOR UPDATE USING (
          client_id = auth.uid() OR 
          EXISTS (SELECT 1 FROM employees WHERE id = appointments.employee_id AND user_id = auth.uid()) OR
          EXISTS (SELECT 1 FROM salons WHERE id = appointments.salon_id AND admin_id = auth.uid())
        );
    END IF;

    -- Reviews policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Anyone can view reviews') THEN
        CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Clients can create reviews') THEN
        CREATE POLICY "Clients can create reviews" ON reviews FOR INSERT WITH CHECK (client_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Clients can update their reviews') THEN
        CREATE POLICY "Clients can update their reviews" ON reviews FOR UPDATE USING (client_id = auth.uid());
    END IF;

    -- Payments policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can view their payments') THEN
        CREATE POLICY "Users can view their payments" ON payments FOR SELECT USING (
          EXISTS (SELECT 1 FROM appointments WHERE id = payments.appointment_id AND client_id = auth.uid()) OR
          EXISTS (SELECT 1 FROM appointments a JOIN employees e ON a.employee_id = e.id WHERE a.id = payments.appointment_id AND e.user_id = auth.uid()) OR
          EXISTS (SELECT 1 FROM appointments a JOIN salons s ON a.salon_id = s.id WHERE a.id = payments.appointment_id AND s.admin_id = auth.uid())
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Clients can create payments') THEN
        CREATE POLICY "Clients can create payments" ON payments FOR INSERT WITH CHECK (
          EXISTS (SELECT 1 FROM appointments WHERE id = payments.appointment_id AND client_id = auth.uid())
        );
    END IF;

    -- Notifications policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view their notifications') THEN
        CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update their notifications') THEN
        CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'System can create notifications') THEN
        CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_salons_admin_id ON salons(admin_id);
CREATE INDEX IF NOT EXISTS idx_services_salon_id ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_salon_id ON employees(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_employee_id ON appointments(employee_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_reviews_client_id ON reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_reviews_employee_id ON reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

COMMIT;
