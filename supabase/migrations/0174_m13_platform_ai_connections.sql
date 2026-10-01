-- 0174_m13_platform_ai_connections.sql
-- Koneksi AI Internal RumahAgen (BYOK platform) -- sumber: docs "Spesifikasi Koneksi AI Internal
-- RumahAgen" (2026-10-01), DIADAPTASI dari rancangan aslinya (Supabase Edge Function + Vault) ke
-- pola yang SUDAH ADA dan terbukti di repo ini: route Next.js (apps/web/app/api/*) + enkripsi
-- AES-256-GCM application-layer, persis seperti agent_ai_connections.encrypted_api_key
-- (0016_m13_agent_ai_connections.sql, lib/crypto/byok.ts) -- bukan Vault, bukan Edge Function.
-- Keputusan ini disetujui pemilik produk 2026-10-01 setelah dicek: supabase/functions/ belum
-- pernah berisi satu Edge Function pun di repo ini, sedangkan pola enkripsi AES-256-GCM sudah
-- berjalan nyata untuk 2 koneksi BYOK Agent yang ada.
--
-- Tujuan: superadmin menempelkan SATU API key per provider untuk platform (bukan BYOK per-agen),
-- dipakai 2 fitur: "Bantu tulis deskripsi (AI)" (listing Agent & project Developer) dan
-- "Generate MetaSEO" (tombol terpisah, lihat docs/ai-description-rules.md).
--
-- SENGAJA terpisah dari migration aturan konten AI (docs/ai-description-rules.md, ALTER lanjutan
-- ke platform_ai_feature_settings/ai_usage_logs) -- migration itu baru dijalankan SETELAH migration
-- ini diterapkan dan diuji, sesuai instruksi eksplisit kedua dokumen sumber dan keputusan pemilik
-- produk ("aturan diatur setelah uji coba tombol generate berhasil").
--
-- CATATAN ADAPTASI LAIN (beda dari draf asli, dicatat di sini supaya tidak hilang jejak):
-- 1) Tidak ada fungsi SECURITY DEFINER khusus Vault (platform_ai_store_key/get_key/disconnect) --
--    dihapus seluruhnya. Baca/tulis encrypted_api_key cukup lewat RLS FOR ALL (bagian 6), dipanggil
--    route handler superadmin dengan client server-side BIASA (createClient(), sesi superadmin
--    asli) -- persis pola agent_ai_connections (0016) dan developer_partners (0033/0126).
-- 2) Tidak ada trigger "updated_at" generik (update_updated_at_column()) -- fungsi itu TIDAK ADA
--    di database ini (dicek: tidak satu pun migration pernah membuatnya; agent_ai_connections pun
--    tidak punya trigger updated_at). Kolom updated_at di tabel baru di bawah diisi EKSPLISIT oleh
--    kode route API pada setiap UPDATE, konsisten dengan konvensi yang sudah ada.
-- 3) Route API memakai pola REST per-aksi yang sudah dipakai di seluruh repo (mis.
--    /api/admin/platform-ai-connections/[providerCode]/...), bukan satu endpoint ber-field
--    "action" seperti draf Edge Function asli.

-- 1) ai_providers: kolom tambahan (gaya API, base URL, kelihatan untuk BYOK Agent dan/atau platform)
alter table public.ai_providers
  add column if not exists api_style text not null default 'none'
    check (api_style in ('openai_chat','openai_responses','anthropic_messages','none')),
  add column if not exists base_url varchar,
  add column if not exists key_prefix_hint varchar,
  add column if not exists available_for_agent boolean not null default true,
  add column if not exists available_for_platform boolean not null default false,
  add column if not exists sort_order smallint not null default 100;

comment on column public.ai_providers.available_for_agent is
  'Tampil di daftar provider BYOK Agent (m13.own_byok_connection.*)? Enam provider baru di migration ini (groq/cerebras/mistral/openrouter/anthropic/openai) diberi false -- khusus platform. PENTING: policy ai_providers_select_active_or_admin (0015) TIDAK diubah di sini (masih menampilkan semua provider status=active ke semua user login) -- UI/query daftar provider BYOK Agent WAJIB ditambah filter available_for_agent=true di lapisan aplikasi SEBELUM migration ini diterapkan ke database live, supaya 6 provider baru tidak sempat tampil di halaman BYOK Agent walau sesaat.';
comment on column public.ai_providers.available_for_platform is
  'Tampil di tab "Koneksi AI RumahAgen" (superadmin-only) pada halaman /admin/provider-ai? Default false -- Gemini (sudah ada sejak 0015) diaktifkan eksplisit di bawah, 6 provider baru diberi true.';

-- Gemini sudah ada (0015): aktifkan juga untuk platform, lengkapi kolom baru.
update public.ai_providers
   set api_style = 'openai_chat',
       base_url = 'https://generativelanguage.googleapis.com/v1beta/openai',
       key_prefix_hint = 'AIza',
       available_for_platform = true,
       sort_order = 10
 where code = 'gemini';

-- Provider baru: KHUSUS platform (available_for_agent=false) -- tidak boleh tampil di BYOK Agen.
insert into public.ai_providers
  (code, display_name, billing_type, setup_instructions_url, usage_terms_note,
   api_style, base_url, key_prefix_hint, available_for_agent, available_for_platform, sort_order)
values
  ('groq','Groq','free_tier_ongoing','https://console.groq.com/keys',
   'Kuota gratis harian, sangat cepat. Model open-weight.',
   'openai_chat','https://api.groq.com/openai/v1','gsk_',false,true,20),
  ('cerebras','Cerebras','free_tier_ongoing','https://cloud.cerebras.ai',
   'Kuota gratis harian; konteks tier gratis lebih kecil.',
   'openai_chat','https://api.cerebras.ai/v1','csk-',false,true,30),
  ('mistral','Mistral','free_tier_ongoing','https://console.mistral.ai',
   'Paket Experiment gratis: data dipakai untuk pelatihan, perlu verifikasi HP.',
   'openai_chat','https://api.mistral.ai/v1',null,false,true,40),
  ('openrouter','OpenRouter','free_tier_ongoing','https://openrouter.ai/settings/keys',
   'Satu key untuk banyak model. Model gratis dibatasi jumlah permintaan per hari.',
   'openai_chat','https://openrouter.ai/api/v1','sk-or-',false,true,50),
  ('anthropic','Anthropic Claude','paid_only','https://platform.claude.com',
   'Berbayar dengan kredit prabayar di Claude Console. Bukan langganan Claude Pro.',
   'anthropic_messages','https://api.anthropic.com/v1','sk-ant-',false,true,60),
  ('openai','OpenAI GPT','paid_only','https://platform.openai.com/api-keys',
   'Berbayar dengan kredit prabayar di OpenAI Platform. Bukan langganan ChatGPT Plus.',
   'openai_responses','https://api.openai.com/v1','sk-',false,true,70)
on conflict (code) do update set
  api_style = excluded.api_style,
  base_url = excluded.base_url,
  key_prefix_hint = excluded.key_prefix_hint,
  available_for_platform = true,
  sort_order = excluded.sort_order;

-- 2) Katalog model (nama model berubah tiap beberapa bulan -- disimpan di tabel, bukan di kode,
-- supaya superadmin bisa perbarui tanpa deploy; "source" menandai asal baris).
create table if not exists public.ai_models (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.ai_providers(id) on delete cascade,
  model_id varchar not null,
  display_name varchar not null,
  tier text not null default 'seimbang' check (tier in ('hemat','seimbang','kualitas')),
  is_default boolean not null default false,
  is_preview boolean not null default false,
  is_free_tier boolean not null default false,
  input_price_per_mtok_usd numeric(10,4),
  output_price_per_mtok_usd numeric(10,4),
  status text not null default 'active' check (status in ('active','inactive')),
  source text not null default 'seed' check (source in ('seed','remote','manual')),
  notes text,
  sort_order smallint not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_id, model_id)
);
create unique index if not exists ai_models_one_default_per_provider
  on public.ai_models (provider_id) where is_default;

comment on table public.ai_models is
  'Katalog model per provider platform -- ID model dicek ke dokumentasi resmi per 1 Okt 2026 (lihat docs/platform-ai-spec.md), WAJIB diverifikasi ulang saat implementasi lewat test_key/list_models provider sungguhan sebelum dipakai produksi (model bisa dipensiunkan kapan saja). updated_at diisi eksplisit oleh kode route API, tidak ada trigger generik (lihat catatan adaptasi di atas).';

insert into public.ai_models
  (provider_id, model_id, display_name, tier, is_default, is_preview, is_free_tier,
   input_price_per_mtok_usd, output_price_per_mtok_usd, sort_order)
select p.id, v.model_id, v.display_name, v.tier, v.is_default, v.is_preview, v.is_free_tier,
       v.in_price, v.out_price, v.sort_order
from (values
  ('gemini','gemini-3.8-flash','Gemini 3.8 Flash','seimbang',true,false,true,null::numeric,null::numeric,10),
  ('gemini','gemini-3.5-flash-lite','Gemini 3.5 Flash-Lite','hemat',false,false,true,null,null,20),
  ('gemini','gemini-3.1-pro-preview','Gemini 3.1 Pro (preview)','kualitas',false,true,false,null,null,30),
  ('groq','openai/gpt-oss-120b','GPT-OSS 120B','seimbang',true,false,true,0.15,0.60,10),
  ('groq','openai/gpt-oss-20b','GPT-OSS 20B','hemat',false,false,true,0.075,0.30,20),
  ('groq','qwen/qwen3.8-27b','Qwen 3.8 27B (preview)','seimbang',false,true,true,0.80,4.00,30),
  ('cerebras','gpt-oss-120b','GPT-OSS 120B','seimbang',true,false,true,null,null,10),
  ('cerebras','qwen-3.8-27b','Qwen 3.8 27B','seimbang',false,false,true,null,null,20),
  ('mistral','mistral-medium-latest','Mistral Medium (terbaru)','seimbang',true,false,true,null,null,10),
  ('mistral','mistral-small-latest','Mistral Small (terbaru)','hemat',false,false,true,null,null,20),
  ('mistral','mistral-large-latest','Mistral Large (terbaru)','kualitas',false,false,true,null,null,30),
  ('openrouter','openrouter/free','Model gratis (acak)','hemat',true,false,true,0,0,10),
  ('openrouter','openrouter/auto','Pilih otomatis (berbayar)','seimbang',false,false,false,null,null,20),
  ('anthropic','claude-haiku-4-5-20251001','Claude Haiku 4.5','hemat',true,false,false,null,null,10),
  ('anthropic','claude-sonnet-5-5','Claude Sonnet 5.5','kualitas',false,false,false,null,null,20),
  ('openai','gpt-6-luna','GPT-6 Luna','hemat',true,false,false,0.10,0.50,10),
  ('openai','gpt-6.1-sol','GPT-6.1 Sol','kualitas',false,false,false,2.00,10.00,20)
) as v(provider_code, model_id, display_name, tier, is_default, is_preview, is_free_tier,
       in_price, out_price, sort_order)
join public.ai_providers p on p.code = v.provider_code
on conflict (provider_id, model_id) do nothing;

-- 3) Koneksi platform -- DIADAPTASI dari rancangan asli: key disimpan terenkripsi di kolom ini
-- sendiri (AES-256-GCM, lib/crypto/byok.ts), BUKAN Supabase Vault (vault_secret_id dihapus dari
-- rancangan). Dekripsi terjadi di route handler Next.js (server-side) saat memanggil provider --
-- tidak pernah di lapisan SQL/RLS, persis komentar yang sama di agent_ai_connections (0016).
-- Nullable: "Putus koneksi" mengosongkan kolom ini dan menandai status='disabled', BUKAN menghapus
-- baris -- riwayat connected_by/updated_by/last_error tetap bisa ditelusuri.
create table if not exists public.platform_ai_connections (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null unique references public.ai_providers(id) on delete restrict,
  encrypted_api_key varchar(500),
  key_last4 varchar(4),
  status text not null default 'unverified'
    check (status in ('unverified','active','invalid','disabled')),
  last_validated_at timestamptz,
  last_error text,
  connected_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.platform_ai_connections is
  'Satu baris per provider platform yang terhubung. encrypted_api_key TIDAK PERNAH didekripsi di lapisan SQL/RLS -- hanya disimpan; dekripsi terjadi di application layer route handler (apps/web/app/api/admin/platform-ai-connections/*) saat memanggil provider, pola identik agent_ai_connections (0016). UI hanya menampilkan key_last4, tidak pernah key penuh.';
comment on column public.platform_ai_connections.last_error is
  'Pesan error provider TERPOTONG (maks 300 karakter) dan TANPA header/kredensial apa pun -- aturan ini ditegakkan di kode adapter (apps/web/lib/ai/), bukan di database.';

-- 4) Pengaturan per fitur: model utama, cadangan, batas, anggaran -- bisa diedit superadmin
-- langsung dari tab "Koneksi AI RumahAgen" tanpa deploy.
create table if not exists public.platform_ai_feature_settings (
  feature_code text primary key
    check (feature_code in ('listing_description','project_description')),
  display_name varchar not null,
  is_enabled boolean not null default false,
  primary_model_id uuid references public.ai_models(id) on delete set null,
  fallback_model_id uuid references public.ai_models(id) on delete set null,
  temperature numeric(3,2) not null default 0.6 check (temperature between 0 and 1.5),
  max_output_tokens integer not null default 1200 check (max_output_tokens between 200 and 4000),
  per_user_daily_limit integer not null default 20 check (per_user_daily_limit >= 0),
  global_daily_limit integer not null default 500 check (global_daily_limit >= 0),
  monthly_budget_usd numeric(10,2) not null default 10 check (monthly_budget_usd >= 0),
  prompt_version varchar not null default 'v1',
  updated_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.platform_ai_feature_settings (feature_code, display_name)
values ('listing_description','Deskripsi listing agen'),
       ('project_description','Deskripsi project developer')
on conflict (feature_code) do nothing;

-- Nilai default project developer (sumber: dokumen spesifikasi) -- kolom listing sudah sesuai
-- bawaan tabel, cukup project developer yang perlu disetel ulang.
update public.platform_ai_feature_settings
   set temperature = 0.5, max_output_tokens = 1500,
       per_user_daily_limit = 10, global_daily_limit = 200
 where feature_code = 'project_description';

-- 5) Log pemakaian: token, biaya, status setiap pemanggilan AI -- sumber kebenaran tunggal untuk
-- kuota/anggaran/laporan (dihitung ulang dari baris-baris ini saat tiap permintaan baru, bukan
-- counter terpisah yang bisa drift).
create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  feature_code text not null,
  source text not null default 'platform' check (source in ('platform','agent_byok')),
  user_id uuid references public.users(id) on delete set null,
  provider_code varchar not null,
  model_id varchar not null,
  entity_type text check (entity_type in ('listing','developer_project')),
  entity_id uuid,
  was_fallback boolean not null default false,
  status text not null check (status in ('success','error','blocked')),
  error_code text,
  input_tokens integer,
  output_tokens integer,
  est_cost_usd numeric(12,6),
  latency_ms integer,
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_logs_feature_time on public.ai_usage_logs (feature_code, created_at desc);
create index if not exists ai_usage_logs_user_time on public.ai_usage_logs (user_id, created_at desc);

comment on table public.ai_usage_logs is
  'Ditulis HANYA oleh route handler server lewat admin/service-role client (createAdminClient()) -- SENGAJA tidak ada policy INSERT untuk authenticated di bawah, supaya sesi pengguna biasa (agen/developer) tidak bisa memalsukan baris biaya/status/was_fallback miliknya sendiri untuk memanipulasi anggaran. Superadmin hanya bisa membaca (oversight), tidak pernah menulis manual.';

-- 6) RLS -- superadmin-only di seluruh tabel baru. DIADAPTASI dari rancangan asli: tidak ada
-- fungsi SECURITY DEFINER khusus Vault -- baca/tulis encrypted_api_key cukup lewat RLS FOR ALL di
-- bawah, dipanggil route handler superadmin dengan client server-side BIASA (createClient(), sesi
-- superadmin asli yang membawa auth.uid()), persis pola agent_ai_connections (0016).
alter table public.ai_models enable row level security;
alter table public.platform_ai_connections enable row level security;
alter table public.platform_ai_feature_settings enable row level security;
alter table public.ai_usage_logs enable row level security;

create policy ai_models_superadmin_all on public.ai_models
  for all using (public.is_superadmin()) with check (public.is_superadmin());

create policy platform_ai_connections_superadmin_all on public.platform_ai_connections
  for all using (public.is_superadmin()) with check (public.is_superadmin());

create policy platform_ai_feature_settings_superadmin_select on public.platform_ai_feature_settings
  for select using (public.is_superadmin());
create policy platform_ai_feature_settings_superadmin_update on public.platform_ai_feature_settings
  for update using (public.is_superadmin()) with check (public.is_superadmin());

create policy ai_usage_logs_superadmin_select on public.ai_usage_logs
  for select using (public.is_superadmin());
-- Tidak ada policy INSERT/UPDATE/DELETE untuk ai_usage_logs sama sekali (lihat comment tabel di
-- atas) -- route ai-generate-description menulis lewat createAdminClient(), bukan sesi pengguna.

-- 7) Untuk UI agen/developer: apakah tombol AI boleh tampil? SECURITY DEFINER supaya sesi
-- agen/developer biasa (yang tidak lolos RLS superadmin-only di atas) tetap bisa memanggil fungsi
-- ini -- hanya mengembalikan boolean, tidak pernah membocorkan isi koneksi/model/kunci.
create or replace function public.ai_feature_available(p_feature text)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.platform_ai_feature_settings s
      join public.ai_models m on m.id in (s.primary_model_id, s.fallback_model_id)
      join public.platform_ai_connections c
        on c.provider_id = m.provider_id and c.status = 'active'
     where s.feature_code = p_feature and s.is_enabled and m.status = 'active');
$$;
revoke all on function public.ai_feature_available(text) from public, anon;
grant execute on function public.ai_feature_available(text) to authenticated;
