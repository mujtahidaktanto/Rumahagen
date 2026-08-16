# Architecture Review Board — Sesi Resolusi ADR-006
## Topik: Job Queue Strategy — RUMAHAGEN

**Peserta Panel:** CTO, Principal Software Architect, Enterprise Solution Architect, Senior Backend Architect, Senior Frontend Architect, Cloud Architect, DevOps Architect, Database Architect, Security Architect, AI Development Architect, Technical Lead

**Tanggal Sesi:** 29 Juli 2026
**Status Awal:** OPEN (ADR-006 di `architecture-decision-records.md`)

---

# TAHAP 1 — Mengapa Keputusan Ini Penting

`architecture-decision-records.md` ADR-006 dan `foundation-validation-report.md` Gap H3 mencatat tiga kebutuhan proses asinkron/terjadwal yang eksplisit disyaratkan dokumen sumber:

1. **Regenerasi sitemap event-driven** (`SEO-Analytics-Specification-v1.1.md` §1.5) — setiap listing baru `published` atau berubah status, bukan hanya batch harian, agar listing baru cepat ditemukan crawler. Diikuti pemanggilan **Google Indexing API** (§4.3) untuk permintaan crawl-ulang cepat.
2. **Reminder event H-1** (Modul 5 — Event) — pengingat terjadwal sebelum acara berlangsung.
3. **Sinkronisasi counter denormalisasi** (`DEVELOPMENT-ROADMAP.md` catatan S4: `cta_click_count`, `total_listings_sold`, dan sejenisnya di Modul 3/8) — wajib lewat trigger/job, eksplisit dilarang dihitung on-the-fly oleh developer.

Sejak sesi sebelumnya, **cakupan kebutuhan ini bertambah** dengan rencana fitur **Agent Workspace** (todo list, reminder listing >90 hari belum update, jadwal ketemu, reminder customer) yang dibahas di luar sesi ARB formal — seluruhnya berpola sama: **scan terjadwal periodik** (harian) yang memicu notifikasi, bukan proses real-time bervolume tinggi.

Keputusan ini penting karena:

- **Blocking eksplisit untuk Sprint S6 (SEO Hardening) dan S13 (Event)** — `architecture-decision-records.md` Bagian 7 mencatat modul 3, 5, 8, 11 terdampak langsung.
- **Menjadi prasyarat arsitektural bagi Agent Workspace** — todo/reminder agent yang direncanakan akan memakai mekanisme yang sama dengan reminder H-1 dan scan listing stale; jika mekanisme job queue tidak dikunci sekarang, Agent Workspace berisiko dibangun di atas pola ad-hoc yang berbeda dan perlu refactor.
- **Konsekuensi langsung ADR-001 (Backend Architecture, Approved) dan ADR-005 (Search Strategy, Approved).** Kedua ADR itu mengunci filosofi *minimal-vendor*, satu `apps/web` berbasis Route Handlers tanpa service Node terpisah. Mekanisme job queue yang dipilih **wajib kompatibel dengan batas eksekusi serverless Vercel** (~10–60 detik per invocation, dicatat sebagai konsekuensi wajib ADR-001) — ini bukan detail kecil, karena beberapa kandidat job queue populer (mis. BullMQ) **secara arsitektural mengasumsikan proses worker yang berjalan terus-menerus (long-running)**, yang **tidak kompatibel** dengan model serverless Vercel tanpa menambah service infrastruktur terpisah — sesuatu yang eksplisit ditolak ADR-001.
- **Risiko rework terdokumentasi eksplisit** (`architecture-decision-records.md` Bagian 7): "Regenerasi sitemap event-driven, reminder event H-1, dan sinkronisasi counter denormalisasi berisiko diimplementasikan dengan mekanisme ad-hoc yang tidak konsisten, memerlukan refactor saat keputusan akhirnya diambil."

**Kesimpulan Tahap 1:** Ini adalah keputusan **High priority** — bukan karena kompleksitas teknis tertinggi (justru sebaliknya, kebutuhan aktual project ini didominasi tugas terjadwal/periodik, bukan queue event bervolume tinggi), melainkan karena tenggat sprint yang jelas (S6/S13) dan risiko memilih arsitektur yang **secara fundamental tidak kompatibel** dengan constraint serverless yang sudah dikunci ADR-001.

---

# TAHAP 2 — Identifikasi Seluruh Alternatif Realistis

### Alternatif A — Vercel Cron Jobs → Next.js Route Handlers (native Vercel, zero komponen baru)
Vercel Cron Jobs memanggil endpoint Route Handler terjadwal (mis. `/api/cron/reminder-scan`) pada interval tertentu. Seluruh logic tetap di dalam `apps/web`, dipanggil via HTTP dengan header autentikasi cron rahasia. Cocok untuk tugas periodik (scan harian), tidak untuk event instan.

### Alternatif B — Supabase Edge Functions + pg_cron / Database Webhooks
Menjalankan logic di Supabase Edge Functions (runtime Deno terpisah dari `apps/web`), dipicu oleh `pg_cron` (ekstensi Postgres untuk scheduling) untuk tugas terjadwal, atau Database Webhooks (trigger Postgres yang memanggil HTTP endpoint) untuk tugas event-driven (mis. saat listing berubah status).

### Alternatif C — BullMQ + Redis (self-hosted atau Upstash Redis)
Message queue matang berbasis Redis dengan dukungan retry, backoff, prioritas, dan dead-letter queue. **Membutuhkan proses worker yang berjalan terus-menerus** untuk memproses antrean — secara arsitektural adalah long-running process, bukan request-response singkat.

### Alternatif D — QStash (Upstash) — Managed Serverless Queue/Scheduler
Layanan terkelola dari Upstash: mengirim HTTP request ke endpoint Route Handler sesuai jadwal (cron) atau sebagai antrean dengan retry otomatis bawaan, tanpa perlu mengelola worker/Redis sendiri — didesain khusus untuk arsitektur serverless (HTTP-based, bukan connection-based).

### Alternatif E — Hybrid Native: Vercel Cron (scheduling) + Postgres sebagai Source of Truth Job (tanpa queue engine terpisah)
Bukan produk baru, melainkan **pola arsitektur**: Vercel Cron Jobs memicu Route Handler pada jadwal tetap; Route Handler men-scan tabel Postgres (mis. `job_runs`, atau langsung query kondisi seperti `listings WHERE updated_at < now() - interval '90 days'`) dan mengeksekusi aksi (kirim notifikasi, panggil Indexing API) dalam batch di dalam satu invocation. Sinkronisasi counter murni ditangani **Postgres trigger** (bukan job queue sama sekali — event database-level, bukan application-level). Mengikuti filosofi *native-first* yang sama dengan ADR-005 (Postgres FTS Fase 1).

Panel menyepakati kelima alternatif ini layak dibandingkan, termasuk mempertahankan Alternatif C (BullMQ+Redis) dalam perbandingan eksplisit meski secara arsitektural bermasalah — keputusan tidak boleh menolak opsi tanpa perbandingan tercatat.

---

# TAHAP 3 & 4 — Perbandingan Alternatif

**Skala penilaian:** Excellent / Good / Fair / Poor

| Kriteria | A. Vercel Cron + Route Handlers | B. Supabase Edge Functions + pg_cron/Webhooks | C. BullMQ + Redis | D. QStash (Upstash) | E. Hybrid Native (Vercel Cron + Postgres) |
|---|---|---|---|---|---|
| Kesesuaian dengan PRD (reminder H-1, sitemap event-driven, counter sync) | Good — cukup untuk tugas terjadwal, kurang ideal untuk event instan (listing published) | Good — Database Webhooks pas untuk event-driven, pg_cron untuk terjadwal | Excellent — didesain untuk kedua pola, tapi berlebih untuk skala kebutuhan aktual | Excellent — mendukung cron **dan** event-driven (fire HTTP saat event terjadi) dengan retry bawaan | Excellent — scan periodik menutup reminder/stale-listing; trigger Postgres menutup counter sync instan; sitemap regen dapat dipanggil sinkron saat publish (ringan) |
| Kesesuaian dengan ERD (37+ entitas, sudah Postgres) | Excellent — tidak ada struktur data tambahan wajib | Good — Database Webhooks native terhadap trigger Postgres yang sudah ada | Fair — butuh skema antrean tambahan di Redis, terpisah dari ERD | Fair — status job hidup di Upstash, di luar ERD | Excellent — job state (jika diperlukan) cukup 1 tabel audit sederhana, selaras ERD |
| Integrasi dengan Supabase | Fair — tidak menyentuh Supabase runtime sama sekali (murni Vercel) | Excellent — native, pg_cron adalah ekstensi Postgres Supabase itu sendiri | Fair — Redis eksternal ke Supabase, hanya DB yang tetap Supabase | Fair — terpisah, hanya dipanggil via HTTP dari Route Handler yang mengakses Supabase | Excellent — Postgres trigger 100% native Supabase, tanpa layer tambahan |
| Integrasi dengan Bolt.new | Excellent — cukup route handler + `vercel.json` config, pola sangat umum & mudah di-generate AI | Fair — perlu setup project Edge Functions terpisah (Deno), di luar pola `apps/web` Next.js standar | Fair — setup worker process terpisah tidak lazim di-generate AI coding assistant untuk proyek serverless | Good — cukup route handler + registrasi endpoint di dashboard Upstash, relatif sederhana | Excellent — seluruhnya SQL migration + Route Handler, pola paling dikenal AI coding assistant |
| Integrasi dengan Vercel | Excellent — fitur native Vercel, nol setup infrastruktur tambahan | Fair — Edge Functions Supabase berjalan di luar runtime Vercel, menambah titik deployment terpisah | **Poor** — BullMQ worker adalah proses long-running; **tidak dapat berjalan sebagai Vercel serverless function**, wajib hosting terpisah (Railway/Render/VM) | Excellent — didesain khusus untuk memanggil endpoint serverless seperti Vercel | Excellent — Vercel Cron adalah fitur native, Postgres trigger berjalan di sisi Supabase tanpa komponen tambahan |
| Skalabilitas | Fair — Vercel Cron minimum interval terbatas (khususnya tier bukan Enterprise), kurang cocok volume/frekuensi tinggi | Good — pg_cron cukup skalabel untuk tugas terjadwal menengah | Excellent — dirancang untuk throughput tinggi | Excellent — dikelola penuh, auto-scaling | Good — cukup untuk skala MVP hingga menengah; scan batch berbasis SQL tetap efisien dengan index yang tepat |
| Kompleksitas | Excellent — paling sederhana, konsep sudah dikenal tim Next.js | Fair — dua runtime (Next.js + Deno Edge Functions) perlu dikelola | Poor — kompleksitas operasional tertinggi (worker, Redis, monitoring queue) | Good — kompleksitas rendah, tapi tetap dependency eksternal baru | Good — sedikit lebih kompleks dari A murni (perlu desain tabel audit job), tapi tetap dalam satu runtime |
| Biaya | Excellent — termasuk Vercel plan yang sudah dipakai (dengan batas jumlah cron job sesuai tier) | Good — termasuk Supabase plan yang sudah dipakai | Poor — biaya hosting worker tambahan + Redis (self-hosted atau Upstash Redis) | Fair — berbayar per request/schedule, dapat melonjak pada volume tinggi meski umumnya murah di skala awal | Excellent — nol biaya tambahan, seluruhnya dalam plan Vercel + Supabase yang sudah dibayar |
| Maintainability | Good — tim sudah familiar Next.js API routes | Fair — butuh keahlian tambahan (Deno runtime, pg_cron syntax) | Fair — butuh keahlian DevOps khusus (queue monitoring, worker health check) | Good — dashboard Upstash cukup jelas, minim maintenance | Good — SQL trigger & Route Handler adalah skill yang sudah dimiliki tim |
| Developer Experience | Good — konfigurasi `vercel.json` sederhana | Fair — konteks berpindah antara Next.js dan Supabase CLI/Deno | Fair — API BullMQ powerful tapi verbose untuk kasus sederhana | Good — REST API dan dashboard Upstash cukup ramah developer | Good — DX familiar (SQL + TypeScript), tanpa API/SDK asing baru |
| AI Friendliness (Bolt.new/AI Coding Assistant) | Excellent — pola Route Handler + cron config adalah pola paling umum digenerate AI | Fair — Edge Functions Deno kurang umum di training data AI coding assistant dibanding Node/Next.js | Fair — setup worker process converter kompleks untuk digenerate konsisten oleh AI | Good — REST API terdokumentasi baik, cukup mudah digenerate | Excellent — SQL trigger + query terparameterisasi adalah pola paling matang bagi AI code generation (konsisten dengan alasan ADR-005) |
| Risiko Vendor Lock-in | Excellent — Vercel Cron adalah fitur platform yang sudah dipakai (ADR-010), bukan vendor baru | Good — tetap dalam ekosistem Supabase yang sudah dipakai | Fair — Redis adalah standar terbuka, namun worker hosting menambah vendor baru | Fair — lock-in sedang ke Upstash, meski API relatif mudah diganti | Excellent — nol vendor baru, murni Postgres + Vercel yang sudah dipakai |
| Kemudahan Migrasi di Masa Depan | Good — migrasi ke queue lain relatif mudah karena logic tetap di Route Handler | Good — serupa, logic dapat dipindah | Good — jika sudah di BullMQ, cenderung menjadi tujuan akhir, bukan titik migrasi | Fair — migrasi keluar dari QStash butuh rebuild mekanisme retry/scheduling | Excellent — dirancang eksplisit dengan exit plan bertahap (Fase 2 ke QStash jika diperlukan), mengikuti pola ADR-005 |

**Catatan panel:** Alternatif C (BullMQ+Redis) gagal secara **fundamental**, bukan hanya kalah bersaing — worker long-running-nya tidak dapat berjalan di Vercel serverless tanpa menambah service hosting terpisah, yang berarti memilih C berarti **membatalkan sebagian keputusan ADR-001** secara implisit. Panel menyepakati C tetap dicatat sebagai *Alternatives Considered* di ADR, bukan dihapus dari perbandingan, mengingat popularitasnya di ekosistem Node.js secara umum.

---

# TAHAP 5 — Rekomendasi CTO

## Keputusan: **Alternatif E — Hybrid Native: Vercel Cron Jobs (scheduling) + Postgres Trigger/Database Webhook (event-driven) sebagai Fase 1, dengan QStash sebagai kandidat migrasi Fase 2 jika kriteria ambang tercapai**

### Mengapa ini, bukan yang lain — berdasarkan kebutuhan proyek, bukan popularitas:

1. **Kebutuhan aktual proyek ini didominasi tugas terjadwal periodik, bukan queue event bervolume tinggi.** Meninjau ulang kebutuhan riil: reminder H-1, scan listing >90 hari belum update, reminder customer/jadwal temu Agent Workspace — semuanya adalah **scan harian** yang cocok dengan model cron sederhana. Sinkronisasi counter (`cta_click_count`, `total_listings_sold`) bahkan **tidak memerlukan job queue application-level sama sekali** — ini murni kasus penggunaan **Postgres trigger** (`AFTER INSERT`/`AFTER UPDATE`), dieksekusi instan di level database tanpa round-trip HTTP apa pun. Memilih queue engine matang seperti BullMQ untuk kebutuhan yang secara mayoritas adalah cron harian adalah over-engineering.

2. **BullMQ+Redis secara arsitektural bertentangan dengan ADR-001 yang sudah Approved.** Ini adalah temuan teknis paling penting dari sesi ini: BullMQ mengasumsikan worker Node.js yang hidup terus-menerus mendengarkan antrean Redis — pola ini **tidak dapat dijalankan** sebagai Vercel serverless function (yang berumur singkat, per-invocation). Mengadopsi BullMQ berarti wajib menghidupkan service hosting terpisah (VM/Railway/Render) yang berjalan 24/7 — persis pola "service backend terpisah" yang **eksplisit ditolak** ADR-001 dengan alasan filosofi minimal-vendor. Memilih BullMQ sekarang berarti diam-diam membatalkan sebagian keputusan ADR-001 tanpa proses supersede formal.

3. **Konsistensi dengan preseden ADR-005 (native-first, migrasi terjadwal berbasis kriteria ambang).** Sama seperti Search Strategy memulai dari Postgres native sebelum mempertimbangkan Typesense, Job Queue Strategy dapat memulai dari Vercel Cron + Postgres native sebelum mempertimbangkan layanan terkelola seperti QStash. Pola pengambilan keputusan yang konsisten ini memudahkan tim (dan AI Coding Assistant) memahami filosofi arsitektur proyek secara keseluruhan — "mulai native, migrasi terjadwal saat data produksi membuktikan kebutuhannya", bukan menambah komponen berdasarkan asumsi skala di masa depan yang belum terbukti.

4. **Nol komponen infrastruktur baru, konsisten filosofi minimal-vendor ADR-001.** Vercel Cron adalah fitur platform Vercel yang sudah dipakai (ADR-010, Deployment Strategy). Postgres trigger dan Database Webhook adalah kapabilitas native Supabase yang sudah dipakai (ADR-004). Tidak ada vendor baru, tidak ada biaya infrastruktur tambahan, tidak ada runtime kedua (Deno Edge Functions) yang perlu dikelola tim yang sama yang mengelola Next.js.

5. **AI Friendliness tertinggi di antara seluruh opsi.** SQL trigger dan Route Handler dengan cron config adalah dua pola paling matang dan paling dapat diprediksi bagi AI Coding Assistant (Bolt.new, Claude) untuk digenerate secara konsisten lintas sesi — alasan yang sama persis dengan yang menjadikan Postgres FTS pilihan tepat untuk ADR-005.

6. **Exit plan eksplisit sudah dirancang sejak awal, bukan keputusan tertutup.** Berbeda dari sekadar memilih Alternatif A secara flat, Alternatif E secara eksplisit mewajibkan **kriteria ambang migrasi terukur** ditetapkan bersamaan dengan ADR ini (lihat Tahap 6 & 8), sehingga migrasi ke QStash (opsi terbaik berikutnya di tabel untuk kebutuhan event-driven dengan retry matang) menjadi keputusan terjadwal, bukan reaktif.

**Mengapa bukan QStash langsung sejak awal?** Panel mengakui QStash unggul di kriteria skalabilitas dan kematangan retry/backoff dibanding pendekatan native. Namun proyek ini di fase MVP dengan kebutuhan riil yang sepenuhnya terpenuhi pola cron + trigger sederhana — mengadopsi layanan berbayar eksternal sebelum kebutuhan riil (retry kompleks, dead-letter, volume tinggi) muncul adalah over-engineering yang bertentangan dengan prinsip "pilih berdasarkan kebutuhan proyek, bukan kapabilitas maksimal" — persis alasan yang sama dengan penolakan Typesense sejak Fase 1 di ADR-005.

**Mengapa bukan Supabase Edge Functions?** Edge Functions unggul untuk skenario yang butuh dekat dengan database dan trigger native Postgres — namun memperkenalkan **runtime kedua (Deno)** terpisah dari `apps/web` (Next.js/Node) menambah kompleksitas operasional dan kognitif tanpa manfaat yang tidak bisa dicapai Vercel Cron + Route Handler. Database Webhooks (bagian dari Alternatif B) tetap **dipertahankan sebagai teknik**, namun target eksekusinya diarahkan ke Route Handler `apps/web` (memanggil HTTP endpoint Next.js), bukan ke Edge Function terpisah — menyatukan seluruh logic aplikasi dalam satu runtime sesuai ADR-001.

---

# TAHAP 6 — Dampak Keputusan

| Area | Dampak |
|---|---|
| **Architecture** | Tidak ada komponen infrastruktur baru. Job scheduling hidup sepenuhnya di `vercel.json` (konfigurasi cron) + Route Handlers (`app/api/cron/**`). Diagram `SYSTEM-ARCHITECTURE.md` Bagian 3 perlu memperbarui node "Async/Scheduled Jobs" dari `[OPEN]` menjadi keterangan final: "Vercel Cron + Postgres Trigger (Fase 1, Approved) → QStash (Fase 2, migrasi terjadwal)". |
| **ERD** | Tidak ada tabel baru wajib untuk queue itu sendiri. Direkomendasikan menambah 1 tabel audit ringan `job_execution_log` (id, job_name, started_at, finished_at, status, error_message) untuk observability — opsional namun disarankan Security/DevOps Architect untuk debugging. Trigger Postgres ditambahkan pada `listing_leads` (increment `listings.total_leads`-like counter) dan tabel transaksi terkait `total_listings_sold`. |
| **Database Schema** | Migration baru: Postgres trigger function untuk counter sync (mis. `CREATE TRIGGER trg_sync_lead_count AFTER INSERT ON listing_leads FOR EACH ROW EXECUTE FUNCTION fn_increment_listing_lead_count();`); opsional tabel `job_execution_log`. |
| **API** | Endpoint baru non-publik: `POST /api/cron/sitemap-regenerate`, `POST /api/cron/reminder-scan`, `POST /api/cron/listing-stale-scan` (mendukung kebutuhan Agent Workspace) — seluruhnya dilindungi header rahasia `CRON_SECRET`, tidak terdaftar di `API-Specification-v1.1.md` sebagai endpoint publik. |
| **Folder Structure** | Tambahan folder `app/api/cron/**/route.ts` di dalam `apps/web` yang sudah ada — tidak ada folder/service baru di luar struktur ADR-001. |
| **Security** | Endpoint cron wajib diverifikasi header `Authorization: Bearer ${CRON_SECRET}` (env var rahasia) agar tidak dapat dipicu publik — konsisten `PROJECT-CONSTITUTION.md` Bagian 20 poin 3 (tidak ada trust terhadap input/pemicu eksternal tanpa verifikasi). |
| **Performance** | Setiap invocation cron tunduk batas eksekusi serverless Vercel (~10–60 detik, ADR-001 Consequences) — scan batch (mis. listing >90 hari) wajib memakai pagination/batching di dalam query agar tidak timeout pada volume besar; ini menjadi salah satu kriteria ambang migrasi ke QStash/pemrosesan bertahap. |
| **Deployment** | Konfigurasi `vercel.json` menambah bagian `crons` — perubahan deployment minor, tidak mengubah pipeline CI/CD yang ada. |
| **Maintenance** | Tim memantau log eksekusi cron via Vercel Dashboard/`job_execution_log`; nol operasional worker/queue tambahan di Fase 1. |
| **Development Workflow** | AI Coding Assistant dapat langsung mengimplementasikan reminder H-1, sitemap regeneration, dan (saat Agent Workspace masuk roadmap) reminder listing stale/appointment/customer tanpa placeholder — status `// TODO: menunggu resolusi ADR-006` di berbagai catatan dokumen dapat dihapus. |

---

# TAHAP 7 — Dokumen yang Harus Diperbarui

1. `technology-decisions.md` §9 (Open Questions poin 2, Job Queue) — pindahkan ke *Official Technology Stack* dengan entri: Job Queue/Scheduler = Vercel Cron Jobs + Postgres Trigger/Database Webhook (Fase 1), QStash (Fase 2 kondisional).
2. `architecture-decision-records.md` Bagian 4 — update status ADR-006 dari OPEN → Approved, isi lengkap sesuai Tahap 8.
3. `architecture-decision-records.md` Bagian 5 (Open Decisions Summary), Bagian 6 (Dependency Matrix), Bagian 7 (Impact Analysis), Bagian 8 (Implementation Order) — hapus ADR-006 dari daftar OPEN, sisakan ADR-008 dan ADR-018.
4. `decision-log.md` — tambahkan entry baru (ADR-040, melanjutkan penomoran kronologis setelah ADR-039) dengan Context/Decision/Rationale/Consequences lengkap.
5. `decision-log.md` Bagian 11 (Open Decisions) — tandai baris Job Queue sebagai resolved.
6. `CURRENT-PROJECT-STATE.md` — update *ADR & Governance Snapshot* (23 dari 25 Approved, 2 OPEN: ADR-008, ADR-018), *Readiness Snapshot* kondisi terkait Job Queue.
7. `CHANGELOG.md` — entri rilis baru (mis. `0.1.3`) mencatat resolusi ADR-006 dengan kategori Added/Changed sesuai format.
8. `SYSTEM-ARCHITECTURE.md` — Component Diagram (Bagian 3), Data Flow, Scalability Strategy, Risks, Open Questions, ADR Cross-Reference Matrix.
9. `PROJECT-CONSTITUTION.md` — baris Job Queue di Bagian 4 (Tech Stack), Riwayat Keputusan Arsitektur, Technical Constraints.
10. `development-playbook.md` (AI-DEVELOPMENT-BLUEPRINT.md) — Module Development 22.3 (hapus ADR-006 dari tabel modul terdampak ADR OPEN), Development Order 23.2, Golden Rules (tambah aturan baru soal cron/trigger).
11. `dependency-manifest.md` — catatan bahwa Fase 1 tidak menambah package npm baru (Vercel Cron native, Postgres trigger native); `@upstash/qstash` dicatat sebagai kandidat Fase 2 kondisional (belum diinstal).
12. `document-governance-baseline-register.md` — Baseline Register, Source of Truth Matrix, Dependency Matrix disinkronkan.
13. `project-manifest.md` — Executive Dashboard, Architecture Decision Summary, Open Decision Summary, Documentation Inventory, Document Version Matrix, Executive Summary, PROJECT MANIFEST UPDATE SUMMARY.
14. `ERD-Skema-Database-RUMAHAGEN-v1.1.md` — dokumentasikan trigger counter sync dan (opsional) tabel `job_execution_log`.
15. `SEO-Analytics-Specification-RUMAHAGEN-v1.1.md` — catatan implementasi resmi (§1.5, §4.3) bahwa sitemap regeneration & Indexing API call dijalankan via Database Webhook → Route Handler.

---

# TAHAP 8 — Architecture Decision Record

```markdown
Decision ID: ADR-006
Title: Job Queue Strategy — Vercel Cron Jobs + Postgres Trigger/Database Webhook (Fase 1), QStash (Fase 2 Kondisional)
Status: Approved

Context:
Tiga kebutuhan proses asinkron/terjadwal disyaratkan dokumen sumber: regenerasi
sitemap event-driven + panggilan Google Indexing API (SEO Spec §1.5, §4.3),
reminder event H-1 (Modul 5), dan sinkronisasi counter denormalisasi (Modul 3/8).
Kebutuhan bertambah dengan rencana fitur Agent Workspace (reminder listing >90
hari belum update, jadwal temu, reminder customer) yang berpola serupa (scan
terjadwal periodik). Keputusan dievaluasi dengan konteks ADR-001 (Backend
Architecture, Approved: Route Handlers + Supabase, tanpa service terpisah) dan
ADR-005 (Search Strategy, Approved: strategi native-first dengan migrasi
terjadwal berbasis kriteria ambang).

Decision:
Strategi hybrid native. Fase 1 (saat ini): (a) tugas terjadwal periodik
(reminder H-1, scan listing stale >90 hari, reminder customer/jadwal temu,
fallback sitemap regeneration) dijalankan via Vercel Cron Jobs yang memanggil
Route Handler (app/api/cron/**) dilindungi header CRON_SECRET; (b) tugas
event-driven instan (counter sync saat lead/transaksi terjadi, sitemap
regeneration saat listing published) dijalankan via Postgres Trigger/Database
Webhook yang memanggil Route Handler yang sama — seluruhnya dalam satu apps/web,
tanpa service/runtime tambahan. Fase 2 (migrasi terjadwal, kondisional): migrasi
ke QStash (Upstash) dipicu jika salah satu kriteria ambang tercapai — (a) volume
job per hari melampaui kapasitas batching satu invocation cron (~10-60 detik
per batch), (b) dibutuhkan retry/backoff/dead-letter yang tidak dapat dipenuhi
pola cron sederhana, atau (c) frekuensi job melampaui batas cron interval tier
Vercel yang dipakai.

Rationale:
(1) Kebutuhan aktual didominasi tugas terjadwal periodik, bukan queue event
bervolume tinggi — memilih queue engine matang adalah over-engineering; (2)
BullMQ+Redis secara arsitektural bertentangan dengan ADR-001 karena
membutuhkan worker long-running yang tidak dapat berjalan sebagai Vercel
serverless function tanpa menambah service hosting terpisah; (3) konsisten
dengan preseden ADR-005 (native-first, migrasi terjadwal berbasis kriteria
ambang terukur); (4) nol komponen infrastruktur baru — Vercel Cron dan Postgres
Trigger/Database Webhook sepenuhnya native pada platform yang sudah dipakai
(ADR-004, ADR-010); (5) SQL trigger dan Route Handler + cron config adalah pola
paling matang bagi AI Coding Assistant untuk digenerate konsisten lintas sesi;
(6) exit plan eksplisit ke QStash mencegah keputusan reaktif di masa depan.

Alternatives Considered:
- Vercel Cron Jobs murni (tanpa Postgres Trigger) — ditolak sebagian: cukup
  untuk tugas terjadwal namun kurang ideal untuk counter sync instan yang
  lebih tepat ditangani trigger database-level.
- Supabase Edge Functions + pg_cron/Database Webhooks — ditolak: menambah
  runtime kedua (Deno) terpisah dari apps/web, menambah kompleksitas
  operasional tanpa manfaat yang tidak bisa dicapai kombinasi Vercel
  Cron + Route Handler; Database Webhook tetap dipertahankan sebagai teknik
  namun diarahkan ke Route Handler, bukan Edge Function.
- BullMQ + Redis — ditolak untuk Fase 1: worker long-running tidak kompatibel
  dengan model serverless Vercel tanpa service hosting terpisah, bertentangan
  langsung dengan filosofi minimal-vendor ADR-001; kompleksitas operasional
  dan biaya tertinggi di antara seluruh opsi.
- QStash (Upstash) — dipertahankan sebagai target migrasi Fase 2 kondisional,
  bukan ditolak permanen: unggul pada retry/backoff/skalabilitas namun adopsi
  dini dinilai prematur untuk kebutuhan MVP saat ini.

Consequences:
Endpoint cron (app/api/cron/**) wajib diverifikasi CRON_SECRET, tidak
terdaftar sebagai endpoint publik di API Specification. Scan batch (mis.
listing >90 hari) wajib memakai pagination/batching agar tidak melampaui batas
eksekusi serverless (~10-60 detik) — pelampauan batas ini menjadi salah satu
kriteria ambang migrasi Fase 2. Tim wajib memantau tiga kriteria ambang migrasi
secara berkala. ADR-005 (Search Strategy) yang migrasi Fase 2-nya (Typesense)
juga bergantung pada mekanisme sinkronisasi index kini dapat memakai mekanisme
job scheduling yang sama begitu keduanya sama-sama memasuki Fase 2.
Direkomendasikan menambah tabel audit job_execution_log untuk observability
(opsional, non-blocking).

Affected Documents:
technology-decisions.md §9, architecture-decision-records.md (Bagian 4, 5, 6,
7, 8), decision-log.md, CURRENT-PROJECT-STATE.md, CHANGELOG.md,
SYSTEM-ARCHITECTURE.md, PROJECT-CONSTITUTION.md, development-playbook.md,
dependency-manifest.md, document-governance-baseline-register.md,
project-manifest.md, ERD-Skema-Database-RUMAHAGEN-v1.1.md,
SEO-Analytics-Specification-RUMAHAGEN-v1.1.md.

Review Date:
Ditinjau ulang setiap kali salah satu dari tiga kriteria ambang migrasi
(volume job harian, kebutuhan retry/backoff kompleks, atau frekuensi
melampaui batas cron interval) terpenuhi, atau maksimal setiap akhir kuartal
pasca-launch sebagai pemeriksaan rutin — mana yang lebih dulu tercapai.
```

---

# TAHAP 9 — Perubahan ke Technology Decisions, Decision Log, Changelog

### `technology-decisions.md` §9 (perubahan yang harus dimasukkan)
- Hapus poin Job Queue dari daftar *Open Questions*.
- Tambahkan ke tabel *Official Technology Stack*: baris baru — **Job Queue/Scheduler: Vercel Cron Jobs + Postgres Trigger/Database Webhook (Fase 1) → QStash — Upstash (Fase 2, kriteria ambang terjadwal — lihat ADR-006)**.
- Tambahkan Decision Detail baru (mengikuti nomor lanjutan setelah §4.30) untuk Job Queue Strategy, format sama seperti §4.30 (Search Engine): Purpose, Why Selected, Advantages, Limitations, Alternative Considered, Why Alternative Rejected, Migration Trigger, Integration Notes, AI Development Notes.

### `decision-log.md` (entri baru)
```
## ADR-040 — Job Queue Strategy: Vercel Cron + Postgres Trigger (Fase 1) → QStash (Fase 2)

Date: 2026-07-29
Status: Approved
Category: Architecture, Backend, Database
Related Documents: architecture-decision-records.md ADR-006,
technology-decisions.md §9, SEO-Analytics-Specification-v1.1.md §1.5/§4.3

Problem: Tiga fitur (sitemap event-driven, reminder H-1, counter sync) plus
kebutuhan Agent Workspace membutuhkan proses asinkron/terjadwal, belum resmi
dipilih.

Decision: Vercel Cron Jobs + Postgres Trigger/Database Webhook sebagai MVP
Fase 1, migrasi terjadwal ke QStash saat kriteria ambang (volume/retry
kompleks/frekuensi) terpenuhi.

Reason: BullMQ+Redis tidak kompatibel dengan model serverless ADR-001 (worker
long-running); kebutuhan aktual didominasi tugas terjadwal periodik, bukan
queue event bervolume tinggi; konsisten preseden native-first ADR-005;
AI-friendliness tertinggi; nol komponen infrastruktur baru.

Consequences: Endpoint cron wajib diverifikasi CRON_SECRET; scan batch wajib
memakai pagination agar tidak melampaui batas eksekusi serverless; tim wajib
memantau kriteria ambang migrasi secara berkala.
```
- Update Bagian 11 (Open Decisions): tandai baris Job Queue sebagai resolved, rujuk ke ADR-040.
- Update tabel Decision Categories (Bagian 6): tambahkan ADR-040 ke kategori Architecture/Backend/Database.

### `CHANGELOG.md` (entri baru)
```
## [0.1.3] — 2026-07-29

### Added
- decision-log.md ADR-040 — entry baru sinkronisasi ADR-006 (Job Queue Strategy)
- technology-decisions.md — Decision Detail Job Queue/Scheduler (Vercel Cron +
  Postgres Trigger Fase 1, QStash Fase 2 kondisional)

### Changed
- ADR-006 (Job Queue Strategy) resmi Approved via sesi Architecture Review
  Board: Vercel Cron Jobs + Postgres Trigger/Database Webhook sebagai MVP
  Fase 1, migrasi terjadwal ke QStash di Fase 2.
- architecture-decision-records.md: status ADR-006 diubah OPEN → Approved;
  dihapus dari tabel Open Decisions Summary (kini 23/25 Approved, 2 OPEN:
  ADR-008, ADR-018).
- SYSTEM-ARCHITECTURE.md, PROJECT-CONSTITUTION.md, development-playbook.md,
  dependency-manifest.md, CURRENT-PROJECT-STATE.md,
  document-governance-baseline-register.md, project-manifest.md disinkronkan
  mengikuti pola sinkronisasi berantai yang sama seperti ADR-001/ADR-005.

### Removed / Deprecated / Fixed / Security
Tidak ada perubahan pada kategori ini di rilis ini.
```

---

# TAHAP 10 — Keputusan Akhir

## **APPROVED WITH NOTES**

**Catatan yang menyertai persetujuan:**

1. **Approval formal tetap memerlukan tanda tangan manusia berwenang** — status ini adalah rekomendasi siap-sah panel, bukan pengesahan final. Sesuai governance rule proyek, status ADR baru benar-benar berubah menjadi Approved di dokumen resmi setelah Technical Lead/CTO bernama mengonfirmasi eksplisit.

2. **Kriteria ambang migrasi ke QStash (Tahap 8) adalah bagian tak terpisahkan dari keputusan ini** — bukan angka final yang tidak bisa didiskusikan, melainkan baseline awal yang wajib divalidasi tim DevOps/Backend begitu data produksi awal tersedia.

3. **Informasi yang masih diperlukan sebelum implementasi teknis dimulai (tidak diasumsikan di sini):**
   - Tier Vercel yang akan dipakai di produksi (Hobby/Pro/Enterprise) — menentukan batas jumlah dan frekuensi minimum Cron Jobs yang tersedia, dan karenanya menentukan kapan kriteria ambang "frekuensi melampaui batas cron interval" benar-benar relevan.
   - Konfirmasi apakah kebutuhan Agent Workspace (reminder listing >90 hari, jadwal temu, reminder customer) akan masuk roadmap resmi sebagai modul baru — jika ya, perlu ADR/PRD update terpisah untuk mendefinisikan modul tsb secara formal (di luar cakupan sesi ini, yang hanya mengunci mekanisme job queue-nya).

Keputusan ini **tidak memblokir Sprint S0–S5** dan **wajib disahkan secara formal sebelum Sprint S6 (SEO Hardening) dan S13 (Event)** sesuai tenggat yang sudah tercatat di dokumen proyek.
