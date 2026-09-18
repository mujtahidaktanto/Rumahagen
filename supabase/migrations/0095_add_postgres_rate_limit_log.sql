-- 0095_add_postgres_rate_limit_log.sql
-- Menutup kontradiksi arsitektur ditemukan lewat deep scan lanjutan Core
-- (STEP-09 Architecture, .docx yang sebelumnya di luar scope):
-- `W4-02A.6.6_TECHNICAL_DECISIONS...` ADR-018 (LOCKED, "EXISTING APPROVED
-- ADRs — PRESERVED") mengunci "Rate limiting / application cache: Supabase
-- Postgres `rate_limit_log`" -- dan baris tepat di atasnya eksplisit:
-- "No new backend service, database engine, **cache vendor**, queue
-- worker, session vendor, AI platform or other core platform is
-- introduced by this synchronization."
--
-- Implementasi lama (`apps/web/lib/api/rate-limit.ts`) memakai in-memory
-- `Map` -- komentar migration-nya sendiri sudah mengakui ini "TIDAK
-- reliable di deployment serverless multi-instance" dan menyarankan
-- "ganti store dengan backend bersama (mis. **Upstash Redis**)" untuk
-- produksi -- solusi itu PERSIS jenis "cache vendor baru" yang dilarang
-- ADR-018. Tabel `rate_limit_log` ini menutup kontradiksinya sekaligus:
-- reliable lintas-instance (satu sumber kebenaran di Postgres) TANPA
-- vendor baru.

CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  key            TEXT PRIMARY KEY,
  request_count  INT NOT NULL DEFAULT 1,
  window_start   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.rate_limit_log IS
  'ADD-NEW/0095 — ADR-018 (Technical Decisions W4-02A.6.6, LOCKED): "Rate limiting / application cache = Supabase Postgres rate_limit_log". Satu baris per key (user_id atau IP), di-upsert atomik lewat check_and_increment_rate_limit() -- BUKAN log/histori per-request (ukuran tabel dibatasi jumlah key unik, bukan jumlah request).';

-- Tidak ada RLS policy sama sekali (RLS ENABLE tanpa policy = akses
-- langsung tertutup total untuk anon/authenticated) -- akses SATU-SATUNYA
-- lewat fungsi SECURITY DEFINER di bawah, dipanggil dari SEMUA request
-- (termasuk anonim) lewat lib/api/handler.ts, bukan dari klien manapun
-- secara langsung.
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Upsert atomik: window baru dimulai kalau window_start + window_ms sudah
-- lewat, kalau belum increment counter yang ada -- satu statement UPSERT
-- supaya aman dari race condition request bersamaan (row-level lock
-- Postgres saat UPDATE), tidak butuh transaksi eksplisit terpisah.
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_key TEXT,
  p_window_ms INT,
  p_max_requests INT
)
RETURNS TABLE (allowed BOOLEAN, request_count INT, window_start TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_row public.rate_limit_log;
BEGIN
  INSERT INTO public.rate_limit_log (key, request_count, window_start, updated_at)
  VALUES (p_key, 1, v_now, v_now)
  ON CONFLICT (key) DO UPDATE SET
    request_count = CASE
      WHEN public.rate_limit_log.window_start + (p_window_ms || ' milliseconds')::interval <= v_now
        THEN 1
      ELSE public.rate_limit_log.request_count + 1
    END,
    window_start = CASE
      WHEN public.rate_limit_log.window_start + (p_window_ms || ' milliseconds')::interval <= v_now
        THEN v_now
      ELSE public.rate_limit_log.window_start
    END,
    updated_at = v_now
  RETURNING * INTO v_row;

  RETURN QUERY SELECT (v_row.request_count <= p_max_requests), v_row.request_count, v_row.window_start;
END;
$$;

COMMENT ON FUNCTION public.check_and_increment_rate_limit IS
  'ADD-NEW/0095 — satu-satunya jalur baca/tulis rate_limit_log. Dipanggil dari lib/api/handler.ts untuk SETIAP request (termasuk anonim, key=IP). Upsert atomik: window baru dimulai otomatis kalau window_start sudah kedaluwarsa.';

-- EXECUTE eksplisit ke anon+authenticated -- rate limiting harus berlaku
-- untuk request TANPA sesi login sekalipun (key=IP), jadi tidak boleh
-- bergantung pada auth.uid() ada isinya.
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(TEXT, INT, INT) TO anon, authenticated;
