// ─────────────────────────────────────────────
//  API Services: Government History
//  src/api/government.js
// ─────────────────────────────────────────────
import { supabase } from '../lib/supabase';

/** Fetch current government cabinet from the `current_government` view */
export const fetchCurrentGovernment = async () => {
  const { data, error } = await supabase
    .from('current_government')
    .select('*');
  if (error) throw error;
  return data.map((row) => ({
    id:        row.id,
    name:      row.name,
    studentId: row.student_id,
    email:     row.email,
    avatar:    row.photo_url ?? '',
    major:     row.major ?? '',
    role:      row.position,        // "position" in DB → "role" in UI
    status:    row.status,
    tenure:    row.tenure,
  }));
};

/** Fetch government history terms + achievements + members */
export const fetchGovernmentHistory = async () => {
  const { data: terms, error: tErr } = await supabase
    .from('government_terms')
    .select(`
      *,
      government_term_achievements ( achievement, sort_order ),
      government_term_members      ( name, role, sort_order )
    `)
    .order('tenure', { ascending: false });
  if (tErr) throw tErr;

  return terms.map((term) => ({
    tenure:       term.tenure,
    president:    term.president ?? '',
    isCurrent:    term.is_current,
    achievements: (term.government_term_achievements || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((a) => a.achievement),
    committee:    (term.government_term_members || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((m) => ({ name: m.name, role: m.role })),
  }));
};

/** Rebuild government data in the format AppContext expects */
export const fetchGovernmentData = async () => {
  const [executives, historyTerms] = await Promise.all([
    fetchCurrentGovernment(),
    fetchGovernmentHistory(),
  ]);

  const currentTerm = historyTerms.find((t) => t.isCurrent);
  const history     = historyTerms.filter((t) => !t.isCurrent);

  return {
    currentTenure: currentTerm?.tenure ?? `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    executives,
    history,
  };
};
