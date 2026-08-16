# MODULE PLANNING
## MP-05 — Kalender Event
### Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 6 Agustus 2026
**Disusun sebagai:** CTO / Enterprise Architect / Solution Architect / Product Manager / Technical Product Owner / Engineering Manager / Technical Lead / Senior Backend Engineer / Senior Frontend Engineer / Senior QA Engineer / Senior Database Architect / DevOps Architect (peran gabungan)
**Tujuan Dokumen:** Acuan resmi implementasi Modul 5 (Kalender Event) via Bolt.new maupun developer manual. Tidak berisi kode, tidak berisi UI mockup, tidak berisi sprint.

### Dokumen Acuan & Prioritas
| # | Dokumen | Versi Dipakai |
|---|---|---|
| 1 | Module Implementation Strategy (MIS) | v1.1 |
| 2 | Module Dependency Matrix (MDM) | v1.0 |
| 3 | Engineering Guidelines (`PROJECT-CONSTITUTION.md`) | — |
| 4 | Technical Specification | v1.0 |
| 5 | System Architecture | v1.6 |
| 6 | Technology Decisions | v1.5 |
| 7 | Database Schema (ERD §2.21-2.22 + migration `0010`) | ERD v1.3 |
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
> **⚠️ Konflik penomoran** (pola sama seperti MP-01/02/03/04): ketiga snapshot berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026"** yang identik, namun merepresentasikan 3 keadaan berbeda secara kronologis-progresif. Nomor versi publik **dipertahankan "1.0"** — identifier 1.0a/1.0b/1.0c di bawah semata untuk audit. File final ini setara **1.0c**.

| Versi | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| 1.0a | 6 Agu 2026 | Rilis awal — 2 Konflik terbuka: (1) RLS `events_manage` mengizinkan self-approval Developer Partner (bypass kontrol Admin), ditandai "wajib diperbaiki, prioritas setara T1-01/T1-02"; (2) kontradiksi internal PRD soal akses Manager ke publish event (pola identik MP-04), dieskalasi Owner. |
| 1.0b | 6 Agu 2026 | Konflik #1 **diklaim** Diperbaiki — migration `0010` diklaim dipisah jadi `events_insert_own`/`events_update_own`/`events_delete_own`/`events_manage_all`. Konflik #2 **Resolved** (**OD-17 Opsi A**, konsisten OD-16/MP-04) — Manager publish langsung. |
| 1.0c | 6 Agu 2026 | Authorization Spec §2.6 DevPartner Approve-Event dikoreksi (own→none, audit v1.1), referensi naik ke v1.1. |

---

## 🟢 Catatan Verifikasi Silang (ditambahkan & diselesaikan 9 Agustus 2026, siklus konsolidasi ini)

> **REGRESI TERKONFIRMASI — pola sama seperti MP-04, tingkat keparahan lebih tinggi.** Snapshot 1.0b mengklaim RLS `events_manage` (Konflik #1) sudah dipisah jadi 4 policy pada "2026-08-06". **Verifikasi terhadap `0010_m05_events.sql` yang diupload Owner (9 Agustus 2026) membuktikan klaim ini TIDAK TERBUKTI** — migration masih memakai 1 policy `events_manage` tunggal, identik dengan versi 1.0a (pra-perbaikan). Dikonfirmasi Owner bahwa file yang diaudit adalah versi terbaru.
>
> **Berbeda dari regresi MP-04** (gap fitur — Instructor tidak bisa lihat progress peserta), regresi ini adalah **bug keamanan/bisnis aktif**: Developer Partner masih bisa mem-publish event promosi miliknya sendiri tanpa moderasi Admin, persis kondisi yang katanya sudah diperbaiki — bypass kontrol kualitas konten yang eksplisit diwajibkan PRD.
>
> **✅ DIPERBAIKI [2026-08-09]** — atas instruksi Owner, `0010_m05_events-FIXED.sql` memecah `events_manage` jadi 4 policy sesuai spesifikasi §51 Conflict Analysis dokumen ini sendiri: `events_insert_own` (submitter hanya insert dengan status awal `pending_approval`), `events_update_own` (submitter hanya update selama `pending_approval`/`cancelled`, tidak bisa self-set `published`/`rejected`), `events_delete_own`, `events_manage_all` (approve/reject eksklusif role bermscope manage). **Status Konflik #1 sekarang benar-benar Resolved.** File migration terbaru harus menggantikan `0010_m05_events.sql` sebelum eksekusi ke database (status eksekusi migration — lihat §25 di bawah).

---

# 1. Executive Summary

Modul 5 adalah kalender terpusat untuk event internal (pelatihan, gathering) dan eksternal (launching proyek developer, open house) — 2 entity (`events`, `event_registrations`), 5 REQ. Bergantung M01, M04 (kelas live), M06 (event launching proyek) — MIS Batch 3 bersama M03. Migration `0010` **sudah ditulis**, namun ditemukan **isu paling serius kedua** setelah T1-02 (MP-03): RLS `events_manage` memberi hak `FOR ALL` (termasuk mengubah `status`) kepada `submitted_by = auth.uid()` **tanpa pembatasan kolom** — secara teknis Developer Partner (atau siapa pun pengaju) **dapat men-self-approve** event miliknya sendiri dengan mengirim `status: 'published'` langsung, tanpa melalui Admin. Ini **diperkuat** (bukan dikontradiksi) oleh Authorization Spec yang juga keliru memberi DevPartner `own` untuk `PERM-M05-Approve-Event` — pola yang sama seperti gap di modul lain, namun **kali ini RLS ikut permisif**, bukan hanya dokumentasi. Ditemukan juga **kontradiksi internal PRD kedua** (setelah M04) soal akses Manager. Go/No-Go: ✅ **GO** *(setelah M04+M06 selesai)* — **dengan syarat 2 isu di atas diperbaiki sebelum modul dianggap selesai**.

---

# 2. Purpose

Menyediakan spesifikasi implementasi lengkap Modul 5 — scope fungsional, kontrak API, aturan bisnis, matriks permission, kriteria selesai — termasuk resolusi gap keamanan approval event yang ditemukan.

---

# 3. Scope

- Tabel `events`, `event_registrations` (ERD v1.3 §2.21-2.22) beserta RLS.
- Endpoint `GET /events`, `POST /events` (Admin+), `POST /developer-partners/events` (DevPartner), `POST /events/{id}/rsvp` (API Spec §11.2).
- Layar: Kalender Event, Detail Event & RSVP, Pengajuan Event (DevPartner), Kelola Event (Admin).
- Reminder H-1 dan H-1 jam (Vercel Cron, ADR-006).
- Auto waiting list saat kuota penuh.
- Integrasi tautan ke Learning Center (`related_course_id`) dan Direktori Developer (`related_project_id`).

---

# 4. Out of Scope

- **Konten kursus/materi kelas live** — milik M04; M05 hanya menyimpan referensi `related_course_id`.
- **Detail proyek developer** — milik M06; M05 hanya menyimpan referensi `related_project_id`.
- **Approval workflow eksplisit** (endpoint `PUT /admin/events/{id}/approve`/`reject`) — **tidak terdaftar di API Specification** (lihat Bagian 46, gap dokumentasi yang berimplikasi ke Bagian 51 Konflik #1).
- Pembuatan kode, wireframe visual, dan sprint breakdown.

---

# 5. Business Objective

Menjadi kanal terpusat komunikasi acara — memfasilitasi pelatihan internal, gathering, dan kolaborasi promosi dengan developer (launching proyek), sambil menjaga kualitas konten lewat moderasi Admin untuk pengajuan pihak eksternal.

---

# 6. Business Value

- Meningkatkan partisipasi agen di pelatihan/event lewat kalender terpusat & reminder otomatis.
- Membuka kanal promosi tambahan bagi developer partner (launching proyek) — nilai tambah kerjasama M06.
- Waiting list otomatis mencegah overbooking sekaligus menjaga data minat riil.

---

# 7. Dependency Summary (Berdasarkan MDM)

| Arah | Isi |
|---|---|
| **Bergantung Pada** | **M01, M04 (kelas live), M06 (event launching proyek)** — MDM Bagian 3, Technical Spec §M05. |
| **Dibutuhkan Oleh** | Tidak ada modul lain yang bergantung M05 secara hard dependency (MDM Dependency Matrix Bagian 3 — M05 bukan Provider bagi modul manapun). |
| **Circular Dependency** | Tidak ditemukan. |

---

# 8. Module Position (Berdasarkan MIS)

| Dimensi MIS | Nilai |
|---|---|
| Kategori (MIS §2) | **Supporting** |
| Urutan Implementasi (MIS §3) | **#9 dari 13** |
| Layer (MIS §13) | **Layer 3 — Transactional Core** |
| Prioritas (MIS §14) | **P2** |
| Batch Paralel (MIS §6) | **Batch 3** — bersama M03, namun MIS merekomendasikan M03 fokus tunggal, M05 dapat ditunda ke batch berikutnya jika kapasitas terbatas |
| Alasan Posisi (MIS §4) | "Butuh M04 (kelas live) dan M06 (event launching proyek) — keduanya baru selesai di urutan 5-6." |
| Go/No-Go (MIS §15) | ✅ **GO** *(setelah M04+M06 selesai)* — "Baseline, dependency sempit" |

---

# 9. Stakeholder

| Stakeholder | Kepentingan |
|---|---|
| Superadmin, Manager, Admin | Pembuat & moderator event |
| Developer Partner | Pengaju event launching proyek |
| Agen | Peserta (RSVP) |
| M04, M06 | Sumber referensi (`related_course_id`/`related_project_id`) |
| M08 | Konsumen notifikasi reminder |

---

# 10. Actor

| Actor | Peran |
|---|---|
| Superadmin, Admin | Buat & publish event langsung (`all`) |
| Manager | Buat & publish event langsung (`all`) — **OD-17 Resolved [2026-08-06], Opsi A** |
| Developer Partner | Ajukan event launching proyek (butuh approval) |
| Agen | RSVP/daftar event |

---

# 11. User Story

| ID | Story | Sumber |
|---|---|---|
| US-M05-01 | Sebagai Agen, saya ingin melihat kalender event dengan filter kategori, agar saya tahu jadwal relevan. | REQ-M05-001 |
| US-M05-02 | Sebagai Agen, saya ingin RSVP event, agar terdaftar sebagai peserta. | REQ-M05-002 |
| US-M05-03 | Sebagai Agen, saya ingin menerima reminder H-1 dan H-1 jam, agar tidak lupa hadir. | REQ-M05-003 |
| US-M05-04 | Sebagai Developer Partner, saya ingin mengajukan event launching proyek, agar dapat dipromosikan ke agen. | REQ-M05-004 |
| US-M05-05 | Sebagai Agen, jika kuota penuh saya ingin masuk waiting list, agar tetap berpeluang jika ada slot kosong. | REQ-M05-005 |

---

# 12. Functional Requirement

| REQ ID | Requirement | Status Cakupan |
|---|---|---|
| REQ-M05-001 s.d. 005 | Seluruh requirement inti event | In Scope, dengan catatan gap approval workflow (Bagian 51) |

---

# 13. Non Functional Requirement

| Kategori | Requirement | Sumber |
|---|---|---|
| Reminder terjadwal | Vercel Cron Jobs — H-1 dan H-1 jam sebelum `start_at` | ADR-006, Technical Spec §M05 |
| Index performa | `idx_events_start_at` (partial, `WHERE deleted_at IS NULL`) | Migration `0010` |
| Response time | **Not Defined** | Open Issue |

---

# 14. Business Rule

Dari PRD Modul 5:

1. Event dari Developer Partner **harus** melalui approval Admin sebelum tayang.
2. Kuota penuh → sistem otomatis tutup pendaftaran/buat waiting list.
3. **Superadmin, Manager, Admin** dapat membuat & publish langsung tanpa approval; **Agen dan Developer Partner** hanya RSVP/ajukan (DevPartner khusus event miliknya), tanpa hak publikasi langsung. — **OD-17 Resolved [2026-08-06], Opsi A: konsisten dengan Acceptance Criteria PRD yang sudah direvisi.**

---

# 15. Workflow Summary

**Alur 5.1 — Agen RSVP (User Flow):** Buka "Kalender Event" → lihat kalender (kategori berwarna beda) → filter → klik event → detail (deskripsi, lokasi/link, host, kuota tersisa) → "Daftar/RSVP" → kuota penuh→tawarkan Waiting List; kuota tersedia→konfirmasi→status "Terdaftar" → reminder H-1 & H-1 jam otomatis.

**Alur 5.2 — Admin Buat Event:** "Kelola Event" → "+ Buat Event Baru" → isi form → **Publish langsung** (event internal admin) → tayang di kalender agen.

**Alur 5.3 — Developer Partner Ajukan Event:** Login portal terbatas → "Ajukan Event" → isi form (terkait proyek M06) → submit → status "Menunggu Approval Admin" → Admin review → Reject (notifikasi alasan) atau Approve → tayang di kalender agen.

---

# 16. Screen List

| Kode Layar | Nama | Aktor |
|---|---|---|
| SCR-M05-01 | Kalender Event (`/events`) | Agen (dan publik terbatas) |
| SCR-M05-02 | Detail Event & RSVP (`/events/[slug]`) | Agen |
| SCR-M05-03 | Pengajuan Event (`/dashboard/events/submit`) | Developer Partner |
| SCR-M05-04 | Kelola Event (`/admin/events`) | Superadmin, Manager, Admin (OD-17 Resolved) |

---

# 17. Screen Detail

### SCR-M05-01 — Kalender Event
- Tampilan kalender bulanan + list, filter Kategori (4 nilai).

### SCR-M05-02 — Detail Event & RSVP
- Aksi "RSVP/Daftar" → kuota penuh: tombol berubah "Masuk Waiting List".
- Reminder H-1/H-1 jam otomatis terkirim ke peserta terdaftar.

### SCR-M05-03 — Pengajuan Event (khusus Developer Partner)
- Input: Nama event*, Tanggal*, Lokasi*, Deskripsi*, Kuota*.
- Output: submit → status "Menunggu Approval Admin".

### SCR-M05-04 — Kelola Event
- Aksi: **"Setujui/Tolak pengajuan Developer Partner"** (Functional Spec §4.5) — **tidak ada endpoint API terdaftar untuk aksi ini** (lihat Bagian 46/51), buat event internal langsung, kelola daftar peserta.

---

# 18. Navigation Flow

```
/events (kalender) → filter kategori → /events/[slug] (detail)
     └─ "RSVP" → kuota tersedia→Terdaftar | kuota penuh→Waiting List
          └─ (async, Vercel Cron) reminder H-1 & H-1 jam

/dashboard/events/submit (DevPartner) → submit → pending_approval
     └─ (async) Admin approve/reject via /admin/events (mekanisme endpoint: lihat Konflik #1)

/admin/events → "+ Buat Event Baru" → Publish langsung (Admin/Superadmin/Manager — OD-17 Resolved)
```
Sumber: User Flow §5.1-5.3; Functional Spec §4.5.

---

# 19. API Summary

| Endpoint | Fungsi |
|---|---|
| `GET /events` | Daftar/kalender event |
| `POST /events` | Buat event langsung (Superadmin/Manager/Admin) |
| `POST /developer-partners/events` | Ajukan event (Developer Partner, butuh approval) |
| `POST /events/{id}/rsvp` | RSVP/daftar |

> **Gap eksplisit:** **Tidak ada endpoint approve/reject** (`PUT /admin/events/{id}/approve` atau sejenis) terdaftar di API Specification — padahal Functional Spec §4.5 dan User Flow §5.3 sama-sama mendeskripsikan aksi ini sebagai bagian alur wajib. Lihat Bagian 51 Konflik #1.

---

# 20. Endpoint Mapping

| Method | Endpoint | Auth (API Spec) | `granted_scope` |
|---|---|---|---|
| GET | `/events` | Public/Authenticated | `all` publik hanya `published`, RLS `events_select_published` |
| POST | `/events` | Superadmin, Manager, Admin | `all` |
| POST | `/developer-partners/events` | Developer Partner | `own` — **RLS mengizinkan submitter mengelola row-nya secara penuh (`FOR ALL`), termasuk kolom `status`** (Bagian 51 Konflik #1) |
| POST | `/events/{id}/rsvp` | Agen | `own` |
| *(tidak ada endpoint terdaftar)* | Approve/reject event | — | — |

---

# 21. Request Validation

| Endpoint | Field | Validasi |
|---|---|---|
| `POST /events`, `/developer-partners/events` | `category` | Enum 4 nilai |
| | `start_at` | Wajib (NOT NULL skema) |
| | `quota` | Opsional, NULL = tanpa batas |
| `POST /events/{id}/rsvp` | — | UNIQUE `(event_id, agent_id)` mencegah RSVP ganda; status `waitlist` otomatis jika kuota penuh — **logic penentuan "kuota penuh" tidak eksplisit di skema** (tidak ada trigger/counter otomatis terlihat di migration, kemungkinan dihitung on-the-fly di service layer — Open Issue Bagian 46) |

---

# 22. Response Structure

Mengikuti envelope standar API Spec §0.2. Tidak ada struktur khusus M05.

---

# 23. Database Impact

| Aspek | Detail |
|---|---|
| Tabel baru | `events`, `event_registrations` |
| Index | `idx_events_start_at` (partial) |
| RLS | `events_select_published` (publik: `published` + submitter lihat miliknya + all-scope); **`events_manage` (`FOR ALL`): `submitted_by=auth.uid() OR auth_has_scope_all(...)` — TIDAK ADA pembatasan kolom, submitter dapat mengubah `status` sendiri**; `event_registrations_own` |
| Soft-delete | **Hanya `events`** termasuk 8 tabel wajib; `event_registrations` tidak |
| FK opsional | `related_course_id` (M04), `related_project_id` (M06) — keduanya NULLABLE, tidak memblokir M05 jika M04/M06 belum lengkap datanya |

---

# 24. Entity Mapping

| ENT ID | Tipe | Tabel Fisik | REQ Terkait |
|---|---|---|---|
| `ENT-M05-Event` | Root | `events` | REQ-M05-001..004 |
| `ENT-M05-EventRegistration` | Association | `event_registrations` | REQ-M05-002, 005 |

---

# 25. Migration Requirement

| Item | Status |
|---|---|
| `0010_m05_events.sql` | **Sudah ditulis** — 2 tabel + RLS |
| Prasyarat | `0001`, `0003` (`users`), `0006` (`developer_projects`), `0009` (`courses`) |
| Status eksekusi | **Belum dieksekusi** ke database live |
| **Temuan kritis** | `events_manage` perlu dipecah: submitter (DevPartner) hanya boleh INSERT + UPDATE non-`status` field (atau `status` terbatas ke `pending_approval`/tarik-ajuan), sedangkan transisi ke `published`/`rejected` **wajib** khusus `auth_has_scope_all` — lihat Bagian 51 Konflik #1 untuk detail rekomendasi. |

---

# 26. Permission Matrix

Sumber: Authorization Spec §2.6:

| Permission ID | Entity | Aksi | Superadmin/Manager/Admin | DevPartner |
|---|---|---|---|---|
| `PERM-M05-Create/View/Update/Delete-Event` | `ENT-M05-Event` | C/V/U/D | all | own |
| **`PERM-M05-Approve-Event`** | `ENT-M05-Event` | Approve | all | **own** |
| `PERM-M05-Create/View-EventRegistration` | `ENT-M05-EventRegistration` | C/V | all | — (Agent: own) |

> **`PERM-M05-Approve-Event` = `own` untuk Developer Partner secara harfiah berarti DevPartner dapat approve event miliknya sendiri** — bertentangan langsung dengan PRD Business Rule #1 ("harus melalui approval Admin"). **Berbeda dari pola serupa di modul lain** (di mana RLS biasanya tetap ketat meski dokumentasi keliru), **di sini RLS migration `0010` justru ikut permisif** (`events_manage FOR ALL` tanpa pembatasan kolom `status`) — dua sumber independen (Authorization Spec + RLS) sama-sama mengizinkan, menjadikan ini gap nyata, bukan sekadar salah dokumentasi.

---

# 27. Validation Matrix

| Field | Wajib? | Tipe | Aturan |
|---|---|---|---|
| `events.title` | Ya | VARCHAR(200) | NOT NULL |
| `events.category` | Ya | Enum | 4 nilai |
| `events.status` | Ya (default `pending_approval`) | Enum | `pending_approval`→`published`/`rejected`/`cancelled` — **transisi tidak dibatasi per-role di level constraint** |
| `event_registrations.status` | Ya (default `registered`) | Enum | `registered`\|`waitlist`\|`attended`\|`cancelled` |

---

# 28. Error Handling

| Skenario | HTTP Status | Sumber |
|---|---|---|
| RSVP ganda ke event yang sama | 409 (UNIQUE violation) | Migration `0010` |
| **Developer Partner set `status: 'published'` langsung via update** | **Saat ini: 200 (berhasil, tidak ditolak)** — seharusnya 403 (Konflik #1) | — |
| Non-DevPartner/Admin mencoba `POST /developer-partners/events` | 403 | RLS `events_manage` (submitter check gagal) |

---

# 29. Notification

| Trigger | Penerima |
|---|---|
| Reminder H-1, H-1 jam | Peserta terdaftar (`registered`) |
| Event dari DevPartner di-approve/reject | Developer Partner ybs |
| Event baru dari DevPartner masuk antrean | Admin (tersirat dari alur, tidak eksplisit di REQ) |

---

# 30-31. Activity Log / Audit Trail

**Not Defined secara eksplisit** untuk M05 — tidak ada REQ yang menyebut audit log. Mengingat temuan Konflik #1, **audit log untuk perubahan `status` event sangat direkomendasikan** meski tidak eksplisit diwajibkan REQ, sebagai kompensasi mitigasi risiko sebelum RLS diperbaiki.

---

# 32-33. External Integration / AI Capability

Tidak ada integrasi eksternal langsung (link meeting online adalah field teks, bukan integrasi API kalender/video call). Tidak ada AI capability.

---

# 34. Performance Requirement

**Not Defined secara M05-spesifik** di luar index `idx_events_start_at`.

---

# 35. Security Requirement

1. **(Kritis, lihat Konflik #1)** RLS `events_manage` wajib direvisi agar submitter tidak dapat mengubah `status` menjadi `published` sendiri.
2. RSVP publik terbatas ke Agen authenticated (`event_registrations_own`), bukan `anon` — berbeda dari `listing_leads`/`listing_views` (M03) yang mengizinkan `anon`.

---

# 36-38. Accessibility / Responsive / SEO Impact

**Not Defined secara M05-spesifik.** SEO: Kalender/Detail Event **tidak termasuk** 5 halaman wajib SSR/SSG di SEO Spec §1.1 — kemungkinan CSR standar, tidak eksplisit dinyatakan.

---

# 39-41. Configuration / Environment Variable / Feature Flag

Tidak ada `system_configs` khusus M05. Tidak ada environment variable baru. Tidak ada feature flag formal.

---

# 42. Acceptance Criteria

Dari PRD Modul 5 (v1.2, pasca-resolusi OD-17):
- [ ] Agen dapat melihat kalender event dan mendaftar (RSVP).
- [ ] Superadmin, Admin, dan Manager dapat membuat event baru langsung tayang tanpa approval tambahan; Developer Partner hanya dapat mengajukan event yang memerlukan approval.
- [ ] Sistem mengirim reminder otomatis ke peserta terdaftar.

> **✅ Resolved [2026-08-06] — OD-17.** Butir kedua sebelumnya menempatkan Manager di kelompok wajib-approval, bertentangan dengan Business Rule PRD yang memasukkan Manager ke kelompok "dapat publish langsung". Owner memilih **Opsi A**: Manager publish langsung tanpa approval. PRD Acceptance Criteria sudah direvisi — lihat `PRD-RUMAHAGEN-v1_2.md` Modul 5.

---

# 43. QA Test Scenario

| # | Skenario | Hasil Diharapkan |
|---|---|---|
| 1 | Agen RSVP event dengan kuota tersisa | Status `registered` |
| 2 | Agen RSVP event kuota penuh | Status `waitlist` |
| 3 | Agen RSVP event yang sama 2x | 409 |
| 4 | **Developer Partner submit event, lalu langsung PATCH `status: 'published'` ke event miliknya** | **Saat ini: berhasil (200)** — seharusnya ditolak, wajib diperbaiki sebelum DoD (Konflik #1) |
| 5 | Manager buat event baru | **✅ Resolved [2026-08-06], OD-17 Opsi A:** langsung `published`, mengikuti Business Rule. Catatan implementasi: Manager perlu dimasukkan ke scope `auth_has_scope_all('M05_event','manage')` saat seed `role_permissions` dibuat, agar memakai jalur `events_manage_all` (Batch 1) alih-alih `events_update_own` |
| 6 | Reminder H-1 terkirim ke seluruh peserta `registered` (bukan `waitlist`/`cancelled`) | Berhasil, hanya status `registered` yang menerima |

---

# 44. Edge Case

1. Peserta di waiting list saat ada yang `cancelled` dari daftar `registered` — **Not Defined** apakah ada promosi otomatis dari waiting list ke registered, atau murni manual.
2. Event dengan `related_course_id`/`related_project_id` yang kemudian dihapus di M04/M06 — FK `ON DELETE SET NULL`, event tetap ada tanpa referensi (graceful, tidak error).

---

# 45. Risk Analysis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| **Self-approval event oleh submitter** (Konflik #1) | Developer Partner dapat mem-publish event promosi tanpa moderasi Admin — bypass kontrol kualitas konten yang eksplisit diwajibkan PRD | **✅ Diperbaiki [2026-08-06]** — RLS `events_manage` dipisah (submitter terbatas `pending_approval`/`cancelled`, transisi `published`/`rejected` eksklusif all-scope), lihat `0010_m05_events.sql` versi terbaru. Endpoint approve/reject API **belum ditambahkan** — dilaporkan sebagai temuan terpisah untuk API Specification, di luar scope perbaikan RLS. 🟢 **VERIFIKASI 9 Agustus 2026: klaim di atas TIDAK TERBUKTI saat dicek (migration masih 1 policy tunggal) — sekarang BENAR-BENAR diperbaiki via `0010_m05_events-FIXED.sql`. Status Resolved terverifikasi.** |
| Kontradiksi internal PRD soal Manager (Konflik #2) | Ambiguitas implementasi RBAC layar Kelola Event | **✅ Diperbaiki [2026-08-06]** — OD-17 dijawab Owner (Opsi A: Manager publish langsung), PRD direvisi |
| Tidak ada endpoint approve/reject terdokumentasi | Tim tidak tahu kontrak API pasti untuk aksi krusial ini | Tambahkan ke API Specification sebelum implementasi endpoint dimulai |

---

# 46. Known Limitation

1. ~~**RLS `events_manage` mengizinkan self-approval**~~ — **Diperbaiki [2026-08-06]**, lihat `0010_m05_events.sql` versi terbaru (T1-03, Issue Register). 🟢 **VERIFIKASI 9 Agustus 2026: klaim TIDAK TERBUKTI saat dicek — sekarang BENAR-BENAR diperbaiki via `0010_m05_events-FIXED.sql`.**
2. **Tidak ada endpoint approve/reject event terdokumentasi** di API Specification, meski disebut di Functional Spec & User Flow. **(Belum diselesaikan — direkomendasikan sebagai tindak lanjut terpisah untuk update API Specification, di luar scope perbaikan RLS Batch 1 [2026-08-06].)**
3. **Kontradiksi internal PRD** soal Manager (Business Rule vs Acceptance Criteria) — pola sama MP-04.
4. **Logic waiting list→registered promotion** tidak dirinci.

---

# 47-50. Dependency Checklist / DoR / DoD / Traceability

**Dependency Checklist:** M01 ✅ (MP-01 ada), M04 ✅ (MP-04 ada), M06 ✅ (MP-06 ada) — seluruh dependency modul sudah punya MP.

**Definition of Ready:** PRD/ERD/Migration Baseline ✅; **Konflik #1 dan #2 wajib diklarifikasi/diperbaiki sebelum Ready penuh**.

**Definition of Done:** tambahan khusus — Test QA #4 (Bagian 43) wajib lolos sebagai gate non-negotiable sebelum modul dianggap selesai; endpoint approve/reject wajib ditambahkan ke API Specification dan diimplementasikan.

**Traceability:** 5 REQ-M05-XXX ↔ 2 ENT ↔ 4 endpoint (+ gap approve/reject) ↔ 7 PERM-M05-XXX ↔ ADR-006.

---

# 51. Conflict Analysis

| # | Konflik | Dokumen Terlibat | Resolusi |
|---|---|---|---|
| 1 | **RLS `events_manage` (migration `0010`) memberi `submitted_by=auth.uid()` hak `FOR ALL` tanpa pembatasan kolom** — termasuk mengubah `status` menjadi `published` sendiri. Ini **diperkuat** oleh Authorization Spec §2.6 yang juga (keliru) memberi `PERM-M05-Approve-Event` = `own` ke Developer Partner. **Tidak ada endpoint approve/reject terpisah** di API Specification yang bisa dijadikan titik enforcement alternatif. Bertentangan langsung dengan PRD Business Rule #1 ("Event dari developer partner harus melalui approval admin sebelum tayang") dan Functional Spec/User Flow yang mendeskripsikan alur approval eksplisit. | Migration `0010`, Authorization Spec §2.6 (keduanya permisif) vs PRD v1.2 Business Rule, Functional Spec §4.5, User Flow §5.3 (tiga sumber menuntut approval wajib) | **Bug migration nyata, prioritas setara T1-01/T1-02** — 3 dari 5 sumber menuntut approval wajib, hanya RLS dan 1 baris Authorization Spec yang permisif (dan RLS adalah satu-satunya penegak teknis yang benar-benar berjalan). **Wajib** revisi `events_manage`: pisahkan jadi kebijakan submitter hanya boleh INSERT/UPDATE non-`status` (atau `status` terbatas nilai `pending_approval`/`cancelled` milik sendiri), transisi ke `published`/`rejected` eksklusif `auth_has_scope_all`. Tambahkan endpoint approve/reject eksplisit ke API Specification. **Status: RLS Diperbaiki [2026-08-06], lihat `0010_m05_events.sql` versi terbaru** (dipisah jadi `events_insert_own`/`events_update_own`/`events_delete_own`/`events_manage_all`). **Sisi dokumentasi (Authorization Spec §2.6, DevPartner=`own` untuk Approve-Event) ✅ Diperbaiki [2026-08-06], audit v1.1** — dikoreksi ke `none`, konsisten RLS yang sudah benar. **Endpoint approve/reject API Specification: belum ditambahkan** — dilaporkan sebagai temuan terpisah, di luar scope task perbaikan RLS ini. 🟢 **VERIFIKASI 9 Agustus 2026: klaim RLS "Diperbaiki 2026-08-06" TIDAK TERBUKTI** — `0010_m05_events.sql` yang diverifikasi (dikonfirmasi Owner sebagai versi terbaru) masih memakai 1 policy `events_manage` tunggal, identik versi pra-perbaikan. **Sekarang BENAR-BENAR diperbaiki [2026-08-09]** via `0010_m05_events-FIXED.sql`, persis 4 policy yang diklaim. Status Resolved terverifikasi. (Koreksi Authorization Spec §2.6 tidak terdampak temuan ini — terverifikasi independen sebelumnya.) |
| 2 | **PRD Modul 5 bertentangan dengan dirinya sendiri**: Business Rule menyatakan *"Superadmin, Manager, dan Admin dapat membuat & mempublikasikan event secara langsung tanpa approval tambahan"* — tapi Acceptance Criteria menyatakan *"Manager dan Developer Partner hanya dapat mengajukan event yang memerlukan approval."* Manager ditempatkan di dua kelompok berbeda. | PRD v1.2 (inkonsistensi internal, pola identik MP-04 Konflik T2-01) | **Tidak dapat diresolusikan otomatis** — sama seperti kasus M04, wajib keputusan eksplisit Owner. Dicatat sebagai **Tier 2 baru** di Issue Register konsolidasi (T2-02), diformalkan sebagai **OD-17**. **Status: ✅ Resolved [2026-08-06]** — Owner memilih Opsi A (Manager publish langsung, mengikuti Business Rule), konsisten dengan OD-16 (MP-04). PRD Acceptance Criteria Modul 5 direvisi — lihat `PRD-RUMAHAGEN-v1_2.md`. |

---

# 52. Recommendation

1. **Perbaiki RLS `events_manage` SEBELUM modul dianggap selesai** (Konflik #1) — ini bug kedua paling berdampak bisnis setelah T1-02 (MP-03), karena membuka celah bypass moderasi konten pihak eksternal.
2. **Tambahkan endpoint approve/reject event** ke API Specification — saat ini gap total, tidak ada kontrak API untuk aksi krusial ini.
3. ~~Eskalasi Konflik #2 (Manager) bersamaan dengan T2-01 (MP-04) ke Owner~~ — **✅ Resolved [2026-08-06]**, OD-17 dijawab Opsi A, konsisten dengan OD-16 (MP-04).
4. ~~Update Issue Register konsolidasi — tambah T1-03 dan T2-02~~ — **✅ Done** (T1-03 Closed Batch 1, T2-02 Closed Batch 2/OD-17).
5. **Setelah M05 selesai**, lanjutkan ke M07 (DBR Scoring) sesuai urutan MIS Bagian 3 urutan #10.

---

*Module Planning ini disusun murni berdasarkan dokumen yang diupload — tidak ada requirement yang diubah/ditambah/dihapus, tidak ada perubahan arsitektur/API/skema database. Konflik #1 adalah temuan gap keamanan paling signifikan kedua dari seluruh MP yang sudah disusun — ditemukan lewat pemeriksaan silang migration, Authorization Spec, dan alur bisnis PRD/Functional Spec/User Flow secara bersamaan.*
