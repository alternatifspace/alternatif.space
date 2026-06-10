# Phase 2 Checklist — Governance Depth + Epistemic Engine

> **Scope:** partai PRD v0.3 Phase 2 + mufakat PRD v0.1 Phase 2, per TRD v1.3  
> **Dependency:** Phase 1 validated — evidence of genuine internal deliberation, 2+ parties using council roles, resolution maps in production.  
> **Build rule:** No Phase 2 tables, functions, or components are built until Phase 1 is validated. Pgvector extension NOT enabled until Phase 2.

---

## 1. Database — Phase 2 Tables *(do not create until Phase 1 validated)*

### Partai Phase 2 Tables (TRD §6)

- [ ] **1.1** `council_roles` table — custom role definitions (name, permission set JSONB, stackability) per party (TRD §6)
- [ ] **1.2** `council_assignments` table — user-to-role mappings, with assigner tracking (TRD §6)
- [ ] **1.3** RLS policies for `council_roles` and `council_assignments` (TRD §7)

### Mufakat Phase 2 Tables (TRD §6)

- [ ] **1.4** Enable `pgvector` extension — `CREATE EXTENSION vector;` (TRD §6)
- [ ] **1.5** `mufakat_thread_embeddings` table — thread embedding vectors (1536-dim), model identifier, update timestamp (TRD §6)

---

## 2. Edge Functions — Phase 2

### Mufakat AI Functions (TRD §10 — not yet specified in detail)

- [ ] **2.1** AI semantic-dispute detection — hybrid model: high-confidence → auto-create spin-off proposal; low-confidence → queue for human review; admin remains executing authority (M2-01)
- [ ] **2.2** AI deduplication — embedding-based similarity (`pgvector`) replaces pg_trgm text matching; same RPC signature as `search_similar_threads()`, internals swapped (M2-02)
- [ ] **2.3** Global knowledge graph query — nodes = `mufakat_threads`, edges = splits ∪ routes ∪ redirects; traverse before split/spin-off creation (M2-03)
- [ ] **2.4** Automated open-question routing — detect threads decomposing toward existing open questions; offer route in-thread (user-confirmable, not silent) (M2-04)
- [ ] **2.5** AI-assisted resolution status — confidence-scored suggestions for Refuted/Integrated/Axiom Stop, human-confirmed; discussions become training/calibration data (M2-05)

### Partai Cross-Platform Functions

- [ ] **2.6** Official position stamp — leader marks one post per thread as party's formal position; visually distinct; stamp is separate object (edits to original don't affect it) (P2-06)
- [ ] **2.7** Party distancing — leader publicly dissociates party from member's post (not a conduct action) (P2-07)
- [ ] **2.8** Party response — formal reply to another party's official stamped position; one per thread per party (P2-08)
- [ ] **2.9** Thread nomination — leader backs thread for simposium advancement; weighted beyond standard upvote (P2-09)

---

## 3. Partai App — Governance Depth & Cross-Platform Powers

### Council Roles (TRD §6, P2-01—P2-03)

- [ ] **3.1** Council enable/configure — leader toggle (if not enabled at creation) + create/modify/delete role definitions (P2-01)
- [ ] **3.2** Role editor — name, permission set (checkboxes), stackability flag (P2-01)
- [ ] **3.3** Modifying active role — permissions of current holder update immediately (P2-01)
- [ ] **3.4** Role appointments — leader assigns; assignment process varies by member-removal config (leader-only / contest window / member vote) (P2-02)
- [ ] **3.5** Empty roles — role with no appointee sits inactive, permissions dormant (P2-02)

### Permission Set (P2-03)

**Internal permissions (delegable via council):**
- [ ] **3.6** Post announcements
- [ ] **3.7** Post position briefs
- [ ] **3.8** Start proposal threads
- [ ] **3.9** Close / archive discussion threads
- [ ] **3.10** Pin posts
- [ ] **3.11** Warn members
- [ ] **3.12** Mute members
- [ ] **3.13** Suspend members
- [ ] **3.14** Approve membership applications
- [ ] **3.15** Remove members

**Cross-platform permissions (delegable):**
- [ ] **3.16** Post official position stamp on mufakat
- [ ] **3.17** Issue party distancing
- [ ] **3.18** Issue party response
- [ ] **3.19** Nominate threads for simposium
- [ ] **3.20** Designate simposium speaker
- [ ] **3.21** Designate simposium observers

**Governance permissions (delegable):**
- [ ] **3.22** Propose manifesto amendments
- [ ] **3.23** Initiate dissolution

**Non-delegable (leader only):**
- [ ] **3.24** Initiate voluntary dissolution
- [ ] **3.25** Transfer leadership voluntarily
- [ ] **3.26** Revoke all council roles
- [ ] **3.27** Create / delete role definitions

### Member Conduct System (P2-04)

- [ ] **3.28** Graduated conduct actions UI — Warning / Mute / Suspension / Removal; authority varies by config (P2-04)
- [ ] **3.29** Mute — member stays in party but mufakat posts no longer carry party flag (`status = 'muted'`) (P2-04)
- [ ] **3.30** Suspension — read-only access to internal discussions (P2-04)
- [ ] **3.31** Appeals — all actions except warnings appealable; logged, visible to all members; leader/council can affirm or reverse (P2-04)

### Minimum Member Thresholds (P2-05)

- [ ] **3.32** Enforce thresholds: 3 for pulse check/internal votes/manifesto amendment; 5 for member removal/dissolution ratification; 10 for recall petition/recall vote

### Cross-Platform Powers (rendered in mufakat) (P2-06—P2-10)

- [ ] **3.33** Official position stamp surface in partai — leader stamps one post per mufakat thread; visually distinct (P2-06)
- [ ] **3.34** Stamp as separate object — edits to original post don't affect stamp; leader can revoke anytime (P2-06)
- [ ] **3.35** Member-vote config path — stamp auto-issues once internal ratification vote passes (P2-06)
- [ ] **3.36** Stamped member leaves party — stamp shows "Official position of [Party] at time of posting" (P2-06)
- [ ] **3.37** Party distancing surface in partai — leader flags member's mufakat post as personal view (P2-07)
- [ ] **3.38** Party response surface in partai — formal reply to another party's stamped position (P2-08)
- [ ] **3.39** Thread nomination surface in partai — leader backs thread for simposium (P2-09)

### Dissolution & Succession (P2-11—P2-13)

- [ ] **3.40** Voluntary dissolution — leader initiates, members ratify (50%+1, minimum 5), party archived publicly (P2-11)
- [ ] **3.41** Deputy leader — designated second-in-command; assumes leader capabilities after 7 days inactivity (caretaker, not permanent) (P2-12)
- [ ] **3.42** Inactive leader handling — activity indicator on public page; caretaker mode after 7 days; dormant badge after 30 days (P2-13)
- [ ] **3.43** Dissolution trigger — 60 days inactivity + no deputy → member vote to appoint new leader or dissolve (P2-13)

---

## 4. Mufakat App — Epistemic Engine

### AI-Assisted Moderation (M2-01)

- [ ] **4.1** AI semantic-dispute flag UI — system-detected semantic hijacks shown in admin queue with confidence score (M2-01)
- [ ] **4.2** High-confidence auto-proposal — admin reviews and confirms; same spin-off execution flow as Phase 0 (M2-01)
- [ ] **4.3** Low-confidence human review — admin evaluates and manually executes spin-off if warranted (M2-01)

### AI Deduplication (M2-02)

- [ ] **4.4** Embedding dedup at creation — pgvector similarity replaces pg_trgm for `search_similar_threads()`; same RPC signature, transparent upgrade (M2-02)
- [ ] **4.5** Embedding dedup at split — split-time dedup uses embeddings; same Phase 0 flow, upgraded internals (M2-02)

### Global Knowledge Graph (M2-03)

- [ ] **4.6** Knowledge graph visualization — nodes = threads, edges = splits ∪ spin-offs ∪ routes ∪ redirects; derived from existing tables, no new write paths (M2-03)
- [ ] **4.7** Pre-creation graph check — before any split/spin-off creates a thread, graph is checked for existing canonical node (M2-03)
- [ ] **4.8** Parallel convergence — definitional debates about same concept across different parent threads automatically detected and surfaced for admin convergence (M2-03)
- [ ] **4.9** AI detection candidates — written into `mufakat_semantic_flags` with synthetic flagger; reuses Phase 0 admin review flow as human-in-the-loop surface (TRD §6)

### Automated Open-Question Routing (M2-04)

- [ ] **4.10** Auto-detection — threads decomposing toward existing open question are detected (M2-04)
- [ ] **4.11** In-thread offer — user-confirmable prompt to route to open question; not silent (M2-04)

### AI-Assisted Resolution Status (M2-05)

- [ ] **4.12** Confidence-scored classification — AI suggests Refuted/Integrated/Axiom Stop per argument (M2-05)
- [ ] **4.13** Human confirmation — admin/OP confirms or overrides AI suggestions (M2-05)
- [ ] **4.14** Calibration feedback loop — platform discussions become training/calibration data (M2-05)

### Partai Cross-Platform Powers (rendered in mufakat) (P2-06—P2-09)

- [ ] **4.15** Official position stamp rendering in mufakat — visually distinct from regular posts; shows party badge + "official position" indicator (P2-06)
- [ ] **4.16** Member-vote stamp rendering — stamp shows ratification status (P2-06)
- [ ] **4.17** Party distancing rendering — flagged post shows "pandangan pribadi, bukan posisi [Party]" indicator (P2-07)
- [ ] **4.18** Party response rendering — formal reply visually distinct from regular replies (P2-08)
- [ ] **4.19** Thread nomination indicator — nominated threads show party backing badge (P2-09)

### Simposium Powers (P2-10)

- [ ] **4.20** Speaker designation — leader nominates who represents party in live session (P2-10)
- [ ] **4.21** Observer designation — marks members as official presence without speaking rights (P2-10)
- [ ] **4.22** Post-session ratification — leader endorses or rejects positions speaker took; logged publicly on party's session record (P2-10)

---

## 5. Analytics (Phase 2)

- [ ] **5.1** AI precision/recall — semantic-dispute detection accuracy, dedup suggestion quality
- [ ] **5.2** Knowledge graph density — average edges per node, convergence rate of parallel debates
- [ ] **5.3** Open-question routing acceptance rate — % of auto-detected routes user-confirmed
- [ ] **5.4** AI-assisted status agreement rate — human vs. AI classification alignment
- [ ] **5.5** Council role utilization — % of parties with active council, avg roles per party
- [ ] **5.6** Cross-platform power usage — official stamps, distancings, responses, nominations per month

---

## 6. Phase 2 Success Criteria (from PRDs)

- [ ] **6.1** 2+ parties using council roles (partai PRD)
- [ ] **6.2** At least 1 official position stamp used on mufakat (partai PRD)
- [ ] **6.3** Platform governance rules being discussed by community (partai PRD)
- [ ] **6.4** Global knowledge graph live and navigable (mufakat PRD)
- [ ] **6.5** AI deduplication measurably outperforms Phase 0 text matching (mufakat PRD)
- [ ] **6.6** Automated open-question routing active with user-confirmation (mufakat PRD)
