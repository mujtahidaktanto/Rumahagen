-- 0123_metrics_daily_snapshot.sql
-- Dashboard Analytics Admin (docs/analytics/METRIC_DEFINITIONS_v1.md v1.1).
-- Potret harian metrik STOK yang tidak bisa direkonstruksi dari data
-- operasional: sistem hanya menyimpan users.last_login_at (login terakhir,
-- bukan riwayat login), tidak menyimpan riwayat perubahan role, dan tidak
-- menyimpan tanggal penutupan organisasi/tanggal refund. Metrik ARUS
-- (agen baru, listing baru, lead, order, dst.) TIDAK disimpan di sini --
-- dashboard menghitungnya langsung dari created_at/paid_at tiap tabel.
--
-- ADD-NEW (di luar STEP10-D), didokumentasikan sebagai deviasi eksplisit
-- seperti m15.title_presentation.manage (0068). TIDAK membuat permission
-- baru (D13-15): SELECT memakai pola staf yang sudah dipakai policy lain
-- (Superadmin/Admin/Manager), TIDAK ada policy tulis untuk siapa pun.
--
-- Format panjang (satu baris per tanggal+metrik+dimensi), bukan kolom
-- lebar: metrik baru cukup ditambah baris, tanpa ALTER TABLE.
--
-- PENJADWALAN: fungsi capture_daily_metrics() HARUS dipanggil sekali per
-- hari tepat setelah tengah malam WIB. Migration ini SENGAJA tidak
-- mengaktifkan pg_cron (0019 menegaskan proyek menghindari scheduler di
-- DB) -- pemanggilnya adalah job terjadwal di luar DB dengan service_role
-- (mis. Vercel Cron -> route admin). Belum dibuat.
--
-- BATAS KEBENARAN: metrik berbasis login memakai last_login_at yang hanya
-- menyimpan login TERAKHIR, sehingga hanya benar bila dipanggil segera
-- setelah tengah malam. Fungsi menolak p_date di luar {kemarin, hari ini}
-- WIB supaya tidak ada backfill yang menghasilkan angka keliru.
-- Baris pertama menang (ON CONFLICT DO NOTHING) -- angka historis tidak
-- ditimpa diam-diam.

CREATE TABLE public.metrics_daily_snapshot (
  snapshot_date       DATE         NOT NULL,
  metric_key          TEXT         NOT NULL,
  dimension           TEXT         NOT NULL DEFAULT '',
  value               NUMERIC(20,2) NOT NULL,
  definition_version  TEXT         NOT NULL DEFAULT 'v1.1',
  captured_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  PRIMARY KEY (snapshot_date, metric_key, dimension)
);

COMMENT ON TABLE public.metrics_daily_snapshot IS
  'Potret harian metrik stok (METRIC_DEFINITIONS v1.1 butir 12). dimension = role / bulan kohort YYYY-MM / product_code, kosong bila tidak ada. Hanya diisi capture_daily_metrics(). Tanggal = tanggal WIB; posisi akhir hari tersebut.';

CREATE INDEX idx_metrics_daily_snapshot_metric_date
  ON public.metrics_daily_snapshot (metric_key, snapshot_date DESC);

ALTER TABLE public.metrics_daily_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY metrics_daily_snapshot_select ON public.metrics_daily_snapshot
  FOR SELECT USING (
    public.is_superadmin()
    OR public.current_role_code() IN ('admin', 'manager')
  );

CREATE OR REPLACE FUNCTION public.capture_daily_metrics(p_date DATE DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := (now() AT TIME ZONE 'Asia/Jakarta')::date;
  v_date  DATE := COALESCE(p_date, (now() AT TIME ZONE 'Asia/Jakarta')::date - 1);
  v_end   TIMESTAMPTZ;
  v_rows  INTEGER;
BEGIN
  IF v_date < v_today - 1 OR v_date > v_today THEN
    RAISE EXCEPTION 'capture_daily_metrics: p_date % di luar {kemarin, hari ini} WIB -- backfill ditolak karena metrik berbasis last_login_at hanya benar saat dipanggil segera setelah tengah malam', v_date;
  END IF;

  -- akhir hari v_date = 00:00 WIB hari berikutnya
  v_end := ((v_date + 1)::timestamp AT TIME ZONE 'Asia/Jakarta');

  WITH agents AS (
    SELECT u.id, u.status, u.created_at, u.last_login_at
    FROM public.users u
    JOIN public.roles r ON r.id = u.role_id
    WHERE r.code = 'agent' AND u.deleted_at IS NULL AND u.created_at < v_end
  ),
  last_act AS (
    SELECT a.id, a.status, a.created_at,
           GREATEST(
             a.last_login_at,
             (SELECT max(GREATEST(l.updated_at, l.last_refreshed_at, l.published_at, l.created_at))
                FROM public.listings l WHERE l.agent_id = a.id),
             (SELECT max(ll.created_at) FROM public.listing_leads ll WHERE ll.agent_id = a.id)
           ) AS last_activity
    FROM agents a
  ),
  paid_subs AS (
    SELECT s.product_code,
           o.amount / CASE
             WHEN s.starts_at IS NULL OR s.ends_at IS NULL THEN 1
             ELSE GREATEST(1, round(EXTRACT(EPOCH FROM (s.ends_at - s.starts_at)) / 86400.0 / 30.0))
           END AS monthly
    FROM public.subscriptions s
    JOIN LATERAL (
      SELECT co.amount
      FROM public.commercial_orders co
      WHERE co.subscription_id = s.id AND co.confirmed_at IS NOT NULL AND co.amount > 0
      ORDER BY co.confirmed_at DESC
      LIMIT 1
    ) o ON true
    WHERE s.status = 'active'
      AND (s.starts_at IS NULL OR s.starts_at < v_end)
      AND (s.ends_at IS NULL OR s.ends_at >= v_end)
  ),
  rows_out AS (
    SELECT 'users_by_role'::text AS metric_key, r.code::text AS dimension, count(u.id)::numeric AS value
    FROM public.roles r
    LEFT JOIN public.users u ON u.role_id = r.id AND u.deleted_at IS NULL AND u.created_at < v_end
    GROUP BY r.code
    UNION ALL
    SELECT 'agents_active_1d', '', count(*) FILTER (WHERE last_activity >= v_end - INTERVAL '1 day') FROM last_act
    UNION ALL
    SELECT 'agents_active_7d', '', count(*) FILTER (WHERE last_activity >= v_end - INTERVAL '7 days') FROM last_act
    UNION ALL
    SELECT 'agents_active_30d', '', count(*) FILTER (WHERE last_activity >= v_end - INTERVAL '30 days') FROM last_act
    UNION ALL
    SELECT 'agents_dormant_90d', '', count(*) FILTER (
      WHERE created_at < v_end - INTERVAL '90 days'
        AND (last_activity IS NULL OR last_activity < v_end - INTERVAL '90 days')) FROM last_act
    UNION ALL
    SELECT 'agents_newly_dormant', '', count(*) FILTER (
      WHERE last_activity >= v_end - INTERVAL '91 days' AND last_activity < v_end - INTERVAL '90 days') FROM last_act
    UNION ALL
    SELECT 'agents_suspended', '', count(*) FILTER (WHERE status = 'suspended') FROM last_act
    UNION ALL
    SELECT 'cohort_size', to_char(created_at AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM'), count(*)
    FROM last_act GROUP BY 2
    UNION ALL
    SELECT 'cohort_active_30d', to_char(created_at AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM'),
           count(*) FILTER (WHERE last_activity >= v_end - INTERVAL '30 days')
    FROM last_act GROUP BY 2
    UNION ALL
    SELECT 'organizations_active', '', count(*)
    FROM public.organizations WHERE status = 'active' AND deleted_at IS NULL AND created_at < v_end
    UNION ALL
    SELECT 'listings_published', '', count(*) FROM public.listings WHERE status = 'published' AND created_at < v_end
    UNION ALL
    SELECT 'listings_expired', '', count(*) FROM public.listings WHERE status = 'expired' AND created_at < v_end
    UNION ALL
    SELECT 'subscribers_paid_active', product_code::text, count(*) FROM paid_subs GROUP BY product_code
    UNION ALL
    SELECT 'mrr_idr', product_code::text, round(sum(monthly), 2) FROM paid_subs GROUP BY product_code
    UNION ALL
    SELECT 'reconciliation_cases_open', '', count(*)
    FROM public.reconciliation_cases WHERE status IN ('open', 'investigating', 'escalated')
    UNION ALL
    SELECT 'award_appeals_pending', '', count(*) FROM public.award_appeals WHERE status = 'pending'
  )
  INSERT INTO public.metrics_daily_snapshot (snapshot_date, metric_key, dimension, value)
  SELECT v_date, metric_key, dimension, value FROM rows_out
  ON CONFLICT (snapshot_date, metric_key, dimension) DO NOTHING;

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows;
END;
$$;

COMMENT ON FUNCTION public.capture_daily_metrics IS
  'Mengisi metrics_daily_snapshot untuk satu tanggal WIB (default kemarin). Idempoten: baris yang sudah ada tidak ditimpa. Hanya service_role. Mengembalikan jumlah baris baru.';

REVOKE ALL ON FUNCTION public.capture_daily_metrics(DATE) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.capture_daily_metrics(DATE) TO service_role;
