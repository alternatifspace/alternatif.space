-- partai Phase 0 tables (TRD §6) + dormant status trigger (TRD §8)

-- 'pending_review' added to the TRD §6 enum: §15 mandates manual approval for
-- all new parties (moderation queue filters on parties.status = 'pending_review').
CREATE TABLE parties (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  text UNIQUE NOT NULL,
  name                  text NOT NULL,
  tagline               text,
  logo_url              text,
  share_card_url        text,              -- Pre-composed OG share card (Supabase Storage)
  manifesto_content     jsonb,             -- TipTap JSON
  manifesto_html        text,              -- Rendered HTML for display
  current_stance        text,
  status                text DEFAULT 'pending_review'
                          CHECK (status IN ('pending_review', 'active', 'dormant', 'dissolved')),
  governance_config     jsonb NOT NULL,    -- Locked at publish, never updated. No archetype field (Q7).
  council_enabled       boolean DEFAULT false,
  honeymoon_ends_at     timestamptz NOT NULL,
  leader_id             uuid REFERENCES users(id) NOT NULL,
  deputy_id             uuid REFERENCES users(id),
  leader_last_active_at timestamptz DEFAULT now(),
  created_at            timestamptz DEFAULT now(),
  dissolved_at          timestamptz
);

CREATE TABLE party_members (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id   uuid REFERENCES parties(id) NOT NULL,
  user_id    uuid REFERENCES users(id) NOT NULL,
  status     text DEFAULT 'active'
               CHECK (status IN ('active', 'muted', 'suspended', 'removed')),
  joined_at  timestamptz DEFAULT now(),
  UNIQUE (user_id)                        -- enforces one party at a time
);

-- Append-only. Never updated. Never deleted.
CREATE TABLE party_membership_history (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES users(id) NOT NULL,
  party_id     uuid REFERENCES parties(id) NOT NULL,
  joined_at    timestamptz NOT NULL,
  left_at      timestamptz,
  leave_reason text CHECK (leave_reason IN ('voluntary', 'removed', 'dissolved'))
);

CREATE TABLE party_applications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id    uuid REFERENCES parties(id) NOT NULL,
  user_id     uuid REFERENCES users(id) NOT NULL,
  message     text CHECK (char_length(message) <= 500),
  status      text DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES users(id),
  created_at  timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

CREATE TABLE party_invites (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id   uuid REFERENCES parties(id) NOT NULL,
  created_by uuid REFERENCES users(id) NOT NULL,
  token      text UNIQUE NOT NULL,
  used_by    uuid REFERENCES users(id),
  expires_at timestamptz NOT NULL,
  used_at    timestamptz
);

-- Dormant status (TRD §8): trigger handles the real-time case when a leader's
-- activity timestamp updates; daily cron handles leaders who never come back.
-- Implemented as BEFORE UPDATE mutating NEW (the TRD's self-UPDATE form would recurse).
CREATE OR REPLACE FUNCTION update_party_dormant_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.leader_last_active_at < now() - interval '30 days'
     AND NEW.status = 'active' THEN
    NEW.status := 'dormant';
  ELSIF NEW.leader_last_active_at >= now() - interval '30 days'
     AND NEW.status = 'dormant' THEN
    NEW.status := 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER party_dormant_status_trigger
  BEFORE UPDATE OF leader_last_active_at ON parties
  FOR EACH ROW EXECUTE FUNCTION update_party_dormant_status();

-- RLS (TRD §7)
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parties_public_read" ON parties
  FOR SELECT USING (true);

CREATE POLICY "parties_authenticated_insert" ON parties
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "parties_leader_update" ON parties
  FOR UPDATE USING (leader_id = auth.uid());

ALTER TABLE party_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_public_read" ON party_members
  FOR SELECT USING (true);
-- complex member writes go via Edge Functions (service role)

-- History: own rows visible (public profile shows history via profile pages);
-- writes via Edge Functions only.
ALTER TABLE party_membership_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "membership_history_public_read" ON party_membership_history
  FOR SELECT USING (true);

ALTER TABLE party_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applications_own_or_leader_read" ON party_applications
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM parties
      WHERE id = party_applications.party_id AND leader_id = auth.uid()
    )
  );
-- inserts/reviews via Edge Functions (submit-application, review-application)

ALTER TABLE party_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invites_creator_read" ON party_invites
  FOR SELECT USING (created_by = auth.uid());
-- token validation/use via Edge Functions (use-invite-token)
