# CHANGELOG
## Platform Web RUMAHAGEN

Semua perubahan penting pada proyek ini dicatat di file ini.

Format mengikuti prinsip [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), dan proyek ini mengikuti [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

---

## Aturan Wajib Pengelolaan Dokumen Ini

1. **History tidak boleh dihapus.** Entri lama tidak pernah dihapus atau ditulis ulang isinya — koreksi atas entri lama ditambahkan sebagai entri baru yang merujuk balik ke entri yang dikoreksi, bukan mengedit entri asal.
2. **Selalu append perubahan baru** di bagian paling atas tiap seksi kronologis (entri terbaru di atas) — tidak pernah disisipkan di tengah riwayat.
3. **Gunakan Semantic Versioning** secara ketat:
   - `MAJOR` — breaking change pada kontrak API/skema data yang sudah live.
   - `MINOR` — fitur/modul baru yang backward-compatible.
   - `PATCH` — bug fix/perbaikan kecil yang backward-compatible.
   - Selama fase **Initial Development** (`0.y.z`), API publik dianggap belum stabil — kenaikan `y` (minor) dapat menyertakan perubahan yang bersifat lebih besar dari biasanya, sesuai ketentuan SemVer poin 4, namun tetap wajib dicatat sebagai **Breaking Changes** bila relevan.
4. **Catat seluruh perubahan database** — setiap migration baru (tabel, kolom, index, constraint, RLS policy) wajib punya entri di **Database Changes**, disinkronkan dengan `ERD-Skema-Database-Real-Estate-Agency-v1.1.md`.
5. **Catat seluruh perubahan API** — setiap endpoint baru/diubah/deprecated wajib punya entri di **API Changes**, disinkronkan dengan `API-Specification-RUMAHAGEN-v1.1.md`.
6. **Catat seluruh perubahan UI** — setiap halaman/komponen baru/diubah yang berdampak ke pengguna wajib punya entri di **UI Changes**.
7. **Catat bug fix** — setiap perbaikan bug, sekecil apa pun, wajib punya entri di **Bug Fixes** dengan referensi Task ID (`TASK-...`) dari `TASK-TEMPLATE.md` yang menanganinya.
8. Setiap entri versi baru **wajib** disertai tanggal (format `YYYY-MM-DD`) dan label fase pengembangan bila relevan (mis. "Initial Development", "Phase 1 MVP").
9. Jika sebuah kategori tidak punya perubahan pada suatu rilis, tulis eksplisit `Tidak ada perubahan pada kategori ini di rilis ini` — jangan menghilangkan sub-bagian kategori tsb.

---

# CURRENT VERSION

**`0.4.1`** — *Initial Development*
Dirilis: 2026-08-05
Fase: Pra-Development — **pengesahan status Baseline** untuk 8 dokumen atas perintah eksplisit Owner: 5 dokumen Draft (Entity Mapping, Authorization Spec, Functional Spec, UI Spec, Technical Spec) + 3 dokumen kandidat Baseline (ERD v1.3, User Flow v1.2, API Spec v1.2) yang menjadi dependency-nya. **Ini adalah rilis PATCH** — perubahan status governance atas dokumen yang isinya sudah final, bukan penambahan/perubahan cakupan sistem. Dengan rilis ini, **tidak ada satu pun dokumen proyek yang berstatus Draft** di `document-governance-baseline-register.md` Bagian 10. Implementasi kode masih belum dimulai.

*(Riwayat: `0.4.0`, dirilis 2026-08-05 — 3 dokumen baru: Functional/UI/Technical Specification, MINOR. `0.3.0`, dirilis 2026-08-05 — Engineering Alignment: retrofit skema ID EAF + Modul 12/13.)*

---

# RELEASE HISTORY

## [Unreleased]
Belum ada perubahan yang menunggu rilis berikutnya. Perubahan berikutnya yang direncanakan: (a) **Module Planning** per-sprint (tidak ada lagi blocker dokumentasi maupun status Baseline); (b) registrasi `BR-XXX` (Business Rule ID) di PRD; (c) registrasi ID endpoint formal (`API-XXX`) di API Specification; (d) sinkronisasi `ERD-Diagram-...v1.1.mermaid` ke ERD v1.3 (5 tabel baru belum tervisualisasi); (e) high-fidelity mockup piksel-presisi (di luar cakupan UI Specification governance). **Catatan:** dengan `0.4.1`, seluruh 24 dokumen di `document-governance-baseline-register.md` Bagian 10 sudah berstatus final (Baseline/Deprecated/Archived) — tidak ada lagi dokumen aktif berstatus Draft menunggu approval Owner.

## [0.4.1] - 2026-08-05 - Initial Development (Pengesahan Baseline — 8 Dokumen)

### Added
Tidak ada perubahan pada kategori ini di rilis ini — murni perubahan status, tidak ada konten/ID baru.

### Changed
- **8 dokumen naik status ke Baseline**: `Entity-Mapping-...v1.0.md` (Draft→Baseline), `ERD-Skema-Database-...v1.3.md` (Approved→Baseline), `API-Specification-...v1.2.md` (Approved→Baseline), `User-Flow-...v1.2.md` (Approved→Baseline), `Authorization-Access-Control-Specification-v1.0.md` (Draft→Baseline), `Functional-Specification-...v1.0.md` (Draft→Baseline), `UI-Specification-...v1.0.md` (Draft→Baseline), `Technical-Specification-...v1.0.md` (Draft→Baseline). Field Status internal tiap dokumen dan baris Bagian 10 `document-governance-baseline-register.md` disinkronkan bersamaan.
- `document-governance-baseline-register.md` naik v1.3→**v1.4** (Governance Notes poin 18).

### Removed
Tidak ada perubahan pada kategori ini di rilis ini.

### Deprecated
Tidak ada perubahan pada kategori ini di rilis ini — versi lama (PRD v1.1, ERD v1.2, User Flow v1.1, API Spec v1.1) tetap Deprecated seperti sebelumnya, tidak terpengaruh promosi Baseline dokumen penggantinya.

### Fixed
Tidak ada bug kode pada rilis ini (belum ada kode diimplementasikan).

### Security
Tidak ada perubahan pada kategori ini di rilis ini.

### Database Changes
Tidak ada perubahan skema — promosi status tidak mengubah isi ERD.

### API Changes
Tidak ada perubahan kontrak — promosi status tidak mengubah isi API Specification.

### UI Changes
Tidak ada perubahan pada kategori ini di rilis ini.

### Known Issues
- Item yang **tetap terbuka** (diwariskan, tidak diselesaikan rilis ini): BR-XXX belum diregistrasi; ID endpoint formal API Specification belum ada; `ERD-Diagram-...v1.1.mermaid` belum disinkronkan ke v1.3; high-fidelity mockup belum dibuat.

---

## [0.4.0] - 2026-08-05 - Initial Development (Functional/UI/Technical Specification — 3 Dokumen Baru)

### Added
- `Functional-Specification-RUMAHAGEN.md` **dibuat baru (v1.0, Draft)** — Screen Inventory 43 layar (12 modul, M11 tanpa layar by design); spesifikasi presisi penuh (field-per-field) untuk Form Listing multi-step & Kalkulator DBR; spesifikasi standar untuk 41 layar lain; Aturan Lintas-Layar Global (loading, error, 403, sesi expired); Traceability 105/114 REQ-XXX.
- `UI-Specification-RUMAHAGEN.md` **dibuat baru (v1.0, Draft)** — sistem token desain (palet "dokumen pertanahan Indonesia": Pine Deep/Land Gold/Paper/Ink Navy, tipografi Fraunces/Inter/JetBrains Mono); 6 Layout Template; 19 komponen komposit kustom; wireframe ASCII 3 layar (Form Listing, Kalkulator DBR, Dashboard Agen); pemetaan 43/43 layar ke template; aturan responsif & aksesibilitas (WCAG AA, reduced motion, keyboard focus).
- `Technical-Specification-RUMAHAGEN.md` **dibuat baru (v1.0, Draft)** — konsolidasi 6 dokumen sumber (SYSTEM-ARCHITECTURE, technology-decisions, API Spec v1.2, ERD v1.3, Entity Mapping v1.0, Authorization Spec v1.0) menjadi Technical Brief per 13 modul + Cross-Cutting Concerns tersentralisasi (auth, RBAC 2-lapis, rate limiting, job queue, enkripsi, maps/search) + struktur folder referensi.

### Changed
- `document-governance-baseline-register.md` dan `project-manifest.md` — baris Bagian 10/status dokumen disinkronkan untuk 3 dokumen baru (lihat entri masing-masing dokumen).

### Removed
Tidak ada perubahan pada kategori ini di rilis ini.

### Deprecated
Tidak ada perubahan pada kategori ini di rilis ini — ketiga dokumen adalah baru, tidak menggantikan versi lama mana pun.

### Fixed
Tidak ada bug kode pada rilis ini (belum ada kode diimplementasikan).

### Security
Tidak ada perubahan pada kategori ini di rilis ini. Technical Specification §2.5 mengonsolidasikan (bukan mengubah) pola enkripsi at-rest yang sudah ditetapkan ERD v1.3 untuk 3 kolom sensitif (dokumen legalitas, data finansial DBR, API key AI Assistant).

### Database Changes
Tidak ada perubahan skema — ketiga dokumen murni turunan dari ERD v1.3 yang sudah ada, tidak mendefinisikan tabel/kolom baru.

### API Changes
Tidak ada perubahan kontrak — Technical Specification mengonsolidasikan (bukan mengubah) endpoint yang sudah terdaftar di API Spec v1.2.

### UI Changes
Tidak ada implementasi UI pada rilis ini (belum ada kode). UI Specification v1.0 menyediakan seluruh basis desain (token, template, wireframe) untuk implementasi UI fase berikutnya.

### Known Issues
- **Item baru RESOLVED (0.4.0):** Functional Specification, UI Specification, Technical Specification — ketiganya tercatat `Not Ready`/`Planned` sejak `foundation-validation-report.md` (27 Juli 2026) — kini seluruhnya ada sebagai dokumen v1.0.
- Item yang **tetap terbuka** (diwariskan dari `0.3.0`, tidak diselesaikan rilis ini): BR-XXX belum diregistrasi; ID endpoint formal API Specification belum ada.
- **Baru:** high-fidelity mockup visual (piksel-presisi) belum dibuat — UI Specification v1.0 mencakup wireframe struktural, bukan desain grafis final; direkomendasikan sebagai pekerjaan implementasi terpisah.

---

## [0.3.0] - 2026-08-05 - Initial Development (Engineering Alignment — Retrofit Skema ID EAF + Modul 12/13 ke PRD/ERD/User Flow/API Spec)

### Added
- `Entity-Mapping-RUMAHAGEN.md` **dibuat baru (v1.0, Draft)** — dokumen yang sejak awal proyek tercatat belum pernah ada (`document-governance-baseline-register.md` Governance Notes poin 3); mendaftarkan 44 `ENT-XXX` lintas 13 modul, termasuk identifikasi *shared kernel* (4 entity referensi wilayah → M03, `Certificate` → M04) dan preview prinsip `PERM-XXX` untuk entity kritikal.
- `Authorization-Access-Control-Specification.md` **dibuat baru (v1.0, Draft)** — menggabungkan Role Matrix (7 role final resolusi `OD-02` + hierarki `editable_by_role_code`) dan Permission Matrix (113 `PERM-XXX` mencakup 44/44 entity) menjadi satu file, sesuai keputusan Owner.
- `PRD-RUMAHAGEN.md` — **Modul 12 (Organization Management System)** dan **Modul 13 (AI Assistant Integration/BYOK)** ditambahkan penuh (19 REQ-M12 + 12 REQ-M13), menuntaskan cakupan yang ditunda `0.2.0`; Requirement Index (`REQ-XXX`) ditambahkan ke 11 modul existing (83 REQ retrofit).
- `ERD-Skema-Database-RUMAHAGEN.md` — 5 tabel baru (`organizations`, `organization_members`, `organization_invitations`, `ai_providers`, `agent_ai_connections`); Bagian 2A baru "Database Schema (Fisik) — Digabung ke Dokumen Ini".
- `User-Flow-RUMAHAGEN.md` — 5 diagram alur baru (Modul 12: buat/undang-gabung/keluar-bubar Organization; Modul 13: koneksi provider, chat).
- `API-Specification-RUMAHAGEN.md` — Bagian 5A (Organization API, 13 endpoint) dan 5B (AI Assistant API, 6 endpoint) baru.

### Changed
- **`PRD-RUMAHAGEN.md` naik dari v1.1 → v1.2** (MINOR) — retrofit ID + 2 modul baru, tidak ada requirement v1.1 yang diubah substansinya.
- **`ERD-Skema-Database-RUMAHAGEN.md` naik dari v1.2 → v1.3** (MINOR) — setiap tabel kini bertag `ENT-XXX`; `listings` (+`organization_id`, +`listing_context`) dan `audit_logs` (+`organization_id`) diperluas aditif; soft-delete `organizations` diterapkan mengikuti prinsip `ADR-046` yang sudah Approved (bukan keputusan baru).
- **`User-Flow-RUMAHAGEN.md` naik dari v1.1 → v1.2** (MINOR) — retrofit traceability `REQ-XXX` di seluruh modul existing.
- **`API-Specification-RUMAHAGEN.md` naik dari v1.1 → v1.2** (MINOR) — **2 gap sinkronisasi lama dikoreksi**: Bagian 9.1 (sebelumnya "Google Maps Platform/Mapbox") kini sinkron `ADR-008` v2 Approved (Leaflet+OSM+LocationIQ+Geoapify) — gap ini sudah tercatat sejak `document-governance-baseline-register.md` Governance Notes poin 11 (30 Juli) namun baru dieksekusi sekarang; Bagian 3 (rekomendasi generik "Typesense/Elasticsearch") kini sinkron `ADR-005` Approved (Postgres FTS+pg_trgm Fase 1, migrasi terjadwal ke Typesense).
- `document-governance-baseline-register.md` dan `project-manifest.md` — baris Bagian 10/status dokumen disinkronkan (lihat entri masing-masing dokumen).

### Removed
Tidak ada perubahan pada kategori ini di rilis ini — seluruh versi lama (`PRD v1.1`, `ERD v1.2`, `User Flow v1.1`, `API Spec v1.1`) diberi status **Deprecated** dan dipertahankan sebagai referensi historis, tidak dihapus.

### Deprecated
- `PRD-RUMAHAGEN-v1.1.md`, `ERD-Skema-Database-RUMAHAGEN-v1.2.md`, `User-Flow-RUMAHAGEN-v1.1.md`, `API-Specification-RUMAHAGEN-v1.1.md` — digantikan versi baru di atas, status **Deprecated** (bukan dihapus) per `document-governance-baseline-register.md` Bagian 4.2 poin 2.

### Fixed
Tidak ada bug kode pada rilis ini (belum ada kode diimplementasikan). Koreksi dokumentasi: lihat "Changed" di atas untuk sinkronisasi `API-Specification.md` ke `ADR-005`/`ADR-008`.

### Security
Tidak ada perubahan pada kategori ini di rilis ini. Catatan desain dipertahankan: `agent_ai_connections.encrypted_api_key` mengikuti pola enkripsi at-rest yang sama dengan tabel sensitif lain; scope `PERM-M13-*` sengaja **tidak** memberi bypass Superadmin untuk isi koneksi/percakapan AI Assistant milik user lain (REQ-M13-004) — dicatat eksplisit di Authorization Spec v1.0 §2.15 poin 5 agar tidak salah diimplementasikan.

### Database Changes
Tidak ada perubahan database fisik — belum ada project database diinisialisasi. **Skema target ERD v1.3**: 5 tabel baru (`organizations`, `organization_members`, `organization_invitations`, `ai_providers`, `agent_ai_connections`), 2 tabel diperluas aditif (`listings`, `audit_logs`). Database Schema (fisik) kini **digabung ke `ERD-Skema-Database-...v1.3.md` Bagian 2A** — tidak lagi baris terpisah "TBD/Planned" di baseline register.

### API Changes
Tidak ada perubahan kontrak pada endpoint existing — belum ada endpoint yang diimplementasikan. **19 endpoint baru dirancang** di `API-Specification-...v1.2.md` Bagian 5A (`/organizations/*`, `/organization-invitations/*`, `/organization-members/*`) dan 5B (`/ai-providers`, `/ai-connections/*`, `/ai-assistant/chat`). **Koreksi non-breaking** pada dokumentasi Bagian 3 & 9.1 (lihat "Changed") — tidak mengubah kontrak endpoint yang sudah ada, murni memperbaiki narasi provider yang belum sinkron ke ADR.

### UI Changes
Tidak ada perubahan pada kategori ini di rilis ini — belum ada halaman/komponen yang diimplementasikan. `User-Flow-...v1.2.md` menyediakan 5 diagram alur baru sebagai acuan desain UI Modul 12/13 untuk fase berikutnya.

### Known Issues
- **Item #8** (paket sinkronisasi PRD/ERD/User Flow/API Spec Modul 12/13, tercatat sejak `0.2.0`) — **kini RESOLVED (0.3.0)**. `SEO-Analytics-Specification.md` **tidak termasuk** cakupan resolusi ini (di luar 8 dokumen yang diminta siklus EAF kali ini) — tetap dicatat terpisah jika relevan di siklus berikutnya.
- **Baru:** BR-XXX (Business Rule ID, EAF Bab 17) belum diregistrasi di PRD — dijadwalkan siklus berikutnya, bukan diasumsikan selesai.
- **Baru:** API Specification belum memiliki ID endpoint formal (`API-XXX`) — Permission Matrix saat ini merujuk endpoint via `METHOD /path`, bukan ID formal.

---

## [0.2.2] - 2026-08-05 - Initial Development (Konsolidasi Dokumen — architecture-decision-records.md v1.0→v1.1)

### Added
- `architecture-decision-records.md` — Bagian baru **"1A. Revision History"**, merangkum 10 titik revisi dokumen (27 Juli – 5 Agustus 2026) dalam satu tabel di dalam dokumen itu sendiri, menggantikan kebutuhan menyimpan 9 file snapshot terpisah (`__1_` s.d. `__9_`) untuk konteks historis.
- `architecture-decision-records.md` — Baris `Cross-reference: decision-log.md ADR-XXX` ditambahkan pada entri `ADR-001`/`005`/`006`/`008`/`018`, menyeragamkan gaya penulisan dengan `ADR-026`/`027`/`028` yang sudah lebih dulu memilikinya (temuan Minor, non-blocking; seluruh nomor dikonfirmasi cocok dengan `decision-log.md`: ADR-001→038, ADR-005→039, ADR-006→040, ADR-008→041, ADR-018→042).
- `architecture-decision-records.md` — Governance Notes poin 6 (root-cause analysis pemulihan regresi ADR-005/006 yang tidak tuntas) dan poin 7 (konsistensi gaya cross-reference).

### Changed
- **`architecture-decision-records.md` naik dari v1.0 → v1.1**, status **Draft → Baseline** disinkronkan penuh di field internal dokumen (sebelumnya field Status masih tertulis "Draft" meski `project-manifest.md` sudah mendeklarasikan Baseline sejak 4 Agustus 2026).
- Field `Dependencies` pada `ADR-001` dan `ADR-006` diperbarui redaksional — menghapus rujukan "masih OPEN" yang sudah usang terhadap `ADR-005`/`006`/`018` yang senyatanya sudah Approved.
- 9 file snapshot revisi (`architecture-decision-records__1_.md` s.d. `__9_.md`, 27 Jul–4 Ags 2026) dikonsolidasi menjadi 1 file master `architecture-decision-records-v1.1.md` — snapshot lama tidak dihapus, diarsipkan sebagai riwayat, tidak lagi menjadi dokumen aktif untuk sesi kerja berikutnya.
- `project-manifest.md` dan `document-governance-baseline-register.md` — rujukan versi `architecture-decision-records.md` disinkronkan ke v1.1 (lihat entri masing-masing dokumen).

### Fixed
- **CRITICAL — `architecture-decision-records.md`:** Regresi status `ADR-005` (Search Strategy) dan `ADR-006` (Job Queue Strategy) yang sempat ter-*revert* keliru ke "OPEN" pada revisi 30 Juli 2026 **ternyata belum benar-benar dipulihkan** oleh perbaikan 3 Agustus 2026 (`0.2.0`) — perbaikan sebelumnya hanya menyentuh narasi ringkasan (Bagian 5/6/7/8, Governance Notes), bukan entri sumber otoritatif di Bagian 4, yang tetap berisi teks draf 27 Juli 2026 tanpa disadari selama ±6 hari. Ditemukan melalui audit konfigurasi kata-per-kata terhadap 9 snapshot revisi dokumen saat proses konsolidasi. Entri Bagian 4 dipulihkan penuh dari sumber terverifikasi, dikonfirmasi identik substansi dengan `decision-log.md` `ADR-039`/`ADR-040` yang tidak pernah ikut ter-regresi. **Tidak ada dokumen turunan lain yang perlu dikoreksi** — seluruhnya sudah konsisten mencatat status Approved sepanjang periode regresi (lihat `architecture-decision-records.md` Governance Notes poin 4 & 6).

### Process Improvement
- Direkomendasikan: setiap klaim "regresi telah dipulihkan" di masa depan wajib disertai verifikasi diff/checksum terhadap versi sumber pra-regresi pada level entri, bukan hanya pembaruan narasi ringkasan yang merujuknya.
- Direkomendasikan: konvensi penamaan file berbasis versi resmi dokumen + tanggal ISO (bukan angka urut upload otomatis), dan pengarsipan versi lama ke sub-folder terpisah begitu versi baru final — lihat rekomendasi lengkap di `ADR-Consolidation-Supporting-Deliverables.md` Bagian 4.

## [0.2.1] - 2026-08-04 - Initial Development (Governance Sync — Resolusi OD-02, OD-06, OD-07)

### Added
- `decision-log.md` **`ADR-046`** — entry baru "Perluasan Kebijakan Soft-Delete (5 Entitas Tambahan)", memperluas cakupan `ADR-030`/`ADR-004` dari 3 ke 8 tabel bersoft-delete eksplisit: `agent_profiles`, `agent_reviews`, `courses`, `events`, `developer_partners` ditambahkan ke `listings`/`users`/`developer_projects` yang sudah ada. **Bukan Supersedes/Replaces** `ADR-030` — murni perluasan cakupan tabel atas prinsip yang sama.
- `decision-log.md` §11 — **OD-02**, **OD-06**, **OD-07** diregistrasi (label OD-XX pertama kali dipakai untuk ketiganya di dokumen ini, sebelumnya hanya hidup di `project-manifest.md` §7) dan langsung ditandai Resolved dalam siklus yang sama, cross-ref ke `ADR-046` (OD-07) dan resolusi administratif langsung (OD-02, OD-06).
- `ERD-Skema-Database-Real-Estate-Agency-v1.1.md` §4 poin 3 — perluasan daftar tabel bersoft-delete (dari 3 menjadi 8); §2.28 (`roles`) — catatan eksplisit bahwa Guest **bukan** baris fisik tabel `roles`.
- `document-governance-baseline-register.md` Governance Notes poin 14 baru, mendokumentasikan siklus resolusi OD-02/06/07 dan promosi Baseline 5 dokumen (lihat Changed).

### Changed
- **Seed role final dikunci ke 7** (OD-02): `superadmin`, `manager`, `admin`, `instructor`, `agent`, `developer_partner`, `buyer` — **Guest eksplisit bukan baris `roles`**, direpresentasikan sebagai state tidak-login. `CHANGELOG.md`, `CURRENT-PROJECT-STATE.md`, `decision-log.md`, `project-manifest.md`, dan `architecture-decision-records.md` (ADR-004 Notes) yang sebelumnya mencatat "8" dikoreksi menjadi "7 + Guest (tanpa baris)".
- **Owner seluruh dokumen governance ditetapkan** (OD-06): `architecture-decision-records.md`, `decision-log.md`, `dependency-manifest.md`, `development-playbook.md`, `document-governance-baseline-register.md`, `technology-decisions.md` (field header Owner), serta kolom Owner di `project-manifest.md` §4 dan `document-governance-baseline-register.md` §9–10 — seluruhnya diisi **Mujtahid Aktanto (Solo Project Owner, AI-Assisted)**.
- **5 dokumen naik status ke Baseline** karena satu-satunya blocker (nama individu Reviewer/Approver) kini terpenuhi: `architecture-decision-records.md`, `technology-decisions.md`, `dependency-manifest.md`, `development-playbook.md`, `SYSTEM-ARCHITECTURE.md` — disahkan langsung oleh Owner tunggal (model proyek solo, bukan segregation-of-duties tim). `document-governance-baseline-register.md` sendiri juga naik ke Baseline (v1.0 → v1.1).
- **Kebijakan soft-delete diperluas** (OD-07): dari 3 menjadi 8 tabel eksplisit — lihat `ADR-046`. Prinsip umum didokumentasikan: soft-delete untuk entitas yang direferensikan FK oleh tabel lain atau tampil di halaman publik/bernilai audit; hard-delete untuk data child/log/transien murni.
- `PROJECT-CONSTITUTION.md` naik dari v1.7 → **v1.8**: klarifikasi seed role & Guest (Bagian 3.1), kebijakan soft-delete diperluas, referensi Owner diperbarui.
- `ERD-Skema-Database-Real-Estate-Agency-v1.1.md` naik dari v1.1 → **v1.2**: perluasan soft-delete (5 entitas), klarifikasi Guest.
- `SYSTEM-ARCHITECTURE.md`, `technology-decisions.md`, `dependency-manifest.md`, `development-playbook.md`: field Owner disinkronkan; `SYSTEM-ARCHITECTURE.md` §1 & konvensi soft-delete (Bagian 7/Notes) diperbarui; `development-playbook.md` konvensi soft-delete (poin 6, Bagian sebelumnya) diperluas ke 8 tabel.
- `project-manifest.md` naik dari v1.5 → **v1.6**: Open Decision Summary §7 — OD-02/06/07 dipindah dari "Masih Terbuka" ke "Telah Selesai" (kini hanya **2 dari 15 item Open Decision tersisa**, keduanya business-only: OD-11 monetisasi, OD-12 threshold DBR); Executive Dashboard, Section 3 Entry/Exit Criteria, dan Section 4 Current Baseline diperbarui mencerminkan **6 dari 6 kondisi CTO terpenuhi** dan promosi 5 dokumen ke Baseline.
- `CURRENT-PROJECT-STATE.md`: Readiness Snapshot — kondisi #2, #5, #6 berubah dari ❌ menjadi ✅ (**6 dari 6 kondisi GO WITH CONDITIONS kini terpenuhi**); catatan Sprint S0 tentang menunggu rekonsiliasi seed role dihapus perannya sebagai blocker (angka final sudah dikunci).

### Known Issues
- Tidak ada Known Issue baru pada rilis ini. Known Issues #2 (state management), #3 (Vercel formal di Constitution — **kini RESOLVED**, lihat catatan v1.8 di atas), #6 (Resend/Sentry), dan #7 (kepemilikan akun operasional) tetap seperti sebelumnya.
- Item #8 (paket sinkronisasi PRD/API Spec/User Flow/SEO Spec Modul 12/13) **tetap Open** — tidak disentuh rilis ini (hanya `ERD-Skema-Database.md` yang tersinkron sebagian, khusus untuk soft-delete, **bukan** untuk struktur Modul 12/13 itu sendiri).

## [0.2.0] - 2026-08-03 - Initial Development (Governance Sync — Organization Management System & AI Assistant Integration)

### Added
- `decision-log.md` `ADR-043` — entry baru "Organization Model Strategy: Entitas Organization, Organization Member, Organization Invitation", sinkronisasi dari `architecture-decision-records.md` `ADR-026` (Status: **Approved With Notes**, tanggal 2026-08-03, hasil sesi Architecture Review Board).
- `decision-log.md` `ADR-044` — entry baru "Organization-Scoped Authorization Strategy", sinkronisasi dari `architecture-decision-records.md` `ADR-027` (Status: **Approved**, tanggal 2026-08-03).
- `decision-log.md` `ADR-045` — entry baru "Third-Party AI Assistant Integration Strategy (BYOK)", sinkronisasi dari `architecture-decision-records.md` `ADR-028` (Status: **Approved With Notes**, tanggal 2026-08-03).
- `decision-log.md` §11 — **OD-14** (Organization Management System) dan **OD-15** (AI Assistant Integration/BYOK) diregistrasi dan langsung ditandai Resolved dalam siklus yang sama, cross-ref ke ADR-043/044/045.
- `architecture-decision-records.md` — 3 entri ADR baru (**ADR-026**, **ADR-027**, **ADR-028**) di Bagian 4, plus catatan Update pada entri **ADR-023** (Multi-Tenancy Strategy, status direvisi tanpa mengedit isi asli).
- `PROJECT-CONSTITUTION.md` — baris #13 & #14 baru pada tabel "Riwayat Keputusan Arsitektur"; prinsip arsitektur baru (Bagian 22 poin 12 & 13); technical constraint baru (Bagian 24 poin 10 — larangan menulis kode Modul 12/13 sebelum sinkronisasi dokumen sumber).
- `technology-decisions.md` §4.33 — Decision Detail baru untuk kurasi 4 provider AI Assistant (Gemini/Groq/Mistral/GitHub Models).
- `SYSTEM-ARCHITECTURE.md` — Modul 5.12 (Organization Management) & 5.13 (AI Assistant Integration) baru pada Module Architecture (Bagian 5); 5 tabel baru dicatat di Database Architecture (Bagian 7); lapisan `organization-rbac.middleware` baru pada Authorization Architecture (Bagian 8); trigger notifikasi Organization/AI Assistant baru (Bagian 13); baris enkripsi `agent_ai_connections.encrypted_api_key` & audit log Organization baru (Bagian 14); 3 baris baru pada ADR Cross-Reference Matrix (Bagian 24).
- `development-playbook.md` — Golden Rule baru (poin 39 & 40) dan baris baru Modul 12/13 pada Development Order (Bagian 23.1).
- `CURRENT-PROJECT-STATE.md` — baris Modul 12 & 13 baru pada Overall Progress (status khusus: Governance Approved, kode belum eligible); item #8 baru pada Known Technical Debt.

### Changed
- **Keputusan Organization Management System dikunci final**: berdasarkan `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md` Bagian 8, `architecture-decision-records.md` `ADR-026` menetapkan entitas `organizations`/`organization_members`/`organization_invitations` dengan dimensi `organization_status` terpisah dari role platform, sebagai keputusan **Approved With Notes**. `ADR-027` menetapkan otorisasi Organization sebagai lapisan kedua independen dari RBAC platform (ADR-024 tidak diubah), sebagai keputusan **Approved**. Status **ADR-023** (Multi-Tenancy Strategy) direvisi untuk mengklarifikasi bahwa `organization_id` adalah grouping construct ringan, bukan `tenant_id`/isolasi penuh.
- **Keputusan AI Assistant Integration dikunci final**: berdasarkan proposal Bagian 18.3, `architecture-decision-records.md` `ADR-028` menetapkan model **BYOK** dengan 4 provider free-tier terkurasi (Google Gemini, Groq, Mistral, GitHub Models), riwayat chat tidak dipersist, terbuka lintas role internal berakun, sebagai keputusan **Approved With Notes**.
- `PROJECT-CONSTITUTION.md` naik dari v1.6 → **v1.7**: baris **Organization Management System** dan **AI Assistant Integration** ditambahkan ke Riwayat Keputusan Arsitektur; Technical Constraints poin 4 diperbarui (28 ADR); poin 10 baru melarang penulisan kode Modul 12/13 sebelum sinkronisasi dokumen sumber.
- `technology-decisions.md` naik dari v1.5 → **v1.6**: §4.33 baru untuk kurasi provider AI Assistant — **tidak ada baris "Official Technology Stack" baru** (Organization tidak menyentuh dokumen ini sama sekali).
- `SYSTEM-ARCHITECTURE.md` naik dari v1.5 → **v1.6**: Module Architecture, Database Architecture, Authorization Architecture, Notification Architecture, Security Architecture, dan ADR Cross-Reference Matrix diperbarui — **Bagian 4 (Technology Stack) tidak disentuh**, berbeda dari lima siklus sebelumnya.
- `dependency-manifest.md` naik dari v1.5 → **v1.6**: catatan eksplisit **tidak ada dependency npm baru** untuk ketiga ADR — Organization murni entitas + otorisasi, AI Assistant murni `fetch` native ke REST API.
- `development-playbook.md` naik dari v1.5 → **v1.6**: Golden Rule 39 (Organization-scoped authorization) & 40 (AI Assistant BYOK) baru; Development Order (Bagian 23.1) mendapat baris #12 & #13.
- `CURRENT-PROJECT-STATE.md` — *ADR & Governance Snapshot* diperbarui: **28 ADR Approved/Approved With Notes** (dari 25), **0 ADR OPEN**; cakupan sistem bertambah dari 11 menjadi 13 modul (arsitektur), namun implementasi kode Modul 12/13 eksplisit ditandai belum eligible.
- `decision-log.md` — field **Last Updated** diperbarui untuk mencerminkan penambahan entry `ADR-043`/`ADR-044`/`ADR-045` dan registrasi/resolusi `OD-14`/`OD-15` di §11. Baris "Multi Tenant" di Bagian 10 (Future Decisions) diperbarui untuk membedakan dari `organization_id` (ADR-026).

### Removed
Tidak ada perubahan pada kategori ini di rilis ini.

### Deprecated
Tidak ada perubahan pada kategori ini di rilis ini.

### Fixed
Tidak ada perubahan pada kategori ini di rilis ini (belum ada kode untuk diperbaiki; ini adalah rilis governance/dokumentasi). **Catatan errata (di luar cakupan permintaan siklus ini, diterapkan bersamaan karena menyentuh file yang sama):** entri `ADR-005` dan `ADR-006` di `architecture-decision-records.md` ditemukan ter-*revert* keliru menjadi status "OPEN" akibat kesalahan editing pada revisi 30 Juli 2026 (`0.1.4`) — dipulihkan pada revisi ini berdasarkan rekaman versi 28–29 Juli 2026 (`0.1.2`/`0.1.3`) dan konfirmasi silang 9 dokumen turunan yang tidak ikut ter-regresi. Lihat `architecture-decision-records.md` Governance Notes poin 4 untuk detail lengkap.

### Security
Tidak ada perubahan pada kategori ini di rilis ini (belum ada kode yang berpotensi memiliki celah keamanan). Catatan desain: `agent_ai_connections.encrypted_api_key` (ADR-028) mengikuti pola enkripsi at-rest yang sama dengan `agent_verification_documents.file_url`/`dbr_simulations` — tidak ada environment variable/secret tingkat-aplikasi baru, kredensial disimpan per-user di database.

### Database Changes
Tidak ada perubahan database fisik — belum ada project database yang diinisialisasi. **Skema target bertambah**: 3 tabel baru `organizations`/`organization_members`/`organization_invitations` + 2 kolom aditif `listings` + 1 kolom aditif `audit_logs` (ADR-026/027); 2 tabel baru `ai_providers`/`agent_ai_connections`, tanpa tabel riwayat percakapan (ADR-028). **Belum tereksekusi ke `ERD-Skema-Database-...v1.1.md`** — dijadwalkan paket sinkronisasi terpisah, lihat `CURRENT-PROJECT-STATE.md` Known Technical Debt #8.

### API Changes
Tidak ada perubahan kontrak — belum ada endpoint yang diimplementasikan. Endpoint group baru direncanakan `/organizations/*` (ADR-026/027) dan `/ai-assistant/*` (ADR-028) — **belum tereksekusi ke** `API-Specification-...v1.1.md`, dijadwalkan paket sinkronisasi terpisah.

### UI Changes
Tidak ada perubahan pada kategori ini di rilis ini — belum ada halaman/komponen yang diimplementasikan.

---

## [0.1.5] - 2026-07-31 - Initial Development (Governance Sync)

### Added
- `decision-log.md` `ADR-042` — entry baru "Caching Strategy: Supabase Postgres `rate_limit_log` (Fase 1), Migrasi Terjadwal ke Upstash Redis (Fase 2)", sinkronisasi dari `architecture-decision-records.md` `ADR-018` (Status: **Approved**, tanggal 2026-07-31, hasil sesi Architecture Review Board).
- `technology-decisions.md` §4.32 — Decision Detail baru untuk Supabase Postgres (tabel `rate_limit_log`, pola sliding window) sebagai Rate Limiting/Application Cache resmi Fase 1, termasuk kriteria ambang migrasi eksplisit ke Upstash Redis Fase 2.
- `SYSTEM-ARCHITECTURE.md` — node **rate_limit_log** baru pada Component Diagram (Bagian 3), folder `lib/rate-limit/` baru pada Folder Structure (Bagian 6), entitas `rate_limit_log` pada Database Architecture (Bagian 7), alur khusus rate limiting endpoint sensitif pada Data Flow (Bagian 7), catatan Rate Limiting Service pada Backend Architecture (Bagian 11).
- `dependency-manifest.md` — baris **`rate_limit_log` — bukan package npm** (Production Dependencies, Bagian 3) dan **`@upstash/redis`+`@upstash/ratelimit` (Fase 2, belum diinstal)**; catatan eksplisit bahwa Fase 1 tidak menambah dependency npm dan `ioredis`/self-hosted Redis ditolak permanen.
- `PROJECT-CONSTITUTION.md` — baris #12 baru pada tabel "Riwayat Keputusan Arsitektur", prinsip arsitektur baru (Bagian 22 poin 11), dan technical constraint baru (Bagian 24 poin 9) terkait Caching Strategy.
- `development-playbook.md` — Golden Rule baru (poin 38) dan aturan prompting baru (Bagian 21 poin 9) yang mewajibkan AI Coding Assistant mengasumsikan tabel `rate_limit_log` di Supabase Postgres sebagai konteks default untuk task rate limiting/cache aplikasi.

### Changed
- **Keputusan Caching Strategy dikunci final**: sebelumnya digantung pada hasil `ADR-006` (Job Queue) — jika BullMQ dipilih, Redis otomatis tersedia untuk kebutuhan ini sekaligus. Karena `ADR-006` final tanpa Redis, `architecture-decision-records.md` `ADR-018` dievaluasi & diselesaikan secara independen via sesi Architecture Review Board: rate limiting & application-level cache Fase 1 (MVP) diimplementasikan **native di atas Supabase Postgres** — tabel dedicated `rate_limit_log` (pola sliding window), tanpa menambah infrastruktur cache/in-memory-store baru — sebagai keputusan **Approved**, dengan migrasi terjadwal ke **Upstash Redis** di Fase 2 begitu salah satu dari tiga kriteria ambang tercapai (volume request endpoint sensitif >10.000/menit, query `rate_limit_log` >15% load database utama, atau kebutuhan cache aplikasi generik). Dua catatan kondisional Board: (1) struktur tabel final & algoritma sliding window presisi perlu diselesaikan bersamaan Sprint S1; (2) angka kriteria ambang migrasi perlu divalidasi data traffic produksi nyata. **Ini adalah ADR terakhir yang tersisa** — 25 dari 25 ADR proyek kini Approved.
- `technology-decisions.md` naik dari v1.4 → **v1.5**: baris **Rate Limiting/Application Cache** pada Official Technology Stack (Bagian 3) berubah dari "belum ditentukan, OPEN" menjadi **Approved**; poin Caching/Rate Limiting dihapus dari Open Questions (Bagian 9); Future Evaluation (Bagian 8) diperbarui agar Upstash Redis tercatat sebagai target migrasi Fase 2 terjadwal, bukan Open Question; Architecture Constraints (Bagian 6) mendapat poin 19 baru melarang Redis/Upstash/Vercel KV sebelum kriteria ambang tercapai.
- `SYSTEM-ARCHITECTURE.md` naik dari v1.4 → **v1.5**: seluruh referensi "ADR-018 — OPEN" diganti "ADR-018 — Approved" di Component Diagram, Technology Stack, Folder Structure, Database Architecture & Data Flow, Authentication & Authorization, Backend Architecture, Security Architecture, Performance Strategy, Scalability Strategy, Error Handling Strategy, Deployment Architecture, Risks, AI Development Notes, Open Questions, dan ADR Cross-Reference Matrix; ringkasan status ADR berubah dari "24 dari 25 Approved, 1 OPEN" menjadi **"25 dari 25 Approved, 0 OPEN"**.
- `dependency-manifest.md` naik dari v1.4 → **v1.5**: Open Questions poin Cache/Rate Limiting dihapus (RESOLVED); AI Development Guidelines poin 5 & 7 dan Maintenance Plan "ADR status watch" diperbarui; Package Compatibility mendapat baris baru `rate_limit_log` ↔ Vercel Cron Jobs (retensi baris).
- `PROJECT-CONSTITUTION.md` naik dari v1.5 → **v1.6**: baris **Cache/Rate Limit** pada Bagian 4 (Tech Stack) berubah dari "Belum final (ADR-018 — OPEN)" menjadi keputusan final; Technical Constraints poin 4 dikoreksi dari "Satu area teknis OPEN" menjadi "Tidak ada lagi area teknis OPEN"; Security Rules Bagian 20 poin 6 dan Environment Variables Bagian 17 disesuaikan (`UPSTASH_REDIS_REST_URL`/`TOKEN` menggantikan `REDIS_URL` generik, ditandai Fase 2 kondisional); Governance Bagian 25 & Source of Truth Bagian 26 diperbarui.
- `development-playbook.md` naik dari v1.4 → **v1.5**: AI Workflow (Bagian 4), Module Development (Bagian 22.3 — tabel ADR OPEN dikosongkan, baris ADR-018 dipindah ke blockquote resolved), dan Development Order (Bagian 23.2 — tabel prioritas resolusi dikosongkan) diperbarui; Security Rules (Bagian 13), Performance Rules (Bagian 15), dan Production Readiness Checklist (Bagian 25) disesuaikan.
- `CURRENT-PROJECT-STATE.md` — *ADR & Governance Snapshot* diperbarui: **25 ADR Approved** (dari 24), **0 ADR OPEN** (dari 1); *Readiness Snapshot* baris Technology Decisions berubah dari "hanya Caching Strategy tersisa" menjadi **"tuntas seluruhnya"**; *Open Decision (ADR) yang Tersisa* dikosongkan.
- `decision-log.md` — field **Last Updated** diperbarui untuk mencerminkan penambahan entry `ADR-042`. Bagian 6 (Decision Categories) & Bagian 10 (Future Decisions, baris Redis) diperbarui.

### Removed
Tidak ada perubahan pada kategori ini di rilis ini.

### Deprecated
Tidak ada perubahan pada kategori ini di rilis ini.

### Fixed
Tidak ada perubahan pada kategori ini di rilis ini (belum ada kode untuk diperbaiki; ini adalah rilis governance/dokumentasi). Catatan: koreksi hitungan area teknis OPEN di `PROJECT-CONSTITUTION.md` Bagian 24 poin 4 kini akurat menyusul resolusi ADR-018 ("tidak ada lagi area teknis OPEN") — dicatat di sini sebagai efek samping governance, bukan bug kode.

### Security
Tidak ada perubahan pada kategori ini di rilis ini (belum ada kode yang berpotensi memiliki celah keamanan). Kebijakan keamanan yang **akan** berlaku tetap sesuai `PROJECT-CONSTITUTION.md` Bagian 20 dan `architecture-decision-records.md` `ADR-017` (Security Strategy), kini dilengkapi mekanisme konkret untuk hard rule rate limiting bertingkat via `ADR-018`. Catatan desain: tabel `rate_limit_log` **tidak menambah environment variable/secret baru** — seluruhnya memakai koneksi Supabase yang sudah ada, mengurangi permukaan risiko kebocoran key dibanding opsi Redis/Upstash yang memerlukan kredensial tambahan. Endpoint sensitif (login, register, forgot-password, submit form publik) kini memiliki mekanisme penyimpanan status lintas-instance yang eksplisit dan dapat diaudit, menutup gap yang sebelumnya hanya berupa niat tanpa implementasi konkret.

### Database Changes
Tidak ada perubahan database fisik — belum ada project database yang diinisialisasi. **Skema target bertambah**: tabel baru `rate_limit_log` (status rate limiting bertingkat endpoint sensitif — kolom `identifier`, `action_type`, `attempt_count`, `window_start`, `blocked_until`, index komposit) — lihat `technology-decisions.md` §4.32 dan `SYSTEM-ARCHITECTURE.md` Bagian 7. Belum tereksekusi; direncanakan sebagai bagian migration Sprint S0/S1 (Modul 1).

### API Changes
Tidak ada perubahan kontrak — belum ada endpoint yang diimplementasikan. Mekanisme di balik rate limiting endpoint sensitif (login, register, forgot-password, submit form publik) terkunci sebagai tabel `rate_limit_log` di Supabase Postgres via `architecture-decision-records.md` `ADR-018` (lihat **RELEASE HISTORY [0.1.5]**) — menambahkan respons `429 Too Many Requests` + header `Retry-After` ke konvensi error handling `API-Specification-RUMAHAGEN-v1.1.md` §0, tanpa mengubah kontrak endpoint yang sudah ada.

### UI Changes
Tidak ada perubahan pada kategori ini di rilis ini — belum ada halaman/komponen yang diimplementasikan.

---

## [0.1.4] - 2026-07-30 - Initial Development (Governance Sync)

### Added
- `decision-log.md` `ADR-041` — entry baru "Maps Provider: Leaflet + OpenStreetMap + LocationIQ (Primary)/Geoapify (Approved Alternative) (Fase 1), Migrasi Bertahap MVP→Growth→Scale→Enterprise", sinkronisasi dari `architecture-decision-records.md` `ADR-008` (Status: **Approved**, tanggal 2026-07-30, direvisi v3, hasil sesi Architecture Review Board). `ADR-041` mencantumkan **Replaces: `ADR-028`** secara eksplisit.
- `technology-decisions.md` §4.29 — Decision Detail baru untuk Leaflet + React-Leaflet (rendering) + LocationIQ (Primary Geocoding Provider) + Geoapify (Approved Alternative Provider) sebagai Maps & Geocoding resmi Fase 1, termasuk roadmap migrasi bertahap eksplisit MVP → Growth → Scale → Enterprise.
- `SYSTEM-ARCHITECTURE.md` — node **Third Party Services** & **GeoCache** baru pada Component Diagram (Bagian 3), folder `lib/maps/` baru pada Folder Structure (Bagian 6), tabel `geocode_cache` pada Database Architecture (Bagian 7), alur khusus Maps/Geocoding (fallback chain LocationIQ→Geoapify→manual) pada Data Flow (Bagian 7), baris caching Maps baru pada Performance Strategy (Bagian 15).
- `dependency-manifest.md` — baris **`leaflet`**, **`react-leaflet`** (Production Dependencies, Bagian 3) dan **`@types/leaflet`** (Development Dependencies, Bagian 4); catatan eksplisit bahwa LocationIQ/Geoapify tidak memerlukan package npm (REST via `fetch`) dan `geocode_cache`/`api_rate_limits` tidak menambah dependency (migration SQL murni).
- `PROJECT-CONSTITUTION.md` — baris #11 baru pada tabel "Riwayat Keputusan Arsitektur", prinsip arsitektur baru (Bagian 22 poin 10), dan technical constraint baru (Bagian 24 poin 8) terkait Maps Provider; environment variable baru `LOCATIONIQ_API_KEY`/`GEOAPIFY_API_KEY` (Bagian 17).
- `development-playbook.md` — Golden Rule baru (poin 37) dan aturan prompting baru (Bagian 21 poin 8) yang mewajibkan AI Coding Assistant mengasumsikan Leaflet+OpenStreetMap+LocationIQ/Geoapify sebagai konteks default untuk task Maps/Geocoding, termasuk kewajiban rendering client-only.

### Changed
- **Keputusan Maps Provider dikunci final**: setelah sebelumnya dicatat sebagai `ADR-028` (Google Maps Platform) dengan caveat internal menunggu konfirmasi biaya bisnis — secara efektif berfungsi sebagai keputusan terbuka (lihat **Known Issues #4**) — prioritas proyek direvisi ke tiga kriteria dominan (budget-friendly, adopsi komunitas developer Indonesia, Bolt-friendliness), memicu re-evaluasi penuh via sesi Architecture Review Board lanjutan. `architecture-decision-records.md` `ADR-008` (direvisi v3) menetapkan **Leaflet + OpenStreetMap (rendering) dengan LocationIQ sebagai Primary Geocoding Provider dan Geoapify sebagai Approved Alternative Provider** — sebagai keputusan **Approved**, dilengkapi caching Postgres (`geocode_cache`), rate limiting scoped, offline/manual address fallback 3 lapis, dan roadmap migrasi bertahap MVP→Growth→Scale→Enterprise (termasuk opsi kembali ke Google Maps Platform pada tahap Enterprise). Tiga catatan kondisional Board: (1) uji akurasi data OSM sebelum Sprint S4; (2) pantau kuota harian LocationIQ sejak Sprint S0; (3) proyeksi volume bisnis untuk ambang migrasi Growth.
- `technology-decisions.md` naik dari v1.3 → **v1.4**: baris **Maps/Geocoding** pada Official Technology Stack (Bagian 3) berubah dari "belum final, condong Google Maps Platform" menjadi **Approved**; poin Maps dihapus dari Open Questions (Bagian 9), begitu pula poin wrapper library React (resolved bersamaan — `react-leaflet` dikunci, bukan `@vis.gl/react-google-maps`); Architecture Constraints (Bagian 6) mendapat poin 18 baru melarang penggantian provider Maps sebelum kriteria ambang migrasi tercapai.
- `SYSTEM-ARCHITECTURE.md` naik dari v1.3 → **v1.4**: seluruh referensi "ADR-008 — OPEN" diganti "ADR-008 — Approved" di Component Diagram, Technology Stack, Module Architecture (5.3/5.6), Folder Structure, Data Flow, Security Architecture, Performance Strategy, Scalability Strategy, Error Handling, Deployment Architecture, Risks, AI Development Notes, Open Questions, dan ADR Cross-Reference Matrix; ringkasan status ADR berubah dari "23 dari 25 Approved, 2 OPEN" menjadi **"24 dari 25 Approved, 1 OPEN"**.
- `dependency-manifest.md` naik dari v1.3 → **v1.4**: baris "Maps SDK — belum final" dihapus dan digantikan entri konkret `leaflet`/`react-leaflet`; Open Questions poin Maps wrapper dihapus (RESOLVED); AI Development Guidelines poin 5 dan Maintenance Plan "ADR status watch" diperbarui; Package Compatibility mendapat baris baru Leaflet↔React-Leaflet↔Next.js (wajib client-only) dan LocationIQ/Geoapify↔`fetch`.
- `PROJECT-CONSTITUTION.md` naik dari v1.4 → **v1.5**: baris **Maps/Geocoding** pada Bagian 4 (Tech Stack) berubah dari "Belum final (ADR-008 — OPEN)" menjadi keputusan final; Technical Constraints poin 4 dikoreksi dari "Dua area teknis OPEN" menjadi "Satu area teknis OPEN" (hanya ADR-018); Security Rules Bagian 20 poin 5 dan Environment Variables Bagian 17 disesuaikan (LocationIQ/Geoapify menggantikan skema Google Maps client-key/server-key); Governance Bagian 25 & Source of Truth Bagian 26 diperbarui.
- `development-playbook.md` naik dari v1.3 → **v1.4**: AI Workflow (Bagian 4), Module Development (Bagian 22.3 — baris ADR-008 dihapus dari tabel modul terdampak ADR OPEN, dikoreksi dari "Dua ADR" menjadi "Satu ADR"), dan Development Order (Bagian 23.2 — baris ADR-008 dihapus dari tabel prioritas resolusi) diperbarui; Security Rules (Bagian 13) dan Production Readiness Checklist (Bagian 25) disesuaikan.
- `CURRENT-PROJECT-STATE.md` — *ADR & Governance Snapshot* diperbarui: **24 ADR Approved** (dari 23), **1 ADR OPEN** (dari 2); *Readiness Snapshot* baris Technology Decisions berubah dari "Not Ready" menjadi **"Ready with Notes"**; blocker eksplisit terhadap Sprint S4/S9 dihapus dari *Next Recommended Module* & *Milestone Berikutnya*.
- `decision-log.md` — field **Last Updated** diperbarui untuk mencerminkan penambahan entry `ADR-041`. `ADR-028` (Google Maps Platform) **status diubah menjadi `Replaced`** dengan catatan referensi ke `ADR-041` — isi asli entry **tidak diedit**, dipertahankan sebagai sejarah (sesuai Bagian 2 poin 2–3 dokumen tsb). Open Decisions Bagian 11 poin 4 ditandai `RESOLVED`.

### Removed
Tidak ada perubahan pada kategori ini di rilis ini. (Catatan: baris "Maps SDK — belum final" di `dependency-manifest.md` **digantikan**, bukan sekadar dihapus, oleh entri `leaflet`/`react-leaflet` konkret — dicatat di atas sebagai **Changed**, bukan **Removed**, karena kapabilitasnya tetap ada dalam bentuk final.)

### Deprecated
Tidak ada perubahan pada kategori ini di rilis ini. (Catatan: `ADR-028`/Google Maps Platform **tidak** ditandai *Deprecated* — statusnya `Replaced` sesuai Bagian 3 `decision-log.md`, karena digantikan sepenuhnya oleh `ADR-041`, bukan sekadar tidak direkomendasikan untuk kode baru sembari sisa implementasi lama masih berjalan. Google Maps Platform sendiri **dipertahankan** sebagai jalur migrasi tahap Enterprise di roadmap `ADR-041` — bukan ditolak permanen.)

### Fixed
Tidak ada perubahan pada kategori ini di rilis ini (belum ada kode untuk diperbaiki; ini adalah rilis governance/dokumentasi). Catatan: koreksi hitungan area teknis OPEN di `PROJECT-CONSTITUTION.md` Bagian 24 poin 4 kini akurat menyusul resolusi ADR-008 — dicatat di sini sebagai efek samping governance, bukan bug kode.

### Security
Tidak ada perubahan pada kategori ini di rilis ini (belum ada kode yang berpotensi memiliki celah keamanan). Kebijakan keamanan yang **akan** berlaku tetap sesuai `PROJECT-CONSTITUTION.md` Bagian 20 dan `architecture-decision-records.md` `ADR-017` (Security Strategy). Catatan desain: `LOCATIONIQ_API_KEY`/`GEOAPIFY_API_KEY` wajib server-side only (rahasia) — **tanpa** client-key terpisah karena tiles OpenStreetMap tidak memerlukan API key sama sekali, mengurangi permukaan risiko kebocoran key dibanding skema Google Maps Platform (client-key + server-key) yang dicatat di `ADR-028` sebelumnya.

### Database Changes
Tidak ada perubahan database fisik — belum ada project database yang diinisialisasi. **Skema target bertambah**: tabel baru `geocode_cache` (cache hasil geocoding/reverse geocoding, TTL ~90 hari) dan opsional `api_rate_limits` (rate limiting scoped endpoint Maps) — lihat `technology-decisions.md` §4.29 dan `SYSTEM-ARCHITECTURE.md` Bagian 7. Belum tereksekusi; direncanakan sebagai bagian migration Sprint S4 (Modul 3).

### API Changes
Tidak ada perubahan kontrak — belum ada endpoint yang diimplementasikan. Mekanisme di balik integrasi Maps/Geocoding (form lokasi listing, peta proyek developer) terkunci sebagai Leaflet+OpenStreetMap+LocationIQ(Primary)/Geoapify(Approved Alternative) via `architecture-decision-records.md` `ADR-008` (lihat **RELEASE HISTORY [0.1.4]**) — tidak mengubah kontrak `API-Specification-RUMAHAGEN-v1.1.md` §13/§9.1 yang sudah ada (dokumen tsb sendiri belum disinkronkan redaksional — dicatat di `CURRENT-PROJECT-STATE.md` Known Technical Debt sebagai tindak lanjut terpisah).

### UI Changes
Tidak ada perubahan pada kategori ini di rilis ini — belum ada halaman/komponen yang diimplementasikan.

---

## [0.1.3] - 2026-07-29 - Initial Development (Governance Sync)

### Added
- `decision-log.md` `ADR-040` — entry baru "Job Queue Strategy: Vercel Cron Jobs + Postgres Trigger/Database Webhook (Fase 1), Migrasi Terjadwal ke QStash (Fase 2)", sinkronisasi dari `architecture-decision-records.md` `ADR-006` (Status: **Approved**, tanggal 2026-07-29, hasil sesi Architecture Review Board).
- `technology-decisions.md` §4.31 — Decision Detail baru untuk Vercel Cron Jobs + Postgres Trigger/Database Webhook sebagai Job Queue/Scheduler resmi Fase 1, termasuk kriteria ambang migrasi eksplisit ke QStash Fase 2.
- `SYSTEM-ARCHITECTURE.md` — node **Async/Scheduled Jobs** diperbarui pada Component Diagram (Bagian 3), folder `app/api/cron/**` baru pada Folder Structure (Bagian 6), dan alur khusus job asinkron/terjadwal pada Data Flow (Bagian 7), seluruhnya mendokumentasikan implementasi Vercel Cron Jobs + Postgres Trigger/Database Webhook.
- `dependency-manifest.md` — baris **Job Queue/Scheduler (Vercel Cron Jobs)**, **Postgres Trigger/Database Webhook**, dan **`@upstash/qstash` (Fase 2, belum diinstal)** pada Production Dependencies (Bagian 3), mendokumentasikan bahwa Fase 1 tidak menambah dependency npm dan `bullmq`/`ioredis` ditolak permanen.
- `PROJECT-CONSTITUTION.md` — baris #10 baru pada tabel "Riwayat Keputusan Arsitektur", prinsip arsitektur baru (Bagian 22 poin 9), dan technical constraint baru (Bagian 24 poin 7) terkait Job Queue Strategy.
- `development-playbook.md` — Golden Rule baru (poin 36) dan aturan prompting baru (Bagian 21 poin 7) yang mewajibkan AI Coding Assistant mengasumsikan Vercel Cron Jobs + Postgres Trigger/Database Webhook sebagai konteks default untuk task proses asinkron/terjadwal.

### Changed
- **Keputusan Job Queue Strategy dikunci final**: setelah sebelumnya dicatat sebagai bagian dari pertentangan terbuka antar dokumen governance (lihat **Known Issues #5**), `architecture-decision-records.md` `ADR-006` menetapkan strategi hybrid native — **Vercel Cron Jobs untuk tugas terjadwal periodik + Postgres Trigger/Database Webhook untuk tugas event-driven instan** (Fase 1, tanpa komponen infrastruktur tambahan), dengan **migrasi terjadwal ke QStash (Upstash) di Fase 2** begitu salah satu dari tiga kriteria ambang tercapai (volume job harian melampaui kapasitas batching per invocation, kebutuhan retry/backoff/dead-letter kompleks, atau frekuensi melampaui batas cron interval tier Vercel) — sebagai keputusan **Approved**, dengan dua catatan kondisional Board: (1) tier Vercel produksi perlu dikonfirmasi; (2) status resmi fitur Agent Workspace di roadmap perlu dikonfirmasi tim produk. **BullMQ+Redis ditolak** karena worker long-running-nya tidak kompatibel dengan model serverless Vercel yang dikunci `ADR-001`.
- `technology-decisions.md` naik dari v1.2 → **v1.3**: baris **Job Queue/Scheduler** pada Official Technology Stack (Bagian 3) berubah dari "belum final, condong Supabase Edge Functions+cron" menjadi **Approved**; poin Job Queue dihapus dari Open Questions (Bagian 9); Future Evaluation (Bagian 8) diperbarui agar QStash tercatat sebagai target migrasi Fase 2 terjadwal, bukan Open Question; Architecture Constraints (Bagian 6) mendapat poin 17 baru melarang BullMQ/Redis/worker long-running sebelum kriteria ambang tercapai.
- `SYSTEM-ARCHITECTURE.md` naik dari v1.2 → **v1.3**: seluruh referensi "ADR-006 — OPEN" diganti "ADR-006 — Approved" di Component Diagram, Technology Stack, Module Architecture (5.4/5.11), Folder Structure, Data Flow, Backend Architecture, Scalability Strategy, Risks, AI Development Notes, Open Questions, dan ADR Cross-Reference Matrix; ringkasan status ADR berubah dari "22 dari 25 Approved, 3 OPEN" menjadi **"23 dari 25 Approved, 2 OPEN"**.
- `dependency-manifest.md` naik dari v1.2 → **v1.3**: Open Questions poin Job Queue dihapus (RESOLVED); AI Development Guidelines poin 5 dan Maintenance Plan "ADR status watch" diperbarui agar tidak lagi mencantumkan ADR-006 sebagai area placeholder; Package Compatibility mendapat baris baru untuk Vercel Cron ↔ Route Handler.
- `PROJECT-CONSTITUTION.md` naik dari v1.3 → **v1.4**: baris **Job Queue** pada Bagian 4 (Tech Stack) berubah dari "Belum final (ADR-006 — OPEN)" menjadi keputusan final; Technical Constraints poin 4 dikoreksi dari "Dua area teknis OPEN" (ADR-008, ADR-018 saja); Governance poin 3 diperbarui.
- `development-playbook.md` naik dari v1.2 → **v1.3**: AI Workflow (Bagian 4), Module Development (Bagian 22.3 — baris ADR-006 dihapus dari tabel modul terdampak ADR OPEN, dikoreksi dari "Tiga ADR" menjadi "Dua ADR"), dan Development Order (Bagian 23.2 — baris ADR-006 dihapus dari tabel prioritas resolusi) diperbarui.
- `CURRENT-PROJECT-STATE.md` — *ADR & Governance Snapshot* diperbarui: **23 ADR Approved** (dari 22), **2 ADR OPEN** (dari 3); *Readiness Snapshot* kondisi #4 ("Mekanisme Job Queue diputuskan") berubah dari ❌ menjadi **✅ TERPENUHI**; kesimpulan readiness berubah dari "2 dari 6 kondisi terpenuhi" menjadi **"3 dari 6 kondisi terpenuhi"**.
- `decision-log.md` — field **Last Updated** diperbarui untuk mencerminkan penambahan entry `ADR-040`. Open Decisions Bagian 11 poin 5 diperbarui: bagian Job Queue ditandai `RESOLVED`, sehingga poin 5 secara keseluruhan kini sepenuhnya Resolved (Search Engine + Job Queue). Tidak ada entry lama yang diubah isinya.

### Removed
Tidak ada perubahan pada kategori ini di rilis ini.

### Deprecated
Tidak ada perubahan pada kategori ini di rilis ini.

### Fixed
Tidak ada perubahan pada kategori ini di rilis ini (belum ada kode untuk diperbaiki; ini adalah rilis governance/dokumentasi). Catatan: koreksi hitungan area teknis OPEN di `PROJECT-CONSTITUTION.md` Bagian 24 poin 4 kini akurat menyusul resolusi ADR-006 — dicatat di sini sebagai efek samping governance, bukan bug kode.

### Security
Tidak ada perubahan pada kategori ini di rilis ini (belum ada kode yang berpotensi memiliki celah keamanan). Kebijakan keamanan yang **akan** berlaku tetap sesuai `PROJECT-CONSTITUTION.md` Bagian 20 dan `architecture-decision-records.md` `ADR-017` (Security Strategy). Catatan desain: endpoint cron (`app/api/cron/**`) wajib diverifikasi header `Authorization: Bearer CRON_SECRET` — tidak terdaftar sebagai endpoint publik di API Specification, mencegah pemicu eksternal tanpa otorisasi.

### Database Changes
Tidak ada perubahan database fisik — belum ada project database yang diinisialisasi. **Skema target bertambah**: trigger function untuk counter sync (mis. `AFTER INSERT ON listing_leads`) dan opsional tabel audit `job_execution_log` — lihat `technology-decisions.md` §4.31 dan `SYSTEM-ARCHITECTURE.md` Bagian 7. Belum tereksekusi; direncanakan sebagai bagian migration Sprint S0.

### API Changes
Tidak ada perubahan kontrak — belum ada endpoint yang diimplementasikan. Endpoint non-publik baru direncanakan (`POST /api/cron/sitemap-regenerate`, `POST /api/cron/reminder-scan`, `POST /api/cron/listing-stale-scan`) via `architecture-decision-records.md` `ADR-006` (lihat **RELEASE HISTORY [0.1.3]**) — tidak terdaftar di `API-Specification-RUMAHAGEN-v1.1.md` sebagai endpoint publik, tidak mengubah kontrak endpoint yang sudah ada.

### UI Changes
Tidak ada perubahan pada kategori ini di rilis ini — belum ada halaman/komponen yang diimplementasikan.

---

## [0.1.2] - 2026-07-28 - Initial Development (Governance Sync)

### Added
- `decision-log.md` `ADR-039` — entry baru "Search Strategy: PostgreSQL Full-Text Search + pg_trgm (Fase 1), Migrasi Terjadwal ke Typesense (Fase 2)", sinkronisasi dari `architecture-decision-records.md` `ADR-005` (Status: **Approved**, tanggal 2026-07-28, hasil sesi Architecture Review Board).
- `technology-decisions.md` §4.30 — Decision Detail baru untuk PostgreSQL Full-Text Search + `pg_trgm` sebagai Search Engine resmi Fase 1, termasuk kriteria ambang migrasi eksplisit ke Typesense Fase 2.
- `SYSTEM-ARCHITECTURE.md` — node **Search Engine** baru pada Component Diagram (Bagian 3), subseksi **Catatan Search Service** pada Service Layer (Bagian 11), dan alur khusus pencarian pada Data Flow (Bagian 7), seluruhnya mendokumentasikan implementasi PostgreSQL FTS + `pg_trgm`.
- `dependency-manifest.md` — baris **Search Engine (`pg_trgm`)** dan **`typesense` (Fase 2, belum diinstal)** pada Production Dependencies (Bagian 3), mendokumentasikan bahwa Fase 1 tidak menambah dependency npm.
- `PROJECT-CONSTITUTION.md` — baris #9 baru pada tabel "Riwayat Keputusan Arsitektur", prinsip arsitektur baru (Bagian 22 poin 8), dan technical constraint baru (Bagian 24 poin 6) terkait Search Strategy.
- `AI-DEVELOPMENT-BLUEPRINT.md` — Golden Rule baru (poin 35) dan aturan prompting baru (Bagian 21 poin 6) yang mewajibkan AI Coding Assistant mengasumsikan PostgreSQL FTS + `pg_trgm` sebagai konteks default untuk task pencarian listing.

### Changed
- **Keputusan Search Strategy dikunci final**: setelah sebelumnya dicatat sebagai bagian dari pertentangan terbuka antar dokumen governance (lihat **Known Issues #5**), `architecture-decision-records.md` `ADR-005` menetapkan strategi bertahap — **PostgreSQL Full-Text Search + `pg_trgm` untuk Fase 1** (MVP, tanpa komponen infrastruktur tambahan), dengan **migrasi terjadwal ke Typesense di Fase 2** begitu salah satu dari tiga kriteria ambang tercapai (volume listing aktif >±50.000, latensi p95 `/properties/search` >500ms, atau keluhan relevansi berulang ≥3 laporan/sprint) — sebagai keputusan **Approved**, dengan dua catatan kondisional Board: (1) proyeksi volume listing 6–12 bulan perlu dikonfirmasi tim bisnis; (2) kapasitas DevOps/anggaran Typesense perlu dikonfirmasi sebelum kriteria ambang tercapai.
- `technology-decisions.md` naik dari v1.1 → **v1.2**: baris **Search Engine** pada Official Technology Stack (Bagian 3) berubah dari "OPEN, wajib diselesaikan sebelum Sprint S5" menjadi **Approved**; baris Search Engine dihapus dari Open Questions (Bagian 9); Future Evaluation (Bagian 8) diperbarui agar Typesense tercatat sebagai target migrasi Fase 2 terjadwal, bukan Open Question.
- `SYSTEM-ARCHITECTURE.md` naik dari v1.1 → **v1.2**: seluruh referensi "ADR-005 — OPEN" diganti "ADR-005 — Approved" di Component Diagram, Technology Stack, Module Architecture (5.3), API Architecture, Scalability Strategy, Risks, AI Development Notes, Open Questions, dan ADR Cross-Reference Matrix; ringkasan status ADR berubah dari "21 dari 25 Approved, 4 OPEN" menjadi **"22 dari 25 Approved, 3 OPEN"**.
- `dependency-manifest.md` naik dari v1.1 → **v1.2**: Open Questions poin Search Engine dihapus (RESOLVED); AI Development Guidelines poin 5 dan Maintenance Plan "ADR status watch" diperbarui agar tidak lagi mencantumkan ADR-005 sebagai area placeholder.
- `PROJECT-CONSTITUTION.md` naik dari v1.2 → **v1.3**: baris **Search Engine** pada Bagian 4 (Tech Stack) berubah dari "Belum final (ADR-005 — OPEN)" menjadi keputusan final; Technical Constraints poin 4 dikoreksi dari "Tiga area OPEN" yang sebelumnya salah mencantumkan 4 ADR menjadi benar-benar tiga (ADR-006, ADR-008, ADR-018); Governance poin 3 diperbarui.
- `AI-DEVELOPMENT-BLUEPRINT.md` naik dari v1.1 → **v1.2**: AI Workflow (Bagian 4), Module Development (Bagian 22.3 — baris ADR-005 dihapus dari tabel modul terdampak ADR OPEN, dikoreksi dari "Empat ADR" menjadi "Tiga ADR"), dan Development Order (Bagian 23.2 — baris ADR-005 dihapus dari tabel prioritas resolusi) diperbarui.
- `CURRENT-PROJECT-STATE.md` — *ADR & Governance Snapshot* diperbarui: **22 ADR Approved** (dari 21), **3 ADR OPEN** (dari 4); *Readiness Snapshot* kondisi #3 ("Strategi Search Engine Fase 1 diputuskan") berubah dari ❌ menjadi **✅ TERPENUHI**; kesimpulan readiness berubah dari "1 dari 6 kondisi terpenuhi" menjadi **"2 dari 6 kondisi terpenuhi"**.
- `decision-log.md` — field **Last Updated** diperbarui untuk mencerminkan penambahan entry `ADR-039`. Open Decisions Bagian 11 poin 5 dipisah: bagian Search Engine ditandai `RESOLVED`, bagian Job Queue tetap Open. Tidak ada entry lama yang diubah isinya.

### Removed
Tidak ada perubahan pada kategori ini di rilis ini.

### Deprecated
Tidak ada perubahan pada kategori ini di rilis ini.

### Fixed
Tidak ada perubahan pada kategori ini di rilis ini (belum ada kode untuk diperbaiki; ini adalah rilis governance/dokumentasi). Catatan: koreksi hitungan "Tiga area teknis OPEN" di `PROJECT-CONSTITUTION.md` Bagian 24 poin 4 (sebelumnya salah mencantumkan 4 ADR dengan label "Tiga") kini akurat menyusul resolusi ADR-005 — dicatat di sini sebagai efek samping governance, bukan bug kode.

### Security
Tidak ada perubahan pada kategori ini di rilis ini (belum ada kode yang berpotensi memiliki celah keamanan). Kebijakan keamanan yang **akan** berlaku tetap sesuai `PROJECT-CONSTITUTION.md` Bagian 20 dan `architecture-decision-records.md` `ADR-017` (Security Strategy). Catatan desain: query pencarian (`/properties/search`, `/properties/autocomplete`) tetap tunduk RLS Supabase yang sudah berjalan (ADR-003/ADR-004) — tidak ada lapisan otorisasi baru yang perlu dirancang untuk Fase 1 (native Postgres, tanpa sistem index eksternal).

### Database Changes
Tidak ada perubahan database fisik — belum ada project database yang diinisialisasi. **Skema target bertambah**: `listings` direncanakan memiliki kolom generated `search_vector` (tipe `tsvector`, digabung dari `title`/`description`/`area_keyword`) dengan index GIN, serta ekstensi `pg_trgm` diaktifkan — lihat `technology-decisions.md` §4.30 dan `SYSTEM-ARCHITECTURE.md` Bagian 7. Belum tereksekusi; direncanakan sebagai bagian migration Sprint S0/S4 (Modul 3).

### API Changes
Tidak ada perubahan kontrak — belum ada endpoint yang diimplementasikan. Mesin di balik `GET /properties/search` dan `GET /properties/autocomplete` kini terkunci sebagai PostgreSQL FTS + `pg_trgm` via `architecture-decision-records.md` `ADR-005` (lihat **RELEASE HISTORY [0.1.2]**), kontrak `API-Specification-RUMAHAGEN-v1.1.md` §3 tidak berubah — bentuk request/response tetap sama terlepas dari mesin pencari, termasuk saat migrasi Fase 2 ke Typesense kelak terjadi.

### UI Changes
Tidak ada perubahan pada kategori ini di rilis ini — belum ada halaman/komponen yang diimplementasikan.

---

## [0.1.1] - 2026-07-27 - Initial Development (Governance Sync)

### Added
- `architecture-decision-records.md` — dokumen Architecture Decision Records (ADR) resmi proyek, berisi **25 ADR** (`ADR-001`–`ADR-025`) yang mencakup seluruh keputusan arsitektur & teknis inti (Backend Architecture, Authentication, Authorization/RBAC, Database, Search, Job Queue, Email, Maps, Storage, Deployment, State Management, API Architecture, Error Handling, Logging, Monitoring, Testing, Security, Caching, File Upload, Notification, Frontend Framework, Database Schema Conventions, Multi-Tenancy, RBAC Role Model Scope, Type Safety & Validation). Ditetapkan sebagai **satu-satunya sumber kebenaran** untuk desain arsitektur & implementasi teknis, dirujuk wajib oleh `technology-decisions.md`, `SYSTEM-ARCHITECTURE.md`, `AI-DEVELOPMENT-BLUEPRINT.md`, dan `dependency-manifest.md`. Status dokumen: **Draft — menunggu review & pengesahan tim**.
- `decision-log.md` `ADR-038` — entry baru "Backend Architecture: Next.js Route Handlers sebagai BFF Tipis (Tanpa Service Node Terpisah)", sinkronisasi dari `architecture-decision-records.md` `ADR-001` (Status: **Approved**, tanggal 2026-07-27, hasil sesi Architecture Review Board).

### Changed
- **Keputusan arsitektur backend dikunci final**: setelah sebelumnya dicatat sebagai pertentangan terbuka antar dokumen governance (lihat **Known Issues #1**), `architecture-decision-records.md` `ADR-001` menetapkan **Next.js Route Handlers sebagai BFF tipis** (terintegrasi langsung ke Supabase, tanpa service backend Node terpisah seperti NestJS/Express) sebagai keputusan **Approved**, dengan dua catatan kondisional Board: (1) batas eksekusi serverless Vercel wajib didokumentasikan eksplisit di `SYSTEM-ARCHITECTURE.md`; (2) **Bolt.new** sebagai toolchain resmi proyek perlu ditambahkan eksplisit ke `technology-decisions.md`/`dependency-manifest.md`.
- `decision-log.md` — field **Last Updated** diperbarui untuk mencerminkan penambahan entry `ADR-038`. Tidak ada entry lama yang diubah isinya.

### Removed
Tidak ada perubahan pada kategori ini di rilis ini.

### Deprecated
Tidak ada perubahan pada kategori ini di rilis ini.

### Fixed
Tidak ada perubahan pada kategori ini di rilis ini (belum ada kode untuk diperbaiki; ini adalah rilis governance/dokumentasi).

### Security
Tidak ada perubahan pada kategori ini di rilis ini (belum ada kode yang berpotensi memiliki celah keamanan). Kebijakan keamanan yang **akan** berlaku tetap sesuai `PROJECT-CONSTITUTION.md` Bagian 20 dan `architecture-decision-records.md` `ADR-017` (Security Strategy).

### Database Changes
Tidak ada perubahan pada kategori ini di rilis ini — belum ada database fisik yang diinisialisasi.

### API Changes
Tidak ada perubahan pada kategori ini di rilis ini — belum ada endpoint yang diimplementasikan. Konvensi lokasi eksekusi API (Route Handlers, bukan service terpisah) kini terkunci via `ADR-001`, namun kontrak API itu sendiri tidak berubah dari `API-Specification-RUMAHAGEN-v1.1.md`.

### UI Changes
Tidak ada perubahan pada kategori ini di rilis ini — belum ada halaman/komponen yang diimplementasikan.

---

## [0.1.0] - 2026-07-27 - Initial Development

### Added
- `PROJECT-CONSTITUTION.md` — aturan tetap proyek (tujuan sistem, role, tech stack, konvensi, security rules, dsb.), v1.1.
- `PRD-RUMAHAGEN-v1.1.md` — Product Requirements Document, 11 modul fungsional.
- `ERD-Skema-Database-Real-Estate-Agency-v1.1.md` + `ERD-Diagram-v1.1.mermaid` — desain skema database (37+ entitas).
- `API-Specification-RUMAHAGEN-v1.1.md` — kontrak REST API lengkap.
- `User-Flow-RUMAHAGEN-v1.1.md` — alur interaksi UI per role.
- `SEO-Analytics-Specification-RUMAHAGEN-v1.1.md` — strategi rendering, SEO, analytics.
- `SYSTEM-ARCHITECTURE.md` — arsitektur teknis end-to-end (23 bagian).
- `technology-decisions.md` — keputusan teknologi resmi & justifikasinya.
- `dependency-manifest.md` — katalog dependency resmi yang boleh digunakan.
- `AI-DEVELOPMENT-BLUEPRINT.md` — panduan operasional eksekusi harian AI Coding Assistant (ditetapkan sebagai versi acuan aktif).
- `AI-CONTEXT-PACK.md` — ringkasan context tetap untuk di-reload setiap sesi AI.
- `DEVELOPMENT-ROADMAP.md` — roadmap 15 sprint (S0–S14) dengan urutan modul berbasis dependency.
- `TASK-TEMPLATE.md` — template task reusable untuk seluruh jenis pekerjaan development.
- `CURRENT-PROJECT-STATE.md` — dokumen status proyek berjalan (living document).
- `CHANGELOG.md` — dokumen ini.

### Changed
- Resolusi 7 konflik lintas dokumen sumber v1.0 → v1.1 (role `buyer` & `instructor` diformalkan, cakupan Manager ditegaskan selalu global, satuan tenor DBR ditegaskan selalu bulan, `developer_projects.city` dimigrasi ke `city_id`, framework Next.js ditetapkan, fitur review agen diaktifkan Fase 1) — lihat "Riwayat Keputusan Arsitektur" di `PROJECT-CONSTITUTION.md`.

### Database Changes
Tidak ada perubahan database fisik — belum ada project database yang diinisialisasi. Skema **target** didefinisikan penuh sebagai desain di `ERD-Skema-Database-Real-Estate-Agency-v1.1.md`.

### API Changes
Tidak ada endpoint yang diimplementasikan — kontrak **target** didefinisikan penuh sebagai desain di `API-Specification-RUMAHAGEN-v1.1.md`.

### UI Changes
Tidak ada UI yang diimplementasikan — belum ada monorepo/komponen fisik (lihat `CURRENT-PROJECT-STATE.md`).

### Fixed
Tidak ada perubahan pada kategori ini di rilis ini (belum ada kode untuk diperbaiki).

### Security
Tidak ada perubahan pada kategori ini di rilis ini (belum ada kode untuk diamankan). Kebijakan keamanan yang **akan** berlaku sudah didefinisikan di `PROJECT-CONSTITUTION.md` Bagian 20.

---

# MODULE HISTORY

Riwayat status tiap modul dari waktu ke waktu. Baris baru ditambahkan setiap kali status sebuah modul berubah — baris lama tidak dihapus.

| Version | Tanggal | Modul | Status Baru | Catatan |
|---|---|---|---|---|
| 0.1.0 | 2026-07-27 | Governance & Documentation | Completed | Seluruh dokumen desain/governance v1.1 selesai |
| 0.1.0 | 2026-07-27 | Phase 0 — Foundation Infrastructure | Not Started | Menunggu Sprint S0 |
| 0.1.0 | 2026-07-27 | Modul 1 — Authentication | Not Started | Menunggu Sprint S1 |
| 0.1.0 | 2026-07-27 | Modul 2 — Agent Profile | Not Started | Menunggu Sprint S2 |
| 0.1.0 | 2026-07-27 | Modul 9+10 — Admin Panel & RBAC | Not Started | Menunggu Sprint S3 |
| 0.1.0 | 2026-07-27 | Modul 3 — Listing Management | Not Started | Menunggu Sprint S4–S5 |
| 0.1.0 | 2026-07-27 | Modul 11 — SEO & Analytics | Not Started | Menunggu Sprint S6 |
| 0.1.0 | 2026-07-27 | Modul 2 ext. — Buyer & Reviews | Not Started | Menunggu Sprint S7 |
| 0.1.0 | 2026-07-27 | Modul 8 — Dashboard & Notifikasi | Not Started | Menunggu Sprint S8 |
| 0.1.0 | 2026-07-27 | Modul 6 — Developer Directory | Not Started | Menunggu Sprint S9 |
| 0.1.0 | 2026-07-27 | Modul 7 — DBR Scoring | Not Started | Menunggu Sprint S10 |
| 0.1.0 | 2026-07-27 | Modul 4 — Learning Center | Not Started | Menunggu Sprint S12 |
| 0.1.0 | 2026-07-27 | Modul 5 — Kalender Event | Not Started | Menunggu Sprint S13 |

---

# DATABASE CHANGES

Log kumulatif seluruh perubahan skema database lintas versi (agregasi dari **Release History** di atas, disusun agar mudah ditelusuri per kategori).

## [0.1.5] - 2026-07-31
- Tidak ada perubahan fisik — belum ada database. **Skema target bertambah**: tabel `rate_limit_log` (status rate limiting bertingkat endpoint sensitif, index komposit `identifier`+`action_type`+`window_start`) — via `architecture-decision-records.md` `ADR-018` (Approved). Lihat `technology-decisions.md` §4.32.

## [0.1.4] - 2026-07-30
- Tidak ada perubahan fisik — belum ada database. **Skema target bertambah**: tabel `geocode_cache` (cache geocoding/reverse geocoding, TTL ~90 hari) + opsional `api_rate_limits` (rate limiting scoped Maps) — via `architecture-decision-records.md` `ADR-008` (Approved, direvisi v3). Lihat `technology-decisions.md` §4.29.

## [0.1.3] - 2026-07-29
- Tidak ada perubahan fisik — belum ada database. **Skema target bertambah**: trigger function counter sync (mis. `AFTER INSERT ON listing_leads`) + opsional tabel audit `job_execution_log` — via `architecture-decision-records.md` `ADR-006` (Approved). Lihat `technology-decisions.md` §4.31.

## [0.1.2] - 2026-07-28
- Tidak ada perubahan fisik — belum ada database. **Skema target bertambah**: kolom generated `search_vector` (tsvector) + index GIN pada `listings`, ekstensi `pg_trgm` diaktifkan — via `architecture-decision-records.md` `ADR-005` (Approved). Lihat `technology-decisions.md` §4.30.

## [0.1.1] - 2026-07-27
- Tidak ada perubahan — belum ada database fisik. Skema target tidak berubah dari `ERD-Skema-Database-Real-Estate-Agency-v1.1.md`.

## [0.1.0] - 2026-07-27
- Tidak ada perubahan — belum ada database fisik. Skema target: lihat `ERD-Skema-Database-Real-Estate-Agency-v1.1.md`.

---

# API CHANGES

Log kumulatif seluruh perubahan kontrak API lintas versi.

## [0.1.5] - 2026-07-31
- Tidak ada perubahan kontrak endpoint — belum ada endpoint yang diimplementasikan. Mekanisme rate limiting endpoint sensitif terkunci sebagai tabel `rate_limit_log` di Supabase Postgres via `architecture-decision-records.md` `ADR-018` (lihat **RELEASE HISTORY [0.1.5]**), menambahkan respons `429 Too Many Requests` + header `Retry-After` ke konvensi `API-Specification-RUMAHAGEN-v1.1.md` §0.

## [0.1.4] - 2026-07-30
- Tidak ada perubahan kontrak — belum ada endpoint yang diimplementasikan. Mekanisme di balik integrasi Maps/Geocoding terkunci sebagai Leaflet+OpenStreetMap+LocationIQ(Primary)/Geoapify(Approved Alternative) via `architecture-decision-records.md` `ADR-008` (lihat **RELEASE HISTORY [0.1.4]**). Endpoint yang sudah terdefinisi di `API-Specification-RUMAHAGEN-v1.1.md` §13/§9.1 tidak berubah kontraknya (dokumen tsb sendiri belum disinkronkan redaksional).

## [0.1.3] - 2026-07-29
- Tidak ada perubahan kontrak — belum ada endpoint yang diimplementasikan. Mekanisme di balik proses asinkron/terjadwal terkunci sebagai Vercel Cron Jobs + Postgres Trigger/Database Webhook via `architecture-decision-records.md` `ADR-006` (lihat **RELEASE HISTORY [0.1.3]**). Endpoint non-publik baru (`app/api/cron/**`) direncanakan, tidak mengubah kontrak `API-Specification-RUMAHAGEN-v1.1.md` yang sudah ada.

## [0.1.2] - 2026-07-28
- Tidak ada perubahan kontrak — belum ada endpoint yang diimplementasikan. Mesin pencari di balik `GET /properties/search`/`GET /properties/autocomplete` terkunci sebagai PostgreSQL FTS + `pg_trgm` via `architecture-decision-records.md` `ADR-005` (lihat **RELEASE HISTORY [0.1.2]**), kontrak `API-Specification-RUMAHAGEN-v1.1.md` §3 tidak berubah.

## [0.1.1] - 2026-07-27
- Tidak ada perubahan kontrak — belum ada endpoint yang diimplementasikan. Lokasi eksekusi API terkunci sebagai Next.js Route Handlers via `architecture-decision-records.md` `ADR-001` (lihat **RELEASE HISTORY [0.1.1]**), kontrak `API-Specification-RUMAHAGEN-v1.1.md` tidak berubah.

## [0.1.0] - 2026-07-27
- Tidak ada perubahan — belum ada endpoint yang diimplementasikan. Kontrak target: lihat `API-Specification-RUMAHAGEN-v1.1.md`.

---

# UI CHANGES

Log kumulatif seluruh perubahan antarmuka pengguna lintas versi.

## [0.1.5] - 2026-07-31
- Tidak ada perubahan — belum ada halaman/komponen yang diimplementasikan.

## [0.1.4] - 2026-07-30
- Tidak ada perubahan — belum ada halaman/komponen yang diimplementasikan.

## [0.1.3] - 2026-07-29
- Tidak ada perubahan — belum ada halaman/komponen yang diimplementasikan.

## [0.1.2] - 2026-07-28
- Tidak ada perubahan — belum ada halaman/komponen yang diimplementasikan.

## [0.1.1] - 2026-07-27
- Tidak ada perubahan — belum ada halaman/komponen yang diimplementasikan.

## [0.1.0] - 2026-07-27
- Tidak ada perubahan — belum ada halaman/komponen yang diimplementasikan.

---

# SECURITY FIXES

Log kumulatif seluruh perbaikan keamanan lintas versi.

## [0.1.5] - 2026-07-31
- Tidak ada — belum ada kode yang berpotensi memiliki celah keamanan. Catatan desain: mekanisme rate limiting endpoint sensitif kini dikunci final (tabel `rate_limit_log`, `ADR-018`), menutup gap hard rule `ADR-017` yang sebelumnya hanya berupa niat tanpa mekanisme konkret.

## [0.1.4] - 2026-07-30
- Tidak ada — belum ada kode yang berpotensi memiliki celah keamanan.

## [0.1.3] - 2026-07-29
- Tidak ada — belum ada kode yang berpotensi memiliki celah keamanan.

## [0.1.2] - 2026-07-28
- Tidak ada — belum ada kode yang berpotensi memiliki celah keamanan.

## [0.1.1] - 2026-07-27
- Tidak ada — belum ada kode yang berpotensi memiliki celah keamanan.

## [0.1.0] - 2026-07-27
- Tidak ada — belum ada kode yang berpotensi memiliki celah keamanan.

---

# PERFORMANCE IMPROVEMENTS

Log kumulatif seluruh peningkatan performa lintas versi.

## [0.1.5] - 2026-07-31
- Tidak ada — belum ada kode yang dapat diukur performanya.

## [0.1.4] - 2026-07-30
- Tidak ada — belum ada kode yang dapat diukur performanya.

## [0.1.3] - 2026-07-29
- Tidak ada — belum ada kode yang dapat diukur performanya.

## [0.1.2] - 2026-07-28
- Tidak ada — belum ada kode yang dapat diukur performanya.

## [0.1.1] - 2026-07-27
- Tidak ada — belum ada kode yang dapat diukur performanya.

## [0.1.0] - 2026-07-27
- Tidak ada — belum ada kode yang dapat diukur performanya.

---

# BUG FIXES

Log kumulatif seluruh perbaikan bug lintas versi, dengan referensi Task ID.

## [0.1.5] - 2026-07-31
- Tidak ada — belum ada kode yang dapat memiliki bug.

## [0.1.4] - 2026-07-30
- Tidak ada — belum ada kode yang dapat memiliki bug.

## [0.1.3] - 2026-07-29
- Tidak ada — belum ada kode yang dapat memiliki bug.

## [0.1.2] - 2026-07-28
- Tidak ada — belum ada kode yang dapat memiliki bug.

## [0.1.1] - 2026-07-27
- Tidak ada — belum ada kode yang dapat memiliki bug.

## [0.1.0] - 2026-07-27
- Tidak ada — belum ada kode yang dapat memiliki bug.

---

# BREAKING CHANGES

Log kumulatif seluruh breaking change lintas versi — setiap entri wajib menyertakan panduan migrasi atau rujukan ke **Migration Notes**.

## [0.1.5] - 2026-07-31
- Tidak ada. Penguncian keputusan Caching Strategy (`ADR-018`) bersifat penegasan governance, bukan breaking change terhadap kontrak API yang sudah live (belum ada kontrak live — proyek 0% kode).

## [0.1.4] - 2026-07-30
- Tidak ada. Penguncian keputusan Maps Provider (`ADR-008`) bersifat penegasan governance, bukan breaking change terhadap kontrak API yang sudah live (belum ada kontrak live — proyek 0% kode). Perubahan provider dari Google Maps Platform (`ADR-028`) ke Leaflet+OSM+LocationIQ/Geoapify (`ADR-041`) juga bukan breaking change kode, karena `ADR-028` belum pernah diimplementasikan.

## [0.1.3] - 2026-07-29
- Tidak ada. Penguncian keputusan Job Queue Strategy (`ADR-006`) bersifat penegasan governance, bukan breaking change terhadap kontrak API yang sudah live (belum ada kontrak live — proyek 0% kode).

## [0.1.2] - 2026-07-28
- Tidak ada. Penguncian keputusan Search Strategy (`ADR-005`) bersifat penegasan governance, bukan breaking change terhadap kontrak API yang sudah live (belum ada kontrak live — proyek 0% kode).

## [0.1.1] - 2026-07-27
- Tidak ada. Penguncian keputusan Backend Architecture (`ADR-001`) bersifat penegasan governance, bukan breaking change terhadap kontrak API yang sudah live (belum ada kontrak live — proyek 0% kode).

## [0.1.0] - 2026-07-27
- Tidak ada.

---

# MIGRATION NOTES

Panduan migrasi (data, skema, atau kode konsumen API) untuk setiap rilis yang membutuhkannya.

## [0.1.5] - 2026-07-31
- Tidak ada migration yang perlu dijalankan — belum ada migration file yang dibuat. Tabel `rate_limit_log` direncanakan masuk migration Sprint S0/S1 (Modul 1), bukan migration terpisah untuk rilis ini.

## [0.1.4] - 2026-07-30
- Tidak ada migration yang perlu dijalankan — belum ada migration file yang dibuat. Tabel `geocode_cache`/`api_rate_limits` direncanakan masuk migration Sprint S4, bukan migration terpisah untuk rilis ini.

## [0.1.3] - 2026-07-29
- Tidak ada migration yang perlu dijalankan — belum ada migration file yang dibuat. Trigger counter sync + tabel `job_execution_log` direncanakan masuk migration Sprint S0, bukan migration terpisah untuk rilis ini.

## [0.1.2] - 2026-07-28
- Tidak ada migration yang perlu dijalankan — belum ada migration file yang dibuat. Kolom `search_vector` + index GIN + ekstensi `pg_trgm` direncanakan masuk migration Sprint S0/S4, bukan migration terpisah untuk rilis ini.

## [0.1.1] - 2026-07-27
- Tidak ada migration yang perlu dijalankan — belum ada migration file yang dibuat.

## [0.1.0] - 2026-07-27
- Tidak ada migration yang perlu dijalankan — belum ada migration file yang dibuat.

---

# KNOWN ISSUES

Isu yang diketahui namun belum diperbaiki, bersifat kumulatif — ditandai `RESOLVED` (bukan dihapus) begitu selesai ditangani, dengan versi resolusinya.

| # | Isu | Sejak Versi | Status | Dampak |
|---|---|---|---|---|
| 1 | Keputusan arsitektur backend (Route Handlers vs service terpisah) sudah condong ke Route Handlers+Supabase di `technology-decisions.md`, namun belum disinkronkan balik ke `PROJECT-CONSTITUTION.md`/`SYSTEM-ARCHITECTURE.md` yang masih mencatatnya terbuka. | 0.1.0 | **RESOLVED (0.1.1)** — keputusan dikunci final via `architecture-decision-records.md` `ADR-001` & `decision-log.md` `ADR-038` (2026-07-27). **Catatan sisa:** sinkronisasi redaksional ke `PROJECT-CONSTITUTION.md`/`SYSTEM-ARCHITECTURE.md` itu sendiri belum dieksekusi — lihat catatan kondisional Board di entry `0.1.1`. | Governance — tidak lagi memblokir Sprint S0/S1; sinkronisasi redaksional dapat menyusul tanpa mengubah keputusan |
| 2 | State management server-state (TanStack Query vs SWR) sudah diputuskan tegas di `technology-decisions.md`, namun `SYSTEM-ARCHITECTURE.md` Bagian 10 masih menulis "pilih salah satu". | 0.1.0 | Open | Governance — non-blocking |
| 3 | Vercel sebagai hosting resmi belum tercatat formal di `PROJECT-CONSTITUTION.md`. | 0.1.0 | Open | Governance — non-blocking |
| 4 | Provider Maps (Google Maps Platform) sudah final di `technology-decisions.md`, namun `PROJECT-CONSTITUTION.md`/`API-Specification` masih mencatat "belum final". | 0.1.0 | **RESOLVED (0.1.4)** — keputusan direvisi & dikunci final via `architecture-decision-records.md` `ADR-008` (direvisi v3) & `decision-log.md` `ADR-041` (2026-07-30), menggantikan `ADR-028` (status diubah menjadi `Replaced`): Leaflet + OpenStreetMap dengan LocationIQ sebagai Primary Geocoding Provider dan Geoapify sebagai Approved Alternative Provider, Fase 1, roadmap migrasi bertahap MVP→Growth→Scale→Enterprise. **Catatan sisa:** sinkronisasi redaksional ke `API-Specification-v1.1.md` §13/§9.1 itu sendiri belum dieksekusi — dicatat di `CURRENT-PROJECT-STATE.md` Known Technical Debt sebagai tindak lanjut terpisah. | Governance — tidak lagi memblokir Modul 3/Sprint S4 maupun Modul 6/Sprint S9; sinkronisasi redaksional dapat menyusul tanpa mengubah keputusan |
| 5 | Search Engine (Typesense/Elasticsearch) & Job Queue (BullMQ vs Supabase Edge Functions) belum masuk *Official Technology Stack*. | 0.1.0 | **Search Engine: RESOLVED (0.1.2)** — keputusan dikunci final via `architecture-decision-records.md` `ADR-005` & `decision-log.md` `ADR-039` (2026-07-28): PostgreSQL FTS + `pg_trgm` Fase 1, migrasi terjadwal ke Typesense Fase 2. **Job Queue: RESOLVED (0.1.3)** — keputusan dikunci final via `architecture-decision-records.md` `ADR-006` & `decision-log.md` `ADR-040` (2026-07-29): Vercel Cron Jobs + Postgres Trigger/Database Webhook Fase 1, migrasi terjadwal ke QStash Fase 2; BullMQ+Redis ditolak karena tidak kompatibel dengan model serverless ADR-001. | Isu ini sepenuhnya resolved — tidak lagi memblokir apa pun |
| 6 | Provider Email (Resend) & Monitoring (Sentry) sudah diputuskan di `technology-decisions.md`, belum disinkronkan ke `SYSTEM-ARCHITECTURE.md` yang masih mencatatnya kosong. | 0.1.0 | Open | Governance — non-blocking |

---

# TECHNICAL DEBT

Belum ada technical debt kode (belum ada kode yang ditulis). Debt yang tercatat saat ini seluruhnya bersifat **debt keputusan governance** — lihat tabel **Known Issues** di atas dan `CURRENT-PROJECT-STATE.md` bagian "Known Technical Debt" untuk detail dan rekomendasi penyelesaian.

---

# NEXT PLANNED RELEASE

## [0.2.0] (Planned) - Sprint S0 — Foundation Infrastructure
Cakupan yang direncanakan (lihat `DEVELOPMENT-ROADMAP.md` & `CURRENT-PROJECT-STATE.md` bagian "Next Recommended Module"):
- Inisialisasi monorepo (`apps/web`, `packages/shared-types`), Next.js + TypeScript `strict: true`.
- Setup Tailwind v4 + shadcn/ui, ESLint/Prettier/Husky.
- CI pipeline (lint + type-check + test) di GitHub Actions.
- Migration awal: `users`, `roles`, `permissions`, `role_permissions` (seed 8 role & permission dasar).
- Seed data referensi wilayah Indonesia (`ref_provinces/cities/districts/villages`).
- Skeleton route group `(public)/(auth)/(dashboard)/(admin)` + middleware skeleton.

Target versi berikutnya mengikuti Sprint Plan: `0.3.0` (Modul 1 — Authentication, Sprint S1), dan seterusnya hingga `1.0.0` ditetapkan sebagai **Phase 1 MVP selesai** (setelah Sprint S8 lolos penuh, per milestone `DEVELOPMENT-ROADMAP.md`).

---

# AI SESSION SUMMARY

Ringkasan tiap sesi kerja AI Coding Assistant yang menghasilkan perubahan nyata pada proyek (dokumen maupun kode) — bersifat kumulatif, entri baru selalu ditambahkan, tidak menggantikan entri lama.

## Session 1 — 2026-07-26
**Peran:** Principal Software Architect
**Output:** Review menyeluruh dokumen sumber v1.0 (PRD, ERD, API Spec, User Flow, SEO Spec) → `PROJECT-CONSTITUTION.md` v1.0 dibuat, mendokumentasikan 7 konflik lintas dokumen beserta rekomendasi resolusi.

## Session 2 — 2026-07-26
**Peran:** Principal Software Architect
**Output:** 7 konflik yang ditemukan di Session 1 diperbaiki langsung di seluruh dokumen sumber (naik ke v1.1: PRD, ERD, ERD Diagram, API Spec, User Flow, SEO Spec). `PROJECT-CONSTITUTION.md` direvisi mengikuti dokumen v1.1 (bagian "Daftar Konflik" diganti menjadi "Riwayat Keputusan Arsitektur").

## Session 3 — 2026-07-26/27
**Peran:** Principal Software Architect
**Output:** `AI-DEVELOPMENT-BLUEPRINT.md` v1.0 dibuat (32 bagian) sebagai panduan operasional AI Coding Assistant.

## Session 4 — 2026-07-27
**Peran:** Principal Software Architect / Senior Product Manager / AI Coding Workflow Designer
**Output:** Mempelajari 6 dokumen tambahan yang diupload user: `AI-CONTEXT-PACK.md`, `ai-development-blueprint` (versi upload, 24 bagian), `technology-decisions.md`, `dependency-manifest.md`, `SYSTEM-ARCHITECTURE.md`, `DEVELOPMENT-ROADMAP.md`. Ditemukan bahwa versi Blueprint upload berbeda dari yang dibuat di Session 3, serta beberapa ketidaksinkronan status "final" antar dokumen (lihat **Known Issues**). Tidak ada file baru dibuat pada sesi ini (tugas murni riset/analisis).

## Session 5 — 2026-07-27
**Keputusan:** User menetapkan `AI-DEVELOPMENT-BLUEPRINT.md` (versi upload, 24 bagian) sebagai **acuan Blueprint aktif**, menggantikan versi Session 3. Dokumen governance lain akan diperbarui satu per satu di sesi-sesi berikutnya.

## Session 6 — 2026-07-27
**Peran:** Staff Software Engineer
**Output:** `TASK-TEMPLATE.md` dibuat — template reusable untuk 9 jenis task development (New Feature, New Module, Bug Fix, Enhancement, Refactoring, Performance, Security, Testing, Deployment), lengkap dengan panduan pengisian per task type.

## Session 7 — 2026-07-27
**Peran:** Technical Project Manager
**Output:** `CURRENT-PROJECT-STATE.md` dibuat — living document status proyek, mencatat bahwa implementasi kode 0% (seluruh bagian "Existing ..." berstatus "Belum dibuat"), dengan rekomendasi modul berikutnya (Sprint S0).

## Session 8 — 2026-07-27
**Peran:** Release Manager
**Output:** `CHANGELOG.md` (dokumen ini) dibuat — versi awal `0.1.0` "Initial Development", mencatat seluruh dokumen yang dihasilkan Session 1–7 sebagai rilis pertama proyek (rilis dokumentasi, bukan rilis kode).

## Session 9 — 2026-07-27
**Peran:** Principal Software Architect / Release Manager
**Output:** `architecture-decision-records.md` dibuat (25 ADR, `ADR-001`–`ADR-025`), termasuk penguncian `ADR-001` (Backend Architecture: Next.js Route Handlers, tanpa service Node terpisah) berstatus **Approved** hasil sesi Architecture Review Board. `decision-log.md` disinkronkan dengan entry baru `ADR-038` merujuk balik ke `ADR-001` tsb. `CHANGELOG.md` dirilis sebagai `0.1.1` mencatat kedua perubahan ini dan menandai **Known Issue #1** sebagai `RESOLVED (0.1.1)`.

## Session 10 — 2026-07-28
**Peran:** Architecture Review Board (CTO, Principal Software Architect, Enterprise Solution Architect, Senior Backend Architect, Senior Frontend Architect, Cloud Architect, DevOps Architect, Database Architect, Security Architect, AI Development Architect, Technical Lead)
**Output:** Sesi Architecture Review Board 10-tahap menyelesaikan `ADR-005` (Search Strategy) berstatus **Approved** — PostgreSQL Full-Text Search + `pg_trgm` sebagai mesin pencari Fase 1, migrasi terjadwal ke Typesense Fase 2 berdasarkan kriteria ambang eksplisit. `decision-log.md` disinkronkan dengan entry baru `ADR-039` merujuk balik ke `ADR-005` tsb. Sinkronisasi berantai dieksekusi ke seluruh dokumen turunan: `technology-decisions.md` (v1.1→v1.2), `SYSTEM-ARCHITECTURE.md` (v1.1→v1.2), `dependency-manifest.md` (v1.1→v1.2), `PROJECT-CONSTITUTION.md` (v1.2→v1.3), `AI-DEVELOPMENT-BLUEPRINT.md`/`development-playbook.md` (v1.1→v1.2), dan `CURRENT-PROJECT-STATE.md` (snapshot governance). `CHANGELOG.md` dirilis sebagai `0.1.2` mencatat seluruh perubahan ini dan menandai bagian Search Engine pada **Known Issue #5** sebagai `RESOLVED (0.1.2)`.

## Session 11 — 2026-07-29
**Peran:** Architecture Review Board (CTO, Principal Software Architect, Enterprise Solution Architect, Senior Backend Architect, Senior Frontend Architect, Cloud Architect, DevOps Architect, Database Architect, Security Architect, AI Development Architect, Technical Lead)
**Output:** Sesi Architecture Review Board 10-tahap menyelesaikan `ADR-006` (Job Queue Strategy) berstatus **Approved** — Vercel Cron Jobs + Postgres Trigger/Database Webhook sebagai mekanisme job asinkron/terjadwal Fase 1, migrasi terjadwal ke QStash Fase 2 berdasarkan kriteria ambang eksplisit; BullMQ+Redis ditolak karena worker long-running-nya tidak kompatibel dengan model serverless ADR-001. `decision-log.md` disinkronkan dengan entry baru `ADR-040` merujuk balik ke `ADR-006` tsb. Sinkronisasi berantai dieksekusi ke seluruh dokumen turunan: `technology-decisions.md` (v1.2→v1.3), `SYSTEM-ARCHITECTURE.md` (v1.2→v1.3), `dependency-manifest.md` (v1.2→v1.3), `PROJECT-CONSTITUTION.md` (v1.3→v1.4), `development-playbook.md` (v1.2→v1.3), dan `CURRENT-PROJECT-STATE.md` (snapshot governance). `CHANGELOG.md` dirilis sebagai `0.1.3` mencatat seluruh perubahan ini dan menandai bagian Job Queue pada **Known Issue #5** sebagai `RESOLVED (0.1.3)` — isu #5 kini sepenuhnya resolved.

## Session 12 — 2026-07-30
**Peran:** CTO / Enterprise Software Architect / Solution Architect / GIS Architect / Senior Next.js Engineer / Senior Supabase Engineer / Architecture Review Board
**Output:** Sesi Architecture Review lanjutan mengevaluasi ulang `ADR-008` (Maps Provider) — sebelumnya tercatat *Approved* dengan caveat internal (`ADR-028`, menunggu konfirmasi biaya bisnis, secara efektif setara Open). Prioritas proyek direvisi ke tiga kriteria dominan (budget-friendly, adopsi komunitas developer Indonesia, Bolt-friendliness), menghasilkan keputusan final berstatus **Approved (direvisi v3)**: Leaflet + OpenStreetMap (rendering) dengan LocationIQ sebagai Primary Geocoding Provider dan Geoapify sebagai Approved Alternative Provider, dilengkapi caching Postgres (`geocode_cache`), rate limiting scoped, offline/manual address fallback 3 lapis, dan roadmap migrasi bertahap MVP→Growth→Scale→Enterprise. `decision-log.md` disinkronkan dengan entry baru `ADR-041` (merujuk balik ke `ADR-008` tsb, mencantumkan **Replaces: `ADR-028`**); `ADR-028` diubah status menjadi `Replaced` tanpa mengedit isi aslinya. Sinkronisasi berantai dieksekusi ke seluruh dokumen turunan: `technology-decisions.md` (v1.3→v1.4), `SYSTEM-ARCHITECTURE.md` (v1.3→v1.4), `dependency-manifest.md` (v1.3→v1.4), `PROJECT-CONSTITUTION.md` (v1.4→v1.5), `development-playbook.md` (v1.3→v1.4), dan `CURRENT-PROJECT-STATE.md` (snapshot governance). `CHANGELOG.md` dirilis sebagai `0.1.4` mencatat seluruh perubahan ini dan menandai **Known Issue #4** sebagai `RESOLVED (0.1.4)`.

## Session 13 — 2026-07-31
**Peran:** CTO / Enterprise Software Architect / Principal Software Architect / Enterprise Solution Architect / Senior Backend Architect / Database Architect / Security Architect / Technical Lead / Architecture Review Board
**Output:** Sesi Architecture Review Board 10-tahap menyelesaikan `ADR-018` (Caching Strategy) — sebelumnya digantung pada hasil `ADR-006` (Job Queue), yang final tanpa Redis sehingga `ADR-018` dievaluasi independen — menghasilkan keputusan **Approved**: rate limiting & application-level cache Fase 1 native di atas Supabase Postgres (tabel `rate_limit_log`, pola sliding window), tanpa infrastruktur cache/in-memory-store baru, dengan migrasi terjadwal ke Upstash Redis di Fase 2 berdasarkan kriteria ambang eksplisit. **Ini adalah ADR terakhir yang tersisa — 25 dari 25 ADR proyek kini Approved.** `decision-log.md` disinkronkan dengan entry baru `ADR-042` merujuk balik ke `ADR-018` tsb. Sinkronisasi berantai dieksekusi ke seluruh dokumen turunan: `technology-decisions.md` (v1.4→v1.5), `SYSTEM-ARCHITECTURE.md` (v1.4→v1.5), `dependency-manifest.md` (v1.4→v1.5), `PROJECT-CONSTITUTION.md` (v1.5→v1.6), `development-playbook.md` (v1.4→v1.5), dan `CURRENT-PROJECT-STATE.md` (snapshot governance). `CHANGELOG.md` dirilis sebagai `0.1.5` mencatat seluruh perubahan ini.

## Session 14 — 2026-08-03
**Peran:** Architecture Review Board (CTO, Principal Software Architect, Enterprise Solution Architect, Senior Backend Architect, Senior Frontend Architect, Database Architect, Security Architect, AI Development Architect, Technical Lead)
**Input:** `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md` — proposal jembatan berisi draft ADR-026/027/028 lengkap (Context/Decision/Alternatives/Pros/Cons), diajukan Business Owner berdasarkan diskusi dengan ChatGPT dan Claude.
**Output:** Sesi Architecture Review Board memverifikasi kelengkapan draft (bukan menyusun dari nol — pola baru, lihat `architecture-decision-records.md` Governance Notes poin 5) dan mengesahkan **tiga ADR sekaligus dalam satu sesi**: `ADR-026` (Organization Model Strategy — **Approved With Notes**: entitas `organizations`/`organization_members`/`organization_invitations`), `ADR-027` (Organization-Scoped Authorization Strategy — **Approved**: lapisan otorisasi independen dari RBAC platform, ADR-024 tidak diubah), dan `ADR-028` (Third-Party AI Assistant Integration Strategy/BYOK — **Approved With Notes**: 4 provider free-tier terkurasi, riwayat tidak dipersist). Status `ADR-023` (Multi-Tenancy Strategy) direvisi (bukan diedit) untuk mencerminkan bahwa ADR-026 mengaktifkan grouping construct ringan, bukan multi-tenant klasik. `decision-log.md` disinkronkan dengan entry baru `ADR-043`/`ADR-044`/`ADR-045`, plus registrasi & resolusi `OD-14`/`OD-15` di §11 dalam siklus yang sama. Sinkronisasi berantai dieksekusi ke: `PROJECT-CONSTITUTION.md` (v1.6→v1.7), `technology-decisions.md` (v1.5→v1.6), `SYSTEM-ARCHITECTURE.md` (v1.5→v1.6), `dependency-manifest.md` (v1.5→v1.6, tanpa dependency baru), `development-playbook.md` (v1.5→v1.6), `CURRENT-PROJECT-STATE.md` (snapshot governance + Modul 12/13 ditambahkan berstatus "Governance Approved, kode belum eligible"). `CHANGELOG.md` dirilis sebagai **`0.2.0`** (MINOR bump — genuine scope addition pertama, bukan PATCH seperti lima siklus sebelumnya, lihat argumen proposal Bagian 14). **Cakupan eksplisit dibatasi**: `PRD.md`/`ERD-Skema-Database.md`/`API-Specification.md`/`User-Flow.md`/`SEO-Analytics-Specification.md` **tidak** disentuh pada sesi ini — dijadwalkan paket terpisah. **Catatan tambahan (di luar permintaan siklus, ditemukan & diperbaiki karena menyentuh file yang sama):** regresi status `ADR-005`/`ADR-006` di `architecture-decision-records.md` (ter-*revert* keliru menjadi OPEN pada revisi 30 Juli 2026) dipulihkan bersamaan, berdasarkan audit riwayat versi dan konfirmasi silang dokumen turunan.

## Session 15 — 2026-08-05
**Peran:** Software Configuration Manager / Principal Software Architect (audit konsolidasi)
**Input:** 9 file snapshot revisi `architecture-decision-records.md` (`__1_` s.d. `__9_`, 27 Jul–4 Ags 2026).
**Output:** Audit konfigurasi kata-per-kata menemukan bahwa perbaikan regresi `ADR-005`/`ADR-006` yang diklaim tuntas pada Session 14 (`0.2.0`, 3 Agustus) **ternyata hanya menyentuh narasi ringkasan** (Bagian 5/6/7/8, Governance Notes) — entri sumber otoritatif Bagian 4 tidak ikut diperbaiki, tetap berisi teks draf 27 Juli 2026 selama ±6 hari tanpa disadari. 9 file snapshot dikonsolidasi menjadi 1 file master `architecture-decision-records-v1.1.md` (v1.0→**v1.1**, status Draft→**Baseline** disinkronkan penuh di field internal), dengan entri Bagian 4 `ADR-005`/`ADR-006` dipulihkan penuh dari sumber terverifikasi. Ditambahkan Bagian 1A (Revision History), baris `Cross-reference` ke `ADR-001`/`005`/`006`/`008`/`018`, dan pembaruan redaksional field `Dependencies` `ADR-001`/`006`. **Impact Analysis mengonfirmasi**: karena 9 dokumen turunan lain (`technology-decisions.md`, `PROJECT-CONSTITUTION.md`, `SYSTEM-ARCHITECTURE.md`, `dependency-manifest.md`, `development-playbook.md`, `decision-log.md`, `CURRENT-PROJECT-STATE.md`, `project-manifest.md`) tidak pernah ikut ter-regresi dan tetap konsisten mencatat ADR-005/006 sebagai Approved, **tidak ada satu pun yang memerlukan revisi konten** — hanya `CHANGELOG.md` (dokumen ini), `project-manifest.md`, dan `document-governance-baseline-register.md` yang diperbarui, murni untuk mencerminkan metadata versi baru `architecture-decision-records.md`. `CHANGELOG.md` dirilis sebagai **`0.2.2`** (PATCH — perbaikan integritas dokumentasi, bukan keputusan arsitektur baru).

## Session 16 — 2026-08-05
**Peran:** Engineering Alignment Cycle (Enterprise Software Architect / Principal Solution Architect / Enterprise Architecture Governance Consultant / Domain-Driven Design Specialist / Database Architect / Security Architect / API Architect / Technical Architect / Software Engineering Manager / Engineering Process Designer / Technical Writer)
**Input:** `Engineering-Alignment-Framework-v1.0.md` (standar proses mengikat, Bab 10/12/16-21/23/24/28/30.3/31) sebagai acuan wajib; eksekusi paket sinkronisasi Modul 12/13 untuk PRD/ERD/API Spec/User Flow yang secara sadar ditunda di Session 14 (lihat catatan cakupan `0.2.0`) dan masih tercatat "belum dieksekusi" di Session 15.
**Output:** Retrofit skema ID EAF (`REQ-`/`ENT-`/`PERM-`) dieksekusi penuh mengikuti EAF Bab 10 (Identification → Drafting → Cross-Reference Mapping → Consistency Validation → Review → Approval → Baseline), urutan dokumen sesuai Bab 12.2 (PRD → Entity Mapping → ERD → User Flow → Database Schema → API Spec → Role Matrix → Permission Matrix). Hasil:
- `PRD-RUMAHAGEN.md` **1.1→1.2** (MINOR) — 114 `REQ-XXX` diregistrasi (83 retrofit 11 modul existing + 31 baru), **Modul 12 (Organization Management System)** dan **Modul 13 (AI Assistant Integration/BYOK)** ditambahkan penuh berdasarkan `ADR-026`/`027`/`028` (=`ADR-043`/`044`/`045`) — menuntaskan cakupan yang ditunda Session 14.
- `Entity-Mapping-RUMAHAGEN.md` **dibuat baru (v1.0, Draft)** — dokumen yang sebelumnya belum pernah ada di proyek ini (lihat `document-governance-baseline-register.md` Governance Notes poin 3); 44 `ENT-XXX` diregistrasi lintas 13 modul, termasuk identifikasi 2 *shared kernel* (entity wilayah, `Certificate`).
- `ERD-Skema-Database-RUMAHAGEN.md` **1.2→1.3** (MINOR) — disinkronkan penuh ke Entity Mapping v1.0 (setiap tabel kini bertag `ENT-XXX`), 5 tabel baru M12/M13, `listings`/`audit_logs` diperluas aditif. **Database Schema (fisik) digabung ke Bagian 2A dokumen ini** (bukan file terpisah) — keputusan eksplisit Owner, menutup baris "Database Schema" yang sejak Session awal tercatat sebagai dokumen belum ditemukan (`document-governance-baseline-register.md` Governance Notes poin 3).
- `User-Flow-RUMAHAGEN.md` **1.1→1.2** (MINOR) — retrofit `REQ-XXX` traceability di seluruh modul existing + 5 diagram alur baru Modul 12/13.
- `API-Specification-RUMAHAGEN.md` **1.1→1.2** (MINOR) — 19 endpoint baru Modul 12/13 (Bagian 5A/5B) dengan `REQ-XXX`+`ENT-XXX` eksplisit per endpoint; **sekaligus mengoreksi 2 gap sinkronisasi lama** yang sudah dicatat sejak `document-governance-baseline-register.md` Governance Notes poin 11 & Session 12 tapi belum dieksekusi: Bagian 9.1 (masih "Google Maps Platform/Mapbox") disinkronkan ke `ADR-008` v2 Approved (Leaflet+OSM+LocationIQ+Geoapify); Bagian 3 (rekomendasi generik "Typesense/Elasticsearch") disinkronkan ke `ADR-005` Approved (Postgres FTS+pg_trgm Fase 1).
- `Authorization-Access-Control-Specification.md` **dibuat baru (v1.0, Draft)** — menggabungkan Role Matrix (7 role final, resolusi `OD-02`) dan Permission Matrix (113 `PERM-XXX`, mencakup 44/44 entity Entity Mapping v1.0) menjadi satu file, sesuai keputusan Owner.

**0 EAI-XXX diregistrasi** pada siklus ini — seluruh gap yang ditemukan terselesaikan via keputusan eksplisit Owner (cakupan Modul 12/13) atau sinkronisasi langsung ke ADR yang sudah Approved (bukan konflik dua keputusan yang bersaing, syarat EAI per EAF Bab 24.3). Gap non-blocking dicatat untuk siklus berikutnya (bukan diasumsikan selesai): BR-XXX (Business Rule ID) belum diregistrasi di PRD; API Specification belum punya ID endpoint formal (`API-XXX`), Permission Matrix saat ini merujuk endpoint via `METHOD /path`. `document-governance-baseline-register.md` dan `project-manifest.md` disinkronkan pada siklus yang sama (baris Bagian 10, status dokumen baru). `CHANGELOG.md` dirilis sebagai **`0.3.0`** (MINOR — genuine scope completion, menuntaskan paket yang dijadwalkan terpisah sejak Session 14, bukan PATCH seperti Session 15).

## Session 17 — 2026-08-05
**Peran:** Engineering Alignment Cycle — lanjutan (Senior Business Analyst / Product Manager / UI-UX Design Lead / Principal Software Architect / Technical Writer)
**Input:** `foundation-validation-report.md` Bagian 16-18 — 3 dokumen berstatus **Not Ready**/`Planned` sejak awal proyek (Functional Specification, UI Specification, Technical Specification), kini seluruh blocker-nya (Open Decision teknis, versi PRD/ERD/API Spec Modul 12/13) sudah terselesaikan di Session 16.
**Output:** Ketiga dokumen dibuat **baru** mengikuti urutan wajib `foundation-validation-report.md` Bagian 16 langkah 6-8:
- `Functional-Specification-RUMAHAGEN.md` **dibuat baru (v1.0, Draft)** — 43 layar terdaftar (Screen Inventory master) lintas 12 modul (Modul 11/SEO tanpa layar khusus, by design), 2 layar mendapat spesifikasi field-per-field presisi penuh (Form Listing multi-step 6-tahap, Kalkulator DBR) sesuai rekomendasi prioritas `executive-architecture-review.md`. 105/114 REQ-XXX tercakup (9 sisanya milik Modul 11 tanpa layar). Disintesis dari PRD v1.2 + User Flow v1.2 + API Spec v1.2 — **tidak mengubah** requirement/alur yang sudah final, murni terjemahan level-layar.
- `UI-Specification-RUMAHAGEN.md` **dibuat baru (v1.0, Draft)** — sistem token desain (palet & tipografi dengan rasional spesifik, menghindari default AI generik), 6 Layout Template reusable, 19 komponen komposit kustom mengikuti konvensi `development-playbook.md` §8, wireframe ASCII detail untuk 2 layar prioritas + Dashboard Agen, seluruh 43/43 layar Functional Spec v1.0 terpetakan ke template. **Tidak mengganti** library yang sudah final (shadcn/ui, Tailwind, React Hook Form+Zod, Zustand/TanStack Query, `ADR-021`) — murni token & konvensi di atasnya.
- `Technical-Specification-RUMAHAGEN.md` **dibuat baru (v1.0, Draft)** — konsolidasi `SYSTEM-ARCHITECTURE.md` + `technology-decisions.md` + API Spec v1.2 + ERD v1.3 + Entity Mapping v1.0 + Authorization Spec v1.0 menjadi satu Technical Brief per 13 modul, plus Cross-Cutting Concerns tersentralisasi (auth, RBAC 2-lapis, rate limiting, job queue, enkripsi, maps/search) agar tidak diulang per modul. **Temuan penting**: `SYSTEM-ARCHITECTURE.md` §5.12-5.13 sebelumnya menandai kode Modul 12/13 "belum boleh ditulis" sampai paket sinkronisasi dieksekusi (`PROJECT-CONSTITUTION.md` §24 poin 10) — dicatat eksplisit di dokumen ini bahwa blocker tersebut **kini resolved** (Session 16), Modul 12/13 **eligible untuk implementasi**.

Dengan ketiga dokumen ini, seluruh gap `foundation-validation-report.md` §17-18 ("Functional Specification: Not Ready", "UI Specification: Not Ready", "Technical Specification: Ready with Notes") **tertutup**. Sesuai `foundation-validation-report.md` Bagian 16 langkah 9, **Module Planning** kini dapat dimulai penuh tanpa blocker dokumentasi apa pun. `document-governance-baseline-register.md` dan `project-manifest.md` disinkronkan pada siklus yang sama. `CHANGELOG.md` dirilis sebagai **`0.4.0`** (MINOR — 3 dokumen baru, genuine scope completion, bukan resolusi ADR).

## Session 18 — 2026-08-05
**Peran:** Software Configuration Manager (eksekusi perintah Owner)
**Input:** Perintah eksplisit Owner (Mujtahid Aktanto): "pengesahan status baseline jalankan" — menindaklanjuti 5 dokumen Draft dari Session 17.
**Output:** Sebelum eksekusi, dicek syarat `document-governance-baseline-register.md` Bagian 9 poin 1 (dependency harus sudah Baseline). Ditemukan 3 dokumen dari Session 16 (`ERD-Skema-Database.md` v1.3, `User-Flow.md` v1.2, `API-Specification.md` v1.2) masih berstatus **Approved (kandidat Baseline)** — menjadi dependency langsung sebagian dari 5 dokumen Session 17. **Interpretasi yang diambil** (dicatat eksplisit): cakupan promosi diperluas ke **8 dokumen** (5 Draft + 3 kandidat Baseline) agar rantai dependency terpenuhi bersih, bukan promosi parsial yang menyisakan gap. Owner tidak membatalkan interpretasi ini saat instruksi diberikan.

**8 dokumen naik status ke Baseline** secara bersamaan (field Status internal tiap file **dan** baris Bagian 10 `document-governance-baseline-register.md` disinkronkan penuh — bukan hanya salah satu, konsisten pola Session 15/poin 15):
- `Entity-Mapping-RUMAHAGEN-v1.0.md` (Draft→Baseline)
- `ERD-Skema-Database-RUMAHAGEN-v1.3.md` (Approved→Baseline)
- `API-Specification-RUMAHAGEN-v1.2.md` (Approved→Baseline)
- `User-Flow-RUMAHAGEN-v1.2.md` (Approved→Baseline)
- `Authorization-Access-Control-Specification-v1.0.md` (Draft→Baseline)
- `Functional-Specification-RUMAHAGEN-v1.0.md` (Draft→Baseline)
- `UI-Specification-RUMAHAGEN-v1.0.md` (Draft→Baseline)
- `Technical-Specification-RUMAHAGEN-v1.0.md` (Draft→Baseline)

Versi lama (PRD v1.1, ERD v1.2, User Flow v1.1, API Spec v1.1) **tetap Deprecated** — tidak terpengaruh promosi ini. Dengan siklus ini, **seluruh 24 dokumen di `document-governance-baseline-register.md` Bagian 10 kini tidak ada satu pun berstatus Draft** — sisa 2 baris non-final (`Database Schema fisik`, sudah menyatu ke ERD; `Executive Architecture Review`, file belum ditemukan sejak awal proyek) bersifat struktural, bukan menunggu approval. `document-governance-baseline-register.md` naik **v1.3→v1.4** (Governance Notes poin 18), `project-manifest.md` disinkronkan pada siklus yang sama. `CHANGELOG.md` dirilis sebagai **`0.4.1`** (PATCH — perubahan status governance atas dokumen yang sudah ada isinya, bukan penambahan/perubahan cakupan sistem).

---

*Dokumen ini adalah log perubahan resmi proyek, wajib dipelihara sepanjang siklus hidup proyek. Setiap sesi development — baik menghasilkan dokumen governance, kode, maupun perbaikan — wajib menambahkan entri baru di sini sebelum sesi ditutup. Tidak ada entri yang boleh dihapus atau ditulis ulang; koreksi selalu berupa entri baru.*
