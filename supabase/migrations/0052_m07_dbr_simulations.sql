-- 0052_m07_dbr_simulations.sql
-- Fase 1 (penutup batch, lanjutan 0047-0051): tabel M07 PRESERVE_EXACT_
-- PHYSICAL_CORROBORATION, kolom persis sesuai STEP10-D_ATTRIBUTE_TO_
-- PHYSICAL_COLUMN_RECONCILIATION.csv.
--
-- TIDAK ADA permission baru — memakai `m07.dbr.domain_operations` yang
-- sudah ada sejak 0009 (Superadmin/Admin/Manager=ALL, Agent=OWN), permission
-- yang sama dipakai `dbr_config` (0008). Simulasi DBR adalah operasi domain
-- DBR juga (menghitung kelayakan KPR calon pembeli), bukan resource baru
-- yang butuh permission terpisah dari konfigurasinya.

CREATE TABLE IF NOT EXISTS public.dbr_simulations (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id             UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  prospect_name          VARCHAR(150),
  prospect_phone         VARCHAR(20),
  net_income             DECIMAL(18,2) NOT NULL,
  existing_installments  DECIMAL(18,2) NOT NULL DEFAULT 0,
  property_price         DECIMAL(18,2) NOT NULL,
  down_payment           DECIMAL(18,2) NOT NULL,
  loan_amount            DECIMAL(18,2) NOT NULL,
  tenor_months           SMALLINT NOT NULL,
  interest_rate_annual   DECIMAL(5,2) NOT NULL,
  monthly_installment    DECIMAL(18,2) NOT NULL,
  dbr_percent            DECIMAL(5,2) NOT NULL,
  eligibility_status     TEXT NOT NULL CHECK (eligibility_status IN ('layak','perlu_review','tidak_layak')),
  pdf_export_url         VARCHAR(500),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.dbr_simulations IS
  'Sumber: STEP10-D entity DBR_SIMULATIONS. `agent_id` = Agent yang menjalankan simulasi (bukan calon pembeli — prospect_name/prospect_phone TEXT bebas karena calon pembeli tidak wajib punya akun platform). `monthly_installment`/`dbr_percent` hasil kalkulasi — dihitung di lapisan aplikasi/REST API saat INSERT (formula anuitas standar), bukan di database (tidak ada bukti formula eksak di dokumen sumber manapun untuk dikunci sebagai trigger/fungsi SQL).';

ALTER TABLE public.dbr_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY dbr_simulations_select ON public.dbr_simulations
  FOR SELECT USING (public.has_permission('m07.dbr.domain_operations', agent_id));

CREATE POLICY dbr_simulations_insert ON public.dbr_simulations
  FOR INSERT WITH CHECK (public.has_permission('m07.dbr.domain_operations', agent_id));

-- Tidak ada UPDATE/DELETE policy — hasil simulasi bersifat historis/append-only
-- (pola sama seperti listing_price_history/0047 dan quota_usage/0019), bukan
-- dokumen yang direvisi setelah dibuat. Perlu simulasi baru → INSERT baru.
