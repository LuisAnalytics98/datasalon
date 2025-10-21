# 🚀 DataSalon - Instrucciones Rápidas

## ⚡ Inicio Súper Rápido

### Para Windows:
1. **Doble clic** en `start-app.bat`
2. **Espera** a que se instalen las dependencias
3. **Abre** http://localhost:5173 en tu navegador

### Para Linux/Mac:
1. **Ejecuta** en terminal: `./start-app.sh`
2. **Espera** a que se instalen las dependencias  
3. **Abre** http://localhost:5173 en tu navegador

## 🔧 Configuración Básica

### 1. Variables de Entorno
Copia `env-template.txt` como `.env.local` y configura:

```env
# REQUERIDO - Obtén desde Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima

# REQUERIDO - Genera una clave segura
VITE_JWT_SECRET=tu_clave_secreta_muy_segura
```

### 2. Base de Datos Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ejecuta el SQL de `supabase-schema.sql`
3. Configura las políticas RLS
4. Copia la URL y clave anónima a tu `.env.local`

## 🎯 Funcionalidades Principales

### 👑 Owner (Propietario)
- **Dashboard**: Gestionar solicitudes de salones
- **Aprobar/Rechazar**: Solicitudes de nuevos salones
- **Crear cuentas**: Automáticamente con credenciales

### 👨‍💼 Admin (Administrador de Salón)
- **Configuración inicial**: Servicios y empleados
- **Dashboard**: Métricas y estadísticas
- **Gestión**: Servicios, empleados, horarios

### 👩‍💼 Employee (Empleado)
- **Dashboard personal**: Citas del día, ganancias
- **Gestión de citas**: Iniciar, completar, cobrar
- **Pagos**: Efectivo, transferencia, tarjeta

### 👤 Client (Cliente)
- **Selección de salón**: Búsqueda y filtros
- **Reserva de citas**: Proceso paso a paso
- **Dashboard personal**: Historial, reseñas
- **Calificaciones**: Estrellas y preferencias

## 📱 URLs Principales

- **Landing**: http://localhost:5173/
- **Selección de Salones**: http://localhost:5173/salons
- **Login**: http://localhost:5173/login
- **Registro**: http://localhost:5173/register
- **Solicitud de Salón**: http://localhost:5173/salon-request

## 🎨 Roles y Accesos

| Rol | Dashboard | Funcionalidades |
|-----|-----------|-----------------|
| **Owner** | `/owner` | Gestionar solicitudes, crear salones |
| **Admin** | `/admin` | Configurar salón, ver métricas |
| **Employee** | `/employee` | Gestionar citas, procesar pagos |
| **Client** | `/client` | Reservar citas, ver historial |

## 🔄 Flujo Completo

1. **Solicitud** → Owner recibe notificación
2. **Aprobación** → Se crea cuenta de salón
3. **Configuración** → Admin configura servicios/empleados
4. **Reserva** → Cliente selecciona salón y reserva
5. **Servicio** → Empleado gestiona la cita
6. **Pago** → Se procesa el pago
7. **Reseña** → Cliente califica la experiencia
8. **Métricas** → Admin ve estadísticas

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de build
npm run preview

# Linting
npm run lint
```

## 🆘 Solución de Problemas

### Error: "Node.js no está instalado"
- Descarga e instala Node.js desde [nodejs.org](https://nodejs.org/)

### Error: "No se puede conectar a Supabase"
- Verifica las variables de entorno en `.env.local`
- Asegúrate de que el proyecto de Supabase esté activo

### Error: "Dependencias no encontradas"
- Ejecuta `npm install` manualmente
- O usa los scripts `start-app.bat` / `start-app.sh`

### La aplicación no carga
- Verifica que el puerto 5173 esté libre
- Revisa la consola del navegador para errores
- Asegúrate de que todas las variables de entorno estén configuradas

## 📞 Soporte

Si tienes problemas:
1. Revisa este archivo
2. Consulta el README.md completo
3. Verifica la configuración de Supabase
4. Revisa la consola del navegador

---

**¡DataSalon está listo para usar! 🎉**
