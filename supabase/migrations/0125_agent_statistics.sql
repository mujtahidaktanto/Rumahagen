-- 0125_agent_statistics.sql
-- Backend "Statistik Saya" (analitik agen), wireframe M08-Statistik-Saya.
-- Empat bagian:
--   1. Permission BARU m08.dashboard_projection.export (ADD-NEW, Agent=OWN,
--      Superadmin=ALL) untuk export mandiri. Membaca statistik memakai
--      permission yang SUDAH ADA m08.dashboard_projection.read (Agent=OWN,
--      di-seed 0009) -- statistik adalah proyeksi dashboard, bukan modul
--      baru (D13-15: tidak mengarang permission yang tidak perlu).
--   2. Pengecekan pemimpin organisasi: is_org_leader() (0050) + status
--      organisasi, dijalankan DI DALAM fungsi (R-02), bukan di route.
--   3. Fungsi agregat SECURITY DEFINER: harian, ringkasan, perbandingan
--      anonim. Semua otorisasi di DB; hanya angka agregat milik pemanggil
--      (atau organisasi yang dia pimpin) yang dikembalikan.
--   4. Perbandingan anonim: hanya persentil pemanggil dan ukuran sampel,
--      tidak pernah nama atau angka agen lain; tidak tersedia bila sampel
--      kurang dari 30 agen (menjaga anonimitas).
--
-- PRIVASI: scope organisasi HANYA membuka metrik listing (dilihat, lead,
-- refresh) anggota. Data learning, poin, sertifikat, dan simulasi DBR
-- bersifat pribadi dan tidak pernah masuk scope organisasi.
--
-- Agent dengan Permission Preset aktif hanya memiliki izin yang tercantum
-- di preset (auth_scope, 0006): kalau preset tidak memuat
-- m08.dashboard_projection.read/export, fungsi ini menolak. Itu perilaku
-- yang disengaja, bukan bug.
--
-- KETERBATASAN DATA (sama seperti 0124): tidak ada riwayat status listing
-- (hanya jumlah saat ini), tidak ada waktu perubahan status lead, dan
-- listing_views/listing_leads tidak membedakan pengunjung selain ip+user
-- agent.

-- ── 1. Permission export mandiri ──
INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m08', 'm08.dashboard_projection.export', 'own', 'Dashboard Projection - Export (ADD-NEW, 0125: export Excel/PDF statistik milik sendiri atau organisasi yang dipimpin -- Agent=OWN, Superadmin=ALL; pemimpin organisasi tetap dicek is_org_leader() di DB)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, x.scope, 'superadmin'
FROM (VALUES
  ('superadmin', 'm08.dashboard_projection.export', 'all'),
  ('agent',      'm08.dashboard_projection.export', 'own')
) AS x(role_code, action_code, scope)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ── 2. Scope agen (internal) ──
-- NULL = milik sendiri. UUID organisasi = semua anggota aktif, hanya bila
-- pemanggil pemimpin aktif organisasi itu dan organisasi belum ditutup.
CREATE OR REPLACE FUNCTION public._agent_stats_scope(p_organization_id UUID)
RETURNS UUID[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
  v_deleted TIMESTAMPTZ;
  v_ids UUID[];
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_permission('m08.dashboard_projection.read', auth.uid()) THEN
    RAISE EXCEPTION 'statistik agen: butuh permission m08.dashboard_projection.read' USING ERRCODE = '42501';
  END IF;
  IF p_organization_id IS NULL THEN
    RETURN ARRAY[auth.uid()];
  END IF;
  IF NOT public.is_org_leader(p_organization_id) THEN
    RAISE EXCEPTION 'statistik organisasi: hanya pemimpin aktif organisasi' USING ERRCODE = '42501';
  END IF;
  SELECT o.status, o.deleted_at INTO v_status, v_deleted FROM public.organizations o WHERE o.id = p_organization_id;
  IF v_status IS NULL OR v_deleted IS NOT NULL OR v_status NOT IN ('active', 'closing') THEN
    RAISE EXCEPTION 'statistik organisasi: organisasi tidak aktif' USING ERRCODE = '42501';
  END IF;
  SELECT array_agg(om.agent_id) INTO v_ids
  FROM public.organization_members om
  WHERE om.organization_id = p_organization_id AND om.status = 'active';
  RETURN COALESCE(v_ids, ARRAY[]::UUID[]);
END;
$$;

REVOKE ALL ON FUNCTION public._agent_stats_scope(UUID) FROM PUBLIC, anon, authenticated;

-- ── 3a. Deret harian ──
CREATE OR REPLACE FUNCTION public.agent_statistics_daily(p_from DATE, p_to DATE, p_organization_id UUID DEFAULT NULL)
RETURNS TABLE (m_key TEXT, m_day DATE, m_value NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ids   UUID[];
  v_own   BOOLEAN := (p_organization_id IS NULL);
  v_start TIMESTAMPTZ;
  v_end   TIMESTAMPTZ;
BEGIN
  v_ids := public._agent_stats_scope(p_organization_id);
  IF p_from IS NULL OR p_to IS NULL OR p_to < p_from OR p_to - p_from > 365 THEN
    RAISE EXCEPTION 'agent_statistics_daily: rentang tanggal tidak valid (maksimal 366 hari)' USING ERRCODE = '22023';
  END IF;
  v_start := p_from::timestamp AT TIME ZONE 'Asia/Jakarta';
  v_end   := (p_to + 1)::timestamp AT TIME ZONE 'Asia/Jakarta';

  RETURN QUERY
  SELECT 'views'::text, (v.viewed_at AT TIME ZONE 'Asia/Jakarta')::date, count(*)::numeric
  FROM public.listing_views v JOIN public.listings l ON l.id = v.listing_id
  WHERE l.agent_id = ANY(v_ids) AND v.viewed_at >= v_start AND v.viewed_at < v_end GROUP BY 2
  UNION ALL
  SELECT 'leads', (ll.created_at AT TIME ZONE 'Asia/Jakarta')::date, count(*)::numeric
  FROM public.listing_leads ll
  WHERE ll.agent_id = ANY(v_ids) AND ll.created_at >= v_start AND ll.created_at < v_end GROUP BY 2
  UNION ALL
  SELECT 'refresh_used', (qu.usage_at AT TIME ZONE 'Asia/Jakarta')::date, sum(qu.consumed_quantity)
  FROM public.quota_usage qu JOIN public.operational_quota_pools p ON p.id = qu.operational_quota_pool_id
  WHERE p.user_id = ANY(v_ids) AND qu.consuming_resource_type = 'listing_refresh'
    AND qu.usage_at >= v_start AND qu.usage_at < v_end GROUP BY 2
  UNION ALL
  SELECT 'points_earned', (t.occurred_at AT TIME ZONE 'Asia/Jakarta')::date, sum(t.amount)
  FROM public.learning_point_transactions t
  WHERE v_own AND t.user_id = auth.uid() AND t.transaction_type IN ('earned', 'purchased') AND t.amount > 0
    AND t.occurred_at >= v_start AND t.occurred_at < v_end GROUP BY 2
  UNION ALL
  SELECT 'dbr_simulations', (d.created_at AT TIME ZONE 'Asia/Jakarta')::date, count(*)::numeric
  FROM public.dbr_simulations d
  WHERE v_own AND d.agent_id = auth.uid() AND d.created_at >= v_start AND d.created_at < v_end GROUP BY 2;
END;
$$;

-- ── 3b. Ringkasan (status saat ini + agregat rentang) ──
CREATE OR REPLACE FUNCTION public.agent_statistics_summary(p_from DATE, p_to DATE, p_organization_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ids     UUID[];
  v_own     BOOLEAN := (p_organization_id IS NULL);
  v_start   TIMESTAMPTZ;
  v_end     TIMESTAMPTZ;
  v_today   DATE := (now() AT TIME ZONE 'Asia/Jakarta')::date;
  v_result  JSONB;
  v_pool    UUID;
  v_allow   INTEGER;
  v_used    BIGINT;
BEGIN
  v_ids := public._agent_stats_scope(p_organization_id);
  IF p_from IS NULL OR p_to IS NULL OR p_to < p_from OR p_to - p_from > 365 THEN
    RAISE EXCEPTION 'agent_statistics_summary: rentang tanggal tidak valid (maksimal 366 hari)' USING ERRCODE = '22023';
  END IF;
  v_start := p_from::timestamp AT TIME ZONE 'Asia/Jakarta';
  v_end   := (p_to + 1)::timestamp AT TIME ZONE 'Asia/Jakarta';

  v_result := jsonb_build_object(
    'listing_status', COALESCE((SELECT jsonb_object_agg(status, n) FROM (
        SELECT l.status, count(*) AS n FROM public.listings l WHERE l.agent_id = ANY(v_ids) GROUP BY l.status) s), '{}'::jsonb),
    'lead_pipeline', COALESCE((SELECT jsonb_object_agg(status, n) FROM (
        SELECT ll.status, count(*) AS n FROM public.listing_leads ll
        WHERE ll.agent_id = ANY(v_ids) AND ll.created_at >= v_start AND ll.created_at < v_end GROUP BY ll.status) s), '{}'::jsonb),
    'active_listings', (SELECT count(*) FROM public.listings l WHERE l.agent_id = ANY(v_ids) AND l.status = 'published'),
    'stale_listings', (SELECT count(*) FROM public.listings l
        WHERE l.agent_id = ANY(v_ids) AND l.status = 'published'
          AND COALESCE(l.last_refreshed_at, l.published_at, l.created_at) < now() - INTERVAL '7 days'),
    'top_listings', COALESCE((SELECT jsonb_agg(jsonb_build_object('listing_id', x.id, 'title', x.title, 'status', x.status, 'views', x.views, 'leads', x.leads) ORDER BY x.views DESC, x.leads DESC)
      FROM (SELECT l.id, l.title, l.status,
                   (SELECT count(*) FROM public.listing_views v WHERE v.listing_id = l.id AND v.viewed_at >= v_start AND v.viewed_at < v_end) AS views,
                   (SELECT count(*) FROM public.listing_leads ll WHERE ll.listing_id = l.id AND ll.created_at >= v_start AND ll.created_at < v_end) AS leads
            FROM public.listings l WHERE l.agent_id = ANY(v_ids) AND l.status = 'published'
            ORDER BY views DESC, leads DESC LIMIT 5) x
      WHERE x.views > 0 OR x.leads > 0), '[]'::jsonb)
  );

  IF v_own THEN
    SELECT oqp.id, qc.daily_refresh_allowance INTO v_pool, v_allow
    FROM public.operational_quota_pools oqp JOIN public.quota_capacities qc ON qc.id = oqp.quota_capacity_id
    WHERE oqp.user_id = auth.uid() AND qc.capacity_type = 'listing_refresh' AND oqp.pool_status = 'active'
    ORDER BY oqp.created_at DESC LIMIT 1;
    SELECT count(*) INTO v_used FROM public.quota_usage qu
    WHERE qu.operational_quota_pool_id = v_pool AND (qu.usage_at AT TIME ZONE 'Asia/Jakarta')::date = v_today;
    v_result := v_result || jsonb_build_object(
      'quota', jsonb_build_object('has_pool', v_pool IS NOT NULL, 'allowance', COALESCE(v_allow, 0), 'used_today', CASE WHEN v_pool IS NULL THEN 0 ELSE v_used END),
      'entitlements', COALESCE((SELECT jsonb_agg(jsonb_build_object('type', e.entitlement_type, 'capacity', e.capacity_value, 'ends_at', e.ends_at))
                                FROM public.commercial_entitlements e WHERE e.user_id = auth.uid() AND e.lifecycle_status = 'active'), '[]'::jsonb),
      'learning', jsonb_build_object(
        'courses_in_progress', (SELECT count(*) FROM public.enrollments e WHERE e.agent_id = auth.uid() AND e.status = 'in_progress'),
        'avg_progress_percent', (SELECT round(avg(e.progress_percent)) FROM public.enrollments e WHERE e.agent_id = auth.uid() AND e.status = 'in_progress'),
        'points_balance', COALESCE((SELECT a.balance_projection FROM public.learning_point_accounts a WHERE a.user_id = auth.uid()), 0),
        'certificates_total', (SELECT count(*) FROM public.certificates c WHERE c.agent_id = auth.uid()),
        'awards_active', (SELECT count(*) FROM public.award_instances ai WHERE ai.user_id = auth.uid() AND ai.status = 'active')),
      'dbr', jsonb_build_object(
        'total', (SELECT count(*) FROM public.dbr_simulations d WHERE d.agent_id = auth.uid() AND d.created_at >= v_start AND d.created_at < v_end),
        'layak', (SELECT count(*) FROM public.dbr_simulations d WHERE d.agent_id = auth.uid() AND d.eligibility_status = 'layak' AND d.created_at >= v_start AND d.created_at < v_end),
        'perlu_review', (SELECT count(*) FROM public.dbr_simulations d WHERE d.agent_id = auth.uid() AND d.eligibility_status = 'perlu_review' AND d.created_at >= v_start AND d.created_at < v_end),
        'tidak_layak', (SELECT count(*) FROM public.dbr_simulations d WHERE d.agent_id = auth.uid() AND d.eligibility_status = 'tidak_layak' AND d.created_at >= v_start AND d.created_at < v_end),
        'saved_prospects', (SELECT count(*) FROM public.dbr_simulations d WHERE d.agent_id = auth.uid() AND d.prospect_name IS NOT NULL AND d.created_at >= v_start AND d.created_at < v_end),
        'shared', (SELECT count(*) FROM public.dbr_simulations d WHERE d.agent_id = auth.uid() AND d.shared_at IS NOT NULL AND d.shared_at >= v_start AND d.shared_at < v_end)));
  ELSE
    v_result := v_result || jsonb_build_object(
      'members', COALESCE((SELECT jsonb_agg(m ORDER BY (m->>'views')::int DESC) FROM (
        SELECT jsonb_build_object(
          'name', COALESCE(ap.full_name, 'Anggota'),
          'is_leader', (om.role = 'leader'),
          'is_self', (om.agent_id = auth.uid()),
          'active_listings', (SELECT count(*) FROM public.listings l WHERE l.agent_id = om.agent_id AND l.status = 'published'),
          'views', (SELECT count(*) FROM public.listing_views v JOIN public.listings l ON l.id = v.listing_id
                    WHERE l.agent_id = om.agent_id AND v.viewed_at >= v_start AND v.viewed_at < v_end),
          'leads', (SELECT count(*) FROM public.listing_leads ll WHERE ll.agent_id = om.agent_id AND ll.created_at >= v_start AND ll.created_at < v_end),
          'refresh', COALESCE((SELECT sum(qu.consumed_quantity) FROM public.quota_usage qu JOIN public.operational_quota_pools p ON p.id = qu.operational_quota_pool_id
                    WHERE p.user_id = om.agent_id AND qu.consuming_resource_type = 'listing_refresh' AND qu.usage_at >= v_start AND qu.usage_at < v_end), 0)) AS m
        FROM public.organization_members om LEFT JOIN public.agent_profiles ap ON ap.user_id = om.agent_id
        WHERE om.organization_id = p_organization_id AND om.status = 'active') mm), '[]'::jsonb));
  END IF;

  RETURN v_result;
END;
$$;

-- ── 4. Perbandingan anonim ──
CREATE OR REPLACE FUNCTION public.agent_statistics_benchmark(p_from DATE, p_to DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_min_sample CONSTANT INTEGER := 30;
  v_start TIMESTAMPTZ;
  v_end   TIMESTAMPTZ;
  r       RECORD;
BEGIN
  PERFORM public._agent_stats_scope(NULL);
  IF p_from IS NULL OR p_to IS NULL OR p_to < p_from OR p_to - p_from > 365 THEN
    RAISE EXCEPTION 'agent_statistics_benchmark: rentang tanggal tidak valid (maksimal 366 hari)' USING ERRCODE = '22023';
  END IF;
  v_start := p_from::timestamp AT TIME ZONE 'Asia/Jakarta';
  v_end   := (p_to + 1)::timestamp AT TIME ZONE 'Asia/Jakarta';

  WITH b AS (
    SELECT a.agent_id,
           COALESCE(v.n, 0)::numeric AS views,
           COALESCE(ld.n, 0)::numeric AS leads,
           CASE WHEN COALESCE(v.n, 0) > 0 THEN COALESCE(ld.n, 0)::numeric / v.n ELSE 0 END AS conv
    FROM (SELECT DISTINCT l.agent_id FROM public.listings l WHERE l.status = 'published') a
    LEFT JOIN (SELECT l.agent_id, count(*) AS n FROM public.listing_views vw JOIN public.listings l ON l.id = vw.listing_id
               WHERE vw.viewed_at >= v_start AND vw.viewed_at < v_end GROUP BY l.agent_id) v ON v.agent_id = a.agent_id
    LEFT JOIN (SELECT ll.agent_id, count(*) AS n FROM public.listing_leads ll
               WHERE ll.created_at >= v_start AND ll.created_at < v_end GROUP BY ll.agent_id) ld ON ld.agent_id = a.agent_id
  ),
  me AS (SELECT * FROM b WHERE agent_id = auth.uid())
  SELECT (SELECT count(*) FROM b) AS n,
         EXISTS (SELECT 1 FROM me) AS in_sample,
         (SELECT count(*) FROM b WHERE agent_id <> auth.uid() AND views < (SELECT views FROM me)) AS lower_views,
         (SELECT count(*) FROM b WHERE agent_id <> auth.uid() AND leads < (SELECT leads FROM me)) AS lower_leads,
         (SELECT count(*) FROM b WHERE agent_id <> auth.uid() AND conv < (SELECT conv FROM me)) AS lower_conv
  INTO r;

  IF NOT r.in_sample OR r.n < v_min_sample THEN
    RETURN jsonb_build_object('available', false, 'sample_size', r.n, 'min_sample', v_min_sample);
  END IF;
  RETURN jsonb_build_object('available', true, 'sample_size', r.n, 'min_sample', v_min_sample, 'metrics', jsonb_build_array(
    jsonb_build_object('key', 'views', 'percentile', round(100.0 * r.lower_views / (r.n - 1), 1)),
    jsonb_build_object('key', 'leads', 'percentile', round(100.0 * r.lower_leads / (r.n - 1), 1)),
    jsonb_build_object('key', 'conversion', 'percentile', round(100.0 * r.lower_conv / (r.n - 1), 1))));
END;
$$;

COMMENT ON FUNCTION public.agent_statistics_daily IS 'Deret harian statistik agen (WIB): milik sendiri, atau organisasi yang dipimpin (hanya metrik listing). Otorisasi di DB.';
COMMENT ON FUNCTION public.agent_statistics_summary IS 'Ringkasan statistik agen: status listing, pipeline lead, listing terbaik, kuota, learning, DBR (milik sendiri) atau tabel anggota (organisasi).';
COMMENT ON FUNCTION public.agent_statistics_benchmark IS 'Persentil anonim pemanggil terhadap agen aktif lain (minimal 30 agen). Tidak pernah mengembalikan identitas atau angka agen lain.';

REVOKE ALL ON FUNCTION public.agent_statistics_daily(DATE, DATE, UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.agent_statistics_summary(DATE, DATE, UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.agent_statistics_benchmark(DATE, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.agent_statistics_daily(DATE, DATE, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.agent_statistics_summary(DATE, DATE, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.agent_statistics_benchmark(DATE, DATE) TO authenticated, service_role;
