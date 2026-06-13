# Phase 0 Manual Test Cases — alternatif.space

> **Status:** Ready  
> **Scope:** All 78 features from partai PRD v0.3, mufakat PRD v0.1, www PRD v0.3, subdomain landings v0.1, TRD v1.3  
> **Scenarios:** 53 (44 Local, 9 Production) + 14 smoke test  
> **Format:** Each scenario = steps + expected result + edge cases. Check `[x]` when passed.  
> **Tracking:** Failed scenarios → open a GitHub issue with `bug` label, link inline.

### Environment Tags

| Tag | Meaning | Requires |
|-----|---------|----------|
| `[Local]` | Testable with `pnpm db:reset` + `pnpm dev` against `localhost:*` | Local Supabase, Clerk dev instance |
| `[Production]` | Must test against `*.alternatif.space` deployed URLs | Clerk prod, all subdomains deployed, real email |

> **Strategy:** Run all `[Local]` scenarios first — ~80% coverage. Then run the 9 `[Production]` scenarios after each deploy.

### Production-Only Scenarios

| Scenario | Why production-only |
|----------|---------------------|
| SC-A1 — Sign-up + email verification | Clerk dev doesn't send real emails |
| SC-A4 — Cross-subdomain SSO | `localhost:5173` ≠ `localhost:5174`, no shared `.alternatif.space` cookie |
| SC-F2 — Good-question split trigger | Requires 5+ accounts reacting simultaneously |
| SC-F3 — OP-ship: Confirm | Depends on SC-F2 split being created |
| SC-F4 — OP-ship: Decline | Depends on SC-F2 split being created |
| SC-F5 — Recursive split | Depends on SC-F2 split being created |
| SC-H3 — Service worker offline | PWA requires HTTPS (only on deployed domain) |
| SC-H5 — Notification bell | Notifications dispatched by Edge Functions, need real Clerk session |
| SC-W3 — Contact form | Resend delivers to real inbox; `RESEND_API_KEY` only in production |

---

## 1. Prerequisites

### Test Accounts (Local)

Clerk dev instance: create fresh accounts during testing. No pre-configured accounts exist.

### Test Accounts (Production)

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin | alternatifspace@gmail.com | (your password) | Platform admin |
| Member — Leader | (create in test) | — | Leads a party |
| Member — Regular | (create in test) | — | Joined a party |
| New User | (create fresh) | — | <48h account |
| Non-Member | (create fresh) | — | Signed in, no party |
| Anonymous | — | — | Not signed in |

### URLs

| Surface | Local | Production |
|---------|-------|------------|
| www (landing) | `http://localhost:5179` | `https://alternatif.space` |
| partai | `http://localhost:5173` | `https://partai.alternatif.space` |
| mufakat | `http://localhost:5174` | `https://mufakat.alternatif.space` |

### Seed Data (Local)

Run `pnpm db:reset` before starting. Confirms:
- 2 parties (one open, one invite-only), 5 users, 2 threads, 3 reactions
- 1 admin user (`alternatifspace@gmail.com`)
- If local db is empty, seed data is applied automatically

---

## 2. Auth & Onboarding

- [ ] **SC-A1 [Production] — Sign up and first login**
  **Covers:** P0-01, W0-01, W0-06  
  **Steps:**
  1. Visit `alternatif.space` — confirm landing renders with "Demokrasi itu otot." headline
  2. Register: **desktop** shows the inline Clerk sign-up form in the hero (no "Mulai Latihan" button — registration happens in place); **mobile** shows a "Mulai Latihan" button → `/daftar`
  3. Fill email + password → submit sign-up
  4. Complete email verification (check inbox)
  **Expected:** After verification, redirected to `/onboarding` on partai subdomain.
  **Edge:** Duplicate email → Clerk shows inline error. Short password → Clerk rejects with min-length message.

- [ ] **SC-A2 [Local] — First-login onboarding**
  **Covers:** P0-01, P0-02, 11.6a Part B  
  **Steps:**
  1. On `/onboarding`, confirm "Bendera di tangan. Tinggal dikibarin." headline
  2. Fill display name (required), leave bio empty (optional) → submit
  **Expected:** Redirected to `/bergabung`. Bio can be empty. Display name max 60 chars enforced.
  **Edge:** No name → form validation error. Name >60 chars → truncated by maxlength.

- [ ] **SC-A3 [Local] — Sign in / sign out**
  **Covers:** P0-01, T-01  
  **Steps:**
  1. Sign out → visit `/masuk` → confirm Pamflet-styled page with "Masuk, lanjut latihan."
  2. Enter credentials → submit
  3. After sign-in, confirm redirected to appropriate surface (party page if member, /jelajah if not)
  4. Sign out → confirm landing page renders again for anonymous users
  **Expected:** Auth state transitions correctly. No flash of signed-in content for signed-out users.
  **Edge:** Wrong password → Clerk error. Signed-in user visiting `/masuk` → redirected away.

- [ ] **SC-A4 [Production] — Cross-subdomain SSO**
  **Covers:** T-01, 1.8  
  **Steps:**
  1. Sign in on `partai.alternatif.space`
  2. Open `mufakat.alternatif.space` in same browser
  3. Open `alternatif.space` in same browser
  **Expected:** All three recognize the same session. www shows "Lanjut ke partai →" nav button. Mufakat shows user avatar.
  **Edge:** Different browser → not signed in. Cookie cleared → not signed in.

- [ ] **SC-A5 [Local] — Route gating (auth redirects)**
  **Covers:** T-18, T-19, P0-01  
  **Steps (as anonymous):**
  1. Visit `/buat-partai` → redirected to `/masuk`
  2. Visit `/onboarding` → redirected to `/masuk`
  3. Visit `/bergabung` → redirected to `/masuk` (after auth check fails)
  
  **Steps (as signed-in, no party):**

  4. Visit `/buat-partai` → allowed (no redirect)
  5. Visit `/partai/[any-slug]/bagikan` → allowed

  **Steps (on mufakat as anonymous):**

  6. Visit `/buat` → redirected to `partai.alternatif.space` sign-in
  7. Visit `/notifikasi` → redirected to `partai.alternatif.space`
  **Expected:** All redirects use 303. Redirect URLs preserve the intended destination.

---

## 3. Party Discovery & Profile

- [ ] **SC-B1 [Local] — Browse parties page**
  **Covers:** P0-03, SL-P02, SL-P04  
  **Prerequisites:** At least 2 parties from seed data.
  **Steps (as anonymous on partai.alternatif.space):**
  1. Visit `/jelajah`
  2. Confirm card grid shows parties with logo/name/tagline/membership-model/activity-status/member-count
  3. Toggle filter: membership model → "Terbuka" only → confirm filtered
  4. Toggle filter: activity status → "Aktif" only → confirm filtered
  5. Type in search box → confirm results narrow
  **Expected:** Cards render with `lp-card` styling. Dormant parties show dormant badge.
  **Edge:** No parties match filter → empty state shown. URL-encoded search term → works.

- [ ] **SC-B2 [Local] — Party profile page**
  **Covers:** P0-04  
  **Prerequisites:** An active party exists.
  **Steps:**
  1. Visit `/partai/[slug]`
  2. Confirm: logo, name, tagline visible in hero
  3. Confirm: status pills for activity status + membership model
  4. Confirm: manifesto rendered as HTML (read-only)
  5. Confirm: "Sikap saat ini" (current stance) shown if set
  6. Confirm: governance config values visible (membership model, thresholds)
  7. Confirm: member count + leader display name + last active indicator
  **Expected:** All profile sections render. No archetype label anywhere.
  **Edge:** Dormant party → dormant badge shown. Dissolved party → marked but visible. Non-existent slug → 404.

- [ ] **SC-B3 [Local] — Party member list**
  **Covers:** P0-04, P0-18  
  **Steps:**
  1. Visit `/partai/[slug]/anggota`
  2. Confirm member list with leader indicator
  3. Confirm member avatars and display names
  **Expected:** Leader has distinct indicator. Member count matches visible list.
  **Edge:** Party with 1 member (leader only) → still renders.

- [ ] **SC-B4 [Local] — User profile page**
  **Covers:** P0-02, T-14  
  **Steps:**
  1. Visit `/profil/[user-id]`
  2. Confirm: display name, bio (or empty), current party badge
  3. Confirm: "Riwayat partai" section with past memberships and dates
  **Expected:** Profile renders for any user (public). Party badge links to party profile.
  **Edge:** User with no party history → "Belum ada riwayat keanggotaan." Non-existent user ID → 404.

- [ ] **SC-B5 [Local] — Browse signed-out landing (partai)**
  **Covers:** SL-P01–SL-P05  
  **Steps (as anonymous):**
  1. Visit `partai.alternatif.space/`
  2. Confirm hero: "Bikin partai. Bukan nunggu izin." + stamp "TANPA IZIN"
  3. Confirm section 01 — Apa itu partai di sini
  4. Confirm section 02 — Tiga hal yang bikin beda (3 teaser cards)
  5. Confirm section 03 — Dua pintu: Dirikan + Gabung cells
  6. Confirm closing CTA: "Posisi yang nggak ditulis, nggak ngitung."
  7. Confirm footer links: alternatif.space, cara kerja, jelajah, kontak
  **Expected:** All sections render in Pamflet style. Scrolling reveals content. Tally divider present.
  **Edge:** Signed-in user visiting `/` → redirected to party page, not landing.

- [ ] **SC-B6 [Local] — Browse signed-out landing (mufakat)**
  **Covers:** SL-M01–SL-M06  
  **Steps (as anonymous):**
  1. Visit `mufakat.alternatif.space/`
  2. Confirm hero: "Tempat beda pendapat jadi bahan, bukan ribut."
  3. Confirm section 01 — Cara kerjanya (3-step)
  4. Confirm section 02 — "Ini bukan media sosial" inverted comparison table
  5. Confirm section 03 — Empat status diskusi
  6. Confirm section 04 — Kenapa bawa bendera
  7. Confirm closing CTA
  **Expected:** All sections render. Inverted ink band is the loudest visual moment.
  **Edge:** Signed-in user visiting `/` → renders feed (not landing).

---

## 4. Create Party Wizard

- [ ] **SC-C1 [Local] — Create party: Custom path (full wizard)**
  **Covers:** P0-05–P0-07, T-22, T-23  
  **Prerequisites:** Signed in, no current party membership.
  **Steps:**
  1. Visit `/buat-partai`
  2. Step 1: Select "Custom" → all governance parameters appear
  3. Fill all 6 parameters (cara gabung, thresholds, etc.) → CTA becomes enabled
  4. Step 2: Set party name, upload logo (JPG/PNG ≤2MB), write tagline, write manifesto ≥50 words in TipTap
  5. Step 3: Optional council toggle — leave off
  6. Step 4: Review all settings → click publish
  **Expected:** Party created with `status = 'pending_review'`. Redirected to party profile. Config permanently locked.
  **Edge:** Logo >2MB → rejected. Manifesto <50 words → CTA disabled. Name >80 chars → truncated. Missing required fields → CTA disabled.

- [ ] **SC-C2 [Local] — Create party: Preset path (Vanguard)**
  **Covers:** P0-05  
  **Steps:**
  1. Visit `/buat-partai`
  2. Step 1: Select "Vanguard" → governance params pre-filled (leader has full control)
  3. Skip to Step 2, fill required fields, publish
  **Expected:** Party created with Vanguard preset config values.
  **Edge:** Changing preset params after selection → CTA no longer shows preset-completion counter.

- [ ] **SC-C3 [Local] — Logo upload validation**
  **Covers:** P0-07, T-17  
  **Steps:**
  1. In wizard Step 2, upload a PNG → confirm preview shown (cropped to square)
  2. Upload a JPG → confirm accepted
  3. Try uploading a GIF → confirm rejected
  4. Try uploading >2MB file → confirm rejected
  **Expected:** Accepted formats: JPG, PNG, WebP. Square crop applied client-side.
  **Edge:** Upload fails mid-way → retry button appears.

- [ ] **SC-C4 [Local] — Manifesto editor**
  **Covers:** P0-06  
  **Steps:**
  1. In wizard Step 2, type manifesto text
  2. Apply H2, bold, italic, bullet list, numbered list, blockquote formatting
  3. Confirm word counter shows count
  4. Write <50 words → confirm CTA is disabled
  5. Write ≥50 words → confirm CTA enables
  **Expected:** TipTap editor with toolbar. Auto-save draft to localStorage. No image embed button.
  **Edge:** Leave page and return → draft restored. Paste formatted text → preserved.

- [ ] **SC-C5 [Local] — Governance config lockdown (T-22)**
  **Covers:** T-22, T-23, P0-05  
  **Steps:**
  1. Create a party with specific governance values
  2. Note the honeymoon end date
  3. Attempt to modify config via Supabase dashboard as authenticated user → blocked by RLS
  **Expected:** Config frozen at publish. `honeymoon_ends_at` = `created_at + 3 months`.
  **Edge:** Leader re-publishes same config → idempotent.

- [ ] **SC-C6 [Local] — Post-approval share (P0-13)**
  **Covers:** P0-13  
  **Prerequisites:** Party approved by admin (set status='active' via SQL).
  **Steps:**
  1. As leader, visit `/partai/[slug]/bagikan`
  2. Confirm share card preview renders (logo + name + tagline + branding)
  3. Click "Bagikan" → triggers Web Share API or shows copy-link fallback
  **Expected:** On mobile: native share sheet. On desktop: copy-link button copies URL.
  **Edge:** Web Share API unavailable → fallback shows clearly. Share card image failed to generate → CSS card fallback.

---

## 5. Joining & Membership

- [ ] **SC-D1 [Local] — Open join (instant)**
  **Covers:** P0-08  
  **Prerequisites:** An open-join party exists. Signed in, no membership.
  **Steps:**
  1. Visit `/partai/[open-party-slug]`
  2. Click "Gabung" CTA
  3. Confirm immediate redirect to post-join screen
  **Expected:** Membership created instantly. No approval step.
  **Edge:** Already a member of another party → prompt to leave first.

- [ ] **SC-D2 [Local] — Already-member gate**
  **Covers:** P0-08  
  **Prerequisites:** Signed in, member of Party A.
  **Steps:**
  1. Visit Party B's profile (different party)
  2. Click join → confirm warning: "Kamu sudah bergabung dengan Party A. Tinggalkan dulu?"
  **Expected:** Cannot join second party. Must leave current first.
  **Edge:** Leave flow triggered from gate → correct redirect.

- [ ] **SC-D3 [Local] — Application join**
  **Covers:** P0-09  
  **Prerequisites:** An application-only party exists. Signed in, no membership.
  **Steps:**
  1. Visit `/partai/[application-party-slug]`
  2. Click "Lamar" CTA
  3. Write application message (max 500 chars) → submit
  **Expected:** Application submitted. Confirmation shown: "Lamaran terkirim, menunggu review."
  **Edge:** Message >500 chars → rejected. Already pending application → duplicate rejected. Already member → blocked.

- [ ] **SC-D4 [Local] — Review application (leader)**
  **Covers:** P0-09  
  **Prerequisites:** An application exists for your party.
  **Steps (as leader):**
  1. Go to party management → see pending applications
  2. Approve one → confirm applicant is now a member
  3. Reject another → confirm applicant notified, not a member
  **Expected:** Approved → member row created + notification sent. Rejected → application status = 'rejected'.
  **Edge:** Applicant already joined another party → auto-rejected.

- [ ] **SC-D5 [Local] — Invite-only join**
  **Covers:** P0-10  
  **Prerequisites:** An invite-only party exists. You are a member.
  **Steps (as member):**
  1. Go to party page → click "Undang" / generate invite
  2. Copy invite link
  3. Open invite link in incognito/as another user → sign in
  **Expected:** Invite link redirects to party profile with pre-activated join. Single-use only.
  **Edge:** Expired invite (7+ days) → "Token sudah kadaluarsa." Already used → "Token sudah digunakan."

- [ ] **SC-D6 [Local] — Leave party**
  **Covers:** P0-11  
  **Prerequisites:** Member of a party (not leader).
  **Steps:**
  1. Visit `/profil/[your-id]` or party page
  2. Click "Tinggalkan Partai"
  3. Confirm dialog → confirm leave
  **Expected:** Membership removed. History log shows leave record. Past posts retain flag.
  **Edge:** Leader tries to leave → blocked ("Ketua tidak bisa meninggalkan partai"). Last member → still allowed to leave.

- [ ] **SC-D7 [Local] — Post-join nudge screen**
  **Covers:** P0-12  
  **Prerequisites:** Just joined a party.
  **Steps:**
  1. After joining, confirm two-stage screen:
     - Stage 1: "Kamu sekarang anggota [Party Name]"
     - Stage 2: "Bendera kamu sudah terpasang. Sekarang bawa posisimu ke diskusi."
  2. Click CTA to mufakat
  **Expected:** Cross-subdomain redirect to mufakat.
  **Edge:** Direct URL access without membership → redirected to party page.

---

## 6. Mufakat: Threads & Comments

- [ ] **SC-E1 [Local] — Create thread (happy path)**
  **Covers:** M0-01, M0-02, M0-06  
  **Prerequisites:** Signed in, active party member.
  **Steps:**
  1. Visit `/buat`
  2. Type title → confirm debounced dedup suggestions appear (if similar threads exist)
  3. Click a suggestion → opens existing thread in new tab
  4. Return, continue with own title, write body in TipTap → publish
  **Expected:** Thread created with status `aktif`. Redirected to thread page. OP shows party flag.
  **Edge:** Title >200 chars → rejected. Empty body → CTA disabled. Dedup suggestion shown but ignored → thread still created.

- [ ] **SC-E2 [Local] — Thread page rendering**
  **Covers:** M0-03, M0-04, M0-05, M0-06  
  **Prerequisites:** A thread with comments exists.
  **Steps:**
  1. Visit `/diskusi/[slug]`
  2. Confirm: OP post at top with status badge + party flag + timestamp
  3. Confirm: comments threaded with depth indication
  4. Confirm: party flags on each comment (matching author's party at post time)
  5. Confirm: deleted comments show "[dihapus]" stub
  **Expected:** Thread page renders correctly with all row types interleaved.
  **Edge:** Thread status = `dialihkan` → redirect to canonical. Invalid slug → 404.

- [ ] **SC-E3 [Local] — Comment creation**
  **Covers:** M0-05  
  **Prerequisites:** Active thread exists. Signed in, active party member.
  **Steps:**
  1. On thread page, type comment in composer
  2. Apply formatting (bold, italic, quote parent)
  3. Submit
  **Expected:** Comment appears inline. Party flag visible. Timestamp shown.
  **Edge:** Empty comment → rejected. Reply to comment at depth 3 → composer hidden (max depth reached).

- [ ] **SC-E4 [Local] — Comment edit window (15 min)**
  **Covers:** M0-05  
  **Steps:**
  1. Post a comment → edit button visible
  2. Edit text within 15 minutes → confirm "diedit" marker appears
  3. Wait 15+ minutes → edit button disappears
  **Expected:** 15-minute window enforced. "diedit" marker shown on edited comments.
  **Edge:** Another user tries to edit your comment → button not shown.

- [ ] **SC-E5 [Local] — Comment soft-delete**
  **Covers:** M0-05  
  **Steps:**
  1. Post a comment → delete it
  2. Confirm comment body replaced with "[dihapus]" stub
  3. Confirm replies to deleted comment still visible
  **Expected:** Structure preserved. Children still accessible.
  **Edge:** Admin hides comment (moderation) → "[disembunyikan moderator]" stub.

- [ ] **SC-E6 [Local] — Thread statuses**
  **Covers:** M0-03  
  **Prerequisites:** You are OP or admin of a thread.
  **Steps:**
  1. Close thread → set "Selesai" with closing summary → confirm status badge updates
  2. Open another thread → set "Pertanyaan Terbuka" → confirm status badge updates
  **Expected:** Status changes reflected immediately. Closing summary visible on thread page.
  **Edge:** Non-OP, non-admin tries to close → action hidden.

- [ ] **SC-E7 [Local] — Dedup suggestion → accepted rate**
  **Covers:** M0-02, 10.1  
  **Steps:**
  1. Create a thread with a title similar to an existing one → dedup suggestion shown
  2. Click the suggestion link → navigate to existing thread
  3. Query `analytics_dedup_rate` → confirm accepted count increments
  **Expected:** Dedup suggestions shown for similar titles (pg_trgm). Analytics view tracks acceptance.
  **Edge:** No similar threads → no suggestions shown (not an error).

- [ ] **SC-E8 [Local] — Rate limiting**
  **Covers:** M0-17, T-11  
  **Prerequisites:** New account (<48h).
  **Steps:**
  1. Create 2 threads → both succeed
  2. Attempt 3rd thread → 429 error with explanation in Indonesian
  3. Post 20 comments → succeed
  4. Attempt 21st comment → 429 error
  **Expected:** Limits enforced server-side. Error message explains the limit (not just "rate limited").
  **Edge:** Regular account (>48h) → 5 thread limit.

---

## 7. Reactions, Splits & OP-Ship

- [ ] **SC-F1 [Local] — Add reactions**
  **Covers:** M0-07  
  **Steps:**
  1. On a thread, click "Setuju" on OP post → count increments
  2. Click "Setuju" again → reaction removed (toggle/un-react)
  3. On a comment, click "Pertanyaan bagus" → count increments
  4. Try "Pertanyaan bagus" on a thread OP → rejected (comment-only)
  **Expected:** Two reaction types only. No downvote exists. Own reaction toggleable.
  **Edge:** Anonymous → reactions hidden/disabled. Non-member → reactions disabled.

- [ ] **SC-F2 [Production] — Good-question split trigger**
  **Covers:** M0-08, M0-09, M0-10, M0-11, T-06  
  **Prerequisites:** A thread with a comment that can accumulate 5+ good-question reactions.
  **Steps:**
  1. Have multiple users react "Pertanyaan bagus" on same comment until threshold met
  2. Confirm: new thread created from that comment
  3. Confirm: seed comment replaced with SplitPlaceholderCard (excerpt + link + status badge)
  4. Confirm: OP-ship prompt shown to comment author
  **Expected:** Split executes atomically. Comment moves, not copies. New thread slug unique.
  **Edge:** Threshold not met → no split. Threshold math never shown to client.

- [ ] **SC-F3 [Production] — OP-ship: Confirm**
  **Covers:** M0-09, T-07  
  **Steps:**
  1. As the comment author, click "Konfirmasi" on OP-ship prompt
  2. Confirm thread OP status confirmed
  **Expected:** You become the OP of the new thread.
  **Edge:** Window expired → auto-confirmed. 4h reminder notification sent.

- [ ] **SC-F4 [Production] — OP-ship: Decline**
  **Covers:** M0-09, M0-10  
  **Steps:**
  1. As the comment author, click "Tolak" on OP-ship prompt
  2. Confirm thread shows "Diangkat komunitas" badge
  3. Confirm `community_raised = true`
  **Expected:** Split still happens, but thread has no OP.
  **Edge:** Analytics `analytics_op_optout_rate` increments.

- [ ] **SC-F5 [Production] — Recursive split**
  **Covers:** M0-12, 10.5  
  **Prerequisites:** A split-originated thread with active discussion.
  **Steps:**
  1. Add good-question reactions to a comment in the split thread until threshold met
  2. Confirm second-level split executes
  3. Query `analytics_split_depth` → confirm depth=1 entry exists
  **Expected:** Recursive splitting works. No hard depth cap (throttled naturally by threshold).
  **Edge:** D3 pathology → monitored via analytics.

- [ ] **SC-F6 [Local] — Split survival tracking**
  **Covers:** 10.3, 10.6  
  **Steps:**
  1. Create conditions for a split
  2. Add 5+ comments to the split thread
  3. Query `analytics_split_survival` → confirm survived count
  4. Close the thread as "Selesai" → query `analytics_spinoff_lifecycle` → confirm status tracked
  **Expected:** Analytics views reflect real-time data.

---

## 8. Admin & Moderation

- [ ] **SC-G1 [Local] — Admin gate**
  **Covers:** T-12, M0-16  
  **Steps:**
  1. As admin, visit `/moderasi` → confirm dashboard renders with report queue + flagged queue
  2. As non-admin, visit `/moderasi` → confirm 404 or redirect
  **Expected:** Admin-only routes gated server-side.
  **Edge:** Direct URL access by non-admin → 404.

- [ ] **SC-G2 [Local] — Report content**
  **Covers:** M0-16  
  **Steps:**
  1. On any thread or comment, click "Laporkan"
  2. Select category (SARA/defamation/threat/spam) + optional note
  3. Submit → confirm confirmation with ITE legal basis explanation
  **Expected:** Report created with `status = 'pending'`. Pedagogy copy shown.
  **Edge:** Note >500 chars → rejected. Same user reporting same content twice → rejected.

- [ ] **SC-G3 [Local] — Review report (admin)**
  **Covers:** M0-16, T-12  
  **Prerequisites:** A pending report exists.
  **Steps (as admin):**
  1. Visit `/moderasi` → see report in queue
  2. Dismiss → confirm report status = 'dismissed'
  3. Hide → confirm content shows "[disembunyikan moderator]" stub
  4. Escalate → confirm escalation logged
  **Expected:** Moderation log updated with action type + date (no identity).
  **Edge:** Report already reviewed → 409.

- [ ] **SC-G4 [Local] — Semantic flagging**
  **Covers:** M0-14  
  **Steps:**
  1. On a comment, click "Tandai: perdebatan definisi"
  2. Confirm visual distinction from report flow (dashed border, indigo)
  3. Have 2 more users flag same comment → confirm 3+ flags = elevated priority in admin queue
  **Expected:** Flags grouped by comment_id. Admin queue prioritizes by flag count.
  **Edge:** Same user flagging twice → unique constraint blocks it.

- [ ] **SC-G5 [Local] — Admin spin-off**
  **Covers:** M0-13, M0-15, T-08, T-10  
  **Prerequisites:** A thread with flagged comments exists. Admin signed in.
  **Steps:**
  1. Visit `/moderasi/spinoff/[thread-id]`
  2. Select reply chain (checkbox tree)
  3. Execute spin-off → confirm new thread created with selected comments
  4. Confirm spin-off marker placed in source thread
  5. Close spin-off thread as "Selesai" with summary
  6. Return to source thread → confirm summary-back block renders live
  **Expected:** Marker + summary-back block resolve at render time (no write-back).
  **Edge:** No comments selected → validation error. Duplicate dedup → prompts merge.

---

## 9. Cross-Cutting

- [ ] **SC-H1 [Local] — RLS: Unauthenticated write blocked**
  **Covers:** T-02, T-03, T-04  
  **Steps:**
  1. As anonymous, attempt to insert a party via Supabase API → 401/403
  2. As anonymous, attempt to insert a thread → 401/403
  3. As authenticated non-member, attempt to insert a mufakat comment → 401/403
  **Expected:** All writes blocked for unauthorized roles. `mufakat_comments_public` view withholds hidden/deleted content.
  **Edge:** Service role bypasses RLS (expected — used by Edge Functions).

- [ ] **SC-H2 [Local] — Dormant status transition**
  **Covers:** T-05  
  **Steps:**
  1. Set a party leader's `last_active_at` to 31 days ago
  2. Trigger `update-dormant-status` cron (or query directly)
  3. Confirm party status flips to `dormant`
  4. Sign in as leader, visit party page → confirm status returns to `active`
  **Expected:** Cron marks dormant. Leader activity reactivates.
  **Edge:** Already dormant → no change. Dissolved party → not affected.

- [ ] **SC-H3 [Production] — Offline handling**
  **Covers:** PWA, 9.1, 9.2  
  **Steps:**
  1. Visit partai or mufakat, let pages cache
  2. Go offline (DevTools → Network → Offline)
  3. Navigate to previously visited party/thread → confirm content loads from cache
  4. Confirm offline banner: "Sedang offline — menampilkan konten tersimpan."
  5. Try visiting `/masuk` or `/buat` → confirm not served offline
  **Expected:** Service worker caches app shell + visited content. Auth routes never cached.
  **Edge:** Never-visited page → "Sedang offline dan halaman ini belum pernah dibuka."

- [ ] **SC-H4 [Local] — Error pages**
  **Covers:** Error states  
  **Steps:**
  1. Visit `/partai/nonexistent` → confirm 404 page with Pamflet styling
  2. Visit `/diskusi/nonexistent` → confirm 404 page
  3. Trigger a server error (e.g., malformed URL) → confirm error page with "Coba lagi" button
  **Expected:** Error pages styled consistently with lp-* tokens. Recovery links present.
  **Edge:** www has no custom error page (relies on Cloudflare Pages default).

- [ ] **SC-H5 [Production] — Notification bell**
  **Covers:** T-21  
  **Steps:**
  1. Receive a notification (e.g., OP-ship prompt, application review result)
  2. Confirm bell icon shows unread count
  3. Click bell → navigate to `/notifikasi`
  4. Confirm notification list with weighted items
  **Expected:** Bell visible in app chrome. Unread count accurate.
  **Edge:** No notifications → bell shows zero/empty state.

---

## 10. www Landing Page

- [ ] **SC-W1 [Local] — Landing page renders**
  **Covers:** W0-01–W0-07  
  **Steps:**
  1. Visit `alternatif.space`
  2. Confirm hero: "Demokrasi itu otot." + "Mulai Latihan" CTA
  3. Scroll: confirm Cara kerjanya (3-step), KBBI band (inverted "par·tai"), Empat ruang (4 cards), Aturan main (4 governance items), closing CTA
  4. Confirm footer with subdomain links + kontribusi + kontak
  **Expected:** All sections render. Amber accent, bone background, Archivo Black display font, Space Grotesk body.
  **Edge:** Signed-in user → "Lanjut ke partai →" in nav instead of "Masuk."

- [ ] **SC-W2 [Local] — SEO meta tags**
  **Covers:** W0-06  
  **Steps:**
  1. View page source of `alternatif.space`
  2. Confirm `<link rel="canonical">`, `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">`
  3. Confirm `<html lang="id">`
  **Expected:** All OG + Twitter tags present. Canonical URL correct.
  **Edge:** Dynamic pages (partai/[slug]) → party-specific OG tags.

- [ ] **SC-W3 [Production] — Contact page**
  **Covers:** Kontak page  
  **Steps:**
  1. Visit `/kontak`
  2. Confirm mailto link: `sapa@alternatif.space`
  3. Fill form → submit → confirm success message
  4. Fill honeypot → submit → confirm silent no-op (looks like success, no email sent)
  **Expected:** Form submits to `/api/contact`. Resend delivers to inbox.
  **Edge:** Missing fields → validation errors. Network offline → error message.

- [ ] **SC-W4 [Local] — `/cara-kerja` deep-dive (partai)**
  **Covers:** SL-PD01–SL-PD07  
  **Steps:**
  1. Visit `partai.alternatif.space/cara-kerja`
  2. Confirm all sections: Manifesto, Konfigurasi (full table), Honeymoon, Petisi & Recall, Post-Honeymoon, Closing CTA
  3. Confirm governance numbers match PRD (10–50% petition threshold, 50%+1–75% recall threshold, etc.)
  **Expected:** Full parameter table visible. Inverted band for recall section. Stamps on each section.
  **Edge:** CQ4 — numbers PRD-locked; flag if Phase 1 retunes.

---

## 11. Regression Smoke Test

Run before every deploy. ~5 minutes local, ~3 minutes production.

### Local Smoke Test (`pnpm dev` on `localhost:*`)

- [ ] **SMK-L1** — `localhost:5179` loads, "Demokrasi itu otot." visible
- [ ] **SMK-L2** — `localhost:5173` — signed-out sees landing; sign in → redirected to party/jelajah
- [ ] **SMK-L3** — `localhost:5174` — signed-out sees landing; sign in → renders feed
- [ ] **SMK-L4** — Sign up → onboarding → create party → publish (end-to-end)
- [ ] **SMK-L5** — Join a party → post a comment on mufakat → react
- [ ] **SMK-L6** — Admin: visit `/moderasi` → queue visible
- [ ] **SMK-L7** — `/cara-kerja` → governance table renders
- [ ] **SMK-L8** — Error page: visit `/partai/nonexistent` → 404 with Pamflet styling

### Production Smoke Test (after deploy, `*.alternatif.space`)

- [ ] **SMK-P1** — `alternatif.space` loads, signed-in detection works
- [ ] **SMK-P2** — `partai.alternatif.space` loads (signed-out → landing; signed-in → redirect)
- [ ] **SMK-P3** — `mufakat.alternatif.space` loads (signed-out → landing; signed-in → feed)
- [ ] **SMK-P4** — Cross-subdomain SSO: sign in on partai → open mufakat → session recognized
- [ ] **SMK-P5** — `/kontak` → form submits, email lands in inbox
- [ ] **SMK-P6** — PWA: visit on mobile → "Add to Home Screen" prompt

---

## 12. Coverage Matrix

| Feature ID | Feature | Scenario(s) |
|-----------|---------|-------------|
| P0-01 | Sign up / Log in | SC-A1, SC-A2, SC-A3 |
| P0-02 | User profile | SC-A2, SC-B4 |
| P0-03 | Browse parties | SC-B1 |
| P0-04 | Party profile | SC-B2, SC-B3 |
| P0-05 | Create party wizard | SC-C1, SC-C2, SC-C5 |
| P0-06 | Manifesto editor | SC-C4 |
| P0-07 | Logo upload | SC-C3 |
| P0-08 | Open join | SC-D1, SC-D2 |
| P0-09 | Application join | SC-D3, SC-D4 |
| P0-10 | Invite-only join | SC-D5 |
| P0-11 | Leave party | SC-D6 |
| P0-12 | Post-join nudge | SC-D7 |
| P0-13 | Share card | SC-C6 |
| M0-01 | Thread creation | SC-E1 |
| M0-02 | Dedup at creation | SC-E1, SC-E7 |
| M0-03 | Thread statuses | SC-E6 |
| M0-04 | Thread page | SC-E2 |
| M0-05 | Comments | SC-E3, SC-E4, SC-E5 |
| M0-06 | Party flag display | SC-E1, SC-E2 |
| M0-07 | Reactions | SC-F1 |
| M0-08 | Split threshold | SC-F2 |
| M0-09 | Split + OP-ship | SC-F2, SC-F3, SC-F4 |
| M0-10 | Reference placeholder | SC-F2 |
| M0-11 | Move semantics | SC-F2 |
| M0-12 | Recursive splitting | SC-F5 |
| M0-13 | Admin spin-off | SC-G5 |
| M0-14 | Semantic flagging | SC-G4 |
| M0-15 | Summary-back block | SC-G5 |
| M0-16 | Report & review | SC-G2, SC-G3 |
| M0-17 | Rate limiting | SC-E8 |
| W0-01–07 | www landing | SC-W1, SC-W2 |
| SL-P01–05 | partai landing | SC-B5 |
| SL-PD01–07 | cara-kerja deep-dive | SC-W4 |
| SL-M01–06 | mufakat landing | SC-B6 |
| T-01 | Cross-subdomain SSO | SC-A4 |
| T-02–04 | RLS enforcement | SC-H1 |
| T-05 | Dormant status | SC-H2 |
| T-06 | Split execution | SC-F2 |
| T-07 | OP-ship lifecycle | SC-F3 |
| T-08 | Admin spin-off | SC-G5 |
| T-10 | Summary-back block | SC-G5 |
| T-11 | Rate limiting | SC-E8 |
| T-12 | Content moderation | SC-G3 |
| T-13 | Edge function atomicity | SC-F2 (implicit) |
| T-14 | Party flag denorm | SC-B4, SC-E2 |
| T-15 | Muted member | (manual SQL — local or prod) |
| T-17 | Storage policies | SC-C3 |
| T-18 | Route gating | SC-A5 |
| T-19 | Deep linking | SC-A5 |
| T-21 | Notification bell | SC-H5 [Production] |
| T-22 | Config lockdown | SC-C5 |
| T-23 | Honeymoon | SC-C5 |
| 10.1–10.7 | Analytics views | SC-E7 [Local], SC-F6 [Local] — query prod for real data |

---

## 13. Notes

- **Workflow:** Run all `[Local]` scenarios first (`pnpm db:reset && pnpm dev`). Then `[Production]` scenarios after deploy.
- **Local testing:** Run `pnpm db:reset` first, then test against `localhost:*` URLs with Clerk dev instance.
- **Production testing:** Run against `*.alternatif.space` URLs. Requires Clerk prod, all subdomains deployed, Resend configured.
- **Multi-user scenarios (SC-F2–F5):** Requires 5+ accounts reacting. Test in production or seed local DB with extra users.
- **SC-A1 (email verification):** Production only — Clerk dev doesn't send real emails. Skip locally; test during prod run.
- **Muted member (T-15):** Update `party_members.status = 'muted'` via SQL to test flagless rendering.
- **Analytics views (10.1–10.7):** Query from Supabase SQL Editor → `SELECT * FROM analytics_*`.

### Email strategy (production testing)

Use Gmail plus-aliases — they go to the same inbox, Clerk sees distinct addresses:

| Alias | Use for |
|-------|---------|
| `alternatifspace+admin@gmail.com` | Admin |
| `alternatifspace+leader1@gmail.com` | Party leader |
| `alternatifspace+member1@gmail.com` | Party member |
| `alternatifspace+anon1@gmail.com` | Non-member |
| `alternatifspace+new1@gmail.com` | New user (<48h) |

All verification emails land in `alternatifspace@gmail.com`. No fake-mail service needed.

### Cleaning up production data

Run `supabase/snippets/cleanup-test-data.sql` in Supabase SQL Editor. Purges all tables in correct order. Keeps `alternatifspace@gmail.com` admin account.

After SQL cleanup, delete test Clerk users at: [dashboard.clerk.com → Users](https://dashboard.clerk.com)
