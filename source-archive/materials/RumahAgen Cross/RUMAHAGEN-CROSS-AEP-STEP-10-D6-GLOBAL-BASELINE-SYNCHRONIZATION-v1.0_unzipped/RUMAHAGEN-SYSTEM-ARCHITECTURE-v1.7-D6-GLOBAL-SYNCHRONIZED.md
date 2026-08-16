# SYSTEM ARCHITECTURE
## Platform Web RUMAHAGEN

**Versi:** 1.6
**Tanggal:** 3 Agustus 2026 — direvisi (v1.5 → v1.6) untuk menyinkronkan seluruh isi dokumen dengan `architecture-decision-records.md` (ADR-026 Organization Model Strategy, ADR-027 Organization-Scoped Authorization Strategy, ADR-028 Third-Party AI Assistant Integration Strategy) dan `technology-decisions.md` v1.6
**Disusun oleh:** Principal Software Architect / Enterprise Solution Architect / Senior Full Stack Engineer / Technical Lead / Cloud Architect
**Status:** Referensi teknis utama — mengikat seluruh proses development, baik oleh AI Coding Assistant (Bolt.new, Claude, ChatGPT, Cursor, GitHub Copilot) maupun developer manusia. ✅ **Baseline (BERLAKU)** — naik dari "Approved, belum Baseline formal" pada 4 Agustus 2026, menyusul resolusi **OD-06**: satu-satunya blocker (nama individu Reviewer/Approver) kini terpenuhi via penetapan **Mujtahid Aktanto (Solo Project Owner, AI-Assisted)** — lihat `document-governance-baseline-register.md` §9–10. Dengan resolusi ADR-026/027/028 dan `ADR-046`, dokumen ini **sinkron penuh** — tidak ada ADR arsitektur/teknis berstatus OPEN yang menghalangi.
**Dokumen sumber:** `PROJECT-CONSTITUTION.md`, `architecture-decision-records.md` (ADR — sumber kebenaran keputusan arsitektur), `technology-decisions.md` v1.6, `PRD-RUMAHAGEN-v1.1.md`, `ERD-Skema-Database-Real-Estate-Agency-v1.1.md`, `ERD-Diagram-v1.1.mermaid`, `API-Specification-RUMAHAGEN-v1.1.md`, `User-Flow-RUMAHAGEN-v1.1.md`, `SEO-Analytics-Specification-RUMAHAGEN-v1.1.md`, `AI-DEVELOPMENT-BLUEPRINT.md`, `AI-CONTEXT-PACK.md`, `dependency-manifest.md`, `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md`.

> **Catatan hierarki dokumen (diperbarui v1.5).** Untuk **keputusan arsitektur/teknis** yang sudah tercatat sebagai ADR, urutan kemenangan yang berlaku terhadap isi dokumen ini adalah:
> ```
> architecture-decision-records.md (ADR berstatus Approved)
>    ↓
> technology-decisions.md (v1.6)
>    ↓
> SYSTEM-ARCHITECTURE.md (dokumen ini)
> ```
> Setiap kali ADR berstatus **Approved** ada, dokumen ini **wajib** mencerminkannya secara final — tidak ada lagi opsi bercabang untuk topik yang sudah Approved. Untuk ADR berstatus **OPEN**, dokumen ini **wajib** menyatakan status "belum final" secara eksplisit, bukan memilih salah satu opsi sepihak. **Per 3 Agustus 2026, seluruh 28 ADR berstatus Approved/Approved With Notes — klausul ADR OPEN di atas kini tidak memiliki kasus aktif, tetap dipertahankan sebagai aturan baku untuk ADR baru di masa depan.** Untuk **keputusan bisnis/non-teknis** dan governance dokumen secara umum, `PROJECT-CONSTITUTION.md` tetap otoritas tertinggi sesuai `document-governance-baseline-register.md` §7 & §13 — jika ditemukan ketidaksesuaian dengan Constitution, Constitution yang berlaku dan dicatat sebagai temuan governance, bukan diselesaikan sepihak di dokumen ini.

---

## Riwayat Versi

> Tabel ini disusun retroaktif pada siklus konsolidasi ini berdasarkan 9 snapshot revisi yang tersedia (`SYSTEM-ARCHITECTURE.md` s.d. `SYSTEM-ARCHITECTURE__8_.md`) — dokumen sebelumnya tidak memiliki tabel Riwayat Versi eksplisit.
>
> **Keputusan Owner (konsolidasi ini, 9 Agustus 2026):**
> 1. Nomor versi publik/citable dokumen **TETAP "1.6"** (tidak dinaikkan ke 1.7) — karena `project-manifest.md`, `Module-Dependency-Matrix-...v1.0.md`, dan kemungkinan `document-governance-baseline-register.md` sudah eksplisit mereferensikan "`SYSTEM-ARCHITECTURE.md` v1.6 (Baseline)"; menaikkan nomor versi sepihak di sini akan membuat rujukan-rujukan tsb usang tanpa paket sinkronisasi terpisah.
> 2. **Skema penomoran PATCH diadopsi retroaktif** untuk tiga snapshot 3 Agustus 2026 yang sebelumnya berbagi label "1.6" identik tanpa pembeda — diberi identifier **1.6.0 / 1.6.1 / 1.6.2** (bukan lagi 1.6a/b/c informal) sesuai urutan kronologis isi (dikonfirmasi via diff, bukan asumsi nomor upload). **File final hasil konsolidasi ini setara 1.6.2** — satu-satunya salinan kanonik untuk versi mayor.minor "1.6" ke depan.
> 3. **Aturan baku untuk mencegah pengulangan konflik:** mulai siklus ini, **setiap revisi konten pada tanggal yang sama atau di antara kenaikan versi minor wajib memakai identifier PATCH eksplisit** (`1.6.1`, `1.6.2`, dst.) di field **Versi** header — tidak lagi menuliskan ulang angka minor yang sama ("1.6") untuk isi yang berbeda. Field **Versi** publik yang dikutip dokumen lain tetap boleh disederhanakan ke angka minor ("v1.6") asalkan **file kanonik tunggal** yang beredar (bukan beberapa salinan bersaing) — identifier PATCH hanya wajib tampil di tabel Riwayat Versi internal dokumen, bukan mengubah cara dokumen lain mengutip.
> 4. Ketidaksinkronan yang ditemukan di isi dokumen (Daftar Isi tidak mencantumkan Bagian 23–24; ADR-046 tidak terdaftar di ADR Cross-Reference Matrix Bagian 24) **tetap belum diperbaiki** pada siklus ini — di luar cakupan perbaikan penomoran, tetap tercatat sebagai temuan governance terbuka.

| Versi | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| 1.0 | 27 Jul 2026 | Rilis awal — arsitektur teknis lengkap berdasarkan `PROJECT-CONSTITUTION.md` dan dokumen sumber v1.1 (PRD/ERD/API Spec/User Flow/SEO Spec), sebelum ADR formal ada. |
| 1.1 | 27 Jul 2026 | Sinkron dengan ADR-001 (Backend Architecture, Approved) & `technology-decisions.md` v1.1 — menghilangkan percabangan opsi arsitektur backend (Route Handlers vs service terpisah), menambah Bagian 24 (ADR Cross-Reference Matrix). |
| 1.2 | 28 Jul 2026 | Mengunci Search Strategy (ADR-005, Approved) — PostgreSQL FTS + pg_trgm Fase 1. Sisa 3/25 ADR OPEN. |
| 1.3 | 29 Jul 2026 | Mengunci Job Queue/Scheduler Strategy (ADR-006, Approved) — Vercel Cron + Postgres Trigger Fase 1. Sisa 2/25 ADR OPEN. |
| 1.4 | 30 Jul 2026 | Mengunci Maps & Geocoding Provider (ADR-008, Approved v3) — Leaflet+OSM+LocationIQ/Geoapify. Sisa 1/25 ADR OPEN (ADR-018). |
| 1.5 | 31 Jul 2026 | Mengunci Caching/Rate Limiting (ADR-018, Approved) — Supabase Postgres `rate_limit_log` Fase 1. **25/25 ADR Approved** — eligible diajukan Baseline. |
| **1.6.0** *(sebelumnya "1.6", snapshot pertama 3 Agu)* | 3 Agu 2026 | Menambahkan Modul 12 (Organization Management, ADR-026/027) dan Modul 13 (AI Assistant/BYOK, ADR-028) ke Bagian 5/7/8/13/14. Merevisi status ADR-023. **28/28 ADR Approved/Approved With Notes.** Catatan cakupan: kode Modul 12/13 belum boleh ditulis. |
| **1.6.1** *(sebelumnya "1.6", snapshot kedua 3 Agu)* | 3 Agu 2026 | Menambah detail teknis: trigger Postgres `prevent_listing_origin_update()` untuk `listing_origin` immutable (referensi Update ADR-026), dan ketentuan `agent_ai_connections` (1 koneksi aktif per provider, hard-delete `encrypted_api_key` saat disconnect — Update 2026-08-03). |
| **1.6.2** *(sebelumnya "1.6", snapshot ketiga 3 Agu — versi terkini)* | 3 Agu 2026 (isi) / 4 Agu 2026 (status) | Status naik ✅ **Baseline (BERLAKU)** menyusul resolusi OD-06 (Owner: Mujtahid Aktanto). Soft-delete diperluas dari 3 → 8 tabel (ADR-046/OD-07). Resolusi OD-02 (final 7 role, Guest bukan baris `roles`). **Basis dokumen final di bawah — file kanonik tunggal untuk v1.6.** |

---

# TUJUAN DOKUMEN

- Menjelaskan arsitektur sistem secara lengkap, dari client hingga infrastruktur.
- Menjadi referensi teknis tunggal bagi seluruh tim (manusia maupun AI Coding Assistant).
- Mengurangi risiko perubahan arsitektur di tengah development dengan mengunci keputusan mahal sejak awal.
- Menjadi acuan implementasi seluruh modul, pola kode, dan standar teknis proyek.
- **(Baru di v1.1)** Menghilangkan seluruh percabangan opsi arsitektur yang sudah diselesaikan via ADR, agar tidak ada dua asumsi arsitektur berbeda yang beredar di sesi AI Coding Assistant mana pun.
- **(Baru di v1.2)** Mengunci strategi Search Engine (ADR-005, Approved) — menghilangkan status "belum ditentukan" pada mesin pencari `/properties/search` & `/properties/autocomplete`, menyisakan 3 dari 25 ADR yang masih OPEN.
- **(Baru di v1.3)** Mengunci strategi Job Queue/Scheduler (ADR-006, Approved) — menghilangkan status "belum ditentukan" pada mekanisme async/scheduled jobs (sitemap regeneration, reminder H-1, sinkronisasi counter), menyisakan 2 dari 25 ADR yang masih OPEN.
- **(Baru di v1.4)** Mengunci strategi Maps & Geocoding Provider (ADR-008, Approved v3) — menghilangkan status "belum final" pada provider lokasi listing & peta proyek developer, dikunci sebagai Leaflet + OpenStreetMap + LocationIQ (Primary) + Geoapify (Approved Alternative) dengan roadmap migrasi bertahap MVP → Growth → Scale → Enterprise, menyisakan **1 dari 25 ADR** yang masih OPEN (ADR-018, Caching Strategy).
- **(Baru di v1.5)** Mengunci strategi Caching/Rate Limiting level aplikasi (ADR-018, Approved) — menghilangkan status "belum ditentukan" pada mekanisme rate limiting endpoint sensitif, dikunci sebagai Supabase Postgres (tabel `rate_limit_log`, sliding window) untuk Fase 1, migrasi terjadwal ke Upstash Redis di Fase 2 berbasis kriteria ambang eksplisit. Dengan ini, 25 dari 25 ADR yang tercatat sampai 31 Juli 2026 berstatus Approved.
- **(Baru di v1.6)** Menambahkan Modul 12 (Organization Management, ADR-026/027, Approved With Notes/Approved) dan Modul 13 (AI Assistant Integration/BYOK, ADR-028, Approved With Notes) ke Module Architecture (Bagian 5), Database Architecture (Bagian 7), Authorization Architecture (Bagian 8), Notification Architecture (Bagian 13), dan Security Architecture (Bagian 14). Merevisi status ADR-023 (Multi-Tenancy Strategy). **Dengan ini, 28 dari 28 ADR kini berstatus Approved/Approved With Notes — tidak ada lagi ADR arsitektur/teknis yang OPEN di seluruh proyek.** **Catatan cakupan:** kode Modul 12/13 belum boleh ditulis — dokumen sumber bisnis/data v1.1 (PRD/ERD/API Spec/User Flow/SEO Spec) belum disinkronkan pada siklus ini (`PROJECT-CONSTITUTION.md` §24 poin 10).

---

## Daftar Isi

1. Executive Summary
2. Architecture Principles
3. High Level Architecture
4. Technology Stack
5. Module Architecture
6. Folder Structure Recommendation
7. Database Architecture
8. Authentication & Authorization Architecture
9. API Architecture
10. Frontend Architecture
11. Backend Architecture
12. File Storage Architecture
13. Notification Architecture
14. Security Architecture
15. Performance Strategy
16. Scalability Strategy
17. Error Handling Strategy
18. Deployment Architecture
19. Development Standards
20. Future Architecture
21. Risks
22. AI Development Notes
23. Open Questions & Assumptions
24. ADR Cross-Reference Matrix *(baru di v1.1)*

---

# 1. EXECUTIVE SUMMARY

### Ringkasan Sistem
Platform Web RUMAHAGEN adalah sistem **PropTech SaaS bermodel B2B2C** yang mendigitalisasi operasional agensi properti Indonesia — mulai dari onboarding & administrasi agen, manajemen listing properti, edukasi agen (Learning Center), kolaborasi dengan developer properti, hingga alat bantu pre-screening kelayakan KPR (DBR Scoring). Sistem dipakai secara internal oleh tim agensi & agennya, sekaligus dikonsumsi publik oleh calon pembeli/penyewa properti.

### Tujuan Aplikasi
1. Mendigitalkan rekrutmen & administrasi agen properti secara mandiri (self-service).
2. Menyediakan sarana pengelolaan profil profesional dan listing properti per-agen.
3. Meningkatkan kapabilitas jual agen lewat Learning Center gratis.
4. Memfasilitasi kolaborasi bisnis agen–developer melalui katalog proyek.
5. Membantu agen melakukan kualifikasi awal kelayakan KPR calon pembeli.
6. Memastikan seluruh halaman publik terindeks mesin pencari secepat & seakurat mungkin sejak hari pertama rilis.

### Target Pengguna
- **Internal:** Superadmin, Manager, Admin, Instructor, Agen.
- **Eksternal:** Developer Partner (login opsional), Buyer (akun ringan opsional).
- **Publik tanpa akun:** Guest/Lead (calon pembeli/penyewa).

> **Catatan role (ADR-024, Approved):** Jumlah role **dengan akun** adalah **7** (superadmin, manager, admin, instructor, agent, developer_partner, buyer), ditambah Guest yang tidak memiliki baris `roles`. Angka "8" yang pernah muncul di beberapa dokumen turunan (`DEVELOPMENT-ROADMAP.md`, `CHANGELOG.md`, `CURRENT-PROJECT-STATE.md`, `decision-log.md`) adalah gap penghitungan lintas dokumen, bukan ambiguitas pada model role itu sendiri — lihat `architecture-decision-records.md` ADR-024 Notes dan Governance Notes poin 2.

### Ruang Lingkup Sistem
Sistem mencakup **11 modul fungsional**: Authentication, Profil Agen, Listing, Learning Center, Kalender Event, Direktori Developer, DBR Scoring, Dashboard & Notifikasi, Admin Panel/CMS, RBAC, serta SEO & Analytics. Sistem **tidak** mencakup pemrosesan transaksi jual-beli properti (bukan payment gateway untuk closing) — nilai jual utama adalah *lead generation* (CTA WhatsApp) dan *tooling* operasional agen. Model monetisasi platform belum final (lihat Bagian 23).

Pengembangan dibagi dalam **4 fase**: Fase 1 (fondasi — Auth, Profil, Listing dasar, Admin dasar, RBAC dasar, fondasi SEO), Fase 2 (Developer, DBR), Fase 3 (Learning Center, Event), Fase 4 (dashboard analitik lanjutan, gamifikasi, integrasi SLIK/BI Checking, payment/komisi otomatis).

### Ringkasan Status Keputusan Arsitektur (v1.5)
Sejak sesi Architecture Review Board 27–31 Juli 2026, **backend/API** proyek terkunci final (ADR-001, Approved): **Next.js Route Handlers sebagai BFF tipis, terintegrasi langsung dengan Supabase, tanpa service backend Node.js terpisah.** Menyusul itu, **strategi Search Engine** terkunci final (ADR-005, Approved): **PostgreSQL Full-Text Search + pg_trgm untuk Fase 1 (MVP), migrasi terjadwal ke Typesense di Fase 2.** **Strategi Job Queue/Scheduler** juga terkunci final (ADR-006, Approved): **Vercel Cron Jobs + Postgres Trigger/Database Webhook untuk Fase 1, migrasi terjadwal ke QStash (Upstash) di Fase 2** berdasarkan kriteria ambang eksplisit (volume job harian, kebutuhan retry/backoff kompleks, frekuensi melampaui batas cron interval). BullMQ+Redis ditolak untuk Fase 1 karena worker long-running-nya tidak kompatibel dengan model serverless Vercel yang dikunci ADR-001. **Maps & Geocoding Provider** juga terkunci final (ADR-008, Approved, direvisi v3): **Leaflet + OpenStreetMap (rendering) dengan LocationIQ sebagai Primary Geocoding Provider dan Geoapify sebagai Approved Alternative Provider**, dilengkapi caching berbasis Postgres (`geocode_cache`), rate limiting scoped, offline/manual address fallback 3 lapis, dan roadmap migrasi bertahap MVP → Growth → Scale → Enterprise (termasuk opsi kembali ke Google Maps Platform pada tahap Enterprise). Kini **Caching Strategy/Rate Limiting level aplikasi** juga terkunci final (ADR-018, Approved, 31 Juli 2026): **Supabase Postgres (tabel `rate_limit_log`, pola sliding window) untuk Fase 1**, tanpa menambah infrastruktur cache/in-memory-store baru, dengan migrasi terjadwal ke **Upstash Redis** di Fase 2 berdasarkan kriteria ambang eksplisit (volume request endpoint sensitif, load database, kebutuhan cache generik). Ini menghilangkan seluruh percabangan arsitektur backend, search, job queue, maps provider, dan caching/rate limiting yang sebelumnya tercatat di versi dokumen ini (v1.0–v1.4). **25 dari 25 ADR** (kelompok original) berstatus **Approved** per 31 Juli 2026 — kemudian bertambah menjadi **28 dari 28** dengan `ADR-026`/`027`/`028` (3 Agustus 2026), dan `ADR-046` (perluasan soft-delete, 4 Agustus 2026). **Tidak ada lagi ADR arsitektur/teknis yang OPEN** di seluruh proyek. Lihat Bagian 23 dan Bagian 24 untuk detail lengkap.

---

# 2. ARCHITECTURE PRINCIPLES

| Prinsip | Penerapan di Proyek Ini |
|---|---|
| **API First** | Kontrak API (`API-Specification.md`) didefinisikan lebih dulu sebagai sumber kebenaran — frontend & backend (Route Handlers) dikembangkan terhadap kontrak yang sama. |
| **Modular Architecture** | 11 modul fungsional dengan batas tanggung jawab jelas dan dependency eksplisit (lihat Bagian 5), memungkinkan pengembangan bertahap per fase tanpa merombak modul lain — seluruhnya berada dalam satu aplikasi `apps/web` (ADR-001). |
| **Separation of Concerns** | UI (komponen React) terpisah dari business logic (`lib/services/`) terpisah dari data access (repository layer) terpisah dari skema data (ERD) — dijaga melalui disiplin folder, bukan melalui pemisahan proses/deployment (ADR-001). |
| **Single Source of Truth** | Satu definisi tipe data (`packages/shared-types`), satu skema validasi Zod (ADR-025), satu dokumen ERD/API Spec sebagai rujukan tunggal. |
| **Ownership as Hard Boundary** | `agent_id` adalah batas kepemilikan data yang ditegakkan di kode (repository layer), tidak bisa dilewati oleh konfigurasi permission apa pun (ADR-003). |
| **Security First** | RBAC berlapis (middleware + RLS, ADR-003), enkripsi data sensitif at-rest, tidak ada trust terhadap input client (ADR-017) — diterapkan sejak desain awal. |
| **SEO First** | Strategi rendering SSR/SSG/ISR (ADR-021), struktur URL/slug, dan structured data diselesaikan di Fase 1. |
| **Performance First** | Target Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms, TTFB < 600ms) menjadi syarat desain. |
| **Reusable Components** | Komponen UI dasar (`components/ui/`, shadcn/ui — ADR-021/technology-decisions §4.3) dan pola service/repository backend dipakai ulang lintas modul. |
| **Configuration over Hard-code** | Parameter bisnis yang bisa berubah (threshold DBR, masa expired listing, passing grade) selalu configurable via Admin Panel (`system_configs`/`dbr_config`). |
| **Scalability** | Arsitektur mendukung pertumbuhan horizontal pada layer stateless (frontend + Route Handlers dalam satu aplikasi, ADR-001) dan pertumbuhan data terkelola pada database. |
| **Maintainability** | Konvensi penamaan konsisten FE↔BE↔DB (ADR-022), dokumentasi selalu sinkron dengan implementasi, komentar wajib pada hard rule keamanan/RBAC. |
| **Clean Code** | TypeScript `strict: true` tanpa `any` implisit (ADR-025), lint/format seragam sebagai CI gate, tidak ada duplikasi logic. |
| **Mobile First & PWA-Aware** | Agen bekerja di lapangan — form listing, kalkulator DBR, dan dashboard dirancang nyaman dipakai di layar kecil/koneksi tidak stabil. |
| **Graceful Degradation** | CTA WhatsApp adalah jalur komunikasi utama Buyer↔Agen di MVP; sistem tidak berasumsi kanal komunikasi lain (chat in-app) sudah tersedia. |
| **Serverless-Aware Design** *(baru v1.1)* | Karena backend terkunci ke Route Handlers di atas Vercel (ADR-001), seluruh business logic wajib dirancang agar selesai dalam batas eksekusi fungsi serverless (~10–60 detik tergantung paket) — proses berat/panjang wajib diarahkan ke job asinkron (ADR-006, Approved: Vercel Cron Jobs + Postgres Trigger/Database Webhook), tidak dipaksakan ke Route Handler. |

---

# 3. HIGH LEVEL ARCHITECTURE

### Component Diagram

```mermaid
flowchart TD
    Client["Client (Browser)\nDesktop & Mobile Web"]
    Frontend["Frontend — Next.js (App Router)\nSSR/SSG/ISR (publik) + CSR (dashboard/admin)"]
    Auth["Authentication Layer\nSupabase Auth → JWT Internal Platform"]
    Backend["Backend\nNext.js Route Handlers (BFF tipis)\napp/api/v1/**/route.ts — dalam apps/web\n(RBAC Middleware + Business Logic)\n— TANPA service Node.js terpisah (ADR-001, Approved) —"]
    DB["Database\nPostgreSQL (Supabase)\nRLS Aktif"]
    Storage["Storage\nSupabase Storage\n(Bucket Publik & Privat)"]
    Notif["Notification Service\nIn-App (tabel notifications) + Email (Resend)\n(Push/WA — kemungkinan fase lanjutan)"]
    Jobs["Async/Scheduled Jobs\nVercel Cron Jobs + Postgres Trigger/Database Webhook\n(Fase 1, Approved — ADR-006)\n→ QStash (Fase 2, migrasi terjadwal)"]
    Search["Search Engine\nPostgreSQL FTS + pg_trgm (Fase 1, Approved — ADR-005)\n→ Typesense (Fase 2, migrasi terjadwal)"]
    Third["Third Party Services\nMaps/Geocoding: Leaflet+OSM/LocationIQ/Geoapify\n(ADR-008 — Approved v3),\nGTM/GA4, Google Search Console/Indexing API"]
    GeoCache["geocode_cache (Postgres)\nCache geocoding/reverse geocoding\n(ADR-008, tanpa Redis)"]
    RateLimit["rate_limit_log (Postgres)\nRate limiting endpoint sensitif\n(ADR-018 — Approved, Fase 1, tanpa Redis)"]

    Client --> Frontend
    Frontend --> Auth
    Auth --> Backend
    Backend --> DB
    Backend --> Storage
    Backend --> Notif
    Backend --> Third
    Backend --> Search
    Backend --> Jobs
    Backend --> RateLimit
    Third --> GeoCache
    GeoCache --> DB
    RateLimit --> DB
    Search --> DB
    Jobs --> DB
    Jobs --> Notif
    DB -.RLS lapisan kedua.-> Backend
    Storage --> Frontend
    Notif --> Client
    Jobs -.pembersihan baris >7 hari.-> RateLimit
```

**Penjelasan alur:**
1. **Client** mengakses via browser (desktop/mobile) — tidak ada aplikasi mobile native di scope saat ini (lihat Bagian 20).
2. **Frontend (Next.js App Router, ADR-021)** merender halaman sesuai tipe: SSR/SSG/ISR untuk halaman publik (SEO-kritis), CSR untuk dashboard/admin (privat, `noindex`).
3. **Authentication Layer (ADR-002)** memverifikasi identitas via Supabase Auth, hasil akhir berupa JWT internal platform — seluruh layer di bawahnya tidak perlu tahu metode login (password/OTP/Google).
4. **Backend (ADR-001, Approved)** adalah **Route Handlers** di dalam aplikasi `apps/web` yang sama dengan frontend — **bukan** proses/deployment terpisah. Menjalankan RBAC middleware (ADR-003) sebelum menjalankan business logic modul terkait.
5. **Database (PostgreSQL via Supabase, ADR-004)** dengan RLS aktif sebagai lapisan pertahanan kedua.
6. **Storage (Supabase Storage, ADR-009)** terpisah bucket publik (foto listing) vs privat (dokumen legalitas), diakses lewat CDN atau signed URL.
7. **Notification Service (ADR-020)** mengirim notifikasi personal per user berdasarkan event bisnis (approval, expiry, sertifikat, lead baru) — channel in-app selalu aktif, email via Resend (ADR-007).
8. **Async/Scheduled Jobs (ADR-006, Approved)** menangani proses yang tidak boleh berjalan sinkron di Route Handler (regenerasi sitemap, reminder, sinkronisasi counter) — tugas terjadwal periodik dipicu **Vercel Cron Jobs** memanggil Route Handler (`app/api/cron/**`); tugas event-driven instan (counter sync, sitemap saat publish) dipicu **Postgres Trigger/Database Webhook** memanggil Route Handler yang sama. Tidak ada runtime kedua (Edge Functions/worker terpisah).
9. **Search Engine (ADR-005, Approved)** dijalankan sepenuhnya di dalam Postgres (kolom generated `search_vector` + index GIN, ekstensi `pg_trgm`) untuk Fase 1 — dipanggil langsung dari Route Handlers tanpa komponen infrastruktur tambahan; migrasi ke Typesense terjadwal di Fase 2 begitu kriteria ambang tercapai.
10. **Third Party Services (ADR-008, Approved v3)** dipanggil dari Route Handlers (server-side, menggunakan server-key rahasia) untuk Maps/Geocoding — **LocationIQ** (Primary Geocoding Provider) dengan **Geoapify** sebagai failover otomatis (Approved Alternative Provider), rendering peta via **Leaflet + OpenStreetMap** (tiles gratis, tanpa key) — serta Analytics dan Search Console/Indexing API. Hasil geocoding/reverse geocoding di-cache di tabel `geocode_cache` (Postgres, TTL ~90 hari) untuk menekan biaya API, tanpa menambah komponen infrastruktur (Redis) di luar Supabase.
11. **Rate Limiting/Application Cache (ADR-018, Approved)** — `rate-limit.middleware` (Bagian 8 & 11) mengecek tabel `rate_limit_log` (Postgres, pola sliding window) sebelum meneruskan request endpoint sensitif ke business logic — seluruhnya di dalam `apps/web`, tanpa Redis/Upstash di Fase 1. Kebijakan retensi baris (>7 hari) dibersihkan oleh **Vercel Cron Jobs** yang sama dengan mekanisme Job Queue (ADR-006), bukan infrastruktur job baru.

---

# 4. TECHNOLOGY STACK

> Stack berikut diambil dari `technology-decisions.md` v1.5 Bagian 3 (Official Technology Stack), yang pada gilirannya menaungi setiap barisnya ke satu ADR di `architecture-decision-records.md`. Kolom **ADR** menandai status kepastian arsitektural setiap baris — **seluruh baris kini Approved**, tidak ada lagi baris berstatus OPEN (per 31 Juli 2026, menyusul disahkannya ADR-018 sebagai ADR terakhir yang tersisa).

| Layer | Technology | ADR | Status |
|---|---|---|---|
| Frontend | Next.js (App Router) | ADR-021 | **Approved** |
| UI Framework / Library | React (via Next.js) | ADR-021 | **Approved** |
| Language | TypeScript (`strict: true`) | ADR-025 | **Approved** |
| CSS Framework | Tailwind CSS | ADR-021 (technology-decisions §4.4) | **Approved** |
| Component Library | shadcn/ui | ADR-021 (technology-decisions §4.3) | **Approved** |
| Icons | Lucide React | technology-decisions §3 | **Approved** |
| Server State | TanStack Query (khusus route group CSR) | ADR-011 | **Approved** — SWR **dilarang eksplisit** |
| UI State | Zustand (satu store per domain) | ADR-011 | **Approved** — Redux/Redux Toolkit **dilarang eksplisit** |
| Forms | React Hook Form | ADR-025 (technology-decisions §4.19) | **Approved** — Formik **dilarang eksplisit** |
| Validation | Zod (`z.infer` untuk tipe otomatis) | ADR-025 | **Approved** |
| Backend/API | **Next.js Route Handlers (BFF tipis)** di dalam `apps/web`, terintegrasi langsung Supabase — **tanpa** service Node.js terpisah | **ADR-001** | **Approved (27 Jul 2026)** |
| Database | PostgreSQL (via Supabase) | ADR-004 | **Approved** |
| Migration/Query Layer | Migration murni SQL bernomor urut (Supabase CLI), repository pattern — bukan ORM auto-sync | ADR-004, ADR-022 | **Approved** |
| Authentication | Supabase Auth (email/password, OTP, Google OAuth2) dibungkus JWT internal platform | ADR-002 | **Approved** |
| Authorization | RBAC kustom aplikasi (`granted_scope`) + Supabase RLS (dua lapis) | ADR-003 | **Approved** |
| Storage | Supabase Storage (bucket publik vs privat terpisah tegas) | ADR-009 | **Approved** |
| Search Engine | **PostgreSQL Full-Text Search + pg_trgm (Fase 1)** → Typesense (Fase 2, migrasi terjadwal berdasarkan kriteria ambang) | **ADR-005** | **Approved (28 Jul 2026)** untuk Fase 1 |
| Cache/Rate Limit (level aplikasi) | **Supabase Postgres — tabel `rate_limit_log`, sliding window (Fase 1)** → Upstash Redis (Fase 2, migrasi terjadwal berdasarkan kriteria ambang) | **ADR-018** | **Approved (31 Jul 2026)** untuk Fase 1 |
| Job Queue / Scheduled Job | **Vercel Cron Jobs + Postgres Trigger/Database Webhook (Fase 1)** → QStash — Upstash (Fase 2, migrasi terjadwal berdasarkan kriteria ambang) | **ADR-006** | **Approved (29 Jul 2026)** untuk Fase 1 |
| Maps/Geocoding | **Leaflet + React-Leaflet** (rendering, tiles OpenStreetMap gratis) + **LocationIQ** (Primary Geocoding Provider) + **Geoapify** (Approved Alternative Provider, failover) — migrasi bertahap terjadwal MVP → Growth → Scale → Enterprise | **ADR-008** | **Approved (30 Jul 2026, direvisi v3)** untuk Fase 1 |
| Transactional Email | Resend + React Email | ADR-007 | **Approved** |
| Monitoring | Sentry (`@sentry/nextjs`) | ADR-015 | **Approved** |
| Logging | Structured logging (JSON), audit log bisnis terpisah | ADR-014 | **Approved** |
| Unit Testing | Vitest | ADR-016 | **Approved** |
| Component Testing | React Testing Library | ADR-016 | **Approved** |
| E2E Testing | Playwright (terhadap `next build && next start`) | ADR-016 | **Approved** |
| Hosting | Vercel | ADR-010 | **Approved** |
| Repository | GitHub | ADR-010 | **Approved** |
| CI/CD | GitHub Actions (lint, type-check, test, migration check) | ADR-010 | **Approved** |
| Image Compression (client) | browser-image-compression | ADR-019 | **Approved** |
| Charts | Recharts | technology-decisions §3 | **Approved** |
| Table | TanStack Table | technology-decisions §3 | **Approved** |
| Drag & Drop | dnd-kit | technology-decisions §3 (react-beautiful-dnd **dilarang**, deprecated) | **Approved** |
| Date Library | date-fns | technology-decisions §3 (Moment.js **dilarang**) | **Approved** |
| PDF | pdf-lib | technology-decisions §3 | **Approved** |

**Toolchain pengembangan (catatan tambahan ADR-001):** **Bolt.new** dikonfirmasi sebagai bagian toolchain resmi pengembangan proyek lintas sesi AI Coding Assistant — direkomendasikan Architecture Review Board untuk dicatat eksplisit di `technology-decisions.md`/`dependency-manifest.md` (tindak lanjut governance, bukan keputusan arsitektur baru).

**Architecture Constraints (technology-decisions.md §6) yang relevan bagi dokumen ini:** dilarang menggunakan Redux, MUI, Ant Design, Formik, SWR, Moment.js, react-beautiful-dnd, CSS-in-JS runtime, Axios, atau **menambahkan backend service Node.js terpisah** — pelanggaran atas larangan terakhir berarti melanggar ADR-001 (Approved) dan hanya sah diubah lewat ADR baru yang secara eksplisit men-supersede-nya.

---

# 5. MODULE ARCHITECTURE

### 5.1 Authentication
- **Purpose:** Mengelola identitas seluruh jenis akun (agent, buyer, internal roles) dan sesi login.
- **Responsibilities:** Registrasi (email/HP + OTP), login password/Google OAuth2, refresh token, logout (single/all device), forgot/reset password, upload dokumen legalitas agen.
- **Dependencies:** RBAC (untuk penerbitan role saat registrasi), Referensi Wilayah (tidak langsung).
- **Main Features:** `POST /auth/register`, `/auth/verify-otp`, `/auth/login`, `/auth/oauth/google`, `/auth/refresh`, `/auth/logout(-all)`, `/auth/forgot-password`, `/auth/reset-password`.
- **ADR terkait:** ADR-002 (Authentication Strategy), ADR-003 (RBAC — penerbitan `role_id`).

### 5.2 Profil Agen
- **Purpose:** Halaman publik & privat sebagai "kartu nama digital" agen.
- **Responsibilities:** Kelola bio/spesialisasi/area, statistik listing terjual/tersewa (denormalisasi), badge sertifikasi (relasi ke Learning Center), review/rating (moderasi wajib).
- **Dependencies:** Authentication (identitas), Learning Center (badge), Listing (statistik).
- **Main Features:** `GET/PUT /users/profile`, `GET /agents/{id}`, `GET/POST /agents/{id}/reviews`, moderasi review Admin.

### 5.3 Listing
- **Purpose:** Inti transaksi platform — pengelolaan listing properti per-agen dan pencarian publik.
- **Responsibilities:** CRUD listing (kategori Primary/Secondary, tujuan Jual/Sewa), lifecycle status, upload media, CTA WhatsApp + pencatatan lead, pencarian & filter, moderasi.
- **Dependencies:** Authentication, Profil Agen (WA default), Referensi Wilayah (lokasi cascading), Direktori Developer (untuk listing Primary), RBAC (moderasi).
- **Main Features:** `POST/GET/PUT /listings`, `POST /listings/{id}/media`, `/properties/search`, `/properties/autocomplete`, pencatatan `listing_leads`.
- **ADR terkait:** ADR-005 (Search Strategy — **Approved**, PostgreSQL FTS + pg_trgm Fase 1 menjalankan langsung implementasi `/properties/search`/`/properties/autocomplete`), ADR-008 (Maps Provider — **Approved v3**, Leaflet+OSM+LocationIQ/Geoapify untuk form lokasi, dengan fallback manual 3 lapis jika Geocoding API gagal).

### 5.4 Learning Center
- **Purpose:** Portal edukasi & sertifikasi gratis untuk agen.
- **Responsibilities:** Katalog kursus, self-enroll, konten video/PDF/kuis, sertifikat otomatis, progress tracking.
- **Dependencies:** Authentication (Agen/Instructor), Profil Agen (badge), Kalender Event (kelas live), RBAC.
- **Main Features:** CRUD `courses`/`course_lessons`/`quizzes`, `enrollments`, `quiz_attempts`, `certificates`.

### 5.5 Kalender Event
- **Purpose:** Manajemen event training, launching proyek, open house, gathering.
- **Responsibilities:** CRUD event, RSVP agen, pengajuan event oleh Developer Partner (butuh approval).
- **Dependencies:** Authentication, Learning Center (event = kelas live), Direktori Developer (event launching proyek), RBAC.
- **Main Features:** CRUD `events`, `event_registrations`.
- **ADR terkait:** ADR-006 (Job Queue — **Approved**: Vercel Cron Jobs untuk reminder event H-1).

### 5.6 Direktori Kerjasama Developer
- **Purpose:** Katalog proyek developer untuk dipasarkan agen.
- **Responsibilities:** CRUD proyek (data resmi harga/unit), klaim proyek oleh agen (non-eksklusif kecuali dikonfigurasi), sinkronisasi data ke listing turunan.
- **Dependencies:** Referensi Wilayah (`city_id`), Listing (listing Primary), RBAC (hanya Admin/Manager/Superadmin CRUD data resmi).
- **Main Features:** CRUD `developer_partners`/`developer_projects`/`developer_project_media`, `agent_project_claims`.
- **ADR terkait:** ADR-008 (Maps Provider — **Approved v3**, Leaflet+OSM+LocationIQ/Geoapify untuk peta proyek).

### 5.7 DBR Scoring (Kalkulator KPR)
- **Purpose:** Pre-screening kelayakan KPR calon pembeli berdasarkan standar DBR/DSR perbankan Indonesia.
- **Responsibilities:** Kalkulasi anuitas & DBR%, simulasi what-if, export PDF, riwayat simulasi per agen.
- **Dependencies:** Authentication (Agen), Listing (opsional auto-fill harga), Admin Panel (parameter `dbr_config`), RBAC (akses data sensitif terbatas).
- **Main Features:** `POST /calculator/dbr`, riwayat `dbr_simulations`, konfigurasi `dbr_config` (Superadmin only).

### 5.8 Dashboard & Notifikasi
- **Purpose:** Ringkasan lintas modul per role, dan pengiriman notifikasi personal.
- **Responsibilities:** Agregasi data dari Listing/Learning/Event/DBR (dashboard tidak menyimpan data sendiri); pengiriman notifikasi in-app/email/(push opsional).
- **Dependencies:** Listing, Learning Center, Kalender Event, DBR Scoring, RBAC (cakupan data per role).
- **Main Features:** Ringkasan dashboard per role, `notifications` (CRUD, mark-as-read).
- **ADR terkait:** ADR-007 (Email Provider), ADR-020 (Notification Strategy).

### 5.9 Admin Panel / CMS
- **Purpose:** Pusat operasional internal — moderasi, konfigurasi, laporan.
- **Responsibilities:** Manajemen user, moderasi listing/review/event, kelola konten Learning Center & Developer, konfigurasi parameter sistem, laporan & export.
- **Dependencies:** RBAC (gating akses seluruh sub-menu), seluruh modul lain (sebagai objek moderasi/konfigurasi).
- **Main Features:** `GET/PUT /admin/agents/*`, `/admin/agent-reviews/*`, konfigurasi `system_configs`/`dbr_config`.

### 5.10 RBAC (Manajemen Role & Hak Akses)
- **Purpose:** Fondasi kontrol akses seluruh sistem.
- **Responsibilities:** Definisi role/permission, Permission Matrix Editor (Superadmin), Permission Editor terbatas (Manager, khusus Agen), Assign Role, audit trail.
- **Dependencies:** Tidak bergantung pada modul lain — **modul fondasi** yang dibutuhkan semua modul lain.
- **Main Features:** CRUD `roles`/`permissions`/`role_permissions`, resolusi `granted_scope`, middleware RBAC.
- **ADR terkait:** ADR-003 (Authorization & RBAC Strategy), ADR-024 (RBAC Role Model Scope).

### 5.11 SEO & Analytics
- **Purpose:** Memastikan seluruh halaman publik terindeks optimal sejak awal.
- **Responsibilities:** Strategi rendering, slug & redirect, meta tag & structured data, sitemap, GTM/GA4, Search Console/Indexing API.
- **Dependencies:** Listing, Profil Agen, Direktori Developer (sebagai sumber halaman publik yang di-SEO-kan).
- **Main Features:** `url_redirects`, sitemap generator, helper `/lib/seo/`.
- **ADR terkait:** ADR-006 (Job Queue — **Approved**: Postgres Trigger/Database Webhook untuk regenerasi sitemap event-driven), ADR-021 (Frontend Framework/Rendering).

### 5.12 Organization Management *(baru, ADR-026/ADR-027 — 3 Agustus 2026)*
- **Purpose:** Memungkinkan agen membentuk/bergabung organisasi (Organization) untuk kolaborasi listing bersama, branding tim, dan dashboard performa kolektif — tanpa mengubah model kepemilikan aset listing individual.
- **Responsibilities:** CRUD Organization (self-service, tanpa moderasi Admin), invite/join request dua arah, kelola member (Leader), branding & Organization Dashboard, Activity Log, move listing Personal ↔ Organization.
- **Dependencies:** Authentication, RBAC (gate role platform lolos lebih dulu — lihat ADR-027), Listing (kepemilikan ganda personal/organization).
- **Main Features:** CRUD `organizations`/`organization_members`/`organization_invitations`, endpoint group `/organizations/*`, halaman publik `/organization/[slug]`.
- **ADR terkait:** ADR-026 (Organization Model Strategy — **Approved With Notes**), ADR-027 (Organization-Scoped Authorization Strategy — **Approved**), merevisi status ADR-023 (Multi-Tenancy Strategy).
- **Catatan status implementasi:** Approved secara arsitektur; **kode belum boleh ditulis** sampai paket sinkronisasi PRD/ERD/API Spec/User Flow/SEO Spec dieksekusi (`PROJECT-CONSTITUTION.md` §24 poin 10) — lihat `CURRENT-PROJECT-STATE.md`.

### 5.13 AI Assistant Integration *(baru, ADR-028 — 3 Agustus 2026)*
- **Purpose:** Memungkinkan agen (dan seluruh role internal berakun) chat dengan AI assistant pilihan sendiri di dalam SaaS lewat BYOK, tanpa redirect keluar aplikasi.
- **Responsibilities:** Kelola koneksi API key per-user (persisten, terenkripsi), proksi chat ke provider terkurasi, chat UI custom dengan thread paralel per-provider (state browser, tidak dipersist server).
- **Dependencies:** Authentication, RBAC (lintas role, bukan role-restricted). **Tidak bergantung** pada Modul 12 (Organization) — dua inisiatif independen.
- **Main Features:** Tabel referensi `ai_providers` (dikelola Admin), tabel koneksi `agent_ai_connections`, endpoint group `/ai-assistant/*`. **Tidak ada tabel riwayat percakapan.**
- **ADR terkait:** ADR-028 (Third-Party AI Assistant Integration Strategy/BYOK — **Approved With Notes**), reuse ADR-017 (Security — enkripsi kredensial) dan ADR-018 (Caching — reuse `rate_limit_log` untuk rate limiting tambahan).
- **Catatan status implementasi:** Approved secara arsitektur; **kode belum boleh ditulis** sampai paket sinkronisasi PRD/ERD/API Spec/User Flow dieksekusi (`PROJECT-CONSTITUTION.md` §24 poin 10) — lihat `CURRENT-PROJECT-STATE.md`.

### Tabel Dependency Antar Modul

| Modul | Bergantung Pada | Dibutuhkan Oleh |
|---|---|---|
| RBAC | — (fondasi) | Semua modul |
| Authentication | RBAC | Profil Agen, Listing, Learning Center, Event, DBR, Dashboard, Admin Panel, Organization, AI Assistant |
| Profil Agen | Authentication | Listing (WA default), Dashboard, SEO |
| Listing | Authentication, Profil Agen, Referensi Wilayah, Direktori Developer | Dashboard, SEO, DBR (opsional), Organization (kepemilikan ganda) |
| Direktori Developer | Authentication, Referensi Wilayah | Listing (Primary), Kalender Event |
| Learning Center | Authentication | Profil Agen (badge), Kalender Event (kelas live), Dashboard |
| Kalender Event | Authentication, Learning Center, Direktori Developer | Dashboard |
| DBR Scoring | Authentication, Listing (opsional), Admin Panel | Dashboard |
| Dashboard | Listing, Learning Center, Kalender Event, DBR Scoring | — (titik agregasi akhir) |
| Admin Panel | RBAC | Semua modul (sebagai objek moderasi/konfigurasi) |
| SEO & Analytics | Listing, Profil Agen, Direktori Developer | — (lintas modul publik) |
| **Organization** *(baru)* | Authentication, RBAC (gate platform), Listing | Dashboard (statistik Organization) |
| **AI Assistant** *(baru)* | Authentication, RBAC (lintas role) | — (berdiri sendiri, tidak menjadi prasyarat modul lain) |

---

# 6. FOLDER STRUCTURE RECOMMENDATION

> **Perubahan v1.1 (ADR-001, Approved):** Struktur di bawah **tidak lagi** mencantumkan `/apps/api` sebagai opsi backend terpisah. Seluruh implementasi Route Handlers berada **di dalam** `apps/web`. Ini bukan penyederhanaan sementara — ini adalah struktur final yang mengikat, konsisten dengan larangan eksplisit menambahkan service Node.js terpisah (`technology-decisions.md` §6 poin 10).

```
/apps
  /web                        # Satu-satunya aplikasi — Next.js (publik + dashboard + admin + API)
    /app
      /(public)/               # SSR/SSG/ISR — homepage, search, listing detail, agent profile
      /(auth)/                 # login, register, forgot-password, verify-otp
      /(dashboard)/            # CSR privat — dashboard agen, noindex
      /(admin)/                # CSR privat — admin panel, noindex, role-gated
      /api/v1/                 # Route Handlers — BFF tipis, SATU-SATUNYA lapisan backend (ADR-001)
        /{modul}/route.ts       # auth, agents, listings, learning-center, events,
                                 # developer-projects, calculator (dbr), notifications, rbac, seo
      /api/cron/                # Vercel Cron Jobs & Postgres Database Webhook target (ADR-006, Approved)
        /{job}/route.ts          # reminder-scan, sitemap-regenerate, dst. — dilindungi CRON_SECRET
    /components
      /ui/                     # komponen dasar reusable — tanpa business logic (shadcn/ui)
      /features/{module}/      # komponen spesifik per modul
    /lib
      /api-client/             # wrapper fetch ke Route Handlers, typed (TanStack Query)
      /supabase/                # supabase client (browser + server, terpisah tegas)
      /services/                # business logic murni per modul (dipanggil dari Route Handler)
      /repositories/            # akses data terparameterisasi ke Postgres/Supabase (satu-satunya penyusun query)
      /middleware/               # auth.middleware, rbac.middleware, rate-limit.middleware
      /jobs/                     # trigger/consumer job asinkron (ADR-006, Approved — Vercel Cron + Postgres Trigger/Webhook)
      /rate-limit/                # helper cek/tulis rate_limit_log (ADR-018, Approved) — dipanggil rate-limit.middleware
      /maps/                     # MapsProvider abstraction layer (ADR-008, Approved) — leaflet-osm-provider, locationiq-provider, geoapify-provider
      /seo/                     # helper meta tag, JSON-LD, sitemap
      /validation/              # skema Zod — satu sumber kebenaran form + API (ADR-025)
      /errors/                  # error class & kode error terpusat (ADR-013)
    /hooks                      # custom hooks domain (useListingForm, useDbrCalculator)
    /styles
    /public

/supabase
  /migrations                   # SQL migration murni bernomor urut, sinkron ERD (ADR-004, ADR-022)
                                 # termasuk kolom generated search_vector + index GIN pada listings (ADR-005, Approved)
                                 # dan tabel rate_limit_log dengan index komposit (ADR-018, Approved)

/packages
  /shared-types/                 # TypeScript types/interfaces — single source of truth FE↔BE
  /region-data/                  # seed data wilayah Indonesia

/docs                            # seluruh dokumen sumber & turunan (Constitution, PRD, ERD, ADR, dsb.)
```

### Fungsi Masing-Masing Folder

| Folder | Fungsi |
|---|---|
| `app/(public)/` | Halaman yang wajib SSR/SSG/ISR — homepage, pencarian, detail listing, profil agen, detail proyek developer. Sumber data utama harus lewat Server Component. |
| `app/(auth)/` | Halaman otentikasi (login, register, verifikasi OTP, forgot/reset password). |
| `app/(dashboard)/` | Area privat agen — CSR, `noindex, nofollow`. |
| `app/(admin)/` | Area privat internal (Admin/Manager/Superadmin/Instructor) — CSR, `noindex, nofollow`, role-gated. |
| `app/api/v1/` | **Satu-satunya** lapisan backend — Route Handlers BFF tipis (ADR-001, Approved). Tidak ada lagi kondisi "jika arsitektur ini dipilih". |
| `components/ui/` | Komponen dasar reusable (Button, Input, Card, Modal) — tidak tahu domain bisnis (shadcn/ui). |
| `components/features/{module}/` | Komponen spesifik domain (ListingForm, DbrCalculator, AgentReviewCard). |
| `lib/api-client/` | Wrapper terhadap Route Handlers, typed sesuai `shared-types`, dikonsumsi TanStack Query (ADR-011). |
| `lib/supabase/` | Klien Supabase — terpisah tegas untuk browser (anon key) vs server (service role key, hanya dipakai di Route Handlers/Server Components). |
| `lib/services/` | Business logic murni (formula DBR, resolusi lifecycle status listing, validasi ownership) — dapat diuji unit tanpa HTTP layer. |
| `lib/repositories/` | Satu-satunya layer yang menyusun query — filter `granted_scope` (ownership) diterapkan konsisten di sini (ADR-003). |
| `lib/middleware/` | Auth → RBAC → rate-limit, dijalankan sebelum handler modul (lihat Bagian 8 & 11). |
| `lib/jobs/` | Trigger/consumer untuk proses asinkron — regenerasi sitemap, sync counter, notifikasi terjadwal. Mekanisme final (ADR-006, Approved): Vercel Cron Jobs (terjadwal) + Postgres Trigger/Database Webhook (event-driven), memanggil `app/api/cron/**`. |
| `lib/rate-limit/` | Helper cek & tulis status rate limiting ke tabel `rate_limit_log` (pola sliding window) — dipanggil `rate-limit.middleware` sebelum handler modul. Mekanisme final (ADR-018, Approved): Supabase Postgres Fase 1, migrasi terjadwal ke Upstash Redis Fase 2 berdasarkan kriteria ambang. |
| `lib/maps/` | Lapisan abstraksi `MapsProvider` (ADR-008, Approved v3) — implementasi konkret untuk LocationIQ (Primary), Geoapify (Approved Alternative/failover), dan rendering Leaflet+OpenStreetMap; memungkinkan migrasi provider (Growth/Scale/Enterprise) tanpa mengubah kontrak pemanggil. |
| `lib/seo/` | Helper generate meta tag, JSON-LD structured data, sitemap. |
| `lib/validation/` | Skema Zod — satu sumber kebenaran, dipakai form client & validasi server (ADR-025). |
| `lib/errors/` | Kelas error & kode error `SCREAMING_SNAKE_CASE` terpusat (ADR-013). |
| `hooks/` | Custom hooks domain — memisahkan logic dari presentasi komponen. |
| `supabase/migrations/` | File migrasi SQL bernomor urut, direview, reversible (ADR-004). |
| `packages/shared-types/` | Definisi tipe entitas tunggal — **dilarang** didefinisikan ulang di tempat lain. |

### Konvensi Modul Route Handler

Setiap modul di `app/api/v1/{modul}/` mengikuti pembagian tanggung jawab yang sama seperti pola backend konvensional, hanya lokasi fisiknya kini disatukan dalam `apps/web` (ADR-001):
- `route.ts` — menerima request HTTP, memanggil service, mengembalikan response envelope (setara "controller tipis").
- `lib/services/{modul}.service.ts` — business logic murni.
- `lib/repositories/{modul}.repository.ts` — akses data.
- `lib/validation/{modul}.schema.ts` — skema Zod untuk validasi input.
- Tipe spesifik modul merujuk `packages/shared-types` untuk entitas bersama.

---

# 7. DATABASE ARCHITECTURE

### Prinsip Utama (ADR-004, ADR-022 — Approved)
- **PostgreSQL** (di-host via Supabase) sebagai database relasional utama.
- **UUID sebagai primary key** di seluruh tabel (bukan auto-increment).
- **Soft delete** (`deleted_at`) wajib untuk **8 tabel**: `listings`, `users`, `developer_projects` (asli), ditambah `agent_profiles`, `agent_reviews`, `courses`, `events`, `developer_partners` (diperluas 4 Agustus 2026, `ADR-046`/OD-07 — lihat `decision-log.md` untuk alasan per-entitas).
- **Migration murni SQL** bernomor urut via Supabase CLI, tanpa ORM auto-sync ke production.
- **Konvensi penamaan (ADR-022):** `snake_case` untuk tabel (jamak)/kolom/enum; FK `{referenced_table_singular}_id`; index wajib sejak migrasi awal; UNIQUE index untuk seluruh kolom `slug`.

### Struktur Relasi Kunci
- **`roles` → `permissions` → `role_permissions`** membentuk model RBAC pivot — `role_permissions.granted_scope` menentukan apakah suatu role melihat data `own`, `all`, atau `none` (ADR-003).
- **Referensi wilayah** (`ref_provinces → ref_cities → ref_districts → ref_villages`) membentuk hierarki cascading yang dirujuk oleh `listings` dan `developer_projects` — **satu-satunya** pola lokasi yang diizinkan di sistem (kecuali `area_keyword` freetext terbatas).
- **`listings`** adalah entitas inti — terhubung ke `agent_id` (ownership), `developer_project_id` (nullable, untuk listing Primary), serta memiliki tabel anak 1:N (`listing_photos`, `listing_videos`, `listing_price_history`, `listing_leads`, `listing_views`) dan pivot N:N (`listing_amenities`). **(Baru v1.2, ADR-005 Approved)** `listings` juga memiliki kolom generated `search_vector` (tipe `tsvector`, digabung dari `title`/`description`/`area_keyword`) dengan index GIN, plus ekstensi `pg_trgm` aktif untuk fuzzy-match pada autocomplete — seluruhnya native Postgres, tanpa tabel/index eksternal.
- **(Baru v1.4, ADR-008 Approved v3)** `geocode_cache` — tabel standalone (bukan FK ke `listings`) yang menyimpan hasil geocoding/reverse geocoding (key: alamat ternormalisasi atau koordinat dibulatkan 5 desimal, value JSONB, provider, `expires_at` TTL ~90 hari) untuk menekan biaya panggilan LocationIQ/Geoapify berulang — murni Postgres, tanpa Redis. Tabel interim `api_rate_limits` (opsional, scoped khusus endpoint Maps) mengikuti pola serupa, tidak mendahului resolusi ADR-018.
- **(Baru v1.5, ADR-018 Approved)** `rate_limit_log` — tabel standalone yang menyimpan status rate limiting bertingkat untuk endpoint sensitif (login, register, forgot-password, submit form publik): kolom minimal `id`, `identifier` (IP/user_id/email), `action_type`, `attempt_count`, `window_start`, `blocked_until`, dengan index komposit `(identifier, action_type, window_start)`. Murni Postgres Fase 1 — tanpa Redis; kebijakan retensi baris (>7 hari) dibersihkan lewat mekanisme Vercel Cron yang sama dengan ADR-006, bukan job baru. Independen dari `geocode_cache`/`api_rate_limits` (ADR-008) yang scoped khusus endpoint Maps.
- **(Baru v1.6, ADR-026/027 Approved With Notes/Approved)** `organizations`, `organization_members`, `organization_invitations` — 3 tabel baru untuk Modul 12. `organization_invitations` menampung dua arah inisiasi (`leader_invite`/`agent_request`) dalam satu tabel via kolom `initiated_by_type`, menghindari duplikasi state machine. `listings` memperoleh 2 kolom aditif baru: `listing_origin` (immutable — ditegakkan berlapis: validasi aplikasi **dan** trigger Postgres `BEFORE UPDATE` `prevent_listing_origin_update()`, dikunci 3 Agustus 2026, lihat `architecture-decision-records.md` Update pada ADR-026 untuk SQL referensi) dan `listing_context` (mutable) + FK `organization_id` nullable; `audit_logs` memperoleh 1 kolom aditif `organization_id` nullable. UNIQUE index `organization_members(agent_id) WHERE status='active'` menegakkan batas 1 Organization aktif per agen di level database. **Skema ini belum dieksekusi ke migration fisik** — Approved secara arsitektur, menunggu paket sinkronisasi ERD v1.1 → v1.2 (lihat `CURRENT-PROJECT-STATE.md`).
- **(Baru v1.6, ADR-028 Approved With Notes)** `ai_providers` (tabel referensi, dikelola Admin) dan `agent_ai_connections` (koneksi API key per-user, terenkripsi at-rest) — 2 tabel baru untuk Modul 13. **Tidak ada tabel riwayat percakapan** — sesuai keputusan PII ADR-028, percakapan murni transient di state browser. UNIQUE index `agent_ai_connections(user_id, provider_id) WHERE status='active'` — satu user maksimal 1 koneksi aktif per provider, boleh sambungkan multi-provider berbeda. **Skema ini belum dieksekusi ke migration fisik**, sama seperti Organization di atas.
- **`developer_projects`** terhubung ke `developer_partners` (N:1) dan `ref_cities` (N:1), serta menjadi sumber `agent_project_claims` (N:N dengan `users`).
- **`agent_reviews`** menghubungkan `users` (sebagai agen yang direview & buyer yang mereview) dengan alur moderasi `pending → approved/rejected`.
- **`courses`** menjadi induk `course_lessons`, `quizzes` (dan turunannya), serta terhubung ke agen lewat pivot `enrollments` dan `certificates`.
- **`dbr_simulations`** terhubung ke `agent_id` dan opsional `listing_id`, dengan parameter global terpisah di `dbr_config`.
- **`url_redirects`** bersifat generik (`entity_type` + `entity_id`) untuk menaungi redirect dari `listings` maupun `developer_projects`.
- **Multi-tenancy (ADR-023, status direvisi 3 Agustus 2026):** skema tetap **single-tenant** — tidak ada kolom `tenant_id` di manapun. `organization_id` (ADR-026) adalah **grouping construct ringan** dalam database bersama, **bukan** implementasi `tenant_id`/isolasi penuh yang sebelumnya diantisipasi ADR-023. Kebutuhan multi-tenant klasik (white-label lintas agensi) tetap dicatat sebagai Future Decision terpisah, tidak terjawab oleh ADR-026 (lihat Bagian 20).

### Data Flow (Alur Data Tipikal)
```
Input form (client, validasi Zod — ADR-025)
   → Request ke Route Handler apps/web/app/api/v1/**/route.ts (ADR-001)
   → auth.middleware → rbac.middleware → rate-limit.middleware (ADR-018, Approved — lihat Bagian 8 & 11)
   → Service layer (business rule: ownership, status lifecycle) — lib/services/
   → Repository layer (query terparameterisasi ke Postgres via Supabase client) — lib/repositories/
   → [khusus listings] kolom search_vector diperbarui otomatis oleh Postgres (generated column, ADR-005 Approved) — tidak melalui job asinkron terpisah
   → Trigger/job asinkron (jika menyentuh counter denormalisasi atau slug → url_redirects; mekanisme ADR-006, Approved — Postgres Trigger/Database Webhook)
   → Response envelope standar ke client (ADR-012, ADR-013)
```

**Alur khusus rate limiting endpoint sensitif (`POST /auth/login`, `/auth/register`, `/auth/forgot-password`, submit form publik, ADR-018 Approved):**
```
Request masuk → Route Handler apps/web/app/api/v1/**
   → auth.middleware (jika endpoint memerlukan token) → rbac.middleware
   → rate-limit.middleware memanggil lib/rate-limit/ (Bagian 6)
      → Query rate_limit_log (Postgres) dengan identifier (IP/user_id/email) + action_type + window_start
      → Di bawah batas: lanjutkan ke handler, tulis/update attempt_count
      → Melampaui batas: hentikan request, kembalikan 429 Too Many Requests + header Retry-After (API-Specification-v1.1.md §0)
   → Handler modul (route.ts → service → repository) dijalankan hanya jika lolos rate limit
```
Tidak ada panggilan ke komponen infrastruktur eksternal (Redis/Upstash) di Fase 1 — seluruh pengecekan berada dalam satu roundtrip Postgres yang sama dengan database utama. Migrasi Fase 2 (Upstash Redis) akan mengganti implementasi `lib/rate-limit/` tanpa mengubah kontrak `rate-limit.middleware` bagi pemanggilnya.

**Alur khusus pencarian (`GET /properties/search`, `GET /properties/autocomplete`, ADR-005 Approved):**
```
Request query (filter kombinasi + keyword) → Route Handler apps/web/app/api/v1/properties/search/route.ts
   → rate-limit.middleware (endpoint publik)
   → Service layer menyusun query gabungan: filter kolom terindeks (kategori/harga/lokasi) + to_tsquery()/similarity() terhadap search_vector
   → Repository layer mengeksekusi query tunggal ke Postgres (index GIN search_vector + index komposit filter)
   → Response envelope standar (paginated, ADR-012)
```
Tidak ada langkah sinkronisasi index eksternal di Fase 1 — seluruh proses berada dalam satu roundtrip Postgres. Migrasi Fase 2 (Typesense) akan menambah langkah sinkronisasi index yang mekanismenya memakai Job Queue yang sudah dikunci ADR-006 (Vercel Cron Jobs + Postgres Trigger/Database Webhook, migrasi Fase 2 ke QStash).

**Alur khusus Maps/Geocoding (form lokasi listing M3, peta proyek developer M6, ADR-008 Approved v3):**
```
Input alamat/pin lokasi (client, Leaflet+OpenStreetMap) → Route Handler apps/web/app/api/v1/listings/**
   → rate-limit.middleware (scoped: Autocomplete 20/menit/IP, Geocode/Reverse Geocode 10/menit/IP — tabel interim api_rate_limits, independen dari mekanisme rate_limit_log ADR-018)
   → Service layer lib/maps/ (MapsProvider interface) cek geocode_cache (Postgres) lebih dulu
      → HIT: kembalikan hasil ter-cache, tanpa panggilan API eksternal
      → MISS: panggil LocationIQ (Primary) → jika gagal/timeout, failover ke Geoapify (Approved Alternative)
         → simpan hasil ke geocode_cache (TTL ~90 hari)
      → GAGAL total (kedua provider): degradasi ke Offline/Manual Address Fallback —
        (1) cascading dropdown province_id/city_id/district_id dari ref_provinces/cities/districts
            (data internal, tidak terpengaruh kegagalan API), (2) alamat freetext manual,
        (3) input koordinat manual/drag-pin di peta
   → Response envelope standar ke client (ADR-012, ADR-013)
```

**Alur khusus job asinkron/terjadwal (ADR-006 Approved):**
```
(a) Tugas terjadwal periodik — reminder H-1, scan listing stale, dst.:
Vercel Cron Jobs (jadwal tetap, dikonfigurasi vercel.json)
   → HTTP request ke Route Handler apps/web/app/api/cron/{job}/route.ts
   → Verifikasi header Authorization: Bearer CRON_SECRET
   → Service layer men-scan/batch-query Postgres (dengan pagination agar tidak melampaui
     batas eksekusi serverless ~10–60 detik)
   → Eksekusi aksi (kirim notifikasi via ADR-020, panggil Google Indexing API, dst.)

(b) Tugas event-driven instan — counter sync, sitemap regeneration saat publish:
Perubahan data (mis. INSERT ke listing_leads, UPDATE status listings)
   → Postgres Trigger (counter sync, sinkron di transaksi yang sama — tanpa round-trip HTTP)
     ATAU Database Webhook (sitemap regen — memanggil Route Handler apps/web/app/api/cron/**)
   → Response envelope standar (ADR-012), jika melalui Route Handler
```
Migrasi Fase 2 ke QStash (Upstash) — jika kriteria ambang tercapai — menggantikan Vercel Cron Jobs sebagai pemicu jadwal/event tanpa mengubah kontrak internal Service/Repository layer.

### Normalisasi
Skema mengikuti **normalisasi standar (3NF)** untuk entitas transaksional (listings, users, courses, dsb.), dengan **denormalisasi terkontrol** hanya pada kolom counter agregat (`listings.cta_click_count`, `agent_profiles.total_listings_sold/rented`) demi performa dashboard — diperbarui via trigger/scheduled job, bukan dihitung on-the-fly. Pengecualian: `agent_reviews.rating` rata-rata dihitung on-the-fly (volume kecil di Fase 1).

### Naming Convention Database
- Tabel: `snake_case`, bentuk jamak (`listings`, `agent_verification_documents`).
- Kolom: `snake_case` (`whatsapp_number`, `created_at`).
- Enum value: `snake_case` huruf kecil (`pending_review`, `fully_furnished`).
- Primary key: `id` (UUID) di seluruh tabel — bukan auto-increment integer.
- Foreign key: `{referenced_table_singular}_id` (`agent_id`, `listing_id`, `province_id`).

### Prinsip Arsitektural Tambahan
- **Migration murni SQL**, bukan ORM auto-sync di production.
- **Soft delete** (`deleted_at`) wajib untuk **8 tabel**: `listings`, `users`, `developer_projects`, `agent_profiles`, `agent_reviews`, `courses`, `events`, `developer_partners` (`ADR-046`, 4 Agustus 2026).
- **Index wajib sejak migrasi awal** pada kolom filter utama (status/kategori/lokasi/harga listing, komposit lead & simulasi DBR, unique index slug).
- **Enkripsi at-rest** untuk dokumen legalitas & field finansial DBR.
- **RLS aktif** di seluruh tabel ber-scope kepemilikan sebagai lapisan kedua setelah RBAC middleware.

---

# 8. AUTHENTICATION & AUTHORIZATION ARCHITECTURE

> **ADR terkait:** ADR-002 (Authentication Strategy), ADR-003 (Authorization & RBAC Strategy), ADR-024 (RBAC Role Model Scope) — seluruhnya **Approved**.

### Login Flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant FE as Frontend (Next.js)
    participant SB as Supabase Auth
    participant BE as Backend (Route Handler apps/web/api/v1 + RBAC Middleware)
    participant DB as PostgreSQL (roles/permissions)

    U->>FE: Submit login (email/password atau Google OAuth)
    FE->>SB: Verifikasi kredensial / id_token
    SB-->>FE: Hasil verifikasi (identitas terkonfirmasi)
    FE->>BE: Request penerbitan sesi platform
    BE->>DB: Ambil role_id user dari tabel users
    DB-->>BE: role_id + status akun
    BE-->>FE: JWT internal (access token + refresh token httpOnly cookie)
    FE-->>U: Redirect sesuai role (dashboard agen / admin panel / homepage)
```

> Login via Google untuk role `agent` **tetap** melalui alur `pending_review` (wajib upload dokumen legalitas) — OAuth tidak melewati approval manual. Untuk role `buyer`, akun langsung `active` setelah verifikasi.

### Session Management
- **Access token**: umur pendek (15–60 menit), dikirim via header `Authorization: Bearer`.
- **Refresh token**: umur panjang (30 hari), disimpan sebagai **httpOnly secure cookie** (bukan localStorage) untuk mitigasi XSS.
- **Logout** (`/auth/logout`) menginvalidasi 1 device; **logout-all** (`/auth/logout-all`) menginvalidasi seluruh sesi. **Catatan v1.5:** mekanisme blocklist/state refresh token lintas-instance kini final mengikuti mekanisme **ADR-018 (Caching Strategy, Approved)** — tabel `rate_limit_log`-style di Postgres (Fase 1), migrasi terjadwal ke Upstash Redis di Fase 2 jika kriteria ambang tercapai. Status `// TODO: migrasi ke Redis jika ADR-018 memilih Redis` **sudah dapat dihapus** dari kode.

### Token Strategy
JWT internal platform diterbitkan **setelah** verifikasi identitas berhasil (baik via password/OTP maupun Google OAuth) — payload token membawa `user_id` dan `role_id`; **role/permission tidak disimpan statis di token** secara permanen — setiap request tetap dicek ulang ke `role_permissions` di backend (memungkinkan perubahan permission berlaku real-time tanpa perlu re-login).

### Role Based Access Control (RBAC)

```mermaid
flowchart TD
    A["Request masuk ke Route Handler (apps/web/app/api/v1)"] --> B{"Token valid?"}
    B -- Tidak --> C["401 Unauthorized"]
    B -- Ya --> D["Identifikasi role_id dari token"]
    D --> E{"role_id = superadmin?"}
    E -- Ya --> F["Bypass — akses penuh diizinkan"]
    E -- Tidak --> G["Cek role_permissions:\nmodule_code + action_code"]
    G --> H{"Permission ditemukan?"}
    H -- Tidak / none --> I["403 Forbidden\nFORBIDDEN_ROLE_ACCESS"]
    H -- Ya, granted_scope=own --> J["Filter query (repository layer):\nWHERE agent_id = current_user.id"]
    H -- Ya, granted_scope=all --> K["Query tanpa filter kepemilikan\n(tetap lolos permission check)"]
    J --> L["Jalankan service layer modul"]
    K --> L
    F --> L
    L --> M{"Target resource milik user lain\n& bukan scope all?"}
    M -- Ya --> N["404 Not Found\n(disamarkan, bukan 403)"]
    M -- Tidak --> O["200/201 — Response sukses"]
```

### Permission Model
- **Struktur:** `roles` → `permissions` (`module_code + action_code`, unik) → `role_permissions` (pivot dengan `granted_scope`: `own`/`all`/`none`, dan `editable_by_role_code`).
- **Role bernama (ADR-024):** 7 role dengan akun — `superadmin`, `manager`, `admin`, `instructor`, `agent`, `developer_partner`, `buyer` — ditambah `guest` tanpa baris `roles`.
- **Superadmin** selalu bypass (short-circuit `true`) — tidak bergantung pada data `role_permissions` yang mungkin salah konfigurasi.
- **Manager** selalu `granted_scope = 'all'` untuk modul relevan — **tidak ada** mode scoped tim/wilayah (final, ADR-024).
- **Manager** hanya boleh `UPDATE` baris `role_permissions` di mana `editable_by_role_code` memuat kode role-nya (hanya berlaku untuk baris `role_id = agent`).
- **Hard rule ownership Agen** diterapkan **terpisah** dari matriks permission, di layer repository — bahkan jika `granted_scope` salah konfigurasi menjadi `all` untuk Agen, backend tetap menolak (403) `UPDATE`/`DELETE` terhadap data bukan miliknya.

### Protected Routes
- `(dashboard)` — hanya diakses user terautentikasi dengan role `agent` (atau internal roles untuk keperluan tertentu); `noindex, nofollow`.
- `(admin)` — hanya diakses `superadmin`/`manager`/`admin`/`instructor` (Instructor terbatas ke sub-menu Learning Center); role-gated per sub-menu, menu tidak relevan **disembunyikan penuh**.
- `(public)` — dapat diakses siapa pun (Guest), tanpa proteksi.

### Middleware
Urutan middleware untuk setiap Route Handler terproteksi (`app/api/v1/**/route.ts`), dijalankan **di dalam aplikasi yang sama** (ADR-001):
1. **auth.middleware** — validasi JWT, tolak jika invalid/expired (401).
2. **rbac.middleware** — cek permission `module_code+action_code`, resolusi `granted_scope`, terapkan filter ownership otomatis.
3. **organization-rbac.middleware** *(baru, ADR-027, khusus endpoint `/organizations/*` & Organization Listing)* — dijalankan **setelah** `rbac.middleware` lolos; mengecek `organization_members.role` (Leader/Member) + `organization_members.organization_id` terhadap `listings.organization_id`. Lapisan kedua yang **independen** dari `permissions`/`role_permissions`/`scope_type` platform — tidak menambah nilai `scope_type` baru (lihat subsection Organization-Scoped Authorization di bawah).
4. **rate-limit.middleware** — terapkan batas request sesuai kategori endpoint (publik/authenticated/sensitif). Mekanisme penyimpanan state lintas-instance final (ADR-018, Approved): tabel `rate_limit_log` di Supabase Postgres, lihat Bagian 6 (`lib/rate-limit/`) & 14.
5. **Handler modul (route.ts → service → repository)** — dijalankan hanya setelah seluruh middleware di atas lolos.

### Organization-Scoped Authorization *(baru, ADR-027 — 3 Agustus 2026)*
- **Prinsip inti:** otorisasi Organization **tidak mengubah/memperluas** `permissions.scope_type` yang sudah dikunci ADR-024 hanya 3 nilai (`all`/`own`/`none`) — dibangun sebagai lapisan kedua yang berdiri sendiri, dievaluasi **setelah** gate RBAC platform lolos.
- **Resolusi hak CRUD Organization Listing:** Leader → CRUD penuh listing Organization-nya; Member → CRUD listing miliknya sendiri + Read-only listing anggota lain (tanpa akses draft/data internal); Leader hanya mendapat **statistik** untuk Personal Listing member (tanpa akses edit/draft).
- **Bukan amandemen ADR-024** — cakupan Manager (`granted_scope='all'`, tanpa mode "scoped tim/wilayah") tetap berlaku 100% tanpa perubahan; Organization adalah domain otorisasi yang sama sekali terpisah dari RBAC platform.

---

# 9. API ARCHITECTURE

> **ADR terkait:** ADR-012 (API Architecture) — **Approved**, lokasi eksekusi terkunci final ke Route Handlers via ADR-001 (Approved).

### API Design Standard
- **Base URL & versioning:** `https://<domain>.id/api/v1` — diimplementasikan sebagai Route Handlers di `apps/web` (bukan subdomain/service terpisah); breaking change wajib naik versi (`/v2`), kontrak `/v1` yang live tidak boleh diubah.
- **Style:** REST murni dengan autentikasi JWT Bearer.

### REST Convention
- Resource dalam bentuk jamak, `kebab-case` (`/developer-projects`, `/agents/{id}/reviews`).
- Method HTTP standar: `GET` (read), `POST` (create/aksi), `PUT`/`PATCH` (update), tidak ada `DELETE` fisik untuk entitas ber-soft-delete (gunakan endpoint status/aksi, mis. `PUT /listings/{id}/archive` — bukan `DELETE`).

### Naming Convention
- Endpoint: `kebab-case`, resource jamak.
- Query param: `snake_case` (`?property_type=rumah&price_min=...`).
- JSON field request/response: `snake_case`, konsisten dengan kolom database.

### Error Response Standard (ADR-013)
```json
{
  "success": false,
  "error": {
    "code": "LISTING_NOT_FOUND",
    "message": "Listing tidak ditemukan atau Anda tidak memiliki akses.",
    "details": null
  }
}
```
- Kode error `SCREAMING_SNAKE_CASE`, didaftarkan di `packages/shared-types/error-codes.ts`.
- HTTP status: 400 (validasi format), 401 (token invalid), 403 (RBAC ditolak, hanya untuk kasus non-ownership), 404 (data tidak ada **atau** privat milik user lain), 409 (konflik), 422 (validasi bisnis gagal), 429 (rate limit).

### Pagination
Standar di semua endpoint list: `?page=1&per_page=20&sort=created_at&order=desc`, response menyertakan `meta: { page, per_page, total }`.

### Filtering
Filter spesifik per endpoint (mis. `property_type`, `price_min`/`price_max`, `city_id`) — filter geografis **wajib** menerima ID referensi (`province_id`/`city_id`/`district_id`), bukan nama teks bebas; pemetaan slug URL human-readable ke ID adalah tanggung jawab frontend. **Catatan (ADR-005, Approved):** mesin di balik `/properties/search` & `/properties/autocomplete` dikunci final sebagai PostgreSQL Full-Text Search + pg_trgm untuk Fase 1, dengan migrasi terjadwal ke Typesense di Fase 2 berdasarkan kriteria ambang eksplisit (volume/latensi/keluhan relevansi) — kontrak endpoint (bentuk request/response) tetap seperti didefinisikan di `API-Specification-v1.1.md` §3 dan **tidak berubah** saat migrasi Fase 2 terjadi.

### Sorting
Query param `sort` + `order` (`asc`/`desc`) — default `created_at desc` kecuali endpoint pencarian listing yang mendukung sort tambahan (harga, popularitas berdasarkan `cta_click_count`).

### Versioning
Versioning di path (`/api/v1`, `/api/v2`) — perubahan yang breaking (mengubah shape response, menghapus field) wajib versi baru; penambahan field baru yang non-breaking boleh tetap di versi yang sama.

### Aturan Tambahan
- **Response envelope standar wajib** (`success`, `data`, `meta` / `error`) di seluruh endpoint.
- **Idempotency** untuk endpoint rawan double-click (`POST /listings/{id}/cta-click`, `POST /courses/{id}/enroll`) via `UNIQUE` constraint DB atau idempotency key.
- **Rate limiting**: publik 60 req/menit/IP, authenticated 300 req/menit/user, endpoint sensitif 5 req/menit/IP+identifier.
- **Batas eksekusi serverless (baru v1.1, konsekuensi ADR-001):** seluruh Route Handler wajib selesai dalam batas eksekusi fungsi serverless Vercel (~10–60 detik tergantung paket). Endpoint yang berpotensi long-running (bulk processing, batch export) **wajib** diarahkan ke job asinkron (Bagian 6 `lib/jobs/`, ADR-006, Approved — Vercel Cron Jobs + Postgres Trigger/Database Webhook), bukan dijalankan langsung di Route Handler.

---

# 10. FRONTEND ARCHITECTURE

### Component Structure
Dua kategori komponen dipisah tegas:
- **`components/ui/`** — komponen dasar (Button, Input, Card, Modal) — reusable lintas modul, tanpa pengetahuan domain bisnis (shadcn/ui, ADR-021).
- **`components/features/{module}/`** — komponen spesifik domain (ListingForm, DbrCalculator, AgentReviewCard) — boleh memanggil hooks domain & memakai komponen `ui/`.

### Smart vs Presentational Components
- **Smart (container) components**: bertanggung jawab atas data-fetching, state, dan pemanggilan business logic — biasanya berada di level `page`/`feature` root.
- **Presentational components**: menerima data via props, fokus pada rendering UI — tidak memanggil API atau menyimpan state bisnis. Business logic (kalkulasi DBR, validasi ownership) **tidak boleh** berada di komponen presentasi — wajib di `lib/services/`.

### State Management *(diperbarui v1.1 — ADR-011, Approved)*
- **Server state** (data dari Route Handlers): **TanStack Query**, khusus untuk route group `(dashboard)`/`(admin)` (CSR). Halaman `(public)` **tidak** memakai TanStack Query — mengandalkan Server Component fetch langsung.
- **UI state** (toggle modal, step wizard, filter lokal): **Zustand** — satu store per domain UI (mis. `useListingFormStore`, bukan satu store raksasa lintas domain).
- **SWR dan Redux/Redux Toolkit dilarang eksplisit** (`technology-decisions.md` §6 poin 1 & 5) — tidak ada lagi opsi "pilih salah satu secara konsisten" seperti pada versi dokumen ini sebelumnya (v1.0).
- **Larangan eksplisit (ADR-015 di Bagian 10 dokumen ADR):** dilarang mencampur Server Component fetch dan TanStack Query dalam satu halaman sebagai dua sumber kebenaran data yang berbeda untuk data yang sama.

### Routing
Next.js App Router dengan route groups: `(public)`, `(auth)`, `(dashboard)`, `(admin)` — masing-masing punya `layout.tsx` sendiri untuk mengatur meta robots dan proteksi akses.

### Lazy Loading
Komponen berat non-kritis (peta interaktif, chart dashboard, widget kompleks) di-lazy-load (`next/dynamic`) — tidak memblokir render halaman utama; mendukung target INP < 200ms.

### Error Boundary
React Error Boundary diterapkan **per route group/segmen** — kegagalan satu widget dashboard tidak mematikan seluruh halaman.

### Form Validation
Skema Zod (satu sumber, sama dengan backend — ADR-025) diintegrasikan dengan **React Hook Form** — validasi real-time client, validasi ulang wajib di server sebelum tulis DB. Field lokasi cascading (province → city → district) divalidasi keberadaannya, bukan hanya format.

### Reusable Components
Sebelum membuat komponen baru, cek `components/ui/` — jika fungsi serupa sudah ada, pakai ulang (dengan props tambahan jika perlu) daripada duplikasi.

---

# 11. BACKEND ARCHITECTURE

> **Backend Pattern (ADR-001, Approved, 27 Juli 2026):** Backend proyek adalah **Next.js Route Handlers sebagai BFF tipis**, berjalan **di dalam aplikasi `apps/web` yang sama** dengan frontend, terintegrasi langsung ke Supabase (Auth, Postgres, Storage) via service role key server-side. **Tidak ada** service backend Node.js terpisah (NestJS/Express) untuk cakupan proyek saat ini. Perubahan atas keputusan ini hanya sah melalui ADR baru yang secara eksplisit men-supersede ADR-001 — bukan keputusan sepihak di kode atau dokumen turunan.

### Alasan Keputusan (ringkasan dari ADR-001 — lihat `architecture-decision-records.md` untuk detail penuh)
1. Selaras penuh dengan 5 ADR Approved lain yang sudah mengasumsikan integrasi rapat Supabase+Vercel (ADR-002, ADR-004, ADR-009, ADR-010, ADR-021).
2. Kompatibilitas struktural dengan **Bolt.new** (satu aplikasi full-stack Node/Next.js dalam WebContainer).
3. Tidak ada bukti kebutuhan bisnis di PRD yang mensyaratkan proses long-running/heavy-compute — modul terberat (DBR, RBAC) adalah operasi CPU ringan berbasis query dan formula.
4. Meminimalkan risiko drift asumsi arsitektur antar sesi AI Coding Assistant.
5. Kompleksitas operasional & biaya paling rendah untuk tim kecil di tahap MVP.

### Konsekuensi yang Wajib Diperhatikan
- Proyek terikat pada **batas eksekusi fungsi serverless Vercel** (~10–60 detik tergantung paket) — proses berat (bulk processing, batch job) wajib diarahkan ke Job Queue (ADR-006, Approved: Vercel Cron Jobs + Postgres Trigger/Database Webhook, migrasi Fase 2 ke QStash), bukan dipaksakan ke Route Handler.
- Migrasi ke service terpisah di masa depan (bila kebutuhan skalabilitas berubah signifikan, dikonfirmasi data produksi) memerlukan ekstraksi logic dari Route Handlers — dapat dilakukan bertahap karena logic tetap TypeScript murni (ADR-025), namun tetap pekerjaan migrasi non-trivial.
- Konvensi API (ADR-012, bentuk kontrak) tidak berubah — hanya lokasi eksekusinya yang terkunci.

### Business Logic Layer
Kalkulasi dan aturan bisnis (formula DBR, resolusi lifecycle status listing, validasi ownership) berada di **service layer** (`lib/services/{modul}.service.ts`) — dapat diuji unit tanpa bergantung pada HTTP layer atau UI.

### Service Layer
Setiap modul backend (`app/api/v1/{modul}/` + `lib/services|repositories|validation`) mengikuti struktur konsisten:
- `route.ts` — menerima request, memanggil service, mengembalikan response envelope (setara "controller tipis").
- `{modul}.service.ts` — business logic murni.
- `{modul}.repository.ts` — akses data (query terparameterisasi ke Postgres/Supabase client).
- `{modul}.schema.ts` — skema Zod untuk validasi input.
- `{modul}.types.ts` — tipe spesifik modul (merujuk `packages/shared-types` untuk entitas bersama).

**Catatan Search Service (baru v1.2, ADR-005 Approved):** `lib/services/listings.service.ts` dan `lib/repositories/listings.repository.ts` menaungi juga logic `/properties/search` & `/properties/autocomplete` — **tidak ada service/repository terpisah untuk search** di Fase 1, karena mesin pencari (Postgres FTS + pg_trgm) berjalan sebagai query terhadap tabel `listings` yang sama. Status `// TODO: menunggu resolusi ADR-005` yang sebelumnya menandai bagian ini **sudah dapat dihapus** dari kode. Migrasi Fase 2 ke Typesense (jika kriteria ambang tercapai) akan memperkenalkan client/adapter Typesense terpisah di `lib/services/` tanpa mengubah kontrak `listings.repository.ts` untuk pemanggil lain.

**Catatan Rate Limiting Service (baru v1.5, ADR-018 Approved):** Logic cek/tulis status rate limiting berada di `lib/rate-limit/` (Bagian 6), dipanggil oleh `rate-limit.middleware` — **bukan** business logic modul, sehingga tidak masuk `lib/services/{modul}.service.ts` mana pun. Query terhadap tabel `rate_limit_log` memakai repository pattern yang sama dengan modul lain (index komposit `identifier`+`action_type`+`window_start`). Status `// TODO: menunggu resolusi ADR-018` **sudah dapat dihapus** dari kode. Migrasi Fase 2 ke Upstash Redis (jika kriteria ambang tercapai) akan mengganti implementasi internal `lib/rate-limit/` tanpa mengubah kontrak `rate-limit.middleware` bagi pemanggilnya.

### Repository Pattern
Digunakan untuk memisahkan akses data dari business logic — repository **satu-satunya** layer yang menyusun query SQL/Supabase client, sehingga filter `granted_scope` (ownership) diterapkan konsisten di satu tempat, bukan tersebar di banyak Route Handler.

### Middleware
Urutan wajib: `auth.middleware` → `rbac.middleware` → `rate-limit.middleware` (ADR-018, Approved) → `route.ts` (lihat Bagian 8).

### Validation
Zod schema yang sama dengan frontend dipakai untuk validasi ulang di server (ADR-025) — **backend tidak pernah mempercayai validasi frontend**; seluruh endpoint mutating (`POST`/`PUT`/`PATCH`) wajib validasi ulang.

### Logging (ADR-014)
Structured logging (JSON) dengan field minimal `timestamp`, `level`, `request_id`, `user_id`, `module`, `action`, `message`. Level: `error`/`warn`/`info`/`debug` (debug hanya non-production). Audit log bisnis (`audit_logs`) terpisah dari log teknis — mencatat aksi sensitif dan tidak dapat dihapus/dirotasi.

### Error Handling (ADR-013)
Error dikembalikan lewat envelope standar; detail internal (stack trace, query SQL) **tidak pernah** bocor ke response API — hanya masuk log server dengan `request_id` yang sama dikembalikan ke client untuk tracing.

---

# 12. FILE STORAGE ARCHITECTURE

> **ADR terkait:** ADR-009 (Storage Strategy), ADR-019 (File Upload Strategy) — keduanya **Approved**.

### Image Upload
- Foto listing: minimal 3 wajib sebelum submit review, format JPEG/PNG/WebP, upload via `POST /listings/{id}/media`.
- Kompresi sisi client via **browser-image-compression** sebelum upload (ADR-019) — mengurangi bandwidth & beban Route Handler sebelum file mencapai Supabase Storage.

### File Upload (Dokumen)
Dokumen legalitas agen (KTP/NPWP/sertifikasi) diupload ke bucket privat terpisah, **wajib** dienkripsi at-rest, **tidak pernah** melalui CDN publik.

### Storage Provider dan Struktur (ADR-009)
**Supabase Storage** adalah provider resmi — terintegrasi langsung dengan Supabase Auth/RLS untuk kontrol akses signed URL, tanpa vendor CDN tambahan di MVP. Bucket dipisah tegas berdasarkan sensitivitas & audiens:

| Bucket | Isi | Akses |
|---|---|---|
| `listing-photos` | Foto listing | Publik, CDN |
| `listing-videos` | Video/virtual tour listing | Publik, CDN |
| `developer-project-media` | Materi marketing proyek developer | Publik, CDN |
| `agent-verification-documents` | KTP/NPWP/sertifikasi agen | Privat, signed URL berumur pendek untuk role review |

> **Evaluasi masa depan:** Cloudinary/ImageKit/AWS S3+CloudFront dicatat di `technology-decisions.md` Bagian 8 (Future Evaluation) sebagai lapisan transformasi gambar tambahan **jika** kebutuhan resize dinamis multi-varian/video streaming melampaui kapasitas Supabase Storage + kompresi client-side — bukan kebutuhan aktif MVP.

### Naming Convention
Nama file di storage memakai pola `{entity_id}/{timestamp}-{slug_original_filename}.{ext}` per bucket, menghindari collision tanpa membocorkan informasi sensitif di path publik.

### Compression & Optimization
- Kompresi client-side wajib sebelum upload (`browser-image-compression`, ADR-019); transformasi lanjutan (resize/WebP/AVIF) memakai kapabilitas bawaan Supabase Storage/`next/image` — bukan CDN gambar khusus di MVP (lihat evaluasi masa depan di atas).
- Lazy-loading untuk gambar di luar viewport awal.
- `alt_text` wajib terisi (auto-generate dari template jika kosong) untuk SEO gambar.
- Validasi tipe file **di server** (magic bytes/MIME type sesungguhnya) — bukan hanya ekstensi nama file client, mencegah upload file executable menyamar sebagai gambar.

---

# 13. NOTIFICATION ARCHITECTURE

> **ADR terkait:** ADR-007 (Email Provider), ADR-020 (Notification Strategy) — keduanya **Approved**. ADR-026 (Organization Model) dan ADR-028 (AI Assistant Integration) menambah tipe notifikasi baru, lihat Trigger Utama di bawah.

### Kanal

| Kanal | Keterangan |
|---|---|
| **In-App** | Notifikasi tersimpan di tabel `notifications` (sumber kebenaran), ditampilkan di dashboard user terkait — **selalu aktif**. |
| **Email** | **Resend + React Email** (ADR-007) — untuk OTP, status approval, reminder. Bukan untuk marketing/bulk email. |
| **Push Notification / WhatsApp Business API** | Belum tersedia di MVP — kemungkinan channel tambahan fase lanjutan (ADR-020 Notes). |

### Prinsip Arsitektural (ADR-020)
- Tabel `notifications` ditulis lewat **satu service terpusat** — bukan ditulis langsung dari banyak tempat, menghindari drift format/state.
- Notifikasi **selalu personal per user** — tidak ada notifikasi lintas-scope yang bocor ke role tanpa akses terkait.
- Realtime subscription (jika dipakai) wajib difilter RLS per `user_id`.
- Pengiriman notifikasi terjadwal/batch (reminder, expiry) ditangani job asinkron — bukan dikirim sinkron di request path utama Route Handler (lihat batas eksekusi serverless, Bagian 9). Mekanisme job final (ADR-006, Approved): Vercel Cron Jobs (terjadwal) + Postgres Trigger/Database Webhook (event-driven).
- Data ke GA4/GTM dari event notifikasi **tidak boleh** menyertakan PII.

### Trigger Utama
- **Approval status** — perubahan status registrasi agen atau listing (approved/rejected/suspended).
- **Listing akan expired** — reminder sebelum masa aktif listing habis.
- **Sertifikat baru terbit** — setelah agen lulus kursus Learning Center.
- **Reminder event** — sebelum event yang di-RSVP berlangsung.
- **Lead baru** — saat ada klik CTA WhatsApp baru pada listing agen.
- **Update proyek developer** — perubahan data resmi yang relevan bagi agen yang mengklaim proyek tsb.
- **(Baru, ADR-026) Organization** — invite diterima/ditolak, join request masuk/disetujui/ditolak/dibatalkan (termasuk auto-cancel sistem), member join/keluar, Organization ditutup.
- **(Baru, ADR-028) AI Assistant** — koneksi provider invalid/terputus ("Koneksi [Provider] terputus, silakan hubungkan ulang") — dipicu otomatis saat request ke provider gagal karena key tidak lagi valid, bukan silent failure. Tidak ada notifikasi terkait isi percakapan (tidak pernah dipersist).

---

# 14. SECURITY ARCHITECTURE

> **ADR terkait:** ADR-002, ADR-003, ADR-009, ADR-017, ADR-018, ADR-019, ADR-027, ADR-028 — seluruhnya **Approved**/**Approved With Notes**. ADR-017 (Security Strategy) adalah dimensi paling matang di seluruh dokumentasi proyek (skor 88/100 di `foundation-validation-report.md`).

| Aspek | Penerapan |
|---|---|
| **Authentication** | Supabase Auth + JWT internal (ADR-002); password hashing adaptif (bcrypt/argon2); OAuth2 Google diverifikasi server-side. |
| **Authorization** | RBAC middleware (lapisan pertama, dijalankan di dalam Route Handler `apps/web`) + RLS Supabase (lapisan kedua) — ADR-003; hard rule ownership `agent_id` di kode repository, terpisah dari matriks permission. **(Baru, ADR-027)** Organization-scoped authorization sebagai lapisan ketiga independen, khusus endpoint `/organizations/*` — lihat Bagian 8. |
| **Input Validation** | Zod di client & server (ADR-025); backend tidak pernah percaya validasi client; field lokasi divalidasi terhadap keberadaan baris referensi. |
| **SQL Injection Prevention** | Query terparameterisasi lewat repository layer/Supabase client — tidak ada raw string concatenation SQL. |
| **XSS Prevention** | Refresh token di httpOnly cookie (bukan localStorage); output rendering React secara default sudah escape konten — hindari `dangerouslySetInnerHTML` tanpa sanitasi. |
| **CSRF** | Mitigasi via SameSite cookie policy pada refresh token cookie + validasi origin pada request state-changing. |
| **Rate Limiting** | Publik 60/menit/IP, authenticated 300/menit/user, endpoint sensitif (auth/OTP) 5/menit/IP+identifier. Mekanisme penyimpanan state final (**ADR-018, Approved**): tabel `rate_limit_log` di Supabase Postgres (Fase 1), migrasi terjadwal ke Upstash Redis di Fase 2 berdasarkan kriteria ambang — lihat Bagian 15. **Khusus endpoint Maps (ADR-008, Approved v3):** kebijakan scoped independen — Autocomplete 20/menit/IP, Geocode/Reverse Geocode 10/menit/IP — via tabel interim `api_rate_limits` di Postgres, independen dari mekanisme ADR-018. **Khusus endpoint AI Assistant (ADR-028):** reuse `rate_limit_log` yang sama — tidak ada tabel/mekanisme rate limiting baru. |
| **File Upload Security** | Validasi magic bytes/MIME type di server (ADR-019); bucket privat terpisah untuk dokumen sensitif (ADR-009); signed URL berumur pendek. |
| **Environment Variables** | `SCREAMING_SNAKE_CASE`, dikelompokkan per domain, `.env` tidak pernah di-commit; `.env.example` tanpa value rahasia; dikelola per environment (preview/production) di dashboard Vercel (ADR-010). Termasuk `LOCATIONIQ_API_KEY`/`GEOAPIFY_API_KEY` (ADR-008) — server-side only, tanpa key terpisah untuk client karena tiles OpenStreetMap tidak memerlukan API key. **AI Assistant (ADR-028) tidak menambah environment variable baru** — API key provider disimpan per-user di `agent_ai_connections` (terenkripsi at-rest di database, bukan `.env`), bukan credential tingkat-aplikasi. |
| **Secrets Management** | Key berakhiran `_SECRET`/`_SERVICE_ROLE_KEY`/`*_SERVER` dilarang di-bundle ke client-side JavaScript — audit build output berkala (relevan khusus karena backend & frontend kini berada dalam satu aplikasi, ADR-001). `LOCATIONIQ_API_KEY`/`GEOAPIFY_API_KEY` mengikuti aturan yang sama — seluruh panggilan geocoding wajib server-side (ADR-008). **Rate Limiting (ADR-018, Approved) tidak menambah secret/API key baru** — seluruhnya memakai koneksi Supabase yang sudah ada, berbeda dengan Maps yang menambah dua key server-side. **(Baru, ADR-028)** `agent_ai_connections.encrypted_api_key` — API key AI provider milik agen, terenkripsi at-rest (pola sama `agent_verification_documents.file_url`), **tidak pernah** dikirim ke client-side; seluruh request chat diproksi lewat backend. **1 koneksi aktif per provider per user** (bukan per akun — multi-provider diizinkan); ganti key = replace langsung tanpa disconnect. **Saat disconnect (Update 2026-08-03):** `encrypted_api_key` **dihapus permanen (hard-delete)**, bukan soft-delete — berbeda sengaja dari pola soft-delete entitas bisnis lain (ADR-004); metadata koneksi (provider, `connected_at`/`disconnected_at`) dipertahankan di `audit_logs` sebagai jejak audit. |
| **Audit Log** | `audit_logs` mencatat siapa-kapan-apa untuk aksi sensitif (approval, moderasi, perubahan role/permission/config) — tidak dapat dihapus kecuali retensi resmi terjadwal (ADR-014). **(Baru, ADR-026)** Diperluas mencakup `entity_type` baru: `organization`, `organization_member`, `organization_invitation` — kolom `organization_id` nullable ditambahkan (halaman Activity Timeline adalah view terhadap tabel ini, bukan tabel terpisah). |
| **Monitoring/Error Tracking** | **Sentry** (`@sentry/nextjs`, ADR-015) — data sensitif (`net_income`, KTP/NPWP, token JWT penuh) dilarang masuk breadcrumb/context. **(Baru, ADR-028)** Isi percakapan AI Assistant **tidak pernah** dikirim ke Sentry breadcrumb/context — konsisten prinsip tidak dipersist di mana pun. |

**Prinsip tambahan:**
- Enkripsi at-rest wajib untuk dokumen legalitas agen dan field finansial DBR.
- Data privat milik user lain disamarkan sebagai 404 (bukan 403) untuk mencegah enumerasi resource.
- Minimal 1 akun Superadmin aktif dijamin di level aplikasi (constraint non-SQL).
- PII tidak masuk ke log teknis maupun Analytics/GTM/GA4.
- Cookie consent + Google Consent Mode aktif sebelum tracking non-esensial berjalan penuh.

---

# 15. PERFORMANCE STRATEGY

| Strategi | Target/Penerapan |
|---|---|
| **Caching (edge/CDN)** | Cache halaman publik edge-level via SSR/ISR (ADR-021) + edge caching bawaan Vercel (ADR-010) — **sudah tercakup inheren**, tidak memerlukan keputusan terpisah. |
| **Caching (level aplikasi)** | **Final (ADR-018, Approved)** — Supabase Postgres (tabel `rate_limit_log`, sliding window) untuk rate limiting endpoint sensitif di Fase 1, tanpa Redis; migrasi terjadwal ke Upstash Redis di Fase 2 berdasarkan kriteria ambang eksplisit (volume request, load database, kebutuhan cache generik). |
| **Caching (Geocoding/Maps)** *(baru v1.4)* | **Final (ADR-008, Approved v3)** — tabel `geocode_cache` di Postgres (TTL ~90 hari) untuk geocoding & reverse geocoding; Autocomplete memakai debounce 300–500ms client-side + cache edge jangka pendek Next.js. Independen dari mekanisme ADR-018 (Rate Limiting/Cache aplikasi umum), tidak menambah Redis. |
| **Image Optimization** | `next/image` + transformasi Supabase Storage (resize, WebP/AVIF), lazy-loading di luar viewport awal, kompresi client-side (ADR-019). |
| **Lazy Loading** | Komponen berat (peta interaktif, chart) di-lazy-load; skrip non-kritis dimuat setelah interaksi utama. |
| **Pagination** | Wajib di semua endpoint list — tidak ada endpoint mengembalikan seluruh baris tanpa limit. |
| **Virtualization** | Direkomendasikan untuk daftar panjang di UI (mis. tabel admin dengan ratusan baris, TanStack Table) agar rendering tetap ringan. |
| **Database Index** | Index wajib sejak migrasi awal pada kolom filter utama (lihat Bagian 7, ADR-022) — bukan ditambahkan belakangan. |
| **Query Optimization** | Counter agregat dibaca dari kolom denormalisasi, bukan `COUNT()` on-the-fly; query list selalu paginated dan terindeks. |
| **Bundle Optimization** | Tree-shaking bawaan Next.js; hindari import library besar secara penuh jika hanya butuh sebagian fungsi. |
| **Code Splitting** | Otomatis per-route via App Router; komponen client berat displit lebih lanjut via `next/dynamic`. |
| **Serverless Execution Budget** *(baru v1.1)* | Route Handler wajib selesai dalam batas eksekusi Vercel (~10–60 detik) — proses berat diarahkan ke job asinkron (ADR-006, Approved: Vercel Cron Jobs + Postgres Trigger/Database Webhook), bukan dipaksakan sinkron. |
| **Rate Limiting Migration Trigger** *(baru v1.5, ADR-018 Approved)* | Migrasi ke Upstash Redis dipicu saat salah satu tercapai: (a) volume request endpoint sensitif >10.000/menit gabungan, (b) query `rate_limit_log` >15% load database utama, atau (c) kebutuhan cache aplikasi generik muncul dari modul lain. Ditinjau setiap akhir kuartal pasca-launch. |

**Target Core Web Vitals (wajib untuk seluruh halaman publik):**

| Metrik | Target |
|---|---|
| LCP | < 2.5 detik |
| CLS | < 0.1 |
| INP | < 200ms |
| TTFB | < 600ms |
| Load katalog listing | < 2 detik |

---

# 16. SCALABILITY STRATEGY

> **Perubahan v1.1:** Catatan "tergantung pilihan Route Handlers vs service terpisah" pada versi dokumen ini sebelumnya **dihapus** — backend terkunci final ke Route Handlers dalam `apps/web` (ADR-001, Approved). Strategi scaling di bawah disusun ulang mengasumsikan satu aplikasi.

| Dimensi | Strategi |
|---|---|
| **Horizontal Scaling** | Aplikasi `apps/web` (frontend + Route Handlers menyatu) bersifat stateless — di-scale horizontal otomatis oleh platform serverless/edge Vercel tanpa perubahan arsitektur (ADR-001, ADR-010). |
| **Vertical Scaling** | Database (PostgreSQL via Supabase) dapat di-scale vertikal (tier instance lebih besar) sebagai langkah awal sebelum mempertimbangkan sharding/read replica. |
| **Modular Growth** | Struktur modular (Bagian 5) memungkinkan penambahan modul baru (Fase 2/3/4) tanpa merombak modul yang sudah stabil — dependency dijaga eksplisit; seluruh modul baru tetap berada di `apps/web/app/api/v1/{modul}/`, tidak membuka kembali opsi service terpisah tanpa ADR baru. |
| **Database Growth** | Index & denormalisasi terkontrol menjaga performa query seiring pertumbuhan data listing/lead; read replica dapat dipertimbangkan untuk beban baca tinggi di fase lanjutan. |
| **Storage Growth** | CDN Supabase Storage menyerap pertumbuhan volume foto/video; bucket privat (dokumen legalitas) dipisah agar tidak membebani delivery publik. |
| **Future Services** | Search engine (**ADR-005, Approved** — Postgres FTS Fase 1, migrasi terjadwal ke Typesense Fase 2 tanpa perubahan kontrak API), job queue (**ADR-006, Approved** — Vercel Cron Jobs + Postgres Trigger/Database Webhook Fase 1, migrasi terjadwal ke QStash Fase 2), Maps/Geocoding (**ADR-008, Approved v3** — LocationIQ+Geoapify Fase MVP, roadmap migrasi bertahap Growth → Scale (parsial ke Mapbox untuk Autocomplete) → Enterprise (revisit Google Maps Platform penuh), seluruhnya via lapisan abstraksi `MapsProvider` tanpa mengubah kontrak pemanggil), dan Rate Limiting/Application Cache (**ADR-018, Approved** — Supabase Postgres `rate_limit_log` Fase 1, migrasi terjadwal ke Upstash Redis Fase 2 tanpa mengubah kontrak `rate-limit.middleware`) dirancang sebagai layer yang tetap dapat dipanggil dari Route Handlers/job asinkron tanpa memerlukan pemisahan proses aplikasi utama. |
| **Batas Skalabilitas yang Diketahui (konsekuensi ADR-001)** | Jika kebutuhan proses long-running/heavy-compute terbukti dari data produksi pasca-rilis melampaui batas eksekusi serverless Vercel, migrasi bertahap ke service terpisah tetap dimungkinkan (logic sudah TypeScript murni, ADR-025) — namun ini adalah pekerjaan migrasi non-trivial yang memerlukan ADR baru, bukan default arsitektur saat ini. |

---

# 17. ERROR HANDLING STRATEGY

> **ADR terkait:** ADR-013 (Error Handling), ADR-014 (Logging), ADR-015 (Monitoring), ADR-018 (Caching/Rate Limiting) — seluruhnya **Approved**.

### Frontend Errors
- React Error Boundary per route group/segmen — kegagalan satu widget tidak mematikan seluruh halaman.
- State error eksplisit di setiap komponen data-fetch (loading/empty/error/success).

### Backend Errors
- Envelope error standar (`success: false`, `error.code`, `error.message`, `error.details`).
- Detail internal (stack trace, query SQL, nama tabel) **tidak pernah** bocor ke response — hanya ke log server.
- Validasi bisnis gagal → 422; validasi format gagal → 400; error tak terduga → 500 dengan `request_id` untuk tracing.

### API Errors
- Kode error `SCREAMING_SNAKE_CASE` terdaftar di `packages/shared-types/error-codes.ts`.
- Data privat milik user lain → 404 (bukan 403).
- RBAC ditolak → 403 dengan `FORBIDDEN_ROLE_ACCESS`.
- Rate limit terlampaui → 429 dengan header `Retry-After` (**ADR-018, Approved** — status ditentukan `rate-limit.middleware` dari tabel `rate_limit_log`, lihat Bagian 7 & 8).

### Logging
Structured logging JSON dengan `request_id`/`correlation_id` yang sama dikembalikan ke client, memudahkan korelasi error client↔server↔log. Audit log bisnis (`audit_logs`) terpisah dari log teknis, retensi permanen.

### Monitoring *(diperbarui v1.1 — ADR-015, Approved)*
**Sentry** (`@sentry/nextjs`) adalah tool monitoring resmi — source map otomatis, performance tracing untuk mendeteksi regresi Core Web Vitals/TTFB, terintegrasi rapat dengan App Router (server & client components, edge runtime, mencakup Route Handlers). Sampling rate wajib dikonfigurasi wajar untuk mengelola kuota. Data sensitif dilarang masuk breadcrumb/context (lihat Bagian 14).

### Retry Strategy
- Job asinkron (mekanisme final ADR-006, Approved: Vercel Cron Jobs + Postgres Trigger/Database Webhook) menerapkan retry dengan backoff untuk task yang gagal sementara (panggilan Google Indexing API, pengiriman notifikasi) — idempotent agar retry aman; retry/backoff kompleks lebih matang direncanakan sebagai kriteria migrasi Fase 2 ke QStash. Mekanisme yang sama juga menjalankan pembersihan terjadwal baris `rate_limit_log` berumur >7 hari (ADR-018, Approved) — bukan job/infrastruktur terpisah.
- Panggilan pihak ketiga Maps/Geocoding (**ADR-008, Approved v3**) di server-side menerapkan timeout & fallback chain: LocationIQ (Primary) → Geoapify (Approved Alternative, failover otomatis) → degradasi ke Offline/Manual Address Fallback (cascading dropdown wilayah internal, alamat freetext, atau input koordinat manual) jika kedua provider gagal.

---

# 18. DEPLOYMENT ARCHITECTURE

> **ADR terkait:** ADR-010 (Deployment Strategy) — **Approved, 27 Juli 2026**. Kombinasi **Vercel + GitHub + GitHub Actions** kini adalah keputusan teknologi final, bukan lagi "sesuai instruksi permintaan dokumen" seperti pada versi 1.0 dokumen ini.

```mermaid
flowchart TD
    Dev["Developer\n(Human / AI Coding Assistant, termasuk Bolt.new)"]
    Repo["GitHub Repository\n(monorepo: apps/web, packages, supabase/migrations, docs)"]
    CI["CI Pipeline\n(GitHub Actions)\nLint + Type-check + Test + Migration Check"]
    Preview["Preview Deployment\n(Vercel — per Pull Request)"]
    Prod["Production Deployment\n(Vercel — branch main)\napps/web: Frontend + Route Handlers (satu unit deploy, ADR-001)"]
    SupaMig["Supabase Migration\n(SQL migration files, supabase/migrations, direview)"]
    SupaProd["Supabase Production\n(Postgres + Auth + Storage + RLS)"]
    Sentry["Sentry\n(error tracking & performance monitoring)"]

    Dev -->|"git push / PR"| Repo
    Repo --> CI
    CI -->|"Lolos semua gate"| Preview
    Preview -->|"Review & approve"| Repo
    Repo -->|"Merge ke main"| Prod
    CI -->|"Migration check"| SupaMig
    SupaMig -->|"Apply setelah review"| SupaProd
    Prod -->|"Runtime queries"| SupaProd
    Prod -->|"Error & performance events"| Sentry
```

**Alur ringkas:**
1. **Developer** (manusia atau AI Coding Assistant, termasuk Bolt.new sebagai bagian toolchain — lihat Bagian 4) membuat perubahan di branch fitur (`feat/{modul}-{ringkasan}`) dan membuka Pull Request ke GitHub.
2. **CI Pipeline** (GitHub Actions) menjalankan lint, type-check, test otomatis (Vitest/RTL/Playwright — ADR-016), dan migration check — **wajib lolos** sebelum merge diizinkan.
3. **Preview Deployment** di Vercel dibuat otomatis per PR untuk review visual/fungsional sebelum merge — mencakup **satu unit deploy** (`apps/web`) berisi frontend dan Route Handlers sekaligus, karena tidak ada lagi service backend terpisah (ADR-001).
4. **Migration** database (jika ada perubahan skema) melalui file SQL yang direview terpisah (`supabase/migrations/`), diterapkan ke Supabase dengan rencana rollback — **tidak** mengedit skema langsung lewat Supabase Studio di production.
5. Setelah PR di-approve dan di-merge ke `main`, **Production Deployment** di Vercel berjalan otomatis, terhubung ke **Supabase Production** (Postgres + Auth + Storage + RLS aktif).
6. Error runtime & regresi performa di production/preview dilaporkan otomatis ke **Sentry** (ADR-015).
7. Environment variables/secrets dikelola terpisah per environment (preview vs production) di dashboard Vercel & Supabase — tidak pernah di-commit ke repo. Termasuk `LOCATIONIQ_API_KEY`/`GEOAPIFY_API_KEY` (ADR-008, Approved v3) yang ditambahkan sejak Sprint S0 sebagai bagian environment variable server-side, mengikuti pola yang sama dengan `CRON_SECRET` (ADR-006). **Rate Limiting/Application Cache (ADR-018, Approved) tidak menambah environment variable baru** — tabel `rate_limit_log` memakai koneksi Supabase yang sudah dikonfigurasi sejak Sprint S0, tanpa provisioning/deployment tambahan.

**Batasan operasional wajib didokumentasikan (kondisi ADR-001 APPROVED WITH NOTES):** batas eksekusi fungsi serverless Vercel (~10–60 detik tergantung paket) berlaku terhadap seluruh Route Handler `apps/web/app/api/v1/**`. Proses yang berpotensi melampaui batas ini wajib dirancang sebagai job asinkron (Bagian 6, 9, 11 — ADR-006, Approved: Vercel Cron Jobs + Postgres Trigger/Database Webhook).

---

# 19. DEVELOPMENT STANDARDS

| Konteks | Konvensi | Contoh |
|---|---|---|
| File komponen React | `PascalCase.tsx`, sama dengan nama komponen | `ListingCard.tsx` |
| File Route Handler modul | `route.ts` di `app/api/v1/{modul}/`, didukung `{modul}.service.ts` / `.repository.ts` / `.schema.ts` / `.types.ts` di `lib/` | `app/api/v1/listings/route.ts`, `lib/services/listings.service.ts` |
| Folder | `kebab-case` untuk route segment, `lowercase` untuk kategori (`components`, `lib`) | `developer-projects/` |
| Komponen React (nama) | `PascalCase` | `DbrCalculatorForm` |
| Variabel & fungsi TS | `camelCase` | `getListingBySlug()` |
| Tipe & interface TS | `PascalCase` | `ListingEntity` |
| Konstanta enum aplikasi | `SCREAMING_SNAKE_CASE` | `LISTING_STATUS.PENDING_REVIEW` |
| Endpoint REST | `kebab-case`, resource jamak | `/developer-projects` |
| Tabel & kolom database | `snake_case`, tabel jamak | `agent_verification_documents` |
| Slug URL publik | lowercase, spasi→`-`, diakhiri `{short_id}` | `rumah-minimalis-2-lantai-bsd-city-9f21a` |
| Nama branch Git | `{tipe}/{modul}-{ringkasan}` | `feat/m3-listing-crud`, `fix/m7-dbr-rounding` |
| Commit message | Conventional Commits | `feat(listing): add slug auto-generate with short id` |

**Prinsip lintas layer:** field yang sama harus memakai nama identik di DB → API JSON → hanya dikonversi ke `camelCase` **di dalam** kode TypeScript via mapper/DTO — tidak boleh "bocor" campuran di response API.

---

# 20. FUTURE ARCHITECTURE

| Arah Pengembangan | Pertimbangan Arsitektural |
|---|---|
| **Mobile App** | Kontrak `/api/v1` (Route Handlers, ADR-001) dijaga stabil sebagai REST API yang dapat dikonsumsi aplikasi mobile native/Flutter/React Native tanpa perubahan kontrak — **tidak lagi bergantung** pada "jika arsitektur split dipilih" seperti versi dokumen sebelumnya, karena kontrak API sudah independen dari lokasi eksekusinya. |
| **Multi Tenant** | Skema saat ini single-tenant secara implisit (ADR-023). Jika multi-tenant dibutuhkan di masa depan, perlu penambahan `tenant_id` di tabel-tabel inti dan penyesuaian RLS — **perubahan besar**, harus direncanakan sebagai ADR baru yang eksplisit. |
| **Marketplace** | Struktur `developer_projects` + `agent_project_claims` sudah menyerupai pola marketplace terbatas (developer sebagai supplier, agen sebagai reseller) — dapat diperluas menjadi marketplace penuh dengan penambahan modul transaksi/komisi di Fase 4. |
| **AI Integration** | Potensi: rekomendasi listing personalisasi, auto-deskripsi listing, penilaian kualitas foto, chatbot FAQ — harus tetap menghormati prinsip "business logic terpisah dari UI" dan tidak mengorbankan SEO (konten AI-generated tetap perlu SSR). |
| **Analytics** | Fondasi GTM/GA4 sudah ada di Fase 1 — pengembangan lanjutan (dashboard analitik custom, funnel lead-to-closing) dapat dibangun di atas data `listing_leads`/`listing_views` yang sudah terstruktur. |
| **Payment Gateway** | Endpoint `POST /billing/*` sudah disiapkan sebagai placeholder non-breaking — implementasi penuh menunggu keputusan model monetisasi final (lihat Bagian 23); kandidat Midtrans/Xendit (`technology-decisions.md` §8). |
| **Third Party Integration** | Integrasi SLIK/BI Checking (validasi cicilan otomatis untuk DBR) dan WA Business API direncanakan Fase 4 — arsitektur job asinkron & service layer saat ini sudah mengakomodasi penambahan integrasi baru tanpa merombak modul inti. |
| **Migrasi Backend (kondisional)** | Jika data produksi pasca-rilis membuktikan kebutuhan proses long-running/heavy-compute yang melampaui batas serverless Vercel, migrasi bertahap ke service terpisah tetap dimungkinkan (ADR-001 Consequences) — memerlukan ADR baru yang men-supersede ADR-001, bukan default arsitektur. |

---

# 21. RISKS

> **Perubahan v1.5:** Risiko "Rate limiting endpoint sensitif belum punya mekanisme penyimpanan status lintas-instance yang eksplisit" **ditandai resolved** — ADR-018 (Caching Strategy) kini Approved. Perubahan v1.4 (risiko Maps Provider), v1.3 (risiko Job Queue Strategy), v1.2 (risiko Search Strategy), dan v1.1 (risiko "Backend belum dikunci") tetap berlaku sebagaimana tercatat sebelumnya.

| Kategori | Risiko | Status | Mitigasi |
|---|---|---|---|
| **Technical** | ~~Backend belum dikunci antara Route Handlers vs service terpisah~~ | **RESOLVED** (ADR-001, Approved 27 Jul 2026) | Next.js Route Handlers + Supabase, tanpa service terpisah — final. |
| **Technical** | Batas eksekusi fungsi serverless Vercel (~10–60 detik) dapat terlampaui jika proses berat tidak sengaja diimplementasikan langsung di Route Handler. | Open (konsekuensi ADR-001) | Dokumentasikan eksplisit sebagai constraint arsitektur (Bagian 9, 11, 18); arahkan proses berat ke job asinkron (ADR-006, Approved) — mekanisme sudah tersedia. |
| **Technical** | Duplikasi definisi tipe data antara frontend & Route Handlers jika `packages/shared-types` tidak disiplin dipakai. | Open | Enforce lewat code review & lint rule bahwa entitas domain hanya boleh didefinisikan di `shared-types`. |
| **Technical** | ~~Implementasi pencarian listing (`/properties/search`) berisiko dibangun di atas asumsi mesin pencari yang salah.~~ | **RESOLVED** (ADR-005, Approved 28 Jul 2026) | PostgreSQL FTS + pg_trgm Fase 1, migrasi terjadwal ke Typesense Fase 2 berdasarkan kriteria ambang eksplisit — final. |
| **Technical** | ~~Regenerasi sitemap event-driven, reminder event, sinkronisasi counter berisiko diimplementasikan ad-hoc tanpa mekanisme job yang konsisten.~~ | **RESOLVED** (ADR-006, Approved 29 Jul 2026) | Vercel Cron Jobs + Postgres Trigger/Database Webhook Fase 1, migrasi terjadwal ke QStash Fase 2 — final. |
| **Technical** | ~~Form lokasi listing (M3) & peta proyek developer (M6) tidak dapat diselesaikan penuh tanpa provider Maps final.~~ | **RESOLVED** (ADR-008, Approved 30 Jul 2026, direvisi v3) | Leaflet+OpenStreetMap+LocationIQ (Primary)+Geoapify (Approved Alternative) — final, dengan caching, rate limiting scoped, dan fallback manual 3 lapis. |
| **Technical** | ~~Rate limiting endpoint sensitif belum punya mekanisme penyimpanan status lintas-instance yang eksplisit.~~ | **RESOLVED** (ADR-018, Approved 31 Jul 2026) | Supabase Postgres (tabel `rate_limit_log`, sliding window) Fase 1, migrasi terjadwal ke Upstash Redis Fase 2 berdasarkan kriteria ambang eksplisit — final. |
| **Scalability** | Pertumbuhan volume listing/lead dapat membebani query pencarian jika index tidak dijaga sejak awal. | Open | Index wajib sejak migrasi awal (Bagian 7), monitoring query lambat, pertimbangkan read replica di fase lanjutan. |
| **Scalability** | Ketergantungan pada satu instance Postgres tanpa strategi sharding jika platform tumbuh multi-tenant/multi-region. | Open | Rencanakan strategi tenant/regional sebagai ADR baru sebelum benar-benar dibutuhkan (Bagian 20). |
| **Security** | Kebocoran service role key Supabase ke client jika audit build tidak rutin dilakukan — risiko sedikit meningkat karena frontend & backend kini satu aplikasi (ADR-001). | Open | Audit build output secara berkala; CI gate untuk mendeteksi key `_SERVICE_ROLE_KEY`/`_SECRET` di bundle client. |
| **Security** | Data finansial DBR & dokumen legalitas berisiko tinggi jika enkripsi at-rest tidak konsisten diterapkan di semua environment (termasuk staging). | Open | Enforce enkripsi di level migration/skema, bukan opsional per environment; sertakan dalam Definition of Done. |
| **Performance** | Halaman publik gagal memenuhi Core Web Vitals jika SSR/ISR tidak konsisten diterapkan di seluruh halaman baru. | Open | Checklist SEO/performance wajib di setiap PR yang menyentuh halaman publik. |
| **Performance** | Counter agregat dihitung on-the-fly oleh developer yang tidak menyadari aturan denormalisasi. | Open | Komentar kode eksplisit + review checklist yang menandai kolom counter sebagai "wajib trigger/job, dilarang on-the-fly". |
| **Business/Process** | Item pada Bagian 23 (threshold DBR, monetisasi, dsb.) berpotensi diputuskan sepihak oleh AI Coding Assistant jika tidak diberi pengingat eksplisit. | Open | Aturan `// TODO: menunggu keputusan bisnis` wajib di seluruh dokumen turunan (Blueprint, Context Pack, dokumen ini). |

---

# 22. AI DEVELOPMENT NOTES

Bagian khusus untuk AI Coding Assistant (Bolt.new, Claude, ChatGPT, Cursor, GitHub Copilot, dsb.) yang bekerja pada implementasi berdasarkan dokumen arsitektur ini:

1. **Baca `architecture-decision-records.md` sebelum dokumen ini** — dokumen ini menerjemahkan ADR menjadi pandangan arsitektur teknis yang utuh; jika ditemukan ketidaksesuaian antara ADR Approved dan isi dokumen ini, **ADR yang menang**, laporkan sebagai temuan governance.
2. **Jangan menambahkan service backend Node.js terpisah** (NestJS/Express, dsb.) — ini melanggar ADR-001 (Approved) dan `technology-decisions.md` §6 poin 10. Seluruh implementasi backend baru wajib berupa Route Handler di `apps/web/app/api/v1/`.
3. **Jangan mengubah struktur folder tanpa alasan** — struktur di Bagian 6 adalah keputusan final; perubahan besar wajib disetujui eksplisit via ADR baru.
4. **Jangan membuat komponen duplikat** — periksa `components/ui/` dan `components/features/{module}/` sebelum menulis komponen baru yang fungsinya serupa.
5. **Selalu gunakan reusable component** yang sudah ada, bukan menulis ulang pola UI yang sudah tersedia.
6. **Ikuti naming convention** di Bagian 19 secara konsisten di seluruh layer (file, folder, komponen, endpoint, database, branch, commit).
7. **Jangan mengubah database tanpa memperbarui dokumentasi** — setiap perubahan skema wajib disinkronkan ke `ERD-Skema-Database.md` dan `ERD-Diagram.mermaid`.
8. **Selalu periksa `CURRENT-PROJECT-STATE.md`** (modul mana yang sudah selesai, fase mana yang sedang berjalan) sebelum mengimplementasikan fitur baru — jangan membangun fitur fase mendatang sebelum fondasi fase saat ini solid.
9. **Selalu gunakan Development Playbook** (`AI-DEVELOPMENT-BLUEPRINT.md`) sebagai acuan pola implementasi detail (CRUD pattern, form pattern, error handling, dsb.) — dokumen ini (`SYSTEM-ARCHITECTURE.md`) menjelaskan **apa** arsitekturnya, Blueprint menjelaskan **bagaimana** menulis kode sesuai arsitektur tsb.
10. **Ownership (`agent_id`) adalah hard boundary di kode** (layer repository), bukan hanya konfigurasi permission — validasi ulang di server terlepas dari hasil pengecekan RBAC.
11. **Seluruh 28 ADR + `ADR-046` kini berstatus Approved — tidak ada lagi ADR arsitektur/teknis yang OPEN** (lihat Bagian 23 & 24). ADR-005 (Search Strategy), ADR-006 (Job Queue Strategy), ADR-008 (Maps Provider), dan **ADR-018 (Caching Strategy, Approved 31 Juli 2026)** — endpoint search/autocomplete, mekanisme job asinkron/terjadwal, integrasi Leaflet+OSM+LocationIQ/Geoapify, dan rate limiting berbasis `rate_limit_log` boleh diimplementasikan penuh, tidak lagi memerlukan placeholder `// TODO: menunggu resolusi ADR-XXX` untuk topik arsitektur/teknis apa pun. Jika di masa depan muncul ADR baru berstatus OPEN, terapkan kembali prinsip yang sama: implementasikan sebagai placeholder configurable dan laporkan ke manusia jika memblokir progres.
12. **Jangan menambahkan dependency/library baru** di luar Technology Stack (Bagian 4) tanpa justifikasi berbasis 10 prinsip `technology-decisions.md` §2 dan persetujuan eksplisit.
13. **Jika instruksi user bertentangan dengan dokumen ini, ADR, atau `PROJECT-CONSTITUTION.md`** (khususnya Security/Authorization), tanyakan konfirmasi sebelum menyimpang.
14. **Setiap PR wajib lolos**: lint + type-check + test otomatis (Vitest/RTL/Playwright) + migration check sebelum dianggap selesai (lihat Bagian 18).
15. **Perhatikan batas eksekusi serverless** (Bagian 9, 11, 21) — jangan mengimplementasikan proses yang berpotensi long-running langsung di Route Handler tanpa mempertimbangkan job asinkron.

---

# 23. OPEN QUESTIONS & ASSUMPTIONS

> **Perubahan v1.5:** Daftar ini disusun ulang. Item yang sudah **Approved** via ADR (backend/API, hosting, state management, email provider, monitoring, testing framework, Search Strategy, Job Queue Strategy, Maps Provider, **dan kini Caching Strategy/Rate Limiting**) **dihapus** dari daftar — lihat Bagian 24 untuk rujukan ADR-nya. **Tidak ada lagi Open Decision arsitektur/teknis tersisa** — seluruh 25 ADR kini Approved. Yang tersisa hanya sejumlah keputusan bisnis murni (Bagian B) dan gap administratif/dokumentasi (Bagian C) yang memang belum diambil/disinkronkan.

### A. Open Decision Arsitektur/Teknis (berkorespondensi ADR berstatus OPEN)

**Tidak ada item aktif di kategori ini per 31 Juli 2026** — seluruh 25 ADR di `architecture-decision-records.md` berstatus **Approved**. Bagian ini dipertahankan sebagai struktur baku untuk ADR baru yang mungkin muncul di masa depan (mis. perubahan scope, fitur baru di luar 11 modul saat ini) — jika terjadi, item baru dicatat di sini dengan format tabel yang sama (Topik | ADR | Prioritas | Wajib Selesai Sebelum), dan diimplementasikan sebagai **configurable placeholder** mengikuti Prinsip Penanganan di bawah.

> **Item yang telah diselesaikan dan dihapus dari daftar ini:** *Search Strategy* — **RESOLVED** via `architecture-decision-records.md` ADR-005 (Approved, 28 Juli 2026): PostgreSQL Full-Text Search + pg_trgm untuk Fase 1, migrasi terjadwal ke Typesense di Fase 2 berdasarkan kriteria ambang eksplisit. Lihat Bagian 4 (Technology Stack), Bagian 7 (Database Architecture), dan Bagian 24. *Job Queue Strategy* — **RESOLVED** via `architecture-decision-records.md` ADR-006 (Approved, 29 Juli 2026): Vercel Cron Jobs + Postgres Trigger/Database Webhook untuk Fase 1, migrasi terjadwal ke QStash di Fase 2 berdasarkan kriteria ambang eksplisit; BullMQ+Redis ditolak karena tidak kompatibel dengan model serverless ADR-001. Lihat Bagian 4 (Technology Stack), Bagian 6 (Folder Structure), Bagian 7 (Data Flow), dan Bagian 24. *Maps Provider* — **RESOLVED** via `architecture-decision-records.md` ADR-008 (Approved, 30 Juli 2026, direvisi v3): Leaflet + OpenStreetMap dengan LocationIQ sebagai Primary Geocoding Provider dan Geoapify sebagai Approved Alternative Provider, migrasi bertahap terjadwal MVP → Growth → Scale → Enterprise. Lihat Bagian 3 (Component Diagram), Bagian 4 (Technology Stack), Bagian 5 (Modul 5.3 & 5.6), Bagian 6 (Folder Structure), Bagian 7 (Data Flow), Bagian 14 (Security), Bagian 15 (Performance), Bagian 17 (Error Handling), dan Bagian 24. *Caching Strategy/Rate Limiting* — **RESOLVED** via `architecture-decision-records.md` ADR-018 (Approved, 31 Juli 2026): Supabase Postgres (tabel `rate_limit_log`, sliding window) untuk Fase 1, migrasi terjadwal ke Upstash Redis di Fase 2 berdasarkan kriteria ambang eksplisit. Lihat Bagian 3 (Component Diagram), Bagian 4 (Technology Stack), Bagian 6 (Folder Structure), Bagian 7 (Database Architecture & Data Flow), Bagian 8 (Authentication & Authorization), Bagian 11 (Backend Architecture), Bagian 14 (Security), Bagian 15 (Performance), Bagian 16 (Scalability), Bagian 17 (Error Handling), Bagian 18 (Deployment), dan Bagian 24.

### B. Keputusan Bisnis Murni (Bukan Cakupan ADR Arsitektur/Teknis)
Item berikut **tidak** memiliki ADR arsitektur/teknis yang menaunginya — ini murni keputusan bisnis yang belum diambil, tetap wajib diimplementasikan sebagai *configurable* (`system_configs`/`dbr_config`):

1. **Threshold DBR final** dan apakah berbeda per bank rekanan — perlu input tim bisnis/legal.
2. **Model bisnis monetisasi** — komisi transaksi, biaya keanggotaan tier, atau boost listing berbayar — belum diputuskan.
3. **Kebutuhan integrasi pihak ketiga lain** — payment gateway (kandidat Midtrans/Xendit), SLIK OJK — belum dikonfirmasi kebutuhan & providernya (Fase 4).
4. **Kebijakan eksklusivitas proyek developer** per wilayah/agen — belum diputuskan.
5. **Kebijakan promosi/demosi role** — apakah Manager dapat mempromosikan Agen langsung menjadi Manager, atau hanya Superadmin — saat ini hard rule membatasi Manager hanya pada Agen ↔ Admin.
6. **Kepemilikan akun organisasi Google Search Console/GTM/GA4** — perlu ditentukan tim operasional sebelum go-live (tidak memblokir mulainya development).
7. **Apakah agen wajib bernaung di bawah kantor/brokerage tertentu** atau bisa independen — belum dikonfirmasi.

### C. Gap Administratif/Dokumentasi (Bukan Keputusan Teknologi Terbuka)
Item berikut **sudah Approved** secara teknologi tetapi tercatat sebagai gap sinkronisasi dokumen governance lain (lihat ADR Notes masing-masing di `architecture-decision-records.md` dan Bagian 24) — **tidak** memengaruhi implementasi kode:
- Backfill formal keputusan Vercel (ADR-010) ke `PROJECT-CONSTITUTION.md` §4.
- Pencatatan **Bolt.new** sebagai toolchain resmi di `technology-decisions.md`/`dependency-manifest.md` (rekomendasi Architecture Review Board).
- ~~Rekonsiliasi jumlah seed role "7 vs 8" di `DEVELOPMENT-ROADMAP.md`/`CHANGELOG.md`/`CURRENT-PROJECT-STATE.md`/`decision-log.md`~~ — **RESOLVED 4 Agustus 2026 (OD-02):** final 7 role, Guest bukan baris `roles`.
- ~~Kebijakan soft-delete yang belum dideklarasikan seragam di luar 3 tabel wajib (ADR-004 Notes)~~ — **RESOLVED 4 Agustus 2026 (OD-07/`ADR-046`):** diperluas ke 8 tabel.
- Dokumen **Testing Strategy/Test Plan** konsolidasi (target coverage, strategi data uji) belum ada sebagai dokumen terpisah — tool sudah final (ADR-016).

### Prinsip Penanganan
Untuk seluruh poin A & B di atas: AI Coding Assistant maupun developer manusia **wajib** mengimplementasikan bagian terkait sebagai **configurable placeholder** (bukan hard-code keputusan sepihak), menandai kode dengan `// TODO: menunggu resolusi ADR-XXX` atau `// TODO: menunggu keputusan bisnis`, dan melaporkan ke tim jika keputusan tersebut memblokir progres implementasi.

---

# 24. ADR CROSS-REFERENCE MATRIX *(baru di v1.1)*

> Peta lengkap setiap ADR di `architecture-decision-records.md` terhadap bagian dokumen ini yang dipengaruhinya — memenuhi kebutuhan traceability `document-governance-baseline-register.md` §2 (prinsip Traceability) dan §12 (Document Update Priority).

| ADR | Topik | Status | Bagian Dokumen Ini yang Terdampak |
|---|---|---|---|
| ADR-001 | Backend Architecture | **Approved** | Bagian 1, 2, 3, 4, 6, 9, 11, 15, 16, 18, 20, 21, 22 |
| ADR-002 | Authentication Strategy | Approved | Bagian 3, 4, 8, 14 |
| ADR-003 | Authorization & RBAC Strategy | Approved | Bagian 2, 6, 7, 8, 11, 14 |
| ADR-004 | Database Strategy | Approved | Bagian 4, 7 |
| ADR-005 | Search Strategy | **Approved** | Bagian 3, 4, 5 (Modul 5.3), 6, 7, 9, 11, 16, 21, 23 |
| ADR-006 | Job Queue Strategy | **Approved** | Bagian 2, 3, 4, 6, 7, 9, 11, 13, 15, 16, 17, 21, 23 |
| ADR-007 | Email Provider | Approved | Bagian 3, 4, 13 |
| ADR-008 | Maps Provider | **Approved (v3)** | Bagian 3, 4, 5 (Modul 5.3 & 5.6), 6, 7, 14, 15, 17, 18, 21, 23 |
| ADR-009 | Storage Strategy | Approved | Bagian 4, 12, 14 |
| ADR-010 | Deployment Strategy | Approved | Bagian 4, 14, 18 |
| ADR-011 | State Management Strategy | Approved | Bagian 4, 10 |
| ADR-012 | API Architecture | Approved | Bagian 7, 9 |
| ADR-013 | Error Handling Strategy | Approved | Bagian 9, 11, 17 |
| ADR-014 | Logging Strategy | Approved | Bagian 11, 14, 17 |
| ADR-015 | Monitoring & Observability | Approved | Bagian 4, 14, 17, 18 |
| ADR-016 | Testing Strategy | Approved | Bagian 4, 18, 22 |
| ADR-017 | Security Strategy | Approved | Bagian 14 |
| ADR-018 | Caching Strategy (level aplikasi) | **Approved** | Bagian 3, 4, 6, 7, 8, 11, 14, 15, 16, 17, 18, 21, 22, 23 |
| ADR-019 | File Upload Strategy | Approved | Bagian 4, 12 |
| ADR-020 | Notification Strategy | Approved | Bagian 13 |
| ADR-021 | Frontend Framework & Rendering Strategy | Approved | Bagian 2, 3, 4, 5, 10 |
| ADR-022 | Database Schema Conventions | Approved | Bagian 7 |
| ADR-023 | Multi-Tenancy Strategy | Approved (implisit, direvisi 3 Agustus 2026) | Bagian 7, 20 |
| ADR-024 | RBAC Role Model Scope | Approved | Bagian 1, 5, 8 |
| ADR-025 | Type Safety & Validation Strategy | Approved | Bagian 2, 9, 10, 11 |
| ADR-026 | Organization Model Strategy | **Approved With Notes (3 Agustus 2026)** | Bagian 5 (Modul 5.12), 7, 24 |
| ADR-027 | Organization-Scoped Authorization Strategy | **Approved (3 Agustus 2026)** | Bagian 5 (Modul 5.12), 8 |
| ADR-028 | Third-Party AI Assistant Integration Strategy (BYOK) | **Approved With Notes (3 Agustus 2026)** | Bagian 5 (Modul 5.13), 13, 14 |

**Ringkasan status:** 28 dari 28 ADR **Approved**/**Approved With Notes** — tidak ada lagi ADR arsitektur/teknis yang OPEN. Urutan penyelesaian yang tercatat sebelumnya di `architecture-decision-records.md` Bagian 8 telah tuntas: ADR-005 (Search Strategy) diselesaikan (Approved, 28 Juli 2026), ADR-006 (Job Queue Strategy) diselesaikan (Approved, 29 Juli 2026), ADR-008 (Maps Provider) diselesaikan (Approved, 30 Juli 2026, direvisi v3), dan ADR-018 (Caching Strategy) diselesaikan (Approved, 31 Juli 2026) sebagai ADR terakhir dari rangkaian ADR-001–018. **Siklus baru (3 Agustus 2026):** ADR-026 dan ADR-027 (Organization Management System) serta ADR-028 (AI Assistant Integration/BYOK) disahkan sekaligus dalam satu sesi Architecture Review Board, berdasarkan `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md` — status ADR-023 turut direvisi (bukan diedit) untuk mencerminkan bahwa ADR-026 mengaktifkan grouping construct ringan, bukan skenario multi-tenant klasik yang semula diantisipasi.

---

*Dokumen ini disusun sebagai referensi arsitektur teknis utama, turunan dari `PROJECT-CONSTITUTION.md`, `architecture-decision-records.md` (ADR), `technology-decisions.md` v1.6, dan seluruh dokumen sumber v1.1 (26 Juli – 3 Agustus 2026). Mengikat seluruh proses development — AI Coding Assistant maupun developer manusia — selama lifecycle proyek berlangsung. Versi 1.1–1.5 (27–31 Juli 2026) mengintegrasikan resolusi ADR-001, ADR-005, ADR-006, ADR-008, dan ADR-018 secara berurutan — lihat riwayat detail di revisi masing-masing. **Versi 1.6 (3 Agustus 2026)** mengintegrasikan resolusi **ADR-026 (Organization Model Strategy, Approved With Notes)**, **ADR-027 (Organization-Scoped Authorization Strategy, Approved)**, dan **ADR-028 (Third-Party AI Assistant Integration Strategy/BYOK, Approved With Notes)** — hasil sesi Architecture Review Board berdasarkan `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md` — memperbarui Module Architecture (Bagian 5, Modul 5.12 & 5.13 baru + tabel dependency), Database Architecture (Bagian 7, 5 tabel baru), Authentication & Authorization Architecture (Bagian 8, lapisan Organization-scoped baru), Notification Architecture (Bagian 13), Security Architecture (Bagian 14), dan ADR Cross-Reference Matrix (Bagian 24). Status ADR-023 (Multi-Tenancy Strategy) turut direvisi. **Berbeda dari revisi 1.1–1.5, siklus ini tidak menyentuh Bagian 4 (Technology Stack)** — Organization dan AI Assistant tidak menambah baris teknologi inti baru. Jika terjadi ketidaksesuaian dengan `PROJECT-CONSTITUTION.md`, Constitution yang berlaku. Revisi dokumen ini wajib dilakukan setiap kali status ADR di `architecture-decision-records.md` berubah, atau setiap kali keputusan pada Bagian 23 (Open Questions & Assumptions) diselesaikan. **Dengan ADR-026/027/028 ini, seluruh 28 dari 28 ADR arsitektur/teknis proyek kini berstatus Approved/Approved With Notes — tidak ada lagi ADR yang OPEN di seluruh proyek.***

---

# D6 GLOBAL BASELINE SYNCHRONIZATION OVERLAY
**Date:** 16 August 2026  
**Status:** FINAL GLOBAL AEP1–AEP4 SEMANTIC SYNCHRONIZATION — PASS WITH CONTROLLED RESIDUALS

## Purpose
This section records the post-AEP1–AEP4 global semantic baseline. It is authoritative for cross-domain synchronization status, while the underlying document remains authoritative for its own domain and source-of-truth role.

## Canonical AEP state
| AEP | Domain | Current gate | Canonical interpretation |
|---|---|---|---|
| AEP #1 | Monetization / Commercial + Payment | CONDITIONALLY COMPLETE | Semantic synchronization complete; OPEN-C01, MBR-COM evidence and selected engineering verification remain residuals; physical implementation remains downstream. |
| AEP #2 | Learning Economy | PASS WITH CONTROLLED RESIDUALS | Learning Economy semantic/downstream synchronization complete; MADCR-049 remains OPEN / RE-EVALUATION; automated test evidence remains unverified. |
| AEP #3 | Title / Awarding | SEMANTIC ARCHITECTURE COMPLETE / CONTROLLED OPEN ITEMS | Title/Awarding semantic state synchronized; OD-02…05 remain controlled downstream open items; OD-06 is CLOSED Option B. |
| AEP #4 | Learning Session | PASS WITH CONTROLLED RESIDUALS | Session semantic/downstream synchronization complete; OD-08, MADCR-049, MADCR-053/054 and other controlled residuals remain explicit. |

## Global authority map
- Commercial / Payment owns payment processing, verification and Commercial Entitlement.
- Learning Economy owns Learning Point transactions/provenance.
- Learning Session owns Session lifecycle and evaluation of participation evidence.
- RBAC owns authorization.
- Awarding owns qualification and Award Instance.
- Event Calendar remains integration/presentation context; Learning Session is semantic session authority.
- Provider systems remain infrastructure; provider events are evidence inputs, not RUMAHAGEN business outcomes.

## Canonical cross-domain invariants
1. Subscription ≠ Commercial Entitlement ≠ RBAC.
2. Learning Points ≠ Commercial Entitlement.
3. Course Enrollment ≠ Session Enrollment ≠ Event Registration.
4. Provider Session ID ≠ semantic Learning Session ID.
5. Provider participation ≠ Attendance Outcome ≠ Completion Outcome.
6. Completion ≠ Skill/Credential ≠ Title/Award Instance.
7. Payment Confirmed does not directly issue LP, Credential, or Award.
8. Purchased LP grant is idempotent against the confirmed Commercial transaction.
9. Learning/Session outcomes are evidence to Awarding where the applicable Awarding Path/Rule permits them.
10. Historical commercial, learning, session and awarding records must remain explainable after configuration/version changes.
11. Presentation preference does not mutate Award ownership/lifecycle.
12. Authorization does not equal qualification or commercial entitlement.

## Global implementation hold
The AEP consolidation is a semantic/governance synchronization gate. It does **not** by itself authorize:
- physical schema migration;
- production payment-provider activation;
- final provider-specific contracts/credentials;
- final RBAC permission IDs/scopes where governance remains open;
- automatic provider failover;
- final Learning Activity evidence contract under MADCR-049;
- unresolved Awarding physical cardinality/temporal/storage choices.

Implementation authorization remains subject to the applicable downstream/global gate.

## Stale-document rule
Older documents may contain pre-AEP wording. They remain historical evidence. They must not override the canonical state above. Examples include older M05 Event/live-session wording and older AEP3 OD-06 OPEN wording. These are controlled documentation deltas, not new architecture decisions.

## Residual control rule
Existing residuals are carried forward; none is silently closed by D6. A residual may be closed only by its owning governance/decision gate and must then propagate through the normal synchronization process.

## D6 gate
**PASS — GLOBAL AEP1–AEP4 SEMANTIC BASELINE SYNCHRONIZATION COMPLETE.**

## D6 System Architecture Addendum — Cross-domain topology
The consolidated topology is:
Commercial/Payment → Commercial Entitlement → access outcomes;
Learning Economy → LP ledger/provenance;
Learning Session → session lifecycle/evidence evaluation;
Awarding → qualification/Award Instance;
RBAC → authorization;
Provider Adapter → external session infrastructure;
Event Calendar → discovery/presentation/integration context.
No cross-domain authority leakage is permitted.
