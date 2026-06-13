# alternatif.space — Landing Page Product Requirements Document
**Version:** 0.2 | **Date:** June 2026 | **Status:** Superseded by `www-landing-v0.3.md` (2026-06-13 — winner: Pamflet × Arena hybrid)

---

## Changelog

### v0.2.2 — June 2026 (amendment, 2026-06-13)
Open questions resolved (§9): W-Q1 **both** — inline `<SignUp />` stays in each hero *and* a dedicated `/daftar` route ships (share-linkable, navbar-linkable, mobile anchor target). W-Q2 **"segera" badges in all directions** — roadmap signaling wins over hiding. W-Q3 **deferred to Phase 1** — landing launches blind; analytics decision moves to the Phase 1 checklist. W-Q4 **deferred, with note** — partai's register/onboarding surfaces may be redesigned toward the winning landing voice rather than bridging the landing down; decision belongs to partai PRD, tracked there. W-Q5 **resolved by design** — KBBI block placement per direction: WARISAN footnote-anchored to the word "partai" in hero support copy; PAMFLET full-bleed poster band (the loudest element on the page); ARENA a deliberate quiet band between bento sections (energy drop as rhetorical device). Prototype variants rebuilt to v0.2.2 spec.

### v0.2.1 — June 2026 (amendment)
Aligned with `docs/brand/jiwa.md` (The Soul of Alternatif Space v1.0) and `docs/brand/soul-v0.2.md` (supersedes soul-v0.1). §0 now cites both, in precedence order. W0-02 reframed as the jiwa anatomy cycle (identitas → pertemuan → deliberasi → dokumentasi). New W0-07: KBBI "partai" reclamation element. New open question W-Q5 (placement of the KBBI block). Emotional sequencing rule added: belonging before rigor.

### v0.2 — June 2026
Brand-first revision. Added dependency on `docs/brand/soul-v0.1.md` (new). §6 design-direction table superseded by three fully specified candidates — each an integrated copy + visual system derived from a brand pillar, with complete Indonesian copy for every section. Previous four prototype variants (Manifesto/Civic/Activist/Awwwards) are superseded; they explored aesthetics without a brand foundation. CTA copy upgraded from generic "Daftar" to verb+object per direction. Voice rules (register, pronoun, lexicon) now normative via the soul document.

### v0.1 — June 2026
Initial draft. Root domain becomes the platform's public face: vision/mission explanation with auth above the fold.

---

## 0. Brand Foundation (normative)

Precedence order: `docs/brand/jiwa.md` (The Soul of Alternatif Space v1.0 — wins all conflicts) → `docs/brand/soul-v0.2.md` (brand soul, supersedes v0.1) → this PRD.

All copy and design on this page must comply with both:

- **Essence:** ruang latihan demokrasi. **Pillars:** posisi bukan persona; praktik bukan teori; mufakat sebagai warisan; jujur sampai tulang.
- **Premises (jiwa):** manusia makhluk kolektif (the page must counter political loneliness, not just explain features); "partai" artinya kelompok (KBBI reclamation made openly); perbedaan adalah bahan baku (never sell safety-from-disagreement).
- **Emotional sequencing (soul §2.1):** belonging before rigor — the visitor must feel *kamu tidak sendirian* before *posisimu dianggap serius*. Hero copy in each direction is judged against this order.
- **Voice:** santai-serius; pronoun `kamu`; persona "teman diskusi yang tajam"; no gaul/trend words, no government-circular baku, no buzzer hype, no NGO grant-speak.
- **Visual refusals:** no state symbols, no partisan color codes (party red/green/blue), no flat-illustration civic clichés, no hype gradients. The platform is the table, not a seat at it.
- **Guardrails (soul §9):** never frame the platform as a "safe space from conflict"; never frame a partai as a destination community — it is a base camp for cross-party deliberation.

## 1. Overview

Today the root domain serves nothing; the platform is only reachable by knowing a subdomain. Every acquisition path (word of mouth, share cards, press) needs a single canonical URL that explains what alternatif.space is and converts visitors into signups.

`alternatif.space` becomes a dedicated landing page. Above the fold: the platform thesis and sign up / log in. Below the fold: what the platform is, how it works, and why its rules are different. It is the only surface that explains the platform to someone who has not joined — the in-app onboarding (partai P0-01) explains it to someone who already has.

This page carries the education burden identified in the governance-comprehension discussion (2026-06-12): visitors should arrive at the create-party wizard already knowing what a bendera, mufakat, and recall are.

**Launch relationship:** ships with the Phase 0 launch unit (partai + mufakat). Not gated on them technically — independent static deployment — but launching partai/mufakat without a root-domain front door wastes every share link's referral potential.

**Success criteria:** visitor → signup conversion measurable (baseline TBD); share-card recipients who land on a party page can navigate to a "what is this" explanation within one click; bounce rate under 70%.

---

## 2. Content Requirements (direction-independent)

The five sections below are required in all directions. Working copy per direction lives in §6 — the *structure* here is canonical.

### W0-01 — Above the fold
- **Thesis line** (H1) + support line (one sentence) — per-direction copy, §6.
- **Auth, immediately visible.** Signed out: primary CTA (per-direction label) + secondary **Masuk**. Desktop: embedded Clerk `<SignUp />` inline in hero. Mobile: primary CTA links to `/daftar` (W-Q1: both — dedicated route is the canonical signup URL and mobile target). Signed in (shared `.alternatif.space` cookie): replace auth with **"Lanjut ke partai →"**.
- After successful auth → redirect `https://partai.alternatif.space/onboarding`. The landing never duplicates onboarding.
- Navbar: logo, Masuk, primary CTA. Nothing else competes with the thesis.

### W0-02 — Cara kerjanya (three steps)
Three-step explainer, scannable in under ten seconds: (1) form/join a party, (2) the bendera travels with every argument, (3) positions go to cross-party deliberation. Per-direction voicing in §6.

These steps are the first three moments of the jiwa anatomy (identitas → pertemuan → deliberasi); W0-03's perpus card carries the fourth (dokumentasi). Copy should read as one repeatable cycle, not a feature list (soul §4.1).

### W0-03 — Empat ruang (subdomain cards)
Four cards: **partai** (pembentukan & tata kelola partai), **mufakat** (deliberasi tertulis lintas-partai), **simposium** (deliberasi langsung — badge *"segera"*), **perpus** (dokumentasi — badge *"segera"*). Live cards link out; "segera" cards are non-interactive.

### W0-04 — Aturan mainnya beda (governance as features)
Four mechanics as product differentiators, plain language: **Manifesto wajib**, **Ketua bisa di-recall**, **Konfigurasi terbuka**, **Honeymoon 3 bulan**. Copy must stay consistent with partai PRD P0-05 (config locks at publish) — if the post-honeymoon amendment decision changes, update both documents together.

### W0-05 — Closing CTA
Thesis restated in imperative form + primary CTA. Footer: logo, four subdomain links, contact/press placeholder. No social links until those accounts exist.

### W0-06 — SEO & sharing
- OG tags: `og:title`, `og:description`, `og:image` (static platform-level share card).
- Canonical link target for anything platform-level; party share cards (P0-13) keep linking to party pages.
- `lang="id"`. Indonesian only for v1.

### W0-07 — Kenapa "partai"? (KBBI reclamation) — new in v0.2.1
One compact element, somewhere between W0-02 and W0-04, that quotes the dictionary verbatim:

> **par·tai** /n/ perkumpulan (segolongan orang) yang seasas, sehaluan, dan setujuan.

Rendered dictionary-style (entry, /n/, definition) — the most honest visual form for the argument. Purpose: disarm the word's baggage for visitors who recoil from "partai" (soul §3), per jiwa premis 2. One short support line per direction's register; no editorializing beyond it. Placement per direction is a prototyping decision (W-Q5).

---

## 6. Design Directions — three candidates (supersedes v0.1 §6)

Each direction is an integrated **copy + visual system** expressing one brand pillar. Built as toggleable variants on the prototype route; winner named in v0.3, losing variants deleted.

Shared constraints: mobile-first; static/prerendered, JS limited to Clerk + IntersectionObserver reveals; all motion respects `prefers-reduced-motion`; hidden-before-reveal gates on `@media (scripting: enabled)`; accessible contrast (WCAG AA); self-hosted fonts via `@fontsource`; beware giant-type line breaks on long Indonesian compounds.

---

### Direction 1 — **WARISAN** (pillar: mufakat sebagai warisan)

**Argument:** the platform is not importing democracy; it is returning an Indonesian inheritance. Heritage gravity makes the project feel legitimate and serious — an institution, not a startup.

**Copy (Bahasa Indonesia):**

| Surface | Copy |
|---|---|
| Hero display word | *Mufakat* (oversized italic serif, standalone) |
| H1 | **"Kata itu kita hafal sejak SD. Praktiknya mulai hari ini."** |
| Support | "Musyawarah untuk mufakat adalah cara kita berdemokrasi — yang tak pernah diberi ruang oleh sistem. Di sini ruangnya: dirikan partai, tulis manifesto, bermusyawarah lintas-bendera." |
| Primary CTA | **Mulai Bermusyawarah** |
| Step 1 | **Dirikan atau gabung partai** — "Setiap orang membawa bendera. Temukan yang sejalan dengan posisimu — atau dirikan sendiri, lengkap dengan manifesto." |
| Step 2 | **Bendera ikut di setiap tulisan** — "Di mufakat, argumenmu selalu tampil bersama benderamu. Perdebatan bergeser dari siapa kamu ke di mana kamu berdiri." |
| Step 3 | **Musyawarah, lalu mufakat** — "Diskusi tertulis lintas-partai. Pertanyaan yang paling penting naik ke deliberasi langsung di simposium." |
| W0-04 intro | "Aturan di ruang ini ditulis supaya kebiasaan lama tidak ikut masuk." |
| Manifesto wajib | "Tidak ada partai tanpa posisi tertulis." |
| Recall | "Anggota bisa mengganti ketua lewat petisi dan suara. Ambangnya partai yang tentukan." |
| Konfigurasi terbuka | "Aturan internal setiap partai terlihat publik — siapa boleh masuk, siapa suara resmi, bagaimana ketua diganti." |
| Honeymoon | "Partai baru dapat masa tenang tiga bulan untuk membangun, sebelum mekanisme recall aktif." |
| Closing | **"Warisan tidak dijaga dengan dihafal."** + Mulai Bermusyawarah |

**Visual system:** warm paper `#F7F1E3`, ink `#1A1714`, amber `#C17D0F` (accents) / `#F5A623` (highlights). Display: **Fraunces Variable** (soft optical, real italics); body: Space Grotesk. Single reading column, manuscript rhythm: thin rules, ◆ ornaments, footnote-style numbering, letterpress-feel spacing. Motion: slow fades only. Continuity: closest to the partai app's ink-amber identity — lowest reconciliation cost.

**Risk:** heritage register can read as old/museum-like to the youngest slice of the audience; needs typographic confidence to avoid "government heritage brochure."

---

### Direction 2 — **PAMFLET** (pillar: posisi, bukan persona)

**Argument:** the founding thesis as a political pamphlet — declarative, high-contrast, zero decoration. The page itself demonstrates the product value: words carrying weight without a face attached.

**Copy (Bahasa Indonesia):**

| Surface | Copy |
|---|---|
| H1 | **"Politik soal posisi, bukan persona."** |
| Support | "Tanpa wajah, tanpa idola. Dirikan partai, tulis manifesto, dan pertahankan posisimu di ruang deliberasi lintas-partai." |
| Primary CTA | **Ambil Posisi** |
| Step 1 | **Dirikan partai.** — "Atau gabung yang sudah ada. Satu orang, satu bendera. Tanpa manifesto, tidak ada partai." |
| Step 2 | **Bendera melekat.** — "Setiap argumen membawa benderamu. Yang diadu posisi, bukan popularitas." |
| Step 3 | **Posisi diuji.** — "Tulisan diadu di mufakat. Yang bertahan naik ke simposium." |
| W0-04 intro | "Aturan mainnya beda. Sengaja." |
| Manifesto wajib | "Tidak ada partai tanpa posisi tertulis. Titik." |
| Recall | "Ketua bukan pemilik. Petisi, suara, ganti." |
| Konfigurasi terbuka | "Aturan internal partai terbuka untuk publik. Semua bisa membaca, sebelum memutuskan bergabung." |
| Honeymoon | "Tiga bulan masa tenang untuk partai baru. Setelah itu, recall aktif." |
| Closing | **"Bawa posisimu."** + Ambil Posisi |

**Visual system:** bone `#F4F1EA`, ink `#141210`, stamp vermilion `#D4380D` used only as *cap stempel* (rotated rubber-stamp badges: "WAJIB", "TERBUKA", "SEGERA") — bureaucratic Indonesian visual language, subverted. Display: **Archivo Black**; body: Space Grotesk. Full-bleed poster hero, numbered sections 01–05, outline-text marquee of the thesis, hard rules, no rounded corners. Motion: marquee + hard cuts; no soft easing.

**Risk:** vermilion must stay an obviously *stamp-ink* accent at low coverage or it reads as party red; heavy poster type is unforgiving with long Indonesian compounds (test "bermusyawarah", "konfigurasi" breaks).

---

### Direction 3 — **ARENA** (pillar: praktik, bukan teori)

**Argument:** democracy as a muscle and the platform as its gym. Highest energy, most Gen-Z-native register, frames signup as starting training rather than joining an org.

**Copy (Bahasa Indonesia):**

| Surface | Copy |
|---|---|
| H1 | **"Demokrasi itu otot."** |
| Support | "Nggak cukup dihafal — harus dilatih. Dirikan partai, angkat posisimu, adu argumen lintas-bendera. Ini ruang latihannya." |
| Primary CTA | **Mulai Latihan** |
| Step 1 | **Pilih bendera** — "Gabung partai yang sesuai posisimu — atau dirikan sendiri kalau belum ada yang cocok. Manifesto itu syarat, bukan formalitas." |
| Step 2 | **Turun ke arena** — "Tulisanmu di mufakat selalu bawa bendera. Yang dinilai argumenmu, bukan jumlah pengikutmu." |
| Step 3 | **Naik level** — "Pertanyaan paling tajam naik jadi deliberasi langsung di simposium. Posisi terbaik lahir dari latihan." |
| W0-04 intro | "Aturan mainnya beda — dan itu intinya." |
| Manifesto wajib | "Mau bikin partai? Tulis dulu posisimu. Tanpa manifesto, nggak jalan." |
| Recall | "Ketua nggak nempel seumur hidup. Anggota bisa ganti lewat petisi dan suara." |
| Konfigurasi terbuka | "Aturan tiap partai kebuka semua: siapa boleh masuk, siapa suara resmi, gimana ketua diganti." |
| Honeymoon | "Partai baru dapat tiga bulan masa tenang buat membangun, sebelum recall aktif." |
| Closing | **"Otot nggak tumbuh dari nonton."** + Mulai Latihan |

**Visual system:** deep ink `#0E0D0B` background, amber `#F5A623` primary, paper `#FEF3DC` text, amber-dark `#C17D0F` secondary. Display: **Unbounded Variable**; body: Space Grotesk. Bento-card layout, bendera chips, oversized step numerals, tally marks as texture. Motion: IntersectionObserver reveals, hover lifts, count-up on step numerals — all gated on `(scripting: enabled)` and `prefers-reduced-motion`.

**Risk:** energy must not tip into hype (soul §5 bans buzzer mode); "nggak" register is correct for this direction but widest gap from the app's in-product governance voice — winning here forces a voice-bridging decision in onboarding.

---

### Decision procedure

Judged by eye on the prototype route, against: (a) does it feel Indonesian without costume, (b) does a cold visitor understand bendera/mufakat/recall before the wizard, (c) does it survive a mid-range Android over 4G, (d) which risk is cheapest to manage, (e) **does the hero deliver belonging before rigor** — a politically lonely visitor should feel *kamu tidak sendirian* before being asked to take a position (soul §2.1, jiwa premis 1). Winner → v0.3 names it; losing variants deleted; reconciliation pass against partai app tokens scheduled.

---

## 7. Technical Notes (TRD v1.4 addendum)

- App `apps/www` — SvelteKit, fully prerendered (`@sveltejs/adapter-cloudflare`, `prerender = true`; only Clerk hydrates). Cloudflare Pages, apex custom domain.
- Same Clerk instance/env vars as other apps; apex sits inside `.alternatif.space` cookie scope — session detection without satellite config. Client-only Clerk, `routing="hash"` on embedded components.
- No Supabase dependency at launch; live stats deferred (breaks prerendering).
- Not a Capacitor tab.
- Fonts self-hosted via `@fontsource`: Fraunces Variable (D1), Archivo Black (D2), Unbounded Variable (D3), Space Grotesk Variable (all). Only the winning direction's fonts ship in v0.3 — prototype loads all four.

## 8. Out of Scope (v1)

Blog/changelog/press kit; English version; live platform statistics; newsletter capture; analytics tooling decision (checklist §10).

## 9. Open Questions — all resolved 2026-06-13 (v0.2.2)

- **W-Q1 — RESOLVED: both.** Inline `<SignUp />` stays in each hero (desktop) *and* a dedicated `/daftar` route ships: canonical signup URL for share cards/press, navbar CTA target, and the mobile anchor target (replaces in-page scroll-to-form). `/daftar` is `noindex`, mirrors `/masuk` structure.
- **W-Q2 — RESOLVED: "segera" badges, all directions.** Roadmap signaling chosen over hiding; consistent with jujur-sampai-tulang (the roadmap is public anyway). simposium/perpus cards render non-interactive with per-direction badge styling.
- **W-Q3 — RESOLVED: Phase 1.** Landing launches blind. Analytics tooling decision moves to the Phase 1 checklist; W0-06 success criteria stay aspirational until then.
- **W-Q4 — RESOLVED: deferred to partai.** Rather than bridging the landing voice down, partai's register/onboarding surfaces may be redesigned toward the winning direction's voice. Owned by partai PRD (next revision); no per-surface register map needed in this document.
- **W-Q5 — RESOLVED: per-direction placement.** WARISAN: KBBI entry as a *manuscript footnote* — superscript marker on the word "partai" in the hero support line, entry rendered as a footnote block after W0-02. PAMFLET: KBBI entry as the page's loudest poster band (full-bleed, stamp "MENURUT KAMUS") directly before W0-04. ARENA: a *quiet band* — the page's only low-energy section, paper background amid the dark bento flow, between W0-02 and W0-03 ("Sebentar. Buka kamus dulu.").
