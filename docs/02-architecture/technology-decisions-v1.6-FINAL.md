# TECHNOLOGY DECISIONS
## Platform Web RUMAHAGEN

---

## 1. Document Information

| Field | Value |
|---|---|
| **Name** | Technology Decisions — Platform Web RUMAHAGEN |
| **Version** | 1.6 |
| **Status** | Draft — menunggu review & pengesahan tim (belum berstatus "BERLAKU" seperti `PROJECT-CONSTITUTION.md`). Seluruh Open Decision yang sebelumnya memengaruhi dokumen ini — ADR-001 Backend Architecture, ADR-005 Search Strategy, ADR-006 Job Queue Strategy, ADR-008 Maps Provider, ADR-018 Caching Strategy, dan kini **ADR-028 (kurasi provider AI Assistant)** — telah **Approved**/**Approved With Notes** dan diintegrasikan penuh ke revisi ini. Dokumen ini tidak lagi memiliki ADR arsitektur/teknis berstatus OPEN yang menghalangi — **eligible untuk diajukan sebagai status Baseline** di `document-governance-baseline-register.md`, menunggu konfirmasi formal manusia berwenang (bukan diputuskan sepihak oleh dokumen ini sendiri). **Catatan cakupan:** ADR-026/027 (Organization Management) tidak menambah baris teknologi baru ke dokumen ini — murni entitas data + otorisasi di atas stack yang sudah ada, lihat `SYSTEM-ARCHITECTURE.md` §5/§7 sebagai gantinya. |
| **Last Updated** | 3 Agustus 2026 — direvisi (v1.5 → v1.6) untuk mengintegrasikan resolusi **ADR-028** (Third-Party AI Assistant Integration Strategy/BYOK, Approved With Notes) dari `architecture-decision-records.md` — kurasi 4 provider ditambahkan sebagai §4.33. **ADR-026/027** (Organization Management System) juga disahkan pada sesi Board yang sama namun **tidak** menyentuh dokumen ini — lihat `SYSTEM-ARCHITECTURE.md` §5/§7. |
| **Owner** | Principal Software Architect / Technical Lead — **Mujtahid Aktanto (Solo Project Owner, AI-Assisted)** — resolusi **OD-06**, 4 Agustus 2026 |

**Kedudukan dokumen dalam hierarki governance proyek:** Dokumen ini adalah turunan operasional dari `PROJECT-CONSTITUTION.md` Bagian 4 (Tech Stack & Framework) dan `SYSTEM-ARCHITECTURE.md` Bagian 4 (Technology Stack). Jika terjadi ketidaksesuaian pada level katalog/deskripsi, **`PROJECT-CONSTITUTION.md` yang menang**. Namun untuk **keputusan arsitektur/teknis yang sudah dicatat sebagai ADR berstatus Approved** di `architecture-decision-records.md`, ADR tersebut menjadi **referensi utama** sampai `PROJECT-CONSTITUTION.md`/`SYSTEM-ARCHITECTURE.md` diperbarui secara resmi untuk mencerminkannya (`architecture-decision-records.md` Bagian 10, AI Usage Rules poin 3) — dokumen ini **wajib dibaca setelah** ADR terkait, bukan sebagai sumber keputusan independen. Dokumen ini **tidak menggantikan** Constitution atau ADR — fungsinya adalah memperdalam *alasan* di balik setiap pilihan teknologi resmi agar konsisten dipahami oleh seluruh AI Coding Assistant (Claude, Bolt.new, ChatGPT, Cursor) dan developer manusia.

**Dokumen sumber yang menjadi rujukan:** `architecture-decision-records.md` (sumber kebenaran keputusan arsitektur — dibaca **sebelum** dokumen ini), `PROJECT-CONSTITUTION.md`, `SYSTEM-ARCHITECTURE.md`, `AI-DEVELOPMENT-BLUEPRINT.md`, `AI-CONTEXT-PACK.md`, `PRD-RUMAHAGEN-v1.1.md`, `ERD-Skema-Database-Real-Estate-Agency-v1.1.md`, `API-Specification-RUMAHAGEN-v1.1.md`, `SEO-Analytics-Specification-RUMAHAGEN-v1.1.md`.

---

## 2. Technology Decision Principles

Setiap teknologi pada Official Technology Stack (Bagian 3) dipilih berdasarkan sepuluh prinsip berikut secara konsisten — bukan preferensi individu, melainkan kriteria yang dapat diaudit ulang jika suatu saat ada usulan perubahan:

| Prinsip | Penerapan |
|---|---|
| **Simplicity** | Diutamakan solusi dengan permukaan API sekecil mungkin dan konvensi yang jelas, agar tim kecil dan AI Coding Assistant dapat produktif tanpa banyak *boilerplate* atau konfigurasi tersembunyi. |
| **Maintainability** | Teknologi dengan pola idiomatis yang stabil dari waktu ke waktu, dokumentasi tipe (TypeScript) end-to-end, dan minim "sihir" implisit yang menyulitkan debugging jangka panjang. |
| **Scalability** | Mampu bertumbuh dari MVP satu agensi ke volume listing/agen yang jauh lebih besar tanpa perombakan arsitektur (lihat `SYSTEM-ARCHITECTURE.md` Bagian 16 & 20). |
| **AI Friendly** | Teknologi arus utama dengan pola kode yang banyak terwakili di data pelatihan model AI (Next.js, TypeScript, Zod, dsb.) sehingga AI Coding Assistant menghasilkan kode yang akurat dan idiomatis, mengurangi halusinasi API. |
| **Community Support** | Ekosistem aktif, rilis rutin, dan basis pengguna besar — mengurangi risiko proyek open-source terbengkalai. |
| **Documentation Quality** | Dokumentasi resmi lengkap dan terpelihara, penting karena dokumentasi adalah *ground truth* yang dipakai AI Coding Assistant maupun developer baru. |
| **Performance** | Selaras target Core Web Vitals wajib di `SEO-Analytics-Specification` Bagian 5 (LCP < 2.5s, CLS < 0.1, INP < 200ms, TTFB < 600ms). |
| **Security** | Dukungan bawaan untuk praktik keamanan wajib di `PROJECT-CONSTITUTION.md` Bagian 20 (enkripsi at-rest, RLS, signed URL, rate limiting). |
| **Cost Efficiency** | Model harga dapat diprediksi pada tahap awal (banyak *free tier* yang cukup untuk MVP), tanpa mengorbankan jalur upgrade saat traffic bertumbuh. |
| **Long Term Support** | Diprioritaskan vendor/proyek dengan rekam jejak rilis jangka panjang dan kebijakan dukungan versi yang jelas (LTS), bukan proyek eksperimental. |

> Prinsip ini juga menjadi kriteria wajib bagi AI Coding Assistant maupun developer manusia ketika mengajukan penambahan teknologi baru di luar daftar resmi (lihat Bagian 6 & 7).

---

## 3. Official Technology Stack

Tabel berikut adalah **keputusan resmi dan final** proyek — identik dengan `PROJECT-CONSTITUTION.md` Bagian 4, tidak boleh disimpangi tanpa keputusan arsitektur eksplisit yang disetujui. Seluruh baris kini berstatus **Approved** — tidak ada lagi baris yang menunggu resolusi ADR (per 31 Juli 2026, menyusul disahkannya ADR-018 sebagai ADR terakhir yang tersisa).

| Layer | Teknologi Resmi |
|---|---|
| Frontend | Next.js (App Router) |
| Language | TypeScript |
| UI | shadcn/ui |
| CSS | Tailwind CSS |
| Icons | Lucide React |
| Backend/API | Next.js Route Handlers (BFF tipis) + Supabase (BaaS) — **final, ADR-001 Approved** |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth |
| Authorization | Supabase RLS + RBAC (kustom aplikasi) |
| Storage | Supabase Storage |
| Hosting | Vercel — **final, ADR-010 Approved** |
| Repository | GitHub |
| Deployment | GitHub → Vercel |
| Transactional Email | Resend |
| Monitoring | Sentry |
| Server State | TanStack Query |
| UI State | Zustand |
| Forms | React Hook Form |
| Validation | Zod |
| Unit Testing | Vitest |
| Component Testing | React Testing Library |
| E2E Testing | Playwright |
| Charts | Recharts |
| Table | TanStack Table |
| Drag & Drop | dnd-kit |
| Date Library | date-fns |
| PDF | pdf-lib |
| Image Compression | browser-image-compression |
| Maps | Leaflet + OpenStreetMap (rendering) + LocationIQ (Primary Geocoding) + Geoapify (Approved Alternative) — **final, ADR-008 Approved (v3)** |
| Search Engine | PostgreSQL Full-Text Search + pg_trgm (Fase 1) → Typesense (Fase 2, terjadwal) — **final untuk Fase 1, ADR-005 Approved** |
| Job Queue/Scheduler | Vercel Cron Jobs + Postgres Trigger/Database Webhook (Fase 1) → QStash — Upstash (Fase 2, terjadwal) — **final untuk Fase 1, ADR-006 Approved** |
| Rate Limiting/Application Cache | Supabase Postgres — tabel `rate_limit_log`, sliding window (Fase 1) → Upstash Redis (Fase 2, terjadwal) — **final untuk Fase 1, ADR-018 Approved** |

> **Keputusan resmi (ADR-001, Approved 27 Juli 2026):** Backend/API dikunci final sebagai **Next.js Route Handlers (BFF tipis), terintegrasi langsung dengan Supabase** — seluruh endpoint `API-Specification-v1.1.md` diimplementasikan di `app/api/v1/**/route.ts` dalam satu aplikasi (`apps/web`), tanpa service backend Node.js terpisah (NestJS/Express). Keputusan ini tercatat lengkap (Context/Rationale/Alternatives/Consequences) di `architecture-decision-records.md` ADR-001 dan `decision-log.md` ADR-038, serta telah disinkronkan ke `PROJECT-CONSTITUTION.md` Bagian 4 & `SYSTEM-ARCHITECTURE.md` Bagian 4/9/11/23. Tidak ada lagi status "opsi terbuka" untuk keputusan ini — lihat Bagian 6 (Architecture Constraints poin 10) untuk larangan menambahkan service backend terpisah tanpa ADR baru yang men-supersede ADR-001.
>
> **Keputusan resmi (ADR-005, Approved 28 Juli 2026):** Search Engine dikunci sebagai strategi bertahap — **PostgreSQL Full-Text Search (`tsvector`/`tsquery`) + ekstensi `pg_trgm`** untuk Fase 1 (MVP), tanpa komponen infrastruktur tambahan di luar Supabase, dengan migrasi terjadwal (bukan reaktif) ke **Typesense** di Fase 2 begitu salah satu dari tiga kriteria ambang tercapai (volume listing aktif >±50.000, latensi p95 `/properties/search` >500ms, atau keluhan relevansi berulang ≥3 laporan independen per sprint). Keputusan ini tercatat lengkap di `architecture-decision-records.md` ADR-005 dan `decision-log.md` ADR-039. Baris ini **tidak lagi berstatus Open Question** di dokumen ini (lihat Bagian 9).
>
> **Keputusan resmi (ADR-006, Approved 29 Juli 2026):** Job Queue/Scheduler dikunci sebagai strategi hybrid native — tugas terjadwal periodik (reminder H-1, scan listing stale >90 hari, reminder customer/jadwal temu) dijalankan via **Vercel Cron Jobs** yang memanggil Route Handler (`app/api/cron/**`), dan tugas event-driven instan (counter sync, sitemap regeneration saat listing `published`) dijalankan via **Postgres Trigger/Database Webhook** — seluruhnya dalam satu `apps/web`, tanpa runtime/service tambahan. Migrasi terjadwal (bukan reaktif) ke **QStash (Upstash)** di Fase 2 begitu salah satu dari tiga kriteria ambang tercapai (volume job harian melampaui kapasitas batching per invocation, kebutuhan retry/backoff/dead-letter kompleks, atau frekuensi melampaui batas cron interval tier Vercel yang dipakai). **BullMQ+Redis ditolak untuk Fase 1** — worker long-running-nya tidak kompatibel dengan model serverless Vercel tanpa menambah service hosting terpisah, bertentangan dengan filosofi minimal-vendor ADR-001. Keputusan ini tercatat lengkap di `architecture-decision-records.md` ADR-006 dan `decision-log.md` ADR-040. Baris ini **tidak lagi berstatus Open Question** di dokumen ini (lihat Bagian 9).
>
> **Keputusan resmi (ADR-008, Approved 30 Juli 2026, direvisi v3):** Maps & Geocoding dikunci final sebagai **Leaflet + React-Leaflet** (rendering peta, tiles OpenStreetMap gratis) dengan **LocationIQ** sebagai **Primary Geocoding Provider** (geocoding, reverse geocoding, autocomplete — API kompatibel-Nominatim, free tier 5.000 request/hari) dan **Geoapify** sebagai **Approved Alternative Provider** (failover otomatis, berbasis data OpenStreetMap yang sama, mendukung batch geocoding). Seluruh integrasi dibungkus lapisan abstraksi provider-agnostic (`MapsProvider` interface), membuka jalur migrasi bertahap (MVP → Growth → Scale → Enterprise) tanpa rewrite besar — termasuk opsi kembali ke Google Maps Platform pada tahap Enterprise. Keputusan ini tercatat lengkap (Context/Rationale/Alternatives/Consequences) di `architecture-decision-records.md` ADR-008 dan `decision-log.md` ADR-028 & Open Decision #4. Baris ini **tidak lagi berstatus Open Question** di dokumen ini (lihat Bagian 9).
>
> **Keputusan resmi (ADR-018, Approved 31 Juli 2026):** Rate Limiting & Application-Level Cache dikunci sebagai strategi bertahap — Fase 1 (MVP) diimplementasikan **native di atas Supabase Postgres**, melalui tabel dedicated `rate_limit_log` (pola sliding window, index komposit `identifier`+`action_type`+`window_start`), **tanpa** menambah infrastruktur cache/in-memory-store baru. Caching edge/CDN untuk halaman publik **tetap** inheren dari ADR-021 (Next.js ISR) & ADR-010 (Vercel edge caching) — tidak berubah. Migrasi terjadwal (bukan reaktif) ke **Upstash Redis** di Fase 2 begitu salah satu dari tiga kriteria ambang tercapai (volume request endpoint sensitif >10.000/menit gabungan, query `rate_limit_log` menyumbang >15% load database utama, atau kebutuhan cache aplikasi generik muncul dari modul lain yang tidak dapat dipenuhi index Postgres secara wajar). Keputusan ini tercatat lengkap di `architecture-decision-records.md` ADR-018 dan `decision-log.md` ADR-042. Baris ini **tidak lagi berstatus Open Question** di dokumen ini (lihat Bagian 9). Dengan resolusi ini, **seluruh Open Decision arsitektur/teknis di dokumen ini telah tuntas — tidak ada lagi baris "menunggu ADR" yang tersisa.**

---

## 4. Decision Detail

### 4.1 Next.js (App Router) — Frontend Framework
- **Purpose:** Framework React full-stack untuk seluruh halaman publik (SSR/SSG/ISR) dan privat (CSR), serta BFF lewat Route Handlers.
- **Why Selected:** Satu-satunya pilihan yang memenuhi syarat SSR/SSG/ISR wajib di `SEO-Analytics-Specification` Bagian 1.1 untuk Homepage, Search, Detail Listing, Profil Agen, dan Detail Proyek Developer — ditetapkan final di `PROJECT-CONSTITUTION.md` Riwayat Keputusan Arsitektur #6.
- **Advantages:** App Router Server Components mengurangi JS yang dikirim ke client (bagus untuk Core Web Vitals); ISR memungkinkan halaman listing tetap cepat tanpa render ulang penuh; ekosistem Vercel terintegrasi native; dukungan TypeScript kelas satu; Route Handlers menghilangkan kebutuhan server Node.js terpisah untuk BFF ringan — dikunci final sebagai keputusan arsitektur backend proyek (`architecture-decision-records.md` ADR-001, Approved).
- **Limitations:** App Router (Server Components, caching model) memiliki kurva belajar tersendiri dibanding Pages Router lama; strategi caching butuh pemahaman eksplisit (`fetch` cache directives) agar tidak salah men-cache data privat.
- **Alternative Considered:** Remix, Astro, SPA React murni (Vite) + backend terpisah.
- **Why Alternative Was Rejected:** Remix/Astro memiliki ekosistem lebih kecil dan dukungan Vercel-native lebih lemah; SPA murni gagal memenuhi syarat SSR wajib untuk SEO tanpa menambah kompleksitas prerendering terpisah.
- **Integration Notes:** Route group `(public)` wajib Server Component untuk data-fetching utama (lihat `PROJECT-CONSTITUTION.md` Bagian 5); `(dashboard)`/`(admin)` CSR dengan `noindex, nofollow`.
- **AI Development Notes:** AI Coding Assistant wajib menempatkan halaman sesuai pola rendering per Bagian 2 `AI-DEVELOPMENT-BLUEPRINT.md` — jangan membuat halaman publik baru sebagai client component murni dengan `useEffect` + `fetch` sebagai sumber data utama.

### 4.2 TypeScript — Language
- **Purpose:** Bahasa utama seluruh codebase (frontend, Route Handlers, skema validasi, shared types).
- **Why Selected:** Satu sumber kebenaran tipe data (`packages/shared-types`) yang disyaratkan `PROJECT-CONSTITUTION.md` Bagian 2 (Single Source of Truth) hanya mungkin dijaga konsisten dengan bahasa bertipe statis di FE & BE sekaligus.
- **Advantages:** Deteksi error saat compile-time, IDE/AI autocomplete jauh lebih akurat, refactor besar lebih aman.
- **Limitations:** Build time lebih lambat dibanding JavaScript murni; butuh disiplin tim agar tidak memakai `any` implisit.
- **Alternative Considered:** JavaScript murni (tanpa tipe statis).
- **Why Alternative Was Rejected:** Tidak mendukung "Single Source of Truth" tipe data lintas layer yang menjadi prinsip arsitektur eksplisit proyek; risiko bug runtime jauh lebih tinggi pada skema RBAC/ownership yang kompleks.
- **Integration Notes:** `strict: true` wajib, tanpa `any` implisit (`PROJECT-CONSTITUTION.md`/`AI-CONTEXT-PACK.md` Bagian 11 poin 7).
- **AI Development Notes:** AI Coding Assistant dilarang menonaktifkan strict mode atau membubuhkan `// @ts-ignore` untuk "membuat kode jalan" tanpa menyelesaikan akar masalah tipe.

### 4.3 shadcn/ui — UI Component Library
- **Purpose:** Kumpulan komponen UI headless (berbasis Radix UI primitives) yang di-generate langsung ke dalam repo, bukan dependency npm biasa.
- **Why Selected:** Konsisten dengan kebutuhan desain sistem yang dapat diaudit dan performa (tanpa CSS-in-JS runtime) sesuai `PROJECT-CONSTITUTION.md` Bagian 4.
- **Advantages:** Kode komponen sepenuhnya berada di repo (`components/ui/`) sehingga dapat dikustomisasi bebas tanpa "fighting the library"; aksesibilitas bawaan dari Radix UI; kompatibel penuh dengan Tailwind v4 & React 19 (App Router Server/Client Components).
- **Limitations:** Bukan package versi tunggal yang di-`npm update`; update komponen upstream harus ditarik manual via CLI (`npx shadcn add`), sehingga tim wajib disiplin tidak memodifikasi struktur dasar komponen secara sembarangan agar tetap bisa disinkronkan.
- **Alternative Considered:** Material UI (MUI), Ant Design, Chakra UI.
- **Why Alternative Was Rejected:** MUI/Ant Design membawa opini desain visual yang kuat (sulit dikustomisasi total) dan bundel lebih berat; keduanya eksplisit **dilarang** di Bagian 6 (Architecture Constraints).
- **Integration Notes:** Bergantung pada `@radix-ui/*` (per komponen), `class-variance-authority`, `clsx`, `tailwind-merge` — lihat `dependency-manifest.md` Bagian 2.
- **AI Development Notes:** Selalu cek `components/ui/` sebelum membuat komponen custom baru yang fungsinya serupa (`AI-DEVELOPMENT-BLUEPRINT.md` Bagian 32 poin 5).

### 4.4 Tailwind CSS — CSS Framework
- **Purpose:** Utility-first styling untuk seluruh UI, termasuk basis styling shadcn/ui.
- **Why Selected:** Cocok dengan kebutuhan Core Web Vitals rendah-JS (tidak ada CSS-in-JS runtime) dan desain sistem yang konsisten & dapat diaudit (`PROJECT-CONSTITUTION.md` Bagian 4).
- **Advantages:** CSS-first configuration (v4) menghilangkan `tailwind.config.js` untuk kasus umum; build sangat cepat (mesin Oxide); ukuran CSS akhir kecil karena purging otomatis.
- **Limitations:** Markup dapat terlihat padat kelas utilitas; migrasi dari v3 ke v4 memerlukan penyesuaian variabel warna (HSL → OKLCH) bila di kemudian hari proyek meng-upgrade dari basis awal.
- **Alternative Considered:** CSS Modules murni, styled-components/Emotion (CSS-in-JS).
- **Why Alternative Was Rejected:** CSS-in-JS runtime menambah beban JS di client (bertentangan prinsip Performance); CSS Modules murni tidak menyediakan sistem desain token yang konsisten out-of-the-box seperti Tailwind + shadcn/ui.
- **Integration Notes:** Versi yang direkomendasikan adalah **Tailwind v4**, karena shadcn/ui kini mendukung penuh Tailwind v4 + React 19 (lihat `dependency-manifest.md`).
- **AI Development Notes:** Jangan menambahkan library CSS-in-JS (styled-components, Emotion) sebagai "pelengkap" — seluruh styling baru wajib memakai kelas Tailwind/komponen shadcn/ui yang sudah ada.

### 4.5 Lucide React — Icons
- **Purpose:** Set ikon SVG untuk seluruh UI.
- **Why Selected:** Ikon default resmi ekosistem shadcn/ui, tree-shakeable per-ikon (tidak mengimpor seluruh set).
- **Advantages:** Ringan, konsisten secara visual, aktif dipelihara, kompatibel React Server/Client Components.
- **Limitations:** Gaya ikon tunggal (line icons) — jika kebutuhan desain memerlukan gaya lain (filled/duotone), perlu keputusan tambahan.
- **Alternative Considered:** Heroicons, React Icons (agregator banyak set ikon).
- **Why Alternative Was Rejected:** React Icons menggabungkan banyak set berbeda gaya dalam satu dependency besar (risiko inkonsistensi visual & bundle lebih besar); Heroicons kurang terintegrasi rapat dengan shadcn/ui dibanding Lucide.
- **Integration Notes:** Import per-ikon: `import { Home } from "lucide-react"`.
- **AI Development Notes:** Jangan mencampur set ikon lain (Font Awesome, Heroicons, dsb.) dalam satu halaman/komponen — konsistensi visual adalah bagian dari Definition of Done.

### 4.6 Supabase — Backend (BaaS)
- **Purpose:** Platform backend-as-a-service yang menyediakan Postgres, Auth, Storage, Row Level Security, dan Edge Functions dalam satu layanan terkelola.
- **Why Selected:** Memberi Auth + Storage + RLS siap pakai tanpa membangun ulang dari nol, sekaligus database relasional penuh (PostgreSQL) yang dibutuhkan skema ERD proyek yang kaya relasi (`PROJECT-CONSTITUTION.md` Bagian 4).
- **Advantages:** RLS sebagai lapisan pertahanan kedua di level database (selaras `PROJECT-CONSTITUTION.md` Bagian 20 poin 2); Realtime subscriptions untuk notifikasi in-app; Edge Functions untuk logic dekat-DB (trigger sitemap/indexing); mengurangi jumlah vendor/infrastruktur yang perlu dikelola tim kecil.
- **Limitations:** Vendor lock-in relatif terhadap API/konvensi Supabase; skala sangat besar (>>jutaan baris/detik) mungkin memerlukan strategi tambahan (read replica, sharding) di fase lanjutan; RLS policy yang kompleks (RBAC kustom proyek ini) butuh disiplin penulisan policy yang benar agar tidak membocorkan data.
- **Alternative Considered:** Firebase (Firestore/NoSQL), backend custom (NestJS/Express + Postgres terkelola sendiri seperti AWS RDS).
- **Why Alternative Was Rejected:** Firebase berbasis NoSQL tidak cocok dengan skema ERD relasional ketat proyek ini (FK, ENUM, UNIQUE composite — lihat ERD Bagian 2); backend custom penuh menambah beban operasional (mengelola server, auth, storage dari nol) yang bertentangan dengan prinsip Simplicity & Cost Efficiency untuk tahap MVP — dikonfirmasi final sebagai bagian keputusan arsitektur backend proyek (`architecture-decision-records.md` ADR-001, Approved: Route Handlers + Supabase, tanpa service Node.js terpisah).
- **Integration Notes:** Wajib dua lapis pertahanan — RBAC middleware aplikasi **dan** RLS (`AI-DEVELOPMENT-BLUEPRINT.md` Bagian 2); service role key **hanya** di server-side, tidak pernah ke client (`PROJECT-CONSTITUTION.md` Bagian 12 & 17).
- **AI Development Notes:** Jangan pernah meng-expose `SUPABASE_SERVICE_ROLE_KEY` ke bundle client-side; role/permission tetap dikelola di tabel `roles`/`role_permissions` aplikasi, bukan hanya metadata `auth.users` Supabase (`PROJECT-CONSTITUTION.md` Bagian 12).

### 4.7 PostgreSQL (Supabase) — Database
- **Purpose:** Database relasional utama seluruh entitas proyek (37+ tabel per ERD).
- **Why Selected:** ERD proyek memakai relasi ketat (FK, ENUM, UNIQUE composite) yang cocok RDBMS, bukan skema fleksibel NoSQL.
- **Advantages:** ACID compliance, dukungan indexing kaya (composite, trigram/full-text untuk `area_keyword`), ekosistem tooling matang (migration, backup).
- **Limitations:** Scaling horizontal butuh strategi eksplisit (partitioning/sharding) jika volume tumbuh sangat besar — dicatat sebagai keputusan arsitektur terpisah di masa depan (`SYSTEM-ARCHITECTURE.md` Bagian 20).
- **Alternative Considered:** MongoDB/NoSQL document store.
- **Why Alternative Was Rejected:** Tidak cocok dengan kebutuhan relasi ketat & constraint (CHECK, UNIQUE, FK cascading) yang menjadi tulang punggung RBAC dan ownership hard rule proyek ini.
- **Integration Notes:** Migration dikelola via Supabase CLI, disimpan di repo (`/apps/api/migrations`), tidak boleh diedit langsung lewat Supabase Studio di production (`PROJECT-CONSTITUTION.md` Bagian 12).
- **AI Development Notes:** Jangan mengganti nama tabel/field yang sudah ada; setiap perubahan skema wajib migration file + sinkronisasi `ERD-Skema-Database.md`/`ERD-Diagram.mermaid`.

### 4.8 Supabase Auth — Authentication
- **Purpose:** Mekanisme login (email/password, OTP, Google OAuth2), dibungkus JWT internal platform.
- **Why Selected:** Selaras `API-Specification` §0.1 & §1.1 — hasil akhir tetap JWT platform sendiri, sehingga endpoint lain tidak perlu tahu metode login yang dipakai.
- **Advantages:** OTP & OAuth2 siap pakai tanpa membangun ulang; terintegrasi rapat dengan RLS Supabase (`auth.uid()`).
- **Limitations:** Role/permission aplikasi (RBAC kustom 7 role) tidak sepenuhnya native di Supabase Auth — wajib tetap dikelola di tabel `roles`/`role_permissions` aplikasi sendiri.
- **Alternative Considered:** Auth0, Clerk, NextAuth.js/Auth.js custom.
- **Why Alternative Was Rejected:** Menambah vendor terpisah dari database (kompleksitas & biaya tambahan) padahal Supabase Auth sudah terintegrasi langsung dengan Postgres/RLS yang sudah dipilih sebagai database.
- **Integration Notes:** Verifikasi `id_token` Google OAuth wajib server-side dengan Google Auth Library resmi (`API-Specification` §9.5).
- **AI Development Notes:** Jangan menyimpan role di JWT/metadata Supabase sebagai satu-satunya sumber kebenaran — selalu validasi ulang terhadap tabel `role_permissions` aplikasi.

### 4.9 Supabase RLS + RBAC (kustom aplikasi) — Authorization
- **Purpose:** Lapisan otorisasi ganda — RBAC kustom (7 role: Superadmin/Manager/Admin/Instructor/Agen/Developer Partner/Buyer) di level aplikasi, RLS sebagai lapisan kedua di level database.
- **Why Selected:** `PROJECT-CONSTITUTION.md` Bagian 20 poin 2 mewajibkan RLS + middleware RBAC berlapis, tidak pernah hanya mengandalkan satu lapisan.
- **Advantages:** Ownership (`agent_id`) sebagai hard boundary ditegakkan dua kali (aplikasi & DB) — mengurangi risiko kebocoran data lintas agen meski ada bug di satu lapisan.
- **Limitations:** Kompleksitas ganda berarti setiap perubahan skema permission harus disinkronkan hati-hati di kedua lapisan agar tidak saling bertentangan.
- **Alternative Considered:** RBAC aplikasi saja tanpa RLS (percaya penuh pada middleware).
- **Why Alternative Was Rejected:** Bertentangan langsung dengan hard rule keamanan proyek (dua lapisan pertahanan wajib) — satu lapisan gagal (mis. bug middleware) akan langsung membocorkan seluruh data tanpa RLS sebagai jaring pengaman.
- **Integration Notes:** `granted_scope` (`own`/`all`/`none`) diterapkan di layer service/repository, bukan controller (`AI-DEVELOPMENT-BLUEPRINT.md` Bagian 31).
- **AI Development Notes:** Superadmin selalu bypass (short-circuit `true`); Manager selalu `granted_scope = 'all'` tanpa mode scoped tim/wilayah — ini keputusan final, jangan ditanyakan ulang.

### 4.10 Supabase Storage — Storage
- **Purpose:** Penyimpanan file foto/video listing (bucket publik) dan dokumen legalitas agen (bucket privat terenkripsi).
- **Why Selected:** Terintegrasi langsung dengan Supabase Auth/RLS untuk kontrol akses signed URL, mengurangi vendor tambahan.
- **Advantages:** Bucket publik vs privat terpisah tegas sesuai kebutuhan keamanan (`PROJECT-CONSTITUTION.md` Bagian 12); signed URL berumur pendek untuk dokumen KTP/NPWP.
- **Limitations:** Transformasi gambar (resize/format modern WebP/AVIF) tidak sekaya CDN gambar khusus (Cloudinary/ImageKit) — kompresi sisi client ditangani terpisah oleh `browser-image-compression` (Bagian 4.28).
- **Alternative Considered:** Cloudinary, ImageKit, AWS S3 + CloudFront.
- **Why Alternative Was Rejected:** Menambah vendor CDN gambar terpisah untuk MVP dianggap belum perlu selama Supabase Storage + kompresi client-side mencukupi target Core Web Vitals; opsi ini tetap dicatat sebagai evaluasi fase lanjutan (Bagian 8) jika kebutuhan transformasi gambar bertumbuh kompleks.
- **Integration Notes:** Bucket publik (`listing-photos`, `listing-videos`) vs privat (`agent-verification-documents`) — lihat `PROJECT-CONSTITUTION.md` Bagian 12.
- **AI Development Notes:** Dokumen legalitas tidak pernah lewat CDN publik; akses hanya via signed URL untuk role `superadmin`/`manager`/`admin` saat review.

### 4.11 Vercel — Hosting
- **Purpose:** Platform hosting & deployment untuk aplikasi Next.js.
- **Why Selected:** Kombinasi Next.js + Vercel adalah pasangan native (pembuat framework yang sama), memberi dukungan penuh fitur App Router (ISR, Edge Middleware, Image Optimization) tanpa konfigurasi tambahan.
- **Advantages:** Zero-config deploy dari GitHub, preview deployment per PR, edge caching bawaan mendukung target TTFB < 600ms.
- **Limitations:** Model harga berbasis fungsi serverless/edge dapat menjadi signifikan pada traffic sangat tinggi — perlu dipantau seiring pertumbuhan.
- **Alternative Considered:** Self-hosted (Docker + VPS/Kubernetes), Netlify, AWS Amplify.
- **Why Alternative Was Rejected:** Self-hosted menambah beban operasional DevOps yang tidak sepadan untuk tim kecil di tahap MVP; Netlify/Amplify memiliki dukungan fitur App Router Next.js (khususnya fitur terbaru seperti Server Actions/Cache Components) yang kurang seketat Vercel sebagai pembuat framework.
- **Integration Notes:** Deployment pipeline: GitHub → Vercel (lihat 4.13).
- **AI Development Notes:** Perhatikan `NODE_ENV`/environment variable per environment (staging/production) dikelola di dashboard Vercel, tidak pernah di-commit ke repo.

> **Catatan governance:** Keputusan teknologi Vercel sebagai hosting resmi sudah **Approved** (`architecture-decision-records.md` ADR-010, Deployment Strategy, 27 Juli 2026) — bukan lagi Open Question di dokumen ini (lihat Bagian 9). Sesuai `AI-CONTEXT-PACK.md` bagian "Potential Conflict" poin 3, satu-satunya sisa pekerjaan adalah administratif: keputusan ini **belum dibackfill formal** ke `PROJECT-CONSTITUTION.md` sebagai keputusan arsitektur (baru muncul di `SYSTEM-ARCHITECTURE.md` dan ADR ini) — tugas sinkronisasi dokumen governance, bukan keputusan teknologi yang masih terbuka.

### 4.12 GitHub — Repository
- **Purpose:** Version control & kolaborasi kode sumber.
- **Why Selected:** Integrasi native dengan Vercel (auto-deploy per push/PR) dan GitHub Actions untuk CI/CD.
- **Advantages:** Ekosistem terbesar untuk code review, Actions, dan integrasi pihak ketiga (Sentry, dsb.).
- **Limitations:** Tidak relevan untuk tim yang sudah terkunci di platform Git lain (GitLab/Bitbucket) — tidak berlaku di proyek ini.
- **Alternative Considered:** GitLab, Bitbucket.
- **Why Alternative Was Rejected:** Tidak memberi keuntungan tambahan dibanding GitHub untuk kombinasi stack ini, sementara integrasi Vercel paling matang lewat GitHub.
- **Integration Notes:** Branch protection + status check (lint/type-check/test/migration) wajib lolos sebelum merge ke `main` (`PROJECT-CONSTITUTION.md` Bagian 21).
- **AI Development Notes:** Commit message mengikuti Conventional Commits (`AI-DEVELOPMENT-BLUEPRINT.md` Bagian 19).

### 4.13 GitHub → Vercel — Deployment
- **Purpose:** Pipeline deployment otomatis dari commit/PR ke lingkungan preview & production.
- **Why Selected:** Menghilangkan langkah deploy manual; setiap PR otomatis mendapat preview URL untuk review visual sebelum merge.
- **Advantages:** Rollback instan ke deployment sebelumnya jika production bermasalah; preview environment memudahkan QA fitur baru termasuk oleh AI Coding Assistant untuk verifikasi visual.
- **Limitations:** Bergantung pada GitHub Actions/Vercel checks berjalan tepat waktu — CI yang lambat dapat menghambat kecepatan iterasi tim.
- **Alternative Considered:** Deployment manual via CLI, pipeline custom (Jenkins/GitLab CI di infra sendiri).
- **Why Alternative Was Rejected:** Menambah kompleksitas operasional tanpa manfaat signifikan dibanding integrasi native GitHub → Vercel untuk stack Next.js.
- **Integration Notes:** Lint + type-check + test otomatis + migration check wajib lolos sebagai gate sebelum merge (`PROJECT-CONSTITUTION.md` Bagian 21 poin 2).
- **AI Development Notes:** Jangan bypass CI check untuk "mempercepat" merge, termasuk saat bekerja sebagai AI Coding Assistant.

### 4.14 Resend — Transactional Email
- **Purpose:** Pengiriman email transaksional (OTP, notifikasi status approval, reminder).
- **Why Selected:** API modern berbasis developer-experience tinggi, terintegrasi baik dengan ekosistem TypeScript/React (React Email templates), mengisi kekosongan yang dicatat `SYSTEM-ARCHITECTURE.md` Bagian 23 poin 10 (provider email transaksional belum ditetapkan di dokumen sumber v1.1).
- **Advantages:** Deliverability baik, template berbasis komponen React, dashboard log pengiriman untuk debugging.
- **Limitations:** Harga per volume email perlu dipantau seiring pertumbuhan basis pengguna (agen + buyer).
- **Alternative Considered:** SendGrid, Amazon SES, Postmark.
- **Why Alternative Was Rejected:** SES membutuhkan konfigurasi infrastruktur tambahan (domain warm-up, DKIM manual) yang lebih berat untuk tim kecil; SendGrid/Postmark valid tetapi Resend dipilih karena DX (developer experience) TypeScript-nya paling selaras dengan stack Next.js/React yang sudah dipilih.
- **Integration Notes:** Dipakai untuk OTP (Modul 1), notifikasi status (Modul 8), bukan untuk marketing/bulk email.
- **AI Development Notes:** Jangan mengirim data sensitif (`net_income`, dokumen legalitas) sebagai lampiran/isi email — hanya notifikasi status & link aman.

### 4.15 Sentry — Monitoring
- **Purpose:** Error tracking & performance monitoring untuk frontend (Next.js) dan Route Handlers.
- **Why Selected:** Mengisi kekosongan tooling monitoring/observability yang dicatat sebagai open question di `SYSTEM-ARCHITECTURE.md` Bagian 23 poin 11; SDK resmi `@sentry/nextjs` terintegrasi rapat dengan App Router (server & client components, edge runtime).
- **Advantages:** Source map otomatis untuk stack trace production yang terbaca; performance tracing untuk mendeteksi regresi Core Web Vitals/TTFB.
- **Limitations:** Volume error/tracing tinggi dapat memakan kuota paket berbayar — perlu sampling rate dikonfigurasi wajar.
- **Alternative Considered:** LogRocket, Datadog, self-hosted (Grafana + Loki).
- **Why Alternative Was Rejected:** Datadog/self-hosted jauh lebih kompleks & mahal untuk kebutuhan MVP; LogRocket lebih berfokus session replay dibanding error/performance tracing yang jadi prioritas utama proyek ini.
- **Integration Notes:** `request_id`/`correlation_id` di error backend wajib konsisten dengan yang dikembalikan ke client (`PROJECT-CONSTITUTION.md` Bagian 13).
- **AI Development Notes:** Jangan pernah mengirim data sensitif (`net_income`, KTP/NPWP, token JWT penuh) ke Sentry breadcrumb/context — scrub sebelum log terkirim.

### 4.16 TanStack Query — Server State
- **Purpose:** Fetching, caching, dan sinkronisasi data server di sisi client (dashboard, admin panel).
- **Why Selected:** Mengelola cache server-state secara deklaratif (loading/error/stale state) tanpa reinventing logic tersebut secara manual, terintegrasi baik dengan Supabase client & Route Handlers.
- **Advantages:** Automatic refetching, cache invalidation granular, devtools bawaan untuk debugging; mengurangi boilerplate `useEffect` + `useState` manual untuk data fetching.
- **Limitations:** Konsep cache key & invalidation butuh pemahaman tim agar tidak terjadi stale data yang tidak disadari, khususnya pada dashboard real-time-ish (jumlah lead, notifikasi).
- **Alternative Considered:** SWR.
- **Why Alternative Was Rejected:** **SWR eksplisit dilarang** di Bagian 6 — untuk menghindari dua library server-state berfungsi sama berjalan berdampingan; TanStack Query dipilih karena fitur mutation & devtools lebih lengkap untuk kebutuhan CRUD dashboard yang kompleks (listing, DBR, admin panel).
- **Integration Notes:** Dipakai khusus di route group `(dashboard)`/`(admin)` (CSR) — halaman publik `(public)` tetap mengandalkan Server Component fetch, bukan TanStack Query, untuk menjaga SSR.
- **AI Development Notes:** Jangan mencampur pola fetch manual (`useEffect` + `fetch`) dengan TanStack Query dalam komponen yang sama — pilih satu pola secara konsisten per halaman.

### 4.17 Zustand — UI State
- **Purpose:** State management untuk state UI lokal/lintas komponen yang bukan server-state (mis. state wizard form multi-step, filter UI sementara, modal state global).
- **Why Selected:** API minimal (tanpa boilerplate reducer/action/dispatch), ukuran bundle sangat kecil, cocok dengan prinsip Simplicity.
- **Advantages:** Tidak memerlukan Context Provider bertingkat; mudah dipadukan dengan TypeScript untuk tipe store yang ketat; performa baik karena hanya me-render ulang komponen yang subscribe ke slice state terkait.
- **Limitations:** Tanpa struktur/disiplin tim, store bisa jadi "keranjang sampah" state acak — perlu konvensi jelas (satu store per domain UI, bukan satu store raksasa global).
- **Alternative Considered:** Redux (Toolkit), Context API murni, Jotai/Recoil.
- **Why Alternative Was Rejected:** **Redux eksplisit dilarang** di Bagian 6 karena boilerplate berlebihan untuk kebutuhan UI state proyek ini; Context API murni tidak dioptimasi untuk update frekuensi tinggi (re-render berlebihan); Jotai/Recoil valid tapi tidak dipilih agar tidak menambah satu lagi library state tanpa kebutuhan jelas di luar yang sudah dipilih (TanStack Query untuk server state sudah menangani sebagian besar kebutuhan).
- **Integration Notes:** Server state (data dari API) **tidak** disimpan di Zustand — itu domain TanStack Query; Zustand murni untuk UI state.
- **AI Development Notes:** Sebelum membuat store Zustand baru, pastikan state yang dimaksud benar-benar UI state, bukan server state yang seharusnya lewat TanStack Query.

### 4.18 React Hook Form — Forms
- **Purpose:** Manajemen state form (registrasi, listing, kalkulator DBR, admin panel).
- **Why Selected:** Performa tinggi (uncontrolled inputs, minim re-render), terintegrasi rapat dengan Zod lewat resolver resmi.
- **Advantages:** API deklaratif dengan validasi real-time; mendukung form kompleks (nested fields, field array) yang dibutuhkan form listing (foto multi-upload, field lokasi cascading).
- **Limitations:** Pola uncontrolled berbeda dari form berbasis state React biasa — perlu penyesuaian pola pikir tim yang terbiasa controlled input penuh.
- **Alternative Considered:** Formik.
- **Why Alternative Was Rejected:** **Formik eksplisit dilarang** di Bagian 6 — performa re-render Formik lebih rendah dibanding React Hook Form pada form besar/kompleks seperti form listing multi-step proyek ini.
- **Integration Notes:** Dipasangkan dengan `@hookform/resolvers` + Zod (lihat 4.19) sebagai satu sumber skema validasi FE & BE.
- **AI Development Notes:** Skema validasi Zod ditulis sekali di `lib/validation`/`shared-types`, dipakai sebagai resolver React Hook Form — jangan duplikasi aturan validasi manual di dalam komponen form.

### 4.19 Zod — Validation
- **Purpose:** Skema validasi tunggal untuk seluruh input — dipakai baik di client (real-time form validation) maupun server (validasi ulang sebelum tulis DB).
- **Why Selected:** TypeScript-first (skema otomatis menghasilkan tipe statis lewat `z.infer`), memenuhi prinsip Single Source of Truth validasi (`PROJECT-CONSTITUTION.md` Bagian 14).
- **Advantages:** Satu definisi skema untuk validasi + tipe, mengurangi duplikasi & drift antara tipe TypeScript manual dan aturan validasi runtime.
- **Limitations:** Skema kompleks (validasi kondisional lintas field, mis. konversi tenor tahun→bulan) butuh `.refine()`/`.transform()` yang perlu didokumentasikan agar mudah dipahami AI Coding Assistant berikutnya.
- **Alternative Considered:** Yup, Joi.
- **Why Alternative Was Rejected:** Yup/Joi tidak memiliki inferensi tipe TypeScript native sekuat Zod (`z.infer`), sehingga tetap membutuhkan definisi tipe terpisah yang berisiko drift dari skema validasi.
- **Integration Notes:** Backend tidak boleh mempercayai validasi frontend — validasi ulang di server wajib untuk semua endpoint mutating (`POST`/`PUT`/`PATCH`).
- **AI Development Notes:** Field wajib PRD Modul 3.2 (judul, lokasi cascading, harga, minimal 3 foto, status legalitas, no. WA) divalidasi Zod **sebelum** status listing berubah ke `pending_review`.

### 4.20 Vitest — Unit Testing
- **Purpose:** Unit test untuk business logic (service layer, utility functions, skema Zod).
- **Why Selected:** Kompatibel native dengan tooling Vite/Next.js modern, konfigurasi minimal, kecepatan eksekusi tinggi dibanding Jest pada proyek berbasis ESM/TypeScript.
- **Advantages:** API mirip Jest (kurva belajar rendah bagi tim yang familiar Jest), watch mode sangat cepat, dukungan native TypeScript/ESM tanpa transpilasi tambahan.
- **Limitations:** Ekosistem plugin sedikit lebih muda dibanding Jest — kebutuhan sangat niche mungkin butuh workaround.
- **Alternative Considered:** Jest.
- **Why Alternative Was Rejected:** Jest tetap valid secara fungsional, namun Vitest dipilih untuk performa & kompatibilitas ESM/TypeScript yang lebih mulus dengan stack Next.js modern — menghindari dua test runner berjalan berdampingan tanpa alasan kuat.
- **Integration Notes:** Dijalankan sebagai CI gate wajib sebelum merge (`PROJECT-CONSTITUTION.md` Bagian 21).
- **AI Development Notes:** Business logic sensitif (perhitungan DBR, filter `granted_scope`, ownership check) wajib memiliki unit test eksplisit, bukan hanya diuji manual.

### 4.21 React Testing Library — Component Testing
- **Purpose:** Pengujian komponen React dari perspektif interaksi pengguna (bukan detail implementasi internal).
- **Why Selected:** Standar industri untuk pengujian komponen React, filosofi "test seperti pengguna memakai aplikasi" cocok untuk memverifikasi form/dashboard yang kompleks.
- **Advantages:** Query berbasis accessibility role/label mendorong komponen yang lebih aksesibel; terintegrasi mulus dengan Vitest.
- **Limitations:** Tidak menguji end-to-end lintas halaman/navigasi nyata (itu domain Playwright).
- **Alternative Considered:** Enzyme.
- **Why Alternative Was Rejected:** Enzyme sudah tidak lagi dipelihara aktif untuk versi React modern (Server Components) — tidak kompatibel dengan arsitektur App Router.
- **Integration Notes:** Dipasangkan dengan `@testing-library/jest-dom` untuk matcher tambahan (`toBeInTheDocument`, dsb.).
- **AI Development Notes:** Query elemen berdasarkan role/label (`getByRole`), bukan `data-testid` sebagai default pertama, agar test turut memverifikasi aksesibilitas.

### 4.22 Playwright — E2E Testing
- **Purpose:** Pengujian end-to-end lintas browser untuk alur kritis (registrasi agen, publish listing, submit DBR, moderasi admin).
- **Why Selected:** Dukungan multi-browser (Chromium, Firefox, WebKit) dalam satu API, auto-wait bawaan mengurangi flaky test, dan dukungan resmi Next.js/Vercel yang matang.
- **Advantages:** Trace viewer untuk debugging test gagal, dapat dijalankan di CI (GitHub Actions) dengan mudah, mendukung pengujian visual & network mocking.
- **Limitations:** Waktu eksekusi E2E lebih lambat dibanding unit test — perlu strategi seleksi alur kritis saja, bukan menguji seluruh permutasi UI lewat E2E.
- **Alternative Considered:** Cypress.
- **Why Alternative Was Rejected:** Cypress secara historis lebih terbatas pada multi-tab/multi-origin testing dan dukungan browser WebKit dibanding Playwright, yang relevan untuk alur OAuth Google (redirect antar origin).
- **Integration Notes:** Dijalankan sebagai bagian CI gate untuk alur kritis sebelum merge ke `main`.
- **AI Development Notes:** Prioritaskan E2E untuk *acceptance criteria* modul di PRD (mis. "Agen baru dapat submit form registrasi lengkap"), bukan menduplikasi seluruh unit test di level E2E.

### 4.23 Recharts — Charts
- **Purpose:** Visualisasi data (dashboard agen: jumlah lead 7/30 hari; dashboard admin: statistik agen/listing/proyek).
- **Why Selected:** Berbasis React/SVG deklaratif (komponen React biasa, bukan wrapper canvas library eksternal), dokumentasi baik, cukup untuk kebutuhan chart standar (bar, line, pie) proyek ini.
- **Advantages:** API deklaratif konsisten dengan pola komponen React lain di proyek; responsif bawaan (`ResponsiveContainer`).
- **Limitations:** Untuk visualisasi sangat kompleks/custom (mis. chart geospasial lanjutan), mungkin kurang fleksibel dibanding D3 murni — belum menjadi kebutuhan di scope Fase 1-2.
- **Alternative Considered:** Chart.js, Victory, D3 murni.
- **Why Alternative Was Rejected:** Chart.js berbasis Canvas API imperatif (kurang idiomatis dalam paradigma komponen React deklaratif); D3 murni terlalu low-level untuk kebutuhan dashboard standar dan menambah kompleksitas pengembangan tanpa manfaat sepadan di tahap ini.
- **Integration Notes:** Dipakai di route group `(dashboard)`/`(admin)` (CSR), bukan halaman publik.
- **AI Development Notes:** Jangan menambah library chart kedua (mis. Chart.js) untuk kasus penggunaan yang sudah bisa dipenuhi Recharts.

### 4.24 TanStack Table — Table
- **Purpose:** Tabel data kompleks (daftar listing admin, daftar agen, laporan) dengan sorting/filtering/pagination sisi client maupun server-driven.
- **Why Selected:** Headless (tanpa opini UI, dipadukan bebas dengan shadcn/ui `Table` component), mendukung pagination server-side yang wajib diterapkan di seluruh query list (`PROJECT-CONSTITUTION.md` Bagian 19).
- **Advantages:** Sangat fleksibel untuk kebutuhan tabel kompleks (kolom dinamis, row selection, expandable rows) yang relevan untuk Admin Panel/CMS.
- **Limitations:** Headless berarti styling & markup sepenuhnya tanggung jawab tim (dipadukan dengan shadcn/ui `Table`) — bukan tabel "siap pakai" bergaya seperti AG Grid.
- **Alternative Considered:** AG Grid, react-table v7 (versi lama).
- **Why Alternative Was Rejected:** AG Grid membawa opini UI berat & lisensi berbayar untuk fitur enterprise yang tidak dibutuhkan skala proyek ini; react-table v7 adalah versi API lama — TanStack Table adalah penerus resminya (v8+).
- **Integration Notes:** Query list API selalu paginated (`?page=1&per_page=20`) — TanStack Table dikonfigurasi mode `manualPagination` untuk tabel berbasis data server.
- **AI Development Notes:** Jangan mengambil seluruh baris tanpa limit ke client lalu memfilter di frontend — filter/paginate wajib di level API sesuai kontrak `API-Specification` §0.4.

### 4.25 dnd-kit — Drag & Drop
- **Purpose:** Interaksi drag-and-drop (mis. mengurutkan foto listing, menyusun ulang urutan modul kursus/kuis di Learning Center).
- **Why Selected:** Library drag-and-drop modern untuk React yang aktif dipelihara, dengan dukungan aksesibilitas (keyboard navigation) bawaan.
- **Advantages:** Modular (core + sortable preset terpisah, hanya impor yang dibutuhkan), performa baik dengan sensor pointer/keyboard.
- **Limitations:** API berbasis primitives (butuh sedikit lebih banyak setup dibanding library "drop-in" lama) — namun ini trade-off wajar untuk fleksibilitas & maintenance jangka panjang.
- **Alternative Considered:** react-beautiful-dnd.
- **Why Alternative Was Rejected:** `react-beautiful-dnd` sudah **dinyatakan deprecated** oleh maintainer aslinya (Atlassian) dan tidak lagi menerima update kompatibilitas React versi baru — bertentangan dengan prinsip Long Term Support.
- **Integration Notes:** Dipakai di form upload foto listing (reorder foto & pilih cover) dan admin Learning Center (reorder lesson/soal).
- **AI Development Notes:** Pastikan urutan hasil drag-drop disimpan eksplisit (kolom `order`/`position`) di skema DB terkait, bukan hanya diasumsikan dari urutan array response API.

### 4.26 date-fns — Date Library
- **Purpose:** Manipulasi & formatting tanggal (masa berlaku listing, expiry, jadwal event, tenor DBR).
- **Why Selected:** Modular (tree-shakeable per fungsi, bukan satu objek besar), immutable by design, ukuran bundle jauh lebih kecil dibanding alternatif monolitik.
- **Advantages:** Fungsi murni per kebutuhan (`format`, `addMonths`, `differenceInDays`) memudahkan tree-shaking; dukungan locale Indonesia (`id`) untuk format tanggal lokal.
- **Limitations:** Penanganan timezone kompleks (lintas zona waktu) membutuhkan paket pendamping (`date-fns-tz`) jika suatu saat dibutuhkan — belum menjadi kebutuhan eksplisit di dokumen sumber (aplikasi berbasis WIB/lokal Indonesia).
- **Alternative Considered:** Moment.js, Day.js, Luxon.
- **Why Alternative Was Rejected:** **Moment.js eksplisit dilarang** di Bagian 6 (sudah dinyatakan dalam mode maintenance oleh tim intinya, mutable API rawan bug, ukuran besar); Day.js/Luxon valid secara teknis namun tidak dipilih agar tidak ada dua library date-utility berfungsi tumpang tindih tanpa Architecture Decision eksplisit.
- **Integration Notes:** Konversi tenor tahun→bulan (keputusan final `tenor_months`) sebaiknya memakai utility murni, bukan objek Date, karena tenor adalah angka bulan, bukan rentang tanggal.
- **AI Development Notes:** Jangan mengimpor seluruh `date-fns` sebagai satu objek — impor fungsi spesifik (`import { format } from "date-fns"`) untuk menjaga tree-shaking optimal.

### 4.27 pdf-lib — PDF
- **Purpose:** Generate PDF (export hasil simulasi DBR untuk lampiran pengajuan KPR ke bank, per PRD Modul 7 User Flow 5.7).
- **Why Selected:** Library PDF murni JavaScript/TypeScript yang berjalan baik di lingkungan Node.js (Route Handlers) tanpa dependency native/binary eksternal (mis. headless Chrome).
- **Advantages:** Dapat membuat & memodifikasi PDF terprogram (isi form, tambah teks/gambar) sepenuhnya di sisi server, ringan untuk dijalankan di lingkungan serverless (Vercel Functions).
- **Limitations:** Tidak dirancang untuk "convert HTML ke PDF" — layout kompleks harus disusun manual lewat API (koordinat teks/gambar), bukan dari template HTML/CSS existing.
- **Alternative Considered:** Puppeteer/Playwright (render HTML → PDF), jsPDF.
- **Why Alternative Was Rejected:** Puppeteer/headless Chrome jauh lebih berat untuk lingkungan serverless (ukuran binary besar, cold start lambat di Vercel Functions); jsPDF valid secara fungsi tapi tumpang tindih penuh dengan pdf-lib — memilih satu untuk menghindari duplikasi library dengan fungsi sama (Bagian 6).
- **Integration Notes:** Dipanggil dari Route Handler saat agen klik "Export ke PDF" di kalkulator DBR (User Flow Modul 7).
- **AI Development Notes:** Data finansial (`net_income`, `existing_installments`) yang masuk ke PDF tetap tunduk pada aturan data sensitif — PDF hasil generate tidak boleh disimpan di storage publik.

### 4.28 browser-image-compression — Image Compression
- **Purpose:** Kompresi gambar di sisi client sebelum upload (foto listing) agar ukuran file lebih kecil sebelum mencapai Supabase Storage.
- **Why Selected:** Mengurangi beban upload & bandwidth, mendukung target performa (LCP) dengan memastikan gambar sudah dioptimasi sebelum tersimpan, mengurangi kebutuhan CDN transformasi pihak ketiga yang berat di sisi server.
- **Advantages:** Berjalan di Web Worker (tidak memblokir main thread saat kompresi), konfigurasi target ukuran file maksimal & resolusi maksimal.
- **Limitations:** Kompresi sisi client bergantung kemampuan device pengguna (perangkat agen di lapangan mungkin bervariasi) — tetap perlu validasi ukuran & tipe file ulang di server (`PROJECT-CONSTITUTION.md` Bagian 16).
- **Alternative Considered:** Kompresi server-side penuh (Sharp) atau CDN transformation (Cloudinary/ImageKit) sebagai satu-satunya lapisan optimasi.
- **Why Alternative Was Rejected:** Server-side-only compression menambah beban proses di Route Handlers/serverless function (biaya & waktu proses lebih tinggi); pendekatan hybrid (kompresi client + Supabase Storage) dipilih agar sejalan dengan keputusan tidak menambah vendor CDN gambar terpisah di Bagian 4.10.
- **Integration Notes:** Dijalankan sebelum `POST /listings/{id}/media`, bukan pengganti validasi MIME/magic-bytes di server.
- **AI Development Notes:** Validasi tipe file **wajib** tetap dilakukan di server (cek magic bytes), kompresi client bukan pengganti validasi keamanan upload.

### 4.29 Leaflet + OpenStreetMap + LocationIQ + Geoapify — Maps & Geocoding (final, migrasi bertahap terjadwal MVP → Growth → Scale → Enterprise)
- **Purpose:** Rendering peta interaktif (client-side), autocomplete alamat (client-side), reverse geocoding & distance matrix (server-side) untuk fitur lokasi listing (Modul 3) dan peta proyek developer (Modul 6).
- **Why Selected:** Dikunci final via `architecture-decision-records.md` ADR-008 (Approved, 30 Juli 2026, direvisi v3) setelah prioritas proyek direvisi ke tiga kriteria dominan: budget-friendly, adopsi luas di komunitas developer Indonesia, dan Bolt.new-friendliness. **Leaflet + React-Leaflet** dipilih untuk rendering (tiles OpenStreetMap gratis, tanpa API key); **LocationIQ** dipilih sebagai Primary Geocoding Provider (API kompatibel-Nominatim, free tier 5.000 request/hari); **Geoapify** ditetapkan sebagai Approved Alternative Provider (failover otomatis, berbasis data OpenStreetMap yang sama, mendukung batch geocoding). Seluruh integrasi dibungkus lapisan abstraksi provider-agnostic (`MapsProvider` interface).
- **Advantages:** Rendering 100% gratis tanpa API key (tiles OSM publik); Leaflet (~2,5 juta unduhan mingguan) & OpenStreetMap sangat dominan di ekosistem tutorial/proyek developer Indonesia, menekan risiko halusinasi kode AI Coding Assistant; LocationIQ & Geoapify keduanya layanan SaaS hosted (bukan self-hosted), selaras filosofi serverless-first ADR-001; risiko kebocoran key jauh berkurang dibanding opsi Google Maps — hanya `LOCATIONIQ_API_KEY` (server-side) yang perlu dijaga rahasia.
- **Limitations:** Akurasi data alamat/POI Indonesia untuk kompleks perumahan baru berpotensi lebih rendah dibanding Google Maps di sebagian wilayah — dimitigasi via field `area_keyword` freetext yang sudah ada di ERD dan Offline/Manual Address Fallback 3 lapis (lihat Integration Notes); kuota harian LocationIQ (5.000/hari) perlu dipantau sejak Sprint S0.
- **Alternative Considered:** Google Maps Platform (akurasi data Indonesia terbaik & satu vendor untuk seluruh kebutuhan, namun biaya per-request tertinggi — $5/1000 geocoding — dan kurang selaras kriteria budget-friendly/adopsi komunitas lokal; dipertahankan sebagai jalur migrasi tahap Enterprise); Mapbox (85% lebih murah dari Google untuk geocoding — $0,75/1000 — namun mewajibkan kartu kredit sejak free tier dan adopsi komunitas developer Indonesia jauh lebih tipis); OpenStreetMap self-hosted (tile server sendiri); HERE Maps/TomTom.
- **Why Alternative Was Rejected:** Google Maps Platform tidak dipilih untuk Fase 1 karena model biaya per-request tertinggi di antara seluruh opsi dan kurang selaras kriteria budget-friendly/adopsi komunitas developer Indonesia yang menjadi prioritas dominan — **tidak ditolak permanen**, tetap tercatat sebagai target migrasi tahap Enterprise di roadmap. Mapbox ditolak untuk Fase 1 karena mewajibkan kartu kredit sejak free tier dan adopsi komunitas lokal lebih tipis — dipertahankan sebagai kandidat migrasi tahap Scale (khusus Autocomplete). OpenStreetMap self-hosted ditolak karena bertentangan dengan filosofi serverless-first ADR-001 (membutuhkan infrastruktur tile-server tambahan yang di-host sendiri) — digantikan pendekatan tiles OSM via layanan hosted pihak ketiga tanpa self-hosting. HERE Maps/TomTom ditolak karena dokumentasi & komunitas developer untuk konteks Indonesia jauh lebih tipis.
- **Migration Roadmap (bertahap, berbasis ambang volume):** **MVP** (saat ini) — LocationIQ primary + Geoapify failover. **Growth** — dipicu saat request geocoding >5.000/hari konsisten 30 hari, atau listing aktif >10.000: upgrade tier LocationIQ berbayar atau alihkan sebagian beban ke Geoapify batch tier. **Scale** — dipicu saat p95 latency geocoding memburuk signifikan atau volume >100.000 request/bulan: migrasi parsial Autocomplete ke Mapbox Geocoding (rendering tetap Leaflet/MapLibre). **Enterprise** — dipicu saat butuh SLA komersial atau akurasi alamat jadi diferensiator kompetitif: revisit Google Maps Platform penuh via `MapsProvider` abstraction layer yang sudah disiapkan sejak Fase 1. Kriteria ini ditinjau ulang setiap akhir kuartal pasca-launch, konsisten dengan pola migrasi ADR-005/ADR-006.
- **Caching Strategy:** Geocoding & reverse geocoding di-cache di **PostgreSQL/Supabase** (tabel baru `geocode_cache`, key alamat ternormalisasi/koordinat dibulatkan 5 desimal, TTL ~90 hari) — tanpa menambah Redis, konsisten dengan keputusan final ADR-018 (Approved) yang juga memilih Postgres-native untuk Fase 1. Autocomplete tidak disimpan di database (volatil, reuse rendah); dimitigasi debounce 300–500ms client-side + cache edge jangka pendek Next.js (`fetch`/`unstable_cache`, revalidate singkat).
- **Rate Limiting:** Kebijakan scoped khusus endpoint Maps — Autocomplete 20/menit/IP, Geocode/Reverse Geocode 10/menit/IP — via tabel interim `api_rate_limits` di Postgres. Kebijakan ini tetap berdiri sebagai kebijakan scoped terpisah, kompatibel dengan mekanisme final ADR-018 (tabel `rate_limit_log`, sliding window, Postgres-native Fase 1) — lihat §4.32. Mass/batch geocoding wajib melalui jalur admin terautentikasi, tidak lewat endpoint publik.
- **Offline/Manual Address Fallback:** Diformalkan 3 lapis — (1) data administratif (`province_id`/`city_id`/`district_id`) via cascading dropdown dari tabel `ref_provinces/cities/districts` yang sudah di-host internal, tidak terpengaruh status Geocoding API; (2) alamat jalan freetext (`listings.address`) tetap dapat diisi manual tanpa Autocomplete; (3) input koordinat manual/drag-pin di peta Leaflet sebagai fallback saat reverse geocoding gagal (`listings.latitude`/`longitude` sudah NULLABLE, tidak perlu perubahan skema).
- **Integration Notes:** Reverse geocoding & Distance Matrix dipanggil server-side (`LOCATIONIQ_API_KEY` rahasia); Autocomplete client-side tanpa API key untuk tiles OSM standar. Fallback chain: LocationIQ (primary) → Geoapify (secondary) → Offline/Manual Fallback. Tabel baru `geocode_cache` (dan opsional `api_rate_limits`) perlu masuk migration awal Database Schema Alignment.
- **AI Development Notes:** Status `// TODO: menunggu resolusi ADR-008` pada implementasi lokasi listing/peta proyek developer **sudah dapat dihapus** — boleh diimplementasikan penuh menggunakan Leaflet + React-Leaflet + LocationIQ/Geoapify. AI Coding Assistant dilarang menambahkan Google Maps API/`@vis.gl/react-google-maps`/`@react-google-maps/api` untuk kebutuhan Maps proyek ini kecuali melalui ADR baru yang men-supersede ADR-008 (mis. saat migrasi tahap Enterprise benar-benar dieksekusi dan disetujui manusia). Jangan pernah mengekspos `LOCATIONIQ_API_KEY`/`GEOAPIFY_API_KEY` ke client — seluruh panggilan geocoding wajib server-side.

### 4.30 PostgreSQL Full-Text Search + pg_trgm — Search Engine (Fase 1, migrasi terjadwal ke Typesense di Fase 2)
- **Purpose:** Mesin pencari di balik `GET /properties/search` dan `GET /properties/autocomplete` (`API-Specification-v1.1.md` §3) — filter kombinasi (kategori, tipe transaksi, lokasi cascading, rentang harga/luas, kamar, sertifikat) serta typo-tolerance terbatas pada autocomplete.
- **Why Selected:** Dikunci final via `architecture-decision-records.md` ADR-005 (Approved, 28 Juli 2026) sebagai strategi bertahap — Fase 1 memakai kapabilitas native Postgres (`tsvector`/`tsquery` + ekstensi `pg_trgm`) tanpa menambah komponen infrastruktur di luar Supabase, konsisten dengan ADR-001 (Backend Architecture, Approved) yang mengunci filosofi minimal-vendor. Tidak ada proyeksi volume listing di PRD/roadmap yang membuat pendekatan ini menjadi bottleneck nyata di Fase 1.
- **Advantages:** Nol biaya infrastruktur tambahan (termasuk dalam biaya Supabase yang sudah dibayar); nol vendor baru; query SQL adalah pola paling matang untuk AI Coding Assistant/Bolt.new men-generate kode secara konsisten; kolom generated `search_vector` (tsvector) + index GIN pada tabel `listings` dapat direview & di-rollback lewat migration SQL biasa (selaras ADR-004).
- **Limitations:** Typo-tolerance & performa filter kompleks pada volume sangat besar lebih terbatas dibanding mesin pencari khusus — batasan ini adalah keputusan MVP yang disengaja, bukan bug, dan dimitigasi dengan kriteria ambang migrasi eksplisit ke Fase 2.
- **Alternative Considered:** Typesense (dipertahankan sebagai target migrasi Fase 2 terjadwal, bukan ditolak permanen); Elasticsearch/OpenSearch; Algolia (search-as-a-service).
- **Why Alternative Was Rejected:** Typesense/Elasticsearch/Algolia sejak Fase 1 dinilai over-engineering untuk tim kecil di tahap MVP — seluruhnya menambah komponen infrastruktur dan/atau ketergantungan pada mekanisme sinkronisasi data. Pada saat keputusan ini diambil, mekanisme job queue (ADR-006) masih **OPEN**, sehingga memilih mesin eksternal sekaligus berarti berasumsi terhadap ADR lain yang belum disahkan (bertentangan dengan `architecture-decision-records.md` Bagian 10 poin 4) — **ADR-006 kini sudah Approved** (29 Juli 2026: Vercel Cron Jobs + Postgres Trigger Fase 1, QStash Fase 2), sehingga mekanisme sinkronisasi index untuk migrasi Fase 2 Search kini juga sudah tersedia. Elasticsearch/OpenSearch juga ditolak untuk seluruh fase proyek saat ini karena kompleksitas operasional & biaya cluster tertinggi tanpa kebutuhan agregasi analitik kompleks yang memerlukannya; Algolia ditolak karena vendor lock-in tertinggi dan model biaya per-record+request yang tidak proporsional dengan model monetisasi platform yang belum final.
- **Migration Trigger (Fase 2 → Typesense):** Migrasi terjadwal dipicu begitu salah satu kriteria berikut tercapai — (a) volume listing aktif melampaui ±50.000 baris, (b) latensi p95 endpoint `/properties/search` melampaui 500ms pada beban produksi terukur, atau (c) keluhan relevansi pencarian berulang (≥3 laporan independen dalam satu sprint) yang tidak dapat diperbaiki lewat tuning index Postgres. Kriteria ini ditinjau ulang setiap akhir kuartal pasca-launch.
- **Integration Notes:** Logic pencarian tetap berada sepenuhnya di dalam `apps/web` sebagai Route Handlers (selaras ADR-001) — tidak ada folder/service baru. `GET /properties/map-bounds` dan `GET /properties/nearby` tidak terpengaruh (murni geospasial berbasis lat/lng, tidak bergantung mesin pencari teks).
- **AI Development Notes:** Status `// TODO: menunggu resolusi ADR-005` pada implementasi Modul 3 (search/filter/autocomplete lanjutan) **sudah dapat dihapus** — endpoint search/autocomplete boleh diimplementasikan penuh menggunakan query Postgres (`to_tsquery`/`similarity()`). AI Coding Assistant tetap wajib memantau tiga kriteria ambang migrasi di atas saat menulis dokumentasi/monitoring terkait volume & performa search. Mekanisme sinkronisasi index eksternal (Fase 2) kini dapat diimplementasikan mengikuti pola Job Queue yang sudah dikunci ADR-006 (Vercel Cron Jobs + Postgres Trigger, lihat §4.31) begitu migrasi Fase 2 benar-benar dieksekusi.

### 4.31 Vercel Cron Jobs + Postgres Trigger/Database Webhook — Job Queue/Scheduler (Fase 1, migrasi terjadwal ke QStash di Fase 2)
- **Purpose:** Mekanisme proses asinkron/terjadwal di balik regenerasi sitemap event-driven + panggilan Google Indexing API (`SEO-Analytics-Specification-v1.1.md` §1.5/§4.3), reminder event H-1 (Modul 5), dan sinkronisasi counter denormalisasi (Modul 3/8) — serta kebutuhan Agent Workspace di masa depan (reminder listing stale, jadwal temu, reminder customer).
- **Why Selected:** Dikunci final via `architecture-decision-records.md` ADR-006 (Approved, 29 Juli 2026) sebagai strategi hybrid native — tugas terjadwal periodik memakai **Vercel Cron Jobs** (fitur platform Vercel yang sudah dipakai, ADR-010) memanggil Route Handler; tugas event-driven instan (counter sync) memakai **Postgres Trigger**, dan event mendekati real-time (sitemap saat publish) memakai **Database Webhook** memanggil Route Handler yang sama — seluruhnya dalam satu `apps/web`, konsisten dengan filosofi minimal-vendor ADR-001. Kebutuhan aktual proyek didominasi tugas terjadwal periodik, bukan queue event bervolume tinggi, sehingga solusi native ini memadai untuk Fase 1.
- **Advantages:** Nol biaya infrastruktur tambahan (termasuk dalam plan Vercel + Supabase yang sudah dibayar); nol vendor baru; nol runtime kedua (tidak seperti Supabase Edge Functions yang memakai Deno terpisah); SQL trigger dan Route Handler + cron config adalah pola paling matang bagi AI Coding Assistant untuk digenerate konsisten.
- **Limitations:** Setiap invocation cron tunduk batas eksekusi serverless Vercel (~10–60 detik) — scan batch (mis. listing >90 hari) wajib memakai pagination/batching; keterbatasan retry/backoff dibanding queue engine matang adalah keputusan MVP yang disengaja, bukan bug, dan dimitigasi dengan kriteria ambang migrasi eksplisit ke Fase 2.
- **Alternative Considered:** QStash — Upstash (dipertahankan sebagai target migrasi Fase 2 terjadwal, bukan ditolak permanen); Supabase Edge Functions + pg_cron/Database Webhooks; BullMQ + Redis (self-hosted atau Upstash Redis).
- **Why Alternative Was Rejected:** **BullMQ+Redis ditolak secara fundamental untuk Fase 1** — worker-nya mengasumsikan proses long-running yang tidak dapat berjalan sebagai Vercel serverless function tanpa menambah service hosting terpisah (Railway/Render/VM), bertentangan langsung dengan filosofi minimal-vendor ADR-001; kompleksitas operasional dan biaya tertinggi di antara seluruh opsi. Supabase Edge Functions ditolak karena menambah runtime kedua (Deno) terpisah dari `apps/web` tanpa manfaat yang tidak bisa dicapai kombinasi Vercel Cron + Route Handler. QStash dipertahankan sebagai kandidat Fase 2 kondisional — unggul pada retry/backoff/skalabilitas namun adopsi dini dinilai prematur untuk kebutuhan MVP saat ini.
- **Migration Trigger (Fase 2 → QStash):** Migrasi terjadwal dipicu begitu salah satu kriteria berikut tercapai — (a) volume job harian melampaui kapasitas batching satu invocation cron (~10–60 detik per batch), (b) dibutuhkan retry/backoff/dead-letter yang tidak dapat dipenuhi pola cron sederhana, atau (c) frekuensi job melampaui batas cron interval tier Vercel yang dipakai. Kriteria ini ditinjau ulang setiap akhir kuartal pasca-launch.
- **Integration Notes:** Endpoint cron (`app/api/cron/**`) wajib diverifikasi header `Authorization: Bearer ${CRON_SECRET}`, tidak terdaftar sebagai endpoint publik di `API-Specification-v1.1.md`. Trigger Postgres ditambahkan pada tabel transaksi terkait (mis. `listing_leads`) untuk counter sync; direkomendasikan tabel audit `job_execution_log` untuk observability (opsional, non-blocking).
- **AI Development Notes:** Status `// TODO: menunggu resolusi ADR-006` pada implementasi reminder H-1, sitemap regeneration, dan sinkronisasi counter **sudah dapat dihapus** — fitur-fitur ini boleh diimplementasikan penuh menggunakan Vercel Cron Jobs + Postgres Trigger/Database Webhook. AI Coding Assistant dilarang menginstal BullMQ/Redis atau mengasumsikan worker long-running untuk kebutuhan job queue proyek ini — migrasi ke QStash hanya sah setelah kriteria ambang tercapai **dan** disetujui manusia.

### 4.32 Supabase Postgres — Rate Limiting/Application Cache (Fase 1, migrasi terjadwal ke Upstash Redis di Fase 2)
- **Purpose:** Mekanisme penyimpanan status rate limiting bertingkat untuk endpoint sensitif (login, register, forgot-password, submit form publik) sesuai hard rule `PROJECT-CONSTITUTION.md` §20 (ADR-017, Security Strategy) — menutup gap penyimpanan status lintas-instance yang sebelumnya belum eksplisit di lingkungan serverless (Vercel Functions).
- **Why Selected:** Dikunci final via `architecture-decision-records.md` ADR-018 (Approved, 31 Juli 2026) sebagai strategi bertahap — Fase 1 memakai tabel dedicated `rate_limit_log` di Supabase Postgres dengan pola sliding window, tanpa menambah infrastruktur cache/in-memory-store baru. Keputusan ini sebelumnya digantung pada hasil ADR-006 (Job Queue) — karena ADR-006 final tanpa Redis, ADR-018 dievaluasi & diselesaikan secara independen mengikuti pola native-first yang sama dengan ADR-005/006/008.
- **Advantages:** Nol biaya infrastruktur tambahan (termasuk dalam kuota Supabase yang sudah dibayar); nol vendor baru untuk dipantau tim kecil; satu sumber kebenaran data (Postgres), dipantau lewat tooling Supabase yang sudah dipakai; migration SQL adalah pola paling matang untuk AI Coding Assistant/Bolt.new men-generate kode secara konsisten; risiko vendor lock-in terendah di antara seluruh alternatif yang dipertimbangkan.
- **Limitations:** Performa rate-limit check sedikit lebih lambat dibanding Redis murni (low-single-digit ms vs sub-ms) — keputusan MVP yang disengaja mengingat volume endpoint sensitif jauh lebih rendah dari traffic listing/search publik, dimitigasi index komposit `(identifier, action_type, window_start)` dan kriteria ambang migrasi eksplisit ke Fase 2.
- **Alternative Considered:** Upstash Redis (dipertahankan sebagai target migrasi Fase 2 terjadwal, bukan ditolak permanen); Vercel KV; self-hosted/traditional Redis; tanpa cache aplikasi tambahan (in-memory best-effort per-instance).
- **Why Alternative Was Rejected:** Upstash Redis unggul di skalabilitas & Developer Experience namun ditolak untuk Fase 1 karena menambah vendor baru yang belum diperlukan volume traffic MVP. Vercel KV ditolak sebagai default migrasi karena risiko vendor lock-in lebih tinggi (terikat langsung ke ekosistem Vercel) dibanding Upstash mandiri. Self-hosted/traditional Redis ditolak karena koneksi TCP persisten tidak kompatibel dengan model serverless (konsisten alasan penolakan BullMQ di ADR-006). Tanpa cache aplikasi tambahan ditolak karena tidak memenuhi hard rule ADR-017 secara konkret, meninggalkan gap keamanan.
- **Migration Trigger (Fase 2 → Upstash Redis):** Migrasi terjadwal dipicu begitu salah satu kriteria berikut tercapai — (a) volume request ke endpoint sensitif >10.000 request/menit gabungan, (b) query `rate_limit_log` terukur menyumbang >15% total load database utama (via monitoring Supabase), atau (c) kebutuhan cache aplikasi generik (bukan hanya rate limit) muncul dari modul lain (mis. dashboard/laporan admin bervolume besar) yang tidak dapat dipenuhi index Postgres secara wajar. Kriteria ini ditinjau ulang setiap akhir kuartal pasca-launch, konsisten pola review ADR-005/006/008.
- **Integration Notes:** Tabel `rate_limit_log` — kolom minimal `id`, `identifier` (IP/user_id/email), `action_type` (login/register/reset-password/dst.), `attempt_count`, `window_start`, `blocked_until` — perlu masuk migration awal Database Schema Alignment, dengan index komposit `(identifier, action_type, window_start)`. Endpoint sensitif wajib mengembalikan `429 Too Many Requests` + header `Retry-After` sesuai konvensi `API-Specification-v1.1.md` §0. Kebijakan retensi baris (hapus >7 hari) memanfaatkan mekanisme Vercel Cron yang sudah dikunci ADR-006 (§4.31), tanpa infrastruktur job baru. Caching edge/CDN untuk halaman publik **tidak terpengaruh** — tetap inheren dari ADR-021 (Next.js ISR) & ADR-010 (Vercel edge caching). Rate limiting scoped khusus endpoint Maps (§4.29, tabel `api_rate_limits`) tetap berdiri sebagai kebijakan terpisah, kompatibel dengan mekanisme ini.
- **AI Development Notes:** Status `// TODO: menunggu resolusi ADR-018` pada implementasi rate limiting endpoint sensitif (Modul 1 — Authentication) **sudah dapat dihapus** — boleh diimplementasikan penuh menggunakan tabel `rate_limit_log` di Supabase Postgres. AI Coding Assistant dilarang menginstal Redis/Upstash/Vercel KV untuk kebutuhan rate limiting/cache aplikasi proyek ini — migrasi ke Upstash Redis hanya sah setelah kriteria ambang tercapai **dan** disetujui manusia. Struktur tabel final, algoritma sliding window presisi, dan threshold angka per jenis endpoint (mis. jumlah percobaan login sebelum blokir) belum ditentukan di ADR-018 — merupakan keputusan desain teknis rinci untuk Sprint S1, bukan cakupan ADR ini.

### 4.33 Kurasi Provider AI Assistant — Gemini, Groq, Mistral, GitHub Models (BYOK, Modul 13)
- **Purpose:** Menetapkan daftar provider AI assistant resmi yang boleh dihubungkan agen (dan seluruh role internal berakun) lewat model BYOK, sesuai `architecture-decision-records.md` ADR-028 (Approved With Notes, 3 Agustus 2026).
- **Why Selected:** Keempat provider — **Google Gemini, Groq, Mistral, GitHub Models** — dipilih khusus karena menyediakan **free tier berkelanjutan** (bukan kredit percobaan sekali habis seperti OpenAI API/Anthropic API langsung), mengurangi risiko agen mengira layanan gratis selamanya lalu mendapat tagihan mendadak.
- **Advantages:** Nol dependency npm baru — seluruh komunikasi via `fetch` native ke REST API resmi masing-masing provider (konsisten larangan `axios`, Bagian 6 poin 9); daftar dikurasi Admin (tabel referensi `ai_providers`) sehingga agen tidak bisa memasukkan endpoint sembarang (mencegah pencurian key lewat endpoint palsu).
- **Limitations:** Free tier provider pihak ketiga dapat berubah sewaktu-waktu di luar kendali platform (riset mencatat kuota Gemini pernah dipangkas 50–80% Desember 2025) — bukan komitmen kontraktual dari platform ke agen.
- **Alternative Considered:** OpenAI API/Anthropic API langsung sebagai pilihan default.
- **Why Alternative Was Rejected:** Keduanya hanya menyediakan kredit percobaan sekali habis (~$5), bukan free tier berkelanjutan — berpotensi menyesatkan agen. Tidak tertutup kemungkinan ditambahkan nanti sebagai opsi berbayar eksplisit (memerlukan ADR terpisah).
- **Integration Notes:** Bukan baris "Official Technology Stack" baru (Bagian 3) — ini keputusan kurasi vendor pihak ketiga untuk fitur Modul 13, bukan pemilihan teknologi inti proyek. Riwayat chat tidak dipersist (ADR-028) — tidak ada tabel percakapan yang perlu disinkronkan ke ERD.
- **AI Development Notes:** Daftar 4 provider ini **final untuk rilis awal** — AI Coding Assistant dilarang menambah provider lain (termasuk OpenAI/Anthropic langsung) tanpa ADR baru yang men-supersede ADR-028. `usage_terms_note` per provider (tabel `ai_providers`) direkomendasikan ditinjau berkala pasca-launch mengingat volatilitas free tier — catatan kondisional Board yang belum ditutup.

---

## 5. Compatibility Matrix

Tabel berikut merangkum kompatibilitas & pola integrasi antar komponen inti stack. Simbol: ✅ Terintegrasi langsung/resmi · ⚙️ Terintegrasi via adapter/konfigurasi tambahan · ➖ Tidak berinteraksi langsung (independen).

| | Next.js | Supabase | TanStack Query | Zustand | React Hook Form | Zod | Tailwind/shadcn | Vercel | Sentry | Playwright |
|---|---|---|---|---|---|---|---|---|---|---|
| **Next.js** | — | ⚙️ via `@supabase/ssr` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ native | ✅ `@sentry/nextjs` | ✅ |
| **Supabase** | ⚙️ | — | ⚙️ sebagai query fn | ➖ | ➖ | ⚙️ validasi payload | ➖ | ➖ | ⚙️ error capture | ⚙️ test DB |
| **TanStack Query** | ✅ | ⚙️ | — | ➖ (beda domain state) | ➖ | ⚙️ validasi response | ➖ | ➖ | ➖ | ⚙️ mocking |
| **Zustand** | ✅ | ➖ | ➖ | — | ⚙️ state form lintas step | ➖ | ➖ | ➖ | ➖ | ➖ |
| **React Hook Form** | ✅ | ➖ | ➖ | ⚙️ | — | ✅ `@hookform/resolvers` | ✅ styling input | ➖ | ➖ | ✅ diuji E2E |
| **Zod** | ✅ | ⚙️ | ⚙️ | ➖ | ✅ | — | ➖ | ➖ | ➖ | ➖ |
| **Tailwind/shadcn** | ✅ | ➖ | ➖ | ➖ | ✅ | ➖ | — | ✅ build native | ➖ | ✅ diuji visual |
| **Vercel** | ✅ native | ⚙️ env var | ➖ | ➖ | ➖ | ➖ | ✅ | — | ⚙️ integrasi | ⚙️ CI |
| **Sentry** | ✅ | ⚙️ | ➖ | ➖ | ➖ | ➖ | ➖ | ⚙️ | — | ➖ |
| **Playwright** | ✅ | ⚙️ seed test data | ⚙️ | ➖ | ✅ | ➖ | ✅ | ⚙️ CI | ➖ | — |

**Catatan penting kompatibilitas:**
- **Next.js ↔ Supabase**: gunakan `@supabase/ssr` untuk client browser vs server terpisah (`PROJECT-CONSTITUTION.md` Bagian 5 — `/lib/supabase/` browser & server terpisah).
- **React Hook Form ↔ Zod**: via `@hookform/resolvers/zod` — satu skema dipakai sebagai `resolver` form sekaligus validasi server.
- **Next.js ↔ Vercel**: pasangan native — fitur ISR/Edge Middleware/Image Optimization bekerja penuh tanpa konfigurasi tambahan.
- **Playwright ↔ Next.js**: dijalankan terhadap build production (`next build && next start`) di CI, bukan `next dev`, agar hasil pengujian merepresentasikan kondisi production.
- **TanStack Query ↔ Zustand**: keduanya sengaja **tidak tumpang tindih tanggung jawab** — Query untuk server state, Zustand untuk UI state; mencampur keduanya untuk domain yang sama adalah anti-pattern.
- **Tailwind v4 ↔ shadcn/ui**: shadcn/ui versi terbaru mendukung penuh Tailwind v4 (CSS-first `@theme`) & React 19 — pastikan proyek diinisialisasi langsung dengan kombinasi versi terbaru ini agar tidak perlu migrasi v3→v4 di kemudian hari.

---

## 6. Architecture Constraints

Aturan berikut **wajib dipatuhi** — pelanggaran dianggap gagal Definition of Done (`AI-DEVELOPMENT-BLUEPRINT.md` Bagian 30):

1. **Tidak boleh menggunakan Redux** (termasuk Redux Toolkit) — Zustand adalah satu-satunya UI state management resmi.
2. **Tidak boleh menggunakan Material UI (MUI).**
3. **Tidak boleh menggunakan Ant Design.**
4. **Tidak boleh menggunakan Formik** — React Hook Form adalah satu-satunya form library resmi.
5. **Tidak boleh menggunakan SWR** — TanStack Query adalah satu-satunya server-state library resmi.
6. **Tidak boleh menggunakan Moment.js** — date-fns adalah satu-satunya date library resmi.
7. **Tidak boleh menggunakan react-beautiful-dnd** (deprecated) — dnd-kit adalah pengganti resminya.
8. **Tidak boleh menggunakan CSS-in-JS runtime** (styled-components, Emotion, dsb.) — Tailwind CSS + shadcn/ui adalah satu-satunya pendekatan styling resmi.
9. **Tidak boleh menggunakan Axios** sebagai HTTP client tambahan — gunakan `fetch` native (didukung penuh Next.js/TanStack Query) kecuali ada kebutuhan teknis spesifik yang didokumentasikan sebagai Architecture Decision.
10. **Tidak boleh menambahkan backend service Node.js terpisah** (NestJS/Express, dsb.) — Backend resmi dikunci final sebagai Supabase + Next.js Route Handlers (`architecture-decision-records.md` ADR-001, **Approved**, lihat Bagian 3). Perubahan atas keputusan ini hanya sah melalui ADR baru yang secara eksplisit men-supersede ADR-001, bukan keputusan sepihak AI Coding Assistant maupun implementasi ad-hoc.
11. **Tidak boleh menambahkan library chart/table/PDF/date kedua** yang fungsinya sudah dipenuhi Recharts/TanStack Table/pdf-lib/date-fns tanpa Architecture Decision.
12. **Tidak boleh menggunakan library dengan fungsi yang sama** dengan yang sudah resmi di Bagian 3 tanpa Architecture Decision (ADR) tertulis yang disetujui.
13. **Tidak boleh mengekspos secret/service role key** (`*_SECRET`, `*_SERVICE_ROLE_KEY`, `*_SERVER`) ke bundle client-side — audit build output secara berkala (`PROJECT-CONSTITUTION.md` Bagian 17 & 20).
14. **Tidak boleh mengedit skema database langsung** lewat Supabase Studio di environment production — wajib lewat migration file yang direview.
15. **Tidak boleh mencampur Server Component fetch dan TanStack Query** dalam satu halaman sebagai dua sumber kebenaran data yang berbeda untuk data yang sama.
16. **Tidak boleh menambahkan mesin pencari eksternal (Typesense, Elasticsearch/OpenSearch, Algolia, dsb.) sebelum kriteria ambang migrasi Fase 2 tercapai** — Search Engine resmi Fase 1 dikunci final sebagai PostgreSQL Full-Text Search + pg_trgm (`architecture-decision-records.md` ADR-005, **Approved**, lihat Bagian 3/4.30). Migrasi ke Typesense hanya sah dieksekusi saat salah satu kriteria ambang (volume/latensi/keluhan relevansi) tercapai dan bukan keputusan sepihak AI Coding Assistant maupun implementasi ad-hoc.
17. **Tidak boleh menambahkan BullMQ, Redis, atau worker process long-running apa pun untuk job queue sebelum kriteria ambang migrasi Fase 2 tercapai** — Job Queue/Scheduler resmi Fase 1 dikunci final sebagai Vercel Cron Jobs + Postgres Trigger/Database Webhook (`architecture-decision-records.md` ADR-006, **Approved**, lihat Bagian 3/4.31). Worker long-running secara fundamental tidak kompatibel dengan model serverless Vercel yang dikunci ADR-001 — migrasi ke QStash hanya sah dieksekusi saat salah satu kriteria ambang (volume/retry kompleks/frekuensi) tercapai dan bukan keputusan sepihak AI Coding Assistant maupun implementasi ad-hoc.
18. **Tidak boleh mengganti Maps/Geocoding provider (Leaflet+OSM/LocationIQ/Geoapify) dengan provider lain (Google Maps Platform, Mapbox, dsb.) sebelum kriteria ambang migrasi tahap Growth/Scale/Enterprise tercapai** — Maps & Geocoding resmi dikunci final sebagai Leaflet + OpenStreetMap + LocationIQ (Primary) + Geoapify (Approved Alternative) (`architecture-decision-records.md` ADR-008, **Approved v3**, lihat Bagian 3/4.29). Seluruh integrasi wajib melalui lapisan abstraksi `MapsProvider` — migrasi provider hanya sah dieksekusi saat kriteria ambang roadmap tercapai dan disetujui manusia, bukan keputusan sepihak AI Coding Assistant.
19. **Tidak boleh menambahkan Redis, Upstash, Vercel KV, atau cache/in-memory-store eksternal apa pun untuk rate limiting/cache aplikasi sebelum kriteria ambang migrasi Fase 2 tercapai** — Rate Limiting/Application Cache resmi Fase 1 dikunci final sebagai Supabase Postgres (tabel `rate_limit_log`, sliding window) (`architecture-decision-records.md` ADR-018, **Approved**, lihat Bagian 3/4.32). Migrasi ke Upstash Redis hanya sah dieksekusi saat salah satu kriteria ambang (volume/load database/kebutuhan cache generik) tercapai dan bukan keputusan sepihak AI Coding Assistant maupun implementasi ad-hoc.

---

## 7. AI Coding Rules

Aturan berikut **wajib dipatuhi** oleh AI Coding Assistant apa pun (Claude, Bolt.new, ChatGPT, Cursor, GitHub Copilot, dsb.) yang bekerja pada implementasi proyek ini:

1. **Jangan menambahkan dependency baru** di luar Bagian 3 (Official Technology Stack) tanpa alasan tertulis dan justifikasi berbasis 10 prinsip di Bagian 2.
2. **Selalu gunakan library resmi proyek** — cek Bagian 3 & `dependency-manifest.md` sebelum menulis kode yang membutuhkan kapabilitas baru (fetch data, form, chart, dsb.).
3. **Selalu gunakan reusable component** yang sudah ada di `components/ui/` (shadcn/ui) sebelum membuat komponen custom baru yang fungsinya serupa.
4. **Jangan membuat implementasi duplikat** — logic bisnis, skema validasi (Zod), dan tipe data masing-masing punya satu lokasi sumber kebenaran (`lib/`, `packages/shared-types`).
5. **Ikuti seluruh keputusan dokumen ini**, `PROJECT-CONSTITUTION.md`, dan `architecture-decision-records.md` — untuk keputusan arsitektur/teknis, ADR berstatus **Approved** menjadi rujukan tertinggi; untuk hal lain di luar cakupan ADR, jika dokumen ini tampak berbeda dari `PROJECT-CONSTITUTION.md`, **`PROJECT-CONSTITUTION.md` yang menang**; laporkan sebagai `// TODO: konflik technology-decisions vs constitution/ADR`.
6. **Jangan mengambil keputusan arsitektur baru secara sepihak** untuk item yang tercantum di Bagian 9 (Open Questions) — implementasikan sebagai *configurable placeholder*, tandai `// TODO: menunggu keputusan bisnis/arsitektur`, dan laporkan ke manusia jika keputusan tersebut memblokir progres.
7. **Jika instruksi user bertentangan dengan Architecture Constraints (Bagian 6)**, tanyakan konfirmasi eksplisit sebelum menyimpang — jangan diam-diam menambah library terlarang.
8. **Selalu jaga TypeScript `strict: true` tanpa `any` implisit** di seluruh kode baru.
9. **Selalu validasi ulang di server** untuk endpoint mutating (`POST`/`PUT`/`PATCH`) meskipun sudah divalidasi Zod di client — backend tidak boleh mempercayai input client.
10. **Sebelum menambah package baru**, cek dulu apakah kapabilitas yang dibutuhkan sudah tersedia dari salah satu library resmi di Bagian 3 (banyak kebutuhan "baru" sebenarnya sudah tercakup, mis. jangan menambah library HTTP client baru jika `fetch` + TanStack Query sudah cukup).

---

## 8. Future Evaluation

Teknologi berikut **belum** menjadi bagian Official Technology Stack (Bagian 3), namun dicatat sebagai kandidat evaluasi untuk versi/fase pengembangan selanjutnya, konsisten dengan `SYSTEM-ARCHITECTURE.md` Bagian 20 (Future Architecture) dan Bagian 4 (masih terbuka di dokumen sumber):

| Kategori | Kandidat (dari dokumen sumber) | Kapan Relevan |
|---|---|---|
| **Upstash Redis** | Rate limiting/cache aplikasi Fase 2 — target migrasi Fase 2 terjadwal (bukan Open Question lagi) | Migrasi dieksekusi saat salah satu kriteria ambang ADR-018 tercapai: volume request endpoint sensitif >10.000/menit gabungan, query `rate_limit_log` >15% load database utama, atau kebutuhan cache aplikasi generik muncul dari modul lain. Keputusan strategi Fase 1→2 sudah **Approved** (`architecture-decision-records.md` ADR-018, lihat Bagian 3/4.32) — yang menunggu hanya pemicu ambang, bukan pilihan mekanismenya. |
| **Job Queue (Fase 2)** | QStash — Upstash — target migrasi Fase 2 terjadwal (bukan Open Question lagi) | Migrasi dieksekusi saat salah satu kriteria ambang ADR-006 tercapai: volume job harian melampaui kapasitas batching per invocation, kebutuhan retry/backoff/dead-letter kompleks, atau frekuensi melampaui batas cron interval tier Vercel. Keputusan strategi Fase 1→2 sudah **Approved** (`architecture-decision-records.md` ADR-006, lihat Bagian 3/4.31) — yang menunggu hanya pemicu ambang, bukan pilihan mekanismenya. |
| **Search Engine** | Typesense — target migrasi Fase 2 terjadwal (bukan Open Question lagi) | Migrasi dieksekusi saat salah satu kriteria ambang ADR-005 tercapai: volume listing aktif >±50.000, latensi p95 `/properties/search` >500ms, atau keluhan relevansi berulang (≥3 laporan/sprint). Keputusan strategi Fase 1→2 sudah **Approved** (`architecture-decision-records.md` ADR-005, lihat Bagian 3/4.30) — yang menunggu hanya pemicu ambang, bukan pilihan mesinnya. |
| **Payment Gateway** | Midtrans/Xendit | Fase membership premium agen (boost listing, kuota lebih besar) — tidak masuk cakupan wajib MVP (`API-Specification` §9.3). |
| **AI Service** | Rekomendasi listing personalisasi, auto-deskripsi listing, penilaian kualitas foto, chatbot FAQ | Fase lanjutan sesuai `SYSTEM-ARCHITECTURE.md` Bagian 20 — wajib tetap menghormati SSR untuk konten AI-generated agar tidak mengorbankan SEO. |
| **Analytics** | Dashboard analitik custom, funnel lead-to-closing lanjutan | Dibangun di atas data `listing_leads`/`listing_views` yang sudah terstruktur sejak Fase 1 (fondasi GTM/GA4 sudah ada). |
| **Background Job** | Integrasi SLIK/BI Checking (validasi cicilan otomatis DBR), WA Business API | Fase 4 sesuai roadmap PRD Bagian 6. |
| **CDN (gambar khusus)** | Cloudinary/ImageKit sebagai lapisan transformasi tambahan di atas Supabase Storage | Jika kebutuhan transformasi gambar (resize dinamis multi-varian, video streaming) melampaui kapasitas Supabase Storage + kompresi client-side. |

---

## 9. Open Questions

Sesuai instruksi pembuatan dokumen ini — **tidak ada asumsi yang dibuat** untuk poin-poin berikut; seluruhnya wajib dikonfirmasi tim sebelum atau selama development, dan diimplementasikan sebagai *configurable placeholder* dengan penanda `// TODO` di kode. Status setiap poin di bawah ini disinkronkan terhadap `architecture-decision-records.md` sebagai sumber kebenaran — poin yang ADR-nya sudah **Approved** tidak lagi dicantumkan di sini (lihat Bagian 3 & 6 untuk keputusan finalnya).

> **Item yang telah diselesaikan dan dihapus dari daftar ini:** *Arsitektur backend/API* — **RESOLVED** via `architecture-decision-records.md` ADR-001 (Approved, 27 Juli 2026): Next.js Route Handlers + Supabase, tanpa service Node.js terpisah. Lihat Bagian 3 (catatan di bawah tabel stack) dan Bagian 6 poin 10. *Search Engine* — **RESOLVED** via `architecture-decision-records.md` ADR-005 (Approved, 28 Juli 2026): PostgreSQL Full-Text Search + pg_trgm untuk Fase 1, migrasi terjadwal ke Typesense di Fase 2 berdasarkan kriteria ambang eksplisit. Lihat Bagian 3 (catatan di bawah tabel stack) dan Bagian 4.30. *Job Queue/Scheduler* — **RESOLVED** via `architecture-decision-records.md` ADR-006 (Approved, 29 Juli 2026): Vercel Cron Jobs + Postgres Trigger/Database Webhook untuk Fase 1, migrasi terjadwal ke QStash di Fase 2 berdasarkan kriteria ambang eksplisit. Lihat Bagian 3 (catatan di bawah tabel stack) dan Bagian 4.31. *Maps & Geocoding Provider* — **RESOLVED** via `architecture-decision-records.md` ADR-008 (Approved, 30 Juli 2026, direvisi v3): Leaflet + OpenStreetMap (rendering) dengan LocationIQ sebagai Primary Geocoding Provider dan Geoapify sebagai Approved Alternative Provider, migrasi bertahap terjadwal MVP → Growth → Scale → Enterprise. Lihat Bagian 3 (catatan di bawah tabel stack) dan Bagian 4.29. *Wrapper library React untuk Maps* — **RESOLVED** bersamaan ADR-008: `react-leaflet` dikunci final, `@vis.gl/react-google-maps`/`@react-google-maps/api` tidak lagi relevan untuk Fase 1. *Cache/Rate limiting level aplikasi* — **RESOLVED** via `architecture-decision-records.md` ADR-018 (Approved, 31 Juli 2026): Supabase Postgres (tabel `rate_limit_log`, sliding window) untuk Fase 1, migrasi terjadwal ke Upstash Redis di Fase 2 berdasarkan kriteria ambang eksplisit. Lihat Bagian 3 (catatan di bawah tabel stack) dan Bagian 4.32. Dengan resolusi ini, **tidak ada lagi Open Question arsitektur/teknis tersisa di dokumen ini** — dua poin di bawah adalah gap governance/bisnis, bukan keputusan teknologi yang terbuka.

1. **Threshold DBR final, model monetisasi, kebijakan eksklusivitas developer per wilayah, kepemilikan akun GTM/GSC/GA4** — seluruhnya tetap berstatus terbuka sesuai `PROJECT-CONSTITUTION.md` (bukan konflik teknologi maupun cakupan ADR arsitektur/teknis — ini keputusan bisnis murni yang memang belum diambil); tidak memengaruhi Official Technology Stack di dokumen ini, namun tetap wajib diimplementasikan sebagai *configurable* (`system_configs`/`dbr_config`).
2. **Owner/penanggung jawab individu dokumen ini** (Bagian 1) belum ditentukan sebagai nama spesifik — saat ini hanya diisi peran (Principal Software Architect/Technical Lead), konsisten dengan gap yang sama di `architecture-decision-records.md` Bagian 1.

> **Catatan (Vercel sebagai hosting resmi):** Keputusan teknologinya sendiri **sudah Approved** — `architecture-decision-records.md` ADR-010 (Deployment Strategy, Approved 27 Juli 2026): Vercel + GitHub + GitHub Actions. Item ini karenanya **dihapus dari daftar Open Questions** (bukan lagi keputusan teknologi yang terbuka). Satu-satunya sisa pekerjaan adalah administratif — ADR-010 sendiri mencatat sebagai *Notes*: belum dibackfill formal ke `PROJECT-CONSTITUTION.md` Bagian 4 — ini tugas sinkronisasi dokumen governance, bukan Open Question teknologi di dokumen ini.

---

*Dokumen ini disusun sebagai referensi teknologi resmi turunan dari `PROJECT-CONSTITUTION.md` v1.1, `architecture-decision-records.md`, dan seluruh dokumen sumber proyek (26–31 Juli 2026). Versi 1.1 (27 Juli 2026) mengintegrasikan resolusi ADR-001 (Backend Architecture, Approved) dan mengoreksi status Maps Provider/Vercel agar konsisten dengan `architecture-decision-records.md` sebagai sumber kebenaran. Versi 1.2 (28 Juli 2026) mengintegrasikan resolusi ADR-005 (Search Strategy, Approved): PostgreSQL Full-Text Search + pg_trgm dikunci sebagai Search Engine Fase 1, dengan migrasi terjadwal ke Typesense di Fase 2 berdasarkan kriteria ambang eksplisit — lihat Bagian 3 & 4.30. Versi 1.3 (29 Juli 2026) mengintegrasikan resolusi ADR-006 (Job Queue Strategy, Approved): Vercel Cron Jobs + Postgres Trigger/Database Webhook dikunci sebagai Job Queue/Scheduler Fase 1, dengan migrasi terjadwal ke QStash di Fase 2 berdasarkan kriteria ambang eksplisit — BullMQ+Redis ditolak karena tidak kompatibel dengan model serverless ADR-001 — lihat Bagian 3 & 4.31. Versi 1.4 (30 Juli 2026) mengintegrasikan resolusi ADR-008 (Maps Provider, Approved, direvisi v3): Leaflet + OpenStreetMap + LocationIQ (Primary) + Geoapify (Approved Alternative) dikunci sebagai Maps & Geocoding final, dengan caching berbasis Postgres (`geocode_cache`), rate limiting scoped, offline/manual address fallback 3 lapis, dan roadmap migrasi bertahap MVP → Growth → Scale → Enterprise — lihat Bagian 3 & 4.29. Google Maps Platform tidak lagi menjadi baris tentatif; opsi ini dipertahankan sebagai jalur migrasi tahap Enterprise, bukan ditolak permanen. Versi 1.5 (31 Juli 2026) mengintegrasikan resolusi ADR-018 (Caching Strategy, Approved): Rate Limiting/Application Cache dikunci sebagai Supabase Postgres (tabel `rate_limit_log`, sliding window) untuk Fase 1, dengan migrasi terjadwal ke Upstash Redis di Fase 2 berdasarkan kriteria ambang eksplisit (volume request/load database/kebutuhan cache generik) — lihat Bagian 3 & 4.32; Architecture Constraint baru ditambahkan (Bagian 6 poin 19); Open Question terkait dihapus dari Bagian 9. **Versi 1.6 (3 Agustus 2026)** mengintegrasikan resolusi ADR-028 (Third-Party AI Assistant Integration Strategy/BYOK, Approved With Notes): kurasi 4 provider free-tier berkelanjutan (Google Gemini, Groq, Mistral, GitHub Models) dikunci sebagai §4.33 — bukan baris "Official Technology Stack" baru, murni keputusan kurasi vendor untuk Modul 13. ADR-026/027 (Organization Management System) disahkan pada sesi Architecture Review Board yang sama (3 Agustus 2026) namun **tidak menambah entri ke dokumen ini** — Organization murni entitas data + lapisan otorisasi di atas stack yang sudah dikunci, tidak memerlukan keputusan teknologi baru. **Tidak ada lagi Open Decision arsitektur/teknis tersisa di dokumen ini** — seluruh ADR yang pernah/kini memengaruhi dokumen ini (ADR-001, ADR-005, ADR-006, ADR-008, ADR-018, ADR-028) berstatus Approved/Approved With Notes, konsisten dengan `architecture-decision-records.md` yang mencatat 28 dari 28 ADR Approved secara keseluruhan. Berpasangan dengan `dependency-manifest.md`. Wajib direview ulang setiap kali status ADR di `architecture-decision-records.md` berubah, atau setiap kali ada keputusan pada Bagian 9 (Open Questions) yang diselesaikan — perubahan wajib disinkronkan balik ke `PROJECT-CONSTITUTION.md` & `SYSTEM-ARCHITECTURE.md`.*
