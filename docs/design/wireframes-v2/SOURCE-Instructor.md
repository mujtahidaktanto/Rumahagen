# Dokumen Sumber — Persona Instructor + Pusat Notifikasi (Fase G)

Dibuat 2026-09-24 dari pemindaian repo `Rumahagen` + database live Supabase (`jawywzavznjekxxlhwqo`,
migration #0001–#0128). Acuan tunggal untuk wireframe `04-Instructor/` dan `06-Bersama/`.
**[DIUJI]** = dibuktikan pada DB live lewat transaksi rollback.

## 1. Sumber yang dipindai
`PRE-00-F` §22–§48 (Session, Host/Instructor, Visibility), STEP13-E §12/§16 (M04, M05), STEP13-C, migration
`0021`–`0022` (session), `0031`–`0032`/`0088` (event), `0036` (notifikasi), `0042`–`0044` (perbaikan RLS session),
`0009` (seed izin), route `learning/*`, `events/*`, `notifications/*`, `admin/notifications/push`, wireframe Agent
M04/M05/M08.

## 2. Siapa Instructor
- Role platform `instructor` (satu dari 7 role). **Host dan Instructor bukan role**; keduanya *kapabilitas per sesi*
  (`learning_session_assignments.capability` = `HOST` | `INSTRUCTOR`), ditugaskan **hanya oleh staf** (Superadmin/Admin/Manager).
  Instructor bukan otomatis Host (PRE-00-F §29, §42–43).
- Aturan dua lapis (PRE-00-F §42–43): operasi Instructor butuh **izin** + **penugasan INSTRUCTOR aktif** pada sesi itu.
  Catatan penting: DB saat ini **tidak** menegakkan lapis penugasan (lihat §7).
- Tidak ada `agent_profile`: profil = foto (`m02.profile_photo.*`). Tidak ada listing, DBR, komersial, AI (BYOK), atau developer.

## 3. Izin (live DB, scope own kecuali disebut)
| Domain | Izin |
|---|---|
| M04 Sesi | `learning_session.create/update/delete/manage/view`, `session_enrollment.create/view`, `attendance.manage`, `completion.manage`, `artifact.view/manage`, `session_evidence.view/manage` |
| M05 Event | `event.create/update/publish/lifecycle/visibility`, `event_registration.create/update/view`, `guest_registration.create/manage/view` |
| M08 | `dashboard_projection.read/project`, `notification_state.read/update_state` |
| M02 | `profile_photo.upload/edit/delete` |
| M12 | `organization.manage_within_authorized_context` (tidak ada tabel yang memakainya untuk Instructor) |
| M15 | `qualification.administer/evaluate` (own; sejak 0128 hanya mengajukan bukti, evaluasi oleh staf/sistem) |
| **Tidak ada** | `session_assignment.assign` (staf), `learning_provider.manage` (staf), listing, DBR, komersial |

## 4. Model data
- `learning_sessions`: `owner_id`, `course_id?`, `organization_id?`, `event_id?`, `session_type broadcast|interactive|on_demand`,
  `status draft|scheduled|live|ended|cancelled|failed`, `start_at*`, `end_at`, `visibility public|organization|partner|private`.
- `learning_session_assignments`: `session_id`, `actor_id`, `capability HOST|INSTRUCTOR`, `status ACTIVE|REVOKED`.
- `session_enrollments`: `session_id`, `agent_id` (peserta, nama kolom historis), `status pending|active|completed`.
  Transisi status hanya staf (`session_enrollments_manage_staff`).
- `session_provider_bindings` (Zoom/Meet dsb., **hanya staf**), `session_artifacts` (rekaman: `pending|available|unavailable|expired`),
  `session_participation_evidence` (append-only dari webhook provider), `session_attendance_evaluations`
  (`policy_version`, `result` teks bebas), `session_completion_outcomes` (`completion_policy_version`, `result`; butuh enrollment `active`).
- Rantai (PRE-00-F §32–37): **bukti partisipasi → kehadiran → penyelesaian sesi**. Penyelesaian sesi **tidak** langsung memberi LP,
  skill, kredensial, title, atau award; hanya menandai hasil yang bisa menjadi bukti kualifikasi (M15) dan memicu aktivitas belajar.
- Event: lihat SOURCE-Developer-Partner.md §4. Instructor punya `event.publish` dan `lifecycle`, jadi boleh menerbitkan event miliknya
  sendiri (berbeda dari Developer Partner).
- `notifications`: `type approval_status|event_reminder|listing_expiring|certificate_issued|lead_new|lainnya`, `title`, `message`,
  `related_entity_type/id` (referensi opak), `is_read`, `dismissed_at`, `delivery_status pending|delivered|failed`.

## 5. Endpoint yang ada
Sesi: `GET/POST /learning/sessions`, `GET/PUT/DELETE /learning/sessions/{id}`, `PATCH …/status`, `…/assignments`, `…/enrollments`,
`…/attendance` + `…/attendance/evaluate`, `…/completion-outcomes` + `…/completion/evaluate`, `…/evidence`, `…/artifacts`,
`…/provider-binding`, `…/event`, `GET /agents/me/session-enrollments`. Event: `GET/POST /events`, `GET/PUT /events/{id}`, `POST …/rsvp`.
Notifikasi: `GET /notifications` (`is_read`, `include_dismissed`, paginasi), `PATCH/POST /notifications/{id}/read`, `…/dismiss`, `POST /notifications/read-all`,
`GET /dashboard/summary` (hanya hitungan), `POST /admin/notifications/push` (Superadmin/Admin).

## 6. Pusat Notifikasi (lintas peran)
- Semua peran punya `notification_state.read/update_state` own. Layar ini **satu untuk semua persona** (folder `06-Bersama`).
- Pengguna **tidak bisa membuat** notifikasi (tanpa policy INSERT; hanya `create_notification()` SECURITY DEFINER).
- **[TEMUAN] Tidak ada satu pun peristiwa bisnis yang memanggil `create_notification()`** (dicek seluruh migration dan kode): satu-satunya
  pembuat notifikasi adalah "push manual" Admin. Akibatnya inbox akan kosong kecuali Admin mengirim, dan janji di wireframe lain
  ("Anda mendapat notifikasi saat ada keputusan": klaim, event, bukti kualifikasi, banding award, sesi) **belum didukung backend**.
  Backend yang dibutuhkan: pemicu untuk peristiwa yang tipenya sudah ada (`approval_status`, `event_reminder`, `certificate_issued`, `lead_new`, …).
- `related_entity_type/id` opak: tautan tujuan dipetakan di klien per tipe; entitas yang tidak dikenal ditampilkan tanpa tautan.

## 7. Temuan celah backend (dibuktikan) yang memengaruhi desain
1. **[DIUJI] Pemilik sesi tidak bisa melihat daftar peserta sesinya** (`session_enrollments_select` = `has_permission(view, agent_id)` own → 0 baris),
   padahal izin evaluasi kehadiran/penyelesaian diberikan atas sesi miliknya. Instructor mengevaluasi "buta".
2. **[DIUJI] Instructor yang DITUGASKAN (bukan pemilik) tidak bisa melihat maupun mengubah sesi itu**; hanya melihat baris penugasannya sendiri.
   Penugasan HOST/INSTRUCTOR belum berdampak pada akses.
3. Pengelola event (Instructor/Agent/Developer Partner) **tidak bisa melihat pendaftar eventnya** (`event_registrations_select` own) dan tidak ada
   route daftar pendaftar; mode registrasi `manual_approval` tidak bisa dijalankan oleh penyelenggara non-staf.
4. Tidak ada satu pun pemicu notifikasi bisnis (lihat §6).
5. Yang sudah benar **[DIUJI]**: peserta tidak bisa membuat evaluasi kehadirannya sendiri (42501) dan tidak bisa menyelesaikan enrollment sendiri (0 baris);
   pemilik sesi bisa mengubah status sesi dan mengevaluasi kehadiran.
Wireframe menggambar peran yang *dimaksud* (daftar peserta, kehadiran, penyelesaian); bagian yang bergantung pada celah 1–3 diberi catatan
"butuh perbaikan backend" di kode dan di README.

## 8. Cakupan layar Fase G
| Kode | Layar | Asal |
|---|---|---|
| M08 | Dashboard Instruktur | sesi mendatang, kehadiran belum dinilai, notifikasi |
| M04 | Sesi Saya (daftar) | `learning/sessions` |
| M04 | Form Sesi | create/update sesi (tipe, jadwal, visibilitas, kursus, event) |
| M04 | Detail Sesi | ringkasan + transisi status, peserta & kehadiran, penyelesaian, artefak, tim pengampu (baca saja) |
| M05 | Event Instruktur | buat, terbitkan, batalkan event sendiri; pendaftar (butuh backend) |
| M02 | Profil Instruktur | foto/akun |
| M08 | Pusat Notifikasi (`06-Bersama`) | `/notifications`, dipakai semua persona |
