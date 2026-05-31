import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdmin() {
  console.log('Fetching users from auth.users...');
  const { data: authUsers, error: authErr } = await adminClient.auth.admin.listUsers();
  if (authErr) {
    console.error('Auth Error:', authErr);
    return;
  }
  
  console.log(`Found ${authUsers.users.length} users in Auth.`);
  
  console.log('Fetching users from public.users...');
  const { data: publicUsers, error: dbErr } = await adminClient.from('users').select('*');
  if (dbErr) {
    console.error('DB Error:', dbErr);
    return;
  }

  console.log(`Found ${publicUsers.length} users in public.users.`);

  console.log('--- Auth Users ---');
  authUsers.users.forEach(u => console.log(`- ${u.email} (ID: ${u.id})`));

  console.log('--- Public Profiles ---');
  publicUsers.forEach(u => console.log(`- ${u.email} | Role: ${u.role} | Status: ${u.status}`));
  
  // Auto-fix: if there is an auth user but no public user, or if we want to make someone admin
  // For now, let's just list them so we can tell the user.
}

checkAdmin();
