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
- M04 Learning Catalog/Activity di luar Session/LP Economy (courses/
  learning_paths/learning_activities) — belum ada nomor residual. (LP Economy
  sendiri — `learning_point_accounts`/`learning_point_transactions`/
  Partnership Learning Result — SUDAH ditutup REST API-nya, lihat migration
  `0046` di bawah dan `apps/web/README.md`.)
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

- **`0046_learning_point_adjustment_function.sql`** — GAP FUNGSIONAL: permission
  `m04.learning_point.adjust` sudah di-seed sejak `0023_m04_learning_points.sql`
  khusus untuk koreksi manual saldo LP oleh staf, TAPI tabel
  `learning_point_transactions` cuma pernah dibuatkan RLS `SELECT` — tidak ada
  jalur `INSERT` apa pun lewat client langsung untuk siapapun (termasuk
  Superadmin). Ditemukan saat implementasi route REST M04 LP Economy
  (STEP11-B4). Ditutup dengan fungsi `SECURITY DEFINER` baru
  `adjust_learning_points(p_user_id, p_amount, p_reason, p_idempotency_key)`
  — pola sama seperti `grant_learning_points_from_purchase()` yang sudah ada:
  cek permission sendiri, auto-create `learning_point_accounts` kalau belum
  ada, insert transaksi tipe `adjustment`, dukung idempotency key opsional.
  Dibungkus route `POST /api/admin/learning-point-adjustments`. CHECK
  constraint `learning_point_accounts_balance_projection_check` (saldo tidak
  boleh negatif) tetap berlaku dan diuji nyata (percobaan over-deduction
  ditolak Postgres code `23514`, sekarang dipetakan ke 409 CONFLICT lewat
  fix terpusat baru di `apps/web/lib/api/handler.ts`, bukan 500 generik).

**M15 Qualification/Evidence/Awarding REST API (STEP11-B8) — TIDAK ADA
migration baru.** Kelima tabel M15 yang ada sejak `0026`
(`title_definitions`, `title_authority_scopes`, `qualification_evaluations`,
`qualification_evidence`, `award_instances`) sudah punya RLS lengkap tanpa
gap sejak awal — beda dari M04/M05/M06 yang masing-masing perlu migration
fix RLS/trigger, batch M15 murni REST layer di atas skema yang sudah benar.
Dua fungsi SQL yang sudah fisik sejak `0027`
(`capture_qualification_evidence_from_session()`/`evaluate_qualification()`)
akhirnya dapat route HTTP pertama kalinya di batch ini
(`POST /qualification-evidence/from-session-completion` dan
`POST /qualification-evidence/{id}/evaluate`) — pipeline D13-03 M04→M15
evidence→evaluation→award kini teruji end-to-end lewat HTTP untuk pertama
kalinya, bukan cuma via SQL langsung. **Cakupan REST dibatasi ke 5 tabel
yang benar-benar ada** — 9 tabel besar "mesin konfigurasi jalur/aturan
kelulusan" (`awarding_paths`, `awarding_path_versions`,
`awarding_rule_versions`, `awarding_path_rules`,
`awarding_condition_groups`, `awarding_conditions`,
`awarding_prerequisites`, `award_qualifying_paths`, `title_presentations`)
masih seperti dicatat di `0026`: belum punya migration sama sekali, jadi
STEP11-B8 API-205-215/230-236 (awarding path/rule/version, appeal,
presentation) tidak diimplementasikan — bukan gap REST, tapi memang belum
ada tabel fisiknya. Lihat `apps/web/README.md` untuk daftar lengkap route.

Klaim "belum ada satu route pun selain `GET /api/authorization/roles`" di atas
sudah TIDAK akurat lagi sejak Step 3 dimulai — lihat `apps/web/README.md`
untuk daftar route REST M03/M14/M09/M08/M05/M06/M13/M04 yang sudah nyata dan diuji.

## Fase 1 "100% Tabel" — 0047-0055 (deep-scan RumahAgen-SaaS-Core-M01-M37.zip)

Hasil deep-scan terhadap `STEP10-D_ENTITY_TO_PHYSICAL_TABLE_RECONCILIATION.csv`
(dokumen sumber, bukan hasil migration kita) menemukan **94 logical entity**
total di spec — 86 sudah punya physical table di baseline frozen (W4-01E),
8 lagi ADD-NEW logis tanpa tabel fisik. Sebelum batch ini, repo baru punya 54
dari 94 itu. Fase 1 menutup 13 tabel yang PALING tidak saling bergantung
(sisanya — M04 Learning Catalog 13 tabel, M15 Awarding Engine 9 tabel, M14
Commercial 8 tabel — menyusul di fase berikutnya, lihat pembagian fase di
percakapan perencanaan).

- **`0047_m03_listing_media_analytics.sql`** — 7 tabel M03:
  `listing_photos`, `listing_videos`, `listing_price_history`,
  `listing_views`, `listing_leads`, `amenities`, `listing_amenities`. Kolom
  persis sesuai `STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv`.
  `listing_price_history` ADD-NEW diisi otomatis lewat trigger
  `log_listing_price_change()` (SECURITY DEFINER) saat `listings.price`
  berubah — bukan tabel yang bisa di-INSERT manual. Tidak ada permission
  baru, RLS memakai `m03.listing.update` yang sudah ada lewat join ke
  `listings.agent_id`.
- **`0048_ref_villages.sql`** — level ke-4 rantai referensi wilayah, pola
  identik ref_provinces/cities/districts (0017).
- **`0049_m01_agent_verification_documents.sql`** — permission BARU
  `m01.verification_document.manage` (tidak ada baris M01 di permissions
  seed sama sekali sebelumnya — M01 Identity/Auth sepenuhnya ditangani
  Supabase Auth). Agent=OWN upload dokumen sendiri, Superadmin/Admin/
  Manager=ALL review.
- **`0050_m12_organization_document_invitations.sql`** — 2 tabel M12:
  `organization_invitations` (leader_invite vs agent_request, dengan
  trigger anti-self-approval) dan `organization_document` (salah satu dari
  8 entitas ADD-NEW STEP10-D, vocabulary document_type/visibility adalah
  keputusan engineering baru — spec sengaja meninggalkannya "downstream").
  Helper baru `is_org_leader()` (pola sama seperti `is_org_member()`/0006).
- **`0051_m11_url_redirects.sql`** — tabel SEO redirect 301/302, memakai
  permission `m11.static_public_content.publish` yang sudah ada.
- **`0052_m07_dbr_simulations.sql`** — riwayat simulasi kelayakan KPR,
  append-only, memakai `m07.dbr.domain_operations` yang sudah ada.
- **`0053_performance_indexes_fk_phase1.sql`** — index B-tree untuk kolom
  FK di 13 tabel di atas (pola sama seperti 0038).

**2 BUG DITEMUKAN & DITUTUP lewat testing nyata langsung ke PostgREST**
(bukan lewat route Next.js — belum dibangun untuk tabel-tabel ini):
1. `0054_fix_listing_child_tables_status_check.sql` — RLS SELECT
   `listing_photos`/`listing_videos`/`listing_amenities` di 0047 salah
   memakai `listings.status = 'active'` (nilai itu TIDAK PERNAH ada di
   CHECK constraint `listings.status`, yang benar adalah `'published'`) —
   akibatnya foto/video/amenity listing yang sudah published TIDAK PERNAH
   terlihat publik. Ditemukan saat memasang data uji (INSERT test listing
   gagal dengan status yang salah), dikonfirmasi ulang lewat GET anonim
   setelah fix.
2. `0055_fix_verification_document_self_approval.sql` — RLS UPDATE
   `agent_verification_documents_update` (0049) awalnya HANYA mengecek
   `has_permission(..., user_id)` tanpa membedakan kolom yang diubah;
   komentar asli 0049 mengklaim `review_status` "dilindungi lapisan REST
   API", TERBUKTI TIDAK CUKUP saat diuji langsung lewat PostgREST — Agent
   BERHASIL self-approve dokumennya sendiri. Ditutup dengan trigger
   `enforce_verification_document_staff_only_review()`, pola sama seperti
   `trg_enforce_organization_invitation_no_self_accept` (0050) dan
   `trg_partnership_result_validation_superadmin_only` (0024). Pelajaran:
   Supabase mengekspos SETIAP tabel lewat PostgREST otomatis terlepas dari
   route Next.js apa pun yang (belum) dibangun — proteksi field sensitif
   HARUS di level RLS/trigger, tidak cukup "nanti dijaga lapisan REST API".

**CATATAN ARSITEKTURAL untuk pembangunan REST API batch berikutnya**:
`listing_views_insert`/`listing_leads_insert` sengaja `WITH CHECK (true)`
(insert publik/anonim) sementara SELECT-nya dibatasi pemilik listing. Postgres
`INSERT ... RETURNING` (yang direalisasikan pola `.insert().select()` di
SETIAP route kita sejauh ini) mensyaratkan baris hasil insert JUGA lolos RLS
SELECT — untuk anon yang tidak lolos SELECT, ini membuat seluruh INSERT
gagal dengan error RLS walau `WITH CHECK` sendiri sudah `true`. Dikonfirmasi
lewat test langsung (insert dengan `Prefer: return=representation` gagal,
tanpa itu berhasil 201). Route REST untuk kedua tabel ini nanti WAJIB pakai
`.insert()` TANPA `.select()` (return minimal), bukan pola standar
`.insert().select().single()` yang dipakai tabel lain.

**CATATAN BELUM DIOTOMATISASI** (bukan bug, keputusan ditunda): accept pada
`organization_invitations` HANYA mengubah `status`, TIDAK otomatis membuat
baris `organization_members` — automasi "accept invitation -> insert
membership" adalah keputusan alur bisnis yang lebih pas diputuskan saat
membangun REST API/trigger untuk resource ini, bukan diasumsikan sekarang.

Seluruh 13 tabel di atas diuji nyata lewat PostgREST langsung (bukan lewat
route Next.js) dengan throwaway test user per role, mencakup: owner vs
non-owner isolation, publik vs staf visibility, insert-publik vs
select-terbatas, self-approval/self-accept blocking, dan trigger
otomatis (price history). Data uji dibersihkan total setelahnya.

## Fase 2 "100% Tabel" — 0056-0063 (M04 Learning Catalog/Activity)

13 tabel M04 Learning Catalog/Activity/Assessment — domain yang SECARA
EKSPLISIT terpisah dari M04 Session/Evidence (Tahap 5/STEP11-B5): course
adalah konten self-paced/katalog, learning_sessions adalah live/terjadwal.
Sumber kolom: `STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv`,
tanpa deviasi kolom. Kontrak API dipelajari dari `STEP11-B4` (API-051-078)
untuk memahami arah role/scope — permission action_code sendiri semuanya
ADD-NEW karena master matrix 50-baris TIDAK PUNYA satu baris pun untuk
Course/Learning Catalog (dicek ke `M10_PERMISSION_SEED_TRACEABILITY.csv`,
nihil).

- **`0056_m04_courses.sql`** — `courses` + `course_lessons`. Permission
  baru `m04.course.manage` (Instructor=OWN via `created_by`, pola identik
  `learning_sessions.owner_id`; Superadmin/Admin/Manager=ALL).
- **`0057_m04_learning_paths.sql`** — `learning_paths` +
  `learning_path_versions`. Permission baru `m04.learning_path.manage`
  (HANYA Superadmin/Admin/Manager=ALL — TIDAK ADA kolom owner fisik di
  kedua tabel ini, beda dari courses).
- **`0058_m04_learning_activities.sql`** — `learning_activities` +
  `learning_activity_completions` + `learning_unlock_progressions`.
  Permission baru `m04.learning_activity.manage` (staf=ALL) dan
  `m04.learning_activity_completion.create` (Agent=OWN — completion adalah
  klaim milik learner sendiri sesuai Q-M04-LC-02A, staf=ALL untuk
  oversight). `learning_unlock_progressions` SENGAJA tidak punya RLS
  INSERT/UPDATE untuk Agent sama sekali (Q-M04-C-05B: "no invented
  progression mutation route" — CONTROLLED API GAP), hanya staf sebagai
  stop-gap administratif.
- **`0059_m04_course_enrollments.sql`** — `enrollments` (Course Enrollment,
  STEP11-B4 §8: "distinct from Session Enrollment"). Permission baru
  `m04.course_enrollment.create`/`.view`, pola PERSIS sama seperti
  `m04.session_enrollment.create`/`.view` yang sudah ada.
- **`0060_m04_quizzes.sql`** — `quizzes`/`quiz_questions`/`quiz_options`/
  `quiz_attempts`. TIDAK ADA permission baru — quiz konten memakai
  `m04.course.manage` yang sama (join ke `courses.created_by`), quiz_attempts
  memakai kepemilikan `enrollments.agent_id` langsung. `quiz_options` SENGAJA
  hanya bisa di-SELECT pemilik course/staf (kunci jawaban `is_correct` tidak
  boleh terlihat Agent yang sedang mengerjakan) — penyajian opsi ke Agent
  nanti WAJIB lewat REST API yang men-strip `is_correct`, bukan query
  langsung ke tabel ini (dikonfirmasi lewat test: Agent enrolled bisa lihat
  `quiz_questions` tapi `quiz_options` selalu kosong).
- **`0061_m04_certificates.sql`** — `certificates`. Permission baru
  `m04.certificate.manage` (HANYA Superadmin/Admin/Manager=ALL — Agent
  SENGAJA TIDAK PERNAH diberi grant permission ini sama sekali, demi
  mencegah self-issue; akses baca Agent ditegakkan lewat kondisi
  `agent_id = auth.uid()` langsung di policy SELECT, bukan lewat grant
  permission apa pun, pola sama seperti `award_instances_select`/M15).
- **`0062_fix_learning_sessions_course_id_fk.sql`** — menutup FK yang
  SENGAJA ditunda sejak 0021 ("FK ke courses DITUNDA — di luar scope Tahap
  5"). `ON DELETE SET NULL` (course terhapus tidak boleh ikut menghapus/
  memblokir session terkait). Diverifikasi lewat test: course_id valid
  berhasil, course_id palsu ditolak error 23503.
- **`0063_performance_indexes_fk_phase2.sql`** — index B-tree untuk kolom
  FK di 13 tabel di atas (pola sama seperti 0038/0053).

Seluruh 13 tabel diuji nyata lewat PostgREST langsung dengan throwaway test
user (Superadmin, Instructor, 2 Agent), mencakup: Instructor create/publish
course sendiri vs Agent ditolak, draft vs published visibility, quiz
question terlihat tapi quiz_options (kunci jawaban) tersembunyi dari Agent
enrolled, cross-agent enrollment/completion isolation, certificate
self-issue diblokir, learning_unlock_progressions tanpa jalur mutasi Agent,
dan FK retroaktif `learning_sessions.course_id`. Tidak ada bug ditemukan
pada batch ini (berbeda dari Fase 1) — desain RLS tervalidasi benar sejak
percobaan pertama. Data uji dibersihkan total setelahnya.

## Fase 3 "100% Tabel" — 0064-0070 (M15 Awarding Engine)

9 tabel "mesin konfigurasi jalur/aturan kelulusan" yang sejak migration
0026 sengaja ditunda ("di luar lingkup literal D13-03... belum punya nomor
residual di checklist manapun"). Dengan batch ini, SELURUH 14 tabel M15
yang dicatat STEP11-B8 §13 "Physical Schema Parity" akhirnya lengkap
(5 dari 0026 + 9 di sini). Sumber kolom: `STEP10-D_ATTRIBUTE_TO_PHYSICAL_
COLUMN_RECONCILIATION.csv`, tanpa deviasi.

- **`0064_m15_awarding_paths.sql`** — `awarding_paths` + `awarding_path_
  versions`. Permission baru `m15.awarding_path_rule.configure`
  (Superadmin/Admin/Manager=ALL SAJA — realisasi downstream dari semantic
  capability inventory STEP11-B8 §10 `awarding.path.manage`/
  `awarding.rule.manage`, yang dokumen sumbernya sendiri menyatakan
  "semantic capability inventory, not a final permission-ID seed"; satu
  permission mencakup SELURUH 7 tabel config engine, pola konsolidasi
  verb sama seperti `ai_providers`/0015).
- **`0065_m15_awarding_rules.sql`** — `awarding_rule_versions` +
  `awarding_path_rules` (junction N:N Path Version <-> Rule Version, ON
  DELETE RESTRICT ke rule version — rule yang masih dipakai tidak boleh
  terhapus). TIDAK ADA permission baru — reuse 0064.
- **`0066_m15_awarding_conditions.sql`** — `awarding_condition_groups` +
  `awarding_conditions` + `awarding_prerequisites`, penutup config engine.
  TIDAK ADA permission baru — reuse 0064. `group_operator`/`condition_type`/
  `operator` semuanya TEXT/VARCHAR bebas TANPA CHECK persis sesuai sumber
  (logika evaluasi AND/OR/pembanding dijalankan di lapisan aplikasi).
- **`0067_m15_award_qualifying_paths.sql`** — provenance yang menaut
  `award_instances` ke `awarding_path_versions` + `qualification_
  evaluations`. TIDAK ADA permission baru — otorisasi diturunkan LANGSUNG
  dari `m15.award.award`/`.manage` yang sudah ada (0026) lewat join ke
  `award_instances.user_id`.
- **`0068_m15_title_presentations.sql`** — tabel M15 terakhir (14/14).
  Permission baru `m15.title_presentation.manage` (Agent=OWN atur tampilan
  title miliknya di profil publik — API-234/235, Superadmin/Admin/
  Manager=ALL moderasi). SELECT publik untuk `active=true` (dikonsumsi
  profil publik M02 sesuai STEP11-B8 §11 boundary), TERPISAH dari
  `award_instances` sendiri (STEP11-B8 §11: "M02 does not issue, revoke,
  qualify, or alter Award").
- **`0069_fix_qualification_award_awarding_fk.sql`** — menutup 2 pasang FK
  yang SENGAJA ditunda sejak 0026: `qualification_evaluations`/
  `award_instances` kolom `awarding_path_version_id`/`awarding_rule_
  version_id` (NULLABLE tetap dipertahankan — NULL masih berarti "evaluasi/
  award manual tanpa mesin konfigurasi formal", sesuai keputusan asli
  0026). `ON DELETE RESTRICT` (pola sama seperti `awarding_path_rules`).
  Diverifikasi lewat test: FK valid berhasil, FK palsu ditolak error 23503.
- **`0070_performance_indexes_fk_phase3.sql`** — index B-tree untuk kolom
  FK di 9 tabel di atas + 4 kolom FK baru dari 0069 (pola sama seperti
  0038/0053/0063).

Seluruh 9 tabel diuji nyata lewat PostgREST langsung dengan throwaway test
user (Superadmin, Agent), membangun SATU rantai config engine utuh dari
ujung ke ujung: title_definitions → awarding_paths → awarding_path_versions
→ awarding_rule_versions → awarding_path_rules (junction) →
awarding_condition_groups → awarding_conditions → awarding_prerequisites,
lalu qualification_evaluations + award_instances dengan FK awarding yang
baru ditutup, award_qualifying_paths (provenance), dan title_presentations
(self-manage + visibility publik `active=true`). Staf-only config
dikonfirmasi (Agent ditolak create awarding_paths, Agent tidak bisa
SELECT awarding_conditions). Tidak ada bug ditemukan pada batch ini. Data
uji dibersihkan total setelahnya.

## Fase 4 "100% Tabel" — 0071-0078 (M14 Commercial, Midtrans sebagai gateway MVP)

8 tabel terakhir dari rencana "100% tabel" — M14 Commercial/Payment/
Entitlement/Reconciliation, PALING SENSITIF dari seluruh Fase 1-4 karena
menyentuh alur pembayaran sungguhan. Dipelajari dari 2 sumber: `STEP10-D_
ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv` (kolom eksak) dan
`STEP11-B7_COMMERCIAL_PAYMENT_ENTITLEMENT_QUOTA_RECONCILIATION` v1.1
(causal chain "Offer → Order → immutable commercial snapshot → Checkout →
Payment → trusted verification → idempotent fulfillment → Entitlement →
Quota/benefit", 8 MVP commercial surfaces, dan konfirmasi eksplisit bahwa
5 tabel M14 lain — `commercial_entitlements`/`quota_capacities`/
`operational_quota_pools`/`quota_allocations`/`quota_usage` — SUDAH ada
sejak 0019). Gateway pembayaran MVP: **Midtrans**, dipelajari dari
`Midtrans_API_Dokumentasi_Detail_2026.pdf` yang diupload user.

**TIDAK ADA permission baru** — 4 permission M14 SUDAH ADA sejak seed 0009
(`m14.commercial_administration.configure`, `.manage_commercial_resources`,
`m14.commercial_purchase_access.access`, `.own_purchase`) — master matrix
50-baris SUDAH mengantisipasi resource commercial generik ini, beda dari
M04 Catalog/M15 Awarding yang butuh permission baru.

- **`0071_m14_promotions_addons_subscriptions.sql`** — `promotions`
  (staff-only config, M11 yang urus representasi publik lewat
  `public_announcement_promotion`), `addons` (katalog produk PUBLIK untuk
  status=active — realisasi "Listing quota add-ons"/"Learning Point
  packages"), `subscriptions` (privat per-user — realisasi "Free
  membership"/"Pro monthly"/"Pro annual").
- **`0072_m14_commercial_orders.sql`** — `commercial_orders`, titik awal
  causal chain. `order_number` dipetakan ke `order_id` payload Midtrans
  Snap.
- **`0073_m14_payment_transactions.sql`** — `payment_transactions`.
  **KEPUTUSAN ENGINEERING BARU** (diminta eksplisit user, bukan dari
  STEP10-D): `payment_state` DIKUNCI ke vocabulary status transaksi
  Midtrans resmi (pending/capture/settlement/deny/cancel/expire/failure/
  refund/partial_refund/chargeback/partial_chargeback/authorize —
  Midtrans PDF §6 "Transaction Status"), `verification_state` dikunci ke
  (unverified/verified/failed) merealisasikan "trusted verification"
  boundary STEP11-B7.
- **`0074_m14_payment_provider_results.sql`** — `payment_provider_results`,
  penyimpanan MENTAH webhook Midtrans. **TIDAK ADA RLS INSERT untuk siapa
  pun TERMASUK staf** — hanya ditulis lewat route webhook admin-client
  dengan validasi signature/shared-secret di level route (pola sama
  seperti webhook M04 Session), bukan lewat RLS permission (RLS tidak bisa
  memvalidasi signature kriptografis).
- **`0075_m14_commercial_fulfillments.sql`** — `commercial_fulfillments`.
  **TIDAK ADA RLS INSERT untuk siapa pun** — realisasi sungguhan lewat
  fungsi SECURITY DEFINER baru di batch REST API nanti (pola sama seperti
  `grant_learning_points_from_purchase()`), STEP11-B7 F11-B7-004 sendiri
  mencatat "generic entitlement grant/revoke/adjust lifecycle route is not
  explicitly evidenced" sebagai CONTROLLED API GAP.
- **`0076_m14_reconciliation_cases.sql`** — `reconciliation_cases`, staff
  penuh. `status` DIKUNCI ke lifecycle yang dievidence eksplisit STEP11-B7
  §13: open/investigating/resolved/rejected/escalated (BUKAN dikarang,
  vocabulary itu ada di dokumen sumber).
- **`0077_fix_commercial_entitlements_source_fk.sql`** — menutup 3 FK yang
  SENGAJA ditunda sejak 0019 (`source_order_id`/`source_payment_
  transaction_id`/`source_fulfillment_id`). `ON DELETE SET NULL` (beda
  dari RESTRICT di FK retroaktif Fase 2/3) — entitlement adalah catatan
  HAK milik user yang harus tetap valid meski sumbernya dihapus.
- **`0078_performance_indexes_fk_phase4.sql`** — index B-tree untuk kolom
  FK di 8 tabel + 3 kolom FK baru dari 0077.

**KEPUTUSAN KEAMANAN PALING PENTING di seluruh rencana "100% tabel"**:
`commercial_orders`/`payment_transactions` SENGAJA TIDAK PUNYA UPDATE untuk
pemilik sama sekali (hanya staf) — `status`/`payment_state`/
`verification_state` HANYA boleh berubah lewat verifikasi server-side
(webhook Midtrans + fungsi fulfillment nanti), BUKAN klien langsung. Kalau
Agent diberi UPDATE scope 'own' pada kolom ini, itu setara celah
self-approval yang ditemukan di `agent_verification_documents` (0055),
TAPI untuk sistem pembayaran: Agent bisa "membayar" tanpa membayar
sungguhan. Diuji nyata dan DIKONFIRMASI TERBLOKIR: Agent mencoba PATCH
`payment_state` miliknya sendiri ke `settlement` — request "berhasil"
(HTTP 204, PostgREST tidak error karena 0 baris cocok RLS), TAPI baris
TIDAK BERUBAH sama sekali (diverifikasi ulang via Superadmin). Midtrans
PDF §4/§10 eksplisit: "Jangan menjadikan callback frontend sebagai
satu-satunya sumber kebenaran status pembayaran."

Seluruh 8 tabel diuji nyata lewat PostgREST + SQL langsung (untuk 2 tabel
webhook-only yang tidak punya jalur INSERT client sama sekali) dengan
throwaway test user: katalog publik vs privat, cross-agent isolation,
CHECK vocabulary Midtrans, blokir self-approval payment (test paling
kritis), zero-insert-path `payment_provider_results`/
`commercial_fulfillments` dikonfirmasi (bahkan Superadmin ditolak insert
langsung), CHECK lifecycle reconciliation, dan FK retroaktif
`commercial_entitlements`. Tidak ada bug ditemukan — desain RLS
tervalidasi benar sejak percobaan pertama. Data uji dibersihkan total.

**Dengan Fase 1-4 selesai, seluruh 94 entitas logis STEP10-D + 3 tabel
ADD-NEW di luar STEP10-D (api_idempotency_keys, notification_templates,
partnership_learning_results) = 97 tabel total sudah ada di Supabase.**
REST API layer untuk M04 Catalog/M15 Awarding/M14 Commercial menyusul
sebagai batch terpisah — M14 khususnya butuh implementasi Midtrans Snap
API + webhook handler sungguhan sebelum bisa diuji end-to-end nyata
(sandbox Midtrans, bukan lagi migration/RLS saja).
