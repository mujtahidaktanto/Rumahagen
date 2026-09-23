-- 0112_fix_organization_members_manage_rls_recursion.sql
-- Ditemukan saat menguji nyata batch 0110/0111 (M12 Organization CRUD):
-- SETIAP UPDATE ke organization_members (leave/remove member) gagal
-- dengan Postgres error 42P17 "infinite recursion detected in policy for
-- relation organization_members".
--
-- ROOT CAUSE: `organization_members_manage` (0007) menulis pengecekan
-- leader-aktif sebagai subquery INLINE ke tabel yang sama
-- (`EXISTS (SELECT 1 FROM organization_members om WHERE ...)`) di dalam
-- USING/WITH CHECK-nya SENDIRI -- subquery itu sendiri tunduk RLS tabel
-- yang sama (termasuk policy ini sendiri), menciptakan evaluasi sirkular.
-- Bug ini DORMAN sejak 0007 -- tidak pernah ketahuan karena TIDAK ADA
-- route apa pun yang benar-benar melakukan UPDATE ke organization_members
-- sebelum batch 0110/0111 (leave/remove member baru pertama kali dibangun
-- di sini) -- pola sama persis seperti bug-bug lain yang ditemukan sesi
-- ini (RLS/trigger yang ditulis tapi tidak pernah dieksekusi jalur
-- nyatanya sampai fitur yang memakainya benar-benar dibangun).
--
-- FIX: ganti subquery inline dengan helper is_org_leader() yang SUDAH ADA
-- (0050, SECURITY DEFINER) -- fungsi SECURITY DEFINER meng-query tabel
-- yang sama TANPA tunduk RLS pemanggil (bypass, bukan re-evaluasi
-- rekursif), menghilangkan sirkularitas sepenuhnya. Kondisi logis
-- IDENTIK (organization_id sama, agent_id=auth.uid(), role='leader',
-- status='active') -- bukan perubahan perilaku, murni perbaikan bug.

DROP POLICY organization_members_manage ON public.organization_members;

CREATE POLICY organization_members_manage ON public.organization_members
  FOR ALL USING (
    public.is_superadmin()
    OR public.current_role_code() = 'admin'
    OR public.is_org_leader(organization_id)
  )
  WITH CHECK (
    public.is_superadmin()
    OR public.current_role_code() = 'admin'
    OR public.is_org_leader(organization_id)
  );
