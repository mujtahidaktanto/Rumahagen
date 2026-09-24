# Dokumen Sumber — Admin Kelola Kursus & Pengalihan URL (Fase D-lanjutan)

Dibuat 2026-09-24 dari pemindaian repo `Rumahagen` + database live Supabase (`jawywzavznjekxxlhwqo`,
migration #0001–#0129). Acuan untuk wireframe `02-Admin/M04-*Kursus*` dan `02-Admin/M11-Pengalihan-URL`.
**[DIUJI]** = dibuktikan pada DB live lewat transaksi rollback. **[KODE]** = terbaca dari kode route/skema.

## 1. Sumber yang dipindai
Migration `0051` (url_redirects), `0056` (courses, course_lessons), `0059` (enrollments), `0060` (quizzes, questions, options,
attempts); route `courses/*`, `course-lessons/[id]`, `quizzes/*`, `quiz-questions/[id]/options`, `url-redirects/*`, `enrollments/[id]`;
skema `lib/validation/{courses,quizzes,url-redirects}.ts`; policy dan trigger live; wireframe Admin yang sudah ada
(`M04-Learning-Economy-Config` hanya mencakup aktivitas LP dan sertifikat, **bukan** kursus).

## 2. Izin
| Izin | Superadmin | Admin | Manager | Instructor | Agent |
|---|---|---|---|---|---|
| `m04.course.manage` (kursus, pelajaran, kuis, soal, opsi) | all | all | all | **own** (`created_by`) | — |
| `m04.course_enrollment.view` (peserta kursus) | all | all | all | — | own |
| `m04.course_enrollment.create` | — | — | — | — | own |
| `m11.static_public_content.publish` (url_redirects) | all | all | **—** | — | — |
Catatan: **Manager mengelola kursus tetapi tidak bisa mengelola pengalihan URL** (hanya Superadmin/Admin). Baca `url_redirects`: publik (anon).
**Instructor punya `course.manage` scope own**, jadi Instructor bisa membuat dan mengelola kursus miliknya sendiri; persona Instructor
(Fase G) belum punya layar "Kursus Saya" (lihat §7, keputusan #3).

## 3. Model data
- `courses`: `title*` (≤200), `category` (`sales_skill|legal_regulasi|produk_developer|financial_kpr|lainnya`), `description`,
  `prerequisite_course_id` (self-FK, tanpa deteksi siklus), `passing_grade` (0–100, default 70), `status` (`draft|published|archived`, default draft),
  `created_by*`, `deleted_at` (tidak dipakai route mana pun).
- `course_lessons`: `course_id*` (cascade), `title`, `content_type` (`video|pdf|slide`), `content_url` (≤500), `sort_order` (smallint).
- `quizzes`: `course_id*` (cascade), `title`. **Satu kursus boleh punya banyak kuis.** Nilai lulus diambil dari `courses.passing_grade`.
- `quiz_questions`: `quiz_id*`, `question_text*`, `question_type` (`single_choice|multi_choice`).
- `quiz_options`: `question_id*`, `option_text*` (≤500), `is_correct` (default false). Hanya pengelola kursus/staf yang boleh membaca (kunci jawaban).
- `quiz_attempts`: `enrollment_id`, `quiz_id`, `score`, `passed`, `attempted_at`.
- `enrollments` (kursus): `agent_id`, `course_id` (unik), `status` (`in_progress|completed`), `progress_percent`, `completed_at`.
- `url_redirects`: `old_path*` (unik, ≤300), `new_path*` (≤300), `redirect_type` (301|302, default 301), `reason`
  (`slug_changed|listing_deleted|listing_merged|lainnya`), `entity_type`, `entity_id` (referensi longgar). Tabel kosong saat ini.
- Tidak ada satu pun trigger pada tabel-tabel ini (dicek live).

## 4. Endpoint yang ada
Kursus: `GET/POST /courses`, `GET/PUT /courses/{id}`, `PATCH /courses/{id}/status`, `GET/POST /courses/{id}/lessons`,
`PUT/DELETE /course-lessons/{id}`, `GET/POST /courses/{id}/quizzes`, `GET/POST /quizzes/{id}/questions`, `POST /quiz-questions/{id}/options`,
`GET /quizzes/{id}/take`, `POST /quizzes/{id}/submit`, `POST /courses/{id}/enroll`. Pengalihan: `GET/POST /url-redirects`
(`GET ?old_path=`), `DELETE /url-redirects/{id}`.
**Tidak ada:** ubah/hapus kuis, ubah/hapus soal, ubah/hapus opsi, baca opsi untuk pengelola, hapus kursus, ubah pengalihan (PUT),
daftar peserta per kursus untuk staf (hanya `GET /enrollments/{id}`), hitungan pelajaran/kuis/peserta pada daftar kursus.

## 5. Temuan celah (dibuktikan / terbaca)
> **Pembaruan 2026-09-24 (batch 0135–0137, diterapkan):** celah 4 (ubah/hapus kuis-soal-opsi) ditutup migration `0135` + route baru `PATCH/DELETE quizzes|quiz-questions|quiz-options`, celah 7 (pengalihan URL tidak dipakai) ditutup middleware `apps/web/middleware.ts` + migration `0137` (pengalihan otomatis saat slug berubah), dan mekanisme "minta terbit" Instruktur (status `pending_review`) ditambahkan migration `0136`. Layar Admin diperbarui: chip "Menunggu Tinjauan", tombol Tinjau, Setujui/Tolak dengan catatan, kesiapan terbit, kunci kuis yang sudah dikerjakan. Layar Instruktur ada di `SOURCE-Instructor-Kursus.md`.
>
> **Pembaruan sebelumnya 2026-09-24:** celah 1, 2, 3, dan 8 sudah ditutup oleh migration `0130` (diterapkan) plus perubahan route `quizzes/[id]/submit` dan skema `url-redirects`. Sisanya (4, 5, 6 sebagian, 7) masih terbuka. Teks di bawah adalah kondisi saat ditemukan.
1. **[DITUTUP 0130] [DIUJI] Agent bisa menyelesaikan kursusnya sendiri.** `enrollments_update` memakai izin `view` scope own, jadi Agent bisa `UPDATE` baris enrollment-nya:
   `status='completed'`, `progress_percent=100`, `completed_at=now()` berhasil (1 baris) tanpa mengerjakan kuis. Pola yang sama dengan celah M15 (izin baca dipakai untuk menulis).
2. **[DITUTUP 0130] [DIUJI] Instructor bisa langsung menerbitkan kursus sendiri** (`status='published'` pada INSERT tanpa tinjauan); membuat kursus atas nama orang lain ditolak (42501).
   Agent tidak bisa membuat kursus (42501). Perlu keputusan produk: apakah kursus Instructor butuh persetujuan staf sebelum tampil di katalog publik.
3. **[DITUTUP 0130 + kode] [KODE] Penilaian kuis memakai jumlah soal yang DIJAWAB, bukan jumlah soal kuis:** `score = benar / answers.length`. Peserta cukup mengirim
   satu jawaban yang benar untuk mendapat 100% dan lulus. Tidak ada batas percobaan. `submit` juga tidak menandai enrollment selesai.
4. **[KODE] Editor kuis tidak bisa lengkap:** tidak ada route ubah/hapus kuis, soal, opsi, dan tidak ada route baca opsi untuk pengelola
   (sengaja tanpa GET karena kunci jawaban). Pengelola hanya bisa menambah. Kesalahan soal tidak bisa diperbaiki lewat API.
5. **[KODE] Kursus tidak bisa dihapus lewat API** (kolom `deleted_at` tidak dipakai; `courses_select` mengabaikannya). Policy `FOR ALL` mengizinkan
   DELETE langsung yang menghapus berantai enrollment dan kuis, tetapi tidak ada route yang memakainya.
6. **[KODE] `prerequisite_course_id` tanpa validasi siklus atau diri sendiri**; Agent bisa enroll ke kursus draft/archived bila tahu id-nya
   (`enrollments_insert` tidak memeriksa status kursus).
7. **[KODE] Pengalihan URL tidak dipakai di mana pun:** tidak ada middleware/`next.config` yang membaca `url_redirects`, dan tidak ada pemicu yang
   membuatnya saat slug berubah/listing dihapus. Saat ini tabel hanya berisi data yang diinput staf tanpa efek ke pengunjung.
8. **[DITUTUP 0130 + Zod] [KODE] Validasi pengalihan lemah (tersisa: tanpa PUT dan tanpa paginasi):** `old_path`/`new_path` string bebas ≤300 (tanpa awalan `/`, boleh URL luar sehingga berpotensi *open redirect*, boleh sama
   dengan dirinya sendiri, rantai/loop tidak dicek); tidak ada PUT; daftar tanpa paginasi/filter.
Wireframe menggambar peran yang *dimaksud*; bagian yang bergantung pada celah di atas diberi catatan "butuh perbaikan backend".

## 6. Cakupan layar (Admin, desktop + mobile)
| Kode | Layar | Isi |
|---|---|---|
| M04 | Kelola Kursus | daftar kursus (filter status/kategori/pemilik, cari), buat kursus |
| M04 | Form Kursus | judul, kategori, deskripsi, prasyarat, nilai lulus, pemilik (staf boleh menetapkan) |
| M04 | Detail Kursus | tab Ringkasan + transisi status draft/published/archived; Pelajaran (urut, tambah/ubah/hapus); Kuis (daftar, buka editor); Peserta (baca saja) |
| M04 | Editor Kuis | judul kuis, soal (teks, tipe), opsi + tandai benar, validasi minimal 1 benar (single_choice tepat 1) |
| M11 | Pengalihan URL | daftar, tambah (301/302, alasan, entitas), hapus, penguji jalur |
Nav Admin bertambah 2 item: **Kelola Kursus** dan **Pengalihan URL** (ditambahkan juga ke semua layar Admin yang ada).

## 7. Keputusan yang dibuat / perlu diputuskan
1. Kursus diasumsikan dikelola Admin/Manager/Superadmin di layar Admin; Manager tidak melihat menu Pengalihan URL (izin hanya Admin/Superadmin).
2. Menandai "benar" pada opsi, minimal 1 benar per soal, `single_choice` tepat 1 benar: divalidasi di UI (DB tidak menegakkan).
3. **Diputuskan:** Instructor mendapat layar "Kursus Saya" (scope own, `SOURCE-Instructor-Kursus.md`). Kursus Instruktur tetap Draf; Instruktur mengajukan (`pending_review`), staf menyetujui (terbit) atau mengembalikan ke Draf dengan catatan wajib. Selama ditinjau, isi kursus terkunci untuk pemilik non-staf.
