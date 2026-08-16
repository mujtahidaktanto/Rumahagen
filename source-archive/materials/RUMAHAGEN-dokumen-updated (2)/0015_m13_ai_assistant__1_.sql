-- ============================================================================
-- Migration 0015: Modul 13 — AI Assistant Integration (BYOK)
-- ENT: ENT-M13-AiProvider/AgentAiConnection
-- Dasar: ADR-028/ADR-045. Tidak ada tabel riwayat percakapan (REQ-M13-003).
-- ============================================================================

CREATE TABLE ai_providers (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                      VARCHAR(50) UNIQUE NOT NULL,
  display_name              VARCHAR(100) NOT NULL,
  logo_url                  VARCHAR(500),
  billing_type              TEXT NOT NULL DEFAULT 'free_tier_ongoing'
                               CHECK (billing_type IN ('free_tier_ongoing','paid_only','trial_then_paid')),
  setup_instructions_url    VARCHAR(500) NOT NULL,
  usage_terms_note          TEXT,
  requires_expiry_warning   BOOLEAN NOT NULL DEFAULT false,
  status                    TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive'))
);
INSERT INTO ai_providers (code, display_name, setup_instructions_url, requires_expiry_warning) VALUES
  ('gemini', 'Google Gemini', 'https://aistudio.google.com/apikey', false),
  ('groq', 'Groq', 'https://console.groq.com/keys', false),
  ('mistral', 'Mistral AI', 'https://console.mistral.ai/api-keys', false),
  ('github_models', 'GitHub Models', 'https://github.com/settings/tokens', true);

CREATE TABLE agent_ai_connections (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id           UUID NOT NULL REFERENCES ai_providers(id) ON DELETE RESTRICT,
  encrypted_api_key     VARCHAR(500) NOT NULL,  -- enkripsi at-rest wajib
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disconnected','invalid')),
  last_validated_at     TIMESTAMPTZ,
  connected_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_agent_ai_connections_updated_at BEFORE UPDATE ON agent_ai_connections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE UNIQUE INDEX idx_ai_connections_one_active_per_provider
  ON agent_ai_connections(user_id, provider_id) WHERE status = 'active';

-- RLS
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_ai_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_providers_select ON ai_providers FOR SELECT TO authenticated USING (true);
CREATE POLICY ai_providers_manage ON ai_providers FOR ALL TO authenticated
  USING (auth_is_superadmin()) WITH CHECK (auth_is_superadmin());

-- PENTING: own-only TANPA bypass Superadmin (REQ-M13-004, Authorization Spec §2.15 poin 5)
-- Sengaja TIDAK memakai auth_has_scope_all()/auth_is_superadmin() di sini.
CREATE POLICY ai_connections_strict_own ON agent_ai_connections FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
