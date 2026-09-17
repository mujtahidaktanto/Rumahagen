-- 0046_learning_point_adjustment_function.sql
-- Menutup GAP: permission `m04.learning_point.adjust` sudah di-seed sejak
-- 0023 khusus untuk "KOREKSI manual staf" (Superadmin/Admin/Manager=all,
-- TIDAK ADA Agent — Gate PRE-00-F §13 "No Agent self-adjustment"), TAPI
-- TIDAK PERNAH ada RLS policy INSERT untuk `learning_point_transactions`
-- sama sekali (hanya SELECT yang ada, diverifikasi lewat pg_policies) — jadi
-- permission itu tidak punya jalur fungsional apa pun sejak dibuat.
-- STEP11-B4 API-073 "POST /admin/learning-point-adjustments" meng-evidence
-- route ini seharusnya ada.
--
-- KEPUTUSAN: bukan menambah RLS INSERT langsung ke tabel (client harus tahu
-- account_id yang benar, harus auto-create account kalau belum ada, dan
-- trigger trg_apply_learning_point_transaction perlu berjalan) — pola yang
-- SAMA PERSIS dengan grant_learning_points_from_purchase() (0025): satu
-- fungsi SECURITY DEFINER yang menangani auto-create account + insert
-- transaksi + audit log sekaligus. BEDA dari fungsi itu: transaction_type
-- di sini 'adjustment' (bukan 'purchased'), dan p_amount BOLEH negatif
-- (koreksi bisa menambah atau mengurangi — CHECK balance_projection >= 0 di
-- learning_point_accounts tetap mencegah saldo negatif, ditegakkan DB, bukan
-- fungsi ini).

CREATE OR REPLACE FUNCTION public.adjust_learning_points(
  p_user_id  UUID,
  p_amount   NUMERIC(18,2),
  p_reason   TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS public.learning_point_transactions
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_txn        public.learning_point_transactions;
BEGIN
  IF NOT public.has_permission('m04.learning_point.adjust', NULL) THEN
    RAISE EXCEPTION 'adjust_learning_points: tidak punya permission m04.learning_point.adjust';
  END IF;

  IF p_amount = 0 THEN
    RAISE EXCEPTION 'adjust_learning_points: p_amount tidak boleh nol';
  END IF;

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
    v_account_id, p_user_id, 'adjustment', p_amount, 'admin_manual_adjustment', p_reason, p_idempotency_key
  )
  RETURNING * INTO v_txn;

  PERFORM public.log_audit_event(
    p_action      := 'm04.learning_point.adjust',
    p_entity_type := 'learning_point_transactions',
    p_entity_id   := v_txn.id,
    p_new_value   := jsonb_build_object('user_id', p_user_id, 'amount', p_amount, 'reason', p_reason)
  );

  RETURN v_txn;
END;
$$;

COMMENT ON FUNCTION public.adjust_learning_points IS
  'Realisasi fisik API-073 (STEP11-B4) — satu-satunya jalur INSERT ke learning_point_transactions dengan transaction_type=adjustment. Menutup gap: permission m04.learning_point.adjust ada di seed 0023 tapi tidak ada RLS INSERT untuknya sejak awal.';
