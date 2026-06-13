# Phase 1 Checklist — Internal Party Life + Resolution Infrastructure

> **Scope:** partai PRD v0.3 Phase 1 + mufakat PRD v0.1 Phase 1, per TRD v1.3  
> **Dependency:** Phase 0 validated — 5+ active parties with 10+ members, evidence of party flags active in mufakat, at least 1 full split/spin-off lifecycle.  
> **Build rule:** No Phase 1 tables, functions, or components are built until Phase 0 is validated.

---

## 1. Database — Phase 1 Tables *(do not create until Phase 0 validated)*

### Partai Phase 1 Tables (TRD §6)

- [ ] **1.1** `proposals` table — proposal type, status, content (JSONB), voting deadline (TRD §6)
- [ ] **1.2** `votes` table — proposal vote (for/against/keep/remove), unique per user per proposal (TRD §6)
- [ ] **1.3** `petition_signatures` table — recall petition signatures, unique per user per petition (TRD §6)
- [ ] **1.4** `party_posts` table — internal communications (announcements, discussions, direct messages, position briefs, pulse checks), pin/close support (TRD §6)
- [ ] **1.5** RLS policies for `proposals`, `votes`, `petition_signatures`, `party_posts` (TRD §7)
- [ ] **1.6** `party_posts` members-only read policy — must be active member of the party (TRD §7)
- [ ] **1.7** `party_posts` announcements: leader-only insert policy (TRD §7)

### Mufakat Phase 1 Tables (TRD §6)

- [ ] **1.8** `mufakat_argument_statuses` table — argument-level lifecycle (pending/refuted/integrated/axiom_stop/superseded), append-only audit (TRD §6)
- [ ] **1.9** `mufakat_resolution_maps` table — per-thread structured summary: claims/refuted/integrated/axiom stops, living artifact until finalized (TRD §6)
- [ ] **1.10** `mufakat_open_question_routes` table — accumulated paths into open questions, powers most-routed-to sort (TRD §6)
- [ ] **1.11** `mufakat_summary_disputes` table — formal challenge to summary-back or resolution map; partial unique index: one active dispute per user per thread (TRD §6)
- [ ] **1.12** RLS policies for all mufakat Phase 1 tables (TRD §7)

---

## 2. Edge Functions — Phase 1

### Partai Governance Functions (TRD §10)

- [ ] **2.1** `cast-vote` — inserts vote, checks if threshold now met, if so closes proposal and executes outcome atomically (manifesto update, leadership transfer, etc.) (TRD §10)
- [ ] **2.2** `sign-petition` — inserts petition signature, checks if threshold met, if so auto-creates recall vote proposal (TRD §10)
- [ ] **2.3** `close-expired-proposals` — every 15 minutes cron: tallies results on proposals past `voting_ends_at`, updates status, executes outcome (TRD §10)
- [ ] **2.4** `send-push-notification` — looks up user's `push_subscriptions`, dispatches via FCM (Android), APNs (iOS), or Web Push (browser fallback) (TRD §10)

### Mufakat Resolution Functions (TRD §10)

- [ ] **2.5** `mufakat-set-argument-status` — admin/OP assigns argument lifecycle status (refuted/integrated/axiom_stop/superseded); appends to `mufakat_argument_statuses` (M1-01)
- [ ] **2.6** `mufakat-route-open-question` — admin routes stalled thread to existing open question; inserts into `mufakat_open_question_routes` (M1-04)
- [ ] **2.7** `mufakat-dispute-summary` — user disputes a summary-back block or resolution map entry; inserts into `mufakat_summary_disputes`, throttled to one active per user per thread (M1-05)

---

## 3. GitHub Actions (extend existing `maintenance.yml`)

- [ ] **3.1** `close-expired-proposals` cron job — every 15 minutes, `curl` to Supabase Edge Function (TRD §10)

---

## 4. Partai App — Internal Party Life

### Internal Communications (Layer 1)

- [ ] **4.1** `/dashboard` — party dashboard: hub for announcements, discussions, governance (TRD §11)
- [ ] **4.2** `/dashboard/pengumuman` — announcement feed: one-way leader broadcast, pinned at top, never replyable, always triggers notification (P1-01)
- [ ] **4.3** `/dashboard/diskusi` — discussion threads: members read all; Vanguard/Republic: leader opens, members reply; Commune: any member opens (P1-02)
- [ ] **4.4** Discussion thread actions — leader can pin (max 3), close, mark "leading to a vote" (P1-02)
- [ ] **4.5** Closed threads — read-only, not deleted (P1-02)
- [ ] **4.6** Discussion notifications — only active participants notified of new replies (P1-02)
- [ ] **4.7** Direct message to all — personal-register leader broadcast, distinct visual tone from announcements, always triggers notification, not replyable (P1-03)
- [ ] **4.8** Position brief — structured internal doc (stance, key arguments, what to avoid), leader or delegated role, medium-urgency notification, members only (P1-04)
- [ ] **4.9** Notification centre — in-app list with weighted urgency: Announcements/Pulse Checks/Direct Messages (high), Position Briefs (medium), Discussion replies (low) (P1-05)
- [ ] **4.10** Leader dashboard — "notifications sent this week" count as soft nudge against over-notification (P1-05)

### Governance Mechanics (Layer 2)

- [ ] **4.11** `/dashboard/tata-kelola` — governance hub: votes, petitions, proposals (TRD §11)
- [ ] **4.12** Pulse check — lightweight informal poll: question + 2–5 options + optional deadline; leader creates; minimum 3 members (P1-06)
- [ ] **4.13** Pulse check result visibility — follows governance config: high-recall → internal only; mid → leader's choice; low-recall → always public (P1-06)
- [ ] **4.14** Manifesto amendment vote — leader proposes edit (diff view using `diff-match-patch`), members vote For/Against, passes at 50%+1 or configured threshold, minimum 3 members (P1-07)
- [ ] **4.15** Manifesto diff rendering — `diff-match-patch` on plain text extracted from TipTap JSON; "lihat versi lengkap" toggle switches to side-by-side view (TRD §11, Q3)
- [ ] **4.16** Recall petition — any member initiates, members sign (configured % threshold), blocked during 3-month honeymoon, live signature counter visible (P1-08)
- [ ] **4.17** Honeymoon block — blocked state shown clearly if recall attempted during honeymoon (P1-08)
- [ ] **4.18** Recall vote — auto-triggered on petition threshold, time-bound (72h default), members vote Remove/Keep, passes at configured threshold (50%+1 to 75%), minimum 10 members (P1-09)
- [ ] **4.19** Recall outcome — on pass: leader removed, deputy becomes caretaker (7 days), then election or dissolution; on fail: petition archived, 30-day cooldown; outcome published publicly (P1-09)
- [ ] **4.20** Name & logo ratification — post-honeymoon: leader proposes change → member vote (50%+1); exception: Vanguard config → leader can always edit freely (P1-10)

### Push Notifications

- [ ] **4.21** Push notification delivery — FCM (Android), APNs (iOS), Web Push (browser fallback) via `send-push-notification` edge function (TRD §12)
- [ ] **4.22** Push subscription management — user registers/unregisters device tokens in `push_subscriptions` table (TRD §12)

---

## 5. Mufakat App — Resolution Infrastructure

### Full Resolution Statuses

- [ ] **5.1** Argument-level lifecycle UI — admin/OP assigns status: Pending / Refuted / Integrated / Axiom Stop / Superseded per comment (M1-01)
- [ ] **5.2** Thread status auto-rollup — argument statuses roll up to thread status; Phase 0 statuses map forward (aktif→Pending, selesai→Integrated, pertanyaan_terbuka→Axiom Stop) (M1-01)

### Resolution Map

- [ ] **5.3** Resolution map component — per-thread structured summary: what was claimed, refuted, integrated, where axiom stops are (M1-02)
- [ ] **5.4** Living artifact — generated in real time, finalized when thread reaches `selesai` (M1-02)
- [ ] **5.5** Inherited by late participants — shown above comment box: "Sebelum kamu masuk — ini yang sudah terjadi." (M1-02)

### Open Questions Surface

- [ ] **5.6** `/pertanyaan-terbuka` — dedicated page listing all `pertanyaan_terbuka` threads (M1-03)
- [ ] **5.7** Open question entry — shows: the question, every parent thread that led to it (accumulated paths), participant count, dormancy duration (M1-03)
- [ ] **5.8** Sort by most-routed-to — platform's first visible hint of question-extraction layer, framed as "pertanyaan yang belum terjawab" (M1-03)

### Manual Routing

- [ ] **5.9** Route-to-open-question action — admin links stalled thread to existing open question; stalled thread receives reference block; open question gains new path entry (M1-04)

### Summary Dispute

- [ ] **5.10** Dispute flow — formal challenge to summary-back block or resolution map entry; reopens source thread from `selesai` to `aktif` if upheld (M1-05)
- [ ] **5.11** Throttle — one active challenge per user per thread; partial unique index enforced (M1-05)

---

## 6. Analytics (Phase 1)

- [ ] **6.1** Resolution map generation rate — % of closed threads with complete maps
- [ ] **6.2** Argument status distribution — refuted vs. integrated vs. axiom stop ratios
- [ ] **6.3** Open questions surface traffic — organic discovery of `/pertanyaan-terbuka`
- [ ] **6.4** Route accumulation — open questions with 2+ independent parent threads
- [ ] **6.5** Summary dispute rate — upheld vs. rejected vs. density
- [ ] **6.6** Average session length increase (Phase 1 success criteria)
- [ ] **6.7** Landing analytics (from www W-Q3, resolved 2026-06-13: launch blind) — pick tooling, then measure visitor → signup conversion and bounce rate against www PRD success criteria

---

## 7. Phase 1 Success Criteria (from PRDs)

- [ ] **7.1** 3+ parties completing a full internal vote (manifesto amendment or pulse check) (partai PRD)
- [ ] **7.2** 5+ threads carrying full resolution maps (mufakat PRD)
- [ ] **7.3** `/pertanyaan-terbuka` receiving organic traffic (mufakat PRD)
- [ ] **7.4** At least 1 open question accumulating routes from 2+ independent parent threads (mufakat PRD)
- [ ] **7.5** Average session length increases across both apps (partai PRD)
