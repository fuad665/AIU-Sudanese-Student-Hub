import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function createTestUser(email, password, name, studentId) {
  // Create user via Admin API to bypass rate limits
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true // Auto-confirm email
  });

  if (authError) throw authError;

  const authId = authData.user.id;

  // Insert into users table
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .insert({
      auth_id: authId,
      name,
      student_id: studentId,
      email,
      phone: '',
      major: 'Computer Science',
      photo_url: '',
      role: 'member',
      status: 'active',
      batch: new Date().getFullYear().toString(),
      joined_at: new Date().toISOString().split('T')[0],
    });

  if (dbError) throw dbError;

  return authData.user;
}

export async function deleteTestUser(authId) {
  await supabaseAdmin.auth.admin.deleteUser(authId);
  // cascading delete should remove the users table row
}
