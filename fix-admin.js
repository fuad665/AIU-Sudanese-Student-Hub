import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdmin() {
  const email = 'fuadhiyabo@gmail.com';
  
  // Get auth user
  const { data: authUsers } = await adminClient.auth.admin.listUsers();
  const user = authUsers.users.find(u => u.email === email);
  
  if (!user) {
    console.log('User not found in Auth.');
    return;
  }
  
  // Force confirm email so they can log in
  if (!user.email_confirmed_at) {
    console.log('Confirming email...');
    await adminClient.auth.admin.updateUserById(user.id, { email_confirm: true });
  }

  // Insert into public.users
  console.log('Creating admin profile in public.users...');
  const { data, error } = await adminClient.from('users').insert({
    auth_id: user.id,
    name: 'Fuad Hiyabo',
    student_id: '3456788',
    email: email,
    role: 'admin',
    status: 'active',
    major: 'Computer Science'
  });

  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log('Successfully created Admin account!');
  }
}

fixAdmin();
