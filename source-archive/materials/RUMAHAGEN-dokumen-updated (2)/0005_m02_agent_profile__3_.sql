-- ============================================================================
-- Migration 0005: Modul 2 — Profil Agen (agent_profiles, agent_reviews)
-- ENT: ENT-M02-AgentProfile, ENT-M02-AgentReview
-- Bergantung: 0003 (users)
-- ============================================================================

CREATE TABLE agent_profiles (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name              VARCHAR(150) NOT NULL,
  avatar_url             VARCHAR(500),
  bio                    TEXT,
  specialization         TEXT[],  -- residensial, komersial, tanah, sewa
  coverage_area          VARCHAR(255),
  office_name            VARCHAR(150),
  license_number         VARCHAR(50),
  whatsapp_number        VARCHAR(20) NOT NULL,
  contact_visibility     TEXT NOT NULL DEFAULT 'public' CHECK (contact_visibility IN ('public','hidden')),
  public_slug            VARCHAR(150) UNIQUE NOT NULL,
  total_listings_sold    INT NOT NULL DEFAULT 0,   -- denormalized counter, ERD v1.3 Bagian 4 poin 2
  total_listings_rented  INT NOT NULL DEFAULT 0,
  deleted_at             TIMESTAMPTZ,  -- soft-delete (ADR-046)
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_agent_profiles_updated_at BEFORE UPDATE ON agent_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE UNIQUE INDEX idx_agent_profiles_slug ON agent_profiles(public_slug) WHERE deleted_at IS NULL;

-- listing_leads direferensikan agent_reviews.listing_lead_id — FK ditambahkan via ALTER di migration 0008 (M03)
CREATE TABLE agent_reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  listing_lead_id  UUID,  -- FK ditambahkan setelah listing_leads ada (0008)
  reviewer_name    VARCHAR(150),
  rating           SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment          TEXT,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  moderated_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  moderated_at     TIMESTAMPTZ,
  deleted_at       TIMESTAMPTZ,  -- soft-delete (ADR-046)
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Index mendukung query publik (WHERE status='approved') & moderasi — ERD v1.3 Bagian 4 poin 14
CREATE INDEX idx_agent_reviews_agent_status ON agent_reviews(agent_id, status) WHERE deleted_at IS NULL;
-- Resolusi OD-23 (Issue Register T3-02, 2026-08-06): 1 reviewer (buyer_id) hanya boleh punya
-- 1 review aktif per agen (agent_id) — submit kedua ke agen yang sama WAJIB replace (upsert),
-- bukan baris baru. Constraint ini juga menegakkan batas yang sama untuk self-review Agen
-- (kasus buyer_id = agent_id = auth.uid() sendiri), karena keduanya sama-sama pasangan
-- (buyer_id, agent_id). Bukti interaksi/lead (listing_lead_id) TIDAK wajib — tetap NULLABLE,
-- tidak divalidasi di RLS (OD-23 Opsi B: tidak wajib).
CREATE UNIQUE INDEX idx_agent_reviews_one_per_reviewer_per_agent
  ON agent_reviews(buyer_id, agent_id) WHERE deleted_at IS NULL AND buyer_id IS NOT NULL;

-- RLS
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_reviews ENABLE ROW LEVEL SECURITY;

-- agent_profiles: publik boleh lihat (halaman profil publik), edit hanya pemilik/all-scope
CREATE POLICY agent_profiles_select_public ON agent_profiles FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);
CREATE POLICY agent_profiles_update_own ON agent_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR auth_has_scope_all('M02_profile','update'))
  WITH CHECK (user_id = auth.uid() OR auth_has_scope_all('M02_profile','update'));
CREATE POLICY agent_profiles_insert_own ON agent_profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- agent_reviews: publik hanya lihat status approved; buyer create (moderasi wajib, status awal
-- 'pending'); Agen create self-review (auto-approved, status awal 'approved' langsung, TIDAK
-- lewat moderasi — resolusi OD-23); moderasi (approve/reject review Buyer) tetap all-scope.
CREATE POLICY agent_reviews_select_public ON agent_reviews FOR SELECT TO anon, authenticated
  USING (status = 'approved' AND deleted_at IS NULL);
CREATE POLICY agent_reviews_select_own_moderation ON agent_reviews FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR auth_has_scope_all('M02_profile','approve'));

-- Diperbaiki [2026-08-06] — OD-23 (Issue Register T3-02): kondisional per tipe reviewer.
-- Buyer review agen lain: status insert WAJIB 'pending' (tetap lewat moderasi, tidak berubah
-- dari desain awal). Agen self-review (buyer_id = agent_id = auth.uid() sendiri, role 'agent'):
-- status insert WAJIB 'approved' langsung (auto-approved, TANPA moderasi — resolusi OD-23).
-- WITH CHECK mencegah kedua arah penyalahgunaan: Buyer tidak bisa smuggle status='approved'
-- saat insert (bypass moderasi), Agen non-self tidak bisa insert atas nama agen lain.
CREATE POLICY agent_reviews_insert_buyer ON agent_reviews FOR INSERT TO authenticated
  WITH CHECK (
    (buyer_id = auth.uid() AND auth_role_code() = 'buyer' AND agent_id != auth.uid() AND status = 'pending')
    OR (buyer_id = auth.uid() AND agent_id = auth.uid() AND auth_role_code() = 'agent' AND status = 'approved')
  );

-- Baru [2026-08-06] — OD-23: policy UPDATE untuk reviewer sendiri (bukan staff moderasi),
-- menegakkan perilaku "replace" (upsert via INSERT ... ON CONFLICT (buyer_id, agent_id) DO
-- UPDATE di service layer) — submit kedua ke agen yang sama mengganti review sebelumnya,
-- bukan baris baru. Aturan status sama seperti insert: review Buyer reset ke 'pending' (wajib
-- dimoderasi ulang karena konten berubah), self-review Agen tetap 'approved' otomatis.
CREATE POLICY agent_reviews_update_own ON agent_reviews FOR UPDATE TO authenticated
  USING (buyer_id = auth.uid())
  WITH CHECK (
    (buyer_id = auth.uid() AND auth_role_code() = 'buyer' AND agent_id != auth.uid() AND status = 'pending')
    OR (buyer_id = auth.uid() AND agent_id = auth.uid() AND auth_role_code() = 'agent' AND status = 'approved')
  );

CREATE POLICY agent_reviews_moderate ON agent_reviews FOR UPDATE TO authenticated
  USING (auth_has_scope_all('M02_profile','approve'))
  WITH CHECK (auth_has_scope_all('M02_profile','approve'));
