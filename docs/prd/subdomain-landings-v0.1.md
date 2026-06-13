# Subdomain Landings — Copy Deck

**Version:** 0.1 | **Date:** 2026-06-13 | **Status:** Draft (copy-first, pre-build)
**Scope:** `partai.alternatif.space` + `mufakat.alternatif.space` signed-out surfaces
**Companion spec:** `docs/trd/v1.5-addendum-subdomain-landings.md` (routing, gating, SEO)
**Voice source:** `docs/brand/jiwa.md` → `docs/brand/soul-v0.2.md`; design system = apex `apps/www` (Pamflet × Arena)

---

## 0. Why this exists

The apex landing (`alternatif.space`) is the *pitch* — it names the mechanics (manifesto wajib,
recall, "konfigurasi terbuka") but never teaches them. Someone who clicks through to `partai` or
`mufakat` while signed out currently hits a functional app surface with no explanation of what
they're looking at or why the rules are the way they are.

These two landings are the *manual*. They answer the questions the apex page raises:

- **partai** — what actually *is* a partai here, what's a manifesto-for, what lives inside the
  governance configuration, how a petition and a recall work, why there's a honeymoon.
- **mufakat** — how written deliberation works, what a "bendera" on every post means, what the
  good-question split is, and the load-bearing question: *why this is not social media.*

### Voice contract (applies to every line below)

- Pronoun **`kamu`**, never `Anda`. Persona: *teman diskusi yang tajam* (sharp discussion friend).
- Register: **santai-serius**, the "nggak" register. Aspiratif + edukatif, not hype.
- **Never the word "platform"** in user-facing copy — use *ruang*.
- Banned: gaul/tren words ("auto", "sat-set", "no debat"), government-baku, buzzer hype, NGO grant-speak.
- Mechanics stated as copy must match the PRDs exactly (numbers verified in §3 of the TRD addendum).
- Visual skin = apex: bone paper, ink, cap-stempel vermilion (stamps only), amber accent,
  Archivo Black display + Space Grotesk. Reuse the `lp-*` design language.

CTA verbs per surface (verb + object, benefit-forward):
- partai landing → **Dirikan Partai** / **Cari Partai** (build vs. join, two doors)
- mufakat landing → **Ambil Posisi** / **Lihat Diskusi** (participate vs. read)

---

# PART A — partai.alternatif.space

Two pages: a **landing** (`/`, signed-out) that sells the idea and routes to the two doors, and a
**deep-dive** (`/cara-kerja`) that teaches the whole machine. Signed-in `/` = the selected party's
dashboard (see TRD addendum).

## A1. Landing — `/` (signed-out)

### Hero
> **Eyebrow (belonging-before-rigor):**
> Punya pendapat, belum punya barisan? Kamu nggak sendirian.
>
> **H1:**
> Bikin partai. Bukan nunggu izin.
>
> **Support:**
> Di sini "partai" balik ke arti aslinya: sekelompok orang yang searah. Bukan soal pemilu, bukan
> soal elit. Kamu nulis posisimu, orang yang sepaham berkumpul, dan kalian jalan dengan aturan
> yang kalian tetapkan sendiri.
>
> **Primary CTA:** Dirikan Partai →
> **Secondary CTA:** Cari partai yang cocok
> **Stamp:** TANPA IZIN

*Note: "Bukan nunggu izin" is the hook — reclaims agency. The KBBI reframe (partai = kelompok)
is the apex's strongest asset; we restate it compactly here, full band lives on the apex page.*

### Section 01 — Apa itu partai di sini
> **Kicker:** 01 — Bukan partai yang itu
>
> **H2:** Sebuah partai itu satu posisi yang ditulis, lalu dijaga.
>
> **Body:**
> Tiap partai mulai dari satu hal: **manifesto**. Bukan formalitas — itu syaratnya. Kalau kamu
> nggak bisa nulis apa yang kamu perjuangkan, partaimu belum ada. Setelah manifesto jadi, dua hal
> ikut: orang yang sepaham bisa gabung, dan cara kalian ambil keputusan jadi terbuka buat semua
> orang lihat.

### Section 02 — Tiga hal yang bikin beda (teaser grid, 3 cells)
> **Kicker:** 02 — Aturannya beda, dan itu intinya
>
> 1. **Manifesto dulu, baru partai.**
>    Nggak ada partai kosong. Posisi ditulis di depan, bukan ditebak belakangan.
> 2. **Ketua bisa diganti.**
>    Ketua nggak nempel seumur hidup. Anggota bisa mulai petisi dan voting buat ganti — aturannya
>    ditetapkan partai itu sendiri.
> 3. **Aturannya kebuka semua.**
>    Siapa boleh masuk, siapa suara resmi, gimana ketua diganti — semua keliatan di halaman partai,
>    bukan rahasia pengurus.
>
> **CTA under grid:** Lihat cara kerjanya lengkap → `/cara-kerja`

### Section 03 — Dua pintu (the two doors)
> **H2:** Ada dua cara masuk.
>
> **Card A — Dirikan:**
> Belum ada partai yang cocok? Dirikan sendiri. Tulis manifesto, atur aturan main, undang orang.
> CTA: **Dirikan Partai →**
>
> **Card B — Gabung:**
> Udah ada yang searah? Baca manifesto dan aturannya, lalu gabung. CTA: **Cari Partai →**

### Closing
> **H2:** Posisi yang nggak ditulis, nggak ngitung.
> **CTA:** Dirikan Partai →
> **Sub:** Udah punya partai? Masuk.

---

## A2. Deep-dive — `/cara-kerja` (public)

The mechanics manual. Long-scroll, section-numbered like the apex page. Every claim here is a real
PRD parameter — keep them exact.

### Hero
> **Eyebrow:** Cara kerja partai
> **H1:** Satu partai, dari nol sampai bisa di-recall.
> **Support:** Empat tahap: tulis posisi, atur aturan main, kumpulkan orang, dan pertanggungjawaban.
> Ini detail tiap tahapnya — termasuk angka-angka yang ngatur semuanya.

### 01 — Manifesto: posisi yang ditulis
> Tiap partai berdiri di atas satu manifesto. Ini dokumen yang menyatakan apa yang partai itu
> perjuangkan — ditulis di editor teks, bukan diisi formulir. Tanpa manifesto, partai nggak bisa
> terbit.
>
> Setelah partai jalan, manifesto nggak beku. Tapi cara ngubahnya **diatur sejak awal** (lihat
> Konfigurasi): bisa ketua langsung, bisa lewat ratifikasi anggota, bisa lewat voting penuh.
>
> **Stamp:** WAJIB

### 02 — Konfigurasi: aturan main yang terbuka
> Sebelum partai terbit, pendirinya nyetel beberapa parameter. Inilah "aturan main" partai — dan
> semuanya **keliatan publik** di halaman partai. Nggak ada aturan tersembunyi.
>
> Parameter yang diatur:
>
> | Parameter | Pilihan / rentang | Artinya |
> |---|---|---|
> | **Cara gabung** | terbuka / lewat lamaran / undangan saja | Siapa yang boleh jadi anggota |
> | **Ambang petisi recall** | 10%–50% anggota | Berapa banyak tanda tangan buat mulai recall ketua |
> | **Ambang suara recall** | 50%+1 sampai 75% | Berapa suara buat recall benar-benar lolos |
> | **Ubah manifesto** | ketua saja → ratifikasi → voting penuh | Siapa yang berhak ngubah posisi partai |
> | **Wewenang keluarkan anggota** | ketua / campuran / voting | Siapa yang bisa ngeluarin anggota |
> | **Suara resmi di mufakat** | (diatur partai) | Siapa yang ngomong atas nama partai |
>
> Begitu partai terbit, **konfigurasi terkunci permanen**. Pendiri jadi ketua, dan masa honeymoon
> 3 bulan dimulai. Aturan ditetapkan di depan supaya nggak bisa diubah diam-diam pas lagi
> menguntungkan satu pihak.
>
> *Catatan desain: ada beberapa "preset" buat mempercepat (ketua kuat, ketua-usul-anggota-ratifikasi,
> semua-lewat-suara), tapi label preset itu cuma alat bantu pendiri — yang publik lihat cuma nilai
> parameternya, bukan labelnya.*
>
> **Stamp:** TERBUKA

### 03 — Honeymoon: tiga bulan tenang
> Partai baru dapat **3 bulan** masa tenang. Selama itu, petisi recall diblokir — ketua dan anggota
> awal bisa fokus membangun dulu sebelum mekanisme pertanggungjawaban aktif. Kalau ada yang nyoba
> mulai petisi selama honeymoon, statusnya keliatan jelas: belum bisa.
>
> **Stamp:** 3 BULAN

### 04 — Petisi & recall: ketua yang bisa diganti
> Ketua di sini bukan jabatan seumur hidup. Kalau anggota merasa ketua nggak lagi mewakili posisi
> partai, ada jalannya — dan jalannya itu **angka, bukan drama**:
>
> 1. **Petisi.** Anggota mulai petisi recall. Butuh tanda tangan sebanyak ambang yang partai setel
>    (10%–50%). Minimal 10 anggota biar valid. Diblokir selama honeymoon.
> 2. **Voting.** Begitu ambang petisi tercapai, voting recall otomatis jalan. Recall lolos kalau
>    suara mencapai ambang yang disetel partai (50%+1 sampai 75%).
> 3. **Hasil.** Kalau lolos, ketua di-recall. Kalau gagal, petisi diarsipkan, ketua tetap, dan
>    petisi baru nggak bisa dimulai selama 30 hari (biar nggak jadi gangguan terus-terusan).
>
> Yang bikin ini beda dari "ganti pengurus" di tempat lain: ambangnya **ditetapkan partai sendiri,
> di depan, dan terbuka**. Partai yang milih ketua kuat tinggal punya ambang tinggi — dan itu pun
> keliatan publik, jadi orang tahu apa yang mereka masuki.

### 05 — Setelah honeymoon: nama & logo
> Selama honeymoon, ketua bebas ngedit nama dan logo. Setelah honeymoon, ganti nama/logo butuh
> voting anggota (50%+1) — kecuali partai yang konfigurasinya emang ketua-penuh. Identitas partai
> jadi milik bersama begitu masa tenang lewat.

### Closing
> **H2:** Aturan yang kamu lihat sekarang, ya itu aturannya nanti.
> **CTA:** Dirikan Partai → / Cari Partai →

---

# PART B — mufakat.alternatif.space

One **landing** (`/`, signed-out): a detailed explanation of how deliberation works *and* the
explicit contrast with social media. Signed-in `/` = the discussion feed. The feed and individual
thread pages stay **public and crawlable** (see TRD addendum) — the landing is a top layer for
first-time signed-out visitors, not a wall.

## B1. Landing — `/` (signed-out)

### Hero
> **Eyebrow:** Capek ribut tanpa ujung? Kamu nggak sendirian.
>
> **H1:**
> Tempat beda pendapat jadi bahan, bukan ribut.
>
> **Support:**
> mufakat itu ruang adu argumen tertulis antar-partai. Tiap tulisanmu bawa bendera partaimu, dan
> yang dinilai argumenmu — bukan jumlah pengikutmu. Nggak ada like buat dikejar, nggak ada algoritma
> buat dipancing.
>
> **Primary CTA:** Ambil Posisi →
> **Secondary CTA:** Lihat diskusi yang lagi jalan
> **Stamp:** BAWA BENDERA

### Section 01 — Cara kerjanya (3-step)
> **Kicker:** 01 — Cara kerjanya
>
> 1. **Buka diskusi.**
>    Anggota partai mana pun bisa mulai diskusi. Pas kamu nulis judul, sistem nunjukin diskusi
>    serupa yang udah ada — bukan buat ngeblok, tapi biar kamu nggak ngulang yang udah dibahas.
> 2. **Adu argumen, bawa bendera.**
>    Tiap tulisan dan balasan nampilin bendera partaimu. Posisimu kelihatan dari mana kamu berdiri,
>    bukan dari siapa kamu. Beda pendapat? Balas. Di sini, nggak setuju itu *isi diskusi*, bukan
>    sesuatu yang ditenggelamin.
> 3. **Pertanyaan tajam naik kelas.**
>    Komentar yang banyak dapat "Pertanyaan bagus" otomatis jadi diskusi tersendiri. Komunitas yang
>    nentuin sebuah pertanyaan layak digali — bukan algoritma, bukan si penulis.

### Section 02 — Ini bukan media sosial (the contrast — loud band, inverted like KBBI)
> **Kicker:** 02 — Bedanya di mana
> **H2 (big):** Ini bukan media sosial.
>
> Tiga hal yang sengaja kami buat beda:
>
> | Di media sosial | Di mufakat |
> |---|---|
> | Yang viral yang menang | Urutan kronologis. Nggak ada yang di-boost. |
> | Pengikut = pengaruh | Argumen = pengaruh. Bendera, bukan follower. |
> | Beda pendapat ditenggelamin | Beda pendapat dibalas. Itu bahan bakunya. |
>
> **Body:**
> Nggak ada tombol "tidak suka". Nggak setuju? Kamu balas dan jelasin kenapa — itu kerjanya. Nggak
> ada timeline yang diatur algoritma; diskusi diurut waktu, karena ruang ini wasit, bukan pengeras
> suara. Dan tiap orang bawa bendera, jadi yang kamu timbang itu posisi, bukan persona.
>
> *Visual note: render this as the inverted ink band (like apex KBBI section) — the loudest moment
> on the page.*

### Section 03 — Diskusi nggak selalu harus selesai (statuses)
> **Kicker:** 03 — Empat keadaan diskusi
>
> Tiap diskusi punya status yang jujur soal di mana posisinya:
>
> - **Aktif** — lagi jalan, terbuka buat dibahas.
> - **Selesai** — udah ada kesimpulan, ditutup dengan ringkasan.
> - **Pertanyaan Terbuka** — udah dibahas tuntas tapi belum ketemu jawaban. Ini bukan gagal:
>   *"Pertanyaan ini masih terbuka, dan kamu bukan yang pertama menemukannya."*
> - **Dialihkan** — ternyata duplikat; diarahkan ke diskusi aslinya.
>
> Kesimpulan yang terbuka itu hasil yang sah. Nggak semua hal harus ada pemenangnya hari ini.

### Section 04 — Kenapa bawa bendera (position over persona)
> **H2:** Yang ditimbang posisimu, bukan kamunya.
> **Body:**
> Tiap tulisan nempel ke partai tempatmu berdiri pas kamu nulis. Pindah partai nanti nggak ngehapus
> jejak itu — biar rekam posisi tetap jujur. Ini bikin diskusi soal *apa yang dibilang*, bukan
> *siapa yang ngomong*.

### Closing
> **H2:** Bawa posisimu. Bawa benderamu.
> **CTA:** Ambil Posisi →
> **Sub:** Cuma mau baca dulu? Lihat diskusi yang lagi jalan.

---

## Open copy questions (for review)

- **CQ1** — partai landing CTA: two doors ("Dirikan" + "Cari") vs. single dominant CTA. Draft shows
  two; the apex page funnels to one. Decide whether the subdomain splits attention deliberately.
- **CQ2** — mufakat "Ini bukan media sosial" comparison table names the pattern without naming a
  competitor. Keep it abstract (current) or sharpen by implication? Brand bans buzzer hype — abstract
  is safer.
- **CQ3** — how much of the apex KBBI "par·tai" reframe to repeat on the partai landing. Draft keeps
  it to one line to avoid duplicating the apex band. Confirm.
- **CQ4** — `/cara-kerja` exposes exact governance numbers (10–50%, 50%+1–75%). Good for transparency,
  but these are PRD-locked for Phase 0; if Phase 1 tunes them, copy must follow. Flag as a maintenance
  coupling.
