# Phase 0 Checklist — joint partai + mufakat launch

> **Scope:** partai PRD v0.3 + mufakat PRD v0.1, per TRD v1.3  
> **Launch dependency:** Both subdomains launch together as a single unit.  
> **Success criteria:** 100 users, 5 active parties, 10+ cross-party canonical threads, ≥1 good-question split, ≥1 admin spin-off completing lifecycle.

---

## 1. Infrastructure & Configuration

- [x] **1.1** Workspace wiring — app-level `package.json` files for `apps/partai`, `apps/mufakat`, `packages/ui` with correct dependencies (TRD §3)
- [x] **1.2** SvelteKit scaffold — `svelte.config.js`, `vite.config.ts`, `tsconfig.json` per app (TRD §11)
- [x] **1.3** Tailwind CSS configuration per app (TRD §2) — v4 CSS-first config via `@tailwindcss/vite`, no `tailwind.config.js` needed
- [x] **1.4** Clerk auth integration — shared init, ClerkProvider, JWT template for Supabase (`sub` mapped to user UUID) (TRD §5) — code via `svelte-clerk` (`withClerkHandler` + `ClerkProvider`); the `supabase` JWT template itself is Clerk-dashboard config (see `.env.example`)
- [x] **1.5** Supabase client init — `@supabase/ssr` with Clerk JWT, per-app setup (TRD §5) — `src/lib/supabase.ts` per app, `accessToken` callback presents the Clerk token
- [x] **1.6** Environment variables — `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` per app (TRD §4)
- [x] **1.7** Cloudflare Pages adapter — `@sveltejs/adapter-cloudflare` configured for `partai` and `mufakat` (TRD §4) — `pnpm build` verified
- [ ] **1.8** Cross-subdomain SSO — cookie domain scoped to `.alternatif.space`, verified working between partai and mufakat (TRD §5) — requires Clerk production instance on the root domain + both subdomains deployed; cannot be verified locally
- [x] **1.9** `packages/ui` package config — `package.json`, exports map, build setup (TRD §3) — consumed as raw Svelte source via workspace, no build step

---

## 2. Shared UI Components (`packages/ui`)

- [x] **2.1** `PartyBadge.svelte` — party logo + name, link to party profile on partai (TRD §3, M0-06) — `party = null` renders nothing (flagless muted-member state)
- [x] **2.2** `MemberAvatar.svelte` — user display component (TRD §3)
- [x] **2.3** `VoteWidget.svelte` — voting UI stub (Phase 1 use, scaffold now) (TRD §3)
- [x] **2.4** `NotificationBell.svelte` — in-app notification bell, unread count badge (TRD §3, §12)
- [x] **2.5** `ThreadStatusBadge.svelte` — mufakat status pill: `aktif` / `selesai` / `pertanyaan_terbuka` / `dialihkan` (TRD §3, §11)
- [x] **2.6** `SplitPlaceholderCard.svelte` — compact card for moved comment scars: 2-line excerpt + link + live status badge + reaction count (TRD §3, §11, M0-10)

### Shared Stores (`packages/ui/stores/`)

- [x] **2.7** `currentUser.js` — Svelte writable store: `{ id, display_name, bio, last_active_at }`, populated on Clerk session resolve (TRD §11)
- [x] **2.8** `currentParty.js` — Svelte writable store: `{ id, slug, name, logo_url, status, role: 'leader' | 'member' }` (TRD §11)

---

## 3. Database & Migrations *(already complete)*

- [x] **3.1** Shared tables — `users`, `platform_config`, `platform_admins` (`00001_extensions_shared.sql`) (TRD §6)
- [x] **3.2** `pg_trgm` extension enabled for dedup (TRD §6)
- [x] **3.3** Partai Phase 0 tables — `parties`, `party_members`, `party_membership_history`, `party_applications`, `party_invites` (`00002_partai_phase0.sql`) (TRD §6)
- [x] **3.4** Dormant status trigger on `parties` — auto-flips active/dormant on leader activity (TRD §8)
- [x] **3.5** Notifications + push subscriptions — `notifications`, `push_subscriptions` (`00003_notifications_phase0.sql`) (TRD §6, §12)
- [x] **3.6** Mufakat Phase 0 tables — `mufakat_threads`, `mufakat_comments`, `mufakat_reactions`, `mufakat_splits`, `mufakat_markers`, `mufakat_semantic_flags`, `mufakat_reports`, `mufakat_moderation_log` (`00004_mufakat_phase0.sql`) (TRD §6)
- [x] **3.7** All RLS policies — partai (public read, authenticated insert, leader update) + mufakat (public read, member insert, author edit window, reaction delete) (TRD §7)
- [x] **3.8** `mufakat_comments_public` VIEW — withholds content by state (`deleted`/`hidden` → NULL, `moved` → excerpt) (TRD §7)
- [x] **3.9** `search_similar_threads()` RPC — pg_trgm similarity + Postgres FTS (`indonesian` config) (TRD §9.5)
- [x] **3.10** `is_platform_admin()` SQL helper (TRD §6)
- [x] **3.11** Seed data — 5 users, 1 admin, 2 parties, 2 threads, 3 reactions (`supabase/seed.sql`)

---

## 4. Edge Functions

### Partai — Phase 0 *(already complete)*

- [x] **4.1** `join-party` — validates no current membership, inserts into `party_members` + history (TRD §10)
- [x] **4.2** `leave-party` — removes membership, writes leave record, blocks leader self-removal (TRD §10)
- [x] **4.3** `generate-invite-token` — crypto-random token, 7-day expiry, caller must be active member (TRD §10)
- [x] **4.4** `use-invite-token` — validates token (exists, unused, unexpired), triggers join flow (TRD §10)
- [x] **4.5** `submit-application` — inserts application, rejects duplicate pending (TRD §10)
- [x] **4.6** `review-application` — leader approve/reject, triggers join on approval, sends notification (TRD §10)
- [x] **4.7** `update-dormant-status` — daily cron target, flips parties past 30-day leader inactivity (TRD §10)

### Mufakat — Phase 0 *(already complete)*

- [x] **4.8** `mufakat-create-thread` — rate-limit check, membership gate, slug generation, TipTap-to-text extraction (TRD §10, M0-01,M0-17)
- [x] **4.9** `mufakat-create-comment` — rate-limit check, thread `aktif` check, depth enforcement (max 3), scar-redirect rejection (TRD §10, M0-05)
- [x] **4.10** `mufakat-react` — inserts reaction; on `pertanyaan_bagus`: evaluates split threshold, executes good-question split (TRD §10, M0-08—M0-11)
- [x] **4.11** `mufakat-respond-opship` — author confirms or declines OP-ship within 24h window (TRD §10, M0-09)
- [x] **4.12** `expire-op-windows` — cron: auto-confirms pending splits past `op_window_ends_at` (TRD §10, M0-09)
- [x] **4.13** `mufakat-admin-spinoff` — admin-only: select reply chain, dedup check, move replies, create marker, log (TRD §10, M0-13)
- [x] **4.14** `mufakat-confirm-dedup-reference` — admin confirms or rejects pending dedup reference split (TRD §10, M0-09)
- [x] **4.15** `mufakat-close-thread` — OP/admin sets `selesai` (with closing summary) or `pertanyaan_terbuka` (TRD §10, M0-03)
- [x] **4.16** `mufakat-merge-threads` — admin closes duplicate: status `dialihkan`, `redirect_to` set, optional comment move (TRD §10, M0-02)
- [x] **4.17** `mufakat-report-content` — report intake: category + note, confirmation copy explains legal basis (TRD §10, M0-16)
- [x] **4.18** `mufakat-review-report` — admin: dismiss / hide (sets `state='hidden'`; threads use `hidden` flag via `00006_mufakat_thread_hide.sql`) / escalate, writes moderation log (TRD §10, M0-16)

### Shared Modules *(already complete)*

- [x] **4.19** `_shared/client.ts` — service client, JWT extraction, CORS (TRD §10)
- [x] **4.20** `_shared/membership.ts` — current membership, mufakat party flag, config reader, admin check, notification dispatch (TRD §10)
- [x] **4.21** `_shared/mufakat.ts` — TipTap-to-text, slugify, threshold evaluation, descendants collection, depth recomputation, split execution (TRD §10)

---

## 5. Partai App (`apps/partai`)

### Auth & Onboarding

- [x] **5.1** Sign up / log in page — email + password via Clerk, no social login (P0-01)
- [x] **5.2** First-login onboarding screen — platform explanation, must join or create party CTA (P0-01)
- [x] **5.3** Auth gate middleware — `hooks.server.ts` protecting member-only routes (TRD §11)
- [x] **5.4** `/bergabung` — onboarding gate: redirects users without a party to browse or create party (TRD §11)

### Party Discovery

- [x] **5.5** `/` — browse parties page: grid of party cards, default sort by recent activity (P0-03)
- [x] **5.6** Party card component — logo, name, tagline, membership model, activity status, member count; dormant badge (P0-03)
- [x] **5.7** Browse filters — membership model (open / application / invite-only), activity status (active / dormant) (P0-03)
- [x] **5.8** Search by party name (P0-03)
- [x] **5.9** Dormant party visual badge (30+ days inactive leader) (P0-03)
- [x] **5.10** Dissolved parties — visible but marked, hidden by default with toggle (P0-03)

### Party Profile

- [x] **5.11** `/partai/[slug]` — party public profile page (P0-04)
- [x] **5.12** Hero section — logo, name, tagline, status pills (activity status, membership model) (P0-04)
- [x] **5.13** Full manifesto — rendered TipTap HTML, read-only (P0-04)
- [x] **5.14** Current stance — short live status set by leader (P0-04)
- [x] **5.15** Governance config display — all raw parameter values visible, no archetype label (P0-04)
- [x] **5.16** Member count + leader display name + leader last active indicator (P0-04)
- [x] **5.17** Join / Apply / Request Invite CTA — depends on membership model (P0-04)
- [x] **5.18** `/partai/[slug]/anggota` — current member list (display names only) (TRD §11)
- [x] **5.19** OG meta tags per party — `og:title`, `og:description`, `og:image` using share card (P0-13)

### Create Party Flow (5-step wizard)

- [x] **5.20** `/buat-partai` — multi-step flow, local store holds state until publish (TRD §11)
- [x] **5.21** Step 1 — Select starting point: Vanguard, Republic, Commune, Custom (P0-05)
- [x] **5.22** Step 2 — Governance parameters: pre-filled (preset paths) or blank (Custom path) (P0-05)
- [x] **5.23** Step 2 — Custom path: CTA disabled until all params set, completion counter ("X dari Y parameter belum diatur") (P0-05)
- [x] **5.24** Step 3 — Party identity: name, logo upload (JPG/PNG/WebP, max 2MB, square crop), tagline, manifesto editor (TipTap) (P0-05)
- [x] **5.25** Step 4 — Enable council toggle (optional, Phase 2 execution) (P0-05)
- [x] **5.26** Step 5 — Review & publish: all settings displayed, config permanently locked on publish, honeymoon starts (`now() + 3 months`) (P0-05)
- [x] **5.27** Manifesto editor — TipTap: H2/H3, bold, italic, bullet, numbered, blockquote; no image embeds; 200-char minimum; auto-save draft (P0-06)
- [x] **5.28** Logo upload — Supabase Storage (`party-logos/{party_id}/logo.{ext}`), client-side canvas crop to square (P0-07, TRD §13)
- [x] **5.29** Archetype label — never stored in DB, never returned by API, never shown publicly (P0-05, Q7)

### Joining & Membership

- [x] **5.30** Open join — single CTA, instant join, confirmation screen with party flag message (P0-08)
- [x] **5.31** Already-in-party gate — prompt to leave current party first, with profile-history warning (P0-08)
- [x] **5.32** Application join — 500-char free text, submit via `submit-application` edge function (P0-09)
- [x] **5.33** Invite-only join — members generate invite link (single-use, 7-day expiry) via `generate-invite-token` (P0-10)
- [x] **5.34** Invite redemption — `/partai/[slug]?invite=TOKEN`, validate via `use-invite-token` (P0-10)
- [x] **5.35** Leave party — available from profile or party page, confirmation dialog with history warning (P0-11)
- [x] **5.36** Party membership flag — query `party_members WHERE user_id = auth.uid() AND status = 'active' LIMIT 1` (TRD §5)

### Post-Join & Post-Approval Flows

- [x] **5.37** Post-join nudge screen — full-screen: "Bendera kamu sudah terpasang. Sekarang bawa posisimu ke diskusi." → CTA to mufakat (P0-12)
- [x] **5.38** Post-approval share flow — pre-composed share card (logo + name + tagline + branding), Web Share API trigger (P0-13)
- [x] **5.39** Share card fallback — copy link button for browsers without Web Share API (P0-13)
- [ ] **5.40** Share card generation — Edge Function creates OG image at party approval, stored in Supabase Storage (`party-share-cards/{party_id}/share.png`) (P0-13, TRD §13)

### User Profile

- [x] **5.41** `/profil/[username]` — user profile page: display name, bio (max 160 chars), party badge, party history log (P0-02) — implemented as `/profil/[id]`: the schema has no username column and display_name is not unique (TRD gap)
- [x] **5.42** Party history log — list of past parties with dates, read from `party_membership_history` (P0-02)

---

## 6. Mufakat App (`apps/mufakat`)

### Thread Browsing & Display

- [ ] **6.1** `/` — thread list page, chronological default, public (TRD §11, M0-04)
- [ ] **6.2** Thread card component — title, OP party flag, participant count, status badge, timestamp (M0-04)
- [ ] **6.3** Thread list: no engagement-ranked default; sort is chronological only (M0-04)
- [ ] **6.4** `/diskusi/[slug]` — thread page: OP post, comments, markers, placeholders inline (TRD §11, M0-04)

### Thread Page Rendering (interleaved row types)

- [ ] **6.5** Comments row — rendered from `mufakat_comments_public` by state:
  - `visible` → full content
  - `deleted` → `"[dihapus]"` stub
  - `hidden` → `"[disembunyikan moderator]"` stub
  - `moved` → `SplitPlaceholderCard` with excerpt + link + live status badge (TRD §11)
- [ ] **6.6** Spin-off markers row — `mufakat_markers`: label + link + live status badge from target thread (TRD §11)
- [ ] **6.7** Summary-back block — when marker's target thread is `selesai`, render `closing_summary` inline (live read, never stored in parent) (TRD §11, M0-15)
- [ ] **6.8** Thread header — status badge prominent, OP party flag, timestamp (M0-04)
- [ ] **6.9** TipTap lazy-loaded — only on comment composer mount and `/buat`, not bundled into thread-read path (TRD §11, §14)

### Thread Creation

- [ ] **6.10** `/buat` — create thread page, member-only (party gate enforced); non-members redirected to partai `/bergabung` (TRD §11, M0-01)
- [ ] **6.11** Title input with dedup suggestions — debounced client-side call to `search_similar_threads()`, surfaces similar threads ("Diskusi ini mungkin sudah ada:") (M0-02)
- [ ] **6.12** Dedup suggestions — framed as invitation, not block; tapping opens the existing thread; user can always proceed (M0-02)
- [ ] **6.13** Body editor — TipTap rich text (H2/H3, bold, italic, bullet, numbered, blockquote), no image embeds (M0-01)
- [ ] **6.14** Auto-save draft (M0-01)
- [ ] **6.15** Submit via `mufakat-create-thread` — rate-limit check, membership check, slug generation (M0-17)

### Comments & Reactions

- [ ] **6.16** Comment composer — threaded replies, max depth 3 (M0-05)
- [ ] **6.17** Rich text support — same formats as threads, plus plain quoting of parent comment (M0-05)
- [ ] **6.18** Edit window — 15 minutes from creation; edited comments show "diedit" marker (M0-05)
- [ ] **6.19** Soft delete — author can delete (state → `deleted`), body replaced with `"[dihapus]"`, structure preserved (M0-05)
- [ ] **6.20** Party flag display — every thread and comment shows author's flag at time of posting (denormalized `author_party_id` / `op_party_id`) (M0-06)
- [ ] **6.21** Flagless rendering — muted members post with no flag; mufakat renders gracefully (`author_party_id = NULL`) (M0-06)
- [ ] **6.22** Reactions UI — `Setuju` (agree) and `Pertanyaan bagus` (good question) buttons, count display (M0-07)
- [ ] **6.23** No downvote — disagreement is expressed by replying, not burying (M0-07)
- [ ] **6.24** Un-react — own-row delete for reactions (M0-07)
- [ ] **6.25** Reaction counts visible; threshold math never shipped to client (M0-08)

### OP-Ship Window

- [ ] **6.26** OP-ship response UI — notification + in-thread prompt: author confirms or declines within 24h (M0-09)
- [ ] **6.27** Confirmed — thread OP status confirmed silently (M0-09)
- [ ] **6.28** Declined — thread shows "Diangkat komunitas" status, `op_id = NULL`, `community_raised = true` (M0-09)
- [ ] **6.29** 4h reminder — notification before OP window expiry (TRD §12)

### Content Moderation (UI)

- [ ] **6.30** Report flow — user reports thread or comment: category (sara / defamation / threat / spam) + optional note (M0-16)
- [ ] **6.31** Report confirmation copy — explains legal basis of each ITE category (pedagogy at point of friction) (M0-16)
- [ ] **6.32** Semantic flagging — "perdebatan definisi" flag on reply chains; visual/verbal distinction from moderation reports (M0-14)
- [ ] **6.33** 3+ flags on same chain → elevated admin queue priority (M0-14)

### Admin Panel (`/moderasi` routes)

- [ ] **6.34** `/moderasi` — admin dashboard: report queue, semantic flag queue, pending dedup-reference confirmations (TRD §11, §15)
- [ ] **6.35** Report review — admin actions: dismiss / hide (sets `state='hidden'`) / escalate (M0-16)
- [ ] **6.36** Semantic flag review — resolve by executing admin spin-off (M0-14)
- [ ] **6.37** Dedup-reference confirmation — admin confirms or rejects pending dedup splits (M0-09)
- [ ] **6.38** `/moderasi/spinoff/[id]` — reply-chain selection UI + spin-off execution (M0-13)
- [ ] **6.39** `/moderasi/log` — public aggregate moderation log: action type + date only, no reporter/moderator identity (TRD §11, §15, M0-16)

### Thread Closing & Merging

- [ ] **6.40** Close thread — OP or admin sets `selesai` with closing summary (TipTap) or `pertanyaan_terbuka` (M0-03)
- [ ] **6.41** Merge duplicate — admin closes duplicate: status `dialihkan`, `redirect_to` set (M0-02)
- [ ] **6.42** Parent markers reflect target thread state changes automatically via live read — no write-back (M0-15)

---

## 7. GitHub Actions

- [x] **7.1** `maintenance.yml` workflow — file created (TRD §10) — jobs guarded per schedule (`if: github.event.schedule`), `workflow_dispatch` added for manual runs
- [x] **7.2** `expire-op-windows` cron — every 15 minutes via `curl` to Supabase Edge Function (TRD §10)
- [x] **7.3** `update-dormant-status` cron — daily at midnight via `curl` to Supabase Edge Function (TRD §10)
- [ ] **7.4** `SUPABASE_FUNCTIONS_URL` and `SUPABASE_SERVICE_KEY` secrets configured in repo (TRD §10)

---

## 8. Content Moderation (Process)

- [ ] **8.1** Party creation review queue — Supabase dashboard view filtered on `parties.status = 'pending_review'` (TRD §15)
- [ ] **8.2** Party approval flow — moderator reviews name, tagline, manifesto; target review time 24h (TRD §15)
- [ ] **8.3** Mufakat post-moderation — threads/comments publish immediately, no pre-approval queue (TRD §15)

---

## 9. Performance, PWA & Polish

- [ ] **9.1** PWA enabled — `manifest.json`, service worker, installable to home screen (TRD §14)
- [ ] **9.2** Offline browsing — cached parties and recently viewed threads (TRD §14)
- [ ] **9.3** Touch targets — minimum 44×44px on all interactive elements (TRD §14)
- [ ] **9.4** Base font size — 16px minimum (TRD §14)
- [ ] **9.5** Mobile-first — single column on mobile, responsive grid on desktop (TRD §14)
- [ ] **9.6** Loading states — skeletons/spinners for all async data fetches
- [ ] **9.7** Error states — graceful handling for auth failures, missing data, network errors
- [ ] **9.8** Empty states — meaningful copy for empty thread lists, no party members, etc.

---

## 10. Analytics Signals (Mufakat PRD Appendix B)

- [ ] **10.1** Dedup suggestion shown → accepted rate (does M0-02 redirect?)
- [ ] **10.2** Good-question reactions per comment distribution (floor of 5 calibrated?)
- [ ] **10.3** Split survival — % of split threads reaching 5+ comments
- [ ] **10.4** OP opt-out rate (is OP-ship perceived as burden?)
- [ ] **10.5** Split depth distribution (D3 pathology watch)
- [ ] **10.6** Spin-off lifecycle completion rate (Selesai vs. Pertanyaan Terbuka vs. abandoned)
- [ ] **10.7** Flag → spin-off conversion rate (precision baseline for future AI detection)
