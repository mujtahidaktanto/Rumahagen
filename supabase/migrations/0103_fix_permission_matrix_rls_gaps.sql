-- 0103_fix_permission_matrix_rls_gaps.sql
-- Ditemukan saat membangun API konsol Permission Matrix (M10, gap #2) --
-- dua bug RLS terpisah yang tidak terlihat sampai benar-benar diuji dengan
-- sesi Manager/Admin sungguhan.
--
-- BUG 1 (silent failure): `role_permissions_manager_modify_agent_rows`
-- (0007) memanggil has_permission('m10.agent_permission_rows.modify')
-- TANPA owner_id, padahal permission ini di-seed scope 'own' untuk Manager
-- (0009). has_permission() untuk scope 'own' TANPA owner_id SELALU
-- mengembalikan FALSE (0006 baris 104-105: p_owner_id IS NOT NULL AND ...)
-- -- jadi policy ini TIDAK PERNAH benar-benar meloloskan Manager, sejak
-- pertama dibuat. Diverifikasi nyata: Manager coba PATCH baris agent di
-- role_permissions -> 200 OK tapi 0 baris berubah (RLS diam-diam
-- menyaring, bukan error eksplisit -- silent failure, lebih berbahaya
-- dari 403 biasa). "own" di sini secara semantik berarti "role Agent milik
-- domain Manager", bukan "baris milik user tertentu" seperti pemakaian
-- has_permission(action, owner_id) di tempat lain -- pola yang sama sekali
-- berbeda tapi kebetulan memakai kata kunci scope yang sama. Diperbaiki
-- dengan menghapus panggilan has_permission() yang salah pasang itu;
-- pengecekan role+target role sudah cukup jadi otorisasi (pola sama
-- seperti permission_presets_manage yang juga langsung cek
-- current_role_code() untuk cabang Manager-nya).
--
-- BUG 2 (Admin tidak bisa lihat preset sama sekali): permission_presets/
-- permission_preset_items/user_permission_presets HANYA punya policy
-- FOR ALL (mencakup SELECT) yang membatasi ke Superadmin+Manager -- Admin
-- TIDAK PERNAH bisa SELECT baris ini sama sekali. Kontradiksi dengan
-- STEP12-B §2 sendiri: "Admin: no preset management; governed VISIBILITY
-- is distinct from management authority where the current M10 evidence
-- permits it" -- Admin seharusnya tetap bisa LIHAT (bukan kelola).
-- Ditambah policy SELECT terpisah memakai has_permission
-- ('m10.role_permission_matrix.view') -- permission yang SAMA yang sudah
-- menggerbangi visibilitas role_permissions (Superadmin/Admin/Manager
-- ALL/ALL/ALL) -- tidak ada permission baru dibuat.

-- ── BUG 1 ──
DROP POLICY IF EXISTS role_permissions_manager_modify_agent_rows ON public.role_permissions;

CREATE POLICY role_permissions_manager_modify_agent_rows ON public.role_permissions
  FOR UPDATE USING (
    public.current_role_code() = 'manager'
    AND role_id = (SELECT id FROM public.roles WHERE code = 'agent')
  )
  WITH CHECK (
    role_id = (SELECT id FROM public.roles WHERE code = 'agent')
  );

-- ── BUG 2 ──
CREATE POLICY permission_presets_select_view ON public.permission_presets
  FOR SELECT USING (public.has_permission('m10.role_permission_matrix.view'));

CREATE POLICY permission_preset_items_select_view ON public.permission_preset_items
  FOR SELECT USING (public.has_permission('m10.role_permission_matrix.view'));

CREATE POLICY user_permission_presets_select_view ON public.user_permission_presets
  FOR SELECT USING (public.has_permission('m10.role_permission_matrix.view'));
