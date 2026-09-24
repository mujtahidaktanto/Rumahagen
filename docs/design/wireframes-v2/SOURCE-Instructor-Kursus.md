# SOURCE — Instruktur: Kursus Saya (M04, scope own)

Layar: `04-Instructor/` M04-Kursus-Saya, M04-Form-Kursus, M04-Detail-Kursus, M04-Editor-Kuis (desktop + mobile). Nav Instruktur menjadi 6 item (+ Kursus Saya).
Backend: migration 0135 (integritas kuis), 0136 (alur tinjauan kursus), 0137 (pengalihan slug) — **diterapkan 2026-09-24**.

## Alur status kursus
| Dari → ke | Siapa | Syarat |
|---|---|---|
| Draf → Menunggu Tinjauan | pemilik (Instruktur) | ≥1 pelajaran dan semua kuis siap (`quiz_problems` kosong) |
| Menunggu Tinjauan → Draf | pemilik (tarik kembali) atau staf (tolak) | tolak wajib `review_note` |
| Menunggu Tinjauan → Terbit | staf saja (`m04.course.publish`) | kuis siap |
| Terbit → Diarsipkan → Draf | pemilik/staf | — |
Selama Menunggu Tinjauan, kursus/pelajaran/kuis/soal/opsi terkunci untuk non-staf. Notifikasi ke pemilik saat disetujui/ditolak (`notify_user`).

## Aturan kuis
- Siap dinilai: ≥1 soal, tiap soal ≥2 opsi, ≥1 benar, pilihan tunggal tepat 1 benar. Kuis belum siap: 409 pada take/submit dan menghalangi ajukan/terbit.
- Sudah dikerjakan peserta: opsi tak bisa ditambah/dihapus, kunci jawaban dan jenis soal tak bisa diubah, soal dan kuis tak bisa dihapus/dipindah. Teks soal/opsi dan penambahan soal tetap boleh.

## API
`GET quizzes/{id}/editor`, `PATCH|DELETE quizzes/{id}`, `quiz-questions/{id}`, `quiz-options/{id}`, `POST courses/{id}/submit-review | withdraw-review | review`, `GET courses?owner=me&status=&q=`.

## Pengalihan URL (M11)
`middleware.ts` membaca `url_redirects` (cache 60 dtk, 301/302, rantai ≤5, anti-putaran, hanya jalur internal). Migration 0137 membuat entri otomatis saat slug listing terbit, proyek tampil, atau `agent_profiles.public_slug` berubah.

## Masih terbuka
Daftar peserta kursus untuk Instruktur (layar Instruktur tidak menampilkan tab Peserta), pengalihan saat listing dihapus/digabung, PUT pengalihan.
