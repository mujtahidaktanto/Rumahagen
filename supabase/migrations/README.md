# Migration M10 (Authorization) + M09 (Admin Console) + M13 (Provider/BYOK) + M03/M14 (Listing/Refresh Allowance) + M04/M15 (Learning/Qualification) + M02/M05/M06/M08/M11 (Profile/Event/Project/Dashboard/Discovery)

Urutan file wajib dijalankan sesuai nomor (Supabase CLI/`supabase db push` otomatis
mengurutkan by filename, tapi didokumentasikan eksplisit di sini untuk kejelasan):

## M10 — Authorization (RBAC/Permission/RLS) — Tahap 0 + 1 checklist

| # | File | Isi | Residual yang ditutup |
|---|---|---|---|
| 1 | `0001_extensions.sql` | `pgcrypto` extension | prasyarat |
| 2 | `0002_users.sql` | `public.users` (1:1 `auth.users`) | prasyarat (FK target) |
| 3 | `0003_authorization_core.sql` | `roles`, `permissions`, `role_permissions` | **D13-06**, sebagian **R-02** |
| 4 | `0004_authorization_permission_preset.sql` | `permission_presets`, `permission_preset_items`, `user_permission_presets` + trigger business-rule | **D13-06** |
| 5 | `0005_organizations.sql` | `organizations`, `organization_members` | prasyarat scope organisasi (item 3 dari rincian) |
| 6 | `0006_authorization_functions.sql` | `has_permission()`, `is_superadmin()`, `auth_scope()`, `is_org_member()`, `current_role_code()` | **R-02** (fungsi tunggal sumber keputusan akses) |
| 7 | `0007_authorization_rls_policies.sql` | RLS policy untuk semua tabel di atas | **D13-06**, **R-02** |
| 8 | `0008_dbr_config.sql` | `dbr_config` + RLS + resolusi konflik wewenang | **D13-04** |
| 9 | `0009_seed_authorization.sql` | 7 role, 90 permission, 345 grant (generate otomatis dari CSV) | **D13-15**, item 6 (seed) |
| 10 | `0010_api_idempotency_keys.sql` | tabel infra idempotency untuk `apps/web` | D13-16, D13-21 (sisi DB) |

## M09 — Admin Console — Tahap 2 checklist

| # | File | Isi | Residual yang ditutup |
|---|---|---|---|
| 11 | `0011_admin_system_configs.sql` | `system_configs` + RLS (Superadmin-only) | **R-06** |
| 12 | `0012_admin_audit_logs.sql` | `audit_logs` (append-only) + `log_audit_event()` + RLS (Superadmin/Admin view) | **D13-13** |
| 13 | `0013_admin_notification_templates.sql` | `notification_templates` (tabel BARU) + RLS + seed 6 tipe | **D13-08** |
| 14 | `0014_admin_public_announcement_promotion.sql` | `public_announcement_promotion` (tabel BARU) + permission baru `m09.public_announcement_promotion.manage` + RLS | **D13-05** |

Catatan status residual M09 lain:
- **D13-12** (`/admin/reports/export` wording) — permission `m09.administrative_export.export`
  sudah benar di seed 0009 (Superadmin-only). Sesuai
  `STEP12-G_CONTROLLED_PHYSICAL_DELTA_REGISTER.csv`: *"No dedicated table required/evidenced"* —
  **tidak ada tabel yang perlu dibuat**, cukup gate `has_permission()` di route handler
  Step 3. Ditutup penuh saat route `/api/admin/reports/export` ditulis.
- **D13-14** (M09/M13 RLS residual gabungan) — **ditutup penuh di sini sekarang**:
  sisi M09 (0011–0014) dan sisi M13 (0015–0016) kini SAMA-SAMA punya RLS policy
  fisik, bukan lagi `policies=0` seperti dicatat di
  `STEP12-G_ROLE_PERMISSION_CAPABILITY_RLS_MATRIX.csv`.

## M13 — Provider Catalogue / BYOK Administration — Tahap 3 checklist

| # | File | Isi | Residual yang ditutup |
|---|---|---|---|
| 15 | `0015_m13_provider_catalogue.sql` | `ai_providers` + RLS (Superadmin-only mutation, view untuk semua user login) | **R-07** (propagasi fisik), sebagian **D13-09** |
| 16 | `0016_m13_agent_ai_connections.sql` | `agent_ai_connections` (status diperluas 5 nilai + `disabled_by_admin`) + trigger state-machine + RLS (3 policy) + fungsi `admin_force_provider_connection()` | **D13-10**, **D13-11**, melengkapi **R-07** |

Catatan status residual M13:
- **R-07** — CLOSED. `ai_providers` + `agent_ai_connections` sudah fisik, dengan
  `provider_id` FK `ON DELETE RESTRICT` sebagai mekanisme "propagasi/sync" dari
  katalog ke koneksi (koneksi tidak pernah menunjuk ke provider yang sudah hilang;
  provider hanya bisa "retire" via status, bukan dihapus selama masih dipakai).
- **D13-09** — Sebagian: tabel + RLS (Superadmin-only mutation) sudah fisik dan
  bisa dites langsung dari SQL Editor/Supabase client. Penutupan penuh (rute REST
  `/api/admin/providers/*`) menyusul Step 3/STEP-11 sesuai rencana kerja yang
  disepakati — pola yang sama seperti D13-12 di atas.
- **D13-10** — Sebagian: primitif `admin_force_provider_connection()` sudah fisik,
  bisa dipanggil & diuji sekarang (mengecek permission sendiri + menulis
  `audit_logs` lewat `log_audit_event()`). Rute REST pembungkusnya menyusul Step 3.
- **D13-11** — CLOSED. Status `agent_ai_connections` diperluas dari 3 ke 5 nilai
  (`active/disconnected/invalid/disabled/revoked`) + kolom `disabled_by_admin` +
  trigger `trg_agent_ai_connection_transition` yang menegakkan state-machine valid
  (termasuk larangan keluar dari `revoked`, dan larangan self-service membalik
  `disabled_by_admin=true`) — lihat komentar lengkap di `0016`.

## M03 (Listing) + M14 (Refresh Allowance/Entitlement) — Tahap 4 checklist

| # | File | Isi | Residual yang ditutup |
|---|---|---|---|
| 17 | `0017_m03_ref_locations.sql` | `ref_provinces`, `ref_cities`, `ref_districts` + RLS (baca publik, tulis Superadmin) | prasyarat FK NOT NULL untuk `listings` |
| 18 | `0018_m03_listings.sql` | `listings` (skema penuh) + trigger `trg_listing_lifecycle_rules` (gate publish, kunci 4 field pasca-publish, guard `last_refreshed_at`) + RLS | prasyarat inti untuk **R-04**/**D13-01** |
| 19 | `0019_m14_commercial_entitlement_quota.sql` | 5 tabel rantai kuota M14 (`commercial_entitlements`→`quota_capacities`→`operational_quota_pools`→`quota_allocations`→`quota_usage`) + RLS + fungsi `configure_refresh_allowance()` | sebagian **R-04** (M14 pemilik allowance) |
| 20 | `0020_m03_m14_refresh_allowance_invocation.sql` | fungsi `consume_refresh_allowance()` (M14) + `refresh_listing()` (M03, memanggil fungsi M14 di atas) | **R-04** (lengkap), **D13-01** (lengkap) |

Catatan status residual Tahap 4:
- **R-04** — CLOSED. `refresh_listing()` (M03) memanggil `consume_refresh_allowance()`
  (M14) untuk kuota tingkat Agent, sambil M03 sendiri menegakkan guard tingkat
  Listing (satu kali per listing per operational day) — arah panggilan benar
  (M03→M14 memanggil, M03 tidak menyimpan counter allowance-nya sendiri).
- **D13-01** — CLOSED. Kontrak invocation M14→M03 kini berupa 2 fungsi SQL nyata
  yang benar-benar saling memanggil (`refresh_listing()` → `consume_refresh_allowance()`),
  bukan lagi semantik di dokumen. Residual ini secara eksplisit meminta "fungsi/
  endpoint internal" (bukan cuma rute REST) — sudah terpenuhi di level fungsi.
  Rute REST `POST /listings/{id}/refresh` pembungkusnya sendiri menyusul Step 3/
  STEP-11 (lapisan terpisah, di luar tuntutan literal D13-01).

Sumber aturan bisnis Tahap 4 lebih detail dari sekadar master matrix: ada gate
khusus `docs/core/current/00-governance/STEP-00/PRE-00-E_M03_LISTING_REFRESH_GATE_FULL_v1.1.md`
yang mengunci default kuota (5/agent/hari), reset Asia/Jakarta tanpa carry-forward,
guard sekali-per-listing-per-hari, dan alur API 13-langkah — dirujuk sebagai
"Gate PRE-00-E" di komentar `0018`/`0020`.

## M04 (Learning Session/Evidence) + M15 (Qualification/Award) — Tahap 5 checklist

| # | File | Isi | Residual yang ditutup |
|---|---|---|---|
| 21 | `0021_m04_learning_sessions.sql` | `learning_sessions`, `learning_session_assignments`, `session_enrollments`, `session_provider_bindings` + RLS | prasyarat inti **R-08** (Session) |
| 22 | `0022_m04_session_evidence.sql` | `session_artifacts`, `session_participation_evidence`, `session_attendance_evaluations`, `session_completion_outcomes` + trigger + RLS | **R-08** (Session/Evidence, bagian inti) |
| 23 | `0023_m04_learning_points.sql` | `learning_point_accounts`, `learning_point_transactions` + trigger saldo + 2 permission baru (`m04.learning_point.view/adjust`) + RLS | prasyarat **D13-02** |
| 24 | `0024_m04_partnership_learning_result.sql` | `partnership_learning_results` (tabel baru) + permission baru `m04.partnership_learning_result.manage` + trigger validasi + RLS | **R-08** (Partnership Learning, lengkap) |
| 25 | `0025_m14_m04_learning_point_grant_invocation.sql` | fungsi `grant_learning_points_from_purchase()` | **D13-02** (lengkap, dengan catatan — lihat di bawah) |
| 26 | `0026_m15_qualification_award.sql` | `title_definitions`, `title_authority_scopes`, `qualification_evaluations`, `qualification_evidence`, `award_instances` + trigger authority-scope + RLS | prasyarat inti **D13-03** |
| 27 | `0027_m04_m15_evidence_evaluation_invocation.sql` | fungsi `capture_qualification_evidence_from_session()` + `evaluate_qualification()` | **D13-03** (lengkap) |

Catatan status residual Tahap 5:
- **R-08** — CLOSED. Session/Evidence: 8 tabel (`0021`-`0022`) + RLS memakai 14
  permission Session yang sudah ada sejak Tahap 1 (Gate PRE-00-F §45-46,
  "14-row Session permission family"). Partnership Learning: tabel baru +
  permission baru (`0024`) — tidak ada di STEP10-D/master matrix sama sekali
  (Gate PRE-00-F §51 sendiri menyatakan "CONTROLLED... no new physical table
  is inferred" — migration inilah realisasi downstream-nya).
- **D13-02** — CLOSED dengan catatan penting: fungsi `grant_learning_points_from_purchase()`
  sudah fisik dan bisa dites, TAPI untuk sementara digerbangi Superadmin-only
  karena pipeline fulfillment M14 otomatis (`commercial_orders`/
  `payment_transactions`/`commercial_fulfillments`) belum dibangun (ditunda
  sejak Tahap 4). Lihat TODO eksplisit di komentar `0025` — perlu direvisi
  kalau pipeline itu dibangun nanti.
- **D13-03** — CLOSED. Kontrak field evidence→evaluation dibekukan lewat 2
  fungsi di `0027`, dengan pola field KONSISTEN (`source_type`/`source_reference`)
  dipakai berulang di `learning_point_transactions` (0023), `qualification_evidence`
  (0026), dan payload JSON di `0027` — bukan penamaan bebas per pemanggil.
  **Catatan cakupan:** mesin konfigurasi awarding path/rule (8 tabel:
  `AWARDING_CONDITIONS`, `AWARDING_CONDITION_GROUPS`, `AWARDING_PATHS`,
  `AWARDING_PATH_RULES`, `AWARDING_PATH_VERSIONS`, `AWARDING_PREREQUISITES`,
  `AWARDING_RULE_VERSIONS`, `AWARD_QUALIFYING_PATHS`) **BELUM dibangun** — di
  luar lingkup literal D13-03 ("field/contract level traceability", bukan
  "bangun rule engine kualifikasi") dan belum punya nomor residual di checklist
  manapun. `qualification_evaluations.awarding_path_version_id`/
  `awarding_rule_version_id` dan `award_instances` kolom yang sama dibuat
  NULLABLE tanpa FK (deviasi terdokumentasi dari NOT NULL di STEP10-D) sampai
  mesin itu dibangun — lihat catatan lengkap di `0026`.

## Koreksi & M02/M05/M06/M08/M11 — Tahap 6 checklist

| # | File | Isi | Residual yang ditutup |
|---|---|---|---|
| 28 | `0028_correction_m11_announcement_promotion_permission.sql` | **KOREKSI** RLS `public_announcement_promotion` (0014) dari permission M09 yang salah kaprah ke `m11.announcement_promotion.publish` yang benar | perbaikan D13-05 |
| 29 | `0029_m02_agent_profiles.sql` | `agent_profiles` + 2 permission baru (view/update) + RLS | M02 (di luar 31 residual asli, diminta eksplisit) |
| 30 | `0030_m02_agent_reviews.sql` | `agent_reviews` (auto-approve sesuai Gate, bukan default STEP10-D) + 3 permission baru + RLS | M02 |
| 31 | `0031_m05_events.sql` | `events`, `event_provider_bindings` + trigger lifecycle + RLS | M05 |
| 32 | `0032_m05_event_registrations.sql` | `event_registrations` (termasuk Guest Registration) + trigger + RLS | M05 |
| 33 | `0033_m06_developer_partners.sql` | `developer_partners` + 1 permission baru + RLS | prasyarat R-05 |
| 34 | `0034_m06_developer_projects.sql` | `developer_projects`, `developer_project_media` + 2 permission baru + trigger publish + **FK retroaktif** ke `listings`/`events` | **R-05** (bagian Developer/Project) |
| 35 | `0035_m06_marketing_kit_claims.sql` | `marketing_kit`, `agent_project_claims` + trigger + RLS | **R-05** (lengkap — Marketing Kit + Claim) |
| 36 | `0036_m08_notifications.sql` | `notifications` (+ kolom ADD-NEW `dismissed_at`/`delivery_status`) + fungsi `create_notification()` (satu-satunya jalur INSERT) + trigger + RLS | **D13-07** (lengkap) |
| 37 | `0037_m11_static_public_content.sql` | `static_public_content` + trigger + RLS | M11 |

### Koreksi penting (0028)

Saat riset M11 untuk Tahap 6, ditemukan bahwa `0014` (Tahap 2) salah mengategorikan
permission untuk `public_announcement_promotion`: di-mint sebagai
`m09.public_announcement_promotion.manage` (permission baru) padahal STEP10-D
memberi tag `module: M11` untuk entity ini, dan master matrix 50-baris MEMANG
punya baris evidenced untuk resource ini —
`m11.announcement_promotion.publish` (Superadmin/Admin=ALL, Manager=NONE),
sudah ter-seed sejak Tahap 1 tapi luput dicek waktu itu. `0028` mengoreksi RLS
tabel itu ke permission yang benar, TANPA mengedit `0014` (migration yang
sudah ada tidak ditulis ulang — pola standar migration tool apa pun).
Permission lama dibiarkan ada (deprecated, tidak dipakai RLS manapun lagi).

**Catatan nuansa yang belum ditutup**: Gate PRE-00-M §10 menjelaskan
Announcement/Promotion sebenarnya cross-module (M09 = lifecycle/konfigurasi
konten, M11 = discovery/tracking/measurement) — kemungkinan idealnya butuh 2
permission terpisah, bukan 1. Master matrix 50-baris cuma punya 1 baris
evidenced untuk resource ini, jadi `0028` memakai itu apa adanya (lebih benar
dari sebelumnya, meski mungkin belum granular sempurna) — pemecahan lebih
lanjut adalah residual masa depan kalau kebutuhannya jadi nyata.

### Catatan status M02/M05/M06(sebagian)/M08/M11

Modul-modul ini **BUKAN bagian dari 31 residual unik asli** di
`P9_CONTROLLED_ENGINEERING_RESIDUAL_REGISTER_v1.1.csv` (M02/M05/M08/M11 tidak
punya nomor R-xx/D13-xx sama sekali; M06 cuma punya R-05 yang mencakup
Marketing Kit/Claim/Project). Diminta eksplisit oleh pengguna untuk
dikerjakan di Tahap 6 bersama sisa checklist asli. Setiap modul punya gate
khusus (PRE-00-D/G/H/J/M) yang jadi sumber keputusan scope/permission,
dirujuk lengkap di komentar tiap file.

## Keputusan engineering yang perlu diketahui (lihat komentar lengkap di tiap file)

- `0014`: permission `m09.public_announcement_promotion.manage` **tidak ada** di
  `STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv` — di-mint baru dengan scope role
  (Superadmin/Admin/Manager=ALL) meniru pola resource M09 tetangga yang paling
  mirip ("Notification Template/Content Configure"). Ini satu-satunya permission
  di seluruh migration M09/M10 yang bukan hasil generate langsung dari CSV frozen.
- `0016`: status `agent_ai_connections` dilebarkan dari 3 ke 5 nilai. BERBEDA
  dengan `0014` di atas — ini BUKAN permission baru, hanya nilai enum kolom
  `status` yang diperluas, dan D13-11 sendiri secara eksplisit menyatakan 3 nilai
  dokumen sumber memang tidak lengkap (bukan diam-diam diabaikan). Lihat rasional
  lengkap di komentar `0016_m13_agent_ai_connections.sql`.
- `0015`: `ai_providers` **tidak diberi seed data** (beda dengan pola seed di 0009
  dan 0013) — tidak ada daftar provider AI kanonik yang dievidensi di manapun
  dalam corpus dokumen (dicek sampai ke isi zip bersarang), jadi mengisi baris
  contoh berarti mengarang data bisnis. Superadmin mengisi katalog secara
  operasional setelah rute mutasi (D13-09) ditulis.
- `0017`: `ref_provinces`/`ref_cities`/`ref_districts` juga **tidak diberi seed
  data** (sama seperti `0015`) — tidak ada daftar wilayah administratif Indonesia
  yang dievidensi di corpus dokumen manapun.
- `0018`: `listings.developer_project_id` dan `0019`:
  `commercial_entitlements.source_order_id/source_payment_transaction_id/source_fulfillment_id`
  — kolom ada, FK **DITUNDA** (pola sama seperti `campaign_reference` di `0014`)
  karena tabel targetnya (`developer_projects`, `commercial_orders`,
  `payment_transactions`, `commercial_fulfillments`) milik residual/modul lain
  yang belum masuk giliran kerja (M06 di Tahap 6; pipeline Commercial Purchase/
  Payment M14 yang lebih luas, belum ada residual khusus di checklist).
- `0019`: `quota_usage` **tidak punya kolom saldo/counter** — sisa kuota harian
  dihitung `COUNT()` on-the-fly dari event `quota_usage` hari ini (Asia/Jakarta),
  bukan disimpan sebagai angka yang perlu di-reset lewat cron/scheduler. Ini
  keputusan desain, bukan penyimpangan dari skema — struktur `quota_usage` di
  STEP10-D memang tidak punya kolom saldo, secara implisit menandakan pendekatan
  event-sourced ini yang dimaksud.
- `0019`: mutasi (`INSERT`/`UPDATE`) ke kelima tabel rantai kuota **diperketat ke
  Superadmin-only lewat fungsi**, meski master matrix secara literal memberi Agent
  scope OWN untuk verb "Configure" — membiarkan Agent mengubah angka allowance
  miliknya sendiri lewat client langsung adalah celah eskalasi hak. Pola sama
  seperti R-06 (0011): perketat RLS saat migration ditulis, jangan copy scope
  dokumen mentah-mentah, dan dokumentasikan alasannya (lihat komentar lengkap di
  `0019`).
- `0020`: urutan pengecekan kuota-Agent vs kuota-Listing di `refresh_listing()`
  **ditukar** dari urutan literal Gate PRE-00-E §27 (langkah 7 sebelum 8) demi
  atomicity transaksional — hasil akhir yang teramati identik, didokumentasikan
  eksplisit di komentar fungsi.
- `0023`/`0024`: 3 permission baru di-mint (`m04.learning_point.view`,
  `m04.learning_point.adjust`, `m04.partnership_learning_result.manage`) —
  ketiganya TIDAK ada di master matrix 50-baris frozen, tapi role direction-nya
  diambil PERSIS dari Gate PRE-00-F §11/§13/§51 (bukan dikarang bebas), pola
  sama seperti permission ke-91 di `0014`.
- `0026`: `qualification_evaluations.awarding_path_version_id`/`awarding_rule_version_id`
  dan kolom yang sama di `award_instances` dilebarkan dari NOT NULL (STEP10-D)
  jadi NULLABLE tanpa FK — mesin konfigurasi awarding path/rule (8 tabel) di
  luar lingkup Tahap 5, lihat catatan lengkap di file itu.
- `0025`: `grant_learning_points_from_purchase()` digerbangi Superadmin-only
  untuk sementara (bukan permission `m04.learning_point.adjust`) — TODO
  eksplisit untuk direvisi saat pipeline fulfillment M14 dibangun, lihat
  rasional lengkap di komentar file.
- `0029`/`0030`/`0033`/`0034`: 7 permission baru di-mint untuk M02/M06
  (`m02.agent_profile.view/update`, `m02.review.create/view/moderate`,
  `m06.developer_partner.manage`, `m06.developer_project.manage/publish`) —
  TIDAK ada di master matrix 50-baris, scope diambil PERSIS dari gate masing-
  masing modul (bukan dikarang bebas), pola sama seperti permission M04 di
  Tahap 5.
- `0030`: `agent_reviews.status` DEFAULT diubah dari `'pending'` (STEP10-D
  literal) jadi `'approved'` — mengikuti resolusi Gate PRE-00-D §13-14
  (auto-approve, moderasi pasca-publikasi), pola sama seperti keputusan DBR di
  `0008`.
- `0034`: `developer_project_media.type` CHECK dipersempit dari 4 nilai
  (STEP10-D) ke 2 nilai (photo/video saja) — brochure/price_list dipindah ke
  `marketing_kit` (0035), mengikuti Gate PRE-00-H §12 RECONCILE.
- `0034`: FK **retroaktif** ditambahkan ke `listings.developer_project_id`
  (ditunda sejak `0018`/Tahap 4) dan `events.related_project_id` (ditunda
  sejak `0031`, migration yang sama Tahap 6 ini) — TODO yang didokumentasikan
  eksplisit di kedua file itu sekarang ditutup.
- `0036`: `notifications` TIDAK PUNYA policy INSERT untuk user biasa sama
  sekali — satu-satunya jalur pembuatan adalah fungsi `create_notification()`,
  menegakkan Gate PRE-00-J §12-14 ("Notification State ≠ Notification
  Creation", M08 tidak boleh punya permission create).

## Cara menjalankan

```bash

supabase link --project-ref <project-ref>
supabase db push
```

Atau lokal:

```bash
supabase start
supabase db reset   # menjalankan semua migration dari awal, termasuk seed
```

## Traceability

`audit/M10_PERMISSION_SEED_TRACEABILITY.csv` (di root repo) memetakan setiap 90
`permission_code` awal (M10 seed) ke baris asal di
`STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv`. Permission ke-91
(`m09.public_announcement_promotion.manage`, dari `0014`) TIDAK ada di file itu
karena memang bukan hasil generate dari CSV — lihat rasionalnya di komentar
`0014_admin_public_announcement_promotion.sql`. 14 permission M13
(`m13.provider_catalogue.*`, `m13.own_byok_connection.*`,
`m13.administrative_force_revoke_disable.execute`) SUDAH ADA di file traceability
itu sejak awal (di-generate bersama 90 permission lain di Tahap 1) — `0015`/`0016`
hanya menyambungkan tabel fisik ke permission yang sudah ada, tidak menambah baris
baru ke traceability. Sama halnya 7 permission M03 (`m03.listing.*`) dan 2
permission M14 (`m14.refresh_allowance_entitlement.*`) yang dipakai `0017`–`0020`
— semuanya SUDAH ADA di seed 0009 sejak Tahap 1, tidak ada permission baru
ditambahkan di Tahap 4. Begitu juga 14 permission M04 Session (`m04.learning_session.*`,
`m04.session_enrollment.*`, `m04.session_assignment.assign`, `m04.session_evidence.*`,
`m04.attendance.manage`, `m04.completion.manage`, `m04.artifact.*`,
`m04.learning_provider.manage`) dan 6 permission M15 (`m15.qualification.*`,
`m15.award.*`, `m15.title_authority_scope_binding.configure`) yang dipakai
`0021`-`0022`/`0026` — semua SUDAH ADA sejak Tahap 1. Permission ke-92 s.d. ke-94
(`m04.learning_point.view`, `m04.learning_point.adjust`,
`m04.partnership_learning_result.manage`, dari `0023`/`0024`) TIDAK ada di file
traceability itu karena bukan hasil generate dari CSV — lihat rasionalnya di
komentar `0023_m04_learning_points.sql`/`0024_m04_partnership_learning_result.sql`.

## Yang SENGAJA belum termasuk (di luar scope Tahap 0-6)

- M07 DBR di luar `dbr_config` (domain operations DBR lengkap) — belum ada
  nomor residual.
- M14 Commercial di luar rantai Refresh Allowance/LP Grant (subscriptions/
  addons/promotions/commercial_orders/payment_transactions/
  commercial_fulfillments) — belum ada nomor residual.
- M04 Learning Catalog/Activity di luar Session (courses/learning_paths/
  learning_activities) — belum ada nomor residual.
- M12 Organization di luar `organizations`/`organization_members` (manajemen
  organisasi penuh) — belum ada nomor residual.
- Mesin konfigurasi awarding path/rule (8 tabel M15) — lihat catatan D13-03 di
  atas.
- RLS policy modul-modul di atas — akan memanggil `has_permission()` dari
  `0006_authorization_functions.sql`, TIDAK menulis ulang logika sendiri.
- Rute REST untuk SEMUA modul (Tahap 1-6) — belum ada satu route pun selain
  contoh `GET /api/authorization/roles` dari Tahap 1. Menyusul Step 3/STEP-11.
- `packages/ui`, `packages/config`, `supabase/config.toml`, `package.json` root/
  workspace config — masih kosong/belum ada, di luar scope migration.

**Dengan Tahap 6 ini, seluruh 31 residual unik di `P9_CONTROLLED_ENGINEERING_RESIDUAL_REGISTER_v1.1.csv`
sudah tertutup di level migration/RLS/fungsi** (bukan rute REST — itu Step 3/
STEP-11 terpisah), ditambah 5 modul (M02/M05/M06 lengkap/M08/M11) yang tidak
ada di 31 residual asli tapi diminta eksplisit dikerjakan di Tahap 6.

## Migration pasca-Tahap 6 (Step 3/STEP-11, ADD-NEW)

- **`0038_performance_indexes_fk.sql`** — index B-tree untuk 85 kolom FK yang
  ditandai Supabase Performance Advisor. Murni optimasi, bukan dari dokumen
  sumber manapun — lihat rasional lengkap di file itu sendiri.
- **`0039_events_delete_policy.sql`** — menutup gap: `0031_m05_events.sql`
  tidak pernah membuat RLS policy untuk command `DELETE` di tabel `events`,
  padahal STEP11-A meng-evidence `API-084 DELETE /events/{id}` sebagai route
  yang harus dipertahankan. Ditemukan saat implementasi route REST M05 (bukan
  saat migration 0031 ditulis) — tanpa policy ini, endpoint delete tidak bisa
  berfungsi untuk siapa pun. Memakai permission `m05.event.update` yang sudah
  ada (tidak ada `m05.event.delete` di master matrix).

- **`0040_developer_projects_delete_policy.sql`** — gap yang PERSIS SAMA
  seperti 0039, tapi di tabel `developer_projects` (migration 0034 tidak
  pernah membuat RLS `DELETE`, padahal STEP11-B3 API-122 meng-evidence-nya).
  Memakai permission `m06.developer_project.manage` yang sudah ada.
- **`0041_fix_agent_project_claims_review_policy.sql`** — BUG FUNGSIONAL
  (bukan gap dokumentasi): RLS `agent_project_claims_review` (0035) hanya
  mengecek kepemilikan lewat `agent_id` (si pengklaim), padahal Developer
  Partner juga punya scope 'own' di permission `m06.claim.review/approve/
  reject/revoke` (seed 0009) untuk me-review klaim di PROJECT MILIKNYA —
  rantai kepemilikan berbeda yang tidak pernah dicek policy lama. Ditemukan
  saat testing REST API (Developer Partner approve klaim di project sendiri
  ditolak RLS). Ditambahkan klausul OR yang mengecek lewat
  `project_id -> developer_projects.developer_id -> developer_partners.user_id`.

- **`0042_session_enrollments_delete_policy.sql`** — gap RLS DELETE yang
  sama seperti 0039/0040, tapi di `session_enrollments`. BEDA penting: 0021
  eksplisit melarang permission baru untuk tabel ini (Gate §26 "NO NEW
  PERMISSION"), jadi policy barunya memakai ekspresi yang SAMA PERSIS dengan
  `UPDATE` staf yang sudah ada, bukan permission baru.
- **`0043_fix_attendance_completion_manage_policy.sql`** — BUG FUNGSIONAL:
  RLS `session_attendance_evaluations_manage`/`session_completion_outcomes_manage`
  (0022) memanggil `has_permission()` TANPA argumen owner_id, membuat scope
  'own' Instructor tidak pernah terpenuhi. Percobaan perbaikan PERTAMA
  (subquery langsung di ekspresi policy) — TERNYATA MASIH BUG, lihat 0044.
- **`0044_fix_attendance_completion_owner_resolution.sql`** — perbaikan
  LANJUTAN 0043: subquery yang ditulis langsung di ekspresi `CREATE POLICY`
  ternyata ikut tunduk RLS actor pemanggil (Instructor tidak punya akses
  SELECT ke `session_enrollments` milik Agent lain), jadi tetap gagal.
  Diperbaiki dengan fungsi `SECURITY DEFINER` baru `session_owner_for_enrollment()`
  — pola sama seperti `has_permission()` sendiri.
- **`0045_fix_completion_trigger_rls_visibility.sql`** — BUG KETIGA dari
  kelas yang sama: trigger `enforce_completion_requires_active_enrollment()`
  (0022) SELECT langsung ke `session_enrollments` tanpa `SECURITY DEFINER`,
  salah menolak Instructor walau status enrollment sungguhan sudah valid.
  Ditambahkan `SECURITY DEFINER` ke fungsi trigger tersebut.

Ketiga bug di atas (0043-0045) ditemukan lewat testing REST API M04 Session/
Evidence (STEP11-B5) yang nyata terhadap database — bukan review kode statis.

Klaim "belum ada satu route pun selain `GET /api/authorization/roles`" di atas
sudah TIDAK akurat lagi sejak Step 3 dimulai — lihat `apps/web/README.md`
untuk daftar route REST M03/M14/M09/M08/M05/M06/M13/M04 yang sudah nyata dan diuji.
