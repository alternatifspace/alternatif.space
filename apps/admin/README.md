# admin — local-only platform-admin tool

A tiny SvelteKit app for the one thing the partai app can't do for itself in
Phase 0: **approving parties**. New parties are created as `pending_review` and
stay invisible until a platform admin promotes them to `active` (TRD §15, which
otherwise mandates doing this by hand in the Supabase SQL editor). This replaces
that raw-SQL step with a queue UI.

Scope is deliberately just the approval queue — nothing else.

## ⚠ This app must never be deployed

- It connects with the Supabase **service-role key**, which bypasses Row Level
  Security. That is fine on `localhost`, run by you; it is a disaster on the
  public internet.
- It has **no `build` script** on purpose, so `pnpm -r build` (the cloud build)
  skips it. **Do not add a `build` script.**
- **Do not create a Cloudflare Pages project** that points at `apps/admin`.

## Setup

1. From the repo root, install workspace deps:
   ```bash
   pnpm install
   ```
2. Create `apps/admin/.env` from the example and fill in **production** values:
   ```bash
   cp apps/admin/.env.example apps/admin/.env
   ```
   Get `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from
   Supabase Dashboard → Project Settings → API (use the `service_role` secret,
   not the anon key). `.env` is gitignored.

## Run

```bash
pnpm dev:admin
```

Open http://localhost:5199. The red banner is a reminder you are editing the
**live** database. Approve sets `status='active'`; Reject sets
`status='dissolved'`. Both are no-ops if the party is no longer `pending_review`.
