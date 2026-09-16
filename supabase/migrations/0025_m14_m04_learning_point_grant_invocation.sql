-- 0025_m14_m04_learning_point_grant_invocation.sql
-- Menutup D13-02: "M14→M04 purchased-LP handoff is semantically defined
-- through commercial fulfillment → M04 LP grant, but no exact internal
-- invocation contract is evidenced." Fungsi ini ADALAH kontrak invocation yang
-- dimaksud — target panggilan nyata untuk M14 commercial fulfillment.
--
-- KEPUTUSAN ENGINEERING PENTING (baca sebelum dipakai di M14 nanti):
-- Pipeline pembelian M14 penuh (commercial_orders/payment_transactions/
-- commercial_fulfillments) BELUM DIBANGUN — sengaja ditunda sejak Tahap 4
-- (lihat catatan di 0019), di luar scope Tahap 5. Karena pemanggil resmi dari
-- sisi M14 belum ada, fungsi ini untuk SEMENTARA digerbangi is_superadmin()
-- (bukan permission m04.learning_point.adjust — itu untuk KOREKSI manual staf,
-- BEDA secara semantik dari GRANT hasil pembelian sah, meski sama-sama
-- memodifikasi saldo). Begini alasannya: pengguna yang membeli Learning
-- Package tidak seharusnya butuh permission "adjust" apa pun — sistem yang
-- men-grant berdasarkan pembayaran terverifikasi, bukan aksi diskresioner
-- pengguna. TAPI karena belum ada pipeline fulfillment yang bisa memverifikasi
-- pembayaran itu, satu-satunya pemanggil sah HARI INI adalah Superadmin
-- (operasional manual/testing). KETIKA pipeline M14 fulfillment dibangun
-- (residual masa depan, belum di checklist), fungsi fulfillment M14 itu
-- SEBAIKNYA memanggil fungsi ini lewat jalur terpisah yang tervalidasi (mis.
-- mengecek baris commercial_fulfillments yang sah), BUKAN lewat is_superadmin()
-- — TODO eksplisit ini didokumentasikan di sini supaya tidak lupa saat residual
-- itu masuk giliran, bukan didiamkan sebagai "sudah selesai".
CREATE OR REPLACE FUNCTION public.grant_learning_points_from_purchase(
  p_user_id           UUID,
  p_amount            NUMERIC(18,2),
  p_source_reference  TEXT,
  p_idempotency_key   TEXT DEFAULT NULL
)
RETURNS public.learning_point_transactions
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_txn        public.learning_point_transactions;
BEGIN
  IF NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'grant_learning_points_from_purchase: untuk saat ini hanya Superadmin bisa memanggil (lihat catatan keputusan di komentar migration 0025 — pipeline fulfillment M14 otomatis belum ada)';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'grant_learning_points_from_purchase: p_amount harus > 0 (ini grant/kredit; pemakaian LP/debit memakai jalur transaksi lain, bukan fungsi ini)';
  END IF;

  -- Idempotency: replay dengan key yang sama mengembalikan hasil transaksi asli,
  -- tidak grant dobel (mis. kalau webhook M14 di-retry provider pembayaran).
  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_txn FROM public.learning_point_transactions WHERE idempotency_key = p_idempotency_key;
    IF v_txn.id IS NOT NULL THEN
      RETURN v_txn;
    END IF;
  END IF;

  SELECT id INTO v_account_id FROM public.learning_point_accounts WHERE user_id = p_user_id;
  IF v_account_id IS NULL THEN
    INSERT INTO public.learning_point_accounts (user_id) VALUES (p_user_id)
    RETURNING id INTO v_account_id;
  END IF;

  INSERT INTO public.learning_point_transactions (
    account_id, user_id, transaction_type, amount, source_type, source_reference, idempotency_key
  ) VALUES (
    v_account_id, p_user_id, 'purchased', p_amount, 'm14_commercial_fulfillment', p_source_reference, p_idempotency_key
  )
  RETURNING * INTO v_txn;
  -- trg_apply_learning_point_transaction (0023) otomatis update balance_projection.

  PERFORM public.log_audit_event(
    p_action      := 'm04.learning_point.grant_from_purchase',
    p_entity_type := 'learning_point_transactions',
    p_entity_id   := v_txn.id,
    p_new_value   := jsonb_build_object('user_id', p_user_id, 'amount', p_amount, 'source_reference', p_source_reference)
  );

  RETURN v_txn;
END;
$$;

COMMENT ON FUNCTION public.grant_learning_points_from_purchase IS
  'Realisasi fisik D13-02: kontrak invocation M14→M04 untuk purchased-LP handoff. Idempotent lewat p_idempotency_key. Lihat catatan keputusan di atas fungsi ini soal gerbang is_superadmin() sementara — TODO direvisi saat pipeline fulfillment M14 dibangun.';
