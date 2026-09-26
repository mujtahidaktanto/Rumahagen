-- 0162_m03_m12_org_leader_read_org_listings.sql (+ statistik organisasi tidak membuka listing pribadi anggota)
-- Pemimpin aktif organisasi boleh MELIHAT (baca saja) semua listing yang dibuat atas nama organisasinya, apa pun statusnya (draf, ditinjau, ditolak, dst.).
-- Yang TIDAK berubah dan sengaja dijaga:
--   * Listing PRIBADI (organization_id IS NULL) tidak pernah terbuka untuk pemimpin: hanya pemilik, staf, atau publik bila terbit (aturan lama).
--   * Hak ubah/hapus/terbit/refresh tetap milik pembuat (policy update/delete memakai has_permission(..., agent_id), tidak disentuh).
--   * Leads listing (listing_leads) tetap hanya untuk pemilik listing: data kontak calon pembeli tidak ikut dibuka.
-- Pemimpin yang berhenti menjadi pemimpin aktif (turun peran, keluar, organisasi dihapus) otomatis kehilangan akses karena is_org_leader() dievaluasi tiap kueri.
-- Tabel turunan (foto, video, fasilitas) mengikuti aturan yang sama dengan listings agar halaman detail lengkap bagi pemimpin.

DROP POLICY IF EXISTS listings_select_published_or_owner_or_staff ON public.listings;
CREATE POLICY listings_select_published_or_owner_or_staff ON public.listings
  FOR SELECT USING (
    status = 'published'
    OR agent_id = auth.uid()
    OR public.is_superadmin()
    OR public.current_role_code() IN ('admin','manager')
    OR (organization_id IS NOT NULL AND public.is_org_leader(organization_id))
  );

DROP POLICY IF EXISTS listing_photos_select ON public.listing_photos;
CREATE POLICY listing_photos_select ON public.listing_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_photos.listing_id
        AND (
          l.status = 'published'
          OR l.agent_id = auth.uid()
          OR public.is_superadmin()
          OR public.current_role_code() IN ('admin','manager')
          OR (l.organization_id IS NOT NULL AND public.is_org_leader(l.organization_id))
        )
    )
  );

DROP POLICY IF EXISTS listing_videos_select ON public.listing_videos;
CREATE POLICY listing_videos_select ON public.listing_videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_videos.listing_id
        AND (
          l.status = 'published'
          OR l.agent_id = auth.uid()
          OR public.is_superadmin()
          OR public.current_role_code() IN ('admin','manager')
          OR (l.organization_id IS NOT NULL AND public.is_org_leader(l.organization_id))
        )
    )
  );

DROP POLICY IF EXISTS listing_amenities_select ON public.listing_amenities;
CREATE POLICY listing_amenities_select ON public.listing_amenities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_amenities.listing_id
        AND (
          l.status = 'published'
          OR l.agent_id = auth.uid()
          OR public.is_superadmin()
          OR public.current_role_code() IN ('admin','manager')
          OR (l.organization_id IS NOT NULL AND public.is_org_leader(l.organization_id))
        )
    )
  );

-- ═══ Statistik organisasi tidak boleh membuka listing PRIBADI anggota ═══
-- agent_statistics_summary/daily (0125, ringkasan terakhir di 0159) pada cakupan organisasi menghitung SEMUA listing anggota (agent_id = ANY(anggota)), termasuk yang pribadi;
-- top_listings bahkan menampilkan JUDUL listing pribadi anggota kepada pemimpin. Perbaikan: pada cakupan organisasi hanya listing dengan organization_id organisasi itu yang dihitung.
-- Cakupan pribadi (p_organization_id NULL) TIDAK berubah. "refresh" (pemakaian jatah refresh per anggota) tetap agregat per anggota karena jatah refresh melekat pada orangnya, bukan pada listing.
CREATE OR REPLACE FUNCTION public.agent_statistics_daily(p_from date, p_to date, p_organization_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(m_key text, m_day date, m_value numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  WHERE l.agent_id = ANY(v_ids) AND (v_own OR l.organization_id = p_organization_id) AND v.viewed_at >= v_start AND v.viewed_at < v_end GROUP BY 2
  UNION ALL
  SELECT 'leads', (ll.created_at AT TIME ZONE 'Asia/Jakarta')::date, count(*)::numeric
  FROM public.listing_leads ll
  WHERE ll.agent_id = ANY(v_ids)
    AND (v_own OR EXISTS (SELECT 1 FROM public.listings lx WHERE lx.id = ll.listing_id AND lx.organization_id = p_organization_id))
    AND ll.created_at >= v_start AND ll.created_at < v_end GROUP BY 2
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
$function$;

CREATE OR REPLACE FUNCTION public.agent_statistics_summary(p_from date, p_to date, p_organization_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_ids     UUID[];
  v_own     BOOLEAN := (p_organization_id IS NULL);
  v_start   TIMESTAMPTZ;
  v_end     TIMESTAMPTZ;
  v_today   DATE := (now() AT TIME ZONE 'Asia/Jakarta')::date;
  v_result  JSONB;
  v_state   RECORD;
BEGIN
  v_ids := public._agent_stats_scope(p_organization_id);
  IF p_from IS NULL OR p_to IS NULL OR p_to < p_from OR p_to - p_from > 365 THEN
    RAISE EXCEPTION 'agent_statistics_summary: rentang tanggal tidak valid (maksimal 366 hari)' USING ERRCODE = '22023';
  END IF;
  v_start := p_from::timestamp AT TIME ZONE 'Asia/Jakarta';
  v_end   := (p_to + 1)::timestamp AT TIME ZONE 'Asia/Jakarta';

  v_result := jsonb_build_object(
    'listing_status', COALESCE((SELECT jsonb_object_agg(status, n) FROM (
        SELECT l.status, count(*) AS n FROM public.listings l
        WHERE l.agent_id = ANY(v_ids) AND (v_own OR l.organization_id = p_organization_id) GROUP BY l.status) s), '{}'::jsonb),
    'lead_pipeline', COALESCE((SELECT jsonb_object_agg(status, n) FROM (
        SELECT ll.status, count(*) AS n FROM public.listing_leads ll
        WHERE ll.agent_id = ANY(v_ids)
          AND (v_own OR EXISTS (SELECT 1 FROM public.listings lx WHERE lx.id = ll.listing_id AND lx.organization_id = p_organization_id))
          AND ll.created_at >= v_start AND ll.created_at < v_end GROUP BY ll.status) s), '{}'::jsonb),
    'active_listings', (SELECT count(*) FROM public.listings l
        WHERE l.agent_id = ANY(v_ids) AND (v_own OR l.organization_id = p_organization_id) AND l.status = 'published'),
    'stale_listings', (SELECT count(*) FROM public.listings l
        WHERE l.agent_id = ANY(v_ids) AND (v_own OR l.organization_id = p_organization_id) AND l.status = 'published'
          AND COALESCE(l.last_refreshed_at, l.published_at, l.created_at) < now() - INTERVAL '7 days'),
    'top_listings', COALESCE((SELECT jsonb_agg(jsonb_build_object('listing_id', x.id, 'title', x.title, 'status', x.status, 'views', x.views, 'leads', x.leads) ORDER BY x.views DESC, x.leads DESC)
      FROM (SELECT l.id, l.title, l.status,
                   (SELECT count(*) FROM public.listing_views v WHERE v.listing_id = l.id AND v.viewed_at >= v_start AND v.viewed_at < v_end) AS views,
                   (SELECT count(*) FROM public.listing_leads ll WHERE ll.listing_id = l.id AND ll.created_at >= v_start AND ll.created_at < v_end) AS leads
            FROM public.listings l
            WHERE l.agent_id = ANY(v_ids) AND (v_own OR l.organization_id = p_organization_id) AND l.status = 'published'
            ORDER BY views DESC, leads DESC LIMIT 5) x
      WHERE x.views > 0 OR x.leads > 0), '[]'::jsonb)
  );

  IF v_own THEN
    SELECT * INTO v_state FROM public.refresh_allowance_state(auth.uid());
    v_result := v_result || jsonb_build_object(
      'quota', jsonb_build_object('has_pool', (v_state.allowance > 0 OR v_state.stock_remaining > 0), 'allowance', v_state.allowance, 'used_today', v_state.used_today,
                                  'default_daily', v_state.default_daily, 'extra_daily', v_state.extra_daily, 'stock_remaining', v_state.stock_remaining),
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
          'active_listings', (SELECT count(*) FROM public.listings l WHERE l.agent_id = om.agent_id AND l.organization_id = p_organization_id AND l.status = 'published'),
          'views', (SELECT count(*) FROM public.listing_views v JOIN public.listings l ON l.id = v.listing_id
                    WHERE l.agent_id = om.agent_id AND l.organization_id = p_organization_id AND v.viewed_at >= v_start AND v.viewed_at < v_end),
          'leads', (SELECT count(*) FROM public.listing_leads ll JOIN public.listings l ON l.id = ll.listing_id
                    WHERE ll.agent_id = om.agent_id AND l.organization_id = p_organization_id AND ll.created_at >= v_start AND ll.created_at < v_end),
          'refresh', COALESCE((SELECT sum(qu.consumed_quantity) FROM public.quota_usage qu JOIN public.operational_quota_pools p ON p.id = qu.operational_quota_pool_id
                    WHERE p.user_id = om.agent_id AND qu.consuming_resource_type = 'listing_refresh' AND qu.usage_at >= v_start AND qu.usage_at < v_end), 0)) AS m
        FROM public.organization_members om LEFT JOIN public.agent_profiles ap ON ap.user_id = om.agent_id
        WHERE om.organization_id = p_organization_id AND om.status = 'active') mm), '[]'::jsonb));
  END IF;

  RETURN v_result;
END;
$function$;
