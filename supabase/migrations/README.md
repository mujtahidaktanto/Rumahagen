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

## `0079_m14_commercial_functions.sql` — batch REST API M14 Commercial (ADD-NEW)

Bukan tabel baru — merealisasikan 4 potongan business logic yang SENGAJA
ditunda oleh migration Fase 4 sendiri untuk "batch REST API nanti":

- **`cancel_commercial_order(p_order_id)`** — realisasi API-182, dijanjikan
  di komentar 0072. Pemilik order atau staf; hanya order `status='pending'`
  yang bisa dibatalkan.
- **`fulfill_commercial_order(p_payment_transaction_id)`** — realisasi
  "idempotent fulfillment" (STEP11-B7 §5/§10), dijanjikan di komentar 0075.
  Hanya bisa dipanggil dari `service_role` (webhook, tidak ada sesi user
  sama sekali) atau staf — dideteksi lewat helper baru
  `is_service_role_request()` (baca klaim JWT `role`, BUKAN `has_permission()`
  yang butuh `auth.uid()`). Memverifikasi `payment_state IN ('settlement',
  'capture')` + `verification_state='verified'` sebelum memproses, idempoten
  lewat `idempotency_key='fulfill:<payment_transaction_id>'`. **SCOPE MVP:
  hanya addon-sourced order** (`order.addon_id NOT NULL`) — subscription
  purchase TIDAK direalisasikan karena tidak ada tabel katalog/harga
  subscription plan yang dievidence (`subscriptions`/0071 adalah catatan
  INSTANCE milik user, bukan katalog). Untuk addon `capacity_type=
  'learning_point'`, memanggil `grant_learning_points_from_purchase()`;
  untuk capacity_type lain, membangun rantai
  `commercial_entitlements→quota_capacities→operational_quota_pools→
  quota_allocations` (0019) secara generik.
- **`grant_learning_points_from_purchase()` diperbarui** (CREATE OR
  REPLACE, signature tidak berubah) — merealisasikan TODO eksplisit yang
  didokumentasikan di komentar migration 0025: kini bisa dipanggil lewat
  `is_superadmin()` (manual/testing, perilaku lama tetap jalan),
  `service_role` (webhook), ATAU `p_idempotency_key` yang match
  `fulfillment_key` sah di `commercial_fulfillments` (pipeline
  `fulfill_commercial_order()` otomatis) — menutup gap yang sejak 0025
  membuat fungsi ini hanya bisa dipanggil manual oleh Superadmin.
- **`allocate_quota_capacity()`/`consume_quota_capacity()`** — realisasi
  API-194/195. `allocate` staff-only (mengisi `quota_allocations` yang RLS
  0019-nya sengaja tanpa INSERT policy). `consume` "Server-authorized
  domain operation" (staf/`service_role` saja, BUKAN endpoint client bebas
  — beda dari `consume_refresh_allowance()`/0020 yang dipanggil Agent
  sendiri lewat `refresh_listing()` khusus `capacity_type='listing_refresh'`).

**Proaktif, ditemukan SEBELUM ada bug nyata** (pola sama seperti Fase 1/
`agent_verification_documents`-0055): RLS INSERT `commercial_orders`/
`payment_transactions` (0072/0073) memang `WITH CHECK` permission, TAPI
TIDAK membatasi NILAI kolom `status`/`payment_state`/`verification_state`/
`confirmed_at`/`paid_at`/`verified_at` yang boleh diisi klien saat INSERT —
seorang Agent bisa langsung INSERT order dengan `status='confirmed'` atau
payment dengan `payment_state='settlement'` lewat PostgREST mentah, TANPA
pernah membayar sungguhan. Ditutup lewat 2 trigger BEFORE INSERT
(`enforce_commercial_order_insert_pending()`/
`enforce_payment_transaction_insert_pending()`) yang memaksa nilai
pending/unverified untuk siapa pun selain `service_role`/staf — **diuji
nyata dan dikonfirmasi terblokir** (`RAISE EXCEPTION`, bukan diam-diam
seperti pola RLS 0055 sebelumnya) sebelum REST API dibangun, bukan sesudah
ditemukan lewat testing.

REST API layer untuk M04 Catalog/M15 Awarding/M14 Commercial (25 endpoint
API-175-199, lihat `apps/web/README.md` untuk narasi lengkap termasuk
integrasi Midtrans Snap API + webhook SUNGGUHAN yang diuji end-to-end
terhadap Sandbox asli) kini SEMUANYA sudah dibangun — modul demi modul
REST API selesai untuk ketiga modul terakhir dari rencana "100% tabel".

## `0080_m13_multi_credential_connections.sql` — ADD-NEW (kolom kredensial generik)

Bukan tabel baru — 2 kolom tambahan di `agent_ai_connections` (M13, 0016),
ditemukan lewat evaluasi nyata provider Cloudinary untuk BYOK M13 (upload/
edit foto listing): skema lama hanya punya SATU field kredensial
(`encrypted_api_key`), cukup untuk provider model-AI single-bearer-token
(Gemini, dst.) tapi TIDAK CUKUP untuk Cloudinary yang butuh TIGA kredensial
sekaligus (`cloud_name` + `api_key` + `api_secret`).

- **`public_identifier VARCHAR(150)`** — plaintext, TIDAK dienkripsi (memang
  bukan rahasia — mis. Cloudinary `cloud_name` selalu terlihat apa adanya
  di setiap delivery URL publik). Boleh ditampilkan balik ke agent tanpa
  dekripsi.
- **`encrypted_secondary_key VARCHAR(500)`** — dienkripsi PERSIS seperti
  `encrypted_api_key` (mekanisme AES-256-GCM yang sama, `lib/crypto/
  byok.ts`, tidak ada skema kripto baru). Untuk kredensial rahasia KEDUA
  yang sebagian provider butuhkan (mis. Cloudinary `api_secret`, dipakai
  membuat signature SHA-1 upload — `encrypted_api_key` menyimpan Cloudinary
  `api_key`-nya sendiri).

**Keputusan desain**: kedua kolom GENERIK (bukan `cloudinary_cloud_name`/
`cloudinary_api_secret`) — dipakai ulang provider multi-kredensial mana pun
di masa depan, konsisten dengan filosofi M13 provider-agnostic sejak
0015/0016. Provider single-key membiarkan keduanya NULL, tidak ada
perubahan perilaku untuk koneksi yang sudah ada. **TIDAK ADA perubahan
RLS/permission baru** — kolom baru tunduk pada policy `agent_ai_connections_
select/_self_insert/_self_update/_admin_force` yang sudah ada, sama seperti
`encrypted_api_key`.

Diuji nyata: buat koneksi single-key (Gemini) DAN multi-kredensial
(Cloudinary) berdampingan dengan Developer Partner test user — respons API
menyertakan `public_identifier` tapi tidak pernah membocorkan kolom
terenkripsi manapun; rotasi `secondary_key`+`public_identifier` via PUT;
`/test` endpoint dikonfirmasi mendekripsi KEDUA kolom terenkripsi
sekaligus; query langsung ke DB mengonfirmasi `encrypted_secondary_key`
tersimpan dalam format `iv.authTag.ciphertext` (bukan plaintext). Data uji
dan 2 user test dibersihkan total setelah pengujian.

## `0081_m14_multi_capacity_addons.sql` — ADD-NEW (kuota majemuk per addon)

Ditemukan lewat testing nyata addon "10 listing tambahan + 50 kuota
refresh" (batch sebelumnya): `fulfill_commercial_order()` (0079) hanya
memproses SATU pasang `capacity_type`/`capacity_value` — kolom rigid di
`addons`, evidenced STEP10-D. Angka kedua yang dititipkan di `configuration`
JSONB TIDAK PERNAH benar-benar ter-grant sebagai kuota nyata (cuma
metadata deskriptif) — dikonfirmasi lewat pengujian end-to-end (order →
Midtrans Sandbox settlement → fulfillment), lalu dilaporkan apa adanya
sebagai keterbatasan, bukan diam-diam dianggap sudah beres.

- **`addons.additional_capacities JSONB NOT NULL DEFAULT '[]'`** — array
  objek `{"capacity_type","capacity_value"}` untuk kapasitas TAMBAHAN di
  luar kolom primer. Kolom GENERIK (bukan `capacity_type_2`/`capacity_
  value_2`) — menampung N kapasitas sekaligus, dipakai ulang addon manapun
  di masa depan, pola sama seperti `public_identifier`/`encrypted_secondary_
  key` di 0080. Default array kosong — addon lama (single-capacity)
  perilakunya tidak berubah sama sekali.
- **`grant_addon_capacity(...)`** — fungsi baru, satu unit "grant kapasitas"
  (entitlement → quota_capacity → operational_quota_pool → quota_allocation,
  atau `grant_learning_points_from_purchase()` untuk `capacity_type=
  'learning_point'`), diekstrak dari badan `fulfill_commercial_order()`
  versi 0079 supaya dipanggil berulang tanpa duplikasi logika.
  `entitlement_type` diberi suffix `capacity_type` (mis. `KODE:listing_
  refresh`) — perubahan kecil disengaja supaya tidak ambigu saat satu
  addon menghasilkan >1 entitlement (tidak ada data produksi yang
  terdampak, tabel masih kosong).
- **`fulfill_commercial_order(p_payment_transaction_id)`** — `CREATE OR
  REPLACE`, signature sama (evidenced/dipanggil dari webhook 0073).
  Sekarang memproses kapasitas PRIMER (kolom rigid, seperti sebelumnya)
  DAN loop `additional_capacities`, masing-masing lewat
  `grant_addon_capacity()`. `commercial_fulfillments.outcome_reference`
  bisa berisi >1 referensi, digabung `;` (TEXT longgar, tidak butuh kolom
  baru — pola sama seperti field TEXT longgar lain di skema ini).

Diuji ulang nyata dengan addon BARU "50 kuota refresh (primer) + 25
kuota listing tambahan (additional_capacities)": order → checkout (Snap
token Sandbox asli) → webhook settlement (signature SHA512 asli) →
`fulfill_commercial_order()` — hasil terverifikasi lewat query langsung:
**2 baris** `commercial_entitlements`/`quota_capacities`/
`operational_quota_pools`/`quota_allocations` dari SATU fulfillment,
`granted_quantity`/`operational_quantity` masing-masing 50 dan 25 —
KEDUANYA kuota nyata dan usable, bukan metadata dekoratif. Data uji
(addon, order, payment, fulfillment, entitlement×2, quota chain×2, user
test) dibersihkan total dan diverifikasi kosong setelah pengujian.

## `0082_enforce_account_status_in_has_permission.sql` — FIX (gap keamanan, ditemukan lewat audit pra-Bolt.new)

Ditemukan lewat audit keamanan sebelum migrasi UI ke Bolt.new:
`public.users.status` (evidenced STEP10-D, dideklarasikan eksplisit di
komentar 0002 sebagai "bagian dari... lifecycle akun yang menjadi
tanggung jawab aplikasi") **TIDAK PERNAH benar-benar ditegakkan di mana
pun** — di-grep di seluruh migration, `users.status` tidak pernah dipakai
satu RLS policy pun, dan `lib/api/handler.ts` (Next.js) hanya memverifikasi
sesi Supabase Auth valid (`getUser()`), tidak pernah query `users.status`.
Akibatnya Agent yang di-suspend/rejected staf tapi JWT-nya belum
expired/di-revoke tetap lolos SEMUA pemeriksaan `has_permission()` seolah
statusnya tidak pernah berubah.

**Keputusan perbaikan**: ditutup di `has_permission()` (0006), BUKAN di
`lib/api/handler.ts` — sesuai prinsip R-02 migration 0006 sendiri
("SATU-SATUNYA tempat keputusan otorisasi dihitung", dipanggil ~68 file
migration lain) DAN karena rencana pindah ke Bolt.new (UI baru memanggil
Supabase LANGSUNG dengan anon key, bukan lewat REST API Next.js) membuat
perbaikan di level Next.js saja tidak cukup — kalau hanya ditutup di
`handler.ts`, panggilan langsung ke Supabase dari UI Bolt tetap menembus
lubang yang sama. Menutup di `has_permission()` otomatis berlaku ke SEMUA
jalur.

`has_permission()` sekarang mengecek `status` LEBIH DULU (sebelum bypass
`is_superadmin()`, supaya Superadmin yang akunnya sendiri disuspend tidak
diam-diam tetap punya akses penuh) — `suspended`/`rejected` selalu
`FALSE`. **`pending_review` SENGAJA tidak diblok**: itu status DEFAULT
agent baru yang justru butuh scope OWN baseline-nya (mis.
`m01.verification_document.manage='own'`, 0049) untuk mengunggah dokumen
verifikasi — kalau ikut diblok, agent baru tidak akan pernah bisa
menyelesaikan verifikasi (deadlock onboarding).

Diuji nyata 5 skenario lewat `POST /users/verification-documents` dan
`GET /authorization/roles`: (1) agent baru default `pending_review` →
**201, tetap bisa upload** (tidak regresi); (2) agent yang sama di-suspend
staf, upload lagi → **403 FORBIDDEN** (gap tertutup); (3) agent
`rejected` → **403** juga; (4) Superadmin `active` → tetap `200` dengan
baris data (scope `all` normal, tidak terdampak); (5) Superadmin YANG SAMA
di-suspend → **0 baris** (bypass `is_superadmin()` ikut tertutup, bukan
cuma jalur scope biasa). Data uji (3 user, 1 dokumen) dibersihkan total
dan diverifikasi kosong setelah pengujian.

## `0083_users_default_active_no_pending_review_gate.sql` — KEPUTUSAN PRODUK (bukan fix, arah perbaikan terbalik dari audit wireframe)

Lahir dari audit `docs/design/wireframes/` vs skema+API yang sudah dimigrasi
(`audit/WIREFRAME_VS_MIGRATED_BACKEND_AUDIT.md`, Finding A1): wireframe WF-01.05
(Authentication)/WF-01.06 (KTP Deferred Completion) sejak awal mengunci kontrak
"OTP VERIFIED → ACCOUNT ACTIVE" TANPA gate Pending Review — berlawanan dengan
`public.users.status` yang sejak 0002 mendefault user baru ke `'pending_review'`.

**Dicek langsung ke `docs/core/current/` (bukan cuma dikonfirmasi pemilik produk)**:
ternyata BUKAN wireframe yang menyimpang dari Core, melainkan migration 0002 yang
sejak awal menyimpang dari keputusan Core sendiri yang sudah LOCKED jauh sebelumnya:
- `00-governance/STEP-00/PRE-00-C_M01_IDENTITY_CONFLICT_GATE_FULL_v1.1.md`
  (status "PASS — LOCKED"): "There is no PENDING_REVIEW gate for account
  activation... OTP VERIFIED → ACCOUNT ACTIVE."
- `01-business-rules/STEP-08/RUMAHAGEN_BUSINESS_RULES_BASELINE_CONSOLIDATED_
  STEP08_v1.1.md` (M01-CI-009/STEP05-001, "LOCKED / CORE CANONICAL") — rumusan sama.
- `07-reconciliation/STEP-14-.../STEP14_CROSS_DOCUMENT_CONSISTENCY_MATRIX...csv`
  — direvalidasi PASS di rekonsiliasi FINAL Core.

Penyimpangannya bersumber dari `STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_
RECONCILIATION.csv` yang melestarikan definisi fisik LAMA `DEFAULT 'pending_review'`
apa adanya (ditandai `PRESERVE_EXACT_PHYSICAL_CORROBORATION` — verifikasi bentuk
fisik saja, TIDAK direkonsiliasi ulang ke keputusan semantik PRE-00-C), lalu disalin
verbatim ke migration 0002. Inkonsistensi internal Core ini tidak pernah tertangkap
sampai audit wireframe-vs-backend sesi ini. Wireframe WF-01 (dibangun mengikuti
PRE-00-C dengan benar) sudah cocok dengan Core sejak awal — migration 0002 fisik-lah
yang keliru. Migration ini karenanya adalah KOREKSI ke Core yang sudah lama terkunci,
bukan override/deviasi baru. Dikonfirmasi ulang oleh pemilik produk saat gap ini
dilaporkan: akun langsung `active` begitu OTP terverifikasi, dokumen verifikasi
(`agent_verification_documents`, 0049) boleh diisi belakangan tanpa memblokir
aktivasi.

**Scope**: HANYA `ALTER TABLE public.users ALTER COLUMN status SET DEFAULT 'active'`.
Nilai `'pending_review'` TETAP ada di CHECK constraint (0002, tidak diubah) — untuk
pemakaian manual staf di masa depan kalau perlu, pola sama seperti nilai enum tak
terpakai yang tetap dipertahankan di `listings.status` (evidenced 0018). Tidak ada
backfill — tabel `users` kosong (belum ada user produksi) saat migration ini
diterapkan. `has_permission()` (0082) tidak perlu diubah — pengecualian
`pending_review` di sana sudah benar sejak awal (tidak memblokir, bukan
mem-block-nya), cuma sekarang praktis tidak akan pernah dipakai user baru manapun.

Diuji nyata: user baru dibuat tanpa menyebut `status` sama sekali → langsung
`active` (dikonfirmasi lewat insert langsung DAN lewat `GET /users/me`); dokumen
verifikasi KTP tetap bisa diupload setelah aktif (`POST /users/verification-
documents` → 201, tidak digating). Data uji dibersihkan total dan diverifikasi
kosong setelah pengujian.

## `0084_fix_m09_admin_authority_permission_bugs.sql` — FIX (3 bug permission aktif, ditemukan lewat deep scan Core vs migrasi)

Lahir dari deep scan menyeluruh Core (`docs/core/current/`, 580 file `.md`/`.csv`
langsung terbaca) vs 83 migration yang sudah diterapkan
(`audit/CORE_VS_MIGRATED_BACKEND_AUDIT.md`) — 3 dari 4 temuan "Tier 1" (bug
permission AKTIF SEKARANG, bukan cuma gap fitur), semuanya bersumber dari
`docs/core/current/00-governance/STEP-00/PRE-00-K_M09_ADMINISTRATION_AUTHORITY_
GATE_FULL_v1.0.md` yang LOCKED tapi tidak konsisten dengan seed permission 0009 /
RLS 0015 / RLS 0076:

- **T1-1 Audit Log (M09-R04)**: Gate mengunci Superadmin=ALL, **Manager=ALL**,
  **Admin=NONE**. Seed 0009 baris 375-376 justru memberi ALL ke Admin (bukan
  Manager) — RLS `audit_logs_select` (0012) sudah benar memakai `has_permission()`,
  jadi cukup diperbaiki di `role_permissions` (hapus grant Admin, tambah grant
  Manager), tidak perlu ubah RLS.
- **T1-2 Provider Catalogue (M09-R10)**: Gate mengunci Superadmin=ALL,
  Manager=NONE, **Admin=ALL**. Seed 0009 hanya memberi Superadmin. BERBEDA dari
  T1-1: RLS `ai_providers_write_superadmin` (0015) TIDAK memakai `has_permission()`
  sama sekali — hardcode `is_superadmin()` langsung (menyalahi R-02, satu sumber
  keputusan otorisasi). Diperbaiki dua lapis: tambah grant Admin di
  `role_permissions` UNTUK `m09.provider_catalogue.mutation` +
  `m13.provider_catalogue.create/edit/enable/disable/retire`, DAN ganti RLS-nya
  memakai `has_permission('m09.provider_catalogue.mutation')` (DROP+CREATE POLICY,
  nama tetap sama supaya jejak perbaikan jelas).
- **T1-3 Reconciliation Manual Correction (M09-R09)**: Gate memisahkan
  Review/Escalate (boleh Admin+Superadmin) dari Manual Correction — transisi kasus
  ke status FINAL `resolved`/`rejected` yang mengoreksi data komersial —
  **Superadmin-only**. RLS 0076 sebelumnya SATU policy `FOR ALL` lewat SATU
  permission gabungan (`m14.commercial_administration.manage_commercial_resources`,
  Admin+Superadmin), tidak ada pembedaan. Ditambah permission BARU
  `m14.commercial_administration.manual_correction` (Superadmin-only), RLS
  `reconciliation_cases` dipecah jadi 4 policy (SELECT/INSERT/UPDATE/DELETE) —
  UPDATE ke `resolved`/`rejected` butuh permission tambahan ini, transisi lain
  (investigating/escalated) tetap Admin+Superadmin seperti semula.

Diuji nyata end-to-end lewat REST API sungguhan dengan 4 role test user
(superadmin/admin/manager/agent): Admin `GET /admin/audit-logs` → **200, 0 baris**
(sebelumnya bisa lihat); Manager → **200, ada baris** (sebelumnya tidak bisa sama
sekali); Admin `POST /ai-providers` → **201 berhasil** (sebelumnya pasti 403);
Admin `POST /admin/commercial/reconciliation/{id}/resolve` (status=resolved) →
**403 ditolak**; Superadmin → **200 berhasil**. Data uji (4 user, 1 ai_provider, 1
reconciliation_case) dibersihkan total dan diverifikasi kosong.

## `0085_add_agent_project_claim_withdrawn_status.sql` — FIX (bug fungsional, agent_project_claims kekurangan status)

Temuan Tier 1 ke-4 dari audit yang sama, domain berbeda (M06) jadi dipisah dari
0084. `docs/core/current/00-governance/STEP-00/PRE-00-H_M06_DEVELOPER_PROJECT_
MARKETING_CLAIM_GATE_FULL_v1.1.md` §17-18/§46/§51 mengunci siklus klaim proyek
5-state termasuk `PENDING → WITHDRAWN` (Agent membatalkan klaim sendiri yang masih
pending) — TERPISAH dari `REVOKED` (mencabut klaim yang SUDAH disetujui, keputusan
staf/Developer Partner). Migration 0035 (seed Fase 1) hanya punya 4 state, RLS
`agent_project_claims_review` (0041) diam-diam mengandalkan `revoked` dobel-fungsi
untuk kedua kasus — bug fungsional nyata: kalau ada jalur yang coba
`status='withdrawn'` mengikuti kontrak Core, akan GAGAL di CHECK constraint.

Ditambah nilai `'withdrawn'` ke CHECK constraint, permission BARU
`m06.claim.withdraw` (HANYA role `agent`, scope `own` — withdraw murni aksi
self-service pemilik klaim, beda dari revoke yang juga bisa staf/Developer
Partner), RLS `agent_project_claims_review` diperluas dengan OR-clause permission
baru ini. Zod `claimStatusSchema` (`apps/web/lib/validation/claims.ts`) juga
diperbarui menambah `'withdrawn'` — tanpa ini, request akan ditolak Zod sebelum
sempat menyentuh database sama sekali.

Diuji nyata: Agent buat klaim (`POST /developer-projects/{id}/claim` → 201, status
`pending`) lalu tarik sendiri (`PUT /claims/{id}` dengan `status=withdrawn` →
**200, status benar-benar berubah jadi `withdrawn`**). Data uji (developer partner,
project, claim) dibersihkan total.

## Tier 2 — `0086`-`0091`: state/model terkunci yang hilang total dari skema

Lanjutan `audit/CORE_VS_MIGRATED_BACKEND_AUDIT.md` — 4 temuan Tier 2 (model
yang dikunci Core tapi TIDAK ADA cara merepresentasikannya sama sekali di
skema, beda dari Tier 1 yang "cuma" salah konfigurasi permission), plus 2
migration perbaikan tambahan yang ketemu SAAT menguji nyata ketiganya.

### `0086_add_listing_suspended_enforcement_state.sql`

Gate `PRE-00-E` §10 mengunci `suspended` sebagai *enforcement state*
pelanggaran platform ("bukan pengganti pending_review") — `listings_status_
check` (0018) tidak pernah punya nilai ini. Ditambahkan ke CHECK constraint,
plus permission BARU `m03.listing.suspend` (staf-only: Superadmin/Admin/
Manager, TIDAK diberikan ke Agent) — mengikuti pola yang sama persis seperti
transisi ke `published` (permission KHUSUS, bukan `m03.listing.update`
generik). Trigger `enforce_listing_lifecycle_rules()` (0018) diperluas satu
IF block baru untuk menggerbangi transisi ke/dari `suspended`.

### `0087_add_organization_closing_suspended_states.sql`

Gate `PRE-00-N` §6 mengunci siklus `ACTIVE → CLOSING → CLOSED` (dua langkah
eksplisit) PLUS state enforcement terpisah `SUSPENDED` — `organizations_
status_check` (0005) cuma biner `active`/`closed`. `closing`/`closed` tetap
lewat RLS `organizations_manage` yang sudah ada (self-service leader,
`created_by=auth.uid()`) — TIDAK diubah. `suspended` BEDA: trigger BARU
`enforce_organization_lifecycle_rules()` menggerbanginya staf-only
(Superadmin/Admin, konsisten dengan role yang sudah dipakai policy 0007 yang
sama, bukan `has_permission()` baru supaya tidak campur konvensi dalam satu
tabel). Trigger yang sama juga menutup konsekuensi lain yang dikunci gate:
join-request (`organization_invitations`) PENDING otomatis `cancelled`
begitu organisasi masuk CLOSING/SUSPENDED/CLOSED.

### `0088_add_event_registration_approval_mode.sql` (+ fix keamanan di `0091`)

Gate `PRE-00-G` (M05-DELTA-011/012, LOCKED, "two approval layers must not be
collapsed" — approval PUBLIKASI event beda dari approval REGISTRASI event):
default Registrasi AUTO-CONFIRM, Event Owner boleh override CLOSED atau
MANUAL APPROVAL — skema lama tidak punya kolom apa pun untuk ini. Ditambah
`events.registration_approval_mode` (`auto_confirm`/`manual_approval`/
`closed`, diatur lewat UPDATE biasa `m05.event.update` yang sudah ada, bukan
permission enforcement baru — ini konfigurasi normal, bukan moderasi) dan
nilai `pending_approval` baru di `event_registrations.status`. Trigger BARU
`enforce_event_registration_approval_mode()` menolak INSERT total kalau
mode=closed, memaksa status awal `pending_approval` kalau mode=manual_
approval (mengabaikan apa pun yang dikirim klien, kecuali `waitlist` yang
tetap dihormati — sumbu kapasitas berbeda dari approval).

**Bug ditemukan saat testing nyata, ditutup `0091`**: versi awal trigger di
atas TIDAK `SECURITY DEFINER` — lookup `SELECT registration_approval_mode
FROM events` di dalamnya berjalan dengan privilese REGISTRANT (bukan pemilik
event), tunduk RLS `events_select` yang tidak mengizinkan lihat event
published+public/orang lain. Registrant mendaftar ke event pihak lain yang
belum published (kasus NORMAL) gagal SELECT sepenuhnya → `v_mode` jadi NULL
→ seluruh pengecekan closed/manual_approval diam-diam TIDAK PERNAH berlaku.
Dikonfirmasi lewat test nyata sebelum diperbaiki: RSVP ke event manual_
approval tetap `registered`; RSVP ke event closed tetap berhasil 201.
Ditutup dengan menambah `SECURITY DEFINER` — pola sama seperti alasan
`admin_force_provider_connection()` dsb.: ini lookup *data integrity*, bukan
keputusan otorisasi (otorisasi sesungguhnya tetap RLS `event_registrations_
insert`, tidak berubah).

### `0089_m07_bank_master_dbr_share_revoke.sql` (+ fix keamanan di `0091`) — GAP TERBESAR

Gate `PRE-00-I` §8-13/§20-28 + sub-step khusus `PRE-00-I-1` (RESOLVED —
PASS/LOCKED) menyatakan model lama satu threshold DBR global (`dbr_config`)
EKSPLISIT "obsolete/RECONCILE-SUPERSEDED", diganti model **Bank Master +
bank-specific configuration**: Admin configure Bank Master → User pilih bank
→ M07 resolve threshold bank itu → simulasi → snapshot historis `threshold_
used` (tidak boleh berubah retroaktif walau threshold bank diubah admin
belakangan) → hasil boleh di-Share (recipient VIEW-ONLY lewat token) →
Creator boleh Revoke (invalidasi seketika).

- **Tabel baru `public.banks`** — kardinalitas TIDAK dibatasi (gate: batas 4
  di UI cuma batas TAMPILAN, bukan batas data). View: Manager/Admin/Agent
  (permission baru `m07.bank_master.view`); Configure: Admin+Superadmin
  SAJA (permission baru `m07.bank_master.configure`, BUKAN Manager — beda
  dari `m07.dbr.domain_operations` lama yang memberi Manager=ALL untuk
  operasi simulasi).
- **`dbr_simulations` diperluas**: `bank_id` (FK, `ON DELETE RESTRICT` —
  bank berhistori tidak boleh dihapus, pensiunkan lewat `status=inactive`),
  `threshold_used` (snapshot OTOMATIS lewat trigger, klien tidak bisa
  mengirim nilai sendiri), `share_token`/`shared_at`/`revoked_at`.
- **Share/Revoke lewat fungsi `SECURITY DEFINER`** (`share_dbr_simulation()`,
  `revoke_dbr_simulation_share()`, `get_shared_dbr_simulation()`), BUKAN RLS
  UPDATE biasa — `dbr_simulations` tetap *append-only* untuk field inti
  (0052), share/revoke satu-satunya mutasi yang diizinkan lewat jalur
  terpisah yang jelas cakupannya (pola sama seperti `refresh_listing()`).
  `get_shared_dbr_simulation()` TIDAK mengecek `auth.uid()` sama sekali —
  Gate §27: share "does not create a new platform role", recipient tidak
  wajib punya akun platform. Akses recipient sengaja TIDAK lewat RLS row-
  visibility biasa (RLS tidak bisa menegakkan "hanya yang tahu token").
- `dbr_config` (0008) TIDAK DIHAPUS — dipertahankan sebagai artefak lama
  yang sudah tidak dipakai simulasi baru, pola sama seperti nilai enum tak
  terpakai yang tetap dipertahankan di tempat lain.
- **Companion fix di kode aplikasi** (bukan migration): `POST /dbr-
  simulations` sebelumnya membaca threshold/rate dari `dbr_config` global —
  diperbarui membaca dari `banks` (bank yang dipilih klien via `bank_id`,
  kolom baru wajib di Zod schema), atau endpoint akan rusak total begitu
  `bank_id` jadi NOT NULL.

**Bug ditemukan saat testing nyata, ditutup `0091`** (pola identik dengan
bug event di atas, ditutup proaktif walau belum pernah gagal di test karena
`banks_select` kebetulan mengizinkan semua role yang bisa INSERT
`dbr_simulations`): trigger `enforce_dbr_simulation_bank_snapshot()` juga
diperkuat `SECURITY DEFINER` untuk mencegah kelas bug yang sama kalau
matrix permission `banks_select` berubah di masa depan.

### `0090_fix_listings_update_rls_for_suspend.sql`

Bug ditemukan saat testing nyata `0086`: trigger `enforce_listing_
lifecycle_rules()` mengecek `m03.listing.suspend` DI DALAM trigger dengan
benar, TAPI RLS `listings_update` (0018) USING clause HANYA mengecek
`m03.listing.update` (superadmin+agent-own) — baris sudah difilter habis
RLS SEBELUM trigger sempat jalan, jadi Manager/Admin yang punya permission
suspend tetap dapat 404 (bukan benar-benar bisa suspend). Dikonfirmasi
nyata: Manager `PATCH /listings/{id}/status` (suspended) → 404 sebelum
diperbaiki. Ditutup dengan menambah `OR has_permission('m03.listing.
suspend', agent_id)` ke USING clause.

### `0091_fix_event_registration_approval_trigger_security_definer.sql`

Menutup 2 bug `SECURITY DEFINER` yang ditemukan saat testing nyata `0088`/
`0089` — detail lengkap di masing-masing sudah dijelaskan di atas.

---

Diuji nyata end-to-end untuk keempat Tier 2 + 2 fix tambahan sekaligus,
semuanya lewat REST API sungguhan dengan 5 role test user (superadmin/
admin/manager/agent×2): Agent gagal self-suspend listing (`403`), Manager
berhasil (`200`, status benar-benar `suspended`); Leader organisasi gagal
self-suspend org sendiri (`400`, pesan error trigger persis), join-request
pending yang sudah dibuat otomatis jadi `cancelled` begitu org di-suspend
(lewat service role, simulasi staf); RSVP ke event `manual_approval` →
status registrasi otomatis `pending_approval`; RSVP ke event `closed` →
`409` ditolak; Manager `POST /banks` → `403` (RLS menolak insert), Admin →
`201` berhasil; Agent buat simulasi DBR dengan `bank_id` → `threshold_used`
otomatis terisi PERSIS sama dengan `dbr_threshold_percent` bank yang
dipilih; `share_dbr_simulation()` menghasilkan token, `get_shared_dbr_
simulation()` lewat token itu (dipanggil TANPA sesi, seperti anonim) berhasil
membaca data yang sama; `revoke_dbr_simulation_share()` lalu `get_shared_
dbr_simulation()` dengan token yang sama → gagal (akses tercabut). Semua
data uji (5 user, listing, organisasi, invitation, 2 event, registrasi,
bank, simulasi DBR) dibersihkan total dan diverifikasi kosong setelah
pengujian.

## Tier 3 — `0092`/`0093`: belum diimplementasi, tapi sudah ditandai Core sendiri sebagai ditunda

Lanjutan `audit/CORE_VS_MIGRATED_BACKEND_AUDIT.md` — 4 temuan Tier 3,
prioritas lebih rendah dari Tier 1/2 karena dokumen gate-nya SENDIRI sudah
mengakui ini residual/CONTROLLED (bukan penyimpangan diam-diam seperti pola
0002/0083), tapi tetap ditutup sebelum UI terkait dibangun di Bolt.new.

### `0092_add_agent_profile_region_organization_context.sql`

Gate `PRE-00-D` §11.2 (`M02-CI-021`, AUGMENT/LOCK) mengunci alamat Agent
Profile memakai model region Indonesia (Provinsi/Kota administratif, Area
tetap bebas teks — "must not collapse the Indonesian regional hierarchy
into one unrestricted administrative field"); §11.3 (`M02-CI-022`,
PRESERVE/CLARIFY) mengunci "Organization Name" merepresentasikan konteks
organisasi Agent TAPI eksplisit "M02 presents, M12 remains the authoritative
Organization/Membership truth". Ditambahkan `province_id`/`city_id` (FK ke
`ref_provinces`/`ref_cities` yang sudah ada — `coverage_area` yang sudah ada
TETAP dipertahankan sebagai "Area" bebas teks, tidak perlu kolom baru untuk
itu) dan `organization_id` (FK ke `organizations` — REFERENSI, bukan salinan
teks nama, supaya tidak duplikasi/basi terhadap M12). Ketiganya nullable
(kelengkapan profil opsional), tidak ada permission/RLS baru (sudah tercakup
`m02.agent_profile.update` yang ada). Zod `upsertAgentProfileSchema`
diperbarui menambah ketiga field.

Diuji nyata: `PUT /users/profile` dengan `province_id`/`city_id`/
`organization_id` → **201, ketiganya tersimpan benar**, `coverage_area`
("Area") tetap berfungsi sebagai teks bebas terpisah. Data uji dibersihkan
total.

### `0093_m13_connection_uniqueness_unverified_state.sql` (+ 2 fix companion di kode aplikasi)

Gate `PRE-00-O` §9 mengunci SATU koneksi hidup per provider per Agent/User
(belum ada unique guard fisik); §7-8 mengunci siklus `CREATE → UNVERIFIED →
test → VALID/ACTIVE` (AI ditolak selagi UNVERIFIED) — skema lama langsung
default `'active'` tanpa state `unverified` sama sekali. Ditambahkan nilai
`unverified` ke CHECK constraint + DEFAULT baru, trigger BARU
`enforce_agent_ai_connection_initial_state()` yang memaksa status awal
`unverified` TERLEPAS apa yang dikirim klien saat INSERT, dan unique partial
index `agent_ai_connections_one_live_per_provider` pada `(user_id,
provider_id) WHERE status NOT IN ('disconnected','revoked')` — user harus
disconnect/kena revoke dulu sebelum bisa membuat koneksi baru ke provider
yang sama.

**2 fix companion ditemukan SAAT testing nyata**:
- `POST /ai-connections/{id}/test` sebelumnya menolak apa pun selain status
  `'active'` — begitu default berubah jadi `'unverified'`, ini akan
  DEADLOCK TOTAL (koneksi baru tidak akan pernah bisa lolos test karena
  syaratnya "harus sudah active", padahal test JUSTRU jalan yang membuatnya
  active). Diperbaiki: terima `'unverified'` MAUPUN `'active'` (re-test),
  dan transisikan `unverified→active` saat berhasil.
- `POST /ai-connections` tidak memetakan error `23505` (pelanggaran unique
  index baru) ke respons yang ramah — client dapat `500` generik alih-alih
  `409`. Ditambahkan pemetaan eksplisit, pola sama seperti route claim.

Diuji nyata: koneksi baru (role Developer Partner — permission BYOK memang
digrant ke role itu, bukan Agent, sesuai komentar migration 0016) →
**status `unverified`**; koneksi KEDUA ke provider yang sama selagi yang
pertama masih hidup → **409 ditolak**; `POST .../test` pada koneksi
`unverified` → **200, status jadi `active`**; disconnect koneksi pertama
lalu buat koneksi baru ke provider yang sama → **201 berhasil** (uniqueness
tidak menghalangi re-connect setelah disconnect). Data uji (2 user,
organisasi, provider, 3 koneksi) dibersihkan total dan diverifikasi kosong.

## `0094`/`0095` — deep scan lanjutan Core: 65 file `.docx`/`.zip` (STEP-09/11/12) vs migrasi

Lanjutan `audit/CORE_DOCX_ZIP_VS_MIGRATED_BACKEND_AUDIT.md` — pass sebelumnya
(`0084`-`0093`) sengaja melewatkan 65 file `.docx`/`.zip` (STEP-09
Architecture, STEP-11 API Sync, STEP-12 Authorization/RBAC) karena butuh
diekstrak dulu. Setelah diekstrak dan dibaca 5 agent paralel, ditemukan 2
hal yang butuh perbaikan kode nyata (selain beberapa gap fitur besar yang
didokumentasikan tapi butuh keputusan produk, bukan bug — lihat file audit).

### `0094_reconcile_m09_provider_catalogue_audit_log_with_step12.sql`

**Koreksi atas `0084`.** `STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv`
(baru bisa dibaca penuh setelah diekstrak dari zip) + Conflict Register-nya
sendiri (S12-01-001) mengunci KEBALIKAN dari 2 dari 3 perbaikan `0084`:
Audit Log seharusnya Admin=ALL/Manager=NONE (bukan sebaliknya), Provider
Catalogue seharusnya Superadmin-only (bukan Admin=ALL) — `0084` mengikuti
`PRE-00-K` (gate STEP-00 yang lebih lama), padahal proyek ini SENDIRI sudah
menetapkan preseden di `0008_dbr_config.sql`: dokumen STEP-12 yang lebih
granular/baru menang atas wording STEP-00 yang lebih lama. Dikonfirmasi
independen oleh 2 agent yang membaca dokumen konflik berbeda
(`STEP12-01_ROLE_PERMISSION_CONFLICT_REGISTER.csv` dan `STEP12-C/D_CROSS_
MODULE_..._CONFLICT_REGISTER.csv`, keduanya menyimpulkan hal sama).

Membalik 2 dari 3 grant `0084` (Reconciliation Manual Correction, temuan
ke-3, TIDAK disentuh — tidak dipertentangkan Master Matrix): Audit Log
kembali Admin=ALL/Manager=NONE; Provider Catalogue kembali Superadmin-only
(RLS `ai_providers_write_superadmin` dikembalikan ke hardcode
`is_superadmin()`, bukan `has_permission()`). Diuji nyata: Admin `GET
/admin/audit-logs` → 200 dengan baris (dikembalikan), Manager → 200/0
baris; Admin `POST /ai-providers` → 403 (dikembalikan), Superadmin → 201.

### `0095_add_postgres_rate_limit_log.sql`

Kontradiksi arsitektur ditemukan di STEP-09: ADR-018 (Technical Decisions,
LOCKED) mengunci "Rate limiting/application cache = Supabase Postgres
`rate_limit_log`", dengan baris di atasnya eksplisit melarang "cache vendor
baru". `lib/api/rate-limit.ts` versi lama pakai in-memory `Map` — komentarnya
sendiri menyarankan solusi produksi "Upstash Redis", persis yang dilarang
ADR itu sendiri.

Ditambahkan tabel `rate_limit_log` (satu baris per key, upsert atomik) +
fungsi `check_and_increment_rate_limit()` (SECURITY DEFINER, `GRANT EXECUTE`
ke `anon`+`authenticated` supaya request tanpa login pun kena rate limit
berbasis IP). `lib/api/rate-limit.ts` diganti total memanggil RPC ini
(fungsi jadi `async`), `lib/api/handler.ts` disesuaikan `await`. Diuji nyata:
baris tersimpan di Postgres (dikonfirmasi query langsung, bukan in-memory);
65 request cepat → **429 tepat di request ke-60** (limit 60/menit) dengan
`retryAfterSeconds` benar; counter di DB bertambah sesuai jumlah request.

## `0096` — M01 Identity/Auth REST API: trigger sinkronisasi `auth.users` ↔ `public.users`

Menutup Gap #1 dari `audit/CORE_DOCX_ZIP_VS_MIGRATED_BACKEND_AUDIT.md`: 10
endpoint M01 (STEP11-B1) — register/verify-otp/resend-otp/login/oauth
google/refresh/logout/logout-all/forgot-password/reset-password — 0/10
dibangun, dan grep repo-wide mengonfirmasi tidak ada mekanisme apa pun yang
membuat baris `public.users` begitu `auth.users` dibuat.

### `0096_auth_users_sync_trigger.sql`

Trigger `on_auth_user_created` (AFTER INSERT) + `on_auth_user_email_confirmed`
(AFTER UPDATE) di `auth.users`, fungsi `handle_auth_user_sync()` SECURITY
DEFINER. INSERT membuat baris `public.users` dengan `role_id` default
`'agent'` (satu-satunya role yang STEP11-B1/STEP13-B gambarkan sebagai
subjek self-registration publik) dan `status` ikut default kolom (`'active'`,
migration 0083); UPDATE menyinkronkan `email_verified_at` begitu
`email_confirmed_at` terisi. **Dipilih trigger DB, bukan insert manual di
route `/auth/register`**, karena Google OAuth (salah satu dari 10 endpoint
yang sama) tidak pernah melewati route custom manapun — user diarahkan
langsung ke Supabase Auth dan balik dengan sesi sudah jadi; kalau
`public.users` cuma dibuat di `/auth/register`, signup via Google akan lolos
tanpa `role_id`/`status` dan `has_permission()` gagal permanen untuk user
itu. Diuji nyata via Admin API (buat user → baris `public.users` langsung
ada dengan role `agent`/status `active`; confirm email → `email_verified_at`
tersinkron), data uji dihapus dan cascade delete dikonfirmasi bersih.

### 10 route `app/api/auth/*` (M01 STEP11-B1 API-001 s.d. API-010)

Semua membungkus method native `supabase.auth.*` (client ber-sesi cookie
`lib/supabase/server.ts`, BUKAN admin) lewat `withApiHandler()`, dengan
`lib/api/auth-error.ts` baru memetakan pesan error Supabase Auth ke
`ApiError` seragam (R-02: satu tempat mapping, bukan diulang per route).
`login` juga menulis `users.last_login_at` (kolom ada sejak migration 0002,
belum pernah ada penulisnya) lewat client ber-sesi yang sama — diizinkan RLS
`users_update_self` (migration 0007).

`oauth/google` mengembalikan URL otorisasi (`{ url }}`) untuk di-redirect
client, bukan melakukan redirect sendiri (tidak ada frontend browser di repo
ini) — plus route baru `app/api/auth/callback/route.ts` (GET, di luar 10
endpoint terkunci, infrastruktur pendukung) yang menukar PKCE `code` jadi
sesi. `@supabase/ssr` default `flowType: 'pkce'`, jadi tautan email
konfirmasi/reset password JUGA lewat jalur code (bukan token di URL
fragment) — `forgot-password` mengarahkan `redirectTo` ke
`/api/auth/callback?redirect_to=<tujuan akhir>` supaya code bisa ditukar di
server yang sama yang memegang cookie code-verifier-nya, BARU dineruskan ke
tujuan akhir. **Koreksi ditemukan lewat tes nyata** (bukan asumsi):
rancangan awal `reset-password` menerima `access_token`+`refresh_token` di
body — ternyata tautan reset yang benar-benar dikirim memakai PKCE `code`
lewat `/api/auth/callback`, sehingga sesi recovery SUDAH terpasang di cookie
saat user sampai di endpoint ini; skema diubah jadi hanya `{ new_password }`
mengandalkan sesi cookie yang ada (pola sama seperti `/auth/logout`).

Diuji nyata end-to-end pakai domain terverifikasi sendiri
(`qa-m01-auth-*@rumahagen.com`, dibaca lewat log terkirim Resend, bukan
Admin API generate_link untuk OTP kode — Admin API generate_link dipakai
HANYA untuk membuktikan kode OTP 8-digit yang dikembalikan `email_otp`
identik dengan yang bisa dipakai `verifyOtp()`): register → baris
`public.users` otomatis ada; verify-otp dengan kode OTP asli → sesi
terbentuk + `email_verified_at` tersinkron; login → sesi + `last_login_at`
terisi; refresh → sesi baru; logout (sesi cookie ada) → 200, tanpa sesi →
401; logout-all mencabut sesi global; forgot-password untuk email
terdaftar/tidak terdaftar → **respons identik** (tidak bocor status akun);
reset-password lewat rantai email asli → tautan Supabase → `/api/auth/
callback` (menukar code jadi sesi) → `POST reset-password` dengan cookie itu
→ password benar-benar berubah (dikonfirmasi login gagal dengan password
lama, berhasil dengan password baru); email/password salah format → 422;
Idempotency-Key hilang pada endpoint yang mewajibkannya → 422. Data uji
(1 auth user + baris `public.users` terkait, idempotency keys) dihapus
total dan diverifikasi kosong setelahnya.

**Dependensi eksternal yang BELUM diselesaikan** (butuh konfigurasi dashboard
manual, sama seperti SMTP Resend sebelumnya):
- Provider Google harus diaktifkan di Supabase Dashboard > Authentication >
  Providers dengan Client ID/Secret dari Google Cloud Console, dan URL App
  ini + `/api/auth/callback` didaftarkan sebagai authorized redirect URI di
  kedua sisi — tanpa ini `/auth/oauth/google` mengembalikan URL otorisasi
  yang valid tapi Google akan menolak di ujungnya.
- Email template "Confirm signup"/"Reset password" Supabase saat ini masih
  bawaan (tombol tautan `{{ .ConfirmationURL }}`), BUKAN kode 6-8 digit
  (`{{ .Token }}`) yang ditampilkan ke user — endpoint `/auth/verify-otp`
  SUDAH benar menerima kode (dibuktikan lewat `email_otp` di atas), tapi
  user asli yang menerima email HARI INI akan melihat tombol tautan, bukan
  kode untuk diketik. Kalau UX yang diinginkan adalah user mengetik kode
  (sesuai desain endpoint terkunci `/auth/verify-otp`), template email perlu
  diubah manual di Dashboard untuk menampilkan `{{ .Token }}`.
