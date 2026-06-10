-- Phase 0: extensions and shared tables (TRD §2, §6)
-- pgvector deliberately NOT enabled — Phase 2 only.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- users: id comes from Clerk, not Supabase-generated
CREATE TABLE users (
  id             uuid PRIMARY KEY,
  display_name   text NOT NULL,
  bio            text CHECK (char_length(bio) <= 160),
  created_at     timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now()
);

-- platform_config: runtime-tunable constants, no release required to adjust
CREATE TABLE platform_config (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO platform_config (key, value) VALUES
  ('mufakat_split_threshold', '{"floor": 5, "ceiling": 50, "ratio": 0.15}'),
  ('mufakat_rate_limits', '{"new_account_hours": 48,
                            "new_account_threads_per_day": 2,
                            "new_account_comments_per_day": 20,
                            "threads_per_day": 5}'),
  ('mufakat_op_window_hours', '24'),
  ('mufakat_edit_window_minutes', '15');

CREATE TABLE platform_admins (
  user_id    uuid PRIMARY KEY REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid());
$$;

-- RLS: users readable publicly (display names appear everywhere);
-- own-row update only. Inserts happen via Clerk webhook (service role).
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_public_read" ON users
  FOR SELECT USING (true);

CREATE POLICY "users_own_update" ON users
  FOR UPDATE USING (id = auth.uid());

-- platform_config: public read, service-role-only writes (no insert/update policies)
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_config_public_read" ON platform_config
  FOR SELECT USING (true);

-- platform_admins: admins can see the admin list; writes service-role only
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_admins_admin_read" ON platform_admins
  FOR SELECT USING (is_platform_admin());
