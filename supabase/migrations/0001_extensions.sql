-- 0001_extensions.sql
-- Sumber: kebutuhan umum Supabase Postgres (UUID generator dipakai di semua PK
-- pada STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv: gen_random_uuid()).
-- Menutup prasyarat sebelum migration lain (roles/permissions/dst) bisa jalan.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
