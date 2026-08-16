# AUTHORIZATION & ACCESS CONTROL SPECIFICATION
## Platform Web RUMAHAGEN

**Versi:** 1.1 (Audit Menyeluruh — Issue Register Batch 3, 6 Agustus 2026)
**Tanggal:** 6 Agustus 2026
**Status:** Baseline (menggantikan v1.0 — lihat Bagian 0 untuk changelog audit lengkap)
**Dokumen pendamping:** ERD v1.3, API Specification v1.2, Entity Mapping v1.0, PRD v1.2

> **Dasar penyusunan:** Revisi v1.1 adalah hasil **audit baris-per-baris seluruh §2** (113 baris PERM-XXX, 13 sub-bagian modul) terhadap dua sumber kebenaran: (1) RLS aktual di 15 file migration `0001`–`0015`, (2) Business Rule eksplisit PRD per modul. Sumber: `ISSUE-REGISTER-Konsolidasi-FINAL.md` Tier 4 (17 isu, 12 di antaranya pola generalisasi `own`/`all` yang sama). Lihat **Bagian 0 — Changelog Audit v1.0 → v1.1** untuk daftar lengkap setiap baris yang dikoreksi beserta rujukan RLS/PRD.

---

## BAGIAN 0 — CHANGELOG AUDIT v1.0 → v1.1 (Issue Register Batch 3)

**Metodologi:** setiap baris `PERM-XXX` di Bagian 2 (113 baris) diperiksa terhadap RLS aktual (file migration terkait) dan Business Rule PRD modul terkait. Baris yang cocok dengan kedua sumber tidak dicantumkan di sini (mayoritas — 91 dari 113 baris, ~81%). 22 baris berikut dikoreksi:

| # | Baris PERM-XXX | Modul | Nilai Lama (v1.0) | Nilai Baru (v1.1) | Sumber Kebenaran |
|---|---|---|---|---|---|
| 1 | `PERM-M01-Approve-User` | M01 | Agent=`own` | Agent=`none` | RLS `users_update_own` (`0003`): approve hanya via `auth_has_scope_all`, tidak ada jalur self-approve — T4-02 |
| 2 | `PERM-M01-Assign-User` | M01 | Agent=`own` | Agent=`none` | RLS sama seperti #1 (satu policy UPDATE untuk keduanya) — tidak ada jalur self-assign role. **Temuan baru**, akar sama T4-02 |
| 3 | `PERM-M02-Approve-AgentReview` | M02 | Buyer=`own` | Buyer=`none` | RLS `agent_reviews_moderate` (`0005`): murni `auth_has_scope_all`, tidak ada policy Buyer approve — T4-03 |
| 4 | `PERM-M02-Delete-AgentReview` | M02 | Buyer=`own` | Buyer=`none` | Tidak ada RLS DELETE untuk `agent_reviews` sama sekali (soft-delete via UPDATE staff-only) — T4-03 |
| 5 | `PERM-M03-Manage-Amenity` | M03 | Manager/Admin=`all` | Manager/Admin=`none` | RLS `amenities_manage` (`0008`): Superadmin-only — **sudah dieksekusi OD-22**, dicantumkan ulang untuk kelengkapan changelog audit |
| 6 | `PERM-M05-Approve-Event` | M05 | DevPartner=`own` | DevPartner=`none` | RLS `events_manage_all` (`0010`, pasca-perbaikan T1-03 Batch 1): transisi ke `published`/`rejected` eksklusif all-scope, submitter (termasuk DevPartner) hanya `events_update_own` terbatas `pending_approval`/`cancelled`. **Temuan baru** — drift dokumentasi pasca-Batch 1, belum disinkronkan sebelumnya |
| 7 | `PERM-M06-Create-DeveloperProject` | M06 | DevPartner=`own` | DevPartner=`none` | RLS `developer_projects_manage` (`0006`): murni `auth_has_scope_all`, tidak ada klausa `user_id=auth.uid()` — T4-04 |
| 8 | `PERM-M06-View-DeveloperProject` | M06 | DevPartner=`own` | DevPartner=`all` *(publik, lihat catatan)* | RLS `developer_projects_select`: `USING (true)` untuk **anon+authenticated**, bukan `own`. **Temuan baru** — View sebenarnya publik penuh, bukan sekadar "milik sendiri" |
| 9 | `PERM-M06-Update-DeveloperProject` | M06 | DevPartner=`own` | DevPartner=`none` | Sama seperti #7 — T4-04 |
| 10 | `PERM-M06-Delete-DeveloperProject` | M06 | DevPartner=`own` | DevPartner=`none` | Sama seperti #7 — T4-04 |
| 11 | `PERM-M06-Create-DeveloperProjectMedia` | M06 | DevPartner=`own` | DevPartner=`none` | RLS `dpm_manage` (`0006`): sama pola #7 — T4-04 |
| 12 | `PERM-M06-Delete-DeveloperProjectMedia` | M06 | DevPartner=`own` | DevPartner=`none` | Sama seperti #11 — T4-04 |
| 13 | `PERM-M07-View-DbrConfig` | M07 | Manager/Admin=`none`, sisanya `none`/`-` | **Seluruh role=`all`** | RLS `dbr_config_select` (`0011`): `USING (true)` untuk seluruh authenticated (bukan hanya Manager/Admin), data non-sensitif — T4-13 diperluas cakupannya setelah audit penuh |
| 14 | `PERM-M08-View-Notification` | M08 | Superadmin/Manager/Admin=`all` | Superadmin/Manager/Admin=`own` | RLS `notifications_own` (`0012`): **tanpa bypass sama sekali**, bahkan staff — T4-16, konsisten REQ-M08-005 |
| 15 | `PERM-M08-Update-Notification` | M08 | Superadmin/Manager/Admin=`all` | Superadmin/Manager/Admin=`own` | Sama seperti #14 — T4-16 |
| 16 | `PERM-M09-View-AuditLog` | M09 | Agent=`none` (kosong) | Agent=`own` *(scoped Organization)* | RLS `audit_logs_select` (`0013`): mengizinkan anggota Organization aktif melihat log ter-scope `organization_id`-nya (dipakai ganda sebagai Activity Timeline M12, lihat MP-12 REQ-M12-017). **Temuan baru** — nuansa dual-purpose table tidak tercatat di v1.0 |
| 17 | `PERM-M10-View-Role` | M10 | Manager=`all`, Admin/Instructor/Agent/DevPartner/Buyer=`none` | **Seluruh role=`all`** | RLS `roles_select` (`0002`): `USING (true)`, seluruh authenticated. **Temuan baru** — katalog role bukan data sensitif |
| 18 | `PERM-M10-View-Permission` | M10 | Manager=`none` (seluruh non-Superadmin=`none`) | **Seluruh role=`all`** | RLS `permissions_select` (`0002`): `USING (true)`. **Temuan baru**, sama pola #17 |
| 19 | `PERM-M10-View-RolePermission` | M10 | Manager=`none` | **Seluruh role=`all`** | RLS `role_permissions_select` (`0002`): `USING (true)`. **Temuan baru** — sekaligus menutup T4-01 dari sisi View |
| 20 | `PERM-M10-Update-RolePermission` | M10 | Manager=`none` | Manager=`own` *(scoped role target `agent` saja)* | RLS `role_permissions_manager_update` (`0002`): Manager dapat UPDATE baris `editable_by_role_code LIKE '%manager%'` — T4-01 |
| 21 | `PERM-M11-View-UrlRedirect` | M11 | Seluruh non-Superadmin=`none` | **Seluruh role=`all`** *(termasuk publik/anon)* | RLS `url_redirects_select` (`0014`): `USING (true)` untuk **anon+authenticated** — T4-15 |
| 22 | `PERM-M12-Create-Organization` | M12 | Manager/Admin=`all` | Manager/Admin=`none` | RLS `organizations_insert_own` (`0007`): `WITH CHECK (created_by = auth.uid())` murni, **tanpa** klausa `auth_has_scope_all` — tidak ada jalur staff insert. **Temuan baru** |

**Housekeeping terpisah (bukan baris PERM-XXX, dieksekusi bersamaan):**
- `0005_m02_agent_profile.sql` — 2 komentar salah rujuk migration "0007"→"0008" diperbaiki (T4-08).
- `0011_m07_dbr.sql` — komentar salah rujuk "§2.7"→"§2.8" diperbaiki (T4-14).
- `PRD-...v1.2.md`, `User-Flow-...v1.2.md` Modul 1 — istilah "Verified" disinkronkan jadi "Active" di 9 lokasi (T4-07).
- `API-Specification-...v1.2.md` §10.3 — endpoint CRUD `/admin/developer-projects` dilengkapi (GET-list/PUT/DELETE, sebelumnya hanya POST) (T4-11).
- SSO Apple (T4-06) — **menunggu konfirmasi satu-kalimat Owner**, lihat catatan akhir dokumen ini, belum dieksekusi.
- T4-09, T4-10 — dicatat sebagai **acknowledged, non-blocking**, tidak memerlukan perubahan dokumen (lihat Bagian 2.15 poin 6-7).

**Baris yang TIDAK diubah meski awalnya dicurigai:** `PERM-M02-Create/View-AgentReview` (Agent=`own`, self-review — sudah benar via OD-23), `PERM-M03-Manage-Amenity` (sudah benar via OD-22), pola `own` untuk Agent di M03/M04/M12 Create/View/Update entity milik sendiri (diverifikasi cocok RLS `*_own`/`*_insert_own` di seluruh kasus yang diperiksa).

---

## BAGIAN 1 — ROLE MATRIX

### 1.1 Daftar 7 Role Final (resolusi OD-02)

| Role | Kode (`roles.code`) | Sifat Akses | Deskripsi Singkat |
|---|---|---|---|
| Superadmin | `superadmin` | Global, bypass permission check | Akses penuh tanpa batas, minimal 1 akun aktif wajib ada (safety guard) |
| Manager | `manager` | Global (`all`), tanpa pengecualian tim/wilayah | Operasional lintas-agen penuh; tidak dapat ubah Konfigurasi Sistem & Role/Permission Admin-ke-atas |
| Admin | `admin` | Global untuk modul operasional | Moderasi & CMS harian; tidak dapat ubah Role/Permission maupun Konfigurasi Sistem |
| Instructor | `instructor` | Own (kursus miliknya) | Kelola konten Learning Center (Modul 4) miliknya sendiri |
| Agent | `agent` | Own (data miliknya) | Aktor utama — listing, profil, DBR, Organization, dsb., dibatasi kepemilikan |
| Developer Partner | `developer_partner` | Own (proyek miliknya), opsional login | Kelola katalog proyek & pengajuan event miliknya |
| Buyer | `buyer` | Own (review/lead miliknya) | Akun ringan pencari properti — submit review & lead |
| *(Guest)* | *bukan baris tabel* | Tidak login | State tidak-login murni — tidak direpresentasikan sebagai role fisik (klarifikasi ERD v1.2 §2.28) |

### 1.2 Hierarki Manajemen Role (siapa boleh mengubah siapa)

```
Superadmin ──► dapat mengubah permission SEMUA role (termasuk Admin/Manager/Superadmin lain)
Manager    ──► HANYA dapat mengubah permission role Agent (via editable_by_role_code)
Admin      ──► tidak dapat mengubah permission role mana pun
```
> Ditegakkan lewat kolom `role_permissions.editable_by_role_code` (ERD v1.3 §2.30) — bukan hardcode di frontend saja.

### 1.3 Batasan Khusus per Role (retrofit dari PRD Modul 9/10 & User Flow)

| Role | Batasan |
|---|---|
| Manager | Sub-menu "Konfigurasi Sistem" dan bagian permission Admin/Manager/Superadmin di "Kelola Role & Permission" **tidak tampil** |
| Admin | Sub-menu "Kelola Role & Permission" dan "Konfigurasi Sistem" **tidak tampil/nonaktif**; tidak bisa kelola akun Admin/Superadmin lain |
| Superadmin | Tidak dapat dihapus/dinonaktifkan jika hasilnya membuat 0 Superadmin aktif (safety guard level aplikasi) |

---

## BAGIAN 2 — PERMISSION MATRIX

### 2.1 Prinsip (EAF Bab 20)
- Vocabulary aksi tertutup: `Create`, `View`, `Update`, `Delete`, `Publish`, `Approve`, `Assign`, `Export`, `Manage`.
- Format ID: `PERM-[MODUL]-[Aksi]-[NamaEntity]`.
- Nilai scope: `all` (global), `own` (milik sendiri), `none`/`-` (tidak ada akses — direpresentasikan `-` untuk aksi yang secara struktural tidak berlaku bagi role tsb, `none` untuk yang eksplisit ditolak meski relevan).
- Superadmin secara aplikasi **selalu bypass** — kolom Superadmin di bawah dicantumkan `all` untuk kelengkapan traceability, bukan berarti dibaca dari tabel `role_permissions` saat runtime (ERD v1.3 catatan §2.30).

### 2.2 Modul 1 — Registrasi & Autentikasi

| PERM ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer | Endpoint Penegak |
|---|---|---|---|---|---|---|---|---|---|---|
| `PERM-M01-Create-User` | `ENT-M01-User` | Create | all | all | all | none | own | none | none | POST /auth/register, PUT /admin/users/{id}/role |
| `PERM-M01-View-User` | `ENT-M01-User` | View | all | all | all | none | own | none | none | POST /auth/register, PUT /admin/users/{id}/role |
| `PERM-M01-Update-User` | `ENT-M01-User` | Update | all | all | all | none | own | none | none | POST /auth/register, PUT /admin/users/{id}/role |
| `PERM-M01-Approve-User` | `ENT-M01-User` | Approve | all | all | all | none | **none** *(audit v1.1, temuan #1)* | none | none | POST /auth/register, PUT /admin/users/{id}/role |
| `PERM-M01-Assign-User` | `ENT-M01-User` | Assign | all | all | all | none | **none** *(audit v1.1, temuan #2)* | none | none | POST /auth/register, PUT /admin/users/{id}/role |
| `PERM-M01-Create-AgentVerificationDocument` | `ENT-M01-AgentVerificationDocument` | Create | all | all | all | none | own | none | none | POST /users/verification-documents, PUT /admin/agents/{id}/approve |
| `PERM-M01-View-AgentVerificationDocument` | `ENT-M01-AgentVerificationDocument` | View | all | all | all | none | own | none | none | POST /users/verification-documents, PUT /admin/agents/{id}/approve |
| `PERM-M01-Approve-AgentVerificationDocument` | `ENT-M01-AgentVerificationDocument` | Approve | all | all | all | none | own | none | none | POST /users/verification-documents, PUT /admin/agents/{id}/approve |

### 2.3 Modul 2 — Profil Agen

| PERM ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer | Endpoint Penegak |
|---|---|---|---|---|---|---|---|---|---|---|
| `PERM-M02-View-AgentProfile` | `ENT-M02-AgentProfile` | View | all | all | all | none | own | none | - | PUT /users/profile, GET /agents/{id} |
| `PERM-M02-Update-AgentProfile` | `ENT-M02-AgentProfile` | Update | all | all | all | none | own | none | - | PUT /users/profile, GET /agents/{id} |
| `PERM-M02-Create-AgentReview` | `ENT-M02-AgentReview` | Create | all | all | all | none | **own** *(self-review, OD-23)* | none | own | POST /agents/{id}/reviews, PUT /admin/agent-reviews/{id}/approve |
| `PERM-M02-View-AgentReview` | `ENT-M02-AgentReview` | View | all | all | all | none | **own** *(self-review, OD-23)* | none | own | POST /agents/{id}/reviews, PUT /admin/agent-reviews/{id}/approve |
| `PERM-M02-Approve-AgentReview` | `ENT-M02-AgentReview` | Approve | all | all | all | none | - | none | **none** *(audit v1.1, temuan #3)* | POST /agents/{id}/reviews, PUT /admin/agent-reviews/{id}/approve |
| `PERM-M02-Delete-AgentReview` | `ENT-M02-AgentReview` | Delete | all | all | all | none | - | none | **none** *(audit v1.1, temuan #4)* | POST /agents/{id}/reviews, PUT /admin/agent-reviews/{id}/approve |

> **(Baru, 6 Agustus 2026 — OD-23)** Agent kini punya `own` untuk Create/View AgentReview — **self-review**: Agen dapat submit review ke profilnya sendiri, auto-approved tanpa moderasi (beda dari review Buyer yang tetap wajib moderasi). Dibatasi 1 review aktif per (reviewer, agen) — submit kedua me-replace (upsert), berlaku sama untuk Buyer→Agen maupun self-review. Bukti interaksi/lead (`listing_lead_id`) tidak wajib. Lihat `0005_m02_agent_profile.sql` versi terbaru (`agent_reviews_insert_buyer`, `agent_reviews_update_own`, `idx_agent_reviews_one_per_reviewer_per_agent`).

### 2.4 Modul 3 — Listing Properti

| PERM ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer | Endpoint Penegak |
|---|---|---|---|---|---|---|---|---|---|---|
| `PERM-M03-Create-Listing` | `ENT-M03-Listing` | Create | all | all | all | none | own | none | none | POST /listings, PUT /admin/listings/{id}/approve |
| `PERM-M03-View-Listing` | `ENT-M03-Listing` | View | all | all | all | none | own | none | none | POST /listings, PUT /admin/listings/{id}/approve |
| `PERM-M03-Update-Listing` | `ENT-M03-Listing` | Update | all | all | all | none | own | none | none | POST /listings, PUT /admin/listings/{id}/approve |
| `PERM-M03-Delete-Listing` | `ENT-M03-Listing` | Delete | all | all | all | none | own | none | none | POST /listings, PUT /admin/listings/{id}/approve |
| `PERM-M03-Publish-Listing` | `ENT-M03-Listing` | Publish | all | all | all | none | own | none | none | POST /listings, PUT /admin/listings/{id}/approve |
| `PERM-M03-Approve-Listing` | `ENT-M03-Listing` | Approve | all | all | all | none | own | none | none | POST /listings, PUT /admin/listings/{id}/approve |
| `PERM-M03-Create-ListingPhoto` | `ENT-M03-ListingPhoto` | Create | all | all | all | none | own | none | none | POST /listings/{id}/media |
| `PERM-M03-Delete-ListingPhoto` | `ENT-M03-ListingPhoto` | Delete | all | all | all | none | own | none | none | POST /listings/{id}/media |
| `PERM-M03-Create-ListingVideo` | `ENT-M03-ListingVideo` | Create | all | all | all | none | own | none | none | POST /listings/{id}/media |
| `PERM-M03-Delete-ListingVideo` | `ENT-M03-ListingVideo` | Delete | all | all | all | none | own | none | none | POST /listings/{id}/media |
| `PERM-M03-View-Amenity` | `ENT-M03-Amenity` | View | all | all | all | none | - | none | none | GET /listings (embedded), admin config |
| `PERM-M03-Manage-Amenity` | `ENT-M03-Amenity` | Manage | all | none | none | none | - | none | none | GET /listings (embedded), admin config *(resolusi OD-22, 6 Agustus 2026 — dikoreksi dari `all`/`all` untuk Manager/Admin menjadi `none`/`none`, disesuaikan ke RLS `amenities_manage` aktual di `0008_m03_listing.sql` yang sejak awal Superadmin-only; master data lintas-listing, aksi jarang & berdampak sistemik)* |
| `PERM-M03-Create-ListingAmenity` | `ENT-M03-ListingAmenity` | Create | all | all | all | none | own | none | none | POST/PUT /listings (embedded amenities[]) |
| `PERM-M03-Delete-ListingAmenity` | `ENT-M03-ListingAmenity` | Delete | all | all | all | none | own | none | none | POST/PUT /listings (embedded amenities[]) |
| `PERM-M03-View-ListingPriceHistory` | `ENT-M03-ListingPriceHistory` | View | all | all | all | none | own | none | none | GET /listings/{id}/price-history |
| `PERM-M03-Create-ListingLead` | `ENT-M03-ListingLead` | Create | all | all | all | none | own | none | own | POST /leads, GET /agents/me/leads |
| `PERM-M03-View-ListingLead` | `ENT-M03-ListingLead` | View | all | all | all | none | own | none | own | POST /leads, GET /agents/me/leads |
| `PERM-M03-Update-ListingLead` | `ENT-M03-ListingLead` | Update | all | all | all | none | own | none | own | POST /leads, GET /agents/me/leads |
| `PERM-M03-View-ListingView` | `ENT-M03-ListingView` | View | all | all | all | none | own | none | none | internal (view_count increment) |
| `PERM-M03-View-RefProvince` | `ENT-M03-RefProvince` | View | all | all | all | none | - | none | none | GET /regions/provinces |
| `PERM-M03-Manage-RefProvince` | `ENT-M03-RefProvince` | Manage | all | all | all | none | - | none | none | GET /regions/provinces |
| `PERM-M03-View-RefCity` | `ENT-M03-RefCity` | View | all | all | all | none | - | none | none | GET /regions/cities |
| `PERM-M03-Manage-RefCity` | `ENT-M03-RefCity` | Manage | all | all | all | none | - | none | none | GET /regions/cities |
| `PERM-M03-View-RefDistrict` | `ENT-M03-RefDistrict` | View | all | all | all | none | - | none | none | GET /regions/districts |
| `PERM-M03-Manage-RefDistrict` | `ENT-M03-RefDistrict` | Manage | all | all | all | none | - | none | none | GET /regions/districts |
| `PERM-M03-View-RefVillage` | `ENT-M03-RefVillage` | View | all | all | all | none | - | none | none | GET /regions/villages |
| `PERM-M03-Manage-RefVillage` | `ENT-M03-RefVillage` | Manage | all | all | all | none | - | none | none | GET /regions/villages |

### 2.5 Modul 4 — Learning Center

| PERM ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer | Endpoint Penegak |
|---|---|---|---|---|---|---|---|---|---|---|
| `PERM-M04-Create-Course` | `ENT-M04-Course` | Create | all | all | all | own | none | none | none | POST/PUT /admin/courses |
| `PERM-M04-View-Course` | `ENT-M04-Course` | View | all | all | all | own | none | none | none | POST/PUT /admin/courses |
| `PERM-M04-Update-Course` | `ENT-M04-Course` | Update | all | all | all | own | none | none | none | POST/PUT /admin/courses |
| `PERM-M04-Delete-Course` | `ENT-M04-Course` | Delete | all | all | all | own | none | none | none | POST/PUT /admin/courses |
| `PERM-M04-Create-CourseLesson` | `ENT-M04-CourseLesson` | Create | all | all | all | own | none | none | none | PUT /admin/courses/{id} |
| `PERM-M04-Update-CourseLesson` | `ENT-M04-CourseLesson` | Update | all | all | all | own | none | none | none | PUT /admin/courses/{id} |
| `PERM-M04-Delete-CourseLesson` | `ENT-M04-CourseLesson` | Delete | all | all | all | own | none | none | none | PUT /admin/courses/{id} |
| `PERM-M04-Create-Quiz` | `ENT-M04-Quiz` | Create | all | all | all | own | none | none | none | PUT /admin/courses/{id} |
| `PERM-M04-Update-Quiz` | `ENT-M04-Quiz` | Update | all | all | all | own | none | none | none | PUT /admin/courses/{id} |
| `PERM-M04-Delete-Quiz` | `ENT-M04-Quiz` | Delete | all | all | all | own | none | none | none | PUT /admin/courses/{id} |
| `PERM-M04-Create-QuizQuestion` | `ENT-M04-QuizQuestion` | Create | all | all | all | own | none | none | none | PUT /admin/courses/{id} |
| `PERM-M04-Update-QuizQuestion` | `ENT-M04-QuizQuestion` | Update | all | all | all | own | none | none | none | PUT /admin/courses/{id} |
| `PERM-M04-Delete-QuizQuestion` | `ENT-M04-QuizQuestion` | Delete | all | all | all | own | none | none | none | PUT /admin/courses/{id} |
| `PERM-M04-Create-QuizOption` | `ENT-M04-QuizOption` | Create | all | all | all | own | none | none | none | PUT /admin/courses/{id} |
| `PERM-M04-Update-QuizOption` | `ENT-M04-QuizOption` | Update | all | all | all | own | none | none | none | PUT /admin/courses/{id} |
| `PERM-M04-Delete-QuizOption` | `ENT-M04-QuizOption` | Delete | all | all | all | own | none | none | none | PUT /admin/courses/{id} |
| `PERM-M04-Create-Enrollment` | `ENT-M04-Enrollment` | Create | all | all | all | own | own | none | none | POST /courses/{id}/enroll |
| `PERM-M04-View-Enrollment` | `ENT-M04-Enrollment` | View | all | all | all | own | own | none | none | POST /courses/{id}/enroll |
| `PERM-M04-Create-QuizAttempt` | `ENT-M04-QuizAttempt` | Create | all | all | all | own | own | none | none | POST /courses/{id}/quiz/submit |
| `PERM-M04-View-QuizAttempt` | `ENT-M04-QuizAttempt` | View | all | all | all | own | own | none | none | POST /courses/{id}/quiz/submit |
| `PERM-M04-View-Certificate` | `ENT-M04-Certificate` | View | all | all | all | own | own | none | none | GET /agents/me/certificates |

### 2.6 Modul 5 — Kalender Event

| PERM ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer | Endpoint Penegak |
|---|---|---|---|---|---|---|---|---|---|---|
| `PERM-M05-Create-Event` | `ENT-M05-Event` | Create | all | all | all | none | - | own | none | POST /events, POST /developer-partners/events |
| `PERM-M05-View-Event` | `ENT-M05-Event` | View | all | all | all | none | - | own | none | POST /events, POST /developer-partners/events |
| `PERM-M05-Update-Event` | `ENT-M05-Event` | Update | all | all | all | none | - | own | none | POST /events, POST /developer-partners/events |
| `PERM-M05-Delete-Event` | `ENT-M05-Event` | Delete | all | all | all | none | - | own | none | POST /events, POST /developer-partners/events |
| `PERM-M05-Approve-Event` | `ENT-M05-Event` | Approve | all | all | all | none | - | **none** *(audit v1.1, temuan #6 — pasca-perbaikan T1-03)* | none | POST /events, POST /developer-partners/events |
| `PERM-M05-Create-EventRegistration` | `ENT-M05-EventRegistration` | Create | all | all | all | none | own | none | none | POST /events/{id}/rsvp |
| `PERM-M05-View-EventRegistration` | `ENT-M05-EventRegistration` | View | all | all | all | none | own | none | none | POST /events/{id}/rsvp |

### 2.7 Modul 6 — Direktori Developer

| PERM ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer | Endpoint Penegak |
|---|---|---|---|---|---|---|---|---|---|---|
| `PERM-M06-Create-DeveloperPartner` | `ENT-M06-DeveloperPartner` | Create | all | all | all | none | none | own | none | POST /admin/developer-projects (partner mgmt) |
| `PERM-M06-View-DeveloperPartner` | `ENT-M06-DeveloperPartner` | View | all | all | all | none | none | own | none | POST /admin/developer-projects (partner mgmt) |
| `PERM-M06-Update-DeveloperPartner` | `ENT-M06-DeveloperPartner` | Update | all | all | all | none | none | own | none | POST /admin/developer-projects (partner mgmt) |
| `PERM-M06-Create-DeveloperProject` | `ENT-M06-DeveloperProject` | Create | all | all | all | none | - | **none** *(audit v1.1, temuan #7)* | none | GET /developer-projects, POST /admin/developer-projects |
| `PERM-M06-View-DeveloperProject` | `ENT-M06-DeveloperProject` | View | all | all | all | none | - | **all** *(audit v1.1, temuan #8 — publik penuh, bukan `own`)* | none | GET /developer-projects, POST /admin/developer-projects |
| `PERM-M06-Update-DeveloperProject` | `ENT-M06-DeveloperProject` | Update | all | all | all | none | - | **none** *(audit v1.1, temuan #9)* | none | GET /developer-projects, POST /admin/developer-projects |
| `PERM-M06-Delete-DeveloperProject` | `ENT-M06-DeveloperProject` | Delete | all | all | all | none | - | **none** *(audit v1.1, temuan #10)* | none | GET /developer-projects, POST /admin/developer-projects |
| `PERM-M06-Create-DeveloperProjectMedia` | `ENT-M06-DeveloperProjectMedia` | Create | all | all | all | none | none | **none** *(audit v1.1, temuan #11)* | none | POST /admin/developer-projects |
| `PERM-M06-Delete-DeveloperProjectMedia` | `ENT-M06-DeveloperProjectMedia` | Delete | all | all | all | none | none | **none** *(audit v1.1, temuan #12)* | none | POST /admin/developer-projects |
| `PERM-M06-Create-AgentProjectClaim` | `ENT-M06-AgentProjectClaim` | Create | all | all | all | none | own | none | none | POST /developer-projects/{id}/claim |
| `PERM-M06-View-AgentProjectClaim` | `ENT-M06-AgentProjectClaim` | View | all | all | all | none | own | none | none | POST /developer-projects/{id}/claim |

### 2.8 Modul 7 — Scoring DBR

| PERM ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer | Endpoint Penegak |
|---|---|---|---|---|---|---|---|---|---|---|
| `PERM-M07-Create-DbrSimulation` | `ENT-M07-DbrSimulation` | Create | all | all | all | none | own | none | none | POST /calculator/dbr |
| `PERM-M07-View-DbrSimulation` | `ENT-M07-DbrSimulation` | View | all | all | all | none | own | none | none | POST /calculator/dbr |
| `PERM-M07-Export-DbrSimulation` | `ENT-M07-DbrSimulation` | Export | all | all | all | none | own | none | none | POST /calculator/dbr |
| `PERM-M07-View-DbrConfig` | `ENT-M07-DbrConfig` | View | all | **all** | **all** | **all** | **all** | **all** | **all** | PUT /admin/config/dbr *(audit v1.1, temuan #13 — RLS `dbr_config_select` `USING(true)`, seluruh authenticated, bukan hanya Manager/Admin)* |
| `PERM-M07-Manage-DbrConfig` | `ENT-M07-DbrConfig` | Manage | all | none | none | none | - | none | none | PUT /admin/config/dbr |

### 2.9 Modul 8 — Dashboard & Notifikasi

| PERM ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer | Endpoint Penegak |
|---|---|---|---|---|---|---|---|---|---|---|
| `PERM-M08-View-Notification` | `ENT-M08-Notification` | View | **own** *(audit v1.1, temuan #14)* | **own** | **own** | own | own | own | own | GET /notifications |
| `PERM-M08-Update-Notification` | `ENT-M08-Notification` | Update | **own** *(audit v1.1, temuan #15)* | **own** | **own** | own | own | own | own | GET /notifications |

### 2.10 Modul 9 — Admin/Sistem

| PERM ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer | Endpoint Penegak |
|---|---|---|---|---|---|---|---|---|---|---|
| `PERM-M09-View-SystemConfig` | `ENT-M09-SystemConfig` | View | all | none | none | none | none | none | none | GET/PUT /admin/config/system |
| `PERM-M09-Manage-SystemConfig` | `ENT-M09-SystemConfig` | Manage | all | none | none | none | none | none | none | GET/PUT /admin/config/system |
| `PERM-M09-View-AuditLog` | `ENT-M09-AuditLog` | View | all | all | none | none | **own** *(audit v1.1, temuan #16 — scoped Organization, tabel dipakai ganda sbg Activity Timeline M12/REQ-M12-017)* | none | none | GET /admin/audit-logs, GET /organizations/{id}/activity-log |

### 2.11 Modul 10 — RBAC

| PERM ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer | Endpoint Penegak |
|---|---|---|---|---|---|---|---|---|---|---|
| `PERM-M10-View-Role` | `ENT-M10-Role` | View | all | **all** | **all** | **all** | **all** | **all** | **all** | GET /admin/roles *(audit v1.1, temuan #17 — RLS `roles_select` `USING(true)`, seluruh authenticated)* |
| `PERM-M10-View-Permission` | `ENT-M10-Permission` | View | all | **all** | **all** | **all** | **all** | **all** | **all** | GET /admin/permissions/matrix *(audit v1.1, temuan #18 — RLS `permissions_select` `USING(true)`)* |
| `PERM-M10-View-RolePermission` | `ENT-M10-RolePermission` | View | all | **all** | **all** | **all** | **all** | **all** | **all** | GET/PUT /admin/permissions/matrix *(audit v1.1, temuan #19 — RLS `role_permissions_select` `USING(true)`)* |
| `PERM-M10-Manage-RolePermission` | `ENT-M10-RolePermission` | Manage | all | none | none | none | none | none | none | GET/PUT /admin/permissions/matrix |
| `PERM-M10-Update-RolePermission` | `ENT-M10-RolePermission` | Update | all | **own** *(audit v1.1, temuan #20 — scoped role target `agent` saja)* | none | none | none | none | none | GET/PUT /admin/permissions/matrix, /admin/permissions/matrix/agent |

### 2.12 Modul 11 — SEO & Analytics

| PERM ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer | Endpoint Penegak |
|---|---|---|---|---|---|---|---|---|---|---|
| `PERM-M11-View-UrlRedirect` | `ENT-M11-UrlRedirect` | View | all | **all** | **all** | **all** | **all** | **all** | **all** | internal (auto-write on slug change) *(audit v1.1, temuan #21 — RLS `url_redirects_select` `USING(true)` untuk anon+authenticated, publik penuh)* |
| `PERM-M11-Manage-UrlRedirect` | `ENT-M11-UrlRedirect` | Manage | all | none | none | none | none | none | none | internal (auto-write on slug change) |

### 2.13 Modul 12 — Organization Management

| PERM ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer | Endpoint Penegak |
|---|---|---|---|---|---|---|---|---|---|---|
| `PERM-M12-Create-Organization` | `ENT-M12-Organization` | Create | all | **none** *(audit v1.1, temuan #22)* | **none** *(audit v1.1, temuan #22)* | none | own | none | none | POST/DELETE /organizations/{id} |
| `PERM-M12-View-Organization` | `ENT-M12-Organization` | View | all | all | all | none | own | none | none | POST/DELETE /organizations/{id} |
| `PERM-M12-Update-Organization` | `ENT-M12-Organization` | Update | all | all | all | none | own | none | none | POST/DELETE /organizations/{id} |
| `PERM-M12-Delete-Organization` | `ENT-M12-Organization` | Delete | all | all | all | none | own | none | none | POST/DELETE /organizations/{id} |
| `PERM-M12-Manage-Organization` | `ENT-M12-Organization` | Manage | all | all | all | none | own | none | none | POST/DELETE /organizations/{id} |
| `PERM-M12-Create-OrganizationMember` | `ENT-M12-OrganizationMember` | Create | all | all | all | none | own | none | none | PUT .../accept, DELETE /organization-members/{id} |
| `PERM-M12-View-OrganizationMember` | `ENT-M12-OrganizationMember` | View | all | all | all | none | own | none | none | PUT .../accept, DELETE /organization-members/{id} |
| `PERM-M12-Delete-OrganizationMember` | `ENT-M12-OrganizationMember` | Delete | all | all | all | none | own | none | none | PUT .../accept, DELETE /organization-members/{id} |
| `PERM-M12-Create-OrganizationInvitation` | `ENT-M12-OrganizationInvitation` | Create | all | all | all | none | own | none | none | POST /organizations/{id}/invitations, /join-requests |
| `PERM-M12-View-OrganizationInvitation` | `ENT-M12-OrganizationInvitation` | View | all | all | all | none | own | none | none | POST /organizations/{id}/invitations, /join-requests |
| `PERM-M12-Update-OrganizationInvitation` | `ENT-M12-OrganizationInvitation` | Update | all | all | all | none | own | none | none | POST /organizations/{id}/invitations, /join-requests |

> **(Audit v1.1)** `PERM-M12-Create-OrganizationMember` (Agent=`own`) **tidak sepenuhnya presisi** — tidak ada RLS `INSERT` untuk `organization_members` sama sekali di `0007_m12_organization.sql`; keanggotaan tercipta lewat jalur privileged (backend/service-role) saat invitation di-accept (`org_invitations_respond`), bukan insert langsung oleh user. `own` tetap dipertahankan sebagai representasi **hasil akhir yang dialami Agent** (dia yang accept, dia yang jadi member), tapi implementor perlu tahu ini bukan RLS INSERT policy biasa — dicatat sebagai nuansa, bukan kesalahan nilai yang perlu diubah.

### 2.14 Modul 13 — AI Assistant

| PERM ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer | Endpoint Penegak |
|---|---|---|---|---|---|---|---|---|---|---|
| `PERM-M13-View-AiProvider` | `ENT-M13-AiProvider` | View | all | none | none | none | none | none | none | GET /ai-providers |
| `PERM-M13-Manage-AiProvider` | `ENT-M13-AiProvider` | Manage | all | none | none | none | none | none | none | GET /ai-providers |
| `PERM-M13-Create-AgentAiConnection` | `ENT-M13-AgentAiConnection` | Create | own | own | own | own | own | own | none | POST/DELETE /ai-connections |
| `PERM-M13-View-AgentAiConnection` | `ENT-M13-AgentAiConnection` | View | own | own | own | own | own | own | none | POST/DELETE /ai-connections |
| `PERM-M13-Delete-AgentAiConnection` | `ENT-M13-AgentAiConnection` | Delete | own | own | own | own | own | own | none | POST/DELETE /ai-connections |

---

**Total PERM-XXX terdaftar: 113**, mencakup seluruh 44 entity dari Entity Mapping v1.0 (11 modul existing + M12/M13).

### 2.15 Catatan Retrofit & Keputusan Governance

1. **Setiap baris PERM-XXX mencantumkan Endpoint Penegak (`API-XXX` referensi ke API Specification v1.2)** — sesuai instruksi TUGAS 3 langkah 8. Endpoint ditulis dalam bentuk `METHOD /path` (bukan ID formal `API-XXX` terpisah, karena API Specification v1.2 tidak mendaftarkan ID per-endpoint eksplisit — dicatat sebagai gap kecil untuk siklus retrofit API Specification berikutnya, bukan diasumsikan sudah ada).
2. **Superadmin bypass** (ERD v1.3 §2.30, PRD Modul 10) — kolom Superadmin di matriks ini bersifat dokumentatif (traceability lengkap), bukan sumber kebenaran runtime; source of truth bypass ada di kode aplikasi.
3. **Tidak ada entity baru di luar Entity Mapping v1.0** — murni retrofit PERM-XXX di atas 44 entity yang sudah terdaftar.
4. **Scope Manager selalu `all` untuk modul operasional** (M2–M8, M12) dan **`none`/tidak tampil untuk M9 (Konfigurasi Sistem) & M10 (Permission Admin ke atas)** — konsisten PRD Modul 9/10, tidak ada level "scoped tim/wilayah" (resolusi konflik v1.1, dipertahankan).
5. **`ENT-M13-AgentAiConnection`** — scope seluruh role internal bernilai `own` (bukan `all` untuk siapa pun, termasuk Superadmin) karena REQ-M13-004 eksplisit melarang akses pihak lain ke koneksi/percakapan user lain, termasuk Admin — pengecualian sengaja terhadap pola bypass Superadmin umum, dicatat eksplisit agar tidak salah diimplementasikan sebagai bypass penuh.
6. **(Baru, v1.1) `ENT-M08-Notification`** — pola pengecualian yang sama seperti poin 5: RLS `notifications_own` **tanpa bypass staff sama sekali**, konsisten REQ-M08-005 (larangan eksplisit kebocoran lintas-scope notifikasi). Ini **bukan kesalahan implementasi** — RLS lebih protektif dari pola default, dan memang demikian yang diinginkan (T4-16).
7. **(Baru, v1.1) T4-09 (kepemilikan kredensial GTM/GA4/GSC, M09 vs M11) — Acknowledged, non-blocking.** Tabel `system_configs` (M09) menyimpan kredensial, endpoint `/admin/config/seo` (M11) yang mengekspos ke UI — pembagian tanggung jawab ini sudah berjalan konsisten di API Specification & migration, hanya belum eksplisit dinyatakan sebagai keputusan sadar di `Functional-Specification-...v1.0.md` §4.9. Tidak ada baris PERM-XXX yang perlu diubah — kedua modul memakai entity yang sama (`ENT-M09-SystemConfig`) dengan scope yang sudah konsisten.
8. **(Baru, v1.1) T4-10 (PRD Modul 9 tanpa Business Rules/Acceptance Criteria terpisah) — Acknowledged, non-blocking.** Inkonsistensi struktur penulisan PRD internal, tidak memengaruhi scope/perilaku sistem — Acceptance Criteria MP-09 sudah disintesis dari bagian lain PRD (Data, Fitur Utama) di `MP-09-AdminPanel-Module-Planning-v1_0.md`. Tidak berdampak ke Authorization Spec, dicatat di sini murni untuk kelengkapan penutupan Tier 4.

---

**Cakupan audit v1.1:** seluruh 113 baris PERM-XXX di Bagian 2 diperiksa terhadap RLS 15 migration file. 22 baris dikoreksi (lihat Bagian 0). Audit ini **best-effort menyeluruh**, bukan verifikasi formal tiap kondisi RLS baris-demi-baris hingga level query planner — nuansa yang ditemukan di luar 22 koreksi utama (mis. `PERM-M12-Create-OrganizationMember`) dicatat sebagai catatan kualitatif, bukan diubah nilainya. Jika ditemukan ketidaksesuaian tambahan di siklus implementasi mendatang, laporkan sebagai isu Tier baru — bukan diasumsikan sudah tercakup di audit ini.

**T4-06 (SSO Apple) — TIDAK termasuk dalam audit ini (bukan baris PERM-XXX), diselesaikan terpisah 6 Agustus 2026.** Owner memilih Opsi B: referensi SSO Apple dipertahankan, ditandai eksplisit "belum diimplementasikan / roadmap masa depan" di `PRD-...v1.2.md` REQ-M01-002, `Functional-Specification-...v1.0.md` §M01, `User-Flow-...v1.2.md` Modul 1 (6 lokasi total). Tidak berdampak ke Authorization Spec (tidak ada baris PERM-XXX untuk SSO Apple).

*Dokumen ini menjadi acuan implementasi middleware RBAC & Organization-scoped authorization di level backend (lihat API Specification v1.2 Bagian 0.6 & ERD v1.3 Bagian 4 poin 6-9).*

---

## CONTROLLED SYNCHRONIZATION NOTICE — STEP 08
**Date:** 16 August 2026  
**AEP source:** AEP #3 Title / Awarding Business Rules  
**Cross-AEP dependencies:** D1 Commercial/Payment; D2 Learning Economy; D3 Learning Session  
**Scope:** D4 Title/Awarding downstream semantic synchronization only.

This overlay applies the approved AEP3 semantic decisions. It does not invent physical schema, exact endpoint contracts, final permission IDs, or unresolved authority/lifecycle/version semantics.

### D4-RBAC-01 — AEP3-OD-06 is CLOSED: Option B
No dedicated Issuer/Awarding Authority role is introduced by AEP3.

Effective authorization:
`Existing Role + Capability Permission + Authority/Scope Binding`.

### D4-RBAC-02 — Authority vs qualification
A permission to perform `award.issue` does not mean the subject is qualified. Qualification is evaluated independently by the Awarding domain.

### D4-RBAC-03 — Capability families
Conceptual capability families:
- Title Definition;
- Awarding Path / Path Version;
- Awarding Rule / Rule Version;
- Qualification;
- Award Instance;
- Appeal;
- Presentation;
- Provenance/Audit;
- Authority/Scope management.

These are capability categories, not final permission IDs.

### D4-RBAC-04 — Explicit prohibitions
Do not infer:
- learning.course.complete → award.issue;
- learning.credential.issue → award.issue;
- payment.confirmed → award.issue;
- LP threshold → RBAC permission;
- instructor role → award.issue;
- partner role → award authority;
- manager global scope → universal issuer authority.

### D4-RBAC-05 — Open authority cardinality
AEP3-OD-02 remains open for exact Agency/Organization/Partner/Platform authority cardinality. Do not overload existing granted_scope alone to represent unresolved business authority relationships.
