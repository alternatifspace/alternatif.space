# mufakat.alternatif.space — Product Requirements Document
**Version:** 0.1 | **Date:** June 2026 | **Status:** Draft

---

## Changelog

### v0.1 — June 2026
Initial draft. Built on "Mufakat — Background Problem & Design Foundation." Incorporates five resolved design decisions (see Appendix A), including a correction to the design foundation doc: the spin-off principle is **"Move, leave a scar"** — the previously written "Copy, don't move" contradicted the spin-off mechanic description and is superseded.

---

## Overview

mufakat.alternatif.space is the cross-party written deliberation space of Alternatif Space. It is where party membership becomes meaningful — the ideological flag earned on partai is worn here, in the room with other flags.

mufakat's structural commitments distinguish it from generic forums:

1. **One canonical thread per topic.** Every question has exactly one home. Duplication is the platform's most fundamental enemy.
2. **Resolution artifacts.** Discussions produce records of what was argued, agreed, and contested — not just abandoned scrollback.
3. **Spin-offs over hijacks.** Semantic disputes and emergent questions get their own canonical threads instead of drowning the original.
4. **Unresolved is first-class.** Open questions are valuable output, not failure states.

The deeper purpose — extracting the genuinely unanswered questions underneath Indonesian disagreement — is architectural, not promotional. It is never surfaced as branding, onboarding copy, or marketing. Users experience a journey toward answers; the platform quietly maps unresolved terrain.

This PRD covers three build phases. Phase 0 is the MVP and launches jointly with partai (firm dependency — see partai PRD v0.3). Phases 1 and 2 follow once the previous phase is validated.

---

## Phase 0 — Canonical Discussion

**Goal:** Party members can open canonical threads, deliberate across party lines with visible flags, and experience the first structural mechanics: deduplication at creation, the good-question split, and admin-driven spin-offs.

**Launch dependency:** mufakat and partai launch together as a single unit. Party membership without a discussion space produces immediate churn; a discussion space without party flags is just another forum.

**Degraded-mode principle:** Phase 0 mechanics must function at 100-user scale. AI detection is deferred entirely; everything AI will eventually do is done in Phase 0 by admins and users. Thresholds are dynamic, never fixed (see M0-08).

**Success criteria:** Shared with partai PRD v0.3 Phase 0 (100 users across both subdomains, 5 active parties), plus mufakat-specific: 10+ canonical threads with cross-party participation, at least 1 successful good-question split, at least 1 admin-initiated spin-off completing its lifecycle, evidence that deduplication-at-creation redirected at least some duplicate attempts.

---

### 1. Threads

**M0-01 — Canonical thread creation**
- Any party member can create a thread (party membership required — enforced platform-wide)
- Title (required, max 200 chars) + body (TipTap rich text, same supported formats as partai manifesto editor: H2, H3, bold, italic, bullet, numbered, blockquote)
- No image embeds in MVP
- No mandatory tagging or claim taxonomy at submission (design principle: structure through experience, not rules)
- Auto-save draft

**M0-02 — Deduplication at creation**
- As the user types a title, the system surfaces existing canonical threads with similar titles/topics ("Diskusi ini mungkin sudah ada:")
- Phase 0 implementation: text similarity on title + body (e.g. Postgres full-text / trigram) — no embeddings, no AI
- Suggestions are framed as an invitation, not a block: tapping a suggestion opens that thread; the user can still proceed with creation
- Hard duplicates discovered post-creation are merged by admins (M0-13): the newer thread is closed with a redirect marker, its comments optionally moved by admin

**M0-03 — Thread statuses**
Phase 0 uses a minimal status set:
- **Aktif** — open for discussion (default)
- **Selesai** — concluded; admin or OP closes with a closing summary
- **Pertanyaan Terbuka** — discussion exhausted without conclusion; surfaced as a recognized open question, not a failure ("Pertanyaan ini masih terbuka, dan kamu bukan yang pertama menemukannya.")
- **Dialihkan** — closed as duplicate, with a permanent redirect to the canonical thread

The full resolution-status lifecycle (Pending / Refuted / Integrated / Axiom Stop / Superseded) is Phase 1 (M1-01). Phase 0 statuses are designed to map forward cleanly: Aktif → Pending family, Selesai → Integrated family, Pertanyaan Terbuka → Axiom Stop family.

**M0-04 — Thread page**
- OP post at top, comments below
- Spin-off markers and reference placeholders inline at the position where the split occurred (M0-10)
- Status badge prominent on the thread header
- Sort: chronological default (the platform is a referee, not an amplifier — no engagement-ranked default)

---

### 2. Comments & Party Flags

**M0-05 — Comments**
- Threaded replies, max depth 3 (deeper exchanges are a structural signal — they are candidates for spin-off, not infinite nesting)
- Same rich text support as threads, plus plain quoting of a parent comment
- Edit window: 15 minutes, after which comments are immutable (resolution artifacts require a stable record); edited comments show an "diedit" marker
- Delete: soft-delete only — comment body replaced with "[dihapus]", structure preserved (replies and splits depend on positional integrity)

**M0-06 — Party flag display**
- Every thread and comment displays the author's party flag: party logo + name, linking to the party profile on partai
- Flag reflects membership **at time of posting** — leaving a party later does not strip historical flags (consistent with partai P0-11)
- Users with no party cannot post (cannot occur in normal flow — partai gate precedes mufakat access)
- Muted members (partai P2-04, Phase 2) post without a flag — mufakat must render the flagless state gracefully from day one

**M0-07 — Reactions**
Two reactions only in Phase 0:
- **Setuju** (upvote-equivalent) — signals agreement; used for thread ranking toward simposium in later phases
- **Pertanyaan bagus** (good question) — signals that a comment poses a question deserving its own canonical thread; this is the trigger input for M0-08

No downvote. Disagreement is expressed by replying — the platform's entire premise is that disagreement is content, not noise to bury.

---

### 3. The Good-Question Split

**M0-08 — Split threshold** *(Resolved: Decision 1 — hybrid dynamic)*
- A comment splits into its own canonical thread when its "Pertanyaan bagus" count reaches:

  `threshold = max(5, min(50, ceil(0.15 × unique_participants)))`

  where `unique_participants` = distinct authors (OP + commenters) in the canonical thread at the moment of evaluation
- Floor of 5 keeps the mechanic alive at launch scale; ceiling of 50 keeps splitting attainable in very large threads; 15% in between scales with actual deliberation density
- The threshold value is never displayed to users (structure that doesn't show itself); the reaction count is visible, the trigger math is not
- Constants (5 / 50 / 0.15) are server-side configuration, tunable without release

**M0-09 — Split execution & author opt-out** *(Resolved: Decision 2 — split regardless, 24h OP opt-out)*
- On threshold: a new canonical thread is created automatically. The triggering comment becomes the new thread's opening post, inheriting parent context via an auto-generated quote/excerpt block linking back to the original thread
- Before creation, the system runs the deduplication check (M0-02 logic): if a canonical thread for the same question already exists, no new thread is created — the comment instead receives a reference placeholder pointing to the existing thread (Phase 0 manual confirmation by admin; automated in Phase 2 via knowledge graph)
- The comment author is notified and becomes the new thread's OP by default
- **24-hour opt-out window:** the author may decline OP-ship. The split still happens — the community, not the author, determined the question's value. A declined thread carries the status **"Diangkat komunitas"** (community-raised): no OP, admin-stewarded, the seed comment remains attributed to its author
- If the author takes no action within 24 hours, OP-ship is confirmed silently

**M0-10 — Reference placeholder** *(Resolved: Decision 4 — compact informational card)*
Where the split comment stood in the original thread, a compact card remains:
- Two-line excerpt of the original comment
- "→ kini diskusi tersendiri" with link to the new canonical thread
- **Live status badge** mirroring the new thread's current status (Aktif / Selesai / Pertanyaan Terbuka) — the original thread passively benefits from the spin-off's lifecycle
- Reaction count at time of split
- Replies to the split comment posted *before* the split move with it (see M0-11 move semantics); replies attempted on the placeholder are redirected to the new thread

**M0-11 — Move semantics** *(Resolved: Decision 0 — "Move, leave a scar")*
- Splits and spin-offs **move** content; nothing is duplicated. The same sub-debate existing in two threads is precisely the duplication mufakat exists to prevent
- The original thread keeps: the triggering context (for spin-offs, the triggering comments stay) and a scar — the reference placeholder (M0-10) or spin-off marker (M0-12)
- The design foundation doc's principle "Copy, don't move" is superseded by this decision and should be corrected at source

**M0-12 — Recursive splitting** *(Resolved: Decision 3 — unlimited, same rules at every depth)*
- A split thread can itself split; a spin-off can spawn spin-offs. The system applies identical rules at every level: same deduplication, same threshold formula, same placeholder, same opt-out
- No hard depth cap. The dynamic threshold throttles depth naturally — deeper threads have fewer participants, so the floor of 5 becomes proportionally harder to reach
- Depth is monitored as an analytics signal (Appendix B); a cap is introduced only if pathological chains appear in practice

---

### 4. Spin-Offs for Semantic Disputes

**M0-13 — Admin-initiated spin-off** *(Phase 0 degraded mode for future AI detection)*
- An admin can select a contiguous set of replies constituting a semantic sub-debate and spin them off into a new canonical thread
- The triggering comments stay in the original thread; the selected replies **move** to the spin-off (M0-11)
- A spin-off marker is placed at the split point: one-line description of the disputed question, link, live status badge
- The spin-off runs the full thread lifecycle (statuses, splits, further spin-offs)
- Deduplication check runs first: if a canonical thread for the disputed concept exists, replies are moved there instead of into a new thread, and the marker links to the existing thread

**M0-14 — User flagging of semantic disputes**
- Any participant can flag a reply chain as "perdebatan definisi" (definitional dispute)
- Flags queue for admin review (M0-13 is the resolution action)
- Flagging is framed as clarification, not reporting — distinct UI from the moderation report flow (M0-16)
- 3+ independent flags on the same chain elevate queue priority

**M0-15 — Summary-back block**
- When a spin-off reaches **Selesai**, its closing summary is posted back into the original thread at the spin-off marker as a distinct summary block
- Disputing the summary routes the user into the spin-off thread — the original thread cannot relitigate it
- If a spin-off reaches **Pertanyaan Terbuka**, the marker updates to show the open-question state; no summary block (there is no conclusion to report), but the open question is now a destination other threads can be routed to (fully automated routing is Phase 2; Phase 0 routing is admin-manual)

---

### 5. Moderation & ITE Compliance

**M0-16 — Report & review flow** *(minimum viable moderation — must ship in Phase 0)*
- Any user can report a thread or comment: category (ITE-relevant categories: SARA/hate speech, defamation, threats; plus spam) + optional free text
- Reports queue in an admin panel: dismiss / hide content / escalate
- Hidden content: body replaced with "[disembunyikan moderator]", structure preserved (same positional-integrity rule as soft delete)
- All moderation actions are logged; the log is publicly viewable in aggregate (action type + date, not reporter identity) — consistent with the platform's transparency principle and perpus's eventual role
- ITE constraints are surfaced as pedagogy at the point of friction (e.g., report confirmation copy explains *why* the category exists in Indonesian law), never as a wall of rules at onboarding

**M0-17 — Rate limiting**
- New accounts (< 48h): max 2 threads and 20 comments per day
- All accounts: thread creation capped at 5/day
- Server-side; limits invisible until hit, then explained plainly

---

## Phase 1 — Resolution Infrastructure

**Goal:** Discussions produce durable resolution artifacts. The open-question layer becomes a navigable surface.

**Dependency:** Phase 0 validated — evidence of genuine cross-party deliberation and at least one full split/spin-off lifecycle.

**Success criteria:** 5+ threads carrying full resolution maps, the open-questions page receiving organic traffic, at least one open question accumulating routes from 2+ independent parent threads.

**M1-01 — Full resolution statuses**
- Argument-level lifecycle: **Pending / Refuted / Integrated / Axiom Stop / Superseded**
- Applied at comment level (an argument's state), rolling up to thread status
- Phase 0 thread statuses migrate forward per the M0-03 mapping
- Status changes in Phase 1 are admin/OP-assigned with participant visibility; AI-assisted assignment is Phase 2

**M1-02 — Resolution map**
- Per-thread structured summary: what was claimed, what was refuted, what was integrated, where the axiom stops are
- Generated as a living artifact, finalized when the thread reaches Selesai
- Inherited by future participants: shown above the comment box for anyone joining a thread late ("Sebelum kamu masuk — ini yang sudah terjadi.")

**M1-03 — Open questions surface**
- Dedicated page listing all Pertanyaan Terbuka threads
- Each entry shows: the question, every parent thread that led to it (the accumulated paths), participant count, dormancy duration
- Sortable by most-routed-to — the platform's first visible hint of the question-extraction layer, still framed entirely as "pertanyaan yang belum terjawab," never as a research product

**M1-04 — Manual routing to open questions**
- When a thread stalls on a question that already exists as an open question, admins (Phase 1) can route it: the stalled thread receives the open question's reference block, and the open question gains the new path
- Foundation for Phase 2 automated routing

**M1-05 — Summary dispute mechanic**
- Formal flow for disputing a summary-back block or resolution map entry: opens a structured challenge inside the source thread (reopening it from Selesai to Aktif if upheld)
- Challenges are visible; frivolous reopening is throttled (one active challenge per user per thread)

---

## Phase 2 — Epistemic Engine

**Goal:** The mechanics admins performed manually in Phases 0–1 become AI-assisted at scale. The global knowledge graph goes live.

**Dependency:** Phase 1 validated, and accumulated Phase 0–1 discussions provide calibration data for AI confidence thresholds.

**M2-01 — AI semantic-dispute detection**
- Hybrid model: AI flags candidate semantic hijacks; high-confidence detections auto-create the admin spin-off proposal, low-confidence detections queue for human review
- Admin remains the executing authority initially; full autonomy only after measured precision justifies it

**M2-02 — AI deduplication**
- Embedding-based similarity replaces Phase 0 text matching for creation-time dedup and split-time dedup (M0-02, M0-09)

**M2-03 — Global knowledge graph**
- Every thread is a node; splits, spin-offs, routes, and redirects are edges
- Before any split or spin-off creates a thread, the graph is checked for an existing canonical node — automated version of the Phase 0 manual check
- Parallel definitional debates about the same concept across different parent threads are automatically converged

**M2-04 — Automated open-question routing**
- Threads decomposing toward an existing open question are detected and offered the route in-thread (user-confirmable, not silent)

**M2-05 — AI-assisted resolution status**
- Confidence-scored suggestions for Refuted / Integrated / Axiom Stop classification, human-confirmed
- Platform discussions become training/calibration data, per the self-improving loop in the Axiom discussion document

**M2-06 — partai cross-platform powers land**
- Official position stamp, party distancing, party response, thread nomination (partai PRD P2-06 through P2-09) render in mufakat
- mufakat owns the rendering surfaces; partai owns the issuing logic — boundary documented in TRD

---

## Deferred (Not in Any Phase)

- Voice or video content
- Image embeds in threads/comments
- Direct messaging
- Algorithmic / engagement-ranked feeds
- Downvotes
- Public API access
- Gamification beyond the two reactions (no karma, no badges, no leaderboards)
- Surfacing the question-extraction purpose as branding or product copy

---

## Appendix A — Resolved Design Decisions

**D0 — Move vs. copy: MOVE ("Move, leave a scar")**
Copy violates the canonical-thread commitment — the same sub-debate in two places is the duplication mufakat exists to kill. Originals keep triggering context plus an informational scar. Supersedes the "Copy, don't move" line in the design foundation doc, which contradicted that doc's own spin-off mechanic description.

**D1 — Split threshold: HYBRID DYNAMIC (floor 5, ceiling 50, 15% of unique participants)**
Fixed 50 never fires at launch scale; pure percentage makes splits unattainable in large threads. Hybrid needs no manual retuning at any scale. Constants are server-side config.

**D2 — Author opt-out: SPLIT REGARDLESS, 24H OP-SHIP OPT-OUT**
The community determines the question's value; the author determines only whether to carry the OP responsibility. Declined → "Diangkat komunitas" status, admin-stewarded, authorship of the seed comment retained.

**D3 — Recursive splitting: UNLIMITED, IDENTICAL RULES AT EVERY DEPTH**
Consistent with "recursive spin-offs are expected." A hard cap is a visible rule users must learn, violating structure-without-showing-itself. The dynamic threshold throttles depth naturally. Monitor; cap only on observed pathology.

**D4 — Reference placeholder: COMPACT INFORMATIONAL CARD**
Excerpt + link + live status badge + reaction count. The scar carries information; the live badge is a lightweight cousin of summary-back. A bare link reads as deletion/moderation, which the mechanic must never feel like.

---

## Appendix B — Phase 0 Analytics Signals

Tracked from day one (informs threshold tuning and the Phase 1/2 build case):

- Dedup suggestion shown → accepted rate (does M0-02 actually redirect?)
- Good-question reactions per comment distribution (is the floor of 5 right?)
- Split survival: % of split threads reaching 5+ comments
- OP opt-out rate (is OP-ship perceived as burden?)
- Split depth distribution (D3 pathology watch)
- Spin-off lifecycle completion rate (Selesai vs. Pertanyaan Terbuka vs. abandoned)
- Flag → spin-off conversion rate (precision baseline for future AI detection)

---

*This document reflects the current state of design decisions. Phase 0 decisions are locked upon PRD acceptance. Phase 1 and 2 decisions are subject to revision based on Phase 0 learnings.*
