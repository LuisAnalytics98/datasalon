-- Script para verificar y crear las tablas necesarias para DataSalon
-- Ejecutar en Supabase Dashboard > SQL Editor

-- 1. Verificar si existe la tabla salon_requests
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'salon_requests'
);

-- 2. Crear tabla salon_requests si no existe
CREATE TABLE IF NOT EXISTS salon_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_name TEXT NOT NULL,
  salon_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla salons si no existe
CREATE TABLE IF NOT EXISTS salons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear tabla employees si no existe
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  services TEXT[] DEFAULT '{}',
  working_hours JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear tabla services si no existe
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Crear tabla appointments si no existe
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Crear tabla reviews si no existe
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  hair_color_preference TEXT,
  service_preference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Crear tabla payments si no existe
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT CHECK (method IN ('stripe', 'cash', 'transfer')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Crear tabla notifications si no existe
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('appointment', 'reminder', 'confirmation', 'cancellation', 'payment')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Habilitar RLS (Row Level Security) en todas las tablas
ALTER TABLE salon_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 11. Crear políticas RLS para salon_requests (solo owner puede ver todas)
CREATE POLICY "Owner can view all salon requests" ON salon_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.email = 'datasalon98@gmail.com' OR auth.users.email = 'luis.madriga@hotmail.com')
    )
  );

CREATE POLICY "Owner can update salon requests" ON salon_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.email = 'datasalon98@gmail.com' OR auth.users.email = 'luis.madriga@hotmail.com')
    )
  );

-- 12. Crear políticas RLS para salons
CREATE POLICY "Owner can view all salons" ON salons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.email = 'datasalon98@gmail.com' OR auth.users.email = 'luis.madriga@hotmail.com')
    )
  );

CREATE POLICY "Admin can view own salon" ON salons
  FOR SELECT USING (admin_id = auth.uid());

-- 13. Crear políticas RLS para employees
CREATE POLICY "Admin can view salon employees" ON employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM salons 
      WHERE salons.id = employees.salon_id 
      AND salons.admin_id = auth.uid()
    )
  );

-- 14. Crear políticas RLS para services
CREATE POLICY "Admin can view salon services" ON services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM salons 
      WHERE salons.id = services.salon_id 
      AND salons.admin_id = auth.uid()
    )
  );

-- 15. Crear políticas RLS para appointments
CREATE POLICY "Admin can view salon appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM salons 
      WHERE salons.id = appointments.salon_id 
      AND salons.admin_id = auth.uid()
    )
  );

CREATE POLICY "Employee can view own appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = appointments.employee_id 
      AND employees.user_id = auth.uid()
    )
  );

CREATE POLICY "Client can view own appointments" ON appointments
  FOR SELECT USING (client_id = auth.uid());

-- 16. Crear políticas RLS para reviews
CREATE POLICY "Client can view own reviews" ON reviews
  FOR SELECT USING (client_id = auth.uid());

-- 17. Crear políticas RLS para payments
CREATE POLICY "Admin can view salon payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments 
      JOIN salons ON salons.id = appointments.salon_id
      WHERE appointments.id = payments.appointment_id 
      AND salons.admin_id = auth.uid()
    )
  );

-- 18. Crear políticas RLS para notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- 19. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_salon_requests_status ON salon_requests(status);
CREATE INDEX IF NOT EXISTS idx_salon_requests_created_at ON salon_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_salons_admin_id ON salons(admin_id);
CREATE INDEX IF NOT EXISTS idx_salons_is_active ON salons(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_salon_id ON employees(salon_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_services_salon_id ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_employee_id ON appointments(employee_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- 20. Verificar que todas las tablas se crearon correctamente
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'salon_requests', 'salons', 'employees', 'services', 
  'appointments', 'reviews', 'payments', 'notifications'
)
ORDER BY table_name;
