-- Thread-level hide (M0-16, TRD §15: admin actions are dismiss / hide / escalate
-- on threads AND comments; the moderation log schema in TRD §6 names the
-- 'hide_thread' action). TRD v1.3 defines no state column on mufakat_threads —
-- this column closes that gap with the minimum surface. Render rule mirrors
-- hidden comments: title/body replaced with "[disembunyikan moderator]",
-- structure (slug, markers, redirects) preserved.

ALTER TABLE mufakat_threads ADD COLUMN hidden boolean NOT NULL DEFAULT false;

-- A hidden thread is never a dedup destination — neither at creation (M0-02)
-- nor at split time (M0-09). Same signature, Phase 2 swap unaffected (M2-02).
CREATE OR REPLACE FUNCTION search_similar_threads(q text)
RETURNS TABLE (id uuid, slug text, title text, status text, sim real)
LANGUAGE sql STABLE AS $$
  SELECT id, slug, title, status, similarity(title, q) AS sim
  FROM mufakat_threads
  WHERE status <> 'dialihkan'
    AND NOT hidden
    AND (similarity(title, q) > 0.3
         OR search_tsv @@ plainto_tsquery('indonesian', q))
  ORDER BY sim DESC
  LIMIT 5;
$$;
