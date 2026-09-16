-- 0010_api_idempotency_keys.sql
-- Menutup residual D13-16/D13-21 secara fisik (bukan cuma middleware in-memory
-- yang hilang saat restart/tidak konsisten lintas instance serverless).
-- Dipakai oleh lib/api/idempotency.ts di apps/web.

CREATE TABLE IF NOT EXISTS public.api_idempotency_keys (
  idempotency_key TEXT PRIMARY KEY,
  request_path    TEXT NOT NULL,
  request_hash    TEXT NOT NULL,
  response_status INT,
  response_body   JSONB,
  created_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

COMMENT ON TABLE public.api_idempotency_keys IS
  'Infra cross-cutting (Tahap 0 checklist, bukan tabel modul bisnis). Menyimpan hasil request pertama untuk key tertentu supaya retry dengan Idempotency-Key yang sama mengembalikan response identik, bukan mengulang efek samping (D13-16, D13-21).';

-- Bersihkan key lama otomatis lewat query aplikasi (created_at < now() - interval),
-- bukan cron di migration ini — dijadwalkan di lapisan aplikasi/edge function nanti.

ALTER TABLE public.api_idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Idempotency key murni infrastruktur request. Policy di bawah memblokir akses
-- lewat anon/authenticated role (client langsung via PostgREST/Supabase JS).
-- service_role (dipakai lib/supabase/admin.ts di route handler server-side)
-- BYPASS RLS secara default di Supabase — jadi tetap bisa baca/tulis normal.
CREATE POLICY api_idempotency_keys_no_direct_client_access ON public.api_idempotency_keys
  FOR ALL USING (false) WITH CHECK (false);
