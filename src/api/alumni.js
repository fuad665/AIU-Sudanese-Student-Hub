// ─────────────────────────────────────────────
//  API Services: Alumni
//  src/api/alumni.js
// ─────────────────────────────────────────────
import { supabase } from '../lib/supabase';

const mapAlumni = (row) => ({
  id:             row.id,
  userId:         row.user_id,
  fullName:       row.full_name,
  studentId:      row.student_id_ref ?? '',
  email:          row.email ?? '',
  photo:          row.photo_url ?? '',
  major:          row.major ?? '',
  graduationYear: row.graduation_year,
  batch:          row.batch ?? '',
  currentJob:     row.current_job ?? '',
  company:        row.company ?? '',
  location:       row.location ?? '',
  industry:       row.industry ?? '',
  linkedinUrl:    row.linkedin_url ?? '',
  mentorStatus:   row.mentor_status ?? false,
  bio:            row.bio ?? '',
  skills:         row.skills ?? [],
});

export const fetchAlumni = async () => {
  const { data, error } = await supabase
    .from('alumni')
    .select('*')
    .order('graduation_year', { ascending: false });
  if (error) throw error;
  return data.map(mapAlumni);
};

export const submitMentorshipRequest = async ({ alumniId, requesterId, message }) => {
  const { error } = await supabase
    .from('mentorship_requests')
    .insert({ alumni_id: alumniId, requester_id: requesterId, message });
  if (error) throw error;
};
