# alternatif.space — Landing Page Product Requirements Document
**Version:** 0.1 | **Date:** June 2026 | **Status:** Draft

---

## Changelog

### v0.1 — June 2026
Initial draft. Root domain `alternatif.space` becomes the platform's public face: vision/mission explanation with auth above the fold. Design direction intentionally unresolved — three candidates will be prototyped before this PRD is finalized (see §6).

---

## Overview

Today the root domain serves nothing; the platform is only reachable by knowing a subdomain. Every acquisition path (word of mouth, share cards, press) needs a single canonical URL that explains what alternatif.space is and converts visitors into signups.

`alternatif.space` becomes a dedicated landing page. Above the fold: the platform thesis and sign up / log in. Below the fold: what the platform is, how it works, and why its rules are different. It is the only surface that explains the platform to someone who has not joined — the in-app onboarding (partai P0-01) explains it to someone who already has.

This page carries the education burden identified in the governance-comprehension discussion (2026-06-12): visitors should arrive at the create-party wizard already knowing what a bendera, mufakat, and recall are.

**Launch relationship:** ships with the Phase 0 launch unit (partai + mufakat). Not gated on them technically — it is an independent static deployment — but launching partai/mufakat without a root-domain front door wastes every share link's referral potential.

**Success criteria:** visitor → signup conversion measurable (baseline TBD); share-card recipients who land on a party page can navigate to a "what is this" explanation within one click; bounce rate under 70% on the landing.

---

## W0-01 — Above the fold

- **Thesis line** (H1): the platform's core claim. Working copy: *"Politik soal posisi, bukan persona."*
- **Support line** (one sentence): *"Dirikan partai, tulis manifesto, dan bawa posisimu ke ruang deliberasi lintas-partai."*
- **Auth, immediately visible:**
  - Signed out — primary CTA **Daftar**, secondary **Masuk**. Desktop: embedded Clerk `<SignUp />` rendered inline in the hero (no navigation needed). Mobile: CTAs anchor-scroll to the embedded form directly below the hero.
  - Signed in (shared `.alternatif.space` Clerk cookie) — replace auth with **"Lanjut ke partai →"** (or the user's party page if membership exists). No dead-end signup form for existing users.
- After successful auth → redirect to `https://partai.alternatif.space/onboarding` (new users) — partai owns post-signup onboarding; the landing never duplicates it.
- No navbar clutter: logo, Masuk, Daftar. Nothing else above the fold competes with the thesis.

## W0-02 — Cara kerjanya (three steps)

Three-step explainer, scannable in under ten seconds:

1. **Dirikan atau gabung partai** — *"Setiap orang di sini membawa bendera. Pilih partai yang sesuai posisimu — atau dirikan sendiri."*
2. **Bendera tampil di setiap diskusi** — *"Tulisanmu di mufakat selalu membawa bendera partaimu. Perdebatan bergeser dari siapa kamu ke apa posisimu."*
3. **Bawa posisimu ke deliberasi** — *"Diskusi tertulis lintas-partai di mufakat. Pertanyaan terbaik naik menjadi deliberasi langsung di simposium."*

## W0-03 — Empat ruang (subdomain cards)

Four cards: **partai** (pembentukan & tata kelola partai), **mufakat** (deliberasi tertulis lintas-partai), **simposium** (deliberasi langsung — badge *"segera"*), **perpus** (dokumentasi — badge *"segera"*). Live cards link to their subdomains; "segera" cards are non-interactive.

## W0-04 — Aturan mainnya beda (governance as features)

The governance mechanics presented as product differentiators, in plain language — this is the pre-signup half of the governance education problem:

- **Manifesto wajib** — *"Tidak ada partai tanpa posisi tertulis."*
- **Ketua bisa di-recall** — *"Anggota bisa mengganti ketua lewat petisi dan suara. Ambangnya partai yang tentukan."*
- **Konfigurasi terbuka** — *"Aturan internal setiap partai terlihat publik: siapa boleh masuk, siapa suara resmi, bagaimana ketua diganti."*
- **Honeymoon 3 bulan** — *"Partai baru dapat masa tenang untuk membangun sebelum mekanisme recall aktif."*

Copy here must stay consistent with partai PRD P0-05 (config locks permanently at publish) — if the post-honeymoon amendment decision changes that, update both documents together.

## W0-05 — Closing CTA

Repeat the thesis in imperative form (*"Bawa posisimu."*) + Daftar button. Footer: logo, four subdomain links, contact/press placeholder. No social links until those accounts exist.

## W0-06 — SEO & sharing

- OG tags: `og:title`, `og:description`, `og:image` (platform-level share card — static asset, not generated).
- This page is the canonical link target for anything platform-level; party share cards (P0-13) keep linking to their party pages.
- `lang="id"`. Indonesian only for v1 — an English version is deferred.

---

## 6. Design Direction — to be prototyped

"Cool" is a requirement. Candidates are built as toggleable variations on one prototype route, judged by eye, then the winner is named here in v0.2:

| Direction | Character | Risk |
|---|---|---|
| **Manifesto / editorial** | Huge type, poster-like, high contrast; reads like a political pamphlet | May feel heavy for a signup page |
| **Clean civic-tech** | Calm, institutional, slate/white like the apps; trust-first | Forgettable |
| **Bold activist** | Strong color, scroll motion, movement energy | Can read as partisan — wrong signal for a cross-party platform |
| **Awwwards** *(added 2026-06-12)* | Award-site energy: oversized Fraunces display type, electric ultramarine accent, scroll reveals, outline-text marquee, grain texture, hover micro-interactions | Motion/web-font weight must not break the "fast/static" constraint; ambition can age fast |

Constraints for all candidates: mobile-first, fast (static, no JS beyond Clerk + minimal interaction — the Awwwards variant's IntersectionObserver reveals count as "minimal"; all motion respects `prefers-reduced-motion`, hidden-before-reveal states gate on `@media (scripting: enabled)`), accessible contrast, Indonesian typography handled properly (long compound words — beware giant-type line breaks). Fonts are self-hosted via `@fontsource-variable` (Fraunces, Space Grotesk) — no external font requests.

---

## 7. Technical Notes (TRD v1.4 addendum required)

- New app `apps/www` — SvelteKit, prerendered (`@sveltejs/adapter-cloudflare` with `prerender = true` on all routes; only the Clerk widget hydrates). Cloudflare Pages deployment, custom domain on the apex.
- Same Clerk instance and env var set as the other apps (TRD §4). The apex sits inside the `.alternatif.space` cookie scope, so session detection works without satellite-domain configuration.
- No Supabase dependency at launch. A live stat ("X partai aktif") is deferred — it would break full prerendering for one vanity number.
- Native shell (TRD §4): the landing is **not** added as a Capacitor tab — app users are past the marketing layer.
- TRD changes needed: `apps/www` in §3 repo structure, deployment block in §4, this page noted in §5 as an auth entry point.

## 8. Out of Scope (v1)

- Blog / changelog / press kit
- English version
- Live platform statistics
- Newsletter capture
- Analytics tooling decision (tracked separately as checklist §10)

## 9. Open Questions

- **W-Q1:** Does "Daftar" embed `<SignUp />` inline (current spec) or link to a dedicated `/daftar` route on www? Resolve during prototyping — depends on what each design's hero can carry.
- **W-Q2:** Should the four-ruang section hide simposium/perpus entirely until they exist, instead of "segera" badges? (Honesty vs. roadmap-signaling.)
- **W-Q3:** Conversion measurement — none of the apps have analytics yet (checklist §10). Does the landing launch blind, or does the analytics decision get pulled forward?
