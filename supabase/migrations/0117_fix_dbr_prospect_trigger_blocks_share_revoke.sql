-- 0117_fix_dbr_prospect_trigger_blocks_share_revoke.sql
-- Ditemukan saat membangun route HTTP untuk share_dbr_simulation()/
-- revoke_dbr_simulation_share() (0089, Gate PRE-00-I §26-28) -- fungsi itu
-- sudah ada dan sudah diuji lewat RPC langsung sejak 0089, TAPI belum
-- pernah dibungkus route HTTP sampai sekarang, jadi bug ini laten dan tidak
-- pernah tertangkap sebelumnya.
--
-- ROOT CAUSE: trg_dbr_simulation_prospect_only_update (0099, dibuat UNTUK
-- endpoint save-as-prospect) memasang BEFORE UPDATE trigger yang berlaku
-- untuk SEMUA UPDATE ke dbr_simulations, termasuk yang datang dari fungsi
-- LAIN. Trigger itu secara eksplisit memblokir perubahan pada
-- share_token/shared_at/revoked_at (baris 45-47 di 0099) -- padahal
-- KETIGA kolom itu justru satu-satunya kolom yang DIMAKSUDKAN berubah
-- lewat share_dbr_simulation()/revoke_dbr_simulation_share() (0089).
-- Dikonfirmasi nyata: memanggil share_dbr_simulation() sebagai pemilik
-- simulasi menghasilkan RAISE EXCEPTION dari trigger 0099 ("hanya
-- prospect_name/prospect_phone yang boleh diubah"), bukan share_token
-- yang terisi.
--
-- FIX: perluas daftar kolom yang boleh berubah di trigger yang SAMA --
-- prospect_name/prospect_phone (dari 0099) DITAMBAH share_token/shared_at/
-- revoked_at (dari 0089) -- kolom finansial/hasil kalkulasi (property_price,
-- loan_amount, dbr_percent, threshold_used, dst.) TETAP terkunci immutable,
-- tidak berubah dari niat awal 0099. CREATE OR REPLACE FUNCTION pada nama
-- yang sama (bukan trigger baru) -- pola konsisten proyek ini untuk
-- memperbaiki migration yang sudah applied (mis. 0101 atas 0100, 0106 atas
-- 0004).

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
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'dbr_simulations: hanya prospect_name/prospect_phone/share_token/shared_at/revoked_at yang boleh diubah -- hasil kalkulasi bersifat immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

COMMENT ON FUNCTION public.enforce_dbr_simulation_prospect_only_update IS
  'DIPERBAIKI 0117 -- daftar kolom mutable diperluas dari {prospect_name, prospect_phone} (0099) menjadi juga mencakup {share_token, shared_at, revoked_at} (0089) supaya share_dbr_simulation()/revoke_dbr_simulation_share() tidak lagi diblokir trigger ini. Kolom hasil kalkulasi/finansial tetap immutable, tidak berubah dari niat 0099.';
