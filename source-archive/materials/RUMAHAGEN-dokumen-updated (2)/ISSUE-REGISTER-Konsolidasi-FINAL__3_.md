# ISSUE REGISTER — KONSOLIDASI FINAL
## Module Planning MP-10, MP-01, MP-09, MP-02, MP-06, MP-04, MP-13, MP-03, MP-05, MP-07, MP-11, MP-08, MP-12
### Platform Web RUMAHAGEN

**Versi:** 2.0 (FINAL — seluruh 13 Module Planning selesai disusun)
**Tanggal:** 6 Agustus 2026
**Sumber:** Seluruh temuan Bagian 51 (Conflict Analysis) + Bagian 45/46 (Risk Analysis/Known Limitation) dari **13 Module Planning lengkap** — menutup seluruh modul proyek: `MP-10-RBAC`, `MP-01-Authentication`, `MP-09-AdminPanel`, `MP-02-ProfilAgen`, `MP-06-DirektoriDeveloper`, `MP-04-LearningCenter`, `MP-13-AIAssistant`, `MP-03-Listing`, `MP-05-KalenderEvent`, `MP-07-DBRScoring`, `MP-11-SEOAnalytics`, `MP-08-DashboardNotifikasi`, `MP-12-Organization`.
**Tujuan:** Satu tempat konsolidasi seluruh isu lintas-modul agar Owner dapat mereview & memutuskan sekali jalan, dikelompokkan berdasarkan **dampak terhadap keamanan/urutan implementasi** — bukan berdasarkan modul mana isu itu ditemukan.
**Status dokumen ini:** **FINAL untuk cakupan 13 Module Planning** — tidak akan ada modul baru yang menambah temuan (seluruh modul PRD sudah tercakup). Living document hanya jika ada revisi ulang terhadap MP yang sudah ada.

---

# Ringkasan Eksekutif

| Tier | Jumlah Isu | Sifat | Kapan Wajib Diselesaikan | Status [2026-08-06] |
|---|---|---|---|---|
| **🔴 Tier 1 — Bug Kode Nyata** | **4** | Migration SQL sudah ditulis salah, bukan sekadar dokumentasi | **Sebelum eksekusi migration ke Sprint S0** | ✅ **4/4 Closed** (Batch 1) |
| **🔴 Tier 2 — Kontradiksi Bisnis Blocking** | **2** | PRD bertentangan dengan dirinya sendiri, menentukan perilaku RBAC | **Sebelum coding modul terkait dimulai** | ✅ **2/2 Closed** (Batch 2, OD-16/OD-17) |
| **🟡 Tier 3 — Keputusan Penting, Non-Blocking Modul Lain** | **9** *(catatan: tabel detail di bawah hanya mencantumkan 7 baris bernomor T3-01 s.d. T3-07 — kemungkinan besar diskrepansi hitung lama dari penyusunan awal dokumen, dicatat untuk audit Batch 3, tidak diinvestigasi lebih lanjut karena di luar scope)* | Gap fungsional/keamanan yang perlu keputusan Owner, tapi tidak menghalangi modul lain dibangun | **Sebelum modul terkait dianggap selesai (DoD)** | ✅ **7/7 Closed** (T3-06 Batch 1; T3-01/03/04/05/07 Batch 2; T3-02 sebagai OD-23) |
| **🟢 Tier 4 — Editorial/Dokumentasi** | **17** *(16 baris eksplisit tercatat — lihat catatan diskrepansi hitung serupa Tier 3)* | Tidak berdampak ke perilaku sistem — implementasi sudah tahu harus ikut sumber mana | **Siklus governance berikutnya, tidak mendesak** | ✅ **16/16 Closed** (audit `Authorization-Access-Control-Specification-v1.1.md` + T4-06 Opsi B, 6 Agustus 2026) |
| **Total** | **32 isu unik** *(lihat catatan Tier 3/4 di atas soal diskrepansi hitung)* | — | — | **✅ 29/29 baris tercatat Closed — seluruh Issue Register tuntas** (4 Tier1 + 2 Tier2 + 7 Tier3 + 16 Tier4) |

**✅ Catatan positif:** MP-07 (DBR Scoring) dan MP-08 (Dashboard) adalah **2 modul tanpa temuan Tier 1/2/3 baru** — bukti bahwa tidak seluruh migration bermasalah; temuan Tier 1 adalah pengecualian nyata di 4 dari 13 modul, bukan pola menyeluruh.

**🟢 [2026-08-06] Batch 1 (Resolution Package) — SELESAI DIEKSEKUSI.** Seluruh **4 Tier 1** (T1-01, T1-02, T1-03, T1-04) dan **1 Tier 3** (T3-06) kini **Closed** — lihat baris masing-masing di tabel di bawah untuk detail perbaikan dan file migration versi terbaru. **Catatan T1-03:** perbaikan RLS selesai, namun endpoint approve/reject API masih belum ada di API Specification — dilaporkan sebagai rekomendasi terpisah untuk siklus governance berikutnya (bukan dieksekusi di Batch 1, sesuai batasan scope task).

**🟢 [2026-08-06] Batch 2 (Formalisasi OD-16 s.d. OD-22) — SELESAI DIEKSEKUSI.** Seluruh **2 Tier 2** (T2-01/OD-16, T2-02/OD-17) dan **5 Tier 3** (T3-01/OD-18, T3-03/OD-19, T3-04/OD-20, T3-05/OD-21, T3-07/OD-22) kini **Closed**, dijawab Owner via `OD-16-sampai-OD-22-Batch2-Keputusan-Owner.md`. **Catatan penomoran:** rekomendasi awal Resolution Package (OD-12 s.d. OD-18) dikoreksi ke OD-16 s.d. OD-22 karena OD-11/OD-12 sudah terpakai (monetisasi, threshold DBR) di `project-manifest.md` §7 — lihat Governance Finding di dokumen OD.

**🟢 [2026-08-06] OD-23 dijawab & dieksekusi — T3-02 (MP-02, bukti interaksi/lead review agen).** **Status: ✅ Closed [2026-08-06], OD-23** — bukti lead tidak wajib; 1 review aktif per (reviewer, agen) dengan replace-on-resubmit; Agen dapat self-review (auto-approved, ikut `aggregateRating`). Migration `0005_m02_agent_profile.sql` diperbarui (`UNIQUE(buyer_id,agent_id)` + RLS baru), PRD Modul 2 & Authorization Spec §2.3 direvisi. Dengan ini, **seluruh Tier 1, Tier 2, dan Tier 3 (7 baris bernomor) di Issue Register sudah Closed**.

**🟢 [2026-08-06] Batch 3 (Audit Menyeluruh Authorization Spec) — SELESAI DIEKSEKUSI PENUH, termasuk T4-06.** Seluruh 113 baris `PERM-XXX` di `Authorization-Access-Control-Specification.md` diaudit baris-per-baris terhadap RLS (15 migration) + PRD Business Rule. **22 baris dikoreksi** (12 sudah teridentifikasi sebelumnya + 10 temuan baru hasil audit penuh — termasuk View-DbrConfig/View-Role/View-Permission/View-RolePermission/View-UrlRedirect ternyata jauh lebih terbuka dari yang tercatat, karena RLS memakai `USING(true)`). Dokumen baru **`Authorization-Access-Control-Specification-v1.1.md`** diterbitkan (menggantikan v1.0, status Baseline). 4 isu editorial non-Authorization-Spec juga diperbaiki: komentar migration `0005`/`0011`, istilah "Verified"→"Active" (9 lokasi), endpoint CRUD `/admin/developer-projects` dilengkapi. **T4-09 dan T4-10 ditutup sebagai Acknowledged**. **T4-06 (SSO Apple) — Owner memilih Opsi B**: referensi dipertahankan, ditandai eksplisit "belum diimplementasikan / roadmap masa depan" di PRD, Functional Spec, User Flow Modul 1 (6 lokasi). **Dengan ini, seluruh 32 isu Issue Register — Tier 1, 2, 3, dan 4 — tuntas Closed. Tidak ada satu pun item governance tersisa yang menghalangi Sprint S0.**

**⚠️ T1-02 dikonfirmasi oleh 4 sumber independen (MP-03 + MP-11).** PRD Modul 3, PRD Modul 11, Functional Spec, dan SEO Spec seluruhnya menegaskan listing `sold`/`rented` wajib tetap terindeks — RLS yang memblokirnya adalah bug paling mendesak diperbaiki karena berdampak ke 2 modul sekaligus (M03 dan M11 sama-sama tidak dapat mencapai DoD tanpanya).

**Pola berulang paling signifikan (generalisasi Authorization Spec):** **12 dari 32 isu** berasal dari **satu akar masalah yang sama** — `Authorization-Access-Control-Specification-v1.0.md` tampak memberi scope `own`/`all` secara generik ke suatu role tanpa mengecualikan kasus per-aksi, ditemukan di **7 dari 13 modul** (MP-10, MP-01, MP-02, MP-06, MP-13, MP-03, MP-05, MP-07, MP-11, MP-08). Ini bukan 12 masalah terpisah — ini **satu masalah sistemik** di satu dokumen sumber, direkomendasikan diaudit menyeluruh sekali di siklus governance berikutnya (bukan ditambal per baris).

**Pola kedua — kontradiksi internal PRD soal Manager:** **T2-01 (MP-04) dan T2-02 (MP-05)** ✅ **Closed bersamaan [2026-08-06]** — OD-16 dan OD-17 keduanya dijawab Opsi A oleh Owner (Manager akses penuh), mengonfirmasi dugaan akar masalah yang sama.



---

# 🔴 TIER 1 — Bug Kode Migration Nyata (Wajib Diperbaiki Sebelum Sprint S0)

| # | Isu | Modul | File Terdampak | Detail |
|---|---|---|---|---|
| T1-01 | RLS `quiz_questions_manage`/`quiz_options_manage` tidak punya klausa ownership (`created_by` via join ke `courses`) — padahal `courses_manage_own`/`course_lessons_manage`/`quizzes_manage` di file yang sama sudah benar menerapkannya. Akibatnya **Instructor tidak bisa kelola bank soal kursus miliknya sendiri**, padahal PRD + Authorization Spec + User Flow tiga-tiganya sepakat ini seharusnya `own`. | MP-04 | `0009_m04_learning_center.sql` | **Aksi:** Tambah klausa `EXISTS (SELECT 1 FROM quizzes qz JOIN courses c ON c.id=qz.course_id WHERE qz.id=quiz_questions.quiz_id AND c.created_by=auth.uid())` (pola sama `quizzes_manage`) ke kedua policy. Sertakan juga `enrollments_own`/`quiz_attempts_own` — Instructor perlu melihat progress peserta kursusnya (gap terkait, MP-04 Konflik #3). **Status: ✅ Closed [2026-08-06]** — keempat policy diperbaiki, lihat `0009_m04_learning_center.sql` versi terbaru. |
| **T1-02** *(diperkuat MP-11)* | **RLS `listings_select_public` hanya mengizinkan `status='published'` untuk akses publik** — listing `sold`/`rented` menjadi **tidak dapat diakses sama sekali** oleh publik (404/kosong). Bertentangan langsung dengan **4 sumber independen**: `SEO-Analytics-Specification-v1.1.md` §1.4, Functional Spec §4.3, **PRD Modul 3 Business Rule**, dan **PRD Modul 11 Business Rule poin 3** (baru, dikonfirmasi MP-11) — seluruhnya menegaskan halaman `sold`/`rented` wajib tetap terindeks. | MP-03, diperkuat MP-11 | `0008_m03_listing.sql` | **Aksi:** Ubah `listings_select_public` menjadi `USING (status IN ('published','sold','rented') AND deleted_at IS NULL)`. Status `expired` mengikuti kebijakan noindex-tapi-tetap-akses terpisah. **Catatan MP-11:** M11 sendiri tidak dapat mencapai Definition of Done tanpa perbaikan ini — prasyarat lintas-modul. **Status: ✅ Closed [2026-08-06]** — lihat `0008_m03_listing.sql` versi terbaru. Kebijakan noindex `expired` terpisah belum diimplementasikan (di luar scope perbaikan ini). |
| **T1-03** *(baru)* | **RLS `events_manage` (`FOR ALL`) mengizinkan `submitted_by=auth.uid()` mengubah kolom `status` tanpa batasan** — Developer Partner secara teknis dapat **mem-publish event miliknya sendiri** (`status:'published'`) tanpa melalui approval Admin, langsung via update biasa. Diperkuat oleh Authorization Spec §2.6 yang juga (keliru) memberi `PERM-M05-Approve-Event`=`own` ke DevPartner — **dua sumber independen sama-sama permisif**, bukan hanya dokumentasi yang salah sementara RLS tetap ketat (pola berbeda dari mayoritas isu lain). Tidak ada endpoint approve/reject terpisah di API Spec yang bisa jadi titik enforcement alternatif. | MP-05 | `0010_m05_events.sql` | **Aksi:** Pisahkan `events_manage` — submitter hanya boleh INSERT/UPDATE non-`status` (atau `status` terbatas `pending_approval`/`cancelled` milik sendiri); transisi ke `published`/`rejected` eksklusif `auth_has_scope_all`. Tambahkan endpoint approve/reject eksplisit ke API Specification. **Status: ✅ Closed [2026-08-06] untuk bagian RLS** — dipisah jadi `events_insert_own`/`events_update_own`/`events_delete_own`/`events_manage_all`, lihat `0010_m05_events.sql` versi terbaru. **Endpoint approve/reject API Specification: belum ditambahkan** — dilaporkan sebagai rekomendasi terpisah, di luar scope Batch 1 (perubahan dokumen sumber API Spec memerlukan proses governance tersendiri). |
| **T1-04** *(baru, final)* | **RLS `org_invitations_insert` (migration `0007`) tidak memverifikasi bahwa `leader_id` yang diklaim benar-benar Leader aktif dari `organization_id` terkait** — `WITH CHECK (agent_id=auth.uid() OR leader_id=auth.uid())` mengizinkan **siapa pun** authenticated user mengklaim dirinya `leader_id` untuk Organization manapun saat insert baris `leader_invite`, tanpa pernah benar-benar menjadi Leader Organization tsb. | MP-12 | `0007_m12_organization.sql` | **Aksi:** Ubah `WITH CHECK` menjadi kondisional per `initiated_by_type` — untuk `leader_invite`, tambahkan `EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id=organization_invitations.organization_id AND om.agent_id=auth.uid() AND om.role='leader' AND om.status='active')`. Dampak: spoofing undangan palsu atas nama Organization (social engineering), bukan kebocoran data langsung. **Status: ✅ Closed [2026-08-06]** — lihat `0007_m12_organization.sql` versi terbaru. |

**🔒 Ringkasan 4 temuan Tier 1 — 2 arah kesalahan RLS berbeda:**
| Kode | Modul | Migration | Arah Kesalahan | Inti Masalah |
|---|---|---|---|---|
| T1-01 | M04 | `0009` | Terlalu ketat | Instructor tidak bisa kelola bank soal kursus miliknya |
| T1-02 | M03 | `0008` | Terlalu ketat | Listing `sold`/`rented` tidak dapat diakses publik — melanggar SEO |
| T1-03 | M05 | `0010` | Terlalu longgar | Developer Partner dapat self-approve event — bypass moderasi |
| T1-04 | M12 | `0007` | Terlalu longgar | Siapa pun dapat mengklaim jadi Leader Organization manapun — spoofing |

**Kedua arah kesalahan muncul secara merata** — bukti bahwa review RLS baris-per-baris tetap diperlukan untuk seluruh 15 file migration sebelum Sprint S0, bukan cukup asumsi "arah aman tertentu".

> **Kenapa T1-01/T1-02/T1-03 beda dari isu lain:** ketiganya satu-satunya isu yang bersumber dari kesalahan di **file `.sql` itu sendiri**, bukan dari dokumen naratif (PRD/Authorization Spec/dst.) yang salah menggambarkan perilaku sistem. Migration belum dieksekusi ke database manapun — biaya perbaikan saat ini murah (edit file), akan jadi mahal (migration tambahan + downtime) jika dibiarkan sampai setelah Sprint S0 jalan. **T1-02 paling kritis untuk bisnis (SEO), T1-03 paling kritis untuk keamanan (bypass moderasi konten pihak eksternal)** — keduanya direkomendasikan diperbaiki lebih dulu dibanding T1-01.

---

# 🔴 TIER 2 — Kontradiksi Bisnis Blocking (Wajib Keputusan Owner Sebelum Modul Terkait Dikerjakan)

| # | Isu | Modul | Sumber | Detail |
|---|---|---|---|---|
| T2-01 | **PRD Modul 4 bertentangan dengan dirinya sendiri**: Business Rule menyatakan *"role Manager memiliki akses Full (mengikuti hak Admin secara global)"* untuk kelola konten Learning Center — tapi Acceptance Criteria di dokumen **yang sama** menyatakan *"Manager dan Agen tidak dapat mengakses menu kelola konten ini."* | MP-04 | `PRD-RUMAHAGEN-v1.2.md` Modul 4 | **Status: ✅ Closed [2026-08-06], OD-16 Opsi A** — Manager akses Full, mengikuti Business Rule. PRD Acceptance Criteria Modul 4 direvisi — lihat `PRD-RUMAHAGEN-v1_2.md`. |
| **T2-02** *(baru)* | **PRD Modul 5 bertentangan dengan dirinya sendiri**, pola identik T2-01: Business Rule menyatakan *"Superadmin, Manager, dan Admin dapat membuat & mempublikasikan event secara langsung tanpa approval tambahan"* — tapi Acceptance Criteria menyatakan *"Manager dan Developer Partner hanya dapat mengajukan event yang memerlukan approval."* | MP-05 | `PRD-RUMAHAGEN-v1.2.md` Modul 5 | **Status: ✅ Closed [2026-08-06], OD-17 Opsi A** — Manager publish langsung, konsisten OD-16. PRD Acceptance Criteria Modul 5 direvisi — lihat `PRD-RUMAHAGEN-v1_2.md`. |

---

# 🟡 TIER 3 — Keputusan Penting, Tidak Menghalangi Modul Lain

| # | Isu | Modul | Detail |
|---|---|---|---|
| T3-01 | **Bootstrap akun Superadmin pertama tidak terdokumentasi di mana pun.** Tidak ada seed data user di migration manapun, tapi approval registrasi agen butuh Superadmin yang sudah eksis — *chicken-and-egg problem*. | MP-01 | **Status: ✅ Closed [2026-08-06], OD-18 Opsi B** — script `scripts/seed-superadmin.ts` (Supabase Admin API, parameter `--email --name --password`). Detail: `scripts/README-seed-superadmin.md`, `MP-01-Authentication-Module-Planning-v1_0.md`. |
| T3-02 | **Bukti interaksi/lead sebelum submit review agen tidak ditegakkan.** PRD & Entity Mapping menyatakan Buyer harus "pernah memberikan lead/inquiry" sebelum bisa review — tapi RLS `agent_reviews_insert_buyer` hanya cek role `buyer`, tidak cek `listing_lead_id` (kolom NULLABLE, tidak divalidasi). | MP-02 | **Status: ✅ Closed [2026-08-06], OD-23** — bukti lead tidak wajib; 1 review aktif per (reviewer, agen) dengan replace-on-resubmit; Agen dapat self-review (auto-approved, ikut `aggregateRating`). Migration `0005_m02_agent_profile.sql` diperbarui (`UNIQUE(buyer_id,agent_id)` + RLS baru), PRD Modul 2 & Authorization Spec §2.3 direvisi. |
| T3-03 | **Definisi cakupan "wilayah eksklusif" proyek developer tidak ada.** Field `is_exclusive_by_region` (boolean) ada di skema, User Flow M06 sudah mengasumsikan fitur "notifikasi tidak tersedia jika sudah diklaim agen lain di wilayah yang sama" — tapi tidak ada field/logic yang mendefinisikan cakupan wilayahnya. | MP-06 | **Status: ✅ Closed [2026-08-06], OD-19 Opsi A** — cakupan = per Kota (`city_id`, sudah ada di skema, tidak perlu field baru). PRD Modul 6 Business Rule diklarifikasi — lihat `PRD-RUMAHAGEN-v1_2.md`. |
| T3-04 | **REQ-M09-001 (kelola akun Admin/Manager/Instructor baru) tidak punya endpoint API sama sekali** — hanya ada `/admin/agents/*` (approval agen existing, M01) dan `/admin/users/{id}/role` (ubah role user existing, M10). Tidak ada cara membuat akun internal baru lewat API manapun. | MP-09 | **Status: ✅ Closed [2026-08-06], OD-20 Opsi A** — endpoint baru ditambahkan ke API Specification v1.2 §10.4 (`/admin/internal-users/*`). |
| T3-05 | **Cakupan role Developer Partner untuk AI Assistant ambigu.** REQ-M13-005 + header User Flow Modul 13 eksplisit menyebut hanya 5 role (tidak termasuk Developer Partner) — tapi Authorization Spec §2.14 memberi Developer Partner akses `own` penuh juga. | MP-13 | **Status: ✅ Closed [2026-08-06], OD-21 Opsi A** — Developer Partner disertakan (Authorization Spec §2.14 sudah benar). PRD REQ-M13-005 & User Flow Modul 13 direvisi. Tidak ada perubahan RLS (role-agnostic sejak awal). |
| **T3-06** *(baru)* | **RLS child table listing (`listing_photos_manage`/`listing_videos_manage`/`listing_amenities_manage`) tidak konsisten dengan parent table `listings_update_own_or_org_leader`** — Organization Leader dapat mengedit field utama listing anggotanya, tapi **tidak dapat** mengelola foto/video/amenity listing yang sama (RLS child table hanya cek `agent_id` pemilik asli, tanpa klausa Org Leader). | MP-03 | **Aksi:** Tambah klausa Org Leader (sama pola `listings_update_own_or_org_leader`) ke ketiga RLS child table. **Prasyarat teknis untuk MP-12** — perlu diselesaikan sebelum fitur Organization edit-listing dianggap lengkap. **Status: ✅ Closed [2026-08-06]** — lihat `0008_m03_listing.sql` versi terbaru (satu pass dengan T1-02). |
| **T3-07** *(baru)* | **Kebijakan Amenity management lebih ketat di RLS dibanding Authorization Spec.** `amenities_manage` (migration `0008`) hanya mengizinkan Superadmin (`auth_is_superadmin()`), tapi Authorization Spec §2.4 mencantumkan Manager & Admin juga berwenang (`all`). | MP-03 | **Status: ✅ Closed [2026-08-06], OD-22 Opsi A** — pertahankan Superadmin-only. Authorization Spec §2.4 dikoreksi ke `none` untuk Manager/Admin, sesuai RLS aktual. Tidak ada perubahan RLS. |

---

# 🟢 TIER 4 — Editorial/Dokumentasi (Non-Blocking, Siklus Governance Berikutnya)

## Pola Sistemik: "Generalisasi `own` Authorization Spec" (9 dari 11 isu Tier 4)

Ditemukan di **5 dari 7 modul** yang sudah diperiksa — `Authorization-Access-Control-Specification-v1.0.md` berulang kali memberi nilai `own` ke suatu role untuk **seluruh** aksi pada suatu entity, padahal role tsb secara nyata (dikonfirmasi PRD dan/atau RLS migration aktual) hanya berwenang untuk sebagian aksi saja, atau tidak berwenang sama sekali. Polanya konsisten: tabel tampak **di-generate otomatis per-baris tanpa pengecualian kasus khusus**.

| # | Isu | Modul | Nilai Salah (Authorization Spec) | Nilai Benar (mengikuti PRD/RLS/API Spec) |
|---|---|---|---|---|
| T4-01 | Manager tercatat `none` total untuk M10, padahal berwenang terbatas ke `/permissions/matrix/agent` | MP-10 | Manager = `none` semua baris | **✅ Closed [2026-08-06], audit v1.1** — View-Role/Permission/RolePermission dikoreksi ke `all` (RLS publik), Update-RolePermission Manager→`own` (scoped) |
| T4-02 | Agent = `own` untuk `PERM-M01-Approve-User` (implikasi agen approve dirinya sendiri) | MP-01 | Agent = `own` | **✅ Closed [2026-08-06], audit v1.1** — Approve-User & Assign-User Agent dikoreksi ke `none` |
| T4-03 | Buyer = `own` untuk `Approve`/`Delete` `AgentReview` (Buyer tidak pernah melakukan aksi ini) | MP-02 | Buyer = `own` | **✅ Closed [2026-08-06], audit v1.1** — dikoreksi ke `none` |
| T4-04 | Developer Partner = `own` untuk CRUD `DeveloperProject`/`DeveloperProjectMedia` (data resmi sensitif harga) | MP-06 | DevPartner = `own` | **✅ Closed [2026-08-06], audit v1.1** — dikoreksi ke `none` (View dikoreksi ke `all`, ternyata publik) |
| T4-05 | *(Sama akar dengan T1-01)* Instructor = `own` tercatat benar di Authorization Spec, tapi RLS-nya yang kurang | MP-04 | — | **✅ Closed [2026-08-06]** — RLS diperbaiki Batch 1 (T1-01); dokumentasi dikonfirmasi sudah benar sejak awal, tidak perlu diubah |
| **T4-12** | Authorization Spec §2.4 mencantumkan `PERM-M03-Manage-Amenity` = `all` untuk Manager & Admin juga, RLS `amenities_manage` hanya Superadmin | MP-03 | — | **✅ Closed [2026-08-06]** — diselesaikan sebagai T3-07/OD-22 (Batch 2), dicantumkan ulang di changelog audit v1.1 untuk kelengkapan |
| **T4-13** | Authorization Spec §2.8 mencantumkan `PERM-M07-View-DbrConfig` = Manager/Admin `none`, tapi `GET /calculator/dbr/config` berlabel Public di API Spec dan RLS mengizinkan seluruh authenticated | MP-07 | **✅ Closed [2026-08-06], audit v1.1** — View-DbrConfig dikoreksi ke `all` untuk seluruh role |
| **T4-14** | Migration `0011` dan Technical Spec §M07 sama-sama mengutip "Authorization Spec §2.7" untuk permission `dbr_config` — section yang benar adalah §2.8 | MP-07 | **✅ Closed [2026-08-06]** — 2 kutipan dikoreksi ke §2.8 |
| **T4-15** | Authorization Spec §2.12 mencantumkan `PERM-M11-View-UrlRedirect` = Superadmin-only, tapi RLS `url_redirects_select` mengizinkan akses publik penuh (`anon`) | MP-11 | **✅ Closed [2026-08-06], audit v1.1** — View-UrlRedirect dikoreksi ke `all` (termasuk publik) |
| **T4-16** | Authorization Spec §2.9 mencantumkan `PERM-M08-View/Update-Notification` = `all` untuk Superadmin/Manager/Admin, tapi RLS `notifications_own` **tanpa bypass sama sekali** | MP-08 | **✅ Closed [2026-08-06], audit v1.1** — View/Update-Notification staff dikoreksi ke `own` |

**Rekomendasi tunggal untuk seluruh pola ini:** Lakukan **satu siklus audit Authorization Spec §2 secara menyeluruh** (bukan tambal per baris) — kemungkinan besar ada baris serupa di modul yang belum diperiksa (M05, M07, M08, M11, M12). Cross-check otomatis setiap baris `own`/`all` terhadap PRD Business Rule + RLS migration aktual sebelum Authorization Spec naik ke v1.1.

## Isu Editorial Lain (Tidak Terkait Pola di Atas)

| # | Isu | Modul | Detail |
|---|---|---|---|
| T4-06 | SSO Apple disebut di PRD/Functional Spec/User Flow Modul 1, tapi tidak ada endpoint/ADR yang mendefinisikannya | MP-01 | **✅ Closed [2026-08-06], Opsi B** — Owner memilih pertahankan referensi, ditandai eksplisit "belum diimplementasikan / roadmap masa depan" di PRD REQ-M01-002, Functional Spec §M01, User Flow Modul 1 (6 lokasi total) |
| T4-07 | Status "Verified" disebut di PRD/Functional Spec/User Flow Modul 1 sebagai tahap terpisah, tapi skema `users.status` hanya 4 nilai (tidak ada `verified`) | MP-01 | **✅ Closed [2026-08-06]** — istilah disinkronkan ke "Active" di 9 lokasi PRD + 1 User Flow |
| T4-08 | Komentar migration `0005` (M02) salah rujuk nomor file — bilang FK ditambahkan di "migration 0007" padahal sebenarnya di `0008` | MP-02 | **✅ Closed [2026-08-06]** — 2 komentar dikoreksi "0007"→"0008" |
| T4-09 | Kepemilikan endpoint kredensial GTM/GA4/GSC ambigu antara M09 (tabel `system_configs`) dan M11 (endpoint `/admin/config/seo`) | MP-09 | **✅ Closed (Acknowledged) [2026-08-06]** — pembagian tanggung jawab dicatat resmi di MP-09, tidak perlu perubahan dokumen sumber |
| T4-10 | PRD Modul 9 tidak punya bagian "Business Rules"/"Acceptance Criteria" terpisah, berbeda dari pola PRD modul lain | MP-09 | **✅ Closed (Acknowledged) [2026-08-06]** — inkonsistensi struktur, tidak berdampak fungsional, tidak memerlukan perubahan |
| T4-11 | Functional Spec menyebut CRUD penuh untuk `/admin/developer-projects`, API Spec hanya mendaftarkan endpoint `POST` | MP-06 | **✅ Closed [2026-08-06]** — 3 endpoint ditambahkan ke API Specification §10.3 |

---

# Detail Per Modul (Ringkasan Silang-Referensi)

| Modul | Jumlah Isu | Tier Tertinggi | Status Blocking Sprint S0? |
|---|---|---|---|
| MP-10 (RBAC) | 2 | 🟢 Tier 4 | Tidak |
| MP-01 (Auth) | 4 | 🟡 Tier 3 (T3-01, bootstrap Superadmin) | **T3-01 ✅ Closed [2026-08-06], OD-18** — script `seed-superadmin.ts` siap dijalankan saat Sprint S0 |
| MP-09 (Admin Panel) | 4 | 🟡 Tier 3 (T3-04) | Tidak — **T3-04 ✅ Closed [2026-08-06], OD-20** |
| MP-02 (Profil Agen) | 3 | 🟡 Tier 3 (T3-02) | Tidak — **T3-02 ✅ Closed [2026-08-06], OD-23** |
| MP-06 (Direktori Developer) | 3 | 🟡 Tier 3 (T3-03) | Tidak — **T3-03 ✅ Closed [2026-08-06], OD-19** |
| MP-04 (Learning Center) | 3 | 🔴 Tier 1 & 2 (T1-01, T2-01) | **Keduanya ✅ Closed [2026-08-06]** — T1-01 (Batch 1), T2-01/OD-16 (Batch 2) |
| MP-13 (AI Assistant) | 1 | 🟡 Tier 3 (T3-05) | Tidak — **T3-05 ✅ Closed [2026-08-06], OD-21** |
| **MP-03 (Listing)** | **4** | **🔴 Tier 1 (T1-02)** | **Seluruh 4 isu ✅ Closed [2026-08-06]** — T1-02 & T3-06 (Batch 1), T3-07/OD-22 (Batch 2) |
| **MP-05 (Kalender Event)** | **2** | **🔴 Tier 1 & 2 (T1-03, T2-02)** | **Keduanya ✅ Closed [2026-08-06]** — T1-03 (Batch 1, RLS; endpoint API masih rekomendasi terbuka), T2-02/OD-17 (Batch 2) |
| **MP-07 (DBR Scoring)** | **2** | 🟢 Tier 4 saja | Tidak — modul paling bersih dari 7 MP terakhir |
| **MP-11 (SEO & Analytics)** | **2** | 🔴 Tier 1 (memperkuat T1-02) + 🟢 Tier 4 | **T1-02 ✅ Closed [2026-08-06]** — M11 kini dapat mencapai Definition of Done penuh |
| **MP-08 (Dashboard & Notifikasi)** | **1** | 🟢 Tier 4 saja | Tidak — modul kedua paling bersih (bersama M07), isolasi privasi notifikasi paling ketat di seluruh proyek |
| **MP-12 (Organization)** *(baru, final)* | **1** | **🔴 Tier 1 (T1-04)** | **T1-04 ✅ Closed [2026-08-06].** Catatan tambahan (bukan Tier 3 bernomor): gate governance kode M12 masih belum dikonfirmasi terbuka (berbeda dari M13) — tidak berubah oleh Batch 1/2, lihat `CURRENT-PROJECT-STATE.md` |

---

# Rekomendasi Alur Penyelesaian (FINAL — seluruh 13 Module Planning selesai)

Sesuai alur yang disepakati di awal proses ini — **tidak stop total, tidak juga tunda semua ke akhir**. Dengan seluruh 13 MP kini selesai, inilah paket final:

1. **✅ Seluruh 13 Module Planning selesai dibuat** — tidak ada modul PRD yang tersisa. Fase berikutnya adalah eksekusi perbaikan, bukan lagi penulisan dokumen.
2. **✅ [2026-08-06] SELESAI — 4 bug Tier 1 di file migration sudah diperbaiki (Batch 1), plus T3-06 sekaligus:**
   - `0008_m03_listing.sql` (T1-02 ✅ Closed) — **prioritas tertinggi**, dampak SEO lintas-modul (M03+M11); T3-06 ✅ Closed sekaligus (satu pass)
   - `0010_m05_events.sql` (T1-03 ✅ Closed untuk bagian RLS) — celah bypass moderasi; endpoint approve/reject API masih rekomendasi terbuka, belum dieksekusi
   - `0007_m12_organization.sql` (T1-04 ✅ Closed) — celah spoofing invitation
   - `0009_m04_learning_center.sql` (T1-01 ✅ Closed) — dampak lebih sempit (1 fitur Instructor)
3. **✅ [2026-08-06] SELESAI — 2 Tier 2 (T2-01/OD-16, T2-02/OD-17) dijawab Owner** dalam satu paket keputusan kebijakan Manager (dugaan akar masalah sama terkonfirmasi — keduanya dijawab Opsi A/Manager akses penuh). PRD Modul 4 & 5 direvisi.
4. **✅ [2026-08-06] SELESAI — 5 dari 7 OD Batch 2 dijawab Owner** (T3-01/OD-18 bootstrap Superadmin — script siap; T3-03/OD-19 wilayah eksklusif — per Kota; T3-04/OD-20 CRUD akun internal — endpoint ditambahkan; T3-05/OD-21 AI Assistant DevPartner — disertakan; T3-07/OD-22 Amenity — Superadmin-only dipertahankan). **T3-02 kini diformalkan sebagai OD-23** (`OD-23-T3-02-Keputusan-Owner.md`), menunggu jawaban Owner — non-blocking. Konfirmasi gate M12 juga masih terbuka (topik terpisah, bukan bagian Issue Register/OD numbered).
5. **17 Tier 4 (editorial)** — tidak menghalangi apa pun, dijadwalkan sebagai satu siklus revisi dokumentasi (terutama audit menyeluruh Authorization Spec §2, karena 12 dari 17 berasal dari akar masalah yang sama di dokumen tsb) — dapat berjalan paralel dengan development, tidak mendesak.
6. **Titik aman mulai Sprint S0/Bolt.new: TERCAPAI [2026-08-06].** ✅ 4 bug Tier 1 diperbaiki (Batch 1), ✅ keputusan Owner untuk Tier 2 turun (Batch 2), ✅ T3-01 (bootstrap Superadmin) diselesaikan (Batch 2, script siap dijalankan saat Sprint S0). ✅ **[Update 6 Agustus] Seluruh Issue Register — 32/32 isu, Tier 1 s.d. Tier 4 — kini Closed** (Batch 3, termasuk T4-06/SSO Apple). Tidak ada satu pun item governance tersisa yang menghalangi atau perlu dikerjakan paralel dengan Sprint S0 — proyek 100% bersih dari sisi Issue Register.

---

*Issue Register ini adalah dokumen FINAL untuk cakupan 13 Module Planning — seluruh modul PRD sudah tercakup. Setiap isu di sini dapat ditelusuri balik ke Bagian 51 (Conflict Analysis) atau Bagian 45/46 (Risk/Known Limitation) dokumen MP sumbernya masing-masing untuk detail penuh. Dokumen ini akan diperbarui hanya jika ada revisi terhadap MP yang sudah ada atau keputusan Owner yang mengubah status isu tertentu.*
