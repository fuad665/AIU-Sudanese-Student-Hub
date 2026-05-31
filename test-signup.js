import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testSignup() {
  console.log('Signing up...');
  const timestamp = Date.now();
  const testEmail = `test_${timestamp}@example.com`;
  
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: 'Password123!',
  });

  if (signUpError) {
    console.error('Sign up error:', signUpError);
    return;
  }
  
  console.log('Auth data:', authData);
  const authId = authData.user?.id;
  
  console.log('Inserting into users table with authId:', authId);
  const { data, error } = await supabase
    .from('users')
    .insert({
      auth_id: authId,
      name: 'Test User',
      student_id: timestamp.toString().slice(-7),
      email: testEmail,
      phone: '',
      major: 'Computer Science',
      photo_url: '',
      role: 'member',
      status: 'active',
      batch: '2026',
      joined_at: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Insert success:', data);
  }
}

testSignup();
