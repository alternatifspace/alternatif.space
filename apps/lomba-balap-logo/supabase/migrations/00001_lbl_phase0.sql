-- Lomba Balap Logo — Phase 0 schema (TRD v0.2 §2-§4).
-- Standalone project: its own Supabase project, its own migration history.

-- Remove the earlier divergent draft tables (logo_submissions / logo_votes) that
-- did NOT follow the canonical lbl_ prefix. Both were empty at cutover.
DROP TABLE IF EXISTS public.logo_votes CASCADE;
DROP TABLE IF EXISTS public.logo_submissions CASCADE;

-- ── §2 Profiles (mirror of auth.users for client-readable author names) ──────
CREATE TABLE lbl_profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url   text,
  created_at   timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION lbl_handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO lbl_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER lbl_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION lbl_handle_new_user();

-- ── §3 Config (contest window, rate limits, kill switch) ─────────────────────
CREATE TABLE lbl_config (
  key   text PRIMARY KEY,
  value jsonb NOT NULL
);

INSERT INTO lbl_config (key, value) VALUES
  ('contest', '{"close_at": "2026-08-15T23:59:00+07:00"}'),
  ('rate_limits', '{"new_account_hours": 0,
                    "submission_attempts_per_day": 3,
                    "likes_per_day": 50}'),
  ('submissions_open', 'true');

CREATE OR REPLACE FUNCTION lbl_contest_open()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT now() < (SELECT (value->>'close_at')::timestamptz FROM lbl_config WHERE key = 'contest')
$$;

CREATE OR REPLACE FUNCTION lbl_submissions_open()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT coalesce((SELECT (value #>> '{}')::boolean FROM lbl_config WHERE key = 'submissions_open'), true)
$$;

-- SECURITY DEFINER: reads the caller's own auth.users.created_at with elevated
-- rights (auth.users isn't selectable by the authenticated role). Only ever
-- evaluates auth.uid(), never an arbitrary id.
CREATE OR REPLACE FUNCTION lbl_account_age_ok()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT extract(epoch FROM (now() - u.created_at)) / 3600
           >= coalesce((SELECT (value->>'new_account_hours')::numeric
                         FROM lbl_config WHERE key = 'rate_limits'), 0)
  FROM auth.users u WHERE u.id = auth.uid()
$$;

-- ── §4 Submissions ───────────────────────────────────────────────────────────
CREATE TABLE lbl_submissions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id) NOT NULL,
  image_key        text NOT NULL,
  title            text NOT NULL CHECK (char_length(title) <= 80),
  caption          text CHECK (char_length(caption) <= 280),
  status           text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  like_count       int NOT NULL DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  approved_at      timestamptz
);

-- L0-05: one *live* submission per account (rejected excluded, so L0-10 resubmit works).
CREATE UNIQUE INDEX lbl_submissions_one_live_idx
  ON lbl_submissions (user_id)
  WHERE status IN ('pending', 'approved');

CREATE INDEX lbl_submissions_feed_likes_idx ON lbl_submissions (like_count DESC, created_at DESC)
  WHERE status = 'approved';
CREATE INDEX lbl_submissions_feed_recent_idx ON lbl_submissions (created_at DESC)
  WHERE status = 'approved';

-- Rate-limit helpers (TRD §3/§9).
CREATE OR REPLACE FUNCTION lbl_submissions_today(uid uuid)
RETURNS int LANGUAGE sql STABLE AS $$
  SELECT count(*)::int FROM lbl_submissions
  WHERE user_id = uid AND created_at > now() - interval '1 day'
$$;

-- ── Likes ────────────────────────────────────────────────────────────────────
-- ON DELETE CASCADE (enhancement over the literal TRD): lets a withdrawn or
-- moderator-removed submission take its likes with it, which the withdraw path
-- (L0-05/L0-10) depends on. Flagged in the changelog.
CREATE TABLE lbl_likes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) NOT NULL,
  submission_id uuid REFERENCES lbl_submissions(id) ON DELETE CASCADE NOT NULL,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (user_id, submission_id)
);

CREATE INDEX lbl_likes_user_idx ON lbl_likes (user_id, submission_id);

CREATE OR REPLACE FUNCTION lbl_likes_today(uid uuid)
RETURNS int LANGUAGE sql STABLE AS $$
  SELECT count(*)::int FROM lbl_likes
  WHERE user_id = uid AND created_at > now() - interval '1 day'
$$;

-- Denormalized like_count kept in sync by trigger (TRD §4).
CREATE OR REPLACE FUNCTION lbl_sync_like_count()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE lbl_submissions SET like_count = like_count + 1 WHERE id = NEW.submission_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE lbl_submissions SET like_count = like_count - 1 WHERE id = OLD.submission_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER lbl_likes_sync
  AFTER INSERT OR DELETE ON lbl_likes
  FOR EACH ROW EXECUTE FUNCTION lbl_sync_like_count();

-- ── Admins ───────────────────────────────────────────────────────────────────
CREATE TABLE lbl_admins (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION lbl_is_admin()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM lbl_admins WHERE user_id = auth.uid())
$$;
