import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zclfcywaithrkklimalw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjbGZjeXdhaXRocmtrbGltYWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3Njc1MDYsImV4cCI6MjA3NTM0MzUwNn0.Y5iy0yICIChUfnKRZJXEtR4KLhVr9GfVdOmya7exYL8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
