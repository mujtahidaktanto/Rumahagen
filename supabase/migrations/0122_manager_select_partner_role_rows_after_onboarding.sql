-- 0122_manager_select_partner_role_rows_after_onboarding.sql
-- Ditemukan lewat live-testing 0121 (throwaway test users, 2026-09-25):
-- PostgreSQL RLS mensyaratkan baris HASIL (NEW row, setelah UPDATE)
-- JUGA lolos SELECT USING -- bukan cuma WITH CHECK dari policy UPDATE
-- yang match -- karena UPDATE/DELETE mewajibkan baris hasil tetap
-- "terlihat" lewat SELECT policy, sama seperti syarat OLD row. Policy
-- 0121 (`users_select_manager_agent_rows`) hanya mengizinkan
-- role_id='agent' -- begitu Manager berhasil mengubah baris jadi
-- Instructor/Buyer/Developer Partner, baris HASIL itu langsung gagal
-- SELECT USING (role sudah bukan 'agent' lagi), sehingga Postgres
-- menolak SELURUH UPDATE dengan error 42501 "new row violates row-level
-- security policy" -- padahal WITH CHECK di 0120 sendiri sudah benar
-- mengizinkan transisi ini. Dikonfirmasi: transisi Agent->Instructor
-- oleh Manager gagal persis dengan error ini sebelum fix ini.
--
-- Fix: perluas SELECT policy Manager supaya juga mencakup role HASIL
-- transisi (instructor/buyer/developer_partner) -- TETAP TIDAK mencakup
-- admin/manager/superadmin (baris staf lain tetap sama sekali tidak
-- terlihat/tidak bisa disentuh Manager). Ini bukan menambah kemampuan
-- UBAH Manager -- UPDATE USING (0120) tetap terkunci ke role='agent'
-- saja -- hanya kemampuan LIHAT baris yang baru saja jadi hasil
-- onboarding (wajar: Manager perlu melihat baris yang barusan dia
-- konversi, dan mitra yang sudah ada, dari M06-Developer-Project-Admin
-- misalnya).
--
-- ALTER POLICY dipakai (bukan DROP+CREATE) supaya atomik, satu statement.

ALTER POLICY users_select_manager_agent_rows ON public.users
  USING (
    public.current_role_code() = 'manager'
    AND role_id IN (
      SELECT id FROM public.roles
      WHERE code IN ('agent', 'instructor', 'buyer', 'developer_partner')
    )
  );
