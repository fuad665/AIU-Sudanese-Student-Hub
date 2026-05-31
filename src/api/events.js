// ─────────────────────────────────────────────
//  API Services: Events
//  src/api/events.js
// ─────────────────────────────────────────────
import { supabase } from '../lib/supabase';

const mapEvent = (row) => ({
  id:          row.id,
  title:       row.title,
  description: row.description ?? '',
  category:    row.category,
  location:    row.location ?? '',
  date:        row.event_date,
  time:        row.event_time ?? '',
  image:       row.image_url ?? '',
  capacity:    row.capacity ?? 100,
  createdBy:   row.created_by,
  createdAt:   row.created_at,
  // rsvp count and whether the current user RSVPed are joined separately
  rsvpCount:   row.rsvp_count ?? 0,
  userHasRsvp: row.user_has_rsvp ?? false,
});

/** Fetch all events with RSVP count (admin/gov) or user-specific RSVP flag */
export const fetchEvents = async (currentUserId = null) => {
  // Fetch events joined with rsvp count
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      rsvp_count: event_rsvps(count)
    `)
    .order('event_date', { ascending: true });
  if (error) throw error;

  let userRsvpSet = new Set();
  if (currentUserId) {
    const { data: rsvps } = await supabase
      .from('event_rsvps')
      .select('event_id')
      .eq('user_id', currentUserId)
      .eq('status', 'confirmed');
    if (rsvps) rsvps.forEach((r) => userRsvpSet.add(r.event_id));
  }

  return data.map((row) => ({
    ...mapEvent(row),
    rsvpCount:   row.rsvp_count?.[0]?.count ?? 0,
    userHasRsvp: userRsvpSet.has(row.id),
    // Keep legacy rsvps array shape for compatibility
    rsvps:       userRsvpSet.has(row.id) ? [currentUserId] : [],
  }));
};

export const createEvent = async (eventData, createdById) => {
  const { data, error } = await supabase
    .from('events')
    .insert({
      title:       eventData.title,
      description: eventData.description,
      category:    eventData.category ?? 'social',
      location:    eventData.location,
      event_date:  eventData.date,
      event_time:  eventData.time ?? null,
      image_url:   eventData.image ?? null,
      capacity:    parseInt(eventData.capacity) || 100,
      created_by:  createdById,
    })
    .select()
    .single();
  if (error) throw error;
  return mapEvent(data);
};

export const deleteEvent = async (id) => {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
};

/** RSVP: confirm or cancel */
export const rsvpEvent = async (eventId, userId) => {
  // Check existing
  const { data: existing } = await supabase
    .from('event_rsvps')
    .select('id, status')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    // Toggle: cancel if confirmed, confirm if cancelled
    const newStatus = existing.status === 'confirmed' ? 'cancelled' : 'confirmed';
    const { error } = await supabase
      .from('event_rsvps')
      .update({ status: newStatus })
      .eq('id', existing.id);
    if (error) throw error;
    return newStatus;
  } else {
    // New RSVP
    const { error } = await supabase
      .from('event_rsvps')
      .insert({ event_id: eventId, user_id: userId, status: 'confirmed' });
    if (error) throw error;
    return 'confirmed';
  }
};
