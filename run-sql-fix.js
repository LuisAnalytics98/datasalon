const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://zclfcywaithrkklimalw.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // Replace with your actual service key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicies() {
  try {
    console.log('🔧 Fixing RLS policies for owner access...');
    
    // SQL to fix RLS policies
    const sql = `
      -- Enable RLS on salon_requests if it exists
      DO $$
      BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'salon_requests') THEN
              ALTER TABLE salon_requests ENABLE ROW LEVEL SECURITY;
          END IF;
      END $$;

      -- Drop existing policies that might conflict
      DROP POLICY IF EXISTS "Owner can view all salon requests" ON salon_requests;
      DROP POLICY IF EXISTS "Owner can manage salon requests" ON salon_requests;
      DROP POLICY IF EXISTS "Owner can view all salons" ON salons;
      DROP POLICY IF EXISTS "Owner can manage all salons" ON salons;

      -- Create policies for salon_requests table (if it exists)
      DO $$
      BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'salon_requests') THEN
              -- Owner can view all salon requests
              CREATE POLICY "Owner can view all salon requests" ON salon_requests
                  FOR SELECT USING (true);
              
              -- Owner can manage all salon requests
              CREATE POLICY "Owner can manage salon requests" ON salon_requests
                  FOR ALL USING (true);
          END IF;
      END $$;

      -- Create policies for salons table
      -- Owner can view all salons (including inactive ones)
      CREATE POLICY "Owner can view all salons" ON salons
          FOR SELECT USING (true);

      -- Owner can manage all salons
      CREATE POLICY "Owner can manage all salons" ON salons
          FOR ALL USING (true);

      -- Grant necessary permissions to authenticated users
      GRANT SELECT, INSERT, UPDATE, DELETE ON salon_requests TO authenticated;
      GRANT SELECT, INSERT, UPDATE, DELETE ON salons TO authenticated;
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error fixing RLS policies:', error);
      return false;
    }
    
    console.log('✅ RLS policies fixed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Run the fix
fixRLSPolicies().then(success => {
  if (success) {
    console.log('🎉 Database fixes applied successfully!');
    console.log('Now try refreshing your owner dashboard.');
  } else {
    console.log('❌ Failed to apply database fixes.');
    console.log('You may need to run the SQL manually in your Supabase dashboard.');
  }
});
