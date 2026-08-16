# Architecture Review Board — Sesi Resolusi ADR-005
## Topik: Search Strategy — RUMAHAGEN

**Peserta Panel:** CTO, Principal Software Architect, Enterprise Solution Architect, Senior Backend Architect, Senior Frontend Architect, Cloud Architect, DevOps Architect, Database Architect, Security Architect, AI Development Architect, Technical Lead

**Tanggal Sesi:** 28 Juli 2026
**Status Awal:** OPEN (ADR-005 di `architecture-decision-records.md`)

---

# TAHAP 1 — Mengapa Keputusan Ini Penting

`API-Specification-v1.1.md` §3 sudah mendefinisikan lima endpoint pencarian sebagai kontrak resmi yang dikonsumsi frontend:

- `GET /properties/search` — pencarian multi-filter kombinasi (kategori, tipe transaksi, tipe properti, lokasi cascading province/city/district, rentang harga, luas tanah/bangunan, kamar, sertifikat, sorting)
- `GET /properties/map-bounds` — pencarian geospasial dalam bounding box untuk render pin peta
- `GET /properties/nearby` — pencarian radius dari titik GPS
- `GET /properties/autocomplete` — saran lokasi/keyword saat mengetik, dengan **typo-tolerance** sebagai requirement eksplisit
- `GET /properties/{id}/similar` — rekomendasi listing serupa

Kontrak ini sudah "hidup" di dokumen tertinggi kedua (API Specification), namun **mesin pencari yang menjalankannya belum pernah dipilih**. Ini bukan detail implementasi kosmetik — pilihan mesin pencari menentukan:

1. **Skema data tambahan** — index khusus (GIN/trigram di Postgres, atau koleksi terpisah di Typesense/Elasticsearch) yang harus dirancang sebelum Modul 3 (Listing) dibangun.
2. **Pola sinkronisasi data** — jika memilih mesin eksternal (Typesense/Elasticsearch), dibutuhkan mekanisme sync listing → index, yang bersinggungan langsung dengan ADR-006 (Job Queue) yang **juga masih OPEN**.
3. **Kualitas UX inti platform** — pencarian & filter adalah fitur paling sering dipakai calon pembeli (PRD Modul 3.4); typo-tolerance dan kecepatan filter kombinasi langsung memengaruhi konversi.
4. **Biaya & kompleksitas operasional** — menambah komponen infrastruktur baru (vendor SaaS atau self-hosted service) vs tetap murni dalam ekosistem Supabase.
5. **Risiko rework** — `foundation-validation-report.md` Gap H2 dan `architecture-decision-records.md` Bagian 7 secara eksplisit memperingatkan: jika Modul 3 mulai dibangun di atas asumsi mesin pencari yang salah, **rework besar** terjadi begitu volume listing bertambah.

Keputusan ini **memblokir Sprint S5** (Impact Analysis, `architecture-decision-records.md` Bagian 7) dan berelasi dengan `SEO-Analytics-Specification-v1.1.md` (sinkronisasi indexing untuk sitemap & structured data).

**Kesimpulan Tahap 1:** Ini adalah keputusan arsitektural bertingkat sedang (bukan Critical seperti ADR-001, karena tidak memblokir Sprint S0–S4), namun **High priority** karena punya jendela waktu tegas (sebelum Sprint S5) dan risiko rework yang sudah terdokumentasi eksplisit oleh audit fondasi proyek.

---

# TAHAP 2 — Identifikasi Seluruh Alternatif Realistis

Berdasarkan dokumen proyek (yang mencatat 3 opsi) ditambah due-diligence panel terhadap ekosistem Supabase/Vercel saat ini, alternatif yang realistis untuk sesi ini:

### Alternatif A — PostgreSQL Full-Text Search + pg_trgm (native Supabase)
Menggunakan `tsvector`/`tsquery` bawaan Postgres untuk full-text search, dikombinasikan ekstensi `pg_trgm` untuk trigram similarity (mendukung toleransi typo terbatas) dan indeks GIN/GiST. Filter kombinasi (harga, kamar, lokasi) tetap memakai query SQL biasa dengan index B-tree/composite.

### Alternatif B — Typesense (self-hosted atau Typesense Cloud)
Mesin pencari open-source yang dirancang khusus untuk typo-tolerance, faceted filtering, dan kecepatan sub-50ms. Membutuhkan proses sinkronisasi data listing → koleksi Typesense.

### Alternatif C — Elasticsearch / OpenSearch
Mesin pencari enterprise-grade, sangat matang untuk full-text search skala besar, agregasi kompleks, dan geospatial query native. Operasional lebih berat (cluster management, resource footprint lebih besar) dibanding Typesense.

### Alternatif D — Algolia (SaaS search-as-a-service)
Tidak tercatat di dokumen proyek sebelumnya, namun realistis untuk dipertimbangkan panel: search-as-a-service terkelola penuh, sangat cepat untuk implementasi (SDK Next.js matang), typo-tolerance & faceting kelas atas out-of-the-box, namun model harga berbasis volume record + request yang bisa mahal di skala menengah-besar dan merupakan vendor lock-in penuh (data & ranking logic hidup di luar infrastruktur sendiri).

### Alternatif E — Hybrid Bertahap (Postgres FTS di Fase 1 → migrasi terjadwal ke Typesense)
Bukan mesin pencari baru, melainkan **strategi peluncuran**: mulai dengan Alternatif A sebagai MVP, dengan kriteria ambang migrasi eksplisit (mis. jumlah listing aktif, latensi p95, atau keluhan relevansi) yang memicu migrasi terjadwal ke Alternatif B. Ini adalah opsi yang direkomendasikan (belum diputuskan) oleh `foundation-validation-report.md` Gap H2.

Panel menyepakati kelima alternatif ini layak dibandingkan. Elasticsearch/OpenSearch (C) dan Algolia (D) dipertahankan dalam perbandingan sebagai pembanding meski secara awal terlihat "berat"/"mahal" — keputusan tidak boleh didasarkan pada asumsi awal tanpa perbandingan eksplisit.

---

# TAHAP 3 & 4 — Perbandingan Alternatif

**Skala penilaian:** Excellent / Good / Fair / Poor

| Kriteria | A. Postgres FTS+trgm | B. Typesense | C. Elasticsearch/OpenSearch | D. Algolia | E. Hybrid (A→B terjadwal) |
|---|---|---|---|---|---|
| Kesesuaian dengan PRD (Modul 3.4 — filter kombinasi, typo-tolerance) | Fair — filter kombinasi kuat, typo-tolerance terbatas (trigram bukan true fuzzy ranking) | Excellent — dirancang persis untuk kasus ini | Excellent — kapabilitas setara/lebih, tapi berlebih untuk skala awal | Excellent — typo-tolerance kelas atas | Good — memenuhi PRD penuh begitu migrasi terjadi, MVP sedikit di bawah target di awal |
| Kesesuaian dengan ERD (37+ entitas, struktur relasional sudah Postgres) | Excellent — tidak ada data terduplikasi, index langsung di tabel `listings` | Good — perlu skema index terpisah (denormalized), harus disinkronkan manual terhadap ERD | Good — sama seperti Typesense, index eksternal harus direplikasi dari ERD | Fair — struktur index Algolia jauh dari bentuk relasional ERD, effort mapping besar | Good — dimulai selaras ERD, kompleksitas sinkronisasi baru muncul saat migrasi |
| Integrasi dengan Supabase | Excellent — native, tanpa layer tambahan | Fair — butuh service terpisah (self-hosted container atau Typesense Cloud), tidak ada integrasi resmi Supabase | Fair — sama, bahkan resource footprint lebih besar | Fair — integrasi via webhook/API eksternal, tidak native | Good — dimulai Excellent, turun ke Fair pasca-migrasi |
| Integrasi dengan Bolt.new | Excellent — query Postgres biasa, langsung didukung tooling AI-assisted development | Fair — perlu setup SDK & environment variable tambahan di luar pola Bolt.new standar | Fair — sama, kompleksitas setup lebih tinggi | Good — SDK JS matang, tapi tetap dependency eksternal baru | Good |
| Integrasi dengan Vercel | Excellent — tanpa komponen infrastruktur baru, cocok arsitektur serverless Route Handlers (ADR-001) | Good — Typesense Cloud kompatibel serverless (via HTTP API); self-hosted butuh hosting terpisah (bukan Vercel) | Fair — self-hosted cluster tidak native ke Vercel, butuh provider lain (menambah vendor infra) | Excellent — full SaaS, tidak butuh hosting tambahan sendiri | Good |
| Skalabilitas (volume listing bertumbuh) | Fair — cukup untuk puluhan ribu listing, menurun pada filter kompleks + fuzzy search skala besar | Excellent — dirancang untuk skala besar dengan latensi rendah | Excellent — skalabilitas terbukti industri | Excellent — auto-scaling terkelola penuh | Excellent — skalabilitas Fase 1 cukup, Fase 2 setara Typesense |
| Kompleksitas (implementasi & operasional) | Excellent — paling sederhana, nol komponen baru | Fair — komponen baru + proses sync harus dibangun (terkait ADR-006) | Poor — kompleksitas cluster tertinggi di antara semua opsi | Good — kompleksitas implementasi rendah (SaaS terkelola), tapi tetap butuh sync data | Good — kompleksitas bertahap, tidak sekaligus |
| Biaya | Excellent — termasuk dalam biaya Supabase yang sudah dibayar | Fair — Typesense Cloud berbayar per node/mulai menengah; self-hosted butuh compute tambahan | Poor — biaya infrastruktur cluster tertinggi | Poor — model harga per-record+request, dapat melonjak cepat seiring pertumbuhan listing | Good — biaya rendah di awal, terkendali karena migrasi baru terjadi saat volume (dan revenue) sudah mendukung |
| Maintainability | Good — tim cukup menguasai SQL, tidak ada sistem asing baru | Fair — butuh keahlian baru (skema Typesense, sinkronisasi) | Fair — butuh keahlian DevOps khusus (cluster tuning) | Good — SaaS berarti maintenance vendor, tapi ketergantungan penuh pada API eksternal | Good — beban maintenance baru muncul terjadwal, bukan mendadak |
| Developer Experience | Good — SQL sudah dikenal tim | Excellent — API & dokumentasi Typesense dinilai sangat DX-friendly oleh komunitas | Fair — kurva belajar API Elasticsearch cukup curam | Excellent — SDK & dashboard Algolia sangat matang | Good — DX baik di kedua fase |
| AI Friendliness (relevan untuk Bolt.new/AI Coding Assistant) | Excellent — query SQL adalah pola paling umum dipahami AI coding assistant | Good — pola REST API standar, cukup mudah di-generate AI, tapi kurang umum dibanding SQL | Fair — query DSL Elasticsearch lebih rumit untuk digenerate AI secara konsisten | Good — SDK terdokumentasi baik, mudah digenerate AI | Good |
| Risiko Vendor Lock-in | Excellent — nol lock-in, murni Postgres | Fair — lock-in sedang (open-source, dapat self-host/migrasi), tapi skema index proprietary | Fair — mirip Typesense, sedikit lebih rendah karena OpenSearch adalah standar terbuka | Poor — lock-in tinggi, data/relevance-tuning hidup di platform Algolia | Good — mulai nol lock-in, meningkat terkendali saat migrasi (dengan exit plan yang sudah direncanakan) |
| Kemudahan Migrasi di Masa Depan | Good — Postgres adalah dasar netral, migrasi ke mesin lain relatif mudah dilakukan kapan pun | Good — jika perlu migrasi ke Elasticsearch, konsepnya cukup mirip | Good — sudah di puncak, jarang perlu migrasi lanjutan | Fair — migrasi keluar dari Algolia butuh rebuild ranking/relevance logic dari nol | Excellent — dirancang eksplisit dengan exit/entry plan bertahap sejak awal |

**Catatan panel:** Alternatif C (Elasticsearch/OpenSearch) dan D (Algolia) secara teknis kompeten, namun keduanya gagal pada kriteria yang paling dekat dengan konteks proyek ini (tim kecil, arsitektur serverless minimal-vendor yang sudah dikunci di ADR-001, Bolt.new sebagai alat pengembangan utama). Panel menyepakati keduanya **tetap dicatat sebagai Alternatives Considered** di ADR, bukan dihapus dari perbandingan.

---

# TAHAP 5 — Rekomendasi CTO

## Keputusan: **Alternatif E — Hybrid Bertahap: PostgreSQL Full-Text Search + pg_trgm sebagai MVP Fase 1, dengan kriteria ambang migrasi eksplisit ke Typesense**

### Mengapa ini, bukan yang lain — berdasarkan kebutuhan proyek, bukan popularitas:

1. **Konsistensi dengan ADR-001 yang sudah Approved.** Backend platform ini sudah dikunci ke Next.js Route Handlers + Supabase, tanpa service terpisah. Menambah Typesense/Elasticsearch/Algolia **sejak hari pertama** berarti memperkenalkan komponen infrastruktur independen pertama di luar Supabase/Vercel — bertentangan langsung dengan filosofi minimal-vendor yang baru saja disahkan panel pada ADR-001. Postgres FTS adalah satu-satunya opsi yang **nol tambahan komponen**.

2. **Volume listing riil di Fase 1 belum menuntut mesin pencari khusus.** Tidak ada satu pun dokumen proyek (PRD, roadmap) yang memproyeksikan volume listing awal pada skala yang membuat Postgres FTS+trigram menjadi bottleneck nyata. Trigram index (GIN) di Postgres modern menangani puluhan ribu baris dengan latensi yang tetap dalam anggaran UX wajar untuk kombinasi filter yang didefinisikan API Spec §3.

3. **Ketergantungan langsung terhadap ADR-006 (Job Queue) yang juga masih OPEN.** Ketiga alternatif berbasis index eksternal (B, C, D) semuanya membutuhkan mekanisme sinkronisasi data listing → index — mekanisme itu sendiri adalah keputusan job queue yang **belum disahkan**. Memilih Typesense/Elasticsearch/Algolia sekarang berarti membuat asumsi implisit tentang ADR-006 sebelum ADR-006 diputuskan sendiri — melanggar prinsip governance proyek ("AI/tim tidak boleh berasumsi salah satu opsi ADR lain sudah dipilih").

4. **Bolt.new & AI Coding Assistant sebagai alat pengembangan utama.** Kriteria AI Friendliness bukan kriteria kosmetik untuk proyek ini — seluruh `ai-development-blueprint.md` dan pola kerja proyek bergantung pada AI Coding Assistant men-generate kode secara konsisten lintas sesi. Query SQL/Postgres adalah pola paling matang dan paling dapat diprediksi bagi AI code generation dibanding DSL pencarian khusus (Typesense query syntax, Elasticsearch Query DSL).

5. **Biaya dan risiko vendor lock-in paling rendah untuk tahap ini.** Tidak ada proyeksi revenue/monetisasi yang final (Open Decision #6 model monetisasi platform juga masih terbuka di `foundation-validation-report.md`) — menambah biaya infrastruktur SaaS pencarian sebelum model bisnis final adalah risiko finansial yang tidak proporsional terhadap fase proyek saat ini.

6. **Bukan pilihan permanen — exit plan sudah built-in.** Berbeda dari sekadar memilih Alternatif A secara flat, Alternatif E secara eksplisit mewajibkan **kriteria ambang migrasi terukur** ditetapkan bersamaan dengan ADR ini (lihat Tahap 6 & 8), sehingga migrasi ke Typesense (opsi kedua terbaik di tabel) menjadi keputusan terjadwal, bukan reaktif saat performa sudah mendegradasi UX pengguna nyata.

**Mengapa bukan Typesense langsung sejak awal?** Panel mengakui Typesense unggul di hampir semua kriteria teknis murni (skalabilitas, DX, typo-tolerance). Namun proyek ini sedang di fase MVP dengan tim kecil, backend serverless minimal-vendor yang baru dikunci, dan ADR-006 yang belum selesai — mengadopsi komponen infrastruktur baru sebelum kebutuhan riil muncul adalah over-engineering yang bertentangan dengan prinsip "pilih berdasarkan kebutuhan proyek, bukan kapabilitas maksimal."

**Mengapa bukan Elasticsearch/Algolia?** Keduanya secara konsisten kalah di kriteria Biaya, Kompleksitas, dan/atau Vendor Lock-in dibanding Typesense sekalipun — sehingga tidak ada skenario di proyek ini di mana keduanya lebih unggul dari Typesense sebagai opsi migrasi masa depan. Panel tidak merekomendasikan keduanya bahkan sebagai target migrasi jangka panjang, kecuali kebutuhan sangat spesifik (mis. agregasi analitik kompleks skala besar) muncul di luar cakupan platform saat ini.

---

# TAHAP 6 — Dampak Keputusan

| Area | Dampak |
|---|---|
| **Architecture** | Tidak ada komponen infrastruktur baru di Fase 1. Search layer hidup sepenuhnya di dalam Route Handlers (`/apps/web/app/api/properties/search`, dst.) sesuai ADR-001. Diagram arsitektur `SYSTEM-ARCHITECTURE.md` perlu menambahkan blok "Search: Postgres FTS/pg_trgm (Fase 1) → Typesense (Fase 2, terjadwal)" agar tidak lagi kosong di area ini. |
| **ERD** | Perlu penambahan kolom turunan pada tabel `listings`: kolom `search_vector` bertipe `tsvector` (generated column, digabung dari `title`, `description`, `area_keyword`, dsb.) plus indeks GIN. Tidak ada tabel baru — perubahan minor pada entitas eksisting, bukan struktural. |
| **Database Schema** | Migration baru: `ALTER TABLE listings ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (...) STORED;` + `CREATE INDEX idx_listings_search_vector ON listings USING GIN(search_vector);` + ekstensi `pg_trgm` diaktifkan (`CREATE EXTENSION IF NOT EXISTS pg_trgm;`) untuk mendukung autocomplete fuzzy pada `area_keyword`/`title`. |
| **API** | `GET /properties/search` dan `/properties/autocomplete` (API Spec §3) diimplementasikan penuh menggunakan query Postgres (`to_tsquery`/`similarity()`), tidak lagi berstatus `// TODO: menunggu resolusi ADR-005`. `/properties/map-bounds` dan `/properties/nearby` tidak terpengaruh (sudah murni geospasial berbasis lat/lng, tidak bergantung mesin pencari teks). |
| **Folder Structure** | Tidak ada folder/service baru. Logic pencarian tetap di dalam `/apps/web` sesuai struktur Route Handlers yang sudah disepakati ADR-001 — tidak ada `/apps/search-service` atau sejenisnya. |
| **Security** | Query pencarian tetap tunduk RLS Supabase yang sudah berjalan (ADR-003/ADR-004) — tidak ada lapisan otorisasi baru yang perlu dirancang untuk data eksternal (berbeda dari opsi B/C/D yang butuh replikasi kebijakan akses ke sistem index terpisah). |
| **Performance** | Perlu benchmark awal pada volume data seed realistis (mis. 1.000–10.000 listing) untuk memvalidasi latensi p95 filter kombinasi + fuzzy search sebelum Sprint S5 ditutup — ini menjadi prasyarat validasi teknis, bukan asumsi. |
| **Deployment** | Nol perubahan pada pipeline deploy Vercel — migration Postgres berjalan lewat mekanisme migrasi Supabase yang sudah ada. |
| **Maintenance** | Tim cukup memantau performa query GIN index seiring pertumbuhan data; tidak ada operasional cluster/vendor SaaS tambahan yang perlu dipantau di Fase 1. |
| **Development Workflow** | AI Coding Assistant dapat langsung mengimplementasikan `/properties/search` & `/properties/autocomplete` di Sprint yang relevan — status `// TODO: menunggu resolusi ADR-005` di `ai-development-blueprint.md` §22.3 dapat dihapus setelah ADR ini Approved. |

---

# TAHAP 7 — Dokumen yang Harus Diperbarui

1. `technology-decisions.md` §9.2 — pindahkan dari "Open Questions" ke "Official Technology Stack" dengan entri: Search Engine = PostgreSQL FTS + pg_trgm (Fase 1), Typesense (Fase 2 terjadwal).
2. `architecture-decision-records.md` Bagian 4 — update status ADR-005 dari OPEN → Approved, isi lengkap sesuai Tahap 8 di bawah.
3. `architecture-decision-records.md` Bagian 5 (Open Decisions Summary) — hapus baris ADR-005 dari tabel Open Decisions, tambahkan catatan "telah diselesaikan" seperti pola ADR-001.
4. `architecture-decision-records.md` Bagian 6 (Dependency Matrix) & Bagian 7 (Impact Analysis) — pindahkan ADR-005 dari daftar OPEN, catat sebagai [APPROVED] pada diagram dependency.
5. `decision-log.md` — tambahkan entri ADR baru (nomor lanjutan, mis. ADR-039 mengikuti pola penomoran independen yang sudah dicatat sebagai Governance Note) dengan Context/Decision/Rationale/Consequences lengkap, merujuk-silang ke ADR-005.
6. `decision-log.md` Bagian 11 (Open Decisions) — tandai baris Search Engine sebagai resolved, rujuk ke ADR baru.
7. `CURRENT-PROJECT-STATE.md` — hapus baris "Search Engine ... belum masuk Official Technology Stack" dari tabel gap, update tabel "Open Decision (ADR) yang Tersisa" (hapus ADR-005, sisakan ADR-006, ADR-008, ADR-018).
8. `CHANGELOG.md` — tambahkan entri perubahan versi dokumen terkait (technology-decisions, ADR records, decision-log, current-project-state).
9. `ai-development-blueprint.md` §22.3 — hapus baris ADR-005 dari tabel "Menangani Modul yang Bergantung pada ADR OPEN"; update §23 (Development Order) agar Modul 3 tidak lagi mencatat placeholder search.
10. `ERD-Skema-Database-Real-Estate-Agency-v1.1.md` — dokumentasikan kolom `search_vector` baru pada entitas `listings` beserta index GIN terkait.
11. `API-Specification-RUMAHAGEN-v1.1.md` §3 — tambahkan catatan implementasi resmi (Postgres FTS Fase 1) di bawah judul bagian, menggantikan catatan lama "direkomendasikan didukung Typesense/Elasticsearch" agar tidak menyesatkan sesi development berikutnya.
12. `foundation-validation-report.md` — tidak diedit ulang (bersifat point-in-time/historis sesuai prinsip dokumen ini), namun dapat ditambahkan catatan referensi silang bila laporan sinkronisasi terpisah dibuat (mengikuti pola `synchronization-report-adr-001.md`).

---

# TAHAP 8 — Architecture Decision Record

```markdown
Decision ID: ADR-005
Title: Search Strategy — PostgreSQL Full-Text Search + pg_trgm (Fase 1), Typesense (Fase 2 Terjadwal)
Status: Approved

Context:
API-Specification-v1.1.md §3 mensyaratkan endpoint /properties/search dan
/properties/autocomplete dengan filter kombinasi (kategori, tipe transaksi,
lokasi cascading, rentang harga/luas, kamar, sertifikat) serta typo-tolerance
pada autocomplete. Belum ada mesin pencari resmi yang tercatat di
technology-decisions.md "Official Technology Stack" — tercatat sebagai Open
Question (§9.2) dan Open Decision (decision-log.md, foundation-validation-
report.md Gap H2). Keputusan backend (ADR-001: Next.js Route Handlers +
Supabase, tanpa service terpisah) sudah Approved 27 Juli 2026, menjadi
konteks langsung bagi keputusan ini karena menentukan preferensi terhadap
solusi tanpa komponen infrastruktur tambahan.

Decision:
Mengadopsi strategi bertahap (hybrid):
- Fase 1 (MVP, saat ini s.d. ambang migrasi tercapai): PostgreSQL Full-Text
  Search (tsvector/tsquery) dikombinasikan ekstensi pg_trgm untuk fuzzy/typo-
  tolerance terbatas pada autocomplete. Kolom generated `search_vector`
  ditambahkan pada tabel `listings` dengan index GIN.
- Kriteria ambang migrasi ke Fase 2 (Typesense), salah satu terpenuhi:
  (a) volume listing aktif melampaui ~50.000 baris, ATAU
  (b) latensi p95 endpoint /properties/search melampaui 500ms pada beban
      produksi terukur, ATAU
  (c) keluhan relevansi pencarian dari pengguna terverifikasi berulang
      (≥3 laporan independen dalam satu sprint) yang tidak dapat diperbaiki
      lewat tuning index Postgres.
- Fase 2 (jika kriteria di atas terpenuhi): migrasi ke Typesense (self-hosted
  atau Typesense Cloud), dengan mekanisme sinkronisasi data yang keputusan
  detailnya bergantung pada resolusi ADR-006 (Job Queue Strategy).

Rationale:
1. Konsisten dengan ADR-001 (Approved) — tidak menambah komponen
   infrastruktur di luar Supabase/Vercel pada fase saat ini.
2. Tidak ada proyeksi volume listing di PRD/roadmap yang membuat Postgres
   FTS menjadi bottleneck nyata di Fase 1.
3. Sinkronisasi data ke index eksternal bergantung pada ADR-006 yang masih
   OPEN — memilih mesin eksternal sekarang berarti berasumsi terhadap ADR
   lain yang belum disahkan, melanggar governance rule proyek.
4. Query SQL adalah pola paling matang untuk AI Coding Assistant/Bolt.new
   men-generate kode secara konsisten lintas sesi (AI Friendliness).
5. Biaya dan risiko vendor lock-in paling rendah untuk fase proyek saat ini,
   selaras model monetisasi platform yang juga masih belum final.
6. Strategi ini bukan keputusan permanen — kriteria migrasi eksplisit
   mencegah keputusan reaktif di masa depan.

Alternatives Considered:
- Typesense sejak Fase 1 — unggul teknis (skalabilitas, DX, typo-tolerance)
  namun menambah komponen infrastruktur & ketergantungan pada ADR-006
  sebelum diperlukan; ditolak untuk Fase 1, dipertahankan sebagai target
  migrasi Fase 2.
- Elasticsearch/OpenSearch — kapabilitas setara/lebih dari Typesense namun
  kompleksitas operasional dan biaya tertinggi di antara semua opsi;
  ditolak untuk seluruh fase proyek saat ini kecuali kebutuhan agregasi
  analitik kompleks muncul di luar cakupan platform.
- Algolia (SaaS) — implementasi tercepat namun vendor lock-in tertinggi dan
  model biaya per-record+request berisiko melonjak seiring pertumbuhan
  listing; ditolak karena model monetisasi platform sendiri belum final.

Consequences:
- Positif: Nol biaya infrastruktur tambahan, nol vendor baru, implementasi
  dapat langsung dimulai tanpa menunggu ADR-006, selaras arsitektur
  serverless minimal-vendor.
- Negatif/Trade-off: Typo-tolerance Fase 1 lebih terbatas dibanding mesin
  pencari khusus — perlu dikomunikasikan sebagai batasan MVP yang disengaja,
  bukan bug. Tim wajib memantau tiga kriteria ambang migrasi secara berkala
  (bukan sekali di awal saja) agar migrasi Fase 2 tidak terlambat.
- Turunan: ADR-006 (Job Queue) kini dapat diputuskan tanpa ketergantungan
  urgent dari ADR-005 — kedua ADR tidak lagi saling memblokir keputusan.

Affected Documents:
technology-decisions.md §9.2, architecture-decision-records.md (Bagian 4,
5, 6, 7), decision-log.md, CURRENT-PROJECT-STATE.md, CHANGELOG.md,
ai-development-blueprint.md §22.3/§23, ERD-Skema-Database-Real-Estate-
Agency-Platform-v1.1.md, API-Specification-RUMAHAGEN-
v1.1.md §3.

Review Date:
Ditinjau ulang setiap kali salah satu dari tiga kriteria ambang migrasi
(volume/latensi/keluhan relevansi) terpenuhi, atau maksimal setiap akhir
kuartal pasca-launch sebagai pemeriksaan rutin — mana yang lebih dulu
tercapai.
```

---

# TAHAP 9 — Perubahan ke Technology Decisions, Decision Log, Changelog

### `technology-decisions.md` §9.2 (perubahan yang harus dimasukkan)
- Hapus poin 1 dari daftar "Open Questions" (Search Engine).
- Tambahkan ke tabel "Official Technology Stack": baris baru — **Search Engine: PostgreSQL Full-Text Search + pg_trgm (Fase 1) → Typesense (Fase 2, kriteria ambang terjadwal — lihat ADR-005)**.
- Tambahkan catatan referensi silang ke ADR-005 mengikuti pola catatan ADR-001 yang sudah ada di Bagian 3/6.

### `decision-log.md` (entri baru)
```
## ADR-039 — Search Strategy: PostgreSQL FTS (Fase 1) → Typesense (Fase 2)

Date: 2026-07-28
Status: Approved
Category: Architecture, Backend, Database
Related Documents: architecture-decision-records.md ADR-005,
technology-decisions.md §9.2, API-Specification-v1.1.md §3

Problem: Endpoint /properties/search & /properties/autocomplete sudah
didefinisikan API Spec, namun mesin pencari belum resmi dipilih.

Decision: PostgreSQL FTS+pg_trgm sebagai MVP Fase 1, migrasi terjadwal ke
Typesense saat salah satu dari tiga kriteria ambang (volume listing >50.000,
latensi p95 >500ms, atau keluhan relevansi berulang) terpenuhi.

Reason: Konsistensi dengan ADR-001 (minimal-vendor), menghindari
ketergantungan prematur pada ADR-006 yang masih OPEN, AI-friendliness untuk
Bolt.new/AI Coding Assistant, biaya & vendor lock-in terendah untuk fase ini.

Consequences: Typo-tolerance Fase 1 lebih terbatas; tim wajib memantau
kriteria ambang migrasi secara berkala.
```
- Update Bagian 11 (Open Decisions): hapus baris Search Engine, tandai resolved dengan rujukan ke ADR-039.
- Update tabel Decision Categories (Bagian 6): tambahkan ADR-039 ke kategori Architecture/Backend/Database.

### `CHANGELOG.md` (entri baru)
```
## [Unreleased] — 2026-07-28

### Decided
- ADR-005 (Search Strategy) resmi Approved via sesi Architecture Review
  Board: PostgreSQL Full-Text Search + pg_trgm sebagai MVP Fase 1, dengan
  kriteria ambang migrasi eksplisit ke Typesense di Fase 2.

### Changed
- technology-decisions.md §9.2: Search Engine dipindahkan dari Open
  Questions ke Official Technology Stack.
- architecture-decision-records.md: status ADR-005 diubah OPEN → Approved;
  dihapus dari tabel Open Decisions Summary.
- decision-log.md: entri ADR-039 ditambahkan, Open Decisions Bagian 11
  diperbarui.
- CURRENT-PROJECT-STATE.md: baris gap Search Engine dihapus dari tabel
  Open Decision yang Tersisa.
- ai-development-blueprint.md §22.3/§23: placeholder "// TODO: menunggu
  resolusi ADR-005" pada Modul 3 dapat dihapus untuk fitur search lanjutan.
```

---

# TAHAP 10 — Keputusan Akhir

## **APPROVED WITH NOTES**

**Catatan yang menyertai persetujuan:**

1. **Approval formal tetap memerlukan tanda tangan manusia berwenang.** Sesuai `architecture-decision-records.md` Bagian 9 (Governance Rules): "AI Coding Assistant tidak berwenang mengubah status ADR menjadi Approved." Panel simulasi ini menghasilkan **rekomendasi lengkap siap-sah**, namun status final ADR-005 di dokumen proyek (`decision-log.md`, `architecture-decision-records.md`) baru benar-benar berubah menjadi Approved setelah Technical Lead/Enterprise Solution Architect/CTO bernama (individu, bukan peran — lihat Open Decision governance #6 di `executive-architecture-review.md`) mengonfirmasi secara eksplisit.

2. **Kriteria ambang migrasi (Tahap 8) adalah bagian tak terpisahkan dari keputusan ini** — bukan angka final yang tidak bisa didiskusikan, melainkan baseline awal yang wajib divalidasi/disesuaikan tim bisnis & Database Architect bernama begitu data produksi awal tersedia.

3. **Informasi yang masih diperlukan sebelum implementasi teknis dimulai (tidak diasumsikan di sini):**
   - Estimasi proyeksi volume listing realistis untuk 6–12 bulan pertama dari tim bisnis, untuk memvalidasi/menyesuaikan angka ambang 50.000 baris yang digunakan sebagai baseline awal di ADR ini.
   - Konfirmasi apakah tim punya kapasitas DevOps untuk mengelola Typesense self-hosted di masa depan, atau apakah anggaran Typesense Cloud sudah realistis dimasukkan proyeksi biaya operasional — ini akan menentukan detail pelaksanaan Fase 2 saat kriteria ambang tercapai (bukan mengubah keputusan Fase 1 saat ini).

Keputusan ini **tidak memblokir Sprint S0–S4** dan **wajib disahkan secara formal sebelum Sprint S5** sesuai tenggat yang sudah tercatat di dokumen proyek.
