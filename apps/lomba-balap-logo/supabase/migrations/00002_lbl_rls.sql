-- Lomba Balap Logo — RLS policies (TRD v0.2 §5).

-- ── Profiles ─────────────────────────────────────────────────────────────────
ALTER TABLE lbl_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lbl_profiles_public_read" ON lbl_profiles FOR SELECT USING (true);
CREATE POLICY "lbl_profiles_own_update"  ON lbl_profiles FOR UPDATE USING (id = auth.uid());

-- ── Submissions ──────────────────────────────────────────────────────────────
ALTER TABLE lbl_submissions ENABLE ROW LEVEL SECURITY;

-- Public sees approved; owner sees their own (incl. pending/rejected for the
-- rejection_reason); admins see all.
CREATE POLICY "lbl_submissions_read" ON lbl_submissions
  FOR SELECT USING (
    status = 'approved' OR user_id = auth.uid() OR lbl_is_admin()
  );

-- Clients may only ever insert as 'pending'. The trailing checks are the
-- anti-abuse layer (TRD §9): open window, kill switch, account-age floor,
-- daily attempt cap (closes the L0-10 resubmit-flood gap).
CREATE POLICY "lbl_submissions_insert" ON lbl_submissions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND status = 'pending' AND
    lbl_contest_open() AND lbl_submissions_open() AND lbl_account_age_ok() AND
    lbl_submissions_today(auth.uid())
      < coalesce((SELECT (value->>'submission_attempts_per_day')::int
                   FROM lbl_config WHERE key = 'rate_limits'), 3)
  );
-- No UPDATE/DELETE policy for regular users: status transitions (approve/reject)
-- and withdraw go through server routes with the service-role key (TRD §7).

-- ── Likes ────────────────────────────────────────────────────────────────────
ALTER TABLE lbl_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lbl_likes_read" ON lbl_likes
  FOR SELECT USING (true);

CREATE POLICY "lbl_likes_insert" ON lbl_likes
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    lbl_contest_open() AND lbl_account_age_ok() AND
    lbl_likes_today(auth.uid())
      < coalesce((SELECT (value->>'likes_per_day')::int FROM lbl_config WHERE key = 'rate_limits'), 50) AND
    EXISTS (
      SELECT 1 FROM lbl_submissions
      WHERE id = submission_id AND status = 'approved' AND user_id <> auth.uid()  -- L0-07: no self-like
    )
  );

CREATE POLICY "lbl_likes_delete_own" ON lbl_likes
  FOR DELETE USING (user_id = auth.uid());   -- unlike

-- ── Admins ───────────────────────────────────────────────────────────────────
ALTER TABLE lbl_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lbl_admins_read" ON lbl_admins FOR SELECT USING (lbl_is_admin());
-- No insert/update/delete policy: admins seeded manually via SQL editor (TRD §10).

-- ── Config ───────────────────────────────────────────────────────────────────
ALTER TABLE lbl_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lbl_config_public_read" ON lbl_config FOR SELECT USING (true);
-- No write policy: edited manually via SQL editor (close date / kill switch).
