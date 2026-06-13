-- Dev seed data (TRD §3). Not loaded in production.
-- Phase 0: 15 users, 5 parties, 12 threads, 35+ comments, 25+ reactions.

-- =============================================================================
-- USERS (15)
-- =============================================================================

INSERT INTO users (id, display_name, bio) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Budi Santoso',    'Pendiri partai uji coba'),
  ('00000000-0000-0000-0000-000000000002', 'Siti Rahayu',      'Anggota aktif'),
  ('00000000-0000-0000-0000-000000000003', 'Agus Wijaya',      'Suka berdiskusi'),
  ('00000000-0000-0000-0000-000000000004', 'Dewi Lestari',     'Admin platform'),
  ('00000000-0000-0000-0000-000000000005', 'Rina Maulida',     'Anggota dibisukan'),
  ('00000000-0000-0000-0000-000000000006', 'Ahmad Fauzi',      'Aktivis lingkungan dan energi'),
  ('00000000-0000-0000-0000-000000000007', 'Kartini Wijayanti','Akademisi kebijakan publik'),
  ('00000000-0000-0000-0000-000000000008', 'Hadi Prasetyo',    'ASN di kementerian'),
  ('00000000-0000-0000-0000-000000000009', 'Maya Indriani',     'Pekerja teknologi, peduli digital'),
  ('00000000-0000-0000-0000-000000000010', 'Rudi Hartono',      'Mahasiswa pascasarjana'),
  ('00000000-0000-0000-0000-000000000011', 'Nurul Azizah',      'Peneliti kebijakan kesehatan'),
  ('00000000-0000-0000-0000-000000000012', 'Bayu Saputra',      'Guru SMA swasta'),
  ('00000000-0000-0000-0000-000000000013', 'Dian Permata',      'Jurnalis lepas'),
  ('00000000-0000-0000-0000-000000000014', 'Rizky Pratama',     'Wirausahawan sosial'),
  ('00000000-0000-0000-0000-000000000015', 'Fitri Handayani',   'Ibu rumah tangga, aktivis komunitas');

-- =============================================================================
-- PLATFORM ADMINS (1)
-- =============================================================================

INSERT INTO platform_admins (user_id) VALUES
  ('00000000-0000-0000-0000-000000000004');

-- =============================================================================
-- PARTIES (5)
-- =============================================================================

INSERT INTO parties (id, slug, name, tagline, status, governance_config, honeymoon_ends_at, leader_id) VALUES

  ('10000000-0000-0000-0000-000000000001', 'partai-maju', 'Partai Maju',
   'Bergerak maju bersama', 'active',
   '{"recall_petition_threshold": 0.20, "recall_vote_threshold": 0.501,
     "manifesto_approval": "leader_proposes_members_ratify",
     "membership_model": "open", "member_removal_authority": "leader",
     "mufakat_voice": "leader_only"}',
   now() + interval '3 months',
   '00000000-0000-0000-0000-000000000001'),

  ('10000000-0000-0000-0000-000000000002', 'partai-rakyat-digital', 'Partai Rakyat Digital',
   'Demokrasi dari layar ke layar', 'active',
   '{"recall_petition_threshold": 0.15, "recall_vote_threshold": 0.6,
     "manifesto_approval": "member_vote",
     "membership_model": "application", "member_removal_authority": "vote",
     "mufakat_voice": "all_members"}',
   now() + interval '3 months',
   '00000000-0000-0000-0000-000000000003'),

  ('10000000-0000-0000-0000-000000000003', 'gerakan-nusantara-digital', 'Gerakan Nusantara Digital',
   'Inovasi untuk Indonesia yang terhubung', 'active',
   '{"recall_petition_threshold": 0.20, "recall_vote_threshold": 0.501,
     "manifesto_approval": "leader_proposes_members_ratify",
     "membership_model": "open", "member_removal_authority": "vote",
     "mufakat_voice": "all_members"}',
   now() + interval '3 months',
   '00000000-0000-0000-0000-000000000009'),

  ('10000000-0000-0000-0000-000000000004', 'hijau-lestari', 'Hijau Lestari',
   'Bumi sehat, rakyat sejahtera', 'active',
   '{"recall_petition_threshold": 0.15, "recall_vote_threshold": 0.501,
     "manifesto_approval": "member_vote",
     "membership_model": "application", "member_removal_authority": "leader",
     "mufakat_voice": "all_members"}',
   now() + interval '3 months',
   '00000000-0000-0000-0000-000000000011'),

  ('10000000-0000-0000-0000-000000000005', 'partai-solidaritas-kota', 'Partai Solidaritas Kota',
   'Dari warga, untuk warga kota', 'active',
   '{"recall_petition_threshold": 0.20, "recall_vote_threshold": 0.501,
     "manifesto_approval": "leader_proposes_members_ratify",
     "membership_model": "open", "member_removal_authority": "leader",
     "mufakat_voice": "leader_only"}',
   now() + interval '3 months',
   '00000000-0000-0000-0000-000000000013');

-- =============================================================================
-- PARTY MEMBERS (14 — one user not in any party for onboarding testing)
-- =============================================================================

INSERT INTO party_members (party_id, user_id, status) VALUES
  -- Partai Maju (4 members)
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'active'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'active'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'active'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'active'),
  -- PRD (4 members)
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'active'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'muted'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000008', 'active'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'active'),
  -- GND (2 members)
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000009', 'active'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000015', 'active'),
  -- Hijau Lestari (2 members)
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000011', 'active'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000012', 'active'),
  -- PSK (2 members, leader Dian 013)
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000013', 'active'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000014', 'active');

  -- User 014 (Rizky) is in PSK only. The UNIQUE(user_id) constraint enforces
-- one-party-at-a-time globally. No user appears in two parties.

-- =============================================================================
-- PARTY MEMBERSHIP HISTORY (mirror of members)
-- =============================================================================

INSERT INTO party_membership_history (user_id, party_id, joined_at) VALUES
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', now()),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', now()),
  ('00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', now()),
  ('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', now()),
  ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', now()),
  ('00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', now()),
  ('00000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', now()),
  ('00000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000002', now()),
  ('00000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', now()),
  ('00000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', now()),
  ('00000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000004', now()),
  ('00000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000005', now()),
  ('00000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000005', now()),
  ('00000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000003', now());

-- =============================================================================
-- PARTY APPLICATIONS (3) — for admin review queue testing
-- =============================================================================

INSERT INTO party_applications (id, party_id, user_id, message, status, reviewed_by, reviewed_at) VALUES
  ('a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000013', 'Saya ingin bergabung untuk memperjuangkan demokrasi digital.', 'approved',
   '00000000-0000-0000-0000-000000000003', now() - interval '2 days'),
  ('a0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000015', 'Lingkungan adalah isu yang paling mendesak saat ini.', 'pending',
   NULL, NULL),
  ('a0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000010', 'Saya ingin berkontribusi di riset kebijakan hijau.', 'rejected',
   '00000000-0000-0000-0000-000000000011', now() - interval '1 day');

-- =============================================================================
-- MUFAKAT THREADS (12 + 1 split + 1 spinoff = 14)
-- =============================================================================

INSERT INTO mufakat_threads (id, slug, title, body_text, body_html, op_id, op_party_id, status) VALUES

  ('20000000-0000-0000-0000-000000000001', 'apakah-subsidi-bbm-perlu-dihapus',
   'Apakah subsidi BBM perlu dihapus?',
   'Subsidi BBM membebani APBN tetapi melindungi daya beli. Bagaimana seharusnya?',
   '<p>Subsidi BBM membebani APBN tetapi melindungi daya beli. Bagaimana seharusnya?</p>',
   '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'aktif'),

  ('20000000-0000-0000-0000-000000000002', 'pendidikan-gratis-sampai-jenjang-mana',
   'Pendidikan gratis sampai jenjang mana?',
   'Wajib belajar 12 tahun sudah berjalan. Apakah pendidikan tinggi juga harus gratis?',
   '<p>Wajib belajar 12 tahun sudah berjalan. Apakah pendidikan tinggi juga harus gratis?</p>',
   '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'aktif'),

  ('20000000-0000-0000-0000-000000000003', 'pajak-karbon-dan-keadilan-ekonomi',
   'Pajak karbon dan keadilan ekonomi',
   'Pajak karbon direncanakan mulai 2025. Apakah ini akan membebani rakyat kecil atau justru mendorong transisi yang adil?',
   '<p>Pajak karbon direncanakan mulai 2025. Apakah ini akan membebani rakyat kecil atau justru mendorong transisi yang adil?</p>',
   '00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'aktif'),

  ('20000000-0000-0000-0000-000000000004', 'sensor-internet-dan-kebebasan-berekspresi',
   'Sensor internet dan kebebasan berekspresi',
   'Kominfo memblokir ribuan situs setiap tahun. Di mana batas antara perlindungan publik dan pembungkaman?',
   '<p>Kominfo memblokir ribuan situs setiap tahun. Di mana batas antara perlindungan publik dan pembungkaman?</p>',
   '00000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', 'aktif'),

  ('20000000-0000-0000-0000-000000000005', 'bpjs-antara-universal-dan-berkelanjutan',
   'BPJS Kesehatan: antara universal dan berkelanjutan',
   'Defisit BPJS Kesehatan terus membengkak. Bagaimana menyeimbangkan cakupan universal dengan keberlanjutan fiskal?',
   '<p>Defisit BPJS Kesehatan terus membengkak. Bagaimana menyeimbangkan cakupan universal dengan keberlanjutan fiskal?</p>',
   '00000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', 'aktif'),

  ('20000000-0000-0000-0000-000000000006', 'subsidi-transportasi-publik',
   'Subsidi transportasi publik: siapa yang berhak?',
   'Jakarta menghabiskan triliunan untuk subsidi transportasi. Apakah model ini bisa diterapkan di kota lain?',
   '<p>Jakarta menghabiskan triliunan untuk subsidi transportasi. Apakah model ini bisa diterapkan di kota lain?</p>',
   '00000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', 'aktif'),

  ('20000000-0000-0000-0000-000000000007', 'makan-siang-gratis-di-sekolah',
   'Makan siang gratis di sekolah: efektif atau populis?',
   'Program makan siang gratis menjanjikan perbaikan gizi anak. Tapi bagaimana dengan keberlanjutan anggarannya?',
   '<p>Program makan siang gratis menjanjikan perbaikan gizi anak. Tapi bagaimana dengan keberlanjutan anggarannya?</p>',
   '00000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000004', 'aktif'),

  ('20000000-0000-0000-0000-000000000008', 'identitas-digital-nasional',
   'Identitas digital nasional: kemudahan atau pengawasan?',
   'Pemerintah mendorong satu identitas digital untuk semua layanan. Apa risikonya terhadap privasi warga?',
   '<p>Pemerintah mendorong satu identitas digital untuk semua layanan. Apa risikonya terhadap privasi warga?</p>',
   '00000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000005', 'aktif'),

  ('20000000-0000-0000-0000-000000000009', 'kebijakan-kerja-jarak-jauh-asn',
   'Kebijakan kerja jarak jauh untuk ASN',
   'Pasca-pandemi, banyak negara menerapkan hybrid working untuk PNS. Apakah Indonesia siap?',
   '<p>Pasca-pandemi, banyak negara menerapkan hybrid working untuk PNS. Apakah Indonesia siap?</p>',
   '00000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', 'aktif'),

   ('20000000-0000-0000-0000-000000000010', 'reforma-agraria-dan-ketahanan-pangan',
    'Reforma agraria dan ketahanan pangan',
    'Ketimpangan kepemilikan lahan masih tinggi. Reforma agraria bisa menjadi kunci ketahanan pangan nasional.',
    '<p>Ketimpangan kepemilikan lahan masih tinggi. Reforma agraria bisa menjadi kunci ketahanan pangan nasional.</p>',
    '00000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000005', 'aktif'),

  ('20000000-0000-0000-0000-000000000011', 'transisi-energi-batubara-ke-terbarukan',
   'Transisi energi: batubara ke terbarukan',
   'Indonesia menandatangani komitmen transisi energi. Tapi 60% listrik kita masih dari batubara. Jalan keluarnya?',
   '<p>Indonesia menandatangani komitmen transisi energi. Tapi 60% listrik kita masih dari batubara. Jalan keluarnya?</p>',
   '00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'aktif'),

  ('20000000-0000-0000-0000-000000000012', 'pengelolaan-sampah-perkotaan',
   'Pengelolaan sampah perkotaan pasca-TPA',
   'TPA Bantargebang hampir penuh. Kota-kota besar butuh strategi baru pengelolaan sampah. Seperti apa?',
   '<p>TPA Bantargebang hampir penuh. Kota-kota besar butuh strategi baru pengelolaan sampah. Seperti apa?</p>',
   '00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'aktif'),

  -- Split thread (origin from thread 001, good-question split target)
  ('20000000-0000-0000-0000-000000000013', 'metrik-keberhasilan-subsidi-bbm',
   'Bagaimana mengukur keberhasilan subsidi BBM?',
   'Apa ukuran keberhasilan subsidi BBM selama ini? Harus ada metrik yang disepakati dulu sebelum bicara penghapusan.',
   '<p>Apa ukuran keberhasilan subsidi BBM selama ini? Harus ada metrik yang disepakati dulu sebelum bicara penghapusan.</p>',
   '00000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', 'aktif'),

  -- Spin-off thread (admin-initiated from thread 001)
  ('20000000-0000-0000-0000-000000000014', 'skema-kompensasi-penghapusan-subsidi',
   'Skema kompensasi penghapusan subsidi',
   'Jika subsidi BBM dihapus, seperti apa skema kompensasi yang tepat sasaran? Debat teknis desain BLT.',
   '<p>Jika subsidi BBM dihapus, seperti apa skema kompensasi yang tepat sasaran? Debat teknis desain BLT.</p>',
   '00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'aktif');

-- =============================================================================
-- MUFAKAT COMMENTS (35)
-- =============================================================================

INSERT INTO mufakat_comments (id, thread_id, author_id, author_party_id, parent_id, depth, body_text, html, state) VALUES

  -- Thread 001: Subsidi BBM (7 comments)
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', NULL, 0,
   'Daya beli kelompok rentan harus jadi pertimbangan utama sebelum subsidi dicabut.',
   '<p>Daya beli kelompok rentan harus jadi pertimbangan utama sebelum subsidi dicabut.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000005', NULL, NULL, 0,
   'Bagaimana definisi "tepat sasaran" yang dipakai pemerintah selama ini?',
   '<p>Bagaimana definisi "tepat sasaran" yang dipakai pemerintah selama ini?</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 1,
   'Data penerima manfaat harus dibuka ke publik agar kita bisa mengawasi bersama. Tanpa transparansi, subsidi hanya jadi alat politik.',
   '<p>Data penerima manfaat harus dibuka ke publik agar kita bisa mengawasi bersama. Tanpa transparansi, subsidi hanya jadi alat politik.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', NULL, 0,
   'Penghapusan subsidi harus bertahap dan diiringi kompensasi langsung ke 40% termiskin. Jangan sampai shock therapy.',
   '<p>Penghapusan subsidi harus bertahap dan diiringi kompensasi langsung ke 40% termiskin. Jangan sampai shock therapy.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', 1,
   'BLT sudah dicoba sebelumnya. Masalah utamanya adalah data penerima yang tidak akurat. Perbaiki data dulu, baru bicara kompensasi.',
   '<p>BLT sudah dicoba sebelumnya. Masalah utamanya adalah data penerima yang tidak akurat. Perbaiki data dulu, baru bicara kompensasi.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', NULL, 0,
   'Apa ukuran keberhasilan subsidi BBM selama ini? Harus ada metrik yang disepakati dulu sebelum bicara penghapusan.',
   '<p>Apa ukuran keberhasilan subsidi BBM selama ini? Harus ada metrik yang disepakati dulu sebelum bicara penghapusan.</p>', 'moved'),

  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000006', 1,
   'Pertanyaan fundamental. Debat subsidi BBM sering berputar karena tidak ada baseline yang disepakati.',
   '<p>Pertanyaan fundamental. Debat subsidi BBM sering berputar karena tidak ada baseline yang disepakati.</p>', 'visible'),

  -- Thread 002: Pendidikan gratis (5 comments)
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', NULL, 0,
   'Pendidikan tinggi gratis itu ideal, tapi realistiskah dengan kapasitas fiskal kita saat ini?',
   '<p>Pendidikan tinggi gratis itu ideal, tapi realistiskah dengan kapasitas fiskal kita saat ini?</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000008', 1,
   'Yang lebih realistis: beasiswa penuh untuk keluarga tidak mampu. Bukan gratis untuk semua, termasuk yang mampu.',
   '<p>Yang lebih realistis: beasiswa penuh untuk keluarga tidak mampu. Bukan gratis untuk semua, termasuk yang mampu.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000004', NULL, 0,
   'Sebagai guru, saya melihat masalahnya bukan hanya biaya kuliah. Kualitas SD-SMA kita juga masih timpang antar daerah.',
   '<p>Sebagai guru, saya melihat masalahnya bukan hanya biaya kuliah. Kualitas SD-SMA kita juga masih timpang antar daerah.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000010', 1,
   'Betul. Fokus pada pemerataan kualitas dulu. Pendidikan gratis tanpa kualitas hanya menciptakan ilusi akses.',
   '<p>Betul. Fokus pada pemerataan kualitas dulu. Pendidikan gratis tanpa kualitas hanya menciptakan ilusi akses.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000002', NULL, 0,
   'Di banyak negara maju, pendidikan tinggi gratis tapi sangat kompetitif masuknya. Mungkin model itu yang perlu kita tiru.',
   '<p>Di banyak negara maju, pendidikan tinggi gratis tapi sangat kompetitif masuknya. Mungkin model itu yang perlu kita tiru.</p>', 'visible'),

  -- Thread 003: Pajak karbon (5 comments)
  ('30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', NULL, 0,
   'Pajak karbon adalah instrumen pasar yang terbukti di Eropa. Tapi di Indonesia perlu penyesuaian karena struktur ekonominya berbeda.',
   '<p>Pajak karbon adalah instrumen pasar yang terbukti di Eropa. Tapi di Indonesia perlu penyesuaian karena struktur ekonominya berbeda.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000013', 1,
   'Yang jadi pertanyaan: apakah revenue dari pajak karbon akan dialokasikan untuk program hijau, atau malah masuk ke kas umum?',
   '<p>Yang jadi pertanyaan: apakah revenue dari pajak karbon akan dialokasikan untuk program hijau, atau malah masuk ke kas umum?</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', NULL, 0,
   'PLN dan industri besar akan kena dampak paling besar. Pemerintah harus punya peta jalan yang jelas untuk transisi mereka.',
   '<p>PLN dan industri besar akan kena dampak paling besar. Pemerintah harus punya peta jalan yang jelas untuk transisi mereka.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000015', 1,
   'Di Selandia Baru, penerimaan pajak karbon dikembalikan ke rakyat sebagai dividen. Bisa jadi model yang lebih adil.',
   '<p>Di Selandia Baru, penerimaan pajak karbon dikembalikan ke rakyat sebagai dividen. Bisa jadi model yang lebih adil.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000005', NULL, 0,
   'Jangan lupa sektor transportasi. Kendaraan pribadi menyumbang emisi besar. Pajak karbon harus mencakup BBM juga, bukan cuma industri.',
   '<p>Jangan lupa sektor transportasi. Kendaraan pribadi menyumbang emisi besar. Pajak karbon harus mencakup BBM juga, bukan cuma industri.</p>', 'visible'),

  -- Thread 004: Sensor internet (5 comments)
  ('30000000-0000-0000-0000-000000000018', '20000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000002', NULL, 0,
   'Pemblokiran sepihak tanpa proses pengadilan adalah bentuk sensor yang bertentangan dengan prinsip due process.',
   '<p>Pemblokiran sepihak tanpa proses pengadilan adalah bentuk sensor yang bertentangan dengan prinsip due process.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000019', '20000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000018', 1,
   'Sebagai jurnalis, saya sering mengalami situs berita diblokir tanpa penjelasan. Ini bukan hanya soal konten negatif — ini soal transparansi.',
   '<p>Sebagai jurnalis, saya sering mengalami situs berita diblokir tanpa penjelasan. Ini bukan hanya soal konten negatif — ini soal transparansi.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000020', '20000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000019', 2,
   'Kita butuh lembaga independen yang mengawasi pemblokiran. Bukan Kominfo sebagai hakim, jaksa, dan algojo sekaligus.',
   '<p>Kita butuh lembaga independen yang mengawasi pemblokiran. Bukan Kominfo sebagai hakim, jaksa, dan algojo sekaligus.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000020', 3,
   'Di Jerman, pemblokiran konten harus lewat putusan pengadilan dulu. Kenapa kita tidak mengadopsi model yang sama?',
   '<p>Di Jerman, pemblokiran konten harus lewat putusan pengadilan dulu. Kenapa kita tidak mengadopsi model yang sama?</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000022', '20000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000003', NULL, 0,
   'Konten radikalisme dan pornografi anak memang harus ditindak. Tapi prosesnya harus transparan dan bisa diaudit.',
   '<p>Konten radikalisme dan pornografi anak memang harus ditindak. Tapi prosesnya harus transparan dan bisa diaudit.</p>', 'deleted'),

  -- Thread 005: BPJS (6 comments)
  ('30000000-0000-0000-0000-000000000023', '20000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', NULL, 0,
   'Dari sisi kebijakan publik, BPJS adalah pencapaian besar. Tapi model pembiayaannya memang perlu direformasi.',
   '<p>Dari sisi kebijakan publik, BPJS adalah pencapaian besar. Tapi model pembiayaannya memang perlu direformasi.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000024', '20000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000023', 1,
   'Banyak peserta mandiri yang menunggak. Apakah ini masalah kesadaran atau keterjangkauan iuran?',
   '<p>Banyak peserta mandiri yang menunggak. Apakah ini masalah kesadaran atau keterjangkauan iuran?</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000025', '20000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000024', 2,
   'Dua-duanya. Untuk pekerja informal, iuran Rp 42.000 per orang per bulan itu berat. Perlu subsidi silang yang lebih progresif.',
   '<p>Dua-duanya. Untuk pekerja informal, iuran Rp 42.000 per orang per bulan itu berat. Perlu subsidi silang yang lebih progresif.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000026', '20000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000005', NULL, NULL, 0,
   'Di lapangan, obat sering kosong dan antrean panjang. Masalahnya bukan cuma pembiayaan, tapi juga manajemen.',
   '<p>Di lapangan, obat sering kosong dan antrean panjang. Masalahnya bukan cuma pembiayaan, tapi juga manajemen.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000027', '20000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000026', 1,
   'Mungkin saatnya BPJS punya dashboard publik real-time: stok obat, antrean RS, klaim tertunda. Transparansi bisa jadi alat perbaikan.',
   '<p>Mungkin saatnya BPJS punya dashboard publik real-time: stok obat, antrean RS, klaim tertunda. Transparansi bisa jadi alat perbaikan.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000028', '20000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000005', NULL, 0,
   'Negara dengan universal healthcare selalu punya problem yang sama: aging population + rising costs. Kita harus antisipasi dari sekarang.',
   '<p>Negara dengan universal healthcare selalu punya problem yang sama: aging population + rising costs. Kita harus antisipasi dari sekarang.</p>', 'visible'),

  -- Thread 006: Transportasi publik (4 comments)
  ('30000000-0000-0000-0000-000000000029', '20000000-0000-0000-0000-000000000006',
   '00000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000005', NULL, 0,
   'Subsidi transportasi Jakarta menghabiskan Rp 4T/tahun. Tapi cakupannya masih terbatas di Jabodetabek.',
   '<p>Subsidi transportasi Jakarta menghabiskan Rp 4T/tahun. Tapi cakupannya masih terbatas di Jabodetabek.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000030', '20000000-0000-0000-0000-000000000006',
   '00000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000029', 1,
   'Kota-kota besar lain seperti Surabaya dan Medan juga butuh. Tapi model subsidinya harus disesuaikan, tidak bisa copy-paste Jakarta.',
   '<p>Kota-kota besar lain seperti Surabaya dan Medan juga butuh. Tapi model subsidinya harus disesuaikan, tidak bisa copy-paste Jakarta.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000031', '20000000-0000-0000-0000-000000000006',
   '00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', NULL, 0,
   'Pertanyaan: kenapa subsidi transportasi publik dianggap "pemborosan" tapi subsidi BBM tidak? Padahal transportasi publik lebih ramah lingkungan.',
   '<p>Pertanyaan: kenapa subsidi transportasi publik dianggap "pemborosan" tapi subsidi BBM tidak? Padahal transportasi publik lebih ramah lingkungan.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000032', '20000000-0000-0000-0000-000000000006',
   '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000031', 1,
   'Poin bagus. Ini bias kebijakan yang sudah mengakar. Subsidi BBM dinikmati kelas menengah-atas, tapi selalu dibela.',
   '<p>Poin bagus. Ini bias kebijakan yang sudah mengakar. Subsidi BBM dinikmati kelas menengah-atas, tapi selalu dibela.</p>', 'visible'),

  -- Split thread 013 (2 comments — the seed comment + a reply)
  ('30000000-0000-0000-0000-000000000033', '20000000-0000-0000-0000-000000000013',
   '00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', NULL, 0,
   'Saya usulkan tiga metrik: (1) persentase anggaran yang sampai ke 40% termiskin, (2) elastisitas konsumsi BBM terhadap harga, (3) dampak lingkungan per rupiah subsidi.',
   '<p>Saya usulkan tiga metrik: (1) persentase anggaran yang sampai ke 40% termiskin, (2) elastisitas konsumsi BBM terhadap harga, (3) dampak lingkungan per rupiah subsidi.</p>', 'visible'),

  ('30000000-0000-0000-0000-000000000034', '20000000-0000-0000-0000-000000000013',
   '00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000033', 1,
   'Metrik kedua paling sulit diukur karena banyak faktor yang mempengaruhi konsumsi BBM. Tapi secara garis besar saya setuju framework-nya.',
   '<p>Metrik kedua paling sulit diukur karena banyak faktor yang mempengaruhi konsumsi BBM. Tapi secara garis besar saya setuju framework-nya.</p>', 'visible'),

  -- Spin-off thread 014 (1 comment)
  ('30000000-0000-0000-0000-000000000035', '20000000-0000-0000-0000-000000000014',
   '00000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', NULL, 0,
   'Pengalaman India: mereka menghapus subsidi BBM dan mengganti dengan LPG subsidi untuk rumah tangga miskin. Hasilnya cukup berhasil karena targeting-nya jelas.',
   '<p>Pengalaman India: mereka menghapus subsidi BBM dan mengganti dengan LPG subsidi untuk rumah tangga miskin. Hasilnya cukup berhasil karena targeting-nya jelas.</p>', 'visible');

-- Set moved_to_thread_id for the moved comment after target thread exists
UPDATE mufakat_comments
   SET moved_to_thread_id = '20000000-0000-0000-0000-000000000013'
 WHERE id = '30000000-0000-0000-0000-000000000006';

-- Set seed_comment_id for the split thread
UPDATE mufakat_threads
   SET origin = 'split', parent_thread_id = '20000000-0000-0000-0000-000000000001',
       seed_comment_id = '30000000-0000-0000-0000-000000000006'
 WHERE id = '20000000-0000-0000-0000-000000000013';

-- Set origin for spin-off thread
UPDATE mufakat_threads
   SET origin = 'spinoff', parent_thread_id = '20000000-0000-0000-0000-000000000001'
 WHERE id = '20000000-0000-0000-0000-000000000014';

-- =============================================================================
-- MUFAKAT REACTIONS (25)
-- =============================================================================

INSERT INTO mufakat_reactions (id, comment_id, user_id, type) VALUES
  -- Thread 001 reactions
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'pertanyaan_bagus'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'pertanyaan_bagus'),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'setuju'),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'setuju'),
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'setuju'),
  ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000008', 'setuju'),
  ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000009', 'setuju'),
  -- Many pertanyaan_bagus on comment 006 (the moved one — this triggered the split)
  ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'pertanyaan_bagus'),
  ('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'pertanyaan_bagus'),
  ('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 'pertanyaan_bagus'),
  ('40000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000008', 'pertanyaan_bagus'),
  ('40000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000009', 'pertanyaan_bagus'),

  -- Thread 002 reactions
  ('40000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000007', 'setuju'),
  ('40000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000012', 'setuju'),

  -- Thread 003 reactions
  ('40000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000009', 'setuju'),
  ('40000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000006', 'setuju'),
  ('40000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000015', 'setuju'),

  -- Thread 004 reactions
  ('40000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000009', 'setuju'),
  ('40000000-0000-0000-0000-000000000019', '30000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000009', 'setuju'),
  ('40000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000013', 'pertanyaan_bagus'),

  -- Thread 005 reactions
  ('40000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000006', 'setuju'),
  ('40000000-0000-0000-0000-000000000022', '30000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000005', 'setuju'),
  ('40000000-0000-0000-0000-000000000023', '30000000-0000-0000-0000-000000000028', '00000000-0000-0000-0000-000000000009', 'pertanyaan_bagus'),

  -- Thread 006 reactions
  ('40000000-0000-0000-0000-000000000024', '30000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000002', 'pertanyaan_bagus'),
  ('40000000-0000-0000-0000-000000000025', '30000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000007', 'setuju'),

  -- Split thread reactions
  ('40000000-0000-0000-0000-000000000026', '30000000-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000011', 'setuju');

-- =============================================================================
-- MUFAKAT SPLITS (2)
-- =============================================================================

INSERT INTO mufakat_splits (id, type, source_thread_id, source_comment_id, target_thread_id,
  reaction_count_at_split, participants_at_split, threshold_at_split,
  op_status, op_window_ends_at, created_by) VALUES

  ('50000000-0000-0000-0000-000000000001', 'good_question',
   '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000006',
   '20000000-0000-0000-0000-000000000013',
   5, 8, 5,
   'confirmed', now() - interval '1 day', NULL),

  ('50000000-0000-0000-0000-000000000002', 'spinoff',
   '20000000-0000-0000-0000-000000000001', NULL,
   '20000000-0000-0000-0000-000000000014',
   NULL, NULL, NULL,
   'n_a', NULL,
   '00000000-0000-0000-0000-000000000004');

-- =============================================================================
-- MUFAKAT MARKERS (1 — spin-off marker in thread 001)
-- =============================================================================

INSERT INTO mufakat_markers (id, thread_id, after_comment_id, split_id, kind, label) VALUES
  ('60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
   '30000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000002',
   'spinoff', 'Debat teknis skema kompensasi subsidi');

-- =============================================================================
-- MUFAKAT REPORTS (2)
-- =============================================================================

INSERT INTO mufakat_reports (id, subject_type, subject_id, reported_by, category, note, status, reviewed_by, reviewed_at) VALUES
  ('70000000-0000-0000-0000-000000000001', 'comment',
   '30000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000010',
   'spam', 'Komentar ini tidak relevan dengan topik diskusi.', 'dismissed',
   '00000000-0000-0000-0000-000000000004', now() - interval '1 day'),
  ('70000000-0000-0000-0000-000000000002', 'comment',
   '30000000-0000-0000-0000-000000000026', '00000000-0000-0000-0000-000000000012',
   'defamation', 'Komentar ini mengandung tuduhan terhadap manajemen RS.', 'pending',
   NULL, NULL);

-- =============================================================================
-- MUFAKAT MODERATION LOG (2)
-- =============================================================================

INSERT INTO mufakat_moderation_log (id, action, subject_type, subject_id) VALUES
  ('80000000-0000-0000-0000-000000000001', 'spinoff_executed', 'thread', '20000000-0000-0000-0000-000000000014'),
  ('80000000-0000-0000-0000-000000000002', 'hide_comment', 'comment', '30000000-0000-0000-0000-000000000022');

-- =============================================================================
-- NOTIFICATIONS (4)
-- =============================================================================

INSERT INTO notifications (id, user_id, type, payload, read_at) VALUES
  ('90000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011',
   'mufakat_good_question_split',
   '{"split_id": "50000000-0000-0000-0000-000000000001", "thread_slug": "metrik-keberhasilan-subsidi-bbm", "thread_title": "Bagaimana mengukur keberhasilan subsidi BBM?"}',
   NULL),
  ('90000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000011',
   'mufakat_split_op_confirmed',
   '{"split_id": "50000000-0000-0000-0000-000000000001", "thread_slug": "metrik-keberhasilan-subsidi-bbm"}',
   now()),
  ('90000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000013',
   'party_application_approved',
   '{"party_id": "10000000-0000-0000-0000-000000000002", "party_name": "Partai Rakyat Digital"}',
   now()),
  ('90000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000015',
   'party_application_pending',
   '{"party_id": "10000000-0000-0000-0000-000000000004", "party_name": "Hijau Lestari"}',
   NULL);

-- =============================================================================
-- MUFAKAT SEMANTIC FLAGS (1 — definition debate)
-- =============================================================================

INSERT INTO mufakat_semantic_flags (id, comment_id, flagged_by, status) VALUES
  ('b0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000006',
   '00000000-0000-0000-0000-000000000007', 'actioned');
