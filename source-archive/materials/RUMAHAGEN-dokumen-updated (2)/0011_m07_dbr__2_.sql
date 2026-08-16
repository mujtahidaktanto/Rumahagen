-- ============================================================================
-- Migration 0011: Modul 7 — Sistem Scoring DBR
-- ENT: ENT-M07-DbrSimulation/DbrConfig
-- ============================================================================

CREATE TABLE dbr_simulations (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id               UUID REFERENCES listings(id) ON DELETE SET NULL,
  prospect_name            VARCHAR(150),
  prospect_phone           VARCHAR(20),
  net_income               DECIMAL(18,2) NOT NULL,          -- data sensitif, enkripsi at-rest
  existing_installments    DECIMAL(18,2) NOT NULL DEFAULT 0, -- data sensitif
  property_price           DECIMAL(18,2) NOT NULL,
  down_payment             DECIMAL(18,2) NOT NULL,
  loan_amount              DECIMAL(18,2) NOT NULL,
  tenor_months              SMALLINT NOT NULL,               -- SELALU bulan, lihat API Spec §6
  interest_rate_annual     DECIMAL(5,2) NOT NULL,
  monthly_installment      DECIMAL(18,2) NOT NULL,
  dbr_percent              DECIMAL(5,2) NOT NULL,
  eligibility_status       TEXT NOT NULL CHECK (eligibility_status IN ('layak','perlu_review','tidak_layak')),
  pdf_export_url           VARCHAR(500),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Index riwayat prospek (ERD v1.3 Bagian 4 poin 4)
CREATE INDEX idx_dbr_simulations_agent ON dbr_simulations(agent_id, created_at);

CREATE TABLE dbr_config (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dbr_threshold_percent    DECIMAL(5,2) NOT NULL DEFAULT 35.00,
  default_interest_rate    DECIMAL(5,2) NOT NULL DEFAULT 8.50,
  updated_by               UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO dbr_config (dbr_threshold_percent, default_interest_rate) VALUES (35.00, 8.50);

-- RLS
ALTER TABLE dbr_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dbr_config ENABLE ROW LEVEL SECURITY;

-- Data finansial sensitif: HANYA pemilik & role dengan scope 'all' (Superadmin/Manager/Admin)
CREATE POLICY dbr_simulations_own ON dbr_simulations FOR ALL TO authenticated
  USING (agent_id = auth.uid() OR auth_has_scope_all('M07_dbr','view'))
  WITH CHECK (agent_id = auth.uid());

-- dbr_config: HANYA Superadmin (ERD v1.3, Authorization Spec §2.8 — none utk Manager/Admin)
CREATE POLICY dbr_config_select ON dbr_config FOR SELECT TO authenticated USING (true);
CREATE POLICY dbr_config_manage ON dbr_config FOR UPDATE TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());
