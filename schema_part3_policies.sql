-- ============================================================
--  SSA Web Hub — Part 3: Security, RLS & Policies
--  Enables RLS, sets up secure helper functions and defines policies.
-- ============================================================

-- ────────────────────────────────────────────
--  ENABLE ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────
ALTER TABLE public.users                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_candidates          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_votes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_terms             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_term_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_term_members      ENABLE ROW LEVEL SECURITY;


-- ────────────────────────────────────────────
--  SECURITY HELPER FUNCTIONS (Bypasses RLS via SECURITY DEFINER)
-- ────────────────────────────────────────────

-- Get the public.users.id corresponding to the active auth.uid()
CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- Get the user_role for the active auth.uid()
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- Check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'
  );
$$;

-- Check if current user is government or admin
CREATE OR REPLACE FUNCTION public.is_gov_or_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role IN ('admin', 'government')
  );
$$;


-- ────────────────────────────────────────────
--  POLICIES
-- ────────────────────────────────────────────

-- USERS
CREATE POLICY "users: authenticated can read all"
  ON public.users FOR SELECT TO authenticated USING (true);

CREATE POLICY "users: update own profile"
  ON public.users FOR UPDATE TO authenticated
  USING (auth_id = auth.uid()) WITH CHECK (auth_id = auth.uid());

CREATE POLICY "users: insert own on register"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "users: admin full access"
  ON public.users FOR ALL TO authenticated USING (public.is_admin());


-- ANNOUNCEMENTS
CREATE POLICY "announcements: all can read"
  ON public.announcements FOR SELECT TO authenticated USING (true);

CREATE POLICY "announcements: gov+ can create"
  ON public.announcements FOR INSERT TO authenticated WITH CHECK (public.is_gov_or_admin());

CREATE POLICY "announcements: admin can update"
  ON public.announcements FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "announcements: admin can delete"
  ON public.announcements FOR DELETE TO authenticated USING (public.is_admin());


-- EVENTS
CREATE POLICY "events: all can read"
  ON public.events FOR SELECT TO authenticated USING (true);

CREATE POLICY "events: gov+ can create"
  ON public.events FOR INSERT TO authenticated WITH CHECK (public.is_gov_or_admin());

CREATE POLICY "events: admin can modify"
  ON public.events FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "events: admin can delete"
  ON public.events FOR DELETE TO authenticated USING (public.is_admin());


-- EVENT RSVPs
CREATE POLICY "rsvps: own or admin read"
  ON public.event_rsvps FOR SELECT TO authenticated
  USING (user_id = public.get_my_user_id() OR public.is_admin());

CREATE POLICY "rsvps: insert own"
  ON public.event_rsvps FOR INSERT TO authenticated
  WITH CHECK (user_id = public.get_my_user_id());

CREATE POLICY "rsvps: update own"
  ON public.event_rsvps FOR UPDATE TO authenticated
  USING (user_id = public.get_my_user_id());

CREATE POLICY "rsvps: delete own"
  ON public.event_rsvps FOR DELETE TO authenticated
  USING (user_id = public.get_my_user_id());


-- ELECTIONS
CREATE POLICY "elections: all can read"
  ON public.elections FOR SELECT TO authenticated USING (true);

CREATE POLICY "elections: admin full control"
  ON public.elections FOR ALL TO authenticated USING (public.is_admin());


-- ELECTION CANDIDATES
CREATE POLICY "candidates: all can read"
  ON public.election_candidates FOR SELECT TO authenticated USING (true);

CREATE POLICY "candidates: admin manages"
  ON public.election_candidates FOR ALL TO authenticated USING (public.is_admin());


-- ELECTION VOTES
CREATE POLICY "votes: own or admin read"
  ON public.election_votes FOR SELECT TO authenticated
  USING (voter_id = public.get_my_user_id() OR public.is_admin());

CREATE POLICY "votes: authenticated can vote"
  ON public.election_votes FOR INSERT TO authenticated
  WITH CHECK (voter_id = public.get_my_user_id());


-- ALUMNI
CREATE POLICY "alumni: all can read"
  ON public.alumni FOR SELECT TO authenticated USING (true);

CREATE POLICY "alumni: admin manages"
  ON public.alumni FOR ALL TO authenticated USING (public.is_admin());


-- MENTORSHIP REQUESTS
CREATE POLICY "mentorship: own or admin read"
  ON public.mentorship_requests FOR SELECT TO authenticated
  USING (requester_id = public.get_my_user_id() OR public.is_admin());

CREATE POLICY "mentorship: authenticated can request"
  ON public.mentorship_requests FOR INSERT TO authenticated
  WITH CHECK (requester_id = public.get_my_user_id());

CREATE POLICY "mentorship: admin updates status"
  ON public.mentorship_requests FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "mentorship: requester can delete own"
  ON public.mentorship_requests FOR DELETE TO authenticated
  USING (requester_id = public.get_my_user_id());


-- GOVERNMENT TERMS
CREATE POLICY "gov_terms: all can read"
  ON public.government_terms FOR SELECT TO authenticated USING (true);

CREATE POLICY "gov_terms: admin manages"
  ON public.government_terms FOR ALL TO authenticated USING (public.is_admin());


-- GOVERNMENT TERM ACHIEVEMENTS
CREATE POLICY "gov_achievements: all can read"
  ON public.government_term_achievements FOR SELECT TO authenticated USING (true);

CREATE POLICY "gov_achievements: admin manages"
  ON public.government_term_achievements FOR ALL TO authenticated USING (public.is_admin());


-- GOVERNMENT TERM MEMBERS
CREATE POLICY "gov_members_hist: all can read"
  ON public.government_term_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "gov_members_hist: admin manages"
  ON public.government_term_members FOR ALL TO authenticated USING (public.is_admin());
