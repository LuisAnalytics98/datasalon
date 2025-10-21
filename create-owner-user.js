// Script to create the owner user in Supabase
// Run this with: node create-owner-user.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zclfcywaithrkklimalw.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // Replace with your service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createOwnerUser() {
  try {
    console.log('Creating owner user...');
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'luis.madriga@hotmail.com',
      password: 'Comearroz.98',
      email_confirm: true, // Skip email confirmation for owner
      user_metadata: {
        first_name: 'Luis',
        last_name: 'Madrigal',
        phone: '+506 8888 8888',
        role: 'owner'
      }
    });

    if (error) {
      console.error('Error creating owner user:', error);
      return;
    }

    console.log('Owner user created successfully:', data.user);
    console.log('Email:', data.user.email);
    console.log('Role:', data.user.user_metadata.role);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createOwnerUser();
