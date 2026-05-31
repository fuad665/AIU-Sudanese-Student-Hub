// ─────────────────────────────────────────────
//  API Services: Announcements
//  src/api/announcements.js
// ─────────────────────────────────────────────
import { supabase } from '../lib/supabase';

const mapAnn = (row) => ({
  id:          row.id,
  title:       row.title,
  content:     row.content,
  category:    row.category,
  importance:  row.importance,
  author:      row.author_name,
  authorId:    row.author_id,
  date:        row.published_at,
  createdAt:   row.created_at,
});

export const fetchAnnouncements = async () => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return data.map(mapAnn);
};

export const createAnnouncement = async ({ title, content, category, importance, authorId, authorName }) => {
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      title,
      content,
      category:     category ?? 'General',
      importance:   importance ?? 'normal',
      author_id:    authorId,
      author_name:  authorName,
    })
    .select()
    .single();
  if (error) throw error;
  return mapAnn(data);
};

export const updateAnnouncement = async (id, updates) => {
  const { data, error } = await supabase
    .from('announcements')
    .update({
      title:       updates.title,
      content:     updates.content,
      category:    updates.category,
      importance:  updates.importance,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapAnn(data);
};

export const deleteAnnouncement = async (id) => {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);
  if (error) throw error;
};
