# DataSalon - Sistema de Gestión de Salones de Belleza

Una aplicación completa para la gestión de salones de belleza con funcionalidades avanzadas para administradores, empleados y clientes.

## 🚀 Características Principales

### 🎯 Roles de Usuario
- **Admin**: Gestión completa del salón, servicios, empleados, estadísticas
- **Employee**: Gestión de citas, confirmación de servicios, horarios
- **Client**: Reserva de citas, historial, reviews, pagos

### ✨ Funcionalidades
- **Landing Page**: Diseño elegante con hero section y características
- **Sistema de Autenticación**: Login, registro, recuperación de contraseña
- **Dashboards por Rol**: Interfaces personalizadas para cada tipo de usuario
- **Sistema de Reservas**: Calendario interactivo con disponibilidad
- **Sistema de Notificaciones**: Email + notificaciones in-app
- **Sistema de Pagos**: Integración con Stripe (opcional)
- **Sistema de Reviews**: Evaluaciones y comentarios de servicios
- **Gestión de Empleados**: CRUD completo con horarios
- **Gestión de Servicios**: CRUD completo con precios y duración
- **Analytics**: Gráficos de rendimiento e ingresos

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + ShadCN UI + Lucide React
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Pagos**: Stripe (opcional)
- **Routing**: React Router DOM
- **Estado**: Context API + React Hooks

## 📦 Instalación y Ejecución

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### 🚀 Inicio Rápido

#### Opción 1: Scripts Automáticos (Recomendado)

**Para Windows:**
```bash
# Doble clic en el archivo o ejecutar en terminal:
start-app.bat
```

**Para Linux/Mac:**
```bash
# Ejecutar en terminal:
./start-app.sh
```

Los scripts automáticamente:
- ✅ Verifican que Node.js esté instalado
- ✅ Instalan las dependencias si es necesario
- ✅ Inician el servidor de desarrollo
- ✅ Abren la aplicación en http://localhost:5173

#### Opción 2: Instalación Manual

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd datasalon
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno**
Crear un archivo `.env.local` en la raíz del proyecto:
```env
# Supabase
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key

# JWT
VITE_JWT_SECRET=tu_jwt_secret_seguro

# Email (Opcional)
VITE_EMAIL_HOST=smtp.gmail.com
VITE_EMAIL_PORT=587
VITE_EMAIL_USER=tu_email@gmail.com
VITE_EMAIL_PASS=tu_app_password

# Stripe (Opcional)
VITE_STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

4. **Configurar Supabase**
   - Crear un nuevo proyecto en [Supabase](https://supabase.com)
   - Ejecutar las migraciones SQL (ver sección de Base de Datos)
   - Configurar las políticas RLS

5. **Ejecutar la aplicación**
```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:5173`

### 📁 Archivos de Inicio

- `start-app.bat` - Script para Windows
- `start-app.sh` - Script para Linux/Mac
- `package.json` - Configuración de npm scripts

## 🗄️ Base de Datos

### Estructura de Tablas

```sql
-- Usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  role VARCHAR NOT NULL CHECK (role IN ('admin', 'employee', 'client')),
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  phone VARCHAR,
  avatar VARCHAR,
  salon_id UUID REFERENCES salons(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Salones
CREATE TABLE salons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  address VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  description TEXT,
  image VARCHAR,
  admin_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Servicios
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES salons(id),
  name VARCHAR NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- en minutos
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Empleados
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  salon_id UUID REFERENCES salons(id),
  services UUID[] DEFAULT '{}', -- IDs de servicios
  working_hours JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Citas
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES salons(id),
  client_id UUID REFERENCES users(id),
  employee_id UUID REFERENCES employees(id),
  service_id UUID REFERENCES services(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id),
  client_id UUID REFERENCES users(id),
  employee_id UUID REFERENCES employees(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  hair_color_preference VARCHAR,
  service_preference VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pagos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id),
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR NOT NULL CHECK (method IN ('stripe', 'cash', 'transfer')),
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notificaciones
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR NOT NULL CHECK (type IN ('appointment', 'reminder', 'confirmation', 'cancellation', 'payment')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Políticas RLS (Row Level Security)

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Políticas para salones
CREATE POLICY "Anyone can view active salons" ON salons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage their salon" ON salons FOR ALL USING (auth.uid() = admin_id);

-- Políticas para servicios
CREATE POLICY "Anyone can view active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Salon admins can manage services" ON services FOR ALL USING (
  EXISTS (SELECT 1 FROM salons WHERE id = services.salon_id AND admin_id = auth.uid())
);

-- Políticas para empleados
CREATE POLICY "Anyone can view active employees" ON employees FOR SELECT USING (is_active = true);
CREATE POLICY "Salon admins can manage employees" ON employees FOR ALL USING (
  EXISTS (SELECT 1 FROM salons WHERE id = employees.salon_id AND admin_id = auth.uid())
);

-- Políticas para citas
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

-- Políticas para reviews
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews" ON reviews FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Clients can update their reviews" ON reviews FOR UPDATE USING (client_id = auth.uid());

-- Políticas para pagos
CREATE POLICY "Users can view their payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM appointments WHERE id = payments.appointment_id AND client_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM appointments a JOIN employees e ON a.employee_id = e.id WHERE a.id = payments.appointment_id AND e.user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM appointments a JOIN salons s ON a.salon_id = s.id WHERE a.id = payments.appointment_id AND s.admin_id = auth.uid())
);
CREATE POLICY "Clients can create payments" ON payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM appointments WHERE id = payments.appointment_id AND client_id = auth.uid())
);

-- Políticas para notificaciones
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
```

## 🎨 Diseño

### Paleta de Colores
- **Fondo Principal**: Negro (#000000)
- **Fondo Secundario**: Gris Oscuro (#1F2937)
- **Acento Principal**: Dorado (#F59E0B)
- **Texto Principal**: Blanco (#FFFFFF)
- **Texto Secundario**: Gris Claro (#D1D5DB)

### Componentes Principales
- **Landing Page**: Hero section con imagen de fondo elegante
- **Dashboards**: Cards oscuras con bordes dorados sutiles
- **Formularios**: Inputs con fondo oscuro y borde dorado al focus
- **Botones**: Gradiente dorado con efectos hover
- **Navegación**: Sidebar con iconos dorados

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo
npm run build        # Construye para producción
npm run preview      # Vista previa de la build
npm run lint         # Ejecuta ESLint

# Build específico
npm run build:dev    # Build en modo desarrollo
```

## 📱 Responsive Design

La aplicación está diseñada con un enfoque mobile-first y es completamente responsive:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔐 Seguridad

- **Autenticación**: Supabase Auth con JWT
- **Autorización**: Row Level Security (RLS) en PostgreSQL
- **Protección de Rutas**: Componente ProtectedRoute
- **Validación**: Validación tanto en frontend como backend
- **HTTPS**: Recomendado para producción

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Netlify
1. Conectar repositorio a Netlify
2. Configurar variables de entorno
3. Configurar build command: `npm run build`
4. Configurar publish directory: `dist`

### Otros Proveedores
La aplicación puede desplegarse en cualquier proveedor que soporte aplicaciones React estáticas.

## 📊 Monitoreo y Analytics

- **Supabase Dashboard**: Para monitorear la base de datos
- **Vercel Analytics**: Para métricas de rendimiento (si usas Vercel)
- **Google Analytics**: Integración opcional

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:
1. Revisar la documentación
2. Buscar en los issues existentes
3. Crear un nuevo issue con detalles del problema

## 🔮 Roadmap

### Próximas Funcionalidades
- [ ] Integración completa con Stripe
- [ ] Sistema de notificaciones por email
- [ ] App móvil con React Native
- [ ] Integración con Google Calendar
- [ ] Sistema de inventario
- [ ] Reportes avanzados
- [ ] API pública
- [ ] Integración con redes sociales

---

**DataSalon** - Revoluciona tu salón de belleza 🚀