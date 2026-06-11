-- Clerk-compatible user IDs (supersedes the uuid assumption in 00001/TRD §5).
--
-- Clerk reserves the JWT `sub` claim: it is always the Clerk user ID
-- (`user_…`, not a UUID), and JWT templates cannot override it. Supabase's
-- auth.uid() casts `sub` to uuid and would error on every RLS check. The
-- documented Clerk+Supabase pattern is text user IDs compared against
-- auth.jwt()->>'sub' — this migration converts to it. App code and Edge
-- Functions already pass Clerk IDs around, so they need no changes.

-- 1. Helper: Clerk user id from the JWT (replaces auth.uid() in policies).
CREATE OR REPLACE FUNCTION clerk_uid()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT nullif(auth.jwt()->>'sub', '')
$$;

-- 2. Drop policies that reference user-id columns or auth.uid()
--    (public-read policies don't reference these columns and stay).
DROP POLICY IF EXISTS "users_own_update" ON users;
DROP POLICY IF EXISTS "users_self_insert" ON users;
DROP POLICY IF EXISTS "parties_authenticated_insert" ON parties;
DROP POLICY IF EXISTS "parties_leader_update" ON parties;
DROP POLICY IF EXISTS "applications_own_or_leader_read" ON party_applications;
DROP POLICY IF EXISTS "invites_creator_read" ON party_invites;
DROP POLICY IF EXISTS "notifications_own_read" ON notifications;
DROP POLICY IF EXISTS "notifications_own_mark_read" ON notifications;
DROP POLICY IF EXISTS "push_subscriptions_own_all" ON push_subscriptions;
DROP POLICY IF EXISTS "mufakat_threads_member_insert" ON mufakat_threads;
DROP POLICY IF EXISTS "mufakat_comments_member_insert" ON mufakat_comments;
DROP POLICY IF EXISTS "mufakat_comments_author_edit_window" ON mufakat_comments;
DROP POLICY IF EXISTS "mufakat_comments_author_soft_delete" ON mufakat_comments;
DROP POLICY IF EXISTS "mufakat_reactions_member_insert" ON mufakat_reactions;
DROP POLICY IF EXISTS "mufakat_reactions_own_delete" ON mufakat_reactions;
DROP POLICY IF EXISTS "mufakat_reports_insert" ON mufakat_reports;
DROP POLICY IF EXISTS "mufakat_reports_read" ON mufakat_reports;
DROP POLICY IF EXISTS "mufakat_flags_insert" ON mufakat_semantic_flags;
DROP POLICY IF EXISTS "mufakat_flags_read" ON mufakat_semantic_flags;
DROP POLICY IF EXISTS "party_logos_leader_write" ON storage.objects;
DROP POLICY IF EXISTS "party_logos_leader_update" ON storage.objects;

-- 3. The public comments view depends on author_id; recreated in step 8.
DROP VIEW IF EXISTS mufakat_comments_public;

-- 4. Drop FKs onto users(id) so the column types can change.
ALTER TABLE platform_admins          DROP CONSTRAINT IF EXISTS platform_admins_user_id_fkey;
ALTER TABLE parties                  DROP CONSTRAINT IF EXISTS parties_leader_id_fkey;
ALTER TABLE parties                  DROP CONSTRAINT IF EXISTS parties_deputy_id_fkey;
ALTER TABLE party_members            DROP CONSTRAINT IF EXISTS party_members_user_id_fkey;
ALTER TABLE party_membership_history DROP CONSTRAINT IF EXISTS party_membership_history_user_id_fkey;
ALTER TABLE party_applications       DROP CONSTRAINT IF EXISTS party_applications_user_id_fkey;
ALTER TABLE party_applications       DROP CONSTRAINT IF EXISTS party_applications_reviewed_by_fkey;
ALTER TABLE party_invites            DROP CONSTRAINT IF EXISTS party_invites_created_by_fkey;
ALTER TABLE party_invites            DROP CONSTRAINT IF EXISTS party_invites_used_by_fkey;
ALTER TABLE notifications            DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE push_subscriptions       DROP CONSTRAINT IF EXISTS push_subscriptions_user_id_fkey;
ALTER TABLE mufakat_threads          DROP CONSTRAINT IF EXISTS mufakat_threads_op_id_fkey;
ALTER TABLE mufakat_comments         DROP CONSTRAINT IF EXISTS mufakat_comments_author_id_fkey;
ALTER TABLE mufakat_reactions        DROP CONSTRAINT IF EXISTS mufakat_reactions_user_id_fkey;
ALTER TABLE mufakat_splits           DROP CONSTRAINT IF EXISTS mufakat_splits_created_by_fkey;
ALTER TABLE mufakat_semantic_flags   DROP CONSTRAINT IF EXISTS mufakat_semantic_flags_flagged_by_fkey;
ALTER TABLE mufakat_reports          DROP CONSTRAINT IF EXISTS mufakat_reports_reported_by_fkey;
ALTER TABLE mufakat_reports          DROP CONSTRAINT IF EXISTS mufakat_reports_reviewed_by_fkey;

-- 5. Convert every user-id column to text.
ALTER TABLE users                    ALTER COLUMN id          TYPE text;
ALTER TABLE platform_admins          ALTER COLUMN user_id     TYPE text;
ALTER TABLE parties                  ALTER COLUMN leader_id   TYPE text;
ALTER TABLE parties                  ALTER COLUMN deputy_id   TYPE text;
ALTER TABLE party_members            ALTER COLUMN user_id     TYPE text;
ALTER TABLE party_membership_history ALTER COLUMN user_id     TYPE text;
ALTER TABLE party_applications       ALTER COLUMN user_id     TYPE text;
ALTER TABLE party_applications       ALTER COLUMN reviewed_by TYPE text;
ALTER TABLE party_invites            ALTER COLUMN created_by  TYPE text;
ALTER TABLE party_invites            ALTER COLUMN used_by     TYPE text;
ALTER TABLE notifications            ALTER COLUMN user_id     TYPE text;
ALTER TABLE push_subscriptions       ALTER COLUMN user_id     TYPE text;
ALTER TABLE mufakat_threads          ALTER COLUMN op_id       TYPE text;
ALTER TABLE mufakat_comments         ALTER COLUMN author_id   TYPE text;
ALTER TABLE mufakat_reactions        ALTER COLUMN user_id     TYPE text;
ALTER TABLE mufakat_splits           ALTER COLUMN created_by  TYPE text;
ALTER TABLE mufakat_semantic_flags   ALTER COLUMN flagged_by  TYPE text;
ALTER TABLE mufakat_reports          ALTER COLUMN reported_by TYPE text;
ALTER TABLE mufakat_reports          ALTER COLUMN reviewed_by TYPE text;

-- 6. Re-add the FKs.
ALTER TABLE platform_admins          ADD CONSTRAINT platform_admins_user_id_fkey          FOREIGN KEY (user_id)     REFERENCES users(id);
ALTER TABLE parties                  ADD CONSTRAINT parties_leader_id_fkey                FOREIGN KEY (leader_id)   REFERENCES users(id);
ALTER TABLE parties                  ADD CONSTRAINT parties_deputy_id_fkey                FOREIGN KEY (deputy_id)   REFERENCES users(id);
ALTER TABLE party_members            ADD CONSTRAINT party_members_user_id_fkey            FOREIGN KEY (user_id)     REFERENCES users(id);
ALTER TABLE party_membership_history ADD CONSTRAINT party_membership_history_user_id_fkey FOREIGN KEY (user_id)     REFERENCES users(id);
ALTER TABLE party_applications       ADD CONSTRAINT party_applications_user_id_fkey       FOREIGN KEY (user_id)     REFERENCES users(id);
ALTER TABLE party_applications       ADD CONSTRAINT party_applications_reviewed_by_fkey   FOREIGN KEY (reviewed_by) REFERENCES users(id);
ALTER TABLE party_invites            ADD CONSTRAINT party_invites_created_by_fkey         FOREIGN KEY (created_by)  REFERENCES users(id);
ALTER TABLE party_invites            ADD CONSTRAINT party_invites_used_by_fkey            FOREIGN KEY (used_by)     REFERENCES users(id);
ALTER TABLE notifications            ADD CONSTRAINT notifications_user_id_fkey            FOREIGN KEY (user_id)     REFERENCES users(id);
ALTER TABLE push_subscriptions       ADD CONSTRAINT push_subscriptions_user_id_fkey       FOREIGN KEY (user_id)     REFERENCES users(id);
ALTER TABLE mufakat_threads          ADD CONSTRAINT mufakat_threads_op_id_fkey            FOREIGN KEY (op_id)       REFERENCES users(id);
ALTER TABLE mufakat_comments         ADD CONSTRAINT mufakat_comments_author_id_fkey       FOREIGN KEY (author_id)   REFERENCES users(id);
ALTER TABLE mufakat_reactions        ADD CONSTRAINT mufakat_reactions_user_id_fkey        FOREIGN KEY (user_id)     REFERENCES users(id);
ALTER TABLE mufakat_splits           ADD CONSTRAINT mufakat_splits_created_by_fkey        FOREIGN KEY (created_by)  REFERENCES users(id);
ALTER TABLE mufakat_semantic_flags   ADD CONSTRAINT mufakat_semantic_flags_flagged_by_fkey FOREIGN KEY (flagged_by) REFERENCES users(id);
ALTER TABLE mufakat_reports          ADD CONSTRAINT mufakat_reports_reported_by_fkey      FOREIGN KEY (reported_by) REFERENCES users(id);
ALTER TABLE mufakat_reports          ADD CONSTRAINT mufakat_reports_reviewed_by_fkey      FOREIGN KEY (reviewed_by) REFERENCES users(id);

-- 7. is_platform_admin: same signature, Clerk-id comparison (dependent
--    policies keep working without being dropped).
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM platform_admins WHERE user_id = clerk_uid());
$$;

-- 8. Recreate the public comments view (definition unchanged from 00005).
CREATE VIEW mufakat_comments_public AS
SELECT
  id, thread_id, author_id, author_party_id, parent_id, depth,
  CASE WHEN state = 'visible' THEN content ELSE NULL END AS content,
  CASE WHEN state = 'visible' THEN html    ELSE NULL END AS html,
  CASE WHEN state = 'moved'
       THEN left(body_text, 200) END        AS moved_excerpt,
  state, moved_to_thread_id, edited_at, created_at
FROM mufakat_comments;

-- 9. Recreate the policies, auth.uid() → clerk_uid().
CREATE POLICY "users_own_update" ON users
  FOR UPDATE USING (id = clerk_uid());

CREATE POLICY "users_self_insert" ON users
  FOR INSERT WITH CHECK (id = clerk_uid());

CREATE POLICY "parties_authenticated_insert" ON parties
  FOR INSERT WITH CHECK (
    clerk_uid() IS NOT NULL AND
    leader_id = clerk_uid() AND
    status = 'pending_review'
  );

CREATE POLICY "parties_leader_update" ON parties
  FOR UPDATE USING (leader_id = clerk_uid());

CREATE POLICY "applications_own_or_leader_read" ON party_applications
  FOR SELECT USING (
    user_id = clerk_uid() OR
    EXISTS (
      SELECT 1 FROM parties
      WHERE id = party_applications.party_id AND leader_id = clerk_uid()
    )
  );

CREATE POLICY "invites_creator_read" ON party_invites
  FOR SELECT USING (created_by = clerk_uid());

CREATE POLICY "notifications_own_read" ON notifications
  FOR SELECT USING (user_id = clerk_uid());

CREATE POLICY "notifications_own_mark_read" ON notifications
  FOR UPDATE USING (user_id = clerk_uid());

CREATE POLICY "push_subscriptions_own_all" ON push_subscriptions
  FOR ALL USING (user_id = clerk_uid()) WITH CHECK (user_id = clerk_uid());

CREATE POLICY "mufakat_threads_member_insert" ON mufakat_threads
  FOR INSERT WITH CHECK (
    op_id = clerk_uid() AND
    EXISTS (
      SELECT 1 FROM party_members
      WHERE user_id = clerk_uid() AND status IN ('active', 'muted')
    )
  );

CREATE POLICY "mufakat_comments_member_insert" ON mufakat_comments
  FOR INSERT WITH CHECK (
    author_id = clerk_uid() AND
    EXISTS (
      SELECT 1 FROM party_members
      WHERE user_id = clerk_uid() AND status IN ('active', 'muted')
    ) AND
    EXISTS (
      SELECT 1 FROM mufakat_threads
      WHERE id = thread_id AND status = 'aktif'
    )
  );

CREATE POLICY "mufakat_comments_author_edit_window" ON mufakat_comments
  FOR UPDATE USING (
    author_id = clerk_uid() AND
    state = 'visible' AND
    created_at > now() - interval '15 minutes'
  );

CREATE POLICY "mufakat_comments_author_soft_delete" ON mufakat_comments
  FOR UPDATE USING (
    author_id = clerk_uid() AND
    state = 'visible'
  )
  WITH CHECK (state = 'deleted');

CREATE POLICY "mufakat_reactions_member_insert" ON mufakat_reactions
  FOR INSERT WITH CHECK (
    user_id = clerk_uid() AND
    EXISTS (
      SELECT 1 FROM party_members
      WHERE user_id = clerk_uid() AND status IN ('active', 'muted')
    )
  );

CREATE POLICY "mufakat_reactions_own_delete" ON mufakat_reactions
  FOR DELETE USING (user_id = clerk_uid());

CREATE POLICY "mufakat_reports_insert" ON mufakat_reports
  FOR INSERT WITH CHECK (reported_by = clerk_uid());

CREATE POLICY "mufakat_reports_read" ON mufakat_reports
  FOR SELECT USING (reported_by = clerk_uid() OR is_platform_admin());

CREATE POLICY "mufakat_flags_insert" ON mufakat_semantic_flags
  FOR INSERT WITH CHECK (flagged_by = clerk_uid());

CREATE POLICY "mufakat_flags_read" ON mufakat_semantic_flags
  FOR SELECT USING (flagged_by = clerk_uid() OR is_platform_admin());

CREATE POLICY "party_logos_leader_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'party-logos' AND
    EXISTS (
      SELECT 1 FROM parties
      WHERE id::text = (storage.foldername(name))[1]
        AND leader_id = clerk_uid()
    )
  );

CREATE POLICY "party_logos_leader_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'party-logos' AND
    EXISTS (
      SELECT 1 FROM parties
      WHERE id::text = (storage.foldername(name))[1]
        AND leader_id = clerk_uid()
    )
  );
