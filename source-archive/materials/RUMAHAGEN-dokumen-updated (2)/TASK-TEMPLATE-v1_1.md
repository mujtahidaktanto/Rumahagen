# TASK TEMPLATE
## Platform Web RUMAHAGEN

**Versi:** 1.1 (naik dari 1.0 — sinkronisasi rujukan dokumen ke versi terkini: PRD v1.2, ERD v1.3, API Spec v1.2, User Flow v1.2; penambahan rujukan Module Dependency Matrix, Module Implementation Strategy, dan gerbang gate M12/M13)
**Tanggal:** 6 Agustus 2026
**Disusun oleh:** Staff Software Engineer
**Status:** BERLAKU — wajib dipakai untuk **setiap** pekerjaan development, oleh AI Coding Assistant (Claude, Bolt.new, ChatGPT, Cursor, GitHub Copilot) maupun kontributor manusia.
**Dokumen acuan:** `PROJECT-CONSTITUTION.md`, dokumen sumber terkini yang berlaku per `document-governance-baseline-register.md` (saat ini: PRD v1.2, ERD v1.3, API Spec v1.2, User Flow v1.2, SEO Spec v1.1), `SYSTEM-ARCHITECTURE.md`, `technology-decisions.md`, `architecture-decision-records.md` (28 ADR Approved), `dependency-manifest.md`, `development-playbook.md` (AI Development Blueprint, acuan aktif), `AI-CONTEXT-PACK.md` (v1.1), `DEVELOPMENT-ROADMAP.md`, **(baru v1.1)** `Module-Dependency-Matrix-RUMAHAGEN-v1.0.md` (MDM) dan `Module-Implementation-Strategy-RUMAHAGEN-v1.1.md` (MIS).

> **Kedudukan dokumen:** Template ini adalah **wadah operasional** — ia tidak membuat keputusan arsitektur/bisnis baru, hanya menstandardisasi cara sebuah task ditulis, diterima, dikerjakan, dan dinyatakan selesai. Jika isi sebuah field bertentangan dengan dokumen governance manapun, dokumen governance yang menang, dengan **ADR Approved sebagai otoritas tertinggi** untuk keputusan arsitektur/teknis (lihat `AI-DEVELOPMENT-BLUEPRINT.md` Bagian 1 — hierarki dokumen).
>
> **(Baru v1.1) Rujukan versi dokumen tidak lagi ditulis hard-code di badan template** — field-field di bawah yang sebelumnya menyebut nomor versi spesifik (mis. "API-Specification-v1.1.md") kini merujuk **"versi terkini yang berlaku"**, karena nomor versi dokumen sumber berubah lebih sering daripada template ini sendiri. Selalu cek `document-governance-baseline-register.md` Bagian 10 untuk versi Baseline aktif sebelum mengisi field `Dependencies`/`Reference Documents`.

---

## Cara Menggunakan Template Ini

1. **Salin** blok template di Bagian "TEMPLATE (Salin dari Sini)" untuk setiap task baru — jangan mengubah struktur/urutan bagian.
2. **Isi setiap bagian** — tidak ada bagian yang boleh dikosongkan begitu saja. Jika sebuah bagian genuinely tidak relevan untuk jenis task tertentu, tulis eksplisit **`Tidak ada — <alasan singkat>`**, bukan dihapus atau dibiarkan kosong. Ini penting karena "kosong" ambigu (belum diisi vs memang tidak ada), sedangkan "Tidak ada — alasan" adalah pernyataan yang dapat diaudit.
3. **Satu task = satu file** — simpan sebagai `/docs/tasks/{task-id}.md` agar dapat dirujuk ulang, diaudit, dan ditautkan dari PR/commit.
4. **Rujuk Bagian "Panduan Pengisian per Task Type"** di bawah untuk memahami penekanan tiap bagian berbeda tergantung jenis task (mis. `Rollback Plan` untuk Bug Fix berbeda maknanya dari `Rollback Plan` untuk Deployment).
5. Task ini kemudian diserahkan ke AI Coding Assistant/developer mengikuti **AI Workflow** (`development-playbook.md` Bagian 4) — task yang tidak lengkap sesuai template ini **wajib ditolak/dikembalikan** untuk dilengkapi dulu, bukan dikerjakan dengan asumsi.
6. Field ini menyempurnakan (bukan menggantikan) 6 elemen wajib **AI Prompting Rules** (`development-playbook.md` Bagian 21: Module, Scope, Acceptance Criteria, Reference Documents, Out of Scope, **ADR Status Check**) — pemetaannya: `Business Goal`+`Background` = Module & konteks, `Problem Statement`+`Files to Modify` = Scope, `Acceptance Criteria` = Acceptance Criteria, `Dependencies` = Reference Documents, `Files Not Allowed to Modify` = Out of Scope, **`ADR & Gate Check` (baru v1.1, lihat di bawah) = ADR Status Check**.
7. **(Baru v1.1) Untuk task yang menyentuh Modul 12 (Organization) atau Modul 13 (AI Assistant)** — Bagian "ADR & Gate Check" **wajib** diisi dengan status gate implementasi terkini dari `CURRENT-PROJECT-STATE.md` sebelum task ini boleh diteruskan ke AI Coding Assistant manapun. Task tanpa status gate eksplisit untuk kedua modul ini **wajib ditolak**, terlepas seberapa jelas scope-nya.

---

## Jenis Task yang Didukung

Template ini **satu bentuk untuk semua** — berlaku identik strukturnya untuk kesembilan jenis task berikut. Perbedaan hanya pada *cara mengisi*, bukan pada *struktur bagian*:

| # | Task Type | Nilai Khas yang Ditekankan |
|---|---|---|
| 1 | **New Feature** | Business Goal & Acceptance Criteria dari PRD/User Flow modul terkait |
| 2 | **New Module** | Dependencies lintas modul (rujuk `Module-Dependency-Matrix-...v1.0.md`) & Database Impact besar; **jika modul target adalah M12/M13, wajib isi ADR & Gate Check terlebih dahulu** |
| 3 | **Bug Fix** | Problem Statement berisi reproduksi persis; Root Cause wajib sebelum Fix |
| 4 | **Enhancement** | Background berisi perilaku lama vs yang diinginkan; backward compatibility |
| 5 | **Refactoring** | Files to Modify eksplisit sempit; tidak mengubah behavior publik/kontrak |
| 6 | **Performance** | Testing Checklist berisi metrik before/after (Core Web Vitals/query time) |
| 7 | **Security** | AI Rules Before Start menegaskan hard rule Security/Authorization; review eksplisit |
| 8 | **Testing** | Acceptance Criteria = cakupan test yang harus ada, bukan fitur produk |
| 9 | **Deployment** | Database Impact = migration & rollback plan produksi; Rollback Plan paling kritis |

---

# TEMPLATE (Salin dari Sini)

```markdown
# TASK: <judul singkat task, deskriptif — bukan "Fix bug">

## Project
<Nama proyek/area — mis. "Platform Web RUMAHAGEN — Modul 3 Listing">

## Task ID
<Format: TASK-{sprint}-{modul}-{nomor urut}, mis. TASK-S4-LISTING-003.
Jika di luar sprint roadmap resmi (mis. hotfix produksi), gunakan: TASK-HOTFIX-{tanggal}-{nomor}>

## Task Type
<Pilih SATU: New Feature | New Module | Bug Fix | Enhancement | Refactoring | Performance | Security | Testing | Deployment>

## Priority
<Pilih SATU:
- P0 — Blocker (produksi down/celah keamanan aktif/data bocor — dikerjakan segera, di luar antrean sprint biasa)
- P1 — High (memblokir sprint berjalan atau modul dependency lain)
- P2 — Medium (direncanakan dalam sprint berjalan, tidak memblokir yang lain)
- P3 — Low (peningkatan non-mendesak, dapat dijadwalkan ulang)>

## Sprint
<Nomor sprint dari DEVELOPMENT-ROADMAP.md (S0–S14) tempat task ini seharusnya berada,
atau "Ad-hoc/Hotfix — di luar roadmap resmi" jika tidak terjadwal>

## Module
<Kode modul sesuai MDM/MIS (M01–M13), mis. "M03 — Manajemen Listing Properti".
Jika task lintas modul, sebutkan modul utama + modul yang terdampak secara eksplisit.>

## Business Goal
<Mengapa task ini penting secara bisnis — kaitkan ke nilai bisnis di PRD/AI-CONTEXT-PACK.md Bagian 1
("Nilai Bisnis") atau ke dampak operasional (mis. mencegah kehilangan data, menjaga SEO).
Bukan tujuan teknis — tujuan teknis ada di Problem Statement/Background.>

## Problem Statement
<Satu paragraf: apa yang salah/kurang/dibutuhkan SAAT INI, dari sudut pandang pengguna/bisnis/sistem.
- New Feature/Module: kebutuhan yang belum terpenuhi.
- Bug Fix: WAJIB berisi langkah reproduksi persis, expected vs actual behavior, environment/data yang dipakai.
- Enhancement: perilaku saat ini vs perilaku yang diinginkan.
- Refactoring: masalah maintainability/readability konkret pada kode saat ini (bukan preferensi gaya).
- Performance/Security/Testing/Deployment: kondisi terukur saat ini (metrik, celah, cakupan test, status readiness).>

## Background
<Konteks tambahan: histori keputusan terkait, referensi bagian PRD/User Flow/ERD/API Spec/System Architecture
yang relevan, task/PR terdahulu yang berkaitan, atau catatan dari Decision Log/Project Status jika sudah tersedia.
Jika bagian dokumen sumber terkait belum ada sebagai file (lihat development-playbook.md Bagian 5),
sebutkan gap ini secara eksplisit di sini.>

## Dependencies
<Daftar modul/task/sprint lain yang HARUS selesai & lolos Acceptance Criteria sebelum task ini dapat dimulai
(rujuk Module-Dependency-Matrix-...v1.0.md untuk dependency resmi, Module-Implementation-Strategy-...v1.1.md
untuk urutan pembangunan yang berlaku, dan kolom "Prasyarat" di DEVELOPMENT-ROADMAP.md). Sertakan juga
dokumen sumber spesifik yang WAJIB dirujuk selama pengerjaan (setara "Reference Documents" —
development-playbook.md Bagian 21), mis.:
- PRD Modul 3 (field wajib listing, REQ-M03-XXX)
- ERD v1.3 tabel `listings`, `listing_photos`
- API Specification v1.2 Bagian 2
Jika tidak ada dependency: "Tidak ada — task ini independen dari modul/sprint lain".>

## ADR & Gate Check
<(Baru v1.1 — WAJIB DIISI, menggantikan asumsi implisit)
1. Daftar ADR yang relevan dengan scope task ini beserta status-nya (per architecture-decision-records.md
   terkini — per 6 Agustus 2026 seluruh 28 ADR arsitektur/teknis proyek berstatus Approved/Approved With Notes,
   tidak ada yang OPEN). Contoh: "ADR-001 (Approved) — lokasi endpoint Route Handler; ADR-005 (Approved) —
   mekanisme search PostgreSQL FTS+pg_trgm."
2. **Jika Module di atas adalah M12 (Organization) atau M13 (AI Assistant): WAJIB cantumkan status gate
   implementasi terkini dari `CURRENT-PROJECT-STATE.md`** — mis. "Status gate: TERTUTUP per 6 Agustus 2026,
   paket sinkronisasi dokumen belum dieksekusi penuh — task ini DITOLAK sampai gate dibuka" atau
   "Status gate: TERBUKA per [tanggal], dikonfirmasi Owner — task dapat dilanjutkan."
   Task M12/M13 tanpa baris ini wajib dikembalikan, tidak dikerjakan dengan asumsi gate sudah terbuka.
3. Jika task tidak menyentuh ADR/gate khusus apa pun: "Tidak ada ADR spesifik di luar stack umum
   (technology-decisions.md Bagian 3) — tidak ada gate khusus yang berlaku untuk modul ini.">

## Database Impact
<Jelaskan eksplisit, jangan diasumsikan:
- Tabel/kolom yang ditambah/diubah/dihapus (nama persis, sesuai ERD v1.3 — cek juga Entity-Mapping-...v1.0.md
  untuk memastikan ENT-XXX yang relevan sudah terdaftar sebelum menambah entitas baru).
- Migration baru diperlukan? (Ya/Tidak — jika Ya, nomor/nama file migration).
- Index baru diperlukan? Constraint baru?
- Perlu sinkronisasi ERD-Skema-Database & ERD Diagram? (Ya/Tidak)
- Dampak ke RLS policy (Supabase)?
- Data sensitif tersentuh? (dokumen legalitas, field finansial DBR, API key AI Assistant) — jika ya, tegaskan
  aturan enkripsi at-rest tetap berlaku.
Jika tidak ada dampak database: "Tidak ada — task ini tidak menyentuh skema/data.">

## API Impact
<Jelaskan eksplisit:
- Endpoint baru/diubah/di-deprecate (method + path persis, sesuai API Specification versi terkini yang
  berlaku — cek document-governance-baseline-register.md untuk versi Baseline aktif).
- Breaking change? (Ya/Tidak — jika Ya, wajib naik versi `/v2`, tidak boleh mengubah kontrak `/v1` live).
- Perubahan label Auth (Public/Authenticated/role spesifik)?
- Perubahan request/response envelope atau kode error baru?
- Perlu sinkronisasi API Specification? (Ya/Tidak)
Jika tidak ada dampak API: "Tidak ada — task ini tidak menyentuh kontrak API.">

## Frontend Impact
<Jelaskan eksplisit:
- Halaman/route group yang tersentuh ((public)/(auth)/(dashboard)/(admin)) dan strategi rendering-nya
  (SSR/SSG/ISR/CSR — lihat SYSTEM-ARCHITECTURE.md Bagian 10 & Bagian 6 folder structure).
- Komponen baru/diubah (`components/ui/` vs `components/features/{module}/`).
- Dampak ke SEO (meta tag, structured data, sitemap) jika menyentuh halaman publik.
- Dampak ke state management (TanStack Query untuk server state, Zustand untuk UI state — final, ADR-011).
Jika tidak ada dampak frontend: "Tidak ada — task ini murni backend/database/infrastruktur.">

## Backend Impact
<Jelaskan eksplisit:
- Route Handler/service/repository yang tersentuh (`route.ts`/`*.service.ts`/`*.repository.ts`) —
  ingat: satu-satunya lapisan backend adalah Route Handlers di apps/web (ADR-001, final, tidak ada
  apps/api atau service Node.js terpisah).
- Middleware yang tersentuh (auth/rbac/organization-rbac/rate-limit — urutan baku, lihat SYSTEM-ARCHITECTURE §8).
- Job/queue/trigger yang tersentuh (Vercel Cron/Postgres Trigger — sitemap regen, counter sync, notifikasi;
  final ADR-006, jangan usulkan BullMQ/Redis/worker).
- Dampak ke business logic sensitif (kalkulasi DBR — ingat tenor selalu `tenor_months`, resolusi ownership/RBAC).
Jika tidak ada dampak backend: "Tidak ada — task ini murni frontend/dokumentasi.">

## Files to Modify
<Daftar path file yang secara eksplisit BOLEH dan DIPERKIRAKAN akan disentuh untuk task ini.
Jangan generik ("beberapa file service") — sebutkan path relatif konkret sejauh dapat diprediksi
di awal. Boleh bertambah selama pengerjaan bila memang perlu, tapi penambahan di luar daftar awal
yang signifikan wajib dilaporkan, bukan dilakukan diam-diam (lihat AI Refactoring Rules,
development-playbook.md Bagian 19).>

## Files Not Allowed to Modify
<Daftar path/file/modul yang secara eksplisit DILARANG disentuh dalam task ini — ini adalah
"Out of Scope" (development-playbook.md Bagian 21). Termasuk modul lain yang tidak terkait,
skema tabel di luar yang disebut di Database Impact, dan dokumen sumber "BERLAKU"/Baseline
(PROJECT-CONSTITUTION.md, PRD/ERD/API Spec versi Baseline aktif) yang tidak boleh diubah
keputusannya tanpa instruksi eksplisit manusia — hanya boleh disinkronkan sebagai detail baru
yang konsisten. **Jika Module task ini bukan M12/M13, secara eksplisit larang menyentuh skema
`organizations`/`organization_members`/`organization_invitations`/`ai_providers`/`agent_ai_connections`**
kecuali task ini memang task M12/M13 dengan gate terbuka.>

## Acceptance Criteria
<Daftar kriteria lolos yang KONKRET dan DAPAT DIVERIFIKASI — bukan "berfungsi dengan baik".
Turunkan dari Acceptance Criteria PRD/User Flow modul terkait, atau dari DEVELOPMENT-ROADMAP.md
(tabel Acceptance Criteria per sprint) bila task ini bagian dari sprint resmi. Gunakan format checklist:
- [ ] <kriteria 1 — dapat diuji secara objektif>
- [ ] <kriteria 2>
- [ ] <kriteria 3 — untuk Bug Fix: sertakan kriteria "bug tidak lagi terjadi pada langkah reproduksi di atas">
- [ ] <kriteria khusus RBAC/ownership bila relevan: "role X mendapat 403/404 saat mencoba Y">>

## Testing Checklist
<Mengikuti Testing Rules yang berlaku (Vitest/RTL/Playwright — final, ADR-016):
- [ ] Unit test (business logic sensitif: kalkulasi, validasi ownership, resolusi RBAC) — jika relevan
- [ ] Component test (form/interaksi kompleks) — jika relevan
- [ ] E2E test (alur kritis sesuai Acceptance Criteria) — jika relevan
- [ ] Regression test ditambahkan (WAJIB untuk Bug Fix — mereproduksi kondisi bug sebelumnya)
- [ ] Test manual/eksploratif dilakukan untuk kasus tepi (edge case) yang sulit diotomasi
- [ ] Untuk Performance: metrik before/after diukur & dicatat (mis. LCP, waktu query, ukuran bundle)
- [ ] Untuk Security: skenario negatif diuji (akses tanpa izin, ownership silang, input berbahaya)
- [ ] Lint + type-check lolos tanpa `any` implisit / `// @ts-ignore` yang menutupi masalah
Jika suatu jenis test tidak relevan untuk task ini, tulis "Tidak relevan — <alasan>" pada baris tsb,
jangan dihapus dari checklist.>

## Rollback Plan
<Bagaimana task ini dibatalkan/dipulihkan jika terjadi masalah setelah merge/deploy:
- Migration database: apakah ada migration "down" yang reversible? Jika tidak reversible penuh
  (mis. penghapusan kolom berisi data), jelaskan strategi mitigasi (mis. soft-migration bertahap).
- Kode: revert commit/PR tunggal cukup, atau ada dependency yang ikut perlu di-revert?
- Feature flag/toggle tersedia untuk menonaktifkan tanpa revert penuh? (jika ada — via `system_configs`)
- Untuk Deployment: langkah rollback deployment produksi (Vercel/Supabase) secara spesifik.
- Data yang sudah terlanjur berubah (jika ada) — apakah dapat dipulihkan dari backup/audit log?
Jika risiko rollback sangat rendah (mis. dokumentasi murni): "Risiko rendah — revert commit tunggal
sudah cukup, tidak ada dampak data/skema.">

## Definition of Done
<Checklist final sebelum task dianggap benar-benar selesai (rujuk Module Completion Checklist
di development-playbook.md Bagian 24):
- [ ] Seluruh Acceptance Criteria di atas terpenuhi dan dapat diverifikasi
- [ ] Seluruh Testing Checklist terpenuhi/ditandai tidak relevan dengan alasan
- [ ] Dokumentasi terkait diperbarui (ERD/API Spec/Roadmap/dsb.) atau gap dilaporkan bila dokumen
      terkait belum ada sebagai file
- [ ] Tidak ada pelanggaran Architecture Constraints yang berlaku (technology-decisions.md Bagian 6)
- [ ] Tidak ada duplikasi komponen/service/tipe untuk kebutuhan yang sudah ada solusinya
- [ ] Backward compatibility terjaga (kecuali breaking change yang disengaja & disetujui, naik versi)
- [ ] PR lolos CI gate penuh (lint + type-check + test + migration check) dan direview manusia
- [ ] Item "Hal Perlu Dikonfirmasi"/Open Question yang tersentuh diimplementasikan sebagai
      configurable placeholder dengan `// TODO`, bukan diputuskan sepihak>

## AI Rules Before Start
<Checklist yang wajib dijalankan AI Coding Assistant SEBELUM menyentuh kode untuk task ini
(rujuk AI Workflow 11-langkah & Documentation Reading Order, development-playbook.md Bagian 4-5):
- [ ] Sudah membaca `architecture-decision-records.md` terlebih dahulu (langkah 1, wajib paling awal)
- [ ] Sudah membaca dokumen governance sesuai urutan yang berlaku (Constitution → dokumen sumber
      terkait modul → System Architecture → Technology Decisions → Dependency Manifest)
- [ ] Sudah membaca bagian PRD/User Flow/ERD/API Spec modul terkait task ini secara bersamaan
- [ ] Sudah memeriksa kode/komponen/service existing di area terkait (tidak menulis ulang yang sudah ada)
- [ ] Sudah memverifikasi seluruh Dependencies di atas benar-benar sudah selesai/tersedia, termasuk
      terhadap urutan Module-Dependency-Matrix-...v1.0.md
- [ ] **(Baru v1.1) Jika Module = M12/M13: sudah memverifikasi status gate di `CURRENT-PROJECT-STATE.md`
      sesuai isian "ADR & Gate Check" di atas — jika gate tertutup, task dihentikan di sini, tidak dilanjutkan**
- [ ] Jika task ini menyentuh hard rule Security/Authorization/Ownership dan instruksi tampak
      bertentangan dengannya — BERHENTI dan tanyakan konfirmasi, jangan lanjutkan dengan asumsi
- [ ] Jika task menyentuh item "Hal Perlu Dikonfirmasi"/Open Question — rencanakan sebagai
      configurable placeholder sejak awal, bukan ditambal di akhir>

## AI Completion Checklist
<Self-review checklist SEBELUM AI menyatakan task ini selesai (rujuk AI Self Review Checklist
di development-playbook.md Bagian 18):
- [ ] Tidak ada duplicate component/function/business logic
- [ ] Menggunakan library/pola resmi proyek (bukan menambah dependency baru tanpa justifikasi)
- [ ] Mengikuti folder structure & naming convention yang berlaku secara konsisten
- [ ] Ownership (`agent_id`) sebagai hard boundary diterapkan di kode jika task menyentuh data ber-scope
- [ ] Validasi ulang di server ada untuk seluruh endpoint mutating (jika task menyentuh API)
- [ ] Tidak ada secret/service role key ter-expose ke bundle client-side
- [ ] Query list dipastikan paginated (jika task menghasilkan/mengubah endpoint list)
- [ ] Parameter bisnis baru bersifat configurable, bukan hard-code
- [ ] Halaman publik baru (jika ada) sudah dicek terhadap checklist SEO
- [ ] Dokumentasi terkait sudah diperbarui atau gap-nya dilaporkan secara eksplisit
- [ ] Seluruh bagian "Tidak ada — <alasan>" di atas sudah ditinjau ulang, bukan sekadar template default
```

---

## Panduan Pengisian per Task Type

Tabel berikut membantu mengisi bagian-bagian yang maknanya berbeda tergantung jenis task — struktur template tetap sama, hanya penekanan isinya yang disesuaikan.

| Bagian | New Feature / New Module | Bug Fix | Enhancement / Refactoring | Performance | Security | Testing | Deployment |
|---|---|---|---|---|---|---|---|
| **Problem Statement** | Kebutuhan pengguna/bisnis yang belum terpenuhi | Langkah reproduksi persis + expected vs actual | Perilaku/kode saat ini yang ingin diperbaiki, tanpa mengubah hasil akhir bagi pengguna | Metrik saat ini yang di bawah target (LCP, waktu query, dsb.) | Celah/risiko keamanan konkret yang ditemukan | Cakupan test yang hilang/tidak memadai saat ini | Status kesiapan rilis saat ini (checklist mana yang belum tercentang) |
| **Dependencies** | Modul/sprint prasyarat (rujuk MDM & MIS) | Modul tempat bug ditemukan + versi/commit terakhir yang diketahui baik | Kode/komponen yang akan disentuh beserta pemakainya di tempat lain | Baseline metrik yang jadi pembanding | Dokumen kebijakan keamanan terkait (Constitution Bagian Security) | Modul yang test-nya akan ditulis/diperluas | Seluruh sprint/modul yang harus lolos DoD sebelum deploy |
| **ADR & Gate Check** | Wajib diisi untuk seluruh task New Module; **wajib** untuk M12/M13 | Cek apakah bug terkait area yang diatur ADR tertentu (mis. rate limiting, search) | Cek apakah perubahan menyentuh keputusan ADR yang sudah final — jika ya, tidak bisa diubah tanpa ADR baru | Cek kriteria ambang migrasi Fase 2 (ADR-005/006/018) sebelum mengusulkan migrasi infrastruktur | Cek ADR-017 (Security), ADR-002/003 (Auth/RBAC) | Umumnya "Tidak ada gate khusus" kecuali test menyentuh M12/M13 | Cek seluruh ADR yang relevan dengan komponen yang di-deploy |
| **Rollback Plan** | Revert PR + migration down (jika ada tabel baru) | Revert fix jika regresi baru muncul + regression test tetap disimpan | Revert ke implementasi lama; pastikan tidak ada konsumen lain yang bergantung pada perubahan | Revert optimisasi jika ternyata menimbulkan bug/regresi fungsional | Rollback patch keamanan hanya jika terbukti memutus fungsi lain — dengan mitigasi sementara lain | Umumnya rendah risiko — revert test tidak memengaruhi produksi | **Paling kritis** — langkah rollback deployment & migration produksi harus presisi dan sudah diuji di staging |
| **Testing Checklist** | Penuh: unit + component + E2E sesuai Acceptance Criteria | Regression test WAJIB ada | Test existing tidak boleh rusak (no regression) + test baru bila behavior berubah | Sertakan pengukuran sebelum/sesudah sebagai bagian dari "test" | Sertakan pengujian skenario serangan/akses tanpa izin | **Ini bagian utama task** — daftar test yang ditambahkan itu sendiri adalah deliverable | Sertakan smoke test pasca-deploy di lingkungan production-like |
| **AI Rules Before Start** | Tekankan membaca PRD/User Flow modul terkait + verifikasi urutan MDM/MIS | Tekankan reproduksi dulu sebelum menebak fix | Tekankan tidak mengubah kontrak/behavior publik | Tekankan mengukur baseline dulu sebelum optimisasi | Tekankan tidak melonggarkan hard rule demi kemudahan development | Tekankan memahami Acceptance Criteria PRD yang ingin divalidasi test | Tekankan seluruh item Go-Live Checklist yang berlaku sudah ditinjau |

---

## Aturan Wajib Terkait Template Ini

1. **Tidak ada task yang dikerjakan tanpa file task lengkap** — AI Coding Assistant maupun developer manusia wajib menolak/mengembalikan permintaan kerja yang tidak menyertakan template ini terisi.
2. **Bagian "Files Not Allowed to Modify" adalah pagar keras** — pelanggaran terhadapnya diperlakukan sama seriusnya dengan pelanggaran hard rule keamanan.
3. **Task Type menentukan bobot review, bukan menghilangkan bagian** — Security dan Deployment selalu mendapat review tambahan sebelum merge, terlepas dari seberapa kecil perubahannya.
4. **Perubahan pada dokumen governance final (Constitution, PRD/ERD/API Spec versi Baseline aktif) tidak pernah menjadi "Files to Modify"** dalam task teknis biasa — perubahan semacam itu adalah task governance tersendiri yang memerlukan persetujuan eksplisit manusia.
5. **Template ini sendiri bersifat living document** — jika suatu bagian berulang kali terasa tidak cukup untuk jenis task tertentu, itu dilaporkan sebagai temuan untuk merevisi template ini secara sadar, bukan diakali diam-diam per task.
6. **(Baru v1.1) Bagian "ADR & Gate Check" tidak boleh dikosongkan atau diisi asal** — khusus task M12/M13, pengisian yang tidak menyebut status gate eksplisit dianggap **tidak lengkap**, setara dengan bagian wajib lain yang kosong (lihat Aturan Wajib poin 1).

---

*Template ini adalah alat operasional turunan dari `development-playbook.md` (versi aktif) dan seluruh dokumen governance proyek terkini. Dipakai berulang untuk setiap task development apa pun jenisnya, disimpan satu file per task di `/docs/tasks/`, dan menjadi unit kerja standar yang dapat diaudit sepanjang siklus proyek. Wajib direview ulang setiap kali dokumen sumber utama (PRD/ERD/API Spec) naik versi Baseline atau ada ADR baru yang disahkan.*
