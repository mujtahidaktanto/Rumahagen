# TECHNICAL SPECIFICATION
## Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru — Konsolidasi)
**Tanggal:** 5 Agustus 2026
**Status:** ✅ Baseline (BERLAKU) — naik dari Draft, 5 Agustus 2026, disahkan Owner (Mujtahid Aktanto)
**Riwayat Versi:** v1.0 Draft (5 Agustus 2026, menunggu pengesahan) → v1.0 Baseline (5 Agustus 2026, disahkan Owner). Tidak ada perubahan konten antara kedua status ini — murni transisi lifecycle dokumen.
**Owner:** Principal Software Architect / Technical Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted)
**Dokumen sumber dikonsolidasi:** `SYSTEM-ARCHITECTURE.md` v1.6, `technology-decisions.md` v1.6, `API-Specification-...v1.2.md`, `ERD-Skema-Database-...v1.3.md`, `Entity-Mapping-...v1.0.md`, `Authorization-Access-Control-Specification-v1.0.md`, `dependency-manifest.md` v1.6

> **Dasar penyusunan:** Dokumen ini **belum pernah ada sebelumnya** — dikonfirmasi lewat `foundation-validation-report.md` §17-18 (status **Ready with Notes** → **Ready**, "bahan baku lengkap tersebar di 4+ dokumen berbeda, perlu konsolidasi + penyelesaian H1 [arsitektur backend]"). H1 (arsitektur backend) sudah selesai sejak `ADR-001` (27 Juli 2026). Dokumen ini murni **konsolidasi** — tidak ada keputusan arsitektur baru yang dibuat di sini; setiap klaim dirujuk balik ke ADR/dokumen sumber otoritatifnya.

> **Blocker yang kini terselesaikan:** `SYSTEM-ARCHITECTURE.md` §5.12–5.13 mencatat eksplisit bahwa kode Modul 12/13 **"belum boleh ditulis sampai paket sinkronisasi PRD/ERD/API Spec/User Flow dieksekusi"** (`PROJECT-CONSTITUTION.md` §24 poin 10). Paket tersebut **sudah dieksekusi** (siklus Engineering Alignment 5 Agustus 2026 — lihat `CHANGELOG.md` rilis `0.3.0`) — sehingga Modul 12/13 kini **eligible untuk implementasi**, dicatat eksplisit di Bagian 5.12–5.13 dokumen ini.

> **Posisi dokumen ini:** Functional Specification menjawab **layar mana melakukan apa**; UI Specification menjawab **tampilannya seperti apa**; dokumen ini menjawab **bagaimana membangunnya secara teknis** — arsitektur, data, API, dan otorisasi per modul, disatukan dari 6 dokumen sumber menjadi satu referensi siap pakai tim implementasi, sesuai `foundation-validation-report.md` Bagian 16 langkah 8.

---

## 1. Ringkasan Stack Teknologi

> Tabel ini **mereferensikan**, bukan menggantikan, `technology-decisions.md` Bagian 3 (Official Technology Stack) — satu-satunya sumber otoritatif jika terjadi perbedaan.

| Layer | Teknologi | ADR |
|---|---|---|
| Frontend | Next.js (App Router), TypeScript | ADR-021 |
| UI/CSS | shadcn/ui, Tailwind CSS, Lucide React | ADR-021 |
| Backend/API | Next.js Route Handlers (BFF tipis) + Supabase, **tanpa service Node terpisah** | **ADR-001** |
| Database | PostgreSQL (Supabase) | — |
| Auth/Authorization | Supabase Auth + Supabase RLS + RBAC kustom aplikasi | ADR-002, ADR-003, ADR-024 |
| Storage | Supabase Storage | — |
| Hosting/Deploy | Vercel, GitHub → Vercel | ADR-010 |
| Server/UI State | TanStack Query / Zustand | — |
| Forms/Validation | React Hook Form / Zod | — |
| Search Engine | PostgreSQL FTS + `pg_trgm` (Fase 1) → Typesense (Fase 2, terjadwal) | **ADR-005** |
| Job Queue/Scheduler | Vercel Cron Jobs + Postgres Trigger/Webhook (Fase 1) → QStash (Fase 2) | **ADR-006** |
| Maps/Geocoding | Leaflet + OpenStreetMap + LocationIQ (primary) + Geoapify (failover) | **ADR-008 v3** |
| Rate Limiting/Cache | Native Postgres `rate_limit_log` (Fase 1) → Upstash Redis (Fase 2) | **ADR-018** |

**Prinsip arsitektur kunci:** seluruh endpoint `API-Specification-...v1.2.md` diimplementasikan di `app/api/v1/**/route.ts` dalam **satu aplikasi** (`apps/web`) — dilarang menambah service backend terpisah tanpa ADR baru yang men-*supersede* `ADR-001`.

---

## 2. Cross-Cutting Concerns (Berlaku Lintas Modul)

### 2.1 Autentikasi & Sesi
Supabase Auth (email/password + OTP, OAuth Google) menerbitkan JWT; `role_id` dilekatkan ke sesi saat registrasi (ADR-002/ADR-003). Refresh token & logout single/all-device via `POST /auth/refresh`, `/auth/logout(-all)`.

### 2.2 Otorisasi (RBAC + Organization-Scoped)
**Dua lapis independen** (Authorization Spec v1.0 §1, `ADR-027`):
1. **RBAC platform** (`ADR-003`/`ADR-024`) — middleware resolusi `role_permissions.granted_scope` (`all`/`own`/`none`) per Entity×Action. Superadmin bypass aplikasi (bukan baris tabel khusus). Hierarki edit permission: Superadmin→semua role, Manager→hanya role Agen, Admin→tidak bisa ubah permission siapa pun (Authorization Spec §1.2).
2. **Organization-scoped** (`ADR-027`, khusus M12) — lapisan kedua **setelah** RBAC platform lolos, mengatur akses Leader (CRUD penuh listing Organization) vs Member (CRUD milik sendiri + read-only anggota lain). Tidak mengamandemen RBAC platform.

Middleware wajib menambahkan filter `WHERE agent_id = :current_user_id` saat `granted_scope='own'` (ERD v1.3 §4 poin 6) — hard rule kode, bukan konfigurasi.

### 2.3 Rate Limiting
Native Postgres `rate_limit_log` (sliding window) — 60 req/menit/IP publik, 300 req/menit/user autentikasi, 5 req/menit untuk endpoint sensitif (login/register/OTP/forgot-password). Lihat API Spec v1.2 §0.5.

### 2.4 Job Terjadwal & Event-Driven
- **Terjadwal** (Vercel Cron → `app/api/cron/**`): reminder event H-1 (M05), scan listing stale >90 hari (M03), reminder prospek DBR (M07).
- **Event-driven** (Postgres Trigger/Database Webhook): counter sync (`listings.cta_click_count`), regenerasi sitemap saat listing `published` (M11).

### 2.5 Enkripsi Data Sensitif
Wajib at-rest & akses terbatas pemilik+admin: `agent_verification_documents.file_url`, seluruh field finansial `dbr_simulations` (`net_income`, `existing_installments`), `agent_ai_connections.encrypted_api_key` — pola enkripsi identik lintas ketiganya (ERD v1.3 §4 poin 1; Authorization Spec §2.15 poin 5 khusus M13: **tanpa bypass Superadmin** untuk isi koneksi AI, berbeda dari pola bypass umum).

### 2.6 Maps & Search (implementasi)
Maps: lapisan abstraksi `MapsProvider` interface (geocode/reverseGeocode) — LocationIQ primary, Geoapify failover, caching `geocode_cache` (TTL 90 hari) sebelum memanggil provider eksternal. Search: index GIN/trigram langsung di `listings`, tanpa infrastruktur tambahan Fase 1.

---
## 3. Technical Brief per Modul

Format: **Purpose** · **Dependencies** · **Entities (ERD v1.3)** · **API Endpoints Kunci** (API Spec v1.2) · **Permission Highlights** (Authorization Spec v1.0) · **ADR Terkait** · **Catatan Implementasi**.

### M01 — Registrasi & Autentikasi
- **Purpose:** Identitas seluruh jenis akun & sesi login.
- **Dependencies:** RBAC (penerbitan `role_id`).
- **Entities:** `ENT-M01-User` (`users`), `ENT-M01-AgentVerificationDocument` (`agent_verification_documents`).
- **API Kunci:** `POST /auth/register`, `/auth/verify-otp`, `/auth/login`, `/auth/oauth/google`, `/auth/refresh`, `/auth/logout(-all)`, `/auth/forgot-password`, `/users/verification-documents`.
- **Permission:** `PERM-M01-Approve-User` (Superadmin/Manager/Admin, `all`); Agen hanya `own` untuk data sendiri.
- **ADR:** ADR-002 (Auth Strategy), ADR-003 (RBAC — penerbitan role).
- **Catatan:** dokumen KTP/NPWP terenkripsi (§2.5). Status akun `pending_review→verified→active/suspended` — agen tidak bisa posting listing sebelum `verified`.

### M02 — Profil Agen
- **Purpose:** Kartu nama digital publik/privat agen.
- **Dependencies:** M01 (identitas), M04 (badge), M03 (statistik).
- **Entities:** `ENT-M02-AgentProfile`, `ENT-M02-AgentReview`.
- **API Kunci:** `GET/PUT /users/profile`, `GET /agents/{id}`, `POST /agents/{id}/reviews`, `PUT /admin/agent-reviews/{id}/approve`.
- **Permission:** Agen `own` untuk profil sendiri; Buyer hanya `Create` review (butuh bukti `ENT-M03-ListingLead`); moderasi review Admin/Manager/Superadmin `all`.
- **Catatan:** field sensitif (nama, no. lisensi) butuh approval Admin sebelum berubah — bukan langsung tersimpan.

### M03 — Manajemen Listing Properti
- **Purpose:** Inti transaksi — CRUD listing & pencarian publik.
- **Dependencies:** M01, M02 (WA default), Referensi Wilayah, M06 (listing Primary), M10 (moderasi), **M12 (v1.3, kepemilikan ganda personal/organization)**.
- **Entities:** `ENT-M03-Listing` (+kolom baru `organization_id`/`listing_context`, ERD v1.3), `ListingPhoto`, `ListingVideo`, `Amenity`, `ListingAmenity`, `ListingPriceHistory`, `ListingLead`, `ListingView`, `RefProvince/City/District/Village`.
- **API Kunci:** `POST/GET/PUT /listings`, `POST /listings/{id}/media`, `GET /properties/search`, `GET /properties/autocomplete`, `POST /listings/{id}/cta-click`, `PUT /admin/listings/{id}/approve`.
- **Permission:** Agen `own` (CRUD listing sendiri); Superadmin/Manager/Admin `all` (moderasi); Guest/Buyer `View` publik saja.
- **ADR:** ADR-005 (Search — Postgres FTS+pg_trgm menjalankan langsung `/properties/search`), ADR-008 (Maps — form lokasi & pin listing).
- **Catatan:** field lokasi wajib dari `RefProvince/City/District` (cascading, bukan freetext); minimal 3 foto sebelum submit review; lifecycle `draft→pending_review→published→sold/rented/expired/rejected`.

### M04 — Learning Center
- **Purpose:** Portal edukasi & sertifikasi gratis agen.
- **Dependencies:** M01 (Agen/Instructor), M02 (badge), M05 (kelas live opsional).
- **Entities:** `ENT-M04-Course`, `CourseLesson`, `Quiz`, `QuizQuestion`, `QuizOption`, `Enrollment`, `QuizAttempt`, `Certificate`.
- **API Kunci:** CRUD `/admin/courses`, `POST /courses/{id}/enroll`, `POST /courses/{id}/quiz/submit`, `GET /agents/me/certificates`.
- **Permission:** Instructor `own` (kursus miliknya); Admin/Manager/Superadmin `all`; Agen `own` (progress/sertifikat sendiri).
- **Catatan:** self-enroll tanpa approval; sertifikat otomatis terbit begitu passing grade tercapai, disinkron ke Profil Agen sebagai badge (shared kernel, Entity Mapping §2).

### M05 — Kalender Event
- **Purpose:** Event training, launching proyek, open house, gathering.
- **Dependencies:** M01, M04 (kelas live), M06 (event launching proyek).
- **Entities:** `ENT-M05-Event`, `EventRegistration`.
- **API Kunci:** CRUD `/events`, `POST /events/{id}/rsvp`.
- **Permission:** Admin/Manager/Superadmin `all`; Developer Partner `own` (pengajuan event miliknya); Agen `own` (RSVP sendiri).
- **ADR:** ADR-006 (Job Queue — Vercel Cron untuk reminder H-1/H-1 jam).

### M06 — Direktori Kerjasama Developer
- **Purpose:** Katalog proyek developer untuk dipasarkan agen.
- **Dependencies:** Referensi Wilayah (`city_id`), M03 (listing Primary turunan), M10 (CRUD data resmi terbatas Admin+).
- **Entities:** `ENT-M06-DeveloperPartner`, `DeveloperProject`, `DeveloperProjectMedia`, `AgentProjectClaim`.
- **API Kunci:** `GET /developer-projects`, `POST /developer-projects/{id}/claim`, CRUD `/admin/developer-projects`.
- **Permission:** Admin/Manager/Superadmin `all` (CRUD data resmi); Developer Partner `own`; Agen `own` (klaim proyek miliknya).
- **ADR:** ADR-008 (Maps — peta lokasi proyek).
- **Catatan:** `city_id` wajib FK `ref_cities` (bukan freetext) — shared kernel dengan M03, dilarang duplikasi entity wilayah.

### M07 — Sistem Scoring DBR
- **Purpose:** Pre-screening kelayakan KPR sesuai standar DBR/DSR perbankan Indonesia.
- **Dependencies:** M01 (Agen), M03 (opsional auto-fill harga), M09 (parameter `dbr_config`).
- **Entities:** `ENT-M07-DbrSimulation`, `DbrConfig`.
- **API Kunci:** `POST /calculator/dbr`.
- **Permission:** Agen `own` (riwayat simulasi sendiri, data finansial terenkripsi); `dbr_config` hanya Superadmin (`granted_scope=none` untuk Manager/Admin — Authorization Spec §2.7).
- **Catatan kontrak data kritis:** tenor **selalu** `tenor_months` (satuan bulan) — konversi tahun→bulan wajib di client, API tidak menerima satuan tahun.

### M08 — Dashboard & Notifikasi
- **Purpose:** Agregasi lintas modul per role + notifikasi personal. **Tidak menyimpan data sendiri** (kecuali `notifications`).
- **Dependencies:** M03, M04, M05, M07, M10 (cakupan data per role).
- **Entities:** `ENT-M08-Notification`.
- **API Kunci:** `GET /notifications`.
- **Permission:** setiap role `own` untuk notifikasi personal, tanpa bocor lintas-scope; dashboard admin `all` (statistik global).

### M09 — Admin Panel / CMS
- **Purpose:** Pusat operasional — moderasi, konfigurasi, laporan.
- **Dependencies:** RBAC (gating seluruh sub-menu), seluruh modul lain (objek moderasi/konfigurasi).
- **Entities:** `ENT-M09-SystemConfig`, `AuditLog` (+kolom `organization_id` nullable, ERD v1.3).
- **API Kunci:** `PUT /admin/config/dbr`, `/admin/config/system`, `GET /admin/audit-logs`.
- **Permission:** `SystemConfig` hanya Superadmin (`none` untuk Manager/Admin); `AuditLog` Superadmin+Manager `all`, Admin `none`.

### M10 — RBAC
- **Purpose:** Fondasi kontrol akses seluruh sistem — **modul fondasi**, tidak bergantung modul lain.
- **Entities:** `ENT-M10-Role`, `Permission`, `RolePermission`.
- **API Kunci:** `GET /admin/roles`, `GET/PUT /admin/permissions/matrix`.
- **Permission:** Editor penuh Superadmin; Manager terbatas role Agen saja; Admin `none` (read-only Kelola Role, tanpa akses editor).
- **ADR:** ADR-003, ADR-024 (RBAC Role Model Scope).
- **Catatan:** perubahan permission efektif real-time ke seluruh sesi aktif, tercatat `AuditLog`.

### M11 — SEO & Analytics
- **Purpose:** Memastikan seluruh halaman publik terindeks optimal. **Tidak punya layar UI** (Functional Spec §1.1) — murni backend/build-time.
- **Dependencies:** M03, M02, M06 (sumber halaman publik).
- **Entities:** `ENT-M11-UrlRedirect`.
- **API Kunci:** tidak ada endpoint publik terpisah — terintegrasi di response `GET /listings/*`, `/agents/*` (meta tag auto-generate).
- **ADR:** ADR-006 (regenerasi sitemap event-driven via Postgres Trigger), ADR-021 (SSR/SSG rendering).

### M12 — Organization Management System *(baru, kini eligible)*
- **Purpose:** Kolaborasi tim agen — tanpa mengubah model kepemilikan aset listing individual.
- **Dependencies:** M01, M10 (gate RBAC platform lolos dulu — `ADR-027`), M03 (kepemilikan ganda).
- **Entities:** `ENT-M12-Organization`, `OrganizationMember`, `OrganizationInvitation`.
- **API Kunci:** `POST /organizations`, `PUT /organizations/{id}/branding`, `GET /organizations/{id}/dashboard`, `POST /organizations/{id}/invitations`, `/join-requests`, `PUT /organization-invitations/{id}/accept`, `DELETE /organization-members/{id}`.
- **Permission:** Leader `all` (CRUD Organization Listing); Member `own`+`View` (listing anggota lain read-only) — lapisan Organization-scoped, **setelah** RBAC platform.
- **ADR:** ADR-026 (Approved With Notes), ADR-027 (Approved), merevisi status ADR-023.
- **Catatan implementasi krusial:** race-condition guard wajib re-check status Individual **tepat sebelum** commit approve (bukan hanya validasi awal request) — mencegah 2 approval bersamaan dari Organization berbeda (API Spec v1.2 §5A). Tidak ada transfer kepemimpinan — Leader keluar = Organization bubar otomatis.

### M13 — AI Assistant Integration (BYOK) *(baru, kini eligible)*
- **Purpose:** Chat AI dengan API key milik user sendiri, tanpa redirect keluar aplikasi.
- **Dependencies:** M01, M10 (lintas role, **tidak** bergantung M12 — dua inisiatif independen).
- **Entities:** `ENT-M13-AiProvider`, `AgentAiConnection`. **Tidak ada tabel riwayat percakapan.**
- **API Kunci:** `GET /ai-providers`, `POST /ai-connections`, `POST /ai-connections/{id}/test`, `POST /ai-assistant/chat`.
- **Permission:** seluruh role internal `own` untuk koneksi sendiri — **termasuk Superadmin, tanpa bypass** (pengecualian sengaja terhadap pola bypass umum, karena percakapan tidak pernah disimpan — Authorization Spec §2.15 poin 5).
- **ADR:** ADR-028 (Approved With Notes), reuse ADR-017 (enkripsi) & ADR-018 (rate limiting).
- **Catatan implementasi krusial:** API key **tidak pernah** dikirim ke response client setelah tersimpan — proxy chat sepenuhnya server-side.

---
## 4. Struktur Folder (Referensi)

```
apps/web/
  app/
    (public)/              # SSR/SSG — Listing, Profil Agen, Proyek Developer, Event, Organization publik
    (auth)/                # Login, Register, OTP, Reset Password
    (dashboard)/            # CSR — Dashboard Agen, Listing Saya, Kalkulator DBR, Organization, AI Assistant
    (admin)/                # CSR — Moderasi, Kelola Role, Konfigurasi Sistem
    api/v1/                 # Route Handlers — seluruh endpoint API-Specification-...v1.2.md
    api/cron/                # Vercel Cron jobs (reminder, scan stale listing)
  components/
    ui/                      # shadcn/ui primitif — tanpa domain knowledge
    features/{module}/       # Komponen komposit per modul (UI Spec v1.0 §4.2)
  lib/
    validation/               # Skema Zod (satu sumber kebenaran FE+BE)
    seo/                       # Helper meta tag/sitemap (M11)
    maps/                      # MapsProvider abstraction (ADR-008)
  packages/shared-types/      # Tipe TS lintas FE/BE, termasuk entity domain
```

> Struktur ini **mereferensikan** `SYSTEM-ARCHITECTURE.md` Bagian 5 & `development-playbook.md` Bagian 8 — tidak mendefinisikan struktur baru di luar keduanya.

---

## 5. Non-Functional Requirements (Ringkasan Silang-Referensi)

| Kategori | Target | Sumber |
|---|---|---|
| Core Web Vitals | LCP < 2.5s, CLS < 0.1, INP < 200ms, TTFB < 600ms | `SEO-Analytics-Specification` Bagian 5 |
| Rate Limiting | 60/menit publik, 300/menit user, 5/menit endpoint sensitif | API Spec v1.2 §0.5, `ADR-018` |
| Enkripsi at-rest | Dokumen legalitas, data finansial DBR, API key AI Assistant | ERD v1.3 §4 poin 1, `ADR-017` |
| Soft-delete | 8 tabel + `organizations` (baru) — entitas ber-FK/tampil publik | `ADR-046`, ERD v1.3 §2.38 |
| Search latency (Fase 1) | p95 < 500ms, ambang migrasi Typesense jika terlampaui | `ADR-005` |

---

## 6. Traceability & Quality Gate

| Check | Hasil |
|---|---|
| 13/13 modul mendapat brief teknis konsolidasi | ✅ |
| Setiap modul mereferensikan Entity (ERD v1.3), API (API Spec v1.2), Permission (Authorization Spec v1.0) | ✅ |
| Tidak ada keputusan arsitektur baru dibuat di dokumen ini | ✅ — murni konsolidasi + referensi balik ADR |
| Blocker implementasi M12/M13 (`PROJECT-CONSTITUTION.md` §24 poin 10) dicatat sudah resolved | ✅ — dijelaskan eksplisit di header |
| Cross-cutting concerns (auth, RBAC, rate limit, job queue, enkripsi) tidak diulang 13× per modul | ✅ — disentralisasi Bagian 2 |
| Struktur folder konsisten `SYSTEM-ARCHITECTURE.md`/`development-playbook.md` | ✅ |

---

## 7. Langkah Berikutnya

Dengan **Functional Specification v1.0**, **UI Specification v1.0**, dan **Technical Specification v1.0** selesai, ketiga dokumen yang sebelumnya `Planned`/`Not Ready` (`foundation-validation-report.md` §17-18) kini lengkap. Sesuai `foundation-validation-report.md` Bagian 16 langkah 9, **Module Planning** (breakdown task per-sprint, dimulai dari M01/M10 sebagai modul fondasi) dapat dimulai penuh — **tidak ada lagi blocker dokumentasi** untuk Sprint S0 ke atas, termasuk Modul 12/13 yang kini eligible.

---

*Dokumen ini adalah Technical Specification resmi proyek — konsolidasi siap pakai tim implementasi. Perubahan mengikuti lifecycle `document-governance-baseline-register.md` Bab 4 — versi lama tidak dihapus, perubahan dicatat sebagai versi baru.*
