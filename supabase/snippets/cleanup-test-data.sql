-- cleanup-test-data.sql
-- Purge all test data from production.
-- Runs in correct order — children first, then parents.
-- ⚠️  Run in Supabase SQL Editor before/after a test cycle.

begin;

-- Level 1 — analytics / logs / flags (no FK dependencies toward them)
delete from mufakat_reports;
delete from mufakat_semantic_flags;
delete from mufakat_moderation_log;
delete from push_subscriptions;
delete from notifications;

-- Level 2 — reactions + markers (depend on comments/threads/splits)
delete from mufakat_reactions;
delete from mufakat_markers;

-- Level 3 — splits (depend on threads + comments)
delete from mufakat_splits;

-- Level 4 — comments (depend on threads; blocked by reactions/markers cleared above)
delete from mufakat_comments;

-- Level 5 — threads (blocked by comments cleared above)
delete from mufakat_threads;

-- Level 6 — membership + applications + invites (depend on parties + users)
delete from party_members;
delete from party_membership_history;
delete from party_applications;
delete from party_invites;

-- Level 7 — parties (blocked by memberships cleared above)
delete from parties;

-- Level 8 — admin roles
delete from platform_admins;

-- Level 9 — users (blocked by memberships cleared above)
-- ⚠️  Keep your real admin account!
delete from users where email != 'alternatifspace@gmail.com';

-- Level 10 — storage files
delete from storage.objects where bucket_id in ('party-logos', 'party-share-cards');

commit;

-- After SQL cleanup, also delete Clerk users via Clerk Dashboard →
-- https://dashboard.clerk.com → Users → select test users → Delete
