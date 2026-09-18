# Audit: Core RumahAgen (`docs/core/current/`) vs Backend Supabase yang Sudah Dimigrasi

## Status perbaikan

**Tier 1 (4 temuan) — ✅ SELESAI DIPERBAIKI (2026-09-18)**, lewat
`supabase/migrations/0084_fix_m09_admin_authority_permission_bugs.sql`
(T1-1, T1-2, T1-3) dan `0085_add_agent_project_claim_withdrawn_status.sql`
(T1-4). Diuji nyata end-to-end lewat REST API sungguhan dengan 4 role test
user (superadmin/admin/manager/agent): Admin sekarang 0 baris di audit log
(sebelumnya bisa lihat, seharusnya tidak) sementara Manager bisa lihat
(sebelumnya tidak bisa); Admin berhasil `POST /ai-providers` (sebelumnya
pasti 403); Admin ditolak `403` saat mencoba Manual Correction reconciliation
sementara Superadmin tetap `200`; Agent berhasil menarik klaim pending
miliknya sendiri jadi status `withdrawn`. Data uji dibersihkan total. Detail
di bagian "Tier 1" di bawah, ditandai ✅ per temuan.

**Tier 2 (4 temuan) — ✅ SELESAI DIPERBAIKI (2026-09-18)**, lewat migration
`0086` (listing suspended), `0087` (organization closing/suspended),
`0088` (event registration approval mode), `0089` (Bank Master M07 —
paling besar), plus 2 migration perbaikan tambahan yang ditemukan SAAT
menguji ketiganya: `0090` (RLS `listings_update` belum mengizinkan staf
mencapai baris untuk suspend — trigger-nya benar tapi RLS memfilter
duluan) dan `0091` (trigger event/DBR belum `SECURITY DEFINER`, membuat
lookup lintas tabel gagal untuk caller yang RLS-nya tidak mencakup baris
sumber). Diuji nyata end-to-end lewat REST API sungguhan: Agent gagal
self-suspend listing (`403`), Manager berhasil (`200`); Leader organisasi
gagal self-suspend org sendiri, join-request pending otomatis `cancelled`
begitu org disuspend; RSVP ke event `manual_approval` otomatis berstatus
`pending_approval`, RSVP ke event `closed` ditolak `409`; Manager gagal
`POST /banks`, Admin berhasil; simulasi DBR baru otomatis snapshot
`threshold_used` dari bank yang dipilih; share via token berhasil dibaca
anonim, gagal lagi setelah di-revoke. Data uji dibersihkan total. Detail
di bagian "Tier 2" di bawah, ditandai ✅ per temuan.

**Tier 3 (4 temuan) — ✅ SELESAI DIPERBAIKI (2026-09-18)**, lewat migration
`0092` (agent_profiles Provinsi/Kota/Organization) dan `0093` (M13 BYOK
satu-koneksi-hidup-per-provider + state `unverified`). Diuji nyata:
`PUT /users/profile` menyimpan `province_id`/`city_id`/`organization_id`
dengan benar; koneksi BYOK baru selalu mulai `unverified` (bukan langsung
`active`); mencoba bikin koneksi kedua ke provider yang sama sementara yang
pertama masih hidup → `409` ditolak; `POST /ai-connections/{id}/test`
berhasil mentransisikan `unverified→active`; setelah disconnect, koneksi
baru ke provider yang sama berhasil dibuat lagi. Perbaikan companion di
`POST /ai-connections/{id}/test` (guard lama akan deadlock — koneksi baru
tidak akan pernah lolos test karena syaratnya "harus sudah active") dan
`POST /ai-connections` (pemetaan error 23505→409 yang ramah). Data uji
dibersihkan total.

## Konteks

Menyusul temuan `0083` (migration `0002_users.sql` menyimpang dari kunci Core
`PRE-00-C` soal Pending Review), dilakukan deep scan lebih luas: seluruh dokumen
Core yang langsung terbaca (**580 file** `.md`/`.csv` — gate PRE-00-A s.d. R,
STEP-03 s.d. STEP-08 business rules, STEP-10 data dictionary, STEP-14 final
reconciliation, P-SERIES) dibandingkan terhadap **83 migration** yang sudah
diterapkan ke Supabase (project `jawywzavznjekxxlhwqo`).

**Di luar scope pass ini**: 65 file `.docx`/`.zip` (seluruh `STEP-12`
Authorization/RBAC/RLS-Synchronization, `STEP-09` Architecture, `STEP-11` API
Synchronization, sebagian `STEP-13`) — perlu diekstrak dulu, belum dibaca.
Artinya M10 Authorization/RBAC HANYA dicek lewat pernyataan batas modul di
gate M08/M09/M11/M12, BUKAN lewat dokumen intinya sendiri (STEP-12).

Dieksekusi oleh 4 agent paralel per kelompok modul (M01-M03, M04-M07, M08-M12,
M13-M15), masing-masing membaca gate PRE-00-* penuh, grep matriks STEP-08/
STEP-10/STEP-14 per kode modul, lalu memverifikasi terhadap migration SQL dan
skema Supabase live.

## Ringkasan

| Tingkat | Jumlah | Keterangan |
|---|---|---|
| **Tier 1 — Bug permission aktif sekarang** | 4 (✅ semua diperbaiki `0084`/`0085`) | Staf punya akses salah HARI INI, bukan cuma gap fitur |
| **Tier 2 — State/model terkunci hilang total dari skema** | 4 (✅ semua diperbaiki `0086`-`0089`, +`0090`/`0091` fix tambahan) | Tidak ada cara merepresentasikan state ini sama sekali |
| **Tier 3 — Belum diimplementasi, sudah diketahui Core sendiri sebagai ditunda** | 4 (✅ semua diperbaiki `0092`/`0093`) | Lebih rendah urgensi — Core sudah menandainya CONTROLLED |
| **Bersih/minor** | M01, M04, M08, M11, sebagian M15; 0080/0081 dikonfirmasi BUKAN pelanggaran | — |

---

## Tier 1 — Bug permission aktif sekarang (paling mendesak)

### T1-1. ✅ DIPERBAIKI (0084) — Audit Log administratif: Manager dan Admin TERTUKAR

- **Core**: `PRE-00-K_M09_ADMINISTRATION_AUTHORITY_GATE_FULL_v1.0.md` §3 baris
  `M09-R04`: *Administrative Audit Log — View | Superadmin=ALL | **Manager=ALL** |
  **Admin=NONE***.
- **Migration**: `supabase/migrations/0009_seed_authorization.sql:375-376` — yang
  diberi `m09.administrative_audit_log.view` scope `all` justru **superadmin +
  admin**, BUKAN manager. Bahkan komentar migration `0012_admin_audit_logs.sql`
  sendiri salah menyalin aturan ini ("Superadmin=ALL, Admin=ALL").
- **Dampak nyata SEKARANG**: Manager tidak bisa lihat audit log sama sekali;
  Admin bisa — persis terbalik dari yang dikunci Core.

### T1-2. ✅ DIPERBAIKI (0084) — Provider Catalogue: akses Admin hilang

- **Core**: gate yang sama, `M09-R10`: *Provider Catalogue — View/Manage |
  Superadmin=ALL | Manager=NONE | **Admin=ALL***.
- **Migration**: `0009_seed_authorization.sql:88,381` — `m09.provider_catalogue.
  mutation` HANYA diberikan ke `superadmin`. Permission M13 turunannya
  (`m13.provider_catalogue.create/edit/enable/disable/retire`) juga
  superadmin-only.
- **Dampak nyata**: Admin tidak bisa kelola katalog provider AI sama sekali,
  padahal seharusnya ALL.

### T1-3. ✅ DIPERBAIKI (0084) — Reconciliation Manual Correction: seharusnya Superadmin-only, Admin ikut bisa

- **Core**: gate yang sama, guardrail #6-7 dan baris `M09-R09`: *Manual
  Correction = Superadmin ALL / Manager NONE / **Admin NONE*** — eksplisit
  dipisah dari Review/Escalate.
- **Migration**: `supabase/migrations/0076_m14_reconciliation_cases.sql:41-43`
  — SATU policy `FOR ALL` memakai `m14.commercial_administration.manage_
  commercial_resources`, yang diberikan ke superadmin DAN admin (`all` scope).
  Tidak ada pembedaan Review vs Escalate vs Manual Correction.
- **Dampak nyata**: Admin bisa melakukan koreksi manual kasus reconciliation
  keuangan, padahal itu dikunci Superadmin-only.

### T1-4. ✅ DIPERBAIKI (0085) — Klaim proyek: status "withdrawn" hilang — bug fungsional langsung

- **Core**: `PRE-00-H_M06_..._GATE_FULL_v1.1.md` §17-18/§46/§51 mengunci siklus
  5-state: `PENDING → APPROVED/REJECTED/REVOKED`, dan `PENDING → WITHDRAWN`
  (Agent boleh menarik klaim miliknya sendiri yang masih pending).
- **Migration**: `supabase/migrations/0035_m06_marketing_kit_claims.sql:34` —
  `agent_project_claims_status_check` cuma `('pending','approved','rejected',
  'revoked')`. Tidak ada `withdrawn`.
- **Dampak nyata**: RLS UPDATE policy-nya sendiri sudah ditulis mengasumsikan
  Agent bisa menarik klaim (`0035`/`0041`) — tapi kalau dicoba, akan GAGAL di
  level CHECK constraint database. Ini bukan gap fitur, ini fitur yang setengah
  dibangun dan akan error saat dipakai.

---

## Tier 2 — State/model terkunci hilang total dari skema

### T2-1. ✅ DIPERBAIKI (0086, +0090) — `listings.status` tidak punya nilai "suspended" (enforcement)

- **Core**: `PRE-00-E_M03_LISTING_REFRESH_GATE_FULL_v1.1.md` §10: SUSPENDED
  dikunci sebagai *enforcement state* untuk pelanggaran aturan platform —
  eksplisit "bukan pengganti PENDING_REVIEW". Direvalidasi PASS di STEP-08 dan
  STEP-14 final.
- **Migration**: `0018_m03_listings.sql:61` — `listings_status_check` = `draft,
  pending_review, published, sold, rented, expired, rejected`. Tidak ada
  `suspended`.
- **Root cause**: sama persis pola bug `0002`/`0083` — `STEP10-D_ATTRIBUTE_TO_
  PHYSICAL_COLUMN_RECONCILIATION.csv` melestarikan definisi lama tanpa
  disilangkan ke kunci PRE-00-E §10.

### T2-2. ✅ DIPERBAIKI (0087) — `organizations.status` tidak punya "closing" dan "suspended"

- **Core**: `PRE-00-N_M12_ORGANIZATION_MEMBERSHIP_AUTHORITY_GATE_FULL_v1.0.md`
  §6: siklus operasional terkunci `ACTIVE → CLOSING → CLOSED` PLUS state
  enforcement terpisah `SUSPENDED`. Direvalidasi PASS di STEP-14 final
  (`M12-CI-002`).
- **Migration**: `0005_organizations.sql:19` — `CHECK (status IN ('active',
  'closed'))`. Cuma 2 state biner, tidak ada `closing`/`suspended`.
- **Dampak**: alur "Close → Confirm" dua langkah yang dikunci Core tidak bisa
  direpresentasikan; aturan "join-request dibatalkan otomatis kalau organisasi
  CLOSING/SUSPENDED/CLOSED" tidak bisa berjalan untuk 2 dari 3 state sumbernya.

### T2-3. ✅ DIPERBAIKI (0089, +0091) — M07 DBR: seluruh model Bank Master + threshold per-bank tidak ada — GAP TERBESAR

- **Core**: `PRE-00-I_M07_DOMAIN_ALIGNMENT_GATE_FULL_v1.1.md` §9-11 dan
  sub-step `PRE-00-I-1` (RESOLVED — PASS/LOCKED): model threshold tunggal
  global (`dbr_threshold_percent`) dinyatakan **usang/RECONCILE-SUPERSEDED**,
  diganti: Bank Master → konfigurasi/threshold per-bank → snapshot historis
  `threshold_used` → simulasi merujuk bank terpilih → Share/Revoke
  (creator-owned, recipient view-only, revocable).
- **Migration**: `0008_dbr_config.sql` masih persis model lama
  (`dbr_threshold_percent DECIMAL(5,2) DEFAULT 35.00`, tanpa referensi bank
  sama sekali); `0052_m07_dbr_simulations.sql` tidak punya `bank_id`, tidak ada
  snapshot `threshold_used`, tidak ada field share/revoke. Tidak ada tabel
  `bank`/`bank_master` sama sekali di 83 migration.
- **Dampak**: seluruh modul DBR yang berjalan hari ini memakai desain yang
  SUDAH DINYATAKAN USANG oleh Core sejak lama — bukan cuma field yang kurang,
  tapi model datanya sendiri yang salah arsitektur.

### T2-4. ✅ DIPERBAIKI (0088, +0091) — M05 Event Registration: mode approval per-event tidak ada kolomnya sama sekali

- **Core**: `PRE-00-G_M05_MANDATORY_DELTA_IMPACT_GATE_FULL_v1.0.md` §17/§47
  (`M05-DELTA-011/012`, LOCKED): default AUTO-CONFIRM, dengan override
  CLOSED/MANUAL APPROVAL yang bisa dikonfigurasi per Event Owner.
- **Migration**: `0031_m05_events.sql`/`0032_m05_event_registrations.sql` —
  tidak ada kolom apa pun untuk menyimpan mode approval, dan
  `event_registrations_status_check` cuma `registered/waitlist/attended/
  cancelled` (tidak ada state "menunggu approval").
- **Dampak**: bukan cuma logika yang belum ditegakkan — skemanya sendiri tidak
  punya kapasitas menyimpan perilaku ini sama sekali.

---

## Tier 3 — ✅ SEMUA DIPERBAIKI (0092/0093) — Belum diimplementasi, tapi SUDAH ditandai Core sendiri sebagai ditunda

Lebih rendah urgensi karena bukan penyimpangan diam-diam — dokumen gate-nya
sendiri sudah mengakui ini CONTROLLED/downstream residual, bukan LOCKED yang
dilanggar.

### T3-1 & T3-2. ✅ DIPERBAIKI (0092) — `agent_profiles` kehilangan field Provinsi/Kota dan Organization Name

`PRE-00-D_M02_..._GATE_FULL_v1.1.md` §11.2 (`M02-CI-021`, AUGMENT/LOCK) dan
§11.3 (`M02-CI-022`, PRESERVE/CLARIFY) mengunci field Provinsi/Kota (bukan satu
field alamat bebas) dan Organization Name di Agent Profile. `0029_m02_agent_
profiles.sql` hanya punya `coverage_area` (free text) dan `office_name` —
tidak ada province_id/city_id atau organization_name/organization_id. Gate
PRE-00-D v1.1 ini direvisi SETELAH STEP10-D terakhir disinkronkan, jadi gap-nya
bukan penyimpangan tapi keterlambatan propagasi.

### T3-3 & T3-4. ✅ DIPERBAIKI (0093) — M13 BYOK: guard "satu koneksi aktif per provider" dan state "unverified" belum ada

`PRE-00-O_M13_..._GATE_FULL_v1.0.md` §9 mengunci satu koneksi aktif per
provider per Agent (belum ada unique index `(user_id, provider_id)`); §7-8
mengunci siklus `CREATE → UNVERIFIED → test → VALID/ACTIVE` dengan AI ditolak
selagi UNVERIFIED (skema `agent_ai_connections.status` langsung default
`'active'`, tidak ada `unverified`). **Keduanya sudah ditandai gate ini sendiri
sebagai residual/regression-risk CONTROLLED** (§43/§47) — bukan temuan baru,
tapi masih terbuka.

---

## Dikonfirmasi BUKAN pelanggaran (perlu diketahui, tidak perlu dikoreksi)

- **`0080` (multi-kredensial BYOK) dan `0081` (multi-kuota addon)**: dicek
  penuh terhadap `PRE-00-O`/`PRE-00-P` — **Core tidak punya kunci semantik apa
  pun yang membatasi kardinalitas kredensial/kapasitas**. Yang membatasi HANYA
  snapshot fisik lama di STEP10-D (`PRESERVE_EXACT_PHYSICAL_CORROBORATION`),
  yang memang belum diperbarui setelah kedua migration ini. Ini beda kualitatif
  dari bug `0002`/`pending_review` — di sana Core memang MENGUNCI larangan
  eksplisit yang dilanggar; di sini Core diam saja. Tindak lanjutnya cukup
  dokumentasi (update baris CSV STEP10-D), bukan migration baru.
- **M01** — bersih setelah `0083`.
- **M04, M08, M11** — bersih sepenuhnya, semua residual gate sudah ditutup.
- **M15** — bersih pada semua yang dicek (14 tabel STEP10-D-nya tidak punya
  satu pun `CONTROLLED_PHYSICAL_DELTA`, cross-module scan PRE-00-R "NONE"),
  meski belum di-diff kolom-per-kolom secara lengkap untuk semua tabel karena
  keterbatasan waktu agent.
- **M03 refresh/quota/lifecycle** (di luar temuan T2-1) — cocok persis dengan
  Core, termasuk satu deviasi urutan pemeriksaan yang didokumentasikan secara
  sadar sebagai non-semantic di komentar migration.

---

## Rekomendasi

1. ✅ **Selesai** — 4 temuan Tier 1 sudah diperbaiki (`0084`/`0085`) dan diuji
   nyata end-to-end lewat REST API sungguhan.
2. ✅ **Selesai** — 4 temuan Tier 2 sudah diperbaiki (`0086`-`0089`, +`0090`/
   `0091` fix tambahan yang ketemu saat testing) dan diuji nyata end-to-end.
   Bank Master (T2-3) adalah fitur baru yang cukup besar — lihat catatan di
   `supabase/migrations/README.md` untuk detail desain lengkap sebelum UI-nya
   dibangun di Bolt.
3. ✅ **Selesai** — 4 temuan Tier 3 sudah diperbaiki (`0092`/`0093`) dan
   diuji nyata end-to-end, termasuk 2 fix companion di route `/ai-
   connections` yang ketemu saat testing.
4. **Dokumentasi ringan**: perbarui baris STEP10-D untuk `AGENT_AI_CONNECTIONS`
   dan `ADDONS` supaya konsisten dengan `0080`/`0081` (bukan urgent, murni
   housekeeping dokumentasi).

Mau saya mulai dari Tier 1 (perbaikan permission) — itu yang paling berisiko
karena sudah live sekarang?
