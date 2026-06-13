-- analytics — Phase 0 signal board
-- Paste each query into Supabase SQL Editor → "New Report" → pick chart type → pin to dashboard

-- 10.1 — Dedup redirect rate (bar: accepted vs total)
SELECT * FROM analytics_dedup_rate;

-- 10.2 — Good-question reaction distribution (histogram)
SELECT * FROM analytics_good_question_distribution;

-- 10.3 — Split survival rate (gauge: 0–100%)
SELECT * FROM analytics_split_survival;

-- 10.4 — OP opt-out rate (gauge: 0–100%)
SELECT * FROM analytics_op_optout_rate;

-- 10.5 — Split depth distribution (bar chart)
SELECT * FROM analytics_split_depth;

-- 10.6 — Spinoff lifecycle completion (pie: status)
SELECT * FROM analytics_spinoff_lifecycle;

-- 10.7 — Flag → spin-off conversion rate (gauge)
SELECT * FROM analytics_flag_conversion;
