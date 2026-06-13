-- Analytics signals for Phase 0 (Mufakat PRD Appendix B).
-- Tracked from day one to inform threshold tuning and the Phase 1/2 build case.
-- All views are read-only and public — no RLS needed for aggregate stats.

begin;

-- ──────────────────────────────────────────────────────────
-- 10.1 — Dedup suggestion shown → accepted rate
--   When a user creates a thread after seeing dedup suggestions,
--   did they redirect to an existing thread or create a new one?
--   Approximated by: threads with origin='dedup_reference' vs total threads.
--   More precise tracking would require a dedicated event table; this
--   gives a reasonable baseline from the splits table.
-- ──────────────────────────────────────────────────────────
create or replace view analytics_dedup_rate as
select
  count(*) filter (where origin = 'dedup_reference')::float
    / nullif(count(*), 0) as accepted_rate,
  count(*) filter (where origin = 'dedup_reference') as accepted,
  count(*) as total_threads
from mufakat_threads
where origin in ('user', 'dedup_reference');

-- ──────────────────────────────────────────────────────────
-- 10.2 — Good-question reactions per comment distribution
--   Histogram of reaction counts, used to validate the floor of 5
--   in the split threshold formula.
-- ──────────────────────────────────────────────────────────
create or replace view analytics_good_question_distribution as
select
  reaction_count,
  count(*) as comment_count
from (
  select
    comment_id,
    count(*) as reaction_count
  from mufakat_reactions
  where type = 'pertanyaan_bagus'
  group by comment_id
) sub
group by reaction_count
order by reaction_count;

-- ──────────────────────────────────────────────────────────
-- 10.3 — Split survival rate
--   % of split-originated threads that reach 5+ comments.
-- ──────────────────────────────────────────────────────────
create or replace view analytics_split_survival as
with split_threads as (
  select t.id, t.slug, t.status, t.origin
  from mufakat_threads t
  where t.origin in ('split', 'spinoff')
),
comment_counts as (
  select
    st.id,
    st.slug,
    st.status,
    st.origin,
    count(c.id) as comment_count
  from split_threads st
  left join mufakat_comments c on c.thread_id = st.id and c.state = 'visible'
  group by st.id, st.slug, st.status, st.origin
)
select
  count(*) filter (where comment_count >= 5)::float
    / nullif(count(*), 0) as survival_rate,
  count(*) filter (where comment_count >= 5) as survived,
  count(*) as total_splits
from comment_counts;

-- ──────────────────────────────────────────────────────────
-- 10.4 — OP opt-out rate
--   % of splits where the OP declined (community_raised = true).
-- ──────────────────────────────────────────────────────────
create or replace view analytics_op_optout_rate as
select
  count(*) filter (where community_raised)::float
    / nullif(count(*), 0) as optout_rate,
  count(*) filter (where community_raised) as opted_out,
  count(*) as total_splits
from mufakat_threads
where origin in ('split', 'spinoff');

-- ──────────────────────────────────────────────────────────
-- 10.5 — Split depth distribution
--   How deeply nested the split chain goes. Recursive query follows
--   source_thread_id → target_thread_id chains. Watches for D3
--   pathology (Decision 3).
-- ──────────────────────────────────────────────────────────
create or replace view analytics_split_depth as
with recursive split_chain as (
  -- base: splits where the source thread itself is not a split target
  select
    s.id as split_id,
    s.type,
    s.source_thread_id,
    s.target_thread_id,
    0 as depth
  from mufakat_splits s
  where not exists (
    select 1 from mufakat_splits s2
    where s2.target_thread_id = s.source_thread_id
  )

  union all

  select
    s.id,
    s.type,
    s.source_thread_id,
    s.target_thread_id,
    sc.depth + 1
  from mufakat_splits s
  join split_chain sc on sc.target_thread_id = s.source_thread_id
  where sc.depth < 10  -- safety limit
)
select
  depth,
  count(*) as split_count
from split_chain
group by depth
order by depth;

-- ──────────────────────────────────────────────────────────
-- 10.6 — Spin-off lifecycle completion rate
--   Breakout of split-originated threads by status:
--   selesai vs. pertanyaan_terbuka vs. abandoned (still aktif).
-- ──────────────────────────────────────────────────────────
create or replace view analytics_spinoff_lifecycle as
select
  status,
  count(*) as thread_count,
  count(*)::float / nullif(sum(count(*)) over (), 0) as rate
from mufakat_threads
where origin in ('split', 'spinoff')
group by status
order by
  case status
    when 'selesai' then 1
    when 'pertanyaan_terbuka' then 2
    when 'aktif' then 3
    when 'dialihkan' then 4
  end;

-- ──────────────────────────────────────────────────────────
-- 10.7 — Flag → spin-off conversion rate
--   How many semantic-flag groups result in an admin spin-off.
--   Groups flags by comment_id → checks if a spinoff split exists
--   with that comment as seed. Baseline for future AI detection.
-- ──────────────────────────────────────────────────────────
create or replace view analytics_flag_conversion as
with flagged_comments as (
  select distinct comment_id
  from mufakat_semantic_flags
),
converted as (
  select distinct s.source_comment_id
  from mufakat_splits s
  where s.type = 'spinoff'
)
select
  count(*) filter (where c.source_comment_id is not null)::float
    / nullif(count(*), 0) as conversion_rate,
  count(*) filter (where c.source_comment_id is not null) as converted,
  count(*) as total_flagged
from flagged_comments f
left join converted c on c.source_comment_id = f.comment_id;

commit;
