-- 0175_m13_ai_description_rules.sql
-- Aturan konten AI Deskripsi RumahAgen -- sumber: docs "Aturan AI Deskripsi RumahAgen" (2026-10-01),
-- dokumen TERPISAH dari "Spesifikasi Koneksi AI Internal RumahAgen" (migration 0174) yang hanya
-- mengatur isi/perilaku AI deskripsi (riset kawasan, penyaring pesaing/injection, penutup wajib,
-- MetaSEO) -- bukan koneksi/provider/API key. DIJALANKAN SETELAH 0174 diuji sukses (superadmin sudah
-- berhasil menghubungkan Gemini dan auto-assign ke kedua fitur, 2026-10-01), sesuai instruksi
-- eksplisit kedua dokumen sumber dan keputusan pemilik produk ("aturan diatur setelah uji coba
-- tombol generate berhasil").
--
-- CATATAN ADAPTASI (dicocokkan ke kode nyata sebelum ditulis, bukan disalin mentah dari dokumen):
-- 1) Nama constraint `platform_ai_feature_settings_feature_code_check` DICEK LANGSUNG ke DB live
--    (pg_constraint) -- cocok persis dengan draf dokumen, tidak perlu diubah.
-- 2) Trigger "updated_at" generik (`public.update_updated_at_column()`) TIDAK ADA -- dicek ulang:
--    fungsi bernama sama memang ada di database, tapi di skema storage (storage.update_updated_at_column,
--    bawaan Supabase untuk storage.objects), BUKAN public. Konsisten dengan adaptasi 0174: tidak ada
--    trigger untuk area_insights.updated_at di sini -- diisi eksplisit oleh kode route API saat
--    panel "Info Kawasan" (menyusul, belum dibangun) melakukan Setujui/Edit/Tolak/Riset ulang.
-- 3) Referensi "supabase/functions/_shared/ai/prompts/" di dokumen asli HANYA relevan sebagai nilai
--    teks `prompt_version` (string bebas, bukan path yang divalidasi DB) -- berkas prompt sungguhan
--    nanti ditulis di apps/web/lib/ai/platform/prompts/ (lokasi modul adapter yang sudah dibangun,
--    migration 0174), bukan path Edge Function yang tidak dipakai repo ini.
-- 4) pg_cron SUDAH aktif (dicek: installed_version 1.6.4) -- penjadwalan tugas harian 03:00 WIB
--    untuk membersihkan ai_usage_logs > 180 hari (disebut di "Catatan implementasi" dokumen, BUKAN
--    bagian skema SQL dokumen) SENGAJA belum dijadwalkan di migration ini -- menyusul bersamaan saat
--    endpoint ai-generate-description dibangun, supaya ada fungsi pembersih nyata untuk dipanggil
--    cron-nya, bukan menjadwalkan job kosong duluan.
-- 5) Semua nama tabel/kolom lain (ref_cities, ref_districts, listings.area_keyword/status/deleted_at,
--    developer_projects.area_keyword) dicek ada di skema live sebelum ditulis.

-- 0) Kata kunci area yang dinormalisasi (untuk cache riset dan referensi listing)
alter table public.listings
  add column if not exists area_keyword_norm varchar(60)
  generated always as (
    left(lower(regexp_replace(btrim(coalesce(area_keyword, '')), '\s+', ' ', 'g')), 60)
  ) stored;
alter table public.developer_projects
  add column if not exists area_keyword_norm varchar(60)
  generated always as (
    left(lower(regexp_replace(btrim(coalesce(area_keyword, '')), '\s+', ' ', 'g')), 60)
  ) stored;
create index if not exists listings_city_area_kw on public.listings (city_id, area_keyword_norm)
  where status = 'published' and deleted_at is null;
create index if not exists developer_projects_city_area_kw
  on public.developer_projects (city_id, area_keyword_norm);

comment on column public.listings.area_keyword_norm is
  'Dihasilkan otomatis (generated stored) dari area_keyword: huruf kecil, spasi dirapikan, maks 60 karakter. Kunci cache riset kawasan (area_insights) dan pemilihan referensi deskripsi listing lain -- lihat docs/ai-description-rules.md.';

-- 1) Cache fakta kawasan per kata kunci area (riset web, provider dengan kemampuan pencarian --
-- lihat docs/ai-description-rules.md "Provider untuk riset"). Dipakai ulang 60 hari oleh semua
-- listing/project dengan kata kunci area + kota yang sama, supaya riset tidak diulang per listing.
create table if not exists public.area_insights (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.ref_cities(id) on delete cascade,
  area_keyword_norm varchar(60) not null,
  district_id uuid references public.ref_districts(id) on delete set null,
  facts jsonb not null default '[]'::jsonb,
  -- facts: [{id, kategori, nama_tempat, teks, jarak_km, jarak_dari, sumber_url}]
  status text not null default 'auto' check (status in ('auto', 'reviewed', 'rejected')),
  provider_code varchar,
  model_id varchar,
  prompt_version varchar not null default 'area-research.v1',
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '60 days',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (city_id, area_keyword_norm)
);

comment on table public.area_insights is
  'Cache fakta kawasan (fasilitas publik terdekat) per kata kunci area + kota, hasil riset web (lapis 1 dari alur 3 tahap). Status auto/reviewed/rejected dikelola superadmin lewat panel Info Kawasan (menyusul). updated_at diisi eksplisit oleh kode, tidak ada trigger generik (lihat catatan adaptasi).';

-- 2) Daftar istilah: domain pesaing, nama pesaing, kata situs iklan properti, kata terlarang, pola
-- prompt injection. Superadmin bisa menambah kapan saja lewat panel Daftar Blokir AI (menyusul).
create table if not exists public.ai_blocked_terms (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('competitor_domain', 'competitor_name', 'property_site_keyword', 'banned_phrase', 'injection_pattern')),
  value text not null,
  match_type text not null default 'contains' check (match_type in ('contains', 'word', 'domain', 'regex')),
  note text,
  is_active boolean not null default true,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (kind, value)
);

comment on table public.ai_blocked_terms is
  'Daftar istilah dipakai penyaring input/output AI deskripsi: domain pesaing (riset web), nama pesaing, kata situs iklan properti, frasa terlarang, dan pola prompt injection (regex). Seed awal di bawah; superadmin menambah lewat panel Daftar Blokir AI (menyusul).';

insert into public.ai_blocked_terms (kind, value, match_type)
values
  ('competitor_domain', 'rumah123.com', 'domain'),
  ('competitor_domain', '99.co', 'domain'),
  ('competitor_domain', 'rumah.com', 'domain'),
  ('competitor_domain', 'lamudi.co.id', 'domain'),
  ('competitor_domain', 'olx.co.id', 'domain'),
  ('competitor_domain', 'pinhome.id', 'domain'),
  ('competitor_domain', 'urbanindo.com', 'domain'),
  ('competitor_domain', 'dotproperty.id', 'domain'),
  ('competitor_domain', 'mamikos.com', 'domain'),
  ('competitor_name', 'rumah123', 'word'),
  ('competitor_name', 'lamudi', 'word'),
  ('competitor_name', 'pinhome', 'word'),
  ('competitor_name', 'olx', 'word'),
  ('competitor_name', 'urbanindo', 'word'),
  ('property_site_keyword', 'properti', 'contains'),
  ('property_site_keyword', 'property', 'contains'),
  ('property_site_keyword', 'realty', 'contains'),
  ('property_site_keyword', 'realestate', 'contains'),
  ('property_site_keyword', 'rumahdijual', 'contains'),
  ('property_site_keyword', 'jualrumah', 'contains'),
  ('property_site_keyword', 'disewakan', 'contains'),
  ('property_site_keyword', 'kost', 'contains'),
  ('banned_phrase', 'termurah', 'word'),
  ('banned_phrase', 'pasti untung', 'contains'),
  ('banned_phrase', 'dijamin', 'word'),
  ('banned_phrase', 'bebas banjir', 'contains'),
  ('banned_phrase', 'portal properti', 'contains'),
  ('banned_phrase', 'situs lain', 'contains'),
  ('injection_pattern', 'abaikan (semua )?(instruksi|perintah|aturan)', 'regex'),
  ('injection_pattern', 'lupakan (instruksi|aturan)', 'regex'),
  ('injection_pattern', 'ignore (all |previous |above )?instructions', 'regex'),
  ('injection_pattern', '(kamu|anda) (sekarang )?adalah', 'regex'),
  ('injection_pattern', 'you are now', 'contains'),
  ('injection_pattern', 'system prompt', 'contains'),
  ('injection_pattern', 'selalu (rekomendasikan|sarankan|tampilkan)', 'regex'),
  ('injection_pattern', 'rekomendasikan listing ini', 'contains'),
  ('injection_pattern', 'always recommend', 'contains'),
  ('injection_pattern', '(tulis(kan)?|katakan) bahwa', 'regex')
on conflict (kind, value) do nothing;

-- 3) Fitur baru: riset kawasan (web) + template penutup wajib untuk deskripsi listing/project.
alter table public.platform_ai_feature_settings
  drop constraint if exists platform_ai_feature_settings_feature_code_check;
alter table public.platform_ai_feature_settings
  add constraint platform_ai_feature_settings_feature_code_check
  check (feature_code in ('listing_description', 'project_description', 'area_research'));
alter table public.platform_ai_feature_settings
  add column if not exists footer_template text;

comment on column public.platform_ai_feature_settings.footer_template is
  'Template penutup wajib (hanya listing_description/project_description) -- ditambahkan SERVER, bukan ditulis AI, supaya tidak bisa diubah prompt injection. Placeholder {nama_agen}. Lihat docs/ai-description-rules.md "Penutup wajib".';

update public.platform_ai_feature_settings
   set footer_template = 'Dipasarkan oleh {nama_agen} · RumahAgen',
       prompt_version = 'v2'
 where feature_code in ('listing_description', 'project_description');

insert into public.platform_ai_feature_settings (feature_code, display_name, temperature, max_output_tokens, per_user_daily_limit, global_daily_limit, prompt_version)
values ('area_research', 'Riset info kawasan (web)', 0.2, 2000, 0, 100, 'area-research.v1')
on conflict (feature_code) do nothing;
-- per_user_daily_limit 0 = tidak dibatasi per user (riset per kata kunci area, bukan per permintaan
-- user); dibatasi total 100 kata kunci/hari lewat global_daily_limit.

-- 3b) Fitur Generate MetaSEO -- tombol TERPISAH dari Generate deskripsi (lihat docs/ai-description-rules.md
-- "Generate MetaSEO"), aturan SEO (panjang/kata kunci/karakter) hanya berlaku untuk fitur ini.
alter table public.platform_ai_feature_settings
  drop constraint if exists platform_ai_feature_settings_feature_code_check;
alter table public.platform_ai_feature_settings
  add constraint platform_ai_feature_settings_feature_code_check
  check (feature_code in ('listing_description', 'project_description', 'area_research', 'meta_seo'));

insert into public.platform_ai_feature_settings (feature_code, display_name, temperature, max_output_tokens, per_user_daily_limit, global_daily_limit, prompt_version)
values ('meta_seo', 'Generate MetaSEO', 0.3, 400, 30, 1000, 'meta-seo.v1')
on conflict (feature_code) do nothing;

update public.platform_ai_feature_settings
   set prompt_version = 'v3'
 where feature_code in ('listing_description', 'project_description');

-- 4) Penanda: pemakaian (flags, mis. input_injection_removed) dan konten (content_flags, mis.
-- injection_suspected saat listing disimpan/diajukan publikasi -- lihat "Antisipasi asisten buyer").
alter table public.ai_usage_logs add column if not exists flags text[] not null default '{}';
alter table public.listings add column if not exists content_flags text[] not null default '{}';
alter table public.developer_projects add column if not exists content_flags text[] not null default '{}';

comment on column public.listings.content_flags is
  'Ditulis HANYA oleh server (route API/trigger), TIDAK PERNAH dari form -- lihat docs/ai-description-rules.md "Catatan implementasi". Trigger penjaga (mencegah form mengosongkan kolom ini) menyusul bersamaan saat jalur simpan/ajukan listing diberi penyaring prompt-injection (belum dibangun di migration ini).';

-- 5) RLS -- superadmin-only, pola sama persis 0174 (is_superadmin() langsung, tanpa fungsi
-- SECURITY DEFINER tambahan -- baca/tulis lewat route handler dengan client server-side biasa).
alter table public.area_insights enable row level security;
alter table public.ai_blocked_terms enable row level security;

create policy area_insights_superadmin_all on public.area_insights
  for all using (public.is_superadmin()) with check (public.is_superadmin());

create policy ai_blocked_terms_superadmin_all on public.ai_blocked_terms
  for all using (public.is_superadmin()) with check (public.is_superadmin());
