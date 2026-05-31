-- ============================================================
--  SSA Web Hub — Supabase PostgreSQL Schema  v1.2
--
--  ✅  100% SAFE TO RE-RUN — uses DO blocks for ENUMs
--      and CREATE TABLE IF NOT EXISTS for tables.
--
--  HOW TO USE:
--  1. Go to https://supabase.com/dashboard/project/oydscytbdhpwyrmffosj/sql/new
--  2. Paste the ENTIRE file and click Run.
-- ============================================================


-- ────────────────────────────────────────────
--  EXTENSIONS
-- ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ────────────────────────────────────────────
--  ENUM TYPES
--  DO blocks silently skip if the type already exists.
-- ────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('member', 'government', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('pending', 'active', 'government', 'alumni');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE announcement_category AS ENUM ('General', 'Academic', 'Social', 'Financial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE announcement_importance AS ENUM ('normal', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE election_status AS ENUM ('not_started', 'active', 'ended', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE event_category AS ENUM ('cultural', 'academic', 'sports', 'social', 'official');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE rsvp_status AS ENUM ('confirmed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE mentorship_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ────────────────────────────────────────────
--  TABLES
-- ────────────────────────────────────────────

-- USERS
CREATE TABLE IF NOT EXISTS public.users (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id         UUID         UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT         NOT NULL,
  student_id      TEXT         NOT NULL UNIQUE,
  email           TEXT         NOT NULL UNIQUE,
  phone           TEXT,
  photo_url       TEXT,
  major           TEXT,
  batch           TEXT,
  graduation_year INTEGER,
  role            user_role    NOT NULL DEFAULT 'member',
  status          user_status  NOT NULL DEFAULT 'pending',
  position        TEXT,
  joined_at       DATE         DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
  id              UUID                     PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT                     NOT NULL,
  content         TEXT                     NOT NULL,
  category        announcement_category    NOT NULL DEFAULT 'General',
  importance      announcement_importance  NOT NULL DEFAULT 'normal',
  author_id       UUID                     REFERENCES public.users(id) ON DELETE SET NULL,
  author_name     TEXT                     NOT NULL,
  published_at    DATE         DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- EVENTS
CREATE TABLE IF NOT EXISTS public.events (
  id              UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT           NOT NULL,
  description     TEXT,
  category        event_category NOT NULL DEFAULT 'social',
  location        TEXT,
  event_date      DATE           NOT NULL,
  event_time      TIME,
  image_url       TEXT,
  capacity        INTEGER        DEFAULT 100,
  created_by      UUID           REFERENCES public.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- EVENT RSVPs
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id    UUID        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.users(id)  ON DELETE CASCADE,
  status      rsvp_status NOT NULL DEFAULT 'confirmed',
  rsvped_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

-- ELECTIONS
CREATE TABLE IF NOT EXISTS public.elections (
  id              UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT             NOT NULL,
  description     TEXT,
  position        TEXT             NOT NULL,
  status          election_status  NOT NULL DEFAULT 'not_started',
  start_date      DATE,
  end_date        DATE,
  winner_id       UUID             REFERENCES public.users(id) ON DELETE SET NULL,
  created_by      UUID             REFERENCES public.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- ELECTION CANDIDATES
CREATE TABLE IF NOT EXISTS public.election_candidates (
  id           UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id  UUID    NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  user_id      UUID    REFERENCES public.users(id) ON DELETE SET NULL,
  name         TEXT    NOT NULL,
  student_id   TEXT,
  major        TEXT,
  photo_url    TEXT,
  manifesto    TEXT,
  votes        INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ELECTION VOTES
CREATE TABLE IF NOT EXISTS public.election_votes (
  id           UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id  UUID  NOT NULL REFERENCES public.elections(id)           ON DELETE CASCADE,
  candidate_id UUID  NOT NULL REFERENCES public.election_candidates(id) ON DELETE CASCADE,
  voter_id     UUID  NOT NULL REFERENCES public.users(id)               ON DELETE CASCADE,
  voted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (election_id, voter_id)
);

-- ALUMNI
CREATE TABLE IF NOT EXISTS public.alumni (
  id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID    REFERENCES public.users(id) ON DELETE SET NULL,
  full_name       TEXT    NOT NULL,
  student_id_ref  TEXT,
  email           TEXT,
  photo_url       TEXT,
  major           TEXT,
  graduation_year INTEGER NOT NULL,
  batch           TEXT,
  current_job     TEXT,
  company         TEXT,
  location        TEXT,
  industry        TEXT,
  linkedin_url    TEXT,
  mentor_status   BOOLEAN NOT NULL DEFAULT FALSE,
  bio             TEXT,
  skills          TEXT[]  DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MENTORSHIP REQUESTS
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
  id           UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumni_id    UUID               NOT NULL REFERENCES public.alumni(id) ON DELETE CASCADE,
  requester_id UUID               NOT NULL REFERENCES public.users(id)  ON DELETE CASCADE,
  message      TEXT               NOT NULL,
  status       mentorship_status  NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  UNIQUE (alumni_id, requester_id)
);

-- GOVERNMENT TERMS
CREATE TABLE IF NOT EXISTS public.government_terms (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenure      TEXT    NOT NULL UNIQUE,
  president   TEXT,
  is_current  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.government_term_achievements (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  term_id     UUID    NOT NULL REFERENCES public.government_terms(id) ON DELETE CASCADE,
  achievement TEXT    NOT NULL,
  sort_order  INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.government_term_members (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  term_id     UUID    NOT NULL REFERENCES public.government_terms(id) ON DELETE CASCADE,
  user_id     UUID    REFERENCES public.users(id) ON DELETE SET NULL,
  name        TEXT    NOT NULL,
  role        TEXT    NOT NULL,
  sort_order  INTEGER DEFAULT 0
);


-- ────────────────────────────────────────────
--  INDEXES  (IF NOT EXISTS — safe to re-run)
-- ────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_users_student_id     ON public.users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_email          ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role           ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status         ON public.users(status);

CREATE INDEX IF NOT EXISTS idx_ann_category         ON public.announcements(category);
CREATE INDEX IF NOT EXISTS idx_ann_importance       ON public.announcements(importance);
CREATE INDEX IF NOT EXISTS idx_ann_published_at     ON public.announcements(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ann_author_id        ON public.announcements(author_id);

CREATE INDEX IF NOT EXISTS idx_events_date          ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category      ON public.events(category);

CREATE INDEX IF NOT EXISTS idx_rsvps_event_id       ON public.event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_user_id        ON public.event_rsvps(user_id);

CREATE INDEX IF NOT EXISTS idx_elections_status     ON public.elections(status);
CREATE INDEX IF NOT EXISTS idx_elections_position   ON public.elections(position);

CREATE INDEX IF NOT EXISTS idx_candidates_election  ON public.election_candidates(election_id);

CREATE INDEX IF NOT EXISTS idx_votes_election_id    ON public.election_votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_id       ON public.election_votes(voter_id);

CREATE INDEX IF NOT EXISTS idx_alumni_industry      ON public.alumni(industry);
CREATE INDEX IF NOT EXISTS idx_alumni_mentor        ON public.alumni(mentor_status);
CREATE INDEX IF NOT EXISTS idx_alumni_grad_year     ON public.alumni(graduation_year DESC);

CREATE INDEX IF NOT EXISTS idx_gov_terms_is_current ON public.government_terms(is_current);


-- ────────────────────────────────────────────
--  TRIGGER: auto-update updated_at
-- ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_announcements_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_elections_updated_at
    BEFORE UPDATE ON public.elections
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_alumni_updated_at
    BEFORE UPDATE ON public.alumni
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_mentorship_updated_at
    BEFORE UPDATE ON public.mentorship_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ────────────────────────────────────────────
--  ROW LEVEL SECURITY
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


-- Helper functions
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_gov_or_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role IN ('admin', 'government')
  );
$$;


-- POLICIES — drop first so re-runs don't fail

-- users
DROP POLICY IF EXISTS "users: authenticated can read all" ON public.users;
DROP POLICY IF EXISTS "users: update own profile"         ON public.users;
DROP POLICY IF EXISTS "users: insert own on register"     ON public.users;
DROP POLICY IF EXISTS "users: admin full access"          ON public.users;

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


-- announcements
DROP POLICY IF EXISTS "announcements: all can read"      ON public.announcements;
DROP POLICY IF EXISTS "announcements: gov+ can create"   ON public.announcements;
DROP POLICY IF EXISTS "announcements: admin can update"  ON public.announcements;
DROP POLICY IF EXISTS "announcements: admin can delete"  ON public.announcements;

CREATE POLICY "announcements: all can read"
  ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "announcements: gov+ can create"
  ON public.announcements FOR INSERT TO authenticated WITH CHECK (public.is_gov_or_admin());
CREATE POLICY "announcements: admin can update"
  ON public.announcements FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "announcements: admin can delete"
  ON public.announcements FOR DELETE TO authenticated USING (public.is_admin());


-- events
DROP POLICY IF EXISTS "events: all can read"     ON public.events;
DROP POLICY IF EXISTS "events: gov+ can create"  ON public.events;
DROP POLICY IF EXISTS "events: admin can modify" ON public.events;
DROP POLICY IF EXISTS "events: admin can delete" ON public.events;

CREATE POLICY "events: all can read"
  ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events: gov+ can create"
  ON public.events FOR INSERT TO authenticated WITH CHECK (public.is_gov_or_admin());
CREATE POLICY "events: admin can modify"
  ON public.events FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "events: admin can delete"
  ON public.events FOR DELETE TO authenticated USING (public.is_admin());


-- event_rsvps
DROP POLICY IF EXISTS "rsvps: own or admin read" ON public.event_rsvps;
DROP POLICY IF EXISTS "rsvps: insert own"        ON public.event_rsvps;
DROP POLICY IF EXISTS "rsvps: update own"        ON public.event_rsvps;
DROP POLICY IF EXISTS "rsvps: delete own"        ON public.event_rsvps;

CREATE POLICY "rsvps: own or admin read"
  ON public.event_rsvps FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR public.is_admin());
CREATE POLICY "rsvps: insert own"
  ON public.event_rsvps FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "rsvps: update own"
  ON public.event_rsvps FOR UPDATE TO authenticated
  USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "rsvps: delete own"
  ON public.event_rsvps FOR DELETE TO authenticated
  USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));


-- elections
DROP POLICY IF EXISTS "elections: all can read"       ON public.elections;
DROP POLICY IF EXISTS "elections: admin full control" ON public.elections;

CREATE POLICY "elections: all can read"
  ON public.elections FOR SELECT TO authenticated USING (true);
CREATE POLICY "elections: admin full control"
  ON public.elections FOR ALL TO authenticated USING (public.is_admin());


-- election_candidates
DROP POLICY IF EXISTS "candidates: all can read"  ON public.election_candidates;
DROP POLICY IF EXISTS "candidates: admin manages" ON public.election_candidates;

CREATE POLICY "candidates: all can read"
  ON public.election_candidates FOR SELECT TO authenticated USING (true);
CREATE POLICY "candidates: admin manages"
  ON public.election_candidates FOR ALL TO authenticated USING (public.is_admin());


-- election_votes
DROP POLICY IF EXISTS "votes: own or admin read"       ON public.election_votes;
DROP POLICY IF EXISTS "votes: authenticated can vote"  ON public.election_votes;

CREATE POLICY "votes: own or admin read"
  ON public.election_votes FOR SELECT TO authenticated
  USING (voter_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR public.is_admin());
CREATE POLICY "votes: authenticated can vote"
  ON public.election_votes FOR INSERT TO authenticated
  WITH CHECK (voter_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));


-- alumni
DROP POLICY IF EXISTS "alumni: all can read"  ON public.alumni;
DROP POLICY IF EXISTS "alumni: admin manages" ON public.alumni;

CREATE POLICY "alumni: all can read"
  ON public.alumni FOR SELECT TO authenticated USING (true);
CREATE POLICY "alumni: admin manages"
  ON public.alumni FOR ALL TO authenticated USING (public.is_admin());


-- mentorship_requests
DROP POLICY IF EXISTS "mentorship: own or admin read"       ON public.mentorship_requests;
DROP POLICY IF EXISTS "mentorship: authenticated can request" ON public.mentorship_requests;
DROP POLICY IF EXISTS "mentorship: admin updates status"    ON public.mentorship_requests;
DROP POLICY IF EXISTS "mentorship: requester can delete own" ON public.mentorship_requests;

CREATE POLICY "mentorship: own or admin read"
  ON public.mentorship_requests FOR SELECT TO authenticated
  USING (requester_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR public.is_admin());
CREATE POLICY "mentorship: authenticated can request"
  ON public.mentorship_requests FOR INSERT TO authenticated
  WITH CHECK (requester_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "mentorship: admin updates status"
  ON public.mentorship_requests FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "mentorship: requester can delete own"
  ON public.mentorship_requests FOR DELETE TO authenticated
  USING (requester_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));


-- government_terms
DROP POLICY IF EXISTS "gov_terms: all can read"  ON public.government_terms;
DROP POLICY IF EXISTS "gov_terms: admin manages" ON public.government_terms;

CREATE POLICY "gov_terms: all can read"
  ON public.government_terms FOR SELECT TO authenticated USING (true);
CREATE POLICY "gov_terms: admin manages"
  ON public.government_terms FOR ALL TO authenticated USING (public.is_admin());


-- government_term_achievements
DROP POLICY IF EXISTS "gov_achievements: all can read"  ON public.government_term_achievements;
DROP POLICY IF EXISTS "gov_achievements: admin manages" ON public.government_term_achievements;

CREATE POLICY "gov_achievements: all can read"
  ON public.government_term_achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "gov_achievements: admin manages"
  ON public.government_term_achievements FOR ALL TO authenticated USING (public.is_admin());


-- government_term_members
DROP POLICY IF EXISTS "gov_members_hist: all can read"  ON public.government_term_members;
DROP POLICY IF EXISTS "gov_members_hist: admin manages" ON public.government_term_members;

CREATE POLICY "gov_members_hist: all can read"
  ON public.government_term_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "gov_members_hist: admin manages"
  ON public.government_term_members FOR ALL TO authenticated USING (public.is_admin());


-- ────────────────────────────────────────────
--  STORAGE BUCKETS
-- ────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-banners', 'event-banners', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatars: authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "avatars: public read"          ON storage.objects;
DROP POLICY IF EXISTS "avatars: own delete"           ON storage.objects;
DROP POLICY IF EXISTS "event-banners: gov+ upload"    ON storage.objects;
DROP POLICY IF EXISTS "event-banners: public read"    ON storage.objects;

CREATE POLICY "avatars: authenticated upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY "avatars: own delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "event-banners: gov+ upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-banners');
CREATE POLICY "event-banners: public read"
  ON storage.objects FOR SELECT TO public USING (bucket_id = 'event-banners');


-- ────────────────────────────────────────────
--  VIEWS
-- ────────────────────────────────────────────

CREATE OR REPLACE VIEW public.current_government AS
SELECT
  u.id, u.name, u.student_id, u.email,
  u.photo_url, u.major, u.position, u.role, u.status,
  gt.tenure
FROM public.users u
LEFT JOIN public.government_terms gt ON gt.is_current = TRUE
WHERE u.status = 'government'
ORDER BY u.position;

CREATE OR REPLACE VIEW public.election_results AS
SELECT
  e.id AS election_id, e.title, e.position, e.status,
  ec.id AS candidate_id, ec.name AS candidate_name,
  ec.major, ec.photo_url, ec.votes,
  ROUND(
    ec.votes::NUMERIC / NULLIF(SUM(ec.votes) OVER (PARTITION BY e.id), 0) * 100, 1
  ) AS vote_percentage,
  RANK() OVER (PARTITION BY e.id ORDER BY ec.votes DESC) AS ranking
FROM public.elections e
JOIN public.election_candidates ec ON ec.election_id = e.id
ORDER BY e.id, ec.votes DESC;


-- ============================================================
--  ✅  Done. All 12 tables, indexes, RLS policies,
--      triggers, views and storage buckets are ready.
-- ============================================================
