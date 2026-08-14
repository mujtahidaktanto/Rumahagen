# MODULE PLANNING
## MP-04 — Learning Center (Pelatihan Agen)
### Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 6 Agustus 2026
**Disusun sebagai:** CTO / Enterprise Architect / Solution Architect / Product Manager / Technical Product Owner / Engineering Manager / Technical Lead / Senior Backend Engineer / Senior Frontend Engineer / Senior QA Engineer / Senior Database Architect / DevOps Architect (peran gabungan)
**Tujuan Dokumen:** Acuan resmi implementasi Modul 4 (Learning Center) via Bolt.new maupun developer manual. Tidak berisi kode, tidak berisi UI mockup, tidak berisi sprint.

### Dokumen Acuan & Prioritas
| # | Dokumen | Versi Dipakai |
|---|---|---|
| 1 | Module Implementation Strategy (MIS) | v1.1 |
| 2 | Module Dependency Matrix (MDM) | v1.0 |
| 3 | Engineering Guidelines (`PROJECT-CONSTITUTION.md`) | — |
| 4 | Technical Specification | v1.0 |
| 5 | System Architecture | v1.6 |
| 6 | Technology Decisions | v1.5 |
| 7 | Database Schema (ERD §2.15-2.20 + migration `0009`) | ERD v1.3 |
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

> Tabel ini disusun retroaktif pada siklus konsolidasi ini (9 Agustus 2026) berdasarkan 3 snapshot yang tersedia — dokumen sebelumnya tidak memiliki tabel Riwayat Versi eksplisit.
>
> **⚠️ Konflik penomoran** (pola sama seperti MP-01/MP-02/MP-03): ketiga snapshot berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026"** yang identik, namun merepresentasikan 3 keadaan berbeda secara kronologis-progresif. Nomor versi publik **dipertahankan "1.0"** — identifier 1.0a/1.0b/1.0c di bawah semata untuk audit. File final ini setara **1.0c**.

| Versi | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| 1.0a | 6 Agu 2026 | Rilis awal — 3 Konflik terbuka: (1) RLS bank soal (`quiz_questions_manage`/`quiz_options_manage`) tidak mendukung ownership Instructor, ditandai "wajib diperbaiki"; (2) inkonsistensi internal PRD soal akses Manager ke Kelola Kursus (Business Rule vs Acceptance Criteria bertentangan), blocking, dieskalasi ke Owner; (3) RLS Enrollment/QuizAttempt tidak mendukung Instructor melihat progress peserta. |
| 1.0b | 6 Agu 2026 | Konflik #1 **Diperbaiki** — klausa ownership via quiz→course ditambahkan ke migration `0009`. Konflik #2 **Resolved** (**OD-16 Opsi A**) — Manager akses Full, PRD Acceptance Criteria Modul 4 direvisi. Konflik #3 **Diperbaiki** — klausa Instructor via `course.created_by` ditambahkan ke `enrollments_own`/`quiz_attempts_own`. |
| 1.0c | 6 Agu 2026 | Referensi tabel Dokumen Acuan diperbarui — Authorization Spec naik ke v1.1 (audit Issue Register Batch 3). **Versi terkini** — basis dokumen final di bawah. |

---

## 🟢 Catatan Verifikasi Silang (ditambahkan & diselesaikan 9 Agustus 2026, siklus konsolidasi ini)

> **TEMUAN TERKONFIRMASI — dokumentasi tidak cocok dengan migration aktual.** Dokumen ini (di bagian Konflik #1 dan #3, lihat §45 Risk Analysis, §46 Known Limitation, §51 Conflict Analysis di bawah) mengklaim status **"✅ Diperbaiki [2026-08-06]"** untuk RLS `quiz_questions_manage`/`quiz_options_manage` (Konflik #1) dan `enrollments_own`/`quiz_attempts_own` (Konflik #3), dengan rujukan *"lihat `0009_m04_learning_center.sql` versi terbaru"*.
>
> **Verifikasi terhadap `0009_m04_learning_center (1).sql` yang diupload Owner (9 Agustus 2026) membuktikan klausa perbaikan yang diklaim TIDAK ADA di file tersebut** — kedua policy `quiz_questions_manage`/`quiz_options_manage` masih persis seperti versi 1.0a (hanya `auth_has_scope_all('M04_learning','manage')`, tanpa klausa ownership join), dan `enrollments_own`/`quiz_attempts_own` masih tanpa klausa akses Instructor.
>
> **Dikonfirmasi Owner (9 Agustus 2026): file yang diupload memang versi terbaru — artinya perbaikan yang diklaim dokumen ini BELUM PERNAH benar-benar dieksekusi ke migration**, meski status di dokumen sudah menyatakan "Diperbaiki". Klaim asli di bawah **TIDAK saya ubah/hapus** (transparansi EAF §8.3).
>
> **✅ DIPERBAIKI [2026-08-09]** — atas instruksi Owner, keempat policy (`quiz_questions_manage`, `quiz_options_manage`, `enrollments_own`, `quiz_attempts_own`) sekarang benar-benar diperbaiki di `0009_m04_learning_center-FIXED.sql`, persis mengikuti spesifikasi klausa yang sudah dirumuskan di §51 Conflict Analysis dokumen ini sendiri. **Status Konflik #1 dan #3 sekarang benar-benar Resolved** — bukan lagi klaim tak terverifikasi. File migration terbaru harus menggantikan `0009_m04_learning_center.sql` sebelum eksekusi ke database (migration masih belum dieksekusi ke live per §25).

---

# 1. Executive Summary

Modul 4 (Learning Center) adalah portal edukasi gratis agen — 8 entity (`courses`, `course_lessons`, `quizzes`, `quiz_questions`, `quiz_options`, `enrollments`, `quiz_attempts`, `certificates`), self-enroll tanpa approval, sertifikat otomatis via passing grade. Bergantung **hanya M01** (MDM), berada di MIS Batch 2 (paralel dengan M02/M06/M13). Migration `0009` **sudah ditulis lengkap**. Ditemukan **gap RLS signifikan**: PRD, Authorization Spec, dan User Flow tiga-tiganya sepakat Instructor berwenang "kelola bank soal" (quiz questions/options) untuk kursus miliknya, namun RLS aktual `quiz_questions_manage`/`quiz_options_manage` **hanya** mengizinkan `all`-scope — tidak ada klausa kepemilikan seperti tabel `courses`/`quizzes` lainnya (lihat Bagian 51). Go/No-Go: ✅ **GO**.

---

# 2. Purpose

Menyediakan spesifikasi implementasi lengkap Modul 4 sebagai rujukan tunggal — scope fungsional, kontrak API, aturan bisnis, matriks permission, kriteria selesai — termasuk resolusi gap RLS Instructor yang ditemukan lewat pemeriksaan silang migration.

---

# 3. Scope

- Tabel `courses`, `course_lessons`, `quizzes`, `quiz_questions`, `quiz_options`, `enrollments`, `quiz_attempts`, `certificates` (ERD v1.3 §2.15-2.20) beserta RLS.
- Endpoint CRUD `/admin/courses`, `POST /courses/{id}/enroll`, `POST /courses/{id}/quiz/submit`, `GET /agents/me/certificates` (Technical Spec §M04).
- Layar: Katalog Kursus, Detail Kursus & Enroll, Player Materi & Kuis, Sertifikat Saya, Kelola Kursus (UI Spec §6).
- Generate sertifikat digital otomatis (PDF) saat passing grade tercapai.
- Prasyarat antar-kursus (`prerequisite_course_id`).
- Progress tracking per agen.

---

# 4. Out of Scope

- **Jadwal kelas live/webinar** — terhubung ke M05 (Kalender Event); M04 hanya memicu, tidak memiliki entity `events`.
- **Sinkronisasi badge ke Profil Agen** — M02 yang **membaca** relasi `certificates`, M04 tidak menulis ke `agent_profiles`.
- **Leaderboard/gamifikasi** — eksplisit "opsional, fase 2" di PRD.
- **Generate file PDF sertifikat secara teknis** (styling/template PDF) — hanya kolom `certificate_url` yang dicakup skema; mekanisme generate PDF spesifik (library, storage) **tidak dirinci** di dokumen sumber manapun (Bagian 46).
- Pembuatan kode, wireframe visual, dan sprint breakdown.

---

# 5. Business Objective

Meningkatkan kompetensi agen (product knowledge, teknik closing, legal properti, literasi KPR) lewat portal edukasi gratis dan terstandardisasi, dengan sertifikasi otomatis yang meningkatkan kredibilitas agen di mata calon pembeli (lewat badge di profil).

---

# 6. Business Value

- Mengurangi biaya pelatihan tatap muka — konten dapat diakses ulang kapan saja.
- Sertifikat otomatis meningkatkan kredibilitas agen tanpa proses manual penerbitan.
- Instructor sebagai role formal terpisah mengurangi beban Admin dalam mengelola konten edukasi harian.

---

# 7. Dependency Summary (Berdasarkan MDM)

| Arah | Isi |
|---|---|
| **Bergantung Pada** | **M01 (Auth)** saja — MDM Bagian 3, Bagian 2 (M04): "Bergantung Pada: M01 (Agen/Instructor)". |
| **Dibutuhkan Oleh** | **M02** (badge, read-only relasi `certificates`), **M05** (kelas live, arah M05→M04 satu arah) — MDM Dependency Matrix Bagian 3. |
| **Circular Dependency** | Tidak ditemukan — arah M02→M04 murni baca (MDM Bagian 11, konsisten temuan MP-02). |

---

# 8. Module Position (Berdasarkan MIS)

| Dimensi MIS | Nilai |
|---|---|
| Kategori (MIS §2) | **Supporting** |
| Urutan Implementasi (MIS §3) | **#6 dari 13** |
| Layer (MIS §13) | **Layer 2 — Core Domain (independen satu sama lain)** |
| Prioritas (MIS §14) | **P2** |
| Batch Paralel (MIS §6) | **Batch 2** — bersama M02, M06, M13 |
| Alasan Posisi (MIS §4) | "Independen (Layer 2), tidak diperlukan modul manapun sebelum M05 — aman dibangun di titik manapun sebelum M05, ditempatkan di sini untuk isi jeda sebelum M03 (modul terberat) dimulai." |
| Go/No-Go (MIS §15) | ✅ **GO** — "Baseline, independen" |

---

# 9. Stakeholder

| Stakeholder | Kepentingan |
|---|---|
| Superadmin, Admin, Manager | Pengelola konten (Manager: hak penuh tapi tidak wajib aktif harian) |
| Instructor | Pengelola konten kursus miliknya |
| Agen | Peserta kursus (self-enroll) |
| M02 | Konsumen `certificates` untuk badge profil |
| M05 | Sumber pemicu jadwal kelas live |

---

# 10. Actor

| Actor | Peran |
|---|---|
| Superadmin, Admin | CRUD penuh seluruh kursus (`all`) |
| Manager | Akses penuh (`all`, mengikuti hak Admin) — tidak wajib aktif harian |
| Instructor | CRUD kursus **miliknya sendiri** (`own`, via `created_by`) |
| Agen | Self-enroll, kerjakan kuis, lihat sertifikat sendiri |

---

# 11. User Story

| ID | Story | Sumber |
|---|---|---|
| US-M04-01 | Sebagai Agen, saya ingin melihat katalog kursus per kategori, agar saya bisa memilih sesuai kebutuhan. | REQ-M04-001 |
| US-M04-02 | Sebagai Agen, saya ingin mendaftar kursus gratis tanpa approval, agar saya bisa langsung belajar. | REQ-M04-002 |
| US-M04-03 | Sebagai Agen, saya ingin mengakses video/PDF/kuis, agar saya bisa belajar dan diuji pemahamannya. | REQ-M04-003 |
| US-M04-04 | Sebagai Agen, saya ingin sertifikat otomatis terbit setelah lulus, agar saya punya bukti kompetensi. | REQ-M04-004 |
| US-M04-05 | Sebagai Agen, saya ingin progress belajar saya tersimpan, agar saya bisa lanjut kapan saja. | REQ-M04-005 |
| US-M04-06 | Sebagai Instructor, saya ingin mengelola kursus milik saya (termasuk bank soal), agar saya bisa memperbarui konten edukasi. | REQ-M04-006 |

---

# 12. Functional Requirement

| REQ ID | Requirement | Status Cakupan |
|---|---|---|
| REQ-M04-001 | Katalog kursus dengan kategori | In Scope |
| REQ-M04-002 | Self-enroll tanpa approval | In Scope |
| REQ-M04-003 | Konten kursus (video, PDF/slide, kuis) | In Scope |
| REQ-M04-004 | Sertifikat digital otomatis | In Scope (kolom URL; generate PDF teknis Out of Scope, Bagian 4) |
| REQ-M04-005 | Progress tracking | In Scope |
| REQ-M04-006 | Pengelolaan konten oleh Superadmin/Admin/Instructor | **In Scope dengan catatan** — kelola bank soal oleh Instructor secara RLS **belum berfungsi** (Bagian 51) |

---

# 13. Non Functional Requirement

| Kategori | Requirement | Sumber |
|---|---|---|
| Passing grade default | 70 (configurable per kursus, `passing_grade` kolom, bukan `system_configs` global) | ERD v1.3 §2.15 |
| Sertifikat unik | UNIQUE `(agent_id, course_id)` — 1 sertifikat per agen per kursus | Migration `0009` |
| Enrollment unik | UNIQUE `(agent_id, course_id)` — tidak bisa enroll ganda | Migration `0009` |
| Response time | **Not Defined** | Open Issue |

---

# 14. Business Rule

Dari PRD Modul 4:

1. Sertifikat hanya terbit jika skor kuis **≥ passing grade** (dikonfigurasi per kursus).
2. Kursus dapat memiliki **prasyarat** (harus lulus kursus A dulu sebelum kursus B) — **opsional**.
3. Sertifikat & badge otomatis sinkron ke Profil Agen (M02).
4. Pengelolaan konten kursus (buat, edit, nonaktifkan, **kelola bank soal**) hanya dapat dilakukan **Superadmin, Admin, Instructor**; **Manager** memiliki akses Full namun tidak wajib aktif mengelola harian (dapat didelegasikan ke Instructor); **Agen** hanya dapat self-enroll & mengerjakan kursus.

---

# 15. Workflow Summary

**Alur 4.1 — Agen Mengikuti Kursus (User Flow):** Login → buka "Learning Center" → lihat katalog (filter kategori) → pilih kursus → lihat detail (silabus, durasi, prasyarat) → jika ada prasyarat belum lulus → tombol "Daftar" nonaktif; jika tidak/terpenuhi → "Daftar Gratis" → langsung terdaftar (tanpa approval) → akses materi (berurutan/bebas) → progress tersimpan otomatis → selesai semua materi → buka Kuis Evaluasi → submit → skor < passing grade → "Ulangi Kuis"; skor ≥ passing grade → generate Sertifikat Digital (PDF) → sertifikat & badge otomatis muncul di Profil Agen (M02) → unduh sertifikat/lanjut kursus berikutnya.

**Alur 4.2 — Instruktur/Admin Kelola Konten (User Flow):** Login sebagai Admin/Instruktur → buka "Kelola Learning Center" → Buat Kursus Baru/Edit Existing → isi metadata (judul, kategori, deskripsi, prasyarat) → upload materi per sesi → buat **bank soal kuis** + tentukan passing grade → jika kursus punya sesi live → buat jadwal → otomatis muncul di Kalender Event (M05).

---

# 16. Screen List

| Kode Layar | Nama | Template (UI Spec §6) | Aktor |
|---|---|---|---|
| SCR-M04-01 | Katalog Kursus | A | Agen |
| SCR-M04-02 | Detail Kursus & Enroll | B | Agen |
| SCR-M04-03 | Player Materi & Kuis | C (varian: sidebar=daftar lesson) | Agen |
| SCR-M04-04 | Sertifikat Saya | C (grid kartu sertifikat) | Agen |
| SCR-M04-05 | Kelola Kursus | F | Instructor (miliknya), Admin, Manager, Superadmin |

---

# 17. Screen Detail

### SCR-M04-01 — Katalog Kursus (`/learning-center`)
- **Template:** A. Input filter: Kategori.

### SCR-M04-02 — Detail Kursus & Enroll (`/learning-center/[slug]`)
- **Template:** B. Konten: deskripsi, silabus, estimasi durasi.
- **Aksi:** "Daftar Kursus" (self-enroll, REQ-M04-002).
- **Output:** sudah enroll → tombol "Lanjutkan Belajar".

### SCR-M04-03 — Player Materi & Kuis (`/learning-center/[slug]/learn`)
- **Template:** C (varian sidebar daftar lesson).
- **Aksi:** "Tandai Selesai" per lesson, "Mulai Kuis", jawab, "Submit Kuis".
- **Output:** ≥ passing grade → sertifikat otomatis; < passing grade → "Ulangi Kuis".

### SCR-M04-04 — Sertifikat Saya (`/dashboard/certificates`)
- **Template:** C (grid kartu, bukan tabel).
- **State kosong:** belum ada sertifikat → CTA ke Katalog Kursus.

### SCR-M04-05 — Kelola Kursus (`/admin/courses`)
- **Template:** F.
- **Aktor:** Instructor (kursus miliknya, `created_by`), Admin/Manager/Superadmin (`all`).
- **Catatan implementasi kritis:** UI untuk "kelola bank soal" **wajib** ditampilkan ke Instructor sesuai PRD/User Flow, namun backend saat ini (RLS) akan menolaknya (403) untuk aksi Create/Update/Delete pada `quiz_questions`/`quiz_options` — **wajib diperbaiki sebelum layar ini dianggap selesai untuk Instructor** (Bagian 51 Konflik #1).

---

# 18. Navigation Flow

```
/learning-center (katalog) → /learning-center/[slug] (detail)
     ├─ prasyarat belum lulus → tombol nonaktif, info prasyarat
     └─ "Daftar Gratis" → enrollment tercatat → /learning-center/[slug]/learn
             → per lesson "Tandai Selesai" → progress_percent naik
             → seluruh lesson selesai → "Mulai Kuis" → submit
                   ├─ < passing grade → "Ulangi Kuis" (kembali ke kuis)
                   └─ ≥ passing grade → certificate generated → /dashboard/certificates

(admin)/courses → "Buat/Edit Kursus" → metadata + lesson + bank soal + passing grade
     → (jika sesi live) → trigger create event (M05)
```
Sumber: User Flow Modul 4; Functional Spec §4.4.

---

# 19. API Summary

| Endpoint | Fungsi |
|---|---|
| `GET /courses` (implisit, katalog) | Daftar kursus published |
| `GET /courses/{slug}` (implisit) | Detail kursus |
| `POST /courses/{id}/enroll` | Self-enroll |
| `POST /courses/{id}/quiz/submit` | Submit kuis |
| `GET /agents/me/certificates` | Daftar sertifikat milik sendiri |
| CRUD `/admin/courses` | Kelola kursus, lesson, quiz, bank soal (Instructor `own`, Admin+ `all`) |

> **Catatan:** Technical Specification §M04 menyebut "CRUD `/admin/courses`" secara ringkas tanpa merinci sub-path persis untuk lesson/quiz/question/option (mis. apakah `PUT /admin/courses/{id}` mencakup nested update lesson+quiz sekaligus, atau ada endpoint terpisah `/admin/courses/{id}/lessons`, dll.) — **Not Defined** granularitas endpoint persisnya, Authorization Spec §2.5 hanya mencantumkan `PUT /admin/courses/{id}` sebagai Endpoint Penegak untuk seluruh sub-entity (lesson/quiz/question/option), mengindikasikan **nested update dalam satu request**, namun tidak eksplisit dikonfirmasi di API Specification (Bagian 46).

---

# 20. Endpoint Mapping

| Method | Endpoint | Auth | `module_code`/`action_code` | `granted_scope` |
|---|---|---|---|---|
| GET | Katalog/detail kursus | Public/Authenticated (`status='published'` via RLS) | `M04_learning` / `view` | `all` (publik terbatas ke published) |
| POST | `/courses/{id}/enroll` | Agen | `M04_learning` / `create` (`PERM-M04-Create-Enrollment`) | `own` |
| POST | `/courses/{id}/quiz/submit` | Agen | `M04_learning` / `create` (`PERM-M04-Create-QuizAttempt`) | `own` |
| GET | `/agents/me/certificates` | Agen | `M04_learning` / `view` (`PERM-M04-View-Certificate`) | `own` |
| POST/PUT | `/admin/courses` (course, lesson, quiz) | Instructor, Admin, Manager, Superadmin | `M04_learning` / `create`\|`update` | `own` (Instructor, via `created_by`), `all` (Admin+) |
| POST/PUT | `/admin/courses/{id}` — **bank soal (quiz_questions/quiz_options)** | Admin, Manager, Superadmin **saja** (RLS aktual) | `M04_learning` / `create`\|`update` | **`all` saja** — Instructor **ditolak** meski dokumentasi (PRD/Auth Spec) menyatakan `own` (Bagian 51 Konflik #1) |

---

# 21. Request Validation

| Endpoint | Field | Validasi |
|---|---|---|
| Create/Update course | `category` | Enum 5 nilai |
| | `passing_grade` | Default 70, SMALLINT — **range validasi (0-100) tidak eksplisit di CHECK constraint**, hanya tipe data (Open Issue) |
| | `prerequisite_course_id` | FK opsional ke `courses.id` — **tidak ada pencegahan circular reference** (Kursus A prasyarat B, B prasyarat A) di skema (Open Issue Bagian 46) |
| Quiz submit | `answers` | Struktur request tidak dirinci di dokumen sumber — Open Issue |
| Enroll | — | RLS `enrollments_own`: `agent_id = auth.uid()`; UNIQUE mencegah double-enroll |

---

# 22. Response Structure

Mengikuti envelope standar API Spec §0.2. Tidak ada struktur khusus M04 dirinci di API Specification untuk endpoint kursus (Technical Spec hanya mendaftarkan API Kunci tanpa contoh payload, berbeda dari M01/M07 yang punya contoh JSON eksplisit) — Open Issue.

---

# 23. Database Impact

| Aspek | Detail |
|---|---|
| Tabel baru | `courses`, `course_lessons`, `quizzes`, `quiz_questions`, `quiz_options`, `enrollments`, `quiz_attempts`, `certificates` (8 tabel) |
| RLS | `courses_select_published`/`courses_manage_own` (ownership via `created_by`); `course_lessons_select`/`_manage` (ownership via join ke `courses`); `quizzes_select` (`true`, publik)/`quizzes_manage` (ownership via join); **`quiz_questions_manage`/`quiz_options_manage` (HANYA `all`-scope, tidak ada ownership join — lihat Bagian 51)**; `enrollments_own`; `quiz_attempts_own` (ownership via join ke `enrollments`); `certificates_select` (publik, `true` — "badge tampil publik di profil agen") |
| Soft-delete | **Hanya `courses`** termasuk 8 tabel wajib soft-delete; 7 tabel anak lainnya **tidak** |
| Trigger | `trg_courses_updated_at` |
| FK self-referential | `courses.prerequisite_course_id → courses.id` (ON DELETE SET NULL) |

---

# 24. Entity Mapping

| ENT ID | Tipe | Tabel Fisik | REQ Terkait |
|---|---|---|---|
| `ENT-M04-Course` | Root | `courses` | REQ-M04-001..003, 006 |
| `ENT-M04-CourseLesson` | Child of Course | `course_lessons` | REQ-M04-003 |
| `ENT-M04-Quiz` | Child of Course | `quizzes` | REQ-M04-003, 004 |
| `ENT-M04-QuizQuestion` | Child of Quiz | `quiz_questions` | REQ-M04-003 |
| `ENT-M04-QuizOption` | Child of QuizQuestion | `quiz_options` | REQ-M04-003 |
| `ENT-M04-Enrollment` | Association (User × Course) | `enrollments` | REQ-M04-002, 005 |
| `ENT-M04-QuizAttempt` | Child of Enrollment | `quiz_attempts` | REQ-M04-004 |
| `ENT-M04-Certificate` | Association (User × Course) | `certificates` | REQ-M04-004 |

---

# 25. Migration Requirement

| Item | Status |
|---|---|
| `0009_m04_learning_center.sql` | **Sudah ditulis** — 8 tabel + RLS |
| Prasyarat | `0001`, `0003` (`users`) |
| Status eksekusi | **Belum dieksekusi** ke database live |
| **Temuan teknis (bukan late-binding by-design, melainkan gap)** | RLS `quiz_questions_manage`/`quiz_options_manage` **tidak konsisten** dengan pola ownership-check yang dipakai `courses_manage_own`/`course_lessons_manage`/`quizzes_manage` — 3 policy terakhir memakai `created_by = auth.uid()` atau join ke `courses.created_by`, sedangkan 2 policy pertama **tidak**. Direkomendasikan diperbaiki sebelum eksekusi migration ke production (Bagian 51). |

---

# 26. Permission Matrix

Sumber: Authorization Spec §2.5 — **disandingkan RLS aktual**:

| Entity | Aksi | Instructor (Authorization Spec) | Instructor (RLS Aktual) | Status |
|---|---|---|---|---|
| `Course` | C/V/U/D | own | own (`created_by=auth.uid()`) | ✅ Konsisten |
| `CourseLesson` | C/U/D | own | own (join `courses.created_by`) | ✅ Konsisten |
| `Quiz` | C/U/D | own | own (join `courses.created_by`) | ✅ Konsisten |
| **`QuizQuestion`** | C/U/D | **own** | **none** (hanya `all`-scope) | **❌ Tidak konsisten** |
| **`QuizOption`** | C/U/D | **own** | **none** (hanya `all`-scope) | **❌ Tidak konsisten** |
| `Enrollment` | C/V | own (untuk kursus miliknya — moderasi/lihat peserta) | own (hanya untuk enrollment miliknya sendiri sebagai Agen; **tidak ada** klausa Instructor melihat enrollment ke kursusnya) | **❌ Tidak konsisten** (tambahan, lihat Bagian 51) |
| `QuizAttempt` | C/V | own | Sama pola dengan `Enrollment` di atas | **❌ Tidak konsisten** (sama akar masalah) |
| `Certificate` | V | own | Publik (`true`) — lebih longgar dari `own`, **konsisten** karena badge memang harus tampil publik (bukan pelanggaran, justru sesuai kebutuhan Profil Agen M02) | ✅ Konsisten (dengan penjelasan) |

---

# 27. Validation Matrix

| Field | Wajib? | Tipe | Aturan |
|---|---|---|---|
| `courses.title` | Ya | VARCHAR(200) | NOT NULL |
| `courses.category` | Tidak (nullable meski CHECK) | Enum | 5 nilai |
| `courses.passing_grade` | Ya (default) | SMALLINT | Default 70, range **tidak divalidasi** (Open Issue) |
| `courses.prerequisite_course_id` | Tidak | UUID | FK self, **tidak ada guard circular reference** |
| `quiz_questions.question_type` | Ya | Enum | `single_choice`\|`multi_choice` |
| `quiz_options.is_correct` | Ya (default false) | BOOLEAN | — |
| `enrollments`/`certificates` | — | — | UNIQUE `(agent_id, course_id)` masing-masing |

---

# 28. Error Handling

| Skenario | HTTP Status | Sumber |
|---|---|---|
| Enroll ganda ke kursus yang sama | 409 (UNIQUE violation) | Migration `0009` |
| Enroll ke kursus dengan prasyarat belum lulus | **Not Defined status code** — User Flow hanya menyebut UI "tombol nonaktif", tidak menyatakan apakah backend juga menolak dengan kode tertentu jika dipaksa via API langsung (Open Issue) |
| Instructor mencoba kelola bank soal kursusnya sendiri | **403** (RLS aktual) — bertentangan dengan ekspektasi fungsional PRD (Bagian 51) |
| Submit kuis dengan skor < passing grade | 200 (bukan error) — hasil ditampilkan, tombol "Ulangi Kuis" muncul | User Flow §4.1 |

---

# 29. Notification

**Tidak ada notifikasi M04-spesifik eksplisit** di User Flow/Functional Spec (berbeda dari M01/M02) — kemungkinan sertifikat terbit dapat memicu notifikasi (konsisten pola umum M08), namun tidak dinyatakan eksplisit sebagai requirement M04.

---

# 30. Activity Log

**Not Defined secara eksplisit** untuk M04 — tidak ada REQ yang menyebut audit log untuk kursus. Perubahan status kursus (`draft`→`published`→`archived`) oleh Instructor/Admin kemungkinan relevan untuk audit, namun tidak eksplisit dinyatakan wajib di dokumen sumber.

---

# 31. Audit Trail

Sama seperti Bagian 30 — tidak eksplisit dinyatakan.

---

# 32. External Integration

**Tidak ada** integrasi eksternal langsung — materi video/PDF disimpan via Supabase Storage (pola umum), generate PDF sertifikat kemungkinan memakai `pdf-lib` (technology-decisions.md, tapi tidak eksplisit dikaitkan ke M04 di dokumen sumber M04 manapun) — Open Issue.

---

# 33. AI Capability

**Tidak ada.**

---

# 34. Performance Requirement

**Not Defined secara M04-spesifik.**

---

# 35. Security Requirement

1. RLS `courses_select_published` — non-owner/non-admin hanya melihat kursus `status='published'` (draft tersembunyi dari publik/agen biasa).
2. Ownership `created_by` sebagai basis kontrol akses Instructor — konsisten pola ownership modul lain (`agent_id` untuk Agen).
3. **Gap kritis (Bagian 51):** RLS bank soal tidak menegakkan ownership — berpotensi Instructor tidak bisa mengelola materi ujian kursusnya sendiri, **atau** sebaliknya jika di-generalize salah arah, berpotensi Instructor lain bisa mengubah bank soal kursus yang bukan miliknya (perlu verifikasi ketat sebelum go-live, karena RLS saat ini **menutup total** akses Instructor, bukan membuka terlalu lebar — jadi risikonya fungsional/blocking, bukan kebocoran data).

---

# 36. Accessibility Requirement

**Not Defined secara M04-spesifik.**

---

# 37. Responsive Requirement

**Not Defined secara M04-spesifik** — Player Materi & Kuis (Template C varian sidebar) berpotensi kompleks di mobile (sidebar daftar lesson + video/kuis), tidak ada breakdown responsif eksplisit.

---

# 38. SEO Impact (Jika relevan)

**Tidak relevan langsung** — Katalog/Detail Kursus **tidak termasuk** 5 tipe halaman wajib SSR/SSG di SEO Spec §1.1 (hanya Homepage, Search, Detail Listing, Profil Agen, Detail Proyek Developer yang terdaftar). Kemungkinan CSR standar seperti Dashboard — **Not Defined** eksplisit strategi rendering-nya.

---

# 39. Configuration

**Tidak ada `system_configs` khusus M04** — `passing_grade` konfigurasinya **per kursus** (kolom tabel `courses`), bukan parameter sistem global.

---

# 40. Environment Variable

Tidak ada environment variable baru khusus M04.

---

# 41. Feature Flag

**Tidak ada flag formal.** Leaderboard/gamifikasi (Fase 2) berpotensi jadi kandidat flag nanti, Out of Scope saat ini.

---

# 42. Acceptance Criteria

Dari PRD Modul 4 (v1.2, pasca-resolusi OD-16):

- [ ] Agen dapat mendaftar kursus tanpa biaya dan tanpa approval admin.
- [ ] Sistem otomatis mengeluarkan sertifikat digital (PDF/gambar) setelah lulus.
- [ ] Superadmin, Admin, Instructor, dan Manager dapat membuat, mengedit, dan menonaktifkan kursus; Agen tidak dapat mengakses menu kelola konten ini.

> **✅ Resolved [2026-08-06] — OD-16.** Kriteria ketiga sebelumnya menyatakan "Manager... tidak dapat mengakses menu kelola konten" — bertentangan dengan Business Rule PRD yang menyatakan "role Manager memiliki akses Full". Owner memilih **Opsi A**: Manager memiliki akses Full (mengikuti Business Rule). PRD Acceptance Criteria sudah direvisi ke versi di atas — lihat `PRD-RUMAHAGEN-v1_2.md` Modul 4.

---

# 43. QA Test Scenario

| # | Skenario | Hasil Diharapkan |
|---|---|---|
| 1 | Agen enroll kursus tanpa prasyarat | Langsung terdaftar, tanpa approval |
| 2 | Agen enroll kursus dengan prasyarat belum lulus (via API langsung) | **Perlu verifikasi:** apakah backend menolak atau hanya UI yang mencegah — Open Issue |
| 3 | Agen submit kuis skor ≥ passing grade | Sertifikat generate otomatis, muncul di `/dashboard/certificates` dan badge di profil |
| 4 | Instructor buat kursus baru + lesson + quiz shell | Berhasil (RLS `courses_manage_own`/`quizzes_manage` mendukung) |
| 5 | **Instructor tambah pertanyaan ke bank soal kursusnya sendiri** | **Saat ini: 403** (RLS gap) — wajib diperbaiki sebelum modul dianggap selesai untuk Instructor |
| 6 | Manager coba akses "Kelola Kursus" | **✅ Resolved [2026-08-06], OD-16 Opsi A:** Berhasil (akses Full, mengikuti Business Rule) |

---

# 44. Edge Case

1. Kursus A prasyarat kursus B, kursus B prasyarat kursus A (circular) — tidak ada guard skema, berpotensi deadlock logis UI ("tombol nonaktif selamanya").
2. Instructor dihapus/di-suspend sementara kursusnya masih `published` dan ada agen yang enroll — `created_by` tetap merujuk user tsb (`ON DELETE RESTRICT`), kursus tidak otomatis unpublish — **Not Defined** apakah ini perilaku yang diinginkan.
3. `passing_grade` diubah Instructor **setelah** beberapa agen sudah lulus dengan grade lama — sertifikat yang sudah terbit tidak dicabut retroaktif (tidak ada mekanisme itu di skema) — perilaku default yang wajar, dicatat untuk kejelasan bukan sebagai masalah.

---

# 45. Risk Analysis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| **RLS bank soal tidak mendukung ownership Instructor** (Konflik #1) | REQ-M04-006 secara fungsional **tidak terpenuhi penuh** untuk Instructor — fitur "kelola bank soal" yang dijanjikan PRD/User Flow tidak berfungsi tanpa perbaikan RLS | **✅ Diperbaiki [2026-08-06]** — klausa ownership join ke `courses.created_by` ditambahkan ke `quiz_questions_manage`/`quiz_options_manage`, lihat `0009_m04_learning_center.sql` versi terbaru — ✅ **DIPERBAIKI [2026-08-09]** — migration `0009_m04_learning_center-FIXED.sql` sekarang memuat klausa ini (siklus konsolidasi 9 Agustus). Status Resolved terverifikasi. |
| Inkonsistensi internal PRD soal akses Manager (Konflik #2) | Ambiguitas implementasi — tim bisa salah satu arah tanpa sadar ada 2 pernyataan berbeda di dokumen yang sama | **✅ Diperbaiki [2026-08-06]** — OD-16 dijawab Owner (Opsi A: Manager akses Full), PRD Acceptance Criteria direvisi, lihat `PRD-RUMAHAGEN-v1_2.md` Modul 4 |
| Tidak ada guard circular prerequisite | UX buntu (agen tidak pernah bisa enroll 2 kursus yang saling mensyaratkan) | Rekomendasi tambah validasi aplikasi (bukan mengubah skema) saat implementasi |

---

# 46. Known Limitation

1. **RLS `quiz_questions`/`quiz_options` tidak mendukung ownership Instructor** — ~~Diperbaiki [2026-08-06]~~ **✅ Benar-benar Diperbaiki [2026-08-09]** — migration `0009_m04_learning_center-FIXED.sql`, siklus konsolidasi 9 Agustus 2026.
2. **Inkonsistensi internal PRD** soal akses Manager ke Kelola Kursus (Business Rule vs Acceptance Criteria).
3. **Granularitas endpoint admin** (nested vs terpisah per sub-entity) tidak eksplisit di API Specification.
4. **Guard circular `prerequisite_course_id`** tidak ada di skema.
5. **Mekanisme teknis generate PDF sertifikat** tidak dirinci.
6. **Struktur request `POST /courses/{id}/quiz/submit`** (format jawaban) tidak dirinci di dokumen sumber.

---

# 47. Dependency Checklist

| Item | Status |
|---|---|
| MDM: M04 hanya bergantung M01 | ✅ Terpenuhi |
| MIS: M04 urutan #6, Batch 2 | ✅ Konsisten, paralel dengan M02/M06/M13 |
| Migration `0001`, `0003` (prasyarat `0009`) | ✅ Sudah ditulis |
| ERD v1.3 §2.15-2.20 Baseline | ✅ |
| Authorization Spec v1.0 §2.5 Baseline (dengan catatan gap RLS) | ✅ |

**Kesimpulan:** Dependency terpenuhi. Blocker fungsional (bukan dependency): gap RLS bank soal wajib diperbaiki sebelum fitur Instructor dianggap selesai.

---

# 48. Definition of Ready

- [x] PRD Modul 4 Baseline (v1.2).
- [x] ERD §2.15-2.20 Baseline (v1.3).
- [x] Migration `0001`, `0003`, `0009` tertulis.
- [x] Authorization Spec §2.5 Baseline.
- [ ] **Perbaikan RLS `quiz_questions_manage`/`quiz_options_manage`** untuk mendukung ownership Instructor — direkomendasikan diperbaiki di migration sebelum eksekusi Sprint (Bagian 45). *(Catatan: checkbox ini tidak pernah dicentang di ketiga snapshot 1.0a/b/c — konsisten dengan temuan verifikasi 9 Agustus 2026. Sekarang benar-benar diperbaiki via `0009_m04_learning_center-FIXED.sql`, boleh dicentang `[x]` setelah migration terbaru dieksekusi. Lihat catatan verifikasi di awal dokumen.)*
- [x] **Klarifikasi akses Manager** ke Kelola Kursus (Konflik #2) dari Owner — **✅ Resolved [2026-08-06], OD-16 Opsi A** (Manager akses Full).

---

# 49. Definition of Done

- [ ] Seluruh Acceptance Criteria (Bagian 42) terverifikasi — **termasuk resolusi eksplisit konflik Manager**.
- [ ] Migration `0009` (setelah perbaikan RLS bank soal) dieksekusi sukses.
- [ ] Unit test: enrollment unik, sertifikat unik, resolusi passing grade.
- [ ] **Test khusus: Instructor dapat CRUD bank soal kursus miliknya sendiri, ditolak untuk kursus milik Instructor lain.**
- [ ] E2E test: alur enroll → belajar → kuis → sertifikat (Playwright).
- [ ] PR lolos CI gate.
- [ ] `CURRENT-PROJECT-STATE.md` diperbarui.

---

# 50. Traceability Matrix

| REQ-XXX | ENT-XXX | Endpoint | PERM-XXX | Catatan |
|---|---|---|---|---|
| REQ-M04-001 | `ENT-M04-Course` | Katalog/detail | `PERM-M04-View-Course` | — |
| REQ-M04-002 | `ENT-M04-Enrollment` | `POST /courses/{id}/enroll` | `PERM-M04-Create-Enrollment` | — |
| REQ-M04-003 | `ENT-M04-CourseLesson`, `Quiz`, `QuizQuestion`, `QuizOption` | `/admin/courses` | Berbagai | Bank soal: lihat Konflik #1 |
| REQ-M04-004 | `ENT-M04-QuizAttempt`, `Certificate` | `POST /courses/{id}/quiz/submit`, `GET /agents/me/certificates` | `PERM-M04-Create-QuizAttempt`, `View-Certificate` | — |
| REQ-M04-005 | `ENT-M04-Enrollment` (`progress_percent`) | — | `PERM-M04-View-Enrollment` | — |
| REQ-M04-006 | `ENT-M04-Course` dkk. | `/admin/courses` | `PERM-M04-*` | Manager: `all` (OD-16 Opsi A, Resolved) |

---

# 51. Conflict Analysis

| # | Konflik/Ambiguitas | Dokumen Terlibat | Resolusi |
|---|---|---|---|
| 1 | **PRD Business Rule, Authorization Spec §2.5, dan User Flow §4.2 tiga-tiganya sepakat** Instructor berwenang "kelola bank soal" (`own` untuk `QuizQuestion`/`QuizOption`) untuk kursus miliknya — namun RLS aktual di migration `0009` (`quiz_questions_manage`, `quiz_options_manage`) **hanya** memeriksa `auth_has_scope_all('M04_learning','manage')`, **tidak ada** klausa ownership join ke `courses.created_by` seperti yang dipakai policy `courses_manage_own`/`course_lessons_manage`/`quizzes_manage` pada tabel-tabel terkait lainnya di modul yang sama. | PRD v1.2, Authorization Spec v1.0 §2.5, User Flow v1.2 §4.2 (ketiganya sepakat) vs migration `0009` (Database Schema, prioritas #7 — namun di sini justru menjadi **outlier**, bukan mayoritas) | **Berbeda dari pola konflik di MP-01/MP-02/MP-06 sebelumnya** (di mana Authorization Spec yang salah) — di sini **migration RLS yang tampak tidak lengkap**, karena 3 sumber independen sepakat sebaliknya dan pola implementasi tabel serupa (`quizzes_manage`) di file yang sama sudah benar menerapkan ownership check. Direkomendasikan **migration `0009` diperbaiki** menambah klausa `EXISTS (SELECT 1 FROM quizzes qz JOIN courses c ON c.id = qz.course_id WHERE qz.id = quiz_questions.quiz_id AND c.created_by = auth.uid())` (pola serupa `quizzes_manage`) sebelum eksekusi ke production — **tidak diubah di dokumen ini** (larangan tugas mengubah skema), namun ditandai sebagai prasyarat wajib Definition of Ready (Bagian 48). **Status: Diperbaiki [2026-08-06], lihat `0009_m04_learning_center.sql` versi terbaru** (klausa ownership via quiz→course ditambahkan ke `quiz_questions_manage` dan `quiz_options_manage`). ✅ **DIPERBAIKI [2026-08-09]** — klausa ini sekarang ada di `0009_m04_learning_center-FIXED.sql` (siklus konsolidasi 9 Agustus). Status Resolved terverifikasi. |
| 2 | PRD Modul 4 Business Rule menyatakan **"role Manager memiliki akses Full (mengikuti hak Admin secara global)"** untuk kelola konten kursus — namun Acceptance Criteria di dokumen PRD **yang sama** menyatakan **"Manager dan Agen tidak dapat mengakses menu kelola konten ini."** Kedua pernyataan saling bertentangan langsung dalam satu dokumen. | PRD v1.2 (inkonsistensi internal, Business Rules vs Acceptance Criteria pada modul yang sama) | **Tidak dapat diresolusikan sepihak** — kedua bagian berasal dari dokumen prioritas sama (#12) tanpa penanda mana yang lebih baru/otoritatif. Dicatat sebagai Open Issue kritis (Bagian 46 poin 2), diformalkan sebagai **OD-16**. **Status: ✅ Resolved [2026-08-06]** — Owner memilih Opsi A (Manager akses Full, mengikuti Business Rule). PRD Acceptance Criteria Modul 4 direvisi agar konsisten — lihat `PRD-RUMAHAGEN-v1_2.md`. |
| 3 | Authorization Spec §2.5 mencantumkan Instructor = `own` untuk `View-Enrollment`/`View-QuizAttempt` (mengimplikasikan Instructor dapat melihat progress peserta kursusnya) — namun RLS `enrollments_own`/`quiz_attempts_own` **hanya** mengecek kepemilikan Agen (`agent_id=auth.uid()`) atau `all`-scope, **tidak ada** klausa "Instructor dapat lihat enrollment ke kursus miliknya". | Authorization Spec v1.0 §2.5 vs migration `0009` | Pola serupa Konflik #1 — dicatat sebagai gap tambahan yang perlu diperbaiki bersamaan (Bagian 45/48), agar Instructor juga dapat memantau progress peserta kursusnya (kebutuhan fungsional wajar untuk peran pengajar meski tidak eksplisit disebut REQ-M04-XXX tersendiri). **Status: Diperbaiki [2026-08-06], lihat `0009_m04_learning_center.sql` versi terbaru** (klausa Instructor via course.created_by ditambahkan ke `enrollments_own` dan `quiz_attempts_own`, USING saja — WITH CHECK insert tidak diubah). ✅ **DIPERBAIKI [2026-08-09]** — klausa Instructor ini sekarang ada di `0009_m04_learning_center-FIXED.sql` (siklus konsolidasi 9 Agustus). Status Resolved terverifikasi. |

---

# 52. Recommendation

1. **Perbaiki RLS `quiz_questions_manage`/`quiz_options_manage`** (dan pertimbangkan `enrollments_own`/`quiz_attempts_own` untuk visibilitas Instructor) sebelum Sprint M04 dieksekusi — 3 sumber independen sepakat Instructor butuh akses ini, migration saat ini adalah outlier yang perlu dikoreksi (Konflik #1, #3).
2. ~~Eskalasi segera inkonsistensi internal PRD soal akses Manager (Konflik #2) ke Owner~~ — **✅ Resolved [2026-08-06]**, OD-16 dijawab Owner (Opsi A: Manager akses Full), PRD & Acceptance Criteria sudah disinkronkan.
3. **Tambahkan guard circular prerequisite** di validasi aplikasi (Zod/service layer) — tidak mengubah skema, murni pencegahan logika bisnis.
4. **M04 aman dibangun paralel dengan M02, M06, M13** (Batch 2 MIS) — setelah 2 keputusan di atas (poin 1-2) diselesaikan, bukan blocker untuk *memulai* development, tapi blocker untuk *menyatakan selesai* fitur Instructor.
5. **Setelah M04 selesai (atau paralel dengannya)**, lanjutkan ke M13 (AI Assistant, kondisional gate) atau M03 (Listing) sesuai urutan MIS Bagian 3 — M13 di urutan #7 (kondisional), M03 di urutan #8.

---

*Module Planning ini disusun murni berdasarkan dokumen yang diupload — tidak ada requirement yang diubah/ditambah/dihapus, tidak ada perubahan arsitektur/API/skema database. Dua temuan signifikan (gap RLS bank soal & inkonsistensi internal PRD soal Manager) ditemukan lewat pemeriksaan silang PRD, Authorization Spec, User Flow, dan migration SQL aktual — diresolusikan dengan analisis mayoritas sumber, bukan diasumsikan sepihak, dan yang tidak dapat diresolusikan (Konflik #2) dieskalasi eksplisit sebagai keputusan Owner.*
