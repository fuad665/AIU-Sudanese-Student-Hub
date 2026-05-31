// ─────────────────────────────────────────────
//  API Services: Users
//  src/api/users.js
// ─────────────────────────────────────────────
import { supabase } from '../lib/supabase';

// Column mapping: DB column → JS key used in the app
const mapUser = (row) => ({
  id:             row.id,
  authId:         row.auth_id,
  name:           row.name,
  studentId:      row.student_id,
  email:          row.email,
  phone:          row.phone ?? '',
  photo:          row.photo_url ?? '',
  major:          row.major ?? '',
  batch:          row.batch ?? '',
  graduationYear: row.graduation_year ?? null,
  role:           row.role,
  status:         row.status,
  position:       row.position ?? null,
  joinedAt:       row.joined_at,
  createdAt:      row.created_at,
});

/** Fetch all users (directory) */
export const fetchAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name');
  if (error) throw error;
  return data.map(mapUser);
};

/** Fetch a single user profile by auth UUID */
export const fetchUserByAuthId = async (authId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .single();
  if (error) throw error;
  return mapUser(data);
};

/** Insert a new user profile row after Supabase Auth signup */
export const insertUserProfile = async (authId, formData) => {
  const { data, error } = await supabase
    .from('users')
    .insert({
      auth_id:    authId,
      name:       formData.name,
      student_id: formData.studentId,
      email:      formData.email,
      phone:      formData.phone ?? '',
      major:      formData.major,
      photo_url:  formData.photo ?? '',
      role:       'member',
      status:     'active',
      batch:      new Date().getFullYear().toString(),
      joined_at:  new Date().toISOString().split('T')[0],
    })
    .select()
    .single();
  if (error) throw error;
  return mapUser(data);
};

/** Update own profile (name, email, major, photo) */
export const updateUserProfile = async (userId, updates) => {
  const dbUpdates = {};
  if (updates.name      !== undefined) dbUpdates.name       = updates.name;
  if (updates.email     !== undefined) dbUpdates.email      = updates.email;
  if (updates.major     !== undefined) dbUpdates.major      = updates.major;
  if (updates.photo     !== undefined) dbUpdates.photo_url  = updates.photo;

  const { data, error } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return mapUser(data);
};

/** Admin: update any field on any user */
export const adminUpdateUser = async (userId, updates) => {
  const dbUpdates = {};
  if (updates.role     !== undefined) dbUpdates.role       = updates.role;
  if (updates.status   !== undefined) dbUpdates.status     = updates.status;
  if (updates.position !== undefined) dbUpdates.position   = updates.position;
  if (updates.name     !== undefined) dbUpdates.name       = updates.name;
  if (updates.major    !== undefined) dbUpdates.major      = updates.major;

  const { data, error } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return mapUser(data);
};

/** Admin: delete a user profile (cascade handled by DB) */
export const deleteUserProfile = async (userId) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
  if (error) throw error;
};

/** Upload an avatar image to Supabase Storage and return the public URL */
export const uploadAvatar = async (authId, file) => {
  const ext  = file.name.split('.').pop();
  const path = `${authId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
};
