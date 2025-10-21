# DataSalon Database Setup Instructions

## 1. Supabase Configuration

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### Step 2: Environment Variables
Create a `.env.local` file in the root directory with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Configuration (Mock for development)
VITE_EMAIL_SERVICE_URL=http://localhost:3001/api/email
VITE_EMAIL_API_KEY=your-email-api-key

# Stripe Configuration (Mock for development)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
VITE_STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# App Configuration
VITE_APP_NAME=DataSalon
VITE_APP_URL=http://localhost:8080
```

### Step 3: Database Schema
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-setup.sql`
4. Execute the script to create all necessary tables

### Step 4: Authentication Setup
1. In Supabase dashboard, go to Authentication > Settings
2. Enable email authentication
3. Configure email templates if needed

## 2. Current Database Schema

The following tables will be created:

- `salon_requests` - Salon access requests
- `salons` - Salon information
- `services` - Services offered by salons
- `employees` - Salon employees
- `employee_services` - Employee-service relationships
- `working_hours` - Employee working hours
- `clients` - Client information
- `appointments` - Appointment bookings
- `notifications` - In-app notifications
- `reviews` - Service reviews

## 3. Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Salon admins can manage their salon data
- Employees can view their assigned data
- Clients can manage their appointments
- Users can manage their notifications

## 4. Troubleshooting

### Common Issues:

1. **400/404 Errors**: Tables don't exist - run the database setup script
2. **Authentication Errors**: Check Supabase URL and keys
3. **Permission Errors**: Check RLS policies
4. **CORS Errors**: Configure allowed origins in Supabase

### Quick Fix Commands:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## 5. Development vs Production

### Development:
- Use mock email service
- Use Stripe test keys
- Enable all CORS origins

### Production:
- Configure real email service
- Use Stripe live keys
- Restrict CORS origins
- Enable SSL
