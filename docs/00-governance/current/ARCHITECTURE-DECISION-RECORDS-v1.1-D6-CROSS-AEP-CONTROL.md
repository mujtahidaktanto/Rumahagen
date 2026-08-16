# ARCHITECTURE DECISION RECORDS (ADR)
## Platform Web RUMAHAGEN

---

# 1. Document Information

| Field | Value |
|---|---|
| **Name** | Architecture Decision Records — Platform Web RUMAHAGEN |
| **Version** | 1.1 (naik dari 1.0 — konsolidasi 9 snapshot revisi menjadi 1 file master + perbaikan regresi ADR-005/ADR-006 yang belum tuntas di revisi sebelumnya; lihat Bagian 1A Revision History) |
| **Status** | Baseline (disinkronkan dengan status yang sudah dideklarasikan `project-manifest.md` 4 Agustus 2026 — field ini sebelumnya masih tertulis "Draft" di file `__9_`, kini disamakan) |
| **Owner** | Principal Enterprise Software Architect / Enterprise Solution Architect — **Mujtahid Aktanto (Solo Project Owner, AI-Assisted)** — resolusi **OD-06**, 4 Agustus 2026 |
| **Last Updated** | 8 Agustus 2026 (revisi: **ADR-029** Image Duplicate Detection Strategy disahkan Approved, resolusi OD-25. **29 dari 29 ADR arsitektur/teknis kini Approved, 0 ADR OPEN.** Sebelumnya: 5 Agustus 2026, konsolidasi 9 file snapshot menjadi 1 file master tunggal + perbaikan tuntas regresi ADR-005/ADR-006; lihat Bagian 1A dan Governance Notes poin 6-7) |
| **Purpose** | Menjadi **satu-satunya sumber kebenaran** untuk seluruh keputusan yang memengaruhi **desain arsitektur dan implementasi teknis** proyek — dipakai sebagai rujukan wajib bagi `technology-decisions.md`, `SYSTEM-ARCHITECTURE.md`, `AI-DEVELOPMENT-BLUEPRINT.md` (Development Playbook), `dependency-manifest.md`, Database Schema (saat dibuat), `API-Specification`, dan Technical Specification (saat dibuat). |

---

# 1A. Revision History

> Bagian ini menggantikan kebutuhan menyimpan 9 file snapshot terpisah (`__1_` s.d. `__9_`, 27 Juli – 4 Agustus 2026) — riwayatnya kini terdokumentasi di dalam satu file ini. File-file snapshot lama tidak dihapus dari arsip proyek, namun tidak lagi menjadi dokumen aktif untuk diupload di sesi kerja berikutnya (lihat `document-governance-baseline-register.md`).

| # | Tanggal | Ringkasan Perubahan | ADR Terdampak |
|---|---|---|---|
| 1 | 27 Jul 2026 | Draf awal — ADR-001 Approved (Board), ADR-002–004/007/009–017/019–025 Approved (individual), ADR-005/006/008/018 masih OPEN | ADR-001 s.d. ADR-025 (draf awal) |
| 2 | 28 Jul 2026 | ADR-005 (Search Strategy) disahkan Approved With Notes — PostgreSQL FTS + pg_trgm Fase 1, migrasi Typesense Fase 2 | ADR-005 |
| 3 | 29 Jul 2026 | ADR-006 (Job Queue Strategy) disahkan Approved With Notes — Vercel Cron + Postgres Trigger Fase 1, migrasi QStash Fase 2 | ADR-006 |
| 4 | 30 Jul 2026 | ADR-008 (Maps Provider) disahkan Approved. **Regresi tidak disengaja:** entri ADR-005 & ADR-006 di Bagian 4 ter-*revert* kembali ke teks draf 27 Juli (tidak terdeteksi saat itu) | ADR-008 (maju); ADR-005/006 (regresi, tidak terdeteksi) |
| 5 | 31 Jul 2026 | ADR-018 (Caching Strategy) disahkan Approved. Regresi ADR-005/006 masih belum terdeteksi | ADR-018 |
| 6 | 3 Ags 2026 | ADR-026 (Organization Model), ADR-027 (Organization-Scoped Authorization), ADR-028 (AI Assistant Integration/BYOK) ditambahkan. Status ADR-023 direvisi (bukan Superseded). **Regresi ADR-005/006 terdeteksi via audit riwayat** — narasi Bagian 5/6/7/8 & Governance Notes diperbaiki, **namun entri sumber Bagian 4 tidak ikut diperbaiki** (baru diketahui pada revisi 5 Agustus 2026) | ADR-026, 027, 028 (baru); ADR-023 (revisi status); ADR-005/006 (perbaikan sebagian/tidak tuntas) |
| 7 | 3 Ags 2026 | Duplikat identik dari # 6 (upload ganda, tidak ada perubahan isi) | — |
| 8 | 3 Ags 2026 | Duplikat identik dari # 6 (upload ganda, tidak ada perubahan isi) | — |
| 9 | 4 Ags 2026 | Resolusi OD-06 (Owner → Mujtahid Aktanto di seluruh entri), OD-02 (seed role final = 7, tercermin di ADR-024 Notes), ADR-046 (perluasan soft-delete, tercermin di ADR-004 Notes) | Seluruh ADR (field Owner); ADR-024, ADR-004 (Notes) |
| **10 (file ini)** | **5 Ags 2026** | **Konsolidasi 9 file menjadi 1 file master.** Audit kata-per-kata menemukan regresi ADR-005/006 dari # 6 **belum benar-benar tuntas** — entri Bagian 4 masih berisi teks draf 27 Juli. **Dipulihkan penuh** dari sumber `__2_`/`__3_`, diverifikasi identik substansi dengan `decision-log.md` ADR-039/ADR-040. Field `Dependencies` ADR-001 & ADR-006 diperbarui redaksional (menghapus rujukan "masih OPEN" usang). Baris `Cross-reference: decision-log.md ADR-XXX` ditambahkan ke ADR-001/005/006/008/018 untuk konsistensi gaya dengan ADR-026/027/028. Status dokumen disinkronkan ke Baseline (mengikuti deklarasi `project-manifest.md` 4 Agustus 2026) | ADR-005, ADR-006 (pemulihan tuntas); ADR-001 (Dependencies + Cross-reference); ADR-008, ADR-018 (Cross-reference) |

---

# 2. ADR Overview

**Tujuan ADR.** Dokumen ini mencatat keputusan arsitektur/teknis dalam format standar industri (Architecture Decision Record) — satu catatan per keputusan, berisi konteks, opsi yang dipertimbangkan, dan konsekuensinya. Tujuannya adalah agar siapa pun (manusia atau AI Coding Assistant) yang bertanya "**mengapa** sistem ini dibangun seperti ini" mendapat jawaban tunggal dan otoritatif, bukan harus merekonstruksi alasan dari tersebarnya isi `technology-decisions.md`, `SYSTEM-ARCHITECTURE.md`, dan `PROJECT-CONSTITUTION.md` sekaligus.

**Perbedaan ADR dengan Decision Log.** `decision-log.md` adalah **jurnal kronologis** seluruh keputusan proyek — teknis maupun non-teknis (mis. penetapan versi Blueprint aktif, keputusan governance dokumen, keputusan bisnis yang berdampak proses). ADR di dokumen ini **hanya** mencakup subset keputusan yang berdampak langsung pada **desain arsitektur dan implementasi teknis** (stack, pola integrasi, strategi data, keamanan teknis, dsb.) — disusun **per topik arsitektur**, bukan per urutan waktu terjadinya. Satu topik arsitektur = satu ADR yang hidup dan dapat diperbarui statusnya (Superseded, bukan dihapus), berbeda dengan entri Decision Log yang murni menambah baris baru kronologis.

> **Catatan penomoran:** Dokumen ini memakai penomoran `ADR-001`…`ADR-025` sendiri, **terpisah** dari penomoran `ADR-001`…`ADR-037` di `decision-log.md`. Kedua dokumen **tidak berbagi ruang nomor yang sama** meski sama-sama memakai prefiks "ADR-" — ini dicatat sebagai potensi ambiguitas penamaan di Governance Notes (akhir dokumen) dan **belum diputuskan sendiri** solusinya (mis. penambahan prefiks pembeda) karena itu adalah keputusan tata kelola dokumen, bukan keputusan arsitektur.

**Bagaimana AI harus menggunakan ADR.** Lihat Bagian 10 (AI Usage Rules) untuk aturan lengkap. Ringkasnya: ADR dibaca **sebelum** `technology-decisions.md`, karena ADR menjelaskan alasan di balik apa yang tercantum di sana; ADR berstatus **Approved tidak boleh dilanggar**; ADR berstatus **Open tidak boleh diasumsikan/dipilih sendiri oleh AI**.

**Hubungan ADR dengan Technology Decisions.** ADR adalah **lapisan keputusan** (mengapa, dengan alternatif apa, dengan konsekuensi apa); `technology-decisions.md` adalah **lapisan katalog** (stack resmi yang harus dipakai, versi, justifikasi ringkas per teknologi). Setiap baris "Official Technology Stack" di `technology-decisions.md` **seharusnya** dapat ditelusuri balik ke tepat satu ADR di dokumen ini. Jika ditemukan baris di `technology-decisions.md` yang tidak memiliki ADR yang menaunginya (atau sebaliknya), ini dicatat sebagai gap governance, bukan diasumsikan sinkron.

---

# 3. ADR Status Legend

| Status | Arti |
|---|---|
| **Proposed** | Keputusan diusulkan/didraf, alternatif sudah mulai diidentifikasi, namun analisis dampak dan review arsitektur belum selesai. Belum mengikat implementasi. |
| **Open** | Keputusan **belum dapat ditentukan** dari dokumen proyek yang ada — baik karena benar-benar belum dibahas, atau karena dokumen yang membahasnya saling bertentangan/tidak sinkron pada level hierarki yang berbeda. AI/developer **tidak boleh** mengimplementasikan sesuatu berdasarkan entry berstatus ini sebagai final. |
| **Approved** | Keputusan sudah disetujui secara arsitektural berdasarkan dokumen proyek yang tersedia, dan **mengikat** untuk implementasi berikutnya. Tidak berarti sudah ada di kode (proyek saat ini 0% kode — lihat `CURRENT-PROJECT-STATE.md`), hanya berarti keputusan sudah final untuk dieksekusi. |
| **Rejected** | Sebuah opsi/pendekatan secara eksplisit dipertimbangkan dan ditolak (biasanya tercatat di *Architecture Constraints* `technology-decisions.md`), dicatat agar tidak diusulkan ulang tanpa alasan baru yang kuat. |
| **Superseded** | ADR ini pernah `Approved`, namun telah **digantikan sepenuhnya** oleh ADR lain yang lebih baru — dipertahankan sebagai sejarah, tidak dihapus, dengan rujukan ke ADR pengganti. |
| **Deprecated** | ADR ini pernah berlaku dan sebagian implementasinya mungkin masih ada, tetapi **tidak lagi direkomendasikan** untuk kode baru — belum tentu sudah sepenuhnya digantikan (beda dengan *Superseded* yang penggantinya sudah pasti). |

---

# 4. Architecture Decision Records

---

**ADR-001 — Backend Architecture**

**Status:** APPROVED
**Date:** 2026-07-27
**Owner:** Architecture Review Board (CTO, Principal Software Architect, Enterprise Solution Architect, Senior Backend Architect, Senior Frontend Architect, Cloud Architect, DevOps Architect, Database Architect, Security Architect, AI Development Architect, Technical Lead) — pengesahan formal final tetap memerlukan konfirmasi Technical Lead/CTO manusia sesuai Bagian 9 (Governance Rules)

**Context:** Proyek membutuhkan lapisan backend/API untuk 11 modul PRD dengan RBAC granular 2-lapis, kalkulasi finansial (DBR), dan integrasi pihak ketiga (Maps, Search, Email). Dua pola arsitektur dipertimbangkan: BFF tipis lewat Next.js Route Handlers (menyatu dengan Supabase), atau service backend terpisah (mis. NestJS/Express). Proyek dikembangkan dengan bantuan AI Coding Assistant lintas sesi dan menggunakan **Bolt.new** sebagai bagian alur pengembangan — fakta yang sebelumnya tidak terdokumentasi di ADR manapun, baru muncul pada sesi Architecture Review Board yang menyelesaikan keputusan ini.

**Decision:** **Next.js Route Handlers sebagai BFF tipis, terintegrasi langsung dengan Supabase.** Seluruh endpoint API (`API-Specification-v1.1.md`) diimplementasikan sebagai Route Handlers (`app/api/v1/**/route.ts`) dalam satu aplikasi (`apps/web`), berkomunikasi langsung ke Supabase (Auth, Postgres, Storage) via service role key server-side. **Tidak ada** service backend Node terpisah (NestJS/Express) yang diadakan untuk cakupan proyek saat ini.

**Rationale:** (1) Selaras penuh dengan 5 ADR Approved lain yang sudah mengasumsikan integrasi rapat Supabase+Vercel (ADR-002, ADR-004, ADR-009, ADR-010, ADR-021) — memilih service terpisah akan menciptakan inkonsistensi arsitektural terhadap keputusan yang sudah final; (2) kompatibilitas struktural dengan **Bolt.new**, yang dirancang untuk satu aplikasi full-stack Node/Next.js dalam WebContainer, bukan untuk mengorkestrasi dua service terpisah dengan siklus hidup independen; (3) tidak ada bukti kebutuhan bisnis di PRD yang mensyaratkan proses long-running/heavy-compute — modul yang secara teori paling "berat" (DBR §Modul 7, RBAC §Modul 10) adalah operasi CPU ringan berbasis query dan formula; (4) meminimalkan risiko drift asumsi arsitektur antar sesi AI Coding Assistant dengan satu mental model tunggal; (5) kompleksitas operasional & biaya paling rendah untuk tim kecil di tahap MVP — satu deployment unit, tanpa kebutuhan auth-bridging antar sistem.

**Alternatives Considered:**
- **Next.js Route Handlers sebagai BFF tipis** *(dipilih)*: kompleksitas operasional rendah, satu deployment unit, cocok tim kecil, native terhadap Bolt.new.
- **Service backend terpisah (NestJS/Express)** *(ditolak)*: pemisahan concern lebih jelas untuk logic kompleks (RBAC, DBR) dan skalabilitas independen, namun menimbulkan friksi tinggi dengan Bolt.new (dua proses, dua port, konfigurasi CORS, dua alur build), menambah kompleksitas auth-bridging JWT Supabase ke service terpisah, serta operational overhead yang tidak sepadan dengan kebutuhan skala yang terbukti saat ini.
- **Hybrid: Route Handlers + Supabase Edge Functions untuk logic berat/sensitif** *(tidak ditolak, dipisah ke ADR-006)*: skor tertinggi pada kesesuaian PRD/ERD, namun sengaja tidak dijadikan bagian keputusan ADR-001 agar tidak mencampur dua keputusan independen — cakupan Edge Functions untuk job asinkron/webhook menjadi bagian ADR-006 (Job Queue Strategy, masih OPEN). ADR-001 tetap kompatibel penuh dengan pendekatan ini di masa depan tanpa perlu direvisi.

**Consequences:** Proyek terikat pada batas eksekusi fungsi serverless Vercel (~10–60 detik tergantung paket) — proses berat di masa depan (bulk processing, batch job) wajib diarahkan ke Edge Function/Job Queue (ADR-006), bukan dipaksakan ke Route Handler; hal ini perlu didokumentasikan eksplisit sebagai constraint arsitektur, bukan asumsi tersembunyi. Migrasi ke service terpisah di masa depan (bila kebutuhan skalabilitas berubah signifikan, dikonfirmasi data produksi) memerlukan ekstraksi logic dari Route Handlers — dapat dilakukan bertahap karena logic tetap TypeScript murni (ADR-025), namun tetap merupakan pekerjaan migrasi non-trivial. Konvensi API (ADR-012, bentuk kontrak) tidak berubah — hanya lokasi eksekusinya yang kini terkunci.

**Impact:** Menentukan struktur folder — **tidak ada** `apps/api` terpisah, seluruh implementasi berada di `apps/web`; pola implementasi seluruh endpoint `API-Specification-v1.1.md` terkunci sebagai Route Handlers; tidak dibutuhkan repository/deployment terpisah. Berdampak lintas seluruh 11 modul PRD (setiap modul memiliki lapisan API).

**Affected Documents:** `PROJECT-CONSTITUTION.md` §4, `SYSTEM-ARCHITECTURE.md` §4/§9/§11/§23, `technology-decisions.md` §9.1, `AI-DEVELOPMENT-BLUEPRINT.md`, `dependency-manifest.md`, `decision-log.md`, `CHANGELOG.md`, `CURRENT-PROJECT-STATE.md`, Technical Specification (belum ada).

**Dependencies:** Bergantung pada ADR-021 (Frontend Framework — Approved: Next.js App Router). Menjadi prasyarat bagi ADR-005 (Search Strategy, **kini Approved** — 28 Juli 2026), ADR-006 (Job Queue Strategy, **kini Approved** — 29 Juli 2026 — lihat opsi Hybrid di atas), ADR-012 (API Architecture, sudah Approved secara independen — kini lokasi eksekusinya terkonfirmasi konsisten), ADR-018 (Caching Strategy, kini sudah **Approved** — 31 Juli 2026).

**Review Date:** Ditinjau ulang jika kebutuhan proses long-running/heavy-compute atau skala traffic yang terbukti melampaui batas fungsi serverless Vercel dikonfirmasi eksplisit oleh data produksi pasca-rilis.

**Notes:** Diselesaikan melalui sesi Architecture Review Board (27 Juli 2026) mengikuti proses 10-tahap (Why It Matters → Alternatives → Comparison → Recommendation → Impact → Document Updates → ADR → Governance Sync → Final Decision). Keputusan akhir sesi tersebut berstatus **APPROVED WITH NOTES** — dua catatan kondisional dari Board: (1) batas eksekusi serverless Vercel wajib didokumentasikan eksplisit di `SYSTEM-ARCHITECTURE.md` saat sinkronisasi; (2) **Bolt.new** sebagai bagian toolchain resmi proyek belum tercatat di `technology-decisions.md`/`dependency-manifest.md` dan direkomendasikan ditambahkan secara eksplisit, bukan hanya menjadi konteks satu sesi percakapan. Sebelumnya dokumen ini menyatakan ADR-001 sebagai satu-satunya keputusan arsitektur berkategori blocking tertinggi per `executive-architecture-review.md` — status tersebut kini terselesaikan. Cross-reference: `decision-log.md` `ADR-038`.

---

**ADR-002 — Authentication Strategy**

**Status:** Approved
**Date:** 2026-07-26
**Owner:** Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Dibutuhkan mekanisme login (email/password + OTP, Google OAuth2) yang terintegrasi rapat dengan RLS Postgres, tanpa membangun ulang dari nol.

**Decision:** Menggunakan **Supabase Auth**, dibungkus **JWT internal platform** — seluruh layer di luar Auth hanya mengenal JWT ini, bukan metode login aslinya. Verifikasi `id_token` Google OAuth wajib server-side.

**Alternatives Considered:** Auth0/Clerk (vendor Auth terpisah dari database — biaya & kompleksitas tambahan); NextAuth.js/Auth.js custom (tidak seintegrasi Supabase Auth dengan RLS Postgres).

**Pros:** OTP & OAuth2 siap pakai; terintegrasi rapat dengan `auth.uid()` untuk RLS; tidak menambah vendor Auth terpisah.

**Cons:** Role/permission RBAC kustom (8 role) tidak native di Supabase Auth — tetap harus dikelola manual di tabel `roles`/`role_permissions` (lihat ADR-003).

**Impact:** Seluruh alur registrasi/login Modul 1, sesi 15–60 menit (access token) + 30 hari (refresh token httpOnly cookie).

**Affected Documents:** `PROJECT-CONSTITUTION.md` §10, `technology-decisions.md` §4.8, `API-Specification-v1.1.md` §0.1 & §1.1, `decision-log.md` ADR-005.

**Dependencies:** Prasyarat bagi ADR-003 (Authorization/RBAC).

**Review Date:** Tidak ada pemicu spesifik diantisipasi; tinjau ulang jika kebutuhan SSO enterprise muncul.

**Notes:** Login via Google untuk role Agen tetap wajib melalui alur `pending_review` (upload dokumen legalitas) — OAuth tidak melewati approval manual.

---

**ADR-003 — Authorization & RBAC Strategy**

**Status:** Approved
**Date:** 2026-07-26
**Owner:** Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Sistem membutuhkan kontrol akses granular untuk 8 role dengan hard rule ownership (`agent_id`) yang tidak boleh bocor lintas agen, bahkan jika satu lapisan pertahanan gagal.

**Decision:** Dua lapis pertahanan: **RBAC kustom aplikasi** (`roles`/`permissions`/`role_permissions`, model `granted_scope`: `own`/`all`/`none`) sebagai lapisan pertama, dan **Row Level Security (RLS)** Supabase sebagai lapisan kedua. Manager **selalu** `granted_scope = 'all'` (global) tanpa mode "scoped tim/wilayah". Superadmin selalu bypass (short-circuit). Role formal: Superadmin, Manager, Admin, Instructor, Agen, Developer Partner, Buyer, Guest.

**Alternatives Considered:** RBAC aplikasi saja tanpa RLS (ditolak — bertentangan dengan hard rule keamanan dua-lapis); level `granted_scope` tambahan "scoped tim/wilayah" untuk Manager (ditolak untuk rilis ini — lihat `decision-log.md` ADR-033).

**Pros:** Satu lapisan gagal tidak langsung membocorkan seluruh data; hard rule ownership dicek di kode, bukan hanya konfigurasi yang bisa salah diatur.

**Cons:** Kompleksitas ganda — perubahan skema permission harus disinkronkan hati-hati di kedua lapisan.

**Impact:** Berlaku di **setiap** endpoint/tabel ber-scope kepemilikan di seluruh 11 modul.

**Affected Documents:** `PROJECT-CONSTITUTION.md` §11 & §20, `ERD-Skema-Database-v1.1.md` §2.28–2.30, `technology-decisions.md` §4.9, `decision-log.md` ADR-006/032/033.

**Dependencies:** Bergantung ADR-002 (Authentication) dan ADR-004 (Database Strategy — untuk RLS). Prasyarat bagi ADR-012 (API Architecture).

**Review Date:** Jika kebutuhan bisnis "Manager per wilayah" muncul eksplisit — akan menjadi ADR baru yang men-supersede sebagian ADR ini.

**Notes:** Jumlah role bernama saat ini **7 role dengan akun** (superadmin, manager, admin, instructor, agent, developer_partner, buyer) + Guest tanpa akun (bukan baris `roles`) — **RESOLVED 4 Agustus 2026 (OD-02):** angka final dikunci 7, tidak ada lagi drift "7 vs 8" di dokumen turunan.

---

**ADR-004 — Database Strategy**

**Status:** Approved
**Date:** 2026-07-25/26
**Owner:** Database Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Skema ERD proyek (37+ entitas) memakai relasi ketat (FK, ENUM, UNIQUE composite, cascading wilayah) yang menjadi tulang punggung RBAC dan ownership hard rule.

**Decision:** **PostgreSQL** (di-host via Supabase) sebagai database relasional utama. **UUID sebagai primary key** di seluruh tabel (bukan auto-increment). **Soft delete** (`deleted_at`) wajib untuk `listings`, `users`, `developer_projects`. Migration **murni SQL** bernomor urut via Supabase CLI, tanpa ORM auto-sync ke production.

**Alternatives Considered:** MongoDB/NoSQL (ditolak — tidak cocok relasi ketat); auto-increment integer + hard delete (ditolak — risiko enumerasi kompetitor & kehilangan data tanpa jejak); ORM auto-sync `db push` ke production (ditolak — schema drift tak terkontrol tanpa jejak review).

**Pros:** ACID compliance, indexing kaya (composite, trigram/full-text), migration dapat direview & di-rollback.

**Cons:** Scaling horizontal butuh strategi eksplisit (partitioning/sharding) jika volume tumbuh sangat besar di masa depan.

**Impact:** Seluruh 37+ entitas ERD, seluruh endpoint API yang membaca/menulis data.

**Affected Documents:** `PROJECT-CONSTITUTION.md` §4 & §9, `ERD-Skema-Database-v1.1.md`, `technology-decisions.md` §4.7, `decision-log.md` ADR-004/029/030, Database Schema (fisik — belum ada, TBD).

**Dependencies:** Prasyarat bagi ADR-003 (RLS), ADR-022 (Schema Conventions — dilebur ke sini), Database Schema fisik.

**Review Date:** Jika kebutuhan multi-tenant/multi-region (lihat ADR-023) memerlukan penyesuaian skema besar.

**Notes:** ~~**Gap terbuka (bukan mengubah status Approved):** kebijakan soft-delete belum dideklarasikan seragam untuk seluruh entitas — hanya eksplisit untuk 3 tabel.~~ **RESOLVED 4 Agustus 2026 via `ADR-046`** (lihat `decision-log.md`): kebijakan diperluas ke **8 tabel** — `listings`, `users`, `developer_projects` (asli) + `agent_profiles`, `agent_reviews`, `courses`, `events`, `developer_partners` (baru). Keputusan inti ADR ini (Postgres/UUID/migration-SQL) tidak berubah — `ADR-046` murni memperluas cakupan tabel, bukan Supersedes/Replaces.

---

**ADR-005 — Search Strategy**

**Status:** APPROVED
**Date:** 2026-07-28
**Owner:** Architecture Review Board (CTO, Principal Software Architect, Enterprise Solution Architect, Senior Backend Architect, Senior Frontend Architect, Cloud Architect, DevOps Architect, Database Architect, Security Architect, AI Development Architect, Technical Lead) — pengesahan formal final tetap memerlukan konfirmasi Technical Lead/CTO manusia sesuai Bagian 9 (Governance Rules)

**Context:** `API-Specification-v1.1.md` §3 mensyaratkan `/properties/search`, `/properties/autocomplete`, `/properties/map-bounds`, `/properties/nearby`, dan `/properties/{id}/similar` dengan filter kombinasi (kategori, tipe transaksi, lokasi cascading, rentang harga/luas, kamar, sertifikat) serta typo-tolerance pada autocomplete. Belum ada pilihan resmi mesin pencari di `technology-decisions.md` "Official Technology Stack". Keputusan ini dievaluasi dengan konteks ADR-001 (Backend Architecture) yang sudah Approved (Route Handlers + Supabase, tanpa service terpisah) dan ADR-006 (Job Queue Strategy) yang masih OPEN pada saat sesi ini berlangsung.

**Decision:** **Strategi bertahap (hybrid).** Fase 1 (MVP, saat ini): **PostgreSQL Full-Text Search (`tsvector`/`tsquery`) dikombinasikan ekstensi `pg_trgm`** untuk fuzzy/typo-tolerance terbatas pada autocomplete — kolom generated `search_vector` ditambahkan pada tabel `listings` dengan index GIN, tanpa komponen infrastruktur tambahan di luar Supabase. Fase 2 (migrasi terjadwal, bukan reaktif): migrasi ke **Typesense** dipicu begitu salah satu dari tiga kriteria ambang berikut tercapai — (a) volume listing aktif melampaui ±50.000 baris, (b) latensi p95 endpoint `/properties/search` melampaui 500ms pada beban produksi terukur, atau (c) keluhan relevansi pencarian berulang (≥3 laporan independen dalam satu sprint) yang tidak dapat diperbaiki lewat tuning index Postgres.

**Rationale:** (1) Konsisten dengan ADR-001 (Approved) — tidak menambah komponen infrastruktur di luar Supabase/Vercel pada fase saat ini, selaras filosofi minimal-vendor yang baru dikunci panel; (2) tidak ada proyeksi volume listing di PRD/roadmap yang membuat Postgres FTS menjadi bottleneck nyata di Fase 1; (3) sinkronisasi data ke index eksternal (Typesense/Elasticsearch/Algolia) bergantung pada mekanisme job queue yang keputusannya (ADR-006) masih OPEN saat sesi ini berlangsung — memilih mesin eksternal sekarang berarti berasumsi terhadap ADR lain yang belum disahkan, melanggar governance rule proyek (Bagian 10 poin 4); (4) query SQL adalah pola paling matang untuk AI Coding Assistant/Bolt.new men-generate kode secara konsisten lintas sesi; (5) biaya dan risiko vendor lock-in paling rendah untuk fase proyek saat ini, selaras model monetisasi platform yang juga masih belum final; (6) strategi ini bukan keputusan permanen — kriteria ambang migrasi eksplisit mencegah keputusan reaktif di masa depan.

**Alternatives Considered:**
- **PostgreSQL full-text/trigram index sebagai satu-satunya solusi permanen (tanpa rencana migrasi)** *(ditolak)*: nol biaya tambahan, namun tidak memenuhi kebutuhan typo-tolerance & performa filter kompleks jangka panjang begitu volume listing bertumbuh signifikan — direkomendasikan `foundation-validation-report.md` hanya sebagai MVP, bukan solusi akhir.
- **Typesense sejak Fase 1** *(ditolak untuk Fase 1, dipertahankan sebagai target migrasi Fase 2)*: unggul teknis (skalabilitas, typo-tolerance, Developer Experience) namun menambah komponen infrastruktur & ketergantungan pada ADR-006 sebelum diperlukan — adopsi dini dinilai over-engineering pada fase MVP tim kecil.
- **Elasticsearch/OpenSearch** *(ditolak untuk seluruh fase proyek saat ini)*: kapabilitas setara/lebih dari Typesense namun kompleksitas operasional dan biaya cluster tertinggi di antara seluruh opsi, tanpa kebutuhan agregasi analitik kompleks yang memerlukannya.
- **Algolia (search-as-a-service)** *(ditolak)*: implementasi tercepat namun vendor lock-in tertinggi dan model biaya per-record+request berisiko melonjak seiring pertumbuhan listing — tidak proporsional dengan model monetisasi platform yang belum final.

**Consequences:** Typo-tolerance Fase 1 lebih terbatas dibanding mesin pencari khusus — batasan ini perlu dikomunikasikan sebagai keputusan MVP yang disengaja, bukan bug. Tim wajib memantau tiga kriteria ambang migrasi (volume/latensi/keluhan relevansi) secara berkala, bukan sekali di awal saja, agar migrasi Fase 2 ke Typesense tidak terlambat dan tidak reaktif. ADR-006 (Job Queue) kini dapat diputuskan tanpa ketergantungan urgent dari ADR-005 — kedua ADR tidak lagi saling memblokir keputusan satu sama lain; mekanisme sinkronisasi index Fase 2 tetap menunggu resolusi ADR-006 saat migrasi benar-benar dieksekusi.

**Impact:** `GET /properties/search` dan `GET /properties/autocomplete` (`API-Specification-v1.1.md` §3) diimplementasikan penuh menggunakan query Postgres (`to_tsquery`/`similarity()`) — status `// TODO: menunggu resolusi ADR-005` pada Modul 3 dapat dihapus. `/properties/map-bounds` dan `/properties/nearby` tidak terpengaruh (murni geospasial berbasis lat/lng). Tidak ada folder/service baru — logic pencarian tetap di dalam `apps/web` sesuai struktur Route Handlers ADR-001. Skema database bertambah kolom generated `search_vector` (tsvector) + index GIN pada tabel `listings`, tanpa tabel baru.

**Affected Documents:** `technology-decisions.md` §9.2, `API-Specification-v1.1.md` §3, `dependency-manifest.md`, `SEO-Analytics-Specification-v1.1.md` (indexing sinkron), `ERD-Skema-Database-RUMAHAGEN-v1.1.md` (kolom `search_vector`), `ai-development-blueprint.md` §22.3/§23, `decision-log.md`, `CHANGELOG.md`, `CURRENT-PROJECT-STATE.md`.

**Dependencies:** Bergantung pada ADR-001 (Backend Architecture — Approved: Route Handlers + Supabase). ADR-006 (Job Queue Strategy) **kini juga Approved** (29 Juli 2026: Vercel Cron Jobs + Postgres Trigger/Database Webhook Fase 1, migrasi terjadwal ke QStash Fase 2) — mekanisme sinkronisasi index Fase 2 Search (migrasi ke Typesense) dapat memakai mekanisme job scheduling yang sama begitu keduanya sama-sama memasuki Fase 2 masing-masing.

**Review Date:** Ditinjau ulang setiap kali salah satu dari tiga kriteria ambang migrasi (volume listing >±50.000, latensi p95 >500ms, atau keluhan relevansi berulang) terpenuhi, atau maksimal setiap akhir kuartal pasca-launch sebagai pemeriksaan rutin — mana yang lebih dulu tercapai.

**Notes:** Diselesaikan melalui sesi Architecture Review Board (28 Juli 2026) mengikuti proses 10-tahap yang sama dengan ADR-001. Keputusan akhir sesi tersebut berstatus **APPROVED WITH NOTES** — catatan kondisional dari Board: (1) proyeksi volume listing realistis 6–12 bulan pertama perlu dikonfirmasi tim bisnis untuk memvalidasi/menyesuaikan angka ambang 50.000 baris yang dipakai sebagai baseline awal; (2) kapasitas DevOps/anggaran untuk Typesense di masa depan (self-hosted vs Typesense Cloud) perlu dikonfirmasi sebelum kriteria ambang migrasi tercapai, agar pelaksanaan Fase 2 tidak tertahan. `foundation-validation-report.md` Gap H2 yang sebelumnya merekomendasikan pendekatan ini sebagai rekomendasi non-final kini terkonfirmasi sebagai keputusan resmi. Cross-reference: `decision-log.md` `ADR-039`.

---

**ADR-006 — Job Queue Strategy**

**Status:** APPROVED
**Date:** 2026-07-29
**Owner:** Architecture Review Board (CTO, Principal Software Architect, Enterprise Solution Architect, Senior Backend Architect, Senior Frontend Architect, Cloud Architect, DevOps Architect, Database Architect, Security Architect, AI Development Architect, Technical Lead) — pengesahan formal final tetap memerlukan konfirmasi Technical Lead/CTO manusia sesuai Bagian 9 (Governance Rules)

**Context:** Tiga fitur lintas modul membutuhkan proses asinkron/terjadwal: regenerasi sitemap event-driven + panggilan Google Indexing API (M11, `SEO-Analytics-Specification-v1.1.md` §1.5/§4.3), reminder event H-1 (M5), dan sinkronisasi counter denormalisasi (M3/M8). Kebutuhan bertambah dengan rencana fitur Agent Workspace (reminder listing >90 hari belum update, jadwal temu, reminder customer) yang berpola serupa — scan terjadwal periodik. Keputusan ini dievaluasi dengan konteks ADR-001 (Backend Architecture, Approved: Route Handlers + Supabase, tanpa service terpisah) dan ADR-005 (Search Strategy, Approved: strategi native-first dengan migrasi terjadwal berbasis kriteria ambang).

**Decision:** **Strategi hybrid native.** Fase 1 (saat ini): (a) tugas terjadwal periodik (reminder H-1, scan listing stale >90 hari, reminder customer/jadwal temu, fallback sitemap regeneration) dijalankan via **Vercel Cron Jobs** yang memanggil Route Handler (`app/api/cron/**`) dilindungi header `CRON_SECRET`; (b) tugas event-driven instan (counter sync saat lead/transaksi terjadi, sitemap regeneration saat listing `published`) dijalankan via **Postgres Trigger/Database Webhook** yang memanggil Route Handler yang sama — seluruhnya dalam satu `apps/web`, tanpa service/runtime tambahan. Fase 2 (migrasi terjadwal, kondisional): migrasi ke **QStash (Upstash)** dipicu jika salah satu kriteria ambang tercapai — (a) volume job per hari melampaui kapasitas batching satu invocation cron (~10–60 detik per batch), (b) dibutuhkan retry/backoff/dead-letter yang tidak dapat dipenuhi pola cron sederhana, atau (c) frekuensi job melampaui batas cron interval tier Vercel yang dipakai.

**Rationale:** (1) Kebutuhan aktual didominasi tugas terjadwal periodik, bukan queue event bervolume tinggi — memilih queue engine matang adalah over-engineering; (2) BullMQ+Redis secara arsitektural bertentangan dengan ADR-001 karena membutuhkan worker long-running yang tidak dapat berjalan sebagai Vercel serverless function tanpa menambah service hosting terpisah; (3) konsisten dengan preseden ADR-005 (native-first, migrasi terjadwal berbasis kriteria ambang terukur); (4) nol komponen infrastruktur baru — Vercel Cron dan Postgres Trigger/Database Webhook sepenuhnya native pada platform yang sudah dipakai (ADR-004, ADR-010); (5) SQL trigger dan Route Handler + cron config adalah pola paling matang bagi AI Coding Assistant untuk digenerate konsisten lintas sesi; (6) exit plan eksplisit ke QStash mencegah keputusan reaktif di masa depan.

**Alternatives Considered:**
- **Vercel Cron Jobs murni (tanpa Postgres Trigger)** *(ditolak sebagian)*: cukup untuk tugas terjadwal namun kurang ideal untuk counter sync instan yang lebih tepat ditangani trigger database-level.
- **Supabase Edge Functions + pg_cron/Database Webhooks** *(ditolak)*: menambah runtime kedua (Deno) terpisah dari `apps/web`, menambah kompleksitas operasional tanpa manfaat yang tidak bisa dicapai kombinasi Vercel Cron + Route Handler; Database Webhook tetap dipertahankan sebagai teknik namun diarahkan ke Route Handler, bukan Edge Function.
- **BullMQ + Redis** *(ditolak untuk Fase 1)*: worker long-running tidak kompatibel dengan model serverless Vercel tanpa service hosting terpisah, bertentangan langsung dengan filosofi minimal-vendor ADR-001; kompleksitas operasional dan biaya tertinggi di antara seluruh opsi.
- **QStash (Upstash)** *(dipertahankan sebagai target migrasi Fase 2 kondisional, bukan ditolak permanen)*: unggul pada retry/backoff/skalabilitas namun adopsi dini dinilai prematur untuk kebutuhan MVP saat ini.

**Consequences:** Endpoint cron (`app/api/cron/**`) wajib diverifikasi `CRON_SECRET`, tidak terdaftar sebagai endpoint publik di API Specification. Scan batch (mis. listing >90 hari) wajib memakai pagination/batching agar tidak melampaui batas eksekusi serverless (~10–60 detik) — pelampauan batas ini menjadi salah satu kriteria ambang migrasi Fase 2. Tim wajib memantau tiga kriteria ambang migrasi secara berkala. ADR-005 (Search Strategy) yang migrasi Fase 2-nya (Typesense) juga bergantung pada mekanisme sinkronisasi index kini dapat memakai mekanisme job scheduling yang sama begitu keduanya sama-sama memasuki Fase 2. Direkomendasikan menambah tabel audit `job_execution_log` untuk observability (opsional, non-blocking).

**Impact:** Modul 3, 5, 8, 11 — sitemap regeneration, reminder H-1, dan sinkronisasi counter denormalisasi kini dapat diimplementasikan penuh tanpa placeholder. Tidak ada folder/service baru — cron handler tetap di dalam `apps/web` (`app/api/cron/**`) sesuai struktur Route Handlers ADR-001. Skema database bertambah trigger function untuk counter sync (mis. `AFTER INSERT ON listing_leads`) dan opsional tabel `job_execution_log`, tanpa mengubah tabel inti yang sudah ada.

**Affected Documents:** `technology-decisions.md` §9, `SEO-Analytics-Specification-v1.1.md` §1.5 & §4.3, `dependency-manifest.md`, `SYSTEM-ARCHITECTURE.md`, `PROJECT-CONSTITUTION.md`, `development-playbook.md`, `decision-log.md`, `CHANGELOG.md`, `CURRENT-PROJECT-STATE.md`, `ERD-Skema-Database-RUMAHAGEN-v1.1.md` (trigger counter sync, tabel `job_execution_log`).

**Dependencies:** Bergantung pada ADR-001 (Backend Architecture — Approved: Route Handlers + Supabase) dan ADR-010 (Deployment Strategy — Approved: Vercel, menyediakan fitur Cron Jobs). ADR-018 (Caching Strategy) **kini juga Approved** (31 Juli 2026: rate limiting native di atas Supabase Postgres Fase 1, tanpa Redis, migrasi terjadwal ke Upstash Redis Fase 2) — konsisten dengan independensi yang diantisipasi ADR ini; keduanya tidak saling memblokir satu sama lain.

**Review Date:** Ditinjau ulang setiap kali salah satu dari tiga kriteria ambang migrasi (volume job harian, kebutuhan retry/backoff kompleks, atau frekuensi melampaui batas cron interval) terpenuhi, atau maksimal setiap akhir kuartal pasca-launch sebagai pemeriksaan rutin — mana yang lebih dulu tercapai.

**Notes:** Diselesaikan melalui sesi Architecture Review Board (29 Juli 2026) mengikuti proses 10-tahap yang sama dengan ADR-001 dan ADR-005. Keputusan akhir sesi tersebut berstatus **APPROVED WITH NOTES** — dua catatan kondisional dari Board: (1) tier Vercel yang akan dipakai di produksi (Hobby/Pro/Enterprise) perlu dikonfirmasi — menentukan batas jumlah dan frekuensi minimum Cron Jobs yang tersedia, dan karenanya relevansi kriteria ambang "frekuensi melampaui batas cron interval"; (2) status resmi fitur Agent Workspace di roadmap (reminder listing >90 hari, jadwal temu, reminder customer) perlu dikonfirmasi tim produk — jika masuk roadmap, memerlukan ADR/PRD update terpisah untuk mendefinisikan modul tsb secara formal (di luar cakupan ADR ini, yang hanya mengunci mekanisme job queue-nya). Temuan teknis penting dari sesi ini: BullMQ+Redis ditolak bukan karena kalah bersaing pada kriteria umum, melainkan karena worker long-running-nya secara fundamental tidak kompatibel dengan model serverless Vercel yang dikunci ADR-001. Cross-reference: `decision-log.md` `ADR-040`.

---

**ADR-007 — Email Provider**

**Status:** Approved
**Date:** 2026-07-27
**Owner:** Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Dibutuhkan pengiriman email transaksional (OTP registrasi, notifikasi status approval, reminder).

**Decision:** Menggunakan **Resend**, dipasangkan dengan **React Email** untuk template berbasis komponen React.

**Alternatives Considered:** SendGrid, Postmark (valid, DX TypeScript/React dinilai kurang seselaras); Amazon SES (butuh konfigurasi infrastruktur tambahan — domain warm-up, DKIM manual).

**Pros:** DX TypeScript/React paling selaras stack Next.js; deliverability baik; dashboard log pengiriman untuk debugging.

**Cons:** Harga per volume email perlu dipantau seiring pertumbuhan basis pengguna.

**Impact:** Modul 1 (OTP) dan Modul 8 (notifikasi status) — bukan untuk marketing/bulk email.

**Affected Documents:** `technology-decisions.md` §4.14, `dependency-manifest.md`, `decision-log.md` ADR-010.

**Dependencies:** Terkait ADR-020 (Notification Strategy).

**Review Date:** Jika kebutuhan volume email melonjak signifikan (mis. campaign marketing skala besar).

**Notes:** **Gap administratif (non-blocking):** keputusan ini belum disinkronkan ke `SYSTEM-ARCHITECTURE.md` §23 yang masih mencatatnya kosong — lihat Bagian 5.

---

**ADR-008 — Maps Provider**

**Status:** APPROVED
**Date:** 2026-07-30
**Owner:** Architecture Review Board (CTO, Enterprise Software Architect, Solution Architect, GIS Architect, Senior Next.js Engineer, Senior Supabase Engineer) — **Mujtahid Aktanto (Solo Project Owner, AI-Assisted)**, resolusi OD-06, 4 Agustus 2026
**Version:** v3 (Minor Revision — Implementation Readiness)

**Context:** Fitur lokasi listing (Modul 3) dan peta proyek developer (Modul 6) membutuhkan autocomplete alamat (client-side), rendering pin peta (client-side), reverse geocoding (server-side), dan distance matrix ke fasilitas umum (server-side). Keputusan sebelumnya tertahan OPEN karena menunggu konfirmasi biaya bisnis untuk Google Maps Platform. Prioritas proyek kemudian direvisi ke tiga kriteria dominan: budget-friendly, adopsi luas di komunitas developer Indonesia, dan Bolt.new-friendliness — memicu re-evaluasi provider melalui sesi Architecture Review Board lanjutan.

**Decision:** Platform menggunakan **Leaflet + React-Leaflet** (rendering peta, tiles OpenStreetMap gratis) dengan **LocationIQ** sebagai **Primary Geocoding Provider** (geocoding, reverse geocoding, autocomplete — API kompatibel-Nominatim, free tier 5.000 request/hari) dan **Geoapify** sebagai **Approved Alternative Provider** (failover otomatis, sama-sama berbasis data OpenStreetMap, mendukung batch geocoding). Seluruh integrasi dibungkus lapisan abstraksi provider-agnostic (`MapsProvider` interface) di layer service backend dan komponen peta frontend, membuka jalur migrasi masa depan (termasuk kembali ke Google Maps Platform pada tahap Enterprise) tanpa rewrite besar.

Revisi minor (v3) menambahkan lima area implementation-readiness tanpa mengubah keputusan inti: (1) Geoapify sebagai Approved Alternative Provider di bawah LocationIQ; (2) Caching Strategy berbasis PostgreSQL/Supabase (tabel baru `geocode_cache`) untuk geocoding & reverse geocoding, plus debounce + cache edge jangka pendek untuk Autocomplete — tanpa menambah Redis; (3) Rate Limiting scoped khusus endpoint Maps (Autocomplete 20/menit/IP, Geocode/Reverse Geocode 10/menit/IP) via tabel interim `api_rate_limits` di Postgres, tidak mendahului resolusi ADR-018; (4) formalisasi Offline/Manual Address Fallback 3 lapis (administratif via `ref_provinces/cities/districts` yang sudah di-host internal, alamat freetext manual, dan input koordinat manual/drag-pin); (5) roadmap migrasi bertahap MVP → Growth → Scale → Enterprise berbasis ambang volume request.

**Rationale:** Akurasi data alamat/POI Indonesia bukan lagi kriteria dominan tunggal — budget, adopsi komunitas developer Indonesia, dan kemudahan AI code generation (Bolt.new) dinilai lebih menentukan untuk tahap MVP/startup. Leaflet (~2,5 juta unduhan mingguan) dan OpenStreetMap sangat dominan di ekosistem tutorial/proyek developer Indonesia, menekan risiko halusinasi kode AI Coding Assistant. LocationIQ & Geoapify keduanya layanan SaaS hosted (bukan self-hosted), sehingga tetap selaras filosofi serverless-first ADR-001 — keberatan awal terhadap OSM (kebutuhan self-hosted tile server) tidak lagi berlaku karena tidak ada infra tambahan yang di-host sendiri. Risiko akurasi data alamat kompleks perumahan baru dimitigasi (bukan dihilangkan) melalui field `area_keyword` freetext yang sudah ada di ERD dan fallback manual 3 lapis — bukan blocker bagi alur pembuatan listing.

**Alternatives Considered:** **Google Maps Platform** (akurasi data Indonesia terbaik & satu vendor untuk seluruh kebutuhan, namun model biaya per-request paling mahal — $5/1000 geocoding — dan kurang selaras kriteria budget-friendly/adopsi komunitas lokal; tetap dicatat sebagai jalur migrasi tahap Enterprise di roadmap); **Mapbox** (teknis viable, 85% lebih murah dari Google untuk geocoding — $0,75/1000 — namun mewajibkan kartu kredit sejak free tier dan adopsi di komunitas developer Indonesia jauh lebih tipis); **OpenStreetMap self-hosted** (ditolak karena bertentangan dengan filosofi serverless-first ADR-001; digantikan pendekatan tiles OSM via layanan hosted pihak ketiga tanpa self-hosting); **HERE Maps/TomTom** (disingkirkan di tahap awal karena dokumentasi & komunitas developer untuk konteks Indonesia jauh lebih tipis).

**Pros/Cons:** *(Leaflet+OSM+LocationIQ)* Pro: budget-friendly, adopsi komunitas developer Indonesia tinggi, Bolt-friendly, selaras serverless-first; Con: akurasi data alamat kompleks perumahan baru berpotensi lebih rendah dari Google di sebagian wilayah, dimitigasi via `area_keyword` & fallback manual.

**Consequences:** *Positif:* Modul 3 (Sprint S4) dan Modul 6 (Sprint S9) tidak lagi terblokir; biaya operasional Maps API ditekan signifikan dibanding opsi Google Maps; satu abstraction layer membuka migrasi bertahap tanpa rewrite; fallback manual memastikan pembuatan listing tidak pernah benar-benar terhenti akibat kegagalan Geocoding API. *Negatif/Risiko:* Akurasi data OSM untuk kompleks perumahan baru berpotensi lebih rendah dari Google Maps di sebagian wilayah — dimitigasi via `area_keyword` & fallback manual, dipantau lewat kriteria ambang migrasi tahap Scale. Kuota harian LocationIQ (5.000/hari) perlu dipantau sejak Sprint S0 agar tidak terlampaui sebelum tim sempat upgrade tier.

**Impact:** Form lokasi listing (M3), peta proyek developer (M6) — kini dapat diimplementasikan penuh. Tambahan skema: tabel baru `geocode_cache` (dan opsional `api_rate_limits`) perlu masuk migration awal Database Schema Alignment. Tidak ada perubahan pada `listings.latitude`/`longitude` (tetap provider-agnostic, NULLABLE).

**Affected Documents:** `PROJECT-CONSTITUTION.md` §4, `API-Specification-v1.1.md` §13 & §9.1, `technology-decisions.md` §4.29, `dependency-manifest.md` Bagian 9, `ERD-Skema-Database-Real-Estate-Agency-v1.1.md` (tabel `geocode_cache` baru), `SYSTEM-ARCHITECTURE.md` §14 & §15, `decision-log.md` ADR-028 & Open Decision #4, `CHANGELOG.md`, `project-manifest.md`, `CURRENT-PROJECT-STATE.md`.

**Dependencies:** Tidak bergantung pada ADR lain — diselesaikan independen dari ADR-005/006. Rate-limiting interim di ADR ini **tidak mendahului** resolusi ADR-018 (Caching/Rate Limiting lintas-platform) — tetap kompatibel dengan mekanisme apa pun yang akhirnya dipilih ADR-018.

**Supersedes:** Tidak ada ADR yang digantikan — ADR-008 adalah revisi atas keputusannya sendiri (v1 tentatif Google Maps → v2 Leaflet/OSM/LocationIQ → v3 implementation-readiness), bukan penggantian ADR terpisah.

**Superseded By:** Tidak ada (versi aktif saat ini).

**Review Date:** Saat kriteria ambang migrasi tahap Growth/Scale/Enterprise terlampaui (lihat roadmap di Notes), atau maksimal 6 bulan pasca go-live untuk evaluasi biaya & akurasi aktual vs proyeksi.

**Notes:** Roadmap migrasi bertahap — **MVP** (LocationIQ primary + Geoapify failover) → **Growth** (>5.000 request/hari geocoding konsisten 30 hari, atau listing aktif >10.000: upgrade tier LocationIQ) → **Scale** (p95 latency memburuk atau >100.000 request/bulan: migrasi parsial Autocomplete ke Mapbox) → **Enterprise** (butuh SLA komersial/akurasi jadi diferensiator: revisit Google Maps Platform penuh via abstraction layer yang sudah disiapkan). Tim bisnis tetap perlu memantau kuota harian LocationIQ sejak Sprint S0 sebagai bagian operasional rutin. Cross-reference: `decision-log.md` `ADR-041`.

---

**ADR-009 — Storage Strategy**

**Status:** Approved
**Date:** 2026-07-26
**Owner:** Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Dibutuhkan penyimpanan foto/video listing (publik) dan dokumen legalitas agen (privat, sensitif) dengan kontrol akses terintegrasi Auth/RLS.

**Decision:** Menggunakan **Supabase Storage** dengan bucket terpisah tegas: publik (`listing-photos`, `listing-videos`, `developer-project-media`) vs privat (`agent-verification-documents`). Dokumen legalitas tidak pernah lewat CDN publik — akses hanya via signed URL berumur pendek.

**Alternatives Considered:** Cloudinary, ImageKit, AWS S3+CloudFront (dicatat sebagai evaluasi fase lanjutan jika kebutuhan transformasi gambar melampaui kapasitas Supabase Storage).

**Pros:** Terintegrasi langsung dengan Supabase Auth/RLS; mengurangi vendor tambahan di MVP.

**Cons:** Transformasi gambar (resize/WebP/AVIF) tidak sekaya CDN gambar khusus — dikompensasi kompresi client-side (ADR-019).

**Impact:** Modul 1 (dokumen legalitas), Modul 3 (foto/video listing), Modul 6 (media proyek developer).

**Affected Documents:** `PROJECT-CONSTITUTION.md` §12 & §16, `technology-decisions.md` §4.10, `decision-log.md` ADR-007.

**Dependencies:** Bergantung ADR-004 (Database Strategy, untuk RLS). Prasyarat bagi ADR-019 (File Upload Strategy).

**Review Date:** Jika kebutuhan transformasi gambar/video bertumbuh kompleks.

**Notes:** —

---

**ADR-010 — Deployment Strategy**

**Status:** Approved
**Date:** 2026-07-27
**Owner:** Enterprise Solution Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Dibutuhkan platform hosting yang mendukung penuh fitur Next.js App Router (ISR, Edge Middleware, Image Optimization) dengan alur deploy cepat untuk tim kecil, serta repository/CI yang terintegrasi.

**Decision:** **Vercel** sebagai hosting/deployment aplikasi Next.js; **GitHub** sebagai repository dengan **GitHub Actions** untuk CI (lint, type-check, test, migration check).

**Alternatives Considered:** Self-hosted Docker+VPS/Kubernetes (beban DevOps tidak sepadan untuk tim kecil MVP); Netlify/AWS Amplify (dukungan App Router kurang seketat Vercel); GitLab/Bitbucket (tidak memberi keuntungan tambahan dibanding integrasi GitHub↔Vercel).

**Pros:** Kombinasi Next.js+Vercel native (pembuat framework sama); zero-config deploy; preview deployment per PR; edge caching bawaan mendukung target TTFB < 600ms.

**Cons:** Model harga serverless/edge dapat signifikan pada traffic sangat tinggi.

**Impact:** Seluruh pipeline deploy & environment variable management.

**Affected Documents:** `SYSTEM-ARCHITECTURE.md` §4 & §18, `technology-decisions.md` §4.11–4.13, `decision-log.md` ADR-008/009.

**Dependencies:** Bergantung ADR-021 (Frontend Framework). Prasyarat bagi ADR-015 (Monitoring).

**Review Date:** Jika biaya serverless/edge menjadi tidak proporsional terhadap traffic aktual.

**Notes:** **Gap administratif (non-blocking):** belum tercatat formal sebagai keputusan di `PROJECT-CONSTITUTION.md` §4 — lihat Bagian 5.

---

**ADR-011 — State Management Strategy**

**Status:** Approved
**Date:** 2026-07-27
**Owner:** Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Dashboard/admin panel (CSR) membutuhkan pengelolaan cache server-state; form/filter/wizard membutuhkan state UI lokal-lintas-komponen.

**Decision:** **TanStack Query** untuk server-state (khusus route group CSR); **Zustand** untuk UI state (satu store per domain UI, bukan satu store raksasa).

**Alternatives Considered:** SWR (**ditolak eksplisit** — Architecture Constraint, untuk menghindari dua library server-state berdampingan); Redux Toolkit (**ditolak eksplisit** — boilerplate berlebihan); Context API murni (tidak dioptimasi update frekuensi tinggi); Jotai/Recoil (tidak dipilih agar tidak menambah library tanpa kebutuhan jelas).

**Pros:** Automatic refetching & cache invalidation granular (TanStack Query); API minimal tanpa boilerplate (Zustand).

**Cons:** Konsep cache key/invalidation butuh pemahaman tim; tanpa disiplin, Zustand store bisa jadi "keranjang sampah" state acak.

**Impact:** Seluruh halaman `(dashboard)`/`(admin)`; halaman `(public)` tetap mengandalkan Server Component fetch (tidak memakai TanStack Query).

**Affected Documents:** `technology-decisions.md` §4.16–4.17, `dependency-manifest.md`, `decision-log.md` ADR-015/016.

**Dependencies:** Bergantung ADR-021 (Frontend Framework).

**Review Date:** Tidak ada pemicu spesifik diantisipasi.

**Notes:** **Gap administratif (non-blocking):** `SYSTEM-ARCHITECTURE.md` §10 masih memakai frasa usang "React Query/SWR — pilih satu, konsisten" — lihat Bagian 5.

---

**ADR-012 — API Architecture**

**Status:** Approved
**Date:** 2026-07-26
**Owner:** API Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Dibutuhkan konvensi REST yang konsisten (versioning, envelope, error, pagination, RBAC middleware) di seluruh endpoint 11 modul.

**Decision:** REST murni, base URL `/api/v1` (breaking change wajib naik versi), response envelope standar (`success`/`data`/`meta` atau `success`/`error`), RBAC middleware 5-langkah baku (validasi token → cek permission → resolusi scope → superadmin bypass), filter geografis berbasis ID referensi (bukan freetext), rate limiting bertingkat (60/300/5 per menit).

**Alternatives Considered:** GraphQL (tidak dipilih — tidak ada kebutuhan eksplisit query fleksibel yang mengungguli kompleksitas tambahan GraphQL untuk tim kecil); gRPC (tidak relevan untuk API publik berbasis web/mobile).

**Pros:** Konvensi matang, mudah diaudit, konsisten dengan skema ERD.

**Cons:** Lokasi fisik implementasi API kini terkunci ke Route Handlers (ADR-001, Approved) — trade-off batas eksekusi serverless Vercel yang menyertai keputusan tersebut kini berlaku langsung terhadap seluruh endpoint di sini.

**Impact:** Seluruh 11 modul PRD, seluruh endpoint `API-Specification-v1.1.md`.

**Affected Documents:** `PROJECT-CONSTITUTION.md` §8, `API-Specification-v1.1.md`, `SYSTEM-ARCHITECTURE.md` §9.

**Dependencies:** Bergantung **ADR-001 (Approved — Route Handlers + Supabase)** untuk lokasi fisik implementasi; bergantung ADR-002/003 untuk auth/RBAC middleware.

**Review Date:** Tidak ada pemicu spesifik diantisipasi — ADR-001 yang menaunginya telah diselesaikan.

**Notes:** Konvensi API (bentuk kontrak) berstatus Approved, konsisten dengan lokasi eksekusi yang kini juga terkunci final di `app/api/v1/**/route.ts` (ADR-001, Approved).

---

**ADR-013 — Error Handling Strategy**

**Status:** Approved
**Date:** 2026-07-26
**Owner:** Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Dibutuhkan penanganan error yang konsisten agar tidak membocorkan detail internal, sekaligus memudahkan tracing lintas frontend-backend.

**Decision:** Envelope error standar dengan kode `SCREAMING_SNAKE_CASE` terpusat; data privat milik user lain → 404 (bukan 403, mencegah enumerasi); percobaan akses tanpa izin RBAC → 403 informatif; validasi bisnis gagal → 422; `request_id`/`correlation_id` dikembalikan ke client dan dicatat di log server; Error Boundary React per route group.

**Alternatives Considered:** Membocorkan stack trace ke client untuk debugging cepat (ditolak — risiko keamanan); error generik tanpa kode terstruktur (ditolak — menyulitkan FE menampilkan pesan lokal yang tepat).

**Pros:** Tidak ada kebocoran detail internal; tracing presisi via `request_id`.

**Cons:** Membutuhkan disiplin tim menjaga daftar kode error terpusat tetap sinkron FE↔BE.

**Impact:** Seluruh endpoint API dan seluruh komponen frontend yang menangani response error.

**Affected Documents:** `PROJECT-CONSTITUTION.md` §13, `API-Specification-v1.1.md` §0.3.

**Dependencies:** Bergantung ADR-012 (API Architecture).

**Review Date:** Tidak ada pemicu spesifik diantisipasi.

**Notes:** —

---

**ADR-014 — Logging Strategy**

**Status:** Approved
**Date:** 2026-07-26
**Owner:** Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Dibutuhkan logging yang cukup untuk investigasi insiden, namun tidak boleh membocorkan data sensitif (finansial DBR, dokumen legalitas, PII).

**Decision:** Structured logging (JSON) dengan level `error`/`warn`/`info`/`debug`; audit log bisnis (`audit_logs`) **terpisah** dari log teknis, retensi permanen, tidak dapat dihapus/di-rotate; data sensitif (`net_income`, KTP/NPWP, password, token JWT penuh) dilarang masuk log; PII dilarang masuk data yang dikirim ke GA4/GTM.

**Alternatives Considered:** Menggabungkan audit log bisnis dengan log teknis biasa (ditolak — audit log butuh retensi permanen & tidak boleh ikut ter-rotate seperti log teknis).

**Pros:** Investigasi insiden presisi (`request_id`); audit trail bisnis (approval, perubahan role/permission) tidak dapat dihapus.

**Cons:** Membutuhkan disiplin eksplisit di kode untuk memisahkan mana yang masuk log teknis vs audit log.

**Impact:** Seluruh aksi bisnis sensitif (approval agen, moderasi listing, perubahan role/permission, perubahan konfigurasi sistem).

**Affected Documents:** `PROJECT-CONSTITUTION.md` §15, `SEO-Analytics-Specification-v1.1.md` §4.4.

**Dependencies:** Terkait ADR-015 (Monitoring & Observability).

**Review Date:** Tidak ada pemicu spesifik diantisipasi.

**Notes:** Retensi log teknis minimal 30 hari; audit log bisnis retensi permanen atau sesuai kebijakan kepatuhan yang ditentukan kemudian.

---

**ADR-015 — Monitoring & Observability**

**Status:** Approved
**Date:** 2026-07-27
**Owner:** Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Dibutuhkan error tracking & performance monitoring untuk frontend (Next.js) dan lapisan API.

**Decision:** **Sentry** (`@sentry/nextjs`) sebagai tool monitoring resmi — source map otomatis, performance tracing untuk mendeteksi regresi Core Web Vitals/TTFB.

**Alternatives Considered:** Datadog, self-hosted Grafana+Loki (jauh lebih kompleks & mahal untuk kebutuhan MVP); LogRocket (lebih fokus session replay dibanding error/performance tracing).

**Pros:** SDK resmi terintegrasi App Router (server & client components, edge runtime).

**Cons:** Volume error/tracing tinggi dapat memakan kuota paket berbayar — perlu sampling rate wajar.

**Impact:** Seluruh error runtime frontend & backend.

**Affected Documents:** `technology-decisions.md` §4.15, `dependency-manifest.md`.

**Dependencies:** Bergantung ADR-010 (Deployment), ADR-014 (Logging).

**Review Date:** Tidak ada pemicu spesifik diantisipasi.

**Notes:** **Gap administratif (non-blocking):** belum disinkronkan ke `SYSTEM-ARCHITECTURE.md` §23 yang masih mencatatnya kosong — lihat Bagian 5. Data sensitif (`net_income`, KTP/NPWP, token JWT penuh) dilarang masuk breadcrumb/context Sentry (konsisten ADR-014).

---

**ADR-016 — Testing Strategy**

**Status:** Approved
**Date:** 2026-07-27
**Owner:** Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Dibutuhkan unit/component/E2E testing untuk business logic sensitif, interaksi form/dashboard, dan alur kritis lintas halaman.

**Decision:** **Vitest** (unit testing), **React Testing Library** (component testing), **Playwright** (E2E testing, dijalankan terhadap `next build && next start`, bukan `next dev`).

**Alternatives Considered:** Jest (valid, Vitest dipilih untuk performa & kompatibilitas ESM/TypeScript); Enzyme (tidak kompatibel React Server Components); Cypress (secara historis lebih terbatas pada multi-tab/multi-origin testing yang relevan untuk alur OAuth Google).

**Pros:** Kombinasi tiga tool saling melengkapi tanpa tumpang tindih fungsi; Playwright cocok untuk alur OAuth lintas origin.

**Cons:** E2E lebih lambat dibanding unit test — butuh strategi seleksi alur kritis.

**Impact:** Business logic sensitif (kalkulasi DBR, filter `granted_scope`, ownership check) wajib unit test; alur kritis (registrasi, publish listing, submit DBR, moderasi admin) wajib E2E.

**Affected Documents:** `technology-decisions.md` §4.20–4.22, `dependency-manifest.md`.

**Dependencies:** Bergantung ADR-012 (API Architecture), ADR-021 (Frontend Framework).

**Review Date:** Tidak ada pemicu spesifik diantisipasi.

**Notes:** **Gap dokumentasi (bukan gap keputusan tool):** `foundation-validation-report.md` Bagian 15 mencatat **belum ada dokumen Testing Strategy/Test Plan konsolidasi** (target coverage, strategi data uji, lingkungan test, kriteria rilis) — tool sudah diputuskan (status Approved di atas tetap berlaku), namun dokumen strategi menyeluruh masih menjadi Missing Document terpisah, direkomendasikan disusun sebagai tindak lanjut, tidak memblokir status Approved keputusan tool ini.

---

**ADR-017 — Security Strategy**

**Status:** Approved
**Date:** 2026-07-25/26
**Owner:** Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Platform menangani data sensitif (dokumen legalitas agen, data finansial DBR calon pembeli) dan membutuhkan proteksi berlapis terhadap akses tidak sah.

**Decision:** Enkripsi at-rest wajib untuk dokumen legalitas & field finansial DBR; RLS+middleware RBAC berlapis (ADR-003); tidak ada trust terhadap input client (validasi ulang server); signed URL berumur pendek untuk dokumen privat; API key pihak ketiga dipisah client-key/server-key; rate limiting bertingkat; audit trail tidak dapat dihapus; minimal 1 akun Superadmin aktif dijamin di level aplikasi; PII tidak masuk log/Analytics; cookie consent + Google Consent Mode.

**Alternatives Considered:** Tidak ada trade-off keamanan yang dilonggarkan demi kemudahan development — seluruh hard rule dinyatakan non-negotiable di dokumen sumber.

**Pros:** Salah satu dimensi paling matang di seluruh dokumentasi proyek (skor 88/100 di `foundation-validation-report.md`).

**Cons:** Tidak ada catatan trade-off signifikan.

**Impact:** Lintas seluruh modul, khususnya Modul 1 (dokumen legalitas), Modul 7 (data finansial DBR), Modul 10 (RBAC).

**Affected Documents:** `PROJECT-CONSTITUTION.md` §20, `SYSTEM-ARCHITECTURE.md` §14, `API-Specification-v1.1.md` §0.

**Dependencies:** Menaungi ADR-002, ADR-003, ADR-009, ADR-019.

**Review Date:** Tidak ada pemicu spesifik diantisipasi — ditinjau ulang jika insiden keamanan nyata terjadi pasca-rilis.

**Notes:** RLS policy SQL konkret belum dapat diverifikasi karena skema fisik belum ada — wajar, bagian dari Database Schema Alignment mendatang.

---

**ADR-018 — Caching Strategy (Application-Level / Rate Limiting)**

**Status:** APPROVED
**Date:** 2026-07-31
**Owner:** Principal Software Architect (nama TBD — konsisten catatan terbuka OD-06)

**Context:** Platform menangani endpoint sensitif (login, register, forgot-password, submit form publik) yang wajib memiliki rate limiting bertingkat sesuai hard rule ADR-017 (Security Strategy)/`PROJECT-CONSTITUTION.md` §20, namun belum ada mekanisme penyimpanan status lintas-instance yang eksplisit di lingkungan serverless (Vercel Functions). Keputusan ini sebelumnya digantung pada hasil ADR-006 (Job Queue) — jika BullMQ dipilih, Redis otomatis tersedia untuk kebutuhan ini sekaligus. ADR-006 telah final memilih Vercel Cron Jobs + Postgres Trigger/Database Webhook **tanpa** Redis, sehingga ADR-018 menjadi sepenuhnya independen dan memerlukan keputusan tersendiri — dievaluasi melalui sesi Architecture Review Board terpisah (31 Juli 2026).

**Decision:** Rate limiting dan application-level caching Fase 1 (MVP) diimplementasikan **secara native di atas Supabase Postgres**, melalui tabel dedicated `rate_limit_log` dengan pola sliding window, **tanpa** menambah infrastruktur cache/in-memory-store baru (Redis/Upstash/Vercel KV) pada tahap ini. Caching edge/CDN untuk halaman publik **tetap** inheren dari ADR-021 (Next.js ISR) & ADR-010 (Vercel edge caching) — tidak berubah, tidak memerlukan keputusan tambahan. Migrasi ke **Upstash Redis** (Approved Alternative untuk Fase 2) sah dilakukan hanya setelah salah satu kriteria ambang berikut tercapai **dan** disetujui manusia berwenang:
- Volume request ke endpoint sensitif >10.000 request/menit gabungan, ATAU
- Query `rate_limit_log` terukur menyumbang >15% total load database utama (via monitoring Supabase), ATAU
- Kebutuhan cache aplikasi generik (bukan hanya rate limit) muncul dari modul lain (mis. dashboard/laporan admin bervolume besar) yang tidak dapat dipenuhi index Postgres secara wajar.

**Rationale:** Konsisten dengan pola native-first-lalu-upgrade yang sudah tervalidasi di ADR-005 (Search), ADR-006 (Job Queue), dan ADR-008 (Maps) — seluruhnya memilih solusi native/murah di atas infrastruktur yang sudah ada di Fase 1, dengan jalur migrasi terjadwal berbasis kriteria ambang eksplisit di Fase 2. Volume request endpoint sensitif secara alami jauh lebih rendah dari traffic listing/search publik, sehingga Postgres dengan index komposit yang tepat cukup untuk kebutuhan ini di skala MVP. Pendekatan ini juga selaras dengan larangan instalasi infrastruktur preventif yang sudah ditegaskan berulang (Golden Rule ADR-005/006/008) dan menghasilkan nol dependency/vendor baru untuk dipantau tim yang masih kecil.

**Alternatives Considered:**
- **Upstash Redis** (serverless REST-based): unggul di skalabilitas & Developer Experience, ditolak untuk Fase 1 karena menambah vendor baru yang belum diperlukan volume traffic MVP; diadopsi sebagai jalur migrasi Fase 2.
- **Vercel KV**: mirip Upstash namun risiko lock-in lebih dalam ke ekosistem Vercel; tidak dipilih sebagai default migrasi karena risiko vendor lock-in lebih tinggi dibanding Upstash mandiri.
- **Self-hosted/traditional Redis**: ditolak — koneksi TCP persisten tidak kompatibel dengan model serverless (konsisten alasan penolakan BullMQ di ADR-006).
- **Tanpa cache aplikasi tambahan sama sekali**: ditolak — tidak memenuhi hard rule ADR-017 secara konkret, meninggalkan gap keamanan.

**Pros/Cons:** *(Postgres-native, dipilih)* Pro: nol biaya tambahan, nol vendor baru, implementasi konsisten pola existing (ADR-005/006/008), risiko vendor lock-in terendah; Con: performa rate-limit check sedikit lebih lambat dibanding Redis murni (low-single-digit ms vs sub-ms) — diterima karena volume MVP rendah, dan tabel `rate_limit_log` berpotensi menjadi hot table jika traffic melonjak jauh di luar perkiraan (dimitigasi kriteria ambang migrasi & kebijakan retensi baris).

**Consequences:** Menambah satu tabel baru (`rate_limit_log`) ke ERD dengan index komposit `(identifier, action_type, window_start)`; endpoint sensitif wajib mengembalikan `429 Too Many Requests` + header `Retry-After` sesuai konvensi `API-Specification-v1.1.md` §0; kebijakan retensi baris (hapus >7 hari) memanfaatkan mekanisme Vercel Cron yang sudah ada dari ADR-006 tanpa infrastruktur job baru; tim wajib memantau kriteria ambang migrasi secara berkala pasca-launch.

**Impact:** Lintas modul (rate limiting Auth sebagai prioritas utama, Modul 1), relevan mulai Sprint S1; performa dashboard/laporan admin bervolume besar di modul lain jika kelak membutuhkan cache aplikasi generik.

**Affected Documents:** `technology-decisions.md`, `dependency-manifest.md`, `SYSTEM-ARCHITECTURE.md` §14, `ERD-Skema-Database-Real-Estate-Agency-v1.1.md` (+ diagram Mermaid), `API-Specification-RUMAHAGEN-v1.1.md` §0, `PROJECT-CONSTITUTION.md` §10/§20, `development-playbook.md`, `decision-log.md`, `CHANGELOG.md`, `CURRENT-PROJECT-STATE.md`, `project-manifest.md`, `document-governance-baseline-register.md`.

**Dependencies:** Sebelumnya terkait ADR-006 (Job Queue) — kini independen sepenuhnya karena ADR-006 final tanpa Redis.

**Review Date:** Ditinjau ulang saat salah satu kriteria ambang migrasi di atas tercapai, atau maksimal setiap akhir kuartal pasca-launch sebagai pemeriksaan rutin — mana yang lebih dulu tercapai (konsisten pola review ADR-005).

**Notes:** Menutup ADR terakhir yang berstatus OPEN di seluruh proyek — **25 dari 25 ADR arsitektur kini Approved**. Struktur tabel final, algoritma sliding window presisi, dan threshold angka per jenis endpoint (mis. jumlah percobaan login sebelum blokir) **belum ditentukan di ADR ini** — merupakan keputusan desain teknis rinci untuk Database Schema Alignment/Sprint S1, bukan cakupan keputusan arsitektur. Disahkan via sesi Architecture Review Board 31 Juli 2026 (lihat `ADR-018-Caching-Strategy-Review.md` untuk rincian proses lengkap: alternatif, tabel perbandingan, dan rekomendasi CTO). Cross-reference: `decision-log.md` `ADR-042`.

---

**ADR-019 — File Upload Strategy**

**Status:** Approved
**Date:** 2026-07-26/27
**Owner:** Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Foto listing (publik, wajib minimal 3) dan dokumen legalitas agen (privat, sensitif) membutuhkan alur upload yang aman dan efisien bandwidth.

**Decision:** Validasi tipe file di server via magic bytes/MIME type (bukan hanya ekstensi); kompresi gambar sisi client via **browser-image-compression** sebelum upload; `alt_text` wajib per foto (auto-generate fallback); satu foto cover aktif per listing; dokumen legalitas tidak pernah lewat CDN publik.

**Alternatives Considered:** Kompresi server-side penuh (Sharp)/CDN transformation sebagai satu-satunya lapisan (ditolak — menambah beban proses di serverless function; pendekatan hybrid dipilih).

**Pros:** Kompresi client mengurangi bandwidth & beban server; validasi server tetap jadi lapisan keamanan utama.

**Cons:** Kompresi client bergantung kemampuan device pengguna di lapangan — tetap perlu validasi ulang di server.

**Impact:** Modul 3 (foto/video listing), Modul 1 (dokumen legalitas).

**Affected Documents:** `PROJECT-CONSTITUTION.md` §16, `technology-decisions.md` §4.28.

**Dependencies:** Bergantung ADR-009 (Storage Strategy).

**Review Date:** Tidak ada pemicu spesifik diantisipasi.

**Notes:** Batas ukuran/durasi video/virtual tour belum ada angka final di dokumen sumber — wajib configurable, bukan hard-code.

---

**ADR-020 — Notification Strategy**

**Status:** Approved
**Date:** 2026-07-26/27
**Owner:** Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Sistem membutuhkan mekanisme pemberitahuan lintas modul (approval agen, moderasi listing, review agen baru, kursus baru, event registrasi) ke pengguna yang relevan.

**Decision:** Tabel `notifications` (Modul 8) sebagai sumber kebenaran, ditulis lewat satu service terpusat (bukan ditulis langsung dari banyak tempat). Channel: **in-app** (selalu) + **email** (via Resend, ADR-007) untuk event penting (approval/reject, OTP, reminder). WhatsApp/push notification dicatat sebagai kemungkinan fase lanjutan.

**Alternatives Considered:** Menulis langsung ke tabel `notifications` dari tiap modul tanpa service terpusat (ditolak — risiko format/state tidak konsisten).

**Pros:** Satu titik kontrol format & konsistensi notifikasi lintas modul.

**Cons:** Channel WhatsApp/push belum tersedia di MVP — perlu ekspektasi yang jelas ke stakeholder bisnis.

**Impact:** Modul 8 (Dashboard & Notifikasi), dipicu dari Modul 1, 2, 3, 4, 5, 6, 9.

**Affected Documents:** `ERD-Skema-Database-v1.1.md` (`notifications`), `PRD-v1.1.md` Modul 8, `decision-log.md` ADR-010 (Resend).

**Dependencies:** Bergantung ADR-007 (Email Provider).

**Review Date:** Jika kebutuhan channel WhatsApp Business API/push notification dikonfirmasi bisnis.

**Notes:** Kedalaman endpoint API untuk Modul 8 dicatat oleh `foundation-validation-report.md` sebagai perlu diperluas saat API Alignment — tidak mengubah status Approved keputusan strategi ini.

---

**ADR-021 — Frontend Framework & Rendering Strategy**

**Status:** Approved
**Date:** 2026-07-26
**Owner:** Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Seluruh halaman publik wajib SSR/SSG/ISR agar terindeks mesin pencari secepat & seakurat mungkin sejak hari pertama rilis; halaman privat sebaliknya harus dicegah dari indeks.

**Decision:** **Next.js (App Router)** sebagai satu-satunya framework frontend. Homepage/Search/Detail Listing/Profil Agen/Detail Proyek Developer → SSR/SSG/ISR; Dashboard/Admin/hasil DBR personal/Chat → CSR dengan `noindex, nofollow`; halaman statis → SSG.

**Alternatives Considered:** Remix (ekosistem lebih kecil, dukungan Vercel-native lebih lemah); Astro (kurang cocok aplikasi interaktif kompleks); SPA React murni + backend terpisah (gagal memenuhi syarat SSR wajib).

**Pros:** Satu-satunya pilihan arus utama yang memenuhi seluruh syarat SSR/SSG/ISR wajib sekaligus ekosistem React penuh & integrasi native Vercel.

**Cons:** Kurva belajar App Router (Server Components, model caching).

**Impact:** Seluruh struktur route group, strategi SEO, dan pilihan hosting (ADR-010).

**Affected Documents:** `PROJECT-CONSTITUTION.md` §4, `SEO-Analytics-Specification-v1.1.md` §1.1, `technology-decisions.md` §4.1, `decision-log.md` ADR-001/031.

**Dependencies:** Prasyarat bagi ADR-001, ADR-010, ADR-011, ADR-016.

**Review Date:** Tidak ada pemicu spesifik diantisipasi — keputusan fondasi jangka panjang.

**Notes:** —

---

**ADR-022 — Database Schema Conventions**

**Status:** Approved
**Date:** 2026-07-25/26
**Owner:** Database Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Dibutuhkan konvensi seragam (penamaan, index, migration) agar 37+ entitas ERD konsisten dan mudah diaudit.

**Decision:** `snake_case` untuk tabel (jamak)/kolom/enum; `{referenced_table_singular}_id` untuk FK; index wajib sejak migrasi awal (bukan ditambah belakangan) sesuai daftar prioritas ERD; UNIQUE index untuk seluruh kolom `slug`; migration murni SQL bernomor urut.

**Alternatives Considered:** Penamaan campuran/tidak konsisten antar tim (ditolak — menyulitkan AI Coding Assistant lintas sesi memprediksi nama field).

**Pros:** Prediktabilitas tinggi untuk AI Coding Assistant & developer baru.

**Cons:** Tidak ada trade-off signifikan dicatat.

**Impact:** Seluruh migration & query di seluruh modul.

**Affected Documents:** `PROJECT-CONSTITUTION.md` §7 & §9, `ERD-Skema-Database-v1.1.md`.

**Dependencies:** Bagian dari ADR-004 (Database Strategy).

**Review Date:** Tidak ada pemicu spesifik diantisipasi.

**Notes:** Sebagian tumpang tindih dengan ADR-004 secara sengaja — dipisah agar konvensi penamaan dapat dirujuk independen dari keputusan pemilihan PostgreSQL itu sendiri.

---

**ADR-023 — Multi-Tenancy Strategy**

**Status:** Approved (implisit, untuk cakupan saat ini) — evaluasi masa depan berstatus **Proposed**
**Date:** —
**Owner:** —

**Context:** Skema ERD saat ini tidak memiliki kolom `tenant_id` di manapun — seluruh entitas diasumsikan satu instans aplikasi melayani satu basis data bersama (single-tenant).

**Decision:** Arsitektur **single-tenant** berlaku secara implisit dari struktur skema yang sudah ada (tidak ada dokumen yang secara eksplisit mendiskusikan/menolak multi-tenancy — ini adalah keadaan default berdasarkan tidak-adanya kebutuhan yang dinyatakan). Kebutuhan **multi-tenant** dicatat sebagai **Future Decision berstatus Proposed** di `decision-log.md` Bagian 10 — bukan kebutuhan aktif.

**Alternatives Considered:** Multi-tenant dengan `tenant_id` di setiap tabel (belum dievaluasi — tidak ada kebutuhan bisnis yang mendorongnya saat ini).

**Pros:** Kesederhanaan skema & RLS policy untuk kebutuhan saat ini (satu agensi, banyak agen).

**Cons:** Jika kebutuhan white-label/multi-agensi muncul di masa depan, akan memerlukan migrasi skema besar-besaran (`tenant_id` + penyesuaian RLS menyeluruh).

**Impact:** Seluruh skema ERD saat ini disusun dengan asumsi single-tenant.

**Affected Documents:** `ERD-Skema-Database-v1.1.md`, `decision-log.md` Bagian 10 (Future Decisions — Multi Tenant).

**Dependencies:** Terkait ADR-004 (Database Strategy).

**Review Date:** Jika kebutuhan bisnis multi-agensi/white-label dikonfirmasi eksplisit di masa depan.

**Notes:** Dicatat di sini untuk mendokumentasikan keputusan implisit yang sebelumnya tidak pernah dinyatakan eksplisit di ADR manapun — bukan keputusan baru, hanya formalisasi keadaan yang sudah berlaku.

> **Update 2026-08-03 — Status diperbarui (bukan digantikan/Superseded).** Melalui sesi Architecture Review Board yang sama dengan pengesahan **ADR-026** (Organization Model Strategy), status ADR ini direvisi menjadi: **"Approved (implisit, cakupan awal) — Diaktifkan sebagian melalui ADR-026 dalam bentuk lebih ringan dari skenario `tenant_id` penuh yang diantisipasi semula. Skenario multi-tenant klasik (isolasi penuh/white-label) tetap berstatus Proposed untuk future decision terpisah."** `organization_id` yang diperkenalkan ADR-026 adalah **grouping construct** dalam database bersama (satu agensi, agen-agen di dalamnya dapat membentuk/bergabung Organization) — **bukan** implementasi `tenant_id` yang tadinya dibayangkan ADR ini (isolasi data lintas agensi/white-label penuh). Keputusan inti ADR-023 (single-tenant, tidak ada `tenant_id`) **tidak berubah** — update ini murni mengklarifikasi bahwa ADR-026 tidak mengaktifkan skenario multi-tenant klasik yang sebelumnya diantisipasi dokumen ini. Kebutuhan multi-tenant klasik (jika platform ini di-white-label ke banyak agensi terpisah di masa depan) tetap menjadi keputusan terbuka yang berbeda, tidak terjawab oleh ADR-026. Lihat ADR-026 untuk detail lengkap; cross-reference `decision-log.md` **ADR-043**.

---

**ADR-024 — RBAC Role Model Scope (Formalisasi Role & Cakupan Manager)**

**Status:** Approved
**Date:** 2026-07-26
**Owner:** Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Dokumen v1.0 tidak konsisten mengenai keberadaan role `buyer`/`instructor` dan cakupan akses Manager (lihat resolusi konflik v1.0→v1.1).

**Decision:** `buyer` (akun ringan opsional) dan `instructor` (role internal terbatas Modul 4) diformalkan sebagai baris resmi tabel `roles`. Manager **selalu** `granted_scope = 'all'` — tidak ada mode "scoped tim/wilayah".

**Alternatives Considered:** Buyer = Agent dengan flag tambahan (ditolak — mencampur domain kepemilikan listing dengan domain pencarian); Instructor = alias Admin (ditolak — Instructor tidak boleh punya akses moderasi listing/RBAC); level `granted_scope` tambahan untuk Manager regional (ditolak untuk rilis ini).

**Pros:** Menghilangkan ambiguitas lintas dokumen; permission matrix eksplisit per role.

**Cons:** Menambah 2 baris seed `roles`; permission matrix perlu didefinisikan eksplisit sebelum fitur terkait aktif.

**Impact:** Seluruh RBAC middleware, seed data Sprint S0.

**Affected Documents:** `PROJECT-CONSTITUTION.md` Riwayat Keputusan Arsitektur #1–#3, `ERD-Skema-Database-v1.1.md` §2.28, `decision-log.md` ADR-032/033.

**Dependencies:** Bagian dari ADR-003 (Authorization & RBAC Strategy).

**Review Date:** Jika kebutuhan bisnis "Manager per wilayah" muncul eksplisit.

**Notes:** **RESOLVED 4 Agustus 2026 (OD-02)** — daftar role bernama sudah jelas: superadmin, manager, admin, instructor, agent, developer_partner, buyer = **7 role dengan akun**, ditambah Guest tanpa baris `roles`. Tidak ada lagi drift "7 vs 8" di dokumen turunan.

---

**ADR-025 — Type Safety & Validation Strategy**

**Status:** Approved
**Date:** 2026-07-26/27
**Owner:** Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-06

**Context:** Dibutuhkan satu sumber kebenaran tipe data & aturan validasi yang konsisten di frontend dan backend, mengingat kompleksitas RBAC/ownership yang rawan bug jika tidak bertipe statis.

**Decision:** **TypeScript** (`strict: true`, tanpa `any` implisit) di seluruh codebase; **Zod** sebagai satu-satunya skema validasi (dengan `z.infer` untuk tipe otomatis), dipakai baik client (React Hook Form resolver) maupun server (validasi ulang wajib sebelum tulis DB).

**Alternatives Considered:** JavaScript murni (ditolak — tidak mendukung Single Source of Truth tipe data); Yup/Joi (tidak memiliki inferensi tipe TypeScript native sekuat Zod).

**Pros:** Deteksi error compile-time; refactor besar lebih aman; validasi client & server tidak pernah drift karena berasal dari skema yang sama.

**Cons:** Build time lebih lambat dibanding JS murni; skema kondisional kompleks (mis. konversi tenor tahun→bulan) butuh `.refine()`/`.transform()` yang perlu didokumentasikan.

**Impact:** Seluruh codebase frontend & backend, seluruh form dan endpoint mutating.

**Affected Documents:** `PROJECT-CONSTITUTION.md` §6 & §14, `technology-decisions.md` §4.2 & §4.19, `decision-log.md` ADR-002/017/018/034.

**Dependencies:** Prasyarat bagi ADR-012 (API Architecture), ADR-016 (Testing).

**Review Date:** Tidak ada pemicu spesifik diantisipasi.

**Notes:** Satuan tenor DBR selalu bulan (`tenor_months`) — konversi tahun→bulan hanya boleh terjadi di satu titik (layer validasi client), tidak diduplikasi.

---

**ADR-026 — Organization Model Strategy**

**Status:** APPROVED WITH NOTES
**Date:** 2026-08-03
**Owner:** Architecture Review Board (CTO, Principal Software Architect, Enterprise Solution Architect, Senior Backend Architect, Senior Frontend Architect, Cloud Architect, Database Architect, Security Architect, AI Development Architect, Technical Lead) — pengesahan formal final tetap memerlukan konfirmasi Technical Lead/CTO manusia sesuai Bagian 9 (Governance Rules)

**Context:** Business Owner mengusulkan lapisan organisasi baru ("Organization") yang memungkinkan agen bekerja dalam konteks individu maupun tim, tanpa mengubah model akun/role platform yang sudah ada. Kebutuhan ini sebelumnya sudah dicatat sebagai *Future Decision Proposed* di ADR-023 dan disinggung sebagai catatan kondisional terbuka di ADR-006 (status resmi fitur "Agent Workspace" di roadmap). Diajukan lewat `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md`, disusun berdasarkan diskusi Business Owner–ChatGPT dan klarifikasi lanjutan Business Owner–Claude (33 keputusan bisnis final, lihat proposal Bagian 5).

**Decision:** Menambahkan 3 entitas baru — `organizations`, `organization_members`, `organization_invitations` — dan dimensi baru `organization_status` (`individual`/`leader`/`member`) pada level akun agen, terpisah dari `roles.code` platform. `organization_invitations` menampung **dua arah inisiasi** dalam satu tabel: Leader mengundang Agen (`leader_invite`), atau Agen mengajukan diri ke Organization (`agent_request`), dibedakan lewat `initiated_by_type`. Listing memperoleh 2 atribut baru: `listing_origin` (immutable, `personal`/`organization`) dan `listing_context` (mutable). Satu agen dibatasi maksimal 1 keanggotaan Organization aktif (ditegakkan UNIQUE index `organization_members(agent_id) WHERE status='active'`). Tidak ada mekanisme transfer kepemimpinan — Organization melekat pada Leader-nya, bubar otomatis saat Leader keluar/menutup, dengan listing member kembali sebagai Draft Pribadi (tidak pernah hilang). Pembuatan Organization bersifat self-service penuh tanpa moderasi Admin.

**Alternatives Considered:**
- *Multi-tenant penuh dengan `tenant_id` di seluruh tabel inti* (sesuai bayangan awal ADR-023) — ditolak; kebutuhan aktual adalah grouping/organisasi dalam satu database bersama, bukan isolasi data antar-tenant untuk white-labeling.
- *Organization sebagai role baru* (bukan entitas terpisah) — ditolak Business Owner sejak awal; mencampur "siapa Anda" (role) dengan "Anda bekerja sebagai apa saat ini" (status organisasi).
- *Multi-organization membership per agen* — ditolak eksplisit, demi kesederhanaan model data dan menghindari ambiguitas listing/dashboard mana yang relevan.
- *Fitur Transfer Kepemimpinan Organization* — ditolak eksplisit oleh Business Owner; Organization yang Leader-nya keluar langsung bubar, bukan dialihkan.
- *Tabel terpisah untuk Join Request* (`organization_join_requests`, di luar `organization_invitations`) — ditolak; akan menduplikasi state machine status/expiry/race-condition-check, berisiko drift antara dua tabel yang seharusnya berbagi satu sumber kebenaran.
- *Auto-accept Join Request tanpa approval Leader* — ditolak eksplisit; approval manual Leader wajib di semua kasus, tanpa toggle/pengecualian.
- *Moderasi/approval Admin untuk pembuatan Organization* — ditolak; self-service permanen, gating masa depan (jika ada) lewat poin keaktifan/subscription berbayar, bukan moderasi manual.

**Pros:** Model data tetap sederhana (1 agen = maksimal 1 Organization); tidak ada kehilangan data (listing selalu kembali ke pemilik asal saat Organization bubar/agen keluar); konsisten dengan prinsip "business logic terpisah dari role akun" yang sudah dipakai proyek ini di ADR-024; reuse satu tabel `organization_invitations` untuk dua arah inisiasi mencegah duplikasi state machine; timing strategis optimal — proyek masih Pre-Phase 0 (0% kode), perubahan dapat masuk baseline sebelum implementasi dimulai.

**Cons:** Menambah kompleksitas skema (3 tabel baru + FK baru di `listings`/`audit_logs`); RLS policy perlu diperluas untuk mencakup akses berbasis `organization_id`; race condition re-check status Individual wajib ditegakkan simetris di kedua arah inisiasi (Accept invite maupun Approve join request) — kompleksitas implementasi non-trivial di Sprint terkait.

**Impact:** `ERD-Skema-Database-RUMAHAGEN-v1.1.md` (3 tabel baru + modifikasi aditif `listings`/`audit_logs`, nilai enum baru `archived` pada `listings.status`), `PRD-RUMAHAGEN-v1.1.md` (Modul 12 baru — Organization Management), `API-Specification-RUMAHAGEN-v1.1.md` (endpoint group `/organizations/*`), `User-Flow-RUMAHAGEN-v1.1.md` (10 flow baru), `SEO-Analytics-Specification-RUMAHAGEN-v1.1.md` (URL pattern `/organization/[slug]`, structured data `Organization`), `SYSTEM-ARCHITECTURE.md` §5 (Module Architecture — Modul 12 baru), §7 (Database Architecture), §24 (ADR Cross-Reference Matrix). **Catatan cakupan siklus ini:** kelima dokumen sumber v1.1 (PRD/ERD/API Spec/User Flow/SEO Spec) **tidak** disentuh pada siklus governance saat ini — dijadwalkan sebagai paket terpisah menyusul (lihat `CURRENT-PROJECT-STATE.md` & `project-manifest.md` untuk status "Governance Approved, ERD/API/PRD Alignment belum dieksekusi").

**Affected Documents:** `PROJECT-CONSTITUTION.md` (Riwayat Keputusan Arsitektur, Bagian 22), `technology-decisions.md`, `SYSTEM-ARCHITECTURE.md` §5/§7/§24, `dependency-manifest.md` (tidak ada package baru), `development-playbook.md`, `decision-log.md` (**ADR-043**), `CHANGELOG.md`, `CURRENT-PROJECT-STATE.md`, `document-governance-baseline-register.md`, `project-manifest.md`.

**Dependencies:** Merevisi status ADR-023 (Multi-Tenancy Strategy — lihat catatan Update pada entri ADR-023 di atas). Berkaitan erat dengan **ADR-027** (Organization-Scoped Authorization Strategy) sebagai lapisan otorisasi pendampingnya.

**Review Date:** Jika kebutuhan multi-organization-membership per agen atau white-labeling penuh (multi-tenant klasik) dikonfirmasi eksplisit di masa depan — akan memerlukan ADR baru yang men-supersede sebagian ADR ini.

**Notes:** Diselesaikan melalui sesi Architecture Review Board (3 Agustus 2026), berdasarkan draft ADR yang sudah disiapkan lengkap di `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md` Bagian 8 — sesi Board memverifikasi kelengkapan Context/Decision/Alternatives/Pros/Cons, bukan menyusun dari nol. Keputusan akhir berstatus **APPROVED WITH NOTES** — dua catatan kondisional dari Board, keduanya non-blocking terhadap pengesahan ADR ini: (1) mekanisme penegakan immutability `listing_origin` (aplikasi vs. trigger DB `BEFORE UPDATE`) belum diputuskan presisi — direkomendasikan diselesaikan saat Technical Specification, opsional menambah trigger jika proteksi level-DB diinginkan; (2) keberlakuan nilai enum baru `archived` pada `listings.status` untuk listing yang tidak pernah masuk Organization perlu konfirmasi kecil saat ERD final (diasumsikan ya — generik, tidak eksklusif konteks Organization). ADR ini **tidak** mengaktifkan skenario multi-tenant klasik yang dibayangkan ADR-023 (isolasi `tenant_id` penuh) — lihat catatan Update pada ADR-023.

> **Update 2026-08-03 — Catatan kondisional #1 diresolusi (bukan keputusan baru, penutupan catatan Approved With Notes).** Business Owner mengonfirmasi **Opsi B — pertahanan berlapis (aplikasi + trigger database)**: (a) layer aplikasi (service/Route Handler `PATCH /listings/:id`) tidak pernah menyertakan `listing_origin` dalam daftar field yang boleh diubah — ditolak di validasi Zod sebelum mencapai database; (b) **tambahan** trigger Postgres `BEFORE UPDATE` pada tabel `listings` yang menolak (raise exception) setiap percobaan mengubah nilai `listing_origin`, apa pun jalur masuknya (termasuk akses SQL langsung, migration script keliru, atau bug di service lain). Alasan memilih pertahanan berlapis alih-alih aplikasi saja: konsisten dengan preseden hard rule ownership Agen yang sudah dipakai proyek ini (`SYSTEM-ARCHITECTURE.md` Bagian 8) — aturan yang bersifat *invariant* (bukan validasi bisnis yang fleksibel) selalu ditegakkan di lebih dari satu titik. Trigger referensi:
> ```sql
> CREATE OR REPLACE FUNCTION prevent_listing_origin_update()
> RETURNS TRIGGER AS $$
> BEGIN
>   IF NEW.listing_origin IS DISTINCT FROM OLD.listing_origin THEN
>     RAISE EXCEPTION 'listing_origin is immutable and cannot be changed after creation (attempted % -> %)', OLD.listing_origin, NEW.listing_origin;
>   END IF;
>   RETURN NEW;
> END;
> $$ LANGUAGE plpgsql;
>
> CREATE TRIGGER trg_prevent_listing_origin_update
> BEFORE UPDATE ON listings
> FOR EACH ROW
> EXECUTE FUNCTION prevent_listing_origin_update();
> ```
> Trigger ini wajib masuk migration awal Modul 12 (bukan ditambahkan belakangan) saat paket sinkronisasi `ERD-Skema-Database-...v1.1.md` dieksekusi. **Catatan kondisional #1 kini tertutup — tersisa 1 dari 2 catatan kondisional ADR-026** (nilai `archived`, menunggu konfirmasi saat ERD final). Cross-reference: `decision-log.md` `ADR-043`.

> **Update 2026-08-03 (lanjutan) — Catatan kondisional #2 diresolusi.** Business Owner mengonfirmasi asumsi awal Board: nilai enum `archived` pada `listings.status` **berlaku generik untuk seluruh listing**, tanpa memandang `listing_origin`-nya (`personal` maupun `organization`) — **bukan** status yang eksklusif hanya tersedia untuk listing yang pernah masuk Organization. Agen individu yang tidak pernah bergabung Organization tetap dapat meng-archive listing miliknya sendiri dengan cara yang sama persis. Tidak ada kolom/flag tambahan untuk membedakan "archived by Organization context" vs "archived murni personal" — satu nilai status, satu perilaku, di seluruh skema. **Dengan ini, kedua catatan kondisional ADR-026 sudah tertutup penuh** — tidak ada lagi item yang menggantung dari ADR ini menjelang paket sinkronisasi ERD. Cross-reference: `decision-log.md` `ADR-043`.

---

**ADR-027 — Organization-Scoped Authorization Strategy**

**Status:** APPROVED
**Date:** 2026-08-03
**Owner:** Architecture Review Board (CTO, Principal Software Architect, Enterprise Solution Architect, Security Architect, Senior Backend Architect, Database Architect, Technical Lead) — pengesahan formal final tetap memerlukan konfirmasi Technical Lead/CTO manusia sesuai Bagian 9 (Governance Rules)

**Context:** ADR-024 mengunci `permissions.scope_type` hanya pada 3 nilai (`all`/`own`/`none`) dan secara eksplisit **menolak** level "scoped tim/wilayah" — dirancang khusus untuk menjaga akses Manager selalu global tanpa pengecualian. Kebutuhan Organization (ADR-026) memperkenalkan otorisasi berbasis kelompok (Leader CRUD penuh listing Organization-nya, Member CRUD milik sendiri + Read anggota lain) yang secara literal terlihat seperti "scoped tim" yang dilarang ADR-024.

**Decision:** Otorisasi Organization **tidak** mengubah atau memperluas `permissions`/`role_permissions`/`scope_type` yang sudah ada — sistem itu tetap murni mengatur role platform (superadmin/manager/admin/instructor/agent/dst.) dan **tetap tidak punya pengecualian tim/wilayah**, persis seperti yang dikunci ADR-024. Otorisasi Organization dibangun sebagai **lapisan kedua yang independen**, dievaluasi setelah gate role platform lolos: middleware mengecek `organization_members.role` (Leader/Member) + `organization_members.organization_id` terhadap `listings.organization_id` untuk menentukan hak CRUD pada Organization Listing. Dua sistem otorisasi ini berjalan paralel, tidak saling menggantikan.

**Alternatives Considered:**
- *Menambah nilai `scope_type` keempat* (mis. `organization`) ke tabel `permissions` yang sudah ada — ditolak; akan membuat ADR-024 secara harfiah tidak konsisten dengan implementasinya sendiri (dokumen itu eksplisit hanya 3 nilai valid), berisiko drift ambigu dengan larangan "scoped Manager" yang justru ingin dihindari.
- *Menyimpan role Organization di tabel `roles` yang sama dengan role platform* — ditolak; `roles.is_system_role`/`is_protected` dirancang untuk role platform, bukan role kontekstual yang berubah-ubah per Organization.

**Pros:** ADR-024 tetap berlaku 100% tanpa perlu direvisi isinya — larangan "scoped tim/wilayah" untuk Manager tetap tegak; Organization punya aturan otorisasinya sendiri yang bersih tanpa mencemari sistem RBAC platform inti; secara eksplisit **bukan amandemen** ADR-024 — mengonfirmasi ADR-024 tetap berlaku utuh.

**Cons:** Middleware butuh dua tahap pengecekan (role platform → role Organization) alih-alih satu; sedikit tambahan kompleksitas di layer otorisasi.

**Impact:** `SYSTEM-ARCHITECTURE.md` §8 (Authentication & Authorization Architecture); middleware RBAC di implementasi (relevan mulai Sprint S0/S1 saat Modul 12 dibangun, tidak memblokir Sprint lain).

**Affected Documents:** `architecture-decision-records.md` (ADR baru, tidak mengedit ADR-024), `SYSTEM-ARCHITECTURE.md` §8, `decision-log.md` (**ADR-044**).

**Dependencies:** ADR-024 (RBAC Role Model Scope — tidak diubah), **ADR-026** (Organization Model Strategy — prasyarat entitas `organizations`/`organization_members`).

**Review Date:** Jika role Organization kustom (di luar Leader/Member) dibutuhkan di masa depan.

**Notes:** Diselesaikan melalui sesi Architecture Review Board yang sama dengan ADR-026 (3 Agustus 2026) — draft sudah lengkap di proposal Bagian 8, sesi Board memverifikasi tidak ada celah antara klaim "bukan amandemen ADR-024" dengan implementasi middleware dua-tahap yang diusulkan; tidak ditemukan celah, ADR disahkan tanpa catatan kondisional tambahan. ADR ini secara eksplisit **bukan amandemen** terhadap ADR-024 — melainkan konfirmasi bahwa ADR-024 tetap berlaku utuh, dan otorisasi Organization adalah sistem terpisah yang tidak bersinggungan dengannya.

---

**ADR-028 — Third-Party AI Assistant Integration Strategy (BYOK)**

**Status:** APPROVED WITH NOTES
**Date:** 2026-08-03
**Owner:** Architecture Review Board (CTO, Principal Software Architect, Enterprise Solution Architect, Security Architect, Senior Backend Architect, AI Development Architect, Technical Lead) — pengesahan formal final tetap memerlukan konfirmasi Technical Lead/CTO manusia sesuai Bagian 9 (Governance Rules)

**Context:** Business Owner mengusulkan fitur agen (dan seluruh role internal berakun) dapat chat dengan AI assistant pilihan sendiri langsung di dalam SaaS, tanpa redirect ke aplikasi eksternal. Aplikasi chat vendor (ChatGPT/Gemini/Claude web app) **tidak mengizinkan diri di-iframe** oleh situs lain (proteksi anti-clickjacking `X-Frame-Options`/CSP `frame-ancestors`) — sehingga embed langsung secara teknis tidak dimungkinkan. Inisiatif ini **berdiri independen** dari ADR-026/ADR-027 (Organization) — tidak menyentuh entitas `organizations`/`listings` sama sekali, dibundel ke siklus governance yang sama atas permintaan Business Owner.

**Decision:** Diimplementasikan sebagai **BYOK (Bring Your Own Key)** — agen generate API key sendiri dari provider pilihan (kredensial developer, terpisah dari akun chat konsumer), simpan ke platform (terenkripsi at-rest, pola sama dengan `agent_verification_documents`/`dbr_simulations`), lalu seluruh request chat diproksi lewat backend SaaS (key **tidak pernah** dikirim ke client-side/browser) ke API resmi provider terkait, ditampilkan di chat UI custom buatan sendiri. Daftar provider dikurasi Admin (tabel referensi `ai_providers`), dibatasi ke provider dengan **free tier berkelanjutan**: Google Gemini, Groq, Mistral, GitHub Models. Riwayat chat **tidak dipersist** di server sama sekali (murni transient, state browser). Tersedia untuk seluruh role internal berakun (Superadmin, Manager, Admin, Instructor, Agen) — bukan eksklusif Agen. Rate limiting tambahan platform via reuse `rate_limit_log` (ADR-018). Koneksi API key bersifat persisten (tidak perlu reconnect rutin); sesi/riwayat chat tidak persisten (hilang saat tab ditutup/refresh) — dua sifat berbeda yang tidak boleh tertukar.

**Alternatives Considered:**
- *Sertakan OpenAI API/Anthropic API langsung sebagai pilihan default* — ditolak untuk rilis awal; keduanya hanya menyediakan kredit percobaan sekali habis (~$5), bukan free tier berkelanjutan seperti 4 provider terpilih — berpotensi menyesatkan agen yang mengira gratis selamanya. Tidak tertutup kemungkinan ditambahkan nanti sebagai opsi berbayar eksplisit.
- *Simpan riwayat chat default (dengan opsi non-aktifkan)* — ditolak; kebalikannya yang dipilih (default tidak simpan, tanpa opsi apa pun) untuk meminimalkan risiko PII buyer ter-paste agen ke percakapan lalu tersimpan tanpa proteksi setara data sensitif lain.
- *Restriksi fitur khusus role Agen* — ditolak; dibuka untuk seluruh role internal berakun, tidak ada alasan teknis untuk membatasi.
- *Embed/iframe aplikasi chat vendor langsung* — secara teknis tidak dimungkinkan (proteksi anti-clickjacking provider), bukan pilihan yang benar-benar tersedia untuk dipertimbangkan.

**Pros:** Tidak melanggar ToS provider manapun (API key memang untuk ini); key tidak pernah exposed ke client; tidak menambah kewajiban kepatuhan data karena percakapan tidak dipersist; free tier genuinely gratis untuk 4 provider terpilih tanpa risiko tagihan mendadak ke agen; nol dependency npm baru (komunikasi via `fetch` native, konsisten larangan `axios`).

**Cons:** Agen perlu paham istilah "API key" (bukan sekadar login biasa) — dimitigasi lewat wizard onboarding; free tier provider bisa berubah sewaktu-waktu (terbukti dari riset — kuota Gemini pernah dipangkas 50–80% Desember 2025) — bukan sesuatu yang dikontrol platform.

**Impact:** Tabel referensi provider baru (`ai_providers`), tabel koneksi per-agen baru (`agent_ai_connections`), endpoint proxy chat baru (`/ai-assistant/*`), rate limiting tambahan (reuse `rate_limit_log`/ADR-018). **Tidak ada tabel riwayat percakapan** — sesuai keputusan inti, percakapan murni transient. **Catatan cakupan siklus ini:** `PRD.md` (Modul 13 baru), `ERD-Skema-Database.md`, `API-Specification.md`, `User-Flow.md` **tidak** disentuh pada siklus governance saat ini — dijadwalkan sebagai paket terpisah menyusul, sama seperti ADR-026/027.

**Affected Documents:** `PROJECT-CONSTITUTION.md` (Riwayat Keputusan Arsitektur), `technology-decisions.md` (pemilihan 4 provider dicatat sebagai keputusan, bukan Official Technology Stack baris teknologi inti), `SYSTEM-ARCHITECTURE.md` §8 (Security — pola enkripsi key baru) & §13 (Notification — notifikasi koneksi invalid), `dependency-manifest.md` (tidak ada package baru), `development-playbook.md`, `decision-log.md` (**ADR-045**), `CHANGELOG.md`, `CURRENT-PROJECT-STATE.md`, `document-governance-baseline-register.md`, `project-manifest.md`.

**Dependencies:** ADR-017 (Security Strategy — pola enkripsi kredensial at-rest). ADR-018 (Caching Strategy — reuse `rate_limit_log` untuk rate limiting tambahan platform, tanpa infrastruktur baru). ADR-024 (RBAC — akses lintas role, bukan role-restricted). **Tidak bergantung** pada ADR-026/ADR-027 (Organization) — berdiri independen.

**Review Date:** Jika ada permintaan menambah provider di luar 4 yang dikurasi, atau kebutuhan menyimpan riwayat chat muncul eksplisit di masa depan (memerlukan ADR terpisah karena mengubah keputusan PII).

**Notes:** Diselesaikan melalui sesi Architecture Review Board yang sama dengan ADR-026/027 (3 Agustus 2026) — draft sudah lengkap di proposal Bagian 18.3, sesi Board memverifikasi kelengkapan. Keputusan akhir berstatus **APPROVED WITH NOTES** — satu catatan kondisional dari Board, non-blocking: volatilitas free tier provider pihak ketiga (mis. pemangkasan kuota Gemini Desember 2025) berada di luar kendali platform — direkomendasikan `usage_terms_note` per provider (tabel `ai_providers`) ditinjau berkala pasca-launch, bukan diasumsikan statis selamanya. Berdiri independen dari ADR-026/ADR-027 (Organization) — tidak ada dependency ke entitas `organizations`.

> **Update 2026-08-03 — Connection Lifecycle diklarifikasi (bukan keputusan baru untuk poin 1, memformalkan detail yang sebelumnya implisit untuk poin 2 & 3).** Business Owner mengonfirmasi tiga perilaku level koneksi per-provider, sebagai spesifikasi teknis pendamping `agent_ai_connections` (skema sudah dikunci di Decision utama di atas):
> 1. **Multi-provider per akun — dikonfirmasi ulang, bukan perubahan.** Satu user boleh terhubung ke keempat provider (Gemini, Groq, Mistral, GitHub Models) sekaligus, masing-masing independen dengan key dan thread chat terpisah. Constraint `UNIQUE (user_id, provider_id) WHERE status='active'` (§ skema `agent_ai_connections`) membatasi **1 koneksi aktif per provider**, bukan 1 koneksi aktif per akun secara keseluruhan.
> 2. **Ganti key (replace) tidak memerlukan disconnect lebih dulu.** Saat user paste key baru untuk provider yang sudah terhubung, sistem melakukan **replace langsung dalam satu aksi**: key lama (`encrypted_api_key`) ditimpa oleh key baru, `updated_at` diperbarui, `status` tetap `active` — bukan alur dua langkah (disconnect → connect ulang). Dipilih demi UX yang lebih ramah agen awam istilah teknis (selaras alasan wizard onboarding di Decision utama).
> 3. **Tombol "Putuskan Koneksi" wajib ada, dengan perilaku hapus-berlapis.** Saat disconnect: (a) `encrypted_api_key` **dihapus permanen (hard-delete)** dari database — bukan soft-delete/nonaktif — karena kredensial yang sudah diputus tidak punya alasan sah untuk tetap tersimpan, walau terenkripsi (setiap key yang tersimpan adalah permukaan risiko); (b) metadata koneksi (provider, `connected_at`, `disconnected_at`) **dipertahankan** sebagai jejak audit, dicatat ke `audit_logs` — konsisten pola audit yang sudah dipakai proyek ini di seluruh entitas lain. Perilaku ini **berbeda sengaja** dari pola soft-delete umum (ADR-004) yang berlaku untuk entitas bisnis (listing, dsb.) — kredensial diperlakukan sebagai kategori data terpisah dengan alasan keamanan, bukan diseragamkan begitu saja.
>
> Tidak ada tabel/kolom baru yang ditambahkan — ketiganya adalah spesifikasi perilaku atas skema `agent_ai_connections` yang sudah dikunci, dieksekusi saat paket sinkronisasi ERD/API Spec. Cross-reference: `decision-log.md` `ADR-045`.

---

**ADR-029 — Image Duplicate Detection Strategy (Exact + Perceptual Hash)**

**Status:** APPROVED
**Date:** 2026-08-08
**Owner:** Principal Software Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted), resolusi OD-25

**Context:** Tidak ada mekanisme mendeteksi listing duplikat dari kemiripan foto antar-listing milik agen yang sama. Kompresi client-side (`browser-image-compression`, ADR-019) mengubah byte file sebelum upload, sehingga exact-hash saja tidak cukup menangkap re-upload foto yang sama.

**Decision:** Tambahkan kolom `file_hash` (SHA-256) dan `photo_hash` (perceptual hash, 64-bit) di `listing_photos`, dihitung server-side via library `image-hash`. Saat agen submit listing untuk review, jalankan pengecekan terhadap foto listing aktif (`published`/`pending_review`) milik `agent_id` yang sama:
- Hamming Distance = 0 (atau `file_hash` exact match) → **blocking** (409, `DUPLICATE_PHOTO_DETECTED`)
- Hamming Distance 1–6 (similarity 90–99%) → **non-blocking warning** (`possible_duplicates[]`)
- Hamming Distance > 6 (similarity <90%) → tidak di-flag

**Rationale:** Menutup gap deteksi duplikat tanpa menambah vendor AI vision berbayar, konsisten prinsip minimal-vendor `technology-decisions.md` Bagian 2. Pemilihan `image-hash` (pure JavaScript, tanpa native binding) konsisten preseden ADR-019 (kompresi hybrid client+server dipilih atas server-side-only/CDN transformation untuk alasan beban proses serverless yang sama).

**Alternatives Considered:**
- **Exact hash (SHA-256) saja** *(ditolak)*: gagal menangkap file hasil kompresi ulang — kompresi client-side (ADR-019) mengubah byte file sebelum sampai ke server.
- **Vector embedding/CLIP via API pihak ketiga** *(ditolak)*: menambah vendor AI vision berbayar tanpa kebutuhan mendesak untuk kasus "foto sama dari agen sendiri"; bertentangan dengan prinsip minimal-vendor `technology-decisions.md` Bagian 2.
- **`sharp` + `blockhash-core`** *(ditolak sebagai pilihan utama)*: `sharp` bukan dependency yang sudah ada di stack proyek (`dependency-manifest.md`) dan menambah native binary binding — berisiko cold-start lebih lambat di lingkungan serverless Vercel Functions, konsisten alasan penolakan pendekatan serupa di ADR-019 (Puppeteer/headless Chrome untuk kasus PDF).

**Pros:** Menutup gap deteksi duplikat foto secara efektif (menangani kasus exact-match maupun kompresi ulang) tanpa vendor baru berbayar; `image-hash` pure JavaScript tanpa native binding, cocok lingkungan serverless; threshold dua-tingkat (blocking vs warning) memberi keseimbangan antara pencegahan kecurangan dan toleransi terhadap false-positive.

**Cons:** Submit listing dapat ditolak keras (blocking) untuk kasus foto identik — memerlukan pesan error yang jelas di UI (bukan generik) agar agen tidak bingung; perceptual hash rentan false-positive pada gambar dengan pola visual serupa namun konten berbeda (mis. denah rumah tipe sama) — dimitigasi lewat threshold terkalibrasi dan sifat non-blocking untuk rentang kemiripan 90-99% (bukan hard-block mutlak).

**Impact:** `listing_photos` (ERD, +2 kolom), endpoint `POST /listings/{id}/media` dan `PATCH /listings/{id}/status` (kontrak response baru), form submit listing (UI, komponen blocking modal + warning banner baru), business rule Modul 3.

**Affected Documents:** `ERD-Skema-Database-RUMAHAGEN-v1.4.md`, `API-Specification-RUMAHAGEN-v1.3.md`, `PRD-RUMAHAGEN-v1.3.md` (Modul 3), `MP-03-Listing-Module-Planning-v1.0.md`, `UI-Specification-RUMAHAGEN-v1.0.md`, `technology-decisions.md` §4.30, `dependency-manifest.md`, `decision-log.md` (mirror sebagai ADR-047 — lihat catatan penomoran independen di Bagian 2 dokumen ini).

**Dependencies:** Bergantung pada ADR-019 (File Upload Strategy) — kolom hash dihitung dari file yang sudah melalui alur kompresi client-side yang ditetapkan ADR-019; terkait ADR-009 (Storage Strategy) sebagai lokasi fisik foto yang di-hash.

**Review Date:** Setelah data produksi tersedia, tinjau ulang threshold Hamming Distance ≤6 berdasarkan rasio false-positive/negative nyata terhadap foto properti sesungguhnya (bukan asumsi umum 64-bit perceptual hash).

**Notes:** Entry ini di-mirror ke `decision-log.md` dengan nomor independen **ADR-047** (bukan hubungan Supersedes/Superseded — dua rangkaian penomoran berbeda merujuk topik yang sama, mengikuti pola ADR-026↔043, ADR-027↔044, ADR-028↔045 yang sudah baku di proyek ini, dicatat eksplisit di Bagian 2 dokumen ini). Sumber keputusan: `decision-log.md` §11, **OD-25** (Resolved, 8 Agustus 2026). Nomor ADR-029 diverifikasi aman lewat audit drift-detection penuh (pembacaan linear Bagian 4, 8 Agustus 2026) — tidak ada gap/konflik nomor di rentang 001-028.

---

# 5. Open Decisions Summary

> **ADR-001 (Backend Architecture) telah diselesaikan** melalui sesi Architecture Review Board (27 Juli 2026) — status **Approved**, keputusan: Next.js Route Handlers + Supabase, tanpa service terpisah. Tidak lagi tercantum di tabel Open Decisions di bawah ini. Lihat ADR-001 di Bagian 4 untuk detail lengkap.
>
> **ADR-005 (Search Strategy) telah diselesaikan** melalui sesi Architecture Review Board (28 Juli 2026) — status **Approved**, keputusan: PostgreSQL Full-Text Search + pg_trgm sebagai MVP Fase 1, migrasi terjadwal ke Typesense di Fase 2 berdasarkan kriteria ambang eksplisit. Tidak lagi tercantum di tabel Open Decisions di bawah ini. Lihat ADR-005 di Bagian 4 untuk detail lengkap.
>
> **ADR-006 (Job Queue Strategy) telah diselesaikan** melalui sesi Architecture Review Board (29 Juli 2026) — status **Approved**, keputusan: Vercel Cron Jobs + Postgres Trigger/Database Webhook sebagai MVP Fase 1, migrasi terjadwal ke QStash (Upstash) di Fase 2 berdasarkan kriteria ambang eksplisit. Tidak lagi tercantum di tabel Open Decisions di bawah ini. Lihat ADR-006 di Bagian 4 untuk detail lengkap.
>
> **ADR-008 (Maps Provider) telah diselesaikan** melalui sesi Architecture Review Board (30 Juli 2026, direvisi v3) — status **Approved**, keputusan: Leaflet + OpenStreetMap (rendering) dengan LocationIQ sebagai Primary Geocoding Provider dan Geoapify sebagai Approved Alternative Provider, dilengkapi caching strategy, rate limiting scoped, dan offline/manual address fallback. Tidak lagi tercantum di tabel Open Decisions di bawah ini. Lihat ADR-008 di Bagian 4 untuk detail lengkap.
>
> **ADR-018 (Caching Strategy) telah diselesaikan** melalui sesi Architecture Review Board (31 Juli 2026) — status **Approved**, keputusan: rate limiting & application-level cache Fase 1 native di atas Supabase Postgres (tabel `rate_limit_log`, sliding window), migrasi terjadwal ke Upstash Redis di Fase 2 berbasis kriteria ambang eksplisit. Tidak lagi tercantum di tabel Open Decisions di bawah ini. Lihat ADR-018 di Bagian 4 untuk detail lengkap.
>
> **ADR-026 (Organization Model Strategy) dan ADR-027 (Organization-Scoped Authorization Strategy) telah diselesaikan** melalui sesi Architecture Review Board (3 Agustus 2026) — status **Approved With Notes** / **Approved**, berdasarkan draft ADR yang diajukan lengkap di `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md` Bagian 8. Tidak lagi tercantum di tabel Open Decisions di bawah ini. Lihat ADR-026/ADR-027 di Bagian 4 untuk detail lengkap.
>
> **ADR-028 (Third-Party AI Assistant Integration Strategy) telah diselesaikan** melalui sesi Architecture Review Board yang sama (3 Agustus 2026) — status **Approved With Notes**, berdasarkan draft ADR di proposal Bagian 18.3. Tidak lagi tercantum di tabel Open Decisions di bawah ini. Lihat ADR-028 di Bagian 4 untuk detail lengkap.
>
> **Koreksi 3 Agustus 2026 (narasi ringkasan) — DIPERBAIKI PENUH 5 Agustus 2026 (entri sumber):** entri ADR-005 dan ADR-006 sempat ter-*revert* keliru menjadi "OPEN" akibat kesalahan editing pada revisi dokumen 30 Juli 2026. Revisi 3 Agustus 2026 memperbaiki narasi di Bagian 5/6/7/8 dan Governance Notes untuk mengklaim pemulihan, **namun tidak benar-benar memulihkan entri sumber di Bagian 4** — audit konsolidasi 5 Agustus 2026 (lihat Governance Notes poin 6) menemukan Bagian 4 masih berisi teks draf 27 Juli (`Status: OPEN`, `Decision: Belum ditentukan`) di file `__9_`. **Entri Bagian 4 dipulihkan penuh pada revisi ini** dari sumber terverifikasi (`architecture-decision-records__2_.md`/`__3_.md`, dikonfirmasi identik dengan `decision-log.md` ADR-039/ADR-040 yang tidak ikut ter-regresi).

| ADR | Current Status | Priority | Reason Still Open | Affected Documents | Recommended Resolution Time |
|---|---|---|---|---|---|
| *(tidak ada — seluruh ADR arsitektur/teknis kini Approved)* | — | — | — | — | — |

**Catatan tambahan (bukan status Open pada ADR itu sendiri, melainkan gap implementasi-lanjutan yang tercatat di Notes masing-masing ADR):** sinkronisasi administratif Vercel/Resend/Sentry/state-management ke dokumen tertinggi (ADR-007/010/011/015), dokumen Testing Strategy konsolidasi belum ada (ADR-016), dan volatilitas free tier provider AI pihak ketiga (ADR-028). **ADR-026 tidak lagi tercantum di sini** — kedua catatan kondisionalnya sudah tertutup penuh per 3 Agustus 2026 (lihat Update pada ADR-026 di Bagian 4). **Kebijakan soft-delete (ADR-004) juga tidak lagi tercantum di sini** — RESOLVED 4 Agustus 2026 via `ADR-046` (lihat `decision-log.md`), diperluas ke 8 tabel. Item-item ini **tidak** mengubah status Approved ADR terkait — dicatat agar tidak hilang dari perhatian tim.

---

# 6. Dependency Matrix

```
ADR-021 (Frontend Framework/Rendering)
   ↓
ADR-001 (Backend Architecture) [APPROVED]
   ↓
ADR-012 (API Architecture)
   ↓
ADR-006 (Job Queue Strategy) [APPROVED]      ADR-018 (Caching/Redis) [APPROVED]
   (keduanya independen satu sama lain — ADR-006 resolved tanpa Redis, ADR-018 dievaluasi terpisah)
   ↓
ADR-020 (Notification Strategy)
```

```
ADR-004 (Database Strategy)
   ↓
ADR-022 (Database Schema Conventions)
   ↓
ADR-003 (Authorization & RBAC Strategy)
   ↓
ADR-024 (RBAC Role Model Scope)
```

```
ADR-002 (Authentication Strategy)
   ↓
ADR-003 (Authorization & RBAC Strategy)
   ↓
ADR-012 (API Architecture)
   ↓
ADR-013 (Error Handling) → ADR-014 (Logging) → ADR-015 (Monitoring)
```

```
ADR-009 (Storage Strategy)
   ↓
ADR-019 (File Upload Strategy)
```

```
ADR-007 (Email Provider)
   ↓
ADR-020 (Notification Strategy)
```

```
ADR-021 (Frontend Framework)
   ↓
ADR-010 (Deployment Strategy) → ADR-015 (Monitoring)
   ↓
ADR-011 (State Management Strategy)
   ↓
ADR-016 (Testing Strategy)
```

```
ADR-025 (Type Safety & Validation) ── mendasari ──▶ ADR-012, ADR-016, seluruh ADR yang menyentuh form/endpoint
```

```
ADR-005 (Search Strategy) [APPROVED]  ←──terkait──▶  ADR-001 (Backend Architecture) [APPROVED]
```

```
ADR-008 (Maps Provider) [APPROVED] ── tidak bergantung ADR lain — diselesaikan independen (30 Juli 2026)
```

```
ADR-023 (Multi-Tenancy Strategy) [APPROVED — implisit, direvisi statusnya]
   ↓
ADR-026 (Organization Model Strategy) [APPROVED WITH NOTES]
   ↓
ADR-027 (Organization-Scoped Authorization Strategy) [APPROVED]
   (bergantung juga pada ADR-024 — RBAC Role Model Scope, tidak diubah)
```

```
ADR-028 (Third-Party AI Assistant Integration Strategy) [APPROVED WITH NOTES]
   ── bergantung pada ADR-017 (Security), ADR-018 (Caching — reuse rate_limit_log), ADR-024 (RBAC)
   ── TIDAK bergantung pada ADR-026/027 (Organization) — dua inisiatif independen
```

```
ADR-019 (File Upload Strategy) [APPROVED]
   ↓
ADR-029 (Image Duplicate Detection Strategy) [APPROVED]
   ── juga terkait ADR-009 (Storage Strategy) — lokasi fisik foto yang di-hash
```

**Simpul kritis:** **ADR-001** adalah simpul dengan dependency turunan terbanyak (ADR-005, ADR-006, ADR-012, ADR-018, dan transitif ADR-013/014/015/016/020) — ini mengonfirmasi penilaian `executive-architecture-review.md` bahwa ADR-001 adalah prioritas Critical tunggal. **ADR-001, ADR-005 (28 Juli), ADR-006 (29 Juli), ADR-008 (30 Juli), dan ADR-018 (31 Juli) seluruhnya kini berstatus Approved** — tidak ada lagi ADR arsitektur/teknis yang OPEN di antara ADR-001 s.d. ADR-025. **Simpul baru (3 Agustus 2026):** ADR-026 menjadi simpul kritis kedua untuk inisiatif Organization — ADR-027 bergantung langsung padanya, dan keduanya merevisi status (bukan mengedit) ADR-023. ADR-028 berdiri sebagai simpul terpisah tanpa keterkaitan ke cabang Organization manapun. **ADR-029 (8 Agustus 2026) bergantung pada ADR-019 (File Upload Strategy) — melengkapi alur upload foto listing dengan lapisan deteksi duplikat, independen dari cabang Organization (026/027) maupun AI Assistant (028).**

---

# 7. Impact Analysis

> Hanya mencakup ADR berstatus **OPEN** — ADR berstatus Approved tidak memerlukan impact analysis penundaan karena sudah final untuk dieksekusi.
>
> **ADR-001 (Backend Architecture) dihapus dari daftar OPEN di bagian ini** — telah diselesaikan (Approved, 27 Juli 2026, via Architecture Review Board: Next.js Route Handlers + Supabase, tanpa service terpisah). Lihat ADR-001 di Bagian 4 untuk Context/Decision/Rationale/Consequences lengkap.
>
> **ADR-008 (Maps Provider) dihapus dari daftar OPEN di bagian ini** — telah diselesaikan (Approved, 30 Juli 2026, direvisi v3, via Architecture Review Board: Leaflet + OpenStreetMap dengan LocationIQ sebagai Primary Provider dan Geoapify sebagai Approved Alternative Provider). Lihat ADR-008 di Bagian 4 untuk Context/Decision/Rationale/Consequences lengkap.
>
> **ADR-018 (Caching Strategy) dihapus dari daftar OPEN di bagian ini** — telah diselesaikan (Approved, 31 Juli 2026, via Architecture Review Board: rate limiting/cache aplikasi Fase 1 native di atas Supabase Postgres, migrasi terjadwal ke Upstash Redis Fase 2 berbasis kriteria ambang). Lihat ADR-018 di Bagian 4 untuk Context/Decision/Rationale/Consequences lengkap.
>
> **ADR-005 (Search Strategy) dan ADR-006 (Job Queue Strategy) tidak lagi tercantum di bagian ini** — keduanya telah diselesaikan (Approved 28 & 29 Juli 2026). Subbagian Impact Analysis untuk kedua ADR ini sebelumnya sempat hilang dari revisi 30 Juli 2026 akibat regresi editing (lihat Governance Notes poin 4) dan dipulihkan-hapus di sini secara konsisten dengan pola ADR-001/008/018 di atas — bukan Impact Analysis baru, karena keduanya sudah final untuk dieksekusi. Lihat ADR-005/ADR-006 di Bagian 4 untuk Context/Decision/Rationale/Consequences lengkap.
>
> **ADR-026 (Organization Model Strategy), ADR-027 (Organization-Scoped Authorization Strategy), dan ADR-028 (Third-Party AI Assistant Integration Strategy) tidak memerlukan subbagian Impact Analysis** — ketiganya diajukan dengan draft ADR yang sudah lengkap (Context/Decision/Alternatives/Pros/Cons) dan langsung disahkan Approved/Approved With Notes pada sesi Architecture Review Board yang sama (3 Agustus 2026), tanpa melalui periode OPEN yang tertunda. Lihat Bagian 4 untuk detail lengkap masing-masing.
>
> **ADR-029 (Image Duplicate Detection Strategy) tidak memerlukan subbagian Impact Analysis** — diajukan dengan draft ADR yang sudah lengkap dan langsung disahkan Approved pada sesi yang sama (8 Agustus 2026), tanpa melalui periode OPEN.

---

# 8. Implementation Order

Urutan penyelesaian Open Decision yang direkomendasikan (bukan urutan eksekusi kode, melainkan urutan **pengambilan keputusan** oleh manusia berwenang):

0. ~~**ADR-001 — Backend Architecture**~~ — **SELESAI** (Approved, 27 Juli 2026, via Architecture Review Board). Sebelumnya menjadi prasyarat langsung/tidak langsung bagi ADR-005, ADR-006, dan seluruh turunannya (lihat Bagian 6, simpul kritis) — kini seluruh ADR turunan dapat dinilai dengan konteks backend yang sudah pasti.
0. ~~**ADR-008 — Maps Provider**~~ — **SELESAI** (Approved, 30 Juli 2026, direvisi v3, via Architecture Review Board). Sepenuhnya independen dari ADR-005/006/018 — tidak mengubah urutan prioritas ADR yang masih OPEN di bawah ini.
0. ~~**ADR-018 — Caching Strategy**~~ — **SELESAI** (Approved, 31 Juli 2026, via Architecture Review Board). Sebelumnya digantung pada hasil ADR-006 (jika BullMQ dipilih, Redis otomatis tersedia) — karena ADR-006 final tanpa Redis, ADR-018 dievaluasi & diselesaikan secara independen: rate limiting Fase 1 native di atas Supabase Postgres, migrasi terjadwal ke Upstash Redis Fase 2.
0. ~~**ADR-005 — Search Strategy**~~ — **SELESAI** (Approved, 28 Juli 2026, via Architecture Review Board). *(Entri sumber Bagian 4 dipulihkan penuh pada revisi 5 Agustus 2026 — narasi 3 Agustus sebelumnya baru memperbaiki ringkasan, belum entri sumbernya; lihat Governance Notes poin 4 & 6.)*
0. ~~**ADR-006 — Job Queue Strategy**~~ — **SELESAI** (Approved, 29 Juli 2026, via Architecture Review Board). *(Entri sumber Bagian 4 dipulihkan penuh pada revisi 5 Agustus 2026 — narasi 3 Agustus sebelumnya baru memperbaiki ringkasan, belum entri sumbernya; lihat Governance Notes poin 4 & 6.)*
0. ~~**ADR-026 — Organization Model Strategy**~~ — **SELESAI** (Approved With Notes, 3 Agustus 2026, via Architecture Review Board, berdasarkan draft di `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md`).
0. ~~**ADR-027 — Organization-Scoped Authorization Strategy**~~ — **SELESAI** (Approved, 3 Agustus 2026, via Architecture Review Board, sesi yang sama dengan ADR-026).
0. ~~**ADR-028 — Third-Party AI Assistant Integration Strategy**~~ — **SELESAI** (Approved With Notes, 3 Agustus 2026, via Architecture Review Board, sesi yang sama; independen dari ADR-026/027).
0. ~~**ADR-029 — Image Duplicate Detection Strategy**~~ — **SELESAI** (Approved, 8 Agustus 2026, resolusi OD-25).

*(Tidak ada item bernomor tersisa — seluruh **29** ADR arsitektur/teknis proyek kini berstatus Approved.)*

---

# 9. Governance Rules

**Kapan ADR boleh dibuat:** Setiap kali sebuah keputusan memengaruhi desain arsitektur atau implementasi teknis dengan **lebih dari satu alternatif yang secara wajar dipertimbangkan** — bukan untuk keputusan trivial yang tidak memiliki alternatif nyata. ADR baru wajib mengikuti format Bagian 4 secara lengkap (tidak boleh mengosongkan field).

**Kapan ADR boleh diubah:** ADR berstatus **Approved tidak boleh diedit langsung** isinya. Perubahan substantif menghasilkan **ADR baru** yang secara eksplisit menyebut ADR mana yang digantikannya — ADR lama kemudian diberi status **Superseded** (bukan dihapus). Perubahan redaksional kecil (typo, perbaikan tautan) yang tidak mengubah keputusan boleh diedit langsung tanpa ADR baru, namun tetap dicatat di `CHANGELOG.md`.

**Siapa yang berwenang menyetujui:** Mengikuti Review & Approval Matrix di `document-governance-baseline-register.md` Bagian 9 — untuk ADR arsitektur/teknis, Approver adalah **Technical Lead / Enterprise Solution Architect / CTO** — **Mujtahid Aktanto (Solo Project Owner, AI-Assisted)**, resolusi OD-06, 4 Agustus 2026 (lihat Bagian 1). **AI Coding Assistant tidak berwenang mengubah status ADR menjadi Approved** — AI dapat mengusulkan (Proposed) dan membantu Impact Analysis, tetapi Approval selalu memerlukan konfirmasi manusia (Owner tunggal pada proyek solo ini).

**Hubungan ADR dengan Decision Log:** Setiap ADR di dokumen ini **berkorespondensi** dengan satu atau lebih entri di `decision-log.md` (dicatat di field *Affected Documents*/*Notes* masing-masing ADR). Decision Log tetap menjadi jurnal kronologis lengkap (termasuk keputusan non-arsitektur); dokumen ADR ini adalah **pandangan tersaring** (filtered view) khusus arsitektur/teknis dari subset entri yang sama. Jika sebuah ADR di sini disahkan/diubah, `decision-log.md` **wajib** menerima entri baru yang merujuk balik ke ADR terkait — bukan dua sumber yang berjalan sendiri-sendiri.

**Hubungan ADR dengan Changelog:** `CHANGELOG.md` mencatat **kapan** dan **apa** yang berubah di kode/rilis sebagai akibat dari sebuah ADR — ADR menjelaskan **mengapa**, Changelog mencatat **dampaknya di rilis**. Setiap kali status ADR berubah menjadi Approved dan diimplementasikan, entri terkait wajib muncul di `CHANGELOG.md` Release History pada versi rilis yang relevan.

**Hubungan ADR dengan Baseline Register:** Status **Baseline** sebuah dokumen teknis (`technology-decisions.md`, `SYSTEM-ARCHITECTURE.md`, dsb.) di `document-governance-baseline-register.md` **tidak dapat dicapai** selama ADR yang menaunginya masih berstatus Open — ini menegaskan kembali Baseline Rule 4.1 poin 3 di dokumen tsb ("tidak ada Open Decision yang secara langsung memengaruhi isi dokumen"). Dokumen ADR ini menjadi **input wajib** bagi proses penilaian kelayakan Baseline suatu dokumen turunan.

---

# 10. AI Usage Rules

1. **AI wajib membaca ADR ini sebelum membaca `technology-decisions.md`** — ADR menjelaskan alasan & alternatif di balik setiap baris "Official Technology Stack"; membaca katalog tanpa konteks keputusan berisiko AI salah memahami tingkat kepastian sebuah pilihan teknologi.
2. **AI tidak boleh mengabaikan ADR berstatus Approved** — termasuk larangan eksplisit yang tercatat di *Alternatives Considered* (mis. SWR, Redux, Formik, Moment.js, MUI, Ant Design, react-beautiful-dnd, Auth0/Clerk, service backend terpisah tanpa ADR-001 disahkan ulang).
3. **Jika terjadi konflik antara ADR berstatus Approved dan dokumen lain (`SYSTEM-ARCHITECTURE.md`, `technology-decisions.md`, dsb.), ADR ini menjadi referensi utama** sampai dokumen lain diperbarui secara resmi untuk mencerminkan ADR tsb — bukan sebaliknya. Ini menegaskan hierarki: keputusan arsitektur (ADR) lebih otoritatif daripada katalog/deskripsi yang menaunginya.
4. **Jika sebuah ADR masih berstatus OPEN, AI tidak boleh membuat asumsi apa pun** untuk melanjutkan implementasi pada area yang dipengaruhinya — AI **wajib berhenti dan meminta keputusan eksplisit dari pengguna/Technical Lead**, mengikuti pola *configurable placeholder* dengan penanda `// TODO: menunggu resolusi ADR-XXX` jika implementasi sementara benar-benar tidak dapat dihindari untuk pekerjaan yang tidak terdampak langsung.
5. **AI dapat mengusulkan ADR baru berstatus Proposed** ketika menemukan keputusan arsitektur yang belum tercatat di dokumen ini, namun **tidak berwenang** menaikkan statusnya menjadi Approved (lihat Bagian 9).

---

## Governance Notes

> Bagian tambahan ini mencatat temuan tata kelola yang muncul selama penyusunan ADR ini sendiri — bersifat advisory, tidak mengubah isi dokumen proyek manapun.

1. **Kolisi penomoran "ADR-XXX"**: Dokumen ini memakai `ADR-001`…`ADR-025` untuk topik arsitektur/teknis, sementara `decision-log.md` sudah lebih dulu memakai `ADR-001`…`ADR-037` untuk seluruh keputusan proyek (termasuk yang non-arsitektur). **Kedua rangkaian penomoran ini tidak sinkron** — mis. `ADR-001` di dokumen ini berarti "Backend Architecture (Approved, 27 Juli 2026)", sedangkan `ADR-001` di `decision-log.md` berarti "Next.js App Router (Approved)" — dua keputusan berbeda kebetulan berbagi nomor yang sama. Ini berpotensi membingungkan siapa pun yang menyebut "ADR-001" tanpa menyebut dokumen sumbernya. **Tidak diputuskan sendiri di sini** — direkomendasikan sebagai keputusan governance terpisah (mis. memberi prefiks pembeda seperti `TADR-` untuk dokumen ini atau `DLG-` untuk Decision Log) yang perlu disahkan pemilik dokumentasi.
2. ~~**Inkonsistensi jumlah seed role (7 vs 8)**~~ — **RESOLVED 4 Agustus 2026 (OD-02):** dikunci final 7 role dengan akun + Guest tanpa baris `roles`. `DEVELOPMENT-ROADMAP.md`/`CHANGELOG.md`/`CURRENT-PROJECT-STATE.md`/`decision-log.md` disinkronkan.
3. **Gap administratif berulang** (Vercel, Resend, Sentry, frasa state management usang) yang tercatat di berbagai *Notes* ADR Bagian 4 seluruhnya bersifat sinkronisasi dokumen, bukan keputusan yang masih diperdebatkan — dikelompokkan di sini agar tidak dianggap sebanding tingkat urgensinya dengan ADR lain yang benar-benar memerlukan keputusan Board (lihat Bagian 4). *(Redaksi poin ini diperbarui 3 Agustus 2026 — versi sebelumnya keliru menyebut ADR-005/006 sebagai "benar-benar OPEN"; lihat poin 4.)*
4. **(Baru) Regresi status ADR-005 & ADR-006 ditemukan dan dikoreksi (3 Agustus 2026).** Audit riwayat lima revisi dokumen ini (27–31 Juli 2026) menemukan bahwa entri ADR-005 (Approved sejak 28 Juli) dan ADR-006 (Approved sejak 29 Juli) **ter-*revert* tanpa disengaja** menjadi "OPEN" pada revisi 30 Juli 2026 (siklus sinkronisasi ADR-008) — teks entri kembali identik kata-per-kata dengan draf 27 Juli, lengkap dengan Bagian 5/6/7/8 yang ikut memperlakukan keduanya sebagai belum diputuskan. Regresi ini tidak terdeteksi pada revisi 31 Juli 2026 (siklus ADR-018), menyebabkan dokumen sempat tidak konsisten secara internal (header mengklaim "25/25 Approved" sementara isi Bagian 4/5/6/7/8 mencantumkan dua ADR ini sebagai OPEN). **Sembilan dokumen turunan lain** (`technology-decisions.md`, `PROJECT-CONSTITUTION.md`, `SYSTEM-ARCHITECTURE.md`, `dependency-manifest.md`, `development-playbook.md`, `decision-log.md`, `CHANGELOG.md`, `CURRENT-PROJECT-STATE.md`, `project-manifest.md`) **tidak ikut ter-regresi** dan tetap konsisten mencatat kedua ADR sebagai Approved sepanjang periode tsb — menjadi dasar pemulihan isi yang benar pada revisi ini, dengan satu pembaruan redaksional minor pada field *Dependencies* ADR-006 (mencerminkan ADR-018 kini juga Approved). **Rekomendasi proses:** tambahkan langkah verifikasi diff/checksum terhadap versi sebelumnya sebagai bagian rutin setiap siklus sinkronisasi ADR, agar regresi serupa tertangkap sebelum dokumen didistribusikan ke sesi AI Coding Assistant berikutnya.
5. **(Baru) Siklus ADR-026/027/028 — pola baru: draft ADR diajukan lengkap dari luar proses Board, bukan disusun oleh Board itu sendiri.** Berbeda dari ADR-001/005/006/008/018 (Board menyusun ADR dari nol berdasarkan Context/Open Question yang teridentifikasi), ketiga ADR ini diajukan sebagai draft yang sudah lengkap (Context/Decision/Alternatives/Pros/Cons) di `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md` — dokumen jembatan yang disusun berdasarkan diskusi Business Owner dengan ChatGPT dan Claude. Sesi Board (3 Agustus 2026) memverifikasi kelengkapan & konsistensi draft terhadap ADR yang sudah Approved (khususnya ADR-024 untuk ADR-027, dan ADR-023 untuk ADR-026), bukan menyusun dari nol — pola baru ini dicatat di sini sebagai preseden yang tervalidasi berfungsi baik, untuk siklus-siklus mendatang yang mungkin menerima draft serupa. **Dua inisiatif dibundel dalam satu siklus** (Organization Management System via ADR-026/027, dan AI Assistant Integration via ADR-028) atas permintaan Business Owner — keduanya independen satu sama lain, tidak ada ADR yang menaungi keduanya sekaligus. **Cakupan sinkronisasi siklus ini dibatasi eksplisit**: dokumen sumber bisnis/data v1.1 (PRD/ERD/API Spec/User Flow/SEO Spec) **tidak** disentuh pada siklus governance ini, dijadwalkan sebagai paket terpisah menyusul — berbeda dari seluruh siklus ADR-001/005/006/008/018 sebelumnya yang selalu mencatat "tidak berubah" untuk kelima dokumen tsb; siklus ini adalah **yang pertama** direncanakan mengubahnya, namun belum pada revisi ini.
6. **(Baru) Regresi ADR-005/ADR-006 ternyata belum benar-benar dipulihkan pada revisi 3 Agustus 2026 — ditemukan dan diperbaiki tuntas pada konsolidasi 5 Agustus 2026.** Audit konfigurasi menyeluruh terhadap 9 snapshot revisi dokumen ini (dilakukan sebagai bagian proses konsolidasi 9 file menjadi 1 file master) menemukan bahwa perbaikan yang diklaim poin 4 di atas **hanya menyentuh lapisan narasi/ringkasan** (Bagian 5 Open Decisions Summary, Bagian 6 Dependency Matrix, Bagian 7 Impact Analysis, Bagian 8 Implementation Order, dan Governance Notes poin 4 itu sendiri) — **entri sumber otoritatif ADR-005 dan ADR-006 di Bagian 4 tidak ikut diperbaiki**, tetap berisi teks draf 27 Juli 2026 (`Status: OPEN`, `Decision: Belum ditentukan`) tanpa Rationale/Alternatives/Consequences, identik kata-per-kata dengan `architecture-decision-records__1_.md`. Ini menciptakan dokumen yang **secara internal tampak konsisten di permukaan** (header mengklaim "28/28 Approved", ringkasan Bagian 5 bersih) **padahal isi intinya masih rusak** — pola kegagalan konfigurasi yang lebih berbahaya dari regresi murni karena lolos dari pemeriksaan sekilas. Root cause paling mungkin: perbaikan 3 Agustus 2026 dikerjakan top-down (memperbaiki ringkasan berdasarkan asumsi status yang seharusnya), bukan bottom-up (memverifikasi ulang isi Bagian 4 kata-per-kata terhadap sumber pra-regresi). Entri Bagian 4 dipulihkan penuh pada revisi ini, bersumber dari `architecture-decision-records__2_.md` (ADR-005, Approved 28 Juli 2026) dan `__3_.md` (ADR-006, Approved 29 Juli 2026) — dikonfirmasi identik secara substansi dengan `decision-log.md` `ADR-039`/`ADR-040` yang tidak pernah ikut ter-regresi. Field `Dependencies` ADR-001 dan ADR-006 turut diperbarui redaksional (menghapus rujukan "masih OPEN" yang sudah usang), dan baris `Cross-reference: decision-log.md ADR-XXX` ditambahkan ke ADR-001/005/006/008/018 agar konsisten dengan gaya penulisan ADR-026/027/028. **Rekomendasi proses tambahan (memperkuat poin 4):** verifikasi pemulihan regresi wajib memeriksa isi entri sumber (Bagian 4) kata-per-kata, bukan hanya memperbaiki narasi ringkasan yang merujuknya — perbaikan ringkasan tanpa perbaikan sumber justru menyembunyikan masalah, bukan menyelesaikannya.
7. **(Baru) Inkonsistensi gaya cross-reference — sudah diseragamkan pada revisi ini.** ADR-026/027/028 masing-masing memiliki baris eksplisit `Cross-reference: decision-log.md ADR-XXX` di badan entrinya, sementara ADR-001/005/006/008/018 sebelumnya tidak — mapping-nya hanya tersirat di Governance Notes poin 1 dan `project-manifest.md`. Bukan kesalahan data (seluruh nomor sudah diverifikasi cocok dengan `decision-log.md`: ADR-001→038, ADR-005→039, ADR-006→040, ADR-008→041, ADR-018→042), murni inkonsistensi gaya penulisan — telah diseragamkan dengan menambahkan baris `Cross-reference` ke kelima ADR tersebut (lihat Bagian 4).

---

*Dokumen ini adalah Architecture Decision Records resmi proyek — sumber kebenaran tunggal untuk keputusan arsitektur/teknis, terpisah dari `decision-log.md` (jurnal kronologis seluruh keputusan). Tidak ada isi dokumen proyek lain yang diubah dalam penyusunannya. Wajib dirujuk oleh `technology-decisions.md`, `SYSTEM-ARCHITECTURE.md`, `AI-DEVELOPMENT-BLUEPRINT.md`, `dependency-manifest.md`, Database Schema, `API-Specification`, dan Technical Specification setiap kali dokumen-dokumen tersebut direvisi. Revisi 3 Agustus 2026 menambahkan ADR-026 (Organization Model Strategy, Approved With Notes), ADR-027 (Organization-Scoped Authorization Strategy, Approved), dan ADR-028 (Third-Party AI Assistant Integration Strategy, Approved With Notes) hasil sesi Architecture Review Board berdasarkan `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md`; merevisi status ADR-023 (Multi-Tenancy Strategy, tanpa mengedit isi asli); dan mengoreksi regresi status ADR-005/ADR-006 yang ditemukan lewat audit riwayat versi (lihat Governance Notes poin 4). Dengan revisi ini, **28 dari 28 ADR arsitektur/teknis proyek berstatus Approved — tidak ada ADR yang OPEN.***

---

## D6 Cross-AEP Decision Boundary
No new architecture ADR is created by D6. AEP1–AEP4 decisions remain governed by their approved MADCR/ADR/AEP records and the D5 cross-domain reconciliation. D6 records the global synchronization state, not a new domain decision.
