-- Sample Data for DataSalon Application
-- Run this after creating the schema and setting up your admin user

-- First, you need to get your admin user ID from auth.users table
-- You can find it by running: SELECT id, email FROM auth.users;

-- Replace 'YOUR_ADMIN_USER_ID' with the actual ID from auth.users

-- Sample Salon
INSERT INTO salons (name, address, phone, email, description, admin_id) VALUES 
('Salón de Belleza Elegance', 'Calle Principal 123, Ciudad', '+1-555-0123', 'info@elegance.com', 'Salón de belleza premium con servicios de alta calidad', 'YOUR_ADMIN_USER_ID')
ON CONFLICT DO NOTHING;

-- Get the salon ID for the services
-- You can find it by running: SELECT id FROM salons WHERE name = 'Salón de Belleza Elegance';

-- Sample Services (replace 'SALON_ID' with the actual salon ID)
INSERT INTO services (salon_id, name, description, duration, price, category) VALUES 
('SALON_ID', 'Corte de Cabello', 'Corte profesional de cabello con lavado y secado', 60, 25.00, 'Corte'),
('SALON_ID', 'Coloración Completa', 'Coloración completa del cabello con productos premium', 120, 80.00, 'Color'),
('SALON_ID', 'Mechas', 'Aplicación de mechas profesionales', 90, 60.00, 'Color'),
('SALON_ID', 'Manicure', 'Manicure completa con esmaltado', 45, 20.00, 'Uñas'),
('SALON_ID', 'Pedicure', 'Pedicure completa con esmaltado', 60, 30.00, 'Uñas'),
('SALON_ID', 'Tratamiento Facial', 'Tratamiento facial rejuvenecedor', 75, 50.00, 'Facial'),
('SALON_ID', 'Maquillaje', 'Maquillaje profesional para eventos', 90, 40.00, 'Maquillaje'),
('SALON_ID', 'Peinado', 'Peinado elegante para ocasiones especiales', 45, 35.00, 'Peinado')
ON CONFLICT DO NOTHING;

-- Sample Employee (replace 'EMPLOYEE_USER_ID' with actual user ID)
-- You need to create an employee user first in Supabase Auth, then use their ID here
INSERT INTO employees (user_id, salon_id, services, working_hours, is_active) VALUES 
('EMPLOYEE_USER_ID', 'SALON_ID', ARRAY['SERVICE_ID_1', 'SERVICE_ID_2'], 
 '[{"dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00", "isWorking": true},
   {"dayOfWeek": 2, "startTime": "09:00", "endTime": "17:00", "isWorking": true},
   {"dayOfWeek": 3, "startTime": "09:00", "endTime": "17:00", "isWorking": true},
   {"dayOfWeek": 4, "startTime": "09:00", "endTime": "17:00", "isWorking": true},
   {"dayOfWeek": 5, "startTime": "09:00", "endTime": "17:00", "isWorking": true},
   {"dayOfWeek": 6, "startTime": "10:00", "endTime": "16:00", "isWorking": true},
   {"dayOfWeek": 0, "startTime": "10:00", "endTime": "16:00", "isWorking": false}]', 
 true)
ON CONFLICT DO NOTHING;

-- Sample Notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES 
('YOUR_ADMIN_USER_ID', 'Bienvenido a DataSalon', 'Tu cuenta de administrador ha sido configurada correctamente', 'appointment', false),
('EMPLOYEE_USER_ID', 'Nueva cita asignada', 'Tienes una nueva cita programada para mañana', 'appointment', false)
ON CONFLICT DO NOTHING;

-- Instructions for setup:
-- 1. Run the schema.sql file first
-- 2. Create an admin user in Supabase Auth
-- 3. Get the admin user ID: SELECT id, email FROM auth.users;
-- 4. Replace 'YOUR_ADMIN_USER_ID' with the actual ID
-- 5. Run this sample data file
-- 6. Create employee users as needed
-- 7. Update the employee records with correct user IDs
