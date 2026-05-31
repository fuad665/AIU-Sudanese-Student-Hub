-- ============================================================
--  SSA Web Hub — Part 2: Tables & Structural Schema
--  Recreates all extensions, custom enum types, tables, indexes, and triggers.
-- ============================================================

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
