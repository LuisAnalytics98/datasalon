// Script para crear el usuario owner en Supabase
// Ejecutar con: node create-owner-user-supabase.js

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://zclfcywaithrkklimalw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjbGZjeXdhaXRocmtrbGltYWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3Njc1MDYsImV4cCI6MjA3NTM0MzUwNn0.Y5iy0yICIChUfnKRZJXEtR4KLhVr9GfVdOmya7exYL8'; // Reemplaza con tu service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createOwnerUser() {
  try {
    console.log('🔐 Creando usuario owner...');
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'luis.madriga@hotmail.com',
      password: 'Comearroz.98',
      email_confirm: true, // Saltar confirmación de email para owner
      user_metadata: {
        first_name: 'Luis',
        last_name: 'Madrigal',
        phone: '+506 8888 8888',
        role: 'owner'
      }
    });

    if (error) {
      console.error('❌ Error creando usuario owner:', error);
      return;
    }

    console.log('✅ Usuario owner creado exitosamente:');
    console.log('📧 Email:', data.user.email);
    console.log('🆔 ID:', data.user.id);
    console.log('👤 Rol:', data.user.user_metadata.role);
    console.log('📱 Teléfono:', data.user.user_metadata.phone);
    
    console.log('\n🎉 Usuario owner listo para usar!');
    console.log('🔑 Credenciales:');
    console.log('   Email: luis.madriga@hotmail.com');
    console.log('   Contraseña: Comearroz.98');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar la función
createOwnerUser();
