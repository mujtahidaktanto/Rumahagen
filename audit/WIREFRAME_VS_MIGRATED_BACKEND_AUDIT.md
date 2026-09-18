# Audit: Wireframe (WF-00 s.d. WF-11) vs Backend Supabase yang Sudah Dimigrasi

## Konteks

`WIREFRAME_DEEP_SCAN_REPORT.md` (audit sebelumnya) merekonsiliasi 1.126 file wireframe
menjadi struktur folder `docs/design/wireframes/` — tapi audit itu memverifikasi
wireframe terhadap **dokumen Core/spesifikasi**, bukan terhadap skema Supabase fisik.
`WF-11-final-integration-audit` sendiri menyatakan tujuannya "verifies the complete
wireframe system against the uploaded current Core... READY FOR PHYSICAL
IMPLEMENTATION" — lampu hijau untuk MULAI membangun DB, bukan bukti bahwa DB yang
akhirnya jadi memang cocok dengan wireframe.

Audit ini (2026-09-18) membandingkan seluruh 11 tahap wireframe terhadap **skema
Supabase live** (project `jawywzavznjekxxlhwqo`, 82 migration diterapkan) dan **REST
API nyata** di `apps/web/app/api/**`, dieksekusi oleh 4 agent paralel yang masing-masing
meng-query skema langsung + membaca dokumen traceability/field-audit/state-matrix
(bukan meninjau 755 file PNG mockup satu per satu).

**Belum ada satu pun halaman UI yang dibangun dari wireframe ini** (`apps/web/app`
hanya berisi `app/api/**`) — jadi semua temuan di bawah adalah gap antara *desain*
dan *backend yang sudah berevolusi*, bukan bug pada kode UI yang sudah berjalan.

## Ringkasan

| Kategori | Jumlah temuan |
|---|---|
| A — Kontradiksi langsung (wireframe menyatakan hal yang salah) | 4 (1 sudah diresolusi via `0083`) |
| B — Asumsi wireframe yang tidak punya backing backend sama sekali | 5 |
| C — Kemampuan backend nyata tanpa representasi wireframe (termasuk 3 perbaikan sesi ini) | 5 |
| D — Field hilang dari dokumentasi wireframe | 1 |
| Bersih (tidak ada temuan) | WF-00, WF-07, mayoritas field inti WF-03/04/05 |

---

## Kategori A — Kontradiksi langsung (paling serius)

### A1. ✅ DIRESOLUSI (0083) — WF-01 mengunci "TIDAK ADA gap Pending Review"; ternyata migration 0002-lah yang menyimpang dari Core, bukan wireframe

**Update 2026-09-18**: dicek langsung ke `docs/core/current/` — wireframe SUDAH BENAR
dan SUDAH konsisten dengan Core sejak awal:

- `00-governance/STEP-00/PRE-00-C_M01_IDENTITY_CONFLICT_GATE_FULL_v1.1.md`
  (status "PASS — LOCKED"): *"There is no PENDING_REVIEW gate for account
  activation... OTP VERIFIED → ACCOUNT ACTIVE."* Eksplisit menyatakan urutan
  "OTP VERIFIED → PENDING_REVIEW → Reviewer approval → ACTIVE" TIDAK VALID.
- `01-business-rules/STEP-08/RUMAHAGEN_BUSINESS_RULES_BASELINE_CONSOLIDATED_
  STEP08_v1.1.md` (M01-CI-009/STEP05-001, "LOCKED / CORE CANONICAL") — rumusan sama.
- `07-reconciliation/STEP-14-.../STEP14_CROSS_DOCUMENT_CONSISTENCY_MATRIX...csv`
  — direvalidasi PASS di rekonsiliasi FINAL Core, langkah terakhir sebelum dibekukan.

Penyimpangan sebenarnya bersumber dari `STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_
RECONCILIATION.csv` yang melestarikan definisi fisik LAMA `DEFAULT 'pending_review'`
apa adanya (ditandai `PRESERVE_EXACT_PHYSICAL_CORROBORATION` — verifikasi bentuk
fisik saja, TIDAK direkonsiliasi ulang ke keputusan semantik PRE-00-C) — lalu disalin
verbatim ke migration 0002. Inkonsistensi INTERNAL Core ini (STEP10-D fisik vs
PRE-00-C semantik) tidak pernah tertangkap oleh proses reconciliation Core sendiri,
sampai audit wireframe-vs-backend sesi ini menemukannya.

Diresolusi lewat `supabase/migrations/0083_users_default_active_no_pending_review_
gate.sql`: `public.users.status` DEFAULT diubah dari `'pending_review'` ke `'active'`.
Nilai `'pending_review'` tetap ada di CHECK constraint untuk pemakaian manual staf di
masa depan, hanya tidak lagi jadi default otomatis registrasi. Diuji nyata: user baru
dibuat tanpa menyebut status eksplisit → langsung `active`; dokumen verifikasi tetap
bisa diupload kapan saja setelah aktif (tidak digating). Analisis asli di bawah
dipertahankan sebagai jejak audit (menunjukkan bagaimana temuan ini pertama kali
terdeteksi), bukan sebagai gap yang masih terbuka.

<details>
<summary>Analisis awal (sebelum keputusan produk dikonfirmasi)</summary>

WF-01 mengunci "TIDAK ADA gap Pending Review" — bertentangan dengan default skema

- **Wireframe**: `WF-01.05-authentication/01-Scope/WF-01.05_SCOPE_v1.1.md:13` — "There is no
  default PENDING_REVIEW gate after successful OTP." Diulang di `06-States/
  WF-01.05_AUTH_STATES_v1.1.md:11`, `05-Components/WF-01.05_AUTH_COMPONENT_SPEC_v1.1.md:14-18`
  (kontrak wajib "OTP VERIFIED → ACCOUNT ACTIVE"), dan `WF-01.06-ktp-deferred-completion/
  06-States/WF-01.06_STATES_v1.0.md:19`.
- **Backend**: `supabase/migrations/0002_users.sql:23-24` — `status TEXT NOT NULL DEFAULT
  'pending_review'`. Setiap user baru DIBUAT dengan status pending_review, tidak ada jalur
  kode yang mengubahnya jadi 'active' saat registrasi/OTP. `0082_enforce_account_status_in_
  has_permission.sql:25-34` menegaskan pending_review adalah state fungsional nyata (agent
  butuh scope OWN untuk upload dokumen verifikasi selagi masih pending_review).
- **Dampak**: kalau UI dibangun mengikuti wireframe apa adanya, akan menampilkan "Akun
  Aktif" persis setelah OTP — padahal backend akan menganggapnya pending_review. Ini
  BUKAN sekadar dokumentasi usang, tapi kontrak UX yang langsung bertentangan dengan
  desain lifecycle akun yang sudah dibangun dan diuji.

</details>

### A2. WF-02.02 mengarang status listing "Suspended" yang tidak ada di skema

- **Wireframe**: `WF-02.02-my-listings-owner-view/01-Scope/WF-02.02_SCOPE_LOCK_v1.1_
  CORRECTED.md:14`, `03-Screen-Spec/WF-02.02_SCREEN_SPECIFICATION_v1.0.md:11` (filter chip
  "Suspended"), `04-State/WF-02.02_STATE_MATRIX_v1.1_CORRECTED.md:9-15`.
- **Backend**: `supabase/migrations/0018_m03_listings.sql:61` — `listings_status_check`
  = `CHECK (status IN ('draft','pending_review','published','sold','rented','expired',
  'rejected'))`. **Tidak ada nilai 'suspended'** untuk `listings.status` (itu hanya ada
  di `users.status`). Sebaliknya, `pending_review` dan `rejected` ADALAH nilai sah tapi
  tidak muncul di satu pun daftar state WF-02.02.
- **Dampak**: filter/badge "Suspended" di UI listing tidak akan pernah punya data yang
  cocok; dua state nyata (`pending_review`, `rejected`) tidak akan pernah ditampilkan.

### A3. WF-03 mengklaim organization punya 3 state ("ACTIVE→CLOSING→CLOSED"), skema cuma 2

- **Wireframe**: `WF-03.../WIRE-03_TRACEABILITY_v1.1.md` invariant #4.
- **Backend**: `organizations_status_check` = `CHECK (status = ANY (ARRAY['active',
  'closed']))` — binary langsung, tidak ada state antara "closing".

### A4. WF-03 mengklaim status klaim proyek punya 5 state termasuk "WITHDRAWN", skema/API cuma 4

- **Wireframe**: `WIRE-03_TRACEABILITY_v1.1.md` invariant #8.
- **Backend**: `agent_project_claims_status_check` = `pending/approved/rejected/revoked`;
  dikonfirmasi juga di `apps/web/lib/validation/claims.ts` (`claimStatusSchema`) dan
  `apps/web/app/api/claims/[id]/route.ts`. Tidak ada `WITHDRAWN`.

---

## Kategori B — Asumsi wireframe tanpa backing backend sama sekali

### B1. WF-02.03 wizard create-listing punya field "Highlights" dan "Tags" — tidak ada di mana pun

`02_FIELD_SEMANTIC_MATRIX_v1.2.md:36,39` (AGT-007). Tidak ada kolom `highlights`/`tags`
di `listings`, tidak ada tabel anak terkait, tidak ada penanganan di
`apps/web/app/api/listings/route.ts`.

### B2. WF-04 punya 2 layar penuh untuk entitas "Skill" yang tidak pernah dibangun

`SCREEN_INVENTORY.csv`: ADM-LRN-010 "Skill Management" dan LRN-008 "Skills & Learning
Outcomes". Query `information_schema.tables` untuk `%skill%` nihil; grep seluruh
`app/api/**` untuk "skill" nihil.

### B3. WF-04 punya layar "Learning Reconciliation" — mekanisme itu hanya ada untuk M14 Commercial

ADM-LRN-012 mengklaim scope M04. Faktanya `reconciliation_cases` kolomnya
`payment_transaction_id/commercial_order_id/fulfillment_id/entitlement_id/
mismatch_category` — eksklusif pembayaran Midtrans, tidak ada FK ke tabel learning
mana pun. Satu-satunya route terkait di `app/api/admin/commercial/reconciliation/**`.

### B4. WF-05 mendokumentasikan alur binding Event Provider lengkap — nol API

ADM-EVT-005 (`WF-05_SCREEN_INVENTORY_EXECUTED_v1.1.csv`) mendeskripsikan state
unbound/bound/switch-pending/error/denied. Tabel `event_provider_bindings` ADA di DB,
tapi grep seluruh `app/api/**` untuk referensinya nihil — berbeda dari fitur paralelnya
(`session_provider_bindings`) yang PUNYA route nyata di
`app/api/learning/sessions/[id]/provider-binding/route.ts`.

### B5. WF-03 mendokumentasikan layar create/edit/close/document Organization — tidak ada route dasar

ORG-002/005/007/008 di `WIRE-03_SCREEN_INVENTORY_v1.1.csv`. Tidak ada
`app/api/organizations/route.ts` atau `app/api/organizations/[id]/route.ts` sama
sekali — hanya sub-resource (`.../[id]/entitlements`, `/quota`, `/invitations`,
`/join-requests`). Tidak ada route yang menyentuh tabel `organizations`/
`organization_document` langsung.

---

## Kategori C — Kemampuan backend nyata TANPA representasi wireframe

Ini area yang paling relevan dengan pertanyaan awal Anda — 3 perbaikan yang saya buat
sesi ini semuanya lahir SETELAH wireframe difinalisasi:

### C1. Multi-kredensial BYOK (migration 0080) — WF-09 terlalu abstrak untuk kontradiksi langsung, tapi nol representasi

`agent_ai_connections.public_identifier`/`encrypted_secondary_key` (Cloudinary dkk.)
tidak disebut di mana pun di corpus WF-09 (`01-FOUNDATION`, `04-TRACEABILITY`). Mockup
`OPS-007_v1.1.png` cuma menampilkan satu kotak input generik "Connection inputs", jadi
tidak ada klaim literal "satu field saja" yang dilanggar — tapi konsep provider
multi-kredensial memang tidak ada representasinya sama sekali.

### C2. Kuota majemuk per addon (migration 0081) — WF-06 secara eksplisit model 1 kuota per order

`WF-06_EXPANDED_FIELD_SEMANTIC_MATRIX_v1.1.md:14-15` mendefinisikan `capacity_type`/
`capacity_value` sebagai SATU pasang kondisional per addon; `8_COMMERCIAL_SURFACE_TO_
SCREEN_TRACEABILITY_v1.1.md:5` mendeskripsikan rantai kausal sebagai tunggal ("order →
payment → M14 entitlement/quota"). Tidak ada dokumen yang mempertimbangkan satu order
menghasilkan >1 entitlement/quota grant sekaligus (seperti addon "50 refresh + 25
listing tambahan" yang saya uji nyata sesi ini) — layar "Order history"/"Entitlement"
(COM-005/COM-007) akan basi untuk addon majemuk.

### C3. Penegakan status akun (migration 0082) — seluruh rantai otorisasi WF-08 tidak menyebutnya

`WF-08_FOUNDATION_RULES_v1.1.md:18` mendefinisikan rantai resolusi otorisasi ("Role →
Role Permission → Preset → Capability → Permission → Scope → Condition → Ownership →
Organization context → Effective Result") — **tidak ada langkah status akun sama
sekali**. Tidak ada UI staf untuk suspend/reject agent, tidak ada state "Suspended"/
"Rejected" di layar ADM-002 (User Directory)/ADM-003 (User Access Detail), dan tidak
ada pembedaan pending_review (tetap boleh akses baseline) vs suspended/rejected
(sepenuhnya diblokir, termasuk untuk akun Superadmin sendiri).

### C4. Penegakan status akun (migration 0082) — WF-10 tidak punya state "akun diblokir" generik

Inventaris 22 state WF-10 (XST-001–XST-022) tidak punya entri untuk "akun
suspended/rejected". State XST-015 ("Unauthorized/Denied") itu penolakan per-aksi/
per-resource, bukan lockout akun-wide yang sekarang bikin SEMUA pemeriksaan
`has_permission()` gagal apa pun aksinya. Grep seluruh WF-10/WF-11 untuk
"suspend"/"blocked"/"account status"/"has_permission" — nihil.

### C5. Penegakan status akun (migration 0082) — tidak ada state di WF-01 login / WF-02 dashboard

Tidak ada state di `WF-01.05_AUTH_STATES_v1.1.md` (AUTH-05) atau
`WF-02.01_STATE_MATRIX_v1.0.md` untuk skenario "sesi teknis masih valid tapi akun
sudah di-suspend/reject" — persis skenario yang jadi alasan migration 0082 dibuat.

---

## Kategori D — Field hilang dari dokumentasi

### D1. WF-05 field matrix Event tidak menyebut kolom `visibility` yang nyata ada

`EVENT_FIELD_SEMANTIC_UX_MATRIX_v1.1.csv` mendaftar field lengkap `events` tapi
melewatkan `events.visibility` (`CHECK (visibility IN ('public','organization',
'private'))`) — kolom pengatur siapa yang bisa lihat/daftar Event. Hanya visibility
milik Session yang terdokumentasi (di SES-001/ADM-SES-001).

---

## Yang sudah BERSIH (tidak perlu disentuh)

- **WF-00-foundation** — murni prosedural, tidak ada klaim field/state konkret.
- **WF-07-qualification-award-title** — field evidence/evaluasi/award lifecycle cocok
  persis dengan route nyata (`awards/[id]/lifecycle`, `/restore`, `/provenance`, dst.).
- **Mayoritas field inti WF-03 Developer/Project/Media/Marketing Kit**, **WF-04
  Course/Lesson/Quiz/LP-transaction**, **WF-05 Event/Session status vocabulary** — nama
  field dan enum CHECK constraint cocok persis dengan yang diklaim wireframe.
- **WF-11 bagian meta-audit sendiri** (00-CONTROL, 01-AUDIT, 06-UX-QA, 07-RESIDUALS,
  08-GATE) — isinya struktural/proses, tidak membuat klaim field/DB spesifik yang bisa
  dikontradiksi.

---

## Rekomendasi

**Jangan bangun ulang seluruh 1.126 file.** Sebagian besar field inti (terutama
WF-00, WF-07, dan mayoritas WF-03/04/05) sudah cocok dengan baik. Yang perlu
dikerjakan adalah **addendum bertarget** — pola yang sama seperti migration ADD-NEW
yang sudah dipakai konsisten sepanjang proyek ini — untuk 15 temuan di atas, dengan
prioritas:

1. **Prioritas tertinggi (sisa Kategori A + C3-C5)** — A1 (kontrak "no pending_review")
   sudah diresolusi via `0083` (2026-09-18): backend disesuaikan ke wireframe, bukan
   sebaliknya. Yang masih terbuka: status listing yang salah (A2), dan seluruh rantai
   UI status-akun suspended/rejected yang hilang (C3-C5, satu paket karena sama-sama
   turunan migration 0082).
2. **Prioritas sedang (Kategori B)** — sebelum Bolt.new mulai membangun layar terkait,
   putuskan dulu: field/layar ini beneran mau dibangun (berarti butuh migration baru
   dulu, mis. tabel `skills`, kolom `highlights`/`tags`, route `organizations` dasar,
   route `event-provider-bindings`), atau didrop dari wireframe kalau memang di luar
   scope MVP.
3. **Prioritas rendah (C1, C2, D1)** — tambahkan sebagai catatan/addendum di dokumen
   traceability yang relevan (WF-09, WF-06, WF-05) tanpa perlu redesain mockup.

Mau saya mulai dari prioritas tertinggi — buat dokumen addendum konkret untuk
kontrak status akun (pending_review/suspended/rejected) yang bisa jadi rujukan saat
UI dibangun di Bolt.new?
