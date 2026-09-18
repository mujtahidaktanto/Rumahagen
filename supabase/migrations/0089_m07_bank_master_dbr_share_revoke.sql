-- 0089_m07_bank_master_dbr_share_revoke.sql
-- Menutup temuan Tier 2 T2-3 dari audit/CORE_VS_MIGRATED_BACKEND_AUDIT.md
-- (yang paling besar): `docs/core/current/00-governance/STEP-00/PRE-00-I_
-- M07_DOMAIN_ALIGNMENT_GATE_FULL_v1.1.md` §8-13/§20-28 dan sub-step khusus
-- `PRE-00-I-1` (RESOLVED — PASS/LOCKED) menyatakan model lama satu
-- threshold global (`dbr_config.dbr_threshold_percent`) EKSPLISIT
-- "obsolete/RECONCILE-SUPERSEDED", diganti model "Bank Master +
-- bank-specific configuration": Admin configure Bank Master -> User pilih
-- bank -> M07 resolve threshold bank itu -> simulasi -> snapshot historis
-- `threshold_used` -> hasil boleh di-Share (recipient view-only) -> Creator
-- boleh Revoke. `dbr_config`/`dbr_simulations` (0008/0052) masih persis
-- model lama tanpa satu pun dari ini — root cause SAMA seperti bug 0002/
-- 0083: STEP10-D melestarikan kolom fisik lama, tidak pernah disilangkan
-- ke keputusan semantik PRE-00-I yang lebih baru.
--
-- `dbr_config` (0008) TIDAK DIHAPUS/diubah — dipertahankan sebagai artefak
-- lama (tidak dipakai simulasi baru lagi setelah migration ini), pola sama
-- seperti nilai enum tak terpakai yang tetap dipertahankan di tempat lain
-- (mis. `listings.status`, 0018).

-- ── Bank Master ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.banks (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   VARCHAR(150) NOT NULL,
  dbr_threshold_percent  DECIMAL(5,2) NOT NULL DEFAULT 35.00,
  default_interest_rate  DECIMAL(5,2) NOT NULL DEFAULT 8.50,
  status                 TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  updated_by             UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.banks IS
  'ADD-NEW/0089 — Gate PRE-00-I §8: "Bank Master adalah sumber rekaman referensi/konfigurasi perbankan yang bisa dipilih; threshold DBR suatu bank terasosiasi dengan bank/konteks konfigurasi itu." Kardinalitas TIDAK dibatasi (§18: batas 4 hanya batas TAMPILAN UI, bukan batas data domain).';

-- View: Manager/Admin/Agent=allowed, Instructor/Developer Partner=NONE
-- (Gate §20). Configure: Admin locked sebagai authority, Superadmin bypass
-- (Gate §21) -- BUKAN Manager, beda dari m07.dbr.domain_operations lama
-- yang memberi Manager=ALL untuk operasi simulasi (0008/0009).
INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m07', 'm07.bank_master.view', 'all', 'Bank Master - View (ADD-NEW/0089; Gate PRE-00-I: Manager/Admin/Agent=allowed, Instructor/Developer Partner=NONE)'),
  ('m07', 'm07.bank_master.configure', 'all', 'Bank Master - Configure (ADD-NEW/0089; Gate PRE-00-I: Admin authority, Superadmin bypass -- BUKAN Manager)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, 'all', 'superadmin'
FROM (VALUES
  ('manager', 'm07.bank_master.view'),
  ('admin', 'm07.bank_master.view'),
  ('agent', 'm07.bank_master.view'),
  ('admin', 'm07.bank_master.configure')
) AS x(role_code, action_code)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;

CREATE POLICY banks_select ON public.banks
  FOR SELECT USING (public.has_permission('m07.bank_master.view'));

CREATE POLICY banks_manage ON public.banks
  FOR ALL USING (public.has_permission('m07.bank_master.configure'))
  WITH CHECK (public.has_permission('m07.bank_master.configure'));

-- ── dbr_simulations: bank_id + snapshot historis + Share/Revoke ──────────
-- Tabel kosong (dikonfirmasi 0 baris sebelum migration ini) -- aman
-- menambah kolom NOT NULL tanpa backfill.
ALTER TABLE public.dbr_simulations ADD COLUMN bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE RESTRICT;
ALTER TABLE public.dbr_simulations ADD COLUMN threshold_used DECIMAL(5,2);
ALTER TABLE public.dbr_simulations ADD COLUMN share_token UUID UNIQUE;
ALTER TABLE public.dbr_simulations ADD COLUMN shared_at TIMESTAMPTZ;
ALTER TABLE public.dbr_simulations ADD COLUMN revoked_at TIMESTAMPTZ;

COMMENT ON COLUMN public.dbr_simulations.bank_id IS
  'ADD-NEW/0089 — Gate PRE-00-I §13: bank yang DIPILIH user untuk simulasi ini, menentukan threshold mana yang berlaku. ON DELETE RESTRICT -- bank yang punya riwayat simulasi tidak boleh dihapus (pensiunkan lewat banks.status=inactive, bukan DELETE), supaya histori tetap bisa ditelusuri asalnya.';
COMMENT ON COLUMN public.dbr_simulations.threshold_used IS
  'ADD-NEW/0089 — snapshot historis threshold bank SAAT simulasi dibuat (Gate PRE-00-I §13: "current Bank Master threshold != historical threshold used by an old simulation"). Diisi OTOMATIS oleh trigger di bawah dari banks.dbr_threshold_percent, TIDAK PERNAH berubah lagi meski threshold bank itu diubah admin belakangan.';
COMMENT ON COLUMN public.dbr_simulations.share_token IS
  'ADD-NEW/0089 — Gate PRE-00-I §26-28: referensi share untuk akses recipient VIEW-ONLY. Diisi lewat share_dbr_simulation(), dikosongkan efeknya lewat revoked_at (bukan token dihapus, supaya riwayat share tetap ada). "Physical token/reference representation remains downstream" (§28) -- bentuk UUID dipilih sebagai representasi paling minimal, bukan dikunci evidence spesifik.';

-- Snapshot threshold OTOMATIS dari bank yang dipilih -- klien TIDAK BISA
-- mengirim nilai threshold_used sendiri (selalu ditimpa), dan bank harus
-- 'active' untuk dipakai simulasi BARU (bank inactive tetap valid untuk
-- simulasi LAMA yang sudah ada, Gate §13: histori tidak retroaktif berubah).
CREATE OR REPLACE FUNCTION public.enforce_dbr_simulation_bank_snapshot()
RETURNS TRIGGER AS $$
DECLARE
  v_bank public.banks;
BEGIN
  SELECT * INTO v_bank FROM public.banks WHERE id = NEW.bank_id;
  IF v_bank.id IS NULL THEN
    RAISE EXCEPTION 'dbr_simulations: bank_id tidak ditemukan';
  END IF;
  IF v_bank.status <> 'active' THEN
    RAISE EXCEPTION 'dbr_simulations: bank % tidak aktif, tidak bisa dipakai untuk simulasi baru (Gate PRE-00-I)', v_bank.name;
  END IF;
  NEW.threshold_used := v_bank.dbr_threshold_percent;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_dbr_simulation_bank_snapshot
  BEFORE INSERT ON public.dbr_simulations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_dbr_simulation_bank_snapshot();

-- Share/Revoke lewat fungsi SECURITY DEFINER, BUKAN RLS UPDATE biasa --
-- dbr_simulations tetap append-only untuk field inti (0052: "hasil
-- simulasi bersifat historis"), share/revoke adalah SATU-SATUNYA mutasi
-- yang diizinkan, jadi lewat jalur terpisah yang jelas cakupannya
-- (pola sama seperti refresh_listing()/grant_learning_points_from_
-- purchase() -- state-changing action = fungsi khusus, bukan UPDATE RLS
-- umum).
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
  IF v_row.agent_id IS DISTINCT FROM auth.uid() AND NOT public.is_superadmin() THEN
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
  IF v_row.agent_id IS DISTINCT FROM auth.uid() AND NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'revoke_dbr_simulation_share: hanya Creator yang boleh mencabut share (Gate PRE-00-I §28)';
  END IF;

  UPDATE public.dbr_simulations
  SET revoked_at = now()
  WHERE id = p_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- Akses recipient: VIEW-ONLY lewat token, TIDAK lewat RLS row-visibility
-- biasa (RLS tidak bisa menegakkan "hanya yang tahu token" -- itu hanya
-- valid kalau dicek programatik terhadap token yang dikirim, bukan
-- membuat baris terlihat untuk siapa pun yang authenticated). Fungsi ini
-- TIDAK mengecek auth.uid() sama sekali -- Gate §27: share "does not
-- create a new platform role", recipient tidak wajib py akun platform.
CREATE OR REPLACE FUNCTION public.get_shared_dbr_simulation(p_share_token UUID)
RETURNS public.dbr_simulations
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.dbr_simulations;
BEGIN
  SELECT * INTO v_row FROM public.dbr_simulations
  WHERE share_token = p_share_token AND shared_at IS NOT NULL AND revoked_at IS NULL;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'get_shared_dbr_simulation: referensi share tidak valid, sudah dicabut, atau tidak ditemukan';
  END IF;

  RETURN v_row;
END;
$$;

COMMENT ON FUNCTION public.share_dbr_simulation IS 'ADD-NEW/0089 — Gate PRE-00-I §26-27: Creator membagikan simulasi, menghasilkan share_token baru.';
COMMENT ON FUNCTION public.revoke_dbr_simulation_share IS 'ADD-NEW/0089 — Gate PRE-00-I §28: Creator mencabut akses share, "shared access invalid" seketika.';
COMMENT ON FUNCTION public.get_shared_dbr_simulation IS 'ADD-NEW/0089 — Gate PRE-00-I §26: akses recipient VIEW-ONLY lewat token, terpisah dari RLS pemilik (agent_id).';
