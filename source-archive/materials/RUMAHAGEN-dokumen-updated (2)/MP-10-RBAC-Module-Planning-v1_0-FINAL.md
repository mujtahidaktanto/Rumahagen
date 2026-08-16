# MODULE PLANNING
## MP-10 — RBAC (Manajemen Role & Hak Akses)
### Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 6 Agustus 2026
**Disusun sebagai:** CTO / Enterprise Architect / Solution Architect / Product Manager / Technical Product Owner / Engineering Manager / Technical Lead / Senior Backend Engineer / Senior Frontend Engineer / Senior QA Engineer / Senior Database Architect / DevOps Architect (peran gabungan)
**Tujuan Dokumen:** Acuan resmi implementasi Modul 10 (RBAC) via Bolt.new maupun developer manual. Tidak berisi kode, tidak berisi UI mockup, tidak berisi sprint.

### Dokumen Acuan & Prioritas
| # | Dokumen | Versi Dipakai |
|---|---|---|
| 1 | Module Implementation Strategy (MIS) | v1.1 |
| 2 | Module Dependency Matrix (MDM) | v1.0 |
| 3 | Engineering Guidelines (`PROJECT-CONSTITUTION.md`) | — |
| 4 | Technical Specification | v1.0 |
| 5 | System Architecture | v1.6 |
| 6 | Technology Decisions | v1.5 |
| 7 | Database Schema (ERD §2.28-2.30 + migration `0001`/`0002`) | ERD v1.3 |
| 8 | API Specification | v1.2 |
| 9 | Functional Specification | v1.0 |
| 10 | UI Specification | v1.0 |
| 11 | ERD | v1.3 |
| 12 | PRD | v1.2 |
| 13 | User Flow | v1.2 |
| *(tambahan)* | Authorization & Access Control Specification | v1.1 *(naik dari v1.0, audit Issue Register Batch 3, 6 Agustus 2026)* |
| *(tambahan)* | Entity Mapping | v1.0 |

> Aturan prioritas: jika terjadi konflik antar-dokumen, urutan di atas menentukan pemenang — dicatat di Bagian 51 (Conflict Analysis), bukan diselesaikan sepihak di badan dokumen.

---

## Riwayat Versi

> Tabel ini disusun retroaktif pada siklus konsolidasi ini (9 Agustus 2026) berdasarkan 2 snapshot yang tersedia — dokumen sebelumnya tidak memiliki tabel Riwayat Versi eksplisit.
>
> **⚠️ Konflik penomoran** (pola sama seperti MP-01 s.d. MP-09): kedua snapshot berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026"** yang identik. Nomor versi publik **dipertahankan "1.0"** — identifier 1.0a/1.0b di bawah semata untuk audit. File final ini setara **1.0b**.

| Versi | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| 1.0a | 6 Agu 2026 | Rilis awal — 1 temuan: Authorization Spec §2.11 mencantumkan Manager=`none` literal untuk seluruh baris permission M10, padahal PRD Modul 10 & API Spec §1.3 menyatakan Manager punya akses terbatas ke `/admin/permissions/matrix/agent`. Diresolusikan mengikuti PRD+API Spec (tanpa mengubah dokumen sumber), direkomendasikan Authorization Spec diperjelas pada revisi berikutnya. |
| 1.0b | 6 Agu 2026 | Temuan **Closed** (audit v1.1/**T4-01**) — Authorization Spec §2.11 dikoreksi penuh: View-Role/Permission/RolePermission naik jadi seluruh role=`all` (RLS `USING(true)`), Update-RolePermission Manager: none→`own` (scoped role target `agent`). **Versi terkini** — basis dokumen final di bawah. |

---

## ✅ Catatan Verifikasi Silang (9 Agustus 2026, siklus konsolidasi ini)

> Melanjutkan pola bersih MP-07/MP-08: klaim T4-01 diverifikasi terhadap `Authorization-Access-Control-Specification-v1.1-FINAL.md` §2.11 — **TERBUKTI BENAR**, cocok persis termasuk detail "scoped role target `agent`" untuk `Update-RolePermission`. Cakupan perbaikan aktual bahkan **lebih luas** dari yang tersirat MP-10 (turut mengoreksi `View-Role` dan `View-Permission`, temuan #17/#18) — bukan inkonsistensi, murni perbaikan lebih menyeluruh.

---

# 1. Executive Summary

Modul 10 (RBAC) adalah **modul fondasi tunggal** proyek — satu-satunya modul tanpa dependency terhadap modul lain (MDM §3), dan menjadi prasyarat langsung/tidak langsung bagi seluruh 12 modul lainnya. Modul ini mengelola 3 entity inti (`roles`, `permissions`, `role_permissions`) yang membentuk model **RBAC dua-nilai** (`granted_scope`: `all`/`own`/`none`) dengan hierarki **Superadmin → Manager → Admin/Instructor → Agen**, plus role eksternal (Developer Partner, Buyer) dan state tidak-login (Guest, bukan baris tabel). Migration SQL (`0002_m10_rbac_foundation.sql`) dan helper function RLS (`0001_extensions_helpers.sql`) **sudah ditulis lengkap** per `CURRENT-PROJECT-STATE.md` — modul ini adalah kandidat implementasi **pertama** begitu Sprint S0 dieksekusi (MIS Bagian 3, urutan #1; Go/No-Go: ✅ **GO**, tanpa blocker).

---

# 2. Purpose

Menyediakan spesifikasi implementasi lengkap Modul 10 agar dapat dieksekusi langsung oleh Bolt.new/developer manual tanpa ambiguitas — mencakup scope fungsional, kontrak data/API, aturan bisnis, matriks permission, dan kriteria selesai — sebagai satu-satunya rujukan modul ini menggantikan kebutuhan membaca ulang seluruh 13+ dokumen sumber secara terpisah.

---

# 3. Scope

- Tabel `roles`, `permissions`, `role_permissions` (ERD v1.3 §2.28-2.30) beserta RLS policy-nya.
- Endpoint API Modul 10: `GET /admin/roles`, `GET /admin/permissions/matrix`, `GET /admin/permissions/matrix/agent`, `PUT /admin/permissions/matrix`, `PUT /admin/permissions/matrix/agent`, `PUT /admin/users/{id}/role`, `GET /admin/audit-logs` (API Spec §1.3).
- Layar **Kelola Role** (read-only) dan **Permission Matrix Editor** (`PermissionMatrixGrid`, UI Spec §4.2 & §6).
- Middleware RBAC (`rbac.middleware`) yang dikonsumsi **seluruh** modul lain sebagai lapisan otorisasi platform (SYSTEM-ARCHITECTURE §8, §11).
- Fungsi helper database `auth_role_code()`, `auth_is_superadmin()`, `auth_has_scope_all()` (migration `0001`).
- Enforcement hierarki pengeditan permission (`editable_by_role_code`) dan proteksi Superadmin (minimal 1 akun aktif).
- Pencatatan audit trail untuk **perubahan role/permission** (menulis ke `audit_logs`, entity milik M09, dikonsumsi di sini sebagai konsumen).

---

# 4. Out of Scope

- **Implementasi permission per-modul lain** (mis. permission `PERM-M03-*` untuk Listing) — hanya *registrasi* PERM-XXX-nya yang menjadi data seed modul ini; enforcement bisnis spesifik modul lain adalah tanggung jawab modul masing-masing.
- **Organization-scoped authorization** (`organization-rbac.middleware`, ADR-027) — lapisan kedua independen milik M12, **tidak** mengubah/memperluas `scope_type` M10 (Authorization Spec §2.13; Golden Rule 39 `development-playbook.md`).
- **Manajemen akun user (CRUD user, approval registrasi)** — milik M01/M09; M10 hanya menyediakan endpoint **ubah role** (`PUT /admin/users/{id}/role`), bukan CRUD user penuh.
- **UI/halaman viewer Audit Log** (`/admin/audit-logs` sebagai layar) — dicatat sebagai endpoint konsumsi di sini, namun kepemilikan layar & fitur ekspor berada di M09 (Admin Panel).
- **Role Kustom** (REQ-M10-005) — eksplisit "opsional, fase lanjutan" di PRD; **tidak** termasuk cakupan implementasi wajib dokumen ini (lihat Bagian 46, Known Limitation).
- Pembuatan kode, wireframe visual, dan sprint breakdown (sesuai aturan tugas ini).

---

# 5. Business Objective

Menjadi **fondasi kontrol akses tunggal** yang memastikan setiap role hanya dapat melakukan aksi sesuai kewenangannya, dengan hierarki delegasi terbatas (Superadmin → Manager khusus role Agen) — mencegah eskalasi hak akses tidak sah dan memastikan **Superadmin tidak pernah dapat dibatasi** (PRD Modul 10, Bagian "Business Rules").

---

# 6. Business Value

- Mengurangi risiko keamanan dari kesalahan konfigurasi akses manual per modul (satu sumber kebenaran permission).
- Memungkinkan delegasi operasional terbatas (Manager mengatur permission Agen) tanpa mengekspos konfigurasi sistem inti — mendukung skalabilitas tim operasional tanpa menambah beban Superadmin.
- Audit trail penuh mendukung kepatuhan (UU PDP) dan investigasi insiden akses.
- Real-time enforcement (REQ-M10-009) menghindari jendela waktu berbahaya antara perubahan permission dan efektifnya perubahan tsb.

---

# 7. Dependency Summary (Berdasarkan MDM)

| Arah | Isi |
|---|---|
| **Bergantung Pada** | **Tidak ada** — MDM Bagian 3: baris M10 seluruh kolom Provider bertanda "—". Modul fondasi murni. |
| **Dibutuhkan Oleh** | **Seluruh 12 modul lain** (M01-M09, M11-M13) — MDM Bagian 4 (Dependency Graph): M10 adalah root node tunggal dari seluruh graph. |
| **Shared Kernel terkait** | Tidak mengonsumsi shared kernel manapun (Referensi Wilayah tidak relevan bagi M10). |
| **Circular Dependency** | Tidak ditemukan (MDM Bagian 11) — M10 murni upstream, tidak pernah menjadi consumer. |

---

# 8. Module Position (Berdasarkan MIS)

| Dimensi MIS | Nilai |
|---|---|
| Kategori (MIS §2) | **Foundation** |
| Urutan Implementasi (MIS §3) | **#1 dari 13** — modul pertama yang dibangun |
| Layer (MIS §13) | **Layer 0 — Foundation** |
| Prioritas (MIS §14) | **P0 — Blocker Absolut** |
| Batch Paralel (MIS §6) | **Batch 0** — tidak dapat diparalelkan, single point of start |
| Critical Path (MIS §5) | Node pertama di seluruh jalur kritis (`M10 → M01 → M06 → M03 → M07 → M08`) |
| Kompleksitas (MIS §11.2) | **High Complexity** — model permission dua-nilai + hard rule ownership terpisah di layer repository; "mudah salah desain di awal, mahal diperbaiki karena semua modul bergantung padanya" |
| Risiko (MIS §11) | Tidak masuk daftar High Risk eksplisit, namun kompleksitasnya membuatnya **risiko sistemik** — kesalahan di sini beriak ke seluruh proyek (MIS §5, Critical Path Implication) |
| Go/No-Go (MIS §15) | ✅ **GO** — "Foundation, dokumen Baseline, skema fisik ada, tidak ada blocker" |

---

# 9. Stakeholder

| Stakeholder | Kepentingan |
|---|---|
| Owner / Superadmin (Mujtahid Aktanto) | Pemilik tunggal kewenangan penuh; penyetuju akhir perubahan matriks permission inti |
| Manager (peran operasional, jika diisi di masa depan) | Pengguna Permission Editor Terbatas untuk role Agen |
| Seluruh 12 modul lain (tim/AI Coding Assistant pembangun) | Konsumen middleware `rbac.middleware` — bergantung penuh pada kebenaran modul ini |
| Auditor/Compliance (implisit, UU PDP) | Konsumen `audit_logs` untuk kepatuhan |

---

# 10. Actor

| Actor | Sifat |
|---|---|
| Superadmin | Internal, bypass permission check, editor penuh |
| Manager | Internal, editor terbatas (role Agen saja) |
| Admin | Internal, tidak memiliki akses edit RBAC (Authorization Spec §1.3) |
| Instructor, Agent, Developer Partner, Buyer | Internal/eksternal, **subjek** dari matriks permission (bukan aktor yang mengoperasikan modul ini) |
| Guest | Bukan baris `roles`, tidak relevan sebagai actor modul ini |
| System (middleware/backend) | Aktor non-manusia — mengeksekusi resolusi `granted_scope` di setiap request |

---

# 11. User Story

| ID | Story | Sumber |
|---|---|---|
| US-M10-01 | Sebagai Superadmin, saya ingin melihat daftar seluruh role & jumlah user per role, agar saya punya gambaran distribusi akses. | REQ-M10-001, PRD Modul 10 |
| US-M10-02 | Sebagai Superadmin, saya ingin mengubah matriks permission untuk role apa pun (termasuk Manager/Admin), agar saya dapat menyesuaikan kebijakan akses. | REQ-M10-002 |
| US-M10-03 | Sebagai Manager, saya ingin mengubah batasan fitur untuk role Agen saja, agar saya bisa menyesuaikan operasional tanpa mengganggu konfigurasi inti. | REQ-M10-003 |
| US-M10-04 | Sebagai Superadmin, saya ingin mengubah role seorang user, agar promosi/demosi dapat dilakukan tanpa akses database langsung. | REQ-M10-004 |
| US-M10-05 | Sebagai Superadmin, saya ingin melihat tampilan "sebagai role X", agar saya dapat memverifikasi hasil perubahan permission sebelum insiden terjadi. | REQ-M10-006 |
| US-M10-06 | Sebagai Superadmin/auditor, saya ingin melihat riwayat perubahan permission (siapa, kapan, apa), agar akuntabilitas terjaga. | REQ-M10-007 |
| US-M10-07 | Sebagai sistem, saya perlu mencegah penghapusan/downgrade Superadmin terakhir, agar platform tidak pernah kehilangan akses admin sepenuhnya. | REQ-M10-008 |
| US-M10-08 | Sebagai user dengan role apa pun, perubahan permission yang memengaruhi saya harus berlaku pada request berikutnya tanpa perlu re-login, agar kebijakan baru efektif segera. | REQ-M10-009 |
| US-M10-09 | Sebagai user tanpa akses ke suatu modul, saya ingin menerima pesan "Akses Ditolak" yang jelas, bukan error generik, agar saya paham kenapa ditolak. | REQ-M10-010 |

---

# 12. Functional Requirement

| REQ ID | Requirement | Status Cakupan Dokumen Ini |
|---|---|---|
| REQ-M10-001 | Manajemen Role — lihat daftar role & jumlah user per role | In Scope |
| REQ-M10-002 | Permission Matrix Editor penuh (Superadmin) | In Scope |
| REQ-M10-003 | Permission Editor Terbatas role Agen (Manager) | In Scope |
| REQ-M10-004 | Assign Role ke User (dengan batasan hierarki) | In Scope |
| REQ-M10-005 | Role Kustom di luar default (opsional, fase lanjutan) | **Out of Scope** — lihat Bagian 4 & 46 |
| REQ-M10-006 | Preview Akses ("lihat sebagai role X") | In Scope |
| REQ-M10-007 | Audit Trail perubahan permission | In Scope (menulis; viewer UI milik M09) |
| REQ-M10-008 | Proteksi role Superadmin | In Scope |
| REQ-M10-009 | Real-time enforcement perubahan matriks akses | In Scope |
| REQ-M10-010 | Response "Akses Ditolak" informatif | In Scope |

---

# 13. Non Functional Requirement

| Kategori | Requirement | Sumber |
|---|---|---|
| Real-time propagation | Perubahan permission berlaku pada **request berikutnya**, tanpa perlu re-login; token tidak menyimpan role/permission statis permanen — dicek ulang ke `role_permissions` tiap request | SYSTEM-ARCHITECTURE §8 (Token Strategy), REQ-M10-009 |
| Availability RBAC check | Middleware `rbac.middleware` dijalankan pada **setiap** Route Handler terproteksi, urutan baku: auth → rbac → (organization-rbac jika relevan) → rate-limit | SYSTEM-ARCHITECTURE §8 (Middleware) |
| Konsistensi Ownership | Hard rule `agent_id` dicek terpisah dari `granted_scope`, bahkan jika permission salah konfigurasi | PROJECT-CONSTITUTION §11 poin 6 |
| Response time spesifik M10 | **Not Defined** — tidak ada target ms eksplisit untuk endpoint `/admin/permissions/matrix` di Technical Specification §5 (NFR silang-referensi hanya mencantumkan Core Web Vitals, Rate Limiting, Enkripsi, Soft-delete, Search latency — tidak ada baris RBAC-spesifik) | Technical Specification §5 — **Open Issue** |
| Skalabilitas jumlah role/permission | **Not Defined** — tidak ada batas maksimum baris `permissions`/`role_permissions` yang didokumentasikan | — **Open Issue** |

---

# 14. Business Rule

Diambil verbatim-setara dari PRD Modul 10 "Business Rules" (prioritas dokumen tertinggi untuk requirement bisnis):

1. Superadmin selalu full-access ke seluruh fitur web tanpa kecuali — permission untuk role ini **tidak muncul sebagai opsi yang bisa di-toggle** (hardcoded aplikasi).
2. Manager memiliki seluruh fungsi operasional Admin secara otomatis, ditambah akses global (`all`) untuk listing & data seluruh agen, **tanpa** batasan tim/wilayah.
3. Manager **hanya** berwenang mengubah permission/batasan fitur untuk role Agen — tidak untuk (a) keamanan web, (b) konfigurasi/fitur inti sistem, (c) permission role Admin/Manager/Superadmin.
4. Agen tidak pernah dapat melihat/mengedit/menghapus data agen lain, **terlepas dari perubahan permission apa pun** — hard rule level aplikasi/ownership, bukan permission yang bisa dilonggarkan.
5. Perubahan matriks akses berlaku **real-time** ke seluruh user dengan role terkait pada request berikutnya.
6. Setiap endpoint/aksi backend **wajib** melakukan pengecekan permission via middleware — bukan hanya menyembunyikan tombol UI.
7. User dengan akses dinonaktifkan menerima "Akses Ditolak" informatif, bukan error generik.
8. **(ERD v1.3 §2.30)** `editable_by_role_code` adalah mekanisme penegakan utama batasan Manager — dicek di level aplikasi/RLS sebelum `UPDATE role_permissions` diizinkan.
9. **(ERD v1.3 §2.28)** Role `superadmin` short-circuit selalu `true` sebelum query ke `role_permissions` — tidak bergantung pada data yang mungkin salah konfigurasi.

---

# 15. Workflow Summary

**Alur 10.1 — Mengatur Permission Matrix** (User Flow §10.1): Superadmin login → buka "Kelola Role & Permission" → pilih role → (jika Superadmin dipilih, tampil read-only) → tampilkan Permission Matrix Editor → ubah toggle → simpan → konfirmasi ringkasan → tersimpan & berlaku real-time → tercatat di Audit Log.

**Alur 10.2 — Assign/Ubah Role User** (User Flow §10.2): Superadmin buka Manajemen User → pilih user → "Ubah Role" → pilih role baru → **guard**: jika target adalah Superadmin terakhir aktif & role baru ≠ Superadmin → tolak dengan peringatan → jika valid → konfirmasi → role ter-update → sesi/permission user tsb di-invalidasi/refresh → notifikasi ke user ybs → tercatat Audit Log.

**Alur Manager (turunan Alur 10.1, scope terbatas):** Manager login → buka "Kelola Permission Agen" (sub-menu, bukan "Kelola Role & Permission" penuh) → hanya field role Agen yang dapat diubah, field role lain read-only/tidak tampil → simpan → tersimpan real-time → tercatat Audit Log.

---

# 16. Screen List

| Kode Layar | Nama | Template (UI Spec §6) | Aktor |
|---|---|---|---|
| SCR-M10-01 | Kelola Role | F (read-only variant) | Superadmin, Manager (baca) |
| SCR-M10-02 | Permission Matrix Editor | F (grid khusus, bukan tabel baris standar) | Superadmin (penuh), Manager (terbatas Agen) |

> Tidak ada layar terpisah untuk "Assign Role" — aksi ini terintegrasi ke layar Manajemen User (M09), dikonsumsi via endpoint `PUT /admin/users/{id}/role` (Bagian 19-20). "Preview Akses" (REQ-M10-006) adalah **aksi/mode di dalam** SCR-M10-02, bukan layar terpisah — **Not Defined** detail UI-nya di UI Specification (hanya disebut di Functional Spec §4.10 sebagai daftar aksi); dicatat sebagai Open Issue Bagian 46.

---

# 17. Screen Detail

### SCR-M10-01 — Kelola Role
- **Template:** F (Manajemen List, varian read-only) — Sidebar + Judul + Tabel (tanpa tombol "+ Tambah Baru" karena role kustom di luar cakupan, lihat Bagian 4).
- **Konten:** Tabel 7 baris (role final) — kolom: Nama Role, Kode, Jumlah User, (tanpa aksi edit langsung di baris ini).
- **Komponen:** `Table` (shadcn/ui primitif), tanpa komponen komposit khusus terdaftar di UI Spec §4.2 untuk layar ini.

### SCR-M10-02 — Permission Matrix Editor
- **Template:** F (grid khusus).
- **Komponen komposit:** `PermissionMatrixGrid` (UI Spec §4.2) — "Grid Entity×Action×Role dengan toggle scope", tipe **Smart** (mengikuti pola TanStack Query untuk server state, `development-playbook.md` §9).
- **Perilaku per role viewer:**
  - Superadmin: seluruh kolom role (termasuk Manager/Admin/Superadmin) dapat diedit, kecuali kolom Superadmin sendiri (read-only, Business Rule #1).
  - Manager: **hanya** kolom/baris terkait role Agen yang interaktif; field role lain tidak tampil (bukan disabled) — PRD Modul 10 Fitur, Authorization Spec §1.3.
- **Aksi:** toggle scope per Entity×Action, "Simpan Perubahan" (dengan dialog konfirmasi ringkasan — User Flow §10.1), "Preview Akses" (**Not Defined** detail interaksi — Open Issue).

---

# 18. Navigation Flow

```
Sidebar Admin (role-gated)
  └─ Kelola Role & Permission (Superadmin: menu penuh; Manager: hanya "Kelola Permission Agen")
       ├─ Kelola Role (SCR-M10-01, read-only)
       └─ Permission Matrix Editor (SCR-M10-02)
            └─ Dialog Konfirmasi Perubahan → Simpan → kembali ke SCR-M10-02 (state terbaru)
```
Sumber: PRD Modul 10 Fitur; User Flow §10.1; SYSTEM-ARCHITECTURE §8 (Protected Routes — `(admin)` role-gated per sub-menu, menu tidak relevan disembunyikan penuh).

---

# 19. API Summary

7 endpoint, seluruhnya di bawah `app/api/v1/admin/**` (ADR-001, Route Handlers tunggal di `apps/web`), diproteksi `auth.middleware → rbac.middleware`.

| Endpoint | Fungsi |
|---|---|
| `GET /admin/roles` | Daftar role & jumlah user |
| `GET /admin/permissions/matrix` | Ambil matriks penuh (semua role) |
| `GET /admin/permissions/matrix/agent` | Ambil matriks khusus role Agen |
| `PUT /admin/permissions/matrix` | Update permission role apa pun |
| `PUT /admin/permissions/matrix/agent` | Update permission khusus role Agen |
| `PUT /admin/users/{id}/role` | Ubah role seorang user |
| `GET /admin/audit-logs` | Riwayat perubahan (dikonsumsi, kepemilikan M09) |

---

# 20. Endpoint Mapping

| Method | Endpoint | Auth (API Spec §1.3) | `module_code`/`action_code` Terkait | `granted_scope` Diperlukan |
|---|---|---|---|---|
| GET | `/admin/roles` | Superadmin, Manager | `M10_rbac` / `read` | `all` (`PERM-M10-View-Role`) |
| GET | `/admin/permissions/matrix` | Superadmin | `M10_rbac` / `read` | `all` (`PERM-M10-View-Permission`, `PERM-M10-View-RolePermission`) |
| GET | `/admin/permissions/matrix/agent` | Superadmin, Manager | `M10_rbac` / `read` (subset) | `all` (Manager: subset Agen saja) |
| PUT | `/admin/permissions/matrix` | Superadmin | `M10_rbac` / `update` | `all` (`PERM-M10-Manage-RolePermission`) |
| PUT | `/admin/permissions/matrix/agent` | Superadmin, Manager | `M10_rbac` / `update` | `all`, tervalidasi tambahan `editable_by_role_code` (`PERM-M10-Update-RolePermission`) |
| PUT | `/admin/users/{id}/role` | Superadmin (semua role), Manager (khusus Agen↔Admin) | `M09_user_management` / `update` (lintas modul, bukan `M10_rbac` murni — **dicatat sebagai Open Issue klasifikasi**, lihat Bagian 46) | `all` |
| GET | `/admin/audit-logs` | Superadmin, Manager (khusus relevan) | `M09_audit` / `read` (kepemilikan M09) | `all` |

---

# 21. Request Validation

Skema Zod (satu sumber kebenaran client+server, ADR-025) — field wajib per endpoint berdasarkan ERD v1.3 §2.28-2.30:

| Endpoint | Field | Validasi |
|---|---|---|
| `PUT /admin/permissions/matrix`, `.../agent` | `role_id` | UUID valid, harus ada di tabel `roles` |
| | `permission_id` | UUID valid, harus ada di tabel `permissions` |
| | `granted_scope` | Enum ketat: `all` \| `own` \| `none` — **tidak ada nilai lain** (ERD v1.3 §2.29 catatan v1.1: tidak ada level "scoped tim/wilayah") |
| `PUT /admin/users/{id}/role` | `role_id` (baru) | UUID valid; **backend wajib menolak** jika pemanggil = Manager dan `role_id` baru/lama bukan kombinasi Agen↔Admin (Business Rule PRD Modul 10) |
| Seluruh `PUT` | — | Backend **tidak pernah percaya** validasi client — validasi ulang server wajib (Golden Rule 15, `development-playbook.md`) |

**Validasi struktural tambahan (server-side, di luar Zod schema field-level):**
- `UPDATE role_permissions` ditolak (403) jika `editable_by_role_code` baris target tidak memuat kode role pemanggil (ERD v1.3 §2.30; ditegakkan ganda: middleware aplikasi **dan** RLS policy `role_permissions_manager_update`, migration `0002`).
- `PUT /admin/users/{id}/role` ditolak jika hasilnya membuat 0 akun Superadmin aktif (REQ-M10-008).

---

# 22. Response Structure

Mengikuti envelope standar API Spec §0.2 — **tidak ada struktur khusus M10** di luar pola umum:

```json
// Sukses
{ "success": true, "data": { ... }, "meta": { "page": 1, "per_page": 20, "total": 7 } }

// Gagal
{ "success": false, "error": { "code": "FORBIDDEN_ROLE_ACCESS", "message": "...", "details": null } }
```
Kode error spesifik M10: **Not Defined** — API Specification tidak mencantumkan tabel kode error per-modul eksplisit untuk M10 (pola `SCREAMING_SNAKE_CASE` ditetapkan di PROJECT-CONSTITUTION §13, tapi daftar kode konkret seperti `FORBIDDEN_ROLE_ACCESS`, `LAST_SUPERADMIN_PROTECTED` tidak terdaftar di dokumen sumber manapun) — **Open Issue**, lihat Bagian 46.

---

# 23. Database Impact

| Aspek | Detail |
|---|---|
| Tabel baru | `roles`, `permissions`, `role_permissions` |
| Tabel diubah | Tidak ada (tabel lain seperti `users.role_id` adalah FK yang **dikonsumsi** modul lain, dibuat di migration `0003_m01_auth.sql`, bukan di sini) |
| Index | UNIQUE `(module_code, action_code)` pada `permissions`; UNIQUE `(role_id, permission_id)` pada `role_permissions`; UNIQUE `roles.code` |
| RLS | Aktif di ketiga tabel (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) — policy `_select` (semua authenticated boleh baca), `_manage`/`_superadmin_all` (hanya Superadmin via `auth_is_superadmin()`), `role_permissions_manager_update` (Manager terbatas kondisi ganda: role=`manager` DAN `editable_by_role_code` memuat `manager` DAN target role=`agent`) |
| Trigger | `trg_roles_updated_at` (auto-update `updated_at`, fungsi bersama `set_updated_at()` dari migration `0001`) |
| Soft-delete | **Tidak berlaku** untuk `roles`/`permissions`/`role_permissions` — ketiganya **tidak** termasuk 8 tabel wajib soft-delete (ERD v1.3 Bagian 4 poin 3: `listings`, `users`, `developer_projects`, `agent_profiles`, `agent_reviews`, `courses`, `events`, `developer_partners`) |
| Seed data | 7 baris `roles` (final, OD-02) — lihat Bagian 25 |

---

# 24. Entity Mapping

| ENT ID | Tipe | Tabel Fisik | REQ Terkait |
|---|---|---|---|
| `ENT-M10-Role` | Root | `roles` | REQ-M10-001, 004 |
| `ENT-M10-Permission` | Root | `permissions` | REQ-M10-002, 003 |
| `ENT-M10-RolePermission` | Association (Role × Permission) | `role_permissions` | REQ-M10-002, 003, 007 |

Sumber: `Entity-Mapping-RUMAHAGEN-v1.0.md` Bagian 1. Tidak ada entity baru di luar 3 ini yang didaftarkan untuk M10 — konsisten larangan "jangan menambah entity baru" pada tugas ini.

---

# 25. Migration Requirement

| Item | Status |
|---|---|
| `0001_extensions_helpers.sql` | **Sudah ditulis** — prasyarat wajib (menyediakan `gen_random_uuid()`, `set_updated_at()`, `auth_role_code()`, `auth_is_superadmin()`, `auth_has_scope_all()`) |
| `0002_m10_rbac_foundation.sql` | **Sudah ditulis** — membuat `roles`, `permissions`, `role_permissions`, seed 7 role, RLS policy lengkap |
| Urutan eksekusi | `0001` → `0002` — wajib berurutan (helper function dipakai policy RLS di `0002`) |
| Status eksekusi ke database live | **Belum dieksekusi** (`CURRENT-PROJECT-STATE.md` — "Written, Not Executed") |
| Seed data role | 7 baris: `superadmin` (`is_protected=true`), `manager`, `admin`, `instructor`, `agent`, `developer_partner`, `buyer` — Guest **bukan** baris (ERD v1.3 §2.28) |
| Seed data `permissions` | **Belum ada di migration `0002`** — tabel dibuat kosong; pengisian baris `PERM-XXX` mengacu `Authorization-Access-Control-Specification-v1.0.md` Bagian 2 (seluruh modul), **di luar cakupan migration M10 murni** karena permission modul lain baru relevan saat modul tsb dibangun — **dicatat sebagai Open Issue urutan seeding**, Bagian 46 |
| FK belum lengkap | `role_permissions.updated_by` — kolom dibuat tanpa FK constraint di `0002` (komentar eksplisit di source: "ditambahkan via ALTER setelah tabel `users` ada, lihat `0003`") — **konsisten by design**, bukan bug, karena `0002` dibangun sebelum `0003_m01_auth.sql` |

---

# 26. Permission Matrix

Sumber: `Authorization-Access-Control-Specification-v1.0.md` §2.11 (Modul 10 — RBAC):

| Permission ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | Dev. Partner | Buyer | Endpoint |
|---|---|---|---|---|---|---|---|---|---|---|
| `PERM-M10-View-Role` | `ENT-M10-Role` | View | all | all | none | none | none | none | none | `GET /admin/roles` |
| `PERM-M10-View-Permission` | `ENT-M10-Permission` | View | all | none | none | none | none | none | none | `GET /admin/permissions/matrix` |
| `PERM-M10-View-RolePermission` | `ENT-M10-RolePermission` | View | all | none | none | none | none | none | none | `GET/PUT /admin/permissions/matrix` |
| `PERM-M10-Manage-RolePermission` | `ENT-M10-RolePermission` | Manage | all | none | none | none | none | none | none | `GET/PUT /admin/permissions/matrix` |
| `PERM-M10-Update-RolePermission` | `ENT-M10-RolePermission` | Update | all | none | none | none | none | none | none | `GET/PUT /admin/permissions/matrix` |

> **Catatan silang dokumen:** **Status: ✅ Closed [2026-08-06], audit v1.1/T4-01** — `Authorization-Access-Control-Specification-v1.1.md` §2.11 dikoreksi penuh: View-Role/Permission/RolePermission (seluruh role→`all`, mengikuti RLS `USING(true)`), Update-RolePermission (Manager: none→`own`, scoped role target `agent`).

---

# 27. Validation Matrix

| Field | Wajib? | Tipe | Aturan |
|---|---|---|---|
| `roles.code` | Ya | VARCHAR(50) | UNIQUE, immutable pasca-seed (tidak ada endpoint rename di scope ini) |
| `permissions.module_code` + `action_code` | Ya | VARCHAR(50) each | UNIQUE gabungan |
| `permissions.scope_type` | Ya | ENUM | `all`/`own`/`none`, default `own` |
| `role_permissions.granted_scope` | Ya | ENUM | `all`/`own`/`none` — **tanpa** nilai lain |
| `role_permissions.editable_by_role_code` | Ya | VARCHAR(100) | Default `superadmin`; untuk baris `role_id=agent` bernilai `superadmin,manager` |
| `PUT .../{id}/role` — `role_id` baru | Ya | UUID | Harus valid FK; kombinasi pemanggil-target divalidasi hierarki (Bagian 21) |

---

# 28. Error Handling

| Skenario | HTTP Status | Kode Error (pola) | Sumber |
|---|---|---|---|
| Token tidak valid/expired | 401 | — | API Spec §0.3 |
| Role tanpa permission ke modul | 403 | `FORBIDDEN_ROLE_ACCESS` (pola, bukan literal terdaftar — lihat Bagian 22) | SYSTEM-ARCHITECTURE §8 (diagram RBAC) |
| Manager mencoba ubah baris di luar scope `editable_by_role_code` | 403 | Pola sama di atas | ERD v1.3 §2.30, PROJECT-CONSTITUTION §11 poin 4 |
| Percobaan hapus/downgrade Superadmin terakhir | 409 atau 422 (**Not Defined** kode pastinya — Open Issue) | — | REQ-M10-008, User Flow §10.2 ("Sistem tolak perubahan") |
| Target resource milik scope lain (bukan `all`, bukan miliknya) | 404 (disamarkan, bukan 403) | — | SYSTEM-ARCHITECTURE §8 (diagram: "404 Not Found, disamarkan") |
| Rate limit terlampaui | 429 + header `Retry-After` | — | API Spec §0.5, ADR-018 |

---

# 29. Notification

| Trigger | Channel | Isi (dari User Flow §10.2) |
|---|---|---|
| Role user diubah | In-app (wajib) + Email (opsional, mengikuti kanal umum M08) | "Role Anda telah diubah menjadi {role_baru}" |
| Perubahan permission matrix | **Tidak ada notifikasi eksplisit** ke user terdampak di dokumen sumber — hanya tercatat Audit Log (Bagian 30) | — |

Kepemilikan service notifikasi terpusat ada di M08 (ADR-020) — M10 hanya **memicu** pemanggilan, tidak menulis langsung ke tabel `notifications`.

---

# 30. Activity Log

Setiap perubahan berikut wajib tercatat ke `audit_logs` (entity milik M09, `ENT-M09-AuditLog`):
- Perubahan `role_permissions` (nilai lama → baru, siapa, kapan) — REQ-M10-007.
- Perubahan `users.role_id` (role lama → baru) — User Flow §10.2.

Field minimal (dari Entity Mapping §1, `ENT-M09-AuditLog`): siapa (`user_id` pelaku), kapan (`created_at`), aksi (`action`), entity target (`entity_type`/`entity_id`), nilai lama/baru (**Not Defined** nama kolom pasti — ERD hanya menyebut `audit_logs` sebagai "Audit trail aksi admin & perubahan permission" tanpa merinci skema kolom lengkap di potongan ERD yang tersedia untuk M10 — Open Issue Bagian 46, perlu rujuk ERD §2.27 penuh).

---

# 31. Audit Trail

M10 adalah salah satu dari 2 sumber utama entri `audit_logs` bertipe "perubahan permission/role" (bersama M12 untuk `organization_id`-related, ERD v1.3 Bagian 4 poin catatan). Retensi dan kebijakan hapus **tidak dapat dihapus kecuali retensi resmi terjadwal** (SYSTEM-ARCHITECTURE §14). M10 **menulis** ke `audit_logs`, tidak memiliki halaman viewer sendiri — viewer ada di M09 (`GET /admin/audit-logs`, dikonsumsi lintas modul, Bagian 4 Out of Scope).

---

# 32. External Integration

**Tidak ada.** M10 tidak mengintegrasikan layanan pihak ketiga apa pun (bukan Maps, bukan Email provider secara langsung, bukan Payment). Konsisten dengan sifatnya sebagai modul fondasi murni internal.

---

# 33. AI Capability

**Tidak ada.** M10 tidak memiliki kapabilitas AI — tidak tumpang tindih dengan M13 (AI Assistant, independen sepenuhnya dari M10 kecuali sebagai consumer RBAC platform biasa).

---

# 34. Performance Requirement

| Aspek | Target | Sumber |
|---|---|---|
| Query permission check | Tidak ada target ms eksplisit — **Not Defined** | Technical Specification §5 (tidak mencantumkan baris RBAC) |
| Query list role/permission | Wajib paginated jika daftar besar (prinsip umum, Golden Rule 17 `development-playbook.md`) — namun 7 role dan jumlah `permissions` terbatas per modul membuat pagination **kemungkinan tidak kritis** di skala saat ini | Inferensi dari prinsip umum, bukan requirement eksplisit M10 |
| Real-time propagation | Efektif pada request berikutnya (bukan interval polling) | REQ-M10-009 |

---

# 35. Security Requirement

1. RBAC berlapis: middleware backend (lapisan pertama) + Supabase RLS (lapisan kedua) — **wajib keduanya**, tidak boleh hanya salah satu (PROJECT-CONSTITUTION §12).
2. `superadmin` short-circuit di kode aplikasi **dan** fungsi SQL `auth_is_superadmin()` — dua lapis redundan yang disengaja.
3. `editable_by_role_code` ditegakkan **ganda**: RLS policy (`role_permissions_manager_update`) dan middleware aplikasi — tidak cukup salah satu.
4. Ownership hard rule (`agent_id`) **terpisah** dari resolusi `granted_scope` — berlaku di seluruh modul lain, M10 adalah sumber data-nya tapi tidak mengeksekusi ownership check itu sendiri.
5. `service_role_key` (bypass RLS) hanya untuk operasi backend server-side (job terjadwal) — dilarang keras ke client (PROJECT-CONSTITUTION §12).
6. Minimal 1 Superadmin aktif dijamin di level aplikasi — constraint non-SQL (SYSTEM-ARCHITECTURE §14), berarti **tidak** ditegakkan oleh database constraint semata, wajib validasi eksplisit di service layer sebelum commit.

---

# 36. Accessibility Requirement

**Not Defined secara M10-spesifik.** UI Specification tidak mencantumkan aturan aksesibilitas eksplisit untuk `PermissionMatrixGrid` atau grid Entity×Action×Role (kompleksitas grid interaktif besar berpotensi menyulitkan navigasi keyboard/screen reader, namun tidak ada mitigasi terdokumentasi). Prinsip umum yang berlaku lintas modul (UI Spec, aturan global): label form jelas Bahasa Indonesia, `alt_text` untuk gambar (tidak relevan untuk grid data) — **Open Issue**, Bagian 46.

---

# 37. Responsive Requirement

**Not Defined secara M10-spesifik.** M10 berada di route group `(admin)` — CSR, `noindex,nofollow` (SYSTEM-ARCHITECTURE §6). UI Specification tidak merinci perilaku responsif grid `PermissionMatrixGrid` di layar sempit (grid Entity×Action×Role berpotensi lebar, kandidat masalah UX mobile) — tidak ada wireframe/breakpoint spesifik tersedia di UI Spec §5 (wireframe detail hanya mencakup Form Listing, Kalkulator DBR, Dashboard Agen). **Open Issue**, Bagian 46.

---

# 38. SEO Impact (Jika relevan)

**Tidak relevan.** Seluruh layar M10 berada di `(admin)` route group — `noindex, nofollow` wajib (SEO Spec §1.3: `Disallow: /admin/`). Tidak ada dampak SEO.

---

# 39. Configuration

**Tidak ada parameter `system_configs` yang dimiliki M10.** Berbeda dari M07 (`dbr_config`) atau M11 (`gtm_container_id` dsb.), M10 tidak memiliki tabel/baris konfigurasi bisnis yang dapat diubah tanpa deploy — matriks permission **adalah** data operasionalnya sendiri (disimpan di `role_permissions`, bukan `system_configs`).

---

# 40. Environment Variable

**Tidak ada environment variable baru** yang dibutuhkan khusus M10 — modul ini memakai koneksi Supabase yang sudah ada (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, dst., dikelola global per PROJECT-CONSTITUTION §17), tidak menambah credential/API key pihak ketiga (konsisten Bagian 32, tidak ada integrasi eksternal).

---

# 41. Feature Flag

**Tidak Defined sebagai feature flag formal.** REQ-M10-005 (Role Kustom) berpotensi menjadi kandidat feature flag di fase lanjutan, namun karena Out of Scope dokumen ini (Bagian 4), tidak ada flag yang perlu didefinisikan untuk cakupan saat ini.

---

# 42. Acceptance Criteria

Diambil verbatim dari PRD Modul 10:

- [ ] Superadmin dapat membuka Permission Matrix Editor penuh dan mengubah akses Manager/Admin/Agen per modul-aksi, termasuk pengaturan keamanan web; perubahan tersimpan dan langsung berlaku.
- [ ] Manager dapat membuka menu "Kelola Permission Agen" dan mengubah batasan fitur untuk role Agen; Manager **tidak melihat** menu konfigurasi sistem inti/keamanan/permission Admin ke atas di UI **maupun API**.
- [ ] Manager dapat melakukan seluruh aksi Admin ditambah melihat listing & profil seluruh agen tanpa batasan.
- [ ] Agen yang mencoba akses/edit data agen lain (UI maupun manipulasi API) selalu 403, terlepas konfigurasi permission apa pun.
- [ ] Percobaan Manager mengakses endpoint konfigurasi sistem/keamanan atau permission Admin ke atas menghasilkan 403 konsisten.
- [ ] Perubahan role user tercatat di audit log; permission baru berlaku pada login/request berikutnya.
- [ ] Minimal 1 akun Superadmin selalu ada; sistem mencegah penghapusan/downgrade akun Superadmin terakhir oleh siapa pun termasuk Manager.
- [ ] User dengan akses dinonaktifkan menerima "Akses Ditolak" informatif.

---

# 43. QA Test Scenario

| # | Skenario | Hasil Diharapkan |
|---|---|---|
| 1 | Superadmin ubah `granted_scope` permission Manager untuk modul M03 dari `all` ke `none` | Tersimpan; Manager kehilangan akses M03 pada request berikutnya tanpa re-login |
| 2 | Manager mencoba `PUT /admin/permissions/matrix` (bukan endpoint `/agent`) | 403 |
| 3 | Manager mencoba ubah baris `role_permissions` dengan `role_id=admin` via endpoint `/agent` | 403 (ditolak RLS `role_permissions_manager_update` — kondisi `role_id = agent` tidak terpenuhi) |
| 4 | Superadmin ubah role dirinya sendiri (Superadmin terakhir) menjadi Admin | Ditolak, pesan "Minimal harus ada 1 Superadmin aktif" |
| 5 | Agen dengan `granted_scope=all` yang salah konfigurasi mencoba `DELETE` listing agen lain | Tetap 403 (hard rule ownership terpisah dari `granted_scope`) |
| 6 | Request tanpa token ke `GET /admin/roles` | 401 |
| 7 | Admin (bukan Superadmin/Manager) mengakses `GET /admin/roles` | 403 (Authorization Spec §2.11: Admin = `none`) |
| 8 | Dua request `PUT /admin/permissions/matrix` bersamaan dari 2 sesi Superadmin berbeda, baris sama | **Not Defined** perilaku race-condition — Open Issue Bagian 46 |

---

# 44. Edge Case

1. Superadmin tunggal mencoba menghapus akunnya sendiri via endpoint lain (bukan `role` change) — **di luar cakupan M10** (kepemilikan M01/M09), tapi guard REQ-M10-008 harus tetap berlaku silang-modul — **Open Issue koordinasi lintas modul**.
2. `role_permissions` untuk kombinasi `role_id`+`permission_id` yang belum pernah di-seed (permission modul baru ditambahkan setelah M10 live) — perilaku default **Not Defined** (fallback ke `none`? tidak eksplisit dinyatakan) — Open Issue.
3. Manager yang di-demote menjadi Agen di tengah sesi aktif — apakah sesi lama langsung invalid atau menunggu request berikutnya? REQ-M10-009 menyatakan "request berikutnya", implikasinya sesi token lama **tetap valid secara JWT** namun query permission-nya sudah berubah (re-check per request, SYSTEM-ARCHITECTURE §8 Token Strategy) — **konsisten**, bukan edge case bermasalah, dicatat untuk klarifikasi eksplisit di implementasi.
4. Concurrent update ke baris `role_permissions` yang sama oleh Superadmin dan proses lain — **Not Defined** locking strategy.

---

# 45. Risk Analysis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Kesalahan desain awal model permission (dua-nilai `granted_scope`) | **Sistemik** — beriak ke seluruh 12 modul lain karena semua bergantung pada M10 (MIS §11.2, MDM §5) | Migration `0002` sudah ditulis & direview sesuai ERD v1.3 Baseline; wajib code review manusia sebelum eksekusi Sprint S0 (MIS §13 poin 9) |
| `editable_by_role_code` gagal ditegakkan konsisten (hanya di satu lapisan) | Manager dapat eskalasi ke permission di luar kewenangan | Wajib dua lapis: middleware aplikasi **dan** RLS (sudah tertulis di migration `0002`) — verifikasi keduanya aktif sebelum go-live |
| Guard "minimal 1 Superadmin" hanya diimplementasikan di 1 dari beberapa entry point (mis. lupa di endpoint hapus user M09) | Sistem kehilangan akses admin total | Definition of Done wajib mencakup uji silang endpoint M01/M09 yang menyentuh `role_id`/status user (Bagian 44 poin 1) |
| Real-time propagation tidak teruji dengan benar (token caching berlebihan di client) | Perubahan permission tidak efektif meski backend sudah benar | QA Skenario #1 wajib bagian dari test suite E2E (Playwright, ADR-016) |

---

# 46. Known Limitation

1. **Role Kustom (REQ-M10-005) tidak diimplementasikan** pada cakupan modul ini — hanya 7 role fixed yang didukung.
2. **Preview Akses (REQ-M10-006)** disebut sebagai fitur di Functional Spec, namun **tidak ada detail UI/UX/endpoint spesifik** di dokumen manapun yang diupload — implementasi memerlukan keputusan desain tambahan sebelum dikerjakan.
3. **Skema seed `permissions`** tidak didefinisikan lengkap di migration `0002` — pengisian baris PERM-XXX per modul menunggu modul terkait dibangun, berpotensi memerlukan strategi seeding bertahap yang belum didokumentasikan formal.
4. **Kode error spesifik M10** (mis. `LAST_SUPERADMIN_PROTECTED`) belum terdaftar resmi di API Specification.
5. **Race condition / concurrent update** pada `role_permissions` belum ada strategi locking terdokumentasi.
6. **Aksesibilitas & responsivitas `PermissionMatrixGrid`** belum dirinci — berisiko UX buruk di viewport sempit mengingat sifatnya grid data besar (Entity × Action × Role).

---

# 47. Dependency Checklist

| Item | Status |
|---|---|
| MDM: M10 tidak bergantung modul lain | ✅ Terpenuhi (MDM §3) |
| MIS: M10 adalah urutan #1, Batch 0 | ✅ Konsisten, tidak ada prasyarat modul lain yang perlu diverifikasi selesai |
| ADR-003 (Authorization & RBAC Strategy) Approved | ✅ |
| ADR-024 (RBAC Role Model Scope) Approved | ✅ |
| Migration `0001` (prasyarat teknis `0002`) sudah ditulis | ✅ |
| ERD v1.3 §2.28-2.30 Baseline | ✅ |
| Entity Mapping v1.0 Baseline (ENT-M10-*) | ✅ |
| Authorization & Access Control Specification v1.0 Baseline | ✅ |
| Gate governance eksternal (M12/M13-style blocker) | Tidak berlaku — M10 tidak memiliki gate khusus |

**Kesimpulan:** Seluruh dependency terpenuhi. Tidak ada dependency yang belum tersedia (sesuai instruksi tugas, dikonfirmasi eksplisit).

---

# 48. Definition of Ready

- [x] PRD Modul 10 Baseline (v1.2).
- [x] ERD §2.28-2.30 Baseline (v1.3).
- [x] Entity Mapping Baseline (v1.0).
- [x] Authorization & Access Control Specification Baseline (v1.0).
- [x] API Specification §1.3 Baseline (v1.2).
- [x] Migration SQL `0001`/`0002` tertulis.
- [x] ADR-003, ADR-024 Approved.
- [ ] **Owner sign-off eksekusi Sprint S0** — belum dikonfirmasi (`CURRENT-PROJECT-STATE.md`, Draft status migration).
- [ ] Keputusan desain "Preview Akses" (Bagian 46 poin 2) — belum ada, direkomendasikan diselesaikan sebelum development dimulai, bukan saat development berjalan.

---

# 49. Definition of Done

Mengikuti `development-playbook.md` §24 (Module Completion Checklist), diterapkan ke M10:

- [ ] Seluruh Acceptance Criteria (Bagian 42) terverifikasi.
- [ ] Migration `0001`+`0002` dieksekusi sukses dari database kosong, RLS aktif terverifikasi.
- [ ] Middleware `rbac.middleware` diimplementasikan dan dapat dikonsumsi modul lain (kontrak stabil untuk cross-module wiring, `development-playbook.md` §22.2 poin 6).
- [ ] Unit test: resolusi `granted_scope`, short-circuit Superadmin, guard Superadmin terakhir, enforcement `editable_by_role_code`.
- [ ] E2E test: alur 10.1 dan 10.2 penuh (Playwright).
- [ ] Dokumentasi ERD/API Spec disinkronkan jika ada penyesuaian saat implementasi.
- [ ] Tidak ada `// TODO` yang menutupi keputusan bisnis belum final tanpa dilaporkan.
- [ ] PR lolos CI gate (lint, type-check, test, migration check).
- [ ] `CURRENT-PROJECT-STATE.md` diperbarui: M10 naik dari "Not Started" ke status sesuai realita.

---

# 50. Traceability Matrix

| REQ-XXX | ENT-XXX | Endpoint | PERM-XXX | ADR |
|---|---|---|---|---|
| REQ-M10-001 | `ENT-M10-Role` | `GET /admin/roles` | `PERM-M10-View-Role` | ADR-024 |
| REQ-M10-002 | `ENT-M10-Permission`, `ENT-M10-RolePermission` | `GET/PUT /admin/permissions/matrix` | `PERM-M10-View-Permission`, `PERM-M10-Manage-RolePermission` | ADR-003, ADR-024 |
| REQ-M10-003 | `ENT-M10-RolePermission` | `GET/PUT /admin/permissions/matrix/agent` | `PERM-M10-Update-RolePermission` | ADR-024 |
| REQ-M10-004 | `ENT-M01-User` (FK `role_id`, lintas modul) | `PUT /admin/users/{id}/role` | Tidak terdaftar sebagai PERM-M10 (lihat Bagian 46 poin 4 & Bagian 20 catatan) | ADR-003 |
| REQ-M10-006 | — | Tidak ada endpoint terdaftar | Tidak terdaftar | — (Open Issue) |
| REQ-M10-007 | `ENT-M09-AuditLog` (lintas modul) | `GET /admin/audit-logs` (kepemilikan M09) | — | ADR-014 |
| REQ-M10-008 | `ENT-M10-Role` (`is_protected`) | `PUT /admin/users/{id}/role` (guard) | — | — |
| REQ-M10-009 | `ENT-M10-RolePermission` | Seluruh endpoint terproteksi (cross-cutting) | — | ADR-003 |
| REQ-M10-010 | — | Seluruh endpoint terproteksi (cross-cutting) | — | ADR-013 (Error Handling) |

---

# 51. Conflict Analysis

| # | Konflik/Ambiguitas | Dokumen Terlibat | Resolusi (berdasar prioritas dokumen Bagian "Dokumen Acuan") |
|---|---|---|---|
| 1 | `Authorization-Access-Control-Specification-v1.0.md` §2.11 mencantumkan Manager = `none` untuk **seluruh** baris permission M10 secara literal, sedangkan PRD Modul 10 (prioritas lebih tinggi untuk keputusan bisnis, meski Authorization Spec secara umum prioritas terkait lebih spesifik untuk permission) dan API Specification §1.3 menyatakan Manager memiliki akses **terbatas** (`GET/PUT /admin/permissions/matrix/agent`). | Authorization Spec v1.0 §2.11 vs PRD v1.2, API Spec v1.2 | **Mengikuti PRD + API Spec.** **Status: ✅ Closed [2026-08-06], audit v1.1/T4-01** — `Authorization-Access-Control-Specification-v1.1.md` §2.11 dikoreksi penuh: View-Role/Permission/RolePermission (seluruh role→`all`, mengikuti RLS `USING(true)`), Update-RolePermission (Manager: none→`own`, scoped role target `agent`). |
| 2 | PRD Modul 10 bagian "Role Kustom" menyebut "di luar **4 default**", namun daftar role final adalah **7** (Superadmin/Manager/Admin/Instructor/Agen/Developer Partner/Buyer) sesuai resolusi OD-02 dan ERD v1.3 §2.28. | PRD v1.2 (frasa "4 default" tampak belum diperbarui dari versi sebelum retrofit role) vs ERD v1.3, Authorization Spec v1.0 §1.1 | **Mengikuti ERD v1.3 + Authorization Spec** (7 role final, lebih baru & lebih otoritatif untuk skema) — frasa "4 default" di PRD dianggap sisa redaksi lama yang belum disinkronkan, **tidak mengubah requirement REQ-M10-005 itu sendiri** (tetap Out of Scope/opsional fase lanjutan terlepas dari angka "4" vs "7"). |
| 3 | `PUT /admin/users/{id}/role` diklasifikasikan di API Spec §1.3 di bawah "Manajemen Role & Permission (Modul 10)", namun secara substansi mengubah data `users` (entity M01) dan tumpang tindih dengan Manajemen User (M09). | API Spec v1.2 §1.3 vs Entity Mapping v1.0 (kepemilikan `ENT-M01-User`) | **Dipertahankan sebagai endpoint yang didokumentasikan di M10** (mengikuti pengelompokan API Spec, dokumen prioritas #8) untuk kebutuhan dokumen ini, namun **dicatat eksplisit** bahwa entity yang diubah (`users.role_id`) dimiliki M01 — koordinasi implementasi lintas M01/M09/M10 diperlukan, bukan murni tanggung jawab M10 sendiri. |
| 4 | Tidak ditemukan konflik antara MDM dan MIS terkait posisi M10 — keduanya konsisten (Foundation, urutan #1, tanpa dependency). | — | Tidak ada resolusi diperlukan. |

---

# 52. Recommendation

1. **M10 siap memasuki Sprint S0 tanpa blocker dependency** — seluruh prasyarat MDM/MIS terpenuhi (Bagian 47).
2. **Selesaikan 2 Open Issue desain sebelum coding dimulai** (bukan sambil jalan): (a) detail UI/endpoint "Preview Akses" (REQ-M10-006), (b) strategi seeding `permissions` bertahap lintas modul (Bagian 25, 46).
3. **Definisikan kode error spesifik M10** (`FORBIDDEN_ROLE_ACCESS`, `LAST_SUPERADMIN_PROTECTED`, dsb.) secara eksplisit di API Specification sebelum implementasi — saat ini hanya pola umum yang tersedia (Bagian 22, 28).
4. **Prioritaskan test otomatis untuk 3 hard rule paling kritis** sebelum modul dianggap selesai: Superadmin bypass, `editable_by_role_code` enforcement ganda (middleware+RLS), guard Superadmin terakhir — ketiganya adalah titik kegagalan bernilai sistemik (Bagian 45).
5. **Rekomendasikan revisi editorial** (bukan blocking) untuk Authorization Spec §2.11 (Konflik #1) dan PRD Modul 10 frasa "4 default" (Konflik #2) pada siklus governance berikutnya — sudah diresolusikan secara analitis di sini, tidak menghambat implementasi.
6. **Setelah M10 selesai**, lanjutkan langsung ke M01 (Authentication) sesuai MIS Bagian 3 urutan #2 — jangan mulai modul manapun sebelum Definition of Done (Bagian 49) M10 terpenuhi penuh, mengingat sifatnya sebagai dependency sistemik seluruh proyek.

---

*Module Planning ini disusun murni berdasarkan dokumen yang diupload — tidak ada requirement yang diubah/ditambah/dihapus, tidak ada perubahan arsitektur/API/skema database. Seluruh item bertanda "Not Defined"/Open Issue dicatat apa adanya sesuai kondisi dokumen sumber, bukan diasumsikan atau dikarang.*
