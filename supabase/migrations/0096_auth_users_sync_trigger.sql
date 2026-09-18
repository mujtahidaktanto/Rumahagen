-- 0096_auth_users_sync_trigger.sql
-- Gap M01 (Identity/Auth REST API, STEP11-A/B1): SEMUA 10 endpoint auth
-- (register/verify-otp/resend-otp/login/oauth google/refresh/logout/
-- logout-all/forgot-password/reset-password) mengasumsikan setiap baris
-- auth.users punya pasangan public.users (role_id, status) untuk
-- has_permission()/RLS (migration 0006). Belum ada mekanisme yang membuat
-- baris itu otomatis -- dicek via grep repo-wide, nol hasil.
--
-- Kenapa TRIGGER di DB, bukan cuma insert manual di route /auth/register:
-- Google OAuth (salah satu dari 10 endpoint yang sama) redirect user
-- LANGSUNG ke Supabase Auth lalu balik dengan sesi sudah jadi -- route
-- custom /api/auth/oauth/google TIDAK PERNAH jadi perantara baris
-- auth.users dibuat. Kalau public.users hanya dibuat di route
-- /auth/register, signup via Google akan lolos tanpa role_id/status ->
-- has_permission() gagal untuk user itu selamanya. Trigger di auth.users
-- menjamin baris public.users selalu dibuat apa pun jalur pembuatan
-- auth.users-nya (password signup, OTP signup, OAuth, admin-created).
-- Ini pola resmi yang didokumentasikan Supabase sendiri untuk kasus ini.
--
-- Default role_id: 'agent' -- satu-satunya role yang STEP11-B1/STEP13-B
-- gambarkan sebagai subjek self-registration (KTP, aktivasi, dst. semua
-- bicara soal "Agent"). Role lain (buyer/developer_partner/instructor/
-- admin/manager/superadmin) dianggap dibuat lewat jalur lain (invite/admin),
-- bukan self-registration publik -- tidak ada satu pun dokumen Core yang
-- mengunci role selection field di form register.
--
-- Trigger kedua (AFTER UPDATE) menyinkronkan email_verified_at begitu
-- Supabase mengisi auth.users.email_confirmed_at (saat OTP diverifikasi),
-- supaya public.users tidak permanen NULL walau user sudah aktif.

CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agent_role_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT id INTO v_agent_role_id FROM public.roles WHERE code = 'agent';

    INSERT INTO public.users (id, role_id, email_verified_at)
    VALUES (NEW.id, v_agent_role_id, NEW.email_confirmed_at)
    ON CONFLICT (id) DO NOTHING;

  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
      UPDATE public.users
      SET email_verified_at = NEW.email_confirmed_at, updated_at = now()
      WHERE id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_sync();

CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_sync();
