# Phase 0 Checklist — joint partai + mufakat launch

> **Scope:** partai PRD v0.3 + mufakat PRD v0.1, per TRD v1.3  
> **Launch dependency:** Both subdomains launch together as a single unit.  
> **Success criteria:** 100 users, 5 active parties, 10+ cross-party canonical threads, ≥1 good-question split, ≥1 admin spin-off completing lifecycle.

---

## 1. Infrastructure & Configuration

- [x] **1.1** Workspace wiring — app-level `package.json` files for `apps/partai`, `apps/mufakat`, `packages/ui` with correct dependencies (TRD §3)
- [x] **1.2** SvelteKit scaffold — `svelte.config.js`, `vite.config.ts`, `tsconfig.json` per app (TRD §11)
- [x] **1.3** Tailwind CSS configuration per app (TRD §2) — Tailwind v4 via `@import 'tailwindcss'` in `app.css` and `@tailwindcss/vite` plugin, no `tailwind.config.js` needed
- [x] **1.4** Clerk auth integration — shared via `svelte-clerk` (`withClerkHandler` + `ClerkProvider`); JWT template `supabase` maps `sub` to user UUID (TRD §5)
- [x] **1.5** Supabase client init — `@supabase/ssr` with Clerk JWT, per-app setup in `src/lib/supabase.ts` (TRD §5)
- [x] **1.6** Environment variables — `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` per app (TRD §4)
- [x] **1.7** Cloudflare Pages adapter — `@sveltejs/adapter-cloudflare` configured for `partai` and `mufakat` (TRD §4)
- [ ] **1.8** Cross-subdomain SSO — cookie domain scoped to `.alternatif.space`, verified working between partai and mufakat (TRD §5) — requires Clerk production instance + both subdomains deployed; cannot verify locally
- [x] **1.9** `packages/ui` package config — `package.json`, `tsconfig.json`, barrel exports via `src/index.ts` (TRD §3)

---

## 2. Shared UI Components (`packages/ui`)

- [x] **2.1** `PartyBadge.svelte` — party logo + name, link to party profile on partai (TRD §3, M0-06)
- [x] **2.2** `MemberAvatar.svelte` — user display component (TRD §3)
- [x] **2.3** `VoteWidget.svelte` — voting UI stub (Phase 1 use, scaffold now) (TRD §3)
- [x] **2.4** `NotificationBell.svelte` — in-app notification bell, unread count badge (TRD §3, §12)
- [x] **2.5** `ThreadStatusBadge.svelte` — mufakat status pill: `aktif` / `selesai` / `pertanyaan_terbuka` / `dialihkan` (TRD §3, §11)
- [x] **2.6** `SplitPlaceholderCard.svelte` — compact card for moved comment scars: 2-line excerpt + link + live status badge + reaction count (TRD §3, §11, M0-10)

### Shared Stores (`packages/ui/stores/`)

- [x] **2.7** `currentUser.js` — Svelte writable store: `{ id, display_name, bio, last_active_at }`, populated on Clerk session resolve (TRD §11)
- [x] **2.8** `currentParty.js` — Svelte writable store: `{ id, slug, name, logo_url, status, role: 'leader' | 'member' }` (TRD §11)

---

## 3. Database & Migrations

- [x] **3.1** Shared tables — `users`, `platform_config`, `platform_admins` (`00001_extensions_shared.sql`) (TRD §6)
- [x] **3.2** `pg_trgm` extension enabled for dedup (TRD §6)
- [x] **3.3** Partai Phase 0 tables — `parties`, `party_members`, `party_membership_history`, `party_applications`, `party_invites` (`00002_partai_phase0.sql`) (TRD §6)
- [x] **3.4** Dormant status trigger on `parties` — auto-flips active/dormant on leader activity (TRD §8)
- [x] **3.5** Notifications + push subscriptions — `notifications`, `push_subscriptions` (`00003_notifications_phase0.sql`) (TRD §6, §12)
- [x] **3.6** Mufakat Phase 0 tables — `mufakat_threads`, `mufakat_comments`, `mufakat_reactions`, `mufakat_splits`, `mufakat_markers`, `mufakat_semantic_flags`, `mufakat_reports`, `mufakat_moderation_log` (`00004_mufakat_phase0.sql`) (TRD §6)
- [x] **3.7** All RLS policies — partai + mufakat (`00005_mufakat_rls_views_rpc.sql`) (TRD §7)
- [x] **3.8** `mufakat_comments_public` VIEW — withholds content by state (`deleted`/`hidden` → NULL, `moved` → excerpt) (TRD §7)
- [x] **3.9** `search_similar_threads()` RPC — pg_trgm similarity + Postgres FTS (`indonesian` config) (TRD §9.5)
- [x] **3.10** `is_platform_admin()` SQL helper (TRD §6)
- [x] **3.11** Seed data — 5 users, 1 admin, 2 parties, 2 threads, 3 reactions (`supabase/seed.sql`)
- [x] **3.12** Thread-level hide — `mufakat_threads.hidden` column + updated `search_similar_threads` RPC to exclude hidden threads (`00006_mufakat_thread_hide.sql`)
- [x] **3.13** Partai Phase 0 schema gaps — `pending_review` party status, `users_self_insert` RLS, storage buckets + policies (`00007_partai_phase0_gaps.sql`)
- [x] **3.14** Mufakat RLS gaps — author soft-delete policy, admin semantic-flag update policy (`00008_mufakat_rls_gaps.sql`)
- [x] **3.15** Clerk text user IDs — Clerk reserves JWT `sub` (always `user_…`, never a UUID), so all user-id columns converted uuid→text and every policy moved from `auth.uid()` to `clerk_uid()` = `auth.jwt()->>'sub'` (`00009_clerk_text_user_ids.sql`; updates TRD §5)

---

## 4. Edge Functions

### Partai — Phase 0

- [x] **4.1** `join-party` — validates no current membership, inserts into `party_members` + history (TRD §10)
- [x] **4.2** `leave-party` — removes membership, writes leave record, blocks leader self-removal (TRD §10)
- [x] **4.3** `generate-invite-token` — crypto-random token, 7-day expiry, caller must be active member (TRD §10)
- [x] **4.4** `use-invite-token` — validates token (exists, unused, unexpired), triggers join flow (TRD §10)
- [x] **4.5** `submit-application` — inserts application, rejects duplicate pending (TRD §10)
- [x] **4.6** `review-application` — leader approve/reject, triggers join on approval, sends notification (TRD §10)
- [x] **4.7** `update-dormant-status` — daily cron target, flips parties past 30-day leader inactivity (TRD §10)

### Mufakat — Phase 0

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
- [x] **4.18** `mufakat-review-report` — admin: dismiss / hide / escalate, writes moderation log (TRD §10, M0-16)

### Shared Modules

- [x] **4.19** `_shared/client.ts` — service client, JWT extraction, CORS (TRD §10)
- [x] **4.20** `_shared/membership.ts` — current membership, mufakat party flag, config reader, admin check, notification dispatch (TRD §10)
- [x] **4.21** `_shared/mufakat.ts` — TipTap-to-text, slugify, threshold evaluation, descendants collection, depth recomputation, split execution (TRD §10)

---

## 5. Partai App (`apps/partai`)

### Auth & Onboarding

- [x] **5.1** Sign up / log in page — email + password via Clerk, no social login (P0-01) — `/masuk`, `/daftar`
- [x] **5.2** First-login onboarding screen — platform explanation, display name + bio, must join or create party CTA (P0-01) — `/onboarding`
- [x] **5.3** Auth gate middleware — `hooks.server.ts` protecting `/buat-partai`, `/onboarding`, `/bergabung` (TRD §11)
- [x] **5.4** `/bergabung` — onboarding gate: redirects users without a party to browse or create party (TRD §11)

### Party Discovery

- [x] **5.5** `/` — browse parties page: grid of party cards, default sort by recent leader activity (P0-03)
- [x] **5.6** Party card component — logo, name, tagline, membership model, activity status, member count; dormant badge (P0-03)
- [x] **5.7** Browse filters — membership model (open / application / invite-only), activity status (active / dormant) (P0-03)
- [x] **5.8** Search by party name (P0-03)
- [x] **5.9** Dormant party visual badge — yellow pill on dormant parties (P0-03)
- [x] **5.10** Dissolved parties — visible but marked, hidden by default with checkbox toggle (P0-03)

### Party Profile

- [x] **5.11** `/partai/[slug]` — party public profile page (P0-04)
- [x] **5.12** Hero section — logo, name, tagline, status pills (activity status, membership model), no archetype label (P0-04)
- [x] **5.13** Full manifesto — rendered TipTap HTML, read-only (P0-04)
- [x] **5.14** Current stance — short live status set by leader (P0-04)
- [x] **5.15** Governance config display — all raw parameter values visible, no archetype label (P0-04, Q7)
- [x] **5.16** Member count + leader display name + leader last active indicator (P0-04)
- [x] **5.17** Join / Apply / Request Invite CTA — depends on membership model (P0-04)
- [x] **5.18** `/partai/[slug]/anggota` — current member list with leader indicator (TRD §11, P0-04)
- [x] **5.19** OG meta tags per party — `og:title`, `og:description`, `og:image` using share card (P0-13)

### Create Party Flow (5-step wizard)

- [x] **5.20** `/buat-partai` — multi-step flow, local `CreatePartyDraft` store holds state until publish (TRD §11)
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

- [x] **5.30** Open join — single CTA, instant join, redirect to post-join screen (P0-08)
- [x] **5.31** Already-in-party gate — prompt to leave current party first, with profile-history warning (P0-08)
- [x] **5.32** Application join — 500-char free text, submit via `submit-application` edge function (P0-09)
- [x] **5.33** Invite-only join — members generate invite link (single-use, 7-day expiry) via `generate-invite-token` (P0-10)
- [x] **5.34** Invite redemption — `/partai/[slug]?invite=TOKEN`, validate via `use-invite-token` (P0-10)
- [x] **5.35** Leave party — confirmation dialog with history warning, submits via `leave-party` (P0-11)
- [x] **5.36** Party membership flag — query `party_members WHERE user_id = auth.uid() LIMIT 1` in layout (TRD §5)

### Post-Join & Post-Approval Flows

- [x] **5.37** Post-join nudge screen — two-stage full-screen: membership confirmation → "Bendera kamu sudah terpasang. Sekarang bawa posisimu ke diskusi." → CTA to mufakat (P0-12)
- [x] **5.38** Post-approval share flow — pre-composed share card (logo + name + tagline + branding), Web Share API trigger (P0-13)
- [x] **5.39** Share card fallback — copy link button for browsers without Web Share API (P0-13)
- [x] **5.40** Share card generation — `generate-share-card` Edge Function (satori/og_edge) composes 1200×630 PNG (logo + name + tagline + branding), stores in `party-share-cards/{party_id}/share.png`, writes `parties.share_card_url`. Since approval is a manual dashboard action (TRD §15), generation is lazy + idempotent: triggered on first `/partai/[slug]/bagikan` visit; CSS card remains the fallback on failure (P0-13, TRD §13)

### User Profile

- [x] **5.41** `/profil/[id]` — user profile page: display name, bio (max 160 chars), current party badge, party history log (P0-02) — routed by user UUID since display_name is not unique (no username column in schema)
- [x] **5.42** Party history log — list of past parties with dates and leave reasons, read from `party_membership_history` (P0-02)

---

## 6. Mufakat App (`apps/mufakat`)

### Thread Browsing & Display

- [x] **6.1** `/` — thread list page, chronological default, public (TRD §11, M0-04)
- [x] **6.2** Thread card component — title, OP party flag, participant count, status badge, timestamp, community-raised indicator (M0-04)
- [x] **6.3** Thread list: no engagement-ranked default; sort is chronological only (M0-04)
- [x] **6.4** `/diskusi/[slug]` — thread page: OP post, comments, markers, placeholders inline (TRD §11, M0-04)

### Thread Page Rendering (interleaved row types)

- [x] **6.5** Comments rendered by state:
  - `visible` → full content
  - `deleted` → `"[dihapus]"` stub
  - `hidden` → `"[disembunyikan moderator]"` stub
  - `moved` → `SplitPlaceholderCard` with excerpt + link + live status badge + reaction count (TRD §11)
- [x] **6.6** Spin-off markers row — `mufakat_markers`: label + link + live status badge from target thread (TRD §11)
- [x] **6.7** Summary-back block — when marker's target thread is `selesai`, render `closing_summary` inline (live read, never stored in parent) (TRD §11, M0-15)
- [x] **6.8** Thread header — status badge prominent, OP party flag, timestamp, community-raised indicator, parent thread link (M0-04)
- [x] **6.9** TipTap lazy-loaded — only on comment composer mount (not bundled into thread-read path) (TRD §11, §14)

### Thread Creation

- [x] **6.10** `/buat` — create thread page, member-only (party gate enforced); non-members (incl. suspended/removed) redirected to partai `/bergabung` (TRD §11, M0-01)
- [x] **6.11** Title input with dedup suggestions — debounced client-side call to `search_similar_threads()`, surfaces similar threads ("Diskusi ini mungkin sudah ada:") (M0-02)
- [x] **6.12** Dedup suggestions — framed as invitation, not block; tapping opens the existing thread; user can always proceed (M0-02)
- [x] **6.13** Body editor — TipTap rich text (H2/H3, bold, italic, bullet, numbered, blockquote), no image embeds (M0-01)
- [x] **6.14** Auto-save draft — localStorage, restored on return, cleared on publish (M0-01)
- [x] **6.15** Submit via `mufakat-create-thread` — rate-limit check, membership check, slug generation; rate-limit explanation surfaced plainly (M0-17)

### Comments & Reactions

- [x] **6.16** Comment composer — threaded replies, max depth 3 (M0-05)
- [x] **6.17** Rich text support — same formats as threads, plus plain quoting of parent comment (M0-05)
- [x] **6.18** Edit window — 15 minutes from creation; edited comments show "diedit" marker (`edited_at` field) (M0-05)
- [x] **6.19** Soft delete — author can delete (state → `deleted`), body replaced with `"[dihapus]"`, structure preserved (M0-05)
- [x] **6.20** Party flag display — every comment shows author's flag at time of posting (denormalized `author_party_id`) (M0-06)
- [x] **6.21** Flagless rendering — muted members post with `author_party_id = NULL`; `PartyBadge` renders nothing gracefully (M0-06)
- [x] **6.22** Reactions UI — `Setuju` (agree) and `Pertanyaan bagus` (good question) buttons, count display (M0-07)
- [x] **6.23** No downvote — disagreement is expressed by replying, not burying (M0-07)
- [x] **6.24** Un-react — own-row delete via `?/unreact` form action (M0-07)
- [x] **6.25** Reaction counts visible; threshold math never shipped to client (M0-08)

### OP-Ship Window

- [x] **6.26** OP-ship response UI — in-thread prompt: "Komentarmu jadi diskusi baru." with confirm/decline buttons within 24h (M0-09)
- [x] **6.27** Confirmed — thread OP status confirmed silently (M0-09)
- [x] **6.28** Declined — thread shows "Diangkat komunitas" badge, `op_id = NULL`, `community_raised = true` (M0-09)
- [x] **6.29** 4h reminder — notification before OP window expiry; sent by `expire-op-windows` (15-min cron), deduped by `split_id`, type `mufakat_split_op_reminder` (TRD §12)

### Content Moderation (UI)

- [x] **6.30** Report flow — user reports thread or comment: category (sara / defamation / threat / spam) + optional note (M0-16)
- [x] **6.31** Report confirmation copy — explains legal basis of each ITE category (pedagogy at point of friction). `CATEGORY_PEDAGOGY` copy lives in `mufakat-report-content`; rendered as the page-level confirmation banner on the thread page for both thread and comment reports. (M0-16)
- [x] **6.32** Semantic flagging — "Tandai: perdebatan definisi" button on comments, visually distinct (dashed border, indigo) from report flow (M0-14)
- [x] **6.33** 3+ flags on same chain → elevated admin queue priority — supported at DB level via `mufakat_semantic_flags.gte(3)` queries (M0-14)

### Admin Panel (`/moderasi` routes)

- [x] **6.34** `/moderasi` — admin dashboard: report queue, semantic flag queue (3+ flags = elevated priority), pending dedup-reference confirmations. Admin gate per-page (404 for non-admins) so `/moderasi/log` stays public. (TRD §11, §15)
- [x] **6.35** Report review — admin actions: dismiss / hide (sets `state='hidden'` or `hidden` flag) / escalate, via `mufakat-review-report` (M0-16)
- [x] **6.36** Semantic flag review — resolve by executing admin spin-off (link into `/moderasi/spinoff/[id]?dari=`) or dismiss via admin RLS update (M0-14)
- [x] **6.37** Dedup-reference confirmation — admin confirms or rejects pending dedup splits via `mufakat-confirm-dedup-reference`; pending = seed comment still visible (M0-09)
- [x] **6.38** `/moderasi/spinoff/[id]` — reply-chain selection UI (checkbox tree in nesting order, `?dari=` descendants preselected) + spin-off execution via `mufakat-admin-spinoff` (M0-13)
- [x] **6.39** `/moderasi/log` — public aggregate moderation log: action type + date only, no reporter/moderator identity (TRD §11, §15, M0-16)

### Thread Closing & Merging

- [x] **6.40** Close thread — OP/admin sets `selesai` (with closing summary via TipTap) or `pertanyaan_terbuka`; inline UI on thread page (M0-03)
- [x] **6.41** Merge duplicate — admin closes duplicate: status `dialihkan`, `redirect_to` set, optional comment move (M0-02)
- [x] **6.42** Parent markers reflect target thread state changes automatically via live read — no write-back (M0-15)

---

## 7. GitHub Actions

- [x] **7.1** `maintenance.yml` workflow — file created with `schedule` + `workflow_dispatch` triggers (TRD §10)
- [x] **7.2** `expire-op-windows` cron — every 15 minutes via `curl` to Supabase Edge Function (TRD §10)
- [x] **7.3** `update-dormant-status` cron — daily at midnight via `curl` to Supabase Edge Function (TRD §10)
- [x] **7.4** `SUPABASE_FUNCTIONS_URL` and `SUPABASE_SERVICE_KEY` secrets configured in repo (TRD §10) — points at production project `lxvpnlvvffehngonqijg` (Singapore); workflow sends both `Authorization: Bearer` and `apikey` headers so the new `sb_secret_…` key format works

---

## 8. Content Moderation (Process)

- [x] **8.1** Party creation review queue — saved SQL snippet "Party review queue (8.1/8.2)" in the production project's SQL Editor lists `parties.status = 'pending_review'` (TRD §15)
- [x] **8.2** Party approval flow — approve/reject statements documented in the same snippet (`status = 'active'` / `status = 'dissolved'`); target review time 24h is an operational practice (TRD §15)
- [x] **8.3** Mufakat post-moderation — threads/comments publish immediately, no pre-approval queue (TRD §15)

---

## 9. Performance, PWA & Polish

- [x] **9.1** PWA enabled — `manifest.webmanifest` + 192/512/maskable icons + theme-color per app; SvelteKit `src/service-worker.ts` precaches the app shell (TRD §14)
- [x] **9.2** Offline browsing — service worker: network-first with cache fallback for navigations and `__data.json`; visited parties/threads readable offline; session-bound routes (`/masuk`, `/buat`, `/moderasi`, `/notifikasi`, …) never cached; cross-origin (Supabase/Clerk) never intercepted (TRD §14)
- [x] **9.3** Touch targets — minimum 44×44px: `min-h-10`/`min-h-11` classes on all interactive elements; Tailwind v4 base ensures ≥44px (TRD §14)
- [x] **9.4** Base font size — 16px minimum, set in `app.css` (`html { font-size: 16px }`) (TRD §14)
- [x] **9.5** Mobile-first — single column on mobile (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), max-w-* containers (TRD §14)
- [x] **9.6** Loading states — top navigation progress bar (`navigating` from `$app/state`) in both root layouts covers all client-side transitions; SvelteKit SSR handles initial load.
- [x] **9.7** Error states — root `+error.svelte` per app (404 vs. generic with retry), offline banner in both layouts (`navigator.onLine` + online/offline events); share-card generation degrades to CSS card on network failure.
- [x] **9.8** Empty states — meaningful copy for empty party browse, empty thread list, empty comments ("Belum ada komentar — jadilah yang pertama menanggapi.")

---

## 10. Analytics Signals (Mufakat PRD Appendix B)

- [ ] **10.1** Dedup suggestion shown → accepted rate (does M0-02 redirect?)
- [ ] **10.2** Good-question reactions per comment distribution (floor of 5 calibrated?)
- [ ] **10.3** Split survival — % of split threads reaching 5+ comments
- [ ] **10.4** OP opt-out rate (is OP-ship perceived as burden?)
- [ ] **10.5** Split depth distribution (D3 pathology watch)
- [ ] **10.6** Spin-off lifecycle completion rate (Selesai vs. Pertanyaan Terbuka vs. abandoned)
- [ ] **10.7** Flag → spin-off conversion rate (precision baseline for future AI detection)
