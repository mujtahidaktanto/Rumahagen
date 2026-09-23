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

**Update (2026-09-19): Google OAuth SELESAI dikonfigurasi.** User membuat
OAuth client "web" di Google Cloud Console (project "rumahagen"), mendaftarkan
`https://jawywzavznjekxxlhwqo.supabase.co/auth/v1/callback` (redirect URI
milik Supabase, BUKAN `/api/auth/callback` milik app ini — Google mengirim
hasil login ke Supabase dulu, baru Supabase redirect balik ke app) sebagai
authorized redirect URI, lalu memasukkan Client ID+Secret ke Supabase
Dashboard > Authentication > Providers > Google. Diverifikasi nyata: URL
otorisasi dari `/auth/oauth/google` dibuka di browser → Google menampilkan
layar sign-in asli ("Sign in to continue to
jawywzavznjekxxlhwqo.supabase.co"), BUKAN error `redirect_uri_mismatch` —
konfigurasi kedua sisi terbukti benar.

**Update lanjutan (2026-09-19): login Google SUNGGUHAN diselesaikan user
sendiri** (bukan disimulasikan) lewat panel browser sesi ini — memakai akun
Google pribadi user. Dikonfirmasi lewat query langsung: baris `auth.users`
baru dengan `raw_app_meta_data->>'provider' = 'google'` muncul, DAN trigger
`on_auth_user_created` (migration 0096) otomatis membuat baris `public.users`
(role `agent`, status `active`, `email_verified_at` langsung terisi) —
**ini justru pembuktian paling penting untuk trigger tsb**, karena jalur
OAuth memang TIDAK PERNAH melewati route `/api/auth/register` sama sekali;
kalau sinkronisasi hanya ada di route itu, akun OAuth ini akan lolos tanpa
`role_id`/`status` dan `has_permission()` gagal permanen. Akun uji (identitas
Google asli user) dihapus lagi setelah dikonfirmasi, cascade delete bersih.

**Update lanjutan (2026-09-19): template email "Confirm signup" SUDAH diubah
ke format kode.** User mengganti body template di Supabase Dashboard dari
tombol tautan `{{ .ConfirmationURL }}` menjadi kode `{{ .Token }}`
tampil besar. Diverifikasi dengan register nyata ke email pribadi user:
email diterima berisi kode 8 digit asli (bukan tautan), kode itu berhasil
dipakai lewat `POST /auth/verify-otp` → sesi terbentuk. Template
"Reset password" SENGAJA TIDAK diubah dengan cara sama, karena
`/auth/reset-password` dirancang mengikuti alur klik-tautan (PKCE code lewat
`/api/auth/callback`), bukan alur ketik-kode — mengubah template itu ke
format kode akan membuat endpoint reset-password tidak cocok lagi dengan
emailnya.

**Dependensi eksternal M01 yang tersisa**: tidak ada lagi. Google OAuth dan
kedua template email (signup=kode, reset=tautan, sesuai desain
masing-masing endpoint) sudah dikonfigurasi dan diverifikasi nyata.

## `0097` — M11 SEO/Discovery: sitemap, robots.txt, admin config, reindex

Menutup Gap #2 dari `audit/CORE_DOCX_ZIP_VS_MIGRATED_BACKEND_AUDIT.md`: 7
route M11 (STEP11-B9 §5/§6) — `GET /sitemap-index.xml`,
`GET /sitemap-listings.xml`, `GET /sitemap-agents.xml`,
`GET /sitemap-developer-projects.xml`, `GET /robots.txt`,
`POST /admin/seo/reindex`, `GET/PUT /admin/config/seo` — 0/7 dibangun
sebelumnya. `GET /banners/promotions` (API-135) dan `POST /admin/banners`
(API-136) yang juga disebut di STEP11-B9 TERNYATA sudah ada sejak lama
(`app/api/banners/route.ts`, `app/api/admin/banners/route.ts`) — bukan bagian
gap ini.

**Sengaja TIDAK dibangun** (STEP11-B9 §8/§9/§13 eksplisit melarang): CRUD
Static Public Content dan lifecycle Announcement/Promotion (appeal/approve/
archive dst.) — keduanya "CONTROLLED API GAP" yang Core sendiri instruksikan
untuk TIDAK diciptakan rute-nya ("Do not invent POST/PUT/PATCH... routes").

### `0097_seo_config.sql`

Tabel baru `seo_config` (baris tunggal, pola sama seperti `dbr_config` 0008)
— bukan entity STEP10-D (dicek, tidak ada), didesain baru. **Tidak ada
permission baru dibuat** (menegakkan D13-15/preseden 0011): STEP11-B9 §4.2
sendiri menyatakan M09 mengonfigurasi SEO "through the **existing**
configuration authority" — dibaca sebagai instruksi eksplisit memakai ulang
`m09.system_configuration.view`/`.manage` (sudah ada sejak 0009/0011,
Superadmin-only), bukan permission baru. SELECT dibuka **publik** (bukan
Superadmin-only seperti `system_configs`) karena isinya memang harus dibaca
tanpa sesi oleh `robots.ts`/`sitemap-*.xml` — tidak ada data sensitif di
tabel ini; hanya WRITE yang dibatasi Superadmin.

### Route baru

- `app/api/admin/config/seo/route.ts` (CORE-CFG-SEO-01) — GET/PUT baris
  tunggal `seo_config`, pola identik `admin/config/dbr`.
- `app/api/admin/seo/reindex/route.ts` (API-155) — mencatat
  `last_reindex_requested_at/_by`. **Catatan jujur**: TIDAK ada integrasi
  nyata ke Google Search Console/Bing IndexNow (tidak ada kredensial
  tersedia) — endpoint ini murni pencatatan administratif, bukan pemicu
  crawl sungguhan. Didokumentasikan eksplisit di komentar route supaya tidak
  ada yang mengira ini benar-benar memanggil API mesin pencari.
- `app/sitemap-index.xml/route.ts` + `sitemap-listings.xml` +
  `sitemap-agents.xml` + `sitemap-developer-projects.xml` — folder literal
  (bukan konvensi `app/sitemap.ts` bawaan Next yang cuma hasilkan SATU file)
  karena Core mengunci 4 nama file terpisah. Filter publik PERSIS sama
  dengan kondisi RLS masing-masing tabel yang sudah ada (`listings.status=
  'published'` per 0018, `agent_profiles.profile_visibility='public'` per
  0029, `developer_projects.status IN ('active','coming_soon','sold_out')`
  per 0034) — anon client dipakai apa adanya, tidak ada bypass RLS.
  Menghormati `seo_config.sitemap_enabled` (saklar darurat, kembalikan
  urlset/index kosong kalau dimatikan).
- `app/robots.ts` — konvensi resmi Next.js. `seo_config.robots_global_noindex`
  jadi saklar darurat "disallow semua" tanpa perlu deploy ulang.
- `lib/seo/sitemap.ts` — util XML bersama (escape, builder urlset/sitemapindex,
  `SITE_URL` default `https://rumahagen.com` karena belum ada env var domain
  publik di proyek ini, bisa di-override `NEXT_PUBLIC_SITE_URL`). Pola URL
  kanonik `/listing/{slug}`, `/agent/{public_slug}`, `/project/{slug}` adalah
  ASUMSI wajar (Core tidak mengunci struktur URL frontend, belum ada
  frontend dibangun) — gampang diubah di satu tempat kalau UI Bolt.new nanti
  pakai pola lain.

Diuji nyata: GET config tanpa sesi → 200 (SELECT publik, sesuai desain); PUT
tanpa sesi → 403; PUT dengan sesi Superadmin sungguhan → 200, `sitemap_enabled=
false` langsung membuat `sitemap-index.xml` kosong, `robots_global_noindex=
true` langsung membuat `robots.txt` isi `Disallow: /`; PUT/reindex dengan
sesi role `agent` (bukan Superadmin) → 403 di keduanya; `sitemap-agents.xml`
dites dengan baris `agent_profiles` publik sungguhan (insert sementara) →
XML berisi URL yang benar dengan `lastmod`, dihapus lagi setelahnya. Data uji
(2 auth user + 1 baris `agent_profiles`) dihapus total, `seo_config`
dikembalikan ke nilai default, `last_reindex_requested_by` otomatis ter-NULL
lewat `ON DELETE SET NULL` setelah user uji dihapus (bukan bug — perilaku FK
yang diharapkan).

## M13 AI Invocation: `POST /ai-assistant/chat` (Gap #3, tanpa migration baru)

Menutup Gap #3 dari `audit/CORE_DOCX_ZIP_VS_MIGRATED_BACKEND_AUDIT.md`.
**Tidak ada migration SQL baru** — `ai_providers`/`agent_ai_connections`
(0015/0016/0080/0093) sudah lengkap; yang belum ada murni kode aplikasi:
route + adapter provider.

Dibedakan eksplisit dari `POST /ai-connections/{id}/test` yang HANYA
memvalidasi dekripsi kredensial (lihat komentar route itu sendiri —
"TIDAK benar-benar memanggil API provider AI eksternal"). `/ai-assistant/
chat` adalah invocation AI **sungguhan pertama** di repo ini: kredensial
BYOK yang di-decrypt benar-benar dipakai memanggil provider asli, biaya
dibebankan ke akun provider milik Agent/Developer Partner sendiri (BYOK,
bukan M14/akun RumahAgen — sesuai STEP11-B10 §11/§14).

### Otorisasi — tanpa permission baru

Core §11 mensyaratkan "AI invocation requires applicable feature permission
+ own valid/active connection". Dicek langsung ke `public.permissions`:
tidak ada satu pun permission code `ai_invocation`/`chat` di katalog sumber.
"Applicable feature permission" dibaca sebagai tanggung jawab FITUR BISNIS
spesifik yang nanti memanggil endpoint generik ini (di luar scope Gap #3),
BUKAN sesuatu untuk dikarang di sini (D13-15). Endpoint ini menegakkan
bagian kedua syaratnya ("own valid/active connection") lewat RLS
`agent_ai_connections_select` yang sudah ada (0016) — otomatis membatasi
hanya Superadmin+Developer Partner (satu-satunya role dengan
`m13.own_byok_connection.view` di seed 0009) — ditambah pengecekan eksplisit
`status='active'` (Gate PRE-00-O §7-8: "AI DITOLAK selagi UNVERIFIED").

### File baru

- `lib/ai/adapters.ts` — adapter OpenAI/Anthropic/Gemini. Kontrak request
  (`messages[]` gaya OpenAI) provider-agnostic; translasi ke bentuk asli
  tiap provider terjadi HANYA di sini (STEP11-B10 §3: "Provider-specific
  payloads remain adapter/provider-internal"). Provider yang code-nya tidak
  cocok salah satu dari 3 ini ditolak jelas ("belum didukung teknis"),
  bukan ditebak/dipaksakan.
- `app/api/ai-assistant/chat/route.ts` — decrypt `encrypted_api_key`
  (`lib/crypto/byok.ts`, sudah ada), panggil adapter, map error provider ke
  409 CONFLICT dengan pesan asli providernya (bukan 500 generik — Agent
  perlu tahu persis kenapa kunci/kuota miliknya ditolak).
- `aiChatSchema` baru di `lib/validation/ai-providers.ts`.

### Diuji nyata (bukan mock)

Alur penuh: Superadmin buat provider `gemini-qa` → Developer Partner buat
BYOK connection dengan **API key Google AI Studio ASLI milik user** →
`/ai-connections/{id}/test` (unverified→active) → `POST /ai-assistant/chat`
→ **Gemini benar-benar membalas "Halo"** (2x, direproduksi). Ditemukan &
diperbaiki lewat tes ini: default model `gemini-1.5-flash` sudah di-retire
Google per 2026-09 (dikonfirmasi via `GET /v1beta/models` ke akun asli) —
diganti ke alias `gemini-flash-latest` supaya tidak basi lagi.

Jalur negatif juga dites nyata (bukan asumsi): tanpa sesi → 401; koneksi
tidak ditemukan/milik user lain → 404 (isolasi multi-tenant RLS, dites
dengan 2 Developer Partner berbeda); koneksi `unverified` → 409; provider
tanpa adapter (`unknownvendor-qa`) → 422; API key OpenAI palsu → **panggilan
jaringan nyata ke `api.openai.com`**, OpenAI menolak dengan pesan asli
("Incorrect API key provided...") diteruskan sebagai 409. Data uji (3 auth
user, 3 provider, koneksi BYOK termasuk yang berisi key Gemini asli)
dihapus total dan diverifikasi kosong — key asli tidak pernah disimpan di
luar kolom terenkripsi yang sudah dihapus.

## `0098` — M15 Award Appeal (Gap #4): `award_appeals` ADD-NEW

Menutup Gap #4 dari `audit/CORE_DOCX_ZIP_VS_MIGRATED_BACKEND_AUDIT.md`:
STEP11-B8 mengunci API-230/231/232 (`POST/GET /awards/{id}/appeals`,
`POST .../{appeal_id}/decide`) sebagai "PRESERVE EXACT CURRENT CONTRACT",
tapi tabelnya TIDAK ADA di 14 tabel fisik M15 manapun yang dievidensi B8 §13
— dicek satu per satu, tidak ada `award_appeals`. `restore` (API-233) sudah
ada sejak awal tapi tanpa appeal di depannya, alur jadi tidak konsisten.

### `0098_m15_award_appeals.sql`

Tabel baru `award_appeals` — **bukan entity STEP10-D** (Core mengunci
endpoint tapi tidak pernah mendefinisikan skemanya, sama seperti pola
`dbr_config`/`seo_config` sebelumnya). STEP10-A1 sendiri menulis "M15:
Appeal/history remain process/history reuse" dan STEP11-B8 §13 menulis
"Award lifecycle history reuses canonical audit_logs; no duplicate
appeal-history subsystem is introduced" — dibaca sebagai: tabel ini HANYA
menyimpan STATE saat ini (pending/approved/rejected), histori keputusan
tetap lewat `log_audit_event()` (0012) yang sudah ada, bukan tabel/kolom
histori tambahan.

**Tidak ada permission baru** (D13-15): `decide` memakai ulang
`m15.award.revoke`/`m15.award.manage` — permission yang SAMA yang sudah
dipakai `awards/{id}/restore` untuk alasan yang sama (tidak ada
`m15.award.appeal_decide` terpisah di master matrix). **Kritis**: dipanggil
TANPA `owner_id` (`has_permission('m15.award.revoke')`, bukan
`has_permission('m15.award.revoke', user_id)`) — karena `has_permission()`
(0006 baris 104-105) mengembalikan FALSE untuk scope `'own'` kalau
`p_owner_id` NULL, ini otomatis MENGECUALIKAN Agent (yang scope-nya `'own'`
untuk permission ini) dari RLS `award_appeals_decide`. Kalau dipanggil
DENGAN `owner_id = award_instances.user_id` seperti pola RLS
`award_instances_update`, pemilik award akan bisa memutuskan appeal-nya
sendiri — kelas bug self-approval yang sudah beberapa kali ditemukan &
diperbaiki di proyek ini sebelumnya (mis. 0079).

Dua trigger: `enforce_award_appeal_eligibility` (BEFORE INSERT — appellant
harus pemilik award, award harus berstatus `revoked`; pola sama seperti
`enforce_award_requires_authority_scope` 0026 yang perlu membaca tabel
lain) dan `enforce_award_appeal_decision_final` (BEFORE UPDATE — sekali
diputuskan approved/rejected, tidak bisa diubah lagi, `decided_at` diisi
otomatis bukan dari body request). Unique index parsial: satu appeal
`pending` hidup per award (boleh appeal lagi setelah yang lama diputuskan).

Route baru: `app/api/awards/[id]/appeals/route.ts` (GET+POST) dan
`app/api/awards/[id]/appeals/[appealId]/decide/route.ts` (POST). `decide`
SENGAJA TIDAK memanggil `/restore` otomatis saat `approved` — keduanya
tetap endpoint terpisah sesuai kontrak masing-masing (API-232 vs API-233,
authority yang sama memanggil `/restore` secara eksplisit sebagai langkah
lanjutan), tidak menambah efek samping tersirat yang tidak dievidensi Core.

Diuji nyata end-to-end: appeal pada award `active` (belum revoked) → 409
(trigger eligibility); revoke award → appeal berhasil (201); **pemilik
award mencoba memutuskan appeal-nya sendiri → RLS menolak (404, bukan
403, karena baris memang tidak terlihat sama sekali oleh RLS — bukan celah
info)**; appeal kedua selagi satu masih pending → 409; agent lain yang
tidak terkait → GET appeals kosong (isolasi RLS) dan POST appeal ditolak
"award_id tidak ditemukan" (RLS award_instances menyembunyikan award
revoked dari non-pemilik, appellant palsu tidak pernah melihat baris
sumbernya — tidak bocor informasi keberadaan award orang lain); Superadmin
decide `approved` → 200, tercatat di `audit_logs`; re-decide appeal yang
sama → 409 (keputusan final); appeal baru setelah yang lama diputuskan →
201 (index unik tidak menghalangi); unauthenticated → 401; **follow-up
`POST /awards/{id}/restore` setelah appeal disetujui → 200, status award
benar-benar berubah `revoked`→`restored`** — membuktikan alur
appeal→decide→restore kini benar-benar tersambung utuh. Data uji (3 auth
user, 1 title, 1 award, 2 appeal) dihapus total dan diverifikasi kosong.

## M09 `GET /admin/reports/export` (Gap #5, tanpa migration baru)

Menutup Gap #5 dari `audit/CORE_DOCX_ZIP_VS_MIGRATED_BACKEND_AUDIT.md`.
**Tidak ada migration SQL baru** — permission `m09.administrative_export.export`
sudah di-seed Superadmin-only sejak `0009`, yang belum ada murni route-nya.
Aktivasi antrian `GET /admin/agents/pending` (bagian lain Gap #6 di audit)
DIKONFIRMASI TIDAK dibangun — dikonfirmasi eksplisit ke user bahwa
keputusan produk `0083` (hapus gate Pending Review) tetap berlaku, bukan
dibalik.

### Sumber data export: `audit_logs`, bukan dump seluruh database

`PRE-00-K` (§9 guardrail): "M09 does not create generic cross-domain CRUD"
dan "Domain-specific export remains domain-owned" — M09 TIDAK memiliki
wewenang export data spesifik modul lain (listings/courses/dst). Satu-satunya
data administratif lintas-modul yang benar-benar dimiliki M09 sendiri adalah
`audit_logs` (M09-R04) — jadi "Global Administrative Export" diimplementasi
sebagai versi **download CSV penuh** dari data yang sama dengan
`GET /admin/audit-logs` (filter `entity_type`/`action`/`user_id`/
`organization_id` yang sama), BUKAN dump seluruh database.

### Otorisasi LEBIH KETAT dari `/admin/audit-logs`

RLS `audit_logs_select` memakai `m09.administrative_audit_log.view`
(Superadmin+Manager, M09-R04). Tapi `M09-R11` mengunci **export**
Superadmin-ONLY ("Global Administrative Export is Superadmin-only",
`PRE-00-K` guardrail #9) — Manager boleh LIHAT tapi TIDAK boleh EXPORT. RLS
tabel yang sama tidak bisa berbeda per-endpoint, jadi permission dicek
EKSPLISIT di kode route (`supabase.rpc('has_permission', {p_action_code:
'm09.administrative_export.export'})` lewat client bersesi asli — pertama
kali fungsi ini dipanggil langsung dari TypeScript, bukan hanya dari dalam
policy RLS) SEBELUM memakai `createAdminClient()` untuk query tanpa
batasan RLS Manager-inclusive itu — pola ini PERSIS yang didokumentasikan
di header `lib/supabase/admin.ts` sendiri ("HARUS tetap melakukan
pengecekan has_permission()... sebelum memanggil ini").

### File baru

- `lib/api/csv.ts` — util escape CSV RFC 4180 dasar (tidak ada library CSV
  di `package.json`, kebutuhannya sederhana).
- `app/api/admin/reports/export/route.ts` — GET, respons `text/csv` +
  `Content-Disposition: attachment` (BUKAN amplop JSON `{data, meta}` —
  sengaja tidak dibungkus `withApiHandler`, sama seperti
  `app/sitemap-*.xml/route.ts`). Batas 5000 baris per panggilan (pengaman
  praktis, bukan aturan bisnis Core — Superadmin bisa mempersempit lewat
  filter yang sama dengan `/admin/audit-logs`).

Diuji nyata: tanpa sesi → 403; **Manager → 403 di export TAPI tetap 200 di
`/admin/audit-logs`** (membuktikan M09-R04 vs M09-R11 benar-benar dua
batas berbeda, bukan cuma teori); Superadmin → 200, CSV asli terunduh
berisi baris `audit_logs` sungguhan dari database (bukan data palsu),
kolom JSONB (`old_value`/`new_value`) ter-escape benar; filter
`entity_type` teruji hanya mengembalikan baris yang cocok. Baris
`audit_logs` yang tercipta dari tes M15 sesi ini (bukan dari fitur lain)
dihapus setelah diverifikasi lewat export ini, baris `audit_logs` lama
dari sesi kerja sebelumnya (M14/M04/M13) dibiarkan apa adanya (bukan milik
tes ini, audit trail tidak dihapus sembarangan).

## `0099` — M07 DBR: 5 endpoint STEP11-B10 (config, save-as-prospect, admin-simulations, export-pdf, market-insights)

Ditemukan saat user bertanya soal gap "generate PDF" di M06 — riset
menunjukkan M06 Approval Claim PDF memang `CONTROLLED GAP` (Core melarang
invent route), TAPI STEP11-B10 §4 M07 punya 5 endpoint LOCKED/PRESERVE yang
ternyata belum dibangun sama sekali: `GET /calculator/dbr/config`,
`POST /calculator/dbr/{id}/save-as-prospect`, `GET /admin/dbr-simulations`,
`GET /calculator/dbr/{id}/export-pdf`, `GET /market-insights/suburb`. Belum
pernah masuk daftar 5 gap sebelumnya karena audit lama fokus M01/M11/M13/
M15/M09.

### `0099_m07_dbr_save_as_prospect.sql`

`dbr_simulations` SENGAJA tidak punya RLS UPDATE sama sekali sejak `0052`
("hasil simulasi historis/append-only"). STEP10-D sendiri mengunci
`prospect_name`/`prospect_phone` sebagai kolom NULLABLE langsung di
`DBR_SIMULATIONS` (bukan entity PROSPECT terpisah) — dibaca sebagai:
"save as prospect" = melampirkan nama/telepon ke simulasi yang sudah ada
(mis. dihitung anonim dulu, baru ditandai sebagai prospek setelah agent
bicara ke calon pembeli), bukan membuat entity baru. Policy UPDATE baru
(memakai ulang `m07.dbr.domain_operations`, tidak ada permission baru) +
trigger `enforce_dbr_simulation_prospect_only_update` yang menolak
perubahan ke kolom APA PUN selain `prospect_name`/`prospect_phone` —
diuji nyata lewat UPDATE langsung SQL mencoba mengubah `property_price`,
ditolak trigger. Immutabilitas kalkulasi tetap utuh.

### `lib/dbr/pdf.ts` + `export-pdf` — pakai `pdf-lib`

Satu-satunya library PDF yang "Approved" di
`W4-02A.6.7_DEPENDENCY_MANIFEST` (STEP-09-D) — bukan pilihan bebas, dicek
dulu ke ADR sebelum memilih. PDF dibuat **on-the-fly per request, TIDAK
dipersist ke Supabase Storage** (repo ini belum punya integrasi Storage
sama sekali di modul manapun — menambahnya adalah pekerjaan arsitektur
terpisah, di luar cakupan menutup gap endpoint ini). Kolom
`dbr_simulations.pdf_export_url` (sudah ada sejak `STEP10-D`) **TIDAK
diisi** oleh implementasi ini — didokumentasikan eksplisit sebagai
keputusan cakupan, bukan diam-diam diabaikan.

### `market-insights/suburb` — keputusan rekayasa, bukan data dikarang

Tidak ada definisi semantik "market insight" di mana pun di korpus Core
selain nama endpoint itu sendiri (dicek menyeluruh: STEP10 dictionary
kosong, tidak ada entity `MARKET_INSIGHT`). Diimplementasi sebagai agregat
harga listing **published** per `district_id` (avg/min/max price, avg
price/sqm, dikelompokkan per `property_type`+`transaction_type`) — murni
agregat dari data `listings` yang sudah publik lewat RLS yang sudah ada,
bukan tabel/data baru. Publik (tanpa sesi).

### `admin-dbr-simulations` + `config`

`GET /admin/dbr-simulations` — route admin terpisah dengan filter
`agent_id` tambahan (RLS `m07.dbr.domain_operations` yang sama, ALL scope
untuk staf sudah otomatis mengembalikan semua baris; route
self-service `GET /dbr-simulations` yang sudah ada TIDAK punya filter
`agent_id`, jadi route admin ini tetap punya nilai tambah, bukan duplikat
murni). `GET /calculator/dbr/config` — daftar bank aktif (tabel `banks` +
RLS `banks_select` sudah ada sejak `0089`, hanya belum ada route yang
memakainya untuk tujuan ini).

**Temuan tambahan (di luar 5 endpoint yang diminta, dilempar sebagai task
terpisah)**: tidak ada SATU PUN route untuk membuat/mengubah baris `banks`
— RLS `banks_manage` (Admin+Superadmin) sudah ada sejak `0089` tapi tidak
terjangkau HTTP sama sekali. Satu-satunya cara mengisi Bank Master sampai
sekarang adalah SQL langsung (dipakai untuk data uji sesi ini).

Diuji nyata end-to-end: `GET /calculator/dbr/config` mengembalikan bank
aktif sungguhan; `save-as-prospect` mengubah `prospect_name`/`_phone` saja
(field lain identik); **PDF ASLI diverifikasi terbuka & terbaca** — semua
angka (harga, cicilan, DBR%, nama bank, nama+telepon prospek) cocok
dengan data sungguhan; isolasi lintas-agent (agent lain tidak bisa lihat/
export/save-as-prospect simulasi orang lain, semuanya 404); admin melihat
SEMUA simulasi + filter `agent_id` berfungsi, agent biasa di
`/admin/dbr-simulations` hanya melihat scope OWN-nya (kosong kalau tidak
punya); `market-insights/suburb` diuji dengan 2 listing published
sungguhan → agregat (avg/min/max/price-per-sqm) dihitung benar secara
matematis, district kosong → 404, param hilang → 422. Data uji (3 auth
user, 1 bank, 1 simulasi, 2 listing) dihapus total dan diverifikasi
kosong.

## Bank Master CRUD: `GET/POST /banks`, `GET/PUT /banks/{id}` (tanpa migration baru)

Menutup temuan sampingan dari batch `0099` di atas: RLS `banks_select`/
`banks_manage` (permission `m07.bank_master.view`/`.configure`) sudah ada
sejak `0089`, tapi tidak ada SATU PUN route yang memakainya — satu-satunya
cara mengisi Bank Master adalah SQL langsung. Tidak ada migration baru
(RLS+permission sudah lengkap), murni `lib/validation/banks.ts` +
`app/api/banks/route.ts` (GET+POST) + `app/api/banks/[id]/route.ts`
(GET+PUT).

`GET /banks` SENGAJA tidak difilter status (beda dari `GET /calculator/
dbr/config` yang hanya menampilkan bank `active` untuk dipilih agent) —
route ini untuk pengelolaan, staf perlu melihat bank `inactive` juga.

Diuji nyata dengan 4 role sekaligus (superadmin/admin/manager/agent):
tanpa sesi → list kosong (bukan error); Agent → GET berhasil (view=allowed)
tapi POST 403 (configure=tidak diizinkan); **Manager → POST DAN PUT
keduanya ditolak** (403/404) — membuktikan batas persis sesuai komentar
`0089`: "Admin authority, Superadmin bypass -- BUKAN Manager", beda dari
kebanyakan permission M07 lain yang biasanya Manager=ALL; Admin → POST
berhasil membuat bank baru; Superadmin → PUT berhasil mengubah
`default_interest_rate`; bank yang baru dibuat/diubah langsung muncul
dengan nilai terbaru di `GET /calculator/dbr/config` (0099) — membuktikan
kedua fitur benar-benar tersambung, bukan cuma lulus tes terpisah-pisah.
Data uji (4 auth user, 1 bank) dihapus total dan diverifikasi kosong.

## M06 Approval Claim PDF: `GET /claims/{id}/approval-pdf` (keputusan produk, tanpa migration baru)

Menutup STEP11-B3 §14 "Approval Claim PDF Generate/View/Download" +
"Approval Record" — DIBEDAKAN eksplisit dari 5 endpoint M07 di atas: Core
di sini menyatakan "No exact current API route or physical resource is
evidenced; no route/table invented" (CONTROLLED GAP sungguhan, bukan
sekadar "belum ada route-nya" seperti M07) — jadi desainnya diminta
konfirmasi produk ke user dulu sebelum dibangun (lihat riwayat chat),
bukan langsung diasumsikan seperti gap-gap sebelumnya.

**Keputusan yang dikonfirmasi user**: 1 endpoint (bukan 3 terpisah untuk
Generate/View/Download), tanpa tabel Approval Record terpisah, tanpa
migration baru — plus tambahan logo RumahAgen di PDF dan detail proyek
lengkap.

- **"Approval Record"** = baris `agent_project_claims` itu sendiri saat
  `status='approved'` — sudah cukup immutable (`reviewed_by`/`reviewed_at`
  otomatis terisi sejak `0035`, tidak ada jalur balik ke `pending`). Tidak
  perlu tabel snapshot terpisah.
- **"Generate"** ("Automatic/system consequence" per Core) diwujudkan
  sebagai render on-demand setiap request (pola sama seperti export-pdf
  DBR M07) — bukan trigger DB yang membuat file saat approval, karena data
  sumbernya sendiri sudah tidak berubah lagi setelah approved.
- **"View" + "Download"** digabung jadi SATU route:
  `Content-Disposition: inline` (default, tampil di browser) vs
  `?download=1` (`attachment`, unduh) — menghindari dua route nyaris
  identik untuk actor yang sama persis ("Agent/Developer evidence
  access").
- **Tidak ada permission baru** — Core sendiri eksplisit "NO PERMISSION
  INVENTION, not a human RBAC permission". RLS
  `agent_project_claims_select` yang SUDAH ADA sejak `0035` persis
  mencakup "Agent/Developer evidence access" (agent pemilik klaim,
  developer pemilik project lewat EXISTS join, atau staf lewat
  `m06.claim.review`) — tidak ada RLS baru ditulis.

### File baru

- `public/assets/rumahagen-logo.png` — disalin dari asset kanonik
  `docs/design/wireframes/WF-00-foundation/07-Assets/RumahAgen-logo-source.png`
  (bukan gambar baru dibuat, memakai ulang aset resmi yang sudah ada).
- `lib/claims/pdf.ts` — pakai `pdf-lib` (sama seperti DBR, ADR-approved),
  logo digambar pojok kanan atas. Isi: nama agent (`agent_profiles.
  full_name`), nama+PIC developer (`developer_partners`), detail proyek
  lengkap (nama, lokasi, tipe properti, kisaran harga, skema komisi) dari
  `developer_projects`, tanggal diajukan/disetujui.
- `app/api/claims/[id]/approval-pdf/route.ts` — GET, menolak 409 kalau
  klaim belum/tidak lagi `approved`.

Diuji nyata end-to-end: PDF pada klaim `pending` → 409; developer partner
approve klaim lewat route yang sudah ada → PDF langsung bisa diakses;
**PDF ASLI dibuka & dibaca ulang** — logo RumahAgen tampil benar di pojok
kanan atas, semua field (agent, developer+PIC, proyek+lokasi+harga+
komisi, tanggal diajukan/disetujui) cocok dengan data sungguhan; mode
`inline` vs `?download=1` menghasilkan header `Content-Disposition`
berbeda seperti dirancang; isolasi lintas-agent (agent tidak terkait → 404,
tidak bocor info) dan tanpa sesi → 404. Data uji (3 auth user, 1 developer
partner, 1 project, 1 klaim, 1 agent profile) dihapus total dan
diverifikasi kosong.

## `0100`/`0101` — Fix keamanan: privilege escalation lewat `users_update_self`

Temuan yang dilempar sebagai task terpisah saat mengerjakan M01 Auth
(2026-09-19), sekarang ditutup. RLS `users_update_self` (`0007`) mengizinkan
siapa pun UPDATE baris `public.users` MILIKNYA SENDIRI **tanpa batasan
kolom sama sekali** (`USING/WITH CHECK (id = auth.uid())` saja). Karena
PostgREST bisa dipanggil LANGSUNG oleh klien mana pun yang punya JWT (bukan
cuma lewat route Next.js proyek ini), user manapun bisa
`PATCH {SUPABASE_URL}/rest/v1/users?id=eq.<id-sendiri>` dengan body
`{"role_id": "<id-role-superadmin>"}` dan RLS meloloskannya — privilege
escalation penuh. Bug sudah ada sejak `0007`, bukan regresi sesi ini.

### `0100_fix_users_self_update_privilege_escalation.sql`

Trigger `enforce_users_protected_columns` (pola sama seperti
`agent_ai_connections` `0016`/`dbr_simulations` `0099`: RLS menjawab
"siapa boleh UPDATE", trigger menjawab "kolom mana boleh berubah").
Kolom yang diproteksi: `role_id`, `status`, `deleted_at`, `id`,
`created_at`. Kolom yang SENGAJA dibiarkan self-editable:
`email_verified_at`/`last_login_at` — dicek langsung ke seluruh
`apps/web/app/api`, tidak ada satu pun route yang mengubah `role_id`/
`status` (gap terpisah: `PUT /admin/users/{id}/role` dikunci STEP11-B10
M09 tapi belum dibangun, di luar cakupan fix keamanan ini), dan kedua
kolom itu tidak menggerbangi keputusan otorisasi apa pun secara langsung.

### `0101_fix_users_protected_columns_service_role_bypass.sql`

**Ditemukan lewat tes nyata langsung setelah `0100` diterapkan**: trigger
versi `0100` (guard `is_superadmin()` saja) TERNYATA juga memblokir akses
SQL langsung/service-role (`auth.uid()` selalu NULL di konteks itu) —
menutup jalur operasional sah (admin database, Supabase MCP/Dashboard SQL
editor), bukan cuma jalur serangan. Diperbaiki (TANPA mengedit `0100` yang
sudah applied — migration baru, `CREATE OR REPLACE FUNCTION`) dengan guard
`auth.uid() IS NULL OR is_superadmin()`: RLS `users_update_self` sendiri
sudah memastikan UPDATE lewat REST hanya lolos kalau `auth.uid()` cocok
dengan baris itu — kalau `auth.uid()` NULL, satu-satunya cara baris itu
ter-update sama sekali adalah koneksi service-role/postgres yang memang
bypass RLS sepenuhnya (dipercaya penuh by design).

Diuji nyata dengan JWT sungguhan (bukan asumsi): **eksploitasi PERSIS
seperti temuan awal** — agent uji login asli, `PATCH` langsung ke
`{SUPABASE_URL}/rest/v1/users` (BUKAN lewat app Next.js sama sekali)
mencoba ganti `role_id` ke superadmin → **ditolak nyata** (`400`, pesan
trigger), role di DB dikonfirmasi tidak berubah; percobaan sama untuk
`status`/`deleted_at` → ditolak juga; `last_login_at` (kolom yang sengaja
dibiarkan terbuka) → tetap berhasil diubah (`200`), membuktikan alur
`/auth/login` yang sudah ada tidak rusak; SQL langsung (service role) ganti
`role_id` → sempat gagal dengan `0100`, **dikonfirmasi berhasil lagi**
setelah `0101`; Superadmin sungguhan (sesi REST asli, bukan SQL langsung)
ubah `status` baris miliknya sendiri → berhasil, membuktikan bypass
`is_superadmin()` tetap berfungsi untuk skenario user session asli (bukan
cuma admin database). Seluruh data uji (2 auth user) dihapus dan
diverifikasi kosong.

## `0102` — Fix bug: Permission Preset salah membatasi target role ke Agent-saja untuk semua actor

Ditemukan dari pertanyaan user ("bukankah Superadmin bebas preset semua
role, Manager hanya boleh preset Agent?") saat membahas gap
`PUT /admin/users/{id}/role` — dicek langsung ke sumber otoritatif
`STEP12-B_PERMISSION_PRESET_SYNCHRONIZATION` (sebelumnya tidak terbaca,
masih dalam bentuk zip, baru diekstrak sesi ini).

### Bug yang ditemukan

Trigger `enforce_preset_target_role_is_agent` (`0004`) memaksa
`permission_presets.target_role_id` SELALU `'agent'`, **untuk siapa pun
termasuk Superadmin**. Migration `0004` mengutip ini sebagai "PP-001:
Preset HANYA berlaku untuk role Agent" — ternyata salah baca sumbernya.
`STEP12-B_PRESET_ROLE_TRACEABILITY_MATRIX.csv` yang sebenarnya:

| Kontrol | Target Role | Siapa boleh |
|---|---|---|
| PP-001 | Agent | Superadmin (full) + **Manager** (Create/Edit/Delete/Assign) |
| PP-002 | Role lain (Admin/Buyer/Developer Partner/Instructor) | "No preset management for [role lain]; **Superadmin governance remains**" |
| PP-003 | Superadmin | Full preset governance |

PP-001 HANYA membatasi **Manager** ke Agent-saja — bukan larangan
universal. RLS `permission_presets_manage` (`0007`) SEBENARNYA SUDAH BENAR
sejak awal (`is_superadmin() OR (manager AND target_role_id=agent)`) —
kesalahannya murni di trigger `0004` yang membatalkan niat RLS itu dengan
memaksa SEMUA orang (termasuk Superadmin yang RLS-nya sudah `ALL`) ke
Agent saja.

### `0102_fix_permission_preset_target_role_restriction.sql`

`CREATE OR REPLACE FUNCTION` (tidak mengedit `0004` yang sudah applied) —
guard `auth.uid() IS NULL OR is_superadmin()` (pola sama seperti `0101`)
menambah pengecualian: Superadmin (dan akses SQL/service-role langsung)
lolos untuk target role apa pun; Manager tetap dibatasi ke Agent-saja
(sudah cukup ditegakkan RLS, tidak diduplikasi di trigger).

Diuji nyata dengan JWT sungguhan untuk kedua role: Superadmin buat preset
target role **Admin** → **berhasil (201)**, sebelumnya mustahil sama
sekali; Manager coba hal yang sama → **ditolak (400)** dengan pesan jelas;
Manager buat preset target **Agent** → tetap berhasil (201, perilaku lama
tidak berubah); SQL langsung target role Admin → berhasil (bypass
`auth.uid() IS NULL` bekerja); trigger `enforce_preset_assignee_matches_
target_role` (tidak disentuh migration ini) dikonfirmasi TETAP menolak
assignment preset ke user yang role-nya tidak cocok — membuktikan
perbaikan ini tidak melonggarkan aturan lain yang tidak terkait. Data uji
(2 auth user, 3 permission preset, 1 preset item) dihapus total dan
diverifikasi kosong.

## `0103`-`0106` + 4 route baru — Permission Matrix Console (gap #2)

Menutup gap #2 dari audit admin-surface M01-M15 (`STEP11-A` master
inventory): `GET/PUT /admin/permissions/matrix` (API-144/146),
`GET/PUT /admin/permissions/matrix/agent` (API-145/147), dan
`PUT /admin/users/{id}/role` (API-148) — ketiganya sebelumnya 0% dibangun,
satu-satunya cara mengelola role/permission adalah SQL langsung.

Otorisasi dikonfirmasi user secara eksplisit sebelum dibangun: Agent/
Developer Partner TIDAK punya akses lihat/edit sama sekali; Superadmin +
Manager bisa EDIT preset; Admin HANYA VIEW.

**Tiga bug RLS/trigger ditemukan lewat testing nyata sepanjang jalan** —
semuanya sudah ada sejak migration lama (0004/0007), baru ketahuan sekarang
karena baru kali ini ada endpoint HTTP nyata yang benar-benar memanggilnya:

### `0103_fix_permission_matrix_rls_gaps.sql`
- **Bug 1 (silent failure)**: `role_permissions_manager_modify_agent_rows`
  (0007) memanggil `has_permission('m10.agent_permission_rows.modify')`
  TANPA `owner_id`, padahal permission itu di-seed scope `'own'` untuk
  Manager — `has_permission()` untuk scope `'own'` tanpa `owner_id` SELALU
  `FALSE` (0006). Policy ini TIDAK PERNAH benar-benar meloloskan Manager
  sejak pertama dibuat. Diverifikasi nyata: Manager PATCH baris Agent di
  `role_permissions` → `200 OK` tapi **0 baris berubah** (RLS diam-diam
  menyaring, bukan error eksplisit). Diperbaiki: hapus panggilan
  `has_permission()` yang salah pasang, cukup cek `current_role_code()` +
  `role_id` target langsung.
- **Bug 2 (Admin tidak bisa lihat preset sama sekali)**:
  `permission_presets`/`permission_preset_items`/`user_permission_presets`
  hanya punya policy `FOR ALL` (Superadmin+Manager) — Admin tidak pernah
  bisa SELECT, kontradiksi `STEP12-B` §2 sendiri ("Admin: no preset
  management; governed **visibility** is distinct from management").
  Ditambah policy SELECT terpisah memakai `has_permission
  ('m10.role_permission_matrix.view')` — permission yang SAMA yang sudah
  menggerbangi visibilitas `role_permissions`, tidak ada permission baru.

### `0104_add_users_update_admin_policy.sql`
Ditemukan saat membangun `PUT /admin/users/{id}/role`: `users_update_self`
(0007) hanya izinkan `id = auth.uid()` — Superadmin TIDAK BISA update
baris user LAIN sama sekali, bahkan setelah trigger
`enforce_users_protected_columns` (0100/0101) diberi bypass
`is_superadmin()` (trigger itu menjawab "kolom mana boleh berubah", RLS
yang menjawab "baris siapa yang bisa disentuh"). Diverifikasi nyata:
Superadmin sesi asli PATCH `role_id` user lain → `200 OK` tapi 0 baris
berubah. Policy baru `users_update_admin`: Superadmin boleh UPDATE baris
user siapa pun (kolom tetap dibatasi trigger yang sudah ada).

### `0105_cleanup_stale_permission_preset_on_role_change.sql`
Trigger `enforce_preset_assignee_matches_target_role` (0004) hanya menjaga
kecocokan role SAAT preset di-assign — tidak ada apa pun yang menjaga ke
ARAH SEBALIKNYA (role user berubah belakangan). Tanpa ini, promosi Agent
yang sedang punya preset aktif ke Manager akan meninggalkan assignment
yang menunjuk preset `target_role_id='agent'` padahal role user sekarang
`'manager'` — melanggar `STEP12-B` §3. Trigger baru pada
`AFTER UPDATE OF role_id ON users`: kalau preset yang sedang di-assign
tidak lagi cocok dengan role baru, baris `user_permission_presets` dihapus
otomatis (user kembali ke Role Default Matrix) — promosi TETAP berhasil,
bukan diblokir.

### `0106_fix_preset_assignee_trigger_security_definer.sql`
**Ditemukan lewat tes nyata assign preset SEBAGAI MANAGER** (baru pertama
kali ada INSERT nyata ke `user_permission_presets` di seluruh riwayat
proyek): `enforce_preset_assignee_matches_target_role` (0004) TIDAK
`SECURITY DEFINER` — `SELECT role_id FROM public.users` di dalamnya tunduk
RLS `users_select_self_or_admin` yang HANYA izinkan
`id=auth.uid() OR Superadmin OR Admin` — **Manager tidak termasuk**.
Akibatnya `v_user_role_id` selalu `NULL` untuk assignment yang dilakukan
Manager, `NULL IS DISTINCT FROM <target>` selalu `TRUE` → trigger SELALU
menolak dengan pesan "role tidak cocok", **padahal rolenya benar-benar
cocok**. Diverifikasi nyata: Manager assign preset ke Agent asli (role
memang cocok) tetap ditolak — root cause bukan validasi bisnis gagal,
tapi SELECT internal trigger yang diam-diam kosong. Diperbaiki: tandai
`SECURITY DEFINER` (pola sama seperti `handle_auth_user_sync`/
`log_audit_event` — baca lintas-tabel untuk validasi, bukan mengekspos
data ke caller).

### Route baru
- `app/api/admin/permissions/matrix/route.ts` — GET (grid semua role,
  dikelompokkan) + PUT (upsert satu sel `role_id`×`permission_id`).
- `app/api/admin/permissions/matrix/agent/route.ts` — GET (daftar preset
  target Agent + item + assignment) + PUT (`preset_id` diisi=edit,
  dikosongkan=buat baru — menutup 2 kapabilitas STEP12-B sebut perlu
  "Create"/"Edit" lewat SATU locked path, bukan mengarang endpoint baru).
  **Bug ditemukan+diperbaiki saat build**: resolusi UUID role `'agent'`
  awalnya lewat client bersesi biasa — RLS `roles_select` tidak lolos
  untuk Agent, membuat GET oleh Agent gagal dengan `INTERNAL_ERROR` yang
  membingungkan alih-alih list kosong; dipindah ke admin client (UUID role
  bukan data rahasia, RLS sesungguhnya tetap di query `permission_presets`).
- `app/api/admin/users/[id]/permission-preset/route.ts` — GET+PUT
  (ADD-NEW, STEP12-B sebut "Assign/Replace" perlu tapi tidak mengunci ID
  endpoint pasti — ekstensi minimal dari pola `/admin/users/{id}/role`
  yang sudah locked; `preset_id: null` = unassign).
- `app/api/admin/users/[id]/role/route.ts` — PUT, Superadmin-only.

Diuji nyata end-to-end dengan 4 role sekaligus (superadmin/admin/manager/
agent), sesuai batas yang diminta user: Agent GET matrix/preset → kosong
(tanpa error); Admin GET → berhasil, PUT/assign/role-change → 403 di
semuanya (view-only murni); Manager PUT matrix baris Agent → berhasil,
baris Admin → 403; Manager create/edit preset Agent → berhasil; Manager
assign preset ke Agent asli → berhasil (setelah fix 0106); Superadmin
ubah role Agent→Admin sambil preset masih ter-assign → berhasil DAN
assignment lama otomatis terhapus (fix 0105 terbukti); unauthenticated →
kosong/403 di semua endpoint. Seluruh data uji (4 auth user, 1 preset)
dihapus total dan diverifikasi kosong, `role_permissions` yang sempat
diubah untuk tes dikembalikan ke nilai semula.

## Internal Staff User Management: `GET/POST /admin/internal-users`, `PUT .../{id}`, `PUT .../{id}/deactivate` (admin-surface gap #1, tanpa migration baru)

Menutup gap #1 dari audit admin-surface M01-M15 (pengecekan menyeluruh
"apakah admin bisa akses semua modul lewat HTTP" yang diminta user
sebelum batch Permission Matrix Console di atas). **Tidak ada migration
SQL baru** — bergantung penuh pada RLS `users_update_admin` (`0104`)
ditambah pengecekan eksplisit `requireSuperadmin()` di kode route.

### "Internal user" = staf (admin/manager/superadmin), bukan actor platform

Tidak ada definisi skema/field apa pun untuk resource ini di korpus Core
selain nama endpoint (STEP11-A API-139/140/141/142) — dicek menyeluruh,
kosong. "Internal user" dibaca sebagai akun **staf** yang mengoperasikan
admin console, dibedakan eksplisit dari actor platform (agent/buyer/
developer_partner/instructor) yang sudah punya jalur pendaftaran sendiri
lewat M01 (`/auth/register`). Constraint kunci yang membentuk desain:
`public.users` TIDAK punya kolom email/nama sama sekali — email HANYA ada
di `auth.users`. Jadi create memakai Supabase Admin API
(`auth.admin.createUser`), bukan `INSERT` biasa ke `public.users`.

### Kenapa `requireSuperadmin()` (helper baru), bukan RLS tabel tunggal

`lib/api/require-superadmin.ts` — pengecekan eksplisit `is_superadmin()`
lewat RPC (fungsi otorisasi yang sama sejak `0006`, bukan logika baru),
pola yang sama dipakai `app/api/admin/reports/export/route.ts`. Dipakai
di SEMUA 4 operasi (GET/POST list, PUT update, PUT deactivate) karena GET
dan POST memanggil Supabase Admin API (`auth.admin.listUsers`/
`createUser`) yang sama sekali tidak tercakup RLS Postgres — RLS tabel
tunggal tidak bisa menggerbangi operasi yang tidak menyentuh tabel lewat
PostgREST/session client. Membuat/melihat daftar akun staf adalah
kapabilitas paling sensitif di seluruh admin console (setara
`system_configuration`/`PUT admin/users/{id}/role`) — konsisten
Superadmin-only, bukan Manager-inclusive.

### `role_id` di-override eksplisit setelah create

Trigger sinkron `handle_auth_user_sync` (`0096`) otomatis membuat baris
`public.users` dengan `role_id` default **'agent'** untuk SIAPA PUN baris
`auth.users` baru — termasuk yang dibuat lewat Admin API di route ini.
Route langsung menimpa `role_id` ke role staf yang diminta (`admin`/
`manager`/`superadmin`, divalidasi dulu) pakai `createAdminClient()`
(bukan client bersesi) karena trigger `enforce_users_protected_columns`
(`0100`/`0101`) hanya mengizinkan `is_superadmin() OR auth.uid() IS NULL`
— admin client selalu `auth.uid()` NULL, pola akses service-role yang
sama dipakai di tempat lain proyek ini.

### `PUT .../{id}` vs `PUT /admin/users/{id}/role` — batas semantik disengaja

`PUT /admin/internal-users/{id}` HANYA menerima target yang **SAAT INI**
staf (divalidasi `roles(code) IN (admin,manager,superadmin)` sebelum
UPDATE) — mengubah role/status user platform biasa lewat sini ditolak
`404`, diarahkan ke `PUT /admin/users/{id}/role` (generik, sudah ada dari
batch Permission Matrix Console) supaya batas "internal user management"
vs "user management umum" tetap eksplisit, bukan satu route serba-bisa.
`PUT .../{id}/deactivate` adalah jalan pintas semantik `status:
'suspended'` untuk aksi paling umum — Core menguncinya sebagai path
terpisah (API-142), bukan sekadar field body di endpoint update.

### File baru

- `lib/api/require-superadmin.ts` — helper `requireSuperadmin()`.
- `lib/validation/admin.ts` — tambahan `createInternalUserSchema`
  (email/password/role_id), `updateInternalUserSchema` (role_id/status,
  keduanya optional).
- `app/api/admin/internal-users/route.ts` — GET (daftar staf, email
  di-cross-reference dari `auth.admin.listUsers`, `perPage:1000` sebagai
  pengaman praktis bukan aturan bisnis) + POST (`auth.admin.createUser`
  lalu override `role_id`, `409` kalau email sudah terdaftar).
- `app/api/admin/internal-users/[id]/route.ts` — PUT (role_id dan/atau
  status, keduanya divalidasi tetap staf).
- `app/api/admin/internal-users/[id]/deactivate/route.ts` — PUT,
  `status='suspended'` langsung.

Diuji nyata dengan 4 akun: Superadmin (qa-iu-superadmin), Manager
(qa-iu-manager, dipakai untuk membuktikan 403 di semua 4 operasi — bukan
cuma di satu), Manager baru dibuat lewat route ini sendiri
(qa-iu-newmanager, dipromosikan lalu di-deactivate), dan satu Agent biasa
(qa-iu-regularagent) untuk membuktikan `PUT .../{id}` menolak `404` saat
target BUKAN staf. Hasil: Manager (non-superadmin) → 403 murni di
GET/POST/PUT/deactivate; Superadmin POST create Manager baru → 201, email
benar (cross-reference `auth.users` berfungsi), `role_id` ter-override
dari default 'agent' trigger `0096`; PUT ubah role Manager→Admin →
berhasil; PUT deactivate → `status='suspended'` tersimpan; PUT ke Agent
biasa → `404` (batas semantik terbukti, tidak menembus ke user platform).

**Temuan sampingan**: `GET /admin/internal-users` secara tidak sengaja
memunculkan 5 akun sisa `tier2-{role}-{timestamp}-{random}@example.com`
dari sesi kerja SEBELUM percakapan ini (bukan dibuat oleh tes ini). 4
dihapus lewat Admin API setelah dikonfirmasi bukan data produksi; 1 akun
(`tier2-agent-...`) sengaja DIBIARKAN — dihapus gagal `500` karena masih
direferensikan `listings.agent_id` (`ON DELETE RESTRICT`) oleh listing uji
`test-listing-tier2` lain, di luar cakupan pembersihan fitur ini. Data uji
milik tes ini sendiri (4 akun qa-iu-*) dihapus total dan diverifikasi
`0` baris tersisa.

## `0107` — Listing Moderation Queue: `GET /admin/listings/pending`, `PUT .../{id}/approve`, `PUT .../{id}/reject` (admin-surface gap #1, M03)

Menutup gap #1 (bagian kedua) dari audit admin-surface M01-M15 — API-036/
037/038 (M03 Admin Listing Review, STEP11-A), dikonfirmasi eksplisit oleh
user: **BUKAN gate pre-publish** ("agen yang berhak publish listing"),
melainkan **manual review PASCA-publish** untuk kasus seperti gambar
listing yang sudah live ternyata melanggar aturan.

### Bukan gate publish — Core sendiri sudah eksplisit soal ini

STEP11-A §4 mencatat API-036/037/038 sebagai "Preserve existing admin
review route; NOT a normal Listing Publish gate" / "exceptional/
administrative capability only ... not normal publish authority". Ini
konsisten dengan Gate `PRE-00-E_M03_LISTING_REFRESH_GATE` §6-9 yang sudah
menutup alur normal M03 sebagai `DRAFT -> PUBLISH -> PUBLISHED` tanpa
`PENDING_REVIEW` sama sekali (migration `0018`) — nilai `pending_review`/
`rejected` di CHECK constraint listings SENGAJA tetap ada sejak `0018`
("untuk dipakai domain otoritatif lain di masa depan"). Batch ini adalah
domain otoritatif itu.

### Cara listing MASUK ke `pending_review` — tidak ada endpoint "flag" baru

Tidak ada endpoint baru untuk memindahkan listing published ke
`pending_review` — staf (Superadmin/Admin/Manager) memakai
`PATCH /listings/{id}/status` yang SUDAH ADA (API-028), karena RLS
`listings_update` (`0090`) sudah mengizinkan staf mencapai baris listing
siapa pun lewat permission `m03.listing.suspend` (scope 'all' sejak
`0086`), dan sebelum batch ini tidak ada IF block trigger yang
menggerbangi transisi ke/dari `pending_review` sama sekali.

### `0107_fix_listings_pending_review_self_unflag.sql` — celah ditemukan SEBELUM endpoint baru sempat dipakai

**Ditemukan saat merancang alur end-to-end**, sebelum satu pun endpoint
baru dites: karena trigger `enforce_listing_lifecycle_rules` (0018/0086)
tidak pernah menggerbangi transisi ke/dari `pending_review`, begitu staf
menandai listing seorang Agent sebagai `pending_review`, Agent PEMILIK
listing itu bisa langsung memanggil `PATCH /listings/{id}/status` yang
sama untuk mengembalikannya ke `published` SENDIRI — mereka tetap punya
`m03.listing.publish` scope `'own'` untuk listing miliknya, dan tidak ada
apa pun yang memeriksa status LAMA sebelum publish. Ini sepenuhnya
meniadakan tujuan seluruh fitur moderasi: Agent bisa self-un-flag tanpa
review staf.

**Diverifikasi nyata SEBELUM fix**: Agent `PATCH /listings/{id}/status
{"status":"published"}` pada listing miliknya sendiri yang sedang
`pending_review` -> `200 OK`, kembali published tanpa staf terlibat sama
sekali.

**Fix**: tambah IF block baru di `enforce_listing_lifecycle_rules()`,
SIMETRIS dengan pola `suspended` yang sudah ada (0086) — transisi ke/dari
`pending_review` (arah manapun) kini JUGA butuh `m03.listing.suspend`
(staff-only, Agent tidak pernah diberi permission ini). Konsekuensi:
transisi `pending_review -> published` (approve) sekarang butuh KEDUA
permission (`suspend` untuk keluar antrian moderasi, `publish` untuk
benar-benar publish) — lihat asimetri Manager/Admin di bawah.

**Diverifikasi nyata SETELAH fix**: Agent yang sama mencoba hal yang sama
-> `403 FORBIDDEN`, pesan persis "transisi ke/dari pending_review butuh
permission m03.listing.suspend".

### Asimetri approve: Superadmin/Admin bisa, Manager tidak — BUKAN bug

Master matrix (`0009`) memberi `m03.listing.publish` HANYA ke Superadmin
(all), Admin (all), dan Agent (own) — Manager TIDAK PERNAH diberi
permission ini sama sekali. Setelah fix `0107`, "approve" (transisi ke
`published`) menembus DUA gate: `m03.listing.suspend` (Manager punya) DAN
`m03.listing.publish` (Manager TIDAK punya). Hasilnya: Manager bisa
melihat antrian dan me-REJECT, tapi tidak bisa APPROVE — ditolak trigger
dengan 403 yang sama persis seperti Agent biasa mencoba publish tanpa
izin. Ini bukan bug endpoint, melainkan konsekuensi jujur dari matrix
otorisasi yang sudah ada: Manager punya wewenang moderasi/enforcement,
tapi otoritas mem-PUBLISH tetap eksklusif Superadmin/Admin/Agent-pemilik.
Diverifikasi nyata (lihat hasil tes di bawah).

### File baru

- `lib/api/require-permission.ts` — helper generik `requirePermission()`
  (RPC `has_permission()` tanpa owner_id, pola sama seperti
  `require-superadmin.ts` tapi untuk permission code apa pun). Dipakai di
  ketiga route di bawah dengan `m03.listing.suspend` supaya GET/PUT ini
  benar-benar staf-only secara eksplisit — tanpa ini, RLS SELECT listings
  yang sudah longgar untuk staf akan tetap membiarkan Agent memanggil
  path "/admin/" ini dan melihat listing miliknya sendiri yang sedang
  di-review (RLS `agent_id=auth.uid()`), padahal semantiknya adalah
  konsol staf.
- `lib/validation/listings.ts` — `rejectListingSchema` (`rejection_reason`
  opsional, dipakai ulang dari kolom yang sudah ada sejak `0018`).
- `app/api/admin/listings/pending/route.ts` — GET, daftar `pending_review`
  (paginated), staf-only.
- `app/api/admin/listings/[id]/approve/route.ts` — PUT, prasyarat status
  `pending_review` (404 kalau listing tidak ada, 409 kalau status bukan
  `pending_review`), UPDATE ke `published`, audit log
  `m03.listing.approve`.
- `app/api/admin/listings/[id]/reject/route.ts` — PUT, prasyarat sama,
  UPDATE ke `rejected` + `rejection_reason` opsional, audit log
  `m03.listing.reject`.

Diuji nyata end-to-end dengan 4 role (superadmin/admin/manager/agent):
Agent publish listing sendiri -> berhasil (alur normal tidak berubah);
Superadmin flag ke `pending_review` -> berhasil; **Agent self-unflag ->
403 (fix 0107 terbukti)**; Agent GET `/admin/listings/pending` -> 403
(gate staf eksplisit terbukti); Manager/Admin/Superadmin GET -> 200,
listing sama-sama terlihat ketiganya; **Manager PUT approve -> 403
(asimetri publish terbukti)**; Admin PUT approve -> 200, kembali
`published`; Manager flag ulang ke `pending_review` -> berhasil (Manager
BISA flag, hanya tidak bisa approve); Manager PUT reject dengan
`rejection_reason` -> 200, status `rejected` + alasan tersimpan persis;
PUT approve pada listing yang sudah `rejected` -> 409 CONFLICT (guard
prasyarat status terbukti); GET pending setelahnya -> listing yang
di-reject benar-benar hilang dari antrian; tanpa sesi -> 403 (konsisten
dengan pola `requireSuperadmin()`/`requirePermission()` yang sudah ada di
seluruh proyek — RPC `has_permission()` mengembalikan `false`, bukan error
autentikasi, untuk pemanggil anonim). Audit log `m03.listing.approve`+
`m03.listing.reject` yang tercipta dari tes ini dan listing uji itu
sendiri dihapus total; 4 akun uji dihapus lewat Admin API dan
diverifikasi `0` baris tersisa.

## `0108` — Agent Suspend: `PUT /admin/agents/{id}/suspend` (admin-surface gap #1, bagian ketiga, M02)

Menutup gap #1 (bagian ketiga) dari audit admin-surface M01-M15 — API-024
(M02, STEP11-A, "CURRENT PRESERVE"). Sebelum batch ini TIDAK ADA jalur
HTTP sama sekali untuk mengubah `users.status` milik user lain kecuali
Superadmin (RLS `users_update_admin`, `0104`) — Admin/Manager tidak bisa
menyentuh baris user lain sama sekali di tabel `users`. Mekanisme
"suspend" itu sendiri SUDAH ADA dan fully-enforced sejak `0082`
(`has_permission()` SELALU `FALSE` untuk akun `suspended`, apa pun
rolenya) — yang belum ada murni jalur HTTP untuk memicunya.

### Tidak ada baris "Agent Suspend" di master matrix — preseden mana yang diikuti?

`STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv` hanya punya SATU baris M02
(Profile Photo) — tidak ada baris untuk suspend agent sama sekali,
konsisten dengan `m03.listing.suspend` (`0086`) dan `organizations`
suspend (`0087`) yang JUGA ADD-NEW di luar matrix awal. Dua preseden itu
BERBEDA otorisasinya: listing suspend = Superadmin+Admin+Manager (lewat
permission code `m03.listing.suspend`), organization suspend =
Superadmin+Admin SAJA (lewat direct role check, eksplisit "supaya tidak
campur konvensi dalam satu tabel").

**Keputusan**: ikuti preseden `organizations` (0087), BUKAN `listings`
(0086) — Superadmin+Admin SAJA, direct role check, TANPA permission code
baru. Alasan: tabel `users` SENDIRI sudah konsisten sejak awal membedakan
Superadmin+Admin dari Manager tanpa permission code (`users_select_
self_or_admin`/0007 dan `users_update_admin`/0104 SAMA-SAMA hanya
Superadmin+Admin) — mengikuti konvensi yang SUDAH ADA di tabel yang sama,
bukan mencampur pola permission-code M03 ke tabel yang belum pernah
memakainya.

### Satu arah saja — persis kontrak yang dikunci Core

RLS/trigger baru HANYA mengizinkan transisi `active -> suspended` untuk
target ber-role Agent oleh Admin — tidak ada endpoint "reactivate"/
"unsuspend" yang dievidensi Core, jadi tidak dibuat jalur baliknya untuk
Admin. Superadmin tetap punya kuasa penuh (termasuk reaktivasi) lewat
`users_update_admin` (0104) yang sudah ada — tidak ada jalan buntu.

### `0108_add_agent_suspend_capability.sql`

- RLS baru `users_update_admin_agent_suspend`: Admin (`current_role_code()
  = 'admin'`) bisa mencapai baris mana pun yang `role_id` = role Agent
  untuk UPDATE. Superadmin tidak diulang di sini (sudah tercakup
  `users_update_admin`).
- Trigger `enforce_users_protected_columns` (0100/0101) di-`CREATE OR
  REPLACE` — blok `status` dipisah dari blok `role_id/id/deleted_at/
  created_at` supaya bisa diberi SATU pengecualian sempit: Admin, target
  ber-role Agent, DAN transisi PERSIS `active -> suspended` (bukan ke
  status lain, bukan dari status lain). Kolom lain (role_id/id/dst.) tetap
  terkunci mutlak seperti sebelumnya.

### File baru

- `app/api/admin/agents/[id]/suspend/route.ts` — PUT. Dicek eksplisit di
  kode (RPC `is_superadmin()` lalu `current_role_code()`) supaya pesan
  403/404/409 jelas, RLS+trigger 0108 tetap penegak keras di lapisan DB.
  Prasyarat: target harus ber-role `agent` (404 kalau bukan) dan
  berstatus `active` (409 kalau sudah `suspended`/status lain). Audit log
  `m02.agent.suspend`.

Diuji nyata dengan 5 akun (superadmin/admin/manager/agent1/agent2):
Manager mencoba suspend -> 403; Agent2 mencoba suspend Agent lain
(self-service) -> 403; tanpa sesi -> 403; Admin mencoba suspend akun
Manager (bukan Agent) -> 404 (batas semantik "hanya Agent" terbukti);
Admin suspend agent1 -> 200; Admin suspend agent1 LAGI (sudah suspended)
-> 409; **agent1 yang sudah suspended mencoba membuat listing -> 403**
(membuktikan enforcement `has_permission()`/0082 benar-benar efektif
end-to-end, bukan cuma status tersimpan di kolom); Superadmin suspend
agent2 -> 200 (jalur Superadmin tetap utuh). Audit log yang tercipta dan
5 akun uji dihapus total, diverifikasi `0` baris tersisa.

## `0109` — M04 Learning Economy Configuration: `GET/PUT /admin/learning/configuration`

Menutup gap TERAKHIR dari audit admin-surface M01-M15 — API-074/075 (M04,
STEP11-A, "CURRENT PRESERVE"). **Bukan** endpoint yang sama dengan
`/admin/learning/activities` (API-076/077/078, sudah dibangun sejak
`0058` — itu CRUD konten Activity, bukan "configuration").

### Zero skema fisik dievidensi — konten benar-benar tidak ada di Core

Dicek menyeluruh: STEP10-D data dictionary TIDAK punya entity
`LEARNING_CONFIG`/`LEARNING_ECONOMY_CONFIG` apa pun, tidak ada satu pun
nama kolom/rate/threshold "learning economy" di seluruh korpus. Satu-
satunya evidence adalah OTORISASI (bukan skema) di
`PRE-00-F_M04_LEARNING_GATE` §19 "LEARNING ECONOMY CONFIGURATION"
(`Q-M04-E-01A` View, `Q-M04-E-01B` Manage) — baris ini TIDAK ada di
`STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv` 50-baris frozen, pola SAMA
PERSIS seperti `m04.learning_point.*` (0023) dan `m04.learning_activity.*`
(0058) yang JUGA ADD-NEW lewat Gate yang sama, bukan lewat master matrix.
2 permission BARU di-mint di sini, scope PERSIS meniru Gate:

```
m04.learning_economy_configuration.view   → Superadmin=BYPASS, Admin=ALL, Manager=ALL, Instructor=OWN, sisanya=NONE
m04.learning_economy_configuration.manage → Superadmin=BYPASS, Admin=ALL, Manager=ALL, sisanya=NONE (Instructor TIDAK termasuk)
```

### Keputusan skema: key-value generik, meniru `system_configs` (0011)

Tidak ada nama field yang dievidensi (beda dari `dbr_config`/0008 atau
`seo_config`/0097 yang field-nya memang dievidensi eksplisit) — jadi
`learning_economy_configs` dibuat dengan bentuk PERSIS sama seperti
`system_configs`: `config_key`/`config_value`/`updated_by`/`updated_at`.
Tabel TERPISAH dari `system_configs` sendiri karena RBAC-nya BEDA
(Manager+Admin=ALL di sini vs `system_configs` yang Superadmin-only).
Endpoint terkunci sebagai SATU path tanpa `{key}` (beda dari
`/admin/config/system/{key}` yang per-key) — GET mengembalikan SEMUA
baris sekaligus, PUT upsert SATU pasangan `config_key`/`config_value` per
panggilan lewat body.

### Catatan "Instructor = OWN" — di-seed exact, tapi efektif no-op

Di-seed PERSIS sesuai Gate (`PRESERVE_EXACT`, konsisten pola migration
lain) — TAPI tabel ini adalah konfigurasi GLOBAL tanpa kolom `owner_id`
apa pun. `has_permission(action, p_owner_id)` untuk scope `'own'` SELALU
`FALSE` tanpa `owner_id` yang cocok (`0006`), dan tidak ada `owner_id`
yang bermakna untuk baris config global — route tidak pernah memanggil
`has_permission` dengan `owner_id` apa pun untuk kasus ini. Konsekuensi:
baris permission Instructor ini SECARA PRAKTIS tidak pernah lolos lewat
endpoint admin ini, konsisten dengan SETIAP endpoint `/admin/*` lain di
seluruh proyek yang staff-only (Superadmin/Admin/Manager). Nilai scope
tetap di-seed exact match Gate untuk audit/traceability, bukan dihapus
diam-diam. **Diverifikasi nyata**: Instructor GET -> `200` array kosong
(bukan error — RLS SELECT hanya memfilter baris, tidak melempar 403);
Instructor PUT -> `403`.

### File baru

- `lib/validation/learning-points.ts` — tambahan
  `learningEconomyConfigUpsertSchema` (`config_key`/`config_value`).
- `app/api/admin/learning/configuration/route.ts` — GET (semua baris) +
  PUT (upsert satu key).

Diuji nyata dengan 5 role (superadmin/admin/manager/agent/instructor):
Agent GET SEBELUM ada config apa pun -> `200` array kosong; Agent PUT ->
`403`; Instructor PUT -> `403`; Instructor GET -> `200` kosong (own-scope
no-op terbukti); tanpa sesi GET -> `200` kosong (bukan error, RLS
memfilter diam-diam); Superadmin PUT membuat key baru -> `200`; Admin GET
-> melihat key yang baru dibuat; Manager PUT mengubah value key yang
sama -> `200`, `updated_by` berubah ke Manager; Manager GET -> value
baru persisten; **Agent GET SETELAH config ada -> tetap `200` array
kosong** (membuktikan RLS benar-benar memfilter berdasarkan permission,
bukan cuma kebetulan tabel kosong). Baris config uji dihapus total, 5
akun uji dihapus lewat Admin API, diverifikasi `0` baris tersisa.

**Ini menutup SELURUH admin-surface gap dari audit M01-M15** (bersama
Internal Staff User Management, Listing Moderation Queue, dan Agent
Suspend di atas).

## `0110`-`0113` — M12 Organization CRUD: create/detail/branding/search/dashboard/member-leave-remove/close/activity-log

Menutup temuan TERBESAR dari audit endpoint agen/user M01-M15 (audit
terpisah dari admin-surface di atas — mencakup SELURUH 239 endpoint
terkunci STEP11-A, bukan cuma console admin): API-156/157/158/159/160/
166/167/168 (M12). Tabel `organizations`/`organization_members` dan RLS
`organizations_manage`/`organization_members_manage` sudah ada sejak
migration `0005`/`0007` — fitur TURUNANNYA (invitations/join-requests,
`0050`; quota/entitlements) sudah dibangun DI ATASNYA — TAPI tidak ada
SATU PUN route yang menyentuh tabel `organizations` itu sendiri sebelum
batch ini: organisasi tidak pernah bisa dibuat/dilihat/di-branding/
dicari/ditutup lewat HTTP sama sekali.

Sumber utama: `STEP11-B6_ORGANIZATION_MEMBERSHIP_INVITATION_API_
SYNCHRONIZATION` §7-13/§19 (jauh lebih detail dari Gate `PRE-00-N`
sendiri) + `PRE-00-N_M12_ORGANIZATION_MEMBERSHIP_AUTHORITY_GATE` §6-7.

### Tidak ada permission baru — ikuti master matrix, bukan prosa B6

B6 menulis "Eligible **Agent** creates an Organization and becomes Lead",
tapi `STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv` (satu-satunya baris
M12: "Manage within authorized context") memberi scope `OWN` ke SEMUA
role non-staff (Manager/Agent/Developer Partner/Buyer/Instruktur), PERSIS
sama dengan RLS `organizations_manage` (`created_by=auth.uid()` OR staf)
yang sudah ada sejak `0007`. Diikuti master matrix (otoritas RBAC final
di proyek ini), bukan prosa B6 — precedent yang sama dipakai berkali-kali
di sesi ini. **Diverifikasi nyata**: Buyer berhasil membuat organisasi
(`201`), bukan cuma Agent.

### `0110_m12_organization_crud_gap.sql`

- **Auto-leader-membership**: trigger `create_organization_leader_
  membership` (`AFTER INSERT ON organizations`, `SECURITY DEFINER` --
  pembuat organisasi belum punya baris `organization_members` apa pun
  saat trigger ini jalan, pola sama seperti `handle_auth_user_sync`/0096)
  otomatis menambahkan pembuat sebagai `role='leader'`, `status='active'`.
- **"CLOSED is irreversible"** (B6 §12): `enforce_organization_lifecycle_
  rules()` (`0087`, `CREATE OR REPLACE`) ditambah satu guard di awal —
  `IF OLD.status = 'closed' THEN RAISE EXCEPTION` — SEBELUM pengecekan
  apa pun, berlaku bahkan untuk Superadmin lewat SQL langsung.
  **Diverifikasi nyata**: percobaan `PATCH` langsung via service-role SQL
  untuk mengembalikan organisasi `closed` ke `active` → ditolak trigger.
- **Self-leave untuk member biasa** (B6 §9, "Member controls own leave"):
  policy baru `organization_members_self_leave`
  (`agent_id = auth.uid()`) — sebelumnya `organization_members_manage`
  HANYA leader-aktif/staf, member biasa tidak pernah bisa keluar sendiri
  sama sekali (celah nyata, bukan disengaja). Dibatasi trigger
  `enforce_organization_member_self_leave` ke transisi `active->left`
  milik baris sendiri saja — leader/staf tidak dibatasi trigger ini.
- **Lead Exit → CLOSING** (B6 §13/`PRE-00-N` §7, LOCKED, "no Lead
  Transfer/successor/auto-promotion"): trigger baru `trg_org_closing_on_
  lead_exit` (`AFTER UPDATE ON organization_members`, `SECURITY DEFINER`)
  — begitu baris `role='leader'` `status` berubah dari `active` ke
  `left`/`removed`, `organizations.status` otomatis pindah ke `closing`.
  **Diverifikasi nyata**.
- **Visibilitas publik untuk discovery** (API-159 search perlu organisasi
  bisa DITEMUKAN sebelum jadi member): policy baru `organizations_
  select_active_public` (`status='active'`, siapa pun) — RLS HANYA
  menggerbangi BARIS, kurasi KOLOM privat (address/contact_phone/
  social_media) tetap tanggung jawab kode route ("must not expose private
  Organization information", B6 §8).

### `0111` — fix: accepted invitation tidak pernah menjadi membership

**Ditemukan saat menyiapkan pengujian batch 0110**: B6 §10 mengunci
"Accepted invitation becomes membership" secara eksplisit, TAPI `0050`
hanya menyediakan tabel + trigger anti-self-approval — TIDAK PERNAH ada
kode yang benar-benar menulis baris `organization_members` saat
`organization_invitations.status` jadi `'accepted'`. Tanpa fix ini,
SELURUH alur undangan/join-request yang sudah dibangun sejak `0050` (POST
invitations/join-requests + PUT accept) secara fisik TIDAK PERNAH
menghasilkan member baru — accept selalu "berhasil" (`200 OK`) tapi
orangnya tidak pernah benar-benar jadi anggota. Trigger baru
`create_membership_on_invitation_accepted` (`SECURITY DEFINER` — pada
alur `leader_invite`, yang accept adalah AGENT yang diundang, bukan
leader, jadi belum tentu punya hak INSERT ke `organization_members`
lewat RLS biasa) — `INSERT ... ON CONFLICT (organization_id, agent_id) DO
UPDATE` supaya mantan member yang `left`/`removed` lalu diundang lagi
bereaktivasi, bukan menabrak UNIQUE constraint (`0005`).

### `0112` — fix: infinite recursion RLS pada UPDATE organization_members

**Ditemukan saat menguji nyata leave/remove member** — SETIAP UPDATE ke
`organization_members` gagal `42P17 "infinite recursion detected in
policy"`. Root cause: `organization_members_manage` (`0007`) menulis
pengecekan leader-aktif sebagai subquery INLINE ke tabel yang SAMA
(`EXISTS (SELECT 1 FROM organization_members om WHERE ...)`) — subquery
itu sendiri tunduk RLS tabel yang sama (termasuk policy ini sendiri),
menciptakan evaluasi sirkular. Bug ini DORMAN sejak `0007` — tidak
pernah ketahuan karena tidak ada route apa pun yang benar-benar
melakukan UPDATE ke `organization_members` sebelum batch ini (leave/
remove member baru pertama kali dibangun di sini). Fix: ganti subquery
inline dengan helper `is_org_leader()` yang SUDAH ADA (`0050`,
`SECURITY DEFINER` — bypass RLS untuk query internalnya sendiri,
menghilangkan sirkularitas), kondisi logis identik, bukan perubahan
perilaku.

### `0113` — fix: trigger self-leave memblokir reaktivasi lewat accept

**Ditemukan saat menguji ulang re-invite pada mantan member**: trigger
`create_membership_on_invitation_accepted` (`0111`) mereaktivasi baris
`left->active` lewat `UPDATE`, tapi UPDATE itu TETAP memicu `BEFORE
UPDATE` trigger `enforce_organization_member_self_leave` (`0110`) di
tabel yang sama — `SECURITY DEFINER` membuat operasinya bypass RLS,
TAPI TIDAK membuatnya bypass TRIGGER tabel (dua mekanisme berbeda).
`auth.uid()` di dalam trigger tetap terbaca sebagai agent yang meng-
accept (bukan leader/staf) — trigger self-leave menolak karena transisi
`left->active` bukan `active->left` yang ia izinkan. Fix: pola SAMA
seperti `rumahagen.refresh_in_progress` (`0018`) — flag sesi transaksi
lokal (`rumahagen.org_membership_sync_in_progress`) di-set oleh trigger
accept SEBELUM menulis, dibaca trigger self-leave sebagai jalur bypass
paling awal.

### Desain closure: DUA panggilan `DELETE` ke endpoint locked yang SAMA

B6 §12 mengunci alur self-service DUA LANGKAH (Close lalu Confirm) PLUS
OTP-gated confirmation dari QIR/Business Rules — TAPI "exact current API
v2.1 closure-confirm/OTP route is not evidenced" (CONTROLLED ROUTE GAP
yang didokumentasikan B6 sendiri, bukan diciptakan di sini). Direalisasi
sebagai DUA PANGGILAN berurutan ke `DELETE /organizations/{id}` yang SAMA
persis: panggilan pertama saat `status='active'` → `'closing'` ("Close"),
panggilan kedua saat `status='closing'` → `'closed'` ("Confirm"). Tanpa
OTP (tidak dievidensi route-nya). Otorisasi dicek EKSPLISIT di kode
(`created_by` atau Superadmin/Admin — Manager SENGAJA tidak termasuk,
konsisten `organizations_manage`) supaya pemanggil tanpa hak dapat `403`
yang jelas, bukan `409` generik yang tercampur dengan race condition
sungguhan.

### File baru

- `lib/validation/organizations.ts` — `createOrganizationSchema`,
  `updateOrganizationBrandingSchema` (dibatasi field presentasi saja —
  "Do not invent `/organizations/{id}/settings`", B6 §15 — organization_
  name/address/contact_phone/organization_type SENGAJA immutable pasca-
  create lewat HTTP), `searchOrganizationsQuerySchema`.
- `app/api/organizations/route.ts` — POST (create + auto-leader).
- `app/api/organizations/[id]/route.ts` — GET (detail, kurasi kolom untuk
  non-member) + DELETE (closure dua-langkah).
- `app/api/organizations/[id]/branding/route.ts` — PUT.
- `app/api/organizations/search/route.ts` — GET (publik, kolom kurasi).
- `app/api/organizations/[id]/dashboard/route.ts` — GET (member-only;
  `pending_invitations_count` HANYA untuk leader/staf — konten TIDAK
  dievidensi Core, keputusan rekayasa agregat ringkas dari tabel yang
  sudah ada, tanpa kolom/tabel baru).
- `app/api/organizations/[id]/activity-log/route.ts` — GET (member-only;
  MEMBACA `audit_logs` yang sudah ada difilter `organization_id`, BUKAN
  mekanisme logging kedua — "not a duplicate M09 administrative audit
  subsystem", B6 §19; admin client dipakai SETELAH `is_org_member()`
  dicek eksplisit, karena `audit_logs_select` RLS sendiri staff-only).
- `app/api/organization-members/[id]/route.ts` — DELETE (leave kalau
  `agent_id` = pemanggil sendiri, remove kalau leader/staf mengeluarkan
  member lain — soft, kolom `left_at` yang sudah ada sejak `0005`, bukan
  hard delete).

### Yang SENGAJA TIDAK dibangun (evidenced sebagai CONTROLLED GAP oleh B6 sendiri, bukan terlewat)

- `GET /organizations/{id}/members` (member list/view) — "Dedicated
  Member View/List current route is not evidenced" (B6 §9).
- Invitation Revoke, Join Request Cancel — rute tidak dievidensi (B6
  §10-11).
- OTP closure-confirm route — tidak dievidensi (B6 §12, lihat di atas).
- `/organizations/{id}/settings`, Organization Documents CRUD,
  Organization public content/announcement CRUD — B6 §15-17 eksplisit
  "No route is invented" untuk ketiganya.
- Organization Suspend/Restore/Forced Close (endpoint enforcement
  terpisah dari closure self-service) — B6 §18 eksplisit "No enforcement
  endpoint is invented"; nilai `suspended` (`0087`) tetap ada di CHECK
  constraint dan tetap bisa diaktifkan staf lewat SQL langsung, hanya
  tidak ada route HTTP untuknya.
- "Prohibited new member/invite/listing/commercial creation during
  CLOSING" (B6 §12 poin 8) — TIDAK ditegakkan di batch ini untuk
  listing/commercial (lintas-modul M03/M14, di luar cakupan); untuk
  invitation/join-request BARU, RLS `organization_invitations_insert`
  (`0050`) belum dicek ulang terhadap status organisasi — residual yang
  diketahui, bukan diam-diam diabaikan.

Diuji nyata end-to-end dengan 8 akun (superadmin/admin/manager/agent1-4/
buyer1) mencakup SELURUH siklus: create (Agent DAN Buyer, keduanya
`201`) dengan auto-leader-membership; GET detail (member = full row,
outsider = kolom kurasi tanpa address/contact_phone); search anonim
(kolom kurasi, organisasi `closing`/`closed` otomatis hilang dari hasil);
branding (leader `200`, non-member `403`, Manager `403`); invite→accept→
membership sungguhan terbentuk (dashboard `active_member_count` naik);
dashboard (leader lihat `pending_invitations_count`, member biasa tidak);
activity-log (member `200` lihat riwayat, outsider `403`); member self-
leave (`200` status `left`, leave lagi → `404` RLS-invisible karena
`is_org_member()` mensyaratkan `active`); re-invite mantan member →
reaktivasi (`200`, fix `0113` terbukti); leader force-remove (`200`
status `removed`); Lead Exit memicu `closing` otomatis (`200` + fix
`0110` terbukti lewat query langsung); closure dua-langkah penuh
(`active`→`closing`→`closed`→`409` di panggilan ketiga); percobaan SQL
langsung membalik `closed` → ditolak trigger (fix `0110` terbukti);
Manager mencoba close organisasi orang lain → `403`; Superadmin close
organisasi orang lain → `200` (jalur staf terbukti terpisah dari jalur
creator). Seluruh 8 organisasi uji (+ member/invitation turunannya lewat
CASCADE) dan 16 akun uji (dua putaran pengujian) dihapus total,
diverifikasi `0` baris tersisa.

## `POST /listings/from-project/{project_id}` — Approved Claim → Agent-owned Listing (API-034, tanpa migration baru)

Menutup gap agen/user #1 (dari sisa 4 temuan di atas): Gate
`PRE-00-H_M06_DEVELOPER_PROJECT_MARKETING_CLAIM_GATE` §19-24 mengunci
kontrak "Approved Claim → Agent-owned Listing Initialization" secara
SANGAT detail (termasuk field mapping lengkap), tapi TIDAK PERNAH
diimplementasi — sebelum route ini, klaim project developer yang sudah
`approved` tidak pernah menghasilkan listing apa pun; Agent "claim"
project tapi tidak pernah dapat listing untuk dijual/dipasarkan.

### Hard-gate (§21): Approved Claim + milik pemanggil sendiri

"Project existence alone is not sufficient to authorize Listing creation
from Project" — dicek EKSPLISIT di kode (bukan RLS baru, karena ini
aturan LINTAS-TABEL `agent_project_claims` + `developer_projects` →
`listings`, bukan RLS satu-tabel biasa): `agent_project_claims` milik
pemanggil untuk project ini harus `status='approved'`, else `403`.
RLS `listings_insert` (`0018`, `m03.listing.create` scope `'own'`) tetap
jadi penegak akhir untuk INSERT `listings` itu sendiri — tidak ada
permission baru.

### Field mapping (§22): 24 kolom identik, dikonfirmasi migration 0034 sendiri

Migration `0034` (developer_projects) SUDAH mendokumentasikan sendiri
bahwa 24 kolom detail propertinya (province_id s.d. dispute_free_
declared) "diisi TYPE/CONSTRAINT identik dengan listings" — field
mapping jadi mekanis, bukan tebakan. Pengecualian:

- `name` → `title`, `location` → `address` (agent boleh override
  keduanya lewat body — kalau project tidak punya `location`, `address`
  WAJIB dikirim, `422` kalau tidak).
- `price_min` → `price` (project cuma punya RANGE `price_min`/
  `price_max`, listing butuh SATU nilai — keputusan rekayasa: pakai
  harga awal/starting price, bukan `price_max`, konsisten praktik
  "mulai dari" untuk listing berbasis project).
- `whatsapp_number` WAJIB dari body — satu-satunya "Agent-owned field"
  eksplisit di Gate §22 yang tidak ada sama sekali di `developer_
  projects`.
- `status` listing baru SELALU `draft` (default kolom) — "Claim approval
  != Listing Publish authority" (§19), Agent tetap harus publish
  terpisah lewat `PATCH /listings/{id}/status` yang sudah ada.

### Media inheritance (§23): disalin, bukan referensi hidup

"Approved Claim permits Project Media to be inherited into the resulting
Listing media context" — baris `developer_project_media` (photo/video)
DISALIN ke `listing_photos`/`listing_videos` milik listing baru pada
request yang sama (bukan link/referensi) — "No authority leakage": salinan
di listing murni milik Agent sejak saat itu (§24, edit Agent tidak
memutasi Project sumbernya).

### Boleh dipanggil berkali-kali dari klaim yang sama

Tidak ada pembatasan "satu listing per klaim" yang dievidensi — `agent_
project_claims` UNIQUE per (agent,project), tapi `unit_availability` di
project menyiratkan project bisa punya banyak unit tersedia. Endpoint
ini SENGAJA boleh dipanggil berkali-kali dari klaim `approved` yang sama
untuk menginisialisasi listing berbeda (mis. unit A, unit B) — diuji
nyata.

### File baru

- `lib/validation/listings.ts` — tambahan `createListingFromProjectSchema`
  (`whatsapp_number` wajib, `title`/`address` opsional).
- `app/api/listings/from-project/[project_id]/route.ts` — POST.

Diuji nyata end-to-end: Agent tanpa klaim → `403`; Agent dengan klaim
`pending` (belum di-approve) → `403`; setelah Superadmin approve klaim →
Agent tanpa `whatsapp_number` di body → `422`; Agent dengan body lengkap
→ `201`, SELURUH field termapping benar (title=nama project, price=
price_min, address=location, land_area/building_area/bedrooms/bathrooms
tersalin persis, `developer_project_id` terisi FK yang sejak `0018`
memang disiapkan untuk ini, `status='draft'`); `listing_photos`/
`listing_videos` berisi persis salinan URL dari `developer_project_media`;
panggilan KEDUA dari klaim yang sama dengan `title` custom → `201`,
listing kedua independen (unit berbeda dari project yang sama). Seluruh
data uji (2 listing, 1 project, 1 developer partner, 1 klaim, 3 akun)
dihapus total, diverifikasi `0` baris tersisa.

## `0114` — `PUT /leads/{id}/status`: kolom `status` ADD-NEW untuk listing_leads (API-049)

Menutup gap agen/user #2: STEP11-B2 mengunci route-nya ("Preserve lead
status mutation route under existing authorization") TAPI eksplisit juga
menyatakan: *"The accepted physical baseline contains listing_leads with
listing_id, agent_id, source default 'whatsapp_cta', plus IP/user-agent/
timestamp evidence. **No new Lead table or endpoint is introduced by
B2.**"* — `listing_leads` (`0047`) TIDAK PUNYA kolom `status` sama
sekali, murni log kejadian klik CTA. Dicek menyeluruh: nol nama nilai
status apa pun dievidensi di seluruh korpus Core untuk resource ini.

### Vocabulary: keputusan rekayasa, lifecycle CRM minimal

Kolom `status` ADD-NEW dengan 4 nilai: `new` (default, baru tercatat),
`contacted`, `converted`, `lost` — lifecycle CRM lead paling standar/
minimal, konsisten pola "SCOPE MINIMAL evidence-respecting" yang sudah
dipakai `agents/me/leads/stats` (route lain untuk resource yang sama,
sengaja tidak mengarang metrik di luar agregasi dasar dari kolom yang
benar-benar ada).

### Otorisasi: meniru PERSIS `listing_leads_select` yang sudah ada

RLS `listing_leads_update` (baru) memakai kondisi IDENTIK dengan
`listing_leads_select` (`has_permission('m03.listing.update',
l.agent_id)`) — siapa pun yang bisa LIHAT detail lead (pemilik listing +
Superadmin — CATATAN: `m03.listing.update` scope `'own'` untuk Agent,
`'all'` HANYA Superadmin; Admin/Manager TIDAK punya baris permission ini
sama sekali di seed `0009`, jadi `GET /admin/leads` yang komentarnya
menyebut "staf scope all" pun sebenarnya hanya benar-benar berfungsi
untuk Superadmin — bukan bug yang diperbaiki di sini, karena itu
perilaku endpoint LAIN yang sudah ada, tidak diubah oleh batch ini;
hanya dicatat sebagai temuan konsisten, bukan diperbaiki diam-diam) —
bisa UBAH statusnya. Tidak ada permission baru.

### File baru

- `lib/validation/listing-media.ts` — tambahan `updateLeadStatusSchema`.
- `app/api/leads/[id]/status/route.ts` — PUT.

Diuji nyata: Agent outsider (bukan pemilik listing) -> `404` (RLS
invisible); nilai status tidak valid -> `422`; pemilik listing PUT
`contacted` -> `200`; PUT `converted` -> `200`; Superadmin PUT `lost`
pada lead milik agent lain -> `200` (jalur staf terbukti terpisah dari
jalur pemilik). Listing + lead uji dan 3 akun dihapus total, diverifikasi
`0` baris tersisa.

## `0115` — `POST /developer-partners/events`: Developer Partner event submission (M05, gap TERAKHIR)

Menutup gap TERAKHIR dari SELURUH audit endpoint agen/user M01-M15.
Dievidensi eksplisit di `PRE-00-G_M05_MANDATORY_DELTA_IMPACT_GATE` §15
"DEVELOPER PARTNER EVENT PUBLICATION": *"Developer Partner → OWN/SUBMIT →
subject to approval. Developer Partner does not directly publish the
Event through an unrestricted bypass. Core already identifies: POST
/developer-partners/events — Developer Partner; subject to approval."*
Klasifikasi: **PRESERVE, No conflict**. Sebelum migration ini, `developer_
partner` TIDAK PUNYA satu pun baris `role_permissions` untuk `m05.event.*`
— tidak bisa membuat event sama sekali, baik lewat route generik
`POST /events` maupun route khusus ini.

### "Subject to approval" TANPA mekanisme baru — murni lewat ketiadaan permission

Ini temuan paling elegan dari batch ini: `events.status` sudah `DEFAULT
'pending_approval'` sejak `0031`, dan trigger `enforce_event_lifecycle_
permissions` (0031, TIDAK diubah) sudah menolak transisi ke `'published'`
tanpa `m05.event.publish`. Migration `0115` HANYA memberi `developer_
partner` 2 permission yang SUDAH ADA sejak `0009` (`m05.event.create`,
`m05.event.update`, keduanya scope `'own'`) — SENGAJA TIDAK memberi
`m05.event.publish`/`.lifecycle`/`.cancellation`. Konsekuensinya:
submission Developer Partner FISIK selalu berhenti di `pending_approval`
sampai staf (Superadmin/Admin/Manager, `m05.event.publish` scope `'all'`)
menyetujui lewat `PUT /events/{id}` yang sudah ada — "does not directly
publish... subject to approval" terealisasi TANPA kode/kolom/trigger baru
sama sekali, murni dari kombinasi permission yang tidak diberikan.

**Catatan konsisten** (bukan diperbaiki, karena bukan bug — perilaku yang
SUDAH ADA sejak `0031` untuk role lain): Agent/Instruktur JUSTRU sudah
punya `m05.event.publish` scope `'own'` sejak seed `0009` — bisa
self-publish event sendiri. Developer Partner SENGAJA TIDAK diberi ini,
sesuai Gate §15 yang secara eksplisit membedakan Developer Partner dari
role lain untuk soal publish.

### `related_project_id` divalidasi kepemilikan eksplisit

Kalau diisi, harus project MILIK pemanggil sendiri (`developer_projects.
developer_id` → `developer_partners.user_id` = pemanggil) — dicek
eksplisit di kode karena aturan LINTAS-TABEL (`events` → `developer_
projects` → `developer_partners`), bukan RLS satu-tabel biasa.

### File baru

- `app/api/developer-partners/events/route.ts` — POST. `submitted_by`
  SELALU pemanggil sendiri (bukan dari body — beda dari `POST /events`
  generik yang membolehkan staf membuat event atas nama orang lain).

Diuji nyata dengan 4 akun (superadmin/dp1/dp2/buyer1): Buyer (tanpa
permission `m05.event.create` sama sekali) → `403`; dp1 submit event
dengan `related_project_id` = project miliknya sendiri → `201`, `status=
'pending_approval'`; dp2 (Developer Partner LAIN) mencoba pakai
`related_project_id` milik dp1 → `422` (validasi kepemilikan lintas-tabel
terbukti); dp1 `GET` event pending miliknya sendiri → `200` (lolos lewat
`m05.event.update` scope own); **dp1 mencoba self-publish → `403`**
dengan pesan trigger persis "butuh permission m05.event.publish"
(membuktikan "subject to approval" benar-benar tertutup rapat); Superadmin
approve/publish → `200`. Seluruh data uji (1 event, 1 project, 1 developer
partner, 4 akun) dihapus total, diverifikasi `0` baris tersisa.

**Ini menutup SELURUH 11 gap dari audit endpoint agen/user M01-M15**
(bersama `listings/from-project`, `leads/status`, dan M12 Organization
CRUD di atas) — digabung dengan audit admin-surface sebelumnya, SELURUH
239 endpoint STEP11-A kini tercakup (dibangun langsung, di-reuse lewat
path terdokumentasi, atau eksplisit CONTROLLED GAP yang tidak boleh
diciptakan sendiri sesuai Core).

## `0117`-`0118` + 3 route baru — M07 DBR Share/Revoke: dari fungsi SQL laten jadi endpoint HTTP nyata

Ditemukan saat deep-scan ulang repo sebelum mulai Fase C wireframe (Agent
fitur baru: M07/M13/M14/M06): `share_dbr_simulation()`, `revoke_dbr_
simulation_share()`, `get_shared_dbr_simulation()` (`0089`, Gate PRE-00-I
§26-28) sudah ada dan sudah diuji lewat RPC langsung sejak migration itu
dibuat — TAPI tidak ada satu pun route Next.js yang membungkusnya (`grep`
seluruh `apps/web/app/api` untuk `share_token`/nama fungsi-fungsi itu
nihil sebelum batch ini). Tanpa route, tombol "Bagikan ke Prospek" di
wireframe M07-DBR-Calculator (Fase C) tidak akan punya apa pun untuk
dipanggil.

### File baru

- `app/api/calculator/dbr/[id]/share/route.ts` — POST, membungkus
  `share_dbr_simulation()`. `requireIdempotencyKey: true` (fungsi ini
  MENGGANTI `share_token` setiap dipanggil — retry tanpa idempotency key
  bisa membatalkan link yang sudah terlanjur dikirim ke prospek).
- `app/api/calculator/dbr/[id]/revoke-share/route.ts` — POST, membungkus
  `revoke_dbr_simulation_share()`. Sibling terpisah dari `share/`, bukan
  digabung PUT generik — pola sama seperti refresh/unpublish listing,
  niat aksi eksplisit di path.
- `app/api/calculator/dbr/shared/[token]/route.ts` — GET, membungkus
  `get_shared_dbr_simulation()`. **TIDAK memeriksa `ctx.userId` sama
  sekali** — ini satu-satunya route M07 yang boleh diakses tanpa login
  (Gate §27: "share does not create a new platform role"), otorisasi
  murni lewat kepemilikan token yang dicek DI DALAM fungsi SQL. Dikonfirmasi
  `get_shared_dbr_simulation` sudah di-`GRANT EXECUTE` ke `anon` sejak
  `0089` (dicek lewat `has_function_privilege` langsung ke Supabase live).

Ketiganya memakai path/verb yang TIDAK dikunci eksplisit oleh Core — Gate
PRE-00-I §28 sendiri bilang "physical token/reference representation
remains downstream", jadi penamaan mengikuti konvensi sibling yang sudah
ada (`.../export-pdf`, `.../save-as-prospect`), bukan menebak kontrak yang
tidak pernah dievidensi.

### `0117_fix_dbr_prospect_trigger_blocks_share_revoke.sql` — bug regresi ditemukan SAAT baru pertama kali diuji lewat HTTP

Percobaan pertama memanggil `share_dbr_simulation()` (via RPC langsung,
sebagai pemilik simulasi yang sah) GAGAL dengan error dari trigger yang
sama sekali tidak terkait: *"dbr_simulations: hanya prospect_name/
prospect_phone yang boleh diubah lewat save-as-prospect"*.

**Root cause**: `trg_dbr_simulation_prospect_only_update` (`0099`, dibuat
untuk endpoint `save-as-prospect`) memasang `BEFORE UPDATE` trigger yang
berlaku untuk SEMUA UPDATE ke `dbr_simulations`, dari fungsi mana pun —
termasuk `share_dbr_simulation()`/`revoke_dbr_simulation_share()` (`0089`,
migration LEBIH LAMA, tapi ditulis TANPA sepengetahuan bahwa `0099` nanti
akan mengunci kolom mana saja yang boleh berubah). Trigger `0099` secara
eksplisit memblokir perubahan `share_token`/`shared_at`/`revoked_at` —
padahal ketiga kolom itu JUSTRU satu-satunya yang dimaksudkan berubah
lewat kedua fungsi `0089`. Karena tidak ada route HTTP yang pernah
memanggil `share_dbr_simulation()`/`revoke_dbr_simulation_share()` sejak
`0089` dibuat (Agustus) sampai `0099` dibuat (baru-baru ini), regresi ini
laten total — tidak pernah tertangkap sampai batch ini.

**Fix**: `CREATE OR REPLACE FUNCTION` pada trigger yang SAMA (bukan
trigger baru) — daftar kolom mutable diperluas dari `{prospect_name,
prospect_phone}` jadi juga mencakup `{share_token, shared_at,
revoked_at}`. Kolom hasil kalkulasi/finansial (`property_price`,
`loan_amount`, `dbr_percent`, `threshold_used`, dst.) tetap terkunci
immutable, tidak berubah dari niat awal `0099`.

### `0118_fix_dbr_share_revoke_null_superadmin_bypass.sql` — bug otorisasi KEDUA, ditemukan saat menguji ulang setelah `0117`

Setelah `0117` menutup bug pertama, pengujian ulang lengkap (share →
akses token → revoke → akses ditolak) dijalankan dengan `auth.uid()`
DISIMULASIKAN sebagai UUID acak yang TIDAK ADA barisnya di `public.users`
(`set_config('request.jwt.claims', ...)` langsung ke Postgres) — sebagai
kasus negatif "non-owner mencoba share/revoke simulasi orang lain,
seharusnya `403`". **Hasilnya justru `share_dbr_simulation()` BERHASIL**
membagikan simulasi milik agent lain.

**Root cause**: guard kepemilikan di kedua fungsi (`0089`) berbentuk
`IF v_row.agent_id IS DISTINCT FROM auth.uid() AND NOT public.is_
superadmin() THEN RAISE EXCEPTION`. `is_superadmin()` (`0006`) = `current_
role_code() = 'superadmin'`, dan `current_role_code()` (`0006`) JOIN
`public.users`/`public.roles` `WHERE u.id = auth.uid()` — kalau `auth.
uid()` tidak match baris `users` mana pun, hasilnya **`NULL`, bukan
`FALSE`**. `NULL = 'superadmin'` → `NULL`, jadi `is_superadmin()`
mengembalikan `NULL`. `NOT NULL` = `NULL` di SQL, dan `TRUE AND NULL` =
`NULL` — PL/pgSQL memperlakukan kondisi `IF` yang `NULL` SAMA seperti
`FALSE` (blok tidak dieksekusi), jadi `RAISE EXCEPTION` tidak pernah
terpicu. Caller yang datanya TIDAK DIKENALI sama sekali diam-diam
diperlakukan seolah dia Superadmin — kebalikan total dari yang
dimaksudkan.

**Fix**: bungkus `is_superadmin()` dengan `COALESCE(..., false)` di
kedua fungsi supaya `NULL` diperlakukan sebagai "bukan superadmin" (fail
CLOSED), bukan "entah" yang ternyata diperlakukan sebagai lolos.

**Catatan penting — pola yang SAMA ditemukan di 4 migration LAIN**
(`0019_m14_commercial_entitlement_quota.sql` fungsi `configure_refresh_
allowance`, `0024_m04_partnership_learning_result.sql` trigger
`enforce_partnership_result_validation_superadmin_only`, `0025_m14_m04_
learning_point_grant_invocation.sql` fungsi `grant_learning_points_from_
purchase`, `0050_m12_organization_document_invitations.sql` trigger
`enforce_organization_invitation_no_self_accept`) — SEMUANYA memakai
bentuk `IF NOT public.is_superadmin() THEN RAISE EXCEPTION` sebagai
satu-satunya guard, rentan NULL-bypass yang SAMA persis untuk `auth.uid()`
yang tidak match baris `public.users` (mis. race condition sinkronisasi
`auth.users`↔`public.users` saat signup, atau user yang dihapus tapi
sesinya belum kedaluwarsa). **SENGAJA TIDAK diperbaiki di batch ini** — di
luar scope "M07 DBR Share/Revoke gap" yang sedang dikerjakan, dilaporkan
terpisah ke pengguna untuk keputusan lanjutan (apakah mau ditutup sebagai
batch keamanan tersendiri).

Diuji nyata end-to-end (data dibuat lewat `execute_sql`, `auth.uid()`
disimulasikan lewat `set_config`, bukan lewat sesi HTTP sungguhan — pola
pengujian yang berbeda dari batch sebelumnya karena route baru ini
sengaja mencakup jalur TANPA sesi login sama sekali):

1. Owner sah `share_dbr_simulation()` → `share_token` terisi, `shared_at`
   terisi.
2. `get_shared_dbr_simulation(token)` TANPA `auth.uid()` sama sekali
   (mensimulasikan recipient anonim) → berhasil, data simulasi terbaca.
3. Owner sah `revoke_dbr_simulation_share()` → `revoked_at` terisi.
4. `get_shared_dbr_simulation(token)` yang SAMA, diulang → `RAISE
   EXCEPTION` ("referensi share tidak valid, sudah dicabut, atau tidak
   ditemukan") — akses benar-benar mati seketika setelah revoke.
5. **Kasus negatif (sebelum `0118`)**: `auth.uid()` = UUID acak tidak
   dikenal → `share_dbr_simulation()`/`revoke_dbr_simulation_share()` atas
   simulasi MILIK ORANG LAIN **berhasil** (bug). **Setelah `0118`**:
   percobaan identik → `RAISE EXCEPTION` "hanya Creator... yang boleh"
   (benar).

`get_advisors(type: security)` dicek setelah kedua migration — nihil
temuan BARU (36 fungsi `SECURITY DEFINER` anon-executable yang muncul
sudah ada sejak sebelum batch ini, pola project-wide yang konsisten,
bukan regresi dari perubahan ini). Data uji (1 bank, 1 simulasi DBR)
dihapus total, diverifikasi `0` baris tersisa.
