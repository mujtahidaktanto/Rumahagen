# PROJECT CONSTITUTION
## Platform Web RUMAHAGEN

**Status:** BERLAKU — Dokumen ini mengikat semua AI Coding Assistant (Bolt.new, Cursor, Claude Code, GPT, Copilot, dsb.) dan seluruh kontributor manusia.
**Versi:** 1.9 (selaras dengan PRD, ERD & Skema Database (v1.2), ERD Diagram, API Specification, User Flow, dan SEO & Analytics Specification — dokumen sumber bisnis/data lain tetap v1.1, 26 Juli 2026, **belum disinkronkan pada revisi ini** — dan disinkronkan dengan `architecture-decision-records.md`, khususnya **ADR-001 — Backend Architecture (Approved, 27 Juli 2026)**, **ADR-005 — Search Strategy (Approved, 28 Juli 2026)**, **ADR-006 — Job Queue Strategy (Approved, 29 Juli 2026)**, **ADR-008 — Maps Provider (Approved, 30 Juli 2026, direvisi v3)**, **ADR-018 — Caching Strategy (Approved, 31 Juli 2026)**, **ADR-026/ADR-027 — Organization Management System, ADR-028 — AI Assistant Integration (Approved/Approved With Notes, 3 Agustus 2026)**, dan **ADR-046 — Perluasan Kebijakan Soft-Delete (Approved, 4 Agustus 2026)**; serta resolusi **OD-02** (seed role final), **OD-06** (kepemilikan dokumen), dan konfirmasi gate implementasi kode **Modul 12/Modul 13** (6-7 Agustus 2026))
**Last Updated:** 7 Agustus 2026
**Disusun oleh:** Mujtahid Aktanto (Solo Project Owner, AI-Assisted) — kapasitas Principal Software Architect (berdasarkan review menyeluruh dokumen sumber v1.0, kemudian diperbarui setelah audit konflik lintas dokumen diperbaiki langsung di seluruh dokumen sumber pada revisi v1.1; revisi v1.2 disusun untuk menyinkronkan seluruh aturan engineering dengan ADR-001 hasil Architecture Review Board; revisi v1.3 disusun untuk menyinkronkan lebih lanjut dengan ADR-005 hasil Architecture Review Board; revisi v1.4 disusun untuk menyinkronkan lebih lanjut dengan ADR-006 hasil Architecture Review Board; revisi v1.5 disusun untuk menyinkronkan lebih lanjut dengan ADR-008 hasil Architecture Review Board; revisi v1.6 disusun untuk menyinkronkan lebih lanjut dengan ADR-018 hasil Architecture Review Board; revisi v1.7 disusun untuk menyinkronkan Organization Management System (ADR-026/027) dan AI Assistant Integration (ADR-028) hasil Architecture Review Board, berdasarkan `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md`; revisi v1.8 disusun untuk menyinkronkan resolusi OD-02 (seed role final = 7, Guest bukan baris `roles`), OD-06 (kepemilikan dokumen ditetapkan ke individu bernama), dan OD-07 (kebijakan soft-delete diperluas ke 8 tabel, `ADR-046`); **revisi v1.9 disusun untuk menyinkronkan Bagian 24 poin 10 terhadap konfirmasi eksplisit Owner bahwa gate implementasi kode Modul 13 (6 Agustus 2026) dan Modul 12 (7 Agustus 2026) telah dibuka** — kedua modul kini berstatus GO penuh tanpa syarat gate tambahan, konsisten `CURRENT-PROJECT-STATE.md` rev. 8).
**Sifat dokumen:** *Living constitution* — hanya boleh diubah lewat perubahan eksplisit yang disetujui, bukan diasumsikan ulang oleh AI assistant mana pun.
**Source of Truth Hierarchy:** `architecture-decision-records.md` (mengapa & alternatif yang dipertimbangkan) → **dokumen ini, `PROJECT-CONSTITUTION.md`** (aturan mengikat turunan) → `technology-decisions.md` (katalog stack resmi, v1.5) → `SYSTEM-ARCHITECTURE.md`/`API-Specification`/`ERD` (spesifikasi teknis rinci) → kode. Jika ditemukan konflik, dokumen yang lebih ke kiri pada urutan ini menang — lihat Bagian 25 (Governance).

**Riwayat Versi Dokumen** *(disusun sebagai tabel terpisah saat konsolidasi 9 Agustus 2026 — sebelumnya hanya berupa narasi panjang di field "Disusun oleh" di atas)*:

| Versi | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| 1.0 | (sebelum 26 Jul 2026) | Draf awal, belum diaudit konflik lintas dokumen |
| 1.1 | 26 Jul 2026 | Resolusi audit konflik v1.0 → v1.1, sinkron dokumen sumber v1.1 |
| 1.2 | 28 Jul 2026 | Sinkron ADR-001 (Backend Architecture — Next.js Route Handlers, BFF tipis) |
| 1.3 | 28 Jul 2026 | Sinkron ADR-005 (Search Strategy) |
| 1.4 | 29 Jul 2026 | Sinkron ADR-006 (Job Queue Strategy) |
| 1.5 | 30 Jul 2026 | Sinkron ADR-008 (Maps Provider, direvisi v3) |
| 1.6 | 31 Jul 2026 | Sinkron ADR-018 (Caching Strategy) — 25/25 ADR original Approved |
| 1.7 | 3 Agu 2026 | Sinkron ADR-026/027 (Organization) & ADR-028 (AI Assistant) — 28/28 ADR Approved |
| 1.8 | 4 Agu 2026 | Sinkron OD-02 (seed role=7), OD-06 (kepemilikan dokumen), OD-07/ADR-046 (soft-delete 8 tabel) |
| 1.9 | 7 Agu 2026 | Gate implementasi kode Modul 12 & Modul 13 dikonfirmasi terbuka |

> **Aturan utama untuk AI Coding Assistant apa pun yang membaca dokumen ini:**
> 1. Dokumen ini **mengalahkan** asumsi default framework/library apa pun.
> 2. Jika instruksi user bertentangan dengan dokumen ini, **tanyakan konfirmasi** sebelum menyimpang — jangan diam-diam mengikuti instruksi yang melanggar *hard rule* di sini (terutama Bagian 12 — Security Rules & Bagian 5 — Authorization).
> 3. Jika sebuah keputusan belum tercakup di sini, **jangan berasumsi bebas** — ikuti pola paling dekat yang sudah ada di dokumen ini, atau tandai sebagai `// TODO: perlu keputusan arsitektur` di kode.
> 4. **Selalu rujuk dokumen sumber versi 1.1** (`PRD-RUMAHAGEN-v1.1.md`, `ERD-Skema-Database-Real-Estate-Agency-v1.1.md`, `ERD-Diagram-v1.1.mermaid`, `API-Specification-RUMAHAGEN-v1.1.md`, `User-Flow-RUMAHAGEN-v1.1.md`, `SEO-Analytics-Specification-RUMAHAGEN-v1.1.md`) — versi v1.0 dari dokumen-dokumen tersebut **sudah usang dan tidak berlaku lagi**, digantikan sepenuhnya oleh v1.1.

---

## RIWAYAT KEPUTUSAN ARSITEKTUR (Resolusi Audit Konflik v1.0 → v1.1)

Audit awal terhadap dokumen sumber v1.0 menemukan 7 ketidakkonsistenan lintas dokumen. **Seluruh 7 poin ini telah diperbaiki langsung di masing-masing dokumen sumber (kini v1.1)** — bagian ini didokumentasikan sebagai riwayat keputusan yang **final dan tidak perlu ditanyakan ulang** oleh AI Coding Assistant mana pun, kecuali user secara eksplisit ingin merevisinya.

| # | Area | Keputusan Final (sudah diterapkan di dokumen v1.1) |
|---|---|---|
| 1 | **Role Buyer** | Ditambahkan resmi sebagai baris `roles.code = 'buyer'` di ERD (akun terdaftar ringan, opsional, untuk simpan listing/lead pribadi). Guest tanpa akun tetap didukung penuh untuk melihat listing & CTA WhatsApp. |
| 2 | **Cakupan akses Manager** | Ditegaskan **selalu global (`granted_scope = 'all'`)** di seluruh dokumen — tidak ada dan tidak akan ada level "scoped tim/wilayah" di rilis ini. Bagian User Flow yang sebelumnya menyebut pembatasan tim/wilayah untuk Manager telah dikoreksi. |
| 3 | **Role Instructor** | Diformalkan sebagai role internal ke-5 (`roles.code = 'instructor'`) di tabel role utama PRD — setara Admin, terbatas ke Modul 4 (Learning Center) saja. |
| 4 | **Satuan Tenor KPR** | Ditetapkan **selalu bulan** (`tenor_months`) sebagai kontrak data/API. UI boleh menampilkan input dalam tahun, tapi wajib dikonversi (`tahun × 12`) di sisi client sebelum dikirim ke API. |
| 5 | **`developer_projects.city`** | Dimigrasi dari `VARCHAR` freetext menjadi `city_id` (FK → `ref_cities`), konsisten dengan `listings.city_id`. |
| 6 | **Framework SSR/SSG** | **Next.js (App Router)** ditetapkan sebagai keputusan default arsitektur di seluruh dokumen sumber (lihat Bagian 4 di bawah). |
| 7 | **Fitur review/rating agen** | **Diaktifkan di Fase 1.** Tabel `agent_reviews` ditambahkan ke ERD (dengan alur moderasi: submit oleh Buyer → status `pending` → approve/reject oleh Admin/Manager/Superadmin). Endpoint submit & moderasi ditambahkan ke API Specification. `aggregateRating` di structured data SEO kini relevan sejak awal. |
| 8 | **Backend Architecture (ADR-001)** | **Dikunci final (27 Juli 2026, via Architecture Review Board): Next.js Route Handlers sebagai BFF tipis, terintegrasi langsung dengan Supabase.** Opsi "service backend terpisah (NestJS/Express)" yang sebelumnya masih terbuka di Bagian 4 v1.1 kini **ditolak** untuk cakupan proyek saat ini — tidak ada `apps/api` terpisah. **Bolt.new** dikonfirmasi sebagai bagian toolchain resmi proyek. Detail lengkap: `architecture-decision-records.md` ADR-001; lihat Bagian 22 (Architecture Principles) & Bagian 24 (Technical Constraints). |
| 9 | **Search Strategy (ADR-005)** | **Dikunci final (28 Juli 2026, via Architecture Review Board): PostgreSQL Full-Text Search + ekstensi `pg_trgm` untuk Fase 1 (MVP), migrasi terjadwal ke Typesense di Fase 2** begitu salah satu kriteria ambang tercapai (volume listing aktif >±50.000, latensi p95 `/properties/search` >500ms, atau keluhan relevansi berulang ≥3 laporan independen/sprint). Status "belum ditentukan" pada baris Search Engine di Bagian 4 v1.2 kini **diselesaikan** — tidak ada lagi opsi terbuka Typesense/Elasticsearch sejak Fase 1. Detail lengkap: `architecture-decision-records.md` ADR-005; lihat Bagian 4 (Tech Stack), Bagian 22 (Architecture Principles), Bagian 23 (Coding Principles) & Bagian 24 (Technical Constraints). |
| 10 | **Job Queue Strategy (ADR-006)** | **Dikunci final (29 Juli 2026, via Architecture Review Board): Vercel Cron Jobs + Postgres Trigger/Database Webhook untuk Fase 1, migrasi terjadwal ke QStash (Upstash) di Fase 2** begitu salah satu kriteria ambang tercapai (volume job harian melampaui kapasitas batching per invocation, kebutuhan retry/backoff/dead-letter kompleks, atau frekuensi melampaui batas cron interval tier Vercel). **BullMQ+Redis ditolak** — worker long-running-nya tidak kompatibel dengan model serverless Vercel yang dikunci ADR-001. Status "belum final" pada baris Job Queue di Bagian 4 v1.3 kini **diselesaikan** — tidak ada lagi opsi terbuka Supabase Edge Functions/BullMQ sejak Fase 1. Detail lengkap: `architecture-decision-records.md` ADR-006; lihat Bagian 4 (Tech Stack), Bagian 22 (Architecture Principles), Bagian 23 (Coding Principles) & Bagian 24 (Technical Constraints). |
| 11 | **Maps Provider (ADR-008)** | **Dikunci final (30 Juli 2026, via Architecture Review Board, direvisi v3): Leaflet + OpenStreetMap (rendering) dengan LocationIQ sebagai Primary Geocoding Provider dan Geoapify sebagai Approved Alternative Provider**, dilengkapi caching berbasis Postgres (`geocode_cache`, tanpa Redis), rate limiting scoped endpoint Maps, offline/manual address fallback 3 lapis, dan roadmap migrasi bertahap MVP → Growth → Scale → Enterprise (termasuk opsi kembali ke Google Maps Platform pada tahap Enterprise). Status "belum final" pada baris Maps/Geocoding di Bagian 4 v1.4 kini **diselesaikan** — dipilih atas kriteria budget-friendly, adopsi komunitas developer Indonesia, dan Bolt-friendliness (bukan akurasi data semata). Detail lengkap: `architecture-decision-records.md` ADR-008; lihat Bagian 4 (Tech Stack), Bagian 17 (Environment Variables), Bagian 20 (Security Rules), Bagian 22 (Architecture Principles), Bagian 23 (Coding Principles) & Bagian 24 (Technical Constraints). |
| 12 | **Caching Strategy/Rate Limiting (ADR-018)** | **Dikunci final (31 Juli 2026, via Architecture Review Board): Supabase Postgres — tabel `rate_limit_log` (pola sliding window) — untuk Fase 1 (MVP)**, tanpa menambah infrastruktur cache/in-memory-store baru, dengan migrasi terjadwal ke **Upstash Redis** di Fase 2 begitu salah satu kriteria ambang tercapai (volume request endpoint sensitif >10.000/menit gabungan, query `rate_limit_log` >15% load database utama, atau kebutuhan cache aplikasi generik). Status "belum final (OPEN)" pada baris Cache/Rate Limit di Bagian 4 v1.5 kini **diselesaikan** — ini adalah ADR terakhir dari kelompok 5 ADR arsitektur/teknis original, menjadikan **25 dari 25 ADR** kelompok tsb berstatus Approved (kemudian bertambah menjadi 28/28 dengan ADR-026/027/028, lihat poin #13–14). Detail lengkap: `architecture-decision-records.md` ADR-018; lihat Bagian 4 (Tech Stack), Bagian 17 (Environment Variables), Bagian 20 (Security Rules), Bagian 22 (Architecture Principles), Bagian 23 (Coding Principles) & Bagian 24 (Technical Constraints). |
| 13 | **Organization Management System (ADR-026, ADR-027)** | **Dikunci final (3 Agustus 2026, via Architecture Review Board, Approved With Notes/Approved): entitas baru `organizations`/`organization_members`/`organization_invitations`**, dimensi `organization_status` (`individual`/`leader`/`member`) terpisah dari `roles.code` platform. Satu agen maksimal 1 Organization aktif; tidak ada transfer kepemimpinan. Otorisasi Organization dibangun sebagai **lapisan kedua independen** dari RBAC platform (ADR-024 **tidak diubah**) — Leader/Member scope dicek terpisah setelah gate role platform lolos. Merevisi status **ADR-023** (Multi-Tenancy Strategy) — `organization_id` adalah grouping construct ringan, **bukan** `tenant_id`/isolasi penuh. Modul 12 baru ditambahkan ke cakupan sistem (Bagian 1). Detail lengkap: `architecture-decision-records.md` ADR-026/ADR-027; sumber: `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md`. **Catatan cakupan:** siklus ini murni governance/arsitektur — dokumen sumber bisnis/data v1.1 (PRD/ERD/API Spec/User Flow/SEO Spec) belum disinkronkan, dijadwalkan paket terpisah menyusul. |
| 14 | **AI Assistant Integration / BYOK (ADR-028)** | **Dikunci final (3 Agustus 2026, via Architecture Review Board, Approved With Notes): model BYOK (Bring Your Own Key)** — agen (seluruh role internal berakun) menghubungkan API key sendiri dari provider terkurasi (**Google Gemini, Groq, Mistral, GitHub Models** — dipilih atas free tier berkelanjutan), diproksi backend, ditampilkan chat UI custom di dalam SaaS. Riwayat chat **tidak dipersist** sama sekali (transient, state browser). Berdiri independen dari ADR-026/027 (Organization) — tidak menyentuh entitas `organizations`/`listings`. Modul 13 baru ditambahkan ke cakupan sistem (Bagian 1). Detail lengkap: `architecture-decision-records.md` ADR-028; sumber: proposal yang sama, Bagian 18. **Catatan cakupan:** sama seperti poin 13, dokumen sumber bisnis/data v1.1 belum disinkronkan pada siklus ini. |

> Selain 7 poin di atas, seluruh "Hal yang Perlu Dikonfirmasi" lain yang masih tercantum di masing-masing dokumen sumber v1.1 (threshold DBR final, model monetisasi, kebijakan eksklusivitas developer per wilayah, provider payment gateway, pemegang akun GTM/GSC/GA4, dsb.) **tetap berstatus terbuka secara sah** — bukan konflik, melainkan keputusan bisnis yang memang belum diambil. AI Coding Assistant wajib membuat parameter tersebut **configurable** (lewat `system_configs`/`dbr_config`), bukan hard-code, agar tidak menimbulkan breaking change saat keputusan bisnis final turun (lihat Bagian 21 poin 4).

---

## 1. TUJUAN SISTEM

Platform ini mendigitalisasi operasional agensi properti Indonesia secara end-to-end:
1. Onboarding & administrasi agen properti secara mandiri (self-service registration + verifikasi dokumen).
2. Manajemen profil profesional agen sebagai "kartu nama digital" publik.
3. Manajemen listing properti per-agen (kategori Primary/Secondary, tujuan Jual/Sewa) dengan pencarian publik yang cepat & SEO-friendly.
4. Peningkatan kapabilitas agen lewat Learning Center (kursus, kuis, sertifikasi gratis).
5. Kolaborasi bisnis agen dengan developer properti lewat katalog proyek & skema komisi.
6. Membantu agen melakukan pre-screening kelayakan KPR calon pembeli lewat kalkulator DBR/DSR.
7. Memastikan seluruh halaman publik terindeks mesin pencari secepat & seakurat mungkin sejak hari pertama rilis (bukan ditambal belakangan).

**Prinsip arsitektur tertinggi:** keputusan yang mahal untuk diubah kembali (strategi rendering, struktur URL/slug, skema RBAC inti) **wajib diselesaikan di Fase 1**, bukan ditunda.

---

## 2. BUSINESS DOMAIN

- **Domain:** PropTech / Real Estate Agency SaaS — B2B2C (platform digunakan internal agensi & agennya, dikonsumsi publik oleh calon pembeli/penyewa).
- **Model transaksi:** platform **tidak** memproses transaksi jual-beli properti secara langsung (bukan payment gateway untuk closing properti) — nilai jual utama adalah *lead generation* (CTA WhatsApp) dan *tooling* (Learning Center, DBR Scoring, katalog developer).
- **Yurisdiksi:** Indonesia — mengacu UU PDP (Perlindungan Data Pribadi), memakai data wilayah administratif resmi Kemendagri/BPS, memakai standar perhitungan DBR/DSR perbankan Indonesia, mata uang IDR.
- **Kanal distribusi utama:** share manual link listing ke WhatsApp/Instagram/Facebook oleh agen — karena itu Open Graph/Twitter Card **wajib** berfungsi sempurna di setiap listing (lihat Bagian 9).
- **Monetisasi:** belum final (masih tercantum di "Hal Perlu Dikonfirmasi" masing-masing dokumen sumber) — kemungkinan komisi transaksi, tier keanggotaan, atau boost listing berbayar di fase lanjutan. Tidak ada logika pembayaran wajib di MVP; `POST /billing/*` hanya placeholder non-breaking.

---

## 3. TARGET USER & DAFTAR SELURUH ROLE

### 3.1 Hierarki Role Internal (dari tertinggi ke terendah)
```
Superadmin → Manager → Admin → Instructor → Agen
```

| Role (`roles.code`) | Level | Login? | Ringkasan Wewenang |
|---|---|:---:|---|
| `superadmin` | Internal — tertinggi | Ya | Akses penuh **tanpa batas** ke seluruh fitur, termasuk konfigurasi sistem inti & keamanan web. Satu-satunya yang boleh mengubah permission Admin/Manager/Superadmin. Tidak dapat dibatasi/dinonaktifkan (`is_protected = true`). Minimal 1 akun aktif wajib selalu ada di sistem. |
| `manager` | Internal — di atas Admin | Ya | Seluruh fungsi Admin **otomatis** + akses **global** (semua agen, semua listing, semua wilayah — **selalu `granted_scope = 'all'`, tanpa pengecualian tim/wilayah dalam bentuk apa pun**). Berwenang mengubah permission role Agen saja (via `granted_scope` pada baris `role_id = agent`). Bisa promote/demote antara Agen ↔ Admin. **Tidak** bisa menyentuh konfigurasi sistem inti/keamanan web atau permission Admin/Manager/Superadmin. |
| `admin` | Internal — standar | Ya | Operasional harian: approval agen, moderasi listing, kelola konten Event/Developer, laporan, moderasi review agen. Tidak bisa mengelola akun Admin/Manager/Superadmin lain atau ubah konfigurasi sistem inti. |
| `instructor` | Internal — terbatas ke Modul 4 | Ya | Kelola konten Learning Center (kursus, materi, bank soal) — setara Admin **hanya** di lingkup Modul 4. Tidak punya akses moderasi listing/RBAC/konfigurasi sistem. |
| `agent` | Internal — standar dasar | Ya | Kelola profil & listing **miliknya sendiri**, ikut pelatihan, pakai kalkulator DBR, klaim proyek developer. **Tidak pernah** bisa melihat/edit/hapus data milik agen lain — ini *hard rule* aplikasi (bukan permission yang bisa dilonggarkan Manager). |
| `developer_partner` | Eksternal — terbatas | Opsional (`developer_partners.user_id` nullable) | Akses portal pengajuan proyek/event miliknya sendiri saja. Event yang diajukan wajib approval Admin/Manager/Superadmin sebelum tayang. |
| `buyer` | Eksternal — akun ringan, opsional | Ya (opsional) | Akun terdaftar ringan untuk simpan listing, tracking lead pribadi, dan submit review/rating agen (`agent_reviews`, status awal `pending` sampai dimoderasi). |
| **Guest/Lead** | Publik — tanpa role/akun | Tidak | Melihat listing publik, klik CTA WhatsApp, submit form inquiry (`POST /leads`) tanpa perlu akun sama sekali. |

> **Klarifikasi seed role final (OD-02, resolved 4 Agustus 2026):** tabel di atas memuat **7 role dengan baris fisik** di tabel `roles` (`superadmin`, `manager`, `admin`, `instructor`, `agent`, `developer_partner`, `buyer`). **Guest/Lead eksplisit BUKAN baris `roles`** — direpresentasikan murni sebagai state tidak-login (tanpa `role_id`), konsisten dengan desain tabel ini sejak awal. Ini menutup drift penghitungan "7 vs 8" yang sebelumnya tercatat di `DEVELOPMENT-ROADMAP.md` vs `CHANGELOG.md`/`CURRENT-PROJECT-STATE.md`/`decision-log.md` — lihat `decision-log.md` §11 OD-02 untuk detail resolusi.

### 3.2 Hard Rules Lintas Role (tidak boleh dilonggarkan lewat Permission Matrix Editor apa pun)
1. Agen **tidak pernah** dapat mengedit/menghapus listing atau profil agen lain — enforcement di level `agent_id` ownership, bukan sekadar permission.
2. `superadmin` selalu bypass pengecekan `role_permissions` (short-circuit `true` di kode) — tidak bergantung pada data permission yang mungkin salah konfigurasi.
3. Sistem **wajib mencegah** penghapusan/downgrade akun `superadmin` terakhir yang aktif.
4. Manager hanya boleh `UPDATE` baris `role_permissions` di mana `editable_by_role_code` memuat kode role si pengubah (divalidasi di aplikasi, bukan hanya UI).
5. Setiap perubahan role/permission **wajib** tercatat di `audit_logs`.

---

## 4. TECH STACK & FRAMEWORK

> Framework ini adalah **keputusan arsitektur final** (lihat "Riwayat Keputusan Arsitektur" di atas, poin #6, #8, #9, #10, #11 & #12) — sudah diterapkan konsisten di seluruh dokumen sumber v1.1, dan menjadi acuan wajib bagi AI Coding Assistant. Baris **Backend/API** dikunci oleh **ADR-001 (Approved, 27 Juli 2026)**, baris **Search Engine** dikunci oleh **ADR-005 (Approved, 28 Juli 2026)**, baris **Job Queue** dikunci oleh **ADR-006 (Approved, 29 Juli 2026)**, baris **Maps/Geocoding** dikunci oleh **ADR-008 (Approved, 30 Juli 2026, direvisi v3)**, dan baris **Cache/Rate Limit** dikunci oleh **ADR-018 (Approved, 31 Juli 2026)** — kelimanya tidak lagi berupa pilihan terbuka seperti versi sebelumnya dokumen ini. **Tidak ada lagi baris di tabel ini yang berstatus OPEN.**

| Layer | Pilihan | Alasan Keterikatan ke Dokumen Sumber |
|---|---|---|
| **Frontend Framework** | **Next.js (App Router, versi stabil terbaru)** | Satu-satunya pilihan yang memenuhi syarat SSR/SSG/ISR wajib di SEO Spec §1.1 untuk Homepage/Search/Detail Listing/Profil Agen/Detail Proyek, sekaligus mendukung React ecosystem. |
| **Styling** | Tailwind CSS + komponen headless (shadcn/ui atau setara) | Konsisten dengan kebutuhan Core Web Vitals rendah-JS & desain sistem yang dapat diaudit. |
| **Backend/API** | **Node.js (TypeScript) — Next.js Route Handlers sebagai BFF tipis, terintegrasi langsung dengan Supabase (Auth, Postgres, Storage) via service role key server-side.** Seluruh endpoint `API-Specification-v1.1.md` diimplementasikan di `apps/web/app/api/v1/**/route.ts`. **Tidak ada** dan **tidak boleh diadakan** service backend Node terpisah (NestJS/Express) untuk cakupan proyek saat ini — mencampur kedua pola dilarang. | **ADR-001 (Approved, 27 Juli 2026)**: selaras dengan ADR-002/004/009/010/021 yang sudah mengasumsikan integrasi rapat Supabase+Vercel; kompatibel struktural dengan **Bolt.new** (satu aplikasi full-stack Node/Next.js dalam WebContainer); tidak ada bukti kebutuhan proses long-running/heavy-compute di PRD. Lihat Bagian 22 (Architecture Principles) & Bagian 24 (Technical Constraints) untuk konsekuensi wajib (batas eksekusi serverless). |
| **Database** | **PostgreSQL** (via Supabase) | ERD memakai relasi ketat (FK, ENUM, UNIQUE composite) yang cocok RDBMS; Supabase memberi Auth + Storage + Row Level Security siap pakai tanpa membangun ulang dari nol. |
| **Auth Provider** | Supabase Auth (email/password, OTP, Google OAuth2) dibungkus JWT internal platform | Selaras API Spec §0.1 & §1.1 — hasil akhir tetap JWT platform sendiri, agar seluruh endpoint lain tidak perlu tahu metode login. |
| **Search Engine** | **PostgreSQL Full-Text Search + ekstensi `pg_trgm` untuk Fase 1 (MVP).** Migrasi terjadwal ke **Typesense** di Fase 2 begitu kriteria ambang tercapai (volume listing >±50.000, latensi p95 >500ms, atau keluhan relevansi berulang). | Untuk `/properties/search`, `/properties/autocomplete`, typo-tolerance & performa filter kombinasi. **ADR-005 (Approved, 28 Juli 2026)**: konsisten dengan filosofi minimal-vendor ADR-001, tidak menambah komponen infrastruktur di Fase 1; tidak boleh diasumsikan mengarah ke Typesense/Elasticsearch sejak awal — implementasi Fase 2 menunggu kriteria ambang, bukan keputusan sepihak AI Coding Assistant. |
| **Storage/CDN** | Supabase Storage (bucket publik: `listing-photos`, `listing-videos`, `developer-project-media`; bucket privat: `agent-verification-documents`, hanya via signed URL) | Sesuai API Spec §9.2 dan ADR-009 (Approved). |
| **Cache/Rate Limit** | **Dikunci final (ADR-018 — Status: Approved, 31 Juli 2026).** Supabase Postgres — tabel `rate_limit_log` (pola sliding window) — untuk Fase 1, tanpa Redis. Migrasi terjadwal ke **Upstash Redis** di Fase 2 begitu kriteria ambang tercapai (volume request endpoint sensitif >10.000/menit, query `rate_limit_log` >15% load database utama, atau kebutuhan cache aplikasi generik). | Untuk rate limiting (API Spec §0.5) endpoint sensitif (login, register, forgot-password, submit form publik) dan blocklist status refresh token lintas-instance. Caching halaman publik edge-level (TTFB target SEO Spec §5) **tetap** inheren dari ADR-021/ADR-010, tidak memerlukan keputusan terpisah. Independen dari `geocode_cache`/`api_rate_limits` (ADR-008, scoped khusus Maps). |
| **Job Queue** | **Vercel Cron Jobs + Postgres Trigger/Database Webhook untuk Fase 1.** Migrasi terjadwal ke **QStash (Upstash)** di Fase 2 begitu kriteria ambang tercapai (volume job harian, retry/backoff kompleks, atau frekuensi melampaui batas cron interval). | Untuk: regenerasi sitemap otomatis, kalkulasi ulang counter denormalisasi (`total_listings_sold`, `cta_click_count`), pengiriman notifikasi, panggilan Google Indexing API. **ADR-006 (Approved, 29 Juli 2026)**: konsisten dengan filosofi minimal-vendor ADR-001; BullMQ+Redis ditolak karena worker long-running tidak kompatibel dengan model serverless. |
| **Maps/Geocoding** | **Dikunci final (ADR-008 — Status: Approved, 30 Juli 2026, direvisi v3).** Leaflet + React-Leaflet (rendering, tiles OpenStreetMap gratis) dengan LocationIQ sebagai Primary Geocoding Provider dan Geoapify sebagai Approved Alternative Provider (failover). | Autocomplete alamat client-side; reverse geocoding & distance matrix server-side (`LOCATIONIQ_API_KEY`/`GEOAPIFY_API_KEY` rahasia). Dilengkapi cache `geocode_cache` (Postgres, TTL ~90 hari), rate limiting scoped (Autocomplete 20/menit/IP, Geocode 10/menit/IP), dan offline/manual address fallback 3 lapis. Roadmap migrasi bertahap MVP → Growth → Scale → Enterprise. |
| **Analytics** | GTM + GA4, dikonfigurasi via `system_configs`, dikelola Superadmin saja | Sesuai SEO Spec §4. |
| **CI/CD** | Git-based pipeline (GitHub Actions) + **Vercel** sebagai hosting/deployment (ADR-010, Approved) — lint, type-check, test, migration check wajib lolos sebelum merge ke `main` | Bagian 21 (Development Rules). |
| **Dev Toolchain** | **Bolt.new** dikonfirmasi resmi (ADR-001 Notes) sebagai bagian alur pengembangan AI-assisted lintas sesi, berdampingan dengan Cursor/Claude Code/GPT/Copilot. | Menjadi salah satu alasan struktural ADR-001 memilih pola BFF tunggal (kompatibilitas WebContainer). |

---

## 5. STRUKTUR FOLDER (Monorepo, Next.js App Router)

> **Dikunci oleh ADR-001 (Approved, 27 Juli 2026):** struktur di bawah ini kini final — **tidak ada** `apps/api` (service backend terpisah). Struktur v1.1 sebelumnya yang mencantumkan `apps/api` sebagai opsi paralel telah dihapus; seluruh logic backend berada di `apps/web/app/api`.

```
/apps
  /web                       # Next.js app (publik + dashboard + admin, dipisah via route groups)
    /app
      /(public)/             # SSR/SSG — homepage, search, listing detail, agent profile, developer project
        /properti/[slug]/
        /agen/[slug]/
        /developer/[slug]/
        /cari/
      /(auth)/                # login, register, forgot-password, verify-otp
      /(dashboard)/           # CSR privat — agent dashboard, noindex
        /agen/
          /listing/
          /dbr/
          /learning-center/
      /(admin)/               # CSR privat — admin panel, noindex, role-gated
        /users/
        /listings/
        /rbac/
        /system-config/
      /api/                   # Route Handlers BFF tipis — WAJIB, satu-satunya lapisan API (ADR-001)
        /v1/
          /auth/
          /agents/
          /listings/
          /learning-center/
          /events/
          /developer-projects/
          /dbr-calculator/
          /notifications/
          /rbac/
          /seo/
    /components
      /ui/                    # komponen dasar (button, input, card) — reusable, tanpa business logic
      /features/{module}/     # komponen spesifik per modul (listing-form, dbr-calculator, dsb.)
    /lib
      /api-client/            # wrapper fetch/axios ke backend, typed
      /supabase/              # supabase client (browser + server, terpisah)
      /seo/                   # helper generate meta tag, JSON-LD, sitemap
      /validation/            # skema Zod, satu sumber kebenaran form + API
      /modules/{module}/      # business logic murni TypeScript per modul (service layer) — dipanggil dari Route Handlers, TIDAK bergantung pada Next.js runtime, agar dapat diekstraksi ke service terpisah di masa depan (ADR-001 Consequences) tanpa rewrite total
      /middleware/            # auth.middleware, rbac.middleware, rate-limit.middleware — dipanggil dari dalam Route Handlers (bukan Next.js Middleware bawaan, kecuali untuk redirect/edge-level concern)
      /jobs/                  # trigger job asinkron (sitemap regen, counter sync, reminders) — Vercel Cron + Postgres Trigger/Webhook (ADR-006, Approved)
    /styles
    /public
    /migrations                # SQL migration murni, sinkron dengan ERD — dikelola via Supabase CLI (bukan folder terpisah di apps/api)

/packages
  /shared-types/               # TypeScript types/interfaces hasil generate dari skema DB & kontrak API (single source of truth FE↔BE)
  /region-data/                # seed data wilayah Indonesia (provinces/cities/districts/villages)

/docs
  PROJECT-CONSTITUTION.md          # dokumen ini
  PRD-RUMAHAGEN-v1.1.md
  ERD-Skema-Database-Real-Estate-Agency-v1.1.md
  ERD-Diagram-v1.1.mermaid
  API-Specification-RUMAHAGEN-v1.1.md
  User-Flow-RUMAHAGEN-v1.1.md
  SEO-Analytics-Specification-RUMAHAGEN-v1.1.md
```

**Aturan folder wajib:**
- Halaman di dalam route group `(public)` **dilarang** memanggil data-fetching client-side murni (`useEffect` + `fetch`) sebagai sumber data utama — harus lewat Server Component/`getServerSideProps`-equivalent agar SSR tetap terpenuhi (SEO Spec §1.1).
- Halaman di `(dashboard)` dan `(admin)` **wajib** menyertakan meta `robots: noindex, nofollow` di layout masing-masing route group — tidak boleh mengandalkan `robots.txt` saja (SEO Spec §1.3).
- `packages/shared-types` adalah **satu-satunya** tempat definisi tipe entitas (Listing, AgentProfile, dsb.) — dilarang mendefinisikan ulang shape data yang sama di lapisan Route Handler dan lapisan komponen React secara terpisah (ADR-001: keduanya kini berada dalam satu `apps/web`, sehingga duplikasi tipe menjadi risiko yang lebih mudah lolos review — perhatikan khusus).
- **Business logic wajib berada di `/lib/modules/{module}`** (Zod schema + kalkulasi + query builder), bukan langsung ditulis di badan fungsi `route.ts` — Route Handler hanya boleh berisi: parsing request → panggil service `/lib/modules` → format response envelope (Bagian 8). Ini menjaga jalur migrasi ke service terpisah tetap terbuka (ADR-001 Consequences) tanpa mengubah keputusan lokasi eksekusi saat ini.

---

## 6. CODING CONVENTION

- **Bahasa:** TypeScript wajib di seluruh layer (frontend & backend) — `strict: true` di `tsconfig.json`, tidak ada `any` implisit.
- **Linting/Formatting:** ESLint + Prettier, konfigurasi seragam di root monorepo, dijalankan sebagai pre-commit hook (Husky + lint-staged) dan sebagai CI gate wajib.
- **Komponen React:** functional component + hooks saja, tidak ada class component baru.
- **Business logic terpisah dari UI:** komponen React tidak boleh berisi kalkulasi bisnis (mis. formula DBR, validasi ownership) — logic tersebut wajib berada di `/lib` atau layer service backend, dapat di-unit-test tanpa render komponen.
- **Satu tanggung jawab per file/modul:** modul backend (`/modules/{nama}`) mengikuti struktur konsisten: `*.controller.ts`, `*.service.ts`, `*.repository.ts`, `*.schema.ts` (Zod), `*.types.ts`.
- **Tidak ada magic number/string:** threshold DBR, masa expired listing, passing grade, dsb. **wajib** dibaca dari `system_configs`/`dbr_config`, tidak boleh hard-code di kode (selaras ERD §4 & PRD Modul 7).
- **Komentar:** wajib untuk setiap implementasi *hard rule* keamanan/RBAC (mis. filter `agent_id`), agar reviewer/AI assistant berikutnya tidak menghapusnya secara tidak sengaja saat refactor.

---

## 7. NAMING CONVENTION

| Konteks | Konvensi | Contoh |
|---|---|---|
| Tabel & kolom database | `snake_case`, tabel jamak | `listings`, `agent_verification_documents`, `whatsapp_number` |
| Enum value di DB | `snake_case` huruf kecil | `pending_review`, `fully_furnished` |
| Endpoint REST | `kebab-case`, resource jamak | `/developer-projects`, `/agents/me/dbr-simulations` |
| Query param | `snake_case` | `?property_type=rumah&price_min=...` |
| JSON field di request/response API | `snake_case` (selaras contoh di API Spec) | `"whatsapp_number"`, `"eligibility_status"` |
| Variabel & fungsi TypeScript | `camelCase` | `getListingBySlug()`, `agentId` |
| Tipe & interface TypeScript | `PascalCase` | `ListingEntity`, `DbrSimulationResult` |
| Komponen React | `PascalCase`, file sama dengan nama komponen | `ListingCard.tsx` |
| Konstanta enum di kode aplikasi | `SCREAMING_SNAKE_CASE` | `LISTING_STATUS.PENDING_REVIEW` |
| Slug URL publik | lowercase, spasi→`-`, diakhiri `{short_id}` | `rumah-minimalis-2-lantai-bsd-city-9f21a` |
| Nama branch Git | `{tipe}/{modul}-{ringkasan}` | `feat/m3-listing-crud`, `fix/m7-dbr-rounding` |
| Commit message | Conventional Commits | `feat(listing): add slug auto-generate with short id` |

> **Konsistensi FE↔BE↔DB adalah wajib**: field yang sama harus memakai nama yang identik di ketiga layer (DB `snake_case` → API JSON `snake_case` → hanya dikonversi ke `camelCase` di dalam kode TypeScript lewat mapper/DTO, tidak "bocor" jadi campuran di response API).

---

## 8. API CONVENTION

Mengikuti API Specification v1.1 secara ketat. Ringkasan aturan wajib:

- **Base URL & versioning:** `https://api.<domain>.id/api/v1` — perubahan breaking wajib naik versi (`/v2`), tidak boleh mengubah kontrak `/v1` yang sudah live.
- **Auth header:** `Authorization: Bearer {access_token}` (JWT). Setiap endpoint diberi label eksplisit di dokumentasi: `Public`, `Authenticated`, atau role spesifik (termasuk `Buyer` sebagai role formal).
- **Response envelope wajib**, tidak boleh menyimpang:
  ```json
  // Sukses
  { "success": true, "data": { ... }, "meta": { "page": 1, "per_page": 20, "total": 134 } }
  // Gagal
  { "success": false, "error": { "code": "LISTING_NOT_FOUND", "message": "...", "details": null } }
  ```
- **Kode status HTTP** mengikuti tabel API Spec §0.3 — termasuk aturan penting: data privat milik user lain **disamarkan sebagai 404**, bukan 403, agar tidak membocorkan keberadaan resource (mis. agen coba akses listing agen lain → 404, bukan "403 bukan milik Anda").
- **Pagination standar:** `?page=1&per_page=20&sort=created_at&order=desc` di semua endpoint list.
- **Rate limiting:** publik 60 req/menit/IP; authenticated 300 req/menit/user; endpoint sensitif (login/register/OTP/forgot-password) 5 req/menit/IP+identifier.
- **Idempotency:** endpoint `POST` yang bisa dipicu ganda oleh double-click (mis. `POST /listings/{id}/cta-click`, `POST /courses/{id}/enroll`) wajib idempotent atau punya guard duplikat (constraint `UNIQUE` di DB sudah menegakkan ini untuk enrollment/klaim proyek/registrasi event).
- **RBAC middleware wajib di setiap endpoint** — urutan pengecekan baku (API Spec §0.6): (1) validasi token → `role_id`, (2) cek permission `module_code+action_code`, (3) jika `granted_scope=own` → filter otomatis `WHERE agent_id = current_user.id`, (4) jika `all` → tanpa filter kepemilikan tapi tetap lewat pengecekan permission, (5) `superadmin` selalu bypass.
- **Filter geografis:** endpoint publik yang menerima lokasi **wajib** menerima `province_id`/`city_id`/`district_id` (UUID dari tabel referensi), bukan nama teks bebas — termasuk `GET /developer-projects?city_id=...` (bukan lagi parameter `city` freetext, sejak migrasi ERD v1.1). Pemetaan slug URL human-readable (`?kota=tangerang-selatan`) ke ID adalah tanggung jawab frontend, bukan mengubah kontrak API.
- **Satuan tenor DBR:** field `tenor_months` pada `POST /calculator/dbr` **selalu dalam bulan** — tidak ada varian endpoint/parameter yang menerima tahun.
- **Review agen:** `POST /agents/{id}/reviews` (Auth: Buyer) selalu membuat baris berstatus `pending`; hanya `PUT /admin/agent-reviews/{id}/approve` (Auth: Superadmin/Manager/Admin) yang membuatnya tampil publik dan masuk `aggregateRating`.

---

## 9. DATABASE CONVENTION

Mengikuti ERD & Skema Database v1.1 sebagai satu-satunya sumber kebenaran struktur data. Aturan tambahan wajib:

- **Primary key:** UUID di seluruh tabel (konsisten dengan ERD), bukan auto-increment integer, agar ID tidak menjadi sumber enumerasi listing/agen kompetitor.
- **Migration murni SQL** (bukan ORM auto-sync di production) — setiap perubahan skema harus melalui file migrasi bernomor urut, dapat di-review, dan reversible.
- **Soft delete** (`deleted_at`) wajib untuk **8 tabel**: `listings`, `users`, `developer_projects` (asli, `ADR-004`/`ADR-030`), ditambah `agent_profiles`, `agent_reviews`, `courses`, `events`, `developer_partners` (diperluas 4 Agustus 2026, `ADR-046`/OD-07) — **dilarang** melakukan `DELETE` fisik pada tabel-tabel ini via aplikasi. Prinsip umum: soft-delete wajib untuk entitas yang direferensikan FK oleh tabel lain atau tampil di halaman publik/bernilai audit; hard-delete diizinkan untuk data child/log/transien murni.
- **Index wajib sejak migrasi awal** (bukan ditambahkan belakangan):
  - `listings(status, category, transaction_type, city_id, price)`
  - `listing_leads(listing_id, created_at)`
  - `dbr_simulations(agent_id, created_at)`
  - `developer_projects(city_id, status, property_type)`
  - `agent_reviews(agent_id, status)`
  - UNIQUE index pada `listings.slug`, `developer_projects.slug`, `agent_profiles.public_slug` (konflik slug wajib tertangkap di level DB).
  - Full-text/trigram index pada `listings.area_keyword`.
- **Enkripsi at-rest wajib** untuk: `agent_verification_documents.file_url`, dan seluruh field finansial di `dbr_simulations` (`net_income`, `existing_installments`).
- **Counter yang didenormalisasi** (`listings.cta_click_count`, `agent_profiles.total_listings_sold/rented`) **wajib** diperbarui via trigger DB atau scheduled job — **dilarang** dihitung on-the-fly di setiap request (masalah performa dashboard). `agent_reviews.rating` rata-rata **dikecualikan** dari aturan ini — dihitung on-the-fly (`AVG(rating) WHERE status='approved'`) karena volume review per agen relatif kecil di Fase 1.
- **`agent_reviews.status` wajib difilter `= 'approved'`** di setiap query publik (halaman profil agen, `aggregateRating` JSON-LD); status `pending`/`rejected` hanya boleh terlihat oleh query moderasi (Admin/Manager/Superadmin).
- **`developer_projects.city_id`** (FK → `ref_cities`) — **dilarang** menambahkan kembali kolom freetext untuk lokasi proyek developer; ikuti pola cascading region yang sama dengan `listings`.
- **Trigger wajib untuk `url_redirects`**: setiap `UPDATE` pada `listings.slug`/`developer_projects.slug`, atau soft-delete permanen entitas berhalaman publik, **wajib** menulis baris baru ke `url_redirects` **sebelum** perubahan diterapkan — diimplementasikan sebagai DB trigger atau hook aplikasi non-optional (tidak boleh langkah manual yang bisa terlupa).
- **Data wilayah Indonesia** (`ref_provinces/cities/districts/villages`) di-seed sekali dari dataset resmi (Kemendagri/BPS) dan di-host internal — **dilarang** memanggil API pihak ketiga untuk data ini di request path pencarian (hanya dipakai untuk autocomplete alamat jalan & pin peta presisi, bukan data administratif).
- **Constraint aplikasi non-SQL wajib:** mencegah `UPDATE`/`DELETE` pada `users` yang menghasilkan 0 user aktif dengan `role_id = superadmin`.

---

## 10. AUTHENTICATION CONVENTION

- **JWT Bearer Token**: access token umur pendek (15–60 menit), refresh token umur panjang (30 hari) disimpan sebagai **httpOnly secure cookie** (bukan localStorage, untuk mitigasi XSS).
- **Metode login yang didukung:** email/password (dengan OTP verification saat registrasi), Google OAuth2 (server-side verifikasi `id_token` via Google Auth Library resmi — **tidak boleh** trust token dari client tanpa verifikasi server).
- Login via Google untuk role `agent` **tetap** melalui alur `pending_review` (wajib upload dokumen legalitas) — Google OAuth **tidak** melewati proses approval manual.
- **Endpoint sensitif** (`/auth/login`, `/auth/register`, `/auth/verify-otp`, `/auth/resend-otp`, `/auth/forgot-password`) wajib rate-limited 5 req/menit/IP+identifier untuk mencegah brute-force.
- **Manajemen sesi:** `POST /auth/logout` (invalidasi 1 device) dan `POST /auth/logout-all` (invalidasi seluruh sesi) wajib tersedia dan benar-benar menghapus refresh token dari storage (blocklist Redis/DB), bukan hanya menghapus cookie di client.
- **Password:** hashing wajib pakai algoritma adaptif (bcrypt/argon2), tidak boleh SHA/MD5 telanjang. Kebijakan minimal panjang & kompleksitas ditentukan saat implementasi form validasi (Bagian 13).

---

## 11. AUTHORIZATION CONVENTION (RBAC)

Mengacu penuh ke PRD Modul 10 & ERD §2.28–2.30 (v1.1), termasuk keputusan final soal cakupan Manager & role Instructor (lihat "Riwayat Keputusan Arsitektur" di atas).

1. **Struktur data:** `roles` → `permissions` (kombinasi `module_code + action_code`, unik) → `role_permissions` (pivot dengan `granted_scope` override & `editable_by_role_code`).
2. **Middleware wajib di backend** untuk setiap endpoint — **tidak cukup** menyembunyikan tombol di UI. Response untuk role tanpa akses ke suatu modul: halaman/response "Akses Ditolak" yang informatif (bukan error generik 500).
3. **Scope resolution:**
   - `granted_scope = 'own'` → query otomatis difilter `WHERE agent_id = current_user.id` (berlaku Agen).
   - `granted_scope = 'all'` → tanpa filter kepemilikan (berlaku Superadmin/Manager/Admin) — **tetap** wajib lolos pengecekan permission terlebih dahulu.
   - `granted_scope = 'none'` → 403.
   - **Tidak ada** level `scoped`/tim/wilayah di rilis ini — ini keputusan final, jangan diimplementasikan tanpa perubahan skema eksplisit yang disetujui ulang.
4. **Batasan Manager wajib divalidasi di aplikasi**, bukan hanya UI: `UPDATE role_permissions` hanya diizinkan jika `editable_by_role_code` baris target memuat kode role si pengubah.
5. **`superadmin` selalu short-circuit `true`** sebelum query ke `role_permissions` — konsisten dengan business rule "Superadmin tidak dapat dibatasi".
6. **Hard rule ownership Agen** (lihat Bagian 3.2) diterapkan **terpisah** dari matriks permission — bahkan jika suatu saat Manager keliru memberi `granted_scope=all` ke role Agen, backend **tetap** menolak (403) `UPDATE`/`DELETE` Agen terhadap baris `listings`/`agent_profiles` yang `agent_id`-nya bukan miliknya. Ini kode, bukan konfigurasi.
7. **Audit wajib**: setiap perubahan role/permission dicatat di `audit_logs` (siapa, kapan, nilai lama/baru) dan berlaku *real-time* pada request berikutnya (tidak perlu re-login, tapi token yang sudah terbit tetap dicek ulang scope-nya di backend per-request, bukan hanya saat login).

---

## 12. SUPABASE CONVENTION

> Berlaku jika Supabase dipilih sebagai backend Postgres+Auth+Storage (lihat Bagian 4).

- **Row Level Security (RLS) wajib aktif di seluruh tabel** yang berisi data ber-scope kepemilikan (`listings`, `agent_profiles`, `dbr_simulations`, `agent_verification_documents`, `notifications`, dsb.). RLS berfungsi sebagai **lapisan pertahanan kedua** — pengecekan RBAC di middleware backend (Bagian 11) tetap wajib sebagai lapisan pertama; **tidak boleh** hanya mengandalkan salah satu.
- **Service role key** (bypass RLS) **hanya** dipakai di backend server-side untuk operasi admin/job terjadwal (regenerasi sitemap, sinkronisasi counter) — **dilarang keras** dikirim/di-expose ke client (browser/mobile).
- **Supabase Auth** dipakai untuk mekanisme login (email/OTP/Google OAuth), tetapi **role/permission tetap dikelola di tabel `roles`/`role_permissions` milik aplikasi** (bukan memakai `auth.users` metadata sebagai satu-satunya sumber kebenaran role) — agar konsisten dengan skema RBAC kustom di ERD Modul 10.
- **Supabase Storage buckets** dipisah tegas:
  - Bucket publik (`listing-photos`, `listing-videos`, `developer-project-media`) → boleh diakses CDN publik, dioptimasi WebP/AVIF.
  - Bucket privat (`agent-verification-documents`) → **tidak pernah publik**, akses hanya via *signed URL* berumur pendek untuk role `superadmin`/`manager`/`admin` saat proses review.
- **Realtime subscriptions** (jika dipakai untuk notifikasi in-app) **wajib** tetap difilter RLS per `user_id` — tidak boleh subscribe ke tabel penuh tanpa filter.
- **Edge Functions** dipakai untuk logic yang butuh dekat dengan DB & idempotent (mis. trigger `url_redirects`, panggilan Google Indexing API saat listing publish) — bukan untuk business logic kompleks yang lebih cocok di backend service utama.
- **Migration**: dikelola lewat Supabase CLI migration files yang disimpan di repo (`/apps/api/migrations`), **tidak** mengedit skema langsung lewat Supabase Studio di environment production.

---

## 13. ERROR HANDLING STANDARD

- Seluruh error API **wajib** memakai envelope standar (Bagian 8) — kode error memakai format `SCREAMING_SNAKE_CASE` deskriptif (`LISTING_NOT_FOUND`, `DBR_THRESHOLD_CONFIG_LOCKED`, `SLUG_ALREADY_EXISTS`), didaftarkan di satu file konstanta pusat (`packages/shared-types/error-codes.ts`) agar FE dapat menampilkan pesan lokal yang tepat tanpa parsing string `message`.
- **Tidak boleh** membocorkan detail internal (stack trace, query SQL, nama tabel) ke response API — detail teknis hanya masuk ke log server (Bagian 14).
- **Data privat milik user lain** → 404 (bukan 403) untuk mencegah enumerasi keberadaan resource (selaras API Spec §0.3).
- **Percobaan akses tanpa izin RBAC** → 403 dengan `error.code = "FORBIDDEN_ROLE_ACCESS"` dan pesan yang informatif (bukan generik), sesuai Acceptance Criteria PRD Modul 10.
- **Validasi bisnis gagal** (bukan validasi format input) → 422, mis. DBR melebihi threshold saat submit final, kuota event penuh.
- **Global error boundary** di frontend (React Error Boundary per route group) — kegagalan satu widget dashboard tidak boleh mematikan seluruh halaman.
- Setiap error tak tertangani di backend **wajib** ter-log dengan `request_id`/`correlation_id` yang sama dengan yang dikembalikan ke client (di `error.details.request_id`) untuk mempermudah tracing.

---

## 14. FORM VALIDATION STANDARD

- **Zod** (atau setara) sebagai satu sumber skema validasi, dipakai **baik** di frontend (validasi real-time form) **maupun** backend (validasi ulang sebelum tulis DB) — skema didefinisikan sekali di `packages/shared-types` atau `lib/validation`, tidak diduplikasi manual di dua tempat.
- **Backend tidak boleh mempercayai validasi frontend** — validasi ulang di server wajib untuk semua endpoint mutating (`POST`/`PUT`/`PATCH`).
- **Field wajib per PRD Modul 3.2** (judul, lokasi lengkap cascading province/city/district, harga, minimal 3 foto, status legalitas, nomor WA) divalidasi **sebelum** status listing bisa berubah ke `pending_review`.
- **Field lokasi administratif** (`province_id`/`city_id`/`district_id`) divalidasi terhadap keberadaan baris di tabel referensi (bukan hanya format UUID) — cascading (city harus benar-benar berada di province terpilih, dst).
- **`area_keyword`**: divalidasi panjang maksimal 20 karakter, freetext, tidak divalidasi terhadap data wilayah.
- **Data finansial DBR** (`net_income`, `existing_installments`, dsb.): validasi tipe numerik positif, batas wajar (mis. tidak boleh negatif/nol untuk `net_income`), dan **konversi tenor tahun→bulan** dilakukan di layer validasi frontend sebelum payload dikirim — lihat keputusan final satuan tenor di "Riwayat Keputusan Arsitektur" poin #4.
- **Pesan error validasi** wajib dalam Bahasa Indonesia yang jelas untuk pengguna akhir (agen), terpisah dari `error.code` teknis di Bagian 13.

---

## 15. LOGGING STANDARD

- **Structured logging** (JSON) di seluruh backend — bukan `console.log` string bebas — dengan field minimal: `timestamp`, `level`, `request_id`, `user_id` (jika ada), `module`, `action`, `message`.
- **Level log:** `error` (kegagalan sistem/exception), `warn` (percobaan akses ditolak, rate limit terlampaui), `info` (aksi bisnis penting: listing published, agen approved, role diubah), `debug` (hanya aktif non-production).
- **Audit log bisnis** (`audit_logs` di DB) **terpisah** dari log teknis aplikasi — audit log mencatat *siapa-kapan-apa* untuk aksi sensitif (approve/reject agen, moderasi listing, perubahan permission/role, perubahan konfigurasi sistem inti) dan **tidak boleh** dihapus/di-rotate seperti log teknis biasa.
- **Data sensitif dilarang masuk log** dalam bentuk plain text: `net_income`, `existing_installments`, nomor KTP/NPWP, password (bahkan hash tidak perlu di-log), token JWT penuh (log hanya prefix/hash token untuk korelasi).
- **Data ke GA4/GTM tidak boleh menyertakan PII** (nama lengkap, no. HP, email calon pembeli) — hanya event & parameter agregat (`listing_id`, `city`, `price_range_bucket`), sesuai SEO Spec §4.4.
- **Retention:** log teknis minimal 30 hari (untuk investigasi insiden), audit log bisnis **tidak dihapus** (retensi permanen atau sesuai kebijakan kepatuhan yang ditentukan kemudian).

---

## 16. FILE UPLOAD STANDARD

- **Foto listing:** minimal 3 foto wajib sebelum submit review, format JPEG/PNG/WebP, upload lewat `POST /listings/{id}/media`, disimpan ke CDN publik dengan transformasi otomatis (resize sesuai viewport, kompresi WebP/AVIF) — **tidak** menyimpan file resolusi penuh mentah sebagai satu-satunya salinan.
- **`alt_text` wajib terisi** untuk setiap foto (auto-generate dari template `"{title} - foto {n}"` jika agen tidak mengisi manual) — untuk SEO gambar (SEO Spec §2.4).
- **Video/virtual tour:** opsional, validasi ukuran file & durasi maksimal ditentukan saat implementasi (belum ada angka final di dokumen sumber — jangan hard-code angka arbitrer tanpa mencatatnya sebagai konfigurasi).
- **Dokumen legalitas agen** (KTP/NPWP/sertifikasi): upload ke **bucket privat terpisah**, **wajib** dienkripsi at-rest, **tidak pernah** melalui CDN publik, akses hanya via signed URL berumur pendek untuk role review (`superadmin`/`manager`/`admin`).
- **Validasi tipe file di server** (bukan hanya ekstensi nama file di client) — cek magic bytes/MIME type sesungguhnya untuk mencegah upload file executable menyamar sebagai gambar.
- **Foto cover:** dapat dipilih dari salah satu foto yang sudah diupload (`is_cover = true`), hanya satu foto cover aktif per listing (enforce di service layer, bukan constraint DB tunggal karena butuh "hanya satu true").

---

## 17. ENVIRONMENT VARIABLES

Konvensi penamaan: `SCREAMING_SNAKE_CASE`, dikelompokkan per domain, **tidak pernah** di-commit ke repo (`.env` masuk `.gitignore`; `.env.example` berisi key tanpa value rahasia).

```
# App
NODE_ENV=
APP_URL=
API_BASE_URL=

# Database (Supabase/Postgres)
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=            # aman di client
SUPABASE_SERVICE_ROLE_KEY=    # RAHASIA — server-side only, tidak pernah ke client

# Auth
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=

# Storage/CDN
STORAGE_BUCKET_PUBLIC=
STORAGE_BUCKET_PRIVATE=
CLOUDINARY_URL=                # atau ImageKit/S3 setara

# Maps (ADR-008, Approved v3 — Leaflet+OpenStreetMap+LocationIQ/Geoapify)
LOCATIONIQ_API_KEY=            # RAHASIA — server-side only (Primary Geocoding Provider: geocoding, reverse geocoding, autocomplete)
GEOAPIFY_API_KEY=              # RAHASIA — server-side only (Approved Alternative Provider — failover otomatis)
# Catatan: tiles OpenStreetMap (Leaflet) tidak memerlukan API key — tanpa client-key terpisah,
# berbeda dari skema Google Maps Platform di versi dokumen sebelumnya

# Search
TYPESENSE_HOST=
TYPESENSE_API_KEY=

# Cache/Queue — Fase 2 kondisional (ADR-018, Approved — Postgres-native rate_limit_log tidak butuh env var Fase 1)
UPSTASH_REDIS_REST_URL=       # RAHASIA — hanya diisi saat migrasi Fase 2 benar-benar dieksekusi
UPSTASH_REDIS_REST_TOKEN=     # RAHASIA — hanya diisi saat migrasi Fase 2 benar-benar dieksekusi

# SEO/Analytics — NILAI SEBENARNYA disimpan di `system_configs` (dikelola Superadmin di Admin Panel),
# variabel env berikut hanya dipakai untuk seeding awal/lokal dev, BUKAN sumber kebenaran production
GTM_CONTAINER_ID=
GA4_MEASUREMENT_ID=
GSC_VERIFICATION_META=
GOOGLE_INDEXING_API_SERVICE_ACCOUNT=   # RAHASIA — JSON key untuk panggil Google Indexing API

# Rate limiting
RATE_LIMIT_PUBLIC_PER_MIN=60
RATE_LIMIT_AUTHENTICATED_PER_MIN=300
RATE_LIMIT_SENSITIVE_PER_MIN=5
```

**Aturan wajib:**
- Semua key berakhiran `_SECRET`, `_SERVICE_ROLE_KEY`, `*_SERVER` **dilarang** di-bundle ke JavaScript client-side (audit build output secara berkala).
- Konfigurasi bisnis yang **bisa berubah tanpa deploy ulang** (threshold DBR, masa expired listing, GTM Container ID) **wajib** disimpan di tabel `system_configs`/`dbr_config`, **bukan** di environment variable — env var hanya untuk secret & konfigurasi infrastruktur.

---

## 18. DESIGN PRINCIPLES

1. **SEO-first, bukan SEO-afterthought**: setiap halaman publik baru yang dibuat wajib dicek terhadap checklist SEO Spec §8 (SSR, slug, meta tag, structured data, sitemap) **sebelum** dianggap selesai — bukan tugas terpisah yang dikerjakan belakangan.
2. **Ownership data sebagai hard boundary**: `agent_id` adalah batas kepemilikan yang tidak bisa dilewati permission apa pun — desain UI dan API selalu berangkat dari asumsi ini terlebih dahulu, baru permission tambahan di atasnya.
3. **Progressive disclosure untuk kompleksitas RBAC**: role dengan akses lebih sempit (Agen, Developer Partner) tidak boleh melihat menu/opsi yang tidak relevan bagi mereka — bukan sekadar tombol *disabled*, tapi disembunyikan sepenuhnya agar tidak membocorkan struktur internal (selaras PRD Modul 10).
4. **Konfigurasi di atas hard-code**: parameter yang bisa berubah karena keputusan bisnis (threshold, expiry, passing grade) selalu configurable lewat Admin Panel, tidak pernah ditanam di kode.
5. **Data lokasi terstruktur, bukan freetext**: setiap kali ada kebutuhan field lokasi baru di modul mana pun, ikuti pola cascading `province_id → city_id → district_id` yang sudah ada — jangan menambah freetext lokasi baru tanpa alasan kuat (hanya `area_keyword` yang dikecualikan, dengan batas 20 karakter).
6. **Graceful degradation untuk komunikasi**: CTA WhatsApp adalah jalur utama Buyer↔Agen di MVP; desain apa pun tidak boleh mengasumsikan chat in-app sudah ada (itu fase lanjutan — lihat API Spec §5).
7. **Mobile-first & PWA-aware**: agen bekerja di lapangan — form listing, kalkulator DBR, dan dashboard harus tetap dapat dipakai nyaman di layar kecil/koneksi tidak stabil (selaras PRD §3 Kebutuhan Non-Fungsional).

---

## 19. PERFORMANCE RULES

Target Core Web Vitals (SEO Spec §5) — **wajib** dipenuhi untuk seluruh halaman publik:

| Metrik | Target | Implementasi Wajib |
|---|---|---|
| LCP | < 2.5 detik | Preload gambar cover, ukuran sesuai viewport dari CDN, bukan gambar resolusi penuh di-resize CSS |
| CLS | < 0.1 | Reserve `width`/`height`/`aspect-ratio` untuk semua gambar & banner sebelum termuat |
| INP | < 200ms | Debounce input filter pencarian, lazy-load skrip peta interaktif |
| TTFB | < 600ms | SSR/ISR + caching edge (CDN-level) untuk halaman publik yang jarang berubah |
| Katalog listing (load) | < 2 detik | Sesuai PRD §3 Kebutuhan Non-Fungsional |

**Aturan tambahan:**
- Query list (listing, leads, notifications) **wajib** paginated — tidak ada endpoint yang mengembalikan seluruh baris tanpa limit.
- Counter agregat (`total_listings_sold`, `cta_click_count`) **wajib** dibaca dari kolom denormalisasi, bukan `COUNT()` on-the-fly saat load dashboard.
- Sitemap regenerasi **event-driven** (setiap listing baru `published`/berubah status), bukan hanya batch harian — agar listing baru cepat ditemukan crawler.
- Data wilayah Indonesia dilayani dari DB internal, bukan API pihak ketiga per-request.

---

## 20. SECURITY RULES

1. **Enkripsi data sensitif at-rest**: dokumen legalitas agen & field finansial DBR (Bagian 9) — non-negotiable.
2. **RLS + middleware RBAC berlapis** (Bagian 11–12) — tidak pernah hanya mengandalkan satu lapisan.
3. **Tidak ada trust terhadap input client**: reverse geocoding, verifikasi OAuth token, validasi region, dan seluruh validasi bisnis diulang di server meskipun sudah divalidasi di client.
4. **Signed URL berumur pendek** untuk dokumen privat — tidak ada URL publik permanen untuk KTP/NPWP.
5. **API key pihak ketiga dipisah** client-key (dibatasi domain/referrer, quota rendah) vs server-key (rahasia, quota penuh) — berlaku untuk Google Indexing API. **Khusus Maps (ADR-008, Approved v3):** `LOCATIONIQ_API_KEY`/`GEOAPIFY_API_KEY` **selalu** server-key rahasia tanpa client-key terpisah — tiles OpenStreetMap (Leaflet) tidak memerlukan API key sama sekali, sehingga risiko kebocoran key di bundle client lebih rendah dibanding skema Google Maps Platform sebelumnya.
6. **Rate limiting wajib** khususnya endpoint auth & OTP untuk mencegah brute-force (Bagian 8, 10). **Mekanisme final (ADR-018, Approved — 31 Juli 2026):** tabel `rate_limit_log` di Supabase Postgres (pola sliding window) untuk Fase 1, tanpa Redis; migrasi terjadwal ke Upstash Redis di Fase 2 berdasarkan kriteria ambang eksplisit (lihat Bagian 4, 22, 24).
7. **Audit trail tidak dapat dihapus** oleh siapa pun kecuali proses retensi resmi terjadwal (bukan aksi manual user).
8. **Minimal 1 akun Superadmin aktif** dijamin di level aplikasi, bukan hanya dokumentasi kebijakan.
9. **PII tidak masuk ke Analytics/log teknis** (Bagian 15).
10. **Cookie consent + Google Consent Mode** wajib aktif sebelum tracking non-esensial berjalan penuh (SEO Spec §4.4), selaras semangat UU PDP.
11. **Setiap perubahan skema baru yang menyentuh data sensitif atau melibatkan user-generated content publik** (mis. penambahan tabel moderasi baru di luar `agent_reviews` yang sudah ada) wajib melalui review keamanan eksplisit sebelum dikembangkan, bukan diasumsikan aman karena "cuma fitur tambahan kecil". Pola moderasi `agent_reviews` (status `pending`→`approved`/`rejected`, wajib approval sebelum publik) adalah referensi baku untuk fitur user-generated content lain di masa depan.

---

## 21. DEVELOPMENT RULES

1. **Ikuti roadmap fase PRD §6** — jangan membangun fitur Fase 2/3/4 (DBR, katalog developer, Learning Center, event) sebelum fondasi Fase 1 (auth, profil, listing dasar, admin dasar, fondasi SEO) solid dan lolos acceptance criteria masing-masing modul.
2. **Setiap PR wajib**: lolos lint + type-check + test otomatis + migration check (jika menyentuh skema DB) sebelum merge.
3. **Perubahan skema DB tidak boleh langsung ke production** — selalu lewat migration file yang direview, dengan rencana rollback.
4. **AI Coding Assistant dilarang membuat keputusan arsitektur baru secara sepihak** untuk item yang tercantum di "Hal Perlu Dikonfirmasi" pada dokumen sumber (threshold DBR final, model monetisasi, provider payment gateway, dsb.) — implementasikan sebagai *configurable placeholder*, tandai dengan komentar `// TODO: menunggu keputusan bisnis`, dan laporkan ke manusia sebelum melanjutkan jika keputusan tersebut memblokir progres.
5. **Setiap penambahan tabel/field baru** wajib disinkronkan balik ke `ERD-Skema-Database.md` dan `ERD-Diagram.mermaid` di `/docs` (dokumentasi tidak boleh menyimpang dari implementasi nyata).
6. **Setiap penambahan/perubahan endpoint** wajib disinkronkan ke `API-Specification.md` — termasuk label Auth-nya.
7. **Keputusan yang terdaftar di "Riwayat Keputusan Arsitektur" dokumen ini dianggap SUDAH FINAL** — AI assistant tidak perlu (dan tidak boleh) menanyakan ulang ke user kecuali user secara eksplisit ingin merevisi keputusan tersebut.
8. **Dokumen ini di-review ulang** setiap kali ada keputusan bisnis besar turun (mis. framework final dikonfirmasi, model monetisasi diputuskan) — bagian yang terpengaruh wajib direvisi bersamaan, bukan dibiarkan usang.
9. **Setiap kali sebuah ADR di `architecture-decision-records.md` berubah status menjadi Approved atau di-supersede**, dokumen ini **wajib** menerima pembaruan sinkron pada bagian yang terdampak (minimal: Bagian 4, Bagian 22–26, dan tabel "Riwayat Keputusan Arsitektur") **pada revisi yang sama** — bukan ditunda ke siklus review terpisah. Lihat Bagian 25 (Governance) untuk prosedur lengkap.

---

## 22. ARCHITECTURE PRINCIPLES

> Disinkronkan dari `architecture-decision-records.md` — prinsip di bawah ini adalah konsekuensi langsung dari ADR berstatus **Approved**, bukan preferensi gaya penulisan kode.

1. **Satu aplikasi, satu deployment unit (ADR-001).** Seluruh sistem — halaman publik, dashboard agen, admin panel, dan API — hidup dalam satu aplikasi Next.js (`apps/web`). Tidak ada proses backend Node kedua yang dijalankan/di-deploy terpisah. Keputusan ini final untuk cakupan proyek saat ini dan tidak boleh diasumsikan ulang tanpa ADR baru yang men-supersede ADR-001 secara eksplisit.
2. **Supabase sebagai lapisan data terintegrasi, bukan API pihak ketiga biasa (ADR-001, ADR-002, ADR-004, ADR-009).** Auth, Postgres, dan Storage diakses langsung dari Route Handlers via service role key server-side — tidak ada lapisan abstraksi backend tambahan di antara Route Handler dan Supabase kecuali service layer TypeScript murni di `/lib/modules` (lihat Bagian 6).
3. **Pertahanan keamanan berlapis tidak boleh diringkas menjadi satu lapis (ADR-003).** RBAC aplikasi (middleware) dan RLS Postgres berjalan independen — kegagalan satu lapisan tidak boleh berarti kebocoran data. Ini prinsip arsitektur, bukan detail implementasi yang bisa disederhanakan demi kecepatan development.
4. **Proses berat/long-running tidak pernah dipaksakan ke Route Handler (ADR-001 Consequences, ADR-006).** Kebutuhan job asinkron, batch processing, atau proses yang berpotensi melewati batas eksekusi serverless wajib diarahkan ke Job Queue (ADR-006, Approved: Vercel Cron Jobs + Postgres Trigger/Database Webhook) — bukan diimplementasikan sebagai workaround di dalam Route Handler yang ada.
5. **Kesiapan migrasi tanpa migrasi prematur (ADR-001 Consequences).** Business logic ditulis sebagai TypeScript murni di `/lib/modules`, terpisah dari Route Handler, agar ekstraksi ke service backend terpisah di masa depan (jika kebutuhan skala berubah signifikan dan dikonfirmasi data produksi) tidak memerlukan rewrite total — namun ekstraksi tersebut sendiri **tidak** dilakukan sekarang dan **tidak** diasumsikan sebagai rencana pasti.
6. **Toolchain AI-assisted adalah bagian dari arsitektur, bukan detail operasional (ADR-001 Notes).** Kompatibilitas dengan **Bolt.new** (satu aplikasi full-stack dalam WebContainer) adalah salah satu alasan struktural pola BFF tunggal dipilih — AI Coding Assistant lain (Cursor, Claude Code, GPT, Copilot) yang bekerja pada proyek ini wajib mengasumsikan struktur satu-aplikasi yang sama, bukan menyarankan pemisahan service.
7. **Prinsip arsitektur tertinggi (Bagian 1) tetap berlaku**: keputusan yang mahal untuk diubah kembali (strategi rendering, struktur URL/slug, skema RBAC inti, lokasi eksekusi backend) diselesaikan sedini mungkin — ADR-001 adalah contoh penerapan prinsip ini pada keputusan lokasi eksekusi backend.
8. **Search Engine dimulai native, bermigrasi terjadwal — bukan sejak awal eksternal (ADR-005).** Mesin pencari Fase 1 berjalan sepenuhnya di dalam Postgres (`tsvector`/`tsquery` + `pg_trgm`), konsisten dengan prinsip minimal-vendor ADR-001 — tidak ada komponen infrastruktur pencarian tambahan sampai kriteria ambang migrasi (volume/latensi/keluhan relevansi) tercapai. Migrasi ke Typesense di Fase 2 adalah keputusan terjadwal berbasis data produksi, bukan asumsi arsitektur awal maupun keputusan reaktif mendadak.
9. **Job Queue dimulai native, worker long-running dilarang di Fase 1 (ADR-006).** Tugas asinkron/terjadwal Fase 1 berjalan sepenuhnya lewat Vercel Cron Jobs (jadwal) dan Postgres Trigger/Database Webhook (event-driven), konsisten dengan prinsip minimal-vendor ADR-001 — proses worker yang hidup terus-menerus (mis. BullMQ) **dilarang** karena secara fundamental tidak kompatibel dengan model serverless Vercel tanpa menambah service hosting terpisah. Migrasi ke QStash di Fase 2 adalah keputusan terjadwal berbasis kriteria ambang, bukan asumsi arsitektur awal.
10. **Maps/Geocoding dipilih atas kebutuhan proyek, bukan popularitas semata — dan wajib provider-agnostic (ADR-008).** Leaflet + OpenStreetMap + LocationIQ (Primary) + Geoapify (Approved Alternative) dipilih atas kriteria budget-friendly, adopsi komunitas developer Indonesia, dan Bolt-friendliness — bukan akurasi data semata. Seluruh integrasi wajib dibungkus lapisan abstraksi `MapsProvider` (`lib/maps/`), konsisten prinsip minimal-vendor ADR-001 (caching & rate limiting Maps berbasis Postgres, tanpa Redis) — membuka jalur migrasi bertahap (MVP → Growth → Scale → Enterprise, termasuk opsi kembali ke Google Maps Platform) tanpa rewrite besar, bukan keputusan permanen tanpa jalur keluar.
11. **Rate limiting dimulai native, migrasi ke Redis hanya berbasis kriteria ambang terukur — bukan dari awal (ADR-018).** Status rate limiting bertingkat untuk endpoint sensitif berjalan sepenuhnya di dalam Postgres (tabel `rate_limit_log`, pola sliding window) untuk Fase 1, konsisten prinsip minimal-vendor ADR-001 — tidak ada komponen infrastruktur cache tambahan sampai kriteria ambang migrasi (volume request, load database, kebutuhan cache generik) tercapai. Migrasi ke Upstash Redis di Fase 2 adalah keputusan terjadwal berbasis data produksi, bukan asumsi arsitektur awal maupun keputusan reaktif mendadak — pola yang identik dengan Search Engine (ADR-005) dan Job Queue (ADR-006). Dengan ADR-018 ini, seluruh 25 ADR arsitektur/teknis original proyek berstatus Approved (kemudian 28/28 dengan ADR-026/027/028, 3 Agustus 2026).
12. **Organization adalah lapisan grouping ringan, bukan multi-tenancy klasik (ADR-026, ADR-027).** `organization_id` mengelompokkan agen & listing dalam database bersama — **bukan** isolasi `tenant_id` penuh yang tadinya dibayangkan ADR-023. Otorisasi Organization (Leader/Member) adalah **lapisan kedua independen**, dievaluasi setelah gate RBAC platform (ADR-003/ADR-024) lolos — **tidak pernah** mengubah/memperluas `permissions.scope_type` yang sudah dikunci hanya 3 nilai (`all`/`own`/`none`). AI Coding Assistant **dilarang** mengimplementasikan otorisasi Organization sebagai nilai `scope_type` baru atau mencampurnya dengan tabel `role_permissions` platform.
13. **Integrasi AI pihak ketiga selalu BYOK, key tidak pernah ke client, riwayat tidak pernah dipersist (ADR-028).** Fitur AI Assistant (Modul 13) hanya boleh memanggil provider yang dikurasi Admin (`ai_providers`) via key milik agen sendiri, diproksi backend server-side — **dilarang keras** mengirim API key ke client-side/browser dalam bentuk apa pun. Riwayat percakapan **tidak pernah** ditulis ke database dalam bentuk apa pun — ini keputusan PII yang final, bukan konfigurasi yang bisa "dinyalakan nanti" tanpa ADR baru. Rate limiting reuse `rate_limit_log` (ADR-018) — dilarang menambah infrastruktur cache/Redis baru khusus fitur ini.
14. **Seed role final = 7, soft-delete diperluas ke 8 tabel, kepemilikan dokumen ditetapkan (OD-02/OD-07/OD-06, 4 Agustus 2026).** Tabel `roles` berisi **7 baris fisik** (`superadmin`, `manager`, `admin`, `instructor`, `agent`, `developer_partner`, `buyer`) — Guest **tidak pernah** menjadi baris, murni state tidak-login (lihat Bagian 3.1). Kebijakan soft-delete (`deleted_at`, larangan `DELETE` fisik) berlaku wajib untuk **8 tabel**: 3 tabel asli (`listings`, `users`, `developer_projects`) ditambah 5 tabel baru (`agent_profiles`, `agent_reviews`, `courses`, `events`, `developer_partners`) — lihat `decision-log.md` `ADR-046`. Seluruh field Owner/Reviewer/Approver governance proyek ditetapkan ke **Mujtahid Aktanto (Solo Project Owner, AI-Assisted)** — lihat `document-governance-baseline-register.md` Bagian 9–10.

---

## 23. CODING PRINCIPLES

> Prinsip di tingkat filosofi kode — pelengkap aturan konkret di Bagian 6 (Coding Convention), Bagian 7 (Naming Convention), dan Bagian 8 (API Convention), yang kini seluruhnya mengasumsikan struktur satu-aplikasi ADR-001.

1. **Route Handler setipis mungkin.** `route.ts` hanya boleh: memvalidasi request (Zod), memanggil satu fungsi service dari `/lib/modules/{module}`, dan memformat response envelope (Bagian 8). Logic bisnis, kalkulasi (mis. DBR), dan query kompleks **dilarang** ditulis langsung di badan Route Handler.
2. **Service layer tidak boleh tahu tentang Next.js.** Kode di `/lib/modules` ditulis sebagai TypeScript murni (menerima parameter biasa, mengembalikan objek biasa) — tidak mengimpor `NextRequest`/`NextResponse` — agar dapat diuji unit tanpa runtime Next.js dan tetap portable jika suatu saat diekstraksi (lihat Bagian 22 poin 5).
3. **Satu sumber kebenaran tipe data, ditegakkan lebih ketat pasca-ADR-001.** Karena FE dan BE kini berbagi satu codebase (`apps/web`), risiko duplikasi tipe/skema Zod meningkat, bukan menurun — `packages/shared-types` dan skema Zod di `lib/validation` tetap wajib menjadi satu-satunya sumber, tidak boleh "lebih mudah" mendefinisikan ulang secara lokal hanya karena berada di file yang sama.
4. **Tidak ada shortcut keamanan demi kesederhanaan satu-aplikasi.** Kedekatan fisik antara kode frontend dan Route Handler dalam satu repo/proses **tidak** mengurangi kewajiban validasi ulang di server (Bagian 14), RBAC middleware di setiap endpoint (Bagian 11), maupun pemisahan bucket publik/privat (Bagian 12) — kemudahan development tidak pernah menjadi alasan melonggarkan hard rule keamanan.
5. **Konfigurasi di atas hard-code tetap berlaku penuh** (Bagian 18 poin 4) — untuk parameter yang belum final, implementasikan sebagai *configurable placeholder*, bukan pilihan yang di-hard-code oleh AI Coding Assistant secara sepihak (Bagian 21 poin 4). **Search engine (ADR-005), job queue (ADR-006), Maps/Geocoding (ADR-008), dan Cache/Rate Limit (ADR-018) sudah Approved** — query Postgres FTS/`pg_trgm`, konfigurasi Vercel Cron/Postgres Trigger, integrasi Leaflet+OSM+LocationIQ/Geoapify, dan tabel `rate_limit_log` boleh ditulis langsung, namun kriteria ambang migrasi Fase 2/roadmap masing-masing (Bagian 22 poin 8, 9, 10 & 11) tetap tidak boleh diasumsikan tercapai secara sepihak.

---

## 24. TECHNICAL CONSTRAINTS

> Batasan teknis konkret yang **wajib** diperhitungkan sejak desain, langsung merupakan konsekuensi ADR Approved — bukan asumsi tersembunyi.

1. **Batas eksekusi fungsi serverless Vercel (~10–60 detik tergantung paket) berlaku untuk seluruh Route Handler (ADR-001 Consequences).** Proses apa pun yang berisiko melampaui batas ini (bulk import listing, batch recalculation, pengiriman email massal) **dilarang** diimplementasikan sebagai Route Handler biasa — wajib menggunakan mekanisme Job Queue (ADR-006, Approved: Vercel Cron Jobs + Postgres Trigger/Database Webhook, dengan pagination/batching per invocation).
2. **Tidak ada isolasi proses antara frontend dan backend (ADR-001).** Bug atau memory leak di satu Route Handler berbagi runtime deployment yang sama dengan aplikasi Next.js secara keseluruhan — tidak ada batas proses OS terpisah seperti pada arsitektur service split. Monitoring (Bagian terkait ADR-015, jika/ketika disahkan) harus memperhitungkan ini.
3. **Auth-bridging antar sistem tidak relevan/tidak ada (ADR-001 Rationale).** Karena tidak ada service backend terpisah, tidak dibutuhkan mekanisme jembatan JWT Supabase ke sistem lain — AI Coding Assistant **dilarang** menambahkan lapisan auth-bridging yang tidak diperlukan oleh arsitektur saat ini.
4. **Tidak ada lagi area teknis yang berstatus OPEN.** Seluruh **28** ADR arsitektur/teknis proyek — termasuk ADR-005 (Search Strategy), ADR-006 (Job Queue Strategy), ADR-008 (Maps Provider), ADR-018 (Caching Strategy), dan kini ADR-026/ADR-027 (Organization Management, 3 Agustus 2026) serta ADR-028 (AI Assistant Integration, 3 Agustus 2026) — berstatus **Approved** (lihat Bagian 22 poin 8–13). Jika di masa depan muncul ADR baru berstatus OPEN, prinsip yang sama tetap berlaku: implementasi wajib memakai *configurable placeholder* dengan penanda `// TODO: menunggu resolusi ADR-XXX` (lihat Bagian 21 poin 4 & ADR Bagian 10 AI Usage Rules poin 4), tidak boleh memilih salah satu kandidat secara sepihak walau tampak "lebih logis" secara arsitektural.
5. **Migrasi ke arsitektur split di masa depan adalah migrasi non-trivial, bukan toggle konfigurasi (ADR-001 Consequences).** Jika kebutuhan skalabilitas berubah signifikan dan dikonfirmasi data produksi, ekstraksi logic dari Route Handlers ke service terpisah tetap memerlukan pekerjaan migrasi eksplisit — tidak diasumsikan dapat dilakukan tanpa effort karena logic sudah TypeScript murni (Bagian 22 poin 5 hanya mengurangi friksi, bukan menghilangkannya).
6. **Tidak boleh menambahkan mesin pencari eksternal sebelum kriteria ambang migrasi Fase 2 tercapai (ADR-005 Consequences).** `/properties/search` & `/properties/autocomplete` wajib berjalan di atas PostgreSQL FTS + `pg_trgm` selama kriteria ambang (volume listing >±50.000, latensi p95 >500ms, atau keluhan relevansi berulang ≥3 laporan/sprint) belum tercapai — Typesense/Elasticsearch/Algolia **dilarang** diinstal/diintegrasikan preventif "untuk jaga-jaga". Kontrak endpoint (`API-Specification-v1.1.md` §3) tidak berubah saat migrasi Fase 2 benar-benar terjadi.
7. **Tidak boleh menambahkan BullMQ, Redis, atau worker process long-running apa pun sebelum kriteria ambang migrasi Fase 2 Job Queue tercapai (ADR-006 Consequences).** Tugas asinkron/terjadwal wajib berjalan di atas Vercel Cron Jobs + Postgres Trigger/Database Webhook selama kriteria ambang (volume job harian, kebutuhan retry/backoff/dead-letter kompleks, atau frekuensi melampaui batas cron interval) belum tercapai — worker long-running **dilarang** diinstal/diintegrasikan preventif karena secara fundamental tidak kompatibel dengan model serverless ADR-001. Migrasi ke QStash hanya sah setelah kriteria ambang tercapai **dan** disetujui manusia.
8. **Tidak boleh mengganti Maps/Geocoding provider sebelum kriteria ambang migrasi tahap Growth/Scale/Enterprise tercapai (ADR-008 Consequences).** `/properties` (form lokasi listing) & peta proyek developer wajib berjalan di atas Leaflet+OpenStreetMap+LocationIQ (Primary)/Geoapify (Approved Alternative) selama kriteria ambang (kuota harian LocationIQ, p95 latency geocoding, atau kebutuhan SLA komersial) belum tercapai — Google Maps Platform/Mapbox penuh **dilarang** diinstal/diintegrasikan preventif "untuk jaga-jaga". Seluruh migrasi wajib melalui lapisan abstraksi `MapsProvider` yang sudah disiapkan sejak Fase 1, disetujui manusia, bukan keputusan sepihak AI Coding Assistant.
9. **Tidak boleh menambahkan Redis, Upstash, Vercel KV, atau cache/in-memory-store eksternal apa pun sebelum kriteria ambang migrasi Fase 2 Rate Limiting/Cache tercapai (ADR-018 Consequences).** Rate limiting endpoint sensitif wajib berjalan di atas tabel `rate_limit_log` (Supabase Postgres, pola sliding window) selama kriteria ambang (volume request endpoint sensitif >10.000/menit, query `rate_limit_log` >15% load database utama, atau kebutuhan cache aplikasi generik) belum tercapai — Redis/Upstash **dilarang** diinstal/diintegrasikan preventif "untuk jaga-jaga". Migrasi ke Upstash Redis hanya sah setelah kriteria ambang tercapai **dan** disetujui manusia.
10. **(Direvisi v1.9) Modul 12 (Organization) dan Modul 13 (AI Assistant) — gate implementasi kode KEDUANYA TERBUKA.** Paket sinkronisasi PRD/ERD/API Spec/User Flow (PRD v1.2, ERD v1.3, API Spec v1.2, User Flow v1.2, ditambah Entity Mapping/Authorization/Functional/UI/Technical Specification v1.0) telah dieksekusi dan disahkan Baseline pada 5 Agustus 2026. Menyusul kelengkapan dokumen tersebut, **gate kode Modul 13 dikonfirmasi terbuka eksplisit oleh Owner pada 6 Agustus 2026**, dan **gate kode Modul 12 dikonfirmasi terbuka eksplisit oleh Owner pada 7 Agustus 2026** — masing-masing dicatat terpisah, konsisten prinsip bahwa kelengkapan dokumen adalah prasyarat namun bukan pemicu otomatis pembukaan gate; konfirmasi satu modul tidak pernah diasumsikan berlaku untuk modul lain. AI Coding Assistant **kini diizinkan** menulis migration/endpoint/komponen untuk Modul 12 maupun Modul 13, mengikuti urutan `Module-Implementation-Strategy-...v1.1.md` Bagian 3 (M13 di Batch 2/posisi #7, M12 di Batch 4/posisi #12) dan `MP-13`/`MP-12-Organization-Module-Planning-v1.0.md` sebagai spesifikasi resmi masing-masing — status dilacak eksplisit di `CURRENT-PROJECT-STATE.md` (rev. 8).

---

## 25. GOVERNANCE

> Mengikuti Bagian 9 (Governance Rules) dan Bagian 10 (AI Usage Rules) di `architecture-decision-records.md` — direfleksikan di sini agar dokumen ini tetap konsisten sebagai satu-satunya dokumen yang mengikat langsung AI Coding Assistant.

1. **Hierarki otoritas dokumen** (lihat juga Bagian 26 — Source of Truth): jika terjadi konflik antara sebuah ADR berstatus **Approved** dan dokumen lain manapun (termasuk dokumen ini), **ADR menjadi rujukan utama** sampai dokumen lain diperbarui secara resmi untuk mencerminkannya — bukan sebaliknya.
2. **ADR Approved tidak boleh diedit langsung.** Perubahan substantif terhadap keputusan yang sudah Approved (mis. ADR-001, ADR-005, ADR-006, ADR-008, ADR-018) menghasilkan ADR baru yang men-supersede, bukan mengedit isi ADR lama. Dokumen ini kemudian disinkronkan ulang mengikuti ADR baru tersebut — pola sinkronisasi yang sama seperti revisi v1.2 (ADR-001), v1.3 (ADR-005), v1.4 (ADR-006), v1.5 (ADR-008), dan v1.6 (ADR-018) ini.
3. **AI Coding Assistant tidak berwenang menaikkan status ADR menjadi Approved**, dan karenanya juga tidak berwenang memutuskan sendiri item ADR yang berstatus **OPEN** sebagai final di dalam kode. Wajib berhenti dan meminta keputusan eksplisit dari Technical Lead/CTO, mengikuti pola *configurable placeholder* (Bagian 21 poin 4, Bagian 24 poin 4). **Per 31 Juli 2026, tidak ada ADR yang berstatus OPEN** — aturan ini tetap dipertahankan sebagai prosedur baku untuk ADR baru di masa depan.
4. **Setiap ADR baru berstatus Approved wajib memicu, dalam revisi yang sama:** (a) entri baru di tabel "Riwayat Keputusan Arsitektur" (awal dokumen ini), (b) pembaruan baris terkait di Bagian 4 (Tech Stack), (c) pembaruan Bagian 22–24 jika berdampak pada prinsip/batasan teknis, (d) entri baru di `decision-log.md` dan `CHANGELOG.md` — dikoordinasikan sebagai satu paket perubahan, bukan empat pekerjaan terpisah yang boleh drift satu sama lain.
5. **Approval final tetap memerlukan konfirmasi manusia** (Technical Lead/Enterprise Solution Architect/CTO) — status "APPROVED WITH NOTES" seperti pada ADR-001, ADR-005, ADR-006, ADR-008, dan ADR-018 berarti keputusan mengikat untuk implementasi, namun catatan kondisional yang menyertainya (mis. dokumentasi batas eksekusi serverless & pencatatan Bolt.new untuk ADR-001; konfirmasi proyeksi volume listing & kapasitas DevOps Typesense untuk ADR-005; konfirmasi tier Vercel produksi & status roadmap Agent Workspace untuk ADR-006; uji akurasi data OSM sampel alamat & pemantauan kuota harian LocationIQ untuk ADR-008; finalisasi struktur tabel `rate_limit_log`/algoritma sliding window presisi di Sprint S1 & validasi kriteria ambang migrasi dengan data traffic produksi nyata untuk ADR-018) tetap wajib diselesaikan, bukan diabaikan karena status utama sudah Approved.

---

## 26. SOURCE OF TRUTH

Urutan otoritas dokumen proyek, dari yang paling otoritatif untuk pertanyaan "**mengapa**" hingga yang paling rinci untuk pertanyaan "**bagaimana persisnya**":

| Urutan | Dokumen | Menjawab Pertanyaan | Catatan |
|---|---|---|---|
| 1 | `architecture-decision-records.md` | *Mengapa* sebuah keputusan arsitektur diambil, alternatif apa yang dipertimbangkan, konsekuensi apa yang diterima | ADR **Approved** mengikat dan tidak boleh dilanggar; ADR **OPEN** tidak boleh diasumsikan final oleh siapa pun termasuk AI. |
| 2 | **`PROJECT-CONSTITUTION.md` (dokumen ini)** | Aturan mengikat turunan dari ADR — apa yang *wajib*/*dilarang* di level engineering (coding, naming, security, dsb.) | Living constitution; wajib disinkronkan ulang setiap kali ADR relevan berubah status (Bagian 25 poin 4). |
| 3 | `technology-decisions.md` (v1.5) | Katalog stack resmi — teknologi, versi, justifikasi ringkas | Setiap baris seharusnya dapat ditelusuri balik ke tepat satu ADR; gap ditandai sebagai gap governance. |
| 4 | `SYSTEM-ARCHITECTURE.md`, `API-Specification-v1.1.md`, `ERD-Skema-Database-v1.1.md`, `User-Flow-v1.1.md`, `SEO-Analytics-Specification-v1.1.md` | Spesifikasi teknis rinci per domain | Turunan langsung dari PRD v1.1 + ADR; tidak boleh bertentangan dengan Bagian 1–2 di atas. |
| 5 | `decision-log.md` | Jurnal kronologis **seluruh** keputusan proyek (teknis & non-teknis) | Pelengkap historis, bukan pengganti ADR untuk keputusan arsitektur/teknis. |
| 6 | `CHANGELOG.md` | Kapan & apa yang berubah di kode/rilis sebagai akibat sebuah ADR/keputusan | Mencatat dampak rilis, bukan alasan keputusan. |
| 7 | Kode sumber (`apps/web`) | Implementasi aktual | Jika kode menyimpang dari dokumen di atas tanpa ADR/keputusan yang menaunginya, ini adalah **drift** yang wajib diperbaiki — dokumen tidak otomatis dianggap usang hanya karena kode berbeda. |

**Aturan resolusi konflik:** jika dua dokumen pada urutan berbeda saling bertentangan, dokumen dengan urutan lebih kecil (lebih ke atas tabel) menang, **kecuali** dokumen tersebut belum diperbarui untuk mencerminkan ADR terbaru — dalam kasus ini, ADR yang menang secara substansi, dan dokumen turunan yang belum sinkron dicatat sebagai gap yang wajib diperbaiki (bukan diam-diam diikuti apa adanya). Ini persis pola yang menghasilkan revisi v1.2 (ADR-001), v1.3 (ADR-005), v1.4 (ADR-006), v1.5 (ADR-008), v1.6 (ADR-018), dan v1.7 (ADR-026/027/028) dokumen ini.

---

*Dokumen ini disusun berdasarkan review menyeluruh terhadap: PRD-RUMAHAGEN-v1.1.md, ERD-Skema-Database-Real-Estate-Agency-v1.1.md, ERD-Diagram-v1.1.mermaid, API-Specification-RUMAHAGEN-v1.1.md, User-Flow-RUMAHAGEN-v1.1.md, dan SEO-Analytics-Specification-RUMAHAGEN-v1.1.md (seluruhnya v1.1, per 26 Juli 2026 — hasil resolusi audit konflik terhadap dokumen v1.0, **belum direvisi lebih lanjut pada siklus v1.7 ini**), serta `architecture-decision-records.md` (khususnya ADR-001, Approved 27 Juli 2026; ADR-005, Approved 28 Juli 2026; ADR-006, Approved 29 Juli 2026; ADR-008, Approved 30 Juli 2026, direvisi v3; ADR-018, Approved 31 Juli 2026; dan **ADR-026/ADR-027/ADR-028, Approved/Approved With Notes 3 Agustus 2026**). Menjadi acuan tetap bagi seluruh AI Coding Assistant dan kontributor manusia selama proyek berjalan. Revisi v1.2 menyinkronkan Architecture Principles, Coding Principles, Technical Constraints, Governance, dan Source of Truth (Bagian 22–26) terhadap ADR-001. Revisi v1.3 menyinkronkan lebih lanjut Bagian 4 (Tech Stack), Bagian 22 (Architecture Principles), Bagian 23 (Coding Principles), Bagian 24 (Technical Constraints), Bagian 25 (Governance), dan tabel "Riwayat Keputusan Arsitektur" terhadap ADR-005 (Search Strategy). Revisi v1.4 menyinkronkan lebih lanjut Bagian 4 (Tech Stack), Bagian 6 (Folder Structure), Bagian 21 (Development Rules), Bagian 22 (Architecture Principles), Bagian 23 (Coding Principles), Bagian 24 (Technical Constraints), Bagian 25 (Governance), Bagian 26 (Source of Truth), dan tabel "Riwayat Keputusan Arsitektur" terhadap ADR-006 (Job Queue Strategy — Vercel Cron Jobs + Postgres Trigger/Database Webhook Fase 1, migrasi terjadwal ke QStash Fase 2). Revisi v1.5 menyinkronkan lebih lanjut Bagian 4 (Tech Stack), Bagian 17 (Environment Variables), Bagian 20 (Security Rules), Bagian 21 (Development Rules), Bagian 22 (Architecture Principles), Bagian 23 (Coding Principles), Bagian 24 (Technical Constraints), Bagian 25 (Governance), Bagian 26 (Source of Truth), dan tabel "Riwayat Keputusan Arsitektur" terhadap ADR-008 (Maps Provider — Leaflet + OpenStreetMap + LocationIQ sebagai Primary Geocoding Provider dan Geoapify sebagai Approved Alternative Provider, direvisi v3 dengan caching Postgres, rate limiting scoped, offline/manual address fallback, dan roadmap migrasi bertahap MVP → Growth → Scale → Enterprise). Revisi v1.6 menyinkronkan lebih lanjut Bagian 4 (Tech Stack), Bagian 17 (Environment Variables), Bagian 20 (Security Rules), Bagian 22 (Architecture Principles), Bagian 23 (Coding Principles), Bagian 24 (Technical Constraints), Bagian 25 (Governance), Bagian 26 (Source of Truth), dan tabel "Riwayat Keputusan Arsitektur" terhadap ADR-018 (Caching Strategy/Rate Limiting — Supabase Postgres tabel `rate_limit_log` Fase 1, migrasi terjadwal ke Upstash Redis Fase 2 berdasarkan kriteria ambang eksplisit). **Revisi v1.7 ini** menyinkronkan tabel "Riwayat Keputusan Arsitektur" (baris #13–14), Bagian 22 (Architecture Principles poin 12–13), dan Bagian 24 (Technical Constraints poin 4 & 10) terhadap **ADR-026 (Organization Model Strategy) & ADR-027 (Organization-Scoped Authorization Strategy) — Approved With Notes/Approved 3 Agustus 2026**, dan **ADR-028 (Third-Party AI Assistant Integration Strategy/BYOK) — Approved With Notes 3 Agustus 2026** — hasil sesi Architecture Review Board berdasarkan `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md`. Berbeda dari lima revisi sebelumnya, siklus ini **tidak** menyentuh Bagian 4 (Tech Stack) — Organization dan AI Assistant tidak menambah baris teknologi baru ke Official Technology Stack, murni entitas data + lapisan otorisasi + integrasi API pihak ketiga di atas stack yang sudah ada. **Revisi v1.8 ini** menyinkronkan Bagian 3.1 (klarifikasi seed role final = 7 & status Guest), Bagian 21 (Development Rules — soft-delete 8 tabel), dan Bagian 24 (Technical Constraints poin 14 baru) terhadap resolusi **OD-02** (seed role), **OD-06** (kepemilikan dokumen → Mujtahid Aktanto, Solo Project Owner AI-Assisted), dan **OD-07** (soft-delete diperluas, `ADR-046`, Approved 4 Agustus 2026) — berbeda dari enam revisi sebelumnya, siklus ini murni menyelesaikan Open Decision administratif/data yang sudah lama tercatat, bukan proposal arsitektur baru maupun ADR OPEN yang menunggu Architecture Review Board. Tidak ada isi dokumen sumber v1.1 lain yang diubah dalam penyusunan revisi ini. **Dengan ADR-026/027/028, seluruh 28 dari 28 ADR arsitektur/teknis proyek berstatus Approved, dan dengan resolusi OD-02/06/07, seluruh 6 dari 6 kondisi "GO WITH CONDITIONS" CTO kini terpenuhi** — tidak ada lagi ADR maupun Open Decision administratif yang berstatus OPEN di seluruh dokumen ini maupun proyek secara keseluruhan.*

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

## D6 Constitution Addendum — Cross-AEP control
The Constitution now recognizes the completed AEP1–AEP4 sequence as the latest controlled architecture-evolution synchronization layer. AEP artifacts are controlled evolution/evidence layers and do not independently override approved governance authority.
