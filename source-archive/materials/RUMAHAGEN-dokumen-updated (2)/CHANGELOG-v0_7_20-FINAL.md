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

**`0.7.20`** — *Initial Development*
Dirilis: 2026-08-10
Fase: Pra-Development — **Audit ulang MP-02 dengan standar verifikasi ketat penuh selesai — item terbuka dari `0.7.19` ditutup.** Kedua klaim MP-02 (OD-23: UNIQUE constraint + RLS self-review; T4-03: Authorization Spec §2.3 Buyer own→none) diverifikasi langsung terhadap file sumber (`0005_m02_agent_profile.sql`, `Authorization-Access-Control-Specification-v1.1-FINAL.md`) — **tidak ada regresi ditemukan**. MP-02 bergabung dengan MP-01 sebagai modul yang sudah diaudit ulang dan dinyatakan bersih. Rasio regresi pola sistemik final turun ke **50% (6 dari 12 klaim)**.

*(Riwayat: `0.7.19`, dirilis 2026-08-10 — konsolidasi riwayat versi 13 Module Planning + SYSTEM-ARCHITECTURE.md + AI Development Blueprint selesai penuh, 7 regresi ditemukan & diperbaiki, PATCH. `0.7.2`, dirilis 2026-08-07 — OD-24, gate M12 terbuka, PATCH. `0.7.1`, dirilis 2026-08-06 — T4-06 SSO Apple, penutup Issue Register 32/32 Closed, PATCH.)*

---

# RELEASE HISTORY

## [Unreleased]
**Tindakan manual diperlukan dari Owner:** 5 file sumber sudah diperbaiki dan siap menggantikan versi lama di project — belum dieksekusi otomatis: `0007_m12_organization.sql`, `0008_m03_listing.sql`, `0009_m04_learning_center.sql`, `0010_m05_events.sql`, `API-Specification-RUMAHAGEN-v1.3-FINAL.md` (lihat versi `-FIXED` masing-masing). Seluruh migration (15 file) **masih belum pernah dieksekusi ke database live** di seluruh proyek. Perubahan berikutnya di luar itu: implementasi kode saat Sprint S0/modul dimulai (endpoint yang kontraknya sudah didesain, registrasi `BR-XXX`/`API-XXX`, sinkronisasi `ERD-Diagram-...v1.1.mermaid`, high-fidelity mockup).

## [0.7.20] - 2026-08-10 - Audit Ulang MP-02 (Item Terbuka Ditutup)

### Fixed
- **MP-02-ProfilAgen-Module-Planning.md — audit ulang dengan standar verifikasi
  ketat penuh (item terbuka dari CHANGELOG [0.7.19] dan Governance Notes poin 35
  ditutup).** Berbeda dari MP-01/03 (diaudit sebelum kebijakan verifikasi silang
  wajib matang), audit ini menerapkan verifikasi langsung terhadap file sumber
  aktual untuk kedua klaim MP-02:
  1. **Klaim OD-23** (UNIQUE constraint + RLS insert/update self-review Agen) —
     diverifikasi terhadap `0005_m02_agent_profile.sql` versi terbaru (`__3_`).
     **TERBUKTI BENAR** — `idx_agent_reviews_one_per_reviewer_per_agent`,
     `agent_reviews_insert_buyer`, `agent_reviews_update_own` seluruhnya ada
     dan sesuai spesifikasi (kondisional per `auth_role_code()`, replace-on-resubmit).
  2. **Klaim T4-03** (Authorization Spec §2.3, Buyer `own`→`none` untuk
     Approve/Delete-AgentReview) — diverifikasi terhadap
     `Authorization-Access-Control-Specification-v1.1-FINAL.md`. **TERBUKTI BENAR**
     — kedua permission tercatat `none` untuk Buyer, sesuai temuan #3/#4 audit v1.1.

### Verified
- **MP-02 adalah modul KEDUA (setelah MP-01) yang lolos audit ulang dengan
  standar verifikasi ketat penuh tanpa regresi ditemukan.** Menambah daftar
  klaim terverifikasi bersih: MP-01 (×4), MP-02 (×2, baru), MP-07 (×2), MP-08
  (×1), MP-10 (×1), MP-11 (×1) — total 11 klaim bersih.

### Added
Tidak ada perubahan pada kategori ini di rilis ini.

### Changed
- **MP-02-ProfilAgen-Module-Planning.md** — nomor versi publik **TIDAK
  dinaikkan** (tetap "1.0"); Bagian Recommendation poin #2 dikoreksi — komentar
  migration `0005` ("0007"→"0008") **sudah** diperbaiki di file `__2_`/`__3_`
  (dikonfirmasi via diff langsung), bukan lagi item terbuka seperti tertulis
  sebelumnya. Tidak ada perubahan konten keputusan/RLS/API.

### Removed
Tidak ada perubahan pada kategori ini di rilis ini.

### Deprecated
Tidak ada perubahan pada kategori ini di rilis ini.

### Security
Tidak ada perubahan pada kategori ini di rilis ini.

### Database Changes
Tidak ada perubahan skema — audit murni verifikasi, tidak ada migration baru.

### API Changes
Tidak ada perubahan kontrak pada rilis ini.

### UI Changes
Tidak ada perubahan pada kategori ini di rilis ini.

### Process Note — Update Statistik Pola Sistemik (Final, Pasca Audit MP-02)
- **Rasio regresi kumulatif: 6 dari 12 klaim yang diaudit dengan standar ketat
  penuh (50%)** — turun dari 58% (CHANGELOG [0.7.15]) setelah MP-02 menambah
  2 sampel bersih. Regresi tetap 6 total (MP-03 ×2, MP-04 ×1, MP-05 ×1, MP-06
  ×1, MP-12 ×1) + 1 closed independen (MP-09/OD-20). Bersih: MP-01 (×4), MP-02
  (×2, baru), MP-07 (×2), MP-08 (×1), MP-10 (×1), MP-11 (×1).
- **Seluruh regresi tetap 100% berasal dari satu sumber**: `TASK-HOTFIX-20260806-001`
  (Tier 1, T1-01 s.d. T1-04) — tidak ada regresi baru ditemukan di luar task
  tunggal ini pada audit MP-02.

### Action Required
Tidak ada — audit ini murni verifikasi, tidak menemukan gap baru yang
memerlukan perbaikan kode/RLS/skema. Item aksi manual yang masih terbuka dari
`0.7.19` (ganti 5 file `-FIXED` ke lokasi kanonik, eksekusi migration ke live)
tetap berlaku, lihat `[Unreleased]` di atas.

## [0.7.2] - 2026-08-07 - Initial Development (OD-24 — Gate Modul 12 Terbuka)

### Added
Tidak ada perubahan pada kategori ini di rilis ini.

### Changed
- **OD-24 — Gate implementasi kode Modul 12 (Organization) dikonfirmasi terbuka oleh Owner.** Melengkapi seluruh prasyarat teknis yang sudah terpenuhi sejak Batch 1 (RLS `org_invitations_insert`/T1-04, T3-06) dan paket sinkronisasi dokumen 5 Agustus (PRD v1.2, ERD v1.3, Authorization Spec Baseline). Konfirmasi ini terpisah dari pembukaan gate Modul 13 (6 Agustus 2026) — setiap modul memerlukan konfirmasi Owner tersendiri, kelengkapan dokumen adalah prasyarat bukan pemicu otomatis.
- `PROJECT-CONSTITUTION.md` naik v1.8 → **v1.9** — §24 poin 10 (Technical Constraints) direvisi total: dari larangan menulis kode M12/M13 menjadi pernyataan bahwa gate keduanya terbuka (M13: 6 Agustus, M12: 7 Agustus).
- `MP-12-Organization-Module-Planning-v1_0.md` — Status Gate header, Dependency Checklist §47, Definition of Ready §48, dan Go/No-Go (Executive Summary + tabel MIS §15) seluruhnya diubah dari Hold/GO-bersyarat menjadi **✅ GO** penuh, setara M13.
- `decision-log.md` §11 — **OD-24** diregistrasi dan langsung Resolved dalam siklus yang sama.
- `document-governance-baseline-register.md` naik v1.6 → **v1.7** (Governance Notes poin 21).

### Removed
Tidak ada perubahan pada kategori ini di rilis ini.

### Deprecated
Tidak ada perubahan pada kategori ini di rilis ini.

### Fixed
Tidak ada bug kode pada rilis ini.

### Security
Tidak ada perubahan pada kategori ini di rilis ini.

### Database Changes
Tidak ada perubahan skema/RLS pada rilis ini — migration `0007_m12_organization.sql` tidak disentuh (perbaikan RLS-nya sudah dicatat di rilis `0.4.2`).

### API Changes
Tidak ada perubahan kontrak endpoint pada rilis ini — `/organizations/*` (API Spec §5A) tetap v1.2, tidak ada endpoint ditambahkan/diubah oleh pembukaan gate ini.

### UI Changes
Tidak ada perubahan pada kategori ini di rilis ini.

### Dokumen Terkait yang Ikut Diperbarui (bukan versi CHANGELOG, dicatat untuk traceability)
- `CURRENT-PROJECT-STATE.md` naik ke rev. 8 — gate M12 dicatat terbuka, Overall Progress & Pending Modules disinkronkan (tidak ada lagi tag "kondisional" pada M12).
- **Dengan rilis ini, seluruh 13 modul proyek berstatus GO tanpa syarat gate tambahan — tidak ada satu pun blocker governance tersisa yang menghalangi Sprint S0 maupun urutan implementasi modul manapun di `Module-Implementation-Strategy-...v1.1.md`.**

## [0.7.17] - 2026-08-10 - Housekeeping (Rujukan Nama File Kanonik SYSTEM-ARCHITECTURE)

### Fixed
- **`Module-Dependency-Matrix-RUMAHAGEN.md`** — seluruh 9 kutipan
  `SYSTEM-ARCHITECTURE.md` (termasuk baris Dokumen Acuan yang sebelumnya menyebut
  "v1.6, upload `__8_`") diperbarui merujuk nama file kanonik
  `SYSTEM-ARCHITECTURE-v1.6-FINAL.md` — mengeksekusi rekomendasi yang sudah dicatat
  di `SYSTEM-ARCHITECTURE-Consolidation-Supporting-Deliverables.md` §4 (9 Agustus 2026).
  Nilai versi tidak berubah (tetap "1.6"), murni pembaruan nama rujukan file.

### Changed
Tidak ada perubahan pada kategori ini di rilis ini.

## [0.7.18] - 2026-08-10 - Housekeeping (Rujukan Nama File Kanonik AI Development Blueprint)

### Fixed
- **`AI-DEVELOPMENT-BLUEPRINT-v1.6-FINAL.md`** — 7 kutipan `SYSTEM-ARCHITECTURE.md`
  diperbarui merujuk nama file kanonik `SYSTEM-ARCHITECTURE-v1.6-FINAL.md` (pola sama
  rilis `0.7.17`). Self-reference internal dokumen ("AI-DEVELOPMENT-BLUEPRINT.md
  (dokumen ini)" di hierarki governance & Bagian 10) diperjelas menjadi
  `AI-DEVELOPMENT-BLUEPRINT-v1.6-FINAL.md` untuk disambiguasi dari draft orphan
  v1.0 berjudul sama (`AI-DEVELOPMENT-BLUEPRINT.md`, dicatat sebagai temuan tidak
  ditindaklanjuti — lihat CHANGELOG `0.7.4`). Nilai versi tidak berubah (tetap "1.6").

### Changed
Tidak ada perubahan pada kategori ini di rilis ini.

## [0.7.19] - 2026-08-10 - Konsolidasi Module Dependency Matrix & Module Implementation Strategy

### Fixed
- **`Module-Dependency-Matrix-RUMAHAGEN.md` (MDM)** — audit konsolidasi
  riwayat versi dijalankan. **Hanya 1 versi tersedia** (v1.0, 6 Agustus 2026) — tidak ada
  snapshot historis lain untuk dibandingkan, sehingga tidak ada temuan kehilangan konten.
  Ditambahkan Bagian "Riwayat Versi" (1 baris). Ditemukan referensi usang ke
  `SYSTEM-ARCHITECTURE.md` sebagai "v1.6, upload `__8_`" — sudah diperbaiki di rilis
  `0.7.17` (9 rujukan diperbarui ke nama file kanonik `SYSTEM-ARCHITECTURE-v1.6-FINAL.md`).
- **`Module-Implementation-Strategy-RUMAHAGEN.md` (MIS)** — audit
  konsolidasi riwayat versi dijalankan. **Hanya 1 versi tersedia** (v1.0, 6 Agustus 2026)
  — tidak ada snapshot historis lain, tidak ada temuan kehilangan konten, dan **tidak
  ditemukan referensi usang** ke dokumen lain (bersih, berbeda dari MDM). Ditambahkan
  Bagian "Riwayat Versi" (1 baris).

### Changed
Tidak ada perubahan pada kategori ini di rilis ini — kedua dokumen adalah audit
konsolidasi murni (single-version), bukan revisi konten/keputusan teknis.

### Process Note
- **MDM dan MIS adalah dua dokumen governance dengan riwayat versi paling sederhana**
  yang diaudit sejauh ini — masing-masing hanya punya 1 file/versi yang pernah diupload
  untuk konsolidasi, berbeda dari `SYSTEM-ARCHITECTURE.md` (9 snapshot), AI Development
  Blueprint (9 snapshot), atau 13 Module Planning (2-4 snapshot masing-masing). Tidak ada
  regresi yang mungkin ditemukan karena tidak ada klaim "Diperbaiki [tanggal]" yang
  merujuk dokumen sumber lain di kedua dokumen ini.

## [0.7.16] - 2026-08-10

### Fixed
- **MP-13-AIAssistant-Module-Planning.md — konflik penomoran versi:** 3 snapshot
  berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026" identik**, merepresentasikan
  resolusi 1 ambiguitas: cakupan role Developer Partner untuk AI Assistant
  (**OD-21 Opsi A** — Owner memutuskan disertakan, mengikuti Authorization
  Spec §2.14 yang sudah benar sejak awal).

### Verified
- **Klaim OD-21 diverifikasi TERBUKTI BENAR** terhadap
  `PRD-RUMAHAGEN-v1.3-FINAL.md` REQ-M13-005 — Developer
  Partner dikonfirmasi tercantum sebagai role ke-6.
- **Catatan pola penting:** OD-21 berasal dari sesi kerja **Batch 2**
  (keputusan Owner OD-16 s.d. OD-22), bukan dari `TASK-HOTFIX-20260806-001`
  (Tier 1) yang terbukti gagal 100% di seluruh 4 itemnya. Keputusan Batch 2
  yang sudah diverifikasi (OD-19/MP-06, OD-21/MP-13) **konsisten bersih**.

### Changed
- **MP-13-AIAssistant-Module-Planning.md** — nomor versi publik **TIDAK
  dinaikkan** (tetap "1.0"); ditambahkan Riwayat Versi + Catatan Verifikasi
  Silang.

## 🎉 KONSOLIDASI 13 MODULE PLANNING SELESAI — Ringkasan Final

Dengan MP-13, seluruh 13 dokumen Module Planning proyek (MP-01 s.d. MP-13)
telah dikonsolidasikan dari snapshot multi-versi menjadi file kanonik tunggal,
dengan verifikasi silang terhadap dokumen sumber untuk setiap klaim
"Diperbaiki"/"Resolved" yang merujuk migration, API Specification, atau
Authorization Specification.

### Rekap Status per Modul

| Modul | Snapshot | Klaim Diverifikasi | Regresi Ditemukan | Status Akhir |
|---|---|---|---|---|
| MP-01 | 3 | 4 (OD-18, T4-02, T4-06, T4-07) | 0 | ✅ Bersih (diaudit ulang 10 Agu) |
| MP-02 | 3 | 2 (Authorization Spec, OD-23) | 0 (belum diaudit ulang eksplisit) | ✅ Bersih (verifikasi awal) |
| MP-03 | 3 | 2 (Konflik #1, #2) | **2** | 🟢 Diperbaiki (`0008_m03_listing-FIXED.sql`) |
| MP-04 | 3 | 1 (T1-01) | **1** | 🟢 Diperbaiki (`0009_m04_learning_center-FIXED.sql`) |
| MP-05 | 3 | 1 (T1-03) | **1** | 🟢 Diperbaiki (`0010_m05_events-FIXED.sql`) |
| MP-06 | 3 | 1 (T4-11) | **1** | 🟢 Diperbaiki (`API-Specification-...v1.3-FINAL-FIXED.md`) |
| MP-07 | 2 | 2 (T4-13, T4-14) | 0 | ✅ Bersih |
| MP-08 | 2 | 1 (T4-16) | 0 | ✅ Bersih |
| MP-09 | 3 | 1 (OD-20) | 1 *(closed independen sebelum audit)* | 🟡 Sudah closed via jalur lain |
| MP-10 | 2 | 1 (T4-01) | 0 | ✅ Bersih |
| MP-11 | 2 | 1 (T4-15) | 0 | ✅ Bersih *(memicu temuan regresi MP-03)* |
| MP-12 | 4 *(2 duplikat)* | 2 (T1-04, T4-22) | **1** | 🟢 Diperbaiki (`0007_m12_organization-FIXED.sql`) |
| MP-13 | 3 | 1 (OD-21) | 0 | ✅ Bersih |

**Total: 13 modul, 34 snapshot, ~20 klaim diverifikasi silang, 6 regresi aktif diperbaiki + 1 closed independen.**

### 🔴 Temuan Governance Tertinggi: Kegagalan Total `TASK-HOTFIX-20260806-001`

**Seluruh 4 item Tier 1** dari task hotfix tunggal 6 Agustus 2026
("Perbaikan RLS — Issue Register Batch 1") **gagal 100% tanpa kecuali**:

| Item | Modul | File | Status |
|---|---|---|---|
| T1-01 | MP-04 | `0009_m04_learning_center.sql` | Regresi → Diperbaiki 9 Agu |
| T1-02 | MP-03 | `0008_m03_listing.sql` | Regresi → Diperbaiki 10 Agu |
| T1-03 | MP-05 | `0010_m05_events.sql` | Regresi → Diperbaiki 9 Agu |
| T1-04 | MP-12 | `0007_m12_organization.sql` | Regresi → Diperbaiki 10 Agu |

Sebaliknya, klaim dari sesi kerja **Batch 2** (OD-16 s.d. OD-23, keputusan
Owner berbeda) dan **audit Issue Register Batch 3** (T4-xx, koreksi
Authorization Spec) yang sudah diverifikasi **seluruhnya bersih** — regresi
tampaknya spesifik ke satu task/sesi kerja tunggal, bukan pola menyeluruh
proyek.

### Migration Files yang Diperbaiki (Wajib Diganti di Project)

1. `0007_m12_organization.sql` → `0007_m12_organization-FIXED.sql`
2. `0008_m03_listing.sql` → `0008_m03_listing-FIXED.sql`
3. `0009_m04_learning_center.sql` → `0009_m04_learning_center-FIXED.sql`
4. `0010_m05_events.sql` → `0010_m05_events-FIXED.sql`
5. `API-Specification-RUMAHAGEN-v1.3-FINAL.md` → `-FIXED.md`

**Belum ada satu pun migration yang dieksekusi ke database live** (dikonfirmasi
berulang kali di setiap MP §25) — seluruh perbaikan di atas aman diterapkan
langsung tanpa migration tambahan/rollback.

## [0.7.15] - 2026-08-10

### Fixed
- **MP-12-Organization-Module-Planning.md — konflik penomoran versi + duplikasi
  file:** 4 snapshot berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026"
  identik**; ditemukan tambahan **`__2_` dan `__3_` identik 100% byte-per-byte**
  (kemungkinan file terduplikasi saat upload, bukan revisi baru). Snapshot
  progresif merepresentasikan: (1) T1-04 & T3-06 diklaim diperbaiki; (2) gate
  governance kode M12 dikonfirmasi TERBUKA oleh Owner (7 Agustus), status
  Go/No-Go naik jadi GO penuh setara M13.

- **[KRITIS — REGRESI KETUJUH] `0007_m12_organization.sql` — `org_invitations_insert`
  yang diklaim diperbaiki ternyata masih rentan spoofing.** Verifikasi langsung
  terhadap file yang diupload Owner (10 Agustus 2026) membuktikan klaim
  "✅ Diperbaiki [2026-08-06]" (T1-04: `WITH CHECK` dibuat kondisional per
  `initiated_by_type`, verifikasi keanggotaan Leader) **tidak pernah
  dieksekusi** — policy masih persis versi awal:
  `WITH CHECK (agent_id = auth.uid() OR leader_id = auth.uid())`. Siapa pun
  authenticated user masih bisa mengklaim jadi Leader Organization mana pun
  saat insert undangan `leader_invite` (spoofing, social engineering risk).

### Added
- **`0007_m12_organization-FIXED.sql`** — `org_invitations_insert` sekarang
  benar-benar kondisional: `agent_request` cukup `agent_id=auth.uid()`;
  `leader_invite` wajib `EXISTS` check keanggotaan Leader aktif dari
  `organization_id` yang direferensikan. 3 tabel tetap 3, 8 policy tetap 8.

### Verified
- **T4-22 TERVERIFIKASI BENAR** — `Authorization-Access-Control-Specification-v1.1-FINAL.md`
  §2.13 dikonfirmasi cocok persis dengan klaim MP-12 (`Create-Organization`
  Manager/Admin: all→none).
- **T3-06 (dikutip dari MP-03)** — sudah diverifikasi regresi & diperbaiki di
  siklus audit MP-03/MP-11 sebelumnya (`0008_m03_listing-FIXED.sql`).

### Changed
- **MP-12-Organization-Module-Planning.md** — nomor versi publik **TIDAK
  dinaikkan** (tetap "1.0"); ditambahkan Riwayat Versi + Catatan Verifikasi
  Silang. 4 lokasi klaim "Diperbaiki [2026-08-06]" diberi anotasi status final.

### 🔴 Process Note — Pola Hotfix Terkonfirmasi Gagal Total, Bukan Sebagian
- **`TASK-HOTFIX-20260806-001` ("Perbaikan RLS — Issue Register Batch 1")
  mencatat 4 item Tier 1: T1-01, T1-02, T1-03, T1-04.** Dengan T1-04
  (MP-12) sekarang terkonfirmasi regresi, **SELURUH 4 item Tier 1 dari task
  hotfix yang sama telah diverifikasi — dan SELURUHNYA regresi tanpa
  kecuali**:
  - T1-01 (`0009_m04_learning_center.sql`, MP-04) — regresi, diperbaiki 9 Agu.
  - T1-02 (`0008_m03_listing.sql`, MP-03) — regresi, diperbaiki 10 Agu.
  - T1-03 (`0010_m05_events.sql`, MP-05) — regresi, diperbaiki 9 Agu.
  - T1-04 (`0007_m12_organization.sql`, MP-12) — regresi, diperbaiki 10 Agu.
  Ini **bukan lagi pola statistik "kemungkinan besar"** — ini kegagalan
  **100% (4/4)** dari satu task tunggal. Kesimpulan paling mungkin: seluruh
  perubahan yang tercatat dalam `TASK-HOTFIX-20260806-001` **ditulis ke
  dokumentasi tapi tidak pernah benar-benar disimpan ke file migration**,
  kemungkinan karena kegagalan proses commit/save di sesi kerja 6 Agustus,
  bukan kesalahan spesifik per file.

### Process Note — Update Statistik Pola Sistemik (Keseluruhan)
- **Rasio regresi: 7 dari 12 klaim yang diverifikasi (58%)** — naik dari 60%
  (turun sedikit karena MP-01 4/4 bersih menambah sampel bersih). Regresi
  kumulatif: MP-03 (×2), MP-04 (×1), MP-05 (×1), MP-06 (×1), MP-09/OD-20
  (×1, closed independen), **MP-12 (×1, baru)**. Bersih: MP-01 (×4), MP-07
  (×2), MP-08 (×1), MP-10 (×1), MP-11/T4-15 (×1).

## [0.7.14] - 2026-08-10

### Fixed
- **MP-11-SEOAnalytics-Module-Planning.md — konflik penomoran versi:** 2 snapshot
  berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026" identik**, merepresentasikan
  resolusi Authorization Spec §2.12 `View-UrlRedirect` (**T4-15**, Superadmin-only
  → seluruh role `all` termasuk publik/anon).

- **[KRITIS — REGRESI KELIMA & KEENAM, DITEMUKAN RETROAKTIF DI MP-03]
  `0008_m03_listing.sql` — DUA klaim "Diperbaiki [2026-08-06]" ternyata
  regresi, tidak satu pun pernah dieksekusi ke migration.** Ditemukan saat
  audit MP-11 mengutip ulang status T1-02 dari MP-03, memicu verifikasi balik
  yang **tidak dilakukan saat audit MP-03 awal (9 Agustus 2026)**:
  1. **Konflik #1 (T1-02):** `listings_select_public` diklaim diubah jadi
     `status IN ('published','sold','rented')` — migration aktual masih
     `status = 'published'` saja. Listing terjual/tersewa 404 untuk publik,
     bertentangan langsung dengan SEO Spec §1.4, Functional Spec §4.3, PRD
     Modul 3 & 11 Business Rule (4 sumber independen).
  2. **Konflik #2:** klausa Organization Leader diklaim ditambahkan ke
     `listing_photos_manage`/`listing_videos_manage`/`listing_amenities_manage`
     — ketiganya masih hanya periksa `agent_id` pemilik asli, tanpa klausa
     Org Leader sama sekali.
  Kedua klaim juga tercatat keliru sebagai "Fixed" di `CHANGELOG-v0.7.1.md`/
  `v0.7.2.md` — regresi lolos dari governance tracking selama ~4 hari
  (6→10 Agustus).

### Added
- **`0008_m03_listing-FIXED.sql`** — kedua konflik diperbaiki:
  1. `listings_select_public` sekarang `status IN ('published','sold','rented')
     AND deleted_at IS NULL`.
  2. Ketiga child-table policy sekarang memuat klausa Org Leader (pola sama
     `listings_update_own_or_org_leader`: `EXISTS` join `listings`→
     `organization_members` dengan `role='leader' AND status='active'`).
  17 policy tetap 17, 8 tabel tetap 8 — tidak ada struktur lain berubah.
  Migration belum pernah dieksekusi ke live, diperbaiki langsung di file `0008`.

### Changed
- **MP-03-Listing-Module-Planning.md** — file final (diserahkan 9 Agustus)
  **direvisi ulang** dengan anotasi regresi di Riwayat Versi, Risk Analysis,
  Conflict Analysis #1 & #2, dan Definition of Ready. Klaim asli TIDAK
  dihapus (EAF §8.3).
- **MP-11-SEOAnalytics-Module-Planning.md** — nomor versi publik **TIDAK
  dinaikkan** (tetap "1.0"); ditambahkan Riwayat Versi + Catatan Verifikasi
  Silang yang mendokumentasikan bahwa regresi ditemukan lewat modul ini,
  bukan berasal darinya.

### Process Reflection — Kegagalan Verifikasi di Audit Awal
- **Audit konsolidasi MP-03 (9 Agustus 2026) tidak melakukan verifikasi
  silang independen terhadap `0008_m03_listing.sql`** — klaim "Diperbaiki"
  internal dokumen diterima begitu saja, berbeda dari perlakuan MP-04/05/06
  yang sejak awal diverifikasi ketat terhadap file SQL/API Spec aktual.
  Ini adalah **gap dalam proses audit itu sendiri**, bukan murni masalah
  dokumentasi sumber proyek. Kebijakan verifikasi wajib (CHANGELOG [0.7.2]
  Governance Notes poin 27) baru mulai diterapkan konsisten sejak audit
  MP-04 — MP-01/02/03 yang diaudit sebelum kebijakan itu matang berpotensi
  masih menyimpan klaim tak terverifikasi lain.

### Process Note — Update Statistik Pola Sistemik
- **Rasio regresi naik tajam menjadi 6 dari 10 klaim yang diverifikasi (60%)**
  (sebelumnya 4/8 = 50% di CHANGELOG [0.7.13]). MP-03 sendirian menyumbang
  2 regresi baru. Regresi kumulatif: MP-04 (×1), MP-05 (×1), MP-06 (×1),
  MP-09/OD-20 (×1, closed independen), **MP-03 (×2, ditemukan retroaktif)**.
  Terverifikasi bersih: MP-07 (×2), MP-08 (×1), MP-10 (×1), MP-11/T4-15 (×1).

## [0.7.13] - 2026-08-09

### Fixed
- **MP-10-RBAC-Module-Planning.md — konflik penomoran versi:** 2 snapshot
  berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026" identik**, merepresentasikan
  resolusi 1 temuan: Authorization Spec §2.11 mencantumkan Manager=`none`
  literal untuk seluruh baris permission M10, padahal PRD Modul 10 & API Spec
  §1.3 menyatakan Manager punya akses terbatas ke
  `/admin/permissions/matrix/agent` (**T4-01**).

### Verified
- **Klaim T4-01 diverifikasi TERBUKTI BENAR** terhadap
  `Authorization-Access-Control-Specification-v1.1-FINAL.md` §2.11 — cocok
  persis termasuk detail "scoped role target `agent`" untuk
  `Update-RolePermission` (Manager: none→`own`). Cakupan perbaikan aktual
  bahkan **lebih luas** dari yang tersirat MP-10 — turut mengoreksi
  `View-Role` (temuan #17) dan `View-Permission` (temuan #18) dengan pola
  serupa (seluruh role naik ke `all`, mengikuti RLS `USING(true)`). Bukan
  inkonsistensi, murni perbaikan lebih menyeluruh dari yang diklaim.

### Changed
- **MP-10-RBAC-Module-Planning.md** — nomor versi publik **TIDAK dinaikkan**
  (tetap "1.0"); ditambahkan Bagian "Riwayat Versi" + "Catatan Verifikasi
  Silang".

### Process Note — Update Statistik Pola Sistemik
- **Rasio regresi turun menjadi 4 dari 8 klaim yang diverifikasi (50%)**
  (sebelumnya 4/7 = 57% di CHANGELOG [0.7.12]). MP-10/T4-01 menambah daftar
  klaim terverifikasi bersih, bergabung dengan MP-07 (×2), MP-08 (×1).
  4 regresi tetap: MP-04, MP-05, MP-06, MP-09/OD-20 (closed independen).

## [0.7.12] - 2026-08-09

### Fixed
- **MP-09-AdminPanel-Module-Planning.md — konflik penomoran versi:** 3 snapshot
  berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026" identik**, merepresentasikan
  progres: (1) REQ-M09-001 (CRUD akun internal) tidak punya endpoint, dieskalasi
  Owner; (2) Resolved via **OD-20 Opsi A** — 4 endpoint `/admin/internal-users`
  ditambahkan; (3) 2 temuan housekeeping (**T4-09** kepemilikan silang kredensial
  GTM/GA4/GSC, **T4-10** struktur PRD) ditandai Acknowledged non-blocking.

### Verified (dengan catatan penting)
- **Klaim OD-20 (4 endpoint `/admin/internal-users`) dikonfirmasi ADA** di
  `API-Specification-RUMAHAGEN-v1.3-FINAL.md` §11.3.
  **Namun dokumen tsb sendiri mencatat endpoint ini SEMPAT HILANG tanpa jejak
  resmi** ("dikembalikan 9 Agustus 2026 setelah sempat hilang tanpa jejak resmi
  di siklus penetapan status Baseline") — **pola regresi yang identik** dengan
  MP-04 (migration `0009`), MP-05 (migration `0010`), MP-06 (API Spec §10.3).
  **Perbedaan kunci: regresi OD-20 ini sudah ditemukan & diperbaiki secara
  independen** sebagai bagian dari upgrade API Specification v1.2→v1.3
  (8-9 Agustus 2026, terkait siklus duplikat foto ADR-047/OD-25), **sebelum**
  audit konsolidasi MP-09 ini dimulai. Tidak ada tindakan perbaikan tambahan
  diperlukan dari siklus ini — dicatat murni untuk kelengkapan traceability
  dan statistik pola sistemik.

### Changed
- **MP-09-AdminPanel-Module-Planning.md** — nomor versi publik **TIDAK
  dinaikkan** (tetap "1.0"); ditambahkan Bagian "Riwayat Versi" + "Catatan
  Verifikasi Silang".

### Process Note — Update Statistik Pola Sistemik
- **Rasio regresi terkoreksi menjadi 4 dari 7 klaim yang diverifikasi**
  (sebelumnya dilaporkan 3 dari 6 di CHANGELOG [0.7.11]): MP-04, MP-05, MP-06,
  dan sekarang **OD-20/MP-09** ditambahkan ke daftar klaim yang sempat regresi
  — meski OD-20 sudah closed sebelum ditemukan lewat audit ini. 3 klaim tetap
  terverifikasi bersih tanpa regresi (T4-13/T4-14 MP-07, T4-16 MP-08).
  **Rasio regresi aktual: 57% (4/7)** — lebih tinggi dari perkiraan sebelumnya,
  memperkuat justifikasi kebijakan verifikasi wajib untuk MP-10 s.d. MP-13.

## [0.7.11] - 2026-08-09

### Fixed
- **MP-07-DBRScoring-Module-Planning.md — konflik penomoran versi:** 2 snapshot
  berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026" identik**, merepresentasikan
  resolusi 2 temuan housekeeping: (1) Authorization Spec §2.8 `View-DbrConfig`
  terlalu ketat vs API Spec+RLS (**T4-13**); (2) kutipan salah nomor "§2.7"
  (seharusnya §2.8) di migration `0011` dan Technical Spec (**T4-14**).
- **MP-08-DashboardNotifikasi-Module-Planning.md — konflik penomoran versi:**
  2 snapshot identik, merepresentasikan resolusi 1 temuan: Authorization Spec
  §2.9 `View`/`Update-Notification` terlalu **longgar** (Superadmin/Manager/
  Admin=`all`) vs RLS `notifications_own` yang tanpa bypass sama sekali
  (**T4-16**) — kasus di mana ketidaksesuaian menguntungkan keamanan, RLS
  sudah benar sejak awal.

### Verified
- **Pola regresi 3/3 (MP-04/05/06) TERPUTUS di kedua modul ini.** Seluruh
  3 klaim (T4-13, T4-14, T4-16) diverifikasi silang langsung terhadap sumber:
  - T4-13 & T4-16: `Authorization-Access-Control-Specification-v1.1-FINAL.md`
    §2.8/§2.9 — cocok penuh dengan klaim.
  - T4-14: `0011_m07_dbr.sql` (project) — komentar sudah "§2.8", bukan "§2.7".
  Turut dikonfirmasi oleh `CHANGELOG-v0.7.1`/`v0.7.2` yang sudah mencatat
  ketiganya sebagai Fixed sebelum siklus konsolidasi ini. **Kesimpulan:
  regresi 6 Agustus→9 Agustus tidak bersifat universal** — kebijakan verifikasi
  wajib (poin 27, MP-06) tetap perlu dijalankan per-modul, bukan diasumsikan
  otomatis gagal.

### Changed
- **MP-07** dan **MP-08** — nomor versi publik **TIDAK dinaikkan** (tetap "1.0")
  untuk keduanya; masing-masing ditambahkan Bagian "Riwayat Versi" + "Catatan
  Verifikasi Silang".

## [0.7.10] - 2026-08-09

### Fixed
- **MP-06-DirektoriDeveloper-Module-Planning.md — konflik penomoran versi:**
  3 snapshot berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026" identik**,
  merepresentasikan progres resolusi 2 gap: (1) definisi cakupan "wilayah
  eksklusif" via **OD-19 Opsi A** (scope = per Kota `city_id`, enforcement
  service-layer); (2) klaim penambahan 3 endpoint CRUD admin ke API
  Specification (audit v1.1/T4-11). Pola penomoran identik `SYSTEM-ARCHITECTURE.md`/
  AI Development Blueprint/MP-01/02/03/04/05.

- **[KRITIS — REGRESI KETIGA] `API-Specification-RUMAHAGEN.md`
  §10.3 — endpoint yang diklaim ditambahkan ternyata tidak pernah ada.**
  Verifikasi silang (9 Agustus 2026) terhadap `API-Specification-...v1.3-FINAL.md`
  (file terbaru, bertanggal 8-9 Agustus — lebih baru dari klaim 6 Agustus)
  membuktikan 3 endpoint `GET`/`PUT`/`DELETE /admin/developer-projects{/id}`
  yang diklaim MP-06 sebagai **"✅ Diperbaiki [2026-08-06], audit v1.1/T4-11"**
  **tidak pernah benar-benar ditambahkan** — §10.3 (satu-satunya lokasi kontrak
  API Modul 6) masih persis 4 endpoint lama. **Berbeda dari MP-04 (gap fitur)
  dan MP-05 (bug keamanan aktif), ini gap kontrak dokumentasi** — tidak ada
  risiko keamanan langsung, tapi endpoint CRUD admin yang dijanjikan
  Functional Spec §4.6 tidak punya kontrak formal.
  **🔴 Pola sistemik sekarang terkonfirmasi 3 dari 3 kasus** yang diverifikasi
  silang sejak 9 Agustus 2026 (migration `0009`, migration `0010`, dan
  sekarang API Specification) — seluruhnya berasal dari klaim "Diperbaiki
  [2026-08-06]" yang tidak pernah benar-benar dieksekusi ke dokumen sumber
  terkait.

### Added
- **`API-Specification-RUMAHAGEN-v1.3-FINAL-FIXED.md`** —
  3 endpoint ditambahkan ke §10.3 (`GET`/`PUT`/`DELETE /admin/developer-projects{/id}`,
  Auth Superadmin/Manager/Admin), dengan catatan regresi eksplisit di dokumen
  itu sendiri (mengikuti pola pemulihan endpoint OD-20/`/admin/internal-users`
  yang sudah lebih dulu tercatat di dokumen yang sama). Header versi diperbarui
  mencatat pemulihan ketiga ini.

### Changed
- **MP-06-DirektoriDeveloper-Module-Planning.md** — nomor versi publik **TIDAK
  dinaikkan** (tetap "1.0"); ditambahkan Bagian "Riwayat Versi" + "Catatan
  Verifikasi Silang". 3 lokasi klaim "Diperbaiki [2026-08-06]" (§17, §46, §51)
  diberi anotasi status final "🟢 Resolved terverifikasi [2026-08-09]" — klaim
  asli TIDAK dihapus (EAF §8.3).

### Action Required
- **Ganti `API-Specification-RUMAHAGEN-v1.3-FINAL.md` di
  project dengan versi `-FIXED`.**
- **Rekomendasi kuat:** audit balik SEMUA dokumen yang mencatat klaim
  "Diperbaiki [2026-08-06]" merujuk ke dokumen sumber lain (migration, API
  Spec, Authorization Spec, dll.) — bukan hanya menunggu ditemukan modul per
  modul saat konsolidasi. Lihat bagian 4 di bawah untuk daftar kandidat.

## [0.7.9] - 2026-08-09

### Fixed
- **MP-05-KalenderEvent-Module-Planning.md — konflik penomoran versi:** 3 snapshot
  berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026" identik**, merepresentasikan
  progres perbaikan 2 Konflik (self-approval event via RLS `events_manage`;
  kontradiksi internal PRD soal Manager via **OD-17 Opsi A**, konsisten OD-16/MP-04).
  Pola identik `SYSTEM-ARCHITECTURE.md`/AI Development Blueprint/MP-01/02/03/04.

- **[KRITIS — BUG KEAMANAN AKTIF] `0010_m05_events.sql` — regresi
  dokumentasi-vs-implementasi kedua berturut-turut, LEBIH SERIUS dari MP-04.**
  Verifikasi silang (9 Agustus 2026) membuktikan RLS `events_manage` yang
  diklaim "✅ Diperbaiki [2026-08-06]" (dipisah jadi 4 policy) **ternyata masih
  1 policy tunggal, identik versi pra-perbaikan**. Berbeda dari regresi MP-04
  (gap fitur), ini adalah **bug bypass approval aktif**: Developer Partner
  masih bisa mem-publish event promosi miliknya sendiri (`status='published'`)
  tanpa moderasi Admin — persis kondisi yang katanya sudah diperbaiki 3 hari
  sebelumnya. Dikonfirmasi Owner (9 Agustus 2026) file yang diaudit adalah
  versi terbaru, bukan usang.

### Added
- **`0010_m05_events-FIXED.sql`** — `events_manage` dipecah jadi 4 policy
  persis sesuai spesifikasi MP-05 §51 Conflict Analysis:
  1. `events_insert_own` — submitter hanya INSERT dengan status awal
     `pending_approval`.
  2. `events_update_own` — submitter hanya UPDATE selama status masih
     `pending_approval`/`cancelled`, tidak bisa self-set `published`/`rejected`.
  3. `events_delete_own` — submitter hanya DELETE selama belum diproses.
  4. `events_manage_all` — role bermscope `manage` (Superadmin/Admin/Manager,
     OD-17) memegang approve/reject penuh.
  2 tabel tetap 2, policy naik 3→6 (1 dipecah jadi 4, ditambah 2 yang sudah
  ada tidak berubah). Migration Modul 5 status eksekusi ke live: lihat §25
  MP-05 (perlu dicek sebelum eksekusi patch ini).

### Changed
- **MP-05-KalenderEvent-Module-Planning.md** — nomor versi publik **TIDAK
  dinaikkan** (tetap "1.0"); ditambahkan Bagian "Riwayat Versi" + "Catatan
  Verifikasi Silang" baru. 3 lokasi klaim "Diperbaiki [2026-08-06]" diberi
  anotasi status final "🟢 Resolved terverifikasi [2026-08-09]" — klaim asli
  TIDAK dihapus (EAF §8.3).

### Action Required
- **Ganti `0010_m05_events.sql` di project dengan versi `-FIXED`**, lalu
  eksekusi/re-eksekusi migration ke database sesuai status eksekusi terkini.
- **Endpoint approve/reject API Specification masih belum ditambahkan**
  (dicatat MP-05 sendiri sebagai temuan terpisah, di luar scope RLS fix ini)
  — perlu ditindaklanjuti terpisah.

## [0.7.8] - 2026-08-09

### Fixed
- **MP-04-LearningCenter-Module-Planning.md — konflik penomoran versi:** ditemukan
  3 snapshot revisi dokumen seluruhnya berlabel **"Versi 1.0" dan tanggal
  "6 Agustus 2026" yang identik**, merepresentasikan progres perbaikan 3 Konflik
  (RLS bank soal tidak dukung ownership Instructor; inkonsistensi internal PRD
  soal akses Manager via **OD-16 Opsi A**; RLS Enrollment/QuizAttempt tidak
  dukung Instructor). Pola identik `SYSTEM-ARCHITECTURE.md` ([0.7.3]), AI
  Development Blueprint ([0.7.4]), MP-01 ([0.7.5]), MP-02 ([0.7.6]), MP-03
  ([0.7.7]).

- **[KRITIS] `0009_m04_learning_center.sql` — regresi dokumentasi-vs-implementasi
  terkonfirmasi dan diperbaiki.** Verifikasi silang migration terhadap klaim
  MP-04 (9 Agustus 2026) membuktikan **4 RLS policy yang diklaim "Diperbaiki
  [2026-08-06]" ternyata TIDAK PERNAH benar-benar dieksekusi ke file migration**:
  `quiz_questions_manage`, `quiz_options_manage` (ownership Instructor via
  quiz/option→course — Konflik #1), `enrollments_own`, `quiz_attempts_own`
  (akses Instructor via `course.created_by` — Konflik #3). Dokumen MP-04
  menyatakan status Resolved di §45/§46/§48/§51 sejak snapshot 1.0b (6 Agustus),
  namun migration aktual masih identik dengan versi 1.0a (pra-perbaikan).
  Dikonfirmasi Owner (9 Agustus 2026) bahwa file yang diaudit adalah versi
  terbaru — bukan file usang. **Root cause tidak diketahui** (kemungkinan
  perbaikan hanya ditulis di dokumentasi tanpa benar-benar diterapkan ke SQL,
  atau file SQL yang diperbaiki tidak pernah disimpan ke lokasi yang benar).

### Added
- **`0009_m04_learning_center-FIXED.sql`** — migration terkoreksi, 4 policy
  diperbaiki persis mengikuti spesifikasi klausa yang sudah dirumuskan MP-04
  §51 Conflict Analysis sendiri:
  1. `quiz_questions_manage` — tambah `EXISTS (...quizzes qz JOIN courses c...)`.
  2. `quiz_options_manage` — tambah `EXISTS (...quiz_questions qq JOIN quizzes qz JOIN courses c...)`.
  3. `enrollments_own` — tambah akses Instructor via `course.created_by` (USING saja).
  4. `quiz_attempts_own` — tambah akses Instructor via enrollment→course (USING saja).
  13 policy tetap 13, 8 tabel tetap 8 — tidak ada struktur yang berubah selain
  4 klausa ownership ini. Migration Modul 4 **belum pernah dieksekusi** ke
  database live (dikonfirmasi MP-04 §25), sehingga diperbaiki langsung di file
  `0009`, bukan lewat migration tambahan.

### Changed
- **MP-04-LearningCenter-Module-Planning.md** — nomor versi publik **TIDAK
  dinaikkan** (tetap "1.0"); ditambahkan Bagian "Riwayat Versi" + "Catatan
  Verifikasi Silang" baru yang mendokumentasikan seluruh siklus temuan→
  konfirmasi Owner→perbaikan pada 9 Agustus 2026. 6 lokasi klaim "Diperbaiki
  [2026-08-06]" diberi anotasi status final "✅ Diperbaiki [2026-08-09]" —
  klaim asli TIDAK dihapus (EAF §8.3), hanya diberi keterangan tambahan.

### Action Required
- **Ganti `0009_m04_learning_center.sql` di project dengan versi `-FIXED`**,
  lalu eksekusi migration ke database live. Belum dilakukan otomatis — perlu
  tindakan manual Owner.

## [0.7.7] - 2026-08-09

### Fixed
- **MP-03-Listing-Module-Planning.md — konflik penomoran versi:** ditemukan
  3 snapshot revisi dokumen seluruhnya berlabel **"Versi 1.0" dan tanggal
  "6 Agustus 2026" yang identik**, padahal isinya berbeda secara progresif:
  (1) 3 Konflik terbuka (RLS `listings_select_public` memblokir akses publik
  ke listing sold/rented — bertentangan SEO Spec; RLS child-table foto/video/
  amenity tidak konsisten dengan parent table soal Organization Leader;
  Authorization Spec vs RLS Amenity management); (2) ketiganya **diperbaiki/
  Resolved** — migration `0008` dikoreksi dua kali (status sold/rented +
  klausa Org Leader di 3 child-table policy), **OD-22 Opsi A** (Amenity tetap
  Superadmin-only, Authorization Spec §2.4 dikoreksi); (3) referensi
  Authorization Spec naik ke v1.1. Ditemukan lewat audit konsolidasi 3 snapshot
  menjadi 1 file master. Pola identik dengan temuan `SYSTEM-ARCHITECTURE.md`
  (CHANGELOG [0.7.3]), AI Development Blueprint ([0.7.4]), MP-01 ([0.7.5]),
  MP-02 ([0.7.6]).

### Added
- **MP-03-Listing-Module-Planning.md — digabung dengan `P6-Hasil-MP03-ModulePlanning-DuplicateDetection.md`**
  (deteksi duplikat foto, `ADR-047`/`OD-25`), sebelumnya adalah paket perubahan
  terpisah yang belum termerge ke dokumen utama: **+1 User Story** (`US-M03-15`),
  **+1 Functional Requirement** (`REQ-M03-016` — exact hash + perceptual hash,
  blocking jika identik 100%, warning non-blocking 90-99%, tidak di-flag <90%),
  **+2 Edge Case** (foto sudah dihapus dari listing lain; false-positive
  perceptual hash pada denah rumah bertipe sama), **+1 baris Risk Analysis**
  (kalibrasi threshold Hamming Distance ≤6 belum diuji terhadap data foto
  properti produksi — `ADR-047` Future Review menandai untuk ditinjau ulang).

### Changed
- **MP-03-Listing-Module-Planning.md** — nomor versi publik **TIDAK dinaikkan**
  (tetap "1.0"); konten dikonsolidasikan menjadi satu file kanonik (snapshot
  `__2_` + P6 sebagai basis) dan ditambahkan Bagian "Riwayat Versi" baru.
- Konvensi PATCH-identifier retroaktif diterapkan: tiga snapshot historis
  ditandai **1.0a/1.0b/1.0c** di Riwayat Versi internal dokumen; baris ke-4
  ditandai **"1.0c + P6"** untuk penggabungan yang terjadi di siklus konsolidasi
  ini sendiri (9 Agustus), bukan bagian dari histori 6 Agustus.

### Process Improvement
- **Tidak ditemukan kehilangan konten** pada audit 3 snapshot historis — 0
  pure-deletion hunk di kedua diff berurutan, konsisten pola MP-01/MP-02.
- **Berbeda dari MP-01/MP-02**, dua dari tiga Konflik di MP-03 (Konflik #1 dan
  #2) memperbaiki **migration `0008` secara langsung**, bukan sekadar update
  status dokumentasi — verifikasi silang terhadap `0008_m03_listing.sql` versi
  terbaru direkomendasikan sebagai langkah lanjutan (lihat bagian 4 di bawah).

## [0.7.6] - 2026-08-09

### Fixed
- **MP-02-ProfilAgen-Module-Planning.md — konflik penomoran versi:** ditemukan
  3 snapshot revisi dokumen seluruhnya berlabel **"Versi 1.0" dan tanggal
  "6 Agustus 2026" yang identik**, padahal isinya berbeda secara progresif:
  (1) gap bukti-lead-review & tidak ada pembatasan 1-review-per-Buyer-per-Agen
  awalnya dieskalasi ke Owner, belum diputuskan; (2) **OD-23 Resolved** — bukti
  lead tidak wajib, 1 review aktif per (reviewer, agen) dengan replace-on-resubmit,
  **fitur baru** self-review Agen (auto-approved, ikut `aggregateRating`),
  `UNIQUE(buyer_id, agent_id)` ditambahkan ke migration `0005`; (3) Authorization
  Spec §2.3 Konflik #3 **Closed** (audit T4-03) — Buyer=own untuk Approve/Delete
  AgentReview dikoreksi jadi none, Authorization Spec naik ke v1.1. Ditemukan
  lewat audit konsolidasi 3 snapshot menjadi 1 file master. Pola identik dengan
  temuan `SYSTEM-ARCHITECTURE.md` (CHANGELOG [0.7.3]), AI Development Blueprint
  ([0.7.4]), dan MP-01 ([0.7.5]).

### Changed
- **MP-02-ProfilAgen-Module-Planning.md** — nomor versi publik **TIDAK dinaikkan**
  (tetap "1.0"); konten dikonsolidasikan menjadi satu file kanonik (snapshot
  `__2_` sebagai basis) dan ditambahkan Bagian "Riwayat Versi" baru.
- Konvensi PATCH-identifier retroaktif (ditetapkan saat konsolidasi
  `SYSTEM-ARCHITECTURE.md`) diterapkan di sini: tiga snapshot ditandai
  **1.0a/1.0b/1.0c** di Riwayat Versi internal dokumen — file final setara 1.0c.

### Verified
- **Verifikasi silang tuntas, 9 Agustus 2026:** dua rujukan yang sempat ditandai
  belum terverifikasi saat audit awal kini dikonfirmasi cocok penuh —
  `Authorization-Access-Control-Specification-v1.1-FINAL.md` (diupload user,
  Bagian 0 baris #3/#4 cocok persis dengan klaim MP-02 "audit v1.1/T4-03"), dan
  `OD-23-T3-02-Keputusan-Owner.md` (dikonfirmasi via `decision-log.md` &
  `ISSUE-REGISTER-Konsolidasi-FINAL.md` yang sudah ada di project — isi OD-23
  kata-per-kata cocok dengan kutipan MP-02, meski file formalisasi individualnya
  sendiri belum diupload). **OD-23 adalah Open Decision (governance/bisnis),
  bukan ADR** — kategori terpisah dari `architecture-decision-records.md`.

### Process Improvement
- **Tidak ditemukan kehilangan konten sama sekali** pada audit — seluruh
  perubahan di 3 snapshot adalah update status field in-place (Open/Eskalasi →
  Resolved/Closed) dengan teks lama dipertahankan via strikethrough. Pola
  konsisten dengan MP-01 — dicatat sebagai **praktik baik berulang**, bukan
  kebetulan satu dokumen.

## [0.7.5] - 2026-08-09

### Fixed
- **MP-01-Authentication-Module-Planning.md — konflik penomoran versi:** ditemukan
  3 snapshot revisi dokumen seluruhnya berlabel **"Versi 1.0" dan tanggal
  "6 Agustus 2026" yang identik**, padahal isinya berbeda secara progresif
  (2 Open Issue kritis awalnya terbuka → bootstrap Superadmin resolved [OD-18
  Opsi B] → SSO Apple closed [T4-06 Opsi B] + istilah "Verified"→"Active"
  disinkronkan [audit T4-07] + Authorization Spec §2.2 dikoreksi & naik ke v1.1
  [audit T4-02]). Ditemukan lewat audit konsolidasi 3 snapshot menjadi 1 file
  master. Pola identik dengan temuan `SYSTEM-ARCHITECTURE.md` (CHANGELOG [0.7.3])
  dan AI Development Blueprint (CHANGELOG [0.7.4]).

### Changed
- **MP-01-Authentication-Module-Planning.md** — nomor versi publik **TIDAK
  dinaikkan** (tetap "1.0"); konten dikonsolidasikan menjadi satu file kanonik
  (snapshot `__2_` sebagai basis) dan ditambahkan Bagian "Riwayat Versi" baru.
- Konvensi PATCH-identifier retroaktif (ditetapkan saat konsolidasi
  `SYSTEM-ARCHITECTURE.md`) diterapkan di sini: tiga snapshot ditandai
  **1.0a/1.0b/1.0c** di Riwayat Versi internal dokumen — file final setara 1.0c.

### Process Improvement
- **Tidak ditemukan kehilangan konten sama sekali** pada audit — seluruh 656
  baris dokumen identik di ketiga snapshot; satu-satunya perubahan adalah update
  status field in-place (Open Issue → Resolved/Closed), dengan teks lama
  dipertahankan via strikethrough (`~~...~~`) lalu ditambah catatan resolusi
  resmi. Pola ini dinilai sebagai **praktik terbaik transparansi EAF §8.3** yang
  ditemukan sejauh ini di seluruh siklus audit konsolidasi proyek.

## [0.7.4] - 2026-08-09

### Fixed
- **AI Development Blueprint / development-playbook.md — konflik penomoran versi:**
  ditemukan 2 dari 9 snapshot revisi dokumen berlabel **"Version 1.6" dan tanggal
  "3 Agustus 2026" yang identik**, padahal isinya berbeda (Owner field: TBD →
  Mujtahid Aktanto via resolusi OD-06; soft-delete: 3 → 8 tabel via ADR-046/OD-07,
  keduanya bertanggal 4 Agustus). Ditemukan lewat audit konsolidasi 9 snapshot
  menjadi 1 file master. Pola identik dengan temuan `SYSTEM-ARCHITECTURE.md`
  (CHANGELOG [0.7.3]).
- **Konflik struktural "dua dokumen v1.0":** `AI-DEVELOPMENT-BLUEPRINT.md` (draft
  28-bagian bertema pattern teknis: CRUD/Form/API/Error Handling Pattern, tanpa
  tabel Document Information) dan `ai-development-blueprint__1_.md` (draft 24-bagian
  bertema AI Roles/Workflow/Golden Rules, dengan tabel Document Information)
  sama-sama berlabel **"Version 1.0"** namun strukturnya sama sekali berbeda —
  bukan revisi bertahap satu sama lain. Rantai versi resmi (v1.1 dst.) terkonfirmasi
  melanjutkan struktur `ai-development-blueprint__1_.md`. `AI-DEVELOPMENT-BLUEPRINT.md`
  disimpulkan draft awal yang ditinggalkan/di-restart dari nol.

### Changed
- **AI Development Blueprint** — nomor versi publik **TIDAK dinaikkan** (tetap "1.6");
  konten dikonsolidasikan menjadi satu file kanonik (`development-playbook__5_.md`
  sebagai basis) dan ditambahkan Bagian "Riwayat Versi" baru.
- Konvensi PATCH-identifier (1.6.0/1.6.1/dst., ditetapkan saat konsolidasi
  `SYSTEM-ARCHITECTURE.md`) diterapkan retroaktif di sini: dua snapshot ditandai
  **1.6a**/**1.6b** di Riwayat Versi internal dokumen — file final setara 1.6b.

### Decision (Owner, 9 Agustus 2026)
- **`AI-DEVELOPMENT-BLUEPRINT.md` (draft orphan v1.0) dibiarkan sebagai temuan
  tercatat — TIDAK ditindaklanjuti.** Tidak diarsipkan formal, tidak diekstrak
  isinya, tidak dihapus dari riwayat. Keputusan final, tidak memerlukan review
  ulang kecuali muncul kebutuhan baru.

### Process Improvement
- **Tidak ditemukan kehilangan konten** pada audit rantai versi resmi (v1.0→1.6b,
  8 diff berurutan). 3 pure-deletion hunk ditemukan, seluruhnya **Perubahan
  Disengaja dengan jejak resmi eksplisit di badan dokumen sendiri** (catatan
  resolusi ADR-005 dan ADR-006 tepat di bawah tabel placeholder yang baris-nya
  dihapus).

## [0.7.3] - 2026-08-09

### Fixed
- **SYSTEM-ARCHITECTURE.md — konflik penomoran versi:** 3 dari 9 snapshot revisi dokumen
  (diupload sebagai `__6_`, `__7_`, `__8_`) ternyata seluruhnya berlabel **"Versi 1.6"
  dan tanggal "3 Agustus 2026" yang identik**, padahal isinya berbeda secara substantif
  dan berurutan kronologis (Modul 12/13 → detail trigger Postgres & AI connection →
  promosi status Baseline + ADR-046 + resolusi OD-02/06/07). Ditemukan lewat audit
  konsolidasi 9 snapshot menjadi 1 file master. Diberi identifier PATCH retroaktif
  1.6.0/1.6.1/1.6.2 di tabel Riwayat Versi internal dokumen untuk membedakan ketiganya;
  file kanonik final setara **1.6.2**.

### Changed
- **SYSTEM-ARCHITECTURE.md** — nomor versi publik **TIDAK dinaikkan** (tetap "1.6") untuk
  menghindari membuat usang rujukan eksplisit di `project-manifest.md` dan
  `Module-Dependency-Matrix-RUMAHAGEN-v1.0.md`; hanya konten
  dikonsolidasikan menjadi satu file kanonik dan ditambahkan Bagian "Riwayat Versi" baru.
- **Aturan penomoran baru ditetapkan** (dicatat di Riwayat Versi dokumen ini sendiri):
  revisi konten pada tanggal yang sama wajib memakai identifier PATCH eksplisit
  (`1.6.1`, `1.6.2`, dst.) — bukan menuliskan ulang angka minor yang sama untuk isi
  yang berbeda. Berlaku untuk seluruh dokumen versi mayor.minor.PATCH ke depan, bukan
  hanya SYSTEM-ARCHITECTURE.md.

### Process Improvement
- **Tidak ditemukan kehilangan konten** pada audit — seluruh 8 diff berurutan (v1.0→1.6.2)
  nihil penghapusan murni tanpa penggantian. Namun ditemukan 2 gap sinkronisasi internal
  yang **belum diperbaiki** (di luar cakupan siklus ini): (a) Daftar Isi dokumen tidak
  mencantumkan Bagian 23–24 sejak v1.5, meski kedua bagian tsb tetap aktif di badan
  dokumen; (b) ADR-046 disebut di header status dokumen tapi tidak punya baris di ADR
  Cross-Reference Matrix (Bagian 24). Direkomendasikan sebagai task perbaikan terpisah.

## [0.7.1] - 2026-08-06 - Initial Development (T4-06 — SSO Apple, Penutup Issue Register)

### Added
Tidak ada perubahan pada kategori ini di rilis ini.

### Changed
- **T4-06 (SSO Apple) — Opsi B dijawab Owner.** Referensi SSO Apple **dipertahankan** (tidak dihapus) di 3 dokumen, ditandai eksplisit "belum diimplementasikan / roadmap masa depan":
  - `PRD-RUMAHAGEN-v1_2.md` — REQ-M01-002, Business Rule, User Flow ringkas (3 lokasi).
  - `Functional-Specification-RUMAHAGEN-v1_0.md` — §M01 registrasi & login (2 lokasi).
  - `User-Flow-RUMAHAGEN-v1_2.md` — alur login Modul 1 (1 lokasi).
- `MP-01-Authentication-Module-Planning-v1_0.md` — seluruh referensi SSO Apple (Risk Analysis, Known Limitation, Definition of Ready, Recommendation) ditandai Closed.
- `Authorization-Access-Control-Specification-v1_1.md` — catatan penutup T4-06 diperbarui dari "menunggu konfirmasi" menjadi "diselesaikan".

### Removed
Tidak ada — Owner memilih **mempertahankan** referensi (bukan Opsi A/hapus).

### Deprecated
Tidak ada perubahan pada kategori ini di rilis ini.

### Fixed
Tidak ada bug kode pada rilis ini.

### Security
Tidak ada perubahan pada kategori ini di rilis ini.

### Database Changes
Tidak ada perubahan skema/RLS pada rilis ini.

### API Changes
Tidak ada perubahan kontrak endpoint pada rilis ini — SSO Apple tetap belum punya spesifikasi teknis, tidak ada endpoint ditambahkan.

### UI Changes
Tidak ada perubahan pada kategori ini di rilis ini.

### Dokumen Terkait yang Ikut Diperbarui (bukan versi CHANGELOG, dicatat untuk traceability)
- `ISSUE-REGISTER-Konsolidasi-FINAL.md` — T4-06 ditandai Closed. **32/32 isu Issue Register tuntas.**
- `document-governance-baseline-register.md` — Governance Notes poin 20 diperbarui (addendum T4-06).
- `decision-log.md` — tidak ada entri baru (T4-06 bukan Open Decision formal, murni koreksi editorial berdasar preferensi Owner yang sudah diformalkan sebagai isu Tier 4).
- `CURRENT-PROJECT-STATE.md` — snapshot diperbarui terpisah (lihat versi terbaru).

## [0.7.0] - 2026-08-06 - Initial Development (Issue Register Batch 3 — Audit Authorization Spec)

### Added
- **3 endpoint baru** di `API-Specification-...v1.2.md` §10.3 (T4-11): `GET/PUT/DELETE /admin/developer-projects{/id}` — melengkapi CRUD yang sebelumnya hanya `POST`.
- **Dokumen baru** `Authorization-Access-Control-Specification-v1.1.md` — revisi penuh menggantikan v1.0, dengan Bagian 0 (Changelog Audit) mendokumentasikan 22 koreksi baris `PERM-XXX` beserta rujukan RLS/PRD.

### Changed
- **Audit menyeluruh §2 Authorization Spec** (113 baris `PERM-XXX`, 13 sub-bagian modul) terhadap RLS 15 migration + PRD Business Rule — **22 baris dikoreksi**:
  - 12 isu Tier 4 yang sudah teridentifikasi sebelumnya (T4-01, 02, 03, 04, 05, 12, 13, 14, 15, 16 — beberapa sudah Closed di Batch 1/2, dicantumkan ulang untuk kelengkapan changelog audit v1.1).
  - **10 temuan baru**: `Assign-User` Agent (M01), `View-DeveloperProject` DevPartner ternyata publik bukan `own` (M06), `Approve-Event` DevPartner (M05, drift pasca-Batch 1), `View-AuditLog` Agent org-scoped (M09), `View-Role`/`View-Permission`/`View-RolePermission` ternyata untuk SELURUH role bukan hanya sebagian (M10, RLS `USING(true)`), `Create-Organization` Manager/Admin (M12).
- `PRD-RUMAHAGEN-v1_2.md`, `User-Flow-RUMAHAGEN-v1_2.md` Modul 1 — istilah "Verified" disinkronkan menjadi "Active" di 9 lokasi (T4-07).
- `Technical-Specification-...v1.0.md` — kutipan section dikoreksi "§2.7"→"§2.8" (T4-14).
- **Seluruh 13 `MP-*.md`** — sitasi "Authorization Spec v1.0" di header Dokumen Acuan naik ke "v1.1"; resolusi Tier 4 spesifik per modul dicatat (MP-01, 02, 05, 06, 07, 08, 09, 10, 11, 12).
- `document-governance-baseline-register.md` naik ke v1.6 (Governance Notes poin 20).
- `ISSUE-REGISTER-Konsolidasi-FINAL.md` — 15 dari 17 isu Tier 4 ditandai Closed (T4-01 s.d. T4-05, T4-07 s.d. T4-16); T4-09/T4-10 ditutup sebagai Acknowledged.

### Removed
Tidak ada perubahan pada kategori ini di rilis ini.

### Deprecated
`Authorization-Access-Control-Specification-v1.0.md` — status berubah menjadi referensi historis begitu v1.1 naik Baseline (tidak dihapus, dipertahankan sesuai kebijakan dokumen governance).

### Fixed
- `0005_m02_agent_profile.sql` — 2 komentar salah rujuk migration "0007"→"0008" (T4-08).
- `0011_m07_dbr.sql` — komentar salah rujuk "§2.7"→"§2.8" (T4-14).

### Security
Tidak ada perubahan pada kategori ini di rilis ini — audit ini murni dokumentasi, beberapa temuan (mis. View-* jadi lebih terbuka) sudah sesuai perilaku RLS aktual sejak awal, bukan pelonggaran akses baru.

### Database Changes
Tidak ada perubahan skema maupun RLS pada rilis ini — seluruh 15 file migration (di luar 2 komentar housekeeping) tidak disentuh. Audit ini murni menyelaraskan dokumentasi ke perilaku RLS yang sudah ada.

### API Changes
Lihat **Added** di atas — 3 endpoint baru `/admin/developer-projects{/id}`. `API-Specification-...v1.2.md` tetap v1.2 (tidak bump nomor versi, pola sama Batch 2/OD-23).

### UI Changes
Tidak ada perubahan pada kategori ini di rilis ini.

### Dokumen Terkait yang Ikut Diperbarui (bukan versi CHANGELOG, dicatat untuk traceability)
- `Authorization-Access-Control-Specification-v1.1.md` — dokumen baru, Baseline.
- `PRD-RUMAHAGEN-v1_2.md`, `User-Flow-RUMAHAGEN-v1_2.md`, `Technical-Specification-...v1.0.md` — direvisi (isi, tanpa bump nomor versi).
- `CURRENT-PROJECT-STATE.md` — snapshot diperbarui terpisah (lihat versi terbaru).
- **Belum dieksekusi:** T4-06 (SSO Apple) — menunggu konfirmasi Owner.

## [0.6.0] - 2026-08-06 - Initial Development (OD-23 — Kebijakan Review Agen & Self-Review)

### Added
- **Fitur baru: self-review Agen** (`agent_reviews`, `0005_m02_agent_profile.sql`) — Agen dapat submit review untuk profilnya sendiri, auto-approved tanpa moderasi, ikut dihitung `aggregateRating` publik sama seperti review Buyer. RLS `agent_reviews_insert_buyer` dibuat kondisional per tipe reviewer (Buyer vs self-review Agen).
- **Constraint baru** `idx_agent_reviews_one_per_reviewer_per_agent` (`UNIQUE(buyer_id, agent_id) WHERE deleted_at IS NULL AND buyer_id IS NOT NULL`) — 1 reviewer (Buyer maupun Agen self-review) maksimal 1 review aktif per Agen.
- **RLS baru** `agent_reviews_update_own` — mendukung perilaku *replace* (upsert `ON CONFLICT (buyer_id, agent_id) DO UPDATE`) saat reviewer submit ulang ke Agen yang sama.

### Changed
- **OD-23 (T3-02, M02):** `PRD-...v1.2.md` Modul 2 Business Rule direvisi — bukti interaksi/lead dikonfirmasi **tidak wajib**; kebijakan 1-review-per-agen + replace-on-resubmit + self-review didokumentasikan penuh.
- `Authorization-Access-Control-Specification-v1.0.md` §2.3 — kolom Agent untuk `PERM-M02-Create-AgentReview`/`PERM-M02-View-AgentReview` diubah dari `-` (tidak berlaku) menjadi `own` (self-review).
- `MP-02-ProfilAgen-Module-Planning-v1_0.md` — Bagian 42/43/44/45/46/51/52 diupdate mencerminkan resolusi OD-23 (termasuk 4 skenario QA baru: replace Buyer, self-review, replace self-review, Agen review Agen lain ditolak).
- `decision-log.md` §11 — OD-23 diubah dari OPEN menjadi RESOLVED.
- `ISSUE-REGISTER-Konsolidasi-FINAL.md` — T3-02 ditandai Closed. **Dengan rilis ini, seluruh Tier 1+2+3 (13 dari 13 baris bernomor) Closed** — hanya 17 Tier 4 editorial tersisa.

### Removed
Tidak ada perubahan pada kategori ini di rilis ini.

### Deprecated
Tidak ada perubahan pada kategori ini di rilis ini.

### Fixed
Tidak ada bug kode pada rilis ini — perubahan RLS di sini adalah **penambahan kebijakan baru** (self-review, replace-on-resubmit), bukan koreksi bug seperti `0.4.2`.

### Security
`agent_reviews_insert_buyer` dan `agent_reviews_update_own` menegakkan pemisahan tegas: Buyer tidak dapat menyisipkan status `approved` saat insert/update (tetap wajib lewat moderasi); Agen hanya dapat self-review (`agent_id = auth.uid()`), tidak dapat submit review atas nama/menyasar Agen lain.

### Database Changes
- `0005_m02_agent_profile.sql`: **1 index baru** — `idx_agent_reviews_one_per_reviewer_per_agent` (UNIQUE, partial). **3 RLS policy diubah/ditambah** — `agent_reviews_insert_buyer` (kondisional per tipe reviewer, menggantikan versi lama), `agent_reviews_update_own` (baru). Tidak ada perubahan kolom/tabel.

### API Changes
Tidak ada perubahan kontrak endpoint pada rilis ini — `POST /agents/{id}/reviews` (API Spec v1.2, sudah ada) kini perlu diimplementasikan dengan logic upsert (bukan insert biasa) saat Sprint M02 — dicatat sebagai catatan implementasi, bukan perubahan kontrak API Specification.

### UI Changes
Tidak ada perubahan pada kategori ini di rilis ini — belum ada kode UI diimplementasikan.

### Dokumen Terkait yang Ikut Diperbarui (bukan versi CHANGELOG, dicatat untuk traceability)
- `OD-23-T3-02-Keputusan-Owner.md` — status Resolved.
- `PRD-RUMAHAGEN-v1_2.md` — Modul 2 direvisi (isi, tanpa bump nomor versi).
- `Authorization-Access-Control-Specification-v1_0.md` — §2.3 direvisi (isi, tanpa bump nomor versi).
- `0005_m02_agent_profile.sql` — constraint & RLS baru.
- `CURRENT-PROJECT-STATE.md` — snapshot diperbarui terpisah (lihat versi terbaru).

## [0.5.0] - 2026-08-06 - Initial Development (Issue Register Batch 2 — OD-16 s.d. OD-22)

### Added
- **4 endpoint baru** di `API-Specification-...v1.2.md` §10.4 (OD-20): `GET /admin/internal-users`, `POST /admin/internal-users`, `PUT /admin/internal-users/{id}`, `PUT /admin/internal-users/{id}/deactivate` — menutup gap REQ-M09-001 (kelola akun Admin/Manager/Instructor baru), sebelumnya tidak ada endpoint sama sekali.
- **Script bootstrap** `scripts/seed-superadmin.ts` + `scripts/README-seed-superadmin.md` (OD-18) — mekanisme pembuatan akun Superadmin pertama via CLI (Supabase Admin API), menggantikan pendekatan SQL manual mentah di draft awal.

### Changed
Seluruh perubahan berikut adalah revisi dokumen governance menjawab 7 Open Decision (OD-16 s.d. OD-22, `OD-16-sampai-OD-22-Batch2-Keputusan-Owner.md`), sumber `ISSUE-REGISTER-Konsolidasi-FINAL.md` v2.0 Tier 2 + sebagian Tier 3:

- **OD-16 (T2-01, M04):** `PRD-...v1.2.md` Modul 4 Acceptance Criteria direvisi — Manager kini eksplisit memiliki akses Full ke "Kelola Kursus", konsisten dengan Business Rule (sebelumnya kedua bagian PRD saling bertentangan).
- **OD-17 (T2-02, M05):** `PRD-...v1.2.md` Modul 5 Acceptance Criteria direvisi — Manager kini eksplisit dapat publish event langsung tanpa approval, konsisten dengan Business Rule.
- **OD-19 (T3-03, M06):** `PRD-...v1.2.md` Modul 6 Business Rule diklarifikasi — cakupan "wilayah eksklusif" = per Kota (`city_id`), tidak perlu field/skema baru.
- **OD-20 (T3-04, M09):** lihat Added di atas.
- **OD-21 (T3-05, M13):** `PRD-...v1.2.md` REQ-M13-005 dan `User-Flow-...v1.2.md` header Modul 13 direvisi — Developer Partner ditambahkan sebagai role ke-6 yang dapat memakai AI Assistant, konsisten dengan `Authorization-Access-Control-Specification-v1.0.md` §2.14 yang sejak awal sudah memberi akses `own`.
- **OD-22 (T3-07, M03):** `Authorization-Access-Control-Specification-v1.0.md` §2.4 dikoreksi — `PERM-M03-Manage-Amenity` diubah dari `all` menjadi `none` untuk Manager/Admin, disesuaikan ke RLS `amenities_manage` aktual (Superadmin-only dipertahankan).
- **7 Module Planning** diupdate mencerminkan resolusi: `MP-04`, `MP-05`, `MP-01`, `MP-06`, `MP-09`, `MP-13`, `MP-03` (Bagian 45/46/51/52 masing-masing, status isu → Closed dengan referensi OD).
- `decision-log.md` — 7 entri OD-16 s.d. OD-22 diregistrasi di §11 dan langsung ditandai Resolved dalam siklus yang sama, mengikuti pola OD-02/06/07/14/15.
- `ISSUE-REGISTER-Konsolidasi-FINAL.md` — T2-01, T2-02, T3-01, T3-03, T3-04, T3-05, T3-07 (7 isu) ditandai Closed dengan tanggal & referensi OD.

### Removed
Tidak ada perubahan pada kategori ini di rilis ini.

### Deprecated
Tidak ada perubahan pada kategori ini di rilis ini.

### Fixed
Tidak ada bug kode pada rilis ini — seluruh perubahan adalah revisi dokumen governance (PRD/Authorization Spec/API Spec) dan penambahan script operasional, bukan perbaikan RLS/migration (itu cakupan `0.4.2`).

### Security
Tidak ada perubahan pada kategori ini di rilis ini.

### Database Changes
Tidak ada perubahan skema maupun RLS pada rilis ini — seluruh 15 file migration tidak disentuh. **Catatan penting terkait OD-19:** draft awal keputusan (Opsi B, per-Kecamatan) sempat dipertimbangkan tapi **dibatalkan** setelah ditemukan bahwa `developer_projects` tidak memiliki kolom `district_id` (hanya `city_id`) — Opsi B akan memerlukan migration/ERD baru dan berpotensi ADR baru. Owner mengonfirmasi ganti ke Opsi A (per Kota), sehingga **tidak ada perubahan skema** di rilis ini.

### API Changes
Lihat **Added** di atas — 4 endpoint baru `/admin/internal-users/*`, `API-Specification-...v1.2.md` **tidak naik nomor versi** pada rilis ini (tetap v1.2, penambahan endpoint dicatat sebagai perubahan konten dalam versi yang sama — akan naik ke v1.3 pada siklus konsolidasi berikutnya jika ada perubahan tambahan, mengikuti pola dokumen ini).

### UI Changes
Tidak ada perubahan pada kategori ini di rilis ini — belum ada kode UI diimplementasikan.

### Dokumen Terkait yang Ikut Diperbarui (bukan versi CHANGELOG, dicatat untuk traceability)
- `OD-16-sampai-OD-22-Batch2-Keputusan-Owner.md` — 7 OD, seluruhnya berstatus Resolved di dokumen ini.
- `PRD-RUMAHAGEN-v1_2.md` — Modul 4, 5, 6, 13 direvisi (isi, tanpa bump nomor versi pada rilis ini — sudah v1.2 sejak siklus sebelumnya).
- `Authorization-Access-Control-Specification-v1_0.md` — §2.4 dikoreksi (isi, tanpa bump nomor versi).
- `User-Flow-RUMAHAGEN-v1_2.md` — header Modul 13 direvisi.
- `API-Specification-RUMAHAGEN-v1_2.md` — §10.4 ditambah 4 endpoint baru.
- `scripts/seed-superadmin.ts`, `scripts/README-seed-superadmin.md` — baru dibuat.
- `CURRENT-PROJECT-STATE.md` — snapshot diperbarui terpisah (lihat versi terbaru).

## [0.4.2] - 2026-08-06 - Initial Development (Bug Fixes — Issue Register Batch 1: RLS Migration)

### Added
Tidak ada perubahan pada kategori ini di rilis ini.

### Changed
Tidak ada perubahan pada kategori ini di rilis ini — seluruh perubahan rilis ini masuk kategori **Fixed** (koreksi RLS policy) dan **Database Changes**, bukan perubahan skema/fitur baru.

### Removed
Tidak ada perubahan pada kategori ini di rilis ini.

### Deprecated
Tidak ada perubahan pada kategori ini di rilis ini.

### Fixed
Seluruh perbaikan berikut ditangani dalam `TASK-HOTFIX-20260806-001` ("Perbaikan RLS — Issue Register Batch 1"), sumber: `ISSUE-REGISTER-Konsolidasi-FINAL.md` v2.0 Tier 1 + T3-06. Migration **belum dieksekusi** ke database live — perbaikan ini murni edit file `.sql`, efeknya baru berlaku saat Sprint S0 dijalankan.

- **T1-01** (`0009_m04_learning_center.sql`) — `quiz_questions_manage`/`quiz_options_manage` sebelumnya hanya mengizinkan all-scope, tidak ada ownership check; Instructor tidak bisa kelola bank soal kursus miliknya. Ditambahkan klausa ownership via join quiz→course. Sekaligus ditambahkan klausa Instructor (via `course.created_by`) ke `enrollments_own`/`quiz_attempts_own` agar Instructor dapat memantau progress peserta kursusnya. Modul terdampak: MP-04.
- **T1-02** (`0008_m03_listing.sql`) — `listings_select_public` sebelumnya hanya mengizinkan `status='published'`, sehingga listing `sold`/`rented` tidak dapat diakses publik (melanggar SEO-Analytics-Specification-v1.1 §1.4, Functional Spec §4.3, PRD Modul 3 & 11 Business Rule). Diubah menjadi `status IN ('published','sold','rented')`. Modul terdampak: MP-03, memperkuat MP-11.
- **T1-03** (`0010_m05_events.sql`) — `events_manage` (FOR ALL) sebelumnya mengizinkan submitter mengubah kolom `status` tanpa batasan, memungkinkan Developer Partner mem-publish event miliknya sendiri tanpa approval Admin (bypass moderasi). Dipisah menjadi `events_insert_own`/`events_update_own` (submitter dibatasi status `pending_approval`/`cancelled`), `events_delete_own`, dan `events_manage_all` (transisi ke `published`/`rejected` eksklusif all-scope). **Catatan terbuka:** endpoint approve/reject API belum ada di API Specification — dilaporkan sebagai temuan terpisah, tidak ditambahkan pada rilis ini (di luar scope perbaikan RLS). Modul terdampak: MP-05.
- **T1-04** (`0007_m12_organization.sql`) — `org_invitations_insert` sebelumnya tidak memverifikasi bahwa `leader_id` yang diklaim benar-benar Leader aktif dari Organization terkait, memungkinkan siapa pun mengklaim jadi Leader Organization manapun saat insert undangan `leader_invite` (spoofing). `WITH CHECK` dibuat kondisional per `initiated_by_type`, `leader_invite` kini wajib verifikasi keanggotaan Leader aktif. Modul terdampak: MP-12.
- **T3-06** (`0008_m03_listing.sql`, satu pass dengan T1-02) — RLS child table `listing_photos_manage`/`listing_videos_manage`/`listing_amenities_manage` sebelumnya tidak konsisten dengan parent table `listings_update_own_or_org_leader`; Organization Leader bisa edit field utama listing anggotanya tapi tidak bisa kelola foto/video/amenity-nya. Ditambahkan klausa Organization Leader ke ketiga policy, pola sama `listings_update_own_or_org_leader`. Modul terdampak: MP-03, prasyarat teknis MP-12.

### Security
- T1-03 dan T1-04 masing-masing menutup celah **privilege escalation** (self-approval event, bypass moderasi Admin) dan **spoofing** (klaim palsu sebagai Leader Organization). Keduanya bug RLS di migration yang belum pernah dieksekusi ke database live — tidak ada dampak terhadap sistem produksi karena belum ada sistem produksi berjalan.

### Database Changes
- `0007_m12_organization.sql`: `org_invitations_insert` — `WITH CHECK` diubah dari `(agent_id=auth.uid() OR leader_id=auth.uid())` menjadi kondisional per `initiated_by_type` dengan verifikasi keanggotaan Leader aktif untuk `leader_invite`. Tidak ada perubahan tabel/kolom.
- `0008_m03_listing.sql`: `listings_select_public` — kondisi `status` diperluas dari `'published'` menjadi `IN ('published','sold','rented')`. `listing_photos_manage`, `listing_videos_manage`, `listing_amenities_manage` — ditambahkan klausa Organization Leader. Tidak ada perubahan tabel/kolom.
- `0009_m04_learning_center.sql`: `quiz_questions_manage`, `quiz_options_manage` — ditambahkan klausa ownership via join. `enrollments_own`, `quiz_attempts_own` — ditambahkan klausa Instructor di USING (WITH CHECK tidak berubah). Tidak ada perubahan tabel/kolom.
- `0010_m05_events.sql`: policy tunggal `events_manage` (FOR ALL) **dihapus**, digantikan 4 policy baru: `events_insert_own`, `events_update_own`, `events_delete_own`, `events_manage_all`. Tidak ada perubahan tabel/kolom.
- **Tidak ada perubahan pada `ERD-Skema-Database-...v1.3.md`** — seluruh perubahan di atas murni RLS policy, bukan struktur skema; ERD tidak perlu naik versi untuk rilis ini.

### API Changes
Tidak ada perubahan kontrak endpoint pada rilis ini. **Gap tercatat (belum dieksekusi):** endpoint approve/reject event (M05) direkomendasikan ditambahkan ke `API-Specification-...v1.2.md` pada siklus berikutnya — lihat T1-03 di atas.

### UI Changes
Tidak ada perubahan pada kategori ini di rilis ini — belum ada kode UI diimplementasikan.

### Dokumen Terkait yang Ikut Diperbarui (bukan versi CHANGELOG, dicatat untuk traceability)
- `ISSUE-REGISTER-Konsolidasi-FINAL.md` — T1-01, T1-02, T1-03, T1-04, T3-06 ditandai **Closed [2026-08-06]**.
- `MP-03-Listing-Module-Planning-v1_0.md`, `MP-04-LearningCenter-Module-Planning-v1_0.md`, `MP-05-KalenderEvent-Module-Planning-v1_0.md`, `MP-12-Organization-Module-Planning-v1_0.md`, `MP-11-SEOAnalytics-Module-Planning-v1_0.md` — status isu terkait di Bagian 45/46/51 diperbarui ke "Diperbaiki [2026-08-06]".
- `CURRENT-PROJECT-STATE.md` — snapshot diperbarui terpisah (lihat versi terbaru).

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
