-- 0082_enforce_account_status_in_has_permission.sql
-- Menutup gap ditemukan lewat audit keamanan pra-migrasi ke Bolt.new:
-- public.users.status (evidenced STEP10-D, dideklarasikan eksplisit di
-- komentar 0002 sebagai "bagian dari... lifecycle akun yang menjadi
-- tanggung jawab aplikasi") TIDAK PERNAH benar-benar ditegakkan di mana
-- pun -- bukan di satu pun RLS policy (di-grep di seluruh migrations:
-- users.status tidak pernah dipakai satu policy pun), dan bukan juga di
-- layer API Next.js (lib/api/handler.ts hanya memverifikasi sesi Supabase
-- Auth valid lewat getUser(), tidak pernah query users.status). Akibatnya:
-- Agent yang di-suspend/rejected staf TAPI masih memegang JWT valid (belum
-- expired/di-revoke) tetap lolos SEMUA pemeriksaan has_permission() seolah
-- statusnya tidak pernah berubah.
--
-- KEPUTUSAN PERBAIKAN: ditutup di has_permission() (0006), BUKAN di
-- lib/api/handler.ts -- sesuai prinsip R-02 migration 0006 sendiri ("SATU-
-- SATUNYA tempat keputusan otorisasi dihitung", dipanggil ~68 file
-- migration lain) DAN karena rencana pindah ke Bolt.new (UI baru memanggil
-- Supabase LANGSUNG, bukan lewat REST API Next.js) membuat perbaikan di
-- level Next.js saja TIDAK CUKUP -- kalau hanya ditutup di handler.ts,
-- panggilan langsung ke Supabase dari UI Bolt akan tetap menembus lubang
-- yang sama persis. Menutup di has_permission() otomatis berlaku ke SEMUA
-- jalur (REST API existing MAUPUN UI baru yang bicara langsung ke
-- Supabase via anon key).
--
-- SCOPE: HANYA blok status 'suspended' dan 'rejected' -- BUKAN
-- 'pending_review'. 'pending_review' SENGAJA dikecualikan: itu status
-- DEFAULT agent baru (0002) yang justru butuh scope OWN baseline-nya
-- (mis. m01.verification_document.manage='own', 0049) supaya bisa
-- mengunggah dokumen verifikasi -- kalau pending_review ikut diblok,
-- agent baru tidak akan pernah bisa menyelesaikan proses verifikasi sama
-- sekali (deadlock onboarding). 'suspended'/'rejected' adalah keputusan
-- staf yang eksplisit terhadap akun yang sudah pernah aktif/diproses --
-- tidak ada satu jalur evidenced pun yang butuh mereka tetap punya scope
-- OWN apa pun.
--
-- Diletakkan SEBELUM bypass is_superadmin() (bukan sesudah) -- supaya
-- Superadmin yang akunnya sendiri disuspend (mis. investigasi internal)
-- tidak diam-diam tetap punya akses penuh lewat jalur bypass itu.

CREATE OR REPLACE FUNCTION public.has_permission(p_action_code TEXT, p_owner_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_scope  TEXT;
  v_status TEXT;
BEGIN
  SELECT status INTO v_status FROM public.users WHERE id = auth.uid();
  IF v_status IN ('suspended', 'rejected') THEN
    RETURN FALSE;
  END IF;

  IF public.is_superadmin() THEN
    RETURN TRUE;
  END IF;

  v_scope := public.auth_scope(p_action_code);

  IF v_scope = 'all' THEN
    RETURN TRUE;
  ELSIF v_scope = 'own' THEN
    RETURN p_owner_id IS NOT NULL AND p_owner_id = auth.uid();
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.has_permission IS
  'Menghitung TRUE/FALSE untuk satu action_code + optional owner (0006). DIPERLUAS 0082: akun berstatus suspended/rejected (public.users.status) SELALU FALSE di sini, bahkan untuk Superadmin -- dicek SEBELUM bypass is_superadmin(). pending_review TIDAK diblok (lihat komentar migration 0082) -- tetap pakai scope baseline role seperti sebelumnya, supaya alur upload dokumen verifikasi agent baru tidak deadlock.';
