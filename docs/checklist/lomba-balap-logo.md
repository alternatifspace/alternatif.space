# Lomba Balap Logo — Build & Deploy Checklist

Implements PRD v0.2 / TRD v0.3. See `docs/deploy/lomba-balap-logo.md` for step detail.

## Code (done)

- [x] Scaffold SvelteKit app `apps/lomba-balap-logo/` (configs, wrangler, app shell, design tokens)
- [x] Wire into pnpm workspace + root `dev:lbl` script
- [x] Supabase Auth via `@supabase/ssr` (cookie sessions) — `hooks.server.ts`
- [x] Google OAuth routes — `auth/login`, `auth/callback`, `auth/signout`
- [x] Feed with Terpopuler/Terbaru toggle + leaderboard ranks (L0-04/L0-09)
- [x] Like / unlike (optimistic) — `api/like` (L0-07)
- [x] Submit flow: client WebP pipeline + Turnstile + R2 upload — `kirim` + `api/kirim` (L0-08)
- [x] One-live-submission + withdraw-to-resubmit (L0-05/L0-10)
- [x] Moderation queue: approve / reject with reason — `moderasi` (L0-02)
- [x] Public rules/FAQ page, casual tone — `aturan` (L0-11)
- [x] `pnpm build` + `pnpm check` pass clean

## Database (done)

- [x] Migration `lbl_phase0` — profiles trigger, config, submissions, likes, admins
- [x] Migration `lbl_rls` — all RLS policies
- [x] Migration `lbl_security_hardening` — pin `search_path`, revoke EXECUTE, drop draft artifacts
- [x] Verify: 5 `lbl_` tables, RLS enabled, config seeded
- [x] Security advisors clean (one intentional `lbl_account_age_ok` warning documented)

## Deploy (pending — human-gated)

- [ ] Enable R2 in Cloudflare; create bucket `lomba-balap-logo`; attach `img.` custom domain
- [ ] Google OAuth client → enable Google provider in Supabase; set Site/redirect URLs
- [ ] Turnstile widget → set `PUBLIC_TURNSTILE_SITE_KEY` in `wrangler.toml`
- [ ] Cloudflare Pages project (root `apps/lomba-balap-logo`); R2 binding; secrets
      `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`
- [ ] DNS: `lomba-balap-logo.` → Pages, `img.lomba-balap-logo.` → R2
- [ ] Seed first admin into `lbl_admins` after first Google sign-in
- [ ] (Optional) delete leftover empty Supabase Storage bucket `logos` via dashboard
