# MODULE PLANNING
## MP-07 — Sistem Scoring DBR (Kalkulator KPR)
### Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 6 Agustus 2026
**Disusun sebagai:** CTO / Enterprise Architect / Solution Architect / Product Manager / Technical Product Owner / Engineering Manager / Technical Lead / Senior Backend Engineer / Senior Frontend Engineer / Senior QA Engineer / Senior Database Architect / DevOps Architect (peran gabungan)
**Tujuan Dokumen:** Acuan resmi implementasi Modul 7 (DBR Scoring) via Bolt.new maupun developer manual. Tidak berisi kode, tidak berisi UI mockup, tidak berisi sprint.

### Dokumen Acuan & Prioritas
| # | Dokumen | Versi Dipakai |
|---|---|---|
| 1 | Module Implementation Strategy (MIS) | v1.1 |
| 2 | Module Dependency Matrix (MDM) | v1.0 |
| 3 | Engineering Guidelines (`PROJECT-CONSTITUTION.md`) | — |
| 4 | Technical Specification | v1.0 |
| 5 | System Architecture | v1.6 |
| 6 | Technology Decisions | v1.5 |
| 7 | Database Schema (ERD §2.23-2.24 + migration `0011`) | ERD v1.3 |
| 8 | API Specification | v1.2 |
| 9 | Functional Specification | v1.0 |
| 10 | UI Specification | v1.0 |
| 11 | ERD | v1.3 |
| 12 | PRD | v1.2 |
| 13 | User Flow | v1.2 |
| *(tambahan)* | Authorization & Access Control Specification | v1.1 *(naik dari v1.0, audit Issue Register Batch 3, 6 Agustus 2026)* |
| *(tambahan)* | Entity Mapping | v1.0 |

---

## Riwayat Versi

> Tabel ini disusun retroaktif pada siklus konsolidasi ini (9 Agustus 2026) berdasarkan 2 snapshot yang tersedia — dokumen sebelumnya tidak memiliki tabel Riwayat Versi eksplisit.
>
> **⚠️ Konflik penomoran** (pola sama seperti MP-01/02/03/04/05/06): kedua snapshot berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026"** yang identik. Nomor versi publik **dipertahankan "1.0"** — identifier 1.0a/1.0b di bawah semata untuk audit. File final ini setara **1.0b**.

| Versi | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| 1.0a | 6 Agu 2026 | Rilis awal — 2 temuan minor housekeeping: (1) Authorization Spec §2.8 `View-DbrConfig` terlalu ketat (Manager/Admin `none`) dibanding API Spec+RLS (Public/seluruh authenticated), non-blocking; (2) kutipan salah nomor "§2.7" (seharusnya §2.8) di migration `0011` dan Technical Spec. |
| 1.0b | 6 Agu 2026 | Kedua temuan **Closed** (audit v1.1/**T4-13**, **T4-14**) — Authorization Spec §2.8 dikoreksi jadi seluruh role `all` untuk View; kutipan §2.7→§2.8 diperbaiki di migration & Technical Spec. **Versi terkini** — basis dokumen final di bawah. |

---

## ✅ Catatan Verifikasi Silang (9 Agustus 2026, siklus konsolidasi ini)

> Berbeda dari MP-04/MP-05/MP-06 (pola regresi 3 dari 3 kasus sebelumnya), **kedua klaim di modul ini diverifikasi TERBUKTI BENAR**:
> - **T4-13** — `Authorization-Access-Control-Specification-v1.1-FINAL.md` §2.8 dikonfirmasi memuat `View-DbrConfig` = seluruh role `all`, persis klaim.
> - **T4-14** — `0011_m07_dbr.sql` (project) dikonfirmasi memuat komentar `"Authorization Spec §2.8"` (bukan lagi §2.7).
>
> Keduanya juga tercatat eksplisit sebagai **Fixed** di `CHANGELOG-v0.7.1`/`v0.7.2`. **Pola regresi sistemik yang ditemukan di 3 modul sebelumnya TIDAK berlaku di sini** — modul ini benar-benar bersih sesuai klaimnya sendiri ("modul kedua paling bersih dari 7 MP terakhir, setelah MP-13").

---

# 1. Executive Summary

Modul 7 adalah kalkulator pre-screening kelayakan KPR (formula DBR/anuitas) — 2 entity (`dbr_simulations`, `dbr_config`), 6 REQ. Bergantung M01, M03 (opsional auto-fill harga), M09 (`dbr_config` — meski secara fisik tabelnya milik M07 sendiri, alur konfigurasinya melalui shell Admin Panel M09). Migration `0011` **sudah ditulis dan bersih dari gap keamanan** — berbeda dari 3 modul terakhir (M03/M04/M05), **tidak ditemukan Tier 1 baru di modul ini**: RLS `dbr_simulations_own` dan `dbr_config_manage` sudah konsisten penuh dengan Business Rule PRD (data finansial sensitif dibatasi ketat, threshold hanya Superadmin). Hanya ditemukan 2 isu dokumentasi minor (kutipan section Authorization Spec yang salah nomor, dan `dbr_config` View lebih longgar dari tercatat Authorization Spec — keduanya non-blocking). Go/No-Go: ✅ **GO** *(setelah M03+M09 selesai)*.

---

# 2. Purpose

Menyediakan spesifikasi implementasi lengkap Modul 7 — scope fungsional, kontrak API, aturan bisnis (khususnya kontrak data `tenor_months` dan enkripsi data finansial), matriks permission, dan kriteria selesai.

---

# 3. Scope

- Tabel `dbr_simulations`, `dbr_config` (ERD v1.3 §2.23-2.24) beserta RLS.
- Endpoint `POST /calculator/dbr`, `GET /calculator/dbr/config`, `POST /calculator/dbr/{id}/save-as-prospect`, `GET /agents/me/dbr-simulations`, `GET /admin/dbr-simulations`, `GET /calculator/dbr/{id}/export-pdf`, `PUT /admin/config/dbr` (API Spec §6).
- Layar: Kalkulator DBR (wizard/form interaktif), Daftar Prospek Saya.
- Kalkulasi formula anuitas + DBR% real-time (client-side re-render, server-side sumber kebenaran saat simpan).
- Export PDF hasil simulasi.
- Konfigurasi threshold DBR & suku bunga default (`dbr_config`, Superadmin-only).

---

# 4. Out of Scope

- **Integrasi API BI Checking/SLIK** — eksplisit "Opsional Fase 2" di PRD.
- **Shell Admin Panel tempat `dbr_config` diakses** — milik M09; M07 hanya menyediakan tabel & endpoint `PUT /admin/config/dbr`, UI kontainer Admin Panel-nya dibangun M09.
- **Auto-fill harga dari Detail Listing** — trigger UI berasal dari M03 (tombol "Cek Kelayakan KPR"); M07 hanya menerima `listing_id`/`property_price` sebagai parameter opsional.
- Pembuatan kode, wireframe visual, dan sprint breakdown.

---

# 5. Business Objective

Membantu agen melakukan kualifikasi awal (pre-screening) kemampuan bayar calon pembeli sebelum diajukan ke bank — mengurangi risiko pengajuan KPR ditolak di tahap lanjut karena DBR melebihi ambang batas perbankan.

---

# 6. Business Value

- Meningkatkan efisiensi proses closing — agen dapat menyaring prospek serius sejak awal.
- Export PDF mendukung agen melampirkan estimasi ke pengajuan bank.
- Riwayat prospek terpusat mendukung follow-up terstruktur.

---

# 7. Dependency Summary (Berdasarkan MDM)

| Arah | Isi |
|---|---|
| **Bergantung Pada** | **M01 (Agen), M03 (opsional, auto-fill harga), M09 (parameter global `dbr_config`)** — MDM Bagian 3, Technical Spec §M07. |
| **Dibutuhkan Oleh** | **M08** (agregasi dashboard: reminder prospek DBR) — MDM Dependency Matrix Bagian 3. |
| **Circular Dependency** | Tidak ditemukan. |

---

# 8. Module Position (Berdasarkan MIS)

| Dimensi MIS | Nilai |
|---|---|
| Kategori (MIS §2) | **Core Business** |
| Urutan Implementasi (MIS §3) | **#10 dari 13** |
| Layer (MIS §13) | **Layer 4 — Derived/Value-Added** |
| Prioritas (MIS §14) | **P2** |
| Batch Paralel (MIS §6) | **Batch 4** — bersama M11, M12 |
| Kompleksitas (MIS §11.2) | **Menengah** — "Formula finansial presisi (anuitas, DBR%), enkripsi data sensitif, kontrak data ketat (`tenor_months` wajib bulan — kesalahan satuan berdampak langsung ke keputusan finansial pengguna)" |
| Go/No-Go (MIS §15) | ✅ **GO** *(setelah M03+M09 selesai)* — "kontrak data kritis (tenor bulan), pastikan validasi Zod ketat sejak awal" |

---

# 9. Stakeholder

| Stakeholder | Kepentingan |
|---|---|
| Agen | Pengguna utama kalkulator |
| Superadmin | Pengelola threshold & suku bunga default |
| Calon pembeli (data disimpan, bukan aktor sistem) | Subjek data finansial sensitif |
| M08 | Konsumen data prospek untuk reminder |

---

# 10. Actor

| Actor | Peran |
|---|---|
| Agen | Create/View simulasi miliknya (`own`) |
| Superadmin | Manage `dbr_config` (satu-satunya yang bisa ubah threshold) |
| Manager, Admin | View seluruh simulasi (`all`, untuk audit/support) — **tidak** bisa ubah `dbr_config` |

---

# 11. User Story

| ID | Story | Sumber |
|---|---|---|
| US-M07-01 | Sebagai Agen, saya ingin input data calon pembeli dan dapat hasil DBR% instan, agar saya bisa pre-screening cepat. | REQ-M07-001, 003 |
| US-M07-02 | Sebagai Agen, saya ingin mengisi tenor dalam tahun (bukan bulan) untuk kenyamanan, tapi sistem tetap konsisten pakai bulan di balik layar. | REQ-M07-002 |
| US-M07-03 | Sebagai Agen, saya ingin lihat indikator Layak/Perlu Review/Tidak Layak, agar cepat menilai kelayakan. | REQ-M07-004 |
| US-M07-04 | Sebagai Agen, saya ingin ubah skenario (DP/tenor) dan lihat hasil real-time, agar bisa eksplorasi opsi. | REQ-M07-005 |
| US-M07-05 | Sebagai Agen, saya ingin simpan hasil sebagai prospek dan export PDF, agar bisa ditindaklanjuti & dilampirkan ke bank. | REQ-M07-005, 006 |
| US-M07-06 | Sebagai Superadmin, saya ingin mengatur threshold DBR & suku bunga default, agar sesuai kebijakan bank rekanan terkini. | Business Rule PRD |

---

# 12. Functional Requirement

| REQ ID | Requirement | Status Cakupan |
|---|---|---|
| REQ-M07-001 s.d. 006 | Seluruh requirement inti kalkulator DBR | In Scope |

---

# 13. Non Functional Requirement

| Kategori | Requirement | Sumber |
|---|---|---|
| **Kontrak satuan tenor** | `tenor_months` **selalu bulan** — API **tidak menerima** input satuan tahun dalam bentuk apa pun; konversi (tahun×12) wajib di client sebelum request | API Spec §6 (eksplisit, garis bawah "satu-satunya kontrak yang berlaku") |
| Kalkulasi real-time | Perubahan DP/tenor/suku bunga re-kalkulasi instan di UI (client-side), server sebagai sumber kebenaran saat simpan | User Flow §7 |
| Index riwayat | `idx_dbr_simulations_agent` (`agent_id, created_at`) | Migration `0011` |
| Response time | **Not Defined** | Open Issue |

---

# 14. Business Rule

Dari PRD Modul 7:

1. Threshold DBR & suku bunga default **hanya** Superadmin — Admin tidak punya akses ubah secara default, kecuali diberi izin eksplisit.
2. Data finansial calon pembeli (`net_income`, `existing_installments`) **wajib enkripsi**, akses dibatasi: Agen hanya lihat simulasi miliknya; Superadmin/Manager/Admin lihat semua (audit/support).
3. Hasil bersifat **estimasi**, bukan keputusan final bank — disclaimer wajib tampil di setiap hasil.

---

# 15. Workflow Summary

**Alur Kalkulator DBR (User Flow):** Buka "Kalkulator DBR" (dari Dashboard atau Detail Listing) → jika dari Listing: harga auto-terisi → isi data (penghasilan, cicilan berjalan, harga, DP, tenor [tahun di UI→konversi bulan], suku bunga [default dari config, dapat disesuaikan]) → "Hitung" → sistem hitung plafon, angsuran (anuitas), DBR% → tampilkan hasil + indikator (Layak/Perlu Review/Tidak Layak) + disclaimer → coba skenario lain? → Ya: ubah parameter → hitung ulang real-time (loop); Tidak: "Simpan sebagai Prospek" → isi kontak calon pembeli → tersimpan ke "Daftar Prospek Saya" → opsi "Export ke PDF".

---

# 16. Screen List

| Kode Layar | Nama | Template (UI Spec §6) | Prioritas Wireframe |
|---|---|---|---|
| SCR-M07-01 | Kalkulator DBR | E | ✅ Wireframe §5.2 |
| SCR-M07-02 | Daftar Prospek Saya | C | — |

---

# 17. Screen Detail

### SCR-M07-01 — Kalkulator DBR (`/calculator/dbr` atau `/dashboard/calculator`)
- **Template:** E.
- **Komponen:** `DbrCalculatorForm` (Smart — form + panel hasil real-time, efek count-up), `DbrEligibilityBadge` (Presentational — badge warna Layak/Perlu Review/Tidak Layak).
- **Input:** penghasilan bersih, cicilan berjalan, harga properti (auto/manual), DP, tenor (tampil tahun, kirim bulan), suku bunga (default dari config).
- **Output:** plafon, angsuran, DBR%, indikator kelayakan, disclaimer wajib.
- **Aksi:** "Hitung", "Simpan sebagai Prospek", "Export ke PDF".

### SCR-M07-02 — Daftar Prospek Saya (`/dashboard/prospects`)
- **Template:** C.
- **Konten:** riwayat simulasi (nama calon pembeli, tanggal, hasil DBR).
- **Aksi:** klik baris → detail/edit ulang parameter → hitung ulang.
- **State kosong:** CTA ke Kalkulator DBR.

---

# 18. Navigation Flow

```
/calculator/dbr (dari Dashboard atau Detail Listing dgn ?listing_id=)
     → isi form → "Hitung" → hasil + badge
          ├─ ubah parameter → hitung ulang (loop, tanpa reload)
          └─ "Simpan sebagai Prospek" → isi kontak → /dashboard/prospects
                → "Export ke PDF" → download

/dashboard/prospects → klik baris → detail/edit ulang → /calculator/dbr?prospect_id=
```
Sumber: User Flow §Modul 7; Functional Spec §4.7.

---

# 19. API Summary

| Endpoint | Fungsi |
|---|---|
| `POST /calculator/dbr` | Hitung simulasi (alias lama: `/calculator/kpr`) |
| `GET /calculator/dbr/config` | Ambil parameter aktif (Public) |
| `POST /calculator/dbr/{id}/save-as-prospect` | Simpan sebagai prospek |
| `GET /agents/me/dbr-simulations` | Riwayat milik sendiri |
| `GET /admin/dbr-simulations` | Riwayat seluruh agen (Superadmin/Manager/Admin) |
| `GET /calculator/dbr/{id}/export-pdf` | Export PDF |
| `PUT /admin/config/dbr` | Ubah threshold & suku bunga (Superadmin only) |

---

# 20. Endpoint Mapping

| Method | Endpoint | Auth (API Spec) | `granted_scope` |
|---|---|---|---|
| POST | `/calculator/dbr` | Agen | `own` (RLS `dbr_simulations_own`, WITH CHECK `agent_id=auth.uid()`) |
| GET | `/calculator/dbr/config` | **Public** | `all` — konsisten RLS `dbr_config_select` (`USING (true)`, seluruh authenticated) |
| POST | `/calculator/dbr/{id}/save-as-prospect` | Agen (pemilik) | `own` |
| GET | `/agents/me/dbr-simulations` | Agen | `own` |
| GET | `/admin/dbr-simulations` | Superadmin, Manager, Admin | `all` |
| GET | `/calculator/dbr/{id}/export-pdf` | Agen (pemilik) | `own` |
| PUT | `/admin/config/dbr` | **Superadmin only** | RLS `dbr_config_manage` (`auth_is_superadmin()`) — **konsisten penuh, tidak ada gap** |

---

# 21. Request Validation

| Endpoint | Field | Validasi |
|---|---|---|
| `POST /calculator/dbr` | `tenor_months` | Wajib **bulan**, SMALLINT — **API menolak satuan tahun dalam bentuk apa pun** (kontrak data kritis, wajib divalidasi Zod ketat) |
| | `net_income`, `existing_installments` | Wajib, DECIMAL — data sensitif, enkripsi at-rest |
| | `property_price`, `down_payment` | Wajib |
| | `interest_rate_annual` | Wajib, DECIMAL(5,2) |
| | `listing_id` | Opsional, FK `listings` |
| `PUT /admin/config/dbr` | `dbr_threshold_percent`, `default_interest_rate` | Wajib, DECIMAL(5,2) — **tidak ada CHECK range di skema** (mis. 0-100%) — Open Issue Bagian 46 |

---

# 22. Response Structure

Mengikuti envelope standar API Spec §0.2. Contoh (API Spec §6):
```json
{ "success": true, "data": { "loan_amount": 680000000, "monthly_installment": 6698421, "dbr_percent": 52.66, "eligibility_status": "tidak_layak", "threshold_used": 35, "disclaimer": "Hasil ini estimasi awal, bukan keputusan final bank." } }
```
`threshold_used` disertakan dalam response — transparansi angka threshold yang dipakai saat kalkulasi (penting jika threshold berubah setelah simulasi tersimpan).

---

# 23. Database Impact

| Aspek | Detail |
|---|---|
| Tabel baru | `dbr_simulations`, `dbr_config` |
| Index | `idx_dbr_simulations_agent` |
| Seed data | 1 baris `dbr_config` default (`35.00%`, `8.50%`) — sudah di-seed di migration `0011` |
| RLS | `dbr_simulations_own` (`FOR ALL`: pemilik + all-scope view, WITH CHECK insert hanya pemilik); `dbr_config_select` (semua authenticated, `true`); `dbr_config_manage` (UPDATE, Superadmin only) |
| Soft-delete | **Tidak berlaku** — bukan bagian 8 tabel wajib |
| Enkripsi | `net_income`, `existing_installments` — wajib at-rest (komentar eksplisit di migration `0011`) |

---

# 24. Entity Mapping

| ENT ID | Tipe | Tabel Fisik | REQ Terkait |
|---|---|---|---|
| `ENT-M07-DbrSimulation` | Root | `dbr_simulations` | REQ-M07-001..003, 005, 006 |
| `ENT-M07-DbrConfig` | Root (reference/config) | `dbr_config` | REQ-M07-004 |

---

# 25. Migration Requirement

| Item | Status |
|---|---|
| `0011_m07_dbr.sql` | **Sudah ditulis** — 2 tabel, RLS, seed 1 baris config |
| Prasyarat | `0001`, `0003` (`users`), `0008` (`listings`, untuk FK opsional) |
| Status eksekusi | **Belum dieksekusi** ke database live |
| **Kualitas RLS** | **Tidak ditemukan gap** — konsisten penuh dengan Business Rule PRD. Modul ini bersih dari Tier 1 baru, berbeda dari 3 modul sebelumnya (M03/M04/M05). |

---

# 26. Permission Matrix

Sumber: Authorization Spec §2.8:

| Permission ID | Entity | Aksi | Superadmin | Manager | Admin | Agent |
|---|---|---|---|---|---|---|
| `PERM-M07-Create/View/Export-DbrSimulation` | `ENT-M07-DbrSimulation` | C/V/Export | all | all | all | own |
| `PERM-M07-View-DbrConfig` | `ENT-M07-DbrConfig` | View | all | none | none | — |
| `PERM-M07-Manage-DbrConfig` | `ENT-M07-DbrConfig` | Manage | all | none | none | — |

> **Catatan minor:** Authorization Spec mencatat `View-DbrConfig` = Manager/Admin `none` — namun `GET /calculator/dbr/config` berlabel **Public** di API Spec, dan RLS `dbr_config_select` mengizinkan **seluruh** authenticated (bahkan lebih longgar dari sekadar Manager/Admin). Karena data yang diekspos (`dbr_threshold_percent`, `default_interest_rate`) **bukan** data sensitif (bukan PII, murni parameter kalkulasi yang memang perlu diketahui siapa pun yang memakai kalkulator), ketidaksesuaian ini **tidak berdampak keamanan** — dicatat sebagai isu dokumentasi minor (Bagian 51), bukan Tier 1.

---

# 27. Validation Matrix

| Field | Wajib? | Tipe | Aturan |
|---|---|---|---|
| `dbr_simulations.tenor_months` | Ya | SMALLINT | **Selalu bulan**, kontrak kritis |
| `dbr_simulations.eligibility_status` | Ya | Enum | `layak`\|`perlu_review`\|`tidak_layak` |
| `dbr_config.dbr_threshold_percent` | Ya (default 35.00) | DECIMAL(5,2) | Tidak ada CHECK range eksplisit |
| `dbr_config.default_interest_rate` | Ya (default 8.50) | DECIMAL(5,2) | Tidak ada CHECK range eksplisit |

---

# 28. Error Handling

| Skenario | HTTP Status | Sumber |
|---|---|---|
| Input `tenor_months` bukan bulan (mis. client lupa konversi, kirim `15` untuk 15 tahun) | **Tidak akan error validasi** — API menerima angka apa pun sebagai SMALLINT tanpa cara membedakan "15 bulan" vs "15 tahun yang lupa dikonversi" — **risiko silent error**, bukan hard rejection (Open Issue kritis, Bagian 45) |
| Non-Superadmin `PUT /admin/config/dbr` | 403 | RLS `dbr_config_manage` |
| Agen akses simulasi milik agen lain | 403/404 | RLS `dbr_simulations_own` |

---

# 29-31. Notification / Activity Log / Audit Trail

**Notification:** reminder prospek DBR terjadwal (Vercel Cron) — disebut MIS/AI-Context-Pack sebagai kandidat notifikasi M08, **tidak eksplisit REQ-M07-XXX**. **Activity Log:** perubahan `dbr_config` oleh Superadmin kemungkinan tercatat `audit_logs` (pola umum), tidak eksplisit diwajibkan REQ tersendiri.

---

# 32-33. External Integration / AI Capability

Tidak ada integrasi eksternal di Fase 1 (BI Checking/SLIK eksplisit Fase 2, Out of Scope). Tidak ada AI capability.

---

# 34. Performance Requirement

**Not Defined secara M07-spesifik** di luar index riwayat.

---

# 35. Security Requirement

1. `net_income`/`existing_installments` wajib enkripsi at-rest (PROJECT-CONSTITUTION §10 poin 1).
2. RLS `dbr_simulations_own` — Agen hanya lihat miliknya, all-scope untuk audit — **konsisten penuh** Business Rule PRD, tidak ada gap ditemukan.
3. Threshold hanya Superadmin — ditegakkan RLS `dbr_config_manage`.

---

# 36-38. Accessibility / Responsive / SEO Impact

**Not Defined secara M07-spesifik.** SEO: Kalkulator DBR **bukan** halaman publik SEO-target (hasil personal, CSR — konsisten SEO Spec §1.1 yang mengelompokkan "Kalkulator DBR (hasil personal)" sebagai CSR biasa, **bukan** salah satu 5 halaman wajib SSR/SSG).

---

# 39-41. Configuration / Environment Variable / Feature Flag

`dbr_config` **adalah** mekanisme konfigurasi modul ini sendiri (threshold, suku bunga) — bukan lewat `system_configs` generik. Tidak ada environment variable baru. Tidak ada feature flag formal.

---

# 42. Acceptance Criteria

Dari PRD Modul 7 (5 poin) — seluruhnya In Scope, lihat Bagian 15 untuk alur detail.

---

# 43. QA Test Scenario

| # | Skenario | Hasil Diharapkan |
|---|---|---|
| 1 | Agen input data lengkap, klik Hitung | DBR%, plafon, angsuran, indikator, disclaimer tampil |
| 2 | Agen ubah DP di tengah hasil | Re-kalkulasi real-time tanpa reload |
| 3 | Agen simpan sebagai Prospek | Tersimpan, muncul di Daftar Prospek Saya |
| 4 | Export PDF | File PDF ter-generate dengan hasil simulasi |
| 5 | Manager coba `PUT /admin/config/dbr` | 403 |
| 6 | Agen A akses simulasi Agen B via manipulasi ID | 403/404 |
| 7 | **Client mengirim `tenor_months: 15` yang sebenarnya dimaksud 15 tahun (lupa konversi)** | **Saat ini: diterima tanpa validasi, hasil kalkulasi salah total** (Open Issue Bagian 45) |

---

# 44. Edge Case

1. `interest_rate_annual` = 0 atau negatif — tidak ada CHECK constraint mencegah nilai tidak masuk akal, murni bergantung validasi Zod di service layer.
2. `dbr_config` diubah Superadmin **setelah** beberapa simulasi tersimpan — simulasi lama tetap menyimpan `eligibility_status` hasil kalkulasi saat itu (snapshot), tidak dihitung ulang retroaktif — perilaku wajar, dicatat untuk kejelasan.

---

# 45. Risk Analysis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| **Tidak ada validasi/guard untuk mendeteksi kesalahan satuan tenor (tahun terkirim sebagai bulan)** | **Kalkulasi finansial salah signifikan tanpa error terdeteksi** — DBR% yang dihasilkan bisa jauh dari realita, berdampak langsung ke keputusan bisnis pengguna (MIS §11.2 sudah menandai ini sebagai kompleksitas kritis modul) | Rekomendasi: tambah validasi masuk akal di service layer (mis. `tenor_months` biasanya 12-360 untuk KPR 1-30 tahun; nilai di luar rentang wajar → warning/konfirmasi tambahan), meski tidak mengubah skema |
| Tidak ada CHECK range untuk `dbr_threshold_percent`/`default_interest_rate` | Superadmin bisa tidak sengaja set threshold 500% atau suku bunga negatif | Validasi Zod di service layer sebelum `PUT /admin/config/dbr` |

---

# 46. Known Limitation

1. **Tidak ada guard validasi kewajaran `tenor_months`** — risiko kesalahan satuan tahun/bulan tidak terdeteksi otomatis.
2. **Tidak ada CHECK range** untuk parameter `dbr_config`.
3. **Ketidaksesuaian minor** Authorization Spec (`View-DbrConfig` Manager/Admin=`none`) vs API Spec+RLS (Public/semua authenticated) — non-blocking, data tidak sensitif.
4. ~~Kutipan section Authorization Spec salah nomor~~ — **✅ Diperbaiki [2026-08-06], audit v1.1/T4-14** — `0011_m07_dbr.sql` dan `Technical-Specification-...v1.0.md` dikoreksi "§2.7"→"§2.8".

---

# 47-50. Dependency Checklist / DoR / DoD / Traceability

**Dependency Checklist:** M01 ✅, M03 ✅ (opsional), M09 ✅ — seluruh dependency modul sudah punya MP.

**Definition of Ready:** PRD/ERD/Migration/Authorization Spec Baseline ✅. Tidak ada blocker Tier 1/2 — modul ini **paling siap** dari 6 MP terakhir yang diperiksa.

**Definition of Done:** tambahan khusus — Test QA #7 (validasi tenor) direkomendasikan sebagai gate kualitas meski bukan bug RLS/skema, karena dampaknya ke akurasi output finansial.

**Traceability:** 6 REQ-M07-XXX ↔ 2 ENT ↔ 7 endpoint ↔ 5 PERM-M07-XXX.

---

# 51. Conflict Analysis

| # | Konflik/Ambiguitas | Dokumen Terlibat | Resolusi |
|---|---|---|---|
| 1 | Authorization Spec §2.8 mencantumkan `PERM-M07-View-DbrConfig` = Manager/Admin `none` — namun `GET /calculator/dbr/config` berlabel **Public** di API Spec §6, dan RLS `dbr_config_select` (`USING (true)`) mengizinkan seluruh authenticated (lebih longgar bahkan dari sekadar Manager/Admin). | Authorization Spec v1.0 §2.8 vs API Spec v1.2 §6, migration `0011` | **Mengikuti API Spec + RLS** (2 sumber konkret sepakat) — data `dbr_config` bukan data sensitif/PII. **Status: ✅ Closed [2026-08-06], audit v1.1/T4-13** — `Authorization-Access-Control-Specification-v1.1.md` §2.8 dikoreksi (View-DbrConfig: seluruh role→`all`, Manage tetap Superadmin-only). |
| 2 | Migration `0011` dan Technical Specification §M07 sama-sama mengutip **"Authorization Spec §2.7"** sebagai rujukan permission `dbr_config` — namun §2.7 dokumen tsb sebenarnya adalah **Modul 6 (Direktori Developer)**, bukan Modul 7. Section yang benar untuk M07 adalah **§2.8**. | Migration `0011`, Technical Spec §M07 (kutipan salah nomor, kemungkinan menyalin dari satu sama lain) | **✅ Closed [2026-08-06], audit v1.1/T4-14** — 2 kutipan dikoreksi. |

**Catatan:** Modul ini adalah **modul kedua paling bersih** dari 7 MP terakhir (setelah MP-13) — RLS untuk data finansial sensitif (`dbr_simulations`) dan kontrol threshold (`dbr_config`) sudah sepenuhnya konsisten dengan Business Rule PRD sejak awal. Tidak ada temuan Tier 1/Tier 2 baru dari modul ini.

---

# 52. Recommendation

1. **Tambahkan validasi kewajaran `tenor_months`** di service layer (bukan ubah skema) — mitigasi risiko kesalahan satuan yang berdampak langsung ke akurasi keputusan finansial pengguna (Risiko #1, Bagian 45).
2. ~~Perbaiki 2 kutipan section salah nomor~~ — **✅ Selesai**.
3. **Tidak ada blocker teknis/keamanan untuk memulai implementasi** — modul ini siap dikerjakan begitu M03+M09 selesai sesuai urutan MIS.
4. **Update Issue Register konsolidasi** dengan 2 temuan minor (Tier 4) dari modul ini — tidak ada Tier 1/2/3 baru.
5. **Setelah M07 selesai**, lanjutkan ke M11 (SEO & Analytics) sesuai urutan MIS Bagian 3 urutan #11.

---

*Module Planning ini disusun murni berdasarkan dokumen yang diupload — tidak ada requirement yang diubah/ditambah/dihapus, tidak ada perubahan arsitektur/API/skema database. Modul ini menjadi bukti bahwa tidak seluruh migration memiliki gap — RLS `dbr_simulations`/`dbr_config` diverifikasi bersih dan konsisten penuh dengan Business Rule PRD.*
