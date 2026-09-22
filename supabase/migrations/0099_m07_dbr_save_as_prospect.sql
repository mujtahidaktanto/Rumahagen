-- 0099_m07_dbr_save_as_prospect.sql
-- Gap M07 (STEP11-B10 M07 endpoint family): "POST /calculator/dbr/{id}/
-- save-as-prospect" dikunci PRESERVE, tapi dbr_simulations SENGAJA tidak
-- punya RLS UPDATE sama sekali sejak 0052 ("hasil simulasi bersifat
-- historis/append-only", lihat komentar app/api/dbr-simulations/[id]/
-- route.ts). STEP10-D sendiri mengunci prospect_name/prospect_phone
-- sebagai kolom NULLABLE di DBR_SIMULATIONS (bukan tabel PROSPECT
-- terpisah) -- dibaca sebagai: "save as prospect" = melampirkan nama/
-- telepon prospek ke simulasi yang sudah ada (mis. simulasi awalnya
-- dijalankan anonim, lalu agent memutuskan menyimpannya sebagai prospek
-- bernama), BUKAN membuat entity baru.
--
-- Immutabilitas kalkulasi TETAP ditegakkan: UPDATE dibuka HANYA untuk
-- prospect_name/prospect_phone lewat trigger di bawah -- kolom finansial
-- (property_price, loan_amount, dbr_percent, dst.) tetap tidak bisa
-- diubah lewat jalur apa pun, konsisten dengan prinsip "historis/
-- append-only" yang sudah ada.
--
-- Tidak ada permission baru -- memakai ulang m07.dbr.domain_operations
-- yang sudah ada sejak 0008/0009 (Superadmin/Admin/Manager=ALL, Agent=OWN),
-- permission yang SAMA yang sudah menggerbangi SELECT/INSERT di 0089.

CREATE POLICY dbr_simulations_update_prospect ON public.dbr_simulations
  FOR UPDATE USING (public.has_permission('m07.dbr.domain_operations', agent_id))
  WITH CHECK (public.has_permission('m07.dbr.domain_operations', agent_id));

CREATE OR REPLACE FUNCTION public.enforce_dbr_simulation_prospect_only_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.agent_id IS DISTINCT FROM OLD.agent_id
     OR NEW.listing_id IS DISTINCT FROM OLD.listing_id
     OR NEW.bank_id IS DISTINCT FROM OLD.bank_id
     OR NEW.net_income IS DISTINCT FROM OLD.net_income
     OR NEW.existing_installments IS DISTINCT FROM OLD.existing_installments
     OR NEW.property_price IS DISTINCT FROM OLD.property_price
     OR NEW.down_payment IS DISTINCT FROM OLD.down_payment
     OR NEW.loan_amount IS DISTINCT FROM OLD.loan_amount
     OR NEW.tenor_months IS DISTINCT FROM OLD.tenor_months
     OR NEW.interest_rate_annual IS DISTINCT FROM OLD.interest_rate_annual
     OR NEW.monthly_installment IS DISTINCT FROM OLD.monthly_installment
     OR NEW.dbr_percent IS DISTINCT FROM OLD.dbr_percent
     OR NEW.eligibility_status IS DISTINCT FROM OLD.eligibility_status
     OR NEW.threshold_used IS DISTINCT FROM OLD.threshold_used
     OR NEW.pdf_export_url IS DISTINCT FROM OLD.pdf_export_url
     OR NEW.share_token IS DISTINCT FROM OLD.share_token
     OR NEW.shared_at IS DISTINCT FROM OLD.shared_at
     OR NEW.revoked_at IS DISTINCT FROM OLD.revoked_at
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'dbr_simulations: hanya prospect_name/prospect_phone yang boleh diubah lewat save-as-prospect -- hasil kalkulasi bersifat immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_dbr_simulation_prospect_only_update
  BEFORE UPDATE ON public.dbr_simulations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_dbr_simulation_prospect_only_update();
