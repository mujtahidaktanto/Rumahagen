-- ============================================================================
-- Migration 0016: TECH-29 — Regional Reference Schema Correction
-- Purpose: align ref_villages.code with the authoritative Indonesia
-- administrative-code source validated during TECH-29 runtime preparation.
--
-- Evidence:
--   - 83,762 village rows loaded successfully in Development.
--   - 83,762 / 83,762 village codes are unique.
--   - 83,762 / 83,762 source village codes require 13 characters.
--   - City, district and village source-to-canonical reconciliation = 0 mismatch.
--   - postal_code remains optional VARCHAR(6).
--   - village_type is intentionally NOT part of the canonical model.
--
-- Historical migration 0004 is intentionally not edited. This corrective
-- migration preserves migration history while making the current schema
-- reproducible for fresh environments.
-- ============================================================================

ALTER TABLE public.ref_villages
  ALTER COLUMN code TYPE VARCHAR(13);
