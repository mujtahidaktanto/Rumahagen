# MODULE PLANNING
## MP-06 — Direktori Kerjasama Developer (Marketing Gallery)
### Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 6 Agustus 2026
**Disusun sebagai:** CTO / Enterprise Architect / Solution Architect / Product Manager / Technical Product Owner / Engineering Manager / Technical Lead / Senior Backend Engineer / Senior Frontend Engineer / Senior QA Engineer / Senior Database Architect / DevOps Architect (peran gabungan)
**Tujuan Dokumen:** Acuan resmi implementasi Modul 6 (Direktori Kerjasama Developer) via Bolt.new maupun developer manual. Tidak berisi kode, tidak berisi UI mockup, tidak berisi sprint.

### Dokumen Acuan & Prioritas
| # | Dokumen | Versi Dipakai |
|---|---|---|
| 1 | Module Implementation Strategy (MIS) | v1.1 |
| 2 | Module Dependency Matrix (MDM) | v1.0 |
| 3 | Engineering Guidelines (`PROJECT-CONSTITUTION.md`) | — |
| 4 | Technical Specification | v1.0 |
| 5 | System Architecture | v1.6 |
| 6 | Technology Decisions | v1.5 |
| 7 | Database Schema (ERD §2.11-2.14 + migration `0006`) | ERD v1.3 |
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
> **⚠️ Konflik penomoran** (pola sama seperti MP-01/02/03/04/05): ketiga snapshot berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026"** yang identik, namun merepresentasikan 3 keadaan berbeda secara kronologis-progresif. Nomor versi publik **dipertahankan "1.0"** — identifier 1.0a/1.0b/1.0c di bawah semata untuk audit. File final ini setara **1.0c**.

| Versi | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| 1.0a | 6 Agu 2026 | Rilis awal — 2 gap terbuka: (1) definisi cakupan "wilayah eksklusif" (`is_exclusive_by_region`) tidak ada di dokumen manapun, implementasi tidak dapat dilanjutkan; (2) API Specification §10.3 hanya mendaftarkan `POST /admin/developer-projects`, gap dokumentasi CRUD. |
| 1.0b | 6 Agu 2026 | Gap #1 **Resolved** (**OD-19 Opsi A**) — cakupan wilayah eksklusif = per Kota (`city_id` proyek), tidak perlu field baru, enforcement via `EXISTS` check di service layer. |
| 1.0c | 6 Agu 2026 | Gap #2 **diklaim** Diperbaiki (audit v1.1/T4-11) — 3 endpoint (`GET`/`PUT`/`DELETE /admin/developer-projects{/id}`) diklaim ditambahkan ke API Spec §10.3. Referensi Authorization Spec naik ke v1.1. **Versi terkini** — basis dokumen final di bawah. |

---

## 🟢 Catatan Verifikasi Silang (ditambahkan & diselesaikan 9 Agustus 2026, siklus konsolidasi ini)

> **REGRESI KETIGA TERKONFIRMASI — pola sama seperti MP-04/MP-05, kali ini di API Specification (bukan migration SQL).** Snapshot 1.0c mengklaim 3 endpoint CRUD admin (`GET`/`PUT`/`DELETE /admin/developer-projects{/id}`) sudah ditambahkan ke `API-Specification-...v1.2.md` §10.3 pada "2026-08-06". **Verifikasi langsung terhadap `API-Specification-RUMAHAGEN-v1.3-FINAL.md` yang diupload Owner (9 Agustus 2026) membuktikan klaim ini TIDAK TERBUKTI** — §10.3 (satu-satunya lokasi kontrak API Modul 6 di dokumen tsb) masih persis 4 endpoint lama, sama seperti versi 1.0b (pra-perbaikan). Dikonfirmasi bahwa file yang diverifikasi adalah versi terbaru (bertanggal 8-9 Agustus 2026, lebih baru dari klaim 6 Agustus).
>
> **Berbeda dari MP-04 (gap fitur) dan MP-05 (bug keamanan aktif), regresi ini adalah gap kontrak dokumentasi** — tidak ada risiko keamanan langsung, tapi endpoint GET-list-admin/PUT/DELETE yang dijanjikan Functional Spec §4.6 ("CRUD data developer partner & proyek") tidak punya kontrak formal untuk diimplementasikan.
>
> **✅ DIPERBAIKI [2026-08-09]** — atas instruksi Owner, 3 endpoint ditambahkan ke `API-Specification-RUMAHAGEN-v1.3-FINAL-FIXED.md` §10.3, dengan catatan regresi eksplisit di dokumen tsb. **Status Konflik #2 sekarang benar-benar Resolved.** File API Specification terbaru harus menggantikan versi lama di project.
>
> **Pola sistemik terkonfirmasi 3 dari 3 kasus yang diverifikasi** (MP-04/migration `0009`, MP-05/migration `0010`, MP-06/API Specification §10.3) — seluruhnya berasal dari sesi kerja 6 Agustus 2026 yang mencatat "Diperbaiki" di dokumen module planning tanpa perubahan benar-benar tersimpan ke dokumen sumber terkait.

---

# 1. Executive Summary

Modul 6 adalah katalog resmi proyek developer sebagai "bahan jualan" yang dapat diklaim agen untuk dijadikan listing (kategori Primary). Mengelola 4 entity: `developer_partners`, `developer_projects`, `developer_project_media`, `agent_project_claims`. Bergantung pada M01 dan Referensi Wilayah (`city_id`) saja (MDM), dibangun **sebelum M03** karena `listings.developer_project_id` mereferensikannya — dikonfirmasi eksplisit di komentar migration `0006`. Berada di MIS Batch 2 (paralel dengan M02/M04/M13). Migration SQL **sudah ditulis lengkap**. Ditemukan **konflik permission** signifikan: Authorization Spec menyatakan Developer Partner punya akses `own` untuk CRUD `DeveloperProject`, namun PRD, RLS aktual, dan API Spec **tiga-tiganya sepakat** ini seharusnya Admin-only (lihat Bagian 51). Go/No-Go: ✅ **GO**.

---

# 2. Purpose

Menyediakan spesifikasi implementasi lengkap Modul 6 sebagai rujukan tunggal — scope fungsional, kontrak API, aturan bisnis, matriks permission, kriteria selesai — termasuk resolusi konflik permission antar-dokumen yang ditemukan.

---

# 3. Scope

- Tabel `developer_partners`, `developer_projects`, `developer_project_media`, `agent_project_claims` (ERD v1.3 §2.11-2.14) beserta RLS.
- Endpoint `GET /developer-projects`, `GET /developer-projects/{id}`, `POST /developer-projects/{id}/claim`, `POST /admin/developer-projects` (API Spec §10.3).
- Layar: Katalog Proyek Developer, Detail Proyek & Klaim, Kelola Developer & Proyek (UI Spec §6).
- Referensi wilayah (`city_id` FK `ref_cities`) — dikonsumsi dari shared kernel M03, tidak didefinisikan ulang.
- Materi marketing kit (upload & unduh — foto HD, video, brosur PDF, price list).
- Tracking agen pemasar proyek (`agent_project_claims`).

---

# 4. Out of Scope

- **Auto-generate listing dari klaim proyek** (`POST /listings/from-project/{project_id}`) — endpoint ini secara eksplisit berada di seksi API "Property & Listing Management" (API Spec, bukan §10.3), entity target-nya `ENT-M03-Listing` — milik M03, hanya **dipicu** dari alur M06.
- **Skema komisi sebagai perhitungan/laporan finansial otomatis** — `commission_scheme` hanya field deskriptif (VARCHAR) yang **ditampilkan**, bukan engine kalkulasi komisi otomatis (tidak ada tabel/logika perhitungan komisi di ERD manapun).
- **Kebijakan eksklusivitas per wilayah** (`is_exclusive_by_region`). **✅ Resolved [2026-08-06], OD-19 Opsi A** — cakupan wilayah eksklusif = per Kota (`city_id`). Tidak perlu field baru — memakai `developer_projects.city_id` yang sudah ada. Enforcement: saat `is_exclusive_by_region=true`, cek `EXISTS` proyek lain aktif dengan `is_exclusive_by_region=true` di `city_id` sama sebelum insert/update (service layer, bukan constraint DB — mirip pola validasi lain di modul ini).
- Referensi Wilayah (`ref_cities` dkk.) sebagai shared kernel — didefinisikan di M03, hanya dikonsumsi.
- Pembuatan kode, wireframe visual, dan sprint breakdown.

---

# 5. Business Objective

Menjadi kanal kolaborasi bisnis resmi antara agensi dan developer properti — memastikan data proyek (harga, ketersediaan unit) yang dipasarkan agen selalu sinkron dengan data resmi developer, mengurangi risiko informasi usang/salah ke calon pembeli.

---

# 6. Business Value

- Mempercepat proses agen mendapatkan "bahan jualan" resmi tanpa negosiasi manual per proyek dengan developer.
- Data terpusat mengurangi risiko agen memasarkan info harga/unit yang sudah usang.
- Materi marketing kit siap pakai (foto HD, brosur) meningkatkan kualitas materi promosi agen.
- Tracking klaim mendukung transparansi skema komisi/reporting ke developer.

---

# 7. Dependency Summary (Berdasarkan MDM)

| Arah | Isi |
|---|---|
| **Bergantung Pada** | **M01** (Auth) dan **Referensi Wilayah** (shared kernel, bukan modul bernomor) — MDM Bagian 3, Bagian 2 (M06): "Bergantung Pada: Authentication, Referensi Wilayah". |
| **Dibutuhkan Oleh** | **M03** (listing kategori Primary via `developer_project_id`), **M05** (event launching proyek developer), **M11** (SEO, sumber halaman publik) — MDM Dependency Matrix Bagian 3. |
| **Circular Dependency** | Diperiksa eksplisit MDM Bagian 11 — arah resmi **M03 bergantung M06** (bukan sebaliknya), dikonfirmasi FK `listings.developer_project_id` di ERD dan urutan migration (`0006` sebelum `0008`). Redaksi ambigu Technical Spec §3 (M06 brief menyebut "M03 listing Primary turunan" sebagai dependency) sudah diresolusikan di MDM Bagian 10 Konflik #2 — **tidak diulang analisisnya di sini**, hanya dirujuk. |

---

# 8. Module Position (Berdasarkan MIS)

| Dimensi MIS | Nilai |
|---|---|
| Kategori (MIS §2) | **Core Business** |
| Urutan Implementasi (MIS §3) | **#5 dari 13** |
| Layer (MIS §13) | **Layer 2 — Core Domain (independen satu sama lain)** |
| Prioritas (MIS §14) | **P1** |
| Batch Paralel (MIS §6) | **Batch 2** — bersama M02, M04, M13 |
| Alasan Posisi (MIS §4) | "M06 sebelum M03 karena M03 butuh `developer_project_id` (FK, ERD v1.3) untuk listing kategori Primary." |
| Go/No-Go (MIS §15) | ✅ **GO** — "Baseline, bergantung M01" |

---

# 9. Stakeholder

| Stakeholder | Kepentingan |
|---|---|
| Admin/Manager/Superadmin | Pengelola data resmi proyek developer |
| Developer Partner | Sumber data (via Admin), penerima laporan tracking klaim |
| Agen | Konsumen katalog, pengklaim proyek untuk dipasarkan |
| M03 | Konsumen `developer_project_id` untuk listing Primary |

---

# 10. Actor

| Actor | Peran |
|---|---|
| Superadmin, Manager, Admin | CRUD penuh data developer & proyek (Business Rule PRD: "Hanya admin") |
| Developer Partner | Login opsional; peran API/RLS-nya **terbatas** — lihat Bagian 51 Konflik #1 |
| Agen | Browsing katalog, klaim proyek |
| Guest | Browsing katalog publik (read-only) |

---

# 11. User Story

| ID | Story | Sumber |
|---|---|---|
| US-M06-01 | Sebagai Admin, saya ingin menambahkan proyek developer (nama, lokasi, tipe, harga, brosur), agar agen punya bahan jualan resmi. | REQ-M06-001 |
| US-M06-02 | Sebagai Agen, saya ingin klaim proyek untuk otomatis jadi listing, agar saya tidak input manual data resmi. | REQ-M06-002 |
| US-M06-03 | Sebagai Agen, saya ingin melihat skema komisi per proyek, agar saya tahu potensi pendapatan. | REQ-M06-003 |
| US-M06-04 | Sebagai Agen, saya ingin mengunduh materi marketing kit, agar saya bisa langsung promosi. | REQ-M06-004 |
| US-M06-05 | Sebagai Admin, saya ingin mengatur status proyek (Aktif/Coming Soon/Sold Out/Non-Aktif), agar katalog selalu akurat. | REQ-M06-005 |
| US-M06-06 | Sebagai Admin/Developer, saya ingin melacak agen mana saja yang memasarkan proyek, agar komisi/reporting akurat. | REQ-M06-006 |

---

# 12. Functional Requirement

| REQ ID | Requirement | Status Cakupan |
|---|---|---|
| REQ-M06-001 | Katalog proyek developer | In Scope |
| REQ-M06-002 | Klaim proyek → auto-generate listing | In Scope (pencatatan klaim); generate listing itu sendiri Out of Scope (milik M03) |
| REQ-M06-003 | Skema komisi ditampilkan | In Scope (field deskriptif) |
| REQ-M06-004 | Materi marketing kit diunduh | In Scope |
| REQ-M06-005 | Status proyek | In Scope |
| REQ-M06-006 | Tracking agen pemasar | In Scope |

---

# 13. Non Functional Requirement

| Kategori | Requirement | Sumber |
|---|---|---|
| Real-time sync harga/unit | "Perubahan harga/unit availability dari developer harus tercermin real-time ke semua listing turunan agen" | PRD Business Rule |
| Index filter | `idx_developer_projects_filter` (`city_id`, `status`, `property_type`) — "setara listing" untuk performa filter | Migration `0006`, ERD v1.3 §4 poin 13 |
| Rendering | Katalog & Detail Proyek termasuk 5 tipe halaman wajib SSR/SSG (SEO Spec §1.1: "Detail Proyek Developer") | SEO Spec §1.1 |
| Response time | **Not Defined** | Open Issue |

---

# 14. Business Rule

Dari PRD Modul 6:

1. **Hanya admin** (Superadmin/Manager/Admin) yang dapat menambahkan/mengubah **data proyek** developer (data resmi, sensitif harga).
2. Satu proyek dapat diklaim **banyak agen sekaligus** (non-eksklusif) **kecuali** dikonfigurasi eksklusif per wilayah (`is_exclusive_by_region`).
3. Perubahan harga/unit availability dari developer **harus tercermin real-time** ke semua listing turunan agen (implikasi: listing turunan **membaca** data resmi, bukan menyalin permanen — konsisten API Spec §2 "field harga/spesifikasi resmi read-only bagi Agen" untuk listing Primary tertaut).

---

# 15. Workflow Summary

**Alur 6.1 — Admin Menambahkan Proyek (User Flow):** Buka "Kelola Developer & Proyek" → "+ Tambah Proyek" → isi data developer (nama perusahaan, PIC, kontak) → isi data proyek (nama, lokasi, tipe, price list, unit availability, skema komisi) → upload materi marketing kit → set status → Publish → tampil di katalog.

**Alur 6.2 — Agen Klaim Proyek (User Flow):** Buka "Katalog Kerjasama Developer" → filter/cari → klik proyek → lihat detail (price list, komisi, marketing kit) → klik "Klaim Proyek Ini" → jika eksklusif wilayah & sudah diklaim agen lain → notifikasi tidak tersedia; jika tersedia → sistem catat agen sebagai pemasar → tawarkan "Buat Listing dari Proyek Ini?" → Ya → redirect form Tambah Listing (M03) dengan data auto-filled kategori Primary.

---

# 16. Screen List

| Kode Layar | Nama | Template (UI Spec §6) | Aktor |
|---|---|---|---|
| SCR-M06-01 | Katalog Proyek Developer | A | Public |
| SCR-M06-02 | Detail Proyek & Klaim | B | Public (lihat), Agen (klaim) |
| SCR-M06-03 | Kelola Developer & Proyek | F | Superadmin, Manager, Admin |

---

# 17. Screen Detail

### SCR-M06-01 — Katalog Proyek Developer (`/developer-projects`)
- **Template:** A.
- **Konten:** grid proyek — nama, lokasi, tipe, rentang harga, status.

### SCR-M06-02 — Detail Proyek & Klaim (`/developer-projects/[slug]`)
- **Template:** B.
- **Konten:** detail lengkap, skema komisi, materi marketing kit (unduh).
- **Aksi:** "Klaim Proyek Ini" (Agen) → auto-generate draft Listing kategori Primary tertaut.

### SCR-M06-03 — Kelola Developer & Proyek (`/admin/developer-projects`)
- **Template:** F.
- **Aksi (Functional Spec §4.6):** CRUD data developer partner & proyek, upload materi marketing kit, ubah status.
- **Catatan:** **✅ Diperbaiki [2026-08-06], audit v1.1/T4-11** — 3 endpoint ditambahkan ke `API-Specification-...v1.2.md` §10.3 (`GET/PUT/DELETE /admin/developer-projects{/id}`). 🟢 **VERIFIKASI 9 Agustus 2026: klaim TIDAK TERBUKTI saat dicek (endpoint tidak ada di `API-Specification-...v1.3-FINAL.md`) — sekarang BENAR-BENAR ditambahkan via `API-Specification-RUMAHAGEN-v1.3-FINAL-FIXED.md`. Status Resolved terverifikasi.**

---

# 18. Navigation Flow

```
/developer-projects (katalog) ──► /developer-projects/[slug] (detail)
     ├─ klik "Klaim Proyek Ini" (Agen) ──► tercatat di agent_project_claims
     │       └─ "Buat Listing dari Proyek Ini?" → Ya → /dashboard/listings/new?from_project={id} (M03)
     └─ (Guest/tanpa login) ──► hanya lihat, tombol klaim tidak tampil/redirect login

(admin)/developer-projects ──► "+ Tambah Proyek" ──► form data developer+proyek+media ──► Publish
```
Sumber: User Flow Modul 6; Functional Spec §4.6.

---

# 19. API Summary

| Endpoint | Fungsi |
|---|---|
| `GET /developer-projects?city_id={id}&property_type=...` | Katalog (filter) |
| `GET /developer-projects/{id}` | Detail |
| `POST /developer-projects/{id}/claim` | Klaim proyek (Agen) |
| `POST /admin/developer-projects` | Tambah data developer & proyek (Admin+) |
| *(dikonsumsi, bukan dimiliki)* `POST /listings/from-project/{project_id}` | Auto-generate listing (milik M03) |
| *(dikonsumsi)* `POST /developer-partners/events` | Pengajuan event Developer Partner (milik M05) |

---

# 20. Endpoint Mapping

| Method | Endpoint | Auth (API Spec) | `module_code`/`action_code` | `granted_scope` |
|---|---|---|---|---|
| GET | `/developer-projects` | Public/Authenticated | `M06_developer` / `view` | `all` (publik, RLS `developer_projects_select` mengizinkan `true` tanpa filter) |
| GET | `/developer-projects/{id}` | Public/Authenticated | idem | `all` |
| POST | `/developer-projects/{id}/claim` | Agen | `M06_developer` / `create` (`PERM-M06-Create-AgentProjectClaim`) | `own` |
| POST | `/admin/developer-projects` | Superadmin, Manager, Admin | `M06_developer` / `manage` | `all` — **RLS aktual tidak memberi akses ke Developer Partner**, meski Authorization Spec §2.7 mencantumkan DevPartner=`own` untuk aksi ini (lihat Bagian 51 Konflik #1) |

---

# 21. Request Validation

| Endpoint | Field | Validasi |
|---|---|---|
| `POST /admin/developer-projects` | `city_id` | Wajib, FK valid `ref_cities` — **bukan freetext** |
| | `property_type` | Enum: `rumah`\|`apartemen`\|`ruko`\|`tanah`\|`gudang`\|`kavling`\|`lainnya` |
| | `status` | Enum: `active`\|`coming_soon`\|`sold_out`\|`inactive`, default `coming_soon` |
| | `slug` | UNIQUE, auto-generate (pola sama listing, **tidak eksplisit dikonfirmasi** memakai `{short_id}` seperti SEO Spec §1.2 — Open Issue) |
| `POST /developer-projects/{id}/claim` | — | RLS `claims_insert_own`: `agent_id = auth.uid()`; UNIQUE `(agent_id, project_id)` mencegah klaim ganda oleh agen yang sama |
| | Eksklusivitas wilayah | **✅ Resolved [2026-08-06], OD-19 Opsi A** — cakupan wilayah eksklusif = per Kota (`city_id`). Tidak perlu field baru — memakai `developer_projects.city_id` yang sudah ada. Enforcement: saat `is_exclusive_by_region=true`, cek `EXISTS` proyek lain aktif dengan `is_exclusive_by_region=true` di `city_id` sama sebelum insert/update (service layer, bukan constraint DB — mirip pola validasi lain di modul ini). — implementasi validasi (service layer) menjadi task teknis Sprint M06, bukan lagi Open Decision |

---

# 22. Response Structure

Mengikuti envelope standar API Spec §0.2. Tidak ada struktur khusus M06 di luar pola umum.

---

# 23. Database Impact

| Aspek | Detail |
|---|---|
| Tabel baru | `developer_partners`, `developer_projects`, `developer_project_media`, `agent_project_claims` |
| Index | `idx_developer_projects_slug` (UNIQUE), `idx_developer_projects_filter` (`city_id`,`status`,`property_type`), `idx_dpm_project` |
| RLS | `developer_partners_select` (publik baca aktif), `developer_partners_manage` (`user_id=auth.uid()` **ATAU** `all`-scope — self-service DevPartner untuk profil perusahaannya sendiri); `developer_projects_select` (publik penuh, `true`); `developer_projects_manage` (**hanya** `all`-scope, **tidak ada** klausa self-service DevPartner); `dpm_select`/`dpm_manage` (sama pola `developer_projects`); `claims_select_own`, `claims_insert_own` |
| Soft-delete | **Hanya `developer_partners`** termasuk 8 tabel wajib soft-delete; `developer_projects`, `developer_project_media`, `agent_project_claims` **tidak** |
| Trigger | `trg_developer_projects_updated_at` |
| Dependency migration | `0006` bergantung `0004` (`ref_cities`) dan `0003` (`users`) — **dibangun sebelum `0008` (M03)** karena `listings.developer_project_id` mereferensikannya (komentar eksplisit di migration `0006`) |

---

# 24. Entity Mapping

| ENT ID | Tipe | Tabel Fisik | REQ Terkait |
|---|---|---|---|
| `ENT-M06-DeveloperPartner` | Root | `developer_partners` | REQ-M06-001 |
| `ENT-M06-DeveloperProject` | Root | `developer_projects` | REQ-M06-001, 002, 005 |
| `ENT-M06-DeveloperProjectMedia` | Child of DeveloperProject | `developer_project_media` | REQ-M06-004 |
| `ENT-M06-AgentProjectClaim` | Association (User × DeveloperProject) | `agent_project_claims` | REQ-M06-002, 006 |

---

# 25. Migration Requirement

| Item | Status |
|---|---|
| `0006_m06_developer.sql` | **Sudah ditulis** — membuat 4 tabel, RLS lengkap |
| Prasyarat | `0001`, `0003` (`users`), `0004` (`ref_cities`) |
| Status eksekusi | **Belum dieksekusi** ke database live |
| Late-binding FK | **Tidak ada** — berbeda dari M02/M10, migration M06 tidak menunda FK apa pun ke migration lain (seluruh FK-nya sudah tersedia dari `0003`/`0004`) |
| Prasyarat bagi migration lain | `0008` (M03) bergantung `0006` untuk FK `listings.developer_project_id` |

---

# 26. Permission Matrix

Sumber: Authorization Spec §2.7 — **disandingkan dengan temuan RLS aktual**:

| Permission ID | Entity | Aksi | Superadmin | Manager | Admin | Agent | DevPartner (Auth Spec) | **DevPartner (RLS Aktual)** |
|---|---|---|---|---|---|---|---|---|
| `PERM-M06-Create/View/Update-DeveloperPartner` | `ENT-M06-DeveloperPartner` | C/V/U | all | all | all | none | **own** | **✅ Konsisten** — RLS `developer_partners_manage` mengizinkan `user_id=auth.uid()` |
| `PERM-M06-Create/View/Update/Delete-DeveloperProject` | `ENT-M06-DeveloperProject` | C/V/U/D | all | all | all | none | **own** (tertulis Authorization Spec) | **❌ Tidak konsisten** — RLS `developer_projects_manage` **hanya** `auth_has_scope_all`, tidak ada klausa `user_id=auth.uid()` sama sekali |
| `PERM-M06-Create/Delete-DeveloperProjectMedia` | `ENT-M06-DeveloperProjectMedia` | C/D | all | all | all | none | **own** (tertulis) | **❌ Tidak konsisten** — RLS `dpm_manage` sama pola dengan `developer_projects_manage`, hanya `all`-scope |
| `PERM-M06-Create/View-AgentProjectClaim` | `ENT-M06-AgentProjectClaim` | C/V | all | all | all | own | none | — (tidak relevan bagi DevPartner) |

> Lihat Bagian 51 Konflik #1 untuk analisis & resolusi lengkap perbedaan ini.

---

# 27. Validation Matrix

| Field | Wajib? | Tipe | Aturan |
|---|---|---|---|
| `developer_projects.city_id` | Ya | UUID | FK `ref_cities`, bukan freetext |
| `developer_projects.slug` | Ya | VARCHAR(220) | UNIQUE |
| `developer_projects.property_type` | Tidak (nullable di skema meski ada CHECK) | Enum | 7 nilai terdaftar |
| `developer_projects.is_exclusive_by_region` | Ya (default `false`) | BOOLEAN | Scope = `city_id` proyek itu sendiri (OD-19 Resolved, Opsi A) — tidak perlu field tambahan |
| `agent_project_claims` | — | — | UNIQUE `(agent_id, project_id)` — mencegah klaim ganda oleh agen **yang sama**, tidak mencegah banyak agen berbeda mengklaim (sesuai Business Rule non-eksklusif default) |
| `developer_project_media.type` | Ya | Enum | `photo`\|`video`\|`brochure`\|`price_list` |

---

# 28. Error Handling

| Skenario | HTTP Status | Sumber |
|---|---|---|
| Agen klaim proyek yang sudah pernah ia klaim | 409 (UNIQUE constraint violation) | Migration `0006` |
| Agen klaim proyek eksklusif wilayah yang sudah diklaim agen lain | Notifikasi "tidak tersedia" (User Flow) — **kode HTTP pasti Not Defined**, dan **logic pengecekannya sendiri tidak ada di RLS/skema** (Bagian 21) | Open Issue |
| Non-admin (termasuk Developer Partner per RLS aktual) mencoba `POST /admin/developer-projects` | 403 | Migration `0006` (`developer_projects_manage`) |
| `city_id` tidak valid | 400/422 | Validasi FK standar |

---

# 29. Notification

**Tidak ada notifikasi M06-spesifik eksplisit** di User Flow — alur klaim proyek tidak menyebutkan notifikasi ke Admin/Developer saat agen klaim (berbeda dari M01/M02 yang eksplisit menyebut notifikasi approval/moderasi). Kemungkinan relevan untuk REQ-M06-006 (tracking untuk reporting) namun tidak dinyatakan sebagai notifikasi real-time — Open Issue Bagian 46.

---

# 30. Activity Log

**Not Defined secara eksplisit** — tidak ada REQ-M06-XXX yang menyebut audit log. Mengikuti prinsip umum, aksi Admin (CRUD data proyek) kemungkinan tercatat `audit_logs` (konsisten pola modul lain), namun tidak ada pernyataan eksplisit di dokumen sumber M06.

---

# 31. Audit Trail

Sama seperti Bagian 30 — tidak eksplisit dinyatakan, diasumsikan mengikuti pola umum modul lain (dicatat sebagai asumsi/Open Issue, bukan requirement terkonfirmasi).

---

# 32. External Integration

| Layanan | Fungsi |
|---|---|
| LocationIQ/Geoapify (ADR-008) | Geocoding lokasi proyek (peta) — Technical Spec §M06 catatan ADR-008 |
| Supabase Storage | Materi marketing kit (bucket publik, mengikuti pola `listing-photos`) |

---

# 33. AI Capability

**Tidak ada.**

---

# 34. Performance Requirement

| Aspek | Target | Sumber |
|---|---|---|
| Filter katalog | Index `(city_id, status, property_type)` disiapkan untuk performa filter setara listing | Migration `0006` |
| Response time | **Not Defined** | Open Issue |

---

# 35. Security Requirement

1. `developer_projects_manage` **ketat** hanya `all`-scope (Superadmin/Manager/Admin) — tidak ada celah self-service meski Authorization Spec dokumentasi menyebut sebaliknya (Bagian 51).
2. Data resmi (harga, unit availability) hanya dapat diubah lewat jalur Admin — mencegah agen memanipulasi data resmi developer untuk kepentingan sendiri.
3. Materi marketing kit disimpan di bucket publik (bukan data sensitif) — konsisten pola storage umum, tidak perlu signed URL.

---

# 36. Accessibility Requirement

**Not Defined secara M06-spesifik.**

---

# 37. Responsive Requirement

**Not Defined secara M06-spesifik** — mengikuti Template A/B/F umum.

---

# 38. SEO Impact (Jika relevan)

**Sangat relevan.** Katalog & Detail Proyek Developer termasuk halaman wajib SSR/SSG (SEO Spec §1.1: "Detail Proyek Developer"). `sitemap-developer-projects.xml` terdaftar terpisah (API Spec §11 SEO). `meta_title`/`meta_description` sudah ada sebagai field di `developer_projects` (ERD v1.3 §2.12).

---

# 39. Configuration

**Tidak ada `system_configs` khusus M06** yang terdaftar di dokumen sumber.

---

# 40. Environment Variable

Tidak ada variable baru khusus M06 — memakai `LOCATIONIQ_API_KEY`/`GEOAPIFY_API_KEY` yang sudah didefinisikan lintas modul (M03/M06 sama-sama pakai, ADR-008).

---

# 41. Feature Flag

**Tidak ada.**

---

# 42. Acceptance Criteria

Dari PRD Modul 6:

- [ ] Admin dapat CRUD data proyek developer & materi marketing.
- [ ] Agen dapat browsing katalog dan "klaim" proyek untuk dijadikan listing.
- [ ] Perubahan data resmi proyek otomatis ter-update di listing turunan.

---

# 43. QA Test Scenario

| # | Skenario | Hasil Diharapkan |
|---|---|---|
| 1 | Admin tambah proyek baru lengkap (data + media) | Tersimpan, tampil di katalog publik |
| 2 | Agen klaim proyek non-eksklusif | Tercatat di `agent_project_claims`, ditawarkan buat listing |
| 3 | Agen klaim proyek yang sama 2x | 409 (UNIQUE violation) |
| 4 | **Developer Partner (login) mencoba `POST /admin/developer-projects`** | **403** — sesuai RLS aktual, meski Authorization Spec dokumentasi menyiratkan `own` (Konflik #1, wajib diverifikasi implementasi mengikuti RLS bukan tabel dokumentasi) |
| 5 | Guest browsing katalog tanpa login | Berhasil, data tampil penuh (RLS publik) |
| 6 | Admin ubah harga proyek yang sudah ada listing turunan | **Not Defined** apakah ada mekanisme sinkronisasi otomatis nyata (trigger?) atau hanya "read live" saat listing di-render — Open Issue Bagian 46 |

---

# 44. Edge Case

1. ~~Proyek dengan `is_exclusive_by_region=true` — tidak ada field yang mendefinisikan wilayah~~ **✅ Resolved [2026-08-06], OD-19 Opsi A** — cakupan wilayah eksklusif = per Kota (`city_id`). Tidak perlu field baru — memakai `developer_projects.city_id` yang sudah ada. Enforcement: saat `is_exclusive_by_region=true`, cek `EXISTS` proyek lain aktif dengan `is_exclusive_by_region=true` di `city_id` sama sebelum insert/update (service layer, bukan constraint DB — mirip pola validasi lain di modul ini).
2. Developer Partner dengan `user_id` terisi mencoba mengakses UI Kelola Developer & Proyek (SCR-M06-03) — **tidak ada layar terpisah untuk self-service Developer Partner** di UI Specification, meski RLS `developer_partners_manage` teknis mengizinkan update profil sendiri.
3. Proyek dihapus/`inactive` padahal masih ada listing turunan aktif — **Not Defined** perilaku (listing tetap ada dengan referensi rusak? atau ada guard?).

---

# 45. Risk Analysis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Implementasi mengikuti Authorization Spec §2.7 secara harfiah (beri Developer Partner akses `own` ke `DeveloperProject`) | **Pelanggaran Business Rule PRD eksplisit** ("Hanya admin") — celah keamanan data resmi harga bisa dimanipulasi Developer Partner | Wajib implementasi mengikuti RLS aktual (`developer_projects_manage`, all-scope only) sebagai kebenaran, bukan tabel Authorization Spec (Bagian 51) |
| Eksklusivitas wilayah tidak terimplementasi tapi User Flow mengasumsikan sudah ada | Fitur "notifikasi tidak tersedia" (User Flow §6.2) tidak dapat berfungsi tanpa keputusan skema tambahan | Eskalasi ke Owner — keputusan bisnis definisi "wilayah" untuk eksklusivitas (Bagian 44 poin 1) |
| Sinkronisasi real-time harga/unit ke listing turunan tidak jelas mekanismenya (trigger vs read-live) | Jika diasumsikan salah (mis. dibangun sebagai snapshot copy, bukan live-read), Business Rule PRD dilanggar | Klarifikasi sebelum M03 (konsumen `developer_project_id`) diimplementasikan — dependency silang MP-06↔MP-03 |

---

# 46. Known Limitation

1. ~~Definisi cakupan "wilayah" untuk `is_exclusive_by_region` tidak ada~~ **✅ Resolved [2026-08-06], OD-19 Opsi A** — cakupan wilayah eksklusif = per Kota (`city_id`). Tidak perlu field baru — memakai `developer_projects.city_id` yang sudah ada. Enforcement: saat `is_exclusive_by_region=true`, cek `EXISTS` proyek lain aktif dengan `is_exclusive_by_region=true` di `city_id` sama sebelum insert/update (service layer, bukan constraint DB — mirip pola validasi lain di modul ini).
2. ~~CRUD lengkap `/admin/developer-projects` tidak terdaftar formal~~ **✅ Diperbaiki [2026-08-06], audit v1.1/T4-11** — 3 endpoint ditambahkan ke `API-Specification-...v1.2.md` §10.3 (`GET/PUT/DELETE /admin/developer-projects{/id}`). 🟢 **VERIFIKASI 9 Agustus 2026: klaim TIDAK TERBUKTI saat dicek (endpoint tidak ada di `API-Specification-...v1.3-FINAL.md`) — sekarang BENAR-BENAR ditambahkan via `API-Specification-RUMAHAGEN-v1.3-FINAL-FIXED.md`. Status Resolved terverifikasi.**
3. **Tidak ada notifikasi eksplisit** untuk aksi klaim proyek.
4. **Audit log M06 tidak eksplisit dinyatakan** — diasumsikan mengikuti pola umum.
5. **Mekanisme sinkronisasi real-time harga/unit ke listing turunan** tidak dijelaskan teknis (trigger DB, read-live saat render, atau job berkala).
6. **Konflik permission Developer Partner** (Bagian 51 Konflik #1) — dokumentasi Authorization Spec tidak sinkron dengan RLS/PRD/API Spec.

---

# 47. Dependency Checklist

| Item | Status |
|---|---|
| MDM: M06 bergantung M01 + Referensi Wilayah | ✅ Terpenuhi (MP-01 selesai direncanakan; Referensi Wilayah adalah seed data, bukan modul kode) |
| MIS: M06 urutan #5, Batch 2 | ✅ Konsisten, paralel dengan M02/M04/M13 |
| Migration `0001`, `0003`, `0004` (prasyarat `0006`) | ✅ Sudah ditulis |
| ERD v1.3 §2.11-2.14 Baseline | ✅ |
| Authorization Spec v1.0 §2.7 Baseline (dengan catatan konflik) | ✅ (isi tabel perlu dibaca bersama RLS, lihat Bagian 51) |
| ADR-008 (Maps) Approved | ✅ |

**Kesimpulan:** Dependency terpenuhi. Tidak ada blocker teknis — hanya kebutuhan klarifikasi bisnis (eksklusivitas wilayah) yang tidak menghalangi mulai coding fitur inti (katalog, klaim non-eksklusif, CRUD admin).

---

# 48. Definition of Ready

- [x] PRD Modul 6 Baseline (v1.2).
- [x] ERD §2.11-2.14 Baseline (v1.3).
- [x] Migration `0001`, `0003`, `0004`, `0006` tertulis.
- [x] ADR-008 Approved.
- [x] **Keputusan definisi wilayah eksklusif** (Bagian 44/46) — **✅ Resolved [2026-08-06], OD-19 Opsi A** — cakupan wilayah eksklusif = per Kota (`city_id`). Tidak perlu field baru — memakai `developer_projects.city_id` yang sudah ada. Enforcement: saat `is_exclusive_by_region=true`, cek `EXISTS` proyek lain aktif dengan `is_exclusive_by_region=true` di `city_id` sama sebelum insert/update (service layer, bukan constraint DB — mirip pola validasi lain di modul ini).
- [ ] **Konfirmasi resolusi konflik permission Developer Partner** (Bagian 51) — wajib eksplisit sebelum implementasi endpoint admin dimulai, agar tidak keliru mengikuti Authorization Spec secara harfiah.

---

# 49. Definition of Done

- [ ] Seluruh Acceptance Criteria (Bagian 42) terverifikasi.
- [ ] Migration `0006` dieksekusi sukses, RLS terverifikasi — **termasuk test eksplisit bahwa Developer Partner TIDAK dapat CRUD `developer_projects`** (mengikuti RLS, bukan Authorization Spec §2.7).
- [ ] Unit test: klaim proyek (UNIQUE constraint), filter katalog.
- [ ] E2E test: alur Admin tambah proyek → Agen klaim → tawaran buat listing (Playwright).
- [ ] Dokumentasi Authorization Spec §2.7 direkomendasikan dikoreksi (kolom DevPartner untuk `DeveloperProject`/`DeveloperProjectMedia` → `none`, bukan `own`) pada siklus governance berikutnya.
- [ ] PR lolos CI gate.
- [ ] `CURRENT-PROJECT-STATE.md` diperbarui.

---

# 50. Traceability Matrix

| REQ-XXX | ENT-XXX | Endpoint | PERM-XXX | ADR |
|---|---|---|---|---|
| REQ-M06-001 | `ENT-M06-DeveloperPartner`, `ENT-M06-DeveloperProject` | `GET /developer-projects*`, `POST /admin/developer-projects` | `PERM-M06-*-DeveloperPartner/Project` | — |
| REQ-M06-002 | `ENT-M06-AgentProjectClaim` | `POST /developer-projects/{id}/claim` | `PERM-M06-Create-AgentProjectClaim` | — |
| REQ-M06-003 | `ENT-M06-DeveloperProject` (`commission_scheme`) | `GET /developer-projects/{id}` | — | — |
| REQ-M06-004 | `ENT-M06-DeveloperProjectMedia` | `POST /admin/developer-projects` (media) | `PERM-M06-Create-DeveloperProjectMedia` | — |
| REQ-M06-005 | `ENT-M06-DeveloperProject` (`status`) | `POST /admin/developer-projects` | `PERM-M06-Update-DeveloperProject` | — |
| REQ-M06-006 | `ENT-M06-AgentProjectClaim` | `POST /developer-projects/{id}/claim` | `PERM-M06-View-AgentProjectClaim` | — |

---

# 51. Conflict Analysis

| # | Konflik/Ambiguitas | Dokumen Terlibat | Resolusi |
|---|---|---|---|
| 1 | `Authorization-Access-Control-Specification-v1.0.md` §2.7 mencantumkan Developer Partner = **`own`** untuk `PERM-M06-Create/View/Update/Delete-DeveloperProject` dan `PERM-M06-Create/Delete-DeveloperProjectMedia` — namun **tiga sumber lain sepakat menolak ini**: (a) PRD Modul 6 Business Rule eksplisit "**Hanya admin** yang dapat menambahkan/mengubah data proyek developer"; (b) migration `0006` RLS `developer_projects_manage`/`dpm_manage` **hanya** memeriksa `auth_has_scope_all('M06_developer','manage')`, **tidak ada** klausa `user_id=auth.uid()` untuk kedua tabel ini (berbeda dari `developer_partners_manage` yang memang punya klausa tsb); (c) API Specification `POST /admin/developer-projects` berlabel Auth "Superadmin, Manager, Admin" saja, tidak menyertakan Developer Partner. | Authorization Spec v1.0 §2.7 vs PRD v1.2 Business Rule, migration `0006` (Database Schema, prioritas #7), API Spec v1.2 | **Mengikuti PRD + Database Schema + API Spec** (3 dari 4 sumber, dan Database Schema adalah kontrak eksekusi konkret) — Developer Partner **tidak memiliki** akses CRUD ke `DeveloperProject`/`DeveloperProjectMedia`, hanya ke `DeveloperPartner` (profil perusahaannya sendiri, yang **memang** konsisten didukung RLS `developer_partners_manage`). Pola ini **identik** dengan temuan "artefak generalisasi tabel" di MP-01 Konflik #3 dan MP-02 Konflik #3 — kemungkinan `own` di-assign otomatis ke seluruh baris entity milik modul tanpa membedakan sub-entity mana yang benar-benar self-service. Direkomendasikan Authorization Spec §2.7 dikoreksi pada revisi berikutnya (DevPartner → `none` untuk `DeveloperProject`/`DeveloperProjectMedia`, tetap `own` untuk `DeveloperPartner` saja). |
| 2 | Functional Specification §4.6 menyatakan aksi di `/admin/developer-projects` adalah **"CRUD data developer partner & proyek"** (implikasi GET-list, PUT update, DELETE tersedia), namun API Specification §10.3 **hanya mendaftarkan `POST /admin/developer-projects`** — tidak ada `GET`/`PUT`/`DELETE` admin eksplisit terdaftar. | Functional Spec v1.0 §4.6 vs API Spec v1.2 §10.3 | **Bukan kontradiksi, melainkan gap dokumentasi API Spec.** **✅ Diperbaiki [2026-08-06], audit v1.1/T4-11** — 3 endpoint ditambahkan ke `API-Specification-...v1.2.md` §10.3 (`GET/PUT/DELETE /admin/developer-projects{/id}`). 🟢 **VERIFIKASI 9 Agustus 2026: klaim TIDAK TERBUKTI saat dicek (endpoint tidak ada di `API-Specification-...v1.3-FINAL.md`) — sekarang BENAR-BENAR ditambahkan via `API-Specification-RUMAHAGEN-v1.3-FINAL-FIXED.md`. Status Resolved terverifikasi.** |
| 3 | Technical Specification §3 (M06 brief) mencantumkan "M03 (listing Primary turunan)" sebagai salah satu *Dependencies* M06 — berpotensi dibaca sebagai M06 bergantung M03. | Technical Spec v1.0 §3 vs MDM v1.0 (arah resmi M03→M06) | **Sudah diresolusikan di `Module-Dependency-Matrix-...v1.0.md` Bagian 10 Konflik #2** (dokumen prioritas #2, lebih tinggi dari Technical Spec #4 dalam hierarki tugas ini) — arah resmi tetap M03 bergantung M06, dikonfirmasi FK `listings.developer_project_id` dan urutan migration `0006` sebelum `0008`. Tidak dianalisis ulang di sini, hanya dirujuk silang. |

---

# 52. Recommendation

1. **Implementasi WAJIB mengikuti RLS migration `0006` sebagai kebenaran permission**, bukan tabel Authorization Spec §2.7 secara harfiah — Developer Partner tidak boleh diberi akses CRUD `DeveloperProject`/`DeveloperProjectMedia` (Konflik #1). Ini adalah risiko keamanan data resmi jika salah diimplementasikan.
2. **Lengkapi API Specification** dengan endpoint `GET` (list admin), `PUT`, `DELETE` untuk `/admin/developer-projects` sebelum implementasi CRUD penuh dimulai (Konflik #2) — saat ini hanya `POST` yang punya kontrak eksplisit.
3. ~~Eskalasi definisi "wilayah eksklusif" ke Owner~~ — **✅ Resolved [2026-08-06], OD-19 Opsi A** — cakupan wilayah eksklusif = per Kota (`city_id`). Tidak perlu field baru — memakai `developer_projects.city_id` yang sudah ada. Enforcement: saat `is_exclusive_by_region=true`, cek `EXISTS` proyek lain aktif dengan `is_exclusive_by_region=true` di `city_id` sama sebelum insert/update (service layer, bukan constraint DB — mirip pola validasi lain di modul ini).
4. **Klarifikasi mekanisme sinkronisasi real-time** harga/unit ke listing turunan sebelum M03 mengonsumsi `developer_project_id` — koordinasi MP-06↔MP-03 diperlukan di titik ini.
5. **M06 aman dibangun paralel dengan M02, M04, M13** (Batch 2 MIS).
6. **Setelah M06 selesai (atau paralel dengannya)**, lanjutkan ke M04 (Learning Center) sesuai urutan MIS Bagian 3 urutan #6.

---

*Module Planning ini disusun murni berdasarkan dokumen yang diupload — tidak ada requirement yang diubah/ditambah/dihapus, tidak ada perubahan arsitektur/API/skema database. Konflik permission Developer Partner (Bagian 51 Konflik #1) ditemukan lewat pemeriksaan silang PRD, RLS migration aktual, dan API Specification — diresolusikan mengikuti mayoritas & kontrak eksekusi konkret, bukan diasumsikan sepihak.*
