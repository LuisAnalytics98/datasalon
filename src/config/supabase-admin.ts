import { createClient } from '@supabase/supabase-js';

// Admin configuration for server-side operations
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zclfcywaithrkklimalw.supabase.co';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjbGZjeXdhaXRocmtrbGltYWx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc2NzUwNiwiZXhwIjoyMDc1MzQzNTA2fQ.aNmPa2-erIvOV8ct0cXKANuYOMgMha6z67kMdTB_LTs';

// Create admin client with service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default supabaseAdmin;
