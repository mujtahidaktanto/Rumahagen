# CURRENT PROJECT STATE
## Platform Web RUMAHAGEN

> **CATATAN PENGGUNAAN — WAJIB DIBACA AI CODING ASSISTANT DI SETIAP SESI**
> Dokumen ini adalah **satu-satunya sumber kebenaran tentang apa yang SUDAH ADA secara fisik** di proyek ini (kode, tabel, endpoint, komponen) — bukan apa yang direncanakan/didesain di dokumen governance. Jika sebuah item tercatat **"Belum dibuat"**, AI **dilarang** berasumsi item tersebut sudah ada, sudah sebagian jadi, atau bisa "diisi mengarang" — perlakukan sebagai benar-benar kosong. **(v0.1 rev. 6 Agustus)** Bedakan tegas antara **"source code ditulis"** (mis. file migration `.sql` sudah ada di repo) dan **"dieksekusi/live"** (mis. tabel benar-benar berdiri di database Supabase nyata) — keduanya dicatat terpisah di dokumen ini, jangan disamakan. Dokumen ini wajib **diperbarui di akhir setiap sesi development** yang mengubah kode nyata (bukan hanya dokumen).

---

# Project Information

| Field | Value |
|---|---|
| **Nama Project** | Platform Web RUMAHAGEN (nama brand final: **RUMAHAGEN**) |
| **Versi** | 0.1 (Pra-Development — belum ada aplikasi/endpoint yang berjalan; **migration SQL sudah ditulis lengkap tapi belum dieksekusi ke database live**, lihat *Existing Database*) |
| **Tanggal Update** | **6 Agustus 2026** (naik dari 4 Agustus — sinkronisasi ke paket dokumen 5-6 Agustus: PRD v1.2, ERD v1.3, Entity Mapping v1.0, Authorization/Functional/UI/Technical Specification v1.0, migration SQL 15 file + konsolidasi, Database Dictionary v1.0, Module Dependency Matrix v1.0, Module Implementation Strategy v1.1) |
| **Status** | 🟢 **Perencanaan & Dokumentasi Selesai — Migration Schema Sudah Ditulis Lengkap — Implementasi Aplikasi (kode Route Handler/UI) Belum Dimulai.** Seluruh 28 ADR arsitektur/teknis tetap Approved/Approved With Notes sejak 3 Agustus (tidak ada ADR baru pada siklus ini). **Perubahan sejak 4 Agustus:** (1) paket sinkronisasi dokumen bisnis/data untuk Modul 12/13 yang sebelumnya berstatus "belum dieksekusi" — **kini sudah dieksekusi** (5 Agustus): PRD naik ke v1.2, ERD naik ke v1.3 (mencantumkan struktur M12/M13 penuh), API Spec naik ke v1.2, User Flow naik ke v1.2, ditambah `Entity-Mapping-v1.0.md`, `Authorization-Access-Control-Specification-v1.0.md`, `Functional/UI/Technical-Specification-v1.0.md` — 8 dokumen dipromosikan ke status Baseline; (2) migration SQL untuk **seluruh 15 modul termasuk M12/M13** sudah ditulis lengkap (`0001`–`0015` + `Database-Migration-Full-v1.0.sql`, `Database-Dictionary-Migration-Ready-v1.0.md`) — **namun berstatus Draft, menunggu pengesahan Owner & eksekusi Sprint S0**, belum dijalankan ke instance Supabase manapun; (3) `Module-Dependency-Matrix-...v1.0.md` dan `Module-Implementation-Strategy-...v1.1.md` diterbitkan sebagai rujukan urutan modul resmi, menggantikan tabel Development Order lama di `development-playbook.md` §23 untuk keperluan urutan implementasi (lihat *Known Technical Debt* poin 9). **⚠️ Status gate kode Modul 12/13 memerlukan konfirmasi ulang Owner** — lihat catatan di bawah. |
| **Development Phase** | **Pre-Phase 0, mendekati siap eksekusi.** Seluruh dokumen governance (Constitution, PRD v1.2, ERD v1.3, API Spec v1.2, User Flow v1.2, SEO Spec v1.1, Entity Mapping v1.0, Authorization/Functional/UI/Technical Spec v1.0, System Architecture, Technology Decisions, Dependency Manifest, AI Development Blueprint, AI Context Pack v1.1, Development Roadmap, Task Template v1.1, Architecture Decision Records, Module Dependency Matrix v1.0, Module Implementation Strategy v1.1) sudah final untuk cakupan **13 modul** (naik dari "11 modul asli" — M12/M13 kini tercakup dokumen desain penuh). **Migration SQL sudah ditulis untuk seluruh 15 file** namun **Sprint S0 (eksekusi fisik: inisialisasi monorepo, project Supabase, run migration) belum dijalankan** — belum ada database live, belum ada satu baris kode aplikasi (Route Handler/komponen/service). |
| **Milestone Berikutnya** | **Sprint S0 — Foundation Infrastructure (eksekusi, bukan lagi penulisan skema).** Berbeda dari siklus sebelumnya: pekerjaan "menulis" migration SQL sudah selesai lebih dulu (lihat *Existing Database*) — Sprint S0 sekarang murni pekerjaan **eksekusi**: inisialisasi monorepo, buat project Supabase nyata, jalankan `0001`–`0015` secara berurutan, verifikasi. **Tidak ada dependency terhadap Open Decision apa pun** (28 ADR Approved). **Catatan gate M12/13 tidak menghalangi Sprint S0** — migration `0007`/`0015` boleh dijalankan bersama migration lain karena sudah Baseline secara skema; yang masih tertahan adalah **kode aplikasi** (Route Handler/UI) untuk kedua modul tsb, bukan skema database-nya (lihat *Known Technical Debt* poin 9 untuk nuansa ini). |

---

# ADR & Governance Snapshot

> Merangkum status **Architecture Decision Records** (`architecture-decision-records.md`, kini v1.1) per 3 Agustus 2026 — **tidak ada ADR baru yang disahkan pada siklus 4-6 Agustus**, seluruh pembaruan periode ini bersifat **eksekusi/dokumentasi turunan** (migration SQL, konsolidasi ADR, penerbitan MDM/MIS), bukan keputusan arsitektur baru. Rincian penuh setiap ADR tetap berada di dokumen sumber; bagian ini hanya mencatat status.

## Ringkasan (tidak berubah dari snapshot 4 Agustus — lihat detail lengkap 28 ADR di bawah)

Seluruh **28 ADR** di `architecture-decision-records.md` tetap **Approved/Approved With Notes** — **tidak ada ADR OPEN**. ADR-001 (Backend Architecture), ADR-005 (Search), ADR-006 (Job Queue), ADR-008 (Maps), ADR-018 (Caching) — Approved 27-31 Juli 2026. ADR-026/027 (Organization), ADR-028 (AI Assistant) — Approved/Approved With Notes 3 Agustus 2026. Tabel lengkap 28 ADR: lihat versi dokumen ini tanggal 4 Agustus (tidak diulang di sini karena tidak ada perubahan status).

## Perkembangan Baru Sejak 4 Agustus (bukan ADR baru — eksekusi dari ADR yang sudah Approved)

**(6 Agustus) Konsolidasi `architecture-decision-records.md` ke v1.1** — status internal Draft→Baseline disinkronkan penuh; regresi kecil pada ADR-005/ADR-006 diperbaiki di entri sumber (bukan sekadar narasi ringkasan). Tidak mengubah satu pun keputusan ADR yang sudah Approved.

**(5 Agustus) Paket sinkronisasi dokumen bisnis/data Modul 12/13 — DIEKSEKUSI PENUH.** Sebelumnya (snapshot 4 Agustus) dokumen ini mencatat paket ini sebagai **blocker** kode M12/M13. Kini:
- `PRD-RUMAHAGEN.md` naik v1.1 → **v1.2** (retrofit REQ-M0X-NNN + Modul 12/13 REQ penuh, 114 REQ-XXX terdaftar).
- `ERD-Skema-Database-RUMAHAGEN.md` naik ke **v1.3** — kini **mencantumkan** struktur `organizations`/`organization_members`/`organization_invitations`/`ai_providers`/`agent_ai_connections` secara formal (sebelumnya, di snapshot 4 Agustus, ERD baru naik ke "v1.2" hanya untuk soft-delete, struktur M12/13 belum tercantum — **kini sudah**).
- `API-Specification-...md` naik v1.1 → **v1.2** (endpoint group `/organizations/*`, `/ai-assistant/*` resmi terdaftar §5A/§5B).
- `User-Flow-...md` naik v1.1 → **v1.2**.
- **Baru dibuat**: `Entity-Mapping-RUMAHAGEN-v1.0.md` (44 entity terdaftar, termasuk `ENT-M12-*`/`ENT-M13-*`), `Authorization-Access-Control-Specification-v1.0.md`, `Functional-Specification-v1.0.md`, `UI-Specification-v1.0.md`, `Technical-Specification-v1.0.md`.
- **8 dokumen di atas dipromosikan ke status Baseline** pada 5 Agustus (`document-governance-baseline-register-v1.4.md` Governance Notes poin 18).

**(5 Agustus) Migration SQL — DITULIS LENGKAP untuk seluruh 15 modul, termasuk M12/M13.** `0001_extensions_helpers.sql` s.d. `0015_m13_ai_assistant.sql` (2.264 baris total) + `Database-Migration-Full-v1.0.sql` (versi konsolidasi, 1.132 baris) + `Database-Dictionary-Migration-Ready-v1.0.md` (penerjemahan ERD v1.3 → DDL PostgreSQL presisi). **Status: Draft, menunggu pengesahan Owner & eksekusi Sprint S0** — belum dijalankan ke instance Supabase manapun (lihat *Existing Database*).

**⚠️ Yang BELUM terjadi (perlu klarifikasi Owner, bukan diasumsikan):** Meskipun paket sinkronisasi dokumen (poin di atas) sudah dieksekusi penuh, **tidak ada catatan eksplisit di dokumen governance manapun yang menyatakan "gate implementasi kode M12/M13 kini resmi terbuka."** Kelengkapan dokumen adalah **prasyarat** gate (`PROJECT-CONSTITUTION.md` §24 poin 10), bukan **pemicu otomatis**. AI Coding Assistant **wajib memperlakukan gate kode M12/M13 sebagai TERTUTUP sampai Owner menyatakan eksplisit sebaliknya** di dokumen ini — meskipun migration SQL `0007`/`0015` sudah tertulis dan skema sudah Baseline. Menulis migration ≠ menulis kode aplikasi (Route Handler/service/UI) untuk modul tsb.

---

## Keputusan yang Telah Selesai (Approved)

Tidak berubah dari 3 Agustus — seluruh **28 ADR** tetap Approved/Approved With Notes. Lihat `architecture-decision-records.md` v1.1 untuk daftar lengkap (tidak diduplikasi di sini untuk menghindari drift dua sumber — dokumen ADR adalah rujukan otoritatif satu-satunya untuk daftar ini).

## Open Decision yang Tersisa

**Tidak ada ADR yang berstatus OPEN.** Dua item bisnis murni tetap terbuka secara sengaja (bukan gap): model monetisasi, threshold DBR final — keduanya wajib tetap *configurable*, bukan blocker Sprint manapun.

---

# Overall Progress

> Kolom **Progress** mengukur *implementasi/eksekusi nyata*, bukan kelengkapan desain/dokumentasi. **(v0.1 rev. 6 Agustus)** Baris "Database Migration Scripts" dipisah eksplisit dari "Phase 0 — Foundation Infrastructure" karena keduanya kini berstatus berbeda: skrip **sudah ditulis** (source code ada), tapi **belum dieksekusi** (belum ada efek di database live) — sebelumnya kedua hal ini tercampur di satu baris "Not Started 0%" yang menyesatkan.

| Module | Status | Progress |
|---|---|---|
| Governance & Documentation (24+ dokumen: Constitution, PRD v1.2, ERD v1.3, API Spec v1.2, User Flow v1.2, SEO Spec v1.1, Entity Mapping v1.0, Authorization/Functional/UI/Technical Spec v1.0, System Architecture, Technology Decisions, Dependency Manifest, AI Dev Blueprint, AI Context Pack v1.1, Development Roadmap, Task Template v1.1, ADR v1.1, Module Dependency Matrix v1.0, Module Implementation Strategy v1.1, dsb.) | Completed | 100% |
| **(Baru) Database Migration Scripts** (15 file `.sql` + konsolidasi + Database Dictionary — mencakup seluruh 13 modul termasuk M12/M13) | **Written — Not Executed** (source code ada, database live belum ada) | 100% ditulis / **0% dieksekusi** |
| Phase 0 — Foundation Infrastructure (monorepo, CI/CD, inisialisasi project Supabase, eksekusi migration di atas) | Not Started | 0% |
| Modul 1 — Authentication | Not Started | 0% |
| Modul 2 (dasar) — Agent Profile Core | Not Started | 0% |
| Modul 9 + 10 (dasar) — Admin Panel & RBAC Enforcement | Not Started | 0% |
| Modul 3 — Listing Management | Not Started | 0% |
| Modul 11 — SEO Foundation Hardening | Not Started | 0% |
| Modul 2 (ext.) — Buyer Account & Agent Reviews | Not Started | 0% |
| Modul 8 — Dashboard & Notifikasi | Not Started | 0% |
| Modul 6 — Developer Directory | Not Started | 0% |
| Modul 7 — DBR Scoring Calculator | Not Started | 0% |
| Modul 4 — Learning Center | Not Started | 0% |
| Modul 5 — Kalender Event | Not Started | 0% |
| Phase 4 — Production Readiness & Launch | Not Started | 0% |
| **Modul 12 — Organization Management** | Skema: Baseline & migration ditulis. **Kode aplikasi: Not Started — gate governance belum dikonfirmasi terbuka** | 0% (kode) |
| **Modul 13 — AI Assistant Integration** | Skema: Baseline & migration ditulis. **Kode aplikasi: Not Started — gate governance belum dikonfirmasi terbuka** | 0% (kode) |

**Ringkasan:** 2 dari 17 baris selesai/tertulis penuh (dokumentasi 100%, migration SQL 100% ditulis). **Implementasi aplikasi (kode yang berjalan): tetap 0% secara keseluruhan** — tidak ada Route Handler, komponen, service, atau database live. Perbedaan dari snapshot 4 Agustus: migration SQL yang sebelumnya sepenuhnya "Belum dibuat" kini berstatus "Ditulis, belum dieksekusi" — sebuah kemajuan nyata pada lapisan source code, meski belum berefek pada sistem yang berjalan.

---

# Existing Database

**Migration SQL: SUDAH DITULIS LENGKAP (source code ada di repository).** **Database live: BELUM ADA** — belum ada project Supabase/PostgreSQL fisik yang diinisialisasi, belum ada satu migration pun yang **dijalankan**, sehingga belum ada satu tabel pun yang benar-benar berdiri di database manapun.

**(Baru, 6 Agustus) Rincian migration SQL yang sudah ditulis** (15 file bernomor urut + 1 file konsolidasi, seluruhnya di root repository dokumen sumber):

| File | Modul | Baris |
|---|---|---|
| `0001_extensions_helpers.sql` | Extensions & helper functions | 59 |
| `0002_m10_rbac_foundation.sql` | M10 — RBAC (`roles`/`permissions`/`role_permissions`) | 83 |
| `0003_m01_auth.sql` | M01 — Authentication (`users`, `agent_verification_documents`) | 86 |
| `0004_region_reference.sql` | Referensi Wilayah (`ref_provinces/cities/districts/villages`) | 59 |
| `0005_m02_agent_profile.sql` | M02 — Profil Agen | 70 |
| `0006_m06_developer.sql` | M06 — Direktori Developer | 86 |
| `0007_m12_organization.sql` | **M12 — Organization** (dibangun sebelum M03 karena `listings.organization_id` mereferensikannya) | 98 |
| `0008_m03_listing.sql` | M03 — Listing (tabel terbesar) | 198 |
| `0009_m04_learning_center.sql` | M04 — Learning Center | 127 |
| `0010_m05_events.sql` | M05 — Kalender Event | 53 |
| `0011_m07_dbr.sql` | M07 — DBR Scoring | 49 |
| `0012_m08_notifications.sql` | M08 — Notifikasi | 22 |
| `0013_m09_admin.sql` | M09 — Admin/Sistem | 43 |
| `0014_m11_seo.sql` | M11 — SEO (`url_redirects`) | 47 |
| `0015_m13_ai_assistant.sql` | **M13 — AI Assistant** | 52 |
| `Database-Migration-Full-v1.0.sql` | Konsolidasi seluruh migration di atas dalam satu file | 1.132 |

**Status resmi (dari `Database-Dictionary-Migration-Ready-v1.0.md`):** **Draft — menunggu pengesahan Owner & eksekusi Sprint S0.** Migration ini adalah penerjemahan 1:1 dari ERD v1.3 ke DDL PostgreSQL presisi (tipe data, constraint, index, RLS-ready) — **tidak ada** entity/kolom/keputusan bisnis baru yang diperkenalkan di sini di luar yang sudah ada di ERD v1.3/Entity Mapping v1.0.

**⚠️ Implikasi penting untuk urutan Sprint S0:** Karena `0007_m12_organization.sql` sengaja ditempatkan **sebelum** `0008_m03_listing.sql` (listing mereferensikan `organization_id`), **eksekusi migration mengasumsikan skema M12 valid lebih dulu dari M03** — ini murni kebutuhan **integritas skema database** (FK constraint), **bukan** berarti gate kode aplikasi M12 sudah terbuka lebih dulu dari M03. Jangan disalahartikan sebagai perubahan urutan implementasi aplikasi di `Module-Dependency-Matrix-...v1.0.md` (yang tetap menempatkan M03 jauh sebelum M12 dari sisi kode aplikasi).

**Prinsip desain data yang wajib diingat AI (tidak berubah):**
- PK selalu UUID, bukan auto-increment.
- Soft delete (`deleted_at`) untuk **8 tabel**: `listings`, `users`, `developer_projects`, `agent_profiles`, `agent_reviews`, `courses`, `events`, `developer_partners` — **plus `organizations` juga sudah memakai pola ini di `0007_m12_organization.sql`** (dikonfirmasi di source migration, konsisten prinsip `ADR-046` diterapkan ke tabel baru).
- `agent_id`/`user_id` adalah **ownership boundary** hard-coded.
- Field lokasi selalu cascading, bukan freetext.
- `listings.search_vector` (generated column) + index GIN + `pg_trgm` — sudah tertulis di `0008_m03_listing.sql`, belum dieksekusi.
- `rate_limit_log`, `geocode_cache`, `api_rate_limits` — tabel infrastruktur, sudah tertulis di migration terkait, belum dieksekusi.

---

# Existing API

**Belum dibuat.** Belum ada Route Handler/service backend yang di-deploy atau dapat dipanggil. Tidak ada endpoint yang benar-benar hidup — **ini tidak berubah** oleh selesainya migration SQL (migration hanya skema database, bukan API layer).

> Kontrak **target** endpoint sudah didefinisikan lengkap di `API-Specification-RUMAHAGEN-v1.2.md` (kini termasuk §5A Organization API, §5B AI Assistant API). Pola implementasinya terkunci sebagai Route Handlers (`app/api/v1/**/route.ts`) menyusul ADR-001 — tidak ada opsi bercabang. Mekanisme search (ADR-005), job queue (ADR-006), Maps (ADR-008), dan rate limiting (ADR-018) seluruhnya terkunci, tidak berubah dari snapshot sebelumnya.

---

# Existing Components / Layouts / Hooks / Services / Utilities / Middleware / Authentication / Authorization / Folder Structure / Active Dependencies

**Seluruhnya tetap "Belum dibuat"** — tidak ada perubahan dari snapshot 4 Agustus pada lapisan-lapisan ini. Migration SQL dan sinkronisasi dokumen 5 Agustus **tidak** menyentuh area ini. Rujuk desain target di `SYSTEM-ARCHITECTURE.md` Bagian 6, 8, 10-13 dan `development-playbook.md` Bagian 7-13 — seluruhnya masih murni desain, belum ada implementasi.

---

# Pending Modules

Urutan implementasi **kini merujuk `Module-Implementation-Strategy-RUMAHAGEN-v1.1.md` Bagian 3** sebagai rujukan resmi (menggantikan tabel `DEVELOPMENT-ROADMAP.md`/`development-playbook.md` §23 yang sebagian sudah tidak sinkron — lihat *Known Technical Debt* poin 9):

1. Phase 0 — Foundation Infrastructure (**eksekusi** migration `0001`–`0015` yang sudah ditulis, monorepo, CI/CD)
2. Modul 10 — RBAC (Foundation)
3. Modul 1 — Authentication (Foundation)
4. Modul 9 — Admin Panel (kerangka dasar)
5. Modul 2 — Profil Agen
6. Modul 6 — Developer Directory
7. Modul 4 — Learning Center
8. *(kondisional, lihat gate)* Modul 13 — AI Assistant
9. Modul 3 — Listing Management
10. Modul 5 — Kalender Event
11. Modul 7 — DBR Scoring Calculator
12. Modul 11 — SEO Foundation Hardening
13. *(kondisional, lihat gate)* Modul 12 — Organization Management
14. Modul 8 — Dashboard & Notifikasi
15. Phase 4 — Production Readiness & Launch

---

# Known Technical Debt

**Belum ada technical debt kode** — wajar, belum ada kode aplikasi yang ditulis (migration SQL bukan "aplikasi", murni skema).

| # | Ketidaksinkronan | Dokumen Terdampak | Status |
|---|---|---|---|
| 1-7 | *(item lama, lihat versi dokumen 4 Agustus — status tidak berubah pada siklus ini: sebagian resolved, sebagian tetap open non-blocking)* | Berbagai | Tidak berubah |
| 8 | ~~Modul 12/13 Approved arsitektur, namun PRD/ERD/API Spec/User Flow/SEO Spec v1.1 belum direvisi untuk mencantumkan kedua modul ini.~~ | `PRD.md`, `ERD.md`, `API-Specification.md`, `User-Flow.md` | ✅ **RESOLVED, 5 Agustus 2026** — seluruh dokumen di atas naik versi (PRD v1.2, ERD v1.3, API Spec v1.2, User Flow v1.2) dan mencantumkan M12/M13 penuh. Lihat *ADR & Governance Snapshot*. |
| 9 | **(Baru, 6 Agustus)** `development-playbook.md` §23 (Development Order) memuat tabel urutan modul yang **sebagian berbeda** dari `Module-Dependency-Matrix-...v1.0.md`/`Module-Implementation-Strategy-...v1.1.md` — §23 masih mereferensikan `PRD-v1.1.md`, belum sepenuhnya sinkron dengan PRD v1.2/ADR-026-028. | `development-playbook.md` §23 | Open — **non-blocking**, MDM/MIS dipakai sebagai rujukan tunggal urutan modul (lihat *Pending Modules*) sampai §23 disinkronkan ulang secara resmi. |
| 10 | **(Baru, 6 Agustus)** Migration SQL untuk M12/M13 (`0007`, `0015`) sudah ditulis dan skema sudah Baseline, namun **tidak ada pernyataan eksplisit di dokumen governance manapun** bahwa ini otomatis membuka gate kode aplikasi M12/M13. | `PROJECT-CONSTITUTION.md` §24 poin 10, dokumen ini | **Open — memblokir kode aplikasi M12/M13** (bukan migration/skema-nya, yang sudah Baseline) sampai Owner menyatakan eksplisit gate terbuka di dokumen ini. |

---

# Open Decision (ADR) yang Tersisa

**Tidak ada ADR yang berstatus OPEN.** Tidak berubah dari snapshot sebelumnya.

---

# Readiness Snapshot (Governance)

**Baseline Readiness per dokumen (diperbarui 6 Agustus):**

| Dokumen | Status |
|---|---|
| PRD | **Ready** — v1.2, Baseline, mencakup 13 modul (114 REQ-XXX) |
| ERD | **Ready** — v1.3, Baseline, 44 entity, mencakup struktur M12/M13 penuh |
| Entity Mapping | **Ready** *(baru)* — v1.0, Baseline |
| API Specification | **Ready** — v1.2, mencakup §5A/§5B (Organization/AI Assistant) |
| Authorization & Access Control Specification | **Ready** *(baru)* — v1.0, Baseline |
| Functional / UI / Technical Specification | **Ready** *(baru)* — v1.0 masing-masing, Baseline |
| Technology Decisions | **Ready** — Baseline, tidak ada Open Decision arsitektur/teknis/administratif tersisa |
| System Architecture | **Ready** — Baseline (v1.6) |
| **Database Migration (SQL)** *(baru kategori)* | **Written, Draft status** — menunggu pengesahan eksekusi Owner, belum Ready untuk live |
| **Module Dependency Matrix / Module Implementation Strategy** *(baru)* | **Ready** — v1.0/v1.1, dipakai sebagai rujukan urutan modul resmi |

**Kondisi GO WITH CONDITIONS — status per 6 Agustus 2026:** **Tetap 6 dari 6 kondisi resmi terpenuhi** (tidak berubah dari 4 Agustus — tidak ada kondisi baru yang ditambahkan). **Status proyek: GO.** Sprint S0 kini secara praktis **lebih siap dari sebelumnya** karena migration SQL sudah tertulis lengkap — pekerjaan Sprint S0 bergeser dari "menulis skema" menjadi "eksekusi & verifikasi skema yang sudah ditulis".

---

# Next Recommended Module

## Sprint S0 — Foundation Infrastructure (Eksekusi)

**Perubahan signifikan dari rekomendasi sebelumnya:** sebagian besar pekerjaan **desain** Sprint S0 (skema `roles`/`permissions`/`users`/region data, dst.) **sudah selesai dalam bentuk migration SQL tertulis**. Yang tersisa adalah:

1. Inisialisasi monorepo (`apps/web`, `packages/shared-types`), Next.js + TypeScript.
2. Setup Tailwind + shadcn/ui, ESLint/Prettier/Husky.
3. CI pipeline (GitHub Actions).
4. **Buat project Supabase nyata**, lalu **jalankan `0001`–`0015` (atau `Database-Migration-Full-v1.0.sql`) secara berurutan** — migration sudah ada, tinggal dieksekusi & diverifikasi terhadap `Database-Dictionary-Migration-Ready-v1.0.md`.
5. Skeleton route group + middleware skeleton.
6. Scaffold environment variables.

**Acceptance Criteria S0:** CI pipeline lolos pada commit kosong; **seluruh 15 file migration dapat dijalankan berurutan dari database kosong tanpa error**; seed data wilayah terverifikasi jumlahnya; **tabel `organizations`/`agent_ai_connections` berhasil dibuat sebagai bagian skema meski kode aplikasi M12/M13 belum ditulis** (skema boleh live, aplikasi belum).

**Catatan gate M12/13 tetap berlaku:** eksekusi migration `0007`/`0015` di Sprint S0 **diperbolehkan** (murni kebutuhan integritas FK skema) — ini **tidak sama** dengan membuka gate kode aplikasi (Route Handler/UI) M12/M13, yang tetap memerlukan konfirmasi eksplisit Owner secara terpisah sebelum Sprint terkait modul tsb dimulai.

---

# AI Session Rules

Tidak berubah dari snapshot sebelumnya (13 aturan), dengan **1 penambahan**:

14. **(Baru, 6 Agustus) Migration SQL yang sudah tertulis (`0001`–`0015`) tidak boleh ditulis ulang/didesain ulang dari nol** — jika task menyentuh skema database, gunakan file yang sudah ada sebagai basis (edit/tambah migration bernomor berikutnya jika perlu perubahan), bukan membuat migration paralel yang tumpang tindih. Jika ditemukan perbedaan antara migration SQL yang sudah ada dan ERD v1.3/`Database-Dictionary-Migration-Ready-v1.0.md`, laporkan sebagai temuan — jangan diam-diam memilih salah satu sebagai benar.

---

*Dokumen ini adalah catatan status proyek yang hidup (living document) — wajib diupload ulang ke AI Coding Assistant di setiap sesi development baru, dan wajib diperbarui setiap kali ada perubahan nyata pada kode/skema/struktur proyek. Tidak ada informasi di dokumen ini yang dikarang — setiap bagian yang belum ada dicatat eksplisit sebagai "Belum dibuat", dan setiap bagian yang sudah ditulis-tapi-belum-dieksekusi dicatat eksplisit sebagai demikian, tidak disamakan dengan "selesai".*
