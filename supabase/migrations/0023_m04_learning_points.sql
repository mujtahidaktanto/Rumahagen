-- 0023_m04_learning_points.sql
-- Prasyarat fisik untuk D13-02 (0025 memakai tabel di sini sebagai target grant
-- LP) — juga realisasi permission m04.learning_session.* yang sudah menyinggung
-- LP secara semantik di Gate §11-13 (Learning Points Balance/Transaction).
-- BUKAN salah satu dari 2 permission code M04 yang sudah di-seed (LP belum
-- punya permission code sendiri di master matrix 50-baris — lihat catatan di
-- bawah), tapi tabelnya perlu ada lebih dulu supaya fungsi grant di 0025 ada
-- tempat berpijak.
--
-- Sumber kolom: STEP10-D, entity LEARNING_POINT_ACCOUNTS/LEARNING_POINT_TRANSACTIONS
-- (module M04) — PRESERVE_EXACT_PHYSICAL_CORROBORATION.
--
-- CATATAN PERMISSION: Gate PRE-00-F §11-13 mengunci role direction untuk LP
-- Balance/Transaction View/Adjust (Manager/Admin=ALL, Agent=OWN-view-only,
-- Instructor=NONE) TAPI baris ini TIDAK ada di STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv
-- 50-baris frozen (dicek eksplisit — tidak ketemu "Learning Point" atau
-- "LP Balance" di manapun dalam matrix). Mengikuti pola D13-15 (tidak mengarang
-- permission di luar katalog sumber TANPA didokumentasikan), 2 permission BARU
-- di-mint di sini — SATU-SATUNYA permission baru di migration ini, scope
-- persis meniru role direction Gate §11 & §13 (bukan dikarang bebas):
--   m04.learning_point.view   → Superadmin=ALL, Admin=ALL, Manager=ALL, Agent=OWN
--   m04.learning_point.adjust → Superadmin=ALL, Admin=ALL, Manager=ALL (tidak ada OWN — Gate §13: "No Agent self-adjustment is permitted")

INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m04', 'm04.learning_point.view', 'own', 'Learning Point Balance/Transaction - View (Gate PRE-00-F §11-12, permission baru — tidak ada di master matrix 50-baris)'),
  ('m04', 'm04.learning_point.adjust', 'own', 'Learning Point Transaction - Adjust (Gate PRE-00-F §13, permission baru, No Agent self-adjustment)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, x.scope, 'superadmin'
FROM (VALUES
  ('superadmin', 'm04.learning_point.view', 'all'),
  ('admin',      'm04.learning_point.view', 'all'),
  ('manager',    'm04.learning_point.view', 'all'),
  ('agent',      'm04.learning_point.view', 'own'),
  ('superadmin', 'm04.learning_point.adjust', 'all'),
  ('admin',      'm04.learning_point.adjust', 'all'),
  ('manager',    'm04.learning_point.adjust', 'all')
) AS x(role_code, action_code, scope)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.learning_point_accounts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  balance_projection  NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (balance_projection >= 0),
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','closed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.learning_point_accounts.balance_projection IS
  'Nama kolom "projection" (bukan "balance" polos) dari STEP10-D sendiri menyiratkan ini adalah PROYEKSI/CACHE dari SUM(learning_point_transactions.amount), bukan sumber kebenaran independen — dijaga sinkron lewat trigger di bawah setiap kali transaksi baru masuk, ledger (transactions) tetap sumber kebenaran.';

CREATE TABLE IF NOT EXISTS public.learning_point_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id        UUID NOT NULL REFERENCES public.learning_point_accounts(id) ON DELETE RESTRICT,
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  transaction_type  TEXT NOT NULL CHECK (transaction_type IN ('earned','purchased','redeemed','used','adjustment','reversal')),
  amount            NUMERIC(18,2) NOT NULL CHECK (amount <> 0),
  source_type       VARCHAR(100) NOT NULL,
  source_reference  TEXT,
  idempotency_key   VARCHAR(150) UNIQUE,
  occurred_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.learning_point_transactions IS
  'Sumber: STEP10-D entity LEARNING_POINT_TRANSACTIONS. Ledger append-only (lihat RLS — tidak ada UPDATE/DELETE). `amount` bertanda (positif=kredit, negatif=debit) — transaction_type menjelaskan ALASAN, bukan tanda; koreksi memakai baris baru transaction_type=''reversal'' dengan amount berlawanan, bukan UPDATE baris lama (jejak audit utuh). `idempotency_key` mencegah D13-02 grant LP dobel kalau webhook/retry M14 terjadi.';

-- ── Trigger: jaga balance_projection tetap sinkron dengan ledger ──
CREATE OR REPLACE FUNCTION public.apply_learning_point_transaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.learning_point_accounts
  SET balance_projection = balance_projection + NEW.amount,
      updated_at = now()
  WHERE id = NEW.account_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'learning_point_transactions: account_id % tidak ditemukan', NEW.account_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
-- TIDAK SECURITY DEFINER — UPDATE ke accounts di sini legitimate side-effect
-- dari INSERT transaksi yang sudah lolos RLS transaksi itu sendiri; trigger
-- berjalan sebagai bagian dari statement yang sama, tidak butuh privilege
-- ekstra. balance_projection TIDAK boleh negatif (CHECK constraint) — kalau
-- transaksi debit (amount negatif) akan membuat saldo negatif, INSERT gagal
-- di titik CHECK constraint accounts, bukan di trigger ini.

CREATE TRIGGER trg_apply_learning_point_transaction
  AFTER INSERT ON public.learning_point_transactions
  FOR EACH ROW EXECUTE FUNCTION public.apply_learning_point_transaction();

-- ── RLS ──

ALTER TABLE public.learning_point_accounts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY learning_point_accounts_select ON public.learning_point_accounts
  FOR SELECT USING (public.has_permission('m04.learning_point.view', user_id));

-- Tidak ada INSERT/UPDATE/DELETE policy untuk learning_point_accounts sama
-- sekali — baris account dibuat OTOMATIS oleh fungsi grant (0025), bukan lewat
-- client langsung (pola sama seperti operational_quota_pools/0019).

CREATE POLICY learning_point_transactions_select ON public.learning_point_transactions
  FOR SELECT USING (public.has_permission('m04.learning_point.view', user_id));

-- Tidak ada INSERT/UPDATE/DELETE policy langsung untuk transactions —
-- SATU-SATUNYA jalur resmi adalah fungsi grant_learning_points() (0025) yang
-- SECURITY DEFINER dan mengecek m04.learning_point.adjust sendiri, sama seperti
-- pola admin_force_provider_connection()/0016 dan configure_refresh_allowance()/0019.
