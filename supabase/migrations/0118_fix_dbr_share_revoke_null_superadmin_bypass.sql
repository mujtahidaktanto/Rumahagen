-- 0118_fix_dbr_share_revoke_null_superadmin_bypass.sql
-- Ditemukan saat menguji nyata route HTTP baru untuk share_dbr_simulation()/
-- revoke_dbr_simulation_share() (0089, dibungkus route pada batch yang sama
-- dengan migration 0117): memanggil kedua fungsi itu dengan auth.uid() berupa
-- UUID yang TIDAK ADA barisnya di public.users (disimulasikan lewat
-- set_config('request.jwt.claims', ...) langsung ke Postgres) BERHASIL
-- membagikan/mencabut share simulasi MILIK ORANG LAIN -- seharusnya ditolak.
--
-- ROOT CAUSE: guard di kedua fungsi (0089) berbentuk
--   IF v_row.agent_id IS DISTINCT FROM auth.uid() AND NOT public.is_superadmin() THEN
-- `is_superadmin()` (0006) = `current_role_code() = 'superadmin'`, dan
-- `current_role_code()` (0006) melakukan JOIN public.users/public.roles
-- WHERE u.id = auth.uid() -- kalau auth.uid() tidak match baris users mana
-- pun, hasilnya NULL (bukan FALSE). NULL = 'superadmin' -> NULL, jadi
-- is_superadmin() mengembalikan NULL. `NOT NULL` = NULL di SQL, dan
-- `TRUE AND NULL` = NULL -- PL/pgSQL memperlakukan kondisi IF yang NULL
-- SAMA seperti FALSE (blok TIDAK dieksekusi), jadi RAISE EXCEPTION tidak
-- pernah terpicu -- caller "lolos" persis seolah dia Superadmin, padahal
-- justru caller yang datanya tidak dikenali sama sekali.
--
-- Diuji nyata (dan didokumentasikan di percakapan build ini): auth.uid()
-- disetel ke UUID acak yang tidak ada di public.users -> share_dbr_simulation()
-- pada simulasi milik agent LAIN berhasil (share_token terisi), padahal
-- guard "hanya Creator" seharusnya menolak. Setelah fix ini diterapkan,
-- percobaan yang SAMA gagal dengan pesan error yang benar.
--
-- FIX: bungkus is_superadmin() dengan COALESCE(..., false) supaya NULL
-- diperlakukan sebagai "bukan superadmin" (fail CLOSED), bukan "entah" yang
-- ternyata diperlakukan sebagai lolos. Pola yang sama (bukan hanya di dua
-- fungsi ini) ditemukan juga di migration 0019/0024/0025/0050 -- SENGAJA
-- TIDAK disentuh di sini (di luar scope batch DBR Share/Revoke ini), dilaporkan
-- terpisah ke pengguna untuk keputusan lanjutan.

CREATE OR REPLACE FUNCTION public.share_dbr_simulation(p_id UUID)
RETURNS public.dbr_simulations
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.dbr_simulations;
BEGIN
  SELECT * INTO v_row FROM public.dbr_simulations WHERE id = p_id;
  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'share_dbr_simulation: simulasi tidak ditemukan';
  END IF;
  IF v_row.agent_id IS DISTINCT FROM auth.uid() AND NOT COALESCE(public.is_superadmin(), false) THEN
    RAISE EXCEPTION 'share_dbr_simulation: hanya Creator (pembuat simulasi) yang boleh membagikan (Gate PRE-00-I §26-27)';
  END IF;

  UPDATE public.dbr_simulations
  SET share_token = gen_random_uuid(), shared_at = now(), revoked_at = NULL
  WHERE id = p_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_dbr_simulation_share(p_id UUID)
RETURNS public.dbr_simulations
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.dbr_simulations;
BEGIN
  SELECT * INTO v_row FROM public.dbr_simulations WHERE id = p_id;
  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'revoke_dbr_simulation_share: simulasi tidak ditemukan';
  END IF;
  IF v_row.agent_id IS DISTINCT FROM auth.uid() AND NOT COALESCE(public.is_superadmin(), false) THEN
    RAISE EXCEPTION 'revoke_dbr_simulation_share: hanya Creator yang boleh mencabut share (Gate PRE-00-I §28)';
  END IF;

  UPDATE public.dbr_simulations
  SET revoked_at = now()
  WHERE id = p_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

COMMENT ON FUNCTION public.share_dbr_simulation IS 'DIPERBAIKI 0118 -- NULL-bypass pada guard kepemilikan ditutup dengan COALESCE(is_superadmin(), false). Gate PRE-00-I §26-27: Creator membagikan simulasi, menghasilkan share_token baru.';
COMMENT ON FUNCTION public.revoke_dbr_simulation_share IS 'DIPERBAIKI 0118 -- NULL-bypass pada guard kepemilikan ditutup dengan COALESCE(is_superadmin(), false). Gate PRE-00-I §28: Creator mencabut akses share, "shared access invalid" seketika.';
