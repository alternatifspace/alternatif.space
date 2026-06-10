-- mufakat RLS policies (TRD §7 v1.3), public comment view, dedup RPC (§9.5)
-- mufakat is the public cross-party space: public read, party-membership-gated write.

ALTER TABLE mufakat_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mufakat_threads_public_read" ON mufakat_threads
  FOR SELECT USING (true);

-- Insert requires active or muted party membership.
-- (Suspended members are read-only platform-wide; muted members post flagless — M0-06.)
CREATE POLICY "mufakat_threads_member_insert" ON mufakat_threads
  FOR INSERT WITH CHECK (
    op_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM party_members
      WHERE user_id = auth.uid() AND status IN ('active', 'muted')
    )
  );

ALTER TABLE mufakat_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mufakat_comments_public_read" ON mufakat_comments
  FOR SELECT USING (true);

CREATE POLICY "mufakat_comments_member_insert" ON mufakat_comments
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM party_members
      WHERE user_id = auth.uid() AND status IN ('active', 'muted')
    ) AND
    EXISTS (
      SELECT 1 FROM mufakat_threads
      WHERE id = thread_id AND status = 'aktif'
    )
  );

CREATE POLICY "mufakat_comments_author_edit_window" ON mufakat_comments
  FOR UPDATE USING (
    author_id = auth.uid() AND
    state = 'visible' AND
    created_at > now() - interval '15 minutes'
  );

ALTER TABLE mufakat_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mufakat_reactions_public_read" ON mufakat_reactions
  FOR SELECT USING (true);

CREATE POLICY "mufakat_reactions_member_insert" ON mufakat_reactions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM party_members
      WHERE user_id = auth.uid() AND status IN ('active', 'muted')
    )
  );

CREATE POLICY "mufakat_reactions_own_delete" ON mufakat_reactions
  FOR DELETE USING (user_id = auth.uid());

ALTER TABLE mufakat_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mufakat_reports_insert" ON mufakat_reports
  FOR INSERT WITH CHECK (reported_by = auth.uid());

CREATE POLICY "mufakat_reports_read" ON mufakat_reports
  FOR SELECT USING (reported_by = auth.uid() OR is_platform_admin());

ALTER TABLE mufakat_semantic_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mufakat_flags_insert" ON mufakat_semantic_flags
  FOR INSERT WITH CHECK (flagged_by = auth.uid());

CREATE POLICY "mufakat_flags_read" ON mufakat_semantic_flags
  FOR SELECT USING (flagged_by = auth.uid() OR is_platform_admin());

-- Splits, markers, moderation log: public read; writes via Edge Functions only
ALTER TABLE mufakat_splits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mufakat_splits_public_read" ON mufakat_splits FOR SELECT USING (true);

ALTER TABLE mufakat_markers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mufakat_markers_public_read" ON mufakat_markers FOR SELECT USING (true);

ALTER TABLE mufakat_moderation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mufakat_modlog_public_read" ON mufakat_moderation_log FOR SELECT USING (true);

-- Hidden/deleted content: rows stay selectable (positional integrity for replies,
-- markers, splits) but raw content of non-visible rows must not leak.
-- Clients read comments ONLY through this view, never the base table (Q12).
CREATE VIEW mufakat_comments_public AS
SELECT
  id, thread_id, author_id, author_party_id, parent_id, depth,
  CASE WHEN state = 'visible' THEN content ELSE NULL END AS content,
  CASE WHEN state = 'visible' THEN html    ELSE NULL END AS html,
  CASE WHEN state = 'moved'
       THEN left(body_text, 200) END        AS moved_excerpt,   -- placeholder card excerpt
  state, moved_to_thread_id, edited_at, created_at
FROM mufakat_comments;

-- Dedup at creation (M0-02, Q8): read-only RPC called as the user types a title.
-- Suggestions are an invitation, never a block. Zero AI, zero external calls.
-- Phase 2 swaps the internals for pgvector without changing the signature (M2-02).
CREATE OR REPLACE FUNCTION search_similar_threads(q text)
RETURNS TABLE (id uuid, slug text, title text, status text, sim real)
LANGUAGE sql STABLE AS $$
  SELECT id, slug, title, status, similarity(title, q) AS sim
  FROM mufakat_threads
  WHERE status <> 'dialihkan'
    AND (similarity(title, q) > 0.3
         OR search_tsv @@ plainto_tsquery('indonesian', q))
  ORDER BY sim DESC
  LIMIT 5;
$$;
