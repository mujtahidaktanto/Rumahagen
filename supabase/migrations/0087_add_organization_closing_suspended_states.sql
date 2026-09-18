-- 0087_add_organization_closing_suspended_states.sql
-- Menutup temuan Tier 2 T2-2 dari audit/CORE_VS_MIGRATED_BACKEND_AUDIT.md:
-- `docs/core/current/00-governance/STEP-00/PRE-00-N_M12_ORGANIZATION_
-- MEMBERSHIP_AUTHORITY_GATE_FULL_v1.0.md` §6 mengunci siklus operasional
-- `ACTIVE -> CLOSING -> CLOSED` (dua langkah eksplisit: Close lalu Confirm)
-- PLUS state enforcement terpisah `SUSPENDED` — direvalidasi PASS di
-- STEP-14 final (`M12-CI-002`). `organizations_status_check` (0005) cuma
-- biner `active`/`closed` -- pola drift yang sama seperti T2-1.
--
-- Desain: 'closing'/'closed' tetap bisa diinisiasi leader (created_by)
-- lewat RLS `organizations_manage` yang SUDAH ADA (0007, tidak diubah) --
-- itu memang alur self-service dua langkah yang dikunci Core. 'suspended'
-- BEDA -- Gate menyebutnya "additional platform ENFORCEMENT state", jadi
-- HARUS staff-only (Superadmin/Admin, konsisten dengan role yang SUDAH
-- dipakai policy 0007 yang sama, bukan pola has_permission() baru supaya
-- tidak campur konvensi dalam satu tabel).
--
-- Konsekuensi lain yang dikunci gate yang sama: join-request (organization_
-- invitations) PENDING otomatis dibatalkan (CANCELLED) begitu organisasi
-- masuk CLOSING/SUSPENDED/CLOSED -- sebelumnya tidak bisa terjadi sama
-- sekali untuk 2 dari 3 state sumbernya karena state-nya sendiri tidak ada.

ALTER TABLE public.organizations DROP CONSTRAINT organizations_status_check;
ALTER TABLE public.organizations ADD CONSTRAINT organizations_status_check
  CHECK (status IN ('active', 'closing', 'closed', 'suspended'));

CREATE OR REPLACE FUNCTION public.enforce_organization_lifecycle_rules()
RETURNS TRIGGER AS $$
BEGIN
  -- SUSPENDED adalah enforcement state (Gate PRE-00-N §6) -- staff-only,
  -- leader/creator TIDAK boleh set/unset sendiri lewat organizations_manage.
  IF (NEW.status = 'suspended') IS DISTINCT FROM (OLD.status = 'suspended') THEN
    IF NOT (public.is_superadmin() OR public.current_role_code() = 'admin') THEN
      RAISE EXCEPTION 'organizations: transisi ke/dari suspended adalah enforcement staff-only (Gate PRE-00-N §6)';
    END IF;
  END IF;

  -- Invalidasi otomatis join-request pending saat organisasi masuk
  -- CLOSING/SUSPENDED/CLOSED (Gate PRE-00-N §6/§34.2).
  IF NEW.status IN ('closing', 'suspended', 'closed') AND OLD.status NOT IN ('closing', 'suspended', 'closed') THEN
    UPDATE public.organization_invitations
    SET status = 'cancelled'
    WHERE organization_id = NEW.id AND status = 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_organization_lifecycle_rules
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_organization_lifecycle_rules();

COMMENT ON CONSTRAINT organizations_status_check ON public.organizations IS
  'DIPERLUAS 0087: menambah nilai ''closing'' (langkah antara sebelum closed, self-service leader lewat organizations_manage yang sudah ada) dan ''suspended'' (enforcement state, staff-only, digerbangi trigger enforce_organization_lifecycle_rules()) -- Gate PRE-00-N §6, direvalidasi STEP-14 M12-CI-002.';
