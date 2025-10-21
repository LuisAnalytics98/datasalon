// Configuration service for DataSalon
export const configService = {
  // Supabase configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://zclfcywaithrkklimalw.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjbGZjeXdhaXRocmtrbGltYWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3Njc1MDYsImV4cCI6MjA3NTM0MzUwNn0.Y5iy0yICIChUfnKRZJXEtR4KLhVr9GfVdOmya7exYL8'
  },

  // Email configuration
  email: {
    serviceUrl: import.meta.env.VITE_EMAIL_SERVICE_URL || 'http://localhost:3001/api/email',
    apiKey: import.meta.env.VITE_EMAIL_API_KEY || 'mock-api-key'
  },

  // Stripe configuration
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock',
    secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || 'sk_test_mock'
  },

  // App configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'DataSalon',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:8080'
  },

  // Check if we're in development mode
  isDevelopment: import.meta.env.DEV,

  // Check if we're in production mode
  isProduction: import.meta.env.PROD,

  // Get environment info
  getEnvironmentInfo() {
    return {
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
      supabaseUrl: this.supabase.url,
      appUrl: this.app.url
    };
  },

  // Validate configuration
  validateConfig() {
    const errors: string[] = [];

    if (!this.supabase.url) {
      errors.push('VITE_SUPABASE_URL is not set');
    }

    if (!this.supabase.anonKey) {
      errors.push('VITE_SUPABASE_ANON_KEY is not set');
    }

    if (errors.length > 0) {
      console.warn('Configuration errors:', errors);
      return false;
    }

    return true;
  }
};

export default configService;
