# alternatif.space

Civic technology platform for cross-party deliberation in Indonesia. Monorepo with four subdomains.

```
apps/
  partai/    — Party formation and governance (SvelteKit)
  mufakat/   — Cross-party written deliberation (SvelteKit)
  native/    — Capacitor mobile wrapper
packages/
  ui/        — Shared Svelte component library
supabase/    — Migrations and Edge Functions
docs/        — PRDs and TRD
```

## Docs-First Rule

**Before starting any task, read the relevant docs listed below.** Do not rely on memory or assumptions — the PRDs and TRD are the source of truth for product intent, data models, and architecture decisions.

| Work area | Read these docs |
|-----------|----------------|
| `apps/mufakat/` or mufakat features | `docs/prd/mufakat-v0.1.md` + `docs/trd/v1.3.md` |
| `apps/partai/` or partai features | `docs/prd/partai-alternatif-v0.3.md` + `docs/trd/v1.3.md` |
| `supabase/` or any schema/DB change | `docs/trd/v1.3.md` |
| `packages/ui/` or shared components | `docs/trd/v1.3.md` |
| New app (simposium, perpus) or cross-cutting feature | all three docs |

## Checklist-First Rule

**Before implementing any feature, check the relevant phase checklist to understand what's already done and what remains.** Never start coding without reviewing the checklist — it is the source of truth for implementation progress.

| Current phase | Checklist |
|---------------|-----------|
| Phase 0 (joint partai + mufakat MVP) | `docs/checklist/phase-0.md` |
| Phase 1 (internal party life + resolution) | `docs/checklist/phase-1.md` |
| Phase 2 (governance depth + epistemic engine) | `docs/checklist/phase-2.md` |

**Workflow:**
1. Read the relevant PRD + TRD sections per the Docs-First Rule above.
2. Read `docs/checklist/phase-0.md` (or current phase) to see what's already complete (`[x]`) vs. pending (`[ ]`).
3. After completing a checklist item, mark it `[x]` in the file.

## Stack

- **Framework:** SvelteKit (all apps)
- **Auth:** Clerk — JWT scoped to `.alternatif.space`, shared across subdomains
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Storage:** Supabase Storage
- **Deployment:** Cloudflare Pages (web), Capacitor (mobile)
- **Package manager:** pnpm v10 (workspace)
- **Node:** >=20

## Dev Commands

```bash
pnpm dev:partai       # Run partai locally
pnpm dev:mufakat      # Run mufakat locally
pnpm build            # Build all apps
pnpm check            # Type-check all apps
pnpm db:reset         # Reset local Supabase DB
pnpm db:push          # Push migrations to Supabase
```
