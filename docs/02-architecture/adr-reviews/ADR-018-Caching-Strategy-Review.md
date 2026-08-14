# Architecture Review Board — Sesi Resolusi ADR-018
## Topik: Caching Strategy (Application-Level / Rate Limiting) — RUMAHAGEN

**Peserta Panel:** CTO, Principal Software Architect, Enterprise Solution Architect, Senior Backend Architect, Senior Frontend Architect, Cloud Architect, DevOps Architect, Database Architect, Security Architect, AI Development Architect, Technical Lead

**Tanggal Sesi:** 31 Juli 2026
**Status Awal:** OPEN (ADR-018 di `architecture-decision-records.md`) — satu-satunya ADR teknis yang masih terbuka dari 25 ADR proyek

---

# TAHAP 1 — Mengapa Keputusan Ini Penting

`architecture-decision-records.md` ADR-018 dan `PROJECT-CONSTITUTION.md` §20 (hard rule ADR-017, Security Strategy) mewajibkan **rate limiting bertingkat** untuk endpoint sensitif (login, register, forgot-password, submit form publik) — namun hard rule ini belum disertai mekanisme penyimpanan status lintas-instance yang eksplisit. Di lingkungan serverless (Vercel Functions), setiap invocation berpotensi berjalan di instance berbeda, sehingga in-memory counter **tidak reliable** untuk menegakkan rate limit yang benar.

ADR-018 sebelumnya digantung pada hasil ADR-006 (Job Queue) — *"jika BullMQ dipilih, Redis otomatis dibutuhkan, menyelesaikan dua keputusan sekaligus"* (`architecture-decision-records.md` Bagian 4). ADR-006 telah final memilih **Vercel Cron Jobs + Postgres Trigger/Database Webhook, tanpa BullMQ maupun Redis**. Konsekuensinya, ADR-018 kini **sepenuhnya independen** — tidak ada lagi keputusan lain yang menyelesaikannya secara tidak langsung, dan harus diputuskan sendiri di sesi ini.

Keputusan ini penting karena:

- **Menutup satu-satunya hard rule keamanan (ADR-017) yang sampai saat ini hanya berupa niat tanpa mekanisme konkret** — `architecture-decision-records.md` mencatat referensi "blocklist Redis/DB" di `PROJECT-CONSTITUTION.md` §10 tanpa kepastian implementasi.
- **Relevan lebih cepat dari perkiraan sebelumnya.** Sebelumnya dicatat "dapat ditunda melewati MVP awal", namun endpoint sensitif pertama (login/register) sudah muncul di **Sprint S1 (Authentication)** — sprint kedua dalam roadmap, bukan fase lanjutan.
- **Menutup ADR terakhir yang masih OPEN.** Menyelesaikan ADR-018 berarti 25 dari 25 ADR arsitektur proyek berstatus Approved — tidak ada lagi celah bagi sesi AI Coding Assistant berbeda untuk berasumsi berbeda-beda soal mekanisme rate limiting.
- **Berkonsekuensi langsung pada keputusan infrastruktur** — harus konsisten dengan prinsip serverless-native minimal-vendor yang sudah dikunci ADR-001/005/006/008, bukan diputuskan terpisah dari pola tersebut.

**Kesimpulan Tahap 1:** Keputusan **prioritas Rendah dari sisi kompleksitas teknis**, namun **penting untuk ditutup segera** karena relevansinya sudah dimulai sejak Sprint S1 dan merupakan satu-satunya sisa celah governance arsitektur di seluruh proyek.

---

# TAHAP 2 — Identifikasi Seluruh Alternatif Realistis

### Alternatif A — Postgres-native (Supabase) — tabel `rate_limit_log` dengan sliding window
Memakai database yang sudah menjadi tulang punggung proyek (Supabase Postgres) sebagai penyimpan status rate limit, lewat tabel dedicated dengan index komposit `(identifier, action_type, window_start)`. Tidak ada infrastruktur baru — murni migration SQL + query di dalam Route Handler/middleware yang sudah ada.

### Alternatif B — Upstash Redis (serverless, REST-based)
Redis-as-a-service yang didesain untuk edge/serverless — diakses via HTTP REST (bukan koneksi TCP persisten seperti Redis klasik), dengan SDK `@upstash/ratelimit` yang menyediakan pola sliding-window/token-bucket siap pakai untuk Next.js.

### Alternatif C — Vercel KV (managed, dibangun di atas Upstash)
Produk native Vercel yang terintegrasi langsung ke dashboard dan environment variable proyek Vercel yang sudah dipakai (ADR-010). Secara teknis adalah Upstash yang dikemas ulang oleh Vercel.

### Alternatif D — Traditional self-hosted Redis (VM/Redis Cloud dedicated)
Redis klasik dengan koneksi TCP persisten — pola pra-serverless yang membutuhkan connection pooling dan provisioning instance sendiri.

### Alternatif E — Tanpa cache aplikasi tambahan (in-memory best-effort per-instance)
Tidak menambah apa pun; rate limiting hanya mengandalkan counter in-memory per invocation, yang di lingkungan serverless pada praktiknya tidak konsisten lintas-instance.

Panel menyepakati kelima alternatif ini layak dibandingkan, termasuk mempertahankan Alternatif D dan E dalam perbandingan eksplisit meski secara arsitektural lemah untuk kebutuhan proyek — keputusan tidak boleh menolak opsi tanpa perbandingan tercatat.

---

# TAHAP 3 & 4 — Perbandingan Alternatif

**Skala penilaian:** Excellent / Good / Fair / Poor

| Kriteria | A. Postgres-native (Supabase) | B. Upstash Redis | C. Vercel KV | D. Self-hosted Redis | E. Tanpa Cache Tambahan |
|---|---|---|---|---|---|
| Kesesuaian dengan PRD (rate limiting hard rule ADR-017) | Good | Excellent | Excellent | Good | Poor |
| Kesesuaian dengan ERD | Good — 1 tabel baru, konsisten pola 37+ entitas existing | Fair — status hidup di luar ERD, perlu dicatat governance-nya | Fair — sama seperti B | Fair — sama seperti B | Excellent — tidak menyentuh ERD sama sekali |
| Integrasi dengan Supabase | Excellent — native, satu database yang sama | Good — independen, tidak konflik | Good — independen | Fair — perlu networking terpisah dari Supabase | Excellent — tidak ada dependency baru |
| Integrasi dengan Bolt.new | Excellent — hanya migration SQL, pola sangat dikenal | Good — perlu env var & SDK tambahan | Good — perlu setup dashboard Vercel | Poor — provisioning manual di luar alur Bolt.new | Excellent — tidak ada yang perlu digenerate |
| Integrasi dengan Vercel | Good | Excellent — didesain untuk Edge/Serverless Functions | Excellent — produk native Vercel | Poor — koneksi TCP persisten tidak cocok serverless | Excellent |
| Skalabilitas | Fair — tiap request menambah beban query ke database utama | Excellent — terpisah dari database utama, didesain traffic tinggi | Excellent | Excellent (jika di-provision besar) tapi mahal | Poor — tidak scalable untuk enforcement akurat |
| Kompleksitas implementasi | Fair — perlu logic sliding window manual di SQL/function | Good — SDK `@upstash/ratelimit` sudah siap pakai | Good — sama seperti B | Poor — perlu provisioning, connection pooling, monitoring sendiri | Excellent (paling sederhana) tapi mengorbankan fungsi |
| Biaya | Excellent — Rp0 tambahan, memakai kuota Supabase yang sudah dibayar | Good — free tier tersedia, bayar sesuai request di luar itu | Good — mirip B, terikat harga Vercel | Poor — biaya instance tetap meski idle | Excellent — Rp0 |
| Maintainability | Good — satu sumber kebenaran data (Postgres), dipantau lewat tooling Supabase yang sudah dipakai | Good — menambah satu vendor/dashboard baru untuk dipantau | Fair — terikat ke ekosistem Vercel (lock-in lebih dalam) | Poor — overhead ops signifikan untuk tim kecil | Poor — tidak ada yang dijaga, tapi fungsi keamanan juga hilang |
| Developer Experience | Fair — perlu tulis SQL function terkontrol untuk sliding window | Excellent — SDK ergonomis, dokumentasi matang untuk Next.js | Excellent — plug-and-play di dashboard Vercel | Fair | Excellent (paling simpel) tapi fungsional lemah |
| AI Friendliness (Bolt.new/AI Coding Assistant) | Excellent — pola migration SQL sudah dikenal luas di seluruh codebase proyek | Good — pola SDK third-party, AI perlu context tambahan | Good — sama seperti B | Fair — provisioning manual sulit diotomasi AI | Excellent — tidak ada yang perlu diimplementasi |
| Risiko Vendor Lock-in | Excellent — 100% tetap dalam ekosistem Supabase yang sudah jadi dependency inti | Fair — vendor baru (Upstash), meski API Redis standar | Poor — terikat langsung ke Vercel, migrasi keluar Vercel mahal | Fair — Redis API standar, tapi provider tergantung pilihan | Excellent — tidak ada vendor baru |
| Kemudahan migrasi masa depan (ke Redis penuh bila traffic besar) | Good — cukup ganti implementasi rate-limit-nya, kontrak fungsi tidak berubah jika diabstraksi | Excellent — sudah di titik akhir yang dituju kalau scale besar | Good — tapi terkunci ke Vercel | — (sudah di titik akhir) | Fair — migrasi nanti berarti membangun dari nol |

---

# TAHAP 5 — Rekomendasi CTO

**Keputusan: Alternatif A — Postgres-native rate limiting/cache di atas Supabase**, sebagai keputusan Fase 1 (MVP), dengan **Upstash Redis (Alternatif B)** dicatat sebagai **Approved Alternative / jalur migrasi Fase 2** apabila kriteria ambang tercapai.

**Alasan (berbasis kebutuhan proyek, bukan popularitas):**

1. **Konsistensi dengan pola arsitektur yang sudah tervalidasi tiga kali berturut-turut.** ADR-005 (Search: Postgres FTS dulu, Typesense nanti), ADR-006 (Job Queue: Vercel Cron+Postgres Trigger dulu, QStash nanti), dan ADR-008 (Maps: LocationIQ/Geoapify dulu, upgrade bertahap nanti) — seluruhnya mengikuti prinsip yang sama: **native-first di atas infrastruktur yang sudah dibayar, upgrade ke layanan khusus hanya setelah kriteria ambang traffic nyata tercapai**. Memilih Redis sekarang berarti menyimpang dari pola yang sudah divalidasi CTO tiga kali sebelum volume traffic MVP membenarkannya.
2. **ADR-006 secara eksplisit sudah menolak Redis** untuk kebutuhan job queue dengan alasan "tidak kompatibel dengan model serverless" — murni karena kebutuhan *worker long-running*. Rate limiting **tidak butuh worker**, hanya butuh state store yang cepat dibaca/ditulis; Postgres dengan index komposit yang tepat cukup untuk volume request endpoint sensitif di skala MVP (jauh lebih rendah dari traffic listing/search publik).
3. **Nol dependency/vendor baru** untuk dipantau tim yang masih kecil — selaras dengan Golden Rule larangan instalasi infrastruktur preventif yang sudah ditegaskan berulang di ADR-005/006/008.
4. **Paling mudah dieksekusi Bolt.new/AI Coding Assistant** — migration SQL biasa, konsisten dengan seluruh pola skema database lain di proyek, tanpa perlu "belajar" SDK vendor baru di luar `dependency-manifest.md`.
5. **Risiko vendor lock-in paling rendah** — tetap 100% di dalam Supabase.

**Trade-off yang diterima secara sadar:** performa rate-limit check Postgres-based sedikit lebih lambat dibanding Redis murni (low-single-digit ms vs sub-ms) — diterima karena volume endpoint sensitif di MVP rendah. Bila kebutuhan cache aplikasi generik (bukan hanya rate limit) muncul dari modul lain (mis. dashboard/laporan admin bervolume besar), keputusan ini ditinjau ulang dengan kriteria ambang eksplisit — sama seperti pola ADR-005/006/008.

**Catatan risiko dari Cloud Architect & DevOps Architect (bukan veto):** jika traffic tumbuh signifikan lebih cepat dari perkiraan, tabel `rate_limit_log` berpotensi menjadi *hot table* yang membebani database utama. Dimitigasi lewat kriteria ambang migrasi eksplisit (Tahap 8) dan kebijakan retensi baris.

---

# TAHAP 6 — Dampak Keputusan

| Dimensi | Dampak |
|---|---|
| **Architecture** | Menambah satu lapisan utilitas baru (`lib/rate-limit/`) dipanggil dari middleware/Route Handler pada endpoint sensitif. Tidak mengubah topologi arsitektur — tetap sepenuhnya di dalam `apps/web` + Supabase, konsisten ADR-001. |
| **ERD** | **+1 tabel baru**: `rate_limit_log` — kolom minimal `id`, `identifier` (IP/user_id/email), `action_type` (login/register/reset-password/dst.), `attempt_count`, `window_start`, `blocked_until`. Ditambahkan ke `ERD-Skema-Database-...v1.1.md` dan diagram Mermaid. |
| **Database Schema** | Index komposit `(identifier, action_type, window_start)` wajib. Kebijakan retensi (hapus baris >7 hari) memanfaatkan mekanisme Vercel Cron yang sudah ada dari ADR-006 — tanpa infrastruktur job baru. |
| **API** | Endpoint sensitif (`POST /auth/login`, `/auth/register`, `/auth/forgot-password`, form publik submit lead) menambahkan pemeriksaan rate-limit di awal handler, mengembalikan `429 Too Many Requests` + header `Retry-After` sesuai konvensi `API-Specification-v1.1.md` §0. |
| **Folder Structure** | `lib/rate-limit/` — logic sliding window + query Supabase, satu sumber kebenaran sesuai `CURRENT-PROJECT-STATE.md` AI Session Rules poin 6. |
| **Security** | Menutup gap hard rule ADR-017 yang sebelumnya tanpa mekanisme konkret — rate limiting kini punya penyimpanan status lintas-instance yang eksplisit dan dapat diaudit. |
| **Performance** | Tambahan 1 query Postgres kecil (indexed) per request endpoint sensitif — dampak diperkirakan minimal, perlu diverifikasi load test sebelum launch, bukan diasumsikan. |
| **Deployment** | Tidak ada perubahan pipeline/environment variable baru — memakai koneksi Supabase yang sudah ada. |
| **Maintenance** | Satu dashboard (Supabase) dipantau, bukan dashboard tambahan (Upstash/Vercel KV) — mengurangi operational surface. |
| **Development Workflow** | AI Coding Assistant menulis migration SQL dengan pola yang sudah dikenal dari tabel-tabel ERD lain — tanpa sesi terpisah mempelajari SDK vendor baru. |

---

# TAHAP 7 — Dokumen yang Harus Diperbarui

1. `architecture-decision-records.md` — ADR-018 status OPEN → Approved (isi lengkap Tahap 8)
2. `technology-decisions.md` — tambahkan entri *Rate Limiting Strategy: Postgres-native (Supabase)*, hapus status "belum ditentukan"
3. `dependency-manifest.md` — catat eksplisit tidak ada package Redis/Upstash/Vercel KV terinstal Fase 1; tambahkan larangan instalasi preventif (konsisten Golden Rule ADR-005/006/008)
4. `SYSTEM-ARCHITECTURE.md` — tambahkan sub-bagian rate limiting di §14 (Security)
5. `ERD-Skema-Database-Real-Estate-Agency-v1.1.md` + diagram Mermaid — entitas `rate_limit_log`
6. `API-Specification-RUMAHAGEN-v1.1.md` §0 — dokumentasikan response `429` untuk endpoint sensitif
7. `PROJECT-CONSTITUTION.md` §10/§20 — sinkronkan referensi "blocklist Redis/DB" menjadi eksplisit Postgres-based
8. `development-playbook.md`/`AI-DEVELOPMENT-BLUEPRINT.md` — Golden Rule baru: larangan instalasi Redis/Upstash/Vercel KV preventif (pola sama seperti poin 37 untuk Maps)
9. `decision-log.md` — entri kronologis baru `ADR-042`
10. `CHANGELOG.md` — rilis governance berikutnya (`0.1.5`)
11. `CURRENT-PROJECT-STATE.md` — perbarui ADR & Governance Snapshot, hapus ADR-018 dari daftar Open
12. `project-manifest.md` — Executive Dashboard (25/25 ADR Approved), Open Decision Summary (OD-13 → Resolved)
13. `document-governance-baseline-register.md` — sinkronkan status dokumen yang berubah versi

---

# TAHAP 8 — Isi ADR (Format Resmi)

**ADR-018 — Caching Strategy (Application-Level / Rate Limiting)**

**Status:** Approved
**Date:** 2026-07-31
**Owner:** Principal Software Architect (nama TBD — konsisten catatan terbuka OD-06)

**Context:** Platform menangani endpoint sensitif (login, register, forgot-password, submit form publik) yang wajib memiliki rate limiting bertingkat sesuai hard rule ADR-017 (Security Strategy)/`PROJECT-CONSTITUTION.md` §20, namun belum ada mekanisme penyimpanan status lintas-instance yang eksplisit di lingkungan serverless (Vercel Functions). ADR-018 sebelumnya digantung pada hasil ADR-006 (Job Queue) — jika BullMQ dipilih, Redis otomatis tersedia untuk kebutuhan ini sekaligus. ADR-006 telah final memilih Vercel Cron Jobs + Postgres Trigger/Database Webhook **tanpa** Redis, sehingga ADR-018 kini sepenuhnya independen dan memerlukan keputusan tersendiri.

**Decision:** Rate limiting dan application-level caching Fase 1 (MVP) diimplementasikan secara native di atas Supabase Postgres, melalui tabel dedicated `rate_limit_log` dengan pola sliding window, tanpa menambah infrastruktur cache/in-memory-store baru (Redis/Upstash/Vercel KV) pada tahap ini. Caching edge/CDN untuk halaman publik **tetap** inheren dari ADR-021 (Next.js ISR) & ADR-010 (Vercel edge caching) — tidak berubah, tidak memerlukan keputusan tambahan. Migrasi ke **Upstash Redis** (Approved Alternative untuk Fase 2) sah dilakukan hanya setelah salah satu kriteria ambang berikut tercapai **dan** disetujui manusia berwenang:
- Volume request ke endpoint sensitif >10.000 request/menit gabungan, ATAU
- Query `rate_limit_log` terukur menyumbang >15% total load database utama (via monitoring Supabase), ATAU
- Kebutuhan cache aplikasi generik (bukan hanya rate limit) muncul dari modul lain (mis. dashboard/laporan admin bervolume besar) yang tidak dapat dipenuhi index Postgres secara wajar.

**Alternatives Considered:**
- *Upstash Redis* (serverless REST-based): unggul di skalabilitas & DX, ditolak untuk Fase 1 karena menambah vendor baru yang belum diperlukan volume traffic MVP; diadopsi sebagai jalur migrasi Fase 2.
- *Vercel KV*: mirip Upstash namun lock-in lebih dalam ke ekosistem Vercel; tidak dipilih sebagai default migrasi karena risiko vendor lock-in lebih tinggi dibanding Upstash mandiri.
- *Self-hosted/traditional Redis*: ditolak — koneksi TCP persisten tidak kompatibel dengan model serverless (konsisten alasan penolakan BullMQ di ADR-006).
- *Tanpa cache tambahan sama sekali*: ditolak — tidak memenuhi hard rule ADR-017 secara konkret, meninggalkan gap keamanan.

**Pros:** Nol biaya tambahan, nol vendor baru, implementasi konsisten pola existing (ADR-005/006/008), mudah dieksekusi AI Coding Assistant/Bolt.new, risiko vendor lock-in terendah di antara seluruh alternatif.

**Cons:** Performa rate-limit check sedikit lebih lambat dibanding Redis murni (low-single-digit ms vs sub-ms) — diterima karena volume MVP rendah; tabel `rate_limit_log` berpotensi menjadi hot table jika traffic melonjak jauh di luar perkiraan — dimitigasi kriteria ambang migrasi eksplisit di atas dan kebijakan retensi (pembersihan baris >7 hari via Vercel Cron yang sudah ada).

**Impact:** Lintas modul (rate limiting Auth sebagai prioritas utama, Modul 1), relevan mulai Sprint S1.

**Affected Documents:** `technology-decisions.md`, `dependency-manifest.md`, `SYSTEM-ARCHITECTURE.md`, `ERD-Skema-Database-Real-Estate-Agency-v1.1.md` (+ diagram Mermaid), `API-Specification-RUMAHAGEN-v1.1.md` §0, `PROJECT-CONSTITUTION.md` §10/§20, `development-playbook.md`, `decision-log.md`, `CHANGELOG.md`, `CURRENT-PROJECT-STATE.md`, `project-manifest.md`, `document-governance-baseline-register.md`.

**Dependencies:** Sebelumnya terkait ADR-006 (Job Queue) — kini independen sepenuhnya karena ADR-006 final tanpa Redis.

**Review Date:** Ditinjau ulang saat salah satu kriteria ambang migrasi di atas tercapai, atau maksimal setiap akhir kuartal pasca-launch sebagai pemeriksaan rutin — mana yang lebih dulu tercapai (konsisten pola review ADR-005).

**Notes:** Menutup ADR terakhir yang berstatus OPEN di seluruh proyek — 25 dari 25 ADR arsitektur kini Approved. Struktur tabel final, algoritma sliding window presisi, dan threshold angka per jenis endpoint (mis. jumlah percobaan login sebelum blokir) **belum ditentukan di ADR ini** — merupakan keputusan desain teknis rinci untuk Database Schema Alignment/Sprint S1, bukan cakupan keputusan arsitektur.

---

# TAHAP 9 — Perubahan ke Dokumen Terkait

### `technology-decisions.md`
Tambahkan baris baru di *Official Technology Stack*: **Rate Limiting/Application Cache: Supabase Postgres (native, sliding window) — Fase 1**; **Upstash Redis — Approved Alternative, migrasi Fase 2 berbasis kriteria ambang (lihat ADR-018)**.

### `decision-log.md` (entri baru)
```
## ADR-042 — Caching & Rate Limiting Strategy: Postgres-native (Fase 1) →
Upstash Redis (Fase 2)

Date: 2026-07-31
Status: Approved
Category: Architecture, Backend, Database, Security
Related Documents: architecture-decision-records.md ADR-018,
technology-decisions.md, PROJECT-CONSTITUTION.md §20 (ADR-017)

Problem: Hard rule rate limiting bertingkat (ADR-017) belum memiliki
mekanisme penyimpanan status lintas-instance yang eksplisit di lingkungan
serverless. ADR-018 sebelumnya digantung pada hasil ADR-006, yang kini
final tanpa Redis — menjadikan ADR-018 sepenuhnya independen.

Decision: Rate limiting Fase 1 diimplementasikan native di atas Supabase
Postgres (tabel rate_limit_log, sliding window), migrasi terjadwal ke
Upstash Redis di Fase 2 saat kriteria ambang volume/load tercapai.

Reason: Konsisten preseden native-first ADR-005/006/008; volume endpoint
sensitif jauh lebih rendah dari traffic publik; nol dependency baru;
AI-friendliness tertinggi; risiko vendor lock-in terendah.

Consequences: +1 tabel ERD (rate_limit_log); index komposit wajib; endpoint
sensitif mengembalikan 429 + Retry-After; kebijakan retensi baris via
Vercel Cron; tim wajib memantau kriteria ambang migrasi secara berkala.
```
- Update Bagian 11 (Open Decisions): tandai baris OD-13/Caching sebagai resolved, rujuk ke ADR-042.
- Update tabel Decision Categories (Bagian 6): tambahkan ADR-042 ke kategori Architecture/Backend/Database/Security.

### `CHANGELOG.md` (entri baru)
```
## [0.1.5] — 2026-07-31

### Added
- decision-log.md ADR-042 — entry baru sinkronisasi ADR-018 (Caching
  Strategy)
- technology-decisions.md — Decision Detail Rate Limiting/Application Cache
  (Postgres-native Fase 1, Upstash Redis Fase 2 kondisional)
- ERD: entitas rate_limit_log

### Changed
- ADR-018 (Caching Strategy) resmi Approved via sesi Architecture Review
  Board: rate limiting Fase 1 native di atas Supabase Postgres, migrasi
  terjadwal ke Upstash Redis di Fase 2 berbasis kriteria ambang.
- architecture-decision-records.md: status ADR-018 diubah OPEN → Approved;
  dihapus dari tabel Open Decisions Summary — kini 25/25 ADR Approved,
  0 ADR OPEN tersisa di seluruh proyek.
- SYSTEM-ARCHITECTURE.md, PROJECT-CONSTITUTION.md, development-playbook.md,
  dependency-manifest.md, API-Specification-v1.1.md,
  ERD-Skema-Database-v1.1.md, CURRENT-PROJECT-STATE.md,
  document-governance-baseline-register.md, project-manifest.md
  disinkronkan mengikuti pola sinkronisasi berantai yang sama seperti
  ADR-001/ADR-005/ADR-006/ADR-008.

### Removed / Deprecated / Fixed / Security
Tidak ada perubahan pada kategori ini di rilis ini.
```

---

# TAHAP 10 — Keputusan Akhir

## **APPROVED WITH NOTES**

**Catatan yang menyertai persetujuan:**

1. **Approval formal tetap memerlukan tanda tangan manusia berwenang** — status ini adalah rekomendasi siap-sah panel, bukan pengesahan final. Sesuai governance rule proyek, status ADR baru benar-benar berubah menjadi Approved di dokumen resmi setelah Technical Lead/CTO bernama mengonfirmasi eksplisit (lihat gap OD-06).

2. **Kriteria ambang migrasi ke Upstash Redis (Tahap 8) adalah bagian tak terpisahkan dari keputusan ini** — bukan angka final yang tidak bisa didiskusikan, melainkan baseline awal yang wajib divalidasi tim DevOps/Backend begitu data traffic produksi tersedia.

3. **Informasi yang masih diperlukan sebelum implementasi teknis dimulai (tidak diasumsikan di sini):**
   - Struktur kolom final `rate_limit_log`, algoritma sliding window presisi (fixed window vs sliding window vs token bucket), dan threshold angka per jenis endpoint (mis. berapa kali percobaan login sebelum blokir, durasi blokir) — belum ditentukan, direkomendasikan diselesaikan bersamaan Sprint S1 (Authentication) saat endpoint sensitif pertama kali diimplementasikan.
   - Data traffic produksi nyata untuk memvalidasi angka kriteria ambang migrasi (10.000 req/menit, 15% load) — belum tersedia karena belum ada traffic produksi; direkomendasikan ditinjau ulang begitu monitoring pasca-launch berjalan.

Keputusan ini **tidak memblokir Sprint S0** dan **direkomendasikan disahkan secara formal sebelum Sprint S1 (Authentication)** karena endpoint sensitif pertama muncul di sprint tersebut.

**Dengan resolusi ADR-018 ini, seluruh 25 ADR arsitektur/teknis di proyek berstatus Approved — 0 ADR OPEN tersisa.**
