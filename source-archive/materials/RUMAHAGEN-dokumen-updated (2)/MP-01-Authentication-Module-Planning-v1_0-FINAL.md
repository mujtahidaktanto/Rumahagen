# MODULE PLANNING
## MP-01 — Authentication (Registrasi & Autentikasi Agen)
### Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 6 Agustus 2026
**Disusun sebagai:** CTO / Enterprise Architect / Solution Architect / Product Manager / Technical Product Owner / Engineering Manager / Technical Lead / Senior Backend Engineer / Senior Frontend Engineer / Senior QA Engineer / Senior Database Architect / DevOps Architect (peran gabungan)
**Tujuan Dokumen:** Acuan resmi implementasi Modul 1 (Authentication) via Bolt.new maupun developer manual. Tidak berisi kode, tidak berisi UI mockup, tidak berisi sprint.

### Dokumen Acuan & Prioritas
| # | Dokumen | Versi Dipakai |
|---|---|---|
| 1 | Module Implementation Strategy (MIS) | v1.1 |
| 2 | Module Dependency Matrix (MDM) | v1.0 |
| 3 | Engineering Guidelines (`PROJECT-CONSTITUTION.md`) | — |
| 4 | Technical Specification | v1.0 |
| 5 | System Architecture | v1.6 |
| 6 | Technology Decisions | v1.5 |
| 7 | Database Schema (ERD §2.1-2.2 + migration `0003`) | ERD v1.3 |
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
> **⚠️ Konflik penomoran:** ketiga snapshot berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026"** yang identik, namun merepresentasikan 3 keadaan berbeda secara kronologis (progresif — setiap snapshot adalah superset resolusi dari snapshot sebelumnya, tidak ada kemunduran). Nomor versi publik **dipertahankan "1.0"** — identifier 1.0a/1.0b/1.0c di bawah semata untuk audit, bukan penomoran resmi. File final ini setara **1.0c**.

| Versi | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| 1.0a | 6 Agu 2026 | Rilis awal — 2 Open Issue kritis belum diselesaikan (bootstrap Superadmin, status SSO Apple), gap istilah "Verified" vs skema 4-nilai baru dicatat, Authorization Spec masih v1.0 dengan Konflik #3 terbuka. |
| 1.0b | 6 Agu 2026 | Bootstrap Superadmin **Resolved** (OD-18 Opsi B — `scripts/seed-superadmin.ts`). SSO Apple & gap istilah masih terbuka. |
| 1.0c | 6 Agu 2026 | SSO Apple **Closed** (T4-06 Opsi B — dipertahankan berlabel "belum diimplementasikan"). Istilah "Verified"→"Active" **disinkronkan** (audit T4-07, 9 lokasi PRD + 1 User Flow). Authorization Spec §2.2 Konflik #3 **Closed**, dinaikkan ke v1.1 (audit T4-02). **Versi terkini** — basis dokumen final di bawah. |

---

# 1. Executive Summary

Modul 1 (Authentication) adalah modul **Foundation kedua** — satu-satunya dependency-nya adalah M10 (RBAC, untuk penerbitan `role_id`) yang sudah selesai lebih dulu di urutan MIS. Modul ini mengelola identitas seluruh jenis akun (`users`) dan dokumen verifikasi legalitas agen (`agent_verification_documents`), dengan alur registrasi mandiri, verifikasi OTP, login (password + Google OAuth2), approval manual, dan manajemen sesi multi-device. Migration SQL (`0003_m01_auth.sql`) **sudah ditulis lengkap**, termasuk trigger safety-guard "Superadmin terakhir" yang secara teknis **berada secara fisik di migration M01** (bukan M10) karena bergantung tabel `users`. Go/No-Go: ✅ **GO**, tanpa blocker (MIS §15).

---

# 2. Purpose

Menyediakan spesifikasi implementasi lengkap Modul 1 sebagai rujukan tunggal Bolt.new/developer manual — mencakup scope fungsional, kontrak API, aturan bisnis, matriks permission, dan kriteria selesai, termasuk penyelarasan eksplisit atas ketidaksesuaian antar-dokumen sumber yang ditemukan (lihat Bagian 51).

---

# 3. Scope

- Tabel `users`, `agent_verification_documents` (ERD v1.3 §2.1-2.2) beserta RLS policy dan trigger `prevent_last_superadmin_removal`.
- Endpoint registrasi/login/OTP/OAuth/refresh/logout/reset password (API Spec §1.1).
- Endpoint upload dokumen legalitas (`POST /users/verification-documents`) dan approval registrasi (`GET/PUT /admin/agents/*`) — API Spec §1.2, khusus bagian yang menyentuh `ENT-M01-*` (bukan `ENT-M02-*`).
- Layar: Registrasi Agen, Login, Verifikasi OTP, Upload Dokumen Legalitas, Lupa/Reset Password, Status Akun Pending Review (UI Spec §6, 6 layar M01).
- Middleware `auth.middleware` (identifikasi `user.role_id` dari token) — lapisan **pertama** sebelum `rbac.middleware` (SYSTEM-ARCHITECTURE §8).
- Enkripsi dokumen legalitas (KTP/NPWP/sertifikasi) at-rest.
- Manajemen sesi (single-device logout & logout-all).

---

# 4. Out of Scope

- **Approval keputusan bisnis lanjutan** (mis. kualifikasi apa yang membuat dokumen "layak approve") — hanya alur teknis approve/reject yang dicakup, kriteria substantif penilaian dokumen ada di kebijakan operasional Admin, bukan spesifikasi teknis.
- **Profil agen (bio, foto, spesialisasi)** — milik M02, meski `GET /users/me` bersinggungan (Bagian 51 tidak menemukan konflik cakupan signifikan di sini, hanya endpoint bersama).
- **Penerbitan/pengecekan `role_id` dan resolusi permission** — milik M10 (dependency, dikonsumsi bukan diimplementasikan ulang di sini).
- **REQ-M01-007 (Role & level agen Junior/Senior/Team Leader)** — eksplisit "Fase 2" di PRD, **di luar cakupan implementasi wajib dokumen ini**.
- **SSO Apple** — disebut di PRD/Functional Spec/User Flow namun **tidak ada** endpoint/ADR yang mendefinisikannya. **✅ Closed [2026-08-06], T4-06 Opsi B** — Owner memilih pertahankan referensi, ditandai eksplisit "belum diimplementasikan / roadmap masa depan" di PRD REQ-M01-002, Functional Spec §M01, User Flow Modul 1. Tetap **belum in-scope** untuk implementasi kode sampai ada spesifikasi teknis eksplisit di siklus berikutnya.
- Pembuatan kode, wireframe visual, dan sprint breakdown (sesuai aturan tugas ini).

---

# 5. Business Objective

Menjadi **gerbang identitas tunggal** platform — memastikan hanya agen terverifikasi legalitasnya yang dapat memposting listing (Business Rule PRD Modul 1: "Agen tidak bisa posting listing sebelum status `Verified`"), sekaligus titik masuk aman bagi seluruh role lain (Buyer, internal role) via satu tabel `users`.

---

# 6. Business Value

- Mengurangi risiko penyalahgunaan platform oleh agen tidak terverifikasi (fraud/legalitas palsu).
- Mempercepat proses rekrutmen agen dibanding proses manual (registrasi mandiri + OTP, bukan formulir kertas).
- Kepatuhan data pribadi (UU PDP) via enkripsi dokumen legalitas sejak titik masuk pertama.
- Login SSO Google mengurangi friksi onboarding dibanding password-only.

---

# 7. Dependency Summary (Berdasarkan MDM)

| Arah | Isi |
|---|---|
| **Bergantung Pada** | **M10 (RBAC)** — satu-satunya dependency, untuk penerbitan `role_id` saat registrasi (MDM Bagian 3, MDM Bagian 2 M01: "Menerima input `role_id` dari M01 saat registrasi... satu-satunya titik kopling"). |
| **Dibutuhkan Oleh** | **11 dari 12 modul lain** (M02-M09, M11-M13) — hanya M10 yang tidak bergantung M01 (MDM Dependency Matrix Bagian 3, kolom M01 bertanda ● di hampir seluruh baris). |
| **Circular Dependency** | Tidak ditemukan — M01→M10 satu arah murni (MDM Bagian 11). |
| **Shared Kernel terkait** | Tidak ada. |

---

# 8. Module Position (Berdasarkan MIS)

| Dimensi MIS | Nilai |
|---|---|
| Kategori (MIS §2) | **Foundation** |
| Urutan Implementasi (MIS §3) | **#2 dari 13** — segera setelah M10 |
| Layer (MIS §13) | **Layer 1 — Identity & Configuration** |
| Prioritas (MIS §14) | **P0 — Blocker Absolut** |
| Batch Paralel (MIS §6) | **Batch 1** (bersama M09 kerangka dasar) |
| Critical Path (MIS §5) | Node kedua di jalur kritis (`M10 → M01 → M06 → M03 → M07 → M08`) |
| Alasan Posisi (MIS §4) | "Tanpa RBAC, penerbitan `role_id` saat registrasi (M01) tidak punya target; tanpa Auth, seluruh middleware `auth.middleware → rbac.middleware` tidak dapat diuji end-to-end." |
| Go/No-Go (MIS §15) | ✅ **GO** — "Foundation, bergantung M10 saja" |

---

# 9. Stakeholder

| Stakeholder | Kepentingan |
|---|---|
| Owner/Superadmin | Penyetuju kebijakan approval, penerima notifikasi registrasi baru |
| Admin/Manager | Pelaksana approval/reject dokumen legalitas |
| Calon Agen (pendaftar) | Pengguna utama alur registrasi |
| Buyer (pendaftar ringan) | Pengguna alur registrasi jalur cepat (langsung `active` setelah OTP) |
| 11 modul lain | Konsumen `users.id`/`role_id` sebagai FK identitas |

---

# 10. Actor

| Actor | Peran dalam Modul |
|---|---|
| Guest (calon Agen/Buyer, belum punya akun) | Inisiator registrasi |
| Agen (status `pending_review`) | Subjek approval, akses terbatas |
| Agen (status `active`) | Pengguna penuh — login, kelola sesi |
| Superadmin, Manager, Admin | Approve/reject registrasi & dokumen (API Spec §1.2) |
| Buyer | Registrasi jalur cepat, tanpa dokumen legalitas |
| System (Supabase Auth) | Penerbit token OTP/JWT, verifikasi `id_token` Google |

---

# 11. User Story

| ID | Story | Sumber |
|---|---|---|
| US-M01-01 | Sebagai calon agen, saya ingin mendaftar mandiri via email/HP dengan verifikasi OTP, agar saya dapat mulai proses onboarding tanpa menunggu staf. | REQ-M01-001 |
| US-M01-02 | Sebagai user terdaftar, saya ingin login dengan password atau Google, agar saya fleksibel memilih metode. | REQ-M01-002 |
| US-M01-03 | Sebagai calon agen, saya ingin mengunggah KTP/NPWP/sertifikasi, agar legalitas saya dapat diverifikasi. | REQ-M01-003 |
| US-M01-04 | Sebagai sistem, saya perlu melacak status akun bertahap (`pending_review`→`active`/`suspended`/`rejected`), agar hanya agen terverifikasi yang dapat posting listing. | REQ-M01-004 |
| US-M01-05 | Sebagai Admin/Manager/Superadmin, saya ingin approve/reject registrasi agen, agar kualitas agen di platform terjaga. | REQ-M01-005 |
| US-M01-06 | Sebagai user, saya ingin reset password dan logout dari semua device, agar akun saya tetap aman. | REQ-M01-006 |
| US-M01-07 | Sebagai user, saya ingin dokumen KTP/NPWP saya tersimpan terenkripsi, agar data pribadi saya terlindungi. | REQ-M01-008 |

---

# 12. Functional Requirement

| REQ ID | Requirement | Status Cakupan |
|---|---|---|
| REQ-M01-001 | Registrasi mandiri via email/HP + OTP | In Scope |
| REQ-M01-002 | Login password + SSO Google/Apple | **In Scope (Google saja)** — Apple Out of Scope, lihat Bagian 4 & 51 |
| REQ-M01-003 | Upload dokumen legalitas | In Scope |
| REQ-M01-004 | Status akun bertahap | In Scope, dengan catatan penyelarasan skema (Bagian 51 Konflik #2) |
| REQ-M01-005 | Approval manual oleh Superadmin/Admin/Manager | In Scope |
| REQ-M01-006 | Reset password & manajemen sesi | In Scope |
| REQ-M01-007 | Role & level agen (Junior/Senior/Team Leader) | **Out of Scope** — eksplisit Fase 2 |
| REQ-M01-008 | Enkripsi dokumen KTP/NPWP | In Scope |

---

# 13. Non Functional Requirement

| Kategori | Requirement | Sumber |
|---|---|---|
| Rate limiting endpoint sensitif | Login/register/OTP/forgot-password: **5 req/menit/IP+identifier** | API Spec §0.5, ADR-018 |
| Rate limiting umum | Public 60 req/menit/IP; Authenticated 300 req/menit/user | API Spec §0.5 |
| Token lifetime | Access token umur pendek (15-60 menit), refresh token umur panjang (30 hari), httpOnly cookie/secure storage | API Spec §0.1 |
| OTP cooldown | 60 detik antara permintaan kirim ulang | Functional Spec §4.1 |
| Response time spesifik M01 | **Not Defined** — tidak ada target ms eksplisit di Technical Specification §5 | Open Issue |
| Enkripsi dokumen | Wajib at-rest, `encrypted=true` default | ERD v1.3 §2.2 |

---

# 14. Business Rule

Dari PRD Modul 1 "Business Rules" (prioritas tertinggi requirement bisnis):

1. Agen **tidak bisa posting listing** sebelum status `Verified` (lihat catatan penyelarasan istilah skema, Bagian 51 Konflik #2 — di level database, kondisi ini secara operasional dipetakan ke status `active`).
2. Admin mendapat notifikasi setiap ada registrasi baru.
3. Data KTP/NPWP disimpan **terenkripsi** (compliance data pribadi).
4. Approval registrasi dapat dilakukan **Superadmin, Admin, atau Manager** (sesuai matriks Modul 10) — role **Agen** hanya dapat mengajukan pendaftaran untuk dirinya sendiri.
5. **(ERD v1.3 §4 poin 9, migration `0003`)** Sistem mencegah penghapusan/downgrade/suspend akun Superadmin terakhir yang aktif — ditegakkan via **trigger database** (`prevent_last_superadmin_removal`), bukan hanya validasi aplikasi.
6. **(API Spec §1.1)** Registrasi via Google untuk role `agent` **tetap** melalui alur `pending_review` (wajib upload dokumen legalitas) — berbeda dari role `buyer` yang langsung `active` setelah verifikasi OTP/Google.

---

# 15. Workflow Summary

**Alur Registrasi & Approval (User Flow Modul 1):** Buka "Daftar sebagai Agen" → isi form → submit → OTP dikirim → verifikasi OTP (salah/expired → retry) → akun terbuat status awal → lengkapi profil wajib (KTP, NPWP opsional, area, kantor, sertifikasi opsional) → submit → status `Pending Review` → notifikasi ke Admin → Admin review dokumen → **Reject** (isi alasan → notifikasi ke agen → agen revisi & submit ulang → kembali `Pending Review`) atau **Approve** (status → `Verified`/`Active` → notifikasi ke agen → login penuh) → redirect Dashboard Agen (M08).

**Alur Login:** Buka Login → input kredensial atau SSO Google → kredensial salah → error generik + opsi "Lupa Password" → berhasil → cek status akun → `Pending Review` → halaman "Menunggu Approval" (fitur terbatas); `Suspended` → pesan ditangguhkan + kontak support; `Active` → Dashboard Agen.

**Alur Lupa Password:** Klik "Lupa Password" → input email → link reset terkirim → klik link → password baru + konfirmasi → redirect Login.

---

# 16. Screen List

| Kode Layar | Nama | Template (UI Spec §6) | Catatan |
|---|---|---|---|
| SCR-M01-01 | Registrasi Agen | D (mini-wizard 1 step) | Lanjut ke Verifikasi OTP tanpa reload |
| SCR-M01-02 | Login | — (form sederhana) | Card terpusat, tanpa sidebar |
| SCR-M01-03 | Verifikasi OTP | — (form sederhana) | 6 kotak input digit terpisah |
| SCR-M01-04 | Upload Dokumen Legalitas | D (step 2 dari onboarding) | |
| SCR-M01-05 | Lupa/Reset Password | — (form sederhana) | |
| SCR-M01-06 | Status Akun Pending | — (status page, tanpa form) | Ilustrasi tunggu + progress |

---

# 17. Screen Detail

### SCR-M01-01 — Registrasi Agen (`/register`)
- Input: Nama lengkap*, Email* atau No. HP*, Password* (min 8 karakter, kombinasi huruf+angka), Konfirmasi Password*, Nama kantor/brokerage (opsional), Area operasional (opsional).
- Aksi: "Daftar" → kirim OTP; "Daftar dengan Google/Apple" → alur SSO (**catatan: Apple belum ada spesifikasi teknis**, lihat Bagian 51).
- Output: redirect Verifikasi OTP; email/HP terdaftar → pesan inline + link Login; password tidak cocok → validasi real-time.

### SCR-M01-02 — Login (`/login`)
- Input: Email/No. HP*, Password*.
- Aksi: "Masuk"; "Lupa Password?"; SSO Google (Apple: lihat catatan di atas).
- Output: kredensial salah → pesan generik "Email/password salah" (tidak membocorkan field mana yang salah — prinsip keamanan enumerasi); `Suspended` → pesan khusus + kontak Admin.

### SCR-M01-03 — Verifikasi OTP (`/verify-otp`)
- Input: 6-digit kode.
- Aksi: "Verifikasi"; "Kirim Ulang" (cooldown 60 detik).
- Output: sukses → redirect Upload Dokumen; salah/expired → pesan inline + hitung mundur reset.

### SCR-M01-04 — Upload Dokumen Legalitas (`/onboarding/documents`)
- Input: KTP* (gambar/PDF), NPWP (opsional), Sertifikat REI/AREBI (opsional).
- Aksi: "Kirim untuk Verifikasi".
- Output: status → `Pending Review`, redirect Status Akun; dokumen tersimpan terenkripsi.

### SCR-M01-05 — Lupa/Reset Password (`/forgot-password`, `/reset-password`)
- Input (forgot): Email/No. HP*. Input (reset): Password Baru*, Konfirmasi*.
- Output: link terkirim; link expired → "Link kedaluwarsa, minta ulang".

### SCR-M01-06 — Status Akun Pending Review (`/onboarding/pending`)
- Tanpa input — menampilkan status & estimasi waktu proses.
- Output: begitu Admin approve → notifikasi + akses dashboard terbuka otomatis (tanpa re-login jika sesi masih aktif).

---

# 18. Navigation Flow

```
/register → (submit) → /verify-otp → (OTP benar) → /onboarding/documents
   → (submit) → /onboarding/pending → (Admin approve, async) → /dashboard (M08)

/login → (kredensial benar + status active) → /dashboard (M08)
/login → (status pending_review) → /onboarding/pending
/login → (status suspended) → halaman pesan ditangguhkan (tanpa redirect lanjut)

/forgot-password → (submit email) → email link → /reset-password → (submit) → /login
```
Sumber: User Flow §Modul 1; Functional Spec §4.1.

---

# 19. API Summary

10 endpoint di `1.1 Registrasi & Login` + 4 endpoint relevan M01 di `1.2` (khusus yang menyentuh `ENT-M01-*`, bukan `ENT-M02-AgentProfile`):

| Endpoint | Fungsi |
|---|---|
| `POST /auth/register` | Registrasi baru (`role`: `buyer`\|`agent`) |
| `POST /auth/verify-otp` | Verifikasi OTP |
| `POST /auth/resend-otp` | Kirim ulang OTP |
| `POST /auth/login` | Login password |
| `POST /auth/oauth/google` | Login/registrasi Google |
| `POST /auth/refresh` | Refresh token |
| `POST /auth/logout` | Logout 1 device |
| `POST /auth/logout-all` | Logout semua device |
| `POST /auth/forgot-password` | Kirim link reset |
| `POST /auth/reset-password` | Set password baru |
| `POST /users/verification-documents` | Upload dokumen legalitas |
| `GET /admin/agents/pending` | Daftar agen menunggu approval |
| `PUT /admin/agents/{id}/approve` | Approve registrasi |
| `PUT /admin/agents/{id}/reject` | Reject + alasan |
| `PUT /admin/agents/{id}/suspend` | Suspend akun |

---

# 20. Endpoint Mapping

| Method | Endpoint | Auth | `module_code`/`action_code` | `granted_scope` |
|---|---|---|---|---|
| POST | `/auth/register` | Public | `M01_registration` / `create` | `own` (Agen), N/A untuk Guest belum berakun |
| POST | `/auth/verify-otp`, `/resend-otp` | Public | — (bagian alur register) | — |
| POST | `/auth/login`, `/oauth/google`, `/refresh` | Public | — (autentikasi, bukan otorisasi) | — |
| POST | `/auth/logout(-all)` | Authenticated | `M01_registration` / `update` (sesi milik sendiri) | `own` |
| POST | `/auth/forgot-password`, `/reset-password` | Public | — | — |
| POST | `/users/verification-documents` | Agen | `M01_registration` / `create` (`PERM-M01-Create-AgentVerificationDocument`) | `own` |
| GET | `/admin/agents/pending` | Superadmin, Manager, Admin | `M01_registration` / `view` (`PERM-M01-View-User`) | `all` |
| PUT | `/admin/agents/{id}/approve` | Superadmin, Manager, Admin | `M01_registration` / `approve` (`PERM-M01-Approve-User`, `PERM-M01-Approve-AgentVerificationDocument`) | `all` |
| PUT | `/admin/agents/{id}/reject`, `/suspend` | Superadmin, Manager, Admin | `M01_registration` / `update` | `all` |

---

# 21. Request Validation

| Endpoint | Field | Validasi |
|---|---|---|
| `POST /auth/register` | `email` | Format email valid, UNIQUE di `users` |
| | `phone` | Format E.164 (`+62...`), UNIQUE |
| | `password` | Min 8 karakter, kombinasi huruf+angka (Functional Spec §4.1) |
| | `role` | Enum: `buyer` \| `agent` (API Spec §1.1 — **hanya 2 nilai**, bukan role internal) |
| `POST /auth/verify-otp` | `otp_code` | 6 digit, dicocokkan dengan kode terkirim, cek expiry |
| `POST /users/verification-documents` | `doc_type` | Enum: `ktp` \| `npwp` \| `sertifikasi_rei` \| `lainnya` (ERD v1.3 §2.2) |
| | `file_url` | Wajib untuk `ktp`; NPWP & sertifikasi opsional (PRD Modul 1) |
| `POST /auth/oauth/google` | `id_token` | Wajib diverifikasi **server-side** ke Google Token Info endpoint (API Spec §1.1, bukan trust client) |
| `PUT /admin/agents/{id}/reject` | `rejection_reason` | Wajib diisi (Business Rule: "Reject dengan alasan") |
| Seluruh endpoint mutating | — | Validasi ulang server wajib (tidak percaya validasi client, Golden Rule 15) |

---

# 22. Response Structure

Mengikuti envelope standar API Spec §0.2. Contoh spesifik M01 (dari API Spec §1.1):

```json
// POST /auth/register — 201
{ "success": true, "data": { "user_id": "usr_...", "role": "agent", "status": "pending_review", "otp_sent_to": "andi@example.com" } }

// POST /auth/oauth/google — 200
{ "success": true, "data": { "access_token": "...", "refresh_token": "...", "user": { "id": "usr_...", "role": "buyer", "is_new_user": false } } }
```
Kode error spesifik M01: **Not Defined** secara eksplisit (mis. `EMAIL_ALREADY_REGISTERED`, `OTP_INVALID`, `ACCOUNT_SUSPENDED`) — API Specification tidak mencantumkan tabel kode error per-endpoint; pola `SCREAMING_SNAKE_CASE` mengikuti PROJECT-CONSTITUTION §13, konkretnya perlu didefinisikan saat implementasi — Open Issue Bagian 46.

---

# 23. Database Impact

| Aspek | Detail |
|---|---|
| Tabel baru | `users`, `agent_verification_documents` |
| Kolom kunci `users` | `id` (=`auth.uid()` Supabase Auth), `email`, `phone`, `password_hash`, `role_id` (FK `roles`), `status`, `email_verified_at`, `last_login_at`, `deleted_at` (soft-delete) |
| Index | `idx_users_role_id`, `idx_users_status` (partial, `WHERE deleted_at IS NULL`), `idx_avd_user_id` |
| RLS | `users_select_own`, `users_update_own`, `users_insert_self`; `avd_select`, `avd_insert_own`, `avd_update_review` — seluruhnya memakai `auth_has_scope_all()` dari migration `0001` |
| Trigger | `trg_users_updated_at`; **`trg_prevent_last_superadmin`** (guard REQ-M10-008, secara fisik di migration M01 karena baru bisa dibuat setelah tabel `users` ada) |
| FK tertunda dari M10 | `role_permissions.updated_by → users.id` ditambahkan via `ALTER TABLE` di migration ini (`0003`), karena tabel `users` belum ada saat `0002` ditulis |
| Soft-delete | `users` **termasuk** 8 tabel wajib soft-delete; `agent_verification_documents` **tidak** termasuk (hard-delete/permanen sesuai kebijakan yang berlaku umum kecuali disebutkan lain — **Not Defined eksplisit** untuk tabel ini, Open Issue) |

---

# 24. Entity Mapping

| ENT ID | Tipe | Tabel Fisik | REQ Terkait |
|---|---|---|---|
| `ENT-M01-User` | Root | `users` | REQ-M01-001..006 |
| `ENT-M01-AgentVerificationDocument` | Child of User | `agent_verification_documents` | REQ-M01-003 |

---

# 25. Migration Requirement

| Item | Status |
|---|---|
| `0003_m01_auth.sql` | **Sudah ditulis** — membuat `users`, `agent_verification_documents`, trigger guard Superadmin, RLS penuh |
| Prasyarat | `0001` (helper function) dan `0002` (tabel `roles` untuk FK `role_id`) — wajib berurutan |
| Status eksekusi | **Belum dieksekusi** ke database live (`CURRENT-PROJECT-STATE.md`) |
| Late-binding FK | Migration ini juga menyelesaikan FK `role_permissions.updated_by` yang tertunda dari `0002` — dependency migration lintas-modul yang **disengaja**, bukan bug urutan |
| Seed data | Tidak ada seed data user di migration ini (akun pertama dibuat via alur registrasi aplikasi, bukan SQL seed) — **✅ Resolved [2026-08-06], OD-18 Opsi B** — mekanisme dipilih: script/CLI `scripts/seed-superadmin.ts` (Node.js + Supabase Admin API), dijalankan sekali saat Sprint S0 dengan parameter `--email --name --password`, baca kredensial dari input eksekusi/env var (tidak pernah dihardcode/commit). Detail lengkap: `scripts/README-seed-superadmin.md`. |

---

# 26. Permission Matrix

Sumber: `Authorization-Access-Control-Specification-v1.0.md` §2.2:

| Permission ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer |
|---|---|---|---|---|---|---|---|---|---|
| `PERM-M01-Create-User` | `ENT-M01-User` | Create | all | all | all | none | own | none | none |
| `PERM-M01-View-User` | `ENT-M01-User` | View | all | all | all | none | own | none | none |
| `PERM-M01-Update-User` | `ENT-M01-User` | Update | all | all | all | none | own | none | none |
| `PERM-M01-Approve-User` | `ENT-M01-User` | Approve | all | all | all | none | own | none | none |
| `PERM-M01-Assign-User` | `ENT-M01-User` | Assign | all | all | all | none | own | none | none |
| `PERM-M01-Create-AgentVerificationDocument` | `ENT-M01-AgentVerificationDocument` | Create | all | all | all | none | own | none | none |
| `PERM-M01-View-AgentVerificationDocument` | `ENT-M01-AgentVerificationDocument` | View | all | all | all | none | own | none | none |
| `PERM-M01-Approve-AgentVerificationDocument` | `ENT-M01-AgentVerificationDocument` | Approve | all | all | all | none | own | none | none |

> **Catatan kualitas dokumen sumber:** kolom Agent bernilai `own` bahkan untuk aksi `Approve` — secara harfiah berarti "agen dapat approve miliknya sendiri", yang bertentangan dengan Business Rule PRD ("Approval registrasi dapat dilakukan Superadmin/Admin/Manager"; Agen "hanya dapat mengajukan"). Dianalisis sebagai **artefak generalisasi tabel** (kemungkinan setiap baris otomatis diberi `own` untuk Agent tanpa pengecualian per-aksi), bukan keputusan bisnis baru — lihat Bagian 51 Konflik #3.

---

# 27. Validation Matrix

| Field | Wajib? | Tipe | Aturan |
|---|---|---|---|
| `email` | Salah satu wajib (email atau phone) | VARCHAR(255) | UNIQUE, format email |
| `phone` | Salah satu wajib | VARCHAR(20) | UNIQUE |
| `password` | Ya (untuk registrasi non-OAuth) | — | Min 8 karakter, huruf+angka |
| `role` (saat register) | Ya | Enum | `buyer` \| `agent` |
| `doc_type` | Ya (per baris dokumen) | Enum | `ktp`\|`npwp`\|`sertifikasi_rei`\|`lainnya` |
| KTP | Ya (untuk agen) | File | Wajib sebelum submit `Pending Review` |
| NPWP, sertifikasi | Opsional | File | — |
| `status` (transisi) | — | Enum | `pending_review`→`active`/`suspended`/`rejected` — **hanya 4 nilai di skema**, lihat Bagian 51 Konflik #2 |

---

# 28. Error Handling

| Skenario | HTTP Status | Sumber |
|---|---|---|
| Email/HP sudah terdaftar | 409 (pola API Spec §0.3: Konflik) | Functional Spec §4.1 ("Email/No. HP sudah digunakan") |
| Kredensial salah | 401, pesan generik (tidak membocorkan field) | Functional Spec §4.1 |
| Akun `Suspended` mencoba login | 403 atau pesan khusus (**Not Defined status code pasti**) | User Flow Modul 1 |
| OTP salah/expired | 400/422 (**Not Defined pasti**) | Functional Spec §4.1 |
| Token refresh invalid/expired | 401 | API Spec §0.1 |
| Reject tanpa `rejection_reason` | 400 (validasi field wajib) | PRD Modul 1 Acceptance Criteria |
| Rate limit terlampaui (5/menit endpoint sensitif) | 429 + `Retry-After` | API Spec §0.5 |
| Percobaan suspend/downgrade Superadmin terakhir | 500/exception dari trigger DB (**bukan** 4xx terkontrol — Open Issue, lihat Bagian 46) | Migration `0003` (`RAISE EXCEPTION`, bukan validasi aplikasi yang menghasilkan response terstruktur) |

---

# 29. Notification

| Trigger | Penerima | Isi | Sumber |
|---|---|---|---|
| Registrasi agen baru submit dokumen | Admin | "Ada agen baru menunggu review" | User Flow Modul 1; PRD Business Rule |
| Approval registrasi | Agen ybs | "Akun Anda telah aktif" | User Flow Modul 1 |
| Reject registrasi | Agen ybs | Alasan penolakan | User Flow Modul 1 |
| OTP | Agen/Buyer (email/SMS) | Kode 6-digit | REQ-M01-001 |
| Link reset password | User ybs (email) | Link reset | REQ-M01-006 |

Kepemilikan service pengiriman ada di M08 (ADR-020) — M01 memicu, tidak menulis langsung ke `notifications`.

---

# 30. Activity Log

Perubahan berikut dicatat ke `audit_logs` (M09): approval/reject/suspend akun agen (siapa staf pelaku, kapan, keputusan apa, alasan jika reject). **Not Defined** secara eksplisit apakah **setiap login** juga tercatat di `audit_logs` atau cukup `users.last_login_at` — dokumen sumber hanya menyebut `last_login_at` sebagai field, tidak menyatakan login sebagai event audit — Open Issue Bagian 46.

---

# 31. Audit Trail

M01 adalah sumber entri audit untuk aksi approval/reject/suspend (via M09). Tidak memiliki halaman viewer sendiri (kepemilikan M09, Bagian 4 Out of Scope — **catatan:** M01 tidak menyebut Audit Trail viewer di scope-nya sendiri sama sekali di dokumen sumber, berbeda dari M10 yang eksplisit REQ-M10-007; keterkaitan M01↔`audit_logs` disimpulkan dari alur approval, bukan requirement eksplisit bernomor REQ-M01-XXX).

---

# 32. External Integration

| Layanan | Fungsi | ADR |
|---|---|---|
| Supabase Auth | Registrasi, login password, OTP, sesi | ADR-002 |
| Google OAuth2 | Login/registrasi via Google Sign-In (server-side verifikasi `id_token`) | ADR-002 |
| Resend + React Email | Pengiriman OTP email, link reset password (via M08) | ADR-007 |
| **Apple Sign-In** | **Not Defined/tidak ada ADR** — disebut PRD/Functional Spec/User Flow, tidak ada di API Spec/ADR | Open Issue, Bagian 51 Konflik #1 |

---

# 33. AI Capability

**Tidak ada.** M01 tidak memiliki kapabilitas AI.

---

# 34. Performance Requirement

| Aspek | Target | Sumber |
|---|---|---|
| Rate limit endpoint sensitif | 5 req/menit/IP+identifier | API Spec §0.5 |
| OTP cooldown | 60 detik | Functional Spec §4.1 |
| Response time registrasi/login | **Not Defined** | Open Issue |
| Waktu approval (SLA operasional Admin) | **Not Defined** — User Flow hanya menyebut "Status Akun Pending" dengan "estimasi waktu proses" tanpa angka pasti | Open Issue |

---

# 35. Security Requirement

1. Password **tidak pernah** disimpan plain text — `password_hash`, dikelola Supabase Auth (kolom `password_hash` di skema aplikasi disiapkan untuk kompatibilitas, bukan sumber kebenaran hashing itu sendiri, migration `0003` komentar eksplisit).
2. Dokumen legalitas (`file_url`) wajib enkripsi at-rest (`encrypted=true` default) — PROJECT-CONSTITUTION §10 poin 1.
3. `id_token` Google **wajib diverifikasi server-side**, tidak pernah dipercaya dari client tanpa validasi ulang (API Spec §1.1).
4. Pesan error login **generik** ("Email/password salah") — mencegah enumerasi akun (Functional Spec §4.1, prinsip keamanan umum).
5. Signed URL berumur pendek untuk akses dokumen privat saat proses review (PROJECT-CONSTITUTION §10 poin 4) — dipakai lintas M01/M09.
6. Trigger `prevent_last_superadmin_removal` adalah lapisan pertahanan **database-level**, tambahan di atas validasi aplikasi (defense in depth).
7. Rate limiting ketat (5/menit) khusus mencegah brute-force di endpoint login/OTP/register/forgot-password.

---

# 36. Accessibility Requirement

**Not Defined secara M01-spesifik** di UI Specification. Prinsip umum lintas modul berlaku (label form jelas Bahasa Indonesia) — form OTP "6 kotak input digit terpisah" berpotensi menjadi titik perhatian aksesibilitas (navigasi keyboard antar kotak, screen reader announcement per digit) namun tidak ada mitigasi terdokumentasi — Open Issue Bagian 46.

---

# 37. Responsive Requirement

**Not Defined secara M01-spesifik** — SCR-M01-01/04 memakai Template D (mini-wizard), SCR-M01-02/03/05 "form sederhana tanpa template khusus". UI Spec tidak merinci breakpoint/behavior mobile eksplisit untuk layar-layar ini (di luar prinsip Mobile-First umum, AI Context Pack §8) — Open Issue.

---

# 38. SEO Impact (Jika relevan)

**Tidak relevan langsung** — halaman `/register`, `/login`, `/verify-otp`, `/onboarding/*` adalah halaman fungsional privat/transaksional, bukan konten publik yang ditargetkan SEO (SEO Spec §1.1 hanya mendaftar Homepage/Search/Detail Listing/Profil Agen/Detail Proyek sebagai wajib SSR/SSG untuk SEO). Rendering strategy untuk layar M01 **tidak eksplisit dikategorikan** di SEO Spec §1.1 — kemungkinan CSR standar seperti Dashboard, namun **Not Defined** eksplisit — Open Issue.

---

# 39. Configuration

**Tidak ada `system_configs` khusus M01** yang terdaftar secara eksplisit di dokumen sumber (berbeda dari M07 `dbr_config`). Parameter seperti panjang OTP, masa berlaku OTP, cooldown resend — **Not Defined** apakah hard-coded atau configurable — Open Issue Bagian 46 (bertentangan berpotensi dengan prinsip umum "Konfigurasi di atas Hard-code", AI Context Pack §7 poin 6).

---

# 40. Environment Variable

| Variable | Kebutuhan | Sumber |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Koneksi Supabase Auth/DB (global, bukan khusus M01) | PROJECT-CONSTITUTION §17 (umum) |
| Google OAuth Client ID/Secret | Verifikasi `id_token` server-side | Implisit dari ADR-002, **nama variable persis Not Defined** di dokumen sumber |
| Resend API Key | Pengiriman OTP/reset password email | ADR-007, dikonsumsi via M08 |

---

# 41. Feature Flag

**Tidak ada feature flag formal terdefinisi.** REQ-M01-007 (Role & level agen) berpotensi menjadi kandidat flag di Fase 2, namun Out of Scope dokumen ini (Bagian 4).

---

# 42. Acceptance Criteria

Dari PRD Modul 1:

- [ ] Agen baru dapat submit form registrasi lengkap dengan validasi field wajib.
- [ ] Sistem mengirim email/SMS OTP dan konfirmasi status ke agen.
- [ ] Admin dapat approve/reject dengan alasan penolakan.

*(Catatan: PRD Modul 1 memiliki Acceptance Criteria paling ringkas dibanding modul lain yang diperiksa sejauh ini — hanya 3 butir, dibanding mis. 8 butir di PRD Modul 10 — dicatat apa adanya, bukan ditambah asumsi baru sesuai larangan tugas ini.)*

---

# 43. QA Test Scenario

| # | Skenario | Hasil Diharapkan |
|---|---|---|
| 1 | Registrasi dengan email yang sudah terdaftar | 409, pesan inline + link Login |
| 2 | Registrasi role `agent`, OTP benar, lengkapi KTP, submit | Status → `pending_review`, notifikasi ke Admin terkirim |
| 3 | Registrasi role `buyer`, verifikasi OTP | Status langsung `active`, tanpa perlu upload dokumen |
| 4 | Login dengan status `suspended` | Pesan khusus ditangguhkan + kontak support, bukan redirect dashboard |
| 5 | Login Google dengan email yang sudah terdaftar sebagai password-based | Link akun (bukan buat user duplikat) — API Spec §1.1 |
| 6 | Admin reject dokumen tanpa mengisi alasan | 400, validasi field wajib |
| 7 | Percobaan suspend Superadmin terakhir yang aktif | Ditolak oleh trigger DB — **verifikasi bentuk response ke client** (Open Issue Bagian 28) |
| 8 | 6 percobaan login gagal dalam 1 menit dari IP yang sama | Percobaan ke-6 → 429 |

---

# 44. Edge Case

1. ~~Bootstrap akun Superadmin pertama — Not Defined~~ **✅ Resolved [2026-08-06], OD-18 Opsi B** — mekanisme dipilih: script/CLI `scripts/seed-superadmin.ts` (Node.js + Supabase Admin API), dijalankan sekali saat Sprint S0 dengan parameter `--email --name --password`, baca kredensial dari input eksekusi/env var (tidak pernah dihardcode/commit). Detail lengkap: `scripts/README-seed-superadmin.md`.
2. User mendaftar dengan email, lalu mencoba OAuth Google dengan email yang sama sebelum verifikasi OTP awal selesai — urutan race condition **Not Defined**.
3. Dokumen diupload, Admin reject, agen re-upload dokumen baru — apakah dokumen lama dihapus/diarsipkan atau menumpuk sebagai riwayat? **Not Defined** (ERD tidak menyebut versioning dokumen).
4. User logout-all saat sesi lain sedang aktif submit form panjang (mis. listing) — potensi race condition token invalidation, **Not Defined** penanganannya.

---

# 45. Risk Analysis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Bootstrap Superadmin pertama tidak terdokumentasi | **Blocker operasional Sprint S0** — tanpa Superadmin, tidak ada yang bisa approve agen pertama sekalipun | **✅ Resolved [2026-08-06], OD-18 Opsi B** — mekanisme dipilih: script/CLI `scripts/seed-superadmin.ts` (Node.js + Supabase Admin API), dijalankan sekali saat Sprint S0 dengan parameter `--email --name --password`, baca kredensial dari input eksekusi/env var (tidak pernah dihardcode/commit). Detail lengkap: `scripts/README-seed-superadmin.md`. |
| Kesalahan verifikasi `id_token` Google (trust client tanpa validasi server) | Celah keamanan serius — akun palsu/impersonasi | Wajib unit test eksplisit untuk alur verifikasi server-side (Bagian 35 poin 3) |
| SSO Apple diimplementasikan tergesa tanpa spesifikasi teknis jelas | Rework — tidak ada ADR/API contract, berisiko inkonsisten dengan pola Google | **✅ Closed [2026-08-06], T4-06 Opsi B** — ditandai eksplisit "belum diimplementasikan" di dokumen sumber, tidak diimplementasikan sekarang. Risiko hilang — status resmi sekarang "belum diimplementasikan", tidak akan dikerjakan tanpa spesifikasi teknis baru terlebih dahulu |
| Response error trigger database (`RAISE EXCEPTION`) tidak ditangani rapi di API layer | User menerima error 500 generik, bukan pesan informatif (bertentangan REQ-M10-010 "Akses Ditolak informatif") | Wajib wrapping try-catch di service layer untuk menerjemahkan exception trigger jadi response terstruktur |

---

# 46. Known Limitation

1. ~~SSO Apple disebut di 3 dokumen tapi tidak ada implementasi teknis~~ — **✅ Closed [2026-08-06], T4-06 Opsi B** — ditandai eksplisit "belum diimplementasikan" di dokumen sumber, tidak diimplementasikan sekarang.
2. ~~Bootstrap akun Superadmin pertama tidak terdokumentasi~~ **✅ Resolved [2026-08-06], OD-18 Opsi B** — mekanisme dipilih: script/CLI `scripts/seed-superadmin.ts` (Node.js + Supabase Admin API), dijalankan sekali saat Sprint S0 dengan parameter `--email --name --password`, baca kredensial dari input eksekusi/env var (tidak pernah dihardcode/commit). Detail lengkap: `scripts/README-seed-superadmin.md`.
3. **Kode error spesifik M01** belum terdaftar resmi di API Specification.
4. **Status "Verified" sebagai state terpisah** disebut di PRD/Functional Spec/User Flow, namun skema database (`users.status`) hanya mengenal 4 nilai (`pending_review`/`active`/`suspended`/`rejected`) — tidak ada nilai `verified` (lihat Bagian 51 Konflik #2).
5. **Parameter OTP** (panjang, masa berlaku) tidak eksplisit configurable di `system_configs` manapun yang terdokumentasi.
6. **Soft-delete `agent_verification_documents`** tidak eksplisit didefinisikan (termasuk/tidak dalam 8 tabel wajib soft-delete).

---

# 47. Dependency Checklist

| Item | Status |
|---|---|
| MDM: M01 hanya bergantung M10 | ✅ Terpenuhi — M10 sudah direncanakan lebih dulu (MP-10, urutan #1) |
| MIS: M01 urutan #2, Batch 1 | ✅ Konsisten |
| ADR-002 (Auth Strategy) Approved | ✅ |
| ADR-003 (RBAC — penerbitan role) Approved | ✅ |
| Migration `0001`, `0002` (prasyarat `0003`) sudah ditulis | ✅ |
| ERD v1.3 §2.1-2.2 Baseline | ✅ |
| Entity Mapping v1.0 Baseline | ✅ |
| Authorization Spec v1.0 §2.2 Baseline | ✅ |

**Kesimpulan:** Dependency M10 terpenuhi sepenuhnya (dokumen & migration). Tidak ada dependency modul lain yang belum tersedia.

---

# 48. Definition of Ready

- [x] PRD Modul 1 Baseline (v1.2).
- [x] ERD §2.1-2.2 Baseline (v1.3).
- [x] Migration `0001`-`0003` tertulis.
- [x] ADR-002, ADR-003 Approved.
- [x] **Keputusan bootstrap Superadmin pertama** — **✅ Resolved [2026-08-06], OD-18 Opsi B** — mekanisme dipilih: script/CLI `scripts/seed-superadmin.ts` (Node.js + Supabase Admin API), dijalankan sekali saat Sprint S0 dengan parameter `--email --name --password`, baca kredensial dari input eksekusi/env var (tidak pernah dihardcode/commit). Detail lengkap: `scripts/README-seed-superadmin.md`.
- [x] **Keputusan status SSO Apple** — **✅ Closed [2026-08-06], T4-06 Opsi B** — ditandai eksplisit "belum diimplementasikan" di dokumen sumber, tidak diimplementasikan sekarang. (dipertahankan berlabel belum diimplementasikan, bukan di-drop).
- [x] **Klarifikasi status "Verified"** vs skema 4-nilai — **✅ Diperbaiki [2026-08-06], audit v1.1/T4-07** — istilah "Verified" disinkronkan menjadi "Active" di 9 lokasi PRD + 1 lokasi User Flow.

---

# 49. Definition of Done

- [ ] Seluruh Acceptance Criteria (Bagian 42) terverifikasi.
- [ ] Migration `0001`-`0003` dieksekusi sukses, RLS & trigger `prevent_last_superadmin_removal` terverifikasi via test.
- [ ] Middleware `auth.middleware` dapat dikonsumsi 11 modul lain dengan kontrak stabil.
- [ ] Unit test: alur registrasi, OTP, login password+Google, guard Superadmin terakhir.
- [ ] E2E test: alur registrasi→approval→login penuh (Playwright).
- [ ] Dokumentasi ERD/API Spec disinkronkan bila ada penyesuaian implementasi (mis. resolusi status "Verified").
- [ ] PR lolos CI gate.
- [ ] `CURRENT-PROJECT-STATE.md` diperbarui.

---

# 50. Traceability Matrix

| REQ-XXX | ENT-XXX | Endpoint | PERM-XXX | ADR |
|---|---|---|---|---|
| REQ-M01-001 | `ENT-M01-User` | `POST /auth/register`, `/verify-otp`, `/resend-otp` | `PERM-M01-Create-User` | ADR-002 |
| REQ-M01-002 | `ENT-M01-User` | `POST /auth/login`, `/oauth/google`, `/refresh` | — | ADR-002 |
| REQ-M01-003 | `ENT-M01-AgentVerificationDocument` | `POST /users/verification-documents` | `PERM-M01-Create-AgentVerificationDocument` | — |
| REQ-M01-004 | `ENT-M01-User` (`status`) | Cross-cutting | `PERM-M01-Update-User` | — |
| REQ-M01-005 | `ENT-M01-User`, `ENT-M01-AgentVerificationDocument` | `GET/PUT /admin/agents/*` | `PERM-M01-Approve-User`, `PERM-M01-Approve-AgentVerificationDocument` | — |
| REQ-M01-006 | `ENT-M01-User` | `POST /auth/logout(-all)`, `/forgot-password`, `/reset-password` | — | ADR-002 |
| REQ-M01-008 | `ENT-M01-AgentVerificationDocument` (`encrypted`) | — | — | — |

---

# 51. Conflict Analysis

| # | Konflik/Ambiguitas | Dokumen Terlibat | Resolusi (berdasar prioritas dokumen) |
|---|---|---|---|
| 1 | PRD Modul 1 (REQ-M01-002), Functional Spec §4.1, dan User Flow Modul 1 seluruhnya menyebut **"SSO Google/Apple"**, namun API Specification §1.1 **hanya** mendefinisikan `POST /auth/oauth/google` — tidak ada endpoint/kontrak Apple Sign-In, dan tidak ada ADR yang membahas Apple (hanya ADR-002 untuk Google/password). | PRD v1.2, Functional Spec v1.0, User Flow v1.2 vs API Spec v1.2, ADR-002 | **Mengikuti API Specification + ADR** (prioritas #8 dokumen ini, dan merupakan kontrak teknis konkret vs PRD yang bersifat naratif) — Apple Sign-In **tidak diimplementasikan** pada cakupan dokumen ini (Bagian 4 Out of Scope), sampai ada API contract/ADR eksplisit. Direkomendasikan PRD/Functional Spec/User Flow direvisi editorial pada siklus berikutnya untuk menghapus/menandai Apple sebagai belum-diimplementasikan. |
| 2 | PRD, Functional Spec, dan User Flow konsisten menyebut status akun mencakup **"Verified"** sebagai tahap terpisah (`Pending Review → Verified → Active/Suspended`), User Flow bahkan menyebut status pra-registrasi "Menunggu Kelengkapan Data" — namun `ERD v1.3 §2.1` dan **migration `0003` (CHECK constraint aktual)** hanya mengenal **4 nilai**: `pending_review`, `active`, `suspended`, `rejected`. Tidak ada nilai `verified` atau state "menunggu kelengkapan data" di level skema. | PRD v1.2, Functional Spec v1.0, User Flow v1.2 vs ERD v1.3, migration `0003` (Database Schema, prioritas #7 — lebih tinggi dari PRD #12) | **Mengikuti ERD/migration** (prioritas lebih tinggi) — secara operasional, "Verified" dan "Active" diperlakukan sebagai **satu status yang sama** (`active`) di level implementasi; "Menunggu Kelengkapan Data" adalah **state UI transient sebelum baris `users` lengkap tersimpan**. **✅ Diperbaiki [2026-08-06], audit v1.1/T4-07** — istilah "Verified" disinkronkan menjadi "Active" di 9 lokasi PRD + 1 lokasi User Flow. |
| 3 | `Authorization-Access-Control-Specification-v1.0.md` §2.2 mencantumkan kolom Agent = `own` untuk **`PERM-M01-Approve-User`**, yang secara harfiah berarti agen dapat approve dirinya sendiri — bertentangan dengan Business Rule PRD Modul 1 ("Approval dilakukan Superadmin/Admin/Manager... Agen hanya dapat mengajukan"). | Authorization Spec v1.0 §2.2 vs PRD v1.2 Business Rules | **Mengikuti PRD** (Business Rule eksplisit dan lebih spesifik secara naratif) — kolom Agent=`own` pada baris `Approve` di Authorization Spec dianggap **artefak generalisasi tabel** (pola default yang diterapkan seragam ke seluruh baris tanpa pengecualian kasus per-aksi), bukan keputusan bisnis yang disengaja. Endpoint `PUT /admin/agents/{id}/approve` di API Spec §1.2 sudah benar membatasi Auth ke "Superadmin, Manager, Admin" saja (tidak mencantumkan Agen) — kontrak API ini yang dipakai sebagai kebenaran operasional. **Status: ✅ Closed [2026-08-06], audit v1.1/T4-02** — `Authorization-Access-Control-Specification-v1.1.md` §2.2 dikoreksi (Approve-User dan Assign-User, Agent: own→none). |
| 4 | Tidak ditemukan konflik antara MDM dan MIS terkait posisi M01 — keduanya konsisten (Foundation, urutan #2, hanya bergantung M10). | — | Tidak ada resolusi diperlukan. |

---

# 52. Recommendation

1. **Selesaikan Open Issue kritis sebelum eksekusi Sprint S0**: (a) ~~mekanisme bootstrap akun Superadmin pertama~~ — ✅ Resolved [2026-08-06], OD-18 Opsi B, lihat Bagian 44/46/48; (b) ~~keputusan resmi status SSO Apple~~ — **✅ Closed [2026-08-06], T4-06 Opsi B** — Owner memilih pertahankan referensi, ditandai eksplisit "belum diimplementasikan / roadmap masa depan" di PRD REQ-M01-002, Functional Spec §M01, User Flow Modul 1.
2. **Jangan menambah nilai enum `verified` ke `users.status`** tanpa perubahan skema yang disetujui eksplisit — gunakan pemahaman operasional "Verified = Active" sesuai resolusi Konflik #2 di atas untuk implementasi saat ini.
3. **Definisikan kode error spesifik M01** (khususnya untuk skenario suspend Superadmin terakhir yang saat ini hanya menghasilkan exception database mentah) sebelum implementasi endpoint terkait — risiko UX buruk jika dibiarkan (Bagian 28, 45).
4. **Prioritaskan test keamanan untuk verifikasi `id_token` Google server-side** sebagai salah satu test wajib sebelum modul dianggap selesai — celah di sini berdampak sistemik ke identitas seluruh platform.
5. **✅ Diperbaiki [2026-08-06], audit v1.1/T4-07** — istilah "Verified" disinkronkan menjadi "Active" di 9 lokasi PRD + 1 lokasi User Flow. Authorization Spec §2.2 (Konflik #3) — **✅ Closed**, lihat poin di atas. SSO Apple — **✅ Closed [2026-08-06], T4-06 Opsi B** — Owner memilih pertahankan referensi, ditandai eksplisit "belum diimplementasikan / roadmap masa depan" di PRD REQ-M01-002, Functional Spec §M01, User Flow Modul 1.
6. **Setelah M01 selesai**, lanjutkan ke M09 (Admin Panel — kerangka dasar) sesuai MIS Bagian 3 urutan #3, yang juga berada di Batch 1 bersama M01.

---

*Module Planning ini disusun murni berdasarkan dokumen yang diupload — tidak ada requirement yang diubah/ditambah/dihapus, tidak ada perubahan arsitektur/API/skema database. Seluruh item bertanda "Not Defined"/Open Issue dicatat apa adanya sesuai kondisi dokumen sumber.*
