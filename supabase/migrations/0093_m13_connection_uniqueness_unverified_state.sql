-- 0093_m13_connection_uniqueness_unverified_state.sql
-- Menutup temuan Tier 3 T3-3/T3-4 dari audit/CORE_VS_MIGRATED_BACKEND_AUDIT.md:
-- `docs/core/current/00-governance/STEP-00/PRE-00-O_M13_PROVIDER_CATALOGUE_
-- BYOK_AUTHORITY_GATE_FULL_v1.0.md` §9 mengunci SATU koneksi
-- aktif/hidup per provider per Agent/User (belum ada unique guard fisik);
-- §7-8 mengunci siklus `CREATE -> UNVERIFIED -> test -> VALID/ACTIVE`
-- dengan penggunaan AI DITOLAK selagi masih UNVERIFIED (skema lama
-- langsung default 'active' begitu dibuat, tidak ada state 'unverified'
-- sama sekali). Gate ini SENDIRI sudah menandai keduanya sebagai residual/
-- regression-risk CONTROLLED (§43/§47) sejak awal -- bukan penyimpangan
-- diam-diam seperti pola 0002/0083, karenanya Tier 3 (prioritas lebih
-- rendah), tapi tetap perlu ditutup sebelum UI BYOK dibangun di Bolt.new.

-- ── T3-4: state 'unverified' ──────────────────────────────────────────────
ALTER TABLE public.agent_ai_connections DROP CONSTRAINT agent_ai_connections_status_check;
ALTER TABLE public.agent_ai_connections ADD CONSTRAINT agent_ai_connections_status_check
  CHECK (status IN ('unverified', 'active', 'disconnected', 'invalid', 'disabled', 'revoked'));
ALTER TABLE public.agent_ai_connections ALTER COLUMN status SET DEFAULT 'unverified';

-- Status AWAL selalu 'unverified', TERLEPAS apa yang dikirim klien saat
-- INSERT (mencegah klien langsung mengklaim 'active' tanpa lewat /test) --
-- pola sama seperti trigger paksa-default lain di codebase ini (mis.
-- agent_verification_documents review_status).
CREATE OR REPLACE FUNCTION public.enforce_agent_ai_connection_initial_state()
RETURNS TRIGGER AS $$
BEGIN
  NEW.status := 'unverified';
  NEW.disabled_by_admin := false;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_agent_ai_connection_initial_state
  BEFORE INSERT ON public.agent_ai_connections
  FOR EACH ROW EXECUTE FUNCTION public.enforce_agent_ai_connection_initial_state();

COMMENT ON COLUMN public.agent_ai_connections.status IS
  'DILEBARKAN 0016 dari 3 nilai STEP10-D, DIPERLUAS LAGI 0093 dengan ''unverified'' (Gate PRE-00-O §7-8: CREATE -> UNVERIFIED -> test -> VALID/ACTIVE, AI ditolak selagi UNVERIFIED). Baris baru SELALU mulai ''unverified'' (trigger enforce_agent_ai_connection_initial_state), transisi ke ''active'' hanya lewat POST /ai-connections/{id}/test yang berhasil. "disabled" = jeda reversible, "revoked" = final, admin-only.';

-- ── T3-3: satu koneksi hidup per provider ─────────────────────────────────
-- "Hidup" = belum di-disconnect/revoke (status lain semuanya masih
-- merepresentasikan koneksi yang secara konseptual ADA/dipegang user,
-- termasuk 'disabled'/'invalid' yang reversible) -- user harus disconnect/
-- kena revoke dulu sebelum bisa membuat koneksi baru ke provider yang sama,
-- konsisten dengan makna "satu koneksi per provider" sebagai anti-duplikasi,
-- bukan hanya anti-duplikasi status='active' secara harfiah.
CREATE UNIQUE INDEX agent_ai_connections_one_live_per_provider
  ON public.agent_ai_connections (user_id, provider_id)
  WHERE status NOT IN ('disconnected', 'revoked');

COMMENT ON INDEX public.agent_ai_connections_one_live_per_provider IS
  'ADD-NEW/0093 — Gate PRE-00-O §9: satu koneksi hidup (unverified/active/invalid/disabled) per provider per user. Baris disconnected/revoked dikecualikan supaya user tetap bisa membuat koneksi baru ke provider yang sama setelah disconnect/revoke.';
