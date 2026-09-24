# Deep Scan — Kesiapan Fase D (Admin Wireframe) — 2026-09-24

## Ringkasan eksekutif

Berbeda dari Fase B/C (yang masing-masing butuh perbaikan gap backend
nyata sebelum wireframe bisa dibangun), **Fase D TIDAK punya gap backend
besar tersisa**. `audit/CORE_DOCX_ZIP_VS_MIGRATED_BACKEND_AUDIT.md`
(2026-09-23) sudah menyatakan eksplisit: *"SELURUH 5 gap fitur besar dari
STEP-09/11/12 deep scan sudah tuntas... Tidak ada gap fitur besar tersisa
dari audit ini."* Dikonfirmasi ulang di sesi ini: 40 route di bawah
`app/api/admin/**` + sejumlah route non-`/admin` yang secara fungsional
admin-only (banks, ai-providers, awards/appeals, dst.) — semuanya sudah
terpasang, terdokumentasi lengkap di komentar kode masing-masing, dan
tidak ada pola bug NULL-bypass baru (grep ulang `is_superadmin()` tanpa
`COALESCE` di seluruh 119 migration — hanya 4 lokasi lama `0019/0024/0025/
0050` yang SUDAH diperbaiki via `0119`, tidak ada instance baru).

**Yang dibutuhkan untuk memulai Fase D murni pekerjaan wireframe** —
BUKAN backend. Tapi ada satu temuan penting: **tabel status Fase D di
`docs/design/wireframes-v2/README.md` under-count** — daftar "Menyusul"
yang ada sekarang (11 item) melewatkan ~13 permukaan admin yang backend-nya
SUDAH ADA dan SUDAH diverifikasi, tapi belum pernah disebut sebagai item
wireframe yang perlu dibuat sama sekali.

## Metodologi

1. `find apps/web/app/api/admin` + grep top-level `api/` untuk resource
   non-`/admin` yang fungsinya staff-only (banks, ai-providers, awards
   appeal/lifecycle, dbr-simulations, dst.).
2. Baca header comment SETIAP route (konvensi proyek ini selalu
   mendokumentasikan sumber API-ID, migration, dan RLS/permission gate di
   komentar atas file) — bukan menerka dari nama file saja.
3. Query live `role_permissions` × `permissions` × `roles` untuk
   memastikan role/scope PERSIS (Superadmin-only vs Admin/Manager vs ada
   baris Agent 'own') — dipakai untuk menentukan Tweaks-panel role-gating
   tiap wireframe nanti.
4. Re-grep pola NULL-bypass (`IF NOT public.is_superadmin()` tanpa
   `COALESCE`) di seluruh 119 migration untuk pastikan tidak ada instance
   baru sejak `0119`.
5. Cross-check `docs/design/wireframes-v2/README.md` (status Fase D saat
   ini) vs inventori nyata di atas.

## Inventori lengkap — 24 permukaan admin, dikelompokkan per modul

Kolom **Scope** = role yang benar-benar lolos RLS/`has_permission()` di
DB live (bukan asumsi dokumen), Superadmin selalu implisit lolos lewat
`is_superadmin()` OR-condition kecuali disebut lain.

### M09 — User & Access Management

| # | Permukaan | Route(s) | Scope | Status wireframe |
|---|---|---|---|---|
| 1 | Direktori Pengguna (list + suspend) | `GET /users` (RLS), `PUT /admin/agents/{id}/suspend` | Admin/Manager (suspend: scope all) | ✅ **Sudah ada** (`04-admin-user-directory.dc.html`, Fase D 🟡) |
| 2 | Internal Staff (create/deactivate akun staf admin/manager/superadmin) | `GET/POST /admin/internal-users`, `PUT .../{id}`, `PUT .../{id}/deactivate` | **Superadmin-only** (dicek manual di kode, bukan RLS — pakai Supabase Admin API) | ⬜ Menyusul (di list README) |
| 3 | Role assignment per user | `PUT /admin/users/{id}/role` | — (perlu dicek terpisah, kemungkinan Superadmin) | ⬜ **Belum disebut di README** — kandidat digabung ke item Permission Matrix |
| 4 | Permission Matrix (baseline Role×Permission) | `GET/PUT /admin/permissions/matrix` | View: Admin/Manager/Superadmin; Manage: **Superadmin-only** | ⬜ Menyusul |
| 5 | Permission Preset (List/Create/Edit, khusus target role Agent) | `GET/PUT /admin/permissions/matrix/agent` | View: Admin/Manager/Superadmin; Manage: **Manager + Superadmin** (Admin hanya view) | ⬜ Menyusul (satu screen sama dgn #4) |
| 6 | Assign/Revoke Preset ke user tertentu | `GET/PUT /admin/users/{id}/permission-preset` | Manage: Manager+Superadmin; View: +Admin | ⬜ Menyusul (aksi di dalam screen #4/#5) |

### M09 — Konten & Konfigurasi

| # | Permukaan | Route(s) | Scope | Status wireframe |
|---|---|---|---|---|
| 7 | Banners / Public Announcement-Promotion | `GET/POST /admin/banners`, `[id]` | Admin/Manager/Superadmin | ⬜ Menyusul |
| 8 | Notification Templates (6 tipe terkunci) | `GET /admin/notification-templates`, `PUT [type]` | Admin/Manager/Superadmin | ⬜ Menyusul |
| 9 | System Configuration (key-value generik) | `GET/PUT /admin/config/system`, `[key]` | **Superadmin-only** (view DAN manage) | ⬜ **Belum disebut di README** |
| 10 | SEO Configuration + Reindex | `GET/PUT /admin/config/seo`, `POST /admin/seo/reindex` | **Superadmin-only** (pakai permission `m09.system_configuration.manage`, bukan permission M11 sendiri) | ⬜ Menyusul (README sebut "M11-SEO") |
| 11 | Push Notification broadcast manual | `POST /admin/notifications/push` | Superadmin/Admin (dicek di dalam fungsi `create_notification()`) | ⬜ **Belum disebut di README** |

### M09 — Oversight / Audit

| # | Permukaan | Route(s) | Scope | Status wireframe |
|---|---|---|---|---|
| 12 | Audit Log viewer (read-only) | `GET /admin/audit-logs` | Admin + Superadmin | ⬜ **Belum disebut di README** |
| 13 | Administrative Export (CSV audit_logs) | `GET /admin/reports/export` | **Superadmin-only** (lebih ketat dari #12 — diverifikasi nyata Manager 403 di sini) | ⬜ **Belum disebut di README** |
| 14 | Agent Review exception queue | `GET /admin/agent-reviews/pending`, approve/reject | Staff (m02.review scope all) | ⬜ **Belum disebut di README** — murni jalur exception (biasanya kosong, auto-approved sejak `0083`), prioritas rendah |

### M03 — Listing

| # | Permukaan | Route(s) | Scope | Status wireframe |
|---|---|---|---|---|
| 15 | Moderasi Listing (review pasca-publish) | `GET /admin/listings/pending`, approve/reject | Approve/reject BUTUH `m03.listing.publish` — **Manager punya `.suspend` tapi TIDAK PERNAH `.publish`**, jadi tombol Approve harus disembunyikan/disabled untuk Manager | ⬜ Menyusul |
| 16 | Leads oversight (semua leads lintas agent) | `GET /admin/leads` | Staff (m03.listing.update scope all) | ⬜ **Belum disebut di README** |

### M07 — DBR/Bank

| # | Permukaan | Route(s) | Scope | Status wireframe |
|---|---|---|---|---|
| 17 | Bank Master CRUD | `GET/POST /banks`, `[id]` | View: Admin/Agent/Manager; Configure: **Admin+Superadmin** | ⬜ Menyusul |
| 18 | DBR Simulations oversight (lintas agent) | `GET /admin/dbr-simulations` | Staff (m07.dbr.domain_operations scope all) | ⬜ **Belum disebut di README** — kandidat digabung sebagai tab di screen #17 atau screen sendiri |

### M13 — AI / BYOK

| # | Permukaan | Route(s) | Scope | Status wireframe |
|---|---|---|---|---|
| 19 | Provider Catalogue CRUD | `GET/POST /ai-providers`, `[id]` | **Superadmin-only** untuk create/edit/disable/enable/retire | ⬜ Menyusul |
| 20 | Force revoke/disconnect/disable koneksi BYOK milik agent tertentu | `POST /admin/ai-connections/{id}/force` | **Superadmin-only** | ⬜ **Belum disebut di README** — kandidat digabung ke screen #19 sebagai aksi di daftar koneksi, BUKAN daftar provider itu sendiri (dua entitas beda: provider = katalog, connection = pasangan user-provider) |

### M04 — Learning

| # | Permukaan | Route(s) | Scope | Status wireframe |
|---|---|---|---|---|
| 21 | Learning Economy Configuration (formula LP) | `GET/PUT /admin/learning/configuration` | Admin/Manager/Superadmin | ⬜ Menyusul |
| 22 | Learning Activity catalog admin (CRUD definisi aktivitas) | `GET/POST /admin/learning/activities`, `[id]` | Admin/Manager/Superadmin | ⬜ **Belum disebut di README** — berbeda dari #21 (itu formula/angka, ini katalog konten) |
| 23 | Learning Point manual adjustment | `POST /admin/learning-point-adjustments` | Superadmin/Admin/Manager (No Agent self-adjust) | ⬜ **Belum disebut di README** — kandidat tool kecil di dalam screen #21 |
| 24 | Certificate issuance (manual, staff-only) | `POST /admin/certificates` | Staff-only (`m04.certificate.manage`, Agent TIDAK PERNAH diberi grant) | ⬜ **Belum disebut di README** |

### M14 — Commercial

| # | Permukaan | Route(s) | Scope | Status wireframe |
|---|---|---|---|---|
| 25 | Reconciliation Cases (list + resolve) | `GET /admin/commercial/reconciliation`, `[id]`, `[id]/resolve` | Staff-only (FOR ALL) | ⬜ Menyusul ("M14-Komersial-Admin") |
| 26 | Entitlement reconcile (buka case investigasi) | `POST /admin/commercial/entitlements/reconcile` | Sama seperti #25 | ⬜ Menyusul (aksi di screen yang sama) |
| 27 | Manual Correction (mutasi entitlement langsung) | Field/aksi di dalam #25 kemungkinan | **Superadmin-only** (`m14.commercial_administration.manual_correction`, dipisah eksplisit dari Review/Escalate) | ⬜ Menyusul — **PENTING: tombol ini harus terpisah visual dari Review/Escalate biasa, role-gate beda (Superadmin vs Admin+Superadmin)** |

### M15 — Award / Title / Qualification

| # | Permukaan | Route(s) | Scope | Status wireframe |
|---|---|---|---|---|
| 28 | Award Appeal (list + decide) | `GET/POST /awards/{id}/appeals`, `decide` | Admin/Manager/Superadmin (Agent scope 'own' SENGAJA tidak lolos — anti self-approval) | ⬜ Menyusul |
| 29 | Award restore (setelah appeal approved) | `POST /awards/{id}/restore` | Sama seperti #28 — **endpoint TERPISAH, tidak otomatis dipanggil oleh `/decide`** | ⬜ Menyusul (langkah eksplisit ke-2 setelah decide, di screen yang sama) |
| 30 | Awarding Path / Rule configuration | `GET/PUT/... /awarding-paths`, `/awarding-path-versions`, `/awarding-rule-versions`, `/titles`, `[id]/status` | Admin/Manager/Superadmin | ⬜ **Belum disebut di README** — permukaan cukup kompleks (path punya versioning + status lifecycle) |
| 31 | Title Authority / Scope Binding configuration | `GET/PUT /titles/{id}/authority-scopes`, `title-authority-scopes/{id}` | Admin/Manager/Superadmin | ⬜ **Belum disebut di README** |

### M06 — Developer Partner (irisan dengan Fase F yang belum mulai)

| # | Permukaan | Route(s) | Scope | Status wireframe |
|---|---|---|---|---|
| 32 | Developer Project administrative create/list | `GET/POST /admin/developer-projects`, `[id]` | RLS mengizinkan staff DAN Developer Partner sendiri (scope own) — satu route, dua pemakai | ⬜ **Belum disebut di README** — **butuh keputusan**: sisi staff (oversight/moderasi) masuk Fase D, sisi Developer Partner (self-service create) menunggu Fase F yang belum mulai sama sekali |

## Temuan tambahan (bukan gap kode, tapi perlu diperhatikan saat desain)

- **M03 Moderasi Listing**: tombol "Approve" harus disembunyikan/disabled
  untuk viewer Manager (punya `.suspend` tapi tidak `.publish`) — kalau
  tidak, wireframe akan menyesatkan (menunjukkan aksi yang di backend akan
  gagal 403).
- **M14 Manual Correction** vs **Review/Escalate**: dua tingkat otorisasi
  berbeda dalam SATU domain reconciliation — wireframe wajib membedakan
  visual+gating, bukan satu tombol generik "Selesaikan".
- **M15 Appeal Decide** vs **Restore**: dua panggilan API terpisah yang
  harus tetap terpisah di UI (2 langkah eksplisit), BUKAN digabung jadi
  satu tombol "Setujui & Pulihkan" — kontrak backend sengaja tidak
  menggabungkannya (lihat komentar route `decide`).
- **M09 Direktori Pengguna (sudah ada)** TIDAK mencakup role assignment
  atau preset assignment sama sekali (dicek isi wireframe) — kedua aksi
  itu murni permukaan baru (#3/#6), tidak ada duplikasi/tumpang tindih
  perlu diperbaiki di file yang sudah ada.
- **M09 Internal Staff** vs **Direktori Pengguna**: dua konsep beda —
  Internal Staff = MEMBUAT akun staf baru (Superadmin-only, lewat Admin
  API, sangat sensitif); Direktori Pengguna = melihat/suspend akun yang
  SUDAH ada (termasuk staf, agent, developer partner sekaligus). Data demo
  di wireframe `04-admin-user-directory.dc.html` sudah benar mencampur
  role admin/manager/agent/developer_partner di satu daftar — ini
  konsisten, bukan bug.

## Rekomendasi pengelompokan screen (usulan, bukan keputusan final)

Supaya tidak menghasilkan 32 file terpisah yang berlebihan (banyak
resource di atas kecil/single-purpose), usulan pengelompokan realistis
— **6-8 wireframe screen** untuk menutup seluruh 24 item + 3 yang sudah
disebut README:

1. **M09-Direktori-Pengguna** — sudah ada, TIDAK perlu perubahan.
2. **M09-Internal-Staff** — item #2 saja (screen sendiri, sensitivitas tinggi).
3. **M09-Permission-Matrix** — gabung #3, #4, #5, #6 (satu console: tab
   Baseline Matrix, tab Preset Agent, aksi assign per-user).
4. **M09-Konten-Konfigurasi** — gabung #7 Banners, #8 Notification
   Templates, #11 Push broadcast (tab per sub-fungsi) — SATU screen area
   konten, atau pecah jadi 2 kalau terlalu ramai (Banners+Push vs Templates).
5. **M09-System-SEO-Config** — gabung #9 System Config, #10 SEO Config
   (keduanya Superadmin-only, key-value sederhana, layak satu screen).
6. **M09-Audit-Oversight** — gabung #12 Audit Log, #13 Export, #14 Agent
   Review queue (satu console "read/oversight-heavy").
7. **M03-Moderasi-Listing** — #15 (+ opsional tab #16 Leads oversight).
8. **M07-Bank-Master** — #17 (+ opsional tab #18 DBR Simulations oversight).
9. **M13-Provider-Catalogue** — #19 (+ #20 Force-action sebagai tab
   "Koneksi Agent" di screen yang sama).
10. **M04-Learning-Economy-Config** — #21 (+ #22 Activity catalog, +
    #23 Point adjustment sebagai tab/tool tambahan) — atau pecah #22 jadi
    screen sendiri kalau kontennya berat. #24 Certificate issuance bisa
    jadi tab kecil juga di sini.
11. **M14-Komersial-Admin** — #25, #26, #27 (satu screen, Manual
    Correction ditandai visual beda + role-gate beda).
12. **M15-Award-Appeal** — #28, #29.
13. **M15-Awarding-Path-Admin** — #30, #31 (screen terpisah dari Award
    Appeal karena beda sifat: satu operasional harian/appeal, satu
    konfigurasi jarang-berubah).
14. **M06-Developer-Project-Admin** — #32, sisi staff SAJA (bukan
    self-service Developer Partner — itu domain Fase F terpisah).

Ini artinya realistis **~11-14 screen** (desktop+mobile masing-masing),
bukan 32 — konsisten dengan gaya Fase B/C yang menggabungkan
resource-resource kecil terkait ke satu screen dengan tab/section,
daripada satu file per endpoint.

## Yang TIDAK perlu dikerjakan sekarang

- **Tidak ada migration baru** yang perlu ditulis untuk memulai Fase D.
- **Tidak ada route API baru** yang perlu ditulis — semua 24+ permukaan
  di atas sudah py punya backend nyata dan teruji (per audit 2026-09-23).
- Satu-satunya "pekerjaan non-wireframe" yang tersisa dari sesi
  sebelumnya (gate OTP M12 organisasi) sudah selesai dan tidak
  berhubungan dengan Fase D.

## Referensi

- `audit/CORE_DOCX_ZIP_VS_MIGRATED_BACKEND_AUDIT.md` — konfirmasi tidak
  ada gap fitur besar tersisa.
- `supabase/migrations/README.md` — riwayat lengkap 119 migration.
- `docs/design/wireframes-v2/README.md` — status Fase D saat ini (perlu
  diupdate begitu screen mulai dibangun).
- Query live `role_permissions`/`permissions`/`roles` (2026-09-24) — dasar
  kolom Scope di setiap tabel di atas.
