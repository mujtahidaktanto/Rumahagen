-- 0164_m13_byok_ownership_agent_correction.sql
-- KOREKSI kepemilikan BYOK M13 (bukan ADD-NEW): Gate PRE-00-O
-- (M13_PROVIDER_CATALOGUE_BYOK_AUTHORITY_GATE_FULL_v1.0.md §23 Actor/Role
-- Reconciliation) eksplisit menetapkan Agent = OWN/full own lifecycle untuk
-- own_byok_connection.*. Migration 0009 (seed) + 0016 (RLS) hanya memberi
-- Developer Partner (mengikuti STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv,
-- baris frozen) dan TIDAK memberi Agent sama sekali — padahal
-- persona-nav.tsx sudah menaruh menu "AI Assistant" di nav Agent
-- (`/agent/ai`). Komentar tabel agent_ai_connections di 0016 secara
-- eksplisit menafsirkan ulang "agent" pada nama tabel sebagai istilah
-- generik untuk actor, bukan pengikat ke role platform "Agent" —
-- penafsiran itu SEKARANG DIKOREKSI.
--
-- Keputusan pemilik produk (2026-09-26): untuk MVP, BYOK/AI Assistant
-- dibuka untuk DUA role saja — Agent dan Developer Partner (masing-masing
-- hanya mengelola koneksi MILIK SENDIRI, scope 'own') — supaya tidak perlu
-- mengubah shell/nav Manager (area Admin) atau Instructor sekarang.
-- Manager dan Instructor SENGAJA tidak disertakan di batch ini. Migration
-- ini MENAMBAH permission m13.own_byok_connection.* (create/view/update/
-- rotate/test/enable/disable/disconnect, scope 'own') untuk role agent;
-- Developer Partner TIDAK dicabut (sudah dapat dari 0009).
--
-- TIDAK BERUBAH: permission Superadmin (scope 'all' — governed own/
-- administrative context per Gate §23), Admin/Manager/Instructor/Buyer
-- tetap tanpa own_byok_connection.* untuk saat ini, dan
-- m13.administrative_force_revoke_disable.execute (tetap Superadmin-only).
-- TIDAK ADA perubahan skema/RLS/trigger — RLS agent_ai_connections_*
-- (0016) sudah generik lewat has_permission(code, user_id), otomatis
-- mengikuti role_permissions manapun yang berlaku tanpa perlu diubah.

INSERT INTO role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, 'own', 'superadmin'
FROM (VALUES
  ('m13.own_byok_connection.create'),
  ('m13.own_byok_connection.view'),
  ('m13.own_byok_connection.update'),
  ('m13.own_byok_connection.rotate'),
  ('m13.own_byok_connection.test'),
  ('m13.own_byok_connection.enable'),
  ('m13.own_byok_connection.disable'),
  ('m13.own_byok_connection.disconnect')
) AS g(permission_code)
JOIN roles r ON r.code = 'agent'
JOIN permissions p ON p.action_code = g.permission_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Perbarui dokumentasi tabel supaya tidak lagi menyesatkan (lihat komentar
-- asli di 0016 yang sekarang keliru) — tanpa mengubah baris migration 0016
-- itu sendiri (riwayat migration yang sudah diterapkan tidak diedit).
COMMENT ON TABLE public.agent_ai_connections IS
  'Koneksi BYOK milik pemanggil sendiri (scope OWN), MVP untuk role Agent dan Developer Partner (0164 — Agent ditambahkan, mengoreksi seed 0009 asli yang keliru hanya memberi Developer Partner; lihat Gate PRE-00-O §23 Actor/Role Reconciliation dan keputusan pemilik produk 2026-09-26). Manager dan Instructor sengaja belum disertakan di MVP ini. Kolom tetap bernama user_id/agent_ai_connections mengikuti STEP10-D apa adanya. encrypted_api_key TIDAK PERNAH didekripsi di lapisan SQL/RLS — hanya disimpan; dekripsi terjadi di application layer route handler saat dipakai memanggil provider.';

-- Rollback (diuji manual sebelum "terapkan 0164"):
--   DELETE FROM role_permissions
--   WHERE role_id = (SELECT id FROM roles WHERE code = 'agent')
--     AND permission_id IN (SELECT id FROM permissions WHERE action_code LIKE 'm13.own_byok_connection.%');
