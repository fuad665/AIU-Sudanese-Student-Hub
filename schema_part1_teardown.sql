-- ============================================================
--  SSA Web Hub — Part 1: Teardown
--  Drops all existing views, tables, enum types, functions, and triggers.
-- ============================================================

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
