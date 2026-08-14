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

| Tier | Jumlah Isu | Sifat | Kapan Wajib Diselesaikan |
|---|---|---|---|
| **🔴 Tier 1 — Bug Kode Nyata** | **4** | Migration SQL sudah ditulis salah, bukan sekadar dokumentasi | **Sebelum eksekusi migration ke Sprint S0** |
| **🔴 Tier 2 — Kontradiksi Bisnis Blocking** | **2** | PRD bertentangan dengan dirinya sendiri, menentukan perilaku RBAC | **Sebelum coding modul terkait dimulai** |
| **🟡 Tier 3 — Keputusan Penting, Non-Blocking Modul Lain** | **9** | Gap fungsional/keamanan yang perlu keputusan Owner, tapi tidak menghalangi modul lain dibangun | **Sebelum modul terkait dianggap selesai (DoD)** |
| **🟢 Tier 4 — Editorial/Dokumentasi** | **17** | Tidak berdampak ke perilaku sistem — implementasi sudah tahu harus ikut sumber mana | **Siklus governance berikutnya, tidak mendesak** |
| **Total** | **32 isu unik** | — | — |

**✅ Catatan positif:** MP-07 (DBR Scoring) dan MP-08 (Dashboard) adalah **2 modul tanpa temuan Tier 1/2/3 baru** — bukti bahwa tidak seluruh migration bermasalah; temuan Tier 1 adalah pengecualian nyata di 4 dari 13 modul, bukan pola menyeluruh.

**⚠️ T1-02 dikonfirmasi oleh 4 sumber independen (MP-03 + MP-11).** PRD Modul 3, PRD Modul 11, Functional Spec, dan SEO Spec seluruhnya menegaskan listing `sold`/`rented` wajib tetap terindeks — RLS yang memblokirnya adalah bug paling mendesak diperbaiki karena berdampak ke 2 modul sekaligus (M03 dan M11 sama-sama tidak dapat mencapai DoD tanpanya).

**Pola berulang paling signifikan (generalisasi Authorization Spec):** **12 dari 32 isu** berasal dari **satu akar masalah yang sama** — `Authorization-Access-Control-Specification-v1.0.md` tampak memberi scope `own`/`all` secara generik ke suatu role tanpa mengecualikan kasus per-aksi, ditemukan di **7 dari 13 modul** (MP-10, MP-01, MP-02, MP-06, MP-13, MP-03, MP-05, MP-07, MP-11, MP-08). Ini bukan 12 masalah terpisah — ini **satu masalah sistemik** di satu dokumen sumber, direkomendasikan diaudit menyeluruh sekali di siklus governance berikutnya (bukan ditambal per baris).

**Pola kedua — kontradiksi internal PRD soal Manager:** **T2-01 (MP-04) dan T2-02 (MP-05)** sama-sama kontradiksi Business Rule vs Acceptance Criteria soal cakupan akses Manager — kemungkinan berasal dari kebijakan yang sama yang belum konsisten diterapkan ke seluruh modul saat retrofit REQ-XXX. Direkomendasikan diselesaikan **sekali** untuk kedua modul sekaligus.

---

# 🔴 TIER 1 — Bug Kode Migration Nyata (Wajib Diperbaiki Sebelum Sprint S0)

| # | Isu | Modul | File Terdampak | Detail |
|---|---|---|---|---|
| T1-01 | RLS `quiz_questions_manage`/`quiz_options_manage` tidak punya klausa ownership (`created_by` via join ke `courses`) — padahal `courses_manage_own`/`course_lessons_manage`/`quizzes_manage` di file yang sama sudah benar menerapkannya. Akibatnya **Instructor tidak bisa kelola bank soal kursus miliknya sendiri**, padahal PRD + Authorization Spec + User Flow tiga-tiganya sepakat ini seharusnya `own`. | MP-04 | `0009_m04_learning_center.sql` | **Aksi:** Tambah klausa `EXISTS (SELECT 1 FROM quizzes qz JOIN courses c ON c.id=qz.course_id WHERE qz.id=quiz_questions.quiz_id AND c.created_by=auth.uid())` (pola sama `quizzes_manage`) ke kedua policy. Sertakan juga `enrollments_own`/`quiz_attempts_own` — Instructor perlu melihat progress peserta kursusnya (gap terkait, MP-04 Konflik #3). |
| **T1-02** *(diperkuat MP-11)* | **RLS `listings_select_public` hanya mengizinkan `status='published'` untuk akses publik** — listing `sold`/`rented` menjadi **tidak dapat diakses sama sekali** oleh publik (404/kosong). Bertentangan langsung dengan **4 sumber independen**: `SEO-Analytics-Specification-v1.1.md` §1.4, Functional Spec §4.3, **PRD Modul 3 Business Rule**, dan **PRD Modul 11 Business Rule poin 3** (baru, dikonfirmasi MP-11) — seluruhnya menegaskan halaman `sold`/`rented` wajib tetap terindeks. | MP-03, diperkuat MP-11 | `0008_m03_listing.sql` | **Aksi:** Ubah `listings_select_public` menjadi `USING (status IN ('published','sold','rented') AND deleted_at IS NULL)`. Status `expired` mengikuti kebijakan noindex-tapi-tetap-akses terpisah. **Catatan MP-11:** M11 sendiri tidak dapat mencapai Definition of Done tanpa perbaikan ini — prasyarat lintas-modul. |
| **T1-03** *(baru)* | **RLS `events_manage` (`FOR ALL`) mengizinkan `submitted_by=auth.uid()` mengubah kolom `status` tanpa batasan** — Developer Partner secara teknis dapat **mem-publish event miliknya sendiri** (`status:'published'`) tanpa melalui approval Admin, langsung via update biasa. Diperkuat oleh Authorization Spec §2.6 yang juga (keliru) memberi `PERM-M05-Approve-Event`=`own` ke DevPartner — **dua sumber independen sama-sama permisif**, bukan hanya dokumentasi yang salah sementara RLS tetap ketat (pola berbeda dari mayoritas isu lain). Tidak ada endpoint approve/reject terpisah di API Spec yang bisa jadi titik enforcement alternatif. | MP-05 | `0010_m05_events.sql` | **Aksi:** Pisahkan `events_manage` — submitter hanya boleh INSERT/UPDATE non-`status` (atau `status` terbatas `pending_approval`/`cancelled` milik sendiri); transisi ke `published`/`rejected` eksklusif `auth_has_scope_all`. Tambahkan endpoint approve/reject eksplisit ke API Specification. |
| **T1-04** *(baru, final)* | **RLS `org_invitations_insert` (migration `0007`) tidak memverifikasi bahwa `leader_id` yang diklaim benar-benar Leader aktif dari `organization_id` terkait** — `WITH CHECK (agent_id=auth.uid() OR leader_id=auth.uid())` mengizinkan **siapa pun** authenticated user mengklaim dirinya `leader_id` untuk Organization manapun saat insert baris `leader_invite`, tanpa pernah benar-benar menjadi Leader Organization tsb. | MP-12 | `0007_m12_organization.sql` | **Aksi:** Ubah `WITH CHECK` menjadi kondisional per `initiated_by_type` — untuk `leader_invite`, tambahkan `EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id=organization_invitations.organization_id AND om.agent_id=auth.uid() AND om.role='leader' AND om.status='active')`. Dampak: spoofing undangan palsu atas nama Organization (social engineering), bukan kebocoran data langsung. |

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
| T2-01 | **PRD Modul 4 bertentangan dengan dirinya sendiri**: Business Rule menyatakan *"role Manager memiliki akses Full (mengikuti hak Admin secara global)"* untuk kelola konten Learning Center — tapi Acceptance Criteria di dokumen **yang sama** menyatakan *"Manager dan Agen tidak dapat mengakses menu kelola konten ini."* | MP-04 | `PRD-RUMAHAGEN-v1.2.md` Modul 4 | **Tidak dapat diresolusikan otomatis** — kedua bagian sama-sama PRD, tidak ada dasar prioritas untuk memilih salah satu. **Wajib keputusan eksplisit Owner**: apakah Manager melihat menu "Kelola Kursus" atau tidak. Menentukan langsung desain RBAC layar SCR-M04-05. |
| **T2-02** *(baru)* | **PRD Modul 5 bertentangan dengan dirinya sendiri**, pola identik T2-01: Business Rule menyatakan *"Superadmin, Manager, dan Admin dapat membuat & mempublikasikan event secara langsung tanpa approval tambahan"* — tapi Acceptance Criteria menyatakan *"Manager dan Developer Partner hanya dapat mengajukan event yang memerlukan approval."* | MP-05 | `PRD-RUMAHAGEN-v1.2.md` Modul 5 | **Tidak dapat diresolusikan otomatis.** **Wajib keputusan eksplisit Owner** — direkomendasikan diselesaikan **bersamaan** dengan T2-01 karena kemungkinan besar berasal dari kebijakan cakupan Manager yang sama, belum konsisten diterapkan saat retrofit REQ-XXX ke seluruh modul. |

---

# 🟡 TIER 3 — Keputusan Penting, Tidak Menghalangi Modul Lain

| # | Isu | Modul | Detail |
|---|---|---|---|
| T3-01 | **Bootstrap akun Superadmin pertama tidak terdokumentasi di mana pun.** Tidak ada seed data user di migration manapun, tapi approval registrasi agen butuh Superadmin yang sudah eksis — *chicken-and-egg problem*. | MP-01 | **Aksi:** Owner perlu memutuskan mekanisme (mis. seed manual via SQL langsung ke Supabase sekali di awal, di luar alur registrasi aplikasi normal). **Wajib selesai sebelum Sprint S0 dianggap tuntas** — tanpa ini, tidak ada yang bisa approve agen pertama di seluruh sistem. |
| T3-02 | **Bukti interaksi/lead sebelum submit review agen tidak ditegakkan.** PRD & Entity Mapping menyatakan Buyer harus "pernah memberikan lead/inquiry" sebelum bisa review — tapi RLS `agent_reviews_insert_buyer` hanya cek role `buyer`, tidak cek `listing_lead_id` (kolom NULLABLE, tidak divalidasi). | MP-02 | **Aksi:** Owner putuskan — tambah validasi di service layer (tanpa ubah skema), atau resmi revisi Business Rule PRD agar sesuai skema yang sudah Baseline. Berdampak ke kredibilitas fitur trust-signal platform jika dibiarkan. |
| T3-03 | **Definisi cakupan "wilayah eksklusif" proyek developer tidak ada.** Field `is_exclusive_by_region` (boolean) ada di skema, User Flow M06 sudah mengasumsikan fitur "notifikasi tidak tersedia jika sudah diklaim agen lain di wilayah yang sama" — tapi tidak ada field/logic yang mendefinisikan cakupan wilayahnya. | MP-06 | **Aksi:** Keputusan bisnis murni (bukan teknis) — sudah tercatat sejak `AI-CONTEXT-PACK` sebagai Open Decision. Fitur non-eksklusif (default) bisa jalan duluan tanpa menunggu ini. |
| T3-04 | **REQ-M09-001 (kelola akun Admin/Manager/Instructor baru) tidak punya endpoint API sama sekali** — hanya ada `/admin/agents/*` (approval agen existing, M01) dan `/admin/users/{id}/role` (ubah role user existing, M10). Tidak ada cara membuat akun internal baru lewat API manapun. | MP-09 | **Aksi:** Owner putuskan — apakah CRUD akun internal generik memang dibutuhkan Fase 1 (perlu tambah endpoint baru ke API Specification), atau akun internal cukup dibuat manual/lewat mekanisme lain di luar cakupan modul ini. |
| T3-05 | **Cakupan role Developer Partner untuk AI Assistant ambigu.** REQ-M13-005 + header User Flow Modul 13 eksplisit menyebut hanya 5 role (tidak termasuk Developer Partner) — tapi Authorization Spec §2.14 memberi Developer Partner akses `own` penuh juga. | MP-13 | **Aksi:** Klarifikasi Owner — apakah Developer Partner memang sengaja disertakan (Authorization Spec benar) atau sengaja dikecualikan (perlu tambahan RLS exclusion). Non-blocking untuk 5 role inti yang disepakati semua sumber. |
| **T3-06** *(baru)* | **RLS child table listing (`listing_photos_manage`/`listing_videos_manage`/`listing_amenities_manage`) tidak konsisten dengan parent table `listings_update_own_or_org_leader`** — Organization Leader dapat mengedit field utama listing anggotanya, tapi **tidak dapat** mengelola foto/video/amenity listing yang sama (RLS child table hanya cek `agent_id` pemilik asli, tanpa klausa Org Leader). | MP-03 | **Aksi:** Tambah klausa Org Leader (sama pola `listings_update_own_or_org_leader`) ke ketiga RLS child table. **Prasyarat teknis untuk MP-12** — perlu diselesaikan sebelum fitur Organization edit-listing dianggap lengkap. |
| **T3-07** *(baru)* | **Kebijakan Amenity management lebih ketat di RLS dibanding Authorization Spec.** `amenities_manage` (migration `0008`) hanya mengizinkan Superadmin (`auth_is_superadmin()`), tapi Authorization Spec §2.4 mencantumkan Manager & Admin juga berwenang (`all`). | MP-03 | **Aksi:** Klarifikasi Owner — pertahankan RLS ketat saat ini (rekomendasi default, lebih aman karena amenity adalah master data lintas seluruh listing) atau longgarkan sesuai Authorization Spec jika ada kebutuhan operasional. |

---

# 🟢 TIER 4 — Editorial/Dokumentasi (Non-Blocking, Siklus Governance Berikutnya)

## Pola Sistemik: "Generalisasi `own` Authorization Spec" (9 dari 11 isu Tier 4)

Ditemukan di **5 dari 7 modul** yang sudah diperiksa — `Authorization-Access-Control-Specification-v1.0.md` berulang kali memberi nilai `own` ke suatu role untuk **seluruh** aksi pada suatu entity, padahal role tsb secara nyata (dikonfirmasi PRD dan/atau RLS migration aktual) hanya berwenang untuk sebagian aksi saja, atau tidak berwenang sama sekali. Polanya konsisten: tabel tampak **di-generate otomatis per-baris tanpa pengecualian kasus khusus**.

| # | Isu | Modul | Nilai Salah (Authorization Spec) | Nilai Benar (mengikuti PRD/RLS/API Spec) |
|---|---|---|---|---|
| T4-01 | Manager tercatat `none` total untuk M10, padahal berwenang terbatas ke `/permissions/matrix/agent` | MP-10 | Manager = `none` semua baris | Manager = akses terbatas subset Agen (PRD + API Spec) |
| T4-02 | Agent = `own` untuk `PERM-M01-Approve-User` (implikasi agen approve dirinya sendiri) | MP-01 | Agent = `own` | Agent = tidak punya akses approve (PRD Business Rule + API Spec) |
| T4-03 | Buyer = `own` untuk `Approve`/`Delete` `AgentReview` (Buyer tidak pernah melakukan aksi ini) | MP-02 | Buyer = `own` | Buyer = tidak relevan (tidak ada endpoint delete review sama sekali) |
| T4-04 | Developer Partner = `own` untuk CRUD `DeveloperProject`/`DeveloperProjectMedia` (data resmi sensitif harga) | MP-06 | DevPartner = `own` | DevPartner = `none` (PRD Business Rule "hanya admin" + RLS + API Spec, 3-lawan-1) |
| T4-05 | *(Sama akar dengan T1-01)* Instructor = `own` tercatat benar di Authorization Spec, tapi RLS-nya yang kurang — dicatat di sini sebagai sisi dokumentasi vs kode | MP-04 | — (dokumentasi sudah benar, kode yang salah — lihat T1-01) | — |
| **T4-12** *(baru, arah terbalik)* | Authorization Spec §2.4 mencantumkan `PERM-M03-Manage-Amenity` = `all` untuk Manager & Admin juga, RLS `amenities_manage` hanya Superadmin | MP-03 | — (sudah dicatat penuh sebagai T3-07 di atas, karena butuh keputusan Owner — bukan editorial murni) | — |
| **T4-13** *(baru)* | Authorization Spec §2.8 mencantumkan `PERM-M07-View-DbrConfig` = Manager/Admin `none`, tapi `GET /calculator/dbr/config` berlabel Public di API Spec dan RLS mengizinkan seluruh authenticated | MP-07 | Non-blocking — data bukan sensitif (parameter kalkulasi umum, bukan PII); Authorization Spec §2.8 baris View perlu diperjelas jadi `all` untuk seluruh role |
| **T4-14** *(baru)* | Migration `0011` dan Technical Spec §M07 sama-sama mengutip "Authorization Spec §2.7" untuk permission `dbr_config` — section yang benar adalah §2.8 (§2.7 adalah Modul 6) | MP-07 | Kesalahan kutipan section, tidak memengaruhi fungsi RLS yang sudah benar — housekeeping ringan |
| **T4-15** *(baru)* | Authorization Spec §2.12 mencantumkan `PERM-M11-View-UrlRedirect` = Superadmin-only, tapi RLS `url_redirects_select` mengizinkan akses publik penuh (`anon`) — **memang diperlukan** agar middleware redirect dapat melayani semua pengunjung tanpa login | MP-11 | Non-blocking, pola sama T4-13 — data tidak sensitif, akses publik memang fungsional wajib. Authorization Spec §2.12 perlu diperjelas (View=`all`, hanya Manage=Superadmin-only) |
| **T4-16** *(baru, arah "lebih aman")* | Authorization Spec §2.9 mencantumkan `PERM-M08-View/Update-Notification` = `all` untuk Superadmin/Manager/Admin, tapi RLS `notifications_own` **tanpa bypass sama sekali** untuk siapa pun — bahkan Superadmin tidak bisa lihat notifikasi user lain | MP-08 | **Non-blocking, arah aman** — RLS lebih protektif dan justru **sesuai** REQ-M08-005 (larangan eksplisit kebocoran lintas-scope). Wajib ditegaskan ke tim implementasi agar tidak salah ikut Authorization Spec secara harfiah untuk entity ini |

**Rekomendasi tunggal untuk seluruh pola ini:** Lakukan **satu siklus audit Authorization Spec §2 secara menyeluruh** (bukan tambal per baris) — kemungkinan besar ada baris serupa di modul yang belum diperiksa (M05, M07, M08, M11, M12). Cross-check otomatis setiap baris `own`/`all` terhadap PRD Business Rule + RLS migration aktual sebelum Authorization Spec naik ke v1.1.

## Isu Editorial Lain (Tidak Terkait Pola di Atas)

| # | Isu | Modul | Detail |
|---|---|---|---|
| T4-06 | SSO Apple disebut di PRD/Functional Spec/User Flow Modul 1, tapi tidak ada endpoint/ADR yang mendefinisikannya | MP-01 | Rekomendasi: hapus dari 3 dokumen tsb pada revisi berikutnya, atau buat spesifikasi teknis baru jika memang dibutuhkan |
| T4-07 | Status "Verified" disebut di PRD/Functional Spec/User Flow Modul 1 sebagai tahap terpisah, tapi skema `users.status` hanya 4 nilai (tidak ada `verified`) | MP-01 | Operasional: "Verified" = "Active". Rekomendasi sinkronkan istilah di 3 dokumen tsb |
| T4-08 | Komentar migration `0005` (M02) salah rujuk nomor file — bilang FK ditambahkan di "migration 0007" padahal sebenarnya di `0008` | MP-02 | Housekeeping ringan, tidak memengaruhi fungsi SQL |
| T4-09 | Kepemilikan endpoint kredensial GTM/GA4/GSC ambigu antara M09 (tabel `system_configs`) dan M11 (endpoint `/admin/config/seo`) | MP-09 | Sudah ada resolusi kerja (tabel di M09, endpoint tanggung jawab M11) — perlu diperjelas di Functional Spec §4.9 |
| T4-10 | PRD Modul 9 tidak punya bagian "Business Rules"/"Acceptance Criteria" terpisah, berbeda dari pola PRD modul lain | MP-09 | Inkonsistensi struktur internal PRD, bukan lintas dokumen — Acceptance Criteria MP-09 disintesis dari bagian lain |
| T4-11 | Functional Spec menyebut CRUD penuh untuk `/admin/developer-projects`, API Spec hanya mendaftarkan endpoint `POST` | MP-06 | Perlu tambah endpoint GET-list/PUT/DELETE eksplisit ke API Specification |

---

# Detail Per Modul (Ringkasan Silang-Referensi)

| Modul | Jumlah Isu | Tier Tertinggi | Status Blocking Sprint S0? |
|---|---|---|---|
| MP-10 (RBAC) | 2 | 🟢 Tier 4 | Tidak |
| MP-01 (Auth) | 4 | 🟡 Tier 3 (T3-01, bootstrap Superadmin) | **Ya** — T3-01 wajib selesai sebelum Sprint S0 dianggap tuntas |
| MP-09 (Admin Panel) | 4 | 🟡 Tier 3 (T3-04) | Tidak |
| MP-02 (Profil Agen) | 3 | 🟡 Tier 3 (T3-02) | Tidak |
| MP-06 (Direktori Developer) | 3 | 🟡 Tier 3 (T3-03) | Tidak |
| MP-04 (Learning Center) | 3 | 🔴 Tier 1 & 2 (T1-01, T2-01) | Tidak langsung, tapi wajib selesai sebelum modul M04 masuk Definition of Done |
| MP-13 (AI Assistant) | 1 | 🟡 Tier 3 (T3-05) | Tidak |
| **MP-03 (Listing)** | **4** | **🔴 Tier 1 (T1-02)** | **Tidak langsung ke Sprint S0, tapi T1-02 wajib selesai sebelum M03 masuk Definition of Done — dampak bisnis tertinggi sejauh ini (SEO)** |
| **MP-05 (Kalender Event)** | **2** | **🔴 Tier 1 & 2 (T1-03, T2-02)** | **Tidak langsung ke Sprint S0, tapi T1-03 wajib selesai sebelum M05 masuk Definition of Done — celah keamanan bypass moderasi** |
| **MP-07 (DBR Scoring)** | **2** | 🟢 Tier 4 saja | Tidak — modul paling bersih dari 7 MP terakhir |
| **MP-11 (SEO & Analytics)** | **2** | 🔴 Tier 1 (memperkuat T1-02) + 🟢 Tier 4 | Tidak langsung, tapi **memperkuat urgensi T1-02** — M11 sendiri tidak bisa selesai tanpa perbaikan tsb |
| **MP-08 (Dashboard & Notifikasi)** | **1** | 🟢 Tier 4 saja | Tidak — modul kedua paling bersih (bersama M07), isolasi privasi notifikasi paling ketat di seluruh proyek |
| **MP-12 (Organization)** *(baru, final)* | **1** | **🔴 Tier 1 (T1-04)** | **Tidak langsung ke Sprint S0, tapi T1-04 wajib selesai sebelum M12 masuk Definition of Done. Catatan tambahan: gate governance kode M12 belum dikonfirmasi terbuka (berbeda dari M13) — lihat `CURRENT-PROJECT-STATE.md`** |

---

# Rekomendasi Alur Penyelesaian (FINAL — seluruh 13 Module Planning selesai)

Sesuai alur yang disepakati di awal proses ini — **tidak stop total, tidak juga tunda semua ke akhir**. Dengan seluruh 13 MP kini selesai, inilah paket final:

1. **✅ Seluruh 13 Module Planning selesai dibuat** — tidak ada modul PRD yang tersisa. Fase berikutnya adalah eksekusi perbaikan, bukan lagi penulisan dokumen.
2. **Perbaiki 4 bug Tier 1 di file migration terlebih dahulu** — seluruhnya independen satu sama lain, dapat dikerjakan paralel/sekaligus sebelum Sprint S0:
   - `0008_m03_listing.sql` (T1-02) — **prioritas tertinggi**, dampak SEO lintas-modul (M03+M11)
   - `0010_m05_events.sql` (T1-03) — prioritas tinggi, celah bypass moderasi
   - `0007_m12_organization.sql` (T1-04) — celah spoofing invitation
   - `0009_m04_learning_center.sql` (T1-01) — dampak lebih sempit (1 fitur Instructor)
3. **Bawa 2 Tier 2 (T2-01, T2-02) ke Owner sebagai satu paket keputusan kebijakan Manager** — kemungkinan besar satu keputusan menyelesaikan keduanya sekaligus, karena akar masalahnya sama (cakupan akses Manager belum konsisten di retrofit REQ-XXX PRD Modul 4 & 5).
4. **Bawa 9 Tier 3 ke Owner sebagai satu paket keputusan operasional/bisnis** — termasuk bootstrap Superadmin pertama (T3-01, **wajib selesai sebelum Sprint S0** karena tanpa ini tidak ada yang bisa approve agen pertama), definisi eksklusivitas wilayah developer (T3-03), gap CRUD akun internal (T3-04), dan konfirmasi gate M12 (belum terbuka, berbeda dari M13 yang sudah dikonfirmasi Owner).
5. **17 Tier 4 (editorial)** — tidak menghalangi apa pun, dijadwalkan sebagai satu siklus revisi dokumentasi (terutama audit menyeluruh Authorization Spec §2, karena 12 dari 17 berasal dari akar masalah yang sama di dokumen tsb) — dapat berjalan paralel dengan development, tidak mendesak.
6. **Titik aman mulai Sprint S0/Bolt.new**: setelah (a) 4 bug Tier 1 diperbaiki, (b) keputusan Owner untuk Tier 2 dan T3-01 turun. Tier 3 lain dan seluruh Tier 4 **tidak** perlu selesai lebih dulu — dapat berjalan paralel dengan development modul terkait, sesuai prinsip masing-masing MP yang sudah menandai mana yang blocking DoD modul spesifik vs mana yang murni backlog governance.

---

*Issue Register ini adalah dokumen FINAL untuk cakupan 13 Module Planning — seluruh modul PRD sudah tercakup. Setiap isu di sini dapat ditelusuri balik ke Bagian 51 (Conflict Analysis) atau Bagian 45/46 (Risk/Known Limitation) dokumen MP sumbernya masing-masing untuk detail penuh. Dokumen ini akan diperbarui hanya jika ada revisi terhadap MP yang sudah ada atau keputusan Owner yang mengubah status isu tertentu.*
