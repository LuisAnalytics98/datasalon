-- DataSalon Database Schema for Supabase
-- This script creates the necessary tables for the DataSalon application

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create salons table
CREATE TABLE IF NOT EXISTS salons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  address VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  description TEXT,
  image VARCHAR,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Enable Row Level Security (RLS)
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Salons policies
CREATE POLICY "Anyone can view active salons" ON salons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage their salon" ON salons FOR ALL USING (auth.uid() = admin_id);

-- Services policies
CREATE POLICY "Anyone can view active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Salon admins can manage services" ON services FOR ALL USING (
  EXISTS (SELECT 1 FROM salons WHERE id = services.salon_id AND admin_id = auth.uid())
);

-- Employees policies
CREATE POLICY "Anyone can view active employees" ON employees FOR SELECT USING (is_active = true);
CREATE POLICY "Salon admins can manage employees" ON employees FOR ALL USING (
  EXISTS (SELECT 1 FROM salons WHERE id = employees.salon_id AND admin_id = auth.uid())
);
CREATE POLICY "Employees can view their own profile" ON employees FOR SELECT USING (auth.uid() = user_id);

-- Appointments policies
CREATE POLICY "Users can view their appointments" ON appointments FOR SELECT USING (
  client_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM employees WHERE id = appointments.employee_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM salons WHERE id = appointments.salon_id AND admin_id = auth.uid())
);
CREATE POLICY "Clients can create appointments" ON appointments FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Authorized users can update appointments" ON appointments FOR UPDATE USING (
  client_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM employees WHERE id = appointments.employee_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM salons WHERE id = appointments.salon_id AND admin_id = auth.uid())
);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews" ON reviews FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Clients can update their reviews" ON reviews FOR UPDATE USING (client_id = auth.uid());

-- Payments policies
CREATE POLICY "Users can view their payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM appointments WHERE id = payments.appointment_id AND client_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM appointments a JOIN employees e ON a.employee_id = e.id WHERE a.id = payments.appointment_id AND e.user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM appointments a JOIN salons s ON a.salon_id = s.id WHERE a.id = payments.appointment_id AND s.admin_id = auth.uid())
);
CREATE POLICY "Clients can create payments" ON payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM appointments WHERE id = payments.appointment_id AND client_id = auth.uid())
);

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON salons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
-- You can uncomment these lines to create sample data for testing

-- Sample Salon
-- INSERT INTO salons (name, address, phone, email, description, admin_id) VALUES 
-- ('Salón de Belleza Elegance', 'Calle Principal 123, Ciudad', '+1-555-0123', 'info@elegance.com', 'Salón de belleza premium con servicios de alta calidad', 'your-admin-user-id-here');

-- Sample Services
-- INSERT INTO services (salon_id, name, description, duration, price, category) VALUES 
-- ('salon-id-here', 'Corte de Cabello', 'Corte profesional de cabello', 60, 25.00, 'Corte'),
-- ('salon-id-here', 'Coloración', 'Coloración completa del cabello', 120, 80.00, 'Color'),
-- ('salon-id-here', 'Manicure', 'Manicure completa con esmaltado', 45, 20.00, 'Uñas');

COMMIT;
