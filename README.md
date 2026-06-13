# alternatif.space

> *Posisi, bukan persona. Praktik, bukan teori. Mufakat sebagai warisan. Jujur sampai tulang.*

**Ruang latihan demokrasi.** A civic technology platform for cross-party deliberation in Indonesia — reclaiming the word *partai* to mean what the dictionary says: a group of people who share a direction.

---

## What is this?

Indonesia already has a word for good democracy — **musyawarah untuk mufakat**. It's in the fourth principle of Pancasila, memorised by every schoolchild, and almost never practised by the formal political system. alternatif.space doesn't import democracy from elsewhere; it returns a practice that was always ours — with digital infrastructure that makes it possible across islands, across classes, across positions.

The platform is one idea split across four moments of the same social dynamic — **the anatomy of healthy disagreement**:

| Moment | Subdomain | What happens |
|--------|-----------|--------------|
| **Identitas** | [partai.alternatif.space](https://partai.alternatif.space) | Positions form; you carry a flag; you speak as a position, not a persona |
| **Pertemuan** | [mufakat.alternatif.space](https://mufakat.alternatif.space) | Flags meet across party lines; difference becomes conversation, not distance |
| **Deliberasi** | simposium (coming soon) | Friction is channelled; arguments become understanding |
| **Dokumentasi** | perpus (coming soon) | Collective memory; what was settled, what stays open |

---

## Project structure

```
alternatif.space/
├── apps/
│   ├── partai/       # Party formation & governance (SvelteKit)
│   ├── mufakat/      # Cross-party written deliberation (SvelteKit)
│   ├── www/          # Root-domain landing page (prerendered SvelteKit)
│   └── native/       # Capacitor mobile wrapper
├── packages/
│   └── ui/           # Shared Svelte component library + stores
├── supabase/         # PostgreSQL migrations, Edge Functions, seed data
├── docs/             # PRDs, TRD, checklists, brand soul
└── .github/          # CI/CD workflows (maintenance cron jobs)
```

## Tech stack

| Layer | Technology |
|-------|------------|
| **Framework** | SvelteKit (Svelte 5) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Auth** | Clerk — JWT scoped to `.alternatif.space`, shared across subdomains |
| **Database** | Supabase (PostgreSQL) with Row Level Security |
| **Backend logic** | Supabase Edge Functions (Deno) |
| **Storage** | Supabase Storage (party logos, share cards) |
| **Deployment** | Cloudflare Pages (web apps), Capacitor (mobile) |
| **Package manager** | pnpm v10 (workspace) |
| **Runtime** | Node ≥20 |

## Getting started

### Prerequisites

- **Node.js** ≥20
- **pnpm** v10 (`corepack enable && corepack prepare pnpm@10 --activate`)
- **Supabase CLI** (`brew install supabase` or `npm i -g supabase`)
- **Docker** (for local Supabase)

### Setup

```bash
git clone https://github.com/alternatifspace/alternatif.space.git
cd alternatif.space
pnpm install
```

### Environment variables

Each app under `apps/` needs a `.env` file. Copy the example and fill in your credentials:

```bash
cp apps/www/.env.example apps/www/.env   # if .env.example exists
```

Required variables per app:

| Variable | Used by |
|----------|---------|
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | all apps |
| `CLERK_SECRET_KEY` | all apps |
| `PUBLIC_SUPABASE_URL` | partai, mufakat |
| `PUBLIC_SUPABASE_ANON_KEY` | partai, mufakat |

### Run locally

```bash
pnpm dev              # Run all apps (partai + mufakat + www)
pnpm dev:partai       # Run partai only
pnpm dev:mufakat      # Run mufakat only
pnpm dev:www          # Run www only
```

### Database

```bash
pnpm db:reset         # Reset local Supabase (runs migrations + seed)
pnpm db:push          # Push migrations to remote Supabase
```

## Development

### Key commands

```bash
pnpm build            # Build all apps for production
pnpm check            # Type-check all apps (svelte-check)
pnpm lint             # Lint all apps
```

### Documentation

All major decisions and specifications live in `docs/`:

| What | Where |
|------|-------|
| **Party app spec** | `docs/prd/partai-alternatif-v0.3.md` |
| **Mufakat app spec** | `docs/prd/mufakat-v0.1.md` |
| **Landing page spec** | `docs/prd/www-landing-v0.3.md` |
| **Technical reference** | `docs/trd/v1.3.md` |
| **Implementation progress** | `docs/checklist/phase-0.md`, `phase-1.md`, `phase-2.md` |
| **Brand soul** | `docs/brand/soul-v0.2.md` |

**Before implementing any feature:** read the relevant PRD + TRD, then check the phase checklist to see what's already done. The checklists are the source of truth for implementation progress.

### Conventions

- **Mobile-first** — single column on mobile, 16px base font, 44px minimum touch targets
- **Indonesian-first** — all public-facing copy in Indonesian (`lang="id"`)
- **Fully static where possible** — `www` is prerendered; `partai` and `mufakat` use SSR
- **No image embeds in rich text** — TipTap editors for manifestos and comments support H2/H3, bold, italic, lists, blockquote only
- **Voice** — Santai-serius: casual grammar (*nggak*, *kamu*), serious substance. Never government-circular, never buzzer hype.

---

## Roadmap

| Phase | Status | Focus |
|-------|--------|-------|
| **Phase 0** | 🟡 In progress | Partai MVP (create/join/browse party), Mufakat MVP (threads, comments, reactions, splits), landing page |
| **Phase 1** | ⚪ Planned | Internal party life (dashboard, announcements, discussions), governance (recall, manifesto amendment, pulse check), resolution infrastructure (argument statuses, resolution maps, open questions) |
| **Phase 2** | ⚪ Planned | Council roles, cross-platform powers (official position stamps, party response), AI epistemic engine (pgvector dedup, knowledge graph, semantic-dispute detection), simposium (live deliberation) |

Full details with feature lists and Gantt timeline: **[alternatif.space/contribute](https://alternatif.space/contribute)**

---

## Contributing

This project is open — from code to direction. You don't need permission to start reading or start helping.

### Pick a lane

| Lane | Good first step |
|------|-----------------|
| **Kode** | Browse [open issues labelled bug, enhancement, or documentation](https://github.com/alternatifspace/alternatif.space/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug%20label%3Aenhancement%20label%3Adocumentation) |
| **Desain** | See [open design issues](https://github.com/alternatifspace/alternatif.space/issues?q=is%3Aissue%20state%3Aopen%20label%3Adesign) |
| **Tulisan** | See [open copywrite issues](https://github.com/alternatifspace/alternatif.space/issues?q=is%3Aissue%20state%3Aopen%20label%3Acopywrite) |
| **Uji coba** | Report bugs and test new features — use the [code link](https://github.com/alternatifspace/alternatif.space/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug%20label%3Aenhancement%20label%3Adocumentation) above |

Full contribution guide and roadmap: **[alternatif.space/contribute](https://alternatif.space/contribute)**

---

## For AI agents

This repository includes a **[CLAUDE.md](./CLAUDE.md)** with detailed rules for AI-assisted development: which documents to read before touching each code area, the checklist-first workflow, and the full list of dev commands. If you're an AI agent working in this repo, read that file first — it is the authoritative instruction set.

---

## License

MIT © alternatif.space
