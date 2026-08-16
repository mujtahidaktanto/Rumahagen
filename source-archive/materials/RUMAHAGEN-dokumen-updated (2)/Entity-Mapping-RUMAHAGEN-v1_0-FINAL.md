# ENTITY MAPPING
## Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 5 Agustus 2026
**Status:** ✅ Baseline (BERLAKU) — naik dari Draft, 5 Agustus 2026, disahkan Owner (Mujtahid Aktanto)
**Riwayat Versi:** v1.0 Draft (5 Agustus 2026, menunggu pengesahan) → v1.0 Baseline (5 Agustus 2026, disahkan Owner). Tidak ada perubahan konten antara kedua status ini — murni transisi lifecycle dokumen.
**Owner:** Database Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted)

> **Dasar penyusunan:** Dokumen ini **belum pernah ada** sebelumnya di proyek (dikonfirmasi lewat `document-governance-baseline-register.md` Governance Notes poin 3) — disusun dari nol sesuai `Engineering-Alignment-Framework-v1.0.md` Bab 18 (Entity Identification Standard), berdasarkan **PRD-RUMAHAGEN.md v1.2** (Langkah 1, otoritatif untuk cakupan modul/requirement) dengan **ERD-Skema-Database-...v1.1/v1.2** sebagai referensi struktur tabel fisik (bukan sumber definisi entity — Entity Mapping adalah satu-satunya dokumen berwenang mendaftarkan `ENT-XXX` baru, EAF Bab 18.3).

> **Prinsip retrofit yang diterapkan (EAF Bab 18.2):** (1) nama entity PascalCase singular; (2) satu entity konseptual = satu ID meski terealisasi banyak tabel fisik; (3) entity anak mewarisi kode modul dari Aggregate Root; (4) entity bersama lintas modul (*shared kernel*) diberi kode modul asal, direferensikan modul lain tanpa duplikasi ID.

---

## 1. Registrasi Entity — Seluruh 13 Modul

| ENT ID | Tipe | Tabel Fisik | Requirement Terkait | Deskripsi |
|---|---|---|---|---|
| `ENT-M01-User` | Root | `users` | REQ-M01-001..006 | Akun pengguna seluruh role internal/eksternal berakun; tabel induk relasi role |
| `ENT-M01-AgentVerificationDocument` | Child of User | `agent_verification_documents` | REQ-M01-003 | Dokumen legalitas agen (KTP/NPWP/sertifikasi) untuk verifikasi registrasi |
| `ENT-M02-AgentProfile` | Root | `agent_profiles` | REQ-M02-001..003,007 | Profil publik/privat agen — kartu nama digital |
| `ENT-M02-AgentReview` | Root | `agent_reviews` | REQ-M02-006 | Review/rating agen oleh Buyer, wajib moderasi |
| `ENT-M03-Listing` | Root | `listings` | REQ-M03-001..015 | Aggregate root inti transaksi — properti yang dipasarkan agen |
| `ENT-M03-ListingPhoto` | Child of Listing | `listing_photos` | REQ-M03-002 | Foto listing, multi-upload |
| `ENT-M03-ListingVideo` | Child of Listing | `listing_videos` | REQ-M03-002 | Video/virtual tour listing (opsional) |
| `ENT-M03-Amenity` | Root (reference) | `amenities` | REQ-M03-002 | Master data fasilitas (kolam renang, keamanan 24 jam, dsb) |
| `ENT-M03-ListingAmenity` | Association (Listing x Amenity) | `listing_amenities` | REQ-M03-002 | Junction N:N Listing-Amenity |
| `ENT-M03-ListingPriceHistory` | Child of Listing | `listing_price_history` | REQ-M03-012 | Riwayat perubahan harga listing |
| `ENT-M03-ListingLead` | Child of Listing | `listing_leads` | REQ-M03-004,005 | Lead event dari klik CTA WhatsApp — direferensikan M02 (AgentReview) & M07 (DbrSimulation) |
| `ENT-M03-ListingView` | Child of Listing (log/transient) | `listing_views` | REQ-M03-006 | Log tampilan listing — hard-delete (bukan entitas beraudit) |
| `ENT-M03-RefProvince` | Root (shared kernel) | `ref_provinces` | REQ-M03-014 | Data referensi wilayah — shared kernel, dipakai juga M06 |
| `ENT-M03-RefCity` | Root (shared kernel) | `ref_cities` | REQ-M03-014 | idem, child of RefProvince |
| `ENT-M03-RefDistrict` | Root (shared kernel) | `ref_districts` | REQ-M03-014 | idem, child of RefCity |
| `ENT-M03-RefVillage` | Root (shared kernel) | `ref_villages` | REQ-M03-014 | idem, child of RefDistrict — disiapkan, belum dipakai Listing |
| `ENT-M04-Course` | Root | `courses` | REQ-M04-001..003,006 | Kursus/pelatihan agen |
| `ENT-M04-CourseLesson` | Child of Course | `course_lessons` | REQ-M04-003 | Materi/lesson dalam kursus |
| `ENT-M04-Quiz` | Child of Course | `quizzes` | REQ-M04-003,004 | Kuis evaluasi kursus |
| `ENT-M04-QuizQuestion` | Child of Quiz | `quiz_questions` | REQ-M04-003 | Bank soal kuis |
| `ENT-M04-QuizOption` | Child of QuizQuestion | `quiz_options` | REQ-M04-003 | Pilihan jawaban tiap soal |
| `ENT-M04-Enrollment` | Association (User x Course) | `enrollments` | REQ-M04-002,005 | Pendaftaran agen ke kursus (self-enroll) |
| `ENT-M04-QuizAttempt` | Child of Enrollment | `quiz_attempts` | REQ-M04-004 | Percobaan pengerjaan kuis |
| `ENT-M04-Certificate` | Association (User x Course) | `certificates` | REQ-M04-004 | Sertifikat digital kelulusan — disinkron ke AgentProfile (M02) |
| `ENT-M05-Event` | Root | `events` | REQ-M05-001..004 | Event internal/eksternal (pelatihan, launching, open house) |
| `ENT-M05-EventRegistration` | Association (Event x User) | `event_registrations` | REQ-M05-002,005 | RSVP/pendaftaran event |
| `ENT-M06-DeveloperPartner` | Root | `developer_partners` | REQ-M06-001 | Mitra developer bekerja sama dengan agensi |
| `ENT-M06-DeveloperProject` | Root | `developer_projects` | REQ-M06-001,002,005 | Proyek developer — sumber auto-generate Listing kategori Primary |
| `ENT-M06-DeveloperProjectMedia` | Child of DeveloperProject | `developer_project_media` | REQ-M06-004 | Materi marketing kit proyek |
| `ENT-M06-AgentProjectClaim` | Association (User x DeveloperProject) | `agent_project_claims` | REQ-M06-002,006 | Klaim proyek oleh agen untuk dijadikan Listing |
| `ENT-M07-DbrSimulation` | Root | `dbr_simulations` | REQ-M07-001..003,005,006 | Hasil simulasi kalkulator DBR per agen |
| `ENT-M07-DbrConfig` | Root (reference/config) | `dbr_config` | REQ-M07-004 | Parameter threshold DBR & suku bunga default |
| `ENT-M08-Notification` | Root | `notifications` | REQ-M08-003,005 | Notifikasi in-app/email/push per user |
| `ENT-M09-SystemConfig` | Root (reference/config) | `system_configs` | REQ-M09-005 | Konfigurasi sistem inti (threshold, expired listing, GTM/GA4/GSC) |
| `ENT-M09-AuditLog` | Root | `audit_logs` | REQ-M09-002; REQ-M10-007 | Audit trail aksi admin & perubahan permission — diperluas M12 (organization_id nullable) |
| `ENT-M10-Role` | Root | `roles` | REQ-M10-001,004 | 7 role final proyek (resolusi OD-02) |
| `ENT-M10-Permission` | Root | `permissions` | REQ-M10-002,003 | Master aksi yang dapat di-permission-kan |
| `ENT-M10-RolePermission` | Association (Role x Permission) | `role_permissions` | REQ-M10-002,003,007 | Matriks Role x Permission aktual |
| `ENT-M11-UrlRedirect` | Root | `url_redirects` | REQ-M11-002 | Pencatatan redirect 301/302 saat slug berubah/entitas dihapus |
| `ENT-M12-Organization` | Root | `organizations` | REQ-M12-001,002,006..009,019 | Entitas organisasi berdiri sendiri — unit kolaborasi tim |
| `ENT-M12-OrganizationMember` | Child of Organization | `organization_members` | REQ-M12-003,016 | Keanggotaan Leader/Member, constraint 1 agen = 1 organization aktif |
| `ENT-M12-OrganizationInvitation` | Child of Organization | `organization_invitations` | REQ-M12-010..013 | Undangan 2-arah (leader_invite/agent_request) |
| `ENT-M13-AiProvider` | Root (reference) | `ai_providers` | REQ-M13-002,008 | Provider AI assistant dikurasi Admin (Gemini/Groq/Mistral/GitHub Models) |
| `ENT-M13-AgentAiConnection` | Root | `agent_ai_connections` | REQ-M13-001,007 | Koneksi API key BYOK per user |

**Total: 44 Entity terdaftar** (39 dari 11 modul existing + 5 dari Modul 12/13 baru).

---

## 2. Shared Kernel (Entity Lintas Modul)

| Entity | Modul Pemilik (Asal) | Modul Pemakai Lain | Aturan |
|---|---|---|---|
| `ENT-M03-RefProvince/RefCity/RefDistrict/RefVillage` | M03 (Listing — pertama mendefinisikan kebutuhan dropdown cascading wilayah) | M06 (`developer_projects.city_id`) | M06 **wajib** mereferensikan ID yang sama, dilarang membuat entity wilayah duplikat (EAF 18.2, larangan DRY) |
| `ENT-M04-Certificate` | M04 (Learning Center) | M02 (`AgentProfile` — badge ditampilkan via query relasi, bukan field terpisah) | M02 **hanya membaca** relasi ke Certificate, tidak mendefinisikan ulang |
| `ENT-M03-ListingLead` | M03 (Listing) | M02 (`AgentReview.listing_lead_id`), M07 (`DbrSimulation.listing_id` — relasi ke Listing bukan ke Lead langsung) | M02 mereferensikan `ENT-M03-ListingLead` sebagai bukti interaksi nyata sebelum review dapat disubmit |
| `ENT-M09-AuditLog` | M09 (Admin/Sistem) | M10 (perubahan permission), M12 (`organization_id` nullable — perluasan aditif, bukan entity baru) | Diperluas (tambah kolom), bukan tabel/entity baru terpisah, sesuai `Architecture-Evolution-Proposal-...` §7 |

---

## 3. Permission ID — Security by Design (EAF Bab 20.4)

Sesuai EAF Bab 20.4, Permission ID **wajib dibuat bersamaan** dengan Entity ID pada tahap ini (bukan menyusul di API Specification). Vocabulary aksi tertutup (EAF Bab 20.2): `Create`, `View`, `Update`, `Delete`, `Publish`, `Approve`, `Assign`, `Export`, `Manage`.

**Prinsip penerapan (bukan daftar lengkap PERM-XXX — akan diselesaikan penuh di Dokumen 8/Permission Matrix, TUGAS 3 langkah 8, agar tidak drift dari Database Schema/API Spec yang belum final):**

| Entity Kritikal | Draft PERM-XXX yang wajib dibuat (contoh, bukan final) |
|---|---|
| `ENT-M03-Listing` | `PERM-M03-Create-Listing`, `PERM-M03-Update-Listing`, `PERM-M03-Delete-Listing`, `PERM-M03-Publish-Listing`, `PERM-M03-Approve-Listing`, `PERM-M03-Manage-Listing` |
| `ENT-M10-RolePermission` | `PERM-M10-Manage-RolePermission` (Superadmin penuh), `PERM-M10-Update-RolePermission` (Manager, terbatas role Agen) |
| `ENT-M12-Organization` | `PERM-M12-Create-Organization`, `PERM-M12-Manage-Organization` (Leader), `PERM-M12-View-Organization` (Member, read-only listing anggota lain) |
| `ENT-M13-AgentAiConnection` | `PERM-M13-Create-AgentAiConnection`, `PERM-M13-Delete-AgentAiConnection` — **tidak ada** `PERM-M13-View` untuk isi percakapan (tidak pernah disimpan, REQ-M13-003/004) |

> **Catatan governance:** Daftar PERM-XXX lengkap untuk **seluruh** entity di atas didaftarkan penuh pada **Dokumen 8 — Permission Matrix** (langkah terakhir TUGAS 3), setelah Database Schema (Langkah 5) dan API Specification (Langkah 6) final — konsisten Bab 12.2 (Role Matrix/Permission Matrix bergantung pada keduanya). Tabel di atas adalah **preview prinsip**, bukan registrasi resmi PERM-XXX.

---

## 4. Catatan Retrofit & Keputusan Governance

1. **`listing_amenities`, `enrollments`, `event_registrations`, `role_permissions`, `agent_project_claims`** didaftarkan sebagai Entity **Association** (junction table N:N) — tetap mendapat `ENT-XXX` sendiri (bukan dikecualikan) karena EAF Bab 18 tidak memberi pengecualian untuk tabel junction, dan beberapa di antaranya (mis. `role_permissions`, `agent_project_claims`) menyimpan atribut tambahan di luar sekadar pasangan FK.
2. **Tidak ada entity baru yang didefinisikan di luar cakupan PRD v1.2 / ERD v1.1-v1.2** — murni pendaftaran ID atas entity yang sudah ada isinya, sesuai larangan TUGAS 4 membuka kembali keputusan final.
3. **Perluasan `AuditLog` (kolom `organization_id` nullable) dan `Listing` (kolom `organization_id`, `listing_context` untuk M12)** dicatat di sini sebagai *dependency notice* untuk Langkah 3 (ERD) — **belum diterapkan** ke skema ERD aktual pada dokumen ini; ERD adalah yang berwenang menuliskan definisi kolom (Bab 18.3 — Entity Mapping mendaftarkan ID & kepemilikan modul, bukan field-level schema).
4. **`ENT-M07-DbrConfig` dan `ENT-M09-SystemConfig`** — dua tabel referensi konfigurasi terpisah dipertahankan sesuai ERD asli (tidak digabung), karena scope-nya berbeda (DbrConfig khusus parameter DBR, SystemConfig lintas-modul umum).

---

*Entity Mapping ini menjadi Single Source of Truth pendaftaran `ENT-XXX` (EAF Bab 18.3). ERD, Database Schema, API Specification, dan Authorization & Access Control Specification wajib mereferensikan ID pada dokumen ini, tidak pernah mendefinisikan entity baru secara independen.*