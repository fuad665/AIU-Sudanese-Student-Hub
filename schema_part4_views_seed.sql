-- ============================================================
--  SSA Web Hub — Part 4: Storage, Views & Admin Seeding
--  Recreates storage buckets, views and automatically seeds the Admin account.
-- ============================================================

-- ────────────────────────────────────────────
--  STORAGE BUCKETS & POLICIES
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
