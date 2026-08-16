# AI CONTEXT PACK
## Platform Web RUMAHAGEN

**Versi:** 1.1 (naik dari 1.0 — sinkronisasi penuh ke dokumen sumber terkini: PRD v1.2, ERD v1.3, API Spec v1.2, User Flow v1.2, Entity Mapping v1.0, SYSTEM-ARCHITECTURE v1.6, technology-decisions v1.5, 28 ADR Approved)
**Tanggal:** 6 Agustus 2026
**Fungsi dokumen:** Context tetap (persistent context) untuk seluruh AI Coding Assistant yang bekerja pada proyek ini — Bolt.new, Claude Code, Cursor, GitHub Copilot, ChatGPT, dan sejenisnya. Dokumen ini dirancang untuk **ditempelkan/di-load ulang** di setiap sesi baru agar konsistensi proyek terjaga selama pengembangan berbulan-bulan, tanpa perlu AI membaca ulang seluruh dokumen sumber yang panjang.
**Turunan dari:** `PROJECT-CONSTITUTION.md`, `PRD-RUMAHAGEN-v1.2.md`, `ERD-Skema-Database-RUMAHAGEN-v1.3.md`, `Entity-Mapping-RUMAHAGEN-v1.0.md`, `API-Specification-RUMAHAGEN-v1.2.md`, `User-Flow-RUMAHAGEN-v1.2.md`, `SEO-Analytics-Specification-RUMAHAGEN-v1.1.md`, `SYSTEM-ARCHITECTURE.md` (v1.6), `technology-decisions.md` (v1.5), `architecture-decision-records.md` (28 ADR, seluruhnya Approved/Approved With Notes), `development-playbook.md` (AI Development Blueprint, acuan aktif), `Module-Dependency-Matrix-...v1.0.md`, dan `Module-Implementation-Strategy-...v1.1.md`.
**Catatan penting:** Dokumen ini adalah **ringkasan operasional**, bukan pengganti dokumen sumber. Jika AI butuh detail teknis mendalam (skema field lengkap, endpoint spesifik, alur UI langkah-demi-langkah), tetap rujuk dokumen sumber di `/docs`. Jika terjadi ketidaksesuaian, dokumen sumber yang menang, dengan **ADR Approved sebagai otoritas tertinggi** untuk keputusan arsitektur/teknis (`document-governance-baseline-register.md` Bagian 7 — Source of Truth Matrix) — lihat "Potential Conflict" di bagian akhir untuk sisa area yang masih terbuka.

---

## 1. PROJECT IDENTITY

**Nama Project:** Platform Web RUMAHAGEN (nama brand final: **RUMAHAGEN** — placeholder `RUMAHAGEN` sudah digantikan).

**Tujuan:** Mendigitalisasi operasional agensi properti Indonesia secara end-to-end — mulai dari onboarding & administrasi agen, manajemen listing, edukasi agen, kolaborasi dengan developer properti, kolaborasi tim agen (Organization), asisten AI personal (BYOK), hingga alat bantu pre-screening kelayakan KPR (DBR Scoring) — sambil memastikan seluruh halaman publik terindeks mesin pencari secepat dan seakurat mungkin sejak hari pertama rilis.

**Visi:** Menjadi platform operasional utama bagi agensi properti untuk mengelola seluruh siklus kerja agen (rekrutmen mandiri → sertifikasi → listing → closing) dalam satu sistem, sekaligus menjadi kanal akuisisi lead organik (SEO) untuk agennya.

**Nilai Bisnis:**
- Mempercepat & mendigitalkan proses rekrutmen dan administrasi agen (self-service registration).
- Meningkatkan kualitas closing lewat kualifikasi awal calon pembeli (DBR Scoring) sebelum diajukan ke bank.
- Membuka kanal kolaborasi bisnis baru antara agen dan developer properti (katalog proyek, skema komisi).
- Meningkatkan kapabilitas jual agen lewat Learning Center gratis (sertifikasi internal).
- Membangun aset SEO jangka panjang (listing terindeks, profil agen publik) sebagai sumber lead organik berkelanjutan, bukan hanya bergantung pada iklan berbayar.
- **(Baru v1.2)** Memfasilitasi kolaborasi tim agen lewat Organization (branding bersama, dashboard performa kolektif) tanpa mengubah kepemilikan aset listing individual.
- **(Baru v1.2)** Memberi agen akses ke AI assistant pilihan sendiri (BYOK) langsung di dalam platform, tanpa redirect keluar aplikasi.

---

## 2. BUSINESS DOMAIN

**Jenis Platform:** PropTech / Real Estate Agency SaaS — model **B2B2C**. Platform dipakai secara internal oleh agensi & agennya (B2B side), sekaligus dikonsumsi publik oleh calon pembeli/penyewa properti (B2C side).

**Model Transaksi:** Platform **tidak** memproses transaksi jual-beli properti secara langsung dan **bukan** payment gateway untuk closing properti. Nilai jual utama adalah **lead generation** (klik CTA WhatsApp ke agen) dan **tooling operasional** (Learning Center, DBR Scoring, katalog developer, Organization, AI Assistant). Monetisasi platform (komisi, tier keanggotaan, boost listing berbayar) **belum final** — tidak ada logika pembayaran wajib di MVP; Payment Gateway (Midtrans/Xendit) hanya placeholder endpoint non-breaking untuk fase lanjutan (API Spec §9.3).

**Target Pengguna:**
- Agen properti independen/bernaung kantor yang butuh alat kelola listing & profil profesional, opsional bergabung/membentuk Organization untuk kolaborasi tim.
- Tim internal agensi (Superadmin/Manager/Admin/Instructor) yang mengelola operasional platform.
- Developer properti yang ingin memasarkan proyek lewat jaringan agen.
- Calon pembeli/penyewa properti (Guest maupun Buyer terdaftar) yang mencari listing dan ingin dihubungkan ke agen.

**Masalah yang Diselesaikan:**
1. Proses rekrutmen & verifikasi agen yang masih manual/lambat.
2. Listing properti tersebar tidak terstruktur, sulit ditemukan mesin pencari.
3. Minimnya alat kualifikasi awal calon pembeli KPR sebelum diajukan ke bank (potensi penolakan tinggi di tahap lanjut).
4. Kurangnya kanal edukasi/sertifikasi gratis yang terstandardisasi untuk agen.
5. Kolaborasi agen–developer yang tidak tersentral (data proyek/harga sering tidak sinkron).
6. Reputasi agen (rating/review) belum terverifikasi secara transparan ke publik.
7. **(Baru)** Tim agen (mis. dalam satu brokerage) tidak punya wadah kolaborasi terstruktur di platform — tiap agen bekerja terisolasi meski satu tim.
8. **(Baru)** Agen ingin memakai AI assistant untuk membantu pekerjaan tanpa harus keluar aplikasi atau berbagi API key ke pihak platform (BYOK menjawab kebutuhan privasi/kontrol biaya).

**Yurisdiksi & Kepatuhan:** Indonesia — mengacu UU PDP (Perlindungan Data Pribadi), memakai data wilayah administratif resmi Kemendagri/BPS, standar perhitungan DBR/DSR perbankan Indonesia, mata uang IDR.

---

## 3. USER ROLES

Hierarki role internal (dari tertinggi ke terendah): **Superadmin → Manager → Admin → Instructor → Agen**, ditambah role eksternal (Developer Partner, Buyer), dan pengunjung publik tanpa akun (Guest/Lead).

**(v1.1) Jumlah role final: 7 role berakun** (`superadmin`, `manager`, `admin`, `instructor`, `agent`, `developer_partner`, `buyer`) — **`guest` bukan baris di tabel `roles`** (resolusi OD-02, 4 Agustus 2026). Ini nilai final, jangan dipertanyakan ulang oleh AI.

| Role | Ringkasan |
|---|---|
| **Superadmin** | Akses penuh tanpa batas ke seluruh fitur, termasuk konfigurasi sistem inti & keamanan web. Satu-satunya yang boleh mengubah permission Admin/Manager/Superadmin. Tidak dapat dibatasi/dihapus; minimal 1 akun aktif wajib selalu ada. Selalu bypass pengecekan permission (short-circuit, bukan baris tabel khusus). |
| **Manager** | Seluruh fungsi Admin + akses **global** (semua agen, semua listing, semua wilayah — tanpa pengecualian tim/wilayah, final ADR-024). Berwenang mengubah permission role Agen saja, dan promote/demote Agen ↔ Admin. Tidak dapat menyentuh konfigurasi sistem inti/keamanan atau permission Admin/Manager/Superadmin. |
| **Admin** | Operasional harian: approval agen, moderasi listing, kelola konten Event/Developer, laporan, moderasi review agen. Tidak dapat mengelola akun Admin/Manager/Superadmin lain atau ubah konfigurasi sistem inti. |
| **Instructor** | Role internal terbatas ke Modul Learning Center saja (kelola kursus, bank soal, pantau progress) — setara Admin hanya di lingkup modul tsb. Tidak punya akses moderasi listing/RBAC/konfigurasi sistem. |
| **Agen (Agent)** | Kelola profil & listing **miliknya sendiri**, ikut pelatihan, pakai kalkulator DBR, klaim proyek developer, opsional bergabung/membentuk 1 Organization aktif, koneksi AI Assistant pribadi. Tidak pernah bisa melihat/edit/hapus data milik agen lain — ini hard rule aplikasi, bukan permission yang bisa dilonggarkan. |
| **Developer Partner** | Eksternal, akses terbatas ke portal pengajuan proyek/event miliknya sendiri. Login opsional. Event yang diajukan wajib approval sebelum tayang. |
| **Buyer** | Akun terdaftar ringan (opsional) untuk simpan listing favorit, tracking lead pribadi, dan submit review/rating agen (berstatus `pending` sampai dimoderasi). Bukan prasyarat untuk melihat listing atau menghubungi agen. |
| **Guest/Lead** | Publik tanpa akun — melihat listing publik, klik CTA WhatsApp, submit form inquiry tanpa perlu akun sama sekali. |

**Hard rule lintas role (tidak dapat dilonggarkan oleh konfigurasi permission apa pun):**
- Agen tidak pernah dapat mengedit/menghapus listing atau profil agen lain.
- Superadmin selalu bypass pengecekan permission.
- Sistem wajib mencegah penghapusan/downgrade akun Superadmin terakhir yang aktif.
- Manager hanya boleh mengubah baris permission milik role Agen.
- Setiap perubahan role/permission wajib tercatat di audit log.
- **(Baru)** Otorisasi Organization (Leader/Member) **tidak pernah** menjadi nilai `scope_type` baru di `permissions` — selalu middleware kedua independen (`organization-rbac.middleware`), dievaluasi setelah RBAC platform lolos, tidak mengubah cakupan Manager di atas.
- **(Baru)** AI Assistant (M13): **tidak ada bypass Superadmin** untuk melihat isi koneksi/percakapan AI milik agen lain — pengecualian sengaja dari pola bypass umum karena percakapan tidak pernah disimpan.

---

## 4. CORE MODULES

> **13 modul resmi** (bertambah dari 11 — Modul 12 & 13 ditambahkan penuh di PRD v1.2, berdasarkan ADR-026/027/028 Approved/Approved With Notes).

| Modul | Ringkasan Fungsi | Fase |
|---|---|---|
| **M01 — Authentication** | Registrasi mandiri (email/HP + OTP), login (password/Google OAuth), reset password, manajemen sesi multi-device, upload dokumen legalitas agen, approval manual sebelum agen dapat posting listing. | 1 |
| **M02 — Profil Agen** | Halaman publik & privat sebagai "kartu nama digital" — bio, spesialisasi, area jangkauan, statistik listing terjual/tersewa, badge sertifikasi, review/rating dari Buyer (moderasi wajib, aktif Fase 1), link share publik. | 1 |
| **M03 — Listing** | Inti transaksi platform — CRUD listing per-agen, kategori Primary/Secondary, tujuan Jual/Sewa, form spesifikasi lengkap, CTA WhatsApp, pencarian & filter publik (PostgreSQL FTS + `pg_trgm`), mode List/Peta (Leaflet+OSM+LocationIQ/Geoapify), lifecycle status (`draft` → `pending_review` → `published` → `sold`/`rented`/`expired`), **kepemilikan ganda personal/Organization (v1.2)**. | 1 (dasar), diperluas seiring Fase 2/M12 |
| **M04 — Learning Center** | Katalog kursus gratis, self-enroll, konten video/PDF/kuis, sertifikat digital otomatis setelah lulus, progress tracking, jadwal kelas live. | 3 |
| **M05 — Event** (Kalender Event) | Event training/launching proyek/open house/gathering, RSVP agen, pengajuan event oleh Developer Partner (butuh approval). | 3 |
| **M06 — Developer** (Direktori Kerjasama Developer) | Katalog proyek developer, klaim proyek oleh agen untuk dipasarkan, sinkronisasi harga/unit real-time ke listing turunan. | 2 |
| **M07 — DBR** (Sistem Scoring DBR/KPR) | Kalkulator kelayakan KPR calon pembeli (formula anuitas + rasio DBR, `tenor_months` selalu satuan bulan), simulasi what-if, export PDF, riwayat simulasi per agen, threshold dikonfigurasi Superadmin. | 2 |
| **M08 — Dashboard** | Ringkasan lintas modul per role — agen (listing/lead/progress kursus/DBR miliknya), admin (statistik operasional global). Tidak menyimpan data sendiri (kecuali `notifications`), hanya agregasi. | Lintas fase (sink node — dibangun terakhir) |
| **M09 — Admin CMS** | Manajemen user, moderasi listing & konten, kelola Learning Center, kelola Developer & Proyek, konfigurasi parameter sistem, laporan & analitik. | 1 (dasar) |
| **M10 — RBAC** (Manajemen Role & Hak Akses) | Pusat pengaturan multirole — Permission Matrix Editor (Superadmin), Permission Editor terbatas (Manager, khusus role Agen), Assign Role, audit trail. **Modul fondasi**, tidak bergantung modul lain, wajib bagi semua modul lain. | 1 (dasar) — dibangun **pertama** |
| **M11 — SEO & Analytics** | Strategi rendering SSR/SSG/ISR, slug & structured data, sitemap otomatis (regenerasi event-driven via Postgres Trigger), GTM/GA4, Google Search Console & Indexing API. Fondasi wajib sejak Fase 1, bukan ditambal belakangan. Tidak punya UI sendiri. | 1 (fondasi) |
| **M12 — Organization Management** *(baru v1.2)* | Kolaborasi tim agen — CRUD Organization self-service, invite/join request dua arah, kelola member (Leader/Member), branding, Organization Dashboard, listing berkonteks Organization. | 2-lanjutan (kondisional — lihat catatan gate di bawah) |
| **M13 — AI Assistant (BYOK)** *(baru v1.2)* | Chat AI dengan API key milik agen sendiri (Gemini/Groq/Mistral/GitHub Models, dikurasi Admin), proksi server-side, tanpa riwayat percakapan tersimpan. | 2-lanjutan (kondisional — lihat catatan gate di bawah) |

**Roadmap Fase (PRD v1.2 §6):** Fase 1 (M10, M01, M02, M03-dasar, M09-dasar, M11-fondasi) → Fase 2 (M06, M07) → Fase 3 (M04, M05) → Fase 4 (dashboard analitik lanjutan M08, gamifikasi, integrasi SLIK/BI Checking, payment/komisi otomatis).

**⚠️ Catatan gate M12/M13 (wajib dipatuhi AI):** Kedua modul **Approved secara arsitektur** (ADR-026/027/028) dan skema/API/PRD sudah Baseline, **namun kode belum boleh ditulis** sampai paket sinkronisasi dokumen dieksekusi penuh dan Owner mengonfirmasi gate terbuka via `CURRENT-PROJECT-STATE.md` (`PROJECT-CONSTITUTION.md` §24 poin 10; `development-playbook.md` Golden Rule 39-40). **Jangan mulai implementasi M12/M13 hanya karena statusnya "Baseline" di dokumen.**

**Urutan implementasi resmi:** rujuk `Module-Dependency-Matrix-...v1.0.md` (dependency & critical path) dan `Module-Implementation-Strategy-...v1.1.md` (urutan pembangunan, Go/No-Go per modul) — kedua dokumen ini adalah rujukan urutan modul yang **berlaku** untuk proyek saat ini, menggantikan tabel Development Order versi lama di `development-playbook.md` §23 yang belum sepenuhnya sinkron dengan PRD v1.2 (lihat "Potential Conflict" poin 1).

---

## 5. TECH STACK

> **(v1.1 — perubahan besar)** Stack berikut adalah hasil final **28 ADR, seluruhnya berstatus Approved/Approved With Notes** (`architecture-decision-records.md`) — **tidak ada lagi opsi terbuka/"pilih salah satu"** di layer manapun. Diambil dari `technology-decisions.md` v1.5 Bagian 3 dan `SYSTEM-ARCHITECTURE.md` v1.6 Bagian 4. **Dilarang** menambahkan library/framework/database lain di luar daftar ini tanpa ADR baru yang eksplisit disetujui manusia.

| Layer | Teknologi Final | ADR |
|---|---|---|
| Frontend Framework | **Next.js (App Router)** | ADR-021 |
| Bahasa | **TypeScript** (`strict: true`, tanpa `any` implisit) | ADR-025 |
| Styling | **Tailwind CSS** + **shadcn/ui** | ADR-021 |
| Server State | **TanStack Query** (SWR dilarang eksplisit) | ADR-011 |
| UI State | **Zustand**, satu store per domain (Redux/Redux Toolkit dilarang eksplisit) | ADR-011 |
| Forms | **React Hook Form** (Formik dilarang eksplisit) | ADR-025 |
| Backend/API | **Next.js Route Handlers (BFF tipis)** di dalam `apps/web`, terintegrasi langsung Supabase — **TIDAK ADA** service Node.js terpisah (NestJS/Express dilarang eksplisit, tidak ada `apps/api`) | **ADR-001 (final, tidak lagi opsional)** |
| Database | **PostgreSQL** (via **Supabase**), UUID PK, migration SQL murni bernomor urut | ADR-004, ADR-022 |
| Auth Provider | **Supabase Auth** (email/password, OTP, Google OAuth2), dibungkus JWT internal platform | ADR-002 |
| Authorization | RBAC kustom aplikasi (`granted_scope`) + Supabase RLS, dua lapis | ADR-003 |
| Search Engine | **PostgreSQL Full-Text Search + `pg_trgm`** (Fase 1) → Typesense (Fase 2, migrasi terjadwal berdasarkan ambang: volume listing >±50.000 / p95 latency >500ms / keluhan relevansi ≥3/sprint) | **ADR-005 (final Fase 1)** |
| Cache/Rate Limit | **Tabel `rate_limit_log` di Supabase Postgres**, sliding window (Fase 1) → Upstash Redis (Fase 2, migrasi terjadwal) | **ADR-018 (final Fase 1)** |
| Job Queue/Scheduler | **Vercel Cron Jobs + Postgres Trigger/Database Webhook** (Fase 1) → QStash-Upstash (Fase 2, migrasi terjadwal). **BullMQ/Redis/worker long-running dilarang permanen** — tidak kompatibel model serverless ADR-001. | **ADR-006 (final Fase 1)** |
| Maps/Geocoding | **Leaflet + React-Leaflet** (rendering, client-only) + tiles **OpenStreetMap** (gratis) + **LocationIQ** (Primary Geocoding) + **Geoapify** (Approved Alternative/failover) | **ADR-008 (final Fase 1, revisi v3)** |
| Storage/CDN | **Supabase Storage** — bucket publik (`listing-photos`, `listing-videos`, `developer-project-media`) vs privat (`agent-verification-documents`) terpisah tegas | **ADR-009 (final)** |
| Transactional Email | **Resend + React Email** | ADR-007 |
| Monitoring | **Sentry** (`@sentry/nextjs`) | ADR-015 |
| Logging | Structured logging (JSON) + audit log bisnis terpisah | ADR-014 |
| Testing | **Vitest** (unit), **React Testing Library** (component), **Playwright** (E2E) | ADR-016 |
| Hosting/Repo/CI-CD | **Vercel** + **GitHub** + **GitHub Actions** (lint, type-check, test, migration check) | ADR-010 |
| Validasi Data | **Zod** (`z.infer`, satu sumber skema client & server) | ADR-025 |
| Image Compression | **browser-image-compression** (client-side, sebelum upload) | ADR-019 |
| Charts / Table / D&D / Date / PDF | Recharts / TanStack Table / dnd-kit / date-fns / pdf-lib | technology-decisions §3 |
| AI Provider (M13, BYOK) | **4 provider terkurasi**: Gemini, Groq, Mistral, GitHub Models — tidak boleh ditambah tanpa ADR baru | ADR-028 |
| Toolchain Pengembangan | **Bolt.new** dikonfirmasi bagian toolchain resmi lintas sesi AI Coding Assistant | Catatan ADR-001 |

**Larangan eksplisit (final, technology-decisions.md §6):** Redux/Redux Toolkit, MUI, Ant Design, Formik, SWR, Moment.js, react-beautiful-dnd, CSS-in-JS runtime, Axios, ORM auto-sync untuk production migration, backend service Node.js terpisah, BullMQ/Redis/worker long-running, Google Maps Platform/Mapbox (preventif sebelum ambang migrasi Growth/Scale/Enterprise), provider AI di luar 4 yang dikurasi.

---

## 6. DATABASE SUMMARY

> **(v1.1)** Ringkasan tabel inti & relasi sederhana — **44 entity terdaftar** (`Entity-Mapping-RUMAHAGEN-v1.0.md`, naik dari "37+" di versi dokumen ini sebelumnya). ERD lengkap tidak ditampilkan di sini — rujuk `ERD-Skema-Database-RUMAHAGEN-v1.3.md` untuk detail field, constraint, dan index.

**Tabel Inti (per domain):**

| Domain | Tabel Inti | Relasi Sederhana |
|---|---|---|
| Identitas & RBAC | `users`, `roles`, `permissions`, `role_permissions` | `users.role_id → roles.id`; `role_permissions` menghubungkan `roles` ↔ `permissions`, kolom `granted_scope` (`own`/`all`/`none`) |
| Verifikasi Agen | `agent_verification_documents` | `→ users.id` |
| Profil Agen | `agent_profiles`, `agent_reviews` | `agent_profiles.user_id → users.id` (1:1); `agent_reviews.agent_id/buyer_id → users.id` |
| Listing | `listings`, `listing_photos`, `listing_videos`, `listing_leads`, `listing_price_history`, `listing_views`, `amenities`, `listing_amenities` | Semua anak `→ listings.id`; `listings.agent_id → users.id`; `listings.developer_project_id → developer_projects.id` (nullable); **(v1.3)** `listings.organization_id` (nullable), `listing_origin` (immutable), `listing_context` |
| Wilayah (shared kernel) | `ref_provinces`, `ref_cities`, `ref_districts`, `ref_villages` | Cascading: `ref_cities.province_id → ref_provinces`, dst.; dipakai `listings` & `developer_projects` — **dilarang duplikasi entity wilayah** |
| Developer | `developer_partners`, `developer_projects`, `developer_project_media`, `agent_project_claims` | `developer_projects.developer_id → developer_partners.id`; `.city_id → ref_cities.id`; `agent_project_claims` = pivot agen ↔ proyek |
| Learning Center | `courses`, `course_lessons`, `quizzes`, `quiz_questions`, `quiz_options`, `enrollments`, `quiz_attempts`, `certificates` | `enrollments`/`certificates` = pivot `users` (agen) ↔ `courses` |
| Event | `events`, `event_registrations` | `event_registrations` = pivot `events` ↔ `users` (agen) |
| DBR Scoring | `dbr_simulations`, `dbr_config` | `dbr_simulations.agent_id → users.id`; `.listing_id → listings.id` (nullable); parameter global di `dbr_config`; field finansial terenkripsi |
| Dashboard/Notifikasi | `notifications` | `→ users.id` |
| Admin/Sistem | `system_configs`, `audit_logs` | `audit_logs` **(v1.3)** kolom `organization_id` nullable tambahan |
| SEO | `url_redirects` | `entity_type`/`entity_id` merujuk fleksibel ke `listings`/`developer_projects` |
| **(Baru v1.2) Organization** | `organizations`, `organization_members`, `organization_invitations` | `organization_invitations` menampung 2 arah (`leader_invite`/`agent_request`) dalam satu tabel; UNIQUE index 1 Organization aktif per agen |
| **(Baru v1.2) AI Assistant** | `ai_providers` (referensi), `agent_ai_connections` | UNIQUE index 1 koneksi aktif per user per provider; **tidak ada tabel riwayat percakapan** |
| **Infrastruktur (bukan entity domain)** | `rate_limit_log` (ADR-018), `geocode_cache` + `api_rate_limits` (ADR-008) | Tabel teknis cross-cutting, tidak terdaftar sebagai `ENT-XXX` |

**Prinsip desain data yang wajib diingat AI:**
- PK selalu UUID, bukan auto-increment.
- **(v1.1)** Soft delete (`deleted_at`) wajib untuk **8 tabel**: `listings`, `users`, `developer_projects`, `agent_profiles`, `agent_reviews`, `courses`, `events`, `developer_partners` (diperluas dari 3 tabel awal, resolusi OD-07/ADR-046).
- `agent_id` adalah **ownership boundary** hard-coded, bukan sekadar permission — validasi ulang di layer repository, bahkan jika `granted_scope` salah konfigurasi.
- Field lokasi selalu cascading (`province_id → city_id → district_id`), bukan freetext (kecuali `area_keyword`, maks 20 karakter).
- Counter agregat (`cta_click_count`, dsb.) didenormalisasi via trigger/job (Postgres Trigger/Database Webhook, ADR-006), bukan `COUNT()` on-the-fly.
- `listings.search_vector` (generated column `tsvector`) + index GIN + ekstensi `pg_trgm` aktif — native Postgres, tanpa index eksternal Fase 1 (ADR-005).
- Data sensitif terenkripsi at-rest dengan pola identik: `agent_verification_documents.file_url`, field finansial `dbr_simulations`, **(baru)** `agent_ai_connections.encrypted_api_key` (hard-delete saat disconnect, bukan soft-delete — pengecualian sengaja).

---

## 7. PROJECT PRINCIPLES

1. **Single Source of Truth** — satu definisi tipe data (`packages/shared-types`), satu skema validasi (Zod), satu dokumen ERD/API Spec sebagai rujukan; tidak boleh ada definisi ganda yang berpotensi berbeda.
2. **Ownership sebagai Hard Boundary** — `agent_id` adalah batas kepemilikan yang tidak bisa dilewati permission apa pun; desain apa pun berangkat dari asumsi ini dulu, baru permission tambahan di atasnya.
3. **Reusable Components** — komponen UI dasar dan pola service/repository dipakai ulang lintas modul, bukan ditulis ulang per fitur.
4. **Modular Development** — setiap modul (13 modul) punya batas tanggung jawab jelas dan dependency yang eksplisit (lihat Bagian 4, dan `Module-Dependency-Matrix-...v1.0.md` untuk detail penuh).
5. **SEO-First, bukan SEO-Afterthought** — setiap halaman publik baru dicek terhadap checklist SEO **sebelum** dianggap selesai.
6. **Konfigurasi di atas Hard-code** — parameter yang bisa berubah karena keputusan bisnis (threshold DBR, masa expired listing, passing grade) selalu configurable lewat Admin Panel.
7. **Progressive Disclosure untuk RBAC** — role dengan akses lebih sempit tidak melihat menu/opsi yang tidak relevan, disembunyikan penuh, bukan sekadar disabled.
8. **Data Lokasi Terstruktur** — field lokasi baru mengikuti pola cascading wilayah yang sudah ada.
9. **Scalable & Maintainable** — struktur folder, penamaan, dan pola kode konsisten agar mudah di-scale dan dipelihara AI/human di masa depan.
10. **Security First** — enkripsi data sensitif, RBAC berlapis (middleware + RLS), tidak ada trust terhadap input client.
11. **Mobile-First & PWA-Aware** — agen bekerja di lapangan; form listing, kalkulator DBR, dashboard harus nyaman di layar kecil/koneksi tidak stabil.
12. **Graceful Degradation Komunikasi** — CTA WhatsApp adalah jalur utama Buyer↔Agen di MVP; tidak ada asumsi chat in-app sudah tersedia (Communication & Chat API tetap non-MVP).
13. **(Baru v1.1) Fase Migrasi Terjadwal, Bukan Preventif** — Typesense/Upstash Redis/QStash **tidak** boleh diinstal/diintegrasikan sebelum kriteria ambang migrasi Fase 2 tercapai **dan** disetujui eksplisit manusia (ADR-005/006/018).
14. **(Baru v1.1) Gate Governance Independen dari Status Dokumen** — status "Baseline" pada dokumen tidak otomatis berarti izin implementasi kode; modul tertentu (M12, M13) memerlukan konfirmasi gate terpisah via `CURRENT-PROJECT-STATE.md`.

---

## 8. UI PRINCIPLES

- **Rendering sesuai tipe halaman**: halaman publik (homepage, search, detail listing, profil agen, proyek developer, **(baru) halaman publik Organization `/organization/[slug]`**) wajib SSR/SSG/ISR; halaman privat (dashboard, admin, hasil kalkulator DBR, chat AI Assistant) CSR + `noindex, nofollow`.
- **Satu `<h1>` per halaman publik**, breadcrumb di setiap halaman detail (`Beranda > Kota > Tipe Properti > Judul`).
- **Komponen dasar (`ui/`) vs komponen fitur (`features/{module}/`) dipisah tegas** — komponen dasar tidak mengandung business logic.
- **Gambar** wajib lewat komponen image Next.js dengan `width`/`height`/`aspect-ratio` reserved (mencegah CLS) dan lazy-load di luar viewport awal.
- **Form panjang** (listing, DBR) mendukung multi-step dan idealnya autosave/draft agar tidak kehilangan input di lapangan.
- **Filter pencarian** memakai debounce (target INP < 200ms) dan disimpan sebagai URL query yang dapat dibagikan.
- **Peta interaktif** (Leaflet) wajib client-only (`next/dynamic` dengan `ssr: false` atau `"use client"`) — Leaflet mengakses `window`/DOM langsung.
- **State loading/empty/error** wajib tersedia untuk setiap komponen data-fetch — minimal 4 state: loading, empty, error, success.
- **Konsistensi visual**: satu design system (Tailwind + shadcn/ui), tidak membuat sistem styling paralel.
- **Aksesibilitas dasar**: `alt_text` wajib untuk gambar listing (auto-generate jika kosong), label form jelas dalam Bahasa Indonesia.

---

## 9. CODING PRINCIPLES

- **TypeScript wajib** di seluruh layer, `strict: true`, tanpa `any` implisit.
- **Functional component + hooks saja** — tidak ada class component baru.
- **Business logic terpisah dari UI** — kalkulasi (formula DBR, validasi ownership) selalu di `/lib` atau service layer backend, dapat di-unit-test tanpa render komponen.
- **Satu tanggung jawab per file/modul** — modul backend mengikuti struktur konsisten: `route.ts` (controller tipis), `*.service.ts`, `*.repository.ts`, `*.schema.ts` (Zod).
- **Tidak ada magic number/string** — threshold, expiry, passing grade dibaca dari `system_configs`/`dbr_config`.
- **Linting/formatting seragam** (ESLint + Prettier), pre-commit hook, dan CI gate wajib (GitHub Actions, ADR-010).
- **Naming konsisten**: `snake_case` untuk DB/JSON API, `camelCase` untuk variabel/fungsi TS, `PascalCase` untuk tipe/komponen, `kebab-case` untuk endpoint REST.
- **Komentar wajib** untuk setiap implementasi hard rule keamanan/RBAC, agar tidak terhapus tidak sengaja saat refactor.
- **Konsistensi FE↔BE↔DB** — field yang sama memakai nama identik di ketiga layer; konversi `camelCase` hanya terjadi di dalam kode TypeScript via mapper/DTO, tidak "bocor" ke response API.

---

## 10. SECURITY PRINCIPLES

1. **Enkripsi data sensitif at-rest** — dokumen legalitas agen (KTP/NPWP), field finansial DBR (`net_income`, `existing_installments`), **(baru) `agent_ai_connections.encrypted_api_key`** — non-negotiable.
2. **RBAC berlapis** — middleware backend sebagai lapisan pertama, RLS Supabase sebagai lapisan kedua; **(baru) `organization-rbac.middleware` sebagai lapisan ketiga independen** khusus endpoint `/organizations/*`; tidak pernah hanya mengandalkan satu lapisan.
3. **Tidak ada trust terhadap input client** — seluruh validasi bisnis (region, OAuth token, ownership) diulang di server meski sudah divalidasi di client.
4. **Signed URL berumur pendek** untuk dokumen privat — tidak ada URL publik permanen untuk KTP/NPWP.
5. **API key pihak ketiga dipisah** — server-side only untuk `LOCATIONIQ_API_KEY`/`GEOAPIFY_API_KEY` (tiles OpenStreetMap tidak butuh key); API key AI provider (M13) disimpan per-user di database (bukan `.env`), tidak pernah dikirim ke client.
6. **Rate limiting wajib**, final via `rate_limit_log` (Postgres, ADR-018): publik 60/menit/IP, authenticated 300/menit/user, endpoint sensitif (login/OTP/register/forgot-password) 5/menit/IP+identifier — kembalikan `429` + header `Retry-After`. Endpoint Maps punya kebijakan scoped independen (Autocomplete 20/menit/IP, Geocode 10/menit/IP via `api_rate_limits`).
7. **Audit trail tidak dapat dihapus** oleh siapa pun kecuali proses retensi resmi terjadwal.
8. **Minimal 1 akun Superadmin aktif** dijamin di level aplikasi, bukan hanya kebijakan dokumentasi.
9. **PII tidak masuk ke Analytics/log teknis** — hanya event & parameter agregat yang dikirim ke GA4/GTM; isi percakapan AI Assistant tidak pernah masuk Sentry breadcrumb.
10. **Cookie consent + Google Consent Mode** wajib aktif sebelum tracking non-esensial berjalan penuh.
11. **Data privat milik user lain disamarkan sebagai 404**, bukan 403, untuk mencegah enumerasi resource.
12. **Setiap fitur user-generated content baru** (di luar `agent_reviews` yang sudah ada) wajib melalui review keamanan eksplisit sebelum dikembangkan.

---

## 11. AI DEVELOPMENT RULES

> Bagian ini adalah bagian **terpenting** dari dokumen ini. Aturan berikut **wajib dipatuhi** oleh AI Coding Assistant apa pun yang bekerja pada proyek ini, tanpa pengecualian. **(v1.1)** Selaras penuh dengan 39 Golden Rules `development-playbook.md` §26 — daftar di bawah adalah versi ringkas untuk quick-reference, bukan pengganti.

1. **Jangan mengubah struktur database tanpa alasan** yang jelas dan disetujui — setiap perubahan skema wajib lewat migration file yang direview, disinkronkan ke ERD.
2. **Jangan mengganti nama tabel** yang sudah ada.
3. **Jangan mengganti nama field** yang sudah dipakai FE/BE/DB.
4. **Jangan membuat tabel baru jika kebutuhan sudah tersedia** — cek `Entity-Mapping-...v1.0.md` (44 entity terdaftar) dan ERD dulu sebelum menambah entitas.
5. **Selalu gunakan komponen yang sudah ada** (`components/ui/`) sebelum membuat komponen baru yang fungsinya serupa.
6. **Jangan menduplikasi kode** — logic bisnis, skema validasi, dan tipe data masing-masing punya satu lokasi sumber kebenaran.
7. **Selalu gunakan TypeScript** dengan `strict: true`, tanpa `any` implisit.
8. **Selalu gunakan Supabase** sebagai provider database/auth/storage — **final, bukan lagi keputusan terbuka** (ADR-002/004/009).
9. **Selalu menjaga backward compatibility** — perubahan pada endpoint yang sudah live (`/v1`) tidak boleh breaking; breaking change wajib naik versi.
10. **Jangan membuat dependency baru tanpa alasan** — cek Bagian 5 (Tech Stack, final) dulu; penambahan library baru harus dijustifikasi 10 prinsip `technology-decisions.md` §2 dan disetujui.
11. **Jangan membuat ulang fitur yang sudah ada** — baca struktur project & modul existing sebelum menambah fitur yang mungkin sudah terpenuhi.
12. **Ownership (`agent_id`) adalah hard boundary di kode**, bukan hanya di permission — bahkan jika permission salah konfigurasi, backend tetap menolak akses lintas kepemilikan.
13. **Superadmin selalu bypass** pengecekan permission (kecuali koneksi AI Assistant M13 — pengecualian sengaja); Manager selalu berskala global (`all`), tidak ada mode scoped tim/wilayah — final, tidak boleh ditanyakan ulang.
14. **Jangan membangun fitur fase mendatang** sebelum fondasi fase saat ini solid dan lolos acceptance criteria — rujuk `Module-Dependency-Matrix-...v1.0.md` & `Module-Implementation-Strategy-...v1.1.md` untuk urutan yang berlaku.
15. **Jangan membuat keputusan arsitektur/bisnis sepihak** untuk item yang masih berstatus "perlu dikonfirmasi" (lihat Bagian Potential Conflict) — implementasikan sebagai *configurable placeholder*, tandai `// TODO: menunggu keputusan bisnis`.
16. **Data sensitif tidak pernah masuk log** dalam bentuk plain text, dan tidak pernah dikirim sebagai PII ke Analytics.
17. **Jangan pernah expose secret/service role key** ke client-side — termasuk `LOCATIONIQ_API_KEY`/`GEOAPIFY_API_KEY`.
18. **Setiap penambahan/perubahan tabel atau endpoint wajib disinkronkan** ke dokumentasi terkait (`ERD`, `API Specification`) di `/docs`.
19. **Jika instruksi user bertentangan dengan aturan di dokumen ini** (terutama Security & Authorization) **atau ADR Approved**, **tanyakan konfirmasi** sebelum menyimpang — ADR Approved menang atas dokumen turunan mana pun jika terjadi konflik teks.
20. **Jika sebuah keputusan belum tercakup di dokumen ini**, jangan berasumsi bebas — ikuti pola paling dekat yang sudah ada, atau tandai `// TODO: perlu keputusan arsitektur`.
21. **(Baru v1.1) Jangan mulai implementasi kode M12/M13** tanpa memverifikasi status gate di `CURRENT-PROJECT-STATE.md` — status "Baseline" dokumen bukan izin implisit.
22. **(Baru v1.1) Jangan menginstal Typesense/Upstash Redis/QStash/Google Maps Platform/Mapbox secara preventif** — seluruhnya sudah final di Fase 1 dengan mekanisme berbeda (lihat Bagian 5); migrasi hanya sah setelah kriteria ambang tercapai **dan** disetujui eksplisit manusia.

---

## 12. AI PROMPT REMINDER

Checklist singkat yang **wajib dibaca AI** sebelum mulai mengerjakan modul apa pun:

- ✔ Baca project & dokumen context terlebih dahulu (`AI Context Pack` ini + dokumen sumber terkait modul yang dikerjakan + `architecture-decision-records.md`).
- ✔ Verifikasi urutan modul terhadap `Module-Dependency-Matrix-...v1.0.md`/`Module-Implementation-Strategy-...v1.1.md`, bukan mengasumsikan urutan bebas.
- ✔ Untuk M12/M13: verifikasi status gate implementasi sebelum menerima task apa pun.
- ✔ Gunakan struktur folder yang sudah ada — jangan membuat struktur paralel.
- ✔ Jangan ubah modul lain di luar scope yang diminta.
- ✔ Jangan rename tabel/field database yang sudah ada.
- ✔ Gunakan reusable component (`ui/`) sebelum membuat komponen baru.
- ✔ Gunakan satu skema Zod yang sama di client & server — jangan duplikasi validasi.
- ✔ Terapkan filter `granted_scope` (`own`/`all`/`none`) dan validasi ownership (`agent_id`) di setiap endpoint ber-scope.
- ✔ Pastikan query list selalu paginated.
- ✔ Pastikan parameter bisnis baru bersifat configurable, bukan hard-code.
- ✔ Cek halaman publik baru terhadap checklist SEO (SSR, slug, meta tag, structured data) sebelum dianggap selesai.
- ✔ Update dokumentasi (`ERD`, `API Specification`) bila ada perubahan skema/endpoint.
- ✔ Pastikan tidak ada secret/API key yang ter-expose ke client.
- ✔ Jika ragu atau menemukan hal yang belum diputuskan, tandai `// TODO` dan laporkan — jangan berasumsi sepihak.

---

## Potential Conflict

**(v1.1 — bagian ini disusun ulang total)** Bagian ini mencatat titik yang masih benar-benar terbuka atau berpotensi menimbulkan kesalahpahaman, **setelah** seluruh 28 ADR arsitektur/teknis disahkan Approved. Mayoritas item di versi 1.0 dokumen ini (framework frontend, arsitektur backend, provider Maps, search engine, job queue, caching) **sudah resolved** dan dihapus dari daftar — lihat Bagian 5 (Tech Stack, final).

**Item yang masih benar-benar terbuka (murni keputusan bisnis, bukan ADR arsitektur/teknis):**
1. **Model monetisasi** — belum diputuskan (komisi transaksi, tier keanggotaan, atau boost listing berbayar). Tidak ada logika pembayaran wajib di MVP; endpoint billing hanya placeholder non-breaking.
2. **Threshold DBR final & kebijakan per bank rekanan** — masih memerlukan input tim bisnis/legal; wajib configurable, bukan hard-code.
3. **Kebijakan eksklusivitas proyek developer per wilayah/agen** — belum diputuskan; jangan diimplementasikan sebagai batasan permanen tanpa konfirmasi.
4. **Kepemilikan akun organisasi Google Search Console/GTM/GA4** — belum ditentukan tim operasional; tidak memblokir development, namun perlu diselesaikan sebelum go-live.
5. **Kebijakan promosi/demosi role** (mis. apakah Manager dapat mempromosikan Agen langsung menjadi Manager) — belum dikonfirmasi; sesuai hard rule saat ini, Manager hanya bisa promote/demote antara Agen ↔ Admin.
6. **Apakah agen wajib bernaung di bawah kantor/brokerage tertentu** atau bisa independen — belum dikonfirmasi.

**Gap administratif/dokumentasi (sudah Approved secara teknologi, hanya gap sinkronisasi dokumen — tidak memengaruhi implementasi kode):**
7. Pencatatan formal Bolt.new sebagai toolchain resmi di `technology-decisions.md`/`dependency-manifest.md`.
8. Dokumen Testing Strategy/Test Plan konsolidasi belum ada terpisah (tool sudah final — ADR-016).

**(Baru v1.1) Rekonsiliasi urutan modul antar-dokumen:**
9. `development-playbook.md` §23 (Development Order) memuat tabel urutan modul yang **sebagian berbeda** dari `Module-Dependency-Matrix-...v1.0.md` — tabel §23 tersebut masih mereferensikan `PRD-v1.1.md` dan belum sepenuhnya sinkron dengan PRD v1.2/SYSTEM-ARCHITECTURE v1.6 (ADR-026/027/028). **Gunakan MDM sebagai rujukan urutan tunggal** sampai `development-playbook.md` §23 disinkronkan ulang secara resmi.

**(Baru v1.1) Gate implementasi M12/M13:**
10. Kedua modul Approved secara arsitektur tetapi kode belum boleh ditulis — bukan "konflik" dalam arti kontradiksi dokumen, melainkan **gate governance eksplisit** yang perlu diverifikasi ulang setiap sesi (lihat Bagian 4 catatan gate, dan `CURRENT-PROJECT-STATE.md`).

---

*Dokumen ini adalah context pack ringkas turunan dari `PROJECT-CONSTITUTION.md` dan dokumen sumber terkini per 6 Agustus 2026 (PRD v1.2, ERD v1.3, API Spec v1.2, User Flow v1.2, Entity Mapping v1.0), `SYSTEM-ARCHITECTURE.md` v1.6, `technology-decisions.md` v1.5, 28 ADR Approved, serta `development-playbook.md`, `Module-Dependency-Matrix-...v1.0.md`, dan `Module-Implementation-Strategy-...v1.1.md`. Gunakan sebagai referensi cepat di setiap sesi kerja AI Coding Assistant; untuk detail teknis mendalam, rujuk dokumen sumber lengkap di `/docs`. Wajib direview ulang setiap kali ada ADR baru disahkan atau dokumen sumber utama naik versi.*
