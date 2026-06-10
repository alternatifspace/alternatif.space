-- Gaps surfaced while building the partai app (checklist section 5).

-- 1. Party moderation queue (TRD §15, P0-13, checklist 8.1): every new party
--    is manually reviewed before appearing in browse. TRD §6's CHECK omits
--    the 'pending_review' status that §15 queries on — add it. Approval =
--    moderator sets status 'active' from the Supabase dashboard (no custom
--    admin UI for partai Phase 0).
ALTER TABLE parties DROP CONSTRAINT parties_status_check;
ALTER TABLE parties ADD CONSTRAINT parties_status_check
  CHECK (status IN ('pending_review', 'active', 'dormant', 'dissolved'));
ALTER TABLE parties ALTER COLUMN status SET DEFAULT 'pending_review';

-- Tighten the insert policy: founders create their own party and cannot
-- skip the review queue.
DROP POLICY "parties_authenticated_insert" ON parties;
CREATE POLICY "parties_authenticated_insert" ON parties
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    leader_id = auth.uid() AND
    status = 'pending_review'
  );

-- 2. User provisioning (P0-01/P0-02): display_name is collected on the
--    first-login onboarding screen, which a Clerk webhook cannot know —
--    supersedes the webhook note in 00001. Own-row insert only.
CREATE POLICY "users_self_insert" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- 3. Storage buckets (TRD §13): public read; writes scoped to own party
--    (leader uploads the logo; share cards are written by the service role).
INSERT INTO storage.buckets (id, name, public)
VALUES ('party-logos', 'party-logos', true),
       ('party-share-cards', 'party-share-cards', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "party_logos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id IN ('party-logos', 'party-share-cards'));

-- Object path is {party_id}/logo.{ext}; only that party's leader may write.
CREATE POLICY "party_logos_leader_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'party-logos' AND
    EXISTS (
      SELECT 1 FROM parties
      WHERE id::text = (storage.foldername(name))[1]
        AND leader_id = auth.uid()
    )
  );

CREATE POLICY "party_logos_leader_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'party-logos' AND
    EXISTS (
      SELECT 1 FROM parties
      WHERE id::text = (storage.foldername(name))[1]
        AND leader_id = auth.uid()
    )
  );
