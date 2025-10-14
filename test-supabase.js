import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
} else {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test connection
  supabase.from('salons').select('count').then(({ data, error }) => {
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connection successful:', data);
    }
  });
}
