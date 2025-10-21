import { createClient } from '@supabase/supabase-js';

// Admin configuration for server-side operations
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zclfcywaithrkklimalw.supabase.co';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_ROLE_KEY';

// Create admin client with service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default supabaseAdmin;
