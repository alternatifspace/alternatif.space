-- RLS gaps surfaced while building the mufakat app (checklist section 6).

-- 1. Soft delete has no time limit (M0-05: edits are windowed, deletion is
--    not). The 15-minute edit policy alone made deletion impossible after the
--    window. This policy permits exactly one transition: visible → deleted.
CREATE POLICY "mufakat_comments_author_soft_delete" ON mufakat_comments
  FOR UPDATE USING (
    author_id = auth.uid() AND
    state = 'visible'
  )
  WITH CHECK (state = 'deleted');

-- 2. Admins resolve semantic flags: spin-off execution marks them 'actioned'
--    via the service role, but dismissal happens straight from the queue UI.
CREATE POLICY "mufakat_flags_admin_update" ON mufakat_semantic_flags
  FOR UPDATE USING (is_platform_admin());
