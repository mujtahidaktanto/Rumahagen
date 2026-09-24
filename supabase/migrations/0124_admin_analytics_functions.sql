-- 0124_admin_analytics_functions.sql
-- Dashboard Analytics Admin, sisi baca metrik ARUS (docs/analytics/
-- METRIC_DEFINITIONS_v1.md v1.1). Metrik STOK dibaca dari
-- metrics_daily_snapshot (0123). Dua fungsi SECURITY DEFINER karena agregat
-- lintas-pengguna tidak bisa dihitung lewat RLS: Manager hanya melihat baris
-- Agent/mitra di public.users (0121/0122), dan Admin/Manager tidak punya akses
-- baris ke payment_transactions/commercial_orders. Otorisasi di DB (R-02):
-- hanya Superadmin/Admin/Manager, dicek di dalam fungsi; route tidak
-- mengulang logika ini. Fungsi hanya mengembalikan angka agregat, bukan baris.
--
-- ADD-NEW (di luar STEP10-D), TANPA permission baru (D13-15).
--
-- KETERBATASAN DATA (dipertahankan apa adanya, bukan disamarkan):
--   - leads_unique: dedup per (listing, ip_address, user_agent) per hari.
--     Klik pemilik listing dan bot TIDAK bisa dikeluarkan (tidak ada
--     identitas pengunjung/penanda bot di listing_leads).
--   - projects_new: created_at proyek non-inactive. Tidak ada timestamp
--     publish/aktivasi di developer_projects.
--   - learning_completions: enrollments.completed_at + session_enrollments.
--     completed_at, TIDAK difilter hasil "qualifying".
--   - refunded_amount: hanya status refund/chargeback penuh. partial_refund
--     dan partial_chargeback dihitung sebagai transaksi sukses penuh karena
--     jumlah refund parsial tidak tersimpan.
--   - Tidak ada metrik listing ditolak per hari (tidak ada rejected_at).

CREATE OR REPLACE FUNCTION public.admin_analytics_flow(p_from DATE, p_to DATE)
RETURNS TABLE (m_key TEXT, m_day DATE, m_value NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end   TIMESTAMPTZ;
BEGIN
  IF NOT (public.is_superadmin() OR public.current_role_code() IN ('admin', 'manager')) THEN
    RAISE EXCEPTION 'admin_analytics_flow: hanya Superadmin/Admin/Manager' USING ERRCODE = '42501';
  END IF;
  IF p_from IS NULL OR p_to IS NULL OR p_to < p_from THEN
    RAISE EXCEPTION 'admin_analytics_flow: rentang tanggal tidak valid' USING ERRCODE = '22023';
  END IF;
  IF p_to - p_from > 365 THEN
    RAISE EXCEPTION 'admin_analytics_flow: rentang maksimal 366 hari' USING ERRCODE = '22023';
  END IF;

  v_start := p_from::timestamp AT TIME ZONE 'Asia/Jakarta';
  v_end   := (p_to + 1)::timestamp AT TIME ZONE 'Asia/Jakarta';

  RETURN QUERY
  WITH ok_pay AS (
    SELECT (pt.paid_at AT TIME ZONE 'Asia/Jakarta')::date AS d, pt.amount, pt.payment_state,
           co.subscription_id, co.addon_id, COALESCE(co.user_id, co.organization_id) AS buyer
    FROM public.payment_transactions pt
    JOIN public.commercial_orders co ON co.id = pt.commercial_order_id
    WHERE pt.paid_at >= v_start AND pt.paid_at < v_end
      AND pt.verification_state = 'verified'
      AND pt.payment_state IN ('settlement', 'capture', 'refund', 'partial_refund', 'chargeback', 'partial_chargeback')
  ),
  learn_regs AS (
    SELECT (e.enrolled_at AT TIME ZONE 'Asia/Jakarta')::date AS d, e.agent_id FROM public.enrollments e
    WHERE e.enrolled_at >= v_start AND e.enrolled_at < v_end
    UNION ALL
    SELECT (s.requested_at AT TIME ZONE 'Asia/Jakarta')::date, s.agent_id FROM public.session_enrollments s
    WHERE s.requested_at >= v_start AND s.requested_at < v_end
  ),
  learn_done AS (
    SELECT (e.completed_at AT TIME ZONE 'Asia/Jakarta')::date AS d FROM public.enrollments e
    WHERE e.status = 'completed' AND e.completed_at >= v_start AND e.completed_at < v_end
    UNION ALL
    SELECT (s.completed_at AT TIME ZONE 'Asia/Jakarta')::date FROM public.session_enrollments s
    WHERE s.status = 'completed' AND s.completed_at >= v_start AND s.completed_at < v_end
  )
  SELECT 'agents_new'::text, (u.created_at AT TIME ZONE 'Asia/Jakarta')::date, count(*)::numeric
  FROM public.users u JOIN public.roles r ON r.id = u.role_id
  WHERE r.code = 'agent' AND u.deleted_at IS NULL AND u.created_at >= v_start AND u.created_at < v_end
  GROUP BY 2
  UNION ALL
  SELECT 'listings_new', (l.published_at AT TIME ZONE 'Asia/Jakarta')::date, count(*)::numeric
  FROM public.listings l WHERE l.published_at >= v_start AND l.published_at < v_end GROUP BY 2
  UNION ALL
  SELECT 'listing_views', (v.viewed_at AT TIME ZONE 'Asia/Jakarta')::date, count(*)::numeric
  FROM public.listing_views v WHERE v.viewed_at >= v_start AND v.viewed_at < v_end GROUP BY 2
  UNION ALL
  SELECT 'leads_total', (ll.created_at AT TIME ZONE 'Asia/Jakarta')::date, count(*)::numeric
  FROM public.listing_leads ll WHERE ll.created_at >= v_start AND ll.created_at < v_end GROUP BY 2
  UNION ALL
  SELECT 'leads_unique', (ll.created_at AT TIME ZONE 'Asia/Jakarta')::date,
         count(DISTINCT (ll.listing_id, COALESCE(ll.ip_address, ''), COALESCE(ll.user_agent, '')))::numeric
  FROM public.listing_leads ll WHERE ll.created_at >= v_start AND ll.created_at < v_end GROUP BY 2
  UNION ALL
  SELECT 'refresh_count', (qu.usage_at AT TIME ZONE 'Asia/Jakarta')::date, sum(qu.consumed_quantity)
  FROM public.quota_usage qu
  WHERE qu.consuming_resource_type = 'listing_refresh' AND qu.usage_at >= v_start AND qu.usage_at < v_end GROUP BY 2
  UNION ALL
  SELECT 'projects_new', (dp.created_at AT TIME ZONE 'Asia/Jakarta')::date, count(*)::numeric
  FROM public.developer_projects dp
  WHERE dp.status <> 'inactive' AND dp.created_at >= v_start AND dp.created_at < v_end GROUP BY 2
  UNION ALL
  SELECT 'claims_approved', (c.reviewed_at AT TIME ZONE 'Asia/Jakarta')::date, count(*)::numeric
  FROM public.agent_project_claims c
  WHERE c.status = 'approved' AND c.reviewed_at >= v_start AND c.reviewed_at < v_end GROUP BY 2
  UNION ALL
  SELECT 'orgs_new', (o.created_at AT TIME ZONE 'Asia/Jakarta')::date, count(*)::numeric
  FROM public.organizations o WHERE o.deleted_at IS NULL AND o.created_at >= v_start AND o.created_at < v_end GROUP BY 2
  UNION ALL
  SELECT 'learning_registrations', d, count(*)::numeric FROM learn_regs GROUP BY d
  UNION ALL
  SELECT 'learning_registrants_unique', d, count(DISTINCT agent_id)::numeric FROM learn_regs GROUP BY d
  UNION ALL
  SELECT 'learning_completions', d, count(*)::numeric FROM learn_done GROUP BY d
  UNION ALL
  SELECT 'certificates_issued', (ce.issued_at AT TIME ZONE 'Asia/Jakarta')::date, count(*)::numeric
  FROM public.certificates ce WHERE ce.issued_at >= v_start AND ce.issued_at < v_end GROUP BY 2
  UNION ALL
  SELECT 'points_issued', (t.occurred_at AT TIME ZONE 'Asia/Jakarta')::date, sum(t.amount)
  FROM public.learning_point_transactions t
  WHERE t.transaction_type IN ('earned', 'purchased') AND t.amount > 0
    AND t.occurred_at >= v_start AND t.occurred_at < v_end GROUP BY 2
  UNION ALL
  SELECT 'gmv_gross', d, sum(amount) FROM ok_pay GROUP BY d
  UNION ALL
  SELECT 'refunded_amount', d, sum(amount) FROM ok_pay WHERE payment_state IN ('refund', 'chargeback') GROUP BY d
  UNION ALL
  SELECT 'revenue_subscription', d, sum(amount) FROM ok_pay
  WHERE subscription_id IS NOT NULL AND payment_state NOT IN ('refund', 'chargeback') GROUP BY d
  UNION ALL
  SELECT 'revenue_addon', d, sum(amount) FROM ok_pay
  WHERE addon_id IS NOT NULL AND payment_state NOT IN ('refund', 'chargeback') GROUP BY d
  UNION ALL
  SELECT 'addon_buyers', d, count(DISTINCT buyer)::numeric FROM ok_pay
  WHERE addon_id IS NOT NULL AND payment_state IN ('settlement', 'capture') AND buyer IS NOT NULL GROUP BY d
  UNION ALL
  SELECT 'appeals_new', (a.created_at AT TIME ZONE 'Asia/Jakarta')::date, count(*)::numeric
  FROM public.award_appeals a WHERE a.created_at >= v_start AND a.created_at < v_end GROUP BY 2;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_analytics_funnel(p_cohort_from DATE, p_cohort_to DATE)
RETURNS TABLE (registered BIGINT, verified BIGINT, first_listing BIGINT, first_lead BIGINT, first_payment BIGINT, median_days_to_first_lead NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end   TIMESTAMPTZ;
BEGIN
  IF NOT (public.is_superadmin() OR public.current_role_code() IN ('admin', 'manager')) THEN
    RAISE EXCEPTION 'admin_analytics_funnel: hanya Superadmin/Admin/Manager' USING ERRCODE = '42501';
  END IF;
  IF p_cohort_from IS NULL OR p_cohort_to IS NULL OR p_cohort_to < p_cohort_from OR p_cohort_to - p_cohort_from > 366 THEN
    RAISE EXCEPTION 'admin_analytics_funnel: rentang kohort tidak valid' USING ERRCODE = '22023';
  END IF;

  v_start := p_cohort_from::timestamp AT TIME ZONE 'Asia/Jakarta';
  v_end   := (p_cohort_to + 1)::timestamp AT TIME ZONE 'Asia/Jakarta';

  RETURN QUERY
  WITH cohort AS (
    SELECT u.id, u.created_at, u.email_verified_at
    FROM public.users u JOIN public.roles r ON r.id = u.role_id
    WHERE r.code = 'agent' AND u.deleted_at IS NULL AND u.created_at >= v_start AND u.created_at < v_end
  ),
  steps AS (
    SELECT c.id, c.created_at,
           (c.email_verified_at IS NOT NULL AND c.email_verified_at <= c.created_at + INTERVAL '30 days') AS did_verify,
           (SELECT min(l.published_at) FROM public.listings l
             WHERE l.agent_id = c.id AND l.published_at IS NOT NULL
               AND l.published_at <= c.created_at + INTERVAL '30 days') AS t_listing,
           (SELECT min(ll.created_at) FROM public.listing_leads ll
             WHERE ll.agent_id = c.id AND ll.created_at <= c.created_at + INTERVAL '30 days') AS t_lead,
           (SELECT min(pt.paid_at) FROM public.payment_transactions pt
             JOIN public.commercial_orders co ON co.id = pt.commercial_order_id
             WHERE co.user_id = c.id AND pt.verification_state = 'verified'
               AND pt.payment_state IN ('settlement', 'capture')
               AND pt.paid_at <= c.created_at + INTERVAL '30 days') AS t_pay
    FROM cohort c
  )
  SELECT count(*)::bigint,
         count(*) FILTER (WHERE did_verify)::bigint,
         count(*) FILTER (WHERE t_listing IS NOT NULL)::bigint,
         count(*) FILTER (WHERE t_lead IS NOT NULL)::bigint,
         count(*) FILTER (WHERE t_pay IS NOT NULL)::bigint,
         (percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (t_lead - t_listing)) / 86400.0)
            FILTER (WHERE t_listing IS NOT NULL AND t_lead IS NOT NULL AND t_lead >= t_listing))::numeric
  FROM steps;
END;
$$;

COMMENT ON FUNCTION public.admin_analytics_flow IS
  'Metrik arus harian (WIB) untuk Dashboard Analytics. Hanya Superadmin/Admin/Manager, hanya angka agregat. Lihat keterbatasan data di header 0124.';
COMMENT ON FUNCTION public.admin_analytics_funnel IS
  'Funnel aktivasi satu kohort daftar (jendela 30 hari sejak tanggal daftar; tiap tahap dihitung mandiri, bukan berurutan). Hanya Superadmin/Admin/Manager.';

REVOKE ALL ON FUNCTION public.admin_analytics_flow(DATE, DATE) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_analytics_funnel(DATE, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_analytics_flow(DATE, DATE) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_analytics_funnel(DATE, DATE) TO authenticated, service_role;
