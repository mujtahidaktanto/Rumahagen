# MODULE PLANNING
## MP-09 — Admin Panel / CMS (Kerangka Dasar)
### Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 6 Agustus 2026
**Disusun sebagai:** CTO / Enterprise Architect / Solution Architect / Product Manager / Technical Product Owner / Engineering Manager / Technical Lead / Senior Backend Engineer / Senior Frontend Engineer / Senior QA Engineer / Senior Database Architect / DevOps Architect (peran gabungan)
**Tujuan Dokumen:** Acuan resmi implementasi Modul 9 (Admin Panel/CMS) — **cakupan kerangka dasar sesuai MIS**, bukan seluruh sub-menu — via Bolt.new maupun developer manual. Tidak berisi kode, tidak berisi UI mockup, tidak berisi sprint.

### Dokumen Acuan & Prioritas
| # | Dokumen | Versi Dipakai |
|---|---|---|
| 1 | Module Implementation Strategy (MIS) | v1.1 |
| 2 | Module Dependency Matrix (MDM) | v1.0 |
| 3 | Engineering Guidelines (`PROJECT-CONSTITUTION.md`) | — |
| 4 | Technical Specification | v1.0 |
| 5 | System Architecture | v1.6 |
| 6 | Technology Decisions | v1.5 |
| 7 | Database Schema (ERD §2.26-2.27 + migration `0013`) | ERD v1.3 |
| 8 | API Specification | v1.2 |
| 9 | Functional Specification | v1.0 |
| 10 | UI Specification | v1.0 |
| 11 | ERD | v1.3 |
| 12 | PRD | v1.2 |
| 13 | User Flow | v1.2 |
| *(tambahan)* | Authorization & Access Control Specification | v1.1 *(naik dari v1.0, audit Issue Register Batch 3, 6 Agustus 2026)* |
| *(tambahan)* | Entity Mapping | v1.0 |

---

## Riwayat Versi

> Tabel ini disusun retroaktif pada siklus konsolidasi ini (9 Agustus 2026) berdasarkan 3 snapshot yang tersedia — dokumen sebelumnya tidak memiliki tabel Riwayat Versi eksplisit.
>
> **⚠️ Konflik penomoran** (pola sama seperti MP-01 s.d. MP-08): ketiga snapshot berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026"** yang identik, namun merepresentasikan 3 keadaan berbeda secara kronologis-progresif. Nomor versi publik **dipertahankan "1.0"** — identifier 1.0a/1.0b/1.0c di bawah semata untuk audit. File final ini setara **1.0c**.

| Versi | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| 1.0a | 6 Agu 2026 | Rilis awal — REQ-M09-001 (CRUD akun internal Admin/Manager/Instructor) tidak punya endpoint terdokumentasi, dicatat sebagai gap murni (Konflik #2), dieskalasi ke Owner/Product sebagai keputusan produk. |
| 1.0b | 6 Agu 2026 | Gap **Resolved** (**OD-20 Opsi A**) — Owner memutuskan CRUD akun internal generik dibutuhkan Fase 1. 4 endpoint baru ditambahkan ke API Specification v1.2: `GET`/`POST /admin/internal-users`, `PUT /admin/internal-users/{id}`, `PUT /admin/internal-users/{id}/deactivate`. |
| 1.0c | 6 Agu 2026 | 2 temuan housekeeping ditandai **Acknowledged, non-blocking**: (T4-10) PRD Modul 9 tidak punya bagian Business Rules terpisah; (T4-09) kepemilikan silang kredensial GTM/GA4/GSC antara tabel M09 dan endpoint M11, dikonfirmasi sudah konsisten di implementasi. Referensi Authorization Spec naik ke v1.1. **Versi terkini** — basis dokumen final di bawah. |

---

## ✅ Catatan Verifikasi Silang (9 Agustus 2026, siklus konsolidasi ini)

> Klaim OD-20 (4 endpoint `/admin/internal-users`) diverifikasi terhadap `API-Specification-RUMAHAGEN-v1.3-FINAL.md` — **TERBUKTI ADA**, ditemukan di §11.3 baris 669-674.
>
> **Catatan penting — kasus regresi yang sudah diperbaiki lewat jalur lain:** dokumen API Specification tsb sendiri mencatat endpoint OD-20 ini **sempat hilang tanpa jejak resmi** ("dikembalikan 9 Agustus 2026 setelah sempat hilang tanpa jejak resmi di siklus penetapan status Baseline") — persis pola regresi yang ditemukan di MP-04/MP-05/MP-06. **Namun regresi ini sudah ditemukan & diperbaiki secara independen** sebagai bagian dari upgrade API Spec v1.2→v1.3 (8-9 Agustus 2026), **sebelum** audit MP-09 ini dimulai. Tidak ada tindakan tambahan diperlukan dari siklus konsolidasi ini — dicatat murni untuk kelengkapan traceability.

---

# 1. Executive Summary

Modul 9 (Admin Panel/CMS) adalah **pusat operasional internal** yang menjadi shell/hub navigasi bagi sub-menu moderasi & konfigurasi lintas modul. MIS Bagian 4 secara eksplisit menempatkan M09 di urutan implementasi **#3**, tapi **hanya "kerangka dasar"** — sub-menu substantif (Moderasi Listing, Kelola Learning Center, Kelola Event, Kelola Developer & Proyek) dibangun **bersamaan dengan modul pemiliknya masing-masing** (M03/M04/M05/M06), bukan di sini. Dokumen ini karenanya **secara sengaja membatasi cakupan** ke 3 entity/fitur yang benar-benar independen dari modul lain: `system_configs` (kerangka konfigurasi, bukan nilai bisnis spesifik seperti DBR/threshold yang baru relevan saat M07 dibangun), `audit_logs` (viewer, entity milik M09 sendiri), dan shell navigasi Admin Panel role-gated. Dependency: **M10 saja** (MDM). Go/No-Go: ✅ **GO**.

---

# 2. Purpose

Menyediakan spesifikasi kerangka dasar Admin Panel — shell navigasi, konfigurasi sistem generik, dan audit log viewer — sebagai fondasi tempat modul lain "menempelkan" sub-menu operasionalnya masing-masing di tahap implementasi berikutnya, tanpa menimbulkan rework saat sub-menu tsb ditambahkan.

---

# 3. Scope

- Shell navigasi `(admin)` route group — sidebar role-gated, hanya menampilkan sub-menu sesuai permission user (SYSTEM-ARCHITECTURE §6, §8).
- Tabel `system_configs`, `audit_logs` (ERD v1.3 §2.26-2.27) beserta RLS.
- Endpoint `GET/PUT /admin/config/system` (parameter generik: masa expired listing, passing grade default — **bukan** `dbr_config` yang punya endpoint & tabel terpisah milik M07).
- Endpoint `GET /admin/audit-logs` (viewer, REQ-M09-002 cross-cutting; REQ-M10-007 sebagai penulis dari M10).
- Endpoint `GET /admin/reports/export` (kerangka — format Excel/PDF, **tanpa** konten laporan spesifik per modul yang belum ada).
- Layar Konfigurasi Sistem (`/admin/settings`, Template C) dan kerangka Manajemen User (`/admin/users`, Template F — **bagian generik**: cari/filter/suspend, bukan approval agen yang sudah dicakup MP-01).

---

# 4. Out of Scope

- **Moderasi Listing, Kelola Learning Center, Kelola Event, Kelola Developer & Proyek** — sub-menu ini **dibangun di modul masing-masing** (M03/M04/M05/M06) saat modul tsb diimplementasikan, bukan di sini (konsisten MIS §3 catatan urutan #3: "kerangka dulu... agar tidak memblokir modul Core Business").
- **`dbr_config`** (tabel & endpoint `/admin/config/dbr`) — entity terpisah milik M07 (`ENT-M07-DbrConfig`), meski secara tematik "konfigurasi sistem" — Entity Mapping §4 poin 4 eksplisit menyatakan `DbrConfig` dan `SystemConfig` **dipertahankan terpisah**, tidak digabung.
- **Approval registrasi agen** (`/admin/agents/*`) — sudah dicakup MP-01 (entity `ENT-M01-*`), hanya **dikonsumsi** sebagai bagian shell navigasi di sini.
- **Assign role** (`/admin/users/{id}/role`) — sudah dicakup MP-10.
- **Konten laporan & analitik spesifik** (mis. laporan performa listing) — kerangka export saja, isi laporan bergantung data modul yang belum ada.
- **CRUD akun internal (Admin/Manager/Instructor baru)** — REQ-M09-001. **✅ Resolved [2026-08-06], OD-20 Opsi A** — Owner memutuskan CRUD akun internal generik dibutuhkan Fase 1. Endpoint baru ditambahkan ke API Specification v1.2: `GET/POST /admin/internal-users`, `PUT /admin/internal-users/{id}`, `PUT /admin/internal-users/{id}/deactivate`.
- Pembuatan kode, wireframe visual, dan sprint breakdown.

---

# 5. Business Objective

Menyediakan **satu titik kendali operasional** bagi staf internal (Superadmin/Manager/Admin) untuk memoderasi, mengonfigurasi, dan memantau platform — dengan visibilitas sub-menu yang secara otomatis menyesuaikan hierarki role tanpa membocorkan struktur konfigurasi inti ke role yang tidak berwenang (PRD Modul 9, "Catatan Akses Multirole").

---

# 6. Business Value

- Mengurangi kebutuhan akses database langsung untuk operasional harian (approval, moderasi, konfigurasi) — seluruhnya lewat UI terkontrol RBAC.
- Fondasi audit trail terpusat mendukung akuntabilitas & kepatuhan (UU PDP).
- Struktur shell yang dibangun lebih dulu mencegah setiap modul membangun pola navigasi admin sendiri-sendiri yang tidak konsisten (SYSTEM-ARCHITECTURE §6, satu pola folder `(admin)/**`).

---

# 7. Dependency Summary (Berdasarkan MDM)

| Arah | Isi |
|---|---|
| **Bergantung Pada** | **M10 (RBAC)** saja — MDM Bagian 3: baris M09 hanya bertanda ● di kolom M10. |
| **Dibutuhkan Oleh** | **Cross-cutting ke seluruh modul lain** sebagai objek moderasi/konfigurasi — namun **bukan hard dependency pembangunan** (MDM Bagian 3, catatan: "M09 secara arsitektural hanya *hard-depend* pada M10; relasinya ke modul lain bersifat cross-cutting read/write untuk moderasi & konfigurasi, bukan dependency pembangunan berurutan"). |
| **Prasyarat bagi** | M07 (DBR Scoring) — MIS Bagian 4: M07 butuh M09 selesai lebih dulu untuk `dbr_config` final (meski tabelnya sendiri milik M07, alur approval/config UI-nya melalui shell Admin Panel M09). |
| **Circular Dependency** | Tidak ditemukan (MDM Bagian 11). |

---

# 8. Module Position (Berdasarkan MIS)

| Dimensi MIS | Nilai |
|---|---|
| Kategori (MIS §2) | **Administration** |
| Urutan Implementasi (MIS §3) | **#3 dari 13** — "M09 — Admin Panel (kerangka dasar)" |
| Layer (MIS §13) | **Layer 1 — Identity & Configuration** |
| Prioritas (MIS §14) | **P1** |
| Batch Paralel (MIS §6) | **Batch 1** (bersama M01) |
| Critical Path (MIS §5) | Jalur paralel wajib menuju M07 (bukan node utama jalur kritis M10→M01→M06→M03→M07→M08, tapi harus selesai sebelum M07 dimulai) |
| Alasan Posisi (MIS §4) | "Hanya bergantung M10, dan wajib tersedia sebelum M07 (butuh `dbr_config`) serta menjadi tempat approval registrasi M01 berjalan penuh... Dibangun sebagai kerangka dulu (bukan seluruh fitur) agar tidak memblokir modul Core Business." |
| Go/No-Go (MIS §15) | ✅ **GO** — "Baseline, hanya bergantung M10" |

---

# 9. Stakeholder

| Stakeholder | Kepentingan |
|---|---|
| Superadmin | Pengguna utama seluruh sub-menu, satu-satunya pengelola `system_configs` |
| Manager, Admin | Pengguna sub-menu operasional dengan cakupan berbeda |
| M03/M04/M05/M06/M07 (modul yang akan "menempel" ke shell ini) | Konsumen pola navigasi & layout yang ditetapkan di sini |

---

# 10. Actor

| Actor | Peran |
|---|---|
| Superadmin | Akses penuh shell + konfigurasi sistem inti |
| Manager | Akses operasional global, tanpa konfigurasi sistem inti |
| Admin | Akses operasional standar, tanpa kelola akun Admin/Manager/Superadmin lain |
| Agen, Developer Partner | **Tidak memiliki akses Admin Panel sama sekali** (PRD Modul 9) — redirect ke Dashboard biasa (M08) |

---

# 11. User Story

| ID | Story | Sumber |
|---|---|---|
| US-M09-01 | Sebagai Superadmin/Manager/Admin, saya ingin melihat sidebar Admin Panel yang hanya menampilkan sub-menu sesuai kewenangan saya, agar saya tidak melihat opsi yang tidak relevan/tidak berwenang. | User Flow Modul 9 |
| US-M09-02 | Sebagai Superadmin, saya ingin mengatur parameter sistem generik (masa expired listing, dsb.), agar kebijakan operasional dapat disesuaikan tanpa deploy ulang. | REQ-M09-005 (parsial) |
| US-M09-03 | Sebagai Superadmin/Manager, saya ingin melihat riwayat audit log, agar saya dapat menelusuri siapa mengubah apa. | REQ-M09-002 (cross-cutting), REQ-M10-007 |
| US-M09-04 | Sebagai Superadmin/Manager/Admin, saya ingin mencari/filter daftar user dan suspend akun bermasalah, agar operasional harian dapat ditangani cepat. | REQ-M09-001 (parsial) |

---

# 12. Functional Requirement

| REQ ID | Requirement | Status Cakupan Dokumen Ini |
|---|---|---|
| REQ-M09-001 | Manajemen user (agen, admin, manager, developer partner, instruktur) | **Penuh** — cari/filter/suspend generik + CRUD akun internal baru (**✅ Resolved [2026-08-06], OD-20 Opsi A** — Owner memutuskan CRUD akun internal generik dibutuhkan Fase 1. Endpoint baru ditambahkan ke API Specification v1.2: `GET/POST /admin/internal-users`, `PUT /admin/internal-users/{id}`, `PUT /admin/internal-users/{id}/deactivate`.) |
| REQ-M09-002 | Moderasi listing & konten | **Out of Scope di sini** — milik M03 dkk., hanya shell navigasinya yang disiapkan |
| REQ-M09-003 | Manajemen konten Learning Center | **Out of Scope** — milik M04 |
| REQ-M09-004 | Manajemen data developer & proyek | **Out of Scope** — milik M06 |
| REQ-M09-005 | Konfigurasi parameter sistem | **Parsial** — parameter generik (`system_configs`) in scope; `dbr_config` Out of Scope (milik M07) |
| REQ-M09-006 | Laporan & analitik (export Excel/PDF) | **Parsial** — kerangka endpoint in scope, konten laporan Out of Scope |

---

# 13. Non Functional Requirement

| Kategori | Requirement | Sumber |
|---|---|---|
| Role-gating menu | Sub-menu tidak relevan **disembunyikan penuh**, bukan sekadar disabled (AI Context Pack §8; User Flow Modul 9) | PRD Modul 9, Authorization Spec §1.3 |
| Validasi ulang backend | Setiap aksi tetap divalidasi permission di backend sebelum eksekusi, meski sudah difilter di UI (mencegah race condition izin dicabut) | User Flow Modul 9 |
| Response time | **Not Defined** — tidak ada target ms eksplisit di Technical Specification §5 untuk M09 | Open Issue |
| Retensi audit log | **Permanen, tidak boleh dihapus/di-rotate** (migration `0013`, komentar eksplisit merujuk PROJECT-CONSTITUTION §15) | PROJECT-CONSTITUTION §15 |

---

# 14. Business Rule

Dari PRD Modul 9 "Catatan Akses Multirole" (satu-satunya bagian aturan bisnis eksplisit di PRD Modul 9 — modul ini **tidak memiliki bagian "Business Rules"/"Acceptance Criteria" terpisah** di PRD, berbeda dari modul lain, dicatat di Bagian 46):

1. **Superadmin**: akses penuh seluruh sub-menu termasuk konfigurasi sistem inti & keamanan web.
2. **Manager**: seluruh akses operasional Admin (moderasi, kelola konten, kelola akun Admin/Agen) **ditambah** "Kelola Permission Agen" di M10 — **tidak dapat** membuka konfigurasi sistem inti/keamanan web maupun permission Admin/Manager/Superadmin.
3. **Admin**: akses operasional standar — **tidak dapat** mengelola akun Admin/Manager/Superadmin lain maupun mengubah konfigurasi sistem inti.
4. **Agen**: **tidak memiliki akses ke Admin Panel sama sekali**.
5. **(ERD v1.3 §2.27, migration `0013`)** Audit log **retensi permanen** — tidak ada mekanisme hapus/rotate di skema.
6. **(Authorization Spec §2.10)** `AuditLog` View: Superadmin+Manager `all`, Admin `none` — Admin **tidak dapat** melihat audit log sama sekali, bukan hanya dibatasi cakupannya.

---

# 15. Workflow Summary

**Alur Akses Admin Panel (User Flow Modul 9):** Login → sistem cek role & permission → jika Agen/Developer Partner → menu Admin Panel tidak tampil, redirect Dashboard biasa (M08) → jika Superadmin/Admin/Manager (dengan izin) → buka Admin Panel → tampilkan hanya sub-menu sesuai matriks akses role → pilih sub-menu → lakukan aksi → **validasi ulang permission di backend** sebelum eksekusi → jika tidak diizinkan (race condition) → "Akses Ditolak" (403) → jika diizinkan → tersimpan & berlaku sistem-wide, tercatat audit log.

**Cakupan kerangka dasar dari alur di atas:** shell navigasi (langkah 1-4), sub-menu **Konfigurasi Sistem** dan **Laporan & Analitik** (kerangka), validasi backend generik, dan penulisan/pembacaan audit log. Sub-menu Moderasi Listing/Kelola Learning Center/Kelola Event/Kelola Developer **disebutkan di alur** tapi implementasinya menyusul modul masing-masing.

---

# 16. Screen List

| Kode Layar | Nama | Template (UI Spec §6) | Cakupan Dokumen Ini |
|---|---|---|---|
| SCR-M09-01 | Manajemen User | F | **Parsial** — kerangka tabel + aksi generik (cari/filter/suspend); approve/assign role dikonsumsi dari MP-01/MP-10 |
| SCR-M09-02 | Konfigurasi Sistem | C (form panjang per section) | In Scope (parameter generik saja) |

> Layar moderasi lain (Moderasi Listing, Kelola Kursus, Kelola Event, Kelola Developer, Manajemen User approval-spesifik) **tidak** didaftarkan sebagai layar M09 di dokumen ini — akan muncul sebagai bagian Screen List modul pemiliknya masing-masing.

---

# 17. Screen Detail

### SCR-M09-01 — Manajemen User (`/admin/users`)
- **Template:** F — Sidebar + Judul + Search & Filter Bar + Tabel (kolom sortable, aksi per baris) + Pagination.
- **Aktor:** Admin/Manager/Superadmin (Functional Spec §4.9).
- **Aksi cakupan dokumen ini:** cari/filter user, suspend/aktifkan akun.
- **Aksi di luar cakupan (dikonsumsi dari modul lain):** approve registrasi baru (MP-01), assign role (MP-10) — **ditampilkan di layar yang sama** secara UI (Functional Spec §4.9 menyebutnya sebagai satu kesatuan aksi), namun entity/endpoint-nya milik modul lain.

### SCR-M09-02 — Konfigurasi Sistem (`/admin/settings`)
- **Template:** C — form panjang per section, bukan tabel.
- **Aktor:** **Superadmin saja** — Manager/Admin: sub-menu ini disembunyikan (Authorization Spec §1.3).
- **Input cakupan dokumen ini:** masa expired listing, passing grade default kursus, kredensial GTM/GA4/GSC (**catatan: kredensial GTM/GA4/GSC secara entity juga tersimpan di `system_configs`, namun endpoint spesifiknya `/admin/config/seo` — lihat Bagian 51 Konflik #1**).
- **Input Out of Scope:** threshold DBR & suku bunga default (`dbr_config`, milik M07, endpoint `/admin/config/dbr` terpisah).

---

# 18. Navigation Flow

```
Login → cek role
  ├─ Agen/Developer Partner → redirect /dashboard (M08)
  └─ Superadmin/Admin/Manager → /admin (shell)
       ├─ Sidebar dinamis (role-gated, hanya sub-menu berizin tampil)
       ├─ /admin/users (SCR-M09-01)
       ├─ /admin/settings (SCR-M09-02, khusus Superadmin)
       ├─ /admin/audit-logs (viewer, khusus Superadmin+Manager)
       ├─ /admin/reports (kerangka, isi konten menyusul)
       └─ (slot navigasi untuk sub-menu modul lain: listing, learning-center,
          events, developers, roles-permission — ditambahkan saat modul terkait dibangun)
```
Sumber: User Flow Modul 9; SYSTEM-ARCHITECTURE §6 (folder `(admin)/**`).

---

# 19. API Summary

| Endpoint | Fungsi | Cakupan |
|---|---|---|
| `GET / PUT /admin/config/system` | Parameter sistem generik | In Scope |
| `GET /admin/audit-logs` | Riwayat audit | In Scope |
| `GET /admin/reports/export` | Kerangka export laporan | In Scope (kerangka) |
| `GET / PUT /admin/config/seo` | Kredensial GTM/GA4/GSC | **Dikonsumsi** — kepemilikan tematik tumpang tindih M09/M11, lihat Bagian 51 |
| `PUT /admin/config/dbr` | Threshold DBR | **Out of Scope** — milik M07 |
| `PUT /admin/users/{id}/role` | Ubah role | **Dikonsumsi dari MP-10** |
| `GET/PUT /admin/agents/*` | Approval registrasi | **Dikonsumsi dari MP-01** |

---

# 20. Endpoint Mapping

| Method | Endpoint | Auth (API Spec) | `module_code`/`action_code` | `granted_scope` |
|---|---|---|---|---|
| GET | `/admin/config/system` | Superadmin only | `M09_system_config` / `view` (`PERM-M09-View-SystemConfig`) | `all` |
| PUT | `/admin/config/system` | Superadmin only | `M09_system_config` / `manage` (`PERM-M09-Manage-SystemConfig`) | `all` |
| GET | `/admin/audit-logs` | Superadmin, Manager | `M09_audit` / `view` (`PERM-M09-View-AuditLog`) | `all` (Admin: `none`) |
| GET | `/admin/reports/export` | Superadmin, Manager, Admin | **Tidak terdaftar sebagai PERM-M09 spesifik** — Open Issue, Bagian 46 | — |

---

# 21. Request Validation

| Endpoint | Field | Validasi |
|---|---|---|
| `PUT /admin/config/system` | `config_key` | Harus salah satu kunci yang dikenal sistem — **daftar kunci valid tidak terdaftar lengkap** di dokumen sumber manapun (Open Issue Bagian 46) |
| | `config_value` | VARCHAR(255) — tipe data aktual (angka/boolean/teks) **tidak divalidasi di level skema** (kolom generik string), validasi tipe per-key wajib di service layer |
| `GET /admin/audit-logs` | Query filter | Pagination standar (`page`, `per_page`, `sort`, `order` — API Spec §0.4); filter tambahan (`entity_type`, `user_id`, rentang tanggal) **tidak dirinci eksplisit** — Open Issue |

---

# 22. Response Structure

Mengikuti envelope standar API Spec §0.2. Tidak ada struktur khusus M09. Contoh `audit_logs` list:
```json
{ "success": true, "data": [ { "id": "...", "user_id": "...", "action": "approve_listing", "entity_type": "listing", "entity_id": "...", "old_value": null, "new_value": {...}, "created_at": "..." } ], "meta": { "page": 1, "per_page": 20, "total": 512 } }
```

---

# 23. Database Impact

| Aspek | Detail |
|---|---|
| Tabel baru | `system_configs`, `audit_logs` |
| Kolom kunci | `system_configs`: `config_key` (UNIQUE), `config_value`, `updated_by`; `audit_logs`: `user_id`, `action`, `entity_type`, `entity_id`, `organization_id` (v1.3, nullable), `old_value`/`new_value` (JSONB) |
| Index | `idx_audit_logs_org` (partial, `WHERE organization_id IS NOT NULL`), `idx_audit_logs_entity` |
| RLS | `system_configs_select` (semua authenticated baca), `system_configs_manage` (Superadmin only); `audit_logs_select` (Superadmin, Manager, **atau** member Organization aktif untuk baris ber-`organization_id` miliknya — v1.3) |
| Insert `audit_logs` | **Hanya lewat service role backend** — tidak ada RLS policy INSERT untuk role `authenticated` biasa (migration `0013`, komentar eksplisit) — konsisten prinsip audit log tidak dapat dipalsukan user biasa |
| Dependency migration | `0013` mereferensikan `organization_members` (tabel M12, dibuat di migration `0007`) untuk RLS `audit_logs_select` — **migration M09 secara fisik bergantung migration M12 sudah berjalan lebih dulu**, meski secara *modul aplikasi* M09 tidak bergantung M12 (MDM). Dicatat sebagai nuansa migration-order vs module-order (konsisten temuan serupa di `CURRENT-PROJECT-STATE.md` untuk `0007`) |
| Soft-delete | **Tidak berlaku** untuk `system_configs`/`audit_logs` (bukan bagian 8 tabel wajib soft-delete) |

---

# 24. Entity Mapping

| ENT ID | Tipe | Tabel Fisik | REQ Terkait |
|---|---|---|---|
| `ENT-M09-SystemConfig` | Root (reference/config) | `system_configs` | REQ-M09-005 |
| `ENT-M09-AuditLog` | Root | `audit_logs` | REQ-M09-002; REQ-M10-007 |

---

# 25. Migration Requirement

| Item | Status |
|---|---|
| `0013_m09_admin.sql` | **Sudah ditulis** — membuat `system_configs`, `audit_logs`, RLS lengkap |
| Prasyarat | `0001` (helper function), `0003` (`users` untuk FK `updated_by`/`user_id`), **`0007`** (M12 `organizations`/`organization_members`, untuk FK `organization_id` dan RLS `audit_logs_select`) |
| Status eksekusi | **Belum dieksekusi** ke database live |
| Seed data | Tidak ada seed `system_configs` di migration — nilai default (masa expired listing, dsb.) **tidak ditentukan** di skema, harus diisi manual/seed terpisah pasca-migration — Open Issue Bagian 46 |

---

# 26. Permission Matrix

Sumber: Authorization Spec §2.10:

| Permission ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer | Endpoint |
|---|---|---|---|---|---|---|---|---|---|---|
| `PERM-M09-View-SystemConfig` | `ENT-M09-SystemConfig` | View | all | none | none | none | none | none | none | `GET/PUT /admin/config/system` |
| `PERM-M09-Manage-SystemConfig` | `ENT-M09-SystemConfig` | Manage | all | none | none | none | none | none | none | `GET/PUT /admin/config/system` |
| `PERM-M09-View-AuditLog` | `ENT-M09-AuditLog` | View | all | all | none | none | none | none | none | `GET /admin/audit-logs` |

---

# 27. Validation Matrix

| Field | Wajib? | Tipe | Aturan |
|---|---|---|---|
| `system_configs.config_key` | Ya | VARCHAR(100) | UNIQUE |
| `system_configs.config_value` | Tidak (nullable secara skema) | VARCHAR(255) | Validasi tipe per-key di service layer (Bagian 21) |
| `audit_logs.action` | Ya | VARCHAR(100) | Free text terkontrol (mis. `approve_listing`) — **tidak ada enum tertutup terdaftar** |
| `audit_logs.entity_type` | Tidak (nullable) | VARCHAR(50) | Sejak v1.3 menerima juga `organization`/`organization_member`/`organization_invitation` |

---

# 28. Error Handling

| Skenario | HTTP Status | Sumber |
|---|---|---|
| Manager/Admin mencoba akses `/admin/config/system` | 403 | Authorization Spec §2.10 |
| Admin mencoba akses `/admin/audit-logs` | 403 | Authorization Spec §2.10 |
| Agen/Developer Partner mencoba akses route `(admin)` apa pun | 403 atau redirect (User Flow Modul 9 menyebut "redirect ke Dashboard", bukan error page — **perlu klarifikasi konsistensi dengan pola 403 di modul lain**, Open Issue) | User Flow Modul 9 |
| `config_key` tidak dikenal saat `PUT /admin/config/system` | **Not Defined** — tidak ada validasi/response spesifik terdokumentasi | Open Issue |

---

# 29. Notification

**Tidak ada notifikasi spesifik M09 sendiri** yang terdokumentasi di dokumen sumber — modul ini adalah **konsumen** notifikasi dari alur modul lain (mis. "Ada agen baru menunggu review" adalah notifikasi M01 yang muncul untuk Admin, bukan notifikasi asli M09).

---

# 30. Activity Log

M09 **adalah pemilik** `audit_logs` — seluruh modul lain menulis ke tabel ini (M01, M10, M12, dst.). Tidak ada log tambahan yang perlu dicatat oleh M09 sendiri di luar perubahan `system_configs` (`config_key`/`config_value` lama→baru, `updated_by`).

---

# 31. Audit Trail

M09 memiliki **kepemilikan penuh** atas Bagian ini (berbeda dari MP-01/MP-10 yang hanya menulis) — termasuk viewer (`GET /admin/audit-logs`), kebijakan retensi permanen (Bagian 14 poin 5), dan RLS filter berdasarkan role + keanggotaan Organization aktif (untuk transparansi lintas-Organization, ERD v1.3).

---

# 32. External Integration

**Tidak ada integrasi eksternal langsung** dimiliki M09 sendiri. Kredensial GTM/GA4/GSC **disimpan** di `system_configs` (tabel milik M09) namun **dikonfigurasi & dikonsumsi** oleh M11 — lihat Bagian 51 Konflik #1 untuk analisis kepemilikan silang ini.

---

# 33. AI Capability

**Tidak ada.**

---

# 34. Performance Requirement

**Not Defined secara M09-spesifik.** Tidak ada target ms di Technical Specification §5. Prinsip umum pagination wajib untuk `audit_logs` (berpotensi tumbuh besar & retensi permanen) — Golden Rule 17 `development-playbook.md`, sudah tercermin di API Spec §0.4 pagination standar.

---

# 35. Security Requirement

1. `audit_logs` **hanya bisa di-INSERT lewat service role backend** — mencegah user memalsukan/menghapus entri audit (migration `0013`).
2. `system_configs` **manage** (UPDATE) hanya Superadmin — enforced RLS + middleware ganda.
3. Sub-menu Admin Panel **disembunyikan penuh** (bukan disabled) untuk role tanpa akses — mencegah kebocoran informasi struktur konfigurasi inti (PRD Modul 9).
4. Validasi ulang backend wajib sebelum setiap aksi eksekusi — mencegah race condition permission dicabut di tengah sesi (User Flow Modul 9).
5. Retensi audit log **permanen** — tidak ada endpoint hapus, konsisten kebutuhan forensik/kepatuhan.

---

# 36. Accessibility Requirement

**Not Defined secara M09-spesifik** di UI Specification.

---

# 37. Responsive Requirement

**Not Defined secara M09-spesifik.** SCR-M09-02 (Template C, "form panjang per section") berpotensi panjang di mobile — tidak ada breakdown responsif eksplisit terdokumentasi.

---

# 38. SEO Impact (Jika relevan)

**Tidak relevan.** Seluruh layar `(admin)` — `noindex, nofollow` (SEO Spec §1.3: `Disallow: /admin/`).

---

# 39. Configuration

M09 **adalah** modul konfigurasi itu sendiri (`system_configs`) — namun **daftar lengkap `config_key` yang valid untuk cakupan kerangka dasar** (mis. `listing_expiry_days` — disebut sebagai contoh di ERD v1.3 §2.26, tapi tidak ada daftar resmi lengkap) **tidak terdokumentasi penuh** — Open Issue Bagian 46.

---

# 40. Environment Variable

**Tidak ada environment variable baru** khusus M09 — memakai koneksi Supabase global.

---

# 41. Feature Flag

**Tidak ada feature flag terdefinisi** untuk cakupan kerangka dasar M09.

---

# 42. Acceptance Criteria

**PRD Modul 9 tidak memiliki bagian "Acceptance Criteria" terpisah** (berbeda dari mayoritas modul lain) — dicatat sebagai gap dokumentasi (Bagian 46), bukan diasumsikan. Kriteria berikut diturunkan dari kombinasi Fitur + Catatan Akses Multirole (PRD) dan User Flow, dibatasi ke cakupan kerangka dasar dokumen ini:

- [ ] Superadmin/Manager/Admin melihat sidebar Admin Panel dengan sub-menu sesuai matriks akses masing-masing; Agen/Developer Partner tidak melihat Admin Panel sama sekali.
- [ ] Superadmin dapat mengubah parameter `system_configs` generik; Manager/Admin tidak melihat sub-menu ini.
- [ ] Superadmin dan Manager dapat melihat audit log; Admin menerima 403.
- [ ] Setiap perubahan `system_configs` tercatat ke `audit_logs`.
- [ ] Percobaan akses endpoint di luar kewenangan (via manipulasi request, bukan hanya UI) selalu 403.

---

# 43. QA Test Scenario

| # | Skenario | Hasil Diharapkan |
|---|---|---|
| 1 | Superadmin buka `/admin` | Sidebar menampilkan seluruh sub-menu tersedia (termasuk yang belum diimplementasikan modul lain — **perlu keputusan UX: sembunyikan atau tampilkan "Segera Hadir"**, Open Issue) |
| 2 | Admin buka `/admin` | Sidebar **tidak** menampilkan "Konfigurasi Sistem" dan "Kelola Role & Permission" |
| 3 | Manager `PUT /admin/config/system` | 403 |
| 4 | Admin `GET /admin/audit-logs` | 403 |
| 5 | Superadmin ubah `system_configs.listing_expiry_days` | Tersimpan, tercatat di `audit_logs` dengan `old_value`/`new_value` |
| 6 | Agen mengakses langsung URL `/admin/users` | Redirect ke `/dashboard` (User Flow) — **verifikasi konsistensi:** apakah ini 403 atau redirect diam-diam (Open Issue Bagian 28) |

---

# 44. Edge Case

1. Sidebar Admin Panel dibangun sebelum sub-menu M03/M04/M05/M06 ada — **apakah link ke sub-menu tersebut ditampilkan sebagai "Segera Hadir"/disabled, atau sama sekali tidak dirender sampai modul terkait selesai?** Tidak ada keputusan UX terdokumentasi — signifikan untuk kerangka dasar ini secara langsung (Open Issue).
2. `config_key` yang di-PUT tapi belum pernah ada baris-nya di `system_configs` — insert baru atau error "key not found"? **Not Defined** (skema tidak melarang, tapi tidak ada seed awal — Bagian 25).
3. `organization_members` (dependency migration RLS `audit_logs_select`) belum ada baris (Organization pertama belum dibuat) saat M09 dieksekusi — RLS tetap valid secara sintaks SQL (subquery kosong = tidak ada match), tidak error, hanya berarti akses Organization-scoped belum relevan sampai M12 aktif — bukan bug, dicatat untuk kejelasan.

---

# 45. Risk Analysis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Migration `0013` gagal dieksekusi karena FK ke `organizations`/`organization_members` (dari `0007`) belum ada di database | Migration M09 tidak dapat dijalankan berdiri sendiri | Pastikan urutan eksekusi migration `0001→0002→...→0007→...→0013` diikuti persis, tidak melompat (Bagian 23) |
| Sidebar shell dibangun terlalu kaku (hard-code daftar sub-menu) | Rework saat M03/M04/M05/M06/M07/M10 masing-masing menambah sub-menu | Rancang shell dengan pola ekstensi (mis. daftar menu-item berbasis permission check, bukan hard-code per role) sejak awal — bagian dari Definition of Done (Bagian 49) |
| Daftar `config_key` valid tidak terdokumentasi lengkap | Admin dapat memasukkan key sembarangan tanpa validasi, atau developer salah menebak nama key saat modul lain butuh baca config | Kompilasi daftar `config_key` resmi sebagai bagian implementasi (lihat Bagian 46) |

---

# 46. Known Limitation

1. **PRD Modul 9 tidak memiliki bagian Business Rules/Acceptance Criteria terpisah** — berbeda dari pola modul lain. **Status: Acknowledged, non-blocking [2026-08-06], audit v1.1/T4-10** — inkonsistensi struktur internal PRD, tidak berdampak scope/perilaku sistem; kriteria di dokumen ini tetap valid karena disintesis dari bagian lain PRD.
2. ~~REQ-M09-001 tidak memiliki endpoint CRUD generik~~ **✅ Resolved [2026-08-06], OD-20 Opsi A** — Owner memutuskan CRUD akun internal generik dibutuhkan Fase 1. Endpoint baru ditambahkan ke API Specification v1.2: `GET/POST /admin/internal-users`, `PUT /admin/internal-users/{id}`, `PUT /admin/internal-users/{id}/deactivate`.
3. **Daftar lengkap `config_key` valid** untuk `system_configs` tidak terdaftar resmi di dokumen manapun.
4. **Kepemilikan silang kredensial GTM/GA4/GSC** antara `system_configs` (tabel, M09) dan `/admin/config/seo` (endpoint, M11). **Status: Acknowledged, non-blocking [2026-08-06], audit v1.1/T4-09** — pembagian tanggung jawab (M09 tabel, M11 endpoint) sudah konsisten di implementasi, tidak ada baris PERM-XXX yang perlu diubah.
5. **Keputusan UX untuk sub-menu yang belum ada modulnya** (link "Segera Hadir" vs disembunyikan total) belum diputuskan.
6. **`GET /admin/reports/export`** tidak memiliki `PERM-M09-*` terdaftar resmi di Authorization Spec §2.10.

---

# 47. Dependency Checklist

| Item | Status |
|---|---|
| MDM: M09 hanya bergantung M10 | ✅ Terpenuhi (MP-10 sudah direncanakan) |
| MIS: M09 urutan #3, Batch 1 | ✅ Konsisten |
| Migration `0001`, `0003` (prasyarat langsung) | ✅ Sudah ditulis |
| **Migration `0007` (M12, prasyarat RLS `audit_logs_select`)** | ✅ Sudah ditulis — **namun MDM/MIS menempatkan M12 di urutan implementasi aplikasi jauh lebih belakang (#12)**; ini murni kebutuhan urutan **eksekusi migration SQL** (FK), bukan berarti fitur M12 harus selesai duluan (konsisten catatan serupa di MP-10, dan `CURRENT-PROJECT-STATE.md`) |
| ERD v1.3 §2.26-2.27 Baseline | ✅ |
| Authorization Spec v1.0 §2.10 Baseline | ✅ |

**Kesimpulan:** Dependency modul (M10) terpenuhi. Catatan khusus: dependency **migration SQL** (`0007`) berbeda dari dependency **modul aplikasi** — keduanya dijelaskan terpisah agar tidak disalahpahami sebagai M09 harus menunggu M12 selesai dibangun sebagai fitur.

---

# 48. Definition of Ready

- [x] PRD Modul 9 Baseline (v1.2) — meski ringkas.
- [x] ERD §2.26-2.27 Baseline (v1.3).
- [x] Migration `0001`, `0003`, `0007`, `0013` tertulis.
- [x] Authorization Spec §2.10 Baseline.
- [ ] **Keputusan UX sidebar untuk sub-menu modul yang belum dibangun** — belum ada (Bagian 44/46).
- [ ] **Daftar resmi `config_key`** — belum ada.

---

# 49. Definition of Done

- [ ] Seluruh Acceptance Criteria (Bagian 42) terverifikasi.
- [ ] Migration `0013` dieksekusi sukses (setelah `0007`), RLS terverifikasi termasuk kondisi Organization-aware.
- [ ] Shell navigasi dirancang **ekstensibel** (menu-item berbasis permission check dinamis, bukan hard-code) — diverifikasi dengan skenario "tambah 1 sub-menu dummy" tanpa mengubah struktur inti.
- [ ] Unit test: RLS `system_configs`/`audit_logs`, validasi permission per role.
- [ ] E2E test: alur akses shell per role (Superadmin/Manager/Admin/Agen — termasuk Agen yang direct-redirect).
- [ ] PR lolos CI gate.
- [ ] `CURRENT-PROJECT-STATE.md` diperbarui.

---

# 50. Traceability Matrix

| REQ-XXX | ENT-XXX | Endpoint | PERM-XXX | Cakupan |
|---|---|---|---|---|
| REQ-M09-001 | `ENT-M01-User` (lintas modul) | `/admin/internal-users/*` (OD-20 Resolved) | `PERM-M09-*` | In Scope (penuh) |
| REQ-M09-002 | — | — | — | Out of Scope (milik M03) |
| REQ-M09-003 | — | — | — | Out of Scope (milik M04) |
| REQ-M09-004 | — | — | — | Out of Scope (milik M06) |
| REQ-M09-005 (parsial) | `ENT-M09-SystemConfig` | `GET/PUT /admin/config/system` | `PERM-M09-View/Manage-SystemConfig` | In Scope (generik) |
| REQ-M09-006 (parsial) | — | `GET /admin/reports/export` | — (gap) | In Scope (kerangka) |
| — | `ENT-M09-AuditLog` | `GET /admin/audit-logs` | `PERM-M09-View-AuditLog` | In Scope |

---

# 51. Conflict Analysis

| # | Konflik/Ambiguitas | Dokumen Terlibat | Resolusi |
|---|---|---|---|
| 1 | Kredensial GTM/GA4/GSC disebutkan **dua kali** dengan kepemilikan tematik ambigu: Functional Spec §4.9 mencantumkannya sebagai input di layar **Konfigurasi Sistem (M09)**, sedangkan API Specification §10 mendaftarkan endpoint **`/admin/config/seo`** (bukan `/admin/config/system`) untuk kredensial yang sama, dan SEO Specification §4.1/§7 menyatakan ini adalah tanggung jawab **M11**. | Functional Spec v1.0 §4.9 vs API Spec v1.2 §10 vs SEO Spec v1.1 §4.1/§7 | **Mengikuti API Specification** — kredensial GTM/GA4/GSC **secara fisik tersimpan** di tabel `system_configs` (M09) **namun endpoint pengelolaannya (`/admin/config/seo`) adalah tanggung jawab implementasi M11**. **Status: ✅ Closed (Acknowledged) [2026-08-06], audit v1.1/T4-09** — pembagian tanggung jawab dicatat resmi di sini, tidak memerlukan perubahan Authorization Spec (entity `ENT-M09-SystemConfig` sudah konsisten dipakai kedua modul). |
| 2 | REQ-M09-001 ("Manajemen user: agen, admin, manager, developer partner, instruktur") mengimplikasikan CRUD penuh akun internal, namun **tidak ada satu pun endpoint API** yang mendukung pembuatan akun Admin/Manager/Instructor baru oleh Superadmin — hanya `/admin/agents/*` (approval, khusus role `agent`) dan `/admin/users/{id}/role` (ubah role user existing). | PRD v1.2 REQ-M09-001 vs API Spec v1.2 (gap cakupan) | **Tidak dapat diresolusikan lewat dokumen yang ada** — ini murni **gap dokumentasi**, bukan konflik dua sumber yang saling bertentangan. Dicatat sebagai Open Issue (Bagian 46 poin 2), diformalkan sebagai **OD-20**. **Status: **✅ Resolved [2026-08-06], OD-20 Opsi A** — Owner memutuskan CRUD akun internal generik dibutuhkan Fase 1. Endpoint baru ditambahkan ke API Specification v1.2: `GET/POST /admin/internal-users`, `PUT /admin/internal-users/{id}`, `PUT /admin/internal-users/{id}/deactivate`.** |
| 3 | PRD Modul 9 tidak memiliki bagian "Business Rules"/"Acceptance Criteria" bernama eksplisit, berbeda dari pola seluruh modul lain yang diperiksa (M01, M10) — bukan konflik antar dokumen, melainkan **inkonsistensi struktur** dalam PRD itu sendiri. | PRD v1.2 (inkonsistensi struktur internal) | Dicatat di Bagian 46 poin 1 — Acceptance Criteria Bagian 42 disintesis dari bagian lain PRD + User Flow, ditandai eksplisit sebagai turunan bukan kutipan langsung. |
| 4 | Migration `0013` (M09) memiliki dependency fisik ke migration `0007` (M12) untuk RLS `audit_logs_select`, sementara MDM/MIS **tidak** mencantumkan M12 sebagai dependency modul M09 dari sisi aplikasi. | Migration SQL vs MDM/MIS | **Bukan kontradiksi** — sudah diklarifikasi sebagai perbedaan "dependency migration SQL" vs "dependency modul aplikasi", konsisten pola yang sama ditemukan di MP-10 (migration `0007` vs `0008`). Tidak memerlukan perubahan MDM/MIS. |

---

# 52. Recommendation

1. **Rancang shell navigasi Admin Panel sebagai sistem menu dinamis berbasis permission**, bukan daftar hard-code — investasi kecil di awal (M09) mencegah rework berulang setiap M03/M04/M05/M06/M07/M10 menambah sub-menu masing-masing (Bagian 45, 49).
2. **Putuskan keputusan UX untuk sub-menu yang belum ada modulnya** (disembunyikan total vs "Segera Hadir") sebelum implementasi shell dimulai — dampaknya langsung ke struktur komponen sidebar (Bagian 44/48).
3. **Susun daftar resmi `config_key` yang valid** sebagai bagian dari implementasi (bukan menunggu ad-hoc per modul) — mencegah drift penamaan key antar modul yang membaca `system_configs`.
4. ~~Eskalasi gap REQ-M09-001 ke Owner/Product~~ — **✅ Resolved [2026-08-06], OD-20 Opsi A** — Owner memutuskan CRUD akun internal generik dibutuhkan Fase 1. Endpoint baru ditambahkan ke API Specification v1.2: `GET/POST /admin/internal-users`, `PUT /admin/internal-users/{id}`, `PUT /admin/internal-users/{id}/deactivate`.
5. **Perjelas kepemilikan endpoint kredensial SEO** (Konflik #1) antara dokumentasi M09/M11 pada siklus governance berikutnya — tidak menghambat implementasi karena sudah ada resolusi kerja (API Spec sebagai rujukan), tapi berpotensi membingungkan kontributor baru bila dibiarkan.
6. **Setelah M09 kerangka dasar selesai**, lanjutkan ke M02 (Profil Agen) sesuai MIS Bagian 3 urutan #4 — M02 hanya bergantung M01 (sudah selesai), tidak menunggu M09 kecuali untuk moderasi review yang sub-menunya menyusul kemudian.

---

*Module Planning ini disusun murni berdasarkan dokumen yang diupload — tidak ada requirement yang diubah/ditambah/dihapus, tidak ada perubahan arsitektur/API/skema database. Seluruh item bertanda "Not Defined"/Open Issue dicatat apa adanya sesuai kondisi dokumen sumber.*
