# Lomba Balap Logo — PRD v0.2

## 1. Intent

A side project, deliberately separate in spirit from the core deliberation platform: a logo design contest, just for fun, with no prizes. It lives on its own subdomain with its own auth and its own data — decoupled from partai/mufakat identity and from the platform-wide "must join a party first" rule. Participating requires nothing more than a Google account.

## 2. Scope

**In scope:** submission, NSFW moderation queue, public feed, liking, leaderboard, a fixed contest close date.

**Out of scope:** prizes/rewards, party affiliation or gating, cross-posting to mufakat/partai, comments on submissions, editing an approved submission (resubmission = withdraw + submit again, still capped at one live submission per account).

## 3. Platform & Stack Decisions

- **New, isolated Supabase project** (Postgres + Supabase Auth) — decoupled from the partai/mufakat Supabase project and from Clerk. A single Google-backed Supabase Auth login covers both submitting and liking.
- **Images stored on Cloudflare R2**, not Supabase Storage. R2's free tier (10 GB storage, zero egress fees at any volume) is far more generous than Supabase Storage's free tier (1 GB, plus metered egress), and the project is already on Cloudflare Pages — this adds one R2 bucket rather than a new vendor.
- **App:** `apps/lomba-balap-logo` (SvelteKit + Tailwind), deployed to Cloudflare Pages at `lomba-balap-logo.alternatif.space`.
- **Table prefix `lbl_`** on all Postgres objects, consistent with the platform's per-subdomain namespacing convention (mirrors `mufakat_`).

## 4. User Flows

- **Sign in:** Google OAuth via Supabase Auth. Required to submit or like; browsing the feed is open to anyone, signed in or not.
- **Submit:** one image upload (client-side cropped, resized, and re-encoded to WebP — same pattern as partai's `LogoUpload.svelte`), a title, optional short caption. One live submission per account (L0-05); submitting again requires withdrawing the existing one first.
- **Moderation:** every submission lands in a private pending queue before it becomes visible in the feed. Manual approve/reject, mirroring mufakat's `/moderasi` pattern. Rejected submitters see a reason, not a silent disappearance, and may resubmit a different image (no cap on attempts — only one *live* submission at a time, per L0-05).
- **Feed:** approved submissions only, with a toggle between "Terpopuler" (likes desc) and "Terbaru" (recency).
- **Rules/FAQ page:** a public page, visible before sign-in, stating the rules in a casual tone — no NSFW, no rewards, one live entry, resubmission allowed if rejected, contest close date. Tone explicitly signals this is just for fun, not a formal platform feature.
- **Like:** signed-in users only. One like per (user, submission); self-likes blocked.
- **Contest close:** 2026-08-15 23:59 WIB. Leaderboard freezes. Winner = most likes; ties broken by earliest approval timestamp.

## 5. Data Model (sketch)

- `lbl_submissions`: id, user_id (FK auth.users), image_url (R2), title, caption, status (pending / approved / rejected), rejection_reason, created_at, approved_at
- `lbl_likes`: id, user_id, submission_id, created_at — unique on (user_id, submission_id)
- RLS: submissions readable by all once approved; insert/update restricted to owner; likes insertable only by authenticated users, uniqueness enforced at the DB level.

## 6. Requirements

- **L0-01** Sign-in via Google (Supabase Auth) required to submit or like.
- **L0-02** NSFW content disallowed; every submission passes a manual moderation queue before it appears in the public feed.
- **L0-03** No rewards of any kind for the winner.
- **L0-04** Public feed shows all approved submissions.
- **L0-05** One live submission per account.
- **L0-06** Winner determined by most likes as of contest close (2026-08-15 23:59 WIB); ties broken by earliest approval time.
- **L0-07** Liking requires a signed-in account; one like per account per submission; self-likes blocked.
- **L0-08** Images stored on Cloudflare R2; client-side resize/compress to WebP before upload (reuse LogoUpload pattern); hard server-side size cap as a backstop against a tampered client.
- **L0-09** Feed offers a toggle between "Terpopuler" (likes desc) and "Terbaru" (recency); no single fixed default sort.
- **L0-10** A rejected submission may be replaced with a different image; rejection is not final and does not block future attempts, only one live submission may exist at a time.
- **L0-11** A public rules/FAQ page, visible without signing in, states the rules (no NSFW, no rewards, one live entry, resubmission allowed, close date) in a casual, "just for fun" tone — not formal platform legal copy.

## 7. Storage & Moderation Policy

- **Client-side:** crop, resize to a fixed max dimension, re-encode to WebP — same approach as `LogoUpload.svelte`, which lands each file in the tens of KB.
- **Server-side backstop:** reject any upload over a hard cap server-side too — never trust the client alone.
- **Capacity:** R2's free tier (10 GB, zero egress fees) comfortably covers a contest at this scale; revisit only if it goes viral.
- **Not a permanent archive:** this is a contest with a close date, not indefinite storage. After 2026-08-15, decide whether to keep every image or archive only the winner + top N and delete the rest. Defer that decision to contest close, not now.

## 8. Open Questions

None outstanding as of v0.2.

## Changelog

- **v0.1** (2026-06-24): Initial draft.
- **v0.2** (2026-06-24): Resolved all open questions — feed gets a Terpopuler/Terbaru toggle (L0-09), rejected submitters may resubmit (L0-10), added a public casual-tone rules/FAQ page requirement (L0-11).
