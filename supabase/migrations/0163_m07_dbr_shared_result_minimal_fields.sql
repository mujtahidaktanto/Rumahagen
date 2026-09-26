-- 0163_m07_dbr_shared_result_minimal_fields.sql
-- Menutup kebocoran data pada tautan berbagi simulasi DBR. get_shared_dbr_simulation() (0089) mengembalikan SELURUH baris dbr_simulations kepada siapa pun (termasuk anon) yang memegang share_token:
-- agent_id, listing_id, bank_id, share_token, prospect_phone, net_income, existing_installments, pdf_export_url, dst. Penerima tautan (prospek, atau siapa pun yang menerima teruskannya) hanya perlu melihat hasil.
-- Keluaran kini dibatasi (allowlist) ke: nama bank, nama prospek, harga, DP, plafon, tenor, bunga, cicilan bulanan, DBR, status kelayakan, ambang bank, dan tanggal simulasi.
-- TIDAK dikirim lagi: identitas agen, nomor telepon prospek, penghasilan, cicilan berjalan, id internal, dan token itu sendiri. Nama bank ikut dikembalikan (join di dalam fungsi SECURITY DEFINER), sehingga aplikasi
-- tidak perlu klien service-role hanya untuk membaca nama bank (banks tertutup untuk anon).
-- Perilaku lain tetap: token salah, belum dibagikan, atau dicabut = galat yang sama (tidak membedakan alasan); anon boleh mengeksekusi (akses prospek tanpa login, Gate PRE-00-I §26-28).
-- Tipe kembalian berubah (baris penuh -> tabel sempit) sehingga fungsi dibuat ulang (DROP + CREATE) dan hak eksekusi diberikan ulang. Pemanggil yang membaca kolom yang dihapus (mis. agent_id) akan menerima null/tidak ada:
-- satu-satunya pemanggil, GET /calculator/dbr/shared/{token} dan halaman /dbr/shared/{token}, hanya membutuhkan kolom di atas.

DROP FUNCTION IF EXISTS public.get_shared_dbr_simulation(uuid);

CREATE FUNCTION public.get_shared_dbr_simulation(p_share_token uuid)
RETURNS TABLE (
  bank_name             varchar,
  prospect_name         varchar,
  property_price        numeric,
  down_payment          numeric,
  loan_amount           numeric,
  tenor_months          smallint,
  interest_rate_annual  numeric,
  monthly_installment   numeric,
  dbr_percent           numeric,
  eligibility_status    text,
  threshold_used        numeric,
  created_at            timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT b.name, s.prospect_name, s.property_price, s.down_payment, s.loan_amount, s.tenor_months, s.interest_rate_annual,
           s.monthly_installment, s.dbr_percent, s.eligibility_status, s.threshold_used, s.created_at
    FROM public.dbr_simulations s
    LEFT JOIN public.banks b ON b.id = s.bank_id
    WHERE s.share_token = p_share_token AND s.shared_at IS NOT NULL AND s.revoked_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'get_shared_dbr_simulation: referensi share tidak valid, sudah dicabut, atau tidak ditemukan';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.get_shared_dbr_simulation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_dbr_simulation(uuid) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.get_shared_dbr_simulation(uuid) IS
  'ADD-NEW/0163 (menggantikan 0089): akses recipient VIEW-ONLY lewat token; hanya bidang hasil yang aman dilihat prospek (tanpa agent_id, telepon, penghasilan, cicilan berjalan, id internal, token).';
