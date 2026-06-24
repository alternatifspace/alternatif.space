# Lomba Balap Logo — Deploy Runbook

Status as of 2026-06-24. Implements PRD v0.2 / TRD v0.3.

This side project is **fully decoupled** from partai/mufakat: its own Supabase project,
its own R2 bucket, its own Cloudflare Pages deployment, Google-only Supabase Auth. None
of it touches Clerk or the shared `supabase/` directory.

## What's already done (by the build)

- `apps/lomba-balap-logo/` — complete SvelteKit app. `pnpm --filter lomba-balap-logo build`
  and `… check` both pass clean.
- Supabase project **`lomba-balap-logo`** provisioned and migrated:
  - ref `zuayjojbmzdyyhbktiom`, region `ap-southeast-1`
  - URL `https://zuayjojbmzdyyhbktiom.supabase.co`
  - publishable (anon) key `sb_publishable_HneoWbkLm4fyfVrit4lzaQ_8n2R2U1U`
  - migrations applied: `lbl_phase0`, `lbl_rls`, `lbl_security_hardening`
  - 5 tables (`lbl_profiles`, `lbl_config`, `lbl_submissions`, `lbl_likes`, `lbl_admins`),
    RLS on all, `lbl_config` seeded (contest close 2026-08-15 23:59 WIB, rate limits,
    `submissions_open=true`).
- Security advisors clean except one **intentional** warning (`lbl_account_age_ok`
  executable by `authenticated` — required by the RLS insert policies; reads only the
  caller's own row).

The public Supabase URL + anon key are already wired into `wrangler.toml` and `.env.example`.

## Remaining steps (human-gated — need your accounts/credentials)

### 1. Enable R2 + create the bucket
R2 is not yet enabled on the Cloudflare account (the MCP bucket-create returned
"Please enable R2 through the Cloudflare Dashboard"). Once enabled:

1. Cloudflare dashboard → R2 → **Enable** (adds a payment method; free tier is 10 GB,
   zero egress).
2. Create bucket **`lomba-balap-logo`** (matches `wrangler.toml` `[[r2_buckets]]`).
3. R2 → the bucket → Settings → **Public access** → connect custom domain
   **`img.lomba-balap-logo.alternatif.space`**. This is the read path (TRD §6); it's
   already set as `PUBLIC_R2_PUBLIC_HOST`.

(Or just say the word once R2 is enabled and I'll create the bucket via MCP.)

### 2. Google OAuth (Supabase Auth provider)
1. Google Cloud Console → APIs & Services → Credentials → **Create OAuth client ID**
   (type: Web application).
   - Authorized redirect URI: **`https://zuayjojbmzdyyhbktiom.supabase.co/auth/v1/callback`**
2. Supabase dashboard (project `lomba-balap-logo`) → Authentication → Providers →
   **Google** → enable, paste the Client ID + Client Secret.
3. Authentication → URL Configuration:
   - Site URL: **`https://lomba-balap-logo.alternatif.space`**
   - Additional redirect URLs: **`https://lomba-balap-logo.alternatif.space/auth/callback`**
     (and `http://localhost:5178/auth/callback` for local dev).

### 3. Turnstile (bot check on the submit form)
1. Cloudflare dashboard → Turnstile → **Add widget** for `lomba-balap-logo.alternatif.space`.
2. Put the **site key** into `wrangler.toml` `[vars] PUBLIC_TURNSTILE_SITE_KEY`
   (currently a placeholder).
3. Keep the **secret key** for step 4 (Pages secret `TURNSTILE_SECRET_KEY`).

### 4. Cloudflare Pages project
Mirror how partai/mufakat deploy (one Pages project per subdomain, wrangler-driven):

- Create a Pages project from the repo; **root directory** `apps/lomba-balap-logo`.
- Build command: `cd ../.. && pnpm install --filter lomba-balap-logo... && pnpm --filter lomba-balap-logo build`
- Build output: `.svelte-kit/cloudflare` (already set in `wrangler.toml`).
- Bind the R2 bucket: the `[[r2_buckets]]` binding `LBL_LOGOS` in `wrangler.toml` is read
  at build time; confirm it appears under Settings → Functions → R2 bindings.
- **Secrets** (Settings → Environment variables → add as *Secret*, never plaintext):
  - `SUPABASE_SERVICE_ROLE_KEY` — copy from Supabase dashboard → Project Settings → API →
    `service_role` key.
  - `TURNSTILE_SECRET_KEY` — from step 3.
- Public vars come from `wrangler.toml [vars]`; no need to re-enter them in the dashboard.

### 5. DNS
- `lomba-balap-logo.alternatif.space` → the Pages project (custom domain).
- `img.lomba-balap-logo.alternatif.space` → the R2 bucket (step 1).

### 6. Seed the first admin
After you sign in once via Google (so your `auth.users` row exists), run in the Supabase
SQL editor:

```sql
INSERT INTO lbl_admins (user_id)
SELECT id FROM auth.users WHERE email = 'YOUR_GOOGLE_EMAIL';
```

Then `/moderasi` unlocks for you (route is gated in `hooks.server.ts` + re-checked in the
moderation actions).

### 7. Optional cleanup
Delete the leftover empty Supabase Storage bucket **`logos`** (from the earlier draft)
via the dashboard — SQL deletes are blocked by `storage.protect_delete`. Its broad
listing policy was already dropped, so this is cosmetic.

## Local development

```bash
cp apps/lomba-balap-logo/.env.example apps/lomba-balap-logo/.env   # dummy Turnstile keys included
pnpm dev:lbl
```

- Google OAuth works locally only after the localhost redirect URL is added (step 2).
- The **R2 binding is not available under `vite dev`** — image upload (`/api/kirim`) needs
  the Cloudflare runtime. To exercise uploads locally, build then
  `wrangler pages dev .svelte-kit/cloudflare` from the app dir. Browsing/liking work under
  plain `vite dev`.

## Cost control (R2)

R2 charges **$0 egress at any volume** — the usual object-storage surprise (bandwidth)
does not apply. Billable dimensions are storage (~10 GB-month free, then ~$0.015/GB-mo)
and operations (1M Class A / 10M Class B free per month). At tens-of-KB WebP per image and
one live submission per account, 10 GB ≈ 150,000+ logos before any storage charge.

There is **no hard auto-stop cap** on R2 — Cloudflare's lever is **Budget Alerts**
(notification only): Manage Account → Billing → Billable Usage → Set Budget Alert. Set one
at **$1** so any spend at all emails you. Reaction levers if it ever fires:

- App kill switch (instant, no deploy): `UPDATE lbl_config SET value = 'false' WHERE key = 'submissions_open';`
- Storage is kept bounded in code: failed inserts, **withdraws, and rejects** all delete
  their R2 object, so only approved + pending images ever occupy the bucket.

## Operational levers (no redeploy)

All in `lbl_config`, editable from the Supabase SQL editor:

```sql
-- Pause new submissions instantly (kill switch):
UPDATE lbl_config SET value = 'false' WHERE key = 'submissions_open';
-- Move the close date:
UPDATE lbl_config SET value = '{"close_at":"2026-09-01T23:59:00+07:00"}' WHERE key = 'contest';
-- Tighten anti-abuse (e.g. require accounts to be 24h old):
UPDATE lbl_config SET value = jsonb_set(value, '{new_account_hours}', '24') WHERE key = 'rate_limits';
```
