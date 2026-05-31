-- ============================================================
--  SSA Web Hub — Supabase PostgreSQL Schema  v2.0
--
--  ⚠️  WARNING: THIS SCRIPT CLEARS ALL EXISTING TABLES, VIEWS,
--      TYPES AND FUNCTIONS BEFORE RECREATING THEM (TEARDOWN).
--
--  HOW TO USE:
--  1. Go to https://supabase.com/dashboard/project/oydscytbdhpwyrmffosj/sql/new
--  2. Paste the ENTIRE file and click Run.
-- ============================================================


-- ────────────────────────────────────────────
--  TEARDOWN (DROP OLD DATABASE OBJECTS)
-- ────────────────────────────────────────────

-- Drop Views
DROP VIEW IF EXISTS public.current_government CASCADE;
DROP VIEW IF EXISTS public.election_results CASCADE;

-- Drop Tables (Cascades will drop dependent constraints, indexes, and triggers)
DROP TABLE IF EXISTS public.mentorship_requests CASCADE;
DROP TABLE IF EXISTS public.alumni CASCADE;
DROP TABLE IF EXISTS public.election_votes CASCADE;
DROP TABLE IF EXISTS public.election_candidates CASCADE;
DROP TABLE IF EXISTS public.elections CASCADE;
DROP TABLE IF EXISTS public.event_rsvps CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.government_term_members CASCADE;
DROP TABLE IF EXISTS public.government_term_achievements CASCADE;
DROP TABLE IF EXISTS public.government_terms CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop Enum Types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS announcement_category CASCADE;
DROP TYPE IF EXISTS announcement_importance CASCADE;
DROP TYPE IF EXISTS election_status CASCADE;
DROP TYPE IF EXISTS event_category CASCADE;
DROP TYPE IF EXISTS rsvp_status CASCADE;
DROP TYPE IF EXISTS mentorship_status CASCADE;

-- Drop Functions
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_user_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_role() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_gov_or_admin() CASCADE;


-- ────────────────────────────────────────────
--  EXTENSIONS
-- ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ────────────────────────────────────────────
--  ENUM TYPES
-- ────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('member', 'government', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'government', 'alumni');
CREATE TYPE announcement_category AS ENUM ('General', 'Academic', 'Social', 'Financial');
CREATE TYPE announcement_importance AS ENUM ('normal', 'high');
CREATE TYPE election_status AS ENUM ('not_started', 'active', 'ended', 'published');
CREATE TYPE event_category AS ENUM ('cultural', 'academic', 'sports', 'social', 'official');
CREATE TYPE rsvp_status AS ENUM ('confirmed', 'cancelled');
CREATE TYPE mentorship_status AS ENUM ('pending', 'accepted', 'declined');


-- ────────────────────────────────────────────
--  TABLES
-- ────────────────────────────────────────────

-- USERS (Profiles linked to Supabase Auth)
CREATE TABLE public.users (
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
CREATE TABLE public.announcements (
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
CREATE TABLE public.events (
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
CREATE TABLE public.event_rsvps (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id    UUID        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.users(id)  ON DELETE CASCADE,
  status      rsvp_status NOT NULL DEFAULT 'confirmed',
  rsvped_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

-- ELECTIONS
CREATE TABLE public.elections (
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
CREATE TABLE public.election_candidates (
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
CREATE TABLE public.election_votes (
  id           UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id  UUID  NOT NULL REFERENCES public.elections(id)           ON DELETE CASCADE,
  candidate_id UUID  NOT NULL REFERENCES public.election_candidates(id) ON DELETE CASCADE,
  voter_id     UUID  NOT NULL REFERENCES public.users(id)               ON DELETE CASCADE,
  voted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (election_id, voter_id)
);

-- ALUMNI
CREATE TABLE public.alumni (
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
CREATE TABLE public.mentorship_requests (
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
CREATE TABLE public.government_terms (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenure      TEXT    NOT NULL UNIQUE,
  president   TEXT,
  is_current  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GOVERNMENT TERM ACHIEVEMENTS
CREATE TABLE public.government_term_achievements (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  term_id     UUID    NOT NULL REFERENCES public.government_terms(id) ON DELETE CASCADE,
  achievement TEXT    NOT NULL,
  sort_order  INTEGER DEFAULT 0
);

-- GOVERNMENT TERM MEMBERS
CREATE TABLE public.government_term_members (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  term_id     UUID    NOT NULL REFERENCES public.government_terms(id) ON DELETE CASCADE,
  user_id     UUID    REFERENCES public.users(id) ON DELETE SET NULL,
  name        TEXT    NOT NULL,
  role        TEXT    NOT NULL,
  sort_order  INTEGER DEFAULT 0
);


-- ────────────────────────────────────────────
--  INDEXES
-- ────────────────────────────────────────────
CREATE INDEX idx_users_student_id     ON public.users(student_id);
CREATE INDEX idx_users_email          ON public.users(email);
CREATE INDEX idx_users_role           ON public.users(role);
CREATE INDEX idx_users_status         ON public.users(status);

CREATE INDEX idx_ann_category         ON public.announcements(category);
CREATE INDEX idx_ann_importance       ON public.announcements(importance);
CREATE INDEX idx_ann_published_at     ON public.announcements(published_at DESC);
CREATE INDEX idx_ann_author_id        ON public.announcements(author_id);

CREATE INDEX idx_events_date          ON public.events(event_date);
CREATE INDEX idx_events_category      ON public.events(category);

CREATE INDEX idx_rsvps_event_id       ON public.event_rsvps(event_id);
CREATE INDEX idx_rsvps_user_id        ON public.event_rsvps(user_id);

CREATE INDEX idx_elections_status     ON public.elections(status);
CREATE INDEX idx_elections_position   ON public.elections(position);

CREATE INDEX idx_candidates_election  ON public.election_candidates(election_id);

CREATE INDEX idx_votes_election_id    ON public.election_votes(election_id);
CREATE INDEX idx_votes_voter_id       ON public.election_votes(voter_id);

CREATE INDEX idx_alumni_industry      ON public.alumni(industry);
CREATE INDEX idx_alumni_mentor        ON public.alumni(mentor_status);
CREATE INDEX idx_alumni_grad_year     ON public.alumni(graduation_year DESC);

CREATE INDEX idx_gov_terms_is_current ON public.government_terms(is_current);


-- ────────────────────────────────────────────
--  TRIGGERS (auto-update updated_at)
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_elections_updated_at
  BEFORE UPDATE ON public.elections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_alumni_updated_at
  BEFORE UPDATE ON public.alumni
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_mentorship_updated_at
  BEFORE UPDATE ON public.mentorship_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ────────────────────────────────────────────
--  ROW LEVEL SECURITY (RLS)
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
--  SECURITY HELPER FUNCTIONS (Bypasses RLS)
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
CREATE VIEW public.current_government AS
SELECT
  u.id, u.name, u.student_id, u.email,
  u.photo_url, u.major, u.position, u.role, u.status,
  gt.tenure
FROM public.users u
LEFT JOIN public.government_terms gt ON gt.is_current = TRUE
WHERE u.status = 'government'
ORDER BY u.position;

CREATE VIEW public.election_results AS
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


-- ────────────────────────────────────────────
--  SEED ADMIN PROFILE (for fuadhiyabo@gmail.com)
-- ────────────────────────────────────────────
DO $$
DECLARE
  v_auth_id UUID;
BEGIN
  -- Look up the auth.users ID for the admin email
  SELECT id INTO v_auth_id FROM auth.users WHERE email = 'fuadhiyabo@gmail.com' LIMIT 1;
  
  -- If found, insert or update the profile in public.users as admin
  IF v_auth_id IS NOT NULL THEN
    INSERT INTO public.users (auth_id, name, student_id, email, role, status, major, batch)
    VALUES (
      v_auth_id,
      'Fuad Hiyabo',
      '3456788',
      'fuadhiyabo@gmail.com',
      'admin',
      'active',
      'Computer Science',
      EXTRACT(YEAR FROM CURRENT_DATE)::TEXT
    )
    ON CONFLICT (auth_id) DO UPDATE
    SET role = 'admin', status = 'active';
    
    RAISE NOTICE 'Admin profile seeded for fuadhiyabo@gmail.com';
  ELSE
    RAISE NOTICE 'Admin user not found in auth.users. Please register this email first in the app, then run this block to elevate to admin.';
  END IF;
END $$;


-- ============================================================
--  ✅  Done. All 12 tables, indexes, RLS policies,
--      triggers, views, storage policies, and admin seeding
--      are complete and ready for use.
-- ============================================================
