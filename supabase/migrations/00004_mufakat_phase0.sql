-- mufakat Phase 0 tables (TRD §6 v1.3)
-- All tables prefixed mufakat_ — the database is shared across subdomains.

CREATE TABLE mufakat_threads (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text UNIQUE NOT NULL,
  title            text NOT NULL CHECK (char_length(title) <= 200),
  body_content     jsonb,                   -- TipTap JSON
  body_html        text,                    -- rendered HTML
  body_text        text,                    -- plain text extraction, feeds search_tsv
  op_id            uuid REFERENCES users(id),          -- NULL for community-raised threads
  op_party_id      uuid REFERENCES parties(id),        -- flag at time of posting
  community_raised boolean DEFAULT false,   -- OP-ship declined (M0-09)
  status           text DEFAULT 'aktif'
                     CHECK (status IN ('aktif', 'selesai', 'pertanyaan_terbuka', 'dialihkan')),
  origin           text DEFAULT 'user'
                     CHECK (origin IN ('user', 'split', 'spinoff')),
  parent_thread_id uuid REFERENCES mufakat_threads(id),  -- set for split/spinoff origins
  seed_comment_id  uuid,                    -- FK added after mufakat_comments exists
  redirect_to      uuid REFERENCES mufakat_threads(id),  -- set when status = 'dialihkan'
  closing_summary  jsonb,                   -- TipTap JSON, set when status = 'selesai'
  search_tsv       tsvector GENERATED ALWAYS AS (
                     to_tsvector('indonesian',
                       coalesce(title, '') || ' ' || coalesce(body_text, ''))
                   ) STORED,
  created_at       timestamptz DEFAULT now(),
  closed_at        timestamptz
);

CREATE INDEX mufakat_threads_tsv_idx  ON mufakat_threads USING gin (search_tsv);
CREATE INDEX mufakat_threads_trgm_idx ON mufakat_threads USING gin (title gin_trgm_ops);

CREATE TABLE mufakat_comments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id          uuid REFERENCES mufakat_threads(id) NOT NULL,
  author_id          uuid REFERENCES users(id) NOT NULL,
  author_party_id    uuid REFERENCES parties(id),    -- NULL when author was muted at post time
  parent_id          uuid REFERENCES mufakat_comments(id),
  depth              int NOT NULL DEFAULT 0 CHECK (depth BETWEEN 0 AND 3),
  content            jsonb,                  -- TipTap JSON
  html               text,
  body_text          text,
  state              text DEFAULT 'visible'
                       CHECK (state IN ('visible', 'deleted', 'hidden', 'moved')),
  moved_to_thread_id uuid REFERENCES mufakat_threads(id),  -- set when state = 'moved'
  edited_at          timestamptz,
  created_at         timestamptz DEFAULT now()
);

CREATE INDEX mufakat_comments_thread_idx ON mufakat_comments (thread_id, created_at);

ALTER TABLE mufakat_threads
  ADD CONSTRAINT mufakat_threads_seed_comment_fk
  FOREIGN KEY (seed_comment_id) REFERENCES mufakat_comments(id);

CREATE TABLE mufakat_reactions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES mufakat_comments(id),
  thread_id  uuid REFERENCES mufakat_threads(id),
  user_id    uuid REFERENCES users(id) NOT NULL,
  type       text NOT NULL CHECK (type IN ('setuju', 'pertanyaan_bagus')),
  created_at timestamptz DEFAULT now(),
  CHECK ((comment_id IS NULL) <> (thread_id IS NULL)),   -- exactly one subject
  CHECK (type = 'setuju' OR comment_id IS NOT NULL),     -- pertanyaan_bagus only on comments
  UNIQUE (comment_id, user_id, type),
  UNIQUE (thread_id, user_id, type)
);
-- No downvote type exists, by design (M0-07).

-- Audit record and state machine for every split, spin-off, and dedup reference.
CREATE TABLE mufakat_splits (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type                     text NOT NULL
                             CHECK (type IN ('good_question', 'spinoff', 'dedup_reference')),
  source_thread_id         uuid REFERENCES mufakat_threads(id) NOT NULL,
  source_comment_id        uuid REFERENCES mufakat_comments(id),
  target_thread_id         uuid REFERENCES mufakat_threads(id) NOT NULL,
  reaction_count_at_split  int,
  participants_at_split    int,
  threshold_at_split       int,
  op_status                text DEFAULT 'pending'
                             CHECK (op_status IN ('pending', 'confirmed', 'declined', 'auto_confirmed', 'n_a')),
  op_window_ends_at        timestamptz,         -- now() + 24h for good_question; NULL otherwise
  created_by               uuid REFERENCES users(id),  -- NULL = automatic; admin id for spinoff/merge
  created_at               timestamptz DEFAULT now()
);

-- Inline markers for spin-offs and redirects. Good-question placeholders are
-- NOT markers — they are the seed comment row itself with state = 'moved'.
CREATE TABLE mufakat_markers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id        uuid REFERENCES mufakat_threads(id) NOT NULL,
  after_comment_id uuid REFERENCES mufakat_comments(id),          -- NULL = top of thread
  split_id         uuid REFERENCES mufakat_splits(id) NOT NULL,
  kind             text NOT NULL CHECK (kind IN ('spinoff', 'dedup_reference')),
  label            text,                    -- one-line description of the disputed question
  created_at       timestamptz DEFAULT now()
);
-- No summary_back kind: the summary-back block (M0-15) renders live by joining
-- split_id → target_thread_id and reading status + closing_summary at render time.

CREATE TABLE mufakat_semantic_flags (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES mufakat_comments(id) NOT NULL,  -- head of the flagged chain
  flagged_by uuid REFERENCES users(id) NOT NULL,
  status     text DEFAULT 'pending'
               CHECK (status IN ('pending', 'actioned', 'dismissed')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (comment_id, flagged_by)
);

CREATE TABLE mufakat_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type text NOT NULL CHECK (subject_type IN ('thread', 'comment')),
  subject_id   uuid NOT NULL,
  reported_by  uuid REFERENCES users(id) NOT NULL,
  category     text NOT NULL CHECK (category IN ('sara', 'defamation', 'threat', 'spam')),
  note         text CHECK (char_length(note) <= 500),
  status       text DEFAULT 'pending'
                 CHECK (status IN ('pending', 'dismissed', 'hidden', 'escalated')),
  reviewed_by  uuid REFERENCES users(id),
  created_at   timestamptz DEFAULT now(),
  reviewed_at  timestamptz
);

-- Append-only. Deliberately excludes reporter and moderator identity —
-- the public aggregate view exposes action type + date only.
CREATE TABLE mufakat_moderation_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action       text NOT NULL,
  subject_type text NOT NULL,
  subject_id   uuid NOT NULL,
  created_at   timestamptz DEFAULT now()
);
