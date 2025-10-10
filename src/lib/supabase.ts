import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zclfcywaithrkklimalw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjbGZjeXdhaXRocmtrbGltYWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3Njc1MDYsImV4cCI6MjA3NTM0MzUwNn0.Y5iy0yICIChUfnKRZJXEtR4KLhVr9GfVdOmya7exYL8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
