# MODULE PLANNING
## MP-08 — Dashboard & Notifikasi
### Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 6 Agustus 2026
**Disusun sebagai:** CTO / Enterprise Architect / Solution Architect / Product Manager / Technical Product Owner / Engineering Manager / Technical Lead / Senior Backend Engineer / Senior Frontend Engineer / Senior QA Engineer / Senior Database Architect / DevOps Architect (peran gabungan)
**Tujuan Dokumen:** Acuan resmi implementasi Modul 8 (Dashboard & Notifikasi) via Bolt.new maupun developer manual. Tidak berisi kode, tidak berisi UI mockup, tidak berisi sprint.

### Dokumen Acuan & Prioritas
| # | Dokumen | Versi Dipakai |
|---|---|---|
| 1 | Module Implementation Strategy (MIS) | v1.1 |
| 2 | Module Dependency Matrix (MDM) | v1.0 |
| 3 | Engineering Guidelines (`PROJECT-CONSTITUTION.md`) | — |
| 4 | Technical Specification | v1.0 |
| 5 | System Architecture | v1.6 |
| 6 | Technology Decisions | v1.5 |
| 7 | Database Schema (ERD §2.25 + migration `0012`) | ERD v1.3 |
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
> **⚠️ Konflik penomoran** (pola sama seperti MP-01 s.d. MP-07): kedua snapshot berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026"** yang identik. Nomor versi publik **dipertahankan "1.0"** — identifier 1.0a/1.0b di bawah semata untuk audit. File final ini setara **1.0b**.

| Versi | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| 1.0a | 6 Agu 2026 | Rilis awal — 1 temuan: Authorization Spec §2.9 mencantumkan `View`/`Update-Notification` = `all` untuk Superadmin/Manager/Admin, padahal RLS `notifications_own` (migration `0012`) tidak memberi bypass sama sekali ke peran manapun — kasus di mana ketidaksesuaian justru menguntungkan keamanan (RLS lebih ketat), bukan celah. |
| 1.0b | 6 Agu 2026 | Temuan **Closed** (audit v1.1/**T4-16**) — Authorization Spec §2.9 dikoreksi, Superadmin/Manager/Admin: all→own, konsisten REQ-M08-005 dan perilaku RLS aktual. **Versi terkini** — basis dokumen final di bawah. |

---

## ✅ Catatan Verifikasi Silang (9 Agustus 2026, siklus konsolidasi ini)

> Melanjutkan pola bersih MP-07 (bukan pola regresi MP-04/05/06): klaim T4-16 diverifikasi terhadap `Authorization-Access-Control-Specification-v1.1-FINAL.md` §2.9 — **TERBUKTI BENAR**. Baris `PERM-M08-View-Notification` dan `PERM-M08-Update-Notification` dikonfirmasi memuat `own` untuk seluruh role (termasuk Superadmin/Manager/Admin), persis klaim MP-08.
>
> **Catatan arah temuan:** kasus ini kebalikan dari pola umum — dokumentasi versi lama (Authorization Spec v1.0) terlalu **longgar** dibanding implementasi RLS yang sudah benar sejak awal, bukan sebaliknya. Perbaikan T4-16 menyelaraskan dokumentasi ke perilaku RLS yang sudah aman, bukan menambal celah keamanan aktif.

---

# 1. Executive Summary

Modul 8 adalah **titik agregasi akhir** proyek — sink node MDM/MIS, tidak dibutuhkan modul manapun. Hanya **1 entity fisik** (`notifications`); Dashboard sendiri **tidak menyimpan data** — murni query agregasi read-only lintas M03, M04, M05, M07 (Technical Spec §M08, eksplisit: "Tidak menyimpan data sendiri"). Bergantung pada 5 modul (M03, M04, M05, M07, M10) — **rantai dependency terpanjang** dari seluruh MP yang sudah dibuat. Migration `0012` **sangat bersih**: RLS `notifications_own` **strictly** `user_id=auth.uid()` tanpa satu pun klausa bypass — bahkan Superadmin tidak dapat melihat notifikasi user lain lewat RLS, secara sempurna memenuhi REQ-M08-005 ("tanpa bocor lintas-scope"). **Tidak ditemukan Tier 1 baru** — modul kedua paling bersih setelah M07. Ditemukan 1 ketidaksesuaian dokumentasi minor (arah "lebih ketat", bukan celah). Go/No-Go: ✅ **GO** *(hanya setelah M03, M04, M05, M07 seluruhnya selesai)*.

---

# 2. Purpose

Menyediakan spesifikasi implementasi lengkap Modul 8 — scope fungsional, kontrak API, aturan bisnis privasi notifikasi, matriks permission, dan kriteria selesai — sebagai modul penutup yang mengagregasi seluruh modul data lain menjadi satu tampilan per role.

---

# 3. Scope

- Tabel `notifications` (ERD v1.3 §2.25) beserta RLS ketat.
- Endpoint `GET /notifications`, `PUT /notifications/{id}/read`, `PUT /notifications/read-all`, `POST /admin/notifications/push`, `GET /dashboard/summary` (API Spec §7).
- Layar: Dashboard Agen, Dashboard Admin, Pusat Notifikasi.
- Agregasi read-only lintas M03 (listing/lead), M04 (progress kursus), M05 (event ter-RSVP), M07 (prospek DBR).
- Cakupan data per role (global untuk Superadmin/Manager/Admin, own untuk Agen).

---

# 4. Out of Scope

- **Logic penulisan data sumber** (listing, kursus, event, simulasi DBR itu sendiri) — milik modul masing-masing; M08 murni **membaca**.
- **Mekanisme pengiriman notifikasi lintas-channel** (email via Resend, push) — infrastrukturnya (ADR-007) dan job pemicu (Vercel Cron/Trigger, ADR-006) sudah ditetapkan di tingkat arsitektur; M08 hanya **menulis baris `notifications`** dan menjadi **satu-satunya** service yang boleh menulis ke tabel ini (ADR-020, "tidak boleh ditulis langsung dari banyak tempat").
- **WA Business API** — eksplisit "opsional" di REQ-M08-003, tidak ada detail integrasi teknis di dokumen manapun yang diupload.
- Pembuatan kode, wireframe visual, dan sprint breakdown.

---

# 5. Business Objective

Menjadi **satu titik pantau** ringkas bagi setiap role — agen melihat performa & tugas mendatangnya sendiri, staf internal melihat kesehatan operasional platform secara global — tanpa perlu membuka modul satu-per-satu.

---

# 6. Business Value

- Mengurangi waktu yang dibutuhkan agen untuk memahami status kerja hariannya (listing, lead, kursus, event, prospek dalam satu layar).
- Notifikasi proaktif (listing akan expired, sertifikat terbit) meningkatkan engagement tanpa agen harus mengecek manual.
- Dashboard Admin mempercepat identifikasi antrean kerja (approval, moderasi) tanpa membuka tiap sub-menu.

---

# 7. Dependency Summary (Berdasarkan MDM)

| Arah | Isi |
|---|---|
| **Bergantung Pada** | **M03, M04, M05, M07, M10** — MDM Bagian 3, Technical Spec §M08: "Dependencies: M03, M04, M05, M07, M10 (cakupan data per role)". **Rantai dependency terpanjang dari seluruh 13 modul.** |
| **Dibutuhkan Oleh** | **Tidak ada** — MDM Bagian 4 (Dependency Graph): "M08 (Dashboard) dan M11 (SEO) adalah *sink node* — tidak ada modul lain yang bergantung pada keduanya." |
| **Circular Dependency** | Tidak ditemukan — murni satu arah masuk, tidak ada arah keluar. |

---

# 8. Module Position (Berdasarkan MIS)

| Dimensi MIS | Nilai |
|---|---|
| Kategori (MIS §2) | **Supporting** |
| Urutan Implementasi (MIS §3) | **#13 dari 13 — modul TERAKHIR** dalam urutan implementasi murni dependency (M12 secara nomor "berikutnya" tapi ditempatkan sebelum M08 di MIS karena alasan lain — lihat catatan) |
| Layer (MIS §13) | **Layer 5 — Aggregation** (satu-satunya modul di layer ini) |
| Prioritas (MIS §14) | **P3** |
| Batch Paralel (MIS §6) | **Batch 5** — sendirian, titik konvergensi akhir |
| Alasan Posisi (MIS §4) | "Sink node MDM — butuh M03, M04, M05, M07 **seluruhnya** selesai untuk agregasi bermakna. Membangun M08 lebih awal berarti membangun UI agregasi terhadap data yang belum ada (dummy data), risiko rework tinggi saat modul sumber berubah bentuk data." |
| Go/No-Go (MIS §15) | ✅ **GO** *(hanya setelah M03, M04, M05, M07 selesai)* — "sink node, mulai lebih awal = pasti rework" |

---

# 9. Stakeholder

| Stakeholder | Kepentingan |
|---|---|
| Agen | Konsumen utama Dashboard Agen & notifikasi personal |
| Superadmin, Manager, Admin | Konsumen Dashboard Admin (statistik global) |
| M03, M04, M05, M07 | Sumber data yang diagregasi (read-only) |
| M09 | Konsumen widget "redirect ke halaman kelola terkait" dari Dashboard Admin |

---

# 10. Actor

| Actor | Peran |
|---|---|
| Agen | Lihat Dashboard Agen (`own`), notifikasi personal |
| Superadmin, Manager, Admin | Lihat Dashboard Admin (`all`), kirim notifikasi broadcast manual |
| Sistem (job terjadwal) | Penulis otomatis `notifications` (reminder, status update) |

---

# 11. User Story

| ID | Story | Sumber |
|---|---|---|
| US-M08-01 | Sebagai Agen, saya ingin melihat ringkasan listing, lead, progress kursus, dan event mendatang di satu layar, agar saya tidak perlu buka banyak menu. | REQ-M08-001 |
| US-M08-02 | Sebagai Admin, saya ingin melihat statistik global (agen baru, listing pending, engagement), agar saya cepat tahu prioritas kerja. | REQ-M08-002 |
| US-M08-03 | Sebagai user, saya ingin menerima notifikasi in-app/email untuk hal penting (approval, reminder, listing expiring, sertifikat), agar saya tidak ketinggalan info. | REQ-M08-003 |
| US-M08-04 | Sebagai Agen, saya hanya ingin melihat data milik saya sendiri di dashboard, bukan data agen lain. | REQ-M08-004 |
| US-M08-05 | Sebagai user, saya ingin yakin notifikasi saya tidak bisa dilihat user lain, agar privasi saya terjaga. | REQ-M08-005 |

---

# 12. Functional Requirement

| REQ ID | Requirement | Status Cakupan |
|---|---|---|
| REQ-M08-001 s.d. 005 | Seluruh requirement inti dashboard & notifikasi | In Scope |

---

# 13. Non Functional Requirement

| Kategori | Requirement | Sumber |
|---|---|---|
| Isolasi privasi notifikasi | RLS `notifications_own` — **tanpa pengecualian role apa pun**, termasuk Superadmin | Migration `0012`, REQ-M08-005 |
| Index performa | `idx_notifications_user_unread` (`user_id, is_read, created_at DESC`) — dioptimalkan untuk query "notifikasi belum dibaca terbaru" | Migration `0012` |
| Response time | **Not Defined** | Open Issue |
| Sumber tunggal penulisan | Satu service notifikasi terpusat (ADR-020) — mencegah drift jika ditulis dari banyak titik kode berbeda | AI Context Pack §8, ADR-020 |

---

# 14. Business Rule

Dari PRD Modul 8 (**tidak ada bagian "Business Rules"/"Acceptance Criteria" bernama eksplisit** — pola sama seperti M09, dicatat sebagai gap struktur PRD di Bagian 46, bukan diasumsikan; aturan berikut diturunkan dari "Cakupan Data Dashboard per Role"):

1. Superadmin, Manager, Admin — cakupan **global**, setara dalam visibilitas (seluruh agen, listing, transaksi/simulasi).
2. Agen — hanya data **miliknya sendiri**.
3. Notifikasi **selalu personal per user** — tidak ada notifikasi lintas-scope yang bocor ke role tanpa akses terkait.

---

# 15. Workflow Summary

**Alur 8.1 — Agen (User Flow):** Login → landing Dashboard Agen → tampilkan ringkasan (listing aktif+status, lead 7/30 hari, progress kursus, event ter-RSVP mendatang, prospek DBR terbaru) → klik bell icon → daftar notifikasi (approval status, reminder event, listing expiring, sertifikat baru) → klik notifikasi → redirect ke modul terkait.

**Alur 8.2 — Admin (User Flow):** Login sebagai Admin → landing Dashboard Admin → tampilkan statistik (agen baru menunggu approval, listing pending review, engagement Learning Center, ringkasan proyek developer per agen) → klik widget → redirect ke halaman kelola terkait (mis. "Listing Pending" → moderasi M03).

---

# 16. Screen List

| Kode Layar | Nama | Template (UI Spec §6) | Prioritas Wireframe |
|---|---|---|---|
| SCR-M08-01 | Dashboard Agen | C | ✅ Wireframe §5.3 |
| SCR-M08-02 | Dashboard Admin | C (varian: statistik scope global) | — |
| SCR-M08-03 | Pusat Notifikasi | C (list sederhana, tanpa cards statistik) | — |

---

# 17. Screen Detail

### SCR-M08-01 — Dashboard Agen (`/dashboard`)
- Ringkasan: listing aktif & status, lead 7/30 hari terakhir, progress kursus, event mendatang (ter-RSVP), prospek DBR terbaru.
- Scope: **seluruhnya `own`**.

### SCR-M08-02 — Dashboard Admin (`/admin/dashboard`)
- Statistik: agen baru menunggu approval, listing pending review, engagement Learning Center, ringkasan proyek developer per agen.
- Scope: **`all`** (global).
- Aksi: klik widget → redirect halaman kelola terkait.

### SCR-M08-03 — Pusat Notifikasi (`/dashboard/notifications`)
- List sederhana, tanpa cards statistik — ditandai belum/sudah dibaca.
- State kosong: "Belum ada notifikasi".

---

# 18. Navigation Flow

```
Login → /dashboard (Agen) atau /admin/dashboard (Admin/Manager/Superadmin)
     ├─ klik bell icon → /dashboard/notifications → klik notifikasi → redirect modul terkait
     └─ (khusus Admin) klik widget statistik → redirect halaman kelola modul terkait (mis. /admin/listings)
```
Sumber: User Flow §8.1-8.2; Functional Spec §4.8.

---

# 19. API Summary

| Endpoint | Fungsi |
|---|---|
| `GET /notifications` | Daftar notifikasi milik user login |
| `PUT /notifications/{id}/read` | Tandai satu notifikasi dibaca |
| `PUT /notifications/read-all` | Tandai semua dibaca |
| `POST /admin/notifications/push` | Kirim notifikasi manual/broadcast (Superadmin/Manager/Admin; sistem juga dapat memicu otomatis) |
| `GET /dashboard/summary` | Ringkasan dashboard sesuai scope role — menggabungkan data listing, lead, event, kursus |

---

# 20. Endpoint Mapping

| Method | Endpoint | Auth (API Spec) | `granted_scope` |
|---|---|---|---|
| GET | `/notifications` | Authenticated | `own` — **RLS `notifications_own` tanpa bypass role apa pun**, lebih ketat dari Authorization Spec (lihat Bagian 51) |
| PUT | `/notifications/{id}/read`, `/read-all` | Authenticated (pemilik) | `own` |
| POST | `/admin/notifications/push` | Superadmin, Manager, Admin | `all` (menulis notifikasi ke user lain — via service role, bukan RLS `authenticated` biasa, konsisten pola satu service notifikasi terpusat ADR-020) |
| GET | `/dashboard/summary` | Authenticated | `own` (Agen) / `all` (Superadmin/Manager/Admin) — ditegakkan di **query aggregation layer**, bukan RLS tabel `notifications` (karena summary menggabungkan banyak sumber tabel lain) |

---

# 21. Request Validation

| Endpoint | Field | Validasi |
|---|---|---|
| `POST /admin/notifications/push` | `user_id`/target | Wajib — **mekanisme broadcast ke banyak user sekaligus tidak dirinci** (kirim ke 1 user, atau ada parameter "semua agen"/"role tertentu"?) — Open Issue Bagian 46 |
| `PUT /notifications/{id}/read` | — | RLS `notifications_own` menolak jika bukan milik sendiri |

---

# 22. Response Structure

Mengikuti envelope standar API Spec §0.2. `GET /dashboard/summary` menggabungkan data dari banyak sumber tabel — **struktur response gabungan tidak dirinci** dengan contoh JSON di API Specification (berbeda dari M01/M07 yang punya contoh eksplisit) — Open Issue.

---

# 23. Database Impact

| Aspek | Detail |
|---|---|
| Tabel baru | `notifications` (**satu-satunya** tabel fisik milik M08) |
| Index | `idx_notifications_user_unread` |
| RLS | `notifications_own` — `FOR ALL`, **strictly** `user_id = auth.uid()`, **tanpa** `OR auth_has_scope_all(...)` sama sekali — pola sama ketatnya dengan `agent_ai_connections` (M13), satu dari hanya 2 tabel di seluruh proyek dengan isolasi mutlak tanpa bypass |
| Soft-delete | **Tidak berlaku** — bukan bagian 8 tabel wajib |
| Dashboard | **Tidak punya tabel sendiri** — seluruhnya query agregasi read-only ke tabel modul lain (`listings`, `enrollments`, `event_registrations`, `dbr_simulations`, dst.) dengan RLS masing-masing tabel sumber yang sudah berlaku |

---

# 24. Entity Mapping

| ENT ID | Tipe | Tabel Fisik | REQ Terkait |
|---|---|---|---|
| `ENT-M08-Notification` | Root | `notifications` | REQ-M08-003, 005 |

---

# 25. Migration Requirement

| Item | Status |
|---|---|
| `0012_m08_notifications.sql` | **Sudah ditulis** — 1 tabel, RLS ketat |
| Prasyarat | `0001`, `0003` (`users`) |
| Status eksekusi | **Belum dieksekusi** ke database live |
| **Kualitas RLS** | **Tidak ditemukan gap** — isolasi privasi paling ketat di seluruh proyek bersama M13, konsisten sempurna dengan REQ-M08-005 |

---

# 26. Permission Matrix

Sumber: Authorization Spec §2.9:

| Permission ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer |
|---|---|---|---|---|---|---|---|---|---|
| `PERM-M08-View-Notification` | `ENT-M08-Notification` | View | **all** | **all** | **all** | own | own | own | own |
| `PERM-M08-Update-Notification` | `ENT-M08-Notification` | Update | **all** | **all** | **all** | own | own | own | own |

> **Ketidaksesuaian arah "lebih ketat":** Authorization Spec mencantumkan Superadmin/Manager/Admin = `all` untuk View-Notification (mengimplikasikan mereka dapat melihat notifikasi user lain) — namun RLS `notifications_own` migration `0012` **tidak memberi bypass kepada siapa pun**, termasuk Superadmin. **Ini adalah arah yang aman** (RLS lebih protektif, bukan lebih permisif) — konsisten dengan REQ-M08-005 yang eksplisit melarang kebocoran lintas-scope notifikasi personal. Kemungkinan "all" pada tabel Authorization Spec merujuk ke `GET /dashboard/summary` (statistik agregat, bukan notifikasi personal individual) yang tercampur dalam satu baris permission modul yang sama. Dicatat sebagai isu editorial non-blocking (Bagian 51).

---

# 27. Validation Matrix

| Field | Wajib? | Tipe | Aturan |
|---|---|---|---|
| `notifications.user_id` | Ya | UUID | FK `users`, penerima |
| `notifications.type` | Ya | Enum | 6 nilai: `approval_status`, `event_reminder`, `listing_expiring`, `certificate_issued`, `lead_new`, `lainnya` |
| `notifications.title`/`message` | Tidak (nullable secara skema) | VARCHAR/TEXT | Idealnya wajib diisi di service layer meski skema tidak memaksa |

---

# 28. Error Handling

| Skenario | HTTP Status | Sumber |
|---|---|---|
| User tandai notifikasi milik user lain sebagai dibaca | 403/404 | RLS `notifications_own` |
| `POST /admin/notifications/push` oleh Agen | 403 | Auth label API Spec |
| `GET /dashboard/summary` tanpa autentikasi | 401 | Standar |

---

# 29-31. Notification / Activity Log / Audit Trail

M08 **adalah** modul Notification itu sendiri — tidak relevan mendeskripsikan "notifikasi untuk M08". Activity log broadcast manual (`POST /admin/notifications/push`) kemungkinan tercatat `audit_logs`, tidak eksplisit diwajibkan REQ tersendiri.

---

# 32-33. External Integration / AI Capability

| Layanan | Fungsi |
|---|---|
| Resend + React Email | Channel email notifikasi (ADR-007) |
| WA Business API | **Opsional**, tidak ada detail integrasi teknis di dokumen sumber manapun |

Tidak ada AI capability.

---

# 34. Performance Requirement

Index `idx_notifications_user_unread` dioptimalkan untuk pola akses paling umum (badge unread count, list terbaru). `GET /dashboard/summary` berpotensi query mahal (agregasi lintas banyak tabel) — **tidak ada target response time eksplisit** atau strategi caching yang dirinci (Open Issue Bagian 46).

---

# 35. Security Requirement

1. **Isolasi mutlak** `notifications_own` — tanpa bypass, konsisten REQ-M08-005.
2. Penulisan `notifications` **hanya** lewat satu service terpusat (ADR-020) — mencegah drift/duplikasi logic notifikasi di banyak tempat kode.
3. `POST /admin/notifications/push` dibatasi role tertentu — mencegah spam broadcast oleh Agen.

---

# 36-38. Accessibility / Responsive / SEO Impact

**Not Defined secara M08-spesifik.** SEO: seluruh layar `(dashboard)`/`(admin)` — CSR, privat, tidak relevan SEO (konsisten pola modul lain).

---

# 39-41. Configuration / Environment Variable / Feature Flag

Tidak ada `system_configs` khusus M08. Tidak ada environment variable baru (memakai `RESEND_API_KEY` yang sudah didefinisikan global untuk M01/M08 bersama). Tidak ada feature flag formal.

---

# 42. Acceptance Criteria

**PRD Modul 8 tidak memiliki bagian "Acceptance Criteria" bernama eksplisit** — pola identik M09 (Bagian 14). Kriteria berikut disintesis dari Fitur + Cakupan Data Dashboard per Role:

- [ ] Agen melihat Dashboard dengan ringkasan 5 kategori data (listing, lead, kursus, event, DBR) — seluruhnya `own`.
- [ ] Superadmin/Manager/Admin melihat Dashboard dengan statistik global — seluruhnya `all`.
- [ ] User menerima notifikasi in-app untuk 5 tipe event (approval, reminder event, listing expiring, sertifikat, lead baru).
- [ ] User tidak pernah dapat melihat/menandai notifikasi milik user lain, terlepas dari role.

---

# 43. QA Test Scenario

| # | Skenario | Hasil Diharapkan |
|---|---|---|
| 1 | Agen buka Dashboard | Data yang tampil 100% miliknya sendiri |
| 2 | Admin buka Dashboard Admin | Data global seluruh agen |
| 3 | **Superadmin mencoba `GET /notifications` dengan asumsi bisa lihat notifikasi user lain** | **403/404 — tidak ada bypass**, sesuai RLS (test kritis, memverifikasi Bagian 26 tidak salah diimplementasikan mengikuti tabel Authorization Spec secara harfiah) |
| 4 | User tandai semua notifikasi dibaca | Seluruh baris miliknya `is_read=true`, tidak memengaruhi user lain |
| 5 | Admin broadcast notifikasi manual | Tersimpan sebagai baris `notifications` untuk target yang dituju |

---

# 44. Edge Case

1. `GET /dashboard/summary` dipanggil saat salah satu modul sumber (mis. M07) belum ada data sama sekali untuk agen tsb — **Not Defined** apakah widget kosong ditampilkan atau disembunyikan, meski Functional Spec §4.8 secara umum menyebutkan pola "state kosong" berlaku lintas modul.
2. Notifikasi dengan `related_entity_id` yang entity-nya sudah dihapus (mis. listing terkait dihapus) — klik notifikasi akan redirect ke halaman yang sudah tidak ada. **Not Defined** penanganan (redirect ke 404, atau notifikasi otomatis di-nonaktifkan link-nya).

---

# 45. Risk Analysis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Implementasi mengikuti tabel Authorization Spec secara harfiah (beri Superadmin bypass ke `notifications`) | Pelanggaran privasi — REQ-M08-005 eksplisit melarang | Wajib ikuti RLS (Bagian 26), tegaskan di code review |
| `GET /dashboard/summary` menjadi query mahal tanpa caching saat data bertambah besar | Dashboard lambat, UX buruk terutama untuk Admin (scope global) | Pertimbangkan caching/materialized view di masa depan — di luar cakupan keputusan skema saat ini |
| Notifikasi ditulis dari banyak titik kode berbeda (melanggar ADR-020) | Duplikasi/drift logic, sulit dipelihara | Tegakkan satu service notifikasi terpusat sejak awal implementasi |

---

# 46. Known Limitation

1. **PRD Modul 8 tidak memiliki bagian Business Rules/Acceptance Criteria terpisah** — pola sama M09.
2. **Mekanisme broadcast `POST /admin/notifications/push`** ke banyak user tidak dirinci.
3. **Struktur response `GET /dashboard/summary`** tidak dicontohkan.
4. **Tidak ada strategi caching** untuk dashboard agregasi yang berpotensi mahal secara query.
5. **Authorization Spec §2.9 lebih permisif dari RLS aktual** — non-blocking, arah aman (RLS lebih protektif).

---

# 47-50. Dependency Checklist / DoR / DoD / Traceability

**Dependency Checklist:** M03 ✅, M04 ✅, M05 ✅, M07 ✅, M10 ✅ — **seluruh 5 dependency sudah punya MP**, modul ini adalah yang terakhir dapat dimulai dari sisi kesiapan dependency.

**Definition of Ready:** PRD/ERD/Migration Baseline ✅. Tidak ada blocker Tier 1/2/3 dari modul ini sendiri — namun **secara transitif** bergantung penuh pada penyelesaian M03 (termasuk perbaikan T1-02) untuk data listing yang diagregasi akurat.

**Definition of Done:** tambahan khusus — Test QA #3 (isolasi Superadmin) wajib lolos sebagai gate privasi non-negotiable.

**Traceability:** 5 REQ-M08-XXX ↔ 1 ENT ↔ 5 endpoint ↔ 2 PERM-M08-XXX ↔ ADR-007, ADR-020.

---

# 51. Conflict Analysis

| # | Konflik/Ambiguitas | Dokumen Terlibat | Resolusi |
|---|---|---|---|
| 1 | Authorization Spec §2.9 mencantumkan `PERM-M08-View-Notification`/`Update-Notification` = **`all`** untuk Superadmin/Manager/Admin — namun RLS `notifications_own` (migration `0012`) **tidak memberi bypass kepada peran manapun**, seluruh akses murni `user_id=auth.uid()`. | Authorization Spec v1.0 §2.9 vs migration `0012`, REQ-M08-005 (PRD) | **Mengikuti RLS** (lebih ketat, dan **sesuai** REQ-M08-005). **Status: ✅ Closed [2026-08-06], audit v1.1/T4-16** — `Authorization-Access-Control-Specification-v1.1.md` §2.9 dikoreksi (View/Update-Notification, Superadmin/Manager/Admin: all→own). |

**Catatan:** Modul ini, bersama MP-07, adalah bukti bahwa mayoritas migration di proyek ini **berkualitas baik** — 3 dari 8 modul terakhir yang diperiksa (M07, M08, dan sebagian besar RLS M03/M05/M09 selain baris yang sudah teridentifikasi) tidak memiliki gap keamanan. Pola masalah terkonsentrasi di kasus-kasus spesifik yang sudah tercatat di Issue Register, bukan menyeluruh.

---

# 52. Recommendation

1. **Tegaskan eksplisit ke tim implementasi**: untuk entity `notifications`, **RLS adalah kebenaran, bukan Authorization Spec** — jangan tambahkan bypass Superadmin/Manager/Admin meski tabel dokumentasi menyiratkan `all` (Konflik #1, Risiko #1).
2. **Rinci mekanisme broadcast** `POST /admin/notifications/push` (target 1 user vs banyak user vs seluruh role) sebelum implementasi endpoint ini dimulai.
3. **Pertimbangkan strategi caching** untuk `GET /dashboard/summary` di iterasi mendatang jika volume data bertambah besar — tidak blocking untuk MVP.
4. **M08 adalah modul PALING TERAKHIR yang aman dimulai** — pastikan seluruh 5 modul dependency (M03 dengan T1-02 sudah diperbaiki, M04 dengan T1-01 sudah diperbaiki, M05 dengan T1-03 sudah diperbaiki, M07, M10) benar-benar solid sebelum mulai, sesuai prinsip MIS §5 (jalur kritis).
5. **Update Issue Register konsolidasi** dengan 1 temuan Tier 4 baru dari modul ini.
6. **Setelah M08 selesai**, lanjutkan ke M12 (Organization) sebagai **Module Planning terakhir** dari 13 modul — sesuai urutan MIS Bagian 3 urutan #12 (meski secara penomoran dibangun setelah M08 dalam konteks *perencanaan dokumen ini*, MIS menempatkan M12 di Batch 4 bersama M07/M11, sebelum M08 dari sisi urutan aplikasi murni — lihat MIS Bagian 3 untuk urutan definitif implementasi kode).

---

*Module Planning ini disusun murni berdasarkan dokumen yang diupload — tidak ada requirement yang diubah/ditambah/dihapus, tidak ada perubahan arsitektur/API/skema database. Modul ini mengonfirmasi bahwa isolasi privasi data personal (notifications, mirip agent_ai_connections di M13) adalah salah satu area yang paling matang implementasinya di seluruh proyek.*
