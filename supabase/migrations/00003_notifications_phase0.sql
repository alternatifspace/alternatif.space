-- notifications + push_subscriptions (TRD §6 v1.3 note):
-- moved from Phase 1 to Phase 0 build scope — mufakat's OP-ship window (M0-09)
-- depends on notification delivery. In-app bell only at launch; push delivery
-- is a Phase 1 fast follow.

CREATE TABLE notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES users(id) NOT NULL,
  type       text NOT NULL,
  payload    jsonb NOT NULL,
  read_at    timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX notifications_user_unread_idx
  ON notifications (user_id, created_at DESC) WHERE read_at IS NULL;

CREATE TABLE push_subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES users(id) NOT NULL,
  token      text NOT NULL,             -- FCM (Android), APNs (iOS), or Web Push endpoint
  platform   text CHECK (platform IN ('android', 'ios', 'web')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, token)
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_own_read" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_own_mark_read" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
-- inserts via Edge Functions (service role) only

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subscriptions_own_all" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
