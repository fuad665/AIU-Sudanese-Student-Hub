// ─────────────────────────────────────────────
//  API Services: Elections
//  src/api/elections.js
// ─────────────────────────────────────────────
import { supabase } from '../lib/supabase';

const mapCandidate = (row) => ({
  id:         row.id,
  electionId: row.election_id,
  userId:     row.user_id,
  name:       row.name,
  studentId:  row.student_id,
  major:      row.major ?? '',
  avatar:     row.photo_url ?? '',
  manifesto:  row.manifesto ?? '',
  votes:      row.votes ?? 0,
});

const mapElection = (row, candidates = [], votedUserIds = []) => ({
  id:           row.id,
  title:        row.title,
  description:  row.description ?? '',
  position:     row.position,
  status:       row.status,
  startDate:    row.start_date,
  endDate:      row.end_date,
  winnerId:     row.winner_id,
  createdBy:    row.created_by,
  createdAt:    row.created_at,
  candidates,
  votedUserIds,
});

/** Fetch all elections with their candidates */
export const fetchElections = async (currentUserId = null) => {
  const { data: elections, error: elErr } = await supabase
    .from('elections')
    .select('*')
    .order('created_at', { ascending: false });
  if (elErr) throw elErr;

  const { data: candidates, error: candErr } = await supabase
    .from('election_candidates')
    .select('*');
  if (candErr) throw candErr;

  const { data: votes, error: voteErr } = await supabase
    .from('election_votes')
    .select('election_id, voter_id');
  if (voteErr) throw voteErr;

  return elections.map((el) => {
    const elCands = (candidates || [])
      .filter((c) => c.election_id === el.id)
      .map(mapCandidate);
    const votedUserIds = (votes || [])
      .filter((v) => v.election_id === el.id)
      .map((v) => v.voter_id);
    return mapElection(el, elCands, votedUserIds);
  });
};

export const createElection = async (electionData, createdById) => {
  const { data: election, error: elErr } = await supabase
    .from('elections')
    .insert({
      title:       electionData.title,
      description: electionData.description,
      position:    electionData.position ?? electionData.title,
      status:      'not_started',
      start_date:  electionData.startDate ?? null,
      end_date:    electionData.endDate ?? null,
      created_by:  createdById,
    })
    .select()
    .single();
  if (elErr) throw elErr;

  // Insert candidates
  if (electionData.candidates?.length) {
    const candRows = electionData.candidates.map((c) => ({
      election_id: election.id,
      name:        c.name,
      student_id:  c.studentId ?? null,
      major:       c.major ?? '',
      photo_url:   c.avatar ?? null,
      manifesto:   c.manifesto ?? '',
      votes:       0,
    }));
    const { error: candErr } = await supabase
      .from('election_candidates')
      .insert(candRows);
    if (candErr) throw candErr;
  }

  return election.id;
};

export const updateElectionStatus = async (electionId, newStatus) => {
  const { data, error } = await supabase
    .from('elections')
    .update({ status: newStatus })
    .eq('id', electionId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Set election winner_id when publishing results */
export const setElectionWinner = async (electionId, winnerId) => {
  const { error } = await supabase
    .from('elections')
    .update({ winner_id: winnerId, status: 'published' })
    .eq('id', electionId);
  if (error) throw error;
};

/** Cast a vote — server enforces uniqueness via UNIQUE constraint */
export const castVote = async (electionId, candidateId, voterId) => {
  // Insert the vote record
  const { error: voteErr } = await supabase
    .from('election_votes')
    .insert({ election_id: electionId, candidate_id: candidateId, voter_id: voterId });
  if (voteErr) throw voteErr;

  // Increment vote count on the candidate
  const { error: incErr } = await supabase.rpc('increment_candidate_votes', {
    p_candidate_id: candidateId
  });
  if (incErr) {
    // Fallback: manual increment if RPC not available
    const { data: cand } = await supabase
      .from('election_candidates')
      .select('votes')
      .eq('id', candidateId)
      .single();
    if (cand) {
      await supabase
        .from('election_candidates')
        .update({ votes: cand.votes + 1 })
        .eq('id', candidateId);
    }
  }
};
