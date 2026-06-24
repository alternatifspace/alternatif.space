# Lomba Balap Logo — TRD v0.2

Implements PRD v0.2 (`docs/prd/lomba-balap-logo-v0.1.md`). This is a standalone side
project: its own Supabase project, its own Cloudflare Pages app, its own migrations
directory — none of it lives in the shared `supabase/` used by partai/mufakat, and it
does not depend on Clerk.

## 1. Project Topology

```
apps/lomba-balap-logo/        # SvelteKit + Tailwind, adapter-cloudflare
  supabase/
    migrations/                # this app's own migration history, independent of root supabase/
  src/lib/server/upload.ts     # R2 write path (binding-based, see §6)
  src/routes/
    +page.svelte               # feed (Terpopuler/Terbaru toggle)
    kirim/+page.svelte          # submit flow
    moderasi/+page.svelte       # admin queue (mirrors mufakat's /moderasi UX, not its code)
```

Because auth and data are fully decoupled from the rest of the platform (per PRD §3),
this app gets its **own Supabase project** — separate URL, separate anon key, separate
free-tier quota. Do not reuse `PUBLIC_SUPABASE_URL` from partai/mufakat's `.env`.

## 2. Auth Model

Supabase Auth (not Clerk) with the Google provider enabled in the new project's Auth
settings. `auth.uid()` is usable directly in RLS — no `clerk_uid()` bridging function,
no JWT template, no `sub`-is-text workaround. This is the main simplification of going
standalone (L0-01).

A trigger mirrors new sign-ins into a public profile row, since `auth.users` itself
isn't exposed to clients:

```sql
CREATE TABLE lbl_profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url   text,
  created_at   timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION lbl_handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO lbl_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER lbl_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION lbl_handle_new_user();

ALTER TABLE lbl_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lbl_profiles_public_read" ON lbl_profiles FOR SELECT USING (true);
CREATE POLICY "lbl_profiles_own_update"  ON lbl_profiles FOR UPDATE USING (id = auth.uid());
```

## 3. Contest Window (config table)

A single-row config table, same pattern as the main platform's `platform_config`,
drives the close date so it's adjustable without a redeploy:

```sql
CREATE TABLE lbl_config (
  key   text PRIMARY KEY,
  value jsonb NOT NULL
);

INSERT INTO lbl_config (key, value) VALUES
  ('contest', '{"close_at": "2026-08-15T23:59:00+07:00"}'),
  -- new_account_hours: 0 at launch (no minimum) — tune upward later without a
  -- deploy if bulk fake-account abuse actually shows up.
  ('rate_limits', '{"new_account_hours": 0,
                     "submission_attempts_per_day": 3,
                     "likes_per_day": 50}'),
  -- Admin kill-switch (§9): flip to false from the SQL editor to instantly
  -- pause new submissions if the moderation queue floods, independent of the
  -- contest close date.
  ('submissions_open', 'true');

CREATE OR REPLACE FUNCTION lbl_contest_open()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT now() < (SELECT (value->>'close_at')::timestamptz FROM lbl_config WHERE key = 'contest')
$$;

CREATE OR REPLACE FUNCTION lbl_submissions_open()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT coalesce((SELECT value::boolean FROM lbl_config WHERE key = 'submissions_open'), true)
$$;

-- SECURITY DEFINER: auth.users isn't selectable by the authenticated role
-- directly, so this reads the caller's own created_at with elevated rights —
-- it only ever evaluates auth.uid(), never an arbitrary id.
CREATE OR REPLACE FUNCTION lbl_account_age_ok()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT extract(epoch FROM (now() - u.created_at)) / 3600
           >= coalesce((SELECT (value->>'new_account_hours')::numeric
                         FROM lbl_config WHERE key = 'rate_limits'), 0)
  FROM auth.users u WHERE u.id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION lbl_submissions_today(uid uuid)
RETURNS int LANGUAGE sql STABLE AS $$
  SELECT count(*) FROM lbl_submissions
  WHERE user_id = uid AND created_at > now() - interval '1 day'
$$;

CREATE OR REPLACE FUNCTION lbl_likes_today(uid uuid)
RETURNS int LANGUAGE sql STABLE AS $$
  SELECT count(*) FROM lbl_likes
  WHERE user_id = uid AND created_at > now() - interval '1 day'
$$;
```

`lbl_contest_open()` gates both submission inserts and like inserts (§5) — once the
window closes, the leaderboard is read-only (L0-06). The remaining four functions are
the anti-abuse layer detailed in §9 — see there for the threat model they answer to.

## 4. Schema

```sql
CREATE TABLE lbl_submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) NOT NULL,
  image_key       text NOT NULL,             -- R2 object key, not a full URL (§6)
  title           text NOT NULL CHECK (char_length(title) <= 80),
  caption         text CHECK (char_length(caption) <= 280),
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  like_count      int NOT NULL DEFAULT 0,    -- denormalized, maintained by trigger below
  created_at      timestamptz DEFAULT now(),
  approved_at     timestamptz
);

-- L0-05: one *live* submission per account. Rejected rows are excluded, so a
-- rejected user can immediately submit again (L0-10) without an explicit delete step.
CREATE UNIQUE INDEX lbl_submissions_one_live_idx
  ON lbl_submissions (user_id)
  WHERE status IN ('pending', 'approved');

CREATE INDEX lbl_submissions_feed_likes_idx ON lbl_submissions (like_count DESC, created_at DESC)
  WHERE status = 'approved';
CREATE INDEX lbl_submissions_feed_recent_idx ON lbl_submissions (created_at DESC)
  WHERE status = 'approved';

CREATE TABLE lbl_likes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) NOT NULL,
  submission_id uuid REFERENCES lbl_submissions(id) NOT NULL,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (user_id, submission_id)             -- L0-07: one like per account per submission
);

CREATE TABLE lbl_admins (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION lbl_is_admin()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM lbl_admins WHERE user_id = auth.uid())
$$;
```

The two partial indexes back the feed's Terpopuler/Terbaru toggle (L0-09) directly —
no separate materialized view needed at this scale.

`like_count` is denormalized to avoid a `COUNT()` join on every feed render, kept in
sync by trigger:

```sql
CREATE OR REPLACE FUNCTION lbl_sync_like_count()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE lbl_submissions SET like_count = like_count + 1 WHERE id = NEW.submission_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE lbl_submissions SET like_count = like_count - 1 WHERE id = OLD.submission_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER lbl_likes_sync
  AFTER INSERT OR DELETE ON lbl_likes
  FOR EACH ROW EXECUTE FUNCTION lbl_sync_like_count();
```

## 5. RLS Policies

```sql
ALTER TABLE lbl_submissions ENABLE ROW LEVEL SECURITY;

-- Public feed sees only approved rows; the owner can always see their own
-- (pending/rejected included, so they can read a rejection_reason); admins see all.
CREATE POLICY "lbl_submissions_read" ON lbl_submissions
  FOR SELECT USING (
    status = 'approved' OR user_id = auth.uid() OR lbl_is_admin()
  );

-- Clients may only ever insert as 'pending' — approval/rejection happens
-- server-side with the service role (§7), never via a client UPDATE policy.
-- The four trailing checks are the anti-abuse layer (§9): open window, kill
-- switch, account-age floor (0h at launch, tunable), and a daily attempt cap
-- so the reject-and-resubmit path (L0-10) can't be turned into a flood.
CREATE POLICY "lbl_submissions_insert" ON lbl_submissions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND status = 'pending' AND
    lbl_contest_open() AND lbl_submissions_open() AND lbl_account_age_ok() AND
    lbl_submissions_today(auth.uid())
      < coalesce((SELECT (value->>'submission_attempts_per_day')::int
                   FROM lbl_config WHERE key = 'rate_limits'), 3)
  );
-- No UPDATE/DELETE policy for regular users: status transitions are admin-only
-- and go through a server route with the service-role key (§7).

ALTER TABLE lbl_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lbl_likes_read" ON lbl_likes
  FOR SELECT USING (true);   -- not sensitive; needed client-side to render "you liked this"

CREATE POLICY "lbl_likes_insert" ON lbl_likes
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    lbl_contest_open() AND lbl_account_age_ok() AND
    lbl_likes_today(auth.uid())
      < coalesce((SELECT (value->>'likes_per_day')::int FROM lbl_config WHERE key = 'rate_limits'), 50) AND
    EXISTS (
      SELECT 1 FROM lbl_submissions
      WHERE id = submission_id AND status = 'approved' AND user_id <> auth.uid()  -- L0-07: no self-like
    )
  );

CREATE POLICY "lbl_likes_delete_own" ON lbl_likes
  FOR DELETE USING (user_id = auth.uid());   -- unlike

ALTER TABLE lbl_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lbl_admins_read" ON lbl_admins FOR SELECT USING (lbl_is_admin());
-- No insert/update/delete policy: admins are seeded manually via SQL editor (§10).

ALTER TABLE lbl_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lbl_config_public_read" ON lbl_config FOR SELECT USING (true);
-- No write policy: edited manually via SQL editor if the close date ever moves.
```

## 6. Image Storage (Cloudflare R2)

R2 is reached two different ways depending on direction, deliberately avoiding any S3
SDK or signing keys:

- **Writes** go through a SvelteKit server route using the app's native R2 **binding**
  (declared in `wrangler.toml`, like the existing Supabase/Clerk vars). Because the app
  already runs on `adapter-cloudflare`, the binding is available as `platform.env` in
  any `+server.ts` — no AWS SDK, no presigned URLs, no R2 access keys to manage.
- **Reads** bypass the app entirely: the bucket gets a public custom domain (e.g.
  `img.lomba-balap-logo.alternatif.space`), configured once in the Cloudflare dashboard.
  Browsers load images straight from Cloudflare's edge — zero load on the SvelteKit app,
  zero egress cost (R2 has none) regardless of how viral the feed gets.

```toml
# apps/lomba-balap-logo/wrangler.toml (addition to the existing vars block pattern)
[[r2_buckets]]
binding = "LBL_LOGOS"
bucket_name = "lomba-balap-logo"
```

```ts
// src/routes/kirim/+server.ts (sketch)
export async function POST({ request, locals, platform }) {
  const user = await requireUser(locals);              // 401 if not signed in

  const form = await request.formData();
  const turnstileOk = await verifyTurnstile(
    form.get('cf-turnstile-response'), platform!.env.TURNSTILE_SECRET_KEY
  );
  if (!turnstileOk) return json({ error: 'bot_check_failed' }, { status: 403 });

  // Checked here, BEFORE the R2 write — this is the step that actually costs
  // money/quota. RLS (§5) re-checks the same cap on the DB insert that
  // follows, but that's too late to stop someone hammering this route with
  // requests that never reach the insert (§9).
  const attemptsToday = await supabaseServer.rpc('lbl_submissions_today', { uid: user.id });
  if (attemptsToday >= DAILY_SUBMISSION_CAP) return json({ error: 'rate_limited' }, { status: 429 });

  const blob = await request.blob();                    // already WebP, already resized client-side (§8)
  if (blob.size > MAX_UPLOAD_BYTES) return json({ error: 'too_large' }, { status: 413 });
  if (!isWebpSignature(await blob.slice(0, 16).arrayBuffer())) {
    return json({ error: 'invalid_format' }, { status: 415 });  // never trust client Content-Type alone
  }

  const key = `${user.id}/${crypto.randomUUID()}.webp`;
  await platform!.env.LBL_LOGOS.put(key, blob, { httpMetadata: { contentType: 'image/webp' } });

  // lbl_submissions insert happens here too (service-role-free — RLS covers it, §5)
  return json({ image_key: key });
}
```

The hard server-side size cap (L0-08) is enforced before the R2 `put()` call, on top of
the client-side resize in §8 — a tampered client cannot bypass it.

## 7. Moderation

Approve/reject is **not** an RLS-governed client write. It's a server route gated by
`lbl_is_admin()`, using the Supabase **service role key** (server-only, never shipped to
the client) to perform the actual update — consistent with the main platform's rule
that multi-step or privileged writes go through a server layer, never a direct client
table write:

```ts
// src/routes/moderasi/+page.server.ts (sketch)
export const actions = {
  approve: async ({ locals, request }) => {
    const admin = await requireAdmin(locals);  // checks lbl_is_admin() for the caller, 403 otherwise
    const id = (await request.formData()).get('id');
    await supabaseServiceRole
      .from('lbl_submissions')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', id);
  },
  reject: async ({ locals, request }) => {
    const admin = await requireAdmin(locals);
    const form = await request.formData();
    await supabaseServiceRole
      .from('lbl_submissions')
      .update({ status: 'rejected', rejection_reason: form.get('reason') })
      .eq('id', form.get('id'));
  }
};
```

A rejected row is never deleted (L0-10) — it just falls out of the unique-live-index in
§4, so the user's next insert succeeds normally.

## 8. Client-Side Image Pipeline

Reuses partai's `LogoUpload.svelte` approach (crop → resize → re-encode), same
constants, copy-pasted for now rather than shared — extracting a common component into
`packages/ui` is a reasonable follow-up once a second consumer exists, not a blocker
for this side project:

- Accept JPG/PNG/WebP, reject anything else client-side.
- Reject originals over 2MB before processing.
- Canvas-crop, scale to a fixed max dimension, re-encode to WebP at quality ~0.85.
- Output typically lands in the tens of KB — comfortably inside R2's free 10GB tier
  even at several thousand submissions.

## 9. Anti-Abuse & Operational Safety

Google login (L0-01) raises the cost of one bot from zero to "create a Google
account" — a real deterrent against casual scripts, but not against someone willing to
script account creation at scale or buy aged accounts. So it's one layer, not the whole
plan. Three distinct failure modes, three different defenses:

**Vote brigading** (many fake accounts each casting one legitimate-looking like) is
handled by `likes_per_day` in `lbl_config.rate_limits` (default 50/day/account) plus the
existing one-like-per-account-per-submission constraint. A brigade still needs many
accounts, but each account is now bounded.

**Queue/storage flooding** (many fake accounts each submitting garbage, to bury real
entries or run up moderation work and R2 writes) is handled by Turnstile on the
submission form — filtering out headless-browser bots before they ever reach
Supabase or R2 — plus `submission_attempts_per_day` (default 3), which closes the gap
that L0-10 (resubmission after rejection) would otherwise leave open: without this cap,
"you can always resubmit" would mean "you can resubmit infinitely fast." Note the
upload route checks this cap *before* the R2 write (§6), not only via the RLS insert
check — RLS alone would still let an attacker pay R2 write costs on every attempt even
if every resulting row gets rejected.

**Bulk fresh-account creation** is the hardest of the three to fully stop and the one
where over-engineering a fun side project isn't worth it. `new_account_hours` exists in
config for exactly this — it ships at `0` (no minimum, per your call, to keep launch
frictionless) but can be raised from the SQL editor in minutes, no deploy, if bulk
fake-account signups actually show up.

**Volumetric/DDoS traffic** needs no app-level handling — Cloudflare's network absorbs
it in front of everything else in this stack, same as it does for partai/mufakat.

**Operational kill-switch:** `lbl_config.submissions_open` (default `true`). Set to
`false` from the SQL editor to instantly pause new submissions — e.g. if the moderation
queue floods faster than it can be reviewed — without touching the contest close date
or doing a deploy:

```sql
UPDATE lbl_config SET value = 'false' WHERE key = 'submissions_open';
```

**Visibility:** no dedicated dashboard for v1 — the Supabase project dashboard's table
row counts and Cloudflare's request analytics are enough to notice a spike at this
scale. Worth revisiting only if the contest actually goes viral.

**Out of scope for v1, noted for completeness:** an edge-level (Cloudflare Rate Limiting
Rule, by IP) backstop on the upload route. Skipped for now because IP-based limits have
real false-positive risk (NAT, mobile carriers, campus Wi-Fi all share IPs) and the
per-account + Turnstile layers above already cover the realistic threat at this scale.
Easy to add later purely in the Cloudflare dashboard if needed — no code change.

## 10. Manual Setup Steps (not migrations)

1. Create the new Supabase project; enable the Google provider under Authentication →
   Providers; set the OAuth redirect URL to the app's domain.
2. Create the R2 bucket `lomba-balap-logo`; attach a public custom domain for reads.
3. Add the `[[r2_buckets]]` binding to `wrangler.toml`; add `PUBLIC_SUPABASE_URL` /
   `PUBLIC_SUPABASE_ANON_KEY` for *this* project to Cloudflare Pages env vars (separate
   from partai/mufakat's).
4. Create a Cloudflare Turnstile widget for the domain; add `PUBLIC_TURNSTILE_SITE_KEY`
   as a public var and `TURNSTILE_SECRET_KEY` as a Cloudflare Pages **secret** (never a
   plaintext var — same treatment as `CLERK_SECRET_KEY` elsewhere in this repo).
5. After the first admin (Kenni) signs in once via Google, manually insert their
   `auth.users.id` into `lbl_admins` via the Supabase SQL editor.

## 11. Migration File Plan

```
apps/lomba-balap-logo/supabase/migrations/
  00001_lbl_phase0.sql   -- §2-§4: profiles trigger, config, submissions, likes, admins
  00002_lbl_rls.sql      -- §5: all RLS policies
```

## Changelog

- **v0.1** (2026-06-24): Initial draft, implements PRD v0.2.
- **v0.2** (2026-06-24): Added §9 Anti-Abuse & Operational Safety — rate-limit config
  (`new_account_hours`, `submission_attempts_per_day`, `likes_per_day`), the
  `submissions_open` kill switch, and Turnstile on the submission form. Updated §3-§6
  accordingly; renumbered §9-§11.
- **v0.3** (2026-06-24): Build reconciliations made during implementation. (1) Auth is
  implemented with `@supabase/ssr` cookie sessions; routes `auth/login`, `auth/callback`,
  `auth/signout` handle the Google OAuth round-trip. (2) `lbl_likes.submission_id` gets
  `ON DELETE CASCADE` (was a bare FK) so a withdrawn/removed submission takes its likes
  with it. (3) Withdraw (PRD L0-05/L0-10 "resubmit = withdraw + submit again") is a
  server action on `/kirim` using the service role after an ownership check — regular
  users still have no client DELETE policy (§5 unchanged in spirit). (4) `search_path`
  pinned on every `lbl_` function; `lbl_handle_new_user` EXECUTE revoked from API roles;
  `lbl_account_age_ok` EXECUTE revoked from `anon`. (5) Pre-canonical draft artifacts
  removed: tables `logo_submissions`/`logo_votes`, function `cast_vote`, and the broad
  `storage.objects` listing policy "Public read logos". The empty Supabase Storage
  `logos` bucket itself must be deleted via the dashboard (SQL deletes are blocked).
  One accepted advisor warning remains by design: `lbl_account_age_ok` is EXECUTE-able by
  `authenticated` because the RLS insert policies invoke it; it only reads the caller's
  own `auth.users.created_at`.

## Implementation status (2026-06-24)

- App built at `apps/lomba-balap-logo/` (SvelteKit + adapter-cloudflare). `pnpm build`
  and `pnpm check` both pass clean.
- Supabase project `lomba-balap-logo` (ref `zuayjojbmzdyyhbktiom`, ap-southeast-1):
  migrations `lbl_phase0`, `lbl_rls`, `lbl_security_hardening` applied; all five `lbl_`
  tables present with RLS on; config seeded.
- Remaining steps to go live are human-gated (R2 enablement, Google OAuth, Turnstile,
  Pages, DNS, admin seed) — see `docs/deploy/lomba-balap-logo.md`.
