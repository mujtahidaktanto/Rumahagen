-- 0039_events_delete_policy.sql
-- Menutup GAP fisik: STEP11-A (API-084) meng-evidence "DELETE /events/{id}"
-- sebagai current preserved route, TAPI migration 0031_m05_events.sql tidak
-- pernah membuat RLS policy untuk command DELETE di tabel `events` —
-- diverifikasi lewat pg_policies (hanya events_select/events_insert/
-- events_update yang ada). Tanpa policy DELETE, RLS default-deny berlaku
-- untuk SEMUA role termasuk Superadmin (Postgres RLS bukan bypass otomatis
-- untuk role aplikasi manapun) — API-084 secara fisik TIDAK BISA berfungsi
-- sama sekali sebelum migration ini.
--
-- KEPUTUSAN PERMISSION: STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv (50 baris
-- frozen) TIDAK punya baris "m05.event.delete" — hanya create/update/publish/
-- lifecycle/visibility/cancellation yang dievidensi untuk resource Event.
-- Mengikuti pola D13-15 (tidak mengarang permission-ID baru tanpa dasar) DAN
-- pola yang sudah dipakai resource lain saat delete tidak punya permission
-- dedicated (mis. static_public_content/0037, public_announcement_promotion/0014
-- — satu permission menutup seluruh CRUD): DELETE di sini memakai permission
-- `m05.event.update` yang SUDAH ADA sejak seed 0009 (Superadmin=ALL,
-- Admin=ALL, Manager=ALL, Agent=OWN, Instructor=OWN) — bukan permission baru.

CREATE POLICY events_delete ON public.events
  FOR DELETE USING (public.has_permission('m05.event.update', submitted_by));
