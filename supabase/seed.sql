-- Dev seed data (TRD §3). Not loaded in production.

INSERT INTO users (id, display_name, bio) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Budi Santoso', 'Pendiri partai uji coba'),
  ('00000000-0000-0000-0000-000000000002', 'Siti Rahayu', 'Anggota aktif'),
  ('00000000-0000-0000-0000-000000000003', 'Agus Wijaya', 'Suka berdiskusi'),
  ('00000000-0000-0000-0000-000000000004', 'Dewi Lestari', 'Admin platform'),
  ('00000000-0000-0000-0000-000000000005', 'Rina Maulida', 'Anggota dibisukan');

INSERT INTO platform_admins (user_id) VALUES
  ('00000000-0000-0000-0000-000000000004');

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
   '00000000-0000-0000-0000-000000000003');

INSERT INTO party_members (party_id, user_id, status) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'active'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'active'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'active'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'muted');

INSERT INTO party_membership_history (user_id, party_id, joined_at) VALUES
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', now()),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', now()),
  ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', now()),
  ('00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', now());

INSERT INTO mufakat_threads (id, slug, title, body_text, body_html, op_id, op_party_id) VALUES
  ('20000000-0000-0000-0000-000000000001', 'apakah-subsidi-bbm-perlu-dihapus',
   'Apakah subsidi BBM perlu dihapus?',
   'Subsidi BBM membebani APBN tetapi melindungi daya beli. Bagaimana seharusnya?',
   '<p>Subsidi BBM membebani APBN tetapi melindungi daya beli. Bagaimana seharusnya?</p>',
   '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', 'pendidikan-gratis-sampai-jenjang-mana',
   'Pendidikan gratis sampai jenjang mana?',
   'Wajib belajar 12 tahun sudah berjalan. Apakah pendidikan tinggi juga harus gratis?',
   '<p>Wajib belajar 12 tahun sudah berjalan. Apakah pendidikan tinggi juga harus gratis?</p>',
   '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002');

INSERT INTO mufakat_comments (id, thread_id, author_id, author_party_id, depth, body_text, html) VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 0,
   'Daya beli kelompok rentan harus jadi pertimbangan utama sebelum subsidi dicabut.',
   '<p>Daya beli kelompok rentan harus jadi pertimbangan utama sebelum subsidi dicabut.</p>'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000005', NULL, 0,  -- muted member posts flagless (M0-06)
   'Bagaimana definisi "tepat sasaran" yang dipakai pemerintah selama ini?',
   '<p>Bagaimana definisi "tepat sasaran" yang dipakai pemerintah selama ini?</p>');

INSERT INTO mufakat_reactions (comment_id, user_id, type) VALUES
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'pertanyaan_bagus'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'pertanyaan_bagus'),
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'setuju');
