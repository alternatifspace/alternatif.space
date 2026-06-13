# Metabase Analytics Setup Guide

> Prerequisite: Metabase running at `http://localhost:3000` (see `docker-compose.yml` + `.env.metabase`)

## Overview

This guide walks through creating 6 dashboards covering platform health, party activity, deliberation engagement, moderation, and split/spinoff analytics. Each section has ready-to-run SQL queries.

---

## Dashboard 1: Platform Health

### 1.1 Total Users (Metric Card)
**Visualization:** Number
```sql
SELECT count(*) FROM users;
```

### 1.2 New Users Per Week (Bar Chart)
**Visualization:** Bar — x: week, y: count
```sql
SELECT date_trunc('week', created_at) AS week, count(*) AS new_users
FROM users
GROUP BY week
ORDER BY week DESC
LIMIT 12;
```

### 1.3 Active Users (This Week) (Metric Card)
**Visualization:** Number
```sql
SELECT count(*) FROM users WHERE last_active_at >= now() - interval '7 days';
```

### 1.4 Active Users Over Time (Line Chart)
**Visualization:** Line — x: week, y: active users
```sql
SELECT date_trunc('week', last_active_at) AS week, count(*) AS active_users
FROM users
GROUP BY week
ORDER BY week DESC
LIMIT 12;
```

---

## Dashboard 2: Party Analytics

### 2.1 Total Parties (Metric Card)
```sql
SELECT count(*) FROM parties;
```

### 2.2 Parties by Status (Pie Chart)
**Visualization:** Pie — dimension: status, measure: count
```sql
SELECT status, count(*) AS count
FROM parties
GROUP BY status
ORDER BY count DESC;
```

### 2.3 New Parties Per Month (Bar Chart)
```sql
SELECT date_trunc('month', created_at) AS month, count(*) AS new_parties
FROM parties
GROUP BY month
ORDER BY month DESC
LIMIT 12;
```

### 2.4 Total Members Across All Parties (Metric Card)
```sql
SELECT count(*) FROM party_members WHERE status = 'active';
```

### 2.5 Parties Ranked by Member Count (Table/Bar)
```sql
SELECT p.name, p.slug, count(pm.id) AS member_count
FROM parties p
LEFT JOIN party_members pm ON pm.party_id = p.id AND pm.status = 'active'
GROUP BY p.id, p.name, p.slug
ORDER BY member_count DESC
LIMIT 10;
```

### 2.6 Party Applications: Approval Rate (Metric Card)
```sql
SELECT
  count(*) FILTER (WHERE status = 'approved') * 100.0 / nullif(count(*), 0) AS approval_pct
FROM party_applications;
```

### 2.7 Party Applications by Status (Pie Chart)
```sql
SELECT status, count(*) AS count
FROM party_applications
GROUP BY status;
```

### 2.8 Invites Sent vs Used (Metric)
```sql
SELECT
  count(*) AS invites_sent,
  count(*) FILTER (WHERE used_at IS NOT NULL) AS invites_used,
  count(*) FILTER (WHERE used_at IS NOT NULL) * 100.0 / nullif(count(*), 0) AS usage_pct
FROM party_invites;
```

---

## Dashboard 3: Mufakat (Deliberation) Activity

### 3.1 Total Threads (Metric Card)
```sql
SELECT count(*) FROM mufakat_threads WHERE hidden = false;
```

### 3.2 Threads by Status (Pie Chart)
```sql
SELECT status, count(*) AS count
FROM mufakat_threads
WHERE hidden = false
GROUP BY status
ORDER BY count DESC;
```

### 3.3 New Threads Per Week (Bar Chart)
```sql
SELECT date_trunc('week', created_at) AS week, count(*) AS new_threads
FROM mufakat_threads
WHERE hidden = false
GROUP BY week
ORDER BY week DESC
LIMIT 12;
```

### 3.4 Total Comments (Metric Card)
```sql
SELECT count(*) FROM mufakat_comments_public WHERE state = 'visible';
```

### 3.5 Comments Per Week (Line Chart)
```sql
SELECT date_trunc('week', created_at) AS week, count(*) AS comments
FROM mufakat_comments_public
WHERE state = 'visible'
GROUP BY week
ORDER BY week DESC
LIMIT 12;
```

### 3.6 Comments Per Thread (Bar Chart)
```sql
SELECT mt.title, count(mc.id) AS comment_count
FROM mufakat_threads mt
LEFT JOIN mufakat_comments_public mc ON mc.thread_id = mt.id AND mc.state = 'visible'
WHERE mt.hidden = false
GROUP BY mt.id, mt.title
ORDER BY comment_count DESC
LIMIT 10;
```

### 3.7 Community-Raised Threads vs OP Threads (Pie Chart)
```sql
SELECT
  CASE WHEN community_raised THEN 'Community Raised' ELSE 'OP Created' END AS origin,
  count(*) AS count
FROM mufakat_threads
WHERE hidden = false
GROUP BY community_raised;
```

### 3.8 Thread Origin Distribution (Pie Chart)
```sql
SELECT origin, count(*) AS count
FROM mufakat_threads
WHERE hidden = false
GROUP BY origin;
```

### 3.9 Reactions by Type (Pie Chart)
```sql
SELECT type, count(*) AS count
FROM mufakat_reactions
GROUP BY type;
```

### 3.10 Most Reacted Threads (Table)
```sql
SELECT mt.title, count(mr.id) AS reaction_count
FROM mufakat_threads mt
LEFT JOIN mufakat_reactions mr ON mr.thread_id = mt.id
WHERE mt.hidden = false
GROUP BY mt.id, mt.title
ORDER BY reaction_count DESC
LIMIT 10;
```

---

## Dashboard 4: Moderation & Governance

### 4.1 Reports by Category (Pie Chart)
```sql
SELECT category, count(*) AS count
FROM mufakat_reports
GROUP BY category;
```

### 4.2 Reports by Status (Pie Chart)
```sql
SELECT status, count(*) AS count
FROM mufakat_reports
GROUP BY status;
```

### 4.3 Reports Over Time (Bar Chart)
```sql
SELECT date_trunc('week', created_at) AS week, count(*) AS reports
FROM mufakat_reports
GROUP BY week
ORDER BY week DESC
LIMIT 12;
```

### 4.4 Report Resolution Rate (Metric Card)
```sql
SELECT
  count(*) FILTER (WHERE status IN ('dismissed','hidden','escalated')) * 100.0
    / nullif(count(*), 0) AS resolution_pct
FROM mufakat_reports;
```

### 4.5 Report Subjects: Threads vs Comments (Pie Chart)
```sql
SELECT subject_type, count(*) AS count
FROM mufakat_reports
GROUP BY subject_type;
```

### 4.6 Moderation Actions Over Time (Bar Chart)
```sql
SELECT date_trunc('week', created_at) AS week, count(*) AS actions
FROM mufakat_moderation_log
GROUP BY week
ORDER BY week DESC
LIMIT 12;
```

### 4.7 Moderation Actions by Type (Pie Chart)
```sql
SELECT action, count(*) AS count
FROM mufakat_moderation_log
GROUP BY action
ORDER BY count DESC;
```

### 4.8 Semantic Flags Status (Pie Chart)
```sql
SELECT status, count(*) AS count
FROM mufakat_semantic_flags
GROUP BY status;
```

---

## Dashboard 5: Split & Spinoff Analysis

> All analytics in this dashboard use views from `analytics_*` (migration 00010).

### 5.1 Dedup Rate (Metric Card)
```sql
SELECT accepted_rate FROM analytics_dedup_rate;
```

### 5.2 Dedup Accepted vs Total Threads (Number Pair)
```sql
SELECT accepted AS dedup_threads, total_threads FROM analytics_dedup_rate;
```

### 5.3 Split Survival Rate (Metric Card)
```sql
SELECT survival_rate FROM analytics_split_survival;
```

### 5.4 Splits Survived vs Total (Number Pair)
```sql
SELECT survived, total_splits FROM analytics_split_survival;
```

### 5.5 OP Opt-Out Rate (Metric Card)
```sql
SELECT optout_rate FROM analytics_op_optout_rate;
```

### 5.6 OP Opt-Out Details (Number Pair)
```sql
SELECT opted_out, total_splits FROM analytics_op_optout_rate;
```

### 5.7 Split Depth Distribution (Bar Chart)
```sql
SELECT depth, split_count FROM analytics_split_depth ORDER BY depth;
```

### 5.8 Spinoff Lifecycle (Pie Chart)
```sql
SELECT status, thread_count, rate
FROM analytics_spinoff_lifecycle;
```

### 5.9 Flag Conversion Rate (Metric Card)
```sql
SELECT conversion_rate FROM analytics_flag_conversion;
```

### 5.10 Flag Conversion Details (Number Pair)
```sql
SELECT converted, total_flagged FROM analytics_flag_conversion;
```

### 5.11 Good Question Distribution (Bar Chart)
```sql
SELECT reaction_count, comment_count
FROM analytics_good_question_distribution
ORDER BY reaction_count;
```

---

## Dashboard 6: Engagement Overview (Master)

### 6.1 Key Metrics Row (4 Metric Cards side by side)

| Card | SQL |
|------|-----|
| Total Users | `SELECT count(*) FROM users;` |
| Total Parties | `SELECT count(*) FROM parties;` |
| Total Threads | `SELECT count(*) FROM mufakat_threads WHERE hidden = false;` |
| Total Comments | `SELECT count(*) FROM mufakat_comments_public WHERE state = 'visible';` |

### 6.2 Users vs Threads vs Comments Over Time (Multi-series Line Chart)
```sql
SELECT date_trunc('week', created_at) AS week,
       'Users' AS metric,
       count(*) AS value
FROM users GROUP BY week
UNION ALL
SELECT date_trunc('week', created_at) AS week,
       'Threads' AS metric,
       count(*) AS value
FROM mufakat_threads WHERE hidden = false GROUP BY week
UNION ALL
SELECT date_trunc('week', created_at) AS week,
       'Comments' AS metric,
       count(*) AS value
FROM mufakat_comments_public WHERE state = 'visible' GROUP BY week
ORDER BY week DESC
LIMIT 52;
```

### 6.3 Party Status + Thread Status (Side-by-side Pies)

Reuse queries from Dashboards 2.2 and 3.2. Place them next to each other.

### 6.4 Member Engagement Score (Table)
```sql
SELECT u.display_name,
       count(DISTINCT pm.party_id) AS parties_joined,
       count(DISTINCT mc.id) AS comments_made,
       count(DISTINCT mr.id) AS reactions_given,
       (count(DISTINCT mc.id) + count(DISTINCT mr.id)) AS engagement_score
FROM users u
LEFT JOIN party_members pm ON pm.user_id = u.id AND pm.status = 'active'
LEFT JOIN mufakat_comments_public mc ON mc.author_id = u.id AND mc.state = 'visible'
LEFT JOIN mufakat_reactions mr ON mr.user_id = u.id
GROUP BY u.id, u.display_name
ORDER BY engagement_score DESC
LIMIT 20;
```

### 6.5 Comment Depth Distribution (Pie/Bar)
```sql
SELECT depth, count(*) AS count
FROM mufakat_comments_public
WHERE state = 'visible'
GROUP BY depth
ORDER BY depth;
```

---

## Quick Start: How to Add Each Card

For each query above:

1. **New** → **SQL query**
2. Paste the SQL → click **Run** (▶)
3. Click **Visualization** (bottom-left) → pick the chart type
4. Click **Save** → name it, optionally add to a dashboard

To create a dashboard:

1. **New** → **Dashboard** → name it (e.g. "Platform Health")
2. Click **Add** → **Saved question** → select from your saved queries
3. Drag/resize cards to arrange

---

## Shortcut: Import All at Once

If you want a single massive dashboard with everything, create a new dashboard and add all saved questions from sections 1-6.

---

## Tips

- **Date filters:** Add a **Date filter** (`created_at`) to any card so you can slice by time range
- **Auto-refresh:** Set each dashboard to auto-refresh (e.g., every hour) via dashboard settings
- **Drill-through:** Click any bar/slice in a chart to see the underlying rows
- **Alerts:** Set up alerts on key metrics (e.g., "unresolved reports > 10")
